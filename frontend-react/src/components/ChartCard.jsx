import { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

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

function getThemeColors() {
  const s = getComputedStyle(document.documentElement);
  const v = (n, f) => s.getPropertyValue(n).trim() || f;
  return {
    grid: v('--grid', 'rgba(255,255,255,0.03)'),
    tick: v('--tick', '#556677') || v('--muted2', '#556677'),
    tooltipBg: v('--tooltip-bg', 'rgba(7, 26, 47, 0.95)'),
    tooltipBorder: v('--tooltip-border', 'rgba(0, 102, 255, 0.2)'),
    tooltipTitle: v('--tooltip-title', '#F0F4F8'),
    tooltipBody: v('--tooltip-body', '#8899AA'),
  };
}

export default function ChartCard({ title, subtitle, type = 'bar', data, options, height = 280, delay = 0, action }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!canvasRef.current || !data || !isInView) return;
    if (chartRef.current) chartRef.current.destroy();

    const isPie = type === 'pie' || type === 'doughnut' || type === 'radar';
    const isLine = type === 'line' || type === 'area';
    const PREMIUM_COLORS = getThemeColors();

    const defaultOpts = {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1200,
        easing: 'easeOutQuart',
      },
      plugins: {
        legend: {
          display: isPie,
          position: 'bottom',
          labels: {
            color: PREMIUM_COLORS.tick,
            padding: 16,
            usePointStyle: true,
            pointStyleWidth: 8,
            font: { family: 'Inter', size: 11, weight: '500' },
          },
        },
        tooltip: {
          backgroundColor: PREMIUM_COLORS.tooltipBg,
          titleColor: PREMIUM_COLORS.tooltipTitle,
          bodyColor: PREMIUM_COLORS.tooltipBody,
          borderColor: PREMIUM_COLORS.tooltipBorder,
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
          grid: { color: PREMIUM_COLORS.grid, drawBorder: false },
          ticks: { color: PREMIUM_COLORS.tick, font: { family: 'Inter', size: 10 }, padding: 8 },
          border: { display: false },
        },
        x: {
          grid: { display: false },
          ticks: { color: PREMIUM_COLORS.tick, font: { family: 'Inter', size: 10 }, padding: 8 },
          border: { display: false },
        },
      },
    };

    const merged = options ? deepMerge(defaultOpts, options) : defaultOpts;

    const ctx = canvasRef.current.getContext('2d');
    let gradient = null;
    if (isLine && data.datasets?.[0]) {
      gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, 'rgba(0, 102, 255, 0.15)');
      gradient.addColorStop(1, 'rgba(0, 102, 255, 0)');
      if (!data.datasets[0].backgroundColor || data.datasets[0].backgroundColor === 'rgba(30,144,255,0.08)') {
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
