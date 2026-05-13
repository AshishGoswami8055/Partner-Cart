import { cn } from '@/lib/cn';

export const Separator = ({ className, orientation = 'horizontal' }) => (
  <div
    role="separator"
    aria-orientation={orientation}
    className={cn(
      'bg-border',
      orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
      className
    )}
  />
);
