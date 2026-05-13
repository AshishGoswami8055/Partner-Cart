import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Store, CheckCircle2, XCircle } from 'lucide-react';
import { adminApi, vendorApi } from '@/api/endpoints';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { Input, Field, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useDispatch } from 'react-redux';
import { pushToast } from '@/store/slices/toastSlice';
import { formatRelative } from '@/lib/format';

export const AdminVendors = () => {
  const qc = useQueryClient();
  const dispatch = useDispatch();
  const [active, setActive] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    decision: 'approve',
    note: '',
    commissionRate: 10,
    tier: 'basic',
  });

  const apps = useQuery({
    queryKey: ['admin', 'applications'],
    queryFn: () => vendorApi.listApplications({ limit: 50 }),
  });
  const vendors = useQuery({
    queryKey: ['admin', 'vendors'],
    queryFn: () => adminApi.vendors({ limit: 50 }),
  });

  const review = useMutation({
    mutationFn: ({ id, body }) => vendorApi.reviewApplication(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'applications'] });
      qc.invalidateQueries({ queryKey: ['admin', 'vendors'] });
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
      dispatch(pushToast({ title: 'Application reviewed', tone: 'success' }));
      setActive(null);
    },
  });

  const submitReview = () => {
    review.mutate({ id: active._id, body: reviewForm });
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Vendor management</h1>
      <Tabs defaultValue="applications">
        <TabsList>
          <TabsTrigger value="applications">
            Applications {apps.data?.data ? `(${apps.data.data.filter((a) => a.status === 'pending').length})` : ''}
          </TabsTrigger>
          <TabsTrigger value="vendors">Active vendors</TabsTrigger>
        </TabsList>
        <TabsContent value="applications">
          {apps.isLoading ? (
            <Skeleton className="h-40" />
          ) : (
            <div className="space-y-3">
              {(apps.data?.data || []).length === 0 && (
                <Card className="p-10 text-center text-muted-foreground">No applications.</Card>
              )}
              {(apps.data?.data || []).map((a) => (
                <Card key={a._id} className="p-5">
                  <div className="flex flex-wrap items-start gap-4">
                    <div className="grid h-12 w-12 place-items-center rounded-md bg-foreground text-background">
                      <Store className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-display font-semibold">{a.businessName}</div>
                      <div className="text-sm text-muted-foreground">
                        {a.user?.name} · {a.user?.email} · {formatRelative(a.createdAt)}
                      </div>
                      {a.description && <p className="mt-2 text-sm">{a.description}</p>}
                    </div>
                    <Badge tone={a.status === 'pending' ? 'warning' : a.status === 'approved' ? 'success' : 'destructive'}>
                      {a.status}
                    </Badge>
                    {a.status === 'pending' && (
                      <Button onClick={() => { setActive(a); setReviewForm({ decision: 'approve', note: '', commissionRate: 10, tier: 'basic' }); }}>
                        Review
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="vendors">
          {vendors.isLoading ? (
            <Skeleton className="h-40" />
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {(vendors.data?.data || []).map((v) => (
                <Card key={v._id} className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-md bg-foreground text-background">
                      <Store className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-display font-semibold">{v.storeName}</div>
                      <div className="text-xs text-muted-foreground">{v.user?.email}</div>
                    </div>
                    <Badge tone={v.status === 'verified' ? 'success' : v.status === 'suspended' ? 'destructive' : 'muted'}>
                      {v.status}
                    </Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-lg bg-muted/40 p-2"><div className="font-medium">{v.tier}</div><div className="text-muted-foreground">tier</div></div>
                    <div className="rounded-lg bg-muted/40 p-2"><div className="font-medium">{v.commissionRate}%</div><div className="text-muted-foreground">commission</div></div>
                    <div className="rounded-lg bg-muted/40 p-2"><div className="font-medium">{v.stats?.totalProducts || 0}</div><div className="text-muted-foreground">products</div></div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Modal
        open={!!active}
        onClose={() => setActive(null)}
        title="Review application"
        description={active?.businessName}
        footer={
          <>
            <Button variant="ghost" onClick={() => setActive(null)}>Cancel</Button>
            <Button
              variant={reviewForm.decision === 'reject' ? 'destructive' : 'primary'}
              onClick={submitReview}
              loading={review.isPending}
              leftIcon={
                reviewForm.decision === 'reject'
                  ? <XCircle className="h-4 w-4" />
                  : <CheckCircle2 className="h-4 w-4" />
              }
            >
              {reviewForm.decision === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Field label="Decision">
            <Select value={reviewForm.decision} onChange={(e) => setReviewForm({ ...reviewForm, decision: e.target.value })}>
              <option value="approve">Approve</option>
              <option value="reject">Reject</option>
            </Select>
          </Field>
          {reviewForm.decision === 'approve' && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Tier">
                <Select value={reviewForm.tier} onChange={(e) => setReviewForm({ ...reviewForm, tier: e.target.value })}>
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                  <option value="verified">Verified</option>
                </Select>
              </Field>
              <Field label="Commission %">
                <Input
                  type="number"
                  value={reviewForm.commissionRate}
                  onChange={(e) => setReviewForm({ ...reviewForm, commissionRate: Number(e.target.value) })}
                />
              </Field>
            </div>
          )}
          <Field label="Note (optional)">
            <Textarea value={reviewForm.note} onChange={(e) => setReviewForm({ ...reviewForm, note: e.target.value })} />
          </Field>
        </div>
      </Modal>
    </div>
  );
};

export default AdminVendors;
