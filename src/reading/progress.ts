import type { Save } from '../game/types.ts';
import { editions, remixes, storyId, type ReadingBand } from './content.ts';

export type ReadingCompletion = {
  key: string;
  date: string;
  band: ReadingBand;
  remix: string;
  supported: boolean;
};
export type ReadingProgress = {
  completed: ReadingCompletion[];
  bookmarks: Partial<Record<ReadingBand, number>>;
  endings: string[];
};
export const freshReading = (): ReadingProgress => ({ completed: [], bookmarks: {}, endings: [] });
export const readingKey = (band: ReadingBand) => `${storyId}:${band}`;
export function readReading(value: unknown): ReadingProgress {
  const result = freshReading();
  if (!value || typeof value !== 'object') return result;
  const data = value as Record<string, unknown>;
  if (Array.isArray(data.completed))
    for (const item of data.completed.slice(0, 100)) {
      if (!item || typeof item !== 'object') continue;
      const v = item as ReadingCompletion;
      if (
        typeof v.band !== 'string' ||
        !Object.hasOwn(editions, v.band) ||
        v.key !== readingKey(v.band) ||
        typeof v.date !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(v.date) ||
        typeof v.supported !== 'boolean' ||
        !remixes.some((r) => r.word === v.remix) ||
        result.completed.some((r) => r.key === v.key)
      )
        continue;
      result.completed.push({
        key: v.key,
        date: v.date,
        band: v.band,
        remix: v.remix,
        supported: v.supported,
      });
    }
  if (data.bookmarks && typeof data.bookmarks === 'object')
    for (const band of Object.keys(editions) as ReadingBand[]) {
      const page = (data.bookmarks as Record<string, unknown>)[band];
      if (
        typeof page === 'number' &&
        Number.isInteger(page) &&
        page >= 0 &&
        page < editions[band].pages.length
      )
        result.bookmarks[band] = page;
    }
  const savedEndings = Array.isArray(data.endings) ? data.endings.slice(0, 10) : [];
  result.endings = remixes
    .filter(
      (r) => savedEndings.includes(r.word) || result.completed.some((c) => c.remix === r.word),
    )
    .map((r) => r.word);
  return result;
}
export function finishReading(save: Save, completion: ReadingCompletion): Save {
  const valid = readReading({ completed: [completion] }).completed[0];
  if (!valid) return save;
  const old = save.reading.completed.find((r) => r.key === valid.key);
  return {
    ...save,
    xp: save.xp + (old ? 0 : 100),
    gems: save.gems + (old ? 0 : 15),
    reading: {
      completed: [...save.reading.completed.filter((r) => r.key !== valid.key), valid],
      bookmarks: { ...save.reading.bookmarks, [valid.band]: 0 },
      endings: [...new Set([...save.reading.endings, valid.remix])],
    },
  };
}
