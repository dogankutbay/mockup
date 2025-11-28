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

export const useScreenshot = ({ phoneModel, modelConfig, onError }: UseScreenshotOptions) => {
  const [screenshot, setScreenshot] = useState<ScreenshotData>(null);

  // Apply screenshot to phone when both are available
  useEffect(() => {
    if (phoneModel && screenshot) {
      applyScreenshotToScreen(
        phoneModel, 
        screenshot, 
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
  }, [screenshot, phoneModel, modelConfig.screenMeshName, modelConfig.textureTransform, onError]);

  const handleScreenshotUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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
        setScreenshot(result);
      }
    };
    reader.onerror = () => {
      onError?.({
        message: 'Failed to read image file',
        type: 'screenshot_upload',
      });
    };
    reader.readAsDataURL(file);
  };

  return { screenshot, handleScreenshotUpload };
};

