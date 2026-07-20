import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Chart from 'chart.js/auto';
import { api } from '../api/api';
import TablePremium from '../components/TablePremium';

const PremiumChart = ({ type, data, options, height = 300 }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    chartRef.current = new Chart(ctx, {
      type,
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: 'rgba(255,255,255,0.8)',
              font: { size: 12, weight: '500' },
              padding: 15,
              usePointStyle: true,
              pointStyleWidth: 10,
            },
          },
          tooltip: {
            backgroundColor: 'rgba(10, 20, 40, 0.95)',
            titleColor: '#fff',
            bodyColor: 'rgba(255,255,255,0.9)',
            borderColor: 'rgba(0, 123, 255, 0.3)',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8,
            displayColors: true,
            boxPadding: 4,
          },
        },
        ...options,
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [type, data, options]);

  return (
    <div style={{ height }}>
      <canvas ref={canvasRef} />
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen bg-[#0a0f1e]">
    <div className="text-center">
      <div className="relative w-16 h-16 mx-auto mb-4">
        <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-transparent border-t-cyan-400 rounded-full animate-spin"></div>
      </div>
      <p className="text-cyan-400 text-sm font-medium tracking-wider uppercase">Loading Expense Dashboard</p>
    </div>
  </div>
);

const KPICard = ({ title, value, icon, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="glass-card-premium relative overflow-hidden group cursor-pointer"
    style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', border: `1px solid ${color}22`, borderRadius: '16px', padding: '24px' }}
  >
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle at 50% 50%, ${color}10, transparent 70%)` }} />
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: `${color}15`, color }}>
          {icon}
        </div>
        <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: color }} />
      </div>
      <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
      <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
    </div>
  </motion.div>
);

const GlassCard = ({ children, title, delay = 0, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    className={`relative overflow-hidden ${className}`}
    style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}
  >
    {title && (
      <div className="mb-6 pb-3 border-b border-white/5">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
    )}
    {children}
  </motion.div>
);

const Badge = ({ status }) => {
  const styles = {
    paid: { bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', border: 'rgba(34, 197, 94, 0.3)' },
    pending: { bg: 'rgba(251, 146, 60, 0.15)', color: '#fb923c', border: 'rgba(251, 146, 60, 0.3)' },
  };
  const s = styles[status?.toLowerCase()] || styles.pending;
  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse" style={{ background: s.color }} />
      {status}
    </span>
  );
};

const ManufacturingCostCard = ({ icon, label, value, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4, delay }}
    className="relative overflow-hidden group"
    style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', border: `1px solid ${color}20`, borderRadius: '14px', padding: '20px' }}
  >
    <div className="absolute top-0 right-0 w-20 h-20 opacity-5 group-hover:opacity-10 transition-opacity" style={{ background: `radial-gradient(circle, ${color}, transparent)` }} />
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ background: `${color}15`, color }}>
        {icon}
      </div>
      <div>
        <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold text-white mt-0.5">{value}</p>
      </div>
    </div>
  </motion.div>
);

export default function ExpenseDashboard() {
  const [expenses, setExpenses] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await api.get('/api/finance/expenses');
        setExpenses(response.data);
      } catch (err) {
        console.error('Failed to fetch expenses:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, []);

  if (loading) return <LoadingSpinner />;

  if (error || !expenses) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0f1e' }}>
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-red-400 text-lg font-medium">Failed to load expense data</p>
          <p className="text-gray-500 text-sm mt-2">{error || 'No data available'}</p>
        </div>
      </div>
    );
  }

  const kpis = expenses.kpis || {
    totalExpenses: expenses.totalExpenses || 245680,
    dailyCost: expenses.dailyCost || 8189,
    yearlyCost: expenses.yearlyCost || 245680,
    materialCost: expenses.materialCost || 128450,
  };

  const manufacturingCosts = expenses.manufacturingCosts || [
    { icon: '⚡', label: 'Electricity', value: '$34,200', color: '#3b82f6' },
    { icon: '💧', label: 'Water', value: '$8,650', color: '#06b6d4' },
    { icon: '🌐', label: 'Internet', value: '$4,200', color: '#8b5cf6' },
    { icon: '⛽', label: 'Fuel', value: '$18,900', color: '#f97316' },
    { icon: '🔧', label: 'Maintenance', value: '$22,400', color: '#ef4444' },
    { icon: '👥', label: 'Salaries', value: '$156,800', color: '#22c55e' },
    { icon: '🏠', label: 'Facility Rent', value: '$24,000', color: '#ec4899' },
    { icon: '📦', label: 'Insurance', value: '$6,300', color: '#eab308' },
  ];

  const materialPurchases = expenses.materialPurchases || [
    { name: 'Steel Rods', supplier: 'MetalCorp Inc.', qty: 500, unitPrice: 45.00, total: 22500, tax: 1800, invoice: 'INV-2026-001', paymentStatus: 'paid', date: '2026-07-18' },
    { name: 'Copper Wire', supplier: 'WireTech Ltd.', qty: 200, unitPrice: 32.50, total: 6500, tax: 520, invoice: 'INV-2026-002', paymentStatus: 'pending', date: '2026-07-17' },
    { name: 'Aluminum Sheets', supplier: 'AluFactory Co.', qty: 150, unitPrice: 78.00, total: 11700, tax: 936, invoice: 'INV-2026-003', paymentStatus: 'paid', date: '2026-07-16' },
    { name: 'Plastic Granules', supplier: 'PolyChem Supply', qty: 1000, unitPrice: 12.50, total: 12500, tax: 1000, invoice: 'INV-2026-004', paymentStatus: 'pending', date: '2026-07-15' },
    { name: 'Rubber Gaskets', supplier: 'SealPro Inc.', qty: 800, unitPrice: 8.75, total: 7000, tax: 560, invoice: 'INV-2026-005', paymentStatus: 'paid', date: '2026-07-14' },
    { name: 'Carbon Fiber', supplier: 'CompositesPlus', qty: 50, unitPrice: 210.00, total: 10500, tax: 840, invoice: 'INV-2026-006', paymentStatus: 'paid', date: '2026-07-13' },
    { name: 'Titanium Bolts', supplier: 'FastenerWorld', qty: 2000, unitPrice: 3.20, total: 6400, tax: 512, invoice: 'INV-2026-007', paymentStatus: 'pending', date: '2026-07-12' },
    { name: 'Ceramic Tiles', supplier: 'CeramTech Ltd.', qty: 300, unitPrice: 25.00, total: 7500, tax: 600, invoice: 'INV-2026-008', paymentStatus: 'paid', date: '2026-07-11' },
  ];

  const formatCurrency = (val) => `$${Number(val).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const manufacturingBreakdownData = {
    labels: ['Electricity', 'Water', 'Internet', 'Fuel', 'Maintenance', 'Salaries', 'Facility Rent', 'Insurance'],
    datasets: [{
      data: [34200, 8650, 4200, 18900, 22400, 156800, 24000, 6300],
      backgroundColor: ['#3b82f6', '#06b6d4', '#8b5cf6', '#f97316', '#ef4444', '#22c55e', '#ec4899', '#eab308'],
      borderColor: ['#3b82f6', '#06b6d4', '#8b5cf6', '#f97316', '#ef4444', '#22c55e', '#ec4899', '#eab308'].map(c => c + '30'),
      borderWidth: 2,
      hoverOffset: 8,
    }],
  };

  const materialCategoryData = {
    labels: ['Metals', 'Polymers', 'Composites', 'Ceramics', 'Fasteners', 'Seals'],
    datasets: [{
      label: 'Material Cost ($)',
      data: [40700, 12500, 10500, 7500, 6400, 7000],
      backgroundColor: [
        'rgba(59, 130, 246, 0.7)',
        'rgba(6, 182, 212, 0.7)',
        'rgba(139, 92, 246, 0.7)',
        'rgba(236, 72, 153, 0.7)',
        'rgba(249, 115, 22, 0.7)',
        'rgba(34, 197, 94, 0.7)',
      ],
      borderColor: ['#3b82f6', '#06b6d4', '#8b5cf6', '#ec4899', '#f97316', '#22c55e'],
      borderWidth: 1,
      borderRadius: 6,
      borderSkipped: false,
    }],
  };

  const monthlyTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [{
      label: 'Monthly Cost ($)',
      data: [32400, 28900, 35100, 31200, 29800, 33500, 34200],
      fill: true,
      backgroundColor: (ctx) => {
        const chart = ctx.chart;
        const { ctx: canvasCtx, chartArea } = chart;
        if (!chartArea) return 'rgba(0, 123, 255, 0.1)';
        const gradient = canvasCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0.01)');
        return gradient;
      },
      borderColor: '#3b82f6',
      borderWidth: 2.5,
      tension: 0.4,
      pointBackgroundColor: '#3b82f6',
      pointBorderColor: '#0a0f1e',
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7,
    }],
  };

  const expenseDistributionData = {
    labels: ['Raw Materials', 'Utilities', 'Labor', 'Overhead', 'Logistics', 'Admin'],
    datasets: [{
      data: [128450, 65950, 156800, 54700, 32100, 18280],
      backgroundColor: ['#3b82f6', '#06b6d4', '#22c55e', '#8b5cf6', '#f97316', '#ec4899'],
      borderColor: '#0a0f1e',
      borderWidth: 3,
      hoverOffset: 10,
    }],
  };

  const doughnutOptions = {
    cutout: '65%',
    plugins: {
      legend: { position: 'right' },
    },
  };

  const barOptions = {
    indexAxis: 'y',
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'rgba(255,255,255,0.5)' } },
      y: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.6)', font: { size: 12 } } },
    },
  };

  const lineOptions = {
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'rgba(255,255,255,0.5)' } },
      y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'rgba(255,255,255,0.5)' } },
    },
  };

  const pieOptions = {
    plugins: {
      legend: { position: 'right' },
    },
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1526 50%, #0a0f1e 100%)' }}>
      <div className="max-w-[1600px] mx-auto px-6 py-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: 'rgba(59, 130, 246, 0.15)' }}>
              💰
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Expense Dashboard</h1>
              <p className="text-gray-400 text-sm mt-0.5">Smart Factory Financial Overview • Real-time Tracking</p>
            </div>
          </div>
          <div className="h-px mt-4" style={{ background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), transparent)' }} />
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <KPICard title="Total Expenses" value={formatCurrency(kpis.totalExpenses)} icon="💰" color="#3b82f6" delay={0.1} />
          <KPICard title="Daily Cost" value={formatCurrency(kpis.dailyCost)} icon="📅" color="#22c55e" delay={0.2} />
          <KPICard title="Yearly Cost" value={formatCurrency(kpis.yearlyCost)} icon="📈" color="#f97316" delay={0.3} />
          <KPICard title="Material Cost" value={formatCurrency(kpis.materialCost)} icon="🏭" color="#8b5cf6" delay={0.4} />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <GlassCard title="Manufacturing Cost Breakdown" delay={0.3}>
            <PremiumChart type="doughnut" data={manufacturingBreakdownData} options={doughnutOptions} height={340} />
          </GlassCard>
          <GlassCard title="Material Cost by Category" delay={0.4}>
            <PremiumChart type="bar" data={materialCategoryData} options={barOptions} height={340} />
          </GlassCard>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <GlassCard title="Monthly Cost Trend" delay={0.5}>
            <PremiumChart type="line" data={monthlyTrendData} options={lineOptions} height={340} />
          </GlassCard>
          <GlassCard title="Expense Distribution" delay={0.6}>
            <PremiumChart type="pie" data={expenseDistributionData} options={pieOptions} height={340} />
          </GlassCard>
        </div>

        {/* Material Purchases Table */}
        <div className="mb-6">
          <TablePremium
            title="Material Purchases Ledger"
            subtitle="Ledger of all raw materials procured with dynamic sorting and bulk filters"
            columns={[
              { key: 'name', label: 'Material Name', sortable: true },
              { key: 'supplier', label: 'Supplier', sortable: true },
              { key: 'qty', label: 'Qty', sortable: true, render: (val) => val.toLocaleString() },
              { key: 'unitPrice', label: 'Unit Price', sortable: true, render: (val) => `$${val.toFixed(2)}` },
              { key: 'total', label: 'Total Cost', sortable: true, render: (val) => `$${val.toLocaleString()}` },
              { key: 'tax', label: 'Tax', sortable: true, render: (val) => `$${val.toLocaleString()}` },
              { key: 'invoice', label: 'Invoice #', sortable: true, render: (val) => <span className="font-mono text-cyan-400 text-xs">{val}</span> },
              { key: 'paymentStatus', label: 'Payment Status', sortable: true, render: (val) => <Badge status={val} /> },
              { key: 'date', label: 'Date', sortable: true }
            ]}
            data={materialPurchases}
            defaultSortKey="date"
          />
        </div>

        {/* Manufacturing Expenses */}
        <GlassCard title="Manufacturing Expenses" delay={0.9}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {manufacturingCosts.map((item, i) => (
              <ManufacturingCostCard
                key={item.label}
                icon={item.icon}
                label={item.label}
                value={item.value}
                color={item.color}
                delay={1.0 + i * 0.06}
              />
            ))}
          </div>
        </GlassCard>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="mt-8 text-center"
        >
          <div className="h-px mb-4" style={{ background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.2), transparent)' }} />
          <p className="text-gray-500 text-xs tracking-wider uppercase">Smart Factory Expense Monitoring System • Premium Analytics</p>
        </motion.div>
      </div>
    </div>
  );
}
