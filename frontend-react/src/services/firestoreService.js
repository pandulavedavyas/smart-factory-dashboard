import { isFirebaseConfigured, getFirebase } from '../firebase/firebaseClient';

// Helper to simulate network latency for realistic loading states
const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

// ==========================================
// SEED DATA DEFINITIONS
// ==========================================

const DEFAULT_WORKERS = [
  {
    employeeId: 'W-001',
    name: 'James Wilson',
    email: 'james.wilson@factory.com',
    password: 'worker123',
    department: 'CNC Operations',
    zone: 'Assembly',
    assignedMachine: 'CNC Lathe A1',
    shift: 'Morning',
    status: 'Active',
    attendance: 97.5,
    workingHours: 8,
    performance: 92,
    role: 'worker'
  },
  {
    employeeId: 'W-002',
    name: 'Sarah Chen',
    email: 'sarah.chen@factory.com',
    password: 'worker123',
    department: 'Quality Assurance',
    zone: 'Quality Control',
    assignedMachine: 'Assembly R1',
    shift: 'Morning',
    status: 'Active',
    attendance: 99.0,
    workingHours: 7.5,
    performance: 88,
    role: 'worker'
  },
  {
    employeeId: 'W-003',
    name: 'Michael Brown',
    email: 'michael.brown@factory.com',
    password: 'worker123',
    department: 'Maintenance Tech',
    zone: 'Maintenance',
    assignedMachine: 'Press P1',
    shift: 'Afternoon',
    status: 'Break',
    attendance: 94.0,
    workingHours: 8.5,
    performance: 85,
    role: 'worker'
  },
  {
    employeeId: 'W-004',
    name: 'Emily Davis',
    email: 'emily.davis@factory.com',
    password: 'worker123',
    department: 'Assembly Lead',
    zone: 'Assembly',
    assignedMachine: 'Packaging L1',
    shift: 'Afternoon',
    status: 'Active',
    attendance: 96.0,
    workingHours: 8,
    performance: 90,
    role: 'worker'
  },
  {
    employeeId: 'W-005',
    name: 'David Martinez',
    email: 'david.martinez@factory.com',
    password: 'worker123',
    department: 'Press Operator',
    zone: 'Production',
    assignedMachine: 'CNC Mill B2',
    shift: 'Night',
    status: 'Offline',
    attendance: 91.0,
    workingHours: 0,
    performance: 78,
    role: 'worker'
  },
  {
    employeeId: 'W-006',
    name: 'Lisa Anderson',
    email: 'lisa.anderson@factory.com',
    password: 'worker123',
    department: 'Logistics Manager',
    zone: 'Warehouse',
    assignedMachine: 'None',
    shift: 'Morning',
    status: 'Active',
    attendance: 98.5,
    workingHours: 8,
    performance: 94,
    role: 'worker'
  }
];

const DEFAULT_MACHINES = [
  {
    machineName: 'CNC Lathe A1',
    machineId: 'M-001',
    zone: 'Assembly',
    temperature: 68.2,
    status: 'Running',
    health: 92,
    workingHours: 4520,
    assignedOperator: 'James Wilson',
    currentShift: 'Morning',
    lastMaintenance: '2026-07-10'
  },
  {
    machineName: 'CNC Mill B2',
    machineId: 'M-002',
    zone: 'Production',
    temperature: 72.1,
    status: 'Running',
    health: 88,
    workingHours: 3800,
    assignedOperator: 'David Martinez',
    currentShift: 'Night',
    lastMaintenance: '2026-07-12'
  },
  {
    machineName: 'Press P1',
    machineId: 'M-003',
    zone: 'Production',
    temperature: 55.3,
    status: 'Running',
    health: 78,
    workingHours: 6100,
    assignedOperator: 'Michael Brown',
    currentShift: 'Afternoon',
    lastMaintenance: '2026-06-28'
  },
  {
    machineName: 'Assembly R1',
    machineId: 'M-004',
    zone: 'Assembly',
    temperature: 38.0,
    status: 'Running',
    health: 96,
    workingHours: 1900,
    assignedOperator: 'Sarah Chen',
    currentShift: 'Morning',
    lastMaintenance: '2026-07-15'
  },
  {
    machineName: 'Packaging L1',
    machineId: 'M-005',
    zone: 'Packaging',
    temperature: 32.0,
    status: 'Idle',
    health: 93,
    workingHours: 1500,
    assignedOperator: 'Emily Davis',
    currentShift: 'Afternoon',
    lastMaintenance: '2026-07-18'
  },
  {
    machineName: 'Laser Cutter L1',
    machineId: 'M-006',
    zone: 'Production',
    temperature: 84.5,
    status: 'Maintenance',
    health: 45,
    workingHours: 3200,
    assignedOperator: 'None',
    currentShift: 'None',
    lastMaintenance: '2026-07-20'
  }
];

