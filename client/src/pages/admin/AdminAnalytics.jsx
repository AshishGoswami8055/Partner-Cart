import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/api/endpoints';
import { Card } from '@/components/ui/Card';
import { RevenueChart } from '@/components/charts/RevenueChart';
import { OrdersBarChart } from '@/components/charts/OrdersBarChart';
import { Skeleton } from '@/components/ui/Skeleton';

export const AdminAnalytics = () => {
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'stats'], queryFn: () => adminApi.stats() });
  if (isLoading) return <Skeleton className="h-96" />;
  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-bold">Analytics</h1>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-display font-semibold">Daily revenue</h2>
          <div className="mt-3"><RevenueChart data={data?.dailyRevenue || []} /></div>
        </Card>
        <Card className="p-5">
          <h2 className="font-display font-semibold">Order volume</h2>
          <div className="mt-3"><OrdersBarChart data={data?.dailyRevenue || []} dataKey="orders" /></div>
        </Card>
        <Card className="p-5 lg:col-span-2">
          <h2 className="font-display font-semibold">Vendor growth</h2>
          <div className="mt-3"><OrdersBarChart data={data?.vendorGrowth || []} dataKey="count" color="hsl(var(--success))" /></div>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
