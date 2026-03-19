'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
}

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center mx-auto w-full max-w-[400px] py-12 px-6',
        className,
      )}
    >
      {icon && (
        <div className="mb-4 text-slate-300 dark:text-slate-600" aria-hidden="true">
          {icon}
        </div>
      )}

      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-5">
          {description}
        </p>
      )}

      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className={cn(
            'inline-flex items-center justify-center h-9 px-4 rounded-[var(--radius-md)]',
            'text-sm font-medium transition-colors duration-150',
            'bg-[var(--color-brand-primary,#3b82f6)] text-white',
            'hover:bg-[var(--color-brand-primary-hover,#2563eb)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary,#3b82f6)] focus-visible:ring-offset-2',
          )}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
