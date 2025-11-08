/**
 * Band Component
 *
 * Represents a single horizontal band in the timeline.
 * Each band has its own time scale (ether) and can display events.
 *
 * Sprint 2: Core Rendering
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import type { Ether } from '../core/Ether';
import type { TimelineEvent } from '../types/events';
import type { IntervalUnit } from '../types/bands';
import { useTimelineStore } from '../store/timelineStore';

export interface BandProps {
  /** Unique identifier for this band */
  id: string;

  /** Height of the band in pixels */
  height: number;

  /** Ether for time-to-pixel conversion */
  ether: Ether;

  /** Events to display in this band */
  events: TimelineEvent[];

  /** Whether this band shows the time scale */
  showTimescale?: boolean;

  /** Callback when band is scrolled */
  onScroll?: (centerDate: Date) => void;

  /** CSS class for styling */
  className?: string;
}

export interface Viewport {
  /** Center date of the viewport */
  centerDate: Date;

  /** Width of the viewport in pixels */
  width: number;

  /** Minimum visible date */
  minVisibleDate: Date;

  /** Maximum visible date */
  maxVisibleDate: Date;

  /** Pixel offset for panning */
  pixelOffset: number;
}

/**
 * Band Component
 *
 * Renders a single timeline band with:
 * - Viewport management
 * - Time scale (if enabled)
 * - Event rendering
 * - Pan/scroll support
 */
