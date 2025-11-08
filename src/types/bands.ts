/**
 * Band-related type definitions for Simile Timeline
 */

export type IntervalUnit = 'MILLISECOND' | 'SECOND' | 'MINUTE' | 'HOUR' | 'DAY' | 'WEEK' | 'MONTH' | 'YEAR' | 'DECADE' | 'CENTURY' | 'MILLENNIUM';

export type PainterType = 'original' | 'compact' | 'overview';

export interface BandConfig {
  width: string | number; // e.g., "70%" or 400
  intervalUnit: IntervalUnit;
  intervalPixels: number;

  // Optional properties
  syncWith?: number; // Index of band to sync with
  highlight?: boolean;
  painter?: PainterType;
  theme?: string;

  // Layout
  showEventText?: boolean;
  trackHeight?: number;
  trackGap?: number;
}

export interface BandInfo {
  config: BandConfig;
  index: number;
  height: number;
}
