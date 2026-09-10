export type PlaygroundId = 'moonberry' | 'bridge' | 'picnic' | 'firefly' | 'wishing';

export type PlaygroundTheme = {
  id: PlaygroundId;
  name: string;
  invitation: string;
  description: string;
  toyLabel: string;
  toyResponse: string;
  progressNoun: string;
  discoveries: readonly [string, string, string, string, string];
  sky: number;
  grass: number;
  path: number;
  foliage: readonly [number, number, number];
  accent: number;
  water: number;
  night: boolean;
};

export const playgroundThemes: readonly PlaygroundTheme[] = [
  {
    id: 'moonberry',
    name: 'Moonberry Meadow',
    invitation: 'A sunbeam. A berry. A little bit of magic.',
    description:
      'A flower-filled berry garden with a tiny garden cottage, butterflies, and a moonberry lantern arch.',
    toyLabel: 'Wake the moonberries',
    toyResponse: 'Hello, little moonberries! The whole garden is sparkling.',
    progressNoun: 'berry lanterns glowing',
    discoveries: [
      'One little lantern is glowing!',
      'Two lights for the butterflies!',
      'The garden is getting its glow back!',
      'Almost a whole rainbow of berries!',
      'You brought the moonberries home!',
    ],
    sky: 0xe8efce,
    grass: 0x91c969,
    path: 0xffe3a1,
    foliage: [0x28845c, 0x64b365, 0xa0d46c],
    accent: 0xab75e2,
    water: 0x8bd2bd,
    night: false,
  },
  {
    id: 'bridge',
    name: 'Pebble Bridge',
    invitation: 'A babbling brook. A brave little builder.',
    description:
      'A turquoise riverside with a waterwheel, pebble banks, jumping fish, and Pip waiting beside his unfinished bridge.',
    toyLabel: 'Say hello to Pip',
    toyResponse: 'Pip says hello! Every little discovery brings his bridge closer.',
    progressNoun: 'bridge pieces built',
    discoveries: [
      'Your first bridge piece is in!',
      'Pip can see the path growing!',
      'Three strong pieces. Keep building!',
      'One more discovery for Pip!',
      'You built a bridge! Here comes Pip!',
    ],
    sky: 0xd7ece4,
    grass: 0x92c680,
    path: 0xf8dc97,
    foliage: [0x268c7e, 0x62b499, 0x9dcc77],
    accent: 0xffb843,
    water: 0x39c9d3,
    night: false,
  },
  {
    id: 'picnic',
    name: 'Picnic Hollow',
    invitation: 'Come hungry. Bring a little curiosity.',
    description:
      'A sunny woodland party with a striped picnic canopy, bunting, a playground, and baskets for every forest friend.',
    toyLabel: 'Ring the picnic bell',
    toyResponse: 'Ding, ding! There is a place at the picnic for every friend.',
    progressNoun: 'picnic baskets packed',
    discoveries: [
      'The first picnic basket is ready!',
      'A little feast for two friends!',
      'More friends can join the picnic!',
      'The table is nearly ready!',
      'You made a picnic for everyone!',
    ],
    sky: 0xffecd0,
    grass: 0x95c771,
    path: 0xffdc91,
    foliage: [0x518263, 0x83a96b, 0xa7bf7b],
    accent: 0xff9870,
    water: 0x7ccbbc,
    night: false,
  },
  {
    id: 'firefly',
    name: 'Firefly Falls',
    invitation: 'When the sun goes down, little lights wake up.',
    description:
      'A gentle twilight forest with a glowing waterfall, moonlit mushrooms, floating fireflies, and five lanterns waiting for their light.',
    toyLabel: 'Call the fireflies',
    toyResponse: 'Here they come! Even the tiniest light can make a little magic.',
    progressNoun: 'firefly lanterns lit',
    discoveries: [
      'One little light in the twilight!',
      'Two lanterns for the lost fireflies!',
      'The waterfall is sparkling!',
      'Lumi can almost see the way home!',
      'Every firefly has a light again!',
    ],
    sky: 0x253961,
    grass: 0x327e77,
    path: 0x7daf9e,
    foliage: [0x1d6274, 0x258e8c, 0x59aaa1],
    accent: 0xffd360,
    water: 0x309fcb,
    night: true,
  },
  {
    id: 'wishing',
    name: 'The Wishing Tree',
    invitation: 'Little discoveries can wake the oldest magic.',
    description:
      'An ancient storybook tree with curling roots, a tiny golden door, blossom gardens, and five magical leaves in its crown.',
    toyLabel: 'Make a little wish',
    toyResponse: 'A wish for you: keep wondering, keep trying, and keep growing!',
    progressNoun: 'wishing leaves awake',
    discoveries: [
      'The first golden leaf is awake!',
      'Two little wishes in the branches!',
      'The old tree is waking up!',
      'Can you feel the forest cheering?',
      'You woke the wishing tree!',
    ],
    sky: 0xeee2db,
    grass: 0xa1cd82,
    path: 0xffe3a7,
    foliage: [0x4aa986, 0x83c795, 0xb7d779],
    accent: 0xffc54d,
    water: 0x9dcfca,
    night: false,
  },
];

export function playgroundTheme(index: number): PlaygroundTheme {
  return playgroundThemes[index] ?? playgroundThemes[0];
}

export function restorationCount(count: number): number {
  return Number.isFinite(count) ? Math.max(0, Math.min(5, Math.floor(count))) : 0;
}
