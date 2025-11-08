/**
 * usePerformanceMonitor Hook
 *
 * Monitors rendering performance metrics including FPS, render time,
 * and memory usage.
 *
 * Sprint 7: Complete Sprint 5 Features
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Performance metrics snapshot
 */
export interface PerformanceMetrics {
  /**
   * Current frames per second
   */
  fps: number;

  /**
   * Average FPS over last second
   */
  avgFps: number;

  /**
   * Last render time in milliseconds
   */
  renderTime: number;

  /**
   * Average render time in milliseconds
   */
  avgRenderTime: number;

  /**
   * Frame count
   */
  frameCount: number;

  /**
   * Whether performance is good (>= target FPS)
   */
  isGood: boolean;

  /**
   * Performance rating: 'excellent' | 'good' | 'fair' | 'poor'
   */
  rating: 'excellent' | 'good' | 'fair' | 'poor';
}

/**
 * Performance Monitor Options
 */
export interface UsePerformanceMonitorOptions {
  /**
   * Target FPS
   * @default 60
   */
  targetFps?: number;

  /**
   * Update interval in milliseconds
   * @default 1000
   */
  updateInterval?: number;

  /**
   * Enable monitoring
   * @default true
   */
  enabled?: boolean;

  /**
   * Callback when metrics update
   */
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;

  /**
   * Callback when performance drops below target
   */
  onPerformanceDrop?: (metrics: PerformanceMetrics) => void;
}

/**
 * Performance Monitor Result
 */
export interface UsePerformanceMonitorResult {
  /**
   * Current performance metrics
   */
  metrics: PerformanceMetrics;

  /**
   * Start a render measurement
   */
  startRender: () => void;

  /**
   * End a render measurement
   */
  endRender: () => void;

  /**
   * Reset all metrics
   */
  reset: () => void;

  /**
   * Manually update frame count (for RAF loops)
   */
  recordFrame: () => void;
}

/**
 * Hook for monitoring rendering performance
 *
 * @example
 * const perf = usePerformanceMonitor({ targetFps: 60 });
 *
 * // In your render loop
 * useEffect(() => {
 *   const animate = () => {
 *     perf.recordFrame();
 *     // ... rendering logic
 *     requestAnimationFrame(animate);
 *   };
 *   animate();
 * }, []);
 *
 * // Display metrics
 * <div>FPS: {perf.metrics.fps}</div>
 */
export function usePerformanceMonitor(
  options: UsePerformanceMonitorOptions = {}
): UsePerformanceMonitorResult {
  const {
    targetFps = 60,
    updateInterval = 1000,
    enabled = true,
    onMetricsUpdate,
    onPerformanceDrop,
  } = options;

  // Frame tracking
  const frameCountRef = useRef(0);
  const lastFrameTimeRef = useRef(performance.now());
  const framesInSecondRef = useRef<number[]>([]);

  // Render time tracking
  const renderStartRef = useRef(0);
  const renderTimesRef = useRef<number[]>([]);

  // Metrics state
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    avgFps: 0,
    renderTime: 0,
    avgRenderTime: 0,
    frameCount: 0,
    isGood: true,
    rating: 'excellent',
  });

  /**
   * Record a frame for FPS calculation
   */
  const recordFrame = useCallback(() => {
    if (!enabled) return;

    const now = performance.now();
    const delta = now - lastFrameTimeRef.current;
    lastFrameTimeRef.current = now;

    frameCountRef.current++;
    framesInSecondRef.current.push(1000 / delta); // Convert to FPS

    // Keep only last second of frames
    const oneSecondAgo = now - 1000;
    framesInSecondRef.current = framesInSecondRef.current.filter((_, i, arr) => {
      const frameTime = now - (arr.length - i - 1) * delta;
      return frameTime > oneSecondAgo;
    });
  }, [enabled]);

  /**
   * Start measuring render time
   */
  const startRender = useCallback(() => {
    if (!enabled) return;
    renderStartRef.current = performance.now();
  }, [enabled]);

  /**
   * End measuring render time
   */
  const endRender = useCallback(() => {
    if (!enabled) return;
    const renderTime = performance.now() - renderStartRef.current;
    renderTimesRef.current.push(renderTime);

    // Keep only last 10 measurements
    if (renderTimesRef.current.length > 10) {
      renderTimesRef.current.shift();
    }
  }, [enabled]);

  /**
   * Reset all metrics
   */
  const reset = useCallback(() => {
    frameCountRef.current = 0;
    lastFrameTimeRef.current = performance.now();
    framesInSecondRef.current = [];
    renderTimesRef.current = [];
    setMetrics({
      fps: 0,
      avgFps: 0,
      renderTime: 0,
      avgRenderTime: 0,
      frameCount: 0,
      isGood: true,
      rating: 'excellent',
    });
  }, []);

  /**
   * Calculate performance rating
   */
  const calculateRating = (fps: number): PerformanceMetrics['rating'] => {
    const ratio = fps / targetFps;
    if (ratio >= 0.95) return 'excellent';
    if (ratio >= 0.75) return 'good';
    if (ratio >= 0.5) return 'fair';
    return 'poor';
  };

  /**
   * Update metrics periodically
   */
  useEffect(() => {
    if (!enabled) return;

    const intervalId = setInterval(() => {
      const fps = framesInSecondRef.current.length > 0
        ? framesInSecondRef.current[framesInSecondRef.current.length - 1] || 0
        : 0;

      const avgFps = framesInSecondRef.current.length > 0
        ? framesInSecondRef.current.reduce((sum, f) => sum + f, 0) / framesInSecondRef.current.length
        : 0;

      const renderTime = renderTimesRef.current.length > 0
        ? renderTimesRef.current[renderTimesRef.current.length - 1] || 0
        : 0;

      const avgRenderTime = renderTimesRef.current.length > 0
        ? renderTimesRef.current.reduce((sum, t) => sum + t, 0) / renderTimesRef.current.length
        : 0;

      const newMetrics: PerformanceMetrics = {
        fps: Math.round(fps),
        avgFps: Math.round(avgFps),
        renderTime: Math.round(renderTime * 100) / 100,
        avgRenderTime: Math.round(avgRenderTime * 100) / 100,
        frameCount: frameCountRef.current,
        isGood: avgFps >= targetFps * 0.9,
        rating: calculateRating(avgFps),
      };

      setMetrics(newMetrics);
      onMetricsUpdate?.(newMetrics);

      // Alert on performance drop
      if (!newMetrics.isGood && avgFps > 0) {
        onPerformanceDrop?.(newMetrics);
      }
    }, updateInterval);

    return () => clearInterval(intervalId);
  }, [enabled, targetFps, updateInterval, onMetricsUpdate, onPerformanceDrop]);

  /**
   * Auto-record frames using RAF
   */
  useEffect(() => {
    if (!enabled) return;

    let rafId: number;
    const animate = () => {
      recordFrame();
      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [enabled, recordFrame]);

  return {
    metrics,
    startRender,
    endRender,
    reset,
    recordFrame,
  };
}
