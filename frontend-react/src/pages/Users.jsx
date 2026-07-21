import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { subscribeCollection } from '../services/firestoreService';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeCollection('users', (data) => {
      setUsers(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-3">
        <div className="w-8 h-8 border-2 border-white/[0.04] border-t-[#00E5FF] rounded-full animate-spin" />
        <span className="text-xs" style={{ color: '#8899AA' }}>Syncing user access registry...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold text-white tracking-tight uppercase">User Management</h1>
        <p className="text-xs" style={{ color: '#8899AA' }}>Firestore authenticated accounts and access privileges.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card-premium p-1">
        <div className="table-container">
          <table className="w-full">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Email</th>
                <th>Full Name</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="hover:bg-white/[0.02]">
                  <td className="font-mono text-xs font-bold text-[#00E5FF]">{u.id}</td>
                  <td className="text-xs" style={{ color: '#8899AA' }}>{u.email}</td>
                  <td className="text-xs font-bold text-white">{u.full_name}</td>
                  <td>
                    <span className={`status-badge ${u.role === 'admin' ? 'status-down' : 'status-running'}`}>
                      {u.role === 'admin' ? '🛡️ Admin' : '👷 Worker'}
                    </span>
                  </td>
                  <td className="text-xs" style={{ color: '#8899AA' }}>{u.department || 'Steel Manufacturing'}</td>
                  <td>
                    <span className="text-[10px] font-bold text-[#00D68F] uppercase tracking-wider">
                      🟢 Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
