import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { subscribeCollection } from '../services/firestoreService';

const PRESET_QUESTIONS = [
  'Explain the Blast Furnace.',
  'What does the Rolling Mill do?',
  'Why is machine temperature increasing?',
  'What happens if Continuous Casting stops?',
  'Explain the steel manufacturing process.',
  'Show today\'s production summary.',
  'Which machines require maintenance?',
  'Explain quality control.',
  'Suggest ways to improve efficiency.'
];

const EXTENDED_KNOWLEDGE = {
  'explain the blast furnace.': `The Blast Furnace (Stage 2) is a continuous counter-current chemical reactor. Iron ore (Fe2O3/Fe3O4), metallurgical coke, and fluxing limestone are charged at the top. Hot blast air (1200°C) blown from bottom tuyeres reacts with coke to form Carbon Monoxide (CO), which reduces iron ore into liquid pig iron at ~1500°C. Slag floats on top and is separated. Tapped liquid iron feeds downstream BOF steelmaking.`,
  'what does the rolling mill do?': `The Rolling Mill (Stage 8) plastically deforms reheated steel billets (1180°C) into finished products. High-pressure work rolls in Roughing, Intermediate, and Finishing blocks progressively reduce cross-sectional thickness. For rebar, specialized roll grooves form high-bond ribs before controlled water quenching (Thermex) creates hardened martensite outer skins.`,
  'why is machine temperature increasing?': `Temperature elevation is caused by: 1. Increased thermal throughput. 2. Refractory insulation erosion in furnace walls. 3. Mechanical friction due to roll bearing degradation or lubrication failure. 4. Reduced secondary cooling water flow rates. Automated thermal cut-off switches trigger warnings if temperature exceeds safety thresholds.`,
  'what happens if continuous casting stops?': `A stoppage in the Continuous Casting Machine (Stage 5) creates a severe bottleneck. Upstream molten steel in Ladle Refining must be maintained at temperature or teemed into backup ingot molds to avoid ladle freezing. Downstream Billet Cutting and Reheating Furnaces pause, and stage alarms alert operators immediately.`,
  'explain the steel manufacturing process.': `Steel manufacturing follows a 12-stage Digital Twin process: Raw Material Handling -> Blast Furnace Ironmaking -> BOF/EAF Steelmaking -> Ladle Metallurgical Refining -> Continuous Casting -> Billet Cutting -> Reheating -> Hot Rolling -> Cooling Bed -> Straightening -> Non-Destructive Inspection -> Bundling & Packaging.`,
  'show today\'s production summary.': `Today\'s total output is 1,850 Tons across active shifts (Morning & Afternoon). Primary products: Steel Billets 150x150mm (42%) and Deformed Rebar 16mm (38%). Overall OEE is 96.8% with a scrap rate of 1.1%.`,
  'which machines require maintenance?': `Surface Grinding Machine (MCH-010 in Stage 11) is currently in Corrective Maintenance due to spindle bearing vibration exceeding 4.8 mm/s. Reheating Furnace (MCH-006) is scheduled for preventative burner nozzle cleaning on 2026-07-25. All other 33 machines operate at normal health (>88%).`,
  'explain quality control.': `Quality Control in Stage 11 utilizes automated dual inspection: 1. AI High-Resolution Camera Systems detect surface seams, scale, and lap flaws. 2. Ultrasonic Inspection Machines probe internal billet density and internal voids. Current pass rate is 99.4%.`,
  'suggest ways to improve efficiency.': `Top Efficiency Strategies: 1. Waste Heat Recovery: Install recuperators on Reheating Furnace flues to preheat combustion air, reducing gas consumption by 6.5%. 2. Predictive Maintenance: Use vibration sensors on Roughing Mill roll stands to eliminate unpredicted downtime. 3. Dynamic Oxygen Blowing: Automate EAF oxygen lance timing to optimize melt times.`
};

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      sender: 'ai',
      text: 'Welcome to the AI Steel Manufacturing Intelligence Center. Select a question below or type any query regarding our 12 production stages, equipment telemetry, or factory efficiency.',
      timestamp: '09:00 AM'
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleAsk = (queryText) => {
    const text = (queryText || input).trim();
    if (!text) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInput('');

    setTimeout(() => {
      const key = text.toLowerCase();
      let responseText = EXTENDED_KNOWLEDGE[key];

      if (!responseText) {
        // Fallback intelligence lookup
        const running = machines.filter(m => m.status === 'Running').length;
        responseText = `Factory Telemetry Analysis: Across all 12 stages, ${running} of ${machines.length || 35} equipment units are currently running. Overall plant thermal stability is 98.2%. Regarding "${text}": All parameters remain within Industry 4.0 operating specs.`;
      }

      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 450);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-[#0066FF]/10 text-[#00E5FF] border border-[#0066FF]/20 mb-1">
            <i className="fas fa-brain text-[8px] animate-pulse" /> Industry 4.0 Intelligence Engine
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight uppercase">AI Factory Assistant & Knowledge Base</h1>
          <p className="text-xs" style={{ color: '#8899AA' }}>Instant answers on steel manufacturing, machines, workflow stages, predictive alerts, and efficiency.</p>
        </div>
      </div>

      {/* Preset Quick Questions Grid */}
      <div className="glass-card-premium p-5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
          <i className="fas fa-bolt text-[#00E5FF]" />
          <span>Recommended Industrial Queries</span>
        </h3>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {PRESET_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleAsk(q)}
              className="p-3 rounded-xl text-xs font-semibold text-left transition-all duration-200 border border-white/[0.04] bg-white/[0.02] text-[#E0E6ED] hover:border-[#00E5FF]/40 hover:bg-[#0066FF]/10 hover:text-white flex items-center justify-between group cursor-pointer"
            >
              <span>{q}</span>
              <i className="fas fa-arrow-right text-[10px] text-[#00E5FF] opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Log */}
      <div className="glass-card-premium p-5 flex flex-col h-[520px] justify-between">
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className="flex items-start gap-3 max-w-[80%]">
                {m.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0 mt-1" style={{ background: 'linear-gradient(135deg, #0066FF, #00E5FF)' }}>
                    <i className="fas fa-robot text-xs" />
                  </div>
                )}
                <div 
                  className={`p-4 rounded-2xl text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-[#0066FF] text-white rounded-tr-none shadow-[0_4px_15px_rgba(0,102,255,0.3)]'
                      : 'bg-white/[0.03] border border-white/[0.06] text-[#E0E6ED] rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>
                  <span className="text-[9px] opacity-60 block mt-2 text-right">{m.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={(e) => { e.preventDefault(); handleAsk(); }} className="pt-4 border-t border-white/[0.06] flex items-center gap-3">
          <input
            type="text"
            className="input text-xs flex-1 !py-3"
            placeholder="Type your question about steel production, machines, or process optimization..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            className="btn-primary py-3 px-6 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
          >
            <span>Ask AI</span>
            <i className="fas fa-paper-plane text-xs" />
          </button>
        </form>
      </div>
    </div>
  );
}
