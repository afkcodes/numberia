import type { Problem } from './game';

export function answerNarration(p: Problem): string {
  if (p.skill === 'subtraction')
    return `${p.a} minus ${p.b} equals ${p.answer}. ${p.answer} berries are left!`;
  if (p.skill === 'multiplication')
    return `${p.a} groups of ${p.b} make ${p.answer}. ${p.a} times ${p.b} equals ${p.answer}!`;
  if (p.skill === 'division')
    return `${p.a} shared between ${p.b} baskets is ${p.answer} in each basket. ${p.a} divided by ${p.b} equals ${p.answer}!`;
  if (p.skill === 'fractions')
    return `${p.a} over ${p.denominator}, plus ${p.b} over ${p.denominator}, equals ${p.answer} over ${p.denominator}. You put the pieces together!`;
  if (p.skill === 'decimals')
    return `${p.a.toFixed(1)} plus ${p.b.toFixed(1)} equals ${p.answer.toFixed(1)}. The little numbers add up!`;
  return `${p.a} plus ${p.b} equals ${p.answer}. ${p.answer} berries altogether!`;
}
