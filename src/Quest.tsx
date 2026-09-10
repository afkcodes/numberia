import {
  ArrowRight,
  CheckCircle2,
  Cherry,
  Gem,
  Hand,
  Heart,
  Home,
  Map as MapIcon,
  MoonStar,
  Sparkles,
  Sprout,
  Star,
  TreeDeciduous,
  UtensilsCrossed,
  Volume2,
  VolumeX,
  Waves,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { playSound, speak, stopSpeaking } from './audio';
import Celebration from './Celebration';
import { Character, Modal, Stars } from './components';
import DiscoveryCelebration from './DiscoveryCelebration';
import {
  dateKey,
  gradeLabel,
  missions,
  missionSkill,
  type Run,
  type Save,
  type Skill,
} from './game';
import HandsOn from './HandsOn';
import HintCoach from './HintCoach';
import { nextDiscovery, type LearningObservation } from './learning';
import MathGarden from './MathGarden';
import Meadow from './Meadow';
import ChapterIllustration from './playgrounds/ChapterIllustration';
import MathSupport from './playgrounds/MathSupport';
import { playgroundTheme } from './playgrounds/themes';

const chapterIcons = {
  moonberry: Cherry,
  bridge: Waves,
  picnic: UtensilsCrossed,
  firefly: MoonStar,
  wishing: TreeDeciduous,
};

type QuestProps = {
  save: Save;
  missionIndex: number;
  practiceSkill?: Skill;
  onClose: () => void;
  onLearn: (observation: LearningObservation) => void;
  onClubhouse: () => void;
  onComplete: (run: Run) => void;
  onContinue: () => void;
  onSoundChange: () => void;
};

export default function Quest({
  save,
  missionIndex,
  practiceSkill,
  onClose,
  onComplete,
  onContinue,
  onSoundChange,
  onLearn,
  onClubhouse,
}: QuestProps) {
  const mission = missions[missionIndex];
  const theme = playgroundTheme(missionIndex);
  const ChapterIcon = chapterIcons[theme.id];
  const skill = practiceSkill || missionSkill(save.grade, missionIndex);
  const [stage, setStage] = useState<'intro' | 'play' | 'reward'>('intro');
  const [round, setRound] = useState(0);
  const [discovery, setDiscovery] = useState(() => nextDiscovery(save, skill, 0));
  const problem = discovery.problem;
  const [handsOn, setHandsOn] = useState(false);
  const reviewed = useRef<string[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'retry' | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [hint, setHint] = useState(false);
  const [showMagic, setShowMagic] = useState(0);
  const [mathSupportOpen, setMathSupportOpen] = useState(false);
  const [unassisted, setUnassisted] = useState(0);
  const [scratch, setScratch] = useState('');
  const helped = useRef(false);
  const [supportedAnswer, setSupportedAnswer] = useState(false);
  const submitted = useRef(false);
  const answered = useRef(false);
  const [id] = useState(() => crypto.randomUUID());
  const actionRef = useRef<HTMLButtonElement>(null);
  const firstAnswerRef = useRef<HTMLButtonElement>(null);
  // Persistence is the achievement. Help and retries never reduce rewards.
  const stars = 3;
  const xp = 100;
  const formatAnswer = (n: number) =>
    problem.denominator
      ? `${n}/${problem.denominator}`
      : skill === 'decimals'
        ? n.toFixed(1)
        : String(n);
  const answer = useCallback(
    (value: number) => {
      if (answered.current) return;
      setSelected(value);
      if (value === problem.answer) {
        answered.current = true;
        setSupportedAnswer(helped.current);
        setFeedback('correct');
        setHint(false);
        onLearn({
          id: `${id}:${round}`,
          grade: save.grade,
          problem,
          supported: helped.current,
          date: dateKey(),
        });
        if (!helped.current) setUnassisted((v) => v + 1);
        if (save.sound) playSound('correct');
        stopSpeaking();
      } else {
        helped.current = true;
        setFeedback('retry');
        setHint(true);
        if (save.sound) playSound('try');
      }
    },
    [problem, save.sound, save.grade, onLearn, round, id],
  );
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (
        stage !== 'play' ||
        handsOn ||
        (event.target as HTMLElement).closest('.math-support-modal') ||
        ['TEXTAREA', 'INPUT'].includes((event.target as HTMLElement).tagName)
      )
        return;
      if (['1', '2', '3', '4'].includes(event.key) && feedback !== 'correct') {
        event.preventDefault();
        answer(problem.choices[Number(event.key) - 1]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [stage, handsOn, problem.choices, feedback, answer]);
  useEffect(() => {
    if (feedback === 'correct') actionRef.current?.focus({ preventScroll: true });
  }, [feedback]);
  useEffect(() => {
    if (stage === 'play' && !handsOn) firstAnswerRef.current?.focus({ preventScroll: true });
  }, [stage, round, handsOn]);
  const advance = () => {
    if (!answered.current) return;
    stopSpeaking();
    if (round === 4) {
      if (submitted.current) return;
      submitted.current = true;
      onComplete({
        id,
        date: dateKey(),
        grade: save.grade,
        mission: missionIndex,
        skill,
        stars,
        unassisted,
        xp,
        practice: !!practiceSkill,
      });
      setStage('reward');
      if (save.sound) playSound('celebrate');
    } else {
      const next = nextDiscovery(save, skill, round + 1, reviewed.current);
      if (next.reviewKey) reviewed.current.push(next.reviewKey);
      setRound((r) => r + 1);
      setDiscovery(next);
      setSelected(null);
      setFeedback(null);
      setHint(false);
      setShowMagic(0);
      setMathSupportOpen(false);
      setScratch('');
      helped.current = false;
      setSupportedAnswer(false);
      answered.current = false;
    }
  };
  const readAloud = () => {
    if (save.sound) void speak(`What is ${problem.equation}?`);
  };
  useEffect(() => () => stopSpeaking(), []);
  return (
    <Modal
      title={practiceSkill ? `${skill} practice` : mission.title}
      onClose={onClose}
      className={`quest-modal playground-${theme.id} ${stage}`}
    >
      {stage === 'intro' && (
        <>
          <div className="quest-illustration">
            <ChapterIllustration id={theme.id} />
            <Character
              name={practiceSkill ? save.companion : mission.companion}
              outfit={save.clubhouse.equipped.outfit}
            />
            <span className="scene-spark one">
              <Sparkles />
            </span>
            <span className="scene-spark two">
              <Star />
            </span>
            <span className="quest-chapter">
              {practiceSkill ? 'PRACTICE CAMP' : `WHISPERING WOODS · CHAPTER ${missionIndex + 1}`}
            </span>
          </div>
          <div className="quest-body">
            <span className="skill-tag">
              {gradeLabel(save.grade)} <span>·</span> {skill}
            </span>
            <h1>{practiceSkill ? 'A little practice. A little magic.' : mission.title}</h1>
            <p className="quest-story">
              {practiceSkill
                ? `${save.companion} has five little ${skill} challenges for you. Take your time, try things out, and watch your confidence grow.`
                : mission.story}
            </p>
            <div className="milo-note">
              <Character name={save.companion} outfit={save.clubhouse.equipped.outfit} />
              <p>
                “{discovery.welcome}”<span>— {save.companion}, your adventure buddy</span>
              </p>
            </div>
            <div className="quest-meta">
              <span>
                <Sprout size={17} />5 little challenges
              </span>
              <span>
                <Star size={17} />
                100 XP for finishing!
              </span>
              <button className="intro-sound" onClick={onSoundChange}>
                {save.sound ? <Volume2 size={17} /> : <VolumeX size={17} />}
                {save.sound ? 'Sounds on' : 'Sounds off'}
              </button>
            </div>
            <button
              className="button primary full"
              autoFocus
              onClick={() => {
                if (save.sound) playSound('open');
                setStage('play');
              }}
            >
              {practiceSkill ? 'Let’s practice' : 'Let’s go, adventurer!'}
              <ArrowRight size={20} />
            </button>
          </div>
        </>
      )}
      {stage === 'play' && (
        <div className="play-body">
          <header className="arena-header">
            <div className="arena-title">
              <span className="arena-title-icon">
                <ChapterIcon size={25} aria-hidden="true" />
              </span>
              <div>
                <strong>{practiceSkill ? 'A little practice magic' : mission.short}</strong>
                <span>
                  {gradeLabel(save.grade)} · {skill}
                </span>
              </div>
            </div>
            <div
              className="arena-journey"
              aria-label={`${round + (feedback === 'correct' ? 1 : 0)} of 5 discoveries complete`}
            >
              {[0, 1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className={`journey-gem ${i < round + (feedback === 'correct' ? 1 : 0) ? 'is-restored' : ''} ${i === round ? 'is-now' : ''}`}
                >
                  <Star size={20} fill="currentColor" />
                </span>
              ))}
              <span>Little step {round + 1} of 5</span>
            </div>
            <button
              className="arena-sound"
              onClick={onSoundChange}
              aria-label={save.sound ? 'Turn sound off' : 'Turn sound on'}
            >
              {save.sound ? <Volume2 size={21} /> : <VolumeX size={21} />}
              <span>{save.sound ? 'Sound on' : 'Sound off'}</span>
            </button>
          </header>
          <div
            className={`arena-layout ${handsOn ? `with-hands-on ${skill === 'subtraction' ? 'bridge-arena' : ''}` : ''}`}
          >
            <section
              className={`arena-world ${feedback === 'correct' ? 'world-celebrates' : ''}`}
              aria-label={`Your playable ${theme.name}`}
            >
              <div className="arena-world-heading">
                <div>
                  <span className="arena-world-kicker">
                    <ChapterIcon size={14} aria-hidden="true" />
                    {theme.invitation}
                  </span>
                  <h1>
                    {feedback === 'correct'
                      ? theme.discoveries[round]
                      : practiceSkill
                        ? 'Let curiosity lead the way.'
                        : mission.action}
                  </h1>
                </div>
                <button
                  className="world-equation-pill"
                  onClick={readAloud}
                  aria-label="Hear the playground question"
                >
                  <span>HELP MILO FIND</span>
                  <strong>
                    {problem.equation} ={' '}
                    {feedback === 'correct' ? formatAnswer(problem.answer) : '?'}
                  </strong>
                </button>
              </div>
              <div className="arena-playground">
                <Meadow
                  problem={problem}
                  round={round}
                  solved={feedback === 'correct'}
                  missionIndex={missionIndex}
                  onAnswer={answer}
                  interactive={!handsOn}
                  sound={save.sound}
                />
                {handsOn && (
                  <div className="hands-on-surface">
                    <HandsOn
                      key={round}
                      problem={problem}
                      sound={save.sound}
                      solved={feedback === 'correct'}
                      demonstrate={showMagic}
                      coaching={hint}
                      onAnswer={answer}
                    />
                  </div>
                )}
              </div>
              <div className="arena-world-footer">
                <span>
                  <Heart size={15} />
                  No rush. No lost stars. Every try counts.
                </span>
                <button onClick={onClose}>
                  <MapIcon size={16} />
                  Back to the map
                </button>
              </div>
              {hint && feedback !== 'correct' && (
                <HintCoach
                  key={`${round}-${problem.equation}`}
                  problem={problem}
                  sound={save.sound}
                  bridge={handsOn && skill === 'subtraction'}
                  onClose={() => setHint(false)}
                  onDemonstrate={() => {
                    setShowMagic((n) => n + 1);
                    setMathSupportOpen(true);
                    setHint(false);
                  }}
                />
              )}
              {feedback === 'correct' && (
                <DiscoveryCelebration
                  key={round}
                  skill={skill}
                  companion={save.companion}
                  outfit={save.clubhouse.equipped.outfit}
                  equation={problem.equation}
                  answer={formatAnswer(problem.answer)}
                  helped={supportedAnswer}
                  last={round === 4}
                  handsOn={handsOn}
                  onNext={advance}
                />
              )}
            </section>
            <section className="arena-question" aria-label="Your math discovery">
              <div className="discovery-modes" aria-label="Choose how to play">
                <button
                  aria-pressed={handsOn}
                  onClick={() => {
                    setHandsOn(true);
                    setHint(false);
                  }}
                >
                  <Hand size={17} />
                  Build & discover
                </button>
                <button
                  aria-pressed={!handsOn}
                  onClick={() => {
                    setHandsOn(false);
                    setHint(false);
                  }}
                >
                  <Sprout size={17} />
                  Explore & answer
                </button>
              </div>
              <div className="arena-question-top">
                <span className="question-number">{round + 1}</span>
                <span>A LITTLE THINKING. A LITTLE MAGIC.</span>
              </div>
              <div className="question-label">
                <h2>
                  {problem.denominator
                    ? 'How many pieces altogether?'
                    : skill === 'subtraction'
                      ? handsOn
                        ? 'How many planks are missing?'
                        : 'How many are left?'
                      : skill === 'division'
                        ? 'How many in each group?'
                        : 'How many altogether?'}
                </h2>
                <button
                  className="icon-button read-aloud"
                  aria-label="Read the question aloud"
                  disabled={!save.sound}
                  onClick={readAloud}
                >
                  <Volume2 size={19} />
                </button>
              </div>
              <div
                className={`equation ${feedback === 'correct' ? 'equation-solved' : ''}`}
                aria-label={`${problem.equation} equals what?`}
              >
                {problem.equation}
                <span>=</span>
                <span className="answer-blank">
                  {feedback === 'correct' ? formatAnswer(problem.answer) : '?'}
                </span>
              </div>
              {!handsOn && (
                <>
                  <MathSupport
                    open={mathSupportOpen && feedback !== 'correct'}
                    onOpen={() => setMathSupportOpen(true)}
                    onClose={() => setMathSupportOpen(false)}
                  >
                    <MathGarden
                      key={round}
                      problem={problem}
                      sound={save.sound}
                      demonstrate={showMagic}
                      solved={feedback === 'correct'}
                      onSupport={() => {
                        helped.current = true;
                      }}
                    />
                  </MathSupport>
                  <div className="choose-answer-label">What do you think, adventurer?</div>
                  <div className="answer-options">
                    {problem.choices.map((choice, i) => (
                      <button
                        key={choice}
                        ref={i === 0 ? firstAnswerRef : undefined}
                        className={`answer-option ${selected === choice ? (feedback === 'correct' ? 'correct' : 'incorrect') : ''}`}
                        disabled={feedback === 'correct'}
                        onClick={() => answer(choice)}
                        aria-label={`Answer ${formatAnswer(choice)}`}
                      >
                        <kbd>{i + 1}</kbd>
                        {formatAnswer(choice)}
                        {selected === choice && feedback === 'correct' && (
                          <CheckCircle2 size={21} />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
              {handsOn && (
                <div className="hands-on-guide">
                  <Character
                    name={skill === 'subtraction' ? 'Pip' : save.companion}
                    outfit={save.clubhouse.equipped.outfit}
                  />
                  <h3>
                    {discovery.reviewKey
                      ? 'Let’s give this another go!'
                      : 'Your hands can find the answer.'}
                  </h3>
                  <p>
                    {skill === 'subtraction'
                      ? `The bridge needs ${problem.a} planks. ${problem.b} ${problem.b === 1 ? 'is' : 'are'} here already. How many do you need to add?`
                      : skill === 'division'
                        ? 'Share the berries fairly. Count what’s on one plate when everyone has the same.'
                        : skill === 'multiplication'
                          ? `Give each of the ${problem.a} baskets ${problem.b} berries. Then count them altogether.`
                          : 'Gather both groups, then see what you’ve made together.'}
                  </p>
                  <span>
                    <Hand size={16} />
                    {skill === 'addition' || skill === 'decimals' || skill === 'subtraction'
                      ? 'Tap a piece. Watch it find its place!'
                      : 'Tap an item, then its basket.'}
                  </span>
                  <p>
                    {skill === 'subtraction'
                      ? 'Fill the gaps, then press “Let Pip cross!”.'
                      : skill === 'addition' || skill === 'decimals'
                        ? 'Press “Check my picnic” when you’re ready.'
                        : 'Press “Check my discovery” when you’re ready.'}
                  </p>
                </div>
              )}
              <div className="feedback-area" aria-live="polite">
                {feedback === 'correct' ? (
                  <div className="positive-feedback">
                    <CheckCircle2 size={20} />
                    <span>
                      {supportedAnswer
                        ? 'You tried again and figured it out. Amazing!'
                        : 'That’s it! You found the magic.'}
                    </span>
                  </div>
                ) : feedback === 'retry' ? (
                  <div className="retry-feedback">
                    <Heart size={20} />
                    <span>A brave try! Milo’s here. Let’s figure it out.</span>
                  </div>
                ) : (
                  <span className="quiet-feedback">
                    {handsOn
                      ? 'Build it, check it, and see what happens.'
                      : 'Try an answer. We’ll figure it out together.'}
                  </span>
                )}
              </div>
              <div className="play-actions">
                {feedback !== 'correct' ? (
                  <button
                    className="button subtle milo-help-button"
                    onClick={() => {
                      setHint((v) => !v);
                      helped.current = true;
                      if (save.sound) playSound('berry');
                    }}
                  >
                    <Character />
                    <span>{hint ? 'Milo is helping!' : 'Milo, a little help?'}</span>
                    <Heart size={17} />
                  </button>
                ) : (
                  <button className="button primary" ref={actionRef} onClick={advance}>
                    {round === 4 ? 'See my rewards' : 'Keep going'}
                    <ArrowRight size={20} />
                  </button>
                )}
              </div>
              {save.grade > 1 && (
                <details className="scratchpad-disclosure">
                  <summary>My thinking space</summary>
                  <label>
                    Try your ideas here
                    <textarea
                      aria-label="My scratchpad"
                      value={scratch}
                      onChange={(e) => setScratch(e.target.value)}
                      placeholder="Your thinking belongs here…"
                    />
                  </label>
                </details>
              )}
            </section>
          </div>
        </div>
      )}
      {stage === 'reward' && (
        <div className="reward-arena">
          <Celebration />
          <div className="reward-sunburst" />
          <div className="reward-body">
            <span className="completion-ribbon">
              <Heart size={17} fill="currentColor" />
              YOU TRIED. YOU LEARNED. YOU DID IT!
            </span>
            <div className="reward-burst">
              <Character name={save.companion} outfit={save.clubhouse.equipped.outfit} />
              <Sparkles className="reward-spark a" size={36} />
              <Sparkles className="reward-spark b" size={26} />
              <Star className="reward-spark c" size={30} />
            </div>
            <Stars count={3} size={52} />
            <h1>
              {practiceSkill ? (
                <>
                  Your brain just
                  <br />
                  grew a little magic!
                </>
              ) : (
                <>
                  You’re a little
                  <br />
                  <span>woodland hero!</span>
                </>
              )}
            </h1>
            <p>
              {practiceSkill
                ? 'You explored five challenges and kept going. That’s something to be proud of!'
                : missionIndex === 4
                  ? 'The wishing tree is awake! You’ve restored Whispering Woods. The whole forest is celebrating YOU.'
                  : `You did it! ${missionIndex === 0 ? 'The moonberries are glowing again.' : missionIndex === 1 ? 'Pip can cross the stream again.' : missionIndex === 2 ? 'There’s a picnic for every forest friend.' : 'Every little firefly has its light back.'}`}
            </p>
            <div className="reward-totals">
              <span>
                <Star size={27} fill="currentColor" />
                <strong>+{xp}</strong> XP
              </span>
              <span>
                <Gem size={27} />
                <strong>+15</strong> gems
              </span>
            </div>
            {!practiceSkill && (
              <div className="keepsake">
                <span className="keepsake-gift">
                  <span className="gift-lid" />
                  <span className="gift-box">
                    <Star size={19} fill="currentColor" />
                  </span>
                </span>
                <div>
                  <strong>{mission.reward}</strong>
                  <span>A little keepsake for a big achievement!</span>
                </div>
                <CheckCircle2 size={23} />
              </div>
            )}
            <button autoFocus className="button primary full reward-continue" onClick={onContinue}>
              {practiceSkill
                ? 'More math magic!'
                : missionIndex < 4
                  ? 'My next adventure!'
                  : 'Back to my woodland'}
              <ArrowRight size={23} />
            </button>
            <button className="button secondary full reward-clubhouse" onClick={onClubhouse}>
              <Home size={20} />
              Decorate my clubhouse
              <Gem size={18} />
            </button>
            <button className="button subtle reward-back" onClick={onClose}>
              <MapIcon size={17} />
              Back to my adventure
            </button>
            <p className="celebration-note">
              <Heart size={14} />
              Help, hints, and brave tries all count. These stars are yours.
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
}
