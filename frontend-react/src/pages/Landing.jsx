import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Landing() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles = [];
    const particleCount = Math.min(60, Math.floor((width * height) / 25000));
    const connectionDistance = 120;

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.6;
        this.vy = (Math.random() - 0.5) * 0.6;
        this.radius = Math.random() * 2.5 + 1;
        this.glowColor = Math.random() > 0.5 ? '#0066FF' : '#00E5FF';
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.glowColor;
        ctx.shadowColor = this.glowColor;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        p1.update();
        p1.draw();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);

          if (dist < connectionDistance) {
            const alpha = (1 - dist / connectionDistance) * 0.15;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(0, 229, 255, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col justify-between" style={{ background: '#040d1a' }}>
      {/* Interactive AI Network Background */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-60" />

      {/* Cybernetic Grid & Glowing Background Effects */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{
        backgroundImage: 'linear-gradient(rgba(0,102,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(0,102,255,0.015) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
      }} />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-[0.06] blur-[120px] pointer-events-none" style={{ background: 'radial-gradient(circle, #0066FF 0%, transparent 80%)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full opacity-[0.05] blur-[140px] pointer-events-none" style={{ background: 'radial-gradient(circle, #00E5FF 0%, transparent 80%)' }} />

      {/* Landing Top Nav */}
      <nav className="relative z-10 w-full flex items-center justify-between px-6 lg:px-12 py-5" style={{ borderBottom: '1px solid rgba(0, 102, 255, 0.05)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white relative" style={{ background: 'linear-gradient(135deg, #0066FF, #0052CC)' }}>
            <i className="fas fa-microchip text-sm" />
            <div className="absolute inset-0 rounded-xl" style={{ boxShadow: '0 0 15px rgba(0,102,255,0.4)' }} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-widest text-white uppercase">AI Smart Factory</span>
            <span className="text-[9px] tracking-widest text-[#00E5FF] font-extrabold uppercase">Technology</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-wider" style={{ color: '#8899AA' }}>
          <span className="hover:text-white transition-colors cursor-pointer hidden sm:inline-block">Industry 4.0</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#00D68F] shadow-[0_0_8px_#00D68F] hidden sm:inline-block" />
          <span className="hover:text-white transition-colors cursor-pointer hidden sm:inline-block">AI Systems</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#00D68F] shadow-[0_0_8px_#00D68F] hidden sm:inline-block" />
          <span className="text-white bg-[#0066FF]/14 border border-[#0066FF]/30 px-3 py-1.5 rounded-lg text-[10px]">Active Node</span>
        </div>
      </nav>

      {/* Hero Body */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 py-12 flex-1 grid lg:grid-cols-12 gap-12 items-center">
        {/* Left Intro Text Column */}
        <div className="lg:col-span-6 space-y-8 text-center lg:text-left">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest"
            style={{ background: 'rgba(0, 102, 255, 0.1)', border: '1px solid rgba(0, 102, 255, 0.25)', color: '#00E5FF' }}
          >
            <i className="fas fa-circle-nodes text-[8px] animate-pulse" /> Smart Manufacturing Platform
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-4"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight">
              AI Smart Factory<br />
              <span className="relative inline-block" style={{ background: 'linear-gradient(135deg, #00E5FF, #0066FF, #A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Technology
              </span>
            </h1>
            <p className="text-sm sm:text-base leading-relaxed max-w-lg mx-auto lg:mx-0" style={{ color: '#8899AA' }}>
              Smart Manufacturing Platform powered by Industry 4.0, Artificial Intelligence, and Industrial IoT.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="pt-4"
          >
            <Link 
              to="/login"
              className="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-2xl text-base font-extrabold text-white transition-all duration-300 relative overflow-hidden group shadow-[0_12px_40px_rgba(0,102,255,0.25)] hover:shadow-[0_12px_45px_rgba(0,102,255,0.45)] hover:-translate-y-1"
              style={{ background: 'linear-gradient(135deg, #0066FF, #0052CC)' }}
            >
              {/* Button inner glow and highlight */}
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" style={{ transform: 'skewX(-20deg)' }} />
              <i className="fas fa-network-wired text-sm text-[#00E5FF]" />
              <span>Start Dashboard</span>
              <i className="fas fa-angle-right text-xs transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>

          {/* Micro stats banner */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-3 gap-4 pt-8 border-t border-white/[0.04] max-w-md mx-auto lg:mx-0"
          >
            {[
              { val: 'OEE 98.4%', label: 'Efficiency' },
              { val: '24/7/365', label: 'IoT Stream' },
              { val: '<10ms', label: 'AI Latency' }
            ].map((s, i) => (
              <div key={i} className="text-center lg:text-left">
                <div className="text-xs font-bold text-white">{s.val}</div>
                <div className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: '#556677' }}>{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right Animated Factory & Robotic Arm Column */}
        <div className="lg:col-span-6 flex justify-center items-center relative min-h-[350px]">
          {/* Neon Glow Rings behind factory */}
          <div className="absolute w-[280px] h-[280px] rounded-full border border-[#0066FF]/10 animate-[spin_20s_linear_infinite]" />
          <div className="absolute w-[360px] h-[360px] rounded-full border border-dashed border-[#00E5FF]/10 animate-[spin_40s_linear_infinite]" />

          {/* Floating tech particles (CSS-animated) */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute w-2 h-2 rounded-full bg-[#00E5FF] animate-ping" style={{ top: '15%', left: '30%', animationDuration: '3s' }} />
            <div className="absolute w-1.5 h-1.5 rounded-full bg-[#0066FF] animate-ping" style={{ bottom: '20%', right: '25%', animationDuration: '4s' }} />
            <div className="absolute w-1 h-1 rounded-full bg-[#A78BFA] animate-pulse" style={{ top: '65%', left: '15%', animationDuration: '2s' }} />
          </div>

          {/* SVG Complex Factory Illustration with Robotic Arm */}
          <motion.svg
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: 'spring', damping: 15 }}
            width="420"
            height="360"
            viewBox="0 0 420 360"
            fill="none"
            className="w-full max-w-[420px] relative z-10"
          >
            {/* Factory Grid Base */}
            <path d="M40 280 L380 280" stroke="rgba(0, 102, 255, 0.2)" strokeWidth="4" strokeLinecap="round" />
            <path d="M60 280 L80 320 M360 280 L340 320" stroke="rgba(0, 102, 255, 0.15)" strokeWidth="2" />
            <ellipse cx="210" cy="285" rx="140" ry="12" fill="rgba(0, 102, 255, 0.05)" />

            {/* Conveyer System */}
            <rect x="90" y="220" width="240" height="24" rx="12" fill="rgba(12, 25, 44, 0.85)" stroke="rgba(0, 229, 255, 0.25)" strokeWidth="2" />
            <circle cx="110" cy="232" r="6" fill="#00E5FF" className="animate-[pulse_1s_infinite]" />
            <circle cx="160" cy="232" r="6" fill="#0066FF" />
            <circle cx="210" cy="232" r="6" fill="#A78BFA" />
            <circle cx="260" cy="232" r="6" fill="#00E5FF" />
            <circle cx="310" cy="232" r="6" fill="#0066FF" />
            
            {/* Conveyer items sliding */}
            <g className="animate-[conveyor_4s_linear_infinite]">
              <rect x="0" y="200" width="20" height="20" rx="4" fill="url(#itemGrad)" />
              <rect x="80" y="200" width="20" height="20" rx="4" fill="url(#itemGrad)" />
              <rect x="160" y="200" width="20" height="20" rx="4" fill="url(#itemGrad)" />
            </g>

            {/* Background Factory Silhouette */}
            <rect x="70" y="100" width="40" height="120" rx="4" fill="rgba(0, 102, 255, 0.03)" stroke="rgba(0, 102, 255, 0.08)" strokeWidth="1" />
            <polygon points="70,100 90,70 110,100" fill="rgba(0, 102, 255, 0.04)" />
            <rect x="120" y="140" width="50" height="80" rx="4" fill="rgba(0, 102, 255, 0.02)" stroke="rgba(0, 102, 255, 0.08)" strokeWidth="1" />
            <circle cx="145" cy="170" r="10" stroke="rgba(0, 102, 255, 0.15)" strokeWidth="1.5" className="origin-center animate-[spin_8s_linear_infinite]" />

            {/* Futuristic Reactor Core */}
            <rect x="290" y="110" width="50" height="110" rx="8" fill="rgba(12, 25, 44, 0.9)" stroke="rgba(0, 229, 255, 0.2)" strokeWidth="2" />
            <line x1="315" y1="125" x2="315" y2="205" stroke="rgba(0, 229, 255, 0.4)" strokeWidth="4" strokeLinecap="round" className="animate-[pulse_1.5s_infinite]" />
            <circle cx="315" cy="165" r="14" fill="rgba(0, 229, 255, 0.1)" stroke="#00E5FF" strokeWidth="2" className="animate-ping" style={{ animationDuration: '3s' }} />

            {/* Industrial Robotic Arm */}
            <g className="origin-[210px_280px]">
              {/* Base */}
              <rect x="190" y="250" width="40" height="30" rx="4" fill="#0c192c" stroke="rgba(0, 102, 255, 0.4)" strokeWidth="2.5" />
              <circle cx="210" cy="265" r="5" fill="#00E5FF" />

              {/* Lower joint (rotates) */}
              <g className="origin-[210px_260px] animate-[roboticShoulder_6s_ease-in-out_infinite]">
                <line x1="210" y1="260" x2="160" y2="160" stroke="#0066FF" strokeWidth="8" strokeLinecap="round" />
                <circle cx="160" cy="160" r="8" fill="#0c192c" stroke="#00E5FF" strokeWidth="2" />

                {/* Upper arm & elbow joint */}
                <g className="origin-[160px_160px] animate-[roboticElbow_6s_ease-in-out_infinite]">
                  <line x1="160" y1="160" x2="220" y2="100" stroke="#00D68F" strokeWidth="6" strokeLinecap="round" />
                  <circle cx="220" cy="100" r="6" fill="#0c192c" stroke="#00D68F" strokeWidth="2" />

                  {/* Gripper/Effector and Laser Beam */}
                  <g className="origin-[220px_100px] animate-[roboticTool_6s_ease-in-out_infinite]">
                    <line x1="220" y1="100" x2="245" y2="125" stroke="#F0F4F8" strokeWidth="4" />
                    
                    {/* Gripper jaws */}
                    <path d="M241 121 L241 133 M249 129 L249 141" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round" />

                    {/* Glowing laser effector pointing down to conveyor */}
                    <line x1="245" y1="125" x2="210" y2="210" stroke="#00E5FF" strokeWidth="2" strokeDasharray="3,3" className="animate-[pulse_0.4s_infinite]" />
                    <circle cx="210" cy="210" r="4" fill="#00E5FF" className="animate-ping" />
                  </g>
                </g>
              </g>
            </g>

            {/* Gradient Definitions */}
            <defs>
              <linearGradient id="itemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00E5FF" />
                <stop offset="100%" stopColor="#0066FF" />
              </linearGradient>
            </defs>
          </motion.svg>
        </div>
      </main>

      {/* Landing Footer */}
      <footer className="relative z-10 w-full py-6 text-center" style={{ borderTop: '1px solid rgba(0, 102, 255, 0.05)', color: '#556677' }}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] uppercase tracking-wider font-semibold">&copy; 2026 AI Smart Factory Technology. All rights reserved.</p>
          <div className="flex gap-6 text-[10px] uppercase tracking-wider font-semibold">
            <span className="hover:text-[#00E5FF] transition-colors cursor-pointer">Security Ledger</span>
            <span className="hover:text-[#00E5FF] transition-colors cursor-pointer">API Node Docs</span>
          </div>
        </div>
      </footer>

      {/* CSS Keyframe Animations for SVG Robotic Arm & Conveyor */}
      <style>{`
        @keyframes conveyor {
          0% { transform: translateX(90px); }
          100% { transform: translateX(290px); }
        }
        @keyframes roboticShoulder {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(15deg); }
        }
        @keyframes roboticElbow {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-30deg); }
        }
        @keyframes roboticTool {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(15deg); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-20deg); }
          100% { transform: translateX(100%) skewX(-20deg); }
        }
      `}</style>
    </div>
  );
}
