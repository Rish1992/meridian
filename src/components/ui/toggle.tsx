'use client';

import React, { useId } from 'react';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  size?: 'sm' | 'md';
  className?: string;
  id?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  disabled = false,
  label,
  description,
  size = 'md',
  className,
  id,
}) => {
  const generatedId = useId();
  const toggleId = id ?? generatedId;

  // Size tokens
  // md: 44×24px track, 20px thumb (as per spec)
  // sm: 32×18px track, 14px thumb
  const trackClass = size === 'md' ? 'w-11 h-6' : 'w-8 h-[18px]';
  const thumbClass = size === 'md' ? 'w-5 h-5' : 'w-[14px] h-[14px]';
  const thumbTranslate = size === 'md'
    ? checked ? 'translate-x-5' : 'translate-x-0.5'
    : checked ? 'translate-x-[18px]' : 'translate-x-0.5';

  return (
    <div className={cn('flex items-start gap-3', className)}>
      <button
        id={toggleId}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          // Track
          'relative inline-flex shrink-0 items-center rounded-full border-2 border-transparent',
          'cursor-pointer transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2',
          trackClass,
          checked
            ? 'bg-[var(--color-brand-primary)] dark:bg-[var(--color-brand-primary)]'
            : 'bg-slate-200 dark:bg-slate-600',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none inline-block rounded-full bg-white shadow-sm',
            'transform transition-transform duration-150',
            thumbClass,
            thumbTranslate,
          )}
        />
      </button>

      {(label || description) && (
        <div className="flex flex-col gap-0.5">
          {label && (
            <label
              htmlFor={toggleId}
              className={cn(
                'text-sm font-medium leading-none cursor-pointer',
                'text-slate-700 dark:text-slate-200',
                disabled && 'opacity-50 cursor-not-allowed',
              )}
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

Toggle.displayName = 'Toggle';

export default Toggle;
