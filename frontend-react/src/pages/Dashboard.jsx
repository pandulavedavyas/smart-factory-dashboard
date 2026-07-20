import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getWorkers, getMachines, getProduction, getSettings } from '../services/firestoreService';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';

ChartJS.register(...registerables);

// Theme configuration matching vanilla CSS variables
const chartTheme = {
  text: '#8899AA',
  grid: 'rgba(255, 255, 255, 0.04)',
  blue: '#0066FF',
  green: '#00D68F',
  yellow: '#FFB340',
  red: '#FF4757',
  cyan: '#00E5FF',
  purple: '#A78BFA'
};

export default function Dashboard() {
  const { user, role } = useAuth();
  const [workers, setWorkers] = useState([]);
  const [machines, setMachines] = useState([]);
  const [productionData, setProductionData] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [w, m, p, s] = await Promise.all([
          getWorkers(),
          getMachines(),
          getProduction(),
          getSettings()
        ]);
        setWorkers(w);
        setMachines(m);
        setProductionData(p);
        setSettings(s);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <div className="w-10 h-10 border-2 border-white/[0.04] border-t-[#00E5FF] rounded-full animate-spin" />
        <span className="text-xs font-semibold" style={{ color: '#8899AA' }}>Syncing telemetry data...</span>
      </div>
    );
  }

  return role === 'admin' ? (
    <AdminDashboard workers={workers} machines={machines} production={productionData} />
  ) : (
    <WorkerDashboard workerId={user?.id} workers={workers} machines={machines} settings={settings} />
  );
}

// =========================================================================
// ADMINISTRATOR DASHBOARD VIEW
// =========================================================================

