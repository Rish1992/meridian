// ─────────────────────────────────────────────────────────────────────────────
// Meridian Airlines Claims Platform — Claims Data
// ─────────────────────────────────────────────────────────────────────────────
import type {
  Claim,
  AuditEvent,
  BusinessRule,
  RuleEvaluation,
  QCReview,
  Notification,
} from '@/types';

import { mockPassengers, mockUsers } from './users-data';
import { mockFlights, mockDisruptions, mockDocuments } from './flights-data';

// ─────────────────────────────────────────────────────────────────────────────
// Lookup helpers
// ─────────────────────────────────────────────────────────────────────────────
const pax = Object.fromEntries(mockPassengers.map((p) => [p.id, p]));
const flt = Object.fromEntries(mockFlights.map((f) => [f.id, f]));
const dis = Object.fromEntries(mockDisruptions.map((d) => [d.id, d]));
const usr = Object.fromEntries(mockUsers.map((u) => [u.id, u]));
const docs = (claimId: string) => mockDocuments.filter((d) => d.claimId === claimId);

// ─────────────────────────────────────────────────────────────────────────────
// Claims — 35 total
// Distribution:
//   unassigned(5): CLM-010,011,012,013,014
//   assigned(5)+in_review(3)=8: CLM-001,002,003,016,017 assigned / CLM-004,018,019 in_review  [wait — spec says 8 assigned/in_review]
//   validation_complete(3): CLM-020,021,022
//   pending_authorization(4): CLM-003,009,023,024
//   approved(6): CLM-004,005,025,026,027,028
//   rejected(3): CLM-006,029,030
//   returned(2): CLM-007,031
//   auto_processed(2): CLM-008,032
//   payment_initiated(1): CLM-033
//   closed(1): CLM-034
//
// Re-mapping to clean distribution:
//   unassigned(5):             CLM-010,011,012,013,014
//   assigned(4)/in_review(4):  CLM-001,002,015,016 assigned; CLM-017,018,019,035 in_review
//   validation_complete(3):    CLM-020,021,022
//   pending_authorization(4):  CLM-003,009,023,024
//   approved(6):               CLM-004,005,025,026,027,028
//   rejected(3):               CLM-006,029,030
//   returned(2):               CLM-007,031
//   auto_processed(2):         CLM-008,032
//   payment_initiated(1):      CLM-033
//   closed(1):                 CLM-034
// ─────────────────────────────────────────────────────────────────────────────

