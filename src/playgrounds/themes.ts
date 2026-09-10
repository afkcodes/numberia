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
    sky: 0xb8dce8,
    grass: 0x438b47,
    path: 0xdcb577,
    foliage: [0x176d43, 0x37994b, 0x75b942],
    accent: 0x9945e0,
    water: 0x29b9a4,
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
    sky: 0xb7dde8,
    grass: 0x39874d,
    path: 0xd7b47c,
    foliage: [0x126d52, 0x319b65, 0x70b74c],
    accent: 0xffb843,
    water: 0x17b8cb,
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
    sky: 0xc9e3e9,
    grass: 0x488d40,
    path: 0xe0b778,
    foliage: [0x246c42, 0x459845, 0x80b64c],
    accent: 0xff7547,
    water: 0x25b6af,
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
    invitation: 'Five golden leaves. One very happy tree.',
    description:
      'A living wishing garden with a friendly sleepy tree, an owl, blossom beds, and a star fountain. Tap the tree or fountain to send a wish into its heart.',
    toyLabel: 'Make a little wish',
    toyResponse: 'Your wish is on its way! Watch the little star fly into the tree’s heart.',
    progressNoun: 'wishing leaves awake',
    discoveries: [
      'One golden leaf! A garden lantern is glowing!',
      'Two leaves! The tree is opening its eyes!',
      'Three leaves! Look at our garden glow!',
      'Four leaves! Our sleepy friend is nearly awake!',
      'You woke the tree! Its little door is open!',
    ],
    sky: 0xb8dce8,
    grass: 0x357b42,
    path: 0xd8ad73,
    foliage: [0x126c44, 0x309449, 0x74b843],
    accent: 0xffc54d,
    water: 0x1abbb8,
    night: false,
  },
];

export function playgroundTheme(index: number): PlaygroundTheme {
  return playgroundThemes[index] ?? playgroundThemes[0];
}

export function restorationCount(count: number): number {
  return Number.isFinite(count) ? Math.max(0, Math.min(5, Math.floor(count))) : 0;
}
