/**
 * Tests for useBandSync hook
 * Sprint 4: Interactions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBandSync } from '../useBandSync';

describe('useBandSync', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('should initialize with band configurations', () => {
    const bands = [
      { bandId: 'detail', syncRatio: 1, isMaster: true },
      { bandId: 'overview', syncRatio: 0.1 },
    ];

    const { result } = renderHook(() => useBandSync({ bands }));

    expect(result.current.notifyScroll).toBeDefined();
    expect(result.current.getSyncedDelta).toBeDefined();
    expect(result.current.registerBand).toBeDefined();
    expect(result.current.unregisterBand).toBeDefined();
  });

  it('should calculate synced delta based on sync ratio', () => {
    const bands = [
      { bandId: 'detail', syncRatio: 1 },
      { bandId: 'overview', syncRatio: 0.1 },
    ];

    const { result } = renderHook(() => useBandSync({ bands }));

    const overviewDelta = result.current.getSyncedDelta('overview', 100);
    expect(overviewDelta).toBe(10); // 100 * 0.1

    const detailDelta = result.current.getSyncedDelta('detail', 100);
    expect(detailDelta).toBe(100); // 100 * 1
  });

  it('should return 0 for unknown band ID', () => {
    const bands = [{ bandId: 'detail', syncRatio: 1 }];

    const { result } = renderHook(() => useBandSync({ bands }));

    const delta = result.current.getSyncedDelta('unknown', 100);
    expect(delta).toBe(0);
  });

  it('should use default sync ratio of 1 when not specified', () => {
    const bands = [{ bandId: 'detail' }];

    const { result } = renderHook(() => useBandSync({ bands }));

    const delta = result.current.getSyncedDelta('detail', 100);
    expect(delta).toBe(100);
  });

  it('should propagate scroll to other bands with correct ratios', () => {
    const onBandScroll = vi.fn();
    const bands = [
      { bandId: 'detail', syncRatio: 1 },
      { bandId: 'overview', syncRatio: 0.1 },
      { bandId: 'month', syncRatio: 0.5 },
    ];

    const { result } = renderHook(() => useBandSync({ bands, onBandScroll }));

    act(() => {
      result.current.notifyScroll('detail', 100);
    });

    // Advance timers to trigger setTimeout
    act(() => {
      vi.runAllTimers();
    });

    // Should call onBandScroll for source band
    expect(onBandScroll).toHaveBeenCalledWith('detail', 100);

    // Should propagate to overview with 0.1 ratio (0.1 / 1 = 0.1)
    expect(onBandScroll).toHaveBeenCalledWith('overview', 10);

    // Should propagate to month with 0.5 ratio (0.5 / 1 = 0.5)
    expect(onBandScroll).toHaveBeenCalledWith('month', 50);
  });

  it('should register new bands dynamically', () => {
    const bands = [{ bandId: 'detail', syncRatio: 1 }];

    const { result } = renderHook(() => useBandSync({ bands }));

    act(() => {
      result.current.registerBand({
        bandId: 'newBand',
        syncRatio: 0.2,
      });
    });

    const delta = result.current.getSyncedDelta('newBand', 100);
    expect(delta).toBe(20);
  });

  it('should unregister bands', () => {
    const bands = [
      { bandId: 'detail', syncRatio: 1 },
      { bandId: 'overview', syncRatio: 0.1 },
    ];

    const { result } = renderHook(() => useBandSync({ bands }));

    act(() => {
      result.current.unregisterBand('overview');
    });

    const delta = result.current.getSyncedDelta('overview', 100);
    expect(delta).toBe(0);
  });

  it('should prevent circular scroll updates', () => {
    const onBandScroll = vi.fn();
    const bands = [
      { bandId: 'detail', syncRatio: 1 },
      { bandId: 'overview', syncRatio: 0.1 },
    ];

    const { result } = renderHook(() => useBandSync({ bands, onBandScroll }));

    // First scroll from detail band
    act(() => {
      result.current.notifyScroll('detail', 100);
    });

    const callCount = onBandScroll.mock.calls.length;

    // Try to scroll from detail again while previous scroll is in progress
    act(() => {
      result.current.notifyScroll('detail', 50);
    });

    // Should be prevented (call count should not increase for source band)
    expect(onBandScroll.mock.calls.length).toBe(callCount);
  });

  it('should handle relative sync ratios correctly', () => {
    const onBandScroll = vi.fn();
    const bands = [
      { bandId: 'decade', syncRatio: 0.1 },
      { bandId: 'year', syncRatio: 1 },
      { bandId: 'month', syncRatio: 10 },
    ];

    const { result } = renderHook(() => useBandSync({ bands, onBandScroll }));

    // Scroll the year band (middle ratio)
    act(() => {
      result.current.notifyScroll('year', 100);
    });

    act(() => {
      vi.runAllTimers();
    });

    // Decade should move slower (0.1 / 1 = 0.1)
    expect(onBandScroll).toHaveBeenCalledWith('decade', 10);

    // Month should move faster (10 / 1 = 10)
    expect(onBandScroll).toHaveBeenCalledWith('month', 1000);
  });

  it('should update bands when props change', () => {
    const { result, rerender } = renderHook(({ bands }) => useBandSync({ bands }), {
      initialProps: {
        bands: [{ bandId: 'detail', syncRatio: 1 }],
      },
    });

    let delta = result.current.getSyncedDelta('detail', 100);
    expect(delta).toBe(100);

    // Update bands prop
    rerender({
      bands: [
        { bandId: 'detail', syncRatio: 2 },
        { bandId: 'overview', syncRatio: 0.5 },
      ],
    });

    delta = result.current.getSyncedDelta('detail', 100);
    expect(delta).toBe(200);

    const overviewDelta = result.current.getSyncedDelta('overview', 100);
    expect(overviewDelta).toBe(50);
  });
});
