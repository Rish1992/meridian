'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

/** 5-step color scale: empty → full intensity */
const DEFAULT_COLOR_SCALE = [
  '#F1F5F9', // slate-100
  '#EFF6FF', // brand-primary-surface
  '#DBEAFE', // brand-primary-light
  '#3B82F6', // info
  '#2563EB', // brand-primary
];

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface HeatmapDataPoint {
  x: string;
  y: string;
  value: number;
}

export interface HeatmapChartProps {
  data: HeatmapDataPoint[];
  xLabels: string[];
  yLabels: string[];
  colorScale?: string[];
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getColorForValue(value: number, min: number, max: number, scale: string[]): string {
  if (max === min) return scale[0];
  const normalized = (value - min) / (max - min);
  const buckets = scale.length - 1;
  const idx = Math.min(Math.floor(normalized * buckets), buckets - 1);
  // Simple interpolation between adjacent stops
  const lo = idx;
  const hi = Math.min(idx + 1, buckets);
  const t = normalized * buckets - idx;
  if (t === 0 || lo === hi) return scale[lo];
  return blendHex(scale[lo], scale[hi], t);
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const n = parseInt(h, 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

function blendHex(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const bl = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r},${g},${bl})`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function HeatmapChart({
  data,
  xLabels,
  yLabels,
  colorScale = DEFAULT_COLOR_SCALE,
  className,
}: HeatmapChartProps) {
  const [tooltip, setTooltip] = useState<{
    x: string;
    y: string;
    value: number;
    top: number;
    left: number;
  } | null>(null);

  // Build a lookup map for fast access
  const valueMap = new Map<string, number>();
  let min = Infinity;
  let max = -Infinity;

  for (const point of data) {
    valueMap.set(`${point.x}__${point.y}`, point.value);
    if (point.value < min) min = point.value;
    if (point.value > max) max = point.value;
  }

  if (min === Infinity) { min = 0; max = 0; }

  return (
    <div className={cn('relative w-full overflow-x-auto', className)}>
      {/* Grid layout: y-label col + data cols */}
      <div
        className="inline-grid min-w-full"
        style={{
          gridTemplateColumns: `auto repeat(${xLabels.length}, minmax(32px, 1fr))`,
          gap: '2px',
        }}
      >
        {/* Top-left corner spacer */}
        <div />

        {/* X-axis labels */}
        {xLabels.map((xLabel) => (
          <div
            key={xLabel}
            className="text-[11px] text-slate-500 dark:text-slate-400 text-center pb-1 font-medium"
          >
            {xLabel}
          </div>
        ))}

        {/* Rows */}
        {yLabels.map((yLabel) => (
          <React.Fragment key={yLabel}>
            {/* Y-axis label */}
            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center pr-2 font-medium whitespace-nowrap">
              {yLabel}
            </div>

            {/* Cells */}
            {xLabels.map((xLabel) => {
              const value = valueMap.get(`${xLabel}__${yLabel}`) ?? 0;
              const bgColor = getColorForValue(value, min, max, colorScale);

              return (
                <div
                  key={xLabel}
                  className="rounded-sm aspect-square cursor-default transition-opacity duration-100 hover:opacity-80"
                  style={{ backgroundColor: bgColor }}
                  onMouseEnter={(e) => {
                    const rect = (e.target as HTMLElement).getBoundingClientRect();
                    const containerRect = (e.currentTarget.closest('.heatmap-wrapper') as HTMLElement | null)?.getBoundingClientRect();
                    setTooltip({
                      x: xLabel,
                      y: yLabel,
                      value,
                      top: rect.top - (containerRect?.top ?? 0) - 48,
                      left: rect.left - (containerRect?.left ?? 0) + rect.width / 2,
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className={cn(
            'pointer-events-none absolute z-10',
            'rounded-lg bg-white dark:bg-slate-800 shadow-md',
            'border border-slate-100 dark:border-slate-700',
            'p-3 text-xs whitespace-nowrap',
            '-translate-x-1/2 -translate-y-full',
          )}
          style={{ top: tooltip.top, left: tooltip.left }}
        >
          <p className="font-semibold text-slate-700 dark:text-slate-200">
            {tooltip.x} · {tooltip.y}
          </p>
          <p className="text-slate-500 dark:text-slate-400 mt-0.5">
            Value: <span className="font-semibold text-slate-800 dark:text-slate-100 tabular-nums">{tooltip.value.toLocaleString()}</span>
          </p>
        </div>
      )}
    </div>
  );
}

export default HeatmapChart;
