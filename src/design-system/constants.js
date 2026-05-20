/**
 * Design System Constants
 * Centralized token definitions for the entire application
 */

// Color Palette
export const COLORS = {
  // Backgrounds & Surfaces
  background: {
    primary: 'rgb(var(--color-bg-primary-rgb))',
    card: 'rgb(var(--color-bg-card-rgb))',
    sidebar: 'rgb(var(--color-bg-sidebar-rgb))',
    hover: 'rgb(var(--color-bg-hover-rgb))',
    input: 'rgb(var(--color-bg-input-rgb))',
  },

  // Accent Colors
  accent: {
    cyan: 'rgb(var(--color-accent-cyan-rgb))',
    cyanLight: 'rgb(var(--color-accent-cyan-light-rgb))',
    cyanDark: 'rgb(var(--color-accent-cyan-dark-rgb))',
  },

  // Status Colors - Semantic
  status: {
    success: 'rgb(var(--color-status-success-rgb))',
    warning: 'rgb(var(--color-status-warning-rgb))',
    danger: 'rgb(var(--color-status-danger-rgb))',
    critical: 'rgb(var(--color-status-critical-rgb))',
    neutral: 'rgb(var(--color-status-neutral-rgb))',
  },

  // Text Colors
  text: {
    primary: 'rgb(var(--color-text-primary-rgb))',
    secondary: 'rgb(var(--color-text-secondary-rgb))',
    tertiary: 'rgb(var(--color-text-tertiary-rgb))',
    muted: 'rgb(var(--color-text-muted-rgb))',
  },

  // Borders & Dividers
  border: {
    light: 'rgb(var(--color-border-light-rgb) / 0.12)',
    lighter: 'rgb(var(--color-border-light-rgb) / 0.06)',
    default: 'rgb(var(--color-border-default-rgb))',
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
  sm: 'var(--shadow-sm)',
  md: 'var(--shadow-md)',
  lg: 'var(--shadow-lg)',
  xl: 'var(--shadow-xl)',
  card: 'var(--shadow-card)',
  cardHover: 'var(--shadow-card-hover)',
  glowCyan: '0 0 20px rgb(var(--color-accent-cyan-rgb) / 0.1)',
  glowCyanHover: '0 0 30px rgb(var(--color-accent-cyan-rgb) / 0.18)',
  glowRed: '0 0 20px rgb(var(--color-status-danger-rgb) / 0.1)',
  glowRedHover: '0 0 30px rgb(var(--color-status-danger-rgb) / 0.15)',
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
    backgroundColor: 'rgb(var(--color-accent-cyan-rgb) / 0.08)',
    borderColor: 'rgb(var(--color-accent-cyan-rgb) / 0.3)',
    boxShadow: `${SHADOWS.card}, 0 0 20px rgb(var(--color-accent-cyan-rgb) / 0.1)`,
  },
  red: {
    backgroundColor: 'rgb(var(--color-status-danger-rgb) / 0.08)',
    borderColor: 'rgb(var(--color-status-danger-rgb) / 0.3)',
    boxShadow: `${SHADOWS.card}, 0 0 20px rgb(var(--color-status-danger-rgb) / 0.1)`,
  },
  green: {
    backgroundColor: 'rgb(var(--color-status-success-rgb) / 0.12)',
    borderColor: 'rgb(var(--color-status-success-rgb) / 0.35)',
    boxShadow: `${SHADOWS.card}, 0 0 20px rgb(var(--color-status-success-rgb) / 0.1)`,
  },
  amber: {
    backgroundColor: 'rgb(var(--color-status-warning-rgb) / 0.08)',
    borderColor: 'rgb(var(--color-status-warning-rgb) / 0.3)',
    boxShadow: `${SHADOWS.card}, 0 0 20px rgb(var(--color-status-warning-rgb) / 0.1)`,
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

const alphaHexToDecimal = (alphaHex) => {
  const alpha = parseInt(alphaHex, 16);
  if (Number.isNaN(alpha)) return 1;
  return Math.max(0, Math.min(1, alpha / 255));
};

/**
 * Utility to add alpha transparency to a hex color
 * @param {string} color - Hex color code (e.g. #00D9C0)
 * @param {string} alphaHex - 2-character hex alpha (e.g. 1A for 10%)
 * @returns {string} - Combined color string
 */
export const withAlpha = (color, alphaHex) => {
  if (color?.startsWith('rgb(var(')) {
    return color.replace('))', `) / ${alphaHexToDecimal(alphaHex)})`);
  }

  return `${color}${alphaHex}`;
};
