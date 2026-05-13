import { useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Field } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Checkbox } from '@/components/ui/Checkbox';
import { AuthShell, DashboardIllustration, StoreIllustration } from '@/components/layout/AuthShell';
import { GoogleButton } from '@/components/shared/GoogleButton';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/cn';

const Divider = ({ children = 'OR' }) => (
  <div className="my-5 flex items-center">
    <span className="h-px flex-1 bg-border" />
    <span className="px-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
      {children}
    </span>
    <span className="h-px flex-1 bg-border" />
  </div>
);

const INTENT_KEYS = ['customer', 'vendor'];

const LOGIN_INTENTS = {
  customer: {
    panelKicker: 'Customer · shop & checkout',
    panelTitle: (
      <>
        Welcome back!
        <br />
        Glad to see you again.
      </>
    ),
    panelDescription:
      'Discover local shops, support independent businesses, and get the best of your neighborhood.',
    Illustration: StoreIllustration,
    title: 'Login to PartnerCart',
    description: 'Use your shopper account — marketplace, cart, orders, and wishlist.',
    signInHint:
      'You will land in the customer app. Google sign-in is usually used for shoppers.',
    signupPath: '/auth/signup',
    showGoogle: true,
  },
  vendor: {
    panelKicker: 'Vendor · your storefront',
    panelTitle: (
      <>
        Run your store
        <br />
        from one place.
      </>
    ),
    panelDescription:
      'Manage listings, orders, inventory, and payouts. Sign in with the email tied to your approved vendor profile.',
    Illustration: DashboardIllustration,
    title: 'Vendor login',
    description: 'Access your dashboard — products, orders, earnings, and store settings.',
    signInHint: 'After login you go to /vendor. Use your vendor email, not a shopper account.',
    signupPath: '/auth/signup?role=vendor',
    showGoogle: true,
  },
};

export const LoginPage = () => {
  const { login } = useAuth();
  const [params, setParams] = useSearchParams();
  const next = params.get('next');
  const legacyAdminTab = params.get('as') === 'admin';

  const [form, setForm] = useState({ email: '', password: '' });
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  if (legacyAdminTab) {
    return (
      <Navigate
        to={next ? `/auth/admin?next=${encodeURIComponent(next)}` : '/auth/admin'}
        replace
      />
    );
  }

  const intentParam = params.get('as');
  const intent = INTENT_KEYS.includes(intentParam) ? intentParam : 'customer';
  const meta = LOGIN_INTENTS[intent];

  const setIntent = (key) => {
    const p = new URLSearchParams(params);
    if (key === 'customer') p.delete('as');
    else p.set('as', key);
    setParams(p, { replace: true });
  };

  const Illustration = meta.Illustration;

  const roleSegment = (
    <div role="tablist" aria-label="Choose account type" className="flex flex-col gap-2">
      <div className="flex rounded-xl border border-border bg-muted/30 p-1">
        {INTENT_KEYS.map((key) => {
          const active = intent === key;
          const label = key === 'customer' ? 'Customer' : 'Vendor';
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setIntent(key)}
              className={cn(
                'flex-1 rounded-lg px-2 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors sm:text-[11px] sm:tracking-[0.16em]',
                active
                  ? 'bg-foreground text-background shadow-sm'
                  : 'text-muted-foreground hover:bg-background/80 hover:text-foreground'
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
      <p className="text-[13px] leading-snug text-muted-foreground">{meta.signInHint}</p>
    </div>
  );

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form, next);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      panelKicker={meta.panelKicker}
      panelTitle={meta.panelTitle}
      panelDescription={meta.panelDescription}
      panelIllustration={<Illustration />}
      formHeaderSlot={roleSegment}
      title={meta.title}
      description={meta.description}
      formFooter={
        <span>
          Don&apos;t have an account?{' '}
          <Link
            to={meta.signupPath}
            className="font-semibold text-foreground hover:underline"
          >
            Sign Up
          </Link>
        </span>
      }
    >
      <form onSubmit={submit} className="space-y-4">
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
            autoComplete="current-password"
            placeholder="Enter your password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </Field>
        <div className="flex items-center justify-between pt-1">
          <Checkbox
            label="Remember me"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          <Link
            to="/auth/forgot-password"
            className="text-sm font-semibold text-foreground hover:underline"
          >
            Forgot Password?
          </Link>
        </div>
        <Button type="submit" className="mt-2 w-full" size="lg" loading={loading}>
          Login
        </Button>
      </form>

      {meta.showGoogle && (
        <>
          <Divider />
          <GoogleButton className="w-full" label="Continue with Google" />
        </>
      )}
    </AuthShell>
  );
};

export default LoginPage;
