import { availableSkills } from './game/missions.ts';
import { makeProblem } from './game/questions.ts';
import type { Grade, Problem, Save, Skill } from './game/types.ts';

export type ReviewFact = { key: string; problem: Problem; dueAfter: number };
export type SkillMemory = {
  level: number;
  independentStreak: number;
  completed: number;
  supported: number;
  lastPlayed: string;
  reviews: ReviewFact[];
  seen: string[];
};
export type LearningMemory = Record<string, SkillMemory>;
export type LearningObservation = {
  id: string;
  grade: Grade;
  problem: Problem;
  supported: boolean;
  date: string;
};
export const memoryKey = (grade: Grade, skill: Skill) => `${grade}:${skill}`;
export const factKey = (p: Problem) => `${p.skill}:${p.a}:${p.b}:${p.denominator || 0}`;
export const freshMemory = (): SkillMemory => ({
  level: 0,
  independentStreak: 0,
  completed: 0,
  supported: 0,
  lastPlayed: '',
  reviews: [],
  seen: [],
});
export const skillMemory = (save: Save, skill: Skill) =>
  save.learning[memoryKey(save.grade, skill)] || freshMemory();
const count = (n: unknown, max = 1000000) =>
  typeof n === 'number' && Number.isFinite(n) ? Math.max(0, Math.min(max, Math.floor(n))) : 0;
function validFact(value: unknown, skill: Skill): Problem | null {
  if (!value || typeof value !== 'object') return null;
  const p = value as Problem;
  if (
    p.skill !== skill ||
    ![p.a, p.b, p.answer].every((n) => Number.isFinite(n) && n >= 0 && n <= 10000)
  )
    return null;
  const expected =
    skill === 'subtraction'
      ? p.a - p.b
      : skill === 'multiplication'
        ? p.a * p.b
        : skill === 'division'
          ? p.a / p.b
          : p.a + p.b;
  if (Math.abs(expected - p.answer) > 1e-8) return null;
  if (
    skill === 'decimals' &&
    ![p.a, p.b, p.answer].every((n) => Math.abs(n * 10 - Math.round(n * 10)) < 1e-8)
  )
    return null;
  if (skill !== 'decimals' && ![p.a, p.b, p.answer].every(Number.isInteger)) return null;
  if (
    skill === 'fractions' &&
    (!Number.isInteger(p.denominator) ||
      p.denominator! < 2 ||
      p.denominator! > 12 ||
      p.answer > p.denominator!)
  )
    return null;
  if (skill === 'division' && (!p.b || p.b > 12 || p.answer > 12)) return null;
  if (skill === 'multiplication' && (p.a > 12 || p.b > 12)) return null;
  const denominator = skill === 'fractions' ? p.denominator : undefined;
  const symbol =
    skill === 'subtraction'
      ? '−'
      : skill === 'multiplication'
        ? '×'
        : skill === 'division'
          ? '÷'
          : '+';
  const format = (n: number) =>
    denominator ? `${n}/${denominator}` : skill === 'decimals' ? n.toFixed(1) : `${n}`;
  const choices = [p.answer];
  for (const offset of [1, -1, 2, -2, 3, -3, 4, -4]) {
    const n = Math.round((p.answer + offset * (skill === 'decimals' ? 0.1 : 1)) * 10) / 10;
    if (n >= 0 && (!denominator || n <= denominator)) choices.push(n);
    if (choices.length === 4) break;
  }
  return {
    a: p.a,
    b: p.b,
    answer: p.answer,
    skill,
    denominator,
    equation: `${format(p.a)} ${symbol} ${format(p.b)}`,
    choices,
    hint: 'Let’s build it and count together.',
  };
}
export function readLearning(raw: unknown): LearningMemory {
  const result: LearningMemory = {};
  if (!raw || typeof raw !== 'object') return result;
  for (let grade = 0; grade <= 5; grade++)
    for (const skill of availableSkills(grade as Grade)) {
      const key = memoryKey(grade as Grade, skill),
        data = (raw as Record<string, Partial<SkillMemory>>)[key];
      if (!data || typeof data !== 'object') continue;
      const completed = count(data.completed);
      const reviews: ReviewFact[] = [];
      if (Array.isArray(data.reviews))
        for (const fact of data.reviews.slice(-8)) {
          const problem = validFact(fact?.problem, skill);
          if (problem && !reviews.some((r) => r.key === factKey(problem)))
            reviews.push({
              key: factKey(problem),
              problem,
              dueAfter: count(fact.dueAfter, completed + 3),
            });
        }
      result[key] = {
        level: count(data.level, 4),
        independentStreak: count(data.independentStreak, 1),
        completed,
        supported: count(data.supported, completed),
        lastPlayed: typeof data.lastPlayed === 'string' ? data.lastPlayed.slice(0, 10) : '',
        reviews,
        seen: Array.isArray(data.seen)
          ? data.seen.filter((id) => typeof id === 'string').slice(-100)
          : [],
      };
    }
  return result;
}
/** Only a completed discovery is remembered. Help changes practice, never rewards. */
export function rememberDiscovery(save: Save, observation: LearningObservation): Save {
  const { grade, problem, supported, id, date } = observation;
  const key = memoryKey(grade, problem.skill),
    memory = save.learning[key] || freshMemory();
  if (memory.seen.includes(id) || !availableSkills(grade).includes(problem.skill)) return save;
  const completed = memory.completed + 1,
    streak = supported ? 0 : memory.independentStreak + 1;
  const reviews = memory.reviews.filter((r) => r.key !== factKey(problem));
  if (supported) reviews.push({ key: factKey(problem), problem, dueAfter: completed + 2 });
  const next: SkillMemory = {
    level: Math.max(0, Math.min(4, memory.level + (supported ? -1 : streak >= 2 ? 1 : 0))),
    independentStreak: streak >= 2 ? 0 : streak,
    completed,
    supported: memory.supported + Number(supported),
    lastPlayed: date,
    reviews: reviews.slice(-8),
    seen: [...memory.seen, id].slice(-100),
  };
  return { ...save, learning: { ...save.learning, [key]: next } };
}
export function nextDiscovery(
  save: Save,
  skill: Skill,
  turn: number,
  reviewed: string[] = [],
  rng = Math.random,
) {
  const memory = skillMemory(save, skill);
  const review =
    turn % 2 === 1
      ? memory.reviews.find((r) => r.dueAfter <= memory.completed && !reviewed.includes(r.key))
      : undefined;
  if (review) {
    const choices = [...review.problem.choices];
    for (let i = choices.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [choices[i], choices[j]] = [choices[j], choices[i]];
    }
    return {
      problem: { ...review.problem, choices },
      reviewKey: review.key,
      welcome: 'A little “again” makes your brain stronger. Let’s try this one together!',
    };
  }
  const level = turn === 0 && memory.completed ? Math.max(0, memory.level - 1) : memory.level;
  return {
    problem: makeProblem(save.grade, skill, level, rng),
    reviewKey: undefined,
    welcome: memory.completed
      ? 'Welcome back! A little warm-up, then we’ll keep growing where you left off.'
      : 'Let’s build it, try it, and discover together!',
  };
}
export function recommendedSkill(save: Save): Skill {
  const skills = availableSkills(save.grade);
  return [...skills].sort((a, b) => {
    const x = skillMemory(save, a),
      y = skillMemory(save, b);
    return (
      Number(y.reviews.length > 0) - Number(x.reviews.length > 0) ||
      x.lastPlayed.localeCompare(y.lastPlayed) ||
      x.completed - y.completed
    );
  })[0];
}
