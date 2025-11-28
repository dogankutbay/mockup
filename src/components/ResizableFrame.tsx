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
      // Vertical: 9:16 ratio (narrower and taller, like a phone screen)
      const height = `${zoom * 80}vh`; // Taller
      const width = `${zoom * 35}vh`; // Narrower - based on height to maintain ratio
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
