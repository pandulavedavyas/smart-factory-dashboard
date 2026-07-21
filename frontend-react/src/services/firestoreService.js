import { isFirebaseConfigured, getFirebase } from '../firebase/firebaseClient';
import {
  SEED_WORKERS,
  SEED_MACHINES,
  SEED_MANUFACTURING_STAGES,
  SEED_NOTIFICATIONS,
  SEED_PRODUCTION,
  SEED_INVENTORY,
  SEED_RAW_MATERIALS,
  SEED_MAINTENANCE,
  SEED_REPORTS,
  SEED_USERS,
  SEED_CHAT_HISTORY,
  SEED_FINANCE,
  SEED_ATTENDANCE
} from './steelDataSeed';

// Helper to simulate slight network latency for realistic loading states
const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

// Event emitter for local simulation real-time updates
const listeners = new Set();
function notifyListeners(colName) {
  listeners.forEach((callback) => {
    try { callback(colName); } catch (e) { console.error('Listener error:', e); }
  });
}

// ==========================================
// SIMULATED FIRESTORE DRIVER (LocalStorage)
// ==========================================

class SimulatedFirestore {
  constructor() {
    this.storageKey = 'smartfactory_steel_firestore_db';
    this.init();
  }

  init(forceReset = false) {
    if (forceReset || !localStorage.getItem(this.storageKey)) {
      const db = {
        workers: SEED_WORKERS,
        machines: SEED_MACHINES,
        manufacturingStages: SEED_MANUFACTURING_STAGES,
        notifications: SEED_NOTIFICATIONS,
        production: SEED_PRODUCTION,
        inventory: SEED_INVENTORY,
        rawMaterials: SEED_RAW_MATERIALS,
        maintenance: SEED_MAINTENANCE,
        reports: SEED_REPORTS,
        users: SEED_USERS,
        chatHistory: SEED_CHAT_HISTORY,
        finance: SEED_FINANCE,
        attendance: SEED_ATTENDANCE,
        settings: {
          factoryName: 'Smart Steel Manufacturing Plant',
          tempThreshold: 1500.0,
          healthWarningLimit: 75,
          vibrationMax: 4.5,
          operatingTimeStart: '06:00',
          operatingTimeEnd: '22:00'
        }
      };
      localStorage.setItem(this.storageKey, JSON.stringify(db));
      notifyListeners('all');
    }
  }

  getDb() {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      this.init();
      return JSON.parse(localStorage.getItem(this.storageKey));
    }
    return JSON.parse(raw);
  }

  saveDb(db, colChanged) {
    localStorage.setItem(this.storageKey, JSON.stringify(db));
    if (colChanged) notifyListeners(colChanged);
  }

  async getCollection(colName) {
    await delay();
    return this.getDb()[colName] || [];
  }

  async addDocument(colName, docData) {
    await delay();
    const db = this.getDb();
    const id = docData.id || docData.employeeId || docData.machineId || `${colName.slice(0, 3).toUpperCase()}-${Math.random().toString(36).substr(2, 6)}`;
    const newDoc = { ...docData, id };
    db[colName] = [newDoc, ...(db[colName] || [])];
    this.saveDb(db, colName);
    return newDoc;
  }

  async updateDocument(colName, docId, updates) {
    await delay();
    const db = this.getDb();
    const list = db[colName] || [];
    const index = list.findIndex(d => (d.id === docId || d.employeeId === docId || d.machineId === docId));
    if (index !== -1) {
      list[index] = { ...list[index], ...updates };
      db[colName] = list;
      this.saveDb(db, colName);
      return list[index];
    }
    throw new Error(`Document ${docId} not found in collection ${colName}`);
  }

  async deleteDocument(colName, docId) {
    await delay();
    const db = this.getDb();
    db[colName] = (db[colName] || []).filter(d => (d.id !== docId && d.employeeId !== docId && d.machineId !== docId));
    this.saveDb(db, colName);
    return true;
  }

  async getDocument(colName, docId) {
    await delay();
    const list = this.getDb()[colName] || [];
    return list.find(d => (d.id === docId || d.employeeId === docId || d.machineId === docId)) || null;
  }
}

