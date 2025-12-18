/**
 * Core types for react-simile-timeline
 * These types are designed for 100% compatibility with legacy Simile Timeline JSON
 */

/**
 * A single timeline event
 * Compatible with Simile Timeline JSON event format
 */
export interface TimelineEvent {
  /** Start date/time (ISO 8601 or parseable date string) - REQUIRED */
  start: string;
  /** Display title of the event - REQUIRED */
  title: string;
  /** End date/time for duration events */
  end?: string;
  /** Longer description, can include HTML */
  description?: string;
  /** Explicitly mark as duration event (also inferred if `end` present) */
  isDuration?: boolean;
  /** Alias for isDuration (legacy compatibility) */
  durationEvent?: boolean;
  /** Background color for event marker/tape (hex or CSS color) */
  color?: string;
  /** Text color for event label */
  textColor?: string;
  /** URL to custom icon image */
  icon?: string;
  /** URL to event image */
  image?: string;
  /** URL for "more info" link */
  link?: string;
  /** Caption text (shown on hover) */
  caption?: string;
  /** CSS class name for custom styling */
  classname?: string;
  /** URL to pattern image for tape fill */
  tapeImage?: string;
  /** CSS background-repeat value for tape */
  tapeRepeat?: string;
  /** Track number for positioning */
  trackNum?: number;
}

/**
 * Timeline data structure
 * Compatible with Simile Timeline JSON root format
 */
export interface TimelineData {
  /** Date/time format hint */
  dateTimeFormat?: 'iso8601' | 'Gregorian' | string;
  /** Wiki URL for event links */
  wikiURL?: string;
  /** Wiki section for event links */
  wikiSection?: string;
  /** Array of timeline events */
  events: TimelineEvent[];
}

/**
 * Band configuration for timeline visualization
 */
export interface BandConfig {
  /** Unique identifier for the band */
  id?: string;
  /** Height of the band (CSS value, e.g., '200px', '40%') */
  height?: string;
  /** Time unit for this band's scale */
  timeUnit?: 'millisecond' | 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year' | 'decade' | 'century';
  /** Interval count for the time unit */
  intervalPixels?: number;
  /** Whether this is an overview band (simplified rendering) */
  overview?: boolean;
  /** ID of the band to synchronize with */
  syncWith?: string;
  /** Whether to show event labels */
  showEventLabels?: boolean;
  /** Track height for event stacking */
  trackHeight?: number;
  /** Gap between tracks */
  trackGap?: number;
}

/**
 * Hot zone configuration for highlighted time periods
 */
export interface HotZone {
  /** Start date of the hot zone */
  start: string;
  /** End date of the hot zone */
  end: string;
  /** Display unit for magnification */
  unit?: string;
  /** Magnification factor */
  magnify?: number;
  /** Background color for the zone */
  color?: string;
  /** Text annotation for the zone */
  annotation?: string;
}

/**
 * Theme configuration for timeline styling
 */
export interface Theme {
  /** Theme name identifier */
  name: string;
  /** Background color of the timeline */
  backgroundColor?: string;
  /** Default event color */
  eventColor?: string;
  /** Default event text color */
  eventTextColor?: string;
  /** Duration event tape color */
  tapeColor?: string;
  /** Font family for labels */
  fontFamily?: string;
  /** Font size for event labels */
  fontSize?: string;
  /** Color for time scale labels */
  scaleColor?: string;
  /** Color for grid lines */
  gridColor?: string;
  /** Hot zone default color */
  hotZoneColor?: string;
}

/**
 * Props for the Timeline component
 */
export interface TimelineProps {
  /** Timeline event data - either inline or URL */
  data?: TimelineData;
  /** URL to fetch timeline data from */
  dataUrl?: string;
  /** Band configurations */
  bands?: BandConfig[];
  /** Hot zone configurations */
  hotZones?: HotZone[];
  /** Theme configuration or theme name */
  theme?: Theme | 'classic' | 'dark';
  /** Initial center date */
  centerDate?: string | Date;
  /** Width of the timeline container */
  width?: string | number;
  /** Height of the timeline container */
  height?: string | number;
  /** Callback when an event is clicked */
  onEventClick?: (event: TimelineEvent) => void;
  /** Callback when an event is hovered */
  onEventHover?: (event: TimelineEvent | null) => void;
  /** Callback when the timeline is scrolled/panned */
  onScroll?: (centerDate: Date) => void;
  /** Callback when zoom level changes */
  onZoom?: (zoomLevel: number) => void;
  /** CSS class name for the container */
  className?: string;
  /** Inline styles for the container */
  style?: React.CSSProperties;
}