const DEFAULT_PRODUCTION = [
  { id: 'prod-001', date: '2026-07-15', quantity: 1250, target: 1500, shift: 'Morning', machineId: 'M-001', efficiency: 83.3, scrapQty: 15 },
  { id: 'prod-002', date: '2026-07-16', quantity: 1400, target: 1500, shift: 'Morning', machineId: 'M-001', efficiency: 93.3, scrapQty: 8 },
  { id: 'prod-003', date: '2026-07-17', quantity: 1350, target: 1500, shift: 'Morning', machineId: 'M-001', efficiency: 90.0, scrapQty: 10 },
  { id: 'prod-004', date: '2026-07-18', quantity: 1550, target: 1500, shift: 'Morning', machineId: 'M-001', efficiency: 103.3, scrapQty: 5 },
  { id: 'prod-005', date: '2026-07-19', quantity: 980, target: 1200, shift: 'Afternoon', machineId: 'M-003', efficiency: 81.6, scrapQty: 22 },
  { id: 'prod-006', date: '2026-07-20', quantity: 1150, target: 1200, shift: 'Afternoon', machineId: 'M-003', efficiency: 95.8, scrapQty: 14 },
  { id: 'prod-007', date: '2026-07-21', quantity: 720, target: 1000, shift: 'Night', machineId: 'M-002', efficiency: 72.0, scrapQty: 30 }
];

const DEFAULT_REPORTS = [
  { id: 'rep-001', name: 'Shift A Production Audit', type: 'Production', dateCreated: '2026-07-18', status: 'Generated', fileUrl: '#' },
  { id: 'rep-002', name: 'Weekly Maintenance Summary', type: 'Machine', dateCreated: '2026-07-19', status: 'Generated', fileUrl: '#' },
  { id: 'rep-003', name: 'Employee Hours Ledger Q2', type: 'Attendance', dateCreated: '2026-07-20', status: 'Generated', fileUrl: '#' }
];

const DEFAULT_SETTINGS = {
  factoryName: 'AI Smart Factory Technology HQ',
  tempThreshold: 85.0,
  healthWarningLimit: 60,
  vibrationMax: 4.5,
  operatingTimeStart: '06:00',
  operatingTimeEnd: '22:00',
  shifts: [
    { name: 'Morning', start: '06:00', end: '14:00', supervisor: 'Lisa Anderson' },
    { name: 'Afternoon', start: '14:00', end: '22:00', supervisor: 'Emma Wilson' },
    { name: 'Night', start: '22:00', end: '06:00', supervisor: 'Sarah Chen' }
  ]
};

// ==========================================
// SIMULATED FIRESTORE DRIVER (LocalStorage)
// ==========================================

class SimulatedFirestore {
  constructor() {
    this.storageKey = 'smartfactory_firestore_db';
    this.init();
  }

  init() {
    if (!localStorage.getItem(this.storageKey)) {
      const db = {
        workers: DEFAULT_WORKERS,
        machines: DEFAULT_MACHINES,
        production: DEFAULT_PRODUCTION,
        reports: DEFAULT_REPORTS,
        settings: DEFAULT_SETTINGS
      };
      localStorage.setItem(this.storageKey, JSON.stringify(db));
    }
  }

  getDb() {
    return JSON.parse(localStorage.getItem(this.storageKey));
  }

  saveDb(db) {
    localStorage.setItem(this.storageKey, JSON.stringify(db));
  }

  async getCollection(colName) {
    await delay();
    return this.getDb()[colName] || [];
  }

