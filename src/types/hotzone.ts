/**
 * Hot Zone Types
 *
 * Hot zones enable variable time resolution across the timeline.
 * Different zones can display different levels of detail.
 *
 * Sprint 5: Polish & Performance
 */

import type { IntervalUnit } from './bands';

/**
 * Hot Zone Configuration
 *
 * Defines a region of the timeline with specific display characteristics.
 */
export interface HotZone {
  /**
   * Start date of the hot zone (ISO-8601 string or Date)
   */
  start: string | Date;

  /**
   * End date of the hot zone (ISO-8601 string or Date)
   */
  end: string | Date;

  /**
   * Magnification factor relative to the base timeline
   * Values > 1 zoom in (more detail)
   * Values < 1 zoom out (less detail)
   * @default 1
   */
  magnify?: number;

  /**
   * Time unit to use in this zone
   * Overrides the default unit calculation
   */
  unit?: IntervalUnit;

  /**
   * Multiple of the unit (e.g., unit=MONTH, multiple=3 shows quarters)
   * @default 1
   */
  multiple?: number;

  /**
   * Pixels per unit in this zone
   * Overrides the default pixel calculation
   */
  pixelsPerInterval?: number;

  /**
   * Optional label for the hot zone
   */
  label?: string;

  /**
   * Optional color highlight for the zone
   */
  color?: string;

  /**
   * Whether to show zone boundaries
   * @default false
   */
  showBoundaries?: boolean;
}

/**
 * Hot Zone Manager State
 */
export interface HotZoneState {
  /**
   * All configured hot zones
   */
  zones: HotZone[];

  /**
   * Currently active zones (visible in viewport)
   */
  activeZones: HotZone[];

  /**
   * Add a hot zone
   */
  addZone: (zone: HotZone) => void;

  /**
   * Remove a hot zone
   */
  removeZone: (index: number) => void;

  /**
   * Clear all hot zones
   */
  clearZones: () => void;

  /**
   * Update active zones based on viewport
   */
  updateActiveZones: (viewportStart: Date, viewportEnd: Date) => void;

  /**
   * Get the effective magnification at a specific date
   */
  getMagnificationAt: (date: Date) => number;

  /**
   * Get the effective unit at a specific date
   */
  getUnitAt: (date: Date) => IntervalUnit | undefined;

  /**
   * Get the effective pixels per interval at a specific date
   */
  getPixelsPerIntervalAt: (date: Date) => number | undefined;
}

/**
 * Hot Zone Calculation Result
 */
export interface HotZoneCalculation {
  /**
   * The hot zone that applies (if any)
   */
  zone: HotZone | null;

  /**
   * Effective magnification factor
   */
  magnification: number;

  /**
   * Effective time unit
   */
  unit?: IntervalUnit;

  /**
   * Effective multiple
   */
  multiple: number;

  /**
   * Effective pixels per interval
   */
  pixelsPerInterval?: number;

  /**
   * Whether this date is in a hot zone
   */
  isInHotZone: boolean;
}

/**
 * Hot Zone Transition
 *
 * Describes a transition between different zones or to/from base timeline.
 */
export interface HotZoneTransition {
  /**
   * Position in pixels where transition occurs
   */
  position: number;

  /**
   * Date at the transition
   */
  date: Date;

  /**
   * Zone before transition (null = base timeline)
   */
  fromZone: HotZone | null;

  /**
   * Zone after transition (null = base timeline)
   */
  toZone: HotZone | null;

  /**
   * Magnification before transition
   */
  fromMagnification: number;

  /**
   * Magnification after transition
   */
  toMagnification: number;
}
