/**
 * CameraPositionPresets Component
 * Quick preset buttons for common camera positions
 */

import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

// Import all preset icons
import flatWebp from '../assets/presetIcons/webp/flat.webp';
import flatJpg from '../assets/presetIcons/jpg/flat.jpg';
import skewLeftWebp from '../assets/presetIcons/webp/skew_left.webp';
import skewLeftJpg from '../assets/presetIcons/jpg/skew_left.jpg';
import skewRightWebp from '../assets/presetIcons/webp/skew_right.webp';
import skewRightJpg from '../assets/presetIcons/jpg/skew_right.jpg';
import tiltUpWebp from '../assets/presetIcons/webp/tilt_up.webp';
import tiltUpJpg from '../assets/presetIcons/jpg/tilt_up.jpg';
import tiltDownWebp from '../assets/presetIcons/webp/tilt_down.webp';
import tiltDownJpg from '../assets/presetIcons/jpg/tilt_down.jpg';
import subtleLeftWebp from '../assets/presetIcons/webp/subtle_left.webp';
import subtleLeftJpg from '../assets/presetIcons/jpg/subtle_left.jpg';
import subtleRightWebp from '../assets/presetIcons/webp/subtle_right.webp';
import subtleRightJpg from '../assets/presetIcons/jpg/subtle_right.jpg';
import subtleUpWebp from '../assets/presetIcons/webp/subtle_up.webp';
import subtleUpJpg from '../assets/presetIcons/jpg/subtle_up.jpg';
import subtleDownWebp from '../assets/presetIcons/webp/subtle_down.webp';
import subtleDownJpg from '../assets/presetIcons/jpg/subtle_down.jpg';
import topLeftWebp from '../assets/presetIcons/webp/top_left.webp';
import topLeftJpg from '../assets/presetIcons/jpg/top_left.jpg';
import topRightWebp from '../assets/presetIcons/webp/top_right.webp';
import topRightJpg from '../assets/presetIcons/jpg/top_right.jpg';
import bottomLeftWebp from '../assets/presetIcons/webp/bottom_left.webp';
import bottomLeftJpg from '../assets/presetIcons/jpg/bottom_left.jpg';
import bottomRightWebp from '../assets/presetIcons/webp/bottom_right.webp';
import bottomRightJpg from '../assets/presetIcons/jpg/bottom_right.jpg';
import isometricTopWebp from '../assets/presetIcons/webp/isometric_top.webp';
import isometricTopJpg from '../assets/presetIcons/jpg/isometric_top.jpg';
import isometricBottomWebp from '../assets/presetIcons/webp/isometric_bottom.webp';
import isometricBottomJpg from '../assets/presetIcons/jpg/isometric_bottom.jpg';
import isoTopRightWebp from '../assets/presetIcons/webp/iso_top_right.webp';
import isoTopRightJpg from '../assets/presetIcons/jpg/iso_top_right.jpg';
import isoBottomRightWebp from '../assets/presetIcons/webp/iso_bottom_right.webp';
import isoBottomRightJpg from '../assets/presetIcons/jpg/iso_bottom_right.jpg';
import showcaseLeftWebp from '../assets/presetIcons/webp/showcase_left.webp';
import showcaseLeftJpg from '../assets/presetIcons/jpg/showcase_left.jpg';
import showcaseRightWebp from '../assets/presetIcons/webp/showcase_right.webp';
import showcaseRightJpg from '../assets/presetIcons/jpg/showcase_right.jpg';
import showcaseDownLWebp from '../assets/presetIcons/webp/showcase_down_l.webp';
import showcaseDownLJpg from '../assets/presetIcons/jpg/showcase_down_l.jpg';
import showcaseDownRWebp from '../assets/presetIcons/webp/showcase_down_r.webp';
import showcaseDownRJpg from '../assets/presetIcons/jpg/showcase_down_r.jpg';
import extremeLeftWebp from '../assets/presetIcons/webp/extreme_left.webp';
import extremeLeftJpg from '../assets/presetIcons/jpg/extreme_left.jpg';
import extremeRightWebp from '../assets/presetIcons/webp/extreme_right.webp';
import extremeRightJpg from '../assets/presetIcons/jpg/extreme_right.jpg';
import extremeUpWebp from '../assets/presetIcons/webp/extreme_up.webp';
import extremeUpJpg from '../assets/presetIcons/jpg/extreme_up.jpg';
import extremeDownWebp from '../assets/presetIcons/webp/extreme_down.webp';
import extremeDownJpg from '../assets/presetIcons/jpg/extreme_down.jpg';