export const mockClaims: Claim[] = [
  // ── CLM-001: assigned — Rohan Verma, AI 111 DEL→LHR 4h30m delay ─────────────
  {
    id: 'CLM-001',
    pnr: 'ABCDE1',
    passengerId: 'pax-001',
    passenger: pax['pax-001'],
    flightId: 'FLT-001',
    flight: flt['FLT-001'],
    disruptionId: 'DIS-001',
    disruption: dis['DIS-001'],
    status: 'assigned',
    overallConfidence: 92,
    totalClaimed: 268.10,
    totalApproved: 0,
    currency: 'USD',
    outcome: null,
    assignedAgentId: 'usr-001',
    assignedAgent: usr['usr-001'],
    documents: docs('CLM-001'),
    createdAt: '2026-01-14T09:30:00Z',
    updatedAt: '2026-01-14T09:33:00Z',
    slaDeadline: '2026-01-21T09:30:00Z',
  },
  // ── CLM-002: assigned — Aisha Nair, 6E 201 BLR→SIN 6h35m delay ──────────────
  {
    id: 'CLM-002',
    pnr: 'FGHIJ2',
    passengerId: 'pax-002',
    passenger: pax['pax-002'],
    flightId: 'FLT-004',
    flight: flt['FLT-004'],
    disruptionId: 'DIS-002',
    disruption: dis['DIS-002'],
    status: 'assigned',
    overallConfidence: 89,
    totalClaimed: 334.65,
    totalApproved: 0,
    currency: 'USD',
    outcome: null,
    assignedAgentId: 'usr-001',
    assignedAgent: usr['usr-001'],
    documents: docs('CLM-002'),
    createdAt: '2026-02-03T16:45:00Z',
    updatedAt: '2026-02-04T08:10:00Z',
    slaDeadline: '2026-02-10T16:45:00Z',
  },
  // ── CLM-003: pending_authorization — David Okafor, 6E 58 MAA→DXB crew delay ──
  {
    id: 'CLM-003',
    pnr: 'KLMNO3',
    passengerId: 'pax-010',
    passenger: pax['pax-010'],
    flightId: 'FLT-008',
    flight: flt['FLT-008'],
    disruptionId: 'DIS-003',
    disruption: dis['DIS-003'],
    status: 'pending_authorization',
    overallConfidence: 87,
    totalClaimed: 147.25,
    totalApproved: 0,
    currency: 'USD',
    outcome: null,
    assignedAgentId: 'usr-003',
    assignedAgent: usr['usr-003'],
    documents: docs('CLM-003'),
    createdAt: '2026-02-28T07:00:00Z',
    updatedAt: '2026-03-01T14:55:00Z',
    slaDeadline: '2026-03-07T07:00:00Z',
    authorizationNotes: 'Crew shortage delay confirmed. Receipts validated. Pending senior auth — claim over $100 threshold.',
  },
  // ── CLM-004: approved — Lars Eriksson, BA 256 LHR→BOM weather delay ──────────
  {
    id: 'CLM-004',
    pnr: 'PQRST4',
    passengerId: 'pax-016',
    passenger: pax['pax-016'],
    flightId: 'FLT-009',
    flight: flt['FLT-009'],
    disruptionId: 'DIS-004',
    disruption: dis['DIS-004'],
    status: 'approved',
    overallConfidence: 95,
    totalClaimed: 316.60,
    totalApproved: 316.60,
    currency: 'USD',
    outcome: 'approve_full',
    assignedAgentId: 'usr-001',
    assignedAgent: usr['usr-001'],
    documents: docs('CLM-004'),
    createdAt: '2026-03-05T05:30:00Z',
    updatedAt: '2026-03-07T10:15:00Z',
    slaDeadline: '2026-03-12T05:30:00Z',
    authorizationNotes: 'All receipts validated. Weather disruption confirmed by NATS advisory. Full approval granted.',
  },
  // ── CLM-005: approved (partial) — Aisha Nair, EK 521 BOM→DXB cancellation ────
  {
    id: 'CLM-005',
    pnr: 'UVWXY5',
    passengerId: 'pax-002',
    passenger: pax['pax-002'],
    flightId: 'FLT-002',
    flight: flt['FLT-002'],
    disruptionId: 'DIS-005',
    disruption: dis['DIS-005'],
    status: 'approved',
    overallConfidence: 90,
    totalClaimed: 330.50,
    totalApproved: 312.00,
    currency: 'USD',
    outcome: 'approve_partial',
    assignedAgentId: 'usr-001',
    assignedAgent: usr['usr-001'],
    documents: docs('CLM-005'),
    createdAt: '2026-01-21T01:15:00Z',
    updatedAt: '2026-01-24T16:40:00Z',
    slaDeadline: '2026-01-28T01:15:00Z',
    authorizationNotes: 'Alternate carrier ticket approved. Food receipt $18.50 approved. Lounge access charge of $18.50 disallowed — not covered under policy.',
  },
  // ── CLM-006: rejected — Sunita Krishnamurthy, AI 665 DEL→BOM denied boarding ──
  {
    id: 'CLM-006',
    pnr: 'ZABCD6',
    passengerId: 'pax-003',
    passenger: pax['pax-003'],
    flightId: 'FLT-007',
    flight: flt['FLT-007'],
    disruptionId: 'DIS-007',
    disruption: dis['DIS-007'],
    status: 'rejected',
    overallConfidence: 55,
    totalClaimed: 113.20,
    totalApproved: 0,
    currency: 'USD',
    outcome: 'reject',
    assignedAgentId: 'usr-004',
    assignedAgent: usr['usr-004'],
    documents: docs('CLM-006'),
    createdAt: '2026-02-21T08:30:00Z',
    updatedAt: '2026-02-23T12:00:00Z',
    slaDeadline: '2026-02-28T08:30:00Z',
    authorizationNotes: 'Passenger accepted voluntary denied boarding compensation of INR 10,000 at gate. Subsequent expense claim not eligible under dual-compensation exclusion policy.',
  },
  // ── CLM-007: returned — Meera Iyer, BA 138 LHR→DEL diversion ────────────────
  {
    id: 'CLM-007',
    pnr: 'EFGHI7',
    passengerId: 'pax-004',
    passenger: pax['pax-004'],
    flightId: 'FLT-005',
    flight: flt['FLT-005'],
    disruptionId: 'DIS-008',
    disruption: dis['DIS-008'],
    status: 'returned',
    overallConfidence: 74,
    totalClaimed: 267.75,
    totalApproved: 0,
    currency: 'USD',
    outcome: null,
    assignedAgentId: 'usr-002',
    assignedAgent: usr['usr-002'],
    documents: docs('CLM-007'),
    createdAt: '2026-02-10T04:00:00Z',
    updatedAt: '2026-02-12T09:45:00Z',
    slaDeadline: '2026-02-17T04:00:00Z',
    returnedReason: 'Hotel receipt is illegible — please resubmit a clear scan. Cab receipt currency conversion unverifiable without bank statement.',
  },
  // ── CLM-008: auto_processed — Priyanka Desai, AI 131 DEL→SFO minor delay ─────
  {
    id: 'CLM-008',
    pnr: 'JKLMN8',
    passengerId: 'pax-005',
    passenger: pax['pax-005'],
    flightId: 'FLT-010',
    flight: flt['FLT-010'],
    disruptionId: 'DIS-010',
    disruption: dis['DIS-010'],
    status: 'auto_processed',
    overallConfidence: 97,
    totalClaimed: 14.90,
    totalApproved: 14.90,
    currency: 'USD',
    outcome: 'approve_full',
    assignedAgentId: null,
    documents: docs('CLM-008'),
    createdAt: '2026-03-10T07:15:00Z',
    updatedAt: '2026-03-10T07:18:00Z',
    slaDeadline: '2026-03-17T07:15:00Z',
    authorizationNotes: 'Auto-approved: single food receipt below $50 threshold, confidence >95%, no fraud signals detected.',
  },
  // ── CLM-009: pending_authorization — Omar Al-Farsi, EK 503 DEL→DXB bird strike ─
  {
    id: 'CLM-009',
    pnr: 'OPQRS9',
    passengerId: 'pax-009',
    passenger: pax['pax-009'],
    flightId: 'FLT-006',
    flight: flt['FLT-006'],
    disruptionId: 'DIS-009',
    disruption: dis['DIS-009'],
    status: 'pending_authorization',
    overallConfidence: 93,
    totalClaimed: 2423.00,
    totalApproved: 0,
    currency: 'USD',
    outcome: null,
    assignedAgentId: 'usr-003',
    assignedAgent: usr['usr-003'],
    documents: docs('CLM-009'),
    createdAt: '2026-02-15T07:30:00Z',
    updatedAt: '2026-02-17T16:20:00Z',
    slaDeadline: '2026-02-22T07:30:00Z',
    authorizationNotes: 'Claim exceeds $2,000 threshold. Platinum FF status verified. Escalated for senior authorization — hotel rate exceeds $200/night cap; partial approval recommended.',
  },
  // ── CLM-010: unassigned — Rohan Verma, AI 101 DEL→JFK cancellation ────────────
  {
    id: 'CLM-010',
    pnr: 'TUVWX0',
    passengerId: 'pax-001',
    passenger: pax['pax-001'],
    flightId: 'FLT-003',
    flight: flt['FLT-003'],
    disruptionId: 'DIS-006',
    disruption: dis['DIS-006'],
    status: 'unassigned',
    overallConfidence: 82,
    totalClaimed: 640.00,
    totalApproved: 0,
    currency: 'USD',
    outcome: null,
    assignedAgentId: null,
    documents: [],
    createdAt: '2026-01-28T10:00:00Z',
    updatedAt: '2026-01-28T10:05:00Z',
    slaDeadline: '2026-02-04T10:00:00Z',
  },
  // ── CLM-011: unassigned — Hassan Al-Qassim, QR 555 DOH→LHR tech delay ─────────
  {
    id: 'CLM-011',
    pnr: 'YZABC1',
    passengerId: 'pax-013',
    passenger: pax['pax-013'],
    flightId: 'FLT-011',
    flight: flt['FLT-011'],
    disruptionId: 'DIS-011',
    disruption: dis['DIS-011'],
    status: 'unassigned',
    overallConfidence: 88,
    totalClaimed: 264.05,
    totalApproved: 0,
    currency: 'USD',
    outcome: null,
    assignedAgentId: null,
    documents: docs('CLM-011'),
    createdAt: '2026-01-05T07:45:00Z',
    updatedAt: '2026-01-05T07:50:00Z',
    slaDeadline: '2026-01-12T07:45:00Z',
  },
  // ── CLM-012: unassigned — Khalid Al-Mansoori, EY 204 AUH→DEL ATC delay ────────
  {
    id: 'CLM-012',
    pnr: 'DEFGH2',
    passengerId: 'pax-011',
    passenger: pax['pax-011'],
    flightId: 'FLT-013',
    flight: flt['FLT-013'],
    disruptionId: 'DIS-012',
    disruption: dis['DIS-012'],
    status: 'unassigned',
    overallConfidence: 79,
    totalClaimed: 204.00,
    totalApproved: 0,
    currency: 'AED',
    outcome: null,
    assignedAgentId: null,
    documents: docs('CLM-012'),
    createdAt: '2026-01-17T21:00:00Z',
    updatedAt: '2026-01-17T21:05:00Z',
    slaDeadline: '2026-01-24T21:00:00Z',
  },
  // ── CLM-013: unassigned — Sophie Dubois, AF 218 CDG→DEL ground handling delay ──
  {
    id: 'CLM-013',
    pnr: 'HIJKL3',
    passengerId: 'pax-017',
    passenger: pax['pax-017'],
    flightId: 'FLT-015',
    flight: flt['FLT-015'],
    disruptionId: 'DIS-013',
    disruption: dis['DIS-013'],
    status: 'unassigned',
    overallConfidence: 85,
    totalClaimed: 246.60,
    totalApproved: 0,
    currency: 'EUR',
    outcome: null,
    assignedAgentId: null,
    documents: docs('CLM-013'),
    createdAt: '2026-02-08T06:00:00Z',
    updatedAt: '2026-02-08T06:05:00Z',
    slaDeadline: '2026-02-15T06:00:00Z',
  },
  // ── CLM-014: unassigned — Emily Chen, UA 84 JFK→LHR cancellation ─────────────
  {
    id: 'CLM-014',
    pnr: 'MNOPQ4',
    passengerId: 'pax-024',
    passenger: pax['pax-024'],
    flightId: 'FLT-016',
    flight: flt['FLT-016'],
    disruptionId: 'DIS-021',
    disruption: dis['DIS-021'],
    status: 'unassigned',
    overallConfidence: 81,
    totalClaimed: 498.00,
    totalApproved: 0,
    currency: 'USD',
    outcome: null,
    assignedAgentId: null,
    documents: docs('CLM-014'),
    createdAt: '2026-02-13T00:00:00Z',
    updatedAt: '2026-02-13T00:05:00Z',
    slaDeadline: '2026-02-20T00:00:00Z',
  },
  // ── CLM-015: assigned — Sarah Mitchell, UA 84 JFK→LHR cancellation ────────────
  {
    id: 'CLM-015',
    pnr: 'RSTUV5',
    passengerId: 'pax-022',
    passenger: pax['pax-022'],
    flightId: 'FLT-016',
    flight: flt['FLT-016'],
    disruptionId: 'DIS-021',
    disruption: dis['DIS-021'],
    status: 'assigned',
    overallConfidence: 86,
    totalClaimed: 271.30,
    totalApproved: 0,
    currency: 'USD',
    outcome: null,
    assignedAgentId: 'usr-001',
    assignedAgent: usr['usr-001'],
    documents: docs('CLM-015'),
    createdAt: '2026-02-13T01:30:00Z',
    updatedAt: '2026-02-13T02:00:00Z',
    slaDeadline: '2026-02-20T01:30:00Z',
  },
  // ── CLM-016: assigned — John Harrison, EK 212 DXB→JFK sandstorm delay ─────────
  {
    id: 'CLM-016',
    pnr: 'WXYZA6',
    passengerId: 'pax-021',
    passenger: pax['pax-021'],
    flightId: 'FLT-017',
    flight: flt['FLT-017'],
    disruptionId: 'DIS-014',
    disruption: dis['DIS-014'],
    status: 'assigned',
    overallConfidence: 84,
    totalClaimed: 861.00,
    totalApproved: 0,
    currency: 'USD',
    outcome: null,
    assignedAgentId: 'usr-014',
    assignedAgent: usr['usr-014'],
    documents: docs('CLM-016'),
    createdAt: '2026-02-18T20:00:00Z',
    updatedAt: '2026-02-19T09:00:00Z',
    slaDeadline: '2026-02-25T20:00:00Z',
  },
  // ── CLM-017: in_review — Priyanka Desai, 9W 118 BOM→CDG crew delay ───────────
  {
    id: 'CLM-017',
    pnr: 'BCDEF7',
    passengerId: 'pax-005',
    passenger: pax['pax-005'],
    flightId: 'FLT-018',
    flight: flt['FLT-018'],
    disruptionId: 'DIS-015',
    disruption: dis['DIS-015'],
    status: 'in_review',
    overallConfidence: 88,
    totalClaimed: 203.25,
    totalApproved: 0,
    currency: 'USD',
    outcome: null,
    assignedAgentId: 'usr-001',
    assignedAgent: usr['usr-001'],
    documents: docs('CLM-017'),
    createdAt: '2026-02-24T14:00:00Z',
    updatedAt: '2026-02-25T10:30:00Z',
    slaDeadline: '2026-03-03T14:00:00Z',
  },
  // ── CLM-018: in_review — Lars Eriksson, KL 871 AMS→BOM no disruption (minor) ──
  {
    id: 'CLM-018',
    pnr: 'GHIJK8',
    passengerId: 'pax-016',
    passenger: pax['pax-016'],
    flightId: 'FLT-019',
    flight: flt['FLT-019'],
    disruptionId: 'DIS-003',
    disruption: dis['DIS-003'],
    status: 'in_review',
    overallConfidence: 91,
    totalClaimed: 176.30,
    totalApproved: 0,
    currency: 'EUR',
    outcome: null,
    assignedAgentId: 'usr-001',
    assignedAgent: usr['usr-001'],
    documents: docs('CLM-018'),
    createdAt: '2026-03-02T06:00:00Z',
    updatedAt: '2026-03-03T09:45:00Z',
    slaDeadline: '2026-03-09T06:00:00Z',
  },
  // ── CLM-019: in_review — Karthik Rajan, AI 307 DEL→MAA tech delay ────────────
  {
    id: 'CLM-019',
    pnr: 'LMNOP9',
    passengerId: 'pax-006',
    passenger: pax['pax-006'],
    flightId: 'FLT-020',
    flight: flt['FLT-020'],
    disruptionId: 'DIS-016',
    disruption: dis['DIS-016'],
    status: 'in_review',
    overallConfidence: 90,
    totalClaimed: 24.50,
    totalApproved: 0,
    currency: 'INR',
    outcome: null,
    assignedAgentId: 'usr-001',
    assignedAgent: usr['usr-001'],
    documents: docs('CLM-019'),
    createdAt: '2026-03-07T11:30:00Z',
    updatedAt: '2026-03-08T10:00:00Z',
    slaDeadline: '2026-03-14T11:30:00Z',
  },
  // ── CLM-020: validation_complete — Hans Müller, TK 714 IST→DEL ATC delay ──────
  {
    id: 'CLM-020',
    pnr: 'QRSTU0',
    passengerId: 'pax-018',
    passenger: pax['pax-018'],
    flightId: 'FLT-021',
    flight: flt['FLT-021'],
    disruptionId: 'DIS-017',
    disruption: dis['DIS-017'],
    status: 'validation_complete',
    overallConfidence: 93,
    totalClaimed: 207.10,
    totalApproved: 0,
    currency: 'USD',
    outcome: null,
    assignedAgentId: 'usr-001',
    assignedAgent: usr['usr-001'],
    documents: docs('CLM-020'),
    createdAt: '2026-03-13T12:00:00Z',
    updatedAt: '2026-03-15T11:00:00Z',
    slaDeadline: '2026-03-20T12:00:00Z',
  },
  // ── CLM-021: validation_complete — Marcus Johnson, AA 292 JFK→DEL cancellation ─
  {
    id: 'CLM-021',
    pnr: 'VWXYZ1',
    passengerId: 'pax-023',
    passenger: pax['pax-023'],
    flightId: 'FLT-022',
    flight: flt['FLT-022'],
    disruptionId: 'DIS-004',
    disruption: dis['DIS-004'],
    status: 'validation_complete',
    overallConfidence: 86,
    totalClaimed: 38.90,
    totalApproved: 0,
    currency: 'USD',
    outcome: null,
    assignedAgentId: 'usr-004',
    assignedAgent: usr['usr-004'],
    documents: docs('CLM-021'),
    createdAt: '2025-12-21T06:00:00Z',
    updatedAt: '2025-12-22T14:00:00Z',
    slaDeadline: '2025-12-28T06:00:00Z',
  },
  // ── CLM-022: validation_complete — Neha Kulkarni, AI 191 DEL→SIN cancellation ─
  {
    id: 'CLM-022',
    pnr: 'ABCDE2',
    passengerId: 'pax-007',
    passenger: pax['pax-007'],
    flightId: 'FLT-004',
    flight: flt['FLT-004'],
    disruptionId: 'DIS-019',
    disruption: dis['DIS-019'],
    status: 'validation_complete',
    overallConfidence: 89,
    totalClaimed: 308.40,
    totalApproved: 0,
    currency: 'USD',
    outcome: null,
    assignedAgentId: 'usr-005',
    assignedAgent: usr['usr-005'],
    documents: docs('CLM-022'),
    createdAt: '2025-12-31T22:00:00Z',
    updatedAt: '2026-01-02T15:30:00Z',
    slaDeadline: '2026-01-07T22:00:00Z',
  },
  // ── CLM-023: pending_authorization — Isabella Rossi, AF 218 CDG→DEL ───────────
  {
    id: 'CLM-023',
    pnr: 'FGHIJ3',
    passengerId: 'pax-019',
    passenger: pax['pax-019'],
    flightId: 'FLT-015',
    flight: flt['FLT-015'],
    disruptionId: 'DIS-013',
    disruption: dis['DIS-013'],
    status: 'pending_authorization',
    overallConfidence: 91,
    totalClaimed: 246.60,
    totalApproved: 0,
    currency: 'EUR',
    outcome: null,
    assignedAgentId: 'usr-014',
    assignedAgent: usr['usr-014'],
    documents: docs('CLM-023'),
    createdAt: '2026-02-08T07:00:00Z',
    updatedAt: '2026-02-10T16:00:00Z',
    slaDeadline: '2026-02-15T07:00:00Z',
    authorizationNotes: 'Ground handling strike confirmed by CDG operations report. EUR claim above auto-approval threshold.',
  },
  // ── CLM-024: pending_authorization — Fatima Al-Zaabi, G9 431 BOM→SHJ monsoon delay
  {
    id: 'CLM-024',
    pnr: 'KLMNO4',
    passengerId: 'pax-012',
    passenger: pax['pax-012'],
    flightId: 'FLT-003',
    flight: flt['FLT-003'],
    disruptionId: 'DIS-018',
    disruption: dis['DIS-018'],
    status: 'pending_authorization',
    overallConfidence: 85,
    totalClaimed: 128.95,
    totalApproved: 0,
    currency: 'AED',
    outcome: null,
    assignedAgentId: 'usr-013',
    assignedAgent: usr['usr-013'],
    documents: docs('CLM-024'),
    createdAt: '2025-12-27T00:30:00Z',
    updatedAt: '2025-12-28T12:00:00Z',
    slaDeadline: '2026-01-03T00:30:00Z',
    authorizationNotes: 'Weather delay >5 hours confirmed. Dual-currency claim requires manual FX verification before auth.',
  },
  // ── CLM-025: approved — Robert Williams, AA 292 JFK→DEL cancellation ─────────
  {
    id: 'CLM-025',
    pnr: 'PQRST5',
    passengerId: 'pax-025',
    passenger: pax['pax-025'],
    flightId: 'FLT-022',
    flight: flt['FLT-022'],
    disruptionId: 'DIS-004',
    disruption: dis['DIS-004'],
    status: 'approved',
    overallConfidence: 94,
    totalClaimed: 80.00,
    totalApproved: 80.00,
    currency: 'USD',
    outcome: 'approve_full',
    assignedAgentId: 'usr-001',
    assignedAgent: usr['usr-001'],
    documents: docs('CLM-025'),
    createdAt: '2025-12-21T09:00:00Z',
    updatedAt: '2025-12-23T11:30:00Z',
    slaDeadline: '2025-12-28T09:00:00Z',
    authorizationNotes: 'Boarding pass verified. Cancellation confirmed in OPS logs. Single meal receipt approved.',
  },
  // ── CLM-026: approved — Hans Müller, LH 760 FRA→BOM diversion ────────────────
  {
    id: 'CLM-026',
    pnr: 'UVWXY6',
    passengerId: 'pax-018',
    passenger: pax['pax-018'],
    flightId: 'FLT-012',
    flight: flt['FLT-012'],
    disruptionId: 'DIS-022',
    disruption: dis['DIS-022'],
    status: 'approved',
    overallConfidence: 96,
    totalClaimed: 206.40,
    totalApproved: 206.40,
    currency: 'USD',
    outcome: 'approve_full',
    assignedAgentId: 'usr-016',
    assignedAgent: usr['usr-016'],
    documents: docs('CLM-026'),
    createdAt: '2026-01-11T12:00:00Z',
    updatedAt: '2026-01-14T09:00:00Z',
    slaDeadline: '2026-01-18T12:00:00Z',
    authorizationNotes: 'Diversion to MCT confirmed. Medical emergency exemption noted. All expense receipts within policy caps. Approved.',
  },
  // ── CLM-027: approved — Neha Kulkarni, SQ 406 SIN→LHR denied boarding ─────────
  {
    id: 'CLM-027',
    pnr: 'ZABCD7',
    passengerId: 'pax-007',
    passenger: pax['pax-007'],
    flightId: 'FLT-014',
    flight: flt['FLT-014'],
    disruptionId: 'DIS-020',
    disruption: dis['DIS-020'],
    status: 'approved',
    overallConfidence: 92,
    totalClaimed: 41.00,
    totalApproved: 41.00,
    currency: 'USD',
    outcome: 'approve_full',
    assignedAgentId: 'usr-001',
    assignedAgent: usr['usr-001'],
    documents: docs('CLM-027'),
    createdAt: '2026-02-02T08:00:00Z',
    updatedAt: '2026-02-04T14:00:00Z',
    slaDeadline: '2026-02-09T08:00:00Z',
    authorizationNotes: 'IDB confirmed by SQ gate report. Equipment downgrade from A380 to A350 verified. Meal expense approved.',
  },
  // ── CLM-028: approved — Sophie Dubois, AF 218 CDG→DEL ground handling delay ───
  {
    id: 'CLM-028',
    pnr: 'EFGHI8',
    passengerId: 'pax-017',
    passenger: pax['pax-017'],
    flightId: 'FLT-015',
    flight: flt['FLT-015'],
    disruptionId: 'DIS-013',
    disruption: dis['DIS-013'],
    status: 'approved',
    overallConfidence: 94,
    totalClaimed: 267.30,
    totalApproved: 239.50,
    currency: 'EUR',
    outcome: 'approve_partial',
    assignedAgentId: 'usr-018',
    assignedAgent: usr['usr-018'],
    documents: docs('CLM-028'),
    createdAt: '2026-02-08T08:30:00Z',
    updatedAt: '2026-02-11T15:00:00Z',
    slaDeadline: '2026-02-15T08:30:00Z',
    authorizationNotes: 'Hotel and cab receipts approved. Meal receipt partially approved — one meal within cap. Premium lounge access EUR 28 disallowed.',
  },
  // ── CLM-029: rejected — John Harrison, EK 212 DXB→JFK sandstorm delay ─────────
  {
    id: 'CLM-029',
    pnr: 'JKLMN9',
    passengerId: 'pax-021',
    passenger: pax['pax-021'],
    flightId: 'FLT-017',
    flight: flt['FLT-017'],
    disruptionId: 'DIS-014',
    disruption: dis['DIS-014'],
    status: 'rejected',
    overallConfidence: 42,
    totalClaimed: 4500.00,
    totalApproved: 0,
    currency: 'USD',
    outcome: 'reject',
    assignedAgentId: 'usr-019',
    assignedAgent: usr['usr-019'],
    documents: docs('CLM-029'),
    createdAt: '2026-02-19T06:00:00Z',
    updatedAt: '2026-02-21T13:00:00Z',
    slaDeadline: '2026-02-26T06:00:00Z',
    authorizationNotes: 'Claimed amount of $4,500 far exceeds policy cap of $2,500 for Platinum passengers. Receipt for Business Class upgrade $3,200 is not reimbursable. Rejected.',
  },
  // ── CLM-030: rejected — Elena Petrov, 9W 118 BOM→CDG crew delay ──────────────
  {
    id: 'CLM-030',
    pnr: 'OPQRS0',
    passengerId: 'pax-020',
    passenger: pax['pax-020'],
    flightId: 'FLT-018',
    flight: flt['FLT-018'],
    disruptionId: 'DIS-015',
    disruption: dis['DIS-015'],
    status: 'rejected',
    overallConfidence: 38,
    totalClaimed: 128.50,
    totalApproved: 0,
    currency: 'EUR',
    outcome: 'reject',
    assignedAgentId: 'usr-020',
    assignedAgent: usr['usr-020'],
    documents: docs('CLM-030'),
    createdAt: '2026-02-25T08:00:00Z',
    updatedAt: '2026-02-27T11:00:00Z',
    slaDeadline: '2026-03-04T08:00:00Z',
    authorizationNotes: 'Disruption coded CREW_SHORTAGE but airline records show extraordinary circumstance exemption applies per EC 261. Claim rejected — no entitlement.',
  },
  // ── CLM-031: returned — Tariq Al-Rashidi, TK 714 IST→DEL ATC delay ───────────
  {
    id: 'CLM-031',
    pnr: 'TUVWX1',
    passengerId: 'pax-015',
    passenger: pax['pax-015'],
    flightId: 'FLT-021',
    flight: flt['FLT-021'],
    disruptionId: 'DIS-017',
    disruption: dis['DIS-017'],
    status: 'returned',
    overallConfidence: 66,
    totalClaimed: 165.50,
    totalApproved: 0,
    currency: 'USD',
    outcome: null,
    assignedAgentId: 'usr-021',
    assignedAgent: usr['usr-021'],
    documents: docs('CLM-031'),
    createdAt: '2026-03-14T08:00:00Z',
    updatedAt: '2026-03-16T10:00:00Z',
    slaDeadline: '2026-03-21T08:00:00Z',
    returnedReason: 'Hotel receipt does not match booking dates — please provide the correct invoice. Food receipt is missing merchant name and is not acceptable.',
  },
  // ── CLM-032: auto_processed — Khalid Al-Mansoori, EK 571 CCU→DXB ─────────────
  {
    id: 'CLM-032',
    pnr: 'RSTUV2',
    passengerId: 'pax-011',
    passenger: pax['pax-011'],
    flightId: 'FLT-005',
    flight: flt['FLT-005'],
    disruptionId: 'DIS-005',
    disruption: dis['DIS-005'],
    status: 'auto_processed',
    overallConfidence: 96,
    totalClaimed: 0.00,
    totalApproved: 0.00,
    currency: 'AED',
    outcome: 'approve_full',
    assignedAgentId: null,
    documents: docs('CLM-032'),
    createdAt: '2026-01-03T08:30:00Z',
    updatedAt: '2026-01-03T08:32:00Z',
    slaDeadline: '2026-01-10T08:30:00Z',
    authorizationNotes: 'Auto-closed: disruption duration under 2 hours, no expense receipts submitted, no action required.',
  },
  // ── CLM-033: payment_initiated — Layla Mahmoud, EY 204 AUH→DEL ATC delay ──────
  {
    id: 'CLM-033',
    pnr: 'WXYZA3',
    passengerId: 'pax-014',
    passenger: pax['pax-014'],
    flightId: 'FLT-013',
    flight: flt['FLT-013'],
    disruptionId: 'DIS-012',
    disruption: dis['DIS-012'],
    status: 'payment_initiated',
    overallConfidence: 95,
    totalClaimed: 35.80,
    totalApproved: 35.80,
    currency: 'USD',
    outcome: 'approve_full',
    assignedAgentId: 'usr-022',
    assignedAgent: usr['usr-022'],
    documents: docs('CLM-033'),
    createdAt: '2026-01-18T05:00:00Z',
    updatedAt: '2026-01-21T09:00:00Z',
    slaDeadline: '2026-01-25T05:00:00Z',
    authorizationNotes: 'Single meal receipt approved. Payment to account ending *7890 initiated.',
  },
  // ── CLM-034: closed — Karthik Rajan, EK 571 CCU→DXB tech delay ───────────────
  {
    id: 'CLM-034',
    pnr: 'BCDEF4',
    passengerId: 'pax-006',
    passenger: pax['pax-006'],
    flightId: 'FLT-005',
    flight: flt['FLT-005'],
    disruptionId: 'DIS-005',
    disruption: dis['DIS-005'],
    status: 'closed',
    overallConfidence: 97,
    totalClaimed: 230.00,
    totalApproved: 212.30,
    currency: 'AED',
    outcome: 'approve_partial',
    assignedAgentId: 'usr-001',
    assignedAgent: usr['usr-001'],
    documents: docs('CLM-034'),
    createdAt: '2026-01-03T09:00:00Z',
    updatedAt: '2026-01-08T14:00:00Z',
    slaDeadline: '2026-01-10T09:00:00Z',
    authorizationNotes: 'Hotel and cab receipts approved. One meal receipt over daily cap — disallowed $17.70. Payment completed and claim closed.',
  },
  // ── CLM-035: in_review — Elena Petrov, AF 218 CDG→DEL ground handling delay ───
  {
    id: 'CLM-035',
    pnr: 'GHIJK5',
    passengerId: 'pax-020',
    passenger: pax['pax-020'],
    flightId: 'FLT-015',
    flight: flt['FLT-015'],
    disruptionId: 'DIS-013',
    disruption: dis['DIS-013'],
    status: 'in_review',
    overallConfidence: 83,
    totalClaimed: 216.90,
    totalApproved: 0,
    currency: 'GBP',
    outcome: null,
    assignedAgentId: 'usr-003',
    assignedAgent: usr['usr-003'],
    documents: docs('CLM-035'),
    createdAt: '2026-02-08T10:00:00Z',
    updatedAt: '2026-02-09T14:30:00Z',
    slaDeadline: '2026-02-15T10:00:00Z',
  },
];


