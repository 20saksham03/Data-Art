/**
 * Event Marker Component
 * Represents a single extinction event on the timeline
 */

import React from 'react';
import type { EventMarkerProps } from '@/types';

const EventMarker: React.FC<EventMarkerProps> = ({ 
  event, 
  onClick, 
  index 
}) => {
  const handleClick = (): void => {
    onClick(event);
  };

  const handleKeyDown = (event: React.KeyboardEvent): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick(event);
    }
  };

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>): void => {
    const img = event.currentTarget;
    img.style.display = 'none';
  };

  const handleLearnMoreClick = (event: React.MouseEvent): void => {
    event.stopPropagation();
    onClick(event);
  };

  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <article 
      className="event"
      data-event-id={event.id}
      data-category={event.category}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={`View details for ${event.title}, extinct in ${event.year}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div 
        className="event-marker" 
        data-year={event.year}
        aria-hidden="true"
      />
      
      <div className="event-content">
        <h2>
          {event.title} <span className="year">({event.year})</span>
        </h2>
        
        <figure>
          <img
            src={event.imageURL}
            alt={event.title}
            loading="lazy"
            onError={handleImageError}
          />
          <figcaption>{event.location}</figcaption>
        </figure>
        
        <p>{truncateText(event.description, 120)}</p>
        
        <div className="event-meta">
          <span className="category-tag">{event.category}</span>
          <button
            className="learn-more-btn"
            onClick={handleLearnMoreClick}
            aria-label={`Learn more about ${event.title}`}
            type="button"
          >
            Learn More
          </button>
        </div>
      </div>
    </article>
  );
};

export default EventMarker;
