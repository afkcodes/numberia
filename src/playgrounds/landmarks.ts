import * as THREE from 'three';
import type { Point, WorldSculpt } from './sculpt.ts';
import type { CrystalActivity } from './crystalActivity.ts';

export type Landmark = {
  activity?: CrystalActivity;
  pieces: THREE.Object3D[];
  update: (time: number, restored: number, excitement: number) => void;
  interactionTargets?: THREE.Object3D[];
  interact?: (time: number) => void;
};

const cream = 0xffefd0;
const wood = 0xa87950;

function pennants(
  s: WorldSculpt,
  parent: THREE.Object3D,
  width: number,
  height: number,
  colors: number[],
) {
  s.line(
    [
      [-width / 2, height, 0],
      [0, height - 0.4, 0],
      [width / 2, height, 0],
    ],
    0.025,
    cream,
    parent,
  );
  for (let i = 0; i < 9; i++) {
    const x = ((i - 4) * width) / 9;
    const flag = s.mesh(
      new THREE.ConeGeometry(0.19, 0.42, 3),
      colors[i % colors.length],
      [x, height - 0.55 + Math.abs(i - 4) * 0.055, 0],
      parent,
    );
    flag.rotation.z = Math.PI;
    flag.scale.z = 0.12;
  }
}

export function moonberryGarden(s: WorldSculpt): Landmark {
  const arch = s.group([-1, 0, -6]);
  arch.name = 'moonberry-lantern-arch';
  for (const x of [-3.2, 3.2]) {
    s.post(0.15, 3.7, cream, [x, 1.85, 0], arch);
    s.oval([0.3, 0.3, 0.3], 0xbb8eea, [x, 3.7, 0], arch);
    s.box([0.68, 0.4, 0.68], 0xa779d2, [x, 0.2, 0], arch);
    for (let i = 0; i < 7; i++)
      s.leaf(0x699e76, [x + Math.sin(i * 2) * 0.24, 0.55 + i * 0.4, 0.14], 0.38, arch);
  }
  s.line(
    [
      [-3.2, 3.6, 0],
      [-1.6, 4.45, 0],
      [1.6, 4.45, 0],
      [3.2, 3.6, 0],
    ],
    0.11,
    cream,
    arch,
  );
  const pieces: THREE.Object3D[] = [];
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 1.13,
      y = 3.15 + (2 - Math.abs(i - 2)) * 0.22;
    s.line(
      [
        [x, y + 0.5, 0],
        [x, y + 0.25, 0],
      ],
      0.025,
      wood,
      arch,
    );
    s.oval([0.4, 0.45, 0.4], 0x84719a, [x, y, 0], arch);
    s.leaf(0x7fbd82, [x + 0.15, y + 0.42, 0], 0.35, arch);
    const berry = s.berry([x, y, 0.13], 0.4, arch, true);
    pieces.push(berry);
  }
  const cottage = s.group([-7.1, 0, -7.6]);
  cottage.rotation.y = 0.25;
  s.box([2.8, 2.1, 2.3], 0xf0d3a2, [0, 1.05, 0], cottage);
  for (const direction of [-1, 1]) {
    const roof = s.box([1.9, 0.17, 2.9], 0x9c70d3, [direction * 0.73, 2.55, 0], cottage);
    roof.rotation.z = -direction * 0.52;
    s.box([0.52, 0.66, 0.08], 0x76bab6, [direction * 0.86, 1.26, 1.18], cottage);
    s.box([0.65, 0.08, 0.17], cream, [direction * 0.86, 0.9, 1.2], cottage);
  }
  s.box([0.65, 1.48, 0.1], 0x6b9c85, [0, 0.74, 1.2], cottage);
  s.oval([0.05, 0.05, 0.05], 0xfbd675, [0.2, 0.8, 1.27], cottage);
  s.box([0.9, 0.15, 0.5], cream, [0, 0.07, 1.45], cottage);
  for (const [x, z] of [
    [-7, -2],
    [5.7, -4.6],
    [6.5, 0],
  ]) {
    const bed = s.group([x, 0, z]);
    bed.rotation.y = x * 0.09;
    s.box([1.65, 0.38, 1.1], 0xba976a, [0, 0.19, 0], bed);
    s.box([1.45, 0.04, 0.9], 0x6c7050, [0, 0.4, 0], bed);
    for (let i = 0; i < 3; i++) {
      s.oval([0.38, 0.5, 0.4], 0x79a977, [(i - 1) * 0.5, 0.78, 0], bed);
      s.berry([(i - 1) * 0.5, 0.77, 0.35], 0.17, bed);
      s.berry([(i - 1) * 0.5 + 0.15, 1.04, 0.2], 0.14, bed);
    }
  }
  const basket = s.basket([4.6, 0, 3.6], 1.4);
  for (let i = 0; i < 6; i++)
    s.berry([Math.sin(i * 2) * 0.3, 0.55, Math.cos(i * 2) * 0.2], 0.18, basket);
  const pinwheel = s.group([5.4, 2.1, 2.2]);
  s.post(0.045, 2.1, cream, [5.4, 1, 2.2]);
  for (let i = 0; i < 4; i++) {
    const petal = s.leaf(
      [0xbb9ddf, 0xf4c967, 0xe5a1b0, 0x84c4b4][i],
      [Math.sin((i * Math.PI) / 2) * 0.25, Math.cos((i * Math.PI) / 2) * 0.25, 0],
      0.6,
      pinwheel,
    );
    petal.rotation.z = (-i * Math.PI) / 2;
  }
  s.oval([0.12, 0.12, 0.08], cream, [0, 0, 0.1], pinwheel);
  return {
    pieces,
    update(time, _restored, excitement) {
      pinwheel.rotation.z = -time * 0.65 - excitement * 0.6;
      pieces.forEach((piece, i) => {
        piece.rotation.z = Math.sin(time * 1.3 + i) * (0.06 + excitement * 0.12);
      });
    },
  };
}

