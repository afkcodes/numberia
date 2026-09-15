import { ArrowRight, Ear, Heart, Mic, Pause, Play, Snail, Square, Volume2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Modal } from '../../components';
import { stopSpeaking } from '../../audio';
import { normalWord, wordHelp, wordsIn, type StoryPage } from '../../reading/content';
import { useStoryAudio } from '../../reading/audio/useStoryAudio';
import { listenToReading, type ListenState } from '../../reading/audio/listener';
import { matchReading } from '../../reading/matching';

export default function StoryReader({
  page,
  sound,
  onSound,
  onAct,
  acted,
  busy,
  onNext,
  last,
  onHelp,
}: {
  page: StoryPage;
  sound: boolean;
  onSound: () => void;
  onAct: () => void;
  acted: boolean;
  busy: boolean;
  onNext: () => void;
  last: boolean;
  onHelp: () => void;
}) {
  const audio = useStoryAudio(page.id, page.text, sound);
  const [help, setHelp] = useState<number | null>(null);
  const [consent, setConsent] = useState(false);
  const [listening, setListening] = useState<ListenState | 'idle'>('idle');
  const [transcript, setTranscript] = useState('');
  const listener = useRef<ReturnType<typeof listenToReading> | null>(null);
  const words = wordsIn(page.text);
  const match = matchReading(page.text, transcript);
  const active = audio.status === 'playing' || audio.status === 'loading';
  const microphone = ['connecting', 'listening', 'processing'].includes(listening);
  useEffect(
    () => () => {
      listener.current?.stop();
      stopSpeaking();
    },
    [],
  );
  const stopListening = () => {
    listener.current?.stop();
    listener.current = null;
    setListening('idle');
  };
  const startListening = () => {
    setConsent(false);
    audio.stop();
    stopSpeaking();
    setTranscript('');
    listener.current?.stop();
    listener.current = listenToReading((text) => setTranscript(text), setListening);
  };
  const hear = () => {
    stopListening();
    onHelp();
    if (!sound) {
      onSound();
      audio.play(undefined, true);
    } else if (active) audio.pause();
    else audio.play();
  };
  return (
    <div className="sw-reader">
      <div className="sw-reader-kicker">
        <span>
          <Ear size={16} /> Your words make it happen
        </span>
        <button className="sw-pace" aria-pressed={audio.rate === 0.75} onClick={audio.toggleRate}>
          <Snail size={18} /> {audio.rate === 0.75 ? 'Extra gentle' : 'Gentle pace'}
        </button>
      </div>
      <h2>{page.title}</h2>
      <p className="sw-passage" aria-label={page.text}>
        {words.map((word, index) => (
          <span key={index}>
            <button
              className={`sw-word ${audio.word === index ? 'speaking' : ''} ${match.matched.includes(index) ? 'heard' : ''} ${microphone && match.matched.at(-1) === index ? 'following' : ''}`}
              aria-current={audio.word === index ? 'true' : undefined}
              onClick={() => {
                audio.pause();
                stopListening();
                setHelp(index);
                onHelp();
              }}
              aria-label={`Help with ${word.replace(/[.!?,;]$/g, '')}`}
            >
              {word}
            </button>{' '}
          </span>
        ))}
      </p>
      <div className="sw-reader-note" role="status">
        {listening === 'connecting' ? (
          'Lumi is getting ready to listen…'
        ) : listening === 'listening' ? (
          'Lumi is listening. Take your time.'
        ) : listening === 'processing' ? (
          'Finding your place…'
        ) : listening === 'unavailable' ? (
          'Lumi couldn’t hear that. You can keep reading and tap Make it happen.'
        ) : match.complete ? (
          'Lumi followed your whole line. Lovely reading!'
        ) : audio.status === 'unavailable' ? (
          'The recording isn’t ready. Read at your own pace, or tap a word for help.'
        ) : (
          <>
            <Heart size={16} /> {page.aside}
          </>
        )}
      </div>
      <div className="sw-reading-tools">
        <button
          className="sw-soft-button"
          onClick={hear}
          aria-label={
            !sound ? 'Turn on narration sound' : active ? 'Pause narration' : 'Hear this page'
          }
        >
          {active ? <Pause size={18} /> : <Volume2 size={18} />}
          {!sound
            ? 'Sound on'
            : active
              ? 'Pause'
              : audio.status === 'paused'
                ? 'Keep listening'
                : 'Hear it'}
        </button>
        <button
          className={`sw-soft-button ${microphone ? 'is-listening' : ''}`}
          disabled={listening === 'processing'}
          onClick={() => {
            if (listening === 'connecting') stopListening();
            else if (listening === 'listening') listener.current?.finish();
            else {
              audio.stop();
              stopSpeaking();
              setConsent(true);
            }
          }}
        >
          {microphone ? <Square size={16} /> : <Mic size={18} />}
          {listening === 'connecting' ? 'Cancel' : microphone ? 'I’m done' : 'Read to Lumi'}
        </button>
      </div>
      <div className="sw-reader-bottom">
        <span>Tap any word for a little help.</span>
        <button
          className="sw-primary"
          disabled={busy}
          onClick={() => {
            audio.stop();
            stopListening();
            stopSpeaking();
            if (acted) onNext();
            else onAct();
          }}
        >
          {busy
            ? 'Watch your words!'
            : acted
              ? last
                ? 'One last little clue'
                : 'Turn the page'
              : 'Make it happen'}
          {acted ? <ArrowRight size={20} /> : <Play size={18} fill="currentColor" />}
        </button>
      </div>
      {help !== null && (
        <Modal
          title={`A little help with ${words[help]}`}
          onClose={() => {
            setHelp(null);
            stopSpeaking();
          }}
          className="sw-word-dialog"
        >
          <span className="sw-small-label">Lumi’s word light</span>
          <h2>{words[help]}</h2>
          <p>
            {wordHelp[normalWord(words[help])] ??
              'Hear this word in its sentence. Then give it a try in your own voice.'}
          </p>
          <button
            className="sw-primary"
            disabled={!sound || !audio.timed}
            onClick={() => {
              setHelp(null);
              audio.play(help);
            }}
          >
            Hear it in the story <Volume2 size={18} />
          </button>
        </Modal>
      )}
      {consent && (
        <Modal title="Read with Lumi" onClose={() => setConsent(false)} className="sw-word-dialog">
          <Mic size={36} />
          <h2>Your turn to read.</h2>
          <p>
            Lumi can follow your words. Your microphone audio goes to Nari’s speech service to find
            your place. This app does not save recordings.
          </p>
          <p>You can also read without a microphone. Every way counts.</p>
          <button className="sw-primary" onClick={startListening}>
            Start listening <Mic size={18} />
          </button>
          <button className="sw-soft-button" onClick={() => setConsent(false)}>
            Read without a mic
          </button>
        </Modal>
      )}
    </div>
  );
}
