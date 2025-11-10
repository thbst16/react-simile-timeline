/**
 * Tests for validation utilities
 */

import { describe, it, expect } from 'vitest';
import { validateEvent, validateDataset, formatValidationErrors } from '../validation';
import type { TimelineEvent, EventData } from '../../types/events';

describe('validation', () => {
  describe('validateEvent', () => {
    it('should validate a valid event', () => {
      const event: TimelineEvent = {
        start: '2020-01-15',
        title: 'Test Event',
        description: 'A test event',
      };

      const result = validateEvent(event);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('should validate a valid duration event', () => {
      const event: TimelineEvent = {
        start: '2020-01-15',
        end: '2020-02-15',
        title: 'Duration Event',
        isDuration: true,
      };

      const result = validateEvent(event);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should require start date', () => {
      const event = {
        title: 'No Start Date',
      } as TimelineEvent;

      const result = validateEvent(event);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Event "No Start Date" is missing required \'start\' date');
    });

    it('should require title', () => {
      const event = {
        start: '2020-01-15',
      } as TimelineEvent;

      const result = validateEvent(event, 0);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Event at index 0 is missing required 'title'");
    });

    it('should validate start must be a string', () => {
      const event = {
        start: 12345 as any,
        title: 'Invalid Start',
      } as TimelineEvent;

      const result = validateEvent(event);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'Event "Invalid Start" has invalid \'start\' date (must be a string)'
      );
    });

    it('should validate title must be a string', () => {
      const event = {
        start: '2020-01-15',
        title: 123 as any,
      } as TimelineEvent;

      const result = validateEvent(event);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("invalid 'title' (must be a string)"))).toBe(
        true
      );
    });

    it('should require end date for duration events', () => {
      const event: TimelineEvent = {
        start: '2020-01-15',
        title: 'Duration Without End',
        isDuration: true,
      };

      const result = validateEvent(event);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Event \"Duration Without End\" is marked as duration event but missing 'end' date or 'durationEvent'"
      );
    });

    it('should validate end date is after start date', () => {
      const event: TimelineEvent = {
        start: '2020-02-15',
        end: '2020-01-15', // Before start
        title: 'Invalid Dates',
        isDuration: true,
      };

      const result = validateEvent(event);

      expect(result.valid).toBe(false);
      expect(
        result.errors.some((e) => e.includes("has 'end' date") && e.includes("before 'start' date"))
      ).toBe(true);
    });

    it('should accept durationEvent as alternative to end date', () => {
      const event: TimelineEvent = {
        start: '2020-01-15',
        title: 'Duration with milliseconds',
        isDuration: true,
        durationEvent: 86400000, // 1 day in ms
      };

      const result = validateEvent(event);

      expect(result.valid).toBe(true);
    });

    it('should warn about invalid color format', () => {
      const event: TimelineEvent = {
        start: '2020-01-15',
        title: 'Event with bad color',
        color: 'not-a-valid-color',
      };

      const result = validateEvent(event);

      expect(result.valid).toBe(true); // Warnings don't invalidate
      expect(result.warnings).toContain(
        'Event "Event with bad color" has potentially invalid color \'not-a-valid-color\' (should be hex, rgb, or named color)'
      );
    });

    it('should accept hex colors', () => {
      const event1: TimelineEvent = {
        start: '2020-01-15',
        title: 'Event',
        color: '#FF0000',
      };

      const event2: TimelineEvent = {
        start: '2020-01-15',
        title: 'Event',
        color: '#F00',
      };

      expect(validateEvent(event1).warnings).toHaveLength(0);
      expect(validateEvent(event2).warnings).toHaveLength(0);
    });

    it('should accept rgb colors', () => {
      const event: TimelineEvent = {
        start: '2020-01-15',
        title: 'Event',
        color: 'rgb(255, 0, 0)',
      };

      const result = validateEvent(event);
      expect(result.warnings).toHaveLength(0);
    });

    it('should accept rgba colors', () => {
      const event: TimelineEvent = {
        start: '2020-01-15',
        title: 'Event',
        color: 'rgba(255, 0, 0, 0.5)',
      };

      const result = validateEvent(event);
      expect(result.warnings).toHaveLength(0);
    });

    it('should accept hsl colors', () => {
      const event: TimelineEvent = {
        start: '2020-01-15',
        title: 'Event',
        color: 'hsl(0, 100%, 50%)',
      };

      const result = validateEvent(event);
      expect(result.warnings).toHaveLength(0);
    });

    it('should accept named colors', () => {
      const colors = ['red', 'blue', 'green', 'black', 'white', 'navy', 'teal'];

      colors.forEach((color) => {
        const event: TimelineEvent = {
          start: '2020-01-15',
          title: 'Event',
          color,
        };
        const result = validateEvent(event);
        expect(result.warnings).toHaveLength(0);
      });
    });

    it('should warn about invalid URLs', () => {
      const event: TimelineEvent = {
        start: '2020-01-15',
        title: 'Event',
        link: 'not a url',
        image: 'also not url',
        icon: 'bad icon',
      };

      const result = validateEvent(event);

      expect(result.warnings).toHaveLength(3);
      expect(result.warnings.some((w) => w.includes('invalid link URL'))).toBe(true);
      expect(result.warnings.some((w) => w.includes('invalid image URL'))).toBe(true);
      expect(result.warnings.some((w) => w.includes('invalid icon URL'))).toBe(true);
    });

    it('should accept valid URL formats', () => {
      const event: TimelineEvent = {
        start: '2020-01-15',
        title: 'Event',
        link: 'https://example.com',
        image: '/path/to/image.jpg',
        icon: '../icons/icon.png',
      };

      const result = validateEvent(event);
      expect(result.warnings).toHaveLength(0);
    });

    it('should accept data URLs', () => {
      const event: TimelineEvent = {
        start: '2020-01-15',
        title: 'Event',
        image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg',
      };

      const result = validateEvent(event);
      expect(result.warnings).toHaveLength(0);
    });

    it('should accept filename URLs', () => {
      const event: TimelineEvent = {
        start: '2020-01-15',
        title: 'Event',
        image: 'image.jpg',
      };

      const result = validateEvent(event);
      expect(result.warnings).toHaveLength(0);
    });

    it('should validate track number', () => {
      const event: TimelineEvent = {
        start: '2020-01-15',
        title: 'Event',
        track: -1,
      };

      const result = validateEvent(event);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Event "Event" has invalid \'track\' number (must be >= 0)');
    });

    it('should accept valid track number', () => {
      const event: TimelineEvent = {
        start: '2020-01-15',
        title: 'Event',
        track: 0,
      };

      const result = validateEvent(event);
      expect(result.valid).toBe(true);
    });

    it('should include event in result', () => {
      const event: TimelineEvent = {
        start: '2020-01-15',
        title: 'Event',
      };

      const result = validateEvent(event);
      expect(result.event).toBe(event);
    });

    it('should use index in error message when no title', () => {
      const event = {
        start: '2020-01-15',
      } as TimelineEvent;

      const result = validateEvent(event, 5);

      expect(result.errors).toContain("Event at index 5 is missing required 'title'");
    });

    it('should use generic label when no title or index', () => {
      const event = {
        start: '2020-01-15',
      } as TimelineEvent;

      const result = validateEvent(event);

      expect(result.errors).toContain("Event is missing required 'title'");
    });
  });

  describe('validateDataset', () => {
    it('should validate a valid dataset', () => {
      const data: EventData = {
        events: [
          {
            start: '2020-01-15',
            title: 'Event 1',
          },
          {
            start: '2020-02-15',
            title: 'Event 2',
          },
        ],
      };

      const result = validateDataset(data);

      expect(result.valid).toBe(true);
      expect(result.totalEvents).toBe(2);
      expect(result.validEvents).toBe(2);
      expect(result.invalidEvents).toBe(0);
      expect(result.datasetErrors).toHaveLength(0);
    });

    it('should require events array', () => {
      const data = {} as EventData;

      const result = validateDataset(data);

      expect(result.valid).toBe(false);
      expect(result.datasetErrors).toContain('Dataset is missing required "events" array');
      expect(result.totalEvents).toBe(0);
    });

    it('should validate events must be an array', () => {
      const data = {
        events: 'not an array' as any,
      };

      const result = validateDataset(data);

      expect(result.valid).toBe(false);
      expect(result.datasetErrors).toContain('Dataset "events" must be an array');
    });

    it('should validate each event', () => {
      const data: EventData = {
        events: [
          {
            start: '2020-01-15',
            title: 'Valid Event',
          },
          {
            title: 'Missing Start',
          } as TimelineEvent,
          {
            start: '2020-03-15',
          } as TimelineEvent,
        ],
      };

      const result = validateDataset(data);

      expect(result.valid).toBe(false);
      expect(result.totalEvents).toBe(3);
      expect(result.validEvents).toBe(1);
      expect(result.invalidEvents).toBe(2);
      expect(result.results).toHaveLength(3);
    });

    it('should detect duplicate IDs', () => {
      const data: EventData = {
        events: [
          {
            id: 'event1',
            start: '2020-01-15',
            title: 'Event 1',
          },
          {
            id: 'event2',
            start: '2020-02-15',
            title: 'Event 2',
          },
          {
            id: 'event1', // Duplicate
            start: '2020-03-15',
            title: 'Event 3',
          },
        ],
      };

      const result = validateDataset(data);

      expect(result.valid).toBe(false);
      expect(result.datasetErrors).toContain('Dataset contains duplicate event IDs: event1');
    });

    it('should handle empty events array', () => {
      const data: EventData = {
        events: [],
      };

      const result = validateDataset(data);

      expect(result.valid).toBe(true);
      expect(result.totalEvents).toBe(0);
      expect(result.validEvents).toBe(0);
      expect(result.invalidEvents).toBe(0);
    });

    it('should allow events without IDs', () => {
      const data: EventData = {
        events: [
          {
            start: '2020-01-15',
            title: 'Event 1',
          },
          {
            start: '2020-02-15',
            title: 'Event 2',
          },
        ],
      };

      const result = validateDataset(data);

      expect(result.valid).toBe(true);
      expect(result.datasetErrors).toHaveLength(0);
    });

    it('should detect multiple duplicate IDs', () => {
      const data: EventData = {
        events: [
          { id: 'a', start: '2020-01-15', title: 'Event 1' },
          { id: 'a', start: '2020-02-15', title: 'Event 2' },
          { id: 'b', start: '2020-03-15', title: 'Event 3' },
          { id: 'b', start: '2020-04-15', title: 'Event 4' },
          { id: 'b', start: '2020-05-15', title: 'Event 5' },
        ],
      };

      const result = validateDataset(data);

      expect(result.valid).toBe(false);
      expect(result.datasetErrors.some((e) => e.includes('a') && e.includes('b'))).toBe(true);
    });
  });

  describe('formatValidationErrors', () => {
    it('should format dataset errors', () => {
      const result = validateDataset({} as EventData);
      const formatted = formatValidationErrors(result);

      expect(formatted).toContain('Dataset Errors:');
      expect(formatted).toContain('Dataset is missing required "events" array');
    });

    it('should format event errors', () => {
      const data: EventData = {
        events: [
          {
            title: 'Missing Start',
          } as TimelineEvent,
        ],
      };

      const result = validateDataset(data);
      const formatted = formatValidationErrors(result);

      expect(formatted).toContain('Found 1 invalid event(s)');
      expect(formatted).toContain('Event 1:');
      expect(formatted).toContain("missing required 'start' date");
    });

    it('should format warnings', () => {
      const data: EventData = {
        events: [
          {
            start: '2020-01-15',
            title: 'Event',
            color: 'not-valid',
          },
        ],
      };

      const result = validateDataset(data);
      const formatted = formatValidationErrors(result);

      // Warnings don't cause invalidity, so no errors formatted
      // The event is valid despite the warning
      expect(formatted).toBe('');
    });

    it('should return empty string for valid dataset', () => {
      const data: EventData = {
        events: [
          {
            start: '2020-01-15',
            title: 'Event',
          },
        ],
      };

      const result = validateDataset(data);
      const formatted = formatValidationErrors(result);

      expect(formatted).toBe('');
    });

    it('should format multiple errors', () => {
      const data: EventData = {
        events: [
          {} as TimelineEvent, // Missing both start and title
        ],
      };

      const result = validateDataset(data);
      const formatted = formatValidationErrors(result);

      expect(formatted).toContain('Event 1:');
      expect(formatted).toContain("missing required 'start' date");
      expect(formatted).toContain("missing required 'title'");
    });
  });
});