/** Pip has a soft muzzle, separate limbs, and a planted walk cycle. */
export function pipDragon(s: WorldSculpt, position: Point) {
  const root = s.group(position);
  root.name = 'pip-the-bridge-builder';
  s.oval([0.43, 0.55, 0.36], 0x76b99c, [0, 0.72, 0], root);
  s.oval([0.3, 0.37, 0.085], cream, [0, 0.66, 0.32], root);
  s.oval([0.55, 0.43, 0.42], 0x83c6ab, [0, 1.34, 0.03], root);
  s.oval([0.4, 0.22, 0.2], 0xa4d6b6, [0, 1.16, 0.34], root);
  const arms = [-1, 1].map((side) => {
    s.leaf(0x64a98f, [side * 0.5, 1.55, 0], 0.47, root).rotation.z = side * -0.75;
    s.oval([0.05, 0.09, 0.035], 0x283e3a, [side * 0.22, 1.38, 0.413], root);
    s.oval([0.018, 0.025, 0.015], 0xffffff, [side * 0.22 - 0.01, 1.41, 0.44], root);
    s.oval([0.095, 0.044, 0.04], 0xf0afa0, [side * 0.36, 1.21, 0.35], root);
    const arm = s.group([side * 0.38, 0.95, 0], root);
    s.oval([0.14, 0.28, 0.14], 0x76b99c, [side * 0.07, -0.15, 0], arm);
    return arm;
  });
  for (let i = 0; i < 3; i++)
    s.mesh(
      new THREE.ConeGeometry(0.13, 0.3, 5),
      0x599e83,
      [(i - 1) * 0.2, 1.78 - Math.abs(i - 1) * 0.07, -0.08],
      root,
    );
  s.line(
    [
      [-0.12, 1.11, 0.49],
      [0, 1.07, 0.52],
      [0.12, 1.11, 0.49],
    ],
    0.016,
    0x366353,
    root,
  );
  s.line(
    [
      [0, 0.5, -0.2],
      [0.35, 0.3, -0.6],
      [0.55, 0.48, -0.8],
    ],
    0.15,
    0x76b99c,
    root,
  );
  const feet = [-1, 1].map((side) =>
    s.oval([0.19, 0.17, 0.27], 0x55917a, [side * 0.23, 0.15, 0.1], root),
  );
  return { root, arms, feet };
}

