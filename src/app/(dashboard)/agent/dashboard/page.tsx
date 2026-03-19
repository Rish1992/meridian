'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ClipboardList,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { mockClaims } from '@/data/mock-data';
import { PageHeader } from '@/components/layout';
import { MetricCard, StatusBadge, DataTable } from '@/components/ui';
import type { DataTableColumn } from '@/components/ui';
import { BarChart, DonutChart } from '@/components/charts';
import { getSLAInfo } from '@/lib/utils';
import type { Claim } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// SLA Timer cell
// ─────────────────────────────────────────────────────────────────────────────

function SLACell({ deadline }: { deadline: string }) {
  const sla = getSLAInfo(deadline);
  return (
    <div className="flex flex-col gap-1 min-w-[80px]">
      <span
        className={
          sla.isBreached
            ? 'text-xs font-semibold text-red-600'
            : sla.percentage >= 75
            ? 'text-xs font-semibold text-amber-600'
            : 'text-xs font-medium text-slate-500'
        }
      >
        {sla.label}
      </span>
      <div className="h-1 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${sla.color}`}
          style={{ width: `${Math.min(sla.percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function AgentDashboardPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const agentClaims = useMemo(
    () => mockClaims.filter((c) => c.assignedAgentId === user?.id),
    [user?.id],
  );

  // ── Greeting ──────────────────────────────────────────────────────────────
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // ── Metrics ───────────────────────────────────────────────────────────────
  const today = new Date().toDateString();

  const assignedCount = agentClaims.length;
  const inProgressCount = agentClaims.filter(
    (c) => c.status === 'in_review' || c.status === 'validation_complete',
  ).length;
  const completedToday = agentClaims.filter(
    (c) =>
      (c.status === 'approved' ||
        c.status === 'rejected' ||
        c.status === 'pending_authorization') &&
      new Date(c.updatedAt).toDateString() === today,
  ).length;
  const slaBreaches = agentClaims.filter(
    (c) => getSLAInfo(c.slaDeadline).isBreached,
  ).length;

  // ── Bar chart data: claims by status this week ────────────────────────────
  const statusBarData = [
    { day: 'Mon', assigned: 3, in_review: 2, completed: 1 },
    { day: 'Tue', assigned: 4, in_review: 3, completed: 2 },
    { day: 'Wed', assigned: 5, in_review: 2, completed: 3 },
    { day: 'Thu', assigned: 2, in_review: 4, completed: 4 },
    { day: 'Fri', assigned: 6, in_review: 1, completed: 2 },
    { day: 'Sat', assigned: 1, in_review: 2, completed: 1 },
    { day: 'Sun', assigned: 2, in_review: 3, completed: 0 },
  ];

  // ── Donut chart data: disruption types ────────────────────────────────────
  const disruptionTypeCounts = agentClaims.reduce(
    (acc, c) => {
      const t = c.disruption.type;
      acc[t] = (acc[t] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const donutData = [
    { name: 'Delay', value: disruptionTypeCounts['delay'] ?? 0 },
    { name: 'Cancellation', value: disruptionTypeCounts['cancellation'] ?? 0 },
    { name: 'Denied Boarding', value: disruptionTypeCounts['denied_boarding'] ?? 0 },
    { name: 'Diversion', value: disruptionTypeCounts['diversion'] ?? 0 },
  ].filter((d) => d.value > 0);

  // ── Priority claims table (top 5, SLA sorted) ─────────────────────────────
  const priorityClaims = useMemo(
    () =>
      [...agentClaims]
        .sort(
          (a, b) =>
            new Date(a.slaDeadline).getTime() - new Date(b.slaDeadline).getTime(),
        )
        .slice(0, 5),
    [agentClaims],
  );

  const columns: DataTableColumn<Claim>[] = [
    {
      key: 'id',
      label: 'Claim ID',
      render: (v) => (
        <span className="font-mono text-xs text-slate-600 dark:text-slate-300 truncate block max-w-[120px]">
          {String(v)}
        </span>
      ),
    },
    {
      key: 'passenger',
      label: 'Passenger',
      render: (_, row) => (
        <span className="font-medium text-slate-800 dark:text-slate-100 truncate block max-w-[140px]">
          {row.passenger.name}
        </span>
      ),
    },
    {
      key: 'pnr',
      label: 'PNR',
      render: (v) => (
        <span className="font-mono text-xs truncate block max-w-[80px]">{String(v)}</span>
      ),
    },
    {
      key: 'flight',
      label: 'Flight',
      render: (_, row) => (
        <span className="font-mono text-xs">{row.flight.flightNumber}</span>
      ),
    },
    {
      key: 'disruption',
      label: 'Disruption',
      render: (_, row) => (
        <span className="capitalize text-xs">
          {row.disruption.type.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      key: 'slaDeadline',
      label: 'SLA',
      render: (v) => <SLACell deadline={String(v)} />,
    },
    {
      key: 'status',
      label: 'Status',
      render: (_, row) => <StatusBadge status={row.status} size="sm" showDot />,
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <PageHeader
        title="Dashboard"
        description={`${greeting}, ${user?.name ?? 'Agent'}. Here's your claims overview.`}
        actions={
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        }
      />

      {/* Metric cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 [&>*]:min-w-0 [&>*]:overflow-hidden">
        <MetricCard
          label="Claims Assigned"
          value={assignedCount}
          icon={<ClipboardList className="w-4 h-4" />}
          trend={{ direction: 'up', value: '+2 today', isPositive: true }}
          sparklineData={[4, 5, 3, 7, 6, 8, assignedCount]}
        />
        <MetricCard
          label="In Progress"
          value={inProgressCount}
          icon={<Loader2 className="w-4 h-4" />}
          trend={{ direction: 'flat', value: 'No change', isPositive: true }}
          sparklineData={[2, 3, 2, 4, 3, inProgressCount, inProgressCount]}
        />
        <MetricCard
          label="Completed Today"
          value={completedToday}
          icon={<CheckCircle2 className="w-4 h-4" />}
          trend={{ direction: 'up', value: '+1 vs yesterday', isPositive: true }}
          sparklineData={[1, 2, 1, 3, 2, 4, completedToday]}
        />
        <MetricCard
          label="SLA Breaches"
          value={slaBreaches}
          icon={<AlertTriangle className="w-4 h-4" />}
          trend={
            slaBreaches > 0
              ? { direction: 'up', value: `${slaBreaches} urgent`, isPositive: false }
              : { direction: 'flat', value: 'All on track', isPositive: true }
          }
          sparklineData={[0, 1, 0, 2, 1, 0, slaBreaches]}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-[var(--radius-lg)] border border-slate-200 dark:border-slate-700 p-5 overflow-hidden min-w-0">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">
            Claims by Status — This Week
          </h3>
          <div className="h-[220px]">
            <BarChart
              data={statusBarData}
              yKeys={['assigned', 'in_review', 'completed']}
              colors={['#6366f1', '#3b82f6', '#10b981']}
              xKey="day"
              height={220}
            />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-[var(--radius-lg)] border border-slate-200 dark:border-slate-700 p-5 overflow-hidden min-w-0">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">
            Claims by Disruption Type
          </h3>
          <div className="h-[220px]">
            {donutData.length > 0 ? (
              <DonutChart
                data={donutData.map((d, i) => ({
                  ...d,
                  color: ['#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6'][i],
                }))}
                centerLabel="Disruption Types"
                centerValue={donutData.reduce((s, d) => s + d.value, 0)}
                height={220}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-slate-400">
                No claims data
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Priority claims table */}
      <div className="bg-white dark:bg-slate-900 rounded-[var(--radius-lg)] border border-slate-200 dark:border-slate-700 p-5 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Priority Claims
          </h3>
          <span className="text-xs text-slate-400">Sorted by SLA deadline</span>
        </div>
        <DataTable
          columns={columns}
          data={priorityClaims}
          rowKey={(row) => row.id}
          onRowClick={(row) => router.push(`/agent/claims/${row.id}`)}
          emptyMessage="No claims assigned to you yet."
        />
      </div>
    </div>
  );
}
