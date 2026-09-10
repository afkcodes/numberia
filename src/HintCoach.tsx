import { useEffect, useState } from 'react';
import { ArrowRight, Heart, Play, Volume2, X } from 'lucide-react';
import { Character } from './components';
import type { Problem } from './game';
import { speak, stopSpeaking } from './audio';

export default function HintCoach({ problem, sound, onDemonstrate, onClose, bridge = false }: { problem: Problem; sound: boolean; bridge?: boolean; onDemonstrate: () => void; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const { a, b, skill } = problem;
  const steps = bridge ? [
    `Pip needs a bridge with ${a} planks. ${b} ${b===1?'is':'are'} already here. Let’s find the missing part.`,
    `Think: ${b} plus how many makes ${a}? Fill the empty spaces with golden planks. Count only the new planks. Extra planks can stay in the tray.`,
    `Let’s build the missing part together. Watch Milo add planks, then check your bridge!`,
  ] : skill === 'addition' ? [
    `Hi, friend! Let's find ${a} plus ${b} together. We can use the berries to help us.`,
    `Start with ${a}. Now we're adding ${b} more. Tap every berry. I'll say each number with you, and we'll find the total together.`,
    `Let's bring the two groups together. Watch the berries fly into one big group!`,
  ] : skill === 'subtraction' ? [
    `You've got this! We start with ${a} and take away ${b}. Let's see what stays.`,
    a <= 10 ? `Find ${a} berries. When ${b} go away, count just the berries that are still here.` : `We can take away the tens first, then the ones. Small steps make a big problem easier.`,
    `Ready? Let's watch ${b} go away. Then we'll see how many are left.`,
  ] : skill === 'multiplication' ? [
    `Let's make a little picnic! ${a} times ${b} means ${a} equal groups with ${b} in each.`,
    `Each basket gets ${b} berries. Try counting by ${b}: ${b}, ${b * 2}, ${b * 3}...`,
    `Let's fill those ${a} baskets together. Watch how the groups grow!`,
  ] : skill === 'division' ? [
    `Let's share! We have ${a} berries and ${b} baskets. Everyone should get the same amount.`,
    `Imagine putting one berry in each basket, then going around again. Keep every basket equal.`,
    `Let's share all ${a} berries. Count the berries in just one basket for your answer.`,
  ] : skill === 'fractions' ? [
    `These are pieces of a whole! Both wholes have ${problem.denominator} equal pieces.`,
    `The pieces are the same size, so add the top numbers: ${a} plus ${b}. Keep ${problem.denominator} on the bottom.`,
    `Let's join the colored pieces. How much of the whole have we made?`,
  ] : [
    `Let's explore these little numbers! The digit after the dot counts tenths.`,
    `Ten tenths make one whole. Line up the dots and add the tenths, then the whole numbers.`,
    `Let's bring the crates and little berries together. Each little berry is one tenth!`,
  ];
  const say = () => {
    if (!sound) return;
    speak(steps[step]);
  };
  useEffect(() => {
    if (sound) say();
    return () => stopSpeaking();
    // The voice follows each distinct coaching step, never unrelated game renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, sound]);
  return <aside className="hint-coach" aria-label="Milo’s helping hand"><div className="coach-character"><Character /><span className="coach-heart"><Heart size={19} fill="currentColor" /></span></div><div className="coach-bubble"><button className="coach-close" aria-label="Hide Milo’s help" onClick={onClose}><X size={17} /></button><span className="coach-label"><Heart size={13} />MILO’S GOT YOUR BACK</span><p key={step} aria-live="polite">{steps[step]}</p><div className="coach-actions">{<button disabled={!sound} className="coach-listen" aria-label="Hear Milo’s hint" onClick={say}><Volume2 size={19} /></button>}<span className="coach-dots" aria-label={`Step ${step + 1} of 3`}>{steps.map((_, i) => <i key={i} className={i === step ? 'active' : ''} />)}</span><button className="coach-next" onClick={() => { if (step < 2) setStep(s => s + 1); else onDemonstrate(); }}>{step < 2 ? <>Let’s try together<ArrowRight size={15} /></> : <>Show me the magic<Play size={15} fill="currentColor" /></>}</button></div></div></aside>;
}
