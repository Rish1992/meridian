'use client';

import React, { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { PageHeader, TabBar } from '@/components/layout';
import { Button, DataTable, Modal, TextInput, Badge } from '@/components/ui';
import type { DataTableColumn } from '@/components/ui';
import { cn, formatCurrency } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Tab data
// ─────────────────────────────────────────────────────────────────────────────

const TABS = [
  { label: 'Disruption Types', value: 'disruptions' },
  { label: 'Expense Categories', value: 'expenses' },
  { label: 'Rejection Reasons', value: 'rejections' },
  { label: 'SLA Thresholds', value: 'sla' },
  { label: 'Comm. Templates', value: 'templates' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Mock master data
// ─────────────────────────────────────────────────────────────────────────────

interface DisruptionTypeRow { id: string; code: string; label: string; description: string; active: boolean }
const DISRUPTION_TYPES: DisruptionTypeRow[] = [
  { id: 'dt-1', code: 'DELAY', label: 'Flight Delay', description: 'Departure delayed beyond scheduled time', active: true },
  { id: 'dt-2', code: 'CANCEL', label: 'Cancellation', description: 'Flight cancelled by airline', active: true },
  { id: 'dt-3', code: 'DENIED', label: 'Denied Boarding', description: 'Involuntary denied boarding due to overbooking', active: true },
  { id: 'dt-4', code: 'DIVERT', label: 'Diversion', description: 'Flight diverted to alternate airport', active: true },
  { id: 'dt-5', code: 'DOWNGRADE', label: 'Cabin Downgrade', description: 'Involuntary downgrade to lower class', active: false },
];

interface ExpenseCatRow { id: string; category: string; maxPerClaim: number; requiresReceipt: boolean; active: boolean }
const EXPENSE_CATEGORIES: ExpenseCatRow[] = [
  { id: 'ec-1', category: 'Hotel', maxPerClaim: 400, requiresReceipt: true, active: true },
  { id: 'ec-2', category: 'Meals', maxPerClaim: 75, requiresReceipt: true, active: true },
  { id: 'ec-3', category: 'Cab / Transport', maxPerClaim: 50, requiresReceipt: true, active: true },
  { id: 'ec-4', category: 'Alternate Carrier', maxPerClaim: 500, requiresReceipt: true, active: true },
  { id: 'ec-5', category: 'Communication', maxPerClaim: 20, requiresReceipt: false, active: true },
  { id: 'ec-6', category: 'Lounge Access', maxPerClaim: 0, requiresReceipt: false, active: false },
];

interface RejectionRow { id: string; code: string; reason: string; description: string }
const REJECTION_REASONS: RejectionRow[] = [
  { id: 'rr-1', code: 'DUP_COMP', reason: 'Dual Compensation', description: 'Passenger already accepted voluntary compensation at gate' },
  { id: 'rr-2', code: 'EXTRA_CIRC', reason: 'Extraordinary Circumstances', description: 'Disruption caused by extraordinary circumstances (weather, ATC, security)' },
  { id: 'rr-3', code: 'LATE_CLAIM', reason: 'Late Filing', description: 'Claim filed beyond the statutory filing window' },
  { id: 'rr-4', code: 'INELIGIBLE', reason: 'Ineligible Route', description: 'Route not covered under applicable regulation' },
  { id: 'rr-5', code: 'FRAUD', reason: 'Suspected Fraud', description: 'Document authenticity could not be verified' },
  { id: 'rr-6', code: 'INCOMPLETE', reason: 'Incomplete Documentation', description: 'Required supporting documents not provided after return request' },
];

interface SLARow { id: string; jurisdiction: string; maxDays: number; warningDays: number; regulation: string }
const SLA_THRESHOLDS: SLARow[] = [
  { id: 'sla-1', jurisdiction: 'India (DGCA)', maxDays: 15, warningDays: 10, regulation: 'DGCA CAR Section 3, Series M, Part IV' },
  { id: 'sla-2', jurisdiction: 'EU (EC 261)', maxDays: 30, warningDays: 21, regulation: 'EC Regulation 261/2004' },
  { id: 'sla-3', jurisdiction: 'UK (CAA)', maxDays: 28, warningDays: 21, regulation: 'UK261 — The Air Passenger Rights Regulations' },
  { id: 'sla-4', jurisdiction: 'UAE (GCAA)', maxDays: 21, warningDays: 14, regulation: 'GCAA Passenger Protection Regulation' },
  { id: 'sla-5', jurisdiction: 'USA (DOT)', maxDays: 60, warningDays: 45, regulation: 'DOT 14 CFR Part 259' },
  { id: 'sla-6', jurisdiction: 'Singapore (CAAS)', maxDays: 14, warningDays: 10, regulation: 'CAAS Airline Customer Charter' },
];

interface TemplateRow { id: string; name: string; type: string; subject: string; lastUpdated: string }
const TEMPLATES: TemplateRow[] = [
  { id: 'tmpl-1', name: 'Claim Received', type: 'Email', subject: 'Your claim {claimId} has been received', lastUpdated: '2026-02-15' },
  { id: 'tmpl-2', name: 'Under Review', type: 'Email', subject: 'Your claim {claimId} is being reviewed', lastUpdated: '2026-02-15' },
  { id: 'tmpl-3', name: 'Approved Full', type: 'Email', subject: 'Good news! Your claim {claimId} has been approved', lastUpdated: '2026-03-01' },
  { id: 'tmpl-4', name: 'Approved Partial', type: 'Email', subject: 'Your claim {claimId} has been partially approved', lastUpdated: '2026-03-01' },
  { id: 'tmpl-5', name: 'Rejected', type: 'Email', subject: 'Update on your claim {claimId}', lastUpdated: '2026-03-01' },
  { id: 'tmpl-6', name: 'Docs Required', type: 'Email', subject: 'Additional documents needed for claim {claimId}', lastUpdated: '2026-02-20' },
  { id: 'tmpl-7', name: 'SLA Warning', type: 'Internal', subject: 'SLA warning: {claimId} approaching deadline', lastUpdated: '2026-01-10' },
  { id: 'tmpl-8', name: 'Payment Sent', type: 'SMS', subject: 'Payment of {amount} initiated for {claimId}', lastUpdated: '2026-02-28' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function MasterDataPage() {
  const [activeTab, setActiveTab] = useState('disruptions');
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');

  const openAddModal = (title: string) => {
    setModalTitle(`Add ${title}`);
    setShowModal(true);
  };

  // Disruption Types columns
  const disruptionCols: DataTableColumn<DisruptionTypeRow>[] = [
    { key: 'code', label: 'Code', render: (v) => <span className="font-mono text-xs font-semibold">{String(v)}</span> },
    { key: 'label', label: 'Label', render: (v) => <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{String(v)}</span> },
    { key: 'description', label: 'Description', render: (v) => <span className="text-xs text-slate-500 dark:text-slate-400">{String(v)}</span> },
    { key: 'active', label: 'Status', render: (v) => <Badge variant={v ? 'success' : 'default'} size="sm">{v ? 'Active' : 'Inactive'}</Badge> },
    {
      key: 'actions',
      label: '',
      render: () => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" icon={<Pencil className="w-3 h-3" />} />
          <Button variant="ghost" size="sm" icon={<Trash2 className="w-3 h-3" />} className="text-red-500 hover:text-red-600" />
        </div>
      ),
    },
  ];

  const expenseCols: DataTableColumn<ExpenseCatRow>[] = [
    { key: 'category', label: 'Category', render: (v) => <span className="text-sm font-medium">{String(v)}</span> },
    { key: 'maxPerClaim', label: 'Max per Claim', render: (v) => <span className="font-semibold tabular-nums">{formatCurrency(Number(v))}</span> },
    { key: 'requiresReceipt', label: 'Receipt Required', render: (v) => <Badge variant={v ? 'info' : 'default'} size="sm">{v ? 'Yes' : 'No'}</Badge> },
    { key: 'active', label: 'Status', render: (v) => <Badge variant={v ? 'success' : 'default'} size="sm">{v ? 'Active' : 'Inactive'}</Badge> },
    {
      key: 'actions',
      label: '',
      render: () => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" icon={<Pencil className="w-3 h-3" />} />
          <Button variant="ghost" size="sm" icon={<Trash2 className="w-3 h-3" />} className="text-red-500 hover:text-red-600" />
        </div>
      ),
    },
  ];

  const rejectionCols: DataTableColumn<RejectionRow>[] = [
    { key: 'code', label: 'Code', render: (v) => <span className="font-mono text-xs font-semibold">{String(v)}</span> },
    { key: 'reason', label: 'Reason', render: (v) => <span className="text-sm font-medium">{String(v)}</span> },
    { key: 'description', label: 'Description', render: (v) => <span className="text-xs text-slate-500">{String(v)}</span> },
    {
      key: 'actions',
      label: '',
      render: () => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" icon={<Pencil className="w-3 h-3" />} />
          <Button variant="ghost" size="sm" icon={<Trash2 className="w-3 h-3" />} className="text-red-500 hover:text-red-600" />
        </div>
      ),
    },
  ];

  const slaCols: DataTableColumn<SLARow>[] = [
    { key: 'jurisdiction', label: 'Jurisdiction', render: (v) => <span className="text-sm font-medium">{String(v)}</span> },
    { key: 'maxDays', label: 'Max Days', render: (v) => <span className="font-semibold tabular-nums">{String(v)} days</span> },
    { key: 'warningDays', label: 'Warning At', render: (v) => <span className="text-amber-600 dark:text-amber-400 font-semibold tabular-nums">{String(v)} days</span> },
    { key: 'regulation', label: 'Regulation', render: (v) => <span className="text-xs text-slate-500 dark:text-slate-400">{String(v)}</span> },
    {
      key: 'actions',
      label: '',
      render: () => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" icon={<Pencil className="w-3 h-3" />} />
        </div>
      ),
    },
  ];

  const templateCols: DataTableColumn<TemplateRow>[] = [
    { key: 'name', label: 'Template', render: (v) => <span className="text-sm font-medium">{String(v)}</span> },
    { key: 'type', label: 'Type', render: (v) => <Badge variant={v === 'Email' ? 'info' : v === 'SMS' ? 'purple' : 'default'} size="sm">{String(v)}</Badge> },
    { key: 'subject', label: 'Subject', render: (v) => <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">{String(v)}</span> },
    { key: 'lastUpdated', label: 'Last Updated', render: (v) => <span className="text-xs text-slate-500">{String(v)}</span> },
    {
      key: 'actions',
      label: '',
      render: () => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" icon={<Pencil className="w-3 h-3" />} />
          <Button variant="ghost" size="sm" icon={<Trash2 className="w-3 h-3" />} className="text-red-500 hover:text-red-600" />
        </div>
      ),
    },
  ];

  const tabLabels: Record<string, string> = {
    disruptions: 'Disruption Type',
    expenses: 'Expense Category',
    rejections: 'Rejection Reason',
    sla: 'SLA Threshold',
    templates: 'Communication Template',
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Master Data Configuration" description="Manage system reference data and configuration tables." />

      <div className="flex items-center justify-between">
        <TabBar tabs={TABS} activeTab={activeTab} onChange={setActiveTab} variant="pill" />
        <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => openAddModal(tabLabels[activeTab])}>
          Add {tabLabels[activeTab]}
        </Button>
      </div>

      {activeTab === 'disruptions' && <DataTable columns={disruptionCols} data={DISRUPTION_TYPES} rowKey={(r) => r.id} />}
      {activeTab === 'expenses' && <DataTable columns={expenseCols} data={EXPENSE_CATEGORIES} rowKey={(r) => r.id} />}
      {activeTab === 'rejections' && <DataTable columns={rejectionCols} data={REJECTION_REASONS} rowKey={(r) => r.id} />}
      {activeTab === 'sla' && <DataTable columns={slaCols} data={SLA_THRESHOLDS} rowKey={(r) => r.id} />}
      {activeTab === 'templates' && <DataTable columns={templateCols} data={TEMPLATES} rowKey={(r) => r.id} />}

      {/* Generic add modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalTitle}
        size="md"
        footer={
          <div className="flex items-center gap-2 justify-end">
            <Button variant="secondary" size="sm" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={() => setShowModal(false)}>Save</Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <TextInput label="Name" placeholder="Enter name..." onChange={() => {}} />
          <TextInput label="Code" placeholder="Enter code..." onChange={() => {}} />
          <TextInput label="Description" placeholder="Enter description..." onChange={() => {}} />
        </div>
      </Modal>
    </div>
  );
}
