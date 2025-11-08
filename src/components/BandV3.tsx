/**
 * Band Component (Sprint 3 Enhanced Version)
 *
 * Represents a single horizontal band in the timeline with:
 * - LayoutEngine integration for track assignment
 * - Painter support (Original, Compact, Overview)
 * - Event click handling
 * - Multi-band synchronization
 *
 * Sprint 3: Advanced Rendering
 */

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import type { Ether } from '../core/Ether';
import type { TimelineEvent } from '../types/events';
import type { IntervalUnit } from '../types/bands';
import type { Decorator } from '../types/decorators';
import { useTimelineStore } from '../store/timelineStore';
import { LayoutEngine } from '../core/LayoutEngine';
import {
  createOriginalPainter,
  createCompactPainter,
  createOverviewPainter,
  DEFAULT_EVENT_THEME,
} from '../core/painters';
import type { EventPainter } from '../core/painters';
import { DecoratorLayer } from './DecoratorLayer';
import { useVirtualization } from '../hooks/useVirtualization';
import { useAdaptiveRenderer } from '../hooks/useAdaptiveRenderer';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';
import { useTheme } from '../hooks/useTheme';

export interface BandV3Props {
  /** Unique identifier for this band */
  id: string;

  /** Height of the band in pixels */
  height: number;

  /** Ether for time-to-pixel conversion */
  ether: Ether;

  /** Events to display in this band */
  events: TimelineEvent[];

  /** Decorators to display (optional) */
  decorators?: Decorator[];

  /** Painter type to use */
  painterType?: 'original' | 'compact' | 'overview';

  /** Whether this band shows the time scale */
  showTimescale?: boolean;

  /** Callback when band is scrolled */
  onScroll?: (centerDate: Date) => void;

  /** Callback when event is clicked */
  onEventClick?: (event: TimelineEvent) => void;

  /** CSS class for styling */
  className?: string;
}

interface Viewport {
  centerDate: Date;
  width: number;
  height: number;
  minVisibleDate: Date;
  maxVisibleDate: Date;
}

/**
 * Enhanced Band Component with LayoutEngine and Painters
 */
