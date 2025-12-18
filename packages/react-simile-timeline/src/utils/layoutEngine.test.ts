import { describe, it, expect } from 'vitest';
import {
  estimateLabelWidth,
  filterVisibleEvents,
  assignTracks,
  calculateLayout,
  getTrackCount,
  type LayoutEvent,
} from './layoutEngine';
import type { TimelineEvent } from '../types';

describe('estimateLabelWidth', () => {
  it('estimates width for short title', () => {
    const width = estimateLabelWidth('Test');
    // DOT_WIDTH (10) + LABEL_PADDING (6) + 4 chars * CHAR_WIDTH (7) = 44
    expect(width).toBe(44);
  });

  it('estimates width for longer title', () => {
    const width = estimateLabelWidth('Long Event Title');
    // DOT_WIDTH (10) + LABEL_PADDING (6) + 16 chars * CHAR_WIDTH (7) = 128
    expect(width).toBe(128);
  });

  it('returns dot width only when showLabel is false', () => {
    const width = estimateLabelWidth('Test', false);
    expect(width).toBe(10); // DOT_WIDTH only
  });
});

describe('filterVisibleEvents', () => {
  const events: TimelineEvent[] = [
    { start: '2023-01-01', title: 'Event 1' },
    { start: '2023-06-15', title: 'Event 2' },
    { start: '2023-12-31', title: 'Event 3' },
  ];

  it('filters events within visible range', () => {
    const visibleRange = {
      start: new Date('2023-05-01'),
      end: new Date('2023-08-01'),
    };

    const filtered = filterVisibleEvents(events, visibleRange);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].title).toBe('Event 2');
  });

  it('includes events within buffer zone', () => {
    const visibleRange = {
      start: new Date('2023-06-14'),
      end: new Date('2023-06-16'),
    };

    // Default buffer is 1 day, so events on Jun 13 and Jun 17 would be included
    const filtered = filterVisibleEvents(events, visibleRange);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].title).toBe('Event 2');
  });

  it('returns empty array when no events in range', () => {
    const visibleRange = {
      start: new Date('2025-01-01'),
      end: new Date('2025-12-31'),
    };

    const filtered = filterVisibleEvents(events, visibleRange);
    expect(filtered).toHaveLength(0);
  });

  it('handles events with invalid dates gracefully', () => {
    const eventsWithInvalid: TimelineEvent[] = [
      { start: '2023-06-15', title: 'Valid' },
      { start: 'invalid-date', title: 'Invalid' },
    ];

    const visibleRange = {
      start: new Date('2023-01-01'),
      end: new Date('2023-12-31'),
    };

    const filtered = filterVisibleEvents(eventsWithInvalid, visibleRange);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].title).toBe('Valid');
  });
});

describe('assignTracks', () => {
  it('assigns non-overlapping events to same track', () => {
    const events: LayoutEvent[] = [
      { event: { start: '', title: 'A' }, x: 0, width: 50, track: 0 },
      { event: { start: '', title: 'B' }, x: 100, width: 50, track: 0 },
    ];

    const result = assignTracks(events);

    expect(result[0].track).toBe(0);
    expect(result[1].track).toBe(0);
  });

  it('assigns overlapping events to different tracks', () => {
    const events: LayoutEvent[] = [
      { event: { start: '', title: 'A' }, x: 0, width: 100, track: 0 },
      { event: { start: '', title: 'B' }, x: 50, width: 100, track: 0 },
    ];

    const result = assignTracks(events);

    expect(result[0].track).toBe(0);
    expect(result[1].track).toBe(1);
  });

  it('reuses tracks when possible', () => {
    const events: LayoutEvent[] = [
      { event: { start: '', title: 'A' }, x: 0, width: 50, track: 0 },
      { event: { start: '', title: 'B' }, x: 30, width: 50, track: 0 },
      { event: { start: '', title: 'C' }, x: 100, width: 50, track: 0 },
    ];

    const result = assignTracks(events);

    // A and B overlap, so B goes to track 1
    // C doesn't overlap with A, so it goes back to track 0
    expect(result.find(e => e.event.title === 'A')?.track).toBe(0);
    expect(result.find(e => e.event.title === 'B')?.track).toBe(1);
    expect(result.find(e => e.event.title === 'C')?.track).toBe(0);
  });

  it('handles empty array', () => {
    const result = assignTracks([]);
    expect(result).toHaveLength(0);
  });

  it('sorts events by x position', () => {
    const events: LayoutEvent[] = [
      { event: { start: '', title: 'C' }, x: 200, width: 50, track: 0 },
      { event: { start: '', title: 'A' }, x: 0, width: 50, track: 0 },
      { event: { start: '', title: 'B' }, x: 100, width: 50, track: 0 },
    ];

    const result = assignTracks(events);

    expect(result[0].event.title).toBe('A');
    expect(result[1].event.title).toBe('B');
    expect(result[2].event.title).toBe('C');
  });
});

describe('getTrackCount', () => {
  it('returns 1 for empty array', () => {
    expect(getTrackCount([])).toBe(1);
  });

  it('returns 1 for single-track layout', () => {
    const events: LayoutEvent[] = [
      { event: { start: '', title: 'A' }, x: 0, width: 50, track: 0 },
      { event: { start: '', title: 'B' }, x: 100, width: 50, track: 0 },
    ];

    expect(getTrackCount(events)).toBe(1);
  });

  it('returns correct count for multi-track layout', () => {
    const events: LayoutEvent[] = [
      { event: { start: '', title: 'A' }, x: 0, width: 100, track: 0 },
      { event: { start: '', title: 'B' }, x: 50, width: 100, track: 1 },
      { event: { start: '', title: 'C' }, x: 100, width: 100, track: 2 },
    ];

    expect(getTrackCount(events)).toBe(3);
  });
});

describe('calculateLayout', () => {
  it('calculates layout for events', () => {
    const events: TimelineEvent[] = [
      { start: '2023-06-15', title: 'Event 1' },
      { start: '2023-06-16', title: 'Event 2' },
    ];

    const visibleRange = {
      start: new Date('2023-06-01'),
      end: new Date('2023-06-30'),
    };

    const centerDate = new Date('2023-06-15T12:00:00');
    const pixelsPerMs = 100 / (24 * 60 * 60 * 1000); // 100px per day
    const viewportWidth = 1000;

    const layout = calculateLayout(
      events,
      visibleRange,
      pixelsPerMs,
      centerDate,
      viewportWidth
    );

    expect(layout).toHaveLength(2);
    expect(layout[0].event.title).toBe('Event 1');
    expect(layout[1].event.title).toBe('Event 2');
    // Events should have x positions calculated
    expect(typeof layout[0].x).toBe('number');
    expect(typeof layout[1].x).toBe('number');
    // Events should have tracks assigned
    expect(layout[0].track).toBeDefined();
    expect(layout[1].track).toBeDefined();
  });
});
