import { bench, describe } from 'vitest';
import {
  calculateLayout,
  calculateLayoutPrepared,
  prepareEvents,
} from './layoutEngine';
import type { TimelineEvent } from '../types';

// Per-frame layout cost at 1k / 10k / 50k point events. Run with:
//   pnpm --filter react-simile-timeline exec vitest bench
//
// `calculateLayout` re-parses every event on every call — the pre-#36 hot path,
// linear in dataset size. `calculateLayoutPrepared` runs from a set parsed once
// (as the components now do behind a memo), so its cost is independent of
// dataset size. The `prepareEvents` benches show where the parse cost moved to:
// once, at data load, rather than every pan frame.

function pointEvents(n: number): TimelineEvent[] {
  const start = Date.UTC(1900, 0, 1);
  const span = Date.UTC(2100, 0, 1) - start;
  return Array.from({ length: n }, (_, i) => ({
    start: new Date(start + Math.floor((i / n) * span)).toISOString().slice(0, 10),
    title: `Event ${i}`,
  }));
}

const centerDate = new Date(2000, 0, 1);
const pixelsPerMs = 100 / (24 * 60 * 60 * 1000);
const viewportWidth = 1200;
const halfMs = viewportWidth / 2 / pixelsPerMs;
const visibleRange = {
  start: new Date(centerDate.getTime() - halfMs),
  end: new Date(centerDate.getTime() + halfMs),
};

for (const n of [1000, 10000, 50000]) {
  const events = pointEvents(n);
  const prepared = prepareEvents(events);

  describe(`${n} point events`, () => {
    bench('calculateLayout (re-parse every frame)', () => {
      calculateLayout(events, visibleRange, pixelsPerMs, centerDate, viewportWidth);
    });

    bench('calculateLayoutPrepared (parsed once)', () => {
      calculateLayoutPrepared(prepared, visibleRange, pixelsPerMs, centerDate, viewportWidth);
    });

    bench('prepareEvents (once, at data load)', () => {
      prepareEvents(events);
    });
  });
}
