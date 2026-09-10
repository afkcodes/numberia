import type { Skill } from '../game';
export const skillDetails: Record<
  Skill,
  { symbol: string; title: string; description: string; className: string }
> = {
  addition: {
    symbol: '+',
    title: 'Better together',
    description: 'Bring groups together and watch them grow.',
    className: 'green',
  },
  subtraction: {
    symbol: '−',
    title: 'A little less',
    description: 'Take some away. Discover what stays.',
    className: 'peach',
  },
  multiplication: {
    symbol: '×',
    title: 'Groups of magic',
    description: 'Make equal groups. Find a faster way to count.',
    className: 'lilac',
  },
  division: {
    symbol: '÷',
    title: 'A fair share',
    description: 'Share the magic so everyone gets the same.',
    className: 'blue',
  },
  fractions: {
    symbol: '½',
    title: 'Pieces of a whole',
    description: 'Put equal pieces together to make something whole.',
    className: 'peach',
  },
  decimals: {
    symbol: '.1',
    title: 'The little numbers',
    description: 'Explore the wonderful world between whole numbers.',
    className: 'lilac',
  },
};
