import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  type ReactNode,
} from 'react';
import type { TimelineEvent, BandConfig, HotZone } from '../types';
import { getVisibleRange, getMedianDate, TIME_UNITS, type TimeUnit, parseDate } from '../utils/dateUtils';

/**
 * Click position for popup positioning
 */
export interface ClickPosition {
  x: number;
  y: number;
}

/**
 * Timeline state interface
 */
export interface TimelineState {
  /** Current center date of the timeline viewport */
  centerDate: Date;
  /** Pixels per millisecond (zoom level) */
  pixelsPerMillisecond: number;
  /** Width of the timeline viewport in pixels */
  viewportWidth: number;
  /** Currently selected event (shown in popup) */
  selectedEvent: TimelineEvent | null;
  /** Position where event was clicked (for popup positioning) */
  clickPosition: ClickPosition | null;
  /** Currently hovered event */
  hoveredEvent: TimelineEvent | null;
  /** Visible date range */
  visibleRange: { start: Date; end: Date };
  /** Whether currently panning */
  isPanning: boolean;
  /** Current zoom level (1.0 = default, >1 = zoomed in, <1 = zoomed out) */
  zoomLevel: number;
}

/**
 * Timeline actions interface
 */
export interface TimelineActions {
  /** Set the center date */
  setCenterDate: (date: Date) => void;
  /** Pan by milliseconds (positive = forward in time) */
  pan: (deltaMs: number) => void;
  /** Set the selected event with optional click position for popup */
  setSelectedEvent: (event: TimelineEvent | null, clickPosition?: ClickPosition) => void;
  /** Set the hovered event */
  setHoveredEvent: (event: TimelineEvent | null) => void;
  /** Set panning state */
  setIsPanning: (isPanning: boolean) => void;
  /** Set viewport width */
  setViewportWidth: (width: number) => void;
  /** Zoom by a factor (>1 = zoom in, <1 = zoom out) */
  zoom: (factor: number) => void;
}

/**
 * Combined context value
 */
export interface TimelineContextValue {
  state: TimelineState;
  actions: TimelineActions;
  events: TimelineEvent[];
  bands: BandConfig[];
  hotZones: HotZone[];
}

const TimelineContext = createContext<TimelineContextValue | null>(null);

/**
 * Calculate appropriate time unit based on data date range
 * Returns a unit that will show ~10-20 intervals in the viewport
 */
function getAppropriateTimeUnit(events: TimelineEvent[], viewportWidth: number = 800): { detail: TimeUnit; overview: TimeUnit; detailIntervalPixels: number; overviewIntervalPixels: number } {
  if (events.length === 0) {
    return { detail: 'day', overview: 'month', detailIntervalPixels: 100, overviewIntervalPixels: 100 };
  }

  // Get date range from events
  const timestamps = events.map(e => {
    try {
      return parseDate(e.start).getTime();
    } catch {
      return null;
    }
  }).filter((t): t is number => t !== null);

  if (timestamps.length === 0) {
    return { detail: 'day', overview: 'month', detailIntervalPixels: 100, overviewIntervalPixels: 100 };
  }

  const minTime = Math.min(...timestamps);
  const maxTime = Math.max(...timestamps);
  const rangeMs = maxTime - minTime;

  const rangeYears = rangeMs / TIME_UNITS.year;
  const rangeMonths = rangeMs / TIME_UNITS.month;
  const rangeDays = rangeMs / TIME_UNITS.day;

  let detail: TimeUnit;
  let overview: TimeUnit;
  let detailIntervalPixels: number;
  let overviewIntervalPixels: number;

  if (rangeYears > 50) {
    // Multi-decade timeline: show decades in detail, centuries in overview
    detail = 'decade';
    overview = 'century';
    detailIntervalPixels = Math.max(60, viewportWidth / (rangeYears / 10));
    overviewIntervalPixels = Math.max(40, viewportWidth / (rangeYears / 50));
  } else if (rangeYears > 10) {
    // Decade+ timeline: show years in detail, decades in overview
    detail = 'year';
    overview = 'decade';
    detailIntervalPixels = Math.max(50, viewportWidth / rangeYears);
    overviewIntervalPixels = Math.max(40, viewportWidth / (rangeYears / 5));
  } else if (rangeYears > 2) {
    // Multi-year timeline: show months in detail, years in overview
    detail = 'month';
    overview = 'year';
    detailIntervalPixels = Math.max(40, viewportWidth / rangeMonths);
    overviewIntervalPixels = Math.max(50, viewportWidth / rangeYears);
  } else if (rangeMonths > 3) {
    // Multi-month timeline: show weeks in detail, months in overview
    detail = 'week';
    overview = 'month';
    detailIntervalPixels = Math.max(60, viewportWidth / (rangeDays / 7));
    overviewIntervalPixels = Math.max(50, viewportWidth / rangeMonths);
  } else if (rangeDays > 7) {
    // Week+ timeline: show days in detail, weeks in overview
    detail = 'day';
    overview = 'week';
    detailIntervalPixels = Math.max(80, viewportWidth / rangeDays);
    overviewIntervalPixels = Math.max(60, viewportWidth / (rangeDays / 7));
  } else {
    // Short timeline: show hours in detail, days in overview
    detail = 'hour';
    overview = 'day';
    detailIntervalPixels = 100;
    overviewIntervalPixels = 100;
  }

  return { detail, overview, detailIntervalPixels, overviewIntervalPixels };
}

