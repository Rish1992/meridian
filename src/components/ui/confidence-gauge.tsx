'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { getConfidenceColor } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ConfidenceGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  variant?: 'bar' | 'ring' | 'inline';
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Animated width hook
// ─────────────────────────────────────────────────────────────────────────────

function useAnimatedValue(target: number, duration = 600): number {
  const [current, setCurrent] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(eased * target);
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
// Gradient helpers (inline style, avoids purging issues)
// ─────────────────────────────────────────────────────────────────────────────

function getGradientStyle(score: number): React.CSSProperties {
  if (score >= 85) {
    return { background: 'linear-gradient(90deg, #10b981, #34d399)' };
  }
  if (score >= 60) {
    return { background: 'linear-gradient(90deg, #f59e0b, #fbbf24)' };
  }
  return { background: 'linear-gradient(90deg, #ef4444, #f87171)' };
}

function getRingColor(score: number): string {
  if (score >= 85) return '#10b981';
  if (score >= 60) return '#f59e0b';
  return '#ef4444';
}

// ─────────────────────────────────────────────────────────────────────────────
// Bar variant
// ─────────────────────────────────────────────────────────────────────────────

function BarGauge({
  score,
  size,
  showLabel,
}: {
  score: number;
  size: 'sm' | 'md' | 'lg';
  showLabel: boolean;
}) {
  const animated = useAnimatedValue(score, 600);
  const colors = getConfidenceColor(score);
  const trackH = size === 'sm' ? 'h-1' : size === 'lg' ? 'h-3' : 'h-2';

  return (
    <div className="flex items-center gap-2 w-full">
      <div className={cn('flex-1 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden', trackH)}>
        <div
          className="h-full rounded-full transition-none"
          style={{ width: `${animated}%`, ...getGradientStyle(score) }}
        />
      </div>
      {showLabel && (
        <span className={cn('tabular-nums font-medium shrink-0', colors.text, size === 'sm' ? 'text-xs' : 'text-sm')}>
          {Math.round(score)}%
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Ring variant
// ─────────────────────────────────────────────────────────────────────────────

function RingGauge({
  score,
  size,
  showLabel,
}: {
  score: number;
  size: 'sm' | 'md' | 'lg';
  showLabel: boolean;
}) {
  const animated = useAnimatedValue(score, 600);
  const dim = size === 'sm' ? 36 : size === 'lg' ? 64 : 48;
  const strokeW = size === 'sm' ? 3 : size === 'lg' ? 5 : 4;
  const radius = (dim - strokeW * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animated / 100) * circumference;
  const color = getRingColor(score);
  const colors = getConfidenceColor(score);
  const labelSize = size === 'sm' ? 'text-[9px]' : size === 'lg' ? 'text-sm' : 'text-[11px]';

  return (
    <div className="inline-flex flex-col items-center gap-1">
      <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>
        {/* Track */}
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeW}
          className="text-slate-100 dark:text-slate-700"
        />
        {/* Fill */}
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeW}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${dim / 2} ${dim / 2})`}
        />
        {/* Center label */}
        <text
          x={dim / 2}
          y={dim / 2}
          textAnchor="middle"
          dominantBaseline="central"
          className={cn('fill-current font-bold', labelSize)}
          style={{ fontSize: size === 'sm' ? 9 : size === 'lg' ? 14 : 11 }}
          fill={color}
        >
          {Math.round(animated)}
        </text>
      </svg>
      {showLabel && (
        <span className={cn('text-[10px] font-medium', colors.text)}>
          Confidence
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Inline variant
// ─────────────────────────────────────────────────────────────────────────────

function InlineGauge({ score, size }: { score: number; size: 'sm' | 'md' | 'lg' }) {
  const animated = useAnimatedValue(score, 600);
  const colors = getConfidenceColor(score);
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm';

  return (
    <span className={cn('tabular-nums font-semibold', textSize, colors.text)}>
      {Math.round(animated)}%
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function ConfidenceGauge({
  score,
  size = 'md',
  showLabel = true,
  variant = 'bar',
  className,
}: ConfidenceGaugeProps) {
  const clamped = Math.max(0, Math.min(100, score));

  return (
    <div className={cn('inline-flex', variant !== 'ring' && 'w-full', className)}>
      {variant === 'bar' && (
        <BarGauge score={clamped} size={size} showLabel={showLabel} />
      )}
      {variant === 'ring' && (
        <RingGauge score={clamped} size={size} showLabel={showLabel} />
      )}
      {variant === 'inline' && (
        <InlineGauge score={clamped} size={size} />
      )}
    </div>
  );
}

export default ConfidenceGauge;
