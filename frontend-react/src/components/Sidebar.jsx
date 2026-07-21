import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { id: 'dashboard', icon: 'fa-table-columns', label: 'Dashboard', roles: ['worker', 'admin'] },
  { id: 'workflow', icon: 'fa-diagram-project', label: 'Manufacturing Workflow', roles: ['worker', 'admin'] },
  { id: 'machinery', icon: 'fa-gears', label: 'Machines', roles: ['admin'] },
  { id: 'workers', icon: 'fa-users', label: 'Workers', roles: ['admin'] },
  { id: 'production', icon: 'fa-industry', label: 'Production', roles: ['admin'] },
  { id: 'inventory', icon: 'fa-boxes-stacked', label: 'Inventory', roles: ['admin'] },
  { id: 'ai-assistant', icon: 'fa-robot', label: 'AI Assistant', roles: ['worker', 'admin'] },
  { id: 'reports', icon: 'fa-file-invoice', label: 'Reports', roles: ['admin'] },
  { id: 'users', icon: 'fa-user-gear', label: 'User Management', roles: ['admin'] },
  { id: 'notifications', icon: 'fa-bell', label: 'Notifications', roles: ['worker', 'admin'] },
  { id: 'settings', icon: 'fa-gear', label: 'Settings', roles: ['admin'] }
];

export default function Sidebar({ currentPage, onNavigate, open, onClose, collapsed, onToggleCollapse }) {
  const { user, role, logout } = useAuth();
  const name = user?.full_name || 'Worker';
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
          backgroundColor: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border-color)',
          boxShadow: 'var(--card-shadow)'
        }}
      >
        {/* Glow Top Line */}
        <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: 'linear-gradient(90deg, transparent, var(--primary), var(--secondary), transparent)' }} />

        {/* Logo */}
        <div className={`flex items-center gap-3 p-4 border-b ${collapsed ? 'justify-center px-3' : ''}`} style={{ borderColor: 'var(--border-color)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 relative" style={{ background: 'var(--primary)' }}>
            <i className="fas fa-microchip text-sm" />
          </div>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-w-0">
              <h3 className="text-sm font-bold tracking-tight uppercase" style={{ color: 'var(--text-main)' }}>AI Smart Factory</h3>
              <small className="text-[9px] font-semibold tracking-wider" style={{ color: 'var(--secondary)' }}>STEEL PLANT</small>
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
                className={`w-full flex items-center gap-3 rounded-xl text-sm font-semibold transition-all duration-200 relative ${
                  collapsed ? 'justify-center px-2 py-3.5' : 'px-4 py-3'
                }`}
                title={collapsed ? item.label : undefined}
                style={isActive ? {
                  background: 'var(--primary)',
                  color: '#FFFFFF',
                  boxShadow: '0 4px 15px var(--glow-primary)',
                } : hoveredItem === item.id ? {
                  background: 'var(--hover-bg)',
                  color: 'var(--text-main)',
                } : {
                  color: 'var(--text-secondary)',
                  background: 'transparent'
                }}
              >
                <i className={`fas ${item.icon} w-5 text-center text-base`} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Collapse toggle (desktop only) */}
        <div className="hidden lg:flex justify-center py-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <button
            onClick={onToggleCollapse}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200"
            style={{ color: 'var(--text-secondary)', background: 'var(--input-bg)' }}
          >
            <i className={`fas ${collapsed ? 'fa-angles-right' : 'fa-angles-left'} text-xs`} />
          </button>
        </div>

        {/* User profile */}
        <div className={`flex items-center gap-3 p-3 border-t ${collapsed ? 'justify-center px-2' : ''}`} style={{ borderColor: 'var(--border-color)' }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-extrabold flex-shrink-0 text-white" style={{ background: 'var(--primary)' }}>
            {initials}
          </div>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 min-w-0">
              <div className="text-xs font-bold truncate" style={{ color: 'var(--text-main)' }}>{name}</div>
              <small className="text-[9px] uppercase tracking-wider font-extrabold" style={{ color: role === 'admin' ? 'var(--danger)' : 'var(--success)' }}>{role}</small>
            </motion.div>
          )}
          {!collapsed && (
            <button
              onClick={logout}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200"
              style={{ color: 'var(--text-secondary)', background: 'var(--input-bg)' }}
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
