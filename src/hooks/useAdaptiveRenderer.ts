/**
 * useAdaptiveRenderer Hook
 *
 * Automatically selects the best rendering method (DOM/SVG vs Canvas)
 * based on event count and performance metrics.
 *
 * Sprint 5: Polish & Performance
 */

import { useState, useEffect, useMemo } from 'react';

/**
 * Rendering method
 */
export type RenderMethod = 'dom' | 'canvas';

/**
 * Adaptive Renderer Options
 */
export interface UseAdaptiveRendererOptions {
  /**
   * Number of events to render
   */
  eventCount: number;

  /**
   * Threshold for switching to Canvas
   * @default 1000
   */
  canvasThreshold?: number;

  /**
   * Force a specific rendering method
   */
  forceMethod?: RenderMethod;

  /**
   * Enable automatic switching based on performance
   * @default true
   */
  enableAutoSwitch?: boolean;

  /**
   * Target FPS for performance monitoring
   * @default 30
   */
  targetFps?: number;

  /**
   * Callback when rendering method changes
   */
  onMethodChange?: (method: RenderMethod, reason: string) => void;
}

/**
 * Adaptive Renderer Result
 */
export interface UseAdaptiveRendererResult {
  /**
   * Current rendering method
   */
  method: RenderMethod;

  /**
   * Whether Canvas rendering is recommended
   */
  shouldUseCanvas: boolean;

  /**
   * Reason for current method selection
   */
  reason: string;

  /**
   * Manually switch rendering method
   */
  switchMethod: (method: RenderMethod) => void;

  /**
   * Report performance metrics
   */
  reportPerformance: (fps: number, renderTime: number) => void;
}

/**
 * Hook for adaptive rendering method selection
 *
 * @example
 * const renderer = useAdaptiveRenderer({
 *   eventCount: events.length,
 *   canvasThreshold: 1000,
 * });
 *
 * if (renderer.method === 'canvas') {
 *   return <CanvasEventLayer />;
 * } else {
 *   return <DOMEventLayer />;
 * }
 */
export function useAdaptiveRenderer(
  options: UseAdaptiveRendererOptions
): UseAdaptiveRendererResult {
  const {
    eventCount,
    canvasThreshold = 1000,
    forceMethod,
    enableAutoSwitch = true,
    targetFps = 30,
    onMethodChange,
  } = options;

  const [method, setMethod] = useState<RenderMethod>(() => {
    if (forceMethod) return forceMethod;
    return eventCount >= canvasThreshold ? 'canvas' : 'dom';
  });

  const [performanceHistory, setPerformanceHistory] = useState<
    { fps: number; renderTime: number }[]
  >([]);

  // Determine if Canvas should be used based on event count
  const shouldUseCanvas = useMemo(() => {
    return eventCount >= canvasThreshold;
  }, [eventCount, canvasThreshold]);

  // Determine reason for current method
  const reason = useMemo(() => {
    if (forceMethod) {
      return `Forced to ${forceMethod}`;
    }

    if (method === 'canvas') {
      if (eventCount >= canvasThreshold) {
        return `Event count (${eventCount}) exceeds threshold (${canvasThreshold})`;
      }

      // Check if switched due to performance
      const avgFps =
        performanceHistory.length > 0
          ? performanceHistory.reduce((sum, p) => sum + p.fps, 0) /
            performanceHistory.length
          : 0;

      if (avgFps < targetFps) {
        return `Performance below target (${avgFps.toFixed(1)} < ${targetFps} FPS)`;
      }

      return 'Canvas rendering for better performance';
    }

    return `DOM rendering for ${eventCount} events`;
  }, [method, eventCount, canvasThreshold, performanceHistory, targetFps, forceMethod]);

  // Update method when event count changes
  useEffect(() => {
    if (forceMethod) {
      if (method !== forceMethod) {
        setMethod(forceMethod);
        onMethodChange?.(forceMethod, `Forced to ${forceMethod}`);
      }
      return;
    }

    const newMethod = shouldUseCanvas ? 'canvas' : 'dom';
    if (newMethod !== method) {
      setMethod(newMethod);
      onMethodChange?.(
        newMethod,
        `Event count threshold: ${eventCount} ${shouldUseCanvas ? '>=' : '<'} ${canvasThreshold}`
      );
    }
  }, [shouldUseCanvas, method, eventCount, canvasThreshold, forceMethod, onMethodChange]);

  // Auto-switch based on performance
  useEffect(() => {
    if (!enableAutoSwitch || forceMethod || performanceHistory.length < 5) {
      return;
    }

    // Calculate average FPS from last 5 frames
    const recentHistory = performanceHistory.slice(-5);
    const avgFps =
      recentHistory.reduce((sum, p) => sum + p.fps, 0) / recentHistory.length;

    // If DOM is struggling, switch to Canvas
    if (method === 'dom' && avgFps < targetFps && eventCount > 100) {
      setMethod('canvas');
      onMethodChange?.(
        'canvas',
        `Auto-switched due to low FPS: ${avgFps.toFixed(1)} < ${targetFps}`
      );
    }
  }, [performanceHistory, enableAutoSwitch, method, targetFps, eventCount, forceMethod, onMethodChange]);

  /**
   * Manually switch rendering method
   */
  const switchMethod = (newMethod: RenderMethod): void => {
    if (newMethod !== method) {
      setMethod(newMethod);
      onMethodChange?.(newMethod, 'Manual switch');
    }
  };

  /**
   * Report performance metrics
   */
  const reportPerformance = (fps: number, renderTime: number): void => {
    setPerformanceHistory((prev) => {
      const updated = [...prev, { fps, renderTime }];
      // Keep only last 10 measurements
      return updated.slice(-10);
    });
  };

  return {
    method,
    shouldUseCanvas,
    reason,
    switchMethod,
    reportPerformance,
  };
}
