/**
 * FrameZoomControls Component
 * Controls for zooming the video frame preview
 */

import React from 'react';
import { FaPlus, FaMinus, FaExpand } from 'react-icons/fa';

interface FrameZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  disabled?: boolean;
}

export const FrameZoomControls: React.FC<FrameZoomControlsProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onReset,
  disabled = false,
}) => {
  return (
    <div className="frame-zoom-controls">
      <button
        className="frame-zoom-btn"
        onClick={onZoomOut}
        disabled={disabled || zoom <= 0.3}
        aria-label="Zoom out frame"
        title="Zoom out frame"
      >
        <FaMinus />
      </button>
      
      <button
        className="frame-zoom-btn frame-zoom-reset"
        onClick={onReset}
        disabled={disabled}
        aria-label="Reset frame zoom"
        title="Reset frame zoom"
      >
        <FaExpand />
        <span className="frame-zoom-percentage">{Math.round(zoom * 100)}%</span>
      </button>
      
      <button
        className="frame-zoom-btn"
        onClick={onZoomIn}
        disabled={disabled || zoom >= 1.5}
        aria-label="Zoom in frame"
        title="Zoom in frame"
      >
        <FaPlus />
      </button>
    </div>
  );
};

