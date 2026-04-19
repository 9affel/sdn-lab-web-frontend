import { Network as NetworkIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';

/**
 * Network Map page — Placeholder for SDN topology visualization.
 */
export default function NetworkMap() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Network Map</h1>
        <p className="text-sm text-text-muted mt-1">
          SDN topology with switch-to-host connections and flow visualization
        </p>
      </div>

      <Card className="min-h-[500px]">
        <CardHeader>
          <CardTitle>SDN Topology</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-24">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/5 border border-primary/10 mb-4">
              <NetworkIcon className="w-10 h-10 text-primary/30" />
            </div>
            <p className="text-text-secondary text-sm font-medium">
              Network Topology Viewer
            </p>
            <p className="text-text-muted text-xs mt-1 max-w-sm text-center">
              Interactive SDN network map showing Containerlab nodes, OVS switches, and real-time flow data
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
