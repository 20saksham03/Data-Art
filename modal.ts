/**
 * Modal Component Module
 * Handles modal display and interaction for extinction event details
 */

import type { 
  ExtinctionEvent, 
  EventHandler,
  CSSClasses,
  Nullable
} from '@/types';

export class ModalComponent {
  private readonly modal: HTMLElement;
  private readonly modalContent: HTMLElement;
  private readonly backdrop: HTMLElement;
  private isOpen = false;
  private currentEvent: Nullable<ExtinctionEvent> = null;

  constructor(modal: HTMLElement) {
    this.modal = modal;
    this.modalContent = this.getModalContent();
    this.backdrop = modal; // The modal itself acts as backdrop
    
    this.setupEventListeners();
    this.setupAccessibility();
  }

  /**
   * Opens modal with extinction event details
   * @param event - Extinction event to display
   */
  open(event: ExtinctionEvent): void {
    console.log(`📖 Opening modal for: ${event.title}`);
    
    this.currentEvent = event;
    this.renderModalContent(event);
    this.showModal();
    this.manageFocus();
  }

  /**
   * Closes the modal
   */
  close(): void {
    if (!this.isOpen) return;
    
    console.log('❌ Closing modal');
    
    this.hideModal();
    this.currentEvent = null;
    this.restoreFocus();
  }

  /**
   * Checks if modal is currently open
   * @returns Boolean indicating modal state
   */
  isModalOpen(): boolean {
    return this.isOpen;
  }

  /**
   * Gets the currently displayed event
   * @returns Current event or null
   */
  getCurrentEvent(): Nullable<ExtinctionEvent> {
    return this.currentEvent;
  }

  /**
   * Renders the modal content with event details
   * @param event - Extinction event data
   */
  private renderModalContent(event: ExtinctionEvent): void {
    const modalBody = this.createModalBody(event);
    
    // Clear existing content and add new content
    this.modalContent.innerHTML = '';
    this.modalContent.appendChild(modalBody);
    
    // Re-setup close button listener
    this.setupCloseButton();
  }

  /**
   * Creates the complete modal body content
   * @param event - Extinction event data
   * @returns HTMLElement with modal content
   */
  private createModalBody(event: ExtinctionEvent): HTMLElement {
    const container = document.createElement('div');
    container.className = 'modal-body';

    // Close button
    const closeBtn = this.createCloseButton();
    container.appendChild(closeBtn);

    // Header section
    const header = this.createModalHeader(event);
    container.appendChild(header);

    // Image section
    const image = this.createModalImage(event);
    container.appendChild(image);

    // Content section
    const content = this.createModalContentBody(event);
    container.appendChild(content);

    return container;
  }

  /**
   * Creates the close button
   * @returns HTMLElement for close button
   */
  private createCloseButton(): HTMLElement {
    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-btn';
    closeBtn.innerHTML = '&times;';
    closeBtn.setAttribute('aria-label', 'Close modal');
    closeBtn.setAttribute('type', 'button');
    return closeBtn;
  }

  /**
   * Creates the modal header with title and metadata
   * @param event - Extinction event data
   * @returns HTMLElement for header
   */
  private createModalHeader(event: ExtinctionEvent): HTMLElement {
    const header = document.createElement('div');
    header.className = 'modal-header';

    const title = document.createElement('h2');
    title.id = 'modal-title';
    title.textContent = event.title;

    const meta = document.createElement('div');
    meta.className = 'modal-meta';

    const yearBadge = document.createElement('span');
    yearBadge.className = 'year-large';
    yearBadge.textContent = event.year.toString();

    const categoryTag = document.createElement('span');
    categoryTag.className = 'category-tag';
    categoryTag.textContent = event.category;

    meta.appendChild(yearBadge);
    meta.appendChild(categoryTag);

    header.appendChild(title);
    header.appendChild(meta);

    return header;
  }

  /**
   * Creates the modal image section
   * @param event - Extinction event data
   * @returns HTMLElement for image
   */
  private createModalImage(event: ExtinctionEvent): HTMLElement {
    const imageContainer = document.createElement('div');
    imageContainer.className = 'modal-image';

    const img = document.createElement('img');
    img.src = event.imageURL;
    img.alt = event.title;
    img.loading = 'eager'; // Load immediately for modal
    img.onerror = this.handleImageError.bind(this);

    imageContainer.appendChild(img);
    return imageContainer;
  }

  /**
   * Creates the modal content body with description and details
   * @param event - Extinction event data
   * @returns HTMLElement for content body
   */
  private createModalContentBody(event: ExtinctionEvent): HTMLElement {
    const contentBody = document.createElement('div');
    contentBody.className = 'modal-content-body';

    // Description
    const description = document.createElement('p');
    description.className = 'description';
    description.textContent = event.description;

    // Details grid
    const detailsGrid = this.createDetailsGrid(event);

    contentBody.appendChild(description);
    contentBody.appendChild(detailsGrid);

    return contentBody;
  }

