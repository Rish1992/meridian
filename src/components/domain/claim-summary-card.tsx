'use client';

import React from 'react';
import { Plane, MapPin, Clock } from 'lucide-react';
import { cn, formatCurrency, getSLAInfo } from '@/lib/utils';
import { StatusBadge } from '@/components/ui';
import type { Claim } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ClaimSummaryCardProps {
  claim: Claim;
  variant?: 'full' | 'compact' | 'mini';
  className?: string;
  onClick?: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// SLA Progress Bar
// ─────────────────────────────────────────────────────────────────────────────

function SLAProgressBar({ deadline, compact = false }: { deadline: string; compact?: boolean }) {
  const sla = getSLAInfo(deadline);
  const isWarning = !sla.isBreached && sla.percentage >= 75;
  const isBreached = sla.isBreached;

  return (
    <div className="flex flex-col gap-1">
      {!compact && (
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            SLA
          </span>
          <span
            className={cn(
              'text-[10px] font-medium tabular-nums',
              isBreached
                ? 'text-red-600 dark:text-red-400'
                : isWarning
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-slate-500 dark:text-slate-400',
            )}
          >
            {sla.label}
          </span>
        </div>
      )}
      <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', sla.color)}
          style={{ width: `${Math.min(sla.percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Full variant
// ─────────────────────────────────────────────────────────────────────────────

function FullCard({ claim, className, onClick }: ClaimSummaryCardProps) {
  const sla = getSLAInfo(claim.slaDeadline);
  const isWarning = !sla.isBreached && sla.percentage >= 75;
  const isBreached = sla.isBreached;
  const { flight } = claim;

  const scheduledDep = flight.scheduledDeparture
    ? new Date(flight.scheduledDeparture).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : '—';

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white dark:bg-slate-900 rounded-[var(--radius-lg)] border transition-all duration-150',
        'flex flex-col overflow-hidden',
        onClick && 'cursor-pointer hover:shadow-[var(--shadow-md)]',
        isBreached
          ? 'border-red-300 dark:border-red-800 animate-[pulse-border_2s_ease-in-out_infinite]'
          : isWarning
          ? 'border-amber-300 dark:border-amber-700 animate-[pulse-border_2s_ease-in-out_infinite]'
          : 'border-slate-200 dark:border-slate-700',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
          {claim.id}
        </span>
        <StatusBadge status={claim.status} size="sm" showDot />
      </div>

      {/* Passenger name */}
      <div className="px-4 pb-3">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 font-[var(--font-display)] leading-tight">
          {claim.passenger.name}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          PNR: <span className="font-mono font-semibold">{claim.pnr}</span>
        </p>
      </div>

      {/* Flight info */}
      <div className="flex flex-col gap-1.5 px-4 pb-3 border-t border-slate-100 dark:border-slate-800 pt-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
          <Plane className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-semibold">{flight.flightNumber}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>
            {flight.routeOrigin} → {flight.routeDestination}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{scheduledDep}</span>
        </div>
      </div>

      {/* Amounts */}
      <div className="flex items-end justify-between px-4 pb-3 border-t border-slate-100 dark:border-slate-800 pt-3">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Claimed
          </p>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-50 tabular-nums">
            {formatCurrency(claim.totalClaimed, claim.currency)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Approved
          </p>
          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {formatCurrency(claim.totalApproved, claim.currency)}
          </p>
        </div>
      </div>

      {/* SLA bar */}
      <div className="px-4 pb-4 pt-1">
        <SLAProgressBar deadline={claim.slaDeadline} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Compact variant
// ─────────────────────────────────────────────────────────────────────────────

function CompactCard({ claim, className, onClick }: ClaimSummaryCardProps) {
  const sla = getSLAInfo(claim.slaDeadline);
  const isWarning = !sla.isBreached && sla.percentage >= 75;
  const isBreached = sla.isBreached;

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white dark:bg-slate-900 rounded-[var(--radius-md)] border p-3 transition-all duration-150',
        onClick && 'cursor-pointer hover:shadow-[var(--shadow-sm)]',
        isBreached
          ? 'border-red-200 dark:border-red-800'
          : isWarning
          ? 'border-amber-200 dark:border-amber-700'
          : 'border-slate-200 dark:border-slate-700',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
            {claim.passenger.name}
          </p>
          <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
            {claim.id}
          </p>
        </div>
        <StatusBadge status={claim.status} size="sm" />
      </div>

      <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 mb-2">
        <Plane className="w-3 h-3 text-slate-400 shrink-0" />
        <span className="font-medium">{claim.flight.flightNumber}</span>
        <span className="text-slate-400">·</span>
        <span>
          {claim.flight.routeOrigin} → {claim.flight.routeDestination}
        </span>
      </div>

      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-slate-800 dark:text-slate-100 tabular-nums">
          {formatCurrency(claim.totalClaimed, claim.currency)}
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
          {sla.label}
        </span>
      </div>

      <SLAProgressBar deadline={claim.slaDeadline} compact />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Mini variant
// ─────────────────────────────────────────────────────────────────────────────

function MiniCard({ claim, className, onClick }: ClaimSummaryCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 p-2.5 rounded-[var(--radius-md)]',
        'border border-slate-200 dark:border-slate-700',
        'bg-white dark:bg-slate-900 transition-colors duration-150',
        onClick && 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800',
        className,
      )}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
          {claim.passenger.name}
        </p>
        <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
          {claim.id}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-slate-800 dark:text-slate-100 tabular-nums">
          {formatCurrency(claim.totalClaimed, claim.currency)}
        </p>
        <StatusBadge status={claim.status} size="sm" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function ClaimSummaryCard({
  claim,
  variant = 'full',
  className,
  onClick,
}: ClaimSummaryCardProps) {
  if (variant === 'compact') {
    return <CompactCard claim={claim} variant={variant} className={className} onClick={onClick} />;
  }
  if (variant === 'mini') {
    return <MiniCard claim={claim} variant={variant} className={className} onClick={onClick} />;
  }
  return <FullCard claim={claim} variant={variant} className={className} onClick={onClick} />;
}

export default ClaimSummaryCard;
