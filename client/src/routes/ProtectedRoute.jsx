import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Spinner } from '@/components/ui/Spinner';

export const ProtectedRoute = ({ roles, children }) => {
  const { user, status } = useSelector((s) => s.auth);
  const location = useLocation();

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="grid h-screen place-items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (status !== 'authenticated' || !user) {
    const isAdminArea = roles?.length === 1 && roles[0] === 'admin';
    const loginPath = isAdminArea ? '/auth/admin' : '/auth/login';
    return <Navigate to={`${loginPath}?next=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    const fallback = user.role === 'admin' ? '/admin' : user.role === 'vendor' ? '/vendor' : '/app';
    return <Navigate to={fallback} replace />;
  }

  return children;
};
