import { ArrowLeft, Hand } from 'lucide-react';
import { useSyncExternalStore, type ReactNode } from 'react';
import { Modal } from '../components';

const compactQuery = '(max-width: 1000px), (max-height: 780px)';
const compactSnapshot = () => window.matchMedia(compactQuery).matches;
const serverSnapshot = () => false;
function subscribeCompact(listener: () => void) {
  const query = window.matchMedia(compactQuery);
  query.addEventListener('change', listener);
  return () => query.removeEventListener('change', listener);
}

/** The same manipulatives get their own focused space when the playground is small. */
export default function MathSupport({
  children,
  open,
  onOpen,
  onClose,
}: {
  children: ReactNode;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const compact = useSyncExternalStore(subscribeCompact, compactSnapshot, serverSnapshot);
  if (!compact) return children;
  return (
    <>
      <button className="math-support-open" onClick={onOpen}>
        <Hand size={17} /> Count with Milo <span>Touch it. See it!</span>
      </button>
      {open && (
        <Modal title="Count with Milo" onClose={onClose} className="math-support-modal">
          <h2>Let’s see the math!</h2>
          {children}
          <button className="button primary full" onClick={onClose}>
            <ArrowLeft size={18} /> Back to my answer
          </button>
        </Modal>
      )}
    </>
  );
}
