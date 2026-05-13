import { cn } from '@/lib/cn';

export const Switch = ({ checked, onChange, disabled, className, label }) => (
  <label className={cn('inline-flex cursor-pointer items-center gap-2', disabled && 'opacity-60', className)}>
    <span
      role="switch"
      aria-checked={checked}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          if (!disabled) onChange?.(!checked);
        }
      }}
      onClick={() => !disabled && onChange?.(!checked)}
      className={cn(
        'relative h-5 w-9 rounded-full transition-colors',
        checked ? 'bg-primary' : 'bg-muted'
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-4' : 'translate-x-0.5'
        )}
      />
    </span>
    {label && <span className="text-sm text-foreground">{label}</span>}
  </label>
);
