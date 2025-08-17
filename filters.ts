/**
 * Filter Component Module
 * Handles category filtering functionality for the timeline
 */

import type { 
  ExtinctionEvent, 
  FilterCategory, 
  FilterState,
  EventHandler,
  CSSClasses,
  HTMLElementWithDataset
} from '@/types';

export type FilterChangeHandler = (filteredEvents: ReadonlyArray<ExtinctionEvent>) => void;

export class FilterComponent {
  private readonly filterButtons: NodeListOf<HTMLElement>;
  private readonly onFilterChange: FilterChangeHandler;
  private allEvents: ReadonlyArray<ExtinctionEvent> = [];
  private currentFilter: FilterCategory = 'All';

  constructor(
    filterButtonsSelector: string,
    onFilterChange: FilterChangeHandler
  ) {
    this.filterButtons = document.querySelectorAll(filterButtonsSelector);
    this.onFilterChange = onFilterChange;
    
    this.validateFilterButtons();
    this.setupEventListeners();
    this.initializeActiveFilter();
  }

  /**
   * Updates the events data for filtering
   * @param events - Array of all extinction events
   */
  updateEvents(events: ReadonlyArray<ExtinctionEvent>): void {
    this.allEvents = events;
    this.applyCurrentFilter();
  }

  /**
   * Gets the current filter state
   * @returns Current filter state
   */
  getFilterState(): FilterState {
    return {
      activeCategory: this.currentFilter,
      filteredEvents: this.getFilteredEvents()
    };
  }

  /**
   * Sets the active filter programmatically
   * @param category - Filter category to set
   */
  setActiveFilter(category: FilterCategory): void {
    if (this.currentFilter === category) return;

    this.currentFilter = category;
    this.updateActiveButton();
    this.applyCurrentFilter();
  }

  /**
   * Gets available filter categories based on loaded events
   * @returns Array of available categories
   */
  getAvailableCategories(): ReadonlyArray<FilterCategory> {
    const categories = new Set<FilterCategory>(['All']);
    
    this.allEvents.forEach(event => {
      categories.add(event.category);
    });
    
    return Array.from(categories);
  }

  /**
   * Gets event count for each category
   * @returns Object mapping categories to event counts
   */
  getCategoryCounts(): Record<FilterCategory, number> {
    const counts: Record<string, number> = {
      'All': this.allEvents.length,
      'Mammals': 0,
      'Birds': 0,
      'Reptiles': 0
    };

    this.allEvents.forEach(event => {
      counts[event.category]++;
    });

    return counts as Record<FilterCategory, number>;
  }

  /**
   * Validates that filter buttons have required data attributes
   */
  private validateFilterButtons(): void {
    if (this.filterButtons.length === 0) {
      throw new Error('No filter buttons found');
    }

    this.filterButtons.forEach((button, index) => {
      const category = this.getButtonCategory(button);
      if (!category) {
        console.warn(`Filter button at index ${index} missing data-category attribute`);
      }
    });
  }

  /**
   * Sets up event listeners for filter buttons
   */
  private setupEventListeners(): void {
    this.filterButtons.forEach(button => {
      button.addEventListener('click', this.handleFilterClick.bind(this));
      button.addEventListener('keydown', this.handleKeyDown.bind(this));
    });
  }

  /**
   * Initializes the active filter from button states
   */
  private initializeActiveFilter(): void {
    const activeButton = this.findActiveButton();
    if (activeButton) {
      const category = this.getButtonCategory(activeButton);
      if (category) {
        this.currentFilter = category;
      }
    }
  }

  /**
   * Handles filter button clicks
   * @param event - Click event
   */
  private handleFilterClick(event: MouseEvent): void {
    const button = event.currentTarget as HTMLElement;
    const category = this.getButtonCategory(button);
    
    if (!category) {
      console.warn('Filter button missing category data');
      return;
    }

    this.setActiveFilter(category);
    
    console.log(`🔍 Filter changed to: ${category}`);
  }

