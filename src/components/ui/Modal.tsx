import React from 'react';
import { clsx } from 'clsx';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-ink-900/45 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        <div
          className={clsx(
            'glass-panel relative w-full transform rounded-[28px] p-6 transition-all sm:p-7',
            sizeClasses[size]
          )}
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl text-ink-400 hover:bg-slate-100 hover:text-ink-700"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>

          {title && (
            <div className="mb-5">
              <h3 className="text-xl font-bold text-ink-900">{title}</h3>
            </div>
          )}

          <div>{children}</div>
        </div>
      </div>
    </div>
  );
};
