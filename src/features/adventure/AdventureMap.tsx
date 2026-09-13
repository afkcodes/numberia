import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  Compass,
  Gift,
  Gem,
  Leaf,
  LockKeyhole,
  Map,
  Sparkles,
  Sprout,
  Star,
  TreePine,
} from 'lucide-react';
import { useState } from 'react';
import { Character, Stars } from '../../components';
import { skillDetails } from '../../data/skillDetails';
import {
  completedMissions,
  getWorld,
  missions,
  missionSkill,
  nextMission,
  type Save,
} from '../../game';
export default function AdventureMap({
  save,
  onStart,
  onWorlds,
  onDaily,
}: {
  save: Save;
  onStart: (index: number) => void;
  onWorlds: () => void;
  onDaily: () => void;
}) {
  const world = getWorld(save.world);
  const completed = completedMissions(save, world.id);
  const current = nextMission(save);
  const [selected, setSelected] = useState(current);
  const mission = missions[selected];
  const positions =
    world.id === 'crystal'
      ? [
          { left: '15%', top: '69%' },
          { left: '37%', top: '48%' },
          { left: '59%', top: '47%' },
          { left: '76%', top: '34%' },
          { left: '88%', top: '16%' },
        ]
      : [
          { left: '19%', top: '73%' },
          { left: '36%', top: '50%' },
          { left: '57%', top: '51%' },
          { left: '73%', top: '30%' },
          { left: '88%', top: '19%' },
        ];
  return (
    <section
      className={`journey-section adventure-world-${world.id}`}
      aria-label={`Your adventure in ${world.name}`}
    >
      <div className="section-heading journey-heading">
        <div>
          <h2>Your next adventure adds up.</h2>
          <p>A world of wonder. One little discovery at a time.</p>
        </div>
        <div className="journey-tools">
          <button
            className="button secondary daily-quests-trigger"
            aria-haspopup="dialog"
            onClick={onDaily}
          >
            <Gift size={19} />
            <span>Little quests</span>
          </button>
          <button className="button small secondary" onClick={onWorlds}>
            <Map size={16} />
            All worlds
            <ChevronDown size={15} />
          </button>
        </div>
      </div>
      <div className="journey-grid">
        <div className="map-card">
          <div className="map-card-header">
            <div className="world-icon">
              {world.id === 'crystal' ? <Gem size={22} /> : <TreePine size={22} />}
            </div>
            <div>
              <span className="world-eyebrow">WORLD {world.number}</span>
              <h3>{world.name}</h3>
            </div>
            <span className="world-completion">
              {completed.length}
              <span> / 5 chapters</span>
              <div className="world-progress">
                <span style={{ width: `${completed.length * 20}%` }} />
              </div>
            </span>
          </div>
          <div className="world-map">
            <img
              className="map-art"
              src={world.art}
              alt={world.artDescription}
              fetchPriority="high"
            />
            <div className="map-top-note">
              <Leaf size={13} />
              <span>
                {completed.length === 5 ? 'A little magic, everywhere.' : world.invitation}
              </span>
            </div>
            <svg
              className="map-route"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                vectorEffect="non-scaling-stroke"
                d={
                  world.id === 'crystal'
                    ? 'M15 69C25 65 24 49 37 48S48 51 59 47S70 43 76 34S87 25 88 16'
                    : 'M19 73C25 69 24 51 36 50S48 57 57 51S62 36 73 30S81 22 88 19'
                }
              />
            </svg>
            {world.chapters.map((i, chapter) => {
              const m = missions[i];
              const done = completed.includes(i);
              const locked = i > current;
              const best = Math.max(
                0,
                ...save.runs
                  .filter((r) => !r.practice && r.grade === save.grade && r.mission === i)
                  .map((r) => r.stars),
              );
              return (
                <div
                  className={`map-stop ${done ? 'done' : locked ? 'locked' : 'current'} ${selected === i ? 'selected' : ''}`}
                  style={positions[chapter]}
                  key={m.short}
                >
                  {i === current && !done && (
                    <span
                      className={`map-trail-buddy ${chapter === 4 ? 'buddy-at-canopy' : ''}`}
                      aria-hidden="true"
                    >
                      <span className="buddy-trail-shadow" />
                      <Character name={save.companion} outfit={save.clubhouse.equipped.outfit} />
                      <span className="buddy-trail-spark">✦</span>
                    </span>
                  )}
                  <button
                    aria-label={`${m.short}${locked ? ', locked. Complete the previous chapter first' : done ? ', completed. Replay chapter' : ', start chapter'}`}
                    aria-disabled={locked}
                    onClick={() => {
                      if (!locked) setSelected(i);
                    }}
                    className="map-node"
                  >
                    {done ? (
                      <Check size={25} strokeWidth={3} />
                    ) : locked ? (
                      <LockKeyhole size={20} />
                    ) : (
                      <span>{chapter + 1}</span>
                    )}
                  </button>
                  <span className="map-stop-label">{m.short}</span>
                  {done && <Stars count={best} size={12} />}
                </div>
              );
            })}
            <div className="map-bottom-caption">
              <span className="map-legend-dot" />
              {completed.length === 5
                ? world.id === 'crystal'
                  ? 'Crystal Cove guardian'
                  : 'Woodland guardian'
                : 'The adventure begins with you'}
            </div>
            <button className="map-compass" aria-label="Explore all worlds" onClick={onWorlds}>
              <Compass size={27} strokeWidth={1.4} />
            </button>
          </div>
          <div className="map-footer">
            <span>
              <Sprout size={15} />
              Little steps. Legendary adventures.
            </span>
            <div>
              <span className="legend-complete" />
              Completed
              <span className="legend-next" />
              Up next
            </div>
          </div>
        </div>
        <aside className="mission-card">
          <div className="mission-kicker">
            <span className="live-dot" />
            {completed.includes(selected) ? 'Play it again' : 'Your next chapter'}
            <BookOpen size={17} />
          </div>
          <div className="mission-mascot">
            <span className="mascot-disc" />
            <Character name={mission.companion} />
            <Sparkles className="mascot-spark" size={20} />
            <span className="mascot-name">Meet {mission.companion}!</span>
          </div>
          <h3>{mission.title}</h3>
          <p>{mission.story}</p>
          <div className="mission-skill">
            <span className="skill-symbol">
              {skillDetails[missionSkill(save.grade, selected)].symbol}
            </span>
            <div>
              <strong>
                {missionSkill(save.grade, selected).charAt(0).toUpperCase() +
                  missionSkill(save.grade, selected).slice(1)}{' '}
                magic
              </strong>
              <span>
                {save.grade <= 1
                  ? 'Count it. See it. Make it happen.'
                  : 'A little thinking unlocks a lot.'}
              </span>
            </div>
          </div>
          <div className="mission-rewards">
            <span>
              <Star size={15} />
              100 XP for finishing
            </span>
            <span>
              <Gift size={15} />A surprise!
            </span>
          </div>
          <button className="button primary full" onClick={() => onStart(selected)}>
            {completed.includes(selected) ? 'Play again' : 'Let’s play'}
            <ArrowRight size={20} />
          </button>
          <span className="mission-duration">5 little challenges · At your own pace</span>
        </aside>
      </div>
    </section>
  );
}
