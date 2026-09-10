import type { Grade, Skill } from './types.ts';
export const gradeLabel = (grade: Grade) => (grade === 0 ? 'Kindergarten' : `Grade ${grade}`);
export function availableSkills(grade: Grade): Skill[] {
  if (grade <= 2) return ['addition', 'subtraction'];
  if (grade <= 4) return ['addition', 'subtraction', 'multiplication', 'division'];
  return ['addition', 'subtraction', 'multiplication', 'division', 'fractions', 'decimals'];
}
export const missions = [
  {
    title: 'The missing moonberries',
    short: 'Moonberry Meadow',
    skill: 'addition',
    story:
      'Milo’s moonberries have scattered across the woods! Gather them to bring the forest’s glow back.',
    action: 'Collect the moonberries',
    companion: 'Milo',
    reward: 'Moonberry lantern',
    item: 'lantern',
  },
  {
    title: 'A bridge for Pip',
    short: 'Pebble Bridge',
    skill: 'subtraction',
    story:
      'Pip is stuck on the other side of the stream. Find the missing planks and build a way across!',
    action: 'Build Pip’s bridge',
    companion: 'Pip',
    reward: 'Bridge builder badge',
    item: 'bridge',
  },
  {
    title: 'The great forest picnic',
    short: 'Picnic Hollow',
    skill: 'multiplication',
    story:
      'The forest friends are hungry! Help Milo pack equal groups of snacks for a magical picnic.',
    action: 'Pack the picnic',
    companion: 'Milo',
    reward: 'Picnic satchel',
    item: 'basket',
  },
  {
    title: 'Starlight delivery',
    short: 'Firefly Falls',
    skill: 'division',
    story:
      'Little fireflies have lost their light. Share the star sparks fairly so every firefly can glow again.',
    action: 'Light up the fireflies',
    companion: 'Lumi',
    reward: 'Firefly in a bottle',
    item: 'firefly',
  },
  {
    title: 'Wake the wishing tree',
    short: 'The Wishing Tree',
    skill: 'addition',
    story:
      'The oldest tree in Numberia is asleep. Use everything you’ve learned to return its five magic leaves.',
    action: 'Wake the wishing tree',
    companion: 'Milo',
    reward: 'Woodland guardian crown',
    item: 'crown',
  },
] as const;
export function missionSkill(grade: Grade, index: number): Skill {
  if (grade === 5 && index === 3) return 'fractions';
  if (grade === 5 && index === 4) return 'decimals';
  const skill = missions[index % missions.length].skill;
  return availableSkills(grade).includes(skill) ? skill : index % 2 ? 'subtraction' : 'addition';
}
