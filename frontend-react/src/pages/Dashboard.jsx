import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { subscribeCollection, getSettings } from '../services/firestoreService';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';

ChartJS.register(...registerables);

export default function Dashboard() {
  const { user, role } = useAuth();
  const { theme } = useTheme();
  const [workers, setWorkers] = useState([]);
  const [machines, setMachines] = useState([]);
  const [productionData, setProductionData] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unSubWorkers = subscribeCollection('workers', (data) => {
      setWorkers(data);
      setLoading(false);
    });

    let unSubMachines = subscribeCollection('machines', (data) => {
      setMachines(data);
    });

    let unSubProduction = subscribeCollection('production', (data) => {
      setProductionData(data);
    });

    let unSubNotifications = subscribeCollection('notifications', (data) => {
      setNotifications(data);
    });

    getSettings().then(setSettings);

    return () => {
      if (unSubWorkers) unSubWorkers();
      if (unSubMachines) unSubMachines();
      if (unSubProduction) unSubProduction();
      if (unSubNotifications) unSubNotifications();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <div className="w-10 h-10 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border-color)', borderTopColor: 'var(--primary)' }} />
        <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Syncing telemetry data...</span>
      </div>
    );
  }

  return role === 'admin' ? (
    <AdminDashboard workers={workers} machines={machines} production={productionData} theme={theme} />
  ) : (
    <WorkerDashboard workerId={user?.id} workers={workers} machines={machines} settings={settings} notifications={notifications} />
  );
}

// =========================================================================
// ADMINISTRATOR DASHBOARD VIEW
// =========================================================================

