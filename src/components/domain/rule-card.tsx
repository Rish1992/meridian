'use client';

import React from 'react';
import { Pencil, FlaskConical, Power, CheckCircle2, XCircle } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { Badge, Button } from '@/components/ui';
import type { BusinessRule, RuleEvaluation } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface RuleCardProps {
  rule: BusinessRule;
  variant?: 'builder' | 'evaluation';
  evaluationResult?: RuleEvaluation;
  onEdit?: (ruleId: string) => void;
  onTest?: (ruleId: string) => void;
  onToggle?: (ruleId: string, newStatus: BusinessRule['status']) => void;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_ACCENTS: Record<BusinessRule['status'], string> = {
  active: 'bg-emerald-500',
  draft: 'bg-amber-400',
  archived: 'bg-slate-400',
};

const STATUS_BADGES: Record<BusinessRule['status'], { label: string; variant: string }> = {
  active: { label: 'Active', variant: 'success' },
  draft: { label: 'Draft', variant: 'warning' },
  archived: { label: 'Archived', variant: 'neutral' },
};

/**
 * Converts a conditions/actions Record to a plain-English summary string.
 * Falls back to a generic message if the object can't be meaningfully parsed.
 */
function conditionsToText(conditions: Record<string, unknown>): string {
  const entries = Object.entries(conditions);
  if (entries.length === 0) return 'No conditions defined.';
  return entries
    .map(([k, v]) => {
      const key = k.replace(/_/g, ' ');
      if (typeof v === 'object' && v !== null) {
        const inner = Object.entries(v as Record<string, unknown>)
          .map(([op, val]) => `${op} ${val}`)
          .join(', ');
        return `${key} ${inner}`;
      }
      return `${key} = ${v}`;
    })
    .join(' AND ');
}

function actionsToText(actions: Record<string, unknown>): string {
  const entries = Object.entries(actions);
  if (entries.length === 0) return 'No actions defined.';
  return entries
    .map(([k, v]) => {
      const key = k.replace(/_/g, ' ');
      return `${key}: ${v}`;
    })
    .join('; ');
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function RuleCard({
  rule,
  variant = 'builder',
  evaluationResult,
  onEdit,
  onTest,
  onToggle,
  className,
}: RuleCardProps) {
  const accentColor = STATUS_ACCENTS[rule.status];
  const statusBadge = STATUS_BADGES[rule.status];

  const handleToggle = () => {
    if (!onToggle) return;
    const next: BusinessRule['status'] = rule.status === 'active' ? 'archived' : 'active';
    onToggle(rule.id, next);
  };

  return (
    <div
      className={cn(
        'bg-white dark:bg-slate-900 rounded-[var(--radius-md)] border border-slate-200 dark:border-slate-700',
        'overflow-hidden transition-shadow duration-150 hover:shadow-[var(--shadow-sm)]',
        'flex',
        className,
      )}
    >
      {/* Left accent stripe */}
      <div className={cn('w-1 shrink-0', accentColor)} />

      {/* Main content */}
      <div className="flex-1 px-4 py-4 min-w-0">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                {rule.name}
              </h3>
              <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded">
                v{rule.version}
              </span>
              <span
                className={cn(
                  'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                  rule.status === 'active'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                    : rule.status === 'draft'
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
                )}
              >
                {statusBadge.label}
              </span>
            </div>
          </div>
        </div>

        {/* Conditions */}
        <div className="mb-3">
          <p className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1.5 font-medium">
            Condition
          </p>
          <p className="text-xs font-[var(--font-mono)] text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded-[var(--radius-sm)] px-3 py-2 leading-relaxed">
            {conditionsToText(rule.conditions)}
          </p>
        </div>

        {/* Actions */}
        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1.5 font-medium">
            Action
          </p>
          <p className="text-xs font-[var(--font-mono)] text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded-[var(--radius-sm)] px-3 py-2 leading-relaxed">
            {actionsToText(rule.actions)}
          </p>
        </div>

        {/* Evaluation result */}
        {variant === 'evaluation' && evaluationResult && (
          <div className="flex items-center gap-3 py-2.5 px-3 rounded-[var(--radius-sm)] bg-slate-50 dark:bg-slate-800 mb-3">
            {evaluationResult.result === 'pass' ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  Pass
                </span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span className="text-xs font-semibold text-red-700 dark:text-red-400">
                  Fail
                </span>
              </>
            )}
            {evaluationResult.calculatedAmount > 0 && (
              <>
                <span className="text-slate-300 dark:text-slate-600">·</span>
                <span className="text-xs text-slate-600 dark:text-slate-300 tabular-nums">
                  Calculated: <span className="font-semibold">{formatCurrency(evaluationResult.calculatedAmount)}</span>
                </span>
              </>
            )}
          </div>
        )}

        {/* Builder actions */}
        {variant === 'builder' && (
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                size="sm"
                variant="secondary"
                icon={<Pencil className="w-3.5 h-3.5" />}
                onClick={() => onEdit(rule.id)}
              >
                Edit
              </Button>
            )}
            {onTest && (
              <Button
                size="sm"
                variant="ghost"
                icon={<FlaskConical className="w-3.5 h-3.5" />}
                onClick={() => onTest(rule.id)}
              >
                Test
              </Button>
            )}
            {onToggle && (
              <Button
                size="sm"
                variant="ghost"
                icon={<Power className="w-3.5 h-3.5" />}
                onClick={handleToggle}
                className={cn(
                  rule.status === 'active'
                    ? 'text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30'
                    : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30',
                )}
              >
                {rule.status === 'active' ? 'Deactivate' : 'Activate'}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default RuleCard;
