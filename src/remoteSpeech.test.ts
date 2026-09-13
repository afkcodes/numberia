import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createServer } from 'node:http';
import { createSpeechHandler } from '../server/speech.ts';
import { PcmDecoder, PcmPlayback } from './speech/pcm.ts';
import { createNarrator, isCounting, narrationParts } from './speech/narrator.ts';

const tick = () => new Promise<void>((resolve) => setImmediate(resolve));
const audioHeaders = { 'Content-Type': 'audio/pcm', 'X-Audio-Sample-Rate': '24000' };
function fakeContext() {
  const sources: {
    buffer: AudioBuffer | null;
    onended: (() => void) | null;
    at: number;
    stopped: boolean;
    start: (time: number) => void;
    stop: () => void;
    connect: () => void;
    disconnect: () => void;
  }[] = [];
  const context = {
    state: 'running',
    currentTime: 10,
    destination: {},
    resume: async () => {},
    createBuffer: (_channels: number, length: number, sampleRate: number) => {
      const samples = new Float32Array(length);
      return { duration: length / sampleRate, getChannelData: () => samples };
    },
    createBufferSource: () => {
      const source = {
        buffer: null as AudioBuffer | null,
        onended: null as (() => void) | null,
        at: 0,
        stopped: false,
        connect() {},
        disconnect() {},
        start(time: number) {
          this.at = time;
        },
        stop() {
          this.stopped = true;
        },
      };
      sources.push(source);
      return source;
    },
  };
  return { context: context as unknown as AudioContext, sources };
}

test('PCM streaming preserves split samples, signed values, and 24 kHz timing', async () => {
  const decoder = new PcmDecoder();
  const decoded = [
    decoder.decode(new Uint8Array([0, 128, 255])),
    decoder.decode(new Uint8Array([])),
    decoder.decode(new Uint8Array([127, 0, 0, 0])),
    decoder.decode(new Uint8Array([64])),
  ];
  assert.deepEqual(
    decoded.flatMap((part) => [...part]),
    [-1, 32767 / 32768, 0, 0.5],
  );
  decoder.finish();
  const broken = new PcmDecoder();
  broken.decode(new Uint8Array([1]));
  assert.throws(() => broken.finish());
  const { context, sources } = fakeContext();
  const player = new PcmPlayback(context);
  player.enqueue(new Float32Array(2400));
  assert.equal(sources.length, 0);
  player.enqueue(new Float32Array(2400));
  assert.equal(sources.length, 1);
  player.enqueue(new Float32Array(2400));
  assert.equal(sources.length, 2);
  assert.equal(sources[0].buffer?.duration, 0.2);
  assert.ok(
    Math.abs(sources[1].at - sources[0].at - 0.2) < 1e-8,
    'Chunks are scheduled contiguously',
  );
  let done = false;
  const finished = player.finish().then(() => {
    done = true;
  });
  await tick();
  assert.equal(done, false);
  sources[0].onended?.();
  await tick();
  assert.equal(done, false);
  sources[1].onended?.();
  await finished;
  assert.equal(done, true);
});

test('Streaming narration plays before EOF and cancellation stops scheduled audio', async () => {
  const { context, sources } = fakeContext();
  let stream!: ReadableStreamDefaultController<Uint8Array>;
  let requested: unknown;
  const fallback: string[] = [];
  const narrator = createNarrator({
    getContext: () => context,
    browserSpeak: async (text) => {
      fallback.push(text);
    },
    fetch: async (_url, init) => {
      requested = JSON.parse(init!.body as string);
      return new Response(
        new ReadableStream({
          start(c) {
            stream = c;
            c.enqueue(new Uint8Array(9600));
          },
        }),
        { headers: audioHeaders },
      );
    },
  });
  const controller = new AbortController();
  const speaking = narrator('Hello, little explorer!', controller.signal);
  await tick();
  assert.equal(sources.length, 1, 'Playback starts while the response remains open');
  assert.deepEqual(
    requested,
    { input: 'Hello, little explorer!' },
    'Browser sends no API key or model controls',
  );
  stream.enqueue(new Uint8Array(4800));
  await tick();
  assert.equal(sources.length, 2);
  controller.abort();
  await speaking;
  assert.ok(sources.every((source) => source.stopped));
  assert.deepEqual(fallback, [], 'Canceled speech cannot restart as device speech');
});

