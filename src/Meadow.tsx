import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Footprints, Leaf, Move, Sparkles } from 'lucide-react';
import type { Problem } from './game';
import { createPark } from './Park';

// Named scene tokens mirror the warm woodland UI palette.
const palette = {
  sky: 0xe3efdb,
  grass: 0xaec782,
  grassEdge: 0x71965a,
  forest: 0x38785b,
  sage: 0x699765,
  mint: 0x93b77c,
  trunk: 0x92714a,
  cream: 0xfff1d4,
  orange: 0xe79950,
  ear: 0xb8653c,
  ink: 0x263d30,
  scarf: 0x3e7750,
  water: 0x70bbb7,
  waterLight: 0xb5e0d2,
  gold: 0xebc763,
  stone: 0xaeb49a,
  berry: 0xc57b77,
  white: 0xffffff,
  path: 0xdcd2a5,
};
type MeadowProps = {
  problem: Problem;
  round: number;
  solved: boolean;
  missionIndex: number;
  onAnswer: (value: number) => void;
  interactive?: boolean;
};
type SceneControl = {
  setQuestion: (problem: Problem) => void;
  restore: (count: number) => void;
  choose: (index: number) => void;
  setSolved: (solved: boolean) => void;
};

export default function Meadow({
  problem,
  round,
  solved,
  missionIndex,
  onAnswer,
  interactive = true,
}: MeadowProps) {
  const host = useRef<HTMLDivElement>(null);
  const control = useRef<SceneControl | null>(null);
  const current = useRef({ problem, round, solved, onAnswer, interactive });
  current.current = { problem, round, solved, onAnswer, interactive };
  const [ready, setReady] = useState(false);
  const [fallback, setFallback] = useState(false);
  const [labels, setLabels] = useState<{ x: number; y: number }[]>([]);
  useEffect(() => {
    const container = host.current;
    if (!container) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: 'low-power',
      });
    } catch {
      setFallback(true);
      return;
    }
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(palette.sky);
    renderer.domElement.setAttribute(
      'aria-label',
      'Milo’s lively park, with children playing, swings, a slide, butterflies, and a roaming cat. Tap an answer or use arrow keys to walk.',
    );
    renderer.domElement.setAttribute('tabindex', '0');
    container.prepend(renderer.domElement);
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(palette.sky, 40, 80);
    const camera = new THREE.OrthographicCamera(-10, 10, 6, -6, 0.1, 100);
    camera.position.set(8, 17, 20);
    camera.lookAt(-0.6, 0.4, 0);
    scene.add(new THREE.HemisphereLight(palette.cream, palette.forest, 2.5));
    const sun = new THREE.DirectionalLight(palette.cream, 3);
    sun.position.set(-8, 16, 8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -14;
    sun.shadow.camera.right = 14;
    sun.shadow.camera.top = 14;
    sun.shadow.camera.bottom = -14;
    sun.shadow.normalBias = 0.04;
    scene.add(sun);
    const materials = new Map<number, THREE.MeshStandardMaterial>();
    const material = (color: number) => {
      if (!materials.has(color))
        materials.set(color, new THREE.MeshStandardMaterial({ color, roughness: 0.9 }));
      return materials.get(color)!;
    };
    const mesh = (
      geo: THREE.BufferGeometry,
      color: number,
      pos: [number, number, number],
      parent: THREE.Object3D = scene,
    ) => {
      const object = new THREE.Mesh(geo, material(color));
      object.position.set(...pos);
      object.castShadow = true;
      object.receiveShadow = true;
      parent.add(object);
      return object;
    };
    const sphere = (
      r: number,
      color: number,
      pos: [number, number, number],
      parent: THREE.Object3D = scene,
    ) => mesh(new THREE.SphereGeometry(r, 24, 16), color, pos, parent);
    const park = createPark(scene, material);
    const ground = park.ground;
    // Each correct answer restores one physical part of the chapter's landmark.
    const landmark = new THREE.Group();
    landmark.position.set(4.95, 0, -4.8);
    scene.add(landmark);
    const pieces: THREE.Object3D[] = [];
    for (let i = 0; i < 5; i++) {
      let part: THREE.Object3D;
      if (missionIndex === 1) {
        part = mesh(
          new THREE.BoxGeometry(0.58, 0.17, 1.35),
          palette.trunk,
          [-1.2 + i * 0.6, 0.15, 0],
          landmark,
        );
      } else {
        part = new THREE.Group();
        part.position.set((i - 2) * 0.47, 0.5 + Math.sin(i) * 0.2, 0);
        landmark.add(part);
        if (missionIndex === 4) {
          const leaf = sphere(0.4, palette.mint, [0, 0, 0], part);
          leaf.scale.set(0.7, 1.6, 0.7);
        } else {
          const star = mesh(
            new THREE.OctahedronGeometry(0.29),
            missionIndex === 0 ? palette.berry : palette.gold,
            [0, 0, 0],
            part,
          );
          star.rotation.z = 0.2;
        }
      }
      part.visible = false;
      pieces.push(part);
    }
    if (missionIndex !== 1) {
      mesh(new THREE.CylinderGeometry(0.8, 0.7, 0.65, 12), palette.trunk, [0, 0.25, 0], landmark);
    }
    const fox = new THREE.Group();
    fox.position.set(0, 0, 3.4);
    scene.add(fox);
    const body = sphere(0.48, palette.orange, [0, 0.58, 0], fox);
    body.scale.set(0.8, 1, 1.15);
    const head = sphere(0.48, palette.orange, [0, 1.11, 0.16], fox);
    head.scale.set(1.16, 1, 1);
    for (const x of [-0.31, 0.31]) {
      const ear = mesh(new THREE.ConeGeometry(0.2, 0.55, 4), palette.orange, [x, 1.65, 0.13], fox);
      ear.rotation.z = -x * 0.4;
      mesh(new THREE.ConeGeometry(0.12, 0.31, 4), palette.ear, [x, 1.68, 0.23], fox);
      sphere(0.23, palette.cream, [x * 0.5, 0.98, 0.52], fox);
      sphere(0.054, palette.ink, [x * 0.7, 1.23, 0.57], fox);
      sphere(0.017, palette.white, [x * 0.7 + 0.013, 1.247, 0.61], fox);
    }
    sphere(0.073, palette.ink, [0, 1.03, 0.73], fox);
    const scarf = mesh(
      new THREE.TorusGeometry(0.32, 0.08, 5, 16),
      palette.scarf,
      [0, 0.86, 0],
      fox,
    );
    scarf.rotation.x = Math.PI / 2;
    const tail = new THREE.Group();
    tail.position.set(0, 0.5, -0.3);
    tail.rotation.x = -0.55;
    fox.add(tail);
    const tailBody = sphere(0.31, palette.orange, [0, 0.13, -0.43], tail);
    tailBody.scale.set(1, 1.1, 2);
    const tip = sphere(0.24, palette.cream, [0, 0.2, -0.92], tail);
    tip.scale.z = 1.25;
    const legs: THREE.Mesh[] = [];
    for (const [x, z] of [
      [-0.24, 0.29],
      [0.24, 0.29],
      [-0.24, -0.24],
      [0.24, -0.24],
    ])
      legs.push(mesh(new THREE.CapsuleGeometry(0.11, 0.2, 6, 14), palette.ear, [x, 0.21, z], fox));
    const orbPositions = [
      new THREE.Vector3(-5, 0, 0.9),
      new THREE.Vector3(-3.2, 0, -2.6),
      new THREE.Vector3(0, 0, -3.1),
      new THREE.Vector3(2.5, 0, -0.8),
    ];
    const orbs: THREE.Mesh[] = [];
    const orbGroups = orbPositions.map((p, i) => {
      const group = new THREE.Group();
      group.position.copy(p);
      scene.add(group);
      mesh(new THREE.CylinderGeometry(0.56, 0.67, 0.23, 12), palette.cream, [0, 0.1, 0], group);
      const ring = mesh(
        new THREE.TorusGeometry(0.51, 0.055, 5, 24),
        palette.gold,
        [0, 0.24, 0],
        group,
      );
      ring.rotation.x = Math.PI / 2;
      const orb = mesh(new THREE.OctahedronGeometry(0.36, 0), palette.gold, [0, 0.79, 0], group);
      orb.userData.answerIndex = i;
      orbs.push(orb);
      return group;
    });
    const particles: { mesh: THREE.Mesh; velocity: THREE.Vector3; age: number }[] = [];
    let target: THREE.Vector3 | null = null;
    let chosen: number | null = null;
    let solvedState = false;
    let question = current.current.problem;
    let cooldown = 0;
    const keys = new Set<string>();
    const clock = new THREE.Clock();
    let frame = 0;
    let disposed = false;
    let visible = true;
    const spark = () => {
      if (reducedMotion.matches) return;
      for (let i = 0; i < 22; i++) {
        const p = mesh(new THREE.OctahedronGeometry(0.07), i % 2 ? palette.gold : palette.cream, [
          fox.position.x,
          1.3,
          fox.position.z,
        ]);
        particles.push({
          mesh: p,
          velocity: new THREE.Vector3(
            Math.sin(i * 2.4) * 2,
            2 + (i % 4) * 0.45,
            Math.cos(i * 2.4) * 2,
          ),
          age: 0,
        });
      }
    };
    const resize = () => {
      const w = container.clientWidth,
        h = container.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h);
      const aspect = w / h;
      const view = Math.max(8.8, 11.4 / aspect);
      camera.left = -view * aspect;
      camera.right = view * aspect;
      camera.top = view;
      camera.bottom = -view;
      camera.updateProjectionMatrix();
      setLabels(
        orbPositions.map((p) => {
          const v = p.clone();
          v.y = 1.8;
          v.project(camera);
          return { x: (v.x * 0.5 + 0.5) * 100, y: (-v.y * 0.5 + 0.5) * 100 };
        }),
      );
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();
    const raycaster = new THREE.Raycaster();
    const pointer = (e: PointerEvent) => {
      const bounds = renderer.domElement.getBoundingClientRect();
      raycaster.setFromCamera(
        new THREE.Vector2(
          ((e.clientX - bounds.left) / bounds.width) * 2 - 1,
          (-(e.clientY - bounds.top) / bounds.height) * 2 + 1,
        ),
        camera,
      );
      const hits = raycaster.intersectObjects(orbs);
      if (hits.length && !solvedState) {
        const index = hits[0].object.userData.answerIndex;
        target = orbPositions[index].clone();
        chosen = index;
      } else {
        const hit = raycaster.intersectObject(ground)[0];
        if (hit) {
          target = hit.point.clone();
          target.y = 0;
          target.x = THREE.MathUtils.clamp(target.x, -13, 12);
          target.z = THREE.MathUtils.clamp(target.z, -10, 10);
          chosen = null;
        }
      }
      renderer.domElement.focus({ preventScroll: true });
    };
    const down = (e: KeyboardEvent) => {
      if (
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key) &&
        document.activeElement === renderer.domElement
      ) {
        e.preventDefault();
        keys.add(e.key);
        target = null;
        chosen = null;
      }
    };
    const up = (e: KeyboardEvent) => keys.delete(e.key);
    const blur = () => keys.clear();
    const visibility = () => {
      visible = !document.hidden;
      keys.clear();
    };
    renderer.domElement.addEventListener('pointerdown', pointer);
    renderer.domElement.addEventListener('blur', blur);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    document.addEventListener('visibilitychange', visibility);
    const restore = (count: number) => {
      pieces.forEach((part, i) => {
        part.visible = i < count;
      });
    };
    control.current = {
      setQuestion: (p) => {
        question = p;
        solvedState = false;
        chosen = null;
        target = null;
        cooldown = 0.8;
        fox.position.set(0, 0, 3.4);
        orbs.forEach((orb) => {
          orb.visible = true;
        });
      },
      restore,
      choose: (i) => {
        if (!solvedState) {
          target = orbPositions[i].clone();
          chosen = i;
          renderer.domElement.focus({ preventScroll: true });
        }
      },
      setSolved: (value) => {
        if (value && !solvedState) spark();
        solvedState = value;
        if (value) {
          target = null;
          orbs.forEach((orb, i) => {
            orb.visible = question.choices[i] !== question.answer;
          });
        }
      },
    };
    restore(current.current.round + (current.current.solved ? 1 : 0));
    const animate = () => {
      if (disposed) return;
      frame = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05),
        time = clock.elapsedTime;
      if (!visible) return;
      cooldown = Math.max(0, cooldown - dt);
      const direction = new THREE.Vector3();
      if (keys.has('ArrowUp') || keys.has('w')) direction.z -= 1;
      if (keys.has('ArrowDown') || keys.has('s')) direction.z += 1;
      if (keys.has('ArrowLeft') || keys.has('a')) direction.x -= 1;
      if (keys.has('ArrowRight') || keys.has('d')) direction.x += 1;
      let walking = direction.lengthSq() > 0;
      if (target) {
        direction.subVectors(target, fox.position);
        direction.y = 0;
        walking = direction.length() > 0.12;
        if (!walking) {
          target = null;
          if (chosen !== null && !solvedState) {
            const answerIndex = chosen;
            chosen = null;
            cooldown = 1.5;
            if (current.current.interactive)
              current.current.onAnswer(question.choices[answerIndex]);
          }
        }
      }
      if (walking) {
        direction.normalize();
        fox.position.addScaledVector(direction, dt * 4.8);
        fox.position.x = THREE.MathUtils.clamp(fox.position.x, -13, 12);
        fox.position.z = THREE.MathUtils.clamp(fox.position.z, -10, 10);
        fox.rotation.y = Math.atan2(direction.x, direction.z);
        if (!reducedMotion.matches) {
          fox.position.y = Math.abs(Math.sin(time * 14)) * 0.08;
          legs.forEach((leg, i) => {
            leg.rotation.x = Math.sin(time * 14 + (i % 2) * Math.PI) * 0.5;
          });
        }
      } else {
        fox.position.y *= 0.8;
        legs.forEach((leg) => {
          leg.rotation.x *= 0.8;
        });
      }
      if (walking && chosen === null && !solvedState && cooldown === 0) {
        const index = orbPositions.findIndex(
          (p) => Math.hypot(p.x - fox.position.x, p.z - fox.position.z) < 0.55,
        );
        if (index >= 0) {
          cooldown = 1.5;
          target = null;
          if (current.current.interactive) current.current.onAnswer(question.choices[index]);
        }
      }
      if (!reducedMotion.matches) {
        tail.rotation.z = Math.sin(time * (walking ? 10 : 2)) * 0.12;
        orbGroups.forEach((_, i) => {
          orbs[i].position.y = 0.79 + Math.sin(time * 1.8 + i) * 0.08;
          orbs[i].rotation.y = time * 0.4;
        });
        park.update(time);
      }
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.age += dt;
        p.velocity.y -= dt * 5;
        p.mesh.position.addScaledVector(p.velocity, dt);
        p.mesh.rotation.x += dt * 3;
        p.mesh.scale.setScalar(Math.max(0, 1 - p.age / 1.3));
        if (p.age > 1.3) {
          scene.remove(p.mesh);
          p.mesh.geometry.dispose();
          particles.splice(i, 1);
        }
      }
      renderer.render(scene, camera);
    };
    setReady(true);
    animate();
    const contextLost = (e: Event) => {
      e.preventDefault();
      setFallback(true);
    };
    renderer.domElement.addEventListener('webglcontextlost', contextLost);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      control.current = null;
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      document.removeEventListener('visibilitychange', visibility);
      renderer.domElement.removeEventListener('pointerdown', pointer);
      renderer.domElement.removeEventListener('blur', blur);
      renderer.domElement.removeEventListener('webglcontextlost', contextLost);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) object.geometry.dispose();
      });
      materials.forEach((m) => {
        m.map?.dispose();
        m.dispose();
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [missionIndex]);
  useEffect(() => {
    control.current?.setQuestion(problem);
  }, [problem]);
  useEffect(() => {
    control.current?.setSolved(solved);
    control.current?.restore(round + (solved ? 1 : 0));
  }, [round, solved]);
  useEffect(() => {
    const canvas = host.current?.querySelector('canvas');
    if (canvas) {
      canvas.tabIndex = interactive ? 0 : -1;
      canvas.setAttribute(
        'aria-label',
        interactive
          ? 'Milo’s lively park. Tap an answer or use arrow keys to walk.'
          : 'A lively woodland park with playing children and animals.',
      );
    }
  }, [interactive, ready]);
  return (
    <div className={`meadow-wrap ${interactive ? '' : 'ambient-meadow'}`}>
      <div ref={host} className={`meadow-scene ${fallback ? 'scene-fallback' : ''}`}>
        {!ready && !fallback && (
          <div className="meadow-loading">
            <Leaf size={24} />
            Bringing your park to life…
          </div>
        )}
        {fallback ? (
          <div className="meadow-fallback">
            <Sparkles size={35} />
            <strong>Your magic is still growing.</strong>
            <p>Use the answer buttons below to restore the forest.</p>
            <span>{round + (solved ? 1 : 0)} of 5 pieces restored</span>
          </div>
        ) : (
          ready && (
            <>
              <span className="meadow-mission-label">
                <Leaf size={13} />
                {solved ? 'A little more magic!' : 'Find the answer. Follow the magic.'}
              </span>
              {labels.map((point, i) => (
                <button
                  key={`${problem.equation}-${i}`}
                  className={`orb-label ${solved && problem.choices[i] === problem.answer ? 'orb-correct' : ''}`}
                  style={{ left: `${point.x}%`, top: `${point.y}%` }}
                  onClick={() => control.current?.choose(i)}
                  disabled={solved}
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  {problem.denominator
                    ? `${problem.choices[i]}/${problem.denominator}`
                    : problem.skill === 'decimals'
                      ? problem.choices[i].toFixed(1)
                      : problem.choices[i]}
                </button>
              ))}
              <span className="restored-count">
                <Sparkles size={14} />
                {round + (solved ? 1 : 0)}/5 magic restored
              </span>
            </>
          )
        )}
      </div>
      <div className="meadow-controls">
        <span>
          <Footprints size={15} />
          Tap an answer to guide Milo
        </span>
        <span>
          <Move size={15} />
          Click the park + arrow keys to roam
        </span>
      </div>
    </div>
  );
}
