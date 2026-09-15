/** Shuffle once per activity so a retry keeps the same pieces in place. */
export function shuffleChoices<T>(choices: readonly T[]): T[] {
  const result = [...choices];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
