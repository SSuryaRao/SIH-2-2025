'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ProfileInfoItemProps {
  label: string;
  value: string | ReactNode;
  icon?: ReactNode;
  className?: string;
}

export function ProfileInfoItem({ label, value, icon, className }: ProfileInfoItemProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="font-medium">
        {typeof value === 'string' ? <p>{value}</p> : value}
      </div>
    </div>
  );
}