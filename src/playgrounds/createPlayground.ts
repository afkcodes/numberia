import * as THREE from 'three';
import { createPark } from '../Park.ts';
import { createCat, createChild } from '../ParkCharacters.ts';
import { fireflyFalls, moonberryGarden, pebbleRiver, picnicParty } from './landmarks.ts';
import { wishingGarden } from './wishingGarden.ts';
import { sculptWorld, type MaterialFactory } from './sculpt.ts';
import { playgroundTheme, restorationCount } from './themes.ts';

/** Chapter scenery is independent of the question engine and owns no timers or listeners. */
export function createPlayground(
  scene: THREE.Scene,
  material: MaterialFactory,
  missionIndex: number,
) {
  const theme = playgroundTheme(missionIndex);
  const s = sculptWorld(scene, material);
  const picnic = theme.id === 'picnic' ? createPark(scene, material) : null;
  const ground =
    picnic?.ground ?? s.mesh(new THREE.PlaneGeometry(120, 120), theme.grass, [0, -0.12, 0]);
  ground.rotation.x = -Math.PI / 2;
  ground.castShadow = false;
  ground.name = `${theme.id}-walkable-ground`;

  if (!picnic && theme.id !== 'wishing') {
    // A broad garden walk continues beyond the camera, with a clear space for math.
    const clearing = s.disk(6.8, theme.path, [-1, -0.095, 0.7]);
    clearing.scale.y = 0.8;
    const approach = s.box([3.1, 0.015, 50], theme.path, [-2.4, -0.085, 11]);
    approach.rotation.y = 0.28;
    const trees = [
      [-9.5, -10, 1.45],
      [-4, -11, 1.4],
      [1, -12, 1.65],
      [8.8, -12, 1.4],
      [-10.5, -4.5, 1.1],
      [-10.8, 3, 1.1],
      [10, 2, 1.35],
      [10.4, 7.4, 1.2],
      [-7, 9, 0.85],
      [4.9, 10.2, 0.95],
    ];
    trees.forEach(([x, z, scale]) =>
      s.tree(theme.id === 'bridge' && x > 3.4 && x < 7.8 ? 9.1 : x, z, scale, theme.foliage),
    );
    for (let i = 0; i < 32; i++) {
      const side = i % 2 ? 1 : -1,
        x = side * (6.4 + (i % 4) * 0.65) - 0.6,
        z = -5 + Math.floor(i / 4) * 1.9;
      // Leave the riverside and waterfall clear.
      if (side === 1 && (theme.id === 'bridge' || theme.id === 'firefly') && z < 2) continue;
      s.flower(
        x,
        z,
        [theme.accent, 0xffe5b0, theme.night ? 0xa5c9d4 : 0xeab9bf][i % 3],
        0.7 + (i % 3) * 0.18,
      );
      if (i % 4 === 0) s.oval([0.6, 0.33, 0.5], theme.foliage[1], [x + 0.4, 0.15, z + 0.4]);
    }
  }

  const builders = {
    moonberry: () => moonberryGarden(s),
    bridge: () => pebbleRiver(s, theme.water),
    picnic: () => picnicParty(s),
    firefly: () => fireflyFalls(s, theme.water),
    wishing: () => wishingGarden(s),
  };
  const landmark = builders[theme.id]();
  const originalScales = landmark.pieces.map((piece) => piece.scale.clone());
  landmark.pieces.forEach((piece, i) => {
    piece.name = `${theme.id}-discovery-${i + 1}`;
    piece.visible = false;
  });

  const cat = !picnic ? createCat(material) : null;
  if (cat) {
    scene.add(cat.group);
    cat.group.scale.setScalar(0.85);
  }
  const child = !picnic
    ? createChild(
        material,
        theme.id === 'bridge' ? 0xe4b56f : theme.id === 'firefly' ? 0xc0a3d5 : 0xe9ac93,
        0xb57e58,
        0x544234,
        1,
      )
    : null;
  if (child) {
    scene.add(child.group);
    child.group.position.set(
      theme.id === 'bridge' ? 1.5 : theme.id === 'wishing' ? 5.8 : -5.8,
      0,
      theme.id === 'bridge' ? -5.6 : theme.id === 'wishing' ? -5.7 : -4.4,
    );
    child.group.rotation.y = 0.5;
    if (theme.id === 'moonberry') {
      const wateringCan = s.group([-5.25, 0.65, -4]);
      s.post(0.16, 0.24, 0x87b5b2, [0, 0, 0], wateringCan);
      s.line(
        [
          [0.12, 0, 0],
          [0.4, 0.1, 0],
          [0.48, 0.2, 0],
        ],
        0.045,
        0x87b5b2,
        wateringCan,
      );
      s.mesh(new THREE.TorusGeometry(0.14, 0.025, 5, 16), 0x87b5b2, [-0.14, 0.03, 0], wateringCan);
    }
  }
  const butterflies =
    !picnic && !theme.night
      ? Array.from({ length: 5 }, (_, i) => {
          const root = s.group();
          s.oval([0.025, 0.1, 0.025], 0x705944, [0, 0, 0], root);
          const wings = [-1, 1].map((side) =>
            s.oval(
              [0.14, 0.14, 0.035],
              [0xeac16f, 0xc3a0d4, 0xeaa494][i % 3],
              [side * 0.11, 0, 0],
              root,
            ),
          );
          return { root, wings };
        })
      : [];

  let restored = 0,
    lastTime = 0,
    interactionAt = -10;
  const appearedAt = Array<number>(5).fill(-10);
  function restore(count: number) {
    const next = restorationCount(count);
    landmark.pieces.forEach((piece, i) => {
      if (i >= restored && i < next) appearedAt[i] = lastTime;
      piece.visible = i < next;
      piece.scale.copy(originalScales[i]);
    });
    restored = next;
  }
  function update(time: number, animate = true) {
    lastTime = time;
    const t = animate ? time : 0;
    const interactionAge = Math.max(0, time - interactionAt);
    const excitement = animate && interactionAge < 4 ? Math.sin((interactionAge / 4) * Math.PI) : 0;
    picnic?.update(t, animate);
    landmark.update(t, restored, excitement);
    landmark.pieces.forEach((piece, i) => {
      const age = Math.min(1, Math.max(0, (time - appearedAt[i]) / 0.8));
      const bounce =
        animate && age < 1 ? 1 - Math.pow(1 - age, 3) + Math.sin(age * Math.PI) * 0.2 : 1;
      piece.scale.copy(originalScales[i]).multiplyScalar(bounce);
    });
    if (cat) {
      const cycle = t % 24,
        moving = cycle < 18;
      const phase = (Math.min(cycle, 18) / 18) * Math.PI * 2;
      cat.group.position.set(-0.5 + Math.sin(phase) * 2, 0, 5.7 + Math.cos(phase) * 0.65);
      cat.group.rotation.y = Math.atan2(Math.cos(phase) * 2, -Math.sin(phase) * 0.65);
      cat.update(t, moving && animate);
    }
    if (child) {
      child.expression(t);
      child.arms[1].rotation.z = -0.16 + excitement * (-2.09 + Math.sin(t * 8) * 0.22);
      child.forearms[1].rotation.x = excitement * -0.4;
      child.head.rotation.y = Math.sin(t * 0.6) * 0.15;
    }
    butterflies.forEach(({ root, wings }, i) => {
      const angle = t * 0.35 + i * 1.8;
      root.position.set(
        -1 + Math.sin(angle) * (5.5 - excitement * 2),
        1 + (i % 3) * 0.35 + Math.sin(t * 1.8 + i) * 0.15,
        -3.7 + Math.cos(angle) * 1.3,
      );
      root.rotation.y = -angle;
      wings.forEach((wing, side) => {
        wing.rotation.y = Math.sin(t * 17 + i) * 0.7 * (side ? 1 : -1);
      });
    });
  }
  update(0, false);
  return {
    ground,
    interactionTargets: landmark.interactionTargets ?? [],
    pieces: landmark.pieces,
    restore,
    update,
    interact: () => {
      interactionAt = lastTime;
      landmark.interact?.(lastTime);
    },
    dispose: s.dispose,
  };
}
