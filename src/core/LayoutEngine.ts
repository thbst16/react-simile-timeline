/**
 * LayoutEngine - Event positioning and track assignment
 *
 * Automatically arranges events into tracks to prevent overlapping.
 * Uses a greedy algorithm to assign events to the first available track.
 *
 * Sprint 3: Advanced Rendering
 */

import type { TimelineEvent } from '../types/events';
import type { Ether } from './Ether';

/**
 * Represents a laid-out event with positioning information
 */
export interface LayoutItem {
  /** The original event data */
  event: TimelineEvent;

  /** Track number (0-indexed) */
  track: number;

  /** Horizontal pixel position (relative to viewport center) */
  x: number;

  /** Width in pixels (for duration events) */
  width: number;

  /** Vertical pixel position (top of event) */
  y: number;

  /** Height in pixels */
  height: number;

  /** Whether this is a duration event (tape) */
  isDuration: boolean;

  /** Start date as Date object */
  startDate: Date;

  /** End date as Date object (same as start for instant events) */
  endDate: Date;
}

/**
 * Configuration for layout engine
 */
export interface LayoutConfig {
  /** Height of each track in pixels */
  trackHeight: number;

  /** Gap between tracks in pixels */
  trackGap: number;

  /** Offset from top of band to first track */
  trackOffset: number;

  /** Minimum width for duration events (prevents too-narrow tapes) */
  minTapeWidth?: number;

  /** Whether to respect manual track assignments (event.track) */
  respectManualTracks?: boolean;
}

/**
 * Default layout configuration
 */
const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  trackHeight: 30,
  trackGap: 5,
  trackOffset: 25, // Space for timescale labels
  minTapeWidth: 2,
  respectManualTracks: true,
};

/**
 * LayoutEngine - Arranges events into non-overlapping tracks
 */
export class LayoutEngine {
  private config: LayoutConfig;

  constructor(config: Partial<LayoutConfig> = {}) {
    this.config = { ...DEFAULT_LAYOUT_CONFIG, ...config };
  }

  /**
   * Layout events within a viewport
   *
   * @param events - Events to layout
   * @param ether - Time-to-pixel converter
   * @param viewport - Viewport information
   * @returns Array of positioned layout items
   */
  public layout(
    events: TimelineEvent[],
    ether: Ether,
    viewport: { centerDate: Date; width: number }
  ): LayoutItem[] {
    // Convert events to layout items with positions
    const items = this.createLayoutItems(events, ether, viewport);

    // Sort by start date (then by duration, shorter first)
    items.sort((a, b) => {
      const dateDiff = a.startDate.getTime() - b.startDate.getTime();
      if (dateDiff !== 0) return dateDiff;

      // Same start date, sort by duration (shorter events first)
      const durationA = a.endDate.getTime() - a.startDate.getTime();
      const durationB = b.endDate.getTime() - b.startDate.getTime();
      return durationA - durationB;
    });

    // Assign tracks using greedy algorithm
    this.assignTracks(items);

    // Calculate vertical positions based on tracks
    this.calculateVerticalPositions(items);

    return items;
  }

  /**
   * Create initial layout items from events
   */
  private createLayoutItems(
    events: TimelineEvent[],
    ether: Ether,
    viewport: { centerDate: Date; width: number }
  ): LayoutItem[] {
    const items: LayoutItem[] = [];

    for (const event of events) {
      try {
        const startDate = new Date(event.start);
        const endDate = event.end ? new Date(event.end) : startDate;
        const isDuration = event.isDuration || !!event.end;

        // Calculate pixel positions
        const startPixel = ether.dateToPixel(startDate, viewport.centerDate);
        const endPixel = isDuration ? ether.dateToPixel(endDate, viewport.centerDate) : startPixel;

        // Calculate width (duration tapes span time, instant events have no width)
        let width = isDuration ? Math.abs(endPixel - startPixel) : 0;

        // Apply minimum tape width if configured
        if (isDuration && this.config.minTapeWidth && width < this.config.minTapeWidth) {
          width = this.config.minTapeWidth;
        }

        items.push({
          event,
          track: 0, // Will be assigned later
          x: startPixel,
          width,
          y: 0, // Will be calculated later
          height: this.config.trackHeight,
          isDuration,
          startDate,
          endDate,
        });
      } catch (error) {
        // Skip invalid events
        console.warn(`Failed to layout event "${event.title}":`, error);
      }
    }

    return items;
  }

