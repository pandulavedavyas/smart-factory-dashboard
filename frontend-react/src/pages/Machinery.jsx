import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMachines, saveMachine, deleteMachine } from '../services/firestoreService';
import { useToast } from '../context/ToastContext';

export default function Machinery() {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [zoneFilter, setZoneFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(6);

  // Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState({
    machineName: '',
    machineId: '',
    zone: 'Assembly',
    temperature: 65.0,
    status: 'Running',
    health: 90,
    workingHours: 1200,
    assignedOperator: 'None',
    currentShift: 'Morning',
    lastMaintenance: '2026-07-01'
  });

  const { showToast } = useToast();

  useEffect(() => {
    loadMachinesData();
  }, []);

  async function loadMachinesData() {
    try {
      setLoading(true);
      const data = await getMachines();
      setMachines(data);
    } catch (err) {
      showToast('Error syncing machinery telemetry', 'error');
    } finally {
      setLoading(false);
    }
  }

  // Search & Filter
  const filteredMachines = machines.filter(m => {
    const matchesSearch = m.machineName?.toLowerCase().includes(search.toLowerCase()) ||
                          m.machineId?.toLowerCase().includes(search.toLowerCase()) ||
                          m.assignedOperator?.toLowerCase().includes(search.toLowerCase());
    const matchesZone = zoneFilter === 'All' || m.zone === zoneFilter;
    const matchesStatus = statusFilter === 'All' || m.status === statusFilter;
    return matchesSearch && matchesZone && matchesStatus;
  });

  // Pagination
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredMachines.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredMachines.length / rowsPerPage);

  const handleRowClick = (mach) => {
    setSelectedMachine(mach);
    setFormState({ ...mach });
    setIsEditing(false);
    setIsDrawerOpen(true);
  };

  const handleCreateNewClick = () => {
    setSelectedMachine(null);
    setFormState({
      machineName: '',
      machineId: 'M-00' + (machines.length + 1),
      zone: 'Assembly',
      temperature: 45.0,
      status: 'Idle',
      health: 100,
      workingHours: 0,
      assignedOperator: 'None',
      currentShift: 'Morning',
      lastMaintenance: new Date().toISOString().slice(0, 10)
    });
    setIsEditing(true);
    setIsDrawerOpen(true);
  };

  const handleDelete = async (machId) => {
    if (window.confirm(`Are you sure you want to remove machine ${machId}?`)) {
      try {
        await deleteMachine(machId);
        showToast('Machine removed from registry successfully');
        setIsDrawerOpen(false);
        loadMachinesData();
      } catch (err) {
        showToast('Failed to delete machine', 'error');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await saveMachine(formState);
      showToast(selectedMachine ? 'Machine telemetry updated' : 'Machine registered successfully');
      setIsDrawerOpen(false);
      loadMachinesData();
    } catch (err) {
      showToast('Error saving machine parameters', 'error');
    }
  };

  // Status badges
  const renderStatus = (status) => {
    switch (status) {
      case 'Running':
        return <span className="status-badge status-running">🟢 Running</span>;
      case 'Idle':
        return <span className="status-badge status-idle">🟡 Idle</span>;
      case 'Maintenance':
      default:
        return <span className="status-badge status-down">🔴 Maintenance</span>;
    }
  };

  // Animated Circular Gauge Component for Health
  const CircularHealthGauge = ({ val, size = 110 }) => {
    const strokeWidth = 8;
    const radius = (size - strokeWidth * 2) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - val / 100);
    const color = val >= 85 ? '#00D68F' : val >= 60 ? '#FFB340' : '#FF4757';

    return (
      <div className="flex flex-col items-center gap-2">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            {/* Background circle */}
            <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth={strokeWidth} />
            {/* Dynamic circle */}
            <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
              strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-base font-bold text-white">{val}%</span>
            <span className="text-[7px] font-extrabold uppercase tracking-widest" style={{ color: '#556677' }}>Core health</span>
          </div>
        </div>
      </div>
    );
  };

  // Temperature Gauge Progress Bar Component
  const TemperatureGauge = ({ temp }) => {
    // Limits: Max 100°C. High temperature alerts at 75°C.
    const pct = Math.min((temp / 100) * 100, 100);
    const color = temp >= 75 ? 'linear-gradient(90deg, #FFB340, #FF4757)' : 'linear-gradient(90deg, #00E5FF, #00D68F)';
    const glow = temp >= 75 ? 'rgba(255, 71, 87, 0.4)' : 'rgba(0, 229, 255, 0.2)';

    return (
      <div className="w-full space-y-2">
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-white">
          <span style={{ color: '#556677' }}>Thermal State</span>
          <span style={{ color: temp >= 75 ? '#FF4757' : '#00E5FF' }}>{temp}°C</span>
        </div>
        <div className="h-3 rounded-full overflow-hidden w-full relative" style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div 
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${pct}%`,
              background: color,
              boxShadow: `0 0 10px ${glow}`
            }}
          />
        </div>
        <div className="flex justify-between text-[8px] font-bold uppercase" style={{ color: '#556677' }}>
          <span>0°C Min</span>
          <span>75°C Warning</span>
          <span>100°C Critical</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-xl font-bold text-white tracking-tight uppercase">Plant Machinery Telemetry</h1>
          <p className="text-xs" style={{ color: '#8899AA' }}>Monitor live machine temperature, health, operational hours, and status.</p>
        </motion.div>
        <button 
          onClick={handleCreateNewClick}
          className="btn-primary flex items-center gap-2"
        >
          <i className="fas fa-plus text-xs" />
          <span>Register Machine</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="glass-card-premium p-4 flex flex-col md:flex-row md:items-center gap-4 justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-xs" style={{ color: '#556677' }} />
          <input 
            type="text" 
            className="input !pl-10 !py-2.5 w-full text-xs"
            placeholder="Search by Machine Name, ID, or Assigned Operator..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: '#556677' }}>Zone Filter</span>
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
            <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: '#556677' }}>Operational Status</span>
            <select 
              className="filter-select text-xs font-semibold"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="All">All Statuses</option>
              <option value="Running">Running</option>
              <option value="Idle">Idle</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main datatable */}
      <div className="glass-card-premium p-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 border-2 border-white/[0.04] border-t-[#00E5FF] rounded-full animate-spin" />
            <span className="text-xs" style={{ color: '#8899AA' }}>Syncing machinery diagnostics...</span>
          </div>
        ) : filteredMachines.length === 0 ? (
          <div className="text-center py-16">
            <i className="fas fa-microchip text-2xl mb-3 text-[#FFB340]" />
            <p className="text-xs font-bold text-white uppercase tracking-wider">No Machinery Found</p>
            <p className="text-[10px] mt-1" style={{ color: '#556677' }}>No connected hardware logs match the active parameters.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="w-full">
              <thead>
                <tr>
                  <th>Machine Name</th>
                  <th>Machine ID</th>
                  <th>Zone</th>
                  <th>Temperature</th>
                  <th>Status</th>
                  <th>Health Score</th>
                  <th>Working Hours</th>
                  <th>Assigned Operator</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.map((mach) => (
                  <tr 
                    key={mach.machineId} 
                    onClick={() => handleRowClick(mach)}
                    className="cursor-pointer hover:bg-white/[0.02]"
                  >
                    <td className="text-xs font-bold text-white">{mach.machineName}</td>
                    <td className="font-mono text-xs font-semibold text-[#00E5FF]">{mach.machineId}</td>
                    <td className="text-xs font-medium text-white">{mach.zone}</td>
                    <td className="text-xs font-bold" style={{ color: mach.temperature >= 75 ? '#FF4757' : '#8899AA' }}>
                      {mach.temperature}°C
                    </td>
                    <td>{renderStatus(mach.status)}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
                          <div className="h-full rounded-full" style={{
                            width: `${mach.health}%`,
                            background: mach.health >= 85 ? '#00D68F' : mach.health >= 60 ? '#FFB340' : '#FF4757'
                          }} />
                        </div>
                        <span className="text-[10px] font-bold text-white">{mach.health}%</span>
                      </div>
                    </td>
                    <td className="text-xs font-bold text-white">{mach.workingHours}h</td>
                    <td className="text-xs" style={{ color: '#8899AA' }}>{mach.assignedOperator}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center text-xs mt-4">
          <span style={{ color: '#556677' }}>
            Showing {indexOfFirstRow + 1} to {Math.min(indexOfLastRow, filteredMachines.length)} of {filteredMachines.length} machinery items
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

      {/* Slide-out Status Drawer */}
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
                background: 'linear-gradient(135deg, rgba(12, 26, 44, 0.98) 0%, rgba(6, 14, 24, 0.99) 100%)',
                borderLeft: '1px solid rgba(0, 102, 255, 0.12)',
                boxShadow: '-10px 0 40px rgba(0,0,0,0.5)',
              }}
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.04] mb-6">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest">
                    {selectedMachine ? 'Machine Status Card' : 'Register Machine'}
                  </h3>
                  <small style={{ color: '#8899AA' }}>{selectedMachine ? selectedMachine.machineId : 'Telemetry Node'}</small>
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
                    <label className="text-[9px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#556677' }}>Machine Name</label>
                    <input 
                      type="text" 
                      className="input text-xs !py-2.5" 
                      placeholder="e.g. Laser Engraver F1" 
                      required
                      value={formState.machineName}
                      onChange={(e) => setFormState({ ...formState, machineName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#556677' }}>Machine ID</label>
                    <input 
                      type="text" 
                      className="input text-xs font-mono !py-2.5" 
                      placeholder="e.g. M-010" 
                      required
                      value={formState.machineId}
                      onChange={(e) => setFormState({ ...formState, machineId: e.target.value })}
                    />
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#556677' }}>Temperature (°C)</label>
                      <input 
                        type="number" 
                        step="0.1" 
                        className="input text-xs !py-2.5" 
                        value={formState.temperature}
                        onChange={(e) => setFormState({ ...formState, temperature: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#556677' }}>Health Score (%)</label>
                      <input 
                        type="number" 
                        className="input text-xs !py-2.5" 
                        value={formState.health}
                        onChange={(e) => setFormState({ ...formState, health: parseInt(e.target.value) || 0 })}
                      />
                    </div>
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
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#556677' }}>Assigned Operator</label>
                    <input 
                      type="text" 
                      className="input text-xs !py-2.5" 
                      placeholder="Operator Name" 
                      value={formState.assignedOperator}
                      onChange={(e) => setFormState({ ...formState, assignedOperator: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#556677' }}>Current Shift</label>
                    <select 
                      className="input text-xs"
                      value={formState.currentShift}
                      onChange={(e) => setFormState({ ...formState, currentShift: e.target.value })}
                    >
                      <option value="Morning">Morning</option>
                      <option value="Afternoon">Afternoon</option>
                      <option value="Night">Night</option>
                      <option value="None">None</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#556677' }}>Status</label>
                    <select 
                      className="input text-xs"
                      value={formState.status}
                      onChange={(e) => setFormState({ ...formState, status: e.target.value })}
                    >
                      <option value="Running">Running</option>
                      <option value="Idle">Idle</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: '#556677' }}>Last Maintenance Date</label>
                    <input 
                      type="date" 
                      className="input text-xs !py-2.5" 
                      value={formState.lastMaintenance}
                      onChange={(e) => setFormState({ ...formState, lastMaintenance: e.target.value })}
                    />
                  </div>

                  <div className="flex gap-3 pt-6">
                    <button 
                      type="submit" 
                      className="btn-primary flex-1 py-3 text-xs"
                      style={{ background: 'linear-gradient(135deg, #00D68F, #00B376)' }}
                    >
                      <i className="fas fa-save mr-2" /> Save Parameters
                    </button>
                    <button 
                      type="button" 
                      onClick={() => selectedMachine ? setIsEditing(false) : setIsDrawerOpen(false)}
                      className="btn-secondary text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6 flex-1 flex flex-col justify-between">
                  {/* Views */}
                  <div className="space-y-6">
                    {/* Header info */}
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white"
                        style={{
                          background: selectedMachine.status === 'Running' ? 'rgba(0, 214, 143, 0.12)' : selectedMachine.status === 'Idle' ? 'rgba(255, 179, 64, 0.12)' : 'rgba(255, 71, 87, 0.12)',
                          color: selectedMachine.status === 'Running' ? '#00D68F' : selectedMachine.status === 'Idle' ? '#FFB340' : '#FF4757'
                        }}>
                        <i className="fas fa-gears text-lg" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{selectedMachine.machineName}</h4>
                        <span className="text-[10px] font-semibold text-[#00E5FF] uppercase tracking-wider">{selectedMachine.zone} Node</span>
                      </div>
                    </div>

                    <div className="h-px bg-white/[0.04]" />

                    {/* Circular Health indicator & Temperature Gauge */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                      <CircularHealthGauge val={selectedMachine.health} />
                      <TemperatureGauge temp={selectedMachine.temperature} />
                    </div>

                    <div className="h-px bg-white/[0.04]" />

                    {/* Operational detail list */}
                    <div className="space-y-3 text-xs">
                      {[
                        { label: 'Asset Model ID', val: selectedMachine.machineId },
                        { label: 'Plant Zone Location', val: selectedMachine.zone },
                        { label: 'Operating hours logged', val: `${selectedMachine.workingHours} Hours` },
                        { label: 'Current Shift Allocation', val: selectedMachine.currentShift },
                        { label: 'Assigned Station Operator', val: selectedMachine.assignedOperator },
                        { label: 'Last Maintenance Audit', val: selectedMachine.lastMaintenance }
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
                      <i className="fas fa-screwdriver-wrench mr-2" /> Modify Parameters
                    </button>
                    <button 
                      onClick={() => handleDelete(selectedMachine.machineId)}
                      className="btn-danger py-3 text-xs flex items-center justify-center"
                    >
                      <i className="fas fa-trash-can mr-2" /> Decommission
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
