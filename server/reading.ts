import type { EventEmitter } from 'node:events';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Duplex } from 'node:stream';
import WebSocket, { WebSocketServer } from 'ws';

const defaultEndpoint = 'wss://api.narilabs.com/v1/realtime?intent=transcription';
const session = { model: 'qwen3-asr-fast:free', language: 'en', turn_detection: null };
const maxReadingBytes = 16_000 * 2 * 100;
// The provider caps one utterance at 36 seconds, so batch audio commits every 30 seconds.
const utteranceBytes = 16_000 * 2 * 30;
const appendBytes = 64_000;

/** Narrow, same-origin microphone gateway; no recordings or provider diagnostics retained. */
export function attachReadingRecognition(
  server: EventEmitter,
  options: { apiKey?: string; endpoint?: string },
) {
  const sockets = new WebSocketServer({ noServer: true, maxPayload: 8192 });
  const attempts = new Map<string, { count: number; until: number }>();
  server.on('upgrade', (request: IncomingMessage, socket: Duplex, head: Buffer) => {
    if (request.url?.split('?')[0] !== '/api/reading/listen') return;
    const reject = () => socket.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n');
    try {
      if (
        !options.apiKey ||
        !request.headers.origin ||
        new URL(request.headers.origin).host !== request.headers.host ||
        sockets.clients.size >= 2
      ) {
        reject();
        return;
      }
    } catch {
      reject();
      return;
    }
    const now = Date.now();
    for (const [ip, attempt] of attempts) if (attempt.until <= now) attempts.delete(ip);
    const address = request.socket.remoteAddress ?? 'local';
    const attempt = attempts.get(address) ?? { count: 0, until: now + 60_000 };
    if (attempt.count >= 10 || attempts.size > 1000) {
      reject();
      return;
    }
    attempts.set(address, { ...attempt, count: attempt.count + 1 });
    sockets.handleUpgrade(request, socket, head, (client) => sockets.emit('connection', client));
  });
  sockets.on('connection', (client) => {
    const upstream = new WebSocket(options.endpoint ?? defaultEndpoint, {
      headers: { Authorization: `Bearer ${options.apiKey}` },
      handshakeTimeout: 10_000,
      maxPayload: 128 * 1024,
    });
    let configured = false,
      bytes = 0;
    const send = (value: unknown) => {
      if (client.readyState === WebSocket.OPEN) client.send(JSON.stringify(value));
    };
    const unavailable = () => {
      send({ type: 'unavailable' });
      client.close();
    };
    const timeout = setTimeout(unavailable, 120_000);
    upstream.on('open', () =>
      upstream.send(JSON.stringify({ type: 'session.configure', session })),
    );
    upstream.on('message', (raw) => {
      try {
        const event = JSON.parse(raw.toString());
        if (event.type === 'session.configured') {
          configured = true;
          send({ type: 'ready' });
        } else if (
          ['transcript.partial', 'transcript.completed'].includes(event.type) &&
          typeof event.transcript === 'string'
        )
          send({
            type: event.type === 'transcript.partial' ? 'partial' : 'complete',
            text: event.transcript.slice(0, 4000),
            itemId: String(event.item_id).slice(0, 100),
          });
        else if (event.type === 'input_audio_buffer.commit_empty') send({ type: 'empty' });
        else if (event.type === 'error') unavailable();
      } catch {
        unavailable();
      }
    });
    client.on('message', (raw, binary) => {
      if (!configured || upstream.readyState !== WebSocket.OPEN) return;
      if (upstream.bufferedAmount > 128 * 1024) {
        unavailable();
        return;
      }
      if (binary) {
        const audio = Buffer.from(raw as Buffer);
        bytes += audio.length;
        if (!audio.length || audio.length % 2 || bytes > maxReadingBytes) {
          unavailable();
          return;
        }
        upstream.send(
          JSON.stringify({ type: 'input_audio_buffer.append', audio: audio.toString('base64') }),
        );
      } else if (raw.toString() === 'finish')
        upstream.send(JSON.stringify({ type: 'input_audio_buffer.commit' }));
      else unavailable();
    });
    upstream.on('error', unavailable);
    upstream.on('close', () => {
      if (client.readyState === WebSocket.OPEN) client.close();
    });
    client.on('error', () => client.close());
    client.on('close', () => {
      clearTimeout(timeout);
      if (upstream.readyState === WebSocket.CONNECTING) upstream.terminate();
      else upstream.close();
    });
  });
  server.on('close', () => {
    for (const client of sockets.clients) client.terminate();
    sockets.close();
  });
}

