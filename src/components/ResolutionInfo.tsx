/**
 * ResolutionInfo Component
 * Displays optimal resolution for selected phone model
 */

import React from 'react';
import type { PhoneModelConfig } from '../config/phoneModels';

interface ResolutionInfoProps {
  model: PhoneModelConfig;
}

export const ResolutionInfo: React.FC<ResolutionInfoProps> = ({ model }) => {
  return (
    <p className="resolution-info">
      For perfect results, upload in {model.screenResolution.width}×{model.screenResolution.height}@3x resolution or you'll have blurry images.
    </p>
  );
};

