/** A canceled hint or discovery must never speak after the next one starts. */
export class SpeechQueue {
  private generation = 0;
  private tail = Promise.resolve();
  private active: AbortController | null = null;
  private play: (text: string, signal: AbortSignal) => Promise<void>;

  constructor(play: (text: string, signal: AbortSignal) => Promise<void>) {
    this.play = play;
  }

  stop() {
    this.generation++;
    this.active?.abort();
    this.active = null;
    this.tail = Promise.resolve();
  }

  say(text: string, interrupt = true): Promise<void> {
    if (interrupt) this.stop();
    const generation = this.generation;
    this.tail = this.tail
      .then(async () => {
        if (generation !== this.generation) return;
        const controller = new AbortController();
        this.active = controller;
        try {
          await this.play(text, controller.signal);
        } finally {
          if (this.active === controller) this.active = null;
        }
      })
      .catch(() => {
        /* Speech failure never prevents the next game action. */
      });
    return this.tail;
  }
}

export function speechParts(text: string): string[] {
  const normalized = text
    .replace(/(\d+)\/(\d+)/g, '$1 over $2')
    .replace(/−/g, ' minus ')
    .replace(/×/g, ' times ')
    .replace(/÷/g, ' divided by ')
    .replace(/\+/g, ' plus ')
    .replace(/=/g, ' equals ')
    .replace(/\s+/g, ' ')
    .trim();
  // Split at sentence boundaries, preserving decimal points and spoken fractions.
  return normalized.split(/(?<=[.!?])\s+/).flatMap((sentence) => {
    const chunks: string[] = [];
    let chunk = '';
    for (const word of sentence.split(' ')) {
      if (chunk && chunk.length + word.length > 180) {
        chunks.push(chunk);
        chunk = '';
      }
      chunk += `${chunk ? ' ' : ''}${word}`;
    }
    if (chunk) chunks.push(/[.!?]$/.test(chunk) ? chunk : `${chunk}.`);
    return chunks;
  });
}