export function BandV3({
  id,
  height,
  ether,
  events,
  decorators = [],
  painterType = 'original',
  showTimescale = true,
  onScroll,
  onEventClick,
  className = '',
}: BandV3Props): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState<Viewport | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, centerDate: new Date() });

  // Get center date from store
  const { centerDate, setCenterDate } = useTimelineStore();

  // Create painter based on type
  const painter = useMemo((): EventPainter => {
    switch (painterType) {
      case 'compact':
        return createCompactPainter();
      case 'overview':
        return createOverviewPainter();
      case 'original':
      default:
        return createOriginalPainter();
    }
  }, [painterType]);

  // Create layout engine with painter settings
  const layoutEngine = useMemo(() => {
    return new LayoutEngine({
      trackHeight: painter.getTrackHeight(),
      trackGap: painter.getTrackGap(),
      trackOffset: painter.getTrackOffset(),
    });
  }, [painter]);

  // Adaptive rendering (auto-switch to canvas on poor performance)
  const adaptiveRenderer = useAdaptiveRenderer({
    eventCount: events.length,
    canvasThreshold: 1000,
    targetFps: 30,
    enableAutoSwitch: true,
  });

  // Performance monitoring
  const perfMonitor = usePerformanceMonitor({
    targetFps: 60,
    enabled: true,
    onPerformanceDrop: (metrics) => {
      // Report to adaptive renderer
      adaptiveRenderer.reportPerformance(metrics.fps, metrics.renderTime);
    },
  });

  // Calculate viewport when container size or center date changes
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const halfWidth = width / 2;

    const minVisibleDate = ether.pixelToDate(-halfWidth, centerDate);
    const maxVisibleDate = ether.pixelToDate(halfWidth, centerDate);

    setViewport({
      centerDate,
      width,
      height,
      minVisibleDate,
      maxVisibleDate,
    });
  }, [centerDate, ether, height]);

  // Handle window resize
  useEffect(() => {
    const handleResize = (): void => {
      if (!containerRef.current) return;

      const width = containerRef.current.clientWidth;
      const halfWidth = width / 2;

      const minVisibleDate = ether.pixelToDate(-halfWidth, centerDate);
      const maxVisibleDate = ether.pixelToDate(halfWidth, centerDate);

      setViewport({
        centerDate,
        width,
        height,
        minVisibleDate,
        maxVisibleDate,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [centerDate, ether, height]);

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

  // Use virtualization for efficient rendering of large datasets
  const virtualization = useVirtualization({
    events,
    viewportStart: viewport ? ether.dateToPixel(viewport.minVisibleDate, centerDate) : 0,
    viewportEnd: viewport ? ether.dateToPixel(viewport.maxVisibleDate, centerDate) : 1000,
    getEventStart: (event) => {
      try {
        return ether.dateToPixel(new Date(event.start), centerDate);
      } catch {
        return 0;
      }
    },
    getEventEnd: (event) => {
      try {
        const endDate = event.end ? new Date(event.end) : new Date(event.start);
        return ether.dateToPixel(endDate, centerDate);
      } catch {
        return 0;
      }
    },
    threshold: 500, // Enable virtualization for >500 events
    bufferSize: 500, // Larger buffer for smooth scrolling
  });

  // Layout visible events
  const layoutItems = useMemo(() => {
    if (!viewport) return [];
    return layoutEngine.layout(virtualization.visibleEvents, ether, viewport);
  }, [virtualization.visibleEvents, viewport, ether, layoutEngine]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 ${className}`}
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
      {/* Decorator layer (behind everything) */}
      {viewport && decorators.length > 0 && (
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
          <DecoratorLayer decorators={decorators} ether={ether} viewport={viewport} />
        </div>
      )}

      {/* Time scale background */}
      {showTimescale && viewport && (
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
          <TimeScale ether={ether} viewport={viewport} />
        </div>
      )}

      {/* Event layer with painters */}
      {viewport && (
        <div className="absolute inset-0" style={{ zIndex: 2 }}>
          <svg width={viewport.width} height={height} className="absolute inset-0">
            {layoutItems.map((item) =>
              painter.render(item, viewport, DEFAULT_EVENT_THEME, onEventClick)
            )}
          </svg>
        </div>
      )}

      {/* Debug info */}
      <div className="absolute top-2 left-2 text-xs text-gray-500 dark:text-gray-400 bg-white/80 dark:bg-gray-800/80 px-2 py-1 rounded pointer-events-none">
        <div>Band: {id}</div>
        <div>Painter: {painterType}</div>
        <div>Events: {layoutItems.length} visible</div>
        <div>Tracks: {layoutEngine.getTrackCount(layoutItems)}</div>
      </div>
    </div>
  );
}

/**
 * TimeScale Component (same as Sprint 2)
 */
interface TimeScaleProps {
  ether: Ether;
  viewport: Viewport;
}

function TimeScale({ ether, viewport }: TimeScaleProps): JSX.Element {
  const ticks = calculateTicks(ether, viewport);
  const { theme } = useTheme();

  return (
    <svg
      width={viewport.width}
      height="100%"
      className="absolute inset-0"
      style={{ pointerEvents: 'none' }}
    >
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
              stroke={theme.colors.timescale.majorLine}
              strokeWidth={1}
              opacity={tick.isMajor ? 0.5 : 0.3}
            />
            {tick.isMajor && (
              <text
                x={x}
                y={15}
                textAnchor="middle"
                fontSize={10}
                fill={theme.colors.timescale.label}
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

interface Tick {
  date: Date;
  label: string;
  isMajor: boolean;
}

function calculateTicks(ether: Ether, viewport: Viewport): Tick[] {
  const ticks: Tick[] = [];
  const intervalUnit = ether.getIntervalUnit();
  const intervalPixels = ether.getIntervalPixels();

  const tickInterval = 1;
  const viewportIntervals = Math.ceil(viewport.width / intervalPixels);

  for (let i = -viewportIntervals; i <= viewportIntervals; i++) {
    const tickDate = addIntervals(viewport.centerDate, i * tickInterval, intervalUnit);
    const isMajor = i % 5 === 0;

    ticks.push({
      date: tickDate,
      label: formatTickLabel(tickDate, intervalUnit),
      isMajor,
    });
  }

  return ticks;
}

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
