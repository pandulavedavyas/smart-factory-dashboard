import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { resetPassword } from '../../services/authService';
import AuthShell from '../../components/auth/AuthShell';
import { Field } from '../../components/auth/Field';

export default function WorkerLogin() {
  const [employeeId, setEmployeeId] = useState('EMP1001');
  const [password, setPassword] = useState('worker@123');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotInput, setForgotInput] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (!employeeId.trim()) {
      showToast('Please enter your Employee ID (e.g. EMP1001)', 'error');
      return;
    }
    if (!password.trim()) {
      showToast('Please enter your station password', 'error');
      return;
    }

    setLoading(true);
    const res = await login({ email: employeeId.trim(), password, rememberMe: remember, role: 'worker' });
    setLoading(false);

    if (res.success) {
      showToast(`Welcome back, ${res.user.full_name}! Connected to station telemetry.`);
      navigate('/dashboard');
    } else {
      showToast(res.error || 'Authentication failed. Please verify your Employee ID and password.', 'error');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotInput.trim()) {
      showToast('Please enter your Employee ID or email address.', 'error');
      return;
    }
    setResetLoading(true);
    const res = await resetPassword(forgotInput);
    setResetLoading(false);
    setShowForgotModal(false);
    showToast('Password reset instructions sent to your registered station contact.', 'info');
  };

  return (
    <>
      <AuthShell
        accent="#0066FF"
        gradient={['#0066FF', '#0052CC']}
        logoIcon="fa-hard-hat"
        label="Workforce Station Terminal"
        title="Worker Login"
        subtitle="Steel Manufacturing Plant · Enter your credentials to access your station and shifts"
      >
        <form onSubmit={submit} className="space-y-5">
          <Field 
            label="Employee ID" 
            type="text" 
            icon="fa-id-card-clip" 
            placeholder="e.g. EMP1001"
            value={employeeId} 
            onChange={(e) => setEmployeeId(e.target.value)} 
            required 
            autoComplete="username" 
          />

          <Field 
            label="Password" 
            type="password" 
            icon="fa-lock" 
            placeholder="worker@123"
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
              Remember Login Session
            </label>

            <button
              type="button"
              onClick={() => { setForgotInput(employeeId); setShowForgotModal(true); }}
              className="text-[#00E5FF] hover:underline font-medium text-xs cursor-pointer"
            >
              Forgot Password?
            </button>
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
                <span>Authenticating Station...</span>
              </>
            ) : (
              <>
                <i className="fas fa-right-to-bracket text-sm" />
                <span>Login to Station</span>
              </>
            )}
          </button>
        </form>
      </AuthShell>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-card-premium p-6 w-full max-w-md space-y-4 relative">
            <div className="flex justify-between items-center pb-3 border-b border-white/[0.06]">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Reset Worker Password</h3>
              <button onClick={() => setShowForgotModal(false)} className="text-[#8899AA] hover:text-white">
                <i className="fas fa-times text-sm" />
              </button>
            </div>
            <p className="text-xs" style={{ color: '#8899AA' }}>
              Enter your Employee ID or email to receive password recovery instructions.
            </p>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <Field
                label="Employee ID or Email"
                type="text"
                icon="fa-envelope"
                placeholder="e.g. EMP1001 or emp1001@smartfactory.com"
                value={forgotInput}
                onChange={(e) => setForgotInput(e.target.value)}
                required
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="btn-primary flex-1 py-2.5 text-xs font-bold uppercase"
                >
                  {resetLoading ? 'Sending...' : 'Send Recovery Email'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