test('Small network fragments preserve every sample without creating tiny playback sources', async () => {
  const { context, sources } = fakeContext();
  const player = new PcmPlayback(context);
  const input = Float32Array.from({ length: 10_017 }, (_, i) => Math.sin(i / 12) * 0.2);
  for (let offset = 0; offset < input.length; offset += 31) {
    player.enqueue(input.subarray(offset, offset + 31));
    Object.defineProperty(context, 'currentTime', { value: context.currentTime + 0.0001 });
  }
  assert.equal(sources.length, 3);
  assert.deepEqual(
    sources.map((source) => source.buffer?.duration),
    [0.2, 0.1, 0.1],
  );
  const finished = player.finish();
  assert.equal(sources.length, 4);
  const output = sources.flatMap((source) => [...source.buffer!.getChannelData(0)]);
  assert.deepEqual(output, [...input], 'No samples are dropped, duplicated, or reordered');
  for (let i = 1; i < sources.length; i++)
    assert.ok(Math.abs(sources[i].at - sources[i - 1].at - sources[i - 1].buffer!.duration) < 1e-8);
  for (const source of sources) source.onended?.();
  await finished;
});

test('Narration spells out arithmetic while leaving quick device counts unchanged', () => {
  const examples = [
    ['6 + 4. What is the answer?', 'Six plus four. What is the answer?'],
    ['10 − 4 = 6.', 'Ten minus four equals six.'],
    ['3 × 4. 12 ÷ 3?', 'Three times four. Twelve divided by three?'],
    ['1.2 + 0.03 = 1.23.', 'One point two plus zero point zero three equals one point two three.'],
    ['1/4 + 2/4 = 3/4.', 'One over four plus two over four equals three over four.'],
    ['1000 + 1000 = 2000.', 'One thousand plus one thousand equals two thousand.'],
    ['0 berries are left.', 'Zero berries are left.'],
    ['There are 12ths. Take 2 pieces.', 'There are twelfths. Take two pieces.'],
  ];
  for (const [written, spoken] of examples) assert.deepEqual(narrationParts(written), [spoken]);
  assert.deepEqual(narrationParts('1. 2. 3.'), ['1.', '2.', '3.']);
});

test('Unavailable and slow speech fall back once, then reuse the device voice during cooldown', async () => {
  for (const slow of [false, true]) {
    const { context } = fakeContext();
    let calls = 0;
    const spoken: string[] = [];
    const narrator = createNarrator({
      getContext: () => context,
      browserSpeak: async (text) => {
        spoken.push(text);
      },
      firstAudioMs: 10,
      fetch: async (_url, init) => {
        calls++;
        if (!slow) return new Response('unavailable', { status: 503 });
        return await new Promise<Response>((_resolve, reject) =>
          init!.signal!.addEventListener('abort', () => reject(new Error('aborted')), {
            once: true,
          }),
        );
      },
    });
    const signal = new AbortController().signal;
    await narrator('Let’s count together.', signal);
    await narrator('You can do it!', signal);
    assert.equal(calls, 1);
    assert.deepEqual(spoken, ['Let’s count together.', 'You can do it!']);
  }
});

test('Canceled audio activation settles immediately without requesting or replaying speech', async () => {
  const { context } = fakeContext();
  Object.defineProperty(context, 'state', { value: 'suspended' });
  context.resume = () => new Promise(() => {});
  let calls = 0;
  const narrator = createNarrator({
    getContext: () => context,
    browserSpeak: async () => {
      calls++;
    },
    fetch: async () => {
      calls++;
      return new Response();
    },
  });
  const controller = new AbortController();
  const active = narrator('Welcome back!', controller.signal);
  controller.abort();
  await active;
  assert.equal(calls, 0);
});

test('A failed partial stream stops playback without repeating the instruction', async () => {
  const { context, sources } = fakeContext();
  let stream!: ReadableStreamDefaultController<Uint8Array>;
  const device: string[] = [];
  const narrator = createNarrator({
    getContext: () => context,
    browserSpeak: async (text) => {
      device.push(text);
    },
    fetch: async () =>
      new Response(
        new ReadableStream({
          start(c) {
            stream = c;
            c.enqueue(new Uint8Array(9600));
          },
        }),
        { headers: audioHeaders },
      ),
  });
  const signal = new AbortController().signal;
  const playing = narrator('Let’s try this together.', signal);
  await tick();
  assert.equal(sources.length, 1);
  stream.error(new Error('Connection lost'));
  await playing;
  assert.ok(sources[0].stopped);
  assert.deepEqual(device, []);
  await narrator('You can do it!', signal);
  assert.deepEqual(device, ['You can do it!']);
});

test('Counting stays instant and consecutive guidance sentences share one request', async () => {
  for (const text of [
    '1.',
    '0.5.',
    '3 over 4.',
    '2 pieces.',
    '4 in this basket.',
    '3 in each group.',
    '8 packed altogether.',
  ])
    assert.ok(isCounting(text));
  assert.equal(isCounting('3 plus 4 equals 7.'), false);
  assert.deepEqual(narrationParts('1. 2. We found it! 2 + 3 = 5.'), [
    '1.',
    '2.',
    'We found it! Two plus three equals five.',
  ]);
  let calls = 0;
  const spoken: string[] = [];
  const narrator = createNarrator({
    getContext: () => {
      throw new Error('Counting needs no AudioContext');
    },
    browserSpeak: async (text) => {
      spoken.push(text);
    },
    fetch: async () => {
      calls++;
      return new Response();
    },
  });
  await narrator('1.', new AbortController().signal);
  assert.equal(calls, 0);
  assert.deepEqual(spoken, ['1.']);
});

