import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { subscribeCollection, saveMachine, deleteMachine, toggleMachinePower, updateMachineStatus } from '../services/firestoreService';
import { STEEL_ZONES } from '../services/steelDataSeed';
import { useToast } from '../context/ToastContext';

export default function Machinery() {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [zoneFilter, setZoneFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(9);

  // Drawer states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState({
    machineName: '',
    machineId: '',
    zone: STEEL_ZONES[0],
    operator: 'Unassigned',
    status: 'Running',
    power: 'ON',
    temperature: 650,
    workingHours: 1200,
    health: 90,
    efficiency: 95.0,
    lastMaintenance: '2026-07-01'
  });

  const { showToast } = useToast();

  useEffect(() => {
    // Real-time Firestore subscription to 'machines'
    const unsubscribe = subscribeCollection('machines', (data) => {
      setMachines(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handlePowerToggle = async (machineId, currentPower) => {
    const nextPower = currentPower === 'OFF' ? 'ON' : 'OFF';
    try {
      await toggleMachinePower(machineId, nextPower);
      showToast(nextPower === 'OFF' ? `Machine ${machineId} powered OFF. Alert generated!` : `Machine ${machineId} powered ON. Operations resumed.`, nextPower === 'OFF' ? 'error' : 'success');
    } catch (err) {
      showToast('Error toggling machine power', 'error');
    }
  };

  const handleStatusChange = async (machineId, newStatus) => {
    try {
      await updateMachineStatus(machineId, newStatus);
      showToast(`Machine ${machineId} state updated to ${newStatus}`);
    } catch (err) {
      showToast('Error updating machine status', 'error');
    }
  };

  // Search & Filter
  const filteredMachines = machines.filter(m => {
    const matchesSearch = (m.machineName || '').toLowerCase().includes(search.toLowerCase()) ||
                          (m.machineId || '').toLowerCase().includes(search.toLowerCase()) ||
                          (m.operator || '').toLowerCase().includes(search.toLowerCase()) ||
                          (m.stageName || '').toLowerCase().includes(search.toLowerCase());
    const matchesZone = zoneFilter === 'All' || m.zone === zoneFilter;
    const matchesStatus = statusFilter === 'All' || m.status === statusFilter;
    return matchesSearch && matchesZone && matchesStatus;
  });

  // Pagination
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredMachines.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.max(1, Math.ceil(filteredMachines.length / rowsPerPage));

  const handleRowClick = (mach) => {
    setSelectedMachine(mach);
    setFormState({ ...mach });
    setIsEditing(false);
    setIsDrawerOpen(true);
  };

  const handleCreateNewClick = () => {
    setSelectedMachine(null);
    const idNum = machines.length + 1;
    setFormState({
      machineName: '',
      machineId: `MCH-${idNum < 10 ? '00' + idNum : idNum < 100 ? '0' + idNum : idNum}`,
      zone: STEEL_ZONES[0],
      operator: 'Unassigned',
      status: 'Running',
      power: 'ON',
      temperature: 450,
      workingHours: 0,
      health: 100,
      efficiency: 98.0,
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
    } catch (err) {
      showToast('Error saving machine parameters', 'error');
    }
  };

  const renderStatus = (status, power) => {
    if (power === 'OFF' || status === 'Offline') {
      return <span className="status-badge status-down">🔴 OFF / Offline</span>;
    }
    switch (status) {
      case 'Running':
        return <span className="status-badge status-running">🟢 Running</span>;
      case 'Idle':
        return <span className="status-badge status-idle">🟡 Idle</span>;
      case 'Maintenance':
        return <span className="status-badge status-warning">🟠 Maintenance</span>;
      default:
        return <span className="status-badge status-down">⚪ Offline</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-xl font-bold text-white tracking-tight uppercase">Steel Equipment Telemetry & Controls</h1>
          <p className="text-xs" style={{ color: '#8899AA' }}>Real-time telemetry monitoring and manual machine power controls for 35+ steel manufacturing units.</p>
        </motion.div>

        <div className="flex items-center gap-3">
          {/* View Mode Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <button 
              onClick={() => setViewMode('grid')} 
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'grid' ? 'bg-[#0066FF] text-white' : 'text-[#8899AA]'}`}
            >
              <i className="fas fa-grip mr-1.5" /> Control Cards
            </button>
            <button 
              onClick={() => setViewMode('table')} 
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'table' ? 'bg-[#0066FF] text-white' : 'text-[#8899AA]'}`}
            >
              <i className="fas fa-list mr-1.5" /> Table View
            </button>
          </div>

          <button 
            onClick={handleCreateNewClick}
            className="btn-primary flex items-center gap-2"
          >
            <i className="fas fa-plus text-xs" />
            <span>Register Equipment</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="glass-card-premium p-4 flex flex-col md:flex-row md:items-center gap-4 justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-xs" style={{ color: '#556677' }} />
          <input 
            type="text" 
            className="input !pl-10 !py-2.5 w-full text-xs"
            placeholder="Search Machine Name, ID, Operator, or Stage..."
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
              {STEEL_ZONES.map(z => <option key={z} value={z}>{z}</option>)}
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
              <option value="Running">Running</option>
              <option value="Idle">Idle</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Offline">Offline</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Rendering (Grid View or Table View) */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-2 border-white/[0.04] border-t-[#00E5FF] rounded-full animate-spin" />
          <span className="text-xs" style={{ color: '#8899AA' }}>Syncing equipment telemetry...</span>
        </div>
      ) : filteredMachines.length === 0 ? (
        <div className="glass-card-premium text-center py-16">
          <i className="fas fa-microchip text-2xl mb-3 text-[#FFB340]" />
          <p className="text-xs font-bold text-white uppercase tracking-wider">No Machinery Found</p>
          <p className="text-[10px] mt-1" style={{ color: '#556677' }}>No connected hardware logs match the active parameters.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {currentRows.map((mach) => (
            <MachineControlCard
              key={mach.machineId || mach.id}
              machine={mach}
              onRowClick={() => handleRowClick(mach)}
              onPowerToggle={handlePowerToggle}
              onStatusChange={handleStatusChange}
              renderStatus={renderStatus}
            />
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="glass-card-premium p-1">
          <div className="table-container">
            <table className="w-full">
              <thead>
                <tr>
                  <th>Machine Name</th>
                  <th>Zone & Stage</th>
                  <th>Operator</th>
                  <th>Status</th>
                  <th>Temperature</th>
                  <th>Working Hours</th>
                  <th>Health</th>
                  <th>Efficiency</th>
                  <th>Power Switch</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.map((mach) => {
                  const isOff = mach.power === 'OFF' || mach.status === 'Offline';
                  return (
                    <tr 
                      key={mach.machineId || mach.id} 
                      className="hover:bg-white/[0.02]"
                    >
                      <td className="text-xs font-bold text-white flex items-center gap-2 cursor-pointer" onClick={() => handleRowClick(mach)}>
                        <i className="fas fa-gear text-[10px] text-[#00E5FF]" />
                        <div>
                          <div>{mach.machineName}</div>
                          <span className="text-[9px] font-mono text-[#00E5FF]">{mach.machineId}</span>
                        </div>
                      </td>
                      <td className="text-xs font-medium text-white cursor-pointer" onClick={() => handleRowClick(mach)}>
                        <div>{mach.zone}</div>
                        <span className="text-[9px] text-[#8899AA]">{mach.stageName || 'Factory Floor'}</span>
                      </td>
                      <td className="text-xs cursor-pointer" style={{ color: '#8899AA' }} onClick={() => handleRowClick(mach)}>{mach.operator || 'Unassigned'}</td>
                      <td>{renderStatus(mach.status, mach.power)}</td>
                      <td className="text-xs font-bold" style={{ color: mach.temperature >= 1000 ? '#FF4757' : mach.temperature >= 500 ? '#FFB340' : '#00E5FF' }}>
                        {mach.temperature}°C
                      </td>
                      <td className="text-xs font-bold text-white">{mach.workingHours} hrs</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
                            <div className="h-full rounded-full" style={{
                              width: `${Math.min(mach.health || 0, 100)}%`,
                              background: mach.health >= 85 ? '#00D68F' : mach.health >= 60 ? '#FFB340' : '#FF4757'
                            }} />
                          </div>
                          <span className="text-[10px] font-bold text-white">{mach.health}%</span>
                        </div>
                      </td>
                      <td className="text-xs font-bold text-white">{mach.efficiency || 95}%</td>
                      <td>
                        <button
                          onClick={() => handlePowerToggle(mach.machineId || mach.id, mach.power || (isOff ? 'OFF' : 'ON'))}
                          className={`px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase transition-all ${
                            isOff ? 'bg-[#FF4757] text-white shadow-[0_0_10px_rgba(255,71,87,0.4)]' : 'bg-[#00D68F] text-white shadow-[0_0_10px_rgba(0,214,143,0.4)]'
                          }`}
                        >
                          {mach.power === 'OFF' || isOff ? 'OFF' : 'ON'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center text-xs mt-4">
          <span style={{ color: '#556677' }}>
            Showing {indexOfFirstRow + 1} to {Math.min(indexOfLastRow, filteredMachines.length)} of {filteredMachines.length} steel units
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
                background: 'var(--bg-card)',
                borderLeft: '1px solid var(--border-color)',
                boxShadow: 'var(--card-shadow)'
              }}
            >
              <div className="flex justify-between items-center pb-4 mb-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>
                  {selectedMachine ? `Machine Telemetry (${selectedMachine.machineId})` : 'Register Equipment'}
                </h3>
                <button onClick={() => setIsDrawerOpen(false)} className="text-[#8899AA] hover:text-white">
                  <i className="fas fa-times text-sm" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 flex-1">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider block mb-1 text-[#8899AA]">Machine Name</label>
                  <input 
                    type="text" 
                    required 
                    className="input w-full text-xs" 
                    value={formState.machineName}
                    onChange={(e) => setFormState({ ...formState, machineName: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider block mb-1 text-[#8899AA]">Zone</label>
                  <select 
                    className="filter-select w-full text-xs font-semibold"
                    value={formState.zone}
                    onChange={(e) => setFormState({ ...formState, zone: e.target.value })}
                  >
                    {STEEL_ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider block mb-1 text-[#8899AA]">Assigned Operator</label>
                    <input 
                      type="text" 
                      className="input w-full text-xs" 
                      value={formState.operator}
                      onChange={(e) => setFormState({ ...formState, operator: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider block mb-1 text-[#8899AA]">Status</label>
                    <select 
                      className="filter-select w-full text-xs font-semibold"
                      value={formState.status}
                      onChange={(e) => setFormState({ ...formState, status: e.target.value })}
                    >
                      <option value="Running">Running</option>
                      <option value="Idle">Idle</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Offline">Offline</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider block mb-1 text-[#8899AA]">Temperature (°C)</label>
                    <input 
                      type="number" 
                      className="input w-full text-xs" 
                      value={formState.temperature}
                      onChange={(e) => setFormState({ ...formState, temperature: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider block mb-1 text-[#8899AA]">Working Hours</label>
                    <input 
                      type="number" 
                      className="input w-full text-xs" 
                      value={formState.workingHours}
                      onChange={(e) => setFormState({ ...formState, workingHours: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider block mb-1 text-[#8899AA]">Health Index (%)</label>
                    <input 
                      type="number" 
                      className="input w-full text-xs" 
                      value={formState.health}
                      onChange={(e) => setFormState({ ...formState, health: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider block mb-1 text-[#8899AA]">Efficiency (%)</label>
                    <input 
                      type="number" 
                      className="input w-full text-xs" 
                      value={formState.efficiency}
                      onChange={(e) => setFormState({ ...formState, efficiency: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="submit" className="btn-primary flex-1 py-2.5 text-xs font-bold uppercase">
                    Save Changes
                  </button>
                  {selectedMachine && (
                    <button 
                      type="button" 
                      onClick={() => handleDelete(selectedMachine.machineId || selectedMachine.id)}
                      className="btn-danger py-2.5 px-4 text-xs font-bold uppercase"
                    >
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

// Machine Control Card Subcomponent
function MachineControlCard({ machine, onRowClick, onPowerToggle, onStatusChange, renderStatus }) {
  const isOff = machine.power === 'OFF' || machine.status === 'Offline';

  return (
    <div 
      className={`glass-card-premium p-5 flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${
        isOff ? 'border-[#FF4757]/40 shadow-[0_4px_25px_rgba(255,71,87,0.15)]' : ''
      }`}
    >
      <div>
        <div className="flex justify-between items-start gap-2 mb-3">
          <div className="cursor-pointer" onClick={onRowClick}>
            <span className="text-[9px] font-mono font-bold text-[#00E5FF]">{machine.machineId}</span>
            <h4 className="text-sm font-bold text-white leading-tight hover:text-[#00E5FF] transition-colors">{machine.machineName}</h4>
            <span className="text-[10px] text-[#8899AA] block mt-0.5">{machine.stageName || machine.zone}</span>
          </div>
          <div>{renderStatus(machine.status, machine.power)}</div>
        </div>

        <div className="grid grid-cols-2 gap-2 my-4 text-xs">
          <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <span className="text-[9px] font-bold uppercase tracking-wider block" style={{ color: '#556677' }}>Operator</span>
            <span className="font-bold text-white truncate block">{machine.operator || 'Unassigned'}</span>
          </div>
          <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <span className="text-[9px] font-bold uppercase tracking-wider block" style={{ color: '#556677' }}>Temperature</span>
            <span className="font-bold block" style={{ color: machine.temperature >= 1000 ? '#FF4757' : machine.temperature >= 500 ? '#FFB340' : '#00E5FF' }}>
              {machine.temperature}°C
            </span>
          </div>
          <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <span className="text-[9px] font-bold uppercase tracking-wider block" style={{ color: '#556677' }}>Health</span>
            <span className="font-bold text-white">{machine.health}%</span>
          </div>
          <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <span className="text-[9px] font-bold uppercase tracking-wider block" style={{ color: '#556677' }}>Hours</span>
            <span className="font-bold text-white">{machine.workingHours}h</span>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="pt-3 border-t border-white/[0.06] space-y-3">
        {/* Power Switch */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: isOff ? 'rgba(255,71,87,0.1)' : 'rgba(0,214,143,0.1)' }}>
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <i className={`fas fa-power-off text-xs ${isOff ? 'text-[#FF4757]' : 'text-[#00D68F]'}`} /> Power Switch
          </span>
          <button
            onClick={() => onPowerToggle(machine.machineId || machine.id, machine.power || (isOff ? 'OFF' : 'ON'))}
            className={`px-3 py-1 rounded-lg text-xs font-extrabold uppercase transition-all ${
              isOff ? 'bg-[#FF4757] text-white shadow-[0_0_10px_rgba(255,71,87,0.4)]' : 'bg-[#00D68F] text-white shadow-[0_0_10px_rgba(0,214,143,0.4)]'
            }`}
          >
            {machine.power === 'OFF' || isOff ? 'OFF' : 'ON'}
          </button>
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-4 gap-1">
          <button
            onClick={() => onStatusChange(machine.machineId || machine.id, 'Running')}
            className="py-1 rounded text-[9px] font-bold uppercase bg-white/[0.04] text-[#00D68F] hover:bg-[#00D68F]/20 flex items-center justify-center gap-1"
          >
            <i className="fas fa-play text-[8px]" /> Start
          </button>
          <button
            onClick={() => onStatusChange(machine.machineId || machine.id, 'Idle')}
            className="py-1 rounded text-[9px] font-bold uppercase bg-white/[0.04] text-[#FFB340] hover:bg-[#FFB340]/20 flex items-center justify-center gap-1"
          >
            <i className="fas fa-pause text-[8px]" /> Pause
          </button>
          <button
            onClick={() => onStatusChange(machine.machineId || machine.id, 'Offline')}
            className="py-1 rounded text-[9px] font-bold uppercase bg-white/[0.04] text-[#FF4757] hover:bg-[#FF4757]/20 flex items-center justify-center gap-1"
          >
            <i className="fas fa-stop text-[8px]" /> Stop
          </button>
          <button
            onClick={() => onStatusChange(machine.machineId || machine.id, 'Running')}
            className="py-1 rounded text-[9px] font-bold uppercase bg-white/[0.04] text-[#00E5FF] hover:bg-[#00E5FF]/20 flex items-center justify-center gap-1"
          >
            <i className="fas fa-rotate text-[8px]" /> Restart
          </button>
        </div>
      </div>
    </div>
  );
}
