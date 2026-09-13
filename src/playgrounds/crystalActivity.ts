import type * as THREE from 'three';
import type { Point } from './sculpt.ts';

/** The learning engine decides correctness; chapter toys only show the result. */
export type CrystalActivity = {
  choices: { root: THREE.Group; anchor: THREE.Object3D }[];
  home: Point;
  camera: Point;
  lookAt: Point;
  reset: () => void;
  select: (index: number, correct: boolean) => void;
  update: (time: number, animate: boolean) => void;
};

export const crystalInstructions = {
  'crystal-garden': {
    action: 'Tap a crystal. Make a melody!',
    success: 'A new note for our song!',
    object: 'crystal',
    detail: 'Find the answer to wake a singing crystal.',
  },
  'crystal-bridge': {
    action: 'Pick a raft. Deliver a rainbow!',
    success: 'Special delivery for Pip!',
    object: 'raft',
    detail: 'Your answer sends a crystal piece across the lagoon.',
  },
  'shell-shore': {
    action: 'Open a shell. Find a little treasure!',
    success: 'A pearl for our picnic!',
    object: 'shell',
    detail: 'Find the answer to open a treasure shell.',
  },
  'glow-cavern': {
    action: 'Choose a lantern. Let it fly!',
    success: 'Look! Your lantern is flying home!',
    object: 'lantern',
    detail: 'Your answer sends a little light up into the grotto.',
  },
  'heart-sanctuary': {
    action: 'Turn a mirror. Send a beam of light!',
    success: 'Your light reached the heart!',
    object: 'mirror',
    detail: 'Find the answer to send a colorful beam to the heart.',
  },
} as const;

/** One animation clock, no timeouts: retry, replay, and reduced motion share a stable state. */
export function choiceMotion() {
  let time = 0;
  let started = 0;
  let selected = -1;
  let correct = false;
  return {
    reset() {
      selected = -1;
      correct = false;
    },
    select(index: number, success: boolean) {
      if (!Number.isInteger(index) || index < 0 || index > 3) return;
      selected = index;
      correct = success;
      started = time;
    },
    frame(now: number, animate: boolean) {
      time = now;
      const progress = animate ? Math.min(1, Math.max(0, (now - started) / 2.2)) : 1;
      return {
        selected,
        correct,
        progress: 1 - (1 - progress) ** 3,
        pulse: selected < 0 || !animate ? 0 : Math.sin(progress * Math.PI),
        time: animate ? now : 0,
      };
    },
  };
}
