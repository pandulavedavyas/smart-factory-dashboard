import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  LineChart as LineChartIcon,
  ScatterChart,
  DollarSign,
  Users,
  Zap,
  Box,
  Activity,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Cpu,
  Database,
  Clock,
  Shield,
  Lightbulb,
  ChevronRight,
  Loader2,
  Sparkles,
} from 'lucide-react';
import Chart from 'chart.js/auto';
import { api } from '../api/api';

const typeConfig = {
  revenue: { color: '#0066FF', bg: 'rgba(0,102,255,0.12)', icon: TrendingUp, label: 'Revenue' },
  cost: { color: '#FF4757', bg: 'rgba(255,71,87,0.12)', icon: DollarSign, label: 'Cost' },
  material: { color: '#FFB340', bg: 'rgba(255,179,64,0.12)', icon: Box, label: 'Material' },
  energy: { color: '#00E5FF', bg: 'rgba(0,229,255,0.12)', icon: Zap, label: 'Energy' },
  worker: { color: '#A78BFA', bg: 'rgba(167,139,250,0.12)', icon: Users, label: 'Worker' },
  forecast: { color: '#00D68F', bg: 'rgba(0,214,143,0.12)', icon: Activity, label: 'Forecast' },
  profit: { color: '#00D68F', bg: 'rgba(0,214,143,0.12)', icon: Target, label: 'Profit' },
  stock: { color: '#FF4757', bg: 'rgba(255,71,87,0.12)', icon: Box, label: 'Stock' },
};

const priorityConfig = {
  high: { color: '#FF4757', bg: 'rgba(255,71,87,0.15)', label: 'High' },
  medium: { color: '#FFB340', bg: 'rgba(255,179,64,0.15)', label: 'Medium' },
  low: { color: '#0066FF', bg: 'rgba(0,102,255,0.15)', label: 'Low' },
};

const impactConfig = {
  positive: { color: '#00D68F', icon: ArrowUpRight, label: 'Positive' },
  negative: { color: '#FF4757', icon: ArrowDownRight, label: 'Negative' },
  warning: { color: '#FFB340', icon: AlertTriangle, label: 'Warning' },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (i = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.08, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

function PremiumChart({ type, data, options, height = 320 }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !data) return;
    if (chartRef.current) chartRef.current.destroy();

    const ctx = canvasRef.current.getContext('2d');
    chartRef.current = new Chart(ctx, {
      type,
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#CBD5E1', font: { family: 'Inter, sans-serif', size: 12 }, padding: 16, usePointStyle: true, pointStyleWidth: 10 },
          },
          tooltip: {
            backgroundColor: 'rgba(7,26,47,0.95)',
            titleColor: '#F1F5F9',
            bodyColor: '#CBD5E1',
            borderColor: 'rgba(99,102,241,0.3)',
            borderWidth: 1,
            cornerRadius: 8,
            padding: 12,
            titleFont: { weight: 'bold' },
          },
        },
        scales: type !== 'scatter'
          ? {
              x: {
                grid: { color: 'rgba(148,163,184,0.08)', drawBorder: false },
                ticks: { color: '#94A3B8', font: { size: 11 } },
              },
              y: {
                grid: { color: 'rgba(148,163,184,0.08)', drawBorder: false },
                ticks: { color: '#94A3B8', font: { size: 11 } },
              },
            }
          : undefined,
        ...options,
      },
    });

    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [type, data, options]);

  return (
    <div style={{ height }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

function ConfidenceMeter({ value }) {
  const pct = Math.round((value || 0) * 100);
  let barColor = '#00D68F';
  if (pct < 60) barColor = '#FF4757';
  else if (pct < 80) barColor = '#FFB340';

  return (
    <div className="mt-3">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Confidence</span>
        <span className="text-[11px] font-bold" style={{ color: barColor }}>{pct}%</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-slate-700/50 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: barColor }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
        />
      </div>
    </div>
  );
}

function InsightCard({ insight, index }) {
  const type = typeConfig[insight.type] || typeConfig.forecast;
  const priority = priorityConfig[insight.priority] || priorityConfig.medium;
  const impact = impactConfig[insight.impact] || impactConfig.positive;
  const TypeIcon = type.icon;
  const ImpactIcon = impact.icon;

  return (
    <motion.div
      variants={scaleIn}
      custom={index}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="glass-card-premium rounded-2xl p-5 border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: type.bg }}
          >
            <TypeIcon size={20} style={{ color: type.color }} />
          </div>
          <div>
            <span
              className="text-[10px] uppercase tracking-widest font-bold"
              style={{ color: type.color }}
            >
              {type.label}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
            style={{ backgroundColor: priority.bg, color: priority.color }}
          >
            {priority.label}
          </span>
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{
              backgroundColor: `${impact.color}15`,
            }}
          >
            <ImpactIcon size={14} style={{ color: impact.color }} />
          </div>
        </div>
      </div>

      <h3 className="text-white font-bold text-[15px] mb-2 leading-snug">{insight.title}</h3>
      <p className="text-slate-400 text-[13px] leading-relaxed mb-3">{insight.description}</p>

      {insight.action && (
        <div className="bg-slate-800/40 rounded-lg px-3 py-2 mb-1 border border-white/[0.04]">
          <p className="text-slate-300 text-[12px] italic leading-relaxed">
            <Lightbulb size={12} className="inline mr-1.5 text-yellow-400" style={{ marginTop: -2 }} />
            {insight.action}
          </p>
        </div>
      )}

      <ConfidenceMeter value={insight.confidence} />
    </motion.div>
  );
}

