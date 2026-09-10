import { useEffect, useRef } from 'react';
import { squirrelJourney } from './squirrelJourney';

function Acorn() {
  return (
    <g className="wild-acorn">
      <path d="M-7 0Q-6 12 0 14Q6 12 7 0Z" fill="var(--color-fox)" />
      <path d="M-9 1Q-8-8 0-8Q8-8 9 1Z" fill="var(--color-orange-ink)" />
      <path
        d="M0-8Q-2-12 2-14"
        fill="none"
        stroke="var(--color-orange-ink)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </g>
  );
}

function Bee() {
  return (
    <svg viewBox="0 0 44 35">
      <g
        className="bee-wings"
        fill="var(--color-white)"
        stroke="var(--color-toy-blue-shadow)"
        strokeWidth="1"
      >
        <ellipse cx="17" cy="9" rx="6" ry="9" transform="rotate(-30 17 9)" />
        <ellipse cx="26" cy="9" rx="6" ry="9" transform="rotate(30 26 9)" />
      </g>
      <ellipse cx="23" cy="21" rx="13" ry="10" fill="var(--color-toy-yellow)" />
      <path
        d="M18 12Q14 21 18 30M25 12Q21 21 25 30"
        stroke="var(--color-gold-ink)"
        strokeWidth="4"
        fill="none"
      />
      <circle cx="33" cy="20" r="8" fill="var(--color-toy-yellow)" />
      <circle cx="36" cy="18" r="1.7" fill="var(--color-ink)" />
      <path
        d="M35 23Q37 25 39 22"
        stroke="var(--color-ink)"
        strokeWidth="1.3"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M10 21L4 19L6 24Z" fill="var(--color-gold-ink)" />
    </svg>
  );
}

function RunningLeg({ front = false, far = false }: { front?: boolean; far?: boolean }) {
  const fur = far ? 'var(--color-orange-ink)' : 'var(--color-fox-dark)';
  return (
    <g transform={`translate(${front ? 72 : 39} ${front ? 62 : 67})`} opacity={far ? 0.82 : 1}>
      <g className={`squirrel-thigh ${front ? 'front' : 'hind'} ${far ? 'far' : 'near'}`}>
        <path
          d={front ? 'M0 0Q-3 7-1 14' : 'M0 0Q-9 7 1 14'}
          stroke={fur}
          strokeWidth={front ? 6 : 9}
          fill="none"
          strokeLinecap="round"
        />
        <g transform={`translate(${front ? -1 : 1} 14)`}>
          <g className={`squirrel-shin ${front ? 'front' : 'hind'} ${far ? 'far' : 'near'}`}>
            <path d="M0 0Q3 3 4 8" stroke={fur} strokeWidth="5" fill="none" strokeLinecap="round" />
            <ellipse cx="9" cy="9" rx="9" ry="3.5" fill={fur} />
            <path
              d="M12 8L13 10M9 8L10 10"
              stroke="var(--color-fox-inner)"
              strokeWidth=".9"
              strokeLinecap="round"
            />
          </g>
        </g>
      </g>
    </g>
  );
}

