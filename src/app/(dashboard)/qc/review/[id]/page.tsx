'use client';

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  FileText,
  CheckCircle2,
  BookOpen,
  Shield,
  ClipboardList,
  Send,
} from 'lucide-react';
import { mockClaims, mockQCReviews, mockAuditEvents, mockRuleEvaluations, mockDocuments } from '@/data/mock-data';
import { PageHeader, TabBar } from '@/components/layout';
import { Button, Badge, StatusBadge } from '@/components/ui';
import { ClaimSummaryCard, QCChecklistPanel, DocumentViewer } from '@/components/domain';
import { formatCurrency, formatDateTime, cn } from '@/lib/utils';
import type { Claim, QCReview, AuditEvent, RuleEvaluation, ClaimDocument } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Claim Tabs (read-only)
// ─────────────────────────────────────────────────────────────────────────────

function OverviewTab({ claim }: { claim: Claim }) {
  return (
    <div className="space-y-6">
      {/* Passenger Info */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[var(--radius-md)] p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">
          Passenger Information
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            ['Name', claim.passenger.name],
            ['Email', claim.passenger.email],
            ['Phone', claim.passenger.phone],
            ['FF Number', claim.passenger.ffNumber],
            ['FF Tier', claim.passenger.ffTier],
            ['Nationality', claim.passenger.nationality],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</p>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Flight & Disruption */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[var(--radius-md)] p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">
          Flight & Disruption
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            ['Flight', claim.flight.flightNumber],
            ['Route', `${claim.flight.routeOrigin} → ${claim.flight.routeDestination}`],
            ['Disruption Type', claim.disruption.type.replace(/_/g, ' ')],
            ['Duration', `${claim.disruption.durationMinutes} min`],
            ['Reason', claim.disruption.reasonDescription],
            ['Notice', `${claim.disruption.noticeHours} hours`],
          ].map(([label, value]) => (
            <div key={label} className={label === 'Reason' ? 'col-span-2' : ''}>
              <p className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</p>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 capitalize">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[var(--radius-md)] p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">
          Financial Summary
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-slate-400">Total Claimed</p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {formatCurrency(claim.totalClaimed, claim.currency)}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-slate-400">Total Approved</p>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {formatCurrency(claim.totalApproved, claim.currency)}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-slate-400">Outcome</p>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 capitalize">
              {claim.outcome?.replace(/_/g, ' ') ?? 'Pending'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DocumentsTab({ documents }: { documents: ClaimDocument[] }) {
  const [selectedDoc, setSelectedDoc] = useState<string | null>(documents[0]?.id ?? null);
  const doc = documents.find((d) => d.id === selectedDoc);

  return (
    <div className="space-y-4">
      {/* Document list */}
      <div className="flex flex-wrap gap-2">
        {documents.map((d) => (
          <button
            key={d.id}
            onClick={() => setSelectedDoc(d.id)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
              selectedDoc === d.id
                ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300',
            )}
          >
            {d.category.replace(/_/g, ' ')} ({d.classificationConfidence}%)
          </button>
        ))}
      </div>

      {/* Document detail */}
      {doc && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[var(--radius-md)] p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 capitalize">
              {doc.category.replace(/_/g, ' ')} Receipt
            </h4>
            <Badge variant={doc.validationStatus === 'validated' ? 'success' : doc.validationStatus === 'overridden' ? 'warning' : 'default'} size="sm">
              {doc.validationStatus}
            </Badge>
          </div>
          <div className="space-y-2">
            {doc.extractedFields.map((field, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-50 dark:border-slate-800 last:border-0">
                <span className="text-xs text-slate-500 dark:text-slate-400">{field.name}</span>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'text-sm font-medium',
                    field.overriddenValue ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200',
                  )}>
                    {field.value}
                  </span>
                  {field.overriddenValue && (
                    <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">{field.overriddenValue}</span>
                  )}
                  <span className={cn(
                    'text-[10px] font-mono tabular-nums',
                    field.confidence >= 85 ? 'text-emerald-600' : field.confidence >= 60 ? 'text-amber-600' : 'text-red-600',
                  )}>
                    {field.confidence}%
                  </span>
                </div>
              </div>
            ))}
          </div>
          {doc.extractedFields.some((f) => f.overrideReason) && (
            <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-950/20 rounded text-xs text-amber-700 dark:text-amber-400">
              <strong>Override Reason:</strong>{' '}
              {doc.extractedFields.find((f) => f.overrideReason)?.overrideReason}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ValidationTab({ claim }: { claim: Claim }) {
  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[var(--radius-md)] p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">
          Document Validation Summary
        </h3>
        <div className="space-y-3">
          {claim.documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">
                  {doc.category.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 tabular-nums">{doc.classificationConfidence}% confidence</span>
                <Badge
                  variant={doc.validationStatus === 'validated' ? 'success' : doc.validationStatus === 'overridden' ? 'warning' : 'default'}
                  size="sm"
                >
                  {doc.validationStatus}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[var(--radius-md)] p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">
          Overall Confidence
        </h3>
        <div className="flex items-center gap-4">
          <div className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums">{claim.overallConfidence}%</div>
          <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full',
                claim.overallConfidence >= 85 ? 'bg-emerald-500' : claim.overallConfidence >= 60 ? 'bg-amber-500' : 'bg-red-500',
              )}
              style={{ width: `${claim.overallConfidence}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function RulesTab({ claimId }: { claimId: string }) {
  const evaluations = mockRuleEvaluations.filter((r) => r.claimId === claimId);

  return (
    <div className="space-y-3">
      {evaluations.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center">No rule evaluations found.</p>
      ) : (
        evaluations.map((ev) => (
          <div
            key={ev.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[var(--radius-md)] p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              {ev.result === 'pass' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              ) : (
                <Shield className="w-5 h-5 text-red-500 shrink-0" />
              )}
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{ev.ruleName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{formatDateTime(ev.timestamp)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {ev.calculatedAmount > 0 && (
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                  {formatCurrency(ev.calculatedAmount)}
                </span>
              )}
              <Badge variant={ev.result === 'pass' ? 'success' : 'danger'} size="sm">
                {ev.result === 'pass' ? 'Pass' : 'Fail'}
              </Badge>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function AuditTab({ claimId }: { claimId: string }) {
  const events = mockAuditEvents.filter((e) => e.claimId === claimId);

  return (
    <div className="space-y-3">
      {events.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center">No audit events found.</p>
      ) : (
        events.map((ev) => (
          <div
            key={ev.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[var(--radius-md)] p-3 flex items-start gap-3"
          >
            <div className={cn(
              'w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-white text-[10px] font-bold',
              ev.actorType === 'system' ? 'bg-slate-400' : ev.actorType === 'ai' ? 'bg-violet-500' : 'bg-blue-500',
            )}>
              {ev.actorType === 'system' ? 'S' : ev.actorType === 'ai' ? 'AI' : ev.actorName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{ev.actorName}</span>
                <Badge variant="default" size="sm">{ev.actionType.replace(/_/g, ' ')}</Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{ev.description}</p>
              <p className="text-[10px] text-slate-400 mt-1">{formatDateTime(ev.timestamp)}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

const TABS = [
  { label: 'Overview', value: 'overview', icon: <BookOpen className="w-3.5 h-3.5" /> },
  { label: 'Documents', value: 'documents', icon: <FileText className="w-3.5 h-3.5" /> },
  { label: 'Validation', value: 'validation', icon: <Shield className="w-3.5 h-3.5" /> },
  { label: 'Rules', value: 'rules', icon: <ClipboardList className="w-3.5 h-3.5" /> },
  { label: 'Audit', value: 'audit', icon: <BookOpen className="w-3.5 h-3.5" /> },
];

export default function QCReviewPage() {
  const params = useParams();
  const router = useRouter();
  const claimId = params.id as string;
  const [activeTab, setActiveTab] = useState('overview');
  const [showPanel, setShowPanel] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const claim = mockClaims.find((c) => c.id === claimId);
  const existingReview = mockQCReviews.find((r) => r.claimId === claimId);

  if (!claim) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <p className="text-lg font-medium text-slate-500 dark:text-slate-400">Claim not found</p>
        <Button variant="ghost" size="sm" className="mt-4" onClick={() => router.push('/qc/browser')}>
          Back to Browser
        </Button>
      </div>
    );
  }

  const handleSubmitReview = () => {
    setSubmitted(true);
    setTimeout(() => {
      router.push('/qc/browser');
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => router.push('/qc/browser')}>
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            QC Review — {claim.id}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {claim.passenger.name} &middot; {claim.flight.flightNumber} &middot; {claim.flight.routeOrigin} → {claim.flight.routeDestination}
          </p>
        </div>
        <StatusBadge status={claim.status} showDot />
      </div>

      {/* Two-panel layout */}
      <div className="flex gap-4 relative">
        {/* Left panel — Claim summary + tabs */}
        <div className={cn('flex-1 min-w-0 flex flex-col gap-4', showPanel && 'mr-[416px]')}>
          <ClaimSummaryCard claim={claim} variant="full" />

          <TabBar
            tabs={TABS}
            activeTab={activeTab}
            onChange={setActiveTab}
            variant="pill"
          />

          <div className="min-h-[400px]">
            {activeTab === 'overview' && <OverviewTab claim={claim} />}
            {activeTab === 'documents' && <DocumentsTab documents={claim.documents} />}
            {activeTab === 'validation' && <ValidationTab claim={claim} />}
            {activeTab === 'rules' && <RulesTab claimId={claim.id} />}
            {activeTab === 'audit' && <AuditTab claimId={claim.id} />}
          </div>
        </div>

        {/* Right panel — QC Checklist overlay */}
        {showPanel && (
          <div className="fixed right-6 top-20 bottom-6 w-[400px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-[var(--radius-lg)] overflow-y-auto shadow-lg z-20 flex flex-col">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 sticky top-0 z-10">
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">QC Checklist</h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {existingReview ? 'Existing review loaded' : 'New review'}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <QCChecklistPanel
                review={existingReview}
                isReadOnly={!!existingReview || submitted}
                onChange={() => {}}
              />
            </div>

            {/* Submit */}
            {!existingReview && !submitted && (
              <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <Button
                  variant="primary"
                  fullWidth
                  icon={<Send className="w-3.5 h-3.5" />}
                  onClick={handleSubmitReview}
                >
                  Submit Review
                </Button>
              </div>
            )}

            {submitted && (
              <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-emerald-50 dark:bg-emerald-950/30">
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 text-center">
                  Review submitted successfully
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
