/**
 * Accessibility Utilities
 *
 * Utilities for WCAG 2.1 AA compliance:
 * - Color contrast checking (4.5:1 for text, 3:1 for UI components)
 * - ARIA attribute helpers
 * - Keyboard navigation utilities
 * - Screen reader announcements
 *
 * Sprint 5: Polish & Performance
 */

/**
 * WCAG 2.1 AA Requirements:
 * - Text contrast: 4.5:1 minimum (3:1 for large text)
 * - UI component contrast: 3:1 minimum
 * - All functionality available via keyboard
 * - Focus visible
 * - Screen reader support
 * - No content flashes more than 3 times per second
 * - Resize text up to 200% without loss of functionality
 */

/**
 * Calculate relative luminance of an RGB color
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
function getRelativeLuminance(r: number, g: number, b: number): number {
  const values = [r, g, b].map((c) => {
    const sRGB = c / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });

  const [r1, g1, b1] = values;
  return 0.2126 * (r1 || 0) + 0.7152 * (g1 || 0) + 0.0722 * (b1 || 0);
}

/**
 * Parse hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result || !result[1] || !result[2] || !result[3]) return null;

  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * Calculate contrast ratio between two colors
 * https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 *
 * @param color1 - First color (hex format)
 * @param color2 - Second color (hex format)
 * @returns Contrast ratio (1-21)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 0;

  const lum1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if color combination meets WCAG AA standards
 *
 * @param foreground - Foreground color (hex)
 * @param background - Background color (hex)
 * @param isLargeText - Whether text is large (18pt+ or 14pt+ bold)
 * @returns Whether the combination passes WCAG AA
 */
export function meetsWCAGAA(foreground: string, background: string, isLargeText = false): boolean {
  const ratio = getContrastRatio(foreground, background);
  const requiredRatio = isLargeText ? 3 : 4.5;
  return ratio >= requiredRatio;
}

/**
 * Check if UI component contrast meets WCAG AA
 *
 * @param componentColor - Component color (hex)
 * @param backgroundColor - Background color (hex)
 * @returns Whether the combination passes (3:1 minimum)
 */
export function meetsUIContrast(componentColor: string, backgroundColor: string): boolean {
  const ratio = getContrastRatio(componentColor, backgroundColor);
  return ratio >= 3;
}

/**
 * Accessibility audit result
 */
export interface AccessibilityAudit {
  /**
   * Whether all checks pass
   */
  passes: boolean;

  /**
   * List of issues found
   */
  issues: AccessibilityIssue[];

  /**
   * Contrast ratio checks
   */
  contrastChecks: ContrastCheck[];

  /**
   * ARIA attribute checks
   */
  ariaChecks: AriaCheck[];

  /**
   * Keyboard navigation checks
   */
  keyboardChecks: KeyboardCheck[];

  /**
   * Overall compliance level
   */
  complianceLevel: 'AAA' | 'AA' | 'A' | 'Fail';
}

export interface AccessibilityIssue {
  /**
   * Severity of the issue
   */
  severity: 'error' | 'warning' | 'info';

  /**
   * Category
   */
  category: 'contrast' | 'aria' | 'keyboard' | 'semantic' | 'focus';

  /**
   * Description of the issue
   */
  message: string;

  /**
   * Element or location where issue was found
   */
  location?: string;

  /**
   * WCAG criterion
   */
  criterion?: string;
}

export interface ContrastCheck {
  /**
   * Name of the check
   */
  name: string;

  /**
   * Foreground color
   */
  foreground: string;

  /**
   * Background color
   */
  background: string;

  /**
   * Calculated contrast ratio
   */
  ratio: number;

  /**
   * Required ratio
   */
  required: number;

  /**
   * Whether check passes
   */
  passes: boolean;
}

export interface AriaCheck {
  /**
   * Name of the check
   */
  name: string;

  /**
   * Whether check passes
   */
  passes: boolean;

  /**
   * Details
   */
  details?: string;
}

export interface KeyboardCheck {
  /**
   * Name of the check
   */
  name: string;

  /**
   * Whether check passes
   */
  passes: boolean;

  /**
   * Details
   */
  details?: string;
}

/**
 * Create accessible label for timeline element
 */
export function createAriaLabel(
  type: 'timeline' | 'band' | 'event' | 'timescale',
  details: Record<string, unknown>
): string {
  switch (type) {
    case 'timeline':
      return `Timeline showing ${String(details['eventCount'] ?? 0)} events from ${String(details['startDate'] ?? 'unknown')} to ${String(details['endDate'] ?? 'unknown')}`;

    case 'band':
      return `Timeline band ${details['index'] !== undefined ? Number(details['index']) + 1 : ''} with ${String(details['eventCount'] ?? 0)} events`;

    case 'event':
      if (details['isDuration']) {
        return `${String(details['title'] ?? 'Event')} from ${String(details['start'] ?? '')} to ${String(details['end'] ?? '')}. ${String(details['description'] ?? '')}`;
      }
      return `${String(details['title'] ?? 'Event')} on ${String(details['start'] ?? '')}. ${String(details['description'] ?? '')}`;

    case 'timescale':
      return `Time scale showing ${String(details['unit'] ?? 'time')} intervals`;

    default:
      return '';
  }
}

/**
 * Announce message to screen readers
 *
 * Creates a live region announcement for screen readers.
 * Use sparingly to avoid overwhelming users.
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  if (typeof document === 'undefined') return;

  // Create or find live region
  let liveRegion = document.getElementById('timeline-live-region');

  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'timeline-live-region';
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.style.position = 'absolute';
    liveRegion.style.left = '-10000px';
    liveRegion.style.width = '1px';
    liveRegion.style.height = '1px';
    liveRegion.style.overflow = 'hidden';
    document.body.appendChild(liveRegion);
  }

  // Update message
  liveRegion.textContent = message;

  // Clear after announcement
  setTimeout(() => {
    if (liveRegion) {
      liveRegion.textContent = '';
    }
  }, 1000);
}

/**
 * Get keyboard shortcut description
 */
export function getKeyboardShortcutDescription(
  key: string,
  modifiers?: {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
  }
): string {
  const parts: string[] = [];

  if (modifiers?.ctrl) parts.push('Ctrl');
  if (modifiers?.shift) parts.push('Shift');
  if (modifiers?.alt) parts.push('Alt');
  if (modifiers?.meta) parts.push(navigator.platform.includes('Mac') ? 'Cmd' : 'Win');

  parts.push(key);

  return parts.join('+');
}

/**
 * Check if element is focusable
 */
export function isFocusable(element: HTMLElement): boolean {
  const tabIndex = element.getAttribute('tabindex');
  if (tabIndex && parseInt(tabIndex, 10) < 0) return false;

  const tagName = element.tagName.toLowerCase();
  const focusableTags = ['a', 'button', 'input', 'select', 'textarea'];

  if (focusableTags.includes(tagName)) {
    return !element.hasAttribute('disabled');
  }

  return tabIndex !== null;
}

/**
 * Ensure focus is visible with proper styling
 */
export function ensureFocusVisible(
  element: HTMLElement,
  theme: { colors: { ui: { primary: string } } }
): void {
  element.style.outline = `2px solid ${theme.colors.ui.primary}`;
  element.style.outlineOffset = '2px';
}

/**
 * Remove focus styling
 */
export function removeFocusVisible(element: HTMLElement): void {
  element.style.outline = '';
  element.style.outlineOffset = '';
}
