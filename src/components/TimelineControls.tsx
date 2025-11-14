/**
 * Timeline Controls Component
 *
 * Provides zoom, pan, and reset controls for the timeline demo.
 * Shows event count and date range information.
 */

import type React from 'react';
import { useTimelineStore } from '../store/timelineStore';
import type { TimelineEvent } from '../types/events';

export interface TimelineControlsProps {
  /** Events in the timeline */
  events: TimelineEvent[];
  /** Callback to reset timeline to center on events */
  onReset?: () => void;
  /** Callback to zoom in */
  onZoomIn?: () => void;
  /** Callback to zoom out */
  onZoomOut?: () => void;
}

export const TimelineControls: React.FC<TimelineControlsProps> = ({
  events,
  onReset,
  onZoomIn,
  onZoomOut,
}) => {
  // Calculate date range
  const dateRange = (() => {
    if (events.length === 0) return null;

    const dates = events.map((e) => new Date(e.start).getTime()).filter((t) => !isNaN(t));
    if (dates.length === 0) return null;

    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));

    return {
      min: minDate.toLocaleDateString(),
      max: maxDate.toLocaleDateString(),
    };
  })();

  const { centerDate } = useTimelineStore();

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
      {/* Left side: Info */}
      <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
        <span className="font-medium">
          {events.length} {events.length === 1 ? 'event' : 'events'}
        </span>
        {dateRange && (
          <span className="hidden sm:inline">
            {dateRange.min} — {dateRange.max}
          </span>
        )}
      </div>

      {/* Right side: Controls */}
      <div className="flex items-center gap-2">
        {/* Zoom Out */}
        {onZoomOut && (
          <button
            onClick={onZoomOut}
            className="px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
            aria-label="Zoom out"
            title="Zoom out"
          >
            −
          </button>
        )}

        {/* Zoom In */}
        {onZoomIn && (
          <button
            onClick={onZoomIn}
            className="px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
            aria-label="Zoom in"
            title="Zoom in"
          >
            +
          </button>
        )}

        {/* Reset/Center */}
        {onReset && (
          <button
            onClick={onReset}
            className="px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
            aria-label="Reset view"
            title="Reset to center"
          >
            ⟲
          </button>
        )}

        {/* Current Date Display (small) */}
        <span className="hidden md:inline text-xs text-slate-500 dark:text-slate-500 ml-2">
          {centerDate.toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};
