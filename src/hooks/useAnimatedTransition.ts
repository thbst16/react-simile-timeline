/**
 * useAnimatedTransition
 *
 * Custom hook for smooth animated transitions in the timeline.
 * Handles easing, duration, and animation frame management.
 *
 * Sprint 4: Interactions
 */

import { useState, useRef, useCallback, useEffect } from 'react';

export type EasingFunction = (t: number) => number;

// Common easing functions
export const easings = {
  linear: (t: number): number => t,
  easeInQuad: (t: number): number => t * t,
  easeOutQuad: (t: number): number => t * (2 - t),
  easeInOutQuad: (t: number): number => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInCubic: (t: number): number => t * t * t,
  easeOutCubic: (t: number): number => --t * t * t + 1,
  easeInOutCubic: (t: number): number =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeInElastic: (t: number): number => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
  },
  easeOutElastic: (t: number): number => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
};

export interface UseAnimatedTransitionOptions {
  /** Duration of animation in milliseconds */
  duration?: number;
  /** Easing function */
  easing?: EasingFunction;
  /** Callback when animation starts */
  onStart?: () => void;
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Callback on each frame with progress (0-1) */
  onUpdate?: (progress: number) => void;
}

export interface UseAnimatedTransitionResult {
  /** Current animation progress (0-1) */
  progress: number;
  /** Whether animation is currently running */
  isAnimating: boolean;
  /** Start animation from current value to target */
  animate: (from: number, to: number) => void;
  /** Stop current animation */
  stop: () => void;
  /** Current animated value */
  value: number;
}

/**
 * Hook for creating smooth animated transitions
 *
 * @example
 * const { value, animate, isAnimating } = useAnimatedTransition({
 *   duration: 300,
 *   easing: easings.easeOutQuad,
 *   onComplete: () => console.log('Animation done!')
 * });
 *
 * // Animate from 0 to 100
 * animate(0, 100);
 */
export function useAnimatedTransition(
  options: UseAnimatedTransitionOptions = {}
): UseAnimatedTransitionResult {
  const { duration = 300, easing = easings.easeOutQuad, onStart, onComplete, onUpdate } = options;

  const [progress, setProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [value, setValue] = useState(0);

  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const fromValueRef = useRef<number>(0);
  const toValueRef = useRef<number>(0);

  // Animation loop
  const animationLoop = useCallback(
    (timestamp: number) => {
      if (startTimeRef.current === 0) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const rawProgress = Math.min(elapsed / duration, 1);
      const easedProgress = easing(rawProgress);

      // Calculate current value
      const from = fromValueRef.current;
      const to = toValueRef.current;
      const currentValue = from + (to - from) * easedProgress;

      setProgress(easedProgress);
      setValue(currentValue);
      onUpdate?.(easedProgress);

      if (rawProgress < 1) {
        animationFrameRef.current = requestAnimationFrame(animationLoop);
      } else {
        setIsAnimating(false);
        startTimeRef.current = 0;
        onComplete?.();
      }
    },
    [duration, easing, onUpdate, onComplete]
  );

  // Start animation
  const animate = useCallback(
    (from: number, to: number) => {
      // Stop any existing animation
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      fromValueRef.current = from;
      toValueRef.current = to;
      startTimeRef.current = 0;
      setProgress(0);
      setIsAnimating(true);

      onStart?.();

      animationFrameRef.current = requestAnimationFrame(animationLoop);
    },
    [animationLoop, onStart]
  );

  // Stop animation
  const stop = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }
    setIsAnimating(false);
    startTimeRef.current = 0;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    progress,
    isAnimating,
    animate,
    stop,
    value,
  };
}

/**
 * Hook for animating a single value with spring physics
 */
export interface UseSpringOptions {
  /** Spring stiffness (default: 170) */
  stiffness?: number;
  /** Spring damping (default: 26) */
  damping?: number;
  /** Mass (default: 1) */
  mass?: number;
  /** Initial velocity (default: 0) */
  initialVelocity?: number;
  /** Callback when animation completes */
  onComplete?: () => void;
}

export interface UseSpringResult {
  /** Current animated value */
  value: number;
  /** Set target value (triggers animation) */
  setValue: (target: number) => void;
  /** Whether animation is running */
  isAnimating: boolean;
  /** Stop animation immediately */
  stop: () => void;
}

/**
 * Hook for spring-based animations
 *
 * @example
 * const spring = useSpring({ stiffness: 200, damping: 30 });
 * spring.setValue(100); // Animates to 100 with spring physics
 */
export function useSpring(options: UseSpringOptions = {}): UseSpringResult {
  const { stiffness = 170, damping = 26, mass = 1, initialVelocity = 0, onComplete } = options;

  const [value, setValueState] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const targetRef = useRef(0);
  const currentValueRef = useRef(0);
  const velocityRef = useRef(initialVelocity);
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  const springLoop = useCallback(
    (timestamp: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = timestamp;
      }

      const deltaTime = Math.min((timestamp - lastTimeRef.current) / 1000, 0.064); // Cap at ~15fps
      lastTimeRef.current = timestamp;

      const current = currentValueRef.current;
      const target = targetRef.current;

      // Spring physics
      const springForce = -stiffness * (current - target);
      const dampingForce = -damping * velocityRef.current;
      const acceleration = (springForce + dampingForce) / mass;

      velocityRef.current += acceleration * deltaTime;
      const newValue = current + velocityRef.current * deltaTime;
      currentValueRef.current = newValue;

      setValueState(newValue);

      // Check if spring has settled
      const isSettled = Math.abs(velocityRef.current) < 0.01 && Math.abs(newValue - target) < 0.01;

      if (isSettled) {
        currentValueRef.current = target;
        setValueState(target);
        setIsAnimating(false);
        lastTimeRef.current = 0;
        onComplete?.();
      } else {
        animationFrameRef.current = requestAnimationFrame(springLoop);
      }
    },
    [stiffness, damping, mass, onComplete]
  );

  const setValue = useCallback(
    (target: number) => {
      targetRef.current = target;
      lastTimeRef.current = 0;
      setIsAnimating(true);

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(springLoop);
    },
    [springLoop]
  );

  const stop = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }
    setIsAnimating(false);
    lastTimeRef.current = 0;
  }, []);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    value,
    setValue,
    isAnimating,
    stop,
  };
}
