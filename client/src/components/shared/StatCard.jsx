import { ArrowDown, ArrowUp } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/cn';

/**
 * Stat card matching the admin dashboard reference:
 *   ⚫ icon circle  ·  Label
 *   ────────────────────────
 *   Big value
 *   ↑ delta% vs last week
 */
export const StatCard = ({
  label,
  value,
  delta,
  deltaLabel = 'vs last week',
  icon: Icon,
  className,
}) => {
  const hasDelta = typeof delta === 'number';
  const positive = hasDelta && delta >= 0;
  return (
    <Card className={cn('p-5', className)}>
      <div className="flex items-center gap-3">
        {Icon && (
          <span className="grid h-10 w-10 place-items-center rounded-full bg-foreground text-background">
            <Icon className="h-4 w-4" />
          </span>
        )}
        <span className="text-[13px] font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="mt-4 font-display text-[28px] font-semibold leading-none tracking-tight">
        {value}
      </div>
      {hasDelta && (
        <div className="mt-3 inline-flex items-center gap-1.5 text-[12px]">
          {positive ? (
            <ArrowUp className="h-3.5 w-3.5 text-success" />
          ) : (
            <ArrowDown className="h-3.5 w-3.5 text-destructive" />
          )}
          <span className={positive ? 'text-success font-medium' : 'text-destructive font-medium'}>
            {Math.abs(delta).toFixed(1)}%
          </span>
          <span className="text-muted-foreground">{deltaLabel}</span>
        </div>
      )}
    </Card>
  );
};
