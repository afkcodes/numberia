export const PCM_SAMPLE_RATE = 24_000;
const startupSamples = PCM_SAMPLE_RATE / 5;
const blockSamples = PCM_SAMPLE_RATE / 10;

/** HTTP reads can split a signed little-endian sample between its two bytes. */
export class PcmDecoder {
  private carry: number | null = null;

  decode(bytes: Uint8Array): Float32Array {
    const samples = new Float32Array(Math.floor((bytes.length + Number(this.carry !== null)) / 2));
    let offset = 0;
    let index = 0;
    const signed = (low: number, high: number) => {
      const value = low | (high << 8);
      return (value >= 0x8000 ? value - 0x10000 : value) / 0x8000;
    };
    if (this.carry !== null && bytes.length) {
      samples[index++] = signed(this.carry, bytes[offset++]);
      this.carry = null;
    }
    while (offset + 1 < bytes.length) {
      samples[index++] = signed(bytes[offset], bytes[offset + 1]);
      offset += 2;
    }
    if (offset < bytes.length) this.carry = bytes[offset];
    return samples;
  }

  finish() {
    if (this.carry !== null) throw new Error('Incomplete PCM sample');
  }
}

/** Web Audio schedules real PCM chunks; the stream may still be downloading. */
export class PcmPlayback {
  private context: AudioContext;
  private nodes = new Set<AudioBufferSourceNode>();
  private pending: Float32Array[] = [];
  private pendingSamples = 0;
  private nextAt = 0;
  private ended = false;
  private stopped = false;
  private resolve!: () => void;
  private completion: Promise<void>;
  started = false;

  constructor(context: AudioContext) {
    this.context = context;
    this.completion = new Promise((resolve) => {
      this.resolve = resolve;
    });
  }

  enqueue(samples: Float32Array) {
    if (this.stopped || this.ended || !samples.length) return;
    this.pending.push(samples);
    this.pendingSamples += samples.length;
    // Buffer 200 ms initially; then schedule 100 ms blocks, independent of HTTP reads.
    // Tiny individual sources can introduce clicks and gaps while the 3D scene is busy.
    if (this.pendingSamples >= (this.started ? blockSamples : startupSamples)) this.flush();
  }

  private flush() {
    if (!this.pendingSamples || this.stopped) return;
    const joined = new Float32Array(this.pendingSamples);
    let offset = 0;
    for (const samples of this.pending) {
      joined.set(samples, offset);
      offset += samples.length;
    }
    // Whole blocks also preserve resampling alignment at both 44.1 and 48 kHz.
    const length = this.ended
      ? joined.length
      : Math.floor(joined.length / blockSamples) * blockSamples;
    const remainder = joined.subarray(length);
    this.pending = remainder.length ? [remainder] : [];
    this.pendingSamples = remainder.length;
    if (!length) return;
    const buffer = this.context.createBuffer(1, length, PCM_SAMPLE_RATE);
    buffer.getChannelData(0).set(joined.subarray(0, length));
    const node = this.context.createBufferSource();
    node.buffer = buffer;
    node.connect(this.context.destination);
    node.onended = () => {
      node.disconnect();
      this.nodes.delete(node);
      if (this.ended && this.nodes.size === 0) this.resolve();
    };
    this.nodes.add(node);
    const start = Math.max(this.nextAt, this.context.currentTime + 0.035);
    node.start(start);
    this.nextAt = start + buffer.duration;
    this.started = true;
  }

  finish(): Promise<void> {
    this.ended = true;
    this.flush();
    if (this.nodes.size === 0) this.resolve();
    return this.completion;
  }

  stop() {
    this.stopped = true;
    this.pending = [];
    this.pendingSamples = 0;
    for (const node of this.nodes) {
      node.onended = null;
      try {
        node.stop();
      } catch {
        /* A source may have just finished. */
      }
      node.disconnect();
    }
    this.nodes.clear();
    this.resolve();
  }
}
