import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Chart, registerables } from 'chart.js';
import { api } from '../api/api';
import TablePremium from '../components/TablePremium';

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

function PurchaseKPI({ icon, label, value, suffix = '', color, delay = 0, trend, trendUp }) {
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

export default function PurchaseAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/finance/purchases').then((res) => {
      if (res) {
        setData(res);
        setLoading(false);
      } else {
        setError('Failed to load purchase data');
        setLoading(false);
      }
    }).catch(() => {
      setError('Failed to load purchase data');
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
          <div className="text-xs font-medium" style={{ color: '#556677' }}>Loading purchase analytics...</div>
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

  const kpis = [
    { icon: 'fa-cart-shopping', label: 'Total Purchased', value: d.total_purchased ?? 845200, suffix: '$', color: BLUE, trend: d.total_purchased_trend || '+18.3%', trendUp: d.total_purchased_trend_up !== false },
    { icon: 'fa-boxes-stacked', label: 'Current Inventory', value: d.current_inventory ?? 124680, suffix: '$', color: GREEN, trend: d.current_inventory_trend || '+5.7%', trendUp: d.current_inventory_trend_up !== false },
    { icon: 'fa-calendar-check', label: 'Monthly Average', value: d.monthly_average ?? 70433, suffix: '$', color: PURPLE, trend: d.monthly_average_trend || '+9.1%', trendUp: d.monthly_average_trend_up !== false },
    { icon: 'fa-rotate', label: 'Turnover Rate', value: d.turnover_rate ?? 6.8, suffix: 'x', color: CYAN, trend: d.turnover_rate_trend || '+0.4x', trendUp: d.turnover_rate_trend_up !== false },
    { icon: 'fa-triangle-exclamation', label: 'Low Stock Items', value: d.low_stock_items ?? 12, suffix: '', color: RED, trend: d.low_stock_items_trend || '-3', trendUp: false },
  ];

  const monthlyLabels = d.monthly_labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyPurchasesData = {
    labels: monthlyLabels,
    datasets: [
      {
        label: 'Monthly Purchases',
        data: d.monthly_values || [62000, 58000, 71000, 68000, 75000, 82000, 78000, 86000, 73000, 91000, 85000, 96000],
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

  const monthlyPurchasesOpts = {
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

  const supplierLabels = d.supplier_labels || ['MetalCorp', 'WireTech', 'AluFactory', 'PolyChem', 'SealPro', 'CompositesPlus'];
  const supplierComparisonData = {
    labels: supplierLabels,
    datasets: [
      {
        label: 'Purchase Amount',
        data: d.supplier_values || [185000, 142000, 128000, 98000, 112000, 86000],
        backgroundColor: (ctx) => {
          const chart = ctx.chart;
          const { ctx: canvasCtx, chartArea } = chart;
          if (!chartArea) return 'rgba(0, 102, 255, 0.7)';
          const gradient = canvasCtx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, 'rgba(0, 102, 255, 0.15)');
          gradient.addColorStop(1, 'rgba(0, 102, 255, 0.8)');
          return gradient;
        },
        borderRadius: 6,
        borderSkipped: false,
        barPercentage: 0.65,
        categoryPercentage: 0.7,
      },
    ],
  };

  const supplierComparisonOpts = {
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

  const costLabels = d.cost_labels || ['Raw Metal', 'Polymers', 'Electronics', 'Chemicals', 'Composites', 'Fasteners'];
  const costBreakdownData = {
    labels: costLabels,
    datasets: [
      {
        label: 'Cost Breakdown',
        data: d.cost_values || [312000, 168000, 124000, 95000, 82000, 64200],
        backgroundColor: [
          `rgba(${parseInt(BLUE.slice(1, 3), 16)}, ${parseInt(BLUE.slice(3, 5), 16)}, ${parseInt(BLUE.slice(5, 7), 16)}, 0.85)`,
          `rgba(${parseInt(GREEN.slice(1, 3), 16)}, ${parseInt(GREEN.slice(3, 5), 16)}, ${parseInt(GREEN.slice(5, 7), 16)}, 0.85)`,
          `rgba(${parseInt(PURPLE.slice(1, 3), 16)}, ${parseInt(PURPLE.slice(3, 5), 16)}, ${parseInt(PURPLE.slice(5, 7), 16)}, 0.85)`,
          `rgba(${parseInt(AMBER.slice(1, 3), 16)}, ${parseInt(AMBER.slice(3, 5), 16)}, ${parseInt(AMBER.slice(5, 7), 16)}, 0.85)`,
          `rgba(${parseInt(CYAN.slice(1, 3), 16)}, ${parseInt(CYAN.slice(3, 5), 16)}, ${parseInt(CYAN.slice(5, 7), 16)}, 0.85)`,
          `rgba(${parseInt(RED.slice(1, 3), 16)}, ${parseInt(RED.slice(3, 5), 16)}, ${parseInt(RED.slice(5, 7), 16)}, 0.85)`,
        ],
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

  const materials = d.materials || [
    { name: 'Steel Rods A36', supplier: 'MetalCorp Inc.', category: 'Raw Metal', stock: 2450, unit: 'kg', cost: 4.80, totalValue: 11760 },
    { name: 'Copper Wire 12AWG', supplier: 'WireTech Ltd.', category: 'Electronics', stock: 1800, unit: 'm', cost: 2.35, totalValue: 4230 },
    { name: 'Aluminum Sheet 6061', supplier: 'AluFactory Co.', category: 'Raw Metal', stock: 320, unit: 'sheet', cost: 78.50, totalValue: 25120 },
    { name: 'Nylon Resin PA6', supplier: 'PolyChem Supply', category: 'Polymers', stock: 5600, unit: 'kg', cost: 3.20, totalValue: 17920 },
    { name: 'Silicone Gaskets', supplier: 'SealPro Inc.', category: 'Fasteners', stock: 420, unit: 'pcs', cost: 8.75, totalValue: 3675 },
    { name: 'Carbon Fiber Sheet', supplier: 'CompositesPlus', category: 'Composites', stock: 85, unit: 'sheet', cost: 210.00, totalValue: 17850 },
    { name: 'Titanium Bolts M8', supplier: 'FastenerWorld', category: 'Fasteners', stock: 6200, unit: 'pcs', cost: 1.85, totalValue: 11470 },
    { name: 'Epoxy Adhesive', supplier: 'PolyChem Supply', category: 'Chemicals', stock: 280, unit: 'L', cost: 32.00, totalValue: 8960 },
    { name: 'Stainless Sheet 304', supplier: 'MetalCorp Inc.', category: 'Raw Metal', stock: 190, unit: 'sheet', cost: 125.00, totalValue: 23750 },
    { name: 'Rubber Compound NBR', supplier: 'SealPro Inc.', category: 'Polymers', stock: 1200, unit: 'kg', cost: 5.60, totalValue: 6720 },
    { name: 'Brass Rod C360', supplier: 'MetalCorp Inc.', category: 'Raw Metal', stock: 880, unit: 'kg', cost: 8.90, totalValue: 7832 },
    { name: 'PCB Boards', supplier: 'WireTech Ltd.', category: 'Electronics', stock: 150, unit: 'pcs', cost: 42.00, totalValue: 6300 },
  ];

  const getStockBadge = (stock) => {
    if (stock < 200) return { bg: 'rgba(255, 71, 87, 0.12)', color: RED, border: 'rgba(255, 71, 87, 0.2)', label: 'Low' };
    if (stock < 1000) return { bg: 'rgba(255, 179, 64, 0.12)', color: AMBER, border: 'rgba(255, 179, 64, 0.2)', label: 'Medium' };
    return { bg: 'rgba(0, 214, 143, 0.12)', color: GREEN, border: 'rgba(0, 214, 143, 0.2)', label: 'Healthy' };
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Purchase Analytics</h1>
          <p className="text-xs mt-1" style={{ color: '#8899AA' }}>Procurement insights, supplier performance and inventory health</p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-medium"
            style={{ background: 'rgba(0, 102, 255, 0.06)', color: BLUE, border: '1px solid rgba(0, 102, 255, 0.1)' }}
          >
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: BLUE }} />
            Live Data
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((kpi, i) => (
          <PurchaseKPI
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

      <div className="grid lg:grid-cols-2 gap-6">
        <PremiumChart
          title="Monthly Purchases Trend"
          subtitle="12-month procurement overview"
          type="line"
          data={monthlyPurchasesData}
          options={monthlyPurchasesOpts}
          height={320}
          delay={0}
        />
        <PremiumChart
          title="Supplier Comparison"
          subtitle="Total spend by supplier"
          type="bar"
          data={supplierComparisonData}
          options={supplierComparisonOpts}
          height={320}
          delay={1}
        />
      </div>

      <PremiumChart
        title="Material Cost Breakdown"
        subtitle="Distribution by material category"
        type="doughnut"
        data={costBreakdownData}
        options={costBreakdownOpts}
        height={340}
        delay={2}
      />

      <div className="mb-6">
        <TablePremium
          title="Materials Inventory Log"
          subtitle="Real-time stock levels, unit valuations, and supplier metrics"
          columns={[
            { key: 'name', label: 'Material Name', sortable: true },
            { key: 'supplier', label: 'Supplier', sortable: true },
            { 
              key: 'category', 
              label: 'Category', 
              sortable: true,
              render: (val) => (
                <span
                  className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                  style={{ background: 'rgba(0, 102, 255, 0.08)', color: '#0066FF', border: '1px solid rgba(0, 102, 255, 0.12)' }}
                >
                  {val}
                </span>
              )
            },
            { key: 'stock', label: 'Stock Level', sortable: true, render: (val) => val.toLocaleString() },
            { key: 'unit', label: 'Unit', sortable: true },
            { key: 'cost', label: 'Unit Cost', sortable: true, render: (val) => `$${val.toFixed(2)}` },
            { key: 'totalValue', label: 'Total Value', sortable: true, render: (val) => `$${val.toLocaleString()}` },
            {
              key: 'stock',
              label: 'Status',
              sortable: true,
              render: (val) => {
                const badge = getStockBadge(val);
                return (
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase"
                    style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: badge.color }} />
                    {badge.label}
                  </span>
                );
              }
            }
          ]}
          data={materials}
          defaultSortKey="name"
          filterOptions={{
            key: 'category',
            options: ['Raw Metal', 'Polymers', 'Electronics', 'Chemicals', 'Composites', 'Fasteners']
          }}
        />
      </div>
    </div>
  );
}
