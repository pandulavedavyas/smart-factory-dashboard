import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STEEL_PIPELINE_STAGES = [
  {
    stageNum: 1,
    name: 'Raw Material Intake',
    icon: 'fa-truck-ramp-box',
    machine: 'Intake Conveyor IC-01',
    temp: '28°C',
    status: 'Running',
    operator: 'James Wilson',
    progress: 100,
    desc: 'Iron ore pellets, metallurgical coke, and flux material feeding system.',
    details: { feedRate: '450 Tons/Hr', moisture: '2.4%', bufferLevel: '88%' }
  },
  {
    stageNum: 2,
    name: 'Blast Furnace',
    icon: 'fa-fire-burner',
    machine: 'Blast Furnace BF-A',
    temp: '1450°C',
    status: 'Running',
    operator: 'Michael Brown',
    progress: 94,
    desc: 'Iron reduction smelting producing molten liquid pig iron.',
    details: { blastPressure: '3.2 Bar', slagRatio: '280 kg/t', tapSpeed: '4.2 t/min' }
  },
  {
    stageNum: 3,
    name: 'Steel Making (BOF)',
    icon: 'fa-flask-vial',
    machine: 'Basic Oxygen Converter C2',
    temp: '1620°C',
    status: 'Running',
    operator: 'Sarah Chen',
    progress: 88,
    desc: 'Decarburization via pure oxygen blowing to convert pig iron to liquid steel.',
    details: { oxygenPurity: '99.8%', carbonPct: '0.04%', blowDuration: '18 Mins' }
  },
  {
    stageNum: 4,
    name: 'Continuous Casting',
    icon: 'fa-bars-staggered',
    machine: 'Slab Caster SC-01',
    temp: '1100°C',
    status: 'Running',
    operator: 'Emily Davis',
    progress: 92,
    desc: 'Solidification of liquid steel into continuous rectangular slabs.',
    details: { castingSpeed: '1.4 m/min', slabWidth: '1500 mm', moldVibration: '140 Hz' }
  },
  {
    stageNum: 5,
    name: 'Hot Rolling Mill',
    icon: 'fa-gears',
    machine: 'Hot Strip Mill HSM-A1',
    temp: '900°C',
    status: 'Running',
    operator: 'David Martinez',
    progress: 96,
    desc: 'Thermal reduction rolling slabs down to precision steel sheet coils.',
    details: { coilThickness: '2.5 mm', rollingForce: '3200 Tons', stripSpeed: '18 m/s' }
  },
  {
    stageNum: 6,
    name: 'Quality Inspection',
    icon: 'fa-[#10B981] fa-[#2563EB] fa-microscope',
    machine: 'NDT Scanner QA-02',
    temp: '45°C',
    status: 'Running',
    operator: 'Lisa Anderson',
    progress: 100,
    desc: 'Ultrasonic flaw detection, X-ray thickness profiling, and tensile testing.',
    details: { defectRate: '0.02%', tensileStrength: '520 MPa', passRate: '99.8%' }
  },
  {
    stageNum: 7,
    name: 'Coil Packaging & Dispatch',
    icon: 'fa-boxes-packing',
    machine: 'Strapping Line PKG-01',
    temp: '32°C',
    status: 'Running',
    operator: 'Robert Taylor',
    progress: 90,
    desc: 'Automated steel coil wrapping, barcode labeling, and logistics staging.',
    details: { coilsStaged: '140 Units', avgWeight: '22 Tons', dispatchStatus: 'Ready' }
  }
];

