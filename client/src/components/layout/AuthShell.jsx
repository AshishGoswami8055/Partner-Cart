import { Logo } from '@/components/shared/Logo';
import { cn } from '@/lib/cn';

/**
 * Split-screen auth layout that matches the design system:
 * - Left half: black panel with logo, marketing copy and a flat line illustration
 * - Right half: white surface with the actual form
 *
 * On screens below `lg` only the right side is shown so the form takes the full
 * viewport.
 */
export const AuthShell = ({
  // left panel
  panelTitle,
  panelDescription,
  panelIllustration,
  /** Small mono uppercase line under the logo — e.g. role hint */
  panelKicker,
  // right form
  title,
  description,
  children,
  formFooter,
  /** Slot above the title on the form side (segmented tabs, hints) */
  formHeaderSlot,
}) => (
  <div className="grid min-h-screen lg:grid-cols-2">
    {/* LEFT PANEL — black, white type, illustration at the bottom */}
    <aside className="relative hidden bg-foreground text-background lg:flex lg:flex-col lg:justify-between">
      <div className="px-12 pt-12">
        <Logo size="lg" />
        {panelKicker && (
          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.24em] text-background/50">
            {panelKicker}
          </p>
        )}
      </div>
      <div className="px-12">
        <h2 className="display-serif text-[40px] font-medium leading-[1.05] tracking-tight text-balance xl:text-[44px]">
          {panelTitle}
        </h2>
        {panelDescription && (
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-background/70">
            {panelDescription}
          </p>
        )}
      </div>
      <div className="flex justify-center pb-12">
        {panelIllustration}
      </div>
    </aside>

    {/* RIGHT PANEL — white surface, the form is the focus */}
    <main className="flex flex-col bg-background">
      <header className="flex h-16 items-center justify-between px-6 lg:px-12">
        <div className="lg:hidden">
          <Logo size="sm" />
        </div>
        <span className="ml-auto font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          PartnerCart · v1.0
        </span>
      </header>

      <div className="flex flex-1 items-center justify-center px-6 py-10 lg:px-12">
        <div className="w-full max-w-[420px]">
          {formHeaderSlot}
          <h1 className={cn(formHeaderSlot && 'mt-6', 'display-serif text-[34px] font-medium leading-[1.1] tracking-tight md:text-[38px]')}>
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-[14.5px] text-muted-foreground">
              {description}
            </p>
          )}
          <div className="mt-8">{children}</div>
          {formFooter && (
            <p className="mt-8 text-center text-sm text-muted-foreground">{formFooter}</p>
          )}
        </div>
      </div>
    </main>
  </div>
);

// ----------------------------------------------------------------------------
// Reusable line illustrations for the left panel. Pure stroke, currentColor
// so they stay consistent with the rest of the panel typography.
// ----------------------------------------------------------------------------

export const StoreIllustration = ({ className }) => (
  <svg
    viewBox="0 0 320 200"
    className={cn('h-44 w-auto text-background/60', className)}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    {/* awning */}
    <path d="M70 70 L70 50 L210 50 L210 70 Z" />
    <path d="M82 50 L82 70 M104 50 L104 70 M126 50 L126 70 M148 50 L148 70 M170 50 L170 70 M192 50 L192 70" />
    {/* shop body */}
    <path d="M75 70 L75 170 L205 170 L205 70" />
    {/* door */}
    <path d="M120 170 L120 110 L160 110 L160 170" />
    <circle cx="152" cy="142" r="2" fill="currentColor" />
    {/* windows */}
    <rect x="86" y="84" width="24" height="18" />
    <rect x="170" y="84" width="24" height="18" />
    {/* shopping bag */}
    <path d="M232 116 L232 168 L274 168 L274 116" />
    <path d="M240 116 V108 A8 8 0 0 1 256 108 V116" />
    {/* location pin */}
    <path d="M254 70 A10 10 0 0 1 234 70 A10 10 0 0 1 254 70 Z M244 96 V80" />
    {/* plant */}
    <path d="M48 168 L48 140 M40 150 Q48 140 56 150" />
    <path d="M40 168 H56" />
    {/* ground line */}
    <path d="M30 170 H290" strokeDasharray="2 4" />
  </svg>
);

export const DashboardIllustration = ({ className }) => (
  <svg
    viewBox="0 0 320 200"
    className={cn('h-40 w-auto text-background/55', className)}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    {/* big card with donut + lines */}
    <rect x="40" y="40" width="170" height="140" rx="6" />
    <circle cx="85" cy="100" r="28" />
    <path d="M85 72 V100 H113" />
    <path d="M130 80 H192 M130 96 H192 M130 112 H172" />
    <path d="M50 152 H200" strokeDasharray="2 4" />
    {/* small card with avatar + lines, overlapping */}
    <rect x="170" y="100" width="120" height="80" rx="6" fill="hsl(var(--foreground))" />
    <rect x="170" y="100" width="120" height="80" rx="6" />
    <circle cx="190" cy="124" r="8" />
    <path d="M180 144 H280 M180 158 H260" />
  </svg>
);

export const ShieldIllustration = ({ className }) => (
  <svg
    viewBox="0 0 320 200"
    className={cn('h-40 w-auto text-background/55', className)}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M160 40 L120 56 V104 C120 134 138 156 160 168 C182 156 200 134 200 104 V56 Z" />
    <circle cx="160" cy="100" r="14" />
    <path d="M160 86 V100 L170 110" />
    <circle cx="190" cy="138" r="10" fill="hsl(var(--foreground))" />
    <circle cx="190" cy="138" r="10" />
    <path d="M186 138 L189 141 L195 134" />
    {/* dots */}
    <circle cx="100" cy="60" r="1.5" fill="currentColor" />
    <circle cx="220" cy="60" r="1.5" fill="currentColor" />
    <circle cx="240" cy="80" r="1.5" fill="currentColor" />
    <circle cx="80" cy="120" r="1.5" fill="currentColor" />
    <circle cx="240" cy="160" r="1.5" fill="currentColor" />
  </svg>
);

export const BagIllustration = ({ className }) => (
  <svg
    viewBox="0 0 320 200"
    className={cn('h-40 w-auto text-background/55', className)}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    {/* big bag */}
    <path d="M120 80 V160 A8 8 0 0 0 128 168 H188 A8 8 0 0 0 196 160 V80 Z" />
    <path d="M138 80 V70 A20 20 0 0 1 178 70 V80" />
    {/* small bag in front */}
    <rect x="170" y="120" width="60" height="50" rx="4" />
    <path d="M186 120 V112 A14 14 0 0 1 214 112 V120" />
    <circle cx="200" cy="150" r="4" />
    <path d="M198 150 L200 152 L203 148" />
    {/* sparkles around */}
    <path d="M86 70 L86 80 M82 75 L90 75" />
    <path d="M250 60 L250 70 M246 65 L254 65" />
    <circle cx="86" cy="140" r="6" />
    <circle cx="240" cy="160" r="3" fill="currentColor" />
  </svg>
);
