/**
 * Theme Component Module
 * Handles dark/light theme switching and persistence
 */

import type { Theme, StorageKeys, CSSClasses } from '@/types';

export type ThemeChangeHandler = (theme: Theme) => void;

export class ThemeComponent {
  private readonly toggleButton: HTMLElement;
  private readonly onThemeChange: ThemeChangeHandler | null;
  private currentTheme: Theme = 'light';
  
  private readonly themeConfig = {
    light: {
      icon: '🌙',
      label: 'Switch to dark theme',
      className: '' // No class for light theme
    },
    dark: {
      icon: '☀️',
      label: 'Switch to light theme',
      className: 'dark-theme' satisfies CSSClasses
    }
  } as const;

  constructor(
    toggleButtonSelector: string,
    onThemeChange?: ThemeChangeHandler
  ) {
    const button = document.querySelector<HTMLElement>(toggleButtonSelector);
    if (!button) {
      throw new Error(`Theme toggle button not found: ${toggleButtonSelector}`);
    }
    
    this.toggleButton = button;
    this.onThemeChange = onThemeChange || null;
    
    this.setupEventListeners();
    this.initializeTheme();
  }

  /**
   * Gets the current theme
   * @returns Current theme
   */
  getCurrentTheme(): Theme {
    return this.currentTheme;
  }

  /**
   * Sets the theme programmatically
   * @param theme - Theme to set
   * @param saveToStorage - Whether to save to localStorage
   */
  setTheme(theme: Theme, saveToStorage = true): void {
    if (this.currentTheme === theme) return;

    console.log(`🎨 Switching theme to: ${theme}`);
    
    this.currentTheme = theme;
    this.applyTheme(theme);
    this.updateToggleButton(theme);
    
    if (saveToStorage) {
      this.saveThemePreference(theme);
    }

    // Notify listeners
    if (this.onThemeChange) {
      this.onThemeChange(theme);
    }
  }

  /**
   * Toggles between light and dark themes
   */
  toggleTheme(): void {
    const newTheme: Theme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  /**
   * Applies the theme to the document
   * @param theme - Theme to apply
   */
  private applyTheme(theme: Theme): void {
    const config = this.themeConfig[theme];
    
    // Apply or remove theme class from body
    if (theme === 'dark') {
      document.body.classList.add(config.className);
    } else {
      document.body.classList.remove(this.themeConfig.dark.className);
    }

    // Update meta theme-color for mobile browsers
    this.updateMetaThemeColor(theme);
  }

  /**
   * Updates the toggle button appearance
   * @param theme - Current theme
   */
  private updateToggleButton(theme: Theme): void {
    const config = this.themeConfig[theme];
    
    // Update button content
    this.toggleButton.textContent = config.icon;
    this.toggleButton.setAttribute('aria-label', config.label);
    this.toggleButton.setAttribute('title', config.label);
    
    // Add visual feedback
    this.toggleButton.style.transform = 'scale(1.1)';
    setTimeout(() => {
      this.toggleButton.style.transform = '';
    }, 150);
  }

  /**
   * Updates meta theme-color for mobile browser chrome
   * @param theme - Current theme
   */
  private updateMetaThemeColor(theme: Theme): void {
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }
    
    const color = theme === 'dark' ? '#1a1a1a' : '#f5f5f5';
    metaThemeColor.setAttribute('content', color);
  }

  /**
   * Saves theme preference to localStorage
   * @param theme - Theme to save
   */
  private saveThemePreference(theme: Theme): void {
    try {
      localStorage.setItem('extinction-timeline-theme' satisfies StorageKeys, theme);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  }

  /**
   * Loads theme preference from localStorage
   * @returns Saved theme or null if not found
   */
  private loadThemePreference(): Theme | null {
    try {
      const saved = localStorage.getItem('extinction-timeline-theme' satisfies StorageKeys);
      return this.isValidTheme(saved) ? saved : null;
    } catch (error) {
      console.warn('Failed to load theme preference:', error);
      return null;
    }
  }

  /**
   * Detects system theme preference
   * @returns System theme preference
   */
  private detectSystemTheme(): Theme {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }

  /**
   * Validates if a value is a valid theme
   * @param value - Value to validate
   * @returns Boolean indicating validity
   */
  private isValidTheme(value: unknown): value is Theme {
    return value === 'light' || value === 'dark';
  }

  /**
   * Sets up event listeners for theme toggle
   */
  private setupEventListeners(): void {
    // Toggle button click
    this.toggleButton.addEventListener('click', () => this.toggleTheme());
    
    // Keyboard support
    this.toggleButton.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.toggleTheme();
      }
    });

    // System theme change detection
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      // Listen for system theme changes
      mediaQuery.addEventListener('change', (event) => {
        // Only auto-switch if user hasn't manually set a preference
        const savedTheme = this.loadThemePreference();
        if (!savedTheme) {
          const systemTheme = event.matches ? 'dark' : 'light';
          this.setTheme(systemTheme, false); // Don't save auto-detected theme
        }
      });
    }
  }

  /**
   * Initializes the theme on component creation
   */
  private initializeTheme(): void {
    // Priority: saved preference > system preference > default light
    const savedTheme = this.loadThemePreference();
    const initialTheme = savedTheme || this.detectSystemTheme();
    
    this.setTheme(initialTheme, false); // Don't save on init to avoid overriding system detection
    
    console.log(`🎨 Theme initialized: ${initialTheme}${savedTheme ? ' (saved preference)' : ' (system detected)'}`);
  }

  /**
   * Resets theme to system preference or light
   */
  resetToSystemTheme(): void {
    const systemTheme = this.detectSystemTheme();
    this.setTheme(systemTheme);
    
    // Clear saved preference
    try {
      localStorage.removeItem('extinction-timeline-theme' satisfies StorageKeys);
    } catch (error) {
      console.warn('Failed to clear theme preference:', error);
    }
  }

  /**
   * Gets theme statistics and information
   * @returns Theme information object
   */
  getThemeInfo(): {
    current: Theme;
    saved: Theme | null;
    system: Theme;
    supportsSystemDetection: boolean;
  } {
    return {
      current: this.currentTheme,
      saved: this.loadThemePreference(),
      system: this.detectSystemTheme(),
      supportsSystemDetection: typeof window !== 'undefined' && !!window.matchMedia
    };
  }
}

/**
 * Factory function to create a ThemeComponent instance
 * @param toggleButtonSelector - CSS selector for theme toggle button
 * @param onThemeChange - Optional callback for theme changes
 * @returns ThemeComponent instance
 */
export function createThemeComponent(
  toggleButtonSelector: string,
  onThemeChange?: ThemeChangeHandler
): ThemeComponent {
  return new ThemeComponent(toggleButtonSelector, onThemeChange);
}
