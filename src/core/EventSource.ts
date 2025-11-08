/**
 * EventSource - Manages timeline event data
 *
 * Responsibilities:
 * - Load events from JSON or API
 * - Validate event data
 * - Provide event filtering and querying
 * - CRUD operations on events
 */

import type { EventData, TimelineEvent, DatasetValidationResult } from '../types/events';
import { validateDataset, validateEvent } from '../utils/validation';
import { parseDate } from './DateTime';

export class EventSource {
  private events: TimelineEvent[] = [];
  private dateTimeFormat?: string;
  private validationResult: DatasetValidationResult | null = null;

  constructor(data?: EventData) {
    if (data) {
      this.loadData(data);
    }
  }

  /**
   * Load event data and validate
   */
  public loadData(data: EventData): void {
    if (data.dateTimeFormat) {
      this.dateTimeFormat = data.dateTimeFormat;
    }
    this.validationResult = validateDataset(data);

    // Only load valid events
    if (this.validationResult.valid) {
      this.events = data.events;
    } else {
      // Load valid events, skip invalid ones
      this.events = this.validationResult.results
        .filter((r) => r.valid)
        .map((r) => r.event);

      console.warn(
        `Loaded ${this.events.length} valid events, skipped ${this.validationResult.invalidEvents} invalid events`
      );
    }
  }

  /**
   * Load event data from a URL
   */
  public async loadFromUrl(url: string): Promise<void> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load data: ${response.statusText}`);
      }
      const data = (await response.json()) as EventData;
      this.loadData(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Error loading timeline data: ${errorMessage}`);
    }
  }

  /**
   * Get all events
   */
  public getEvents(): TimelineEvent[] {
    return [...this.events]; // Return copy
  }

  /**
   * Get event by ID
   */
  public getEventById(id: string): TimelineEvent | undefined {
    return this.events.find((event) => event.id === id);
  }

  /**
   * Get events within a date range
   */
  public getEventsByDateRange(startDate: Date, endDate: Date): TimelineEvent[] {
    return this.events.filter((event) => {
      try {
        const eventStart = parseDate(event.start);
        const eventEnd = event.end ? parseDate(event.end) : eventStart;

        // Event overlaps if: event start <= range end AND event end >= range start
        return eventStart <= endDate && eventEnd >= startDate;
      } catch {
        return false; // Skip events with invalid dates
      }
    });
  }

  /**
   * Search events by title or description
   */
  public searchEvents(query: string): TimelineEvent[] {
    const lowerQuery = query.toLowerCase();
    return this.events.filter((event) => {
      const title = event.title?.toLowerCase() || '';
      const description = event.description?.toLowerCase() || '';
      return title.includes(lowerQuery) || description.includes(lowerQuery);
    });
  }

  /**
   * Filter events by custom predicate
   */
  public filterEvents(predicate: (event: TimelineEvent) => boolean): TimelineEvent[] {
    return this.events.filter(predicate);
  }

  /**
   * Add a new event
   */
  public addEvent(event: TimelineEvent): void {
    const validation = validateEvent(event);
    if (!validation.valid) {
      throw new Error(`Invalid event: ${validation.errors.join(', ')}`);
    }

    // Auto-generate ID if not provided
    if (!event.id) {
      event.id = `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    this.events.push(event);
  }

  /**
   * Update an existing event
   */
  public updateEvent(id: string, updates: Partial<TimelineEvent>): boolean {
    const index = this.events.findIndex((e) => e.id === id);
    if (index === -1) {
      return false;
    }

    const currentEvent = this.events[index];
    if (!currentEvent) return false;

    const updatedEvent: TimelineEvent = { ...currentEvent, ...updates };
    const validation = validateEvent(updatedEvent);
    if (!validation.valid) {
      throw new Error(`Invalid event update: ${validation.errors.join(', ')}`);
    }

    this.events[index] = updatedEvent;
    return true;
  }

  /**
   * Remove an event
   */
  public removeEvent(id: string): boolean {
    const index = this.events.findIndex((e) => e.id === id);
    if (index === -1) {
      return false;
    }

    this.events.splice(index, 1);
    return true;
  }

  /**
   * Remove all events
   */
  public clear(): void {
    this.events = [];
    this.validationResult = null;
  }

  /**
   * Get count of events
   */
  public getCount(): number {
    return this.events.length;
  }

  /**
   * Get validation result from last load
   */
  public getValidationResult(): DatasetValidationResult | null {
    return this.validationResult;
  }

  /**
   * Get date format used in this dataset
   */
  public getDateTimeFormat(): string | undefined {
    return this.dateTimeFormat;
  }
}
