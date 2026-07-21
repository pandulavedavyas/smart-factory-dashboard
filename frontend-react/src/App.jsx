import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import { ProtectedRoute, AdminRoute, PublicOnlyRoute } from './routes/guards';

const Landing = lazy(() => import('./pages/Landing'));
const WorkerLogin = lazy(() => import('./pages/auth/WorkerLogin'));
const AdminLogin = lazy(() => import('./pages/auth/AdminLogin'));
const AccessDenied = lazy(() => import('./pages/AccessDenied'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ManufacturingWorkflow = lazy(() => import('./pages/ManufacturingWorkflow'));
const AIAssistant = lazy(() => import('./pages/AIAssistant'));
const Workers = lazy(() => import('./pages/Workers'));
const Machinery = lazy(() => import('./pages/Machinery'));
const Production = lazy(() => import('./pages/Production'));
const Materials = lazy(() => import('./pages/Materials'));
const Reports = lazy(() => import('./pages/Reports'));
const Users = lazy(() => import('./pages/Users'));
const Settings = lazy(() => import('./pages/Settings'));
const Notifications = lazy(() => import('./pages/Notifications'));

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#071A2F' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-[rgba(0,102,255,0.1)]" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#0066FF] animate-spin" />
        </div>
        <div className="text-xs font-medium animate-pulse" style={{ color: '#8899AA' }}>Loading Factory Systems…</div>
      </div>
    </div>
  );
}

const PAGE_MAP = {
  dashboard: Dashboard,
  workflow: ManufacturingWorkflow,
  'ai-assistant': AIAssistant,
  workers: Workers,
  machinery: Machinery,
  production: Production,
  inventory: Materials,
  reports: Reports,
  analytics: Reports,
  users: Users,
  settings: Settings,
  notifications: Notifications
};

const ROLE_PERMISSIONS = {
  admin: ['dashboard', 'workflow', 'ai-assistant', 'workers', 'machinery', 'production', 'inventory', 'reports', 'analytics', 'users', 'settings', 'notifications'],
  worker: ['dashboard', 'workflow', 'ai-assistant', 'workers', 'machinery', 'production', 'inventory', 'reports', 'analytics', 'users', 'settings', 'notifications']
};

function DashboardRouter({ base = '/admin/dashboard', mode }) {
  const { page } = useParams();
  const [currentPage, setCurrentPage] = useState(page || 'dashboard');
  const navigate = useNavigate();
  const { role } = useAuth();

  useEffect(() => {
    const p = page || 'dashboard';
    if (PAGE_MAP[p]) {
      setCurrentPage(p);
    } else {
      setCurrentPage('dashboard');
    }
  }, [page]);

  const handleNavigate = (p) => {
    setCurrentPage(p);
    navigate(`${base}/${p}`);
  };

  const PageComponent = PAGE_MAP[currentPage] || Dashboard;
  return (
    <Layout currentPage={currentPage} onNavigate={handleNavigate} base={base} mode={mode}>
      <Suspense fallback={
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-10 h-10 rounded-full border-2 border-[rgba(0,102,255,0.1)] border-t-[#0066FF] animate-spin" />
        </div>
      }>
        <PageComponent mode={mode} />
      </Suspense>
    </Layout>
  );
}

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<Landing />} />

        {/* Worker Portal & Admin Login Pages */}
        <Route path="/login" element={<WorkerLogin />} />
        <Route path="/admin" element={<AdminLogin />} />

        {/* Direct Accessible Dashboards */}
        <Route path="/dashboard" element={<DashboardRouter base="/dashboard" mode="worker" />} />
        <Route path="/dashboard/:page" element={<DashboardRouter base="/dashboard" mode="worker" />} />

        <Route path="/admin/dashboard" element={<DashboardRouter base="/admin/dashboard" mode="admin" />} />
        <Route path="/admin/dashboard/:page" element={<DashboardRouter base="/admin/dashboard" mode="admin" />} />

        {/* Wildcards */}
        <Route path="/access-denied" element={<AccessDenied />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}
