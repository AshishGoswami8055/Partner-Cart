import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { ShieldCheck, KeyRound, Bell, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { Separator } from '@/components/ui/Separator';
import { Button } from '@/components/ui/Button';
import { Input, Field } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { useAuth } from '@/hooks/useAuth';
import { authApi, userApi } from '@/api/endpoints';
import { setUser } from '@/store/slices/authSlice';
import { pushToast } from '@/store/slices/toastSlice';

const NOTIFICATION_ROWS = [
  { key: 'orderEmails', label: 'Order updates', description: 'Order placed, shipped, delivered' },
  { key: 'promoEmails', label: 'Promotions and deals', description: 'Discounts, coupons, vendor offers' },
  { key: 'vendorEmails', label: 'Vendor updates', description: 'Application status and store messages' },
  { key: 'chatEmails', label: 'Chat reminders', description: 'Email when you miss vendor messages' },
  { key: 'systemEmails', label: 'Account & security', description: 'Logins, password changes, security' },
];

export const ChangePasswordCard = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const isLocal = (user?.provider || 'local') === 'local';
  const [step, setStep] = useState('idle');
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const requestOtp = async () => {
    if (isLocal && !current) {
      dispatch(pushToast({ title: 'Enter your current password', tone: 'destructive' }));
      return;
    }
    if (next.length < 6) {
      dispatch(pushToast({ title: 'New password must be at least 6 characters', tone: 'destructive' }));
      return;
    }
    if (next !== confirm) {
      dispatch(pushToast({ title: 'Passwords do not match', tone: 'destructive' }));
      return;
    }
    setLoading(true);
    try {
      await authApi.sendChangePasswordOtp();
      setStep('otp');
      dispatch(
        pushToast({
          title: 'Code sent',
          description: 'Check your email for a 6-digit code.',
          tone: 'success',
        })
      );
    } catch (err) {
      dispatch(
        pushToast({
          title: "Couldn't send code",
          description: err.response?.data?.message || 'Try again shortly.',
          tone: 'destructive',
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const submit = async () => {
    setLoading(true);
    try {
      await authApi.updatePassword({
        ...(isLocal ? { currentPassword: current } : {}),
        newPassword: next,
        otp,
      });
      dispatch(
        pushToast({
          title: 'Password changed',
          description: 'Other sessions have been signed out.',
          tone: 'success',
        })
      );
      setCurrent('');
      setNext('');
      setConfirm('');
      setOtp('');
      setStep('idle');
    } catch (err) {
      dispatch(
        pushToast({
          title: "Couldn't change password",
          description: err.response?.data?.message || 'Please re-check your inputs.',
          tone: 'destructive',
        })
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-foreground/10">
          <ShieldCheck className="h-4 w-4" />
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold">
            {isLocal ? 'Change password' : 'Set a password'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isLocal
              ? "We'll email a 6-digit code to confirm the change."
              : "You signed in with Google. Set a password so you can also log in with email."}
          </p>
        </div>
      </div>
      <Separator className="my-4" />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (step === 'idle') requestOtp();
          else submit();
        }}
        className="grid gap-3 md:grid-cols-2"
      >
        {isLocal && (
          <Field label="Current password" className="md:col-span-2">
            <PasswordInput
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              autoComplete="current-password"
              disabled={step === 'otp'}
              required
            />
          </Field>
        )}
        <Field label="New password">
          <PasswordInput
            value={next}
            onChange={(e) => setNext(e.target.value)}
            autoComplete="new-password"
            disabled={step === 'otp'}
            minLength={6}
            required
          />
        </Field>
        <Field label="Confirm new password">
          <PasswordInput
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            disabled={step === 'otp'}
            minLength={6}
            required
          />
        </Field>
        {step === 'otp' && (
          <Field label="6-digit code from email" className="md:col-span-2">
            <Input
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
            />
          </Field>
        )}
        <div className="md:col-span-2 flex items-center gap-2">
          <Button type="submit" loading={loading} disabled={step === 'otp' && otp.length !== 6}>
            <KeyRound className="mr-2 h-4 w-4" />
            {step === 'idle' ? 'Send verification code' : 'Confirm change'}
          </Button>
          {step === 'otp' && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setStep('idle');
                setOtp('');
              }}
            >
              Back
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
};

export const NotificationPrefsCard = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [prefs, setPrefs] = useState(() => ({
    orderEmails: true,
    promoEmails: true,
    chatEmails: true,
    systemEmails: true,
    vendorEmails: true,
    ...(user?.notificationPrefs || {}),
  }));
  const [pending, setPending] = useState(null);

  useEffect(() => {
    if (user?.notificationPrefs) {
      setPrefs((p) => ({ ...p, ...user.notificationPrefs }));
    }
  }, [user]);

  const toggle = async (key) => {
    const nextValue = !prefs[key];
    setPrefs((p) => ({ ...p, [key]: nextValue }));
    setPending(key);
    try {
      const updated = await userApi.updateNotificationPrefs({ [key]: nextValue });
      dispatch(setUser(updated));
    } catch (err) {
      setPrefs((p) => ({ ...p, [key]: !nextValue }));
      dispatch(
        pushToast({
          title: "Couldn't save preference",
          description: err.response?.data?.message || 'Please try again.',
          tone: 'destructive',
        })
      );
    } finally {
      setPending(null);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-foreground/10">
          <Bell className="h-4 w-4" />
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold">Email notifications</h2>
          <p className="text-sm text-muted-foreground">
            Choose what shows up in your inbox. You&apos;ll always see in-app notifications.
          </p>
        </div>
      </div>
      <Separator className="my-4" />
      {NOTIFICATION_ROWS.map((row) => (
        <div
          key={row.key}
          className="flex items-center justify-between border-b border-border py-3 last:border-0"
        >
          <div>
            <div className="font-medium">{row.label}</div>
            <div className="text-sm text-muted-foreground">{row.description}</div>
          </div>
          <div className="flex items-center gap-2">
            {pending === row.key && (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
            )}
            <Switch checked={!!prefs[row.key]} onChange={() => toggle(row.key)} />
          </div>
        </div>
      ))}
    </Card>
  );
};

export const AccountSecurity = () => (
  <div className="space-y-6">
    <ChangePasswordCard />
    <NotificationPrefsCard />
  </div>
);

export default AccountSecurity;
