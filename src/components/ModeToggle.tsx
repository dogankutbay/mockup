/**
 * ModeToggle Component
 * Switch between Picture and Video modes
 */

import React from 'react';
import { FaImage, FaVideo } from 'react-icons/fa';

export type AppMode = 'picture' | 'video';

interface ModeToggleProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

export const ModeToggle: React.FC<ModeToggleProps> = ({ mode, onModeChange }) => {
  return (
    <div className="mode-toggle-wrapper">
      <div className="mode-toggle">
        <button
          className={`mode-toggle-btn ${mode === 'picture' ? 'active' : ''}`}
          onClick={() => onModeChange('picture')}
          aria-label="Picture mode"
        >
          <FaImage />
          <span>Picture mode</span>
        </button>
        <button
          className={`mode-toggle-btn ${mode === 'video' ? 'active' : ''}`}
          onClick={() => onModeChange('video')}
          aria-label="Video mode"
        >
          <FaVideo />
          <span>Video mode</span>
        </button>
      </div>
    </div>
  );
};

