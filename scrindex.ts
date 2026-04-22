/**
 * Animal Extinction Timeline - Main Application
 * TypeScript implementation with modular architecture
 */

import type { 
  ExtinctionEvent, 
  AppConfig, 
  AppState,
  TimelineError
} from '@/types';

import { createDataFetcher } from '@/utils/fetcher';
import { createTimelineRenderer } from '@/components/renderer';
import { createModalComponent } from '@/components/modal';
import { createFilterComponent } from '@/components/filters';
import { createThemeComponent } from '@/components/theme';

/**
 * Main Application Class
 * Coordinates all components and manages application state
 */
class ExtinctionTimelineApp {
  private readonly config: AppConfig;
  private readonly dataFetcher;
  private readonly timelineRenderer;
  private readonly modalComponent;
  private readonly filterComponent;
  private readonly themeComponent;
  
  private appState: AppState = {
    events: [],
    filter: {
      activeCategory: 'All',
      filteredEvents: []
    },
    theme: 'light',
    isLoading: false,
    error: null
  };

  constructor(config: AppConfig) {
    this.config = config;
    
    // Initialize components
    this.dataFetcher = createDataFetcher(config.dataUrl);
    
    this.timelineRenderer = createTimelineRenderer(
      config.selectors.timeline,
      this.handleTimelineClick.bind(this)
    );
    
    this.modalComponent = createModalComponent(config.selectors.modal);
    
    this.filterComponent = createFilterComponent(
      config.selectors.filterButtons,
      this.handleFilterChange.bind(this)
    );
    
    this.themeComponent = createThemeComponent(
      config.selectors.themeToggle,
      this.handleThemeChange.bind(this)
    );

    // Validate required components
    this.validateComponents();
  }

  /**
   * Initializes the application
   */
  async initialize(): Promise<void> {
    try {
      console.log('🚀 Initializing Animal Extinction Timeline...');
      
      this.setLoadingState(true);
      
      // Load extinction events data
      const events = await this.loadEvents();
      
      // Update application state
      this.updateAppState({
        events,
        filter: {
          activeCategory: 'All',
          filteredEvents: events
        },
        error: null
      });
      
      // Initialize components with data
      this.initializeComponentsWithData(events);
      
      // Render initial timeline
      this.renderTimeline(events);
      
      this.setLoadingState(false);
      
      console.log('✅ Application initialized successfully!');
      
    } catch (error) {
      this.handleApplicationError(error);
    }
  }

  /**
   * Handles timeline event clicks (markers and buttons)
   * @param event - Mouse click event
   */
  private handleTimelineClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    
    // Find the event article element
    const eventElement = target.closest('.event') as HTMLElement;
    if (!eventElement) return;

    // Get event ID and find corresponding data
    const eventId = parseInt(eventElement.dataset.eventId || '0');
    const eventData = this.appState.events.find(e => e.id === eventId);
    
