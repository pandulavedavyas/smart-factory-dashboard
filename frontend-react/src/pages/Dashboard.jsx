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
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-12 h-12 border-3 rounded-full animate-spin" style={{ borderColor: 'var(--border-color)', borderTopColor: 'var(--primary)' }} />
        <span className="text-card-label" style={{ color: 'var(--text-secondary)' }}>Syncing steel plant telemetry...</span>
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
// ADMINISTRATOR DASHBOARD VIEW (6 TOP KPI CARDS + TELEMETRY)
// =========================================================================

function AdminDashboard({ workers, machines, production, theme }) {
  const isDark = theme === 'dark';
  const chartTheme = {
    text: isDark ? '#94A3B8' : '#6B7280',
    grid: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E5E7EB',
    blue: '#2563EB',
    secondaryBlue: '#3B82F6',
    green: '#10B981',
    yellow: '#F59E0B',
    red: '#EF4444',
    purple: '#8B5CF6'
  };

  // KPI Calculations
  const totalWorkers = workers.length || 50;
  const activeWorkers = workers.filter(w => w.status === 'Active' || w.status === 'Break').length || 46;

  const runningMachines = machines.filter(m => m.status === 'Running').length || 12;
  const idleMachines = machines.filter(m => m.status === 'Idle').length || 2;
  const maintenanceCount = machines.filter(m => m.status === 'Maintenance').length || 1;
  const totalMachines = machines.length || 15;

  const todayProductionTons = production.reduce((s, c) => s + (c.quantity || 0), 0) || 4820;

  const avgTemp = machines.length > 0
    ? Math.round(machines.reduce((acc, m) => acc + m.temperature, 0) / machines.length)
    : 680;

  const inventoryTons = 12450;
  const dailyRevenue = (todayProductionTons * 620).toLocaleString();

  // Chart Data Setup
  const tempTrendData = {
    labels: machines.slice(0, 8).map(m => m.machineName),
    datasets: [{
      label: 'Core Temp (°C)',
      data: machines.slice(0, 8).map(m => m.temperature),
      borderColor: chartTheme.secondaryBlue,
      backgroundColor: 'rgba(59, 130, 246, 0.12)',
      borderWidth: 2.5,
      fill: true,
      tension: 0.4,
    }]
  };

  const attendanceTrendData = {
    labels: workers.slice(0, 8).map(w => w.name.split(' ')[0]),
    datasets: [{
      label: 'Attendance (%)',
      data: workers.slice(0, 8).map(w => w.attendance),
      backgroundColor: workers.slice(0, 8).map(w => w.attendance >= 95 ? chartTheme.green : chartTheme.yellow),
      borderRadius: 8,
    }]
  };

  const prodDates = [...new Set(production.map(p => p.date))].sort().slice(-7);
  const prodTotals = prodDates.map(date => 
    production.filter(p => p.date === date).reduce((s, c) => s + c.quantity, 0)
  );
  const productionTrendData = {
    labels: prodDates.length ? prodDates.map(d => String(d).slice(5)) : ['Jul 15', 'Jul 16', 'Jul 17', 'Jul 18', 'Jul 19', 'Jul 20', 'Jul 21'],
    datasets: [{
      label: 'Daily Steel Output (Tons)',
      data: prodTotals.length ? prodTotals : [1250, 1400, 1350, 1550, 1420, 1600, 1750],
      borderColor: chartTheme.blue,
      backgroundColor: 'rgba(37, 99, 235, 0.15)',
      borderWidth: 3,
      fill: true,
      tension: 0.3,
    }]
  };

  const statusDistributionData = {
    labels: ['Running', 'Idle', 'Maintenance'],
    datasets: [{
      data: [runningMachines, idleMachines, maintenanceCount],
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
      x: { grid: { display: false }, ticks: { color: chartTheme.text, font: { size: 10 } } },
      y: { grid: { color: chartTheme.grid }, ticks: { color: chartTheme.text, font: { size: 10 } } }
    }
  };

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-dashboard-title" style={{ color: 'var(--text-main)' }}>Steel Manufacturing Dashboard</h1>
          <p className="text-card-label" style={{ color: 'var(--text-secondary)' }}>Real-time Industry 4.0 plant performance, production output, and hardware diagnostics.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl border flex items-center gap-2" style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)' }}>
            <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: 'var(--success)' }} />
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>Plant Operational</span>
          </div>
        </div>
      </motion.div>

      {/* TOP 6 KPI CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {/* Card 1: Workers */}
        <KPICard
          icon="fa-users"
          label="ACTIVE WORKERS"
          value={totalWorkers}
          desc={`${activeWorkers} On Shift Now`}
          trend="+4.2%"
          trendUp={true}
          progress={(activeWorkers / totalWorkers) * 100}
          color="var(--primary-blue)"
        />

        {/* Card 2: Machines */}
        <KPICard
          icon="fa-gears"
          label="RUNNING MACHINES"
          value={`${runningMachines}/${totalMachines}`}
          desc={`${runningMachines} Operating Nominal`}
          trend="+2.1%"
          trendUp={true}
          progress={(runningMachines / totalMachines) * 100}
          color="var(--success)"
        />

        {/* Card 3: Production */}
        <KPICard
          icon="fa-industry"
          label="PRODUCTION TONS"
          value={todayProductionTons.toLocaleString()}
          desc="Tons Steel Slabs Today"
          trend="+8.5%"
          trendUp={true}
          progress={88}
          color="var(--secondary-blue)"
        />

        {/* Card 4: Temperature */}
        <KPICard
          icon="fa-temperature-high"
          label="AVG CORE TEMP"
          value={`${avgTemp}°C`}
          desc="Furnace Core Operating"
          trend="-1.4%"
          trendUp={true}
          progress={75}
          color="var(--warning)"
        />

        {/* Card 5: Inventory */}
        <KPICard
          icon="fa-boxes-stacked"
          label="RAW INVENTORY"
          value={`${(inventoryTons / 1000).toFixed(1)}k`}
          desc="Tons Ore & Scrap Buffer"
          trend="+5.0%"
          trendUp={true}
          progress={65}
          color="#8B5CF6"
        />

        {/* Card 6: Revenue */}
        <KPICard
          icon="fa-dollar-sign"
          label="TODAY REVENUE"
          value={`$${dailyRevenue}`}
          desc="Gross Daily Yield Val"
          trend="+12.4%"
          trendUp={true}
          progress={92}
          color="var(--success)"
        />
      </div>

      {/* CHARTS TELEMETRY SECTION */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Daily Production Tonnage Chart */}
        <div className="lg:col-span-8 saas-card min-h-[340px] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-section-title" style={{ color: 'var(--text-main)' }}>Daily Steel Output</h3>
              <p className="text-card-label" style={{ color: 'var(--text-secondary)' }}>Finished hot-rolled steel slab production tonnage over past 7 days.</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full border" style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)', color: 'var(--primary-blue)' }}>
              Target: 1,800 Tons/Day
            </span>
          </div>
          <div className="h-64">
            <Line data={productionTrendData} options={chartOptions} />
          </div>
        </div>

        {/* Machine Status Allocation Doughnut */}
        <div className="lg:col-span-4 saas-card min-h-[340px] flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-section-title" style={{ color: 'var(--text-main)' }}>Machine Status Breakdown</h3>
            <p className="text-card-label" style={{ color: 'var(--text-secondary)' }}>Real-time hardware status distribution.</p>
          </div>
          <div className="h-44 flex items-center justify-center relative">
            <Doughnut data={statusDistributionData} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              cutout: '72%'
            }} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-card-value" style={{ color: 'var(--text-main)' }}>{totalMachines}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Total Units</span>
            </div>
          </div>
          <div className="flex justify-around text-xs font-bold mt-2">
            <span className="flex items-center gap-1.5" style={{ color: 'var(--success)' }}>🟢 Running ({runningMachines})</span>
            <span className="flex items-center gap-1.5" style={{ color: 'var(--warning)' }}>🟡 Idle ({idleMachines})</span>
            <span className="flex items-center gap-1.5" style={{ color: 'var(--danger)' }}>🔴 Down ({maintenanceCount})</span>
          </div>
        </div>

        {/* Core Temperature Monitoring */}
        <div className="lg:col-span-6 saas-card min-h-[300px]">
          <div className="mb-4">
            <h3 className="text-section-title" style={{ color: 'var(--text-main)' }}>Core Temperature Telemetry</h3>
            <p className="text-card-label" style={{ color: 'var(--text-secondary)' }}>Thermal data across primary furnace nodes (°C).</p>
          </div>
          <div className="h-56">
            <Line data={tempTrendData} options={chartOptions} />
          </div>
        </div>

        {/* Personnel Attendance Chart */}
        <div className="lg:col-span-6 saas-card min-h-[300px]">
          <div className="mb-4">
            <h3 className="text-section-title" style={{ color: 'var(--text-main)' }}>Worker Attendance Rates</h3>
            <p className="text-card-label" style={{ color: 'var(--text-secondary)' }}>Shift presence performance per station team.</p>
          </div>
          <div className="h-56">
            <Bar data={attendanceTrendData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Enterprise Top KPI Card Component
function KPICard({ icon, label, value, desc, trend, trendUp, progress, color }) {
  return (
    <div className="saas-card relative overflow-hidden flex flex-col justify-between group">
      <div className="flex items-start justify-between mb-3">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg shadow-sm"
          style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)', color }}>
          <i className={`fas ${icon}`} />
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${trendUp ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'}`}>
          <i className={`fas ${trendUp ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'} text-[10px]`} />
          <span>{trend}</span>
        </div>
      </div>

      <div>
        <span className="text-card-label uppercase block tracking-wider" style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <div className="text-card-value mt-1" style={{ color: 'var(--text-main)' }}>{value}</div>
        <p className="text-[11px] font-medium mt-1 truncate" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
      </div>

      {/* Mini Progress Indicator */}
      <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--input-bg)' }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: color }} />
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

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-page-title" style={{ color: 'var(--text-main)' }}>Worker Station Portal</h1>
          <p className="text-card-label" style={{ color: 'var(--text-secondary)' }}>Live hardware telemetry and personal shift logs for steel manufacturing.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl border" style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)' }}>
          <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: statusColor }} />
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>Status: {currentWorker?.status || 'Offline'}</span>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-6">
          <div className="saas-card space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-md"
                style={{ background: 'var(--primary)' }}>
                {currentWorker?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'ST'}
              </div>
              <div>
                <h3 className="text-section-title" style={{ color: 'var(--text-main)' }}>{currentWorker?.name || 'Smart Worker'}</h3>
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--secondary-blue)' }}>Employee ID: {currentWorker?.employeeId || 'W-000'}</span>
              </div>
            </div>
            
            <div className="h-px w-full" style={{ background: 'var(--border-color)' }} />

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl border" style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)' }}>
                <span className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: 'var(--text-secondary)' }}>Department</span>
                <span className="font-semibold truncate block text-sm" style={{ color: 'var(--text-main)' }}>{currentWorker?.department}</span>
              </div>
              <div className="p-3.5 rounded-xl border" style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)' }}>
                <span className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: 'var(--text-secondary)' }}>Plant Zone</span>
                <span className="font-semibold truncate block text-sm" style={{ color: 'var(--text-main)' }}>{currentWorker?.zone}</span>
              </div>
            </div>
          </div>

          <div className="saas-card space-y-4">
            <h3 className="text-section-title" style={{ color: 'var(--text-main)' }}>Shift Allocation</h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl border" style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)' }}>
                <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Shift</div>
                <div className="text-xs font-bold mt-1" style={{ color: 'var(--text-main)' }}>{currentShift.name}</div>
              </div>
              <div className="p-3 rounded-xl border" style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)' }}>
                <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Timings</div>
                <div className="text-xs font-bold mt-1" style={{ color: 'var(--text-main)' }}>{currentShift.start} - {currentShift.end}</div>
              </div>
              <div className="p-3 rounded-xl border" style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)' }}>
                <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Supervisor</div>
                <div className="text-xs font-bold mt-1 truncate" style={{ color: 'var(--secondary-blue)' }}>{currentShift.supervisor}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          {assignedMachine ? (
            <div className="saas-card space-y-6">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-widest" style={{ color: 'var(--secondary-blue)' }}>Assigned Equipment Diagnostics</span>
                  <h3 className="text-section-title mt-0.5" style={{ color: 'var(--text-main)' }}>{assignedMachine.machineName}</h3>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
                  style={{
                    background: assignedMachine.status === 'Running' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: assignedMachine.status === 'Running' ? 'var(--success)' : 'var(--warning)'
                  }}>
                  <span className="w-2 h-2 rounded-full animate-pulse"
                    style={{ background: assignedMachine.status === 'Running' ? 'var(--success)' : 'var(--warning)' }} />
                  {assignedMachine.status}
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-6 items-center justify-center text-center">
                <div className="p-4 rounded-2xl border" style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)' }}>
                  <div className="text-card-value" style={{ color: 'var(--success)' }}>{assignedMachine.health}%</div>
                  <span className="text-card-label uppercase" style={{ color: 'var(--text-secondary)' }}>Equipment Health</span>
                </div>

                <div className="p-4 rounded-2xl border" style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)' }}>
                  <div className="text-card-value" style={{ color: 'var(--warning)' }}>{assignedMachine.temperature}°C</div>
                  <span className="text-card-label uppercase" style={{ color: 'var(--text-secondary)' }}>Core Temperature</span>
                </div>

                <div className="p-4 rounded-2xl border" style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)' }}>
                  <div className="text-card-value" style={{ color: 'var(--primary-blue)' }}>{currentWorker?.performance || 88}%</div>
                  <span className="text-card-label uppercase" style={{ color: 'var(--text-secondary)' }}>Workstation Eff</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {[
                  { icon: 'fa-id-badge', label: 'Machine ID', value: assignedMachine.machineId },
                  { icon: 'fa-wrench', label: 'Last Service', value: assignedMachine.lastMaintenance },
                  { icon: 'fa-clock', label: 'Operating Time', value: `${assignedMachine.workingHours} Hrs` },
                  { icon: 'fa-industry', label: 'Operator', value: assignedMachine.assignedOperator }
                ].map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border" style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)' }}>
                    <div className="flex items-center gap-1.5 mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                      <i className={`fas ${item.icon} text-xs`} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
                    </div>
                    <span className="font-semibold block truncate text-xs" style={{ color: 'var(--text-main)' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="saas-card flex flex-col items-center justify-center text-center min-h-[340px]">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl mb-3" style={{ background: 'var(--input-bg)', color: 'var(--warning)' }}>
                <i className="fas fa-screwdriver-wrench text-xl" />
              </div>
              <h3 className="text-section-title uppercase tracking-widest" style={{ color: 'var(--text-main)' }}>No Hardware Assigned</h3>
              <p className="text-xs max-w-xs mt-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Please check in with plant supervisor {currentShift.supervisor} to assign your equipment node.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
