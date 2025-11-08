/**
 * Timeline configuration and state types
 */

import type { BandConfig } from './bands';
import type { EventData } from './events';

export interface TimelineConfig {
  // Core configuration
  bands: BandConfig[];
  data?: EventData;
  dataUrl?: string;

  // Display options
  width?: string | number;
  height?: string | number;
  theme?: string;

  // Behavior
  bubbleWidth?: number;
  bubbleHeight?: number;

  // Accessibility
  ariaLabel?: string;
}

export interface Viewport {
  startDate: Date;
  endDate: Date;
  centerDate: Date;
  width: number;
  height: number;
}

export interface TimelineState {
  centerDate: Date;
  zoom: number;
  selectedEventId: string | null;
  isLoading: boolean;
  error: Error | null;
}
