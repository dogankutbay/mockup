/**
 * PhoneModelSelector Component
 * Allows users to switch between different phone models
 */

import React from 'react';
import { FaApple, FaAndroid } from 'react-icons/fa';
import { PHONE_MODELS, PhoneModelConfig } from '../config/phoneModels';

interface PhoneModelSelectorProps {
  selectedModel: PhoneModelConfig;
  onModelChange: (model: PhoneModelConfig) => void;
  disabled?: boolean;
}

export const PhoneModelSelector: React.FC<PhoneModelSelectorProps> = ({
  selectedModel,
  onModelChange,
  disabled = false,
}) => {
  const handleCardClick = (model: PhoneModelConfig) => {
    if (!disabled) {
      onModelChange(model);
    }
  };

  const getManufacturerDisplay = (manufacturer: string) => {
    return manufacturer === 'apple' ? 'Apple' : 'Android';
  };

  const getManufacturerIcon = (manufacturer: string) => {
    return manufacturer === 'apple' ? <FaApple size={32} /> : <FaAndroid size={32} />;
  };

  return (
    <div className="phone-model-selector">
      <label className="phone-model-label">Device Model</label>
      <div className="phone-model-cards">
        {PHONE_MODELS.map((model) => (
          <button
            key={model.id}
            onClick={() => handleCardClick(model)}
            disabled={disabled}
            className={`phone-model-card ${
              selectedModel.id === model.id ? 'selected' : ''
            }`}
            aria-label={`Select ${model.displayName}`}
          >
            <div className="phone-model-card-icon">
              {getManufacturerIcon(model.manufacturer)}
            </div>
            <div className="phone-model-card-content">
              <div className="phone-model-card-name">
                {getManufacturerDisplay(model.manufacturer)}
              </div>
              <div className="phone-model-card-resolution">
                {model.screenResolution.width}×{model.screenResolution.height}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

