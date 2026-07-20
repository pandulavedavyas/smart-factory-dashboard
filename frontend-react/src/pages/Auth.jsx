import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Auth() {
  const [tab, setTab] = useState('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(loginEmail, loginPassword, { rememberMe });
    setLoading(false);
    if (result.success) { showToast('Login successful!'); navigate('/dashboard'); }
    else showToast(result.error, 'error');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await register(regName, regEmail, regPassword, { rememberMe });
    setLoading(false);
    if (result.success) { showToast('Account created. Check email verification in Firebase if enabled.'); navigate('/dashboard'); }
    else showToast(result.error, 'error');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background: '#071A2F' }}>
      {/* Background */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(0,102,255,0.06) 0%, transparent 60%), radial-gradient(ellipse at 70% 20%, rgba(167,139,250,0.04) 0%, transparent 50%)' }} />
      <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(0,102,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,102,255,0.02) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #0066FF, #0052CC)', boxShadow: '0 8px 30px rgba(0, 102, 255, 0.3)' }}>
            <i className="fas fa-industry" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">AI Smart Factory</h1>
          <p className="text-sm mt-1" style={{ color: '#556677' }}>Manufacturing Analytics Platform</p>
        </div>

        <div className="glass-card-premium" style={{ padding: '28px' }}>
          <div className="flex gap-1 p-1 rounded-xl mb-6" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <button onClick={() => setTab('login')}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
              style={tab === 'login' ? { background: 'rgba(0,102,255,0.15)', color: '#0066FF' } : { color: '#556677' }}>
              Sign In
            </button>
            <button onClick={() => setTab('register')}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
              style={tab === 'register' ? { background: 'rgba(0,102,255,0.15)', color: '#0066FF' } : { color: '#556677' }}>
              Register
            </button>
          </div>

          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: '#556677' }}>Email</label>
                <input type="email" className="input" placeholder="admin@factory.com" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: '#556677' }}>Password</label>
                <input type="password" className="input" placeholder="••••••••" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
              </div>
              <div className="flex items-center justify-between gap-3 text-xs" style={{ color: '#556677' }}>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                  Remember me
                </label>
                <a href="mailto:support@factory.local?subject=Password%20Reset" className="hover:underline" style={{ color: '#0066FF' }}>
                  Forgot password?
                </a>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? <><i className="fas fa-spinner animate-spin mr-2" /></> : <><i className="fas fa-right-to-bracket mr-2" /></>}Sign In
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: '#556677' }}>Full Name</label>
                <input className="input" placeholder="John Doe" value={regName} onChange={e => setRegName(e.target.value)} required />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: '#556677' }}>Email</label>
                <input type="email" className="input" placeholder="new@factory.com" value={regEmail} onChange={e => setRegEmail(e.target.value)} required />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: '#556677' }}>Password</label>
                <input type="password" className="input" placeholder="Create password" value={regPassword} onChange={e => setRegPassword(e.target.value)} required />
              </div>
              <div className="flex items-center justify-between gap-3 text-xs" style={{ color: '#556677' }}>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                  Keep me signed in
                </label>
                <span>Email verification is handled through Firebase when configured.</span>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? <><i className="fas fa-spinner animate-spin mr-2" /></> : <><i className="fas fa-user-plus mr-2" /></>}Create Account
              </button>
            </form>
          )}

          <p className="text-center text-xs mt-6">
            <Link to="/" style={{ color: '#0066FF' }} className="hover:underline"><i className="fas fa-arrow-left mr-1" />Back to home</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
