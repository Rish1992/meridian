'use client';

import React from 'react';
import { Plane } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface FlightRouteVisualizerProps {
  origin: { code: string; city: string };
  destination: { code: string; city: string };
  variant?: 'inline' | 'card';
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Arc SVG (dashed curve)
// ─────────────────────────────────────────────────────────────────────────────

function RouteArc() {
  return (
    <svg
      viewBox="0 0 120 40"
      className="w-full h-10"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      {/* Dashed arc path */}
      <path
        d="M 10 30 Q 60 -5 110 30"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        className="text-slate-300 dark:text-slate-600"
      />
      {/* Dot at origin */}
      <circle cx="10" cy="30" r="2.5" className="fill-[var(--color-brand-primary)]" />
      {/* Plane icon at midpoint */}
      <g transform="translate(57, 6) rotate(0)">
        <circle r="7" className="fill-white dark:fill-slate-900" />
        {/* Simplified plane shape */}
        <path
          d="M-4 0 L0 -3 L4 0 L0 1 Z"
          className="fill-[var(--color-brand-primary)]"
          transform="rotate(90)"
        />
      </g>
      {/* Dot at destination */}
      <circle cx="110" cy="30" r="2.5" className="fill-slate-400 dark:fill-slate-500" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Inline variant
// ─────────────────────────────────────────────────────────────────────────────

function InlineRoute({
  origin,
  destination,
  className,
}: FlightRouteVisualizerProps) {
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300', className)}
    >
      <span className="font-semibold text-slate-900 dark:text-slate-100">{origin.code}</span>
      <Plane className="w-3.5 h-3.5 text-[var(--color-brand-primary)] shrink-0" aria-hidden="true" />
      <span className="font-semibold text-slate-900 dark:text-slate-100">{destination.code}</span>
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Card variant
// ─────────────────────────────────────────────────────────────────────────────

function CardRoute({
  origin,
  destination,
  className,
}: FlightRouteVisualizerProps) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-slate-900 rounded-[var(--radius-md)] border border-slate-200 dark:border-slate-700',
        'px-4 py-3',
        className,
      )}
    >
      {/* IATA codes + city names */}
      <div className="flex items-start justify-between mb-1">
        {/* Origin */}
        <div className="text-left">
          <p className="text-xl font-bold text-slate-900 dark:text-slate-50 font-[var(--font-mono)] leading-none tracking-tight">
            {origin.code}
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate max-w-[80px]">
            {origin.city}
          </p>
        </div>

        {/* Destination */}
        <div className="text-right">
          <p className="text-xl font-bold text-slate-900 dark:text-slate-50 font-[var(--font-mono)] leading-none tracking-tight">
            {destination.code}
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate max-w-[80px] text-right">
            {destination.city}
          </p>
        </div>
      </div>

      {/* Arc visualization */}
      <RouteArc />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function FlightRouteVisualizer({
  origin,
  destination,
  variant = 'inline',
  className,
}: FlightRouteVisualizerProps) {
  if (variant === 'card') {
    return (
      <CardRoute
        origin={origin}
        destination={destination}
        variant={variant}
        className={className}
      />
    );
  }
  return (
    <InlineRoute
      origin={origin}
      destination={destination}
      variant={variant}
      className={className}
    />
  );
}

export default FlightRouteVisualizer;
