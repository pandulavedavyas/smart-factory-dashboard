import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getSettings, updateSettings, seedSteelDemoData } from '../services/firestoreService';

export default function Settings() {
  const { user, role, updateUser, logout } = useAuth();
  const { showToast } = useToast();
  const [profileName, setProfileName] = useState(user?.full_name || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // Global factory settings state
  const [factorySettings, setFactorySettings] = useState({
    factoryName: 'Smart Steel Manufacturing Plant',
    tempThreshold: 1500.0,
    healthWarningLimit: 75,
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
    await new Promise(r => setTimeout(r, 200));
    updateUser({ full_name: profileName });
    showToast('Administrator profile updated');
    setSavingProfile(false);
  };

  const handleSaveFactorySettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await updateSettings(factorySettings);
      showToast('Steel plant telemetry thresholds updated in Firestore');
    } catch (err) {
      showToast('Error saving factory settings', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSeedDemoData = async () => {
    setSeeding(true);
    try {
      const res = await seedSteelDemoData(true);
      showToast(`Seeded ${res.workersCount} steel workers and ${res.machinesCount} machines into Firestore!`, 'success');
    } catch (err) {
      showToast('Seeding error: ' + (err.message || err), 'error');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold text-white tracking-tight uppercase">Plant System Settings</h1>
        <p className="text-xs" style={{ color: '#8899AA' }}>Configure administrator profiles, Firestore seed data, and thermal thresholds.</p>
      </motion.div>

      {/* SEED DEMO DATA PROMINENT BANNER (ADMIN ONLY) */}
      {role === 'admin' && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card-premium p-6 border border-[#00D68F]/30" style={{ background: 'rgba(0, 214, 143, 0.04)' }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-[#00D68F]" style={{ background: 'rgba(0, 214, 143, 0.12)', border: '1px solid rgba(0, 214, 143, 0.25)' }}>
                <i className="fas fa-database text-lg" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Seed Steel Plant Demo Data</h3>
                <p className="text-xs mt-0.5" style={{ color: '#8899AA' }}>
                  Automatically insert/reset 50 realistic steel workers and 15 steel machines into Firestore.
                </p>
              </div>
            </div>

            <button
              onClick={handleSeedDemoData}
              disabled={seeding}
              className="btn-primary py-3 px-6 text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 whitespace-nowrap"
              style={{ background: 'linear-gradient(135deg, #00D68F, #00B376)', boxShadow: '0 4px 15px rgba(0, 214, 143, 0.3)' }}
            >
              {seeding ? (
                <><i className="fas fa-spinner fa-spin text-sm" /> Seeding Firestore...</>
              ) : (
                <><i className="fas fa-play text-sm" /> Seed Demo Data</>
              )}
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }} 
          className="glass-card-premium p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0, 102, 255, 0.12)', border: '1px solid rgba(0, 102, 255, 0.2)' }}>
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
                value={user?.email || 'admin@smartfactory.com'} 
                readOnly 
                style={{ opacity: 0.5, cursor: 'not-allowed' }} 
              />
            </div>
            <div>
              <label className="text-[9px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: '#556677' }}>Clearance Role</label>
              <input 
                className="input text-xs uppercase font-bold" 
                value={role || 'admin'} 
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
            <span className="text-xs font-bold text-white uppercase tracking-wider">Thermal & Safety Thresholds</span>
          </div>

          {loadingSettings ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-6 h-6 border-2 border-white/[0.04] border-t-[#00E5FF] rounded-full animate-spin" />
              <span className="text-[10px]" style={{ color: '#8899AA' }}>Syncing global rules...</span>
            </div>
          ) : (
            <form onSubmit={handleSaveFactorySettings} className="space-y-4">
              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: '#556677' }}>Steel Plant Name</label>
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
                <label className="text-[9px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: '#556677' }}>Warning Health Limit (%)</label>
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
                style={{ background: 'linear-gradient(135deg, #0066FF, #0052CC)' }}
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

      {/* Account actions */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="glass-card-premium p-6"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">System Security Session</h4>
            <p className="text-[10px] mt-1" style={{ color: '#556677' }}>Authenticated session: <span className="font-mono text-[#00E5FF]">{user?.id || 'USR-ADMIN-01'}</span></p>
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
