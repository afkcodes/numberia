import { ArrowRight, Compass, Gem, Heart, Sparkles, Sprout, Star } from 'lucide-react';
import { Character } from './components';
import { completedMissions, worlds, type Save, type WorldId } from './game';

function ComingWorldsArt() {
  return (
    <svg viewBox="0 0 300 190" aria-hidden="true">
      <rect width="300" height="190" fill="#e2eced" />
      <circle cx="239" cy="38" r="23" fill="#ffda75" />
      <path d="M0 149Q70 91 155 145T300 127V190H0Z" fill="#b3d3bf" />
      <path d="M0 172Q94 133 178 169T300 152V190H0Z" fill="#87b9a4" />
      <g stroke="#739995" strokeWidth="2" strokeLinejoin="round">
        <path d="M64 58l57-15 58 14 55-15-13 104-52 16-58-15-57 17Z" fill="#fff5d8" />
        <path d="M121 43l-10 104 58 15 10-105Z" fill="#e0eac6" />
        <path
          d="M111 145q5-32 37-35t38-33"
          fill="none"
          stroke="#b087c4"
          strokeWidth="4"
          strokeDasharray="5 7"
          strokeLinecap="round"
        />
      </g>
      <path d="M184 65l4 9 10 2-8 6 2 10-8-5-9 5 2-10-7-6 10-2Z" fill="#f0ae3b" />
      <circle cx="99" cy="144" r="7" fill="#47846d" />
      <path
        d="M38 35l3 7 8 3-8 3-3 7-3-7-8-3 8-3Zm222 83 3 7 8 3-8 3-3 7-3-7-8-3 8-3Z"
        fill="#a478c2"
        className="world-twinkle"
      />
    </svg>
  );
}

export default function WorldPicker({
  save,
  onExplore,
}: {
  save: Save;
  onExplore: (world: WorldId) => void;
}) {
  return (
    <>
      <div className="world-picker-welcome">
        <Character />
        <span className="skill-tag">
          <Compass size={15} />A whole world of wonder
        </span>
        <h1>Where shall we wander?</h1>
        <p>Two worlds. Ten little adventures. So much to discover.</p>
      </div>
      <div className="world-picker-cards">
        {worlds.map((world) => {
          const completed = completedMissions(save, world.id).length;
          const selected = save.world === world.id;
          const WorldIcon = world.id === 'crystal' ? Gem : Sprout;
          return (
            <button
              key={world.id}
              className={`world-choice world-passport ${world.id === 'crystal' ? 'cove' : 'woods'}-passport`}
              onClick={() => onExplore(world.id)}
              aria-label={`Explore ${world.name}`}
              aria-pressed={selected}
            >
              <div className="world-passport-art">
                <img src={world.art} alt={world.artDescription} />
                <span className="world-passport-number">{world.number}</span>
                <span className="world-ready-sticker">
                  <WorldIcon size={13} />
                  {selected ? 'Your current world' : 'Let’s explore!'}
                </span>
              </div>
              <div className="world-passport-copy">
                <h2>{world.name}</h2>
                <p>{world.description}</p>
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
                  {world.enterLabel}
                  <ArrowRight size={18} />
                </span>
              </div>
            </button>
          );
        })}
        <article className="world-choice world-passport coming-passport">
          <div className="world-passport-art">
            <ComingWorldsArt />
          </div>
          <div className="world-passport-copy">
            <h2>More worlds coming</h2>
            <p>We’re dreaming up new places for your next big little adventure.</p>
            <span className="world-dreaming">
              <Sparkles size={17} />
              The story keeps growing!
            </span>
          </div>
        </article>
      </div>
      <p className="world-picker-footnote">
        <Heart size={15} />
        Pick either world. Your discoveries stay safe when you switch.
      </p>
    </>
  );
}
