import assert from 'node:assert/strict';
import test from 'node:test';
import { getDailyQuests } from './dailyQuests.ts';
import { readSave, type Run } from './game.ts';
import type { LearningObservation } from './learning.ts';
import { saveReducer, type SaveAction } from './saveReducer.ts';

const today = '2026-09-10';
const run = (id: string, practice = false): Run => ({
  id,
  date: today,
  grade: 1,
  mission: 0,
  skill: 'addition',
  stars: 3,
  unassisted: 2,
  xp: 100,
  practice,
});

test('Profile and grade actions preserve earned progress without mutating the previous save', () => {
  const original = saveReducer(readSave(null), { type: 'quest-completed', run: run('first') });
  const snapshot = structuredClone(original);
  let next = saveReducer(original, { type: 'grade-changed', grade: 5 });
  next = saveReducer(next, { type: 'explorer-renamed', name: '  River  ' });
  next = saveReducer(next, { type: 'pet-renamed', name: 'Biscuit' });
  next = saveReducer(next, { type: 'sound-toggled' });
  assert.equal(next.grade, 5);
  assert.equal(next.name, 'River');
  assert.equal(next.clubhouse.petName, 'Biscuit');
  assert.equal(next.sound, false);
  assert.equal(next.xp, 100);
  assert.equal(next.gems, 15);
  assert.deepEqual(next.runs, original.runs);
  assert.deepEqual(original, snapshot);
  assert.equal(saveReducer(next, { type: 'explorer-renamed', name: ' ' }).name, 'Explorer');
});

test('Daily quest cards and reward claims use the same eligibility and reward amounts', () => {
  let save = saveReducer(readSave(null), { type: 'quest-completed', run: run('story') });
  save = saveReducer(save, { type: 'quest-completed', run: run('practice', true) });
  const tasks = getDailyQuests(save, today);
  assert.deepEqual(
    tasks.map(({ progress, total }) => [progress, total]),
    [
      [1, 1],
      [1, 1],
      [6, 6],
    ],
  );
  const before = save.gems;
  for (const task of tasks) {
    save = saveReducer(save, { type: 'daily-reward-claimed', key: task.key, today });
    assert.equal(saveReducer(save, { type: 'daily-reward-claimed', key: task.key, today }), save);
  }
  assert.equal(save.gems, before + tasks.reduce((sum, task) => sum + task.reward, 0));
  assert.equal(save.claimed.length, 3);
});

test('Unknown, unfinished, and expired daily quests cannot award gems', () => {
  const empty = readSave(null);
  for (const key of [
    `${today}:mission`,
    `${today}:practice`,
    `${today}:stars`,
    `${today}:made-up`,
  ]) {
    assert.equal(saveReducer(empty, { type: 'daily-reward-claimed', key, today }), empty);
  }
  const completed = saveReducer(empty, { type: 'quest-completed', run: run('yesterday') });
  assert.equal(
    saveReducer(completed, {
      type: 'daily-reward-claimed',
      key: `${today}:mission`,
      today: '2026-09-11',
    }),
    completed,
  );
});

test('Repeated reducer actions cannot duplicate completion rewards or decoration purchases', () => {
  const action = { type: 'quest-completed', run: run('unique') } as const;
  const completed = saveReducer(readSave(null), action);
  assert.equal(saveReducer(completed, action), completed);
  const decorated = saveReducer(completed, { type: 'decoration-chosen', id: 'star-rug' });
  const repeated = saveReducer(decorated, { type: 'decoration-chosen', id: 'star-rug' });
  assert.equal(repeated.gems, 0);
  assert.equal(repeated.clubhouse.owned.filter((id) => id === 'star-rug').length, 1);
  assert.equal(saveReducer(repeated, { type: 'decoration-chosen', id: 'reading-chair' }), repeated);
});

test('Learning observations remain idempotent through the saved-state reducer', () => {
  const observation: LearningObservation = {
    id: 'supported-discovery',
    grade: 1,
    date: today,
    supported: true,
    problem: {
      a: 2,
      b: 3,
      answer: 5,
      equation: '2 + 3',
      choices: [4, 5, 6, 7],
      skill: 'addition',
      hint: 'Count together.',
    },
  };
  const action: SaveAction = {
    type: 'discovery-learned',
    observation: {
      ...observation,
      problem: { ...observation.problem, choices: [...observation.problem.choices] },
    },
  };
  const learned = saveReducer(readSave(null), action);
  assert.equal(learned.learning['1:addition'].supported, 1);
  assert.equal(learned.learning['1:addition'].reviews.length, 1);
  assert.equal(saveReducer(learned, action), learned);
  assert.equal(learned.gems, 0);
});
