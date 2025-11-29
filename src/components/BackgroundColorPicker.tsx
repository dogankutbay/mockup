/**
 * BackgroundColorPicker Component
 * Allows users to select background color with presets or custom picker
 */

import React from 'react';

interface BackgroundColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  disabled?: boolean;
}

const PRESET_COLORS = [
  { name: 'White', value: '#FAFAFA' },
  { name: 'Light Gray', value: '#F8F8F8' },
  { name: 'Dark', value: '#0F0F10' },
  { name: 'Multicolor', value: 'multicolor' }, // Special value to indicate multicolor/custom
];

export const BackgroundColorPicker: React.FC<BackgroundColorPickerProps> = ({
  selectedColor,
  onColorChange,
  disabled = false,
}) => {
  const [hexInput, setHexInput] = React.useState(selectedColor.toUpperCase());
  const [isMulticolorMode, setIsMulticolorMode] = React.useState(false);
  
  // Check if multicolor/custom is selected based on state or if color doesn't match presets
  const isMulticolorSelected = isMulticolorMode || !PRESET_COLORS.slice(0, 3).some(
    preset => selectedColor.toUpperCase() === preset.value.toUpperCase()
  );

  // Sync with selectedColor when it changes from elsewhere
  React.useEffect(() => {
    setHexInput(selectedColor.toUpperCase());
    // If color matches a preset, exit multicolor mode
    if (PRESET_COLORS.slice(0, 3).some(preset => selectedColor.toUpperCase() === preset.value.toUpperCase())) {
      setIsMulticolorMode(false);
    }
  }, [selectedColor]);

  const handlePresetClick = (color: string) => {
    if (color === 'multicolor') {
      // Enable multicolor mode to show custom picker
      setIsMulticolorMode(true);
      return;
    }
    // Disable multicolor mode when selecting a preset
    setIsMulticolorMode(false);
    onColorChange(color);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onColorChange(e.target.value);
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toUpperCase();
    setHexInput(value);
  };

  const handleHexInputBlur = () => {
    let value = hexInput.trim();
    
    // Remove any spaces
    value = value.replace(/\s/g, '');
    
    // Ensure it starts with #
    if (!value.startsWith('#')) {
      value = '#' + value;
    }
    
    // Validate and update if it's a valid hex format (# + 3 or 6 hex digits)
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (hexRegex.test(value)) {
      onColorChange(value.toUpperCase());
    } else {
      // Reset to current valid color if invalid
      setHexInput(selectedColor.toUpperCase());
    }
  };

  const handleHexInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleHexInputBlur();
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className="background-color-picker">
      <label className="color-picker-label">Background Color</label>
      
      <div className="color-presets">
        {PRESET_COLORS.map((preset) => {
          const isSelected = preset.value === 'multicolor' 
            ? isMulticolorSelected 
            : selectedColor.toUpperCase() === preset.value.toUpperCase();
          
          // For multicolor, show a gradient background
          const buttonStyle = preset.value === 'multicolor' 
            ? {
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
              }
            : { backgroundColor: preset.value };
          
          return (
            <button
              key={preset.value}
              className={`color-preset ${isSelected ? 'selected' : ''}`}
              style={buttonStyle}
              onClick={() => handlePresetClick(preset.value)}
              disabled={disabled}
              aria-label={`Select ${preset.name} background`}
              title={preset.name}
            />
          );
        })}
      </div>

      {isMulticolorSelected && (
        <div className="custom-color-picker">
          <label htmlFor="custom-color" className="custom-color-label">
            Custom Color
          </label>
          <div className="custom-color-input-wrapper">
            <input
              id="custom-color"
              type="color"
              value={selectedColor}
              onChange={handleCustomColorChange}
              disabled={disabled}
              className="custom-color-input"
              aria-label="Select custom background color"
            />
            <input
              type="text"
              value={hexInput}
              onChange={handleHexInputChange}
              onBlur={handleHexInputBlur}
              onKeyDown={handleHexInputKeyDown}
              disabled={disabled}
              className="custom-color-hex-input"
              placeholder="#FFFFFF"
              maxLength={7}
              aria-label="Enter hex color code"
            />
          </div>
        </div>
      )}
    </div>
  );
};

