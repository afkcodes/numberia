import { ArrowRight, Lightbulb, Tent } from 'lucide-react';
import { Character } from '../../components';
import { skillDetails } from '../../data/skillDetails';
import { availableSkills, gradeLabel, type Save, type Skill } from '../../game';
import { recommendedSkill, skillMemory } from '../../learning';
export default function Practice({
  save,
  onStart,
}: {
  save: Save;
  onStart: (skill: Skill) => void;
}) {
  const recommended = recommendedSkill(save);
  const memory = skillMemory(save, recommended);
  return (
    <section className="content-page">
      <div className="page-banner practice-banner">
        <Tent size={53} strokeWidth={1.3} />
        <div>
          <span className="skill-tag">A LITTLE ROOM TO GROW</span>
          <h1>Welcome to practice camp.</h1>
          <p>No rush, no pressure. Just you, your buddy, and a little math magic.</p>
        </div>
      </div>
      <div className="memory-invitation">
        <Character outfit={save.clubhouse.equipped.outfit} />
        <div>
          <h3>
            {memory.reviews.length
              ? 'Milo saved a little discovery for you.'
              : memory.completed
                ? 'Let’s pick up where we left off.'
                : 'A little adventure, just for you.'}
          </h3>
          <p>
            {memory.reviews.length
              ? `A fresh way to explore ${recommended}. We’ll build it together, then try something new.`
              : `Your ${recommended} adventure starts with a gentle warm-up. Milo remembers how you’re growing.`}
          </p>
        </div>
        <button className="button primary" onClick={() => onStart(recommended)}>
          Let’s try it
          <ArrowRight size={16} />
        </button>
      </div>
      <div className="section-heading">
        <div>
          <h2>What shall we discover?</h2>
          <p>Pick a skill. Every round has five fresh adventures.</p>
        </div>
        <span className="today-label">{gradeLabel(save.grade)}</span>
      </div>
      <div className="practice-grid">
        {availableSkills(save.grade).map((skill) => {
          const detail = skillDetails[skill];
          const runs = save.runs.filter((r) => r.grade === save.grade && r.skill === skill);
          return (
            <button
              className={`practice-card ${detail.className}`}
              key={skill}
              onClick={() => onStart(skill)}
            >
              <span className="practice-symbol">{detail.symbol}</span>
              <span className="skill-tag">{skill}</span>
              <h3>{detail.title}</h3>
              <p>{detail.description}</p>
              <span className="practice-bottom">
                <span>
                  {runs.length ? `${runs.length} rounds explored` : 'Something new to discover'}
                </span>
                <ArrowRight size={21} />
              </span>
            </button>
          );
        })}
      </div>
      <div className="learning-note">
        <Lightbulb size={24} />
        <div>
          <h3>Your brain loves a little “again.”</h3>
          <p>
            Come back to a skill you’ve tried before. Remembering how to do it is part of getting
            stronger.
          </p>
        </div>
      </div>
    </section>
  );
}
