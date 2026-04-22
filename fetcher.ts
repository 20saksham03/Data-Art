/**
 * Data Fetcher Module
 * Handles loading and parsing of extinction event data
 */

import type { 
  ExtinctionEvent, 
  ExtinctionEventsResponse, 
  TimelineError 
} from '@/types';

export class DataFetcher {
  private readonly dataUrl: string;

  constructor(dataUrl: string) {
    this.dataUrl = dataUrl;
  }

  /**
   * Fetches extinction events from the JSON API
   * @returns Promise resolving to array of extinction events
   * @throws TimelineError if fetch fails or data is invalid
   */
  async fetchEvents(): Promise<ReadonlyArray<ExtinctionEvent>> {
    try {
      console.log(`🔄 Fetching extinction data from: ${this.dataUrl}`);
      
      const response = await fetch(this.dataUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: unknown = await response.json();
      
      // Validate the response structure
      const validatedData = this.validateResponse(data);
      
      // Sort events chronologically (oldest first)
      const sortedEvents = this.sortEventsByYear(validatedData.events);
      
      console.log(`✅ Successfully loaded ${sortedEvents.length} extinction events`);
      
      return sortedEvents;
      
    } catch (error) {
      const timelineError = this.createTimelineError(error);
      console.error('❌ Failed to fetch extinction events:', timelineError);
      throw timelineError;
    }
  }

  /**
   * Validates the API response structure
   * @param data - Raw response data
   * @returns Validated response object
   * @throws TimelineError if validation fails
   */
  private validateResponse(data: unknown): ExtinctionEventsResponse {
    if (!this.isObject(data)) {
      throw new Error('Response is not a valid object');
    }

    if (!('events' in data) || !Array.isArray(data.events)) {
      throw new Error('Response missing events array');
    }

    const events = data.events.map((event, index) => 
      this.validateEvent(event, index)
    );

    return { events };
  }

  /**
   * Validates a single extinction event
   * @param event - Raw event data
   * @param index - Event index for error reporting
   * @returns Validated event object
   * @throws Error if validation fails
   */
  private validateEvent(event: unknown, index: number): ExtinctionEvent {
    if (!this.isObject(event)) {
      throw new Error(`Event at index ${index} is not a valid object`);
    }

    const requiredFields = [
      'id', 'year', 'title', 'description', 
      'imageURL', 'category', 'location', 'cause'
    ] as const;

    for (const field of requiredFields) {
      if (!(field in event) || event[field] === null || event[field] === undefined) {
        throw new Error(`Event at index ${index} missing required field: ${field}`);
      }
    }

    // Type assertions with runtime validation
    const validatedEvent: ExtinctionEvent = {
      id: this.validateNumber(event.id, `Event ${index} id`),
      year: this.validateNumber(event.year, `Event ${index} year`),
      title: this.validateString(event.title, `Event ${index} title`),
      description: this.validateString(event.description, `Event ${index} description`),
      imageURL: this.validateString(event.imageURL, `Event ${index} imageURL`),
      category: this.validateCategory(event.category, `Event ${index} category`),
      location: this.validateString(event.location, `Event ${index} location`),
      cause: this.validateString(event.cause, `Event ${index} cause`)
    };

    return validatedEvent;
  }

  /**
   * Sorts events by year in ascending order
   * @param events - Array of events to sort
   * @returns Sorted array of events
   */
  private sortEventsByYear(events: ReadonlyArray<ExtinctionEvent>): ReadonlyArray<ExtinctionEvent> {
    return [...events].sort((a, b) => a.year - b.year);
  }

  /**
   * Creates a standardized TimelineError from various error types
   * @param error - Original error
   * @returns Formatted TimelineError
   */
  private createTimelineError(error: unknown): TimelineError {
    if (error instanceof Error) {
      return new (TimelineError as any)(
        `Failed to load timeline data: ${error.message}`,
        'FETCH_ERROR',
        error
      );
    }
    
    return new (TimelineError as any)(
      'Failed to load timeline data: Unknown error',
      'UNKNOWN_ERROR'
    );
  }

  // Utility validation methods
  private isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private validateString(value: unknown, fieldName: string): string {
    if (typeof value !== 'string' || value.trim() === '') {
      throw new Error(`${fieldName} must be a non-empty string`);
    }
    return value.trim();
  }

  private validateNumber(value: unknown, fieldName: string): number {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      throw new Error(`${fieldName} must be a valid number`);
    }
    return value;
  }

  private validateCategory(value: unknown, fieldName: string): ExtinctionEvent['category'] {
    const validCategories = ['Mammals', 'Birds', 'Reptiles'] as const;
    
    if (typeof value !== 'string' || !validCategories.includes(value as any)) {
      throw new Error(
        `${fieldName} must be one of: ${validCategories.join(', ')}`
      );
    }
    
    return value as ExtinctionEvent['category'];
  }
}

/**
 * Factory function to create a DataFetcher instance
 * @param dataUrl - URL to fetch data from
 * @returns DataFetcher instance
 */
export function createDataFetcher(dataUrl: string): DataFetcher {
  return new DataFetcher(dataUrl);
}
