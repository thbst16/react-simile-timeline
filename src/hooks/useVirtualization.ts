/**
 * useVirtualization Hook
 *
 * Hook for virtualizing large lists of events to improve performance.
 * Only renders events that are visible in the current viewport.
 *
 * Sprint 5: Polish & Performance
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import type { TimelineEvent } from '../types/events';

/**
 * Virtualization Options
 */
export interface UseVirtualizationOptions {
  /**
   * All events to virtualize
   */
  events: TimelineEvent[];

  /**
   * Viewport start position (pixels)
   */
  viewportStart: number;

  /**
   * Viewport end position (pixels)
   */
  viewportEnd: number;

  /**
   * Function to get event start position in pixels
   */
  getEventStart: (event: TimelineEvent) => number;

  /**
   * Function to get event end position in pixels
   */
  getEventEnd: (event: TimelineEvent) => number;

  /**
   * Buffer zone size (pixels) to render beyond viewport
   * @default 200
   */
  bufferSize?: number;

  /**
   * Enable virtualization
   * @default true
   */
  enabled?: boolean;

  /**
   * Minimum number of events to enable virtualization
   * Below this threshold, all events are rendered
   * @default 100
   */
  threshold?: number;
}

/**
 * Virtualization Result
 */
export interface UseVirtualizationResult {
  /**
   * Events that should be rendered (visible + buffer)
   */
  visibleEvents: TimelineEvent[];

  /**
   * Total number of events
   */
  totalCount: number;

  /**
   * Number of visible events
   */
  visibleCount: number;

  /**
   * Number of events before viewport
   */
  beforeCount: number;

  /**
   * Number of events after viewport
   */
  afterCount: number;

  /**
   * Whether virtualization is active
   */
  isVirtualized: boolean;

  /**
   * Statistics about virtualization performance
   */
  stats: VirtualizationStats;
}

/**
 * Virtualization Statistics
 */
export interface VirtualizationStats {
  /**
   * Percentage of events rendered
   */
  renderPercentage: number;

  /**
   * Number of events skipped
   */
  skippedCount: number;

  /**
   * Memory saved (estimated)
   */
  memorySaved: string;
}

/**
 * Check if an event intersects with the viewport
 */
function eventIntersectsViewport(
  event: TimelineEvent,
  viewportStart: number,
  viewportEnd: number,
  getEventStart: (event: TimelineEvent) => number,
  getEventEnd: (event: TimelineEvent) => number
): boolean {
  const eventStart = getEventStart(event);
  const eventEnd = getEventEnd(event);

  // Event intersects if its range overlaps with viewport range
  return eventStart <= viewportEnd && eventEnd >= viewportStart;
}

/**
 * Hook for virtualizing event rendering
 *
 * @example
 * const virtualization = useVirtualization({
 *   events: allEvents,
 *   viewportStart: 0,
 *   viewportEnd: 1000,
 *   getEventStart: (event) => dateToPixel(new Date(event.start)),
 *   getEventEnd: (event) => event.end ? dateToPixel(new Date(event.end)) : dateToPixel(new Date(event.start))
 * });
 *
 * // Render only visible events
 * virtualization.visibleEvents.map(event => <Event key={event.id} event={event} />)
 */
export function useVirtualization(options: UseVirtualizationOptions): UseVirtualizationResult {
  const {
    events,
    viewportStart,
    viewportEnd,
    getEventStart,
    getEventEnd,
    bufferSize = 200,
    enabled = true,
    threshold = 100,
  } = options;

  // Determine if virtualization should be active
  const isVirtualized = useMemo(() => {
    return enabled && events.length >= threshold;
  }, [enabled, events.length, threshold]);

  // Calculate buffered viewport bounds
  const bufferedStart = useMemo(() => {
    return viewportStart - bufferSize;
  }, [viewportStart, bufferSize]);

  const bufferedEnd = useMemo(() => {
    return viewportEnd + bufferSize;
  }, [viewportEnd, bufferSize]);

  // Filter visible events
  const visibleEvents = useMemo(() => {
    if (!isVirtualized) {
      return events;
    }

    const filtered = events.filter((event) =>
      eventIntersectsViewport(event, bufferedStart, bufferedEnd, getEventStart, getEventEnd)
    );

    return filtered;
  }, [events, bufferedStart, bufferedEnd, getEventStart, getEventEnd, isVirtualized]);

  // Count events before and after viewport
  const { beforeCount, afterCount } = useMemo(() => {
    if (!isVirtualized) {
      return { beforeCount: 0, afterCount: 0 };
    }

    let before = 0;
    let after = 0;

    events.forEach((event) => {
      const eventEnd = getEventEnd(event);
      const eventStart = getEventStart(event);

      if (eventEnd < bufferedStart) {
        before++;
      } else if (eventStart > bufferedEnd) {
        after++;
      }
    });

    return { beforeCount: before, afterCount: after };
  }, [events, bufferedStart, bufferedEnd, getEventStart, getEventEnd, isVirtualized]);

  // Calculate statistics
  const stats = useMemo((): VirtualizationStats => {
    const skipped = events.length - visibleEvents.length;
    const percentage = events.length > 0 ? (visibleEvents.length / events.length) * 100 : 0;

    // Rough estimate: each event ~1KB in memory
    const savedKB = skipped * 1;
    const memorySaved = savedKB > 1024 ? `${(savedKB / 1024).toFixed(1)}MB` : `${savedKB}KB`;

    return {
      renderPercentage: Math.round(percentage * 10) / 10,
      skippedCount: skipped,
      memorySaved,
    };
  }, [events.length, visibleEvents.length]);

  return {
    visibleEvents,
    totalCount: events.length,
    visibleCount: visibleEvents.length,
    beforeCount,
    afterCount,
    isVirtualized,
    stats,
  };
}

/**
 * Hook for virtualizing events with automatic viewport tracking
 *
 * This variant automatically tracks the viewport bounds from a scroll container.
 */
export interface UseAutoVirtualizationOptions
  extends Omit<UseVirtualizationOptions, 'viewportStart' | 'viewportEnd'> {
  /**
   * Scroll container element
   */
  containerRef: React.RefObject<HTMLElement>;

  /**
   * Update interval (ms)
   * @default 100
   */
  updateInterval?: number;
}

export function useAutoVirtualization(
  options: UseAutoVirtualizationOptions
): UseVirtualizationResult {
  const { containerRef, updateInterval = 100, ...baseOptions } = options;

  const [viewport, setViewport] = useState({ start: 0, end: 1000 });

  // Update viewport based on scroll position
  const updateViewport = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const start = container.scrollLeft;
    const end = start + container.clientWidth;

    setViewport({ start, end });
  }, [containerRef]);

  // Set up scroll listener
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    let timeoutId: number | null = null;

    const handleScroll = (): void => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }

      timeoutId = window.setTimeout(() => {
        updateViewport();
      }, updateInterval);
    };

    container.addEventListener('scroll', handleScroll);
    updateViewport(); // Initial update

    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [containerRef, updateInterval, updateViewport]);

  return useVirtualization({
    ...baseOptions,
    viewportStart: viewport.start,
    viewportEnd: viewport.end,
  });
}