/**
 * Generate default band configuration based on event data
 */
function generateDefaultBands(events: TimelineEvent[]): BandConfig[] {
  const { detail, overview, detailIntervalPixels, overviewIntervalPixels } = getAppropriateTimeUnit(events);

  return [
    {
      id: 'detail',
      height: '70%',
      timeUnit: detail,
      intervalPixels: detailIntervalPixels,
      overview: false,
      showEventLabels: true,
      trackHeight: 24,
      trackGap: 4,
    },
    {
      id: 'overview',
      height: '30%',
      timeUnit: overview,
      intervalPixels: overviewIntervalPixels,
      overview: true,
      syncWith: 'detail',
      showEventLabels: false,
    },
  ];
}

/**
 * Default band configuration for two-band layout (fallback)
 */
export const DEFAULT_BANDS: BandConfig[] = [
  {
    id: 'detail',
    height: '70%',
    timeUnit: 'month',
    intervalPixels: 100,
    overview: false,
    showEventLabels: true,
    trackHeight: 24,
    trackGap: 4,
  },
  {
    id: 'overview',
    height: '30%',
    timeUnit: 'year',
    intervalPixels: 100,
    overview: true,
    syncWith: 'detail',
    showEventLabels: false,
  },
];

/**
 * Calculate pixels per millisecond from band config
 */
function calculatePixelsPerMs(band: BandConfig): number {
  const timeUnit = band.timeUnit || 'day';
  const intervalPixels = band.intervalPixels || 100;
  const unitMs = TIME_UNITS[timeUnit as TimeUnit] || TIME_UNITS.day;
  return intervalPixels / unitMs;
}

export interface TimelineProviderProps {
  children: ReactNode;
  events: TimelineEvent[];
  bands?: BandConfig[];
  hotZones?: HotZone[];
  initialCenterDate?: Date | string;
  onScroll?: (centerDate: Date) => void;
  onEventClick?: (event: TimelineEvent) => void;
  onEventHover?: (event: TimelineEvent | null) => void;
}

/**
 * Timeline context provider
 * Manages shared state for all timeline bands
 */
