/**
 * CameraControls Component
 * Buttons to reset camera position and zoom
 */

import React from 'react';
import { FaSyncAlt, FaSearchPlus } from 'react-icons/fa';

interface CameraControlsProps {
  onResetCamera: () => void;
  onResetZoom: () => void;
  disabled?: boolean;
}

export const CameraControls: React.FC<CameraControlsProps> = ({
  onResetCamera,
  onResetZoom,
  disabled = false,
}) => {
  return (
    <div className="camera-controls">
      <button
        onClick={onResetCamera}
        disabled={disabled}
        className="camera-control-btn"
        aria-label="Reset Camera Rotation"
      >
        <FaSyncAlt /> Reset Rotation
      </button>
      <button
        onClick={onResetZoom}
        disabled={disabled}
        className="camera-control-btn"
        aria-label="Reset Zoom"
      >
        <FaSearchPlus /> Reset Zoom
      </button>
    </div>
  );
};

