import { useCallback, useEffect, useRef, useState } from 'react';
import { holdNarrationFocus, stopSpeaking } from '../../audio';

type TimedClip = { text: string; words: { word: string; start: number; end: number }[] };
let timingRequest: Promise<Record<string, TimedClip>> | undefined;
function loadTimings() {
  return (timingRequest ??= fetch('/reading/audio/timings.json')
    .then((r) => {
      if (!r.ok) throw new Error('Timings unavailable');
      return r.json();
    })
    .catch(() => {
      timingRequest = undefined;
      return {};
    }));
}
export function useStoryAudio(id: string, text: string, sound: boolean) {
  const [status, setStatus] = useState<'idle' | 'playing' | 'paused' | 'loading' | 'unavailable'>(
    'idle',
  );
  const [word, setWord] = useState(-1);
  const [rate, setRate] = useState(0.9);
  const [timed, setTimed] = useState(false);
  const player = useRef<HTMLAudioElement | null>(null);
  const clip = useRef<TimedClip | undefined>(undefined);
  const release = useRef<(() => void) | undefined>(undefined);
  const request = useRef(0);
  const stop = useCallback(() => {
    request.current++;
    player.current?.pause();
    if (player.current) player.current.currentTime = 0;
    release.current?.();
    release.current = undefined;
    setWord(-1);
    setStatus('idle');
  }, []);
  useEffect(() => {
    let disposed = false,
      frame = 0;
    const audio = new Audio(`/reading/audio/${id}.wav`);
    audio.preload = 'auto';
    player.current = audio;
    clip.current = undefined;
    void loadTimings().then((data) => {
      if (!disposed) {
        clip.current = data[id]?.text === text ? data[id] : undefined;
        setTimed(Boolean(clip.current));
      }
    });
    const tick = () => {
      if (disposed) return;
      if (audio.ended) {
        setWord(-1);
        return;
      }
      // Hold the current word through natural pauses instead of flashing between syllables.
      let active = -1;
      clip.current?.words.forEach((w, index) => {
        if (audio.currentTime >= w.start) active = index;
      });
      setWord(active);
      if (!audio.paused) frame = requestAnimationFrame(tick);
    };
    audio.onplay = () => {
      if (audio.paused) return;
      setStatus('playing');
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(tick);
    };
    audio.onended = () => {
      release.current?.();
      release.current = undefined;
      setStatus('idle');
      setWord(-1);
    };
    audio.onerror = () => {
      release.current?.();
      release.current = undefined;
      setStatus('unavailable');
      setWord(-1);
    };
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      audio.pause();
      audio.onplay = null;
      audio.onended = null;
      audio.onerror = null;
      audio.removeAttribute('src');
      audio.load();
      release.current?.();
      release.current = undefined;
      player.current = null;
    };
  }, [id, text]);
  // Synchronize the shared mute setting with the external audio player and its UI state.
  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    if (!sound) stop();
  }, [sound, stop]);
  const play = (at?: number, enableSound = sound) => {
    const audio = player.current;
    if (!audio || !enableSound) return;
    const current = ++request.current;
    stopSpeaking();
    release.current?.();
    release.current = holdNarrationFocus();
    if (at !== undefined && clip.current?.words[at])
      audio.currentTime = clip.current.words[at].start;
    audio.playbackRate = rate;
    setStatus('loading');
    void audio.play().catch(() => {
      if (current === request.current && player.current === audio) {
        release.current?.();
        release.current = undefined;
        setStatus('unavailable');
      }
    });
  };
  return {
    status,
    word,
    rate,
    timed,
    stop,
    play,
    pause: () => {
      request.current++;
      player.current?.pause();
      release.current?.();
      release.current = undefined;
      setStatus('paused');
    },
    toggleRate: () => {
      const next = rate === 0.9 ? 0.75 : 0.9;
      setRate(next);
      if (player.current) player.current.playbackRate = next;
    },
  };
}