  /**
   * Assign events to tracks using greedy algorithm
   *
   * Algorithm:
   * 1. Process events in chronological order
   * 2. For each event, find the first track where it doesn't overlap
   * 3. If no track is available, create a new one
   * 4. Respect manual track assignments if configured
   */
  private assignTracks(items: LayoutItem[]): void {
    // Track occupied regions: track index -> array of [start, end] ranges
    const trackOccupancy: Array<Array<[number, number]>> = [];

    for (const item of items) {
      // Check if event has manual track assignment
      if (this.config.respectManualTracks && item.event.track !== undefined) {
        const manualTrack = item.event.track;
        item.track = manualTrack;

        // Ensure track array exists
        while (trackOccupancy.length <= manualTrack) {
          trackOccupancy.push([]);
        }

        // Mark track as occupied
        const track = trackOccupancy[manualTrack];
        if (track) {
          track.push([item.x, item.x + item.width]);
        }
        continue;
      }

      // Find first available track
      let assignedTrack = -1;

      for (let trackIndex = 0; trackIndex < trackOccupancy.length; trackIndex++) {
        const track = trackOccupancy[trackIndex];
        if (track && this.canFitInTrack(item, track)) {
          assignedTrack = trackIndex;
          break;
        }
      }

      // If no track available, create new one
      if (assignedTrack === -1) {
        assignedTrack = trackOccupancy.length;
        trackOccupancy.push([]);
      }

      // Assign track and mark as occupied
      item.track = assignedTrack;
      const assignedTrackArray = trackOccupancy[assignedTrack];
      if (assignedTrackArray) {
        assignedTrackArray.push([item.x, item.x + item.width]);
      }
    }
  }

  /**
   * Check if an event can fit in a track without overlapping
   */
  private canFitInTrack(item: LayoutItem, occupiedRanges: Array<[number, number]>): boolean {
    const itemStart = item.x;
    const itemEnd = item.x + item.width;

    // For instant events (width = 0), add small buffer for visual separation
    const buffer = item.isDuration ? 0 : 5;

    for (const [occupiedStart, occupiedEnd] of occupiedRanges) {
      // Check for overlap
      // Events overlap if: itemStart < occupiedEnd AND itemEnd > occupiedStart
      if (itemStart - buffer < occupiedEnd && itemEnd + buffer > occupiedStart) {
        return false; // Overlaps with existing event
      }
    }

    return true; // No overlap
  }

  /**
   * Calculate vertical positions based on track assignments
   */
  private calculateVerticalPositions(items: LayoutItem[]): void {
    for (const item of items) {
      // y = trackOffset + (track * (trackHeight + trackGap))
      item.y = this.config.trackOffset + (item.track * (this.config.trackHeight + this.config.trackGap));
    }
  }

  /**
   * Get the total height needed for all tracks
   *
   * @param items - Laid out items
   * @returns Minimum band height in pixels
   */
  public getMinimumBandHeight(items: LayoutItem[]): number {
    if (items.length === 0) {
      return this.config.trackOffset + this.config.trackHeight;
    }

    const maxTrack = Math.max(...items.map(item => item.track));
    const tracksHeight = (maxTrack + 1) * this.config.trackHeight + maxTrack * this.config.trackGap;

    return this.config.trackOffset + tracksHeight;
  }

  /**
   * Get the number of tracks used
   */
  public getTrackCount(items: LayoutItem[]): number {
    if (items.length === 0) return 0;
    return Math.max(...items.map(item => item.track)) + 1;
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<LayoutConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  public getConfig(): Readonly<LayoutConfig> {
    return { ...this.config };
  }
}

/**
 * Helper function to check if two events overlap in time
 *
 * @param event1Start - Start date of first event
 * @param event1End - End date of first event
 * @param event2Start - Start date of second event
 * @param event2End - End date of second event
 * @returns True if events overlap
 */
export function eventsOverlap(
  event1Start: Date,
  event1End: Date,
  event2Start: Date,
  event2End: Date
): boolean {
  const start1 = event1Start.getTime();
  const end1 = event1End.getTime();
  const start2 = event2Start.getTime();
  const end2 = event2End.getTime();

  return start1 < end2 && end1 > start2;
}
