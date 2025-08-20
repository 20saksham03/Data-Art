/**
 * Filter Panel Component
 * Provides category filtering for timeline events
 */

import React from 'react';
import clsx from 'clsx';
import type { FilterPanelProps, FilterCategory } from '@/types';

const FilterPanel: React.FC<FilterPanelProps> = ({ 
  activeFilter, 
  onFilterChange, 
  eventCounts 
}) => {
  const filters: Array<{ category: FilterCategory; label: string }> = [
    { category: 'All', label: 'All' },
    { category: 'Mammals', label: 'Mammals' },
    { category: 'Birds', label: 'Birds' },
    { category: 'Reptiles', label: 'Reptiles' }
  ];

  const handleFilterClick = (category: FilterCategory) => {
    onFilterChange(category);
  };

  const handleKeyDown = (event: React.KeyboardEvent, category: FilterCategory) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onFilterChange(category);
    }
  };

  return (
    <nav className="filters" role="navigation" aria-label="Filter timeline by animal category">
      {filters.map(({ category, label }) => {
        const isActive = activeFilter === category;
        const count = eventCounts[category] || 0;

        return (
          <button
            key={category}
            className={clsx('filter-btn', { active: isActive })}
            data-category={category}
            onClick={() => handleFilterClick(category)}
            onKeyDown={(event) => handleKeyDown(event, category)}
            aria-pressed={isActive}
            aria-label={`Filter by ${label}, ${count} events`}
            type="button"
          >
            {label} ({count})
          </button>
        );
      })}
    </nav>
  );
};

export default FilterPanel;
