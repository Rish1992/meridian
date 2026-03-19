'use client';

import React, { useState, useMemo } from 'react';
import { Download } from 'lucide-react';
import { mockAuditEvents } from '@/data/mock-data';
import { PageHeader, FilterBar } from '@/components/layout';
import { Button, DataTable, Badge } from '@/components/ui';
import type { DataTableColumn } from '@/components/ui';
import { formatDateTime, cn } from '@/lib/utils';
import type { AuditEvent, AuditActionType } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Extra system-level events
// ─────────────────────────────────────────────────────────────────────────────

const systemEvents: AuditEvent[] = [
  {
    id: 'sys-aud-001',
    claimId: null,
    actorType: 'system',
    actorId: 'sys-deploy',
    actorName: 'Deployment Pipeline',
    actionType: 'rule_updated',
    description: 'System deployed v2.14.3 — updated rules engine, improved OCR accuracy model',
    metadata: { version: '2.14.3', component: 'rules-engine' },
    timestamp: '2026-03-15T02:00:00Z',
  },
  {
    id: 'sys-aud-002',
    claimId: null,
    actorType: 'system',
    actorId: 'sys-backup',
    actorName: 'Database Backup Service',
    actionType: 'rule_updated',
    description: 'Nightly database backup completed — 47.3 GB compressed, stored to S3 ap-south-1',
    metadata: { sizeGB: 47.3, duration: '12m 34s' },
    timestamp: '2026-03-17T03:00:00Z',
  },
  {
    id: 'sys-aud-003',
    claimId: null,
    actorType: 'user',
    actorId: 'usr-012',
    actorName: 'System Administrator',
    actionType: 'user_role_changed',
    description: 'Changed role for user usr-009 (Lisa Thompson) from operations_manager to super_admin',
    beforeState: { role: 'operations_manager' },
    afterState: { role: 'super_admin' },
    timestamp: '2026-03-14T10:30:00Z',
  },
  {
    id: 'sys-aud-004',
    claimId: null,
    actorType: 'user',
    actorId: 'usr-012',
    actorName: 'System Administrator',
    actionType: 'user_created',
    description: 'Created new user account: Raj Kapoor (raj.kapoor@meridian.ai) with role claims_agent',
    afterState: { userId: 'usr-013', name: 'Raj Kapoor', role: 'claims_agent' },
    timestamp: '2026-03-12T11:15:00Z',
  },
  {
    id: 'sys-aud-005',
    claimId: null,
    actorType: 'system',
    actorId: 'sys-auth',
    actorName: 'Authentication Service',
    actionType: 'user_login_failed',
    description: 'Failed login attempt for admin@aistra.com — incorrect password (attempt 2/5)',
    metadata: { ip: '103.24.87.xx', location: 'Mumbai, IN' },
    timestamp: '2026-03-16T22:45:00Z',
  },
];

