/**
 * Date Bounds Utilities
 *
 * Calculate and manage timeline date boundaries based on event data.
 * Prevents scrolling into empty space beyond the event range.
 *
 * Sprint 7: Polish & Bug Fixes
 */

import type { TimelineEvent } from '../types/events';

export interface DateBounds {
  minDate: Date;
  maxDate: Date;
  hasEvents: boolean;
}

/**
 * Calculate the minimum and maximum dates from a collection of events
 *
 * @param events - Array of timeline events
 * @param padding - Optional padding in milliseconds to add before/after bounds
 * @returns DateBounds object with min/max dates
 *
 * @example
 * const bounds = calculateEventDateBounds(events, 1000 * 60 * 60 * 24 * 30); // 30 days padding
 * console.log(bounds.minDate, bounds.maxDate);
 */
export function calculateEventDateBounds(
  events: TimelineEvent[],
  padding: number = 0
): DateBounds {
  if (!events || events.length === 0) {
    // No events - return a default range around now
    const now = new Date();
    return {
      minDate: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
      maxDate: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000), // 1 year ahead
      hasEvents: false,
    };
  }

  let minTime = Infinity;
  let maxTime = -Infinity;

  for (const event of events) {
    try {
      const startDate = new Date(event.start);
      const startTime = startDate.getTime();

      if (isNaN(startTime)) {
        console.warn(`Invalid start date for event ${event.id}:`, event.start);
        continue;
      }

      // Update min/max with start date
      minTime = Math.min(minTime, startTime);
      maxTime = Math.max(maxTime, startTime);

      // If event has an end date (duration event), include it
      if (event.end) {
        const endDate = new Date(event.end);
        const endTime = endDate.getTime();

        if (!isNaN(endTime)) {
          maxTime = Math.max(maxTime, endTime);
        }
      }
    } catch (error) {
      console.warn(`Error processing event ${event.id}:`, error);
    }
  }

  // If all events had invalid dates, fall back to default
  if (minTime === Infinity || maxTime === -Infinity) {
    const now = new Date();
    return {
      minDate: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
      maxDate: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000),
      hasEvents: false,
    };
  }

  // Apply padding
  const paddedMinTime = minTime - padding;
  const paddedMaxTime = maxTime + padding;

  return {
    minDate: new Date(paddedMinTime),
    maxDate: new Date(paddedMaxTime),
    hasEvents: true,
  };
}

/**
 * Clamp a date to be within the specified bounds
 *
 * @param date - The date to clamp
 * @param bounds - The date bounds to enforce
 * @returns The clamped date
 *
 * @example
 * const clampedDate = clampDateToBounds(proposedDate, bounds);
 */
export function clampDateToBounds(date: Date, bounds: DateBounds): Date {
  const time = date.getTime();
  const minTime = bounds.minDate.getTime();
  const maxTime = bounds.maxDate.getTime();

  if (time < minTime) {
    return new Date(minTime);
  }

  if (time > maxTime) {
    return new Date(maxTime);
  }

  return date;
}

/**
 * Check if a date is at or near a boundary
 *
 * @param date - The date to check
 * @param bounds - The date bounds
 * @param threshold - Milliseconds from boundary to consider "near" (default: 1 day)
 * @returns Object indicating if date is at min/max boundary
 *
 * @example
 * const { atMin, atMax, nearMin, nearMax } = isAtBoundary(centerDate, bounds);
 * if (atMin) console.log('At minimum boundary!');
 */
export function isAtBoundary(
  date: Date,
  bounds: DateBounds,
  threshold: number = 24 * 60 * 60 * 1000
): {
  atMin: boolean;
  atMax: boolean;
  nearMin: boolean;
  nearMax: boolean;
} {
  const time = date.getTime();
  const minTime = bounds.minDate.getTime();
  const maxTime = bounds.maxDate.getTime();

  return {
    atMin: time <= minTime,
    atMax: time >= maxTime,
    nearMin: time <= minTime + threshold,
    nearMax: time >= maxTime - threshold,
  };
}

/**
 * Get a default center date from bounds (midpoint)
 *
 * @param bounds - The date bounds
 * @returns Date at the midpoint of the bounds
 *
 * @example
 * const centerDate = getDefaultCenterDate(bounds);
 */
export function getDefaultCenterDate(bounds: DateBounds): Date {
  const minTime = bounds.minDate.getTime();
  const maxTime = bounds.maxDate.getTime();
  const midTime = (minTime + maxTime) / 2;
  return new Date(midTime);
}

/**
 * Calculate bounds with additional viewport padding
 * Ensures the edges of the timeline show some context
 *
 * @param events - Array of timeline events
 * @param viewportWidth - Width of the viewport in pixels
 * @param ether - Ether for pixel-to-time conversion
 * @returns DateBounds with viewport-based padding
 *
 * @example
 * const bounds = calculateBoundsWithViewportPadding(events, 1200, ether);
 */
export function calculateBoundsWithViewportPadding(
  events: TimelineEvent[],
  viewportWidthMs: number = 30 * 24 * 60 * 60 * 1000 // Default: 30 days
): DateBounds {
  // Add padding equal to half the viewport width
  // This ensures that when at the edge, the timeline shows some context
  const padding = viewportWidthMs / 2;
  return calculateEventDateBounds(events, padding);
}
