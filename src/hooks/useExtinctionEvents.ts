/**
 * Custom hook for managing extinction events data
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { 
  ExtinctionEvent, 
  ExtinctionEventsResponse, 
  FilterCategory,
  UseExtinctionEventsReturn,
  TimelineError
} from '@/types';

const DATA_URL = '/data/events.json';

export function useExtinctionEvents(): UseExtinctionEventsReturn {
  const [events, setEvents] = useState<ReadonlyArray<ExtinctionEvent>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('All');

  /**
   * Fetches events from the JSON API
   */
  const fetchEvents = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔄 Fetching extinction events...');

      const response = await fetch(DATA_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ExtinctionEventsResponse = await response.json();
      
      // Validate and sort events
      const validatedEvents = validateEvents(data.events);
      const sortedEvents = sortEventsByYear(validatedEvents);

      setEvents(sortedEvents);
      
      console.log(`✅ Loaded ${sortedEvents.length} extinction events`);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('❌ Failed to fetch events:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Validates event data structure
   */
  const validateEvents = (events: unknown): ReadonlyArray<ExtinctionEvent> => {
    if (!Array.isArray(events)) {
      throw new Error('Events data is not an array');
    }

    return events.map((event, index) => {
      if (!isValidEvent(event)) {
        throw new Error(`Invalid event at index ${index}`);
      }
      return event as ExtinctionEvent;
    });
  };

  /**
   * Checks if an event object is valid
   */
  const isValidEvent = (event: unknown): event is ExtinctionEvent => {
    if (typeof event !== 'object' || event === null) return false;
    
    const e = event as Record<string, unknown>;
    
    return (
      typeof e.id === 'number' &&
      typeof e.year === 'number' &&
      typeof e.title === 'string' &&
      typeof e.description === 'string' &&
      typeof e.imageURL === 'string' &&
      typeof e.category === 'string' &&
      typeof e.location === 'string' &&
      typeof e.cause === 'string' &&
      ['Mammals', 'Birds', 'Reptiles'].includes(e.category as string)
    );
  };

  /**
   * Sorts events by year (oldest first)
   */
  const sortEventsByYear = (events: ReadonlyArray<ExtinctionEvent>): ReadonlyArray<ExtinctionEvent> => {
    return [...events].sort((a, b) => a.year - b.year);
  };

  /**
   * Filtered events based on active filter
   */
  const filteredEvents = useMemo((): ReadonlyArray<ExtinctionEvent> => {
    if (activeFilter === 'All') {
      return events;
    }
    return events.filter(event => event.category === activeFilter);
  }, [events, activeFilter]);

  /**
   * Refetch data (useful for retry functionality)
   */
  const refetch = useCallback(async (): Promise<void> => {
    await fetchEvents();
  }, [fetchEvents]);

  /**
   * Set active filter with validation
   */
  const setActiveFilterSafe = useCallback((filter: FilterCategory): void => {
    const validFilters: FilterCategory[] = ['All', 'Mammals', 'Birds', 'Reptiles'];
    
    if (validFilters.includes(filter)) {
      setActiveFilter(filter);
      console.log(`🔍 Filter changed to: ${filter}`);
    } else {
      console.warn(`⚠️ Invalid filter: ${filter}`);
    }
  }, []);

  // Load events on mount
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    filteredEvents,
    isLoading,
    error,
    activeFilter,
    setActiveFilter: setActiveFilterSafe,
    refetch
  };
}
