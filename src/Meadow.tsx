import { Footprints, Leaf, Move, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { playSound, speak } from './audio';
import type { Problem } from './game';
import { useLatest } from './hooks/useLatest';
import { createPlayground } from './playgrounds/createPlayground';
import { playgroundTheme, restorationCount } from './playgrounds/themes';
import ChapterIllustration from './playgrounds/ChapterIllustration';
import { crystalInstructions } from './playgrounds/crystalActivity';

// Named scene tokens mirror the warm woodland UI palette.
const palette = {
  cream: 0xfff1d4,
  orange: 0xe79950,
  ear: 0xb8653c,
  ink: 0x263d30,
  scarf: 0x3e7750,
  gold: 0xebc763,
  white: 0xffffff,
};
type MeadowProps = {
  problem: Problem;
  round: number;
  solved: boolean;
  missionIndex: number;
  onAnswer: (value: number) => void;
  interactive?: boolean;
  sound?: boolean;
  selected?: number | null;
};
type SceneControl = {
  setQuestion: (problem: Problem) => void;
  restore: (count: number) => void;
  choose: (index: number) => void;
  setSolved: (solved: boolean) => void;
  interact: () => void;
  reactToAnswer: (value: number) => void;
};

export default function Meadow({
  problem,
  round,
  solved,
  missionIndex,
  onAnswer,
  interactive = true,
  sound = false,
  selected = null,
}: MeadowProps) {
  const theme = playgroundTheme(missionIndex);
  const activityCopy =
    theme.id in crystalInstructions
      ? crystalInstructions[theme.id as keyof typeof crystalInstructions]
      : null;
  const restored = restorationCount(round + (solved ? 1 : 0));
  const host = useRef<HTMLDivElement>(null);
  const control = useRef<SceneControl | null>(null);
  const [ready, setReady] = useState(false);
  const [fallback, setFallback] = useState(false);
  const [labels, setLabels] = useState<{ x: number; y: number }[]>([]);
  const labelElements = useRef<(HTMLButtonElement | null)[]>([]);
  const [toyPlayed, setToyPlayed] = useState(false);
  const playWithWorld = () => {
    control.current?.interact();
    setToyPlayed(true);
    if (sound) {
      playSound(theme.id === 'crystal-garden' ? 'chime' : 'open');
      speak(theme.toyResponse);
    }
  };
  const current = useLatest({ problem, round, solved, onAnswer, interactive, playWithWorld });
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
      // WebGL availability is only known after attempting to create the external renderer.
      // oxlint-disable-next-line react/set-state-in-effect
      setFallback(true);
      return;
    }
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    const theme = playgroundTheme(missionIndex);
    renderer.toneMappingExposure = theme.night ? 1.1 : 0.95;
    renderer.setClearColor(theme.sky);
    renderer.domElement.setAttribute(
      'aria-label',
      `${theme.name}. ${theme.description} Tap an answer or use arrow keys to walk.`,
    );
    renderer.domElement.setAttribute('tabindex', '0');
    container.prepend(renderer.domElement);
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(theme.sky, 30, 65);
    const camera = new THREE.OrthographicCamera(-10, 10, 6, -6, 0.1, 100);
    camera.position.set(8, 17, 20);
    camera.lookAt(-0.6, theme.id === 'wishing' ? 1.6 : 0.8, theme.id === 'wishing' ? -1.2 : -0.6);
    scene.add(
      new THREE.HemisphereLight(
        theme.night ? 0xb9cde9 : 0xdcecff,
        theme.night ? theme.foliage[0] : 0xb1b9a1,
        theme.night ? 1.8 : 1.5,
      ),
    );
    const sun = new THREE.DirectionalLight(
      theme.night ? 0xc4d8ff : 0xfff1dc,
      theme.night ? 1.7 : 2.1,
    );
    sun.position.set(-8, 16, 8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -14;
    sun.shadow.camera.right = 14;
    sun.shadow.camera.top = 14;
    sun.shadow.camera.bottom = -14;
    sun.shadow.normalBias = 0.04;
    scene.add(sun);
    if (!theme.night) {
      // Soft sky fill keeps faces readable underneath the forest canopy.
      const fill = new THREE.DirectionalLight(0xe4efff, 0.55);
      fill.position.set(8, 8, 16);
      scene.add(fill);
    }
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
    const park = createPlayground(scene, material, missionIndex);
    const activity = park.activity;
    if (activity) {
      camera.position.set(...activity.camera);
      camera.lookAt(...activity.lookAt);
    }
    const ground = park.ground;
    const fox = new THREE.Group();
    const foxHome = new THREE.Vector3(...(activity?.home ?? [0, 0, 3.4]));
    fox.position.copy(foxHome);
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
    const orbPositions = activity?.choices.map(({ root }) => root.position.clone()) ?? [
      new THREE.Vector3(-5, 0, 0.9),
      new THREE.Vector3(-3.2, 0, -2.6),
      new THREE.Vector3(0, 0, -3.1),
      new THREE.Vector3(2.5, 0, -0.8),
    ];
    const orbs: THREE.Mesh[] = [];
    const orbGroups = activity
      ? []
      : orbPositions.map((p, i) => {
          const group = new THREE.Group();
          group.position.copy(p);
          scene.add(group);
          mesh(new THREE.CylinderGeometry(0.56, 0.67, 0.23, 12), palette.cream, [0, 0.1, 0], group);
          const ring = mesh(
            new THREE.TorusGeometry(0.51, 0.055, 5, 24),
            theme.accent,
            [0, 0.24, 0],
            group,
          );
          ring.rotation.x = Math.PI / 2;
          const orb = mesh(
            new THREE.OctahedronGeometry(0.36, 0),
            theme.accent,
            [0, 0.79, 0],
            group,
          );
          orb.userData.answerIndex = i;
          orbs.push(orb);
          return group;
        });
    const answerTargets: THREE.Object3D[] = activity
      ? activity.choices.map(({ root }, i) => {
          root.traverse((part) => {
            part.userData.answerIndex = i;
          });
          return root;
        })
      : orbs;
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
      const view = activity ? Math.max(7.4, 10.5 / aspect) : Math.max(8.8, 11.4 / aspect);
      camera.left = -view * aspect;
      camera.right = view * aspect;
      camera.top = view;
      camera.bottom = -view;
      camera.updateProjectionMatrix();
      setLabels(
        orbPositions.map((p, i) => {
          const v = p.clone();
          v.y = 1.8;
          activity?.choices[i].anchor.getWorldPosition(v);
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
      if (!current.current.interactive) return;
      const hits = raycaster.intersectObjects(answerTargets, true);
      if (hits.length && !solvedState) {
        const index = hits[0].object.userData.answerIndex;
        if (activity) current.current.onAnswer(question.choices[index]);
        else {
          target = orbPositions[index].clone();
          chosen = index;
        }
      } else if (
        park.interactionTargets.length &&
        raycaster.intersectObjects(park.interactionTargets, true).length
      ) {
        current.current.playWithWorld();
      } else if (!activity) {
        const hit = raycaster.intersectObject(ground)[0];
        if (hit) {
          target = hit.point.clone();
          target.y = 0;
          target.x = THREE.MathUtils.clamp(target.x, -6.4, 3.2);
          target.z = THREE.MathUtils.clamp(target.z, -3.4, 4.9);
          chosen = null;
        }
      }
      renderer.domElement.focus({ preventScroll: true });
    };
    const down = (e: KeyboardEvent) => {
      if (
        !activity &&
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
    const restore = park.restore;
    control.current = {
      setQuestion: (p) => {
        question = p;
        solvedState = false;
        chosen = null;
        target = null;
        cooldown = 0.8;
        fox.position.copy(foxHome);
        activity?.reset();
        orbs.forEach((orb) => {
          orb.visible = true;
        });
      },
      restore,
      reactToAnswer: (value) => {
        activity?.select(question.choices.indexOf(value), value === question.answer);
      },
      interact: () => {
        target = null;
        chosen = null;
        keys.clear();
        park.interact();
      },
      choose: (i) => {
        if (!solvedState && current.current.interactive) {
          if (activity) current.current.onAnswer(question.choices[i]);
          else {
            target = orbPositions[i].clone();
            chosen = i;
          }
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
    const labelPoint = new THREE.Vector3();
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
        fox.position.x = THREE.MathUtils.clamp(fox.position.x, -6.4, 3.2);
        fox.position.z = THREE.MathUtils.clamp(fox.position.z, -3.4, 4.9);
        fox.rotation.y = Math.atan2(direction.x, direction.z);
        if (!reducedMotion.matches) {
          fox.position.y = Math.abs(Math.sin(time * 14)) * 0.08;
          legs.forEach((leg, i) => {
            leg.rotation.x = Math.sin(time * 14 + (i % 2) * Math.PI) * 0.5;
          });
        }
      } else {
        fox.position.y = foxHome.y + (fox.position.y - foxHome.y) * 0.8;
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
      }
      park.update(time, !reducedMotion.matches);
      if (activity) {
        activity.choices.forEach(({ anchor }, i) => {
          const element = labelElements.current[i];
          if (!element) return;
          anchor.getWorldPosition(labelPoint).project(camera);
          element.style.left = `${(labelPoint.x * 0.5 + 0.5) * 100}%`;
          element.style.top = `${(-labelPoint.y * 0.5 + 0.5) * 100}%`;
        });
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
      const geometries = new Set<THREE.BufferGeometry>();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) geometries.add(object.geometry);
      });
      geometries.forEach((geometry) => geometry.dispose());
      park.dispose();
      materials.forEach((m) => {
        m.map?.dispose();
        m.dispose();
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [missionIndex, current]);
  useEffect(() => {
    control.current?.setQuestion(problem);
  }, [problem]);
  useEffect(() => {
    control.current?.setSolved(solved);
    control.current?.restore(round + (solved ? 1 : 0));
  }, [round, solved]);
  useEffect(() => {
    if (selected !== null) control.current?.reactToAnswer(selected);
  }, [selected, solved, ready]);
  useEffect(() => {
    const canvas = host.current?.querySelector('canvas');
    if (canvas) {
      canvas.tabIndex = interactive ? 0 : -1;
      canvas.setAttribute(
        'aria-label',
        interactive
          ? `${theme.name}. ${theme.description} ${activityCopy?.action ?? 'Tap an answer or use arrow keys to walk.'}`
          : `${theme.name}. ${theme.description}`,
      );
    }
  }, [interactive, ready, theme, activityCopy]);
  return (
    <div
      className={`meadow-wrap ${activityCopy ? `crystal-activity activity-${theme.id}` : ''} ${interactive ? '' : 'ambient-meadow'}`}
    >
      <div ref={host} className={`meadow-scene ${fallback ? 'scene-fallback' : ''}`}>
        {!ready && !fallback && (
          <div className="meadow-loading">
            <Leaf size={24} />
            Opening {theme.name}…
          </div>
        )}
        {fallback ? (
          <div className="meadow-fallback">
            <ChapterIllustration id={theme.id} />
            <strong>Welcome to {theme.name}.</strong>
            <p>Try the answer buttons. Your discoveries still bring this world to life!</p>
            <span>
              {restored} of 5 {theme.progressNoun}
            </span>
          </div>
        ) : (
          ready && (
            <>
              <span className="meadow-mission-label">
                <Leaf size={13} />
                {solved
                  ? (activityCopy?.success ?? 'A little more magic!')
                  : (activityCopy?.action ?? 'Find the answer. Follow the magic.')}
              </span>
              {labels.map((point, i) => (
                <button
                  key={`${problem.equation}-${i}`}
                  ref={(element) => {
                    labelElements.current[i] = element;
                  }}
                  className={`orb-label ${solved && problem.choices[i] === problem.answer ? 'orb-correct' : ''}`}
                  style={{ left: `${point.x}%`, top: `${point.y}%` }}
                  onClick={() => control.current?.choose(i)}
                  disabled={solved}
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  <span>
                    {problem.denominator
                      ? `${problem.choices[i]}/${problem.denominator}`
                      : problem.skill === 'decimals'
                        ? problem.choices[i].toFixed(1)
                        : problem.choices[i]}
                  </span>
                  {activityCopy && <small>{activityCopy.object}</small>}
                </button>
              ))}
              <div className="playground-pocket">
                <button
                  className="playground-toy"
                  onClick={playWithWorld}
                  aria-label={theme.toyLabel}
                >
                  <Sparkles size={18} />
                  <span>{theme.toyLabel}</span>
                </button>
                <span className="playground-toy-response" role="status">
                  {toyPlayed
                    ? theme.toyResponse
                    : theme.id === 'wishing'
                      ? 'Tap the tree or star fountain to send a wish.'
                      : 'A little extra wonder. Give it a tap!'}
                </span>
              </div>
              <div
                className="restored-count"
                role="status"
                aria-label={`${restored} of 5 ${theme.progressNoun}`}
              >
                <span className="restoration-lights" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <span key={i} className={i < restored ? 'is-lit' : ''}>
                      <Sparkles size={13} />
                    </span>
                  ))}
                </span>
                <span>
                  <strong>{restored}/5</strong> {theme.progressNoun}
                </span>
              </div>
            </>
          )
        )}
      </div>
      <div className="meadow-controls">
        <span>
          <Footprints size={15} />
          {activityCopy?.detail ?? 'Tap an answer to guide Milo'}
        </span>
        <span>
          <Move size={15} />
          {activityCopy
            ? 'Tap a number · or press 1, 2, 3, 4'
            : 'Click the park + arrow keys to roam'}
        </span>
      </div>
    </div>
  );
}
