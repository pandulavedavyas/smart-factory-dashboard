import { motion } from 'framer-motion';

export default function MyShift() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">My Shift</h1>
        <p className="text-xs mt-1" style={{ color: '#8899AA' }}>View your current shift details</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: 'fa-clock', label: 'Shift', value: 'Morning', color: '#0066FF' },
          { icon: 'fa-calendar', label: 'Date', value: new Date().toLocaleDateString(), color: '#00D68F' },
          { icon: 'fa-location-dot', label: 'Location', value: 'Floor A', color: '#A78BFA' },
          { icon: 'fa-hard-hat', label: 'Machine', value: 'CNC Lathe A1', color: '#FFB340' },
        ].map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="glass-card-premium text-center" style={{ padding: '24px' }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: `${item.color}12` }}>
              <i className={`fas ${item.icon} text-lg`} style={{ color: item.color }} />
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#556677' }}>{item.label}</div>
            <div className="text-lg font-extrabold text-white">{item.value}</div>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card-premium" style={{ padding: '24px' }}>
        <h3 className="text-sm font-bold text-white mb-4">Shift Schedule</h3>
        <div className="space-y-2">
          {[
            { time: '6:00 AM - 2:00 PM', label: 'Morning Shift', active: true },
            { time: '2:00 PM - 10:00 PM', label: 'Afternoon Shift', active: false },
            { time: '10:00 PM - 6:00 AM', label: 'Night Shift', active: false },
          ].map((s, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-xl transition-all duration-200"
              style={s.active ? {
                background: 'linear-gradient(135deg, rgba(0,102,255,0.1), rgba(0,229,255,0.03))',
                border: '1px solid rgba(0,102,255,0.15)',
                boxShadow: '0 0 20px rgba(0,102,255,0.05)',
              } : { background: 'rgba(255,255,255,0.02)' }}>
              <div>
                <div className="text-sm font-bold text-white">{s.label}</div>
                <div className="text-[10px] font-medium" style={{ color: '#556677' }}>{s.time}</div>
              </div>
              {s.active && <span className="status-badge status-running">Active</span>}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
