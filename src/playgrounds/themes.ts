export type CrystalPlaygroundId =
  | 'crystal-garden'
  | 'crystal-bridge'
  | 'shell-shore'
  | 'glow-cavern'
  | 'heart-sanctuary';
export type PlaygroundId =
  | 'moonberry'
  | 'bridge'
  | 'picnic'
  | 'firefly'
  | 'wishing'
  | CrystalPlaygroundId;

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
  {
    id: 'crystal-garden',
    name: 'Sparkle Springs',
    invitation: 'Little lights. Big-hearted discoveries.',
    description:
      'A terraced crystal amphitheater with four giant musical keys. Tap an answer to wake a note in the garden’s song.',
    toyLabel: 'Play the crystal chimes',
    toyResponse: 'Listen to the little crystals! Your garden has a song of its own.',
    progressNoun: 'singing crystals awake',
    discoveries: [
      'One crystal is singing!',
      'Two bright notes for our garden!',
      'Three crystals, one happy tune!',
      'Just one more note to find!',
      'The whole crystal garden is singing!',
    ],
    sky: 0xb8e1ed,
    grass: 0x287f7f,
    path: 0xe5c68c,
    foliage: [0x167b69, 0x39a573, 0x77bc68],
    accent: 0xaf67e1,
    water: 0x1bbcc7,
    night: false,
  },
  {
    id: 'crystal-bridge',
    name: 'Rainbow Crossing',
    invitation: 'A little bridge can bring friends together.',
    description:
      'An open turquoise lagoon with four sailing rafts. Deliver crystal cargo to build a rainbow crossing for Pip.',
    toyLabel: 'Send a rainbow ripple',
    toyResponse: 'Look at the colors dance! Pip can’t wait to cross your rainbow bridge.',
    progressNoun: 'rainbow bridge pieces',
    discoveries: [
      'Your first rainbow piece!',
      'Two colors are holding hands!',
      'Halfway to a happy hello!',
      'Pip is getting ready to cross!',
      'A rainbow road! Here comes Pip!',
    ],
    sky: 0xb5e0ea,
    grass: 0x358b78,
    path: 0xe3c58b,
    foliage: [0x167b69, 0x39a573, 0x77bc68],
    accent: 0xf18aac,
    water: 0x16b6c9,
    night: false,
  },
  {
    id: 'shell-shore',
    name: 'Seashell Shore',
    invitation: 'A sunny shore. A place for every friend.',
    description:
      'A golden beach with a striped lighthouse, a friendly sea turtle, and treasure shells that open to reveal glowing pearls.',
    toyLabel: 'Say hello to the turtle',
    toyResponse: 'Hello, little turtle! There is a place at our picnic for you too.',
    progressNoun: 'seashell plates ready',
    discoveries: [
      'One little picnic plate!',
      'Treats for two friends!',
      'Three tasty little discoveries!',
      'Our beach picnic is nearly ready!',
      'A seaside feast for everyone!',
    ],
    sky: 0xbfe4ef,
    grass: 0xb99761,
    path: 0xe6c68d,
    foliage: [0x197c60, 0x409f68, 0x86b858],
    accent: 0xff936d,
    water: 0x1bbecb,
    night: false,
  },
  {
    id: 'glow-cavern',
    name: 'Glow Grotto',
    invitation: 'Even a tiny light can lead the way.',
    description:
      'A gentle amethyst cavern with glowing crystal pillars, drifting glowbugs, and five lanterns to light a safe path.',
    toyLabel: 'Call the little glowbugs',
    toyResponse: 'Here come the glowbugs! Follow their tiny lights through the crystal grotto.',
    progressNoun: 'grotto lanterns glowing',
    discoveries: [
      'One little light in the grotto!',
      'Two lanterns to lead the way!',
      'Three lights for our glowbug friends!',
      'The crystal cave is twinkling!',
      'Every glowbug has a light to follow!',
    ],
    sky: 0x202e55,
    grass: 0x35436b,
    path: 0x788b9e,
    foliage: [0x315d70, 0x477f8a, 0x6c91a5],
    accent: 0xcaa0ff,
    water: 0x247eab,
    night: true,
  },
  {
    id: 'heart-sanctuary',
    name: 'Heartlight Haven',
    invitation: 'Five kind little discoveries. One great big glow.',
    description:
      'A rose-quartz temple with four turning mirrors. Send colorful light beams to wake a friendly heart crystal.',
    toyLabel: 'Send a little kindness',
    toyResponse: 'A little kindness goes a long way! Watch your wish circle the heart crystal.',
    progressNoun: 'kindness crystals glowing',
    discoveries: [
      'One little kindness crystal!',
      'Two warm wishes for our friends!',
      'Three crystals. Feel the cove glowing!',
      'One more discovery for our heart!',
      'You woke the heart of Crystal Cove!',
    ],
    sky: 0xc2dfe9,
    grass: 0x317d70,
    path: 0xe2bd8d,
    foliage: [0x14765a, 0x37a06c, 0x78b45e],
    accent: 0xf269ab,
    water: 0x22b8bd,
    night: false,
  },
];

export function playgroundTheme(index: number): PlaygroundTheme {
  return playgroundThemes[index] ?? playgroundThemes[0];
}

export function restorationCount(count: number): number {
  return Number.isFinite(count) ? Math.max(0, Math.min(5, Math.floor(count))) : 0;
}
