import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { PageSpinner } from '@components/ui/Spinner';

// Require authentication
export const RequireAuth = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  if (loading) return <PageSpinner />;
  if (!isAuthenticated) return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  return children;
};

// Require admin role
export const RequireAdmin = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();
  if (loading) return <PageSpinner />;
  if (!isAuthenticated) return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};

// Redirect already-logged-in users away from auth pages
export const RequireGuest = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <PageSpinner />;
  if (isAuthenticated) return <Navigate to={isAdmin ? '/admin/dashboard' : '/'} replace />;
  return children;
};

// Redirect admin to dashboard if setup is already done
export const RequireSetup = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <PageSpinner />;
  if (!isAuthenticated || !isAdmin) return <Navigate to="/login" replace />;
  return children;
};
