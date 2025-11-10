/**
 * useCanvasRenderer Hook
 *
 * Hook for high-performance Canvas-based event rendering.
 * Used as a fallback when event count exceeds SVG/DOM performance threshold.
 *
 * Sprint 5: Polish & Performance
 */

import { useRef, useEffect, useCallback } from 'react';
import type { TimelineEvent } from '../types/events';
import type { TimelineTheme } from '../types/theme';

/**
 * Canvas Renderer Options
 */
export interface UseCanvasRendererOptions {
  /**
   * Canvas element reference
   */
  canvasRef: React.RefObject<HTMLCanvasElement>;

  /**
   * Events to render
   */
  events: TimelineEvent[];

  /**
   * Theme for styling
   */
  theme: TimelineTheme;

  /**
   * Viewport start position (pixels)
   */
  viewportStart: number;

  /**
   * Viewport end position (pixels)
   */
  viewportEnd: number;

  /**
   * Canvas width
   */
  width: number;

  /**
   * Canvas height
   */
  height: number;

  /**
   * Function to get event start position in pixels
   */
  getEventStart: (event: TimelineEvent) => number;

  /**
   * Function to get event end position in pixels
   */
  getEventEnd: (event: TimelineEvent) => number;

  /**
   * Function to get event track/lane (for vertical positioning)
   */
  getEventTrack: (event: TimelineEvent) => number;

  /**
   * Track height in pixels
   * @default 20
   */
  trackHeight?: number;

  /**
   * Selected event ID
   */
  selectedEventId?: string | null;

  /**
   * Hovered event ID
   */
  hoveredEventId?: string | null;

  /**
   * Enable high DPI rendering
   * @default true
   */
  enableHiDPI?: boolean;

  /**
   * Rendering quality
   * @default 'high'
   */
  quality?: 'low' | 'medium' | 'high';
}

/**
 * Canvas Renderer Result
 */
export interface UseCanvasRendererResult {
  /**
   * Render the canvas
   */
  render: () => void;

  /**
   * Clear the canvas
   */
  clear: () => void;

  /**
   * Get event at pixel coordinates
   */
  getEventAtPoint: (x: number, y: number) => TimelineEvent | null;

  /**
   * Rendering statistics
   */
  stats: CanvasRenderStats;
}

/**
 * Canvas Rendering Statistics
 */
export interface CanvasRenderStats {
  /**
   * Last render time (ms)
   */
  lastRenderTime: number;

  /**
   * Number of events rendered
   */
  eventsRendered: number;

  /**
   * Frames per second
   */
  fps: number;
}

/**
 * Event rendering info for hit testing
 */
interface EventRenderInfo {
  event: TimelineEvent;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Hook for Canvas-based event rendering
 *
 * @example
 * const canvasRef = useRef<HTMLCanvasElement>(null);
 * const renderer = useCanvasRenderer({
 *   canvasRef,
 *   events: visibleEvents,
 *   theme,
 *   viewportStart: 0,
 *   viewportEnd: 1000,
 *   width: 1000,
 *   height: 400,
 *   getEventStart: (e) => dateToPixel(new Date(e.start)),
 *   getEventEnd: (e) => e.end ? dateToPixel(new Date(e.end)) : dateToPixel(new Date(e.start)),
 *   getEventTrack: (e) => e.track || 0,
 * });
 *
 * // Render is called automatically, but you can also trigger manually
 * renderer.render();
 */
export function useCanvasRenderer(options: UseCanvasRendererOptions): UseCanvasRendererResult {
  const {
    canvasRef,
    events,
    theme,
    viewportStart,
    width,
    height,
    getEventStart,
    getEventEnd,
    getEventTrack,
    trackHeight = 20,
    selectedEventId,
    hoveredEventId,
    enableHiDPI = true,
    quality = 'high',
  } = options;

  const renderInfoRef = useRef<EventRenderInfo[]>([]);
  const statsRef = useRef<CanvasRenderStats>({
    lastRenderTime: 0,
    eventsRendered: 0,
    fps: 0,
  });
  const lastFrameTimeRef = useRef<number>(0);

  /**
   * Get the canvas context with proper scaling
   */
  const getContext = useCallback((): CanvasRenderingContext2D | null => {
    if (!canvasRef.current) return null;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Set up high DPI rendering
    if (enableHiDPI) {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    } else {
      canvas.width = width;
      canvas.height = height;
    }

    return ctx;
  }, [canvasRef, width, height, enableHiDPI]);

  /**
   * Clear the canvas
   */
  const clear = useCallback(() => {
    const ctx = getContext();
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);
    renderInfoRef.current = [];
  }, [getContext, width, height]);

