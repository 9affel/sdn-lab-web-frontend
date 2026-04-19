/**
 * ========================================================================
 * CENTRALIZED DESIGN SYSTEM - COMPLETE DOCUMENTATION
 * ========================================================================
 * 
 * SDN-EDR Dashboard | Professional Enterprise Security Monitoring System
 * 
 * This document provides a complete overview of the design system architecture,
 * component structure, and integration patterns.
 */

// ========================================================================
// ARCHITECTURE OVERVIEW
// ========================================================================

/**
 * 
 * PROJECT STRUCTURE:
 * 
 * src/
 * ├── design-system/                    ← DESIGN SYSTEM FOUNDATION
 * │   ├── constants.js                  (Color palette, tokens, breakpoints)
 * │   ├── hooks.js                      (Custom React hooks for styling)
 * │   ├── index.js                      (Main export point)
 * │   ├── DESIGN_SYSTEM.md              (This documentation)
 * │   └── USAGE_EXAMPLE.jsx             (Example implementation)
 * │
 * ├── components/
 * │   ├── ui/                           ← BASE COMPONENTS (Reusable UI)
 * │   │   ├── Card.jsx                  (Card container with variants)
 * │   │   ├── Button.jsx                (Button styles)
 * │   │   ├── Badge.jsx                 (Status badges)
 * │   │   ├── Input.jsx                 (Form input)
 * │   │   ├── LivePulse.jsx             (Status indicator)
 * │   │   └── index.js
 * │   │
 * │   ├── data/                         ← DATA COMPONENTS (API-connected)
 * │   │   ├── MetricCard.jsx            (Single metric display)
 * │   │   ├── StatsGrid.jsx             (Grid of metrics)
 * │   │   ├── ActivityFeed.jsx          (Activity log display)
 * │   │   ├── DataTable.jsx             (Generic data table)
 * │   │   └── index.js
 * │   │
 * │   └── layout/                       ← LAYOUT COMPONENTS
 * │       ├── MainLayout.jsx            (Main page wrapper)
 * │       ├── Sidebar.jsx               (Navigation)
 * │       └── TopBar.jsx                (Top navigation)
 * │
 * ├── pages/                            ← PAGE IMPLEMENTATIONS
 * │   ├── Dashboard.jsx                 (Main dashboard)
 * │   ├── ThreatLogs.jsx               (Logs page)
 * │   ├── NetworkMap.jsx               (Network visualization)
 * │   ├── Settings.jsx                 (Configuration page)
 * │   └── Login.jsx                    (Authentication)
 * │
 * ├── hooks/                            ← CUSTOM REACT HOOKS
 * │   ├── useStatusPolling.js          (Fetch dashboard data)
 * │   └── useAuth.js                   (Authentication state)
 * │
 * ├── api/                              ← API INTEGRATION
 * │   ├── axios.js                     (HTTP client config)
 * │   └── services.js                  (API endpoint calls)
 * │
 * ├── index.css                         ← GLOBAL STYLES & CSS
 * ├── main.jsx                          ← React entry point
 * └── App.jsx                           ← Root component
 */

// ========================================================================
// DESIGN SYSTEM FOUNDATION
// ========================================================================

/**
 * 1. COLOR SYSTEM
 * ───────────────────────────────────────────────────────────────────────
 * 
 * BACKGROUNDS & SURFACES:
 *   #0A0E1A - Primary Background (page)
 *   #151B2B - Card Background (components)
 *   #0D1117 - Sidebar Background
 *   #1a2437 - Hover state
 *   #0F1420 - Form inputs
 * 
 * ACCENT COLORS:
 *   #00D9C0 - Primary Cyan (main brand color)
 *   #1DD3C3 - Cyan Light (lighter variant)
 *   #00a89f - Cyan Dark (darker variant)
 * 
 * STATUS/SEMANTIC COLORS:
 *   #0A4A3F - Green (success/privacy)
 *   #F5A623 - Amber (warnings/malware)
 *   #E74C3C - Red (danger/critical threats)
 *   #8B3A3A - Dark Red (error states)
 *   #6B7280 - Neutral (borders/dividers)
 * 
 * TEXT COLORS:
 *   #FFFFFF - Primary Text (white)
 *   #9CA3AF - Secondary Text (light gray)
 *   #6B7280 - Tertiary Text (medium gray)
 *   #A0AEC0 - Muted Text (for less important content)
 * 
 * BORDERS:
 *   rgba(255, 255, 255, 0.05)  - Light border
 *   rgba(255, 255, 255, 0.02)  - Lighter border
 *   #1e293b                    - Default border (slate)
 */

