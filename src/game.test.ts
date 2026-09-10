import assert from 'node:assert/strict';
import test from 'node:test';
import { bridgeLesson } from './bridgeLesson.ts';
import { fruitGrid } from './fruitLayout.ts';
import {
  availableSkills,
  completedMissions,
  dateKey,
  defaultSave,
  makeProblem,
  missionSkill,
  nextMission,
  readSave,
  recordRun,
  streak,
  type Grade,
  type Run,
  type Save,
} from './game.ts';
import { slideJourney } from './slideJourney.ts';
import { SQUIRREL_LOOP_PAUSE, SQUIRREL_RUN_SPEED, squirrelJourney } from './squirrelJourney.ts';

import { chooseRoomItem, freshClubhouse, roomItems } from './clubhouse.ts';
import {
  bridgePieces,
  completedPlay,
  demonstrationPlacements,
  playModel,
  targetTotal,
} from './handsOnModel.ts';
import {
  factKey,
  memoryKey,
  nextDiscovery,
  recommendedSkill,
  rememberDiscovery,
  skillMemory,
} from './learning.ts';

function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

test('The squirrel runs briskly and waits hidden for five seconds before repeating', () => {
  const distance = 840,
    travel = distance / SQUIRREL_RUN_SPEED;
  const pickup = 3.8 + travel,
    turnBack = pickup + 3,
    returning = turnBack + 0.8;
  const tree = returning + travel,
    climbing = tree + 0.8,
    home = climbing + 3.8;
  for (const t of [1.1, 2, 2.9, climbing + 0.2, climbing + 2]) {
    const pose = squirrelJourney(t, distance, 74);
    assert.equal(pose.x, 0);
    assert.equal(pose.rotation, 90);
    assert.equal(pose.gait, 'climb');
  }
  assert.equal(squirrelJourney(5, distance, 74).x - squirrelJourney(4, distance, 74).x, 140);
  for (const t of [pickup + 0.01, pickup + 1.5, turnBack - 0.01]) {
    const pose = squirrelJourney(t, distance, 74);
    assert.equal(pose.x, distance);
    assert.equal(pose.gait, 'still');
  }
  assert.equal(squirrelJourney(returning + 0.1, distance, 74).turn, -1);
  assert.ok(
    squirrelJourney(returning + 0.1, distance, 74).x >
      squirrelJourney(returning + 2, distance, 74).x,
  );
  assert.equal(SQUIRREL_LOOP_PAUSE, 5);
  for (let t = home + 0.01; t < home + 5; t += 0.05) {
    const pose = squirrelJourney(t, distance, 74);
    assert.equal(pose.visible, 0);
    assert.equal(pose.gait, 'still');
    assert.equal(pose.x, 0);
  }
  assert.equal(squirrelJourney(home + 5 + 0.5, distance, 74).action, 'climbing down');
});

test('The child walks around the slide and reaches the deck before walking across it', () => {
  for (let t = 3.6; t < 10.8; t += 0.025) {
    const point = slideJourney(t);
    assert.equal(point.pose, 'walk');
    if (point.z > -1.7 && point.z < 3.5)
      assert.ok(point.x >= 1.8, 'Return path crosses the slide or ladder');
  }
  for (let t = 10.8; t < 14; t += 0.025) {
    const point = slideJourney(t);
    assert.ok(point.z < -0.85, 'Climber enters the platform before reaching its height');
  }
  for (let t = 14; t < 15.1; t += 0.025) assert.equal(slideJourney(t).y, 1.98);
  const before = slideJourney(16.1999),
    after = slideJourney(0);
  assert.ok(
    Math.abs(before.y - after.y) < 0.001 && Math.abs(before.z - after.z) < 0.001,
    'Slide cycle jumps between sitting and sliding',
  );
});

test('Every berry stays in its tray before and after joining or subtraction at mobile and desktop widths', () => {
  for (const width of [240, 258, 280, 320, 375, 400, 450, 500]) {
    for (const [left, size] of [
      [0.02, 0.45],
      [0.53, 0.45],
      [0.17, 0.66],
      [0.03, 0.94],
      [0.03, 0.62],
      [0.71, 0.27],
    ]) {
      for (let count = 1; count <= 20; count++) {
        const grid = fruitGrid(width, left, size, count);
        for (let i = 0; i < count; i++) {
          const p = grid.at(i);
          assert.ok(p.x >= grid.left + 2, `Berry ${i} crosses the left edge at width ${width}`);
          assert.ok(
            p.x + 40 <= grid.left + grid.width - 2,
            `Berry ${i} crosses the right edge at width ${width}`,
          );
          assert.ok(p.y - 12 >= 34, 'Counting badge crosses the tray top');
          assert.ok(p.y + 42 <= grid.height - 11, 'Berry crosses the tray bottom');
        }
      }
    }
  }
  const sevenMinusOne = fruitGrid(375, 0.03, 0.62, 6);
  assert.ok(
    sevenMinusOne.at(5).y > sevenMinusOne.at(0).y,
    'Six remaining berries wrap onto a second row',
  );
});
const run = (changes: Partial<Run> = {}): Run => ({
  id: 'first',
  date: '2026-09-10',
  grade: 1,
  mission: 0,
  skill: 'addition',
  stars: 3,
  unassisted: 5,
  xp: 100,
  practice: false,
  ...changes,
});

