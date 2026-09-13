import { speechParts } from '../speechQueue.ts';
import { PcmDecoder, PcmPlayback, PCM_SAMPLE_RATE } from './pcm.ts';
import { spokenText } from './text.ts';

/** Quick counting stays on the original device voice, with no network round trip. */
export function isCounting(text: string) {
  return /^\d+(?:\.\d+)?(?: over \d+)?(?: pieces| in (?:this (?:plate|basket)|each group)| packed altogether)?[.!?]?$/i.test(
    text.trim(),
  );
}

/** Keep a whole hint together instead of spending one API request per sentence. */
export function narrationParts(text: string) {
  const parts: string[] = [];
  for (const sentence of speechParts(text)) {
    const part = isCounting(sentence) ? sentence : spokenText(sentence);
    const previous = parts.at(-1);
    if (
      previous &&
      !isCounting(previous) &&
      !isCounting(part) &&
      previous.length + part.length < 600
    ) {
      parts[parts.length - 1] = `${previous} ${part}`;
    } else parts.push(part);
  }
  return parts;
}

type Options = {
  browserSpeak: (text: string, signal: AbortSignal) => Promise<void>;
  getContext: () => AudioContext;
  fetch?: typeof fetch;
  firstAudioMs?: number;
  stallMs?: number;
};

export function createNarrator(options: Options) {
  let unavailableUntil = 0;
  const request = options.fetch ?? fetch;
  return async (text: string, signal: AbortSignal) => {
    if (signal.aborted) return;
    if (isCounting(text) || Date.now() < unavailableUntil) {
      await options.browserSpeak(text, signal);
      return;
    }
    const download = new AbortController();
    let player: PcmPlayback | undefined;
    let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
    let receivedAudio = false;
    const cancel = () => {
      download.abort();
      player?.stop();
      void reader?.cancel().catch(() => {});
    };
    signal.addEventListener('abort', cancel, { once: true });
    // A sluggish endpoint never leaves a child waiting indefinitely for guidance.
    let timeout = setTimeout(cancel, options.firstAudioMs ?? 1800);
    const totalTimeout = setTimeout(cancel, 60_000);
    try {
      const context = options.getContext();
      if (context.state !== 'running') {
        let onAbort = () => {};
        try {
          await Promise.race([
            context.resume(),
            new Promise<never>((_resolve, reject) => {
              onAbort = () => reject(new Error('Audio activation canceled'));
              download.signal.addEventListener('abort', onAbort, { once: true });
              if (download.signal.aborted) onAbort();
            }),
          ]);
        } finally {
          download.signal.removeEventListener('abort', onAbort);
        }
      }
      download.signal.throwIfAborted();
      player = new PcmPlayback(context);
      const response = await request('/api/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: text }),
        signal: download.signal,
      });
      if (
        !response.ok ||
        !response.body ||
        !response.headers.get('content-type')?.startsWith('audio/pcm') ||
        Number(response.headers.get('x-audio-sample-rate')) !== PCM_SAMPLE_RATE
      ) {
        await response.body?.cancel();
        throw new Error('Speech unavailable');
      }
      reader = response.body.getReader();
      const decoder = new PcmDecoder();
      let bytes = 0;
      while (true) {
        const { done, value } = await reader.read();
        download.signal.throwIfAborted();
        if (done) break;
        bytes += value.byteLength;
        if (bytes > PCM_SAMPLE_RATE * 2 * 60) throw new Error('Audio too large');
        const samples = decoder.decode(value);
        if (samples.length) {
          receivedAudio = true;
          player.enqueue(samples);
          if (player.started) {
            clearTimeout(timeout);
            timeout = setTimeout(cancel, options.stallMs ?? 5000);
          }
        }
      }
      decoder.finish();
      if (!receivedAudio) throw new Error('Empty audio');
      clearTimeout(timeout);
      await player.finish();
    } catch {
      const started = player?.started;
      cancel();
      if (!signal.aborted) {
        unavailableUntil = Date.now() + 60_000;
        // A failed stream cannot resume. Avoid repeating speech already heard.
        if (!started) await options.browserSpeak(text, signal);
      }
    } finally {
      clearTimeout(timeout);
      clearTimeout(totalTimeout);
      signal.removeEventListener('abort', cancel);
      cancel();
      await reader?.cancel().catch(() => {});
      reader?.releaseLock();
    }
  };
}
