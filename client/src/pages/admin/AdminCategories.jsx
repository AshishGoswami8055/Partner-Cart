import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { categoryApi } from '@/api/endpoints';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Field, Textarea } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

export const AdminCategories = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', icon: '' });
  const { data } = useQuery({ queryKey: ['categories'], queryFn: () => categoryApi.list() });
  const create = useMutation({
    mutationFn: (b) => categoryApi.create(b),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      setOpen(false);
      setForm({ name: '', description: '', icon: '' });
    },
  });
  const remove = useMutation({
    mutationFn: (id) => categoryApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Categories</h1>
          <p className="text-sm text-muted-foreground">Organize the marketplace catalog.</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setOpen(true)}>
          New category
        </Button>
      </div>
      <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
        {(data || []).map((c) => (
          <Card key={c._id} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-display font-semibold">{c.name}</div>
                <div className="text-xs text-muted-foreground">/{c.slug}</div>
              </div>
              <Badge tone={c.isActive ? 'success' : 'muted'}>{c.isActive ? 'Active' : 'Off'}</Badge>
            </div>
            {c.description && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>}
            <div className="mt-3 flex justify-end">
              <Button variant="ghost" size="icon" onClick={() => remove.mutate(c._id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New category"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => create.mutate(form)} loading={create.isPending}>Create</Button>
          </>
        }
      >
        <div className="space-y-3">
          <Field label="Name">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Description">
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
        </div>
      </Modal>
    </div>
  );
};

export default AdminCategories;