function RecommendationCard({ rec, index }) {
  return (
    <motion.div
      variants={fadeInUp}
      custom={index}
      initial="hidden"
      animate="visible"
      className="glass-card-premium rounded-xl p-4 border border-white/[0.06] hover:border-emerald-500/20 transition-all duration-300"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0 mt-0.5">
          <CheckCircle size={16} className="text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <h4 className="text-white font-semibold text-[13px] leading-snug">{rec.title}</h4>
            {rec.severity && (
              <span
                className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shrink-0"
                style={{
                  backgroundColor: rec.severity === 'critical' ? 'rgba(255,71,87,0.15)' : rec.severity === 'important' ? 'rgba(255,179,64,0.15)' : 'rgba(0,102,255,0.15)',
                  color: rec.severity === 'critical' ? '#FF4757' : rec.severity === 'important' ? '#FFB340' : '#0066FF',
                }}
              >
                {rec.severity}
              </span>
            )}
          </div>
          <p className="text-slate-400 text-[12px] leading-relaxed mb-2">{rec.description}</p>
          {rec.impact && (
            <div className="flex items-center gap-1.5">
              <TrendingUp size={12} className="text-emerald-400" />
              <span className="text-emerald-400 text-[11px] font-semibold">{rec.impact}</span>
            </div>
          )}
        </div>
        <ChevronRight size={16} className="text-slate-600 group-hover:text-slate-400 transition-colors shrink-0 mt-1" />
      </div>
    </motion.div>
  );
}

const defaultInsights = [
  { id: 1, type: 'revenue', priority: 'high', impact: 'positive', title: 'Revenue Surge Detected', description: 'Q3 revenue trending 12.3% above forecast due to increased demand in Product Line A and B.', action: 'Consider scaling production capacity by 15% to capitalize on demand surge.', confidence: 0.92 },
  { id: 2, type: 'cost', priority: 'high', impact: 'negative', title: 'Raw Material Cost Escalation', description: 'Steel and polymer costs have risen 8.7% over the past 30 days, impacting margins across all product lines.', action: 'Negotiate bulk contracts with secondary suppliers or consider material substitution.', confidence: 0.87 },
  { id: 3, type: 'energy', priority: 'medium', impact: 'warning', title: 'Energy Consumption Anomaly', description: 'Night shift energy usage is 23% above baseline, primarily from Line 3 HVAC and compressors.', action: 'Schedule maintenance review on Line 3 compressors and optimize HVAC scheduling.', confidence: 0.78 },
  { id: 4, type: 'material', priority: 'medium', impact: 'positive', title: 'Inventory Optimization Opportunity', description: 'Current safety stock levels for Component X can be reduced by 30% without affecting fulfillment rates.', action: 'Implement just-in-time delivery for Component X to free up $45K in working capital.', confidence: 0.85 },
  { id: 5, type: 'worker', priority: 'low', impact: 'positive', title: 'Shift Efficiency Improvement', description: 'Morning shift shows 14% higher throughput per operator compared to evening shift on identical work orders.', action: 'Cross-train evening shift operators using morning shift best practices module.', confidence: 0.71 },
  { id: 6, type: 'forecast', priority: 'high', impact: 'warning', title: 'Demand Forecast Divergence', description: 'ML model detects divergence between retailer POS data and current production schedule for SKU-4421.', action: 'Re-align production schedule for SKU-4421 to prevent overstock of $120K.', confidence: 0.83 },
  { id: 7, type: 'profit', priority: 'medium', impact: 'positive', title: 'Margin Expansion on Product C', description: 'Product C margins have improved by 4.2pp due to process optimization in Stage-2 assembly.', action: 'Replicate Stage-2 optimization across Products A and D for estimated $210K annual savings.', confidence: 0.89 },
  { id: 8, type: 'stock', priority: 'high', impact: 'negative', title: 'Critical Stock Alert - Connector Y', description: 'Connector Y stock will reach zero in 5 days at current consumption rate. Lead time is 12 days.', action: 'Expedite emergency order for Connector Y and evaluate alternative connector specifications.', confidence: 0.95 },
];