const allEvents = [...mockAuditEvents, ...systemEvents].sort(
  (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
);

// ─────────────────────────────────────────────────────────────────────────────
// Filter configs
// ─────────────────────────────────────────────────────────────────────────────

const EVENT_TYPE_OPTIONS = [
  { value: 'claim', label: 'Claim Events' },
  { value: 'document', label: 'Document Events' },
  { value: 'rule', label: 'Rule Events' },
  { value: 'user', label: 'User Events' },
  { value: 'payment', label: 'Payment Events' },
  { value: 'qc', label: 'QC Events' },
  { value: 'sla', label: 'SLA Events' },
  { value: 'notification', label: 'Notifications' },
];

const FILTER_CONFIGS = [
  { key: 'dateRange', label: 'Date', type: 'daterange' as const },
  { key: 'eventType', label: 'Event Type', type: 'select' as const, placeholder: 'All Types', options: EVENT_TYPE_OPTIONS },
  {
    key: 'actor',
    label: 'Actor',
    type: 'select' as const,
    placeholder: 'All Actors',
    options: [
      { value: 'user', label: 'User' },
      { value: 'system', label: 'System' },
      { value: 'ai', label: 'AI' },
    ],
  },
  { key: 'search', label: 'Search', type: 'search' as const, placeholder: 'Search events...' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getEventCategory(actionType: AuditActionType): string {
  if (actionType.startsWith('claim')) return 'claim';
  if (actionType.startsWith('document')) return 'document';
  if (actionType.startsWith('rule')) return 'rule';
  if (actionType.startsWith('user')) return 'user';
  if (actionType.startsWith('payment')) return 'payment';
  if (actionType.startsWith('qc')) return 'qc';
  if (actionType.startsWith('sla')) return 'sla';
  if (actionType.startsWith('notification')) return 'notification';
  if (actionType.startsWith('authorization')) return 'claim';
  return 'other';
}

const EVENT_BADGE_MAP: Record<string, string> = {
  claim: 'info',
  document: 'purple',
  rule: 'teal',
  user: 'warning',
  payment: 'success',
  qc: 'rose',
  sla: 'danger',
  notification: 'default',
  other: 'default',
};

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function AuditLogsPage() {
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    return allEvents.filter((ev) => {
      if (activeFilters.actor && ev.actorType !== activeFilters.actor) return false;
      if (activeFilters.eventType) {
        const cat = getEventCategory(ev.actionType);
        if (cat !== activeFilters.eventType) return false;
      }
      if (activeFilters.search) {
        const q = activeFilters.search.toLowerCase();
        if (!ev.description.toLowerCase().includes(q) && !ev.actorName.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [activeFilters]);

  const paginated = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize],
  );

  const toggleExpand = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const columns: DataTableColumn<AuditEvent>[] = [
    {
      key: 'timestamp',
      label: 'Timestamp',
      sortable: true,
      render: (v) => (
        <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums whitespace-nowrap">
          {formatDateTime(String(v))}
        </span>
      ),
    },
    {
      key: 'actionType',
      label: 'Event Type',
      render: (_, row) => {
        const cat = getEventCategory(row.actionType);
        return (
          <Badge variant={(EVENT_BADGE_MAP[cat] ?? 'default') as any} size="sm">
            {row.actionType.replace(/_/g, ' ')}
          </Badge>
        );
      },
    },
    {
      key: 'actorName',
      label: 'Actor',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <div className={cn(
            'w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0',
            row.actorType === 'system' ? 'bg-slate-400' : row.actorType === 'ai' ? 'bg-violet-500' : 'bg-blue-500',
          )}>
            {row.actorType === 'ai' ? 'AI' : row.actorName.charAt(0)}
          </div>
          <span className="text-sm text-slate-700 dark:text-slate-300">{row.actorName}</span>
        </div>
      ),
    },
    {
      key: 'claimId',
      label: 'Target',
      render: (v) => (
        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
          {v ? String(v) : '—'}
        </span>
      ),
    },
    {
      key: 'description',
      label: 'Details',
      render: (_, row) => {
        const isExpanded = expandedRows.has(row.id);
        const text = String(row.description);
        const truncated = text.length > 80 && !isExpanded ? text.slice(0, 80) + '...' : text;
        return (
          <div>
            <p className="text-xs text-slate-600 dark:text-slate-400">{truncated}</p>
            {text.length > 80 && (
              <button
                onClick={(e) => { e.stopPropagation(); toggleExpand(row.id); }}
                className="text-[10px] text-blue-500 hover:text-blue-600 mt-0.5"
              >
                {isExpanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="System Audit Logs"
        description={`${filtered.length} events recorded`}
        actions={
          <Button variant="secondary" size="sm" icon={<Download className="w-3.5 h-3.5" />}>
            Export
          </Button>
        }
      />

      <FilterBar
        filters={FILTER_CONFIGS}
        activeFilters={activeFilters}
        onFilterChange={(key, value) => { setActiveFilters((prev) => ({ ...prev, [key]: value })); setPage(1); }}
        onClear={() => { setActiveFilters({}); setPage(1); }}
      />

      <DataTable
        columns={columns}
        data={paginated}
        rowKey={(row) => row.id}
        pagination={{
          page,
          pageSize,
          total: filtered.length,
          onPageChange: (p, ps) => { setPage(p); setPageSize(ps); },
        }}
        emptyMessage="No audit events found."
      />
    </div>
  );
}
