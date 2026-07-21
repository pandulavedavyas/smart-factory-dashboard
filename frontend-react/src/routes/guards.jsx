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

// Standard authenticated area. Allows direct access to dashboard components.
export function ProtectedRoute({ children }) {
  return children;
}

// Admin-only area. Direct access allowed.
export function AdminRoute({ children }) {
  return children;
}

// Public only (login pages). Redirects directly to the main dashboard.
export function PublicOnlyRoute({ children }) {
  return <Navigate to="/admin/dashboard" replace />;
}