const defaultSummary = 'The AI Business Intelligence engine has analyzed 2.4M data points across production, finance, supply chain, and workforce systems. Overall factory health score: 82/100. Key areas requiring attention: raw material cost management, energy optimization, and critical stock alerts. Estimated actionable savings this quarter: $340K–$520K.';

const defaultRecommendations = [
  { title: 'Negotiate bulk steel contracts immediately', description: 'Lock in Q4 pricing before further escalation. Estimated 6-8% savings vs spot market.', severity: 'critical', impact: '$85K–$120K savings' },
  { title: 'Implement predictive maintenance on Line 3', description: 'Compressor degradation detected. Preventive action avoids estimated $45K downtime loss.', severity: 'important', impact: '$45K loss prevention' },
  { title: 'Scale production capacity for Product Line A', description: 'Demand forecast shows sustained 12% growth. Capacity increase captures incremental revenue.', severity: 'important', impact: '$180K–$260K revenue' },
  { title: 'Reduce safety stock for Component X', description: 'JIT delivery feasible with current supplier reliability score of 98.2%.', severity: 'normal', impact: '$45K capital freed' },
  { title: 'Expedite Connector Y emergency order', description: 'Stockout imminent in 5 days. Express shipping adds $2.1K but prevents $38K line stoppage.', severity: 'critical', impact: '$38K loss prevention' },
  { title: 'Cross-train evening shift operators', description: 'Deploy morning shift best practices module. Expect 8-12% throughput improvement.', severity: 'normal', impact: '14% efficiency gain' },
];

function buildRevenueChart() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const historical = [285, 310, 295, 340, 325, 360, 380, 395, 410, null, null, null];
  const predicted = [null, null, null, null, null, null, null, null, 410, 435, 455, 480];
  return {
    labels: months,
    datasets: [
      {
        label: 'Historical Revenue ($K)',
        data: historical,
        borderColor: '#0066FF',
        backgroundColor: 'rgba(0,102,255,0.08)',
        fill: true,
        tension: 0.4,
        borderWidth: 2.5,
        pointRadius: 4,
        pointBackgroundColor: '#0066FF',
        pointBorderColor: '#071A2F',
        pointBorderWidth: 2,
        pointHoverRadius: 7,
      },
      {
        label: 'Predicted Revenue ($K)',
        data: predicted,
        borderColor: '#00D68F',
        backgroundColor: 'rgba(0,214,143,0.06)',
        fill: true,
        tension: 0.4,
        borderWidth: 2.5,
        borderDash: [8, 4],
        pointRadius: 4,
        pointBackgroundColor: '#00D68F',
        pointBorderColor: '#071A2F',
        pointBorderWidth: 2,
        pointHoverRadius: 7,
      },
    ],
  };
}

