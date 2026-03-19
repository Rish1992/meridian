'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ColorZone {
  start: number;
  end: number;
  color: string;
}

export interface GaugeChartProps {
  value: number;
  target?: number;
  label?: string;
  colorZones?: ColorZone[];
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const SVG_SIZE = 200;
const CX = SVG_SIZE / 2;
const CY = SVG_SIZE / 2;
const RADIUS = 80;
const STROKE_WIDTH = 8;

/** Convert a 0-100 gauge value to an angle in degrees (180° arc, left→right). */
function valueToAngle(val: number): number {
  // 0 → -180°, 100 → 0°  (top of semicircle)
  return -180 + (Math.min(Math.max(val, 0), 100) / 100) * 180;
}

/** Polar to Cartesian for the SVG arc. cx/cy are the center, angle in degrees from east. */
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

/**
 * Build an SVG arc path for a semicircle gauge segment.
 * startAngle and endAngle are in the gauge domain (0=left, 100=right of arc).
 * The SVG arc runs from 180° to 360° (left to right across the top).
 */
function describeArc(
  cx: number,
  cy: number,
  r: number,
  startVal: number,
  endVal: number,
): string {
  // Map gauge values (0-100) to SVG angles. 0 → 180°, 100 → 360° (=0°)
  const startAngle = 180 + (startVal / 100) * 180;
  const endAngle = 180 + (endVal / 100) * 180;

  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

function getDefaultColor(value: number): string {
  if (value >= 85) return '#10B981'; // emerald
  if (value >= 60) return '#F59E0B'; // amber
  return '#EF4444'; // red
}

function getZoneColor(value: number, zones: ColorZone[]): string {
  for (const zone of zones) {
    if (value >= zone.start && value <= zone.end) return zone.color;
  }
  return getDefaultColor(value);
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook: animated fill 0 → value
// ─────────────────────────────────────────────────────────────────────────────

function useAnimatedValue(target: number, duration = 800): number {
  const [current, setCurrent] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(eased * target);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return current;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function GaugeChart({
  value,
  target,
  label,
  colorZones,
  className,
}: GaugeChartProps) {
  const animatedValue = useAnimatedValue(value, 800);
  const fillColor = colorZones
    ? getZoneColor(value, colorZones)
    : getDefaultColor(value);

  // Track arc: full semicircle (0 → 100)
  const trackPath = describeArc(CX, CY, RADIUS, 0, 100);
  // Fill arc: 0 → animated value
  const fillPath = describeArc(CX, CY, RADIUS, 0, animatedValue);

  // Target indicator line
  let targetPath: string | null = null;
  if (target !== undefined) {
    const tAngle = 180 + (target / 100) * 180;
    const inner = polarToCartesian(CX, CY, RADIUS - STROKE_WIDTH - 4, tAngle);
    const outer = polarToCartesian(CX, CY, RADIUS + STROKE_WIDTH + 4, tAngle);
    targetPath = `M ${inner.x} ${inner.y} L ${outer.x} ${outer.y}`;
  }

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="relative" style={{ width: SVG_SIZE, height: SVG_SIZE / 2 + 16 }}>
        <svg
          viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE / 2 + STROKE_WIDTH}`}
          width={SVG_SIZE}
          height={SVG_SIZE / 2 + STROKE_WIDTH}
          overflow="visible"
        >
          {/* Track */}
          <path
            d={trackPath}
            fill="none"
            stroke="#F1F5F9"
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            className="dark:[stroke:#334155]"
          />

          {/* Fill */}
          {animatedValue > 0 && (
            <path
              d={fillPath}
              fill="none"
              stroke={fillColor}
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
            />
          )}

          {/* Target line */}
          {targetPath && (
            <path
              d={targetPath}
              fill="none"
              stroke="#94A3B8"
              strokeWidth={2}
              strokeDasharray="3 2"
              strokeLinecap="round"
            />
          )}
        </svg>

        {/* Center text — positioned below center of the semicircle arc */}
        <div
          className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center"
          style={{ bottom: 0 }}
        >
          <span
            className="text-3xl font-bold leading-none tabular-nums text-slate-900 dark:text-white"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {Math.round(animatedValue)}
            <span className="text-lg font-semibold text-slate-500 dark:text-slate-400">%</span>
          </span>
          {label && (
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 text-center">
              {label}
            </span>
          )}
        </div>
      </div>

      {/* Target annotation */}
      {target !== undefined && (
        <div className="flex items-center gap-1.5 mt-2">
          <span
            className="inline-block w-4 border-t-2 border-dashed border-slate-400"
            aria-hidden
          />
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Target: {target}%
          </span>
        </div>
      )}
    </div>
  );
}

export default GaugeChart;