test('All K–5 question families give four distinct, valid choices and correct arithmetic', () => {
  const rng = seeded(2026);
  for (let grade = 0; grade <= 5; grade++) {
    for (const skill of availableSkills(grade as Grade)) {
      for (let i = 0; i < 500; i++) {
        const p = makeProblem(grade as Grade, skill, i % 5, rng);
        assert.equal(p.choices.length, 4, `${skill}: ${p.equation}`);
        assert.equal(new Set(p.choices).size, 4);
        assert.ok(p.choices.includes(p.answer));
        assert.ok(p.choices.every((n) => n >= 0 && Number.isFinite(n)));
        if (skill === 'addition' || skill === 'decimals' || skill === 'fractions')
          assert.ok(Math.abs(p.answer - p.a - p.b) < 1e-8);
        if (skill === 'subtraction') assert.equal(p.answer, p.a - p.b);
        if (skill === 'multiplication') assert.equal(p.answer, p.a * p.b);
        if (skill === 'division') {
          assert.equal(p.answer, p.a / p.b);
          assert.ok(Number.isInteger(p.answer));
        }
        if (p.denominator)
          assert.ok(p.choices.every((n) => Number.isInteger(n) && n <= p.denominator!));
        if (grade === 0 && skill === 'addition') assert.ok(p.answer <= 10);
      }
    }
  }
});

test('Extreme random values cannot produce duplicate or missing answer choices', () => {
  for (const rng of [() => 0, () => 0.999999999]) {
    for (const skill of availableSkills(5)) {
      const p = makeProblem(5, skill, 4, rng);
      assert.equal(p.choices.length, 4);
      assert.ok(p.choices.includes(p.answer));
    }
  }
});

test('Chapter progression is grade-specific and practice cannot unlock chapters', () => {
  let save: Save = { ...defaultSave, runs: [], claimed: [] };
  assert.equal(nextMission(save), 0);
  save = recordRun(save, run({ practice: true }));
  assert.deepEqual(completedMissions(save), []);
  save = recordRun(save, run({ id: 'chapter' }));
  assert.equal(nextMission(save), 1);
  assert.equal(nextMission({ ...save, grade: 2 }), 0);
  for (let i = 1; i < 5; i++) save = recordRun(save, run({ id: `chapter-${i}`, mission: i }));
  assert.equal(nextMission(save), 4);
  assert.equal(completedMissions(save).length, 5);
});

test('Submitting a completed run twice never duplicates rewards', () => {
  const first = recordRun(defaultSave, run());
  const second = recordRun(first, run());
  assert.equal(second.runs.length, 1);
  assert.equal(second.xp, 100);
  assert.equal(second.gems, 15);
  assert.equal(second, first);
});

test('Streaks count local calendar days, tolerate today not played, and stop at gaps', () => {
  const today = new Date(2026, 8, 10, 1, 15);
  const runs = [
    run(),
    run({ id: 'again' }),
    run({ id: 'yesterday', date: '2026-09-09' }),
    run({ id: 'before', date: '2026-09-08' }),
  ];
  assert.equal(streak(runs, today), 3);
  assert.equal(
    streak(
      runs.filter((r) => r.date !== dateKey(today)),
      today,
    ),
    2,
  );
  assert.equal(streak([run({ date: '2026-09-08' })], today), 0);
  assert.equal(streak([], today), 0);
});

test('Malformed saves recover safely; valid saves preserve earned progress', () => {
  for (const value of [null, 'broken', 'null', '{}', '{"version":1,"grade":8,"runs":[]}'])
    assert.equal(readSave(value).xp, 0);
  const save = recordRun(defaultSave, run());
  assert.deepEqual(readSave(JSON.stringify(save)), save);
  assert.equal(
    readSave(JSON.stringify({ ...save, runs: [null, {}, ...save.runs] })).runs.length,
    1,
  );
});

test('Every chapter uses a skill available at the chosen grade', () => {
  for (let grade = 0; grade <= 5; grade++)
    for (let i = 0; i < 5; i++)
      assert.ok(availableSkills(grade as Grade).includes(missionSkill(grade as Grade, i)));
});

