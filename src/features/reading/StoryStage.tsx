import { Sparkles } from 'lucide-react';
import { useState, type Ref } from 'react';
import { playSound } from '../../audio';
import type { StoryAction } from '../../reading/content';

function RedHat() {
  return (
    <g className="sw-hat-art">
      <path d="M-42 0Q-34-15-28-46Q-6-57 23-45L32-3Z" fill="var(--sw-red)" />
      <path d="M-31-16Q1-7 29-17L32-4Q0 5-36-4Z" fill="var(--sw-gold)" />
      <ellipse cy="1" rx="53" ry="10" fill="var(--sw-red-dark)" />
      <path d="M-24-40Q-9-45 3-42" className="sw-ink-line" stroke="var(--sw-rose)" />
    </g>
  );
}

function PipPuppet({ hat, ribbon }: { hat: boolean; ribbon: boolean }) {
  return (
    <g className="sw-puppet">
      <path
        className="sw-pip-tail"
        d="M41 20Q91 50 95-5Q113 70 50 62L23 44Z"
        fill="var(--sw-green-dark)"
      />
      <path d="M87 38L103 27L105 43L93 52Z" fill="var(--sw-gold)" />
      <g className="sw-pip-feet" fill="var(--sw-green-dark)">
        <path className="sw-foot-left" d="M-35 42Q-50 56-47 68Q-22 76-10 65L-10 43Z" />
        <path className="sw-foot-right" d="M12 43L10 67Q28 80 47 65Q45 51 34 43Z" />
      </g>
      <ellipse cy="18" rx="48" ry="48" fill="var(--sw-green)" />
      <ellipse cy="29" rx="29" ry="30" fill="var(--sw-paper)" />
      <path
        className="sw-pip-arm"
        d="M-35 2Q-76-24-72 6Q-67 30-40 32Z"
        fill="var(--sw-green-dark)"
      />
      <path className="sw-pip-wave" d="M33 3Q76-25 77-7Q79 16 44 28Z" fill="var(--sw-green-dark)" />
      <g className="sw-pip-head">
        <path
          d="M-29-43Q-64-54-57-85Q-28-89-14-55M22-53Q39-91 62-87Q73-63 42-41"
          fill="var(--sw-green)"
        />
        <path d="M-3-60L2-86L14-69L23-87L28-63Z" fill="var(--sw-green-dark)" />
        <path d="M-44-42Q-49-68-1-69Q45-71 47-38Q58 1 0 5Q-55 3-44-42Z" fill="var(--sw-green)" />
        <g className="sw-pip-eyes" fill="var(--sw-ink)">
          <ellipse cx="-20" cy="-34" rx="5" ry="8" />
          <ellipse cx="24" cy="-34" rx="5" ry="8" />
        </g>
        <g fill="var(--sw-white)">
          <circle cx="-18" cy="-37" r="1.8" />
          <circle cx="26" cy="-37" r="1.8" />
        </g>
        <g fill="var(--sw-rose)">
          <ellipse cx="-34" cy="-20" rx="9" ry="5" />
          <ellipse cx="37" cy="-20" rx="9" ry="5" />
        </g>
        <path d="M-9-15Q2-3 14-15" className="sw-ink-line" />
        {hat && (
          <g transform="translate(0 -66) rotate(-7)">
            <RedHat />
          </g>
        )}
        {ribbon && (
          <g className="sw-ribbon" fill="var(--sw-red)">
            <path d="M-37-16Q-31 22 0 20Q32 19 40-16L37-18Q25 12 0 13Q-29 10-33-18Z" />
            <path d="M0 17Q-27-1-24 21Q-18 31 0 21Q21 40 25 17Q24 4 0 17M-3 20L-16 40L-3 36L4 23L14 39L20 36L4 19Z" />
          </g>
        )}
      </g>
    </g>
  );
}

