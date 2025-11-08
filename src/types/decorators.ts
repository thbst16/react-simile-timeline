/**
 * Decorator type definitions
 *
 * Decorators are visual markers that highlight important dates or time ranges
 * without being events themselves.
 *
 * Sprint 3: Advanced Rendering
 */

/**
 * Point Decorator - Marks a specific date with a vertical line
 */
export interface PointDecorator {
  type: 'point';

  /** The date to mark */
  date: string;

  /** Label to display (optional) */
  label?: string;

  /** Line color */
  color?: string;

  /** Line opacity (0-1) */
  opacity?: number;

  /** Line width in pixels */
  width?: number;

  /** CSS class name for custom styling */
  className?: string;
}

/**
 * Span Decorator - Highlights a time range with a background
 */
export interface SpanDecorator {
  type: 'span';

  /** Start date of the range */
  startDate: string;

  /** End date of the range */
  endDate: string;

  /** Label to display (optional) */
  label?: string;

  /** Background color */
  color?: string;

  /** Background opacity (0-1) */
  opacity?: number;

  /** CSS class name for custom styling */
  className?: string;
}

/**
 * Union type for all decorator types
 */
export type Decorator = PointDecorator | SpanDecorator;

/**
 * Default decorator styles
 */
export const DEFAULT_POINT_DECORATOR_STYLE = {
  color: '#ef4444', // Red
  opacity: 0.6,
  width: 2,
} as const;

export const DEFAULT_SPAN_DECORATOR_STYLE = {
  color: '#fbbf24', // Yellow
  opacity: 0.15,
} as const;
