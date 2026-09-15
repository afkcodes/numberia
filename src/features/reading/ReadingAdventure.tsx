import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Feather,
  Gem,
  Heart,
  RotateCcw,
  Sparkles,
  Star,
  Volume2,
  Wind,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { playSound, stopSpeaking } from '../../audio';
import { dateKey, type Save } from '../../game';
import {
  bandForGrade,
  editions,
  remixes,
  storyTitle,
  type ReadingBand,
  type StoryAction,
} from '../../reading/content';
import { readingKey, type ReadingCompletion } from '../../reading/progress';
import { useStoryAudio } from '../../reading/audio/useStoryAudio';
import StoryReader from './StoryReader';
import StoryStage from './StoryStage';
import WordBuilder from './WordBuilder';
import { shuffleChoices } from '../../reading/choices';

const clueChoices = [
  { id: 'fan', label: 'A fan', Icon: Wind },
  { id: 'ribbon', label: 'A ribbon', Icon: null },
  { id: 'feather', label: 'A feather', Icon: Feather },
];

type Phase = 'cover' | 'build' | 'read' | 'clue' | 'remix' | 'reward';
type Props = {
  save: Save;
  onSound: () => void;
  onComplete: (completion: ReadingCompletion) => void;
  onBookmark: (band: ReadingBand, page: number) => void;
  onBackpack: () => void;
};

