import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Package } from 'lucide-react';
import { orderApi } from '@/api/endpoints';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/format';
import { STATUS_LABEL, STATUS_TONE } from '@/lib/constants';

export const OrdersPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['orders', 'me'],
    queryFn: () => orderApi.myList({ limit: 50 }),
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!data?.data?.length) {
    return (
      <EmptyState
        icon={Package}
        title="No orders yet"
        description="When you place an order, it'll show up here with a live timeline."
        action={
          <Link to="/marketplace">
            <Button>Discover products</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold">Your orders</h1>
      <div className="space-y-3">
        {data.data.map((o) => (
          <Card key={o._id} hover className="p-5">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Order</div>
                <div className="font-mono text-sm font-semibold">{o.orderNumber}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Placed</div>
                <div className="text-sm">{formatDate(o.createdAt)}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Vendors</div>
                <div className="text-sm">{o.orderGroups?.length || 0}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Total</div>
                <div className="text-sm font-semibold">{formatCurrency(o.total)}</div>
              </div>
              <div className="ml-auto flex items-center gap-2">
                {o.orderGroups?.map((g) => (
                  <Badge key={g._id} tone={STATUS_TONE[g.status]} dot>
                    {STATUS_LABEL[g.status]}
                  </Badge>
                ))}
                <Link to={`/app/orders/${o._id}`}>
                  <Button size="sm" variant="outline">Details</Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;
