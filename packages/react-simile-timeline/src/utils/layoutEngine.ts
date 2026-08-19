/**
 * Layout engine for preventing label overlap
 * Uses a greedy left-to-right track assignment algorithm
 */

import type { TimelineEvent } from '../types';
import { parseDate } from './dateUtils';

/**
 * An event with computed layout information
 */
export interface LayoutEvent {
  /** Original event data */
  event: TimelineEvent;
  /** X position in pixels from viewport left */
  x: number;
  /** Estimated width of the label in pixels */
  width: number;
  /** Assigned track (0 = top track) */
  track: number;
  /** Whether this is a duration event */
  isDuration: boolean;
  /** End X position for duration events (in pixels) */
  endX?: number;
  /** Rendered width for duration events (endX - x) */
  durationWidth?: number;
  /** Whether the label is sticky (event scrolled off-left) */
  isSticky?: boolean;
  /** X position for sticky label rendering */
  stickyX?: number;
}

/** Average character width in pixels (approximate) */
const CHAR_WIDTH = 7;
/** Event dot diameter */
const DOT_WIDTH = 10;
/** Padding between dot and label */
const LABEL_PADDING = 6;
/** Minimum gap between labels */
const LABEL_GAP = 8;
/** Minimum width for duration events (pixels) */
const MIN_DURATION_WIDTH = 20;
/** Height of duration tape (pixels) */
export const TAPE_HEIGHT = 18;
/** Margin from left edge for sticky labels */
const STICKY_MARGIN = 8;

/**
 * Check if an event is a duration event
 */
export function isDurationEvent(event: TimelineEvent): boolean {
  return !!(event.end || event.isDuration || event.durationEvent);
}

/**
 * Estimate the width of an event label
 */
export function estimateLabelWidth(title: string, showLabel: boolean = true): number {
  if (!showLabel) {
    return DOT_WIDTH;
  }
  return DOT_WIDTH + LABEL_PADDING + (title.length * CHAR_WIDTH);
}

/**
 * Filter events to only those visible in the viewport
 */
export function filterVisibleEvents(
  events: TimelineEvent[],
  visibleRange: { start: Date; end: Date },
  bufferMs: number = 24 * 60 * 60 * 1000 // 1 day buffer
): TimelineEvent[] {
  const rangeStart = visibleRange.start.getTime() - bufferMs;
  const rangeEnd = visibleRange.end.getTime() + bufferMs;

  return events.filter(event => {
    try {
      const eventStartTime = parseDate(event.start).getTime();

      // For duration events, check if any part overlaps with visible range
      if (isDurationEvent(event) && event.end) {
        const eventEndTime = parseDate(event.end).getTime();
        // Event is visible if it overlaps with the range
        return eventStartTime <= rangeEnd && eventEndTime >= rangeStart;
      }

      // For point events, check if it's within the range
      return eventStartTime >= rangeStart && eventStartTime <= rangeEnd;
    } catch {
      // Skip events with invalid dates
      return false;
    }
  });
}

/**
 * An event with its start/end parsed to epoch milliseconds once, so the
 * per-frame layout never re-parses. `index` is the position in the original
 * events array; the visible set is restored to that order before track
 * assignment so output matches the un-prepared path exactly.
 */
export interface PreparedEvent {
  event: TimelineEvent;
  index: number;
  startMs: number;
  /** End epoch for duration events; undefined for point events */
  endMs?: number;
  isDuration: boolean;
}

/**
 * Events parsed and partitioned once, ready for repeated viewport queries.
 * Point events are sorted by start so a visible window is a binary-searchable
 * slice. Duration events are kept apart and scanned: one can start far to the
 * left and still overlap, so a start-sorted binary search cannot bound them.
 */
export interface PreparedEvents {
  /** Point events, ascending by startMs */
  points: PreparedEvent[];
  /** Duration events, original order */
  durations: PreparedEvent[];
}

/**
 * Parse and partition events once. This is the work that used to happen on
 * every pan frame inside filterVisibleEvents; hoisting it behind a memo keyed
 * on the events array is what makes the per-frame cost independent of dataset
 * size for point events (#36).
 */
