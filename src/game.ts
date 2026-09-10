import { freshClubhouse, readClubhouse } from './clubhouse.ts';
import { availableSkills, missions } from './game/missions.ts';
import type { Save, Run } from './game/types.ts';
import { readLearning } from './learning.ts';

// Stable public entry point; internal game modules avoid importing this barrel.
export type { Grade, Skill, Problem, Run, Save } from './game/types.ts';
export { gradeLabel, availableSkills, missions, missionSkill } from './game/missions.ts';
export { makeProblem } from './game/questions.ts';

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

export const dateKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

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
