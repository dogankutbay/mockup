/**
 * ResizableFrame Component
 * Resizable square frame for video mode
 */

import React, { useState, useRef, useEffect } from 'react';

interface ResizableFrameProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

export const ResizableFrame: React.FC<ResizableFrameProps> = ({ zoom, onZoomChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef({ x: 0, y: 0, zoom: 0 });

  const handleMouseDown = (e: React.MouseEvent, corner: string) => {
    e.preventDefault();
    setIsDragging(true);
    startPosRef.current = {
      x: e.clientX,
      y: e.clientY,
      zoom: zoom,
    };
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startPosRef.current.x;
      const deltaY = e.clientY - startPosRef.current.y;
      
      // Use the larger delta (horizontal or vertical movement)
      const delta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
      
      // Calculate zoom change (1px movement = 0.001 zoom)
      const zoomChange = delta * 0.002;
      const newZoom = Math.max(0.3, Math.min(1.5, startPosRef.current.zoom + zoomChange));
      
      onZoomChange(newZoom);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onZoomChange]);

  return (
    <div 
      ref={frameRef}
      className={`video-frame-indicator ${isDragging ? 'dragging' : ''}`}
      style={{ 
        width: `${zoom * 100}%`,
        height: `${zoom * 100}%`,
        maxWidth: `min(${zoom * 90}vh, ${zoom * 90}vw)`,
        maxHeight: `min(${zoom * 90}vh, ${zoom * 90}vw)`,
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

