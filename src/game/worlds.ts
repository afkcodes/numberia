import type { WorldId } from './types.ts';

type WorldDefinition = {
  id: WorldId;
  name: string;
  number: string;
  chapters: readonly number[];
  art: string;
  artDescription: string;
  description: string;
  invitation: string;
  enterLabel: string;
  heroTitle: string;
};

export const worlds: readonly WorldDefinition[] = [
  {
    id: 'woods',
    name: 'Whispering Woods',
    number: '01',
    chapters: [0, 1, 2, 3, 4],
    art: '/art/whispering-woods.png',
    artDescription: 'A winding woodland trail over a turquoise stream to a magical treehouse',
    description: 'Milo, moonberries, and a little woodland magic.',
    invitation: 'Every step brings the forest to life.',
    enterLabel: 'Into the woods!',
    heroTitle: 'woodland hero!',
  },
  {
    id: 'crystal',
    name: 'Crystal Cove',
    number: '02',
    chapters: [5, 6, 7, 8, 9],
    art: '/art/crystal-cove.png',
    artDescription:
      'A sparkling turquoise cove with crystal gardens, a rainbow bridge, a shell beach, a glowing cavern, and a heart-crystal sanctuary',
    description: 'Shimmering shores, crystal wishes, and kindness to share.',
    invitation: 'Every discovery brings a little sparkle back.',
    enterLabel: 'To the crystal cove!',
    heroTitle: 'crystal explorer!',
  },
];

export function getWorld(id: WorldId): WorldDefinition {
  return worlds.find((world) => world.id === id) ?? worlds[0];
}

export function worldForMission(index: number): WorldDefinition {
  return worlds.find((world) => world.chapters.includes(index)) ?? worlds[0];
}
