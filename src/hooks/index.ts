/**
 * Timeline Hooks
 *
 * Custom React hooks for timeline interactions and state management.
 * Sprint 4: Interactions
 */

export { useTimelineScroll } from './useTimelineScroll';
export type { UseTimelineScrollOptions, UseTimelineScrollResult } from './useTimelineScroll';

export { usePanZoom } from './usePanZoom';
export type { UsePanZoomOptions, UsePanZoomResult } from './usePanZoom';

export { useBandSync } from './useBandSync';
export type { BandSyncConfig, UseBandSyncOptions, UseBandSyncResult } from './useBandSync';

export { useKeyboardNav } from './useKeyboardNav';
export type { KeyboardShortcut, UseKeyboardNavOptions, UseKeyboardNavResult } from './useKeyboardNav';

export { useEventFilter } from './useEventFilter';
export type { UseEventFilterOptions, UseEventFilterResult } from './useEventFilter';

export { useAnimatedTransition, useSpring, easings } from './useAnimatedTransition';
export type {
  UseAnimatedTransitionOptions,
  UseAnimatedTransitionResult,
  UseSpringOptions,
  UseSpringResult,
  EasingFunction,
} from './useAnimatedTransition';

export {
  useTheme,
  useThemeColors,
  useThemeTypography,
  useThemeToggle,
  ThemeProvider,
  ThemeContext,
} from './useTheme';
export type { ThemeProviderProps } from './useTheme';

export { useHotZones } from './useHotZones';
export type { UseHotZonesOptions, UseHotZonesResult } from './useHotZones';

export { useVirtualization, useAutoVirtualization } from './useVirtualization';
export type {
  UseVirtualizationOptions,
  UseVirtualizationResult,
  UseAutoVirtualizationOptions,
  VirtualizationStats,
} from './useVirtualization';

export { useCanvasRenderer } from './useCanvasRenderer';
export type {
  UseCanvasRendererOptions,
  UseCanvasRendererResult,
  CanvasRenderStats,
} from './useCanvasRenderer';

export { useAdaptiveRenderer } from './useAdaptiveRenderer';
export type {
  UseAdaptiveRendererOptions,
  UseAdaptiveRendererResult,
  RenderMethod,
} from './useAdaptiveRenderer';

export { useResponsive, BREAKPOINTS } from './useResponsive';
export type {
  UseResponsiveOptions,
  UseResponsiveResult,
  DeviceType,
  Orientation,
  ResponsiveRecommendations,
} from './useResponsive';

export { useAccessibility } from './useAccessibility';
export type {
  UseAccessibilityOptions,
  UseAccessibilityResult,
} from './useAccessibility';

export { usePerformanceMonitor } from './usePerformanceMonitor';
export type {
  UsePerformanceMonitorOptions,
  UsePerformanceMonitorResult,
  PerformanceMetrics,
} from './usePerformanceMonitor';
