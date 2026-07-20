import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import { Chart, registerables } from 'chart.js';
import { api } from '../api/api';

Chart.register(...registerables);

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

function FinanceKPI({ icon, label, value, suffix = '', color, delay = 0, trend, trendUp }) {
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.\-]/g, '')) : value;
  const isNumeric = !isNaN(numericValue) && numericValue !== null && numericValue !== undefined;

  const { count, ref } = useAnimatedCounter(isNumeric ? numericValue : 0);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, delay: delay * 0.06, ease: [0.4, 0, 0.2, 1] }}
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
              color: trendUp ? '#00D68F' : '#FF4757',
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

function deepMerge(target, source) {
  const out = { ...target };
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key]) && target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
      out[key] = deepMerge(target[key], source[key]);
    } else {
      out[key] = source[key];
    }
  }
  return out;
}

const CHART_COLORS = {
  grid: 'rgba(255, 255, 255, 0.03)',
  tick: '#556677',
  tooltipBg: 'rgba(7, 26, 47, 0.95)',
  tooltipBorder: 'rgba(0, 102, 255, 0.2)',
  tooltipTitle: '#F0F4F8',
  tooltipBody: '#8899AA',
};

function FinancialChartCard({ title, subtitle, type = 'bar', data, options, height = 300, delay = 0, action }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!canvasRef.current || !data || !isInView) return;
    if (chartRef.current) chartRef.current.destroy();

    const isPie = type === 'pie' || type === 'doughnut' || type === 'radar';
    const isLine = type === 'line' || type === 'area';

    const defaultOpts = {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 1200, easing: 'easeOutQuart' },
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
    if (isLine && data.datasets?.[0] && !data.datasets[0].backgroundColor?._gradient) {
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, 'rgba(0, 102, 255, 0.15)');
      gradient.addColorStop(1, 'rgba(0, 102, 255, 0)');
      if (!data.datasets[0].backgroundColor || typeof data.datasets[0].backgroundColor === 'string') {
        data.datasets[0].backgroundColor = gradient;
      }
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
          {action && <div>{action}</div>}
        </div>
      )}
      <div style={{ height: `${height}px` }} className="relative">
        <canvas ref={canvasRef} />
      </div>
    </motion.div>
  );
}

