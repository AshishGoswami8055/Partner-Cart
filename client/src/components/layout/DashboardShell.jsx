import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Menu, Sun, Moon, Search, LogOut, X, ChevronDown } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { NotificationBell } from '@/components/shared/NotificationBell';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/cn';

export const DashboardShell = ({ navItems = [], brandLabel = 'Workspace' }) => {
  const { user, logout } = useAuth();
  const { mode, toggle } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* SIDEBAR — black surface with white type/icons */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-foreground text-background transition-transform lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-20 items-center justify-between px-6">
          <Logo size="md" />
          <button
            className="grid h-9 w-9 place-items-center rounded-md hover:bg-background/10 lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4 scrollbar-thin">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2.5 text-[14px] font-medium transition-colors',
                  isActive
                    ? 'bg-background text-foreground'
                    : 'text-background/75 hover:bg-background/10 hover:text-background'
                )
              }
            >
              {item.icon && <item.icon className="h-4 w-4" />}
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="rounded-full bg-background/15 px-2 py-0.5 text-[11px] font-semibold">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* user card + sign out */}
        <div className="border-t border-background/10 p-3">
          <div className="flex items-center gap-3 rounded-md bg-background/5 p-2.5">
            <Avatar name={user?.name} src={user?.avatar?.url} size="sm" />
            <div className="flex-1 overflow-hidden">
              <div className="truncate text-[13px] font-medium">{user?.name}</div>
              <div className="truncate text-[11px] text-background/60">{brandLabel}</div>
            </div>
            <ChevronDown className="h-4 w-4 text-background/60" />
          </div>
          <button
            onClick={logout}
            className="mt-2 flex w-full items-center gap-3 rounded-md px-3 py-2 text-[13px] text-background/75 hover:bg-background/10 hover:text-background"
          >
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-foreground/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* MAIN COLUMN */}
      <div className="flex-1">
        <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-6 lg:px-10">
            <button
              className="grid h-9 w-9 place-items-center rounded-md border border-border lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </button>

            <div className="hidden flex-1 max-w-md md:block">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  placeholder="Search…"
                  className="h-9 w-full rounded-md border border-input bg-card pl-9 pr-3 text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>
            </div>

            <div className="ml-auto flex items-center gap-1.5">
              <Button variant="ghost" size="icon" onClick={toggle} aria-label="Theme">
                {mode === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <NotificationBell />
              <div className="ml-2 hidden items-center gap-2 lg:flex">
                <Avatar name={user?.name} src={user?.avatar?.url} size="sm" />
                <div className="text-sm">
                  <div className="font-medium leading-tight">{user?.name}</div>
                  <div className="text-[11px] capitalize text-muted-foreground leading-tight">
                    {user?.role}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="px-6 py-8 lg:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
