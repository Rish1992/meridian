'use client';

import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  type TooltipContentProps,
  type TooltipValueType,
} from 'recharts';
import type { NameType } from 'recharts/types/component/DefaultTooltipContent';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_COLORS = [
  '#2563EB',
  '#10B981',
  '#F59E0B',
  '#8B5CF6',
  '#F43F5E',
  '#14B8A6',
  '#4F46E5',
  '#64748B',
];

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface DonutDataItem {
  name: string;
  value: number;
  color?: string;
}

export interface DonutChartProps {
  data: DonutDataItem[];
  centerLabel?: string;
  centerValue?: string | number;
  showLegend?: boolean;
  height?: number;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Custom Tooltip
// ─────────────────────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload }: TooltipContentProps<TooltipValueType, NameType>) {
  if (!active || !payload || !payload.length) return null;
  const entry = payload[0];

  return (
    <div
      className={cn(
        'rounded-lg bg-white dark:bg-slate-800 shadow-md',
        'border border-slate-100 dark:border-slate-700',
        'p-3 min-w-[120px]',
      )}
    >
      <div className="flex items-center gap-2 text-xs">
        <span
          className="inline-block w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: entry.payload?.fill ?? entry.color }}
        />
        <span className="text-slate-600 dark:text-slate-300">{entry.name}</span>
        <span className="font-semibold tabular-nums text-slate-800 dark:text-slate-100 ml-auto">
          {entry.value?.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function DonutChart({
  data,
  centerLabel,
  centerValue,
  showLegend = true,
  height = 280,
  className,
}: DonutChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const resolvedColors = data.map(
    (item, i) => item.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length],
  );

  return (
    <div className={cn('flex items-center gap-6 overflow-hidden', className)}>
      {/* Chart */}
      <div className="relative shrink-0" style={{ width: height, height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="80%"
              paddingAngle={2}
              dataKey="value"
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              strokeWidth={0}
            >
              {data.map((_, i) => (
                <Cell
                  key={`cell-${i}`}
                  fill={resolvedColors[i]}
                  opacity={activeIndex === null || activeIndex === i ? 1 : 0.6}
                  // outerRadius expansion is achieved via transform on hover
                />
              ))}
            </Pie>
            <Tooltip content={CustomTooltip} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label overlay */}
        {(centerValue !== undefined || centerLabel) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {centerValue !== undefined && (
              <span className="text-2xl font-bold leading-none text-slate-900 dark:text-white tabular-nums">
                {typeof centerValue === 'number' ? centerValue.toLocaleString() : centerValue}
              </span>
            )}
            {centerLabel && (
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 text-center leading-tight px-2">
                {centerLabel}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="flex flex-col gap-2 min-w-0 flex-1">
          {data.map((item, i) => {
            const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
            return (
              <div
                key={item.name}
                className="flex items-center gap-2 cursor-default"
                onMouseEnter={() => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <span
                  className="inline-block w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: resolvedColors[i] }}
                />
                <span className="text-[11px] text-slate-600 dark:text-slate-300 truncate flex-1 min-w-0">
                  {item.name}
                </span>
                <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-100 tabular-nums shrink-0">
                  {item.value.toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 tabular-nums shrink-0 w-10 text-right">
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default DonutChart;
