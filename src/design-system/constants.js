/**
 * Design System Constants
 * Centralized token definitions for the entire application
 */

// Color Palette
export const COLORS = {
  // Backgrounds & Surfaces
  background: {
    primary: '#09090b', // zinc-950
    card: '#18181b', // zinc-900
    sidebar: '#09090b',
    hover: '#27272a', // zinc-800
    input: '#18181b',
  },

  // Accent Colors
  accent: {
    cyan: '#00D9C0',
    cyanLight: '#1DD3C3',
    cyanDark: '#00a89f',
  },

  // Status Colors - Semantic
  status: {
    success: '#10B981', // Brighter Emerald-500 for better visibility
    warning: '#F5A623',
    danger: '#E74C3C',
    critical: '#8B3A3A',
    neutral: '#6B7280',
  },

  // Text Colors
  text: {
    primary: '#FFFFFF',
    secondary: '#9CA3AF',
    tertiary: '#6B7280',
    muted: '#A0AEC0',
  },

  // Borders & Dividers
  border: {
    light: 'rgba(255, 255, 255, 0.05)',
    lighter: 'rgba(255, 255, 255, 0.02)',
    default: '#27272a', // zinc-800
  },
};

// Spacing Scale (base unit: 4px)
export const SPACING = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
};

// Typography
export const TYPOGRAPHY = {
  fontFamily: {
    primary: '"Inter", "Segoe UI", system-ui, sans-serif',
    mono: '"Fira Code", monospace',
  },
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '2rem',      // 32px
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.6,
    relaxed: 1.8,
  },
};

// Border Radius
export const BORDER_RADIUS = {
  xs: '0.25rem',
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  '3xl': '1.75rem',
  full: '9999px',
};

// Box Shadows
export const SHADOWS = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
  md: '0 4px 12px rgba(0, 0, 0, 0.3)',
  lg: '0 8px 16px rgba(0, 0, 0, 0.4)',
  xl: '0 12px 24px rgba(0, 0, 0, 0.5)',
  card: '0 4px 12px rgba(0, 0, 0, 0.3)',
  cardHover: '0 8px 24px rgba(0, 0, 0, 0.4)',
  glowCyan: '0 0 20px rgba(0, 217, 192, 0.1)',
  glowCyanHover: '0 0 30px rgba(0, 217, 192, 0.2)',
  glowRed: '0 0 20px rgba(231, 76, 60, 0.1)',
  glowRedHover: '0 0 30px rgba(231, 76, 60, 0.15)',
};

// Z-Index Scale
export const Z_INDEX = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modal: 40,
  tooltip: 50,
  notification: 60,
};

// Animation/Transition Times
export const ANIMATION = {
  fast: '150ms',
  base: '300ms',
  slow: '500ms',
  timingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
};

// Breakpoints (Responsive)
export const BREAKPOINTS = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Card Variants
export const CARD_VARIANTS = {
  base: {
    backgroundColor: COLORS.background.card,
    borderColor: COLORS.border.light,
    boxShadow: SHADOWS.card,
  },
  cyan: {
    backgroundColor: 'rgba(0, 217, 192, 0.08)',
    borderColor: 'rgba(0, 217, 192, 0.3)',
    boxShadow: `${SHADOWS.card}, 0 0 20px rgba(0, 217, 192, 0.1)`,
  },
  red: {
    backgroundColor: 'rgba(231, 76, 60, 0.08)',
    borderColor: 'rgba(231, 76, 60, 0.3)',
    boxShadow: `${SHADOWS.card}, 0 0 20px rgba(231, 76, 60, 0.1)`,
  },
  green: {
    backgroundColor: 'rgba(10, 74, 63, 0.15)',
    borderColor: 'rgba(10, 74, 63, 0.4)',
    boxShadow: `${SHADOWS.card}, 0 0 20px rgba(10, 74, 63, 0.1)`,
  },
  amber: {
    backgroundColor: 'rgba(245, 166, 35, 0.08)',
    borderColor: 'rgba(245, 166, 35, 0.3)',
    boxShadow: `${SHADOWS.card}, 0 0 20px rgba(245, 166, 35, 0.1)`,
  },
};

// Status Color Mapping
export const STATUS_COLOR_MAP = {
  critical: 'red',
  high: 'red',
  medium: 'amber',
  warning: 'amber',
  low: 'green',
  success: 'green',
  info: 'cyan',
  online: 'green',
  offline: 'red',
  active: 'cyan',
  inactive: 'amber',
};

/**
 * Utility to add alpha transparency to a hex color
 * @param {string} color - Hex color code (e.g. #00D9C0)
 * @param {string} alphaHex - 2-character hex alpha (e.g. 1A for 10%)
 * @returns {string} - Combined color string
 */
export const withAlpha = (color, alphaHex) => `${color}${alphaHex}`;
