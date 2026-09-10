import type { Skill } from '../game';

export type Overlay = 'profile' | 'parents' | 'worlds' | 'help' | 'grades' | 'daily' | null;
export type ActiveQuest = { id: string; index: number; practiceSkill?: Skill };
