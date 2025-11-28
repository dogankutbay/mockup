/**
 * PhoneViewer Component
 * Container for the Three.js 3D phone scene
 */

import React from 'react';

interface PhoneViewerProps {
  mountRef: React.RefObject<HTMLDivElement>;
}

export const PhoneViewer: React.FC<PhoneViewerProps> = ({ mountRef }) => {
  return (
    <div 
      ref={mountRef} 
      className="phone-viewer"
      aria-label="3D Phone Mockup Viewer"
    />
  );
};

