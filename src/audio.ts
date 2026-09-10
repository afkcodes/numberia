import { SpeechQueue, speechParts } from './speechQueue';

let context: AudioContext | null = null;

/** Use the original device voice for counting, questions, and Milo's guidance. */
function browserSpeak(text: string, signal: AbortSignal): Promise<void> {
  if (!('speechSynthesis' in window) || signal.aborted) return Promise.resolve();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US'; utterance.rate = 0.96; utterance.pitch = 1;
  const quality = (voice: SpeechSynthesisVoice) =>
    (/natural|neural|enhanced|premium/i.test(voice.name) ? 100 : 0)
    + (/google.*english|samantha|ava|karen|aria|jenny|jane/i.test(voice.name) ? 65 : 0)
    + (/en[-_]US/i.test(voice.lang) ? 12 : 0)
    + (voice.default ? 3 : 0)
    - (/espeak|mbrola|eloquence/i.test(voice.name) ? 50 : 0);
  const english = speechSynthesis.getVoices().filter(v => /^en[-_]/i.test(v.lang)).sort((a,b) => quality(b)-quality(a))[0];
  if (english) { utterance.voice = english; utterance.lang = english.lang; }
  return new Promise(resolve => {
    const finish = () => { clearTimeout(timeout); signal.removeEventListener('abort', stop); utterance.onend = null; utterance.onerror = null; resolve(); };
    const stop = () => { speechSynthesis.cancel(); finish(); };
    // Some devices expose speechSynthesis without an installed speech engine.
    const timeout = setTimeout(stop, Math.max(4000, text.length * 100));
    utterance.onend = finish; utterance.onerror = finish;
    signal.addEventListener('abort', stop, { once: true });
    try { speechSynthesis.speak(utterance); } catch { finish(); }
  });
}

const narration = new SpeechQueue(browserSpeak);

/** Every count finishes before the next; a new hint replaces stale narration. */
export function speak(text: string, interrupt = true): Promise<void> {
  let finished = Promise.resolve();
  speechParts(text).forEach((part, index) => { finished = narration.say(part, index === 0 && interrupt); });
  return finished;
}
export function stopSpeaking() {
  narration.stop();
  if ('speechSynthesis' in window) speechSynthesis.cancel();
}
export type Sound = 'tap' | 'plank' | 'berry' | 'correct' | 'try' | 'open' | 'celebrate';

/** Short, synthesized sounds. No downloads, autoplay, or background music. */
export function playSound(kind: Sound, step = 0) {
  try {
    context ??= new AudioContext();
    if (context.state === 'suspended') void context.resume();
    const notes = kind === 'celebrate' ? [523, 659, 784, 1047, 784, 1047, 1319]
      : kind === 'plank' ? [260, 180]
      : kind === 'correct' ? [523, 659, 784, 1047]
      : kind === 'open' ? [392, 523, 659]
      : kind === 'try' ? [440, 349]
      : kind === 'berry' ? [392 * 2 ** ((step % 12) / 12)] : [610];
    const now = context.currentTime;
    notes.forEach((note, i) => {
      const oscillator = context!.createOscillator(); const gain = context!.createGain();
      oscillator.connect(gain); gain.connect(context!.destination);
      oscillator.type = kind === 'tap' ? 'sine' : 'triangle'; oscillator.frequency.value = note;
      const start = now + i * (kind === 'celebrate' ? 0.15 : 0.095);
      const duration = kind === 'plank' ? .08 : kind === 'tap' ? 0.055 : kind === 'berry' ? 0.14 : 0.25;
      gain.gain.setValueAtTime(0, start); gain.gain.linearRampToValueAtTime(kind === 'tap' ? 0.035 : 0.07, start + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      oscillator.frequency.exponentialRampToValueAtTime(note * (kind === 'berry' ? 1.12 : 0.98), start + duration);
      oscillator.start(start); oscillator.stop(start + duration + 0.02);
    });
  } catch { /* Visual feedback always works if a device cannot play sound. */ }
}
