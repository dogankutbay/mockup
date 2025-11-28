/**
 * ControlPanel Component
 * UI controls for uploading screenshots and exporting images
 */

import React, { useRef } from 'react';
import { FaUpload, FaDownload } from 'react-icons/fa';

interface ControlPanelProps {
  onScreenshotUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
  disabled?: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ 
  onScreenshotUpload, 
  onExport,
  disabled = false 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="control-panel">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onScreenshotUpload}
        className="file-input"
        aria-label="Upload screenshot"
        disabled={disabled}
      />
      
      <button 
        onClick={handleUploadClick}
        className="btn btn-primary"
        disabled={disabled}
        aria-label="Upload Screenshot"
      >
        <FaUpload /> Upload Screenshot
      </button>
      
      
      <button 
        onClick={onExport}
        className="btn btn-secondary"
        disabled={disabled}
        aria-label="Export Mockup"
      >
        <FaDownload /> Export Mockup
      </button>
    </div>
  );
};

