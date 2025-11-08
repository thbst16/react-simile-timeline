/**
 * Hot Zone Utilities
 *
 * Functions for managing and calculating hot zone effects.
 * Hot zones enable variable time resolution across the timeline.
 *
 * Sprint 5: Polish & Performance
 */

import type { HotZone, HotZoneCalculation, HotZoneTransition } from '../types/hotzone';

/**
 * Parse a date string or Date object to Date
 */
function parseDate(date: string | Date): Date {
  if (date instanceof Date) return date;
  return new Date(date);
}

/**
 * Check if a date falls within a hot zone
 *
 * @param date - Date to check
 * @param zone - Hot zone to check against
 * @returns True if date is within the zone
 */
export function isDateInZone(date: Date, zone: HotZone): boolean {
  const start = parseDate(zone.start);
  const end = parseDate(zone.end);
  const time = date.getTime();

  return time >= start.getTime() && time <= end.getTime();
}

/**
 * Find all hot zones that contain a specific date
 *
 * @param date - Date to check
 * @param zones - Array of hot zones
 * @returns Array of zones containing the date
 */
export function findZonesAtDate(date: Date, zones: HotZone[]): HotZone[] {
  return zones.filter((zone) => isDateInZone(date, zone));
}

/**
 * Get the active zone at a specific date
 *
 * If multiple zones overlap, returns the one with highest magnification.
 * If no zones match, returns null.
 *
 * @param date - Date to check
 * @param zones - Array of hot zones
 * @returns The active zone or null
 */
export function getActiveZoneAtDate(date: Date, zones: HotZone[]): HotZone | null {
  const matchingZones = findZonesAtDate(date, zones);

  if (matchingZones.length === 0) return null;

  // If multiple zones overlap, use the one with highest magnification
  return matchingZones.reduce((best, current) => {
    const bestMag = best.magnify ?? 1;
    const currentMag = current.magnify ?? 1;
    return currentMag > bestMag ? current : best;
  });
}

/**
 * Calculate the effective parameters at a specific date
 *
 * @param date - Date to calculate for
 * @param zones - Array of hot zones
 * @param baseMagnification - Base magnification when not in a zone
 * @returns Hot zone calculation result
 */
export function calculateAtDate(
  date: Date,
  zones: HotZone[],
  baseMagnification = 1
): HotZoneCalculation {
  const zone = getActiveZoneAtDate(date, zones);

  if (!zone) {
    return {
      zone: null,
      magnification: baseMagnification,
      multiple: 1,
      isInHotZone: false,
    };
  }

  const result: HotZoneCalculation = {
    zone,
    magnification: zone.magnify ?? 1,
    multiple: zone.multiple ?? 1,
    isInHotZone: true,
  };

  if (zone.unit !== undefined) {
    result.unit = zone.unit;
  }

  if (zone.pixelsPerInterval !== undefined) {
    result.pixelsPerInterval = zone.pixelsPerInterval;
  }

  return result;
}

/**
 * Find all zones that intersect with a date range
 *
 * @param start - Start of range
 * @param end - End of range
 * @param zones - Array of hot zones
 * @returns Array of zones that intersect the range
 */
export function findZonesInRange(start: Date, end: Date, zones: HotZone[]): HotZone[] {
  const rangeStart = start.getTime();
  const rangeEnd = end.getTime();

  return zones.filter((zone) => {
    const zoneStart = parseDate(zone.start).getTime();
    const zoneEnd = parseDate(zone.end).getTime();

    // Check if ranges overlap
    return zoneStart <= rangeEnd && zoneEnd >= rangeStart;
  });
}

/**
 * Calculate all zone transitions within a date range
 *
 * Transitions occur at zone boundaries.
 *
 * @param start - Start of range
 * @param end - End of range
 * @param zones - Array of hot zones
 * @param dateToPixel - Function to convert date to pixel position
 * @returns Array of transitions sorted by position
 */