export function pebbleRiver(s: WorldSculpt, water: number): Landmark {
  const millPosition: Point = [9.1, 0, -8];
  const river = s.box([3.8, 0.05, 100], water, [5.5, -0.045, 0]);
  river.name = 'pebble-river';
  river.receiveShadow = false;
  const bankStones = s.group();
  bankStones.name = 'pebble-bank-stones';
  for (let i = 0; i < 22; i++) {
    const side = i % 2 ? 1 : -1,
      z = -13 + Math.floor(i / 2) * 2.5;
    // Keep the waterwheel's intake clear of bank stones.
    if (side === 1 && Math.abs(z - millPosition[2]) < 1.5) continue;
    s.oval(
      [0.42 + (i % 3) * 0.12, 0.24, 0.37],
      [0x9daea2, 0xc0c5ad, 0x859d99][i % 3],
      [5.5 + side * 2, 0.1, z],
      bankStones,
    );
  }
  const bridge = s.group([5.5, 0, -5.4]);
  bridge.name = 'pips-growing-bridge';
  for (const z of [-0.8, 0.8]) {
    s.box([5.8, 0.16, 0.15], 0x92673f, [0, 0.5, z], bridge);
    s.box([5.8, 0.12, 0.12], 0xe4be81, [0, 1.55, z], bridge);
    for (const x of [-2.8, -1.4, 0, 1.4, 2.8]) s.post(0.085, 1.6, 0xc69b65, [x, 0.8, z], bridge);
  }
  const pieces = Array.from({ length: 5 }, (_, i) => {
    const piece = s.group([(i - 2) * 1.08, 0.53, 0], bridge);
    for (let plank = 0; plank < 3; plank++)
      s.box(
        [0.335, 0.16, 1.75],
        plank % 2 ? 0xdfad70 : 0xe8bc83,
        [(plank - 1) * 0.35, 0, 0],
        piece,
      );
    return piece;
  });
  const mill = s.group(millPosition);
  const building = s.group([0, 0, 0], mill);
  building.name = 'pebble-mill-building';
  s.box([2.2, 2.9, 2], 0xead5ae, [0, 1.45, 0], building);
  const roof = s.mesh(new THREE.ConeGeometry(1.8, 1.15, 4), 0x688f94, [0, 3.4, 0], building);
  roof.rotation.y = Math.PI / 4;
  s.box([0.75, 0.9, 0.08], 0x8dcdd0, [0, 1.8, 1.05], building);
  s.box([0.06, 1, 0.1], cream, [0, 1.8, 1.1], building);
  s.box([0.8, 0.06, 0.1], cream, [0, 1.8, 1.1], building);
  // Mount perpendicular to the riverbank: the paddles turn beside the wall, not through it.
  const axle = s.post(0.12, 1.1, wood, [-1.58, 1.3, 0], mill);
  axle.rotation.z = Math.PI / 2;
  const wheelMount = s.group([-2.1, 1.3, 0], mill);
  wheelMount.rotation.y = Math.PI / 2;
  const wheel = s.group([0, 0, 0], wheelMount);
  wheel.name = 'pebble-waterwheel';
  const rim = new THREE.TorusGeometry(1.22, 0.12, 8, 32);
  for (const z of [-0.26, 0.26]) s.mesh(rim, wood, [0, 0, z], wheel);
  s.mesh(new THREE.TorusGeometry(0.3, 0.1, 6, 16), wood, [0, 0, 0], wheel);
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI) / 5;
    const spoke = s.box([0.075, 2.4, 0.12], 0xc59b67, [0, 0, 0], wheel);
    spoke.rotation.z = angle;
    const paddle = s.box(
      [0.5, 0.14, 0.65],
      0xb38151,
      [Math.sin(angle) * 1.19, Math.cos(angle) * 1.19, 0],
      wheel,
    );
    paddle.rotation.z = -angle;
  }
  const pip = pipDragon(s, [8.5, 0.15, -5.3]);
  const ripples = Array.from({ length: 12 }, (_, i) =>
    s.line(
      [
        [4.1 + (i % 3) * 0.7, 0.025, i * 2.8 - 14],
        [4.5 + (i % 3) * 0.7, 0.025, i * 2.8 - 14.08],
        [4.9 + (i % 3) * 0.7, 0.025, i * 2.8 - 14],
      ],
      0.025,
      0xbeede2,
    ),
  );
  const fish = s.group([5.5, -0.5, 0.4]);
  s.oval([0.3, 0.13, 0.13], 0xf3b173, [0, 0, 0], fish);
  s.mesh(new THREE.ConeGeometry(0.18, 0.25, 3), 0xea9667, [-0.37, 0, 0], fish).rotation.z =
    Math.PI / 2;
  s.oval([0.027, 0.027, 0.027], 0x304f4a, [0.2, 0.04, 0.1], fish);
  let previousTime = 0,
    crossing = 0;
  return {
    pieces,
    update(time, restored, excitement) {
      const dt = Math.min(0.05, Math.max(0, time - previousTime));
      previousTime = time;
      wheel.rotation.z = -time * 0.32;
      ripples.forEach((ripple, i) => {
        ripple.position.z = (time * 0.65 + i * 0.04) % 2.8;
      });
      const jump = (time * 0.7) % 7;
      fish.visible = jump < Math.PI;
      fish.position.y = Math.sin(jump) * 1.2 - 0.2;
      fish.rotation.z = Math.cos(jump) * 0.8;
      if (restored === 5) crossing = time === 0 ? 1 : Math.min(1, crossing + dt * 0.19);
      else crossing = 0;
      pip.root.position.x = 8.5 - crossing * 6.3;
      const ramp = Math.min(1, crossing / 0.12, (1 - crossing) / 0.12);
      pip.root.position.y =
        0.15 +
        ramp * 0.48 +
        (crossing > 0 && crossing < 1 ? Math.abs(Math.sin(time * 8)) * 0.035 : 0);
      pip.root.rotation.y = crossing > 0 && crossing < 1 ? -Math.PI / 2 : -0.35;
      pip.arms[0].rotation.z = 0.1;
      pip.arms[1].rotation.z =
        excitement > 0 || crossing === 1 ? -1.7 + Math.sin(time * 7) * 0.25 : -0.15;
      pip.feet.forEach((foot, i) => {
        foot.position.y =
          0.15 +
          (crossing > 0 && crossing < 1 ? Math.max(0, Math.sin(time * 8 + i * Math.PI)) * 0.15 : 0);
      });
    },
  };
}

