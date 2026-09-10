import * as THREE from 'three';

export type Point = [number, number, number];
export type MaterialFactory = (color: number) => THREE.MeshStandardMaterial;

/** Small, reusable sculpting pieces. Each scene owns and disposes its resources. */
export function sculptWorld(scene: THREE.Scene, material: MaterialFactory) {
  const sphere = new THREE.SphereGeometry(1, 18, 12);
  const cube = new THREE.BoxGeometry(1, 1, 1);
  const cylinder = new THREE.CylinderGeometry(1, 1, 1, 18);
  const glowMaterials = new Map<number, THREE.MeshStandardMaterial>();
  const glow = (color: number) => {
    if (!glowMaterials.has(color))
      glowMaterials.set(
        color,
        new THREE.MeshStandardMaterial({
          color,
          emissive: color,
          emissiveIntensity: 0.65,
          roughness: 0.45,
        }),
      );
    return glowMaterials.get(color)!;
  };
  function mesh(
    geometry: THREE.BufferGeometry,
    color: number,
    position: Point,
    parent: THREE.Object3D = scene,
    luminous = false,
  ) {
    const object = new THREE.Mesh(geometry, luminous ? glow(color) : material(color));
    object.position.set(...position);
    object.castShadow = !luminous;
    object.receiveShadow = true;
    parent.add(object);
    return object;
  }
  function group(position: Point = [0, 0, 0], parent: THREE.Object3D = scene) {
    const object = new THREE.Group();
    object.position.set(...position);
    parent.add(object);
    return object;
  }
  function oval(
    size: Point,
    color: number,
    position: Point,
    parent: THREE.Object3D = scene,
    luminous = false,
  ) {
    const object = mesh(sphere, color, position, parent, luminous);
    object.scale.set(...size);
    return object;
  }
  function box(size: Point, color: number, position: Point, parent: THREE.Object3D = scene) {
    const object = mesh(cube, color, position, parent);
    object.scale.set(...size);
    return object;
  }
  function post(
    radius: number,
    height: number,
    color: number,
    position: Point,
    parent: THREE.Object3D = scene,
  ) {
    const object = mesh(cylinder, color, position, parent);
    object.scale.set(radius, height, radius);
    return object;
  }
  function line(points: Point[], radius: number, color: number, parent: THREE.Object3D = scene) {
    return mesh(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))),
        20,
        radius,
        7,
        false,
      ),
      color,
      [0, 0, 0],
      parent,
    );
  }
  function disk(radius: number, color: number, position: Point, parent: THREE.Object3D = scene) {
    const object = mesh(new THREE.CircleGeometry(radius, 48), color, position, parent);
    object.rotation.x = -Math.PI / 2;
    object.castShadow = false;
    return object;
  }
  function leaf(
    color: number,
    position: Point,
    scale = 1,
    parent: THREE.Object3D = scene,
    luminous = false,
  ) {
    const object = oval(
      [0.32 * scale, 0.68 * scale, 0.11 * scale],
      color,
      position,
      parent,
      luminous,
    );
    object.rotation.z = -0.45;
    return object;
  }
  function tree(x: number, z: number, scale: number, colors: readonly number[]) {
    const root = group([x, 0, z]);
    root.scale.setScalar(scale);
    mesh(new THREE.CylinderGeometry(0.16, 0.26, 2.5, 10), 0x987550, [0, 1.1, 0], root);
    line(
      [
        [0, 1, 0],
        [-0.45, 1.8, 0],
        [-0.7, 2.3, 0],
      ],
      0.11,
      0x987550,
      root,
    );
    oval([1.15, 1.35, 1], colors[0], [0, 2.8, 0], root);
    oval([0.8, 0.8, 0.8], colors[1], [-0.65, 2.25, 0.16], root);
    oval([0.7, 0.95, 0.75], colors[2], [0.62, 2.5, 0.06], root);
    return root;
  }
  function flower(x: number, z: number, color: number, size = 1) {
    const root = group([x, 0, z]);
    root.scale.setScalar(size);
    post(0.022, 0.3, 0x558466, [0, 0.14, 0], root);
    for (let i = 0; i < 5; i++)
      oval(
        [0.095, 0.04, 0.12],
        color,
        [Math.sin(i * 1.256) * 0.1, 0.32, Math.cos(i * 1.256) * 0.1],
        root,
      );
    oval([0.065, 0.05, 0.065], 0xf9d67a, [0, 0.35, 0], root);
    return root;
  }
  function basket(position: Point, scale = 1, parent: THREE.Object3D = scene) {
    const root = group(position, parent);
    root.scale.setScalar(scale);
    oval([0.57, 0.33, 0.4], 0xc48b55, [0, 0.3, 0], root);
    for (let i = 0; i < 3; i++) {
      const ring = mesh(
        new THREE.TorusGeometry(0.47, 0.025, 5, 24),
        0xe5b779,
        [0, 0.19 + i * 0.1, 0],
        root,
      );
      ring.rotation.x = Math.PI / 2;
      ring.scale.y = 0.72;
    }
    line(
      [
        [-0.47, 0.36, 0],
        [-0.38, 0.9, 0],
        [0.38, 0.9, 0],
        [0.47, 0.36, 0],
      ],
      0.043,
      0xe5b779,
      root,
    );
    return root;
  }
  function berry(position: Point, size = 0.2, parent: THREE.Object3D = scene, luminous = false) {
    const root = group(position, parent);
    oval([size, size * 1.12, size], 0x9f66dc, [0, 0, 0], root, luminous);
    leaf(0x639778, [size * 0.32, size, 0], size * 0.6, root);
    oval(
      [size * 0.25, size * 0.36, size * 0.08],
      0xe7daf8,
      [-size * 0.4, size * 0.27, size * 0.85],
      root,
    );
    return root;
  }
  function mushroom(position: Point, color: number, scale = 1, luminous = false) {
    const root = group(position);
    root.scale.setScalar(scale);
    post(0.11, 0.5, 0xf7e8cb, [0, 0.22, 0], root);
    oval([0.46, 0.24, 0.44], color, [0, 0.55, 0], root, luminous);
    for (const [x, z] of [
      [-0.15, 0.14],
      [0.16, 0.05],
      [0, -0.18],
    ])
      oval([0.075, 0.025, 0.075], 0xfff5dc, [x, 0.75, z], root);
    return root;
  }
  return {
    mesh,
    group,
    oval,
    box,
    post,
    line,
    disk,
    leaf,
    tree,
    flower,
    basket,
    berry,
    mushroom,
    glow,
    dispose: () => {
      glowMaterials.forEach((m) => m.dispose());
    },
  };
}

export type WorldSculpt = ReturnType<typeof sculptWorld>;