export function Band({
  id,
  height,
  ether,
  events,
  showTimescale = true,
  onScroll,
  className = '',
}: BandProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState<Viewport | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, centerDate: new Date() });

  // Get center date from store
  const { centerDate, setCenterDate } = useTimelineStore();

  // Calculate viewport when container size or center date changes
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const halfWidth = width / 2;

    // Calculate visible date range
    const minVisibleDate = ether.pixelToDate(-halfWidth, centerDate);
    const maxVisibleDate = ether.pixelToDate(halfWidth, centerDate);

    setViewport({
      centerDate,
      width,
      minVisibleDate,
      maxVisibleDate,
      pixelOffset: 0,
    });
  }, [centerDate, ether]);

  // Handle window resize
  useEffect(() => {
    const handleResize = (): void => {
      if (!containerRef.current) return;

      const width = containerRef.current.clientWidth;
      const halfWidth = width / 2;

      const minVisibleDate = ether.pixelToDate(-halfWidth, centerDate);
      const maxVisibleDate = ether.pixelToDate(halfWidth, centerDate);

      setViewport((prev) => ({
        centerDate,
        width,
        minVisibleDate,
        maxVisibleDate,
        pixelOffset: prev?.pixelOffset ?? 0,
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [centerDate, ether]);

  // Mouse drag handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent): void => {
      setIsDragging(true);
      setDragStart({ x: e.clientX, centerDate });
    },
    [centerDate]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent): void => {
      if (!isDragging) return;

      const deltaX = dragStart.x - e.clientX;
      const newCenterDate = ether.pixelToDate(deltaX, dragStart.centerDate);

      setCenterDate(newCenterDate);
      onScroll?.(newCenterDate);
    },
    [isDragging, dragStart, ether, setCenterDate, onScroll]
  );

  const handleMouseUp = useCallback((): void => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback((): void => {
    setIsDragging(false);
  }, []);

  // Filter visible events
  const visibleEvents = viewport
    ? events.filter((event) => {
        try {
          const eventStart = new Date(event.start);
          const eventEnd = event.end ? new Date(event.end) : eventStart;

          return (
            eventStart <= viewport.maxVisibleDate && eventEnd >= viewport.minVisibleDate
          );
        } catch {
          return false;
        }
      })
    : [];

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-white border-b border-gray-200 ${className}`}
      style={{
        height: `${height}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      role="region"
      aria-label={`Timeline band ${id}`}
    >
      {/* Time scale background */}
      {showTimescale && viewport && (
        <div className="absolute inset-0 pointer-events-none">
          <TimeScale ether={ether} viewport={viewport} />
        </div>
      )}

      {/* Event layer */}
      {viewport && (
        <div className="absolute inset-0 pointer-events-none">
          <EventLayer
            events={visibleEvents}
            ether={ether}
            viewport={viewport}
            height={height}
          />
        </div>
      )}

      {/* Debug info (remove in production) */}
      <div className="absolute top-2 left-2 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded pointer-events-none">
        <div>Band: {id}</div>
        <div>Events: {visibleEvents.length} visible</div>
        <div>Center: {centerDate.toLocaleDateString()}</div>
      </div>
    </div>
  );
}

/**
 * TimeScale Component
 * Renders the time scale (ruler with date labels)
 */
interface TimeScaleProps {
  ether: Ether;
  viewport: Viewport;
}

function TimeScale({ ether, viewport }: TimeScaleProps): JSX.Element {
  // Calculate tick positions and labels
  const ticks = calculateTicks(ether, viewport);

  return (
    <svg
      width={viewport.width}
      height="100%"
      className="absolute inset-0"
      style={{ pointerEvents: 'none' }}
    >
      {/* Vertical grid lines */}
      {ticks.map((tick, index) => {
        const pixelPos = ether.dateToPixel(tick.date, viewport.centerDate);
        const x = viewport.width / 2 + pixelPos;

        return (
          <g key={`${tick.date.getTime()}-${index}`}>
            <line
              x1={x}
              y1={0}
              x2={x}
              y2="100%"
              stroke={tick.isMajor ? '#d1d5db' : '#f3f4f6'}
              strokeWidth={tick.isMajor ? 1 : 1}
              opacity={tick.isMajor ? 0.5 : 0.3}
            />
            {tick.isMajor && (
              <text
                x={x}
                y={20}
                textAnchor="middle"
                fontSize={10}
                fill="#6b7280"
                style={{ userSelect: 'none' }}
              >
                {tick.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/**
 * EventLayer Component
 * Renders events as points or duration tapes
 */
interface EventLayerProps {
  events: TimelineEvent[];
  ether: Ether;
  viewport: Viewport;
  height: number;
}

function EventLayer({ events, ether, viewport, height }: EventLayerProps): JSX.Element {
  return (
    <svg width={viewport.width} height={height} className="absolute inset-0">
      {events.map((event, index) => {
        try {
          const startDate = new Date(event.start);
          const startPixel = ether.dateToPixel(startDate, viewport.centerDate);
          const x = viewport.width / 2 + startPixel;

          // Duration event (tape)
          if (event.end || event.isDuration) {
            const endDate = event.end ? new Date(event.end) : startDate;
            const endPixel = ether.dateToPixel(endDate, viewport.centerDate);
            const width = Math.abs(endPixel - startPixel);
            const tapeY = height / 2 - 10;

            return (
              <g key={event.id || `${event.title}-${index}`}>
                {/* Duration tape */}
                <rect
                  x={x}
                  y={tapeY}
                  width={width}
                  height={20}
                  fill={event.color || '#3b82f6'}
                  opacity={0.7}
                  rx={2}
                />
                {/* Event label */}
                {width > 40 && (
                  <text
                    x={x + width / 2}
                    y={tapeY + 14}
                    textAnchor="middle"
                    fontSize={10}
                    fill="white"
                    style={{ userSelect: 'none' }}
                  >
                    {event.title}
                  </text>
                )}
              </g>
            );
          }

          // Point event (dot)
          const pointY = height / 2;
          return (
            <g key={event.id || `${event.title}-${index}`}>
              {/* Event dot */}
              <circle
                cx={x}
                cy={pointY}
                r={5}
                fill={event.color || '#3b82f6'}
                stroke="white"
                strokeWidth={2}
              />
              {/* Event label */}
              <text
                x={x}
                y={pointY - 12}
                textAnchor="middle"
                fontSize={10}
                fill="#374151"
                style={{ userSelect: 'none' }}
              >
                {event.title}
              </text>
            </g>
          );
        } catch {
          return null;
        }
      })}
    </svg>
  );
}

/**
 * Calculate tick marks for time scale
 */
interface Tick {
  date: Date;
  label: string;
  isMajor: boolean;
}

function calculateTicks(ether: Ether, viewport: Viewport): Tick[] {
  const ticks: Tick[] = [];
  const intervalUnit = ether.getIntervalUnit();
  const intervalPixels = ether.getIntervalPixels();

  // Determine tick interval based on scale
  // For Sprint 2, use simple 1-interval spacing
  const tickInterval = 1;

  // Calculate how many intervals fit in viewport
  const viewportIntervals = Math.ceil(viewport.width / intervalPixels);

  // Generate ticks
  for (let i = -viewportIntervals; i <= viewportIntervals; i++) {
    const tickDate = addIntervals(viewport.centerDate, i * tickInterval, intervalUnit);
    const isMajor = i % 5 === 0; // Every 5th tick is major

    ticks.push({
      date: tickDate,
      label: formatTickLabel(tickDate, intervalUnit),
      isMajor,
    });
  }

  return ticks;
}

/**
 * Add intervals to a date (helper for tick calculation)
 */
function addIntervals(date: Date, count: number, unit: IntervalUnit): Date {
  const result = new Date(date);

  switch (unit) {
    case 'MILLISECOND':
      result.setMilliseconds(result.getMilliseconds() + count);
      break;
    case 'SECOND':
      result.setSeconds(result.getSeconds() + count);
      break;
    case 'MINUTE':
      result.setMinutes(result.getMinutes() + count);
      break;
    case 'HOUR':
      result.setHours(result.getHours() + count);
      break;
    case 'DAY':
      result.setDate(result.getDate() + count);
      break;
    case 'WEEK':
      result.setDate(result.getDate() + count * 7);
      break;
    case 'MONTH':
      result.setMonth(result.getMonth() + count);
      break;
    case 'YEAR':
      result.setFullYear(result.getFullYear() + count);
      break;
    case 'DECADE':
      result.setFullYear(result.getFullYear() + count * 10);
      break;
    case 'CENTURY':
      result.setFullYear(result.getFullYear() + count * 100);
      break;
    case 'MILLENNIUM':
      result.setFullYear(result.getFullYear() + count * 1000);
      break;
  }

  return result;
}

/**
 * Format tick label based on interval unit
 */
function formatTickLabel(date: Date, unit: IntervalUnit): string {
  switch (unit) {
    case 'MILLISECOND':
    case 'SECOND':
      return date.toLocaleTimeString();
    case 'MINUTE':
    case 'HOUR':
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    case 'DAY':
    case 'WEEK':
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    case 'MONTH':
      return date.toLocaleDateString([], { month: 'short', year: 'numeric' });
    case 'YEAR':
    case 'DECADE':
      return date.getFullYear().toString();
    case 'CENTURY':
    case 'MILLENNIUM':
      return `${date.getFullYear()}`;
    default:
      return date.toLocaleDateString();
  }
}
