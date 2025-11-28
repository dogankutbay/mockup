/**
 * Custom hook for managing screenshot upload and application
 */

import { useState, useEffect } from 'react';
import { applyScreenshotToScreen } from '../utils/phoneModelUtils';
import { validateImageFile } from '../utils/exportUtils';
import type { ScreenshotData, PhoneModel, AppError } from '../types';
import type { PhoneModelConfig } from '../config/phoneModels';

interface UseScreenshotOptions {
  phoneModel: PhoneModel | null;
  modelConfig: PhoneModelConfig;
  onError?: (error: AppError) => void;
}

interface ScreenshotItem {
  dataUrl: string;
  fileName: string;
}

export const useScreenshot = ({ phoneModel, modelConfig, onError }: UseScreenshotOptions) => {
  const [screenshots, setScreenshots] = useState<ScreenshotItem[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const activeScreenshot = activeIndex >= 0 ? screenshots[activeIndex]?.dataUrl : null;

  // Apply active screenshot to phone when available
  useEffect(() => {
    if (phoneModel && activeScreenshot) {
      applyScreenshotToScreen(
        phoneModel, 
        activeScreenshot, 
        modelConfig.screenMeshName,
        modelConfig.textureTransform,
        (error) => {
          onError?.({
            message: 'Failed to apply screenshot to phone',
            type: 'screenshot_upload',
          });
        }
      );
    }
  }, [activeScreenshot, phoneModel, modelConfig.screenMeshName, modelConfig.textureTransform, onError]);

  const handleScreenshotUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileName = file.name;

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      onError?.({
        message: validation.error || 'Invalid file',
        type: 'screenshot_upload',
      });
      return;
    }

    // Read file
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        setScreenshots(prev => [...prev, { dataUrl: result, fileName }]);
        setActiveIndex(prev => prev + 1);
      }
    };
    reader.onerror = () => {
      onError?.({
        message: 'Failed to read image file',
        type: 'screenshot_upload',
      });
    };
    reader.readAsDataURL(file);
    
    // Reset file input to allow uploading the same file again
    event.target.value = '';
  };

  const clearAllScreenshots = () => {
    setScreenshots([]);
    setActiveIndex(-1);
  };

  const setActiveScreenshot = (index: number) => {
    if (index >= 0 && index < screenshots.length) {
      setActiveIndex(index);
    }
  };

  return { 
    screenshots, 
    activeIndex,
    activeScreenshot,
    handleScreenshotUpload,
    clearAllScreenshots,
    setActiveScreenshot,
  };
};

