import { useCallback, useRef, useEffect } from 'react';

export interface UsePanOptions {
  /** Callback when panning occurs (deltaMs = time delta) */
  onPan: (deltaMs: number) => void;
  /** Pixels per millisecond for converting drag distance to time */
  pixelsPerMs: number;
  /** Callback when panning starts */
  onPanStart?: () => void;
  /** Callback when panning ends */
  onPanEnd?: () => void;
  /** Enable keyboard navigation */
  enableKeyboard?: boolean;
  /** Milliseconds to pan per keyboard press */
  keyboardPanAmount?: number;
  /** Friction coefficient for momentum (0-1, lower = more friction) */
  friction?: number;
  /** Minimum velocity threshold to stop momentum */
  velocityThreshold?: number;
}

export interface UsePanResult {
  /** Props to spread on the draggable element */
  panProps: {
    onPointerDown: (e: React.PointerEvent) => void;
    style: React.CSSProperties;
  };
  /** Whether currently panning */
  isPanning: boolean;
}

/**
 * Hook for handling pan/drag interactions with momentum
 * Uses refs to avoid stale closure issues with event listeners
 */
export function usePan({
  onPan,
  pixelsPerMs,
  onPanStart,
  onPanEnd,
  enableKeyboard = true,
  keyboardPanAmount = 24 * 60 * 60 * 1000, // 1 day default
  friction = 0.95,
  velocityThreshold = 0.01,
}: UsePanOptions): UsePanResult {
  // Refs for tracking pan state
  const isPanningRef = useRef(false);
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const velocityRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);
  const pointerIdRef = useRef<number | null>(null);

  // Store current callback values in refs to avoid stale closures
  const onPanRef = useRef(onPan);
  const onPanStartRef = useRef(onPanStart);
  const onPanEndRef = useRef(onPanEnd);
  const pixelsPerMsRef = useRef(pixelsPerMs);
  const frictionRef = useRef(friction);
  const velocityThresholdRef = useRef(velocityThreshold);

  // Update refs when props change
  useEffect(() => {
    onPanRef.current = onPan;
    onPanStartRef.current = onPanStart;
    onPanEndRef.current = onPanEnd;
    pixelsPerMsRef.current = pixelsPerMs;
    frictionRef.current = friction;
    velocityThresholdRef.current = velocityThreshold;
  }, [onPan, onPanStart, onPanEnd, pixelsPerMs, friction, velocityThreshold]);

  // Cancel any ongoing momentum animation
  const cancelMomentum = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // Momentum animation - defined once, uses refs for current values
  const animateMomentum = useCallback(() => {
    if (Math.abs(velocityRef.current) < velocityThresholdRef.current) {
      velocityRef.current = 0;
      return;
    }

    // Convert velocity (pixels/ms) to time delta
    const deltaMs = -velocityRef.current * 16 / pixelsPerMsRef.current; // 16ms frame
    onPanRef.current(deltaMs);

    // Apply friction
    velocityRef.current *= frictionRef.current;

    // Continue animation
    animationFrameRef.current = requestAnimationFrame(animateMomentum);
  }, []);

  // Stable pointer move handler - uses refs for current values
  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!isPanningRef.current) return;

    const now = performance.now();
    const deltaTime = now - lastTimeRef.current;
    const deltaX = e.clientX - lastXRef.current;

    // Calculate velocity (pixels per ms)
    if (deltaTime > 0) {
      velocityRef.current = deltaX / deltaTime;
    }

    // Convert pixel delta to time delta
    // Dragging right (positive deltaX) should go back in time (negative deltaMs)
    const deltaMs = -deltaX / pixelsPerMsRef.current;
    onPanRef.current(deltaMs);

    lastXRef.current = e.clientX;
    lastTimeRef.current = now;
  }, []);

  // Stable pointer up handler - uses refs for current values
  const handlePointerUp = useCallback(() => {
    if (!isPanningRef.current) return;

    isPanningRef.current = false;
    onPanEndRef.current?.();

    // Release pointer capture
    if (elementRef.current && pointerIdRef.current !== null) {
      try {
        elementRef.current.releasePointerCapture(pointerIdRef.current);
      } catch {
        // Pointer capture may already be released
      }
    }

    // Start momentum animation
    animateMomentum();

    // Remove listeners - these are the SAME function references that were added
    document.removeEventListener('pointermove', handlePointerMove);
    document.removeEventListener('pointerup', handlePointerUp);
    document.removeEventListener('pointercancel', handlePointerUp);
  }, [animateMomentum, handlePointerMove]);

  // Pointer down handler
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    // Only handle primary button (left click) or touch
    if (e.button !== 0 && e.pointerType !== 'touch') return;

    // Don't capture if clicking on an event (let event click handler work)
    const target = e.target as HTMLElement;
    if (target.closest('.timeline-event')) {
      return;
    }

    // Cancel any ongoing momentum
    cancelMomentum();

    isPanningRef.current = true;
    lastXRef.current = e.clientX;
    lastTimeRef.current = performance.now();
    velocityRef.current = 0;
    elementRef.current = e.currentTarget as HTMLElement;
    pointerIdRef.current = e.pointerId;

    onPanStartRef.current?.();

    // Set pointer capture for smooth tracking
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // Pointer capture may not be supported in all environments
    }

    // Add document-level listeners for move and up
    // These are stable references that won't change between renders
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('pointercancel', handlePointerUp);

    e.preventDefault();
  }, [cancelMomentum, handlePointerMove, handlePointerUp]);

  // Keyboard navigation
  useEffect(() => {
    if (!enableKeyboard) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if focus is on an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          cancelMomentum();
          onPanRef.current(-keyboardPanAmount);
          e.preventDefault();
          break;
        case 'ArrowRight':
          cancelMomentum();
          onPanRef.current(keyboardPanAmount);
          e.preventDefault();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboard, keyboardPanAmount, cancelMomentum]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelMomentum();
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [cancelMomentum, handlePointerMove, handlePointerUp]);

  return {
    panProps: {
      onPointerDown: handlePointerDown,
      style: {
        cursor: isPanningRef.current ? 'grabbing' : 'grab',
        touchAction: 'none', // Prevent browser handling of touch
        userSelect: 'none', // Prevent text selection during drag
      },
    },
    isPanning: isPanningRef.current,
  };
}
