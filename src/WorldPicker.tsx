import { ArrowRight, Compass, Heart, Sparkles, Sprout, Star } from 'lucide-react';
import { Character } from './components';

function FutureWorld({ stars = false }: { stars?: boolean }) {
  return (
    <svg viewBox="0 0 300 190" aria-hidden="true">
      <rect width="300" height="190" fill={stars ? 'var(--color-lilac)' : 'var(--color-blue)'} />
      {stars ? (
        <>
          <circle cx="229" cy="43" r="25" fill="var(--color-cream)" />
          <path d="M0 177L72 73L110 124L175 41L273 177Z" fill="var(--color-toy-lilac-shadow)" />
          <path d="M133 97L175 41L210 90L181 78L169 89L153 80Z" fill="var(--color-surface)" />
          <path d="M20 190L126 99L214 190Z" fill="var(--color-toy-blue-shadow)" />
          <path d="M93 130L126 99L155 129L136 125L127 137L112 125Z" fill="var(--color-cream)" />
          {[
            [29, 32],
            [91, 44],
            [133, 23],
            [258, 98],
            [271, 29],
          ].map(([x, y], i) => (
            <path
              className="world-twinkle"
              key={i}
              d={`M${x} ${y - 6}l2 4 5 2-5 2-2 5-2-5-5-2 5-2Z`}
              fill="var(--color-toy-yellow)"
              style={{ animationDelay: `${i * 0.7}s` }}
            />
          ))}
        </>
      ) : (
        <>
          <circle cx="230" cy="41" r="25" fill="var(--color-toy-yellow)" />
          <path
            d="M0 123Q53 107 107 123T209 125T300 118V190H0Z"
            fill="var(--color-toy-blue-shadow)"
          />
          <ellipse cx="144" cy="155" rx="101" ry="22" fill="var(--color-cream)" />
          <g stroke="var(--color-lilac-ink)" strokeWidth="2" strokeLinejoin="round">
            <path d="M104 151L99 82L126 55L155 87L140 154Z" fill="var(--color-toy-lilac-shadow)" />
            <path d="M126 55L126 155L155 87Z" fill="var(--color-lilac)" />
            <path
              d="M153 155L153 106L174 86L196 111L187 155Z"
              fill="var(--color-toy-peach-shadow)"
            />
            <path d="M174 86L174 155L196 111Z" fill="var(--color-peach)" />
          </g>
          <path
            d="M20 150Q33 145 46 150M219 163Q237 155 255 163M220 135Q237 128 249 135"
            fill="none"
            stroke="var(--color-surface)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}

export default function WorldPicker({
  completed,
  onExplore,
}: {
  completed: number;
  onExplore: () => void;
}) {
  return (
    <>
      <div className="world-picker-welcome">
        <Character />
        <span className="skill-tag">
          <Compass size={15} />A WHOLE WORLD OF WONDER
        </span>
        <h1>Where shall we wander?</h1>
        <p>Little footsteps. Big, beautiful discoveries.</p>
      </div>
      <div className="world-picker-cards">
        <button className="world-choice world-passport woods-passport" onClick={onExplore}>
          <div className="world-passport-art">
            <img
              src="/art/whispering-woods.png"
              alt="A magical woodland with a winding river and a treehouse"
            />
            <span className="world-passport-number">01</span>
            <span className="world-ready-sticker">
              <Sprout size={13} />
              Let’s explore!
            </span>
          </div>
          <div className="world-passport-copy">
            <h2>
              Whispering <br />
              Woods
            </h2>
            <p>Milo, moonberries, and a little woodland magic.</p>
            <div
              className="world-chapter-stars"
              aria-label={`${completed} of 5 chapters discovered`}
            >
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} size={18} fill={i < completed ? 'currentColor' : 'none'} />
              ))}
              <span>{completed}/5</span>
            </div>
            <span className="world-enter">
              Into the woods!
              <ArrowRight size={18} />
            </span>
          </div>
        </button>
        <div className="world-choice world-passport cove-passport">
          <div className="world-passport-art">
            <FutureWorld />
            <span className="world-passport-number">02</span>
          </div>
          <div className="world-passport-copy">
            <h2>
              Crystal <br />
              Cove
            </h2>
            <p>Sparkly shores and secrets beneath the waves.</p>
            <span className="world-dreaming">
              <Sparkles size={16} />
              Still being dreamed up
            </span>
          </div>
        </div>
        <div className="world-choice world-passport peaks-passport">
          <div className="world-passport-art">
            <FutureWorld stars />
            <span className="world-passport-number">03</span>
          </div>
          <div className="world-passport-copy">
            <h2>
              Starlight <br />
              Peaks
            </h2>
            <p>Follow the fireflies. Reach for something wonderful.</p>
            <span className="world-dreaming">
              <Sparkles size={16} />
              Still being dreamed up
            </span>
          </div>
        </div>
      </div>
      <p className="world-picker-footnote">
        <Heart size={15} />
        Five chapters are ready in Whispering Woods. More worlds are growing.
      </p>
    </>
  );
}