export function calculateTransitions(
  start: Date,
  end: Date,
  zones: HotZone[],
  dateToPixel: (date: Date) => number
): HotZoneTransition[] {
  const transitions: HotZoneTransition[] = [];
  const activeZones = findZonesInRange(start, end, zones);

  // Sort zones by start date
  const sortedZones = [...activeZones].sort((a, b) => {
    const aStart = parseDate(a.start).getTime();
    const bStart = parseDate(b.start).getTime();
    return aStart - bStart;
  });

  // Create transitions at zone boundaries
  sortedZones.forEach((zone) => {
    const zoneStart = parseDate(zone.start);
    const zoneEnd = parseDate(zone.end);

    // Transition at zone start (entering zone)
    if (zoneStart >= start && zoneStart <= end) {
      const prevZone = getActiveZoneAtDate(new Date(zoneStart.getTime() - 1), zones);
      transitions.push({
        position: dateToPixel(zoneStart),
        date: zoneStart,
        fromZone: prevZone,
        toZone: zone,
        fromMagnification: prevZone?.magnify ?? 1,
        toMagnification: zone.magnify ?? 1,
      });
    }

    // Transition at zone end (exiting zone)
    if (zoneEnd >= start && zoneEnd <= end) {
      const nextZone = getActiveZoneAtDate(new Date(zoneEnd.getTime() + 1), zones);
      transitions.push({
        position: dateToPixel(zoneEnd),
        date: zoneEnd,
        fromZone: zone,
        toZone: nextZone,
        fromMagnification: zone.magnify ?? 1,
        toMagnification: nextZone?.magnify ?? 1,
      });
    }
  });

  // Sort by position
  return transitions.sort((a, b) => a.position - b.position);
}

/**
 * Validate a hot zone configuration
 *
 * @param zone - Hot zone to validate
 * @returns Validation result with errors
 */
export function validateHotZone(zone: HotZone): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate dates
  try {
    const start = parseDate(zone.start);
    const end = parseDate(zone.end);

    if (isNaN(start.getTime())) {
      errors.push('Invalid start date');
    }

    if (isNaN(end.getTime())) {
      errors.push('Invalid end date');
    }

    if (start.getTime() >= end.getTime()) {
      errors.push('Start date must be before end date');
    }
  } catch (error) {
    errors.push('Failed to parse dates');
  }

  // Validate magnification
  if (zone.magnify !== undefined && zone.magnify <= 0) {
    errors.push('Magnification must be greater than 0');
  }

  // Validate multiple
  if (zone.multiple !== undefined && zone.multiple <= 0) {
    errors.push('Multiple must be greater than 0');
  }

  // Validate pixels per interval
  if (zone.pixelsPerInterval !== undefined && zone.pixelsPerInterval <= 0) {
    errors.push('Pixels per interval must be greater than 0');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Merge overlapping zones by priority (highest magnification wins)
 *
 * @param zones - Array of hot zones
 * @returns Array of non-overlapping zones
 */
export function mergeOverlappingZones(zones: HotZone[]): HotZone[] {
  if (zones.length <= 1) return zones;

  // Sort by magnification (highest first)
  const sorted = [...zones].sort((a, b) => {
    const aMag = a.magnify ?? 1;
    const bMag = b.magnify ?? 1;
    return bMag - aMag;
  });

  const result: HotZone[] = [];

  for (const zone of sorted) {
    // Check if this zone overlaps with any already added zones
    const hasOverlap = result.some((existing) => {
      const zoneStart = parseDate(zone.start).getTime();
      const zoneEnd = parseDate(zone.end).getTime();
      const existingStart = parseDate(existing.start).getTime();
      const existingEnd = parseDate(existing.end).getTime();

      return zoneStart < existingEnd && zoneEnd > existingStart;
    });

    if (!hasOverlap) {
      result.push(zone);
    }
  }

  return result;
}

/**
 * Create a default hot zone configuration
 *
 * @param start - Start date
 * @param end - End date
 * @param magnify - Magnification factor
 * @returns Hot zone configuration
 */
export function createHotZone(start: string | Date, end: string | Date, magnify = 2): HotZone {
  return {
    start,
    end,
    magnify,
  };
}
