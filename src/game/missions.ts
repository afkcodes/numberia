import type { Grade, Skill } from './types.ts';
import { worldForMission } from './worlds.ts';
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
    completion: 'The moonberries are glowing again. You brought their magic home!',
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
    completion: 'Pip can cross the stream again. What a brilliant bridge builder!',
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
    completion: 'There’s a picnic for every forest friend. You made room for everyone!',
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
    completion: 'Every little firefly has its light back. Look at the forest sparkle!',
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
    completion:
      'The wishing tree is awake! You’ve restored Whispering Woods. The whole forest is celebrating YOU.',
  },
  {
    title: 'The sleeping crystal garden',
    short: 'Sparkle Springs',
    skill: 'addition',
    story:
      'The cove’s crystals have lost their sparkle! Help Lumi gather little lights and wake the crystal garden.',
    action: 'Wake the crystal garden',
    companion: 'Lumi',
    reward: 'Sparkle seed charm',
    item: 'sparkle-seed',
    completion: 'The crystal garden is singing again. Every little light belongs!',
  },
  {
    title: 'A rainbow road for Pip',
    short: 'Rainbow Crossing',
    skill: 'subtraction',
    story:
      'Pip can see his friends across the lagoon. Find the missing crystal pieces and make a rainbow path!',
    action: 'Build the rainbow crossing',
    companion: 'Pip',
    reward: 'Rainbow bridge pendant',
    item: 'rainbow-pendant',
    completion: 'Pip made it across your rainbow bridge. That’s the magic of helping a friend!',
  },
  {
    title: 'A seashell feast for everyone',
    short: 'Seashell Shore',
    skill: 'multiplication',
    story:
      'Milo is planning a beach picnic! Pack little groups of treats so every friend has a place at the table.',
    action: 'Share a seaside picnic',
    companion: 'Milo',
    reward: 'Seashell picnic basket',
    item: 'shell-basket',
    completion: 'Everyone has a little feast. The happiest picnics are the ones we share!',
  },
  {
    title: 'Little lights in the grotto',
    short: 'Glow Grotto',
    skill: 'division',
    story:
      'The glowbugs need help finding their way. Share the crystal sparks and light a gentle path through the cavern.',
    action: 'Light the crystal grotto',
    companion: 'Lumi',
    reward: 'Glowbug crystal lantern',
    item: 'grotto-lantern',
    completion: 'Every glowbug has a light to follow. You made the dark feel friendly!',
  },
  {
    title: 'The heart of Crystal Cove',
    short: 'Heartlight Haven',
    skill: 'addition',
    story:
      'Five little kindness crystals can wake the heart of the cove. Bring your discoveries together for one big glow!',
    action: 'Wake the heart of the cove',
    companion: 'Pip',
    reward: 'Heart of the cove crown',
    item: 'crystal-heart',
    completion:
      'The heart crystal is glowing! You brought Crystal Cove back to life, one kind little discovery at a time.',
  },
] as const;
export function missionSkill(grade: Grade, index: number): Skill {
  const chapter = worldForMission(index).chapters.indexOf(index);
  if (grade === 5 && chapter === 3) return 'fractions';
  if (grade === 5 && chapter === 4) return 'decimals';
  const skill = missions[index % missions.length].skill;
  return availableSkills(grade).includes(skill) ? skill : chapter % 2 ? 'subtraction' : 'addition';
}
