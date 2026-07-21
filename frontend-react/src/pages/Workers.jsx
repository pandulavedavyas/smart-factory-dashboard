import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { subscribeCollection, saveWorker, deleteWorker, seedSteelDemoData } from '../services/firestoreService';
import { useToast } from '../context/ToastContext';

const STEEL_DEPARTMENTS = [
  'All Departments',
  'Blast Furnace Ops',
  'Steel Making (BOF)',
  'Continuous Casting',
  'Hot Rolling Mill',
  'Quality Assurance',
  'Plant Maintenance',
  'Electrical & Automation',
  'Safety & Environment'
];

const SHIFT_TYPES = ['All Shifts', 'Morning', 'Afternoon', 'Night'];
const STATUS_OPTIONS = ['All Statuses', 'Active', 'Break', 'Offline'];

export default function Workers() {
  const { showToast } = useToast();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & View Mode
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedShift, setSelectedShift] = useState('All Shifts');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'

  // Drawer & Edit State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState({
    employeeId: '',
    name: '',
    email: '',
    password: 'worker123',
    department: 'Hot Rolling Mill',
    zone: 'Production',
    assignedMachine: 'Hot Strip Mill HSM-A1',
    shift: 'Morning',
    status: 'Active',
    attendance: 98.0,
    workingHours: 8,
    role: 'worker'
  });

  useEffect(() => {
    let unsubscribe = subscribeCollection('workers', (data) => {
      setWorkers(data);
      setLoading(false);
    });
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  // Filter Logic
  const filteredWorkers = workers.filter(w => {
    const matchesSearch = (w.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (w.employeeId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (w.department || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'All Departments' || w.department === selectedDept;
    const matchesShift = selectedShift === 'All Shifts' || w.shift === selectedShift;
    const matchesStatus = selectedStatus === 'All Statuses' || w.status === selectedStatus;
    return matchesSearch && matchesDept && matchesShift && matchesStatus;
  });

  const handleCardClick = (worker) => {
    setSelectedWorker(worker);
    setFormState({ ...worker });
    setIsEditing(false);
    setIsDrawerOpen(true);
  };

  const handleCreateNewClick = () => {
    setSelectedWorker(null);
    const nextIdNum = 1000 + workers.length + 1;
    setFormState({
      employeeId: `EMP${nextIdNum}`,
      name: '',
      email: '',
      password: 'worker123',
      department: 'Hot Rolling Mill',
      zone: 'Production',
      assignedMachine: 'Hot Strip Mill HSM-A1',
      shift: 'Morning',
      status: 'Active',
      attendance: 98.0,
      workingHours: 8,
      role: 'worker'
    });
    setIsEditing(true);
    setIsDrawerOpen(true);
  };

  const handleDelete = async (empId) => {
    if (window.confirm(`Are you sure you want to remove worker ${empId}?`)) {
      try {
        await deleteWorker(empId);
        showToast(`Worker ${empId} removed successfully`);
        setIsDrawerOpen(false);
      } catch (err) {
        showToast('Failed to delete worker', 'error');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const emailVal = formState.email || `${formState.employeeId.toLowerCase()}@tatajswsteel.com`;
      const updateData = { ...formState, email: emailVal };
      await saveWorker(updateData);
      showToast(selectedWorker ? 'Worker profile updated' : 'New worker registered in Firestore');
      setIsDrawerOpen(false);
    } catch (err) {
      showToast('Error saving worker profile', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <div className="w-10 h-10 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border-color)', borderTopColor: 'var(--primary)' }} />
        <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Loading personnel directory...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title & Top Toolbar */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-page-title" style={{ color: 'var(--text-main)' }}>Steel Workforce Directory</h1>
          <p className="text-card-label" style={{ color: 'var(--text-secondary)' }}>Manage station operators, shift schedules, and attendance records.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 rounded-xl border" style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)' }}>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'cards' ? 'bg-[var(--primary)] text-white shadow-md' : 'text-[var(--text-secondary)]'}`}
            >
              <i className="fas fa-grip mr-1.5" /> Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'table' ? 'bg-[var(--primary)] text-white shadow-md' : 'text-[var(--text-secondary)]'}`}
            >
              <i className="fas fa-list mr-1.5" /> Table
            </button>
          </div>
          <button onClick={handleCreateNewClick} className="btn-primary-saas">
            <i className="fas fa-user-plus text-xs" />
            <span>Add Operator</span>
          </button>
        </div>
      </motion.div>

      {/* Filter Bar */}
      <div className="saas-card !p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--text-secondary)' }} />
          <input
            placeholder="Search operator name, ID..."
            className="input-saas !pl-10 !py-2 text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select className="input-saas !py-2 text-xs w-full sm:w-auto" value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
            {STEEL_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select className="input-saas !py-2 text-xs w-full sm:w-auto" value={selectedShift} onChange={(e) => setSelectedShift(e.target.value)}>
            {SHIFT_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="input-saas !py-2 text-xs w-full sm:w-auto" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
            {STATUS_OPTIONS.map(st => <option key={st} value={st}>{st}</option>)}
          </select>
        </div>
      </div>

      {/* WORKERS VIEW MODE (CARDS VS TABLE) */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredWorkers.map((worker) => {
            const initials = worker.name ? worker.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'EM';
            const statusClass = worker.status === 'Active' ? 'saas-badge-running' : worker.status === 'Break' ? 'saas-badge-idle' : 'saas-badge-down';

            return (
              <div
                key={worker.employeeId || worker.id}
                onClick={() => handleCardClick(worker)}
                className="saas-card flex flex-col justify-between cursor-pointer group hover:border-[var(--primary)]"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold text-white shadow-md" style={{ background: 'var(--primary)' }}>
                      {initials}
                    </div>
                    <span className={`saas-badge ${statusClass}`}>{worker.status}</span>
                  </div>

                  <h3 className="text-section-title" style={{ color: 'var(--text-main)' }}>{worker.name}</h3>
                  <span className="text-card-label block font-mono font-semibold" style={{ color: 'var(--secondary-blue)' }}>ID: {worker.employeeId}</span>
                  
                  <div className="mt-4 pt-3 border-t space-y-2 text-xs" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-secondary)' }}>Department:</span>
                      <span className="font-semibold truncate max-w-[130px]" style={{ color: 'var(--text-main)' }}>{worker.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-secondary)' }}>Shift:</span>
                      <span className="font-semibold" style={{ color: 'var(--text-main)' }}>{worker.shift}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-secondary)' }}>Assigned Station:</span>
                      <span className="font-semibold truncate max-w-[130px]" style={{ color: 'var(--primary-blue)' }}>{worker.assignedMachine}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t flex justify-between items-center text-xs" style={{ borderColor: 'var(--border-color)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Attendance Rate</span>
                  <span className="font-bold" style={{ color: 'var(--success)' }}>{worker.attendance}%</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="saas-table-container">
          <table className="saas-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Employee ID</th>
                <th>Department</th>
                <th>Shift</th>
                <th>Assigned Station</th>
                <th>Attendance</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkers.map((worker) => (
                <tr key={worker.employeeId || worker.id} onClick={() => handleCardClick(worker)} className="cursor-pointer">
                  <td className="font-bold" style={{ color: 'var(--text-main)' }}>{worker.name}</td>
                  <td className="font-mono text-xs" style={{ color: 'var(--secondary-blue)' }}>{worker.employeeId}</td>
                  <td>{worker.department}</td>
                  <td>{worker.shift}</td>
                  <td style={{ color: 'var(--primary-blue)' }}>{worker.assignedMachine}</td>
                  <td className="font-bold" style={{ color: 'var(--success)' }}>{worker.attendance}%</td>
                  <td>
                    <span className={`saas-badge ${worker.status === 'Active' ? 'saas-badge-running' : worker.status === 'Break' ? 'saas-badge-idle' : 'saas-badge-down'}`}>
                      {worker.status}
                    </span>
                  </td>
                  <td className="text-right">
                    <button className="btn-icon-saas !w-8 !h-8 inline-flex" onClick={(e) => { e.stopPropagation(); handleCardClick(worker); }}>
                      <i className="fas fa-pen text-xs" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SLIDE-OUT PROFILE & EDIT DRAWER */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDrawerOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md z-[101] flex flex-col p-6 overflow-y-auto"
              style={{ background: 'var(--bg-card)', borderLeft: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}
            >
              <div className="flex justify-between items-center pb-4 mb-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <h3 className="text-section-title" style={{ color: 'var(--text-main)' }}>
                  {selectedWorker ? 'Operator Profile' : 'Register New Operator'}
                </h3>
                <button onClick={() => setIsDrawerOpen(false)} className="btn-icon-saas !w-8 !h-8">
                  <i className="fas fa-times text-xs" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 flex-1">
                <div>
                  <label className="text-card-label uppercase block mb-1" style={{ color: 'var(--text-secondary)' }}>Employee ID</label>
                  <input type="text" required className="input-saas text-xs font-mono" value={formState.employeeId} onChange={(e) => setFormState({ ...formState, employeeId: e.target.value })} />
                </div>

                <div>
                  <label className="text-card-label uppercase block mb-1" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
                  <input type="text" required className="input-saas text-xs" value={formState.name} onChange={(e) => setFormState({ ...formState, name: e.target.value })} />
                </div>

                <div>
                  <label className="text-card-label uppercase block mb-1" style={{ color: 'var(--text-secondary)' }}>Department</label>
                  <select className="input-saas text-xs" value={formState.department} onChange={(e) => setFormState({ ...formState, department: e.target.value })}>
                    {STEEL_DEPARTMENTS.filter(d => d !== 'All Departments').map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-card-label uppercase block mb-1" style={{ color: 'var(--text-secondary)' }}>Shift</label>
                  <select className="input-saas text-xs" value={formState.shift} onChange={(e) => setFormState({ ...formState, shift: e.target.value })}>
                    {SHIFT_TYPES.filter(s => s !== 'All Shifts').map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-card-label uppercase block mb-1" style={{ color: 'var(--text-secondary)' }}>Assigned Station</label>
                  <input type="text" className="input-saas text-xs" value={formState.assignedMachine} onChange={(e) => setFormState({ ...formState, assignedMachine: e.target.value })} />
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="submit" className="btn-primary-saas flex-1">Save Profile</button>
                  {selectedWorker && (
                    <button type="button" onClick={() => handleDelete(formState.employeeId)} className="px-4 py-2 rounded-xl text-xs font-bold text-red-500 bg-red-500/10 border border-red-500/20">
                      Delete
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
