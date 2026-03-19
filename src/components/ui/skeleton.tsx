'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type SkeletonVariant = 'line' | 'circle' | 'rectangle';

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  variant?: SkeletonVariant;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  className,
  variant = 'line',
}) => {
  const style: React.CSSProperties = {};

  if (width !== undefined) {
    style.width = typeof width === 'number' ? `${width}px` : width;
  }
  if (height !== undefined) {
    style.height = typeof height === 'number' ? `${height}px` : height;
  }

  const variantClasses: Record<SkeletonVariant, string> = {
    line: 'rounded-[var(--radius-sm)] h-4',
    circle: 'rounded-full aspect-square',
    rectangle: 'rounded-[var(--radius-md)]',
  };

  return (
    <div
      role="status"
      aria-label="Loading…"
      style={style}
      className={cn(
        'shimmer-bg',
        variantClasses[variant],
        // Default widths when not specified
        !width && variant !== 'circle' && 'w-full',
        !width && variant === 'circle' && 'w-10',
        !height && variant === 'circle' && 'h-10',
        !height && variant === 'rectangle' && 'h-24',
        className,
      )}
    />
  );
};

Skeleton.displayName = 'Skeleton';

// ─────────────────────────────────────────────────────────────────────────────
// Compound helpers
// ─────────────────────────────────────────────────────────────────────────────

export const SkeletonText: React.FC<{
  lines?: number;
  className?: string;
  lastLineWidth?: string;
}> = ({ lines = 3, className, lastLineWidth = '60%' }) => (
  <div className={cn('flex flex-col gap-2', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        variant="line"
        width={i === lines - 1 ? lastLineWidth : undefined}
      />
    ))}
  </div>
);

SkeletonText.displayName = 'SkeletonText';

export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('flex flex-col gap-3 p-4 rounded-[var(--radius-lg)] border border-slate-200 dark:border-slate-700', className)}>
    <div className="flex items-center gap-3">
      <Skeleton variant="circle" width={40} height={40} />
      <div className="flex-1 flex flex-col gap-2">
        <Skeleton variant="line" width="60%" />
        <Skeleton variant="line" width="40%" height={12} />
      </div>
    </div>
    <SkeletonText lines={3} />
  </div>
);

SkeletonCard.displayName = 'SkeletonCard';

export default Skeleton;
