/**
 * PerformanceOverlay Component
 *
 * Displays real-time performance metrics including FPS, render time,
 * and memory usage. Useful for development and performance testing.
 *
 * Sprint 7: Complete Sprint 5 Features
 */

import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';
import type { UsePerformanceMonitorOptions } from '../hooks/usePerformanceMonitor';

/**
 * Performance Overlay Props
 */
export interface PerformanceOverlayProps {
  /**
   * Show/hide the overlay
   * @default true
   */
  visible?: boolean;

  /**
   * Position of the overlay
   * @default 'top-right'
   */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

  /**
   * Number of events being rendered
   */
  eventCount?: number;

  /**
   * Whether virtualization is active
   */
  isVirtualized?: boolean;

  /**
   * Rendering method
   */
  renderMethod?: 'dom' | 'canvas';

  /**
   * Additional custom metrics to display
   */
  customMetrics?: Record<string, string | number>;

  /**
   * Performance monitor options
   */
  monitorOptions?: UsePerformanceMonitorOptions;

  /**
   * Compact mode (smaller display)
   * @default false
   */
  compact?: boolean;
}

/**
 * Get color based on performance rating
 */
function getRatingColor(rating: 'excellent' | 'good' | 'fair' | 'poor'): string {
  switch (rating) {
    case 'excellent':
      return 'text-green-600 dark:text-green-400';
    case 'good':
      return 'text-blue-600 dark:text-blue-400';
    case 'fair':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'poor':
      return 'text-red-600 dark:text-red-400';
  }
}

/**
 * Get position classes
 */
function getPositionClasses(position: PerformanceOverlayProps['position']): string {
  switch (position) {
    case 'top-left':
      return 'top-4 left-4';
    case 'top-right':
      return 'top-4 right-4';
    case 'bottom-left':
      return 'bottom-4 left-4';
    case 'bottom-right':
      return 'bottom-4 right-4';
    default:
      return 'top-4 right-4';
  }
}

/**
 * Performance Overlay Component
 *
 * @example
 * <PerformanceOverlay
 *   visible={showMetrics}
 *   eventCount={events.length}
 *   isVirtualized={virtualization.isVirtualized}
 *   renderMethod={renderer.method}
 * />
 */
export function PerformanceOverlay({
  visible = true,
  position = 'top-right',
  eventCount,
  isVirtualized,
  renderMethod,
  customMetrics,
  monitorOptions,
  compact = false,
}: PerformanceOverlayProps): JSX.Element | null {
  const perf = usePerformanceMonitor(monitorOptions);

  if (!visible) {
    return null;
  }

  const { metrics } = perf;
  const ratingColor = getRatingColor(metrics.rating);

  if (compact) {
    return (
      <div
        className={`fixed ${getPositionClasses(position)} z-50
          bg-black/80 dark:bg-white/10 backdrop-blur-sm
          text-white dark:text-gray-200
          px-3 py-2 rounded-lg shadow-lg
          font-mono text-xs pointer-events-none select-none`}
      >
        <div className="flex items-center gap-3">
          <span className={ratingColor}>{metrics.fps} FPS</span>
          {eventCount !== undefined && <span className="text-gray-300">{eventCount} events</span>}
          {renderMethod && (
            <span className="text-gray-400 uppercase text-[10px]">{renderMethod}</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`fixed ${getPositionClasses(position)} z-50
        bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm
        border border-gray-300 dark:border-gray-700
        rounded-lg shadow-lg
        font-mono text-xs pointer-events-none select-none
        min-w-[200px]`}
    >
      {/* Header */}
      <div className="px-3 py-2 border-b border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 rounded-t-lg">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-700 dark:text-gray-300">Performance</span>
          <span className={`font-bold ${ratingColor} uppercase text-[10px]`}>{metrics.rating}</span>
        </div>
      </div>

      {/* Metrics */}
      <div className="px-3 py-2 space-y-1">
        {/* FPS */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">FPS:</span>
          <span className={`font-bold ${ratingColor}`}>{metrics.fps}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">Avg FPS:</span>
          <span className="text-gray-900 dark:text-gray-100">{metrics.avgFps}</span>
        </div>

        {/* Render Time */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">Render:</span>
          <span className="text-gray-900 dark:text-gray-100">
            {metrics.renderTime.toFixed(2)}ms
          </span>
        </div>

        {/* Event Count */}
        {eventCount !== undefined && (
          <div className="flex justify-between items-center pt-1 border-t border-gray-200 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Events:</span>
            <span className="text-gray-900 dark:text-gray-100">{eventCount.toLocaleString()}</span>
          </div>
        )}

        {/* Virtualization */}
        {isVirtualized !== undefined && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Virtual:</span>
            <span
              className={isVirtualized ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}
            >
              {isVirtualized ? 'ON' : 'OFF'}
            </span>
          </div>
        )}

        {/* Render Method */}
        {renderMethod && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Renderer:</span>
            <span className="text-gray-900 dark:text-gray-100 uppercase">{renderMethod}</span>
          </div>
        )}

        {/* Custom Metrics */}
        {customMetrics && Object.keys(customMetrics).length > 0 && (
          <>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-1 mt-1" />
            {Object.entries(customMetrics).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">{key}:</span>
                <span className="text-gray-900 dark:text-gray-100">{value}</span>
              </div>
            ))}
          </>
        )}

        {/* Frame Count */}
        <div className="flex justify-between items-center pt-1 border-t border-gray-200 dark:border-gray-700 text-[10px] text-gray-500">
          <span>Frames:</span>
          <span>{metrics.frameCount.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Simple FPS Counter (minimal display)
 */
export interface FPSCounterProps {
  visible?: boolean;
  position?: PerformanceOverlayProps['position'];
  targetFps?: number;
}

export function FPSCounter({
  visible = true,
  position = 'top-right',
  targetFps = 60,
}: FPSCounterProps): JSX.Element | null {
  const perf = usePerformanceMonitor({ targetFps });

  if (!visible) {
    return null;
  }

  const { metrics } = perf;
  const ratingColor = getRatingColor(metrics.rating);

  return (
    <div
      className={`fixed ${getPositionClasses(position)} z-50
        bg-black/80 dark:bg-white/10 backdrop-blur-sm
        text-white dark:text-gray-200
        px-3 py-1.5 rounded-md shadow-lg
        font-mono text-sm font-bold pointer-events-none select-none`}
    >
      <span className={ratingColor}>{metrics.fps}</span>
      <span className="text-gray-400 ml-1 text-xs">FPS</span>
    </div>
  );
}