export function picnicParty(s: WorldSculpt): Landmark {
  const canopy = s.group([-2.2, 0, -7.4]);
  canopy.name = 'picnic-party-canopy';
  for (const x of [-2.15, 2.15])
    for (const z of [-1.3, 1.3]) s.post(0.085, 3.4, cream, [x, 1.7, z], canopy);
  for (let i = 0; i < 10; i++) {
    for (const side of [-1, 1]) {
      const roof = s.box(
        [0.45, 0.075, 1.6],
        i % 2 ? cream : 0xf18864,
        [(i - 4.5) * 0.45, 3.65, side * 0.67],
        canopy,
      );
      roof.rotation.x = side * 0.36;
    }
    s.oval([0.225, 0.2, 0.04], i % 2 ? cream : 0xf18864, [(i - 4.5) * 0.45, 3.2, 1.43], canopy);
  }
  const party = s.group([0, 0, -5.25]);
  pennants(s, party, 9.5, 3.65, [0xf18f80, 0x66c6ad, 0xc495e0, 0xffcc57]);
  for (const x of [-4.75, 4.75]) s.post(0.06, 3.75, 0xd2b588, [x, 1.875, 0], party);
  const blanket = s.group([3, 0.03, 4.6]);
  s.box([4.5, 0.04, 2], cream, [0, 0, 0], blanket);
  blanket.rotation.y = -0.18;
  for (let i = 0; i < 7; i++) {
    s.box([0.18, 0.008, 2], 0xdf967e, [(i - 3) * 0.6, 0.027, 0], blanket);
  }
  const pieces = Array.from({ length: 5 }, (_, i) => {
    const basket = s.basket([-4.2 + i * 1.1, 0, -4.65], 0.82);
    s.oval(
      [0.43, 0.065, 0.3],
      [0xf18f80, 0x66c6ad, 0xc495e0, 0xffcc57, 0xa8c88a][i],
      [0, 0.52, 0],
      basket,
    );
    s.oval([0.15, 0.14, 0.14], 0xe7a368, [-0.12, 0.6, 0], basket);
    s.berry([0.15, 0.6, 0.03], 0.12, basket);
    return basket;
  });
  const bell = s.group([4.75, 3, -5.25]);
  s.mesh(new THREE.CylinderGeometry(0.13, 0.3, 0.42, 16), 0xf3cc6d, [0, -0.2, 0], bell);
  s.oval([0.06, 0.1, 0.06], wood, [0, -0.45, 0], bell);
  const balloons = [0xf18f80, 0xc2a9d9, 0xf5d47b].map((color, i) => {
    const balloon = s.group([5.5 + i * 0.55, 0, -7.4 + i * 0.2]);
    s.line(
      [
        [0, 0, 0],
        [0.1, 1.7, 0],
        [0, 3.1 + i * 0.3, 0],
      ],
      0.012,
      cream,
      balloon,
    );
    s.oval([0.4, 0.53, 0.4], color, [0, 3.6 + i * 0.3, 0], balloon);
    s.oval([0.08, 0.17, 0.035], cream, [-0.13, 3.73 + i * 0.3, 0.35], balloon);
    return balloon;
  });
  return {
    pieces,
    update(time, _restored, excitement) {
      bell.rotation.z = Math.sin(time * 12) * excitement * 0.5;
      balloons.forEach((balloon, i) => {
        balloon.rotation.z = Math.sin(time * 0.8 + i) * 0.055;
      });
    },
  };
}

