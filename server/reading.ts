import type { EventEmitter } from 'node:events';
import type { IncomingMessage } from 'node:http';
import type { Duplex } from 'node:stream';
import WebSocket, { WebSocketServer } from 'ws';

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
    const upstream = new WebSocket(
      options.endpoint ?? 'wss://api.narilabs.com/v1/realtime?intent=transcription',
      {
        headers: { Authorization: `Bearer ${options.apiKey}` },
        handshakeTimeout: 10_000,
        maxPayload: 128 * 1024,
      },
    );
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
      upstream.send(
        JSON.stringify({
          type: 'session.configure',
          session: { model: 'qwen3-asr-fast:free', language: 'en', turn_detection: null },
        }),
      ),
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
        if (!audio.length || audio.length % 2 || bytes > 16_000 * 2 * 100) {
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
