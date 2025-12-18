/**
 * Time scale utilities for generating tick marks and labels
 */

import { TIME_UNITS, type TimeUnit, formatDate } from './dateUtils';

/**
 * Scale configuration for rendering time labels
 */
export interface ScaleConfig {
  /** Time unit for ticks */
  unit: TimeUnit;
  /** Interval between ticks (e.g., 5 for every 5 minutes) */
  interval: number;
  /** Date format string for labels */
  format: string;
  /** Milliseconds between ticks */
  tickMs: number;
}

/**
 * A single tick mark on the time scale
 */
export interface ScaleTick {
  /** Date of the tick */
  date: Date;
  /** Formatted label text */
  label: string;
  /** X position in pixels from viewport left */
  x: number;
  /** Whether this is a major tick (e.g., start of day/month/year) */
  isMajor: boolean;
}

/**
 * Determine appropriate scale configuration based on zoom level
 * @param pixelsPerMs - Current zoom level
 * @param minLabelSpacing - Minimum pixels between labels
 */
export function getScaleConfig(
  pixelsPerMs: number,
  minLabelSpacing: number = 80
): ScaleConfig {
  // Calculate milliseconds per minimum label spacing
  const msPerMinLabel = minLabelSpacing / pixelsPerMs;

  const MINUTE = TIME_UNITS.minute;
  const HOUR = TIME_UNITS.hour;
  const DAY = TIME_UNITS.day;
  const MONTH = TIME_UNITS.month;
  const YEAR = TIME_UNITS.year;

  // Find appropriate unit and interval
  if (msPerMinLabel < 5 * MINUTE) {
    return {
      unit: 'minute',
      interval: 1,
      format: 'HH:mm',
      tickMs: MINUTE,
    };
  } else if (msPerMinLabel < 15 * MINUTE) {
    return {
      unit: 'minute',
      interval: 5,
      format: 'HH:mm',
      tickMs: 5 * MINUTE,
    };
  } else if (msPerMinLabel < 30 * MINUTE) {
    return {
      unit: 'minute',
      interval: 15,
      format: 'HH:mm',
      tickMs: 15 * MINUTE,
    };
  } else if (msPerMinLabel < HOUR) {
    return {
      unit: 'minute',
      interval: 30,
      format: 'HH:mm',
      tickMs: 30 * MINUTE,
    };
  } else if (msPerMinLabel < 3 * HOUR) {
    return {
      unit: 'hour',
      interval: 1,
      format: 'HH:mm',
      tickMs: HOUR,
    };
  } else if (msPerMinLabel < 6 * HOUR) {
    return {
      unit: 'hour',
      interval: 3,
      format: 'HH:mm',
      tickMs: 3 * HOUR,
    };
  } else if (msPerMinLabel < 12 * HOUR) {
    return {
      unit: 'hour',
      interval: 6,
      format: 'HH:mm',
      tickMs: 6 * HOUR,
    };
  } else if (msPerMinLabel < DAY) {
    return {
      unit: 'hour',
      interval: 12,
      format: 'MMM d HH:mm',
      tickMs: 12 * HOUR,
    };
  } else if (msPerMinLabel < 3 * DAY) {
    return {
      unit: 'day',
      interval: 1,
      format: 'MMM d',
      tickMs: DAY,
    };
  } else if (msPerMinLabel < 7 * DAY) {
    return {
      unit: 'day',
      interval: 3,
      format: 'MMM d',
      tickMs: 3 * DAY,
    };
  } else if (msPerMinLabel < 14 * DAY) {
    return {
      unit: 'week',
      interval: 1,
      format: 'MMM d',
      tickMs: 7 * DAY,
    };
  } else if (msPerMinLabel < MONTH) {
    return {
      unit: 'week',
      interval: 2,
      format: 'MMM d',
      tickMs: 14 * DAY,
    };
  } else if (msPerMinLabel < 3 * MONTH) {
    return {
      unit: 'month',
      interval: 1,
      format: 'MMM yyyy',
      tickMs: MONTH,
    };
  } else if (msPerMinLabel < 6 * MONTH) {
    return {
      unit: 'month',
      interval: 3,
      format: 'MMM yyyy',
      tickMs: 3 * MONTH,
    };
  } else if (msPerMinLabel < YEAR) {
    return {
      unit: 'month',
      interval: 6,
      format: 'MMM yyyy',
      tickMs: 6 * MONTH,
    };
  } else if (msPerMinLabel < 5 * YEAR) {
    return {
      unit: 'year',
      interval: 1,
      format: 'yyyy',
      tickMs: YEAR,
    };
  } else if (msPerMinLabel < 10 * YEAR) {
    return {
      unit: 'year',
      interval: 5,
      format: 'yyyy',
      tickMs: 5 * YEAR,
    };
  } else if (msPerMinLabel < 50 * YEAR) {
    return {
      unit: 'decade',
      interval: 1,
      format: 'yyyy',
      tickMs: 10 * YEAR,
    };
  } else {
    return {
      unit: 'century',
      interval: 1,
      format: 'yyyy',
      tickMs: 100 * YEAR,
    };
  }
}

