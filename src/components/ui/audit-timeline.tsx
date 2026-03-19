'use client';

import React, { useState } from 'react';
import {
  Monitor,
  CheckCircle2,
  PenLine,
  XCircle,
  ClipboardList,
  User,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDateTime, formatRelativeTime } from '@/lib/utils';
import { Skeleton } from './skeleton';
import type { AuditEvent, AuditActionType } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface AuditTimelineProps {
  events: AuditEvent[];
  isLoading?: boolean;
  maxEvents?: number;
  className?: string;
  onEventClick?: (event: AuditEvent) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Action type → color & icon
// ─────────────────────────────────────────────────────────────────────────────

type NodeCategory = 'system' | 'approval' | 'override' | 'rejection' | 'qc' | 'assignment';

const CATEGORY_COLORS: Record<NodeCategory, string> = {
  system: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
  approval: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
  override: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
  rejection: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
  qc: 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400',
  assignment: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
};

const CONNECTOR_COLORS: Record<NodeCategory, string> = {
  system: 'bg-blue-200 dark:bg-blue-800',
  approval: 'bg-emerald-200 dark:bg-emerald-800',
  override: 'bg-amber-200 dark:bg-amber-800',
  rejection: 'bg-red-200 dark:bg-red-800',
  qc: 'bg-purple-200 dark:bg-purple-800',
  assignment: 'bg-slate-200 dark:bg-slate-700',
};

const CATEGORY_ICONS: Record<NodeCategory, React.ElementType> = {
  system: Monitor,
  approval: CheckCircle2,
  override: PenLine,
  rejection: XCircle,
  qc: ClipboardList,
  assignment: User,
};

function getCategory(actionType: AuditActionType): NodeCategory {
  if (actionType.startsWith('qc_')) return 'qc';
  if (actionType.includes('approv') || actionType.includes('payment') || actionType.includes('granted')) return 'approval';
  if (actionType.includes('reject') || actionType.includes('denied') || actionType.includes('fail')) return 'rejection';
  if (actionType.includes('override') || actionType.includes('escalat') || actionType.includes('return')) return 'override';
  if (actionType.includes('assign')) return 'assignment';
  return 'system';
}

// ─────────────────────────────────────────────────────────────────────────────
// JSON Diff
// ─────────────────────────────────────────────────────────────────────────────

function JsonDiff({
  before,
  after,
}: {
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
}) {
  if (!before && !after) return null;

  return (
    <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
      {before && (
        <div>
          <p className="mb-1 font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Before</p>
          <pre className="rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 overflow-auto max-h-32 text-slate-700 dark:text-slate-300">
            {JSON.stringify(before, null, 2)}
          </pre>
        </div>
      )}
      {after && (
        <div>
          <p className="mb-1 font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">After</p>
          <pre className="rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 overflow-auto max-h-32 text-slate-700 dark:text-slate-300">
            {JSON.stringify(after, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Single event node
// ─────────────────────────────────────────────────────────────────────────────

function TimelineNode({
  event,
  isLast,
  onEventClick,
}: {
  event: AuditEvent;
  isLast: boolean;
  onEventClick?: (event: AuditEvent) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const category = getCategory(event.actionType);
  const IconComponent = CATEGORY_ICONS[category];
  const hasDiff = !!(event.beforeState || event.afterState);

  return (
    <div className="relative flex gap-3">
      {/* Vertical connector line */}
      {!isLast && (
        <div
          className={cn(
            'absolute left-[17px] top-9 bottom-0 w-0.5',
            CONNECTOR_COLORS[category],
          )}
          aria-hidden="true"
        />
      )}

      {/* Icon circle */}
      <div
        className={cn(
          'relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
          CATEGORY_COLORS[category],
        )}
      >
        <IconComponent className="w-4 h-4" aria-hidden="true" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-5">
        <div className="flex flex-wrap items-start gap-x-2 gap-y-1">
          {onEventClick ? (
            <button
              type="button"
              onClick={() => onEventClick(event)}
              className="text-sm text-slate-800 dark:text-slate-200 font-medium leading-snug hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
            >
              {event.description}
            </button>
          ) : (
            <p className="text-sm text-slate-800 dark:text-slate-200 font-medium leading-snug">
              {event.description}
            </p>
          )}
          {/* Actor badge */}
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
            {event.actorType === 'system' ? (
              <Monitor className="w-2.5 h-2.5" />
            ) : event.actorType === 'ai' ? (
              <span>AI</span>
            ) : (
              <User className="w-2.5 h-2.5" />
            )}
            {event.actorName}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-1">
          <time
            dateTime={event.timestamp}
            className="text-[11px] text-slate-500 dark:text-slate-400 font-medium"
          >
            {formatDateTime(event.timestamp)}
            <span className="text-slate-400 dark:text-slate-500 font-normal ml-1">
              ({formatRelativeTime(event.timestamp)})
            </span>
          </time>

          {hasDiff && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="inline-flex items-center gap-0.5 text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-3 h-3" /> Hide diff
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3" /> Show diff
                </>
              )}
            </button>
          )}
        </div>

        {hasDiff && expanded && (
          <JsonDiff before={event.beforeState} after={event.afterState} />
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Loading skeleton
// ─────────────────────────────────────────────────────────────────────────────

function TimelineSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-0">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-3 pb-5">
          <Skeleton className="w-9 h-9 rounded-full shrink-0" />
          <div className="flex-1 pt-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function AuditTimeline({
  events,
  isLoading = false,
  maxEvents,
  className,
  onEventClick,
}: AuditTimelineProps) {
  const displayed = maxEvents ? events.slice(0, maxEvents) : events;

  return (
    <div className={cn('w-full', className)}>
      {isLoading ? (
        <TimelineSkeleton />
      ) : displayed.length === 0 ? (
        <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-8">
          No audit events to display.
        </p>
      ) : (
        <div>
          {displayed.map((event, i) => (
            <TimelineNode
              key={event.id}
              event={event}
              isLast={i === displayed.length - 1}
              onEventClick={onEventClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default AuditTimeline;
