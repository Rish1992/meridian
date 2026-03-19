'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface StatComparisonRowProps {
  label: string;
  current: number;
  previous: number;
  formatter?: (value: number) => string;
  /** When true, a decrease is shown as positive (e.g. lower processing time = good) */
  invertColor?: boolean;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function calcChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function StatComparisonRow({
  label,
  current,
  previous,
  formatter,
  invertColor = false,
  className,
}: StatComparisonRowProps) {
  const fmt = formatter ?? ((v: number) => v.toLocaleString());
  const change = calcChange(current, previous);

  let direction: 'up' | 'down' | 'flat' = 'flat';
  if (change !== null) {
    if (change > 0.01) direction = 'up';
    else if (change < -0.01) direction = 'down';
  }

  // Determine if the change is visually positive (green) or negative (red)
  const isPositive = invertColor ? direction === 'down' : direction === 'up';
  const isNegative = invertColor ? direction === 'up' : direction === 'down';

  const ChangeIcon =
    direction === 'up' ? TrendingUp : direction === 'down' ? TrendingDown : Minus;

  const changeColorClass = isPositive
    ? 'text-emerald-600 dark:text-emerald-400'
    : isNegative
    ? 'text-red-600 dark:text-red-400'
    : 'text-slate-400 dark:text-slate-500';

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0',
        className,
      )}
    >
      {/* Label */}
      <span className="text-sm text-slate-600 dark:text-slate-400 truncate">{label}</span>

      <div className="flex items-center gap-3 shrink-0">
        {/* Previous (dimmed) */}
        <span className="text-sm text-slate-400 dark:text-slate-500 tabular-nums line-through">
          {fmt(previous)}
        </span>

        {/* Current */}
        <span className="text-sm font-semibold text-slate-900 dark:text-white tabular-nums">
          {fmt(current)}
        </span>

        {/* % change */}
        {change !== null && (
          <span className={cn('inline-flex items-center gap-0.5 text-xs font-medium tabular-nums', changeColorClass)}>
            <ChangeIcon className="w-3 h-3 shrink-0" aria-hidden="true" />
            {Math.abs(change) < 0.1 ? '<0.1' : Math.abs(change).toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
}

export default StatComparisonRow;
