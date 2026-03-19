'use client';

import React, { useEffect, useRef, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface MetricTrend {
  direction: 'up' | 'down' | 'flat';
  value: string;
  isPositive: boolean;
}

export interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: MetricTrend;
  icon?: React.ReactNode;
  formatter?: (v: number) => string;
  sparklineData?: number[];
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Count-up hook
// ─────────────────────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 800): number {
  const [current, setCurrent] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(eased * target));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return current;
}

// ─────────────────────────────────────────────────────────────────────────────
// Trend Badge
// ─────────────────────────────────────────────────────────────────────────────

function TrendBadge({ trend }: { trend: MetricTrend }) {
  const Icon =
    trend.direction === 'up'
      ? TrendingUp
      : trend.direction === 'down'
      ? TrendingDown
      : Minus;

  const colorClass = trend.isPositive
    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
    : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        colorClass,
      )}
    >
      <Icon className="w-3 h-3 shrink-0" />
      {trend.value}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sparkline
// ─────────────────────────────────────────────────────────────────────────────

function Sparkline({ data }: { data: number[] }) {
  const chartData = data.map((v) => ({ v }));
  return (
    <div className="w-20 h-8 shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-brand-primary, #3b82f6)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--color-brand-primary, #3b82f6)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke="var(--color-brand-primary, #3b82f6)"
            strokeWidth={1.5}
            fill="url(#sparkGrad)"
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function MetricCard({
  label,
  value,
  trend,
  icon,
  formatter,
  sparklineData,
  className,
}: MetricCardProps) {
  const isNumeric = typeof value === 'number';
  const animatedValue = useCountUp(isNumeric ? value : 0, 800);
  const displayValue = isNumeric
    ? formatter
      ? formatter(animatedValue)
      : animatedValue.toLocaleString()
    : value;

  return (
    <div
      className={cn(
        'relative flex flex-col gap-3 rounded-[var(--radius-md)] bg-white dark:bg-slate-900',
        'border border-slate-200 dark:border-slate-700',
        'p-5 shadow-xs overflow-hidden min-w-0',
        'transition-all duration-150 hover:shadow-md hover:-translate-y-px',
        className,
      )}
    >
      {/* Top row: label + icon */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate min-w-0">
          {label}
        </span>
        {icon && (
          <span className="text-slate-400 dark:text-slate-500 shrink-0">{icon}</span>
        )}
      </div>

      {/* Value */}
      <p className="font-mono text-2xl xl:text-[28px] font-bold leading-none text-slate-900 dark:text-white tabular-nums break-all">
        {displayValue}
      </p>

      {/* Bottom row: trend + sparkline */}
      <div className="flex items-end justify-between gap-2">
        {trend && <TrendBadge trend={trend} />}
        {sparklineData && sparklineData.length > 0 && (
          <Sparkline data={sparklineData} />
        )}
      </div>
    </div>
  );
}

export default MetricCard;