const simFirestore = new SimulatedFirestore();

// ==========================================
// SEED DEMO DATA FUNCTION
// ==========================================

export async function seedSteelDemoData(force = false) {
  if (isFirebaseConfigured()) {
    try {
      const fb = await getFirebase();
      if (fb) {
        const fs = await import(/* @vite-ignore */ 'firebase/firestore');
        const db = fs.getFirestore(fb.app);

        // Batch seed Workers
        for (const worker of SEED_WORKERS) {
          await fs.setDoc(fs.doc(db, 'workers', worker.employeeId), worker, { merge: true });
        }
        // Batch seed Machines
        for (const machine of SEED_MACHINES) {
          await fs.setDoc(fs.doc(db, 'machines', machine.machineId), machine, { merge: true });
        }
        // Batch seed Manufacturing Stages
        for (const stage of SEED_MANUFACTURING_STAGES) {
          await fs.setDoc(fs.doc(db, 'manufacturingStages', stage.id), stage, { merge: true });
        }
        // Batch seed Notifications
        for (const notif of SEED_NOTIFICATIONS) {
          await fs.setDoc(fs.doc(db, 'notifications', notif.id), notif, { merge: true });
        }
        // Batch seed Production
        for (const prod of SEED_PRODUCTION) {
          await fs.setDoc(fs.doc(db, 'production', prod.id), prod, { merge: true });
        }
        // Batch seed Inventory
        for (const item of SEED_INVENTORY) {
          await fs.setDoc(fs.doc(db, 'inventory', item.id), item, { merge: true });
        }
        // Batch seed Raw Materials
        for (const raw of SEED_RAW_MATERIALS) {
          await fs.setDoc(fs.doc(db, 'rawMaterials', raw.id), raw, { merge: true });
        }
        // Batch seed Maintenance
        for (const mnt of SEED_MAINTENANCE) {
          await fs.setDoc(fs.doc(db, 'maintenance', mnt.id), mnt, { merge: true });
        }
        // Batch seed Reports
        for (const rep of SEED_REPORTS) {
          await fs.setDoc(fs.doc(db, 'reports', rep.id), rep, { merge: true });
        }
        // Batch seed Users
        for (const usr of SEED_USERS) {
          await fs.setDoc(fs.doc(db, 'users', usr.id), usr, { merge: true });
        }
        // Batch seed Chat History
        for (const chat of SEED_CHAT_HISTORY) {
          await fs.setDoc(fs.doc(db, 'chatHistory', chat.id), chat, { merge: true });
        }
      }
    } catch (err) {
      console.warn('Firestore seeding failed, using local simulation store:', err);
    }
  }

  simFirestore.init(true);
  return {
    workersCount: SEED_WORKERS.length,
    machinesCount: SEED_MACHINES.length,
    stagesCount: SEED_MANUFACTURING_STAGES.length,
    collectionsCount: 12
  };
}

// ==========================================
// REAL-TIME FIRESTORE LISTENER HELPER
// ==========================================

export function subscribeCollection(colName, callback) {
  let unsubscribeFs = null;

  if (isFirebaseConfigured()) {
    getFirebase().then(async (fb) => {
      if (!fb) return;
      try {
        const fs = await import(/* @vite-ignore */ 'firebase/firestore');
        const db = fs.getFirestore(fb.app);
        const colRef = fs.collection(db, colName);
        unsubscribeFs = fs.onSnapshot(colRef, (snapshot) => {
          const docs = [];
          snapshot.forEach((docItem) => docs.push({ id: docItem.id, ...docItem.data() }));
          callback(docs);
        });
      } catch (err) {
        console.warn(`Real-time subscription to ${colName} fallback:`, err);
      }
    });
  }

  // Local fallback subscription
  const localCallback = (changedCol) => {
    if (changedCol === colName || changedCol === 'all') {
      simFirestore.getCollection(colName).then(callback);
    }
  };
  listeners.add(localCallback);
  simFirestore.getCollection(colName).then(callback);

  return () => {
    if (unsubscribeFs) unsubscribeFs();
    listeners.delete(localCallback);
  };
}

