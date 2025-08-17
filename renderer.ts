/**
 * Timeline Renderer Module
 * Handles rendering of timeline events and UI updates
 */

import type { 
  ExtinctionEvent, 
  RenderOptions, 
  EventHandler,
  CSSClasses,
  Nullable
} from '@/types';

export class TimelineRenderer {
  private readonly timelineElement: HTMLElement;
  private readonly onEventClick: EventHandler<MouseEvent>;

  constructor(
    timelineElement: HTMLElement, 
    onEventClick: EventHandler<MouseEvent>
  ) {
    this.timelineElement = timelineElement;
    this.onEventClick = onEventClick;
  }

  /**
   * Renders the complete timeline with events
   * @param events - Array of extinction events to render
   * @param options - Rendering options
   */
  render(events: ReadonlyArray<ExtinctionEvent>, options: RenderOptions = {}): void {
    console.log(`🎨 Rendering ${events.length} timeline events`);
    
    // Clear existing content
    this.clearTimeline();

    if (events.length === 0) {
      this.renderEmptyState();
      return;
    }

    // Create document fragment for better performance
    const fragment = document.createDocumentFragment();

    events.forEach((event, index) => {
      const eventElement = this.createEventElement(event, index, options);
      fragment.appendChild(eventElement);
    });

    this.timelineElement.appendChild(fragment);

    // Setup event listeners after rendering
    this.setupEventListeners();

    console.log(`✅ Timeline rendered successfully`);
  }

  /**
   * Creates a single event element
   * @param event - Extinction event data
   * @param index - Event index for positioning
   * @param options - Rendering options
   * @returns HTMLElement for the event
   */
  private createEventElement(
    event: ExtinctionEvent, 
    index: number, 
    options: RenderOptions
  ): HTMLElement {
    const article = document.createElement('article');
    article.className = 'event' satisfies CSSClasses;
    article.dataset.eventId = event.id.toString();
    article.dataset.category = event.category;
    article.setAttribute('role', 'button');
    article.setAttribute('tabindex', '0');
    article.setAttribute('aria-label', `View details for ${event.title}, extinct in ${event.year}`);

    const eventMarker = this.createEventMarker(event);
    const eventContent = this.createEventContent(event, options);

    article.appendChild(eventMarker);
    article.appendChild(eventContent);

    // Add animation class if specified
    if (options.animate) {
      article.style.animationDelay = `${index * 100}ms`;
      article.classList.add('fade-in-animation');
    }

    return article;
  }

  /**
   * Creates the event marker (dot) element
   * @param event - Extinction event data
   * @returns HTMLElement for the marker
   */
  private createEventMarker(event: ExtinctionEvent): HTMLElement {
    const marker = document.createElement('div');
    marker.className = 'event-marker' satisfies CSSClasses;
    marker.dataset.year = event.year.toString();
    marker.setAttribute('aria-hidden', 'true');
    
    // Add category-specific styling
    marker.classList.add(`marker-${event.category.toLowerCase()}`);
    
    return marker;
  }

  /**
   * Creates the event content section
   * @param event - Extinction event data
   * @param options - Rendering options
   * @returns HTMLElement for the content
   */
  private createEventContent(event: ExtinctionEvent, options: RenderOptions): HTMLElement {
    const content = document.createElement('div');
    content.className = 'event-content' satisfies CSSClasses;

    // Create title with year
    const title = this.createEventTitle(event);
    content.appendChild(title);

    // Create figure with image (if not skipped)
    if (!options.skipImages) {
      const figure = this.createEventFigure(event);
      content.appendChild(figure);
    }

    // Create description
    const description = this.createEventDescription(event);
    content.appendChild(description);

    // Create metadata section
    const meta = this.createEventMeta(event);
    content.appendChild(meta);

    return content;
  }

  /**
   * Creates the event title element
   * @param event - Extinction event data
   * @returns HTMLElement for the title
   */
  private createEventTitle(event: ExtinctionEvent): HTMLElement {
    const title = document.createElement('h2');
    
    const titleText = document.createElement('span');
    titleText.textContent = event.title;
    
    const yearSpan = document.createElement('span');
    yearSpan.className = 'year';
    yearSpan.textContent = `(${event.year})`;
    
    title.appendChild(titleText);
    title.appendChild(document.createTextNode(' '));
    title.appendChild(yearSpan);
    
    return title;
  }

