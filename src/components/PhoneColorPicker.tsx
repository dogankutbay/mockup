/**
 * PhoneColorPicker Component
 * Allows users to select phone body color with presets or custom picker
 * Shows different color presets based on the selected phone model
 */

import React from 'react';
import type { PhoneModelConfig } from '../config/phoneModels';

interface PhoneColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  modelConfig: PhoneModelConfig;
  disabled?: boolean;
}

// iPhone 15 Pro colors (2023-2024) - Titanium finishes
const IPHONE_COLORS = [
  { name: 'Black Titanium', value: '#1C1C1E' }, // Black titanium (dark gray/black) - default
  { name: 'Natural Titanium', value: '#8E8E93' }, // Natural titanium (light gray/silver)
  { name: 'Blue Titanium', value: '#5E9DD9' }, // Blue titanium (blue-gray)
  { name: 'White Titanium', value: '#F5F5F7' }, // White titanium
  { name: 'Orange', value: '#FF6B35' }, // Orange
  { name: 'Navy Blue', value: '#1E3A5F' }, // Navy blue
];

// Samsung Galaxy S21/S22/S23 colors - Phantom series
const SAMSUNG_COLORS = [
  { name: 'Phantom Black', value: '#1C1C1E' }, // Deep black - default
  { name: 'Phantom White', value: '#F5F5F7' }, // Pure white
  { name: 'Phantom Violet', value: '#8B5CF6' }, // Purple/violet
  { name: 'Phantom Pink', value: '#FF6B9D' }, // Pink
  { name: 'Phantom Green', value: '#4ECDC4' }, // Teal/green
  { name: 'Phantom Gray', value: '#6B7280' }, // Gray
];

const getPresetColors = (manufacturer: 'apple' | 'samsung') => {
  return manufacturer === 'apple' ? IPHONE_COLORS : SAMSUNG_COLORS;
};

export const PhoneColorPicker: React.FC<PhoneColorPickerProps> = ({
  selectedColor,
  onColorChange,
  modelConfig,
  disabled = false,
}) => {
  const presetColors = getPresetColors(modelConfig.manufacturer);

  const handlePresetClick = (color: string) => {
    onColorChange(color);
  };

  return (
    <div className="phone-color-picker">
      
      <div className="color-presets">
        {presetColors.map((preset, index) => {
          const isFirst = index === 0;
          const isLast = index === presetColors.length - 1;
          
          let tooltipClass = 'tooltip-trigger-top';
          let tooltipSpanClass = 'tooltip-top';
          
          if (isFirst) {
            tooltipClass = 'tooltip-trigger-right';
            tooltipSpanClass = 'tooltip-right';
          } else if (isLast) {
            tooltipClass = 'tooltip-trigger-left';
            tooltipSpanClass = 'tooltip-left';
          }
          
          return (
            <button
              key={preset.value}
              className={`color-preset ${tooltipClass} ${
                selectedColor.toUpperCase() === preset.value.toUpperCase() ? 'selected' : ''
              }`}
              style={{ backgroundColor: preset.value }}
              onClick={() => handlePresetClick(preset.value)}
              disabled={disabled}
              aria-label={`Select ${preset.name} phone color`}
            >
              <span className={tooltipSpanClass}>{preset.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