function AdminDashboard({ workers, machines, production }) {
  // 1. KPI Calculations
  const totalWorkers = workers.length;
  const runningMachines = machines.filter(m => m.status === 'Running').length;
  const idleMachines = machines.filter(m => m.status === 'Idle').length;
  const activeMachines = runningMachines + idleMachines; // Running + Idle are "Active"
  const todayProduction = production
    .filter(p => p.date === '2026-07-21')
    .reduce((sum, curr) => sum + curr.quantity, 0) || 4820; // Default fallback to mock target if empty

  // 2. Chart 1: Machine Temperature Trend
  const tempTrendData = {
    labels: machines.map(m => m.machineName),
    datasets: [{
      label: 'Core Temp (°C)',
      data: machines.map(m => m.temperature),
      borderColor: chartTheme.cyan,
      backgroundColor: 'rgba(0, 229, 255, 0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: chartTheme.cyan,
    }]
  };

  // 3. Chart 2: Worker Attendance Trend
  const attendanceTrendData = {
    labels: workers.map(w => w.name.split(' ')[0]),
    datasets: [{
      label: 'Attendance Rate (%)',
      data: workers.map(w => w.attendance),
      backgroundColor: workers.map(w => w.attendance >= 95 ? chartTheme.green : chartTheme.yellow),
      borderRadius: 6,
    }]
  };

  // 4. Chart 3: Production Trend (Area Chart)
  // Group production by date
  const prodDates = [...new Set(production.map(p => p.date))].sort();
  const prodTotals = prodDates.map(date => 
    production.filter(p => p.date === date).reduce((s, c) => s + c.quantity, 0)
  );
  const productionTrendData = {
    labels: prodDates.map(d => d.slice(5)), // MM-DD
    datasets: [{
      label: 'Output (units)',
      data: prodTotals,
      borderColor: chartTheme.blue,
      backgroundColor: 'rgba(0, 102, 255, 0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.3,
      pointBackgroundColor: chartTheme.blue
    }]
  };

  // 5. Chart 4: Shift-wise Production
  const shiftProduction = {
    labels: ['Morning', 'Afternoon', 'Night'],
    datasets: [{
      label: 'Shift Yield',
      data: [
        production.filter(p => p.shift === 'Morning').reduce((s, c) => s + c.quantity, 0),
        production.filter(p => p.shift === 'Afternoon').reduce((s, c) => s + c.quantity, 0),
        production.filter(p => p.shift === 'Night').reduce((s, c) => s + c.quantity, 0)
      ],
      backgroundColor: [chartTheme.cyan, chartTheme.blue, chartTheme.purple],
      borderRadius: 6
    }]
  };

  // 6. Chart 5: Machine Status Distribution (Doughnut)
  const maintenanceCount = machines.filter(m => m.status === 'Maintenance').length;
  const statusDistributionData = {
    labels: ['Running', 'Idle', 'Maintenance'],
    datasets: [{
      data: [runningMachines, idleMachines, maintenanceCount],
      backgroundColor: [chartTheme.green, chartTheme.yellow, chartTheme.red],
      borderWidth: 0,
      hoverOffset: 6
    }]
  };

  // Shared chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: chartTheme.text, font: { size: 9 } }
      },
      y: {
        grid: { color: chartTheme.grid },
        ticks: { color: chartTheme.text, font: { size: 9 } }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold text-white tracking-tight uppercase">Dashboard Home</h1>
        <p className="text-xs" style={{ color: '#8899AA' }}>Real-time factory floor metrics and system summaries.</p>
      </motion.div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard icon="fa-users" label="Total Workers" value={totalWorkers} color={chartTheme.blue} />
        <KPICard icon="fa-circle-nodes" label="Active Machines" value={activeMachines} color={chartTheme.cyan} />
        <KPICard icon="fa-industry" label="Today's Production" value={todayProduction} suffix=" units" color={chartTheme.purple} />
        <KPICard icon="fa-circle-play" label="Running Machines" value={runningMachines} color={chartTheme.green} />
      </div>

      {/* Grid of Minimal Charts */}
      <div className="grid lg:grid-cols-12 gap-5">
        {/* Production Output (Area) */}
        <div className="lg:col-span-8 glass-card-premium p-5 min-h-[300px] flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white">Production Yield Trend</h3>
            <p className="text-[10px]" style={{ color: '#556677' }}>Total units produced over the last 7 active periods.</p>
          </div>
          <div className="h-56">
            <Line data={productionTrendData} options={chartOptions} />
          </div>
        </div>

        {/* Machine Status Distribution (Doughnut) */}
        <div className="lg:col-span-4 glass-card-premium p-5 min-h-[300px] flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white">Machine Status Allocation</h3>
            <p className="text-[10px]" style={{ color: '#556677' }}>Current hardware operational state breakdown.</p>
          </div>
          <div className="h-40 flex items-center justify-center relative">
            <Doughnut data={statusDistributionData} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              cutout: '72%'
            }} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-white">{machines.length}</span>
              <span className="text-[8px] font-extrabold uppercase tracking-widest" style={{ color: '#556677' }}>Units</span>
            </div>
          </div>
          <div className="flex justify-around text-[10px] font-bold mt-2">
            <span className="flex items-center gap-1.5" style={{ color: chartTheme.green }}>🟢 Running ({runningMachines})</span>
            <span className="flex items-center gap-1.5" style={{ color: chartTheme.yellow }}>🟡 Idle ({idleMachines})</span>
            <span className="flex items-center gap-1.5" style={{ color: chartTheme.red }}>🔴 Down ({maintenanceCount})</span>
          </div>
        </div>

        {/* Machine Temperature Trend */}
        <div className="lg:col-span-4 glass-card-premium p-5 min-h-[280px]">
          <div className="mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white">Core Temp Diagnostics</h3>
            <p className="text-[10px]" style={{ color: '#556677' }}>Live core thermal data by monitoring node.</p>
          </div>
          <div className="h-48">
            <Line data={tempTrendData} options={chartOptions} />
          </div>
        </div>

        {/* Shift-wise Production */}
        <div className="lg:col-span-4 glass-card-premium p-5 min-h-[280px]">
          <div className="mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white">Shift Output Yield</h3>
            <p className="text-[10px]" style={{ color: '#556677' }}>Comparison of production yield by active workforce shift.</p>
          </div>
          <div className="h-48">
            <Bar data={shiftProduction} options={chartOptions} />
          </div>
        </div>

        {/* Attendance Rates */}
        <div className="lg:col-span-4 glass-card-premium p-5 min-h-[280px]">
          <div className="mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white">Personnel Attendance Rate</h3>
            <p className="text-[10px]" style={{ color: '#556677' }}>Individual team presence tracker database.</p>
          </div>
          <div className="h-48">
            <Bar data={attendanceTrendData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}