  /**
   * Creates the event figure with image
   * @param event - Extinction event data
   * @returns HTMLElement for the figure
   */
  private createEventFigure(event: ExtinctionEvent): HTMLElement {
    const figure = document.createElement('figure');
    
    const img = document.createElement('img');
    img.src = event.imageURL;
    img.alt = event.title;
    img.loading = 'lazy';
    img.onerror = this.handleImageError.bind(this);
    
    const caption = document.createElement('figcaption');
    caption.textContent = event.location;
    
    figure.appendChild(img);
    figure.appendChild(caption);
    
    return figure;
  }

  /**
   * Creates the event description
   * @param event - Extinction event data
   * @returns HTMLElement for the description
   */
  private createEventDescription(event: ExtinctionEvent): HTMLElement {
    const p = document.createElement('p');
    p.textContent = this.truncateText(event.description, 120);
    return p;
  }

  /**
   * Creates the event metadata section
   * @param event - Extinction event data
   * @returns HTMLElement for the metadata
   */
  private createEventMeta(event: ExtinctionEvent): HTMLElement {
    const meta = document.createElement('div');
    meta.className = 'event-meta';
    
    const categoryTag = document.createElement('span');
    categoryTag.className = 'category-tag';
    categoryTag.textContent = event.category;
    
    const learnMoreBtn = document.createElement('button');
    learnMoreBtn.className = 'learn-more-btn';
    learnMoreBtn.textContent = 'Learn More';
    learnMoreBtn.dataset.eventId = event.id.toString();
    learnMoreBtn.setAttribute('aria-label', `Learn more about ${event.title}`);
    
    meta.appendChild(categoryTag);
    meta.appendChild(learnMoreBtn);
    
    return meta;
  }

  /**
   * Sets up event listeners for timeline interactions
   */
  private setupEventListeners(): void {
    this.timelineElement.addEventListener('click', this.onEventClick);
    this.timelineElement.addEventListener('keydown', this.handleKeydown.bind(this));
  }

  /**
   * Handles keyboard navigation for accessibility
   * @param event - Keyboard event
   */
  private handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      const target = event.target as HTMLElement;
      if (target.classList.contains('event')) {
        event.preventDefault();
        target.click();
      }
    }
  }

  /**
   * Handles image loading errors
   * @param event - Error event
   */
  private handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    console.warn(`⚠️ Failed to load image: ${img.src}`);
  }

  /**
   * Clears the timeline content
   */
  private clearTimeline(): void {
    // Remove event listeners before clearing
    this.timelineElement.removeEventListener('click', this.onEventClick);
    this.timelineElement.innerHTML = '';
  }

  /**
   * Renders empty state when no events match filter
   */
  private renderEmptyState(): void {
    this.timelineElement.innerHTML = `
      <div class="no-events">
        <h3>No events found</h3>
        <p>Try adjusting your filter selection to see more extinction events.</p>
      </div>
    `;
  }

  /**
   * Renders error state
   * @param message - Error message to display
   */
  renderError(message: string): void {
    this.timelineElement.innerHTML = `
      <div class="error-message">
        <h3>⚠️ Error Loading Timeline</h3>
        <p>${this.escapeHtml(message)}</p>
        <button onclick="location.reload()" class="retry-btn">Try Again</button>
      </div>
    `;
  }

  /**
   * Shows/hides loading indicator
   * @param isLoading - Whether to show loading state
   */
  setLoading(isLoading: boolean): void {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
      loadingElement.style.display = isLoading ? 'block' : 'none';
    }
  }

  /**
   * Utility function to truncate text
   * @param text - Text to truncate
   * @param maxLength - Maximum length
   * @returns Truncated text
   */
  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  /**
   * Utility function to escape HTML
   * @param text - Text to escape
   * @returns Escaped text
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

/**
 * Factory function to create a TimelineRenderer instance
 * @param timelineSelector - CSS selector for timeline element
 * @param onEventClick - Event click handler
 * @returns TimelineRenderer instance or null if element not found
 */
export function createTimelineRenderer(
  timelineSelector: string, 
  onEventClick: EventHandler<MouseEvent>
): Nullable<TimelineRenderer> {
  const timelineElement = document.querySelector<HTMLElement>(timelineSelector);
  
  if (!timelineElement) {
    console.error(`❌ Timeline element not found: ${timelineSelector}`);
    return null;
  }
  
  return new TimelineRenderer(timelineElement, onEventClick);
}
