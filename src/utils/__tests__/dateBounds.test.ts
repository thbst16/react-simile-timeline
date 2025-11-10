/**
 * Date Bounds Utilities Tests
 *
 * Sprint 7: Polish & Bug Fixes
 */

import { describe, it, expect } from 'vitest';
import {
  calculateEventDateBounds,
  clampDateToBounds,
  isAtBoundary,
  getDefaultCenterDate,
  calculateBoundsWithViewportPadding,
  type DateBounds,
} from '../dateBounds';
import type { TimelineEvent } from '../../types/events';

describe('dateBounds', () => {
  describe('calculateEventDateBounds', () => {
    it('calculates bounds from multiple events', () => {
      const events: TimelineEvent[] = [
        {
          id: '1',
          start: '2020-01-01T00:00:00Z',
          title: 'Event 1',
        },
        {
          id: '2',
          start: '2020-06-01T00:00:00Z',
          title: 'Event 2',
        },
        {
          id: '3',
          start: '2020-12-31T00:00:00Z',
          end: '2021-01-15T00:00:00Z',
          title: 'Event 3',
          isDuration: true,
        },
      ];

      const bounds = calculateEventDateBounds(events);

      expect(bounds.hasEvents).toBe(true);
      expect(bounds.minDate.getTime()).toBe(new Date('2020-01-01T00:00:00Z').getTime());
      expect(bounds.maxDate.getTime()).toBe(new Date('2021-01-15T00:00:00Z').getTime());
    });

    it('includes padding when specified', () => {
      const events: TimelineEvent[] = [
        {
          id: '1',
          start: '2020-01-01T00:00:00Z',
          title: 'Event 1',
        },
      ];

      const padding = 10 * 24 * 60 * 60 * 1000; // 10 days
      const bounds = calculateEventDateBounds(events, padding);

      const expectedMin = new Date('2020-01-01T00:00:00Z').getTime() - padding;
      const expectedMax = new Date('2020-01-01T00:00:00Z').getTime() + padding;

      expect(bounds.minDate.getTime()).toBe(expectedMin);
      expect(bounds.maxDate.getTime()).toBe(expectedMax);
    });

    it('handles empty event array', () => {
      const bounds = calculateEventDateBounds([]);

      expect(bounds.hasEvents).toBe(false);
      expect(bounds.minDate).toBeInstanceOf(Date);
      expect(bounds.maxDate).toBeInstanceOf(Date);
      expect(bounds.maxDate.getTime()).toBeGreaterThan(bounds.minDate.getTime());
    });

    it('handles events with invalid dates gracefully', () => {
      const events: TimelineEvent[] = [
        {
          id: '1',
          start: 'invalid-date',
          title: 'Bad Event',
        },
        {
          id: '2',
          start: '2020-01-01T00:00:00Z',
          title: 'Good Event',
        },
      ];

      const bounds = calculateEventDateBounds(events);

      expect(bounds.hasEvents).toBe(true);
      expect(bounds.minDate.getTime()).toBe(new Date('2020-01-01T00:00:00Z').getTime());
    });
  });

  describe('clampDateToBounds', () => {
    const bounds: DateBounds = {
      minDate: new Date('2020-01-01T00:00:00Z'),
      maxDate: new Date('2020-12-31T00:00:00Z'),
      hasEvents: true,
    };

    it('returns date unchanged if within bounds', () => {
      const date = new Date('2020-06-15T00:00:00Z');
      const clamped = clampDateToBounds(date, bounds);

      expect(clamped.getTime()).toBe(date.getTime());
    });

    it('clamps to min when date is before bounds', () => {
      const date = new Date('2019-01-01T00:00:00Z');
      const clamped = clampDateToBounds(date, bounds);

      expect(clamped.getTime()).toBe(bounds.minDate.getTime());
    });

    it('clamps to max when date is after bounds', () => {
      const date = new Date('2021-12-31T00:00:00Z');
      const clamped = clampDateToBounds(date, bounds);

      expect(clamped.getTime()).toBe(bounds.maxDate.getTime());
    });
  });

  describe('isAtBoundary', () => {
    const bounds: DateBounds = {
      minDate: new Date('2020-01-01T00:00:00Z'),
      maxDate: new Date('2020-12-31T00:00:00Z'),
      hasEvents: true,
    };

    it('detects when at minimum boundary', () => {
      const date = new Date('2020-01-01T00:00:00Z');
      const result = isAtBoundary(date, bounds);

      expect(result.atMin).toBe(true);
      expect(result.atMax).toBe(false);
      expect(result.nearMin).toBe(true);
    });

    it('detects when at maximum boundary', () => {
      const date = new Date('2020-12-31T00:00:00Z');
      const result = isAtBoundary(date, bounds);

      expect(result.atMin).toBe(false);
      expect(result.atMax).toBe(true);
      expect(result.nearMax).toBe(true);
    });

    it('detects when near minimum boundary', () => {
      const date = new Date('2020-01-02T00:00:00Z'); // 1 day after min
      const threshold = 2 * 24 * 60 * 60 * 1000; // 2 days
      const result = isAtBoundary(date, bounds, threshold);

      expect(result.atMin).toBe(false);
      expect(result.nearMin).toBe(true);
    });

    it('returns false when in middle of bounds', () => {
      const date = new Date('2020-06-15T00:00:00Z');
      const result = isAtBoundary(date, bounds);

      expect(result.atMin).toBe(false);
      expect(result.atMax).toBe(false);
      expect(result.nearMin).toBe(false);
      expect(result.nearMax).toBe(false);
    });
  });

  describe('getDefaultCenterDate', () => {
    it('returns midpoint of bounds', () => {
      const bounds: DateBounds = {
        minDate: new Date('2020-01-01T00:00:00Z'),
        maxDate: new Date('2020-12-31T00:00:00Z'),
        hasEvents: true,
      };

      const center = getDefaultCenterDate(bounds);
      const expectedMidpoint = (bounds.minDate.getTime() + bounds.maxDate.getTime()) / 2;

      expect(center.getTime()).toBe(expectedMidpoint);
    });
  });

  describe('calculateBoundsWithViewportPadding', () => {
    it('adds viewport-based padding to bounds', () => {
      const events: TimelineEvent[] = [
        {
          id: '1',
          start: '2020-01-01T00:00:00Z',
          title: 'Event 1',
        },
      ];

      const viewportWidthMs = 60 * 24 * 60 * 60 * 1000; // 60 days
      const bounds = calculateBoundsWithViewportPadding(events, viewportWidthMs);

      // Should have padding = viewportWidthMs / 2 = 30 days
      const expectedPadding = viewportWidthMs / 2;
      const eventTime = new Date('2020-01-01T00:00:00Z').getTime();

      expect(bounds.minDate.getTime()).toBe(eventTime - expectedPadding);
      expect(bounds.maxDate.getTime()).toBe(eventTime + expectedPadding);
    });
  });
});
