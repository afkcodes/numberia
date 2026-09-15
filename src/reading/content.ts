import type { Grade } from '../game/types.ts';

export type ReadingBand = 'sprout' | 'trail' | 'soar';
export type StoryAction = 'wind' | 'hop' | 'duck' | 'home' | 'spin' | 'tiptoe';
export type StoryPage = {
  id: string;
  title: string;
  text: string;
  action: StoryAction;
  aside: string;
};
export type StoryEdition = {
  band: ReadingBand;
  label: string;
  skill: string;
  build: {
    word: string;
    parts: string[];
    choices: string[];
    missing: number;
    clue: string;
    explanation: string;
  };
  pages: StoryPage[];
};

export const storyId = 'runaway-hat';
export const storyTitle = 'The hat that wouldn’t stay put';
export const bandForGrade = (grade: Grade): ReadingBand =>
  grade <= 1 ? 'sprout' : grade <= 3 ? 'trail' : 'soar';
export const editions: Record<ReadingBand, StoryEdition> = {
  sprout: {
    band: 'sprout',
    label: 'Little lines',
    skill: 'Short words · a little story',
    build: {
      word: 'hat',
      parts: ['h', 'a', 't'],
      choices: ['i', 'a', 'o'],
      missing: 1,
      clue: 'Make hat. It has the same ending as cat.',
      explanation: 'Hat, cat, mat. They share the letters a and t, and the same ending sound.',
    },
    pages: [
      {
        id: 'sprout-wind',
        title: 'Oh! Off it goes.',
        text: 'Pip has a red hat. A gust lifts it up.',
        action: 'wind',
        aside: 'A gust is a quick push of wind.',
      },
      {
        id: 'sprout-hop',
        title: 'One little hop…',
        text: 'The hat lands on a log. Pip hops to the log.',
        action: 'hop',
        aside: 'Read the line. Then help Pip hop!',
      },
      {
        id: 'sprout-duck',
        title: 'A very helpful duck.',
        text: 'The hat dips in the pond. A duck nudges it back.',
        action: 'duck',
        aside: 'Nudges means gives a gentle push.',
      },
      {
        id: 'sprout-home',
        title: 'A knot does the trick.',
        text: 'Pip ties a ribbon to his hat. Now it stays put!',
        action: 'home',
        aside: 'Stays put means stays in one place.',
      },
    ],
  },
  trail: {
    band: 'trail',
    label: 'Growing stories',
    skill: 'Word patterns · finding clues',
    build: {
      word: 'drifting',
      parts: ['drift', 'ing'],
      choices: ['ed', 'ing', 's'],
      missing: 1,
      clue: 'The hat is drifting. Add the ending that shows it is happening now.',
      explanation: 'Drift becomes drifting when we add ing. Drifting means moving gently along.',
    },
    pages: [
      {
        id: 'trail-wind',
        title: 'The wind has other plans.',
        text: 'Pip wore his favorite red hat to the picnic. A sudden gust sent it drifting over the hill.',
        action: 'wind',
        aside: 'A gust is a sudden, strong burst of wind.',
      },
      {
        id: 'trail-hop',
        title: 'Almost within reach.',
        text: 'The hat landed on a mossy log beside the pond. Pip hopped closer, but the wind was quicker.',
        action: 'hop',
        aside: 'Where did the hat land? Keep that clue in mind.',
      },
      {
        id: 'trail-duck',
        title: 'An unexpected helper.',
        text: 'Splash! The hat floated past a curious duck. She nudged it toward Pip with her beak.',
        action: 'duck',
        aside: 'Nudged means pushed gently. Watch how she helps.',
      },
      {
        id: 'trail-home',
        title: 'Pip has a bright idea.',
        text: 'Pip tied a ribbon beneath his chin to hold the hat in place. This time, the wind could only tickle his ears.',
        action: 'home',
        aside: 'What did Pip change to solve his problem?',
      },
    ],
  },
  soar: {
    band: 'soar',
    label: 'Bigger discoveries',
    skill: 'Word parts · reading between the lines',
    build: {
      word: 'unpredictable',
      parts: ['un', 'predict', 'able'],
      choices: ['re', 'un', 'pre'],
      missing: 0,
      clue: 'Predictable means you can tell what will happen. Which beginning makes it mean the opposite?',
      explanation:
        'Un means not. Unpredictable means you cannot easily tell what will happen next.',
    },
    pages: [
      {
        id: 'soar-wind',
        title: 'An unpredictable afternoon.',
        text: 'Pip expected a peaceful picnic, but the weather had other plans. An unpredictable gust snatched his red hat and carried it beyond the hill.',
        action: 'wind',
        aside: 'How does the weather change Pip’s plans?',
      },
      {
        id: 'soar-hop',
        title: 'A promising landing.',
        text: 'The hat settled on a mossy log beside the pond. Pip approached cautiously; one careless movement might send it tumbling into the water.',
        action: 'hop',
        aside: 'Cautiously means carefully, to avoid a problem.',
      },
      {
        id: 'soar-duck',
        title: 'Help from an expert swimmer.',
        text: 'Before Pip could reach it, another breeze tipped the hat into the pond. A duck noticed his worried expression and nudged it gently toward the bank.',
        action: 'duck',
        aside: 'What suggests the duck is trying to help?',
      },
      {
        id: 'soar-home',
        title: 'A small change. A clever solution.',
        text: 'Rather than chasing his hat all afternoon, Pip fastened a ribbon beneath his chin. He could not control the wind, but he could change how securely his hat stayed on.',
        action: 'home',
        aside: 'Explain how Pip solved the cause of his problem.',
      },
    ],
  },
};