/**
 * Align a date to the start of a time unit
 */
export function alignToUnit(date: Date, unit: TimeUnit, interval: number = 1): Date {
  const aligned = new Date(date);

  switch (unit) {
    case 'minute':
      aligned.setSeconds(0, 0);
      aligned.setMinutes(Math.floor(aligned.getMinutes() / interval) * interval);
      break;
    case 'hour':
      aligned.setMinutes(0, 0, 0);
      aligned.setHours(Math.floor(aligned.getHours() / interval) * interval);
      break;
    case 'day':
      aligned.setHours(0, 0, 0, 0);
      break;
    case 'week':
      aligned.setHours(0, 0, 0, 0);
      // Align to Sunday
      aligned.setDate(aligned.getDate() - aligned.getDay());
      break;
    case 'month':
      aligned.setHours(0, 0, 0, 0);
      aligned.setDate(1);
      aligned.setMonth(Math.floor(aligned.getMonth() / interval) * interval);
      break;
    case 'year':
      aligned.setHours(0, 0, 0, 0);
      aligned.setMonth(0, 1);
      aligned.setFullYear(Math.floor(aligned.getFullYear() / interval) * interval);
      break;
    case 'decade':
      aligned.setHours(0, 0, 0, 0);
      aligned.setMonth(0, 1);
      aligned.setFullYear(Math.floor(aligned.getFullYear() / 10) * 10);
      break;
    case 'century':
      aligned.setHours(0, 0, 0, 0);
      aligned.setMonth(0, 1);
      aligned.setFullYear(Math.floor(aligned.getFullYear() / 100) * 100);
      break;
    default:
      // For millisecond/second, no alignment needed
      break;
  }

  return aligned;
}

/**
 * Add an interval to a date
 */
export function addInterval(date: Date, unit: TimeUnit, interval: number = 1): Date {
  const result = new Date(date);

  switch (unit) {
    case 'millisecond':
      result.setMilliseconds(result.getMilliseconds() + interval);
      break;
    case 'second':
      result.setSeconds(result.getSeconds() + interval);
      break;
    case 'minute':
      result.setMinutes(result.getMinutes() + interval);
      break;
    case 'hour':
      result.setHours(result.getHours() + interval);
      break;
    case 'day':
      result.setDate(result.getDate() + interval);
      break;
    case 'week':
      result.setDate(result.getDate() + (interval * 7));
      break;
    case 'month':
      result.setMonth(result.getMonth() + interval);
      break;
    case 'year':
      result.setFullYear(result.getFullYear() + interval);
      break;
    case 'decade':
      result.setFullYear(result.getFullYear() + (interval * 10));
      break;
    case 'century':
      result.setFullYear(result.getFullYear() + (interval * 100));
      break;
  }

  return result;
}

/**
 * Check if a date is at a major boundary (start of day, month, year)
 */
function isMajorTick(date: Date, unit: TimeUnit): boolean {
  switch (unit) {
    case 'minute':
    case 'hour':
      // Major if at start of day
      return date.getHours() === 0 && date.getMinutes() === 0;
    case 'day':
    case 'week':
      // Major if at start of month
      return date.getDate() === 1;
    case 'month':
      // Major if at start of year
      return date.getMonth() === 0;
    case 'year':
    case 'decade':
      // Major if divisible by 10
      return date.getFullYear() % 10 === 0;
    case 'century':
      // Major if divisible by 100
      return date.getFullYear() % 100 === 0;
    default:
      return false;
  }
}

/**
 * Generate tick marks for a visible range
 */
export function generateTicks(
  visibleRange: { start: Date; end: Date },
  scaleConfig: ScaleConfig,
  pixelsPerMs: number,
  centerDate: Date,
  viewportWidth: number
): ScaleTick[] {
  const ticks: ScaleTick[] = [];

  // Calculate the viewport's left edge in time
  const viewportLeftMs = centerDate.getTime() - (viewportWidth / 2) / pixelsPerMs;

  // Start from aligned position before visible range
  let current = alignToUnit(
    new Date(visibleRange.start.getTime() - scaleConfig.tickMs),
    scaleConfig.unit,
    scaleConfig.interval
  );

  // Safety limit to prevent infinite loops
  const maxTicks = 200;
  let tickCount = 0;

  while (current <= visibleRange.end && tickCount < maxTicks) {
    // Calculate x position relative to viewport left
    const x = (current.getTime() - viewportLeftMs) * pixelsPerMs;

    // Only include ticks within extended viewport
    if (x >= -100 && x <= viewportWidth + 100) {
      ticks.push({
        date: new Date(current),
        label: formatDate(current, scaleConfig.format),
        x,
        isMajor: isMajorTick(current, scaleConfig.unit),
      });
    }

    current = addInterval(current, scaleConfig.unit, scaleConfig.interval);
    tickCount++;
  }

  return ticks;
}
