/**
 * useVirtualization Hook Tests
 *
 * Tests for event virtualization and performance optimization.
 * Sprint 5: Polish & Performance
 */

import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useVirtualization } from '../useVirtualization';
import type { TimelineEvent } from '../../types/events';

// Helper to create test events
function createEvent(id: string, startPixel: number, endPixel: number): TimelineEvent {
  return {
    id,
    title: `Event ${id}`,
    start: new Date(2020, 0, 1).toISOString(),
    end: new Date(2020, 0, 2).toISOString(),
    // Store pixel positions for testing
    _testStartPixel: startPixel,
    _testEndPixel: endPixel,
  } as TimelineEvent & { _testStartPixel: number; _testEndPixel: number };
}

function getEventStart(event: TimelineEvent): number {
  return (event as any)._testStartPixel;
}

function getEventEnd(event: TimelineEvent): number {
  return (event as any)._testEndPixel;
}

describe('useVirtualization', () => {
  it('returns all events when virtualization is disabled', () => {
    const events = [
      createEvent('1', 0, 100),
      createEvent('2', 200, 300),
      createEvent('3', 400, 500),
    ];

    const { result } = renderHook(() =>
      useVirtualization({
        events,
        viewportStart: 0,
        viewportEnd: 200,
        getEventStart,
        getEventEnd,
        enabled: false,
      })
    );

    expect(result.current.visibleEvents).toHaveLength(3);
    expect(result.current.isVirtualized).toBe(false);
  });

  it('returns all events when below threshold', () => {
    const events = [createEvent('1', 0, 100), createEvent('2', 200, 300)];

    const { result } = renderHook(() =>
      useVirtualization({
        events,
        viewportStart: 0,
        viewportEnd: 200,
        getEventStart,
        getEventEnd,
        threshold: 100,
      })
    );

    expect(result.current.visibleEvents).toHaveLength(2);
    expect(result.current.isVirtualized).toBe(false);
  });

  it('filters events outside viewport when virtualized', () => {
    const events = [
      createEvent('1', 0, 100), // Before viewport
      createEvent('2', 500, 600), // In viewport
      createEvent('3', 700, 800), // In viewport
      createEvent('4', 1500, 1600), // After viewport
    ];

    const { result } = renderHook(() =>
      useVirtualization({
        events,
        viewportStart: 400,
        viewportEnd: 1000,
        getEventStart,
        getEventEnd,
        bufferSize: 0, // No buffer for precise testing
        threshold: 3,
      })
    );

    expect(result.current.visibleEvents).toHaveLength(2);
    expect(result.current.visibleEvents[0].id).toBe('2');
    expect(result.current.visibleEvents[1].id).toBe('3');
    expect(result.current.isVirtualized).toBe(true);
  });

  it('includes events in buffer zone', () => {
    const events = [
      createEvent('1', 150, 250), // In buffer (buffered start = 200)
      createEvent('2', 500, 600), // In viewport
      createEvent('3', 1100, 1200), // In buffer (buffered end = 1200)
      createEvent('4', 1500, 1600), // Outside buffer
    ];

    const { result } = renderHook(() =>
      useVirtualization({
        events,
        viewportStart: 400,
        viewportEnd: 1000,
        getEventStart,
        getEventEnd,
        bufferSize: 200,
        threshold: 3,
      })
    );

    expect(result.current.visibleEvents).toHaveLength(3);
    expect(result.current.visibleEvents.map((e) => e.id)).toEqual(['1', '2', '3']);
  });

  it('counts events before and after viewport', () => {
    const events = [
      createEvent('1', 0, 100),
      createEvent('2', 150, 250),
      createEvent('3', 500, 600),
      createEvent('4', 700, 800),
      createEvent('5', 1500, 1600),
      createEvent('6', 1700, 1800),
    ];

    const { result } = renderHook(() =>
      useVirtualization({
        events,
        viewportStart: 400,
        viewportEnd: 1000,
        getEventStart,
        getEventEnd,
        bufferSize: 100,
        threshold: 5,
      })
    );

    expect(result.current.beforeCount).toBe(2);
    expect(result.current.afterCount).toBe(2);
  });

  it('calculates statistics correctly', () => {
    const events = Array.from({ length: 200 }, (_, i) =>
      createEvent(`${i}`, i * 100, i * 100 + 50)
    );

    const { result } = renderHook(() =>
      useVirtualization({
        events,
        viewportStart: 1000,
        viewportEnd: 2000,
        getEventStart,
        getEventEnd,
        bufferSize: 0,
        threshold: 100,
      })
    );

    expect(result.current.totalCount).toBe(200);
    expect(result.current.stats.skippedCount).toBeGreaterThan(0);
    expect(result.current.stats.renderPercentage).toBeLessThan(100);
    expect(result.current.stats.memorySaved).toMatch(/KB|MB/);
  });

  it('handles events spanning viewport boundaries', () => {
    const events = [
      createEvent('1', 300, 700), // Spans viewport start
      createEvent('2', 800, 1200), // Spans viewport end
    ];

    const { result } = renderHook(() =>
      useVirtualization({
        events,
        viewportStart: 500,
        viewportEnd: 1000,
        getEventStart,
        getEventEnd,
        bufferSize: 0,
        threshold: 1,
      })
    );

    expect(result.current.visibleEvents).toHaveLength(2);
  });

  it('handles point events (start === end)', () => {
    const events = [
      createEvent('1', 500, 500), // Point in viewport
      createEvent('2', 1500, 1500), // Point outside viewport
    ];

    const { result } = renderHook(() =>
      useVirtualization({
        events,
        viewportStart: 400,
        viewportEnd: 1000,
        getEventStart,
        getEventEnd,
        bufferSize: 0,
        threshold: 1,
      })
    );

    expect(result.current.visibleEvents).toHaveLength(1);
    expect(result.current.visibleEvents[0].id).toBe('1');
  });

  it('updates when viewport changes', () => {
    const events = [
      createEvent('1', 0, 100),
      createEvent('2', 200, 300),
      createEvent('3', 1000, 1100),
    ];

    const { result, rerender } = renderHook(
      ({ viewportStart, viewportEnd }) =>
        useVirtualization({
          events,
          viewportStart,
          viewportEnd,
          getEventStart,
          getEventEnd,
          bufferSize: 0,
          threshold: 2,
        }),
      {
        initialProps: { viewportStart: 0, viewportEnd: 350 },
      }
    );

    // Initially see events 1 and 2
    expect(result.current.visibleEvents.map((e) => e.id)).toEqual(['1', '2']);

    // Change viewport to see events 2 and 3
    rerender({ viewportStart: 200, viewportEnd: 1200 });
    expect(result.current.visibleEvents.map((e) => e.id)).toEqual(['2', '3']);
  });

  it('handles empty event list', () => {
    const { result } = renderHook(() =>
      useVirtualization({
        events: [],
        viewportStart: 0,
        viewportEnd: 1000,
        getEventStart,
        getEventEnd,
      })
    );

    expect(result.current.visibleEvents).toHaveLength(0);
    expect(result.current.totalCount).toBe(0);
    expect(result.current.stats.renderPercentage).toBe(0);
  });

  it('handles large dataset efficiently', () => {
    const events = Array.from({ length: 10000 }, (_, i) => createEvent(`${i}`, i * 10, i * 10 + 5));

    const startTime = performance.now();

    const { result } = renderHook(() =>
      useVirtualization({
        events,
        viewportStart: 50000,
        viewportEnd: 51000,
        getEventStart,
        getEventEnd,
        threshold: 100,
      })
    );

    const endTime = performance.now();

    // Should complete quickly (under 50ms)
    expect(endTime - startTime).toBeLessThan(50);

    // Should render only a small subset
    expect(result.current.visibleCount).toBeLessThan(events.length / 2);
    expect(result.current.stats.renderPercentage).toBeLessThan(10);
  });
});
