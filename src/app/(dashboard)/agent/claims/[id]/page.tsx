'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Plane,
  FileText,
  ShieldCheck,
  ListChecks,
  ClipboardList,
  MessageSquare,
  Hotel,
  Car,
  UtensilsCrossed,
  CreditCard,
  IdCard,
  Mail,
  FileQuestion,
  CheckCircle2,
  XCircle,
  Pencil,
  Check,
  Send,
  Clock,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  X,
  AlertTriangle,
  Eye,
  Save,
  ChevronRight,
  Timer,
  Calendar,
  Award,
  History,
  Receipt,
  DollarSign,
  ExternalLink,
  MapPin,
  FileCheck,
  Monitor,
  ChevronDown,
  Info,
} from 'lucide-react';
import {
  mockClaims,
  mockAuditEvents,
  mockBusinessRules,
  mockRuleEvaluations,
} from '@/data/mock-data';
import {
  Button,
  Modal,
  StatusBadge,
  ConfidenceGauge,
  AuditTimeline,
  ActivityFeed,
  Select,
  TextInput,
} from '@/components/ui';
import { FlightRouteVisualizer, RuleCard } from '@/components/domain';
import { formatCurrency, cn, getSLAInfo, formatDate, formatDateTime, formatRelativeTime } from '@/lib/utils';
import type { DocumentCategory, ClaimDocument, AuditEvent } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Tab definitions
// ─────────────────────────────────────────────────────────────────────────────

type TabId = 'overview' | 'document_review' | 'rules' | 'audit' | 'communication';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: FileText },
  { id: 'document_review', label: 'Document Review', icon: ShieldCheck },
  { id: 'rules', label: 'Rules & Outcome', icon: ListChecks },
  { id: 'audit', label: 'Audit Log', icon: ClipboardList },
  { id: 'communication', label: 'Communication', icon: MessageSquare },
];

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

// Per-document receipt mapping — each document ID maps to a matching receipt SVG
// with correct vendor name, dates, and amount from that document's extractedFields.
const DOC_RECEIPT_MAP: Record<string, string> = {
  // CLM-001
  'DOC-001': '/receipts/hotel-1.svg',          // Marriott Heathrow, £189.00
  'DOC-002': '/receipts/cab-1.svg',             // Uber LHR, £12.40
  'DOC-003': '/receipts/food-1.svg',            // Heathrow Costa Coffee, £14.50
  // CLM-002
  'DOC-004': '/receipts/hotel-2.svg',           // JW Marriott Mumbai, ₹14,500
  'DOC-005': '/receipts/food-19.svg',           // BOM T2 Food Zone / Airport Lounge, ₹1,800
  // CLM-003
  'DOC-006': '/receipts/hotel-3.svg',           // The Leela Chennai, ₹9,200
  'DOC-007': '/receipts/cab-2.svg',             // Ola Cabs Chennai, ₹650
  'DOC-008': '/receipts/food-3.svg',            // Saravana Bhavan Airport, ₹420
  // CLM-004
  'DOC-009': '/receipts/alternate-carrier-1.svg', // Air India AI-441 DEL→BOM, ₹6,450
  'DOC-010': '/receipts/food-4.svg',            // McDonald's DEL T3, ₹540
  // CLM-005
  'DOC-011': '/receipts/hotel-4.svg',           // Novotel Hyderabad Airport, ₹7,800
  'DOC-012': '/receipts/cab-3.svg',             // Rapido Auto, ₹280
  'DOC-013': '/receipts/food-5.svg',            // Novotel In-Room Dining, ₹1,450
  'DOC-014': '/receipts/food-6.svg',            // HYD Airport Food Court, ₹320
  // CLM-006
  'DOC-015': '/receipts/hotel-5.svg',           // Radisson Blu Kolkata, ₹8,500
  'DOC-016': '/receipts/alternate-carrier-2.svg', // IndiGo 6E-391 CCU→DEL, ₹4,200
  // CLM-007
  'DOC-017': '/receipts/hotel-6.svg',           // Rove Dubai Creek, AED 495
  'DOC-018': '/receipts/cab-4.svg',             // Careem DXB, AED 38
  'DOC-019': '/receipts/food-7.svg',            // Wafi Gourmet DXB, AED 120
  // CLM-008
  'DOC-020': '/receipts/hotel-7.svg',           // Clayton Hotel Heathrow, £210
  'DOC-021': '/receipts/food-8.svg',            // Upper Crust LHR T5, £22.80
  // CLM-009
  'DOC-022': '/receipts/alternate-carrier-3.svg', // Emirates EK-314 LHR→DEL, £685
  'DOC-023': '/receipts/hotel-8.svg',           // Sofitel London Gatwick, £175
  'DOC-024': '/receipts/cab-5.svg',             // National Express LHR→LGW, £32
  // CLM-010
  'DOC-025': '/receipts/hotel-9.svg',           // Oryx Airport Hotel Doha, QAR 680
  'DOC-026': '/receipts/food-9.svg',            // Al Mourjan Lounge DOH, QAR 95
  // CLM-011
  'DOC-027': '/receipts/hotel-10.svg',          // Grand Hyatt Doha, QAR 1,250
  'DOC-028': '/receipts/cab-6.svg',             // Karwa Taxi DOH, QAR 55
  'DOC-029': '/receipts/food-10.svg',           // The Pearl Restaurant DOH, QAR 210
  // CLM-012
  'DOC-030': '/receipts/hotel-11.svg',          // Park Hyatt Singapore, SGD 320
  'DOC-031': '/receipts/alternate-carrier-4.svg', // Japan Airlines JL-712 SIN→NRT, SGD 510
  // CLM-013
  'DOC-032': '/receipts/hotel-12.svg',          // Swissotel The Stamford, SGD 450
  'DOC-033': '/receipts/cab-7.svg',             // ComfortDelGro Taxi SIN, SGD 28
  'DOC-034': '/receipts/food-11.svg',           // Changi Jewel Food Hall, SGD 35
  'DOC-035': '/receipts/food-12.svg',           // Swissotel In-Room Dining, SGD 68
  // CLM-014
  'DOC-036': '/receipts/hotel-13.svg',          // Hilton Frankfurt Airport, €195
  'DOC-037': '/receipts/food-13.svg',           // Hilton Executive Lounge, €42.50
  // CLM-015
  'DOC-038': '/receipts/hotel-14.svg',          // Lindner Airport Hotel Frankfurt, €178
  'DOC-039': '/receipts/alternate-carrier-5.svg', // Lufthansa LH-402 FRA→JFK, €890
  'DOC-040': '/receipts/cab-8.svg',             // Frankfurt Taxi Services, €22
  // CLM-016
  'DOC-041': '/receipts/hotel-15.svg',          // ibis Munich Airport, €135
  'DOC-042': '/receipts/food-14.svg',           // MUC Airport Bistro, €28.40
  // CLM-017
  'DOC-043': '/receipts/hotel-16.svg',          // Sheraton JFK Airport Hotel, $289
  'DOC-044': '/receipts/cab-9.svg',             // Lyft JFK, $22.50
  'DOC-045': '/receipts/food-15.svg',           // JFK Shake Shack T4, $18.75
  // CLM-018
  'DOC-046': '/receipts/hotel-17.svg',          // Hyatt Place Chicago O'Hare, $199
  'DOC-047': '/receipts/alternate-carrier-6.svg', // United Airlines UA-779 ORD→MIA, $385
  // CLM-019
  'DOC-048': '/receipts/hotel-18.svg',          // DFW Airport Marriott, $225
  'DOC-049': '/receipts/food-16.svg',           // DFW Pappadeaux Seafood, $67.20
  'DOC-050': '/receipts/cab-10.svg',            // SuperShuttle DFW, $18
  // CLM-020
  'DOC-051': '/receipts/hotel-19.svg',          // Sheraton Los Angeles, $315
  'DOC-052': '/receipts/food-17.svg',           // LAX Tom Bradley Food Court, $24.90
  // CLM-021
  'DOC-053': '/receipts/hotel-20.svg',          // Muscat InterContinental, OMR 185
  'DOC-054': '/receipts/cab-11.svg',            // Mwasalat Taxi MCT, OMR 12
  'DOC-055': '/receipts/food-18.svg',           // Al Angham Restaurant Muscat, OMR 28
  // CLM-022
  'DOC-056': '/receipts/hotel-21.svg',          // Osaka Itami Airport Hotel, ¥28,500
  'DOC-057': '/receipts/alternate-carrier-7.svg', // ANA NH-12 ITM→NRT, ¥18,900
  // CLM-023
  'DOC-058': '/receipts/hotel-22.svg',          // Aloft Mumbai International Airport, ₹7,200
  'DOC-059': '/receipts/food-19.svg',           // BOM T2 Food Zone, ₹850
  // CLM-024
  'DOC-060': '/receipts/hotel-23.svg',          // Pullman Dubai Creek, AED 620
  'DOC-061': '/receipts/cab-12.svg',            // Dubai Taxi Corporation, AED 45
  'DOC-062': '/receipts/food-20.svg',           // Pullman All Day Dining, AED 165
  // CLM-025
  'DOC-063': '/receipts/hotel-24.svg',          // Premier Inn Heathrow T4, £145
  'DOC-064': '/receipts/cab-13.svg',            // Heathrow Express, £37
  // CLM-026
  'DOC-065': '/receipts/hotel-25.svg',          // Movenpick Hotel & Residences Doha, QAR 920
  'DOC-066': '/receipts/alternate-carrier-8.svg', // British Airways BA-142 DOH→LHR, QAR 4,200
  'DOC-067': '/receipts/food-21.svg',           // Movenpick Café Doha, QAR 185
  // CLM-027
  'DOC-068': '/receipts/hotel-26.svg',          // ibis Singapore Airport, SGD 175
  'DOC-069': '/receipts/food-22.svg',           // Singapore Changi T1 Food Court, SGD 18
  // CLM-028
  'DOC-070': '/receipts/hotel-27.svg',          // Frankfurt Marriott Hotel, €215
};

