import * as THREE from 'three';

type Material = (color: number) => THREE.MeshStandardMaterial;
function sculpt(parent: THREE.Object3D, material: Material) {
  const mesh = (
    geometry: THREE.BufferGeometry,
    color: number,
    pos: [number, number, number],
    target = parent,
  ) => {
    const m = new THREE.Mesh(geometry, material(color));
    m.position.set(...pos);
    m.castShadow = true;
    m.receiveShadow = true;
    target.add(m);
    return m;
  };
  const oval = (
    size: [number, number, number],
    color: number,
    pos: [number, number, number],
    target = parent,
  ) => {
    const m = mesh(new THREE.SphereGeometry(1, 24, 16), color, pos, target);
    m.scale.set(...size);
    return m;
  };
  const capsule = (
    radius: number,
    length: number,
    color: number,
    pos: [number, number, number],
    target = parent,
  ) => mesh(new THREE.CapsuleGeometry(radius, length, 6, 14), color, pos, target);
  const curve = (
    points: [number, number, number][],
    radius: number,
    color: number,
    target = parent,
  ) =>
    mesh(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))),
        16,
        radius,
        6,
        false,
      ),
      color,
      [0, 0, 0],
      target,
    );
  return { mesh, oval, capsule, curve };
}

/** Articulated, smooth storybook children. Knees and elbows keep seated poses believable. */
export function createChild(
  material: Material,
  shirt: number,
  skin: number,
  hair: number,
  variant: number,
) {
  const group = new THREE.Group();
  const { mesh, oval, capsule, curve } = sculpt(group, material);
  const cream = 0xfff6e8,
    denim = 0x557b8b,
    ink = 0x333b37;
  const torso = capsule(0.235, 0.25, shirt, [0, 0.81, 0]);
  torso.scale.set(1, 1, 0.82);
  oval([0.23, 0.14, 0.19], denim, [0, 0.56, 0]);
  capsule(0.095, 0.1, skin, [0, 1.075, 0]);
  const collar = mesh(new THREE.TorusGeometry(0.11, 0.025, 8, 24), cream, [0, 1.02, 0.015]);
  collar.rotation.x = Math.PI / 2;
  oval([0.039, 0.039, 0.009], cream, [0.1, 0.83, 0.202]);
  const head = new THREE.Group();
  head.position.set(0, 1.3, 0.018);
  group.add(head);
  oval([0.3, 0.315, 0.285], skin, [0, 0, 0], head);
  for (const sign of [-1, 1]) {
    oval([0.066, 0.085, 0.055], skin, [sign * 0.286, -0.016, 0], head);
    oval([0.032, 0.05, 0.024], 0xc58e77, [sign * 0.307, -0.017, 0.04], head);
  }
  for (const sign of [-1, 1]) {
    oval([0.065, 0.071, 0.012], cream, [sign * 0.109, 0.037, 0.271], head);
    oval([0.034, 0.043, 0.008], 0x614c36, [sign * 0.109, 0.037, 0.283], head);
    oval([0.022, 0.031, 0.006], ink, [sign * 0.108, 0.037, 0.292], head);
    oval([0.009, 0.011, 0.004], 0xffffff, [sign * 0.108 - 0.009, 0.05, 0.299], head);
    curve(
      [
        [sign * 0.17, 0.14, 0.248],
        [sign * 0.12, 0.156, 0.266],
        [sign * 0.066, 0.147, 0.262],
      ],
      0.012,
      hair,
      head,
    );
    oval([0.055, 0.029, 0.008], 0xd99584, [sign * 0.175, -0.065, 0.234], head);
  }
  oval([0.043, 0.048, 0.047], skin, [0, -0.035, 0.293], head);
  curve(
    [
      [-0.062, -0.114, 0.251],
      [0, -0.132, 0.267],
      [0.065, -0.11, 0.25],
    ],
    0.011,
    0x985d4e,
    head,
  );
  const hairCap = mesh(
    new THREE.SphereGeometry(0.314, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.52),
    hair,
    [0, 0.07, -0.035],
    head,
  );
  hairCap.scale.z = 1.02;
  if (variant % 3 === 0) {
    for (let i = 0; i < 7; i++) {
      const a = (i / 6) * Math.PI;
      oval(
        [0.084, 0.077, 0.078],
        hair,
        [Math.cos(a) * 0.25, 0.16 + Math.sin(a) * 0.09, 0.17],
        head,
      );
    }
    for (const sign of [-1, 1]) oval([0.11, 0.13, 0.11], hair, [sign * 0.25, 0.16, -0.15], head);
  } else if (variant % 3 === 1) {
    const fringe = oval([0.21, 0.105, 0.105], hair, [-0.07, 0.186, 0.205], head);
    fringe.rotation.z = -0.3;
    oval([0.09, 0.09, 0.085], hair, [0.17, 0.15, 0.17], head);
  } else {
    oval([0.16, 0.1, 0.12], hair, [0.04, 0.2, 0.19], head);
    for (const sign of [-1, 1]) {
      oval([0.13, 0.14, 0.13], hair, [sign * 0.31, 0.07, -0.15], head);
      oval([0.053, 0.043, 0.053], shirt, [sign * 0.29, 0.09, -0.11], head);
    }
  }
  const forearms: THREE.Group[] = [];
  const arms = [-1, 1].map((sign) => {
    const limb = new THREE.Group();
    limb.position.set(sign * 0.25, 0.97, 0);
    limb.rotation.z = sign * 0.09;
    group.add(limb);
    capsule(0.076, 0.12, shirt, [0, -0.09, 0], limb);
    const elbow = new THREE.Group();
    elbow.position.y = -0.2;
    limb.add(elbow);
    forearms.push(elbow);
    capsule(0.055, 0.12, skin, [0, -0.07, 0], elbow);
    oval([0.064, 0.078, 0.046], skin, [0, -0.19, 0.005], elbow);
    oval([0.028, 0.044, 0.027], skin, [-sign * 0.052, -0.17, 0.016], elbow);
    return limb;
  });
  const knees: THREE.Group[] = [];
  const legs = [-1, 1].map((sign) => {
    const limb = new THREE.Group();
    limb.position.set(sign * 0.126, 0.57, 0);
    group.add(limb);
    capsule(0.092, 0.13, denim, [0, -0.106, 0], limb);
    const knee = new THREE.Group();
    knee.position.y = -0.23;
    limb.add(knee);
    knees.push(knee);
    capsule(0.074, 0.145, denim, [0, -0.097, 0], knee);
    oval([0.107, 0.045, 0.158], cream, [0, -0.248, 0.045], knee);
    oval([0.099, 0.075, 0.145], shirt, [0, -0.205, 0.048], knee);
    for (let i = 0; i < 2; i++)
      curve(
        [
          [-0.051, -0.151, 0.056 + i * 0.04],
          [0, -0.139, 0.058 + i * 0.04],
          [0.052, -0.151, 0.056 + i * 0.04],
        ],
        0.01,
        cream,
        knee,
      );
    return limb;
  });
  const sit = (angle = -1.35) => {
    legs.forEach((l) => {
      l.rotation.x = angle;
    });
    knees.forEach((k) => {
      k.rotation.x = 1.15;
    });
  };
  const walk = (time: number, speed = 7) => {
    legs.forEach((l, i) => {
      const phase = time * speed + i * Math.PI;
      l.rotation.x = Math.sin(phase) * 0.48;
      knees[i].rotation.x = Math.max(0, -Math.sin(phase)) * 0.6;
    });
    arms.forEach((a, i) => {
      a.rotation.x = -Math.sin(time * speed + i * Math.PI) * 0.35;
      forearms[i].rotation.x = -0.25;
    });
  };
  const expression = (time: number) => {
    head.rotation.z = Math.sin(time * 0.6 + variant) * 0.035;
  };
  return { group, head, arms, legs, knees, forearms, sit, walk, expression };
}

