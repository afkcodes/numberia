import { Check, Feather, Footprints, RotateCw } from 'lucide-react';
import { Character } from '../../components';
import type { ReadingProgress } from '../../reading/progress';

export default function StoryPassport({ reading }: { reading: ReadingProgress }) {
  const count = reading.endings.length;
  return (
    <div className="sw-passport" aria-label="Your story passport">
      <div className="sw-passport-buddy">
        <Character
          name="Lumi"
          outfit={count >= 3 ? 'crown' : count === 2 ? 'explorer-hat' : 'bow'}
        />
        <div>
          <h3>Your story passport</h3>
          <p>
            {count === 3
              ? 'Three endings! Lumi earned her storyteller crown with you.'
              : `Lumi is collecting stories with you. ${count} of 3 endings discovered.`}
          </p>
        </div>
      </div>
      <ul className="sw-passport-stamps">
        {[
          { word: 'hops', label: 'The happy hopper', Icon: Footprints },
          { word: 'spins', label: 'The twirling tale', Icon: RotateCw },
          { word: 'tiptoes', label: 'The quiet adventure', Icon: Feather },
        ].map(({ word, label, Icon }) => (
          <li key={word} className={reading.endings.includes(word) ? 'collected' : ''}>
            <Icon size={24} />
            <div>
              <strong>{word}</strong>
              <span>{label}</span>
            </div>
            {reading.endings.includes(word) ? (
              <Check size={17} aria-label="Collected" />
            ) : (
              <span className="sw-uncollected">Try this ending</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
