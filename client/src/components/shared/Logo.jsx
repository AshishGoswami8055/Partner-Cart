import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';

/**
 * Vector PartnerCart wordmark + cart-with-P glyph. Uses currentColor for
 * everything so the same component works on light navbars and on the dark
 * left panel of the auth screens.
 */
const LogoMark = ({ className }) => (
  <svg
    viewBox="0 0 64 64"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    {/* cart handle */}
    <path d="M8 14 L16 14 L20 22" strokeWidth="3.5" />
    {/* cart basket — outline */}
    <path
      d="M16 22 L52 22 L46 42 L24 42 Z"
      strokeWidth="3.5"
    />
    {/* the P bowl integrated in the basket */}
    <path
      d="M30 22 L30 42 M30 22 L40 22 A6 6 0 0 1 40 34 L30 34"
      strokeWidth="3.5"
    />
    {/* wheels */}
    <circle cx="28" cy="50" r="3.5" strokeWidth="3" fill="currentColor" />
    <circle cx="44" cy="50" r="3.5" strokeWidth="3" fill="currentColor" />
  </svg>
);

export const Logo = ({ className, compact = false, size = 'md' }) => {
  const dims = {
    sm: { mark: 'h-7 w-7', text: 'text-[1rem]' },
    md: { mark: 'h-8 w-8', text: 'text-[1.15rem]' },
    lg: { mark: 'h-10 w-10', text: 'text-[1.4rem]' },
  }[size];

  return (
    <Link to="/" className={cn('inline-flex items-center gap-2 text-foreground', className)}>
      <LogoMark className={dims.mark} />
      {!compact && (
        <span
          className={cn(
            'font-serif tracking-tight leading-none',
            dims.text
          )}
        >
          Partner<span className="italic font-normal">Cart</span>
        </span>
      )}
    </Link>
  );
};
