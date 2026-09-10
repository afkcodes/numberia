import { ArrowDownToLine, ChartNoAxesCombined, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Character, Modal } from '../../components';
import { gradeLabel, type Save } from '../../game';
export default function ParentsDialog({
  save,
  onClose,
  onProgress,
  onExport,
}: {
  save: Save;
  onClose: () => void;
  onProgress: () => void;
  onExport: () => void;
}) {
  const [parentTab, setParentTab] = useState<'overview' | 'learning'>('overview');
  const level = Math.floor(save.xp / 300) + 1;
  return (
    <Modal title="Grown-up corner" onClose={onClose} className="parents-modal">
      <span className="skill-tag">
        <ShieldCheck size={16} /> GROWN-UP CORNER
      </span>
      <h1>A little insight into their adventure.</h1>
      <div className="modal-tabs">
        <button
          className={parentTab === 'overview' ? 'active' : ''}
          onClick={() => setParentTab('overview')}
        >
          Their journey
        </button>
        <button
          className={parentTab === 'learning' ? 'active' : ''}
          onClick={() => setParentTab('learning')}
        >
          How learning works
        </button>
      </div>
      {parentTab === 'overview' ? (
        <>
          <div className="parent-summary">
            <Character name={save.companion} outfit={save.clubhouse.equipped.outfit} />
            <div>
              <h2>{save.name}</h2>
              <p>
                {gradeLabel(save.grade)} · Level {level} explorer
              </p>
              <span>
                {save.runs.length * 5} challenges completed · {save.xp} XP earned
              </span>
            </div>
          </div>
          <p className="parent-copy">
            Progress stays in this browser. There are no accounts, ads, real-money purchases, public
            rankings, or time limits. Switching grades keeps each grade’s chapter progress.
          </p>
          <div className="parent-actions">
            <button
              className="button secondary"
              onClick={() => {
                onClose();
                onProgress();
              }}
            >
              <ChartNoAxesCombined size={18} />
              View learning progress
            </button>
            <button className="button secondary" onClick={onExport}>
              <ArrowDownToLine size={18} />
              Download progress
            </button>
          </div>
        </>
      ) : (
        <div className="learning-details">
          <h3>See it, think it, try it.</h3>
          <p>
            Animated berry groups connect quantities to written arithmetic. Milo offers
            problem-specific spoken coaching and demonstrations. Every completed round earns 3
            stars, 100 XP, and 15 gems; hints and retries never reduce rewards. Learning is saved
            separately for each grade and skill, including between visits. After two independent
            discoveries, the challenge grows; after support, it gently eases. Supported facts return
            after other practice, and every visit begins with a warm-up. Decorating the clubhouse
            uses earned gems only. Practice asks children to retrieve an answer, with hints and
            another try when needed.
          </p>
          <h3>Practice grows with the learner.</h3>
          <p>
            K–2 covers addition and subtraction; grades 3–4 add multiplication and division; grade 5
            also explores same-denominator fractions and tenths. Grade labels are starting points,
            not a complete curriculum or an assessment.
          </p>
          <h3>Helpful color. Purposeful movement.</h3>
          <p>
            Colors consistently distinguish groups, and each answer has a number and text feedback.
            Movement celebrates restored objects. Reduced-motion preferences are respected. We don’t
            claim a particular color palette or this game has been clinically validated.
          </p>
          <h3>Built around established learning guidance.</h3>
          <p>
            The approach draws on the Institute of Education Sciences’ guidance on{' '}
            <a href="https://ies.ed.gov/ncee/wwc/practiceguide/1" target="_blank" rel="noreferrer">
              retrieval practice and connecting concrete and abstract representations
            </a>
            , and{' '}
            <a href="https://ies.ed.gov/ncee/wwc/practiceguide/26" target="_blank" rel="noreferrer">
              representations in elementary mathematics
            </a>
            .
          </p>
        </div>
      )}
    </Modal>
  );
}
