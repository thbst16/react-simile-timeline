/**
 * Date utility functions for timeline calculations
 * Supports ISO 8601, legacy Simile formats, year-only, and BCE dates
 */

/** ISO 8601 calendar dates carrying no time component: "2023-01-15" or "2023-01". */
const ISO_DATE_ONLY = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/;

/**
 * Parse an ISO date-only string as local midnight.
 *
 * `new Date("2023-01-15")` is UTC midnight by specification, but every
 * consumer of these values reads them with local getters, so parsing
 * natively shifts date-only events one day earlier at negative UTC offsets.
 *
 * Native ISO bounds are reproduced exactly so this stays a timezone fix and
 * nothing more: month must be 01-12 and day 01-31, while overflow inside
 * those bounds still rolls over ("2023-02-29" -> March 1, as before).
 *
 * Returns null when the string is not a date-only form or is out of bounds,
 * leaving the caller to fall through to the other formats.
 */
function parseIsoDateOnly(value: string): Date | null {
  const match = value.match(ISO_DATE_ONLY);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = match[3] === undefined ? 1 : Number(match[3]);

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  // Built via setFullYear rather than the constructor so years 0-99 are not
  // remapped into the 1900s.
  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Parse a date string into a Date object
 * Supports multiple formats for Simile compatibility:
 * - ISO 8601: "2023-01-15", "2023-01-15T10:30:00"
 * - Legacy: "Jan 15 2023", "January 15, 2023"
 * - Year only: "2023"
 * - BCE: "-500" (500 BCE)
 *
 * Timezone semantics:
 * - Date-only strings ("2023-01-15", "2023-01") resolve to local midnight,
 *   so the calendar day a caller wrote is the calendar day rendered.
 * - Datetimes without an offset ("2023-06-20T14:30:00") are local, per spec.
 * - An explicit "Z" or "+/-HH:MM" suffix is honored as an absolute instant,
 *   because the caller chose that deliberately.
 */
export function parseDate(dateStr: string): Date {
  if (!dateStr) {
    throw new Error('Date string is required');
  }

  const trimmed = dateStr.trim();

  // Handle BCE dates (negative years)
  if (/^-?\d+$/.test(trimmed)) {
    const year = parseInt(trimmed, 10);
    // JavaScript Date uses 0-indexed months
    const date = new Date(0);
    date.setFullYear(year, 0, 1);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  // Date-only strings must be built locally, before the native parser gets
  // them and interprets them as UTC.
  const dateOnly = parseIsoDateOnly(trimmed);
  if (dateOnly) {
    return dateOnly;
  }

  // Try ISO 8601 first (most common)
  const isoDate = new Date(trimmed);
  if (!isNaN(isoDate.getTime())) {
    return isoDate;
  }

  // Try legacy formats
  const legacyPatterns = [
    // "Jan 15 2023" or "January 15 2023"
    /^([A-Za-z]+)\s+(\d{1,2})\s+(\d{4})$/,
    // "Jan 15, 2023" or "January 15, 2023"
    /^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/,
    // "15 Jan 2023" or "15 January 2023"
    /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/,
  ];

  for (const pattern of legacyPatterns) {
    const match = trimmed.match(pattern);
    if (match) {
      const parsed = new Date(trimmed);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }
  }

  throw new Error(`Unable to parse date: ${dateStr}`);
}

/**
 * Try to parse a date string, returning null if parsing fails
 * Use this for graceful error handling of potentially invalid dates
 */
export function tryParseDate(dateStr: string | undefined | null): Date | null {
  if (!dateStr) {
    return null;
  }
  try {
    return parseDate(dateStr);
  } catch {
    return null;
  }
}

/**
 * Check if a date string is valid
 */
export function isValidDate(dateStr: string | undefined | null): boolean {
  return tryParseDate(dateStr) !== null;
}

/**
 * Format a date for display
 * Simple formatting without external dependencies
 */
export function formatDate(date: Date, format: string): string {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const fullMonthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const pad = (n: number): string => n.toString().padStart(2, '0');

  switch (format) {
    case 'yyyy':
      return year.toString();
    case 'MMM':
      return monthNames[month];
    case 'MMMM':
      return fullMonthNames[month];
    case 'MMM yyyy':
      return `${monthNames[month]} ${year}`;
    case 'MMMM yyyy':
      return `${fullMonthNames[month]} ${year}`;
    case 'MMM d':
      return `${monthNames[month]} ${day}`;
    case 'MMM d, yyyy':
      return `${monthNames[month]} ${day}, ${year}`;
    case 'd':
      return day.toString();
    case 'HH:mm':
      return `${pad(hours)}:${pad(minutes)}`;
    case 'h:mm a': {
      const h = hours % 12 || 12;
      const ampm = hours < 12 ? 'am' : 'pm';
      return `${h}:${pad(minutes)} ${ampm}`;
    }
    case 'MMM d HH:mm':
      return `${monthNames[month]} ${day} ${pad(hours)}:${pad(minutes)}`;
    default:
      // Default to ISO-like format
      return `${year}-${pad(month + 1)}-${pad(day)}`;
  }
}

/**
 * Convert a date to pixel position relative to an origin
 */
export function dateToPixel(
  date: Date,
  origin: Date,
  pixelsPerMs: number
): number {
  const deltaMs = date.getTime() - origin.getTime();
  return deltaMs * pixelsPerMs;
}

/**
 * Convert a pixel position to date relative to an origin
 */
export function pixelToDate(
  pixel: number,
  origin: Date,
  pixelsPerMs: number
): Date {
  const deltaMs = pixel / pixelsPerMs;
  return new Date(origin.getTime() + deltaMs);
}

/**
 * Get the visible date range based on center date and viewport
 */
export function getVisibleRange(
  centerDate: Date,
  viewportWidth: number,
  pixelsPerMs: number
): { start: Date; end: Date } {
  const halfWidthMs = (viewportWidth / 2) / pixelsPerMs;
  const centerMs = centerDate.getTime();

  return {
    start: new Date(centerMs - halfWidthMs),
    end: new Date(centerMs + halfWidthMs),
  };
}

/**
 * Calculate the median date from an array of events
 * Gracefully handles invalid dates by skipping them
 */
export function getMedianDate(events: Array<{ start: string }>): Date {
  if (events.length === 0) {
    return new Date();
  }

  // Filter out events with invalid dates and get timestamps
  const timestamps = events
    .map(e => {
      const date = tryParseDate(e.start);
      return date ? date.getTime() : null;
    })
    .filter((t): t is number => t !== null)
    .sort((a, b) => a - b);

  // Return current date if no valid timestamps
  if (timestamps.length === 0) {
    return new Date();
  }

  const mid = Math.floor(timestamps.length / 2);
  const medianTs = timestamps.length % 2 === 0
    ? (timestamps[mid - 1] + timestamps[mid]) / 2
    : timestamps[mid];

  return new Date(medianTs);
}

/**
 * Time unit durations in milliseconds
 */
export const TIME_UNITS = {
  millisecond: 1,
  second: 1000,
  minute: 60 * 1000,
  hour: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000, // Approximate
  year: 365 * 24 * 60 * 60 * 1000, // Approximate
  decade: 10 * 365 * 24 * 60 * 60 * 1000,
  century: 100 * 365 * 24 * 60 * 60 * 1000,
} as const;

export type TimeUnit = keyof typeof TIME_UNITS;
