/**
 * Custom hook for theme management
 */

import { useState, useEffect, useCallback } from 'react';
import type { Theme, UseThemeReturn, StorageKeys } from '@/types';

const STORAGE_KEY: StorageKeys = 'extinction-timeline-theme-react' as StorageKeys;

export function useTheme(): UseThemeReturn {
  const [theme, setThemeState] = useState<Theme>('light');

  /**
   * Detects system theme preference
   */
  const getSystemTheme = useCallback((): Theme => {
    if (typeof window === 'undefined') return 'light';
    
    return window.matchMedia('(prefers-color-scheme: dark)').matches 
      ? 'dark' 
      : 'light';
  }, []);

  /**
   * Loads theme from localStorage
   */
  const loadSavedTheme = useCallback((): Theme | null => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return (saved === 'light' || saved === 'dark') ? saved : null;
    } catch (error) {
      console.warn('Failed to load theme from localStorage:', error);
      return null;
    }
  }, []);

  /**
   * Saves theme to localStorage
   */
  const saveTheme = useCallback((theme: Theme): void => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  }, []);

  /**
   * Applies theme to document
   */
  const applyTheme = useCallback((theme: Theme): void => {
    // Update document class
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }

    // Update meta theme-color for mobile browsers
    updateMetaThemeColor(theme);

    console.log(`🎨 Theme applied: ${theme}`);
  }, []);

  /**
   * Updates meta theme-color for mobile browser chrome
   */
  const updateMetaThemeColor = (theme: Theme): void => {
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }
    
    const color = theme === 'dark' ? '#1a1a1a' : '#f5f5f5';
    metaThemeColor.setAttribute('content', color);
  };

  /**
   * Sets theme with persistence and DOM updates
   */
  const setTheme = useCallback((newTheme: Theme): void => {
    setThemeState(newTheme);
    applyTheme(newTheme);
    saveTheme(newTheme);
  }, [applyTheme, saveTheme]);

  /**
   * Toggles between light and dark themes
   */
  const toggleTheme = useCallback((): void => {
    const newTheme: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }, [theme, setTheme]);

  /**
   * Initialize theme on mount
   */
  useEffect(() => {
    const savedTheme = loadSavedTheme();
    const initialTheme = savedTheme || getSystemTheme();
    
    setThemeState(initialTheme);
    applyTheme(initialTheme);

    console.log(`🎨 Theme initialized: ${initialTheme}${savedTheme ? ' (saved)' : ' (system)'}`);
  }, [loadSavedTheme, getSystemTheme, applyTheme]);

  /**
   * Listen for system theme changes
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (event: MediaQueryListEvent): void => {
      // Only auto-switch if user hasn't manually set a preference
      const savedTheme = loadSavedTheme();
      if (!savedTheme) {
        const systemTheme = event.matches ? 'dark' : 'light';
        setThemeState(systemTheme);
        applyTheme(systemTheme);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [loadSavedTheme, applyTheme]);

  return {
    theme,
    toggleTheme,
    setTheme
  };
}
