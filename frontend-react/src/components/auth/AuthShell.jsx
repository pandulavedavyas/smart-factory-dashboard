import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function BackdropFX({ accent = '#0066FF', variant = 'worker' }) {
  return (
    <>
      <div className="absolute inset-0 pointer-events-none" style={{
        background: variant === 'admin'
          ? 'radial-gradient(ellipse at 70% 20%, rgba(255,71,87,0.08) 0%, transparent 55%), radial-gradient(ellipse at 20% 80%, rgba(167,139,250,0.06) 0%, transparent 55%)'
          : 'radial-gradient(ellipse at 30% 50%, rgba(0,102,255,0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 20%, rgba(0,229,255,0.05) 0%, transparent 50%)',
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(0,102,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,102,255,0.025) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />
    </>
  );
}

export default function AuthShell({ children, accent = '#0066FF', gradient = ['#0066FF', '#0052CC'], label, title, subtitle, logoIcon = 'fa-industry', variant = 'worker' }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background: '#071A2F' }}>
      <BackdropFX accent={accent} variant={variant} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 18 }}
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-4"
            style={{ background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`, boxShadow: `0 8px 30px ${accent}40` }}
          >
            <i className={`fas ${logoIcon}`} />
          </motion.div>
          {label && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] mb-3"
              style={{ background: `${accent}14`, border: `1px solid ${accent}33`, color: accent }}
            >
              <i className="fas fa-shield-halved text-[8px]" /> {label}
            </motion.div>
          )}
          <h1 className="text-2xl font-extrabold text-white tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm mt-1.5" style={{ color: '#556677' }}>{subtitle}</p>}
        </div>

        <div className="glass-card-premium glass-hover" style={{ padding: '28px', borderTop: `3px solid ${accent}` }}>
          {children}
        </div>

        <p className="text-center text-xs mt-6" style={{ color: '#556677' }}>
          <Link to="/" className="hover:underline" style={{ color: accent }}><i className="fas fa-arrow-left mr-1" />Back to home</Link>
        </p>
      </motion.div>
    </div>
  );
}
