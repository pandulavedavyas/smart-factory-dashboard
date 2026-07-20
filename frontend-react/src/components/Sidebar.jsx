import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { id: 'dashboard', icon: 'fa-table-columns', label: 'Dashboard', roles: ['worker', 'admin'] },
  { id: 'workers', icon: 'fa-users', label: 'Workers', roles: ['admin'] },
  { id: 'machinery', icon: 'fa-gears', label: 'Machines', roles: ['admin'] },
  { id: 'production', icon: 'fa-industry', label: 'Production', roles: ['admin'] },
  { id: 'reports', icon: 'fa-file-invoice', label: 'Reports', roles: ['admin'] },
  { id: 'notifications', icon: 'fa-bell', label: 'Notifications', roles: ['worker', 'admin'] },
  { id: 'settings', icon: 'fa-gear', label: 'Settings', roles: ['admin'] }
];

export default function Sidebar({ currentPage, onNavigate, open, onClose, collapsed, onToggleCollapse }) {
  const { user, role, logout } = useAuth();
  const name = user?.full_name || 'Smart Worker';
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2);
  const [hoveredItem, setHoveredItem] = useState(null);

  const sidebarWidth = collapsed ? 'w-[72px]' : 'w-64';

  const filteredItems = NAV_ITEMS.filter(item => item.roles.includes(role));

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`fixed top-0 left-0 h-full z-50 flex flex-col overflow-hidden transition-all duration-300 ease-in-out lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        } ${sidebarWidth}`}
        style={{
          background: 'linear-gradient(180deg, rgba(10, 22, 38, 0.98) 0%, rgba(5, 12, 22, 0.99) 100%)',
          borderRight: '1px solid rgba(0, 102, 255, 0.08)',
          backdropFilter: 'blur(30px)',
        }}
      >
        {/* Glow Top Line */}
        <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: 'linear-gradient(90deg, transparent, rgba(0, 102, 255, 0.4), rgba(0, 229, 255, 0.2), transparent)' }} />

        {/* Logo */}
        <div className={`flex items-center gap-3 p-4 border-b border-white/[0.04] ${collapsed ? 'justify-center px-3' : ''}`}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 relative" style={{ background: 'linear-gradient(135deg, #0066FF, #0052CC)' }}>
            <i className="fas fa-microchip text-sm" />
            <div className="absolute inset-0 rounded-xl" style={{ boxShadow: '0 0 20px rgba(0, 102, 255, 0.4)' }} />
          </div>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-w-0">
              <h3 className="text-sm font-bold text-white tracking-tight uppercase">AI Smart Factory</h3>
              <small className="text-[10px] font-semibold tracking-wider" style={{ color: '#00E5FF' }}>INDUSTRY 4.0</small>
            </motion.div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {filteredItems.map(item => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); onClose(); }}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`w-full flex items-center gap-3 rounded-xl text-sm font-semibold transition-all duration-300 relative ${
                  collapsed ? 'justify-center px-2 py-3.5' : 'px-4 py-3'
                } ${
                  isActive
                    ? 'text-white'
                    : 'text-[#8899AA] hover:text-white'
                }`}
                title={collapsed ? item.label : undefined}
                style={isActive ? {
                  background: 'linear-gradient(135deg, rgba(0, 102, 255, 0.18), rgba(0, 229, 255, 0.06))',
                  border: '1px solid rgba(0, 102, 255, 0.15)',
                  boxShadow: '0 4px 20px rgba(0, 102, 255, 0.1)',
                } : hoveredItem === item.id ? {
                  background: 'rgba(255, 255, 255, 0.04)',
                } : {
                  border: '1px solid transparent'
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full"
                    style={{ background: 'linear-gradient(180deg, #0066FF, #00E5FF)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <i className={`fas ${item.icon} w-5 text-center text-base ${isActive ? 'text-[#00E5FF]' : ''}`} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Collapse toggle (desktop only) */}
        <div className="hidden lg:flex justify-center py-3 border-t border-white/[0.04]">
          <button
            onClick={onToggleCollapse}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-white/[0.04]"
            style={{ color: '#556677' }}
          >
            <i className={`fas ${collapsed ? 'fa-angles-right' : 'fa-angles-left'} text-xs`} />
          </button>
        </div>

        {/* User profile */}
        <div className={`flex items-center gap-3 p-3 border-t border-white/[0.04] ${collapsed ? 'justify-center px-2' : ''}`}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-extrabold flex-shrink-0" style={{ background: 'linear-gradient(135deg, rgba(0, 102, 255, 0.25), rgba(0, 229, 255, 0.15))', color: '#00E5FF', border: '1px solid rgba(0, 229, 255, 0.2)' }}>
            {initials}
          </div>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white truncate">{name}</div>
              <small className="text-[9px] uppercase tracking-wider font-extrabold" style={{ color: role === 'admin' ? '#FF4757' : '#00D68F' }}>{role}</small>
            </motion.div>
          )}
          {!collapsed && (
            <button
              onClick={logout}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-[rgba(255,71,87,0.12)] text-[#556677] hover:text-[#FF4757]"
              title="Logout"
            >
              <i className="fas fa-right-from-bracket text-xs" />
            </button>
          )}
        </div>
      </motion.aside>
    </>
  );
}
