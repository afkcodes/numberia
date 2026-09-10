import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SpeechQueue, speechParts } from './speechQueue.ts';

const tick = () => new Promise<void>(resolve => setImmediate(resolve));

test('Counting waits for each spoken number and announces the answer last', async () => {
  const spoken: string[] = []; const finish: (() => void)[] = [];
  const queue = new SpeechQueue(text => new Promise(resolve => { spoken.push(text); finish.push(resolve); }));
  void queue.say('1'); void queue.say('2', false); const complete = queue.say('Two altogether!', false);
  await tick(); assert.deepEqual(spoken, ['1']);
  finish.shift()!(); await tick(); assert.deepEqual(spoken, ['1', '2']);
  finish.shift()!(); await tick(); assert.deepEqual(spoken, ['1', '2', 'Two altogether!']);
  finish.shift()!(); await complete;
});

test('Muting or closing cancels active and waiting narration', async () => {
  const spoken: string[] = []; let active: AbortSignal | undefined;
  const queue = new SpeechQueue((text, signal) => new Promise(resolve => {
    spoken.push(text); active = signal; signal.addEventListener('abort', () => resolve(), { once: true });
  }));
  void queue.say('Long hint'); const waiting = queue.say('Old answer', false);
  await tick(); queue.stop(); await waiting;
  assert.equal(active?.aborted, true); assert.deepEqual(spoken, ['Long hint']);
});

test('A replacement hint starts without waiting for canceled narration', async () => {
  const spoken: string[] = []; const signals: AbortSignal[] = []; const finish: (() => void)[] = [];
  const queue = new SpeechQueue((text, signal) => new Promise(resolve => { spoken.push(text); signals.push(signal); finish.push(resolve); }));
  void queue.say('Old hint'); const stale = queue.say('Stale count', false); await tick();
  const fresh = queue.say('New question'); await tick();
  assert.deepEqual(spoken, ['Old hint', 'New question']); assert.equal(signals[0].aborted, true);
  finish[0](); await stale; assert.deepEqual(spoken, ['Old hint', 'New question']);
  finish[1](); await fresh;
});

test('Speech errors do not block the next count', async () => {
  const spoken: string[] = [];
  const queue = new SpeechQueue(async text => { spoken.push(text); if (text === '1') throw new Error('Unavailable'); });
  void queue.say('1'); await queue.say('2', false); assert.deepEqual(spoken, ['1', '2']);
});

test('Spoken math preserves decimals and fractions and expands operators', () => {
  assert.deepEqual(speechParts('1.2 + 0.3 = 1.5. Great work!'), ['1.2 plus 0.3 equals 1.5.', 'Great work!']);
  assert.deepEqual(speechParts('1/4 + 2/4 = 3/4'), ['1 over 4 plus 2 over 4 equals 3 over 4.']);
  assert.deepEqual(speechParts('7 − 2. 3 × 4. 12 ÷ 3?'), ['7 minus 2.', '3 times 4.', '12 divided by 3?']);
  assert.deepEqual(speechParts('  '), []);
  assert.deepEqual(speechParts('1'), speechParts('1.'));
});
