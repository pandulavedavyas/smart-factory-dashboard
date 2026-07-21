import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';

export default function Topbar({ onMenuToggle, onNotifications }) {
  const { user, role, logout } = useAuth();
  const { showToast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [searchFocused, setSearchFocused] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const roleConfig = {
    worker: { label: 'Station Operator', color: 'var(--primary-blue)' },
    admin: { label: 'Plant Administrator', color: 'var(--danger)' },
  };
  const roleInfo = roleConfig[role] || roleConfig.worker;

  const formatTime = (d) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  const name = user?.full_name || 'Plant Operator';
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2);

  return (
    <header
      className="sticky top-0 z-30 h-[80px] flex items-center gap-4 px-6 transition-all duration-300 border-b"
      style={{
        backgroundColor: 'var(--bg-navbar)',
        borderColor: 'var(--border-color)',
        boxShadow: 'var(--card-shadow)',
        color: 'var(--text-main)'
      }}
    >
      {/* Mobile Menu Trigger */}
      <button onClick={onMenuToggle} className="btn-icon-saas lg:hidden">
        <i className="fas fa-bars text-sm" />
      </button>

      {/* Enterprise Title - Desktop */}
      <div className="hidden lg:flex items-center gap-3 mr-4">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md" style={{ background: 'var(--primary-blue)' }}>
          <i className="fas fa-industry text-sm" />
        </div>
        <div>
          <h2 className="text-sm font-extrabold tracking-tight uppercase" style={{ color: 'var(--text-main)' }}>Tata-JSW Steel Platform</h2>
          <span className="text-[10px] font-semibold tracking-wider uppercase block" style={{ color: 'var(--secondary-blue)' }}>Plant Operations Portal</span>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className={`flex-1 max-w-md transition-all duration-300 ${searchFocused ? 'max-w-lg' : ''}`}>
        <div className="relative">
          <i className="fas fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-xs" style={{ color: searchFocused ? 'var(--primary-blue)' : 'var(--text-secondary)' }} />
          <input
            placeholder="Search equipment, heat numbers, operators..."
            className="input-saas !pl-10 !py-2.5 !rounded-xl text-xs"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>
      </div>

      {/* Right Navigation Actions */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Active Shift Indicator */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-2 rounded-xl border" style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)' }}>
          <i className="fas fa-clock-rotate-left text-xs" style={{ color: 'var(--primary-blue)' }} />
          <div>
            <span className="text-[9px] font-extrabold uppercase tracking-widest block leading-none" style={{ color: 'var(--text-secondary)' }}>Shift</span>
            <span className="text-[11px] font-bold" style={{ color: 'var(--text-main)' }}>Morning (06:00 - 14:00)</span>
          </div>
        </div>

        {/* Real-time Clock */}
        <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl border" style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)' }}>
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--success)' }} />
          <span className="text-xs font-mono font-bold" style={{ color: 'var(--text-main)' }}>{formatTime(currentTime)}</span>
        </div>

        {/* Notification Counter Bell */}
        <button onClick={onNotifications} className="btn-icon-saas relative" title="Notifications">
          <i className="fas fa-bell text-sm" />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: 'var(--danger)' }} />
        </button>

        {/* Theme Toggle Button */}
        <button className="btn-icon-saas" title="Toggle Theme" onClick={toggleTheme}>
          <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'} text-sm`} style={{ color: 'var(--warning)' }} />
        </button>

        {/* User Profile Info */}
        <div className="flex items-center gap-3 pl-3 border-l" style={{ borderColor: 'var(--border-color)' }}>
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-bold text-white shadow-md" style={{ background: 'var(--primary-blue)' }}>
            {initials}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-bold leading-tight" style={{ color: 'var(--text-main)' }}>{name}</div>
            <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: roleInfo.color }}>{roleInfo.label}</div>
          </div>
        </div>

        {/* Quick Logout */}
        <button className="btn-icon-saas" title="Logout" onClick={logout}>
          <i className="fas fa-right-from-bracket text-sm" style={{ color: 'var(--danger)' }} />
        </button>
      </div>
    </header>
  );
}
