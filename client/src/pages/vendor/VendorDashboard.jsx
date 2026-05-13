import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Wallet, ShoppingBag, AlertTriangle, Star, ClipboardList, ArrowRight } from 'lucide-react';
import { vendorApi } from '@/api/endpoints';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/shared/StatCard';
import { RevenueChart } from '@/components/charts/RevenueChart';
import { OrdersBarChart } from '@/components/charts/OrdersBarChart';
import { formatCurrency } from '@/lib/format';
import { Skeleton } from '@/components/ui/Skeleton';

const OnboardingReminder = ({ productCount }) => {
  if (productCount !== 0) return null;
  return (
    <Card className="border-primary/35 bg-gradient-to-br from-primary/10 via-background to-background p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
            <ClipboardList className="h-6 w-6" />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold">Ready to appear on Marketplace?</h2>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              After admin verifies your shop, shoppers only see listings from active vendors like you.
              Add your catalogue here—everything published shows on the public storefront and checkout.
            </p>
            <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[13px] text-muted-foreground">
              <li>Apply once from your profile (if upgrading from customer).</li>
              <li>
                Tip: polish <Link to="/vendor/store" className="font-medium text-primary hover:underline">Store settings</Link>{' '}
                first—it&apos;s linked from your storefront.
              </li>
            </ul>
          </div>
        </div>
        <Link to="/vendor/products">
          <Button rightIcon={<ArrowRight className="h-4 w-4" />}>Add products</Button>
        </Link>
      </div>
    </Card>
  );
};

export const VendorDashboard = () => {
  const { data: store } = useQuery({
    queryKey: ['vendor', 'store'],
    queryFn: () => vendorApi.myStore(),
  });
  const { data, isLoading } = useQuery({
    queryKey: ['vendor', 'analytics'],
    queryFn: () => vendorApi.myAnalytics(),
  });

  if (isLoading) return <Skeleton className="h-96" />;
  const counts = data?.counts || {};
  const daily = data?.daily || [];
  const top = data?.topProducts || [];
  const lowStock = data?.lowStock || [];
  const listed = store?.stats?.totalProducts ?? 0;

  return (
    <div className="space-y-6">
      <OnboardingReminder productCount={listed} />
      <div>
        <h1 className="font-display text-2xl font-bold">Store overview</h1>
        <p className="text-sm text-muted-foreground">
          Live performance and inventory. Listed products ({listed}) sync to Marketplace for customers shopping on the site.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Net revenue" value={formatCurrency(counts.revenue)} icon={Wallet} tone="success" delta={8.2} />
        <StatCard label="Orders" value={counts.orders || 0} icon={ShoppingBag} tone="primary" delta={4.1} />
        <StatCard label="Low stock items" value={lowStock.length} icon={AlertTriangle} tone="warning" />
        <StatCard label="Avg rating" value={'4.6'} icon={Star} tone="info" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-semibold">Net revenue</h2>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </div>
            <Badge tone="success" dot>
              Live
            </Badge>
          </div>
          <div className="mt-3"><RevenueChart data={daily} dataKey="revenue" /></div>
        </Card>
        <Card className="p-5">
          <h2 className="font-display font-semibold">Order volume</h2>
          <p className="text-xs text-muted-foreground">Last 30 days</p>
          <div className="mt-3"><OrdersBarChart data={daily} dataKey="orders" /></div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-display font-semibold">Top selling products</h2>
          <div className="mt-3 divide-y divide-border">
            {top.length === 0 && (
              <div className="py-6 text-sm text-muted-foreground text-center">Not enough data yet.</div>
            )}
            {top.map((t) => (
              <div key={t._id} className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium">{t.title}</div>
                  <div className="text-xs text-muted-foreground">{t.sold} sold</div>
                </div>
                <div className="font-semibold">{formatCurrency(t.revenue)}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-display font-semibold">Low stock alerts</h2>
          <div className="mt-3 divide-y divide-border">
            {lowStock.length === 0 && (
              <div className="py-6 text-sm text-muted-foreground text-center">All products well stocked.</div>
            )}
            {lowStock.map((p) => (
              <div key={p._id} className="flex items-center justify-between py-3">
                <div className="font-medium">{p.title}</div>
                <Badge tone="warning">{p.stock} left</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VendorDashboard;
