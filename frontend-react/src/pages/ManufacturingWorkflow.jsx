import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { subscribeCollection, toggleMachinePower, updateMachineStatus } from '../services/firestoreService';
import { SEED_MANUFACTURING_STAGES } from '../services/steelDataSeed';
import { useToast } from '../context/ToastContext';

export default function ManufacturingWorkflow() {
  const [stages, setStages] = useState(SEED_MANUFACTURING_STAGES);
  const [machines, setMachines] = useState([]);
  const [selectedStageId, setSelectedStageId] = useState('stage-1');
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    let unSubStages = subscribeCollection('manufacturingStages', (data) => {
      if (data && data.length > 0) {
        setStages(data.sort((a,b) => a.stageNumber - b.stageNumber));
      }
    });

    let unSubMachines = subscribeCollection('machines', (data) => {
      setMachines(data);
      setLoading(false);
    });

    return () => {
      unSubStages();
      unSubMachines();
    };
  }, []);

  const activeStage = stages.find(s => s.id === selectedStageId) || stages[0];
  const stageMachines = machines.filter(m => m.stageId === selectedStageId || (m.stageName && m.stageName.includes(`Stage ${activeStage?.stageNumber}`)));

  const handlePowerToggle = async (machineId, currentPower) => {
    const nextPower = currentPower === 'ON' ? 'OFF' : 'ON';
    try {
      await toggleMachinePower(machineId, nextPower);
      showToast(nextPower === 'OFF' ? `Machine ${machineId} powered OFF. Stage alerted!` : `Machine ${machineId} powered ON. Stage resumed!`, nextPower === 'OFF' ? 'error' : 'success');
    } catch (err) {
      showToast('Failed to update machine power state', 'error');
    }
  };

  const handleStatusChange = async (machineId, newStatus) => {
    try {
      await updateMachineStatus(machineId, newStatus);
      showToast(`Machine ${machineId} status changed to ${newStatus}`);
    } catch (err) {
      showToast('Failed to update machine status', 'error');
    }
  };

  const renderStatusBadge = (status, power) => {
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
      {/* Page Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-[#0066FF]/10 text-[#00E5FF] border border-[#0066FF]/20 mb-1">
            <i className="fas fa-[#00E5FF] text-[8px] animate-pulse" /> Industry 4.0 Digital Twin
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight uppercase">End-to-End Steel Manufacturing Workflow</h1>
          <p className="text-xs" style={{ color: '#8899AA' }}>Real-time telemetry and equipment state simulation across all 12 steel plant stages.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/[0.04] text-xs font-semibold text-white" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <span className="w-2.5 h-2.5 rounded-full bg-[#00D68F] animate-pulse" />
            <span>Material Flow: Active</span>
          </div>
        </div>
      </div>

      {/* 12-Stage Horizontal Interactive Digital Twin Timeline */}
      <div className="glass-card-premium p-4 relative overflow-x-auto">
        <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-3 flex items-center justify-between">
          <span>Digital Twin Stage Pipeline</span>
          <span className="text-[10px] font-normal" style={{ color: '#556677' }}>Click stage to view machines & live metrics</span>
        </h3>

        <div className="flex items-center gap-3 min-w-[1100px] py-3 px-1 relative">
          {stages.map((st, idx) => {
            const isSelected = st.id === selectedStageId;
            const isLast = idx === stages.length - 1;
            const stageMachs = machines.filter(m => m.stageId === st.id || (m.stageName && m.stageName.includes(`Stage ${st.stageNumber}`)));
            const hasOffline = stageMachs.some(m => m.power === 'OFF' || m.status === 'Offline');
            const hasMaint = stageMachs.some(m => m.status === 'Maintenance');

            const stateColor = hasOffline ? '#FF4757' : hasMaint ? '#FFB340' : '#00D68F';

            return (
              <div key={st.id} className="flex items-center gap-3 flex-shrink-0">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedStageId(st.id)}
                  className={`p-3 rounded-xl flex flex-col justify-between w-44 h-28 text-left transition-all duration-300 relative border cursor-pointer ${
                    isSelected ? 'shadow-[0_4px_25px_rgba(0,102,255,0.3)]' : ''
                  }`}
                  style={{
                    background: isSelected 
                      ? 'linear-gradient(135deg, rgba(0,102,255,0.22), rgba(0,229,255,0.08))' 
                      : 'rgba(255,255,255,0.02)',
                    borderColor: isSelected ? '#00E5FF' : 'rgba(255,255,255,0.06)'
                  }}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[9px] font-extrabold uppercase tracking-widest" style={{ color: isSelected ? '#00E5FF' : '#556677' }}>
                      ST-{st.stageNumber}
                    </span>
                    <span className="w-2 h-2 rounded-full" style={{ background: stateColor, boxShadow: `0 0 8px ${stateColor}` }} />
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white leading-snug line-clamp-2">{st.name.replace(/Stage \d+ – /, '')}</h4>
                    <span className="text-[9px]" style={{ color: '#8899AA' }}>{stageMachs.length} Units Connected</span>
                  </div>
                </motion.button>

                {!isLast && (
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-0.5" style={{ background: 'linear-gradient(90deg, #0066FF, #00E5FF)' }} />
                    <i className="fas fa-chevron-right text-[10px] text-[#00E5FF] animate-pulse" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Stage Detail Panel */}
      {activeStage && (
        <motion.div 
          key={activeStage.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Stage Overview Banner */}
          <div className="glass-card-premium p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, #0066FF, #0052CC)' }}>
                  <i className="fas fa-industry text-base" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight uppercase">{activeStage.name}</h2>
                  <p className="text-xs" style={{ color: '#8899AA' }}>{activeStage.description}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <div className="px-4 py-2 rounded-xl border border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <span className="text-[9px] font-bold uppercase tracking-wider block" style={{ color: '#556677' }}>Zone Allocation</span>
                <span className="text-xs font-bold text-white">{activeStage.zone}</span>
              </div>
              <div className="px-4 py-2 rounded-xl border border-white/[0.06]" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <span className="text-[9px] font-bold uppercase tracking-wider block" style={{ color: '#556677' }}>Active Machines</span>
                <span className="text-xs font-bold text-[#00E5FF]">{stageMachines.filter(m => m.power !== 'OFF' && m.status === 'Running').length} / {stageMachines.length} Units</span>
              </div>
            </div>
          </div>

          {/* Machine Grid in Selected Stage */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-4 flex items-center gap-2">
              <i className="fas fa-gears text-[#00E5FF]" />
              <span>Stage Machinery & Interactive Telemetry ({stageMachines.length})</span>
            </h3>

            {stageMachines.length === 0 ? (
              <div className="glass-card-premium p-12 text-center">
                <i className="fas fa-microchip text-3xl mb-3 text-[#FFB340]" />
                <p className="text-sm font-bold text-white uppercase">No Equipment Registered in {activeStage.name}</p>
                <p className="text-xs text-[#8899AA] mt-1">Use the "Seed Demo Data" button in Topbar to populate 35+ steel machines.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                {stageMachines.map((mach) => (
                  <MachineCard 
                    key={mach.machineId || mach.id}
                    machine={mach}
                    onPowerToggle={handlePowerToggle}
                    onStatusChange={handleStatusChange}
                    renderStatusBadge={renderStatusBadge}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Machine Card Component with Power Toggle & Action Controls
function MachineCard({ machine, onPowerToggle, onStatusChange, renderStatusBadge }) {
  const isOff = machine.power === 'OFF' || machine.status === 'Offline';
  const isMaint = machine.status === 'Maintenance';
  const isRunning = machine.status === 'Running' && !isOff;

  return (
    <div 
      className={`glass-card-premium p-5 flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${
        isOff ? 'border-[#FF4757]/40 shadow-[0_4px_25px_rgba(255,71,87,0.15)]' : ''
      }`}
    >
      {/* Top Header */}
      <div>
        <div className="flex justify-between items-start gap-3 mb-3">
          <div>
            <span className="text-[9px] font-mono font-bold text-[#00E5FF]">{machine.machineId}</span>
            <h4 className="text-sm font-bold text-white leading-tight">{machine.machineName}</h4>
            <p className="text-[10px] text-[#8899AA] line-clamp-1 mt-0.5">{machine.role}</p>
          </div>
          <div>{renderStatusBadge(machine.status, machine.power)}</div>
        </div>

        {/* Essential Telemetry Grid */}
        <div className="grid grid-cols-2 gap-2 my-4 text-xs">
          <div className="p-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <span className="text-[9px] font-bold uppercase tracking-wider block" style={{ color: '#556677' }}>Operator</span>
            <span className="font-bold text-white truncate block">{machine.operator || 'Unassigned'}</span>
          </div>

          <div className="p-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <span className="text-[9px] font-bold uppercase tracking-wider block" style={{ color: '#556677' }}>Temperature</span>
            <span className="font-bold block" style={{ color: machine.temperature >= 1000 ? '#FF4757' : machine.temperature >= 500 ? '#FFB340' : '#00E5FF' }}>
              {machine.temperature}°C
            </span>
          </div>

          <div className="p-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <span className="text-[9px] font-bold uppercase tracking-wider block" style={{ color: '#556677' }}>Health Index</span>
            <span className="font-bold text-white">{machine.health}%</span>
          </div>

          <div className="p-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <span className="text-[9px] font-bold uppercase tracking-wider block" style={{ color: '#556677' }}>Working Hours</span>
            <span className="font-bold text-white">{machine.workingHours} hrs</span>
          </div>

          {/* Stage-Specific Metric preview if exists */}
          {machine.pressure && (
            <div className="p-2.5 rounded-lg col-span-2" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <span className="text-[9px] font-bold uppercase tracking-wider block" style={{ color: '#556677' }}>Pressure</span>
              <span className="font-bold text-[#00E5FF]">{machine.pressure}</span>
            </div>
          )}
          {machine.castingSpeed && (
            <div className="p-2.5 rounded-lg col-span-2" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <span className="text-[9px] font-bold uppercase tracking-wider block" style={{ color: '#556677' }}>Casting Speed</span>
              <span className="font-bold text-[#00E5FF]">{machine.castingSpeed}</span>
            </div>
          )}
          {machine.rollingForce && (
            <div className="p-2.5 rounded-lg col-span-2" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <span className="text-[9px] font-bold uppercase tracking-wider block" style={{ color: '#556677' }}>Rolling Force</span>
              <span className="font-bold text-[#00E5FF]">{machine.rollingForce}</span>
            </div>
          )}
        </div>
      </div>

      {/* Manual Control Action Bar */}
      <div className="pt-3 border-t border-white/[0.06] space-y-3">
        {/* Power Switch Toggle */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: isOff ? 'rgba(255,71,87,0.1)' : 'rgba(0,214,143,0.1)' }}>
          <div className="flex items-center gap-2">
            <i className={`fas fa-power-off text-xs ${isOff ? 'text-[#FF4757]' : 'text-[#00D68F]'}`} />
            <span className="text-xs font-bold text-white">Power Switch</span>
          </div>

          <button
            onClick={() => onPowerToggle(machine.machineId || machine.id, machine.power || (isOff ? 'OFF' : 'ON'))}
            className={`px-3 py-1 rounded-lg text-xs font-extrabold uppercase transition-all duration-200 cursor-pointer ${
              isOff ? 'bg-[#FF4757] text-white shadow-[0_0_12px_rgba(255,71,87,0.5)]' : 'bg-[#00D68F] text-white shadow-[0_0_12px_rgba(0,214,143,0.5)]'
            }`}
          >
            {machine.power === 'OFF' || isOff ? 'OFF' : 'ON'}
          </button>
        </div>

        {/* Action Controls (Start, Pause, Stop, Restart) */}
        <div className="grid grid-cols-4 gap-1.5">
          <button
            onClick={() => onStatusChange(machine.machineId || machine.id, 'Running')}
            title="Start Machine"
            className="py-1.5 rounded-lg text-[10px] font-bold uppercase bg-white/[0.04] text-[#00D68F] hover:bg-[#00D68F]/20 flex items-center justify-center gap-1 transition-all"
          >
            <i className="fas fa-play text-[9px]" /> Start
          </button>

          <button
            onClick={() => onStatusChange(machine.machineId || machine.id, 'Idle')}
            title="Pause Machine"
            className="py-1.5 rounded-lg text-[10px] font-bold uppercase bg-white/[0.04] text-[#FFB340] hover:bg-[#FFB340]/20 flex items-center justify-center gap-1 transition-all"
          >
            <i className="fas fa-pause text-[9px]" /> Pause
          </button>

          <button
            onClick={() => onStatusChange(machine.machineId || machine.id, 'Offline')}
            title="Stop Machine"
            className="py-1.5 rounded-lg text-[10px] font-bold uppercase bg-white/[0.04] text-[#FF4757] hover:bg-[#FF4757]/20 flex items-center justify-center gap-1 transition-all"
          >
            <i className="fas fa-stop text-[9px]" /> Stop
          </button>

          <button
            onClick={() => onStatusChange(machine.machineId || machine.id, 'Running')}
            title="Restart Machine"
            className="py-1.5 rounded-lg text-[10px] font-bold uppercase bg-white/[0.04] text-[#00E5FF] hover:bg-[#00E5FF]/20 flex items-center justify-center gap-1 transition-all"
          >
            <i className="fas fa-rotate text-[9px]" /> Restart
          </button>
        </div>
      </div>
    </div>
  );
}
