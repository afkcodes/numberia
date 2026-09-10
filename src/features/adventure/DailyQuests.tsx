import { CheckCircle2, Footprints, Gem, Plus, Star } from 'lucide-react';
import { getDailyQuests } from '../../dailyQuests';
import { type Save, type Skill } from '../../game';
const taskIcons = { mission: Footprints, practice: Plus, stars: Star };

export default function DailyQuests({
  save,
  onStart,
  onClaim,
}: {
  save: Save;
  onStart: (skill?: Skill) => void;
  onClaim: (key: string) => void;
}) {
  const tasks = getDailyQuests(save);
  return (
    <section className="daily-section">
      <div className="section-heading">
        <div>
          <h2>
            Little quests, big possibilities<span className="heading-star">✳</span>
          </h2>
          <p>A little curiosity every day goes a long way.</p>
        </div>
        <span className="today-label">
          <span />
          Today’s quests
        </span>
      </div>
      <div className="daily-grid">
        {tasks.map((task, i) => {
          const TaskIcon = taskIcons[task.id];
          const claimed = save.claimed.includes(task.key);
          const ready = task.progress >= task.total;
          return (
            <button
              className={`daily-card daily-${i} ${claimed ? 'claimed' : ''}`}
              key={task.key}
              onClick={() => (ready ? !claimed && onClaim(task.key) : onStart(task.skill))}
              disabled={claimed}
            >
              <span className="daily-icon">
                <TaskIcon size={23} />
              </span>
              <span className="daily-content">
                <strong>{task.label}</strong>
                <span>
                  {claimed
                    ? 'Reward collected. Nicely done!'
                    : ready
                      ? 'You did it! Tap to collect your gems.'
                      : task.desc}
                </span>
                <span className="mini-progress">
                  <span style={{ width: `${(task.progress / task.total) * 100}%` }} />
                </span>
              </span>
              <span className="daily-reward">
                {claimed ? (
                  <CheckCircle2 size={20} />
                ) : (
                  <>
                    <Gem size={15} />
                    {task.reward}
                  </>
                )}
                <small>
                  {task.progress}/{task.total}
                </small>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
