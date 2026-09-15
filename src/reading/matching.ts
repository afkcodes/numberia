import { normalWord, wordsIn } from './content.ts';

export type ReadingMatch = { matched: number[]; next: number; complete: boolean };

/** Align a whole revised hypothesis to this line; never append partial transcripts. */
export function matchReading(reference: string, transcript: string): ReadingMatch {
  const expected = wordsIn(reference).map(normalWord);
  const heard = wordsIn(transcript).map(normalWord).filter(Boolean).slice(0, 250);
  // Recognition sometimes separates a compound ("tip toes", "can not").
  // Join only when the joined word is actually present in the reference.
  for (let i = 0; i < heard.length - 1; i++) {
    const joined = heard[i] + heard[i + 1];
    if (expected.includes(joined)) heard.splice(i, 2, joined);
  }
  const rows = expected.length + 1,
    columns = heard.length + 1;
  const cost = Array.from({ length: rows }, () => new Float64Array(columns));
  for (let i = 0; i < rows; i++) cost[i][0] = i;
  for (let j = 0; j < columns; j++) cost[0][j] = j * 0.8;
  for (let i = 1; i < rows; i++)
    for (let j = 1; j < columns; j++)
      cost[i][j] = Math.min(
        cost[i - 1][j] + 1,
        cost[i][j - 1] + 0.8,
        cost[i - 1][j - 1] + (expected[i - 1] === heard[j - 1] ? 0 : 1.2),
      );
  // Find the most plausible spoken prefix, not the unspoken remainder of the page.
  let end = 0;
  for (let i = 1; i < rows; i++) if (cost[i][heard.length] < cost[end][heard.length]) end = i;
  let i = end,
    j = heard.length;
  const matched: number[] = [];
  while (i > 0 && j > 0) {
    const equal = expected[i - 1] === heard[j - 1];
    if (Math.abs(cost[i][j] - cost[i - 1][j - 1] - (equal ? 0 : 1.2)) < 0.001) {
      if (equal) matched.push(i - 1);
      i--;
      j--;
    } else if (Math.abs(cost[i][j] - cost[i][j - 1] - 0.8) < 0.001) j--;
    else i--;
  }
  matched.reverse();
  const next = expected.findIndex((_, index) => !matched.includes(index));
  return {
    matched,
    next: next === -1 ? expected.length : next,
    complete: expected.length > 0 && matched.length === expected.length,
  };
}
