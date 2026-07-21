import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getReports, saveReport, getWorkers, getMachines, getProduction, getFinance } from '../services/firestoreService';
import { useToast } from '../context/ToastContext';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

const chartTheme = {
  blue: '#0066FF',
  cyan: '#00E5FF',
  green: '#00D68F',
  yellow: '#FFB340',
  red: '#FF4757',
  purple: '#A78BFA',
  text: '#8899AA',
  grid: 'rgba(255, 255, 255, 0.04)'
};

export default function Reports() {
  const { showToast } = useToast();
  const [reports, setReports] = useState([]);
  const [dateFilter, setDateFilter] = useState('Today'); // 'Today', 'This Week', 'This Month', 'Custom'
  const [customStartDate, setCustomStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [customEndDate, setCustomEndDate] = useState(new Date().toISOString().slice(0, 10));
  
  // Data states
  const [workers, setWorkers] = useState([]);
  const [machines, setMachines] = useState([]);
  const [production, setProduction] = useState([]);
  const [finance, setFinance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Preview Modal state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const printAreaRef = useRef();

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    try {
      setLoading(true);
      const [repsData, wrkData, mchData, prdData, finData] = await Promise.all([
        getReports(),
        getWorkers(),
        getMachines(),
        getProduction(),
        getFinance()
      ]);
      setReports(repsData.sort((a,b) => new Date(b.dateCreated) - new Date(a.dateCreated)));
      setWorkers(wrkData);
      setMachines(mchData);
      setProduction(prdData);
      setFinance(finData);
    } catch (err) {
      showToast('Error syncing reports registry', 'error');
    } finally {
      setLoading(false);
    }
  }

  // Calculate Financial Analytics based on active date filter
  const financialTotals = (() => {
    const fin = finance.find(f => f.period === dateFilter || f.period === 'Today') || finance[0] || {
      totalIncome: 1420000,
      totalExpenses: 890000,
      netProfit: 530000,
      rawMaterialCost: 450000,
      maintenanceCost: 85000,
      electricityCost: 180000,
      salaryCost: 125000,
      transportCost: 50000
    };
    return fin;
  })();

  // Calculate Production Analytics
  const totalProductionTons = production.reduce((acc, curr) => acc + (curr.quantityTons || curr.quantity || 0), 0) || 4850;
  const targetProductionTons = production.reduce((acc, curr) => acc + (curr.targetTons || 1800), 0) || 5200;

  // Calculate Worker Analytics
  const totalWorkers = workers.length || 50;
  const presentWorkers = workers.filter(w => w.status === 'Active' || w.status === 'Break').length || 46;
  const absentWorkers = totalWorkers - presentWorkers;
  const avgWorkingHours = 8.2;
  const overtimeHours = 145;

  // Calculate Machine Analytics
  const runningCount = machines.filter(m => m.status === 'Running').length || 31;
  const idleCount = machines.filter(m => m.status === 'Idle').length || 3;
  const maintenanceCount = machines.filter(m => m.status === 'Maintenance').length || 1;
  const avgTemp = machines.length > 0 ? Math.round(machines.reduce((acc, m) => acc + m.temperature, 0) / machines.length) : 620;

  // 1. Bar Chart: Daily Income vs Expenses
  const barChartData = {
    labels: ['Jul 17', 'Jul 18', 'Jul 19', 'Jul 20', 'Jul 21'],
    datasets: [
      {
        label: 'Income ($)',
        data: [1290000, 1650000, 1510000, 1380000, financialTotals.totalIncome],
        backgroundColor: 'rgba(0, 214, 143, 0.7)',
        borderRadius: 6
      },
      {
        label: 'Expenses ($)',
        data: [820000, 990000, 920000, 860000, financialTotals.totalExpenses],
        backgroundColor: 'rgba(255, 71, 87, 0.7)',
        borderRadius: 6
      }
    ]
  };

  // 2. Pie Chart: Expense Distribution
  const pieChartData = {
    labels: ['Raw Materials', 'Employee Salaries', 'Electricity', 'Maintenance', 'Transport'],
    datasets: [
      {
        data: [
          financialTotals.rawMaterialCost,
          financialTotals.salaryCost,
          financialTotals.electricityCost,
          financialTotals.maintenanceCost,
          financialTotals.transportCost
        ],
        backgroundColor: [chartTheme.blue, chartTheme.cyan, chartTheme.yellow, chartTheme.red, chartTheme.purple],
        borderWidth: 0
      }
    ]
  };

  // 3. Line Chart: Production Trend (Target vs Actual)
  const lineChartData = {
    labels: ['Jul 15', 'Jul 16', 'Jul 17', 'Jul 18', 'Jul 19', 'Jul 20', 'Jul 21'],
    datasets: [
      {
        label: 'Actual Output (Tons)',
        data: [1450, 1620, 1380, 2400, 1950, 1280, 1850],
        borderColor: chartTheme.cyan,
        backgroundColor: 'rgba(0, 229, 255, 0.1)',
        fill: true,
        tension: 0.35
      },
      {
        label: 'Target (Tons)',
        data: [1500, 1600, 1500, 2500, 2000, 1300, 1800],
        borderColor: 'rgba(255,255,255,0.3)',
        borderDash: [5, 5],
        fill: false,
        tension: 0
      }
    ]
  };

  // 4. Doughnut Chart: Machine Status
  const doughnutChartData = {
    labels: ['Running', 'Idle', 'Maintenance'],
    datasets: [
      {
        data: [runningCount, idleCount, maintenanceCount],
        backgroundColor: [chartTheme.green, chartTheme.yellow, chartTheme.red],
        borderWidth: 0
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#8899AA', font: { size: 10 } } }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#8899AA', font: { size: 9 } } },
      y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#8899AA', font: { size: 9 } } }
    }
  };

  const handleGenerateReport = async () => {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 600));

    try {
      const today = new Date().toISOString().slice(0, 10);
      const randId = 'REP-' + Math.random().toString(36).substr(2, 5).toUpperCase();
      const newReport = {
        id: randId,
        name: `Executive Steel Audit [${dateFilter} - ${today}]`,
        type: 'Financial & Production Audit',
        dateCreated: today,
        status: 'Generated',
        generatedBy: 'Admin'
      };

      await saveReport(newReport);
      showToast('New Executive Report logged successfully');
      loadAllData();
    } catch (err) {
      showToast('Failed to log report', 'error');
    } finally {
      setGenerating(false);
    }
  };

  // Direct Print PDF trigger formatted for A4
  const triggerA4Print = () => {
    const printWindow = window.open('', '_blank');
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Steel Factory Executive Report - ${dateFilter}</title>
          <style>
            @page { size: A4; margin: 15mm; }
            body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #ffffff; color: #111827; margin: 0; padding: 20px; line-height: 1.5; }
            .header-banner { border-bottom: 3px solid #0066FF; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; }
            .logo-title { display: flex; align-items: center; gap: 15px; }
            .logo-box { width: 45px; height: 45px; background: #0066FF; color: white; font-weight: bold; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
            .company-name { font-size: 20px; font-weight: 800; text-transform: uppercase; color: #071A2F; margin: 0; }
            .sub-title { font-size: 11px; color: #6B7280; margin-top: 2px; }
            .report-meta { text-align: right; font-size: 11px; color: #4B5563; }
            .section-title { font-size: 13px; font-weight: 800; text-transform: uppercase; color: #0066FF; border-bottom: 1px solid #E5E7EB; padding-bottom: 5px; margin-top: 25px; margin-bottom: 12px; }
            .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
            .kpi-card { background: #F9FAFB; border: 1px solid #E5E7EB; padding: 12px; border-radius: 8px; text-align: center; }
            .kpi-label { font-size: 9px; font-weight: 700; text-transform: uppercase; color: #6B7280; }
            .kpi-val { font-size: 16px; font-weight: 800; color: #111827; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
            th { background: #071A2F; color: white; text-align: left; padding: 8px 12px; font-size: 10px; text-transform: uppercase; }
            td { padding: 8px 12px; border-bottom: 1px solid #E5E7EB; }
            tr:nth-child(even) { background-color: #F9FAFB; }
            .footer { margin-top: 40px; border-top: 1px solid #E5E7EB; padding-top: 15px; font-size: 10px; color: #9CA3AF; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header-banner">
            <div class="logo-title">
              <div class="logo-box">⚙️</div>
              <div>
                <h1 class="company-name">AI Smart Factory Dashboard</h1>
                <div class="sub-title">Steel Manufacturing Plant Executive Operational Audit</div>
              </div>
            </div>
            <div class="report-meta">
              <div><strong>Filter Period:</strong> ${dateFilter}</div>
              <div><strong>Date Generated:</strong> ${today}</div>
              <div><strong>Generated By:</strong> Plant Administrator</div>
            </div>
          </div>

          <div class="section-title">1. Financial Performance Summary</div>
          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="kpi-label">Total Revenue</div>
              <div class="kpi-val" style="color: #00D68F;">$${financialTotals.totalIncome.toLocaleString()}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Total Operational Cost</div>
              <div class="kpi-val" style="color: #FF4757;">$${financialTotals.totalExpenses.toLocaleString()}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Net Profit Margin</div>
              <div class="kpi-val" style="color: #0066FF;">$${financialTotals.netProfit.toLocaleString()}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Profitability Rate</div>
              <div class="kpi-val" style="color: #00D68F;">${((financialTotals.netProfit / financialTotals.totalIncome) * 100).toFixed(1)}%</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Expense Category</th>
                <th>Cost allocation ($)</th>
                <th>Share of Expense (%)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Raw Materials (Iron Ore & Scrap)</td><td>$${financialTotals.rawMaterialCost.toLocaleString()}</td><td>${((financialTotals.rawMaterialCost / financialTotals.totalExpenses) * 100).toFixed(1)}%</td><td>Budgeted</td></tr>
              <tr><td>Electricity & Utility Power</td><td>$${financialTotals.electricityCost.toLocaleString()}</td><td>${((financialTotals.electricityCost / financialTotals.totalExpenses) * 100).toFixed(1)}%</td><td>Optimal</td></tr>
              <tr><td>Employee Salaries & Overhead</td><td>$${financialTotals.salaryCost.toLocaleString()}</td><td>${((financialTotals.salaryCost / financialTotals.totalExpenses) * 100).toFixed(1)}%</td><td>Nominal</td></tr>
              <tr><td>Machinery Preventative Maintenance</td><td>$${financialTotals.maintenanceCost.toLocaleString()}</td><td>${((financialTotals.maintenanceCost / financialTotals.totalExpenses) * 100).toFixed(1)}%</td><td>Controlled</td></tr>
              <tr><td>Logistics & Freight Transport</td><td>$${financialTotals.transportCost.toLocaleString()}</td><td>${((financialTotals.transportCost / financialTotals.totalExpenses) * 100).toFixed(1)}%</td><td>Optimal</td></tr>
            </tbody>
          </table>

          <div class="section-title">2. Steel Production & Machinery Diagnostics</div>
          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="kpi-label">Total Steel Tonnage</div>
              <div class="kpi-val">${totalProductionTons} Tons</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Production Target</div>
              <div class="kpi-val">${targetProductionTons} Tons</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Running Machinery</div>
              <div class="kpi-val" style="color: #00D68F;">${runningCount} / ${machines.length || 35}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Average Core Temp</div>
              <div class="kpi-val" style="color: #FFB340;">${avgTemp}°C</div>
            </div>
          </div>

          <div class="section-title">3. Workforce Attendance Summary</div>
          <table>
            <thead>
              <tr>
                <th>Parameter</th>
                <th>Recorded Value</th>
                <th>Benchmark Standard</th>
                <th>Evaluation</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Total Active Workforce</td><td>${totalWorkers} Workers</td><td>50 Personnel</td><td>Complete</td></tr>
              <tr><td>Present Shift Attendance</td><td>${presentWorkers} Workers (${((presentWorkers/totalWorkers)*100).toFixed(1)}%)</td><td>95.0%</td><td>Optimal</td></tr>
              <tr><td>Logged Overtime Hours</td><td>${overtimeHours} Hours</td><td>150 Hours</td><td>Controlled</td></tr>
            </tbody>
          </table>

          <div class="footer">
            CONFIDENTIAL - Internal Steel Plant Management Document. Formatted for A4 Standard Print.
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Title & Toolbar */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight uppercase">Reports & Financial Analytics Hub</h1>
          <p className="text-xs" style={{ color: '#8899AA' }}>Comprehensive steel plant metrics, financial P&L breakdown, and printable A4 executive reports.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date Filter Selector */}
          <div className="flex items-center p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            {['Today', 'This Week', 'This Month', 'Custom'].map((filter) => (
              <button
                key={filter}
                onClick={() => setDateFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  dateFilter === filter ? 'bg-[#0066FF] text-white shadow-[0_2px_10px_rgba(0,102,255,0.4)]' : 'text-[#8899AA] hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsPreviewOpen(true)}
            className="btn-primary flex items-center gap-2"
          >
            <i className="fas fa-eye text-xs" />
            <span>Report Preview</span>
          </button>

          <button
            onClick={triggerA4Print}
            className="btn-primary flex items-center gap-2 !bg-[#00D68F] hover:!bg-[#00B377]"
          >
            <i className="fas fa-file-pdf text-xs" />
            <span>Download PDF / Print</span>
          </button>
        </div>
      </div>

      {/* Custom Date Range Controls */}
      {dateFilter === 'Custom' && (
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="glass-card-premium p-4 flex items-center gap-4">
          <span className="text-xs font-bold text-white uppercase tracking-wider">Custom Range:</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#8899AA]">From:</span>
            <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} className="input text-xs !py-1" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#8899AA]">To:</span>
            <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} className="input text-xs !py-1" />
          </div>
        </motion.div>
      )}

      {/* --- FINANCIAL ANALYTICS HIGHLIGHTS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-card-premium p-5 flex items-center gap-4 relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg text-[#00D68F]" style={{ background: 'rgba(0,214,143,0.12)', border: '1px solid rgba(0,214,143,0.2)' }}>
            <i className="fas fa-dollar-sign" />
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase tracking-widest block" style={{ color: '#556677' }}>Total Revenue ({dateFilter})</span>
            <div className="text-xl font-extrabold text-white mt-0.5">${financialTotals.totalIncome.toLocaleString()}</div>
            <span className="text-[9px] text-[#00D68F] font-bold">↑ +8.4% vs last period</span>
          </div>
        </div>

        <div className="glass-card-premium p-5 flex items-center gap-4 relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg text-[#FF4757]" style={{ background: 'rgba(255,71,87,0.12)', border: '1px solid rgba(255,71,87,0.2)' }}>
            <i className="fas fa-[#FF4757] fa-receipt" />
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase tracking-widest block" style={{ color: '#556677' }}>Total Operational Expenses</span>
            <div className="text-xl font-extrabold text-white mt-0.5">${financialTotals.totalExpenses.toLocaleString()}</div>
            <span className="text-[9px] text-[#8899AA]">Raw Material, Power, Salaries & Maint</span>
          </div>
        </div>

        <div className="glass-card-premium p-5 flex items-center gap-4 relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg text-[#00E5FF]" style={{ background: 'rgba(0,229,255,0.12)', border: '1px solid rgba(0,229,255,0.2)' }}>
            <i className="fas fa-chart-line" />
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase tracking-widest block" style={{ color: '#556677' }}>Net Operating Profit</span>
            <div className="text-xl font-extrabold text-[#00E5FF] mt-0.5">${financialTotals.netProfit.toLocaleString()}</div>
            <span className="text-[9px] text-[#00D68F] font-bold">Margin: {((financialTotals.netProfit / financialTotals.totalIncome) * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* --- CHARTS GRID (BAR, PIE, LINE, DOUGHNUT) --- */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* 1. Bar Chart: Income vs Expenses */}
        <div className="glass-card-premium p-5 flex flex-col justify-between">
          <div className="mb-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
              <i className="fas fa-chart-bar text-[#00D68F]" />
              <span>Financial Bar Chart: Daily Income vs Expenses</span>
            </h3>
            <p className="text-[10px]" style={{ color: '#556677' }}>Daily revenue comparison against operational production costs.</p>
          </div>
          <div className="h-60">
            <Bar data={barChartData} options={chartOptions} />
          </div>
        </div>

        {/* 2. Pie Chart: Expense Distribution */}
        <div className="glass-card-premium p-5 flex flex-col justify-between">
          <div className="mb-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
              <i className="fas fa-chart-pie text-[#A78BFA]" />
              <span>Pie Chart: Expense Distribution Breakdown</span>
            </h3>
            <p className="text-[10px]" style={{ color: '#556677' }}>Percentage cost breakdown across raw materials, salaries, electricity, and maintenance.</p>
          </div>
          <div className="h-60 flex justify-center">
            <Pie data={pieChartData} options={{ ...chartOptions, plugins: { legend: { position: 'right', labels: { color: '#8899AA', font: { size: 9 } } } } }} />
          </div>
        </div>

        {/* 3. Line Chart: Production Output Trend */}
        <div className="glass-card-premium p-5 flex flex-col justify-between">
          <div className="mb-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
              <i className="fas fa-chart-line text-[#00E5FF]" />
              <span>Line Chart: Production Output Trend (Tons)</span>
            </h3>
            <p className="text-[10px]" style={{ color: '#556677' }}>Daily tonnage output compared against shift production targets.</p>
          </div>
          <div className="h-60">
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </div>

        {/* 4. Doughnut Chart: Machine Operational Status */}
        <div className="glass-card-premium p-5 flex flex-col justify-between">
          <div className="mb-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
              <i className="fas fa-circle-notch text-[#FFB340]" />
              <span>Doughnut Chart: Machine Operational Status</span>
            </h3>
            <p className="text-[10px]" style={{ color: '#556677' }}>Real-time distribution of running, idle, and maintenance machinery.</p>
          </div>
          <div className="h-60 flex justify-center">
            <Doughnut data={doughnutChartData} options={{ ...chartOptions, plugins: { legend: { position: 'right', labels: { color: '#8899AA', font: { size: 9 } } } } }} />
          </div>
        </div>
      </div>

      {/* --- WORKER & MACHINE ANALYTICS SUMMARY GRID --- */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Worker Analytics */}
        <div className="glass-card-premium p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
            <i className="fas fa-users text-[#00E5FF]" />
            <span>Worker Workforce Analytics</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
            <div className="p-3 rounded-xl border border-white/[0.04]" style={{ background: 'rgba(255,255,255,0.01)' }}>
              <span className="text-[9px] font-bold uppercase tracking-widest block" style={{ color: '#556677' }}>Total Staff</span>
              <span className="text-sm font-bold text-white mt-1 block">{totalWorkers}</span>
            </div>
            <div className="p-3 rounded-xl border border-white/[0.04]" style={{ background: 'rgba(255,255,255,0.01)' }}>
              <span className="text-[9px] font-bold uppercase tracking-widest block" style={{ color: '#556677' }}>Present</span>
              <span className="text-sm font-bold text-[#00D68F] mt-1 block">{presentWorkers}</span>
            </div>
            <div className="p-3 rounded-xl border border-white/[0.04]" style={{ background: 'rgba(255,255,255,0.01)' }}>
              <span className="text-[9px] font-bold uppercase tracking-widest block" style={{ color: '#556677' }}>Absent</span>
              <span className="text-sm font-bold text-[#FF4757] mt-1 block">{absentWorkers}</span>
            </div>
            <div className="p-3 rounded-xl border border-white/[0.04]" style={{ background: 'rgba(255,255,255,0.01)' }}>
              <span className="text-[9px] font-bold uppercase tracking-widest block" style={{ color: '#556677' }}>Overtime</span>
              <span className="text-sm font-bold text-[#FFB340] mt-1 block">{overtimeHours} hrs</span>
            </div>
          </div>
        </div>

        {/* Machine Analytics */}
        <div className="glass-card-premium p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
            <i className="fas fa-gears text-[#00D68F]" />
            <span>Machine Health & Telemetry Analytics</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
            <div className="p-3 rounded-xl border border-white/[0.04]" style={{ background: 'rgba(255,255,255,0.01)' }}>
              <span className="text-[9px] font-bold uppercase tracking-widest block" style={{ color: '#556677' }}>Running</span>
              <span className="text-sm font-bold text-[#00D68F] mt-1 block">{runningCount}</span>
            </div>
            <div className="p-3 rounded-xl border border-white/[0.04]" style={{ background: 'rgba(255,255,255,0.01)' }}>
              <span className="text-[9px] font-bold uppercase tracking-widest block" style={{ color: '#556677' }}>Idle</span>
              <span className="text-sm font-bold text-[#FFB340] mt-1 block">{idleCount}</span>
            </div>
            <div className="p-3 rounded-xl border border-white/[0.04]" style={{ background: 'rgba(255,255,255,0.01)' }}>
              <span className="text-[9px] font-bold uppercase tracking-widest block" style={{ color: '#556677' }}>Maintenance</span>
              <span className="text-sm font-bold text-[#FF4757] mt-1 block">{maintenanceCount}</span>
            </div>
            <div className="p-3 rounded-xl border border-white/[0.04]" style={{ background: 'rgba(255,255,255,0.01)' }}>
              <span className="text-[9px] font-bold uppercase tracking-widest block" style={{ color: '#556677' }}>Avg Temp</span>
              <span className="text-sm font-bold text-[#00E5FF] mt-1 block">{avgTemp}°C</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- REPORT PREVIEW MODAL --- */}
      <AnimatePresence>
        {isPreviewOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPreviewOpen(false)} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]" />

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-4 md:inset-10 bg-[#071A2F] border border-white/[0.1] rounded-2xl z-[101] flex flex-col overflow-hidden shadow-2xl">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#0066FF] flex items-center justify-center text-white text-xs font-bold">⚙️</div>
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">A4 Report Preview & Export</h3>
                    <span className="text-[10px] text-[#8899AA]">Selected Period: {dateFilter}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button onClick={triggerA4Print} className="btn-primary py-1.5 px-4 text-xs flex items-center gap-2 !bg-[#00D68F]">
                    <i className="fas fa-print text-xs" />
                    <span>Print A4 / Save PDF</span>
                  </button>
                  <button onClick={() => setIsPreviewOpen(false)} className="text-[#8899AA] hover:text-white">
                    <i className="fas fa-times text-sm" />
                  </button>
                </div>
              </div>

              {/* Printable Content Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs bg-black/20" ref={printAreaRef}>
                {/* Header Banner */}
                <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] flex justify-between items-center">
                  <div>
                    <h2 className="text-base font-extrabold text-white uppercase tracking-wider">AI Smart Factory Dashboard</h2>
                    <p className="text-[10px] text-[#00E5FF]">Steel Manufacturing Plant Executive Operational & Financial Audit</p>
                  </div>
                  <div className="text-right text-[10px] text-[#8899AA]">
                    <div>Date: {new Date().toLocaleDateString()}</div>
                    <div>Period: {dateFilter}</div>
                  </div>
                </div>

                {/* Financial Overview */}
                <div className="space-y-3">
                  <h4 className="font-bold text-[#00E5FF] uppercase tracking-wider text-[11px]">1. Financial P&L Summary</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                      <span className="text-[9px] text-[#556677] uppercase font-bold block">Total Income</span>
                      <span className="text-sm font-bold text-[#00D68F]">${financialTotals.totalIncome.toLocaleString()}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                      <span className="text-[9px] text-[#556677] uppercase font-bold block">Total Expenses</span>
                      <span className="text-sm font-bold text-[#FF4757]">${financialTotals.totalExpenses.toLocaleString()}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                      <span className="text-[9px] text-[#556677] uppercase font-bold block">Net Operating Profit</span>
                      <span className="text-sm font-bold text-[#00E5FF]">${financialTotals.netProfit.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Expense Allocation Table */}
                <div className="space-y-3">
                  <h4 className="font-bold text-[#00E5FF] uppercase tracking-wider text-[11px]">2. Expense Distribution Table</h4>
                  <div className="table-container">
                    <table className="w-full text-left">
                      <thead>
                        <tr>
                          <th>Category</th>
                          <th>Cost ($)</th>
                          <th>Allocation (%)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td>Raw Materials</td><td>${financialTotals.rawMaterialCost.toLocaleString()}</td><td>${((financialTotals.rawMaterialCost / financialTotals.totalExpenses) * 100).toFixed(1)}%</td></tr>
                        <tr><td>Electricity & Power</td><td>${financialTotals.electricityCost.toLocaleString()}</td><td>${((financialTotals.electricityCost / financialTotals.totalExpenses) * 100).toFixed(1)}%</td></tr>
                        <tr><td>Employee Salaries</td><td>${financialTotals.salaryCost.toLocaleString()}</td><td>${((financialTotals.salaryCost / financialTotals.totalExpenses) * 100).toFixed(1)}%</td></tr>
                        <tr><td>Maintenance</td><td>${financialTotals.maintenanceCost.toLocaleString()}</td><td>${((financialTotals.maintenanceCost / financialTotals.totalExpenses) * 100).toFixed(1)}%</td></tr>
                        <tr><td>Transport & Logistics</td><td>${financialTotals.transportCost.toLocaleString()}</td><td>${((financialTotals.transportCost / financialTotals.totalExpenses) * 100).toFixed(1)}%</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
