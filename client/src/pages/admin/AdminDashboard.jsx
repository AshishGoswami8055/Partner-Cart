import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  IndianRupee,
  ShoppingBag,
  Store,
  Users,
  ChevronRight,
  Bell,
} from 'lucide-react';
import { adminApi } from '@/api/endpoints';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Select } from '@/components/ui/Select';
import { StatCard } from '@/components/shared/StatCard';
import { RevenueChart } from '@/components/charts/RevenueChart';
import { OrdersBarChart } from '@/components/charts/OrdersBarChart';
import { formatCurrency } from '@/lib/format';
import { useAuth } from '@/hooks/useAuth';

const SectionCard = ({ title, action, children, className }) => (
  <Card className={`p-5 ${className || ''}`}>
    <div className="flex items-start justify-between">
      <h2 className="text-base font-semibold">{title}</h2>
      {action}
    </div>
    <div className="mt-4">{children}</div>
  </Card>
);

export const AdminDashboard = () => {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminApi.stats(),
  });

  if (isLoading) return <Skeleton className="h-96 w-full rounded-xl" />;
  const c = data?.counts || {};

  return (
    <div className="space-y-6">
      {/* page heading + range selector */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="display-serif text-3xl font-medium tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back, {user?.name?.split(' ')[0] || 'Admin'}. Here&apos;s what&apos;s
            happening on PartnerCart.
          </p>
        </div>
        <Select defaultValue="week" className="md:w-44">
          <option value="week">This week</option>
          <option value="month">This month</option>
          <option value="quarter">This quarter</option>
        </Select>
      </div>

      {/* KPI strip */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Revenue" value={formatCurrency(c.revenue || 0)} icon={IndianRupee} delta={18.6} />
        <StatCard label="Total Orders" value={c.orders || 0} icon={ShoppingBag} delta={12.4} />
        <StatCard label="Total Vendors" value={c.vendors || 0} icon={Store} delta={8.7} />
        <StatCard label="Total Customers" value={c.users || 0} icon={Users} delta={15.3} />
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Revenue Overview"
          action={
            <Select defaultValue="week" className="h-8 w-32 text-xs">
              <option value="week">This week</option>
              <option value="month">This month</option>
            </Select>
          }
        >
          <RevenueChart
            data={data?.dailyRevenue || []}
            dataKey="revenue"
            color="hsl(var(--foreground))"
          />
        </SectionCard>
        <SectionCard
          title="Orders Overview"
          action={
            <Select defaultValue="week" className="h-8 w-32 text-xs">
              <option value="week">This week</option>
              <option value="month">This month</option>
            </Select>
          }
        >
          <OrdersBarChart
            data={data?.dailyRevenue || []}
            dataKey="orders"
            color="hsl(var(--foreground))"
          />
        </SectionCard>
      </div>

      {/* Bottom 3-column row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Approval queue">
          <div className="rounded-md bg-muted/60 p-4">
            <div className="flex items-start gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-foreground text-background">
                <Bell className="h-4 w-4" />
              </span>
              <div>
                <div className="font-display text-3xl font-semibold leading-none">
                  {c.pendingApplications || 0}
                </div>
                <div className="mt-1 text-[12px] text-muted-foreground">
                  vendor applications waiting for review
                </div>
              </div>
            </div>
          </div>
          <Link
            to="/admin/vendors"
            className="mt-4 inline-flex w-full items-center justify-center gap-1 rounded-md border border-border py-2 text-sm font-medium hover:bg-muted"
          >
            Review queue <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </SectionCard>

        <SectionCard
          title="Platform health"
          action={
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success" /> Healthy
            </span>
          }
        >
          <ul className="divide-y divide-border text-sm">
            <li className="flex items-center justify-between py-2.5">
              <span className="text-muted-foreground">API uptime</span>
              <span className="font-medium">99.98%</span>
            </li>
            <li className="flex items-center justify-between py-2.5">
              <span className="text-muted-foreground">Avg response</span>
              <span className="font-medium">118 ms</span>
            </li>
            <li className="flex items-center justify-between py-2.5">
              <span className="text-muted-foreground">Refund ratio</span>
              <span className="font-medium">0.42%</span>
            </li>
          </ul>
        </SectionCard>

        <SectionCard title="Vendor growth">
          <OrdersBarChart
            data={data?.vendorGrowth || []}
            dataKey="count"
            color="hsl(var(--foreground))"
            height={180}
          />
        </SectionCard>
      </div>
    </div>
  );
};

export default AdminDashboard;
