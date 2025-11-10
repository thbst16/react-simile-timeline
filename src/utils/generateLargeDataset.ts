/**
 * Generate Large Test Dataset
 *
 * Creates synthetic timeline data for performance testing.
 * Sprint 7: Performance Testing
 */

import type { TimelineEvent, EventData } from '../types/events';

export interface GenerateDatasetOptions {
  /** Number of events to generate */
  count: number;
  /** Start date for the timeline */
  startDate?: Date;
  /** End date for the timeline */
  endDate?: Date;
  /** Percentage of duration events (0-1) */
  durationRatio?: number;
  /** Event categories to use */
  categories?: string[];
}

const DEFAULT_CATEGORIES = [
  'Technology',
  'Science',
  'Politics',
  'Culture',
  'Sports',
  'Business',
  'Environment',
  'Health',
];

const DEFAULT_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
];

/**
 * Generate a large dataset of timeline events for performance testing
 *
 * @example
 * const events = generateLargeDataset({ count: 1000 });
 * const events = generateLargeDataset({
 *   count: 5000,
 *   startDate: new Date('2000-01-01'),
 *   endDate: new Date('2024-12-31'),
 *   durationRatio: 0.3
 * });
 */
export function generateLargeDataset(options: GenerateDatasetOptions): TimelineEvent[] {
  const {
    count,
    startDate = new Date('2020-01-01'),
    endDate = new Date('2024-12-31'),
    durationRatio = 0.2,
    categories = DEFAULT_CATEGORIES,
  } = options;

  const events: TimelineEvent[] = [];
  const startTime = startDate.getTime();
  const endTime = endDate.getTime();
  const timeRange = endTime - startTime;

  for (let i = 0; i < count; i++) {
    // Random start time within range
    const eventStartTime = startTime + Math.random() * timeRange;
    const eventStart = new Date(eventStartTime);

    // Determine if this is a duration event
    const isDuration = Math.random() < durationRatio;

    // Random category
    const category = categories[Math.floor(Math.random() * categories.length)];

    // Random color
    const color = DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)];

    let event: TimelineEvent;

    if (isDuration) {
      // Duration event: 1 hour to 90 days
      const minDuration = 1000 * 60 * 60; // 1 hour
      const maxDuration = 1000 * 60 * 60 * 24 * 90; // 90 days
      const duration = minDuration + Math.random() * (maxDuration - minDuration);
      const eventEnd = new Date(eventStartTime + duration);

      event = {
        id: `event-${i}`,
        start: eventStart.toISOString(),
        end: eventEnd.toISOString(),
        isDuration: true,
        title: `${category} Event ${i + 1}`,
        description: `This is a duration event in the ${category} category. Event ID: ${i + 1}`,
        ...(color && { color }),
        ...(category && { category }),
      };
    } else {
      // Instant event
      const icon = category ? getIconForCategory(category) : undefined;
      event = {
        id: `event-${i}`,
        start: eventStart.toISOString(),
        title: `${category} Event ${i + 1}`,
        description: `This is an instant event in the ${category} category. Event ID: ${i + 1}`,
        ...(color && { color }),
        ...(category && { category }),
        ...(icon && { icon }),
      };
    }

    events.push(event);
  }

  // Sort events by start date
  events.sort((a, b) => {
    return new Date(a.start).getTime() - new Date(b.start).getTime();
  });

  return events;
}

/**
 * Get an icon emoji for a category
 */
function getIconForCategory(category: string): string | undefined {
  const icons: Record<string, string> = {
    Technology: '💻',
    Science: '🔬',
    Politics: '🏛️',
    Culture: '🎭',
    Sports: '⚽',
    Business: '💼',
    Environment: '🌍',
    Health: '🏥',
  };

  return icons[category];
}

/**
 * Generate dataset and convert to Simile JSON format
 */
export function generateSimileJSON(options: GenerateDatasetOptions): EventData {
  const events = generateLargeDataset(options);

  return {
    dateTimeFormat: 'iso8601',
    events: events,
  };
}

/**
 * Save generated dataset to JSON file (for use in demos)
 */
export function generateAndSaveDataset(options: GenerateDatasetOptions): string {
  const data = generateSimileJSON(options);
  return JSON.stringify(data, null, 2);
}
