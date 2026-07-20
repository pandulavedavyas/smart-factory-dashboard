import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

function useAnimatedCounter(end, duration = 1200, startOnView = true) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const hasStarted = useRef(false);

  useEffect(() => {
    if (startOnView && !isInView) return;
    if (hasStarted.current) return;
    hasStarted.current = true;

    const numericEnd = typeof end === 'string' ? parseFloat(end.replace(/[^0-9.-]/g, '')) : end;
    if (isNaN(numericEnd)) { setCount(end); return; }

    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(numericEnd * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, end, duration, startOnView]);

  return { count, ref };
}

export default function KPICard({ icon, label, value, color = '#0066FF', sub, trend, trendUp, delay = 0, progress, tooltip, onClick, pctChange }) {
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;
  const suffix = typeof value === 'string' ? value.replace(/[0-9.-]/g, '') : '';
  const isNumeric = !isNaN(numericValue);

  const { count, ref } = useAnimatedCounter(isNumeric ? numericValue : 0);
  const clickable = !!onClick;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: delay * 0.08, ease: [0.4, 0, 0.2, 1] }}
      title={tooltip}
      onClick={onClick}
      whileHover={clickable ? { y: -3 } : undefined}
      className={`glass-card glass-hover group relative overflow-hidden ${clickable ? 'kpi-clickable' : ''}`}
      style={{ padding: '20px' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="kpi-icon relative" style={{ background: `${color}12` }}>
          <i className={`fas ${icon}`} style={{ color }} />
          <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: `0 0 20px ${color}15` }} />
        </div>
        {trend !== undefined && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold" style={{
            background: trendUp ? 'rgba(0, 214, 143, 0.1)' : 'rgba(255, 71, 87, 0.1)',
            color: trendUp ? '#00D68F' : '#FF4757',
          }}>
            <i className={`fas fa-arrow-${trendUp ? 'up' : 'down'} text-[8px]`} />
            {trend}
          </div>
        )}
      </div>

      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--muted2)' }}>
          {label}
        </div>
        <div className="text-2xl font-extrabold tracking-tight leading-none" style={{ color: 'var(--text)' }}>
          {isNumeric ? <>{count.toLocaleString()}{suffix}</> : value}
        </div>
      </div>

      {sub && (
        <div className="mt-3 flex items-center gap-1.5">
          <div className="w-1 h-1 rounded-full" style={{ background: color }} />
          <span className="text-[10px] font-medium" style={{ color: 'var(--muted)' }}>{sub}</span>
          {pctChange !== undefined && (
            <span className="text-[10px] font-bold ml-auto" style={{ color: pctChange >= 0 ? '#00D68F' : '#FF4757' }}>
              {pctChange >= 0 ? '↑' : '↓'} {Math.abs(pctChange)}%
            </span>
          )}
        </div>
      )}

      {progress !== undefined && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-medium" style={{ color: 'var(--muted2)' }}>Target Progress</span>
            <span className="text-[9px] font-bold" style={{ color }}>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface)' }}>
            <div className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${Math.min(progress, 100)}%`, background: `linear-gradient(90deg, ${color}, ${color}99)`, boxShadow: `0 0 8px ${color}40` }} />
          </div>
        </div>
      )}

      {clickable && (
        <div className="kpi-open-hint absolute top-3 right-3 opacity-0 transition-opacity duration-300">
          <i className="fas fa-arrow-up-right-dots text-[10px]" style={{ color }} />
        </div>
      )}

      {/* Bottom glow bar on hover */}
      <div className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
    </motion.div>
  );
}
