/**
 * ResizableFrame Component
 * Resizable frame for video mode (can be square or rectangle)
 */

import React, { useState, useRef, useEffect } from 'react';

interface ResizableFrameProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

export const ResizableFrame: React.FC<ResizableFrameProps> = ({ zoom, onZoomChange }) => {
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [frameSize, setFrameSize] = useState({ width: 70, height: 70 }); // percentage
  const frameRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const handleMouseDown = (e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    setIsDragging(handle);
    startPosRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: frameSize.width,
      height: frameSize.height,
    };
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startPosRef.current.x;
      const deltaY = e.clientY - startPosRef.current.y;
      
      let newWidth = startPosRef.current.width;
      let newHeight = startPosRef.current.height;
      
      // Calculate size change based on which handle is being dragged
      const scaleFactor = 0.1; // Sensitivity
      
      if (isDragging.includes('right') || isDragging.includes('left')) {
        const widthDelta = isDragging.includes('left') ? -deltaX : deltaX;
        newWidth = Math.max(20, Math.min(90, startPosRef.current.width + widthDelta * scaleFactor));
      }
      
      if (isDragging.includes('top') || isDragging.includes('bottom')) {
        const heightDelta = isDragging.includes('top') ? -deltaY : deltaY;
        newHeight = Math.max(20, Math.min(90, startPosRef.current.height + heightDelta * scaleFactor));
      }
      
      setFrameSize({ width: newWidth, height: newHeight });
      
      // Update zoom based on average of width and height
      const avgSize = (newWidth + newHeight) / 2;
      onZoomChange(avgSize / 100);
    };

    const handleMouseUp = () => {
      setIsDragging(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onZoomChange]);

  // Sync frameSize with zoom prop when zoom changes externally (from +/- buttons)
  useEffect(() => {
    const size = zoom * 100;
    setFrameSize({ width: size, height: size });
  }, [zoom]);

  return (
    <div 
      ref={frameRef}
      className={`video-frame-indicator ${isDragging ? 'dragging' : ''}`}
      style={{ 
        width: `min(${frameSize.width}vw, ${frameSize.width}vh)`,
        height: `min(${frameSize.height}vh, ${frameSize.height}vw)`,
      }}
    >
      {/* Corner handles */}
      <div 
        className="resize-handle corner top-left"
        onMouseDown={(e) => handleMouseDown(e, 'top-left')}
      />
      <div 
        className="resize-handle corner top-right"
        onMouseDown={(e) => handleMouseDown(e, 'top-right')}
      />
      <div 
        className="resize-handle corner bottom-left"
        onMouseDown={(e) => handleMouseDown(e, 'bottom-left')}
      />
      <div 
        className="resize-handle corner bottom-right"
        onMouseDown={(e) => handleMouseDown(e, 'bottom-right')}
      />
      
      {/* Edge handles */}
      <div 
        className="resize-handle edge top"
        onMouseDown={(e) => handleMouseDown(e, 'top')}
      />
      <div 
        className="resize-handle edge right"
        onMouseDown={(e) => handleMouseDown(e, 'right')}
      />
      <div 
        className="resize-handle edge bottom"
        onMouseDown={(e) => handleMouseDown(e, 'bottom')}
      />
      <div 
        className="resize-handle edge left"
        onMouseDown={(e) => handleMouseDown(e, 'left')}
      />
    </div>
  );
};

