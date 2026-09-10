import { Flame, Footprints, Map, Sparkles, Star, Tent } from 'lucide-react';
import { EmptyState, Stars } from '../../components';
import { skillDetails } from '../../data/skillDetails';
import { availableSkills, gradeLabel, missions, streak, type Save } from '../../game';
export default function ProgressPage({
  save,
  onAdventure,
}: {
  save: Save;
  onAdventure: () => void;
}) {
  const runs = save.runs.filter((r) => r.grade === save.grade);
  return (
    <section className="content-page">
      <div className="section-heading large-heading">
        <div>
          <h1>Look how far you’ve grown.</h1>
          <p>Big things happen one little discovery at a time.</p>
        </div>
        <span className="today-label">{gradeLabel(save.grade)}</span>
      </div>
      <div className="stats-grid">
        {[
          { icon: Footprints, value: runs.length, label: 'Adventures completed' },
          {
            icon: Star,
            value: runs.reduce((s, r) => s + r.stars, 0),
            label: 'Adventure stars earned',
          },
          { icon: Sparkles, value: runs.length * 5, label: 'Challenges figured out' },
          { icon: Flame, value: streak(save.runs), label: 'Days on your current streak' },
        ].map((s) => (
          <div className="stat-card" key={s.label}>
            <s.icon size={23} />
            <strong>{s.value}</strong>
            <span>{s.label}</span>
          </div>
        ))}
      </div>
      {!runs.length ? (
        <EmptyState
          title="This is where your story grows."
          text="Take your first adventure, and we’ll keep track of all the things you’re learning."
          action="Start my adventure"
          onAction={onAdventure}
        />
      ) : (
        <>
          <h2 className="subsection-title">Your math garden</h2>
          <div className="mastery-list">
            {availableSkills(save.grade).map((skill) => {
              const attempts = runs.filter((r) => r.skill === skill);
              const ratio = Math.min(1, attempts.length / 5);
              return (
                <div className="mastery-row" key={skill}>
                  <span className={`skill-symbol ${skillDetails[skill].className}`}>
                    {skillDetails[skill].symbol}
                  </span>
                  <div>
                    <strong>{skill.charAt(0).toUpperCase() + skill.slice(1)}</strong>
                    <span>
                      {!attempts.length
                        ? 'Ready to plant your first seed'
                        : ratio >= 0.8
                          ? 'Blooming beautifully'
                          : 'Growing with every try'}
                    </span>
                  </div>
                  <div className="mastery-bar">
                    <span style={{ width: `${ratio * 100}%` }} />
                  </div>
                  <span>{attempts.length} rounds</span>
                </div>
              );
            })}
          </div>
          <p className="progress-explanation">
            Every completed round helps your garden grow. Hints, help, and brave tries count just as
            much. Keep exploring!
          </p>
          <h2 className="subsection-title">Footprints on the trail</h2>
          <div className="activity-list">
            {[...runs]
              .reverse()
              .slice(0, 8)
              .map((r) => (
                <div className="activity-row" key={r.id}>
                  <span className="activity-icon">
                    {r.practice ? <Tent size={22} /> : <Map size={22} />}
                  </span>
                  <div>
                    <strong>
                      {r.practice
                        ? `${r.skill.charAt(0).toUpperCase() + r.skill.slice(1)} practice`
                        : missions[r.mission].title}
                    </strong>
                    <span>
                      {new Date(`${r.date}T12:00:00`).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      · 5 discoveries · You kept going!
                    </span>
                  </div>
                  <Stars count={r.stars} />
                  <strong className="activity-xp">+{r.xp} XP</strong>
                </div>
              ))}
          </div>
        </>
      )}
    </section>
  );
}
