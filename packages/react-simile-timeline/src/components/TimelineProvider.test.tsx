import { describe, it, expect, vi } from 'vitest';
import type { ReactNode } from 'react';
import { render, renderHook, act } from '@testing-library/react';
import {
  TimelineProvider,
  useTimelineContext,
  DEFAULT_BANDS,
} from './TimelineProvider';
import type { TimelineEvent } from '../types';

const events: TimelineEvent[] = [
  { start: '2023-01-01', title: 'A' },
  { start: '2023-06-15', title: 'B' },
  { start: '2023-12-31', title: 'C' },
];

/** Render the context hook inside a TimelineProvider with the given props. */
function renderContext(
  props: Partial<React.ComponentProps<typeof TimelineProvider>> = {}
) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <TimelineProvider events={events} {...props}>
      {children}
    </TimelineProvider>
  );
  return renderHook(() => useTimelineContext(), { wrapper });
}

describe('useTimelineContext', () => {
  it('throws when used outside a provider', () => {
    // Silence the expected React error boundary log.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useTimelineContext())).toThrow(
      /must be used within a TimelineProvider/
    );
    spy.mockRestore();
  });

  it('exposes state, actions, events, bands and hotZones', () => {
    const { result } = renderContext();
    expect(result.current.state).toBeDefined();
    expect(result.current.actions).toBeDefined();
    expect(result.current.events).toHaveLength(3);
    expect(result.current.bands.length).toBeGreaterThan(0);
    expect(Array.isArray(result.current.hotZones)).toBe(true);
  });
});

describe('TimelineProvider — bands', () => {
  it('generates default detail + overview bands from events', () => {
    const { result } = renderContext();
    const ids = result.current.bands.map((b) => b.id);
    expect(ids).toContain('detail');
    expect(ids).toContain('overview');
  });

  it('passes explicit bands through untouched', () => {
    const custom = [{ id: 'only', timeUnit: 'year' as const }];
    const { result } = renderContext({ bands: custom });
    expect(result.current.bands).toEqual(custom);
  });

  it('falls back to default bands for an empty event set', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <TimelineProvider events={[]}>{children}</TimelineProvider>
    );
    const { result } = renderHook(() => useTimelineContext(), { wrapper });
    expect(result.current.bands).toHaveLength(2);
  });

  it('selects coarser units for a multi-decade range', () => {
    const wide: TimelineEvent[] = [
      { start: '1900-01-01', title: 'old' },
      { start: '2000-01-01', title: 'new' },
    ];
    const wrapper = ({ children }: { children: ReactNode }) => (
      <TimelineProvider events={wide}>{children}</TimelineProvider>
    );
    const { result } = renderHook(() => useTimelineContext(), { wrapper });
    expect(result.current.bands[0].timeUnit).toBe('decade');
    expect(result.current.bands[1].timeUnit).toBe('century');
  });

  it('exports a sane DEFAULT_BANDS fallback', () => {
    expect(DEFAULT_BANDS).toHaveLength(2);
    expect(DEFAULT_BANDS[0].overview).toBe(false);
    expect(DEFAULT_BANDS[1].overview).toBe(true);
  });
});

describe('TimelineProvider — center date resolution', () => {
  it('uses a Date instance verbatim', () => {
    const d = new Date(2020, 5, 1);
    const { result } = renderContext({ initialCenterDate: d });
    expect(result.current.state.centerDate.getTime()).toBe(d.getTime());
  });

  it('parses a date-only string to local midnight (day is preserved)', () => {
    const { result } = renderContext({ initialCenterDate: '2023-03-10' });
    expect(result.current.state.centerDate.getDate()).toBe(10);
  });

  it('falls back to the median event date for an unparseable string', () => {
    const { result } = renderContext({ initialCenterDate: 'not-a-date' });
    // Median of the three events is B (2023-06-15).
    expect(result.current.state.centerDate.getFullYear()).toBe(2023);
    expect(result.current.state.centerDate.getMonth()).toBe(5);
  });
});

