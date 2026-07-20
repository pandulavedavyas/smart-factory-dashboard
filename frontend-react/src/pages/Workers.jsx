import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getWorkers, saveWorker, deleteWorker } from '../services/firestoreService';
import { useToast } from '../context/ToastContext';

export default function Workers() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [zoneFilter, setZoneFilter] = useState('All');
  const [shiftFilter, setShiftFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(6);

  // Drawer states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState({
    employeeId: '',
    name: '',
    email: '',
    password: 'worker123',
    department: '',
    zone: 'Assembly',
    assignedMachine: 'None',
    shift: 'Morning',
    status: 'Active',
    attendance: 95.0,
    workingHours: 8,
    performance: 85,
    role: 'worker'
  });

  const { showToast } = useToast();

  useEffect(() => {
    loadWorkersData();
  }, []);

  async function loadWorkersData() {
    try {
      setLoading(true);
      const data = await getWorkers();
      setWorkers(data);
    } catch (err) {
      showToast('Error syncing worker data', 'error');
    } finally {
      setLoading(false);
    }
  }

  // Filter & Search logic
  const filteredWorkers = workers.filter(w => {
    const matchesSearch = w.name?.toLowerCase().includes(search.toLowerCase()) || 
                          w.employeeId?.toLowerCase().includes(search.toLowerCase()) ||
                          w.department?.toLowerCase().includes(search.toLowerCase());
    const matchesZone = zoneFilter === 'All' || w.zone === zoneFilter;
    const matchesShift = shiftFilter === 'All' || w.shift === shiftFilter;
    const matchesStatus = statusFilter === 'All' || w.status === statusFilter;
    return matchesSearch && matchesZone && matchesShift && matchesStatus;
  });

  // Pagination calculation
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredWorkers.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredWorkers.length / rowsPerPage);

  const handleRowClick = (worker) => {
    setSelectedWorker(worker);
    setFormState({ ...worker });
    setIsEditing(false);
    setIsDrawerOpen(true);
  };

  const handleCreateNewClick = () => {
    setSelectedWorker(null);
    setFormState({
      employeeId: 'W-00' + (workers.length + 1),
      name: '',
      email: '',
      password: 'worker123',
      department: '',
      zone: 'Assembly',
      assignedMachine: 'None',
      shift: 'Morning',
      status: 'Offline',
      attendance: 95.0,
      workingHours: 0,
      performance: 85,
      role: 'worker'
    });
    setIsEditing(true);
    setIsDrawerOpen(true);
  };

  const handleDelete = async (empId) => {
    if (window.confirm(`Are you sure you want to remove worker ${empId}?`)) {
      try {
        await deleteWorker(empId);
        showToast('Worker profile removed successfully');
        setIsDrawerOpen(false);
        loadWorkersData();
      } catch (err) {
        showToast('Failed to delete worker', 'error');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Auto email generation if not provided
      const emailVal = formState.email || `${formState.employeeId.toLowerCase()}@factory.com`;
      const updateData = { ...formState, email: emailVal };
      await saveWorker(updateData);
      showToast(selectedWorker ? 'Worker profile updated' : 'Worker registered successfully');
      setIsDrawerOpen(false);
      loadWorkersData();
    } catch (err) {
      showToast('Error saving worker profile', 'error');
    }
  };

  // Status badges formatter
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
          <h1 className="text-xl font-bold text-white tracking-tight uppercase">Workforce Registry</h1>
          <p className="text-xs" style={{ color: '#8899AA' }}>Manage operator shift details, status, and plant zones.</p>
        </motion.div>
        <button 
          onClick={handleCreateNewClick}
          className="btn-primary flex items-center gap-2"
        >
          <i className="fas fa-plus text-xs" />
          <span>Register Worker</span>
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="glass-card-premium p-4 flex flex-col md:flex-row md:items-center gap-4 justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-xs" style={{ color: '#556677' }} />
          <input 
            type="text" 
            className="input !pl-10 !py-2.5 w-full text-xs"
            placeholder="Search by Employee ID, Name, or Department..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: '#556677' }}>Zone</span>
            <select 
              className="filter-select text-xs font-semibold"
              value={zoneFilter}
              onChange={(e) => { setZoneFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="All">All Zones</option>
              <option value="Assembly">Assembly</option>
              <option value="Packaging">Packaging</option>
              <option value="Quality Control">Quality Control</option>
              <option value="Warehouse">Warehouse</option>
              <option value="Production">Production</option>
              <option value="Maintenance">Maintenance</option>
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
              <option value="Morning">Morning</option>
              <option value="Afternoon">Afternoon</option>
              <option value="Night">Night</option>
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
            <span className="text-xs" style={{ color: '#8899AA' }}>Syncing registry database...</span>
          </div>
        ) : filteredWorkers.length === 0 ? (
          <div className="text-center py-16">
            <i className="fas fa-user-slash text-2xl mb-3 text-[#FFB340]" />
            <p className="text-xs font-bold text-white uppercase tracking-wider">No Worker Found</p>
            <p className="text-[10px] mt-1" style={{ color: '#556677' }}>No operator matches the active filter query parameters.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="w-full">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Zone</th>
                  <th>Assigned Machine</th>
                  <th>Shift</th>
                  <th>Status</th>
                  <th>Attendance</th>
                  <th>Working Hours</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.map((worker) => (
                  <tr 
                    key={worker.employeeId} 
                    onClick={() => handleRowClick(worker)}
                    className="cursor-pointer hover:bg-white/[0.02]"
                  >
                    <td className="font-mono text-xs font-semibold text-[#00E5FF]">{worker.employeeId}</td>
                    <td className="text-xs font-bold text-white">{worker.name}</td>
                    <td className="text-xs" style={{ color: '#8899AA' }}>{worker.department}</td>
                    <td className="text-xs font-medium text-white">{worker.zone}</td>
                    <td className="text-xs" style={{ color: '#8899AA' }}>{worker.assignedMachine}</td>
                    <td className="text-xs" style={{ color: '#8899AA' }}>{worker.shift}</td>
                    <td>{renderStatus(worker.status)}</td>
                    <td className="text-xs font-bold text-white">{worker.attendance}%</td>
                    <td className="text-xs font-bold text-white">{worker.workingHours}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center text-xs mt-4">
          <span style={{ color: '#556677' }}>
            Showing {indexOfFirstRow + 1} to {Math.min(indexOfLastRow, filteredWorkers.length)} of {filteredWorkers.length} employees
          </span>
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
        </div>
      )}

      {/* Slide-out Profile Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            {/* Drawer */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md z-[101] flex flex-col p-6 overflow-y-auto"
              style={{
                background: 'linear-gradient(135deg, rgba(12, 26, 44, 0.98) 0%, rgba(6, 14, 24, 0.99) 100%)',
                borderLeft: '1px solid rgba(0, 102, 255, 0.12)',
                boxShadow: '-10px 0 40px rgba(0,0,0,0.5)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.04] mb-6">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest">
                    {selectedWorker ? 'Worker Station Profile' : 'Register Operator'}
                  </h3>
                  <small style={{ color: '#8899AA' }}>{selectedWorker ? selectedWorker.employeeId : 'Industry 4.0 Platform'}</small>
                </div>
                <button 
                  onClick={() => setIsDrawerOpen(false)}
                  className="chart-toolbar-btn w-8 h-8 flex items-center justify-center hover:bg-white/[0.06] rounded-lg"
                >
                  <i className="fas fa-xmark text-xs" />
                </button>
              </div>

              {/* Editing Form vs. View Details */}
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4 flex-1">
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#556677' }}>Employee ID</label>
                    <input 
                      type="text" 
                      className="input text-xs font-mono !py-2.5" 
                      placeholder="e.g. W-007" 
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
                      placeholder="e.g. Arthur Pendragon" 
                      required
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#556677' }}>Department</label>
                    <input 
                      type="text" 
                      className="input text-xs !py-2.5" 
                      placeholder="e.g. Machinery Maintenance" 
                      required
                      value={formState.department}
                      onChange={(e) => setFormState({ ...formState, department: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#556677' }}>Shift</label>
                    <select 
                      className="input text-xs"
                      value={formState.shift}
                      onChange={(e) => setFormState({ ...formState, shift: e.target.value })}
                    >
                      <option value="Morning">Morning</option>
                      <option value="Afternoon">Afternoon</option>
                      <option value="Night">Night</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#556677' }}>Factory Zone</label>
                    <select 
                      className="input text-xs"
                      value={formState.zone}
                      onChange={(e) => setFormState({ ...formState, zone: e.target.value })}
                    >
                      <option value="Assembly">Assembly</option>
                      <option value="Packaging">Packaging</option>
                      <option value="Quality Control">Quality Control</option>
                      <option value="Warehouse">Warehouse</option>
                      <option value="Production">Production</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#556677' }}>Assigned Machine</label>
                    <input 
                      type="text" 
                      className="input text-xs !py-2.5" 
                      placeholder="e.g. CNC Lathe A1" 
                      value={formState.assignedMachine}
                      onChange={(e) => setFormState({ ...formState, assignedMachine: e.target.value })}
                    />
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
                  {/* Detailed view */}
                  <div className="space-y-5">
                    {/* Header profile details */}
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold"
                        style={{ background: 'linear-gradient(135deg, rgba(0, 102, 255, 0.25), rgba(0, 229, 255, 0.15))', color: '#00E5FF', border: '1px solid rgba(0, 229, 255, 0.2)' }}>
                        {selectedWorker.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white">{selectedWorker.name}</h4>
                        <span className="text-xs" style={{ color: '#00E5FF' }}>Code: {selectedWorker.employeeId}</span>
                      </div>
                    </div>

                    <div className="h-px bg-white/[0.04]" />

                    {/* Meta Lists */}
                    <div className="space-y-4 text-xs">
                      {[
                        { label: 'Department / Station', val: selectedWorker.department },
                        { label: 'Operational Zone', val: selectedWorker.zone },
                        { label: 'Assigned Machinery', val: selectedWorker.assignedMachine },
                        { label: 'Work Shift', val: selectedWorker.shift },
                        { label: 'Current Logged Hours', val: `${selectedWorker.workingHours} Hours` },
                        { label: 'Attendance Rate', val: `${selectedWorker.attendance}%` },
                        { label: 'Work Station performance', val: `${selectedWorker.performance || 85}%` },
                        { label: 'Role Permissions', val: selectedWorker.role.toUpperCase() }
                      ].map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center py-2 border-b border-white/[0.02]">
                          <span style={{ color: '#556677' }} className="font-semibold uppercase text-[9px] tracking-wider">{item.label}</span>
                          <span className="font-bold text-white text-right">{item.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions footer */}
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