// ==========================================
// CENTRALIZED SERVICE METHODS
// ==========================================

// --- WORKERS ---
export async function getWorkers() {
  if (isFirebaseConfigured()) {
    try {
      const fb = await getFirebase();
      const db = getFirestore(fb.app);
      const snapshot = await getDocs(collection(db, 'workers'));
      const results = [];
      snapshot.forEach(docItem => results.push({ id: docItem.id, ...docItem.data() }));
      if (results.length > 0) return results;
    } catch (e) {
      /* fallback */
    }
  }
  return simFirestore.getCollection('workers');
}

export async function getWorker(employeeId) {
  if (isFirebaseConfigured()) {
    try {
      const fb = await getFirebase();
      const db = getFirestore(fb.app);
      const docRef = doc(db, 'workers', employeeId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() };
    } catch (e) {
      /* fallback */
    }
  }
  return simFirestore.getDocument('workers', employeeId);
}

export async function saveWorker(worker) {
  const id = worker.employeeId || worker.id;
  if (isFirebaseConfigured()) {
    try {
      const fb = await getFirebase();
      const db = getFirestore(fb.app);
      await setDoc(doc(db, 'workers', id), worker, { merge: true });
    } catch (e) {
      /* fallback */
    }
  }
  const existing = await simFirestore.getDocument('workers', id);
  if (existing) {
    return simFirestore.updateDocument('workers', id, worker);
  }
  return simFirestore.addDocument('workers', worker);
}

export async function deleteWorker(employeeId) {
  if (isFirebaseConfigured()) {
    try {
      const fb = await getFirebase();
      const db = getFirestore(fb.app);
      await deleteDoc(doc(db, 'workers', employeeId));
    } catch (e) {
      /* fallback */
    }
  }
  return simFirestore.deleteDocument('workers', employeeId);
}

// --- MACHINES ---
export async function getMachines() {
  if (isFirebaseConfigured()) {
    try {
      const fb = await getFirebase();
      const db = getFirestore(fb.app);
      const snapshot = await getDocs(collection(db, 'machines'));
      const results = [];
      snapshot.forEach(docItem => results.push({ id: docItem.id, ...docItem.data() }));
      if (results.length > 0) return results;
    } catch (e) {
      /* fallback */
    }
  }
  return simFirestore.getCollection('machines');
}

export async function saveMachine(machine) {
  const id = machine.machineId || machine.id;
  if (isFirebaseConfigured()) {
    try {
      const fb = await getFirebase();
      const db = getFirestore(fb.app);
      await setDoc(doc(db, 'machines', id), machine, { merge: true });
    } catch (e) {
      /* fallback */
    }
  }
  const existing = await simFirestore.getDocument('machines', id);
  if (existing) {
    return simFirestore.updateDocument('machines', id, machine);
  }
  return simFirestore.addDocument('machines', machine);
}

export async function deleteMachine(machineId) {
  if (isFirebaseConfigured()) {
    try {
      const fb = await getFirebase();
      const db = getFirestore(fb.app);
      await deleteDoc(doc(db, 'machines', machineId));
    } catch (e) {
      /* fallback */
    }
  }
  return simFirestore.deleteDocument('machines', machineId);
}

// --- PRODUCTION ---
export async function getProduction() {
  if (isFirebaseConfigured()) {
    try {
      const fb = await getFirebase();
      const db = getFirestore(fb.app);
      const snapshot = await getDocs(collection(db, 'production'));
      const results = [];
      snapshot.forEach(docItem => results.push({ id: docItem.id, ...docItem.data() }));
      if (results.length > 0) return results;
    } catch (e) {
      /* fallback */
    }
  }
  return simFirestore.getCollection('production');
}