export function fireflyFalls(s: WorldSculpt, water: number): Landmark {
  const pool = s.disk(4.1, water, [5.6, -0.035, -5.4]);
  pool.scale.y = 1.35;
  pool.name = 'moonlit-waterfall-pool';
  for (let i = 0; i < 9; i++)
    s.oval([0.95, 0.8 + (i % 3) * 0.6, 0.95], [0x627b85, 0x789290, 0x526b7c][i % 3], [
      4 + (i % 3) * 1.2,
      0.45 + Math.floor(i / 3) * 1.3,
      -8.4 - Math.floor(i / 3) * 0.2,
    ]);
  const waterfall = s.group([5.2, 0, -7.95]);
  s.box([1.55, 4.45, 0.24], 0x66d3e6, [0, 2.2, 0], waterfall);
  const streams = Array.from({ length: 7 }, (_, i) =>
    s.oval(
      [0.035 + (i % 2) * 0.025, 0.3 + (i % 3) * 0.11, 0.04],
      0xc2eee2,
      [(i - 3) * 0.21, 1, 0.16],
      waterfall,
      true,
    ),
  );
  const ripples = Array.from({ length: 3 }, () => {
    const ring = s.mesh(new THREE.TorusGeometry(0.8, 0.024, 5, 40), 0xa0d8d6, [5.2, 0.02, -7.4]);
    ring.rotation.x = -Math.PI / 2;
    return ring;
  });
  // The crescent is a solid curved silhouette, rather than a sky-colored disk over the trees.
  const crescent = new THREE.Shape();
  crescent.moveTo(0.4, 0.9);
  crescent.bezierCurveTo(-1, 1.1, -1.1, -0.9, 0.35, -0.85);
  crescent.bezierCurveTo(-0.35, -0.35, -0.33, 0.42, 0.4, 0.9);
  const moon = s.mesh(
    new THREE.ShapeGeometry(crescent),
    0xffe6a0,
    [-7.3, 4.8, -7],
    undefined,
    true,
  );
  moon.rotation.y = 0.3;
  const lanterns = s.group([-1.4, 0, -5.1]);
  lanterns.name = 'five-firefly-lanterns';
  const pieces = Array.from({ length: 5 }, (_, i) => {
    const x = (i - 2) * 1.4,
      y = 1.9 + (i % 2) * 0.4;
    s.post(0.055, y + 0.6, 0x90afa1, [x, (y + 0.6) / 2, 0], lanterns);
    s.line(
      [
        [x, y + 0.6, 0],
        [x + 0.36, y + 0.78, 0],
        [x + 0.55, y + 0.52, 0],
      ],
      0.045,
      0x90afa1,
      lanterns,
    );
    const casing = s.group([x + 0.5, y, 0], lanterns);
    s.post(0.28, 0.07, 0xa4bfaf, [0, -0.33, 0], casing);
    s.mesh(new THREE.ConeGeometry(0.35, 0.2, 6), 0x87a797, [0, 0.39, 0], casing);
    for (const side of [-1, 1]) s.post(0.025, 0.65, 0x87a797, [side * 0.24, 0, 0], casing);
    s.oval([0.2, 0.26, 0.2], 0x3c6768, [0, 0, 0], casing);
    return s.oval([0.205, 0.27, 0.205], 0xffe299, [0, 0, 0.03], casing, true);
  });
  for (let i = 0; i < 12; i++)
    s.mushroom(
      [i % 2 ? -7 - (i % 3) * 0.5 : 7.9 + (i % 3) * 0.5, 0, -3 + Math.floor(i / 2) * 1.7],
      [0x9ebbd3, 0xb3a5d1, 0x86c6bd][i % 3],
      0.55 + (i % 3) * 0.25,
      true,
    );
  const fireflies = Array.from({ length: 34 }, (_, i) => {
    const fly = s.oval(
      [0.045, 0.06, 0.045],
      i % 3 ? 0xffdf91 : 0xb7eed9,
      [0, 0, 0],
      undefined,
      true,
    );
    fly.name = 'little-firefly-glow';
    return fly;
  });
  const lumi = s.group([-6.1, 1.8, -3.9]);
  lumi.name = 'lumi-the-firefly';
  s.oval([0.25, 0.32, 0.23], 0x769d9a, [0, 0, 0], lumi);
  s.oval([0.2, 0.23, 0.18], 0xffe5a4, [0, -0.18, 0.09], lumi, true);
  s.oval([0.25, 0.22, 0.22], 0x95c0ad, [0, 0.32, 0], lumi);
  const wings = [-1, 1].map((side) => {
    s.oval([0.03, 0.045, 0.025], 0x273d49, [side * 0.09, 0.35, 0.2], lumi);
    return s.oval([0.28, 0.15, 0.06], 0xb2c9dd, [side * 0.3, 0.14, -0.06], lumi);
  });
  return {
    pieces,
    update(time, restored, excitement) {
      streams.forEach((stream, i) => {
        stream.position.y = 4.4 - ((time * 2.2 + i * 0.6) % 4.2);
      });
      ripples.forEach((ring, i) => {
        const scale = 0.4 + ((time * 0.45 + i * 0.65) % 2);
        ring.scale.set(scale, scale * 0.6, 1);
      });
      fireflies.forEach((fly, i) => {
        const angle = time * 0.15 + excitement * 0.7 + i * 2.399;
        const radius = THREE.MathUtils.lerp(3 + (i % 9) * 0.7, 2 + (i % 7) * 0.25, excitement);
        fly.position.set(
          Math.cos(angle) * radius - 0.8,
          0.8 + (i % 6) * 0.55 + Math.sin(time * 1.1 + i) * 0.25,
          -3 + Math.sin(angle) * radius * 0.7,
        );
        const twinkle = 0.7 + (Math.sin(time * 2 + i) + 1) * 0.35 + restored * 0.06;
        fly.scale.set(0.045 * twinkle, 0.06 * twinkle, 0.045 * twinkle);
      });
      lumi.position.y = 1.8 + Math.sin(time * 1.9) * 0.17;
      wings.forEach((wing, i) => {
        wing.rotation.y = Math.sin(time * 20) * 0.4 * (i ? 1 : -1);
      });
    },
  };
}
