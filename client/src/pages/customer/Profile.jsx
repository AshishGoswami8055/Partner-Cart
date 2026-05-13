import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Card } from '@/components/ui/Card';
import { Input, Field } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/hooks/useAuth';
import { userApi, vendorApi } from '@/api/endpoints';
import { setUser } from '@/store/slices/authSlice';
import { pushToast } from '@/store/slices/toastSlice';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Input';

export const ProfilePage = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const [form, setForm] = useState({ name: '', phone: '', city: '', state: '' });
  const [vendorOpen, setVendorOpen] = useState(false);
  const [vendorForm, setVendorForm] = useState({ businessName: '', description: '', website: '' });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        city: user.location?.city || '',
        state: user.location?.state || '',
      });
    }
  }, [user]);

  const save = async (e) => {
    e.preventDefault();
    const updated = await userApi.updateMe({
      name: form.name,
      phone: form.phone,
      location: { city: form.city, state: form.state, country: 'India' },
    });
    dispatch(setUser(updated));
    dispatch(pushToast({ title: 'Profile updated', tone: 'success' }));
  };

  const apply = async (e) => {
    e.preventDefault();
    await vendorApi.apply(vendorForm);
    dispatch(pushToast({ title: 'Application submitted', description: 'You will hear back within 48 hours.', tone: 'success' }));
    setVendorOpen(false);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="p-6 lg:col-span-2">
        <h1 className="font-display text-2xl font-bold">Profile</h1>
        <form onSubmit={save} className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="Name">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Phone">
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
          <Field label="City">
            <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </Field>
          <Field label="State">
            <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
          </Field>
          <div className="md:col-span-2">
            <Button type="submit">Save changes</Button>
          </div>
        </form>
      </Card>

      <div className="space-y-6">
        <Card className="p-6 text-center">
          <div className="flex justify-center">
            <Avatar name={user?.name} src={user?.avatar?.url} size="lg" />
          </div>
          <div className="mt-3 font-display font-semibold">{user?.name}</div>
          <div className="text-sm text-muted-foreground">{user?.email}</div>
          <Badge tone="primary" className="mt-3 capitalize">
            {user?.role}
          </Badge>
        </Card>

        {user?.role === 'customer' && (
          <Card className="p-6">
            <div className="font-display font-semibold">Become a vendor</div>
            <p className="mt-1 text-sm text-muted-foreground">
              Sell your products on PartnerCart with multi-vendor checkout, real-time orders and analytics.
            </p>
            <Button className="mt-3 w-full" variant="outline" onClick={() => setVendorOpen(true)}>
              Apply now
            </Button>
          </Card>
        )}
      </div>

      <Modal
        open={vendorOpen}
        onClose={() => setVendorOpen(false)}
        title="Vendor application"
        description="Tell us about your business. We typically review within 48 hours."
        footer={
          <>
            <Button variant="ghost" onClick={() => setVendorOpen(false)}>
              Cancel
            </Button>
            <Button onClick={apply}>Submit</Button>
          </>
        }
      >
        <form onSubmit={apply} className="space-y-3">
          <Field label="Business name">
            <Input
              required
              value={vendorForm.businessName}
              onChange={(e) => setVendorForm({ ...vendorForm, businessName: e.target.value })}
            />
          </Field>
          <Field label="Description">
            <Textarea
              value={vendorForm.description}
              onChange={(e) => setVendorForm({ ...vendorForm, description: e.target.value })}
              placeholder="What do you sell? Where are you based?"
            />
          </Field>
          <Field label="Website (optional)">
            <Input
              value={vendorForm.website}
              onChange={(e) => setVendorForm({ ...vendorForm, website: e.target.value })}
            />
          </Field>
        </form>
      </Modal>
    </div>
  );
};

export default ProfilePage;