// Icon mapping: preset ID -> [webp, jpg]
const ICON_MAP: Record<string, [string, string]> = {
  'flat': [flatWebp, flatJpg],
  'skew-left': [skewLeftWebp, skewLeftJpg],
  'skew-right': [skewRightWebp, skewRightJpg],
  'tilt-up': [tiltUpWebp, tiltUpJpg],
  'tilt-down': [tiltDownWebp, tiltDownJpg],
  'subtle-left': [subtleLeftWebp, subtleLeftJpg],
  'subtle-right': [subtleRightWebp, subtleRightJpg],
  'subtle-up': [subtleUpWebp, subtleUpJpg],
  'subtle-down': [subtleDownWebp, subtleDownJpg],
  'diagonal-top-left': [topLeftWebp, topLeftJpg],
  'diagonal-top-right': [topRightWebp, topRightJpg],
  'diagonal-bottom-left': [bottomLeftWebp, bottomLeftJpg],
  'diagonal-bottom-right': [bottomRightWebp, bottomRightJpg],
  'isometric-top': [isometricTopWebp, isometricTopJpg],
  'isometric-bottom': [isometricBottomWebp, isometricBottomJpg],
  'isometric-top-right': [isoTopRightWebp, isoTopRightJpg],
  'isometric-bottom-right': [isoBottomRightWebp, isoBottomRightJpg],
  'showcase-left': [showcaseLeftWebp, showcaseLeftJpg],
  'showcase-right': [showcaseRightWebp, showcaseRightJpg],
  'showcase-down-left': [showcaseDownLWebp, showcaseDownLJpg],
  'showcase-down-right': [showcaseDownRWebp, showcaseDownRJpg],
  'extreme-left': [extremeLeftWebp, extremeLeftJpg],
  'extreme-right': [extremeRightWebp, extremeRightJpg],
  'extreme-up': [extremeUpWebp, extremeUpJpg],
  'extreme-down': [extremeDownWebp, extremeDownJpg],
};

export interface CameraPreset {
  id: string;
  name: string;
  x: number;
  y: number;
}

