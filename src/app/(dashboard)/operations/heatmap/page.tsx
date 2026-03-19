'use client';

import React, { useState, useMemo } from 'react';
import { mockUsers, analyticsData } from '@/data/mock-data';
import { PageHeader, TabBar } from '@/components/layout';
import type { HeatmapDataPoint } from '@/components/charts';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Color scale from lightest to darkest
const COLOR_SCALE = [
  '#F1F5F9', // slate-100 — 0
  '#DBEAFE', // blue-100
  '#93C5FD', // blue-300
  '#3B82F6', // blue-500
  '#1D4ED8', // blue-700
];

type Period = '7d' | '30d' | '3m' | '12m';

const PERIOD_TABS = [
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '3 Months', value: '3m' },
  { label: '12 Months', value: '12m' },
];

// Day-of-week multipliers vary by period to simulate different workload patterns
const DAY_MULTIPLIERS: Record<Period, number[]> = {
  '7d':  [0.85, 1.15, 1.25, 1.10, 0.95, 0.40, 0.20],
  '30d': [0.80, 1.10, 1.20, 1.10, 0.90, 0.40, 0.20],
  '3m':  [0.75, 1.05, 1.18, 1.12, 0.95, 0.45, 0.25],
  '12m': [0.78, 1.08, 1.15, 1.08, 0.92, 0.48, 0.28],
};

// Base load scale per period
const PERIOD_SCALE: Record<Period, number> = {
  '7d': 1,
  '30d': 4.3,
  '3m': 13,
  '12m': 52,
};

// Month names for 12-month view
const MONTHS_12 = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

// Month workload multipliers (seasonal patterns)
const MONTH_MULTIPLIERS = [0.82, 0.78, 0.91, 1.05, 1.12, 0.95, 0.88, 1.18, 1.25, 1.08, 0.97, 1.02];

// Week names for 3-month view (13 weeks)
const WEEKS_13 = Array.from({ length: 13 }, (_, i) => `Wk${i + 1}`);

// Week workload multipliers (some weeks busier)
const WEEK_MULTIPLIERS = [
  0.92, 1.08, 1.15, 0.98, 1.02, 1.18, 0.95, 1.05, 1.12, 0.88, 1.22, 1.06, 0.97,
];

// Day labels for 30-day view
const DAYS_30 = Array.from({ length: 30 }, (_, i) => `D${i + 1}`);

