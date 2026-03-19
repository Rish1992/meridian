'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import {
  LineChart as RechartsLineChart,
  AreaChart as RechartsAreaChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  type TooltipContentProps,
  type TooltipValueType,
} from 'recharts';
import type { CurveType } from 'recharts/types/shape/Curve';
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

export interface LineChartProps {
  data: Record<string, unknown>[];
  xKey: string;
  yKeys: string[];
  colors?: string[];
  height?: number;
  showDots?: boolean;
  curveType?: CurveType;
  areaGradient?: boolean;
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
// Gradient defs helper
// ─────────────────────────────────────────────────────────────────────────────

function GradientDefs({ yKeys, colors }: { yKeys: string[]; colors: string[] }) {
  return (
    <defs>
      {yKeys.map((key, i) => (
        <linearGradient key={key} id={`lineGrad-${key}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={colors[i % colors.length]} stopOpacity={0.08} />
          <stop offset="95%" stopColor={colors[i % colors.length]} stopOpacity={0} />
        </linearGradient>
      ))}
    </defs>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function LineChart({
  data,
  xKey,
  yKeys,
  colors = DEFAULT_COLORS,
  height = 300,
  showDots = true,
  curveType = 'monotone',
  areaGradient = false,
  className,
}: LineChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const axisTickColor = isDark ? '#94A3B8' : '#64748B';
  const gridColor = isDark ? '#334155' : '#E2E8F0';

  const sharedAxisProps = {
    tick: { fontSize: 12, fill: axisTickColor },
    axisLine: false,
    tickLine: false,
  } as const;

  const sharedGridProps = {
    strokeDasharray: '4 4' as const,
    stroke: gridColor,
    strokeOpacity: 0.8,
    vertical: false,
  };

  const dotProps = showDots
    ? { r: 4, strokeWidth: 2, fill: '#fff' }
    : false;

  const activeDotProps = showDots ? { r: 5 } : false;

  if (areaGradient) {
    return (
      <div className={cn('w-full', className)} style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsAreaChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
            <GradientDefs yKeys={yKeys} colors={colors} />
            <CartesianGrid {...sharedGridProps} />
            <XAxis dataKey={xKey} {...sharedAxisProps} dy={6} />
            <YAxis {...sharedAxisProps} dx={-4} />
            <Tooltip content={CustomTooltip} />
            <Legend content={(props) => <CustomLegend payload={props.payload as Array<{ color: string; value: string }>} />} />
            {yKeys.map((key, i) => (
              <Area
                key={key}
                type={curveType}
                dataKey={key}
                name={key}
                stroke={colors[i % colors.length]}
                strokeWidth={2}
                fill={`url(#lineGrad-${key})`}
                fillOpacity={0.6}
                dot={dotProps}
                activeDot={activeDotProps}
              />
            ))}
          </RechartsAreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
          <CartesianGrid {...sharedGridProps} />
          <XAxis dataKey={xKey} {...sharedAxisProps} dy={6} />
          <YAxis {...sharedAxisProps} dx={-4} />
          <Tooltip content={CustomTooltip} />
          <Legend content={(props) => <CustomLegend payload={props.payload as Array<{ color: string; value: string }>} />} />
          {yKeys.map((key, i) => (
            <Line
              key={key}
              type={curveType}
              dataKey={key}
              name={key}
              stroke={colors[i % colors.length]}
              strokeWidth={2}
              dot={dotProps}
              activeDot={activeDotProps}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default LineChart;
