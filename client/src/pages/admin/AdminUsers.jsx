import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { userApi } from '@/api/endpoints';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Switch } from '@/components/ui/Switch';
import { Skeleton } from '@/components/ui/Skeleton';

export const AdminUsers = () => {
  const qc = useQueryClient();
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', q, role],
    queryFn: () => userApi.adminList({ q, role, limit: 50 }),
  });

  const block = useMutation({
    mutationFn: ({ id, isBlocked }) => userApi.adminBlock(id, isBlocked),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Users</h1>
          <p className="text-sm text-muted-foreground">{data?.meta?.total ?? 0} accounts</p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
            className="md:w-72"
          />
          <Select value={role} onChange={(e) => setRole(e.target.value)} className="md:w-44">
            <option value="">All roles</option>
            <option value="customer">Customers</option>
            <option value="vendor">Vendors</option>
            <option value="admin">Admins</option>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-96" />
      ) : (
        <Card className="overflow-hidden">
          <div className="grid grid-cols-12 border-b border-border bg-muted/40 px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <div className="col-span-5">User</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-2">Joined</div>
            <div className="col-span-3 text-right">Active</div>
          </div>
          {(data?.data || []).map((u) => (
            <div key={u._id} className="grid grid-cols-12 items-center border-b border-border px-5 py-3 last:border-0 hover:bg-muted/40">
              <div className="col-span-5 flex items-center gap-3">
                <Avatar name={u.name} src={u.avatar?.url} />
                <div>
                  <div className="font-medium">{u.name}</div>
                  <div className="text-xs text-muted-foreground">{u.email}</div>
                </div>
              </div>
              <div className="col-span-2">
                <Badge tone={u.role === 'admin' ? 'destructive' : u.role === 'vendor' ? 'primary' : 'muted'} className="capitalize">
                  {u.role}
                </Badge>
              </div>
              <div className="col-span-2 text-sm text-muted-foreground">
                {new Date(u.createdAt).toLocaleDateString()}
              </div>
              <div className="col-span-3 flex items-center justify-end gap-2">
                {u.isBlocked ? <Badge tone="destructive">Blocked</Badge> : <Badge tone="success">Active</Badge>}
                <Switch
                  checked={!u.isBlocked}
                  onChange={(checked) => block.mutate({ id: u._id, isBlocked: !checked })}
                />
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
};

export default AdminUsers;