// 30-day workload pattern (business rhythm — peaks mid-week within each week)
const DAY30_MULTIPLIERS = [
  // Week 1
  0.85, 1.10, 1.22, 1.15, 0.92, 0.38, 0.18,
  // Week 2
  0.88, 1.18, 1.28, 1.08, 0.95, 0.42, 0.22,
  // Week 3
  0.80, 1.05, 1.20, 1.12, 0.90, 0.35, 0.20,
  // Week 4
  0.90, 1.15, 1.25, 1.18, 0.98, 0.44, 0.24,
  // Days 29-30 (Mon-Tue of week 5)
  0.87, 1.12,
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getColorForValue(value: number, min: number, max: number, scale: string[]): string {
  if (max === min) return scale[0];
  const normalized = (value - min) / (max - min);
  const buckets = scale.length - 1;
  const idx = Math.min(Math.floor(normalized * buckets), buckets - 1);
  return scale[idx + (normalized * buckets - idx > 0.5 ? 1 : 0)] ?? scale[idx];
}

// ─────────────────────────────────────────────────────────────────────────────
// Heatmap grid component — handles any x-labels and data
// ─────────────────────────────────────────────────────────────────────────────

function CompactHeatmap({
  data,
  xLabels,
  yLabels,
  colorScale,
  cellWidth = 26,
  tooltipXLabel = 'Column',
}: {
  data: HeatmapDataPoint[];
  xLabels: string[];
  yLabels: string[];
  colorScale: string[];
  cellWidth?: number;
  tooltipXLabel?: string;
}) {
  const [tooltip, setTooltip] = useState<{
    x: string; y: string; value: number; top: number; left: number;
  } | null>(null);

  const valueMap = new Map<string, number>();
  let min = Infinity;
  let max = -Infinity;
  for (const pt of data) {
    valueMap.set(`${pt.x}__${pt.y}`, pt.value);
    if (pt.value < min) min = pt.value;
    if (pt.value > max) max = pt.value;
  }
  if (min === Infinity) { min = 0; max = 0; }

  // Column totals for summary row
  const colTotals = xLabels.map((x) =>
    data.filter((d) => d.x === x).reduce((s, d) => s + d.value, 0),
  );

  return (
    <div className="relative overflow-auto w-full" style={{ maxHeight: '520px' }}>
      <div className="heatmap-wrapper relative" style={{ minWidth: `${xLabels.length * (cellWidth + 2) + 100}px` }}>
        <table className="border-separate" style={{ borderSpacing: '2px' }}>
          <thead>
            <tr>
              <th className="text-left pr-3 pb-1" style={{ minWidth: '90px', width: '90px' }} />
              {xLabels.map((x) => (
                <th
                  key={x}
                  className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 text-center pb-1 px-0"
                  style={{ minWidth: `${cellWidth}px`, width: `${cellWidth}px` }}
                >
                  {x}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {yLabels.map((yLabel) => (
              <tr key={yLabel}>
                <td className="text-[10px] text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap pr-2 text-right leading-none py-0.5">
                  {yLabel}
                </td>
                {xLabels.map((xLabel) => {
                  const value = valueMap.get(`${xLabel}__${yLabel}`) ?? 0;
                  const bg = getColorForValue(value, min, max, colorScale);
                  return (
                    <td key={xLabel} className="p-0">
                      <div
                        className="rounded-sm cursor-default transition-opacity hover:opacity-70"
                        style={{ width: `${cellWidth}px`, height: '26px', backgroundColor: bg }}
                        onMouseEnter={(e) => {
                          const rect = (e.target as HTMLElement).getBoundingClientRect();
                          const wrapper = (e.currentTarget.closest('.heatmap-wrapper') as HTMLElement | null)?.getBoundingClientRect();
                          setTooltip({
                            x: xLabel,
                            y: yLabel,
                            value,
                            top: rect.top - (wrapper?.top ?? 0) - 8,
                            left: rect.left - (wrapper?.left ?? 0) + cellWidth / 2,
                          });
                        }}
                        onMouseLeave={() => setTooltip(null)}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* Summary row — column totals */}
            <tr>
              <td className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap pr-2 text-right pt-2">
                Total
              </td>
              {colTotals.map((total, i) => (
                <td key={xLabels[i]} className="p-0 pt-2 text-center">
                  <span className="text-[9px] font-bold tabular-nums text-slate-600 dark:text-slate-300">
                    {total}
                  </span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="pointer-events-none absolute z-10 rounded-lg bg-white dark:bg-slate-800 shadow-md border border-slate-100 dark:border-slate-700 p-2.5 text-xs whitespace-nowrap -translate-x-1/2 -translate-y-full"
            style={{ top: tooltip.top, left: tooltip.left }}
          >
            <p className="font-semibold text-slate-700 dark:text-slate-200">{tooltip.x} · {tooltip.y}</p>
            <p className="text-slate-500 mt-0.5">
              Claims: <span className="font-semibold text-slate-800 dark:text-slate-100 tabular-nums">{tooltip.value.toLocaleString()}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Legend
// ─────────────────────────────────────────────────────────────────────────────

function HeatmapLegend({ min, max }: { min: number; max: number }) {
  return (
    <div className="flex items-center gap-3 mt-4">
      <span className="text-xs text-slate-500 dark:text-slate-400">Low ({min})</span>
      <div className="flex items-center gap-0.5">
        {COLOR_SCALE.map((color, i) => (
          <div key={i} className="w-6 h-3 rounded-sm" style={{ backgroundColor: color }} />
        ))}
      </div>
      <span className="text-xs text-slate-500 dark:text-slate-400">High ({max})</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function WorkloadHeatmapPage() {
  const [period, setPeriod] = useState<Period>('30d');

  const agents = useMemo(
    () => mockUsers.filter((u) => u.role === 'claims_agent'),
    [],
  );

  const agentNames = agents.map(
    (a) => a.name.split(' ')[0] + ' ' + (a.name.split(' ')[1]?.charAt(0) ?? '') + '.',
  );

  // ── 7-day heatmap: Mon-Sun x agents ──────────────────────────────────────
  const data7d = useMemo<HeatmapDataPoint[]>(() => {
    const multipliers = DAY_MULTIPLIERS['7d'];
    const scale = PERIOD_SCALE['7d'];
    return agents.flatMap((agent, agentIdx) => {
      const perf = analyticsData.agentPerformance.find((p) => p.agentId === agent.id);
      const yearlyBase = perf ? perf.claimsProcessed : agent.currentLoad * 5;
      const dailyAvg = (yearlyBase / 365) * scale;
      return DAYS_OF_WEEK.map((day, dayIdx) => {
        const jitter = Math.sin(agentIdx * 3.7 + dayIdx * 1.9) * 0.8;
        const value = Math.max(0, Math.round(dailyAvg * multipliers[dayIdx] + jitter));
        return { x: day, y: agentNames[agentIdx], value };
      });
    });
  }, [agents, agentNames]);

  // ── 30-day heatmap: Day 1-30 x agents ────────────────────────────────────
  const data30d = useMemo<HeatmapDataPoint[]>(() => {
    const scale = PERIOD_SCALE['30d'];
    return agents.flatMap((agent, agentIdx) => {
      const perf = analyticsData.agentPerformance.find((p) => p.agentId === agent.id);
      const yearlyBase = perf ? perf.claimsProcessed : agent.currentLoad * 5;
      const dailyAvg = (yearlyBase / 365) * scale;
      return DAYS_30.map((day, dayIdx) => {
        const dayMult = DAY30_MULTIPLIERS[dayIdx] ?? 0.9;
        const jitter = Math.sin(agentIdx * 5.1 + dayIdx * 2.3) * 0.9;
        const value = Math.max(0, Math.round((dailyAvg / 4.3) * dayMult + jitter));
        return { x: day, y: agentNames[agentIdx], value };
      });
    });
  }, [agents, agentNames]);

  // ── 3-month heatmap: Week 1-13 x agents ──────────────────────────────────
  const data3m = useMemo<HeatmapDataPoint[]>(() => {
    return agents.flatMap((agent, agentIdx) => {
      const perf = analyticsData.agentPerformance.find((p) => p.agentId === agent.id);
      const yearlyBase = perf ? perf.claimsProcessed : agent.currentLoad * 5;
      const weeklyAvg = yearlyBase / 52;
      return WEEKS_13.map((week, wkIdx) => {
        const mult = WEEK_MULTIPLIERS[wkIdx] ?? 1.0;
        const jitter = Math.sin(agentIdx * 2.9 + wkIdx * 3.1) * 3;
        const value = Math.max(0, Math.round(weeklyAvg * mult + jitter));
        return { x: week, y: agentNames[agentIdx], value };
      });
    });
  }, [agents, agentNames]);

  // ── 12-month heatmap: Jan-Dec x agents ───────────────────────────────────
  const data12m = useMemo<HeatmapDataPoint[]>(() => {
    return agents.flatMap((agent, agentIdx) => {
      const perf = analyticsData.agentPerformance.find((p) => p.agentId === agent.id);
      const yearlyBase = perf ? perf.claimsProcessed : agent.currentLoad * 5;
      const monthlyAvg = yearlyBase / 12;
      return MONTHS_12.map((month, mIdx) => {
        const mult = MONTH_MULTIPLIERS[mIdx] ?? 1.0;
        const jitter = Math.sin(agentIdx * 4.3 + mIdx * 1.7) * 8;
        const value = Math.max(0, Math.round(monthlyAvg * mult + jitter));
        return { x: month, y: agentNames[agentIdx], value };
      });
    });
  }, [agents, agentNames]);

  // ── Select active dataset ─────────────────────────────────────────────────
  const { heatmapData, xLabels, cellWidth, tooltipXLabel, xAxisDesc } = useMemo(() => {
    switch (period) {
      case '7d':
        return { heatmapData: data7d, xLabels: DAYS_OF_WEEK, cellWidth: 36, tooltipXLabel: 'Day', xAxisDesc: '1 week — Mon to Sun' };
      case '30d':
        return { heatmapData: data30d, xLabels: DAYS_30, cellWidth: 26, tooltipXLabel: 'Day', xAxisDesc: '30 days — scroll horizontally to view all' };
      case '3m':
        return { heatmapData: data3m, xLabels: WEEKS_13, cellWidth: 32, tooltipXLabel: 'Week', xAxisDesc: '13 weeks — each cell = 1 week of claims' };
      case '12m':
        return { heatmapData: data12m, xLabels: MONTHS_12, cellWidth: 36, tooltipXLabel: 'Month', xAxisDesc: '12 months — each cell = monthly aggregate' };
    }
  }, [period, data7d, data30d, data3m, data12m]);

  const values = heatmapData.map((d) => d.value);
  const minValue = values.length > 0 ? Math.min(...values) : 0;
  const maxValue = values.length > 0 ? Math.max(...values) : 0;

  // Summary stats
  const totalClaims = heatmapData.reduce((sum, d) => sum + d.value, 0);
  const avgPerCell = Math.round(totalClaims / (xLabels.length || 1));

  // Busiest column
  const colTotals = xLabels.map((x) =>
    heatmapData.filter((d) => d.x === x).reduce((s, d) => s + d.value, 0),
  );
  const busiestColIdx = colTotals.indexOf(Math.max(...colTotals));
  const busiestCol = xLabels[busiestColIdx] ?? '-';

  // Busiest agent
  const agentTotals = agentNames.map((name) =>
    heatmapData.filter((d) => d.y === name).reduce((s, d) => s + d.value, 0),
  );
  const busiestAgentIdx = agentTotals.indexOf(Math.max(...agentTotals));
  const busiestAgent = agentNames[busiestAgentIdx] ?? '-';

  const periodLabel = PERIOD_TABS.find((t) => t.value === period)?.label ?? period;

  // ── Day-by-day / column summary (only for 7d and 30d) ────────────────────
  const showColumnSummary = period === '7d' || period === '30d';
  const summaryColumns = showColumnSummary ? xLabels : [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Workload Heatmap"
        description="Visualize agent workload distribution. The heatmap structure changes with the selected time period."
        actions={
          <TabBar
            tabs={PERIOD_TABS}
            activeTab={period}
            onChange={(v) => setPeriod(v as Period)}
            variant="segmented"
          />
        }
      />

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: `Total Claims (${periodLabel})`, value: totalClaims.toLocaleString() },
          { label: period === '7d' ? 'Avg per Day (All Agents)' : period === '12m' ? 'Avg per Month (All Agents)' : period === '3m' ? 'Avg per Week (All Agents)' : 'Avg per Day (All Agents)', value: avgPerCell.toLocaleString() },
          { label: period === '7d' ? 'Busiest Day' : period === '12m' ? 'Busiest Month' : period === '3m' ? 'Busiest Week' : 'Busiest Day', value: busiestCol },
          { label: 'Busiest Agent', value: busiestAgent },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-white dark:bg-slate-900 rounded-[var(--radius-md)] border border-slate-200 dark:border-slate-700 p-4"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              {label}
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      {/* Period description banner */}
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-[var(--radius-md)] bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 text-xs text-slate-600 dark:text-slate-300">
        <span className="font-semibold text-blue-700 dark:text-blue-400">{periodLabel} View:</span>
        <span>{xAxisDesc}</span>
        {period === '30d' && (
          <span className="ml-auto text-[11px] text-slate-400 italic">Scroll right to see all 30 days</span>
        )}
        {period === '3m' && (
          <span className="ml-auto text-[11px] text-slate-400 italic">Each cell represents one calendar week</span>
        )}
      </div>

      {/* Main heatmap */}
      <div className="bg-white dark:bg-slate-900 rounded-[var(--radius-md)] border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {period === '7d' && 'Claims per Agent × Day of Week (Last 7 Days)'}
            {period === '30d' && 'Claims per Agent × Day (Last 30 Days)'}
            {period === '3m' && 'Claims per Agent × Week (Last 13 Weeks)'}
            {period === '12m' && 'Claims per Agent × Month (Apr 2025 – Mar 2026)'}
          </h2>
          <span className="text-xs text-slate-400">Color intensity = claim count</span>
        </div>

        <CompactHeatmap
          data={heatmapData}
          xLabels={xLabels}
          yLabels={agentNames}
          colorScale={COLOR_SCALE}
          cellWidth={cellWidth}
          tooltipXLabel={tooltipXLabel}
        />

        <HeatmapLegend min={minValue} max={maxValue} />
      </div>

      {/* Column summary — shown for 7d and 30d */}
      {showColumnSummary && (
        <div className="bg-white dark:bg-slate-900 rounded-[var(--radius-md)] border border-slate-200 dark:border-slate-700 p-5">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">
            {period === '7d' ? 'Day-by-Day Summary' : '30-Day Summary'} — {periodLabel}
          </h2>
          <div
            className={`grid gap-2 ${
              period === '7d' ? 'grid-cols-7' : 'grid-cols-10 sm:grid-cols-15'
            }`}
            style={period === '30d' ? { gridTemplateColumns: 'repeat(10, minmax(0, 1fr))' } : {}}
          >
            {summaryColumns.map((col) => {
              const colData = heatmapData.filter((d) => d.x === col);
              const total = colData.reduce((s, d) => s + d.value, 0);
              const avg = colData.length > 0 ? Math.round(total / colData.length) : 0;
              const isBusiest = col === busiestCol;

              return (
                <div
                  key={col}
                  className={`rounded-lg p-2 text-center border ${
                    isBusiest
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <p className={`text-[10px] font-semibold uppercase tracking-wide mb-0.5 ${
                    isBusiest ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    {col}
                  </p>
                  <p className={`text-base font-bold tabular-nums ${
                    isBusiest ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-200'
                  }`}>
                    {total}
                  </p>
                  <p className="text-[9px] text-slate-400 mt-0.5">avg {avg}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Month/Week summary for 12m and 3m */}
      {(period === '12m' || period === '3m') && (
        <div className="bg-white dark:bg-slate-900 rounded-[var(--radius-md)] border border-slate-200 dark:border-slate-700 p-5">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">
            {period === '12m' ? 'Monthly' : 'Weekly'} Summary — {periodLabel}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="text-left font-semibold text-slate-500 py-2 pr-4">
                    {period === '12m' ? 'Month' : 'Week'}
                  </th>
                  <th className="text-right font-semibold text-slate-500 py-2 pr-4">Total Claims</th>
                  <th className="text-right font-semibold text-slate-500 py-2 pr-4">Avg / Agent</th>
                  <th className="text-left font-semibold text-slate-500 py-2">Distribution</th>
                </tr>
              </thead>
              <tbody>
                {xLabels.map((col) => {
                  const colData = heatmapData.filter((d) => d.x === col);
                  const total = colData.reduce((s, d) => s + d.value, 0);
                  const avg = colData.length > 0 ? Math.round(total / colData.length) : 0;
                  const isBusiest = col === busiestCol;
                  const maxTotal = Math.max(...xLabels.map((x) =>
                    heatmapData.filter((d) => d.x === x).reduce((s, d) => s + d.value, 0),
                  ));
                  const barPct = maxTotal > 0 ? (total / maxTotal) * 100 : 0;

                  return (
                    <tr
                      key={col}
                      className={`border-b border-slate-50 dark:border-slate-800/50 ${isBusiest ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                    >
                      <td className={`py-2 pr-4 font-semibold ${isBusiest ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'}`}>
                        {col} {isBusiest && <span className="ml-1 text-[10px] text-blue-500">(peak)</span>}
                      </td>
                      <td className="py-2 pr-4 text-right font-bold tabular-nums text-slate-800 dark:text-slate-100">
                        {total.toLocaleString()}
                      </td>
                      <td className="py-2 pr-4 text-right tabular-nums text-slate-500">
                        {avg}
                      </td>
                      <td className="py-2">
                        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-sm overflow-hidden">
                          <div
                            className="h-full rounded-sm transition-all duration-300"
                            style={{ width: `${barPct}%`, backgroundColor: isBusiest ? '#2563EB' : '#93C5FD' }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
