import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { subscribeCollection, saveMachine, deleteMachine } from '../services/firestoreService';
import { useToast } from '../context/ToastContext';

const STEEL_ZONES = [
  'All Zones',
  'Raw Material Intake',
  'Blast Furnace Area',
  'Steel Converter Bay',
  'Continuous Caster Line',
  'Hot Rolling Mill',
  'Inspection & QA'
];

export default function Machinery() {
  const { showToast } = useToast();
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & View Mode
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState('All Zones');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [viewMode, setViewMode] = useState('cards');

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [formState, setFormState] = useState({
    machineId: '',
    machineName: '',
    zone: 'Hot Rolling Mill',
    temperature: 68.5,
    status: 'Running',
    health: 94,
    workingHours: 4500,
    assignedOperator: 'James Wilson',
    currentShift: 'Morning',
    lastMaintenance: new Date().toISOString().slice(0, 10)
  });

  useEffect(() => {
    let unsubscribe = subscribeCollection('machines', (data) => {
      setMachines(data);
      setLoading(false);
    });
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  // Control Actions
  const handleToggleStatus = async (machine) => {
    const newStatus = machine.status === 'Running' ? 'Idle' : 'Running';
    try {
      await saveMachine({ ...machine, status: newStatus });
      showToast(`${machine.machineName} status set to ${newStatus}`);
    } catch (err) {
      showToast('Failed to toggle status', 'error');
    }
  };

  const handleRestartMachine = async (machine) => {
    showToast(`Restart signal sent to ${machine.machineName}...`);
    try {
      await saveMachine({ ...machine, status: 'Running', health: Math.min(100, machine.health + 2) });
      showToast(`${machine.machineName} restarted successfully`, 'success');
    } catch (err) {
      showToast('Restart command failed', 'error');
    }
  };

  const handleScheduleMaintenance = async (machine) => {
    try {
      await saveMachine({ ...machine, status: 'Maintenance', lastMaintenance: new Date().toISOString().slice(0, 10) });
      showToast(`Maintenance scheduled for ${machine.machineName}`, 'warning');
    } catch (err) {
      showToast('Failed to schedule maintenance', 'error');
    }
  };

  const filteredMachines = machines.filter(m => {
    const matchesSearch = (m.machineName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (m.machineId || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesZone = selectedZone === 'All Zones' || m.zone === selectedZone;
    const matchesStatus = selectedStatus === 'All' || m.status === selectedStatus;
    return matchesSearch && matchesZone && matchesStatus;
  });

  const handleCreateNewClick = () => {
    setSelectedMachine(null);
    const nextNum = machines.length + 1;
    setFormState({
      machineId: `M-00${nextNum}`,
      machineName: '',
      zone: 'Hot Rolling Mill',
      temperature: 65.0,
      status: 'Running',
      health: 95,
      workingHours: 1200,
      assignedOperator: 'James Wilson',
      currentShift: 'Morning',
      lastMaintenance: new Date().toISOString().slice(0, 10)
    });
    setIsDrawerOpen(true);
  };

  const handleEditClick = (machine) => {
    setSelectedMachine(machine);
    setFormState({ ...machine });
    setIsDrawerOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await saveMachine(formState);
      showToast(selectedMachine ? 'Machine config updated' : 'New equipment added to Firestore');
      setIsDrawerOpen(false);
    } catch (err) {
      showToast('Error saving machine record', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <div className="w-10 h-10 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border-color)', borderTopColor: 'var(--primary)' }} />
        <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Loading equipment diagnostics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-page-title" style={{ color: 'var(--text-main)' }}>Equipment Telemetry & Control</h1>
          <p className="text-card-label" style={{ color: 'var(--text-secondary)' }}>Monitor thermal diagnostics, operating hours, health gauges, and hardware controls.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 rounded-xl border" style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)' }}>
            <button onClick={() => setViewMode('cards')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'cards' ? 'bg-[var(--primary)] text-white shadow-md' : 'text-[var(--text-secondary)]'}`}>
              <i className="fas fa-grip mr-1.5" /> Cards
            </button>
            <button onClick={() => setViewMode('table')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'table' ? 'bg-[var(--primary)] text-white shadow-md' : 'text-[var(--text-secondary)]'}`}>
              <i className="fas fa-list mr-1.5" /> Table
            </button>
          </div>
          <button onClick={handleCreateNewClick} className="btn-primary-saas">
            <i className="fas fa-plus text-xs" />
            <span>Add Equipment</span>
          </button>
        </div>
      </motion.div>

      {/* Filter Bar */}
      <div className="saas-card !p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--text-secondary)' }} />
          <input
            placeholder="Search machine name, ID..."
            className="input-saas !pl-10 !py-2 text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select className="input-saas !py-2 text-xs w-full sm:w-auto" value={selectedZone} onChange={(e) => setSelectedZone(e.target.value)}>
            {STEEL_ZONES.map(z => <option key={z} value={z}>{z}</option>)}
          </select>
          <select className="input-saas !py-2 text-xs w-full sm:w-auto" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="Running">Running</option>
            <option value="Idle">Idle</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {/* MACHINERY VIEW MODE */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMachines.map((m) => {
            const statusClass = m.status === 'Running' ? 'saas-badge-running' : m.status === 'Idle' ? 'saas-badge-idle' : 'saas-badge-down';

            return (
              <div key={m.machineId || m.id} className="saas-card flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-mono font-bold" style={{ color: 'var(--secondary-blue)' }}>{m.machineId}</span>
                    <span className={`saas-badge ${statusClass}`}>{m.status}</span>
                  </div>

                  <h3 className="text-section-title" style={{ color: 'var(--text-main)' }}>{m.machineName}</h3>
                  <span className="text-card-label block" style={{ color: 'var(--text-secondary)' }}>Zone: {m.zone}</span>

                  <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t text-center" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="p-2.5 rounded-xl border" style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)' }}>
                      <span className="text-[10px] font-bold uppercase tracking-widest block" style={{ color: 'var(--text-secondary)' }}>Core Temp</span>
                      <span className="text-sm font-bold mt-0.5 block" style={{ color: 'var(--warning)' }}>{m.temperature}°C</span>
                    </div>
                    <div className="p-2.5 rounded-xl border" style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)' }}>
                      <span className="text-[10px] font-bold uppercase tracking-widest block" style={{ color: 'var(--text-secondary)' }}>Health Gauge</span>
                      <span className="text-sm font-bold mt-0.5 block" style={{ color: m.health >= 85 ? 'var(--success)' : 'var(--warning)' }}>{m.health}%</span>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1 text-xs">
                    <div className="flex justify-between" style={{ color: 'var(--text-secondary)' }}>
                      <span>Operator:</span>
                      <span className="font-semibold" style={{ color: 'var(--text-main)' }}>{m.assignedOperator}</span>
                    </div>
                    <div className="flex justify-between" style={{ color: 'var(--text-secondary)' }}>
                      <span>Hours Logged:</span>
                      <span className="font-semibold" style={{ color: 'var(--text-main)' }}>{m.workingHours} Hrs</span>
                    </div>
                  </div>
                </div>

                {/* CONTROL BUTTONS TOOLBAR */}
                <div className="pt-3 border-t flex items-center justify-between gap-2" style={{ borderColor: 'var(--border-color)' }}>
                  <button
                    onClick={() => handleToggleStatus(m)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      m.status === 'Running' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    }`}
                  >
                    <i className={`fas ${m.status === 'Running' ? 'fa-pause' : 'fa-play'} mr-1`} />
                    {m.status === 'Running' ? 'Pause' : 'Start'}
                  </button>

                  <button
                    onClick={() => handleRestartMachine(m)}
                    className="flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all"
                    style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)', color: 'var(--primary-blue)' }}
                  >
                    <i className="fas fa-rotate-right mr-1" /> Restart
                  </button>

                  <button
                    onClick={() => handleScheduleMaintenance(m)}
                    className="py-1.5 px-3 rounded-xl text-xs font-bold border transition-all text-red-500 bg-red-500/10 border-red-500/20"
                    title="Schedule Maintenance"
                  >
                    <i className="fas fa-screwdriver-wrench" />
                  </button>
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
                <th>Machine ID</th>
                <th>Machine Name</th>
                <th>Zone</th>
                <th>Core Temp</th>
                <th>Health Gauge</th>
                <th>Operating Hours</th>
                <th>Operator</th>
                <th>Status</th>
                <th className="text-right">Control Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMachines.map((m) => (
                <tr key={m.machineId || m.id}>
                  <td className="font-mono text-xs font-bold" style={{ color: 'var(--secondary-blue)' }}>{m.machineId}</td>
                  <td className="font-bold" style={{ color: 'var(--text-main)' }}>{m.machineName}</td>
                  <td>{m.zone}</td>
                  <td className="font-bold" style={{ color: 'var(--warning)' }}>{m.temperature}°C</td>
                  <td className="font-bold" style={{ color: m.health >= 85 ? 'var(--success)' : 'var(--warning)' }}>{m.health}%</td>
                  <td>{m.workingHours} Hrs</td>
                  <td>{m.assignedOperator}</td>
                  <td>
                    <span className={`saas-badge ${m.status === 'Running' ? 'saas-badge-running' : m.status === 'Idle' ? 'saas-badge-idle' : 'saas-badge-down'}`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="text-right space-x-2">
                    <button onClick={() => handleToggleStatus(m)} className="btn-icon-saas !w-8 !h-8 inline-flex">
                      <i className={`fas ${m.status === 'Running' ? 'fa-pause' : 'fa-play'} text-xs`} />
                    </button>
                    <button onClick={() => handleEditClick(m)} className="btn-icon-saas !w-8 !h-8 inline-flex">
                      <i className="fas fa-pen text-xs" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* EDIT DRAWER */}
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
                  {selectedMachine ? `Edit ${selectedMachine.machineId}` : 'Register Equipment'}
                </h3>
                <button onClick={() => setIsDrawerOpen(false)} className="btn-icon-saas !w-8 !h-8">
                  <i className="fas fa-times text-xs" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 flex-1">
                <div>
                  <label className="text-card-label uppercase block mb-1" style={{ color: 'var(--text-secondary)' }}>Machine ID</label>
                  <input type="text" required className="input-saas text-xs font-mono" value={formState.machineId} onChange={(e) => setFormState({ ...formState, machineId: e.target.value })} />
                </div>

                <div>
                  <label className="text-card-label uppercase block mb-1" style={{ color: 'var(--text-secondary)' }}>Equipment Name</label>
                  <input type="text" required className="input-saas text-xs" value={formState.machineName} onChange={(e) => setFormState({ ...formState, machineName: e.target.value })} />
                </div>

                <div>
                  <label className="text-card-label uppercase block mb-1" style={{ color: 'var(--text-secondary)' }}>Zone</label>
                  <select className="input-saas text-xs" value={formState.zone} onChange={(e) => setFormState({ ...formState, zone: e.target.value })}>
                    {STEEL_ZONES.filter(z => z !== 'All Zones').map(z => <option key={z} value={z}>{z}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-card-label uppercase block mb-1" style={{ color: 'var(--text-secondary)' }}>Assigned Operator</label>
                  <input type="text" className="input-saas text-xs" value={formState.assignedOperator} onChange={(e) => setFormState({ ...formState, assignedOperator: e.target.value })} />
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="submit" className="btn-primary-saas flex-1">Save Machine Config</button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
