import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { subscribeCollection } from '../services/firestoreService';

const STEEL_KNOWLEDGE_BASE = [
  {
    keywords: ['blast furnace', 'smelt', 'pig iron'],
    response: `The Blast Furnace (Stage 2) melts iron ore pellets, sinter, and metallurgical coke at 1500°C to produce liquid pig iron. Hot air blast at 1200°C is injected through tuyeres at the bottom. Liquid iron is tapped periodically into torpedo cars for refining.`
  },
  {
    keywords: ['rolling mill', 'roll', 'rebar', 'coil'],
    response: `The Rolling Mill (Stage 8) processes reheated steel billets (~1180°C) through Roughing, Intermediate, and Finishing roll stands. It shapes white-hot steel into TMT rebar, structural I-beams, or coils at speeds up to 35 m/s.`
  },
  {
    keywords: ['temperature', 'increasing', 'heat', 'thermal', 'hot'],
    response: `Temperature increases usually stem from high combustion rates, refractory lining wear, friction in roll stands, or reduced cooling water flow. If a furnace exceeds threshold limits (e.g. 1500°C for Blast Furnace or 1650°C for BOF), automated safety interlocks will throttle burner fuel flow.`
  },
  {
    keywords: ['continuous casting', 'stop', 'halt', 'mold'],
    response: `If the Continuous Casting Machine (Stage 5) stops unexpectedly, liquid steel in the tundish must be diverted or teemed into emergency ingot molds to prevent nozzle freeze. Upstream Ladle Refining must hold temperature, and downstream Billet Cutting will pause.`
  },
  {
    keywords: ['process', 'workflow', 'manufacturing', 'stages'],
    response: `The steel manufacturing workflow consists of 12 integrated stages: 1. Raw Material Yard -> 2. Blast Furnace -> 3. BOF/EAF Melting -> 4. Ladle Refining -> 5. Continuous Casting -> 6. Billet Cutting -> 7. Reheating Furnace -> 8. Rolling Mill -> 9. Cooling Bed -> 10. Straightening -> 11. Surface Inspection -> 12. Packaging & Shipping.`
  },
  {
    keywords: ['production', 'summary', 'today', 'output'],
    response: `Today's plant production is operating at ~1,850 Tons per shift across active lines. Steel Billets 150x150 and Deformed Rebar 16mm represent 72% of total daily output with an overall plant OEE of 96.8%.`
  },
  {
    keywords: ['maintenance', 'require', 'repair', 'broken', 'offline'],
    response: `Currently, Surface Grinding Machine (MCH-010 in Stage 11) is undergoing high-priority corrective maintenance for spindle bearing vibration calibration. All other critical machines are running within green health parameters (>85%).`
  },
  {
    keywords: ['quality', 'control', 'inspection', 'defect'],
    response: `Quality Control uses Stage 11 non-destructive testing: AI Camera Vision inspects surface seams and cracks, while Ultrasonic Probes test internal billet density. Current quality yield is 99.4% pass rate.`
  },
  {
    keywords: ['efficiency', 'improve', 'optimize', 'oee', 'energy'],
    response: `Efficiency recommendations: 1. Implement waste-heat recovery on Reheating Furnace exhaust. 2. Schedule predictive bearing greasing on Roughing Mill rolls to prevent unscheduled downtime. 3. Optimize Oxygen Lance blow cycles in EAF to cut energy consumption by 4.2%.`
  }
];

export default function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'msg-0',
      sender: 'ai',
      text: 'Hello! I am your AI Steel Factory Assistant. Ask me anything about our 12 production stages, machine telemetry, or factory efficiency.',
      time: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const [machines, setMachines] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const unSub = subscribeCollection('machines', (data) => setMachines(data));
    return () => unSub();
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = (queryText) => {
    const text = (queryText || input).trim();
    if (!text) return;

    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInput('');

    // Formulate AI response using factory telemetry context
    setTimeout(() => {
      const lower = text.toLowerCase();
      let matched = STEEL_KNOWLEDGE_BASE.find(k => k.keywords.some(kw => lower.includes(kw)));
      
      let aiText = '';
      if (matched) {
        aiText = matched.response;
      } else {
        const runningCount = machines.filter(m => m.status === 'Running').length;
        aiText = `Based on real-time plant telemetry: We currently have ${machines.length || 35} connected equipment units across 12 stages, with ${runningCount} currently running. I am monitoring all thermal sensors, hydraulic pressure levels, and material flow continuously.`;
      }

      const aiMsg = {
        id: `msg-ai-${Date.now()}`,
        sender: 'ai',
        text: aiText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 400);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-[0_8px_30px_rgba(0,102,255,0.4)] transition-all duration-300 hover:scale-110 cursor-pointer"
        style={{ background: 'linear-gradient(135deg, #0066FF, #0052CC)' }}
        title="AI Steel Factory Assistant"
      >
        <i className={`fas ${isOpen ? 'fa-times' : 'fa-headset'} text-xl`} />
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#00E5FF] animate-ping" />
        )}
      </button>

      {/* Floating Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] h-[520px] rounded-2xl flex flex-col overflow-hidden shadow-[0_12px_50px_rgba(0,0,0,0.6)] border border-[#0066FF]/20"
            style={{
              background: 'linear-gradient(180deg, rgba(10, 22, 38, 0.98) 0%, rgba(5, 12, 22, 0.99) 100%)',
              backdropFilter: 'blur(20px)'
            }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between" style={{ background: 'rgba(0,102,255,0.1)' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, #0066FF, #00E5FF)' }}>
                  <i className="fas fa-brain text-xs" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white tracking-wide uppercase">AI Factory Copilot</h3>
                  <span className="text-[9px] text-[#00E5FF] font-semibold">Steel Intelligence Engine</span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-[#8899AA] hover:text-white">
                <i className="fas fa-minus text-xs" />
              </button>
            </div>

            {/* Quick Prompts Bar */}
            <div className="px-3 py-2 border-b border-white/[0.04] flex items-center gap-1.5 overflow-x-auto text-[10px] whitespace-nowrap">
              <button onClick={() => handleSend('Explain the Blast Furnace.')} className="px-2.5 py-1 rounded-full bg-white/[0.04] text-[#8899AA] hover:text-white hover:bg-[#0066FF]/20 transition-all">
                Blast Furnace
              </button>
              <button onClick={() => handleSend('What does the Rolling Mill do?')} className="px-2.5 py-1 rounded-full bg-white/[0.04] text-[#8899AA] hover:text-white hover:bg-[#0066FF]/20 transition-all">
                Rolling Mill
              </button>
              <button onClick={() => handleSend('Show today\'s production summary.')} className="px-2.5 py-1 rounded-full bg-white/[0.04] text-[#8899AA] hover:text-white hover:bg-[#0066FF]/20 transition-all">
                Production
              </button>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[85%] p-3 rounded-xl text-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-[#0066FF] text-white rounded-br-none'
                        : 'bg-white/[0.04] border border-white/[0.06] text-[#E0E6ED] rounded-bl-none'
                    }`}
                  >
                    <p>{m.text}</p>
                    <span className="text-[8px] opacity-60 block mt-1 text-right">{m.time}</span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Box */}
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 border-t border-white/[0.06] flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask about steel manufacturing, machines, or stages..."
                className="input text-xs flex-1 !py-2"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button type="submit" className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#0066FF] text-white hover:bg-[#0052CC] transition-colors">
                <i className="fas fa-paper-plane text-xs" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
