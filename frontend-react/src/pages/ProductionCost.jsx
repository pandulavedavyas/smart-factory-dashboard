import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Chart, registerables } from 'chart.js';
import { api } from '../api/api';

Chart.register(...registerables);

const NAVY = '#071A2F';
const BLUE = '#0066FF';
const GREEN = '#00D68F';
const RED = '#FF4757';
const AMBER = '#FFB340';
const PURPLE = '#A78BFA';
const CYAN = '#00E5FF';

const CHART_COLORS = {
  grid: 'rgba(255, 255, 255, 0.03)',
  tick: '#556677',
  tooltipBg: 'rgba(7, 26, 47, 0.95)',
  tooltipBorder: 'rgba(0, 102, 255, 0.2)',
  tooltipTitle: '#F0F4F8',
  tooltipBody: '#8899AA',
};

function deepMerge(target, source) {
  const out = { ...target };
  for (const key in source) {
    if (
      source[key] && typeof source[key] === 'object' && !Array.isArray(source[key]) &&
      target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])
    ) {
      out[key] = deepMerge(target[key], source[key]);
    } else {
      out[key] = source[key];
    }
  }
  return out;
}

function useAnimatedCounter(end, duration = 1400) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-30px' });
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!isInView || hasStarted.current) return;
    hasStarted.current = true;
    const numericEnd = typeof end === 'string' ? parseFloat(end.replace(/[^0-9.\-]/g, '')) : end;
    if (isNaN(numericEnd) || numericEnd === 0) { setCount(numericEnd || 0); return; }
    const startTime = performance.now();
    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(numericEnd * eased);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, end, duration]);

  return { count, ref };
}

function CostKPI({ icon, label, value, suffix = '', color, delay = 0, trend, trendUp }) {
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.\-]/g, '')) : value;
  const isNumeric = !isNaN(numericValue) && numericValue !== null && numericValue !== undefined;
  const { count, ref } = useAnimatedCounter(isNumeric ? numericValue : 0);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, delay: delay * 0.08, ease: [0.4, 0, 0.2, 1] }}
      className="glass-card-premium glass-hover group cursor-default relative overflow-hidden"
      style={{ padding: '20px' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="relative">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{ background: `${color}12` }}
          >
            <i className={`fas ${icon} text-base`} style={{ color }} />
          </div>
          <div
            className="absolute inset-0 rounded-2xl"
            style={{ boxShadow: `0 0 24px ${color}18` }}
          />
        </div>
        {trend !== undefined && (
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold"
            style={{
              background: trendUp ? 'rgba(0, 214, 143, 0.1)' : 'rgba(255, 71, 87, 0.1)',
              color: trendUp ? GREEN : RED,
            }}
          >
            <i className={`fas fa-arrow-${trendUp ? 'up' : 'down'} text-[8px]`} />
            {trend}
          </div>
        )}
      </div>
      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#556677' }}>
          {label}
        </div>
        <div className="text-2xl font-extrabold text-white tracking-tight leading-none">
          {isNumeric ? (
            <>
              {suffix === '$' && '$'}
              {Math.round(count).toLocaleString()}{suffix !== '$' && suffix}
            </>
          ) : (
            value ?? '—'
          )}
        </div>
      </div>
      <div
        className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
      />
      <div
        className="absolute inset-0 rounded-[18px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ boxShadow: `inset 0 0 40px ${color}08` }}
      />
    </motion.div>
  );
}

