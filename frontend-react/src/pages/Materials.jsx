import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api/api';
import KPICard from '../components/KPICard';
import ChartCard from '../components/ChartCard';
import StatusBadge from '../components/StatusBadge';

function WarehouseGauge({ used, total, label }) {
  const pct = total > 0 ? (used / total) * 100 : 0;
  const color = pct > 85 ? '#FF4757' : pct > 60 ? '#FFB340' : '#00D68F';

  return (
    <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-white">{label}</span>
        <span className="text-[10px] font-bold" style={{ color }}>{pct.toFixed(1)}%</span>
      </div>
      <div className="h-3 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <div className="h-full rounded-full transition-all duration-1500" style={{
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}CC, ${color})`,
          boxShadow: `0 0 12px ${color}30`,
        }} />
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-[9px] font-medium" style={{ color: '#556677' }}>{used} used</span>
        <span className="text-[9px] font-medium" style={{ color: '#556677' }}>{total - used} free</span>
      </div>
    </div>
  );
}

function MaterialCard({ material, index }) {
  const stockPct = material.max_stock > 0 ? (material.quantity / material.max_stock) * 100 : 0;
  const isLow = material.status === 'low_stock';
  const color = isLow ? '#FF4757' : stockPct > 50 ? '#00D68F' : '#FFB340';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="glass-card glass-hover relative overflow-hidden group"
      style={{ padding: '20px' }}
    >
      {isLow && (
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, #FF4757, #FF6B7A)' }} />
      )}

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}12` }}>
            <i className="fas fa-cube text-sm" style={{ color }} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">{material.name}</h4>
            <div className="text-[9px] font-medium" style={{ color: '#556677' }}>{material.category || 'General'}</div>
          </div>
        </div>
        <StatusBadge status={material.status || 'in_stock'} size="xs" />
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="text-[9px] font-medium" style={{ color: '#556677' }}>Quantity</div>
          <div className="text-sm font-bold text-white">{material.quantity} {material.unit || 'units'}</div>
        </div>
        <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="text-[9px] font-medium" style={{ color: '#556677' }}>Value</div>
          <div className="text-sm font-bold text-white">${(material.unit_price * material.quantity || 0).toLocaleString()}</div>
        </div>
      </div>

      {/* Stock bar */}
      <div>
        <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div className="h-full rounded-full transition-all duration-1000" style={{
            width: `${Math.min(stockPct, 100)}%`,
            background: `linear-gradient(90deg, ${color}CC, ${color})`,
            boxShadow: `0 0 6px ${color}30`,
          }} />
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[8px] font-medium" style={{ color: '#556677' }}>{stockPct.toFixed(0)}% capacity</span>
          {isLow && <span className="text-[8px] font-bold" style={{ color: '#FF4757' }}>LOW STOCK</span>}
        </div>
      </div>
    </motion.div>
  );
}

