/** Development-only content preparation. Credentials never enter published assets. */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { editions, remixes } from '../../src/reading/content.ts';

process.loadEnvFile();
if (!process.env.NARI_API_KEY) throw new Error('Set NARI_API_KEY in .env');
const root = new URL('../../public/reading/audio/', import.meta.url);
await mkdir(root, { recursive: true });
const clips = [...Object.values(editions).flatMap((edition) => edition.pages), ...remixes].map(
  ({ id, text }) => ({
    id,
    text,
    hash: createHash('sha256').update(text).digest('hex'),
    // A pronunciation boundary preserves both syllables of this compound word.
    spokenText: text.replace(/\btiptoes\b/g, 'tip-toes'),
  }),
);
let previous: typeof clips = [];
try {
  previous = JSON.parse(await readFile(new URL('sources.json', root), 'utf8'));
} catch {
  /* First content preparation. */
}
for (const clip of clips) {
  const file = new URL(`${clip.id}.wav`, root);
  if (
    !process.argv.includes(`--force=${clip.id}`) &&
    previous.some(
      (old) =>
        old.id === clip.id &&
        old.hash === clip.hash &&
        (old.spokenText ?? old.text) === clip.spokenText,
    ) &&
    (await readFile(file).then(
      () => true,
      () => false,
    ))
  )
    continue;
  const res = await fetch('https://api.narilabs.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.NARI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'qwen3-tts-fast:free',
      input: clip.spokenText,
      voice: 'phoebe',
      language: 'en',
      stream: true,
      response_format: 'pcm',
    }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok || !res.headers.get('content-type')?.startsWith('audio/pcm'))
    throw new Error(`Audio preparation stopped (${res.status})`);
  const pcm = Buffer.from(await res.arrayBuffer());
  if (!pcm.length || pcm.length % 2) throw new Error('Incomplete narration');
  const header = Buffer.alloc(44);
  header.write('RIFF');
  header.writeUInt32LE(pcm.length + 36, 4);
  header.write('WAVEfmt ', 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(24_000, 24);
  header.writeUInt32LE(48_000, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);
  await writeFile(file, Buffer.concat([header, pcm]));
  previous = [...previous.filter((old) => old.id !== clip.id), clip];
  await writeFile(new URL('sources.json', root), JSON.stringify(previous, null, 2) + '\n');
  console.log(`Prepared ${clip.id} (${(pcm.length / 48_000).toFixed(1)}s)`);
}