export function TimelineProvider({
  children,
  events,
  bands: bandsProp,
  hotZones: hotZonesProp,
  initialCenterDate,
  onScroll,
  onEventClick,
  onEventHover,
}: TimelineProviderProps) {
  // Generate appropriate bands based on event data if not provided
  const bands = useMemo(() => {
    if (bandsProp && bandsProp.length > 0) {
      return bandsProp;
    }
    return generateDefaultBands(events);
  }, [bandsProp, events]);

  // Get primary band (first non-overview band, or first band)
  const primaryBand = bands.find(b => !b.overview) || bands[0];
  const pixelsPerMs = calculatePixelsPerMs(primaryBand);

  // Helper to compute center date from props
  const computeCenterDate = useCallback(() => {
    if (initialCenterDate) {
      return initialCenterDate instanceof Date
        ? initialCenterDate
        : new Date(initialCenterDate);
    }
    return getMedianDate(events);
  }, [initialCenterDate, events]);

  // State - use lazy initialization for centerDate
  const [centerDate, setCenterDateState] = useState<Date>(() => {
    if (initialCenterDate) {
      return initialCenterDate instanceof Date
        ? initialCenterDate
        : new Date(initialCenterDate);
    }
    return getMedianDate(events);
  });
  const [viewportWidth, setViewportWidth] = useState<number>(800);
  const [selectedEvent, setSelectedEventState] = useState<TimelineEvent | null>(null);
  const [clickPosition, setClickPosition] = useState<ClickPosition | null>(null);
  const [hoveredEvent, setHoveredEventState] = useState<TimelineEvent | null>(null);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);

  // Min/max zoom constraints
  const MIN_ZOOM = 0.1;
  const MAX_ZOOM = 10.0;

  // Track if first render has completed
  const isFirstRenderRef = useRef(true);

  // Sync centerDate when initialCenterDate prop changes (not on first render)
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }
    // Only update if initialCenterDate is explicitly provided
    if (initialCenterDate !== undefined) {
      setCenterDateState(computeCenterDate());
    }
  }, [initialCenterDate, computeCenterDate]);

  // Callbacks ref to avoid stale closures
  const callbacksRef = useRef({ onScroll, onEventClick, onEventHover });
  useEffect(() => {
    callbacksRef.current = { onScroll, onEventClick, onEventHover };
  }, [onScroll, onEventClick, onEventHover]);

  // Actions
  const setCenterDate = useCallback((date: Date) => {
    setCenterDateState(date);
    callbacksRef.current.onScroll?.(date);
  }, []);

  const pan = useCallback((deltaMs: number) => {
    setCenterDateState(prev => {
      const newDate = new Date(prev.getTime() + deltaMs);
      callbacksRef.current.onScroll?.(newDate);
      return newDate;
    });
  }, []);

  const setSelectedEvent = useCallback((event: TimelineEvent | null, position?: ClickPosition) => {
    setSelectedEventState(event);
    setClickPosition(event ? (position || null) : null);
    if (event) {
      callbacksRef.current.onEventClick?.(event);
    }
  }, []);

  const setHoveredEvent = useCallback((event: TimelineEvent | null) => {
    setHoveredEventState(event);
    callbacksRef.current.onEventHover?.(event);
  }, []);

  // Zoom action - factor > 1 zooms in, < 1 zooms out
  const zoom = useCallback((factor: number) => {
    setZoomLevel(prev => {
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev * factor));
      return newZoom;
    });
  }, []);

  // Effective pixels per ms including zoom
  const effectivePixelsPerMs = useMemo(
    () => pixelsPerMs * zoomLevel,
    [pixelsPerMs, zoomLevel]
  );

  // Computed visible range
  const visibleRange = useMemo(
    () => getVisibleRange(centerDate, viewportWidth, effectivePixelsPerMs),
    [centerDate, viewportWidth, effectivePixelsPerMs]
  );

  // Build context value
  const state: TimelineState = useMemo(() => ({
    centerDate,
    pixelsPerMillisecond: effectivePixelsPerMs,
    viewportWidth,
    selectedEvent,
    clickPosition,
    hoveredEvent,
    visibleRange,
    isPanning,
    zoomLevel,
  }), [centerDate, effectivePixelsPerMs, viewportWidth, selectedEvent, clickPosition, hoveredEvent, visibleRange, isPanning, zoomLevel]);

  const actions: TimelineActions = useMemo(() => ({
    setCenterDate,
    pan,
    setSelectedEvent,
    setHoveredEvent,
    setIsPanning,
    setViewportWidth,
    zoom,
  }), [setCenterDate, pan, setSelectedEvent, setHoveredEvent, zoom]);

  // Hot zones with default empty array
  const hotZones = useMemo(() => hotZonesProp || [], [hotZonesProp]);

  const contextValue: TimelineContextValue = useMemo(() => ({
    state,
    actions,
    events,
    bands,
    hotZones,
  }), [state, actions, events, bands, hotZones]);

  return (
    <TimelineContext.Provider value={contextValue}>
      {children}
    </TimelineContext.Provider>
  );
}

/**
 * Hook to access timeline context
 * Must be used within a TimelineProvider
 */
export function useTimelineContext(): TimelineContextValue {
  const context = useContext(TimelineContext);
  if (!context) {
    throw new Error('useTimelineContext must be used within a TimelineProvider');
  }
  return context;
}