export default function Materials() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/materials').then(d => { if (d) setMaterials(d); setLoading(false); });
  }, []);

  const totalMaterials = materials.length;
  const lowStock = materials.filter(m => m.status === 'low_stock').length;
  const inStock = materials.filter(m => m.status !== 'low_stock').length;
  const totalValue = materials.reduce((s, m) => s + (m.unit_price || 0) * (m.quantity || 0), 0);
  const totalQuantity = materials.reduce((s, m) => s + (m.quantity || 0), 0);
  const avgUtilization = materials.length > 0 ? (materials.reduce((s, m) => s + (m.quantity || 0) / (m.max_stock || 100) * 100, 0) / materials.length).toFixed(1) : 0;

  const categoryPie = {
    labels: [...new Set(materials.map(m => m.category || 'General'))],
    datasets: [{
      data: [...new Set(materials.map(m => m.category || 'General'))].map(cat =>
        materials.filter(m => (m.category || 'General') === cat).reduce((s, m) => s + (m.quantity || 0), 0)
      ),
      backgroundColor: ['#0066FF', '#00D68F', '#A78BFA', '#FFB340', '#00E5FF', '#FF4757'],
      borderWidth: 0,
      hoverOffset: 8,
    }],
  };

  const valueBar = {
    labels: materials.slice(0, 8).map(m => m.name),
    datasets: [{
      label: 'Value ($)',
      data: materials.slice(0, 8).map(m => (m.unit_price || 0) * (m.quantity || 0)),
      backgroundColor: materials.slice(0, 8).map(m => m.status === 'low_stock' ? '#FF4757' : '#0066FF'),
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  const stockBar = {
    labels: materials.slice(0, 8).map(m => m.name),
    datasets: [
      { label: 'Current', data: materials.slice(0, 8).map(m => m.quantity), backgroundColor: '#0066FF', borderRadius: 8, borderSkipped: false },
      { label: 'Max', data: materials.slice(0, 8).map(m => m.max_stock), backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 8, borderSkipped: false },
    ],
  };

  const barOpts = {
    plugins: { legend: { display: true, labels: { color: '#8899AA', usePointStyle: true, pointStyleWidth: 8, font: { size: 10 }, padding: 16 } } },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#556677' }, border: { display: false } },
      x: { grid: { display: false }, ticks: { color: '#556677', maxRotation: 45 }, border: { display: false } },
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
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Inventory</h1>
        <p className="text-xs mt-1" style={{ color: '#8899AA' }}>Raw materials, stock levels, and warehouse analytics</p>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <KPICard icon="fa-cubes" label="Total Materials" value={totalMaterials} color="#0066FF" sub={`${inStock} in stock`} delay={0} />
        <KPICard icon="fa-exclamation-triangle" label="Low Stock" value={lowStock} color="#FF4757" sub="Needs reorder" delay={1} />
        <KPICard icon="fa-dollar-sign" label="Total Value" value={`$${(totalValue / 1000).toFixed(0)}K`} color="#00D68F" sub="All materials" delay={2} />
        <KPICard icon="fa-boxes-stacked" label="Total Qty" value={totalQuantity.toLocaleString()} color="#A78BFA" sub="All units" delay={3} />
        <KPICard icon="fa-chart-pie" label="Avg Utilization" value={`${avgUtilization}`} suffix="%" color="#FFB340" sub="Capacity used" delay={4} />
      </div>

      {/* Low stock alerts */}
      {lowStock > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-2xl"
          style={{ background: 'rgba(255, 71, 87, 0.04)', border: '1px solid rgba(255, 71, 87, 0.1)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255, 71, 87, 0.1)' }}>
              <i className="fas fa-exclamation-triangle text-xs" style={{ color: '#FF4757' }} />
            </div>
            <span className="text-xs font-bold" style={{ color: '#FF4757' }}>Low Stock Alert — {lowStock} items need reorder</span>
          </div>
          <div className="grid md:grid-cols-2 gap-2">
            {materials.filter(m => m.status === 'low_stock').map((m, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl" style={{ background: 'rgba(255, 71, 87, 0.04)' }}>
                <div className="w-2 h-2 rounded-full" style={{ background: '#FF4757' }} />
                <span className="text-xs font-medium text-white">{m.name}</span>
                <span className="text-[9px] font-medium ml-auto" style={{ color: '#FF4757' }}>{m.quantity} remaining</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        <ChartCard title="Category Distribution" data={categoryPie} type="doughnut" options={doughnutOpts} height={260} delay={0} />
        <div className="lg:col-span-2">
          <ChartCard title="Material Value" subtitle="Top items" data={valueBar} type="bar" options={{ ...barOpts, plugins: { legend: { display: false } } }} height={260} delay={1} />
        </div>
      </div>

      <ChartCard title="Stock Comparison" subtitle="Current vs Maximum" data={stockBar} type="bar" options={barOpts} height={260} delay={2} />

      {/* Warehouse capacity */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card-premium" style={{ padding: '24px' }}>
        <h3 className="text-sm font-bold text-white mb-4">Warehouse Capacity</h3>
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
          <WarehouseGauge used={78} total={100} label="Zone A - Raw" />
          <WarehouseGauge used={45} total={100} label="Zone B - Finished" />
          <WarehouseGauge used={92} total={100} label="Zone C - Pending" />
          <WarehouseGauge used={35} total={100} label="Zone D - Returns" />
        </div>
      </motion.div>

      {/* Material cards */}
      <div>
        <h3 className="text-sm font-bold text-white mb-4">All Materials</h3>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {materials.map((m, i) => <MaterialCard key={m.id || i} material={m} index={i} />)}
        </div>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-card-premium" style={{ padding: '24px' }}>
        <h3 className="text-sm font-bold text-white mb-4">Inventory Details</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Material</th><th>Category</th><th>Quantity</th><th>Unit Price</th><th>Total Value</th><th>Status</th></tr>
            </thead>
            <tbody>
              {materials.map((m, i) => (
                <tr key={i}>
                  <td className="font-medium text-white">{m.name}</td>
                  <td className="text-xs" style={{ color: '#8899AA' }}>{m.category || 'General'}</td>
                  <td className="font-semibold text-white">{m.quantity} {m.unit || ''}</td>
                  <td className="text-xs" style={{ color: '#8899AA' }}>${m.unit_price || 0}</td>
                  <td className="font-semibold text-white">${((m.unit_price || 0) * (m.quantity || 0)).toLocaleString()}</td>
                  <td><StatusBadge status={m.status || 'in_stock'} size="xs" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
