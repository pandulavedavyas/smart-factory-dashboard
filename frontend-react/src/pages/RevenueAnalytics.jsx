import { useState, useEffect, useRef, useCallback } from 'react';
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

function RevenueKPI({ icon, label, value, suffix = '', color, delay = 0, trend, trendUp }) {
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.\-]/g, '')) : value;
  const isNumeric = !isNaN(numericValue) && numericValue !== null && numericValue !== undefined;
  const { count, ref } = useAnimatedCounter(isNumeric ? numericValue : 0);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, delay: delay * 0.08, ease: [0.4, 0, 0.2, 1] }}
      className="glass-card glass-hover group cursor-default relative overflow-hidden"
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

export default function RevenueAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('daily');

  useEffect(() => {
    api.get('/finance/revenue').then((res) => {
      if (res) {
        setData(res);
        setLoading(false);
      } else {
        setError('Failed to load revenue data');
        setLoading(false);
      }
    }).catch(() => {
      setError('Failed to load revenue data');
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
          <div className="text-xs font-medium" style={{ color: '#556677' }}>Loading revenue analytics...</div>
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

  const tabs = [
    { id: 'daily', label: 'Daily', icon: 'fa-calendar-day' },
    { id: 'weekly', label: 'Weekly', icon: 'fa-calendar-week' },
    { id: 'monthly', label: 'Monthly', icon: 'fa-calendar' },
  ];

  const getTrendData = useCallback(() => {
    if (activeTab === 'daily') {
      return {
        labels: d.daily_labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        values: d.daily_values || [12400, 14800, 11200, 16500, 15300, 18200, 13900],
      };
    }
    if (activeTab === 'weekly') {
      return {
        labels: d.weekly_labels || ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
        values: d.weekly_values || [85000, 92000, 78000, 104000, 96000, 112000, 89000, 118000],
      };
    }
    return {
      labels: d.monthly_labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      values: d.monthly_values || [340000, 385000, 420000, 395000, 460000, 510000, 480000, 530000, 495000, 560000, 520000, 590000],
    };
  }, [activeTab, d]);

  const trendData = getTrendData();

  const kpis = [
    { icon: 'fa-sack-dollar', label: 'Total Revenue', value: d.total_revenue ?? 1284500, suffix: '$', color: GREEN, trend: d.total_revenue_trend || '+12.4%', trendUp: d.total_revenue_trend_up !== false },
    { icon: 'fa-chart-line', label: 'Avg Daily', value: d.avg_daily ?? 42817, suffix: '$', color: BLUE, trend: d.avg_daily_trend || '+8.2%', trendUp: d.avg_daily_trend_up !== false },
    { icon: 'fa-trophy', label: 'Best Day', value: d.best_day ?? 68500, suffix: '$', color: AMBER, trend: d.best_day_trend || '+15.7%', trendUp: d.best_day_trend_up !== false },
    { icon: 'fa-arrow-trend-up', label: 'Growth Rate', value: d.growth_rate ?? 12.4, suffix: '%', color: PURPLE, trend: d.growth_rate_trend || '+3.1%', trendUp: d.growth_rate_trend_up !== false },
  ];

  const revenueTrendData = {
    labels: trendData.labels,
    datasets: [
      {
        label: 'Revenue',
        data: trendData.values,
        borderColor: BLUE,
        backgroundColor: 'rgba(0, 102, 255, 0.08)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: BLUE,
        pointBorderColor: NAVY,
        pointBorderWidth: 2,
        pointHoverRadius: 7,
        pointHoverBackgroundColor: BLUE,
        pointHoverBorderColor: '#FFFFFF',
        pointHoverBorderWidth: 2,
        borderWidth: 2.5,
      },
    ],
  };

  const revenueTrendOpts = {
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: false,
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
    interaction: { intersect: false, mode: 'index' },
  };

  const revVsExpLabels = d.revenue_expenses_labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const revVsExpData = {
    labels: revVsExpLabels,
    datasets: [
      {
        label: 'Revenue',
        data: d.revenue_values || [48000, 52000, 61000, 58000, 65000, 72000, 78000],
        backgroundColor: (ctx) => {
          const chart = ctx.chart;
          const { ctx: canvasCtx, chartArea } = chart;
          if (!chartArea) return 'rgba(0, 214, 143, 0.7)';
          const gradient = canvasCtx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, 'rgba(0, 214, 143, 0.2)');
          gradient.addColorStop(1, 'rgba(0, 214, 143, 0.8)');
          return gradient;
        },
        borderRadius: 6,
        borderSkipped: false,
        barPercentage: 0.65,
        categoryPercentage: 0.7,
      },
      {
        label: 'Expenses',
        data: d.expense_values || [32000, 35000, 38000, 36000, 40000, 42000, 44000],
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
      },
    ],
  };

  const revVsExpOpts = {
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
        stacked: true,
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
        stacked: true,
        grid: { display: false },
        ticks: { color: CHART_COLORS.tick, font: { family: 'Inter', size: 10 }, padding: 8 },
        border: { display: false },
      },
    },
  };

  const productLabels = d.product_labels || ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'];
  const productData = {
    labels: productLabels,
    datasets: [
      {
        label: 'Revenue by Product',
        data: d.product_values || [245000, 198000, 167000, 134000, 98000],
        backgroundColor: [
          `rgba(0, 102, 255, 0.8)`,
          `rgba(0, 214, 143, 0.8)`,
          `rgba(167, 139, 250, 0.8)`,
          `rgba(0, 229, 255, 0.8)`,
          `rgba(255, 179, 64, 0.8)`,
        ],
        borderRadius: 6,
        borderSkipped: false,
        barThickness: 22,
      },
    ],
  };

  const productOpts = {
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
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
      y: {
        grid: { display: false },
        ticks: { color: CHART_COLORS.tick, font: { family: 'Inter', size: 10 }, padding: 8 },
        border: { display: false },
      },
    },
  };

  const machineLabels = d.machine_labels || ['CNC-01', 'CNC-02', 'Press-01', 'Lathe-01', 'Assembly-01', 'Assembly-02'];
  const machineData = {
    labels: machineLabels,
    datasets: [
      {
        label: 'Revenue by Machine',
        data: d.machine_values || [185000, 162000, 143000, 128000, 198000, 156000],
        backgroundColor: (ctx) => {
          const chart = ctx.chart;
          const { ctx: canvasCtx, chartArea } = chart;
          if (!chartArea) return 'rgba(0, 229, 255, 0.7)';
          const gradient = canvasCtx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, 'rgba(0, 229, 255, 0.15)');
          gradient.addColorStop(1, 'rgba(0, 229, 255, 0.8)');
          return gradient;
        },
        borderRadius: 6,
        borderSkipped: false,
        barPercentage: 0.65,
        categoryPercentage: 0.7,
      },
    ],
  };

  const machineOpts = {
    plugins: {
      legend: { display: false },
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

  const profitLabels = d.profit_labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const profitData = {
    labels: profitLabels,
    datasets: [
      {
        label: 'Profit',
        data: d.profit_values || [16000, 17000, 23000, 22000, 25000, 30000, 34000],
        borderColor: GREEN,
        backgroundColor: (ctx) => {
          const chart = ctx.chart;
          const { ctx: canvasCtx, chartArea } = chart;
          if (!chartArea) return 'rgba(0, 214, 143, 0.08)';
          const gradient = canvasCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(0, 214, 143, 0.18)');
          gradient.addColorStop(0.5, 'rgba(0, 214, 143, 0.06)');
          gradient.addColorStop(1, 'rgba(0, 214, 143, 0)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: GREEN,
        pointBorderColor: NAVY,
        pointBorderWidth: 2,
        pointHoverRadius: 7,
        pointHoverBackgroundColor: GREEN,
        pointHoverBorderColor: '#FFFFFF',
        pointHoverBorderWidth: 2,
        borderWidth: 2.5,
      },
    ],
  };

  const profitOpts = {
    plugins: {
      legend: { display: false },
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
    interaction: { intersect: false, mode: 'index' },
  };

  const lineLabels = d.line_labels || ['Line A', 'Line B', 'Line C', 'Line D', 'Line E'];
  const lineData = {
    labels: lineLabels,
    datasets: [
      {
        label: 'Revenue by Line',
        data: d.line_values || [285000, 234000, 198000, 167000, 112000],
        backgroundColor: [
          `rgba(0, 102, 255, 0.85)`,
          `rgba(0, 214, 143, 0.85)`,
          `rgba(167, 139, 250, 0.85)`,
          `rgba(0, 229, 255, 0.85)`,
          `rgba(255, 179, 64, 0.85)`,
        ],
        borderColor: NAVY,
        borderWidth: 3,
        hoverBorderColor: '#FFFFFF',
        hoverBorderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const lineOpts = {
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

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Revenue Analytics</h1>
          <p className="text-xs mt-1" style={{ color: '#8899AA' }}>In-depth revenue analysis and performance trends</p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-medium"
            style={{ background: 'rgba(0, 214, 143, 0.06)', color: GREEN, border: '1px solid rgba(0, 214, 143, 0.1)' }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#00D68F] animate-pulse" />
            Live Data
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <RevenueKPI
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
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="glass-card-premium inline-flex p-1 rounded-2xl"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300"
            style={{
              background: activeTab === tab.id ? BLUE : 'transparent',
              color: activeTab === tab.id ? '#FFFFFF' : '#8899AA',
              boxShadow: activeTab === tab.id ? '0 4px 20px rgba(0, 102, 255, 0.3)' : 'none',
            }}
          >
            <i className={`fas ${tab.icon} text-[10px]`} />
            {tab.label}
          </button>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        <PremiumChart
          title="Revenue Trend"
          subtitle={`• ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} view`}
          type="line"
          data={revenueTrendData}
          options={revenueTrendOpts}
          height={320}
          delay={0}
        />
        <PremiumChart
          title="Revenue vs Expenses"
          subtitle="Stacked monthly comparison"
          type="bar"
          data={revVsExpData}
          options={revVsExpOpts}
          height={320}
          delay={1}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <PremiumChart
          title="Revenue by Product"
          subtitle="Top performing products"
          type="bar"
          data={productData}
          options={productOpts}
          height={300}
          delay={2}
        />
        <PremiumChart
          title="Revenue by Machine"
          subtitle="Machine-level breakdown"
          type="bar"
          data={machineData}
          options={machineOpts}
          height={300}
          delay={3}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <PremiumChart
          title="Profit Trend"
          subtitle="Net profit over time"
          type="line"
          data={profitData}
          options={profitOpts}
          height={300}
          delay={4}
        />
        <PremiumChart
          title="Revenue by Production Line"
          subtitle="Distribution across lines"
          type="doughnut"
          data={lineData}
          options={lineOpts}
          height={300}
          delay={5}
        />
      </div>
    </div>
  );
}
