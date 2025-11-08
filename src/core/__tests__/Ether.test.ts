/**
 * Tests for Ether time-to-pixel conversion
 */

import { describe, it, expect } from 'vitest';
import { LinearEther, LogarithmicEther, HotZoneEther, type HotZone } from '../Ether';

describe('Ether', () => {
  describe('LinearEther', () => {
    describe('constructor', () => {
      it('should create with valid parameters', () => {
        const ether = new LinearEther('DAY', 100);
        expect(ether.getIntervalUnit()).toBe('DAY');
        expect(ether.getIntervalPixels()).toBe(100);
      });

      it('should throw error for zero intervalPixels', () => {
        expect(() => new LinearEther('DAY', 0)).toThrow('intervalPixels must be positive');
      });

      it('should throw error for negative intervalPixels', () => {
        expect(() => new LinearEther('DAY', -100)).toThrow('intervalPixels must be positive');
      });

      it('should accept all interval units', () => {
        const units = [
          'MILLISECOND',
          'SECOND',
          'MINUTE',
          'HOUR',
          'DAY',
          'WEEK',
          'MONTH',
          'YEAR',
          'DECADE',
          'CENTURY',
          'MILLENNIUM',
        ] as const;

        units.forEach((unit) => {
          const ether = new LinearEther(unit, 100);
          expect(ether.getIntervalUnit()).toBe(unit);
        });
      });
    });

    describe('dateToPixel', () => {
      it('should return 0 for origin date', () => {
        const ether = new LinearEther('DAY', 100);
        const origin = new Date('2006-06-28');
        const pixel = ether.dateToPixel(origin, origin);
        expect(pixel).toBe(0);
      });

      it('should return positive pixels for future dates', () => {
        const ether = new LinearEther('DAY', 100);
        const origin = new Date('2006-06-28');
        const future = new Date('2006-06-29'); // 1 day later
        const pixel = ether.dateToPixel(future, origin);
        expect(pixel).toBe(100); // 1 day * 100 pixels/day
      });

      it('should return negative pixels for past dates', () => {
        const ether = new LinearEther('DAY', 100);
        const origin = new Date('2006-06-28');
        const past = new Date('2006-06-27'); // 1 day earlier
        const pixel = ether.dateToPixel(past, origin);
        expect(pixel).toBe(-100);
      });

      it('should scale correctly with different interval units', () => {
        const origin = new Date('2006-06-28T00:00:00Z');
        const target = new Date('2006-06-28T01:00:00Z'); // 1 hour later

        const hourEther = new LinearEther('HOUR', 100);
        expect(hourEther.dateToPixel(target, origin)).toBe(100); // 1 hour * 100 pixels/hour

        const minuteEther = new LinearEther('MINUTE', 10);
        expect(minuteEther.dateToPixel(target, origin)).toBe(600); // 60 minutes * 10 pixels/minute
      });

      it('should handle fractional intervals', () => {
        const ether = new LinearEther('DAY', 100);
        const origin = new Date('2006-06-28T00:00:00Z');
        const halfDay = new Date('2006-06-28T12:00:00Z');
        const pixel = ether.dateToPixel(halfDay, origin);
        expect(pixel).toBe(50); // 0.5 days * 100 pixels/day
      });

      it('should work with MILLISECOND unit', () => {
        const ether = new LinearEther('MILLISECOND', 1);
        const origin = new Date('2006-06-28T00:00:00.000Z');
        const target = new Date('2006-06-28T00:00:00.100Z');
        const pixel = ether.dateToPixel(target, origin);
        expect(pixel).toBe(100); // 100 milliseconds * 1 pixel/ms
      });

      it('should work with WEEK unit', () => {
        const ether = new LinearEther('WEEK', 200);
        const origin = new Date('2006-06-28');
        const target = new Date('2006-07-12'); // 2 weeks later
        const pixel = ether.dateToPixel(target, origin);
        expect(pixel).toBe(400); // 2 weeks * 200 pixels/week
      });

      it('should work with MONTH unit (approximate)', () => {
        const ether = new LinearEther('MONTH', 150);
        const origin = new Date('2006-06-01');
        const target = new Date('2006-09-01'); // ~3 months later
        const pixel = ether.dateToPixel(target, origin);
        // Approximate - months vary in length
        expect(pixel).toBeGreaterThan(440);
        expect(pixel).toBeLessThan(460);
      });

      it('should work with YEAR unit', () => {
        const ether = new LinearEther('YEAR', 365);
        const origin = new Date('2006-01-01');
        const target = new Date('2008-01-01'); // 2 years later
        const pixel = ether.dateToPixel(target, origin);
        expect(pixel).toBeCloseTo(730, 0); // ~2 years * 365 pixels/year
      });

      it('should work with DECADE unit', () => {
        const ether = new LinearEther('DECADE', 1000);
        const origin = new Date('2000-01-01');
        const target = new Date('2020-01-01'); // 2 decades later
        const pixel = ether.dateToPixel(target, origin);
        expect(pixel).toBeCloseTo(2000, 0);
      });

      it('should work with CENTURY unit', () => {
        const ether = new LinearEther('CENTURY', 5000);
        const origin = new Date('2000-01-01');
        const target = new Date('2100-01-01'); // 1 century later
        const pixel = ether.dateToPixel(target, origin);
        expect(pixel).toBeCloseTo(5000, 0);
      });

      it('should work with MILLENNIUM unit', () => {
        const ether = new LinearEther('MILLENNIUM', 10000);
        const origin = new Date('2000-01-01');
        const target = new Date('3000-01-01'); // 1 millennium later
        const pixel = ether.dateToPixel(target, origin);
        expect(pixel).toBeCloseTo(10000, 0);
      });
    });

    describe('pixelToDate', () => {
      it('should return origin for pixel 0', () => {
        const ether = new LinearEther('DAY', 100);
        const origin = new Date('2006-06-28');
        const date = ether.pixelToDate(0, origin);
        expect(date.getTime()).toBe(origin.getTime());
      });

      it('should convert positive pixels to future dates', () => {
        const ether = new LinearEther('DAY', 100);
        const origin = new Date('2006-06-28T00:00:00Z');
        const date = ether.pixelToDate(100, origin);
        expect(date.getUTCDate()).toBe(29); // 1 day later
      });

      it('should convert negative pixels to past dates', () => {
        const ether = new LinearEther('DAY', 100);
        const origin = new Date('2006-06-28T00:00:00Z');
        const date = ether.pixelToDate(-100, origin);
        expect(date.getUTCDate()).toBe(27); // 1 day earlier
      });

      it('should be inverse of dateToPixel', () => {
        const ether = new LinearEther('DAY', 100);
        const origin = new Date('2006-06-28');
        const testDate = new Date('2006-07-15');

        const pixel = ether.dateToPixel(testDate, origin);
        const reconstructedDate = ether.pixelToDate(pixel, origin);

        expect(reconstructedDate.getTime()).toBeCloseTo(testDate.getTime(), -2);
      });

      it('should handle fractional pixels', () => {
        const ether = new LinearEther('DAY', 100);
        const origin = new Date('2006-06-28T00:00:00Z');
        const date = ether.pixelToDate(50, origin); // 0.5 days = 12 hours
        expect(date.getUTCHours()).toBe(12);
      });
    });

    describe('getPixelWidth', () => {
      it('should return 0 for same start and end dates', () => {
        const ether = new LinearEther('DAY', 100);
        const date = new Date('2006-06-28');
        const width = ether.getPixelWidth(date, date);
        expect(width).toBe(0);
      });

      it('should calculate width for date range', () => {
        const ether = new LinearEther('DAY', 100);
        const start = new Date('2006-06-28');
        const end = new Date('2006-07-05'); // 7 days later
        const width = ether.getPixelWidth(start, end);
        expect(width).toBe(700); // 7 days * 100 pixels/day
      });

      it('should return positive width regardless of date order', () => {
        const ether = new LinearEther('DAY', 100);
        const start = new Date('2006-07-05');
        const end = new Date('2006-06-28');
        const width = ether.getPixelWidth(start, end);
        expect(width).toBe(-700); // Note: returns negative if end < start
      });

      it('should work with different interval units', () => {
        const start = new Date('2006-06-28T00:00:00Z');
        const end = new Date('2006-06-28T06:00:00Z'); // 6 hours

        const hourEther = new LinearEther('HOUR', 50);
        expect(hourEther.getPixelWidth(start, end)).toBe(300); // 6 hours * 50 pixels/hour
      });
    });
  });

  describe('LogarithmicEther', () => {
    describe('constructor', () => {
      it('should create with valid parameters', () => {
        const ether = new LogarithmicEther('YEAR', 100, 10);
        expect(ether.getIntervalUnit()).toBe('YEAR');
        expect(ether.getIntervalPixels()).toBe(100);
      });

      it('should use default base of 10', () => {
        const ether = new LogarithmicEther('YEAR', 100);
        expect(ether.getIntervalUnit()).toBe('YEAR');
      });

      it('should throw error for zero intervalPixels', () => {
        expect(() => new LogarithmicEther('YEAR', 0)).toThrow('intervalPixels must be positive');
      });

      it('should throw error for negative intervalPixels', () => {
        expect(() => new LogarithmicEther('YEAR', -100)).toThrow('intervalPixels must be positive');
      });

      it('should throw error for base <= 1', () => {
        expect(() => new LogarithmicEther('YEAR', 100, 1)).toThrow(
          'Logarithmic base must be greater than 1'
        );
        expect(() => new LogarithmicEther('YEAR', 100, 0)).toThrow(
          'Logarithmic base must be greater than 1'
        );
        expect(() => new LogarithmicEther('YEAR', 100, -5)).toThrow(
          'Logarithmic base must be greater than 1'
        );
      });

      it('should accept different bases', () => {
        const ether2 = new LogarithmicEther('YEAR', 100, 2);
        const ether10 = new LogarithmicEther('YEAR', 100, 10);
        const etherE = new LogarithmicEther('YEAR', 100, Math.E);

        expect(ether2.getIntervalPixels()).toBe(100);
        expect(ether10.getIntervalPixels()).toBe(100);
        expect(etherE.getIntervalPixels()).toBe(100);
      });
    });

    describe('dateToPixel', () => {
      it('should return 0 for origin date', () => {
        const ether = new LogarithmicEther('YEAR', 100, 10);
        const origin = new Date('2000-01-01');
        const pixel = ether.dateToPixel(origin, origin);
        expect(pixel).toBe(0);
      });

      it('should return positive pixels for future dates', () => {
        const ether = new LogarithmicEther('YEAR', 100, 10);
        const origin = new Date('2000-01-01');
        const future = new Date('2001-01-01');
        const pixel = ether.dateToPixel(future, origin);
        expect(pixel).toBeGreaterThan(0);
      });

      it('should return negative pixels for past dates', () => {
        const ether = new LogarithmicEther('YEAR', 100, 10);
        const origin = new Date('2000-01-01');
        const past = new Date('1999-01-01');
        const pixel = ether.dateToPixel(past, origin);
        expect(pixel).toBeLessThan(0);
      });

      it('should compress distant dates more than near dates', () => {
        const ether = new LogarithmicEther('YEAR', 100, 10);
        const origin = new Date('2000-01-01');

        // 1 year away
        const year1 = new Date('2001-01-01');
        const pixel1 = ether.dateToPixel(year1, origin);

        // 10 years away
        const year10 = new Date('2010-01-01');
        const pixel10 = ether.dateToPixel(year10, origin);

        // Log scale means 10x time should be < 10x pixels
        expect(pixel10).toBeLessThan(pixel1 * 10);
      });

      it('should preserve sign', () => {
        const ether = new LogarithmicEther('YEAR', 100, 10);
        const origin = new Date('2000-01-01');
        const future = new Date('2010-01-01');
        const past = new Date('1990-01-01');

        const futurePixel = ether.dateToPixel(future, origin);
        const pastPixel = ether.dateToPixel(past, origin);

        expect(futurePixel).toBeGreaterThan(0);
        expect(pastPixel).toBeLessThan(0);
      });
    });

    describe('pixelToDate', () => {
      it('should return origin for pixel 0', () => {
        const ether = new LogarithmicEther('YEAR', 100, 10);
        const origin = new Date('2000-01-01');
        const date = ether.pixelToDate(0, origin);
        expect(date.getTime()).toBe(origin.getTime());
      });

      it('should be inverse of dateToPixel', () => {
        const ether = new LogarithmicEther('YEAR', 100, 10);
        const origin = new Date('2000-01-01');
        const testDate = new Date('2050-01-01');

        const pixel = ether.dateToPixel(testDate, origin);
        const reconstructedDate = ether.pixelToDate(pixel, origin);

        // Allow some rounding error
        expect(reconstructedDate.getTime()).toBeCloseTo(testDate.getTime(), -5);
      });
    });

    describe('getPixelWidth', () => {
      it('should return 0 for same dates', () => {
        const ether = new LogarithmicEther('YEAR', 100, 10);
        const date = new Date('2000-01-01');
        const width = ether.getPixelWidth(date, date);
        expect(width).toBe(0);
      });

      it('should return positive width for date ranges', () => {
        const ether = new LogarithmicEther('YEAR', 100, 10);
        const start = new Date('2000-01-01');
        const end = new Date('2010-01-01');
        const width = ether.getPixelWidth(start, end);
        expect(width).toBeGreaterThan(0);
      });
    });
  });

  describe('HotZoneEther', () => {
    describe('constructor', () => {
      it('should create with no hot zones', () => {
        const ether = new HotZoneEther('DAY', 100, []);
        expect(ether.getIntervalUnit()).toBe('DAY');
        expect(ether.getIntervalPixels()).toBe(100);
        expect(ether.getHotZones()).toHaveLength(0);
      });

      it('should create with hot zones', () => {
        const zones: HotZone[] = [
          {
            startDate: new Date('2006-06-01'),
            endDate: new Date('2006-08-31'),
            magnify: 3,
          },
        ];
        const ether = new HotZoneEther('DAY', 100, zones);
        expect(ether.getHotZones()).toHaveLength(1);
      });

      it('should sort hot zones by start date', () => {
        const zones: HotZone[] = [
          {
            startDate: new Date('2006-09-01'),
            endDate: new Date('2006-12-31'),
            magnify: 2,
          },
          {
            startDate: new Date('2006-06-01'),
            endDate: new Date('2006-08-31'),
            magnify: 3,
          },
        ];
        const ether = new HotZoneEther('DAY', 100, zones);
        const sorted = ether.getHotZones();

        expect(sorted[0].startDate.getTime()).toBeLessThan(sorted[1].startDate.getTime());
      });

      it('should not mutate original hot zones array', () => {
        const zones: HotZone[] = [
          {
            startDate: new Date('2006-06-01'),
            endDate: new Date('2006-08-31'),
            magnify: 3,
          },
        ];
        const ether = new HotZoneEther('DAY', 100, zones);
        const retrieved = ether.getHotZones();

        retrieved.push({
          startDate: new Date('2007-01-01'),
          endDate: new Date('2007-12-31'),
          magnify: 2,
        });

        expect(ether.getHotZones()).toHaveLength(1); // Original unchanged
      });
    });

    describe('dateToPixel with no hot zones', () => {
      it('should behave like LinearEther with no hot zones', () => {
        const linear = new LinearEther('DAY', 100);
        const hotZone = new HotZoneEther('DAY', 100, []);
        const origin = new Date('2006-06-28');
        const target = new Date('2006-07-15');

        const linearPixel = linear.dateToPixel(target, origin);
        const hotZonePixel = hotZone.dateToPixel(target, origin);

        expect(hotZonePixel).toBe(linearPixel);
      });
    });

    describe('dateToPixel with hot zones', () => {
      it('should magnify dates inside hot zone', () => {
        const zones: HotZone[] = [
          {
            startDate: new Date('2006-06-01'),
            endDate: new Date('2006-08-31'),
            magnify: 2, // 2x magnification
          },
        ];

        const linear = new LinearEther('DAY', 100);
        const hotZone = new HotZoneEther('DAY', 100, zones);
        const origin = new Date('2006-05-01');

        // Date inside hot zone
        const insideZone = new Date('2006-07-15');
        const linearPixel = linear.dateToPixel(insideZone, origin);
        const hotZonePixel = hotZone.dateToPixel(insideZone, origin);

        // Hot zone pixel should be larger due to magnification
        expect(hotZonePixel).toBeGreaterThan(linearPixel);
      });

      it('should adjust dates after hot zone', () => {
        const zones: HotZone[] = [
          {
            startDate: new Date('2006-06-01'),
            endDate: new Date('2006-08-31'),
            magnify: 2,
          },
        ];

        const linear = new LinearEther('DAY', 100);
        const hotZone = new HotZoneEther('DAY', 100, zones);
        const origin = new Date('2006-05-01');

        // Date after hot zone
        const afterZone = new Date('2006-10-01');
        const linearPixel = linear.dateToPixel(afterZone, origin);
        const hotZonePixel = hotZone.dateToPixel(afterZone, origin);

        // Should be shifted right due to hot zone expansion
        expect(hotZonePixel).toBeGreaterThan(linearPixel);
      });

      it('should not affect dates before hot zone', () => {
        const zones: HotZone[] = [
          {
            startDate: new Date('2006-06-01'),
            endDate: new Date('2006-08-31'),
            magnify: 2,
          },
        ];

        const linear = new LinearEther('DAY', 100);
        const hotZone = new HotZoneEther('DAY', 100, zones);
        const origin = new Date('2006-10-01'); // Origin after zone

        // Date before hot zone
        const beforeZone = new Date('2006-05-01');
        const linearPixel = linear.dateToPixel(beforeZone, origin);
        const hotZonePixel = hotZone.dateToPixel(beforeZone, origin);

        // Should be same as linear (no adjustment needed)
        expect(hotZonePixel).toBeCloseTo(linearPixel, 0);
      });

      it('should handle multiple hot zones', () => {
        const zones: HotZone[] = [
          {
            startDate: new Date('2006-06-01'),
            endDate: new Date('2006-06-30'),
            magnify: 2,
          },
          {
            startDate: new Date('2006-08-01'),
            endDate: new Date('2006-08-31'),
            magnify: 3,
          },
        ];

        const hotZone = new HotZoneEther('DAY', 100, zones);
        const origin = new Date('2006-05-01');

        // Date in first zone
        const inZone1 = new Date('2006-06-15');
        const pixel1 = hotZone.dateToPixel(inZone1, origin);

        // Date in second zone
        const inZone2 = new Date('2006-08-15');
        const pixel2 = hotZone.dateToPixel(inZone2, origin);

        expect(pixel1).toBeGreaterThan(0);
        expect(pixel2).toBeGreaterThan(pixel1);
      });
    });

    describe('getPixelWidth', () => {
      it('should account for hot zones in width calculation', () => {
        const zones: HotZone[] = [
          {
            startDate: new Date('2006-06-01'),
            endDate: new Date('2006-08-31'),
            magnify: 2,
          },
        ];

        const linear = new LinearEther('DAY', 100);
        const hotZone = new HotZoneEther('DAY', 100, zones);

        // Range spanning hot zone
        const start = new Date('2006-05-01');
        const end = new Date('2006-10-01');

        const linearWidth = linear.getPixelWidth(start, end);
        const hotZoneWidth = hotZone.getPixelWidth(start, end);

        // Hot zone width should be larger
        expect(hotZoneWidth).toBeGreaterThan(linearWidth);
      });
    });
  });
});
