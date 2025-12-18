/**
 * Layout engine for preventing label overlap
 * Uses a greedy left-to-right track assignment algorithm
 */

import type { TimelineEvent } from '../types';
import { parseDate, dateToPixel } from './dateUtils';

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
}

/** Average character width in pixels (approximate) */
const CHAR_WIDTH = 7;
/** Event dot diameter */
const DOT_WIDTH = 10;
/** Padding between dot and label */
const LABEL_PADDING = 6;
/** Minimum gap between labels */
const LABEL_GAP = 8;

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
      const eventTime = parseDate(event.start).getTime();
      return eventTime >= rangeStart && eventTime <= rangeEnd;
    } catch {
      // Skip events with invalid dates
      return false;
    }
  });
}

/**
 * Assign events to vertical tracks to prevent overlap
 * Uses greedy left-to-right algorithm
 */
export function assignTracks(events: LayoutEvent[]): LayoutEvent[] {
  if (events.length === 0) return [];

  // Sort events by x position (left to right)
  const sorted = [...events].sort((a, b) => a.x - b.x);

  // Track end positions (rightmost edge of each track's last event)
  const trackEnds: number[] = [];

  for (const event of sorted) {
    // Find first track where this event fits (no overlap)
    let assignedTrack = -1;

    for (let t = 0; t < trackEnds.length; t++) {
      if (event.x >= trackEnds[t] + LABEL_GAP) {
        assignedTrack = t;
        break;
      }
    }

    // If no existing track fits, create a new one
    if (assignedTrack === -1) {
      assignedTrack = trackEnds.length;
    }

    // Assign track and update track end position
    event.track = assignedTrack;
    trackEnds[assignedTrack] = event.x + event.width;
  }

  return sorted;
}

/**
 * Calculate layout for events in the viewport
 */
export function calculateLayout(
  events: TimelineEvent[],
  visibleRange: { start: Date; end: Date },
  pixelsPerMs: number,
  centerDate: Date,
  viewportWidth: number,
  showLabels: boolean = true
): LayoutEvent[] {
  // Calculate viewport left edge in time
  const viewportLeftMs = centerDate.getTime() - (viewportWidth / 2) / pixelsPerMs;
  const viewportLeftDate = new Date(viewportLeftMs);

  // Filter to visible events
  const visibleEvents = filterVisibleEvents(events, visibleRange);

  // Calculate positions
  const positioned: LayoutEvent[] = visibleEvents.map(event => {
    const eventDate = parseDate(event.start);
    const x = dateToPixel(eventDate, viewportLeftDate, pixelsPerMs);
    const width = estimateLabelWidth(event.title, showLabels);

    return {
      event,
      x,
      width,
      track: 0, // Will be assigned by assignTracks
    };
  });

  // Assign tracks to prevent overlap
  return assignTracks(positioned);
}

/**
 * Get the total number of tracks needed for layout
 */
export function getTrackCount(layoutEvents: LayoutEvent[]): number {
  if (layoutEvents.length === 0) return 1;
  return Math.max(...layoutEvents.map(e => e.track)) + 1;
}
