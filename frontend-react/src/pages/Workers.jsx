import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { subscribeCollection, saveWorker, deleteWorker } from '../services/firestoreService';
import { STEEL_DEPARTMENTS, STEEL_ZONES, STEEL_SHIFTS, STEEL_DESIGNATIONS } from '../services/steelDataSeed';
import { useToast } from '../context/ToastContext';

export default function Workers() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters state
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [zoneFilter, setZoneFilter] = useState('All');
  const [shiftFilter, setShiftFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Sorting state
  const [sortField, setSortField] = useState('employeeId');
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' or 'desc'

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState({
    employeeId: '',
    name: '',
    email: '',
    password: 'worker@123',
    department: STEEL_DEPARTMENTS[0],
    designation: STEEL_DESIGNATIONS[0],
    zone: STEEL_ZONES[0],
    assignedMachine: 'None',
    shift: 'Morning',
    status: 'Active',
    attendance: 96.5,
    workingHours: 8,
    experience: 5,
    phone: '',
    role: 'worker'
  });

  const { showToast } = useToast();

  useEffect(() => {
    // Real-time Firestore subscription to 'workers' collection
    const unsubscribe = subscribeCollection('workers', (data) => {
      setWorkers(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Filter & Search Logic
  const filteredWorkers = useMemo(() => {
    return workers.filter((w) => {
      const q = search.toLowerCase();
      const matchesSearch =
        (w.name || '').toLowerCase().includes(q) ||
        (w.employeeId || '').toLowerCase().includes(q) ||
        (w.department || '').toLowerCase().includes(q) ||
        (w.assignedMachine || '').toLowerCase().includes(q);

      const matchesDept = deptFilter === 'All' || w.department === deptFilter;
      const matchesZone = zoneFilter === 'All' || w.zone === zoneFilter;
      const matchesShift = shiftFilter === 'All' || w.shift === shiftFilter;
      const matchesStatus = statusFilter === 'All' || w.status === statusFilter;

      return matchesSearch && matchesDept && matchesZone && matchesShift && matchesStatus;
    });
  }, [workers, search, deptFilter, zoneFilter, shiftFilter, statusFilter]);

  // Sorting Logic
  const sortedWorkers = useMemo(() => {
    return [...filteredWorkers].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredWorkers, sortField, sortDirection]);

  // Pagination Logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = sortedWorkers.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.max(1, Math.ceil(sortedWorkers.length / rowsPerPage));

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleRowClick = (worker) => {
    setSelectedWorker(worker);
    setFormState({ ...worker });
    setIsEditing(false);
    setIsDrawerOpen(true);
  };

  const handleCreateNewClick = () => {
    setSelectedWorker(null);
    const nextIdNum = 1001 + workers.length;
    setFormState({
      employeeId: `EMP${nextIdNum}`,
      name: '',
      email: '',
      password: 'worker@123',
      department: STEEL_DEPARTMENTS[0],
      designation: STEEL_DESIGNATIONS[0],
      zone: STEEL_ZONES[0],
      assignedMachine: 'None',
      shift: 'Morning',
      status: 'Active',
      attendance: 98.0,
      workingHours: 8,
      experience: 4,
      phone: '+1 (555) 000-0000',
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
      const emailVal = formState.email || `${formState.employeeId.toLowerCase()}@smartfactory.com`;
      const updateData = { ...formState, email: emailVal };
      await saveWorker(updateData);
      showToast(selectedWorker ? 'Worker profile updated' : 'New worker registered in Firestore');
      setIsDrawerOpen(false);
    } catch (err) {
      showToast('Error saving worker profile', 'error');
    }
  };

  const renderStatus = (status) => {
    switch (status) {
      case 'Active':
        return <span className="status-badge status-running">🟢 Active</span>;
      case 'Break':
        return <span className="status-badge status-idle">🟡 Break</span>;
      case 'Offline':
      default:
        return <span className="status-badge status-down">🔴 Offline</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-xl font-bold text-white tracking-tight uppercase">Steel Plant Workforce Directory</h1>
          <p className="text-xs" style={{ color: '#8899AA' }}>Real-time Firestore table of 50 plant workers, assignments, and shifts.</p>
        </motion.div>
        <button 
          onClick={handleCreateNewClick}
          className="btn-primary flex items-center gap-2"
        >
          <i className="fas fa-plus text-xs" />
          <span>Register Worker</span>
        </button>
      </div>

      {/* Search & Multi-Filter Toolbar */}
      <div className="glass-card-premium p-4 flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-xs" style={{ color: '#556677' }} />
          <input 
            type="text" 
            className="input !pl-10 !py-2.5 w-full text-xs"
            placeholder="Search by Employee ID, Name, Department, Machine..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: '#556677' }}>Department</span>
            <select 
              className="filter-select text-xs font-semibold"
              value={deptFilter}
              onChange={(e) => { setDeptFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="All">All Departments</option>
              {STEEL_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: '#556677' }}>Zone</span>
            <select 
              className="filter-select text-xs font-semibold"
              value={zoneFilter}
              onChange={(e) => { setZoneFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="All">All Zones</option>
              {STEEL_ZONES.map(z => <option key={z} value={z}>{z}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: '#556677' }}>Shift</span>
            <select 
              className="filter-select text-xs font-semibold"
              value={shiftFilter}
              onChange={(e) => { setShiftFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="All">All Shifts</option>
              {STEEL_SHIFTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: '#556677' }}>Status</span>
            <select 
              className="filter-select text-xs font-semibold"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Break">Break</option>
              <option value="Offline">Offline</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Datatable */}
      <div className="glass-card-premium p-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 border-2 border-white/[0.04] border-t-[#00E5FF] rounded-full animate-spin" />
            <span className="text-xs" style={{ color: '#8899AA' }}>Syncing workforce registry...</span>
          </div>
        ) : sortedWorkers.length === 0 ? (
          <div className="text-center py-16">
            <i className="fas fa-user-slash text-2xl mb-3 text-[#FFB340]" />
            <p className="text-xs font-bold text-white uppercase tracking-wider">No Workers Found</p>
            <p className="text-[10px] mt-1" style={{ color: '#556677' }}>No operator matches the active search or filter criteria.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="w-full">
              <thead>
                <tr>
                  <th onClick={() => handleSort('employeeId')} className="cursor-pointer select-none">
                    Employee ID {sortField === 'employeeId' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th onClick={() => handleSort('name')} className="cursor-pointer select-none">
                    Name {sortField === 'name' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th onClick={() => handleSort('department')} className="cursor-pointer select-none">
                    Department {sortField === 'department' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th onClick={() => handleSort('zone')} className="cursor-pointer select-none">
                    Zone {sortField === 'zone' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th onClick={() => handleSort('assignedMachine')} className="cursor-pointer select-none">
                    Assigned Machine {sortField === 'assignedMachine' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th onClick={() => handleSort('shift')} className="cursor-pointer select-none">
                    Shift {sortField === 'shift' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th onClick={() => handleSort('attendance')} className="cursor-pointer select-none">
                    Attendance {sortField === 'attendance' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th onClick={() => handleSort('status')} className="cursor-pointer select-none">
                    Status {sortField === 'status' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th onClick={() => handleSort('workingHours')} className="cursor-pointer select-none">
                    Working Hours {sortField === 'workingHours' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentRows.map((worker) => (
                  <tr 
                    key={worker.employeeId || worker.id} 
                    onClick={() => handleRowClick(worker)}
                    className="cursor-pointer hover:bg-white/[0.02]"
                  >
                    <td className="font-mono text-xs font-bold text-[#00E5FF]">{worker.employeeId}</td>
                    <td className="text-xs font-bold text-white">{worker.name}</td>
                    <td className="text-xs" style={{ color: '#8899AA' }}>{worker.department}</td>
                    <td className="text-xs font-medium text-white">{worker.zone}</td>
                    <td className="text-xs" style={{ color: '#8899AA' }}>{worker.assignedMachine}</td>
                    <td className="text-xs" style={{ color: '#8899AA' }}>{worker.shift}</td>
                    <td className="text-xs font-bold text-white">{worker.attendance}%</td>
                    <td>{renderStatus(worker.status)}</td>
                    <td className="text-xs font-bold text-white">{worker.workingHours}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center text-xs mt-4 flex-wrap gap-3">
        <div className="flex items-center gap-2" style={{ color: '#556677' }}>
          <span>Rows per page:</span>
          <select
            className="filter-select text-xs font-semibold py-1 px-2"
            value={rowsPerPage}
            onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
          >
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span className="ml-2">
            Showing {indexOfFirstRow + 1} - {Math.min(indexOfLastRow, sortedWorkers.length)} of {sortedWorkers.length} employees
          </span>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="chart-toolbar-btn disabled:opacity-40"
            >
              <i className="fas fa-chevron-left" />
            </button>
            <span className="font-bold text-white px-2">Page {currentPage} of {totalPages}</span>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="chart-toolbar-btn disabled:opacity-40"
            >
              <i className="fas fa-chevron-right" />
            </button>
          </div>
        )}
      </div>

      {/* Slide-out Profile Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md z-[101] flex flex-col p-6 overflow-y-auto"
              style={{
                background: 'var(--bg-card)',
                borderLeft: '1px solid var(--border-color)',
                boxShadow: 'var(--card-shadow)',
              }}
            >
              <div className="flex items-center justify-between pb-4 border-b mb-6" style={{ borderColor: 'var(--border-color)' }}>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--text-main)' }}>
                    {selectedWorker ? 'Worker Station Profile' : 'Register Steel Operator'}
                  </h3>
                  <small style={{ color: 'var(--text-secondary)' }}>{selectedWorker ? selectedWorker.employeeId : 'Firestore Registry'}</small>
                </div>
                <button 
                  onClick={() => setIsDrawerOpen(false)}
                  className="chart-toolbar-btn w-8 h-8 flex items-center justify-center hover:bg-white/[0.06] rounded-lg"
                >
                  <i className="fas fa-xmark text-xs" />
                </button>
              </div>

              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4 flex-1">
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#556677' }}>Employee ID</label>
                    <input 
                      type="text" 
                      className="input text-xs font-mono !py-2.5" 
                      placeholder="e.g. EMP1001" 
                      required
                      value={formState.employeeId}
                      onChange={(e) => setFormState({ ...formState, employeeId: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#556677' }}>Full Name</label>
                    <input 
                      type="text" 
                      className="input text-xs !py-2.5" 
                      placeholder="Full Name" 
                      required
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#556677' }}>Department</label>
                    <select 
                      className="input text-xs"
                      value={formState.department}
                      onChange={(e) => setFormState({ ...formState, department: e.target.value })}
                    >
                      {STEEL_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#556677' }}>Designation</label>
                    <select 
                      className="input text-xs"
                      value={formState.designation}
                      onChange={(e) => setFormState({ ...formState, designation: e.target.value })}
                    >
                      {STEEL_DESIGNATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#556677' }}>Zone</label>
                    <select 
                      className="input text-xs"
                      value={formState.zone}
                      onChange={(e) => setFormState({ ...formState, zone: e.target.value })}
                    >
                      {STEEL_ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#556677' }}>Assigned Machine</label>
                    <input 
                      type="text" 
                      className="input text-xs !py-2.5" 
                      placeholder="e.g. Blast Furnace" 
                      value={formState.assignedMachine}
                      onChange={(e) => setFormState({ ...formState, assignedMachine: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#556677' }}>Shift</label>
                    <select 
                      className="input text-xs"
                      value={formState.shift}
                      onChange={(e) => setFormState({ ...formState, shift: e.target.value })}
                    >
                      {STEEL_SHIFTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#556677' }}>Attendance (%)</label>
                      <input 
                        type="number" 
                        step="0.1" 
                        className="input text-xs !py-2.5" 
                        value={formState.attendance}
                        onChange={(e) => setFormState({ ...formState, attendance: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#556677' }}>Working Hours</label>
                      <input 
                        type="number" 
                        className="input text-xs !py-2.5" 
                        value={formState.workingHours}
                        onChange={(e) => setFormState({ ...formState, workingHours: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#556677' }}>Status</label>
                    <select 
                      className="input text-xs"
                      value={formState.status}
                      onChange={(e) => setFormState({ ...formState, status: e.target.value })}
                    >
                      <option value="Active">Active</option>
                      <option value="Break">Break</option>
                      <option value="Offline">Offline</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-6">
                    <button 
                      type="submit" 
                      className="btn-primary flex-1 py-3 text-xs"
                      style={{ background: 'linear-gradient(135deg, #00D68F, #00B376)' }}
                    >
                      <i className="fas fa-save mr-2" /> Save Profile
                    </button>
                    <button 
                      type="button" 
                      onClick={() => selectedWorker ? setIsEditing(false) : setIsDrawerOpen(false)}
                      className="btn-secondary text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-5">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold"
                        style={{ background: 'linear-gradient(135deg, rgba(0, 102, 255, 0.25), rgba(0, 229, 255, 0.15))', color: '#00E5FF', border: '1px solid rgba(0, 229, 255, 0.2)' }}>
                        {selectedWorker.name ? selectedWorker.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'EM'}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white">{selectedWorker.name}</h4>
                        <span className="text-xs" style={{ color: '#00E5FF' }}>ID: {selectedWorker.employeeId}</span>
                      </div>
                    </div>

                    <div className="h-px bg-white/[0.04]" />

                    <div className="space-y-3 text-xs">
                      {[
                        { label: 'Department', val: selectedWorker.department },
                        { label: 'Designation', val: selectedWorker.designation || 'Machine Operator' },
                        { label: 'Plant Zone', val: selectedWorker.zone },
                        { label: 'Assigned Machine', val: selectedWorker.assignedMachine },
                        { label: 'Shift', val: selectedWorker.shift },
                        { label: 'Attendance Rate', val: `${selectedWorker.attendance}%` },
                        { label: 'Status', val: selectedWorker.status },
                        { label: 'Today Logged Hours', val: `${selectedWorker.workingHours} Hours` },
                        { label: 'Overtime', val: `${selectedWorker.overtime || 0} Hours` },
                        { label: 'Experience', val: `${selectedWorker.experience || 4} Years` },
                        { label: 'Contact Phone', val: selectedWorker.phone || 'N/A' }
                      ].map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center py-2 border-b border-white/[0.02]">
                          <span style={{ color: '#556677' }} className="font-semibold uppercase text-[9px] tracking-wider">{item.label}</span>
                          <span className="font-bold text-white text-right">{item.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-6 border-t border-white/[0.04]">
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="btn-primary flex-1 py-3 text-xs"
                    >
                      <i className="fas fa-user-pen mr-2" /> Modify Profile
                    </button>
                    <button 
                      onClick={() => handleDelete(selectedWorker.employeeId)}
                      className="btn-danger py-3 text-xs flex items-center justify-center"
                    >
                      <i className="fas fa-trash-can mr-2" /> Remove
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