// KPI Subcomponent
function KPICard({ icon, label, value, suffix = '', color }) {
  return (
    <div className="glass-card-premium p-5 relative overflow-hidden group">
      {/* Background soft glow */}
      <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full opacity-[0.03] transition-all duration-500 group-hover:scale-125"
        style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)` }} />

      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm"
          style={{ background: `${color}14`, border: `1px solid ${color}20`, color }}>
          <i className={`fas ${icon}`} />
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#556677' }}>{label}</div>
          <div className="text-lg font-bold text-white mt-0.5">
            {value}
            {suffix && <span className="text-xs font-normal" style={{ color: '#8899AA' }}>{suffix}</span>}
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
  const currentWorker = workers.find(w => w.employeeId === workerId);
  const assignedMachine = currentWorker ? machines.find(m => m.machineName === currentWorker.assignedMachine) : null;
  const currentShift = settings?.shifts?.find(s => s.name === currentWorker?.shift) || {
    name: 'Morning', start: '06:00', end: '14:00', supervisor: 'Lisa Anderson'
  };

  const statusColor = currentWorker?.status === 'Active' ? '#00D68F' : currentWorker?.status === 'Break' ? '#FFB340' : '#FF4757';

  // Circular progress helper
  const CircularProgress = ({ value, color, size = 110, strokeWidth = 8, label }) => {
    const radius = (size - strokeWidth * 2) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - value / 100);

    return (
      <div className="flex flex-col items-center gap-3">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            {/* Background ring */}
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth={strokeWidth} />
            {/* Dynamic indicator */}
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
              strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-base font-bold text-white">{value}%</span>
            <span className="text-[8px] font-extrabold uppercase tracking-widest" style={{ color: '#556677' }}>Target</span>
          </div>
        </div>
        <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#8899AA' }}>{label}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight uppercase">Worker Personal Station</h1>
          <p className="text-xs" style={{ color: '#8899AA' }}>Live telemetry for assigned station, shift and performance logs.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/[0.04]" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: statusColor }} />
          <span className="text-[10px] font-bold uppercase tracking-wider text-white">Status: {currentWorker?.status || 'Offline'}</span>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-12 gap-5">
        {/* Left Side: Profile Card & Shift Summary */}
        <div className="lg:col-span-5 space-y-5">
          {/* Profile Card */}
          <div className="glass-card-premium p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold"
                style={{ background: 'linear-gradient(135deg, rgba(0, 102, 255, 0.25), rgba(0, 229, 255, 0.15))', color: '#00E5FF', border: '1px solid rgba(0, 229, 255, 0.2)' }}>
                {currentWorker?.name.split(' ').map(n => n[0]).join('').slice(0, 2) || 'ST'}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{currentWorker?.name || 'Smart Worker'}</h3>
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#00E5FF' }}>ID: {currentWorker?.employeeId || 'W-000'}</span>
              </div>
            </div>
            
            <div className="h-px bg-white/[0.04] w-full" />

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-white/[0.02]" style={{ background: 'rgba(255,255,255,0.01)' }}>
                <span className="text-[9px] font-bold uppercase tracking-widest block mb-1" style={{ color: '#556677' }}>Department</span>
                <span className="font-semibold text-white truncate block">{currentWorker?.department}</span>
              </div>
              <div className="p-3 rounded-xl border border-white/[0.02]" style={{ background: 'rgba(255,255,255,0.01)' }}>
                <span className="text-[9px] font-bold uppercase tracking-widest block mb-1" style={{ color: '#556677' }}>Factory Zone</span>
                <span className="font-semibold text-white truncate block">{currentWorker?.zone}</span>
              </div>
            </div>
          </div>

          {/* Shift Details */}
          <div className="glass-card-premium p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white">Shift Allocation</h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2.5 rounded-xl border border-white/[0.02]" style={{ background: 'rgba(255,255,255,0.01)' }}>
                <div className="text-[9px] font-extrabold uppercase tracking-wider" style={{ color: '#556677' }}>Shift</div>
                <div className="text-xs font-bold text-white mt-1">{currentShift.name}</div>
              </div>
              <div className="p-2.5 rounded-xl border border-white/[0.02]" style={{ background: 'rgba(255,255,255,0.01)' }}>
                <div className="text-[9px] font-extrabold uppercase tracking-wider" style={{ color: '#556677' }}>Timings</div>
                <div className="text-xs font-bold text-white mt-1">{currentShift.start} - {currentShift.end}</div>
              </div>
              <div className="p-2.5 rounded-xl border border-white/[0.02]" style={{ background: 'rgba(255,255,255,0.01)' }}>
                <div className="text-[9px] font-extrabold uppercase tracking-wider" style={{ color: '#556677' }}>Supervisor</div>
                <div className="text-xs font-bold text-[#00E5FF] mt-1 truncate">{currentShift.supervisor}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Assigned Machine & Health Telemetry */}
        <div className="lg:col-span-7 space-y-5">
          {assignedMachine ? (
            <div className="glass-card-premium p-6 space-y-6">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#00E5FF]">Live Machinery Diagnostics</span>
                  <h3 className="text-base font-bold text-white mt-0.5">{assignedMachine.machineName}</h3>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    background: assignedMachine.status === 'Running' ? 'rgba(0, 214, 143, 0.12)' : assignedMachine.status === 'Idle' ? 'rgba(255, 179, 64, 0.12)' : 'rgba(255, 71, 87, 0.12)',
                    color: assignedMachine.status === 'Running' ? '#00D68F' : assignedMachine.status === 'Idle' ? '#FFB340' : '#FF4757'
                  }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ background: assignedMachine.status === 'Running' ? '#00D68F' : assignedMachine.status === 'Idle' ? '#FFB340' : '#FF4757' }} />
                  {assignedMachine.status}
                </div>
              </div>

              {/* Live Gauges */}
              <div className="grid sm:grid-cols-3 gap-6 items-center justify-center">
                {/* Circular Health Ring */}
                <CircularProgress 
                  value={assignedMachine.health} 
                  color={assignedMachine.health >= 85 ? '#00D68F' : assignedMachine.health >= 60 ? '#FFB340' : '#FF4757'} 
                  label="Machine Health" 
                />

                {/* Temperature gauge */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative w-28 h-28 flex flex-col justify-center items-center rounded-full border border-white/[0.03]" style={{ background: 'rgba(255,255,255,0.01)' }}>
                    <i className="fas fa-temperature-three-quarters text-lg text-[#FFB340] mb-1" />
                    <span className="text-base font-bold text-white">{assignedMachine.temperature}°C</span>
                    <span className="text-[7px] font-extrabold uppercase tracking-widest text-[#FF4757]">Max 85°C</span>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#8899AA' }}>Core Temperature</span>
                </div>

                {/* Performance / Hours */}
                <CircularProgress 
                  value={currentWorker?.performance || 85} 
                  color="#A78BFA" 
                  label="Workstation Eff" 
                />
              </div>

              {/* Diagnostics table list */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {[
                  { icon: 'fa-id-badge', label: 'Machine ID', value: assignedMachine.machineId },
                  { icon: 'fa-wrench', label: 'Last Service', value: assignedMachine.lastMaintenance },
                  { icon: 'fa-clock', label: 'Operating Time', value: `${assignedMachine.workingHours} Hrs` },
                  { icon: 'fa-industry', label: 'Assigned Operator', value: assignedMachine.assignedOperator }
                ].map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-white/[0.02]" style={{ background: 'rgba(255,255,255,0.01)' }}>
                    <div className="flex items-center gap-1.5 mb-1.5" style={{ color: '#556677' }}>
                      <i className={`fas ${item.icon} text-[9px]`} />
                      <span className="text-[8px] font-extrabold uppercase tracking-wider">{item.label}</span>
                    </div>
                    <span className="font-semibold text-white block truncate">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="glass-card-premium p-6 flex flex-col items-center justify-center text-center min-h-[300px]">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-3" style={{ background: 'rgba(255,255,255,0.04)', color: '#FFB340' }}>
                <i className="fas fa-screwdriver-wrench text-lg" />
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">No Station Assigned</h3>
              <p className="text-xs max-w-xs mt-1.5 leading-relaxed" style={{ color: '#8899AA' }}>
                You do not have an active machine assigned for your current shift. Contact supervisor {currentShift.supervisor} to assign hardware.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Bottom Row: Working Hours & Attendance Rate Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="glass-card-premium p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[#FFB340]" style={{ background: 'rgba(255, 179, 64, 0.12)', border: '1px solid rgba(255, 179, 64, 0.2)' }}>
            <i className="fas fa-clock" />
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#556677' }}>Today's Logged Hours</span>
            <div className="text-base font-bold text-white mt-0.5">{currentWorker?.workingHours || 0} Hours</div>
          </div>
        </div>
        <div className="glass-card-premium p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[#00D68F]" style={{ background: 'rgba(0, 214, 143, 0.12)', border: '1px solid rgba(0, 214, 143, 0.2)' }}>
            <i className="fas fa-calendar-check" />
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#556677' }}>Attendance Rating</span>
            <div className="text-base font-bold text-white mt-0.5">{currentWorker?.attendance || 95}% Presence</div>
          </div>
        </div>
      </div>
    </div>
  );
}
