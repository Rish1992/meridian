'use client';

import React, { useState, useMemo } from 'react';
import { ArrowRightLeft, Users, AlertTriangle, Clock } from 'lucide-react';
import { mockUsers } from '@/data/mock-data';
import { useClaimsStore } from '@/stores/claims-store';
import { PageHeader, FilterBar } from '@/components/layout';
import { Button, DataTable, Modal, StatusBadge } from '@/components/ui';
import type { DataTableColumn } from '@/components/ui';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import type { Claim } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const REASSIGNMENT_REASONS = [
  { value: 'agent_unavailable', label: 'Agent Unavailable' },
  { value: 'workload_rebalancing', label: 'Workload Rebalancing' },
  { value: 'specialization_required', label: 'Specialization Required' },
  { value: 'escalation', label: 'Escalation' },
  { value: 'other', label: 'Other' },
];

const DISRUPTION_TYPES = [
  { value: 'cancellation', label: 'Cancellation' },
  { value: 'delay', label: 'Delay' },
  { value: 'denied_boarding', label: 'Denied Boarding' },
  { value: 'diversion', label: 'Diversion' },
];

const CLAIM_VALUE_RANGES = [
  { value: 'low', label: 'Low (<$500)' },
  { value: 'medium', label: 'Medium ($500-$2,000)' },
  { value: 'high', label: 'High (>$2,000)' },
];

