/**
 * Custom hook for modal management
 */

import { useState, useCallback, useEffect } from 'react';
import type { ExtinctionEvent, UseModalReturn } from '@/types';

export function useModal(): UseModalReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ExtinctionEvent | null>(null);

  /**
   * Opens modal with specified event
   */
  const openModal = useCallback((event: ExtinctionEvent): void => {
    setSelectedEvent(event);
    setIsOpen(true);
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    console.log(`📖 Modal opened for: ${event.title}`);
  }, []);

  /**
   * Closes modal and resets state
   */
  const closeModal = useCallback((): void => {
    setIsOpen(false);
    setSelectedEvent(null);
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    console.log('❌ Modal closed');
  }, []);

  /**
   * Handle escape key to close modal
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && isOpen) {
        closeModal();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, closeModal]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      // Ensure body scroll is restored if component unmounts with modal open
      document.body.style.overflow = '';
    };
  }, []);

  return {
    isOpen,
    selectedEvent,
    openModal,
    closeModal
  };
}
