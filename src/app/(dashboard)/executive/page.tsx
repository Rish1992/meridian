'use client';

import React, { useState, useCallback } from 'react';
import { Download, X, TrendingUp, TrendingDown } from 'lucide-react';
import { analyticsData } from '@/data/mock-data';
import { PageHeader } from '@/components/layout';
import { Button, MetricCard, DataTable, StatComparisonRow } from '@/components/ui';
import type { DataTableColumn } from '@/components/ui';
import { BarChart, DonutChart, LineChart, GaugeChart } from '@/components/charts';
import { FlightRouteVisualizer } from '@/components/domain';
import { formatCurrency } from '@/lib/utils';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';

// ─────────────────────────────────────────────────────────────────────────────
// Period tabs
// ─────────────────────────────────────────────────────────────────────────────

const PERIOD_TABS = [
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '3 Months', value: '3m' },
  { label: '12 Months', value: '12m' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Shared card wrapper
// ─────────────────────────────────────────────────────────────────────────────

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[var(--radius-md)] p-4 overflow-hidden min-w-0 ${className}`}>
      {children}
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-3">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {title}
      </h2>
      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{subtitle}</p>
    </div>
  );
}

function ChartTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">{children}</h3>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Route risk type
// ─────────────────────────────────────────────────────────────────────────────

interface RouteRiskRow {
  route: string;
  claimCount: number;
  claimsPer1000: number;
  avgPayout: number;
  trend: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Repeat claimant type
// ─────────────────────────────────────────────────────────────────────────────

interface RepeatClaimantRow {
  id: string;
  claimCount: number;
  totalPayout: number;
  tier: string;
  lastClaim: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Metric drawer types
// ─────────────────────────────────────────────────────────────────────────────

interface MetricDetail {
  title: string;
  currentValue: string;
  previousValue: string;
  changePercent: number;
  changePositive: boolean;
  trendData: number[];
  trendLabel: string;
  insights: string[];
  relatedMetrics: { label: string; value: string }[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Inline mock data (for charts not covered by analyticsData)
// ─────────────────────────────────────────────────────────────────────────────

const months12Short = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

const budgetVsActual = [
  { label: 'Total Payout', actual: 4813850, budget: 5200000 },
  { label: 'Hotel Expenses', actual: 1813214, budget: 2000000 },
  { label: 'Carrier Rebooking', actual: 1163132, budget: 1300000 },
  { label: 'Meals', actual: 776524, budget: 850000 },
  { label: 'Transport', actual: 294418, budget: 340000 },
  { label: 'Processing Cost', actual: 542000, budget: 580000 },
];

const costPerClaimTrend = months12Short.map((month, i) => ({
  month,
  costPerClaim: [48, 46, 44, 43, 41, 39, 38, 36, 35, 34, 33, 31][i],
}));

const claimsYoY2025 = [892, 834, 1012, 945, 1087, 1198, 1312, 1423, 1567, 1134, 1245, 732];
const claimsYoY2026 = analyticsData.claimsByMonth.map((m) => m.claims);

const claimsYoYData = months12Short.map((month, i) => ({
  month,
  'FY 2024-25': claimsYoY2025[i],
  'FY 2025-26': claimsYoY2026[i],
}));

const claimsFunnel = [
  { stage: 'Received', count: 14956, rate: '100%' },
  { stage: 'Processed', count: 13461, rate: '90.0%' },
  { stage: 'Approved', count: 11667, rate: '86.7%' },
  { stage: 'Paid', count: 10792, rate: '92.5%' },
];

const channelDonut = analyticsData.claimsByChannel.map((c) => ({
  name: c.channel,
  value: c.count,
}));

const jurisdictionDonut = analyticsData.claimsByJurisdiction.map((j) => ({
  name: j.jurisdiction,
  value: j.count,
}));

const disruptionPareto = [
  { type: 'Delay >3h', count: 7842, cumPct: 52.4 },
  { type: 'Cancellation', count: 4187, cumPct: 80.5 },
  { type: 'Denied Boarding', count: 1793, cumPct: 92.5 },
  { type: 'Diversion', count: 1134, cumPct: 100 },
];

// Seasonal pattern — grouped by quarter for better readability
const quarterlySeasonalData = [
  { quarter: 'Q1 (Jan-Mar)', claims: 3767, color: '#6366F1' },
  { quarter: 'Q2 (Apr-Jun)', claims: 3345, color: '#10B981' },
  { quarter: 'Q3 (Jul-Sep)', claims: 3875, color: '#F59E0B' },
  { quarter: 'Q4 (Oct-Dec)', claims: 5146, color: '#EF4444' },
];

const seasonalChartData = quarterlySeasonalData.map((q) => ({
  quarter: q.quarter,
  claims: q.claims,
}));

const routeRiskData: RouteRiskRow[] = analyticsData.routeAnalytics.slice(0, 10).map((r) => ({
  route: r.route,
  claimCount: r.claimCount,
  claimsPer1000: +(r.claimCount / (r.claimCount * 2.8 + 500)).toFixed(1),
  avgPayout: Math.round(r.totalPayout / r.claimCount),
  trend: r.claimCount > 500 ? 'Rising' : r.claimCount > 300 ? 'Stable' : 'Declining',
}));

const slaComplianceTrend = analyticsData.slaComplianceData.map((d) => ({
  month: d.month.slice(0, 3),
  compliance: d.complianceRate,
  target: 95,
}));

const automationImpact = [
  { metric: 'Avg Processing Time', before: '4.2 days', after: '2.8 days', improvement: '-33%' },
  { metric: 'Manual Review Rate', before: '82%', after: '46%', improvement: '-44%' },
  { metric: 'Cost per Claim', before: '$48', after: '$31', improvement: '-35%' },
  { metric: 'Error Rate', before: '6.2%', after: '2.1%', improvement: '-66%' },
  { metric: 'STP Rate', before: '4.1%', after: '18.4%', improvement: '+349%' },
];

const agentProductivityTrend = months12Short.map((month, i) => ({
  month,
  claimsPerAgent: [14.2, 13.8, 15.1, 14.6, 15.8, 16.3, 16.9, 17.4, 18.1, 17.2, 17.8, 18.5][i],
}));

const rejectionRateTrend = months12Short.map((month, i) => ({
  month,
  rejectionRate: [15.4, 14.8, 15.2, 15.0, 14.7, 14.3, 14.1, 13.8, 13.9, 14.1, 13.7, 13.2][i],
}));

const fraudFlagTrend = analyticsData.fraudFlagRate.map((f) => ({
  month: f.month.slice(0, 3),
  flagRate: f.flagRate,
  threshold: 2.5,
}));

const regulatoryExposure = [
  { jurisdiction: 'EU (EC 261)', claimCount: 3721, avgPayout: 412, potentialLiability: 1533052, complianceRisk: 'Medium' },
  { jurisdiction: 'India (DGCA)', claimCount: 6187, avgPayout: 284, potentialLiability: 1757108, complianceRisk: 'Low' },
  { jurisdiction: 'UK (CAA)', claimCount: 1330, avgPayout: 356, potentialLiability: 473480, complianceRisk: 'Medium' },
  { jurisdiction: 'USA (DOT)', claimCount: 843, avgPayout: 521, potentialLiability: 439203, complianceRisk: 'High' },
  { jurisdiction: 'UAE (GCAA)', claimCount: 2315, avgPayout: 298, potentialLiability: 689870, complianceRisk: 'Low' },
];

const repeatClaimants: RepeatClaimantRow[] = [
  { id: 'CLM-ANON-001', claimCount: 7, totalPayout: 3240, tier: 'Platinum', lastClaim: 'Feb 2026' },
  { id: 'CLM-ANON-002', claimCount: 6, totalPayout: 2810, tier: 'Gold', lastClaim: 'Mar 2026' },
  { id: 'CLM-ANON-003', claimCount: 5, totalPayout: 1950, tier: 'None', lastClaim: 'Jan 2026' },
  { id: 'CLM-ANON-004', claimCount: 5, totalPayout: 2340, tier: 'Silver', lastClaim: 'Mar 2026' },
  { id: 'CLM-ANON-005', claimCount: 4, totalPayout: 1720, tier: 'Gold', lastClaim: 'Feb 2026' },
  { id: 'CLM-ANON-006', claimCount: 4, totalPayout: 1580, tier: 'None', lastClaim: 'Dec 2025' },
  { id: 'CLM-ANON-007', claimCount: 4, totalPayout: 2100, tier: 'Platinum', lastClaim: 'Mar 2026' },
];

const resolutionTimeTrend = months12Short.map((month, i) => ({
  month,
  hours: [96, 92, 88, 85, 82, 80, 78, 76, 74, 78, 76, 72][i],
}));

const claimsByTier = [
  { tier: 'Platinum', claims: 1842, approvalRate: 89 },
  { tier: 'Gold', claims: 3456, approvalRate: 82 },
  { tier: 'Silver', claims: 4312, approvalRate: 76 },
  { tier: 'None', claims: 5346, approvalRate: 71 },
];

const topOriginAirports = [
  { airport: 'DEL', claims: 3248 },
  { airport: 'BOM', claims: 2456 },
  { airport: 'LHR', claims: 1834 },
  { airport: 'BLR', claims: 1567 },
  { airport: 'DXB', claims: 1234 },
  { airport: 'MAA', claims: 987 },
  { airport: 'JFK', claims: 876 },
  { airport: 'SIN', claims: 654 },
  { airport: 'FRA', claims: 543 },
  { airport: 'CDG', claims: 432 },
];

// ─────────────────────────────────────────────────────────────────────────────
// Metric detail definitions (for the drawer)
// ─────────────────────────────────────────────────────────────────────────────

const METRIC_DETAILS: Record<string, MetricDetail> = {
  'Total Claims MTD': {
    title: 'Total Claims MTD',
    currentValue: analyticsData.claimsByMonth[analyticsData.claimsByMonth.length - 1].claims.toLocaleString(),
    previousValue: '1,245',
    changePercent: -7.4,
    changePositive: false,
    trendData: analyticsData.claimsByMonth.map((m) => m.claims),
    trendLabel: '12-Month Claim Volume',
    insights: [
      'Claims fell 7.4% YoY — largest single-month decline since Q2 FY24, driven by fewer EU-sector disruptions.',
      'Delay >3h category dropped 12% after runway improvements at DEL and BOM hubs.',
      'Self-service portal deflected ~340 low-value claims this month, reducing inbound volume.',
    ],
    relatedMetrics: [
      { label: 'Approval Rate', value: '86.7%' },
      { label: 'STP Rate', value: '18.4%' },
      { label: 'Avg Payout / Claim', value: '$446' },
    ],
  },
  'Total Payout MTD': {
    title: 'Total Payout MTD',
    currentValue: formatCurrency(analyticsData.payoutByMonth[analyticsData.payoutByMonth.length - 1].totalPayout),
    previousValue: formatCurrency(5082134),
    changePercent: -5.2,
    changePositive: true,
    trendData: analyticsData.payoutByMonth.map((p) => p.totalPayout),
    trendLabel: '12-Month Payout (USD)',
    insights: [
      'Payout decreased 5.2% YoY despite only a 7.4% drop in claims — avg payout per claim slightly increased.',
      'EU261 compensation drove 31% of total payout, up 3% from last year due to GBP/EUR strength.',
      'Hotel expense category remains the largest single line item at 40% of total disbursements.',
    ],
    relatedMetrics: [
      { label: 'Budget Utilisation', value: '92.6%' },
      { label: 'Avg Payout / Claim', value: '$446' },
      { label: 'Processing Cost', value: '$542K' },
    ],
  },
  'Avg Payout / Claim': {
    title: 'Avg Payout / Claim',
    currentValue: '$446',
    previousValue: '$436',
    changePercent: 2.3,
    changePositive: false,
    trendData: [195, 210, 218, 225, 220, 310, 380, 412, 430, 440, 443, 446],
    trendLabel: 'Avg Payout Trend (USD)',
    insights: [
      'Average payout per claim rose 2.3% driven by higher EU261 standard compensation rates post-UK CAA revision.',
      'Alternate carrier rebooking costs increased 8% as capacity remained tight on long-haul routes.',
      'Hotel night rates at hub cities (LHR, DXB, DEL) up 11% YoY, directly inflating care-of-duty costs.',
    ],
    relatedMetrics: [
      { label: 'Total Payout MTD', value: formatCurrency(analyticsData.payoutByMonth[analyticsData.payoutByMonth.length - 1].totalPayout) },
      { label: 'Hotel Expense Share', value: '40%' },
      { label: 'EU Claims Share', value: '24.9%' },
    ],
  },
  'Avg Resolution (hrs)': {
    title: 'Avg Resolution (hrs)',
    currentValue: '72.4 hrs',
    previousValue: '78.8 hrs',
    changePercent: -8.1,
    changePositive: true,
    trendData: [96, 92, 88, 85, 82, 80, 78, 76, 74, 78, 76, 72],
    trendLabel: 'Avg Resolution Time (hours)',
    insights: [
      'Resolution time has improved 8.1% YoY, on track to meet the 72-hour SLA target by Q1 FY27.',
      'AI-assisted document extraction reduced manual handling time by 33%, the biggest single driver of improvement.',
      'Remaining bottleneck is the authorisation queue — 18% of claims wait >24 hrs for officer review.',
    ],
    relatedMetrics: [
      { label: 'SLA Compliance', value: '91.2%' },
      { label: 'STP Rate', value: '18.4%' },
      { label: 'Manual Review Rate', value: '46%' },
    ],
  },
  'STP Rate': {
    title: 'STP Rate (Straight-Through Processing)',
    currentValue: '18.4%',
    previousValue: '14.2%',
    changePercent: 4.2,
    changePositive: true,
    trendData: [10, 12, 14, 15, 17, 17.5, 16, 16.8, 17.2, 17.8, 18.1, 18.4],
    trendLabel: 'STP Rate % (12 months)',
    insights: [
      'STP rate increased 4.2pp YoY — 18.4% of claims now processed end-to-end without human touch.',
      'New ML fraud model reduced false-flag rate to 2.1%, allowing more claims to bypass manual review.',
      'Target is 25% STP by end of FY27; current trajectory suggests this is achievable by Q3 FY27.',
    ],
    relatedMetrics: [
      { label: 'Manual Review Rate', value: '46%' },
      { label: 'AI Accuracy', value: '92%' },
      { label: 'Avg Resolution (hrs)', value: '72.4' },
    ],
  },
  'First-Contact Res.': {
    title: 'First-Contact Resolution Rate',
    currentValue: '72.3%',
    previousValue: '70.5%',
    changePercent: 1.8,
    changePositive: true,
    trendData: [64, 66, 68, 70, 71, 71.2, 70.8, 71.5, 72.0, 71.8, 72.1, 72.3],
    trendLabel: 'FCR Rate % (12 months)',
    insights: [
      'FCR improved 1.8pp — passengers are getting answers in their first interaction more often.',
      'WhatsApp channel has the highest FCR at 81%, driven by automated status updates reducing re-contacts.',
      'Complex EU261 escalations remain the primary reason for repeat contacts, accounting for 62% of re-contacts.',
    ],
    relatedMetrics: [
      { label: 'CSAT Score', value: '4.2 / 5' },
      { label: 'Avg Resolution (hrs)', value: '72.4' },
      { label: 'Channel: WhatsApp', value: '81% FCR' },
    ],
  },
  'Approval Rate': {
    title: 'Claim Approval Rate',
    currentValue: `${(analyticsData.claimsByMonth[analyticsData.claimsByMonth.length - 1].approved / analyticsData.claimsByMonth[analyticsData.claimsByMonth.length - 1].claims * 100).toFixed(1)}%`,
    previousValue: '84.6%',
    changePercent: 2.1,
    changePositive: true,
    trendData: analyticsData.claimsByMonth.map((m) => m.approved / m.claims * 100),
    trendLabel: 'Approval Rate % (12 months)',
    insights: [
      'Approval rate rose 2.1pp — improved evidence quality from the new mobile upload flow is reducing rejections.',
      'Platinum-tier passengers have an 89% approval rate vs 71% for non-loyalty members.',
      'USA (DOT) jurisdiction has the lowest approval rate at 67% due to stricter eligibility documentation requirements.',
    ],
    relatedMetrics: [
      { label: 'Rejection Rate', value: '13.2%' },
      { label: 'Fraud Flag Rate', value: '2.1%' },
      { label: 'Platinum Approval', value: '89%' },
    ],
  },
  'CSAT Score': {
    title: 'Customer Satisfaction (CSAT)',
    currentValue: '4.2 / 5',
    previousValue: '3.9 / 5',
    changePercent: 7.7,
    changePositive: true,
    trendData: [3.6, 3.7, 3.8, 3.9, 4.0, 4.0, 4.0, 4.1, 4.1, 4.1, 4.2, 4.2],
    trendLabel: 'CSAT Score (12 months)',
    insights: [
      'CSAT improved to 4.2/5 — driven by faster resolution times and proactive status notifications.',
      'Top driver of positive scores: "Payment was fast and transparent" (cited in 68% of 5-star reviews).',
      'Key complaint theme: "Hard to upload documents on mobile" — UX improvement scheduled for Q2 FY27.',
    ],
    relatedMetrics: [
      { label: 'FCR Rate', value: '72.3%' },
      { label: 'Avg Resolution (hrs)', value: '72.4' },
      { label: 'NPS (est.)', value: '+34' },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Metric Detail Drawer
// ─────────────────────────────────────────────────────────────────────────────

function MetricDrawer({ metric, onClose }: { metric: MetricDetail | null; onClose: () => void }) {
  const isOpen = metric !== null;

  if (!metric) return null;

  const trendChartData = metric.trendData.map((v, i) => ({ month: months12Short[i] ?? String(i + 1), value: v }));
  const changeUp = metric.changePercent > 0;
  const ChangeIcon = changeUp ? TrendingUp : TrendingDown;
  const changeBadgeClass = metric.changePositive
    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
    : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400';

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className={`fixed right-0 top-0 bottom-0 z-50 w-[450px] max-w-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-label={metric.title}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">
              Metric Detail
            </p>
            <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
              {metric.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">

          {/* Current / Previous / Change */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Current</span>
              <span className="text-xl font-bold text-slate-900 dark:text-white tabular-nums leading-none">{metric.currentValue}</span>
            </div>
            <div className="flex flex-col gap-1 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Previous</span>
              <span className="text-xl font-bold text-slate-400 dark:text-slate-500 tabular-nums leading-none">{metric.previousValue}</span>
            </div>
            <div className="flex flex-col gap-1 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Change</span>
              <span className={`inline-flex items-center gap-1 text-sm font-bold tabular-nums ${changeBadgeClass} px-2 py-0.5 rounded-full w-fit mt-0.5`}>
                <ChangeIcon className="w-3 h-3 shrink-0" />
                {changeUp ? '+' : ''}{metric.changePercent.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* 12-month trend */}
          <div>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">{metric.trendLabel}</p>
            <div className="h-[160px] rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800/30 p-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendChartData} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                  <defs>
                    <linearGradient id="drawerGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#6366F1"
                    strokeWidth={2}
                    fill="url(#drawerGrad)"
                    dot={false}
                    isAnimationActive={true}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Insights */}
          <div>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-3">Key Insights</p>
            <ul className="flex flex-col gap-2.5">
              {metric.insights.map((insight, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className="mt-1 flex-shrink-0 w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{insight}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Related metrics */}
          <div>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">Related Metrics</p>
            <div className="flex flex-col gap-1">
              {metric.relatedMetrics.map((m) => (
                <div key={m.label} className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-xs text-slate-500 dark:text-slate-400">{m.label}</span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 tabular-nums">{m.value}</span>
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
// Clickable MetricCard wrapper
// ─────────────────────────────────────────────────────────────────────────────

function ClickableMetricCard({
  label,
  value,
  trend,
  sparklineData,
  onClick,
}: {
  label: string;
  value: string | number;
  trend?: Parameters<typeof MetricCard>[0]['trend'];
  sparklineData?: number[];
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left w-full min-w-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-[var(--radius-md)]"
    >
      <MetricCard
        label={label}
        value={value}
        trend={trend}
        sparklineData={sparklineData}
        className="hover:ring-2 hover:ring-indigo-400/60 hover:shadow-lg transition-all duration-150"
      />
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function ExecutiveDashboardPage() {
  const [period, setPeriod] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState<MetricDetail | null>(null);

  const openMetric = useCallback((key: string) => {
    setSelectedMetric(METRIC_DETAILS[key] ?? null);
  }, []);

  const closeMetric = useCallback(() => {
    setSelectedMetric(null);
  }, []);

  // ── Derived metrics ──────────────────────────────────────────────────────
  const latestMonth = analyticsData.claimsByMonth[analyticsData.claimsByMonth.length - 1];
  const latestPayout = analyticsData.payoutByMonth[analyticsData.payoutByMonth.length - 1];

  const totalClaimsMTD = latestMonth.claims;
  const totalPayoutMTD = latestPayout.totalPayout;
  const avgPayoutPerClaim = totalClaimsMTD > 0 ? Math.round(totalPayoutMTD / totalClaimsMTD) : 0;
  const avgResolutionHours = 72.4;
  const stpRate = 18.4;
  const fcrRate = 72.3;
  const approvalRate = (latestMonth.approved / latestMonth.claims * 100).toFixed(1);
  const csatScore = 4.2;

  // ── Payout charts ────────────────────────────────────────────────────────
  const payoutBarData = analyticsData.payoutByMonth.map((p) => ({
    month: p.month.slice(0, 3),
    compensation: p.alternateCarrier,
    reimbursement: p.hotelExpenses + p.mealExpenses + p.cabExpenses + p.other,
  }));

  const payoutByCategoryDonut = [
    { name: 'Hotel', value: 40 },
    { name: 'Alternate Carrier', value: 25 },
    { name: 'Transport', value: 15 },
    { name: 'Food & Meals', value: 10 },
    { name: 'Other', value: 10 },
  ];

  // ── Disruption donut ─────────────────────────────────────────────────────
  const disruptionDonut = analyticsData.claimsByDisruptionType.map((d) => ({
    name: d.type,
    value: d.count,
  }));

  // ── Route table columns ──────────────────────────────────────────────────
  const routeRiskColumns: DataTableColumn<RouteRiskRow>[] = [
    {
      key: 'route',
      label: 'Route',
      render: (v) => {
        const parts = String(v).split(' → ');
        return (
          <FlightRouteVisualizer
            origin={{ code: parts[0] ?? '', city: '' }}
            destination={{ code: parts[1] ?? '', city: '' }}
            variant="inline"
          />
        );
      },
    },
    { key: 'claimCount', label: 'Claims', sortable: true, render: (v) => <span className="font-semibold tabular-nums">{String(v)}</span> },
    { key: 'claimsPer1000', label: 'Per 1K Pax', sortable: true, render: (v) => <span className="tabular-nums">{String(v)}</span> },
    { key: 'avgPayout', label: 'Avg Payout', sortable: true, render: (v) => <span className="font-semibold tabular-nums">{formatCurrency(Number(v))}</span> },
    {
      key: 'trend',
      label: 'Trend',
      render: (v) => {
        const val = String(v);
        const color = val === 'Rising' ? 'text-red-500' : val === 'Declining' ? 'text-emerald-500' : 'text-amber-500';
        return <span className={`text-xs font-medium ${color}`}>{val}</span>;
      },
    },
  ];

  // ── Repeat claimant table ────────────────────────────────────────────────
  const repeatClaimantColumns: DataTableColumn<RepeatClaimantRow>[] = [
    { key: 'id', label: 'Claimant ID', render: (v) => <span className="font-mono text-xs">{String(v)}</span> },
    { key: 'claimCount', label: 'Claims', sortable: true, render: (v) => <span className="font-semibold tabular-nums">{String(v)}</span> },
    { key: 'totalPayout', label: 'Total Payout', sortable: true, render: (v) => <span className="tabular-nums">{formatCurrency(Number(v))}</span> },
    { key: 'tier', label: 'Tier', render: (v) => {
      const val = String(v);
      const colors: Record<string, string> = { Platinum: 'text-purple-600', Gold: 'text-amber-600', Silver: 'text-slate-500', None: 'text-slate-400' };
      return <span className={`text-xs font-medium ${colors[val] || 'text-slate-400'}`}>{val}</span>;
    }},
    { key: 'lastClaim', label: 'Last Claim', render: (v) => <span className="text-xs">{String(v)}</span> },
  ];

  // ── Regulatory exposure table ────────────────────────────────────────────
  type RegRow = typeof regulatoryExposure[number];
  const regulatoryColumns: DataTableColumn<RegRow>[] = [
    { key: 'jurisdiction', label: 'Jurisdiction', render: (v) => <span className="font-medium text-sm">{String(v)}</span> },
    { key: 'claimCount', label: 'Claims', sortable: true, render: (v) => <span className="tabular-nums">{String(v)}</span> },
    { key: 'avgPayout', label: 'Avg Payout', render: (v) => <span className="tabular-nums">{formatCurrency(Number(v))}</span> },
    { key: 'potentialLiability', label: 'Liability', sortable: true, render: (v) => <span className="font-semibold tabular-nums">{formatCurrency(Number(v))}</span> },
    { key: 'complianceRisk', label: 'Risk', render: (v) => {
      const val = String(v);
      const color = val === 'High' ? 'text-red-500' : val === 'Medium' ? 'text-amber-500' : 'text-emerald-500';
      return <span className={`text-xs font-semibold ${color}`}>{val}</span>;
    }},
  ];

  return (
    <>
      {/* Metric detail drawer */}
      <MetricDrawer metric={selectedMetric} onClose={closeMetric} />

      <div className="flex flex-col gap-0 h-full">
        {/* Header */}
        <PageHeader
          title="Executive Dashboard"
          actions={
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                {PERIOD_TABS.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setPeriod(tab.value)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                      period === tab.value
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <Button variant="secondary" size="sm" icon={<Download className="w-3.5 h-3.5" />}>
                Export
              </Button>
            </div>
          }
        />

        {/* Dashboard content — full width */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col gap-8">

            {/* ================================================================
                SECTION 1: Executive Summary (KPI Banner)
                ================================================================ */}
            <section>
              <SectionHeader
                title="Executive Summary (MTD)"
                subtitle="Click any card to drill into details. Key performance indicators for the current month with year-over-year trends."
              />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 [&>*]:min-w-0 [&>*]:overflow-hidden">
                <ClickableMetricCard
                  label="Total Claims MTD"
                  value={totalClaimsMTD.toLocaleString()}
                  trend={{ direction: 'down', value: '-7.4% YoY', isPositive: false }}
                  sparklineData={analyticsData.claimsByMonth.map((m) => m.claims)}
                  onClick={() => openMetric('Total Claims MTD')}
                />
                <ClickableMetricCard
                  label="Total Payout MTD"
                  value={formatCurrency(totalPayoutMTD)}
                  trend={{ direction: 'down', value: '-5.2% YoY', isPositive: true }}
                  sparklineData={analyticsData.payoutByMonth.map((p) => p.totalPayout)}
                  onClick={() => openMetric('Total Payout MTD')}
                />
                <ClickableMetricCard
                  label="Avg Payout / Claim"
                  value={formatCurrency(avgPayoutPerClaim)}
                  trend={{ direction: 'up', value: '+2.3%', isPositive: false }}
                  sparklineData={[195, 210, 218, 225, 220, avgPayoutPerClaim]}
                  onClick={() => openMetric('Avg Payout / Claim')}
                />
                <ClickableMetricCard
                  label="Avg Resolution (hrs)"
                  value={avgResolutionHours.toFixed(1)}
                  trend={{ direction: 'down', value: '-8.1%', isPositive: true }}
                  sparklineData={[96, 92, 88, 85, 80, 76, avgResolutionHours]}
                  onClick={() => openMetric('Avg Resolution (hrs)')}
                />
                <ClickableMetricCard
                  label="STP Rate"
                  value={`${stpRate}%`}
                  trend={{ direction: 'up', value: '+4.2%', isPositive: true }}
                  sparklineData={[10, 12, 14, 15, 17, stpRate]}
                  onClick={() => openMetric('STP Rate')}
                />
                <ClickableMetricCard
                  label="First-Contact Res."
                  value={`${fcrRate}%`}
                  trend={{ direction: 'up', value: '+1.8%', isPositive: true }}
                  sparklineData={[64, 66, 68, 70, 71, fcrRate]}
                  onClick={() => openMetric('First-Contact Res.')}
                />
                <ClickableMetricCard
                  label="Approval Rate"
                  value={`${approvalRate}%`}
                  trend={{ direction: 'up', value: '+2.1%', isPositive: true }}
                  sparklineData={analyticsData.claimsByMonth.map((m) => m.approved / m.claims * 100)}
                  onClick={() => openMetric('Approval Rate')}
                />
                <ClickableMetricCard
                  label="CSAT Score"
                  value={`${csatScore}/5`}
                  trend={{ direction: 'up', value: '+0.3', isPositive: true }}
                  sparklineData={[3.6, 3.7, 3.8, 3.9, 4.0, 4.1, csatScore]}
                  onClick={() => openMetric('CSAT Score')}
                />
              </div>
            </section>

            {/* ================================================================
                SECTION 2: Financial Overview
                ================================================================ */}
            <section>
              <SectionHeader title="Financial Overview" subtitle="Payout trends, budget performance, and expense category breakdown" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <ChartTitle>Monthly Payout Trend</ChartTitle>
                  <div className="h-[260px]">
                    <BarChart
                      data={payoutBarData}
                      xKey="month"
                      yKeys={['compensation', 'reimbursement']}
                      height={260}
                      showGrid
                      stacked
                    />
                  </div>
                </Card>
                <Card>
                  <ChartTitle>Budget vs Actual</ChartTitle>
                  <div className="space-y-3 mt-1">
                    {budgetVsActual.map((row) => {
                      const pct = Math.round((row.actual / row.budget) * 100);
                      const barColor = pct > 95 ? '#EF4444' : pct > 85 ? '#F59E0B' : '#10B981';
                      return (
                        <div key={row.label}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate max-w-[140px]">{row.label}</span>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[11px] text-slate-400 tabular-nums">{formatCurrency(row.budget)}</span>
                              <span className="text-xs font-semibold tabular-nums" style={{ color: barColor }}>{pct}%</span>
                            </div>
                          </div>
                          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: barColor }}
                            />
                          </div>
                          <div className="flex justify-between mt-0.5">
                            <span className="text-[10px] text-slate-400 tabular-nums">Actual: {formatCurrency(row.actual)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
                <Card>
                  <ChartTitle>Payout by Expense Category</ChartTitle>
                  <div className="h-[260px]">
                    <DonutChart
                      data={payoutByCategoryDonut}
                      centerLabel="Split"
                      centerValue="100%"
                      showLegend
                      height={260}
                    />
                  </div>
                </Card>
                <Card>
                  <ChartTitle>Cost per Claim Processed</ChartTitle>
                  <div className="h-[260px]">
                    <LineChart
                      data={costPerClaimTrend}
                      xKey="month"
                      yKeys={['costPerClaim']}
                      height={260}
                      colors={['#10B981']}
                    />
                  </div>
                </Card>
              </div>
            </section>

            {/* ================================================================
                SECTION 3: Claims Volume & Trends
                ================================================================ */}
            <section>
              <SectionHeader title="Claims Volume & Trends" subtitle="Volume patterns, channel distribution, and claim processing funnel" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <ChartTitle>Claims Volume (YoY Overlay)</ChartTitle>
                  <div className="h-[260px]">
                    <LineChart
                      data={claimsYoYData}
                      xKey="month"
                      yKeys={['FY 2024-25', 'FY 2025-26']}
                      height={260}
                      colors={['#94A3B8', '#6366F1']}
                    />
                  </div>
                </Card>
                <Card>
                  <ChartTitle>Claims Funnel</ChartTitle>
                  <div className="space-y-3 mt-4">
                    {claimsFunnel.map((step, i) => {
                      const widthPct = (step.count / claimsFunnel[0].count) * 100;
                      return (
                        <div key={step.stage}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{step.stage}</span>
                            <span className="text-xs tabular-nums text-slate-500">{step.count.toLocaleString()} ({step.rate})</span>
                          </div>
                          <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded-md overflow-hidden">
                            <div
                              className="h-full rounded-md transition-all duration-500"
                              style={{
                                width: `${widthPct}%`,
                                background: `linear-gradient(90deg, ${['#6366F1', '#8B5CF6', '#A78BFA', '#C4B5FD'][i]}, ${['#818CF8', '#A78BFA', '#C4B5FD', '#DDD6FE'][i]})`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
                <Card>
                  <ChartTitle>Claims by Channel</ChartTitle>
                  <div className="h-[260px]">
                    <DonutChart
                      data={channelDonut}
                      centerLabel="Total"
                      centerValue={channelDonut.reduce((a, b) => a + b.value, 0)}
                      showLegend
                      height={260}
                    />
                  </div>
                </Card>
                <Card>
                  <ChartTitle>Claims by Jurisdiction</ChartTitle>
                  <div className="h-[260px]">
                    <DonutChart
                      data={jurisdictionDonut}
                      centerLabel="Total"
                      centerValue={jurisdictionDonut.reduce((a, b) => a + b.value, 0)}
                      showLegend
                      height={260}
                    />
                  </div>
                </Card>
              </div>
            </section>

            {/* ================================================================
                SECTION 4: Route & Disruption Intelligence
                ================================================================ */}
            <section>
              <SectionHeader title="Route & Disruption Intelligence" subtitle="Hotspot routes, disruption cause analysis, and seasonal claim patterns" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <Card>
                  <ChartTitle>Top 10 Routes by Claims</ChartTitle>
                  <div className="h-[280px]">
                    <BarChart
                      data={analyticsData.routeAnalytics.slice(0, 10).map((r) => ({
                        route: r.route.replace(' → ', '-'),
                        claims: r.claimCount,
                        payout: Math.round(r.totalPayout / 1000),
                      }))}
                      xKey="route"
                      yKeys={['claims', 'payout']}
                      height={280}
                      showGrid
                    />
                  </div>
                </Card>
                <Card>
                  <ChartTitle>Disruption Cause Analysis (Pareto)</ChartTitle>
                  <div className="h-[280px]">
                    <BarChart
                      data={disruptionPareto.map((d) => ({
                        type: d.type,
                        count: d.count,
                      }))}
                      xKey="type"
                      yKeys={['count']}
                      height={280}
                      showGrid
                      colors={['#F59E0B']}
                    />
                  </div>
                </Card>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Seasonal Claim Pattern — redesigned as quarterly grouped bar */}
                <Card>
                  <ChartTitle>Seasonal Claim Pattern (by Quarter)</ChartTitle>
                  <div className="space-y-3 mt-2">
                    {quarterlySeasonalData.map((q) => {
                      const maxClaims = Math.max(...quarterlySeasonalData.map((x) => x.claims));
                      const widthPct = (q.claims / maxClaims) * 100;
                      return (
                        <div key={q.quarter}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{q.quarter}</span>
                            <span className="text-xs font-semibold tabular-nums text-slate-600 dark:text-slate-300">
                              {q.claims.toLocaleString()} claims
                            </span>
                          </div>
                          <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                            <div
                              className="h-full rounded-lg transition-all duration-500 flex items-center px-3"
                              style={{ width: `${widthPct}%`, backgroundColor: q.color, opacity: 0.85 }}
                            >
                              <span className="text-[10px] font-bold text-white whitespace-nowrap">
                                {Math.round(widthPct)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <BarChart
                        data={seasonalChartData}
                        xKey="quarter"
                        yKeys={['claims']}
                        height={140}
                        showGrid
                        colors={['#6366F1']}
                      />
                    </div>
                  </div>
                </Card>
                <Card>
                  <ChartTitle>Route Risk Score</ChartTitle>
                  <div className="max-h-[420px] overflow-auto">
                    <DataTable
                      columns={routeRiskColumns}
                      data={routeRiskData}
                      rowKey={(row) => row.route}
                      emptyMessage="No route data."
                    />
                  </div>
                </Card>
              </div>
            </section>

            {/* ================================================================
                SECTION 5: Operational Efficiency
                ================================================================ */}
            <section>
              <SectionHeader title="Operational Efficiency" subtitle="SLA performance, automation impact, AI accuracy, and agent productivity" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <ChartTitle>SLA Compliance Trend</ChartTitle>
                  <div className="h-[240px]">
                    <LineChart
                      data={slaComplianceTrend}
                      xKey="month"
                      yKeys={['compliance', 'target']}
                      height={240}
                      colors={['#6366F1', '#EF4444']}
                    />
                  </div>
                </Card>
                <Card>
                  <ChartTitle>Agent Productivity Trend</ChartTitle>
                  <div className="h-[240px]">
                    <LineChart
                      data={agentProductivityTrend}
                      xKey="month"
                      yKeys={['claimsPerAgent']}
                      height={240}
                      colors={['#8B5CF6']}
                    />
                  </div>
                </Card>
                <Card>
                  <ChartTitle>Automation Impact</ChartTitle>
                  <div className="space-y-2 mt-2">
                    <div className="grid grid-cols-4 gap-2 text-[10px] font-semibold uppercase text-slate-400 px-1">
                      <span>Metric</span>
                      <span>Before</span>
                      <span>After</span>
                      <span>Change</span>
                    </div>
                    {automationImpact.map((row) => (
                      <div key={row.metric} className="grid grid-cols-4 gap-2 text-xs px-1 py-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-800">
                        <span className="font-medium text-slate-700 dark:text-slate-300 truncate">{row.metric}</span>
                        <span className="tabular-nums text-slate-500">{row.before}</span>
                        <span className="tabular-nums text-slate-700 dark:text-slate-300 font-medium">{row.after}</span>
                        <span className={`tabular-nums font-semibold ${row.improvement.startsWith('-') ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {row.improvement}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
                <Card className="flex flex-col items-center justify-center">
                  <ChartTitle>AI Extraction Accuracy</ChartTitle>
                  <div className="h-[200px] flex items-center justify-center w-full">
                    <GaugeChart
                      value={92}
                      target={95}
                      label="AI Accuracy"
                      colorZones={[
                        { start: 0, end: 80, color: '#EF4444' },
                        { start: 80, end: 90, color: '#F59E0B' },
                        { start: 90, end: 100, color: '#10B981' },
                      ]}
                    />
                  </div>
                </Card>
              </div>
            </section>

            {/* ================================================================
                SECTION 6: Risk & Compliance
                ================================================================ */}
            <section>
              <SectionHeader title="Risk & Compliance" subtitle="Rejection trends, fraud detection, regulatory exposure, and repeat claimant analysis" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <ChartTitle>Rejection Rate Trend</ChartTitle>
                  <div className="h-[240px]">
                    <LineChart
                      data={rejectionRateTrend}
                      xKey="month"
                      yKeys={['rejectionRate']}
                      height={240}
                      colors={['#EF4444']}
                    />
                  </div>
                </Card>
                <Card>
                  <ChartTitle>Fraud Flag Rate</ChartTitle>
                  <div className="h-[240px]">
                    <LineChart
                      data={fraudFlagTrend}
                      xKey="month"
                      yKeys={['flagRate', 'threshold']}
                      height={240}
                      colors={['#F59E0B', '#EF4444']}
                    />
                  </div>
                </Card>
                <Card>
                  <ChartTitle>Regulatory Exposure</ChartTitle>
                  <div className="max-h-[400px] overflow-auto">
                    <DataTable
                      columns={regulatoryColumns}
                      data={regulatoryExposure}
                      rowKey={(row) => row.jurisdiction}
                      emptyMessage="No data."
                    />
                  </div>
                </Card>
                <Card>
                  <ChartTitle>Repeat Claimant Analysis</ChartTitle>
                  <div className="max-h-[400px] overflow-auto">
                    <DataTable
                      columns={repeatClaimantColumns}
                      data={repeatClaimants}
                      rowKey={(row) => row.id}
                      emptyMessage="No data."
                    />
                  </div>
                </Card>
              </div>
            </section>

            {/* ================================================================
                SECTION 7: Customer Impact
                ================================================================ */}
            <section>
              <SectionHeader title="Customer Impact" subtitle="Resolution speed, passenger tier analysis, and geographic claim distribution" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <ChartTitle>Avg Resolution Time Trend</ChartTitle>
                  <div className="h-[240px]">
                    <LineChart
                      data={resolutionTimeTrend}
                      xKey="month"
                      yKeys={['hours']}
                      height={240}
                      colors={['#10B981']}
                    />
                  </div>
                </Card>
                <Card>
                  <ChartTitle>Claims by Origin Airport (Top 10)</ChartTitle>
                  <div className="h-[240px]">
                    <BarChart
                      data={topOriginAirports}
                      xKey="airport"
                      yKeys={['claims']}
                      height={240}
                      showGrid
                      colors={['#0EA5E9']}
                    />
                  </div>
                </Card>
                <Card>
                  <ChartTitle>Claims by Passenger Tier</ChartTitle>
                  <div className="h-[240px]">
                    <BarChart
                      data={claimsByTier}
                      xKey="tier"
                      yKeys={['claims']}
                      height={240}
                      showGrid
                      colors={['#8B5CF6']}
                    />
                  </div>
                </Card>
                <Card>
                  <ChartTitle>Approval Rate by Tier</ChartTitle>
                  <div className="h-[240px]">
                    <BarChart
                      data={claimsByTier}
                      xKey="tier"
                      yKeys={['approvalRate']}
                      height={240}
                      showGrid
                      colors={['#6366F1']}
                    />
                  </div>
                </Card>
              </div>
            </section>

          </div>
        </div>
      </div>
    </>
  );
}
