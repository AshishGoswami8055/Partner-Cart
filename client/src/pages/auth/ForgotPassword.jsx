import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, KeyRound, RefreshCcw } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { Button } from '@/components/ui/Button';
import { Input, Field } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { AuthShell, ShieldIllustration } from '@/components/layout/AuthShell';
import { authApi } from '@/api/endpoints';
import { pushToast } from '@/store/slices/toastSlice';

const OTP_LENGTH = 6;

const OtpField = ({ value, onChange, disabled }) => {
  const refs = useRef([]);
  const digits = value.padEnd(OTP_LENGTH, ' ').split('').slice(0, OTP_LENGTH);

  const setDigit = (idx, d) => {
    const arr = digits.slice();
    arr[idx] = d || ' ';
    onChange(arr.join('').replace(/ /g, ''));
  };

  const onKey = (idx, e) => {
    if (e.key === 'Backspace' && !digits[idx].trim() && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
  };

  const onPaste = (e) => {
    const data = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!data) return;
    e.preventDefault();
    onChange(data);
    refs.current[Math.min(data.length, OTP_LENGTH - 1)]?.focus();
  };

  return (
    <div className="flex justify-between gap-2">
      {Array.from({ length: OTP_LENGTH }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => (refs.current[idx] = el)}
          inputMode="numeric"
          maxLength={1}
          value={digits[idx].trim()}
          disabled={disabled}
          onChange={(e) => {
            const d = e.target.value.replace(/\D/g, '').slice(-1);
            setDigit(idx, d);
            if (d && idx < OTP_LENGTH - 1) refs.current[idx + 1]?.focus();
          }}
          onKeyDown={(e) => onKey(idx, e)}
          onPaste={onPaste}
          className="h-14 w-12 rounded-lg border border-input bg-background text-center text-xl font-semibold text-foreground transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
        />
      ))}
    </div>
  );
};

export const ForgotPasswordPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (resendIn <= 0) return undefined;
    const t = setInterval(() => setResendIn((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  const requestOtp = async () => {
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setStep('otp');
      setResendIn(30);
      dispatch(
        pushToast({
          title: 'Code sent',
          description: `If ${email} is on file, a 6-digit code is on its way.`,
          tone: 'success',
        })
      );
    } catch (err) {
      dispatch(
        pushToast({
          title: "Couldn't send code",
          description: err.response?.data?.message || 'Try again in a moment.',
          tone: 'destructive',
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    setLoading(true);
    try {
      const res = await authApi.verifyForgotOtp({ email, code });
      setToken(res.token);
      setStep('reset');
    } catch (err) {
      dispatch(
        pushToast({
          title: 'Invalid code',
          description: err.response?.data?.message || 'Double-check the code from your email.',
          tone: 'destructive',
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const reset = async () => {
    if (password !== confirm) {
      dispatch(
        pushToast({
          title: 'Passwords do not match',
          tone: 'destructive',
        })
      );
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword({ email, token, password });
      dispatch(
        pushToast({
          title: 'Password reset',
          description: 'Sign in with your new password.',
          tone: 'success',
        })
      );
      navigate('/auth/login', { replace: true });
    } catch (err) {
      dispatch(
        pushToast({
          title: "Couldn't reset password",
          description: err.response?.data?.message || 'Please verify the code again.',
          tone: 'destructive',
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const stepCopy = {
    email: {
      title: 'Reset Password',
      description: "We'll email you a 6-digit code so you can set a new password.",
    },
    otp: {
      title: 'Enter the code',
      description: `We just emailed a 6-digit code to ${email}. The code expires in 10 minutes.`,
    },
    reset: {
      title: 'Choose a new password',
      description: 'Pick something memorable but hard to guess. At least 6 characters.',
    },
  };

  return (
    <AuthShell
      panelTitle={
        <>
          Forgot something?<br />We&apos;ve got you.
        </>
      }
      panelDescription="Enter the email tied to your account and we'll send you a 6-digit code to set a new password. Codes expire in 10 minutes."
      panelIllustration={<ShieldIllustration />}
      title={stepCopy[step].title}
      description={stepCopy[step].description}
      formFooter={
        <span>
          Remembered it?{' '}
          <Link to="/auth/login" className="font-semibold text-foreground hover:underline">
            Back to login
          </Link>
        </span>
      }
    >
      {step === 'email' && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            requestOtp();
          }}
          className="space-y-4"
        >
          <Field label="Email Address">
            <Input
              type="email"
              required
              autoComplete="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="h-4 w-4" />}
            />
          </Field>
          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Send 6-digit code
          </Button>
        </form>
      )}

      {step === 'otp' && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            verify();
          }}
          className="space-y-5"
        >
          <Field label="Verification code">
            <OtpField value={code} onChange={setCode} disabled={loading} />
          </Field>
          <Button
            type="submit"
            className="w-full"
            size="lg"
            loading={loading}
            disabled={code.length !== OTP_LENGTH}
          >
            Verify code
          </Button>
          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              className="text-foreground/70 hover:text-foreground"
              onClick={() => setStep('email')}
            >
              Use a different email
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 font-semibold text-foreground hover:underline disabled:cursor-not-allowed disabled:opacity-50"
              onClick={requestOtp}
              disabled={resendIn > 0 || loading}
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              {resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend code'}
            </button>
          </div>
        </form>
      )}

      {step === 'reset' && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            reset();
          }}
          className="space-y-4"
        >
          <Field label="New password">
            <PasswordInput
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="Create a new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <Field label="Confirm new password">
            <PasswordInput
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="Repeat your new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </Field>
          <Button type="submit" className="w-full" size="lg" loading={loading}>
            <KeyRound className="mr-2 h-4 w-4" />
            Set new password
          </Button>
        </form>
      )}
    </AuthShell>
  );
};

export default ForgotPasswordPage;
