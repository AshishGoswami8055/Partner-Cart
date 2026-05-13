import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorApi } from '@/api/endpoints';
import { Card } from '@/components/ui/Card';
import { Input, Textarea, Field } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useDispatch } from 'react-redux';
import { pushToast } from '@/store/slices/toastSlice';

export const VendorStore = () => {
  const qc = useQueryClient();
  const dispatch = useDispatch();
  const { data } = useQuery({ queryKey: ['vendor', 'store'], queryFn: () => vendorApi.myStore() });
  const [form, setForm] = useState({});

  useEffect(() => {
    if (data) {
      setForm({
        storeName: data.storeName || '',
        tagline: data.tagline || '',
        description: data.description || '',
        contactEmail: data.contactEmail || '',
        contactPhone: data.contactPhone || '',
        website: data.website || '',
        address: data.address || {},
      });
    }
  }, [data]);

  const update = useMutation({
    mutationFn: (body) => vendorApi.updateMyStore(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor', 'store'] });
      dispatch(pushToast({ title: 'Store updated', tone: 'success' }));
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Store settings</h1>
        {data?.status && <Badge tone="success">{data.status}</Badge>}
      </div>

      <Card className="p-6">
        <h2 className="font-display text-lg font-semibold">Branding</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            update.mutate(form);
          }}
          className="mt-4 grid gap-4 md:grid-cols-2"
        >
          <Field label="Store name">
            <Input value={form.storeName || ''} onChange={(e) => setForm({ ...form, storeName: e.target.value })} />
          </Field>
          <Field label="Tagline">
            <Input value={form.tagline || ''} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
          </Field>
          <Field label="Description" className="md:col-span-2">
            <Textarea
              rows={4}
              value={form.description || ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Field>
          <Field label="Contact email">
            <Input value={form.contactEmail || ''} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
          </Field>
          <Field label="Contact phone">
            <Input value={form.contactPhone || ''} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
          </Field>
          <Field label="Website">
            <Input value={form.website || ''} onChange={(e) => setForm({ ...form, website: e.target.value })} />
          </Field>
          <Field label="City">
            <Input
              value={form.address?.city || ''}
              onChange={(e) => setForm({ ...form, address: { ...form.address, city: e.target.value } })}
            />
          </Field>
          <Field label="State">
            <Input
              value={form.address?.state || ''}
              onChange={(e) => setForm({ ...form, address: { ...form.address, state: e.target.value } })}
            />
          </Field>
          <div className="md:col-span-2">
            <Button type="submit" loading={update.isPending}>Save changes</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default VendorStore;