// ─────────────────────────────────────────────────────────────────────────────
// Audit Events — 80+ events covering 12 claims' lifecycles
// ─────────────────────────────────────────────────────────────────────────────

export const mockAuditEvents: AuditEvent[] = [
  // ── CLM-001 lifecycle (assigned) ─────────────────────────────────────────────
  { id: 'aud-001', claimId: 'CLM-001', actorType: 'system', actorId: 'sys', actorName: 'Meridian Ingestion Service', actionType: 'claim_ingested', description: 'Claim CLM-001 received via passenger portal (PNR ABCDE1)', metadata: { channel: 'web_portal', documentsAttached: 3 }, timestamp: '2026-01-14T09:30:00Z' },
  { id: 'aud-002', claimId: 'CLM-001', actorType: 'ai', actorId: 'ai-ocr', actorName: 'AI OCR Engine v2.4', actionType: 'document_classified', description: 'Classified 3 documents: hotel (96%), food (93%), cab (91%)', metadata: { documentsProcessed: 3, avgConfidence: 93.3 }, timestamp: '2026-01-14T09:31:15Z' },
  { id: 'aud-003', claimId: 'CLM-001', actorType: 'ai', actorId: 'ai-ocr', actorName: 'AI OCR Engine v2.4', actionType: 'document_field_extracted', description: 'Extracted 8 fields from hotel receipt — avg confidence 93%', metadata: { documentId: 'doc-001', fieldsExtracted: 8 }, timestamp: '2026-01-14T09:31:42Z' },
  { id: 'aud-004', claimId: 'CLM-001', actorType: 'ai', actorId: 'ai-ocr', actorName: 'AI OCR Engine v2.4', actionType: 'document_field_extracted', description: 'Extracted 4 fields from cab receipt — low confidence on Amount (USD)', metadata: { documentId: 'doc-003', fieldsExtracted: 4, lowConfidenceFields: ['Amount (USD)'] }, timestamp: '2026-01-14T09:32:05Z' },
  { id: 'aud-005', claimId: 'CLM-001', actorType: 'ai', actorId: 'ai-rules', actorName: 'Rules Engine v1.8', actionType: 'rules_evaluated', description: 'Evaluated 5 business rules against CLM-001', metadata: { rulesEvaluated: 5, passed: 4, failed: 1 }, timestamp: '2026-01-14T09:32:30Z' },
  { id: 'aud-006', claimId: 'CLM-001', actorType: 'system', actorId: 'sys-assign', actorName: 'Auto-Assignment Engine', actionType: 'claim_assigned', description: 'Routed to Priya Sharma — EU261 specialization, load 6/12', afterState: { agentId: 'usr-001', agentName: 'Priya Sharma' }, timestamp: '2026-01-14T09:33:00Z' },
  { id: 'aud-007', claimId: 'CLM-001', actorType: 'system', actorId: 'sys-notify', actorName: 'Notification Service', actionType: 'notification_sent', description: 'Assignment notification sent to Priya Sharma for CLM-001', timestamp: '2026-01-14T09:33:05Z' },

  // ── CLM-002 lifecycle (assigned) ─────────────────────────────────────────────
  { id: 'aud-008', claimId: 'CLM-002', actorType: 'system', actorId: 'sys', actorName: 'Meridian Ingestion Service', actionType: 'claim_ingested', description: 'Claim CLM-002 received via web portal (PNR FGHIJ2)', metadata: { channel: 'web_portal', documentsAttached: 3 }, timestamp: '2026-02-03T16:45:00Z' },
  { id: 'aud-009', claimId: 'CLM-002', actorType: 'ai', actorId: 'ai-ocr', actorName: 'AI OCR Engine v2.4', actionType: 'document_classified', description: 'Classified 3 documents: hotel (98%), food (88%), cab (94%)', metadata: { documentsProcessed: 3, avgConfidence: 93.3 }, timestamp: '2026-02-03T16:46:10Z' },
  { id: 'aud-010', claimId: 'CLM-002', actorType: 'ai', actorId: 'ai-rules', actorName: 'Rules Engine v1.8', actionType: 'rules_evaluated', description: 'Evaluated 5 rules — ATC delay confirmed >300 minutes', metadata: { rulesEvaluated: 5, passed: 5, failed: 0 }, timestamp: '2026-02-03T16:47:00Z' },
  { id: 'aud-011', claimId: 'CLM-002', actorType: 'system', actorId: 'sys-assign', actorName: 'Auto-Assignment Engine', actionType: 'claim_assigned', description: 'Routed to Arjun Patel — domestic/international match', afterState: { agentId: 'usr-002' }, timestamp: '2026-02-03T16:47:30Z' },
  { id: 'aud-012', claimId: 'CLM-002', actorType: 'user', actorId: 'usr-002', actorName: 'Arjun Patel', actionType: 'document_validated', description: 'Agent opened and validated claim documents', timestamp: '2026-02-04T08:10:00Z' },

  // ── CLM-004 full lifecycle (approved) ─────────────────────────────────────────
  { id: 'aud-013', claimId: 'CLM-004', actorType: 'system', actorId: 'sys', actorName: 'Meridian Ingestion Service', actionType: 'claim_ingested', description: 'CLM-004 received via email (PNR PQRST4)', metadata: { channel: 'email', documentsAttached: 3 }, timestamp: '2026-03-05T05:30:00Z' },
  { id: 'aud-014', claimId: 'CLM-004', actorType: 'ai', actorId: 'ai-ocr', actorName: 'AI OCR Engine v2.4', actionType: 'document_classified', description: 'Classified 3 documents: hotel (97%), food (92%), cab (89%)', metadata: { documentsProcessed: 3, avgConfidence: 92.7 }, timestamp: '2026-03-05T05:31:20Z' },
  { id: 'aud-015', claimId: 'CLM-004', actorType: 'ai', actorId: 'ai-rules', actorName: 'Rules Engine v1.8', actionType: 'rules_evaluated', description: 'All 5 rules passed — weather delay, hotel within cap', metadata: { rulesEvaluated: 5, passed: 5, failed: 0 }, timestamp: '2026-03-05T05:32:00Z' },
  { id: 'aud-016', claimId: 'CLM-004', actorType: 'system', actorId: 'sys-assign', actorName: 'Auto-Assignment Engine', actionType: 'claim_assigned', description: 'Assigned to Sarah Chen — high-value claims specialization', afterState: { agentId: 'usr-003' }, timestamp: '2026-03-05T05:32:30Z' },
  { id: 'aud-017', claimId: 'CLM-004', actorType: 'user', actorId: 'usr-003', actorName: 'Sarah Chen', actionType: 'claim_review_started', description: 'Sarah Chen opened CLM-004 for review', timestamp: '2026-03-06T09:00:00Z' },
  { id: 'aud-018', claimId: 'CLM-004', actorType: 'user', actorId: 'usr-003', actorName: 'Sarah Chen', actionType: 'document_validated', description: 'All 3 receipts validated — amounts within policy caps', timestamp: '2026-03-06T10:30:00Z' },
  { id: 'aud-019', claimId: 'CLM-004', actorType: 'user', actorId: 'usr-003', actorName: 'Sarah Chen', actionType: 'authorization_requested', description: 'Submitted for authorization — full approval $316.60 recommended', metadata: { recommendedAmount: 316.60 }, timestamp: '2026-03-06T11:00:00Z' },
  { id: 'aud-020', claimId: 'CLM-004', actorType: 'user', actorId: 'usr-006', actorName: 'Rajesh Menon', actionType: 'authorization_granted', description: 'Full authorization granted $316.60 — NATS advisory verified', afterState: { totalApproved: 316.60, outcome: 'approve_full' }, timestamp: '2026-03-07T10:15:00Z' },
  { id: 'aud-021', claimId: 'CLM-004', actorType: 'user', actorId: 'usr-010', actorName: 'Ananya Gupta', actionType: 'qc_review_started', description: 'QC review initiated for approved claim CLM-004', timestamp: '2026-03-08T09:00:00Z' },
  { id: 'aud-022', claimId: 'CLM-004', actorType: 'user', actorId: 'usr-010', actorName: 'Ananya Gupta', actionType: 'qc_review_submitted', description: 'QC review completed — verdict: compliant. No training flags.', metadata: { verdict: 'compliant', flaggedForTraining: false }, timestamp: '2026-03-08T10:30:00Z' },

  // ── CLM-005 lifecycle (approved partial) ────────────────────────────────────
  { id: 'aud-023', claimId: 'CLM-005', actorType: 'system', actorId: 'sys', actorName: 'Meridian Ingestion Service', actionType: 'claim_ingested', description: 'CLM-005 received via email (PNR UVWXY5)', metadata: { channel: 'email', documentsAttached: 2 }, timestamp: '2026-01-21T01:15:00Z' },
  { id: 'aud-024', claimId: 'CLM-005', actorType: 'ai', actorId: 'ai-ocr', actorName: 'AI OCR Engine v2.4', actionType: 'document_classified', description: 'Classified 2 documents: alternate_carrier (97%), food (85%)', metadata: { documentsProcessed: 2, avgConfidence: 91 }, timestamp: '2026-01-21T01:16:20Z' },
  { id: 'aud-025', claimId: 'CLM-005', actorType: 'ai', actorId: 'ai-rules', actorName: 'Rules Engine v1.8', actionType: 'rules_evaluated', description: 'Rules evaluated: alternate carrier rebooking cap check triggered', metadata: { rulesEvaluated: 5, passed: 4, failed: 1, flaggedRule: 'ALT-CARRIER-CAP' }, timestamp: '2026-01-21T01:17:00Z' },
  { id: 'aud-026', claimId: 'CLM-005', actorType: 'system', actorId: 'sys-assign', actorName: 'Auto-Assignment Engine', actionType: 'claim_assigned', description: 'Assigned to Priya Sharma — international specialization', afterState: { agentId: 'usr-001' }, timestamp: '2026-01-21T01:17:30Z' },
  { id: 'aud-027', claimId: 'CLM-005', actorType: 'user', actorId: 'usr-001', actorName: 'Priya Sharma', actionType: 'authorization_requested', description: 'Submitted for authorization — partial approval $312.00 recommended', metadata: { recommendedAmount: 312.00, totalClaimed: 330.50 }, timestamp: '2026-01-22T14:30:00Z' },
  { id: 'aud-028', claimId: 'CLM-005', actorType: 'user', actorId: 'usr-006', actorName: 'Rajesh Menon', actionType: 'authorization_granted', description: 'Partial authorization granted $312.00 — lounge charge excluded', beforeState: { totalClaimed: 330.50 }, afterState: { totalApproved: 312.00, outcome: 'approve_partial' }, timestamp: '2026-01-24T16:40:00Z' },
  { id: 'aud-029', claimId: 'CLM-005', actorType: 'system', actorId: 'sys-pay', actorName: 'Payment Gateway', actionType: 'payment_initiated', description: 'Payment USD 312.00 initiated to account ending *4421', metadata: { amount: 312.00, paymentRef: 'PAY-2026-00445' }, timestamp: '2026-01-24T17:00:00Z' },
  { id: 'aud-030', claimId: 'CLM-005', actorType: 'user', actorId: 'usr-010', actorName: 'Ananya Gupta', actionType: 'qc_review_submitted', description: 'QC review: compliant. Partial approval well-documented.', metadata: { verdict: 'compliant' }, timestamp: '2026-03-10T11:00:00Z' },

  // ── CLM-006 lifecycle (rejected) ────────────────────────────────────────────
  { id: 'aud-031', claimId: 'CLM-006', actorType: 'system', actorId: 'sys', actorName: 'Meridian Ingestion Service', actionType: 'claim_ingested', description: 'CLM-006 received via mobile app (PNR ZABCD6)', metadata: { channel: 'mobile_app', documentsAttached: 2 }, timestamp: '2026-02-21T08:30:00Z' },
  { id: 'aud-032', claimId: 'CLM-006', actorType: 'ai', actorId: 'ai-ocr', actorName: 'AI OCR Engine v2.4', actionType: 'document_classified', description: 'Classified 2 documents: alternate_carrier (95%), food (90%)', metadata: { documentsProcessed: 2, avgConfidence: 92.5 }, timestamp: '2026-02-21T08:31:10Z' },
  { id: 'aud-033', claimId: 'CLM-006', actorType: 'ai', actorId: 'ai-rules', actorName: 'Rules Engine v1.8', actionType: 'rule_fail', description: 'Rule FAILED: Dual-compensation exclusion — voluntary IDB compensation already accepted at gate', metadata: { ruleId: 'rule-006', voluntaryCompensation: 'INR 10000' }, timestamp: '2026-02-21T08:32:00Z' },
  { id: 'aud-034', claimId: 'CLM-006', actorType: 'system', actorId: 'sys-assign', actorName: 'Auto-Assignment Engine', actionType: 'claim_assigned', description: 'Assigned to Mohammed Al-Rashid — denied_boarding specialization', afterState: { agentId: 'usr-004' }, timestamp: '2026-02-21T08:32:30Z' },
  { id: 'aud-035', claimId: 'CLM-006', actorType: 'user', actorId: 'usr-004', actorName: 'Mohammed Al-Rashid', actionType: 'claim_review_started', description: 'Opened claim for review — dual comp flag noted', timestamp: '2026-02-22T10:00:00Z' },
  { id: 'aud-036', claimId: 'CLM-006', actorType: 'user', actorId: 'usr-004', actorName: 'Mohammed Al-Rashid', actionType: 'authorization_requested', description: 'Submitted for authorization — recommended rejection due to dual-compensation', metadata: { recommendedOutcome: 'reject' }, timestamp: '2026-02-22T14:00:00Z' },
  { id: 'aud-037', claimId: 'CLM-006', actorType: 'user', actorId: 'usr-007', actorName: 'Fatima Hassan', actionType: 'authorization_denied', description: 'Claim rejected — passenger accepted voluntary gate comp, dual-compensation exclusion applies', afterState: { outcome: 'reject' }, timestamp: '2026-02-23T12:00:00Z' },
  { id: 'aud-038', claimId: 'CLM-006', actorType: 'user', actorId: 'usr-010', actorName: 'Ananya Gupta', actionType: 'qc_review_submitted', description: 'QC review: minor_issues — agent initially missed dual-comp cross-check step', metadata: { verdict: 'minor_issues', flaggedForTraining: true }, timestamp: '2026-03-09T14:00:00Z' },
  { id: 'aud-039', claimId: 'CLM-006', actorType: 'user', actorId: 'usr-010', actorName: 'Ananya Gupta', actionType: 'qc_flagged_for_training', description: 'Flagged for training — dual-compensation policy application', metadata: { agentId: 'usr-004', trainingTopic: 'dual_compensation_exclusion' }, timestamp: '2026-03-09T14:05:00Z' },

  // ── CLM-007 lifecycle (returned) ─────────────────────────────────────────────
  { id: 'aud-040', claimId: 'CLM-007', actorType: 'system', actorId: 'sys', actorName: 'Meridian Ingestion Service', actionType: 'claim_ingested', description: 'CLM-007 received via web portal (PNR EFGHI7)', metadata: { channel: 'web_portal', documentsAttached: 3 }, timestamp: '2026-02-10T04:00:00Z' },
  { id: 'aud-041', claimId: 'CLM-007', actorType: 'ai', actorId: 'ai-ocr', actorName: 'AI OCR Engine v2.4', actionType: 'document_classified', description: 'Classified 3 documents: hotel (94%), food (88%), cab (87%) — hotel low clarity', metadata: { documentsProcessed: 3, avgConfidence: 89.7, lowQualityDocs: ['doc-016'] }, timestamp: '2026-02-10T04:01:30Z' },
  { id: 'aud-042', claimId: 'CLM-007', actorType: 'system', actorId: 'sys-assign', actorName: 'Auto-Assignment Engine', actionType: 'claim_assigned', description: 'Assigned to Arjun Patel — available capacity', afterState: { agentId: 'usr-002' }, timestamp: '2026-02-10T04:02:00Z' },
  { id: 'aud-043', claimId: 'CLM-007', actorType: 'user', actorId: 'usr-002', actorName: 'Arjun Patel', actionType: 'claim_review_started', description: 'Opened claim — hotel receipt quality flagged as unacceptable', timestamp: '2026-02-11T09:00:00Z' },
  { id: 'aud-044', claimId: 'CLM-007', actorType: 'user', actorId: 'usr-002', actorName: 'Arjun Patel', actionType: 'claim_returned', description: 'Claim returned — illegible hotel receipt, cab FX unverifiable', afterState: { returnedReason: 'Hotel receipt illegible; cab FX unverifiable without bank statement' }, timestamp: '2026-02-12T09:45:00Z' },
  { id: 'aud-045', claimId: 'CLM-007', actorType: 'system', actorId: 'sys-sla', actorName: 'SLA Monitor', actionType: 'sla_warning', description: 'SLA warning: CLM-007 in returned status — deadline in 48h, passenger yet to resubmit', metadata: { hoursRemaining: 48 }, timestamp: '2026-02-15T04:00:00Z' },

  // ── CLM-008 lifecycle (auto_processed) ───────────────────────────────────────
  { id: 'aud-046', claimId: 'CLM-008', actorType: 'system', actorId: 'sys', actorName: 'Meridian Ingestion Service', actionType: 'claim_ingested', description: 'CLM-008 received via mobile app (PNR JKLMN8)', metadata: { channel: 'mobile_app', documentsAttached: 1 }, timestamp: '2026-03-10T07:15:00Z' },
  { id: 'aud-047', claimId: 'CLM-008', actorType: 'ai', actorId: 'ai-ocr', actorName: 'AI OCR Engine v2.4', actionType: 'document_classified', description: 'Classified 1 document: food (95%)', metadata: { documentsProcessed: 1, avgConfidence: 95 }, timestamp: '2026-03-10T07:15:45Z' },
  { id: 'aud-048', claimId: 'CLM-008', actorType: 'ai', actorId: 'ai-rules', actorName: 'Rules Engine v1.8', actionType: 'rules_evaluated', description: 'Rules evaluated — single receipt below $50, confidence >95%, no fraud flags', metadata: { autoApprovalEligible: true }, timestamp: '2026-03-10T07:16:00Z' },
  { id: 'aud-049', claimId: 'CLM-008', actorType: 'ai', actorId: 'ai-engine', actorName: 'Auto-Processing Engine', actionType: 'claim_auto_processed', description: 'Claim auto-approved $14.90 — all criteria met', afterState: { outcome: 'approve_full', totalApproved: 14.90 }, timestamp: '2026-03-10T07:18:00Z' },
  { id: 'aud-050', claimId: 'CLM-008', actorType: 'system', actorId: 'sys-pay', actorName: 'Payment Gateway', actionType: 'payment_initiated', description: 'Auto-payment USD 14.90 queued for batch processing', metadata: { amount: 14.90, paymentRef: 'PAY-2026-03109' }, timestamp: '2026-03-10T07:18:30Z' },

  // ── CLM-009 lifecycle (pending_authorization) ────────────────────────────────
  { id: 'aud-051', claimId: 'CLM-009', actorType: 'system', actorId: 'sys', actorName: 'Meridian Ingestion Service', actionType: 'claim_ingested', description: 'CLM-009 received — Platinum FF, high-value flagged', metadata: { channel: 'web_portal', highValueFlag: true }, timestamp: '2026-02-15T07:30:00Z' },
  { id: 'aud-052', claimId: 'CLM-009', actorType: 'ai', actorId: 'ai-ocr', actorName: 'AI OCR Engine v2.4', actionType: 'document_classified', description: 'Classified 2 documents: hotel (98%), alternate_carrier (96%)', metadata: { documentsProcessed: 2, avgConfidence: 97 }, timestamp: '2026-02-15T07:31:10Z' },
  { id: 'aud-053', claimId: 'CLM-009', actorType: 'ai', actorId: 'ai-rules', actorName: 'Rules Engine v1.8', actionType: 'rule_fail', description: 'FAILED: Hotel Night Cap — claimed $850/night exceeds $200/night limit', metadata: { ruleId: 'rule-002', claimedRate: 850, cappedRate: 200 }, timestamp: '2026-02-15T07:31:45Z' },
  { id: 'aud-054', claimId: 'CLM-009', actorType: 'system', actorId: 'sys-assign', actorName: 'Auto-Assignment Engine', actionType: 'claim_assigned', description: 'High-value assigned to Sarah Chen — high_value_claims specialization', afterState: { agentId: 'usr-003' }, timestamp: '2026-02-15T07:32:00Z' },
  { id: 'aud-055', claimId: 'CLM-009', actorType: 'user', actorId: 'usr-003', actorName: 'Sarah Chen', actionType: 'document_field_overridden', description: 'Hotel total confirmed $1,938.00 via credit card statement', beforeState: { field: 'Total Amount (USD)', confidence: 97 }, afterState: { overrideReason: 'Confirmed via credit card statement' }, timestamp: '2026-02-17T14:00:00Z' },
  { id: 'aud-056', claimId: 'CLM-009', actorType: 'user', actorId: 'usr-003', actorName: 'Sarah Chen', actionType: 'authorization_requested', description: 'Escalated — hotel rate exceeds cap; senior review required', metadata: { totalClaimed: 2423.00, recommendedApproval: 885.00, exceedsThreshold: true }, timestamp: '2026-02-17T16:20:00Z' },
  { id: 'aud-057', claimId: 'CLM-009', actorType: 'system', actorId: 'sys-sla', actorName: 'SLA Monitor', actionType: 'sla_warning', description: 'SLA warning: CLM-009 pending_authorization 5 days — deadline in 48h', metadata: { hoursRemaining: 48 }, timestamp: '2026-02-20T07:30:00Z' },
  { id: 'aud-058', claimId: 'CLM-009', actorType: 'system', actorId: 'sys-notify', actorName: 'Notification Service', actionType: 'notification_sent', description: 'SLA warning notification sent to Vikram Singh', metadata: { recipientId: 'usr-008' }, timestamp: '2026-02-20T07:30:30Z' },

  // ── CLM-010 lifecycle (unassigned + SLA) ─────────────────────────────────────
  { id: 'aud-059', claimId: 'CLM-010', actorType: 'system', actorId: 'sys', actorName: 'Meridian Ingestion Service', actionType: 'claim_ingested', description: 'CLM-010 received via web portal (PNR TUVWX0)', metadata: { channel: 'web_portal', documentsAttached: 0 }, timestamp: '2026-01-28T10:00:00Z' },
  { id: 'aud-060', claimId: 'CLM-010', actorType: 'ai', actorId: 'ai-rules', actorName: 'Rules Engine v1.8', actionType: 'rules_evaluated', description: 'Evaluated 3 rules — no documents attached, routing to manual queue', metadata: { rulesEvaluated: 3 }, timestamp: '2026-01-28T10:00:30Z' },
  { id: 'aud-061', claimId: 'CLM-010', actorType: 'system', actorId: 'sys-sla', actorName: 'SLA Monitor', actionType: 'sla_warning', description: 'SLA warning: CLM-010 unassigned for 3 days — deadline in 4 days', metadata: { hoursRemaining: 96 }, timestamp: '2026-01-31T10:00:00Z' },

  // ── CLM-016 lifecycle (assigned high-value) ──────────────────────────────────
  { id: 'aud-062', claimId: 'CLM-016', actorType: 'system', actorId: 'sys', actorName: 'Meridian Ingestion Service', actionType: 'claim_ingested', description: 'CLM-016 received — Platinum FF, high-value auto-flag triggered', metadata: { channel: 'web_portal', highValueFlag: true }, timestamp: '2026-02-18T20:00:00Z' },
  { id: 'aud-063', claimId: 'CLM-016', actorType: 'ai', actorId: 'ai-ocr', actorName: 'AI OCR Engine v2.4', actionType: 'document_classified', description: 'Classified 2 documents: hotel (95%), alternate_carrier (96%)', metadata: { documentsProcessed: 2, avgConfidence: 95.5 }, timestamp: '2026-02-18T20:01:15Z' },
  { id: 'aud-064', claimId: 'CLM-016', actorType: 'ai', actorId: 'ai-rules', actorName: 'Rules Engine v1.8', actionType: 'rule_fail', description: 'FAILED: Hotel Night Cap — claimed $420/night exceeds $200/night limit', metadata: { ruleId: 'rule-002', claimedRate: 420, cappedRate: 200 }, timestamp: '2026-02-18T20:02:00Z' },
  { id: 'aud-065', claimId: 'CLM-016', actorType: 'system', actorId: 'sys-assign', actorName: 'Auto-Assignment Engine', actionType: 'claim_assigned', description: 'Assigned to Deepa Nair — EU261 and high-value specialization', afterState: { agentId: 'usr-014' }, timestamp: '2026-02-18T20:02:30Z' },
  { id: 'aud-066', claimId: 'CLM-016', actorType: 'user', actorId: 'usr-014', actorName: 'Deepa Nair', actionType: 'claim_review_started', description: 'Opened CLM-016 — hotel rate review in progress', timestamp: '2026-02-19T09:00:00Z' },

  // ── CLM-026 lifecycle (approved — diversion) ────────────────────────────────
  { id: 'aud-067', claimId: 'CLM-026', actorType: 'system', actorId: 'sys', actorName: 'Meridian Ingestion Service', actionType: 'claim_ingested', description: 'CLM-026 received via email (PNR UVWXY6)', metadata: { channel: 'email', documentsAttached: 2 }, timestamp: '2026-01-11T12:00:00Z' },
  { id: 'aud-068', claimId: 'CLM-026', actorType: 'ai', actorId: 'ai-ocr', actorName: 'AI OCR Engine v2.4', actionType: 'document_classified', description: 'Classified 2 documents: hotel (96%), food (89%)', metadata: { documentsProcessed: 2, avgConfidence: 92.5 }, timestamp: '2026-01-11T12:01:20Z' },
  { id: 'aud-069', claimId: 'CLM-026', actorType: 'ai', actorId: 'ai-rules', actorName: 'Rules Engine v1.8', actionType: 'rules_evaluated', description: 'All rules passed — diversion confirmed, expenses within cap', metadata: { rulesEvaluated: 5, passed: 5 }, timestamp: '2026-01-11T12:02:00Z' },
  { id: 'aud-070', claimId: 'CLM-026', actorType: 'system', actorId: 'sys-assign', actorName: 'Auto-Assignment Engine', actionType: 'claim_assigned', description: 'Assigned to Sneha Reddy — high-value claims, EU261', afterState: { agentId: 'usr-016' }, timestamp: '2026-01-11T12:02:30Z' },
  { id: 'aud-071', claimId: 'CLM-026', actorType: 'user', actorId: 'usr-016', actorName: 'Sneha Reddy', actionType: 'authorization_requested', description: 'Full approval recommended — $206.40', metadata: { recommendedAmount: 206.40 }, timestamp: '2026-01-12T14:00:00Z' },
  { id: 'aud-072', claimId: 'CLM-026', actorType: 'user', actorId: 'usr-006', actorName: 'Rajesh Menon', actionType: 'authorization_granted', description: 'Full authorization granted $206.40', afterState: { totalApproved: 206.40, outcome: 'approve_full' }, timestamp: '2026-01-14T09:00:00Z' },
  { id: 'aud-073', claimId: 'CLM-026', actorType: 'system', actorId: 'sys-pay', actorName: 'Payment Gateway', actionType: 'payment_initiated', description: 'Payment USD 206.40 initiated to account *2233', metadata: { paymentRef: 'PAY-2026-00312' }, timestamp: '2026-01-14T09:15:00Z' },
  { id: 'aud-074', claimId: 'CLM-026', actorType: 'system', actorId: 'sys-pay', actorName: 'Payment Gateway', actionType: 'payment_completed', description: 'Payment USD 206.40 completed successfully', metadata: { paymentRef: 'PAY-2026-00312' }, timestamp: '2026-01-15T10:00:00Z' },

  // ── CLM-029 lifecycle (rejected high-value fraud-flag) ───────────────────────
  { id: 'aud-075', claimId: 'CLM-029', actorType: 'system', actorId: 'sys', actorName: 'Meridian Ingestion Service', actionType: 'claim_ingested', description: 'CLM-029 received — $4,500 claimed, fraud review triggered', metadata: { channel: 'web_portal', fraudFlag: true }, timestamp: '2026-02-19T06:00:00Z' },
  { id: 'aud-076', claimId: 'CLM-029', actorType: 'ai', actorId: 'ai-rules', actorName: 'Rules Engine v1.8', actionType: 'rule_fail', description: 'FAILED: Total Claim Cap — $4,500 exceeds Platinum cap $2,500', metadata: { ruleId: 'rule-005', claimed: 4500, cap: 2500 }, timestamp: '2026-02-19T06:01:00Z' },
  { id: 'aud-077', claimId: 'CLM-029', actorType: 'system', actorId: 'sys-assign', actorName: 'Auto-Assignment Engine', actionType: 'claim_assigned', description: 'High-value fraud-flag assigned to Aisha Khan — high-value specialist', afterState: { agentId: 'usr-019' }, timestamp: '2026-02-19T06:01:30Z' },
  { id: 'aud-078', claimId: 'CLM-029', actorType: 'user', actorId: 'usr-019', actorName: 'Aisha Khan', actionType: 'claim_review_started', description: 'Reviewing claim — Business Class upgrade receipt identified', timestamp: '2026-02-20T09:00:00Z' },
  { id: 'aud-079', claimId: 'CLM-029', actorType: 'user', actorId: 'usr-019', actorName: 'Aisha Khan', actionType: 'authorization_requested', description: 'Recommended rejection — BC upgrade not reimbursable, exceeds cap', metadata: { recommendedOutcome: 'reject' }, timestamp: '2026-02-20T14:00:00Z' },
  { id: 'aud-080', claimId: 'CLM-029', actorType: 'user', actorId: 'usr-007', actorName: 'Fatima Hassan', actionType: 'authorization_denied', description: 'Claim rejected — Business Class upgrade diff $3,200 not reimbursable', afterState: { outcome: 'reject' }, timestamp: '2026-02-21T13:00:00Z' },

  // ── CLM-033 lifecycle (payment_initiated) ────────────────────────────────────
  { id: 'aud-081', claimId: 'CLM-033', actorType: 'system', actorId: 'sys', actorName: 'Meridian Ingestion Service', actionType: 'claim_ingested', description: 'CLM-033 received via mobile app (PNR WXYZA3)', metadata: { channel: 'mobile_app', documentsAttached: 1 }, timestamp: '2026-01-18T05:00:00Z' },
  { id: 'aud-082', claimId: 'CLM-033', actorType: 'ai', actorId: 'ai-ocr', actorName: 'AI OCR Engine v2.4', actionType: 'document_classified', description: 'Classified 1 document: food (94%)', metadata: { documentsProcessed: 1, avgConfidence: 94 }, timestamp: '2026-01-18T05:01:10Z' },
  { id: 'aud-083', claimId: 'CLM-033', actorType: 'ai', actorId: 'ai-rules', actorName: 'Rules Engine v1.8', actionType: 'rules_evaluated', description: 'All rules passed — meal under daily cap', metadata: { rulesEvaluated: 3, passed: 3 }, timestamp: '2026-01-18T05:01:45Z' },
  { id: 'aud-084', claimId: 'CLM-033', actorType: 'system', actorId: 'sys-assign', actorName: 'Auto-Assignment Engine', actionType: 'claim_assigned', description: 'Assigned to Sophie Laurent — multilingual EU261', afterState: { agentId: 'usr-022' }, timestamp: '2026-01-18T05:02:00Z' },
  { id: 'aud-085', claimId: 'CLM-033', actorType: 'user', actorId: 'usr-022', actorName: 'Sophie Laurent', actionType: 'authorization_requested', description: 'Full approval recommended — $35.80', metadata: { recommendedAmount: 35.80 }, timestamp: '2026-01-19T10:00:00Z' },
  { id: 'aud-086', claimId: 'CLM-033', actorType: 'user', actorId: 'usr-006', actorName: 'Rajesh Menon', actionType: 'authorization_granted', description: 'Full authorization granted $35.80', afterState: { totalApproved: 35.80 }, timestamp: '2026-01-20T14:00:00Z' },
  { id: 'aud-087', claimId: 'CLM-033', actorType: 'system', actorId: 'sys-pay', actorName: 'Payment Gateway', actionType: 'payment_initiated', description: 'Payment USD 35.80 initiated to account *7890', metadata: { paymentRef: 'PAY-2026-00389' }, timestamp: '2026-01-21T09:00:00Z' },

  // ── CLM-034 lifecycle (closed) ────────────────────────────────────────────────
  { id: 'aud-088', claimId: 'CLM-034', actorType: 'system', actorId: 'sys', actorName: 'Meridian Ingestion Service', actionType: 'claim_ingested', description: 'CLM-034 received via web portal (PNR BCDEF4)', metadata: { channel: 'web_portal', documentsAttached: 2 }, timestamp: '2026-01-03T09:00:00Z' },
  { id: 'aud-089', claimId: 'CLM-034', actorType: 'ai', actorId: 'ai-ocr', actorName: 'AI OCR Engine v2.4', actionType: 'document_classified', description: 'Classified 2 documents: hotel (96%), cab (90%)', metadata: { documentsProcessed: 2, avgConfidence: 93 }, timestamp: '2026-01-03T09:01:15Z' },
  { id: 'aud-090', claimId: 'CLM-034', actorType: 'system', actorId: 'sys-assign', actorName: 'Auto-Assignment Engine', actionType: 'claim_assigned', description: 'Assigned to Priya Sharma — GCC routes', afterState: { agentId: 'usr-001' }, timestamp: '2026-01-03T09:02:00Z' },
  { id: 'aud-091', claimId: 'CLM-034', actorType: 'user', actorId: 'usr-001', actorName: 'Priya Sharma', actionType: 'authorization_requested', description: 'Partial approval recommended — meal over daily cap', metadata: { recommendedAmount: 212.30 }, timestamp: '2026-01-05T11:00:00Z' },
  { id: 'aud-092', claimId: 'CLM-034', actorType: 'user', actorId: 'usr-006', actorName: 'Rajesh Menon', actionType: 'authorization_granted', description: 'Partial authorization granted $212.30', afterState: { totalApproved: 212.30 }, timestamp: '2026-01-07T10:00:00Z' },
  { id: 'aud-093', claimId: 'CLM-034', actorType: 'system', actorId: 'sys-pay', actorName: 'Payment Gateway', actionType: 'payment_completed', description: 'Payment AED 779.40 (USD 212.30) completed', metadata: { paymentRef: 'PAY-2026-00198' }, timestamp: '2026-01-08T08:00:00Z' },
  { id: 'aud-094', claimId: 'CLM-034', actorType: 'system', actorId: 'sys', actorName: 'Meridian Platform', actionType: 'claim_closed', description: 'Claim CLM-034 closed — payment completed, no further action', timestamp: '2026-01-08T14:00:00Z' },

  // ── CLM-032 lifecycle (auto_processed) ──────────────────────────────────────
  { id: 'aud-095', claimId: 'CLM-032', actorType: 'system', actorId: 'sys', actorName: 'Meridian Ingestion Service', actionType: 'claim_ingested', description: 'CLM-032 received — zero expenses, disruption <2h', metadata: { channel: 'web_portal', documentsAttached: 1 }, timestamp: '2026-01-03T08:30:00Z' },
  { id: 'aud-096', claimId: 'CLM-032', actorType: 'ai', actorId: 'ai-engine', actorName: 'Auto-Processing Engine', actionType: 'claim_auto_processed', description: 'Auto-closed: disruption <2h, no reimbursable expenses, boarding pass only', afterState: { outcome: 'approve_full', totalApproved: 0 }, timestamp: '2026-01-03T08:32:00Z' },
];


