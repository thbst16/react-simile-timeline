/**
 * Tests for usePanZoom hook
 * Sprint 4: Interactions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePanZoom } from '../usePanZoom';

describe('usePanZoom', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('should initialize with default zoom level', () => {
    const { result } = renderHook(() => usePanZoom());

    expect(result.current.zoom).toBe(1);
    expect(result.current.isZooming).toBe(false);
  });

  it('should initialize with custom zoom level', () => {
    const { result } = renderHook(() => usePanZoom({ initialZoom: 2 }));

    expect(result.current.zoom).toBe(2);
  });

  it('should zoom in when zoomIn is called', () => {
    const onZoomChange = vi.fn();
    const { result } = renderHook(() =>
      usePanZoom({ initialZoom: 1, zoomStep: 0.2, onZoomChange })
    );

    act(() => {
      result.current.zoomIn();
    });

    expect(result.current.zoom).toBe(1.2);
    expect(onZoomChange).toHaveBeenCalledWith(1.2);
  });

  it('should zoom out when zoomOut is called', () => {
    const onZoomChange = vi.fn();
    const { result } = renderHook(() =>
      usePanZoom({ initialZoom: 1, zoomStep: 0.2, onZoomChange })
    );

    act(() => {
      result.current.zoomOut();
    });

    expect(result.current.zoom).toBe(0.8);
    expect(onZoomChange).toHaveBeenCalledWith(0.8);
  });

  it('should respect minimum zoom level', () => {
    const { result } = renderHook(() =>
      usePanZoom({ initialZoom: 0.2, minZoom: 0.1, zoomStep: 0.2 })
    );

    act(() => {
      result.current.zoomOut();
    });

    expect(result.current.zoom).toBe(0.1);

    // Try to zoom out below minimum
    act(() => {
      result.current.zoomOut();
    });

    expect(result.current.zoom).toBe(0.1);
  });

  it('should respect maximum zoom level', () => {
    const { result } = renderHook(() =>
      usePanZoom({ initialZoom: 9.9, maxZoom: 10, zoomStep: 0.2 })
    );

    act(() => {
      result.current.zoomIn();
    });

    expect(result.current.zoom).toBe(10);

    // Try to zoom in above maximum
    act(() => {
      result.current.zoomIn();
    });

    expect(result.current.zoom).toBe(10);
  });

  it('should set specific zoom level', () => {
    const onZoomChange = vi.fn();
    const { result } = renderHook(() => usePanZoom({ onZoomChange }));

    act(() => {
      result.current.setZoom(3.5);
    });

    expect(result.current.zoom).toBe(3.5);
    expect(onZoomChange).toHaveBeenCalledWith(3.5);
  });

  it('should reset zoom to initial level', () => {
    const { result } = renderHook(() => usePanZoom({ initialZoom: 2 }));

    act(() => {
      result.current.setZoom(5);
    });

    expect(result.current.zoom).toBe(5);

    act(() => {
      result.current.resetZoom();
    });

    expect(result.current.zoom).toBe(2);
  });

  it('should call onPan with zoom-adjusted delta', () => {
    const onPan = vi.fn();
    const { result } = renderHook(() => usePanZoom({ initialZoom: 2, onPan }));

    act(() => {
      result.current.pan(100, 50);
    });

    // Delta should be divided by zoom level
    expect(onPan).toHaveBeenCalledWith(50, 25);
  });

  it('should handle wheel zoom when enabled', () => {
    const onZoomChange = vi.fn();
    const { result } = renderHook(() =>
      usePanZoom({ enableWheelZoom: true, onZoomChange, initialZoom: 1, zoomStep: 0.2 })
    );

    // Simulate wheel event (zoom in)
    act(() => {
      const event = new WheelEvent('wheel', {
        deltaY: -100,
        bubbles: true,
        cancelable: true,
      });
      window.dispatchEvent(event);
    });

    expect(result.current.zoom).toBe(1.2);
    expect(onZoomChange).toHaveBeenCalledWith(1.2);
  });

  it('should not handle wheel zoom when disabled', () => {
    const onZoomChange = vi.fn();
    const { result } = renderHook(() =>
      usePanZoom({ enableWheelZoom: false, onZoomChange, initialZoom: 1 })
    );

    act(() => {
      const event = new WheelEvent('wheel', {
        deltaY: -100,
        bubbles: true,
        cancelable: true,
      });
      window.dispatchEvent(event);
    });

    expect(result.current.zoom).toBe(1);
    expect(onZoomChange).not.toHaveBeenCalled();
  });

  it('should set isZooming during wheel zoom', () => {
    const { result } = renderHook(() => usePanZoom({ enableWheelZoom: true }));

    act(() => {
      const event = new WheelEvent('wheel', {
        deltaY: -100,
        bubbles: true,
        cancelable: true,
      });
      window.dispatchEvent(event);
    });

    expect(result.current.isZooming).toBe(true);

    // Advance timers to clear zooming state
    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(result.current.isZooming).toBe(false);
  });

  it('should provide all expected functions', () => {
    const { result } = renderHook(() => usePanZoom());

    expect(typeof result.current.zoomIn).toBe('function');
    expect(typeof result.current.zoomOut).toBe('function');
    expect(typeof result.current.setZoom).toBe('function');
    expect(typeof result.current.resetZoom).toBe('function');
    expect(typeof result.current.pan).toBe('function');
  });
});
