import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api/api';
import KPICard from '../components/KPICard';
import ChartCard from '../components/ChartCard';

function AIInsightRow({ icon, title, value, color }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-white/[0.02]">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}12` }}>
        <i className={`fas ${icon} text-xs`} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-white truncate">{title}</div>
      </div>
      <span className="text-xs font-bold" style={{ color }}>{value}</span>
    </div>
  );
}

export default function Analytics() {
  const [data, setData] = useState(null);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/dashboard/kpi'), api.get('/machines')]).then(([kpi, mach]) => {
      if (kpi) setData(kpi);
      if (mach) setMachines(mach);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="w-12 h-12 rounded-full border-2 border-[rgba(0,102,255,0.1)] border-t-[#0066FF] animate-spin" />
    </div>
  );

  const outputPie = {
    labels: ['Accepted', 'Rejected', 'Rework', 'Pending'],
    datasets: [{ data: [8450, 420, 180, 350], backgroundColor: ['#00D68F', '#FF4757', '#FFB340', '#8899AA'], borderWidth: 0, hoverOffset: 8 }],
  };

  const effBar = {
    labels: machines.map(m => m.code),
    datasets: [{
      label: 'Efficiency %',
      data: machines.map(m => Math.min(100, m.health_score * 1.05)),
      backgroundColor: machines.map(m => m.health_score > 80 ? '#00D68F' : m.health_score > 60 ? '#FFB340' : '#FF4757'),
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  const healthBar = {
    labels: machines.map(m => m.code),
    datasets: [{
      label: 'Health',
      data: machines.map(m => m.health_score),
      backgroundColor: '#0066FF',
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  const deptPerf = {
    labels: ['CNC', 'Press', 'Welding', 'Assembly', 'Packaging', 'Laser'],
    datasets: [
      { label: 'Output', data: [92, 85, 78, 95, 88, 91], backgroundColor: '#0066FF', borderRadius: 8, borderSkipped: false },
      { label: 'Quality', data: [96, 90, 88, 94, 92, 95], backgroundColor: '#00D68F', borderRadius: 8, borderSkipped: false },
    ],
  };

  const invValue = {
    labels: ['Raw Materials', 'WIP', 'Finished Goods', 'Spare Parts'],
    datasets: [{ data: [45000, 28000, 62000, 12000], backgroundColor: ['#0066FF', '#A78BFA', '#00D68F', '#FFB340'], borderWidth: 0, hoverOffset: 8 }],
  };

  const outputVsScrap = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      { label: 'Output', data: [1200, 1350, 1420, 1280, 1500, 980, 650], backgroundColor: '#0066FF', borderRadius: 8, borderSkipped: false },
      { label: 'Scrap', data: [25, 30, 18, 42, 22, 15, 8], backgroundColor: '#FF4757', borderRadius: 8, borderSkipped: false },
    ],
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

  const insights = [
    { icon: 'fa-rocket', title: 'Production Efficiency', value: `${data?.avg_health_score || 88}%`, color: '#00D68F' },
    { icon: 'fa-temperature-half', title: 'Avg Temperature', value: `${data?.avg_temperature || 65}°C`, color: '#FFB340' },
    { icon: 'fa-bolt', title: 'Energy Usage', value: '847 kWh', color: '#0066FF' },
    { icon: 'fa-recycle', title: 'Scrap Rate', value: '3.2%', color: '#FF4757' },
    { icon: 'fa-chart-line', title: 'Trend', value: '+12% ↑', color: '#00D68F' },
    { icon: 'fa-clock', title: 'OEE Score', value: '82.5%', color: '#A78BFA' },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Analytics</h1>
        <p className="text-xs mt-1" style={{ color: '#8899AA' }}>Cross-functional analytics and AI-powered insights</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard icon="fa-box" label="Total Output" value={(data?.production_output || 0).toLocaleString()} color="#0066FF" sub="This period" delay={0} />
        <KPICard icon="fa-heart-pulse" label="Avg Health" value={`${data?.avg_health_score || 88}`} suffix="%" color="#00D68F" sub="All machines" delay={1} />
        <KPICard icon="fa-thermometer-half" label="Avg Temp" value={`${data?.avg_temperature || 65}`} suffix="°C" color="#FFB340" sub="Monitor" delay={2} />
        <KPICard icon="fa-exclamation" label="Failures" value={data?.machine_failures || 0} color="#FF4757" sub="Active issues" delay={3} />
        <KPICard icon="fa-check-double" label="Accuracy" value={`${data?.prediction_accuracy || 85}`} suffix="%" color="#A78BFA" sub="AI models" delay={4} />
        <KPICard icon="fa-gauge" label="OEE" value="82.5" suffix="%" color="#00E5FF" sub="Overall" delay={5} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <ChartCard title="Output Distribution" data={outputPie} type="doughnut" options={doughnutOpts} height={280} delay={0} />
        <div className="lg:col-span-2">
          <ChartCard title="Department Performance" data={deptPerf} type="bar" options={barOpts} height={280} delay={1} />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <ChartCard title="Machine Efficiency" data={effBar} type="bar" options={{ ...barOpts, plugins: { legend: { display: false } } }} height={260} delay={2} />
        <ChartCard title="Machine Health" data={healthBar} type="bar" options={{ ...barOpts, plugins: { legend: { display: false } }, scales: { ...barOpts.scales, y: { ...barOpts.scales.y, max: 100 } } }} height={260} delay={3} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <ChartCard title="Output vs Scrap" data={outputVsScrap} type="bar" options={barOpts} height={260} delay={4} />
        <ChartCard title="Inventory Value" data={invValue} type="doughnut" options={doughnutOpts} height={260} delay={5} />
      </div>

      {/* System Status + AI Insights */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card-premium" style={{ padding: '24px' }}>
          <div className="flex items-center gap-2 mb-4">
            <i className="fas fa-server text-xs" style={{ color: '#0066FF' }} />
            <span className="text-sm font-bold text-white">System Status</span>
          </div>
          <div className="space-y-1">
            {insights.map((ins, i) => <AIInsightRow key={i} {...ins} />)}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-card-premium" style={{ padding: '24px' }}>
          <div className="flex items-center gap-2 mb-4">
            <i className="fas fa-brain text-xs" style={{ color: '#A78BFA' }} />
            <span className="text-sm font-bold text-white">AI Insights</span>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full ml-auto" style={{ background: 'rgba(167, 139, 250, 0.1)', color: '#A78BFA' }}>Live</span>
          </div>
          <div className="space-y-3">
            {[
              { title: 'Peak Efficiency Window', desc: 'Machines perform best between 8AM-12PM. Consider scheduling critical tasks during this window.', icon: 'fa-clock', conf: 89 },
              { title: 'Maintenance Alert', desc: 'PRS-002 shows signs of bearing wear. Schedule preventive maintenance within 48 hours.', icon: 'fa-wrench', conf: 92 },
              { title: 'Energy Optimization', desc: 'Reducing idle machine time during shift changes could save ~15% daily energy consumption.', icon: 'fa-bolt', conf: 78 },
              { title: 'Quality Improvement', desc: 'Implementing real-time SPC on CNC machines could reduce rejection rate by 40%.', icon: 'fa-chart-line', conf: 85 },
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-xl" style={{ background: 'rgba(167, 139, 250, 0.03)', border: '1px solid rgba(167, 139, 250, 0.06)' }}>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(167, 139, 250, 0.1)' }}>
                    <i className={`fas ${item.icon} text-[10px]`} style={{ color: '#A78BFA' }} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white mb-0.5">{item.title}</div>
                    <div className="text-[10px] leading-relaxed" style={{ color: '#8899AA' }}>{item.desc}</div>
                    <div className="mt-1.5">
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(167, 139, 250, 0.08)', color: '#A78BFA' }}>
                        {item.conf}% confidence
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
