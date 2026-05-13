import { forwardRef } from 'react';
import { cn } from '@/lib/cn';

const variants = {
  primary:
    'bg-foreground text-background hover:bg-foreground/90',
  secondary:
    'bg-secondary text-secondary-foreground hover:bg-secondary/90',
  outline:
    'border border-border bg-transparent hover:bg-muted text-foreground',
  ghost: 'bg-transparent hover:bg-muted text-foreground',
  destructive:
    'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  subtle: 'bg-muted text-foreground hover:bg-muted/70',
  accent:
    'bg-accent text-accent-foreground hover:bg-accent/90',
  link: 'bg-transparent underline-offset-4 hover:underline text-foreground p-0 h-auto',
};

const sizes = {
  sm: 'h-9 px-3.5 text-[13px] rounded-md gap-1.5',
  md: 'h-10 px-4 text-sm rounded-md gap-2',
  lg: 'h-12 px-6 text-[15px] rounded-md gap-2',
  icon: 'h-10 w-10 rounded-md',
};

export const Button = forwardRef(function Button(
  {
    children,
    className,
    variant = 'primary',
    size = 'md',
    leftIcon,
    rightIcon,
    loading = false,
    disabled,
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60 disabled:pointer-events-none select-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <span
          className="h-4 w-4 rounded-full border-2 border-current border-r-transparent animate-spin"
          aria-hidden
        />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  );
});