/**
 * 2. SPACING SYSTEM (Base: 4px)
 * ───────────────────────────────────────────────────────────────────────
 * 
 *   xs:  0.25rem  (4px)
 *   sm:  0.5rem   (8px)
 *   md:  1rem     (16px)
 *   lg:  1.5rem   (24px)
 *   xl:  2rem     (32px)
 *   2xl: 3rem     (48px)
 *   3xl: 4rem     (64px)
 * 
 * Usage: Apply consistent spacing using SPACING constant
 */

/**
 * 3. TYPOGRAPHY SYSTEM
 * ───────────────────────────────────────────────────────────────────────
 * 
 * FONT FAMILIES:
 *   Primary: "Inter", "Segoe UI", system-ui, sans-serif
 *   Mono:    "Fira Code", monospace
 * 
 * FONT SIZES:
 *   xs:   0.75rem   (12px)  - Small labels
 *   sm:   0.875rem  (14px)  - Regular text
 *   base: 1rem      (16px)  - Default text
 *   lg:   1.125rem  (18px)  - Large text
 *   xl:   1.25rem   (20px)  - Card titles
 *   2xl:  1.5rem    (24px)  - Section headers
 *   3xl:  2rem      (32px)  - Page titles
 * 
 * FONT WEIGHTS:
 *   regular:  400
 *   medium:   500
 *   semibold: 600
 *   bold:     700
 * 
 * LINE HEIGHTS:
 *   tight:    1.2 (for headings)
 *   normal:   1.6 (for body text)
 *   relaxed:  1.8 (for content)
 */

/**
 * 4. BORDER RADIUS
 * ───────────────────────────────────────────────────────────────────────
 * 
 *   xs:   0.25rem   (4px)
 *   sm:   0.375rem  (6px)
 *   md:   0.5rem    (8px)
 *   lg:   0.75rem   (12px)
 *   xl:   1rem      (16px)
 *   2xl:  1.5rem    (24px)
 *   3xl:  1.75rem   (28px)
 * 
 * Default for cards: 1.5rem (24px)
 */

/**
 * 5. BOX SHADOWS (Depth System)
 * ───────────────────────────────────────────────────────────────────────
 * 
 *   sm:              0 1px 2px rgba(0, 0, 0, 0.3)
 *   md:              0 4px 12px rgba(0, 0, 0, 0.3)  ← Default for cards
 *   lg:              0 8px 16px rgba(0, 0, 0, 0.4)
 *   xl:              0 12px 24px rgba(0, 0, 0, 0.5)
 *   glow-cyan:       0 0 20px rgba(0, 217, 192, 0.1)
 *   glow-cyan-hover: 0 0 30px rgba(0, 217, 192, 0.2)
 *   glow-red:        0 0 20px rgba(231, 76, 60, 0.1)
 *   glow-red-hover:  0 0 30px rgba(231, 76, 60, 0.15)
 */

/**
 * 6. ANIMATION & TRANSITIONS
 * ───────────────────────────────────────────────────────────────────────
 * 
 * DURATION SCALES:
 *   fast:  150ms  (quick interactions)
 *   base:  300ms  (standard transitions)
 *   slow:  500ms  (complex animations)
 * 
 * TIMING FUNCTION:
 *   cubic-bezier(0.4, 0, 0.2, 1)  (standard easing)
 * 
 * PREDEFINED ANIMATIONS:
 *   fade-in (opacity + slide)
 *   slide-in-up
 *   slide-in-left
 *   scale-in
 *   glow-pulse (color glow)
 *   ping-soft (subtle ping effect)
 */

// ========================================================================
// COMPONENT LAYERS
// ========================================================================

