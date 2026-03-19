'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'icon-only';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  fullWidth?: boolean;
  children?: React.ReactNode;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Spinner
// ─────────────────────────────────────────────────────────────────────────────

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn('animate-spin', className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Variant styles
// ─────────────────────────────────────────────────────────────────────────────

const variantClasses: Record<ButtonVariant, string> = {
  primary: [
    'bg-[var(--color-brand-primary)] text-white',
    'hover:bg-[var(--color-brand-primary-hover)]',
    'focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2',
    'dark:bg-[var(--color-brand-primary)] dark:hover:bg-[var(--color-brand-primary-hover)]',
  ].join(' '),

  secondary: [
    'bg-white text-slate-700 border border-slate-300',
    'hover:bg-slate-50 hover:border-slate-400',
    'focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2',
    'dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600',
    'dark:hover:bg-slate-700 dark:hover:border-slate-500',
  ].join(' '),

  ghost: [
    'bg-transparent text-slate-700',
    'hover:bg-slate-100',
    'focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2',
    'dark:text-slate-300 dark:hover:bg-slate-800',
  ].join(' '),

  danger: [
    'bg-[var(--color-danger)] text-white',
    'hover:bg-red-600',
    'focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2',
    'dark:bg-[var(--color-danger)] dark:hover:bg-red-400',
  ].join(' '),

  success: [
    'bg-[var(--color-success)] text-white',
    'hover:bg-emerald-600',
    'focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2',
    'dark:bg-[var(--color-success)] dark:hover:bg-emerald-400',
  ].join(' '),

  'icon-only': [
    'bg-transparent text-slate-500 p-0',
    'hover:bg-slate-100 hover:text-slate-700',
    'focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)] focus-visible:ring-offset-2',
    'dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200',
  ].join(' '),
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-5 text-base gap-2',
};

const iconSizeClasses: Record<ButtonSize, string> = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

const iconOnlySizeClasses: Record<ButtonSize, string> = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      icon,
      iconPosition = 'left',
      isLoading = false,
      disabled = false,
      fullWidth = false,
      children,
      className,
      type = 'button',
      ...rest
    },
    ref,
  ) => {
    const isIconOnly = variant === 'icon-only';
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cn(
          // Base
          'inline-flex items-center justify-center font-medium rounded-[var(--radius-md)]',
          'transition-all duration-150 cursor-pointer select-none whitespace-nowrap',
          'active:scale-[0.98]',
          // Disabled
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          // Variant
          variantClasses[variant],
          // Size — icon-only gets square sizing
          isIconOnly ? iconOnlySizeClasses[size] : sizeClasses[size],
          // Full width
          fullWidth && 'w-full',
          className,
        )}
        {...rest}
      >
        {isLoading ? (
          <>
            <Spinner className={iconSizeClasses[size]} />
            {!isIconOnly && children && (
              <span className="ml-1">{children}</span>
            )}
          </>
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <span className={cn('shrink-0', iconSizeClasses[size])}>{icon}</span>
            )}
            {!isIconOnly && children}
            {icon && iconPosition === 'right' && (
              <span className={cn('shrink-0', iconSizeClasses[size])}>{icon}</span>
            )}
            {isIconOnly && icon && (
              <span className={cn('shrink-0', iconSizeClasses[size])}>{icon}</span>
            )}
          </>
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';

export default Button;
