import {
  Award,
  Backpack,
  Check,
  CheckCircle2,
  Crown,
  Gem,
  Lightbulb,
  LockKeyhole,
  Sparkles,
} from 'lucide-react';
import { Character, EmptyState } from '../../components';
import { missions, worldForMission, type Save } from '../../game';
import { storyTitle } from '../../reading/content';
import StoryPassport from '../reading/StoryPassport';
export default function BackpackPage({
  save,
  onCompanion,
  onAdventure,
  onReading,
}: {
  save: Save;
  onCompanion: (name: string) => void;
  onAdventure: () => void;
  onReading: () => void;
}) {
  const completed = [...new Set(save.runs.filter((r) => !r.practice).map((r) => r.mission))];
  return (
    <section className="content-page">
      <div className="section-heading large-heading">
        <div>
          <h1>A backpack full of stories.</h1>
          <p>Every little treasure holds a big adventure.</p>
        </div>
        <span className="treasure-count">
          <Gem size={21} />
          {save.gems} gems
        </span>
      </div>
      {save.reading.completed.length > 0 && (
        <>
          <h2 className="subsection-title">A story you made your own</h2>
          <div className="sw-story-treasure">
            <div className="sw-keepsake">
              <span className="sw-keepsake-hat" aria-hidden="true" />
              <span>Story maker</span>
            </div>
            <div>
              <h3>{storyTitle}</h3>
              <p>Your ending: Pip {save.reading.completed.at(-1)!.remix} in his red hat.</p>
            </div>
            <button className="sw-soft-button" onClick={onReading}>
              Read & remix again
            </button>
            <StoryPassport reading={save.reading} />
          </div>
        </>
      )}
      <h2 className="subsection-title">Better with a buddy</h2>
      <div className="companion-grid">
        {[
          {
            name: 'Milo',
            role: 'The curious fox',
            need: 0,
            description: 'A big heart, a tiny satchel, and a nose for adventure.',
          },
          {
            name: 'Pip',
            role: 'The gentle dragon',
            need: 2,
            description: 'A little shy. A little clumsy. A whole lot of brave.',
          },
          {
            name: 'Lumi',
            role: 'The starlight keeper',
            need: 4,
            description: 'Proof that even the smallest friend can light the way.',
          },
        ].map((c) => {
          const readingFriend =
            c.name === 'Pip'
              ? save.reading.completed.length > 0
              : c.name === 'Lumi' && save.reading.endings.length === 3;
          const locked = completed.length < c.need && !readingFriend;
          return (
            <div className={`companion-card ${locked ? 'is-locked' : ''}`} key={c.name}>
              <Character name={c.name} />
              <div>
                <h3>
                  {c.name}
                  <span>{c.role}</span>
                </h3>
                <p>{c.description}</p>
              </div>
              <button
                className={`button ${save.companion === c.name ? 'primary' : 'secondary'}`}
                disabled={locked}
                onClick={() => onCompanion(c.name)}
              >
                {locked ? (
                  <>
                    <LockKeyhole size={15} />
                    Complete {c.need} chapters
                  </>
                ) : save.companion === c.name ? (
                  <>
                    <Check size={17} />
                    My adventure buddy
                  </>
                ) : (
                  'Choose as my buddy'
                )}
              </button>
            </div>
          );
        })}
      </div>
      <h2 className="subsection-title">
        Treasures from the trail{' '}
        <span>
          {completed.length} / {missions.length}
        </span>
      </h2>
      {!completed.length ? (
        <EmptyState
          title="Your first keepsake is out there."
          text="Finish a story chapter to bring home a little piece of Numberia."
          action="Let’s find it"
          onAction={onAdventure}
        />
      ) : (
        <div className="treasure-grid">
          {missions.map((m, i) => (
            <div
              className={`treasure-card ${completed.includes(i) ? '' : 'is-locked'}`}
              key={m.item}
            >
              <span className={`treasure-object treasure-${i % 5}`}>
                {i >= 5 ? (
                  <Gem size={38} />
                ) : i === 0 ? (
                  <Lightbulb size={38} />
                ) : i === 1 ? (
                  <Award size={38} />
                ) : i === 2 ? (
                  <Backpack size={38} />
                ) : i === 3 ? (
                  <Sparkles size={38} />
                ) : (
                  <Crown size={38} />
                )}
              </span>
              <h3>{m.reward}</h3>
              <span>
                {completed.includes(i)
                  ? m.short
                  : `${worldForMission(i).name} · Chapter ${worldForMission(i).chapters.indexOf(i) + 1}`}
              </span>
              {completed.includes(i) ? <CheckCircle2 size={17} /> : <LockKeyhole size={17} />}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
