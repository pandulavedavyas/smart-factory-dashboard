import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api/api';
import { useToast } from '../context/ToastContext';

export default function Predictions() {
  const { showToast } = useToast();
  const [target, setTarget] = useState('machine_failure');
  const [trainResult, setTrainResult] = useState(null);
  const [training, setTraining] = useState(false);
  const [models, setModels] = useState([]);
  const [features, setFeatures] = useState({ temperature: 70, vibration: 1.2, rpm: 2000, torque: 40 });
  const [predResult, setPredResult] = useState(null);
  const [predicting, setPredicting] = useState(false);

  useEffect(() => { loadModels(); }, []);

  const loadModels = async () => {
    const data = await api.get('/ml/models');
    if (data) setModels(data);
  };

  const train = async () => {
    setTraining(true);
    setTrainResult(null);
    const data = await api.post('/ml/train', { target_col: target, model_type: 'failure' });
    setTraining(false);
    if (data?.accuracy) {
      setTrainResult(data);
      showToast('Model trained successfully!');
      loadModels();
    } else {
      showToast(data?.error || 'Training failed', 'error');
    }
  };

  const predict = async () => {
    setPredicting(true);
    setPredResult(null);
    const data = await api.post('/ml/predict', { features, type: 'failure' });
    setPredicting(false);
    if (data) setPredResult(data);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">AI Models</h1>
        <p className="text-xs mt-1" style={{ color: '#8899AA' }}>Train ML models and run predictive analytics</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card-premium" style={{ padding: '24px' }}>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0, 102, 255, 0.1)' }}>
              <i className="fas fa-brain text-xs" style={{ color: '#0066FF' }} />
            </div>
            <span className="text-sm font-bold text-white">Train Failure Model</span>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: '#556677' }}>Target Column</label>
              <input className="input" value={target} onChange={e => setTarget(e.target.value)} />
            </div>
            <button onClick={train} disabled={training} className="btn-primary w-full">
              {training ? <><i className="fas fa-spinner animate-spin mr-2" />Training...</> : <><i className="fas fa-brain mr-2" />Train Model</>}
            </button>
            {trainResult && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 rounded-xl" style={{ background: 'rgba(0, 214, 143, 0.05)', borderLeft: '3px solid #00D68F' }}>
                <h4 className="font-bold text-sm" style={{ color: '#00D68F' }}><i className="fas fa-check-circle mr-1" />Training Complete</h4>
                <p className="text-xs mt-1" style={{ color: '#8899AA' }}>Accuracy: <strong className="text-white">{trainResult.accuracy}%</strong></p>
                <p className="text-xs" style={{ color: '#8899AA' }}>Features: {(trainResult.features_used || []).join(', ')}</p>
              </motion.div>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card-premium" style={{ padding: '24px' }}>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(167, 139, 250, 0.1)' }}>
              <i className="fas fa-play text-xs" style={{ color: '#A78BFA' }} />
            </div>
            <span className="text-sm font-bold text-white">Run Prediction</span>
          </div>
          <div className="space-y-3">
            {[
              { key: 'temperature', label: 'Temperature', step: 1 },
              { key: 'vibration', label: 'Vibration', step: 0.1 },
              { key: 'rpm', label: 'RPM', step: 1 },
              { key: 'torque', label: 'Torque', step: 1 },
            ].map(f => (
              <div key={f.key}>
                <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block" style={{ color: '#556677' }}>{f.label}</label>
                <input type="number" className="input" step={f.step} value={features[f.key]} onChange={e => setFeatures({ ...features, [f.key]: parseFloat(e.target.value) || 0 })} />
              </div>
            ))}
            <button onClick={predict} disabled={predicting} className="btn-primary w-full">
              {predicting ? <><i className="fas fa-spinner animate-spin mr-2" />Predicting...</> : <><i className="fas fa-play mr-2" />Predict</>}
            </button>
            {predResult && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 rounded-xl"
                style={predResult.prediction === 1 || predResult.fallback ? { background: 'rgba(255, 71, 87, 0.05)', borderLeft: '3px solid #FF4757' } : { background: 'rgba(0, 214, 143, 0.05)', borderLeft: '3px solid #00D68F' }}>
                <h4 className="font-bold text-sm" style={{ color: predResult.prediction === 1 || predResult.fallback ? '#FF4757' : '#00D68F' }}>
                  <i className={`fas fa-${predResult.prediction === 1 || predResult.fallback ? 'exclamation-triangle' : 'check-circle'} mr-1`} />
                  {predResult.prediction === 1 || predResult.fallback ? 'Failure Predicted' : 'No Failure'}
                </h4>
                <p className="text-xs mt-1" style={{ color: '#8899AA' }}>Probability: <strong className="text-white">{(predResult.probability * 100).toFixed(1)}%</strong></p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card-premium" style={{ padding: '24px' }}>
        <h3 className="text-sm font-bold text-white mb-4">Saved Models</h3>
        <div className="table-container">
          <table>
            <thead><tr><th>Name</th><th>File</th><th>Size</th><th>Status</th></tr></thead>
            <tbody>
              {models.length ? models.map((m, i) => (
                <tr key={i}>
                  <td className="font-medium text-white">{m.name}</td>
                  <td className="text-xs" style={{ color: '#8899AA' }}>{m.filename}</td>
                  <td className="text-xs" style={{ color: '#8899AA' }}>{(m.size / 1024).toFixed(1)} KB</td>
                  <td><span className="status-badge status-running">Available</span></td>
                </tr>
              )) : <tr><td colSpan="4" className="text-center py-8" style={{ color: '#556677' }}>No models saved</td></tr>}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
