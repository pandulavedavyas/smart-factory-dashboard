import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { subscribeCollection } from '../services/firestoreService';

function StockGauge({ used, total, label }) {
  const pct = total > 0 ? (used / total) * 100 : 0;
  const color = pct > 85 ? '#FF4757' : pct > 60 ? '#FFB340' : '#00D68F';

  return (
    <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-white">{label}</span>
        <span className="text-[10px] font-bold" style={{ color }}>{pct.toFixed(1)}%</span>
      </div>
      <div className="h-3 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <div className="h-full rounded-full transition-all duration-1000" style={{
          width: `${Math.min(pct, 100)}%`,
          background: `linear-gradient(90deg, ${color}CC, ${color})`,
          boxShadow: `0 0 12px ${color}30`,
        }} />
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-[9px] font-medium" style={{ color: '#556677' }}>{used.toLocaleString()} Tons used</span>
        <span className="text-[9px] font-medium" style={{ color: '#556677' }}>{Math.max(0, total - used).toLocaleString()} Tons capacity</span>
      </div>
    </div>
  );
}

export default function Materials() {
  const [inventory, setInventory] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' or 'raw'

  useEffect(() => {
    const unSubInv = subscribeCollection('inventory', (data) => {
      setInventory(data);
      setLoading(false);
    });
    const unSubRaw = subscribeCollection('rawMaterials', (data) => {
      setRawMaterials(data);
    });

    return () => {
      unSubInv();
      unSubRaw();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-3">
        <div className="w-8 h-8 border-2 border-white/[0.04] border-t-[#00E5FF] rounded-full animate-spin" />
        <span className="text-xs" style={{ color: '#8899AA' }}>Syncing steel inventory & raw materials...</span>
      </div>
    );
  }

  const items = activeTab === 'inventory' ? inventory : rawMaterials;
  const totalItems = items.length;
  const lowStockCount = items.filter(m => m.status === 'low_stock').length;
  const totalValue = items.reduce((s, m) => s + (m.unit_price || 0) * (m.quantity || 0), 0);
  const totalWeight = items.reduce((s, m) => s + (m.quantity || 0), 0);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-xl font-bold text-white tracking-tight uppercase">Steel Inventory & Raw Materials</h1>
          <p className="text-xs" style={{ color: '#8899AA' }}>Real-time Firestore tracking of finished steel stock, billets, rebar, iron ore, and scrap metal.</p>
        </motion.div>

        {/* Tab selector */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06]">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
              activeTab === 'inventory' ? 'bg-[#0066FF] text-white shadow-lg' : 'text-[#8899AA] hover:text-white'
            }`}
          >
            <i className="fas fa-boxes-stacked mr-1.5" /> Finished Steel Goods
          </button>
          <button
            onClick={() => setActiveTab('raw')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
              activeTab === 'raw' ? 'bg-[#00E5FF] text-black shadow-lg' : 'text-[#8899AA] hover:text-white'
            }`}
          >
            <i className="fas fa-mountain mr-1.5" /> Raw Materials & Ore
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card-premium p-4">
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#556677]">Total Asset Count</span>
          <div className="text-lg font-extrabold text-white mt-1">{totalItems} Commodities</div>
        </div>
        <div className="glass-card-premium p-4">
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#556677]">Low Stock Items</span>
          <div className="text-lg font-extrabold text-[#FF4757] mt-1">{lowStockCount} Reorder Needed</div>
        </div>
        <div className="glass-card-premium p-4">
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#556677]">Total Tonnage</span>
          <div className="text-lg font-extrabold text-[#00E5FF] mt-1">{totalWeight.toLocaleString()} Tons</div>
        </div>
        <div className="glass-card-premium p-4">
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#556677]">Total Asset Value</span>
          <div className="text-lg font-extrabold text-[#00D68F] mt-1">${(totalValue / 1000).toFixed(0)}K USD</div>
        </div>
      </div>

      {/* Warehouse Yard Storage Gauges */}
      <div className="glass-card-premium p-5 space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Yard Storage Capacity Allocation</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StockGauge used={18500} total={25000} label="Zone A - Raw Iron Ore Yard" />
          <StockGauge used={4120} total={5000} label="Zone D - Cast Billets Storage" />
          <StockGauge used={1890} total={2500} label="Zone E - Hot Rolled Coil Yard" />
          <StockGauge used={2450} total={3000} label="Zone H - Finished Goods Warehouse" />
        </div>
      </div>

      {/* Datatable */}
      <div className="glass-card-premium p-1">
        <div className="table-container">
          <table className="w-full">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total Valuation</th>
                <th>Location / Supplier</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((m, i) => (
                <tr key={m.id || i} className="hover:bg-white/[0.02]">
                  <td className="text-xs font-bold text-white flex items-center gap-2">
                    <i className="fas fa-cube text-[10px] text-[#00E5FF]" />
                    <span>{m.name}</span>
                  </td>
                  <td className="text-xs" style={{ color: '#8899AA' }}>{m.category || 'General'}</td>
                  <td className="text-xs font-bold text-white">{m.quantity} {m.unit || 'Tons'}</td>
                  <td className="text-xs" style={{ color: '#8899AA' }}>${m.unit_price || 0}</td>
                  <td className="text-xs font-bold text-[#00D68F]">${((m.unit_price || 0) * (m.quantity || 0)).toLocaleString()}</td>
                  <td className="text-xs" style={{ color: '#8899AA' }}>{m.location || m.supplier || 'Plant Yard'}</td>
                  <td>
                    {m.status === 'low_stock' ? (
                      <span className="status-badge status-down">🔴 Low Stock</span>
                    ) : (
                      <span className="status-badge status-running">🟢 In Stock</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
