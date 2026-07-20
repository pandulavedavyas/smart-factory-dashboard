import { motion } from 'framer-motion';

export default function MyTasks() {
  const tasks = [
    { name: 'CNC Operation - Batch A1', time: '8:00 AM', priority: 'high', done: true },
    { name: 'Tool Inspection', time: '9:30 AM', priority: 'medium', done: true },
    { name: 'Quality Check - Part #4821', time: '11:00 AM', priority: 'high', done: true },
    { name: 'Machine Calibration', time: '12:00 PM', priority: 'medium', done: false },
    { name: 'End-of-Shift Report', time: '1:30 PM', priority: 'low', done: false },
  ];
  const done = tasks.filter(t => t.done).length;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">My Tasks</h1>
        <p className="text-xs mt-1" style={{ color: '#8899AA' }}>Manage your daily tasks</p>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card-premium" style={{ padding: '24px' }}>
        <div className="flex items-center justify-between mb-5">
          <span className="text-sm font-bold text-white">Today's Tasks ({done}/{tasks.length})</span>
          <div className="w-32 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <div className="h-full rounded-full" style={{ width: `${(done / tasks.length) * 100}%`, background: 'linear-gradient(90deg, #0066FF, #00E5FF)' }} />
          </div>
        </div>
        <div className="space-y-2">
          {tasks.map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
              className="flex items-center gap-4 p-4 rounded-xl transition-all duration-200"
              style={t.done ? { background: 'rgba(255,255,255,0.01)', opacity: 0.6 } : { background: 'rgba(255,255,255,0.03)' }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                style={t.done ? { background: 'rgba(0, 214, 143, 0.15)', color: '#00D68F' } : { background: 'rgba(255,255,255,0.06)', color: '#556677' }}>
                {t.done ? <i className="fas fa-check" /> : <span className="w-2 h-2 rounded-full bg-current" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-semibold ${t.done ? 'line-through' : 'text-white'}`}>{t.name}</div>
                <div className="text-[10px] font-medium" style={{ color: '#556677' }}>{t.time}</div>
              </div>
              <span className={`status-badge ${t.priority === 'high' ? 'status-down' : t.priority === 'medium' ? 'status-in_progress' : 'status-idle'}`} style={{ fontSize: '10px' }}>{t.priority}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
