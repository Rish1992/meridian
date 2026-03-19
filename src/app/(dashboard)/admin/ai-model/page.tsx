'use client';

import React, { useState } from 'react';
import { Brain, RefreshCw, AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Button, MetricCard, DataTable, Badge, Modal } from '@/components/ui';
import type { DataTableColumn } from '@/components/ui';
import { BarChart, LineChart, GaugeChart } from '@/components/charts';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Mock AI model data
// ─────────────────────────────────────────────────────────────────────────────

const MODEL_METRICS = {
  accuracy: 91.4,
  precision: 89.7,
  recall: 93.2,
  f1Score: 91.4,
};

const ACCURACY_BY_CATEGORY = [
  { category: 'Hotel', accuracy: 94.2 },
  { category: 'Cab', accuracy: 88.5 },
  { category: 'Food', accuracy: 91.8 },
  { category: 'Alt. Carrier', accuracy: 96.1 },
  { category: 'Boarding Pass', accuracy: 97.3 },
  { category: 'ID Document', accuracy: 95.8 },
  { category: 'Correspondence', accuracy: 82.4 },
  { category: 'Other', accuracy: 78.6 },
];

const PERFORMANCE_OVER_TIME = [
  { month: 'Oct 2025', accuracy: 86.2, precision: 84.1, recall: 88.3 },
  { month: 'Nov 2025', accuracy: 87.8, precision: 85.9, recall: 89.7 },
  { month: 'Dec 2025', accuracy: 88.5, precision: 86.4, recall: 90.6 },
  { month: 'Jan 2026', accuracy: 89.9, precision: 88.1, recall: 91.7 },
  { month: 'Feb 2026', accuracy: 90.7, precision: 89.0, recall: 92.4 },
  { month: 'Mar 2026', accuracy: 91.4, precision: 89.7, recall: 93.2 },
];

interface CorrectionRow {
  id: string;
  documentId: string;
  category: string;
  field: string;
  originalValue: string;
  correctedValue: string;
  correctedBy: string;
  timestamp: string;
}

const RECENT_CORRECTIONS: CorrectionRow[] = [
  { id: 'cor-001', documentId: 'doc-003', category: 'Cab', field: 'Amount (USD)', originalValue: '1240', correctedValue: '12.40', correctedBy: 'Priya Sharma', timestamp: '2026-03-15' },
  { id: 'cor-002', documentId: 'doc-007', category: 'Hotel', field: 'Room Rate', originalValue: '9500', correctedValue: '95.00', correctedBy: 'Arjun Patel', timestamp: '2026-03-14' },
  { id: 'cor-003', documentId: 'doc-019', category: 'Food', field: 'Amount (INR)', originalValue: '12500', correctedValue: '1250', correctedBy: 'Sarah Chen', timestamp: '2026-03-13' },
  { id: 'cor-004', documentId: 'doc-020', category: 'Hotel', field: 'Total Amount', originalValue: '193800', correctedValue: '1938.00', correctedBy: 'Sarah Chen', timestamp: '2026-03-12' },
  { id: 'cor-005', documentId: 'doc-008', category: 'Food', field: 'Meal Type', originalValue: 'Breakfast', correctedValue: 'Lunch + Dinner', correctedBy: 'Mohammed Al-Rashid', timestamp: '2026-03-11' },
  { id: 'cor-006', documentId: 'doc-015', category: 'Food', field: 'Venue', originalValue: 'CCD Airport', correctedValue: 'Cafe Coffee Day - DEL T3', correctedBy: 'Priya Sharma', timestamp: '2026-03-10' },
  { id: 'cor-007', documentId: 'doc-018', category: 'Cab', field: 'Route', originalValue: 'IST to Hotel', correctedValue: 'IST Airport - Hilton Bosphorus', correctedBy: 'Arjun Patel', timestamp: '2026-03-09' },
  { id: 'cor-008', documentId: 'doc-011', category: 'Cab', field: 'Amount (GBP)', originalValue: '950', correctedValue: '9.50', correctedBy: 'Sarah Chen', timestamp: '2026-03-08' },
];