  async addDocument(colName, docData) {
    await delay();
    const db = this.getDb();
    const id = docData.id || docData.employeeId || docData.machineId || colName.slice(0, 3) + '-' + Math.random().toString(36).substr(2, 9);
    const newDoc = { ...docData, id };
    db[colName] = [...(db[colName] || []), newDoc];
    this.saveDb(db);
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
      this.saveDb(db);
      return list[index];
    }
    throw new Error(`Document ${docId} not found in ${colName}`);
  }

  async deleteDocument(colName, docId) {
    await delay();
    const db = this.getDb();
    db[colName] = (db[colName] || []).filter(d => (d.id !== docId && d.employeeId !== docId && d.machineId !== docId));
    this.saveDb(db);
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
// CENTRALIZED SERVICE LAYER
// ==========================================

export async function getWorkers() {
  if (isFirebaseConfigured()) {
    try {
      const fb = await getFirebase();
      const fs = await import(/* @vite-ignore */ 'firebase/firestore');
      const db = fs.getFirestore(fb.app);
      const q = fs.query(fs.collection(db, 'workers'));
      const snapshot = await fs.getDocs(q);
      const results = [];
      snapshot.forEach(doc => {
        results.push({ id: doc.id, ...doc.data() });
      });
      if (results.length === 0) {
        for (const worker of DEFAULT_WORKERS) {
          await fs.setDoc(fs.doc(db, 'workers', worker.employeeId), worker);
          results.push(worker);
        }
      }
      return results;
    } catch (e) {
      console.warn('Real Firebase call failed, falling back to simulated:', e);
      return simFirestore.getCollection('workers');
    }
  }
  return simFirestore.getCollection('workers');
}

export async function getWorker(employeeId) {
  if (isFirebaseConfigured()) {
    try {
      const fb = await getFirebase();
      const fs = await import(/* @vite-ignore */ 'firebase/firestore');
      const db = fs.getFirestore(fb.app);
      const docRef = fs.doc(db, 'workers', employeeId);
      const docSnap = await fs.getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (e) {
      return simFirestore.getDocument('workers', employeeId);
    }
  }
  return simFirestore.getDocument('workers', employeeId);
}

export async function saveWorker(worker) {
  const id = worker.id || worker.employeeId;
  if (isFirebaseConfigured()) {
    try {
      const fb = await getFirebase();
      const fs = await import(/* @vite-ignore */ 'firebase/firestore');
      const db = fs.getFirestore(fb.app);
      await fs.setDoc(fs.doc(db, 'workers', id), worker, { merge: true });
      return worker;
    } catch (e) {
      return simFirestore.addDocument('workers', worker);
    }
  }
  const existing = await simFirestore.getDocument('workers', id);
  if (existing) {
    return simFirestore.updateDocument('workers', id, worker);
  } else {
    return simFirestore.addDocument('workers', worker);
  }
}

export async function deleteWorker(employeeId) {
  if (isFirebaseConfigured()) {
    try {
      const fb = await getFirebase();
      const fs = await import(/* @vite-ignore */ 'firebase/firestore');
      const db = fs.getFirestore(fb.app);
      await fs.deleteDoc(fs.doc(db, 'workers', employeeId));
      return true;
    } catch (e) {
      return simFirestore.deleteDocument('workers', employeeId);
    }
  }
  return simFirestore.deleteDocument('workers', employeeId);
}

export async function getMachines() {
  if (isFirebaseConfigured()) {
    try {
      const fb = await getFirebase();
      const fs = await import(/* @vite-ignore */ 'firebase/firestore');
      const db = fs.getFirestore(fb.app);
      const snapshot = await fs.getDocs(fs.collection(db, 'machines'));
      const results = [];
      snapshot.forEach(doc => {
        results.push({ id: doc.id, ...doc.data() });
      });
      if (results.length === 0) {
        for (const mach of DEFAULT_MACHINES) {
          await fs.setDoc(fs.doc(db, 'machines', mach.machineId), mach);
          results.push(mach);
        }
      }
      return results;
    } catch (e) {
      return simFirestore.getCollection('machines');
    }
  }
  return simFirestore.getCollection('machines');
}

export async function saveMachine(machine) {
  const id = machine.id || machine.machineId;
  if (isFirebaseConfigured()) {
    try {
      const fb = await getFirebase();
      const fs = await import(/* @vite-ignore */ 'firebase/firestore');
      const db = fs.getFirestore(fb.app);
      await fs.setDoc(fs.doc(db, 'machines', id), machine, { merge: true });
      return machine;
    } catch (e) {
      return simFirestore.addDocument('machines', machine);
    }
  }
  const existing = await simFirestore.getDocument('machines', id);
  if (existing) {
    return simFirestore.updateDocument('machines', id, machine);
  } else {
    return simFirestore.addDocument('machines', machine);
  }
}

export async function deleteMachine(machineId) {
  if (isFirebaseConfigured()) {
    try {
      const fb = await getFirebase();
      const fs = await import(/* @vite-ignore */ 'firebase/firestore');
      const db = fs.getFirestore(fb.app);
      await fs.deleteDoc(fs.doc(db, 'machines', machineId));
      return true;
    } catch (e) {
      return simFirestore.deleteDocument('machines', machineId);
    }
  }
  return simFirestore.deleteDocument('machines', machineId);
}

export async function getProduction() {
  if (isFirebaseConfigured()) {
    try {
      const fb = await getFirebase();
      const fs = await import(/* @vite-ignore */ 'firebase/firestore');
      const db = fs.getFirestore(fb.app);
      const snapshot = await fs.getDocs(fs.collection(db, 'production'));
      const results = [];
      snapshot.forEach(doc => {
        results.push({ id: doc.id, ...doc.data() });
      });
      if (results.length === 0) {
        for (const prod of DEFAULT_PRODUCTION) {
          await fs.setDoc(fs.doc(db, 'production', prod.id), prod);
          results.push(prod);
        }
      }
      return results;
    } catch (e) {
      return simFirestore.getCollection('production');
    }
  }
  return simFirestore.getCollection('production');
}

export async function addProduction(entry) {
  if (isFirebaseConfigured()) {
    try {
      const fb = await getFirebase();
      const fs = await import(/* @vite-ignore */ 'firebase/firestore');
      const db = fs.getFirestore(fb.app);
      const newRef = fs.doc(fs.collection(db, 'production'));
      const docData = { ...entry, id: newRef.id };
      await fs.setDoc(newRef, docData);
      return docData;
    } catch (e) {
      return simFirestore.addDocument('production', entry);
    }
  }
  return simFirestore.addDocument('production', entry);
}

export async function getReports() {
  if (isFirebaseConfigured()) {
    try {
      const fb = await getFirebase();
      const fs = await import(/* @vite-ignore */ 'firebase/firestore');
      const db = fs.getFirestore(fb.app);
      const snapshot = await fs.getDocs(fs.collection(db, 'reports'));
      const results = [];
      snapshot.forEach(doc => {
        results.push({ id: doc.id, ...doc.data() });
      });
      if (results.length === 0) {
        for (const r of DEFAULT_REPORTS) {
          await fs.setDoc(fs.doc(db, 'reports', r.id), r);
          results.push(r);
        }
      }
      return results;
    } catch (e) {
      return simFirestore.getCollection('reports');
    }
  }
  return simFirestore.getCollection('reports');
}

export async function saveReport(report) {
  if (isFirebaseConfigured()) {
    try {
      const fb = await getFirebase();
      const fs = await import(/* @vite-ignore */ 'firebase/firestore');
      const db = fs.getFirestore(fb.app);
      const newRef = fs.doc(fs.collection(db, 'reports'));
      const docData = { ...report, id: newRef.id };
      await fs.setDoc(newRef, docData);
      return docData;
    } catch (e) {
      return simFirestore.addDocument('reports', report);
    }
  }
  return simFirestore.addDocument('reports', report);
}

export async function getSettings() {
  if (isFirebaseConfigured()) {
    try {
      const fb = await getFirebase();
      const fs = await import(/* @vite-ignore */ 'firebase/firestore');
      const db = fs.getFirestore(fb.app);
      const docRef = fs.doc(db, 'settings', 'global_factory_settings');
      const docSnap = await fs.getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
      await fs.setDoc(docRef, DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    } catch (e) {
      return simFirestore.getDocument('settings', 'global_factory_settings') || DEFAULT_SETTINGS;
    }
  }
  return simFirestore.getDocument('settings', 'global_factory_settings') || DEFAULT_SETTINGS;
}

export async function updateSettings(updates) {
  if (isFirebaseConfigured()) {
    try {
      const fb = await getFirebase();
      const fs = await import(/* @vite-ignore */ 'firebase/firestore');
      const db = fs.getFirestore(fb.app);
      const docRef = fs.doc(db, 'settings', 'global_factory_settings');
      await fs.setDoc(docRef, updates, { merge: true });
      return updates;
    } catch (e) {
      return simFirestore.updateDocument('settings', 'global_factory_settings', updates);
    }
  }
  return simFirestore.updateDocument('settings', 'global_factory_settings', updates);
}
