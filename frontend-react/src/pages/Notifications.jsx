import { motion } from 'framer-motion';

const defaultNotifications = [
  { 
    color: 'var(--danger)', 
    title: 'Machine temperature high', 
    desc: 'CNC Lathe A1 core temperature reached 76.5°C (Warning Threshold: 75°C). Reducing workload velocity.', 
    time: '5 mins ago', 
    icon: 'fa-temperature-high', 
    severity: 'critical' 
  },
  { 
    color: 'var(--danger)', 
    title: 'Machine stopped', 
    desc: 'Press P2 status changed to Offline. Emergency stop triggered due to hydraulic pressure decay.', 
    time: '20 mins ago', 
    icon: 'fa-triangle-exclamation', 
    severity: 'critical' 
  },
  { 
    color: 'var(--warning)', 
    title: 'Worker absent', 
    desc: 'Operator David Martinez is marked offline for morning shift. Re-routing line supervisor assignment.', 
    time: '1 hour ago', 
    icon: 'fa-user-xmark', 
    severity: 'warning' 
  },
  { 
    color: 'var(--warning)', 
    title: 'Low inventory', 
    desc: 'Supply level alert: Cutting Insert stock level at 12 units (Minimum safety buffer: 20 units).', 
    time: '3 hours ago', 
    icon: 'fa-boxes-stacked', 
    severity: 'warning' 
  },
  { 
    color: 'var(--primary)', 
    title: 'Maintenance due', 
    desc: 'Scheduled machinery maintenance due for Laser Cutter L1 in 12 running operating hours.', 
    time: '5 hours ago', 
    icon: 'fa-screwdriver-wrench', 
    severity: 'info' 
  },
  { 
    color: 'var(--success)', 
    title: 'Daily report compiled', 
    desc: 'Operations ledger and shift yield calculations for 2026-07-20 generated successfully.', 
    time: '8 hours ago', 
    icon: 'fa-file-invoice', 
    severity: 'success' 
  }
];

export default function Notifications() {
  return (
    <div className="space-y-6">
      {/* Title */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold tracking-tight uppercase" style={{ color: 'var(--text-main)' }}>System Notification Ledger</h1>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Real-time hardware status indicators and workforce scheduling alerts.</p>
      </motion.div>

      {/* List Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.1 }} 
        className="glass-card-premium p-6"
      >
        <div className="space-y-1">
          {defaultNotifications.map((n, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="flex items-start gap-4 py-4 transition-all duration-300 rounded-xl px-2 border-b"
              style={{ borderColor: 'var(--border-color)' }}
            >
              {/* Alert icon wrapper */}
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" 
                style={{ 
                  background: 'var(--input-bg)', 
                  border: '1px solid var(--border-color)',
                }}
              >
                <i className={`fas ${n.icon} text-xs`} style={{ color: n.color }} />
              </div>
              
              {/* Alert Text Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>{n.title}</span>
                  {n.severity === 'critical' && (
                    <span className="text-[8px] font-extrabold px-2 py-0.5 rounded tracking-widest uppercase" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
                      CRITICAL
                    </span>
                  )}
                  {n.severity === 'warning' && (
                    <span className="text-[8px] font-extrabold px-2 py-0.5 rounded tracking-widest uppercase" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
                      WARNING
                    </span>
                  )}
                </div>
                <div className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{n.desc}</div>
                <div className="text-[10px] font-semibold mt-1.5" style={{ color: 'var(--text-secondary)' }}>
                  <i className="far fa-clock mr-1" />
                  {n.time}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
