/**
 * CameraSliders Component
 * Manual camera position control with sliders
 */

import React from 'react';

interface CameraSlidersProps {
  cameraPosition: { x: number; y: number; z: number };
  onPositionChange: (axis: 'x' | 'y' | 'z', value: number) => void;
  disabled?: boolean;
}

export const CameraSliders: React.FC<CameraSlidersProps> = ({
  cameraPosition,
  onPositionChange,
  disabled = false,
}) => {
  return (
    <div className="camera-sliders">
      <div className="camera-slider-group">
        <label className="camera-slider-label">
          <span>X Axis</span>
          <span className="camera-slider-value">{cameraPosition.x.toFixed(2)}</span>
        </label>
        <input
          type="range"
          min="-10"
          max="10"
          step="0.1"
          value={cameraPosition.x}
          onChange={(e) => onPositionChange('x', parseFloat(e.target.value))}
          disabled={disabled}
          className="camera-slider"
        />
      </div>

      <div className="camera-slider-group">
        <label className="camera-slider-label">
          <span>Y Axis</span>
          <span className="camera-slider-value">{cameraPosition.y.toFixed(2)}</span>
        </label>
        <input
          type="range"
          min="-10"
          max="10"
          step="0.1"
          value={cameraPosition.y}
          onChange={(e) => onPositionChange('y', parseFloat(e.target.value))}
          disabled={disabled}
          className="camera-slider"
        />
      </div>

      <div className="camera-slider-group">
        <label className="camera-slider-label">
          <span>Zoom (Z)</span>
          <span className="camera-slider-value">{cameraPosition.z.toFixed(2)}</span>
        </label>
        <input
          type="range"
          min="-5"
          max="20"
          step="0.1"
          value={cameraPosition.z}
          onChange={(e) => onPositionChange('z', parseFloat(e.target.value))}
          disabled={disabled}
          className="camera-slider"
        />
      </div>
    </div>
  );
};

