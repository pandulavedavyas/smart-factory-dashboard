import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AccessDenied from '../pages/AccessDenied';

function FullScreenLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#071A2F' }}>
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-[rgba(0,102,255,0.1)]" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#0066FF] animate-spin" />
      </div>
    </div>
  );
}

// Standard authenticated area. `allow` lists the roles permitted to enter.
export function ProtectedRoute({ allow = ['worker', 'manager', 'admin'], children }) {
  const { isAuthenticated, role, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allow.length && !allow.includes(role)) {
    return role === 'admin' ? <Navigate to="/admin/dashboard" replace /> : <AccessDenied />;
  }
  return children;
}

// Admin-only area. Hidden from the UI — only reachable via /admin after auth.
export function AdminRoute({ children }) {
  const { isAuthenticated, role, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!isAuthenticated) return <Navigate to="/admin" replace />;
  if (role !== 'admin') return <AccessDenied />;
  return children;
}

// Public only (login pages). Redirects already-authenticated users home.
export function PublicOnlyRoute({ children }) {
  const { isAuthenticated, role, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (isAuthenticated) {
    return <Navigate to={role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
  }
  return children;
}
