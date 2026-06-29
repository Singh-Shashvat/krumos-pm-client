import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string; // If set, user must type this exact string to enable confirm button
  confirmButtonText?: string;
  cancelButtonText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  showInput?: boolean;
  inputPlaceholder?: string;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText,
  confirmButtonText = 'CONFIRM',
  cancelButtonText = 'CANCEL',
  onConfirm,
  onCancel,
  showInput = false,
  inputPlaceholder = 'Type here...',
}) => {
  const [inputValue, setInputValue] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  // Trap focus and handle escape key
  useEffect(() => {
    if (!isOpen) return;

    // Save previous active focus
    previousFocus.current = document.activeElement as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
        return;
      }

      if (e.key === 'Tab') {
        if (!dialogRef.current) return;
        const focusableElements =
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    // Focus first focusable element (input if present, cancel button if not)
    setTimeout(() => {
      if (dialogRef.current) {
        const input = dialogRef.current.querySelector('input');
        if (input) {
          input.focus();
        } else {
          const buttons = dialogRef.current.querySelectorAll('button');
          if (buttons.length > 1) {
            buttons[1].focus(); // Typically cancel button
          }
        }
      }
    }, 50);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previousFocus.current) {
        previousFocus.current.focus();
      }
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const isConfirmDisabled =
    (confirmText && inputValue !== confirmText) ||
    (showInput && !confirmText && !inputValue.trim());

  const handleConfirmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfirmDisabled) {
      onConfirm();
      setInputValue('');
    }
  };

  return (
    <div
      className="fixed inset-0 krumos-overlay flex items-center justify-center z-[999] p-4 select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-desc"
    >
      <div
        ref={dialogRef}
        className="bg-dialog-bg text-dialog-fg border border-dialog-border max-w-md w-full p-6 space-y-6 shadow-2xl relative"
      >
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 text-white/50 hover:text-white hover:bg-white/5 p-1 rounded-none border border-transparent hover:border-white/10 transition-all cursor-pointer"
          aria-label="Close dialog"
        >
          <X size={16} />
        </button>

        <div className="space-y-2">
          <span className="krumos-eyebrow text-[9px] text-orange-accent">
            SYSTEM CONFIRMATION
          </span>
          <h2
            id="confirm-dialog-title"
            className="text-lg font-bold font-mono tracking-wider uppercase"
          >
            {title}
          </h2>
        </div>

        <p
          id="confirm-dialog-desc"
          className="text-xs text-white/70 leading-relaxed font-sans"
        >
          {message}
        </p>

        <form onSubmit={handleConfirmSubmit} className="space-y-4">
          {(showInput || confirmText) && (
            <div className="space-y-2">
              {confirmText && (
                <p className="text-[10px] text-white/40 italic font-mono">
                  Please enter{' '}
                  <strong className="text-white select-all">
                    {confirmText}
                  </strong>{' '}
                  to authorize:
                </p>
              )}
              <input
                type="text"
                required
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={inputPlaceholder}
                className="w-full bg-white/5 border border-white/20 px-3 py-2 text-xs font-sans text-dialog-fg focus:outline-none focus:border-orange-accent"
              />
            </div>
          )}

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={() => {
                onCancel();
                setInputValue('');
              }}
              className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 py-2.5 krumos-mono-btn text-[10px]"
            >
              {cancelButtonText}
            </button>
            <button
              type="submit"
              disabled={!!isConfirmDisabled}
              className="flex-1 bg-bone text-ink hover:bg-bone-dark py-2.5 krumos-mono-btn text-[10px] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {confirmButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
