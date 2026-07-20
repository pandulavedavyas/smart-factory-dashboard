import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const quickFilters = [
  'Today',
  'Yesterday',
  'This Week',
  'This Month',
  'Last Month',
  'Last 3 Months',
  'Last 6 Months',
  'This Year',
];

const reportCategories = [
  {
    id: 'production',
    title: 'Production Reports',
    icon: 'fa-industry',
    color: '#0066FF',
    reports: [
      { name: 'Daily Production Report', desc: 'Daily output and efficiency metrics' },
      { name: 'Weekly Production Report', desc: 'Weekly production summary and trends' },
      { name: 'Monthly Production Report', desc: 'Monthly production analysis' },
      { name: 'Shift Report', desc: 'Per-shift performance data' },
      { name: 'Machine Performance Report', desc: 'Individual machine output stats' },
      { name: 'Worker Performance Report', desc: 'Per-worker productivity metrics' },
    ],
  },
  {
    id: 'financial',
    title: 'Financial Reports',
    icon: 'fa-dollar-sign',
    color: '#00D68F',
    reports: [
      { name: 'Income Report', desc: 'Total income breakdown' },
      { name: 'Expense Report', desc: 'Detailed expense analysis' },
      { name: 'Profit & Loss Statement', desc: 'P&L overview for the period' },
      { name: 'Revenue Report', desc: 'Revenue streams and growth' },
      { name: 'Sales Report', desc: 'Sales data and performance' },
      { name: 'Tax Summary', desc: 'Tax obligations and filings' },
      { name: 'Balance Summary', desc: 'Account balance overview' },
      { name: 'Factory Performance Report', desc: 'Financial health of operations' },
    ],
  },
  {
    id: 'inventory',
    title: 'Inventory Reports',
    icon: 'fa-warehouse',
    color: '#A78BFA',
    reports: [
      { name: 'Inventory Report', desc: 'Current stock levels and valuation' },
      { name: 'Purchase Report', desc: 'Procurement activity summary' },
      { name: 'Raw Material Report', desc: 'Raw material usage and costs' },
      { name: 'Stock Summary', desc: 'Stock movement and reconciliation' },
    ],
  },
  {
    id: 'machine',
    title: 'Machine Reports',
    icon: 'fa-gears',
    color: '#FFB340',
    reports: [
      { name: 'Machine Health Report', desc: 'Operational status and diagnostics' },
      { name: 'Downtime Report', desc: 'Unplanned stoppage analysis' },
      { name: 'Maintenance History', desc: 'Service and repair log' },
      { name: 'Temperature Logs', desc: 'Thermal readings over time' },
      { name: 'Working Hours Report', desc: 'Machine runtime tracking' },
      { name: 'Utilization Report', desc: 'Capacity utilization metrics' },
    ],
  },
  {
    id: 'worker',
    title: 'Worker Reports',
    icon: 'fa-users',
    color: '#00E5FF',
    reports: [
      { name: 'Attendance Report', desc: 'Check-in and check-out records' },
      { name: 'Productivity Report', desc: 'Output per worker metrics' },
      { name: 'Working Hours Report', desc: 'Logged hours and overtime' },
      { name: 'Shift Summary', desc: 'Shift-wise worker allocation' },
      { name: 'Overtime Report', desc: 'Overtime hours and costs' },
      { name: 'Performance Ranking', desc: 'Top performers leaderboard' },
    ],
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const cardHover = {
  rest: { scale: 1, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  hover: { scale: 1.01, boxShadow: '0 8px 30px rgba(0,0,0,0.15)' },
};

export default function ReportsCenter() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [selectedFilter, setSelectedFilter] = useState('This Month');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const isWorker = user?.role === 'worker';

  const filteredCategories = isWorker
    ? reportCategories.filter((c) => c.id === 'worker')
    : selectedCategory === 'all'
      ? reportCategories
      : reportCategories.filter((c) => c.id === selectedCategory);

  const handleExport = async (format, categoryId, reportName) => {
    const formatLabels = { pdf: 'pdf', excel: 'xlsx', csv: 'csv', word: 'docx' };
    const fmt = formatLabels[format] || 'csv';
    const token = localStorage.getItem('sf_token');
    
    showToast(`Exporting "${reportName}" as ${format.toUpperCase()}...`);
    setLoading(true);

    try {
      const headers = {};
      if (token) headers['Authorization'] = 'Bearer ' + token;
      
      const queryParams = new URLSearchParams({
        category: categoryId,
        format: fmt,
        start_date: customStartDate || '',
        end_date: customEndDate || ''
      });
      
      const response = await fetch(`/api/reports/export?${queryParams.toString()}`, {
        headers
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${categoryId}_report_${new Date().toISOString().slice(0, 10)}.${fmt}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
      showToast(`Successfully downloaded "${reportName}"!`);
    } catch (err) {
      console.error(err);
      showToast('Export failed. Please check server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const [printData, setPrintData] = useState({ title: '', category: '', date: '', headers: [], rows: [] });

  const handlePrint = async (categoryId, reportName) => {
    showToast(`Preparing "${reportName}" for printing...`);
    setLoading(true);
    try {
      const token = localStorage.getItem('sf_token');
      const headers = {};
      if (token) headers['Authorization'] = 'Bearer ' + token;

      const queryParams = new URLSearchParams({
        category: categoryId,
        format: 'csv',
        start_date: customStartDate || '',
        end_date: customEndDate || ''
      });
      
      const response = await fetch(`/api/reports/export?${queryParams.toString()}`, { headers });
      const csvText = await response.text();
      
      // Basic CSV parser
      const lines = csvText.split('\n').map(line => line.split(',').map(cell => cell.replace(/^"|"$/g, '')));
      if (lines.length > 0) {
        const tableHeaders = lines[0];
        const tableRows = lines.slice(1).filter(r => r.length === tableHeaders.length);
        setPrintData({
          title: reportName,
          category: categoryId.toUpperCase(),
          date: new Date().toLocaleString(),
          headers: tableHeaders,
          rows: tableRows
        });
        setShowPrintPreview(true);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to fetch data for printing.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportAll = () => {
    const targets = isWorker ? ['worker'] : ['production', 'financial', 'inventory', 'machine', 'worker'];
    targets.forEach((catId) => {
      const category = reportCategories.find(c => c.id === catId);
      if (category && category.reports.length > 0) {
        handleExport('pdf', catId, category.reports[0].name);
      }
    });
  };

  const handlePrintAll = () => {
    handlePrint('financial', 'Overall Factory Operations Summary');
  };

  const handleFilterApply = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast(`Filtered to: ${selectedFilter}`);
    }, 600);
  };

  const exportButtons = [
    { format: 'pdf', icon: 'fa-file-pdf', color: '#FF4757', label: 'PDF' },
    { format: 'excel', icon: 'fa-file-excel', color: '#00D68F', label: 'Excel' },
    { format: 'csv', icon: 'fa-file-csv', color: '#0066FF', label: 'CSV' },
    { format: 'word', icon: 'fa-file-word', color: '#0066FF', label: 'Word' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f2035] to-[#1a1a3e] p-4 md:p-8">
      <motion.div
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Header */}
        <motion.div variants={fadeInUp} custom={0} className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Reports Center
          </h1>
          <p className="text-gray-400 text-base md:text-lg">
            Professional reporting and export
          </p>
        </motion.div>

        {/* Filter Bar */}
        <motion.div
          variants={fadeInUp}
          custom={1}
          className="glass-card-premium rounded-2xl p-5 md:p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <i className="fa-solid fa-filter text-[#0066FF]" />
            <span className="text-white font-semibold text-sm uppercase tracking-wider">
              Quick Filters
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {quickFilters.map((filter) => (
              <motion.button
                key={filter}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedFilter(filter);
                  handleFilterApply();
                }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  selectedFilter === filter
                    ? 'bg-[#0066FF] text-white shadow-lg shadow-[#0066FF]/30'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {filter}
              </motion.button>
            ))}
          </div>
          <div className="flex flex-wrap items-end gap-3 pt-3 border-t border-white/10">
            <div className="space-y-1">
              <label className="text-xs text-gray-400 uppercase tracking-wider">From</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-[#0066FF] transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-400 uppercase tracking-wider">To</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-[#0066FF] transition-colors"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleFilterApply}
              className="px-6 py-2 bg-[#0066FF] text-white rounded-xl text-sm font-medium hover:bg-[#0055dd] transition-colors shadow-lg shadow-[#0066FF]/20"
            >
              Apply
            </motion.button>
          </div>
          {!isWorker && (
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/10">
              <span className="text-xs text-gray-400 uppercase tracking-wider mr-2">
                Category:
              </span>
              {['all', ...reportCategories.map((c) => c.id)].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                    selectedCategory === cat
                      ? 'bg-white/15 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {cat === 'all' ? 'All' : cat}
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Loading Overlay */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <div className="glass-card-premium rounded-2xl p-8 flex flex-col items-center gap-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="w-10 h-10 border-4 border-[#0066FF] border-t-transparent rounded-full"
              />
              <p className="text-white text-sm font-medium">Generating reports...</p>
            </div>
          </motion.div>
        )}

        {/* Report Categories Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCategories.map((category, catIdx) => (
            <motion.div
              key={category.id}
              variants={fadeInUp}
              custom={catIdx + 2}
              initial="rest"
              whileHover="hover"
              animate="rest"
              className="glass-card-premium rounded-2xl overflow-hidden"
            >
              {/* Category Header */}
              <div
                className="px-6 py-4 border-b border-white/10 flex items-center gap-3"
                style={{ borderLeft: `4px solid ${category.color}` }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  <i
                    className={`fa-solid ${category.icon} text-lg`}
                    style={{ color: category.color }}
                  />
                </div>
                <div>
                  <h2 className="text-white font-semibold text-lg">{category.title}</h2>
                  <p className="text-gray-400 text-xs">
                    {category.reports.length} report{category.reports.length !== 1 ? 's' : ''} available
                  </p>
                </div>
              </div>

              {/* Report Rows */}
              <div className="divide-y divide-white/5">
                {category.reports.map((report, repIdx) => (
                  <motion.div
                    key={report.name}
                    variants={cardHover}
                    className="px-6 py-3 flex items-center justify-between gap-4 hover:bg-white/[0.03] transition-colors cursor-pointer group"
                    onClick={() => handlePrint(category.id, report.name)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium group-hover:text-[#0066FF] transition-colors truncate">
                        {report.name}
                      </p>
                      <p className="text-gray-500 text-xs truncate">{report.desc}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {exportButtons.map((btn) => (
                        <motion.button
                          key={btn.format}
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExport(btn.format, category.id, report.name);
                          }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                          title={`Export as ${btn.label}`}
                        >
                          <i
                            className={`fa-solid ${btn.icon} text-xs`}
                            style={{ color: btn.color }}
                          />
                        </motion.button>
                      ))}
                      <motion.button
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePrint(category.id, report.name);
                        }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors ml-1"
                        title="Print"
                      >
                        <i className="fa-solid fa-print text-xs text-gray-300" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Export Panel */}
        <motion.div
          variants={fadeInUp}
          custom={filteredCategories.length + 2}
          className="glass-card-premium rounded-2xl p-6"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0066FF]/20 flex items-center justify-center">
                <i className="fa-solid fa-file-export text-[#0066FF]" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Export Panel</h3>
                <p className="text-gray-400 text-xs">Bulk export and print options</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <i className="fa-solid fa-calendar text-xs" />
                <span>
                  {selectedFilter}
                  {customStartDate && customEndDate
                    ? ` (${customStartDate} — ${customEndDate})`
                    : ''}
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExportAll}
                className="px-5 py-2.5 bg-[#00D68F]/20 text-[#00D68F] rounded-xl text-sm font-semibold hover:bg-[#00D68F]/30 transition-colors flex items-center gap-2"
              >
                <i className="fa-solid fa-file-export" />
                Export All Reports
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePrintAll}
                className="px-5 py-2.5 bg-white/10 text-white rounded-xl text-sm font-semibold hover:bg-white/15 transition-colors flex items-center gap-2"
              >
                <i className="fa-solid fa-print" />
                Print Report
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Print Layout Indicator */}
        <motion.div
          variants={fadeInUp}
          custom={filteredCategories.length + 3}
          className="glass-card-premium rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-[#A78BFA]/20 flex items-center justify-center">
              <i className="fa-solid fa-eye text-[#A78BFA]" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Print Layout Preview</h3>
              <p className="text-gray-400 text-xs">Preview of the printed report format</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 max-w-lg mx-auto shadow-2xl">
            {/* Simulated Print Preview */}
            <div className="flex items-center justify-between border-b-2 border-gray-200 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#0066FF] rounded-lg flex items-center justify-center">
                  <i className="fa-solid fa-industry text-white text-sm" />
                </div>
                <div>
                  <p className="text-gray-900 font-bold text-sm">Smart Factory</p>
                  <p className="text-gray-500 text-[10px]">Industrial Monitoring System</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-gray-900 font-semibold text-xs">Date</p>
                <p className="text-gray-500 text-[10px]">
                  {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-gray-900 font-bold text-sm border-l-4 border-[#0066FF] pl-2">
                Report Title
              </p>
              <p className="text-gray-500 text-[10px] mt-1">
                Filtered by: {selectedFilter}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-gray-700 text-[11px] font-semibold mb-2">Summary</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Metric A', value: '1,234' },
                  { label: 'Metric B', value: '567' },
                  { label: 'Metric C', value: '89%' },
                ].map((m) => (
                  <div key={m.label} className="text-center">
                    <p className="text-gray-900 font-bold text-sm">{m.value}</p>
                    <p className="text-gray-500 text-[9px]">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-1.5 mb-4">
              {[1, 2, 3, 4, 5].map((r) => (
                <div key={r} className="flex gap-2">
                  <div
                    className="h-2 bg-gray-200 rounded-full"
                    style={{ width: `${60 + Math.random() * 30}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
              <p className="text-gray-400 text-[9px]">
                Confidential — Smart Factory Monitoring System
              </p>
              <p className="text-gray-400 text-[9px]">Page 1 of 1</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Print Preview Modal */}
      {showPrintPreview && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowPrintPreview(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass-card-premium rounded-2xl p-6 w-full max-w-2xl max-h-[85vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-print text-[#0066FF] text-lg" />
                <h3 className="text-white font-semibold text-lg">Print Preview</h3>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowPrintPreview(false)}
                className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <i className="fa-solid fa-xmark" />
              </motion.button>
            </div>
            <div id="printable-report-area" className="bg-white rounded-xl p-8 mb-5 text-gray-800">
              <style>{`
                @media print {
                  body * {
                    visibility: hidden !important;
                  }
                  #printable-report-area, #printable-report-area * {
                    visibility: visible !important;
                  }
                  #printable-report-area {
                    position: absolute !important;
                    left: 0 !important;
                    top: 0 !important;
                    width: 100% !important;
                    background: white !important;
                    color: black !important;
                  }
                }
              `}</style>
              <div className="flex items-center justify-between border-b-2 border-gray-200 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#0066FF] rounded-lg flex items-center justify-center">
                    <i className="fa-solid fa-industry text-white" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-bold">Smart Factory</p>
                    <p className="text-gray-500 text-xs">Industrial Monitoring System</p>
                  </div>
                </div>
                <div className="text-right text-gray-500">
                  <p className="text-gray-900 font-semibold text-sm">
                    {printData.date || new Date().toLocaleString()}
                  </p>
                  <p className="text-[10px] uppercase font-bold tracking-wider">
                    {printData.category || "OPERATIONS"}
                  </p>
                </div>
              </div>
              <p className="text-gray-900 font-bold text-base mb-2 border-l-4 border-[#0066FF] pl-3">
                {printData.title || "Report Center Ledger"}
              </p>
              <p className="text-gray-500 text-xs mb-4">
                This report is compiled automatically from the secure factory SQLite database operations logs.
              </p>

              {printData.headers && printData.headers.length > 0 ? (
                <div className="overflow-x-auto my-4">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-100 border-b border-gray-300">
                        {printData.headers.map((h, i) => (
                          <th key={i} className="p-2 font-bold text-gray-700 border border-gray-300 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {printData.rows.slice(0, 15).map((row, rIdx) => (
                        <tr key={rIdx} className="border-b border-gray-200 odd:bg-gray-50/50">
                          {row.map((val, cIdx) => (
                            <td key={cIdx} className="p-2 border border-gray-200 text-gray-600 whitespace-nowrap">{val}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {printData.rows.length > 15 && (
                    <p className="text-[10px] text-gray-400 mt-2 text-center">
                      ... showing first 15 records of {printData.rows.length} total rows ...
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                  {reportCategories.map((cat) => (
                    <div key={cat.id} className="text-center">
                      <i
                        className={`fa-solid ${cat.icon} text-lg mb-1`}
                        style={{ color: cat.color }}
                      />
                      <p className="text-gray-900 font-bold text-lg">
                        {cat.reports.length}
                      </p>
                      <p className="text-gray-500 text-[10px]">{cat.title}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 border-t border-gray-200 pt-3 flex justify-between items-center text-[9px] text-gray-400">
                <p>
                  Confidential — Smart Factory Monitoring System (BI Portal)
                </p>
                <p>Page 1 of 1</p>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-end">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowPrintPreview(false)}
                className="px-5 py-2.5 bg-white/10 text-white rounded-xl text-sm font-semibold hover:bg-white/15 transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  window.print();
                  setShowPrintPreview(false);
                }}
                className="px-5 py-2.5 bg-[#0066FF] text-white rounded-xl text-sm font-semibold hover:bg-[#0055dd] transition-colors flex items-center gap-2 shadow-lg shadow-[#0066FF]/20"
              >
                <i className="fa-solid fa-print" />
                Print Now
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}