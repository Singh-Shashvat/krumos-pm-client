import React from 'react';
import { useToast } from '../../context/ToastContext';
import type { Toast } from '../../types/toast';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

const ToastItem: React.FC<{ toast: Toast }> = ({ toast }) => {
  const { remove } = useToast();

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return (
          <CheckCircle className="text-success-green shrink-0" size={16} />
        );
      case 'error':
        return (
          <AlertTriangle className="text-orange-accent shrink-0" size={16} />
        );
      case 'info':
      default:
        return <Info className="text-bone/60 shrink-0" size={16} />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success':
        return 'border-success-green/50';
      case 'error':
        return 'border-orange-accent/50';
      case 'info':
      default:
        return 'border-white/10';
    }
  };

  return (
    <div
      role="alert"
      className={`flex items-start space-x-3 bg-dialog-bg text-dialog-fg border p-4 shadow-2xl max-w-sm w-full transition-all duration-300 transform translate-y-0 opacity-100 ${getBorderColor()}`}
    >
      {getIcon()}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-sans leading-relaxed text-dialog-fg break-words">
          {toast.message}
        </p>
      </div>
      <button
        onClick={() => remove(toast.id)}
        className="text-white/40 hover:text-white shrink-0 cursor-pointer focus:outline-none transition-colors"
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[999] flex flex-col space-y-2 w-full max-w-sm px-4 sm:px-0"
      aria-live="assertive"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
};