  /**
   * Handles keyboard events for accessibility
   * @param event - Keyboard event
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      (event.currentTarget as HTMLElement).click();
    }
  }

  /**
   * Gets the category from a button's data attribute
   * @param button - Filter button element
   * @returns Category or null if not found
   */
  private getButtonCategory(button: HTMLElement): FilterCategory | null {
    // Try data-category first, then textContent as fallback
    const dataCategory = button.dataset.category;
    if (dataCategory && this.isValidCategory(dataCategory)) {
      return dataCategory as FilterCategory;
    }

    // Fallback to button text content
    const textCategory = button.textContent?.trim();
    if (textCategory && this.isValidCategory(textCategory)) {
      return textCategory as FilterCategory;
    }

    return null;
  }

  /**
   * Validates if a string is a valid filter category
   * @param category - Category string to validate
   * @returns Boolean indicating validity
   */
  private isValidCategory(category: string): category is FilterCategory {
    const validCategories: FilterCategory[] = ['All', 'Mammals', 'Birds', 'Reptiles'];
    return validCategories.includes(category as FilterCategory);
  }

  /**
   * Finds the currently active filter button
   * @returns Active button element or null
   */
  private findActiveButton(): HTMLElement | null {
    for (const button of this.filterButtons) {
      if (button.classList.contains('active' satisfies CSSClasses)) {
        return button;
      }
    }
    return null;
  }

  /**
   * Updates the active button styling
   */
  private updateActiveButton(): void {
    this.filterButtons.forEach(button => {
      const category = this.getButtonCategory(button);
      const isActive = category === this.currentFilter;
      
      button.classList.toggle('active' satisfies CSSClasses, isActive);
      button.setAttribute('aria-pressed', isActive.toString());
    });
  }

  /**
   * Applies the current filter and notifies listeners
   */
  private applyCurrentFilter(): void {
    const filteredEvents = this.getFilteredEvents();
    this.onFilterChange(filteredEvents);
    
    // Update button counts (optional enhancement)
    this.updateButtonCounts();
  }

  /**
   * Gets filtered events based on current filter
   * @returns Array of filtered events
   */
  private getFilteredEvents(): ReadonlyArray<ExtinctionEvent> {
    if (this.currentFilter === 'All') {
      return this.allEvents;
    }

    return this.allEvents.filter(event => event.category === this.currentFilter);
  }

  /**
   * Updates button text with event counts (optional enhancement)
   */
  private updateButtonCounts(): void {
    const counts = this.getCategoryCounts();
    
    this.filterButtons.forEach(button => {
      const category = this.getButtonCategory(button);
      if (category && counts[category] !== undefined) {
        const count = counts[category];
        const originalText = category;
        
        // Only update if button doesn't already have count
        if (!button.textContent?.includes('(')) {
          button.textContent = `${originalText} (${count})`;
        }
      }
    });
  }

  /**
   * Resets all filters to show all events
   */
  reset(): void {
    this.setActiveFilter('All');
  }

  /**
   * Gets statistics about the current filter state
   * @returns Filter statistics
   */
  getFilterStats(): {
    total: number;
    filtered: number;
    activeCategory: FilterCategory;
    categories: Record<FilterCategory, number>;
  } {
    return {
      total: this.allEvents.length,
      filtered: this.getFilteredEvents().length,
      activeCategory: this.currentFilter,
      categories: this.getCategoryCounts()
    };
  }
}

/**
 * Factory function to create a FilterComponent instance
 * @param filterButtonsSelector - CSS selector for filter buttons
 * @param onFilterChange - Callback for filter changes
 * @returns FilterComponent instance
 */
export function createFilterComponent(
  filterButtonsSelector: string,
  onFilterChange: FilterChangeHandler
): FilterComponent {
  return new FilterComponent(filterButtonsSelector, onFilterChange);
}