function buildCostChart() {
  return {
    labels: ['Raw Materials', 'Energy', 'Labor', 'Maintenance', 'Logistics', 'Overhead'],
    datasets: [
      {
        label: 'Current Cost ($K)',
        data: [320, 85, 210, 65, 45, 95],
        backgroundColor: 'rgba(255,71,87,0.6)',
        borderColor: '#FF4757',
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: 'Optimized Cost ($K)',
        data: [275, 62, 200, 55, 38, 82],
        backgroundColor: 'rgba(0,214,143,0.6)',
        borderColor: '#00D68F',
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };
}

function buildProfitChart() {
  return {
    labels: ['Product A', 'Product B', 'Product C', 'Product D', 'Product E', 'Product F'],
    datasets: [
      {
        label: 'Revenue ($K)',
        data: [180, 240, 150, 210, 130, 195],
        backgroundColor: 'rgba(0,102,255,0.7)',
        borderColor: '#0066FF',
        borderWidth: 1,
        borderRadius: 6,
      },
      {
        label: 'Cost ($K)',
        data: [120, 155, 90, 145, 95, 140],
        backgroundColor: 'rgba(255,71,87,0.5)',
        borderColor: '#FF4757',
        borderWidth: 1,
        borderRadius: 6,
      },
      {
        label: 'Profit ($K)',
        data: [60, 85, 60, 65, 35, 55],
        backgroundColor: 'rgba(0,214,143,0.6)',
        borderColor: '#00D68F',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };
}

export default function AIBusinessInsights() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/api/finance/insights');
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch insights');
      setData({
        insights: defaultInsights,
        summary: defaultSummary,
        recommendations: defaultRecommendations,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const insights = data?.insights || defaultInsights;
  const summary = data?.summary || defaultSummary;
  const recommendations = data?.recommendations || defaultRecommendations;

  const modelStats = data?.modelStats || {
    accuracy: 95.2,
    lastUpdated: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    predictionsMade: 14832,
    avgConfidence: 86.7,
  };

  const revenueData = data?.charts?.revenue || buildRevenueChart();
  const costData = data?.charts?.cost || buildCostChart();
  const profitData = data?.charts?.profit || buildProfitChart();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#071A2F' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center border border-purple-500/20">
              <Brain size={32} className="text-purple-400 animate-pulse" />
            </div>
            <motion.div
              className="absolute -inset-1 rounded-2xl border-2 border-purple-500/30"
              animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.2, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <div className="text-center">
            <p className="text-white font-semibold text-sm">Initializing AI Engine</p>
            <p className="text-slate-400 text-xs mt-1">Analyzing factory data streams...</p>
          </div>
          <Loader2 size={20} className="text-purple-400 animate-spin" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12" style={{ backgroundColor: '#071A2F' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="px-6 pt-8 pb-6"
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/25 to-blue-600/25 flex items-center justify-center border border-purple-500/20 shadow-lg shadow-purple-500/10">
                <Brain size={28} className="text-purple-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">AI Business Intelligence</h1>
                <p className="text-slate-400 text-sm mt-0.5">Real-time predictive analytics and actionable insights</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/25 text-purple-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={12} />
                AI Powered
              </span>
              <button
                onClick={fetchData}
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="px-6 max-w-[1400px] mx-auto space-y-6">
        {/* Error Banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card-premium rounded-xl p-4 border border-amber-500/20 bg-amber-500/5 flex items-center gap-3"
          >
            <AlertTriangle size={18} className="text-amber-400 shrink-0" />
            <div>
              <p className="text-amber-300 text-sm font-medium">Using demo data</p>
              <p className="text-slate-400 text-xs mt-0.5">{error}. Displaying simulated insights for demonstration.</p>
            </div>
          </motion.div>
        )}

        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="glass-card-premium rounded-2xl p-6 border border-white/[0.06] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-500/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="flex items-start gap-4 relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center shrink-0 border border-blue-500/10">
              <BarChart3 size={20} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-sm mb-2 uppercase tracking-wider">Executive Summary</h2>
              <p className="text-slate-300 text-[14px] leading-relaxed">{summary}</p>
            </div>
          </div>
        </motion.div>

        {/* Insights Grid */}
        <div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 mb-4"
          >
            <Activity size={18} className="text-purple-400" />
            <h2 className="text-white font-bold text-lg">AI-Generated Insights</h2>
            <span className="ml-auto px-2 py-0.5 rounded-full bg-white/5 text-slate-400 text-xs font-medium">
              {insights.length} insights
            </span>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {insights.map((insight, i) => (
              <InsightCard key={insight.id || i} insight={insight} index={i} />
            ))}
          </div>
        </div>

        {/* Charts Section */}
        <div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2 mb-4"
          >
            <LineChartIcon size={18} className="text-blue-400" />
            <h2 className="text-white font-bold text-lg">Analytics Dashboard</h2>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Revenue Forecast */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="glass-card-premium rounded-2xl p-5 border border-white/[0.06]"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white font-bold text-sm">Revenue Forecast</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Historical + Predicted (FY 2026)</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center">
                  <TrendingUp size={16} className="text-blue-400" />
                </div>
              </div>
              <PremiumChart type="line" data={revenueData} height={280} />
            </motion.div>

            {/* Cost Optimization */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42, duration: 0.5 }}
              className="glass-card-premium rounded-2xl p-5 border border-white/[0.06]"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white font-bold text-sm">Cost Optimization Breakdown</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Current vs Optimized Savings Potential</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                  <DollarSign size={16} className="text-emerald-400" />
                </div>
              </div>
              <PremiumChart
                type="bar"
                data={costData}
                height={280}
                options={{ indexAxis: 'y' }}
              />
            </motion.div>

            {/* Product Profitability */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.49, duration: 0.5 }}
              className="glass-card-premium rounded-2xl p-5 border border-white/[0.06] lg:col-span-2"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white font-bold text-sm">Product Profitability Matrix</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Revenue, Cost & Profit per Product Line</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
                    <span className="text-slate-400 text-[10px]">Revenue</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm bg-red-500" />
                    <span className="text-slate-400 text-[10px]">Cost</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                    <span className="text-slate-400 text-[10px]">Profit</span>
                  </div>
                </div>
              </div>
              <PremiumChart type="bar" data={profitData} height={300} />
            </motion.div>
          </div>
        </div>

        {/* AI Recommendations */}
        <div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-2 mb-4"
          >
            <Lightbulb size={18} className="text-yellow-400" />
            <h2 className="text-white font-bold text-lg">AI Recommendations</h2>
            <span className="ml-auto px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">
              {recommendations.length} actions
            </span>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recommendations.map((rec, i) => (
              <RecommendationCard key={i} rec={rec} index={i} />
            ))}
          </div>
        </div>

        {/* AI Model Status */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="glass-card-premium rounded-2xl p-6 border border-white/[0.06]"
        >
          <div className="flex items-center gap-2 mb-5">
            <Cpu size={18} className="text-purple-400" />
            <h2 className="text-white font-bold text-lg">AI Model Status</h2>
            <div className="ml-2 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-xs font-medium ml-1">Operational</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.05]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                  <Target size={16} className="text-emerald-400" />
                </div>
                <span className="text-slate-400 text-[11px] uppercase tracking-wider font-medium">Accuracy</span>
              </div>
              <p className="text-white text-2xl font-bold">{modelStats.accuracy}%</p>
              <div className="w-full h-1 rounded-full bg-slate-700/50 mt-2 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-emerald-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${modelStats.accuracy}%` }}
                  transition={{ duration: 1.5, ease: 'easeOut', delay: 0.8 }}
                />
              </div>
            </div>

            <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.05]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center">
                  <Database size={16} className="text-blue-400" />
                </div>
                <span className="text-slate-400 text-[11px] uppercase tracking-wider font-medium">Data Freshness</span>
              </div>
              <p className="text-white text-sm font-bold leading-snug">{modelStats.lastUpdated}</p>
              <p className="text-slate-500 text-[11px] mt-2">Last updated: today</p>
            </div>

            <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.05]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center">
                  <Brain size={16} className="text-purple-400" />
                </div>
                <span className="text-slate-400 text-[11px] uppercase tracking-wider font-medium">Predictions Made</span>
              </div>
              <p className="text-white text-2xl font-bold">{modelStats.predictionsMade.toLocaleString()}</p>
              <p className="text-slate-500 text-[11px] mt-2">+342 this session</p>
            </div>

            <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.05]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
                  <Shield size={16} className="text-amber-400" />
                </div>
                <span className="text-slate-400 text-[11px] uppercase tracking-wider font-medium">Avg Confidence</span>
              </div>
              <p className="text-white text-2xl font-bold">{modelStats.avgConfidence}%</p>
              <div className="w-full h-1 rounded-full bg-slate-700/50 mt-2 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-amber-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${modelStats.avgConfidence}%` }}
                  transition={{ duration: 1.5, ease: 'easeOut', delay: 1 }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
