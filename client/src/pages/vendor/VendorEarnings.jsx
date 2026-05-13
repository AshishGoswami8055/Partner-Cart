import { useQuery } from '@tanstack/react-query';
import { Wallet, TrendingUp, Receipt } from 'lucide-react';
import { vendorApi } from '@/api/endpoints';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/shared/StatCard';
import { RevenueChart } from '@/components/charts/RevenueChart';
import { formatCurrency } from '@/lib/format';

export const VendorEarnings = () => {
  const { data } = useQuery({
    queryKey: ['vendor', 'analytics'],
    queryFn: () => vendorApi.myAnalytics(),
  });

  const counts = data?.counts || {};
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold">Earnings</h1>
        <p className="text-sm text-muted-foreground">Net of platform commission.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total payout" value={formatCurrency(counts.revenue)} icon={Wallet} tone="success" />
        <StatCard label="Total orders" value={counts.orders || 0} icon={Receipt} tone="primary" />
        <StatCard label="Avg order" value={formatCurrency(counts.orders ? counts.revenue / counts.orders : 0)} icon={TrendingUp} tone="info" />
      </div>
      <Card className="p-5">
        <h2 className="font-display font-semibold">Net revenue · last 30 days</h2>
        <div className="mt-4">
          <RevenueChart data={data?.daily || []} />
        </div>
      </Card>
    </div>
  );
};

export default VendorEarnings;