function RemixReader({
  sound,
  onTry,
  onDone,
  busy,
  initial,
}: {
  sound: boolean;
  onTry: (action: StoryAction) => void;
  onDone: (word: string) => void;
  busy: boolean;
  initial: string;
}) {
  const [choice, setChoice] = useState(remixes.find((r) => r.word === initial) ?? remixes[0]);
  const [tried, setTried] = useState<string[]>([]);
  const audio = useStoryAudio(choice.id, choice.text, sound);
  return (
    <div className="sw-remix sw-panel-content">
      <span className="sw-small-label">
        <Feather size={17} /> Your storyteller moment
      </span>
      <h2>
        What happens next?
        <br />
        You’re the author.
      </h2>
      <p>Change one word. Give Pip a new ending.</p>
      <p className="sw-remix-sentence">
        Pip <strong>{choice.word}</strong> in his red hat.
      </p>
      <div className="sw-remix-choices" aria-label="Choose your story word">
        {remixes.map((remix) => (
          <button
            key={remix.word}
            aria-pressed={choice.word === remix.word}
            disabled={busy}
            onClick={() => {
              audio.stop();
              setChoice(remix);
            }}
          >
            <span>{remix.word}</span>
            <small>{remix.label}</small>
          </button>
        ))}
      </div>
      <div className="sw-reader-actions">
        <button className="sw-soft-button" disabled={!sound || busy} onClick={() => audio.play()}>
          <Volume2 size={18} /> Hear my line
        </button>
        <button
          className="sw-primary"
          disabled={busy}
          onClick={() => {
            audio.stop();
            setTried([...new Set([...tried, choice.word])]);
            onTry(choice.action);
          }}
        >
          {busy ? 'Pip is on it!' : 'Try my word'}
          <Sparkles size={18} />
        </button>
      </div>
      <div className="sw-remix-finish">
        <span>
          {tried.includes(choice.word)
            ? 'Love this ending? Keep it in your backpack.'
            : 'Make Pip act out your word first.'}
        </span>
        <button
          className="sw-soft-button"
          disabled={busy || !tried.includes(choice.word)}
          onClick={() => {
            audio.stop();
            onDone(choice.word);
          }}
        >
          Keep my story <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

export default function ReadingAdventure({
  save,
  onSound,
  onComplete,
  onBookmark,
  onBackpack,
}: Props) {
  const [phase, setPhase] = useState<Phase>('cover');
  const [band, setBand] = useState<ReadingBand>(() => bandForGrade(save.grade));
  const [page, setPage] = useState(0);
  const [acted, setActed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [take, setTake] = useState(0);
  const [action, setAction] = useState<StoryAction>('wind');
  const [clue, setClue] = useState<string | null>(null);
  const [clueOrder, setClueOrder] = useState(() => shuffleChoices(clueChoices));
  const [ending, setEnding] = useState('hops');
  const [firstReward, setFirstReward] = useState(false);
  const supported = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const heading = useRef<HTMLElement | null>(null);
  const stage = useRef<HTMLDivElement | null>(null);
  const edition = editions[band];
  const completed = save.reading.completed.find((r) => r.key === readingKey(band));
  const bookmark = save.reading.bookmarks[band] ?? 0;
  const nextEnding = remixes.find((remix) => !save.reading.endings.includes(remix.word));
  useEffect(
    () => () => {
      clearTimeout(timer.current);
      stopSpeaking();
    },
    [],
  );
  useEffect(() => {
    if (phase !== 'cover') {
      heading.current?.focus({ preventScroll: true });
      if (window.matchMedia('(max-width: 1000px)').matches)
        heading.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
  }, [phase, page]);
  useEffect(() => {
    if ((!busy && !acted) || !window.matchMedia('(max-width: 1000px)').matches) return;
    // Measure after the reader's new button/text state has committed.
    stage.current?.scrollIntoView({
      block: 'start',
      behavior:
        busy && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'smooth'
          : 'instant',
    });
    if (acted)
      stage.current
        ?.querySelector<HTMLButtonElement>('.sw-stage-next')
        ?.focus({ preventScroll: true });
  }, [busy, acted]);
  const enter = (next: Phase) => {
    stopSpeaking();
    clearTimeout(timer.current);
    setBusy(false);
    setActed(false);
    setPhase(next);
    if (next === 'cover') window.scrollTo({ top: 0, behavior: 'instant' });
  };
  const perform = (next: StoryAction) => {
    clearTimeout(timer.current);
    setAction(next);
    setTake((t) => t + 1);
    setBusy(true);
    setActed(false);
    if (save.sound) playSound('chime');
    timer.current = setTimeout(
      () => {
        setBusy(false);
        setActed(true);
      },
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 250 : 2600,
    );
  };
  const startReading = (resume = false) => {
    setClueOrder(shuffleChoices(clueChoices));
    setPage(resume ? bookmark : 0);
    setClue(null);
    supported.current = false;
    enter(resume ? 'read' : 'build');
  };
  const nextPage = () => {
    if (page === edition.pages.length - 1) enter('clue');
    else {
      setActed(false);
      setPage(page + 1);
      onBookmark(band, page + 1);
    }
  };
  const finish = (word: string) => {
    setEnding(word);
    setFirstReward(!completed);
    onComplete({
      key: readingKey(band),
      band,
      date: dateKey(),
      remix: word,
      supported: supported.current,
    });
    enter('reward');
    if (save.sound) playSound('celebrate');
  };
  const scene =
    phase === 'read'
      ? edition.pages[page].action
      : phase === 'clue' || phase === 'reward' || phase === 'remix'
        ? 'home'
        : 'cover';
  const storyScene =
    phase === 'remix' && (action === 'spin' || action === 'tiptoe') ? action : scene;
  return (
    <section
      className={`storywild sw-phase-${phase} sw-band-${band}`}
      aria-label="Storywild reading adventure"
    >
      <header className="sw-heading">
        <div className="sw-brand">
          <BookOpen size={24} />
          <h1>
            Storywild<span>Small words. Wild adventures.</span>
          </h1>
        </div>
        <button
          className="sw-back"
          onClick={() => {
            if (phase === 'cover') onBackpack();
            else enter('cover');
          }}
        >
          {phase === 'cover' ? <Feather size={18} /> : <ArrowLeft size={18} />}
          {phase === 'cover' ? 'My keepsakes' : 'Close story'}
        </button>
      </header>
      <div className="sw-theatre">
        <StoryStage
          stageRef={stage}
          onContinue={
            !acted || busy
              ? undefined
              : phase === 'read'
                ? nextPage
                : phase === 'clue'
                  ? () => enter('remix')
                  : phase === 'remix'
                    ? () => {
                        heading.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
                        heading.current?.focus({ preventScroll: true });
                      }
                    : undefined
          }
          continueLabel={
            phase === 'read'
              ? page === 3
                ? 'Find the story clue'
                : 'Next story page'
              : phase === 'clue'
                ? 'Write my ending'
                : 'Back to my words'
          }
          scene={storyScene}
          action={phase === 'read' ? edition.pages[page].action : action}
          performing={busy}
          finished={acted || phase === 'reward'}
          take={take}
          sound={save.sound}
        />
        <article
          className="sw-story-panel"
          ref={heading}
          tabIndex={-1}
          aria-label={
            phase === 'read'
              ? `Page ${page + 1}: ${edition.pages[page].title}`
              : 'Your reading adventure'
          }
        >
          {phase === 'cover' ? (
            <div className="sw-cover sw-panel-content">
              <span className="sw-small-label">
                <Sparkles size={16} /> A story you bring to life
              </span>
              <h2>
                The hat that
                <br />
                wouldn’t <em>stay put.</em>
              </h2>
              <p>
                {save.reading.endings.length ? (
                  <>
                    <strong>Lumi has a little idea for you.</strong>
                    <br />
                    {nextEnding
                      ? `What if Pip ${nextEnding.word}? Reread his adventure and collect a new ending.`
                      : 'Try telling Pip’s adventure in a funny character voice. Which page is your favorite?'}
                  </>
                ) : (
                  <>
                    A windy day. A runaway hat. And one little dragon who needs <strong>you</strong>{' '}
                    to turn the page.
                  </>
                )}
              </p>
              <div className="sw-how">
                <span>
                  <BookOpen size={18} /> Read it
                </span>
                <i />{' '}
                <span>
                  <Sparkles size={18} /> Make it happen
                </span>
                <i />
                <span>
                  <Feather size={18} /> Make it yours
                </span>
              </div>
              <fieldset className="sw-bands">
                <legend>Find your comfy reading size</legend>
                {(Object.keys(editions) as ReadingBand[]).map((key, i) => (
                  <button key={key} aria-pressed={key === band} onClick={() => setBand(key)}>
                    <span className="sw-band-symbol">
                      {Array.from({ length: i + 1 }, (_, j) => (
                        <span key={j} />
                      ))}
                    </span>
                    <strong>{editions[key].label}</strong>
                    <small>{editions[key].skill}</small>
                    {key === band && <Check size={17} />}
                  </button>
                ))}
              </fieldset>
              <button className="sw-primary sw-start" onClick={() => startReading()}>
                {completed ? 'Read & remix again' : 'Let’s open the story'} <ArrowRight size={21} />
              </button>
              {bookmark > 0 && (
                <button className="sw-resume" onClick={() => startReading(true)}>
                  Your bookmark is on page {bookmark + 1}. Pick up there <ArrowRight size={15} />
                </button>
              )}
              {completed && (
                <p className="sw-saved-ending">
                  <Check size={16} /> Your ending: Pip {completed.remix} in his red hat.
                </p>
              )}
            </div>
          ) : phase === 'build' ? (
            <WordBuilder
              key={band}
              edition={edition}
              sound={save.sound}
              onHelp={() => {
                supported.current = true;
              }}
              onDone={() => {
                onBookmark(band, 0);
                enter('read');
              }}
            />
          ) : phase === 'read' ? (
            <StoryReader
              key={`${band}-${page}`}
              page={edition.pages[page]}
              sound={save.sound}
              onSound={onSound}
              onAct={() => perform(edition.pages[page].action)}
              acted={acted}
              busy={busy}
              onNext={nextPage}
              last={page === edition.pages.length - 1}
              onHelp={() => {
                supported.current = true;
              }}
            />
          ) : phase === 'clue' ? (
            <div className="sw-clue sw-panel-content">
              <span className="sw-small-label">
                <Heart size={17} /> You noticed the important bit
              </span>
              <h2>{band === 'soar' ? 'Solve the cause, like Pip.' : 'A windy-day fix.'}</h2>
              <p>
                {band === 'sprout'
                  ? 'What helped Pip’s hat stay on? Tap the thing that helped.'
                  : 'The wind still blows. What changed so Pip could keep his hat on?'}
              </p>
              <div className="sw-clue-choices">
                {clueOrder.map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    aria-pressed={clue === id}
                    onClick={() => {
                      setClue(id);
                      if (id !== 'ribbon') supported.current = true;
                      if (id === 'ribbon') perform('home');
                    }}
                    disabled={clue === 'ribbon'}
                  >
                    {Icon ? (
                      <Icon size={36} />
                    ) : (
                      <span className="sw-ribbon-icon" aria-hidden="true">
                        ୨୧
                      </span>
                    )}
                    <strong>{label}</strong>
                  </button>
                ))}
              </div>
              <p className="sw-feedback" role="status">
                {clue === 'ribbon'
                  ? 'Yes! The ribbon holds the hat under Pip’s chin. The wind can blow, and the hat stays on.'
                  : clue === 'fan'
                    ? 'A fan makes more wind! What could hold the hat in place?'
                    : clue === 'feather'
                      ? 'A feather is light and floats away. Look for something Pip can tie.'
                      : 'Look at Pip. There’s a little clue under his chin.'}
              </p>
              {clue && clue !== 'ribbon' && (
                <button
                  className="sw-soft-button"
                  onClick={() => {
                    setPage(3);
                    enter('read');
                  }}
                >
                  Look at the last page <BookOpen size={18} />
                </button>
              )}
              <button
                className="sw-primary"
                disabled={clue !== 'ribbon' || busy}
                onClick={() => enter('remix')}
              >
                Now, make it your story <Feather size={18} />
              </button>
            </div>
          ) : phase === 'remix' ? (
            <RemixReader
              sound={save.sound}
              onTry={perform}
              onDone={finish}
              busy={busy}
              initial={completed?.remix ?? 'hops'}
            />
          ) : (
            <div className="sw-reward sw-panel-content">
              <div className="sw-keepsake">
                <Star size={26} fill="currentColor" />
                <span className="sw-keepsake-hat" aria-hidden="true" />
                <span>Story maker</span>
              </div>
              <span className="sw-small-label">A whole story. Brought to life by you.</span>
              <h2>
                Take a bow,
                <br />
                storyteller!
              </h2>
              <p>You read Pip’s adventure, found his clever fix, and made an ending of your own.</p>
              <blockquote>
                “Pip <strong>{ending}</strong> in his red hat.”
              </blockquote>
              {firstReward ? (
                <div className="sw-rewards">
                  <span>
                    <Star size={19} /> 100 XP
                  </span>
                  <span>
                    <Gem size={19} /> 15 gems
                  </span>
                  <span>
                    <Check size={19} /> Hat keepsake
                  </span>
                </div>
              ) : (
                <p className="sw-saved-ending">
                  <Check size={18} /> Story passport: {save.reading.endings.length} of 3 endings
                  collected.
                </p>
              )}
              <button className="sw-primary" onClick={onBackpack}>
                See my keepsake <ArrowRight size={18} />
              </button>
              <button className="sw-soft-button" onClick={() => startReading()}>
                <RotateCcw size={17} /> Read it a new way
              </button>
            </div>
          )}
        </article>
      </div>
      <footer className="sw-footer">
        <span>
          <Heart size={16} /> Read, listen, try. Every way counts.
        </span>
        {phase === 'read' ? (
          <div className="sw-pages" aria-label={`Page ${page + 1} of 4`}>
            {edition.pages.map((p, i) => (
              <span key={p.id} className={i <= page ? 'visited' : ''}>
                {i < page ? <Check size={13} /> : i + 1}
              </span>
            ))}
          </div>
        ) : (
          <span>
            {phase === 'cover'
              ? 'A little reading. A lot of imagination.'
              : phase === 'reward'
                ? 'Your story belongs to you.'
                : storyTitle}
          </span>
        )}
      </footer>
    </section>
  );
}
