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
      if (theme.id === 'wishing') {
        assert.equal(world.interactionTargets.length, 2);
        const fountain = scene.getObjectByName('wishing-star-fountain')!;
        assert.ok(
          new THREE.Box3().setFromObject(fountain).max.x < -7,
          'The fountain stays clear of Milo’s walking area',
        );
        world.interact();
        world.update(0.8);
        const wish = scene.getObjectByName('travelling-wish')!;
        assert.equal(wish.visible, true);
        const start = wish.position.clone();
        world.update(2);
        assert.ok(wish.position.distanceTo(start) > 1, 'The wish travels toward the tree');
        world.update(4);
        assert.equal(wish.visible, false);
        assert.equal(
          world.pieces.filter((piece) => piece.visible).length,
          0,
          'Playing with the fountain never awards a discovery',
        );
      }
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
      if (theme.id === 'wishing')
        assert.ok(
          scene.getObjectByName('wishing-tree-door')!.rotation.y < -1,
          'The door opens after all five discoveries',
        );
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
      if (theme.id === 'bridge' || theme.id === 'crystal-bridge')
        assert.ok(
          scene.getObjectByName('pip-the-bridge-builder')!.position.x < 3,
          'Pip reaches the safe bank even without animation',
        );
      if (theme.id === 'bridge') {
        const wheel = scene.getObjectByName('pebble-waterwheel')!;
        scene.updateMatrixWorld(true);
        const obstacles = [
          scene.getObjectByName('pebble-mill-building')!,
          scene.getObjectByName('pips-growing-bridge')!,
          ...scene.getObjectByName('pebble-bank-stones')!.children,
        ].map((object) => new THREE.Box3().setFromObject(object, true));
        const wheelBounds = new THREE.Box3();
        const initialRotation = wheel.quaternion.clone();
        // Exercise the animation over more than one revolution, including paddle corners.
        for (let frame = 0; frame <= 240; frame++) {
          world.update(40 + frame / 10);
          wheelBounds.setFromObject(wheel, true);
          for (const obstacle of obstacles)
            assert.equal(
              wheelBounds.intersectsBox(obstacle),
              false,
              'The rotating waterwheel clears the mill, bridge, and bank stones',
            );
        }
        assert.ok(wheel.quaternion.angleTo(initialRotation) > 0.1, 'The waterwheel still turns');
      }
      world.restore(0);
      assert.equal(world.pieces.filter((piece) => piece.visible).length, 0);
      if (world.activity) {
        const activity = world.activity;
        assert.equal(activity.choices.length, 4);
        const snapshot = (root: THREE.Object3D) => {
          root.updateWorldMatrix(true, true);
          const parts: { visible: boolean; transform: number[] }[] = [];
          root.traverse((part) =>
            parts.push({ visible: part.visible, transform: part.matrixWorld.elements.slice() }),
          );
          return parts;
        };
        world.update(70);
        const labelPositions = activity.choices.map(({ anchor }) =>
          anchor.getWorldPosition(new THREE.Vector3()).toArray(),
        );
        world.update(71);
        assert.deepEqual(
          activity.choices.map(({ anchor }) =>
            anchor.getWorldPosition(new THREE.Vector3()).toArray(),
          ),
          labelPositions,
          'Number targets stay still while boats and lanterns bob',
        );
        world.update(72, false);
        const atRest = activity.choices.map(({ root }) => snapshot(root));
        for (let choice = 0; choice < 4; choice++) {
          activity.select(choice, false);
          world.update(75, false);
          assert.deepEqual(
            activity.choices.map(({ root }) => snapshot(root)),
            atRest,
            'A retry never sends away a toy or reveals its treasure',
          );
          activity.select(choice, true);
          world.update(78, false);
          assert.notDeepEqual(
            snapshot(activity.choices[choice].root),
            atRest[choice],
            'Every answer toy has a completed action even with reduced motion',
          );
          for (let other = 0; other < 4; other++)
            if (other !== choice)
              assert.deepEqual(
                snapshot(activity.choices[other].root),
                atRest[other],
                'Only the chosen toy reacts',
              );
          assert.equal(
            world.pieces.filter((piece) => piece.visible).length,
            0,
            'Animation cannot award a discovery independently of the learning engine',
          );
          activity.reset();
          world.update(80, false);
          assert.deepEqual(
            activity.choices.map(({ root }) => snapshot(root)),
            atRest,
            'A new question restores the answer toys for another try',
          );
        }
      }
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
