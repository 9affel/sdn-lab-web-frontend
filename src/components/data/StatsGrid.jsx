/**
 * StatsGrid Component
 * Responsive grid layout for displaying multiple metric cards
 * Automatically configures based on design system
 */

import React, { useMemo } from 'react';
import MetricCard from './MetricCard';
import { useResponsiveGrid } from '../../design-system/hooks';

/**
 * @component StatsGrid
 * @description Renders a responsive grid of metric cards
 * 
 * @param {Object} props
 * @param {Array} props.stats - Array of metric objects
 *   - Each stat should have: title, value, subtitle, icon, status, trend, variant
 * @param {number} props.columns - Number of columns (default: 4)
 * @param {string} props.gap - Grid gap spacing (default: 'gap-6')
 * @param {Function} props.onStatClick - Click handler for individual stats
 * @param {boolean} props.loading - Loading state
 * @param {string} props.className - Additional CSS classes
 * @returns {React.ReactElement}
 */
export const StatsGrid = ({
  stats = [],
  columns = 4,
  gap = 'gap-6',
  onStatClick,
  loading = false,
  className = '',
}) => {
  // Get responsive grid classes
  const gridClasses = useResponsiveGrid(columns);

  // Memoize stats to prevent unnecessary re-renders
  const memoizedStats = useMemo(() => stats, [JSON.stringify(stats)]);

  return (
    <div
      className={`grid ${gridClasses} ${gap} animate-fade-in ${className}`}
      role="region"
      aria-label="Statistics Grid"
      aria-busy={loading}
    >
      {loading ? (
        // Loading skeleton
        Array(columns)
          .fill(null)
          .map((_, idx) => (
            <div
              key={`skeleton-${idx}`}
              className="rounded-2xl border border-border-light p-6 animate-pulse"
              style={{
                backgroundColor: 'rgba(21, 27, 43, 0.5)',
              }}
            >
              <div className="space-y-4">
                <div className="h-4 bg-border-light rounded w-1/3"></div>
                <div className="h-10 bg-border-light rounded w-2/3"></div>
                <div className="h-3 bg-border-light rounded w-1/2"></div>
              </div>
            </div>
          ))
      ) : memoizedStats.length > 0 ? (
        // Render actual stats
        memoizedStats.map((stat, index) => (
          <MetricCard
            key={stat.title || index}
            {...stat}
            onClick={() => onStatClick?.(stat)}
          />
        ))
      ) : (
        // Empty state
        <div className="col-span-full text-center py-12">
          <p className="text-text-muted text-sm">No statistics available</p>
        </div>
      )}
    </div>
  );
};

export default StatsGrid;
