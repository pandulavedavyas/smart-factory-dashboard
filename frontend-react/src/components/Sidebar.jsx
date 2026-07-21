import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const NAV_GROUPS = [
  {
    title: 'FACTORY',
    items: [
      { id: 'dashboard', icon: 'fa-table-columns', label: 'Dashboard', roles: ['worker', 'admin'] },
      { id: 'workflow', icon: 'fa-diagram-project', label: 'Manufacturing Workflow', roles: ['worker', 'admin'] },
      { id: 'machinery', icon: 'fa-gears', label: 'Machines', roles: ['admin'] },
    ]
  },
  {
    title: 'MANAGEMENT',
    items: [
      { id: 'workers', icon: 'fa-users', label: 'Workers', roles: ['admin'] },
      { id: 'inventory', icon: 'fa-boxes-stacked', label: 'Inventory', roles: ['admin'] },
      { id: 'users', icon: 'fa-user-gear', label: 'User Management', roles: ['admin'] },
    ]
  },
  {
    title: 'ANALYTICS',
    items: [
      { id: 'ai-assistant', icon: 'fa-robot', label: 'AI Assistant', roles: ['worker', 'admin'] },
      { id: 'analytics', icon: 'fa-chart-line', label: 'Telemetry Insights', roles: ['admin'] },
    ]
  },
  {
    title: 'REPORTS',
    items: [
      { id: 'reports', icon: 'fa-file-invoice', label: 'Reports & Audits', roles: ['admin'] },
      { id: 'notifications', icon: 'fa-bell', label: 'Notifications', roles: ['worker', 'admin'] },
    ]
  },
  {
    title: 'SETTINGS',
    items: [
      { id: 'settings', icon: 'fa-gear', label: 'Platform Settings', roles: ['admin'] }
    ]
  }
];

export default function Sidebar({ currentPage, onNavigate, open, onClose, collapsed, onToggleCollapse }) {
  const { user, role, logout } = useAuth();
  const name = user?.full_name || 'Plant Operator';
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2);
  const [hoveredItem, setHoveredItem] = useState(null);

  const sidebarWidth = collapsed ? 'w-[80px]' : 'w-[280px]';

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
        {/* Top Header Logo */}
        <div className={`h-[80px] flex items-center gap-3 px-5 border-b flex-shrink-0 ${collapsed ? 'justify-center px-3' : ''}`} style={{ borderColor: 'var(--border-color)' }}>
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white flex-shrink-0 relative shadow-lg" style={{ background: 'linear-gradient(135deg, #2563EB, #1D4ED8)' }}>
            <i className="fas fa-industry text-base" />
          </div>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-w-0">
              <h3 className="text-sm font-extrabold tracking-tight uppercase" style={{ color: 'var(--text-main)' }}>Tata-JSW Steel</h3>
              <small className="text-[10px] font-bold uppercase tracking-wider block mt-0.5" style={{ color: 'var(--secondary-blue)' }}>Smart Manufacturing</small>
            </motion.div>
          )}
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-6">
          {NAV_GROUPS.map((group, gIdx) => {
            const filteredGroupItems = group.items.filter(item => item.roles.includes(role));
            if (filteredGroupItems.length === 0) return null;

            return (
              <div key={gIdx} className="space-y-1">
                {!collapsed && (
                  <h4 className="px-4 text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>
                    {group.title}
                  </h4>
                )}
                {filteredGroupItems.map(item => {
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { onNavigate(item.id); onClose(); }}
                      onMouseEnter={() => setHoveredItem(item.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className={`w-full flex items-center gap-3.5 rounded-xl text-sidebar-label transition-all duration-200 relative ${
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
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-pill"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-white"
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                      <i className={`fas ${item.icon} w-5 text-center text-base`} />
                      {!collapsed && <span>{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Collapse button for Desktop */}
        <div className="hidden lg:flex justify-center py-2.5 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <button
            onClick={onToggleCollapse}
            className="w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-200"
            style={{ color: 'var(--text-secondary)', background: 'var(--input-bg)' }}
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <i className={`fas ${collapsed ? 'fa-angles-right' : 'fa-angles-left'} text-xs`} />
          </button>
        </div>

        {/* Fixed User Profile at Bottom */}
        <div className={`p-4 border-t flex items-center gap-3 flex-shrink-0 ${collapsed ? 'justify-center px-2' : ''}`} style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-bold text-white shadow-md flex-shrink-0" style={{ background: 'linear-gradient(135deg, #2563EB, #1D4ED8)' }}>
            {initials}
          </div>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 min-w-0">
              <div className="text-xs font-bold truncate" style={{ color: 'var(--text-main)' }}>{name}</div>
              <small className="text-[9px] uppercase tracking-wider font-extrabold" style={{ color: role === 'admin' ? 'var(--danger)' : 'var(--success)' }}>
                {role === 'admin' ? 'Administrator' : 'Station Worker'}
              </small>
            </motion.div>
          )}
          {!collapsed && (
            <button
              onClick={logout}
              className="w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-200 hover:bg-red-500/10 text-red-500"
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
