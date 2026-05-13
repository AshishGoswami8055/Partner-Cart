import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Ticket } from 'lucide-react';
import { couponApi } from '@/api/endpoints';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Field } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuth } from '@/hooks/useAuth';
import { useDispatch } from 'react-redux';
import { pushToast } from '@/store/slices/toastSlice';

export const VendorCoupons = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ code: '', type: 'percent', value: 10, minOrder: 0, perUserLimit: 1 });

  const { data } = useQuery({
    queryKey: ['vendor', 'coupons'],
    queryFn: () => couponApi.list({ vendor: user?.vendor?._id || user?.vendor }),
  });

  const create = useMutation({
    mutationFn: (body) => couponApi.create({ ...body, scope: 'vendor', vendor: user?.vendor?._id || user?.vendor }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor', 'coupons'] });
      dispatch(pushToast({ title: 'Coupon created', tone: 'success' }));
      setOpen(false);
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Coupons</h1>
          <p className="text-sm text-muted-foreground">Drive demand with promo codes.</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setOpen(true)}>
          New coupon
        </Button>
      </div>

      {!data?.data?.length ? (
        <EmptyState
          icon={Ticket}
          title="No coupons yet"
          description="Create your first promo to delight loyal customers."
          action={<Button onClick={() => setOpen(true)}>Create coupon</Button>}
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {data.data.map((c) => (
            <Card key={c._id} className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono text-lg font-bold">{c.code}</div>
                  <div className="text-xs text-muted-foreground">
                    {c.type === 'percent' ? `${c.value}% off` : c.type === 'fixed' ? `₹${c.value} off` : 'Free shipping'}
                  </div>
                </div>
                <Badge tone={c.isActive ? 'success' : 'muted'}>{c.isActive ? 'Active' : 'Disabled'}</Badge>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">Min order: ₹{c.minOrder}</div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New coupon"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => create.mutate(form)} loading={create.isPending}>Create</Button>
          </>
        }
      >
        <div className="space-y-3">
          <Field label="Code">
            <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type">
              <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="percent">Percent off</option>
                <option value="fixed">Fixed off</option>
                <option value="free_shipping">Free shipping</option>
              </Select>
            </Field>
            <Field label="Value">
              <Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} />
            </Field>
          </div>
          <Field label="Minimum order (₹)">
            <Input type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: Number(e.target.value) })} />
          </Field>
        </div>
      </Modal>
    </div>
  );
};

export default VendorCoupons;
