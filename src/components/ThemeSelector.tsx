/**
 * ThemeSelector Component
 * Allows users to switch between light, light contrast, and dark themes
 */

import React from 'react';
import { FaSun, FaMoon, FaAdjust } from 'react-icons/fa';
import type { ThemeMode } from '../hooks/useTheme';

interface ThemeSelectorProps {
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  disabled?: boolean;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  theme,
  onThemeChange,
  disabled = false,
}) => {
  const themes: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'Light', icon: <FaSun /> },
    { value: 'light-contrast', label: 'Light Contrast', icon: <FaAdjust /> },
    { value: 'dark', label: 'Dark', icon: <FaMoon /> },
  ];

  return (
    <div className="theme-selector">
      <label className="theme-selector-label">Theme</label>
      <div className="theme-buttons">
        {themes.map((t) => (
          <button
            key={t.value}
            onClick={() => onThemeChange(t.value)}
            disabled={disabled}
            className={`theme-btn ${theme === t.value ? 'active' : ''}`}
            aria-label={`Switch to ${t.label} theme`}
            title={t.label}
          >
            {t.icon}
          </button>
        ))}
      </div>
    </div>
  );
};