async function gateway(
  fetchSpeech: typeof fetch,
  run: (url: string) => Promise<void>,
  apiKey = 'private-test-key',
) {
  const handler = createSpeechHandler({ apiKey, fetch: fetchSpeech, timeoutMs: 1000 });
  const server = createServer((req, res) => void handler(req, res));
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert(address && typeof address !== 'string');
  try {
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}
const speechRequest = (input: unknown) => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ input }),
});

test('Speech gateway streams immediately, keeps credentials private, and caches only complete audio', async () => {
  let upstream!: ReadableStreamDefaultController<Uint8Array>;
  let calls = 0;
  await gateway(
    async (url, init) => {
      calls++;
      assert.equal(url, 'https://api.narilabs.com/v1/audio/speech');
      assert.equal(new Headers(init!.headers).get('Authorization'), 'Bearer private-test-key');
      assert.deepEqual(JSON.parse(init!.body as string), {
        model: 'qwen3-tts-fast:free',
        voice: 'phoebe',
        language: 'en',
        input: 'Hello!',
        stream: true,
        response_format: 'pcm',
      });
      return new Response(
        new ReadableStream({
          start(c) {
            upstream = c;
            c.enqueue(new Uint8Array([0, 1]));
          },
        }),
        { headers: audioHeaders },
      );
    },
    async (url) => {
      const response = await fetch(url, speechRequest('Hello!'));
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('x-speech-cache'), 'miss');
      assert.equal(response.headers.get('x-audio-sample-rate'), '24000');
      assert.ok(!JSON.stringify([...response.headers]).includes('private-test-key'));
      const reader = response.body!.getReader();
      assert.deepEqual([...(await reader.read()).value!], [0, 1]);
      upstream.enqueue(new Uint8Array([2, 3]));
      upstream.close();
      assert.deepEqual([...(await reader.read()).value!], [2, 3]);
      assert.equal((await reader.read()).done, true);
      const cached = await fetch(url, speechRequest('Hello!'));
      assert.equal(cached.headers.get('x-speech-cache'), 'hit');
      assert.deepEqual([...new Uint8Array(await cached.arrayBuffer())], [0, 1, 2, 3]);
      assert.equal(calls, 1);
    },
  );
});

test('Speech gateway rejects invalid text and foreign origins without making a provider request', async () => {
  let calls = 0;
  await gateway(
    async () => {
      calls++;
      return new Response();
    },
    async (url) => {
      for (const [input, status] of [
        [null, 400],
        [' ', 400],
        ['x'.repeat(601), 400],
        ['x'.repeat(5000), 413],
      ] as const) {
        const response = await fetch(url, speechRequest(input));
        assert.equal(response.status, status);
        await response.text();
      }
      const foreign = await fetch(url, {
        ...speechRequest('Hello'),
        headers: { 'Content-Type': 'application/json', Origin: 'https://another-site.example' },
      });
      assert.equal(foreign.status, 403);
      await foreign.text();
      const get = await fetch(url);
      assert.equal(get.status, 405);
      await get.text();
      assert.equal(calls, 0);
    },
  );
});

test('Provider failures return a generic response without exposing diagnostics or retrying immediately', async () => {
  let calls = 0;
  await gateway(
    async () => {
      calls++;
      return new Response('private-test-key: provider diagnostics', { status: 401 });
    },
    async (url) => {
      for (let i = 0; i < 2; i++) {
        const response = await fetch(url, speechRequest('Hello'));
        assert.equal(response.status, 503);
        assert.deepEqual(await response.json(), { error: 'Device voice available.' });
      }
      assert.equal(calls, 1);
    },
  );
});

test('A disconnected browser cancels provider generation and incomplete speech is not cached', async () => {
  let canceled = 0,
    calls = 0;
  await gateway(
    async (_url, init) => {
      calls++;
      return new Response(
        new ReadableStream({
          start(c) {
            c.enqueue(new Uint8Array([0, 1]));
            init!.signal!.addEventListener(
              'abort',
              () => {
                canceled++;
                c.error(new Error('closed'));
              },
              { once: true },
            );
          },
        }),
        { headers: audioHeaders },
      );
    },
    async (url) => {
      for (let attempt = 0; attempt < 2; attempt++) {
        const controller = new AbortController();
        const response = await fetch(url, { ...speechRequest('Hello'), signal: controller.signal });
        await response.body!.getReader().read();
        controller.abort();
        for (let i = 0; i < 20 && canceled <= attempt; i++)
          await new Promise((resolve) => setTimeout(resolve, 5));
        assert.equal(canceled, attempt + 1);
      }
      assert.equal(calls, 2);
    },
  );
});
