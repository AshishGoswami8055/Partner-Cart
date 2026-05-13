import { AccountSecurity } from '@/components/shared/AccountSecurity';

export const VendorSettings = () => (
  <div className="space-y-6 max-w-3xl">
    <h1 className="font-display text-2xl font-bold">Account settings</h1>
    <p className="-mt-3 text-sm text-muted-foreground">
      Manage your password and the emails we send you. Looking for store branding?
      Head to <span className="font-semibold">Store settings</span>.
    </p>
    <AccountSecurity />
  </div>
);

export default VendorSettings;
