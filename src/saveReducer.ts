import { chooseRoomItem } from './clubhouse.ts';
import { claimDailyQuest } from './dailyQuests.ts';
import { recordRun, type Grade, type Run, type Save, type WorldId } from './game.ts';
import { rememberDiscovery, type LearningObservation } from './learning.ts';
import { finishReading, type ReadingCompletion } from './reading/progress.ts';
import { editions, type ReadingBand } from './reading/content.ts';

export type SaveAction =
  | { type: 'grade-changed'; grade: Grade }
  | { type: 'world-changed'; world: WorldId }
  | { type: 'explorer-renamed'; name: string }
  | { type: 'companion-changed'; companion: string }
  | { type: 'sound-toggled' }
  | { type: 'decoration-chosen'; id: string }
  | { type: 'pet-renamed'; name: string }
  | { type: 'daily-reward-claimed'; key: string; today: string }
  | { type: 'quest-completed'; run: Run }
  | { type: 'discovery-learned'; observation: LearningObservation }
  | { type: 'reading-completed'; completion: ReadingCompletion }
  | { type: 'reading-bookmarked'; band: ReadingBand; page: number };

/** All progress updates are pure, so React can safely replay reducer calls. */
export function saveReducer(save: Save, action: SaveAction): Save {
  switch (action.type) {
    case 'reading-completed':
      return finishReading(save, action.completion);
    case 'reading-bookmarked':
      if (
        !Object.hasOwn(editions, action.band) ||
        !Number.isInteger(action.page) ||
        action.page < 0 ||
        action.page >= editions[action.band].pages.length
      )
        return save;
      return {
        ...save,
        reading: {
          ...save.reading,
          bookmarks: { ...save.reading.bookmarks, [action.band]: action.page },
        },
      };
    case 'grade-changed':
      return { ...save, grade: action.grade };
    case 'world-changed':
      return { ...save, world: action.world };
    case 'explorer-renamed':
      return { ...save, name: action.name.trim().slice(0, 24) || 'Explorer' };
    case 'companion-changed':
      return { ...save, companion: action.companion };
    case 'sound-toggled':
      return { ...save, sound: !save.sound };
    case 'decoration-chosen':
      return chooseRoomItem(save, action.id);
    case 'pet-renamed':
      return { ...save, clubhouse: { ...save.clubhouse, petName: action.name } };
    case 'daily-reward-claimed':
      return claimDailyQuest(save, action.key, action.today);
    case 'quest-completed':
      return recordRun(save, action.run);
    case 'discovery-learned':
      return rememberDiscovery(save, action.observation);
  }
}
