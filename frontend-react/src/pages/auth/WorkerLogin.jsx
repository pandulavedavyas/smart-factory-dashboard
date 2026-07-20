import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import AuthShell from '../../components/auth/AuthShell';
import { Field } from '../../components/auth/Field';

export default function WorkerLogin() {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (!employeeId.trim()) {
      showToast('Please enter your Employee ID', 'error');
      return;
    }
    setLoading(true);
    // Passing employeeId in place of email, authService handles mapping.
    const res = await login({ email: employeeId, password, rememberMe: remember, role: 'worker' });
    setLoading(false);
    
    if (res.success) {
      showToast(`Welcome back, ${res.user.full_name}! Connecting to floor systems...`);
      navigate('/dashboard');
    } else {
      showToast(res.error || 'Worker authentication failed', 'error');
    }
  };

  return (
    <AuthShell
      accent="#0066FF"
      gradient={['#0066FF', '#0052CC']}
      logoIcon="fa-hard-hat"
      label="Workforce Terminal"
      title="Worker Login"
      subtitle="Enter your credentials to access your station and shifts"
    >
      <form onSubmit={submit} className="space-y-5">
        <Field 
          label="Employee ID" 
          type="text" 
          icon="fa-id-card-clip" 
          placeholder="e.g. W-001"
          value={employeeId} 
          onChange={(e) => setEmployeeId(e.target.value)} 
          required 
          autoComplete="username" 
        />
        
        <Field 
          label="Station Password" 
          type="password" 
          icon="fa-lock" 
          placeholder="••••••••"
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
          autoComplete="current-password" 
        />
        
        <div className="flex items-center justify-between text-xs" style={{ color: '#8899AA' }}>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input 
              type="checkbox" 
              className="rounded bg-white/[0.04] border-white/[0.08] text-[#0066FF] focus:ring-0"
              checked={remember} 
              onChange={(e) => setRemember(e.target.checked)} 
            />
            Remember Station ID
          </label>
        </div>
        
        <button 
          type="submit" 
          disabled={loading} 
          className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wider relative overflow-hidden transition-all duration-300 hover:shadow-[0_4px_20px_rgba(0,102,255,0.4)]"
          style={{ background: 'linear-gradient(135deg, #0066FF, #0052CC)' }}
        >
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin text-sm" />
              <span>Verifying station...</span>
            </>
          ) : (
            <>
              <i className="fas fa-right-to-bracket text-sm" />
              <span>Login to Station</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-5 text-center text-xs" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', color: '#556677' }}>
        Looking for the Administrator login? <br/>
        <span style={{ color: '#556677' }}>Access is restricted to local terminal configuration.</span>
      </div>
    </AuthShell>
  );
}
