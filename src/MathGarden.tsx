import { ArrowDown, ArrowRightLeft, Check, RotateCcw, Sparkles, Volume2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLatest } from './hooks/useLatest';
import { playSound, speak, stopSpeaking } from './audio';
import { fruitGrid } from './fruitLayout';
import type { Problem } from './game';
import { answerNarration } from './mathNarration';

type Token = { value: number; group: number; local: number; id: number };
function tokensFor(value: number, group: number, offset: number): Token[] {
  const values: number[] = [];
  let remaining = Math.round(value);
  for (const unit of [100, 10, 1]) {
    while (remaining >= unit) {
      values.push(unit);
      remaining -= unit;
    }
  }
  return values.map((n, i) => ({ value: n, group, local: i, id: i + offset }));
}

export default function MathGarden({
  problem,
  sound,
  demonstrate = 0,
  solved = false,
  onSupport,
}: {
  problem: Problem;
  sound: boolean;
  demonstrate?: number;
  solved?: boolean;
  onSupport?: () => void;
}) {
  const [mixed, setMixed] = useState(false);
  const [finished, setFinished] = useState(false);
  const [counted, setCounted] = useState<number[]>([]);
  const [width, setWidth] = useState(400);
  const [demoCycle, setDemoCycle] = useState(0);
  const [timelineRunning, setRunning] = useState(false);
  const running = timelineRunning && !solved;
  const [spokenCount, setSpokenCount] = useState<string | null>(null);
  const [activeToken, setActiveToken] = useState<number | null>(null);
  const countedRef = useRef<number[]>([]);
  const soundRef = useLatest(sound);
  const area = useRef<HTMLDivElement>(null);
  const isSubtraction = problem.skill === 'subtraction';
  const isDecimal = problem.skill === 'decimals';
  const isGroups = problem.skill === 'multiplication' || problem.skill === 'division';
  const isFraction = problem.skill === 'fractions';
  const factor = isDecimal ? 10 : 1;
  const { firstTokens, secondTokens, tokens } = useMemo(() => {
    const first = tokensFor(problem.a * factor, 0, 0);
    const second = isSubtraction ? [] : tokensFor(problem.b * factor, 1, first.length);
    // Young learners see one berry per unit, including a full group of ten.
    const firstTokens =
      problem.a <= 10 && !isDecimal
        ? Array.from({ length: problem.a }, (_, i) => ({ value: 1, group: 0, local: i, id: i }))
        : first;
    const secondTokens =
      !isSubtraction && problem.b <= 10 && !isDecimal
        ? Array.from({ length: problem.b }, (_, i) => ({
            value: 1,
            group: 1,
            local: i,
            id: i + firstTokens.length,
          }))
        : second.map((t, i) => ({ ...t, id: firstTokens.length + i }));
    return { firstTokens, secondTokens, tokens: [...firstTokens, ...secondTokens] };
  }, [problem, factor, isSubtraction, isDecimal]);
  const individualSubtraction = isSubtraction && problem.a <= 10;
  const multiPlaceSubtraction = isSubtraction && problem.a > 10;
  const display = useCallback(
    (value: number) => (isDecimal ? (value / 10).toFixed(1) : String(value)),
    [isDecimal],
  );
  useEffect(() => {
    const observer = new ResizeObserver((entries) => setWidth(entries[0].contentRect.width));
    if (area.current) observer.observe(area.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if ((!demoCycle && !demonstrate) || solved) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let canceled = false;
    // Reset the visual sequence on its first frame, then let the count timeline drive it.
    const firstFrame = requestAnimationFrame(() => {
      setMixed(false);
      setFinished(false);
      setCounted([]);
      countedRef.current = [];
      setSpokenCount(null);
      setActiveToken(null);
      setRunning(true);
    });
    stopSpeaking();
    const later = (fn: () => void, ms: number) => timers.push(setTimeout(fn, ms));
    later(() => setMixed(true), 80);
    const remainingTokens = individualSubtraction ? tokens.slice(0, problem.answer) : tokens;
    let total = 0;
    const steps = isGroups
      ? Array.from(
          { length: problem.skill === 'division' ? problem.answer : problem.a },
          (_, i) => ({
            value: problem.skill === 'division' ? i + 1 : (i + 1) * problem.b,
            id: null,
          }),
        )
      : isFraction
        ? Array.from({ length: problem.answer }, (_, i) => ({ value: i + 1, id: null }))
        : multiPlaceSubtraction
          ? [
              ...new Set([problem.a, problem.a - Math.floor(problem.b / 10) * 10, problem.answer]),
            ].map((value) => ({ value, id: null }))
          : remainingTokens.map((token) => ({ value: (total += token.value), id: token.id }));
    const start = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 180 : 1050;
    later(() => {
      void (async () => {
        for (const [i, step] of steps.entries()) {
          if (canceled) return;
          setSpokenCount(display(step.value));
          setActiveToken(step.id);
          if (step.id !== null) {
            countedRef.current = [...countedRef.current, step.id];
            setCounted([...countedRef.current]);
          }
          const pause = new Promise<void>((resolve) => setTimeout(resolve, 760));
          // Keep this berry highlighted until its spoken count has finished.
          if (soundRef.current) {
            playSound('berry', i);
            await speak(display(step.value), i === 0);
          }
          await pause;
        }
        if (canceled) return;
        setFinished(true);
        setRunning(false);
        setActiveToken(null);
        setSpokenCount(
          problem.denominator
            ? `${problem.answer}/${problem.denominator}`
            : isDecimal
              ? problem.answer.toFixed(1)
              : String(problem.answer),
        );
        if (soundRef.current) {
          playSound('correct');
          void speak(answerNarration(problem), false);
        }
      })();
    }, start);
    return () => {
      canceled = true;
      cancelAnimationFrame(firstFrame);
      timers.forEach(clearTimeout);
      stopSpeaking();
    };
    // Each demonstration owns its timeline. Sound changes affect the next count without restarting it.
  }, [
    demoCycle,
    demonstrate,
    solved,
    problem,
    tokens,
    individualSubtraction,
    multiPlaceSubtraction,
    isGroups,
    isFraction,
    isDecimal,
    display,
    soundRef,
  ]);
  useEffect(() => () => stopSpeaking(), []);
  const toggle = () => {
    onSupport?.();
    setDemoCycle((n) => n + 1);
    if (sound) playSound('berry', 4);
  };
  const tap = (id: number) => {
    if (countedRef.current.includes(id) || running) return;
    onSupport?.();
    const ids = [...countedRef.current, id];
    countedRef.current = ids;
    setCounted(ids);
    setActiveToken(id);
    const total = tokens.filter((t) => ids.includes(t.id)).reduce((sum, t) => sum + t.value, 0);
    setSpokenCount(display(total));
    const available = individualSubtraction && mixed ? tokens.slice(0, problem.answer) : tokens;
    const allCounted = available.every((t) => ids.includes(t.id));
    const answerVisible = allCounted && (!isSubtraction || mixed);
    if (answerVisible) setFinished(true);
    if (sound) {
      playSound('berry', ids.length - 1);
      const ending = answerVisible
        ? ` ${answerNarration(problem)}`
        : allCounted && isSubtraction
          ? ` Now take away ${problem.b}, and count what stays.`
          : '';
      // Preserve every tapped number in the queue; the first tap dismisses the longer hint.
      speak(`${display(total)}.${ending}`, ids.length === 1);
    }
  };
  const groupCount = problem.skill === 'division' ? problem.b : problem.a;
  const perGroup = problem.skill === 'division' ? problem.answer : problem.b;
  const countValue = tokens
    .filter((t) => counted.includes(t.id))
    .reduce((sum, t) => sum + t.value, 0);
  const firstGrid = fruitGrid(
    width,
    isSubtraction ? 0.17 : 0.02,
    isSubtraction ? 0.66 : 0.45,
    firstTokens.length,
  );
  const secondGrid = fruitGrid(width, 0.53, 0.45, secondTokens.length);
  const combinedGrid = fruitGrid(
    width,
    0.03,
    individualSubtraction ? 0.62 : 0.94,
    individualSubtraction ? problem.answer : tokens.length,
  );
  // Taken-away berries are a small visual record; full-size berries stay available to count.
  const awayTokenSize = width < 340 ? 20 : 28;
  const awayGrid = fruitGrid(
    width,
    0.71,
    0.27,
    individualSubtraction ? problem.b : 0,
    awayTokenSize,
  );
  const boardHeight = Math.max(
    169,
    firstGrid.height,
    secondGrid.height,
    combinedGrid.height,
    individualSubtraction ? awayGrid.height : 0,
  );
  return (
    <div
      className={`math-garden ${mixed ? 'is-mixed' : ''} ${finished ? 'is-finished' : ''} ${running ? 'is-counting' : ''}`}
    >
      <div className="garden-heading">
        <span>
          <Sparkles size={15} />
          Make the math happen!
        </span>
        <span className="garden-count" aria-live="polite">
          {counted.length ? `${display(countValue)} counted` : 'Try it with your hands'}
        </span>
      </div>
      {isGroups ? (
        <div className="group-model">
          <p>
            {problem.skill === 'division'
              ? `Share ${problem.a} berries between ${groupCount} baskets.`
              : `${groupCount} baskets. ${perGroup} berries in every basket.`}
          </p>
          <div className="math-baskets">
            {Array.from({ length: groupCount }, (_, i) => (
              <div
                className="math-basket"
                key={i}
                style={{ '--group-delay': `${i * 100}ms` } as React.CSSProperties}
              >
                <div className="basket-fruits">
                  {Array.from({ length: perGroup }, (_, j) => (
                    <span
                      className="tiny-fruit"
                      style={{ '--fruit-delay': `${i * 70 + j * 25}ms` } as React.CSSProperties}
                      key={j}
                    />
                  ))}
                </div>
                <span>{mixed ? perGroup : '?'}</span>
                <small>Basket {i + 1}</small>
              </div>
            ))}
          </div>
        </div>
      ) : isFraction ? (
        <div className="fraction-model">
          <p>Each whole has {problem.denominator} equal pieces.</p>
          <div className="fraction-row">
            <div className="fraction-bar">
              {Array.from({ length: problem.denominator! }, (_, i) => (
                <span className={i < problem.a ? 'filled first' : ''} key={i} />
              ))}
            </div>
            <strong>
              {problem.a}/{problem.denominator}
            </strong>
          </div>
          <span className="fraction-plus">+</span>
          <div className="fraction-row">
            <div className="fraction-bar">
              {Array.from({ length: problem.denominator! }, (_, i) => (
                <span className={i < problem.b ? 'filled second' : ''} key={i} />
              ))}
            </div>
            <strong>
              {problem.b}/{problem.denominator}
            </strong>
          </div>
          {mixed && (
            <div className="fraction-result">
              <ArrowDown size={21} />
              <div className="fraction-bar">
                {Array.from({ length: problem.denominator! }, (_, i) => (
                  <span
                    className={
                      i < problem.a ? 'filled first' : i < problem.answer ? 'filled second' : ''
                    }
                    style={{ animationDelay: `${i * 80}ms` }}
                    key={i}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : multiPlaceSubtraction ? (
        <div className="subtraction-steps">
          <p>Hop backwards in friendly little steps.</p>
          <div className="number-hops">
            <span>{problem.a}</span>
            <span className="hop-arrow">
              <span>−{Math.floor(problem.b / 10) * 10}</span>
              <ArrowDown size={28} />
            </span>
            <span className={mixed ? 'hop-revealed' : 'hop-hidden'}>
              {mixed ? problem.a - Math.floor(problem.b / 10) * 10 : '?'}
            </span>
            <span className="hop-arrow">
              <span>−{problem.b % 10}</span>
              <ArrowDown size={28} />
            </span>
            <span className={finished ? 'hop-revealed' : 'hop-hidden'}>
              {finished ? problem.answer : '?'}
            </span>
          </div>
        </div>
      ) : (
        <>
          <div
            ref={area}
            className={`fruit-board ${individualSubtraction ? 'subtract-board' : ''}`}
            style={{ height: `${boardHeight}px` }}
          >
            <div className="fruit-bowl bowl-first">
              <span>
                {mixed ? (isSubtraction ? 'Still here' : 'All together!') : 'First group'}
              </span>
            </div>
            {!isSubtraction && (
              <div className="fruit-bowl bowl-second">
                <span>Second group</span>
              </div>
            )}
            {!isSubtraction && <span className="fruit-board-plus">+</span>}
            {tokens.map((token, index) => {
              const start = (token.group ? secondGrid : firstGrid).at(token.local);
              const removed = individualSubtraction && index >= problem.answer;
              const end = removed ? awayGrid.at(index - problem.answer) : combinedGrid.at(index);
              const startX = start.x,
                startY = start.y,
                endX = removed ? end.x - (40 - awayTokenSize) / 2 : end.x,
                endY = end.y;
              const ordinal = counted.includes(token.id)
                ? counted
                    .slice(0, counted.indexOf(token.id) + 1)
                    .reduce((sum, id) => sum + (tokens.find((t) => t.id === id)?.value || 0), 0)
                : 0;
              return (
                <button
                  key={token.id}
                  className={`fruit-token group-${token.group} ${counted.includes(token.id) ? 'is-counted' : ''} ${activeToken === token.id ? 'is-counting-now' : ''} ${removed ? 'will-remove' : ''} ${token.value > 1 ? 'fruit-crate' : ''}`}
                  onClick={() => tap(token.id)}
                  disabled={running || (mixed && removed)}
                  aria-label={`${token.value === 1 ? 'Berry' : `Crate of ${display(token.value)}`} ${index + 1}${removed && mixed ? ', taken away' : ''}`}
                  aria-pressed={counted.includes(token.id)}
                  style={
                    {
                      '--fruit-start-x': `${startX}px`,
                      '--fruit-start-y': `${startY}px`,
                      '--fruit-end-x': `${endX}px`,
                      '--fruit-end-y': `${endY}px`,
                      '--fruit-delay': `${index * 38}ms`,
                      '--away-scale': awayTokenSize / 40,
                    } as React.CSSProperties
                  }
                >
                  <span className="berry-body">
                    <span className="berry-leaf" />
                    <span className="berry-shine" />
                    <span className="berry-face">
                      <i />
                      <i />
                    </span>
                    {token.value > 1 && <span className="crate-value">{display(token.value)}</span>}
                  </span>
                  {counted.includes(token.id) && (
                    <>
                      <span className="fruit-check">
                        <Check size={12} />
                      </span>
                      <span className="fruit-count-label">{display(ordinal)}</span>
                    </>
                  )}
                </button>
              );
            })}
            {individualSubtraction && mixed && (
              <div className="fruit-bowl bowl-away">
                <span>{problem.b} taken away</span>
              </div>
            )}
          </div>
          {(isDecimal || tokens.some((t) => t.value > 1)) && (
            <p className="crate-key">
              A labeled crate holds {isDecimal ? 'one whole (10 tenths)' : '10 or 100 berries'}.
              Little berries are {isDecimal ? 'one tenth' : 'one each'}.
            </p>
          )}
        </>
      )}
      {spokenCount !== null && (
        <div className="garden-counting-status">
          <span className="counting-bubble">
            <Volume2 size={17} />
            {finished ? 'We found it!' : 'Count with Milo'}
            <strong key={spokenCount}>{spokenCount}</strong>
          </span>
        </div>
      )}
      <div className="garden-result" aria-live="polite">
        {finished ? (
          <>
            <Sparkles size={17} />
            <strong>
              {isSubtraction
                ? `${problem.answer} left. You can see it!`
                : isFraction
                  ? `${problem.answer}/${problem.denominator} of the whole. Pieces make sense!`
                  : problem.skill === 'division'
                    ? `${problem.answer} in each basket. A fair share!`
                    : `${isDecimal ? problem.answer.toFixed(1) : problem.answer} altogether. That’s math magic!`}
            </strong>
          </>
        ) : (
          <span>
            {isGroups
              ? 'Watch each basket fill, one little group at a time.'
              : isFraction
                ? 'Same-size pieces can join the same whole.'
                : isSubtraction
                  ? 'Watch what stays when some go away.'
                  : 'Two little groups can become one big group.'}
          </span>
        )}
      </div>
      <button className="mix-button" onClick={toggle} disabled={solved}>
        {mixed ? <RotateCcw size={17} /> : <ArrowRightLeft size={18} />}
        {running
          ? 'Start counting again'
          : mixed
            ? 'Let’s see that again'
            : isSubtraction
              ? `Take away ${problem.b}`
              : isGroups
                ? problem.skill === 'division'
                  ? 'Share the berries!'
                  : 'Fill the baskets!'
                : isFraction
                  ? 'Put the pieces together!'
                  : 'Bring them together!'}
      </button>
    </div>
  );
}
