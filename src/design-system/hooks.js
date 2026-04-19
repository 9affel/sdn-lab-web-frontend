/**
 * Design System Hooks & Utilities
 * Custom hooks for consistent styling throughout the app
 */

import { useMemo } from 'react';
import { COLORS, CARD_VARIANTS, STATUS_COLOR_MAP } from './constants';

/**
 * Get card variant styles based on variant name
 * @param {string} variant - 'base', 'cyan', 'red', 'green', 'amber'
 * @returns {Object} Style configuration
 */
export const useCardVariant = (variant = 'base') => {
  return useMemo(() => {
    return CARD_VARIANTS[variant] || CARD_VARIANTS.base;
  }, [variant]);
};

/**
 * Get color based on status/severity level
 * @param {string} status - Status name (critical, high, low, etc.)
 * @returns {Object} Color values
 */
export const useStatusColor = (status) => {
  const colorKey = STATUS_COLOR_MAP[status?.toLowerCase()] || 'cyan';
  
  return useMemo(() => {
    const colorMap = {
      red: {
        main: COLORS.status.danger,
        hex: '#E74C3C',
        bg: 'rgba(231, 76, 60, 0.08)',
        border: 'rgba(231, 76, 60, 0.3)',
        text: '#E74C3C',
      },
      green: {
        main: COLORS.status.success,
        hex: '#0A4A3F',
        bg: 'rgba(10, 74, 63, 0.15)',
        border: 'rgba(10, 74, 63, 0.4)',
        text: '#0A4A3F',
      },
      amber: {
        main: COLORS.status.warning,
        hex: '#F5A623',
        bg: 'rgba(245, 166, 35, 0.08)',
        border: 'rgba(245, 166, 35, 0.3)',
        text: '#F5A623',
      },
      cyan: {
        main: COLORS.accent.cyan,
        hex: '#00D9C0',
        bg: 'rgba(0, 217, 192, 0.08)',
        border: 'rgba(0, 217, 192, 0.3)',
        text: '#00D9C0',
      },
    };
    return colorMap[colorKey];
  }, [status]);
};

/**
 * Get CSS class for card variant
 * @param {string} variant - Card variant name
 * @returns {string} CSS class name
 */
export const useCardClass = (variant = 'base') => {
  return useMemo(() => {
    const variantMap = {
      base: 'card-base',
      cyan: 'card-cyan',
      red: 'card-red',
      green: 'card-green',
      amber: 'card-amber',
    };
    return variantMap[variant] || 'card-base';
  }, [variant]);
};

/**
 * Generate responsive grid classes
 * @param {number} cols - Number of columns
 * @returns {string} Grid CSS classes
 */
export const useResponsiveGrid = (cols = 4) => {
  return useMemo(() => {
    const colsMap = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    };
    return colsMap[cols] || colsMap[4];
  }, [cols]);
};

/**
 * Combine multiple class names with design system utilities
 * @param  {...any} classes - Class names to combine
 * @returns {string} Combined class string
 */
export const useClsx = (...classes) => {
  return useMemo(() => {
    return classes.filter(Boolean).join(' ');
  }, [classes]);
};
