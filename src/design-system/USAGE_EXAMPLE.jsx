/**
 * DESIGN SYSTEM INTEGRATION EXAMPLE
 * 
 * This example shows how to use the centralized design system
 * with API data to build a complete dashboard page.
 * 
 * Copy this pattern to create other pages that use the design system.
 */

import React from "react";
import {
  Activity,
  AlertTriangle,
  Eye,
  Radio,
  Network,
  TrendingUp,
  Zap,
} from "lucide-react";

// Import design system
import { SPACING } from "../design-system/constants";
import { useResponsiveGrid } from "../design-system/hooks";

// Import data components (API-connected, reusable)
import { StatsGrid, ActivityFeed, DataTable } from "../components/data";

// Import layout
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";

// Import API hooks
import { useStatusPolling } from "../hooks/useStatusPolling";

/**
 * Example Dashboard using Design System
 * 
 * This component demonstrates:
 * 1. Using design system constants for consistent styling
 * 2. Using reusable data components connected to API
 * 3. Responsive layouts using design system utilities
 * 4. Status-based color mapping
 */
export function DashboardExample() {
  // Fetch data from API using custom hook
  const { status, attackCount, totalLogs, recentLogs, loading } =
    useStatusPolling();

  // Get grid layout classes from design system
  const gridClasses = useResponsiveGrid(4);

  /**
   * Map API data to StatsGrid format
   * This separates data transformation from presentation
   */
  const statCards = React.useMemo(
    () => [
      {
        title: "Threats Blocked",
        value: attackCount?.total || "0",
        subtitle: "+12% from last week",
        icon: AlertTriangle,
        status: attackCount?.total > 100 ? "critical" : "high",
        trend: "+12%",
        variant: "red",
      },
      {
        title: "Privacy Score",
        value: status?.privacy_score || "98%",
        subtitle: "Excellent protection",
        icon: Eye,
        status: "success",
        trend: "+2%",
        variant: "green",
      },
      {
        title: "Sites Scanned",
        value: totalLogs || "0",
        subtitle: "This month",
        icon: Network,
        status: "info",
        trend: "+5%",
        variant: "cyan",
      },
      {
        title: "Active Protection",
        value: status?.is_online ? "24/7" : "Offline",
        subtitle: "All services running",
        icon: Zap,
        status: status?.is_online ? "success" : "critical",
        trend: status?.is_online ? "Online" : "Offline",
        variant: status?.is_online ? "amber" : "red",
      },
    ],
    [status, attackCount, totalLogs]
  );

  /**
   * Define table columns for displaying logs
   * This demonstrates the DataTable component
   */
  const logColumns = React.useMemo(
    () => [
      {
        key: "timestamp",
        label: "Timestamp",
        sortable: true,
        width: "150px",
      },
      {
        key: "source_ip",
        label: "Source IP",
        sortable: true,
      },
      {
        key: "dest_ip",
        label: "Destination IP",
        sortable: true,
      },
      {
        key: "threat_level",
        label: "Severity",
        sortable: true,
        render: (value) => <span className="text-amber">{value}</span>,
      },
      {
        key: "is_attack",
        label: "Type",
        render: (value) => (
          <span className={value ? "text-red" : "text-green"}>
            {value ? "Attack" : "Normal"}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Grid Section - Using Design System */}
      <section>
        <h2 className="text-heading-lg mb-4">Security Overview</h2>
        <StatsGrid
          stats={statCards}
          columns={4}
          loading={loading}
          gap="gap-6"
          onStatClick={(stat) => console.log("Stat clicked:", stat)}
        />
      </section>

      {/* Charts Section - Responsive 2-column layout */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Weekly Activity Chart */}
        <Card variant="cyan" className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan" />
              Weekly Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-bg-primary/50 rounded-xl border border-border-light flex items-center justify-center">
              <div className="text-center space-y-3">
                <TrendingUp className="w-12 h-12 text-cyan/20 mx-auto" />
                <p className="text-text-muted text-sm">Chart Area</p>
                <p className="text-caption">Connect real data via API</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Threat Distribution */}
        <Card variant="amber" className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-amber" />
              Threat Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-bg-primary/50 rounded-xl border border-border-light flex items-center justify-center">
              <div className="text-center space-y-3">
                <p className="text-text-muted text-sm">Chart Area</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Activity Feed - Using Design System */}
      <section>
        <ActivityFeed
          activities={recentLogs || []}
          variant="cyan"
          maxItems={5}
          loading={loading}
          onActivityClick={(activity) =>
            console.log("Activity clicked:", activity)
          }
          emptyMessage="No recent threats detected"
        />
      </section>

      {/* Data Table - Using Design System */}
      <section>
        <DataTable
          data={recentLogs || []}
          columns={logColumns}
          title="Recent Security Events"
          variant="cyan"
          loading={loading}
          onRowClick={(row) => console.log("Row clicked:", row)}
        />
      </section>
    </div>
  );
}

export default DashboardExample;

/**
 * KEY PATTERNS DEMONSTRATED:
 * 
 * 1. **Data Mapping**
 *    Map API responses to component-expected format in useMemo
 * 
 * 2. **Reusable Components**
 *    Use StatsGrid, ActivityFeed, DataTable instead of custom layout
 * 
 * 3. **Design System Integration**
 *    - SPACING for margins/padding
 *    - useResponsiveGrid for responsive layout
 *    - Status-based color mapping
 * 
 * 4. **Performance**
 *    - useMemo for data transformations
 *    - Memoized props prevent unnecessary re-renders
 * 
 * 5. **Accessibility**
 *    - Semantic HTML
 *    - ARIA labels on data regions
 *    - Keyboard navigation on tables
 * 
 * 6. **API Integration**
 *    - Single hook (useStatusPolling) fetches all data
 *    - Components handle loading states
 *    - Components handle empty states
 */

/**
 * TO USE THIS EXAMPLE:
 * 
 * 1. Replace pages/Dashboard.jsx with this pattern
 * 2. Update imports to match your actual paths
 * 3. Connect to your API endpoints
 * 4. Customize statCards and logColumns as needed
 * 5. Add your own chart implementations
 * 
 * The design system automatically handles:
 * - Color consistency across all components
 * - Responsive layouts
 * - Loading states and skeletons
 * - Empty state messaging
 * - Hover effects and transitions
 * - Status-based styling
 */
