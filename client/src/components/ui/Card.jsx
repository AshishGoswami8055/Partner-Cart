import { cn } from '@/lib/cn';

export const Card = ({ className, children, hover = false, ...props }) => (
  <div
    className={cn(
      'rounded-2xl border border-border bg-card text-card-foreground shadow-card transition-all',
      hover && 'hover:shadow-elevated hover:-translate-y-0.5',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader = ({ className, ...props }) => (
  <div className={cn('flex flex-col space-y-1.5 px-5 pt-5 pb-2', className)} {...props} />
);

export const CardTitle = ({ className, ...props }) => (
  <h3 className={cn('text-lg font-semibold tracking-tight font-display', className)} {...props} />
);

export const CardDescription = ({ className, ...props }) => (
  <p className={cn('text-sm text-muted-foreground', className)} {...props} />
);

export const CardContent = ({ className, ...props }) => (
  <div className={cn('px-5 pb-5 pt-2', className)} {...props} />
);

export const CardFooter = ({ className, ...props }) => (
  <div className={cn('flex items-center px-5 pb-5 pt-2 border-t border-border/60', className)} {...props} />
);
