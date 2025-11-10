/**
 * Tests for useKeyboardNav hook
 * Sprint 4: Interactions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useKeyboardNav } from '../useKeyboardNav';

describe('useKeyboardNav', () => {
  let _keydownEvent: KeyboardEvent;

  beforeEach(() => {
    // Mock keyboard events
    _keydownEvent = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useKeyboardNav());

    expect(result.current.isActive).toBe(true);
    expect(result.current.getShortcuts().length).toBeGreaterThan(0);
  });

  it('should disable keyboard navigation when enabled is false', () => {
    const { result } = renderHook(() => useKeyboardNav({ enabled: false }));

    expect(result.current.isActive).toBe(false);
  });

  it('should call onPan when arrow keys are pressed', () => {
    const onPan = vi.fn();
    renderHook(() => useKeyboardNav({ onPan, panStep: 50 }));

    // Simulate ArrowLeft
    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'ArrowLeft',
        bubbles: true,
        cancelable: true,
      });
      window.dispatchEvent(event);
    });

    expect(onPan).toHaveBeenCalledWith('left', 50);

    // Simulate ArrowRight
    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true,
        cancelable: true,
      });
      window.dispatchEvent(event);
    });

    expect(onPan).toHaveBeenCalledWith('right', 50);
  });

  it('should call onZoom when +/- keys are pressed', () => {
    const onZoom = vi.fn();
    renderHook(() => useKeyboardNav({ onZoom }));

    // Simulate +
    act(() => {
      const event = new KeyboardEvent('keydown', { key: '+', bubbles: true, cancelable: true });
      window.dispatchEvent(event);
    });

    expect(onZoom).toHaveBeenCalledWith('in');

    // Simulate -
    act(() => {
      const event = new KeyboardEvent('keydown', { key: '-', bubbles: true, cancelable: true });
      window.dispatchEvent(event);
    });

    expect(onZoom).toHaveBeenCalledWith('out');
  });

  it('should call onEscape when Escape key is pressed', () => {
    const onEscape = vi.fn();
    renderHook(() => useKeyboardNav({ onEscape }));

    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      });
      window.dispatchEvent(event);
    });

    expect(onEscape).toHaveBeenCalled();
  });

  it('should call onNavigate when Home/End keys are pressed', () => {
    const onNavigate = vi.fn();
    renderHook(() => useKeyboardNav({ onNavigate }));

    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'Home', bubbles: true, cancelable: true });
      window.dispatchEvent(event);
    });

    expect(onNavigate).toHaveBeenCalledWith('start');

    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true });
      window.dispatchEvent(event);
    });

    expect(onNavigate).toHaveBeenCalledWith('end');
  });

  it('should not capture keys when typing in input fields', () => {
    const onPan = vi.fn();
    renderHook(() => useKeyboardNav({ onPan }));

    // Create a fake input element
    const input = document.createElement('input');
    document.body.appendChild(input);

    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'ArrowLeft',
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperty(event, 'target', { value: input, enumerable: true });
      window.dispatchEvent(event);
    });

    expect(onPan).not.toHaveBeenCalled();

    document.body.removeChild(input);
  });

  it('should register custom shortcuts', () => {
    const handler = vi.fn();
    const { result } = renderHook(() => useKeyboardNav());

    act(() => {
      result.current.registerShortcut({
        key: 's',
        ctrlKey: true,
        description: 'Save',
        handler,
      });
    });

    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 's',
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      });
      window.dispatchEvent(event);
    });

    expect(handler).toHaveBeenCalled();
  });

  it('should unregister shortcuts', () => {
    const handler = vi.fn();
    const { result } = renderHook(() => useKeyboardNav());

    act(() => {
      result.current.registerShortcut({
        key: 't',
        description: 'Test',
        handler,
      });
    });

    act(() => {
      result.current.unregisterShortcut('t');
    });

    act(() => {
      const event = new KeyboardEvent('keydown', { key: 't', bubbles: true, cancelable: true });
      window.dispatchEvent(event);
    });

    expect(handler).not.toHaveBeenCalled();
  });

  it('should handle modifier keys correctly', () => {
    const handler = vi.fn();
    renderHook(() =>
      useKeyboardNav({
        shortcuts: [
          {
            key: 'k',
            ctrlKey: true,
            shiftKey: true,
            description: 'Complex shortcut',
            handler,
          },
        ],
      })
    );

    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'k',
        ctrlKey: true,
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      });
      window.dispatchEvent(event);
    });

    expect(handler).toHaveBeenCalled();
  });

  it('should return all registered shortcuts', () => {
    const { result } = renderHook(() => useKeyboardNav());

    const shortcuts = result.current.getShortcuts();

    expect(shortcuts.length).toBeGreaterThan(0);
    expect(shortcuts.some((s) => s.key === 'ArrowLeft')).toBe(true);
    expect(shortcuts.some((s) => s.key === '+')).toBe(true);
    expect(shortcuts.some((s) => s.key === 'Escape')).toBe(true);
  });
});