// --- INVENTORY ---
export async function getInventory() {
  if (isFirebaseConfigured()) {
    try {
      const fb = await getFirebase();
      const db = getFirestore(fb.app);
      const snapshot = await getDocs(collection(db, 'inventory'));
      const results = [];
      snapshot.forEach(docItem => results.push({ id: docItem.id, ...docItem.data() }));
      if (results.length > 0) return results;
    } catch (e) {
      /* fallback */
    }
  }
  return simFirestore.getCollection('inventory');
}

// --- RAW MATERIALS ---
export async function getRawMaterials() {
  if (isFirebaseConfigured()) {
    try {
      const fb = await getFirebase();
      const db = getFirestore(fb.app);
      const snapshot = await getDocs(collection(db, 'rawMaterials'));
      const results = [];
      snapshot.forEach(docItem => results.push({ id: docItem.id, ...docItem.data() }));
      if (results.length > 0) return results;
    } catch (e) {
      /* fallback */
    }
  }
  return simFirestore.getCollection('rawMaterials');
}

// --- MAINTENANCE ---
export async function getMaintenance() {
  if (isFirebaseConfigured()) {
    try {
      const fb = await getFirebase();
      const db = getFirestore(fb.app);
      const snapshot = await getDocs(collection(db, 'maintenance'));
      const results = [];
      snapshot.forEach(docItem => results.push({ id: docItem.id, ...docItem.data() }));
      if (results.length > 0) return results;
    } catch (e) {
      /* fallback */
    }
  }
  return simFirestore.getCollection('maintenance');
}

// --- REPORTS ---
export async function getReports() {
  if (isFirebaseConfigured()) {
    try {
      const fb = await getFirebase();
      const db = getFirestore(fb.app);
      const snapshot = await getDocs(collection(db, 'reports'));
      const results = [];
      snapshot.forEach(docItem => results.push({ id: docItem.id, ...docItem.data() }));
      if (results.length > 0) return results;
    } catch (e) {
      /* fallback */
    }
  }
  return simFirestore.getCollection('reports');
}

export async function saveReport(report) {
  const id = report.id || `REP-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  const docData = { ...report, id };
  if (isFirebaseConfigured()) {
    try {
      const fb = await getFirebase();
      const db = getFirestore(fb.app);
      await setDoc(doc(db, 'reports', id), docData, { merge: true });
    } catch (e) {
      /* fallback */
    }
  }
  const existing = await simFirestore.getDocument('reports', id);
  if (existing) {
    return simFirestore.updateDocument('reports', id, docData);
  }
  return simFirestore.addDocument('reports', docData);
}

export async function deleteReport(reportId) {
  if (isFirebaseConfigured()) {
    try {
      const fb = await getFirebase();
      const db = getFirestore(fb.app);
      await deleteDoc(doc(db, 'reports', reportId));
    } catch (e) {
      /* fallback */
    }
  }
  return simFirestore.deleteDocument('reports', reportId);
}

// --- USERS ---
export async function getUsers() {
  if (isFirebaseConfigured()) {
    try {
      const fb = await getFirebase();
      const db = getFirestore(fb.app);
      const snapshot = await getDocs(collection(db, 'users'));
      const results = [];
      snapshot.forEach(docItem => results.push({ id: docItem.id, ...docItem.data() }));
      if (results.length > 0) return results;
    } catch (e) {
      /* fallback */
    }
  }
  return simFirestore.getCollection('users');
}

export async function saveUser(user) {
  const id = user.id || user.employeeId || `USR-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  const docData = { ...user, id };
  if (isFirebaseConfigured()) {
    try {
      const fb = await getFirebase();
      const db = getFirestore(fb.app);
      await setDoc(doc(db, 'users', id), docData, { merge: true });
    } catch (e) {
      /* fallback */
    }
  }
  const existing = await simFirestore.getDocument('users', id);
  if (existing) {
    return simFirestore.updateDocument('users', id, docData);
  }
  return simFirestore.addDocument('users', docData);
}

