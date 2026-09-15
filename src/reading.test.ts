import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { readSave } from './game.ts';
import { editions, remixes, wordsIn, type ReadingBand } from './reading/content.ts';
import { matchReading } from './reading/matching.ts';
import {
  freshReading,
  readingKey,
  readReading,
  type ReadingCompletion,
} from './reading/progress.ts';
import { saveReducer } from './saveReducer.ts';

const completion: ReadingCompletion = {
  key: readingKey('sprout'),
  date: '2026-09-13',
  band: 'sprout',
  remix: 'hops',
  supported: true,
};

test('Existing math saves gain a fresh reading shelf without losing progress', () => {
  const old = { ...readSave(null), xp: 245, gems: 42, name: 'Mira', reading: undefined };
  const loaded = readSave(JSON.stringify(old));
  assert.equal(loaded.name, 'Mira');
  assert.equal(loaded.xp, 245);
  assert.equal(loaded.gems, 42);
  assert.deepEqual(loaded.reading, freshReading());
  const malformed = readReading({
    completed: [
      null,
      {},
      { ...completion, band: 'toString' },
      { ...completion, key: 'wrong' },
      completion,
      completion,
    ],
    bookmarks: { sprout: 17, trail: 1.2, soar: 2 },
  });
  assert.deepEqual(malformed.completed, [completion]);
  assert.deepEqual(malformed.bookmarks, { soar: 2 });
});

test('Help earns the full reading reward, while rereading updates the ending without duplicate currency', () => {
  const initial = readSave(null);
  const marked = saveReducer(initial, { type: 'reading-bookmarked', band: 'sprout', page: 3 });
  const first = saveReducer(marked, { type: 'reading-completed', completion });
  assert.equal(first.xp - initial.xp, 100);
  assert.equal(first.gems - initial.gems, 15);
  assert.equal(first.reading.bookmarks.sprout, 0);
  assert.equal(first.reading.completed[0].supported, true);
  const second = saveReducer(first, {
    type: 'reading-completed',
    completion: { ...completion, remix: 'spins' },
  });
  assert.equal(second.xp, first.xp);
  assert.equal(second.gems, first.gems);
  assert.equal(second.reading.completed.length, 1);
  assert.equal(second.reading.completed[0].remix, 'spins');
  assert.deepEqual(second.reading.endings, ['hops', 'spins']);
  assert.deepEqual(readSave(JSON.stringify(second)).reading, second.reading);
  assert.equal(
    saveReducer(second, { type: 'reading-bookmarked', band: 'invalid' as ReadingBand, page: 0 }),
    second,
  );
  assert.deepEqual(initial.reading, freshReading());
});

test('The story passport keeps distinct rereading endings and migrates existing keepsakes', () => {
  const oldReading = readReading({ completed: [completion] });
  assert.deepEqual(oldReading.endings, ['hops']);
  let save = readSave(null);
  for (const remix of ['hops', 'spins', 'tiptoes', 'hops'])
    save = saveReducer(save, { type: 'reading-completed', completion: { ...completion, remix } });
  assert.deepEqual(save.reading.endings, ['hops', 'spins', 'tiptoes']);
  assert.equal(save.xp, 100);
  assert.equal(save.gems, 15);
  assert.deepEqual(readSave(JSON.stringify(save)).reading.endings, save.reading.endings);
  assert.deepEqual(readReading({ endings: ['hops', 'hops', 'invalid', null] }).endings, ['hops']);
});

test('Reading follows revised partials, repeated words and punctuation without inventing a successful read', () => {
  const line = 'Pip has a red hat. A gust lifts it up.';
  assert.deepEqual(matchReading(line, ''), { matched: [], next: 0, complete: false });
  assert.deepEqual(matchReading(line, 'Pip haz').matched, [0]);
  assert.deepEqual(matchReading(line, 'Pip has').matched, [0, 1]);
  assert.deepEqual(matchReading(line, 'Pip Pip has a red hat').matched, [0, 1, 2, 3, 4]);
  assert.deepEqual(matchReading(line, 'Pip has a blue hat').matched, [0, 1, 2, 4]);
  assert.equal(matchReading(line, 'Pip has a blue hat').next, 3);
  assert.equal(matchReading(line, 'pip has a red hat a gust lifts it up').complete, true);
  assert.equal(matchReading(line, 'has a red hat').complete, false);
  assert.equal(matchReading(line, 'the dog runs away').complete, false);
  assert.equal(matchReading('', '').complete, false);
  assert.equal(
    matchReading('Pip tiptoes in his red hat.', 'Pip tip toes in his red hat').complete,
    true,
  );
});

test('Every authored page and ending has a matching playable recording and ordered model-derived word timings', async () => {
  const root = new URL('../public/reading/audio/', import.meta.url);
  const timings = JSON.parse(await readFile(new URL('timings.json', root), 'utf8')) as Record<
    string,
    {
      text: string;
      textHash: string;
      audioHash: string;
      duration: number;
      words: { word: string; start: number; end: number }[];
    }
  >;
  const clips = [...Object.values(editions).flatMap((edition) => edition.pages), ...remixes];
  assert.equal(Object.keys(timings).length, clips.length);
  for (const clip of clips) {
    const aligned = timings[clip.id];
    assert.equal(aligned.text, clip.text, clip.id);
    assert.equal(aligned.textHash, createHash('sha256').update(clip.text).digest('hex'));
    const audio = await readFile(new URL(`${clip.id}.wav`, root));
    assert.equal(aligned.audioHash, createHash('sha256').update(audio).digest('hex'));
    assert.equal(audio.subarray(0, 4).toString(), 'RIFF');
    assert.equal(audio.readUInt32LE(24), 24_000);
    assert.equal(audio.readUInt16LE(22), 1);
    assert.equal(audio.readUInt16LE(34), 16);
    assert.equal(audio.readUInt32LE(40), audio.length - 44);
    assert.ok(Math.abs(aligned.duration - (audio.length - 44) / 48_000) < 0.002);
    assert.deepEqual(
      aligned.words.map((word) => word.word),
      wordsIn(clip.text),
    );
    for (let i = 0; i < aligned.words.length; i++) {
      const word = aligned.words[i];
      assert.ok(
        word.start >= 0 && word.end > word.start && word.end <= aligned.duration,
        `${clip.id}: ${word.word}`,
      );
      if (i) assert.ok(word.start >= aligned.words[i - 1].end, 'Words must not overlap');
    }
  }
});
