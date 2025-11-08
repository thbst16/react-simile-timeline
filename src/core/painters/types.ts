/**
 * Painter types and interfaces
 *
 * Painters control how events are visually rendered in a band.
 * Different painter types offer different visual styles and density.
 *
 * Sprint 3: Advanced Rendering
 */

import type { ReactNode } from 'react';
import type { LayoutItem } from '../LayoutEngine';
import type { TimelineEvent } from '../../types/events';

/**
 * Theme configuration for event rendering
 */
export interface EventTheme {
  // Event colors
  defaultEventColor: string;
  defaultTextColor: string;
  defaultBorderColor: string;

  // Tape (duration) styles
  tapeHeight: number;
  tapeOpacity: number;
  tapeBorderRadius: number;

  // Icon styles
  iconSize: number;
  iconBorderWidth: number;

  // Label styles
  labelFontSize: number;
  labelFontFamily: string;
  labelOffsetY: number;

  // Track spacing
  trackHeight: number;
  trackGap: number;
  trackOffset: number;
}

/**
 * Default classic theme (matches original Simile)
 */
export const DEFAULT_EVENT_THEME: EventTheme = {
  defaultEventColor: '#3b82f6', // Blue
  defaultTextColor: '#374151', // Dark gray
  defaultBorderColor: '#ffffff', // White

  tapeHeight: 20,
  tapeOpacity: 0.8,
  tapeBorderRadius: 3,

  iconSize: 8,
  iconBorderWidth: 2,

  labelFontSize: 11,
  labelFontFamily: 'sans-serif',
  labelOffsetY: -8,

  trackHeight: 30,
  trackGap: 5,
  trackOffset: 25,
};

/**
 * Viewport information for rendering
 */
export interface Viewport {
  centerDate: Date;
  width: number;
  height: number;
  minVisibleDate: Date;
  maxVisibleDate: Date;
}

/**
 * Base interface for all event painters
 */
export interface EventPainter {
  /**
   * Get the painter type identifier
   */
  getType(): 'original' | 'compact' | 'overview';

  /**
   * Render a single event
   *
   * @param item - The layout item to render
   * @param viewport - Current viewport
   * @param theme - Visual theme
   * @param onEventClick - Callback for event clicks
   * @returns React node to render
   */
  render(
    item: LayoutItem,
    viewport: Viewport,
    theme: EventTheme,
    onEventClick?: (event: TimelineEvent) => void
  ): ReactNode;

  /**
   * Get the recommended track height for this painter
   */
  getTrackHeight(): number;

  /**
   * Get the recommended track gap for this painter
   */
  getTrackGap(): number;

  /**
   * Get the track offset (space from top for timescale)
   */
  getTrackOffset(): number;

  /**
   * Whether this painter shows event labels
   */
  showsLabels(): boolean;

  /**
   * Whether this painter shows event icons
   */
  showsIcons(): boolean;
}

/**
 * Re-export TimelineEvent type for convenience
 */
export type { TimelineEvent } from '../../types/events';
