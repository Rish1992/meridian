'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  helpText?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  required?: boolean;
  type?: string;
  className?: string;
}

export interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string, event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
  helpText?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  rows?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// TextInput component
// ─────────────────────────────────────────────────────────────────────────────

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      label,
      placeholder,
      value,
      onChange,
      error,
      helpText,
      icon,
      disabled = false,
      required = false,
      type = 'text',
      className,
      id,
      ...rest
    },
    ref,
  ) => {
    const inputId = id ?? (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className={cn('flex flex-col gap-1.5', className)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            {label}
            {required && (
              <span className="ml-0.5 text-[var(--color-danger)]" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative flex items-center">
          {icon && (
            <span className="absolute left-3 flex items-center justify-center text-slate-400 dark:text-slate-500 pointer-events-none w-4 h-4">
              {icon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            type={type}
            value={value}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            onChange={(e) => onChange?.(e.target.value, e)}
            className={cn(
              // Base
              'w-full h-10 rounded-[var(--radius-md)] border text-sm font-normal',
              'bg-white text-slate-900 placeholder:text-slate-400',
              'transition-all duration-150',
              // Border default
              'border-slate-300',
              // Focus
              'focus:outline-none focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20',
              // Error
              error
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                : '',
              // Disabled
              'disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed disabled:border-slate-200',
              // Icon padding
              icon ? 'pl-9 pr-3' : 'px-3',
              // Dark mode
              'dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500',
              'dark:border-slate-600',
              'dark:focus:border-[var(--color-brand-primary)] dark:focus:ring-[var(--color-brand-primary)]/30',
              error ? 'dark:border-red-500' : '',
              'dark:disabled:bg-slate-900 dark:disabled:text-slate-600 dark:disabled:border-slate-700',
            )}
            {...rest}
          />
        </div>

        {error && (
          <p className="text-xs text-[var(--color-danger)] dark:text-red-400" role="alert">
            {error}
          </p>
        )}
        {!error && helpText && (
          <p className="text-xs text-slate-500 dark:text-slate-400">{helpText}</p>
        )}
      </div>
    );
  },
);

TextInput.displayName = 'TextInput';

// ─────────────────────────────────────────────────────────────────────────────
// Textarea component
// ─────────────────────────────────────────────────────────────────────────────

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      placeholder,
      value,
      onChange,
      error,
      helpText,
      disabled = false,
      required = false,
      className,
      rows = 4,
      id,
      ...rest
    },
    ref,
  ) => {
    const inputId = id ?? (label ? `textarea-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className={cn('flex flex-col gap-1.5', className)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            {label}
            {required && (
              <span className="ml-0.5 text-[var(--color-danger)]" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <textarea
          ref={ref}
          id={inputId}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          rows={rows}
          onChange={(e) => onChange?.(e.target.value, e)}
          className={cn(
            'w-full rounded-[var(--radius-md)] border text-sm font-normal px-3 py-2.5',
            'bg-white text-slate-900 placeholder:text-slate-400',
            'transition-all duration-150 resize-y',
            'border-slate-300',
            'focus:outline-none focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20',
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : '',
            'disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed disabled:border-slate-200 disabled:resize-none',
            'dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500',
            'dark:border-slate-600',
            'dark:focus:border-[var(--color-brand-primary)] dark:focus:ring-[var(--color-brand-primary)]/30',
            error ? 'dark:border-red-500' : '',
            'dark:disabled:bg-slate-900 dark:disabled:text-slate-600 dark:disabled:border-slate-700',
          )}
          {...rest}
        />

        {error && (
          <p className="text-xs text-[var(--color-danger)] dark:text-red-400" role="alert">
            {error}
          </p>
        )}
        {!error && helpText && (
          <p className="text-xs text-slate-500 dark:text-slate-400">{helpText}</p>
        )}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';

export default TextInput;
