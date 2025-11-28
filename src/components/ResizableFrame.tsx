/**
 * ResizableFrame Component
 * Frame for video mode with preset aspect ratios
 */

import React from 'react';

export type FrameAspectRatio = 'square' | 'vertical';

interface ResizableFrameProps {
  zoom: number;
  aspectRatio: FrameAspectRatio;
}

export const ResizableFrame: React.FC<ResizableFrameProps> = ({ zoom, aspectRatio }) => {
  // Calculate dimensions based on aspect ratio
  const getDimensions = () => {
    if (aspectRatio === 'square') {
      // Square: 1080x1080
      const size = `min(${zoom * 70}vh, ${zoom * 70}vw)`;
      return { width: size, height: size };
    } else {
      // Vertical: 600x1080 (9:16-ish ratio for phone)
      const width = `${zoom * 40}vw`; // Narrower
      const height = `${zoom * 70}vh`; // Taller
      return { width, height };
    }
  };

  const dimensions = getDimensions();

  return (
    <div 
      className="video-frame-indicator"
      style={{ 
        width: dimensions.width,
        height: dimensions.height,
      }}
    />
  );
};

