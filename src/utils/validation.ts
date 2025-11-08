/**
 * Data validation utilities for timeline events
 *
 * Provides helpful, descriptive error messages for invalid data
 */

import type {
  TimelineEvent,
  EventData,
  ValidationResult,
  DatasetValidationResult,
} from '../types/events';

/**
 * Validate a single timeline event
 *
 * @param event - Event to validate
 * @param index - Index in the events array (for error messages)
 * @returns Validation result with errors and warnings
 */
export function validateEvent(event: TimelineEvent, index?: number): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const eventLabel = event.title
    ? `Event "${event.title}"`
    : index !== undefined
      ? `Event at index ${index}`
      : 'Event';

  // Required: start date
  if (!event.start) {
    errors.push(`${eventLabel} is missing required 'start' date`);
  } else if (typeof event.start !== 'string') {
    errors.push(`${eventLabel} has invalid 'start' date (must be a string)`);
  }

  // Required: title
  if (!event.title) {
    errors.push(`${eventLabel} is missing required 'title'`);
  } else if (typeof event.title !== 'string') {
    errors.push(`${eventLabel} has invalid 'title' (must be a string)`);
  }

  // Duration events must have end date
  if (event.isDuration && !event.end && !event.durationEvent) {
    errors.push(
      `${eventLabel} is marked as duration event but missing 'end' date or 'durationEvent'`
    );
  }

  // End date must be after start date
  if (event.start && event.end) {
    try {
      const start = new Date(event.start);
      const end = new Date(event.end);
      if (end < start) {
        errors.push(`${eventLabel} has 'end' date (${event.end}) before 'start' date (${event.start})`);
      }
    } catch {
      // Date parsing errors will be caught by date parser
    }
  }

  // Validate color format
  if (event.color && !isValidColor(event.color)) {
    warnings.push(
      `${eventLabel} has potentially invalid color '${event.color}' (should be hex, rgb, or named color)`
    );
  }

  // Validate URLs
  if (event.link && !isValidUrlFormat(event.link)) {
    warnings.push(`${eventLabel} has potentially invalid link URL '${event.link}'`);
  }

  if (event.icon && !isValidUrlFormat(event.icon)) {
    warnings.push(`${eventLabel} has potentially invalid icon URL '${event.icon}'`);
  }

  if (event.image && !isValidUrlFormat(event.image)) {
    warnings.push(`${eventLabel} has potentially invalid image URL '${event.image}'`);
  }

  // Validate track number
  if (event.track !== undefined && (typeof event.track !== 'number' || event.track < 0)) {
    errors.push(`${eventLabel} has invalid 'track' number (must be >= 0)`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    event,
  };
}

/**
 * Validate an entire dataset
 *
 * @param data - Event data to validate
 * @returns Dataset validation result with summary
 */
export function validateDataset(data: EventData): DatasetValidationResult {
  const datasetErrors: string[] = [];
  const results: ValidationResult[] = [];

  // Validate dataset structure
  if (!data.events) {
    datasetErrors.push('Dataset is missing required "events" array');
    return {
      valid: false,
      totalEvents: 0,
      validEvents: 0,
      invalidEvents: 0,
      results: [],
      datasetErrors,
    };
  }

  if (!Array.isArray(data.events)) {
    datasetErrors.push('Dataset "events" must be an array');
    return {
      valid: false,
      totalEvents: 0,
      validEvents: 0,
      invalidEvents: 0,
      results: [],
      datasetErrors,
    };
  }

  // Validate each event
  data.events.forEach((event, index) => {
    const result = validateEvent(event, index);
    results.push(result);
  });

  const validEvents = results.filter((r) => r.valid).length;
  const invalidEvents = results.filter((r) => !r.valid).length;

  // Check for duplicate IDs
  const ids = data.events
    .filter((e) => e.id)
    .map((e) => e.id as string);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicateIds.length > 0) {
    datasetErrors.push(
      `Dataset contains duplicate event IDs: ${[...new Set(duplicateIds)].join(', ')}`
    );
  }

  return {
    valid: datasetErrors.length === 0 && invalidEvents === 0,
    totalEvents: data.events.length,
    validEvents,
    invalidEvents,
    results,
    datasetErrors,
  };
}

/**
 * Check if a string is a valid color format
 */
function isValidColor(color: string): boolean {
  // Hex colors
  if (/^#[0-9A-Fa-f]{3}$/.test(color) || /^#[0-9A-Fa-f]{6}$/.test(color)) {
    return true;
  }

  // RGB/RGBA
  if (/^rgba?\(/.test(color)) {
    return true;
  }

  // HSL/HSLA
  if (/^hsla?\(/.test(color)) {
    return true;
  }

  // Named colors (basic check)
  const namedColors = [
    'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown',
    'black', 'white', 'gray', 'grey', 'cyan', 'magenta', 'lime', 'navy',
    'teal', 'aqua', 'maroon', 'olive', 'silver', 'fuchsia',
  ];
  if (namedColors.includes(color.toLowerCase())) {
    return true;
  }

  return false;
}

/**
 * Check if a string looks like a URL
 */
function isValidUrlFormat(url: string): boolean {
  // Absolute URLs
  if (/^https?:\/\//.test(url)) {
    return true;
  }

  // Relative URLs
  if (/^\//.test(url) || /^\.\.?\//.test(url)) {
    return true;
  }

  // Data URLs
  if (/^data:/.test(url)) {
    return true;
  }

  // Just a filename
  if (/^[^/]+\.(jpg|jpeg|png|gif|svg|webp|ico)$/i.test(url)) {
    return true;
  }

  return false;
}

/**
 * Format validation errors as a readable message
 */
export function formatValidationErrors(result: DatasetValidationResult): string {
  const lines: string[] = [];

  if (result.datasetErrors.length > 0) {
    lines.push('Dataset Errors:');
    result.datasetErrors.forEach((error) => {
      lines.push(`  - ${error}`);
    });
    lines.push('');
  }

  if (result.invalidEvents > 0) {
    lines.push(
      `Found ${result.invalidEvents} invalid event(s) out of ${result.totalEvents} total:`
    );
    lines.push('');

    result.results.forEach((r, index) => {
      if (!r.valid) {
        lines.push(`Event ${index + 1}:`);
        r.errors.forEach((error) => {
          lines.push(`  - ${error}`);
        });
        if (r.warnings.length > 0) {
          r.warnings.forEach((warning) => {
            lines.push(`  ⚠ ${warning}`);
          });
        }
        lines.push('');
      }
    });
  }

  return lines.join('\n');
}
