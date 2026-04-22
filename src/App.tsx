/**
 * Main App Component
 * Orchestrates the entire Animal Extinction Timeline application
 */

import React, { useMemo } from 'react';
import Header from '@/components/Header';
import FilterPanel from '@/components/FilterPanel';
import Timeline from '@/components/Timeline';
import EventModal from '@/components/EventModal';
import { useExtinctionEvents } from '@/hooks/useExtinctionEvents';
import { useTheme } from '@/hooks/useTheme';
import { useModal } from '@/hooks/useModal';
import type { FilterCategory } from '@/types';
import '@/styles/global.css';

const App: React.FC = () => {
  // Custom hooks for state management
  const {
    events,
    filteredEvents,
    isLoading,
    error,
    activeFilter,
    setActiveFilter,
    refetch
  } = useExtinctionEvents();

  const { theme, toggleTheme } = useTheme();
  
  const { isOpen: isModalOpen, selectedEvent, openModal, closeModal } = useModal();

  // Calculate event counts for each category
  const eventCounts = useMemo(() => {
    const counts: Record<FilterCategory, number> = {
      'All': events.length,
      'Mammals': 0,
      'Birds': 0,
      'Reptiles': 0
    };

    events.forEach(event => {
      counts[event.category]++;
    });

    return counts;
  }, [events]);

  // Event handlers
  const handleEventClick = (event: ExtinctionEvent) => {
    openModal(event);
  };

  const handleFilterChange = (category: FilterCategory) => {
    setActiveFilter(category);
  };

  const handleThemeToggle = () => {
    toggleTheme();
  };

  const handleModalClose = () => {
    closeModal();
  };

  const handleRetry = () => {
    refetch();
  };

  // Log app state for debugging
  React.useEffect(() => {
    console.log('🦕 React Timeline App State:', {
      eventsLoaded: events.length,
      filtered: filteredEvents.length,
      activeFilter,
      theme,
      isLoading,
      hasError: !!error
    });
  }, [events.length, filteredEvents.length, activeFilter, theme, isLoading, error]);

  return (
    <div className="app">
      <Header 
        theme={theme} 
        onThemeToggle={handleThemeToggle} 
      />
      
      <FilterPanel
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        eventCounts={eventCounts}
      />
      
      <Timeline
        events={filteredEvents}
        onEventClick={handleEventClick}
        isLoading={isLoading}
        error={error}
      />
      
      <EventModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />

      {/* Fallback for browsers without JavaScript */}
      <noscript>
        <div className="no-js-message">
          <h3>JavaScript Required</h3>
          <p>This timeline requires JavaScript to display interactive content. Please enable JavaScript in your browser.</p>
        </div>
      </noscript>
    </div>
  );
};

export default App;
