import { Star } from 'lucide-react';
export function Stars({ count, size = 15 }: { count: number; size?: number }) {
  return (
    <span className="stars" aria-label={`${count} out of 3 stars`}>
      {[1, 2, 3].map((n) => (
        <Star key={n} size={size} className={n <= count ? 'earned' : ''} />
      ))}
    </span>
  );
}
