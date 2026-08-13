import { describe, it, expect } from 'vitest';
import {
  parseDate,
  formatDate,
  dateToPixel,
  pixelToDate,
  getVisibleRange,
  getMedianDate,
  TIME_UNITS,
} from './dateUtils';

describe('parseDate', () => {
  it('parses ISO 8601 date strings', () => {
    const date = parseDate('2023-01-15');
    expect(date.getFullYear()).toBe(2023);
    expect(date.getMonth()).toBe(0); // January
    expect(date.getDate()).toBe(15);
  });

  it('parses ISO 8601 datetime strings', () => {
    const date = parseDate('2023-06-20T14:30:00');
    expect(date.getFullYear()).toBe(2023);
    expect(date.getMonth()).toBe(5); // June
    expect(date.getDate()).toBe(20);
  });

  it('parses year-only strings', () => {
    const date = parseDate('2023');
    expect(date.getFullYear()).toBe(2023);
    expect(date.getMonth()).toBe(0);
    expect(date.getDate()).toBe(1);
  });

  it('parses BCE (negative) years', () => {
    const date = parseDate('-500');
    expect(date.getFullYear()).toBe(-500);
  });

  it('throws error for empty string', () => {
    expect(() => parseDate('')).toThrow('Date string is required');
  });

  it('throws error for invalid date string', () => {
    expect(() => parseDate('invalid-date')).toThrow('Unable to parse date');
  });
});

// These assertions are timezone-sensitive by design. They pass under UTC and
// must also pass at negative offsets, where the original defect appeared. CI
// runs a TZ=America/Chicago leg specifically to exercise them.
describe('parseDate - timezone handling', () => {
  it('parses a date-only string as local midnight, not UTC midnight', () => {
    const date = parseDate('2023-01-15');
    expect(date.getFullYear()).toBe(2023);
    expect(date.getMonth()).toBe(0);
    expect(date.getDate()).toBe(15);
    expect(date.getHours()).toBe(0);
    expect(date.getMinutes()).toBe(0);
    expect(date.getSeconds()).toBe(0);
  });

  it('keeps the written calendar day when formatted back (regression)', () => {
    // The defect: "2023-01-15" parsed as UTC midnight, then read with local
    // getters, formatted as "Jan 14, 2023" anywhere west of Greenwich.
    expect(formatDate(parseDate('2023-01-15'), 'MMM d, yyyy')).toBe('Jan 15, 2023');
  });

  it('parses a year-month string as local midnight on the first', () => {
    const date = parseDate('2023-06');
    expect(date.getFullYear()).toBe(2023);
    expect(date.getMonth()).toBe(5);
    expect(date.getDate()).toBe(1);
    expect(date.getHours()).toBe(0);
  });

  it('treats a datetime without an offset as local time', () => {
    const date = parseDate('2023-06-20T14:30:00');
    expect(date.getDate()).toBe(20);
    expect(date.getHours()).toBe(14);
    expect(date.getMinutes()).toBe(30);
  });

  it('honors an explicit Z suffix as an absolute instant', () => {
    expect(parseDate('2023-06-20T14:30:00Z').getTime()).toBe(
      Date.UTC(2023, 5, 20, 14, 30)
    );
  });

  it('honors an explicit numeric offset as an absolute instant', () => {
    expect(parseDate('2023-06-20T14:30:00+02:00').getTime()).toBe(
      Date.UTC(2023, 5, 20, 12, 30)
    );
  });

  it('does not remap years below 100 into the 1900s', () => {
    expect(parseDate('0050-03-04').getFullYear()).toBe(50);
  });

  it('preserves native ISO bounds - month and day out of range still throw', () => {
    expect(() => parseDate('2023-13-01')).toThrow('Unable to parse date');
    expect(() => parseDate('2023-00-01')).toThrow('Unable to parse date');
    expect(() => parseDate('2023-01-00')).toThrow('Unable to parse date');
    expect(() => parseDate('2023-01-32')).toThrow('Unable to parse date');
  });

  it('preserves native rollover inside those bounds', () => {
    // "2023-02-29" is not a real date; the native parser rolled it to
    // March 1 and this must keep doing the same, just in local time.
    const date = parseDate('2023-02-29');
    expect(date.getMonth()).toBe(2);
    expect(date.getDate()).toBe(1);
  });

  it('parses a real leap day without rolling over', () => {
    const date = parseDate('2024-02-29');
    expect(date.getMonth()).toBe(1);
    expect(date.getDate()).toBe(29);
  });
});

