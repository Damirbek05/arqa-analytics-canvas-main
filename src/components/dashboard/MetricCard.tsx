import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  change?: {
    value: number;
    label: string;
  };
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

export function MetricCard({ title, value, change, icon: Icon, className }: MetricCardProps) {
  const isPositive = change ? change.value >= 0 : true;

  return (
    <Card className={cn("shadow-card", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <Icon className="h-4 w-4 text-muted-foreground" />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            {isPositive ? (
              <ArrowUpIcon className="h-3 w-3 text-success mr-1" />
            ) : (
              <ArrowDownIcon className="h-3 w-3 text-destructive mr-1" />
            )}
            <span className={cn(
              isPositive ? "text-success" : "text-destructive"
            )}>
              {Math.abs(change.value)}%
            </span>
            <span className="ml-1">{change.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}