import { cn } from '@/lib/cn';

const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase();

const sizes = { sm: 'h-7 w-7 text-xs', md: 'h-9 w-9 text-sm', lg: 'h-12 w-12 text-base' };

export const Avatar = ({ src, name, size = 'md', className }) => (
  <span
    className={cn(
      'inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary/20 to-accent/20 text-foreground font-medium ring-2 ring-background',
      sizes[size],
      className
    )}
  >
    {src ? <img src={src} alt={name || 'avatar'} className="h-full w-full object-cover" /> : initials(name) || '?'}
  </span>
);
