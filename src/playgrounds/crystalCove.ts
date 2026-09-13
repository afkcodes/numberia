import * as THREE from 'three';
import { pipDragon, type Landmark } from './landmarks.ts';
import { choiceMotion, type CrystalActivity } from './crystalActivity.ts';
import { crystalProps, jewelColors, coveCream as cream } from './crystalProps.ts';
import type { Point, WorldSculpt } from './sculpt.ts';
import type { PlaygroundTheme } from './themes.ts';

/** A terraced outdoor instrument, with giant keys instead of a walking clearing. */
function singingStage(s: WorldSculpt): Landmark {
  const p = crystalProps(s);
  const motion = choiceMotion();
  let chimeExcitement = 0;
  // Broad stepped stage and a curved bank of crystal organ pipes.
  for (let level = 0; level < 3; level++)
    s.box([18 - level * 0.7, 0.22, 10 - level * 0.7], [0x9c86b8, 0xcebae0, 0xf5dfb8][level], [
      0,
      level * 0.22,
      -0.7,
    ]);
  for (let i = 0; i < 11; i++) {
    const x = (i - 5) * 1.55;
    const z = -5.5 - Math.cos((i - 5) * 0.23) * 1.2;
    s.post(0.58, 0.55, 0x8a75a7, [x, 0.28, z]);
    p.crystal([x, 0.55, z], 1.8 + Math.cos((i - 5) * 0.3), jewelColors[i % 5]);
  }
  const pond = s.oval([5, 0.08, 3.2], 0x22bfcc, [0, 0, -10]);
  pond.castShadow = false;
  for (const [x, z, size] of [
    [-11, -6, 1.8],
    [11, -5, 1.6],
    [-11, 4, 1.2],
    [10, 5, 1],
  ]) {
    p.palm(x, z, size);
    for (let i = 0; i < 6; i++)
      s.flower(x + Math.sin(i) * 1.5, z + Math.cos(i) * 1.3, jewelColors[i % 5], 1.2);
  }
  const keys = [-6, -2, 2, 6].map((x, i) => {
    const root = s.group([x, 0.58, 0]);
    root.name = `singing-key-${i}`;
    s.box([3.35, 0.25, 4.6], 0x796195, [0, 0.1, 0.4], root);
    s.box([3.12, 0.22, 4.35], jewelColors[i], [0, 0.3, 0.4], root);
    const gem = p.crystal([0, 0.42, 0], 1.32 + i * 0.13, jewelColors[i], root, true);
    const wave = p.torus([0, 0.46, 0], 0.9, jewelColors[i], root);
    wave.visible = false;
    return { ...p.anchor(root, 3.6), gem, wave };
  });
  const notes = Array.from({ length: 5 }, (_, i) => {
    const root = s.group([(i - 2) * 1.65, 0.8, -4.3]);
    s.oval([0.27, 0.17, 0.18], jewelColors[i], [-0.12, 0, 0], root, true);
    s.post(0.045, 0.8, jewelColors[i], [0.12, 0.35, 0], root);
    s.box([0.3, 0.12, 0.07], jewelColors[i], [0.26, 0.72, 0], root);
    return root;
  });
  const conductor = s.group([0, 0.7, 3.3]);
  conductor.name = 'crystal-conductor-bell';
  s.post(0.5, 0.14, 0xb696d0, [0, 0, 0], conductor);
  s.mesh(
    new THREE.SphereGeometry(0.4, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    0xffcf68,
    [0, 0.12, 0],
    conductor,
  );
  s.oval([0.09, 0.09, 0.09], 0xa56a37, [0, 0.55, 0], conductor);
  return {
    pieces: notes,
    interactionTargets: [conductor],
    activity: {
      choices: keys,
      home: [0, 0.6, 4.5],
      camera: [0, 14, 22],
      lookAt: [0, 1, -1.5],
      reset: motion.reset,
      select: motion.select,
      update(time, animate) {
        const frame = motion.frame(time, animate);
        keys.forEach(({ root, gem, wave }, i) => {
          const active = frame.selected === i;
          const ringing = chimeExcitement * Math.abs(Math.sin(frame.time * 6 - i));
          root.position.y = 0.58 - (active ? frame.pulse * 0.17 : 0);
          gem.rotation.z =
            (active ? Math.sin(frame.progress * Math.PI * 6) * frame.pulse * 0.1 : 0) +
            ringing * 0.08;
          wave.visible = (active && frame.correct) || ringing > 0.05;
          wave.scale.setScalar(1 + (ringing || frame.progress) * 0.85);
        });
      },
    },
    update(time, _restored, excitement) {
      chimeExcitement = excitement;
      notes.forEach((note, i) => {
        note.position.y = 1.1 + Math.sin(time * 2 + i * 0.8) * 0.12 + excitement * 0.9;
        note.rotation.z = Math.sin(time * 1.4 + i) * 0.14;
      });
    },
  };
}

/** Answer rafts carry a rainbow cargo across an open lagoon to Pip's bridge. */
function raftLagoon(s: WorldSculpt): Landmark {
  const p = crystalProps(s);
  const motion = choiceMotion();
  for (const side of [-1, 1]) {
    s.oval([6, 0.55, 7.5], 0xeac889, [side * 13.2, -0.05, -3.5]);
    s.oval([4.7, 0.36, 6], 0x3a9b78, [side * 14, 0.35, -4]);
    p.palm(side * 10, -8, 1.65);
    p.palm(side * 11, -1, 1.15);
    p.cluster([side * 10.5, 0.3, -8.5], 1.2, 0x9274da);
  }
  const bridge = s.group([0, 0, -6.5]);
  bridge.name = 'rainbow-crystal-bridge';
  for (const z of [-0.85, 0.85]) {
    s.line(
      [
        [-9, 0.9, z],
        [0, 2.1, z],
        [9, 0.9, z],
      ],
      0.12,
      cream,
      bridge,
    );
    s.line(
      [
        [-9, 1.7, z],
        [0, 2.9, z],
        [9, 1.7, z],
      ],
      0.075,
      0xe6b3dc,
      bridge,
    );
    for (const x of [-8.8, -5.3, -1.8, 1.8, 5.3, 8.8])
      s.post(0.09, 1, cream, [x, 1.5 + (1 - Math.abs(x) / 9), z], bridge);
  }
  const pieces = Array.from({ length: 5 }, (_, i) => {
    const root = s.group([(i - 2) * 3.6, 0, 0], bridge);
    for (let j = 0; j < 6; j++) {
      const x = (j - 2.5) * 0.6;
      const worldX = root.position.x + x;
      s.box(
        [0.57, 0.22, 1.8],
        jewelColors[i],
        [x, 0.96 + (1 - Math.abs(worldX) / 9) * 1.1, 0],
        root,
      );
    }
    return root;
  });
  // Milo watches from a real dock; nobody walks on the water.
  for (let i = 0; i < 7; i++)
    s.box([3.2, 0.16, 0.48], i % 2 ? 0xb9874f : 0xc6955e, [-7, 0.24, 5.5 + i * 0.52]);
  for (const x of [-8.5, -5.5]) for (const z of [5.4, 8.8]) s.post(0.12, 1, cream, [x, 0.3, z]);
  const rafts = [-6, -2, 2, 6].map((x, i) => {
    const root = s.group([x, 0.15, 1.5 + (i % 2) * 1.1]);
    root.name = `rainbow-delivery-raft-${i}`;
    for (let j = 0; j < 5; j++) {
      const log = s.post(0.17, 2.7, 0xc99b61, [(j - 2) * 0.35, 0, 0], root);
      log.rotation.x = Math.PI / 2;
    }
    for (const z of [-0.75, 0.75]) s.box([1.85, 0.07, 0.14], cream, [0, 0.18, z], root);
    s.post(0.065, 2.7, cream, [0, 1.4, -0.55], root);
    const sailShape = new THREE.Shape();
    sailShape.moveTo(0, 0);
    sailShape.lineTo(1.2, 0.1);
    sailShape.quadraticCurveTo(0.95, 1.1, 0, 1.7);
    sailShape.closePath();
    const sailGeometry = new THREE.ExtrudeGeometry(sailShape, {
      depth: 0.035,
      bevelEnabled: false,
    });
    s.mesh(sailGeometry, jewelColors[i], [0.06, 0.85, -0.55], root);
    const cargo = p.crystal([0, 0.23, 0.3], 0.65, jewelColors[i], root, true);
    const wake = p.torus([0, -0.1, 0.25], 1.1, 0xa4eeed, root);
    wake.scale.y = 1.6;
    return { ...p.anchor(root, 3.2), cargo, wake, start: root.position.clone() };
  });
  const pip = pipDragon(s, [9.5, 0.45, -6.5]);
  const fish = Array.from({ length: 7 }, (_, i) => {
    const root = s.group([0, -0.02, 0]);
    s.oval([0.28, 0.07, 0.13], i % 2 ? 0xffbd66 : 0x62e0d7, [0, 0, 0], root);
    const tail = s.mesh(new THREE.ConeGeometry(0.16, 0.23, 3), 0xf9aa63, [-0.3, 0, 0], root);
    tail.rotation.z = -Math.PI / 2;
    return root;
  });
  const buoy = s.group([8, 0, 4.5]);
  buoy.name = 'rainbow-ripple-buoy';
  s.post(0.42, 0.3, cream, [0, 0.1, 0], buoy);
  p.crystal([0, 0.3, 0], 0.8, 0xffa6c4, buoy, true);
  const rings = [2, 4, 6].map((radius) => p.torus([0, -0.035, 0], radius, 0xa8eceb));
  const ripples = Array.from({ length: 12 }, (_, i) => {
    const x = ((i % 4) - 1.5) * 4.6,
      z = Math.floor(i / 4) * 4.2 - 3.5;
    return s.line(
      [
        [x - 0.6, -0.015, z],
        [x, -0.015, z - 0.1],
        [x + 0.6, -0.015, z],
      ],
      0.018,
      0xa8eceb,
    );
  });
  let lastTime = 0,
    crossing = 0,
    delivered = 0;
  return {
    pieces,
    interactionTargets: [buoy],
    activity: {
      choices: rafts,
      home: [-7, 0.35, 6.5],
      camera: [0, 16, 23],
      lookAt: [0, 0.5, -1],
      reset: motion.reset,
      select: motion.select,
      update(time, animate) {
        const frame = motion.frame(time, animate);
        rafts.forEach(({ root, anchor, start, cargo, wake }, i) => {
          const active = frame.selected === i;
          const travel = active && frame.correct ? frame.progress : 0;
          root.position.copy(start);
          root.position.z -= travel * 6.4;
          anchor.position.set(start.x, start.y + 3.2, root.position.z);
          root.position.y += Math.sin(frame.time * 1.8 + i) * 0.055;
          root.rotation.z = Math.sin(frame.time * 1.5 + i) * 0.025;
          const unloading = Math.max(0, (travel - 0.65) / 0.35);
          const destinationX = (Math.max(0, delivered - 1) - 2) * 3.6;
          cargo.position.set(
            (destinationX - start.x) * unloading,
            0.23 + travel * 1.5 + Math.sin(unloading * Math.PI) * 1.2,
            0.3 + (-6.5 - root.position.z - 0.3) * unloading,
          );
          cargo.visible = travel < 1;
          wake.visible = travel < 1;
          wake.scale.x = 1 + (active ? frame.pulse * 0.45 : 0);
        });
      },
    },
    update(time, restored, excitement) {
      delivered = restored;
      const dt = Math.min(0.05, Math.max(0, time - lastTime));
      lastTime = time;
      crossing = restored === 5 ? (time === 0 ? 1 : Math.min(1, crossing + dt * 0.15)) : 0;
      pip.root.position.x = 9.5 - crossing * 19;
      const x = Math.abs(pip.root.position.x);
      pip.root.position.y =
        0.45 + Math.min(1, Math.max(0, (9.5 - x) / 0.6)) * (0.62 + Math.max(0, 1 - x / 9) * 1.1);
      pip.root.rotation.y = crossing > 0 && crossing < 1 ? -Math.PI / 2 : 0;
      pip.feet.forEach((foot, i) => {
        foot.position.y =
          0.15 +
          (crossing > 0 && crossing < 1 ? Math.max(0, Math.sin(time * 9 + i * Math.PI)) * 0.13 : 0);
      });
      pip.arms[1].rotation.z =
        crossing === 1 || excitement > 0 ? -1.7 + Math.sin(time * 7) * 0.2 : -0.15;
      fish.forEach((fish, i) => {
        fish.position.set(
          Math.sin(time * 0.2 + i * 1.7) * 9,
          0.005,
          Math.cos(time * 0.13 + i) * 3 + 3,
        );
        fish.rotation.y = Math.cos(time * 0.2 + i * 1.7) > 0 ? 0 : Math.PI;
      });
      buoy.rotation.z = Math.sin(time * 1.2) * 0.06;
      rings.forEach((ring, i) => {
        ring.visible = excitement > 0;
        ring.scale.setScalar(1 + excitement * 0.6 + Math.sin(time * 0.4 + i) * 0.035);
      });
      ripples.forEach((ripple, i) => {
        ripple.position.z = Math.sin(time * 0.55 + i) * 0.3;
      });
    },
  };
}

/** A diagonal beach, working shell hinges, hidden pearls, and a wandering turtle. */
function treasureBeach(s: WorldSculpt): Landmark {
  const p = crystalProps(s);
  const motion = choiceMotion();
  const ocean = s.box([40, 0.08, 90], 0x1db9c9, [25, -0.055, -5]);
  ocean.rotation.y = -0.3;
  const foam = s.box([0.45, 0.035, 90], 0xbdf2e3, [5.8, 0, -11]);
  foam.rotation.y = -0.3;
  const waves = [0, 1, 2].map((i) => {
    const wave = s.box([0.07, 0.035, 70], 0x8ae5df, [8.6 + i * 1.6, 0, -8]);
    wave.rotation.y = -0.3;
    return wave;
  });
  p.palm(-9, -7, 1.65);
  p.palm(-11, 2, 1.6);
  p.palm(-10, 8, 1.1);
  // A tiny striped lighthouse and a shell-shaped picnic, kept well behind the hunt.
  const lighthouse = s.group([7.8, 0.2, -6.5]);
  lighthouse.scale.setScalar(0.9);
  s.oval([2.5, 0.3, 2.3], cream, [0, -0.1, 0], lighthouse);
  for (let i = 0; i < 5; i++)
    s.post(0.9 - i * 0.075, 0.7, i % 2 ? 0xf07d69 : cream, [0, 0.35 + i * 0.7, 0], lighthouse);
  s.post(0.85, 0.12, 0x537f8b, [0, 3.5, 0], lighthouse);
  s.post(0.48, 0.65, 0xffd274, [0, 3.85, 0], lighthouse);
  s.mesh(new THREE.ConeGeometry(0.82, 0.65, 12), 0x479593, [0, 4.5, 0], lighthouse);
  const picnic = s.group([-3.6, 0, -6.6]);
  picnic.name = 'seashell-picnic';
  s.box([6, 0.06, 2.8], 0xf3a58e, [0, 0.04, 0], picnic);
  for (let i = 0; i < 6; i++) s.box([0.15, 0.02, 2.8], cream, [(i - 2.5) * 0.9, 0.08, 0], picnic);
  const pieces = Array.from({ length: 5 }, (_, i) => {
    const root = s.group([(i - 2) * 1.1, 0.12, 0], picnic);
    p.shell([0, 0, 0], 0.6, jewelColors[i], root);
    s.oval([0.2, 0.2, 0.2], 0xffe5b0, [0, 0.35, 0.3], root, true);
    return root;
  });
  const shellPositions: Point[] = [
    [-5.7, 0, -0.1],
    [-1.6, 0, -2],
    [2.1, 0, 0.2],
    [-1.8, 0, 4.4],
  ];
  const shells = shellPositions.map((position, i) => {
    const root = s.group(position);
    root.name = `treasure-shell-${i}`;
    s.oval([1.3, 0.13, 1.05], 0xcda66d, [0, 0, 0], root);
    p.shell([0, 0.11, -0.6], 1.8, jewelColors[i], root);
    const lid = p.shell([0, 0.2, -0.6], 1.8, jewelColors[i], root);
    const pearl = s.oval([0.4, 0.4, 0.4], 0xffefbe, [0, 0.2, 0.2], root, true);
    pearl.visible = false;
    return { ...p.anchor(root, 2.4), lid, pearl };
  });
  const turtle = s.group([6.6, 0.05, 3.6]);
  turtle.name = 'seashell-shore-turtle';
  s.oval([0.62, 0.36, 0.76], 0x2f886d, [0, 0.37, 0], turtle);
  s.oval([0.48, 0.26, 0.57], 0x83b846, [0, 0.56, 0], turtle);
  for (let i = 0; i < 5; i++)
    s.oval(
      [0.12, 0.035, 0.13],
      0xb6d36a,
      [Math.sin(i * 1.25) * 0.31, 0.77, Math.cos(i * 1.25) * 0.32],
      turtle,
    );
  s.oval([0.26, 0.21, 0.32], 0x88bd78, [0, 0.34, 0.82], turtle);
  for (const x of [-0.15, 0.15]) s.oval([0.04, 0.055, 0.035], 0x233e37, [x, 0.43, 1.05], turtle);
  const flippers = [-1, 1].flatMap((side) =>
    [-1, 1].map((end) =>
      s.oval([0.3, 0.07, 0.16], 0x6aaf7f, [side * 0.58, 0.13, end * 0.46], turtle),
    ),
  );
  for (let i = 0; i < 16; i++) {
    const x = -9 + (i % 4) * 3.1,
      z = 7 + Math.floor(i / 4) * 1.1;
    p.shell([x, 0.02, z], 0.22, jewelColors[i % 5]);
  }
  return {
    pieces,
    interactionTargets: [turtle],
    activity: {
      choices: shells,
      home: [-5.5, 0, 4.1],
      camera: [1, 17, 23],
      lookAt: [-0.5, 0.4, -0.8],
      reset: motion.reset,
      select: motion.select,
      update(time, animate) {
        const frame = motion.frame(time, animate);
        shells.forEach(({ lid, pearl }, i) => {
          const active = frame.selected === i;
          const open = active ? (frame.correct ? frame.progress : frame.pulse * 0.16) : 0;
          lid.rotation.x = -open * 1.4;
          pearl.visible = active && frame.correct;
          pearl.position.y = 0.3 + open * 1.3;
        });
      },
    },
    update(time, _restored, excitement) {
      turtle.position.z = 3.6 + Math.sin(time * 0.15) * 0.65;
      turtle.rotation.y = -0.8 + Math.sin(time * 0.15) * 0.2;
      flippers.forEach((flipper, i) => {
        flipper.rotation.y = Math.sin(time * (excitement ? 7 : 2.5) + i * Math.PI) * 0.3;
      });
      waves.forEach((wave, i) => {
        wave.position.x = 8.6 + i * 1.6 + Math.sin(time * 0.45 + i) * 0.45;
      });
    },
  };
}

/** Inside the grotto: tall cave walls, a reflective pool, and airborne answer lanterns. */
function lanternCavern(s: WorldSculpt): Landmark {
  const p = crystalProps(s);
  const motion = choiceMotion();
  const rockGeometry = new THREE.DodecahedronGeometry(1, 0);
  for (let i = 0; i < 13; i++) {
    const angle = (i / 12) * Math.PI;
    const x = Math.cos(angle) * 12,
      z = -2 - Math.sin(angle) * 10;
    const rock = s.mesh(rockGeometry, i % 2 ? 0x454772 : 0x373b60, [x, 2, z]);
    rock.scale.set(2.5, 4.5 + (i % 3) * 0.7, 2.2);
    const stalactite = s.mesh(new THREE.ConeGeometry(0.5, 2.4, 5), 0x7d7cb4, [
      x * 0.78,
      5.8,
      z + 0.7,
    ]);
    stalactite.rotation.z = Math.PI;
    if (i % 2 === 0) p.cluster([x * 0.85, 0, z + 2], 1.5, i % 4 ? 0x7e7adf : 0x55c6d5);
  }
  const pool = s.oval([9, 0.08, 7.5], 0x246995, [0, 0, -2.2]);
  pool.castShadow = false;
  for (const radius of [3.5, 5.5, 7.5]) {
    const ring = p.torus([0, 0.07, -2], radius, 0x559cb8);
    ring.scale.y = 0.8;
  }
  const dock = s.group([0, 0, 5.3]);
  s.box([5, 0.3, 2.9], 0x9a85b9, [0, 0.2, 0], dock);
  for (let i = 0; i < 9; i++) s.box([0.08, 0.025, 2.9], 0xc3afd4, [(i - 4) * 0.55, 0.36, 0], dock);
  const lanternPositions: Point[] = [
    [-5, 1.6, 0],
    [-1.8, 3.1, -2.4],
    [2.4, 1.4, 0],
    [5.4, 3.1, -2.9],
  ];
  function lantern(position: Point, color: number, size: number) {
    const root = s.group(position);
    root.scale.setScalar(size);
    const shade = s.mesh(new THREE.SphereGeometry(0.7, 12, 10), color, [0, 0.6, 0], root, true);
    shade.scale.set(0.85, 1.2, 0.85);
    s.post(0.38, 0.12, 0xe6bc81, [0, -0.12, 0], root);
    s.post(0.3, 0.12, cream, [0, 1.4, 0], root);
    for (const side of [-1, 1])
      s.line(
        [
          [side * 0.2, -0.2, 0],
          [side * 0.27, -0.65, 0.08],
          [side * 0.13, -0.92, 0],
        ],
        0.025,
        color,
        root,
      );
    return root;
  }
  const lanterns = lanternPositions.map((position, i) => {
    const root = lantern(position, jewelColors[i], 0.95);
    root.name = `floating-answer-lantern-${i}`;
    return { ...p.anchor(root, 1.85), start: root.position.clone() };
  });
  const pieces = Array.from({ length: 5 }, (_, i) =>
    lantern([(i - 2) * 2, 3.7 + (i % 2) * 0.8, -7.2], jewelColors[i], 0.48),
  );
  const glowbugs = Array.from({ length: 26 }, (_, i) =>
    s.oval([0.045, 0.045, 0.045], i % 2 ? 0xffd88a : 0xa7e7ff, [0, 0, 0], undefined, true),
  );
  const beacon = p.crystal([-4.1, 0, 4.9], 1.25, 0xb49aef, undefined, true);
  beacon.name = 'glowbug-beacon';
  return {
    pieces,
    interactionTargets: [beacon],
    activity: {
      choices: lanterns,
      home: [0, 0.38, 5.5],
      camera: [0, 10.5, 24],
      lookAt: [0, 2.8, -1.8],
      reset: motion.reset,
      select: motion.select,
      update(time, animate) {
        const frame = motion.frame(time, animate);
        lanterns.forEach(({ root, anchor, start }, i) => {
          const active = frame.selected === i;
          const flight = active && frame.correct ? frame.progress : 0;
          root.position.copy(start);
          root.position.y += Math.sin(frame.time * 1.4 + i) * 0.13 + flight * 2;
          root.position.z -= flight * 4;
          anchor.position.set(start.x, start.y + 1.85 + flight * 2, root.position.z);
          root.rotation.z =
            Math.sin(frame.time + i) * 0.045 + (active && !frame.correct ? frame.pulse * 0.08 : 0);
        });
      },
    },
    update(time, restored, excitement) {
      glowbugs.forEach((bug, i) => {
        const angle = time * 0.3 + i * 2.4;
        bug.position.set(
          Math.sin(angle) * (7 - excitement * 2),
          0.6 + (i % 7) * 0.6 + Math.sin(time + i) * 0.2,
          -3 + Math.cos(angle) * 3.5,
        );
        bug.visible = i < 6 + restored * 4 || excitement > 0;
      });
      pieces.forEach((piece, i) => {
        piece.rotation.z = Math.sin(time * 1.2 + i) * 0.08;
      });
    },
  };
}

/** A geometric light temple: the four answers are mirrors that turn toward its heart. */
function heartTemple(s: WorldSculpt): Landmark {
  const p = crystalProps(s);
  const motion = choiceMotion();
  // Square inlays and an axial approach give the finale its own architecture.
  for (let level = 0; level < 3; level++) {
    const tile = s.box(
      [15 - level * 0.9, 0.2, 15 - level * 0.9],
      [0x817aaa, 0xb6a2c6, 0xf2d6b9][level],
      [0, level * 0.2, -1.5],
    );
    tile.rotation.y = Math.PI / 4;
  }
  s.box([4, 0.04, 40], 0xc59eab, [0, -0.06, 15]);
  for (const side of [-1, 1])
    for (const z of [-8, -2, 5]) {
      const x = side * (z === -8 ? 6.3 : 10);
      s.post(0.56, 0.3, cream, [x, 0.15, z]);
      s.post(0.3, 3.2, 0xb4a0c5, [x, 1.9, z]);
      p.crystal([x, 3.5, z], 0.95, z === -8 ? 0xff91bf : 0xb58ae9, undefined, true);
      s.oval([1.5, 0.2, 1.2], 0x328568, [x, 0.12, z + 1.3]);
      for (let i = 0; i < 5; i++)
        s.flower(x + Math.sin(i * 1.25), z + 1.3 + Math.cos(i * 1.25), jewelColors[i], 1.1);
    }
  const sanctuary = s.group([0, 0.6, -2.4]);
  sanctuary.name = 'heartlight-sanctuary';
  const base = s.post(2, 0.5, 0xc18ea9, [0, 0.25, 0], sanctuary);
  base.rotation.y = Math.PI / 4;
  s.post(1.25, 0.9, cream, [0, 0.85, 0], sanctuary);
  const shape = new THREE.Shape();
  shape.moveTo(0, -1.1);
  shape.bezierCurveTo(-0.4, -0.7, -1.5, 0.05, -1.4, 0.8);
  shape.bezierCurveTo(-1.25, 1.65, -0.3, 1.68, 0, 0.96);
  shape.bezierCurveTo(0.3, 1.68, 1.25, 1.65, 1.4, 0.8);
  shape.bezierCurveTo(1.5, 0.05, 0.4, -0.7, 0, -1.1);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.42,
    bevelEnabled: true,
    bevelSize: 0.12,
    bevelThickness: 0.1,
    bevelSegments: 1,
    steps: 1,
    curveSegments: 10,
  });
  const heart = s.mesh(geometry, 0xf271ad, [0, 3, 0], sanctuary, true);
  heart.name = 'heart-of-crystal-cove';
  const eyes = [-0.43, 0.43].map((x) => {
    const open = s.oval([0.08, 0.12, 0.04], 0x71394d, [x, 3.55, 0.55], sanctuary);
    const closed = s.line(
      [
        [x - 0.11, 3.55, 0.56],
        [x, 3.5, 0.58],
        [x + 0.11, 3.55, 0.56],
      ],
      0.028,
      0x71394d,
      sanctuary,
    );
    s.oval([0.12, 0.065, 0.035], 0xffbad0, [x * 1.3, 3.32, 0.56], sanctuary);
    return { open, closed };
  });
  s.line(
    [
      [-0.22, 3.26, 0.57],
      [0, 3.14, 0.6],
      [0.22, 3.26, 0.57],
    ],
    0.028,
    0x71394d,
    sanctuary,
  );
  const heartTarget: Point = [0, 3.6, -2.2];
  const mirrorPositions: Point[] = [
    [-5.7, 0.6, -2.5],
    [5.7, 0.6, -2.5],
    [-4, 0.6, 3.4],
    [4, 0.6, 3.4],
  ];
  const mirrors = mirrorPositions.map((position, i) => {
    const root = s.group(position);
    root.name = `heartlight-mirror-${i}`;
    s.post(0.7, 0.18, 0xb893b6, [0, 0.09, 0], root);
    s.post(0.12, 1.35, 0xd7a567, [0, 0.85, 0], root);
    const swivel = s.group([0, 1.75, 0], root);
    s.mesh(new THREE.TorusGeometry(0.72, 0.1, 6, 6), 0xf6cd7d, [0, 0, 0], swivel);
    const lens = s.mesh(
      new THREE.CylinderGeometry(0.68, 0.68, 0.1, 6),
      jewelColors[i],
      [0, 0, 0],
      swivel,
      true,
    );
    lens.rotation.x = Math.PI / 2;
    const origin: Point = [position[0], position[1] + 1.75, position[2]];
    const beam = s.line([origin, heartTarget], 0.055, jewelColors[i]);
    beam.material = s.glow(jewelColors[i]);
    beam.castShadow = false;
    beam.visible = false;
    const flash = p.torus([position[0], position[1] + 0.21, position[2]], 0.85, jewelColors[i]);
    flash.visible = false;
    return { ...p.anchor(root, 3.2), swivel, beam, flash };
  });
  const pieces = Array.from({ length: 5 }, (_, i) => {
    const gem = p.crystal([(i - 2) * 1.55, 0.8, -6.2], 0.8, jewelColors[i], undefined, true);
    return gem;
  });
  const wishes = Array.from({ length: 18 }, (_, i) =>
    s.mesh(new THREE.OctahedronGeometry(0.075), jewelColors[i % 5], [0, 0, 0], undefined, true),
  );
  return {
    pieces,
    interactionTargets: [sanctuary],
    activity: {
      choices: mirrors,
      home: [0, 0.63, 6],
      camera: [0, 16, 24],
      lookAt: [0, 1.7, -1],
      reset: motion.reset,
      select: motion.select,
      update(time, animate) {
        const frame = motion.frame(time, animate);
        mirrors.forEach(({ root, swivel, beam, flash }, i) => {
          const active = frame.selected === i;
          const turn = active && frame.correct ? frame.progress : 0;
          const angle = Math.atan2(-root.position.x, -2.4 - root.position.z);
          swivel.rotation.y = angle * turn;
          beam.visible = active && frame.correct && frame.progress > 0.35;
          flash.visible = active && frame.correct;
          flash.scale.setScalar(1 + frame.pulse * 0.6);
        });
      },
    },
    update(time, restored, excitement) {
      eyes.forEach(({ open, closed }) => {
        open.visible = restored === 5 || excitement > 0.5;
        closed.visible = !open.visible;
      });
      heart.material.emissiveIntensity = 0.12 + restored * 0.12 + excitement * 0.2;
      heart.scale.setScalar(
        1 + Math.sin(time * 2) * (restored === 5 ? 0.06 : 0.015) + excitement * 0.1,
      );
      wishes.forEach((wish, i) => {
        const angle = time * 0.65 + i * 2.4;
        wish.visible = restored === 5 || excitement > 0;
        wish.position.set(
          Math.sin(angle) * 3,
          1.4 + (i % 5) * 0.65 + Math.sin(time + i) * 0.15,
          -2.4 + Math.cos(angle) * 2.5,
        );
        wish.rotation.y = angle;
      });
    },
  };
}

export function crystalCove(
  s: WorldSculpt,
  theme: PlaygroundTheme,
): Landmark & { activity: CrystalActivity } {
  const builders = {
    'crystal-garden': singingStage,
    'crystal-bridge': raftLagoon,
    'shell-shore': treasureBeach,
    'glow-cavern': lanternCavern,
    'heart-sanctuary': heartTemple,
  };
  const builder = builders[theme.id as keyof typeof builders];
  const world = builder(s);
  return { ...world, activity: world.activity! };
}
