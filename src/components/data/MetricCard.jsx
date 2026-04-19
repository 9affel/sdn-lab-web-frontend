/**
 * MetricCard Component
 * Data-driven component for displaying key metrics with status indicators
 * Fully reusable and dependent on design system
 */

import React from 'react';
import { useCardVariant, useStatusColor } from '../../design-system/hooks';

/**
 * @component MetricCard
 * @description Displays a metric with icon, value, subtitle, and status color
 * 
 * @param {Object} props
 * @param {string} props.title - Card title/label
 * @param {number|string} props.value - Main metric value to display
 * @param {string} props.subtitle - Descriptive text below value
 * @param {React.ReactNode} props.icon - Icon component (from lucide-react)
 * @param {string} props.status - Status level (critical, high, medium, low, success)
 * @param {string} props.trend - Trend indicator (e.g., "+12%" or "-5%")
 * @param {string} props.variant - Card variant (base, cyan, red, green, amber)
 * @param {Function} props.onClick - Optional click handler
 * @param {string} props.className - Additional CSS classes
 * @returns {React.ReactElement}
 */
export const MetricCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  status,
  trend,
  variant,
  onClick,
  className = '',
}) => {
  // Get colors based on status if no variant specified
  const statusColor = useStatusColor(status);
  const cardVariant = useCardVariant(variant || (status ? STATUS_COLOR_MAP[status.toLowerCase()] : 'base'));

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border transition-all duration-300 p-6 hover-lift group cursor-pointer border-l-4 ${className}`}
      style={{
        backgroundColor: cardVariant.backgroundColor,
        borderColor: cardVariant.borderColor,
        boxShadow: cardVariant.boxShadow,
        borderLeftColor: statusColor?.hex || '#00D9C0',
      }}
    >
      <div className="space-y-4">
        {/* Header: Title and Icon */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-label text-text-secondary mb-2 uppercase">
              {title}
            </p>
            <p
              className="text-5xl font-bold transition-colors duration-300"
              style={{ color: statusColor?.text || '#00D9C0' }}
            >
              {value}
            </p>
          </div>

          {/* Icon Container */}
          {Icon && (
            <div
              className="w-12 h-12 rounded-lg border flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
              style={{
                backgroundColor: statusColor?.bg,
                borderColor: statusColor?.border,
              }}
            >
              <Icon
                className="w-6 h-6"
                style={{ color: statusColor?.text }}
              />
            </div>
          )}
        </div>

        {/* Footer: Subtitle and Trend */}
        <div className="flex items-center justify-between">
          <p className="text-text-secondary text-sm">{subtitle}</p>
          {trend && (
            <span
              className="text-xs font-semibold px-2 py-1 rounded"
              style={{ color: statusColor?.text }}
            >
              {trend}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Import needed for component
import { STATUS_COLOR_MAP } from '../../design-system/constants';

export default MetricCard;
