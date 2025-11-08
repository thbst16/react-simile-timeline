/**
 * Utility to generate test data for performance benchmarking
 */

import type { EventData, TimelineEvent } from '../types/events';

export function generateTestEvents(count: number): EventData {
  const events: TimelineEvent[] = [];
  const startDate = new Date('2000-01-01');
  const categories = ['Technology', 'Science', 'Politics', 'Culture', 'Sports'];
  const colors = ['#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#F44336'];

  for (let i = 0; i < count; i++) {
    // Spread events over 25 years (2000-2025)
    const daysOffset = Math.floor((i / count) * 365 * 25);
    const eventDate = new Date(startDate);
    eventDate.setDate(eventDate.getDate() + daysOffset);

    const category = categories[i % categories.length];
    const isDuration = i % 5 === 0; // Every 5th event is a duration

    const event: TimelineEvent = {
      id: `event-${i}`,
      start: eventDate.toISOString(),
      title: `${category} Event ${i + 1}`,
      description: `This is test event number ${i + 1} in the ${category} category`,
    };

    // Add color
    const color = colors[i % colors.length];
    if (color) {
      event.color = color;
    }

    if (isDuration) {
      const endDate = new Date(eventDate);
      endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 30) + 1);
      event.end = endDate.toISOString();
      event.isDuration = true;
    }

    events.push(event);
  }

  return {
    dateTimeFormat: 'iso8601',
    events,
  };
}
