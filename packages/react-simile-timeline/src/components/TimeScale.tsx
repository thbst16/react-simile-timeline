import { useMemo } from 'react';
import { getScaleConfig, generateTicks, type ScaleTick } from '../utils/scaleUtils';
import type { TimeUnit } from '../utils/dateUtils';

export interface TimeScaleProps {
  /** Visible date range */
  visibleRange: { start: Date; end: Date };
  /** Pixels per millisecond */
  pixelsPerMs: number;
  /** Viewport width in pixels */
  viewportWidth: number;
  /** Center date of the viewport */
  centerDate: Date;
  /** Optional preferred time unit */
  timeUnit?: TimeUnit | string;
}

/**
 * Check if a year is a decade (divisible by 10)
 */
function isDecade(year: number): boolean {
  return year % 10 === 0;
}

/**
 * Time scale component that renders tick marks and labels in a linear layout
 */
export function TimeScale({
  visibleRange,
  pixelsPerMs,
  viewportWidth,
  centerDate,
}: TimeScaleProps) {
  // Get appropriate scale configuration for current zoom level
  const scaleConfig = useMemo(
    () => getScaleConfig(pixelsPerMs),
    [pixelsPerMs]
  );

  // Generate tick marks
  const ticks = useMemo(
    () => generateTicks(visibleRange, scaleConfig, pixelsPerMs, centerDate, viewportWidth),
    [visibleRange, scaleConfig, pixelsPerMs, centerDate, viewportWidth]
  );

  return (
    <div
      className="timeline-scale"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Baseline at top */}
      <div
        className="timeline-scale__baseline"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          backgroundColor: 'var(--scale-line-color, #e0e0e0)',
        }}
      />
      {/* Tick marks and labels */}
      {ticks.map((tick, index) => (
        <TickMark key={`${tick.date.getTime()}-${index}`} tick={tick} />
      ))}
    </div>
  );
}

interface TickMarkProps {
  tick: ScaleTick;
}

/**
 * Individual tick mark with label - linear layout with bold decades
 */
function TickMark({ tick }: TickMarkProps) {
  const year = tick.date.getFullYear();
  const isDecadeYear = isDecade(year);

  // Determine if this is a "major" label that should be bold
  // For year-based scales, decades are bold
  // For other scales, use the isMajor flag from the tick
  const isBold = tick.isMajor || isDecadeYear;

  return (
    <div
      className={`timeline-scale__tick ${tick.isMajor ? 'timeline-scale__tick--major' : ''}`}
      style={{
        position: 'absolute',
        left: tick.x,
        top: 0,
        transform: 'translateX(-50%)',
        pointerEvents: 'none',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Tick line from top */}
      <div
        className="timeline-scale__tick-line"
        style={{
          width: 1,
          height: isBold ? 6 : 4,
          backgroundColor: isBold
            ? 'var(--scale-major-line-color, #999)'
            : 'var(--scale-line-color, #ccc)',
          flexShrink: 0,
        }}
      />
      {/* Label on single baseline */}
      <span
        className="timeline-scale__label"
        style={{
          fontSize: 'var(--scale-font-size, 11px)',
          color: isBold ? 'var(--scale-major-text-color, #333)' : 'var(--scale-text-color, #666)',
          whiteSpace: 'nowrap',
          fontFamily: 'var(--timeline-font-family, system-ui, sans-serif)',
          fontWeight: isBold ? 600 : 400,
          marginTop: 2,
        }}
      >
        {tick.label}
      </span>
    </div>
  );
}