test('Old saves migrate without losing gems, characters, chapter progress, or treasures', () => {
  const old = {
    ...recordRun(defaultSave, run()),
    name: 'Ava',
    gems: 45,
    companion: 'Pip',
    clubhouse: undefined,
    learning: undefined,
  };
  const migrated = readSave(JSON.stringify(old));
  assert.equal(migrated.gems, 45);
  assert.equal(migrated.companion, 'Pip');
  assert.equal(migrated.runs.length, 1);
  assert.deepEqual(migrated.clubhouse, freshClubhouse());
  assert.deepEqual(migrated.learning, {});
});

test('Clubhouse purchases are atomic, cannot overspend, and owned items can be equipped for free', () => {
  let save = { ...defaultSave, gems: 30, clubhouse: freshClubhouse() };
  assert.equal(chooseRoomItem(save, 'missing'), save);
  save = chooseRoomItem(save, 'star-rug');
  assert.equal(save.gems, 15);
  assert.equal(save.clubhouse.equipped.rug, 'star-rug');
  assert.equal(chooseRoomItem(save, 'star-rug'), save);
  const free = chooseRoomItem(save, 'leaf-rug');
  assert.equal(free.gems, 15);
  const reused = chooseRoomItem(free, 'star-rug');
  assert.equal(reused.gems, 15);
  assert.equal(reused.clubhouse.owned.filter((id) => id === 'star-rug').length, 1);
  assert.equal(chooseRoomItem(reused, 'reading-chair'), reused);
  assert.deepEqual(readSave(JSON.stringify(reused)), reused);
  for (const item of roomItems) assert.ok(item.price >= 0);
});

test('Saved room and learning data reject invalid entries without corrupting valid progress', () => {
  const save = readSave(
    JSON.stringify({
      ...defaultSave,
      gems: Infinity,
      clubhouse: {
        owned: ['missing', 'bow'],
        equipped: { rug: 'bow', outfit: 'crown' },
        petName: '   ',
      },
      learning: {
        '1:addition': {
          level: 99,
          completed: 3,
          supported: 8,
          reviews: [null, { problem: { skill: 'addition', a: 3, b: 4, answer: 99 } }],
          seen: [null, 1, 'valid'],
        },
      },
    }),
  );
  assert.equal(save.gems, 0);
  assert.equal(save.clubhouse.equipped.outfit, 'scarf');
  assert.equal(save.clubhouse.equipped.rug, 'leaf-rug');
  assert.equal(save.clubhouse.petName, 'Pebble');
  const memory = skillMemory(save, 'addition');
  assert.equal(memory.level, 4);
  assert.equal(memory.supported, 3);
  assert.deepEqual(memory.reviews, []);
  assert.deepEqual(memory.seen, ['valid']);
});

test('Learning persists across visits, eases after support, revisits a fact, and never reduces rewards', () => {
  const problem = makeProblem(1, 'addition', 0, seeded(1));
  let save: Save = { ...defaultSave, learning: {} };
  const observe = (id: string, supported: boolean, p = problem) => {
    save = rememberDiscovery(save, { id, grade: 1, problem: p, supported, date: '2026-09-10' });
  };
  observe('one', false);
  observe('two', false);
  assert.equal(skillMemory(save, 'addition').level, 1);
  const before = save;
  observe('two', false);
  assert.equal(save, before);
  observe('help', true);
  assert.equal(skillMemory(save, 'addition').level, 0);
  assert.equal(skillMemory(save, 'addition').reviews.length, 1);
  assert.equal(
    nextDiscovery(save, 'addition', 1).reviewKey,
    undefined,
    'A supported fact needs other practice first',
  );
  const different = {
    ...problem,
    a: problem.a + 1,
    answer: problem.answer + 1,
    equation: 'different',
  };
  observe('four', false, different);
  observe('five', false, different);
  save = readSave(JSON.stringify(save));
  const review = nextDiscovery(save, 'addition', 1);
  assert.equal(review.reviewKey, factKey(problem));
  assert.equal(review.problem.a, problem.a);
  assert.equal(review.problem.b, problem.b);
  assert.equal(nextDiscovery(save, 'addition', 1, [factKey(problem)]).reviewKey, undefined);
  assert.equal(recommendedSkill(save), 'addition');
  assert.ok(nextDiscovery(save, 'addition', 0).welcome.includes('Welcome back'));
  observe('reviewed', false, review.problem);
  assert.equal(skillMemory(save, 'addition').reviews.length, 0);
  assert.equal(save.xp, 0);
  assert.equal(save.gems, 0);
  assert.equal(skillMemory({ ...save, grade: 2 }, 'addition').completed, 0);
  assert.equal(save.learning[memoryKey(1, 'addition')].completed, 6);
});

