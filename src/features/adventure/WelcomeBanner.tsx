import { ArrowRight } from 'lucide-react';
import { type Save } from '../../game';
export default function WelcomeBanner({ save, onStart }: { save: Save; onStart: () => void }) {
  return (
    <section className="welcome-banner">
      <div className="welcome-copy">
        <span className="welcome-eyebrow">
          <span />A LITTLE MATH. A LOT OF MAGIC.
        </span>
        <h1>
          {save.runs.length
            ? `Welcome back, ${save.name === 'Explorer' ? 'explorer' : save.name}!`
            : 'A big adventure starts small.'}
        </h1>
        <p>
          The forest is full of stories. And you’re the missing piece.
          <br />
          <span>Ready to make a little magic?</span>
        </p>
        <button className="welcome-link" onClick={onStart}>
          Your adventure is waiting
          <ArrowRight size={17} />
        </button>
      </div>
      <div className="welcome-art">
        <span className="hero-flower flower-one">✳</span>
        <span className="hero-flower flower-two">✳</span>
        <img
          src="/art/explorers.png"
          alt="A smiling young explorer with Milo the fox and Pip the little dragon"
        />
        <span className="hello-sticker">Oh, hello you!</span>
      </div>
    </section>
  );
}
