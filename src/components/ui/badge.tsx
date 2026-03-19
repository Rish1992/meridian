'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'teal' | 'rose';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children?: React.ReactNode;
  dot?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Variant styles
// ─────────────────────────────────────────────────────────────────────────────

const variantClasses: Record<BadgeVariant, string> = {
  default: [
    'bg-slate-100 text-slate-700',
    'dark:bg-slate-700 dark:text-slate-300',
  ].join(' '),

  success: [
    'bg-[var(--color-success-surface)] text-[var(--color-success-text)]',
    'dark:bg-[var(--color-success-surface)] dark:text-[var(--color-success-text)]',
  ].join(' '),

  warning: [
    'bg-[var(--color-warning-surface)] text-[var(--color-warning-text)]',
    'dark:bg-[var(--color-warning-surface)] dark:text-[var(--color-warning-text)]',
  ].join(' '),

  danger: [
    'bg-[var(--color-danger-surface)] text-[var(--color-danger-text)]',
    'dark:bg-[var(--color-danger-surface)] dark:text-[var(--color-danger-text)]',
  ].join(' '),

  info: [
    'bg-[var(--color-info-surface)] text-[var(--color-info-text)]',
    'dark:bg-[var(--color-info-surface)] dark:text-[var(--color-info-text)]',
  ].join(' '),

  purple: [
    'bg-[var(--color-purple-surface)] text-[var(--color-purple-text)]',
    'dark:bg-[var(--color-purple-surface)] dark:text-[var(--color-purple-text)]',
  ].join(' '),

  teal: [
    'bg-[var(--color-teal-surface)] text-[var(--color-teal-text)]',
    'dark:bg-[var(--color-teal-surface)] dark:text-[var(--color-teal-text)]',
  ].join(' '),

  rose: [
    'bg-[var(--color-rose-surface)] text-[var(--color-rose-text)]',
    'dark:bg-[var(--color-rose-surface)] dark:text-[var(--color-rose-text)]',
  ].join(' '),
};

const dotVariantClasses: Record<BadgeVariant, string> = {
  default:  'bg-slate-400 dark:bg-slate-500',
  success:  'bg-[var(--color-success)]',
  warning:  'bg-[var(--color-warning)]',
  danger:   'bg-[var(--color-danger)]',
  info:     'bg-[var(--color-info)]',
  purple:   'bg-[var(--color-purple)]',
  teal:     'bg-[var(--color-teal)]',
  rose:     'bg-[var(--color-rose)]',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs gap-1',
  md: 'px-2.5 py-1 text-xs gap-1.5',
};

const dotSizeClasses: Record<BadgeSize, string> = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
};

const iconSizeClasses: Record<BadgeSize, string> = {
  sm: 'w-3 h-3',
  md: 'w-3.5 h-3.5',
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  children,
  dot = false,
  icon,
  className,
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
    >
      {dot && (
        <span
          className={cn(
            'rounded-full shrink-0',
            dotVariantClasses[variant],
            dotSizeClasses[size],
          )}
          aria-hidden="true"
        />
      )}
      {!dot && icon && (
        <span className={cn('shrink-0', iconSizeClasses[size])} aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </span>
  );
};

Badge.displayName = 'Badge';

export default Badge;
