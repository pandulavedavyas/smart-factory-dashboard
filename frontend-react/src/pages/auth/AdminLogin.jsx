import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { resetPassword, signInWithGoogle } from '../../services/authService';
import AuthShell from '../../components/auth/AuthShell';
import { Field } from '../../components/auth/Field';
import { FirebaseSSO } from '../../components/auth/FirebaseSSO';

// HIDDEN ADMIN CONSOLE — Restricted to authorized personnel. ONLY reachable at /admin.
export default function AdminLogin() {
  const [email, setEmail] = useState('admin@smartfactory.com');
  const [password, setPassword] = useState('Admin@123');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const finish = (res) => {
    setLoading(false);
    setGoogleLoading(false);
    if (res.success) {
      showToast('Administrator security clearance granted');
      navigate('/admin/dashboard');
    } else {
      showToast(res.error || 'Admin authentication failed', 'error');
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast('Please enter administrator email', 'error');
      return;
    }
    if (!password.trim()) {
      showToast('Please enter password', 'error');
      return;
    }
    setLoading(true);
    const res = await login({ email: email.trim(), password, rememberMe: remember, role: 'admin' });
    finish(res);
  };

  const google = async () => {
    setGoogleLoading(true);
    const res = await signInWithGoogle('admin');
    finish(res);
  };

  const forgot = async () => {
    if (!email) { showToast('Enter admin email first', 'error'); return; }
    const r = await resetPassword(email);
    showToast(r.method === 'firebase' ? 'Password reset link sent to admin inbox.' : 'Simulated reset email sent.', 'info');
  };

  return (
    <AuthShell
      accent="#FF4757"
      gradient={['#FF4757', '#A78BFA']}
      logoIcon="fa-shield-halved"
      label="RESTRICTED ADMIN CONSOLE"
      title="Admin Portal"
      subtitle="Steel Manufacturing Control · Authorized Personnel Only"
      variant="admin"
    >
      <div className="mb-5">
        <FirebaseSSO onClick={google} loading={googleLoading} />
      </div>

      <div className="flex items-center gap-3 my-5">
        <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: '#556677' }}>or admin email</span>
        <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.08)' }} />
      </div>

      <form onSubmit={submit} className="space-y-4">
        <Field 
          label="Admin Email" 
          type="email" 
          icon="fa-user-shield" 
          placeholder="admin@smartfactory.com"
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
          autoComplete="email" 
        />
        <Field 
          label="Password" 
          type="password" 
          icon="fa-key" 
          placeholder="Admin@123"
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
          autoComplete="current-password" 
        />

        <div className="flex items-center justify-between text-xs" style={{ color: '#8899AA' }}>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input 
              type="checkbox" 
              className="rounded bg-white/[0.04] border-white/[0.08] text-[#FF4757] focus:ring-0"
              checked={remember} 
              onChange={(e) => setRemember(e.target.checked)} 
            />
            Remember me
          </label>
          <button type="button" onClick={forgot} className="hover:underline" style={{ color: '#FFB340' }}>Forgot password?</button>
        </div>

        <button 
          type="submit" 
          disabled={loading || googleLoading}
          className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all duration-300 disabled:opacity-60 hover:-translate-y-0.5 flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #FF4757, #A78BFA)', boxShadow: '0 8px 30px rgba(255,71,87,0.25)' }}
        >
          {loading ? (
            <><i className="fas fa-spinner fa-spin text-sm" />Verifying Clearance…</>
          ) : (
            <><i className="fas fa-lock text-sm" />Secure Sign In</>
          )}
        </button>
      </form>

      <p className="text-center text-[10px] mt-5" style={{ color: '#556677' }}>
        <i className="fas fa-lock mr-1" style={{ color: '#FF4757' }} />
        Monitored security gateway. Unauthorized attempts will be logged.
      </p>
    </AuthShell>
  );
}
