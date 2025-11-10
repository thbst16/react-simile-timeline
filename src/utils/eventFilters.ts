/**
 * Event Filtering Utilities
 *
 * Utilities for filtering and searching timeline events.
 * Sprint 4: Interactions
 */

import type { TimelineEvent } from '../types/events';

export interface FilterOptions {
  /** Search query string (searches title, description, caption) */
  search?: string;
  /** Filter by date range */
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  /** Filter by event attributes */
  attributes?: {
    isDuration?: boolean;
    hasImage?: boolean;
    hasLink?: boolean;
    hasIcon?: boolean;
  };
  /** Filter by custom property values */
  properties?: Record<string, unknown>;
  /** Custom filter function */
  customFilter?: (event: TimelineEvent) => boolean;
}

/**
 * Filter events based on search query
 */
export function searchEvents(
  events: TimelineEvent[],
  query: string
): TimelineEvent[] {
  if (!query || query.trim() === '') {
    return events;
  }

  const normalizedQuery = query.toLowerCase().trim();

  return events.filter((event) => {
    // Search in title
    if (event.title?.toLowerCase().includes(normalizedQuery)) {
      return true;
    }

    // Search in description
    if (event.description?.toLowerCase().includes(normalizedQuery)) {
      return true;
    }

    // Search in caption
    if (event.caption?.toLowerCase().includes(normalizedQuery)) {
      return true;
    }

    // Search in link text
    if (event.link?.toLowerCase().includes(normalizedQuery)) {
      return true;
    }

    return false;
  });
}

/**
 * Filter events by date range
 */
export function filterByDateRange(
  events: TimelineEvent[],
  startDate?: Date,
  endDate?: Date
): TimelineEvent[] {
  if (!startDate && !endDate) {
    return events;
  }

  return events.filter((event) => {
    const eventStart = new Date(event.start);

    if (startDate && eventStart < startDate) {
      return false;
    }

    if (endDate && eventStart > endDate) {
      return false;
    }

    return true;
  });
}

/**
 * Filter events by attributes
 */
export function filterByAttributes(
  events: TimelineEvent[],
  attributes: FilterOptions['attributes']
): TimelineEvent[] {
  if (!attributes) {
    return events;
  }

  return events.filter((event) => {
    // Filter by isDuration
    if (attributes.isDuration !== undefined) {
      if (event.isDuration !== attributes.isDuration) {
        return false;
      }
    }

    // Filter by hasImage
    if (attributes.hasImage !== undefined) {
      const hasImage = Boolean(event.image);
      if (hasImage !== attributes.hasImage) {
        return false;
      }
    }

    // Filter by hasLink
    if (attributes.hasLink !== undefined) {
      const hasLink = Boolean(event.link);
      if (hasLink !== attributes.hasLink) {
        return false;
      }
    }

    // Filter by hasIcon
    if (attributes.hasIcon !== undefined) {
      const hasIcon = Boolean(event.icon);
      if (hasIcon !== attributes.hasIcon) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Main filter function that applies all filter options
 */
export function filterEvents(
  events: TimelineEvent[],
  options: FilterOptions
): TimelineEvent[] {
  let filtered = events;

  // Apply search
  if (options.search) {
    filtered = searchEvents(filtered, options.search);
  }

  // Apply date range filter
  if (options.dateRange) {
    filtered = filterByDateRange(
      filtered,
      options.dateRange.start,
      options.dateRange.end
    );
  }

  // Apply attribute filters
  if (options.attributes) {
    filtered = filterByAttributes(filtered, options.attributes);
  }

  // Apply custom filter
  if (options.customFilter) {
    filtered = filtered.filter(options.customFilter);
  }

  return filtered;
}

/**
 * Get matching indices for search highlighting
 */
export interface SearchMatch {
  eventId: string;
  matches: {
    field: 'title' | 'description' | 'caption' | 'link';
    indices: Array<[number, number]>; // [start, end] pairs
  }[];
}

export function getSearchMatches(
  events: TimelineEvent[],
  query: string
): SearchMatch[] {
  if (!query || query.trim() === '') {
    return [];
  }

  const normalizedQuery = query.toLowerCase().trim();
  const matches: SearchMatch[] = [];

  events.forEach((event) => {
    const eventMatches: SearchMatch['matches'] = [];

    // Check title
    const titleMatch = event.title?.toLowerCase().indexOf(normalizedQuery);
    if (titleMatch !== undefined && titleMatch !== -1) {
      eventMatches.push({
        field: 'title',
        indices: [[titleMatch, titleMatch + normalizedQuery.length]],
      });
    }

    // Check description
    const descMatch = event.description?.toLowerCase().indexOf(normalizedQuery);
    if (descMatch !== undefined && descMatch !== -1) {
      eventMatches.push({
        field: 'description',
        indices: [[descMatch, descMatch + normalizedQuery.length]],
      });
    }

    // Check caption
    const captionMatch = event.caption?.toLowerCase().indexOf(normalizedQuery);
    if (captionMatch !== undefined && captionMatch !== -1) {
      eventMatches.push({
        field: 'caption',
        indices: [[captionMatch, captionMatch + normalizedQuery.length]],
      });
    }

    if (eventMatches.length > 0 && event.id) {
      matches.push({
        eventId: event.id,
        matches: eventMatches,
      });
    }
  });

  return matches;
}

/**
 * Sort events by relevance to search query
 */
export function sortByRelevance(
  events: TimelineEvent[],
  query: string
): TimelineEvent[] {
  if (!query || query.trim() === '') {
    return events;
  }

  const normalizedQuery = query.toLowerCase().trim();

  return [...events].sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    // Title matches are most relevant
    if (a.title?.toLowerCase().includes(normalizedQuery)) scoreA += 10;
    if (b.title?.toLowerCase().includes(normalizedQuery)) scoreB += 10;

    // Exact title matches are even more relevant
    if (a.title?.toLowerCase() === normalizedQuery) scoreA += 20;
    if (b.title?.toLowerCase() === normalizedQuery) scoreB += 20;

    // Caption matches
    if (a.caption?.toLowerCase().includes(normalizedQuery)) scoreA += 5;
    if (b.caption?.toLowerCase().includes(normalizedQuery)) scoreB += 5;

    // Description matches
    if (a.description?.toLowerCase().includes(normalizedQuery)) scoreA += 3;
    if (b.description?.toLowerCase().includes(normalizedQuery)) scoreB += 3;

    return scoreB - scoreA;
  });
}