export function prepareEvents(events: TimelineEvent[]): PreparedEvents {
  const points: PreparedEvent[] = [];
  const durations: PreparedEvent[] = [];

  events.forEach((event, index) => {
    let startMs: number;
    try {
      startMs = parseDate(event.start).getTime();
      if (Number.isNaN(startMs)) return;
    } catch {
      return; // skip invalid dates, as filterVisibleEvents did
    }

    if (isDurationEvent(event) && event.end) {
      let endMs: number;
      try {
        endMs = parseDate(event.end).getTime();
        if (Number.isNaN(endMs)) return;
      } catch {
        return;
      }
      durations.push({ event, index, startMs, endMs, isDuration: true });
    } else {
      points.push({ event, index, startMs, isDuration: isDurationEvent(event) });
    }
  });

  points.sort((a, b) => a.startMs - b.startMs);
  return { points, durations };
}

/**
 * Index of the first point whose startMs is >= target (lower bound).
 */
function lowerBound(points: PreparedEvent[], target: number): number {
  let lo = 0;
  let hi = points.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (points[mid].startMs < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/**
 * Filter prepared events to the visible window. Point events resolve to a
 * binary-searched slice (O(log n + visible)); duration events are scanned for
 * overlap. The result is ordered by original index to match filterVisibleEvents.
 */
export function filterVisiblePrepared(
  prepared: PreparedEvents,
  visibleRange: { start: Date; end: Date },
  bufferMs: number = 24 * 60 * 60 * 1000
): PreparedEvent[] {
  const rangeStart = visibleRange.start.getTime() - bufferMs;
  const rangeEnd = visibleRange.end.getTime() + bufferMs;

  const { points, durations } = prepared;
  const result: PreparedEvent[] = [];

  // Point events: [rangeStart, rangeEnd] is a contiguous slice of the sorted
  // array. Walk from the lower bound until startMs passes rangeEnd.
  for (let i = lowerBound(points, rangeStart); i < points.length; i++) {
    if (points[i].startMs > rangeEnd) break;
    result.push(points[i]);
  }

  // Duration events: overlap test, scanned.
  for (const d of durations) {
    if (d.startMs <= rangeEnd && (d.endMs ?? d.startMs) >= rangeStart) {
      result.push(d);
    }
  }

  // Restore original order so track assignment is identical to the old path.
  result.sort((a, b) => a.index - b.index);
  return result;
}

/**
 * Calculate sticky label positions for events that scroll off-left
 * A label becomes sticky when:
 * - Duration event: event starts off-left but extends into the viewport
 * - Point event: event dot is off-left but label would have been partly visible
 */
export function calculateStickyLabels(events: LayoutEvent[]): LayoutEvent[] {
  return events.map(event => {
    // Event is fully visible, no sticky needed
    if (event.x >= 0) {
      return event;
    }

    // For duration events: sticky if the tape extends into viewport
    if (event.isDuration && event.endX !== undefined && event.endX > STICKY_MARGIN) {
      return {
        ...event,
        isSticky: true,
        stickyX: STICKY_MARGIN,
      };
    }

    // For point events: sticky if the label would have been visible
    // (event is just off-left, within label width distance)
    if (!event.isDuration && event.x > -event.width) {
      return {
        ...event,
        isSticky: true,
        stickyX: STICKY_MARGIN,
      };
    }

    return event;
  });
}

/**
 * Assign events to vertical tracks to prevent overlap
 * Uses greedy left-to-right algorithm
 * @param events - Events to assign to tracks
 * @param maxTracks - Maximum number of tracks allowed (0 = unlimited)
 */
export function assignTracks(events: LayoutEvent[], maxTracks: number = 0): LayoutEvent[] {
  if (events.length === 0) return [];

  // Sort events by x position (left to right)
  const sorted = [...events].sort((a, b) => a.x - b.x);

  // Track end positions (rightmost edge of each track's last event)
  const trackEnds: number[] = [];

  for (const event of sorted) {
    // Find first track where this event fits (no overlap)
    let assignedTrack = -1;

    const trackLimit = maxTracks > 0 ? Math.min(trackEnds.length, maxTracks) : trackEnds.length;

    for (let t = 0; t < trackLimit; t++) {
      if (event.x >= trackEnds[t] + LABEL_GAP) {
        assignedTrack = t;
        break;
      }
    }

    // If no existing track fits, create a new one (if under limit)
    if (assignedTrack === -1) {
      if (maxTracks > 0 && trackEnds.length >= maxTracks) {
        // At max tracks - find track with smallest end (best fit)
        let minEnd = Infinity;
        let minTrack = 0;
        for (let t = 0; t < trackEnds.length; t++) {
          if (trackEnds[t] < minEnd) {
            minEnd = trackEnds[t];
            minTrack = t;
          }
        }
        assignedTrack = minTrack;
      } else {
        assignedTrack = trackEnds.length;
      }
    }

    // Assign track and update track end position
    event.track = assignedTrack;
    trackEnds[assignedTrack] = event.x + event.width;
  }

  return sorted;
}

/**
 * Calculate layout for events in the viewport
 * @param maxTracks - Maximum number of tracks allowed (0 = unlimited)
 */
export function calculateLayout(
  events: TimelineEvent[],
  visibleRange: { start: Date; end: Date },
  pixelsPerMs: number,
  centerDate: Date,
  viewportWidth: number,
  showLabels: boolean = true,
  maxTracks: number = 0
): LayoutEvent[] {
  // Compatibility path: parse on every call. Components use the prepared path
  // (prepareEvents + calculateLayoutPrepared) so the per-frame cost does not
  // scale with dataset size; direct callers of this function keep the old
  // behaviour.
  return calculateLayoutPrepared(
    prepareEvents(events),
    visibleRange,
    pixelsPerMs,
    centerDate,
    viewportWidth,
    showLabels,
    maxTracks
  );
}

/**
 * Layout from pre-parsed events. Identical output to calculateLayout, without
 * re-parsing dates: positions are computed straight from the cached epoch
 * milliseconds. This is the per-frame hot path (#36).
 */
export function calculateLayoutPrepared(
  prepared: PreparedEvents,
  visibleRange: { start: Date; end: Date },
  pixelsPerMs: number,
  centerDate: Date,
  viewportWidth: number,
  showLabels: boolean = true,
  maxTracks: number = 0
): LayoutEvent[] {
  // Calculate viewport left edge in time
  const viewportLeftMs = centerDate.getTime() - (viewportWidth / 2) / pixelsPerMs;

  // Filter to visible events (binary search for points, scan for durations)
  const visible = filterVisiblePrepared(prepared, visibleRange);

  // Calculate positions from cached epoch milliseconds
  const positioned: LayoutEvent[] = visible.map(({ event, startMs, endMs, isDuration }) => {
    const x = (startMs - viewportLeftMs) * pixelsPerMs;

    let width: number;
    let endX: number | undefined;
    let durationWidth: number | undefined;

    if (isDuration && endMs !== undefined) {
      // For duration events, calculate the tape width
      endX = (endMs - viewportLeftMs) * pixelsPerMs;
      durationWidth = Math.max(endX - x, MIN_DURATION_WIDTH);
      // Width for track assignment includes the tape plus label
      width = durationWidth + (showLabels ? LABEL_PADDING + (event.title.length * CHAR_WIDTH) : 0);
    } else {
      // For point events, estimate label width
      width = estimateLabelWidth(event.title, showLabels);
    }

    return {
      event,
      x,
      width,
      track: 0, // Will be assigned by assignTracks
      isDuration,
      endX,
      durationWidth,
    };
  });

  // Assign tracks to prevent overlap
  const tracked = assignTracks(positioned, maxTracks);

  // Calculate sticky labels for off-left events
  return calculateStickyLabels(tracked);
}

/**
 * Get the total number of tracks needed for layout
 */
export function getTrackCount(layoutEvents: LayoutEvent[]): number {
  if (layoutEvents.length === 0) return 1;
  return Math.max(...layoutEvents.map(e => e.track)) + 1;
}
