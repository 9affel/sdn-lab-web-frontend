/**
 * DESIGN SYSTEM GUIDE
 * ====================
 * 
 * This comprehensive guide documents the centralized design system
 * for the SDN-EDR Dashboard project. All components, colors, and
 * spacing should reference this system.
 */

/**
 * # DESIGN SYSTEM STRUCTURE
 * 
 * src/design-system/
 *   ├── index.js              (Main export point)
 *   ├── constants.js          (All design tokens)
 *   └── hooks.js              (Custom React hooks for styling)
 * 
 * src/components/
 *   ├── ui/                   (Base UI components)
 *   │   ├── Card.jsx
 *   │   ├── Button.jsx
 *   │   ├── Badge.jsx
 *   │   ├── Input.jsx
 *   │   ├── LivePulse.jsx
 *   │   └── index.js
 *   ├── data/                 (API-connected data components)
 *   │   ├── MetricCard.jsx    (Single metric display)
 *   │   ├── StatsGrid.jsx     (Grid of metrics)
 *   │   ├── ActivityFeed.jsx  (Activity log display)
 *   │   ├── DataTable.jsx     (Generic data table)
 *   │   └── index.js
 *   └── layout/               (Page layout components)
 *       ├── MainLayout.jsx
 *       ├── Sidebar.jsx
 *       └── TopBar.jsx
 */

/**
 * # COLOR PALETTE
 * 
 * Backgrounds & Surfaces:
 *   - Primary:    #0A0E1A (very dark blue-black, page background)
 *   - Card:       #151B2B (dark blue-gray, component backgrounds)
 *   - Sidebar:    #0D1117 (slightly lighter, navigation background)
 *   - Hover:      #1a2437 (hover state background)
 *   - Input:      #0F1420 (form input background)
 * 
 * Accent Colors:
 *   - Cyan:       #00D9C0 (primary accent, active states)
 *   - Cyan Light: #1DD3C3 (lighter variant)
 *   - Cyan Dark:  #00a89f (darker variant)
 * 
 * Status Colors (Semantic):
 *   - Success:    #0A4A3F (green, privacy/success)
 *   - Warning:    #F5A623 (amber, warnings/malware)
 *   - Danger:     #E74C3C (red, critical threats)
 *   - Critical:   #8B3A3A (dark red, error states)
 *   - Neutral:    #6B7280 (gray, borders/dividers)
 * 
 * Text Colors:
 *   - Primary:    #FFFFFF (white, main text)
 *   - Secondary:  #9CA3AF (light gray, secondary text)
 *   - Tertiary:   #6B7280 (medium gray, tertiary text)
 *   - Muted:      #A0AEC0 (muted content)
 */

/**
 * # USAGE EXAMPLES
 */

/**
 * ## 1. Using Design System Constants
 * 
 * import { COLORS, SPACING, TYPOGRAPHY } from 'src/design-system';
 * 
 * const myStyle = {
 *   backgroundColor: COLORS.background.primary,
 *   padding: SPACING.lg,
 *   fontFamily: TYPOGRAPHY.fontFamily.primary,
 *   fontSize: TYPOGRAPHY.fontSize.lg,
 * };
 */

/**
 * ## 2. Using Design System Hooks
 * 
 * import { useStatusColor, useCardVariant, useResponsiveGrid } from 'src/design-system/hooks';
 * 
 * function MyComponent() {
 *   const statusColor = useStatusColor('critical');  // Get colors based on status
 *   const cardStyle = useCardVariant('cyan');        // Get card variant styles
 *   const gridClasses = useResponsiveGrid(4);        // Get responsive grid classes
 *   
 *   return (
 *     <div style={{ color: statusColor.text }}>
 *       Content
 *     </div>
 *   );
 * }
 */

/**
 * ## 3. Using MetricCard Component
 * 
 * import { MetricCard } from 'src/components/data';
 * import { AlertTriangle } from 'lucide-react';
 * 
 * <MetricCard
 *   title="Threats Blocked"
 *   value="1,247"
 *   subtitle="+12% from last week"
 *   icon={AlertTriangle}
 *   status="critical"
 *   variant="red"
 *   trend="+12%"
 *   onClick={(metric) => console.log(metric)}
 * />
 */

/**
 * ## 4. Using StatsGrid Component (Multiple Metrics)
 * 
 * import { StatsGrid } from 'src/components/data';
 * import { useStatusPolling } from 'src/hooks/useStatusPolling';
 * 
 * function Dashboard() {
 *   const { status, attackCount } = useStatusPolling();
 *   
 *   const stats = [
 *     {
 *       title: "Threats Blocked",
 *       value: attackCount,
 *       subtitle: "This week",
 *       icon: AlertTriangle,
 *       status: "critical",
 *       variant: "red",
 *     },
 *     // ... more stats
 *   ];
 *   
 *   return <StatsGrid stats={stats} columns={4} />;
 * }
 */

/**
 * ## 5. Using ActivityFeed Component
 * 
 * import { ActivityFeed } from 'src/components/data';
 * 
 * <ActivityFeed
 *   activities={recentLogs}
 *   variant="cyan"
 *   maxItems={5}
 *   onActivityClick={(activity) => navigate(`/details/${activity.id}`)}
 *   emptyMessage="No recent threats detected"
 * />
 */

