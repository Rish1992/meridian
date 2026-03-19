'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Line,
  LineChart,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface SparklineChartProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  type?: 'line' | 'area' | 'bar';
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function SparklineChart({
  data,
  width = 80,
  height = 32,
  color = '#2563EB',
  type = 'area',
  className,
}: SparklineChartProps) {
  const chartData = data.map((v, i) => ({ i, v }));
  const gradId = `spark-grad-${color.replace('#', '')}`;

  const commonProps = {
    data: chartData,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  };

  if (type === 'bar') {
    return (
      <div className={cn('shrink-0', className)} style={{ width, height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart {...commonProps} barCategoryGap="15%">
            <Bar
              dataKey="v"
              fill={color}
              opacity={0.7}
              isAnimationActive={false}
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === 'line') {
    return (
      <div className={cn('shrink-0', className)} style={{ width, height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart {...commonProps}>
            <Line
              type="monotone"
              dataKey="v"
              stroke={color}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Default: area
  return (
    <div className={cn('shrink-0', className)} style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart {...commonProps}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.1} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#${gradId})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SparklineChart;