export async function deleteUser(userId) {
  if (isFirebaseConfigured()) {
    try {
      const fb = await getFirebase();
      const db = getFirestore(fb.app);
      await deleteDoc(doc(db, 'users', userId));
    } catch (e) {
      /* fallback */
    }
  }
  return simFirestore.deleteDocument('users', userId);
}

// --- FINANCE ---
export async function getFinance() {
  if (isFirebaseConfigured()) {
    try {
      const fb = await getFirebase();
      const fs = await import(/* @vite-ignore */ 'firebase/firestore');
      const db = fs.getFirestore(fb.app);
      const snapshot = await fs.getDocs(fs.collection(db, 'finance'));
      const results = [];
      snapshot.forEach(docItem => results.push({ id: docItem.id, ...docItem.data() }));
      if (results.length > 0) return results;
    } catch (e) {
      /* fallback */
    }
  }
  return simFirestore.getCollection('finance');
}

// --- ATTENDANCE ---
export async function getAttendance() {
  if (isFirebaseConfigured()) {
    try {
      const fb = await getFirebase();
      const fs = await import(/* @vite-ignore */ 'firebase/firestore');
      const db = fs.getFirestore(fb.app);
      const snapshot = await fs.getDocs(fs.collection(db, 'attendance'));
      const results = [];
      snapshot.forEach(docItem => results.push({ id: docItem.id, ...docItem.data() }));
      if (results.length > 0) return results;
    } catch (e) {
      /* fallback */
    }
  }
  return simFirestore.getCollection('attendance');
}

// --- SETTINGS ---
export async function getSettings() {
  if (isFirebaseConfigured()) {
    try {
      const fb = await getFirebase();
      const db = getFirestore(fb.app);
      const docRef = doc(db, 'settings', 'global_factory_settings');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) return docSnap.data();
    } catch (e) {
      /* fallback */
    }
  }
  return simFirestore.getDocument('settings', 'global_factory_settings') || {
    factoryName: 'Smart Steel Manufacturing Plant',
    tempThreshold: 1500.0,
    healthWarningLimit: 75,
    vibrationMax: 4.5,
    operatingTimeStart: '06:00',
    operatingTimeEnd: '22:00'
  };
}

export async function updateSettings(updates) {
  if (isFirebaseConfigured()) {
    try {
      const fb = await getFirebase();
      const db = getFirestore(fb.app);
      const docRef = doc(db, 'settings', 'global_factory_settings');
      await setDoc(docRef, updates, { merge: true });
    } catch (e) {
      /* fallback */
    }
  }
  return simFirestore.updateDocument('settings', 'global_factory_settings', updates);
}

// --- MANUFACTURING STAGES ---
export async function getManufacturingStages() {
  if (isFirebaseConfigured()) {
    try {
      const fb = await getFirebase();
      const db = getFirestore(fb.app);
      const snapshot = await getDocs(collection(db, 'manufacturingStages'));
      const results = [];
      snapshot.forEach(docItem => results.push({ id: docItem.id, ...docItem.data() }));
      if (results.length > 0) return results.sort((a,b) => a.stageNumber - b.stageNumber);
    } catch (e) {
      /* fallback */
    }
  }
  const stages = await simFirestore.getCollection('manufacturingStages');
  return stages.sort((a,b) => a.stageNumber - b.stageNumber);
}

// --- NOTIFICATIONS ---
export async function getNotifications() {
  if (isFirebaseConfigured()) {
    try {
      const fb = await getFirebase();
      const db = getFirestore(fb.app);
      const snapshot = await getDocs(collection(db, 'notifications'));
      const results = [];
      snapshot.forEach(docItem => results.push({ id: docItem.id, ...docItem.data() }));
      if (results.length > 0) return results;
    } catch (e) {
      /* fallback */
    }
  }
  return simFirestore.getCollection('notifications');
}

