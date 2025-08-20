/**
 * Header Component
 * Displays logo, title, and theme toggle button
 */

import React from 'react';
import type { HeaderProps } from '@/types';

const Header: React.FC<HeaderProps> = ({ theme, onThemeToggle }) => {
  const themeIcon = theme === 'light' ? '🌙' : '☀️';
  const themeLabel = theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme';

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>): void => {
    const img = event.currentTarget;
    img.style.display = 'none';
  };

  const handleThemeClick = (): void => {
    onThemeToggle();
  };

  const handleThemeKeyDown = (event: React.KeyboardEvent): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onThemeToggle();
    }
  };

  return (
    <header className="site-header">
      <div className="logo-container">
        <img 
          src="https://commons.wikimedia.org/wiki/Special:FilePath/Extinction_Symbol.svg"
          alt="Extinction Timeline Logo"
          className="logo"
          onError={handleImageError}
        />
        <h1>Animal Extinction Timeline</h1>
      </div>
      
      <button
        id="theme-toggle"
        className="theme-toggle"
        onClick={handleThemeClick}
        onKeyDown={handleThemeKeyDown}
        aria-label={themeLabel}
        title={themeLabel}
        type="button"
      >
        {themeIcon}
      </button>
    </header>
  );
};

export default Header;
