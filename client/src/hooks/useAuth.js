import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/api/endpoints';
import { setAccessToken } from '@/api/client';
import { authStart, authSuccess, authFailure, logout as logoutAction } from '@/store/slices/authSlice';
import { pushToast } from '@/store/slices/toastSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, status } = useSelector((s) => s.auth);

  const login = async (credentials, redirectTo) => {
    dispatch(authStart());
    try {
      const res = await authApi.login(credentials);
      setAccessToken(res.accessToken);
      dispatch(authSuccess({ user: res.user }));
      dispatch(pushToast({ title: 'Welcome back', description: res.user.name, tone: 'success' }));
      const path = redirectTo || (
        res.user.role === 'admin' ? '/admin'
        : res.user.role === 'vendor' ? '/vendor'
        : '/app'
      );
      navigate(path);
      return res.user;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      dispatch(authFailure(message));
      dispatch(pushToast({ title: 'Could not sign in', description: message, tone: 'destructive' }));
      throw err;
    }
  };

  const register = async (payload) => {
    dispatch(authStart());
    try {
      const res = await authApi.register(payload);
      setAccessToken(res.accessToken);
      dispatch(authSuccess({ user: res.user }));
      dispatch(pushToast({ title: 'Account created', description: 'Welcome to PartnerCart', tone: 'success' }));
      navigate('/app');
      return res.user;
    } catch (err) {
      const message = err.response?.data?.message || 'Signup failed';
      dispatch(authFailure(message));
      dispatch(pushToast({ title: 'Could not sign up', description: message, tone: 'destructive' }));
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      /* swallow */
    }
    setAccessToken(null);
    dispatch(logoutAction());
    navigate('/');
  };

  return { user, status, isAuthenticated: status === 'authenticated', login, register, logout };
};
