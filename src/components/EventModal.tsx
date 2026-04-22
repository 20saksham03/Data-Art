/**
 * Event Modal Component
 * Displays detailed information about an extinction event using React Portal
 */

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { EventModalProps } from '@/types';

const EventModal: React.FC<EventModalProps> = ({ event, isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus management
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isOpen]);

  // Handle escape key and focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      // Focus trap
      if (event.key === 'Tab') {
        trapFocus(event);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const trapFocus = (event: KeyboardEvent): void => {
    if (!modalRef.current) return;

    const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        event.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        event.preventDefault();
      }
    }
  };

  const handleBackdropClick = (event: React.MouseEvent): void => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>): void => {
    const img = event.currentTarget;
    img.style.display = 'none';
  };

  if (!isOpen || !event) {
    return null;
  }

  const modalContent = (
    <div 
      className={`modal ${isOpen ? 'active' : 'hidden'}`}
      aria-hidden={!isOpen}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={handleBackdropClick}
      ref={modalRef}
    >
      <div className="modal-content">
        <div className="modal-body">
          <button
            ref={closeButtonRef}
            className="close-btn"
            onClick={onClose}
            aria-label="Close modal"
            type="button"
          >
            &times;
          </button>

          <div className="modal-header">
            <h2 id="modal-title">{event.title}</h2>
            <div className="modal-meta">
              <span className="year-large">{event.year}</span>
              <span className="category-tag">{event.category}</span>
            </div>
          </div>

          <div className="modal-image">
            <img
              src={event.imageURL}
              alt={event.title}
              onError={handleImageError}
            />
          </div>

          <div className="modal-content-body">
            <p className="description">{event.description}</p>
            
            <div className="details-grid">
              <div className="detail-item">
                <strong>Location:</strong> {event.location}
              </div>
              <div className="detail-item">
                <strong>Primary Cause:</strong> {event.cause}
              </div>
              <div className="detail-item">
                <strong>Category:</strong> {event.category}
              </div>
              <div className="detail-item">
                <strong>Year of Extinction:</strong> {event.year}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Use portal to render modal at document body level
  return createPortal(modalContent, document.body);
};

export default EventModal;
