'use client';

import React, { useState, useMemo } from 'react';
import { BarChart2, TrendingUp, ArrowUpDown } from 'lucide-react';
import { mockUsers, analyticsData } from '@/data/mock-data';
import { PageHeader, TabBar } from '@/components/layout';
import { MetricCard } from '@/components/ui';
import { AgentCapacityCard } from '@/components/domain';
import { BarChart, LineChart } from '@/components/charts';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type Period = '7d' | '30d' | '3m' | '12m';
type MainTab = 'individual' | 'leaderboard';
type SortKey = 'accuracy' | 'claimsProcessed' | 'avgResolutionDays' | 'slaComplianceRate' | 'returnRate';

const PERIOD_TABS = [
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '3 Months', value: '3m' },
  { label: '12 Months', value: '12m' },
];

const MAIN_TABS = [
  { label: 'Individual', value: 'individual' },
  { label: 'Leaderboard', value: 'leaderboard' },
];

// Scale factors: what fraction of the full-year stats to show per period
const PERIOD_SCALE: Record<Period, number> = {
  '7d':  7 / 365,
  '30d': 30 / 365,
  '3m':  91 / 365,
  '12m': 1,
};

// How many SLA months to slice for charts
function getSlaSlice(period: Period): number {
  switch (period) {
    case '7d':  return 1;
    case '30d': return 2;
    case '3m':  return 3;
    case '12m': return 12;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Section Card
// ─────────────────────────────────────────────────────────────────────────────

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-[var(--radius-md)] border border-slate-200 dark:border-slate-700 p-5 overflow-hidden min-w-0">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">{title}</h3>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Individual Tab
// ─────────────────────────────────────────────────────────────────────────────

function IndividualTab({ period }: { period: Period }) {
  const agents = mockUsers.filter((u) => u.role === 'claims_agent');
  const [selectedAgentId, setSelectedAgentId] = useState(agents[0]?.id ?? '');

  const selectedAgent = agents.find((a) => a.id === selectedAgentId);
  const agentPerfRaw = analyticsData.agentPerformance.find((p) => p.agentId === selectedAgentId);

  // Scale metrics based on period
  const scale = PERIOD_SCALE[period];
  const slaSlice = getSlaSlice(period);

  const agentPerf = useMemo(() => {
    if (!agentPerfRaw) return null;
    return {
      ...agentPerfRaw,
      // Proportionally scale volume metrics
      claimsProcessed: Math.max(1, Math.round(agentPerfRaw.claimsProcessed * scale)),
      // Quality metrics don't scale — they're rates/averages
    };
  }, [agentPerfRaw, scale]);

  // Build daily/weekly bar chart data — number of data points matches period
  const claimsChartData = useMemo(() => {
    if (!agentPerfRaw) return [];
    const baseDaily = agentPerfRaw.claimsProcessed / 365;

    if (period === '7d') {
      return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => ({
        day,
        Claims: Math.max(0, Math.round(baseDaily * [0.9, 1.2, 1.3, 1.1, 1.0, 0.5, 0.2][i] + Math.sin(i * 1.4) * 0.3)),
      }));
    } else if (period === '30d') {
      return Array.from({ length: 4 }, (_, i) => ({
        day: `Wk ${i + 1}`,
        Claims: Math.max(1, Math.round(baseDaily * 7 * [0.95, 1.05, 1.1, 0.98][i])),
      }));
    } else {
      // 3m or 12m: show monthly
      const monthCount = period === '3m' ? 3 : 12;
      return analyticsData.claimsByMonth.slice(-monthCount).map((d, i) => ({
        day: d.month.slice(0, 3),
        Claims: Math.max(1, Math.round(
          (agentPerfRaw.claimsProcessed / 12) * (d.claims / (analyticsData.claimsByMonth.reduce((s, m) => s + m.claims, 0) / 12)) +
          Math.sin(i * 0.8) * 1.5,
        )),
      }));
    }
  }, [agentPerfRaw, period]);

  const accuracyTrendData = useMemo(() => {
    if (!selectedAgent || !agentPerfRaw) return [];
    return analyticsData.slaComplianceData.slice(-slaSlice).map((d, i) => ({
      month: d.month.slice(0, 3),
      Accuracy: Math.max(80, Math.min(100, agentPerfRaw.accuracy + Math.sin(i * 1.1) * 2.5)),
    }));
  }, [selectedAgent, agentPerfRaw, slaSlice]);

  const periodLabel = PERIOD_TABS.find((t) => t.value === period)?.label ?? period;

  return (
    <div className="flex flex-col gap-5">
      {/* Agent selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-slate-600 dark:text-slate-300 shrink-0">Select Agent:</label>
        <select
          value={selectedAgentId}
          onChange={(e) => setSelectedAgentId(e.target.value)}
          className="h-10 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 px-3 focus:outline-none focus:border-blue-500 min-w-[200px]"
        >
          {agents.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
        <span className="text-xs text-slate-400">Showing data for: <span className="font-medium text-slate-600 dark:text-slate-300">{periodLabel}</span></span>
      </div>

      {selectedAgent && agentPerf && (
        <>
          {/* Metric cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 [&>*]:min-w-0 [&>*]:overflow-hidden">
            <MetricCard
              label={`Claims Processed (${periodLabel})`}
              value={agentPerf.claimsProcessed}
              trend={{
                direction: 'up',
                value: `${periodLabel} total`,
                isPositive: true,
              }}
            />
            <MetricCard
              label="Avg Resolution"
              value={`${agentPerfRaw!.avgResolutionDays}d`}
              trend={{
                direction: agentPerfRaw!.avgResolutionDays < 4 ? 'down' : 'up',
                value: `${agentPerfRaw!.avgResolutionDays}d avg`,
                isPositive: agentPerfRaw!.avgResolutionDays < 4,
              }}
            />
            <MetricCard
              label="Accuracy"
              value={`${agentPerfRaw!.accuracy}%`}
              trend={{
                direction: agentPerfRaw!.accuracy >= 90 ? 'up' : 'flat',
                value: agentPerfRaw!.accuracy >= 90 ? 'High performer' : 'Needs improvement',
                isPositive: agentPerfRaw!.accuracy >= 90,
              }}
            />
            <MetricCard
              label="SLA Compliance"
              value={`${agentPerfRaw!.slaComplianceRate}%`}
              trend={{
                direction: agentPerfRaw!.slaComplianceRate >= 95 ? 'up' : 'flat',
                value: `${agentPerfRaw!.slaComplianceRate}% rate`,
                isPositive: agentPerfRaw!.slaComplianceRate >= 95,
              }}
            />
            <MetricCard
              label="Override Frequency"
              value={`${agentPerfRaw!.returnRate}%`}
              trend={{
                direction: agentPerfRaw!.returnRate < 8 ? 'down' : 'up',
                value: `${agentPerfRaw!.returnRate}% return rate`,
                isPositive: agentPerfRaw!.returnRate < 8,
              }}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <SectionCard title={`Claims Processed — ${periodLabel}`}>
              <div className="h-[200px]">
                <BarChart
                  data={claimsChartData}
                  xKey="day"
                  yKeys={['Claims']}
                  height={200}
                  showGrid
                  colors={['#2563EB']}
                />
              </div>
            </SectionCard>
            <SectionCard title="Accuracy Trend">
              <div className="h-[200px]">
                <LineChart
                  data={accuracyTrendData}
                  xKey="month"
                  yKeys={['Accuracy']}
                  height={200}
                  colors={['#10B981']}
                />
              </div>
            </SectionCard>
          </div>

          {/* Agent profile */}
          <div className="bg-white dark:bg-slate-900 rounded-[var(--radius-md)] border border-slate-200 dark:border-slate-700 p-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              Agent Profile
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Specializations</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedAgent.specializations.map((s) => (
                    <span
                      key={s}
                      className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-medium"
                    >
                      {s.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Key Metrics</p>
                <div className="space-y-1">
                  <div className="flex justify-between gap-2 text-sm">
                    <span className="text-slate-500 shrink-0">Approval Rate</span>
                    <span className="font-semibold text-emerald-600 tabular-nums">{agentPerfRaw!.approvalRate}%</span>
                  </div>
                  <div className="flex justify-between gap-2 text-sm">
                    <span className="text-slate-500 shrink-0">Avg Claimed</span>
                    <span className="font-semibold tabular-nums truncate">${agentPerfRaw!.avgClaimedAmount}</span>
                  </div>
                  <div className="flex justify-between gap-2 text-sm">
                    <span className="text-slate-500 shrink-0">Avg Approved</span>
                    <span className="font-semibold tabular-nums text-emerald-600 truncate">${agentPerfRaw!.avgApprovedAmount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Leaderboard Tab
// ─────────────────────────────────────────────────────────────────────────────

const SORT_OPTIONS: { label: string; value: SortKey; higherIsBetter: boolean }[] = [
  { label: 'Accuracy', value: 'accuracy', higherIsBetter: true },
  { label: 'Claims Processed', value: 'claimsProcessed', higherIsBetter: true },
  { label: 'SLA Compliance', value: 'slaComplianceRate', higherIsBetter: true },
  { label: 'Avg Resolution', value: 'avgResolutionDays', higherIsBetter: false },
  { label: 'Return Rate', value: 'returnRate', higherIsBetter: false },
];

function LeaderboardTab({ period }: { period: Period }) {
  const [sortKey, setSortKey] = useState<SortKey>('accuracy');

  const agents = mockUsers.filter((u) => u.role === 'claims_agent');
  const scale = PERIOD_SCALE[period];
  const currentSortOpt = SORT_OPTIONS.find((o) => o.value === sortKey)!;

  const sortedAgents = useMemo(() => {
    return [...agents].sort((a, b) => {
      const perfA = analyticsData.agentPerformance.find((p) => p.agentId === a.id);
      const perfB = analyticsData.agentPerformance.find((p) => p.agentId === b.id);
      if (!perfA || !perfB) return 0;

      let valA = sortKey === 'claimsProcessed'
        ? Math.round(perfA.claimsProcessed * scale)
        : perfA[sortKey];
      let valB = sortKey === 'claimsProcessed'
        ? Math.round(perfB.claimsProcessed * scale)
        : perfB[sortKey];

      return currentSortOpt.higherIsBetter ? valB - valA : valA - valB;
    });
  }, [agents, sortKey, scale, currentSortOpt.higherIsBetter]);

  const periodLabel = PERIOD_TABS.find((t) => t.value === period)?.label ?? period;

  return (
    <div className="flex flex-col gap-4">
      {/* Sort controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span>Sort by:</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSortKey(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                sortKey === opt.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-400 ml-auto">
          Ranked by {currentSortOpt.label.toLowerCase()} · {periodLabel}
        </span>
      </div>

      {/* Leaderboard rows */}
      <div className="flex flex-col gap-2.5">
        {sortedAgents.map((agent, index) => {
          const perf = analyticsData.agentPerformance.find((p) => p.agentId === agent.id);
          const scaledClaims = perf ? Math.round(perf.claimsProcessed * scale) : 0;

          return (
            <div key={agent.id} className="relative">
              {/* Rank badge overlay */}
              <div
                className={`absolute -left-1 -top-1 z-10 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold
                  ${index === 0 ? 'bg-amber-400 text-white' : index === 1 ? 'bg-slate-400 text-white' : index === 2 ? 'bg-orange-400 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}
                `}
              >
                {index + 1}
              </div>
              <AgentCapacityCard
                agent={agent}
                variant="leaderboard"
                rank={index + 1}
              />
              {/* Period claims inline note */}
              {perf && (
                <div className="mt-1 ml-1 text-[10px] text-slate-400">
                  {scaledClaims} claims · {perf.avgResolutionDays}d avg · {perf.slaComplianceRate}% SLA
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function AgentPerformancePage() {
  const [period, setPeriod] = useState<Period>('30d');
  const [mainTab, setMainTab] = useState<MainTab>('leaderboard');

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Agent Performance"
        description="Monitor individual agent metrics and team leaderboard."
        actions={
          <TabBar
            tabs={PERIOD_TABS}
            activeTab={period}
            onChange={(v) => setPeriod(v as Period)}
            variant="segmented"
          />
        }
      />

      {/* Main tab bar */}
      <TabBar
        tabs={MAIN_TABS}
        activeTab={mainTab}
        onChange={(v) => setMainTab(v as MainTab)}
        variant="underline"
      />

      {/* Tab content */}
      {mainTab === 'individual' && <IndividualTab period={period} />}
      {mainTab === 'leaderboard' && <LeaderboardTab period={period} />}
    </div>
  );
}
