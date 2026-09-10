import { X } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
export function Modal({
  title,
  children,
  onClose,
  className = '',
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className={`modal ${className}`}
      aria-label={title}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-inner">
        <button className="icon-button modal-close" aria-label="Close dialog" onClick={onClose}>
          <X size={21} />
        </button>
        {children}
      </div>
    </dialog>
  );
}
