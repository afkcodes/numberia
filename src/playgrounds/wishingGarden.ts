import * as THREE from 'three';
import type { Landmark } from './landmarks.ts';
import type { Point, WorldSculpt } from './sculpt.ts';

const colors = {
  bark: 0xa9764b,
  barkLight: 0xbf915c,
  barkDark: 0x7a5437,
  cream: 0xffedc4,
  gold: 0xffca56,
  pink: 0xf24f93,
  mint: 0x39ab64,
  teal: 0x148c78,
  lilac: 0x9c58e0,
};

function starShape() {
  const shape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const angle = Math.PI / 2 + (i * Math.PI) / 5,
      radius = i % 2 ? 0.46 : 1;
    const x = Math.cos(angle) * radius,
      y = Math.sin(angle) * radius;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return new THREE.ExtrudeGeometry(shape, {
    depth: 0.14,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.05,
    bevelThickness: 0.04,
  });
}

/** A living storybook garden, with the open foreground reserved for Milo and answers. */
export function wishingGarden(s: WorldSculpt): Landmark {
  const starGeometry = starShape();
  function star(position: Point, size: number, parent?: THREE.Object3D, luminous = true) {
    const object = s.mesh(starGeometry, colors.gold, position, parent, luminous);
    object.scale.setScalar(size);
    object.rotation.y = 0.3;
    return object;
  }

  // The path winds into the garden instead of slicing straight through it.
  const path = new THREE.Shape();
  path.moveTo(-5, -17);
  path.bezierCurveTo(-5, -9, 0, -6, -0.6, -3);
  path.bezierCurveTo(-1, 0, -4.8, 1, -4.3, 4.9);
  path.lineTo(-1.7, 4.9);
  path.bezierCurveTo(-2.4, 2, 2.7, 1, 2.5, -3);
  path.bezierCurveTo(2.3, -8, -2.2, -10, -2, -17);
  path.closePath();
  const trail = s.mesh(new THREE.ShapeGeometry(path, 36), 0xd8ad73, [0, -0.09, 0]);
  trail.rotation.x = -Math.PI / 2;
  trail.castShadow = false;
  const clearing = s.disk(6.5, 0xe4bd83, [-1.05, -0.075, 0.1]);
  clearing.scale.y = 0.79;
  const rootBed = s.disk(3.6, 0x4d913f, [0.65, -0.07, -6.4]);
  rootBed.scale.y = 0.7;

  const trees = [
    [-11, -9, 1.6],
    [-5.9, -12.7, 1.25],
    [5.8, -13, 1.45],
    [10.4, -8, 1.25],
    [-12, 3.9, 1.2],
    [11.2, 4.8, 1.25],
    [-6.8, 9.8, 0.75],
    [7.9, 9.5, 0.8],
  ];
  trees.forEach(([x, z, size], i) =>
    s.tree(x, z, size, i % 3 ? [0x146e45, 0x319448, 0x76b442] : [0x22855e, 0x63aa43, 0xf28db6]),
  );

  const tree = s.group([0.65, 0, -6.65]);
  tree.name = 'the-ancient-wishing-tree';
  tree.rotation.y = 0.25;
  // Overlapping tapered curves give the trunk a soft, irregular silhouette.
  s.mesh(new THREE.CylinderGeometry(0.73, 1.27, 4.6, 20), colors.bark, [0, 2.15, 0], tree);
  s.oval([0.86, 1.66, 0.72], colors.bark, [0.12, 2.9, -0.12], tree);
  for (let i = 0; i < 7; i++) {
    const angle = (i * Math.PI * 2) / 7;
    const x = Math.sin(angle),
      z = Math.cos(angle);
    s.line(
      [
        [x * 0.43, 1, z * 0.43],
        [x * 1.18, 0.26, z * 1.04],
        [x * 1.86, 0.08, z * 1.57],
        [x * 2.25, 0.045, z * 1.7],
      ],
      0.21,
      colors.bark,
      tree,
    );
  }
  for (const side of [-1, 1]) {
    s.line(
      [
        [side * 0.45, 2.7, -0.1],
        [side * 1.4, 3.65, -0.15],
        [side * 2.7, 4.05, -0.15],
        [side * 3.7, 4.9, -0.05],
      ],
      0.23,
      colors.bark,
      tree,
    );
    s.line(
      [
        [side * 0.4, 3.3, 0],
        [side * 1.2, 4.9, 0.1],
        [side * 2.2, 5.7, 0],
      ],
      0.18,
      colors.barkLight,
      tree,
    );
    s.line(
      [
        [side * 0.64, 0.7, 0.72],
        [side * 0.55, 1.8, 0.91],
        [side * 0.6, 2.4, 0.83],
      ],
      0.022,
      colors.barkDark,
      tree,
    );
  }
  const canopies: Point[] = [
    [-3.2, 4.95, -0.45],
    [-1.85, 5.7, -0.5],
    [0, 6.1, -0.5],
    [1.8, 5.85, -0.45],
    [3.25, 5, -0.4],
    [-0.65, 5.08, 0.75],
    [1.05, 5.15, 0.85],
  ];
  canopies.forEach((point, i) => {
    const crown = s.group(point, tree);
    s.oval(
      [1.75, 1.12, 1.45],
      [0x126b42, 0x27893f, 0x65a738, 0x188259, 0x439940, 0x2c904d, 0x58a33d][i],
      [0, 0, 0],
      crown,
    );
    s.oval([0.78, 0.69, 0.76], [0x75b747, 0x31a162, 0x94c454][i % 3], [-0.58, 0.61, 0.03], crown);
    // Little blossom clusters and distinct leaves give the crown a softer edge.
    for (let j = 0; j < 4; j++) {
      const x = Math.cos(j * 2.2 + i) * 1.13,
        y = Math.sin(j * 2.2) * 0.62;
      s.oval([0.22, 0.15, 0.15], j % 2 ? 0xf865a0 : 0xffb04d, [x, y, 1.13], crown);
      s.leaf(j % 2 ? 0x279253 : 0x80b645, [x + 0.12, y - 0.13, 1.16], 0.27, crown);
    }
  });

  // Friendly sleepy eyes awaken as the five discoveries arrive.
  const face = s.group([0, 2.65, 0.86], tree);
  face.name = 'wishing-tree-face';
  const openEyes = [-1, 1].map((side) => {
    s.oval([0.31, 0.32, 0.06], 0xb68954, [side * 0.4, 0.16, 0.055], face);
    const eye = s.group([side * 0.4, 0.17, 0.12], face);
    s.oval([0.14, 0.22, 0.085], 0x443c36, [0, 0, 0], eye);
    s.oval([0.045, 0.058, 0.02], 0xfff6df, [-0.035, 0.07, 0.08], eye);
    s.line(
      [
        [side * 0.4 - 0.17, 0.13, 0.2],
        [side * 0.4, 0.055, 0.23],
        [side * 0.4 + 0.17, 0.13, 0.2],
      ],
      0.029,
      colors.barkDark,
      face,
    );
    s.oval([0.16, 0.065, 0.028], 0xeaa285, [side * 0.67, -0.12, 0.06], face);
    s.line(
      [
        [side * 0.4 - 0.2, 0.51, 0.04],
        [side * 0.4, 0.56, 0.07],
        [side * 0.4 + 0.18, 0.49, 0.04],
      ],
      0.042,
      colors.barkLight,
      face,
    );
    return eye;
  });
  s.oval([0.17, 0.12, 0.13], colors.barkLight, [0, -0.04, 0.16], face);
  s.line(
    [
      [-0.26, -0.28, 0.12],
      [0, -0.39, 0.17],
      [0.26, -0.28, 0.12],
    ],
    0.025,
    colors.barkDark,
    face,
  );

  // A heart-shaped opening, with a real hinged door and a warm space behind it.
  const doorFrame = s.group([0, 0.05, 1.19], tree);
  s.box([1.16, 1.06, 0.12], colors.barkDark, [0, 0.57, 0], doorFrame);
  s.oval([0.58, 0.59, 0.065], colors.barkDark, [0, 1.07, 0], doorFrame);
  s.box([0.96, 1.03, 0.13], 0xffd77d, [0, 0.57, 0.02], doorFrame);
  s.oval([0.48, 0.5, 0.06], 0xffd77d, [0, 1.08, 0.05], doorFrame, true);
  const gift = star([0, 0.75, 0.16], 0.23, doorFrame);
  const door = s.group([-0.5, 0, 0.15], doorFrame);
  door.name = 'wishing-tree-door';
  s.box([1, 1.06, 0.14], 0xefba65, [0.5, 0.56, 0], door);
  s.oval([0.5, 0.5, 0.074], 0xefba65, [0.5, 1.08, 0], door);
  for (const x of [0.23, 0.5, 0.77]) s.box([0.018, 1.22, 0.016], 0xcd934d, [x, 0.69, 0.085], door);
  s.oval([0.07, 0.07, 0.07], 0xffe7a0, [0.83, 0.57, 0.14], door);
  star([0.5, 1.14, 0.1], 0.12, door, false);
  for (let i = 0; i < 3; i++)
    s.oval([0.8 + i * 0.19, 0.075, 0.25], 0xd9c496, [0, 0.13 - i * 0.035, 1.51 + i * 0.31], tree);

  // Five clearly separate gold leaves are the chapter's permanent achievement markers.
  const pieces = [-3.25, -1.67, 0, 1.67, 3.25].map((x, i) => {
    const y = 3.7 + (2 - Math.abs(i - 2)) * 0.47;
    s.line(
      [
        [x, y + 0.82, 2.05],
        [x + 0.05, y + 0.38, 2.57],
      ],
      0.024,
      0xd9b580,
      tree,
    );
    const cradle = s.leaf(0x619c78, [x, y, 2.61], 0.8, tree);
    cradle.rotation.z = (i - 2) * 0.14;
    const piece = s.group([x, y, 2.75], tree);
    s.leaf(colors.gold, [0, 0, 0], 0.8, piece, true).rotation.z = 0;
    s.line(
      [
        [0, -0.32, 0.1],
        [0.015, 0.1, 0.11],
        [0, 0.42, 0.1],
      ],
      0.016,
      0xfff0b8,
      piece,
    );
    for (const side of [-1, 1])
      s.line(
        [
          [0, -0.1, 0.1],
          [side * 0.16, 0.08, 0.1],
        ],
        0.012,
        0xfff0b8,
        piece,
      );
    return piece;
  });

  // A watchful owl makes the upper branches feel inhabited.
  s.line(
    [
      [2.7, 3.95, 0.3],
      [3.3, 3.53, 1.18],
      [4.25, 3.55, 1.6],
    ],
    0.1,
    colors.bark,
    tree,
  );
  const owl = s.group([3.72, 3.56, 1.65], tree);
  owl.rotation.y = -0.08;
  owl.name = 'wishing-owl';
  s.oval([0.33, 0.43, 0.28], 0xae805d, [0, 0.38, 0], owl);
  s.oval([0.23, 0.28, 0.07], colors.cream, [0, 0.32, 0.25], owl);
  s.oval([0.37, 0.28, 0.3], 0xae805d, [0, 0.81, 0], owl);
  for (const side of [-1, 1]) {
    s.oval([0.15, 0.17, 0.06], colors.cream, [side * 0.16, 0.83, 0.27], owl);
    s.oval([0.047, 0.066, 0.04], 0x393e38, [side * 0.15, 0.83, 0.32], owl);
    s.leaf(0xae805d, [side * 0.24, 1.08, 0], 0.25, owl).rotation.z = side * -0.3;
    s.oval([0.11, 0.27, 0.1], 0x8b684e, [side * 0.3, 0.4, 0.07], owl);
    s.oval([0.11, 0.045, 0.1], 0xd9a75c, [side * 0.16, 0.055, 0.11], owl);
  }
  s.mesh(new THREE.ConeGeometry(0.066, 0.16, 4), 0xf6bf64, [0, 0.71, 0.35], owl).rotation.x =
    -Math.PI / 2;

  // An open star fountain replaces the cramped roofed well and stays outside Milo's route.
  const fountain = s.group([-8.65, 0, 0.7]);
  fountain.name = 'wishing-star-fountain';
  s.post(1.12, 0.22, 0xc8b99b, [0, 0.11, 0], fountain);
  s.post(0.94, 0.17, 0x1abbb8, [0, 0.29, 0], fountain);
  s.mesh(new THREE.TorusGeometry(1.02, 0.15, 10, 40), 0xf1d8a3, [0, 0.34, 0], fountain).rotation.x =
    Math.PI / 2;
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const petal = s.oval(
      [0.24, 0.12, 0.5],
      i % 2 ? 0xe5c6d8 : 0xf4d5b0,
      [Math.sin(a) * 1.04, 0.28, Math.cos(a) * 1.04],
      fountain,
    );
    petal.rotation.y = a;
  }
  s.post(0.18, 0.47, 0xd1b481, [0, 0.62, 0], fountain);
  s.oval([0.42, 0.13, 0.42], 0xffdd9a, [0, 0.91, 0], fountain);
  const fountainStar = star([0, 1.51, 0], 0.42, fountain);
  fountainStar.name = 'tap-to-make-a-wish';
  const waterRings = Array.from({ length: 2 }, (_, i) => {
    const ring = s.mesh(
      new THREE.TorusGeometry(0.52, 0.018, 4, 32),
      0xcbf5d5,
      [0, 0.39, 0],
      fountain,
    );
    ring.rotation.x = Math.PI / 2;
    ring.scale.setScalar(0.9 + i * 0.45);
    return ring;
  });

  // Layered garden borders, mushroom seats, and hanging lights frame the open play space.
  const beds: Point[] = [
    [-7.3, 0, -4.8],
    [-8.35, 0, 4.5],
    [6.2, 0, -3.8],
    [7.2, 0, 1.25],
    [5.6, 0, 6.1],
  ];
  const gardenLights: THREE.Mesh[] = [];
  beds.forEach(([x, , z], i) => {
    const bed = s.disk(1.32, 0x286b3b, [x, -0.06, z]);
    bed.scale.y = 0.76;
    s.oval([0.83, 0.43, 0.57], i % 2 ? 0x268a4c : 0x57a647, [x, 0.2, z]);
    for (let j = 0; j < 5; j++) {
      const angle = j * 1.25;
      s.flower(
        x + Math.sin(angle) * 1.14,
        z + Math.cos(angle) * 0.84,
        [colors.pink, colors.gold, colors.lilac, 0xff853e, 0x30b5ea][i],
        1.15 + (j % 2) * 0.2,
      );
    }
    const lantern = s.group([x + 0.22, 0, z - 0.22]);
    s.post(0.044, 1.12, colors.barkLight, [0, 0.56, 0], lantern);
    s.mesh(new THREE.ConeGeometry(0.29, 0.25, 6), colors.lilac, [0, 1.36, 0], lantern);
    s.oval([0.21, 0.26, 0.21], 0xbaae88, [0, 1.1, 0], lantern);
    gardenLights.push(s.oval([0.215, 0.265, 0.215], 0xffdb82, [0, 1.1, 0], lantern, true));
  });
  for (const [x, z, size] of [
    [-7, 3, 0.9],
    [6.4, 3.3, 1.2],
    [7.4, 3.8, 0.85],
  ])
    s.mushroom([x, 0, z], colors.pink, size);
  for (const side of [-1, 1]) {
    const points: Point[] = [
      [side * 3.5 + 0.65, 4, -6],
      [side * 5.9, 2.8, -5.4],
      [side * 8.3, 3.1, -4.6],
    ];
    const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
    s.line(points, 0.022, colors.cream);
    for (let i = 1; i < 6; i++) {
      const point = curve.getPoint(i / 6);
      s.oval(
        [0.15, 0.21, 0.15],
        [colors.gold, colors.pink, colors.lilac][i % 3],
        [point.x, point.y - 0.18, point.z],
        undefined,
        true,
      );
    }
  }

  const wish = s.group();
  wish.name = 'travelling-wish';
  star([0, 0, 0], 0.25, wish);
  const sparkleGeometry = new THREE.OctahedronGeometry(0.06);
  const sparkles = Array.from({ length: 16 }, (_, i) =>
    s.mesh(sparkleGeometry, i % 2 ? colors.gold : 0xffdce8, [0, 0, 0], undefined, true),
  );
  const petals = Array.from({ length: 18 }, (_, i) =>
    s.leaf(i % 2 ? colors.pink : 0xffe0a5, [0, 0, 0], 0.11),
  );
  const wishCurve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(-8.65, 1.6, 0.7),
    new THREE.Vector3(-6.8, 5, -1.3),
    new THREE.Vector3(-1.4, 5.9, -4.8),
    new THREE.Vector3(0.65, 2.65, -5.6),
  );
  let wishAt = -10,
    discoveryAt = -10,
    previousRestored = 0;
  return {
    pieces,
    interactionTargets: [tree, fountain],
    interact(time) {
      wishAt = time;
    },
    update(time, restored, excitement) {
      if (restored > previousRestored) discoveryAt = time;
      previousRestored = restored;
      const celebration = time > 0 ? Math.max(0, 1 - (time - discoveryAt) / 3) : 0;
      const awake = restored / 5;
      const blink = time > 0 && time % 8.5 > 8.32 ? 0.08 : 1;
      openEyes.forEach((eye) => {
        eye.scale.y = Math.max(
          0.04,
          Math.min(1, awake * 0.9 + excitement * 0.65 + celebration * 0.8) * blink,
        );
      });
      face.rotation.z = Math.sin(time * 0.65) * 0.018 * awake;
      const opening =
        restored === 5 ? (time === 0 ? 1 : Math.min(1, (time - discoveryAt) / 1.2)) : 0;
      door.rotation.y = -1.45 * (1 - Math.pow(1 - opening, 3)) - excitement * 0.12 * (1 - opening);
      gift.visible = restored === 5;
      gardenLights.forEach((light, i) => {
        light.visible = i < restored;
      });
      owl.rotation.y = -0.08 + Math.sin(time * 0.7) * 0.12;
      owl.rotation.z = Math.sin(time * 0.8) * 0.025;
      fountainStar.position.y = 1.51 + Math.sin(time * 1.4) * 0.12;
      fountainStar.rotation.y = 0.3 + Math.sin(time * 0.7) * 0.28;
      waterRings.forEach((ring, i) => ring.scale.setScalar(0.7 + ((time * 0.22 + i * 0.4) % 0.7)));
      pieces.forEach((piece, i) => {
        piece.rotation.z = Math.sin(time * 1.1 + i) * 0.09;
      });
      const age = time === 0 ? -1 : time - wishAt,
        travel = Math.min(1, Math.max(0, age / 3.1));
      wish.visible = time > 0 && age >= 0 && age < 3.1;
      wish.position.copy(wishCurve.getPoint(travel));
      wish.rotation.z = time * 0.8;
      sparkles.forEach((sparkle, i) => {
        const tail = travel - i * 0.018;
        sparkle.visible = wish.visible && tail > 0;
        sparkle.position.copy(wishCurve.getPoint(Math.max(0, tail)));
        sparkle.position.y += Math.sin(time * 4 + i) * 0.1;
      });
      petals.forEach((petal, i) => {
        const t = time * (restored === 5 ? 0.3 : 0.16) + i * 0.47;
        petal.position.set(
          0.65 + Math.sin(t * 0.7 + i) * 4.3,
          0.15 + (6.6 - (t % 6.6)),
          -5.8 + Math.cos(i * 2.3) * 1.8,
        );
        petal.rotation.set(t * 0.3, t + i, Math.sin(t) * 0.5);
      });
    },
  };
}
