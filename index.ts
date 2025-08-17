/**
 * Animal Extinction Timeline - Type Definitions
 * Defines interfaces and types for the timeline application
 */

// Animal category types
export type AnimalCategory = 'Mammals' | 'Birds' | 'Reptiles';

// Filter types (includes 'All' for UI)
export type FilterCategory = AnimalCategory | 'All';

// Theme types
export type Theme = 'light' | 'dark';

// Base extinction event interface
export interface ExtinctionEvent {
  readonly id: number;
  readonly year: number;
  readonly title: string;
  readonly description: string;
  readonly imageURL: string;
  readonly category: AnimalCategory;
  readonly location: string;
  readonly cause: string;
}

// API response structure
export interface ExtinctionEventsResponse {
  readonly events: ReadonlyArray<ExtinctionEvent>;
}

// DOM element selectors as constants
export interface DOMSelectors {
  readonly timeline: string;
  readonly modal: string;
  readonly modalContent: string;
  readonly closeBtn: string;
  readonly themeToggle: string;
  readonly filterButtons: string;
  readonly loading: string;
}

// Application configuration
export interface AppConfig {
  readonly dataUrl: string;
  readonly selectors: DOMSelectors;
  readonly animations: {
    readonly modalTransitionDuration: number;
    readonly loadingMinDuration: number;
  };
}

// Event handler types
export type EventHandler<T = Event> = (event: T) => void;
export type AsyncEventHandler<T = Event> = (event: T) => Promise<void>;

// Modal data for rendering
export interface ModalData {
  readonly event: ExtinctionEvent;
}

// Filter state
export interface FilterState {
  readonly activeCategory: FilterCategory;
  readonly filteredEvents: ReadonlyArray<ExtinctionEvent>;
}

// Application state
export interface AppState {
  readonly events: ReadonlyArray<ExtinctionEvent>;
  readonly filter: FilterState;
  readonly theme: Theme;
  readonly isLoading: boolean;
  readonly error: string | null;
}

// Error types
export class TimelineError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'TimelineError';
  }
}

// Utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

// DOM utility types
export type HTMLElementWithDataset<T extends string> = HTMLElement & {
  dataset: Record<T, string>;
};

// Event marker position calculation
export interface TimelinePosition {
  readonly percentage: number;
  readonly year: number;
}

// Rendering options
export interface RenderOptions {
  readonly animate?: boolean;
  readonly skipImages?: boolean;
}

// Local storage keys
export const enum StorageKeys {
  THEME = 'extinction-timeline-theme'
}

// CSS class names as constants
export const enum CSSClasses {
  EVENT = 'event',
  EVENT_MARKER = 'event-marker',
  EVENT_CONTENT = 'event-content',
  MODAL_ACTIVE = 'active',
  MODAL_HIDDEN = 'hidden',
  FILTER_ACTIVE = 'active',
  DARK_THEME = 'dark-theme',
  LOADING = 'loading-indicator'
}
