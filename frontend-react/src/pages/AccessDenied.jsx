import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function AccessDenied() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background: '#071A2F' }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(255,71,87,0.08) 0%, transparent 60%)' }} />
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card-premium text-center max-w-md relative z-10" style={{ padding: '44px' }}
      >
        <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: 'rgba(255,71,87,0.12)' }}>
          <i className="fas fa-ban text-2xl" style={{ color: '#FF4757' }} />
        </div>
        <h1 className="text-2xl font-extrabold text-white mb-2">Access Denied</h1>
        <p className="text-sm mb-7" style={{ color: '#8899AA' }}>
          You do not have permission to access this page.
        </p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2 px-6 py-2.5">
          <i className="fas fa-house" /> Back to Home
        </Link>
      </motion.div>
    </div>
  );
}
