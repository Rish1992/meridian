'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, Inbox, Search } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { mockClaims } from '@/data/mock-data';
import { PageHeader, TabBar } from '@/components/layout';
import { Button, DataTable, StatusBadge } from '@/components/ui';
import type { DataTableColumn } from '@/components/ui';
import { FlightRouteVisualizer } from '@/components/domain';
import { getSLAInfo } from '@/lib/utils';
import type { Claim } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const TERMINAL_STATUSES = ['approved', 'rejected', 'closed', 'payment_completed'] as const;

const MY_QUEUE_STATUSES = ['assigned', 'in_review', 'returned', 'validation_complete'] as const;

// ─────────────────────────────────────────────────────────────────────────────
// SLA Timer cell
// ─────────────────────────────────────────────────────────────────────────────

function SLACell({ deadline }: { deadline: string }) {
  const sla = getSLAInfo(deadline);
  return (
    <div className="flex flex-col gap-0.5 min-w-[80px]">
      <span
        className={
          sla.isBreached
            ? 'text-xs font-semibold text-red-600 dark:text-red-400'
            : sla.percentage >= 75
            ? 'text-xs font-semibold text-amber-600 dark:text-amber-400'
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
// Enhanced Search Bar
// ─────────────────────────────────────────────────────────────────────────────

interface EnhancedSearchBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  statusValue: string;
  onStatusChange: (v: string) => void;
  statusOptions: { value: string; label: string }[];
  disruptionValue: string;
  onDisruptionChange: (v: string) => void;
  flightNumber: string;
  onFlightNumberChange: (v: string) => void;
  dateFrom: string;
  onDateFromChange: (v: string) => void;
  dateTo: string;
  onDateToChange: (v: string) => void;
  onClear: () => void;
}

const selectStyles =
  'h-8 cursor-pointer rounded-md border border-slate-200 bg-white px-3 pr-8 text-sm text-slate-700 outline-none appearance-none transition-colors duration-150 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200';

const selectBg = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat' as const,
  backgroundPosition: 'right 8px center' as const,
};

const dateInputStyles =
  'h-8 cursor-pointer rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition-colors duration-150 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 [color-scheme:light] dark:[color-scheme:dark]';

function EnhancedSearchBar({
  search,
  onSearchChange,
  statusValue,
  onStatusChange,
  statusOptions,
  disruptionValue,
  onDisruptionChange,
  flightNumber,
  onFlightNumberChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  onClear,
}: EnhancedSearchBarProps) {
  const hasActiveFilters =
    search ||
    statusValue ||
    disruptionValue ||
    flightNumber ||
    dateFrom ||
    dateTo;

  return (
    <div className="flex flex-col gap-3">
      {/* Primary search row */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by Claim ID, Passenger, PNR..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 transition-colors duration-150 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-brand-primary"
        />
      </div>

      {/* Secondary filters row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status */}
        <select
          value={statusValue}
          onChange={(e) => onStatusChange(e.target.value)}
          className={selectStyles}
          style={selectBg}
        >
          <option value="">All Statuses</option>
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Disruption type */}
        <select
          value={disruptionValue}
          onChange={(e) => onDisruptionChange(e.target.value)}
          className={selectStyles}
          style={selectBg}
        >
          <option value="">All Disruptions</option>
          <option value="delay">Delay</option>
          <option value="cancellation">Cancellation</option>
          <option value="denied_boarding">Denied Boarding</option>
          <option value="diversion">Diversion</option>
        </select>

        {/* Flight number search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Flight no."
            value={flightNumber}
            onChange={(e) => onFlightNumberChange(e.target.value)}
            className="h-8 w-28 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 transition-colors duration-150 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </div>

        {/* Date range */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400">Date:</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            title="From date"
            className={dateInputStyles}
          />
          <span className="text-xs text-slate-400">–</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            title="To date"
            className={dateInputStyles}
          />
        </div>

        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-transparent px-3 text-sm font-medium text-slate-500 transition-colors duration-150 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            Clear All
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared filter logic
// ─────────────────────────────────────────────────────────────────────────────

interface FilterState {
  search: string;
  status: string;
  disruptionType: string;
  flightNumber: string;
  dateFrom: string;
  dateTo: string;
}

const EMPTY_FILTERS: FilterState = {
  search: '',
  status: '',
  disruptionType: '',
  flightNumber: '',
  dateFrom: '',
  dateTo: '',
};

function applyFilters(claims: Claim[], filters: FilterState): Claim[] {
  return claims.filter((c) => {
    // Global text search: Claim ID, Passenger Name, PNR
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matchesId = c.id.toLowerCase().includes(q);
      const matchesName = c.passenger.name.toLowerCase().includes(q);
      const matchesPnr = c.pnr.toLowerCase().includes(q);
      if (!matchesId && !matchesName && !matchesPnr) return false;
    }
    // Status
    if (filters.status && c.status !== filters.status) return false;
    // Disruption type
    if (filters.disruptionType && c.disruption.type !== filters.disruptionType) return false;
    // Flight number
    if (filters.flightNumber) {
      const fq = filters.flightNumber.toLowerCase();
      if (!c.flight.flightNumber.toLowerCase().includes(fq)) return false;
    }
    // Date range (based on createdAt)
    if (filters.dateFrom) {
      if (new Date(c.createdAt) < new Date(filters.dateFrom)) return false;
    }
    if (filters.dateTo) {
      // Include the full dateTo day
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      if (new Date(c.createdAt) > toDate) return false;
    }
    return true;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Formatters
// ─────────────────────────────────────────────────────────────────────────────

function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function AgentClaimsQueuePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [activeTab, setActiveTab] = useState<'my_queue' | 'past_claims'>('my_queue');

  // My Queue filter state
  const [queueFilters, setQueueFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [queuePage, setQueuePage] = useState(1);
  const [queuePageSize, setQueuePageSize] = useState(25);

  // Past Claims filter state
  const [pastFilters, setPastFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [pastPage, setPastPage] = useState(1);
  const [pastPageSize, setPastPageSize] = useState(25);

  // ── Source data ────────────────────────────────────────────────────────────

  const agentClaims = useMemo(
    () => mockClaims.filter((c) => c.assignedAgentId === user?.id),
    [user?.id],
  );

  const terminalClaims = useMemo(
    () => mockClaims.filter((c) => (TERMINAL_STATUSES as readonly string[]).includes(c.status)),
    [],
  );

  // ── Filtered data ──────────────────────────────────────────────────────────

  const filteredQueue = useMemo(
    () => applyFilters(agentClaims, queueFilters),
    [agentClaims, queueFilters],
  );

  const filteredPast = useMemo(
    () => applyFilters(terminalClaims, pastFilters),
    [terminalClaims, pastFilters],
  );

  // ── Paginated data ─────────────────────────────────────────────────────────

  const paginatedQueue = useMemo(
    () => filteredQueue.slice((queuePage - 1) * queuePageSize, queuePage * queuePageSize),
    [filteredQueue, queuePage, queuePageSize],
  );

  const paginatedPast = useMemo(
    () => filteredPast.slice((pastPage - 1) * pastPageSize, pastPage * pastPageSize),
    [filteredPast, pastPage, pastPageSize],
  );

  // ── Filter handlers ────────────────────────────────────────────────────────

  function updateQueueFilter(key: keyof FilterState, value: string) {
    setQueueFilters((prev) => ({ ...prev, [key]: value }));
    setQueuePage(1);
  }

  function clearQueueFilters() {
    setQueueFilters(EMPTY_FILTERS);
    setQueuePage(1);
  }

  function updatePastFilter(key: keyof FilterState, value: string) {
    setPastFilters((prev) => ({ ...prev, [key]: value }));
    setPastPage(1);
  }

  function clearPastFilters() {
    setPastFilters(EMPTY_FILTERS);
    setPastPage(1);
  }

  function handleTabChange(value: string) {
    setActiveTab(value as 'my_queue' | 'past_claims');
  }

  // ── Tab badge counts ───────────────────────────────────────────────────────

  const tabsWithBadges = [
    { label: 'My Queue', value: 'my_queue', badge: agentClaims.length },
    { label: 'Past Claims Browser', value: 'past_claims' },
  ];

  // ── My Queue columns (no confidence) ──────────────────────────────────────

  const queueColumns: DataTableColumn<Claim>[] = [
    {
      key: 'id',
      label: 'Claim ID',
      render: (v) => (
        <span className="font-mono text-xs text-slate-500 dark:text-slate-400 truncate block max-w-[120px]">
          {String(v)}
        </span>
      ),
    },
    {
      key: 'passenger',
      label: 'Passenger',
      render: (_, row) => (
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate max-w-[140px]">
            {row.passenger.name}
          </p>
          <p className="text-[11px] text-slate-400 truncate max-w-[140px]">{row.passenger.email}</p>
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
      key: 'flightNumber',
      label: 'Flight',
      render: (_, row) => (
        <span className="font-mono text-xs">{row.flight.flightNumber}</span>
      ),
    },
    {
      key: 'route',
      label: 'Route',
      render: (_, row) => (
        <FlightRouteVisualizer
          origin={{ code: row.flight.routeOrigin, city: row.flight.originCity }}
          destination={{
            code: row.flight.routeDestination,
            city: row.flight.destinationCity,
          }}
          variant="inline"
        />
      ),
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
      key: 'documents',
      label: 'Docs',
      render: (_, row) => (
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
          {row.documents.length}
        </span>
      ),
    },
    {
      key: 'slaDeadline',
      label: 'SLA',
      sortable: true,
      render: (v) => <SLACell deadline={String(v)} />,
    },
    {
      key: 'status',
      label: 'Status',
      render: (_, row) => <StatusBadge status={row.status} size="sm" showDot />,
    },
  ];

  // ── Past Claims columns ────────────────────────────────────────────────────

  const pastColumns: DataTableColumn<Claim>[] = [
    {
      key: 'id',
      label: 'Claim ID',
      render: (v) => (
        <span className="font-mono text-xs text-slate-500 dark:text-slate-400 truncate block max-w-[120px]">
          {String(v)}
        </span>
      ),
    },
    {
      key: 'passenger',
      label: 'Passenger',
      render: (_, row) => (
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate max-w-[140px]">
            {row.passenger.name}
          </p>
          <p className="text-[11px] text-slate-400 truncate max-w-[140px]">{row.passenger.email}</p>
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
      key: 'flightNumber',
      label: 'Flight',
      render: (_, row) => (
        <span className="font-mono text-xs">{row.flight.flightNumber}</span>
      ),
    },
    {
      key: 'route',
      label: 'Route',
      render: (_, row) => (
        <FlightRouteVisualizer
          origin={{ code: row.flight.routeOrigin, city: row.flight.originCity }}
          destination={{
            code: row.flight.routeDestination,
            city: row.flight.destinationCity,
          }}
          variant="inline"
        />
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
      key: 'status',
      label: 'Outcome',
      render: (_, row) => <StatusBadge status={row.status} size="sm" showDot />,
    },
    {
      key: 'totalApproved',
      label: 'Total Payout',
      sortable: true,
      render: (v, row) => (
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
          {formatCurrency(Number(v), row.currency)}
        </span>
      ),
    },
    {
      key: 'updatedAt',
      label: 'Resolution Date',
      sortable: true,
      render: (v) => (
        <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
          {formatDate(String(v))}
        </span>
      ),
    },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────

  const isMyQueue = activeTab === 'my_queue';
  const displayCount = isMyQueue ? filteredQueue.length : filteredPast.length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <PageHeader
        title="Claims Queue"
        description={
          isMyQueue
            ? `${displayCount} claim${displayCount !== 1 ? 's' : ''} assigned to you`
            : `${displayCount} resolved claim${displayCount !== 1 ? 's' : ''}`
        }
        actions={
          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={() => window.location.reload()}
          >
            Refresh Queue
          </Button>
        }
      />

      {/* Tab Bar */}
      <TabBar
        tabs={tabsWithBadges}
        activeTab={activeTab}
        onChange={handleTabChange}
        variant="underline"
      />

      {/* ── My Queue tab ──────────────────────────────────────────────────── */}
      {isMyQueue && (
        <>
          <EnhancedSearchBar
            search={queueFilters.search}
            onSearchChange={(v) => updateQueueFilter('search', v)}
            statusValue={queueFilters.status}
            onStatusChange={(v) => updateQueueFilter('status', v)}
            statusOptions={MY_QUEUE_STATUSES.map((s) => ({
              value: s,
              label: s
                .split('_')
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' '),
            }))}
            disruptionValue={queueFilters.disruptionType}
            onDisruptionChange={(v) => updateQueueFilter('disruptionType', v)}
            flightNumber={queueFilters.flightNumber}
            onFlightNumberChange={(v) => updateQueueFilter('flightNumber', v)}
            dateFrom={queueFilters.dateFrom}
            onDateFromChange={(v) => updateQueueFilter('dateFrom', v)}
            dateTo={queueFilters.dateTo}
            onDateToChange={(v) => updateQueueFilter('dateTo', v)}
            onClear={clearQueueFilters}
          />

          {filteredQueue.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Inbox className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-base font-medium text-slate-500 dark:text-slate-400">
                No claims match your filters
              </p>
              <p className="text-sm text-slate-400 mt-1">
                Try adjusting the filters or clearing them all.
              </p>
              {Object.values(queueFilters).some(Boolean) && (
                <button
                  type="button"
                  onClick={clearQueueFilters}
                  className="mt-4 text-sm text-blue-500 hover:text-blue-600 transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <DataTable
              columns={queueColumns}
              data={paginatedQueue}
              rowKey={(row) => row.id}
              onRowClick={(row) => router.push(`/agent/claims/${row.id}`)}
              pagination={{
                page: queuePage,
                pageSize: queuePageSize,
                total: filteredQueue.length,
                onPageChange: (p, ps) => {
                  setQueuePage(p);
                  setQueuePageSize(ps);
                },
              }}
              emptyMessage="No claims assigned to you."
            />
          )}
        </>
      )}

      {/* ── Past Claims Browser tab ───────────────────────────────────────── */}
      {!isMyQueue && (
        <>
          <EnhancedSearchBar
            search={pastFilters.search}
            onSearchChange={(v) => updatePastFilter('search', v)}
            statusValue={pastFilters.status}
            onStatusChange={(v) => updatePastFilter('status', v)}
            statusOptions={[
              { value: 'approved', label: 'Approved' },
              { value: 'rejected', label: 'Rejected' },
              { value: 'closed', label: 'Closed' },
              { value: 'payment_completed', label: 'Payment Completed' },
            ]}
            disruptionValue={pastFilters.disruptionType}
            onDisruptionChange={(v) => updatePastFilter('disruptionType', v)}
            flightNumber={pastFilters.flightNumber}
            onFlightNumberChange={(v) => updatePastFilter('flightNumber', v)}
            dateFrom={pastFilters.dateFrom}
            onDateFromChange={(v) => updatePastFilter('dateFrom', v)}
            dateTo={pastFilters.dateTo}
            onDateToChange={(v) => updatePastFilter('dateTo', v)}
            onClear={clearPastFilters}
          />

          {filteredPast.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Inbox className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-base font-medium text-slate-500 dark:text-slate-400">
                No resolved claims match your filters
              </p>
              <p className="text-sm text-slate-400 mt-1">
                Try adjusting the filters or clearing them all.
              </p>
              {Object.values(pastFilters).some(Boolean) && (
                <button
                  type="button"
                  onClick={clearPastFilters}
                  className="mt-4 text-sm text-blue-500 hover:text-blue-600 transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <DataTable
              columns={pastColumns}
              data={paginatedPast}
              rowKey={(row) => row.id}
              onRowClick={(row) => router.push(`/agent/claims/${row.id}`)}
              pagination={{
                page: pastPage,
                pageSize: pastPageSize,
                total: filteredPast.length,
                onPageChange: (p, ps) => {
                  setPastPage(p);
                  setPastPageSize(ps);
                },
              }}
              emptyMessage="No resolved claims found."
            />
          )}
        </>
      )}
    </div>
  );
}
