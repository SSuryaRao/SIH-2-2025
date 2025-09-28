import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  gradient?: boolean;
  className?: string;
}

export default function DashboardCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  gradient = false,
  className,
}: DashboardCardProps) {
  const gradientClasses = gradient
    ? "bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-pink-500/10 border-blue-200/20"
    : "bg-background";

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 rounded-2xl shadow-md border-0",
        gradientClasses,
        className
      )}
    >
      {/* Subtle background pattern for gradient cards */}
      {gradient && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5" />
      )}

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
        <CardTitle className="text-sm font-semibold text-muted-foreground tracking-wide">
          {title}
        </CardTitle>
        {Icon && (
          <div className={cn(
            "p-2 rounded-xl",
            gradient
              ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg"
              : "bg-muted/50 text-muted-foreground"
          )}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </CardHeader>

      <CardContent className="relative z-10 pb-6">
        <div className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-gray-100 dark:to-gray-400">
          {value}
        </div>

        {description && (
          <p className="text-sm text-muted-foreground mt-2 font-medium">
            {description}
          </p>
        )}

        {trend && (
          <div className="flex items-center mt-3 gap-2">
            <div className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold",
              trend.isPositive
                ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
            )}>
              {trend.isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {trend.isPositive ? "+" : ""}{trend.value}%
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              from last month
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}