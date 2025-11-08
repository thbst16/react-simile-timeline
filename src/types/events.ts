/**
 * Event-related type definitions for Simile Timeline
 * Based on original Simile Timeline JSON format
 *
 * Full compatibility with original Simile Timeline data format
 */

/**
 * Supported date/time formats for event parsing
 */
export type DateTimeFormat = 'iso8601' | 'gregorian' | 'auto';

/**
 * Timeline event representing a point in time or duration
 * Compatible with original Simile Timeline JSON format
 */
export interface TimelineEvent {
  // Required properties
  /** Start date/time (ISO-8601, Gregorian, or BCE format) */
  start: string;
  /** Event title/headline */
  title: string;

  // Optional temporal properties
  /** End date/time (for duration events) */
  end?: string;
  /** Latest start date for imprecise events */
  latestStart?: string;
  /** Earliest end date for imprecise events */
  earliestEnd?: string;
  /** Whether this is a duration event (computed from end if not specified) */
  isDuration?: boolean;
  /** Duration in milliseconds (alternative to end date) */
  durationEvent?: number;

  // Content properties
  /** Detailed description/body text */
  description?: string;
  /** HTML caption */
  caption?: string;
  /** Additional body text */
  body?: string;

  // Visual properties
  /** Icon URL */
  icon?: string;
  /** Image URL */
  image?: string;
  /** Tape image URL (for duration events) */
  tapeImage?: string;
  /** Tape repeat pattern */
  tapeRepeat?: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat';
  /** Background color */
  color?: string;
  /** Text color */
  textColor?: string;
  /** CSS class name */
  classname?: string;

  // Link properties
  /** Hyperlink URL */
  link?: string;
  /** Link target (_self, _blank, etc.) */
  linkTarget?: string;

  // Track/band properties
  /** Track number for multi-track layouts */
  track?: number;
  /** Track gap */
  trackGap?: number;

  // Metadata
  /** Unique identifier */
  id?: string;

  // Allow custom properties for extensibility
  [key: string]: unknown;
}

/**
 * Root data structure for timeline JSON files
 */
export interface EventData {
  /** Date/time format used in this dataset */
  dateTimeFormat?: DateTimeFormat;
  /** Wiki URL for additional information */
  wikiURL?: string;
  /** Wiki section */
  wikiSection?: string;
  /** Array of timeline events */
  events: TimelineEvent[];
}

/**
 * Result of validating a single event
 */
export interface ValidationResult {
  /** Whether the event is valid */
  valid: boolean;
  /** Array of validation error messages */
  errors: string[];
  /** Array of validation warnings (non-blocking issues) */
  warnings: string[];
  /** The validated event (with defaults applied if valid) */
  event: TimelineEvent;
}

/**
 * Result of validating entire dataset
 */
export interface DatasetValidationResult {
  /** Whether the entire dataset is valid */
  valid: boolean;
  /** Total number of events */
  totalEvents: number;
  /** Number of valid events */
  validEvents: number;
  /** Number of invalid events */
  invalidEvents: number;
  /** Array of all validation results */
  results: ValidationResult[];
  /** Dataset-level errors */
  datasetErrors: string[];
}
