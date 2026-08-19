import { describe, it, expect } from 'vitest';
import {
  calculateLayout,
  calculateLayoutPrepared,
  prepareEvents,
  filterVisibleEvents,
  filterVisiblePrepared,
} from './layoutEngine';
import type { TimelineEvent } from '../types';

/** A viewport centered on 2000-01-01 spanning ~viewportWidth/100 days. */
const centerDate = new Date('2000-01-01T00:00:00Z');
const pixelsPerMs = 100 / (24 * 60 * 60 * 1000); // 100px per day
const viewportWidth = 1200;
const halfMs = viewportWidth / 2 / pixelsPerMs;
const visibleRange = {
  start: new Date(centerDate.getTime() - halfMs),
  end: new Date(centerDate.getTime() + halfMs),
};

function pointEvents(n: number): TimelineEvent[] {
  const startBase = Date.UTC(1900, 0, 1);
  const span = Date.UTC(2100, 0, 1) - startBase;
  return Array.from({ length: n }, (_, i) => ({
    start: new Date(startBase + Math.floor((i / n) * span)).toISOString().slice(0, 10),
    title: `Event ${i}`,
  }));
}

const mixed: TimelineEvent[] = [
  { start: '1999-12-20', title: 'point-before' },
  { start: '2000-01-01', title: 'point-center' },
  { start: '2000-01-05', title: 'point-after' },
  { start: '1990-01-01', end: '2010-01-01', title: 'wide-duration', isDuration: true },
  { start: '2000-01-02', end: '2000-01-10', title: 'short-duration', isDuration: true },
  { start: 'not-a-date', title: 'invalid' },
];

describe('prepared layout — equivalence with the un-prepared path', () => {
  for (const n of [0, 1, 100, 1000, 10000]) {
    it(`produces identical layout for ${n} point events`, () => {
      const events = pointEvents(n);
      const legacy = calculateLayout(events, visibleRange, pixelsPerMs, centerDate, viewportWidth);
      const prepared = calculateLayoutPrepared(
        prepareEvents(events),
        visibleRange,
        pixelsPerMs,
        centerDate,
        viewportWidth
      );
      expect(prepared).toEqual(legacy);
    });
  }

  it('produces identical layout for a mixed point/duration/invalid set', () => {
    const legacy = calculateLayout(mixed, visibleRange, pixelsPerMs, centerDate, viewportWidth);
    const prepared = calculateLayoutPrepared(
      prepareEvents(mixed),
      visibleRange,
      pixelsPerMs,
      centerDate,
      viewportWidth
    );
    expect(prepared).toEqual(legacy);
  });

  it('matches filterVisibleEvents membership, including a wide duration', () => {
    const legacyVisible = filterVisibleEvents(mixed, visibleRange);
    const preparedVisible = filterVisiblePrepared(prepareEvents(mixed), visibleRange).map(
      (p) => p.event
    );
    // Same set of events, same order.
    expect(preparedVisible).toEqual(legacyVisible);
    // The wide duration starts a decade before the window but overlaps it.
    expect(preparedVisible.some((e) => e.title === 'wide-duration')).toBe(true);
    // The invalid-date event is dropped by both.
    expect(preparedVisible.some((e) => e.title === 'invalid')).toBe(false);
  });
});

describe('prepared layout — viewport culling holds at scale', () => {
  it('renders only the handful of visible events out of 50k', () => {
    const events = pointEvents(50000);
    const prepared = prepareEvents(events);
    const layout = calculateLayoutPrepared(
      prepared,
      visibleRange,
      pixelsPerMs,
      centerDate,
      viewportWidth
    );
    // The window is ~12 days wide against a 200-year even spread, so only a
    // few events fall inside. The point is that it is a small constant, not 50k.
    expect(layout.length).toBeGreaterThan(0);
    expect(layout.length).toBeLessThan(50);
  });

  it('prepares 50k events into a sorted point list', () => {
    const prepared = prepareEvents(pointEvents(50000));
    expect(prepared.points).toHaveLength(50000);
    for (let i = 1; i < prepared.points.length; i++) {
      expect(prepared.points[i].startMs).toBeGreaterThanOrEqual(
        prepared.points[i - 1].startMs
      );
    }
  });
});
