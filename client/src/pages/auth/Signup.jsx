import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Mail, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Field } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Checkbox } from '@/components/ui/Checkbox';
import { AuthShell, BagIllustration, ShieldIllustration } from '@/components/layout/AuthShell';
import { GoogleButton } from '@/components/shared/GoogleButton';
import { useAuth } from '@/hooks/useAuth';
import { pushToast } from '@/store/slices/toastSlice';

const Divider = ({ children = 'OR' }) => (
  <div className="my-5 flex items-center">
    <span className="h-px flex-1 bg-border" />
    <span className="px-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
      {children}
    </span>
    <span className="h-px flex-1 bg-border" />
  </div>
);

export const SignupPage = () => {
  const { register } = useAuth();
  const dispatch = useDispatch();
  const [params] = useSearchParams();
  const isVendorIntent = params.get('role') === 'vendor';

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      dispatch(
        pushToast({
          title: 'Passwords do not match',
          description: 'Please retype the same password in both fields.',
          tone: 'destructive',
        })
      );
      return;
    }
    if (!agreed) {
      dispatch(
        pushToast({
          title: 'Please accept the terms',
          description: 'You need to agree before creating an account.',
          tone: 'info',
        })
      );
      return;
    }
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      panelTitle={
        isVendorIntent
          ? <>Open your store<br />on PartnerCart.</>
          : <>Create your<br />PartnerCart account</>
      }
      panelDescription={
        isVendorIntent
          ? 'Apply to sell on PartnerCart and reach customers across cities. We review every store personally within 48 hours.'
          : 'Join our community and enjoy a seamless shopping experience with local stores.'
      }
      panelIllustration={isVendorIntent ? <ShieldIllustration /> : <BagIllustration />}
      title="Create Account"
      description={
        isVendorIntent
          ? 'Set up your account, then submit a vendor application.'
          : 'Sign up to start shopping from local stores.'
      }
      formFooter={
        <span>
          Already have an account?{' '}
          <Link to="/auth/login" className="font-semibold text-foreground hover:underline">
            Login
          </Link>
        </span>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Full Name">
            <Input
              required
              autoComplete="name"
              placeholder="Enter your full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              leftIcon={<User className="h-4 w-4" />}
            />
          </Field>
          <Field label="Email Address">
            <Input
              type="email"
              required
              autoComplete="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              leftIcon={<Mail className="h-4 w-4" />}
            />
          </Field>
          <Field label="Password">
            <PasswordInput
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="Create a password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </Field>
          <Field label="Confirm Password">
            <PasswordInput
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="Confirm your password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            />
          </Field>
        </div>
        <Checkbox
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          label={
            <span className="text-sm text-foreground/85">
              I agree to the{' '}
              <Link to="/about" className="font-semibold text-foreground hover:underline">
                Terms &amp; Conditions
              </Link>{' '}
              and{' '}
              <Link to="/about" className="font-semibold text-foreground hover:underline">
                Privacy Policy
              </Link>
            </span>
          }
        />
        <Button type="submit" className="mt-2 w-full" size="lg" loading={loading}>
          Create Account
        </Button>
      </form>

      <Divider />
      <GoogleButton className="w-full" label="Sign up with Google" />
    </AuthShell>
  );
};

export default SignupPage;
