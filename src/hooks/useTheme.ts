/**
 * Theme Hook
 * Manages theme state and persistence
 */

import { useState, useEffect } from 'react';

export type ThemeMode = 'light' | 'light-contrast' | 'dark';

const STORAGE_KEY = 'mockup-theme';
const DEFAULT_THEME: ThemeMode = 'light';

export const useTheme = () => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    // Get theme from localStorage or use default
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    return stored && ['light', 'light-contrast', 'dark'].includes(stored)
      ? stored
      : DEFAULT_THEME;
  });

  useEffect(() => {
    // Apply theme to document root
    document.documentElement.className = `theme-${theme}`;
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return { theme, setTheme };
};

