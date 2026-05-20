/**
 * Design System Hooks & Utilities
 * Custom hooks for consistent styling throughout the app
 */

import { useMemo } from 'react';
import { COLORS, CARD_VARIANTS, STATUS_COLOR_MAP, withAlpha } from './constants';

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
        hex: COLORS.status.danger,
        bg: withAlpha(COLORS.status.danger, '14'),
        border: withAlpha(COLORS.status.danger, '4D'),
        text: COLORS.status.danger,
      },
      green: {
        main: COLORS.status.success,
        hex: COLORS.status.success,
        bg: withAlpha(COLORS.status.success, '1F'),
        border: withAlpha(COLORS.status.success, '59'),
        text: COLORS.status.success,
      },
      amber: {
        main: COLORS.status.warning,
        hex: COLORS.status.warning,
        bg: withAlpha(COLORS.status.warning, '14'),
        border: withAlpha(COLORS.status.warning, '4D'),
        text: COLORS.status.warning,
      },
      cyan: {
        main: COLORS.accent.cyan,
        hex: COLORS.accent.cyan,
        bg: withAlpha(COLORS.accent.cyan, '14'),
        border: withAlpha(COLORS.accent.cyan, '4D'),
        text: COLORS.accent.cyan,
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
