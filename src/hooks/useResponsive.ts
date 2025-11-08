/**
 * useResponsive Hook
 *
 * Hook for responsive timeline behavior across different screen sizes.
 * Adapts layout, interactions, and rendering for mobile, tablet, and desktop.
 *
 * Sprint 5: Polish & Performance
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * Breakpoint definitions
 */
export const BREAKPOINTS = {
  mobile: 640,
  tablet: 1024,
  desktop: 1280,
} as const;

/**
 * Device type
 */
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

/**
 * Orientation
 */
export type Orientation = 'portrait' | 'landscape';

/**
 * Responsive Options
 */
export interface UseResponsiveOptions {
  /**
   * Custom breakpoints (overrides defaults)
   */
  breakpoints?: Partial<typeof BREAKPOINTS>;

  /**
   * Debounce delay for resize events (ms)
   * @default 150
   */
  debounceDelay?: number;

  /**
   * Callback when device type changes
   */
  onDeviceChange?: (device: DeviceType) => void;

  /**
   * Callback when orientation changes
   */
  onOrientationChange?: (orientation: Orientation) => void;
}

/**
 * Responsive Result
 */
export interface UseResponsiveResult {
  /**
   * Current device type
   */
  device: DeviceType;

  /**
   * Current orientation
   */
  orientation: Orientation;

  /**
   * Window width
   */
  width: number;

  /**
   * Window height
   */
  height: number;

  /**
   * Whether device is mobile
   */
  isMobile: boolean;

  /**
   * Whether device is tablet
   */
  isTablet: boolean;

  /**
   * Whether device is desktop
   */
  isDesktop: boolean;

  /**
   * Whether orientation is portrait
   */
  isPortrait: boolean;

  /**
   * Whether orientation is landscape
   */
  isLandscape: boolean;

  /**
   * Whether touch is supported
   */
  isTouch: boolean;

  /**
   * Device pixel ratio
   */
  pixelRatio: number;

  /**
   * Recommended settings for current device
   */
  recommendations: ResponsiveRecommendations;
}

/**
 * Recommended settings based on device
 */
export interface ResponsiveRecommendations {
  /**
   * Recommended band height
   */
  bandHeight: number;

  /**
   * Recommended track height
   */
  trackHeight: number;

  /**
   * Recommended font size
   */
  fontSize: string;

  /**
   * Recommended touch target size
   */
  touchTargetSize: number;

  /**
   * Whether to show labels
   */
  showLabels: boolean;

  /**
   * Whether to enable virtualization
   */
  enableVirtualization: boolean;

  /**
   * Virtualization threshold
   */
  virtualizationThreshold: number;

  /**
   * Whether to use Canvas rendering
   */
  useCanvas: boolean;

  /**
   * Canvas threshold
   */
  canvasThreshold: number;
}

/**
 * Detect device type from width
 */
function getDeviceType(width: number, breakpoints: typeof BREAKPOINTS): DeviceType {
  if (width < breakpoints.mobile) return 'mobile';
  if (width < breakpoints.tablet) return 'tablet';
  return 'desktop';
}

/**
 * Detect orientation from dimensions
 */
function getOrientation(width: number, height: number): Orientation {
  return height > width ? 'portrait' : 'landscape';
}

/**
 * Get recommendations based on device type
 */
function getRecommendations(device: DeviceType, isTouch: boolean): ResponsiveRecommendations {
  switch (device) {
    case 'mobile':
      return {
        bandHeight: 100,
        trackHeight: 24,
        fontSize: '14px',
        touchTargetSize: 44, // Apple HIG minimum
        showLabels: true,
        enableVirtualization: true,
        virtualizationThreshold: 50,
        useCanvas: false,
        canvasThreshold: 200,
      };

    case 'tablet':
      return {
        bandHeight: 120,
        trackHeight: 22,
        fontSize: '13px',
        touchTargetSize: isTouch ? 40 : 20,
        showLabels: true,
        enableVirtualization: true,
        virtualizationThreshold: 100,
        useCanvas: false,
        canvasThreshold: 500,
      };

    case 'desktop':
    default:
      return {
        bandHeight: 150,
        trackHeight: 20,
        fontSize: '12px',
        touchTargetSize: 20,
        showLabels: true,
        enableVirtualization: true,
        virtualizationThreshold: 200,
        useCanvas: false,
        canvasThreshold: 1000,
      };
  }
}

/**
 * Hook for responsive timeline behavior
 *
 * @example
 * const responsive = useResponsive();
 *
 * return (
 *   <Timeline
 *     bandHeight={responsive.recommendations.bandHeight}
 *     trackHeight={responsive.recommendations.trackHeight}
 *     enableTouch={responsive.isTouch}
 *   />
 * );
 */
export function useResponsive(options: UseResponsiveOptions = {}): UseResponsiveResult {
  const {
    breakpoints: customBreakpoints,
    debounceDelay = 150,
    onDeviceChange,
    onOrientationChange,
  } = options;

  const breakpoints = useMemo(
    () => ({ ...BREAKPOINTS, ...customBreakpoints }),
    [customBreakpoints]
  );

  const [dimensions, setDimensions] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  }));

  const [isTouch, setIsTouch] = useState(() => {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  });

  const [pixelRatio, setPixelRatio] = useState(() => {
    if (typeof window === 'undefined') return 1;
    return window.devicePixelRatio || 1;
  });

  // Determine device type
  const device = useMemo(
    () => getDeviceType(dimensions.width, breakpoints),
    [dimensions.width, breakpoints]
  );

  // Determine orientation
  const orientation = useMemo(
    () => getOrientation(dimensions.width, dimensions.height),
    [dimensions.width, dimensions.height]
  );

  // Get recommendations
  const recommendations = useMemo(
    () => getRecommendations(device, isTouch),
    [device, isTouch]
  );

  // Handle resize
  const handleResize = useCallback(() => {
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });
    setPixelRatio(window.devicePixelRatio || 1);
  }, []);

  // Set up resize listener with debounce
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timeoutId: number | null = null;

    const debouncedResize = () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }

      timeoutId = window.setTimeout(() => {
        handleResize();
      }, debounceDelay);
    };

    window.addEventListener('resize', debouncedResize);
    window.addEventListener('orientationchange', debouncedResize);

    // Detect touch capability changes
    const handleTouchStart = () => setIsTouch(true);
    window.addEventListener('touchstart', handleTouchStart, { once: true });

    return () => {
      window.removeEventListener('resize', debouncedResize);
      window.removeEventListener('orientationchange', debouncedResize);
      window.removeEventListener('touchstart', handleTouchStart);

      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [handleResize, debounceDelay]);

  // Notify when device changes
  useEffect(() => {
    onDeviceChange?.(device);
  }, [device, onDeviceChange]);

  // Notify when orientation changes
  useEffect(() => {
    onOrientationChange?.(orientation);
  }, [orientation, onOrientationChange]);

  return {
    device,
    orientation,
    width: dimensions.width,
    height: dimensions.height,
    isMobile: device === 'mobile',
    isTablet: device === 'tablet',
    isDesktop: device === 'desktop',
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape',
    isTouch,
    pixelRatio,
    recommendations,
  };
}
