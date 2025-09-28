'use client';

import { ReactNode } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Edit, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileHeaderProps {
  name: string;
  subtitle: string;
  status?: {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    icon?: ReactNode;
  };
  avatar?: string;
  gradientFrom?: string;
  gradientTo?: string;
  onEdit?: () => void;
  onSettings?: () => void;
  className?: string;
}

export function ProfileHeader({
  name,
  subtitle,
  status,
  avatar,
  gradientFrom = 'from-blue-500',
  gradientTo = 'to-purple-600',
  onEdit,
  onSettings,
  className
}: ProfileHeaderProps) {
  return (
    <Card className={cn("rounded-2xl shadow-md overflow-hidden", className)}>
      <div className={cn("h-20 bg-gradient-to-r", gradientFrom, gradientTo)} />
      <CardContent className="pt-0">
        <div className="flex items-start justify-between -mt-10">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-lg mb-4">
              {avatar ? (
                <Image src={avatar} alt={name} width={80} height={80} className="w-full h-full rounded-full object-cover" />
              ) : (
                <User className="h-10 w-10 text-slate-600 dark:text-slate-400" />
              )}
            </div>
            <h2 className="text-xl font-bold text-center">{name}</h2>
            <p className="text-muted-foreground text-center">{subtitle}</p>

            {status && (
              <div className="flex items-center gap-2 mt-3">
                {status.icon}
                <Badge variant={status.variant}>
                  {status.label}
                </Badge>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-12">
            {onSettings && (
              <Button variant="outline" size="sm" onClick={onSettings}>
                <Settings className="h-4 w-4" />
              </Button>
            )}
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}