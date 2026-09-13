import type { IncomingMessage, ServerResponse } from 'node:http';
import { once } from 'node:events';

const endpoint = 'https://api.narilabs.com/v1/audio/speech';
const model = 'qwen3-tts-fast:free';
const maxAudioBytes = 24_000 * 2 * 60;
type Options = { apiKey?: string; voice?: string; fetch?: typeof fetch; timeoutMs?: number };

/** Same-origin streaming gateway. The provider key and cache never reach client code. */
export function createSpeechHandler(options: Options) {
  const fetchSpeech = options.fetch ?? fetch;
  const cache = new Map<string, Buffer>();
  let cachedBytes = 0;
  let active = 0;
  let unavailableUntil = 0;
  const requests = new Map<string, { count: number; until: number }>();

  return async function speech(req: IncomingMessage, res: ServerResponse) {
    const json = (status: number, error: string) => {
      if (res.destroyed || res.writableEnded) return;
      res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      res.end(JSON.stringify({ error }));
    };
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      json(405, 'Use POST for speech.');
      return;
    }
    if (!options.apiKey) {
      json(503, 'Device voice available.');
      return;
    }
    try {
      if (req.headers.origin && new URL(req.headers.origin).host !== req.headers.host) {
        json(403, 'Use the game to request speech.');
        return;
      }
    } catch {
      json(403, 'Invalid origin.');
      return;
    }
    if (!req.headers['content-type']?.toLowerCase().startsWith('application/json')) {
      json(415, 'Send JSON.');
      return;
    }
    if (Number(req.headers['content-length']) > 4096) {
      json(413, 'Text is too long.');
      return;
    }
    let input: string;
    try {
      let size = 0;
      const chunks: Buffer[] = [];
      for await (const chunk of req) {
        size += chunk.length;
        if (size > 4096) {
          json(413, 'Text is too long.');
          return;
        }
        chunks.push(Buffer.from(chunk));
      }
      const body: unknown = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      if (
        !body ||
        typeof body !== 'object' ||
        !('input' in body) ||
        typeof body.input !== 'string'
      ) {
        json(400, 'Speech needs some text.');
        return;
      }
      input = body.input.trim();
      if (!input || input.length > 600) {
        json(400, 'Use between 1 and 600 characters.');
        return;
      }
    } catch {
      json(400, 'Invalid speech request.');
      return;
    }
    if (res.destroyed) return;
    const headers = {
      'Content-Type': 'audio/pcm',
      'X-Audio-Sample-Rate': '24000',
      'Cache-Control': 'no-store',
      'X-Accel-Buffering': 'no',
      'X-Content-Type-Options': 'nosniff',
    };
    const cached = cache.get(input);
    if (cached) {
      cache.delete(input);
      cache.set(input, cached);
      res.writeHead(200, { ...headers, 'X-Speech-Cache': 'hit' });
      res.end(cached);
      return;
    }
    const now = Date.now();
    if (now < unavailableUntil) {
      json(503, 'Device voice available.');
      return;
    }
    const address = req.socket.remoteAddress ?? 'local';
    for (const [key, value] of requests) if (value.until <= now) requests.delete(key);
    const limit = requests.get(address) ?? { count: 0, until: now + 60_000 };
    if (limit.count >= 20 || active >= 2 || requests.size >= 1000) {
      res.setHeader('Retry-After', '60');
      json(429, 'Try the device voice for now.');
      return;
    }
    limit.count++;
    requests.set(address, limit);
    const controller = new AbortController();
    const disconnect = () => controller.abort();
    res.once('close', disconnect);
    const timeout = setTimeout(disconnect, options.timeoutMs ?? 20_000);
    let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
    active++;
    try {
      const upstream = await fetchSpeech(endpoint, {
        method: 'POST',
        headers: { Authorization: `Bearer ${options.apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          voice: options.voice ?? 'phoebe',
          language: 'en',
          input,
          stream: true,
          response_format: 'pcm',
        }),
        signal: controller.signal,
      });
      if (
        !upstream.ok ||
        !upstream.body ||
        !upstream.headers.get('content-type')?.startsWith('audio/pcm')
      ) {
        await upstream.body?.cancel();
        unavailableUntil = Date.now() + 60_000;
        // Never forward provider errors, authorization headers, or diagnostics.
        json(503, 'Device voice available.');
        return;
      }
      reader = upstream.body.getReader();
      let bytes = 0;
      const chunks: Buffer[] = [];
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (!value.byteLength) continue;
        bytes += value.byteLength;
        if (bytes > maxAudioBytes) throw new Error('Audio too large');
        if (!res.headersSent) res.writeHead(200, { ...headers, 'X-Speech-Cache': 'miss' });
        const chunk = Buffer.from(value);
        chunks.push(chunk);
        if (!res.write(chunk)) await once(res, 'drain', { signal: controller.signal });
      }
      if (!bytes || bytes % 2) throw new Error('Incomplete PCM');
      if (controller.signal.aborted) return;
      const audio = Buffer.concat(chunks);
      while (cache.size >= 64 || cachedBytes + audio.length > 8 * 1024 * 1024) {
        const oldest = cache.keys().next().value;
        if (oldest === undefined) break;
        cachedBytes -= cache.get(oldest)!.length;
        cache.delete(oldest);
      }
      // Concurrent identical requests may complete before either is cached.
      cachedBytes -= cache.get(input)?.length ?? 0;
      cache.set(input, audio);
      cachedBytes += audio.length;
      res.end();
    } catch {
      if (!controller.signal.aborted) unavailableUntil = Date.now() + 60_000;
      if (res.headersSent) res.destroy();
      else json(503, 'Device voice available.');
    } finally {
      clearTimeout(timeout);
      res.off('close', disconnect);
      controller.abort();
      await reader?.cancel().catch(() => {});
      reader?.releaseLock();
      active--;
    }
  };
}