export const CAMERA_PRESETS: CameraPreset[] = [
  // Arranged in 5x5 grid with Flat in center (position 12)
  // Layout: "right" versions on left side, "left" versions on right side (matches visual perspective)
  // Row 1: Top row - top diagonals and up angles
  {
    id: 'diagonal-top-right',
    name: 'Top Right',
    x: -5.0,
    y: 5.0,
  },
  {
    id: 'isometric-top-right',
    name: 'Iso Top Right',
    x: -3.0,
    y: 3.0,
  },
  {
    id: 'extreme-up',
    name: 'Extreme Up',
    x: 0,
    y: 7.5,
  },
  {
    id: 'isometric-top',
    name: 'Isometric Top',
    x: 3.0,
    y: 3.0,
  },
  {
    id: 'diagonal-top-left',
    name: 'Top Left',
    x: 5.0,
    y: 5.0,
  },
  // Row 2: Second row - right angles on left, up angles in middle, left angles on right
  {
    id: 'showcase-right',
    name: 'Showcase Right',
    x: -4.0,
    y: 2.0,
  },
  {
    id: 'skew-right',
    name: 'Skew Right',
    x: -5.0,
    y: 0,
  },
  {
    id: 'tilt-up',
    name: 'Tilt Up',
    x: 0,
    y: 5.0,
  },
  {
    id: 'skew-left',
    name: 'Skew Left',
    x: 5.0,
    y: 0,
  },
  {
    id: 'showcase-left',
    name: 'Showcase Left',
    x: 4.0,
    y: 2.0,
  },
  // Row 3: Middle row - Flat in center with right angles on left, left angles on right
  {
    id: 'extreme-right',
    name: 'Extreme Right',
    x: -7.5,
    y: 0,
  },
  {
    id: 'subtle-right',
    name: 'Subtle Right',
    x: -2.5,
    y: 0,
  },
  {
    id: 'flat',
    name: 'Flat',
    x: 0,
    y: 0,
  },
  {
    id: 'subtle-left',
    name: 'Subtle Left',
    x: 2.5,
    y: 0,
  },
  {
    id: 'extreme-left',
    name: 'Extreme Left',
    x: 7.5,
    y: 0,
  },
  // Row 4: Fourth row - right angles on left, down angles in middle, left angles on right
  {
    id: 'showcase-down-right',
    name: 'Showcase Down R',
    x: -4.0,
    y: -2.0,
  },
  {
    id: 'isometric-bottom-right',
    name: 'Iso Bottom Right',
    x: -3.0,
    y: -3.0,
  },
  {
    id: 'tilt-down',
    name: 'Tilt Down',
    x: 0,
    y: -5.0,
  },
  {
    id: 'isometric-bottom',
    name: 'Isometric Bottom',
    x: 3.0,
    y: -3.0,
  },
  {
    id: 'showcase-down-left',
    name: 'Showcase Down L',
    x: 4.0,
    y: -2.0,
  },
  // Row 5: Bottom row - bottom diagonals and down angles
  {
    id: 'diagonal-bottom-right',
    name: 'Bottom Right',
    x: -5.0,
    y: -5.0,
  },
  {
    id: 'subtle-up',
    name: 'Subtle Up',
    x: 0,
    y: 2.5,
  },
  {
    id: 'extreme-down',
    name: 'Extreme Down',
    x: 0,
    y: -7.5,
  },
  {
    id: 'subtle-down',
    name: 'Subtle Down',
    x: 0,
    y: -2.5,
  },
  {
    id: 'diagonal-bottom-left',
    name: 'Bottom Left',
    x: 5.0,
    y: -5.0,
  },
];

interface CameraPositionPresetsProps {
  currentPosition: { x: number; y: number };
  onPresetSelect: (preset: CameraPreset) => void;
  disabled?: boolean;
}

export const CameraPositionPresets: React.FC<CameraPositionPresetsProps> = ({
  currentPosition,
  onPresetSelect,
  disabled = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const isPresetActive = (preset: CameraPreset): boolean => {
    const threshold = 0.1; // Allow small floating point differences
    return (
      Math.abs(currentPosition.x - preset.x) < threshold &&
      Math.abs(currentPosition.y - preset.y) < threshold
    );
  };

  return (
    <div className="camera-presets">
      <button
        className="camera-presets-header"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-label={isExpanded ? 'Collapse position presets' : 'Expand position presets'}
      >
        <label className="camera-presets-label">Position Presets</label>
        {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
      </button>
      {isExpanded && (
        <div className="camera-presets-grid">
          {CAMERA_PRESETS.map((preset, index) => {
            const isActive = isPresetActive(preset);
            // Every 5th button (rightmost column) uses left tooltip
            const isRightmost = index % 5 === 4;
            const tooltipClass = isRightmost ? 'tooltip-trigger-left-compact' : 'tooltip-trigger-top-compact';
            const tooltipSpanClass = isRightmost ? 'tooltip-left-compact' : 'tooltip-top-compact';
            
            const iconSources = ICON_MAP[preset.id];
            
            return (
              <button
                key={preset.id}
                onClick={() => onPresetSelect(preset)}
                disabled={disabled}
                className={`camera-preset-btn ${tooltipClass} ${isActive ? 'active' : ''}`}
                aria-label={`Apply ${preset.name} position preset`}
              >
                {iconSources ? (
                  <picture className="camera-preset-icon">
                    <source srcSet={iconSources[0]} type="image/webp" />
                    <img src={iconSources[1]} alt="" className="camera-preset-icon-img" />
                  </picture>
                ) : (
                  <div className="camera-preset-rectangle"></div>
                )}
                <span className={tooltipSpanClass}>{preset.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