/** A soft grey tabby with a white bib, almond eyes, articulated paws, and a curved tail. */
export function createCat(material: Material) {
  const group = new THREE.Group();
  group.name = 'roaming-cat';
  const { mesh, oval, capsule, curve } = sculpt(group, material);
  const fur = 0x929ba5,
    dark = 0x63717e,
    white = 0xfff5e7,
    pink = 0xd99b9b,
    ink = 0x293638;
  const pattern = 0x939ca6;
  const body = oval([0.235, 0.245, 0.48], pattern, [0, 0.47, 0]);
  oval([0.21, 0.25, 0.25], fur, [0, 0.5, 0.27]);
  oval([0.17, 0.22, 0.06], white, [0, 0.45, 0.468]);
  const head = new THREE.Group();
  head.position.set(0, 0.75, 0.41);
  group.add(head);
  oval([0.264, 0.228, 0.229], fur, [0, 0, 0], head);
  const earShape = new THREE.Shape();
  earShape.moveTo(-0.105, 0);
  earShape.quadraticCurveTo(-0.07, 0.19, 0, 0.23);
  earShape.quadraticCurveTo(0.07, 0.19, 0.105, 0);
  earShape.closePath();
  for (const sign of [-1, 1]) {
    const ear = mesh(
      new THREE.ExtrudeGeometry(earShape, {
        depth: 0.038,
        bevelEnabled: true,
        bevelSegments: 3,
        steps: 1,
        bevelSize: 0.018,
        bevelThickness: 0.018,
      }),
      fur,
      [sign * 0.16, 0.144, -0.035],
      head,
    );
    ear.rotation.z = -sign * 0.18;
    const inside = mesh(
      new THREE.ShapeGeometry(earShape),
      pink,
      [sign * 0.161, 0.162, 0.025],
      head,
    );
    inside.scale.set(0.61, 0.65, 1);
    inside.rotation.z = -sign * 0.18;
    oval([0.07, 0.055, 0.009], white, [sign * 0.108, 0.021, 0.211], head);
    oval([0.04, 0.044, 0.008], 0x84aa6c, [sign * 0.108, 0.022, 0.222], head);
    oval([0.014, 0.036, 0.006], ink, [sign * 0.108, 0.022, 0.232], head);
    oval([0.009, 0.009, 0.005], 0xffffff, [sign * 0.108 - 0.009, 0.041, 0.24], head);
    oval([0.089, 0.063, 0.067], white, [sign * 0.066, -0.076, 0.2], head);
    for (const y of [-0.074, -0.102])
      curve(
        [
          [sign * 0.08, y, 0.244],
          [sign * 0.2, y - 0.005, 0.254],
          [sign * 0.32, y + 0.016, 0.246],
        ],
        0.0045,
        white,
        head,
      );
    curve(
      [
        [sign * 0.17, 0.088, 0.18],
        [sign * 0.12, 0.099, 0.207],
        [sign * 0.065, 0.09, 0.215],
      ],
      0.012,
      dark,
      head,
    );
  }
  oval([0.032, 0.021, 0.02], pink, [0, -0.064, 0.269], head);
  oval([0.073, 0.037, 0.045], white, [0, -0.136, 0.173], head);
  curve(
    [
      [0, -0.084, 0.264],
      [0, -0.109, 0.256],
      [-0.028, -0.117, 0.246],
    ],
    0.006,
    ink,
    head,
  );
  curve(
    [
      [0, -0.109, 0.256],
      [0.028, -0.117, 0.246],
    ],
    0.006,
    ink,
    head,
  );
  for (const x of [-0.068, 0, 0.068])
    curve(
      [
        [x, 0.192, 0.098],
        [x * 0.8, 0.156, 0.167],
        [x * 0.5, 0.124, 0.19],
      ],
      0.006,
      dark,
      head,
    );
  const furCanvas = typeof document === 'undefined' ? null : document.createElement('canvas');
  if (furCanvas) {
    furCanvas.width = 512;
    furCanvas.height = 256;
  }
  const brush = furCanvas?.getContext('2d');
  if (brush && furCanvas) {
    brush.fillStyle = '#ffffff';
    brush.fillRect(0, 0, 512, 256);
    brush.strokeStyle = '#b1b8bd';
    brush.lineCap = 'round';
    brush.lineWidth = 13;
    for (let i = 0; i < 11; i++) {
      const x = 12 + i * 49;
      brush.beginPath();
      brush.moveTo(x, 23);
      brush.bezierCurveTo(x - 22, 67, x + 21, 101, x - 6, 159);
      brush.stroke();
    }
    const texture = new THREE.CanvasTexture(furCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    material(pattern).map = texture;
    material(pattern).needsUpdate = true;
  }
  const tail = new THREE.Group();
  tail.position.set(0, 0.44, -0.42);
  group.add(tail);
  const tailPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0.18, -0.22),
    new THREE.Vector3(0.04, 0.57, -0.36),
    new THREE.Vector3(0.19, 0.71, -0.27),
    new THREE.Vector3(0.23, 0.58, -0.18),
  ]);
  mesh(new THREE.TubeGeometry(tailPath, 28, 0.063, 12, false), pattern, [0, 0, 0], tail);
  const tailTip = tailPath.getPoint(1);
  oval([0.063, 0.063, 0.063], fur, [tailTip.x, tailTip.y, tailTip.z], tail);
  const paws = [
    [-0.15, 0.28],
    [0.15, 0.28],
    [-0.155, -0.27],
    [0.155, -0.27],
  ].map(([x, z], i) => {
    const limb = new THREE.Group();
    limb.position.set(x, 0.47, z);
    group.add(limb);
    oval([0.086, 0.17, 0.105], fur, [0, -0.09, 0], limb);
    capsule(0.052, 0.13, fur, [0, -0.272, 0.005], limb);
    oval([0.078, 0.055, 0.109], white, [0, -0.402, 0.04], limb);
    for (const dx of [-0.025, 0.025])
      curve(
        [
          [dx, -0.39, 0.133],
          [dx, -0.419, 0.14],
        ],
        0.004,
        0xc9c0b4,
        limb,
      );
    limb.userData.phase = i === 0 || i === 3 ? 0 : Math.PI;
    return limb;
  });
  const update = (time: number, moving: boolean) => {
    body.position.y = 0.47 + (moving ? Math.sin(time * 7) * 0.012 : Math.sin(time * 2) * 0.006);
    paws.forEach((p) => {
      p.rotation.x = moving ? Math.sin(time * 7 + p.userData.phase) * 0.31 : 0;
    });
    tail.rotation.z = Math.sin(time * 1.8) * 0.14;
    head.rotation.y = moving ? Math.sin(time * 0.7) * 0.06 : Math.sin(time * 0.9) * 0.28;
    head.rotation.x = moving ? 0 : Math.sin(time * 1.2) * 0.08;
  };
  return { group, update };
}
