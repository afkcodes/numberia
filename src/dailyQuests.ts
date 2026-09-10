import { dateKey, type Save, type Skill } from './game.ts';

export type DailyQuest = {
  id: 'mission' | 'practice' | 'stars';
  key: string;
  label: string;
  desc: string;
  progress: number;
  total: number;
  reward: number;
  skill?: Skill;
};

export function getDailyQuests(save: Save, today = dateKey()): DailyQuest[] {
  const runs = save.runs.filter((run) => run.date === today);
  return [
    {
      id: 'mission',
      key: `${today}:mission`,
      label: 'A little adventure',
      desc: 'Complete a story mission',
      progress: Math.min(1, runs.filter((run) => !run.practice).length),
      total: 1,
      reward: 10,
    },
    {
      id: 'practice',
      key: `${today}:practice`,
      label: 'Make some magic',
      desc: 'Try a round at practice camp',
      progress: Math.min(1, runs.filter((run) => run.practice).length),
      total: 1,
      reward: 10,
      skill: 'addition',
    },
    {
      id: 'stars',
      key: `${today}:stars`,
      label: 'Reach for the stars',
      desc: 'Earn 6 adventure stars',
      progress: Math.min(
        6,
        runs.reduce((total, run) => total + run.stars, 0),
      ),
      total: 6,
      reward: 15,
    },
  ];
}

export function claimDailyQuest(save: Save, key: string, today: string): Save {
  const quest = getDailyQuests(save, today).find((task) => task.key === key);
  if (!quest || quest.progress < quest.total || save.claimed.includes(key)) return save;
  return { ...save, gems: save.gems + quest.reward, claimed: [...save.claimed, key] };
}
