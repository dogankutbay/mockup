/**
 * ErrorMessage Component
 * Display error messages with dismiss functionality
 */

import React from 'react';
import { FaExclamationCircle, FaTimes } from 'react-icons/fa';
import type { AppError } from '../types';

interface ErrorMessageProps {
  error: AppError | null;
  onDismiss: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, onDismiss }) => {
  if (!error) return null;

  return (
    <div className="error-message" role="alert">
      <div className="error-content">
        <span className="error-icon">
          <FaExclamationCircle />
        </span>
        <span className="error-text">{error.message}</span>
      </div>
      <button 
        className="error-dismiss"
        onClick={onDismiss}
        aria-label="Dismiss error"
      >
        <FaTimes />
      </button>
    </div>
  );
};