// ─────────────────────────────────────────────────────────────────────────────
// Business Rules — 8 rules
// ─────────────────────────────────────────────────────────────────────────────

export const mockBusinessRules: BusinessRule[] = [
  {
    id: 'rule-001',
    name: 'EU261 Compensation Entitlement',
    version: '2.1',
    conditions: {
      jurisdiction: 'EU',
      disruptionTypes: ['delay', 'cancellation', 'denied_boarding'],
      delayThresholdMinutes: 180,
      routeTypes: ['intra_EU', 'departing_EU'],
    },
    actions: {
      compensationType: 'fixed',
      amounts: { short_haul_lt1500km: 250, medium_haul_1500_3500km: 400, long_haul_gt3500km: 600 },
      currency: 'EUR',
      notes: 'EC Regulation 261/2004 — fixed compensation, extraordinary circumstances exemption applies',
    },
    status: 'active',
    createdBy: 'usr-008',
    effectiveFrom: '2025-01-01T00:00:00Z',
    effectiveTo: '2027-12-31T23:59:59Z',
  },
  {
    id: 'rule-002',
    name: 'DOT Air Passenger Compensation',
    version: '1.2',
    conditions: {
      jurisdiction: 'US',
      disruptionTypes: ['denied_boarding'],
      carrierType: ['US_carrier', 'operating_in_US'],
    },
    actions: {
      compensationType: 'fixed',
      amounts: { delay_lt2h: 775, delay_gt2h: 1550 },
      currency: 'USD',
      notes: 'DOT 14 CFR Part 250 — involuntary denied boarding, must offer alternate transport',
    },
    status: 'active',
    createdBy: 'usr-008',
    effectiveFrom: '2025-03-01T00:00:00Z',
    effectiveTo: '2027-12-31T23:59:59Z',
  },
  {
    id: 'rule-003',
    name: 'Hotel Accommodation Cap',
    version: '1.3',
    conditions: {
      expenseCategory: 'hotel',
      applicableDisruptions: ['delay', 'cancellation', 'diversion'],
      minDelayMinutes: 240,
    },
    actions: {
      maxRatePerNight: 200,
      currency: 'USD',
      maxNights: 2,
      requiresReceipt: true,
      notes: 'Reimbursement capped at USD 200/night × 2 nights. Excess at passenger expense.',
    },
    status: 'active',
    createdBy: 'usr-008',
    effectiveFrom: '2025-06-01T00:00:00Z',
    effectiveTo: '2027-12-31T23:59:59Z',
  },
  {
    id: 'rule-004',
    name: 'Meal Expense Cap',
    version: '1.1',
    conditions: {
      expenseCategory: 'food',
      applicableDisruptions: ['delay', 'cancellation', 'diversion', 'denied_boarding'],
      minDelayMinutes: 120,
    },
    actions: {
      maxPerMeal: 25,
      maxPerDay: 75,
      currency: 'USD',
      maxMealsPerDelay: 3,
      requiresReceipt: true,
    },
    status: 'active',
    createdBy: 'usr-009',
    effectiveFrom: '2025-06-01T00:00:00Z',
    effectiveTo: '2027-12-31T23:59:59Z',
  },
  {
    id: 'rule-005',
    name: 'Transport / Cab Cap',
    version: '1.0',
    conditions: {
      expenseCategory: 'cab',
      applicableDisruptions: ['delay', 'cancellation', 'diversion', 'denied_boarding'],
    },
    actions: {
      maxPerTrip: 40,
      maxTotalPerClaim: 80,
      currency: 'USD',
      requiresReceipt: true,
      notes: 'Covers airport-hotel or airport-airport transfers. Personal trips excluded.',
    },
    status: 'active',
    createdBy: 'usr-009',
    effectiveFrom: '2025-06-01T00:00:00Z',
    effectiveTo: '2027-12-31T23:59:59Z',
  },
  {
    id: 'rule-006',
    name: 'Alternate Carrier Rebooking Limit',
    version: '1.5',
    conditions: {
      expenseCategory: 'alternate_carrier',
      applicableDisruptions: ['cancellation', 'denied_boarding'],
      passengerInitiated: false,
    },
    actions: {
      maxReimbursement: 500,
      currency: 'USD',
      eligibilityCriteria: 'Economy class on comparable route within 24 hours',
      exclusions: ['business_class_upgrade', 'lounge_access', 'seat_selection_fees'],
    },
    status: 'active',
    createdBy: 'usr-006',
    effectiveFrom: '2025-01-01T00:00:00Z',
    effectiveTo: '2027-12-31T23:59:59Z',
  },
  {
    id: 'rule-007',
    name: 'Total Claim Reimbursement Cap',
    version: '2.0',
    conditions: {
      applicableDisruptions: ['delay', 'cancellation', 'diversion', 'denied_boarding'],
      ffTiers: ['None', 'Silver'],
    },
    actions: {
      maxTotalReimbursement: 800,
      currency: 'USD',
      overrideForTiers: { Gold: 1200, Platinum: 2500 },
      authorizationRequired: true,
      authorizationThreshold: 500,
    },
    status: 'active',
    createdBy: 'usr-008',
    effectiveFrom: '2025-01-01T00:00:00Z',
    effectiveTo: '2027-12-31T23:59:59Z',
  },
  {
    id: 'rule-008',
    name: 'Fraud Detection Threshold',
    version: '1.1',
    conditions: {
      applicableDisruptions: ['delay', 'cancellation', 'diversion', 'denied_boarding'],
      confidenceThreshold: 60,
      anomalySignals: ['duplicate_receipt', 'amount_mismatch', 'date_mismatch', 'inflated_value'],
    },
    actions: {
      autoRejectBelowConfidence: 40,
      manualReviewBetween: [40, 60],
      fraudFlagThreshold: 0.8,
      escalateTo: 'authorization_officer',
      notes: 'Claims with AI confidence <40% or 2+ anomaly signals escalated for fraud review.',
    },
    status: 'active',
    createdBy: 'usr-007',
    effectiveFrom: '2025-09-01T00:00:00Z',
    effectiveTo: '2027-12-31T23:59:59Z',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Rule Evaluations — 40+ evaluations
// ─────────────────────────────────────────────────────────────────────────────

export const mockRuleEvaluations: RuleEvaluation[] = [
  // CLM-001
  { id: 're-001', claimId: 'CLM-001', ruleId: 'rule-001', ruleName: 'EU261 Compensation Entitlement', result: 'fail', calculatedAmount: 0, timestamp: '2026-01-14T09:32:30Z' },
  { id: 're-002', claimId: 'CLM-001', ruleId: 'rule-003', ruleName: 'Hotel Accommodation Cap', result: 'pass', calculatedAmount: 200.00, timestamp: '2026-01-14T09:32:30Z' },
  { id: 're-003', claimId: 'CLM-001', ruleId: 'rule-004', ruleName: 'Meal Expense Cap', result: 'pass', calculatedAmount: 48.50, timestamp: '2026-01-14T09:32:30Z' },
  { id: 're-004', claimId: 'CLM-001', ruleId: 'rule-005', ruleName: 'Transport / Cab Cap', result: 'pass', calculatedAmount: 12.40, timestamp: '2026-01-14T09:32:30Z' },
  { id: 're-005', claimId: 'CLM-001', ruleId: 'rule-007', ruleName: 'Total Claim Reimbursement Cap', result: 'pass', calculatedAmount: 268.10, timestamp: '2026-01-14T09:32:30Z' },
  // CLM-002
  { id: 're-006', claimId: 'CLM-002', ruleId: 'rule-003', ruleName: 'Hotel Accommodation Cap', result: 'pass', calculatedAmount: 200.00, timestamp: '2026-02-03T16:47:00Z' },
  { id: 're-007', claimId: 'CLM-002', ruleId: 'rule-004', ruleName: 'Meal Expense Cap', result: 'pass', calculatedAmount: 46.25, timestamp: '2026-02-03T16:47:00Z' },
  { id: 're-008', claimId: 'CLM-002', ruleId: 'rule-005', ruleName: 'Transport / Cab Cap', result: 'pass', calculatedAmount: 20.90, timestamp: '2026-02-03T16:47:00Z' },
  { id: 're-009', claimId: 'CLM-002', ruleId: 'rule-007', ruleName: 'Total Claim Reimbursement Cap', result: 'pass', calculatedAmount: 334.65, timestamp: '2026-02-03T16:47:00Z' },
  // CLM-003
  { id: 're-010', claimId: 'CLM-003', ruleId: 'rule-003', ruleName: 'Hotel Accommodation Cap', result: 'pass', calculatedAmount: 95.00, timestamp: '2026-02-28T07:01:00Z' },
  { id: 're-011', claimId: 'CLM-003', ruleId: 'rule-004', ruleName: 'Meal Expense Cap', result: 'pass', calculatedAmount: 38.00, timestamp: '2026-02-28T07:01:00Z' },
  { id: 're-012', claimId: 'CLM-003', ruleId: 'rule-007', ruleName: 'Total Claim Reimbursement Cap', result: 'pass', calculatedAmount: 147.25, timestamp: '2026-02-28T07:01:00Z' },
  // CLM-004
  { id: 're-013', claimId: 'CLM-004', ruleId: 'rule-003', ruleName: 'Hotel Accommodation Cap', result: 'pass', calculatedAmount: 200.00, timestamp: '2026-03-05T05:32:00Z' },
  { id: 're-014', claimId: 'CLM-004', ruleId: 'rule-004', ruleName: 'Meal Expense Cap', result: 'pass', calculatedAmount: 18.30, timestamp: '2026-03-05T05:32:00Z' },
  { id: 're-015', claimId: 'CLM-004', ruleId: 'rule-005', ruleName: 'Transport / Cab Cap', result: 'pass', calculatedAmount: 12.00, timestamp: '2026-03-05T05:32:00Z' },
  { id: 're-016', claimId: 'CLM-004', ruleId: 'rule-007', ruleName: 'Total Claim Reimbursement Cap', result: 'pass', calculatedAmount: 316.60, timestamp: '2026-03-05T05:32:00Z' },
  // CLM-005
  { id: 're-017', claimId: 'CLM-005', ruleId: 'rule-006', ruleName: 'Alternate Carrier Rebooking Limit', result: 'pass', calculatedAmount: 312.00, timestamp: '2026-01-21T01:17:00Z' },
  { id: 're-018', claimId: 'CLM-005', ruleId: 'rule-004', ruleName: 'Meal Expense Cap', result: 'pass', calculatedAmount: 18.50, timestamp: '2026-01-21T01:17:00Z' },
  { id: 're-019', claimId: 'CLM-005', ruleId: 'rule-007', ruleName: 'Total Claim Reimbursement Cap', result: 'pass', calculatedAmount: 330.50, timestamp: '2026-01-21T01:17:00Z' },
  // CLM-006
  { id: 're-020', claimId: 'CLM-006', ruleId: 'rule-006', ruleName: 'Alternate Carrier Rebooking Limit', result: 'pass', calculatedAmount: 101.50, timestamp: '2026-02-21T08:32:00Z' },
  { id: 're-021', claimId: 'CLM-006', ruleId: 'rule-008', ruleName: 'Fraud Detection Threshold', result: 'fail', calculatedAmount: 0, timestamp: '2026-02-21T08:32:00Z' },
  // CLM-007
  { id: 're-022', claimId: 'CLM-007', ruleId: 'rule-003', ruleName: 'Hotel Accommodation Cap', result: 'pass', calculatedAmount: 175.00, timestamp: '2026-02-10T04:02:00Z' },
  { id: 're-023', claimId: 'CLM-007', ruleId: 'rule-004', ruleName: 'Meal Expense Cap', result: 'pass', calculatedAmount: 45.00, timestamp: '2026-02-10T04:02:00Z' },
  { id: 're-024', claimId: 'CLM-007', ruleId: 'rule-005', ruleName: 'Transport / Cab Cap', result: 'pass', calculatedAmount: 21.50, timestamp: '2026-02-10T04:02:00Z' },
  // CLM-008
  { id: 're-025', claimId: 'CLM-008', ruleId: 'rule-004', ruleName: 'Meal Expense Cap', result: 'pass', calculatedAmount: 14.90, timestamp: '2026-03-10T07:16:00Z' },
  { id: 're-026', claimId: 'CLM-008', ruleId: 'rule-007', ruleName: 'Total Claim Reimbursement Cap', result: 'pass', calculatedAmount: 14.90, timestamp: '2026-03-10T07:16:00Z' },
  // CLM-009
  { id: 're-027', claimId: 'CLM-009', ruleId: 'rule-003', ruleName: 'Hotel Accommodation Cap', result: 'fail', calculatedAmount: 400.00, timestamp: '2026-02-15T07:31:45Z' },
  { id: 're-028', claimId: 'CLM-009', ruleId: 'rule-006', ruleName: 'Alternate Carrier Rebooking Limit', result: 'pass', calculatedAmount: 485.00, timestamp: '2026-02-15T07:31:45Z' },
  { id: 're-029', claimId: 'CLM-009', ruleId: 'rule-007', ruleName: 'Total Claim Reimbursement Cap', result: 'fail', calculatedAmount: 2500.00, timestamp: '2026-02-15T07:31:45Z' },
  // CLM-013
  { id: 're-030', claimId: 'CLM-013', ruleId: 'rule-001', ruleName: 'EU261 Compensation Entitlement', result: 'pass', calculatedAmount: 400.00, timestamp: '2026-02-08T06:02:00Z' },
  { id: 're-031', claimId: 'CLM-013', ruleId: 'rule-003', ruleName: 'Hotel Accommodation Cap', result: 'pass', calculatedAmount: 200.00, timestamp: '2026-02-08T06:02:00Z' },
  { id: 're-032', claimId: 'CLM-013', ruleId: 'rule-004', ruleName: 'Meal Expense Cap', result: 'pass', calculatedAmount: 41.60, timestamp: '2026-02-08T06:02:00Z' },
  // CLM-016
  { id: 're-033', claimId: 'CLM-016', ruleId: 'rule-003', ruleName: 'Hotel Accommodation Cap', result: 'fail', calculatedAmount: 200.00, timestamp: '2026-02-18T20:02:00Z' },
  { id: 're-034', claimId: 'CLM-016', ruleId: 'rule-006', ruleName: 'Alternate Carrier Rebooking Limit', result: 'pass', calculatedAmount: 378.00, timestamp: '2026-02-18T20:02:00Z' },
  { id: 're-035', claimId: 'CLM-016', ruleId: 'rule-007', ruleName: 'Total Claim Reimbursement Cap', result: 'pass', calculatedAmount: 578.00, timestamp: '2026-02-18T20:02:00Z' },
  // CLM-026
  { id: 're-036', claimId: 'CLM-026', ruleId: 'rule-003', ruleName: 'Hotel Accommodation Cap', result: 'pass', calculatedAmount: 158.00, timestamp: '2026-01-11T12:02:00Z' },
  { id: 're-037', claimId: 'CLM-026', ruleId: 'rule-004', ruleName: 'Meal Expense Cap', result: 'pass', calculatedAmount: 24.70, timestamp: '2026-01-11T12:02:00Z' },
  { id: 're-038', claimId: 'CLM-026', ruleId: 'rule-007', ruleName: 'Total Claim Reimbursement Cap', result: 'pass', calculatedAmount: 206.40, timestamp: '2026-01-11T12:02:00Z' },
  // CLM-029
  { id: 're-039', claimId: 'CLM-029', ruleId: 'rule-007', ruleName: 'Total Claim Reimbursement Cap', result: 'fail', calculatedAmount: 2500.00, timestamp: '2026-02-19T06:01:00Z' },
  { id: 're-040', claimId: 'CLM-029', ruleId: 'rule-008', ruleName: 'Fraud Detection Threshold', result: 'fail', calculatedAmount: 0, timestamp: '2026-02-19T06:01:00Z' },
  // CLM-034
  { id: 're-041', claimId: 'CLM-034', ruleId: 'rule-003', ruleName: 'Hotel Accommodation Cap', result: 'pass', calculatedAmount: 200.00, timestamp: '2026-01-03T09:02:00Z' },
  { id: 're-042', claimId: 'CLM-034', ruleId: 'rule-005', ruleName: 'Transport / Cab Cap', result: 'pass', calculatedAmount: 17.70, timestamp: '2026-01-03T09:02:00Z' },
  { id: 're-043', claimId: 'CLM-034', ruleId: 'rule-007', ruleName: 'Total Claim Reimbursement Cap', result: 'pass', calculatedAmount: 212.30, timestamp: '2026-01-03T09:02:00Z' },

  // CLM-010 (unassigned — rules evaluated, no docs)
  { id: 're-044', claimId: 'CLM-010', ruleId: 'rule-001', ruleName: 'EU261 Compensation Entitlement', result: 'fail', calculatedAmount: 0, timestamp: '2026-01-28T10:00:30Z' },
  { id: 're-045', claimId: 'CLM-010', ruleId: 'rule-007', ruleName: 'Total Claim Reimbursement Cap', result: 'pass', calculatedAmount: 640.00, timestamp: '2026-01-28T10:00:30Z' },
  { id: 're-046', claimId: 'CLM-010', ruleId: 'rule-008', ruleName: 'Fraud Detection Threshold', result: 'pass', calculatedAmount: 0, timestamp: '2026-01-28T10:00:30Z' },

  // CLM-011 (unassigned — tech delay, hotel + food)
  { id: 're-047', claimId: 'CLM-011', ruleId: 'rule-003', ruleName: 'Hotel Accommodation Cap', result: 'pass', calculatedAmount: 195.00, timestamp: '2026-01-05T07:52:00Z' },
  { id: 're-048', claimId: 'CLM-011', ruleId: 'rule-004', ruleName: 'Meal Expense Cap', result: 'pass', calculatedAmount: 42.05, timestamp: '2026-01-05T07:52:00Z' },
  { id: 're-049', claimId: 'CLM-011', ruleId: 'rule-005', ruleName: 'Transport / Cab Cap', result: 'pass', calculatedAmount: 27.00, timestamp: '2026-01-05T07:52:00Z' },
  { id: 're-050', claimId: 'CLM-011', ruleId: 'rule-007', ruleName: 'Total Claim Reimbursement Cap', result: 'pass', calculatedAmount: 264.05, timestamp: '2026-01-05T07:52:00Z' },

  // CLM-012 (unassigned — ATC delay, hotel + food)
  { id: 're-051', claimId: 'CLM-012', ruleId: 'rule-003', ruleName: 'Hotel Accommodation Cap', result: 'pass', calculatedAmount: 155.00, timestamp: '2026-01-17T21:07:00Z' },
  { id: 're-052', claimId: 'CLM-012', ruleId: 'rule-004', ruleName: 'Meal Expense Cap', result: 'pass', calculatedAmount: 32.00, timestamp: '2026-01-17T21:07:00Z' },
  { id: 're-053', claimId: 'CLM-012', ruleId: 'rule-007', ruleName: 'Total Claim Reimbursement Cap', result: 'pass', calculatedAmount: 204.00, timestamp: '2026-01-17T21:07:00Z' },
  { id: 're-054', claimId: 'CLM-012', ruleId: 'rule-008', ruleName: 'Fraud Detection Threshold', result: 'pass', calculatedAmount: 0, timestamp: '2026-01-17T21:07:00Z' },

  // CLM-014 (unassigned — cancellation, hotel + alternate carrier + food)
  { id: 're-055', claimId: 'CLM-014', ruleId: 'rule-006', ruleName: 'Alternate Carrier Rebooking Limit', result: 'pass', calculatedAmount: 420.00, timestamp: '2026-02-13T00:07:00Z' },
  { id: 're-056', claimId: 'CLM-014', ruleId: 'rule-003', ruleName: 'Hotel Accommodation Cap', result: 'fail', calculatedAmount: 200.00, timestamp: '2026-02-13T00:07:00Z' },
  { id: 're-057', claimId: 'CLM-014', ruleId: 'rule-004', ruleName: 'Meal Expense Cap', result: 'pass', calculatedAmount: 38.00, timestamp: '2026-02-13T00:07:00Z' },
  { id: 're-058', claimId: 'CLM-014', ruleId: 'rule-007', ruleName: 'Total Claim Reimbursement Cap', result: 'pass', calculatedAmount: 658.00, timestamp: '2026-02-13T00:07:00Z' },

  // CLM-015 (assigned — cancellation, hotel + food + cab)
  { id: 're-059', claimId: 'CLM-015', ruleId: 'rule-003', ruleName: 'Hotel Accommodation Cap', result: 'pass', calculatedAmount: 185.00, timestamp: '2026-02-13T02:02:00Z' },
  { id: 're-060', claimId: 'CLM-015', ruleId: 'rule-004', ruleName: 'Meal Expense Cap', result: 'pass', calculatedAmount: 48.30, timestamp: '2026-02-13T02:02:00Z' },
  { id: 're-061', claimId: 'CLM-015', ruleId: 'rule-005', ruleName: 'Transport / Cab Cap', result: 'pass', calculatedAmount: 38.00, timestamp: '2026-02-13T02:02:00Z' },
  { id: 're-062', claimId: 'CLM-015', ruleId: 'rule-007', ruleName: 'Total Claim Reimbursement Cap', result: 'pass', calculatedAmount: 271.30, timestamp: '2026-02-13T02:02:00Z' },

  // CLM-017 (in_review — crew delay, hotel + food + cab)
  { id: 're-063', claimId: 'CLM-017', ruleId: 'rule-003', ruleName: 'Hotel Accommodation Cap', result: 'pass', calculatedAmount: 145.00, timestamp: '2026-02-24T14:03:00Z' },
  { id: 're-064', claimId: 'CLM-017', ruleId: 'rule-004', ruleName: 'Meal Expense Cap', result: 'pass', calculatedAmount: 38.25, timestamp: '2026-02-24T14:03:00Z' },
  { id: 're-065', claimId: 'CLM-017', ruleId: 'rule-005', ruleName: 'Transport / Cab Cap', result: 'pass', calculatedAmount: 20.00, timestamp: '2026-02-24T14:03:00Z' },
  { id: 're-066', claimId: 'CLM-017', ruleId: 'rule-007', ruleName: 'Total Claim Reimbursement Cap', result: 'pass', calculatedAmount: 203.25, timestamp: '2026-02-24T14:03:00Z' },
  { id: 're-067', claimId: 'CLM-017', ruleId: 'rule-008', ruleName: 'Fraud Detection Threshold', result: 'pass', calculatedAmount: 0, timestamp: '2026-02-24T14:03:00Z' },

  // CLM-018 (in_review — minor delay, hotel + food)
  { id: 're-068', claimId: 'CLM-018', ruleId: 'rule-003', ruleName: 'Hotel Accommodation Cap', result: 'pass', calculatedAmount: 138.00, timestamp: '2026-03-02T06:03:00Z' },
  { id: 're-069', claimId: 'CLM-018', ruleId: 'rule-004', ruleName: 'Meal Expense Cap', result: 'pass', calculatedAmount: 28.30, timestamp: '2026-03-02T06:03:00Z' },
  { id: 're-070', claimId: 'CLM-018', ruleId: 'rule-007', ruleName: 'Total Claim Reimbursement Cap', result: 'pass', calculatedAmount: 176.30, timestamp: '2026-03-02T06:03:00Z' },

  // CLM-019 (in_review — tech delay, food only small claim)
  { id: 're-071', claimId: 'CLM-019', ruleId: 'rule-004', ruleName: 'Meal Expense Cap', result: 'pass', calculatedAmount: 24.50, timestamp: '2026-03-07T11:33:00Z' },
  { id: 're-072', claimId: 'CLM-019', ruleId: 'rule-007', ruleName: 'Total Claim Reimbursement Cap', result: 'pass', calculatedAmount: 24.50, timestamp: '2026-03-07T11:33:00Z' },
  { id: 're-073', claimId: 'CLM-019', ruleId: 'rule-008', ruleName: 'Fraud Detection Threshold', result: 'pass', calculatedAmount: 0, timestamp: '2026-03-07T11:33:00Z' },

  // CLM-020 (validation_complete — ATC delay, hotel + food + cab)
  { id: 're-074', claimId: 'CLM-020', ruleId: 'rule-003', ruleName: 'Hotel Accommodation Cap', result: 'pass', calculatedAmount: 160.00, timestamp: '2026-03-13T12:03:00Z' },
  { id: 're-075', claimId: 'CLM-020', ruleId: 'rule-004', ruleName: 'Meal Expense Cap', result: 'pass', calculatedAmount: 35.10, timestamp: '2026-03-13T12:03:00Z' },
  { id: 're-076', claimId: 'CLM-020', ruleId: 'rule-005', ruleName: 'Transport / Cab Cap', result: 'pass', calculatedAmount: 12.00, timestamp: '2026-03-13T12:03:00Z' },
  { id: 're-077', claimId: 'CLM-020', ruleId: 'rule-007', ruleName: 'Total Claim Reimbursement Cap', result: 'pass', calculatedAmount: 207.10, timestamp: '2026-03-13T12:03:00Z' },

  // CLM-021 (validation_complete — cancellation, food + boarding pass)
  { id: 're-078', claimId: 'CLM-021', ruleId: 'rule-004', ruleName: 'Meal Expense Cap', result: 'pass', calculatedAmount: 38.90, timestamp: '2025-12-21T06:03:00Z' },
  { id: 're-079', claimId: 'CLM-021', ruleId: 'rule-007', ruleName: 'Total Claim Reimbursement Cap', result: 'pass', calculatedAmount: 38.90, timestamp: '2025-12-21T06:03:00Z' },
  { id: 're-080', claimId: 'CLM-021', ruleId: 'rule-008', ruleName: 'Fraud Detection Threshold', result: 'pass', calculatedAmount: 0, timestamp: '2025-12-21T06:03:00Z' },

  // CLM-022 (validation_complete — cancellation, alternate carrier + hotel + food)
  { id: 're-081', claimId: 'CLM-022', ruleId: 'rule-006', ruleName: 'Alternate Carrier Rebooking Limit', result: 'pass', calculatedAmount: 260.00, timestamp: '2025-12-31T22:03:00Z' },
  { id: 're-082', claimId: 'CLM-022', ruleId: 'rule-004', ruleName: 'Meal Expense Cap', result: 'pass', calculatedAmount: 30.40, timestamp: '2025-12-31T22:03:00Z' },
  { id: 're-083', claimId: 'CLM-022', ruleId: 'rule-005', ruleName: 'Transport / Cab Cap', result: 'pass', calculatedAmount: 18.00, timestamp: '2025-12-31T22:03:00Z' },
  { id: 're-084', claimId: 'CLM-022', ruleId: 'rule-007', ruleName: 'Total Claim Reimbursement Cap', result: 'pass', calculatedAmount: 308.40, timestamp: '2025-12-31T22:03:00Z' },

  // CLM-023 (pending_authorization — ground handling, hotel + food + cab EU)
  { id: 're-085', claimId: 'CLM-023', ruleId: 'rule-001', ruleName: 'EU261 Compensation Entitlement', result: 'pass', calculatedAmount: 400.00, timestamp: '2026-02-08T07:03:00Z' },
  { id: 're-086', claimId: 'CLM-023', ruleId: 'rule-003', ruleName: 'Hotel Accommodation Cap', result: 'pass', calculatedAmount: 185.00, timestamp: '2026-02-08T07:03:00Z' },
  { id: 're-087', claimId: 'CLM-023', ruleId: 'rule-004', ruleName: 'Meal Expense Cap', result: 'pass', calculatedAmount: 39.60, timestamp: '2026-02-08T07:03:00Z' },
  { id: 're-088', claimId: 'CLM-023', ruleId: 'rule-007', ruleName: 'Total Claim Reimbursement Cap', result: 'pass', calculatedAmount: 246.60, timestamp: '2026-02-08T07:03:00Z' },

  // CLM-024 (pending_authorization — monsoon delay, hotel + food)
  { id: 're-089', claimId: 'CLM-024', ruleId: 'rule-003', ruleName: 'Hotel Accommodation Cap', result: 'pass', calculatedAmount: 95.00, timestamp: '2025-12-27T00:33:00Z' },
  { id: 're-090', claimId: 'CLM-024', ruleId: 'rule-004', ruleName: 'Meal Expense Cap', result: 'pass', calculatedAmount: 33.95, timestamp: '2025-12-27T00:33:00Z' },
  { id: 're-091', claimId: 'CLM-024', ruleId: 'rule-007', ruleName: 'Total Claim Reimbursement Cap', result: 'pass', calculatedAmount: 128.95, timestamp: '2025-12-27T00:33:00Z' },
  { id: 're-092', claimId: 'CLM-024', ruleId: 'rule-008', ruleName: 'Fraud Detection Threshold', result: 'pass', calculatedAmount: 0, timestamp: '2025-12-27T00:33:00Z' },

  // CLM-025 (approved — cancellation, food + boarding pass)
  { id: 're-093', claimId: 'CLM-025', ruleId: 'rule-004', ruleName: 'Meal Expense Cap', result: 'pass', calculatedAmount: 80.00, timestamp: '2025-12-21T09:03:00Z' },
  { id: 're-094', claimId: 'CLM-025', ruleId: 'rule-007', ruleName: 'Total Claim Reimbursement Cap', result: 'pass', calculatedAmount: 80.00, timestamp: '2025-12-21T09:03:00Z' },
  { id: 're-095', claimId: 'CLM-025', ruleId: 'rule-008', ruleName: 'Fraud Detection Threshold', result: 'pass', calculatedAmount: 0, timestamp: '2025-12-21T09:03:00Z' },

  // CLM-027 (approved — denied boarding, food + id_document)
  { id: 're-096', claimId: 'CLM-027', ruleId: 'rule-002', ruleName: 'DOT Air Passenger Compensation', result: 'fail', calculatedAmount: 0, timestamp: '2026-02-02T08:03:00Z' },
  { id: 're-097', claimId: 'CLM-027', ruleId: 'rule-004', ruleName: 'Meal Expense Cap', result: 'pass', calculatedAmount: 41.00, timestamp: '2026-02-02T08:03:00Z' },
  { id: 're-098', claimId: 'CLM-027', ruleId: 'rule-007', ruleName: 'Total Claim Reimbursement Cap', result: 'pass', calculatedAmount: 41.00, timestamp: '2026-02-02T08:03:00Z' },
  { id: 're-099', claimId: 'CLM-027', ruleId: 'rule-008', ruleName: 'Fraud Detection Threshold', result: 'pass', calculatedAmount: 0, timestamp: '2026-02-02T08:03:00Z' },

  // CLM-028 (approved partial — ground handling, hotel + food + cab)
  { id: 're-100', claimId: 'CLM-028', ruleId: 'rule-001', ruleName: 'EU261 Compensation Entitlement', result: 'pass', calculatedAmount: 400.00, timestamp: '2026-02-08T08:33:00Z' },
  { id: 're-101', claimId: 'CLM-028', ruleId: 'rule-003', ruleName: 'Hotel Accommodation Cap', result: 'pass', calculatedAmount: 185.00, timestamp: '2026-02-08T08:33:00Z' },
  { id: 're-102', claimId: 'CLM-028', ruleId: 'rule-004', ruleName: 'Meal Expense Cap', result: 'fail', calculatedAmount: 25.00, timestamp: '2026-02-08T08:33:00Z' },
  { id: 're-103', claimId: 'CLM-028', ruleId: 'rule-005', ruleName: 'Transport / Cab Cap', result: 'pass', calculatedAmount: 29.50, timestamp: '2026-02-08T08:33:00Z' },
  { id: 're-104', claimId: 'CLM-028', ruleId: 'rule-007', ruleName: 'Total Claim Reimbursement Cap', result: 'pass', calculatedAmount: 239.50, timestamp: '2026-02-08T08:33:00Z' },

  // CLM-030 (rejected — crew delay, food + alternate carrier)
  { id: 're-105', claimId: 'CLM-030', ruleId: 'rule-006', ruleName: 'Alternate Carrier Rebooking Limit', result: 'fail', calculatedAmount: 0, timestamp: '2026-02-25T08:03:00Z' },
  { id: 're-106', claimId: 'CLM-030', ruleId: 'rule-004', ruleName: 'Meal Expense Cap', result: 'pass', calculatedAmount: 28.50, timestamp: '2026-02-25T08:03:00Z' },
  { id: 're-107', claimId: 'CLM-030', ruleId: 'rule-007', ruleName: 'Total Claim Reimbursement Cap', result: 'pass', calculatedAmount: 128.50, timestamp: '2026-02-25T08:03:00Z' },
  { id: 're-108', claimId: 'CLM-030', ruleId: 'rule-008', ruleName: 'Fraud Detection Threshold', result: 'fail', calculatedAmount: 0, timestamp: '2026-02-25T08:03:00Z' },

  // CLM-031 (returned — ATC delay, hotel + food)
  { id: 're-109', claimId: 'CLM-031', ruleId: 'rule-003', ruleName: 'Hotel Accommodation Cap', result: 'pass', calculatedAmount: 120.00, timestamp: '2026-03-14T08:03:00Z' },
  { id: 're-110', claimId: 'CLM-031', ruleId: 'rule-004', ruleName: 'Meal Expense Cap', result: 'pass', calculatedAmount: 35.50, timestamp: '2026-03-14T08:03:00Z' },
  { id: 're-111', claimId: 'CLM-031', ruleId: 'rule-007', ruleName: 'Total Claim Reimbursement Cap', result: 'pass', calculatedAmount: 165.50, timestamp: '2026-03-14T08:03:00Z' },
  { id: 're-112', claimId: 'CLM-031', ruleId: 'rule-008', ruleName: 'Fraud Detection Threshold', result: 'pass', calculatedAmount: 0, timestamp: '2026-03-14T08:03:00Z' },

  // CLM-032 (auto_processed — disruption <2h, boarding pass only)
  { id: 're-113', claimId: 'CLM-032', ruleId: 'rule-007', ruleName: 'Total Claim Reimbursement Cap', result: 'pass', calculatedAmount: 0, timestamp: '2026-01-03T08:31:00Z' },
  { id: 're-114', claimId: 'CLM-032', ruleId: 'rule-008', ruleName: 'Fraud Detection Threshold', result: 'pass', calculatedAmount: 0, timestamp: '2026-01-03T08:31:00Z' },

  // CLM-033 (payment_initiated — ATC delay, food only)
  { id: 're-115', claimId: 'CLM-033', ruleId: 'rule-004', ruleName: 'Meal Expense Cap', result: 'pass', calculatedAmount: 35.80, timestamp: '2026-01-18T05:01:45Z' },
  { id: 're-116', claimId: 'CLM-033', ruleId: 'rule-007', ruleName: 'Total Claim Reimbursement Cap', result: 'pass', calculatedAmount: 35.80, timestamp: '2026-01-18T05:01:45Z' },
  { id: 're-117', claimId: 'CLM-033', ruleId: 'rule-008', ruleName: 'Fraud Detection Threshold', result: 'pass', calculatedAmount: 0, timestamp: '2026-01-18T05:01:45Z' },

  // CLM-035 (in_review — ground handling EU, hotel + food + cab)
  { id: 're-118', claimId: 'CLM-035', ruleId: 'rule-001', ruleName: 'EU261 Compensation Entitlement', result: 'pass', calculatedAmount: 400.00, timestamp: '2026-02-08T10:03:00Z' },
  { id: 're-119', claimId: 'CLM-035', ruleId: 'rule-003', ruleName: 'Hotel Accommodation Cap', result: 'pass', calculatedAmount: 162.00, timestamp: '2026-02-08T10:03:00Z' },
  { id: 're-120', claimId: 'CLM-035', ruleId: 'rule-004', ruleName: 'Meal Expense Cap', result: 'pass', calculatedAmount: 35.90, timestamp: '2026-02-08T10:03:00Z' },
  { id: 're-121', claimId: 'CLM-035', ruleId: 'rule-005', ruleName: 'Transport / Cab Cap', result: 'pass', calculatedAmount: 19.00, timestamp: '2026-02-08T10:03:00Z' },
  { id: 're-122', claimId: 'CLM-035', ruleId: 'rule-007', ruleName: 'Total Claim Reimbursement Cap', result: 'pass', calculatedAmount: 216.90, timestamp: '2026-02-08T10:03:00Z' },
];


// ─────────────────────────────────────────────────────────────────────────────
// QC Reviews — 8 reviews
// ─────────────────────────────────────────────────────────────────────────────

export const mockQCReviews: QCReview[] = [
  {
    id: 'qcr-001',
    claimId: 'CLM-004',
    analystId: 'usr-010',
    analystName: 'Ananya Gupta',
    sections: [
      {
        title: 'Document Processing',
        items: [
          { question: 'Were all submitted documents correctly classified?', rating: 5 },
          { question: 'Were extraction confidence thresholds appropriately flagged?', rating: 5 },
          { question: 'Were low-confidence fields reviewed manually?', rating: 4, comment: 'Minor: one field could have had additional cross-check' },
        ],
      },
      {
        title: 'Policy Application',
        items: [
          { question: 'Were the correct rules applied for the disruption type?', rating: 5 },
          { question: 'Was the hotel cap correctly assessed?', rating: 5 },
          { question: 'Were meal expenses verified within daily limit?', rating: 5 },
        ],
      },
      {
        title: 'Agent Decision Quality',
        items: [
          { question: 'Was the authorization recommendation well-justified?', rating: 5 },
          { question: 'Were all communication guidelines followed?', rating: 5 },
          { question: 'Was the claim resolved within SLA?', rating: 5 },
        ],
      },
    ],
    verdict: 'compliant',
    overallComments: 'Excellent handling by Sarah Chen. All steps followed correctly. Weather disruption evidence well documented. Full marks for process adherence.',
    flaggedForTraining: false,
    timestamp: '2026-03-08T10:30:00Z',
  },
  {
    id: 'qcr-002',
    claimId: 'CLM-006',
    analystId: 'usr-010',
    analystName: 'Ananya Gupta',
    sections: [
      {
        title: 'Document Processing',
        items: [
          { question: 'Were all submitted documents correctly classified?', rating: 5 },
          { question: 'Were extraction confidence thresholds appropriately flagged?', rating: 4 },
          { question: 'Were low-confidence fields reviewed manually?', rating: 4 },
        ],
      },
      {
        title: 'Policy Application',
        items: [
          { question: 'Were the correct rules applied for the disruption type?', rating: 3, comment: 'Agent initially processed without checking for prior voluntary compensation — caught during auth review' },
          { question: 'Was the dual-compensation exclusion policy applied correctly?', rating: 4, comment: 'Eventually correct but required auth officer intervention' },
          { question: 'Was the rejection reason clearly communicated to passenger?', rating: 5 },
        ],
      },
      {
        title: 'Agent Decision Quality',
        items: [
          { question: 'Was the initial recommendation accurate?', rating: 3, comment: 'Recommend training on voluntary compensation cross-check step' },
          { question: 'Was the corrected decision well-justified?', rating: 4 },
          { question: 'Was the claim resolved within SLA?', rating: 5 },
        ],
      },
    ],
    verdict: 'minor_issues',
    overallComments: 'Mohammed Al-Rashid processed the claim correctly after the auth officer flagged the dual-compensation issue, but the initial submission missed the cross-check. Recommend a focused coaching session on denied boarding policy.',
    flaggedForTraining: true,
    timestamp: '2026-03-09T14:00:00Z',
  },
  {
    id: 'qcr-003',
    claimId: 'CLM-005',
    analystId: 'usr-010',
    analystName: 'Ananya Gupta',
    sections: [
      {
        title: 'Document Processing',
        items: [
          { question: 'Were all submitted documents correctly classified?', rating: 5 },
          { question: 'Were extraction confidence thresholds appropriately flagged?', rating: 5 },
          { question: 'Were low-confidence fields reviewed manually?', rating: 5 },
        ],
      },
      {
        title: 'Policy Application',
        items: [
          { question: 'Were the correct rules applied for the disruption type?', rating: 5 },
          { question: 'Was the alternate carrier cap correctly applied?', rating: 5 },
          { question: 'Were excluded charges correctly identified?', rating: 5 },
        ],
      },
      {
        title: 'Agent Decision Quality',
        items: [
          { question: 'Was the partial approval recommendation well-justified?', rating: 5 },
          { question: 'Was the exclusion reason clearly documented?', rating: 5 },
          { question: 'Was the claim resolved within SLA?', rating: 5 },
        ],
      },
    ],
    verdict: 'compliant',
    overallComments: 'Priya Sharma handled this cancellation claim excellently. Correct identification of ineligible lounge charge. Partial approval well-documented and communicated.',
    flaggedForTraining: false,
    timestamp: '2026-03-10T11:00:00Z',
  },
  {
    id: 'qcr-004',
    claimId: 'CLM-026',
    analystId: 'usr-010',
    analystName: 'Ananya Gupta',
    sections: [
      {
        title: 'Document Processing',
        items: [
          { question: 'Were all submitted documents correctly classified?', rating: 5 },
          { question: 'Were extraction confidence thresholds appropriately flagged?', rating: 5 },
          { question: 'Were low-confidence fields reviewed manually?', rating: 5 },
        ],
      },
      {
        title: 'Policy Application',
        items: [
          { question: 'Were the correct rules applied for the diversion disruption?', rating: 5 },
          { question: 'Was the medical emergency exception handled correctly?', rating: 5 },
          { question: 'Were meal and hotel expenses within policy limits?', rating: 5 },
        ],
      },
      {
        title: 'Agent Decision Quality',
        items: [
          { question: 'Was the full approval recommendation justified?', rating: 5 },
          { question: 'Was the diversion evidence correctly verified?', rating: 5 },
          { question: 'Was the claim resolved promptly?', rating: 4, comment: 'Slightly longer than average but still within SLA' },
        ],
      },
    ],
    verdict: 'compliant',
    overallComments: 'Sneha Reddy correctly handled the diversion claim. Muscat emergency landing verified against flight OPS data. All expenses within cap. Good work.',
    flaggedForTraining: false,
    timestamp: '2026-01-16T10:00:00Z',
  },
  {
    id: 'qcr-005',
    claimId: 'CLM-029',
    analystId: 'usr-010',
    analystName: 'Ananya Gupta',
    sections: [
      {
        title: 'Document Processing',
        items: [
          { question: 'Were all submitted documents correctly classified?', rating: 5 },
          { question: 'Were high-value receipts properly escalated?', rating: 5 },
          { question: 'Were anomaly signals correctly identified?', rating: 5 },
        ],
      },
      {
        title: 'Policy Application',
        items: [
          { question: 'Was the Business Class exclusion correctly applied?', rating: 5 },
          { question: 'Was the Platinum cap correctly referenced?', rating: 5 },
          { question: 'Were fraud detection rules triggered appropriately?', rating: 5 },
        ],
      },
      {
        title: 'Agent Decision Quality',
        items: [
          { question: 'Was the rejection recommendation well-justified?', rating: 5 },
          { question: 'Was the communication to passenger clear and professional?', rating: 4, comment: 'Good but could be more empathetic given Platinum status' },
          { question: 'Was the claim resolved within SLA?', rating: 5 },
        ],
      },
    ],
    verdict: 'compliant',
    overallComments: 'Aisha Khan correctly identified the ineligible Business Class upgrade and applied the Platinum cap rule. Fraud detection flags handled appropriately. Recommend slightly more empathetic communication template for Platinum passengers.',
    flaggedForTraining: false,
    timestamp: '2026-02-25T11:00:00Z',
  },
  {
    id: 'qcr-006',
    claimId: 'CLM-034',
    analystId: 'usr-010',
    analystName: 'Ananya Gupta',
    sections: [
      {
        title: 'Document Processing',
        items: [
          { question: 'Were all submitted documents correctly classified?', rating: 5 },
          { question: 'Were extraction confidence thresholds appropriately flagged?', rating: 5 },
          { question: 'Were low-confidence fields reviewed manually?', rating: 5 },
        ],
      },
      {
        title: 'Policy Application',
        items: [
          { question: 'Were hotel and transport expenses correctly capped?', rating: 5 },
          { question: 'Was the meal cap correctly enforced?', rating: 5 },
          { question: 'Was the partial approval correctly calculated?', rating: 5 },
        ],
      },
      {
        title: 'Agent Decision Quality',
        items: [
          { question: 'Was the partial approval well-documented?', rating: 5 },
          { question: 'Were communication guidelines followed?', rating: 5 },
          { question: 'Was the claim closed promptly after payment?', rating: 5 },
        ],
      },
    ],
    verdict: 'compliant',
    overallComments: 'Clean end-to-end handling by Priya Sharma. Claim closed on time after payment. All policy applications correct. Excellent documentation.',
    flaggedForTraining: false,
    timestamp: '2026-01-10T14:00:00Z',
  },
  {
    id: 'qcr-007',
    claimId: 'CLM-030',
    analystId: 'usr-010',
    analystName: 'Ananya Gupta',
    sections: [
      {
        title: 'Document Processing',
        items: [
          { question: 'Were all submitted documents correctly classified?', rating: 4 },
          { question: 'Were low-confidence extractions flagged?', rating: 3, comment: 'Low-confidence hotel field was not flagged promptly' },
          { question: 'Were override reasons properly documented?', rating: 4 },
        ],
      },
      {
        title: 'Policy Application',
        items: [
          { question: 'Was the EC261 extraordinary circumstances exemption correctly applied?', rating: 5 },
          { question: 'Were airline records verified before rejection?', rating: 4, comment: 'Verification was done but not documented clearly in the system' },
          { question: 'Was the rejection reason clear and policy-backed?', rating: 5 },
        ],
      },
      {
        title: 'Agent Decision Quality',
        items: [
          { question: 'Was the rejection recommendation well-justified?', rating: 5 },
          { question: 'Was the agent communication professional?', rating: 5 },
          { question: 'Was the claim resolved within SLA?', rating: 4, comment: 'Resolution took 2 days longer than average for this claim type' },
        ],
      },
    ],
    verdict: 'minor_issues',
    overallComments: 'Yuki Tanaka correctly applied the EC261 extraordinary circumstances exemption but documentation of the airline records verification step was insufficient. Minor coaching recommended on documentation standards.',
    flaggedForTraining: true,
    timestamp: '2026-03-05T10:00:00Z',
  },
  {
    id: 'qcr-008',
    claimId: 'CLM-028',
    analystId: 'usr-010',
    analystName: 'Ananya Gupta',
    sections: [
      {
        title: 'Document Processing',
        items: [
          { question: 'Were all submitted documents correctly classified?', rating: 5 },
          { question: 'Were multi-currency receipts handled correctly?', rating: 5 },
          { question: 'Were extraction confidence thresholds appropriately flagged?', rating: 5 },
        ],
      },
      {
        title: 'Policy Application',
        items: [
          { question: 'Were hotel and transport expenses correctly capped?', rating: 5 },
          { question: 'Was the lounge access exclusion correctly identified?', rating: 5 },
          { question: 'Was the partial approval correctly calculated?', rating: 5 },
        ],
      },
      {
        title: 'Agent Decision Quality',
        items: [
          { question: 'Was the partial approval recommendation justified?', rating: 5 },
          { question: 'Was the communication to passenger clear?', rating: 5 },
          { question: 'Was the claim resolved within SLA?', rating: 5 },
        ],
      },
    ],
    verdict: 'compliant',
    overallComments: 'James Wilson correctly handled the multi-currency EU claim. Lounge exclusion well-identified and documented. Partial approval calculation accurate. Strong performance.',
    flaggedForTraining: false,
    timestamp: '2026-02-15T11:00:00Z',
  },
];


// ─────────────────────────────────────────────────────────────────────────────
// Notifications — 20 notifications
// ─────────────────────────────────────────────────────────────────────────────

export const mockNotifications: Notification[] = [
  { id: 'ntf-001', type: 'claim_assigned', title: 'New Claim Assigned', message: 'CLM-001 (Rohan Verma, AI 111 DEL→LHR) has been assigned to you.', link: '/claims/clm-001', read: true, timestamp: '2026-01-14T09:33:05Z' },
  { id: 'ntf-002', type: 'claim_assigned', title: 'New Claim Assigned', message: 'CLM-002 (Aisha Nair, 6E 201 BLR→SIN) has been assigned to you.', link: '/claims/clm-002', read: false, timestamp: '2026-02-04T08:10:00Z' },
  { id: 'ntf-003', type: 'sla_warning', title: 'SLA Warning', message: 'CLM-009 (Omar Al-Farsi) is approaching SLA deadline — 48 hours remaining.', link: '/claims/clm-009', read: false, timestamp: '2026-02-20T07:30:00Z' },
  { id: 'ntf-004', type: 'authorization_decision', title: 'Authorization Granted', message: 'CLM-005 (Aisha Nair) approved for USD 312.00 by Rajesh Menon.', link: '/claims/clm-005', read: true, timestamp: '2026-01-24T16:40:00Z' },
  { id: 'ntf-005', type: 'authorization_decision', title: 'Authorization Required', message: 'CLM-003 (David Okafor, 6E 58 MAA→DXB) awaiting your authorization decision.', link: '/claims/clm-003', read: false, timestamp: '2026-03-01T14:55:00Z' },
  { id: 'ntf-006', type: 'authorization_decision', title: 'High-Value Authorization Required', message: 'CLM-009 (Omar Al-Farsi) — USD 2,423.00 awaiting senior authorization.', link: '/claims/clm-009', read: false, timestamp: '2026-02-17T16:20:00Z' },
  { id: 'ntf-007', type: 'qc_feedback', title: 'QC Feedback Received', message: 'QC review for CLM-006: minor issues flagged. Training session recommended for Mohammed Al-Rashid.', link: '/claims/clm-006', read: false, timestamp: '2026-03-09T14:05:00Z' },
  { id: 'ntf-008', type: 'claim_returned', title: 'Claim Returned to Passenger', message: 'CLM-007 (Meera Iyer, BA 138) returned — illegible hotel receipt.', link: '/claims/clm-007', read: true, timestamp: '2026-02-12T09:45:00Z' },
  { id: 'ntf-009', type: 'auto_processed', title: 'Claim Auto-Processed', message: 'CLM-008 (Priyanka Desai) auto-approved for USD 14.90 — high confidence, below threshold.', link: '/claims/clm-008', read: false, timestamp: '2026-03-10T07:18:00Z' },
  { id: 'ntf-010', type: 'sla_warning', title: 'SLA Breach Risk', message: 'CLM-010 (Rohan Verma) is unassigned with 4 days remaining on SLA. Immediate action required.', link: '/claims/clm-010', read: false, timestamp: '2026-01-31T10:00:00Z' },
  { id: 'ntf-011', type: 'payment_initiated', title: 'Payment Initiated', message: 'Payment of USD 206.40 for CLM-026 (Hans Müller) initiated. Ref: PAY-2026-00312.', link: '/claims/clm-026', read: true, timestamp: '2026-01-14T09:15:00Z' },
  { id: 'ntf-012', type: 'claim_rejected', title: 'Claim Rejected', message: 'CLM-029 (John Harrison) rejected — Business Class upgrade not reimbursable, exceeds Platinum cap.', link: '/claims/clm-029', read: true, timestamp: '2026-02-21T13:00:00Z' },
  { id: 'ntf-013', type: 'claim_assigned', title: 'New Claim Assigned', message: 'CLM-016 (John Harrison, EK 212 DXB→JFK) high-value claim assigned to you.', link: '/claims/clm-016', read: false, timestamp: '2026-02-18T20:02:30Z' },
  { id: 'ntf-014', type: 'claim_assigned', title: 'New Claim Assigned', message: 'CLM-033 (Layla Mahmoud, EY 204 AUH→DEL) has been assigned to you.', link: '/claims/clm-033', read: true, timestamp: '2026-01-18T05:02:00Z' },
  { id: 'ntf-015', type: 'payment_completed', title: 'Payment Completed', message: 'Payment for CLM-034 (Karthik Rajan) — AED 779.40 completed. Claim now closed.', link: '/claims/clm-034', read: true, timestamp: '2026-01-08T08:00:00Z' },
  { id: 'ntf-016', type: 'authorization_decision', title: 'Authorization Required', message: 'CLM-023 (Isabella Rossi, AF 218 CDG→DEL) EUR claim awaiting authorization.', link: '/claims/clm-023', read: false, timestamp: '2026-02-10T16:00:00Z' },
  { id: 'ntf-017', type: 'authorization_decision', title: 'Authorization Required', message: 'CLM-024 (Fatima Al-Zaabi, G9 431 BOM→SHJ) dual-currency claim awaiting manual FX verification.', link: '/claims/clm-024', read: false, timestamp: '2025-12-28T12:00:00Z' },
  { id: 'ntf-018', type: 'sla_warning', title: 'SLA Warning', message: 'CLM-031 (Tariq Al-Rashidi) in returned status — passenger has not resubmitted. Deadline in 5 days.', link: '/claims/clm-031', read: false, timestamp: '2026-03-16T10:00:00Z' },
  { id: 'ntf-019', type: 'claim_returned', title: 'Claim Returned to Passenger', message: 'CLM-031 (Tariq Al-Rashidi) returned — hotel receipt mismatch, meal receipt incomplete.', link: '/claims/clm-031', read: false, timestamp: '2026-03-16T10:00:00Z' },
  { id: 'ntf-020', type: 'qc_feedback', title: 'QC Feedback — Documentation Issue', message: 'QC review for CLM-030: minor documentation issues. Coaching recommended for Yuki Tanaka.', link: '/claims/clm-030', read: false, timestamp: '2026-03-05T10:00:00Z' },
];


// ─────────────────────────────────────────────────────────────────────────────
// Analytics Data
// ─────────────────────────────────────────────────────────────────────────────

// Helper — generate 12 months of data starting from Apr 2025
const months12 = [
  'Apr 2025','May 2025','Jun 2025','Jul 2025','Aug 2025','Sep 2025',
  'Oct 2025','Nov 2025','Dec 2025','Jan 2026','Feb 2026','Mar 2026',
];

const claimsBase   = [1124,  987, 1234, 1098, 1321, 1456, 1589, 1712, 1845, 1378, 1502, 887];
const approvedPct  = [0.773, 0.758, 0.781, 0.769, 0.775, 0.789, 0.796, 0.803, 0.791, 0.798, 0.810, 0.815];
const rejectedPct  = [0.154, 0.148, 0.152, 0.150, 0.147, 0.143, 0.141, 0.138, 0.139, 0.141, 0.137, 0.132];

const payoutBase        = [312450, 287890, 374520, 336780, 381230, 418940, 457650, 492340, 528760, 443150, 488920, 281230];
const hotelPct          = 0.418;
const altCarrierPct     = 0.268;
const mealPct           = 0.179;
const cabPct            = 0.068;
const otherPct          = 0.067;

export const analyticsData = {
  claimsByMonth: months12.map((month, i) => ({
    month,
    claims:   claimsBase[i],
    approved: Math.round(claimsBase[i] * approvedPct[i]),
    rejected: Math.round(claimsBase[i] * rejectedPct[i]),
    returned: Math.round(claimsBase[i] * 0.065),
  })),

  claimsByDisruptionType: [
    { type: 'Delay',           count: 7842, percentage: 52.4, avgPayout: 284 },
    { type: 'Cancellation',    count: 4187, percentage: 28.1, avgPayout: 412 },
    { type: 'Denied Boarding', count: 1793, percentage: 12.0, avgPayout: 356 },
    { type: 'Diversion',       count: 1134, percentage: 7.6,  avgPayout: 521 },
  ],

  claimsByJurisdiction: [
    { jurisdiction: 'India (DGCA)',        count: 6187, percentage: 41.4, avgProcessingDays: 4.2 },
    { jurisdiction: 'EU (EC 261)',         count: 3721, percentage: 24.9, avgProcessingDays: 5.1 },
    { jurisdiction: 'UAE (GCAA)',          count: 2315, percentage: 15.5, avgProcessingDays: 3.8 },
    { jurisdiction: 'UK (CAA)',            count: 1330, percentage: 8.9,  avgProcessingDays: 4.7 },
    { jurisdiction: 'USA (DOT)',           count:  843, percentage: 5.6,  avgProcessingDays: 6.3 },
    { jurisdiction: 'Singapore (CAAS)',    count:  560, percentage: 3.8,  avgProcessingDays: 3.5 },
  ],

  claimsByChannel: [
    { channel: 'Web Portal',  count: 5984, percentage: 40.1 },
    { channel: 'Mobile App',  count: 4532, percentage: 30.4 },
    { channel: 'Email',       count: 2891, percentage: 19.4 },
    { channel: 'API / B2B',   count: 1052, percentage: 7.1  },
    { channel: 'Walk-in',     count:  497, percentage: 3.3  },
  ],

  payoutByMonth: months12.map((month, i) => {
    const total = payoutBase[i];
    return {
      month,
      totalPayout:      total,
      hotelExpenses:    Math.round(total * hotelPct),
      mealExpenses:     Math.round(total * mealPct),
      cabExpenses:      Math.round(total * cabPct),
      alternateCarrier: Math.round(total * altCarrierPct),
      other:            Math.round(total * otherPct),
    };
  }),

  payoutByCategory: [
    { category: 'Hotel',              amount: 1813214, percentage: 41.8, avgPerClaim: 207 },
    { category: 'Alternate Carrier',  amount: 1163132, percentage: 26.8, avgPerClaim: 312 },
    { category: 'Meals',              amount:  776524, percentage: 17.9, avgPerClaim:  43 },
    { category: 'Cab / Transport',    amount:  294418, percentage: 6.8,  avgPerClaim:  18 },
    { category: 'Other',              amount:  290832, percentage: 6.7,  avgPerClaim:  31 },
  ],

  agentPerformance: [
    { agentId: 'usr-001', agentName: 'Priya Sharma',          claimsProcessed: 287, avgResolutionDays: 3.2, accuracy: 94, approvalRate: 78, returnRate: 6,  avgClaimedAmount: 342, avgApprovedAmount: 298, slaComplianceRate: 97 },
    { agentId: 'usr-002', agentName: 'Arjun Patel',           claimsProcessed: 234, avgResolutionDays: 3.8, accuracy: 91, approvalRate: 74, returnRate: 8,  avgClaimedAmount: 289, avgApprovedAmount: 241, slaComplianceRate: 94 },
    { agentId: 'usr-003', agentName: 'Sarah Chen',            claimsProcessed: 312, avgResolutionDays: 2.9, accuracy: 97, approvalRate: 82, returnRate: 4,  avgClaimedAmount: 478, avgApprovedAmount: 421, slaComplianceRate: 99 },
    { agentId: 'usr-004', agentName: 'Mohammed Al-Rashid',    claimsProcessed: 189, avgResolutionDays: 4.1, accuracy: 88, approvalRate: 71, returnRate: 11, avgClaimedAmount: 312, avgApprovedAmount: 254, slaComplianceRate: 91 },
    { agentId: 'usr-005', agentName: 'Elena Kowalski',        claimsProcessed: 198, avgResolutionDays: 3.5, accuracy: 93, approvalRate: 77, returnRate: 7,  avgClaimedAmount: 356, avgApprovedAmount: 302, slaComplianceRate: 96 },
    { agentId: 'usr-013', agentName: 'Ravi Kumar',            claimsProcessed: 201, avgResolutionDays: 3.9, accuracy: 87, approvalRate: 73, returnRate: 9,  avgClaimedAmount: 278, avgApprovedAmount: 231, slaComplianceRate: 92 },
    { agentId: 'usr-014', agentName: 'Deepa Nair',            claimsProcessed: 218, avgResolutionDays: 3.4, accuracy: 92, approvalRate: 79, returnRate: 6,  avgClaimedAmount: 321, avgApprovedAmount: 276, slaComplianceRate: 95 },
    { agentId: 'usr-015', agentName: 'Amit Sharma',           claimsProcessed: 176, avgResolutionDays: 4.2, accuracy: 85, approvalRate: 70, returnRate: 10, avgClaimedAmount: 265, avgApprovedAmount: 214, slaComplianceRate: 89 },
    { agentId: 'usr-016', agentName: 'Sneha Reddy',           claimsProcessed: 245, avgResolutionDays: 3.1, accuracy: 96, approvalRate: 81, returnRate: 5,  avgClaimedAmount: 412, avgApprovedAmount: 365, slaComplianceRate: 98 },
    { agentId: 'usr-017', agentName: 'Carlos Martinez',       claimsProcessed: 193, avgResolutionDays: 3.7, accuracy: 89, approvalRate: 75, returnRate: 8,  avgClaimedAmount: 298, avgApprovedAmount: 248, slaComplianceRate: 93 },
    { agentId: 'usr-018', agentName: 'James Wilson',          claimsProcessed: 221, avgResolutionDays: 3.3, accuracy: 90, approvalRate: 76, returnRate: 7,  avgClaimedAmount: 334, avgApprovedAmount: 281, slaComplianceRate: 94 },
    { agentId: 'usr-019', agentName: 'Aisha Khan',            claimsProcessed: 208, avgResolutionDays: 3.6, accuracy: 93, approvalRate: 78, returnRate: 6,  avgClaimedAmount: 345, avgApprovedAmount: 298, slaComplianceRate: 95 },
    { agentId: 'usr-020', agentName: 'Yuki Tanaka',           claimsProcessed: 241, avgResolutionDays: 2.8, accuracy: 95, approvalRate: 80, returnRate: 5,  avgClaimedAmount: 389, avgApprovedAmount: 341, slaComplianceRate: 97 },
    { agentId: 'usr-021', agentName: 'Michael Brown',         claimsProcessed: 164, avgResolutionDays: 4.5, accuracy: 82, approvalRate: 68, returnRate: 12, avgClaimedAmount: 241, avgApprovedAmount: 192, slaComplianceRate: 87 },
    { agentId: 'usr-022', agentName: 'Sophie Laurent',        claimsProcessed: 228, avgResolutionDays: 3.2, accuracy: 91, approvalRate: 77, returnRate: 7,  avgClaimedAmount: 318, avgApprovedAmount: 268, slaComplianceRate: 94 },
  ],

  routeAnalytics: [
    { route: 'DEL → LHR', claimCount: 834, totalPayout: 387340, avgDelay: 195, topDisruption: 'delay',          airline: 'AI' },
    { route: 'BOM → DXB', claimCount: 698, totalPayout: 262450, avgDelay: 0,   topDisruption: 'cancellation',   airline: 'EK' },
    { route: 'DEL → JFK', claimCount: 556, totalPayout: 313210, avgDelay: 0,   topDisruption: 'cancellation',   airline: 'AI' },
    { route: 'BLR → SIN', claimCount: 543, totalPayout: 238890, avgDelay: 312, topDisruption: 'delay',          airline: '6E' },
    { route: 'LHR → DEL', claimCount: 534, totalPayout: 258760, avgDelay: 145, topDisruption: 'diversion',      airline: 'BA' },
    { route: 'MAA → DXB', claimCount: 412, totalPayout: 158450, avgDelay: 385, topDisruption: 'delay',          airline: '6E' },
    { route: 'DEL → DXB', claimCount: 398, totalPayout: 141230, avgDelay: 178, topDisruption: 'delay',          airline: 'EK' },
    { route: 'LHR → BOM', claimCount: 387, totalPayout: 181560, avgDelay: 215, topDisruption: 'delay',          airline: 'BA' },
    { route: 'DEL → SFO', claimCount: 376, totalPayout: 139870, avgDelay: 150, topDisruption: 'delay',          airline: 'AI' },
    { route: 'DEL → BOM', claimCount: 589, totalPayout: 124120, avgDelay: 0,   topDisruption: 'denied_boarding', airline: 'AI' },
    { route: 'DOH → LHR', claimCount: 298, totalPayout: 128940, avgDelay: 210, topDisruption: 'delay',          airline: 'QR' },
    { route: 'FRA → BOM', claimCount: 187, totalPayout:  98540, avgDelay: 360, topDisruption: 'diversion',      airline: 'LH' },
    { route: 'AUH → DEL', claimCount: 312, totalPayout: 114230, avgDelay: 285, topDisruption: 'delay',          airline: 'EY' },
    { route: 'JFK → LHR', claimCount: 234, totalPayout: 142870, avgDelay: 0,   topDisruption: 'cancellation',   airline: 'UA' },
    { route: 'CDG → DEL', claimCount: 198, totalPayout:  98410, avgDelay: 270, topDisruption: 'delay',          airline: 'AF' },
  ],

  slaComplianceData: months12.map((month, i) => {
    const complianceRates = [91.2, 89.7, 92.5, 90.3, 91.9, 93.8, 94.6, 95.1, 93.5, 94.2, 95.8, 96.3];
    const breached = Math.round(claimsBase[i] * (1 - complianceRates[i] / 100));
    const resolutionDays = [3.9, 4.1, 3.7, 4.0, 3.8, 3.5, 3.3, 3.2, 3.6, 3.4, 3.1, 3.0];
    return { month, complianceRate: complianceRates[i], claimsBreached: breached, avgResolutionDays: resolutionDays[i] };
  }),

  rejectionReasons: [
    { reason: 'Duplicate / prior compensation accepted',   count: 412, percentage: 22.1 },
    { reason: 'Extraordinary circumstances exemption',     count: 378, percentage: 20.3 },
    { reason: 'Exceeded policy cap — no entitlement',      count: 334, percentage: 17.9 },
    { reason: 'Ineligible expense category',               count: 289, percentage: 15.5 },
    { reason: 'Insufficient / illegible documentation',    count: 198, percentage: 10.6 },
    { reason: 'Disruption < threshold duration',           count: 156, percentage: 8.4  },
    { reason: 'Fraud / anomaly detected',                  count:  97, percentage: 5.2  },
  ],

  fraudFlagRate: [
    { month: 'Apr 2025', flaggedCount: 23, confirmedFraud: 8,  flagRate: 2.05 },
    { month: 'May 2025', flaggedCount: 19, confirmedFraud: 6,  flagRate: 1.92 },
    { month: 'Jun 2025', flaggedCount: 28, confirmedFraud: 10, flagRate: 2.27 },
    { month: 'Jul 2025', flaggedCount: 21, confirmedFraud: 7,  flagRate: 1.91 },
    { month: 'Aug 2025', flaggedCount: 25, confirmedFraud: 9,  flagRate: 1.89 },
    { month: 'Sep 2025', flaggedCount: 31, confirmedFraud: 11, flagRate: 2.13 },
    { month: 'Oct 2025', flaggedCount: 34, confirmedFraud: 12, flagRate: 2.14 },
    { month: 'Nov 2025', flaggedCount: 37, confirmedFraud: 14, flagRate: 2.16 },
    { month: 'Dec 2025', flaggedCount: 42, confirmedFraud: 15, flagRate: 2.28 },
    { month: 'Jan 2026', flaggedCount: 33, confirmedFraud: 11, flagRate: 2.39 },
    { month: 'Feb 2026', flaggedCount: 36, confirmedFraud: 13, flagRate: 2.40 },
    { month: 'Mar 2026', flaggedCount: 18, confirmedFraud:  6, flagRate: 2.03 },
  ],

  processingTimeByComplexity: [
    { complexity: 'Simple (single receipt, <$100)',           avgDays: 1.2, autoProcessRate: 68, sampleSize: 4234 },
    { complexity: 'Standard (2–3 receipts, $100–$500)',       avgDays: 3.1, autoProcessRate: 18, sampleSize: 6789 },
    { complexity: 'Complex (multi-receipt, $500–$1500)',      avgDays: 4.8, autoProcessRate:  4, sampleSize: 2891 },
    { complexity: 'High-Value (>$1500 or Platinum)',          avgDays: 6.9, autoProcessRate:  1, sampleSize:  854 },
    { complexity: 'Disputed / Returned (resubmission)',       avgDays: 9.2, autoProcessRate:  0, sampleSize:  412 },
    { complexity: 'Fraud-Flagged',                            avgDays: 8.4, autoProcessRate:  0, sampleSize:  189 },
  ],

  // 15 agents × 7 days — claim count per agent per day
  weeklyHeatmapData: (() => {
    const agentIds = [
      'usr-001','usr-002','usr-003','usr-004','usr-005',
      'usr-013','usr-014','usr-015','usr-016','usr-017',
      'usr-018','usr-019','usr-020','usr-021','usr-022',
    ];
    const agentNames = [
      'Priya Sharma','Arjun Patel','Sarah Chen','Mohammed Al-Rashid','Elena Kowalski',
      'Ravi Kumar','Deepa Nair','Amit Sharma','Sneha Reddy','Carlos Martinez',
      'James Wilson','Aisha Khan','Yuki Tanaka','Michael Brown','Sophie Laurent',
    ];
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    // Realistic load: Mon–Thu high, Fri medium, Sat–Sun low
    const dayWeights = [1.0, 1.05, 1.02, 0.98, 0.82, 0.45, 0.28];
    // Per-agent base productivity (claims/day)
    const baseLoad = [8, 7, 9, 6, 7, 8, 7, 6, 9, 7, 7, 8, 9, 5, 7];
    return agentIds.map((agentId, ai) => ({
      agentId,
      agentName: agentNames[ai],
      data: days.map((day, di) => ({
        day,
        claimsWorked: Math.max(0, Math.round(baseLoad[ai] * dayWeights[di] + (Math.random() * 3 - 1.5))),
      })),
    }));
  })(),
};
