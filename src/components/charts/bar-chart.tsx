'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
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

export interface BarChartProps {
  data: Record<string, unknown>[];
  xKey: string;
  yKeys: string[];
  colors?: string[];
  height?: number;
  showGrid?: boolean;
  yAxisFormatter?: (value: number) => string;
  stacked?: boolean;
  layout?: 'vertical' | 'horizontal';
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Custom Tooltip
// ─────────────────────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: TooltipContentProps<TooltipValueType, NameType>) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div
      className={cn(
        'rounded-lg bg-white dark:bg-slate-800 shadow-md',
        'border border-slate-100 dark:border-slate-700',
        'p-3 min-w-[120px]',
      )}
    >
      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">{label}</p>
      {payload.map((entry) => (
        <div key={String(entry.dataKey)} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200">
          <span
            className="inline-block w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="flex-1 text-slate-500 dark:text-slate-400">{entry.name}</span>
          <span className="font-semibold tabular-nums">{(entry.value as number | undefined)?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Custom Legend
// ─────────────────────────────────────────────────────────────────────────────

function CustomLegend({ payload }: { payload?: Array<{ color: string; value: string }> }) {
  if (!payload || !payload.length) return null;

  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
      {payload.map((entry) => (
        <div key={entry.value} className="flex items-center gap-1.5">
          <span
            className="inline-block w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-[11px] text-slate-500 dark:text-slate-400">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function BarChart({
  data,
  xKey,
  yKeys,
  colors = DEFAULT_COLORS,
  height = 300,
  showGrid = true,
  yAxisFormatter,
  stacked = false,
  layout = 'horizontal',
  className,
}: BarChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const gridColor = isDark ? '#334155' : '#E2E8F0';
  const axisTickColor = isDark ? '#94A3B8' : '#64748B';
  const cursorFill = isDark ? 'rgba(51,65,85,0.5)' : 'rgba(226,232,240,0.4)';

  // ── Vertical layout (horizontal bars — category on Y, values on X) ────────
  if (layout === 'vertical') {
    // Calculate left margin based on longest label length
    const maxLabelLen = Math.max(...data.map((d) => String(d[xKey] ?? '').length));
    const leftMargin = Math.min(Math.max(maxLabelLen * 6, 80), 200);

    return (
      <div className={cn('w-full', className)} style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 24, bottom: 4, left: leftMargin }}
            barCategoryGap="25%"
            barGap={3}
          >
            {showGrid && (
              <CartesianGrid
                strokeDasharray="4 4"
                stroke={gridColor}
                strokeOpacity={0.8}
                horizontal={false}
              />
            )}
            {/* Category axis on Y */}
            <YAxis
              dataKey={xKey}
              type="category"
              tick={{ fontSize: 11, fill: axisTickColor }}
              axisLine={false}
              tickLine={false}
              width={leftMargin}
            />
            {/* Value axis on X */}
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: axisTickColor }}
              axisLine={false}
              tickLine={false}
              tickFormatter={yAxisFormatter}
            />
            <Tooltip content={CustomTooltip} cursor={{ fill: cursorFill }} />
            {yKeys.length > 1 && (
              <Legend content={(props) => <CustomLegend payload={props.payload as Array<{ color: string; value: string }> | undefined} />} />
            )}
            {yKeys.map((key, i) => (
              <Bar
                key={key}
                dataKey={key}
                name={key}
                fill={colors[i % colors.length]}
                stackId={stacked ? 'stack' : undefined}
                radius={[0, 4, 4, 0]}
                maxBarSize={28}
              />
            ))}
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // ── Standard horizontal layout (vertical bars) ────────────────────────────
  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          margin={{ top: 4, right: 8, bottom: 4, left: 8 }}
          barCategoryGap="30%"
          barGap={4}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="4 4"
              stroke={gridColor}
              strokeOpacity={0.8}
              vertical={false}
            />
          )}
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 12, fill: axisTickColor }}
            axisLine={false}
            tickLine={false}
            dy={6}
          />
          <YAxis
            tick={{ fontSize: 12, fill: axisTickColor }}
            axisLine={false}
            tickLine={false}
            tickFormatter={yAxisFormatter}
            dx={-4}
          />
          <Tooltip content={CustomTooltip} cursor={{ fill: cursorFill }} />
          <Legend content={(props) => <CustomLegend payload={props.payload as Array<{ color: string; value: string }> | undefined} />} />
          {yKeys.map((key, i) => (
            <Bar
              key={key}
              dataKey={key}
              name={key}
              fill={colors[i % colors.length]}
              stackId={stacked ? 'stack' : undefined}
              radius={stacked && i < yKeys.length - 1 ? [0, 0, 0, 0] : [4, 4, 0, 0]}
              maxBarSize={64}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default BarChart;
