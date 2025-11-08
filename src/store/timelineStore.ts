/**
 * Zustand store for timeline state management
 *
 * Manages global timeline state including:
 * - Current center date
 * - Zoom level
 * - Selected event
 * - Visible date range
 * - Loading/error states
 */

import { create } from 'zustand';
import type { TimelineEvent } from '../types/events';
import type { DateBounds } from '../utils/dateBounds';
import { clampDateToBounds } from '../utils/dateBounds';

export interface TimelineState {
  // Timeline position and zoom
  centerDate: Date;
  zoom: number; // 1 = 100%, 2 = 200%, 0.5 = 50%

  // Visible range (computed from centerDate and zoom)
  startDate: Date | null;
  endDate: Date | null;

  // Date bounds (prevents scrolling into void)
  dateBounds: DateBounds | null;

  // Selected event
  selectedEventId: string | null;
  selectedEvent: TimelineEvent | null;

  // Loading states
  isLoading: boolean;
  error: Error | null;

  // Viewport dimensions
  width: number;
  height: number;

  // Actions
  setCenterDate: (date: Date) => void;
  setZoom: (zoom: number) => void;
  setVisibleRange: (start: Date, end: Date) => void;
  setDateBounds: (bounds: DateBounds | null) => void;
  selectEvent: (event: TimelineEvent | null) => void;
  selectEventById: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  setViewport: (width: number, height: number) => void;
  scrollToDate: (date: Date) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
}

/**
 * Default state values
 */
const defaultState = {
  centerDate: new Date(),
  zoom: 1,
  startDate: null,
  endDate: null,
  dateBounds: null,
  selectedEventId: null,
  selectedEvent: null,
  isLoading: false,
  error: null,
  width: 800,
  height: 400,
};

/**
 * Timeline store
 */
export const useTimelineStore = create<TimelineState>((set) => ({
  ...defaultState,

  /**
   * Set the center date of the timeline
   * Automatically clamps to date bounds if they are set
   */
  setCenterDate: (date: Date) =>
    set((state) => {
      const clampedDate = state.dateBounds ? clampDateToBounds(date, state.dateBounds) : date;
      return {
        centerDate: clampedDate,
      };
    }),

  /**
   * Set zoom level (1 = 100%)
   */
  setZoom: (zoom: number) =>
    set({
      zoom: Math.max(0.1, Math.min(100, zoom)), // Clamp between 0.1x and 100x
    }),

  /**
   * Set the visible date range
   */
  setVisibleRange: (start: Date, end: Date) =>
    set({
      startDate: start,
      endDate: end,
    }),

  /**
   * Set the date bounds for the timeline
   * Prevents scrolling beyond event range
   */
  setDateBounds: (bounds: DateBounds | null) =>
    set((state) => {
      // If setting new bounds, clamp current centerDate to them
      if (bounds && state.centerDate) {
        return {
          dateBounds: bounds,
          centerDate: clampDateToBounds(state.centerDate, bounds),
        };
      }
      return {
        dateBounds: bounds,
      };
    }),

  /**
   * Select an event
   */
  selectEvent: (event: TimelineEvent | null) =>
    set({
      selectedEvent: event,
      selectedEventId: event?.id || null,
    }),

  /**
   * Select event by ID
   */
  selectEventById: (id: string | null) =>
    set({
      selectedEventId: id,
    }),

  /**
   * Set loading state
   */
  setLoading: (loading: boolean) =>
    set((state) => ({
      isLoading: loading,
      error: loading ? null : state.error, // Clear error when starting load
    })),

  /**
   * Set error state
   */
  setError: (error: Error | null) =>
    set({
      error,
      isLoading: false,
    }),

  /**
   * Set viewport dimensions
   */
  setViewport: (width: number, height: number) =>
    set({
      width,
      height,
    }),

  /**
   * Scroll to a specific date (sets center date)
   * Automatically clamps to date bounds if they are set
   */
  scrollToDate: (date: Date) =>
    set((state) => {
      const clampedDate = state.dateBounds ? clampDateToBounds(date, state.dateBounds) : date;
      return {
        centerDate: clampedDate,
      };
    }),

  /**
   * Zoom in (2x)
   */
  zoomIn: () =>
    set((state) => ({
      zoom: Math.min(100, state.zoom * 2),
    })),

  /**
   * Zoom out (0.5x)
   */
  zoomOut: () =>
    set((state) => ({
      zoom: Math.max(0.1, state.zoom * 0.5),
    })),

  /**
   * Reset to default state
   */
  reset: () =>
    set(defaultState),
}));

/**
 * Selector hooks for common state combinations
 */

/**
 * Get timeline position state
 */
export const useTimelinePosition = (): {
  centerDate: Date;
  zoom: number;
  scrollToDate: (date: Date) => void;
} => {
  return useTimelineStore((state) => ({
    centerDate: state.centerDate,
    zoom: state.zoom,
    scrollToDate: state.scrollToDate,
  }));
};

/**
 * Get selected event state
 */
export const useSelectedEvent = (): {
  selectedEvent: TimelineEvent | null;
  selectEvent: (event: TimelineEvent | null) => void;
} => {
  return useTimelineStore((state) => ({
    selectedEvent: state.selectedEvent,
    selectEvent: state.selectEvent,
  }));
};

/**
 * Get loading state
 */
export const useTimelineLoading = (): {
  isLoading: boolean;
  error: Error | null;
} => {
  return useTimelineStore((state) => ({
    isLoading: state.isLoading,
    error: state.error,
  }));
};