/**
 * LAYER 1: Base UI Components (src/components/ui/)
 * ───────────────────────────────────────────────────────────────────────
 * 
 * These are foundational, reusable UI elements.
 * They accept props to control appearance.
 * They do NOT contain business logic or API calls.
 * 
 * COMPONENTS:
 *   • Card        - Container with color variants
 *   • Button      - Interactive button with sizes
 *   • Badge       - Status/label display
 *   • Input       - Form input field
 *   • LivePulse   - Animated status indicator
 * 
 * USAGE:
 *   <Card variant="cyan">
 *     <CardHeader>
 *       <CardTitle>Title</CardTitle>
 *     </CardHeader>
 *     <CardContent>Content</CardContent>
 *   </Card>
 */

/**
 * LAYER 2: Data Components (src/components/data/)
 * ───────────────────────────────────────────────────────────────────────
 * 
 * These are smart components that:
 * - Consume API data via props
 * - Use the design system for consistent styling
 * - Handle loading and empty states
 * - Are fully reusable across the application
 * 
 * COMPONENTS:
 * 
 *   • MetricCard
 *     Props: title, value, subtitle, icon, status, trend, variant
 *     Displays a single metric with semantic coloring
 * 
 *   • StatsGrid
 *     Props: stats, columns, loading, onStatClick
 *     Displays multiple metrics in a responsive grid
 * 
 *   • ActivityFeed
 *     Props: activities, variant, maxItems, loading, onActivityClick
 *     Displays activity logs with scroll and filtering
 * 
 *   • DataTable
 *     Props: data, columns, title, loading, onRowClick
 *     Generic table for displaying any data with sorting
 * 
 * USAGE:
 *   const stats = [
 *     { title: "Threats", value: 42, status: "critical" }
 *   ];
 *   <StatsGrid stats={stats} columns={4} />
 */

/**
 * LAYER 3: Layout Components (src/components/layout/)
 * ───────────────────────────────────────────────────────────────────────
 * 
 * COMPONENTS:
 *   • MainLayout   - Page wrapper with sidebar + topbar
 *   • Sidebar     - Navigation sidebar
 *   • TopBar      - Top navigation bar
 */

/**
 * LAYER 4: Page Components (src/pages/)
 * ───────────────────────────────────────────────────────────────────────
 * 
 * Full pages that compose data + layout components.
 * They connect to the API via hooks and pass data down.
 * 
 * EXAMPLES:
 *   • Dashboard     - Main monitoring dashboard
 *   • ThreatLogs   - Detailed threat log viewer
 *   • NetworkMap   - Network topology visualization
 *   • Settings     - Configuration options
 */

// ========================================================================
// INTEGRATION PATTERNS
// ========================================================================

/**
 * PATTERN 1: Data Fetching with API Hook
 * ───────────────────────────────────────────────────────────────────────
 * 
 *   function Dashboard() {
 *     const { data, loading } = useStatusPolling();  // Fetch data
 *     
 *     // Transform API data to component format
 *     const statsData = [{ title: "...", value: data.count }];
 *     
 *     // Pass to reusable component
 *     return <StatsGrid stats={statsData} loading={loading} />;
 *   }
 */

/**
 * PATTERN 2: Status-Based Styling
 * ───────────────────────────────────────────────────────────────────────
 * 
 *   // Component automatically selects color based on severity
 *   <MetricCard
 *     status={threat.severity}  // "critical", "high", "low", etc.
 *     value={threat.count}
 *   />
 * 
 * The useStatusColor hook maps status → color automatically
 */

/**
 * PATTERN 3: Responsive Layouts
 * ───────────────────────────────────────────────────────────────────────
 * 
 *   // Component auto-responds to screen size
 *   <StatsGrid stats={data} columns={4} />
 *   
 *   // Renders as:
 *   // Mobile (sm):  1 column
 *   // Tablet (md):  2 columns
 *   // Desktop (lg): 2-3 columns
 *   // Wide (xl):    4 columns
 */

