import type { Grade, Skill, Problem } from './types.ts';
const int = (min: number, max: number, rng: () => number) =>
  Math.floor(rng() * (max - min + 1)) + min;
export function makeProblem(grade: Grade, skill: Skill, round: number, rng = Math.random): Problem {
  const limit = Math.max(
    2,
    Math.round(
      [5, 10, 50, 100, 500, 1000][grade] *
        [0.5, 0.65, 0.8, 0.9, 1][Math.max(0, Math.min(4, round))],
    ),
  );
  let a = int(1, limit, rng),
    b = int(1, limit, rng),
    answer = 0,
    equation = '',
    hint = '';
  let denominator: number | undefined;
  if (skill === 'addition') {
    if (grade === 0) b = int(1, Math.max(1, Math.min(limit, 10 - a)), rng);
    answer = a + b;
    equation = `${a} + ${b}`;
    hint =
      grade <= 1
        ? `Start with ${a}. Count on ${b} more, one at a time. Tap the berries below to count them!`
        : `Break ${b} into easy pieces. Add the tens first, then the ones. You can use the scratchpad below.`;
  } else if (skill === 'subtraction') {
    if (b > a) [a, b] = [b, a];
    answer = a - b;
    equation = `${a} − ${b}`;
    hint =
      grade <= 1
        ? `Start with ${a} berries. Take away ${b}. Count how many are left.`
        : `Think: ${b} plus what makes ${a}? Count up from ${b} or subtract in smaller steps.`;
  } else if (skill === 'multiplication') {
    const factorLimit = Math.min(grade >= 4 ? 12 : 9, 4 + Math.max(0, Math.min(4, round)) * 2);
    a = int(2, factorLimit, rng);
    b = int(2, factorLimit, rng);
    answer = a * b;
    equation = `${a} × ${b}`;
    hint = `Think of ${a} equal groups with ${b} in each. Add ${b} a total of ${a} times, or skip-count by ${b}.`;
  } else if (skill === 'division') {
    b = int(2, Math.min(grade >= 4 ? 12 : 9, 4 + round * 2), rng);
    answer = int(2, Math.min(grade >= 4 ? 12 : 9, 4 + round * 2), rng);
    a = b * answer;
    equation = `${a} ÷ ${b}`;
    hint = `Share ${a} into ${b} equal groups. Think: ${b} times what equals ${a}?`;
  } else if (skill === 'fractions') {
    denominator = [4, 6, 8, 10, 12][int(0, Math.min(4, round + 1), rng)];
    a = int(1, denominator - 2, rng);
    b = int(1, denominator - a, rng);
    answer = a + b;
    equation = `${a}/${denominator} + ${b}/${denominator}`;
    hint = `The pieces are the same size: ${denominator}ths. Add the top numbers and keep ${denominator} on the bottom. Choose the number of pieces.`;
  } else {
    a = int(1, 9 + round * 10, rng);
    b = int(1, 9 + round * 10, rng);
    answer = (a + b) / 10;
    a /= 10;
    b /= 10;
    equation = `${a.toFixed(1)} + ${b.toFixed(1)}`;
    hint = `Line up the decimal points. Add the tenths, then the whole numbers. Ten tenths make one whole.`;
  }
  const step = skill === 'decimals' ? 0.1 : 1;
  const values = new Set([answer]);
  // Bounded deterministic distractors keep choices distinct, including near zero.
  for (const offset of [1, -1, 2, -2, 3, -3, 4, -4]) {
    const value = Math.round((answer + offset * step) * 10) / 10;
    if (value >= 0 && (!denominator || value <= denominator)) values.add(value);
    if (values.size === 4) break;
  }
  const choices = [...values];
  for (let i = choices.length - 1; i > 0; i--) {
    const j = int(0, i, rng);
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  return { a, b, answer, equation, choices, hint, skill, denominator };
}