/** A little story with a beginning, a nut-gathering journey, and a return home. */
export default function LandingWildlife() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const area = host.current;
    if (!area) return;
    const traveler = area.querySelector<HTMLElement>('.squirrel-traveler')!;
    const facing = area.querySelector<SVGElement>('.squirrel-facing')!;
    const body = area.querySelector<SVGElement>('.squirrel-hop')!;
    const nut = area.querySelector<SVGElement>('.squirrel-carried-nut')!;
    const pile = area.querySelector<SVGElement>('.wildlife-nuts')!;
    const thighs = [...area.querySelectorAll<SVGElement>('.squirrel-thigh')];
    const knees = [...area.querySelectorAll<SVGElement>('.squirrel-shin')];
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0,
      distance = 0;
    const resize = () => {
      distance = Math.max(
        0,
        pile.getBoundingClientRect().left -
          area.getBoundingClientRect().left +
          pile.clientWidth * 0.47 -
          traveler.offsetLeft -
          traveler.clientWidth * 0.88,
      );
    };
    const observer = new ResizeObserver(resize);
    observer.observe(area);
    resize();
    const started = performance.now();
    const render = (now: number) => {
      const t = (now - started) / 1000;
      const treeWidth = area.querySelector('.wildlife-tree')!.clientWidth;
      const story = squirrelJourney(t, distance, treeWidth * 0.39);
      if (reduced.matches)
        Object.assign(story, {
          x: 0,
          y: 0,
          turn: 1,
          rotation: 0,
          visible: 1,
          carrying: true,
          gait: 'still',
          action: 'resting',
        });
      traveler.style.transform = `translate3d(${story.x}px,${story.y}px,0) rotate(${story.rotation}deg)`;
      traveler.style.opacity = String(story.visible);
      traveler.dataset.action = story.action;
      facing.style.transform = `scaleX(${story.turn})`;
      nut.style.opacity = story.carrying ? '1' : '0';
      body.style.transform = `translateY(${story.gait === 'run' ? -Math.abs(Math.sin(t * 8)) * 2 : 0}px)`;
      thighs.forEach((leg, i) => {
        const phase =
          t * (story.gait === 'climb' ? 5 : 8) + [Math.PI / 2, Math.PI * 1.5, 0, Math.PI][i];
        const hip =
          story.gait === 'run'
            ? Math.sin(phase) * 26
            : story.gait === 'climb'
              ? Math.sin(phase) * 12
              : 0;
        const knee =
          story.gait === 'run'
            ? -Math.max(0, Math.cos(phase)) * 38
            : story.gait === 'climb'
              ? -Math.max(0, Math.cos(phase)) * 22
              : 0;
        leg.style.transform = `rotate(${hip}deg)`;
        knees[i].style.transform = `rotate(${knee}deg)`;
      });
      if (!reduced.matches) frame = requestAnimationFrame(render);
    };
    const resume = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(render);
    };
    reduced.addEventListener('change', resume);
    frame = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      reduced.removeEventListener('change', resume);
    };
  }, []);
  return (
    <div ref={host} className="landing-wildlife" aria-hidden="true">
      <svg className="wildlife-ground" viewBox="0 0 1200 100" preserveAspectRatio="none">
        <path d="M0 54Q165 13 358 54T745 52T1200 32V100H0Z" fill="var(--color-soft-green)" />
        <path d="M0 81Q184 48 420 77T833 74T1200 69V100H0Z" fill="var(--color-mint)" />
        <path
          d="M100 89Q475 78 1118 88"
          stroke="var(--color-cream)"
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
      <svg className="wildlife-tree" viewBox="0 0 190 190">
        <path
          d="M78 183Q89 137 83 69L111 64Q102 130 119 183L97 175Z"
          fill="var(--color-orange-ink)"
        />
        <path
          d="M96 146Q109 124 139 108M94 124Q72 113 55 97"
          fill="none"
          stroke="var(--color-orange-ink)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M91 179Q99 144 95 97"
          stroke="var(--color-fox-dark)"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
        <ellipse cx="99" cy="119" rx="8" ry="13" fill="var(--color-gold-ink)" />
        <g id="squirrel-tree-canopy">
          <g fill="var(--color-accent)">
            <circle cx="54" cy="69" r="38" />
            <circle cx="128" cy="67" r="43" />
            <circle cx="90" cy="40" r="37" />
            <circle cx="96" cy="78" r="45" />
          </g>
          <g fill="var(--color-dragon-dark)">
            <circle cx="51" cy="60" r="27" />
            <circle cx="82" cy="33" r="30" />
            <circle cx="115" cy="39" r="28" />
            <circle cx="137" cy="59" r="28" />
            <circle cx="87" cy="68" r="29" />
          </g>
          <g fill="var(--color-toy-green-shadow)">
            <ellipse cx="60" cy="35" rx="9" ry="4" transform="rotate(-35 60 35)" />
            <ellipse cx="115" cy="27" rx="8" ry="4" transform="rotate(30 115 27)" />
            <ellipse cx="36" cy="63" rx="7" ry="3" />
            <ellipse cx="131" cy="69" rx="8" ry="4" transform="rotate(-20 131 69)" />
          </g>
        </g>
        <g transform="translate(133 104) scale(.5)">
          <Acorn />
        </g>
        <path
          d="M63 183Q52 160 48 174M60 183Q71 158 74 170M135 183Q145 160 150 170"
          stroke="var(--color-toy-green-shadow)"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
      </svg>

      <svg className="wildlife-nuts" viewBox="0 0 80 60">
        <ellipse cx="40" cy="49" rx="31" ry="6" fill="var(--color-toy-green-shadow)" />
        <g transform="translate(24 29) rotate(-25)">
          <Acorn />
        </g>
        <g transform="translate(48 24) rotate(14)">
          <Acorn />
        </g>
        <g transform="translate(40 36) rotate(65) scale(.85)">
          <Acorn />
        </g>
      </svg>
      <div className="squirrel-traveler">
        <svg className="squirrel-facing" viewBox="0 0 100 95">
          <defs>
            <linearGradient id="squirrel-fur" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="var(--color-fox)" />
              <stop offset="1" stopColor="var(--color-fox-dark)" />
            </linearGradient>
          </defs>
          <g className="squirrel-hop">
            <g className="squirrel-tail">
              <path
                d="M47 75C18 88-1 64 7 36C10 14 40 8 47 24C54 40 31 47 26 35C16 61 45 50 48 68Z"
                fill="url(#squirrel-fur)"
              />
              <path
                d="M32 28C16 25 15 58 31 63"
                fill="none"
                stroke="var(--color-fox-inner)"
                strokeWidth="6"
                strokeLinecap="round"
              />
            </g>
            <RunningLeg far />
            <RunningLeg front far />
            <ellipse cx="53" cy="66" rx="27" ry="16" fill="url(#squirrel-fur)" />
            <ellipse cx="59" cy="71" rx="17" ry="9" fill="var(--color-cream)" />
            <RunningLeg />
            <RunningLeg front />
            <path d="M55 37Q43 8 56 11L66 33M72 32Q68 9 78 15L81 39" fill="var(--color-fox-dark)" />
            <path d="M56 27L54 16L63 32" fill="var(--color-fox-inner)" />
            <ellipse cx="68" cy="44" rx="22" ry="19" fill="url(#squirrel-fur)" />
            <ellipse cx="81" cy="52" rx="13" ry="9" fill="var(--color-cream)" />
            <ellipse cx="71" cy="40" rx="5" ry="6.5" fill="var(--color-ink)" />
            <circle cx="72.5" cy="38" r="2" fill="var(--color-white)" />
            <ellipse cx="92" cy="48" rx="4" ry="3" fill="var(--color-ink)" />
            <path
              d="M81 55Q86 59 89 54"
              fill="none"
              stroke="var(--color-orange-ink)"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <circle cx="65" cy="50" r="4" fill="var(--color-cheek)" />
            <g className="squirrel-carried-nut" transform="translate(90 61) scale(.6)">
              <Acorn />
            </g>
          </g>
        </svg>
      </div>
      <svg className="wildlife-tree wildlife-canopy" viewBox="0 0 190 190">
        <use href="#squirrel-tree-canopy" />
      </svg>
      <div className="wildlife-bee bee-one">
        <Bee />
      </div>
      <div className="wildlife-bee bee-two">
        <Bee />
      </div>
      <div className="wildlife-bee bee-three">
        <Bee />
      </div>
    </div>
  );
}

export function SkySun() {
  return (
    <svg aria-hidden="true" className="wildlife-sun" viewBox="0 0 150 150">
      <g stroke="var(--color-toy-yellow)" strokeWidth="6" strokeLinecap="round">
        {Array.from({ length: 12 }, (_, i) => (
          <path d="M75 10V20" transform={`rotate(${i * 30} 75 75)`} key={i} />
        ))}
      </g>
      <circle cx="75" cy="75" r="43" fill="var(--color-toy-yellow)" />
      <ellipse cx="59" cy="72" rx="3" ry="4" fill="var(--color-gold-ink)" />
      <ellipse cx="91" cy="72" rx="3" ry="4" fill="var(--color-gold-ink)" />
      <ellipse cx="49" cy="85" rx="7" ry="4" fill="var(--color-fox-inner)" />
      <ellipse cx="101" cy="85" rx="7" ry="4" fill="var(--color-fox-inner)" />
      <path
        d="M62 87Q75 101 88 87"
        stroke="var(--color-gold-ink)"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
