/**
 * LoadingSpinner Component
 */

import React from 'react';
import type { LoadingSpinnerProps } from '@/types';

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading...' 
}) => {
  return (
    <div className="loading-indicator" role="status" aria-live="polite">
      <div className="loading-spinner" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
};

export default LoadingSpinner;

/**
 * ErrorDisplay Component
 */

import React from 'react';
import type { ErrorDisplayProps } from '@/types';

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  message, 
  onRetry 
}) => {
  return (
    <div className="error-message" role="alert">
      <h3>⚠️ Error Loading Timeline</h3>
      <p>{message}</p>
      {onRetry && (
        <button 
          onClick={onRetry} 
          className="retry-btn"
          type="button"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export { LoadingSpinner, ErrorDisplay };
