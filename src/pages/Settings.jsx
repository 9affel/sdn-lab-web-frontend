import { Settings as SettingsIcon, Bell, Shield, Database, Globe } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';

/**
 * Settings page — Placeholder for security configuration.
 */
export default function Settings() {
  const settingGroups = [
    { icon: Shield,   title: 'Security Policies',  desc: 'Configure threat detection thresholds and action rules' },
    { icon: Bell,     title: 'Notifications',       desc: 'Alert channels, escalation rules, and email settings' },
    { icon: Database, title: 'Data Retention',       desc: 'Log storage duration and archival policies' },
    { icon: Globe,    title: 'Network Settings',     desc: 'SDN controller connection and API endpoints' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Security Settings</h1>
        <p className="text-sm text-text-muted mt-1">
          Configure system behavior, notification rules, and data management
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {settingGroups.map((group) => (
          <Card key={group.title} className="cursor-pointer group">
            <CardContent className="py-5">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/15 transition-colors">
                  <group.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">
                    {group.title}
                  </h3>
                  <p className="text-xs text-text-muted mt-1">{group.desc}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