test('Every hands-on model can represent and complete K–5 arithmetic, including zero and decimal answers', () => {
  const rng = seeded(97);
  for (let grade = 0; grade <= 5; grade++)
    for (const skill of availableSkills(grade as Grade))
      for (let i = 0; i < 50; i++) {
        const p = makeProblem(grade as Grade, skill, i % 5, rng),
          model = playModel(p),
          solution = demonstrationPlacements(model);
        assert.equal(completedPlay(model, solution), true, `Cannot build ${p.equation}`);
        assert.ok(model.tokens.length <= 144);
        assert.ok(model.tokens.every((t) => Number.isInteger(t.value) && t.value > 0));
        const total = Array.from({ length: model.targets }, (_, target) =>
          targetTotal(model, solution, target),
        ).reduce((a, b) => a + b, 0);
        assert.equal(total, Math.round((skill === 'division' ? p.a : p.answer) * model.scale));
        if (p.answer !== 0) assert.equal(completedPlay(model, {}), false);
        assert.equal(completedPlay(model, { ...solution, unknown: 0 }), false);
      }
});

test('Sharing requires equal portions, and surplus bridge planks can be returned to correct an answer', () => {
  const p = makeProblem(3, 'division', 0, () => 0),
    model = playModel(p);
  const unequal = Object.fromEntries(model.tokens.map((t) => [t.id, 0]));
  assert.equal(completedPlay(model, unequal), false);
  assert.equal(completedPlay(model, demonstrationPlacements(model)), true);
  const bridge = playModel({ ...makeProblem(1, 'subtraction', 0), a: 7, b: 1, answer: 6 });
  const solution = demonstrationPlacements(bridge);
  assert.equal(completedPlay(bridge, { ...solution, 'extra-0': 0 }), false);
  assert.equal(completedPlay(bridge, solution), true);
});

test('Every arithmetic family responds to the remembered challenge level', () => {
  for (const skill of availableSkills(5)) {
    const gentle = makeProblem(5, skill, 0, () => 0.99999999),
      stretch = makeProblem(5, skill, 4, () => 0.99999999);
    const measure = (p: typeof gentle) => p.denominator || p.a + p.b;
    assert.ok(measure(stretch) > measure(gentle), `${skill} ignores challenge level`);
  }
});

test('The physical bridge shows the whole, the existing part, and the missing part exactly', () => {
  for (const [a, b] of [
    [5, 1],
    [7, 1],
    [10, 0],
    [20, 5],
    [8, 8],
    [842, 235],
  ]) {
    const p = { ...makeProblem(1, 'subtraction', 0), a, b, answer: a - b },
      model = playModel(p);
    const initial = bridgePieces(p, model, {});
    assert.equal(
      initial.filter((s) => s.kind === 'existing').reduce((n, s) => n + s.value, 0),
      b,
    );
    assert.equal(
      initial.filter((s) => s.kind === 'gap').reduce((n, s) => n + s.value, 0),
      a - b,
    );
    if (a <= 20) assert.equal(initial.length, a, 'Young learners see one space per plank');
    const placed = demonstrationPlacements(model),
      built = bridgePieces(p, model, placed);
    assert.equal(built.filter((s) => s.kind === 'gap').length, 0);
    assert.equal(
      built.filter((s) => s.kind === 'added').reduce((n, s) => n + s.value, 0),
      a - b,
    );
    assert.equal(
      built.reduce((n, s) => n + s.value, 0),
      a,
    );
    const extra = bridgePieces(p, model, { ...placed, 'extra-0': 0 });
    assert.ok(extra.some((s) => s.kind === 'surplus'));
  }
  const p = { ...makeProblem(1, 'addition', 0), a: 10, b: 3, answer: 13 };
  assert.equal(playModel(p).tokens.length, 13, 'Small quantities stay as individual berries');
});

test('Bridge coaching teaches the missing part, handles zero, and encourages correction', () => {
  const p = { ...makeProblem(1, 'subtraction', 0), a: 5, b: 1, answer: 4 };
  const first = bridgeLesson(p, 0);
  assert.ok(first.setup.includes('1 is already here'));
  assert.equal(first.ready, false);
  assert.equal(first.step, 1);
  const building = bridgeLesson(p, 2);
  assert.ok(building.message.includes('2 golden planks'));
  assert.equal(building.step, 2);
  const ready = bridgeLesson(p, 4);
  assert.ok(ready.speech.includes('5 minus 1 equals 4'));
  assert.ok(ready.message.includes('4 new planks'));
  assert.equal(ready.ready, true);
  const extra = bridgeLesson(p, 5);
  assert.equal(extra.ready, false);
  assert.ok(extra.message.includes('Return the last one'));
  const zero = bridgeLesson({ ...p, b: 5, answer: 0 }, 0);
  assert.equal(zero.ready, true);
  assert.ok(zero.message.includes('No new planks'));
  assert.ok(bridgeLesson(p, 4, true).title.includes('get across'));
});
