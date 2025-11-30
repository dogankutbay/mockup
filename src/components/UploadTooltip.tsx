/**
 * UploadTooltip Component
 * Onboarding tooltip that shows once to guide users to upload screenshots
 */

import React, { useState, useEffect, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';

const STORAGE_KEY = 'mockup-tooltip-shown';

interface UploadTooltipProps {
  targetRef: React.RefObject<HTMLButtonElement | null>;
}

export const UploadTooltip: React.FC<UploadTooltipProps> = ({ targetRef }) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if tooltip has been shown before
    const hasBeenShown = localStorage.getItem(STORAGE_KEY) === 'true';
    if (hasBeenShown) return;

    // Wait for the target button to be rendered
    const checkTarget = () => {
      if (targetRef.current) {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          setIsVisible(true);
        }, 200);
      } else {
        setTimeout(checkTarget, 100);
      }
    };
    
    checkTarget();
  }, [targetRef]);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  // Close on click outside
  useEffect(() => {
    if (!isVisible) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        targetRef.current &&
        !targetRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    // Small delay to prevent immediate close on mount
    const timeout = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isVisible]);


  if (!isVisible) return null;

  return (
    <div
      ref={tooltipRef}
      className="upload-tooltip"
      onClick={handleClose}
    >
      <button
        className="upload-tooltip-close"
        onClick={(e) => {
          e.stopPropagation();
          handleClose();
        }}
        aria-label="Close tooltip"
      >
        <FaTimes />
      </button>
      <p className="upload-tooltip-text">Upload your screenshot here</p>
    </div>
  );
};

