import { ArrowRight, Heart, Star } from 'lucide-react';
import type { CSSProperties } from 'react';
import { Character } from './components';
import type { Skill } from './game';

export default function DiscoveryCelebration({
  skill,
  companion,
  outfit,
  equation,
  answer,
  helped,
  last,
  handsOn,
  onNext,
}: {
  skill: Skill;
  companion: string;
  outfit?: string;
  equation: string;
  answer: string;
  helped: boolean;
  last: boolean;
  handsOn: boolean;
  onNext: () => void;
}) {
  const bridge = handsOn && skill === 'subtraction';
  return (
    <div
      className={`discovery-celebration ${bridge ? 'after-bridge' : ''}`}
      aria-label="Your discovery celebration"
    >
      <div className="discovery-star-burst" aria-hidden="true">
        {Array.from({ length: 9 }, (_, i) => (
          <Star
            key={i}
            fill="currentColor"
            style={
              {
                '--spark-x': `${Math.cos((i / 9) * Math.PI * 2) * 145}px`,
                '--spark-y': `${Math.sin((i / 9) * Math.PI * 2) * 100}px`,
                '--spark-turn': `${i * 40}deg`,
                '--spark-delay': `${i * 0.035}s`,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <div className="discovery-cheer-character">
        <Character name={bridge ? 'Pip' : companion} outfit={outfit} />
        <span>
          <Star size={22} fill="currentColor" />
        </span>
      </div>
      <div className="discovery-cheer-copy">
        <span className="discovery-cheer-kicker">
          <Heart size={13} />
          LOOK WHAT YOU MADE HAPPEN
        </span>
        <strong>
          {bridge
            ? 'You built a bridge!'
            : handsOn && skill === 'addition'
              ? 'A picnic made by you!'
              : 'You figured it out!'}
        </strong>
        <span className="discovery-cheer-equation">
          {equation} = {answer}
        </span>
        <p>
          {helped
            ? 'We figured it out together. Every try counts.'
            : bridge
              ? 'Pip’s waving a big thank-you!'
              : 'That’s your little moment to shine.'}
        </p>
      </div>
      <button className="discovery-next" onClick={onNext}>
        {last ? 'Open my treasures' : 'Next discovery'}
        <ArrowRight size={19} />
      </button>
    </div>
  );
}