/** Transcribes a finished PCM16 recording through the provider's realtime socket. */
export function transcribeReading(
  audio: Buffer,
  options: { apiKey: string; endpoint?: string; timeoutMs?: number; signal?: AbortSignal },
) {
  return new Promise<string>((resolve, reject) => {
    const upstream = new WebSocket(options.endpoint ?? defaultEndpoint, {
      headers: { Authorization: `Bearer ${options.apiKey}` },
      handshakeTimeout: 10_000,
      maxPayload: 128 * 1024,
    });
    const texts: string[] = [];
    let offset = 0,
      settled = false;
    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      options.signal?.removeEventListener('abort', abort);
      if (upstream.readyState === WebSocket.CONNECTING) upstream.terminate();
      else upstream.close();
      if (error) reject(error);
      else resolve(texts.join(' ').trim().slice(0, 4000));
    };
    const abort = () => finish(new Error('Canceled'));
    const timeout = setTimeout(() => finish(new Error('Timed out')), options.timeoutMs ?? 60_000);
    options.signal?.addEventListener('abort', abort, { once: true });
    if (options.signal?.aborted) abort();
    const next = () => {
      if (offset >= audio.length) {
        finish();
        return;
      }
      const end = Math.min(audio.length, offset + utteranceBytes);
      for (let at = offset; at < end; at += appendBytes)
        upstream.send(
          JSON.stringify({
            type: 'input_audio_buffer.append',
            audio: audio.subarray(at, Math.min(end, at + appendBytes)).toString('base64'),
          }),
        );
      offset = end;
      upstream.send(JSON.stringify({ type: 'input_audio_buffer.commit' }));
    };
    upstream.on('open', () =>
      upstream.send(JSON.stringify({ type: 'session.configure', session })),
    );
    upstream.on('message', (raw) => {
      try {
        const event = JSON.parse(raw.toString());
        if (event.type === 'session.configured') next();
        else if (event.type === 'transcript.completed' && typeof event.transcript === 'string') {
          texts.push(event.transcript);
          next();
        } else if (event.type === 'input_audio_buffer.commit_empty') next();
        else if (event.type === 'error') finish(new Error('Provider error'));
      } catch {
        finish(new Error('Invalid provider message'));
      }
    });
    upstream.on('error', () => finish(new Error('Provider unavailable')));
    upstream.on('close', () => finish(new Error('Provider closed')));
  });
}

/** HTTP fallback for hosts without inbound WebSockets. Only the final transcript returns. */
export function createTranscribeHandler(options: {
  apiKey?: string;
  endpoint?: string;
  timeoutMs?: number;
}) {
  let active = 0;
  const requests = new Map<string, { count: number; until: number }>();

  return async function transcribe(req: IncomingMessage, res: ServerResponse) {
    const json = (status: number, body: object) => {
      if (res.destroyed || res.writableEnded) return;
      res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      res.end(JSON.stringify(body));
    };
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      json(405, { error: 'Use POST for listening.' });
      return;
    }
    const apiKey = options.apiKey;
    try {
      if (!apiKey || !req.headers.origin || new URL(req.headers.origin).host !== req.headers.host) {
        json(403, { error: 'Listening unavailable.' });
        return;
      }
    } catch {
      json(403, { error: 'Listening unavailable.' });
      return;
    }
    if (!req.headers['content-type']?.toLowerCase().startsWith('application/octet-stream')) {
      json(415, { error: 'Send PCM16 audio.' });
      return;
    }
    if (Number(req.headers['content-length']) > maxReadingBytes) {
      json(413, { error: 'Reading is too long.' });
      return;
    }
    const now = Date.now();
    for (const [key, value] of requests) if (value.until <= now) requests.delete(key);
    const address = req.socket.remoteAddress ?? 'local';
    const limit = requests.get(address) ?? { count: 0, until: now + 60_000 };
    if (limit.count >= 10 || active >= 2 || requests.size >= 1000) {
      res.setHeader('Retry-After', '60');
      json(429, { error: 'Listening unavailable.' });
      return;
    }
    limit.count++;
    requests.set(address, limit);
    let audio: Buffer;
    try {
      let size = 0;
      const chunks: Buffer[] = [];
      for await (const chunk of req) {
        size += chunk.length;
        if (size > maxReadingBytes) {
          json(413, { error: 'Reading is too long.' });
          return;
        }
        chunks.push(Buffer.from(chunk));
      }
      audio = Buffer.concat(chunks);
    } catch {
      json(400, { error: 'Invalid audio.' });
      return;
    }
    if (!audio.length || audio.length % 2) {
      json(400, { error: 'Send PCM16 audio.' });
      return;
    }
    const controller = new AbortController();
    const disconnect = () => {
      if (!res.writableEnded) controller.abort();
    };
    res.once('close', disconnect);
    active++;
    try {
      const text = await transcribeReading(audio, {
        apiKey,
        endpoint: options.endpoint,
        timeoutMs: options.timeoutMs,
        signal: controller.signal,
      });
      json(200, { text });
    } catch {
      // Never forward provider errors or diagnostics.
      json(503, { error: 'Listening unavailable.' });
    } finally {
      active--;
      res.off('close', disconnect);
    }
  };
}
