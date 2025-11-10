/**
 * DateTime utilities for timeline date handling
 *
 * Handles:
 * - Multiple date format parsing (ISO-8601, Gregorian, BCE)
 * - Date arithmetic with interval units
 * - Date formatting for display
 * - BCE (Before Common Era) dates
 */

import {
  parseISO,
  format as formatFn,
  addMilliseconds,
  addSeconds,
  addMinutes,
  addHours,
  addDays,
  addWeeks,
  addMonths,
  addYears,
} from 'date-fns';
import type { IntervalUnit } from '../types/bands';

/**
 * Parse a date string in various formats
 *
 * Supports:
 * - ISO-8601: "2006-06-28T00:00:00Z"
 * - Gregorian: "June 28, 2006", "Jun 28 2006"
 * - BCE: "-500", "500 BC", "500 BCE"
 * - Timestamps: "1234567890000"
 *
 * @param dateString - Date string to parse
 * @returns Date object
 * @throws Error if date string is invalid
 */
export function parseDate(dateString: string): Date {
  if (!dateString || typeof dateString !== 'string') {
    throw new Error('Invalid date string: must be a non-empty string');
  }

  const trimmed = dateString.trim();

  // Handle BCE dates (negative years)
  if (trimmed.startsWith('-') || /\s(BC|BCE|B\.C\.|B\.C\.E\.)$/i.test(trimmed)) {
    return parseBCEDate(trimmed);
  }

  // Try ISO-8601 first (most common)
  try {
    const isoDate = parseISO(trimmed);
    if (!isNaN(isoDate.getTime())) {
      return isoDate;
    }
  } catch {
    // Continue to other formats
  }

  // Try native Date constructor (handles many formats)
  try {
    const nativeDate = new Date(trimmed);
    if (!isNaN(nativeDate.getTime())) {
      return nativeDate;
    }
  } catch {
    // Continue to other formats
  }

  // Try as Unix timestamp (milliseconds)
  if (/^\d+$/.test(trimmed)) {
    const timestamp = parseInt(trimmed, 10);
    const date = new Date(timestamp);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  throw new Error(`Unable to parse date: "${dateString}"`);
}

// Detect Node.js version's setUTCFullYear behavior for negative years
// Some versions have an off-by-one quirk, others don't
const testDate = new Date(0);
testDate.setUTCFullYear(-1);
const nodeHasOffByOne = testDate.getFullYear() === -2;

/**
 * Parse BCE (Before Common Era) dates
 *
 * Formats:
 * - "-500" -> 500 BCE
 * - "500 BC" -> 500 BCE
 * - "500 BCE" -> 500 BCE
 *
 * @param dateString - BCE date string
 * @returns Date object (with negative year)
 */
function parseBCEDate(dateString: string): Date {
  let year: number;

  if (dateString.startsWith('-')) {
    // Format: "-500"
    year = parseInt(dateString, 10);
  } else {
    // Format: "500 BC" or "500 BCE"
    const match = dateString.match(/^(\d+)\s*(BC|BCE|B\.C\.|B\.C\.E\.)$/i);
    if (!match || !match[1]) {
      throw new Error(`Invalid BCE date format: "${dateString}"`);
    }
    year = -parseInt(match[1], 10);
  }

  if (isNaN(year)) {
    throw new Error(`Invalid BCE year: "${dateString}"`);
  }

  // Create date with BCE year
  // Note: Different Node.js versions handle setUTCFullYear differently with negative years
  // Some have an off-by-one quirk (setUTCFullYear(-500) → getFullYear() = -501)
  // Others don't (setUTCFullYear(-500) → getFullYear() = -500)
  // We compensate to ensure consistent behavior: astronomical year numbering (1 BC = year 0)
  const date = new Date(0);
  date.setUTCFullYear(nodeHasOffByOne ? year : year - 1);
  date.setUTCMonth(0);
  date.setUTCDate(1);
  date.setUTCHours(0, 0, 0, 0);

  return date;
}

/**
 * Format a date for display
 *
 * @param date - Date to format
 * @param formatString - date-fns format string (default: 'PPP')
 * @returns Formatted date string
 */
export function formatDate(date: Date, formatString: string = 'PPP'): string {
  try {
    // Handle BCE dates specially
    const year = date.getFullYear();
    if (year < 0) {
      return `${Math.abs(year)} BCE`;
    }

    return formatFn(date, formatString);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Unable to format date: ${errorMessage}`);
  }
}

/**
 * Add an interval to a date
 *
 * @param date - Starting date
 * @param amount - Amount to add (can be negative)
 * @param unit - Unit of time
 * @returns New date with interval added
 */
export function addInterval(date: Date, amount: number, unit: IntervalUnit): Date {
  switch (unit) {
    case 'MILLISECOND':
      return addMilliseconds(date, amount);
    case 'SECOND':
      return addSeconds(date, amount);
    case 'MINUTE':
      return addMinutes(date, amount);
    case 'HOUR':
      return addHours(date, amount);
    case 'DAY':
      return addDays(date, amount);
    case 'WEEK':
      return addWeeks(date, amount);
    case 'MONTH':
      return addMonths(date, amount);
    case 'YEAR':
      return addYears(date, amount);
    case 'DECADE':
      return addYears(date, amount * 10);
    case 'CENTURY':
      return addYears(date, amount * 100);
    case 'MILLENNIUM':
      return addYears(date, amount * 1000);
    default: {
      const exhaustiveCheck: never = unit;
      throw new Error(`Unknown interval unit: ${String(exhaustiveCheck)}`);
    }
  }
}

/**
 * Check if a date string is in BCE format
 */
export function isBCEDate(dateString: string): boolean {
  return dateString.startsWith('-') || /\s(BC|BCE|B\.C\.|B\.C\.E\.)$/i.test(dateString);
}

/**
 * Get a human-readable description of a time interval
 */
export function getIntervalDescription(amount: number, unit: IntervalUnit): string {
  const absAmount = Math.abs(amount);
  const plural = absAmount !== 1 ? 's' : '';

  const unitName = unit.toLowerCase();
  return `${absAmount} ${unitName}${plural}`;
}
