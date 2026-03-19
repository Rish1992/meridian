'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Star, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Toggle } from '@/components/ui';
import type { QCReview, QCSection, QCChecklistItem, QCVerdict } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface QCChecklistPanelProps {
  review?: QCReview;
  onChange?: (review: Partial<QCReview>) => void;
  isReadOnly?: boolean;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const VERDICTS: { value: QCVerdict; label: string; color: string; dotColor: string }[] = [
  { value: 'compliant', label: 'Compliant', color: 'text-emerald-700 dark:text-emerald-400', dotColor: 'bg-emerald-500' },
  { value: 'minor_issues', label: 'Minor Issues', color: 'text-amber-700 dark:text-amber-400', dotColor: 'bg-amber-500' },
  { value: 'major_issues', label: 'Major Issues', color: 'text-rose-700 dark:text-rose-400', dotColor: 'bg-rose-500' },
  { value: 'critical', label: 'Critical', color: 'text-red-700 dark:text-red-400', dotColor: 'bg-red-600' },
];

const DEFAULT_SECTIONS: QCSection[] = [
  {
    title: 'Document Validation',
    items: [
      { question: 'Are all required documents present and legible?', rating: 3 },
      { question: 'Do document dates align with the disruption?', rating: 3 },
      { question: 'Are amounts consistent across all documents?', rating: 3 },
    ],
  },
  {
    title: 'Agent Decision Quality',
    items: [
      { question: 'Was the eligibility assessment accurate?', rating: 3 },
      { question: 'Were policy rules applied correctly?', rating: 3 },
      { question: 'Is the override justification sufficient?', rating: 3 },
    ],
  },
  {
    title: 'Process Compliance',
    items: [
      { question: 'Was the SLA timeline followed?', rating: 3 },
      { question: 'Are all mandatory fields completed?', rating: 3 },
      { question: 'Is the audit trail complete?', rating: 3 },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Star rating
// ─────────────────────────────────────────────────────────────────────────────

function StarRating({
  value,
  onChange,
  isReadOnly,
}: {
  value: number;
  onChange?: (rating: number) => void;
  isReadOnly: boolean;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = (hovered || value) >= star;
        return (
          <button
            key={star}
            type="button"
            disabled={isReadOnly}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => !isReadOnly && setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className={cn(
              'transition-all duration-100',
              isReadOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110',
            )}
            aria-label={`Rate ${star} out of 5`}
          >
            <Star
              className={cn(
                'w-4 h-4 transition-colors duration-100',
                filled
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-slate-300 dark:text-slate-600',
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section
// ─────────────────────────────────────────────────────────────────────────────

interface SectionPanelProps {
  section: QCSection;
  sectionIndex: number;
  isReadOnly: boolean;
  sectionComment: string;
  onItemRating: (sectionIndex: number, itemIndex: number, rating: number) => void;
  onSectionComment: (sectionIndex: number, comment: string) => void;
}

function SectionPanel({
  section,
  sectionIndex,
  isReadOnly,
  sectionComment,
  onItemRating,
  onSectionComment,
}: SectionPanelProps) {
  const [collapsed, setCollapsed] = useState(false);

  const avgRating =
    section.items.length > 0
      ? section.items.reduce((s, i) => s + i.rating, 0) / section.items.length
      : 0;

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-[var(--radius-md)] overflow-hidden">
      {/* Section header */}
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className={cn(
          'w-full flex items-center justify-between px-4 py-3',
          'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750',
          'transition-colors duration-150',
        )}
      >
        <div className="flex items-center gap-2">
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {section.title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 dark:text-slate-400">
            avg {avgRating.toFixed(1)}
          </span>
          <StarRating value={Math.round(avgRating)} isReadOnly onChange={() => {}} />
        </div>
      </button>

      {/* Section body */}
      {!collapsed && (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {section.items.map((item, itemIndex) => (
            <div key={itemIndex} className="px-4 py-3 flex items-start gap-3">
              <p className="flex-1 text-sm text-slate-700 dark:text-slate-300 leading-snug">
                {item.question}
              </p>
              <div className="shrink-0">
                <StarRating
                  value={item.rating}
                  onChange={(r) => onItemRating(sectionIndex, itemIndex, r)}
                  isReadOnly={isReadOnly}
                />
              </div>
            </div>
          ))}

          {/* Section comment */}
          <div className="px-4 py-3">
            <label className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500 font-medium mb-1.5 block">
              Section Notes
            </label>
            <textarea
              value={sectionComment}
              onChange={(e) => onSectionComment(sectionIndex, e.target.value)}
              disabled={isReadOnly}
              rows={2}
              placeholder="Add section-specific comments…"
              className={cn(
                'w-full text-xs rounded-[var(--radius-sm)] border px-3 py-2 resize-none',
                'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300',
                'placeholder:text-slate-400 dark:placeholder:text-slate-600',
                'border-slate-200 dark:border-slate-700',
                'focus:outline-none focus:border-[var(--color-brand-primary)] focus:ring-1 focus:ring-[var(--color-brand-primary)]/20',
                'disabled:opacity-60 disabled:cursor-not-allowed',
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function QCChecklistPanel({
  review,
  onChange,
  isReadOnly = false,
  className,
}: QCChecklistPanelProps) {
  const [sections, setSections] = useState<QCSection[]>(
    review?.sections ?? DEFAULT_SECTIONS,
  );
  const [sectionComments, setSectionComments] = useState<string[]>(
    review?.sections?.map(() => '') ?? DEFAULT_SECTIONS.map(() => ''),
  );
  const [verdict, setVerdict] = useState<QCVerdict>(review?.verdict ?? 'compliant');
  const [overallComments, setOverallComments] = useState(review?.overallComments ?? '');
  const [flaggedForTraining, setFlaggedForTraining] = useState(
    review?.flaggedForTraining ?? false,
  );

  const handleItemRating = (sectionIndex: number, itemIndex: number, rating: number) => {
    const updated = sections.map((s, si) =>
      si === sectionIndex
        ? {
            ...s,
            items: s.items.map((item, ii) =>
              ii === itemIndex ? { ...item, rating: rating as 1 | 2 | 3 | 4 | 5 } : item,
            ),
          }
        : s,
    );
    setSections(updated);
    onChange?.({ sections: updated });
  };

  const handleSectionComment = (sectionIndex: number, comment: string) => {
    const updated = sectionComments.map((c, i) => (i === sectionIndex ? comment : c));
    setSectionComments(updated);
  };

  const handleVerdictChange = (v: QCVerdict) => {
    setVerdict(v);
    onChange?.({ verdict: v });
  };

  const handleOverallCommentsChange = (val: string) => {
    setOverallComments(val);
    onChange?.({ overallComments: val });
  };

  const handleFlagToggle = (checked: boolean) => {
    setFlaggedForTraining(checked);
    onChange?.({ flaggedForTraining: checked });
  };

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Sections */}
      {sections.map((section, si) => (
        <SectionPanel
          key={si}
          section={section}
          sectionIndex={si}
          isReadOnly={isReadOnly}
          sectionComment={sectionComments[si] ?? ''}
          onItemRating={handleItemRating}
          onSectionComment={handleSectionComment}
        />
      ))}

      {/* Verdict */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[var(--radius-md)] p-4">
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-3 uppercase tracking-wide">
          Verdict
        </p>
        <div className="flex flex-wrap gap-3">
          {VERDICTS.map((v) => (
            <label
              key={v.value}
              className={cn(
                'flex items-center gap-2 cursor-pointer group',
                isReadOnly && 'cursor-default opacity-80',
              )}
            >
              <input
                type="radio"
                name="qc-verdict"
                value={v.value}
                checked={verdict === v.value}
                onChange={() => !isReadOnly && handleVerdictChange(v.value)}
                disabled={isReadOnly}
                className="sr-only"
              />
              <span
                className={cn(
                  'w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-all duration-150',
                  verdict === v.value
                    ? `${v.dotColor} border-transparent`
                    : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600',
                )}
              >
                {verdict === v.value && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </span>
              <span className={cn('text-sm font-medium', verdict === v.value ? v.color : 'text-slate-600 dark:text-slate-400')}>
                {v.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Overall comments */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[var(--radius-md)] p-4">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2 block uppercase tracking-wide">
          Overall Comments
        </label>
        <textarea
          value={overallComments}
          onChange={(e) => handleOverallCommentsChange(e.target.value)}
          disabled={isReadOnly}
          rows={3}
          placeholder="Summarize the QC review findings…"
          className={cn(
            'w-full text-sm rounded-[var(--radius-sm)] border px-3 py-2 resize-y',
            'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300',
            'placeholder:text-slate-400 dark:placeholder:text-slate-600',
            'border-slate-200 dark:border-slate-700',
            'focus:outline-none focus:border-[var(--color-brand-primary)] focus:ring-1 focus:ring-[var(--color-brand-primary)]/20',
            'disabled:opacity-60 disabled:cursor-not-allowed disabled:resize-none',
          )}
        />
      </div>

      {/* Flag for training */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[var(--radius-md)] px-4 py-3">
        <Toggle
          checked={flaggedForTraining}
          onChange={handleFlagToggle}
          disabled={isReadOnly}
          label="Flag for Training"
          description="Mark this claim for use as a training example for agents."
        />
      </div>
    </div>
  );
}

export default QCChecklistPanel;