function PremiumChart({ title, subtitle, type = 'bar', data, options, height = 300, delay = 0 }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!canvasRef.current || !data || !isInView) return;
    if (chartRef.current) chartRef.current.destroy();

    const isPie = type === 'pie' || type === 'doughnut' || type === 'radar';
    const isLine = type === 'line';

    const defaultOpts = {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 1200, easing: 'easeOutQuart' },
      plugins: {
        legend: {
          display: isPie,
          position: 'bottom',
          align: 'end',
          labels: {
            color: CHART_COLORS.tick,
            padding: 16,
            usePointStyle: true,
            pointStyleWidth: 8,
            font: { family: 'Inter', size: 11, weight: '500' },
          },
        },
        tooltip: {
          backgroundColor: CHART_COLORS.tooltipBg,
          titleColor: CHART_COLORS.tooltipTitle,
          bodyColor: CHART_COLORS.tooltipBody,
          borderColor: CHART_COLORS.tooltipBorder,
          borderWidth: 1,
          padding: 12,
          cornerRadius: 10,
          titleFont: { family: 'Inter', size: 12, weight: '600' },
          bodyFont: { family: 'Inter', size: 11 },
          displayColors: true,
          boxWidth: 8,
          boxHeight: 8,
          boxPadding: 4,
          usePointStyle: true,
        },
      },
      scales: isPie ? {} : {
        y: {
          beginAtZero: true,
          grid: { color: CHART_COLORS.grid, drawBorder: false },
          ticks: { color: CHART_COLORS.tick, font: { family: 'Inter', size: 10 }, padding: 8 },
          border: { display: false },
        },
        x: {
          grid: { display: false },
          ticks: { color: CHART_COLORS.tick, font: { family: 'Inter', size: 10 }, padding: 8 },
          border: { display: false },
        },
      },
    };

    const merged = options ? deepMerge(defaultOpts, options) : defaultOpts;

    const ctx = canvasRef.current.getContext('2d');
    if (isLine && data.datasets) {
      data.datasets.forEach((ds) => {
        if (ds.fill && (!ds.backgroundColor || typeof ds.backgroundColor === 'string')) {
          const gradient = ctx.createLinearGradient(0, 0, 0, height);
          const baseColor = ds.borderColor || BLUE;
          const rgbaMatch = baseColor.match(/^#([0-9A-Fa-f]{6})$/);
          if (rgbaMatch) {
            const r = parseInt(rgbaMatch[1].slice(0, 2), 16);
            const g = parseInt(rgbaMatch[1].slice(2, 4), 16);
            const b = parseInt(rgbaMatch[1].slice(4, 6), 16);
            gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.18)`);
            gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
          } else {
            gradient.addColorStop(0, 'rgba(0, 102, 255, 0.18)');
            gradient.addColorStop(1, 'rgba(0, 102, 255, 0)');
          }
          ds.backgroundColor = gradient;
        }
      });
    }

    chartRef.current = new Chart(canvasRef.current, { type, data, options: merged });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [data, type, options, isInView, height]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: delay * 0.1, ease: [0.4, 0, 0.2, 1] }}
      className="glass-card-premium glass-hover"
      style={{ padding: '24px' }}
    >
      {title && (
        <div className="flex items-center justify-between mb-5">
          <div>
            <span className="text-sm font-bold text-white">{title}</span>
            {subtitle && <span className="text-[10px] font-medium ml-2" style={{ color: '#556677' }}>{subtitle}</span>}
          </div>
        </div>
      )}
      <div style={{ height: `${height}px` }} className="relative">
        <canvas ref={canvasRef} />
      </div>
    </motion.div>
  );
}

function CostComponentCard({ icon, label, value, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.4, 0, 0.2, 1] }}
      className="relative overflow-hidden group cursor-default"
      style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${color}20`,
        borderRadius: '14px',
        padding: '20px',
      }}
    >
      <div
        className="absolute top-0 right-0 w-24 h-24 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-500"
        style={{ background: `radial-gradient(circle, ${color}, transparent)` }}
      />
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-lg"
          style={{ background: `${color}15`, color }}
        >
          <i className={`fas ${icon}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#556677' }}>{label}</p>
          <p className="text-xl font-extrabold text-white mt-0.5 tracking-tight">${Number(value).toLocaleString()}</p>
        </div>
      </div>
      <div
        className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
      />
    </motion.div>
  );
}

export default function ProductionCost() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/finance/production-cost').then((res) => {
      if (res) {
        setData(res);
        setLoading(false);
      } else {
        setError('Failed to load production cost data');
        setLoading(false);
      }
    }).catch(() => {
      setError('Failed to load production cost data');
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-[rgba(0,102,255,0.1)]" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#0066FF] animate-spin" />
          </div>
          <div className="text-xs font-medium" style={{ color: '#556677' }}>Loading production cost data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-3xl mb-3" style={{ color: AMBER }} />
          <div className="text-sm font-medium" style={{ color: '#8899AA' }}>{error}</div>
        </div>
      </div>
    );
  }

  const d = data || {};

  const totalMfgCost = d.total_manufacturing_cost ?? 284500;
  const sellingPriceUnit = d.selling_price_per_unit ?? 185.00;
  const netProfitUnit = d.net_profit_per_unit ?? 47.50;
  const profitPct = d.profit_percentage ?? 25.68;

  const kpis = [
    { icon: 'fa-industry', label: 'Total Mfg Cost', value: totalMfgCost, suffix: '$', color: BLUE, trend: d.total_mfg_trend || '+7.2%', trendUp: d.total_mfg_trend_up !== false },
    { icon: 'fa-tag', label: 'Selling Price/Unit', value: sellingPriceUnit, suffix: '$', color: GREEN, trend: d.selling_price_trend || '+3.5%', trendUp: d.selling_price_trend_up !== false },
    { icon: 'fa-hand-holding-dollar', label: 'Net Profit/Unit', value: netProfitUnit, suffix: '$', color: PURPLE, trend: d.net_profit_trend || '+12.8%', trendUp: d.net_profit_trend_up !== false },
    { icon: 'fa-percent', label: 'Profit %', value: profitPct, suffix: '%', color: CYAN, trend: d.profit_pct_trend || '+2.1%', trendUp: d.profit_pct_trend_up !== false },
  ];

  const costComponents = [
    { icon: 'fa-cubes', label: 'Material Cost', value: d.material_cost ?? 112400, color: BLUE },
    { icon: 'fa-gear', label: 'Machine Running', value: d.machine_running_cost ?? 48200, color: PURPLE },
    { icon: 'fa-bolt', label: 'Energy Cost', value: d.energy_cost ?? 32600, color: AMBER },
    { icon: 'fa-users', label: 'Labour Cost', value: d.labour_cost ?? 46800, color: GREEN },
    { icon: 'fa-wrench', label: 'Maintenance', value: d.maintenance_cost ?? 18500, color: CYAN },
    { icon: 'fa-recycle', label: 'Waste Handling', value: d.waste_cost ?? 8400, color: RED },
    { icon: 'fa-box', label: 'Packaging', value: d.packaging_cost ?? 12300, color: AMBER },
    { icon: 'fa-truck', label: 'Shipping', value: d.shipping_cost ?? 5300, color: PURPLE },
  ];

  const costLabels = costComponents.map((c) => c.label);
  const costValues = costComponents.map((c) => c.value);
  const costColors = costComponents.map((c) => c.color);

  const costBreakdownData = {
    labels: costLabels,
    datasets: [
      {
        label: 'Cost Breakdown',
        data: costValues,
        backgroundColor: costColors.map((c) => {
          const r = parseInt(c.slice(1, 3), 16);
          const g = parseInt(c.slice(3, 5), 16);
          const b = parseInt(c.slice(5, 7), 16);
          return `rgba(${r}, ${g}, ${b}, 0.85)`;
        }),
        borderColor: NAVY,
        borderWidth: 3,
        hoverBorderColor: '#FFFFFF',
        hoverBorderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const costBreakdownOpts = {
    cutout: '62%',
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: CHART_COLORS.tick,
          padding: 14,
          usePointStyle: true,
          pointStyleWidth: 8,
          font: { family: 'Inter', size: 11, weight: '500' },
        },
      },
    },
  };

  const breakevenUnits = d.breakeven_units ?? 4800;
  const totalRevenue = d.total_revenue ?? 420000;
  const breakevenLabels = d.breakeven_labels || ['0', '1,000', '2,000', '3,000', '4,000', '4,800', '5,000', '6,000', '7,000', '8,000'];
  const breakevenRevenueLine = d.breakeven_revenue || [0, 60000, 120000, 180000, 240000, 288000, 300000, 360000, 420000, 480000];
  const breakevenCostLine = d.breakeven_cost || [95000, 120000, 145000, 170000, 195000, 214000, 220000, 245000, 270000, 295000];
  const breakevenThreshold = d.breakeven_threshold || Array(breakevenLabels.length).fill(288000);

  const breakEvenData = {
    labels: breakevenLabels,
    datasets: [
      {
        label: 'Total Revenue',
        data: breakevenRevenueLine,
        backgroundColor: (ctx) => {
          const chart = ctx.chart;
          const { ctx: canvasCtx, chartArea } = chart;
          if (!chartArea) return 'rgba(0, 214, 143, 0.7)';
          const gradient = canvasCtx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, 'rgba(0, 214, 143, 0.15)');
          gradient.addColorStop(1, 'rgba(0, 214, 143, 0.8)');
          return gradient;
        },
        borderRadius: 6,
        borderSkipped: false,
        barPercentage: 0.65,
        categoryPercentage: 0.7,
        order: 2,
      },
      {
        label: 'Total Cost',
        data: breakevenCostLine,
        backgroundColor: (ctx) => {
          const chart = ctx.chart;
          const { ctx: canvasCtx, chartArea } = chart;
          if (!chartArea) return 'rgba(255, 71, 87, 0.7)';
          const gradient = canvasCtx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, 'rgba(255, 71, 87, 0.15)');
          gradient.addColorStop(1, 'rgba(255, 71, 87, 0.7)');
          return gradient;
        },
        borderRadius: 6,
        borderSkipped: false,
        barPercentage: 0.65,
        categoryPercentage: 0.7,
        order: 3,
      },
      {
        label: 'Break-even',
        data: breakevenThreshold,
        type: 'line',
        borderColor: AMBER,
        borderWidth: 2,
        borderDash: [8, 4],
        pointRadius: 0,
        fill: false,
        order: 1,
      },
    ],
  };

  const breakEvenOpts = {
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          color: CHART_COLORS.tick,
          padding: 16,
          usePointStyle: true,
          pointStyleWidth: 8,
          font: { family: 'Inter', size: 11, weight: '500' },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: CHART_COLORS.grid, drawBorder: false },
        ticks: {
          color: CHART_COLORS.tick,
          font: { family: 'Inter', size: 10 },
          padding: 8,
          callback: (val) => '$' + (val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val),
        },
        border: { display: false },
      },
      x: {
        grid: { display: false },
        ticks: { color: CHART_COLORS.tick, font: { family: 'Inter', size: 10 }, padding: 8 },
        border: { display: false },
      },
    },
  };

  const machineLabels = d.machine_labels || ['CNC-01', 'CNC-02', 'Press-01', 'Lathe-01', 'Assembly-01', 'Assembly-02'];
  const machineCostData = {
    labels: machineLabels,
    datasets: [
      {
        label: 'Machine Cost',
        data: d.machine_cost_values || [52000, 48000, 38000, 42000, 36000, 34000],
        backgroundColor: (ctx) => {
          const chart = ctx.chart;
          const { ctx: canvasCtx, chartArea } = chart;
          if (!chartArea) return 'rgba(255, 71, 87, 0.7)';
          const gradient = canvasCtx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, 'rgba(255, 71, 87, 0.15)');
          gradient.addColorStop(1, 'rgba(255, 71, 87, 0.7)');
          return gradient;
        },
        borderRadius: 6,
        borderSkipped: false,
        barPercentage: 0.6,
        categoryPercentage: 0.7,
      },
      {
        label: 'Revenue Generated',
        data: d.machine_revenue_values || [85000, 72000, 61000, 68000, 78000, 64000],
        backgroundColor: (ctx) => {
          const chart = ctx.chart;
          const { ctx: canvasCtx, chartArea } = chart;
          if (!chartArea) return 'rgba(0, 214, 143, 0.7)';
          const gradient = canvasCtx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, 'rgba(0, 214, 143, 0.15)');
          gradient.addColorStop(1, 'rgba(0, 214, 143, 0.8)');
          return gradient;
        },
        borderRadius: 6,
        borderSkipped: false,
        barPercentage: 0.6,
        categoryPercentage: 0.7,
      },
    ],
  };

  const machineCostOpts = {
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          color: CHART_COLORS.tick,
          padding: 16,
          usePointStyle: true,
          pointStyleWidth: 8,
          font: { family: 'Inter', size: 11, weight: '500' },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: CHART_COLORS.grid, drawBorder: false },
        ticks: {
          color: CHART_COLORS.tick,
          font: { family: 'Inter', size: 10 },
          padding: 8,
          callback: (val) => '$' + (val / 1000) + 'k',
        },
        border: { display: false },
      },
      x: {
        grid: { display: false },
        ticks: { color: CHART_COLORS.tick, font: { family: 'Inter', size: 10 }, padding: 8 },
        border: { display: false },
      },
    },
  };

  const summaryItems = [
    { label: 'Total Manufacturing Cost', value: totalMfgCost, color: BLUE, icon: 'fa-industry' },
    { label: 'Total Selling Price', value: d.total_selling_price ?? totalRevenue, color: GREEN, icon: 'fa-dollar-sign' },
    { label: 'Net Profit', value: d.net_profit ?? 124800, color: PURPLE, icon: 'fa-hand-holding-dollar' },
    { label: 'Break-even Units', value: breakevenUnits, suffix: ' units', color: AMBER, icon: 'fa-scale-balanced' },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Production Cost Analysis</h1>
          <p className="text-xs mt-1" style={{ color: '#8899AA' }}>Manufacturing cost breakdown, profitability and break-even insights</p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-medium"
            style={{ background: 'rgba(0, 214, 143, 0.06)', color: GREEN, border: '1px solid rgba(0, 214, 143, 0.1)' }}
          >
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: GREEN }} />
            Live Data
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <CostKPI
            key={kpi.label}
            icon={kpi.icon}
            label={kpi.label}
            value={kpi.value}
            suffix={kpi.suffix}
            color={kpi.color}
            delay={i}
            trend={kpi.trend}
            trendUp={kpi.trendUp}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 rounded-full" style={{ background: BLUE }} />
          <h2 className="text-sm font-bold text-white">Cost Components</h2>
          <span className="text-[10px] font-medium" style={{ color: '#556677' }}>Per-unit manufacturing cost breakdown</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {costComponents.map((comp, i) => (
            <CostComponentCard
              key={comp.label}
              icon={comp.icon}
              label={comp.label}
              value={comp.value}
              color={comp.color}
              delay={0.3 + i * 0.06}
            />
          ))}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        <PremiumChart
          title="Cost Breakdown"
          subtitle="Distribution of manufacturing costs"
          type="doughnut"
          data={costBreakdownData}
          options={costBreakdownOpts}
          height={340}
          delay={0}
        />
        <PremiumChart
          title="Break-even Analysis"
          subtitle="Revenue vs cost at volume"
          type="bar"
          data={breakEvenData}
          options={breakEvenOpts}
          height={340}
          delay={1}
        />
      </div>

      <PremiumChart
        title="Machine Cost Comparison"
        subtitle="Cost vs revenue per machine"
        type="bar"
        data={machineCostData}
        options={machineCostOpts}
        height={320}
        delay={2}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="glass-card-premium"
        style={{ padding: '24px' }}
      >
        <div className="flex items-center gap-2 mb-6">
          <div className="w-1 h-5 rounded-full" style={{ background: GREEN }} />
          <h2 className="text-sm font-bold text-white">Financial Summary</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryItems.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.45 + i * 0.08 }}
              className="relative overflow-hidden group"
              style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${item.color}20`,
                borderRadius: '14px',
                padding: '22px',
              }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `radial-gradient(circle at 50% 50%, ${item.color}08, transparent 70%)` }}
              />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${item.color}12` }}
                  >
                    <i className={`fas ${item.icon} text-sm`} style={{ color: item.color }} />
                  </div>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#556677' }}>
                  {item.label}
                </p>
                <p className="text-2xl font-extrabold text-white tracking-tight">
                  {item.suffix === ' units' ? (
                    <>
                      {Number(item.value).toLocaleString()}
                      <span className="text-sm font-medium ml-1" style={{ color: '#556677' }}>units</span>
                    </>
                  ) : (
                    <>${Number(item.value).toLocaleString()}</>
                  )}
                </p>
              </div>
              <div
                className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `linear-gradient(90deg, transparent, ${item.color}, transparent)` }}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
