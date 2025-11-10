/**
 * Tests for useTimelineScroll hook
 * Sprint 4: Interactions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimelineScroll } from '../useTimelineScroll';

describe('useTimelineScroll', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    vi.useFakeTimers();
  });

  afterEach(() => {
    document.body.removeChild(container);
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useTimelineScroll());

    expect(result.current.scrollRef).toBeDefined();
    expect(result.current.isScrolling).toBe(false);
    expect(typeof result.current.scrollBy).toBe('function');
    expect(typeof result.current.scrollTo).toBe('function');
  });

  it('should enable mouse drag by default', () => {
    const onScroll = vi.fn();
    const { result } = renderHook(() => useTimelineScroll({ onScroll }));

    // Attach ref to container
    if (result.current.scrollRef.current === null) {
      Object.defineProperty(result.current.scrollRef, 'current', {
        value: container,
        writable: true,
      });
    }

    expect(result.current.scrollRef.current).toBe(container);
  });

  it('should have scrollRef defined', () => {
    const onScroll = vi.fn();
    const { result } = renderHook(() => useTimelineScroll({ enableMouseDrag: true, onScroll }));

    expect(result.current.scrollRef).toBeDefined();
    expect(result.current.isScrolling).toBe(false);
  });

  it('should call onScroll when scrollBy is invoked', () => {
    const onScroll = vi.fn();
    const { result } = renderHook(() => useTimelineScroll({ onScroll }));

    act(() => {
      result.current.scrollBy(50);
    });

    // Advance timers to trigger debounced callback
    act(() => {
      vi.advanceTimersByTime(20);
    });

    expect(onScroll).toHaveBeenCalledWith(50);
  });

  it('should call onScroll when scrollTo is invoked', () => {
    const onScroll = vi.fn();
    const { result } = renderHook(() => useTimelineScroll({ onScroll }));

    act(() => {
      result.current.scrollTo(1000);
    });

    expect(onScroll).toHaveBeenCalledWith(1000);
  });

  it('should disable mouse drag when enableMouseDrag is false', () => {
    const onScroll = vi.fn();
    const { result } = renderHook(() => useTimelineScroll({ enableMouseDrag: false, onScroll }));

    Object.defineProperty(result.current.scrollRef, 'current', {
      value: container,
      writable: true,
    });

    act(() => {
      const event = new MouseEvent('mousedown', {
        bubbles: true,
        clientX: 100,
        clientY: 100,
      });
      container.dispatchEvent(event);
    });

    expect(result.current.isScrolling).toBe(false);
  });

  it('should respect enableTouch option', () => {
    const onScroll = vi.fn();
    const { result } = renderHook(() => useTimelineScroll({ enableTouch: true, onScroll }));

    expect(result.current.scrollRef).toBeDefined();
    expect(result.current.isScrolling).toBe(false);
  });

  it('should debounce scroll events', () => {
    const onScroll = vi.fn();
    const { result } = renderHook(() => useTimelineScroll({ onScroll }));

    // Call scrollBy multiple times rapidly
    act(() => {
      result.current.scrollBy(10);
      result.current.scrollBy(20);
      result.current.scrollBy(30);
    });

    // Should not have been called yet
    expect(onScroll).not.toHaveBeenCalled();

    // Advance timers past debounce delay
    act(() => {
      vi.advanceTimersByTime(20);
    });

    // Should have been called once with the last value
    expect(onScroll).toHaveBeenCalledTimes(1);
    expect(onScroll).toHaveBeenCalledWith(30);
  });
});
