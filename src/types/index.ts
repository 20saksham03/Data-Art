/**
 * React Timeline Application - Type Definitions
 */

import { ReactNode } from 'react';

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

// React component props types
export interface HeaderProps {
  theme: Theme;
  onThemeToggle: () => void;
}

export interface TimelineProps {
  events: ReadonlyArray<ExtinctionEvent>;
  onEventClick: (event: ExtinctionEvent) => void;
  isLoading?: boolean;
  error?: string | null;
}

export interface EventMarkerProps {
  event: ExtinctionEvent;
  onClick: (event: ExtinctionEvent) => void;
  index: number;
  totalEvents: number;
}

export interface EventModalProps {
  event: ExtinctionEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export interface FilterPanelProps {
  activeFilter: FilterCategory;
  onFilterChange: (category: FilterCategory) => void;
  eventCounts: Record<FilterCategory, number>;
}

export interface LoadingSpinnerProps {
  message?: string;
}

export interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
}

// Hook return types
export interface UseExtinctionEventsReturn {
  events: ReadonlyArray<ExtinctionEvent>;
  filteredEvents: ReadonlyArray<ExtinctionEvent>;
  isLoading: boolean;
  error: string | null;
  activeFilter: FilterCategory;
  setActiveFilter: (filter: FilterCategory) => void;
  refetch: () => Promise<void>;
}

export interface UseThemeReturn {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export interface UseModalReturn {
  isOpen: boolean;
  selectedEvent: ExtinctionEvent | null;
  openModal: (event: ExtinctionEvent) => void;
  closeModal: () => void;
}

// Application state types
export interface AppState {
  readonly events: ReadonlyArray<ExtinctionEvent>;
  readonly filteredEvents: ReadonlyArray<ExtinctionEvent>;
  readonly activeFilter: FilterCategory;
  readonly selectedEvent: ExtinctionEvent | null;
  readonly isModalOpen: boolean;
  readonly theme: Theme;
  readonly isLoading: boolean;
  readonly error: string | null;
}

// Event handlers
export type EventClickHandler = (event: ExtinctionEvent) => void;
export type FilterChangeHandler = (category: FilterCategory) => void;
export type ThemeToggleHandler = () => void;

// Utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

// CSS class types
export interface TimelineClasses {
  container: string;
  timeline: string;
  event: string;
  marker: string;
  content: string;
  loading: string;
  error: string;
}

// Animation types
export interface AnimationConfig {
  readonly duration: number;
  readonly easing: string;
  readonly delay?: number;
}

// Portal types for modal
export interface PortalProps {
  children: ReactNode;
  containerId?: string;
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

// Constants
export const enum StorageKeys {
  THEME = 'extinction-timeline-theme-react',
  FILTER = 'extinction-timeline-filter'
}

export const enum CSSClasses {
  DARK_THEME = 'dark-theme',
  MODAL_OPEN = 'modal-open',
  EVENT_ACTIVE = 'event-active',
  FILTER_ACTIVE = 'filter-active',
  LOADING = 'loading',
  ERROR = 'error'
}

// Configuration
export interface AppConfig {
  readonly dataUrl: string;
  readonly animations: {
    readonly modalDuration: number;
    readonly timelineFadeIn: number;
    readonly markerHover: number;
  };
  readonly breakpoints: {
    readonly mobile: number;
    readonly tablet: number;
    readonly desktop: number;
  };
}
