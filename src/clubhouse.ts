import type { Save } from './game';

export type RoomSlot = 'rug' | 'seat' | 'flowers' | 'outfit' | 'play';
export type ClubhouseSave = {
  owned: string[];
  equipped: Partial<Record<RoomSlot, string>>;
  petName: string;
};
export const roomItems = [
  {
    id: 'leaf-rug',
    name: 'Leafy landing',
    slot: 'rug',
    price: 0,
    detail: 'A soft spot for little paws.',
  },
  {
    id: 'star-rug',
    name: 'Stargazer rug',
    slot: 'rug',
    price: 15,
    detail: 'For dreaming up big adventures.',
  },
  {
    id: 'rainbow-rug',
    name: 'Rainbow roundabout',
    slot: 'rug',
    price: 25,
    detail: 'A whole rainbow under your toes.',
  },
  {
    id: 'mushroom-seat',
    name: 'Toadstool seat',
    slot: 'seat',
    price: 15,
    detail: 'Just the right size for a friend.',
  },
  {
    id: 'reading-chair',
    name: 'Storytime chair',
    slot: 'seat',
    price: 30,
    detail: 'One more story? Always.',
  },
  {
    id: 'daisies',
    name: 'Hello, daisies!',
    slot: 'flowers',
    price: 0,
    detail: 'Your very first patch of sunshine.',
  },
  {
    id: 'sunflowers',
    name: 'Sunny sunflowers',
    slot: 'flowers',
    price: 15,
    detail: 'Tall flowers with happy faces.',
  },
  {
    id: 'moonflowers',
    name: 'Moonberry blooms',
    slot: 'flowers',
    price: 25,
    detail: 'A little piece of the magical woods.',
  },
  {
    id: 'scarf',
    name: 'Adventure scarf',
    slot: 'outfit',
    price: 0,
    detail: 'Milo’s favorite forest green.',
  },
  {
    id: 'bow',
    name: 'Berry bow tie',
    slot: 'outfit',
    price: 10,
    detail: 'Looking berry wonderful!',
  },
  {
    id: 'explorer-hat',
    name: 'Explorer’s hat',
    slot: 'outfit',
    price: 20,
    detail: 'Ready for the next discovery.',
  },
  {
    id: 'crown',
    name: 'Little leaf crown',
    slot: 'outfit',
    price: 30,
    detail: 'For a kind woodland guardian.',
  },
  {
    id: 'pinwheel',
    name: 'Whirly pinwheel',
    slot: 'play',
    price: 0,
    detail: 'A little hello from the breeze.',
  },
  {
    id: 'swing',
    name: 'Cloud-nine swing',
    slot: 'play',
    price: 25,
    detail: 'A place to swing and daydream.',
  },
  {
    id: 'birdhouse',
    name: 'Tiny bird cottage',
    slot: 'play',
    price: 20,
    detail: 'Your garden has a new neighbor.',
  },
] as const satisfies readonly {
  id: string;
  name: string;
  slot: RoomSlot;
  price: number;
  detail: string;
}[];
export const freshClubhouse = (): ClubhouseSave => ({
  owned: roomItems.filter((i) => !i.price).map((i) => i.id),
  equipped: { rug: 'leaf-rug', flowers: 'daisies', outfit: 'scarf', play: 'pinwheel' },
  petName: 'Pebble',
});
export function readClubhouse(raw: unknown): ClubhouseSave {
  const fresh = freshClubhouse();
  if (!raw || typeof raw !== 'object') return fresh;
  const data = raw as Partial<ClubhouseSave>;
  const owned = [
    ...new Set([
      ...fresh.owned,
      ...(Array.isArray(data.owned)
        ? data.owned.filter((id) => roomItems.some((i) => i.id === id))
        : []),
    ]),
  ];
  const equipped = { ...fresh.equipped };
  for (const slot of ['rug', 'seat', 'flowers', 'outfit', 'play'] as const) {
    const id = data.equipped?.[slot];
    if (id && owned.includes(id) && roomItems.some((i) => i.id === id && i.slot === slot))
      equipped[slot] = id;
  }
  return {
    owned,
    equipped,
    petName:
      typeof data.petName === 'string' ? data.petName.trim().slice(0, 18) || 'Pebble' : 'Pebble',
  };
}
/** Atomic and idempotent: selecting owned decorations is always free. */
export function chooseRoomItem(save: Save, id: string): Save {
  const item = roomItems.find((i) => i.id === id);
  if (!item) return save;
  const owned = save.clubhouse.owned.includes(id);
  if (!owned && save.gems < item.price) return save;
  if (owned && save.clubhouse.equipped[item.slot] === id) return save;
  return {
    ...save,
    gems: save.gems - (owned ? 0 : item.price),
    clubhouse: {
      ...save.clubhouse,
      owned: owned ? save.clubhouse.owned : [...save.clubhouse.owned, id],
      equipped: { ...save.clubhouse.equipped, [item.slot]: id },
    },
  };
}