    if (eventData && this.modalComponent) {
      this.modalComponent.open(eventData);
    }
  }

  /**
   * Handles filter changes
   * @param filteredEvents - Array of filtered events
   */
  private handleFilterChange(filteredEvents: ReadonlyArray<ExtinctionEvent>): void {
    console.log(`🔍 Filter applied: ${filteredEvents.length} events shown`);
    
    this.updateAppState({
      filter: {
        ...this.appState.filter,
        filteredEvents
      }
    });
    
    this.renderTimeline(filteredEvents);
  }

  /**
   * Handles theme changes
   * @param theme - New theme
   */
  private handleThemeChange(theme: AppState['theme']): void {
    console.log(`🎨 Theme changed to: ${theme}`);
    
    this.updateAppState({ theme });
  }

  /**
   * Loads extinction events from API
   * @returns Promise resolving to events array
   */
  private async loadEvents(): Promise<ReadonlyArray<ExtinctionEvent>> {
    try {
      // Add minimum loading time for better UX
      const [events] = await Promise.all([
        this.dataFetcher.fetchEvents(),
        this.minimumLoadingTime()
      ]);
      
      return events;
      
    } catch (error) {
      console.error('Failed to load events:', error);
      throw error;
    }
  }

  /**
   * Ensures minimum loading time for smooth UX
   * @returns Promise that resolves after minimum duration
   */
  private minimumLoadingTime(): Promise<void> {
    return new Promise(resolve => {
      setTimeout(resolve, this.config.animations.loadingMinDuration);
    });
  }

  /**
   * Initializes components with loaded data
   * @param events - Array of extinction events
   */
  private initializeComponentsWithData(events: ReadonlyArray<ExtinctionEvent>): void {
    // Update filter component with events
    this.filterComponent.updateEvents(events);
    
    console.log(`📊 Components initialized with ${events.length} events`);
  }

  /**
   * Renders the timeline with given events
   * @param events - Events to render
   */
  private renderTimeline(events: ReadonlyArray<ExtinctionEvent>): void {
    if (!this.timelineRenderer) {
      console.error('Timeline renderer not available');
      return;
    }

    this.timelineRenderer.render(events, {
      animate: !this.appState.isLoading
    });
  }

  /**
   * Sets loading state and updates UI
   * @param isLoading - Loading state
   */
  private setLoadingState(isLoading: boolean): void {
    this.updateAppState({ isLoading });
    
    if (this.timelineRenderer) {
      this.timelineRenderer.setLoading(isLoading);
    }
  }

  /**
   * Handles application-level errors
   * @param error - Error that occurred
   */
  private handleApplicationError(error: unknown): void {
    console.error('❌ Application error:', error);
    
    let errorMessage = 'An unexpected error occurred.';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    this.updateAppState({
      error: errorMessage,
      isLoading: false
    });
    
    if (this.timelineRenderer) {
      this.timelineRenderer.renderError(errorMessage);
      this.timelineRenderer.setLoading(false);
    }
  }

  /**
   * Updates application state
   * @param partialState - Partial state to merge
   */
  private updateAppState(partialState: Partial<AppState>): void {
    this.appState = {
      ...this.appState,
      ...partialState
    };
  }

  /**
   * Validates that all required components were created successfully
   */
  private validateComponents(): void {
    const components = {
      'Timeline Renderer': this.timelineRenderer,
      'Modal Component': this.modalComponent,
      'Filter Component': this.filterComponent,
      'Theme Component': this.themeComponent,
      'Data Fetcher': this.dataFetcher
    };

    const missingComponents = Object.entries(components)
      .filter(([, component]) => !component)
      .map(([name]) => name);

    if (missingComponents.length > 0) {
      throw new Error(`Failed to initialize components: ${missingComponents.join(', ')}`);
    }
  }

  /**
   * Gets current application state (for debugging)
   * @returns Current application state
   */
  getAppState(): Readonly<AppState> {
    return this.appState;
  }

  /**
   * Gets application statistics
   * @returns Application statistics
   */
  getStatistics() {
    const filterStats = this.filterComponent.getFilterStats();
    const themeInfo = this.themeComponent.getThemeInfo();
    
    return {
      events: {
        total: this.appState.events.length,
        filtered: this.appState.filter.filteredEvents.length,
        categories: filterStats.categories
      },
      filter: {
        active: filterStats.activeCategory,
        available: this.filterComponent.getAvailableCategories()
      },
      theme: themeInfo,
      state: {
        isLoading: this.appState.isLoading,
        hasError: !!this.appState.error
      }
    };
  }
}

/**
 * Application Configuration
 */
const APP_CONFIG: AppConfig = {
  dataUrl: './data/events.json',
  selectors: {
    timeline: '#timeline',
    modal: '#modal',
    modalContent: '.modal-content',
    closeBtn: '.close-btn',
    themeToggle: '#theme-toggle',
    filterButtons: '.filter-btn',
    loading: '#loading'
  },
  animations: {
    modalTransitionDuration: 300,
    loadingMinDuration: 1000
  }
};

/**
 * Application Entry Point
 * Initializes the application when DOM is ready
 */
async function initializeApp(): Promise<void> {
  try {
    const app = new ExtinctionTimelineApp(APP_CONFIG);
    await app.initialize();
    
    // Make app available globally for debugging
    (window as any).extinctionTimelineApp = app;
    
  } catch (error) {
    console.error('💥 Failed to initialize application:', error);
    
    // Show user-friendly error message
    const timelineElement = document.querySelector('#timeline');
    if (timelineElement) {
      timelineElement.innerHTML = `
        <div class="error-message">
          <h3>⚠️ Application Failed to Load</h3>
          <p>There was a problem starting the timeline. Please refresh the page to try again.</p>
          <button onclick="location.reload()" class="retry-btn">Refresh Page</button>
        </div>
      `;
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// Export for potential external use
export { ExtinctionTimelineApp, APP_CONFIG };

// Log successful script load
console.log('🦕 Animal Extinction Timeline TypeScript Module Loaded!');
