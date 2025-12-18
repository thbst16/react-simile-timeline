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
    expect(median.getTime()).toBeCloseTo(new Date('2023-06-15').getTime(), -3);
  });

  it('returns average of middle dates for even number of events', () => {
    const events = [
      { start: '2023-01-01' },
      { start: '2023-03-01' },
      { start: '2023-09-01' },
      { start: '2023-12-31' },
    ];

    const median = getMedianDate(events);
    // Average of March 1 and September 1
    const mar1 = new Date('2023-03-01').getTime();
    const sep1 = new Date('2023-09-01').getTime();
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