const SLA_URGENCY_OPTIONS = [
  { value: 'breached', label: 'Breached (Overdue)' },
  { value: 'critical', label: 'Critical (<25% time left)' },
  { value: 'warning', label: 'Warning (<50% time left)' },
  { value: 'normal', label: 'Normal (On Track)' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getSlaUrgency(claim: Claim): 'breached' | 'critical' | 'warning' | 'normal' {
  const now = Date.now();
  const deadline = new Date(claim.slaDeadline).getTime();
  const created = new Date(claim.createdAt).getTime();

  if (deadline <= now) return 'breached';

  const totalWindow = deadline - created;
  const elapsed = now - created;
  const pctUsed = totalWindow > 0 ? elapsed / totalWindow : 1;

  if (pctUsed >= 0.75) return 'critical';
  if (pctUsed >= 0.50) return 'warning';
  return 'normal';
}

function getSlaUrgencyBadge(urgency: 'breached' | 'critical' | 'warning' | 'normal') {
  const styles = {
    breached: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    critical: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    normal: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  };
  const labels = {
    breached: 'Breached',
    critical: 'Critical',
    warning: 'Warning',
    normal: 'On Track',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${styles[urgency]}`}>
      {urgency === 'breached' && <AlertTriangle className="w-3 h-3" />}
      {urgency === 'critical' && <Clock className="w-3 h-3" />}
      {labels[urgency]}
    </span>
  );
}

function getClaimValueRange(amount: number): 'low' | 'medium' | 'high' {
  if (amount < 500) return 'low';
  if (amount <= 2000) return 'medium';
  return 'high';
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function ReassignmentPage() {
  const { claims, assignClaim } = useClaimsStore();

  const [selectedClaims, setSelectedClaims] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [targetAgentId, setTargetAgentId] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const agents = useMemo(
    () => mockUsers.filter((u) => u.role === 'claims_agent'),
    [],
  );

  // All assigned claims
  const assignedClaims = useMemo(
    () =>
      claims.filter(
        (c) =>
          c.assignedAgentId !== null &&
          ['assigned', 'in_review', 'validation_complete', 'rules_evaluated'].includes(c.status),
      ),
    [claims],
  );

  // Filtered claims — apply all filters
  const filteredClaims = useMemo(() => {
    return assignedClaims.filter((c) => {
      // Agent filter
      if (activeFilters.agent && c.assignedAgentId !== activeFilters.agent) return false;

      // Search by Claim ID or Passenger Name
      if (activeFilters.search) {
        const term = activeFilters.search.toLowerCase();
        const matchId = c.id.toLowerCase().includes(term);
        const matchName = c.passenger.name.toLowerCase().includes(term);
        const matchPnr = c.pnr.toLowerCase().includes(term);
        if (!matchId && !matchName && !matchPnr) return false;
      }

      // Disruption type filter
      if (activeFilters.disruption && c.disruption.type !== activeFilters.disruption) return false;

      // Claim value range filter
      if (activeFilters.valueRange) {
        const range = getClaimValueRange(c.totalClaimed);
        if (range !== activeFilters.valueRange) return false;
      }

      // SLA urgency filter
      if (activeFilters.slaUrgency) {
        const urgency = getSlaUrgency(c);
        if (urgency !== activeFilters.slaUrgency) return false;
      }

      return true;
    });
  }, [assignedClaims, activeFilters]);

  const handleToggle = (claimId: string) => {
    setSelectedClaims((prev) => {
      const next = new Set(prev);
      if (next.has(claimId)) next.delete(claimId);
      else next.add(claimId);
      return next;
    });
  };

  const handleReassign = () => {
    if (!targetAgentId || !reason) return;
    selectedClaims.forEach((claimId) => {
      assignClaim(claimId, targetAgentId);
    });
    setSelectedClaims(new Set());
    setTargetAgentId('');
    setReason('');
    setNotes('');
    setShowModal(false);
  };

  const filterConfigs = [
    {
      key: 'search',
      label: 'Search',
      type: 'search' as const,
      placeholder: 'Search Claim ID, PNR, or Passenger...',
    },
    {
      key: 'agent',
      label: 'Current Agent',
      type: 'select' as const,
      placeholder: 'All Agents',
      options: agents.map((a) => ({ value: a.id, label: a.name })),
    },
    {
      key: 'disruption',
      label: 'Disruption Type',
      type: 'select' as const,
      placeholder: 'All Disruptions',
      options: DISRUPTION_TYPES,
    },
    {
      key: 'valueRange',
      label: 'Claim Value',
      type: 'select' as const,
      placeholder: 'All Values',
      options: CLAIM_VALUE_RANGES,
    },
    {
      key: 'slaUrgency',
      label: 'SLA Urgency',
      type: 'select' as const,
      placeholder: 'All Urgencies',
      options: SLA_URGENCY_OPTIONS,
    },
  ];

  const columns: DataTableColumn<Claim>[] = [
    {
      key: 'select',
      label: '',
      render: (_, row) => (
        <input
          type="checkbox"
          checked={selectedClaims.has(row.id)}
          onChange={() => handleToggle(row.id)}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 rounded border-slate-300 text-blue-500 cursor-pointer"
        />
      ),
    },
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
        <div>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{row.passenger.name}</p>
          <p className="text-[11px] text-slate-400">{row.passenger.email}</p>
        </div>
      ),
    },
    {
      key: 'assignedAgent',
      label: 'Current Agent',
      render: (_, row) => {
        const agent = agents.find((a) => a.id === row.assignedAgentId);
        return (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px] font-bold">
              {agent?.avatar ?? '??'}
            </div>
            <span className="text-sm text-slate-700 dark:text-slate-200">
              {agent?.name ?? 'Unknown'}
            </span>
          </div>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (_, row) => <StatusBadge status={row.status} size="sm" showDot />,
    },
    {
      key: 'totalClaimed',
      label: 'Amount',
      sortable: true,
      render: (v, row) => {
        const amount = Number(v);
        const range = getClaimValueRange(amount);
        const rangeColors = {
          low: 'text-slate-600 dark:text-slate-300',
          medium: 'text-amber-600 dark:text-amber-400',
          high: 'text-red-600 dark:text-red-400',
        };
        return (
          <div>
            <span className={`text-sm font-semibold tabular-nums ${rangeColors[range]}`}>
              {formatCurrency(amount, row.currency)}
            </span>
            <span className="block text-[10px] text-slate-400 capitalize">{range}</span>
          </div>
        );
      },
    },
    {
      key: 'disruption',
      label: 'Disruption',
      render: (_, row) => (
        <span className="capitalize text-xs text-slate-600 dark:text-slate-300">
          {row.disruption.type.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      key: 'slaDeadline',
      label: 'SLA Status',
      render: (_, row) => {
        const urgency = getSlaUrgency(row);
        return getSlaUrgencyBadge(urgency);
      },
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (v) => (
        <span className="text-xs text-slate-500">{formatDateTime(String(v))}</span>
      ),
    },
  ];

  const selectedCount = selectedClaims.size;
  const targetAgent = agents.find((a) => a.id === targetAgentId);

  // Summary counts for the stats bar
  const breachedCount = useMemo(
    () => filteredClaims.filter((c) => getSlaUrgency(c) === 'breached').length,
    [filteredClaims],
  );
  const criticalCount = useMemo(
    () => filteredClaims.filter((c) => getSlaUrgency(c) === 'critical').length,
    [filteredClaims],
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Reassignment"
        description="Reassign claims between agents for workload rebalancing or escalation."
        actions={
          selectedCount > 0 ? (
            <Button
              variant="primary"
              icon={<ArrowRightLeft className="w-4 h-4" />}
              onClick={() => setShowModal(true)}
            >
              Reassign {selectedCount} Claim{selectedCount !== 1 ? 's' : ''}
            </Button>
          ) : undefined
        }
      />

      {/* Filter bar */}
      <FilterBar
        filters={filterConfigs}
        activeFilters={activeFilters}
        onFilterChange={(key, value) => setActiveFilters((prev) => ({ ...prev, [key]: value }))}
        onClear={() => setActiveFilters({})}
      />

      {/* Summary stats */}
      <div className="flex flex-wrap items-center gap-4 sm:gap-6 px-4 py-3 bg-slate-50 dark:bg-slate-800/60 rounded-[var(--radius-md)] border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <Users className="w-4 h-4 text-slate-400" />
          <span><span className="font-semibold tabular-nums">{filteredClaims.length}</span> assigned claims</span>
        </div>
        {breachedCount > 0 && (
          <div className="flex items-center gap-1.5 text-sm">
            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
            <span className="font-semibold text-red-600 dark:text-red-400 tabular-nums">{breachedCount}</span>
            <span className="text-red-500 dark:text-red-400">SLA breached</span>
          </div>
        )}
        {criticalCount > 0 && (
          <div className="flex items-center gap-1.5 text-sm">
            <Clock className="w-3.5 h-3.5 text-orange-500" />
            <span className="font-semibold text-orange-600 dark:text-orange-400 tabular-nums">{criticalCount}</span>
            <span className="text-orange-500 dark:text-orange-400">critical SLA</span>
          </div>
        )}
        {selectedCount > 0 && (
          <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
            {selectedCount} selected
          </span>
        )}
      </div>

      {/* Table */}
      {filteredClaims.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ArrowRightLeft className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No assigned claims match your filters</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your filter criteria or clearing filters.</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredClaims}
          rowKey={(row) => row.id}
          emptyMessage="No claims match your filters."
        />
      )}

      {/* Reassignment Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Reassign Claims"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button
              variant="primary"
              disabled={!targetAgentId || !reason}
              icon={<ArrowRightLeft className="w-4 h-4" />}
              onClick={handleReassign}
            >
              Confirm Reassignment
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Reassigning <span className="font-semibold">{selectedCount} claim{selectedCount !== 1 ? 's' : ''}</span> to a new agent.
          </p>

          {/* Target agent */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
              Target Agent <span className="text-red-500">*</span>
            </label>
            <select
              value={targetAgentId}
              onChange={(e) => setTargetAgentId(e.target.value)}
              className="h-10 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 px-3 focus:outline-none focus:border-blue-500"
            >
              <option value="">Select target agent...</option>
              {agents.filter((a) => a.status === 'active').map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} — {a.currentLoad}/{a.capacity} claims
                </option>
              ))}
            </select>
            {targetAgent && (
              <div className="mt-1 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-semibold">{targetAgent.name}</span>
                  <span className="text-slate-400">·</span>
                  <span>{targetAgent.currentLoad}/{targetAgent.capacity} current load</span>
                  <span className="text-slate-400">·</span>
                  <span>{targetAgent.accuracy}% accuracy</span>
                </div>
                {/* Utilization visual */}
                <div className="mt-1.5 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${(targetAgent.currentLoad / targetAgent.capacity) * 100}%`,
                      backgroundColor:
                        targetAgent.currentLoad / targetAgent.capacity >= 0.9
                          ? '#EF4444'
                          : targetAgent.currentLoad / targetAgent.capacity >= 0.7
                          ? '#F59E0B'
                          : '#10B981',
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Reason */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
              Reason <span className="text-red-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="h-10 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 px-3 focus:outline-none focus:border-blue-500"
            >
              <option value="">Select reason...</option>
              {REASSIGNMENT_REASONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional context for the reassignment..."
              rows={3}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 px-3 py-2.5 resize-none focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