  /**
   * Creates the details grid with event information
   * @param event - Extinction event data
   * @returns HTMLElement for details grid
   */
  private createDetailsGrid(event: ExtinctionEvent): HTMLElement {
    const grid = document.createElement('div');
    grid.className = 'details-grid';

    const details = [
      { label: 'Location', value: event.location },
      { label: 'Primary Cause', value: event.cause },
      { label: 'Category', value: event.category },
      { label: 'Year of Extinction', value: event.year.toString() }
    ];

    details.forEach(detail => {
      const item = document.createElement('div');
      item.className = 'detail-item';
      
      const label = document.createElement('strong');
      label.textContent = `${detail.label}: `;
      
      const value = document.createTextNode(detail.value);
      
      item.appendChild(label);
      item.appendChild(value);
      grid.appendChild(item);
    });

    return grid;
  }

  /**
   * Shows the modal with animation
   */
  private showModal(): void {
    this.modal.classList.remove('hidden' satisfies CSSClasses);
    this.modal.classList.add('active' satisfies CSSClasses);
    this.modal.setAttribute('aria-hidden', 'false');
    
    // Enable scrolling prevention on body
    document.body.style.overflow = 'hidden';
    
    this.isOpen = true;
  }

  /**
   * Hides the modal with animation
   */
  private hideModal(): void {
    this.modal.classList.add('hidden' satisfies CSSClasses);
    this.modal.classList.remove('active' satisfies CSSClasses);
    this.modal.setAttribute('aria-hidden', 'true');
    
    // Restore scrolling on body
    document.body.style.overflow = '';
    
    this.isOpen = false;
  }

  /**
   * Sets up event listeners for modal interactions
   */
  private setupEventListeners(): void {
    // Backdrop click
    this.modal.addEventListener('click', this.handleBackdropClick.bind(this));
    
    // Keyboard events
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    
    // Prevent event bubbling on modal content
    this.modalContent.addEventListener('click', (event) => {
      event.stopPropagation();
    });
  }

  /**
   * Sets up close button event listener
   */
  private setupCloseButton(): void {
    const closeBtn = this.modalContent.querySelector('.close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }
  }

  /**
   * Sets up accessibility attributes
   */
  private setupAccessibility(): void {
    this.modal.setAttribute('role', 'dialog');
    this.modal.setAttribute('aria-modal', 'true');
    this.modal.setAttribute('aria-labelledby', 'modal-title');
  }

  /**
   * Handles backdrop clicks to close modal
   * @param event - Click event
   */
  private handleBackdropClick(event: MouseEvent): void {
    if (event.target === this.modal) {
      this.close();
    }
  }

  /**
   * Handles keyboard events for modal
   * @param event - Keyboard event
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.isOpen) return;

    switch (event.key) {
      case 'Escape':
        this.close();
        break;
      case 'Tab':
        this.handleTabNavigation(event);
        break;
    }
  }

  /**
   * Handles tab navigation within modal for accessibility
   * @param event - Keyboard event
   */
  private handleTabNavigation(event: KeyboardEvent): void {
    const focusableElements = this.getFocusableElements();
    
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        lastElement.focus();
        event.preventDefault();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        firstElement.focus();
        event.preventDefault();
      }
    }
  }

  /**
   * Gets all focusable elements within the modal
   * @returns Array of focusable elements
   */
  private getFocusableElements(): HTMLElement[] {
    const selectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'textarea:not([disabled])',
      'select:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');

    return Array.from(this.modal.querySelectorAll<HTMLElement>(selectors));
  }

  /**
   * Manages focus when modal opens
   */
  private manageFocus(): void {
    const closeBtn = this.modalContent.querySelector<HTMLElement>('.close-btn');
    if (closeBtn) {
      closeBtn.focus();
    }
  }

  /**
   * Restores focus when modal closes
   */
  private restoreFocus(): void {
    // Focus could be restored to the element that opened the modal
    // For now, just blur any focused element
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }

  /**
   * Gets the modal content element
   * @returns Modal content element
   */
  private getModalContent(): HTMLElement {
    const content = this.modal.querySelector<HTMLElement>('.modal-content');
    if (!content) {
      throw new Error('Modal content element not found');
    }
    return content;
  }

  /**
   * Handles image loading errors in modal
   * @param event - Error event
   */
  private handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    const container = img.parentElement;
    if (container) {
      container.style.display = 'none';
    }
    console.warn(`⚠️ Failed to load modal image: ${img.src}`);
  }
}

/**
 * Factory function to create a ModalComponent instance
 * @param modalSelector - CSS selector for modal element
 * @returns ModalComponent instance or null if element not found
 */
export function createModalComponent(modalSelector: string): Nullable<ModalComponent> {
  const modalElement = document.querySelector<HTMLElement>(modalSelector);
  
  if (!modalElement) {
    console.error(`❌ Modal element not found: ${modalSelector}`);
    return null;
  }
  
  return new ModalComponent(modalElement);
}