function AdminDashboard({ workers, machines, production, theme }) {
  const isDark = theme === 'dark';
  const chartTheme = {
    text: isDark ? '#94A3B8' : '#6B7280',
    grid: isDark ? 'rgba(255, 255, 255, 0.06)' : '#E5E7EB',
    blue: '#2563EB',
    cyan: '#06B6D4',
    green: '#10B981',
    yellow: '#F59E0B',
    red: '#EF4444',
    purple: '#8B5CF6'
  };

  const totalWorkers = workers.length;
  const runningMachines = machines.filter(m => m.status === 'Running').length;
  const idleMachines = machines.filter(m => m.status === 'Idle').length;
  const activeMachines = runningMachines + idleMachines;
  const todayProduction = production
    .reduce((sum, curr) => sum + (curr.quantity || 0), 0) || 4820;

  // Chart 1: Machine Temp
  const tempTrendData = {
    labels: machines.slice(0, 10).map(m => m.machineName),
    datasets: [{
      label: 'Core Temp (°C)',
      data: machines.slice(0, 10).map(m => m.temperature),
      borderColor: chartTheme.cyan,
      backgroundColor: 'rgba(6, 182, 212, 0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
    }]
  };

  // Chart 2: Attendance Trend
  const attendanceTrendData = {
    labels: workers.slice(0, 10).map(w => w.name.split(' ')[0]),
    datasets: [{
      label: 'Attendance Rate (%)',
      data: workers.slice(0, 10).map(w => w.attendance),
      backgroundColor: workers.slice(0, 10).map(w => w.attendance >= 95 ? chartTheme.green : chartTheme.yellow),
      borderRadius: 6,
    }]
  };

  // Chart 3: Production Trend
  const prodDates = [...new Set(production.map(p => p.date))].sort().slice(-7);
  const prodTotals = prodDates.map(date => 
    production.filter(p => p.date === date).reduce((s, c) => s + c.quantity, 0)
  );
  const productionTrendData = {
    labels: prodDates.map(d => String(d).slice(5)),
    datasets: [{
      label: 'Output (Tons)',
      data: prodTotals.length ? prodTotals : [120, 145, 130, 160, 155, 170, 185],
      borderColor: chartTheme.blue,
      backgroundColor: 'rgba(37, 99, 235, 0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.3,
    }]
  };

  // Chart 4: Shift Production
  const shiftProduction = {
    labels: ['Morning', 'Afternoon', 'Night'],
    datasets: [{
      label: 'Shift Yield',
      data: [
        production.filter(p => p.shift === 'Morning').reduce((s, c) => s + c.quantity, 0) || 450,
        production.filter(p => p.shift === 'Afternoon').reduce((s, c) => s + c.quantity, 0) || 380,
        production.filter(p => p.shift === 'Night').reduce((s, c) => s + c.quantity, 0) || 290
      ],
      backgroundColor: [chartTheme.cyan, chartTheme.blue, chartTheme.purple],
      borderRadius: 6
    }]
  };

  // Chart 5: Machine Status Distribution
  const maintenanceCount = machines.filter(m => m.status === 'Maintenance').length;
  const statusDistributionData = {
    labels: ['Running', 'Idle', 'Maintenance'],
    datasets: [{
      data: [runningMachines || 10, idleMachines || 3, maintenanceCount || 2],
      backgroundColor: [chartTheme.green, chartTheme.yellow, chartTheme.red],
      borderWidth: 0,
      hoverOffset: 6
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: chartTheme.text, font: { size: 9 } } },
      y: { grid: { color: chartTheme.grid }, ticks: { color: chartTheme.text, font: { size: 9 } } }
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold tracking-tight uppercase" style={{ color: 'var(--text-main)' }}>Dashboard Home</h1>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Real-time factory floor metrics and system summaries.</p>
      </motion.div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard icon="fa-users" label="Total Workers" value={totalWorkers} color="var(--primary)" />
        <KPICard icon="fa-circle-nodes" label="Active Machines" value={activeMachines} color="var(--secondary)" />
        <KPICard icon="fa-industry" label="Today's Production" value={todayProduction} suffix=" tons" color="#8B5CF6" />
        <KPICard icon="fa-circle-play" label="Running Machines" value={runningMachines} color="var(--success)" />
      </div>

      {/* Grid of Minimal Charts */}
      <div className="grid lg:grid-cols-12 gap-5">
        {/* Production Output */}
        <div className="lg:col-span-8 glass-card-premium p-5 min-h-[300px] flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-main)' }}>Production Yield Trend</h3>
            <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Total steel output produced over recent active shifts.</p>
          </div>
          <div className="h-56">
            <Line data={productionTrendData} options={chartOptions} />
          </div>
        </div>

        {/* Machine Status Allocation */}
        <div className="lg:col-span-4 glass-card-premium p-5 min-h-[300px] flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-main)' }}>Machine Status Allocation</h3>
            <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Hardware operational breakdown.</p>
          </div>
          <div className="h-40 flex items-center justify-center relative">
            <Doughnut data={statusDistributionData} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              cutout: '72%'
            }} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>{machines.length}</span>
              <span className="text-[8px] font-extrabold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Units</span>
            </div>
          </div>
          <div className="flex justify-around text-[10px] font-bold mt-2">
            <span className="flex items-center gap-1.5" style={{ color: 'var(--success)' }}>🟢 Running ({runningMachines})</span>
            <span className="flex items-center gap-1.5" style={{ color: 'var(--warning)' }}>🟡 Idle ({idleMachines})</span>
            <span className="flex items-center gap-1.5" style={{ color: 'var(--danger)' }}>🔴 Down ({maintenanceCount})</span>
          </div>
        </div>

        {/* Core Temp Diagnostics */}
        <div className="lg:col-span-4 glass-card-premium p-5 min-h-[280px]">
          <div className="mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-main)' }}>Core Temp Diagnostics</h3>
            <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Thermal data by active mill node.</p>
          </div>
          <div className="h-48">
            <Line data={tempTrendData} options={chartOptions} />
          </div>
        </div>

        {/* Shift Output Yield */}
        <div className="lg:col-span-4 glass-card-premium p-5 min-h-[280px]">
          <div className="mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-main)' }}>Shift Output Yield</h3>
            <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Yield comparison by active shift.</p>
          </div>
          <div className="h-48">
            <Bar data={shiftProduction} options={chartOptions} />
          </div>
        </div>

        {/* Attendance Rates */}
        <div className="lg:col-span-4 glass-card-premium p-5 min-h-[280px]">
          <div className="mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-main)' }}>Personnel Attendance</h3>
            <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Team presence tracker.</p>
          </div>
          <div className="h-48">
            <Bar data={attendanceTrendData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ icon, label, value, suffix = '', color }) {
  return (
    <div className="glass-card-premium p-5 relative overflow-hidden group">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm"
          style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)', color }}>
          <i className={`fas ${icon}`} />
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>{label}</div>
          <div className="text-lg font-bold mt-0.5" style={{ color: 'var(--text-main)' }}>
            {value}
            {suffix && <span className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>{suffix}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// WORKER PERSONAL PORTAL VIEW
// =========================================================================

function WorkerDashboard({ workerId, workers, machines, settings }) {
  const currentWorker = workers.find(w => w.employeeId === workerId || w.id === workerId) || workers[0];
  const assignedMachine = currentWorker ? machines.find(m => m.machineName === currentWorker.assignedMachine || m.machineId === currentWorker.assignedMachine) : null;
  const currentShift = settings?.shifts?.find(s => s.name === currentWorker?.shift) || {
    name: 'Morning', start: '06:00', end: '14:00', supervisor: 'Lisa Anderson'
  };

  const statusColor = currentWorker?.status === 'Active' ? 'var(--success)' : currentWorker?.status === 'Break' ? 'var(--warning)' : 'var(--danger)';

  const CircularProgress = ({ value, color, size = 110, strokeWidth = 8, label }) => {
    const radius = (size - strokeWidth * 2) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - (value || 0) / 100);

    return (
      <div className="flex flex-col items-center gap-3">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--border-color)" strokeWidth={strokeWidth} />
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
              strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-base font-bold" style={{ color: 'var(--text-main)' }}>{value}%</span>
            <span className="text-[8px] font-extrabold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Target</span>
          </div>
        </div>
        <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>{label}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight uppercase" style={{ color: 'var(--text-main)' }}>Worker Personal Station</h1>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Live telemetry for assigned station, shift and performance logs.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border" style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)' }}>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: statusColor }} />
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>Status: {currentWorker?.status || 'Offline'}</span>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5 space-y-5">
          <div className="glass-card-premium p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold text-white"
                style={{ background: 'var(--primary)' }}>
                {currentWorker?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'ST'}
              </div>
              <div>
                <h3 className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>{currentWorker?.name || 'Smart Worker'}</h3>
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--secondary)' }}>ID: {currentWorker?.employeeId || 'W-000'}</span>
              </div>
            </div>
            
            <div className="h-px w-full" style={{ background: 'var(--border-color)' }} />

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl border" style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)' }}>
                <span className="text-[9px] font-bold uppercase tracking-widest block mb-1" style={{ color: 'var(--text-secondary)' }}>Department</span>
                <span className="font-semibold truncate block" style={{ color: 'var(--text-main)' }}>{currentWorker?.department}</span>
              </div>
              <div className="p-3 rounded-xl border" style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)' }}>
                <span className="text-[9px] font-bold uppercase tracking-widest block mb-1" style={{ color: 'var(--text-secondary)' }}>Factory Zone</span>
                <span className="font-semibold truncate block" style={{ color: 'var(--text-main)' }}>{currentWorker?.zone}</span>
              </div>
            </div>
          </div>

          <div className="glass-card-premium p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-main)' }}>Shift Allocation</h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2.5 rounded-xl border" style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)' }}>
                <div className="text-[9px] font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Shift</div>
                <div className="text-xs font-bold mt-1" style={{ color: 'var(--text-main)' }}>{currentShift.name}</div>
              </div>
              <div className="p-2.5 rounded-xl border" style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)' }}>
                <div className="text-[9px] font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Timings</div>
                <div className="text-xs font-bold mt-1" style={{ color: 'var(--text-main)' }}>{currentShift.start} - {currentShift.end}</div>
              </div>
              <div className="p-2.5 rounded-xl border" style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)' }}>
                <div className="text-[9px] font-extrabold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Supervisor</div>
                <div className="text-xs font-bold mt-1 truncate" style={{ color: 'var(--secondary)' }}>{currentShift.supervisor}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-5">
          {assignedMachine ? (
            <div className="glass-card-premium p-6 space-y-6">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <span className="text-[9px] font-extrabold uppercase tracking-widest" style={{ color: 'var(--secondary)' }}>Live Machinery Diagnostics</span>
                  <h3 className="text-base font-bold mt-0.5" style={{ color: 'var(--text-main)' }}>{assignedMachine.machineName}</h3>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    background: assignedMachine.status === 'Running' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: assignedMachine.status === 'Running' ? 'var(--success)' : 'var(--warning)'
                  }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ background: assignedMachine.status === 'Running' ? 'var(--success)' : 'var(--warning)' }} />
                  {assignedMachine.status}
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-6 items-center justify-center">
                <CircularProgress 
                  value={assignedMachine.health} 
                  color={assignedMachine.health >= 85 ? 'var(--success)' : 'var(--warning)'} 
                  label="Machine Health" 
                />

                <div className="flex flex-col items-center gap-3">
                  <div className="relative w-28 h-28 flex flex-col justify-center items-center rounded-full border" style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)' }}>
                    <i className="fas fa-temperature-three-quarters text-lg mb-1" style={{ color: 'var(--warning)' }} />
                    <span className="text-base font-bold" style={{ color: 'var(--text-main)' }}>{assignedMachine.temperature}°C</span>
                    <span className="text-[7px] font-extrabold uppercase tracking-widest" style={{ color: 'var(--danger)' }}>Max 85°C</span>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Core Temperature</span>
                </div>

                <CircularProgress 
                  value={currentWorker?.performance || 85} 
                  color="var(--primary)" 
                  label="Workstation Eff" 
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {[
                  { icon: 'fa-id-badge', label: 'Machine ID', value: assignedMachine.machineId },
                  { icon: 'fa-wrench', label: 'Last Service', value: assignedMachine.lastMaintenance },
                  { icon: 'fa-clock', label: 'Operating Time', value: `${assignedMachine.workingHours} Hrs` },
                  { icon: 'fa-industry', label: 'Operator', value: assignedMachine.assignedOperator }
                ].map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl border" style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)' }}>
                    <div className="flex items-center gap-1.5 mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                      <i className={`fas ${item.icon} text-[9px]`} />
                      <span className="text-[8px] font-extrabold uppercase tracking-wider">{item.label}</span>
                    </div>
                    <span className="font-semibold block truncate" style={{ color: 'var(--text-main)' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="glass-card-premium p-6 flex flex-col items-center justify-center text-center min-h-[300px]">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-3" style={{ background: 'var(--input-bg)', color: 'var(--warning)' }}>
                <i className="fas fa-screwdriver-wrench text-lg" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--text-main)' }}>No Station Assigned</h3>
              <p className="text-xs max-w-xs mt-1.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Contact supervisor {currentShift.supervisor} to assign hardware.
              </p>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="glass-card-premium p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--input-bg)', color: 'var(--warning)' }}>
            <i className="fas fa-clock" />
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Today's Logged Hours</span>
            <div className="text-base font-bold mt-0.5" style={{ color: 'var(--text-main)' }}>{currentWorker?.workingHours || 0} Hours</div>
          </div>
        </div>
        <div className="glass-card-premium p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--input-bg)', color: 'var(--success)' }}>
            <i className="fas fa-calendar-check" />
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Attendance Rating</span>
            <div className="text-base font-bold mt-0.5" style={{ color: 'var(--text-main)' }}>{currentWorker?.attendance || 95}% Presence</div>
          </div>
        </div>
      </div>
    </div>
  );
}
