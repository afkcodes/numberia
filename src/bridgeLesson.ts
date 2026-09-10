import type { Problem } from './game';

/** Explain the unknown part, rather than treating the bridge as a generic counter. */
export function bridgeLesson(problem: Problem, added: number, solved = false) {
  const { a, b, answer } = problem;
  const setup = `Pip needs ${a} planks. ${b} ${b === 1 ? 'is' : 'are'} already here. How many are missing?`;
  const equation = `${a} minus ${b} equals ${answer}.`;
  const meaning =
    answer === 0
      ? `No new planks! All ${a} are already here.`
      : `You added ${answer} new ${answer === 1 ? 'plank' : 'planks'}.`;
  if (solved)
    return {
      step: 3,
      title: 'You helped Pip get across!',
      message: `${meaning} That is the missing part.`,
      speech: `${equation} ${meaning} Thank you, bridge builder!`,
      setup,
      ready: true,
    };
  if (added === answer)
    return {
      step: 3,
      title: answer === 0 ? 'Nothing is missing!' : 'You found the missing part!',
      message: `${meaning} Extra planks can stay in the tray. Tap “Let Pip cross!” to try your bridge.`,
      speech: `${equation} ${meaning} The extra planks can stay in the tray. Let’s send Pip across!`,
      setup,
      ready: true,
    };
  if (added > answer)
    return {
      step: 2,
      title: 'Let’s make a little space.',
      message: 'We have some extra planks. Return the last one, then look at the bridge again.',
      speech: 'A few planks can go back. Let’s return the last one and try again.',
      setup,
      ready: false,
    };
  return {
    step: added === 0 ? 1 : 2,
    title: added === 0 ? 'What is missing from the bridge?' : 'Count only your new planks.',
    message:
      added === 0
        ? 'The brown planks are already here. Tap a golden plank for each empty space.'
        : `You added ${added} ${added === 1 ? 'golden plank' : 'golden planks'}. Keep filling the empty spaces and count along!`,
    speech:
      added === 0
        ? `${setup} Tap a golden plank to fill a gap. Count the new planks with me! Stop when every space is filled.`
        : `${added}. ${added === 1 ? 'One new plank!' : 'New planks added.'}`,
    setup,
    ready: false,
  };
}
