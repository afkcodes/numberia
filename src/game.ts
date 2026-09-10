import { freshClubhouse, readClubhouse, type ClubhouseSave } from './clubhouse.ts';
import { readLearning, type LearningMemory } from './learning.ts';

export type Grade = 0 | 1 | 2 | 3 | 4 | 5;
export type Skill =
  'addition' | 'subtraction' | 'multiplication' | 'division' | 'fractions' | 'decimals';
export type Problem = {
  a: number;
  b: number;
  answer: number;
  equation: string;
  choices: number[];
  hint: string;
  skill: Skill;
  denominator?: number;
};
export type Run = {
  id: string;
  date: string;
  grade: Grade;
  mission: number;
  skill: Skill;
  stars: number;
  unassisted: number;
  xp: number;
  practice: boolean;
};
export type Save = {
  version: 1;
  name: string;
  grade: Grade;
  xp: number;
  gems: number;
  runs: Run[];
  sound: boolean;
  companion: string;
  claimed: string[];
  clubhouse: ClubhouseSave;
  learning: LearningMemory;
};
export const defaultSave: Save = {
  version: 1,
  name: 'Explorer',
  grade: 1,
  xp: 0,
  gems: 0,
  runs: [],
  sound: true,
  companion: 'Milo',
  claimed: [],
  clubhouse: freshClubhouse(),
  learning: {},
};
export const STORAGE_KEY = 'numberia-adventure-v1';
export const gradeLabel = (grade: Grade) => (grade === 0 ? 'Kindergarten' : `Grade ${grade}`);
export const dateKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
export function availableSkills(grade: Grade): Skill[] {
  if (grade <= 2) return ['addition', 'subtraction'];
  if (grade <= 4) return ['addition', 'subtraction', 'multiplication', 'division'];
  return ['addition', 'subtraction', 'multiplication', 'division', 'fractions', 'decimals'];
}
export const missions = [
  {
    title: 'The missing moonberries',
    short: 'Moonberry Meadow',
    skill: 'addition',
    story:
      'Milo’s moonberries have scattered across the woods! Gather them to bring the forest’s glow back.',
    action: 'Collect the moonberries',
    companion: 'Milo',
    reward: 'Moonberry lantern',
    item: 'lantern',
  },
  {
    title: 'A bridge for Pip',
    short: 'Pebble Bridge',
    skill: 'subtraction',
    story:
      'Pip is stuck on the other side of the stream. Find the missing planks and build a way across!',
    action: 'Build Pip’s bridge',
    companion: 'Pip',
    reward: 'Bridge builder badge',
    item: 'bridge',
  },
  {
    title: 'The great forest picnic',
    short: 'Picnic Hollow',
    skill: 'multiplication',
    story:
      'The forest friends are hungry! Help Milo pack equal groups of snacks for a magical picnic.',
    action: 'Pack the picnic',
    companion: 'Milo',
    reward: 'Picnic satchel',
    item: 'basket',
  },
  {
    title: 'Starlight delivery',
    short: 'Firefly Falls',
    skill: 'division',
    story:
      'Little fireflies have lost their light. Share the star sparks fairly so every firefly can glow again.',
    action: 'Light up the fireflies',
    companion: 'Lumi',
    reward: 'Firefly in a bottle',
    item: 'firefly',
  },
  {
    title: 'Wake the wishing tree',
    short: 'The Wishing Tree',
    skill: 'addition',
    story:
      'The oldest tree in Numberia is asleep. Use everything you’ve learned to return its five magic leaves.',
    action: 'Wake the wishing tree',
    companion: 'Milo',
    reward: 'Woodland guardian crown',
    item: 'crown',
  },
] as const;
export function missionSkill(grade: Grade, index: number): Skill {
  if (grade === 5 && index === 3) return 'fractions';
  if (grade === 5 && index === 4) return 'decimals';
  const skill = missions[index % missions.length].skill;
  return availableSkills(grade).includes(skill) ? skill : index % 2 ? 'subtraction' : 'addition';
}
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
export function readSave(raw: string | null): Save {
  if (!raw)
    return { ...defaultSave, runs: [], claimed: [], clubhouse: freshClubhouse(), learning: {} };
  try {
    const data = JSON.parse(raw);
    if (
      data.version !== 1 ||
      !Number.isInteger(data.grade) ||
      data.grade < 0 ||
      data.grade > 5 ||
      !Array.isArray(data.runs)
    )
      throw new Error('Invalid save');
    const runs = data.runs.filter(
      (r: Run) =>
        r &&
        typeof r.id === 'string' &&
        typeof r.date === 'string' &&
        Number.isInteger(r.grade) &&
        r.grade >= 0 &&
        r.grade <= 5 &&
        Number.isInteger(r.mission) &&
        r.mission >= 0 &&
        r.mission < 5 &&
        availableSkills(r.grade).includes(r.skill) &&
        Number.isInteger(r.stars) &&
        r.stars >= 1 &&
        r.stars <= 3 &&
        Number.isInteger(r.unassisted) &&
        r.unassisted >= 0 &&
        r.unassisted <= 5 &&
        Number.isFinite(r.xp) &&
        r.xp >= 0 &&
        typeof r.practice === 'boolean',
    );
    return {
      version: 1,
      name: typeof data.name === 'string' ? data.name.slice(0, 24) || 'Explorer' : 'Explorer',
      grade: data.grade,
      xp: Number.isFinite(data.xp) ? Math.max(0, data.xp) : 0,
      gems: Number.isFinite(data.gems) ? Math.max(0, Math.floor(data.gems)) : 0,
      runs,
      sound: data.sound === true,
      companion: ['Milo', 'Pip', 'Lumi'].includes(data.companion) ? data.companion : 'Milo',
      claimed: Array.isArray(data.claimed)
        ? data.claimed.filter((s: unknown) => typeof s === 'string')
        : [],
      clubhouse: readClubhouse(data.clubhouse),
      learning: readLearning(data.learning),
    };
  } catch {
    return { ...defaultSave, runs: [], claimed: [], clubhouse: freshClubhouse(), learning: {} };
  }
}
export function completedMissions(save: Save): number[] {
  return [
    ...new Set(
      save.runs.filter((r) => r.grade === save.grade && !r.practice).map((r) => r.mission),
    ),
  ];
}
export function nextMission(save: Save): number {
  const completed = completedMissions(save);
  return missions.findIndex((_, i) => !completed.includes(i)) === -1
    ? 4
    : missions.findIndex((_, i) => !completed.includes(i));
}
export function recordRun(save: Save, run: Run): Save {
  if (save.runs.some((r) => r.id === run.id)) return save;
  return {
    ...save,
    xp: save.xp + run.xp,
    gems: save.gems + run.stars * 5,
    runs: [...save.runs, run],
  };
}
export function streak(runs: Run[], today = new Date()): number {
  const days = new Set(runs.map((r) => r.date));
  const date = new Date(today);
  date.setHours(12, 0, 0, 0);
  if (!days.has(dateKey(date))) date.setDate(date.getDate() - 1);
  let count = 0;
  while (days.has(dateKey(date))) {
    count++;
    date.setDate(date.getDate() - 1);
  }
  return count;
}
