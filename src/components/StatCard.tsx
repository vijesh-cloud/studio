
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  className?: string;
  asCard?: boolean;
}

export function StatCard({ icon: Icon, title, value, className, asCard = true }: StatCardProps) {
  const content = (
    <>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </>
  );

  if (asCard) {
    return (
      <Card className={cn('shadow-md hover:shadow-lg transition-shadow', className)}>
        {content}
      </Card>
    );
  }

  return (
    <div className={cn('p-3 rounded-lg border bg-card text-card-foreground', className)}>
        <p className="text-xs text-muted-foreground">{title}</p>
        <div className="flex items-center gap-2">
            <Icon className="h-6 w-6 text-primary"/>
            <p className="font-bold text-lg">{value}</p>
        </div>
    </div>
  );
}
