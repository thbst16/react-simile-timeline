/**
 * useTimelineScroll
 *
 * Custom hook for handling timeline panning/scrolling behavior.
 * Manages mouse drag, touch swipe, and programmatic scrolling.
 *
 * Sprint 4: Interactions
 */

import { useCallback, useRef, useState, useEffect } from 'react';

export interface UseTimelineScrollOptions {
  /** Enable mouse drag to pan */
  enableMouseDrag?: boolean;
  /** Enable touch swipe to pan */
  enableTouch?: boolean;
  /** Callback when scroll position changes */
  onScroll?: (deltaPixels: number) => void;
  /** Scroll friction/damping factor (0-1) */
  friction?: number;
}

export interface UseTimelineScrollResult {
  /** Ref to attach to scrollable container */
  scrollRef: React.RefObject<HTMLDivElement>;
  /** Programmatically scroll by pixel amount */
  scrollBy: (pixels: number) => void;
  /** Programmatically scroll to pixel position */
  scrollTo: (position: number) => void;
  /** Whether currently scrolling */
  isScrolling: boolean;
}

/**
 * Hook for managing timeline scroll/pan interactions
 *
 * @example
 * const { scrollRef, scrollBy, isScrolling } = useTimelineScroll({
 *   enableMouseDrag: true,
 *   enableTouch: true,
 *   onScroll: (delta) => console.log('Scrolled:', delta)
 * });
 */
export function useTimelineScroll(
  options: UseTimelineScrollOptions = {}
): UseTimelineScrollResult {
  const {
    enableMouseDrag = true,
    enableTouch = true,
    onScroll,
    friction = 0.95,
  } = options;

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const isDraggingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const lastScrollRef = useRef(0);
  const velocityRef = useRef(0);
  const animationFrameRef = useRef<number>();

  // Debounced scroll callback (16ms = 60fps)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedOnScroll = useCallback(
    debounce((delta: number) => {
      onScroll?.(delta);
    }, 16),
    [onScroll]
  );

  // Handle mouse drag start
  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      if (!enableMouseDrag) return;

      isDraggingRef.current = true;
      startPosRef.current = { x: e.clientX, y: e.clientY };
      lastScrollRef.current = e.clientX;
      velocityRef.current = 0;
      setIsScrolling(true);

      // Prevent text selection during drag
      e.preventDefault();
    },
    [enableMouseDrag]
  );

  // Handle mouse drag move
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingRef.current) return;

      const deltaX = e.clientX - lastScrollRef.current;
      velocityRef.current = deltaX;
      lastScrollRef.current = e.clientX;

      debouncedOnScroll(deltaX);
    },
    [debouncedOnScroll]
  );

  // Apply momentum/inertia scrolling
  const applyMomentum = useCallback((): void => {
    const tick = (): void => {
      velocityRef.current *= friction;

      if (Math.abs(velocityRef.current) > 0.5) {
        debouncedOnScroll(velocityRef.current);
        animationFrameRef.current = requestAnimationFrame(tick);
      } else {
        velocityRef.current = 0;
        setIsScrolling(false);
      }
    };

    tick();
  }, [friction, debouncedOnScroll]);

  // Handle mouse drag end
  const handleMouseUp = useCallback(() => {
    if (!isDraggingRef.current) return;

    isDraggingRef.current = false;

    // Apply momentum scrolling
    if (Math.abs(velocityRef.current) > 1) {
      applyMomentum();
    } else {
      setIsScrolling(false);
    }
  }, [applyMomentum]);

  // Handle touch start
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!enableTouch || e.touches.length === 0) return;

      const touch = e.touches[0];
      if (!touch) return;

      isDraggingRef.current = true;
      startPosRef.current = { x: touch.clientX, y: touch.clientY };
      lastScrollRef.current = touch.clientX;
      velocityRef.current = 0;
      setIsScrolling(true);
    },
    [enableTouch]
  );

  // Handle touch move
  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDraggingRef.current || e.touches.length === 0) return;

      const touch = e.touches[0];
      if (!touch) return;

      const deltaX = touch.clientX - lastScrollRef.current;
      velocityRef.current = deltaX;
      lastScrollRef.current = touch.clientX;

      debouncedOnScroll(deltaX);

      // Prevent default scrolling
      e.preventDefault();
    },
    [debouncedOnScroll]
  );

  // Handle touch end
  const handleTouchEnd = useCallback(() => {
    if (!isDraggingRef.current) return;

    isDraggingRef.current = false;

    // Apply momentum scrolling
    if (Math.abs(velocityRef.current) > 1) {
      applyMomentum();
    } else {
      setIsScrolling(false);
    }
  }, [applyMomentum]);

  // Attach event listeners
  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    if (enableMouseDrag) {
      element.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    if (enableTouch) {
      element.addEventListener('touchstart', handleTouchStart, { passive: false });
      element.addEventListener('touchmove', handleTouchMove, { passive: false });
      element.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      if (enableMouseDrag) {
        element.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      }

      if (enableTouch) {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchmove', handleTouchMove);
        element.removeEventListener('touchend', handleTouchEnd);
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    enableMouseDrag,
    enableTouch,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  ]);

  const scrollBy = useCallback((pixels: number) => {
    debouncedOnScroll(pixels);
  }, [debouncedOnScroll]);

  const scrollTo = useCallback((position: number) => {
    // Calculate delta from current position
    // This would need to be coordinated with the timeline's current position
    // For now, we'll emit the position directly
    onScroll?.(position);
  }, [onScroll]);

  return {
    scrollRef,
    scrollBy,
    scrollTo,
    isScrolling,
  };
}

// Utility: Debounce function
function debounce<T extends (...args: never[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: number | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = window.setTimeout(() => {
      func(...args);
    }, wait);
  };
}