export default function FinancialDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/finance/dashboard').then((res) => {
      if (res) {
        setData(res);
        setLoading(false);
      } else {
        setError('Failed to load financial data');
        setLoading(false);
      }
    }).catch(() => {
      setError('Failed to load financial data');
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
          <div className="text-xs font-medium" style={{ color: '#556677' }}>Loading financial data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-3xl mb-3" style={{ color: '#FFB340' }} />
          <div className="text-sm font-medium" style={{ color: '#8899AA' }}>{error}</div>
        </div>
      </div>
    );
  }

  const d = data || {};

  const kpis = [
    { icon: 'fa-sack-dollar', label: 'Total Revenue', value: d.total_revenue ?? 0, suffix: '$', color: '#00D68F', trend: d.total_revenue_trend, trendUp: d.total_revenue_trend_up },
    { icon: 'fa-money-bill-wave', label: 'Total Income Generated', value: d.total_income_generated ?? 0, suffix: '$', color: '#00E5FF', trend: d.total_revenue_trend, trendUp: d.total_revenue_trend_up },
    { icon: 'fa-industry', label: 'Total Production Value', value: d.total_production_value ?? 0, suffix: '$', color: '#A78BFA', trend: d.total_revenue_trend, trendUp: d.total_revenue_trend_up },
    { icon: 'fa-calendar', label: 'Monthly Revenue', value: d.monthly_revenue ?? 0, suffix: '$', color: '#0066FF', trend: d.monthly_revenue_trend, trendUp: d.monthly_revenue_trend_up },
    { icon: 'fa-calendar-week', label: 'Weekly Revenue', value: d.weekly_revenue ?? 0, suffix: '$', color: '#A78BFA', trend: d.weekly_revenue_trend, trendUp: d.weekly_revenue_trend_up },
    { icon: 'fa-calendar-day', label: 'Daily Revenue', value: d.daily_revenue ?? 0, suffix: '$', color: '#00E5FF', trend: d.daily_revenue_trend, trendUp: d.daily_revenue_trend_up },
    { icon: 'fa-money-bill-trend-up', label: 'Total Expenses', value: d.total_expenses ?? 0, suffix: '$', color: '#FF4757', trend: d.total_expenses_trend, trendUp: d.total_expenses_trend_up },
    { icon: 'fa-hand-holding-dollar', label: 'Net Profit', value: d.net_profit ?? 0, suffix: '$', color: '#00D68F', trend: d.net_profit_trend, trendUp: d.net_profit_trend_up },
    { icon: 'fa-chart-column', label: 'Gross Profit', value: d.gross_profit ?? 0, suffix: '$', color: '#0066FF', trend: d.gross_profit_trend, trendUp: d.gross_profit_trend_up },
    { icon: 'fa-percent', label: 'Profit Margin %', value: d.profit_margin ?? 0, suffix: '%', color: '#A78BFA', trend: d.profit_margin_trend, trendUp: d.profit_margin_trend_up },
    { icon: 'fa-box-open', label: 'Total Orders', value: d.total_orders ?? 0, suffix: '', color: '#0066FF', trend: d.total_orders_trend, trendUp: d.total_orders_trend_up },
    { icon: 'fa-check-double', label: 'Completed Orders', value: d.completed_orders ?? 0, suffix: '', color: '#00D68F', trend: d.completed_orders_trend, trendUp: d.completed_orders_trend_up },
    { icon: 'fa-hourglass-half', label: 'Pending Orders', value: d.pending_orders ?? 0, suffix: '', color: '#FFB340', trend: d.pending_orders_trend, trendUp: d.pending_orders_trend_up },
    { icon: 'fa-arrow-trend-up', label: 'Factory Growth %', value: d.factory_growth ?? 0, suffix: '%', color: '#00D68F', trend: d.factory_growth_trend, trendUp: d.factory_growth_trend_up },
    { icon: 'fa-gears', label: 'Operating Cost', value: d.operating_cost ?? 0, suffix: '$', color: '#FF4757', trend: d.operating_cost_trend, trendUp: d.operating_cost_trend_up },
    { icon: 'fa-industry', label: 'Manufacturing Cost', value: d.manufacturing_cost ?? 0, suffix: '$', color: '#FFB340', trend: d.manufacturing_cost_trend, trendUp: d.manufacturing_cost_trend_up },
    { icon: 'fa-warehouse', label: 'Inventory Value', value: d.inventory_value ?? 0, suffix: '$', color: '#A78BFA', trend: d.inventory_value_trend, trendUp: d.inventory_value_trend_up },
    { icon: 'fa-chart-pie', label: 'ROI %', value: d.roi ?? 0, suffix: '%', color: '#00E5FF', trend: d.roi_trend, trendUp: d.roi_trend_up },
    { icon: 'fa-tag', label: 'Cost Per Unit', value: d.cost_per_unit ?? 0, suffix: '$', color: '#FF4757', trend: d.cost_per_unit_trend, trendUp: d.cost_per_unit_trend_up },
    { icon: 'fa-server', label: 'Revenue Per Machine', value: d.revenue_per_machine ?? 0, suffix: '$', color: '#0066FF', trend: d.revenue_per_machine_trend, trendUp: d.revenue_per_machine_trend_up },
    { icon: 'fa-users-gear', label: 'Revenue Per Worker', value: d.revenue_per_worker ?? 0, suffix: '$', color: '#00D68F', trend: d.revenue_per_worker_trend, trendUp: d.revenue_per_worker_trend_up },
  ];

  const revenueExpensesLabels = d.revenue_expenses_labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const revenueExpensesData = {
    labels: revenueExpensesLabels,
    datasets: [
      {
        label: 'Revenue',
        data: d.revenue_values || [48000, 52000, 61000, 58000, 65000, 72000, 78000],
        backgroundColor: (ctx) => {
          const chart = ctx.chart;
          const { ctx: canvasCtx, chartArea } = chart;
          if (!chartArea) return 'rgba(0, 102, 255, 0.7)';
          const gradient = canvasCtx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, 'rgba(0, 214, 143, 0.2)');
          gradient.addColorStop(1, 'rgba(0, 214, 143, 0.8)');
          return gradient;
        },
        borderRadius: 8,
        borderSkipped: false,
        barPercentage: 0.6,
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
        borderRadius: 8,
        borderSkipped: false,
        barPercentage: 0.6,
        categoryPercentage: 0.7,
      },
    ],
  };

  const revenueExpensesOpts = {
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          color: '#556677',
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
        grid: { color: 'rgba(255, 255, 255, 0.03)', drawBorder: false },
        ticks: {
          color: '#556677',
          font: { family: 'Inter', size: 10 },
          padding: 8,
          callback: (val) => '$' + (val / 1000) + 'k',
        },
        border: { display: false },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#556677', font: { family: 'Inter', size: 10 }, padding: 8 },
        border: { display: false },
      },
    },
  };

  const profitTrendLabels = d.profit_trend_labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const profitTrendData = {
    labels: profitTrendLabels,
    datasets: [
      {
        label: 'Profit',
        data: d.profit_trend_values || [12000, 15000, 18000, 14000, 22000, 19000, 26000],
        borderColor: '#00D68F',
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
        pointRadius: 5,
        pointBackgroundColor: '#00D68F',
        pointBorderColor: '#071A2F',
        pointBorderWidth: 2,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: '#00D68F',
        pointHoverBorderColor: '#FFFFFF',
        pointHoverBorderWidth: 2,
        borderWidth: 2.5,
      },
    ],
  };

  const profitTrendOpts = {
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          color: '#556677',
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
        grid: { color: 'rgba(255, 255, 255, 0.03)', drawBorder: false },
        ticks: {
          color: '#556677',
          font: { family: 'Inter', size: 10 },
          padding: 8,
          callback: (val) => '$' + (val / 1000) + 'k',
        },
        border: { display: false },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#556677', font: { family: 'Inter', size: 10 }, padding: 8 },
        border: { display: false },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Financial Dashboard</h1>
          <p className="text-xs mt-1" style={{ color: '#8899AA' }}>Comprehensive financial overview and key performance metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-medium"
            style={{ background: 'rgba(0, 214, 143, 0.06)', color: '#00D68F', border: '1px solid rgba(0, 214, 143, 0.1)' }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#00D68F] animate-pulse" />
            Live Data
          </div>
        </div>
      </motion.div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, i) => (
          <FinanceKPI
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

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <FinancialChartCard
          title="Revenue vs Expenses"
          subtitle="Monthly comparison"
          type="bar"
          data={revenueExpensesData}
          options={revenueExpensesOpts}
          height={300}
          delay={0}
        />
        <FinancialChartCard
          title="Profit Trend"
          subtitle="Daily performance"
          type="line"
          data={profitTrendData}
          options={profitTrendOpts}
          height={300}
          delay={1}
        />
      </div>
    </div>
  );
}