'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Inbox,
  Loader2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Timer,
  XCircle,
  Zap,
  ChevronDown,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
  BarChart3,
  Target,
  ArrowRight,
  Award,
  ThumbsDown,
  RefreshCw,
  MapPin,
  Globe,
  Plane,
  X,
  Info,
} from 'lucide-react';
import { analyticsData, mockUsers } from '@/data/mock-data';
import { PageHeader, TabBar } from '@/components/layout';
import { MetricCard } from '@/components/ui';
import { BarChart, LineChart, DonutChart, GaugeChart } from '@/components/charts';

// ─────────────────────────────────────────────────────────────────────────────
// Period definitions
// ─────────────────────────────────────────────────────────────────────────────

type Period = '7d' | '30d' | '3m' | '12m';

const PERIODS: { label: string; value: Period }[] = [
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '3 Months', value: '3m' },
  { label: '12 Months', value: '12m' },
];

function getSliceCount(period: Period): number {
  switch (period) {
    case '7d': return 1;
    case '30d': return 2;
    case '3m': return 3;
    case '12m': return 12;
  }
}

function getScaleFactor(period: Period): number {
  return getSliceCount(period) / 12;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hardcoded "today" metrics — realistic non-zero values
// ─────────────────────────────────────────────────────────────────────────────

const TODAY_METRICS = {
  claimsReceivedToday: 47,
  claimsProcessedToday: 38,
  claimsPending: 156,
  claimsRejectedToday: 9,
};

// Sparkline data for each "today" metric (last 14 days trending)
const SPARKLINE_RECEIVED = [31, 38, 42, 29, 44, 51, 39, 47, 35, 52, 41, 38, 44, 47];
const SPARKLINE_PROCESSED = [27, 32, 36, 25, 38, 43, 33, 40, 30, 45, 35, 32, 37, 38];
const SPARKLINE_PENDING = [182, 175, 163, 171, 158, 149, 162, 155, 167, 148, 160, 153, 159, 156];
const SPARKLINE_REJECTED = [12, 8, 11, 7, 14, 9, 13, 8, 10, 12, 7, 11, 8, 9];

// ─────────────────────────────────────────────────────────────────────────────
// Detail Drawer — right-side slide-out with metric deep-dive
// ─────────────────────────────────────────────────────────────────────────────

interface DrawerMetric {
  id: string;
  title: string;
  value: string | number;
  trend: { direction: 'up' | 'down' | 'flat'; value: string; isPositive: boolean };
  sparklineData: number[];
  chartData: { label: string; value: number }[];
  chartColor: string;
  insights: string[];
  relatedMetrics: { label: string; value: string }[];
}

function DetailDrawer({
  metric,
  onClose,
}: {
  metric: DrawerMetric | null;
  onClose: () => void;
}) {
  if (!metric) return null;

  const chartFormatted = metric.chartData.map((d) => ({ label: d.label, Value: d.value }));

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 dark:bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-[400px] bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-700 flex flex-col" style={{ animation: 'drawerSlideIn 0.28s ease-out both' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">{metric.title}</h2>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Metric deep-dive</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Current value */}
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Current Value
            </p>
            <p className="text-4xl font-bold tabular-nums text-slate-900 dark:text-white">
              {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
            </p>
            <div className="mt-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                  metric.trend.isPositive
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}
              >
                {metric.trend.direction === 'up' ? (
                  <TrendingUp className="w-3 h-3" />
                ) : metric.trend.direction === 'down' ? (
                  <TrendingDown className="w-3 h-3" />
                ) : null}
                {metric.trend.value}
              </span>
            </div>
          </div>

          {/* 14-day trend chart */}
          <div>
            <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-3">14-Day Trend</h3>
            <div className="h-[140px]">
              <LineChart
                data={metric.sparklineData.map((v, i) => ({ day: `D${i + 1}`, Value: v }))}
                xKey="day"
                yKeys={['Value']}
                height={140}
                showDots={false}
                colors={[metric.chartColor]}
              />
            </div>
          </div>

          {/* Monthly breakdown */}
          <div>
            <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-3">Monthly Breakdown</h3>
            <div className="h-[160px]">
              <BarChart
                data={chartFormatted}
                xKey="label"
                yKeys={['Value']}
                height={160}
                showGrid
                colors={[metric.chartColor]}
              />
            </div>
          </div>

          {/* Key insights */}
          <div className="rounded-xl border border-blue-100 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-900/10 p-4">
            <h3 className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" /> Key Insights
            </h3>
            <ul className="space-y-1.5">
              {metric.insights.map((insight, i) => (
                <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex gap-2">
                  <span className="text-blue-400 shrink-0">•</span>
                  {insight}
                </li>
              ))}
            </ul>
          </div>

          {/* Related metrics */}
          <div>
            <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">Related Metrics</h3>
            <div className="grid grid-cols-2 gap-2">
              {metric.relatedMetrics.map((rm) => (
                <div
                  key={rm.label}
                  className="rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-3"
                >
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{rm.label}</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">{rm.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section Card wrapper — with optional local filter
// ─────────────────────────────────────────────────────────────────────────────

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
  subtitle?: string;
  filterOptions?: { label: string; value: string }[];
  filterValue?: string;
  onFilterChange?: (v: string) => void;
  className?: string;
  onClick?: () => void;
}

function SectionCard({ title, subtitle, children, filterOptions, filterValue, onFilterChange, className, onClick }: SectionCardProps) {
  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-[var(--radius-md)] border border-slate-200 dark:border-slate-700 p-5 overflow-hidden min-w-0 ${onClick ? 'cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 transition-colors' : ''} ${className ?? ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
          {subtitle && <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {filterOptions && onFilterChange && (
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <select
              value={filterValue}
              onChange={(e) => onFilterChange(e.target.value)}
              className="appearance-none h-7 pl-2 pr-6 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 focus:outline-none focus:border-blue-400 cursor-pointer"
            >
              {filterOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section Row Heading
// ─────────────────────────────────────────────────────────────────────────────

function SectionHeading({ icon, title, description }: { icon: React.ReactNode; title: string; description?: string }) {
  return (
    <div className="flex items-center gap-2.5 pt-2">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
        {icon}
      </div>
      <div>
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">{title}</h2>
        {description && <p className="text-[11px] text-slate-400 dark:text-slate-500">{description}</p>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Inline mock data for pipeline, rejection analysis, processing time, backlog
// ─────────────────────────────────────────────────────────────────────────────

const PIPELINE_STAGES = [
  { stage: 'Ingested', count: 1247, color: '#64748B' },
  { stage: 'Processing', count: 1189, color: '#6366F1' },
  { stage: 'Assigned', count: 1042, color: '#2563EB' },
  { stage: 'In Review', count: 876, color: '#0EA5E9' },
  { stage: 'Validated', count: 812, color: '#14B8A6' },
  { stage: 'Authorized', count: 743, color: '#10B981' },
  { stage: 'Approved', count: 698, color: '#22C55E' },
  { stage: 'Paid', count: 651, color: '#16A34A' },
];

const REJECTION_RATE_TREND = [
  { month: 'Apr', rate: 18.2 },
  { month: 'May', rate: 17.8 },
  { month: 'Jun', rate: 19.1 },
  { month: 'Jul', rate: 18.5 },
  { month: 'Aug', rate: 17.3 },
  { month: 'Sep', rate: 16.9 },
  { month: 'Oct', rate: 16.2 },
  { month: 'Nov', rate: 15.8 },
  { month: 'Dec', rate: 16.4 },
  { month: 'Jan', rate: 15.1 },
  { month: 'Feb', rate: 14.6 },
  { month: 'Mar', rate: 14.2 },
];

const FAILED_BY_STAGE = [
  { name: 'At Validation', value: 387 },
  { name: 'At Rules Engine', value: 298 },
  { name: 'At Authorization', value: 164 },
  { name: 'At Payment', value: 42 },
];

const PROCESSING_TIME_DISTRIBUTION = [
  { bucket: '<2 hrs', count: 312, color: '#10B981' },
  { bucket: '2-8 hrs', count: 487, color: '#22C55E' },
  { bucket: '8-24 hrs', count: 634, color: '#84CC16' },
  { bucket: '1-3 days', count: 521, color: '#F59E0B' },
  { bucket: '3-7 days', count: 289, color: '#F97316' },
  { bucket: '>7 days', count: 134, color: '#EF4444' },
];

const BACKLOG_AGING = [
  { bracket: '>24 hours', count: 87, trend: -12, severity: 'warning' as const },
  { bracket: '>48 hours', count: 34, trend: +3, severity: 'critical' as const },
  { bracket: '>72 hours', count: 11, trend: -2, severity: 'danger' as const },
  { bracket: '>7 days', count: 3, trend: 0, severity: 'danger' as const },
];

const SLA_BREACH_BY_TYPE = [
  { type: 'Delay', breaches: 48, total: 312, rate: 15.4 },
  { type: 'Cancellation', breaches: 23, total: 198, rate: 11.6 },
  { type: 'Denied Boarding', breaches: 14, total: 87, rate: 16.1 },
  { type: 'Diversion', breaches: 9, total: 54, rate: 16.7 },
];

const OVERRIDE_FREQUENCY = [
  { agent: 'M. Al-Rashid', overrides: 34, total: 189, rate: 18.0 },
  { agent: 'M. Brown', overrides: 28, total: 164, rate: 17.1 },
  { agent: 'A. Sharma', overrides: 25, total: 176, rate: 14.2 },
  { agent: 'R. Kumar', overrides: 22, total: 201, rate: 10.9 },
  { agent: 'A. Patel', overrides: 19, total: 234, rate: 8.1 },
  { agent: 'C. Martinez', overrides: 14, total: 193, rate: 7.3 },
];

// ─────────────────────────────────────────────────────────────────────────────
// Drawer metric definitions for top row cards
// ─────────────────────────────────────────────────────────────────────────────

const DRAWER_METRICS: Record<string, DrawerMetric> = {
  receivedToday: {
    id: 'receivedToday',
    title: 'Claims Received Today',
    value: TODAY_METRICS.claimsReceivedToday,
    trend: { direction: 'up', value: '+21% vs 7-day avg', isPositive: true },
    sparklineData: SPARKLINE_RECEIVED,
    chartData: [
      { label: 'Aug', value: 1024 }, { label: 'Sep', value: 1187 }, { label: 'Oct', value: 1342 },
      { label: 'Nov', value: 1198 }, { label: 'Dec', value: 1456 }, { label: 'Jan', value: 1321 },
      { label: 'Feb', value: 1289 }, { label: 'Mar', value: 1401 },
    ],
    chartColor: '#2563EB',
    insights: [
      'Today\'s intake is 21% above the 7-day rolling average of 38.9.',
      'Peak submission hours are 9–11 AM and 3–5 PM local time.',
      'Delay claims account for 62% of today\'s submissions — up from 54% last week.',
    ],
    relatedMetrics: [
      { label: 'Processed Today', value: '38' },
      { label: 'Pending Pipeline', value: '156' },
      { label: '7-Day Avg', value: '38.9' },
      { label: 'Monthly Total', value: '1,401' },
    ],
  },
  processedToday: {
    id: 'processedToday',
    title: 'Claims Processed Today',
    value: TODAY_METRICS.claimsProcessedToday,
    trend: { direction: 'up', value: '+8% vs avg', isPositive: true },
    sparklineData: SPARKLINE_PROCESSED,
    chartData: [
      { label: 'Aug', value: 892 }, { label: 'Sep', value: 1043 }, { label: 'Oct', value: 1201 },
      { label: 'Nov', value: 1089 }, { label: 'Dec', value: 1312 }, { label: 'Jan', value: 1198 },
      { label: 'Feb', value: 1167 }, { label: 'Mar', value: 1254 },
    ],
    chartColor: '#10B981',
    insights: [
      'Processing rate of 81% of received claims keeps the backlog stable.',
      'Auto-straight-through processing handles 23.8% without agent intervention.',
      'Average processing time has improved by 0.4 days over the past month.',
    ],
    relatedMetrics: [
      { label: 'Received Today', value: '47' },
      { label: 'STP Rate', value: '23.8%' },
      { label: 'Avg Process Time', value: '72h' },
      { label: 'Monthly Total', value: '1,254' },
    ],
  },
  pending: {
    id: 'pending',
    title: 'Claims Pending',
    value: TODAY_METRICS.claimsPending,
    trend: { direction: 'down', value: '-3.2% vs yesterday', isPositive: true },
    sparklineData: SPARKLINE_PENDING,
    chartData: [
      { label: 'Aug', value: 198 }, { label: 'Sep', value: 187 }, { label: 'Oct', value: 174 },
      { label: 'Nov', value: 183 }, { label: 'Dec', value: 169 }, { label: 'Jan', value: 161 },
      { label: 'Feb', value: 168 }, { label: 'Mar', value: 156 },
    ],
    chartColor: '#6366F1',
    insights: [
      'Pipeline depth has reduced by 21% over the past 6 months — a positive trend.',
      '34 claims have been pending for more than 48 hours and require attention.',
      'Validation stage holds the largest backlog sub-group at 38% of pending.',
    ],
    relatedMetrics: [
      { label: '>24h Backlog', value: '87' },
      { label: '>48h Backlog', value: '34' },
      { label: 'Oldest Claim', value: '11 days' },
      { label: 'SLA Breaches', value: '4.2%' },
    ],
  },
  sla: {
    id: 'sla',
    title: 'SLA Compliance Rate',
    value: '96.3%',
    trend: { direction: 'up', value: '+0.5% vs prev period', isPositive: true },
    sparklineData: [94.8, 95.1, 95.6, 95.3, 95.8, 96.0, 95.7, 96.1, 95.9, 96.2, 96.0, 96.3, 96.1, 96.3],
    chartData: [
      { label: 'Aug', value: 94 }, { label: 'Sep', value: 95 }, { label: 'Oct', value: 94 },
      { label: 'Nov', value: 95 }, { label: 'Dec', value: 96 }, { label: 'Jan', value: 95 },
      { label: 'Feb', value: 96 }, { label: 'Mar', value: 96 },
    ],
    chartColor: '#10B981',
    insights: [
      'SLA compliance is at its highest level in 8 months.',
      'Delay claims have the highest breach rate at 15.4% — above the 10% target.',
      'Top 3 agents maintain 97%+ SLA compliance; bottom 3 average 89%.',
    ],
    relatedMetrics: [
      { label: 'Total Breaches', value: '94' },
      { label: 'Breach Rate', value: '3.7%' },
      { label: 'Target', value: '95%+' },
      { label: 'Best Agent', value: '99%' },
    ],
  },
  avgProcessing: {
    id: 'avgProcessing',
    title: 'Avg Processing Time',
    value: '72h',
    trend: { direction: 'down', value: '-0.4h improvement', isPositive: true },
    sparklineData: [79, 77, 78, 76, 75, 74, 76, 73, 75, 72, 74, 73, 72, 72],
    chartData: [
      { label: 'Aug', value: 82 }, { label: 'Sep', value: 80 }, { label: 'Oct', value: 79 },
      { label: 'Nov', value: 78 }, { label: 'Dec', value: 76 }, { label: 'Jan', value: 75 },
      { label: 'Feb', value: 73 }, { label: 'Mar', value: 72 },
    ],
    chartColor: '#F59E0B',
    insights: [
      'Processing time has improved steadily by 12% over 8 months.',
      'Simple delay claims resolve in under 24h; complex cases average 4.2 days.',
      'AI-assisted validation reduced manual review time by an estimated 1.8h/claim.',
    ],
    relatedMetrics: [
      { label: 'Simple Claims', value: '<24h' },
      { label: 'Complex Claims', value: '4.2 days' },
      { label: 'AI Time Saved', value: '1.8h/claim' },
      { label: 'Target SLA', value: '72h' },
    ],
  },
  fcr: {
    id: 'fcr',
    title: 'First-Contact Resolution',
    value: '67.4%',
    trend: { direction: 'up', value: '+2.1% vs prev', isPositive: true },
    sparklineData: [61, 62, 63, 62, 64, 65, 64, 66, 65, 67, 66, 67, 67, 67.4],
    chartData: [
      { label: 'Aug', value: 61 }, { label: 'Sep', value: 62 }, { label: 'Oct', value: 63 },
      { label: 'Nov', value: 64 }, { label: 'Dec', value: 65 }, { label: 'Jan', value: 65 },
      { label: 'Feb', value: 66 }, { label: 'Mar', value: 67 },
    ],
    chartColor: '#F59E0B',
    insights: [
      'FCR has grown consistently from 61% to 67.4% over the past 8 months.',
      'Top driver of improvement is better AI document extraction reducing re-requests.',
      'Target of 70% FCR expected to be reached within 2 months at current pace.',
    ],
    relatedMetrics: [
      { label: 'Target FCR', value: '70%' },
      { label: 'Re-request Rate', value: '32.6%' },
      { label: 'Avg Re-requests', value: '1.4' },
      { label: 'Customer Sat.', value: '4.2/5' },
    ],
  },
  rejectedToday: {
    id: 'rejectedToday',
    title: 'Claims Rejected Today',
    value: TODAY_METRICS.claimsRejectedToday,
    trend: { direction: 'down', value: '-3 vs yesterday', isPositive: true },
    sparklineData: SPARKLINE_REJECTED,
    chartData: [
      { label: 'Aug', value: 187 }, { label: 'Sep', value: 212 }, { label: 'Oct', value: 198 },
      { label: 'Nov', value: 176 }, { label: 'Dec', value: 203 }, { label: 'Jan', value: 158 },
      { label: 'Feb', value: 149 }, { label: 'Mar', value: 141 },
    ],
    chartColor: '#F43F5E',
    insights: [
      'Rejection volumes are trending down — 24% fewer rejections than 6 months ago.',
      'Top rejection reason is missing documentation (38% of all rejections).',
      'EU261 claims have a 14.2% rejection rate — highest across all claim types.',
    ],
    relatedMetrics: [
      { label: 'Rejection Rate', value: '14.2%' },
      { label: 'Top Reason', value: 'Missing Docs' },
      { label: 'Monthly Total', value: '141' },
      { label: '7-Day Avg', value: '10.4' },
    ],
  },
  stp: {
    id: 'stp',
    title: 'Straight-Through Rate',
    value: '23.8%',
    trend: { direction: 'up', value: '+1.4% this month', isPositive: true },
    sparklineData: [18, 19, 20, 19, 21, 21, 22, 22, 23, 23, 23, 24, 23, 23.8],
    chartData: [
      { label: 'Aug', value: 18 }, { label: 'Sep', value: 19 }, { label: 'Oct', value: 20 },
      { label: 'Nov', value: 21 }, { label: 'Dec', value: 21 }, { label: 'Jan', value: 22 },
      { label: 'Feb', value: 23 }, { label: 'Mar', value: 24 },
    ],
    chartColor: '#8B5CF6',
    insights: [
      'STP rate has grown 6 percentage points since August, saving significant agent time.',
      'Estimated 312 agent-hours saved per month at current STP levels.',
      'Target of 30% STP by Q3 is achievable with planned rules engine enhancements.',
    ],
    relatedMetrics: [
      { label: 'Target STP', value: '30%' },
      { label: 'Agent Hours Saved', value: '312/mo' },
      { label: 'Auto-Approved', value: '334/mo' },
      { label: 'Rules Active', value: '47' },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: scale pipeline to period
// ─────────────────────────────────────────────────────────────────────────────

function scalePipeline(period: Period) {
  const scale = getScaleFactor(period);
  return PIPELINE_STAGES.map((s) => ({
    ...s,
    count: Math.round(s.count * scale),
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function OperationsDashboardPage() {
  const [period, setPeriod] = useState<Period>('30d');
  const [activeDrawer, setActiveDrawer] = useState<DrawerMetric | null>(null);

  const openDrawer = useCallback((metricId: string) => {
    setActiveDrawer(DRAWER_METRICS[metricId] ?? null);
  }, []);

  const closeDrawer = useCallback(() => setActiveDrawer(null), []);

  const scale = getScaleFactor(period);
  const sliceCount = getSliceCount(period);

  // Slice from analyticsData
  const periodData = analyticsData.claimsByMonth.slice(-sliceCount);
  const slaData = analyticsData.slaComplianceData.slice(-sliceCount);
  const agentPerf = analyticsData.agentPerformance;

  // ── Row 1: Key Metrics ──────────────────────────────────────────────────

  const currentSLA = slaData[slaData.length - 1]?.complianceRate ?? 96.3;
  const prevSLA = slaData[slaData.length - 2]?.complianceRate ?? 95.8;
  const avgProcessingHours = ((slaData[slaData.length - 1]?.avgResolutionDays ?? 3.0) * 24);
  const prevProcessingHours = ((slaData[slaData.length - 2]?.avgResolutionDays ?? 3.1) * 24);

  const periodTotalClaims = periodData.reduce((s, d) => s + d.claims, 0);
  const periodApproved = periodData.reduce((s, d) => s + d.approved, 0);
  const periodRejected = periodData.reduce((s, d) => s + d.rejected, 0);

  const firstContactResolution = 67.4;
  const stpRate = 23.8;

  // ── Row 2: Pipeline ─────────────────────────────────────────────────────

  const pipeline = useMemo(() => scalePipeline(period), [period]);
  const maxPipelineCount = Math.max(...pipeline.map((s) => s.count));

  // ── Row 3: Rejection Analysis ───────────────────────────────────────────

  const rejectionReasons = useMemo(() => {
    return analyticsData.rejectionReasons.map((r) => ({
      reason: r.reason,
      Count: Math.round(r.count * scale),
    }));
  }, [scale]);

  const rejectionRateTrend = useMemo(() => {
    return REJECTION_RATE_TREND.slice(-sliceCount).map((d) => ({
      month: d.month,
      'Rejection Rate %': d.rate,
    }));
  }, [sliceCount]);

  const failedByStage = useMemo(() => {
    return FAILED_BY_STAGE.map((d) => ({
      name: d.name,
      value: Math.round(d.value * scale),
    }));
  }, [scale]);

  // Agent rejection data from analytics
  const agentRejectionData = useMemo(() => {
    return agentPerf
      .map((a) => ({
        agent: a.agentName.split(' ')[0][0] + '. ' + a.agentName.split(' ').slice(-1)[0],
        'Return Rate %': a.returnRate,
        'Rejection Rate %': Math.round((100 - a.approvalRate) * 10) / 10,
      }))
      .sort((a, b) => b['Return Rate %'] - a['Return Rate %'])
      .slice(0, 8);
  }, [agentPerf]);

  // ── Row 4: SLA & Processing ─────────────────────────────────────────────

  const totalBreaches = useMemo(
    () => slaData.reduce((s, d) => s + d.claimsBreached, 0),
    [slaData],
  );

  const breachRate = useMemo(
    () => periodTotalClaims > 0 ? ((totalBreaches / periodTotalClaims) * 100).toFixed(1) : '0.0',
    [totalBreaches, periodTotalClaims],
  );

  const complexityData = useMemo(() => {
    return analyticsData.processingTimeByComplexity.map((d) => ({
      complexity: d.complexity.split('(')[0].trim(),
      'Avg Days': d.avgDays,
      'Auto-Process %': d.autoProcessRate,
    }));
  }, []);

  const processingDistribution = useMemo(() => {
    return PROCESSING_TIME_DISTRIBUTION.map((d) => ({
      ...d,
      count: Math.round(d.count * scale),
    }));
  }, [scale]);

  const totalDistClaims = processingDistribution.reduce((s, d) => s + d.count, 0);

  // ── Row 5: Agent Performance ────────────────────────────────────────────

  const agents = useMemo(() => mockUsers.filter((u) => u.role === 'claims_agent'), []);

  const topPerformers = useMemo(() => {
    return [...agentPerf].sort((a, b) => b.accuracy - a.accuracy).slice(0, 3);
  }, [agentPerf]);

  const bottomPerformers = useMemo(() => {
    return [...agentPerf].sort((a, b) => a.accuracy - b.accuracy).slice(0, 3);
  }, [agentPerf]);

  const agentUtilization = useMemo(() => {
    return agents.map((a) => {
      const perf = agentPerf.find((p) => p.agentId === a.id);
      return {
        name: a.name.split(' ')[0][0] + '. ' + a.name.split(' ').slice(-1)[0],
        fullName: a.name,
        load: a.currentLoad,
        capacity: a.capacity,
        utilization: Math.round((a.currentLoad / a.capacity) * 100),
        accuracy: perf?.accuracy ?? 0,
      };
    }).sort((a, b) => b.utilization - a.utilization);
  }, [agents, agentPerf]);

  // ── Row 6: Disruption & Route ───────────────────────────────────────────

  const disruptionDonut = useMemo(() => {
    return analyticsData.claimsByDisruptionType.map((d) => ({
      name: d.type,
      value: Math.round(d.count * scale),
    }));
  }, [scale]);

  const topRoutes = useMemo(() => {
    return [...analyticsData.routeAnalytics]
      .sort((a, b) => b.claimCount - a.claimCount)
      .slice(0, 10)
      .map((r) => ({
        ...r,
        claimCount: Math.round(r.claimCount * scale),
        totalPayout: Math.round(r.totalPayout * scale),
      }));
  }, [scale]);

  const jurisdictionData = useMemo(() => {
    return analyticsData.claimsByJurisdiction.map((j) => ({
      name: j.jurisdiction,
      value: Math.round(j.count * scale),
    }));
  }, [scale]);

  const periodTabs = PERIODS.map((p) => ({ label: p.label, value: p.value }));

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6">
      {/* Detail Drawer */}
      <DetailDrawer metric={activeDrawer} onClose={closeDrawer} />

      {/* Header with period selector */}
      <PageHeader
        title="Operations Dashboard"
        description="Real-time overview of claims operations, pipeline health, and team performance."
        actions={
          <TabBar
            tabs={periodTabs}
            activeTab={period}
            onChange={(v) => setPeriod(v as Period)}
            variant="segmented"
          />
        }
      />

      {/* Period summary banner */}
      <div className="flex flex-wrap items-center gap-4 sm:gap-6 px-4 py-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-[var(--radius-md)] text-xs text-slate-600 dark:text-slate-300">
        <span className="font-semibold text-blue-700 dark:text-blue-400">
          {PERIODS.find((p) => p.value === period)?.label} Summary
        </span>
        <span>Claims received: <span className="font-semibold tabular-nums">{periodTotalClaims.toLocaleString()}</span></span>
        <span>Approved: <span className="font-semibold text-emerald-600 tabular-nums">{periodApproved.toLocaleString()}</span></span>
        <span>Rejected: <span className="font-semibold text-red-500 tabular-nums">{periodRejected.toLocaleString()}</span></span>
        <span>Approval Rate: <span className="font-semibold tabular-nums">{periodTotalClaims > 0 ? ((periodApproved / periodTotalClaims) * 100).toFixed(1) : 0}%</span></span>
        <span>Avg SLA: <span className="font-semibold tabular-nums">{currentSLA.toFixed(1)}%</span></span>
      </div>

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* ROW 1: Key Operational Metrics — 8 cards in 2 rows of 4              */}
      {/* ────────────────────────────────────────────────────────────────────── */}

      <SectionHeading
        icon={<BarChart3 className="w-4 h-4" />}
        title="Key Operational Metrics"
        description="Click any card to see a detailed breakdown. Today's snapshot and period performance indicators."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 [&>*]:min-w-0 [&>*]:overflow-hidden">
        <div
          className="cursor-pointer rounded-[var(--radius-md)] ring-0 hover:ring-2 hover:ring-blue-300 dark:hover:ring-blue-700 transition-all"
          onClick={() => openDrawer('receivedToday')}
        >
          <MetricCard
            label="Claims Received Today"
            value={TODAY_METRICS.claimsReceivedToday}
            icon={<Inbox className="w-4 h-4" />}
            trend={{ direction: 'up', value: '+21% vs 7-day avg', isPositive: true }}
            sparklineData={SPARKLINE_RECEIVED}
          />
        </div>
        <div
          className="cursor-pointer rounded-[var(--radius-md)] ring-0 hover:ring-2 hover:ring-blue-300 dark:hover:ring-blue-700 transition-all"
          onClick={() => openDrawer('processedToday')}
        >
          <MetricCard
            label="Claims Processed Today"
            value={TODAY_METRICS.claimsProcessedToday}
            icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
            trend={{ direction: 'up', value: '+8% vs avg', isPositive: true }}
            sparklineData={SPARKLINE_PROCESSED}
          />
        </div>
        <div
          className="cursor-pointer rounded-[var(--radius-md)] ring-0 hover:ring-2 hover:ring-blue-300 dark:hover:ring-blue-700 transition-all"
          onClick={() => openDrawer('pending')}
        >
          <MetricCard
            label="Claims Pending"
            value={TODAY_METRICS.claimsPending}
            icon={<Loader2 className="w-4 h-4 text-blue-500" />}
            trend={{ direction: 'down', value: '-3.2% vs yesterday', isPositive: true }}
            sparklineData={SPARKLINE_PENDING}
          />
        </div>
        <div
          className="cursor-pointer rounded-[var(--radius-md)] ring-0 hover:ring-2 hover:ring-blue-300 dark:hover:ring-blue-700 transition-all"
          onClick={() => openDrawer('sla')}
        >
          <MetricCard
            label="SLA Compliance Rate"
            value={`${currentSLA.toFixed(1)}%`}
            icon={<ShieldCheck className="w-4 h-4 text-emerald-500" />}
            trend={{
              direction: currentSLA >= prevSLA ? 'up' : 'down',
              value: `${currentSLA >= prevSLA ? '+' : ''}${(currentSLA - prevSLA).toFixed(1)}% vs prev`,
              isPositive: currentSLA >= prevSLA,
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 [&>*]:min-w-0 [&>*]:overflow-hidden">
        <div
          className="cursor-pointer rounded-[var(--radius-md)] ring-0 hover:ring-2 hover:ring-blue-300 dark:hover:ring-blue-700 transition-all"
          onClick={() => openDrawer('avgProcessing')}
        >
          <MetricCard
            label="Avg Processing Time"
            value={`${avgProcessingHours.toFixed(0)}h`}
            icon={<Timer className="w-4 h-4 text-slate-500" />}
            trend={{
              direction: avgProcessingHours <= prevProcessingHours ? 'down' : 'up',
              value: `${Math.abs(avgProcessingHours - prevProcessingHours).toFixed(0)}h improvement`,
              isPositive: avgProcessingHours <= prevProcessingHours,
            }}
          />
        </div>
        <div
          className="cursor-pointer rounded-[var(--radius-md)] ring-0 hover:ring-2 hover:ring-blue-300 dark:hover:ring-blue-700 transition-all"
          onClick={() => openDrawer('fcr')}
        >
          <MetricCard
            label="First-Contact Resolution"
            value={`${firstContactResolution}%`}
            icon={<Zap className="w-4 h-4 text-amber-500" />}
            trend={{ direction: 'up', value: '+2.1% vs prev', isPositive: true }}
          />
        </div>
        <div
          className="cursor-pointer rounded-[var(--radius-md)] ring-0 hover:ring-2 hover:ring-blue-300 dark:hover:ring-blue-700 transition-all"
          onClick={() => openDrawer('rejectedToday')}
        >
          <MetricCard
            label="Claims Rejected Today"
            value={TODAY_METRICS.claimsRejectedToday}
            icon={<XCircle className="w-4 h-4 text-red-500" />}
            trend={{ direction: 'down', value: '-3 vs yesterday', isPositive: true }}
            sparklineData={SPARKLINE_REJECTED}
          />
        </div>
        <div
          className="cursor-pointer rounded-[var(--radius-md)] ring-0 hover:ring-2 hover:ring-blue-300 dark:hover:ring-blue-700 transition-all"
          onClick={() => openDrawer('stp')}
        >
          <MetricCard
            label="Straight-Through Rate"
            value={`${stpRate}%`}
            icon={<RefreshCw className="w-4 h-4 text-indigo-500" />}
            trend={{ direction: 'up', value: '+1.4% this month', isPositive: true }}
          />
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* ROW 2: Claims Pipeline Funnel                                        */}
      {/* ────────────────────────────────────────────────────────────────────── */}

      <SectionHeading
        icon={<ArrowRight className="w-4 h-4" />}
        title="Claims Pipeline Funnel"
        description="End-to-end flow showing claim counts at each processing stage"
      />

      <SectionCard title="Pipeline Stages" subtitle={`${PERIODS.find((p) => p.value === period)?.label} volume`}>
        <div className="flex flex-col gap-3 overflow-hidden">
          {pipeline.map((stage, i) => {
            const widthPct = maxPipelineCount > 0 ? (stage.count / maxPipelineCount) * 100 : 0;
            const dropoff = i > 0 ? pipeline[i - 1].count - stage.count : 0;
            const dropoffPct = i > 0 && pipeline[i - 1].count > 0
              ? ((dropoff / pipeline[i - 1].count) * 100).toFixed(1)
              : null;
            return (
              <div key={stage.stage} className="flex items-center gap-3">
                <div className="w-24 shrink-0 text-right">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{stage.stage}</span>
                </div>
                <div className="flex-1 relative h-8 bg-slate-100 dark:bg-slate-800 rounded-md overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-md transition-all duration-700 ease-out flex items-center"
                    style={{ width: `${widthPct}%`, backgroundColor: stage.color }}
                  >
                    <span className="ml-2 text-xs font-bold text-white drop-shadow-sm tabular-nums">
                      {stage.count.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="w-20 shrink-0">
                  {dropoffPct !== null && dropoff > 0 && (
                    <span className="text-[10px] text-red-400 dark:text-red-400 tabular-nums">
                      -{dropoff.toLocaleString()} ({dropoffPct}%)
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-emerald-600">Throughput Rate: </span>
            <span className="tabular-nums font-semibold">
              {maxPipelineCount > 0 ? ((pipeline[pipeline.length - 1].count / pipeline[0].count) * 100).toFixed(1) : 0}%
            </span>
            <span className="ml-1 text-slate-400">of ingested claims reach payment</span>
          </div>
        </div>
      </SectionCard>

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* ROW 3: Rejection & Failure Analysis                                  */}
      {/* ────────────────────────────────────────────────────────────────────── */}

      <SectionHeading
        icon={<ThumbsDown className="w-4 h-4" />}
        title="Rejection & Failure Analysis"
        description="Understand why claims fail and where in the pipeline they break down"
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Rejection Reasons — Horizontal Bar (bars go left-to-right for label room) */}
        <SectionCard title="Top Rejection Reasons" subtitle="Ranked by volume — horizontal bars for full label visibility">
          <div className="h-[320px]">
            <BarChart
              data={rejectionReasons}
              xKey="reason"
              yKeys={['Count']}
              height={320}
              showGrid
              colors={['#F43F5E']}
              layout="vertical"
            />
          </div>
        </SectionCard>

        {/* Rejection Rate Trend */}
        <SectionCard title="Rejection Rate Trend" subtitle="Monthly rejection rate %">
          <div className="h-[320px]">
            <LineChart
              data={rejectionRateTrend}
              xKey="month"
              yKeys={['Rejection Rate %']}
              height={320}
              colors={['#F43F5E']}
            />
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Failed Claims by Stage — Donut */}
        <SectionCard title="Failed Claims by Pipeline Stage" subtitle="Where in the pipeline claims fail">
          <div className="h-[240px]">
            <DonutChart
              data={failedByStage}
              height={240}
            />
          </div>
        </SectionCard>

        {/* Rejection by Agent — Bar */}
        <SectionCard title="Return & Rejection Rate by Agent" subtitle="Identifies agents needing training or support">
          <div className="h-[240px]">
            <BarChart
              data={agentRejectionData}
              xKey="agent"
              yKeys={['Return Rate %', 'Rejection Rate %']}
              height={240}
              showGrid
              colors={['#F59E0B', '#F43F5E']}
            />
          </div>
        </SectionCard>
      </div>

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* ROW 4: SLA & Processing Performance                                  */}
      {/* ────────────────────────────────────────────────────────────────────── */}

      <SectionHeading
        icon={<Target className="w-4 h-4" />}
        title="SLA & Processing Performance"
        description="Service level adherence and processing time analytics"
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* SLA Breach Analysis */}
        <SectionCard title="SLA Breach Analysis" subtitle="Breaches by disruption type">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/15 border border-red-100 dark:border-red-900/30">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-red-500">Total Breaches</p>
                <p className="text-2xl font-bold tabular-nums text-red-600 dark:text-red-400">{totalBreaches}</p>
              </div>
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/15 border border-amber-100 dark:border-amber-900/30">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-600">Breach Rate</p>
                <p className="text-2xl font-bold tabular-nums text-amber-600 dark:text-amber-400">{breachRate}%</p>
              </div>
            </div>
            <div className="space-y-2">
              {SLA_BREACH_BY_TYPE.map((item) => (
                <div key={item.type} className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">{item.type}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 tabular-nums">{item.breaches}/{item.total}</span>
                    <span className={`font-semibold tabular-nums ${item.rate > 15 ? 'text-red-500' : 'text-amber-500'}`}>
                      {item.rate}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* Resolution Time by Complexity */}
        <SectionCard title="Avg Resolution by Complexity" subtitle="Processing days by claim complexity">
          <div className="h-[240px]">
            <BarChart
              data={complexityData}
              xKey="complexity"
              yKeys={['Avg Days']}
              height={240}
              showGrid
              colors={['#8B5CF6']}
            />
          </div>
        </SectionCard>

        {/* Processing Time Distribution */}
        <SectionCard title="Processing Time Distribution" subtitle="How fast claims get resolved">
          <div className="space-y-2.5">
            {processingDistribution.map((d) => {
              const pct = totalDistClaims > 0 ? (d.count / totalDistClaims) * 100 : 0;
              return (
                <div key={d.bucket} className="flex items-center gap-3">
                  <span className="w-16 shrink-0 text-xs font-medium text-slate-500 dark:text-slate-400 text-right tabular-nums">
                    {d.bucket}
                  </span>
                  <div className="flex-1 h-6 bg-slate-100 dark:bg-slate-800 rounded overflow-hidden relative">
                    <div
                      className="absolute inset-y-0 left-0 rounded transition-all duration-500 flex items-center"
                      style={{ width: `${pct}%`, backgroundColor: d.color }}
                    >
                      {pct > 12 && (
                        <span className="ml-2 text-[10px] font-bold text-white tabular-nums">{d.count}</span>
                      )}
                    </div>
                  </div>
                  <span className="w-12 shrink-0 text-xs text-slate-500 tabular-nums text-right">{pct.toFixed(1)}%</span>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>

      {/* Backlog Aging */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {BACKLOG_AGING.map((item) => {
          const severityColors = {
            warning: 'bg-amber-50 dark:bg-amber-900/15 border-amber-200 dark:border-amber-900/30',
            critical: 'bg-orange-50 dark:bg-orange-900/15 border-orange-200 dark:border-orange-900/30',
            danger: 'bg-red-50 dark:bg-red-900/15 border-red-200 dark:border-red-900/30',
          };
          const textColors = {
            warning: 'text-amber-700 dark:text-amber-400',
            critical: 'text-orange-700 dark:text-orange-400',
            danger: 'text-red-700 dark:text-red-400',
          };
          return (
            <div
              key={item.bracket}
              className={`p-4 rounded-[var(--radius-md)] border ${severityColors[item.severity]}`}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Backlog {item.bracket}
              </p>
              <div className="flex items-end justify-between">
                <p className={`text-3xl font-bold tabular-nums ${textColors[item.severity]}`}>
                  {Math.round(item.count * scale)}
                </p>
                <span className={`text-xs font-medium tabular-nums flex items-center gap-0.5 ${item.trend <= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {item.trend <= 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                  {item.trend > 0 ? '+' : ''}{item.trend}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* ROW 5: Agent Performance Overview                                    */}
      {/* ────────────────────────────────────────────────────────────────────── */}

      <SectionHeading
        icon={<Users className="w-4 h-4" />}
        title="Agent Performance Overview"
        description="Utilization, accuracy leaders, and AI override patterns"
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Agent Utilization */}
        <SectionCard title="Agent Utilization" subtitle="Current load vs capacity" className="xl:col-span-1">
          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
            {agentUtilization.map((agent) => {
              const barColor = agent.utilization >= 90
                ? '#EF4444'
                : agent.utilization >= 70
                ? '#F59E0B'
                : '#10B981';
              return (
                <div key={agent.fullName} className="flex items-center gap-2.5">
                  <span className="w-24 shrink-0 text-xs text-slate-600 dark:text-slate-300 font-medium truncate" title={agent.fullName}>
                    {agent.name}
                  </span>
                  <div className="flex-1 h-5 bg-slate-100 dark:bg-slate-800 rounded-sm overflow-hidden relative">
                    <div
                      className="absolute inset-y-0 left-0 rounded-sm transition-all duration-300"
                      style={{ width: `${agent.utilization}%`, backgroundColor: barColor }}
                    />
                  </div>
                  <span className="w-14 shrink-0 text-xs font-semibold tabular-nums text-slate-600 dark:text-slate-300 text-right">
                    {agent.load}/{agent.capacity}
                  </span>
                  <span className={`w-10 shrink-0 text-xs font-bold tabular-nums text-right ${
                    agent.utilization >= 90 ? 'text-red-500' : agent.utilization >= 70 ? 'text-amber-500' : 'text-emerald-500'
                  }`}>
                    {agent.utilization}%
                  </span>
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* Top / Bottom Performers */}
        <SectionCard title="Top & Bottom Performers" subtitle="By accuracy score">
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 mb-2 flex items-center gap-1">
                <Award className="w-3 h-3" /> Top 3
              </p>
              <div className="space-y-2">
                {topPerformers.map((a, i) => (
                  <div key={a.agentId} className="flex items-center gap-3 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20">
                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] font-bold">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{a.agentName}</p>
                      <p className="text-[10px] text-slate-400">{a.claimsProcessed} claims | {a.avgResolutionDays}d avg</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-emerald-600 tabular-nums">{a.accuracy}%</p>
                      <p className="text-[10px] text-slate-400">accuracy</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-red-500 mb-2 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Bottom 3 — Needs Support
              </p>
              <div className="space-y-2">
                {bottomPerformers.map((a) => (
                  <div key={a.agentId} className="flex items-center gap-3 p-2.5 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-red-400 text-white text-[10px] font-bold">
                      !
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{a.agentName}</p>
                      <p className="text-[10px] text-slate-400">{a.claimsProcessed} claims | {a.returnRate}% returns</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-red-500 tabular-nums">{a.accuracy}%</p>
                      <p className="text-[10px] text-slate-400">accuracy</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Override Frequency */}
        <SectionCard title="AI Override Frequency" subtitle="Agents who override AI extractions most">
          <div className="space-y-3">
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              High override rates may indicate AI model issues or agent training needs.
            </p>
            <div className="space-y-2.5">
              {OVERRIDE_FREQUENCY.map((item) => {
                const isHigh = item.rate > 15;
                const isMedium = item.rate > 10 && item.rate <= 15;
                return (
                  <div key={item.agent} className="flex items-center gap-3">
                    <span className="w-24 shrink-0 text-xs font-medium text-slate-600 dark:text-slate-300">
                      {item.agent}
                    </span>
                    <div className="flex-1 h-5 bg-slate-100 dark:bg-slate-800 rounded-sm overflow-hidden relative">
                      <div
                        className="absolute inset-y-0 left-0 rounded-sm"
                        style={{
                          width: `${item.rate * 5}%`,
                          backgroundColor: isHigh ? '#EF4444' : isMedium ? '#F59E0B' : '#10B981',
                        }}
                      />
                    </div>
                    <div className="w-20 shrink-0 text-right">
                      <span className={`text-xs font-bold tabular-nums ${isHigh ? 'text-red-500' : isMedium ? 'text-amber-500' : 'text-emerald-500'}`}>
                        {item.rate}%
                      </span>
                      <span className="text-[10px] text-slate-400 ml-1">({item.overrides})</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4 text-[10px] text-slate-400">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> &gt;15% High</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> 10-15% Medium</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> &lt;10% Normal</span>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* ROW 6: Disruption & Route Insights                                   */}
      {/* ────────────────────────────────────────────────────────────────────── */}

      <SectionHeading
        icon={<Plane className="w-4 h-4" />}
        title="Disruption & Route Insights"
        description="Claims distribution by disruption type, route, and jurisdiction"
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Claims by Disruption Type */}
        <SectionCard title="Claims by Disruption Type">
          <div className="h-[240px]">
            <DonutChart data={disruptionDonut} height={240} />
          </div>
        </SectionCard>

        {/* Top 10 Routes */}
        <SectionCard title="Top 10 Routes by Volume" subtitle="Highest claim-generating routes">
          <div className="overflow-auto max-h-[280px]">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-white dark:bg-slate-900">
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="text-left font-semibold text-slate-500 py-1.5 pr-2">#</th>
                  <th className="text-left font-semibold text-slate-500 py-1.5 pr-2">Route</th>
                  <th className="text-right font-semibold text-slate-500 py-1.5 pr-2">Claims</th>
                  <th className="text-right font-semibold text-slate-500 py-1.5 pr-2">Payout</th>
                  <th className="text-left font-semibold text-slate-500 py-1.5">Top Disruption</th>
                </tr>
              </thead>
              <tbody>
                {topRoutes.map((r, i) => (
                  <tr key={r.route} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-1.5 pr-2 text-slate-400 tabular-nums">{i + 1}</td>
                    <td className="py-1.5 pr-2 font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {r.route}
                      </span>
                    </td>
                    <td className="py-1.5 pr-2 text-right font-semibold tabular-nums text-slate-700 dark:text-slate-200">
                      {r.claimCount.toLocaleString()}
                    </td>
                    <td className="py-1.5 pr-2 text-right tabular-nums text-slate-500">
                      ${(r.totalPayout / 1000).toFixed(0)}K
                    </td>
                    <td className="py-1.5 capitalize text-slate-500">
                      {r.topDisruption.replace(/_/g, ' ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* Claims by Jurisdiction */}
        <SectionCard title="Claims by Jurisdiction" subtitle="Regulatory awareness">
          <div className="h-[240px]">
            <DonutChart data={jurisdictionData} height={240} />
          </div>
        </SectionCard>
      </div>

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* ROW 7: SLA Compliance & Claims Volume Trends                         */}
      {/* ────────────────────────────────────────────────────────────────────── */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <SectionCard title="Claims Received vs Processed" subtitle="Monthly volume trend">
          <div className="h-[240px]">
            <BarChart
              data={periodData.map((d) => ({
                month: d.month.slice(0, 3),
                Received: d.claims,
                Approved: d.approved,
                Rejected: d.rejected,
              }))}
              xKey="month"
              yKeys={['Received', 'Approved', 'Rejected']}
              height={240}
              stacked={false}
              showGrid
              colors={['#2563EB', '#10B981', '#F43F5E']}
            />
          </div>
        </SectionCard>

        <SectionCard title="SLA Compliance Trend" subtitle="Monthly compliance rate %">
          <div className="h-[240px]">
            <LineChart
              data={slaData.map((d) => ({
                month: d.month.slice(0, 3),
                'SLA Compliance %': d.complianceRate,
              }))}
              xKey="month"
              yKeys={['SLA Compliance %']}
              height={240}
              colors={['#10B981']}
            />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
