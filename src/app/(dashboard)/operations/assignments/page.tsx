'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { UserCheck, Inbox, ChevronDown, Search, CheckSquare } from 'lucide-react';
import { mockUsers } from '@/data/mock-data';
import { useClaimsStore } from '@/stores/claims-store';
import { PageHeader, FilterBar } from '@/components/layout';
import { Button, DataTable, Modal, StatusBadge } from '@/components/ui';
import type { DataTableColumn } from '@/components/ui';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import type { Claim, User } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Filter configs
// ─────────────────────────────────────────────────────────────────────────────

const FILTER_CONFIGS = [
  {
    key: 'disruptionType',
    label: 'Disruption Type',
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
    key: 'route',
    label: 'Route',
    type: 'search' as const,
    placeholder: 'e.g. DEL',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Agent Dropdown
// ─────────────────────────────────────────────────────────────────────────────

interface AgentDropdownProps {
  agents: User[];
  selected: User | null;
  onSelect: (agent: User | null) => void;
}

function AgentDropdown({ agents, selected, onSelect }: AgentDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.status.toLowerCase().includes(search.toLowerCase()),
  );

  const statusColors: Record<string, string> = {
    active: 'bg-emerald-400',
    on_leave: 'bg-amber-400',
    offline: 'bg-slate-300',
  };

  const loadPct = (agent: User) =>
    agent.capacity > 0 ? Math.round((agent.currentLoad / agent.capacity) * 100) : 0;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 hover:border-blue-400 focus:outline-none focus:border-blue-500 min-w-[280px] transition-colors"
      >
        {selected ? (
          <>
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${statusColors[selected.status] ?? 'bg-slate-300'}`}
            />
            <span className="font-medium truncate">{selected.name}</span>
            <span className="ml-auto text-xs text-slate-400 tabular-nums shrink-0">
              {selected.currentLoad}/{selected.capacity}
            </span>
          </>
        ) : (
          <span className="text-slate-400">Select Agent</span>
        )}
        <ChevronDown className={`w-4 h-4 text-slate-400 ml-auto shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 mt-1 w-[360px] bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-slate-50 dark:bg-slate-900">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search agents…"
                className="flex-1 bg-transparent text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>

          {/* List */}
          <div className="max-h-72 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No agents found</p>
            ) : (
              filtered.map((agent) => {
                const pct = loadPct(agent);
                const isActive = agent.status === 'active';
                const isSelected = selected?.id === agent.id;

                return (
                  <button
                    key={agent.id}
                    type="button"
                    disabled={!isActive}
                    onClick={() => {
                      onSelect(isSelected ? null : agent);
                      setOpen(false);
                      setSearch('');
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors
                      ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}
                      ${!isActive ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    {/* Status dot */}
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${statusColors[agent.status] ?? 'bg-slate-300'}`}
                    />

                    {/* Avatar */}
                    <span className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[11px] font-bold flex items-center justify-center shrink-0">
                      {agent.avatar}
                    </span>

                    {/* Name + status */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{agent.name}</p>
                      <p className="text-[11px] text-slate-400 capitalize">{agent.status.replace(/_/g, ' ')}</p>
                    </div>

                    {/* Load bar + accuracy */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 tabular-nums">
                        {agent.currentLoad}/{agent.capacity}
                      </span>
                      <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${pct >= 90 ? 'bg-red-400' : pct >= 70 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400">{agent.accuracy}% acc</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function AssignmentDashboardPage() {
  const { claims, assignClaim } = useClaimsStore();

  const [selectedClaims, setSelectedClaims] = useState<Set<string>>(new Set());
  const [selectedAgent, setSelectedAgent] = useState<User | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const unassignedClaims = useMemo(
    () => claims.filter((c) => c.status === 'unassigned'),
    [claims],
  );

  const filteredClaims = useMemo(() => {
    return unassignedClaims.filter((c) => {
      if (activeFilters.disruptionType && c.disruption.type !== activeFilters.disruptionType) return false;
      if (activeFilters.route) {
        const route = activeFilters.route.toUpperCase();
        if (!c.flight.routeOrigin.includes(route) && !c.flight.routeDestination.includes(route)) return false;
      }
      return true;
    });
  }, [unassignedClaims, activeFilters]);

  const agents = useMemo(
    () => mockUsers.filter((u) => u.role === 'claims_agent'),
    [],
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedClaims(new Set(filteredClaims.map((c) => c.id)));
    } else {
      setSelectedClaims(new Set());
    }
  };

  const handleToggleClaim = (claimId: string) => {
    setSelectedClaims((prev) => {
      const next = new Set(prev);
      if (next.has(claimId)) {
        next.delete(claimId);
      } else {
        next.add(claimId);
      }
      return next;
    });
  };

  const handleAssign = () => {
    if (!selectedAgent) return;
    selectedClaims.forEach((claimId) => {
      assignClaim(claimId, selectedAgent.id);
    });
    setSelectedClaims(new Set());
    setSelectedAgent(null);
    setShowAssignModal(false);
  };

  const columns: DataTableColumn<Claim>[] = [
    {
      key: 'select',
      label: (
        <input
          type="checkbox"
          checked={filteredClaims.length > 0 && selectedClaims.size === filteredClaims.length}
          onChange={(e) => handleSelectAll(e.target.checked)}
          className="w-4 h-4 rounded border-slate-300 text-blue-500 cursor-pointer"
        />
      ) as unknown as string,
      render: (_, row) => (
        <input
          type="checkbox"
          checked={selectedClaims.has(row.id)}
          onChange={() => handleToggleClaim(row.id)}
          className="w-4 h-4 rounded border-slate-300 text-blue-500 cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
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
          <p className="text-[11px] text-slate-400 truncate max-w-[140px]">{row.passenger.email}</p>
        </div>
      ),
    },
    {
      key: 'pnr',
      label: 'PNR',
      render: (v) => <span className="font-mono text-xs font-semibold truncate block max-w-[80px]">{String(v)}</span>,
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
      key: 'totalClaimed',
      label: 'Amount',
      sortable: true,
      render: (v, row) => (
        <span className="text-sm font-semibold tabular-nums truncate block max-w-[100px]">
          {formatCurrency(Number(v), row.currency)}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Submitted',
      render: (v) => (
        <span className="text-xs text-slate-500">{formatDateTime(String(v))}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (_, row) => <StatusBadge status={row.status} size="sm" showDot />,
    },
  ];

  const selectedCount = selectedClaims.size;
  const canAssign = selectedCount > 0 && selectedAgent !== null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Assignment Dashboard"
        description="Assign unprocessed claims to available agents."
      />

      {/* Assign toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-[var(--radius-md)] border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Left: label + agent dropdown */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300 shrink-0">Assign to:</span>
            <AgentDropdown agents={agents} selected={selectedAgent} onSelect={setSelectedAgent} />
          </div>

          {/* Right: selection count + assign button */}
          <div className="flex items-center gap-3">
            {selectedCount > 0 && (
              <span className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                <CheckSquare className="w-4 h-4 text-blue-500" />
                <span>
                  <span className="font-semibold tabular-nums">{selectedCount}</span> claim{selectedCount !== 1 ? 's' : ''} selected
                </span>
              </span>
            )}
            <Button
              variant="primary"
              icon={<UserCheck className="w-4 h-4" />}
              onClick={() => setShowAssignModal(true)}
              disabled={!canAssign}
            >
              Assign Selected
            </Button>
          </div>
        </div>

        {/* Agent preview (when selected) */}
        {selectedAgent && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium text-slate-700 dark:text-slate-200">{selectedAgent.name}</span>
            <span className="flex items-center gap-1">
              <span
                className={`w-1.5 h-1.5 rounded-full ${selectedAgent.status === 'active' ? 'bg-emerald-400' : 'bg-amber-400'}`}
              />
              <span className="capitalize">{selectedAgent.status.replace(/_/g, ' ')}</span>
            </span>
            <span>Load: <span className="font-semibold text-slate-600 dark:text-slate-300 tabular-nums">{selectedAgent.currentLoad}/{selectedAgent.capacity}</span></span>
            <span>Accuracy: <span className="font-semibold text-slate-600 dark:text-slate-300">{selectedAgent.accuracy}%</span></span>
            <span>Shift: <span className="font-semibold text-slate-600 dark:text-slate-300">{selectedAgent.shiftStart} – {selectedAgent.shiftEnd}</span></span>
          </div>
        )}
      </div>

      {/* Unassigned Claims full-width table */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
            <Inbox className="w-4 h-4 text-amber-500" />
            Unassigned Claims
            <span className="ml-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
              {filteredClaims.length}
            </span>
          </h2>
        </div>

        <FilterBar
          filters={FILTER_CONFIGS}
          activeFilters={activeFilters}
          onFilterChange={(key, value) => setActiveFilters((prev) => ({ ...prev, [key]: value }))}
          onClear={() => setActiveFilters({})}
        />

        {filteredClaims.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-slate-900 rounded-[var(--radius-md)] border border-slate-200 dark:border-slate-700">
            <Inbox className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No unassigned claims</p>
            <p className="text-xs text-slate-400 mt-1">All claims have been assigned.</p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredClaims}
            rowKey={(row) => row.id}
            emptyMessage="No unassigned claims."
          />
        )}
      </div>

      {/* Assign Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Confirm Assignment"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAssignModal(false)}>Cancel</Button>
            <Button
              variant="primary"
              disabled={!selectedAgent}
              icon={<UserCheck className="w-4 h-4" />}
              onClick={handleAssign}
            >
              Confirm Assignment
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            You are assigning{' '}
            <span className="font-semibold">{selectedCount} claim{selectedCount !== 1 ? 's' : ''}</span>{' '}
            to{' '}
            <span className="font-semibold">{selectedAgent?.name ?? 'an agent'}</span>.
          </p>

          {/* Agent selector inside modal */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
              Agent
            </label>
            <select
              value={selectedAgent?.id ?? ''}
              onChange={(e) => {
                const agent = agents.find((a) => a.id === e.target.value);
                setSelectedAgent(agent ?? null);
              }}
              className="h-10 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 px-3 focus:outline-none focus:border-blue-500"
            >
              <option value="">Choose agent…</option>
              {agents.filter((a) => a.status === 'active').map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} — {a.currentLoad}/{a.capacity} claims · {a.accuracy}% acc
                </option>
              ))}
            </select>
          </div>

          {/* Claims being assigned */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
              Claims to Assign ({selectedCount})
            </label>
            <div className="max-h-36 overflow-y-auto flex flex-col gap-1">
              {Array.from(selectedClaims).map((claimId) => {
                const claim = filteredClaims.find((c) => c.id === claimId);
                return claim ? (
                  <div key={claimId} className="flex items-center justify-between gap-2 text-xs p-2 bg-slate-50 dark:bg-slate-800 rounded overflow-hidden">
                    <span className="font-mono text-slate-500 truncate min-w-0">{claimId}</span>
                    <span className="text-slate-600 dark:text-slate-300 truncate min-w-0">{claim.passenger.name}</span>
                    <span className="font-semibold tabular-nums shrink-0">{formatCurrency(claim.totalClaimed, claim.currency)}</span>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
