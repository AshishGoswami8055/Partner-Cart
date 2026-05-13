import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { authApi } from '@/api/endpoints';
import { setAccessToken, setUnauthorizedHandler } from '@/api/client';
import { authSuccess, authFailure, logout } from '@/store/slices/authSlice';
import { Spinner } from '@/components/ui/Spinner';

export const AuthBootstrap = ({ children }) => {
  const dispatch = useDispatch();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUnauthorizedHandler(() => dispatch(logout()));
    (async () => {
      try {
        const tokens = await authApi.refresh();
        if (tokens?.accessToken) {
          setAccessToken(tokens.accessToken);
          const me = await authApi.me();
          dispatch(authSuccess({ user: me.user }));
        } else {
          dispatch(authFailure());
        }
      } catch {
        dispatch(authFailure());
      } finally {
        setReady(true);
      }
    })();
  }, [dispatch]);

  if (!ready) {
    return (
      <div className="grid h-screen place-items-center">
        <Spinner size="lg" />
      </div>
    );
  }
  return children;
};