export const remixes: {
  id: string;
  word: string;
  text: string;
  action: StoryAction;
  label: string;
}[] = [
  {
    id: 'remix-hop',
    word: 'hops',
    text: 'Pip hops in his red hat.',
    action: 'hop',
    label: 'Little hops',
  },
  {
    id: 'remix-spin',
    word: 'spins',
    text: 'Pip spins in his red hat.',
    action: 'spin',
    label: 'A happy twirl',
  },
  {
    id: 'remix-tiptoe',
    word: 'tiptoes',
    text: 'Pip tiptoes in his red hat.',
    action: 'tiptoe',
    label: 'Quiet little steps',
  },
];

export const wordHelp: Record<string, string> = {
  pip: 'Pip is our little dragon friend.',
  hat: 'A hat is something you wear on your head.',
  gust: 'A gust is a sudden push of wind.',
  lifts: 'Lifts means moves something up.',
  log: 'A log is a thick piece of a tree trunk.',
  hops: 'Hops means makes little jumps.',
  dips: 'Dips means goes down into something for a moment.',
  pond: 'A pond is a small area of water.',
  nudges: 'Nudges means gives a gentle push.',
  nudged: 'Nudged means pushed gently.',
  ribbon: 'A ribbon is a narrow strip of cloth. Pip uses it to hold his hat on.',
  ties: 'Ties means joins something with a knot.',
  put: 'Stays put means stays in one place.',
  drifting: 'Drifting means moving gently along.',
  mossy: 'Mossy means covered in soft green moss.',
  curious: 'Curious means wanting to find out more.',
  beak: 'A beak is a bird’s hard mouth.',
  beneath: 'Beneath means under.',
  unpredictable: 'Unpredictable means hard to guess ahead of time.',
  cautiously: 'Cautiously means carefully, to avoid a problem.',
  tumbling: 'Tumbling means falling and turning over.',
  expression: 'Your expression is the feeling your face shows.',
  bank: 'Here, bank means the land at the edge of the water.',
  fastened: 'Fastened means attached firmly.',
  securely: 'Securely means firmly, so something stays in place.',
  spins: 'Spins means turns around.',
  tiptoes: 'Tiptoes means walks quietly on the front of the feet.',
};

export function wordsIn(text: string) {
  return text.match(/\S+/g) ?? [];
}
export function normalWord(word: string) {
  return word
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9']/g, '');
}
