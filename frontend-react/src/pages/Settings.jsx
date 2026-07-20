import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getSettings, updateSettings } from '../services/firestoreService';

export default function Settings() {
  const { user, role, updateUser, logout } = useAuth();
  const { showToast } = useToast();
  const [profileName, setProfileName] = useState(user?.full_name || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Global factory settings state
  const [factorySettings, setFactorySettings] = useState({
    factoryName: '',
    tempThreshold: 80.0,
    healthWarningLimit: 60,
    vibrationMax: 4.5,
    operatingTimeStart: '06:00',
    operatingTimeEnd: '22:00'
  });
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await getSettings();
        if (data) {
          setFactorySettings(data);
        }
      } catch (err) {
        showToast('Error syncing global settings', 'error');
      } finally {
        setLoadingSettings(false);
      }
    }
    loadSettings();
  }, []);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    await new Promise(r => setTimeout(r, 200)); // Simulate write latency
    updateUser({ full_name: profileName });
    showToast('Administrator profile updated locally');
    setSavingProfile(false);
  };

  const handleSaveFactorySettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await updateSettings(factorySettings);
      showToast('Global factory settings saved successfully');
    } catch (err) {
      showToast('Error saving factory settings', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold text-white tracking-tight uppercase">Platform Settings</h1>
        <p className="text-xs" style={{ color: '#8899AA' }}>Configure administrator profile details and global plant monitoring parameters.</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }} 
          className="glass-card-premium p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center animate-pulse" style={{ background: 'rgba(0, 102, 255, 0.12)', border: '1px solid rgba(0, 102, 255, 0.2)' }}>
              <i className="fas fa-user-gear text-xs text-[#0066FF]" />
            </div>
            <span className="text-xs font-bold text-white uppercase tracking-wider">Admin Profile</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[9px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: '#556677' }}>Full Name</label>
              <input 
                className="input text-xs" 
                value={profileName} 
                onChange={e => setProfileName(e.target.value)} 
              />
            </div>
            <div>
              <label className="text-[9px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: '#556677' }}>Security Email</label>
              <input 
                className="input text-xs" 
                value={user?.email || ''} 
                readOnly 
                style={{ opacity: 0.5, cursor: 'not-allowed' }} 
              />
            </div>
            <div>
              <label className="text-[9px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: '#556677' }}>Assigned Authorization</label>
              <input 
                className="input text-xs uppercase font-bold" 
                value={role || ''} 
                readOnly 
                style={{ opacity: 0.5, cursor: 'not-allowed', color: '#FF4757' }} 
              />
            </div>
            <button 
              onClick={handleSaveProfile} 
              disabled={savingProfile} 
              className="btn-primary w-full py-3 text-xs uppercase tracking-wider font-extrabold"
            >
              {savingProfile ? (
                <><i className="fas fa-spinner fa-spin mr-2" />Saving...</>
              ) : (
                <><i className="fas fa-save mr-2" />Save Profile Changes</>
              )}
            </button>
          </div>
        </motion.div>

        {/* Global Factory Settings */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }} 
          className="glass-card-premium p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0, 229, 255, 0.12)', border: '1px solid rgba(0, 229, 255, 0.2)' }}>
              <i className="fas fa-industry text-xs text-[#00E5FF]" />
            </div>
            <span className="text-xs font-bold text-white uppercase tracking-wider">Telemetry Limits (Firestore)</span>
          </div>

          {loadingSettings ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-6 h-6 border-2 border-white/[0.04] border-t-[#00E5FF] rounded-full animate-spin" />
              <span className="text-[10px]" style={{ color: '#8899AA' }}>Syncing global rules...</span>
            </div>
          ) : (
            <form onSubmit={handleSaveFactorySettings} className="space-y-4">
              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: '#556677' }}>Factory Headquarters Name</label>
                <input 
                  type="text" 
                  className="input text-xs" 
                  required
                  value={factorySettings.factoryName}
                  onChange={e => setFactorySettings({ ...factorySettings, factoryName: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: '#556677' }}>Max Temperature (°C)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    className="input text-xs"
                    required
                    value={factorySettings.tempThreshold}
                    onChange={e => setFactorySettings({ ...factorySettings, tempThreshold: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: '#556677' }}>Max Vibration (mm/s)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    className="input text-xs" 
                    required
                    value={factorySettings.vibrationMax}
                    onChange={e => setFactorySettings({ ...factorySettings, vibrationMax: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: '#556677' }}>Warning Health Score Limit (%)</label>
                <input 
                  type="number" 
                  className="input text-xs" 
                  required
                  value={factorySettings.healthWarningLimit}
                  onChange={e => setFactorySettings({ ...factorySettings, healthWarningLimit: parseInt(e.target.value) || 0 })}
                />
              </div>

              <button 
                type="submit" 
                disabled={savingSettings} 
                className="btn-primary w-full py-3 text-xs uppercase tracking-wider font-extrabold"
                style={{ background: 'linear-gradient(135deg, #00D68F, #00B376)', boxShadow: '0 4px 15px rgba(0, 214, 143, 0.2)' }}
              >
                {savingSettings ? (
                  <><i className="fas fa-spinner fa-spin mr-2" />Saving...</>
                ) : (
                  <><i className="fas fa-save mr-2" />Save Thresholds</>
                )}
              </button>
            </form>
          )}
        </motion.div>
      </div>

      {/* Account actions section */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="glass-card-premium p-6"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">System Security Session</h4>
            <p className="text-[10px] mt-1" style={{ color: '#556677' }}>Logged in session key: <span className="font-mono text-[#00E5FF]">{user?.id}</span></p>
          </div>
          <button 
            onClick={logout} 
            className="btn-danger py-2.5 px-6 text-xs font-extrabold uppercase tracking-wider"
          >
            <i className="fas fa-right-from-bracket mr-2" /> Terminate Session
          </button>
        </div>
      </motion.div>
    </div>
  );
}
