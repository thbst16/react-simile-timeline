/**
 * useEventFilter
 *
 * Custom hook for filtering and searching timeline events.
 * Provides search, filtering, and highlighting functionality.
 *
 * Sprint 4: Interactions
 */

import { useState, useMemo, useCallback } from 'react';
import type { TimelineEvent } from '../types/events';
import {
  filterEvents,
  getSearchMatches,
  sortByRelevance,
  type FilterOptions,
  type SearchMatch,
} from '../utils/eventFilters';

export interface UseEventFilterOptions {
  /** Initial events to filter */
  events: TimelineEvent[];
  /** Initial filter options */
  initialFilters?: FilterOptions;
  /** Whether to sort results by relevance */
  sortByRelevance?: boolean;
}

export interface UseEventFilterResult {
  /** Filtered events */
  filteredEvents: TimelineEvent[];
  /** Current search query */
  searchQuery: string;
  /** Set search query */
  setSearchQuery: (query: string) => void;
  /** Current filter options */
  filters: FilterOptions;
  /** Update filter options */
  setFilters: (filters: FilterOptions) => void;
  /** Clear all filters */
  clearFilters: () => void;
  /** Get highlighted event IDs */
  highlightedEvents: string[];
  /** Get search matches for highlighting */
  searchMatches: SearchMatch[];
  /** Whether any filters are active */
  hasActiveFilters: boolean;
  /** Number of filtered events */
  count: number;
  /** Total number of events */
  total: number;
}

/**
 * Hook for filtering and searching events
 *
 * @example
 * const {
 *   filteredEvents,
 *   searchQuery,
 *   setSearchQuery,
 *   highlightedEvents
 * } = useEventFilter({
 *   events: allEvents,
 *   sortByRelevance: true
 * });
 */
export function useEventFilter(options: UseEventFilterOptions): UseEventFilterResult {
  const { events, initialFilters, sortByRelevance: shouldSort = false } = options;

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>(initialFilters || {});

  // Combine search query with filters
  const allFilters = useMemo((): FilterOptions => {
    return {
      ...filters,
      search: searchQuery,
    };
  }, [filters, searchQuery]);

  // Filter events
  const filteredEvents = useMemo(() => {
    let result = filterEvents(events, allFilters);

    // Sort by relevance if enabled and search query exists
    if (shouldSort && searchQuery) {
      result = sortByRelevance(result, searchQuery);
    }

    return result;
  }, [events, allFilters, shouldSort, searchQuery]);

  // Get search matches for highlighting
  const searchMatches = useMemo(() => {
    if (!searchQuery) return [];
    return getSearchMatches(filteredEvents, searchQuery);
  }, [filteredEvents, searchQuery]);

  // Get highlighted event IDs
  const highlightedEvents = useMemo(() => {
    return searchMatches.map((match) => match.eventId);
  }, [searchMatches]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    if (searchQuery) return true;
    if (filters.dateRange?.start || filters.dateRange?.end) return true;
    if (filters.attributes) return true;
    if (filters.customFilter) return true;
    return false;
  }, [searchQuery, filters]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setFilters({});
  }, []);

  return {
    filteredEvents,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    clearFilters,
    highlightedEvents,
    searchMatches,
    hasActiveFilters,
    count: filteredEvents.length,
    total: events.length,
  };
}
