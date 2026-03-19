'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Pencil,
  X,
  Check,
  Hotel,
  Car,
  UtensilsCrossed,
  Plane,
  CreditCard,
  IdCard,
  Mail,
  FileQuestion,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConfidenceGauge, Button, TextInput, Select } from '@/components/ui';
import type { ClaimDocument, DocumentCategory } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface DocumentViewerProps {
  document: ClaimDocument;
  onFieldChange?: (fieldName: string, newValue: string, reason: string) => void;
  isReadOnly?: boolean;
  className?: string;
}

const OVERRIDE_REASONS = [
  { value: 'incorrect_extraction', label: 'Incorrect Extraction' },
  { value: 'duplicate_receipt', label: 'Duplicate Receipt' },
  { value: 'amount_mismatch', label: 'Amount Mismatch' },
  { value: 'currency_error', label: 'Currency Error' },
  { value: 'category_mismatch', label: 'Category Mismatch' },
  { value: 'not_eligible', label: 'Not Eligible' },
  { value: 'other', label: 'Other' },
];

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

const CATEGORY_COLORS: Record<DocumentCategory, string> = {
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
// Receipt Placeholder
// ─────────────────────────────────────────────────────────────────────────────

function ReceiptPlaceholder({ category }: { category: DocumentCategory }) {
  const Icon = CATEGORY_ICONS[category] ?? FileQuestion;
  const gradient = CATEGORY_COLORS[category] ?? 'from-slate-600 to-slate-800';
  const label = category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div
      className={cn(
        'w-full h-full flex flex-col items-center justify-center rounded-lg bg-gradient-to-br',
        gradient,
        'select-none',
      )}
    >
      {/* Receipt frame */}
      <div className="bg-white/10 rounded-xl p-8 flex flex-col items-center gap-4 backdrop-blur-sm border border-white/20 shadow-lg">
        <Icon className="w-12 h-12 text-white/90" strokeWidth={1.5} />
        <span className="text-white/80 text-sm font-medium tracking-wide uppercase font-mono">
          Receipt
        </span>
        <span className="text-white/60 text-xs font-medium">
          {label}
        </span>
        {/* Fake receipt lines */}
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
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Field Row
// ─────────────────────────────────────────────────────────────────────────────

interface FieldRowProps {
  name: string;
  value: string;
  confidence: number;
  overriddenValue?: string;
  overrideReason?: string;
  isReadOnly: boolean;
  onSave: (newValue: string, reason: string) => void;
}

function FieldRow({
  name,
  value,
  confidence,
  overriddenValue,
  overrideReason,
  isReadOnly,
  onSave,
}: FieldRowProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(overriddenValue ?? value);
  const [editReason, setEditReason] = useState('');
  const isOverridden = Boolean(overriddenValue);

  const displayLabel = name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const handleSave = () => {
    if (!editReason) return;
    onSave(editValue, editReason);
    setEditing(false);
  };

  const handleCancel = () => {
    setEditValue(overriddenValue ?? value);
    setEditReason('');
    setEditing(false);
  };

  return (
    <div
      className={cn(
        'px-4 py-3 transition-colors duration-150',
        isOverridden
          ? 'bg-amber-50 dark:bg-amber-950/30 border-l-[3px] border-amber-400'
          : 'border-l-[3px] border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50',
      )}
    >
      {/* Label */}
      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
        {displayLabel}
      </p>

      {!editing ? (
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            {isOverridden && (
              <p className="text-xs text-slate-400 dark:text-slate-500 line-through mb-0.5">
                {value}
              </p>
            )}
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
              {overriddenValue ?? value}
            </p>
            {isOverridden && overrideReason && (
              <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">
                Reason: {OVERRIDE_REASONS.find((r) => r.value === overrideReason)?.label ?? overrideReason}
              </p>
            )}
          </div>

          <ConfidenceGauge
            score={confidence}
            variant="ring"
            size="sm"
            showLabel={false}
            className="shrink-0"
          />

          {!isReadOnly && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className={cn(
                'shrink-0 p-1.5 rounded-md text-slate-400 transition-colors duration-150',
                'hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-700',
              )}
              aria-label={`Edit ${displayLabel}`}
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2 mt-1">
          <TextInput
            value={editValue}
            onChange={(v) => setEditValue(v)}
            placeholder="Enter corrected value"
          />
          <Select
            options={OVERRIDE_REASONS}
            value={editReason}
            onChange={(v) => setEditReason(v as string)}
            placeholder="Select override reason…"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="primary"
              icon={<Check className="w-3.5 h-3.5" />}
              onClick={handleSave}
              disabled={!editReason || !editValue}
            >
              Save
            </Button>
            <Button
              size="sm"
              variant="ghost"
              icon={<X className="w-3.5 h-3.5" />}
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function DocumentViewer({
  document,
  onFieldChange,
  isReadOnly = false,
  className,
}: DocumentViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [splitPercent, setSplitPercent] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 25, 200));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 25, 50));
  const handleRotate = () => setRotation((r) => (r + 90) % 360);
  const handleFitWidth = () => setZoom(100);

  const handleMouseDown = useCallback(() => {
    draggingRef.current = true;
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!draggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = Math.max(20, Math.min(80, (x / rect.width) * 100));
      setSplitPercent(pct);
    },
    [],
  );

  const handleMouseUp = useCallback(() => {
    draggingRef.current = false;
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex h-full overflow-hidden rounded-[var(--radius-lg)] border border-slate-200 dark:border-slate-700',
        className,
      )}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* ── Left pane: document preview ─────────────────────────── */}
      <div
        className="flex flex-col bg-slate-900 overflow-hidden"
        style={{ width: `${splitPercent}%` }}
      >
        {/* Toolbar */}
        <div className="flex items-center gap-1 px-3 py-2 bg-slate-800 border-b border-slate-700 shrink-0">
          <button
            type="button"
            onClick={handleZoomOut}
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
            onClick={handleZoomIn}
            disabled={zoom >= 200}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-40 transition-colors"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-4 bg-slate-600 mx-1" />
          <button
            type="button"
            onClick={handleRotate}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            aria-label="Rotate"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleFitWidth}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            aria-label="Fit to width"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Document area */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-6">
          <div
            className="transition-transform duration-200 w-full max-w-xs"
            style={{
              transform: `rotate(${rotation}deg) scale(${zoom / 100})`,
              transformOrigin: 'center center',
            }}
          >
            <div className="aspect-[3/4] w-full rounded-lg overflow-hidden shadow-xl">
              <ReceiptPlaceholder category={document.category} />
            </div>
          </div>
        </div>

        {/* Category chip */}
        <div className="px-3 py-2 bg-slate-800/80 border-t border-slate-700 shrink-0">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">
            {document.category.replace(/_/g, ' ')}
          </span>
          <span className="ml-2 text-[10px] text-slate-500">
            Confidence: {document.classificationConfidence}%
          </span>
        </div>
      </div>

      {/* ── Drag handle ──────────────────────────────────────────── */}
      <div
        onMouseDown={handleMouseDown}
        className={cn(
          'w-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-[var(--color-brand-primary)] cursor-col-resize',
          'transition-colors duration-150 shrink-0',
        )}
        aria-label="Resize panes"
      />

      {/* ── Right pane: extracted fields ────────────────────────── */}
      <div
        className="flex flex-col bg-white dark:bg-slate-900 overflow-hidden"
        style={{ width: `${100 - splitPercent}%` }}
      >
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Extracted Fields
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {document.extractedFields.length} fields extracted
          </p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
          {document.extractedFields.map((field) => (
            <FieldRow
              key={field.name}
              name={field.name}
              value={field.value}
              confidence={field.confidence}
              overriddenValue={field.overriddenValue}
              overrideReason={field.overrideReason}
              isReadOnly={isReadOnly}
              onSave={(newValue, reason) => onFieldChange?.(field.name, newValue, reason)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default DocumentViewer;