/**
 * ## 6. Using DataTable Component
 * 
 * import { DataTable } from 'src/components/data';
 * 
 * const columns = [
 *   { key: 'timestamp', label: 'Date', sortable: true, width: '150px' },
 *   { key: 'source_ip', label: 'Source IP', sortable: true },
 *   { key: 'threat_level', label: 'Severity', sortable: true },
 *   {
 *     key: 'is_attack',
 *     label: 'Status',
 *     render: (value) => <Badge variant={value ? 'red' : 'green'}>
 *       {value ? 'Attack' : 'Safe'}
 *     </Badge>
 *   },
 * ];
 * 
 * <DataTable
 *   data={logs}
 *   columns={columns}
 *   title="Recent Logs"
 *   variant="cyan"
 *   onRowClick={(row) => console.log(row)}
 * />
 */

/**
 * ## 7. Connecting to API Data
 * 
 * All data components inherit colors and styling from the design system.
 * They automatically use the correct colors based on API response data.
 * 
 * The API structure expected:
 * - logs: Array of { id, threat_level, source_ip, dest_ip, is_attack, severity, timestamp }
 * - status: { status, attack_count, total_logs }
 * 
 * Example connection in a page:
 * 
 * import { StatsGrid, ActivityFeed, DataTable } from 'src/components/data';
 * import { useStatusPolling } from 'src/hooks/useStatusPolling';
 * import { getFilteredLogs } from 'src/api/services';
 * 
 * function ThreatDashboard() {
 *   const { recentLogs, attackCount } = useStatusPolling();
 *   
 *   const statsData = [
 *     {
 *       title: "High-Risk Threats",
 *       value: attackCount?.high || 0,
 *       status: "critical",
 *       // ...
 *     },
 *   ];
 *   
 *   return (
 *     <>
 *       <StatsGrid stats={statsData} />
 *       <ActivityFeed activities={recentLogs} />
 *       <DataTable data={recentLogs} columns={tableColumns} />
 *     </>
 *   );
 * }
 */

/**
 * # CSS VARIABLE OPTIONS
 * 
 * If you prefer CSS variables instead of JavaScript constants:
 * Define these in index.css and reference them in components:
 * 
 * :root {
 *   --color-bg-primary: #0A0E1A;
 *   --color-bg-card: #151B2B;
 *   --color-accent-cyan: #00D9C0;
 *   --color-text-primary: #FFFFFF;
 *   --spacing-base: 4px;
 *   --transition-duration: 300ms;
 * }
 * 
 * Usage: color: var(--color-text-primary);
 */

/**
 * # RESPONSIVE BREAKPOINTS
 * 
 * Mobile:      320px  (xs)
 * Tablet:      640px  (sm)
 * Desktop:     768px  (md)
 * Large:       1024px (lg)
 * Extra Large: 1280px (xl)
 * 2K:          1536px (2xl)
 * 
 * Grid responsiveness:
 *   - 1 column:   Mobile
 *   - 2 columns:  md and up
 *   - 3 columns:  lg and up
 *   - 4 columns:  xl and up
 */

/**
 * # COMPONENT COMPOSITION PATTERNS
 * 
 * Pattern 1: Base Component + Design System
 * ──────────────────────────────────────────
 * <Card variant="cyan">
 *   Content using design system colors
 * </Card>
 * 
 * Pattern 2: Data Component + API Hook
 * ──────────────────────────────────────
 * const { data } = useAPIHook();
 * <StatsGrid stats={data.stats} />
 * 
 * Pattern 3: Responsive Layout
 * ──────────────────────────────
 * <StatsGrid columns={4} gap="gap-6" />
 * Automatically responds to screen size
 * 
 * Pattern 4: Status-Based Styling
 * ────────────────────────────────
 * <MetricCard status={value.severity} />
 * Component automatically colors based on severity
 */

/**
 * # BEST PRACTICES
 * 
 * 1. Always import from design-system:
 *    ✓ import { COLORS } from 'src/design-system';
 *    ✗ hardcode colors like '#0A0E1A'
 * 
 * 2. Use data components for API integration:
 *    ✓ <StatsGrid stats={apiData} />
 *    ✗ <div>Manual layout that doesn't scale</div>
 * 
 * 3. Pass status/severity to components:
 *    ✓ <MetricCard status={log.threat_level} />
 *    ✗ <MetricCard color="red" />
 * 
 * 4. Use responsive grid utilities:
 *    ✓ <StatsGrid columns={4} />
 *    ✗ <div className="grid grid-cols-4">
 * 
 * 5. Leverage memoization for performance:
 *    ✓ const stats = useMemo(() => data, [data]);
 *    ✗ Recreate data on every render
 */

/**
 * # EXTENDING THE DESIGN SYSTEM
 * 
 * To add new colors:
 * 1. Add to COLORS in src/design-system/constants.js
 * 2. Update CARD_VARIANTS if needed
 * 3. Update STATUS_COLOR_MAP for semantic colors
 * 
 * To add new component variants:
 * 1. Create component in src/components/data/
 * 2. Import design system hooks
 * 3. Use useStatusColor or useCardVariant hooks
 * 4. Export from src/components/data/index.js
 */

export default {
  title: 'DESIGN SYSTEM',
  description: 'Comprehensive guide for SDN-EDR Dashboard design system',
};
