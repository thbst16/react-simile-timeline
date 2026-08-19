import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePan } from './usePan';

/**
 * Build a PointerEvent-like object for the React onPointerDown handler. jsdom
 * has no PointerEvent constructor, so a plain object with the fields the hook
 * reads is enough.
 */
function pointerDownArg(overrides: Partial<Record<string, unknown>> = {}) {
  const target = document.createElement('div');
  const currentTarget = document.createElement('div');
  currentTarget.setPointerCapture = vi.fn();
  currentTarget.releasePointerCapture = vi.fn();
  return {
    button: 0,
    pointerType: 'mouse',
    pointerId: 1,
    clientX: 100,
    target,
    currentTarget,
    preventDefault: vi.fn(),
    ...overrides,
  } as unknown as React.PointerEvent;
}

/** Dispatch a document-level pointer event of the given type. */
function dispatchPointer(type: string, clientX: number) {
  const evt = new Event(type) as Event & { clientX?: number };
  evt.clientX = clientX;
  act(() => {
    document.dispatchEvent(evt);
  });
}

describe('usePan — shape', () => {
  it('returns panProps with a handler and grab styling', () => {
    const { result } = renderHook(() =>
      usePan({ onPan: vi.fn(), pixelsPerMs: 1 })
    );
    expect(typeof result.current.panProps.onPointerDown).toBe('function');
    expect(result.current.panProps.style.cursor).toBe('grab');
    expect(result.current.panProps.style.touchAction).toBe('none');
    expect(result.current.isPanning).toBe(false);
  });
});

describe('usePan — drag', () => {
  it('converts a rightward drag to a backward time delta and fires start/end', () => {
    const onPan = vi.fn();
    const onPanStart = vi.fn();
    const onPanEnd = vi.fn();
    // 1 pixel == 1 ms keeps the arithmetic obvious.
    const { result } = renderHook(() =>
      usePan({ onPan, pixelsPerMs: 1, onPanStart, onPanEnd })
    );

    act(() => result.current.panProps.onPointerDown(pointerDownArg({ clientX: 100 })));
    expect(onPanStart).toHaveBeenCalledOnce();

    // Drag right by 30px -> deltaMs should be -30 (right = back in time).
    dispatchPointer('pointermove', 130);
    expect(onPan).toHaveBeenCalledWith(-30);

    dispatchPointer('pointerup', 130);
    expect(onPanEnd).toHaveBeenCalledOnce();
  });

  it('ignores a non-primary, non-touch pointer', () => {
    const onPanStart = vi.fn();
    const { result } = renderHook(() =>
      usePan({ onPan: vi.fn(), pixelsPerMs: 1, onPanStart })
    );
    act(() =>
      result.current.panProps.onPointerDown(
        pointerDownArg({ button: 2, pointerType: 'mouse' })
      )
    );
    expect(onPanStart).not.toHaveBeenCalled();
  });

  it('ignores a pointer down that lands on an event marker', () => {
    const onPanStart = vi.fn();
    const target = document.createElement('div');
    target.className = 'timeline-event';
    const { result } = renderHook(() =>
      usePan({ onPan: vi.fn(), pixelsPerMs: 1, onPanStart })
    );
    act(() =>
      result.current.panProps.onPointerDown(pointerDownArg({ target }))
    );
    expect(onPanStart).not.toHaveBeenCalled();
  });

  it('does not pan on move when no drag is in progress', () => {
    const onPan = vi.fn();
    renderHook(() => usePan({ onPan, pixelsPerMs: 1 }));
    dispatchPointer('pointermove', 200);
    expect(onPan).not.toHaveBeenCalled();
  });
});

describe('usePan — keyboard', () => {
  function pressKey(key: string, target?: EventTarget) {
    const evt = new KeyboardEvent('keydown', { key });
    if (target) Object.defineProperty(evt, 'target', { value: target });
    act(() => {
      window.dispatchEvent(evt);
    });
  }

  it('ArrowRight pans forward by keyboardPanAmount', () => {
    const onPan = vi.fn();
    renderHook(() =>
      usePan({ onPan, pixelsPerMs: 1, keyboardPanAmount: 1000 })
    );
    pressKey('ArrowRight');
    expect(onPan).toHaveBeenCalledWith(1000);
  });

  it('ArrowLeft pans backward by keyboardPanAmount', () => {
    const onPan = vi.fn();
    renderHook(() =>
      usePan({ onPan, pixelsPerMs: 1, keyboardPanAmount: 1000 })
    );
    pressKey('ArrowLeft');
    expect(onPan).toHaveBeenCalledWith(-1000);
  });

  it('ignores arrows while focus is in a text input', () => {
    const onPan = vi.fn();
    renderHook(() => usePan({ onPan, pixelsPerMs: 1 }));
    pressKey('ArrowRight', document.createElement('input'));
    expect(onPan).not.toHaveBeenCalled();
  });

  it('does nothing when keyboard navigation is disabled', () => {
    const onPan = vi.fn();
    renderHook(() =>
      usePan({ onPan, pixelsPerMs: 1, enableKeyboard: false })
    );
    pressKey('ArrowRight');
    expect(onPan).not.toHaveBeenCalled();
  });
});

describe('usePan — cleanup', () => {
  let addSpy: ReturnType<typeof vi.spyOn>;
  let removeSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    addSpy = vi.spyOn(window, 'addEventListener');
    removeSpy = vi.spyOn(window, 'removeEventListener');
  });
  afterEach(() => {
    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it('removes the keydown listener on unmount', () => {
    const { unmount } = renderHook(() =>
      usePan({ onPan: vi.fn(), pixelsPerMs: 1 })
    );
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});
