import { Link } from 'react-router-dom';
import { Logo } from '@/components/shared/Logo';

const cols = [
  {
    title: 'Marketplace',
    links: [
      { to: '/marketplace', label: 'Browse all' },
      { to: '/marketplace?sort=salesCount&order=desc', label: 'Best sellers' },
      { to: '/marketplace?sort=createdAt&order=desc', label: 'New this week' },
      { to: '/marketplace?city=Mumbai', label: 'Near Mumbai' },
    ],
  },
  {
    title: 'Vendors',
    links: [
      { to: '/auth/signup?role=vendor', label: 'Sell on PartnerCart' },
      { to: '/about', label: 'How it works' },
      { to: '/contact', label: 'Vendor support' },
    ],
  },
  {
    title: 'Company',
    links: [
      { to: '/about', label: 'About' },
      { to: '/contact', label: 'Press' },
      { to: '/contact', label: 'Careers' },
    ],
  },
];

export const PublicFooter = () => (
  <footer className="mt-32 border-t border-border bg-background">
    <div className="container grid gap-12 py-16 md:grid-cols-12">
      <div className="space-y-4 md:col-span-5">
        <Logo />
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          PartnerCart is an independent marketplace for trusted neighborhood vendors —
          built in India, designed for the people who buy from them.
        </p>
        <div className="rule mt-6" />
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Mumbai · Bengaluru · Jaipur · Delhi · Pune
        </p>
      </div>
      {cols.map((c) => (
        <div key={c.title} className="md:col-span-2">
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {c.title}
          </div>
          <ul className="mt-4 space-y-2.5 text-sm">
            {c.links.map((l) => (
              <li key={l.label}>
                <Link to={l.to} className="text-foreground/80 transition hover:text-foreground">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div className="md:col-span-1" />
    </div>
    <div className="border-t border-border">
      <div className="container flex flex-col items-start justify-between gap-2 py-5 text-xs text-muted-foreground md:flex-row md:items-center">
        <span>© {new Date().getFullYear()} PartnerCart Technologies Pvt. Ltd.</span>
        <span className="font-mono">v1.0 · made for local commerce</span>
      </div>
    </div>
  </footer>
);
