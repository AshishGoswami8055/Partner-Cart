import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, Heart, Clock, Wallet, ArrowRight } from 'lucide-react';
import { analyticsApi, orderApi } from '@/api/endpoints';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/shared/StatCard';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatRelative } from '@/lib/format';
import { STATUS_LABEL, STATUS_TONE } from '@/lib/constants';

export const CustomerHome = () => {
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ['analytics', 'customer'],
    queryFn: () => analyticsApi.customer(),
  });
  const { data: orders } = useQuery({
    queryKey: ['orders', 'me', { limit: 5 }],
    queryFn: () => orderApi.myList({ limit: 5 }),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-sm text-muted-foreground">Here's a snapshot of your activity.</p>
        </div>
        <Link to="/marketplace">
          <Button rightIcon={<ArrowRight className="h-4 w-4" />}>Continue shopping</Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Orders" value={stats?.counts?.orders || 0} icon={ShoppingBag} tone="primary" />
        <StatCard label="Lifetime spend" value={formatCurrency(stats?.counts?.spend || 0)} icon={Wallet} tone="success" />
        <StatCard label="Wishlist" value="—" icon={Heart} tone="info" />
        <StatCard label="Active orders" value={(orders?.data || []).filter((o) => o.orderGroups?.some((g) => !['delivered', 'cancelled', 'refunded'].includes(g.status))).length} icon={Clock} tone="warning" />
      </div>

      <Card>
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-display font-semibold">Recent orders</h2>
          <Link to="/app/orders" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="divide-y divide-border">
          {(orders?.data || []).length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No orders yet. <Link to="/marketplace" className="text-primary">Start shopping →</Link>
            </div>
          ) : (
            (orders?.data || []).map((o) => {
              const summaryStatus = o.orderGroups?.[0]?.status || 'pending';
              return (
                <Link
                  key={o._id}
                  to={`/app/orders/${o._id}`}
                  className="grid grid-cols-2 items-center gap-3 p-4 hover:bg-muted/50 md:grid-cols-5"
                >
                  <div>
                    <div className="text-sm font-medium">{o.orderNumber}</div>
                    <div className="text-xs text-muted-foreground">{formatRelative(o.createdAt)}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {o.orderGroups?.length} {o.orderGroups?.length > 1 ? 'vendors' : 'vendor'}
                  </div>
                  <div className="text-sm">{formatCurrency(o.total)}</div>
                  <div>
                    <Badge tone={STATUS_TONE[summaryStatus]} dot>
                      {STATUS_LABEL[summaryStatus]}
                    </Badge>
                  </div>
                  <div className="hidden text-right text-sm text-primary md:block">View →</div>
                </Link>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
};

export default CustomerHome;
