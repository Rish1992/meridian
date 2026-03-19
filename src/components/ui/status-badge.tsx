'use client';

import React from 'react';
import {
  Sparkles,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  CreditCard,
  Lock,
  AlertOctagon,
  Loader2,
  UserCheck,
  Search,
  ShieldCheck,
  ListChecks,
  FileInput,
  Banknote,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStatusConfig } from '@/lib/utils';
import type { ClaimStatus } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface StatusBadgeProps {
  status: ClaimStatus;
  size?: 'sm' | 'md';
  showIcon?: boolean;
  showDot?: boolean;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Status icon map
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_ICONS: Record<ClaimStatus, React.ElementType> = {
  ingested: FileInput,
  processing: Loader2,
  unassigned: Clock,
  auto_processed: Sparkles,
  assigned: UserCheck,
  in_review: Search,
  validation_complete: ShieldCheck,
  rules_evaluated: ListChecks,
  pending_authorization: Lock,
  approved: CheckCircle2,
  rejected: XCircle,
  returned: RotateCcw,
  payment_initiated: CreditCard,
  payment_completed: Banknote,
  closed: AlertOctagon,
  escalated: AlertTriangle,
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function StatusBadge({
  status,
  size = 'md',
  showIcon = false,
  showDot = false,
  className,
}: StatusBadgeProps) {
  const config = getStatusConfig(status);
  const IconComponent = STATUS_ICONS[status];

  const sizeClasses = size === 'sm'
    ? 'text-[10px] px-2 py-0.5 gap-1'
    : 'text-xs px-2.5 py-1 gap-1.5';

  const iconSize = size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3';
  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-[6px] h-[6px]';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold',
        config.bgColor,
        config.textColor,
        sizeClasses,
        className,
      )}
    >
      {showDot && !showIcon && (
        <span
          className={cn('shrink-0 rounded-full', dotSize, config.dotColor)}
          aria-hidden="true"
        />
      )}
      {showIcon && IconComponent && (
        <IconComponent
          className={cn(
            iconSize,
            'shrink-0',
            status === 'processing' && 'animate-spin',
          )}
          aria-hidden="true"
        />
      )}
      {config.label}
    </span>
  );
}

export default StatusBadge;
