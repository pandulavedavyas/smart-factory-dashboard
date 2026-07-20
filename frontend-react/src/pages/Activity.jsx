import { motion } from 'framer-motion';

export default function Activity() {
  const logs = [
    { icon: 'fa-right-to-bracket', text: 'Admin logged in', time: '10 min ago', color: '#0066FF' },
    { icon: 'fa-robot', text: 'ML model trained: failure_predictor_v3', time: '1 hr ago', color: '#A78BFA' },
    { icon: 'fa-file-lines', text: 'Daily report generated', time: '2 hr ago', color: '#00D68F' },
    { icon: 'fa-upload', text: 'Dataset uploaded: sensor_data_v2.csv', time: '3 hr ago', color: '#FFB340' },
    { icon: 'fa-user-plus', text: 'New user registered: worker@factory.com', time: '5 hr ago', color: '#00E5FF' },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Activity Log</h1>
        <p className="text-xs mt-1" style={{ color: '#8899AA' }}>System activity and audit trail</p>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card-premium" style={{ padding: '24px' }}>
        <div className="space-y-1">
          {logs.map((l, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
              className="flex items-center gap-4 py-3 px-2 rounded-xl transition-colors hover:bg-white/[0.02]"
              style={{ borderBottom: i < logs.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${l.color}12` }}>
                <i className={`fas ${l.icon} text-xs`} style={{ color: l.color }} />
              </div>
              <div className="flex-1"><div className="text-xs font-semibold text-white">{l.text}</div></div>
              <span className="text-[10px] font-medium" style={{ color: '#556677' }}>{l.time}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
