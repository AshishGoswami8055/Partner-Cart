import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { authApi } from '@/api/endpoints';
import { setAccessToken } from '@/api/client';
import { authSuccess, authFailure } from '@/store/slices/authSlice';
import { pushToast } from '@/store/slices/toastSlice';
import { Spinner } from '@/components/ui/Spinner';
import { Logo } from '@/components/shared/Logo';

const dashboardFor = (role) =>
  role === 'admin' ? '/admin' : role === 'vendor' ? '/vendor' : '/app';

export const OAuthCallbackPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const token = params.get('token');
    const failed = params.get('oauth') === 'failed';

    if (failed || !token) {
      dispatch(
        pushToast({
          title: 'Sign-in failed',
          description: params.get('reason') === 'not_configured'
            ? 'Google login is not configured on this server.'
            : 'Google could not sign you in.',
          tone: 'destructive',
        })
      );
      dispatch(authFailure());
      navigate('/auth/login', { replace: true });
      return;
    }

    setAccessToken(token);
    authApi
      .me()
      .then(({ user }) => {
        dispatch(authSuccess({ user }));
        dispatch(
          pushToast({
            title: 'Signed in with Google',
            description: user.name,
            tone: 'success',
          })
        );
        navigate(dashboardFor(user.role), { replace: true });
      })
      .catch(() => {
        dispatch(authFailure());
        dispatch(
          pushToast({
            title: 'Sign-in failed',
            description: 'Could not load your profile. Please try again.',
            tone: 'destructive',
          })
        );
        navigate('/auth/login', { replace: true });
      });
  }, [params, navigate, dispatch]);

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <Logo />
        <Spinner size="lg" />
        <p className="text-sm text-muted-foreground">Finishing sign-in with Google…</p>
      </div>
    </div>
  );
};

export default OAuthCallbackPage;
