'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { mockClaims } from '@/data/mock-data';
import { PageHeader, TabBar } from '@/components/layout';
import { MetricCard, DataTable, StatusBadge } from '@/components/ui';
import type { DataTableColumn } from '@/components/ui';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import type { Claim } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getOverrideCount(claim: Claim): number {
  return claim.documents.reduce((total, doc) => {
    return total + doc.extractedFields.filter((f) => f.overriddenValue !== undefined).length;
  }, 0);
}

// ─────────────────────────────────────────────────────────────────────────────
// Table columns
// ─────────────────────────────────────────────────────────────────────────────

function buildColumns(router: ReturnType<typeof useRouter>): DataTableColumn<Claim>[] {
  return [
    {
      key: 'id',
      label: 'Claim ID',
      render: (v) => (
        <span className="font-mono text-xs text-slate-500 dark:text-slate-400 truncate block max-w-[120px]">{String(v)}</span>
      ),
    },
    {
      key: 'passenger',
      label: 'Passenger',
      render: (_, row) => (
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate max-w-[140px]">{row.passenger.name}</p>
          <p className="text-[11px] text-slate-400 truncate max-w-[140px]">{row.passenger.ffTier} · {row.passenger.nationality}</p>
        </div>
      ),
    },
    {
      key: 'pnr',
      label: 'PNR',
      render: (v) => (
        <span className="font-mono text-xs font-semibold truncate block max-w-[80px]">{String(v)}</span>
      ),
    },
    {
      key: 'assignedAgent',
      label: 'Agent Name',
      render: (_, row) => (
        <span className="text-sm text-slate-700 dark:text-slate-200 truncate block max-w-[120px]">
          {row.assignedAgent?.name ?? '—'}
        </span>
      ),
    },
    {
      key: 'totalClaimed',
      label: 'Total Payout',
      sortable: true,
      render: (v, row) => (
        <span className="text-sm font-semibold tabular-nums text-slate-900 dark:text-white truncate block max-w-[100px]">
          {formatCurrency(Number(v), row.currency)}
        </span>
      ),
    },
    {
      key: 'outcome',
      label: 'Outcome Type',
      render: (_, row) => <StatusBadge status={row.status} size="sm" showDot />,
    },
    {
      key: 'overrideCount',
      label: 'Override Count',
      render: (_, row) => {
        const count = getOverrideCount(row);
        return (
          <span
            className={`text-sm font-semibold tabular-nums ${
              count > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'
            }`}
          >
            {count}
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      label: 'Submission Time',
      render: (v) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {formatDateTime(String(v))}
        </span>
      ),
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function AuthorizationQueuePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('standard');

  const today = new Date().toDateString();

  const pendingClaims = useMemo(
    () =>
      mockClaims
        .filter((c) => c.status === 'pending_authorization')
        .sort((a, b) => b.totalClaimed - a.totalClaimed),
    [],
  );

  const rejectedClaims = useMemo(
    () =>
      mockClaims
        .filter((c) => c.status === 'rejected')
        .sort((a, b) => b.totalClaimed - a.totalClaimed),
    [],
  );

  const approvedToday = useMemo(
    () =>
      mockClaims.filter(
        (c) => c.status === 'approved' && new Date(c.updatedAt).toDateString() === today,
      ).length,
    [today],
  );

  const rejectedToday = useMemo(
    () =>
      mockClaims.filter(
        (c) => c.status === 'rejected' && new Date(c.updatedAt).toDateString() === today,
      ).length,
    [today],
  );

  const columns = useMemo(() => buildColumns(router), [router]);

  const tabs = [
    { label: 'Standard Queue', value: 'standard', badge: pendingClaims.length },
    { label: 'Rejection Review', value: 'rejection', badge: rejectedClaims.length },
  ];

  const tableData = activeTab === 'standard' ? pendingClaims : rejectedClaims;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <PageHeader
        title="Authorization Queue"
        description="Review and authorize pending claims submitted by agents."
      />

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 [&>*]:min-w-0 [&>*]:overflow-hidden">
        <MetricCard
          label="Pending Reviews"
          value={pendingClaims.length}
          icon={<Clock className="w-4 h-4" />}
          trend={{
            direction: pendingClaims.length > 5 ? 'up' : 'flat',
            value: `${pendingClaims.length} in queue`,
            isPositive: pendingClaims.length <= 5,
          }}
        />
        <MetricCard
          label="Approved Today"
          value={approvedToday}
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          trend={{
            direction: approvedToday > 0 ? 'up' : 'flat',
            value: 'today',
            isPositive: true,
          }}
        />
        <MetricCard
          label="Rejected Today"
          value={rejectedToday}
          icon={<XCircle className="w-4 h-4 text-red-500" />}
          trend={{
            direction: rejectedToday > 0 ? 'up' : 'flat',
            value: 'today',
            isPositive: false,
          }}
        />
      </div>

      {/* Tab bar */}
      <TabBar
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="underline"
      />

      {/* Table */}
      {tableData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <ShieldCheck className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-base font-medium text-slate-500 dark:text-slate-400">
            {activeTab === 'standard' ? 'No pending claims' : 'No rejected claims to review'}
          </p>
          <p className="text-sm text-slate-400 mt-1">
            All caught up!
          </p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={tableData}
          rowKey={(row) => row.id}
          onRowClick={(row) => router.push(`/authorization/${row.id}`)}
          emptyMessage="No claims in this queue."
        />
      )}
    </div>
  );
}
