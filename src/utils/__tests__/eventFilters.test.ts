/**
 * Tests for event filtering utilities
 */

import { describe, it, expect } from 'vitest';
import {
  searchEvents,
  filterByDateRange,
  filterByAttributes,
  filterEvents,
  getSearchMatches,
  sortByRelevance,
} from '../eventFilters';
import type { TimelineEvent } from '../../types/events';

describe('eventFilters', () => {
  const mockEvents: TimelineEvent[] = [
    {
      id: '1',
      start: '2020-01-15',
      title: 'First Event',
      description: 'This is a test event',
      image: '/image1.jpg',
    },
    {
      id: '2',
      start: '2020-06-20',
      end: '2020-07-10',
      title: 'Summer Festival',
      description: 'Annual summer music festival',
      isDuration: true,
      link: 'https://example.com',
    },
    {
      id: '3',
      start: '2020-12-25',
      title: 'Holiday Event',
      caption: 'Special holiday celebration',
      icon: '/icon.png',
    },
    {
      id: '4',
      start: '2021-03-10',
      title: 'Spring Conference',
      description: 'Tech conference in spring',
    },
  ];

  describe('searchEvents', () => {
    it('should return all events when query is empty', () => {
      const result = searchEvents(mockEvents, '');
      expect(result).toEqual(mockEvents);
    });

    it('should return all events when query is whitespace', () => {
      const result = searchEvents(mockEvents, '   ');
      expect(result).toEqual(mockEvents);
    });

    it('should search in title (case-insensitive)', () => {
      const result = searchEvents(mockEvents, 'event');
      // Matches: 'First Event' (title), 'test event' (description), 'Holiday Event' (title)
      expect(result).toHaveLength(2);
      expect(result.map((e) => e.id)).toContain('1'); // First Event + description
      expect(result.map((e) => e.id)).toContain('3'); // Holiday Event
    });

    it('should search in title with different case', () => {
      const result = searchEvents(mockEvents, 'FESTIVAL');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('should search in description', () => {
      const result = searchEvents(mockEvents, 'test');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('should search in caption', () => {
      const result = searchEvents(mockEvents, 'celebration');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('3');
    });

    it('should search in link', () => {
      const result = searchEvents(mockEvents, 'example.com');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('should return empty array when no matches', () => {
      const result = searchEvents(mockEvents, 'nonexistent');
      expect(result).toHaveLength(0);
    });

    it('should trim whitespace from query', () => {
      const result = searchEvents(mockEvents, '  festival  ');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('should handle events without optional fields', () => {
      const eventsWithoutFields: TimelineEvent[] = [
        {
          start: '2020-01-15',
          title: 'Minimal Event',
        },
      ];
      const result = searchEvents(eventsWithoutFields, 'Minimal');
      expect(result).toHaveLength(1);
    });
  });

  describe('filterByDateRange', () => {
    it('should return all events when no dates provided', () => {
      const result = filterByDateRange(mockEvents);
      expect(result).toEqual(mockEvents);
    });

    it('should filter by start date only', () => {
      const startDate = new Date('2020-06-01');
      const result = filterByDateRange(mockEvents, startDate);
      expect(result).toHaveLength(3); // Events from June onwards
      expect(result.map((e) => e.id)).toContain('2');
      expect(result.map((e) => e.id)).toContain('3');
      expect(result.map((e) => e.id)).toContain('4');
    });

    it('should filter by end date only', () => {
      const endDate = new Date('2020-06-01');
      const result = filterByDateRange(mockEvents, undefined, endDate);
      expect(result).toHaveLength(1); // Only January event
      expect(result[0].id).toBe('1');
    });

    it('should filter by date range', () => {
      const startDate = new Date('2020-06-01');
      const endDate = new Date('2020-12-31');
      const result = filterByDateRange(mockEvents, startDate, endDate);
      expect(result).toHaveLength(2); // Summer and Holiday events
      expect(result.map((e) => e.id)).toContain('2');
      expect(result.map((e) => e.id)).toContain('3');
    });

    it('should exclude events outside range', () => {
      const startDate = new Date('2020-02-01');
      const endDate = new Date('2020-05-31');
      const result = filterByDateRange(mockEvents, startDate, endDate);
      expect(result).toHaveLength(0);
    });

    it('should include events on boundary dates', () => {
      const startDate = new Date('2020-01-15');
      const endDate = new Date('2020-01-15');
      const result = filterByDateRange(mockEvents, startDate, endDate);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });
  });

  describe('filterByAttributes', () => {
    it('should return all events when no attributes provided', () => {
      const result = filterByAttributes(mockEvents, undefined);
      expect(result).toEqual(mockEvents);
    });

    it('should filter by isDuration = true', () => {
      const result = filterByAttributes(mockEvents, { isDuration: true });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('should filter by isDuration = false', () => {
      const result = filterByAttributes(mockEvents, { isDuration: false });
      expect(result).toHaveLength(0); // No events explicitly have isDuration: false
    });

    it('should filter by hasImage = true', () => {
      const result = filterByAttributes(mockEvents, { hasImage: true });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('should filter by hasImage = false', () => {
      const result = filterByAttributes(mockEvents, { hasImage: false });
      expect(result).toHaveLength(3);
    });

    it('should filter by hasLink = true', () => {
      const result = filterByAttributes(mockEvents, { hasLink: true });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('should filter by hasLink = false', () => {
      const result = filterByAttributes(mockEvents, { hasLink: false });
      expect(result).toHaveLength(3);
    });

    it('should filter by hasIcon = true', () => {
      const result = filterByAttributes(mockEvents, { hasIcon: true });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('3');
    });

    it('should filter by hasIcon = false', () => {
      const result = filterByAttributes(mockEvents, { hasIcon: false });
      expect(result).toHaveLength(3);
    });

    it('should filter by multiple attributes', () => {
      const result = filterByAttributes(mockEvents, {
        isDuration: true,
        hasLink: true,
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('should return empty when attributes dont match', () => {
      const result = filterByAttributes(mockEvents, {
        isDuration: true,
        hasImage: true,
      });
      expect(result).toHaveLength(0);
    });
  });

  describe('filterEvents', () => {
    it('should return all events when no filters provided', () => {
      const result = filterEvents(mockEvents, {});
      expect(result).toEqual(mockEvents);
    });

    it('should apply search filter', () => {
      const result = filterEvents(mockEvents, {
        search: 'festival',
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('should apply date range filter', () => {
      const result = filterEvents(mockEvents, {
        dateRange: {
          start: new Date('2020-06-01'),
          end: new Date('2020-12-31'),
        },
      });
      expect(result).toHaveLength(2);
    });

    it('should apply attribute filter', () => {
      const result = filterEvents(mockEvents, {
        attributes: {
          isDuration: true,
        },
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('should apply custom filter', () => {
      const result = filterEvents(mockEvents, {
        customFilter: (event) => event.title.includes('Event'),
      });
      // "First Event" and "Holiday Event" contain "Event"
      expect(result).toHaveLength(2);
    });

    it('should combine multiple filters', () => {
      const result = filterEvents(mockEvents, {
        search: 'event',
        dateRange: {
          start: new Date('2020-12-01'),
        },
        attributes: {
          hasIcon: true,
        },
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('3');
    });

    it('should apply filters in sequence', () => {
      const result = filterEvents(mockEvents, {
        search: 'e', // Matches all events
        dateRange: {
          start: new Date('2020-06-01'), // Filters to 3 events
        },
        attributes: {
          hasLink: true, // Further filters to 1 event
        },
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('should return empty when no events match all filters', () => {
      const result = filterEvents(mockEvents, {
        search: 'festival',
        dateRange: {
          start: new Date('2021-01-01'),
        },
      });
      expect(result).toHaveLength(0);
    });
  });

  describe('getSearchMatches', () => {
    it('should return empty array when query is empty', () => {
      const result = getSearchMatches(mockEvents, '');
      expect(result).toHaveLength(0);
    });

    it('should return empty array when query is whitespace', () => {
      const result = getSearchMatches(mockEvents, '   ');
      expect(result).toHaveLength(0);
    });

    it('should find title matches with indices', () => {
      const result = getSearchMatches(mockEvents, 'event');
      expect(result.length).toBeGreaterThan(0);

      const firstMatch = result.find((m) => m.eventId === '1');
      expect(firstMatch).toBeDefined();
      expect(firstMatch?.matches[0].field).toBe('title');
      expect(firstMatch?.matches[0].indices[0]).toEqual([6, 11]); // 'Event' at position 6
    });

    it('should find description matches', () => {
      const result = getSearchMatches(mockEvents, 'test');
      expect(result).toHaveLength(1);

      const match = result[0];
      expect(match.eventId).toBe('1');
      expect(match.matches.some((m) => m.field === 'description')).toBe(true);
    });

    it('should find caption matches', () => {
      const result = getSearchMatches(mockEvents, 'celebration');
      expect(result).toHaveLength(1);

      const match = result[0];
      expect(match.eventId).toBe('3');
      expect(match.matches[0].field).toBe('caption');
    });

    it('should find multiple matches in same event', () => {
      const events: TimelineEvent[] = [
        {
          id: '1',
          start: '2020-01-15',
          title: 'Test Event',
          description: 'This is a test',
        },
      ];

      const result = getSearchMatches(events, 'test');
      expect(result).toHaveLength(1);
      expect(result[0].matches).toHaveLength(2); // Both title and description
    });

    it('should not include events without IDs', () => {
      const eventsWithoutId: TimelineEvent[] = [
        {
          start: '2020-01-15',
          title: 'Event Without ID',
        },
      ];

      const result = getSearchMatches(eventsWithoutId, 'event');
      expect(result).toHaveLength(0);
    });

    it('should calculate correct indices for matches', () => {
      const events: TimelineEvent[] = [
        {
          id: '1',
          start: '2020-01-15',
          title: 'Summer Festival',
        },
      ];

      const result = getSearchMatches(events, 'festival');
      expect(result[0].matches[0].indices[0]).toEqual([7, 15]); // 'Festival' starts at 7
    });

    it('should be case-insensitive', () => {
      const result = getSearchMatches(mockEvents, 'FESTIVAL');
      expect(result).toHaveLength(1);
      expect(result[0].eventId).toBe('2');
    });
  });

  describe('sortByRelevance', () => {
    it('should return events unchanged when query is empty', () => {
      const result = sortByRelevance(mockEvents, '');
      expect(result).toEqual(mockEvents);
    });

    it('should return events unchanged when query is whitespace', () => {
      const result = sortByRelevance(mockEvents, '   ');
      expect(result).toEqual(mockEvents);
    });

    it('should prioritize title matches', () => {
      const events: TimelineEvent[] = [
        {
          id: '1',
          start: '2020-01-15',
          title: 'Other Title',
          description: 'Contains festival in description',
        },
        {
          id: '2',
          start: '2020-06-20',
          title: 'Festival Event',
          description: 'Some description',
        },
      ];

      const result = sortByRelevance(events, 'festival');
      expect(result[0].id).toBe('2'); // Title match first
      expect(result[1].id).toBe('1'); // Description match second
    });

    it('should prioritize exact title matches', () => {
      const events: TimelineEvent[] = [
        {
          id: '1',
          start: '2020-01-15',
          title: 'Summer Festival Event',
        },
        {
          id: '2',
          start: '2020-06-20',
          title: 'Festival',
        },
      ];

      const result = sortByRelevance(events, 'festival');
      expect(result[0].id).toBe('2'); // Exact match first
      expect(result[1].id).toBe('1'); // Partial match second
    });

    it('should score caption matches higher than description', () => {
      const events: TimelineEvent[] = [
        {
          id: '1',
          start: '2020-01-15',
          title: 'Event One',
          description: 'Contains music',
        },
        {
          id: '2',
          start: '2020-06-20',
          title: 'Event Two',
          caption: 'Music festival',
        },
      ];

      const result = sortByRelevance(events, 'music');
      expect(result[0].id).toBe('2'); // Caption match first
    });

    it('should handle events with no matches', () => {
      const events: TimelineEvent[] = [
        {
          id: '1',
          start: '2020-01-15',
          title: 'Event One',
        },
        {
          id: '2',
          start: '2020-06-20',
          title: 'Event Two',
        },
      ];

      const result = sortByRelevance(events, 'nonexistent');
      expect(result).toHaveLength(2);
      // Order doesn't matter when nothing matches
    });

    it('should not mutate original array', () => {
      const original = [...mockEvents];
      sortByRelevance(mockEvents, 'event');
      expect(mockEvents).toEqual(original);
    });

    it('should be case-insensitive', () => {
      const result = sortByRelevance(mockEvents, 'FESTIVAL');
      expect(result[0].id).toBe('2');
    });
  });
});
