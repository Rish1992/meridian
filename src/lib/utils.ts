import { clsx, type ClassValue } from 'clsx';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import type { ClaimStatus } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Class name combiner
// ─────────────────────────────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

// ─────────────────────────────────────────────────────────────────────────────
// Currency formatting
// ─────────────────────────────────────────────────────────────────────────────

const CURRENCY_LOCALES: Record<string, string> = {
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  INR: 'en-IN',
};

export function formatCurrency(amount: number, currency = 'USD'): string {
  const locale = CURRENCY_LOCALES[currency] ?? 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// ─────────────────────────────────────────────────────────────────────────────
// Date formatting
// ─────────────────────────────────────────────────────────────────────────────

/** Returns a date formatted as "Mar 15, 2026". */
export function formatDate(dateString: string): string {
  return format(parseISO(dateString), 'MMM d, yyyy');
}

/** Returns a datetime formatted as "Mar 15, 2026 2:30 PM". */
export function formatDateTime(dateString: string): string {
  return format(parseISO(dateString), 'MMM d, yyyy h:mm a');
}

/** Returns a relative time string such as "2 hours ago" or "3 days ago". */
export function formatRelativeTime(dateString: string): string {
  return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
}

// ─────────────────────────────────────────────────────────────────────────────
// Confidence score colours
// ─────────────────────────────────────────────────────────────────────────────

export interface ConfidenceColor {
  bg: string;
  text: string;
  bar: string;
}

/**
 * Returns Tailwind colour tokens for a confidence score:
 *  0 – 59  → red
 * 60 – 84  → amber
 * 85 – 100 → emerald
 */
export function getConfidenceColor(score: number): ConfidenceColor {
  if (score >= 85) {
    return {
      bg: 'bg-emerald-50 dark:bg-emerald-900/30',
      text: 'text-emerald-700 dark:text-emerald-400',
      bar: 'bg-emerald-500',
    };
  }
  if (score >= 60) {
    return {
      bg: 'bg-amber-50 dark:bg-amber-900/30',
      text: 'text-amber-700 dark:text-amber-400',
      bar: 'bg-amber-500',
    };
  }
  return {
    bg: 'bg-red-50 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-400',
    bar: 'bg-red-500',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Claim status config
// ─────────────────────────────────────────────────────────────────────────────

export interface StatusConfig {
  label: string;
  bgColor: string;
  textColor: string;
  dotColor: string;
}

const STATUS_CONFIG: Record<ClaimStatus, StatusConfig> = {
  ingested: {
    label: 'Ingested',
    bgColor: 'bg-slate-100 dark:bg-slate-700',
    textColor: 'text-slate-700 dark:text-slate-300',
    dotColor: 'bg-slate-400 dark:bg-slate-500',
  },
  processing: {
    label: 'Processing',
    bgColor: 'bg-blue-50 dark:bg-blue-900/40',
    textColor: 'text-blue-700 dark:text-blue-300',
    dotColor: 'bg-blue-400 dark:bg-blue-500',
  },
  unassigned: {
    label: 'Unassigned',
    bgColor: 'bg-orange-50 dark:bg-orange-900/40',
    textColor: 'text-orange-700 dark:text-orange-300',
    dotColor: 'bg-orange-400 dark:bg-orange-500',
  },
  auto_processed: {
    label: 'Auto Processed',
    bgColor: 'bg-violet-50 dark:bg-violet-900/40',
    textColor: 'text-violet-700 dark:text-violet-300',
    dotColor: 'bg-violet-400 dark:bg-violet-500',
  },
  assigned: {
    label: 'Assigned',
    bgColor: 'bg-sky-50 dark:bg-sky-900/40',
    textColor: 'text-sky-700 dark:text-sky-300',
    dotColor: 'bg-sky-400 dark:bg-sky-500',
  },
  in_review: {
    label: 'In Review',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/40',
    textColor: 'text-indigo-700 dark:text-indigo-300',
    dotColor: 'bg-indigo-400 dark:bg-indigo-500',
  },
  validation_complete: {
    label: 'Validation Complete',
    bgColor: 'bg-teal-50 dark:bg-teal-900/40',
    textColor: 'text-teal-700 dark:text-teal-300',
    dotColor: 'bg-teal-400 dark:bg-teal-500',
  },
  rules_evaluated: {
    label: 'Rules Evaluated',
    bgColor: 'bg-cyan-50 dark:bg-cyan-900/40',
    textColor: 'text-cyan-700 dark:text-cyan-300',
    dotColor: 'bg-cyan-400 dark:bg-cyan-500',
  },
  pending_authorization: {
    label: 'Pending Authorization',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/40',
    textColor: 'text-yellow-700 dark:text-yellow-300',
    dotColor: 'bg-yellow-400 dark:bg-yellow-500',
  },
  approved: {
    label: 'Approved',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/40',
    textColor: 'text-emerald-700 dark:text-emerald-300',
    dotColor: 'bg-emerald-500 dark:bg-emerald-400',
  },
  rejected: {
    label: 'Rejected',
    bgColor: 'bg-red-50 dark:bg-red-900/40',
    textColor: 'text-red-700 dark:text-red-300',
    dotColor: 'bg-red-500 dark:bg-red-400',
  },
  returned: {
    label: 'Returned',
    bgColor: 'bg-amber-50 dark:bg-amber-900/40',
    textColor: 'text-amber-700 dark:text-amber-300',
    dotColor: 'bg-amber-400 dark:bg-amber-500',
  },
  payment_initiated: {
    label: 'Payment Initiated',
    bgColor: 'bg-lime-50 dark:bg-lime-900/40',
    textColor: 'text-lime-700 dark:text-lime-300',
    dotColor: 'bg-lime-500 dark:bg-lime-400',
  },
  payment_completed: {
    label: 'Payment Completed',
    bgColor: 'bg-green-50 dark:bg-green-900/40',
    textColor: 'text-green-700 dark:text-green-300',
    dotColor: 'bg-green-500 dark:bg-green-400',
  },
  closed: {
    label: 'Closed',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    textColor: 'text-gray-600 dark:text-gray-400',
    dotColor: 'bg-gray-400 dark:bg-gray-500',
  },
  escalated: {
    label: 'Escalated',
    bgColor: 'bg-rose-50 dark:bg-rose-900/40',
    textColor: 'text-rose-700 dark:text-rose-300',
    dotColor: 'bg-rose-500 dark:bg-rose-400',
  },
};

export function getStatusConfig(status: ClaimStatus): StatusConfig {
  return STATUS_CONFIG[status] ?? STATUS_CONFIG.ingested;
}

// ─────────────────────────────────────────────────────────────────────────────
// SLA info
// ─────────────────────────────────────────────────────────────────────────────

export interface SLAInfo {
  /** Percentage of SLA window that has elapsed (0 – 100, may exceed 100 when breached). */
  percentage: number;
  /** Tailwind colour token for the progress bar / indicator. */
  color: string;
  /** Human-readable label e.g. "6 hrs left" or "Breached". */
  label: string;
  isBreached: boolean;
}

/**
 * Calculates SLA progress relative to a 72-hour window ending at `deadline`.
 * The window start is inferred as `deadline - 72 hours`.
 */
export function getSLAInfo(deadline: string): SLAInfo {
  const deadlineMs = parseISO(deadline).getTime();
  const now = Date.now();

  if (now >= deadlineMs) {
    return {
      percentage: 100,
      color: 'bg-red-500',
      label: 'Breached',
      isBreached: true,
    };
  }

  const windowMs = 72 * 60 * 60 * 1000; // 72-hour SLA window
  const startMs = deadlineMs - windowMs;
  const elapsed = now - startMs;
  const percentage = Math.min(100, Math.max(0, (elapsed / windowMs) * 100));

  const remainingMs = deadlineMs - now;
  const remainingHours = remainingMs / (1000 * 60 * 60);

  let label: string;
  if (remainingHours < 1) {
    const mins = Math.ceil(remainingMs / (1000 * 60));
    label = `${mins} min${mins !== 1 ? 's' : ''} left`;
  } else if (remainingHours < 24) {
    const hrs = Math.ceil(remainingHours);
    label = `${hrs} hr${hrs !== 1 ? 's' : ''} left`;
  } else {
    const days = Math.ceil(remainingHours / 24);
    label = `${days} day${days !== 1 ? 's' : ''} left`;
  }

  let color: string;
  if (percentage >= 85) {
    color = 'bg-red-500';
  } else if (percentage >= 60) {
    color = 'bg-amber-500';
  } else {
    color = 'bg-emerald-500';
  }

  return { percentage, color, label, isBreached: false };
}

// ─────────────────────────────────────────────────────────────────────────────
// ID generator
// ─────────────────────────────────────────────────────────────────────────────

let _counter = 0;

/** Generates a simple unique ID string. */
export function generateId(): string {
  return `${Date.now().toString(36)}-${(++_counter).toString(36)}`;
}
