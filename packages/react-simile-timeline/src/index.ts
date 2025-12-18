/**
 * react-simile-timeline
 * A modern React implementation of the MIT SIMILE Timeline visualization component
 */

// Main component
export { Timeline } from './components/Timeline';

// Sub-components (for advanced usage)
export {
  TimelineProvider,
  DEFAULT_BANDS,
  useTimelineContext,
  Band,
  TimeScale,
  EventTrack,
  EventMarker,
  OverviewMarkers,
  EventPopup,
} from './components';

// Component types
export type {
  TimelineProviderProps,
  TimelineState,
  TimelineActions,
  TimelineContextValue,
  BandProps,
  TimeScaleProps,
  EventTrackProps,
  EventMarkerProps,
  OverviewMarkersProps,
  EventPopupProps,
} from './components';

// Core types
export type {
  TimelineProps,
  TimelineEvent,
  TimelineData,
  BandConfig,
  HotZone,
  Theme,
} from './types';

// Hooks
export { usePan } from './hooks';
export type { UsePanOptions, UsePanResult } from './hooks';

// Utilities
export {
  parseDate,
  formatDate,
  dateToPixel,
  pixelToDate,
  getVisibleRange,
  getMedianDate,
  TIME_UNITS,
  getScaleConfig,
  alignToUnit,
  addInterval,
  generateTicks,
  calculateLayout,
  assignTracks,
  filterVisibleEvents,
  estimateLabelWidth,
  getTrackCount,
} from './utils';

export type {
  TimeUnit,
  ScaleConfig,
  ScaleTick,
  LayoutEvent,
} from './utils';

// Styles (consumers can import this directly if needed)
import './styles/timeline.css';
