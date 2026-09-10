import { Sprout } from 'lucide-react';
export function Logo() {
  return (
    <span className="brand">
      <span className="brand-mark">
        n<Sprout size={17} strokeWidth={3} />
      </span>
      <span>
        numberia<span className="brand-dot">.</span>
      </span>
    </span>
  );
}
