import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket, getSocket } from '@/hooks/useSocket';
import { authApi } from '@/api/endpoints';
import { setAccessToken } from '@/api/client';
import { setUser } from '@/store/slices/authSlice';
import { pushToast } from '@/store/slices/toastSlice';

export const SocketBootstrap = ({ children }) => {
  const dispatch = useDispatch();
  const isAuthed = useSelector((s) => s.auth.status === 'authenticated');
  useSocket(isAuthed);
  const qc = useQueryClient();

  useEffect(() => {
    if (!isAuthed) return undefined;
    const s = getSocket();
    if (!s) return undefined;

    const refresh = () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['orders'] });
    };

    const onVendorApproved = async () => {
      try {
        const res = await authApi.refresh();
        if (res?.accessToken) setAccessToken(res.accessToken);
        const me = await authApi.me();
        dispatch(setUser(me.user));
        qc.invalidateQueries();
        qc.invalidateQueries({ queryKey: ['products'] });
        qc.invalidateQueries({ queryKey: ['vendors'] });
        dispatch(
          pushToast({
            title: 'Store approved — welcome, vendor!',
            description: 'Finish your store profile and add products—buyers shop on Marketplace.',
            tone: 'success',
          })
        );
      } catch {
        /* Silent: user can refresh; refresh cookie may have expired */
      }
    };

    s.on('notification:new', refresh);
    s.on('order:status', refresh);
    s.on('order:new', refresh);
    s.on('vendor:approved', onVendorApproved);
    return () => {
      s.off('notification:new', refresh);
      s.off('order:status', refresh);
      s.off('order:new', refresh);
      s.off('vendor:approved', onVendorApproved);
    };
  }, [isAuthed, qc, dispatch]);

  return children;
};
