import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Package, Search } from 'lucide-react';
import { productApi, categoryApi } from '@/api/endpoints';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Field } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useDispatch } from 'react-redux';
import { pushToast } from '@/store/slices/toastSlice';
import { formatCurrency } from '@/lib/format';

const empty = {
  title: '',
  description: '',
  price: '',
  stock: 0,
  category: '',
  images: [{ url: '' }],
};

export const VendorProducts = () => {
  const qc = useQueryClient();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [q, setQ] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['vendor', 'products', q],
    queryFn: () => productApi.myList({ q, limit: 100 }),
  });
  const categories = useQuery({ queryKey: ['categories'], queryFn: () => categoryApi.list() });

  const create = useMutation({
    mutationFn: (body) => productApi.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor', 'products'] });
      dispatch(pushToast({ title: 'Product created', tone: 'success' }));
      setOpen(false);
      setForm(empty);
    },
    onError: (e) =>
      dispatch(pushToast({ title: 'Failed', description: e.response?.data?.message, tone: 'destructive' })),
  });
  const update = useMutation({
    mutationFn: ({ id, body }) => productApi.update(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor', 'products'] });
      dispatch(pushToast({ title: 'Product updated', tone: 'success' }));
      setOpen(false);
      setEditing(null);
    },
  });
  const remove = useMutation({
    mutationFn: (id) => productApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendor', 'products'] }),
  });

  const submit = (e) => {
    e.preventDefault();
    const body = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      images: (form.images || []).filter((i) => i.url),
    };
    if (editing) update.mutate({ id: editing, body });
    else create.mutate(body);
  };

  const startEdit = (p) => {
    setEditing(p._id);
    setForm({
      title: p.title,
      description: p.description,
      price: p.price,
      stock: p.stock,
      category: p.category?._id || p.category,
      images: p.images?.length ? p.images : [{ url: '' }],
    });
    setOpen(true);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">{data?.meta?.total ?? 0} products in your catalog</p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
            className="md:w-72"
          />
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => { setEditing(null); setForm(empty); setOpen(true); }}>
            New product
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
        </div>
      ) : !data?.data?.length ? (
        <EmptyState
          icon={Package}
          title="No products yet"
          description="Add your first product to start selling on PartnerCart."
          action={<Button onClick={() => setOpen(true)} leftIcon={<Plus className="h-4 w-4" />}>Add product</Button>}
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="grid grid-cols-12 border-b border-border bg-muted/40 px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <div className="col-span-5">Product</div>
            <div className="col-span-2">Price</div>
            <div className="col-span-2">Stock</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1"></div>
          </div>
          {data.data.map((p) => (
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
              <div className="col-span-2 font-medium">{formatCurrency(p.price)}</div>
              <div className="col-span-2">
                <Badge tone={p.stock <= p.lowStockThreshold ? 'warning' : 'success'}>{p.stock}</Badge>
              </div>
              <div className="col-span-2">
                <Badge tone={p.isPublished ? 'success' : 'muted'}>{p.isPublished ? 'Published' : 'Draft'}</Badge>
              </div>
              <div className="col-span-1 flex items-center gap-1.5">
                <Button variant="ghost" size="icon" onClick={() => startEdit(p)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => remove.mutate(p._id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </Card>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit product' : 'New product'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit} loading={create.isPending || update.isPending}>
              {editing ? 'Save changes' : 'Create product'}
            </Button>
          </>
        }
      >
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <Field label="Title" className="md:col-span-2">
            <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <Field label="Description" className="md:col-span-2">
            <Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <Field label="Price (₹)">
            <Input type="number" min="0" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </Field>
          <Field label="Stock">
            <Input type="number" min="0" required value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
          </Field>
          <Field label="Category" className="md:col-span-2">
            <Select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="">Select...</option>
              {(categories.data || []).map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Image URL" className="md:col-span-2">
            <Input
              placeholder="https://..."
              value={form.images?.[0]?.url || ''}
              onChange={(e) => setForm({ ...form, images: [{ url: e.target.value }] })}
            />
          </Field>
        </form>
      </Modal>
    </div>
  );
};

export default VendorProducts;
