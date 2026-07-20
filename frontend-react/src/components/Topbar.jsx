import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Topbar({ onMenuToggle, onNotifications }) {
  const { user, role, logout } = useAuth();
  const [searchFocused, setSearchFocused] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [theme, setTheme] = useState(() => (localStorage.getItem('sf_theme') === 'light' ? 'light' : 'dark'));
  useEffect(() => {
    if (theme === 'light') document.documentElement.classList.add('theme-light');
    else document.documentElement.classList.remove('theme-light');
    localStorage.setItem('sf_theme', theme);
  }, [theme]);

  const roleConfig = {
    worker: { label: 'Worker', color: '#0066FF' },
    manager: { label: 'Manager', color: '#A78BFA' },
    admin: { label: 'Admin', color: '#00D68F' },
  };
  const roleInfo = roleConfig[role] || roleConfig.worker;

  const formatTime = (d) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  const formatDate = (d) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  const name = user?.full_name || 'User';

  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-3 px-4 lg:px-6 py-3 transition-all duration-300"
      style={{
        background: 'rgba(7, 26, 47, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 102, 255, 0.06)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.15)',
      }}
    >
      {/* Mobile menu */}
      <button onClick={onMenuToggle} className="btn-icon lg:hidden">
        <i className="fas fa-bars text-sm" />
      </button>

      {/* Factory name - desktop */}
      <div className="hidden lg:flex items-center gap-3 mr-4">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(0, 102, 255, 0.15), rgba(0, 229, 255, 0.1))' }}>
          <i className="fas fa-industry text-xs" style={{ color: '#0066FF' }} />
        </div>
        <div>
          <div className="text-xs font-bold text-white tracking-tight">Smart Factory</div>
          <div className="text-[9px] font-medium" style={{ color: '#556677' }}>Industry 4.0 Platform</div>
        </div>
      </div>

      {/* Search */}
      <div className={`flex-1 max-w-lg transition-all duration-300 ${searchFocused ? 'max-w-xl' : ''}`}>
        <div className="relative">
          <i className={`fas fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-xs transition-colors duration-200 ${searchFocused ? 'text-[#0066FF]' : '#556677'}`} style={{ color: searchFocused ? '#0066FF' : '#556677' }} />
          <input
            placeholder="Search machines, workers, production..."
            className="input !pl-10 !py-2.5 !rounded-xl text-xs"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={searchFocused ? {
              borderColor: 'rgba(0, 102, 255, 0.3)',
              boxShadow: '0 0 0 3px rgba(0, 102, 255, 0.06), 0 0 20px rgba(0, 102, 255, 0.05)',
              background: 'rgba(255, 255, 255, 0.05)',
            } : {}}
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] px-1.5 py-0.5 rounded font-mono" style={{ background: 'rgba(255, 255, 255, 0.04)', color: '#556677', border: '1px solid rgba(255,255,255,0.06)' }}>
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Live clock */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="w-1.5 h-1.5 rounded-full bg-[#00D68F] animate-pulse" />
          <span className="text-[10px] font-mono font-medium text-[#8899AA]">{formatTime(currentTime)}</span>
        </div>

        {/* Date - desktop */}
        <div className="hidden xl:block text-[10px] font-medium text-[#556677]">
          {formatDate(currentTime)}
        </div>

        {/* AI Assistant */}
        <button
          className="btn-icon relative"
          title="AI Assistant"
        >
          <i className="fas fa-wand-magic-sparkles text-sm" style={{ color: '#A78BFA' }} />
          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full" style={{ background: 'linear-gradient(135deg, #A78BFA, #7C3AED)' }} />
        </button>

        {/* Notifications */}
        <button onClick={onNotifications} className="btn-icon relative" title="Notifications">
          <i className="fas fa-bell text-sm" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full animate-pulse" style={{ background: '#FF4757', boxShadow: '0 0 8px rgba(255, 71, 87, 0.5)' }} />
        </button>

        {/* Messages */}
        <button className="btn-icon relative" title="Messages">
          <i className="fas fa-message text-sm" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full" style={{ background: '#00E5FF', boxShadow: '0 0 8px rgba(0, 229, 255, 0.5)' }}>3</span>
        </button>

        {/* Dark / Light toggle */}
        <button className="btn-icon" title="Toggle Theme" onClick={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}>
          <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'} text-sm`} style={{ color: '#FFB340' }} />
        </button>

        {/* Logout */}
        <button className="btn-icon" title="Logout" onClick={logout}>
          <i className="fas fa-right-from-bracket text-sm" style={{ color: '#FF4757' }} />
        </button>

        {/* Role badge */}
        <div
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider"
          style={{
            background: `${roleInfo.color}12`,
            color: roleInfo.color,
            border: `1px solid ${roleInfo.color}20`,
          }}
        >
          <i className={`fas ${role === 'admin' ? 'fa-shield-halved' : role === 'manager' ? 'fa-user-tie' : 'fa-hard-hat'} text-[8px]`} />
          {roleInfo.label}
        </div>

        {/* User profile */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-white/[0.06]">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #0066FF, #0052CC)' }}
          >
            {name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className="hidden md:block">
            <div className="text-xs font-semibold text-white leading-tight">{name}</div>
            <div className="text-[9px] font-medium" style={{ color: '#556677' }}>Online</div>
          </div>
        </div>
      </div>
    </header>
  );
}
