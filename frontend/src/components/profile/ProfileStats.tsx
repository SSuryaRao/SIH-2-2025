'use client';

import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatItem {
  label: string;
  value: string | number;
  icon?: ReactNode;
  description?: string;
}

interface ProfileStatsProps {
  title: string;
  icon?: ReactNode;
  stats: StatItem[];
  className?: string;
}

export function ProfileStats({ title, icon, stats, className }: ProfileStatsProps) {
  return (
    <Card className={cn("rounded-2xl shadow-md", className)}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats.map((stat, index) => (
          <div key={index} className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {stat.icon}
              <div>
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                {stat.description && (
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                )}
              </div>
            </div>
            <span className="font-semibold">{stat.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}