export default function ManufacturingWorkflow() {
  const [selectedStage, setSelectedStage] = useState(STEEL_PIPELINE_STAGES[1]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-dashboard-title" style={{ color: 'var(--text-main)' }}>Steel Manufacturing Workflow</h1>
          <p className="text-card-label" style={{ color: 'var(--text-secondary)' }}>End-to-end 7-stage steel production pipeline from raw ore intake to finished coil dispatch.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl border" style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)' }}>
          <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: 'var(--success)' }} />
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>7 Stages Synchronized</span>
        </div>
      </motion.div>

      {/* HORIZONTAL 7-STAGE PIPELINE */}
      <div className="saas-card overflow-x-auto py-8">
        <div className="flex items-center justify-between min-w-[1100px] relative px-4">
          {/* Connector Line */}
          <div className="absolute top-1/2 left-12 right-12 h-1 -translate-y-1/2 z-0" style={{ background: 'var(--border-color)' }} />
          
          {STEEL_PIPELINE_STAGES.map((stage) => {
            const isSelected = selectedStage.stageNum === stage.stageNum;
            return (
              <div
                key={stage.stageNum}
                onClick={() => setSelectedStage(stage)}
                className="relative z-10 flex flex-col items-center cursor-pointer group"
              >
                {/* Node Badge */}
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg transition-all duration-300 shadow-md ${
                    isSelected ? 'scale-110 ring-4' : 'hover:scale-105'
                  }`}
                  style={{
                    background: isSelected ? 'var(--primary)' : 'var(--input-bg)',
                    color: isSelected ? '#FFFFFF' : 'var(--text-main)',
                    borderColor: isSelected ? 'var(--primary)' : 'var(--border-color)',
                    borderWidth: '1px',
                    ringColor: 'var(--glow-primary)'
                  }}
                >
                  <i className={`fas ${stage.icon}`} />
                </div>

                {/* Stage Title */}
                <span className="text-xs font-bold mt-3 text-center max-w-[110px] leading-snug" style={{ color: isSelected ? 'var(--primary-blue)' : 'var(--text-main)' }}>
                  {stage.name}
                </span>
                <span className="text-[10px] font-semibold mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  Stage 0{stage.stageNum}
                </span>

                {/* Status Indicator Pill */}
                <div className="mt-2 flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border"
                  style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--success)' }} />
                  <span>{stage.temp}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SELECTED STAGE DETAILED TELEMETRY CARD */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedStage.stageNum}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="saas-card space-y-6"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6" style={{ borderColor: 'var(--border-color)' }}>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-md" style={{ background: 'var(--primary-blue)', color: '#FFFFFF' }}>
                  Stage 0{selectedStage.stageNum}
                </span>
                <h2 className="text-section-title" style={{ color: 'var(--text-main)' }}>{selectedStage.name}</h2>
              </div>
              <p className="text-card-label mt-1" style={{ color: 'var(--text-secondary)' }}>{selectedStage.desc}</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl border flex items-center gap-3" style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)' }}>
                <i className="fas fa-temperature-high text-lg" style={{ color: 'var(--warning)' }} />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--text-secondary)' }}>Thermal Point</span>
                  <span className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>{selectedStage.temp}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl border flex items-center gap-3" style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)' }}>
                <i className="fas fa-user-gear text-lg" style={{ color: 'var(--primary-blue)' }} />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--text-secondary)' }}>Station Operator</span>
                  <span className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>{selectedStage.operator}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-2xl border space-y-2" style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)' }}>
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Primary Machine Node</span>
              <div className="text-base font-bold" style={{ color: 'var(--text-main)' }}>{selectedStage.machine}</div>
            </div>

            <div className="p-4 rounded-2xl border space-y-2" style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)' }}>
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Pipeline Throughput Progress</span>
              <div className="flex items-center justify-between">
                <span className="text-base font-bold" style={{ color: 'var(--success)' }}>{selectedStage.progress}%</span>
                <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Nominal</span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--border-color)' }}>
                <div className="h-full rounded-full" style={{ width: `${selectedStage.progress}%`, background: 'var(--success)' }} />
              </div>
            </div>

            <div className="p-4 rounded-2xl border space-y-2" style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)' }}>
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Operational Status</span>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: 'var(--success)' }} />
                <span className="text-base font-bold" style={{ color: 'var(--text-main)' }}>{selectedStage.status}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-secondary)' }}>Stage Technical Parameters</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Object.entries(selectedStage.details).map(([key, val]) => (
                <div key={key} className="p-3 rounded-xl border flex justify-between items-center" style={{ background: 'var(--input-bg)', borderColor: 'var(--border-color)' }}>
                  <span className="text-xs font-semibold capitalize" style={{ color: 'var(--text-secondary)' }}>{key.replace(/([A-Z])/g, ' $1')}</span>
                  <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