/**
 * PATTERN 4: Customizing Components with Design System
 * ───────────────────────────────────────────────────────────────────────
 * 
 *   import { COLORS, SPACING } from 'src/design-system';
 *   
 *   <div style={{
 *     backgroundColor: COLORS.background.primary,
 *     padding: SPACING.lg,
 *     color: COLORS.text.primary,
 *   }}>
 *     Custom styled content
 *   </div>
 */

// ========================================================================
// QUICK START GUIDE
// ========================================================================

/**
 * STEPS TO IMPLEMENT DESIGN SYSTEM IN A NEW PAGE:
 * 
 * 1. Create your page in src/pages/MyPage.jsx
 * 
 * 2. Import what you need:
 *    import { StatsGrid, ActivityFeed } from 'src/components/data';
 *    import { useSomeDataHook } from 'src/hooks';
 * 
 * 3. Fetch data:
 *    const { data, loading } = useSomeDataHook();
 * 
 * 4. Transform data to component format:
 *    const stats = data.map(item => ({
 *      title: item.name,
 *      value: item.count,
 *      status: item.severity,
 *    }));
 * 
 * 5. Render using data components:
 *    return <StatsGrid stats={stats} loading={loading} />;
 * 
 * Done! The design system handles:
 * - Colors (status-based)
 * - Layout (responsive grid)
 * - Loading states (skeletons)
 * - Empty states (messaging)
 * - Hover effects
 * - Animations
 */

// ========================================================================
// EXTENDING THE DESIGN SYSTEM
// ========================================================================

/**
 * TO ADD NEW COMPONENT:
 * 
 * 1. Create component in src/components/data/MyComponent.jsx
 * 2. Import design system hooks:
 *    import { useStatusColor, useCardVariant } from 'src/design-system/hooks';
 * 3. Use hooks for styling:
 *    const color = useStatusColor(props.status);
 *    const cardStyle = useCardVariant(props.variant);
 * 4. Export from src/components/data/index.js
 * 5. Update DESIGN_SYSTEM.md with documentation
 */

/**
 * TO ADD NEW COLOR:
 * 
 * 1. Add to COLORS in src/design-system/constants.js
 * 2. Update CARD_VARIANTS if needed
 * 3. Update STATUS_COLOR_MAP if it's a status color
 * 4. Update DESIGN_SYSTEM.md colors section
 */

// ========================================================================
// PERFORMANCE OPTIMIZATION
// ========================================================================

/**
 * The design system is optimized for performance:
 * 
 * • Memoization: Data transformations use useMemo
 * • Component libraries: Tree-shakeable exports
 * • CSS: Generated only for used classes
 * • Bundle: All components shipped with build
 * • Lazy loading: Pages can be code-split
 */

// ========================================================================
// ACCESSIBILITY
// ========================================================================

/**
 * Design system ensures accessibility:
 * 
 * • High contrast: Text on dark backgrounds meet WCAG AA
 * • Semantic HTML: Proper heading hierarchy
 * • ARIA labels: Data regions properly labeled
 * • Keyboard navigation: All components keyboard accessible
 * • Focus indicators: Visible focus states
 * • Reduced motion: Respects prefers-reduced-motion
 */

// ========================================================================
// TROUBLESHOOTING
// ========================================================================

/**
 * Q: Colors don't match the design?
 * A: Check that component uses correct variant or status prop
 * 
 * Q: Component not responsive?
 * A: Use useResponsiveGrid hook or grid layout classes
 * 
 * Q: Loading state not showing?
 * A: Pass loading prop to data component
 * 
 * Q: Styling not applying?
 * A: Ensure design-system CSS is imported in index.css
 */

export const DESIGN_SYSTEM_GUIDE = {
  version: '1.0.0',
  lastUpdated: new Date().toISOString(),
  components: {
    base: ['Card', 'Button', 'Badge', 'Input', 'LivePulse'],
    data: ['MetricCard', 'StatsGrid', 'ActivityFeed', 'DataTable'],
    layout: ['MainLayout', 'Sidebar', 'TopBar'],
  },
  tokens: {
    colors: 'See COLORS in constants.js',
    spacing: 'See SPACING in constants.js',
    typography: 'See TYPOGRAPHY in constants.js',
  },
};
