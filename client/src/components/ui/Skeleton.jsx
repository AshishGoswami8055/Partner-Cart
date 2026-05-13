import { cn } from '@/lib/cn';

export const Skeleton = ({ className, ...props }) => (
  <div
    className={cn(
      'relative overflow-hidden rounded-md bg-muted/70',
      'before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:animate-shimmer',
      'dark:before:via-white/10',
      className
    )}
    {...props}
  />
);
