import { useState, useRef, useEffect } from 'react';
import { api } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export default function Chatbot() {
  const { role } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', content: "Hello! I'm your AI Manufacturing Assistant. Ask me about machines, production, workers, or request charts.", chips: ['Factory overview', 'Show machine health', 'Stock alerts', 'Worker performance'] },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesEnd = useRef(null);

  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  if (!['admin', 'manager'].includes(role)) {
    return null;
  }

  const send = async (msg) => {
    if (!msg?.trim()) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setTyping(true);
    try {
      const data = await api.post('/chatbot/message', { message: msg });
      setTyping(false);
      setMessages(prev => [...prev, parseResponse(data)]);
    } catch (e) {
      setTyping(false);
      setMessages(prev => [...prev, { role: 'bot', content: `Error: ${e.message}` }]);
    }
  };

  const parseResponse = (r) => {
    if (r.type === 'text') return { role: 'bot', content: r.content };
    if (['bar', 'line', 'pie', 'radar'].includes(r.type)) {
      return { role: 'bot', content: r.title || 'Chart', chart: { type: r.type, labels: r.labels, values: r.values, datasets: r.datasets } };
    }
    return { role: 'bot', content: JSON.stringify(r) };
  };

  return (
    <>
      {!open && (
        <button onClick={() => setOpen(true)} className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-accent to-purple text-white flex items-center justify-center shadow-lg shadow-accent/30 hover:scale-110 transition-transform">
          <i className="fas fa-comment-dots text-xl" />
        </button>
      )}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] h-[520px] glass rounded-2xl flex flex-col animate-slide-up shadow-2xl">
          <div className="flex items-center gap-3 p-4 border-b border-border">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent"><i className="fas fa-robot" /></div>
            <div className="flex-1"><h3 className="text-sm font-bold">AI Assistant</h3><small className="text-success text-xs">Online</small></div>
            <button onClick={() => setOpen(false)} className="btn-icon !w-8 !h-8"><i className="fas fa-times text-xs" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center bg-accent/10 text-accent text-xs">
                  <i className={`fas fa-${m.role === 'bot' ? 'robot' : 'user'}`} />
                </div>
                <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${m.role === 'user' ? 'bg-accent/20 text-text-primary' : 'bg-white/5 text-text-secondary'}`}>
                  {m.content}
                  {m.chips && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {m.chips.map((c, j) => (
                        <button key={j} onClick={() => send(c)} className="px-2 py-0.5 text-[10px] rounded-full bg-accent/10 text-accent hover:bg-accent/20 transition">{c}</button>
                      ))}
                    </div>
                  )}
                  {m.chart && <ChatChart chart={m.chart} />}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center bg-accent/10 text-accent text-xs"><i className="fas fa-robot" /></div>
                <div className="px-3 py-2 rounded-xl bg-white/5"><div className="flex gap-1"><span className="w-2 h-2 bg-accent/40 rounded-full animate-bounce" /><span className="w-2 h-2 bg-accent/40 rounded-full animate-bounce [animation-delay:0.1s]" /><span className="w-2 h-2 bg-accent/40 rounded-full animate-bounce [animation-delay:0.2s]" /></div></div>
              </div>
            )}
            <div ref={messagesEnd} />
          </div>
          <div className="flex gap-2 p-3 border-t border-border">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send(input)} placeholder="Ask me anything..." className="input flex-1 !py-2" />
            <button onClick={() => send(input)} className="btn-primary !px-3 !py-2"><i className="fas fa-paper-plane" /></button>
          </div>
        </div>
      )}
    </>
  );
}

function ChatChart({ chart }) {
  const ref = useRef(null);
  const inst = useRef(null);

  useEffect(() => {
    if (!ref.current || !chart) return;
    if (inst.current) inst.current.destroy();
    const typeMap = { bar: 'bar', line: 'line', pie: 'pie', radar: 'radar' };
    const colors = ['#1e90ff', '#00d68f', '#ffd93d', '#ff6b6b', '#a78bfa', '#22d3ee', '#f97316'];
    inst.current = new Chart(ref.current, {
      type: typeMap[chart.type] || 'bar',
      data: chart.datasets ? {
        labels: chart.labels,
        datasets: chart.datasets.map((d, i) => ({ label: d.label, data: d.values, borderColor: colors[i % colors.length], backgroundColor: chart.type === 'radar' ? `${colors[i % colors.length]}20` : colors[i % colors.length], tension: 0.4, pointBackgroundColor: colors[i % colors.length] })),
      } : {
        labels: chart.labels,
        datasets: [{ data: chart.values, backgroundColor: colors, borderWidth: chart.type === 'line' ? 2 : 0, tension: 0.4, borderColor: '#1e90ff' }],
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: chart.type === 'pie' || chart.type === 'radar', position: 'bottom', labels: { color: '#8892a6' } } }, scales: chart.type === 'pie' || chart.type === 'radar' ? {} : { y: { beginAtZero: true, grid: { color: '#1e293b' } }, x: { grid: { display: false } } } },
    });
    return () => { if (inst.current) inst.current.destroy(); };
  }, [chart]);

  return <div className="mt-2" style={{ height: '200px' }}><canvas ref={ref} /></div>;
}
