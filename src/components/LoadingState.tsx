/**
 * LoadingState Component
 * Display loading indicator with message
 */

import React from 'react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = 'Loading phone model...' 
}) => {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <div className="loading-spinner" />
      <p className="loading-message">{message}</p>
    </div>
  );
};