const CORRECTION_TREND = [
  { month: 'Oct', corrections: 142 },
  { month: 'Nov', corrections: 128 },
  { month: 'Dec', corrections: 115 },
  { month: 'Jan', corrections: 98 },
  { month: 'Feb', corrections: 87 },
  { month: 'Mar', corrections: 62 },
];

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function AIModelDashboardPage() {
  const [showRetrainModal, setShowRetrainModal] = useState(false);
  const [retraining, setRetraining] = useState(false);

  const handleRetrain = () => {
    setRetraining(true);
    setTimeout(() => {
      setRetraining(false);
      setShowRetrainModal(false);
    }, 3000);
  };

  const correctionColumns: DataTableColumn<CorrectionRow>[] = [
    { key: 'documentId', label: 'Document', render: (v) => <span className="font-mono text-xs">{String(v)}</span> },
    {
      key: 'category',
      label: 'Category',
      render: (v) => (
        <Badge variant="default" size="sm">{String(v)}</Badge>
      ),
    },
    { key: 'field', label: 'Field', render: (v) => <span className="text-sm font-medium">{String(v)}</span> },
    {
      key: 'originalValue',
      label: 'Original',
      render: (v) => <span className="text-xs text-red-500 line-through font-mono">{String(v)}</span>,
    },
    {
      key: 'correctedValue',
      label: 'Corrected',
      render: (v) => <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-semibold">{String(v)}</span>,
    },
    {
      key: 'correctedBy',
      label: 'Corrected By',
      render: (v) => <span className="text-xs text-slate-600 dark:text-slate-400">{String(v)}</span>,
    },
    {
      key: 'timestamp',
      label: 'Date',
      render: (v) => <span className="text-xs text-slate-500 tabular-nums">{String(v)}</span>,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="AI Model Dashboard"
        description="Monitor AI/ML model performance for document classification and data extraction."
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={<RefreshCw className={cn('w-3.5 h-3.5', retraining && 'animate-spin')} />}
            onClick={() => setShowRetrainModal(true)}
          >
            Trigger Retraining
          </Button>
        }
      />

      {/* Top row: 4 metric cards */}
      <div className="grid grid-cols-4 gap-4 [&>*]:min-w-0 [&>*]:overflow-hidden">
        <MetricCard
          label="Overall Accuracy"
          value={`${MODEL_METRICS.accuracy}%`}
          trend={{ direction: 'up', value: '+2.4%', isPositive: true }}
          sparklineData={PERFORMANCE_OVER_TIME.map((p) => p.accuracy)}
          icon={<Brain className="w-4 h-4" />}
        />
        <MetricCard
          label="Precision"
          value={`${MODEL_METRICS.precision}%`}
          trend={{ direction: 'up', value: '+1.8%', isPositive: true }}
          sparklineData={PERFORMANCE_OVER_TIME.map((p) => p.precision)}
        />
        <MetricCard
          label="Recall"
          value={`${MODEL_METRICS.recall}%`}
          trend={{ direction: 'up', value: '+1.2%', isPositive: true }}
          sparklineData={PERFORMANCE_OVER_TIME.map((p) => p.recall)}
        />
        <MetricCard
          label="F1 Score"
          value={`${MODEL_METRICS.f1Score}%`}
          trend={{ direction: 'up', value: '+2.0%', isPositive: true }}
          sparklineData={[85.1, 86.8, 87.4, 89.0, 89.9, MODEL_METRICS.f1Score]}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[var(--radius-md)] p-4 overflow-hidden min-w-0">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">Accuracy by Document Category</h3>
          <div className="h-[260px]">
            <BarChart
              data={ACCURACY_BY_CATEGORY}
              xKey="category"
              yKeys={['accuracy']}
              height={260}
              showGrid
            />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[var(--radius-md)] p-4 overflow-hidden min-w-0">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">Performance Over Time (6M)</h3>
          <div className="h-[260px]">
            <LineChart
              data={PERFORMANCE_OVER_TIME.map((p) => ({ ...p, month: p.month.slice(0, 3) }))}
              xKey="month"
              yKeys={['accuracy', 'precision', 'recall']}
              height={260}
            />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[var(--radius-md)] p-4 overflow-hidden min-w-0 flex flex-col items-center justify-center">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3 self-start">Confidence Calibration</h3>
          <div className="h-[180px] flex items-center justify-center">
            <GaugeChart
              value={MODEL_METRICS.accuracy}
              target={95}
              label="Calibration Score"
              colorZones={[
                { start: 0, end: 75, color: '#EF4444' },
                { start: 75, end: 90, color: '#F59E0B' },
                { start: 90, end: 100, color: '#10B981' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Correction volume section */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          Correction Volume
        </h2>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="col-span-2 overflow-hidden min-w-0">
            <div className="max-h-[400px] overflow-auto">
              <DataTable
                columns={correctionColumns}
                data={RECENT_CORRECTIONS}
                rowKey={(row) => row.id}
                emptyMessage="No recent corrections."
              />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[var(--radius-md)] p-4 overflow-hidden min-w-0">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">Correction Trend</h3>
            <div className="h-[280px]">
              <LineChart
                data={CORRECTION_TREND}
                xKey="month"
                yKeys={['corrections']}
                height={280}
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
              Corrections down <strong className="text-emerald-600">56%</strong> over 6 months
            </p>
          </div>
        </div>
      </section>

      {/* Retrain Confirmation Modal */}
      <Modal
        isOpen={showRetrainModal}
        onClose={() => !retraining && setShowRetrainModal(false)}
        title="Trigger Model Retraining"
        size="sm"
        footer={
          <div className="flex items-center gap-2 justify-end">
            <Button variant="secondary" size="sm" onClick={() => setShowRetrainModal(false)} disabled={retraining}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleRetrain} isLoading={retraining}>
              {retraining ? 'Retraining...' : 'Start Retraining'}
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-[var(--radius-sm)] bg-amber-50 dark:bg-amber-950/20">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Confirm Retraining</p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                This will queue a retraining job using the latest correction data. The process typically takes 2-4 hours and the model will be updated in production automatically.
              </p>
            </div>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
            <p><strong>Training data:</strong> {RECENT_CORRECTIONS.length} recent corrections + 12,847 historical corrections</p>
            <p><strong>Estimated duration:</strong> 2-4 hours</p>
            <p><strong>Current model version:</strong> v2.4.1</p>
            <p><strong>Target version:</strong> v2.5.0</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
