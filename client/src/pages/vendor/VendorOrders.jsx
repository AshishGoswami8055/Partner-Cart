import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Package } from 'lucide-react';
import { orderApi } from '@/api/endpoints';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Input, Field } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatCurrency, formatRelative } from '@/lib/format';
import { ORDER_STATUS_FLOW, STATUS_LABEL, STATUS_TONE } from '@/lib/constants';
import { useDispatch } from 'react-redux';
import { pushToast } from '@/store/slices/toastSlice';

export const VendorOrders = () => {
  const qc = useQueryClient();
  const dispatch = useDispatch();
  const [statusFilter, setStatusFilter] = useState('');
  const [active, setActive] = useState(null);
  const [updateData, setUpdateData] = useState({ status: '', trackingNumber: '', note: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['vendor', 'orders', statusFilter],
    queryFn: () => orderApi.vendorList({ status: statusFilter, limit: 50 }),
  });

  const update = useMutation({
    mutationFn: ({ id, gid, body }) => orderApi.updateStatus(id, gid, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor', 'orders'] });
      dispatch(pushToast({ title: 'Order updated', tone: 'success' }));
      setActive(null);
    },
  });

  const submitUpdate = (e) => {
    e.preventDefault();
    if (!active || !updateData.status) return;
    update.mutate({
      id: active.orderId,
      gid: active.groupId,
      body: { status: updateData.status, trackingNumber: updateData.trackingNumber, note: updateData.note },
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Orders</h1>
          <p className="text-sm text-muted-foreground">{data?.meta?.total ?? 0} orders touching your store</p>
        </div>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="md:w-52">
          <option value="">All statuses</option>
          {ORDER_STATUS_FLOW.map((s) => (
            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
      ) : !data?.items?.length ? (
        <EmptyState icon={Package} title="No orders yet" description="When customers buy from your store, orders show up here." />
      ) : (
        <div className="space-y-3">
          {data.items.map((o) => {
            const group = o.orderGroups?.[0];
            return (
              <Card key={o._id} className="p-5">
                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">Order</div>
                    <div className="font-mono text-sm font-semibold">{o.orderNumber}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">Items</div>
                    <div className="text-sm">{group?.items?.length || 0}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">Payout</div>
                    <div className="text-sm font-semibold">{formatCurrency(group?.payout || 0)}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">Placed</div>
                    <div className="text-sm">{formatRelative(o.createdAt)}</div>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <Badge tone={STATUS_TONE[group?.status]} dot>{STATUS_LABEL[group?.status]}</Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setActive({ orderId: o._id, groupId: group._id, current: group });
                        setUpdateData({ status: group.status, trackingNumber: group.trackingNumber || '', note: '' });
                      }}
                    >
                      Update
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={!!active}
        onClose={() => setActive(null)}
        title="Update order status"
        footer={
          <>
            <Button variant="ghost" onClick={() => setActive(null)}>Cancel</Button>
            <Button onClick={submitUpdate} loading={update.isPending}>Save</Button>
          </>
        }
      >
        <form onSubmit={submitUpdate} className="space-y-3">
          <Field label="New status">
            <Select value={updateData.status} onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}>
              {ORDER_STATUS_FLOW.map((s) => (
                <option key={s} value={s}>{STATUS_LABEL[s]}</option>
              ))}
              <option value="cancelled">Cancelled</option>
            </Select>
          </Field>
          <Field label="Tracking number (optional)">
            <Input value={updateData.trackingNumber} onChange={(e) => setUpdateData({ ...updateData, trackingNumber: e.target.value })} />
          </Field>
          <Field label="Note (optional)">
            <Input value={updateData.note} onChange={(e) => setUpdateData({ ...updateData, note: e.target.value })} />
          </Field>
        </form>
      </Modal>
    </div>
  );
};

export default VendorOrders;
