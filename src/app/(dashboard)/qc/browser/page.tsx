'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Shuffle } from 'lucide-react';
import { mockClaims, mockQCReviews, mockUsers } from '@/data/mock-data';
import { PageHeader, FilterBar } from '@/components/layout';
import { Button, DataTable, StatusBadge, Badge } from '@/components/ui';
import type { DataTableColumn } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import type { Claim, QCReview } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// QC Status helpers
// ─────────────────────────────────────────────────────────────────────────────

type QCStatus = 'Not Reviewed' | 'Reviewed-Compliant' | 'Reviewed-Non-Compliant';

function getQCStatus(claimId: string): QCStatus {
  const review = mockQCReviews.find((r) => r.claimId === claimId);
  if (!review) return 'Not Reviewed';
  return review.verdict === 'compliant' ? 'Reviewed-Compliant' : 'Reviewed-Non-Compliant';
}

function getOverrideCount(claim: Claim): number {
  return claim.documents.reduce((count, doc) => {
    return count + doc.extractedFields.filter((f) => f.overriddenValue).length;
  }, 0);
}

function QCStatusBadge({ status }: { status: QCStatus }) {
  const variant = status === 'Reviewed-Compliant' ? 'success' : status === 'Reviewed-Non-Compliant' ? 'danger' : 'default';
  return <Badge variant={variant} size="sm" dot>{status}</Badge>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Filter configs
// ─────────────────────────────────────────────────────────────────────────────

const agents = mockUsers.filter((u) => u.role === 'claims_agent');

const FILTER_CONFIGS = [
  {
    key: 'dateRange',
    label: 'Date Range',
    type: 'daterange' as const,
  },
  {
    key: 'agent',
    label: 'Agent',
    type: 'select' as const,
    placeholder: 'All Agents',
    options: agents.map((a) => ({ value: a.id, label: a.name })),
  },
  {
    key: 'disruptionType',
    label: 'Disruption',
    type: 'select' as const,
    placeholder: 'All Types',
    options: [
      { value: 'delay', label: 'Delay' },
      { value: 'cancellation', label: 'Cancellation' },
      { value: 'denied_boarding', label: 'Denied Boarding' },
      { value: 'diversion', label: 'Diversion' },
    ],
  },
  {
    key: 'outcome',
    label: 'Outcome',
    type: 'select' as const,
    placeholder: 'All Outcomes',
    options: [
      { value: 'approve_full', label: 'Approved (Full)' },
      { value: 'approve_partial', label: 'Approved (Partial)' },
      { value: 'reject', label: 'Rejected' },
    ],
  },
  {
    key: 'hasOverrides',
    label: 'Overrides',
    type: 'select' as const,
    placeholder: 'Any',
    options: [
      { value: 'yes', label: 'Has Overrides' },
      { value: 'no', label: 'No Overrides' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function QCCaseBrowserPage() {
  const router = useRouter();
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Completed claims only
  const completedClaims = useMemo(
    () => mockClaims.filter((c) => c.status === 'approved' || c.status === 'rejected' || c.status === 'closed'),
    [],
  );

  // Apply filters
  const filtered = useMemo(() => {
    return completedClaims.filter((c) => {
      if (activeFilters.agent && c.assignedAgentId !== activeFilters.agent) return false;
      if (activeFilters.disruptionType && c.disruption.type !== activeFilters.disruptionType) return false;
      if (activeFilters.outcome && c.outcome !== activeFilters.outcome) return false;
      if (activeFilters.hasOverrides) {
        const overrides = getOverrideCount(c);
        if (activeFilters.hasOverrides === 'yes' && overrides === 0) return false;
        if (activeFilters.hasOverrides === 'no' && overrides > 0) return false;
      }
      if (activeFilters.dateRange_from) {
        if (new Date(c.createdAt) < new Date(activeFilters.dateRange_from)) return false;
      }
      if (activeFilters.dateRange_to) {
        if (new Date(c.createdAt) > new Date(activeFilters.dateRange_to)) return false;
      }
      return true;
    });
  }, [completedClaims, activeFilters]);

  const paginated = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize],
  );

  const handleRandomSample = () => {
    const shuffled = [...completedClaims].sort(() => Math.random() - 0.5);
    const sample = shuffled.slice(0, Math.min(3, shuffled.length));
    if (sample.length > 0) {
      router.push(`/qc/review/${sample[0].id}`);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setActiveFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleClear = () => {
    setActiveFilters({});
    setPage(1);
  };

  // ── Table columns ─────────────────────────────────────────────────────────

  const columns: DataTableColumn<Claim>[] = [
    {
      key: 'id',
      label: 'Claim ID',
      render: (v) => (
        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{String(v)}</span>
      ),
    },
    {
      key: 'passenger',
      label: 'Passenger',
      render: (_, row) => (
        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{row.passenger.name}</p>
      ),
    },
    {
      key: 'assignedAgentId',
      label: 'Agent',
      render: (_, row) => (
        <span className="text-sm text-slate-600 dark:text-slate-300">
          {row.assignedAgent?.name ?? 'Unassigned'}
        </span>
      ),
    },
    {
      key: 'disruption',
      label: 'Disruption Type',
      render: (_, row) => (
        <span className="capitalize text-xs text-slate-600 dark:text-slate-300">
          {row.disruption.type.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      key: 'totalClaimed',
      label: 'Claim Value',
      sortable: true,
      render: (_, row) => (
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 tabular-nums">
          {formatCurrency(row.totalClaimed, row.currency)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Outcome',
      render: (_, row) => <StatusBadge status={row.status} size="sm" showDot />,
    },
    {
      key: 'overrides',
      label: 'Override Count',
      render: (_, row) => {
        const count = getOverrideCount(row);
        return (
          <span className={`text-xs font-semibold tabular-nums ${count > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`}>
            {count}
          </span>
        );
      },
    },
    {
      key: 'qcStatus',
      label: 'QC Status',
      render: (_, row) => <QCStatusBadge status={getQCStatus(row.id)} />,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="QC Case Browser"
        description={`${filtered.length} completed claim${filtered.length !== 1 ? 's' : ''} available for review`}
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={<Shuffle className="w-3.5 h-3.5" />}
            onClick={handleRandomSample}
          >
            Random Sample
          </Button>
        }
      />

      <FilterBar
        filters={FILTER_CONFIGS}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onClear={handleClear}
      />

      <DataTable
        columns={columns}
        data={paginated}
        rowKey={(row) => row.id}
        onRowClick={(row) => router.push(`/qc/review/${row.id}`)}
        pagination={{
          page,
          pageSize,
          total: filtered.length,
          onPageChange: (p, ps) => {
            setPage(p);
            setPageSize(ps);
          },
        }}
        emptyMessage="No completed claims found."
      />
    </div>
  );
}
