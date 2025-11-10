/**
 * Simile Timeline React
 *
 * Modern React port of MIT's Simile Timeline widget.
 * 100% compatible with original Simile JSON format.
 *
 * @packageDocumentation
 */

// ============================================================================
// Components
// ============================================================================

export { Timeline } from './components/Timeline';
export { Band } from './components/Band';
export { EventBubble } from './components/EventBubble';

// ============================================================================
// Hooks - All Exports
// ============================================================================

export {
  // Interaction Hooks
  useTimelineScroll,
  usePanZoom,
  useBandSync,
  useKeyboardNav,
  useEventFilter,
  useAnimatedTransition,
  useSpring,
  easings,

  // Theme Hooks
  useTheme,
  useThemeColors,
  useThemeTypography,
  useThemeToggle,
  ThemeProvider,
  ThemeContext,

  // Performance Hooks
  useHotZones,
  useVirtualization,
  useAutoVirtualization,
  useCanvasRenderer,
  useAdaptiveRenderer,

  // Responsive & Accessibility
  useResponsive,
  useAccessibility,
  BREAKPOINTS,
} from './hooks';

export type {
  // Interaction Hook Types
  UseTimelineScrollOptions,
  UseTimelineScrollResult,
  UsePanZoomOptions,
  UsePanZoomResult,
  BandSyncConfig,
  UseBandSyncOptions,
  UseBandSyncResult,
  KeyboardShortcut,
  UseKeyboardNavOptions,
  UseKeyboardNavResult,
  UseEventFilterOptions,
  UseEventFilterResult,
  UseAnimatedTransitionOptions,
  UseAnimatedTransitionResult,
  UseSpringOptions,
  UseSpringResult,
  EasingFunction,

  // Theme Hook Types
  ThemeProviderProps,

  // Performance Hook Types
  UseHotZonesOptions,
  UseHotZonesResult,
  UseVirtualizationOptions,
  UseVirtualizationResult,
  UseAutoVirtualizationOptions,
  VirtualizationStats,
  UseCanvasRendererOptions,
  UseCanvasRendererResult,
  CanvasRenderStats,
  UseAdaptiveRendererOptions,
  UseAdaptiveRendererResult,
  RenderMethod,

  // Responsive & Accessibility Types
  UseResponsiveOptions,
  UseResponsiveResult,
  DeviceType,
  Orientation,
  ResponsiveRecommendations,
  UseAccessibilityOptions,
  UseAccessibilityResult,
} from './hooks';

// ============================================================================
// Themes
// ============================================================================

export { classicTheme, darkTheme, defaultTheme, themes, themeList } from './themes';

// ============================================================================
// Core Types
// ============================================================================

export type { TimelineEvent, EventData, DateTimeFormat } from './types/events';

export type { TimelineTheme, ThemeMode, ThemeContextValue } from './types/theme';

export type { BandConfig, IntervalUnit } from './types/bands';

export type { HotZone, HotZoneCalculation, HotZoneTransition } from './types/hotzone';

// ============================================================================
// Utilities
// ============================================================================

// Accessibility utilities
export {
  getContrastRatio,
  meetsWCAGAA,
  meetsUIContrast,
  createAriaLabel,
  announceToScreenReader,
  getKeyboardShortcutDescription,
  isFocusable,
  ensureFocusVisible,
  removeFocusVisible,
} from './utils/accessibility';

export type {
  AccessibilityAudit,
  AccessibilityIssue,
  ContrastCheck,
  AriaCheck,
  KeyboardCheck,
} from './utils/accessibility';

// Hot zone utilities
export {
  isDateInZone,
  findZonesAtDate,
  getActiveZoneAtDate,
  calculateAtDate,
  findZonesInRange,
  calculateTransitions,
  validateHotZone,
  mergeOverlappingZones,
  createHotZone,
} from './utils/hotZones';

// Event filter utilities
export {
  searchEvents,
  filterByDateRange,
  filterByAttributes,
  sortByRelevance,
} from './utils/eventFilters';

export type { FilterOptions } from './utils/eventFilters';

// Validation utilities
export { validateEvent } from './utils/validation';

// ============================================================================
// Core Classes (for advanced usage)
// ============================================================================

export { EventSource } from './core/EventSource';
export { LinearEther, HotZoneEther } from './core/Ether';
export { LayoutEngine } from './core/LayoutEngine';

export type { Ether } from './core/Ether';

// ============================================================================
// Painters (for custom rendering)
// ============================================================================

export { OriginalPainter } from './core/painters/OriginalPainter';
export { CompactPainter } from './core/painters/CompactPainter';
export { OverviewPainter } from './core/painters/OverviewPainter';

export type { EventPainter } from './core/painters/types';

// ============================================================================
// Date/Time Utilities
// ============================================================================

export { parseDate, formatDate, addInterval } from './core/DateTime';

// ============================================================================
// Version
// ============================================================================

export const VERSION = '0.1.0';

// ============================================================================
// Default Export
// ============================================================================

export { Timeline as default } from './components/Timeline';
