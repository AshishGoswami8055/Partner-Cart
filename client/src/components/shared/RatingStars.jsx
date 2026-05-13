import { Star } from 'lucide-react';
import { cn } from '@/lib/cn';

export const RatingStars = ({ value = 0, size = 14, showNumber = false, className }) => {
  const rounded = Math.round(value * 2) / 2;
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      <span className="inline-flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(
              i <= rounded
                ? 'fill-warning text-warning'
                : i - 0.5 === rounded
                ? 'text-warning'
                : 'text-muted-foreground/40'
            )}
            style={{ width: size, height: size }}
          />
        ))}
      </span>
      {showNumber && (
        <span className="text-xs font-medium text-muted-foreground">{value.toFixed(1)}</span>
      )}
    </span>
  );
};
