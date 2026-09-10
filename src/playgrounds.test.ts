import assert from 'node:assert/strict';
import test from 'node:test';
import * as THREE from 'three';
import { createPlayground } from './playgrounds/createPlayground.ts';
import { playgroundThemes, restorationCount } from './playgrounds/themes.ts';

test('Chapter restoration handles saved or repeated progress without extra rewards', () => {
  for (const [input, expected] of [
    [-1, 0],
    [0, 0],
    [2.8, 2],
    [5, 5],
    [99, 5],
    [NaN, 0],
    [Infinity, 0],
  ])
    assert.equal(restorationCount(input), expected);
});

for (const [index, theme] of playgroundThemes.entries()) {
  test(`${theme.name}: five persistent discoveries and stable reduced-motion scenery`, () => {
    const scene = new THREE.Scene();
    const materials = new Map<number, THREE.MeshStandardMaterial>();
    const material = (color: number) => {
      if (!materials.has(color)) materials.set(color, new THREE.MeshStandardMaterial({ color }));
      return materials.get(color)!;
    };
    const world = createPlayground(scene, material, index);
    try {
      assert.equal(world.pieces.filter((piece) => piece.visible).length, 0);
      // Restoration comes from the question engine, including a return from the building view.
      for (const count of [1, 2, 2, 3, 4, 5]) {
        world.restore(count);
        world.update(10 + count);
        assert.equal(world.pieces.filter((piece) => piece.visible).length, count);
        world.pieces
          .filter((piece) => piece.visible)
          .forEach((piece) => assert.ok(piece.scale.length() > 0));
      }
      world.interact();
      for (let frame = 0; frame < 180; frame++) world.update(15 + frame / 30);
      scene.updateMatrixWorld(true);
      scene.traverse((object) => {
        assert.ok(
          object.matrixWorld.elements.every(Number.isFinite),
          `${object.name} has a finite transform`,
        );
        if (object.name === 'little-firefly-glow')
          assert.ok(object.scale.length() < 0.2, 'Twinkling fireflies keep their tiny proportions');
      });
      world.update(30, false);
      scene.updateMatrixWorld(true);
      const still = new Map<THREE.Object3D, number[]>();
      scene.traverse((object) => still.set(object, object.matrixWorld.elements.slice()));
      world.interact();
      world.update(40, false);
      scene.updateMatrixWorld(true);
      scene.traverse((object) =>
        assert.deepEqual(
          object.matrixWorld.elements,
          still.get(object),
          'Decorations stay still with reduced motion',
        ),
      );
      if (theme.id === 'bridge')
        assert.ok(
          scene.getObjectByName('pip-the-bridge-builder')!.position.x < 3,
          'Pip reaches the safe bank even without animation',
        );
      world.restore(0);
      assert.equal(world.pieces.filter((piece) => piece.visible).length, 0);
    } finally {
      const geometries = new Set<THREE.BufferGeometry>();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) geometries.add(object.geometry);
      });
      geometries.forEach((geometry) => geometry.dispose());
      world.dispose();
      materials.forEach((value) => value.dispose());
    }
  });
}
