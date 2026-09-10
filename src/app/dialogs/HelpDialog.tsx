import { ArrowRight, CircleHelp, Lightbulb } from 'lucide-react';
import { Modal } from '../../components';
export default function HelpDialog({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="A little help" onClose={onClose}>
      <div className="info-modal">
        <CircleHelp size={34} />
        <h1>A little help along the way.</h1>
        <div className="help-step">
          <span>1</span>
          <div>
            <h3>Follow your curiosity.</h3>
            <p>
              Pick your grade, then press “Let’s play” on the adventure map. The first chapter is
              ready for you.
            </p>
          </div>
        </div>
        <div className="help-step">
          <span>2</span>
          <div>
            <h3>Make a little math magic.</h3>
            <p>
              Drag berries into a basket, build a bridge, or share snacks equally. You can also tap
              an object, then its basket. Switch to Explore & answer to roam the park with Milo and
              use the big answer buttons.
            </p>
          </div>
        </div>
        <div className="help-step">
          <span>3</span>
          <div>
            <h3>Watch your story grow.</h3>
            <p>
              Finish five challenges to earn all three stars and a keepsake. Hints and retries never
              reduce your rewards. New chapters and buddies unlock as you explore.
            </p>
          </div>
        </div>
        <div className="milo-note">
          <Lightbulb size={28} />
          <p>
            Stuck? Ask for a hint. There are no timers, lost lives, or lost stars. Every try is a
            little step forward.
          </p>
        </div>
        <button className="button primary full" onClick={onClose}>
          I’m ready to explore
          <ArrowRight size={19} />
        </button>
      </div>
    </Modal>
  );
}