  /**
   * Draw a tape event (duration event)
   */
  const drawTapeEvent = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      event: TimelineEvent,
      x: number,
      y: number,
      eventWidth: number
    ) => {
      const isSelected = event.id === selectedEventId;
      const isHovered = event.id === hoveredEventId;

      // Determine color
      let fillColor = event.color || theme.colors.event.tape;
      if (isSelected) {
        fillColor = theme.colors.event.tapeSelected;
      } else if (isHovered) {
        fillColor = theme.colors.event.tapeHover;
      }

      // Draw tape rectangle
      ctx.fillStyle = fillColor;
      ctx.fillRect(x, y, eventWidth, theme.event.tapeHeight);

      // Draw border if quality is high
      if (quality === 'high') {
        ctx.strokeStyle = theme.colors.band.border;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, eventWidth, theme.event.tapeHeight);
      }

      // Draw label if space available and quality is medium/high
      if (quality !== 'low' && eventWidth > 30 && event.title) {
        ctx.fillStyle = theme.colors.event.label;
        ctx.font = `${theme.typography.fontWeight.normal} ${theme.typography.fontSize.sm} ${theme.typography.fontFamily}`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        const textX = x + theme.event.labelPadding;
        const textY = y + theme.event.tapeHeight / 2;

        // Clip text to fit
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, eventWidth, theme.event.tapeHeight);
        ctx.clip();
        ctx.fillText(event.title, textX, textY);
        ctx.restore();
      }
    },
    [theme, selectedEventId, hoveredEventId, quality]
  );

  /**
   * Draw a point event (instant event)
   */
  const drawPointEvent = useCallback(
    (ctx: CanvasRenderingContext2D, event: TimelineEvent, x: number, y: number) => {
      const isSelected = event.id === selectedEventId;
      const isHovered = event.id === hoveredEventId;

      // Determine color
      let fillColor = event.color || theme.colors.event.point;
      if (isSelected) {
        fillColor = theme.colors.event.pointSelected;
      } else if (isHovered) {
        fillColor = theme.colors.event.pointHover;
      }

      const size = theme.event.pointSize;
      const centerY = y + trackHeight / 2;

      // Draw point (circle)
      ctx.fillStyle = fillColor;
      ctx.beginPath();
      ctx.arc(x, centerY, size / 2, 0, Math.PI * 2);
      ctx.fill();

      // Draw border if quality is high
      if (quality === 'high') {
        ctx.strokeStyle = theme.colors.band.border;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw label if quality is medium/high
      if (quality !== 'low' && event.title) {
        ctx.fillStyle = theme.colors.event.label;
        ctx.font = `${theme.typography.fontWeight.normal} ${theme.typography.fontSize.sm} ${theme.typography.fontFamily}`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        const textX = x + size + theme.event.labelPadding;
        const textY = centerY;

        ctx.fillText(event.title, textX, textY);
      }
    },
    [theme, selectedEventId, hoveredEventId, quality, trackHeight]
  );

  /**
   * Render all events
   */
  const render = useCallback(() => {
    const startTime = performance.now();
    const ctx = getContext();
    if (!ctx) return;

    // Clear previous render
    clear();

    const renderInfo: EventRenderInfo[] = [];
    let renderedCount = 0;

    // Draw events
    events.forEach((event) => {
      const startPixel = getEventStart(event);
      const endPixel = getEventEnd(event);
      const track = getEventTrack(event);

      // Calculate position and size
      const x = startPixel - viewportStart;
      const y = track * trackHeight;
      const eventWidth = Math.max(endPixel - startPixel, theme.event.minTapeWidth);

      // Skip if outside viewport
      if (x + eventWidth < 0 || x > width) return;
      if (y + trackHeight < 0 || y > height) return;

      // Determine if tape or point event
      const isTape = event.isDuration || endPixel - startPixel > 1;

      // Draw event
      if (isTape) {
        drawTapeEvent(ctx, event, x, y, eventWidth);
      } else {
        drawPointEvent(ctx, event, x, y);
      }

      // Store render info for hit testing
      renderInfo.push({
        event,
        x,
        y,
        width: isTape ? eventWidth : theme.event.pointSize * 2,
        height: trackHeight,
      });

      renderedCount++;
    });

    renderInfoRef.current = renderInfo;

    // Update stats
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    const frameDelta = endTime - lastFrameTimeRef.current;
    const fps = frameDelta > 0 ? Math.round(1000 / frameDelta) : 0;

    statsRef.current = {
      lastRenderTime: renderTime,
      eventsRendered: renderedCount,
      fps,
    };

    lastFrameTimeRef.current = endTime;
  }, [
    getContext,
    clear,
    events,
    getEventStart,
    getEventEnd,
    getEventTrack,
    viewportStart,
    width,
    height,
    trackHeight,
    theme,
    drawTapeEvent,
    drawPointEvent,
  ]);

  /**
   * Get event at pixel coordinates (for hit testing)
   */
  const getEventAtPoint = useCallback((x: number, y: number): TimelineEvent | null => {
    // Check in reverse order (top events first)
    for (let i = renderInfoRef.current.length - 1; i >= 0; i--) {
      const info = renderInfoRef.current[i];
      if (!info) continue;

      if (x >= info.x && x <= info.x + info.width && y >= info.y && y <= info.y + info.height) {
        return info.event;
      }
    }
    return null;
  }, []);

  // Auto-render when dependencies change
  useEffect(() => {
    render();
  }, [render]);

  return {
    render,
    clear,
    getEventAtPoint,
    stats: statsRef.current,
  };
}
