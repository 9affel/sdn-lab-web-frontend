/**
 * ActivityFeed Component
 * Generic reusable component for displaying activity logs and events
 * Connects to API and displays real-time data with proper theming
 */

import React, { useMemo } from 'react';
import { Activity } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { useStatusColor } from '../../design-system/hooks';

/**
 * @component ActivityFeed
 * @description Displays a feed of activities/logs with filtering and status indicators
 * 
 * @param {Object} props
 * @param {Array} props.activities - Array of activity objects
 *   - Each activity should have: id, title, description, status, timestamp, severity
 * @param {string} props.variant - Card variant (base, cyan, red, green, amber)
 * @param {number} props.maxItems - Maximum items to display (default: 5)
 * @param {boolean} props.loading - Loading state
 * @param {Function} props.onActivityClick - Click handler for activities
 * @param {string} props.emptyMessage - Message when no activities
 * @param {string} props.className - Additional CSS classes
 * @returns {React.ReactElement}
 */
export const ActivityFeed = ({
  activities = [],
  variant = 'cyan',
  maxItems = 5,
  loading = false,
  onActivityClick,
  emptyMessage = 'No recent activity',
  className = '',
}) => {
  // Limit activities to maxItems
  const displayedActivities = useMemo(
    () => activities.slice(0, maxItems),
    [activities, maxItems]
  );

  return (
    <Card variant={variant} className={`hover-lift ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Activity Feed
          </CardTitle>
          <Badge variant={variant}>{displayedActivities.length} Events</Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          {loading ? (
            // Loading skeleton
            Array(3)
              .fill(null)
              .map((_, idx) => (
                <div
                  key={`activity-skeleton-${idx}`}
                  className="p-4 rounded-lg border border-border-light animate-pulse"
                >
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-border-light flex-shrink-0 mt-1.5"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-border-light rounded w-1/3"></div>
                      <div className="h-2 bg-border-light rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              ))
          ) : displayedActivities.length > 0 ? (
            // Render activities
            displayedActivities.map((activity, idx) => (
              <ActivityItem
                key={activity.id || idx}
                activity={activity}
                onClick={() => onActivityClick?.(activity)}
              />
            ))
          ) : (
            // Empty state
            <div className="text-center py-8">
              <Activity className="w-8 h-8 text-text-muted/30 mx-auto mb-3" />
              <p className="text-text-muted text-sm">{emptyMessage}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Individual Activity Item Component
 */
const ActivityItem = ({ activity, onClick }) => {
  const statusColor = useStatusColor(activity.severity || activity.status);

  return (
    <div
      onClick={onClick}
      className="p-4 rounded-lg border border-border-light hover:border-cyan/50 hover:bg-cyan/5 transition-all duration-300 group cursor-pointer"
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left: Activity Info */}
        <div className="flex items-start gap-3 flex-1">
          <div
            className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 animate-glow-pulse"
            style={{ backgroundColor: statusColor?.text || '#00D9C0' }}
          ></div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary group-hover:text-cyan transition-colors">
              {activity.title || activity.threat_level?.toUpperCase() || 'Event'}
            </p>
            <p className="text-xs text-text-muted font-mono truncate mt-0.5">
              {activity.description || `${activity.source_ip} → ${activity.dest_ip}`}
            </p>
            {activity.timestamp && (
              <p className="text-xs text-text-muted mt-1">
                {new Date(activity.timestamp).toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>

        {/* Right: Badge */}
        <Badge
          variant={
            activity.severity === 'critical' ||
            activity.threat_level === 'critical'
              ? 'red'
              : activity.severity === 'high' ||
                  activity.threat_level === 'high'
                ? 'red'
                : activity.severity === 'medium' ||
                  activity.threat_level === 'warning'
                ? 'amber'
                : 'green'
          }
        >
          {activity.severity || activity.threat_level || 'low'}
        </Badge>
      </div>
    </div>
  );
};

export default ActivityFeed;
