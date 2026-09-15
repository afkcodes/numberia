import type { ClubhouseSave } from '../clubhouse.ts';
import type { LearningMemory } from '../learning.ts';
import type { ReadingProgress } from '../reading/progress.ts';
export type Grade = 0 | 1 | 2 | 3 | 4 | 5;
export type WorldId = 'woods' | 'crystal';
export type Skill =
  | 'addition'
  | 'subtraction'
  | 'multiplication'
  | 'division'
  | 'fractions'
  | 'decimals';
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
  world: WorldId;
  gems: number;
  runs: Run[];
  sound: boolean;
  companion: string;
  claimed: string[];
  clubhouse: ClubhouseSave;
  learning: LearningMemory;
  reading: ReadingProgress;
};
