import { ArrowRight, Check, Sparkles, Volume2 } from 'lucide-react';
import { useState } from 'react';
import type { StoryEdition } from '../../reading/content';
import { speak } from '../../audio';
import { shuffleChoices } from '../../reading/choices';

export default function WordBuilder({
  edition,
  sound,
  onDone,
  onHelp,
}: {
  edition: StoryEdition;
  sound: boolean;
  onDone: () => void;
  onHelp: () => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const target = edition.build;
  const [choices] = useState(() => shuffleChoices(target.choices));
  const correct = picked === target.parts[target.missing];
  return (
    <div className="sw-builder">
      <span className="sw-small-label">
        <Sparkles size={16} /> A word for your adventure
      </span>
      <h2>
        Little letters.
        <br />
        Big possibilities.
      </h2>
      <p>{target.clue}</p>
      <div
        className={`sw-letter-slots ${correct ? 'is-built' : ''}`}
        aria-label={`Build ${target.word}`}
      >
        {target.parts.map((part, i) => (
          <span key={i} className={i === target.missing ? 'missing' : ''}>
            {i === target.missing ? (correct ? picked : '?') : part}
          </span>
        ))}
      </div>
      <div className="sw-letter-tray" aria-label="Choose the missing word part">
        {choices.map((choice) => (
          <button
            key={choice}
            className={`sw-letter ${correct && choice === picked ? 'chosen' : ''}`}
            onClick={() => {
              setPicked(choice);
              if (choice !== target.parts[target.missing]) onHelp();
              if (sound && choice === target.parts[target.missing])
                void speak(`${target.word}. ${target.explanation}`);
            }}
            disabled={correct}
            aria-label={`Add ${choice}`}
          >
            {choice}
          </button>
        ))}
      </div>
      <p className="sw-feedback" role="status">
        {correct ? (
          <>
            <Check size={18} /> {target.explanation}
          </>
        ) : picked ? (
          'A good try! Look at the word clue. Try another piece.'
        ) : (
          'Tap a piece to fill the little gap.'
        )}
      </p>
      <div className="sw-reader-actions">
        <button
          className="sw-soft-button"
          disabled={!sound}
          onClick={() => {
            onHelp();
            void speak(`${target.word}. ${target.clue}`);
          }}
        >
          <Volume2 size={18} /> Hear the clue
        </button>
        <button className="sw-primary" disabled={!correct} onClick={onDone}>
          Into the story <ArrowRight size={19} />
        </button>
      </div>
    </div>
  );
}
