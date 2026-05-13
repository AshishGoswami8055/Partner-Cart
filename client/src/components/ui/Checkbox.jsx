import { forwardRef } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';

export const Checkbox = forwardRef(function Checkbox(
  { className, label, checked, onChange, ...props },
  ref
) {
  return (
    <label className={cn('inline-flex cursor-pointer items-center gap-2 select-none', className)}>
      <span className="relative inline-flex h-4 w-4 items-center justify-center">
        <input
          ref={ref}
          type="checkbox"
          className="peer h-4 w-4 cursor-pointer appearance-none rounded-[4px] border border-input bg-background transition-colors checked:border-foreground checked:bg-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          checked={checked}
          onChange={onChange}
          {...props}
        />
        <Check
          className="pointer-events-none absolute h-3 w-3 text-background opacity-0 peer-checked:opacity-100"
          strokeWidth={3}
        />
      </span>
      {label && <span className="text-sm text-foreground/90">{label}</span>}
    </label>
  );
});
