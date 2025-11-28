/**
 * ScreenshotGallery Component
 * Displays uploaded screenshot thumbnails with selection
 */

import React from 'react';
import { FaTrash } from 'react-icons/fa';

interface ScreenshotGalleryProps {
  screenshots: string[];
  activeIndex: number;
  onSelectScreenshot: (index: number) => void;
  onClearAll: () => void;
  disabled?: boolean;
}

export const ScreenshotGallery: React.FC<ScreenshotGalleryProps> = ({
  screenshots,
  activeIndex,
  onSelectScreenshot,
  onClearAll,
  disabled = false,
}) => {
  if (screenshots.length === 0) {
    return null;
  }

  return (
    <div className="screenshot-gallery">
      <div className="screenshot-gallery-header">
        <span className="screenshot-gallery-title">Uploaded Screenshots ({screenshots.length})</span>
        <button
          className="btn-clear-all"
          onClick={onClearAll}
          disabled={disabled}
          aria-label="Clear all screenshots"
        >
          <FaTrash /> Clear All
        </button>
      </div>
      
      <div className="screenshot-thumbnails">
        {screenshots.map((screenshot, index) => (
          <button
            key={index}
            className={`screenshot-thumbnail ${index === activeIndex ? 'active' : ''}`}
            onClick={() => onSelectScreenshot(index)}
            disabled={disabled}
            aria-label={`Select screenshot ${index + 1}`}
          >
            <img src={screenshot} alt={`Screenshot ${index + 1}`} />
            <span className="screenshot-number">{index + 1}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