function getReceiptImagePath(category: DocumentCategory, docIndex: number, docId?: string): string | null {
  // Use per-document mapping when available
  if (docId && DOC_RECEIPT_MAP[docId]) {
    return DOC_RECEIPT_MAP[docId];
  }
  // Fallback: category-based mapping
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
// Override reasons (for document review)
// ─────────────────────────────────────────────────────────────────────────────

const OVERRIDE_REASONS = [
  { value: 'incorrect_extraction', label: 'Incorrect Extraction' },
  { value: 'duplicate_receipt', label: 'Duplicate Receipt' },
  { value: 'amount_mismatch', label: 'Amount Mismatch' },
  { value: 'currency_error', label: 'Currency Error' },
  { value: 'category_mismatch', label: 'Category Mismatch' },
  { value: 'not_eligible', label: 'Not Eligible' },
  { value: 'other', label: 'Other' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Mock inline data: past claims, alternative flights, line items
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_PAST_CLAIMS = [
  {
    id: 'CLM-2024-0891',
    date: '2025-09-14',
    status: 'Approved',
    amount: '$340.00',
    passenger: 'Arjun Mehta',
    flight: 'AI 101',
    origin: 'DEL',
    destination: 'LHR',
    totalClaimed: '$340.00',
    totalApproved: '$340.00',
    documents: ['Hotel Receipt', 'Boarding Pass'],
    submittedAt: '2025-09-12',
    resolvedAt: '2025-09-16',
    disruptionType: 'Delay',
  },
  {
    id: 'CLM-2024-0412',
    date: '2025-04-02',
    status: 'Rejected',
    amount: '$1,250.00',
    passenger: 'Arjun Mehta',
    flight: '6E 987',
    origin: 'BOM',
    destination: 'SIN',
    totalClaimed: '$1,250.00',
    totalApproved: '$0.00',
    documents: ['Alternate Carrier Ticket', 'Cab Receipt'],
    submittedAt: '2025-03-30',
    resolvedAt: '2025-04-05',
    disruptionType: 'Cancellation',
  },
  {
    id: 'CLM-2023-1287',
    date: '2024-12-18',
    status: 'Approved',
    amount: '$89.50',
    passenger: 'Arjun Mehta',
    flight: 'AI 302',
    origin: 'DEL',
    destination: 'DXB',
    totalClaimed: '$95.00',
    totalApproved: '$89.50',
    documents: ['Food Receipt'],
    submittedAt: '2024-12-17',
    resolvedAt: '2024-12-20',
    disruptionType: 'Delay',
  },
];

const MOCK_ALTERNATIVE_FLIGHTS = [
  { flight: 'AI 304', route: 'DEL \u2192 LHR', time: '22:45', offered: true, accepted: false, note: 'Offered but declined' },
  { flight: '6E 1234', route: 'DEL \u2192 LHR', time: '23:30', offered: false, accepted: false, note: 'Not offered' },
];

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
// FF Tier badge colors
// ─────────────────────────────────────────────────────────────────────────────

const TIER_COLORS: Record<string, string> = {
  Platinum: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200 ring-1 ring-slate-300 dark:ring-slate-500',
  Gold: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 ring-1 ring-amber-300 dark:ring-amber-600',
  Silver: 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-300 ring-1 ring-gray-300 dark:ring-gray-500',
  None: 'bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
};

// ─────────────────────────────────────────────────────────────────────────────
// Communication templates
// ─────────────────────────────────────────────────────────────────────────────

const COMM_TEMPLATES = [
  {
    id: 'acknowledgment',
    label: 'Acknowledgment',
    subject: 'Your claim has been received \u2014 Ref #{claimId}',
    body: `Dear {passengerName},

Thank you for submitting your claim (Reference: {claimId}). We have received all your documents and our team is reviewing them.

You can expect a response within 5\u20137 business days.

Best regards,
Meridian Claims Team`,
  },
  {
    id: 'info_request',
    label: 'Info Request',
    subject: 'Additional information required \u2014 Ref #{claimId}',
    body: `Dear {passengerName},

We are reviewing your claim (Reference: {claimId}) and require some additional information to proceed.

Please provide:
- [Required document/information]

Please respond within 7 days to avoid any delays.

Best regards,
Meridian Claims Team`,
  },
  {
    id: 'approval',
    label: 'Approval',
    subject: 'Your claim has been approved \u2014 Ref #{claimId}',
    body: `Dear {passengerName},

We are pleased to inform you that your claim (Reference: {claimId}) has been approved.

Approved amount: {approvedAmount}
Payment will be processed within 3\u20135 business days.

Best regards,
Meridian Claims Team`,
  },
  {
    id: 'rejection',
    label: 'Rejection',
    subject: 'Your claim could not be approved \u2014 Ref #{claimId}',
    body: `Dear {passengerName},

We regret to inform you that your claim (Reference: {claimId}) could not be approved at this time.

Reason: [Rejection reason]

If you believe this decision is incorrect, you may appeal within 30 days.

Best regards,
Meridian Claims Team`,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────────────────────

function InfoRow({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-0.5 py-2 border-b border-slate-100 dark:border-slate-800 last:border-0', className)}>
      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{label}</span>
      <span className="text-sm text-slate-800 dark:text-slate-100 font-medium min-w-0">{value}</span>
    </div>
  );
}

function SectionCard({ title, children, className, accent = 'blue' }: { icon?: React.ElementType; title: string; children: React.ReactNode; className?: string; accent?: 'blue' | 'indigo' | 'red' | 'emerald' | 'amber' | 'slate' }) {
  const accentColors: Record<string, string> = {
    blue: 'bg-blue-500',
    indigo: 'bg-indigo-500',
    red: 'bg-red-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    slate: 'bg-slate-400',
  };
  return (
    <div className={cn('bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-4 overflow-hidden relative', className)}>
      <div className={cn('absolute left-0 top-0 bottom-0 w-1', accentColors[accent])} />
      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 pl-1">{title}</h4>
      <div className="pl-1">{children}</div>
    </div>
  );
}

function formatTime(d: string) {
  return d ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '\u2014';
}

// ─────────────────────────────────────────────────────────────────────────────
// Past Claim Slide-Out Panel
// ─────────────────────────────────────────────────────────────────────────────

type PastClaim = typeof MOCK_PAST_CLAIMS[0];

function PastClaimSlideOut({ claim, onClose }: { claim: PastClaim | null; onClose: () => void }) {
  const isOpen = claim !== null;

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Dark backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out panel */}
      <div
        className={cn(
          'fixed top-0 right-0 z-50 h-full w-[400px] bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-700 flex flex-col transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
        aria-label="Past claim detail"
        role="dialog"
        aria-modal="true"
      >
        {claim && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Past Claim</p>
                <p className="text-base font-bold text-slate-900 dark:text-white font-mono">{claim.id}</p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold',
                    claim.status === 'Approved'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                  )}
                >
                  {claim.status}
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
              {/* Passenger & Flight */}
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-3">Claim Details</p>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                      <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400 font-medium">Passenger</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{claim.passenger}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                      <Plane className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400 font-medium">Flight</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        <span className="font-mono">{claim.flight}</span>
                        <span className="text-slate-400 font-normal mx-1.5">&mdash;</span>
                        <span className="text-slate-600 dark:text-slate-300">{claim.origin} &rarr; {claim.destination}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400 font-medium">Disruption Type</p>
                      <p className="text-sm font-semibold text-red-600 dark:text-red-400">{claim.disruptionType}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial summary */}
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-3">Amounts</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide mb-1">Total Claimed</p>
                    <p className="text-base font-bold text-slate-900 dark:text-white tabular-nums">{claim.totalClaimed}</p>
                  </div>
                  <div
                    className={cn(
                      'rounded-lg p-3',
                      claim.status === 'Approved'
                        ? 'bg-emerald-50 dark:bg-emerald-900/20'
                        : 'bg-red-50 dark:bg-red-900/20',
                    )}
                  >
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide mb-1">Total Approved</p>
                    <p
                      className={cn(
                        'text-base font-bold tabular-nums',
                        claim.status === 'Approved'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-red-500 dark:text-red-400',
                      )}
                    >
                      {claim.totalApproved}
                    </p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-3">Documents Submitted</p>
                <div className="flex flex-wrap gap-2">
                  {claim.documents.map((doc, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                    >
                      <FileCheck className="w-3 h-3 text-slate-400" />
                      {doc}
                    </span>
                  ))}
                </div>
              </div>

              {/* Key dates */}
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-3">Key Dates</p>
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                    <span className="text-xs text-slate-500 w-20 shrink-0">Submitted</span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 tabular-nums">{claim.submittedAt}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={cn('w-2 h-2 rounded-full shrink-0', claim.status === 'Approved' ? 'bg-emerald-500' : 'bg-red-500')} />
                    <span className="text-xs text-slate-500 w-20 shrink-0">Resolved</span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 tabular-nums">{claim.resolvedAt}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-700 shrink-0 bg-slate-50 dark:bg-slate-800/50">
              <a
                href={`/agent/claims/${claim.id}`}
                className="flex items-center justify-center gap-1.5 w-full px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View Full Claim
              </a>
            </div>
          </>
        )}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sticky Claim Header Bar
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
          <span className="text-sm font-bold text-slate-900 dark:text-white font-mono tabular-nums">{claim.id}</span>
          <StatusBadge status={claim.status} size="sm" showDot />
        </div>

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 shrink-0" />

        {/* Passenger */}
        <div className="flex items-center gap-1.5 shrink-0">
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate max-w-[140px]">{claim.passenger.name}</span>
        </div>

        {/* PNR */}
        <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs font-mono font-semibold text-slate-600 dark:text-slate-300 shrink-0 tabular-nums">
          PNR: {claim.pnr}
        </span>

        {/* Flight + Route */}
        <div className="flex items-center gap-1.5 shrink-0 text-sm">
          <Plane className="w-3.5 h-3.5 text-blue-500" />
          <span className="font-semibold text-slate-800 dark:text-slate-100 font-mono">{claim.flight.flightNumber}</span>
          <span className="text-slate-500 dark:text-slate-400">
            {claim.flight.routeOrigin} <span className="mx-0.5">&rarr;</span> {claim.flight.routeDestination}
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
              {claim.totalApproved > 0 ? formatCurrency(claim.totalApproved, claim.currency) : 'Pending'}
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
// Enriched Overview Tab
// ─────────────────────────────────────────────────────────────────────────────

function OverviewTab({ claim }: { claim: typeof mockClaims[0] }) {
  const { passenger, flight, disruption } = claim;
  const sla = getSLAInfo(claim.slaDeadline);
  const [selectedPastClaim, setSelectedPastClaim] = useState<PastClaim | null>(null);

  // Category-based expense breakdown with colored dots
  const categoryBreakdown = [
    { label: 'Hotel', color: 'bg-blue-500', amount: claim.documents.filter((d) => d.category === 'hotel').reduce((s, d) => s + d.extractedFields.reduce((a, f) => f.name.toLowerCase().includes('total') || f.name.toLowerCase().includes('amount') ? a + parseFloat(f.value.replace(/[^0-9.]/g, '') || '0') : a, 0), 0) },
    { label: 'Food & Meals', color: 'bg-orange-500', amount: claim.documents.filter((d) => d.category === 'food').reduce((s, d) => s + d.extractedFields.reduce((a, f) => f.name.toLowerCase().includes('amount') || f.name.toLowerCase().includes('total') ? a + parseFloat(f.value.replace(/[^0-9.]/g, '') || '0') : a, 0), 0) },
    { label: 'Transport', color: 'bg-amber-500', amount: claim.documents.filter((d) => d.category === 'cab').reduce((s, d) => s + d.extractedFields.reduce((a, f) => f.name.toLowerCase().includes('amount') || f.name.toLowerCase().includes('fare') ? a + parseFloat(f.value.replace(/[^0-9.]/g, '') || '0') : a, 0), 0) },
    { label: 'Alternate Carrier', color: 'bg-indigo-500', amount: claim.documents.filter((d) => d.category === 'alternate_carrier').reduce((s, d) => s + d.extractedFields.reduce((a, f) => f.name.toLowerCase().includes('amount') || f.name.toLowerCase().includes('ticket') || f.name.toLowerCase().includes('fare') ? a + parseFloat(f.value.replace(/[^0-9.]/g, '') || '0') : a, 0), 0) },
  ].filter((c) => c.amount > 0);

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
          <InfoRow label="PNR Number" value={
            <span className="inline-flex items-center px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 font-mono font-bold text-sm text-slate-800 dark:text-slate-100 tracking-wide tabular-nums">
              {claim.pnr}
            </span>
          } />
          <InfoRow label="Booking Class" value="Economy (Y)" />
          <InfoRow label="Ticket Number" value={<span className="font-mono text-xs tabular-nums">098-2345678901</span>} />
          <InfoRow label="FF Number" value={<span className="font-mono text-xs tabular-nums">{passenger.ffNumber}</span>} />
          <InfoRow label="FF Tier" value={
            <span className={cn('inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full', TIER_COLORS[passenger.ffTier] || TIER_COLORS.None)}>
              <Award className="w-3 h-3" />
              {passenger.ffTier}
            </span>
          } />
        </SectionCard>

        <SectionCard title="Claim History" accent="slate">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Past claims by this passenger — click any row to view details</p>
          <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800">
                  <th className="text-left px-2.5 py-1.5 font-semibold text-slate-500 uppercase tracking-wide">Claim ID</th>
                  <th className="text-left px-2.5 py-1.5 font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                  <th className="text-left px-2.5 py-1.5 font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="text-right px-2.5 py-1.5 font-semibold text-slate-500 uppercase tracking-wide">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {MOCK_PAST_CLAIMS.map((pc) => (
                  <tr
                    key={pc.id}
                    onClick={() => setSelectedPastClaim(pc)}
                    className="hover:bg-blue-50 dark:hover:bg-blue-900/10 cursor-pointer transition-colors group"
                    title="Click to view claim details"
                  >
                    <td className="px-2.5 py-2 font-mono text-blue-600 dark:text-blue-400 tabular-nums group-hover:text-blue-700 dark:group-hover:text-blue-300 font-semibold">
                      {pc.id}
                    </td>
                    <td className="px-2.5 py-2 text-slate-600 dark:text-slate-300 tabular-nums">{pc.date}</td>
                    <td className="px-2.5 py-2">
                      <span className={cn(
                        'inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold',
                        pc.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                      )}>
                        {pc.status}
                      </span>
                    </td>
                    <td className="px-2.5 py-2 text-right font-semibold text-slate-800 dark:text-slate-100 tabular-nums">{pc.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
          <InfoRow label="Flight" value={<span className="font-mono font-semibold">{flight.flightNumber}</span>} />
          <InfoRow label="Aircraft" value={flight.aircraftType} />
        </SectionCard>

        <SectionCard title="Schedule vs Actual" accent="indigo">
          <div className="space-y-3">
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Departure</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2">
                  <p className="text-[10px] text-slate-400 mb-0.5">Scheduled</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 tabular-nums">{formatTime(flight.scheduledDeparture)}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                <div className={cn(
                  'flex-1 rounded-lg px-3 py-2',
                  flight.actualDeparture !== flight.scheduledDeparture ? 'bg-red-50 dark:bg-red-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20',
                )}>
                  <p className="text-[10px] text-slate-400 mb-0.5">Actual</p>
                  <p className={cn(
                    'text-sm font-semibold tabular-nums',
                    flight.actualDeparture !== flight.scheduledDeparture ? 'text-red-700 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400',
                  )}>
                    {formatTime(flight.actualDeparture)}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Arrival</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2">
                  <p className="text-[10px] text-slate-400 mb-0.5">Scheduled</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 tabular-nums">{formatTime(flight.scheduledArrival)}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                <div className={cn(
                  'flex-1 rounded-lg px-3 py-2',
                  flight.actualArrival !== flight.scheduledArrival ? 'bg-red-50 dark:bg-red-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20',
                )}>
                  <p className="text-[10px] text-slate-400 mb-0.5">Actual</p>
                  <p className={cn(
                    'text-sm font-semibold tabular-nums',
                    flight.actualArrival !== flight.scheduledArrival ? 'text-red-700 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400',
                  )}>
                    {formatTime(flight.actualArrival)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Disruption Details" accent="red">
          <InfoRow label="Type" value={
            <span className="capitalize font-semibold text-red-600 dark:text-red-400">{disruption.type.replace(/_/g, ' ')}</span>
          } />
          <InfoRow label="Reason Code" value={<span className="font-mono text-xs tabular-nums">{disruption.reasonCode}</span>} />
          <InfoRow label="Description" value={<span className="text-xs leading-relaxed">{disruption.reasonDescription}</span>} />
          <InfoRow label="Duration" value={
            <span className="font-semibold text-red-600 dark:text-red-400">{disruption.durationMinutes} minutes</span>
          } />
          <InfoRow label="Notice Given" value={`${disruption.noticeHours} hr${disruption.noticeHours !== 1 ? 's' : ''}`} />
        </SectionCard>

        <SectionCard title="Alternative Flights" accent="indigo">
          <div className="space-y-2">
            {MOCK_ALTERNATIVE_FLIGHTS.map((af, idx) => (
              <div key={idx} className={cn(
                'flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-xs',
                af.offered && !af.accepted ? 'border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-900/20' : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800',
              )}>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">{af.flight}</span>
                  <span className="text-slate-400">{af.route}</span>
                  <span className="text-slate-500 tabular-nums">at {af.time}</span>
                </div>
                <span className={cn(
                  'shrink-0 px-2 py-0.5 rounded-full font-semibold text-[10px]',
                  af.offered && !af.accepted ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
                )}>
                  {af.note}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Column 3: Financial */}
      <div className="flex flex-col gap-4">
        <SectionCard title="Financial Summary" accent="emerald">
          {/* Big numbers */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-center">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Total Claimed</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white tabular-nums truncate">
                {formatCurrency(claim.totalClaimed, claim.currency)}
              </p>
            </div>
            <div className={cn('rounded-lg p-3 text-center', claim.totalApproved > 0 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-amber-50 dark:bg-amber-900/20')}>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Total Approved</p>
              <p className={cn('text-xl font-bold tabular-nums truncate', claim.totalApproved > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500 dark:text-amber-400 italic text-base')}>
                {claim.totalApproved > 0 ? formatCurrency(claim.totalApproved, claim.currency) : 'Pending'}
              </p>
            </div>
          </div>

          {/* Category breakdown with colored dots */}
          {categoryBreakdown.length > 0 && (
            <div className="mb-4">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Breakdown by Category</p>
              <div className="space-y-1.5">
                {categoryBreakdown.map(({ label, color, amount }) => (
                  <div key={label} className="flex items-center justify-between text-sm px-2 py-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-800/50">
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

        {/* SLA Timeline */}
        <SectionCard title="SLA Timeline" accent="amber">
          <div className="space-y-3">
            {/* Progress bar */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-500">Progress</span>
                <span className={cn('font-semibold tabular-nums', sla.isBreached ? 'text-red-600' : sla.percentage >= 85 ? 'text-red-600' : sla.percentage >= 60 ? 'text-amber-600' : 'text-emerald-600')}>
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

            {/* Key dates */}
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                <span className="text-slate-500 w-20 shrink-0">Submitted</span>
                <span className="font-medium text-slate-700 dark:text-slate-200 tabular-nums">{formatDate(claim.createdAt)}</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                <span className="text-slate-500 w-20 shrink-0">Assigned</span>
                <span className="font-medium text-slate-700 dark:text-slate-200 tabular-nums">{formatDate(claim.updatedAt)}</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className={cn('w-2 h-2 rounded-full shrink-0', sla.isBreached ? 'bg-red-500' : 'bg-emerald-500')} />
                <span className="text-slate-500 w-20 shrink-0">Deadline</span>
                <span className={cn('font-medium tabular-nums', sla.isBreached ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-200')}>
                  {formatDate(claim.slaDeadline)}
                </span>
              </div>
            </div>
          </div>
        </SectionCard>

      </div>

      {/* Past claim slide-out panel */}
      <PastClaimSlideOut claim={selectedPastClaim} onClose={() => setSelectedPastClaim(null)} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Document Review Tab (merged Documents + Validation)
// ─────────────────────────────────────────────────────────────────────────────

type LineItem = { item: string; qty: number; unitPrice: number; amount: number; confidence: number };

function DocumentReviewTab({ claim }: { claim: typeof mockClaims[0] }) {
  const [selectedDocIdx, setSelectedDocIdx] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editReason, setEditReason] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Editable line items state — keyed by document category
  const [lineItemEdits, setLineItemEdits] = useState<Record<string, LineItem[]>>({});
  const [editingLineIdx, setEditingLineIdx] = useState<number | null>(null);
  const [lineEditValues, setLineEditValues] = useState<LineItem>({ item: '', qty: 1, unitPrice: 0, amount: 0, confidence: 85 });
  const [addingNewLine, setAddingNewLine] = useState(false);

  const selectedDoc = claim.documents[selectedDocIdx];
  if (!selectedDoc) return null;

  const baseLineItems = MOCK_LINE_ITEMS[selectedDoc.category] ?? [];
  const lineItemKey = `${selectedDoc.id}-${selectedDoc.category}`;
  const lineItems: LineItem[] = lineItemEdits[lineItemKey] ?? baseLineItems;

  // Initialize editable line items on first render per document
  const initLineItems = useCallback((key: string, items: LineItem[]) => {
    if (!lineItemEdits[key]) {
      setLineItemEdits(prev => ({ ...prev, [key]: [...items] }));
    }
  }, [lineItemEdits]);

  useEffect(() => {
    if (baseLineItems.length > 0) {
      initLineItems(lineItemKey, baseLineItems);
    }
  }, [lineItemKey, baseLineItems, initLineItems]);

  const updateLineItems = (newItems: LineItem[]) => {
    setLineItemEdits(prev => ({ ...prev, [lineItemKey]: newItems }));
  };

  const startEditLine = (idx: number) => {
    setEditingLineIdx(idx);
    setLineEditValues({ ...lineItems[idx] });
    setAddingNewLine(false);
  };

  const startAddLine = () => {
    setAddingNewLine(true);
    setEditingLineIdx(null);
    setLineEditValues({ item: '', qty: 1, unitPrice: 0, amount: 0, confidence: 85 });
  };

  const saveLine = () => {
    const val = { ...lineEditValues, amount: lineEditValues.qty * lineEditValues.unitPrice };
    if (addingNewLine) {
      updateLineItems([...lineItems, val]);
    } else if (editingLineIdx !== null) {
      const updated = [...lineItems];
      updated[editingLineIdx] = val;
      updateLineItems(updated);
    }
    setEditingLineIdx(null);
    setAddingNewLine(false);
  };

  const cancelLineEdit = () => {
    setEditingLineIdx(null);
    setAddingNewLine(false);
  };

  const deleteLine = (idx: number) => {
    const updated = lineItems.filter((_, i) => i !== idx);
    updateLineItems(updated);
    if (editingLineIdx === idx) cancelLineEdit();
  };
  const label = selectedDoc.category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const Icon = CATEGORY_ICONS[selectedDoc.category] ?? FileQuestion;
  const gradient = CATEGORY_BG[selectedDoc.category] ?? 'from-slate-600 to-slate-800';

  const allFields = claim.documents.flatMap((doc) =>
    doc.extractedFields.map((f) => ({ ...f, docId: doc.id })),
  );

  const handleStartEdit = (fieldName: string, currentValue: string) => {
    setEditingField(fieldName);
    setEditValue(currentValue);
    setEditReason('');
  };

  const handleSaveEdit = () => {
    // In a real app this would persist the override
    setEditingField(null);
    setEditValue('');
    setEditReason('');
  };

  return (
    <div className="flex gap-0 h-[calc(100vh-260px)] min-h-[500px] rounded-[var(--radius-lg)] border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900">
      {/* ── Left side: document list + viewer (50%) ──────────────────── */}
      <div className="flex flex-col" style={{ width: '50%' }}>
        {/* Horizontal scrollable thumbnail strip */}
        <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 overflow-x-auto shrink-0">
          {claim.documents.map((doc, idx) => {
            const DocIcon = CATEGORY_ICONS[doc.category] ?? FileQuestion;
            const docGrad = CATEGORY_BG[doc.category] ?? 'from-slate-600 to-slate-800';
            const isActive = idx === selectedDocIdx;
            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => { setSelectedDocIdx(idx); setZoom(100); setRotation(0); setEditingField(null); }}
                className={cn(
                  'flex flex-col items-center gap-1 shrink-0 rounded-lg p-1.5 transition-all border-2',
                  isActive
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm'
                    : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-700/50',
                )}
              >
                <div className={cn('w-14 h-10 rounded bg-gradient-to-br flex items-center justify-center', docGrad)}>
                  <DocIcon className="w-5 h-5 text-white/80" strokeWidth={1.5} />
                </div>
                <span className="text-[9px] font-medium text-slate-500 dark:text-slate-400 truncate max-w-[60px]">
                  {doc.category.replace(/_/g, ' ')}
                </span>
              </button>
            );
          })}
        </div>

        {/* Document viewer area */}
        <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center gap-1 px-3 py-2 bg-slate-800 border-b border-slate-700 shrink-0">
            <button type="button" onClick={() => setZoom((z) => Math.max(z - 25, 50))} disabled={zoom <= 50}
              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-40 transition-colors" aria-label="Zoom out">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] text-slate-400 tabular-nums w-10 text-center">{zoom}%</span>
            <button type="button" onClick={() => setZoom((z) => Math.min(z + 25, 200))} disabled={zoom >= 200}
              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-40 transition-colors" aria-label="Zoom in">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-4 bg-slate-600 mx-1" />
            <button type="button" onClick={() => setRotation((r) => (r + 90) % 360)}
              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-700 transition-colors" aria-label="Rotate">
              <RotateCw className="w-3.5 h-3.5" />
            </button>
            <button type="button" onClick={() => { setZoom(100); setRotation(0); }}
              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-700 transition-colors" aria-label="Fit to width">
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <div className="flex-1" />
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</span>
            <span className="text-[10px] text-slate-600 ml-1 tabular-nums">{selectedDoc.classificationConfidence}%</span>
          </div>

          {/* Image area */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-6">
            {(() => {
              const receiptPath = getReceiptImagePath(selectedDoc.category, selectedDocIdx, selectedDoc.id);
              return receiptPath ? (
                <div
                  className="transition-transform duration-200 w-full max-w-sm"
                  style={{ transform: `rotate(${rotation}deg) scale(${zoom / 100})`, transformOrigin: 'center center' }}
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
                  style={{ transform: `rotate(${rotation}deg) scale(${zoom / 100})`, transformOrigin: 'center center' }}
                >
                  <div className="aspect-[3/4] w-full rounded-lg overflow-hidden shadow-xl">
                    <div className={cn('w-full h-full flex flex-col items-center justify-center rounded-lg bg-gradient-to-br select-none', gradient)}>
                      <div className="bg-white/10 rounded-xl p-8 flex flex-col items-center gap-4 backdrop-blur-sm border border-white/20 shadow-lg">
                        <Icon className="w-12 h-12 text-white/90" strokeWidth={1.5} />
                        <span className="text-white/80 text-sm font-medium tracking-wide uppercase font-mono">Receipt</span>
                        <span className="text-white/60 text-xs font-medium">{label}</span>
                        <div className="flex flex-col gap-1.5 mt-2 w-28">
                          {[100, 80, 90, 65, 70].map((w, i) => (
                            <div key={i} className="h-1.5 rounded-full bg-white/20" style={{ width: `${w}%` }} />
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

      {/* ── Right side: extraction panel (50%) ───────────────────────── */}
      <div className="flex flex-col border-l border-slate-200 dark:border-slate-700 overflow-hidden" style={{ width: '50%' }}>
        {/* Header */}
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={cn(
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide',
                  selectedDoc.validationStatus === 'validated'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : selectedDoc.validationStatus === 'overridden'
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
                )}>
                  {selectedDoc.validationStatus}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {label}
                <span className="text-slate-400 font-normal mx-1.5">&middot;</span>
                <span className={cn(
                  'text-xs font-semibold tabular-nums',
                  selectedDoc.classificationConfidence >= 90
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : selectedDoc.classificationConfidence >= 70
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-red-600 dark:text-red-400',
                )}>
                  {selectedDoc.classificationConfidence}%
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">{selectedDoc.id}</p>
            </div>
          </div>
        </div>

        {/* Scrollable fields area */}
        <div className="flex-1 overflow-y-auto">
          {/* Single-value fields */}
          <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Extracted Fields</p>
          </div>
          {/* 2-column grid for fields */}
          <div className="grid grid-cols-2">
            {selectedDoc.extractedFields.map((field, fieldIdx) => {
              const isOverridden = Boolean(field.overriddenValue);
              const isEditing = editingField === field.name;
              const displayLabel = field.name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
              // Full-width if editing (spans 2 cols)
              if (isEditing) {
                return (
                  <div
                    key={field.name}
                    className="col-span-2 px-3 py-2 border-b border-slate-100 dark:border-slate-800 bg-blue-50/40 dark:bg-blue-900/10"
                  >
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">{displayLabel}</p>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <input
                          autoFocus
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="h-7 flex-1 rounded-md border border-blue-400 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 px-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
                          placeholder="Enter corrected value"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && editReason && editValue) handleSaveEdit();
                            if (e.key === 'Escape') setEditingField(null);
                          }}
                        />
                        <button
                          type="button"
                          disabled={!editReason || !editValue}
                          onClick={handleSaveEdit}
                          className="shrink-0 p-1.5 rounded-md bg-emerald-100 text-emerald-700 hover:bg-emerald-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          aria-label="Save"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingField(null)}
                          className="shrink-0 p-1.5 rounded-md bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 transition-colors"
                          aria-label="Cancel"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <select
                        value={editReason}
                        onChange={(e) => setEditReason(e.target.value)}
                        className="h-7 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 px-2 focus:outline-none focus:border-blue-400"
                      >
                        <option value="">Select override reason...</option>
                        {OVERRIDE_REASONS.map((r) => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={field.name}
                  className={cn(
                    'px-3 py-2 border-b border-slate-100 dark:border-slate-800 transition-colors',
                    // right-column cells get a left border separator
                    fieldIdx % 2 === 1 ? 'border-l border-slate-100 dark:border-slate-800' : '',
                    isOverridden ? 'bg-amber-50/40 dark:bg-amber-950/20' : '',
                  )}
                >
                  {/* Label (xs) */}
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide leading-tight mb-1">{displayLabel}</p>
                  {/* Value (sm) */}
                  {isOverridden && (
                    <p className="text-[11px] text-slate-400 line-through font-mono leading-tight">{field.value}</p>
                  )}
                  <button
                    type="button"
                    onClick={() => handleStartEdit(field.name, field.overriddenValue ?? field.value)}
                    className="group/val flex items-center gap-1 rounded px-1 py-0.5 -mx-1 text-left w-[calc(100%+8px)] transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    aria-label={`Edit ${displayLabel}`}
                  >
                    <span className={cn(
                      'text-sm font-medium truncate leading-tight',
                      isOverridden ? 'text-amber-700 dark:text-amber-400' : 'text-slate-800 dark:text-slate-100',
                    )}>
                      {field.overriddenValue ?? field.value}
                    </span>
                    <Pencil className="w-2.5 h-2.5 text-slate-300 group-hover/val:text-blue-400 shrink-0 transition-colors ml-auto" />
                  </button>
                  {/* Confidence inline */}
                  <div className="mt-1">
                    <ConfidenceGauge score={field.confidence} variant="inline" size="sm" />
                  </div>
                  {isOverridden && field.overrideReason && (
                    <p className="text-[9px] text-amber-600 dark:text-amber-400 mt-0.5 leading-tight truncate">
                      {OVERRIDE_REASONS.find((r) => r.value === field.overrideReason)?.label ?? field.overrideReason}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Multi-line / Table extraction — Editable */}
          <div className="border-t border-slate-200 dark:border-slate-700">
            <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Line Items</p>
              <button
                type="button"
                onClick={startAddLine}
                className="text-[10px] font-semibold text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
              >
                <span className="text-sm leading-none">+</span> Add Item
              </button>
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
                    <th className="w-16 px-2 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wide text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {lineItems.map((li, rowIdx) => (
                    editingLineIdx === rowIdx ? (
                      /* ── Editing row ── */
                      <tr key={rowIdx} className="bg-blue-50/50 dark:bg-blue-950/20">
                        <td className="px-2 py-1">
                          <input
                            value={lineEditValues.item}
                            onChange={(e) => setLineEditValues(v => ({ ...v, item: e.target.value }))}
                            className="w-full h-7 px-2 rounded border border-blue-300 dark:border-blue-600 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-400"
                            placeholder="Item name"
                            autoFocus
                          />
                        </td>
                        <td className="px-1 py-1">
                          <input
                            type="number"
                            min={1}
                            value={lineEditValues.qty}
                            onChange={(e) => setLineEditValues(v => ({ ...v, qty: Number(e.target.value) || 1 }))}
                            className="w-full h-7 px-1 rounded border border-blue-300 dark:border-blue-600 bg-white dark:bg-slate-800 text-xs text-center tabular-nums text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-400"
                          />
                        </td>
                        <td className="px-1 py-1">
                          <input
                            type="number"
                            step="0.01"
                            min={0}
                            value={lineEditValues.unitPrice}
                            onChange={(e) => setLineEditValues(v => ({ ...v, unitPrice: Number(e.target.value) || 0 }))}
                            className="w-full h-7 px-1 rounded border border-blue-300 dark:border-blue-600 bg-white dark:bg-slate-800 text-xs text-right tabular-nums text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-400"
                          />
                        </td>
                        <td className="text-right px-3 py-1 text-xs font-semibold tabular-nums text-blue-600 dark:text-blue-400">
                          ${(lineEditValues.qty * lineEditValues.unitPrice).toFixed(2)}
                        </td>
                        <td className="text-right px-2 py-1 text-[11px] tabular-nums text-slate-400">{li.confidence}%</td>
                        <td className="text-center px-1 py-1">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={saveLine} className="w-6 h-6 flex items-center justify-center rounded text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors" title="Save"><Check className="w-3.5 h-3.5" /></button>
                            <button onClick={cancelLineEdit} className="w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title="Cancel"><X className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      /* ── Display row ── */
                      <tr key={rowIdx} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer" onClick={() => startEditLine(rowIdx)}>
                        <td className="px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200">{li.item}</td>
                        <td className="text-center px-2 py-1.5 text-xs tabular-nums text-slate-600 dark:text-slate-300">{li.qty}</td>
                        <td className="text-right px-2 py-1.5 text-xs tabular-nums text-slate-600 dark:text-slate-300">${li.unitPrice.toFixed(2)}</td>
                        <td className="text-right px-3 py-1.5 text-xs font-semibold tabular-nums text-slate-800 dark:text-slate-100">${li.amount.toFixed(2)}</td>
                        <td className="text-right px-2 py-1.5">
                          <span className={cn(
                            'text-[11px] font-semibold tabular-nums',
                            li.confidence >= 90 ? 'text-emerald-600 dark:text-emerald-400' : li.confidence >= 75 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400',
                          )}>{li.confidence}%</span>
                        </td>
                        <td className="text-center px-1 py-1.5">
                          <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => { e.stopPropagation(); startEditLine(rowIdx); }} className="w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-blue-500 transition-colors" title="Edit"><Pencil className="w-3 h-3" /></button>
                            <button onClick={(e) => { e.stopPropagation(); deleteLine(rowIdx); }} className="w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-red-500 transition-colors" title="Delete"><X className="w-3 h-3" /></button>
                          </div>
                        </td>
                      </tr>
                    )
                  ))}

                  {/* ── Add new row (inline form) ── */}
                  {addingNewLine && (
                    <tr className="bg-emerald-50/50 dark:bg-emerald-950/20">
                      <td className="px-2 py-1">
                        <input
                          value={lineEditValues.item}
                          onChange={(e) => setLineEditValues(v => ({ ...v, item: e.target.value }))}
                          className="w-full h-7 px-2 rounded border border-emerald-300 dark:border-emerald-600 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                          placeholder="New item name"
                          autoFocus
                          onKeyDown={(e) => { if (e.key === 'Enter' && lineEditValues.item.trim()) saveLine(); if (e.key === 'Escape') cancelLineEdit(); }}
                        />
                      </td>
                      <td className="px-1 py-1">
                        <input
                          type="number"
                          min={1}
                          value={lineEditValues.qty}
                          onChange={(e) => setLineEditValues(v => ({ ...v, qty: Number(e.target.value) || 1 }))}
                          className="w-full h-7 px-1 rounded border border-emerald-300 dark:border-emerald-600 bg-white dark:bg-slate-800 text-xs text-center tabular-nums text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                          onKeyDown={(e) => { if (e.key === 'Enter' && lineEditValues.item.trim()) saveLine(); if (e.key === 'Escape') cancelLineEdit(); }}
                        />
                      </td>
                      <td className="px-1 py-1">
                        <input
                          type="number"
                          step="0.01"
                          min={0}
                          value={lineEditValues.unitPrice}
                          onChange={(e) => setLineEditValues(v => ({ ...v, unitPrice: Number(e.target.value) || 0 }))}
                          className="w-full h-7 px-1 rounded border border-emerald-300 dark:border-emerald-600 bg-white dark:bg-slate-800 text-xs text-right tabular-nums text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                          onKeyDown={(e) => { if (e.key === 'Enter' && lineEditValues.item.trim()) saveLine(); if (e.key === 'Escape') cancelLineEdit(); }}
                        />
                      </td>
                      <td className="text-right px-3 py-1 text-xs font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                        ${(lineEditValues.qty * lineEditValues.unitPrice).toFixed(2)}
                      </td>
                      <td className="text-right px-2 py-1 text-[11px] tabular-nums text-slate-400">—</td>
                      <td className="text-center px-1 py-1">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={saveLine} disabled={!lineEditValues.item.trim()} className="w-6 h-6 flex items-center justify-center rounded text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed" title="Add"><Check className="w-3.5 h-3.5" /></button>
                          <button onClick={cancelLineEdit} className="w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title="Cancel"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* ── Total row ── */}
                  <tr className="bg-slate-50 dark:bg-slate-800/80">
                    <td colSpan={3} className="px-3 py-1.5 text-right text-[10px] font-bold text-slate-500 uppercase tracking-wide">Total</td>
                    <td className="text-right px-3 py-1.5 text-xs font-bold tabular-nums text-slate-900 dark:text-white">
                      ${lineItems.reduce((s, li) => s + li.amount, 0).toFixed(2)}
                    </td>
                    <td />
                    <td />
                  </tr>

                  {/* Empty state */}
                  {lineItems.length === 0 && !addingNewLine && (
                    <tr>
                      <td colSpan={6} className="px-3 py-4 text-center">
                        <p className="text-xs text-slate-400">No line items extracted.</p>
                        <button onClick={startAddLine} className="text-xs text-blue-500 hover:text-blue-600 font-medium mt-1">+ Add first item</button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Validation actions footer */}
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shrink-0 flex items-center justify-end">
          <Button
            size="sm"
            variant="primary"
            icon={<Check className="w-3.5 h-3.5" />}
            onClick={() => setShowConfirmModal(true)}
          >
            Submit Validation
          </Button>
        </div>
      </div>

      {/* Confirm modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Validation Submission"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setShowConfirmModal(false)}>Confirm & Submit</Button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          You are about to submit validation for{' '}
          <span className="font-semibold">{allFields.length} fields</span> across{' '}
          <span className="font-semibold">{claim.documents.length} documents</span>.
        </p>
        <p className="text-xs text-slate-400 mt-3">
          This action will advance the claim to the <strong>Validation Complete</strong> status.
        </p>
      </Modal>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Rules & Outcome Tab (kept as-is, full width)
// ─────────────────────────────────────────────────────────────────────────────

function RulesOutcomeTab({ claim }: { claim: typeof mockClaims[0] }) {
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideJustification, setOverrideJustification] = useState('');
  const [expandedRules, setExpandedRules] = useState<Set<string>>(new Set());

  const claimRuleEvals = mockRuleEvaluations.filter((r) => r.claimId === claim.id);
  const claimRules = claimRuleEvals
    .map((r) => ({
      rule: mockBusinessRules.find((br) => br.id === r.ruleId),
      evaluation: r,
    }))
    .filter((r): r is { rule: (typeof mockBusinessRules)[0]; evaluation: (typeof mockRuleEvaluations)[0] } => r.rule != null);

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

  return (
    <div className="flex flex-col gap-5">
      {claimRules.length > 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Summary bar */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Business Rule Evaluations</h4>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span className="text-emerald-600 dark:text-emerald-400">{passCount}</span>
                <span className="text-slate-400 dark:text-slate-500"> of </span>
                <span>{totalRules}</span>
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
      ) : (
        <div className="text-sm text-slate-400 italic py-4 text-center">
          No rule evaluations available for this claim.
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-[var(--radius-md)] border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-start justify-between mb-4">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Payout Summary</h4>
          {claimRuleEvals.length > 0 && claimRuleEvals[0].timestamp && (
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Rules evaluated on: {formatDateTime(claimRuleEvals[0].timestamp)}
            </p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{passCount}</p>
            <p className="text-xs text-emerald-600/70 mt-1">Rules Passed</p>
          </div>
          <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400 tabular-nums">{failCount}</p>
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
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">By Category</p>
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
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">AI Recommendation:</span>
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

      <div className="flex gap-3 justify-end">
        <Button variant="secondary" onClick={() => setShowOverrideModal(true)}>
          Override Outcome
        </Button>
        <Button variant="primary" icon={<Check className="w-4 h-4" />}>
          Confirm Outcome
        </Button>
      </div>

      <Modal
        isOpen={showOverrideModal}
        onClose={() => setShowOverrideModal(false)}
        title="Override Outcome"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowOverrideModal(false)}>Cancel</Button>
            <Button variant="primary" disabled={!overrideJustification.trim()} onClick={() => setShowOverrideModal(false)}>
              Submit Override
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            You are overriding the AI-recommended outcome. Please provide a justification.
          </p>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">New Outcome</label>
            <select className="h-10 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 px-3 focus:outline-none">
              <option value="approve_full">Approve Full</option>
              <option value="approve_partial">Approve Partial</option>
              <option value="reject">Reject</option>
              <option value="escalate">Escalate</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
              Justification <span className="text-red-500">*</span>
            </label>
            <textarea
              value={overrideJustification}
              onChange={(e) => setOverrideJustification(e.target.value)}
              placeholder="Explain the reason for overriding the AI recommendation..."
              rows={4}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 px-3 py-2.5 resize-none focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Audit Event Detail Slide-Out Drawer
// ─────────────────────────────────────────────────────────────────────────────

const AUDIT_ACTION_BADGE_COLORS: Record<string, string> = {
  system: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  approval: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  override: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  rejection: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  qc: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  assignment: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
};

function getAuditCategory(actionType: string): string {
  if (actionType.startsWith('qc_')) return 'qc';
  if (actionType.includes('approv') || actionType.includes('payment') || actionType.includes('granted')) return 'approval';
  if (actionType.includes('reject') || actionType.includes('denied') || actionType.includes('fail')) return 'rejection';
  if (actionType.includes('override') || actionType.includes('escalat') || actionType.includes('return')) return 'override';
  if (actionType.includes('assign')) return 'assignment';
  return 'system';
}

function AuditChangesSection({
  before,
  after,
}: {
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
}) {
  if (!before && !after) return null;

  const allKeys = Array.from(new Set([
    ...Object.keys(before ?? {}),
    ...Object.keys(after ?? {}),
  ]));

  const changed = allKeys.filter((key) => {
    const bv = JSON.stringify((before ?? {})[key]);
    const av = JSON.stringify((after ?? {})[key]);
    return bv !== av;
  });

  if (changed.length === 0) return null;

  return (
    <div>
      <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Changes</p>
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
        {changed.map((key) => {
          const bv = (before ?? {})[key];
          const av = (after ?? {})[key];
          return (
            <div key={key} className="text-xs">
              <div className="px-3 py-1 bg-slate-50 dark:bg-slate-800 font-mono text-slate-500 dark:text-slate-400 font-semibold text-[10px] uppercase tracking-wide">
                {key.replace(/_/g, ' ')}
              </div>
              {bv !== undefined && (
                <div className="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 font-mono text-red-700 dark:text-red-400 text-[11px]">
                  <span className="select-none text-red-400 dark:text-red-600 mr-1.5">−</span>
                  {JSON.stringify(bv)}
                </div>
              )}
              {av !== undefined && (
                <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 font-mono text-emerald-700 dark:text-emerald-400 text-[11px]">
                  <span className="select-none text-emerald-400 dark:text-emerald-600 mr-1.5">+</span>
                  {JSON.stringify(av)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AuditEventSlideOut({
  event,
  onClose,
}: {
  event: AuditEvent | null;
  onClose: () => void;
}) {
  const isOpen = event !== null;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const category = event ? getAuditCategory(event.actionType) : 'system';
  const badgeColor = AUDIT_ACTION_BADGE_COLORS[category];

  return (
    <>
      {/* Dark backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out panel */}
      <div
        className={cn(
          'fixed top-0 right-0 z-50 h-full w-[450px] bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-700 flex flex-col transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
        aria-label="Audit event detail"
        role="dialog"
        aria-modal="true"
      >
        {event && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Audit Event</p>
                <p className="text-base font-bold text-slate-900 dark:text-white font-mono">{event.id}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold', badgeColor)}>
                  {event.actionType.replace(/_/g, ' ')}
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
              {/* Timestamp */}
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Timestamp</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 tabular-nums">
                  {formatDateTime(event.timestamp)}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  {formatRelativeTime(event.timestamp)}
                </p>
              </div>

              {/* Actor */}
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-3">Actor</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    {event.actorType === 'system' ? (
                      <Monitor className="w-4 h-4 text-slate-500" />
                    ) : event.actorType === 'ai' ? (
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">AI</span>
                    ) : (
                      <User className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{event.actorName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 capitalize">
                        {event.actorType}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{event.actorId}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Description</p>
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{event.description}</p>
              </div>

              {/* Before / After State */}
              {(event.beforeState || event.afterState) && (
                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-3">
                  {event.beforeState && (
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Before State</p>
                      <pre className="rounded-lg bg-red-50/60 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 px-3 py-2.5 text-[11px] font-mono text-red-800 dark:text-red-300 overflow-auto max-h-48 leading-relaxed">
                        {JSON.stringify(event.beforeState, null, 2)}
                      </pre>
                    </div>
                  )}
                  {event.afterState && (
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">After State</p>
                      <pre className="rounded-lg bg-emerald-50/60 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 px-3 py-2.5 text-[11px] font-mono text-emerald-800 dark:text-emerald-300 overflow-auto max-h-48 leading-relaxed">
                        {JSON.stringify(event.afterState, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* Changes diff */}
              {(event.beforeState || event.afterState) && (
                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                  <AuditChangesSection before={event.beforeState} after={event.afterState} />
                </div>
              )}

              {/* Metadata */}
              {event.metadata && Object.keys(event.metadata).length > 0 && (
                <div className="px-5 py-4">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Metadata</p>
                  <pre className="rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-[11px] font-mono text-slate-700 dark:text-slate-300 overflow-auto max-h-48 leading-relaxed">
                    {JSON.stringify(event.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Audit Log Tab
// ─────────────────────────────────────────────────────────────────────────────

function AuditLogTab({ claimId }: { claimId: string }) {
  const [actionFilter, setActionFilter] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);

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
    { value: 'qc_', label: 'QC' },
  ];

  const handleCloseDrawer = useCallback(() => setSelectedEvent(null), []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Filter by:</label>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 px-3 focus:outline-none"
        >
          {actionCategories.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <span className="text-xs text-slate-400">{filtered.length} events</span>
        <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
          <Info className="w-3 h-3" />
          Click any event to view details
        </span>
      </div>

      <AuditTimeline events={filtered} onEventClick={setSelectedEvent} />

      {filtered.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-8">
          No audit events match the selected filter.
        </p>
      )}

      <AuditEventSlideOut event={selectedEvent} onClose={handleCloseDrawer} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Communication Tab (kept as-is, full width)
// ─────────────────────────────────────────────────────────────────────────────

function CommunicationTab({ claim }: { claim: typeof mockClaims[0] }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(COMM_TEMPLATES[0].id);
  const [messageBody, setMessageBody] = useState('');

  const template = COMM_TEMPLATES.find((t) => t.id === selectedTemplate);

  const fillTemplate = (id: string) => {
    const t = COMM_TEMPLATES.find((tmpl) => tmpl.id === id);
    if (t) {
      const body = t.body
        .replace(/{claimId}/g, claim.id)
        .replace(/{passengerName}/g, claim.passenger.name)
        .replace(/{approvedAmount}/g, formatCurrency(claim.totalApproved, claim.currency));
      setMessageBody(body);
      setSelectedTemplate(id);
    }
  };

  const handleOpenModal = () => {
    fillTemplate(COMM_TEMPLATES[0].id);
    setShowModal(true);
  };

  const commHistory = [
    {
      id: 'comm-1',
      user: { name: 'System', avatar: 'SY' },
      action: 'sent acknowledgment to',
      target: claim.passenger.email,
      timestamp: claim.createdAt,
    },
    {
      id: 'comm-2',
      user: { name: claim.passenger.name, avatar: claim.passenger.name.split(' ').map((n) => n[0]).join('').toUpperCase() },
      action: 'submitted additional documents to',
      target: 'Claims Portal',
      timestamp: claim.updatedAt,
    },
  ];

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Communication History</h4>
        <Button
          variant="primary"
          size="sm"
          icon={<Send className="w-3.5 h-3.5" />}
          onClick={handleOpenModal}
        >
          Send Communication
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[var(--radius-md)] border border-slate-200 dark:border-slate-700 overflow-hidden">
        <ActivityFeed items={commHistory} />
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Send Communication"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" icon={<Send className="w-4 h-4" />} onClick={() => setShowModal(false)}>
              Send Email
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Template</label>
            <div className="grid grid-cols-2 gap-2">
              {COMM_TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => fillTemplate(t.id)}
                  className={cn(
                    'text-left px-3 py-2 rounded-lg border text-sm font-medium transition-all',
                    selectedTemplate === t.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300',
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">To</label>
            <input
              type="email"
              value={claim.passenger.email}
              readOnly
              className="h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-600 dark:text-slate-300 px-3 cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Subject</label>
            <input
              type="text"
              defaultValue={template?.subject.replace('{claimId}', claim.id) ?? ''}
              className="h-10 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 px-3 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Message</label>
            <textarea
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              rows={8}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 px-3 py-2.5 resize-none focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </Modal>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────

export default function ClaimDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const claim = useMemo(
    () => mockClaims.find((c) => c.id === id),
    [id],
  );

  if (!claim) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <XCircle className="w-12 h-12 text-red-400 mb-3" />
        <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">Claim not found</p>
        <p className="text-sm text-slate-400 mt-1">
          The claim <span className="font-mono">{id}</span> does not exist.
        </p>
        <Button
          variant="secondary"
          size="sm"
          className="mt-4"
          onClick={() => router.push('/agent/claims')}
          icon={<ArrowLeft className="w-3.5 h-3.5" />}
        >
          Back to Claims Queue
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-0">
      {/* Back button + breadcrumb */}
      <div className="flex items-center gap-2 mb-3">
        <button
          type="button"
          onClick={() => router.push('/agent/claims')}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Claims Queue
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
                  ? 'border-[var(--color-brand-primary,#3b82f6)] text-[var(--color-brand-primary,#3b82f6)]'
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
        {activeTab === 'rules' && <RulesOutcomeTab claim={claim} />}
        {activeTab === 'audit' && <AuditLogTab claimId={claim.id} />}
        {activeTab === 'communication' && <CommunicationTab claim={claim} />}
      </div>
    </div>
  );
}
