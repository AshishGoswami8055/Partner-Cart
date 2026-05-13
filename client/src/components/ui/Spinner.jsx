import { cn } from '@/lib/cn';

export const Spinner = ({ className, size = 'md' }) => {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' };
  return (
    <span
      className={cn(
        'inline-block rounded-full border-2 border-current border-r-transparent animate-spin text-primary',
        sizes[size],
        className
      )}
      aria-hidden
    />
  );
};
