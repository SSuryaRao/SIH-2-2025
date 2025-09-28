'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  icon?: React.ComponentType<{ className?: string }>;
}

interface ActivityLogProps {
  activities: ActivityItem[];
  maxVisible?: number;
  className?: string;
}

const typeStyles = {
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  success: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  error: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
};

export function ActivityLog({ activities, maxVisible = 5, className }: ActivityLogProps) {
  const [showAll, setShowAll] = useState(false);

  const displayedActivities = showAll ? activities : activities.slice(0, maxVisible);
  const hasMore = activities.length > maxVisible;

  return (
    <Card className={cn("rounded-2xl shadow-md", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayedActivities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No recent activity</p>
          </div>
        ) : (
          displayedActivities.map((activity) => {
            const IconComponent = activity.icon || Clock;
            return (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex-shrink-0 mt-0.5">
                  <IconComponent className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="text-sm font-medium truncate">{activity.title}</h4>
                    <Badge className={cn("text-xs", typeStyles[activity.type])}>
                      {activity.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{activity.description}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(activity.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {hasMore && (
          <div className="text-center pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              className="text-xs"
            >
              {showAll ? (
                <>
                  <ChevronUp className="mr-1 h-3 w-3" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="mr-1 h-3 w-3" />
                  Show {activities.length - maxVisible} More
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}