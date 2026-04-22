/**
 * Timeline Component
 * Renders the main timeline with event markers
 */

import React from 'react';
import EventMarker from './EventMarker';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';
import type { TimelineProps } from '@/types';

const Timeline: React.FC<TimelineProps> = ({ 
  events, 
  onEventClick, 
  isLoading = false, 
  error = null 
}) => {
  // Loading state
  if (isLoading) {
    return (
      <main>
        <LoadingSpinner message="Loading extinction timeline..." />
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main>
        <section id="timeline" className="timeline">
          <ErrorDisplay 
            message={error} 
            onRetry={() => window.location.reload()} 
          />
        </section>
      </main>
    );
  }

  // Empty state
  if (events.length === 0) {
    return (
      <main>
        <section id="timeline" className="timeline">
          <div className="no-events">
            <h3>No events found</h3>
            <p>Try adjusting your filter selection to see more extinction events.</p>
          </div>
        </section>
      </main>
    );
  }

  // Main timeline content
  return (
    <main>
      <section 
        id="timeline" 
        className="timeline" 
        aria-label="Timeline of extinct animals"
        role="region"
      >
        {events.map((event, index) => (
          <EventMarker
            key={event.id}
            event={event}
            onClick={onEventClick}
            index={index}
            totalEvents={events.length}
          />
        ))}
      </section>
    </main>
  );
};

export default Timeline;
