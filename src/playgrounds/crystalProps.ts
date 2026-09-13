import * as THREE from 'three';
import type { Point, WorldSculpt } from './sculpt.ts';

export const jewelColors = [0xb977e8, 0xff8bac, 0x49d8c4, 0xffce69, 0x779eff];
export const coveCream = 0xffe8bb;

/** Shared craft materials, with composition and behavior owned by each chapter. */
export function crystalProps(s: WorldSculpt) {
  const body = new THREE.CylinderGeometry(0.32, 0.36, 1, 6);
  const tip = new THREE.ConeGeometry(0.32, 0.48, 6);
  function crystal(
    position: Point,
    size: number,
    color: number,
    parent?: THREE.Object3D,
    glow = false,
  ) {
    const root = s.group(position, parent);
    root.scale.setScalar(size);
    s.mesh(body, color, [0, 0.55, 0], root, glow);
    s.mesh(tip, color, [0, 1.29, 0], root, glow);
    return root;
  }
  function cluster(position: Point, size: number, color: number) {
    const root = s.group(position);
    root.scale.setScalar(size);
    crystal([0, 0, 0], 1.5, color, root);
    crystal([-0.53, 0, 0.11], 0.9, color, root).rotation.z = 0.23;
    crystal([0.5, 0, 0.16], 0.7, 0x65cfc9, root).rotation.z = -0.27;
    s.oval([0.95, 0.13, 0.65], 0x709b99, [0, 0, 0], root);
    return root;
  }
  function shell(position: Point, size: number, color: number, parent?: THREE.Object3D) {
    const root = s.group(position, parent);
    root.scale.setScalar(size);
    for (let i = 0; i < 7; i++) {
      const angle = (i - 3) * 0.23;
      const rib = s.oval(
        [0.19, 0.13, 0.65],
        i % 2 ? coveCream : color,
        [Math.sin(angle) * 0.45, 0.1, 0.2 + Math.cos(angle) * 0.22],
        root,
      );
      rib.rotation.y = angle;
    }
    return root;
  }
  function palm(x: number, z: number, size: number) {
    const root = s.group([x, 0, z]);
    root.scale.setScalar(size);
    s.line(
      [
        [0, 0, 0],
        [0.16, 1.6, 0],
        [0.6, 3.1, -0.1],
      ],
      0.17,
      0x9e784c,
      root,
    );
    for (let i = 0; i < 7; i++) {
      const branch = s.group([0.6, 3.1, -0.1], root);
      branch.rotation.y = (i * Math.PI * 2) / 7;
      s.line(
        [
          [0, 0, 0],
          [0, 0.38, 0.8],
          [0, -0.15, 1.85],
        ],
        0.04,
        0x147b65,
        branch,
      );
      const frond = s.oval([0.38, 0.09, 1], i % 2 ? 0x389f66 : 0x19895f, [0, 0.08, 0.95], branch);
      frond.rotation.x = 0.18;
    }
    for (const x of [0.45, 0.75]) s.oval([0.18, 0.2, 0.18], 0xa07948, [x, 2.96, 0.05], root);
    return root;
  }
  function anchor(root: THREE.Group, height: number) {
    // Number targets stay still while the model bobs or sways. Only a chosen
    // delivery moves its label, so children never have to chase a button.
    const point = new THREE.Object3D();
    point.position.copy(root.position);
    point.position.y += height;
    root.parent!.add(point);
    return { root, anchor: point };
  }
  function torus(position: Point, radius: number, color: number, parent?: THREE.Object3D) {
    const ring = s.mesh(
      new THREE.TorusGeometry(radius, 0.05, 6, 48),
      color,
      position,
      parent,
      true,
    );
    ring.rotation.x = -Math.PI / 2;
    return ring;
  }
  return { crystal, cluster, shell, palm, anchor, torus };
}
