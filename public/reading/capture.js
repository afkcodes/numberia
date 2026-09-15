/* Microphone capture runs on the audio thread and sends 100 ms PCM16 blocks. */
class ReadingCapture extends AudioWorkletProcessor {
  constructor() {
    super();
    this.samples = [];
    this.total = 0;
    this.count = 0;
    this.position = 0;
    this.port.onmessage = () => {
      this.flush();
      this.port.postMessage('flushed');
    };
  }
  flush() {
    if (!this.samples.length) return;
    const buffer = new ArrayBuffer(this.samples.length * 2);
    const view = new DataView(buffer);
    this.samples.forEach((sample, i) =>
      view.setInt16(i * 2, Math.round(Math.max(-1, Math.min(1, sample)) * 32767), true),
    );
    this.port.postMessage(buffer, [buffer]);
    this.samples = [];
  }
  process(inputs) {
    const input = inputs[0]?.[0];
    if (!input) return true;
    for (const sample of input) {
      this.total += sample;
      this.count++;
      this.position += 16000;
      if (this.position >= sampleRate) {
        this.position -= sampleRate;
        this.samples.push(this.total / this.count);
        this.total = 0;
        this.count = 0;
        if (this.samples.length >= 1600) this.flush();
      }
    }
    return true;
  }
}
registerProcessor('reading-capture', ReadingCapture);