describe('formatDate', () => {
  const testDate = new Date(2023, 5, 15, 14, 30); // June 15, 2023 14:30

  it('formats year only', () => {
    expect(formatDate(testDate, 'yyyy')).toBe('2023');
  });

  it('formats short month', () => {
    expect(formatDate(testDate, 'MMM')).toBe('Jun');
  });

  it('formats full month', () => {
    expect(formatDate(testDate, 'MMMM')).toBe('June');
  });

  it('formats month and year', () => {
    expect(formatDate(testDate, 'MMM yyyy')).toBe('Jun 2023');
  });

  it('formats month and day', () => {
    expect(formatDate(testDate, 'MMM d')).toBe('Jun 15');
  });

  it('formats full date', () => {
    expect(formatDate(testDate, 'MMM d, yyyy')).toBe('Jun 15, 2023');
  });

  it('formats 24-hour time', () => {
    expect(formatDate(testDate, 'HH:mm')).toBe('14:30');
  });

  it('formats 12-hour time', () => {
    expect(formatDate(testDate, 'h:mm a')).toBe('2:30 pm');
  });
});

describe('dateToPixel', () => {
  it('converts date to pixel position', () => {
    const origin = new Date('2023-01-01');
    const date = new Date('2023-01-02'); // 1 day later
    const pixelsPerMs = 100 / TIME_UNITS.day; // 100 pixels per day

    const pixel = dateToPixel(date, origin, pixelsPerMs);
    expect(pixel).toBeCloseTo(100);
  });

  it('returns 0 for same date as origin', () => {
    const date = new Date('2023-01-01');
    const pixelsPerMs = 100 / TIME_UNITS.day;

    const pixel = dateToPixel(date, date, pixelsPerMs);
    expect(pixel).toBe(0);
  });

  it('returns negative for date before origin', () => {
    const origin = new Date('2023-01-02');
    const date = new Date('2023-01-01');
    const pixelsPerMs = 100 / TIME_UNITS.day;

    const pixel = dateToPixel(date, origin, pixelsPerMs);
    expect(pixel).toBeCloseTo(-100);
  });
});

describe('pixelToDate', () => {
  it('converts pixel position to date', () => {
    const origin = new Date('2023-01-01');
    const pixelsPerMs = 100 / TIME_UNITS.day;

    const date = pixelToDate(100, origin, pixelsPerMs);
    expect(date.getTime()).toBeCloseTo(new Date('2023-01-02').getTime(), -3);
  });

  it('returns origin for pixel 0', () => {
    const origin = new Date('2023-01-01');
    const pixelsPerMs = 100 / TIME_UNITS.day;

    const date = pixelToDate(0, origin, pixelsPerMs);
    expect(date.getTime()).toBe(origin.getTime());
  });
});

describe('getVisibleRange', () => {
  it('calculates visible range from center date', () => {
    const centerDate = new Date('2023-06-15');
    const viewportWidth = 1000;
    const pixelsPerMs = 100 / TIME_UNITS.day; // 100 pixels per day

    const range = getVisibleRange(centerDate, viewportWidth, pixelsPerMs);

    // 1000px viewport / 2 = 500px each side
    // 500px / (100px/day) = 5 days each side
    const expectedStart = new Date('2023-06-10');
    const expectedEnd = new Date('2023-06-20');

    expect(range.start.getTime()).toBeCloseTo(expectedStart.getTime(), -3);
    expect(range.end.getTime()).toBeCloseTo(expectedEnd.getTime(), -3);
  });
});

describe('getMedianDate', () => {
  it('returns median date for odd number of events', () => {
    const events = [
      { start: '2023-01-01' },
      { start: '2023-06-15' },
      { start: '2023-12-31' },
    ];

    const median = getMedianDate(events);
    // Expectation goes through parseDate, not new Date(). getMedianDate
    // parses its inputs with parseDate, so a native-constructor expectation
    // encodes UTC midnight and diverges from the result by the local offset
    // everywhere except UTC.
    expect(median.getTime()).toBeCloseTo(parseDate('2023-06-15').getTime(), -3);
  });

  it('returns average of middle dates for even number of events', () => {
    const events = [
      { start: '2023-01-01' },
      { start: '2023-03-01' },
      { start: '2023-09-01' },
      { start: '2023-12-31' },
    ];

    const median = getMedianDate(events);
    // Average of March 1 and September 1, parsed the same way getMedianDate
    // parses them so the expectation holds in every timezone.
    const mar1 = parseDate('2023-03-01').getTime();
    const sep1 = parseDate('2023-09-01').getTime();
    const expectedMedian = (mar1 + sep1) / 2;

    expect(median.getTime()).toBeCloseTo(expectedMedian, -3);
  });

  it('returns current date for empty events array', () => {
    const before = Date.now();
    const median = getMedianDate([]);
    const after = Date.now();

    expect(median.getTime()).toBeGreaterThanOrEqual(before);
    expect(median.getTime()).toBeLessThanOrEqual(after);
  });
});

describe('TIME_UNITS', () => {
  it('has correct millisecond values', () => {
    expect(TIME_UNITS.second).toBe(1000);
    expect(TIME_UNITS.minute).toBe(60 * 1000);
    expect(TIME_UNITS.hour).toBe(60 * 60 * 1000);
    expect(TIME_UNITS.day).toBe(24 * 60 * 60 * 1000);
    expect(TIME_UNITS.week).toBe(7 * 24 * 60 * 60 * 1000);
  });
});