describe('TimelineProvider — actions', () => {
  it('jumpToDate accepts a Date and fires onScroll', () => {
    const onScroll = vi.fn();
    const { result } = renderContext({ onScroll });
    const target = new Date(2021, 0, 1);
    act(() => result.current.actions.jumpToDate(target));
    expect(result.current.state.centerDate.getTime()).toBe(target.getTime());
    expect(onScroll).toHaveBeenCalledWith(target);
  });

  it('jumpToDate accepts a string', () => {
    const { result } = renderContext();
    act(() => result.current.actions.jumpToDate('2022-07-04'));
    expect(result.current.state.centerDate.getFullYear()).toBe(2022);
    expect(result.current.state.centerDate.getDate()).toBe(4);
  });

  it('pan shifts the center date by the delta and fires onScroll', () => {
    const onScroll = vi.fn();
    const { result } = renderContext({ initialCenterDate: new Date(2020, 0, 1), onScroll });
    const before = result.current.state.centerDate.getTime();
    const dayMs = 24 * 60 * 60 * 1000;
    act(() => result.current.actions.pan(dayMs));
    expect(result.current.state.centerDate.getTime()).toBe(before + dayMs);
    expect(onScroll).toHaveBeenCalled();
  });

  it('setSelectedEvent stores the event and fires onEventClick', () => {
    const onEventClick = vi.fn();
    const { result } = renderContext({ onEventClick });
    act(() => result.current.actions.setSelectedEvent(events[0], { x: 5, y: 6 }));
    expect(result.current.state.selectedEvent).toBe(events[0]);
    expect(result.current.state.clickPosition).toEqual({ x: 5, y: 6 });
    expect(onEventClick).toHaveBeenCalledWith(events[0]);
  });

  it('setSelectedEvent(null) clears selection and click position', () => {
    const { result } = renderContext();
    act(() => result.current.actions.setSelectedEvent(events[0], { x: 1, y: 2 }));
    act(() => result.current.actions.setSelectedEvent(null));
    expect(result.current.state.selectedEvent).toBeNull();
    expect(result.current.state.clickPosition).toBeNull();
  });

  it('setHoveredEvent fires onEventHover', () => {
    const onEventHover = vi.fn();
    const { result } = renderContext({ onEventHover });
    act(() => result.current.actions.setHoveredEvent(events[1]));
    expect(result.current.state.hoveredEvent).toBe(events[1]);
    expect(onEventHover).toHaveBeenCalledWith(events[1]);
  });

  it('zoom multiplies and clamps within [0.1, 10]', () => {
    const { result } = renderContext();
    act(() => result.current.actions.zoom(2));
    expect(result.current.state.zoomLevel).toBe(2);
    // Clamp high.
    act(() => result.current.actions.zoom(1000));
    expect(result.current.state.zoomLevel).toBe(10);
    // Clamp low.
    act(() => result.current.actions.zoom(0.0001));
    expect(result.current.state.zoomLevel).toBe(0.1);
  });

  it('setViewportWidth and setIsPanning update state', () => {
    const { result } = renderContext();
    act(() => result.current.actions.setViewportWidth(1234));
    expect(result.current.state.viewportWidth).toBe(1234);
    act(() => result.current.actions.setIsPanning(true));
    expect(result.current.state.isPanning).toBe(true);
  });

  it('setCenterDate fires onScroll', () => {
    const onScroll = vi.fn();
    const { result } = renderContext({ onScroll });
    const d = new Date(2019, 3, 3);
    act(() => result.current.actions.setCenterDate(d));
    expect(result.current.state.centerDate.getTime()).toBe(d.getTime());
    expect(onScroll).toHaveBeenCalledWith(d);
  });
});

describe('TimelineProvider — reactive center date', () => {
  it('re-resolves centerDate when initialCenterDate changes after mount', () => {
    let captured: Date | null = null;
    function Probe() {
      captured = useTimelineContext().state.centerDate;
      return null;
    }
    const { rerender } = render(
      <TimelineProvider events={events} initialCenterDate={'2020-01-01'}>
        <Probe />
      </TimelineProvider>
    );
    expect(captured!.getFullYear()).toBe(2020);
    rerender(
      <TimelineProvider events={events} initialCenterDate={'2025-01-01'}>
        <Probe />
      </TimelineProvider>
    );
    expect(captured!.getFullYear()).toBe(2025);
  });
});
