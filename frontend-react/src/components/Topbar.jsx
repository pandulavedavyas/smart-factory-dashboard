import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { seedSteelDemoData } from '../services/firestoreService';

export default function Topbar({ onMenuToggle, onNotifications }) {
  const { user, role, logout } = useAuth();
  const { showToast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [searchFocused, setSearchFocused] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSeedDemoData = async () => {
    setSeeding(true);
    try {
      const res = await seedSteelDemoData(true);
      showToast(`Successfully seeded ${res.workersCount} steel workers & ${res.machinesCount} steel machines into Firestore!`, 'success');
    } catch (err) {
      showToast('Seeding failed: ' + (err.message || err), 'error');
    } finally {
      setSeeding(false);
    }
  };

  const roleConfig = {
    worker: { label: 'Worker', color: 'var(--primary)' },
    manager: { label: 'Manager', color: 'var(--secondary)' },
    admin: { label: 'Admin', color: 'var(--danger)' },
  };
  const roleInfo = roleConfig[role] || roleConfig.worker;

  const formatTime = (d) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  const name = user?.full_name || 'User';

  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-3 px-4 lg:px-6 py-3.5 transition-all duration-300 border-b"
      style={{
        backgroundColor: 'var(--bg-navbar)',
        borderColor: 'var(--border-color)',
        boxShadow: 'var(--card-shadow)',
        color: 'var(--text-main)'
      }}
    >
      {/* Mobile menu */}
      <button onClick={onMenuToggle} className="btn-icon lg:hidden">
        <i className="fas fa-bars text-sm" />
      </button>

      {/* Factory name - desktop */}
      <div className="hidden lg:flex items-center gap-3 mr-4">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ background: 'var(--primary)' }}>
          <i className="fas fa-industry text-xs" />
        </div>
        <div>
          <div className="text-xs font-bold tracking-tight" style={{ color: 'var(--text-main)' }}>AI Smart Factory</div>
          <div className="text-[9px] font-semibold" style={{ color: 'var(--secondary)' }}>Steel Manufacturing Plant</div>
        </div>
      </div>

      {/* Search */}
      <div className={`flex-1 max-w-md transition-all duration-300 ${searchFocused ? 'max-w-lg' : ''}`}>
        <div className="relative">
          <i className="fas fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-xs" style={{ color: searchFocused ? 'var(--primary)' : 'var(--text-secondary)' }} />
          <input
            placeholder="Search workers, machines, zones..."
            className="input !pl-10 !py-2 !rounded-xl text-xs"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2 ml-auto">
        {/* ADMIN SEED DEMO DATA BUTTON */}
        {role === 'admin' && (
          <button
            onClick={handleSeedDemoData}
            disabled={seeding}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all duration-200 shadow-md hover:scale-105"
            style={{
              background: 'var(--success)',
            }}
            title="Automatically insert 50 realistic steel workers and 15 machines into Firestore"
          >
            {seeding ? (
              <>
                <i className="fas fa-spinner fa-spin text-xs" />
                <span>Seeding...</span>
              </>
            ) : (
              <>
                <i className="fas fa-database text-xs" />
                <span>Seed Demo Data</span>
              </>
            )}
          </button>
        )}

        {/* Live clock */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)' }}>
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--success)' }} />
          <span className="text-[10px] font-mono font-medium" style={{ color: 'var(--text-secondary)' }}>{formatTime(currentTime)}</span>
        </div>

        {/* Notifications */}
        <button onClick={onNotifications} className="btn-icon relative" title="Notifications">
          <i className="fas fa-bell text-sm" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--danger)' }} />
        </button>

        {/* Theme toggle */}
        <button className="btn-icon" title="Toggle Theme" onClick={toggleTheme}>
          <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'} text-sm`} style={{ color: 'var(--warning)' }} />
        </button>

        {/* Logout */}
        <button className="btn-icon" title="Logout" onClick={logout}>
          <i className="fas fa-right-from-bracket text-sm" style={{ color: 'var(--danger)' }} />
        </button>

        {/* Role badge */}
        <div
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider"
          style={{
            background: 'var(--input-bg)',
            color: roleInfo.color,
            border: '1px solid var(--border-color)',
          }}
        >
          <i className={`fas ${role === 'admin' ? 'fa-shield-halved' : 'fa-hard-hat'} text-[8px]`} />
          {roleInfo.label}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2.5 pl-2 border-l" style={{ borderColor: 'var(--border-color)' }}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
            style={{ background: 'var(--primary)' }}
          >
            {name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className="hidden md:block">
            <div className="text-xs font-semibold leading-tight" style={{ color: 'var(--text-main)' }}>{name}</div>
            <div className="text-[9px] font-medium" style={{ color: 'var(--text-secondary)' }}>{role === 'admin' ? 'Administrator' : 'Station Worker'}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