export default function StoryStage({
  scene = 'cover',
  action,
  performing,
  finished,
  take,
  sound,
  stageRef,
  onContinue,
  continueLabel,
}: {
  scene?: 'cover' | StoryAction;
  action?: StoryAction;
  performing: boolean;
  finished: boolean;
  take: number;
  sound: boolean;
  stageRef?: Ref<HTMLDivElement>;
  onContinue?: () => void;
  continueLabel?: string;
}) {
  const [wonder, setWonder] = useState(false);
  const remix = scene === 'spin' || scene === 'tiptoe' || (scene === 'home' && action === 'hop');
  const active = action ?? scene;
  const hatOn = scene === 'cover' || scene === 'home' || scene === 'spin' || scene === 'tiptoe';
  return (
    <div
      ref={stageRef}
      className={`sw-stage scene-${scene} act-${active} ${performing ? 'is-performing' : ''} ${finished ? 'has-performed' : ''} ${remix ? 'is-remix' : ''} ${onContinue ? 'has-mobile-next' : ''}`}
    >
      <div className="sw-stage-label">
        <span className="sw-live-dot" /> Pip’s paper playground
      </div>
      <svg
        className="sw-stage-art"
        viewBox="0 0 640 600"
        role="img"
        aria-label={
          performing
            ? `Pip’s story comes to life: ${active}`
            : 'A paper storybook with Pip the little dragon, a red hat, a pond and a friendly duck.'
        }
      >
        <path d="M0 0H640V600H0Z" fill="var(--sw-sky)" />
        <g className="sw-paper-clouds" fill="var(--sw-white)">
          <path d="M80 108Q55 90 73 72Q91 57 106 71Q109 44 135 48Q163 48 164 77Q191 77 193 100Q154 113 80 108Z" />
          <path d="M411 179Q389 159 406 146Q419 133 435 143Q448 112 470 126Q484 133 484 147Q511 141 518 165Q498 184 411 179Z" />
        </g>
        <g transform="translate(504 87)" className="sw-paper-sun">
          <g stroke="var(--sw-gold)" strokeWidth="5" strokeLinecap="round">
            {Array.from({ length: 12 }, (_, i) => (
              <path key={i} d="M0-38V-48" transform={`rotate(${i * 30})`} />
            ))}
          </g>
          <circle r="28" fill="var(--sw-gold)" />
          <g fill="var(--sw-ink)">
            <ellipse cx="-8" cy="-3" rx="2" ry="3" />
            <ellipse cx="9" cy="-3" rx="2" ry="3" />
          </g>
          <path d="M-7 8Q1 16 9 7" className="sw-ink-line" />
        </g>
        <path d="M0 304Q136 162 272 302Q386 172 640 270V600H0Z" fill="var(--sw-hill-back)" />
        <path d="M0 372Q89 254 268 372Q454 244 640 334V600H0Z" fill="var(--sw-hill)" />
        <path d="M0 450Q145 357 371 430Q520 368 640 440V600H0Z" fill="var(--sw-grass)" />
        <path
          d="M180 600Q281 515 353 513Q449 485 491 444L548 458Q481 532 396 551Q319 566 280 600Z"
          fill="var(--sw-sand)"
        />
        <g className="sw-stage-trees">
          <path d="M61 259L80 498L106 498L86 253Z" fill="var(--sw-brown)" />
          <path
            d="M87 315L127 270M81 349L36 309"
            fill="none"
            stroke="var(--sw-brown)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M-26 273Q-34 231 13 211Q-6 150 46 140Q68 87 112 118Q172 92 186 147Q236 170 204 214Q219 275 160 275Q121 322 75 286Q20 305-26 273"
            fill="var(--sw-green-dark)"
          />
          <path
            d="M26 186Q20 166 43 154M99 153Q129 125 155 153M111 241Q142 262 166 238"
            fill="none"
            stroke="var(--sw-green)"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <path d="M596 256L581 461L603 461L615 256Z" fill="var(--sw-brown)" />
          <path
            d="M526 258Q507 224 539 197Q531 148 573 153Q597 114 631 151Q676 143 683 182Q724 207 688 243Q664 277 625 261Q570 305 526 258Z"
            fill="var(--sw-green)"
          />
        </g>
        <ellipse cx="470" cy="479" rx="134" ry="51" fill="var(--sw-water-edge)" />
        <ellipse cx="470" cy="472" rx="130" ry="44" fill="var(--sw-water)" />
        <g fill="none" stroke="var(--sw-water-light)" strokeWidth="3" strokeLinecap="round">
          <path d="M387 462Q408 457 425 462M514 493Q534 488 551 492M447 482H476M514 448H535" />
        </g>
        <g className="sw-story-log" transform="translate(334 425)">
          <path d="M-18-14L47-30Q64-16 54 6L-16 17Z" fill="var(--sw-brown)" />
          <ellipse cy="2" rx="22" ry="19" fill="var(--sw-sand)" />
          <ellipse
            cy="2"
            rx="13"
            ry="11"
            fill="none"
            stroke="var(--sw-brown-light)"
            strokeWidth="3"
          />
          <path d="M26-19L47-22M30-3L46-8" stroke="var(--sw-brown-light)" strokeWidth="3" />
        </g>
        <g className="sw-reeds" stroke="var(--sw-green-dark)" strokeWidth="4" strokeLinecap="round">
          <path d="M568 486L576 442M571 465L594 451M397 513L389 480M394 494L404 481" />
        </g>
        <g className="sw-duck-location" transform="translate(498 459)">
          <g className="sw-duck">
            <path
              d="M-21-1L-35-14Q-43 12-8 18Q18 21 23-4L22-21L4-25L-5-3Z"
              fill="var(--sw-paper)"
            />
            <circle cx="12" cy="-23" r="17" fill="var(--sw-paper)" />
            <path d="M25-22L44-14L26-11Z" fill="var(--sw-orange)" />
            <circle cx="16" cy="-26" r="2.5" fill="var(--sw-ink)" />
            <path d="M-22 1Q-14 17 2 3" fill="none" stroke="var(--sw-gold)" strokeWidth="3" />
          </g>
        </g>
        <g className="sw-paper-flowers">
          {[
            [47, 532],
            [132, 496],
            [577, 543],
            [610, 505],
            [332, 570],
            [125, 575],
          ].map(([x, y], i) => (
            <g transform={`translate(${x} ${y})`} key={i}>
              <path
                d="M0 0V18M0 12L-8 7"
                stroke="var(--sw-green-dark)"
                strokeWidth="3"
                fill="none"
              />
              <path
                d="M0-4Q-13-16-14-3Q-15 4-5 4Q-9 17 1 14Q8 15 6 5Q21 3 11-5Q7-13 0-4"
                fill={i % 2 ? 'var(--sw-rose)' : 'var(--sw-paper)'}
              />
              <circle cy="2" r="4" fill="var(--sw-gold)" />
            </g>
          ))}
        </g>
        <ellipse
          className="sw-pip-shadow"
          cx="239"
          cy="493"
          rx="57"
          ry="10"
          fill="var(--sw-shadow)"
        />
        <g transform="translate(239 423)">
          <g key={`pip-${take}`} className="sw-pip-mover">
            <PipPuppet hat={hatOn} ribbon={scene === 'home' || remix} />
          </g>
        </g>
        {!hatOn && (
          <g key={`hat-${take}`} className="sw-flying-hat">
            <RedHat />
          </g>
        )}
        <g
          className="sw-wind-lines"
          fill="none"
          stroke="var(--sw-white)"
          strokeWidth="4"
          strokeLinecap="round"
        >
          <path d="M89 334Q180 300 274 314Q316 320 302 296Q294 285 283 296M144 348Q206 326 249 337M37 322L73 312" />
        </g>
        <g className="sw-stage-confetti">
          {Array.from({ length: 12 }, (_, i) => (
            <path
              key={i}
              d="M0-6L2-2L6 0L2 2L0 6L-2 2L-6 0L-2-2Z"
              transform={`translate(${135 + ((i * 37) % 351)} ${180 + ((i * 47) % 151)})`}
              fill={i % 2 ? 'var(--sw-gold)' : 'var(--sw-red)'}
            />
          ))}
        </g>
      </svg>
      <div className="sw-curtain sw-curtain-left" aria-hidden="true" />
      <div className="sw-curtain sw-curtain-right" aria-hidden="true" />
      <div className="sw-stage-caption" role="status">
        {performing
          ? active === 'wind'
            ? 'Whoooosh! There goes the hat!'
            : active === 'duck'
              ? 'A gentle nudge. A new friend.'
              : active === 'home'
                ? 'A ribbon, a knot… it stays put!'
                : active === 'spin'
                  ? 'One word. A whole new twirl!'
                  : active === 'tiptoe'
                    ? 'Shhh… tiny, quiet steps.'
                    : 'Hop, hop! Your words moved Pip!'
          : wonder
            ? 'I’m Lumi. Tap a word and I’ll help you find its meaning.'
            : finished
              ? 'You brought that part to life.'
              : 'A little world, waiting for your words.'}
      </div>
      <button
        className={`sw-lumi ${wonder ? 'awake' : ''}`}
        aria-label="Say hello to Lumi"
        aria-pressed={wonder}
        onClick={() => {
          setWonder(!wonder);
          if (sound) playSound('chime');
        }}
      >
        <Sparkles size={22} />
        <span>Lumi</span>
      </button>
      {onContinue && (
        <button className="sw-stage-next sw-primary" onClick={onContinue}>
          {continueLabel}
        </button>
      )}
    </div>
  );
}
