// ─────────────────────────────────────────────────────────────────────────────
// User & Auth
// ─────────────────────────────────────────────────────────────────────────────

export type UserRole =
  | 'claims_agent'
  | 'authorization_officer'
  | 'operations_manager'
  | 'qc_analyst'
  | 'cxo'
  | 'super_admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  /** URL to avatar image, or initials string (e.g. "JD") */
  avatar: string;
  status: 'active' | 'inactive' | 'on_leave';
  department: string;
  shiftStart: string; // ISO time string e.g. "09:00"
  shiftEnd: string;   // ISO time string e.g. "17:00"
  /** Maximum number of claims the agent can handle concurrently */
  capacity: number;
  currentLoad: number;
  /** Accuracy percentage (0–100) */
  accuracy: number;
  specializations: string[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Claims
// ─────────────────────────────────────────────────────────────────────────────

export type ClaimStatus =
  | 'ingested'
  | 'processing'
  | 'unassigned'
  | 'auto_processed'
  | 'assigned'
  | 'in_review'
  | 'validation_complete'
  | 'rules_evaluated'
  | 'pending_authorization'
  | 'approved'
  | 'rejected'
  | 'returned'
  | 'payment_initiated'
  | 'payment_completed'
  | 'closed'
  | 'escalated';

export type DisruptionType =
  | 'cancellation'
  | 'delay'
  | 'denied_boarding'
  | 'diversion';

export interface Passenger {
  id: string;
  name: string;
  email: string;
  phone: string;
  /** Frequent flyer number */
  ffNumber: string;
  ffTier: string;
  nationality: string;
}

export interface Flight {
  id: string;
  flightNumber: string;
  routeOrigin: string;
  routeDestination: string;
  originCity: string;
  destinationCity: string;
  scheduledDeparture: string; // ISO datetime
  actualDeparture: string;    // ISO datetime
  scheduledArrival: string;   // ISO datetime
  actualArrival: string;      // ISO datetime
  aircraftType: string;
}

export interface Disruption {
  id: string;
  flightId: string;
  type: DisruptionType;
  reasonCode: string;
  reasonDescription: string;
  durationMinutes: number;
  noticeHours: number;
  alternativeOffered: boolean;
}

export type DocumentCategory =
  | 'hotel'
  | 'cab'
  | 'food'
  | 'travel'
  | 'alternate_carrier'
  | 'boarding_pass'
  | 'id_document'
  | 'correspondence'
  | 'other';

export interface ExtractedField {
  name: string;
  value: string;
  /** Confidence score 0–100 */
  confidence: number;
  overriddenValue?: string;
  overrideReason?: string;
}

export interface ClaimDocument {
  id: string;
  claimId: string;
  fileUrl: string;
  thumbnailUrl: string;
  category: DocumentCategory;
  classificationConfidence: number;
  extractedFields: ExtractedField[];
  validationStatus: 'pending' | 'validated' | 'overridden';
}

export interface Claim {
  id: string;
  pnr: string;
  passengerId: string;
  passenger: Passenger;
  flightId: string;
  flight: Flight;
  disruptionId: string;
  disruption: Disruption;
  status: ClaimStatus;
  /** Overall AI confidence score 0–100 */
  overallConfidence: number;
  totalClaimed: number;
  totalApproved: number;
  currency: string;
  outcome: 'approve_full' | 'approve_partial' | 'reject' | 'escalate' | null;
  assignedAgentId: string | null;
  assignedAgent?: User;
  documents: ClaimDocument[];
  createdAt: string;   // ISO datetime
  updatedAt: string;   // ISO datetime
  slaDeadline: string; // ISO datetime
  returnedReason?: string;
  authorizationNotes?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Audit
// ─────────────────────────────────────────────────────────────────────────────

export type AuditActionType =
  // Claim lifecycle
  | 'claim_ingested'
  | 'claim_processing_started'
  | 'claim_auto_processed'
  | 'claim_assigned'
  | 'claim_reassigned'
  | 'claim_unassigned'
  | 'claim_review_started'
  | 'claim_returned'
  | 'claim_escalated'
  | 'claim_closed'
  // Decisions
  | 'claim_approved'
  | 'claim_approved_partial'
  | 'claim_rejected'
  | 'authorization_requested'
  | 'authorization_granted'
  | 'authorization_denied'
  // Documents
  | 'document_uploaded'
  | 'document_classified'
  | 'document_classification_overridden'
  | 'document_field_extracted'
  | 'document_field_overridden'
  | 'document_validated'
  | 'document_validation_overridden'
  // Rules
  | 'rules_evaluated'
  | 'rule_pass'
  | 'rule_fail'
  | 'rule_created'
  | 'rule_updated'
  | 'rule_activated'
  | 'rule_archived'
  // Payments
  | 'payment_initiated'
  | 'payment_completed'
  | 'payment_failed'
  // QC
  | 'qc_review_started'
  | 'qc_review_submitted'
  | 'qc_flagged_for_training'
  // User management
  | 'user_created'
  | 'user_updated'
  | 'user_deactivated'
  | 'user_role_changed'
  // Auth
  | 'user_login'
  | 'user_logout'
  | 'user_login_failed'
  // SLA
  | 'sla_warning'
  | 'sla_breached'
  // Notifications
  | 'notification_sent';

export interface AuditEvent {
  id: string;
  claimId: string | null;
  actorType: 'user' | 'system' | 'ai';
  actorId: string;
  actorName: string;
  actionType: AuditActionType;
  description: string;
  beforeState?: Record<string, unknown>;
  afterState?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  timestamp: string; // ISO datetime
}

// ─────────────────────────────────────────────────────────────────────────────
// Rules
// ─────────────────────────────────────────────────────────────────────────────

export interface BusinessRule {
  id: string;
  name: string;
  version: string;
  conditions: Record<string, unknown>;
  actions: Record<string, unknown>;
  status: 'draft' | 'active' | 'archived';
  createdBy: string;
  effectiveFrom: string; // ISO datetime
  effectiveTo: string;   // ISO datetime
}

export interface RuleEvaluation {
  id: string;
  claimId: string;
  ruleId: string;
  ruleName: string;
  result: 'pass' | 'fail';
  calculatedAmount: number;
  timestamp: string; // ISO datetime
}

// ─────────────────────────────────────────────────────────────────────────────
// QC
// ─────────────────────────────────────────────────────────────────────────────

export type QCVerdict =
  | 'compliant'
  | 'minor_issues'
  | 'major_issues'
  | 'critical';

export interface QCChecklistItem {
  question: string;
  /** Rating on a 1–5 scale */
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
}

export interface QCSection {
  title: string;
  items: QCChecklistItem[];
}

export interface QCReview {
  id: string;
  claimId: string;
  analystId: string;
  analystName: string;
  sections: QCSection[];
  verdict: QCVerdict;
  overallComments: string;
  flaggedForTraining: boolean;
  timestamp: string; // ISO datetime
}

// ─────────────────────────────────────────────────────────────────────────────
// Assignment
// ─────────────────────────────────────────────────────────────────────────────

export interface Assignment {
  id: string;
  claimId: string;
  fromAgentId: string | null;
  toAgentId: string;
  assignedBy: string;
  reason: string;
  notes?: string;
  timestamp: string; // ISO datetime
}

// ─────────────────────────────────────────────────────────────────────────────
// Notifications
// ─────────────────────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  timestamp: string; // ISO datetime
}

// ─────────────────────────────────────────────────────────────────────────────
// Analytics
// ─────────────────────────────────────────────────────────────────────────────

export interface TrendInfo {
  direction: 'up' | 'down' | 'flat';
  value: number;
  isPositive: boolean;
}

export interface MetricData {
  label: string;
  value: number | string;
  trend: TrendInfo;
  sparklineData?: number[];
}

export interface ChartDataPoint {
  [key: string]: string | number;
}
