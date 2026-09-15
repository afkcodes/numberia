import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { test, type TestContext } from 'node:test';
import WebSocket, { WebSocketServer } from 'ws';
import { attachReadingRecognition, createTranscribeHandler } from '../server/reading.ts';
import { createAppServer } from '../server/app.ts';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

test(
  'Batch transcription commits long readings in provider-sized utterances and returns only text',
  { timeout: 5000 },
  async (t) => {
    const provider = new WebSocketServer({ port: 0, host: '127.0.0.1' });
    await once(provider, 'listening');
    let authorization = '',
      connections = 0,
      appended = 0,
      commits = 0;
    provider.on('connection', (upstream, request) => {
      connections++;
      authorization = request.headers.authorization ?? '';
      upstream.on('message', (raw) => {
        const event = JSON.parse(raw.toString());
        if (event.type === 'session.configure')
          upstream.send(JSON.stringify({ type: 'session.configured' }));
        else if (event.type === 'input_audio_buffer.append')
          appended += Buffer.from(event.audio, 'base64').length;
        else if (event.type === 'input_audio_buffer.commit')
          upstream.send(
            JSON.stringify({
              type: 'transcript.completed',
              transcript: `part ${++commits}`,
              item_id: String(commits),
              internal: 'not for the browser',
            }),
          );
      });
    });
    const app = createServer(
      createTranscribeHandler({
        apiKey: 'test-key',
        endpoint: `ws://127.0.0.1:${(provider.address() as AddressInfo).port}`,
      }),
    );
    app.listen(0, '127.0.0.1');
    await once(app, 'listening');
    t.after(async () => {
      for (const client of provider.clients) client.terminate();
      await Promise.all([
        new Promise<void>((resolve) => app.close(() => resolve())),
        new Promise<void>((resolve) => provider.close(() => resolve())),
      ]);
    });
    const host = `127.0.0.1:${(app.address() as AddressInfo).port}`;
    const post = (body: Uint8Array, origin = `http://${host}`) =>
      fetch(`http://${host}/api/reading/transcribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/octet-stream', Origin: origin },
        body,
      });
    const audio = new Uint8Array(16_000 * 2 * 45);
    const response = await post(audio);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { text: 'part 1 part 2' });
    assert.equal(authorization, 'Bearer test-key');
    assert.equal(appended, audio.length);
    assert.equal(commits, 2);
    const foreign = await post(new Uint8Array(4), 'https://unrelated.example');
    assert.equal(foreign.status, 403);
    await foreign.arrayBuffer();
    const odd = await post(new Uint8Array(3));
    assert.equal(odd.status, 400);
    await odd.arrayBuffer();
    assert.equal(connections, 1);
  },
);

test('Production recordings support real byte seeking, suffix requests and invalid ranges', async (t) => {
  const root = new URL('../public/reading/', import.meta.url);
  const bytes = await readFile(new URL('audio/sprout-wind.wav', root));
  const server = createAppServer({ root: fileURLToPath(root) });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise<void>((resolve) => server.close(() => resolve())));
  const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}/audio/sprout-wind.wav`;
  const header = await fetch(url, { headers: { Range: 'bytes=0-43' } });
  assert.equal(header.status, 206);
  assert.equal(header.headers.get('content-type'), 'audio/wav');
  assert.equal(header.headers.get('content-range'), `bytes 0-43/${bytes.length}`);
  assert.deepEqual(Buffer.from(await header.arrayBuffer()), bytes.subarray(0, 44));
  const suffix = await fetch(url, { headers: { Range: 'bytes=-20' } });
  assert.equal(suffix.status, 206);
  assert.deepEqual(Buffer.from(await suffix.arrayBuffer()), bytes.subarray(-20));
  const remainder = await fetch(url, { headers: { Range: 'bytes=44000-' } });
  assert.equal(remainder.status, 206);
  assert.deepEqual(Buffer.from(await remainder.arrayBuffer()), bytes.subarray(44000));
  for (const range of ['bytes=99999999-', 'bytes=-0', 'bytes=10-2', 'bytes=1-2,5-6', 'bytes=-']) {
    const result = await fetch(url, { headers: { Range: range } });
    assert.equal(result.status, 416);
    await result.arrayBuffer();
  }
  const head = await fetch(url, { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.equal(head.headers.get('accept-ranges'), 'bytes');
  assert.equal(Number(head.headers.get('content-length')), bytes.length);
});

async function gateway(t: TestContext, key: string | undefined = 'test-key') {
  const provider = new WebSocketServer({ port: 0, host: '127.0.0.1' });
  await once(provider, 'listening');
  const app = createServer();
  attachReadingRecognition(app, {
    apiKey: key,
    endpoint: `ws://127.0.0.1:${(provider.address() as AddressInfo).port}`,
  });
  app.listen(0, '127.0.0.1');
  await once(app, 'listening');
  const host = `127.0.0.1:${(app.address() as AddressInfo).port}`;
  const clients: WebSocket[] = [];
  t.after(async () => {
    for (const client of clients) client.terminate();
    for (const client of provider.clients) client.terminate();
    await Promise.all([
      new Promise<void>((resolve) => app.close(() => resolve())),
      new Promise<void>((resolve) => provider.close(() => resolve())),
    ]);
  });
  return {
    provider,
    connect(origin = `http://${host}`) {
      const client = new WebSocket(`ws://${host}/api/reading/listen`, { origin });
      clients.push(client);
      return client;
    },
  };
}
const message = async (socket: WebSocket) =>
  JSON.parse((await once(socket, 'message'))[0].toString());

test(
  'The microphone gateway fixes provider settings, relays PCM and returns only transcript fields',
  { timeout: 5000 },
  async (t) => {
    const { provider, connect } = await gateway(t);
    const connection = once(provider, 'connection');
    const child = connect();
    const ready = message(child);
    const [upstream, request] = (await connection) as [
      WebSocket,
      { headers: { authorization: string } },
    ];
    assert.equal(request.headers.authorization, 'Bearer test-key');
    const config = await message(upstream);
    assert.deepEqual(config, {
      type: 'session.configure',
      session: { model: 'qwen3-asr-fast:free', language: 'en', turn_detection: null },
    });
    upstream.send(JSON.stringify({ type: 'session.configured' }));
    assert.deepEqual(await ready, { type: 'ready' });
    const pcm = Buffer.from([0, 0, 255, 127, 0, 128]);
    const appended = message(upstream);
    child.send(pcm);
    assert.deepEqual(await appended, {
      type: 'input_audio_buffer.append',
      audio: pcm.toString('base64'),
    });
    const partial = message(child);
    upstream.send(
      JSON.stringify({
        type: 'transcript.partial',
        transcript: 'Pip has',
        item_id: 'a',
        internal: 'not for the browser',
      }),
    );
    assert.deepEqual(await partial, { type: 'partial', text: 'Pip has', itemId: 'a' });
    const committed = message(upstream);
    child.send('finish');
    assert.deepEqual(await committed, { type: 'input_audio_buffer.commit' });
    const complete = message(child);
    upstream.send(
      JSON.stringify({
        type: 'transcript.completed',
        transcript: 'Pip has a red hat.',
        item_id: 'a',
      }),
    );
    assert.deepEqual(await complete, { type: 'complete', text: 'Pip has a red hat.', itemId: 'a' });
    const closed = once(upstream, 'close');
    child.close();
    await closed;
  },
);

test(
  'Foreign origins and missing private keys cannot open microphone sessions',
  { timeout: 5000 },
  async (t) => {
    const { provider, connect } = await gateway(t);
    let upstreamConnections = 0;
    provider.on('connection', () => upstreamConnections++);
    const child = connect('https://unrelated.example');
    const [error] = await once(child, 'error');
    assert.match(error.message, /403/);
    assert.equal(upstreamConnections, 0);
    const missing = await gateway(t, '');
    const [missingError] = await once(missing.connect(), 'error');
    assert.match(missingError.message, /403/);
  },
);

test(
  'Malformed microphone messages close both connections without provider diagnostics',
  { timeout: 5000 },
  async (t) => {
    const { provider, connect } = await gateway(t);
    const connection = once(provider, 'connection');
    const child = connect();
    const ready = message(child);
    const [upstream] = (await connection) as [WebSocket];
    await message(upstream);
    upstream.send(JSON.stringify({ type: 'session.configured' }));
    await ready;
    const unavailable = message(child);
    const closed = once(upstream, 'close');
    child.send(Buffer.from([1]));
    assert.deepEqual(await unavailable, { type: 'unavailable' });
    await closed;
  },
);
