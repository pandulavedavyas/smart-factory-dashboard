import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api/api';
import KPICard from '../components/KPICard';
import ChartCard from '../components/ChartCard';
import StatusBadge from '../components/StatusBadge';

function CircularProgress({ value, max = 100, size = 130, label, color = '#0066FF' }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(value / max, 1);
  const offset = circumference * (1 - pct);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1.5s ease-out', filter: `drop-shadow(0 0 6px ${color}40)` }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold text-white">{Math.round(pct * 100)}%</span>
          {label && <span className="text-[9px] font-medium" style={{ color: '#556677' }}>{label}</span>}
        </div>
      </div>
    </div>
  );
}

export default function Production() {
  const [machines, setMachines] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('daily');

  useEffect(() => {
    Promise.all([api.get('/machines'), api.get('/dashboard/kpi')]).then(([m, d]) => {
      if (m) setMachines(m);
      if (d) setData(d);
      setLoading(false);
    });
  }, []);

  const totalOutput = data?.production_output || 0;
  const target = 5000;
  const achieved = Math.min((totalOutput / target) * 100, 100);

  const dailyProd = {
    labels: ['6AM', '7AM', '8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM'],
    datasets: [
      {
        label: 'Actual',
        data: [120, 245, 380, 420, 465, 510, 480, 390, 320, 280],
        backgroundColor: (ctx) => {
          const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 280);
          g.addColorStop(0, 'rgba(0, 102, 255, 0.5)');
          g.addColorStop(1, 'rgba(0, 102, 255, 0.05)');
          return g;
        },
        borderRadius: 8,
        borderSkipped: false,
      },
      {
        label: 'Target',
        data: [150, 300, 400, 450, 500, 520, 500, 420, 350, 300],
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const weeklyProd = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Output',
        data: [4200, 4800, 5100, 4600, 5300, 3200, 1800],
        backgroundColor: (ctx) => {
          const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 280);
          g.addColorStop(0, 'rgba(0, 102, 255, 0.5)');
          g.addColorStop(1, 'rgba(0, 102, 255, 0.05)');
          return g;
        },
        borderRadius: 8,
        borderSkipped: false,
      },
      {
        label: 'Target',
        data: [4500, 4500, 4500, 4500, 4500, 4500, 4500],
        type: 'line',
        borderColor: '#FF4757',
        borderDash: [5, 5],
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
      },
    ],
  };

  const prodTrend = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{
      label: 'Weekly Output',
      data: [22500, 24800, 26100, 28400],
      borderColor: '#0066FF',
      backgroundColor: 'rgba(0, 102, 255, 0.05)',
      fill: true,
      tension: 0.4,
      pointRadius: 5,
      pointBackgroundColor: '#0066FF',
      pointBorderColor: '#071A2F',
      pointBorderWidth: 2,
      borderWidth: 2.5,
    }],
  };

  const qualityPie = {
    labels: ['Accepted', 'Rejected', 'Rework'],
    datasets: [{ data: [92, 5, 3], backgroundColor: ['#00D68F', '#FF4757', '#FFB340'], borderWidth: 0, hoverOffset: 8 }],
  };

  const shiftComp = {
    labels: ['Morning', 'Afternoon', 'Night'],
    datasets: [
      { label: 'Output', data: [4200, 3800, 2900], backgroundColor: '#0066FF', borderRadius: 8, borderSkipped: false },
      { label: 'Quality %', data: [94, 91, 89], backgroundColor: '#00D68F', borderRadius: 8, borderSkipped: false },
    ],
  };

  const downtimeBar = {
    labels: ['CNC-001', 'CNC-002', 'PRS-001', 'PRS-002', 'WLD-001', 'ASM-001', 'PKG-001', 'LSR-001'],
    datasets: [{
      label: 'Downtime (min)',
      data: [15, 45, 120, 30, 8, 5, 10, 20],
      backgroundColor: [15, 45, 120, 30, 8, 5, 10, 20].map(v => v > 60 ? '#FF4757' : v > 20 ? '#FFB340' : '#00D68F'),
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  const barOpts = {
    plugins: { legend: { display: true, labels: { color: '#8899AA', usePointStyle: true, pointStyleWidth: 8, font: { size: 10 }, padding: 16 } } },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#556677' }, border: { display: false } },
      x: { grid: { display: false }, ticks: { color: '#556677' }, border: { display: false } },
    },
  };

  const doughnutOpts = {
    cutout: '68%',
    plugins: { legend: { position: 'bottom', labels: { color: '#8899AA', padding: 16, usePointStyle: true, font: { size: 11 } } } },
    scales: {},
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="w-12 h-12 rounded-full border-2 border-[rgba(0,102,255,0.1)] border-t-[#0066FF] animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Production</h1>
          <p className="text-xs mt-1" style={{ color: '#8899AA' }}>Production output, quality, and performance analytics</p>
        </div>
        <div className="flex items-center gap-2">
          {['daily', 'weekly', 'monthly'].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className="px-3 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all duration-200"
              style={period === p ? {
                background: 'linear-gradient(135deg, rgba(0,102,255,0.15), rgba(0,229,255,0.05))',
                color: '#0066FF',
                border: '1px solid rgba(0,102,255,0.2)',
              } : {
                color: '#8899AA',
                border: '1px solid rgba(255,255,255,0.04)',
              }}>
              {p}
            </button>
          ))}
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <KPICard icon="fa-box" label="Total Output" value={totalOutput.toLocaleString()} color="#0066FF" sub="All products" trend="+12%" trendUp={true} delay={0} />
        <KPICard icon="fa-bullseye" label="Target" value={target.toLocaleString()} color="#00D68F" sub={`${achieved.toFixed(0)}% achieved`} delay={1} />
        <KPICard icon="fa-chart-simple" label="Avg Efficiency" value="91.5" suffix="%" color="#A78BFA" sub="Above target" delay={2} />
        <KPICard icon="fa-rotate-left" label="Rejected" value={Math.round(totalOutput * 0.05)} color="#FF4757" sub="5% reject rate" delay={3} />
        <KPICard icon="fa-clock" label="Downtime" value="253" suffix=" min" color="#FFB340" sub="All machines" delay={4} />
      </div>

      {/* Target Progress + Quality */}
      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card-premium flex flex-col items-center justify-center gap-4" style={{ padding: '32px' }}>
          <CircularProgress value={totalOutput} max={target} size={150} label="Target Achievement" />
          <div className="text-center">
            <div className="text-lg font-extrabold text-white">{totalOutput.toLocaleString()} / {target.toLocaleString()}</div>
            <div className="text-[10px] font-medium" style={{ color: '#556677' }}>units produced</div>
          </div>
          {achieved >= 100 && (
            <div className="px-3 py-1 rounded-full text-[10px] font-bold" style={{ background: 'rgba(0, 214, 143, 0.15)', color: '#00D68F' }}>
              <i className="fas fa-check mr-1" />Target Reached!
            </div>
          )}
        </motion.div>
        <div className="lg:col-span-2">
          <ChartCard title="Quality Distribution" subtitle="This period" data={qualityPie} type="doughnut" options={doughnutOpts} height={260} delay={0} />
        </div>
      </div>

      {/* Daily + Weekly */}
      <div className="grid lg:grid-cols-2 gap-6">
        <ChartCard title="Daily Production" subtitle="Actual vs Target" data={dailyProd} type="bar" options={barOpts} height={280} delay={1} />
        <ChartCard title="Weekly Production" subtitle="Output vs Target" data={weeklyProd} type="bar" options={barOpts} height={280} delay={2} />
      </div>

      {/* Trend + Shift */}
      <div className="grid lg:grid-cols-2 gap-6">
        <ChartCard title="Production Trend" subtitle="Monthly" data={prodTrend} type="line" height={260} delay={3} />
        <ChartCard title="Shift Comparison" subtitle="Output & Quality" data={shiftComp} type="bar" options={barOpts} height={260} delay={4} />
      </div>

      {/* Downtime */}
      <ChartCard title="Downtime by Machine" subtitle="Minutes" data={downtimeBar} type="bar" options={{ ...barOpts, plugins: { legend: { display: false } } }} height={260} delay={5} />

      {/* Production table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-card-premium" style={{ padding: '24px' }}>
        <h3 className="text-sm font-bold text-white mb-4">Machine Performance Summary</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Machine</th>
                <th>Status</th>
                <th>Output</th>
                <th>Health</th>
                <th>Temp</th>
                <th>Downtime</th>
              </tr>
            </thead>
            <tbody>
              {machines.map(m => (
                <tr key={m.id}>
                  <td className="font-medium text-white">{m.name}</td>
                  <td><StatusBadge status={m.status} size="xs" /></td>
                  <td className="font-semibold text-white">{Math.round(Math.random() * 500 + 200)}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <div className="h-full rounded-full" style={{ width: `${m.health_score}%`, background: m.health_score > 80 ? '#00D68F' : '#FFB340' }} />
                      </div>
                      <span className="text-xs" style={{ color: '#8899AA' }}>{m.health_score}%</span>
                    </div>
                  </td>
                  <td className="text-xs font-medium" style={{ color: m.temperature > 80 ? '#FF4757' : m.temperature > 60 ? '#FFB340' : '#00D68F' }}>{m.temperature}°C</td>
                  <td className="text-xs" style={{ color: '#8899AA' }}>{Math.round(Math.random() * 60)} min</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
