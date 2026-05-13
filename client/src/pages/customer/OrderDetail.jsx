import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Store, MapPin } from 'lucide-react';
import { orderApi } from '@/api/endpoints';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { OrderTimeline } from '@/components/shared/OrderTimeline';
import { formatCurrency, formatDate } from '@/lib/format';
import { Skeleton } from '@/components/ui/Skeleton';

export const OrderDetailPage = () => {
  const { id } = useParams();
  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderApi.detail(id),
  });

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (!order) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-5">
        <div className="flex flex-wrap items-baseline gap-3">
          <h1 className="font-display text-2xl font-bold">Order {order.orderNumber}</h1>
          <span className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</span>
        </div>

        {order.orderGroups.map((g) => (
          <Card key={g._id} className="overflow-hidden">
            <div className="flex items-center gap-3 border-b border-border bg-muted/30 px-5 py-3">
              <Store className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{g.vendor?.storeName || 'Vendor'}</span>
              <Badge tone="info" className="ml-auto">{g.status}</Badge>
            </div>
            <div className="grid gap-6 p-5 md:grid-cols-[1fr_260px]">
              <div className="space-y-3">
                {g.items.map((it) => (
                  <div key={it._id} className="flex gap-3">
                    {it.image && (
                      <img src={it.image} alt="" className="h-16 w-16 rounded-lg object-cover" />
                    )}
                    <div className="flex-1">
                      <div className="font-medium">{it.title}</div>
                      <div className="text-xs text-muted-foreground">
                        Qty {it.quantity} · {formatCurrency(it.price)}
                      </div>
                    </div>
                    <div className="font-medium">{formatCurrency(it.subtotal)}</div>
                  </div>
                ))}
                {g.trackingNumber && (
                  <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
                    Tracking: <span className="font-mono">{g.trackingNumber}</span>
                  </div>
                )}
              </div>
              <div className="rounded-xl border border-border p-4">
                <OrderTimeline status={g.status} history={g.statusHistory || []} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <Card className="p-5">
          <h2 className="font-display text-base font-semibold">Summary</h2>
          <div className="mt-3 space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{formatCurrency(order.shippingFee)}</span></div>
            {order.discount > 0 && (
              <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span>-{formatCurrency(order.discount)}</span></div>
            )}
            <div className="flex justify-between font-display text-base font-semibold pt-2 border-t border-border">
              <span>Total</span><span>{formatCurrency(order.total)}</span>
            </div>
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            Payment · {order.payment?.method?.toUpperCase()} · {order.payment?.status}
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="flex items-center gap-2 font-display text-base font-semibold">
            <MapPin className="h-4 w-4" /> Shipping address
          </h2>
          <div className="mt-2 text-sm text-muted-foreground">
            <div className="font-medium text-foreground">{order.shippingAddress?.fullName}</div>
            <div>{order.shippingAddress?.phone}</div>
            <div>
              {order.shippingAddress?.line1}, {order.shippingAddress?.line2}
            </div>
            <div>
              {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OrderDetailPage;
