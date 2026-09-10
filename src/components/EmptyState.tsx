import { Sparkles } from 'lucide-react';
export function EmptyState({
  title,
  text,
  action,
  onAction,
}: {
  title: string;
  text: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <div className="empty-state">
      <span className="empty-spark">
        <Sparkles size={32} />
      </span>
      <h2>{title}</h2>
      <p>{text}</p>
      <button className="button primary" onClick={onAction}>
        {action}
      </button>
    </div>
  );
}
