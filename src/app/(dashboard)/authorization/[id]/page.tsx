'use client';

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ShieldCheck,
  FileText,
  ListChecks,
  ClipboardList,
  Star,
  AlertTriangle,
  Repeat,
  TrendingUp,
  User,
  Plane,
  Hotel,
  Car,
  UtensilsCrossed,
  CreditCard,
  IdCard,
  Mail,
  FileQuestion,
  Timer,
  Award,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Eye,
} from 'lucide-react';
import {
  mockClaims,
  mockBusinessRules,
  mockRuleEvaluations,
  mockAuditEvents,
} from '@/data/mock-data';
import { Button, Modal, StatusBadge, AuditTimeline, ConfidenceGauge } from '@/components/ui';
import { RuleCard, FlightRouteVisualizer } from '@/components/domain';
import { StatComparisonRow } from '@/components/ui';
import { useClaimsStore } from '@/stores/claims-store';
import { formatCurrency, cn, getSLAInfo, formatDate, formatDateTime } from '@/lib/utils';
import type { DocumentCategory } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Tab definitions
// ─────────────────────────────────────────────────────────────────────────────

type TabId = 'overview' | 'document_review' | 'rules' | 'audit' | 'decision';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: FileText },
  { id: 'document_review', label: 'Document Review', icon: Eye },
  { id: 'rules', label: 'Rules & Outcome', icon: ListChecks },
  { id: 'audit', label: 'Audit Log', icon: ClipboardList },
  { id: 'decision', label: 'Authorization Decision', icon: ShieldCheck },
];

// ─────────────────────────────────────────────────────────────────────────────
// Mock line items (read-only, matches agent version)
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_LINE_ITEMS: Record<DocumentCategory, { item: string; qty: number; unitPrice: number; amount: number; confidence: number }[]> = {
  hotel: [
    { item: 'Room (Night 1)', qty: 1, unitPrice: 180, amount: 180, confidence: 97 },
    { item: 'Room (Night 2)', qty: 1, unitPrice: 180, amount: 180, confidence: 95 },
    { item: 'Room Service', qty: 1, unitPrice: 42, amount: 42, confidence: 85 },
    { item: 'Laundry', qty: 1, unitPrice: 18, amount: 18, confidence: 78 },
  ],
  food: [
    { item: 'Butter Chicken', qty: 1, unitPrice: 12, amount: 12, confidence: 94 },
    { item: 'Naan', qty: 2, unitPrice: 3, amount: 6, confidence: 91 },
    { item: 'Dal Tadka', qty: 1, unitPrice: 8, amount: 8, confidence: 88 },
    { item: 'Beverages', qty: 2, unitPrice: 4, amount: 8, confidence: 72 },
  ],
  cab: [
    { item: 'Airport Transfer', qty: 1, unitPrice: 45, amount: 45, confidence: 96 },
    { item: 'Waiting Charge', qty: 1, unitPrice: 10, amount: 10, confidence: 80 },
  ],
  travel: [],
  alternate_carrier: [
    { item: 'Economy Ticket', qty: 1, unitPrice: 650, amount: 650, confidence: 98 },
    { item: 'Seat Selection', qty: 1, unitPrice: 25, amount: 25, confidence: 83 },
  ],
  boarding_pass: [],
  id_document: [],
  correspondence: [],
  other: [],
};

// ─────────────────────────────────────────────────────────────────────────────
// Category icons / colors
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<DocumentCategory, React.ElementType> = {
  hotel: Hotel,
  cab: Car,
  food: UtensilsCrossed,
  travel: Plane,
  alternate_carrier: Plane,
  boarding_pass: CreditCard,
  id_document: IdCard,
  correspondence: Mail,
  other: FileQuestion,
};

const CATEGORY_BG: Record<DocumentCategory, string> = {
  hotel: 'from-blue-600 to-blue-800',
  cab: 'from-amber-500 to-amber-700',
  food: 'from-orange-500 to-orange-700',
  travel: 'from-indigo-600 to-indigo-800',
  alternate_carrier: 'from-violet-600 to-violet-800',
  boarding_pass: 'from-teal-600 to-teal-800',
  id_document: 'from-slate-600 to-slate-800',
  correspondence: 'from-sky-600 to-sky-800',
  other: 'from-gray-600 to-gray-800',
};

// ─────────────────────────────────────────────────────────────────────────────
// Receipt image mapping
// ─────────────────────────────────────────────────────────────────────────────

function getReceiptImagePath(category: DocumentCategory, docIndex: number): string | null {
  switch (category) {
    case 'hotel':
      return docIndex % 2 === 0 ? '/receipts/hotel-1.svg' : '/receipts/hotel-2.svg';
    case 'cab':
      return docIndex % 2 === 0 ? '/receipts/cab-1.svg' : '/receipts/cab-2.svg';
    case 'food':
      return docIndex % 2 === 0 ? '/receipts/food-1.svg' : '/receipts/food-2.svg';
    case 'travel':
    case 'alternate_carrier':
      return '/receipts/flight-1.svg';
    default:
      return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{label}</span>
      <span className="text-sm text-slate-800 dark:text-slate-100 font-medium min-w-0">{value}</span>
    </div>
  );
}

function SectionCard({
  title,
  children,
  className,
  accent = 'blue',
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  accent?: 'blue' | 'indigo' | 'red' | 'emerald' | 'amber' | 'slate';
}) {
  const accentColors: Record<string, string> = {
    blue: 'bg-blue-500',
    indigo: 'bg-indigo-500',
    red: 'bg-red-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    slate: 'bg-slate-400',
  };
  return (
    <div
      className={cn(
        'bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-4 overflow-hidden relative',
        className,
      )}
    >
      <div className={cn('absolute left-0 top-0 bottom-0 w-1', accentColors[accent])} />
      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 pl-1">{title}</h4>
      <div className="pl-1">{children}</div>
    </div>
  );
}

function formatTime(d: string) {
  return d
    ? new Date(d).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';
}

