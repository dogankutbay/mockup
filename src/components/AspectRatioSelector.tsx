/**
 * AspectRatioSelector Component
 * Choose between square and vertical frame aspect ratios
 */

import React from 'react';
import { FaSquare, FaMobileAlt } from 'react-icons/fa';
import type { FrameAspectRatio } from './ResizableFrame';

interface AspectRatioSelectorProps {
  aspectRatio: FrameAspectRatio;
  onAspectRatioChange: (ratio: FrameAspectRatio) => void;
  disabled?: boolean;
}

export const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({
  aspectRatio,
  onAspectRatioChange,
  disabled = false,
}) => {
  return (
    <div className="aspect-ratio-selector">
      <button
        className={`aspect-ratio-btn ${aspectRatio === 'square' ? 'active' : ''}`}
        onClick={() => onAspectRatioChange('square')}
        disabled={disabled}
        aria-label="Square aspect ratio (1080x1080)"
        title="Square (1080x1080)"
      >
        <FaSquare />
        <span>Square</span>
      </button>
      
      <button
        className={`aspect-ratio-btn ${aspectRatio === 'vertical' ? 'active' : ''}`}
        onClick={() => onAspectRatioChange('vertical')}
        disabled={disabled}
        aria-label="Vertical aspect ratio (600x1080)"
        title="Vertical (600x1080)"
      >
        <FaMobileAlt />
        <span>Vertical</span>
      </button>
    </div>
  );
};

