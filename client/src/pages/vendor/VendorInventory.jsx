import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { AlertTriangle, Plus, Minus } from 'lucide-react';
import { productApi } from '@/api/endpoints';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useDispatch } from 'react-redux';
import { pushToast } from '@/store/slices/toastSlice';

export const VendorInventory = () => {
  const qc = useQueryClient();
  const dispatch = useDispatch();
  const { data } = useQuery({
    queryKey: ['vendor', 'products', 'inventory'],
    queryFn: () => productApi.myList({ limit: 100 }),
  });
  const [drafts, setDrafts] = useState({});

  const update = useMutation({
    mutationFn: ({ id, body }) => productApi.inventory(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor', 'products', 'inventory'] });
      dispatch(pushToast({ title: 'Inventory updated', tone: 'success' }));
    },
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold">Inventory</h1>
        <p className="text-sm text-muted-foreground">Update stock levels in seconds.</p>
      </div>

      <Card className="overflow-hidden">
        <div className="grid grid-cols-12 border-b border-border bg-muted/40 px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <div className="col-span-5">Product</div>
          <div className="col-span-2">Current</div>
          <div className="col-span-3">Adjust</div>
          <div className="col-span-2 text-right">Status</div>
        </div>
        {(data?.data || []).map((p) => {
          const draft = drafts[p._id] ?? p.stock;
          const isLow = p.stock <= p.lowStockThreshold;
          return (
            <div key={p._id} className="grid grid-cols-12 items-center border-b border-border px-5 py-3 last:border-0">
              <div className="col-span-5 font-medium">{p.title}</div>
              <div className="col-span-2 text-sm">{p.stock}</div>
              <div className="col-span-3 flex items-center gap-2">
                <Button size="icon" variant="outline" onClick={() => setDrafts({ ...drafts, [p._id]: Math.max(0, draft - 1) })}>
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  min="0"
                  value={draft}
                  onChange={(e) => setDrafts({ ...drafts, [p._id]: Number(e.target.value) })}
                  className="w-20"
                />
                <Button size="icon" variant="outline" onClick={() => setDrafts({ ...drafts, [p._id]: draft + 1 })}>
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => update.mutate({ id: p._id, body: { stock: drafts[p._id] ?? p.stock } })}
                >
                  Save
                </Button>
              </div>
              <div className="col-span-2 text-right">
                {isLow ? (
                  <Badge tone="warning">
                    <AlertTriangle className="h-3 w-3" /> Low
                  </Badge>
                ) : (
                  <Badge tone="success">Healthy</Badge>
                )}
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
};

export default VendorInventory;
