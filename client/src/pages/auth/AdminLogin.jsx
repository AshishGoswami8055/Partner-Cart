import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Field } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Checkbox } from '@/components/ui/Checkbox';
import { AuthShell, ShieldIllustration } from '@/components/layout/AuthShell';
import { authApi } from '@/api/endpoints';
import { setAccessToken } from '@/api/client';
import { authStart, authSuccess, authFailure, logout as logoutAction } from '@/store/slices/authSlice';
import { pushToast } from '@/store/slices/toastSlice';

/** Separate URL (`/auth/admin`) from customer/vendor login — avoids advertising admin entry on the main sign-in screen. */
export const AdminLoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next');
  const [form, setForm] = useState({ email: '', password: '' });
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    dispatch(authStart());
    try {
      const res = await authApi.login(form);
      if (res.user.role !== 'admin') {
        try {
          await authApi.logout();
        } catch {
          /* ignore */
        }
        setAccessToken(null);
        dispatch(logoutAction());
        dispatch(authFailure(''));
        dispatch(
          pushToast({
            title: 'Not an administrator',
            description:
              'This URL is reserved for platform admins. Customer and vendor accounts use the main login.',
            tone: 'destructive',
          })
        );
        return;
      }
      setAccessToken(res.accessToken);
      dispatch(authSuccess({ user: res.user }));
      dispatch(pushToast({ title: 'Signed in', description: res.user.name, tone: 'success' }));
      const target =
        next && next.startsWith('/') && !next.startsWith('//') && !next.includes('://') ? next : '/admin';
      navigate(target);
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      dispatch(authFailure(message));
      dispatch(pushToast({ title: 'Could not sign in', description: message, tone: 'destructive' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      panelKicker="Platform admin · restricted"
      panelTitle={
        <>
          Operate the
          <br />
          marketplace.
        </>
      }
      panelDescription="Sign in only if you maintain PartnerCart — vendors and shoppers use the public login. Google sign-in is disabled here."
      panelIllustration={<ShieldIllustration />}
      title="Administrator sign-in"
      description="Use your assigned admin credentials. Sessions are audited like other routes."
      formFooter={
        <span className="text-muted-foreground">
          Need the shopper portal?{' '}
          <Link to="/auth/login" className="font-semibold text-foreground hover:underline">
            Main login
          </Link>
          {' · '}
          <Link to="/" className="hover:underline">
            Home
          </Link>
        </span>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Admin email">
          <Input
            type="email"
            required
            autoComplete="username"
            placeholder="you@organisation.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            leftIcon={<Mail className="h-4 w-4" />}
          />
        </Field>
        <Field label="Password">
          <PasswordInput
            required
            autoComplete="current-password"
            placeholder="Password"
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
          <Link to="/auth/forgot-password" className="text-sm font-semibold text-foreground hover:underline">
            Forgot Password?
          </Link>
        </div>
        <Button type="submit" className="mt-2 w-full" size="lg" loading={loading}>
          Sign in as admin
        </Button>
      </form>
    </AuthShell>
  );
};

export default AdminLoginPage;
