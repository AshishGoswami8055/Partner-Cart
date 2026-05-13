import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { adminApi } from '@/api/endpoints';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatCurrency } from '@/lib/format';

export const AdminProducts = () => {
  const [q, setQ] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'products', q],
    queryFn: () => adminApi.products({ q, limit: 50 }),
  });
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">{data?.meta?.total ?? 0} products across all vendors</p>
        </div>
        <Input
          placeholder="Search..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
          className="md:w-72"
        />
      </div>
      {isLoading ? (
        <Skeleton className="h-96" />
      ) : (
        <Card className="overflow-hidden">
          <div className="grid grid-cols-12 border-b border-border bg-muted/40 px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <div className="col-span-5">Product</div>
            <div className="col-span-3">Vendor</div>
            <div className="col-span-2">Price</div>
            <div className="col-span-2">Stock</div>
          </div>
          {(data?.data || []).map((p) => (
            <div key={p._id} className="grid grid-cols-12 items-center border-b border-border px-5 py-3 last:border-0 hover:bg-muted/40">
              <div className="col-span-5 flex items-center gap-3">
                <div className="h-10 w-10 overflow-hidden rounded-lg bg-muted">
                  {p.images?.[0]?.url && <img src={p.images[0].url} className="h-full w-full object-cover" alt="" />}
                </div>
                <div>
                  <div className="font-medium">{p.title}</div>
                  <div className="text-xs text-muted-foreground">{p.category?.name || '—'}</div>
                </div>
              </div>
              <div className="col-span-3 text-sm">{p.vendor?.storeName}</div>
              <div className="col-span-2 font-medium">{formatCurrency(p.price)}</div>
              <div className="col-span-2">
                <Badge tone={p.stock > 0 ? 'success' : 'destructive'}>{p.stock}</Badge>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
};

export default AdminProducts;
