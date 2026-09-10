import { Check, Flower2, GraduationCap, Sparkles, Sprout, Star, Sun, Trees } from 'lucide-react';
import { gradeLabel, type Grade } from './game';

const levels = [
  { icon: Sprout, title: 'Little sprouts', description: 'Count, add & explore', color: 'mint' },
  { icon: Sun, title: 'Sunny explorers', description: 'Addition & subtraction', color: 'yellow' },
  { icon: Flower2, title: 'Brilliant bloomers', description: 'Bigger number adventures', color: 'peach' },
  { icon: Trees, title: 'Wonder wanderers', description: 'Multiply & share', color: 'blue' },
  { icon: Star, title: 'Magic makers', description: 'Build your number power', color: 'lilac' },
  { icon: Sparkles, title: 'Star adventurers', description: 'Fractions & decimals, too', color: 'rose' },
];

export default function GradePicker({ grade, onSelect, compact = false }: { grade: Grade; onSelect: (grade: Grade) => void; compact?: boolean }) {
  return <fieldset className={`grade-picker ${compact ? 'grade-picker-compact' : ''}`}><legend><GraduationCap size={18} />{compact ? 'Your learning level' : 'Pick your place to grow'}</legend><div className="grade-cards">{levels.map((level, i) => <button type="button" key={i} className={`grade-card grade-${level.color} ${grade === i ? 'is-selected' : ''}`} aria-label={gradeLabel(i as Grade)} aria-pressed={grade === i} onClick={() => onSelect(i as Grade)}>
    <span className="grade-card-top"><level.icon size={21} /><span className="grade-card-check">{grade === i && <Check size={15} strokeWidth={3} />}</span></span>
    <span className="grade-card-number">{i === 0 ? 'K' : i}</span><strong>{gradeLabel(i as Grade)}</strong>{!compact && <><span className="grade-card-title">{level.title}</span><small>{level.description}</small></>}
  </button>)}</div></fieldset>;
}
