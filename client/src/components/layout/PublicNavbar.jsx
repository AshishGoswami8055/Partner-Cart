import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/shared/Logo';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { cn } from '@/lib/cn';

const links = [
  { to: '/marketplace', label: 'Marketplace' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export const PublicNavbar = () => {
  const { mode, toggle } = useTheme();
  const { isAuthenticated, user } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    navigate(`/marketplace?q=${encodeURIComponent(q)}`);
  };

  const dashboardLink =
    user?.role === 'admin' ? '/admin' : user?.role === 'vendor' ? '/vendor' : '/app';

  return (
    <header
      className={cn(
        'sticky top-0 z-40 transition-colors duration-200',
        scrolled
          ? 'border-b border-border bg-background/85 backdrop-blur'
          : 'border-b border-transparent bg-background'
      )}
    >
      <div className="container flex h-16 items-center gap-6">
        <Logo />
        <nav className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cn(
                  'text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
                  isActive && 'text-foreground'
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <form onSubmit={onSearch} className="ml-auto hidden flex-1 max-w-sm md:block">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search vendors, products, cities…"
              className="h-9 w-full rounded-md border border-input bg-card pl-9 pr-3 text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>
        </form>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {mode === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Link
            to={isAuthenticated ? '/app/cart' : '/auth/login'}
            className="relative grid h-10 w-10 place-items-center rounded-md hover:bg-muted"
            aria-label="Cart"
          >
            <ShoppingBag className="h-4 w-4" />
            {itemCount > 0 && (
              <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-foreground px-1 font-mono text-[10px] font-semibold text-background">
                {itemCount}
              </span>
            )}
          </Link>
          {isAuthenticated ? (
            <Link to={dashboardLink} className="ml-1">
              <Button size="sm" variant="primary">Workspace</Button>
            </Link>
          ) : (
            <div className="ml-1 flex items-center gap-1">
              <Link to="/auth/login">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link to="/auth/signup">
                <Button variant="primary" size="sm">Get started</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
