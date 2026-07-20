import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api/api';
import StatusBadge from '../components/StatusBadge';

export default function Users() {
  const [users, setUsers] = useState([]);
  useEffect(() => { api.get('/auth/users').then(d => { if (d) setUsers(d); }); }, []);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Users</h1>
        <p className="text-xs mt-1" style={{ color: '#8899AA' }}>Manage system users and roles</p>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card-premium" style={{ padding: '24px' }}>
        <div className="table-container">
          <table>
            <thead><tr><th>ID</th><th>Email</th><th>Name</th><th>Role</th><th>Department</th><th>Status</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td className="text-xs" style={{ color: '#8899AA' }}>{u.id}</td>
                  <td className="text-xs" style={{ color: '#8899AA' }}>{u.email}</td>
                  <td className="font-medium text-white">{u.full_name}</td>
                  <td><StatusBadge status={u.role === 'admin' ? 'running' : u.role === 'manager' ? 'in_progress' : 'idle'} size="xs" /> <span className="ml-1 text-xs" style={{ color: '#8899AA' }}>{u.role}</span></td>
                  <td className="text-xs" style={{ color: '#8899AA' }}>{u.department || '-'}</td>
                  <td><StatusBadge status={u.is_active ? 'running' : 'down'} size="xs" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
