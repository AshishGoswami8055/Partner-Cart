import { useState } from 'react';
import { Bell, Check } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { notificationApi } from '@/api/endpoints';
import { Button } from '@/components/ui/Button';
import { formatRelative } from '@/lib/format';
import { cn } from '@/lib/cn';

export const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.list({ limit: 10 }),
    refetchInterval: 60_000,
  });
  const items = data?.data || [];
  const unread = data?.meta?.unread || 0;

  const markAll = useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
  const markOne = useMutation({
    mutationFn: (id) => notificationApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="relative grid h-10 w-10 place-items-center rounded-lg hover:bg-muted text-foreground"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute right-2 top-2 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      {open && (
        <div
          onMouseDown={(e) => e.preventDefault()}
          className="absolute right-0 z-50 mt-2 w-96 overflow-hidden rounded-2xl border border-border bg-card shadow-elevated"
        >
          <div className="flex items-center justify-between border-b border-border p-3">
            <span className="font-display font-semibold">Notifications</span>
            <Button
              variant="link"
              size="sm"
              onClick={() => markAll.mutate()}
              leftIcon={<Check className="h-3.5 w-3.5" />}
            >
              Mark all read
            </Button>
          </div>
          <div className="max-h-96 overflow-y-auto scrollbar-thin">
            {items.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                You're all caught up.
              </div>
            ) : (
              items.map((n) => (
                <Link
                  key={n._id}
                  to={n.link || '#'}
                  onClick={() => !n.isRead && markOne.mutate(n._id)}
                  className={cn(
                    'block border-b border-border/60 p-3 transition hover:bg-muted/60',
                    !n.isRead && 'bg-primary/5'
                  )}
                >
                  <div className="flex items-start gap-2">
                    {!n.isRead && (
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    )}
                    <div className="flex-1">
                      <div className="text-sm font-medium">{n.title}</div>
                      {n.body && (
                        <div className="text-xs text-muted-foreground line-clamp-2">{n.body}</div>
                      )}
                      <div className="mt-1 text-[11px] text-muted-foreground">
                        {formatRelative(n.createdAt)}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
