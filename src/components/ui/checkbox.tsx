'use client';

import React, { useId, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  indeterminate?: boolean;
  className?: string;
  id?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  indeterminate = false,
  className,
  id,
}) => {
  const generatedId = useId();
  const checkboxId = id ?? generatedId;
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle indeterminate state (not a standard HTML attribute, must be set via JS)
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const isCheckedOrIndeterminate = checked || indeterminate;

  return (
    <div className={cn('flex items-start gap-2.5', className)}>
      <div className="relative flex items-center justify-center mt-0.5">
        <input
          ref={inputRef}
          id={checkboxId}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <button
          type="button"
          role="checkbox"
          aria-checked={indeterminate ? 'mixed' : checked}
          disabled={disabled}
          onClick={() => !disabled && onChange(!checked)}
          className={cn(
            // 18px square box
            'w-[18px] h-[18px] rounded-[4px] border-2 flex items-center justify-center',
            'transition-all duration-150 cursor-pointer shrink-0',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2',
            isCheckedOrIndeterminate
              ? 'bg-[var(--color-brand-primary)] border-[var(--color-brand-primary)]'
              : 'bg-white border-slate-300 hover:border-[var(--color-brand-primary)] dark:bg-slate-800 dark:border-slate-600 dark:hover:border-[var(--color-brand-primary)]',
            disabled && 'opacity-50 cursor-not-allowed',
          )}
          aria-label={label}
        >
          {indeterminate ? (
            // Indeterminate dash
            <span className="w-2.5 h-0.5 bg-white rounded-full" aria-hidden="true" />
          ) : checked ? (
            // Check icon
            <svg
              className="w-3 h-3 text-white"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="2,6 5,9 10,3" />
            </svg>
          ) : null}
        </button>
      </div>

      {(label || description) && (
        <div className="flex flex-col gap-0.5">
          {label && (
            <label
              htmlFor={checkboxId}
              className={cn(
                'text-sm font-medium leading-none cursor-pointer select-none',
                'text-slate-700 dark:text-slate-200',
                disabled && 'opacity-50 cursor-not-allowed',
              )}
              onClick={() => !disabled && onChange(!checked)}
            >
              {label}
            </label>
          )}
          {description && (
            <p className={cn('text-xs text-slate-500 dark:text-slate-400', disabled && 'opacity-50')}>
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

Checkbox.displayName = 'Checkbox';

export default Checkbox;