const TIER_COLORS: Record<string, string> = {
  Platinum: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200 ring-1 ring-slate-300 dark:ring-slate-500',
  Gold: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 ring-1 ring-amber-300 dark:ring-amber-600',
  Silver: 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-300 ring-1 ring-gray-300 dark:ring-gray-500',
  None: 'bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
};

// ─────────────────────────────────────────────────────────────────────────────
// Sticky Claim Header Bar (same pattern as agent)
// ─────────────────────────────────────────────────────────────────────────────

function ClaimHeaderBar({ claim }: { claim: typeof mockClaims[0] }) {
  const sla = getSLAInfo(claim.slaDeadline);

  const slaTextColor = sla.isBreached
    ? 'text-red-600 dark:text-red-400'
    : sla.percentage >= 85
    ? 'text-red-600 dark:text-red-400'
    : sla.percentage >= 60
    ? 'text-amber-600 dark:text-amber-400'
    : 'text-emerald-600 dark:text-emerald-400';

  return (
    <div className="sticky top-0 z-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 -mx-6 px-6 py-3">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Claim ID + Status */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {claim.id}
          </span>
          <StatusBadge status={claim.status} size="sm" showDot />
        </div>

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 shrink-0" />

        {/* Passenger */}
        <div className="flex items-center gap-1.5 shrink-0">
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate max-w-[140px]">
            {claim.passenger.name}
          </span>
        </div>

        {/* PNR */}
        <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs font-mono font-semibold text-slate-600 dark:text-slate-300 shrink-0 tabular-nums">
          PNR: {claim.pnr}
        </span>

        {/* Flight + Route */}
        <div className="flex items-center gap-1.5 shrink-0 text-sm">
          <Plane className="w-3.5 h-3.5 text-blue-500" />
          <span className="font-semibold text-slate-800 dark:text-slate-100 font-mono">
            {claim.flight.flightNumber}
          </span>
          <span className="text-slate-500 dark:text-slate-400">
            {claim.flight.routeOrigin} <span className="mx-0.5">&rarr;</span>{' '}
            {claim.flight.routeDestination}
          </span>
        </div>

        {/* Disruption type */}
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 shrink-0">
          {claim.disruption.type.replace(/_/g, ' ')}
        </span>

        <div className="flex-1" />

        {/* Financial summary */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">Claimed</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white tabular-nums truncate max-w-[100px]">
              {formatCurrency(claim.totalClaimed, claim.currency)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">Approved</p>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums truncate max-w-[100px]">
              {claim.totalApproved > 0
                ? formatCurrency(claim.totalApproved, claim.currency)
                : 'Pending'}
            </p>
          </div>

          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 shrink-0" />

          {/* SLA Timer */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Timer className={cn('w-4 h-4', slaTextColor)} />
            <div>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">SLA</p>
              <p className={cn('text-xs font-bold tabular-nums', slaTextColor)}>{sla.label}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Overview Tab — 3-column grid matching agent overview
// ─────────────────────────────────────────────────────────────────────────────

function OverviewTab({ claim }: { claim: typeof mockClaims[0] }) {
  const { passenger, flight, disruption } = claim;
  const sla = getSLAInfo(claim.slaDeadline);

  const categoryBreakdown = [
    {
      label: 'Hotel',
      color: 'bg-blue-500',
      amount: claim.documents
        .filter((d) => d.category === 'hotel')
        .reduce(
          (s, d) =>
            s +
            d.extractedFields.reduce(
              (a, f) =>
                f.name.toLowerCase().includes('total') || f.name.toLowerCase().includes('amount')
                  ? a + parseFloat(f.value.replace(/[^0-9.]/g, '') || '0')
                  : a,
              0,
            ),
          0,
        ),
    },
    {
      label: 'Food & Meals',
      color: 'bg-orange-500',
      amount: claim.documents
        .filter((d) => d.category === 'food')
        .reduce(
          (s, d) =>
            s +
            d.extractedFields.reduce(
              (a, f) =>
                f.name.toLowerCase().includes('amount') || f.name.toLowerCase().includes('total')
                  ? a + parseFloat(f.value.replace(/[^0-9.]/g, '') || '0')
                  : a,
              0,
            ),
          0,
        ),
    },
    {
      label: 'Transport',
      color: 'bg-amber-500',
      amount: claim.documents
        .filter((d) => d.category === 'cab')
        .reduce(
          (s, d) =>
            s +
            d.extractedFields.reduce(
              (a, f) =>
                f.name.toLowerCase().includes('amount') || f.name.toLowerCase().includes('fare')
                  ? a + parseFloat(f.value.replace(/[^0-9.]/g, '') || '0')
                  : a,
              0,
            ),
          0,
        ),
    },
    {
      label: 'Alternate Carrier',
      color: 'bg-indigo-500',
      amount: claim.documents
        .filter((d) => d.category === 'alternate_carrier')
        .reduce(
          (s, d) =>
            s +
            d.extractedFields.reduce(
              (a, f) =>
                f.name.toLowerCase().includes('amount') ||
                f.name.toLowerCase().includes('ticket') ||
                f.name.toLowerCase().includes('fare')
                  ? a + parseFloat(f.value.replace(/[^0-9.]/g, '') || '0')
                  : a,
              0,
            ),
          0,
        ),
    },
  ].filter((c) => c.amount > 0);

  const outcomeColors: Record<string, string> = {
    approve_full: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20',
    approve_partial: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20',
    reject: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
    escalate: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
  };

  return (
    <div className="grid grid-cols-3 gap-5">
      {/* Column 1: Passenger & Booking */}
      <div className="flex flex-col gap-4">
        <SectionCard title="Passenger Details" accent="blue">
          <InfoRow label="Full Name" value={passenger.name} />
          <InfoRow label="Email" value={<span className="truncate block">{passenger.email}</span>} />
          <InfoRow label="Phone" value={passenger.phone} />
          <InfoRow label="Nationality" value={passenger.nationality} />
        </SectionCard>

        <SectionCard title="Booking Information" accent="blue">
          <InfoRow
            label="PNR Number"
            value={
              <span className="inline-flex items-center px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 font-mono font-bold text-sm text-slate-800 dark:text-slate-100 tracking-wide tabular-nums">
                {claim.pnr}
              </span>
            }
          />
          <InfoRow label="Booking Class" value="Economy (Y)" />
          <InfoRow
            label="Ticket Number"
            value={<span className="font-mono text-xs tabular-nums">098-2345678901</span>}
          />
          <InfoRow
            label="FF Number"
            value={<span className="font-mono text-xs tabular-nums">{passenger.ffNumber}</span>}
          />
          <InfoRow
            label="FF Tier"
            value={
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full',
                  TIER_COLORS[passenger.ffTier] || TIER_COLORS.None,
                )}
              >
                <Award className="w-3 h-3" />
                {passenger.ffTier}
              </span>
            }
          />
        </SectionCard>

        <SectionCard title="Claim Summary" accent="emerald">
          <InfoRow
            label="Total Claimed"
            value={
              <span className="text-base font-bold text-slate-900 dark:text-white tabular-nums">
                {formatCurrency(claim.totalClaimed, claim.currency)}
              </span>
            }
          />
          <InfoRow
            label="Total Approved"
            value={
              <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {claim.totalApproved > 0
                  ? formatCurrency(claim.totalApproved, claim.currency)
                  : 'Pending'}
              </span>
            }
          />
          <InfoRow label="Documents" value={`${claim.documents.length} submitted`} />
          {claim.authorizationNotes && (
            <InfoRow
              label="Agent Notes"
              value={
                <span className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  {claim.authorizationNotes}
                </span>
              }
            />
          )}
        </SectionCard>
      </div>

      {/* Column 2: Flight & Disruption */}
      <div className="flex flex-col gap-4">
        <SectionCard title="Flight Details" accent="indigo">
          <FlightRouteVisualizer
            origin={{ code: flight.routeOrigin, city: flight.originCity }}
            destination={{ code: flight.routeDestination, city: flight.destinationCity }}
            variant="card"
            className="mb-3"
          />
          <InfoRow
            label="Flight"
            value={<span className="font-mono font-semibold">{flight.flightNumber}</span>}
          />
          <InfoRow label="Aircraft" value={flight.aircraftType} />
        </SectionCard>

        <SectionCard title="Schedule vs Actual" accent="indigo">
          <div className="space-y-3">
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">
                Departure
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2">
                  <p className="text-[10px] text-slate-400 mb-0.5">Scheduled</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
                    {formatTime(flight.scheduledDeparture)}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                <div
                  className={cn(
                    'flex-1 rounded-lg px-3 py-2',
                    flight.actualDeparture !== flight.scheduledDeparture
                      ? 'bg-red-50 dark:bg-red-900/20'
                      : 'bg-emerald-50 dark:bg-emerald-900/20',
                  )}
                >
                  <p className="text-[10px] text-slate-400 mb-0.5">Actual</p>
                  <p
                    className={cn(
                      'text-sm font-semibold tabular-nums',
                      flight.actualDeparture !== flight.scheduledDeparture
                        ? 'text-red-700 dark:text-red-400'
                        : 'text-emerald-700 dark:text-emerald-400',
                    )}
                  >
                    {formatTime(flight.actualDeparture)}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">
                Arrival
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2">
                  <p className="text-[10px] text-slate-400 mb-0.5">Scheduled</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
                    {formatTime(flight.scheduledArrival)}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                <div
                  className={cn(
                    'flex-1 rounded-lg px-3 py-2',
                    flight.actualArrival !== flight.scheduledArrival
                      ? 'bg-red-50 dark:bg-red-900/20'
                      : 'bg-emerald-50 dark:bg-emerald-900/20',
                  )}
                >
                  <p className="text-[10px] text-slate-400 mb-0.5">Actual</p>
                  <p
                    className={cn(
                      'text-sm font-semibold tabular-nums',
                      flight.actualArrival !== flight.scheduledArrival
                        ? 'text-red-700 dark:text-red-400'
                        : 'text-emerald-700 dark:text-emerald-400',
                    )}
                  >
                    {formatTime(flight.actualArrival)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Disruption Details" accent="red">
          <InfoRow
            label="Type"
            value={
              <span className="capitalize font-semibold text-red-600 dark:text-red-400">
                {disruption.type.replace(/_/g, ' ')}
              </span>
            }
          />
          <InfoRow
            label="Reason Code"
            value={<span className="font-mono text-xs tabular-nums">{disruption.reasonCode}</span>}
          />
          <InfoRow
            label="Description"
            value={<span className="text-xs leading-relaxed">{disruption.reasonDescription}</span>}
          />
          <InfoRow
            label="Duration"
            value={
              <span className="font-semibold text-red-600 dark:text-red-400">
                {disruption.durationMinutes} minutes
              </span>
            }
          />
          <InfoRow
            label="Notice Given"
            value={`${disruption.noticeHours} hr${disruption.noticeHours !== 1 ? 's' : ''}`}
          />
          <InfoRow
            label="Alternative Offered"
            value={disruption.alternativeOffered ? 'Yes' : 'No'}
          />
        </SectionCard>
      </div>

      {/* Column 3: Financial & SLA */}
      <div className="flex flex-col gap-4">
        <SectionCard title="Financial Summary" accent="emerald">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-center">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">
                Total Claimed
              </p>
              <p className="text-xl font-bold text-slate-900 dark:text-white tabular-nums truncate">
                {formatCurrency(claim.totalClaimed, claim.currency)}
              </p>
            </div>
            <div
              className={cn(
                'rounded-lg p-3 text-center',
                claim.totalApproved > 0
                  ? 'bg-emerald-50 dark:bg-emerald-900/20'
                  : 'bg-amber-50 dark:bg-amber-900/20',
              )}
            >
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">
                Total Approved
              </p>
              <p
                className={cn(
                  'text-xl font-bold tabular-nums truncate',
                  claim.totalApproved > 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-amber-500 dark:text-amber-400 italic text-base',
                )}
              >
                {claim.totalApproved > 0
                  ? formatCurrency(claim.totalApproved, claim.currency)
                  : 'Pending'}
              </p>
            </div>
          </div>

          {categoryBreakdown.length > 0 && (
            <div className="mb-2">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">
                Breakdown by Category
              </p>
              <div className="space-y-1.5">
                {categoryBreakdown.map(({ label, color, amount }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between text-sm px-2 py-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <div className={cn('w-2.5 h-2.5 rounded-full shrink-0', color)} />
                      <span>{label}</span>
                    </div>
                    <span className="font-semibold tabular-nums text-slate-800 dark:text-slate-100 truncate max-w-[100px]">
                      {formatCurrency(amount, claim.currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <InfoRow label="Documents" value={`${claim.documents.length} submitted`} />
        </SectionCard>

        <SectionCard title="SLA Timeline" accent="amber">
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-500">Progress</span>
                <span
                  className={cn(
                    'font-semibold tabular-nums',
                    sla.isBreached
                      ? 'text-red-600'
                      : sla.percentage >= 85
                      ? 'text-red-600'
                      : sla.percentage >= 60
                      ? 'text-amber-600'
                      : 'text-emerald-600',
                  )}
                >
                  {sla.label}
                </span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all', sla.color)}
                  style={{ width: `${Math.min(sla.percentage, 100)}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                <span className="text-slate-500 w-20 shrink-0">Submitted</span>
                <span className="font-medium text-slate-700 dark:text-slate-200 tabular-nums">
                  {formatDate(claim.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                <span className="text-slate-500 w-20 shrink-0">Last Updated</span>
                <span className="font-medium text-slate-700 dark:text-slate-200 tabular-nums">
                  {formatDate(claim.updatedAt)}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div
                  className={cn(
                    'w-2 h-2 rounded-full shrink-0',
                    sla.isBreached ? 'bg-red-500' : 'bg-emerald-500',
                  )}
                />
                <span className="text-slate-500 w-20 shrink-0">Deadline</span>
                <span
                  className={cn(
                    'font-medium tabular-nums',
                    sla.isBreached
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-slate-700 dark:text-slate-200',
                  )}
                >
                  {formatDate(claim.slaDeadline)}
                </span>
              </div>
            </div>
          </div>
        </SectionCard>

        {claim.outcome && (
          <div
            className={cn(
              'rounded-lg border p-4',
              outcomeColors[claim.outcome],
              'border-current/20',
            )}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70 mb-1">
              AI Recommendation
            </p>
            <p className="text-lg font-bold capitalize">{claim.outcome.replace(/_/g, ' ')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Document Review Tab — READ-ONLY 50/50 split
// ─────────────────────────────────────────────────────────────────────────────

function DocumentReviewTab({ claim }: { claim: typeof mockClaims[0] }) {
  const [selectedDocIdx, setSelectedDocIdx] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  const selectedDoc = claim.documents[selectedDocIdx];
  if (!selectedDoc) return null;

  const label = selectedDoc.category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const Icon = CATEGORY_ICONS[selectedDoc.category] ?? FileQuestion;
  const gradient = CATEGORY_BG[selectedDoc.category] ?? 'from-slate-600 to-slate-800';

  const validationColor = (status: string) => {
    if (status === 'validated')
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    if (status === 'overridden')
      return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300';
  };

  if (claim.documents.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400 text-sm">No documents available.</div>
    );
  }

  return (
    <div className="flex gap-0 h-[calc(100vh-260px)] min-h-[500px] rounded-[var(--radius-lg)] border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900">
      {/* ── Left side: document viewer (50%) ── */}
      <div className="flex flex-col" style={{ width: '50%' }}>
        {/* Thumbnail strip */}
        <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 overflow-x-auto shrink-0">
          {claim.documents.map((doc, idx) => {
            const DocIcon = CATEGORY_ICONS[doc.category] ?? FileQuestion;
            const docGrad = CATEGORY_BG[doc.category] ?? 'from-slate-600 to-slate-800';
            const isActive = idx === selectedDocIdx;
            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => {
                  setSelectedDocIdx(idx);
                  setZoom(100);
                  setRotation(0);
                }}
                className={cn(
                  'flex flex-col items-center gap-1 shrink-0 rounded-lg p-1.5 transition-all border-2',
                  isActive
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm'
                    : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-700/50',
                )}
              >
                <div
                  className={cn(
                    'w-14 h-10 rounded bg-gradient-to-br flex items-center justify-center',
                    docGrad,
                  )}
                >
                  <DocIcon className="w-5 h-5 text-white/80" strokeWidth={1.5} />
                </div>
                <span className="text-[9px] font-medium text-slate-500 dark:text-slate-400 truncate max-w-[60px]">
                  {doc.category.replace(/_/g, ' ')}
                </span>
              </button>
            );
          })}
        </div>

        {/* Document viewer */}
        <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center gap-1 px-3 py-2 bg-slate-800 border-b border-slate-700 shrink-0">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(z - 25, 50))}
              disabled={zoom <= 50}
              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-40 transition-colors"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] text-slate-400 tabular-nums w-10 text-center">
              {zoom}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(z + 25, 200))}
              disabled={zoom >= 200}
              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-40 transition-colors"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-4 bg-slate-600 mx-1" />
            <button
              type="button"
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              aria-label="Rotate"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setZoom(100);
                setRotation(0);
              }}
              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              aria-label="Fit to width"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <div className="flex-1" />
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</span>
            <span className="text-[10px] text-slate-600 ml-1 tabular-nums">
              {selectedDoc.classificationConfidence}%
            </span>
          </div>

          {/* Image area */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-6">
            {(() => {
              const receiptPath = getReceiptImagePath(selectedDoc.category, selectedDocIdx);
              return receiptPath ? (
                <div
                  className="transition-transform duration-200 w-full max-w-sm"
                  style={{
                    transform: `rotate(${rotation}deg) scale(${zoom / 100})`,
                    transformOrigin: 'center center',
                  }}
                >
                  <img
                    src={receiptPath}
                    alt={`${label} receipt`}
                    className="w-full h-auto rounded-lg shadow-xl"
                    style={{ objectFit: 'contain' }}
                  />
                </div>
              ) : (
                <div
                  className="transition-transform duration-200 w-full max-w-xs"
                  style={{
                    transform: `rotate(${rotation}deg) scale(${zoom / 100})`,
                    transformOrigin: 'center center',
                  }}
                >
                  <div className="aspect-[3/4] w-full rounded-lg overflow-hidden shadow-xl">
                    <div
                      className={cn(
                        'w-full h-full flex flex-col items-center justify-center rounded-lg bg-gradient-to-br select-none',
                        gradient,
                      )}
                    >
                      <div className="bg-white/10 rounded-xl p-8 flex flex-col items-center gap-4 backdrop-blur-sm border border-white/20 shadow-lg">
                        <Icon className="w-12 h-12 text-white/90" strokeWidth={1.5} />
                        <span className="text-white/80 text-sm font-medium tracking-wide uppercase font-mono">
                          Receipt
                        </span>
                        <span className="text-white/60 text-xs font-medium">{label}</span>
                        <div className="flex flex-col gap-1.5 mt-2 w-28">
                          {[100, 80, 90, 65, 70].map((w, i) => (
                            <div
                              key={i}
                              className="h-1.5 rounded-full bg-white/20"
                              style={{ width: `${w}%` }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* ── Right side: read-only fields (50%) ── */}
      <div
        className="flex flex-col border-l border-slate-200 dark:border-slate-700 overflow-hidden"
        style={{ width: '50%' }}
      >
        {/* Header */}
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={cn(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide',
                    validationColor(selectedDoc.validationStatus),
                  )}
                >
                  {selectedDoc.validationStatus}
                </span>
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                  Read-Only
                </span>
              </div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{label}</h3>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">{selectedDoc.id}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400">Classification</span>
              <ConfidenceGauge
                score={selectedDoc.classificationConfidence}
                variant="inline"
                size="sm"
              />
            </div>
          </div>
        </div>

        {/* Scrollable fields — 2-column grid, read-only */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
              Extracted Fields
            </p>
          </div>
          <div className="grid grid-cols-2">
            {selectedDoc.extractedFields.map((field, fieldIdx) => {
              const isOverridden = Boolean(field.overriddenValue);
              const displayLabel = field.name
                .replace(/_/g, ' ')
                .replace(/\b\w/g, (c) => c.toUpperCase());

              return (
                <div
                  key={field.name}
                  className={cn(
                    'px-3 py-2 border-b border-slate-100 dark:border-slate-800',
                    fieldIdx % 2 === 1 ? 'border-l border-slate-100 dark:border-slate-800' : '',
                    isOverridden ? 'bg-amber-50/40 dark:bg-amber-950/20' : '',
                  )}
                >
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide leading-tight mb-1">
                    {displayLabel}
                  </p>
                  {isOverridden && (
                    <p className="text-[11px] text-slate-400 line-through font-mono leading-tight">
                      {field.value}
                    </p>
                  )}
                  <p
                    className={cn(
                      'text-sm font-medium leading-tight truncate',
                      isOverridden
                        ? 'text-amber-700 dark:text-amber-400'
                        : 'text-slate-800 dark:text-slate-100',
                    )}
                  >
                    {field.overriddenValue ?? field.value}
                  </p>
                  {/* Confidence bar */}
                  <div className="mt-1">
                    <ConfidenceGauge score={field.confidence} variant="bar" size="sm" showLabel />
                  </div>
                  {isOverridden && field.overrideReason && (
                    <p className="text-[9px] text-amber-600 dark:text-amber-400 mt-0.5 leading-tight truncate">
                      Override: {field.overrideReason}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Line Items — read-only */}
          {(() => {
            const lineItems = MOCK_LINE_ITEMS[selectedDoc.category] ?? [];
            if (lineItems.length === 0) return null;
            return (
              <div className="border-t border-slate-200 dark:border-slate-700">
                <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Line Items</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800">
                        <th className="text-left px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Item</th>
                        <th className="text-center px-2 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wide w-10">Qty</th>
                        <th className="text-right px-2 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wide w-16">Unit</th>
                        <th className="text-right px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wide w-16">Amt</th>
                        <th className="text-right px-2 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wide w-12">Conf.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {lineItems.map((li, rowIdx) => (
                        <tr key={rowIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200">{li.item}</td>
                          <td className="text-center px-2 py-1.5 text-xs tabular-nums text-slate-600 dark:text-slate-300">{li.qty}</td>
                          <td className="text-right px-2 py-1.5 text-xs tabular-nums text-slate-600 dark:text-slate-300">${li.unitPrice.toFixed(2)}</td>
                          <td className="text-right px-3 py-1.5 text-xs font-semibold tabular-nums text-slate-800 dark:text-slate-100">${li.amount.toFixed(2)}</td>
                          <td className="text-right px-2 py-1.5">
                            <span className={cn(
                              'text-[11px] font-semibold tabular-nums',
                              li.confidence >= 90
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : li.confidence >= 75
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-red-600 dark:text-red-400',
                            )}>
                              {li.confidence}%
                            </span>
                          </td>
                        </tr>
                      ))}
                      {/* Total row */}
                      <tr className="bg-slate-50 dark:bg-slate-800/80">
                        <td colSpan={3} className="px-3 py-1.5 text-right text-[10px] font-bold text-slate-500 uppercase tracking-wide">Total</td>
                        <td className="text-right px-3 py-1.5 text-xs font-bold tabular-nums text-slate-900 dark:text-white">
                          ${lineItems.reduce((s, li) => s + li.amount, 0).toFixed(2)}
                        </td>
                        <td />
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Rules & Outcome Tab — collapsible design matching agent flow
// ─────────────────────────────────────────────────────────────────────────────

function RulesTab({ claim }: { claim: typeof mockClaims[0] }) {
  const [expandedRules, setExpandedRules] = useState<Set<string>>(new Set());

  const claimRuleEvals = mockRuleEvaluations.filter((r) => r.claimId === claim.id);
  const claimRules = claimRuleEvals
    .map((r) => ({
      rule: mockBusinessRules.find((br) => br.id === r.ruleId),
      evaluation: r,
    }))
    .filter(
      (
        r,
      ): r is {
        rule: (typeof mockBusinessRules)[0];
        evaluation: (typeof mockRuleEvaluations)[0];
      } => r.rule != null,
    );

  const passCount = claimRuleEvals.filter((r) => r.result === 'pass').length;
  const failCount = claimRuleEvals.filter((r) => r.result === 'fail').length;
  const totalRules = claimRuleEvals.length;
  const passRatio = totalRules > 0 ? passCount / totalRules : 0;
  const totalCalculated = claimRuleEvals.reduce((sum, r) => sum + r.calculatedAmount, 0);

  const categoryBreakdown = [
    { category: 'Hotel', amount: claim.documents.filter((d) => d.category === 'hotel').reduce((s, d) => s + d.extractedFields.reduce((a, f) => f.name.includes('Total') ? a + parseFloat(f.value.replace(/[^0-9.]/g, '') || '0') : a, 0), 0) },
    { category: 'Food & Meals', amount: claim.documents.filter((d) => d.category === 'food').reduce((s, d) => s + d.extractedFields.reduce((a, f) => f.name.includes('Amount') ? a + parseFloat(f.value.replace(/[^0-9.]/g, '') || '0') : a, 0), 0) },
    { category: 'Transport', amount: claim.documents.filter((d) => d.category === 'cab').reduce((s, d) => s + d.extractedFields.reduce((a, f) => f.name.includes('Amount') ? a + parseFloat(f.value.replace(/[^0-9.]/g, '') || '0') : a, 0), 0) },
    { category: 'Alternate Carrier', amount: claim.documents.filter((d) => d.category === 'alternate_carrier').reduce((s, d) => s + d.extractedFields.reduce((a, f) => f.name.includes('Amount') || f.name.includes('Ticket') ? a + parseFloat(f.value.replace(/[^0-9.]/g, '') || '0') : a, 0), 0) },
  ].filter((c) => c.amount > 0);

  const outcomeColor: Record<string, string> = {
    approve_full: 'text-emerald-600 dark:text-emerald-400',
    approve_partial: 'text-amber-600 dark:text-amber-400',
    reject: 'text-red-600 dark:text-red-400',
    escalate: 'text-blue-600 dark:text-blue-400',
  };

  function toggleRule(ruleId: string) {
    setExpandedRules((prev) => {
      const next = new Set(prev);
      if (next.has(ruleId)) {
        next.delete(ruleId);
      } else {
        next.add(ruleId);
      }
      return next;
    });
  }

  if (claimRules.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400 text-sm">
        No rule evaluations for this claim.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Collapsible rules card */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Summary bar */}
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Business Rule Evaluations
            </h4>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="text-emerald-600 dark:text-emerald-400">{passCount}</span>
              <span className="text-slate-400 dark:text-slate-500"> of </span>
              <span className="text-slate-700 dark:text-slate-200">{totalRules}</span>
              <span className="text-slate-400 dark:text-slate-500"> rules passed</span>
            </span>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${passRatio * 100}%` }}
            />
          </div>
        </div>

        {/* Collapsible rule rows */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {claimRules.map(({ rule, evaluation }) => {
            const isExpanded = expandedRules.has(rule.id);
            const isPassed = evaluation.result === 'pass';
            return (
              <div key={rule.id}>
                {/* Collapsed row */}
                <button
                  type="button"
                  onClick={() => toggleRule(rule.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group"
                >
                  {/* Chevron */}
                  <ChevronRight
                    className={cn(
                      'w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200',
                      isExpanded && 'rotate-90',
                    )}
                  />

                  {/* Rule name */}
                  <span className="flex-1 min-w-0 text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                    {rule.name}
                  </span>

                  {/* Pass/Fail badge */}
                  <span
                    className={cn(
                      'shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold',
                      isPassed
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                    )}
                  >
                    {isPassed ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <XCircle className="w-3 h-3" />
                    )}
                    {isPassed ? 'Pass' : 'Fail'}
                  </span>

                  {/* Calculated amount */}
                  {evaluation.calculatedAmount > 0 && (
                    <span className="shrink-0 text-xs font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
                      {formatCurrency(evaluation.calculatedAmount)}
                    </span>
                  )}

                  {/* Timestamp */}
                  {evaluation.timestamp && (
                    <span className="shrink-0 text-[11px] text-slate-400 dark:text-slate-500 tabular-nums hidden sm:block">
                      {formatDateTime(evaluation.timestamp)}
                    </span>
                  )}
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800">
                    <div className="pl-7">
                      <RuleCard
                        rule={rule}
                        variant="evaluation"
                        evaluationResult={evaluation}
                        className="shadow-none border-slate-200 dark:border-slate-700"
                      />
                      {evaluation.timestamp && (
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5 pl-1">
                          Evaluated: {formatDateTime(evaluation.timestamp)}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Payout Summary */}
      <div className="bg-white dark:bg-slate-900 rounded-[var(--radius-md)] border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-start justify-between mb-4">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Payout Summary
          </h4>
          {claimRuleEvals.length > 0 && claimRuleEvals[0].timestamp && (
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Rules evaluated on: {formatDateTime(claimRuleEvals[0].timestamp)}
            </p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {passCount}
            </p>
            <p className="text-xs text-emerald-600/70 mt-1">Rules Passed</p>
          </div>
          <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400 tabular-nums">
              {failCount}
            </p>
            <p className="text-xs text-red-600/70 mt-1">Rules Failed</p>
          </div>
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 tabular-nums truncate">
              {formatCurrency(totalCalculated || claim.totalClaimed, claim.currency)}
            </p>
            <p className="text-xs text-blue-600/70 mt-1">Total Calculated</p>
          </div>
        </div>

        {categoryBreakdown.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">By Category</p>
            <div className="flex flex-col gap-1.5">
              {categoryBreakdown.map(({ category, amount }) => (
                <div key={category} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-300">{category}</span>
                  <span className="font-semibold tabular-nums text-slate-800 dark:text-slate-100 truncate max-w-[120px]">
                    {formatCurrency(amount, claim.currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {claim.outcome && (
          <div className="py-3 px-4 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
              AI Recommendation:
            </span>
            <span className={cn('text-sm font-bold capitalize', outcomeColor[claim.outcome] ?? '')}>
              {claim.outcome.replace(/_/g, ' ')}
            </span>
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Last updated: {formatDateTime(claim.updatedAt)}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Audit Log Tab
// ─────────────────────────────────────────────────────────────────────────────

function AuditTab({ claimId }: { claimId: string }) {
  const [actionFilter, setActionFilter] = useState('');
  const claimEvents = mockAuditEvents.filter((e) => e.claimId === claimId);
  const filtered = actionFilter
    ? claimEvents.filter((e) => e.actionType.includes(actionFilter))
    : claimEvents;

  const actionCategories = [
    { value: '', label: 'All Actions' },
    { value: 'claim_', label: 'Claim Lifecycle' },
    { value: 'document_', label: 'Documents' },
    { value: 'rule', label: 'Rules' },
    { value: 'assignment', label: 'Assignment' },
    { value: 'payment', label: 'Payments' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Filter by:
        </label>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 px-3 focus:outline-none"
        >
          {actionCategories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <span className="text-xs text-slate-400">{filtered.length} events</span>
      </div>

      {filtered.length > 0 ? (
        <AuditTimeline events={filtered} />
      ) : (
        <div className="text-center py-12 text-slate-400 text-sm">
          No audit events match the selected filter.
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Authorization Decision Tab
// ─────────────────────────────────────────────────────────────────────────────

interface AuthDecisionTabProps {
  claim: typeof mockClaims[0];
  onApprove: () => void;
  onReject: () => void;
  onSendBack: () => void;
}

function AuthDecisionTab({ claim, onApprove, onReject, onSendBack }: AuthDecisionTabProps) {
  const allFields = claim.documents.flatMap((doc) => doc.extractedFields);
  const confirmedCount = allFields.filter((f) => !f.overriddenValue).length;
  const overriddenCount = allFields.filter((f) => f.overriddenValue !== undefined).length;

  const overrideReasons = claim.documents
    .flatMap((doc) => doc.extractedFields)
    .filter((f) => f.overrideReason)
    .map((f) => f.overrideReason as string);

  const claimRuleEvals = mockRuleEvaluations.filter((r) => r.claimId === claim.id);
  const passCount = claimRuleEvals.filter((r) => r.result === 'pass').length;
  const failCount = claimRuleEvals.filter((r) => r.result === 'fail').length;

  const isHighValue = claim.totalClaimed >= 1000;
  const isFirstTimeClaim = claim.passenger.ffTier === 'None';
  const isFrequentClaimant =
    claim.passenger.ffTier === 'Platinum' || claim.passenger.ffTier === 'Gold';

  const variance = claim.totalClaimed - claim.totalApproved;

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-5">
      {/* Agent Validation Summary */}
      <div className="bg-white dark:bg-slate-900 rounded-[var(--radius-md)] border border-slate-200 dark:border-slate-700 p-5">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-500" />
          Agent Validation Summary
        </h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {confirmedCount}
            </p>
            <p className="text-xs text-emerald-600/70 mt-1">Fields Confirmed</p>
          </div>
          <div className="text-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
              {overriddenCount}
            </p>
            <p className="text-xs text-amber-600/70 mt-1">Fields Overridden</p>
          </div>
        </div>
        {overrideReasons.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-2">
              Override Reasons
            </p>
            <ul className="space-y-1">
              {overrideReasons.map((reason, i) => (
                <li
                  key={i}
                  className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-1.5"
                >
                  <span className="mt-1 w-1 h-1 rounded-full bg-amber-400 shrink-0" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Amount Comparison */}
      <div className="bg-white dark:bg-slate-900 rounded-[var(--radius-md)] border border-slate-200 dark:border-slate-700 p-5">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-500" />
          Amount Comparison
        </h3>
        <StatComparisonRow
          label="Claimed vs Approved"
          current={claim.totalApproved > 0 ? claim.totalApproved : claim.totalClaimed}
          previous={claim.totalClaimed}
          formatter={(v) => formatCurrency(v, claim.currency)}
          invertColor={false}
        />
        {variance > 0 && (
          <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg overflow-hidden">
            <p className="text-xs text-amber-700 dark:text-amber-400 font-medium truncate">
              Variance: {formatCurrency(variance, claim.currency)} (
              {((variance / claim.totalClaimed) * 100).toFixed(1)}% difference)
            </p>
          </div>
        )}
      </div>

      {/* Rules summary */}
      <div className="bg-white dark:bg-slate-900 rounded-[var(--radius-md)] border border-slate-200 dark:border-slate-700 p-5">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
          <ListChecks className="w-4 h-4 text-blue-500" />
          Rules Engine Outcome
        </h3>
        {claimRuleEvals.length > 0 ? (
          <div className="space-y-2">
            {claimRuleEvals.map((eval_) => (
              <div
                key={eval_.id}
                className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0"
              >
                <span className="text-xs text-slate-600 dark:text-slate-300 truncate flex-1">
                  {eval_.ruleName}
                </span>
                <span
                  className={cn(
                    'text-[10px] font-bold px-2 py-0.5 rounded-full ml-2 shrink-0',
                    eval_.result === 'pass'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                  )}
                >
                  {eval_.result === 'pass' ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> PASS
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> FAIL
                    </span>
                  )}
                </span>
              </div>
            ))}
            <div className="flex items-center gap-3 mt-2 pt-2">
              <span className="text-xs text-slate-500">
                {passCount} passed · {failCount} failed
              </span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No rule evaluations available.</p>
        )}
      </div>

      {/* Flags */}
      <div className="bg-white dark:bg-slate-900 rounded-[var(--radius-md)] border border-slate-200 dark:border-slate-700 p-5">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Flags
        </h3>
        <div className="flex flex-wrap gap-2">
          {isHighValue && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400">
              <TrendingUp className="w-3 h-3" />
              High-Value Claim
            </span>
          )}
          {isFirstTimeClaim && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">
              <Star className="w-3 h-3" />
              First-Time Claimant
            </span>
          )}
          {isFrequentClaimant && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
              <Repeat className="w-3 h-3" />
              Frequent Claimant ({claim.passenger.ffTier})
            </span>
          )}
          {overriddenCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              <AlertTriangle className="w-3 h-3" />
              {overriddenCount} Field Override{overriddenCount !== 1 ? 's' : ''}
            </span>
          )}
          {!isHighValue && !isFirstTimeClaim && !isFrequentClaimant && overriddenCount === 0 && (
            <span className="text-xs text-slate-400 italic">No flags raised.</span>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="bg-white dark:bg-slate-900 rounded-[var(--radius-md)] border border-slate-200 dark:border-slate-700 p-5">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-500" />
          Decision
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
          Review the information above and make a final authorization decision for claim{' '}
          <span className="font-mono font-semibold">{claim.id}</span>.
        </p>
        <div className="flex flex-col gap-2.5">
          <Button
            variant="primary"
            icon={<CheckCircle2 className="w-4 h-4" />}
            onClick={onApprove}
            className="w-full justify-center bg-emerald-600 hover:bg-emerald-700 border-emerald-600"
          >
            Approve Claim
          </Button>
          <Button
            variant="danger"
            icon={<XCircle className="w-4 h-4" />}
            onClick={onReject}
            className="w-full justify-center"
          >
            Reject Claim
          </Button>
          <Button
            variant="secondary"
            icon={<RotateCcw className="w-4 h-4" />}
            onClick={onSendBack}
            className="w-full justify-center"
          >
            Send Back to Agent
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────

export default function AuthorizationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showSendBackModal, setShowSendBackModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectNotes, setRejectNotes] = useState('');
  const [sendBackInstructions, setSendBackInstructions] = useState('');

  const { claims, approveClaim, rejectClaim, returnClaim } = useClaimsStore();

  const claim = useMemo(
    () => claims.find((c) => c.id === id) ?? mockClaims.find((c) => c.id === id),
    [claims, id],
  );

  if (!claim) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <XCircle className="w-12 h-12 text-red-400 mb-3" />
        <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">Claim not found</p>
        <Button
          variant="secondary"
          size="sm"
          className="mt-4"
          onClick={() => router.push('/authorization/queue')}
          icon={<ArrowLeft className="w-3.5 h-3.5" />}
        >
          Back to Queue
        </Button>
      </div>
    );
  }

  const handleApprove = () => {
    approveClaim(claim.id);
    router.push('/authorization/queue');
  };

  const handleReject = () => {
    if (!rejectReason.trim()) return;
    rejectClaim(claim.id, `${rejectReason}${rejectNotes ? ' — ' + rejectNotes : ''}`);
    setShowRejectModal(false);
    router.push('/authorization/queue');
  };

  const handleSendBack = () => {
    if (!sendBackInstructions.trim()) return;
    returnClaim(claim.id, sendBackInstructions);
    setShowSendBackModal(false);
    router.push('/authorization/queue');
  };

  return (
    <div className="flex flex-col min-h-0">
      {/* Back navigation */}
      <div className="flex items-center gap-2 mb-3">
        <button
          type="button"
          onClick={() => router.push('/authorization/queue')}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Authorization Queue
        </button>
        <span className="text-slate-300 dark:text-slate-600">/</span>
        <span className="text-sm font-mono text-slate-700 dark:text-slate-200">{id}</span>
      </div>

      {/* Sticky claim header bar */}
      <ClaimHeaderBar claim={claim} />

      {/* Tab bar — full width */}
      <div className="flex items-center border-b border-slate-200 dark:border-slate-700 mt-4">
        {TABS.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all duration-150 whitespace-nowrap',
                isActive
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300',
              )}
            >
              <TabIcon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content — full width */}
      <div className="flex-1 pt-4">
        {activeTab === 'overview' && <OverviewTab claim={claim} />}
        {activeTab === 'document_review' && <DocumentReviewTab claim={claim} />}
        {activeTab === 'rules' && <RulesTab claim={claim} />}
        {activeTab === 'audit' && <AuditTab claimId={claim.id} />}
        {activeTab === 'decision' && (
          <AuthDecisionTab
            claim={claim}
            onApprove={handleApprove}
            onReject={() => setShowRejectModal(true)}
            onSendBack={() => setShowSendBackModal(true)}
          />
        )}
      </div>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Claim"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              disabled={!rejectReason.trim()}
              onClick={handleReject}
            >
              Confirm Rejection
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Please provide a reason for rejecting claim{' '}
            <span className="font-mono font-semibold">{claim.id}</span>.
          </p>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <select
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="h-10 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 px-3 focus:outline-none focus:border-blue-500"
            >
              <option value="">Select a reason…</option>
              <option value="Policy violation">Policy violation</option>
              <option value="Insufficient documentation">Insufficient documentation</option>
              <option value="Duplicate claim">Duplicate claim</option>
              <option value="Ineligible disruption">Ineligible disruption</option>
              <option value="Voluntary compensation already accepted">
                Voluntary compensation already accepted
              </option>
              <option value="Amount exceeds cap">Amount exceeds cap</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
              Additional Notes
            </label>
            <textarea
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              placeholder="Optional additional notes for the agent and passenger record…"
              rows={4}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 px-3 py-2.5 resize-none focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </Modal>

      {/* Send Back Modal */}
      <Modal
        isOpen={showSendBackModal}
        onClose={() => setShowSendBackModal(false)}
        title="Send Back to Agent"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowSendBackModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={!sendBackInstructions.trim()}
              onClick={handleSendBack}
            >
              Send Back
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Provide instructions for the agent on what needs to be corrected or clarified.
          </p>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
              Instructions for Agent <span className="text-red-500">*</span>
            </label>
            <textarea
              value={sendBackInstructions}
              onChange={(e) => setSendBackInstructions(e.target.value)}
              placeholder="e.g. Please resubmit the hotel receipt with a clearer scan. The cab receipt currency conversion is unverifiable…"
              rows={5}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 px-3 py-2.5 resize-none focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
