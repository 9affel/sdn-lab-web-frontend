import { ShieldAlert, Search, Filter } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';

/**
 * Threat Logs page — Placeholder for the 71-feature data table.
 */
export default function ThreatLogs() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Threat Logs</h1>
          <p className="text-sm text-text-muted mt-1">
            Detailed security event logs with 71-feature network vector analysis
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <Card>
        <CardContent className="py-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Filter by Source IP, Destination IP, or Protocol..."
                className="w-full h-9 pl-9 pr-4 rounded-lg bg-bg-deep border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-bg-hover border border-border text-sm text-text-secondary hover:text-text-primary hover:border-border-light transition-colors">
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Table Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Security Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/5 border border-primary/10 mb-4">
              <ShieldAlert className="w-8 h-8 text-primary/40" />
            </div>
            <p className="text-text-secondary text-sm font-medium">
              Data Table Component
            </p>
            <p className="text-text-muted text-xs mt-1 max-w-sm text-center">
              The 71-feature threat log table with row expansion, column grouping, and IP filtering will be implemented in the next phase.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
