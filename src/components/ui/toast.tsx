'use client';

import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useUIStore, type Toast } from '@/stores/ui-store';

// ─────────────────────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────────────────────

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function XCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ExclamationTriangleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function InformationCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function XMarkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-variant config
// ─────────────────────────────────────────────────────────────────────────────

interface ToastTypeConfig {
  accent: string;
  iconColor: string;
  icon: React.ComponentType<{ className?: string }>;
}

const typeConfig: Record<Toast['type'], ToastTypeConfig> = {
  success: {
    accent: 'bg-emerald-500',
    iconColor: 'text-emerald-500',
    icon: CheckCircleIcon,
  },
  error: {
    accent: 'bg-red-500',
    iconColor: 'text-red-500',
    icon: XCircleIcon,
  },
  warning: {
    accent: 'bg-amber-500',
    iconColor: 'text-amber-500',
    icon: ExclamationTriangleIcon,
  },
  info: {
    accent: 'bg-blue-500',
    iconColor: 'text-blue-500',
    icon: InformationCircleIcon,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Single Toast item
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_DURATION = 5000;

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const config = typeConfig[toast.type];
  const Icon = config.icon;
  const duration = toast.duration ?? DEFAULT_DURATION;

  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(() => onRemove(toast.id), duration);
    return () => clearTimeout(timer);
  }, [toast.id, duration, onRemove]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={cn(
        'relative flex items-start gap-3 w-full max-w-sm',
        'bg-white dark:bg-slate-800',
        'rounded-[var(--radius-md)] shadow-lg',
        'overflow-hidden',
        'animate-[slideInRight_0.25s_ease-out]',
        'border border-slate-100 dark:border-slate-700',
      )}
    >
      {/* 4px left accent bar */}
      <span
        aria-hidden="true"
        className={cn('absolute left-0 top-0 bottom-0 w-1 shrink-0', config.accent)}
      />

      {/* Content */}
      <div className="flex items-start gap-3 flex-1 min-w-0 pl-4 pr-3 py-3">
        <Icon className={cn('w-5 h-5 shrink-0 mt-0.5', config.iconColor)} />
        <p className="flex-1 text-sm text-slate-700 dark:text-slate-200 leading-snug">
          {toast.message}
        </p>
      </div>

      {/* Close button */}
      <button
        type="button"
        onClick={() => onRemove(toast.id)}
        aria-label="Dismiss notification"
        className={cn(
          'shrink-0 self-start mt-2 mr-2 p-1 rounded',
          'text-slate-400 hover:text-slate-600 hover:bg-slate-100',
          'dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-slate-700',
          'transition-colors duration-150',
        )}
      >
        <XMarkIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Container
// ─────────────────────────────────────────────────────────────────────────────

const MAX_VISIBLE = 3;

export const ToastContainer: React.FC = () => {
  const toasts = useUIStore((s) => s.toasts);
  const removeToast = useUIStore((s) => s.removeToast);

  // Show only the last MAX_VISIBLE toasts
  const visible = toasts.slice(-MAX_VISIBLE);

  if (visible.length === 0) return null;

  return (
    <div
      aria-label="Notifications"
      className={cn(
        'fixed bottom-4 right-4 z-[9999]',
        'flex flex-col gap-2 items-end',
      )}
    >
      {visible.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};

ToastContainer.displayName = 'ToastContainer';

export default ToastContainer;