export async function addNotification(notifData) {
  const notifId = notifData.id || `NOTIF-${Date.now().toString().slice(-6)}`;
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const newNotif = {
    id: notifId,
    timestamp,
    read: false,
    severity: 'red',
    severityLabel: 'Critical',
    ...notifData
  };

  if (isFirebaseConfigured()) {
    try {
      const fb = await getFirebase();
      const db = getFirestore(fb.app);
      await setDoc(doc(db, 'notifications', notifId), newNotif, { merge: true });
    } catch (e) {
      /* fallback */
    }
  }
  return simFirestore.addDocument('notifications', newNotif);
}

// --- MANUAL MACHINE CONTROL & POWER TOGGLE ---
export async function toggleMachinePower(machineId, newPower) {
  const isPowerOff = newPower === 'OFF';
  const newStatus = isPowerOff ? 'Offline' : 'Running';

  // 1. Fetch current machine
  let machine = null;
  if (isFirebaseConfigured()) {
    try {
      const fb = await getFirebase();
      const db = getFirestore(fb.app);
      const docRef = doc(db, 'machines', machineId);
      const snap = await getDoc(docRef);
      if (snap.exists()) machine = { id: snap.id, ...snap.data() };
    } catch (e) { /* fallback */ }
  }
  if (!machine) {
    machine = await simFirestore.getDocument('machines', machineId);
  }

  const updates = {
    power: newPower,
    status: newStatus
  };

  // 2. Save Machine
  await saveMachine({ ...(machine || {}), machineId, ...updates });

  // 3. Trigger Notification when Power turns OFF
  if (isPowerOff) {
    await addNotification({
      title: `${machine?.machineName || machineId} Stopped Unexpectedly`,
      message: `Power for ${machine?.machineName || machineId} (${machine?.stageName || 'Factory Floor'}) was toggled OFF. Production in this stage is halted.`,
      severity: 'red',
      severityLabel: 'Critical',
      machineId,
      stageName: machine?.stageName || 'Factory Stage'
    });
  } else {
    await addNotification({
      title: `${machine?.machineName || machineId} Powered ON`,
      message: `${machine?.machineName || machineId} power restored. Stage production resumed.`,
      severity: 'green',
      severityLabel: 'Normal',
      machineId,
      stageName: machine?.stageName || 'Factory Stage'
    });
  }

  return { success: true, power: newPower, status: newStatus };
}

export async function updateMachineStatus(machineId, newStatus) {
  let machine = null;
  if (isFirebaseConfigured()) {
    try {
      const fb = await getFirebase();
      const db = getFirestore(fb.app);
      const docRef = doc(db, 'machines', machineId);
      const snap = await getDoc(docRef);
      if (snap.exists()) machine = { id: snap.id, ...snap.data() };
    } catch (e) { /* fallback */ }
  }
  if (!machine) {
    machine = await simFirestore.getDocument('machines', machineId);
  }

  const power = newStatus === 'Offline' ? 'OFF' : 'ON';
  const updates = { status: newStatus, power };

  await saveMachine({ ...(machine || {}), machineId, ...updates });

  if (newStatus === 'Offline' || newStatus === 'Maintenance') {
    const isMaint = newStatus === 'Maintenance';
    await addNotification({
      title: `${machine?.machineName || machineId} ${isMaint ? 'Requires Maintenance' : 'Stopped'}`,
      message: `${machine?.machineName || machineId} status set to ${newStatus} in ${machine?.stageName || 'Stage'}.`,
      severity: isMaint ? 'orange' : 'red',
      severityLabel: isMaint ? 'Maintenance Required' : 'Critical',
      machineId,
      stageName: machine?.stageName || 'Factory Stage'
    });
  }

  return { success: true, status: newStatus };
}

