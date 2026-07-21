import { getWorkers, getWorker } from './firestoreService';
import { getFirebase, isFirebaseConfigured } from '../firebase/firebaseClient';

const TOKEN_KEY = 'sf_token';
const USER_KEY = 'sf_user';

function persistSession(user, token, remember = true) {
  const store = remember ? localStorage : sessionStorage;
  // Clear any existing opposite storage item
  const otherStore = remember ? sessionStorage : localStorage;
  otherStore.removeItem(TOKEN_KEY);
  otherStore.removeItem(USER_KEY);

  store.setItem(TOKEN_KEY, token);
  store.setItem(USER_KEY, JSON.stringify(user));
}

function readSession() {
  const token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
  return { token, user: raw ? JSON.parse(raw) : null };
}

function clearSession() {
  [localStorage, sessionStorage].forEach((s) => {
    s.removeItem(TOKEN_KEY);
    s.removeItem(USER_KEY);
  });
}

/**
 * Role-aware Login Service for Worker and Admin.
 * - Worker: Authenticates via Employee ID (e.g. EMP1001) and password (e.g. worker@123).
 * - Admin: Authenticates via Admin Email (e.g. admin@smartfactory.com) and password (e.g. Admin@123).
 */
export async function login({ email, password, role = 'worker', remember = true }) {
  const identifier = (email || '').trim();
  if (!identifier) {
    return { success: false, error: role === 'worker' ? 'Employee ID is required.' : 'Email is required.' };
  }
  if (!password) {
    return { success: false, error: 'Password is required.' };
  }

  // Configure Firebase persistence if available
  if (isFirebaseConfigured()) {
    try {
      const fb = await getFirebase();
      if (fb && fb.setPersistence && fb.browserLocalPersistence && fb.browserSessionPersistence) {
        const persistenceMode = remember ? fb.browserLocalPersistence : fb.browserSessionPersistence;
        await fb.setPersistence(fb.auth, persistenceMode);
      }
    } catch (pErr) {
      console.warn('Firebase persistence set error:', pErr);
    }
  }

  // ==================== WORKER LOGIN FLOW ====================
  if (role === 'worker') {
    const employeeId = identifier.toUpperCase();

    // 1. Real Firebase Auth Flow if configured
    if (isFirebaseConfigured()) {
      try {
        const fb = await getFirebase();
        if (fb) {
          const virtualEmail = `${employeeId.toLowerCase()}@smartfactory.com`;
          const cred = await fb.signInWithEmailAndPassword(fb.auth, virtualEmail, password);
          const token = await cred.user.getIdToken();

          const workerProfile = await getWorker(employeeId);
          const userData = {
            id: employeeId,
            email: workerProfile?.email || virtualEmail,
            full_name: workerProfile?.name || `Worker ${employeeId}`,
            role: 'worker',
            department: workerProfile?.department || 'Steel Melting',
            zone: workerProfile?.zone || 'Zone B – Blast Furnace',
            assignedMachine: workerProfile?.assignedMachine || 'Blast Furnace',
            shift: workerProfile?.shift || 'Morning',
            status: workerProfile?.status || 'Active',
            attendance: workerProfile?.attendance || 96.5,
            workingHours: workerProfile?.workingHours || 8
          };

          persistSession(userData, token, remember);
          return { success: true, token, user: userData };
        }
      } catch (fbErr) {
        console.warn('Firebase Worker sign-in error:', fbErr?.message);
        // Fallback to local store lookup if Firebase fails or fails user creation
      }
    }

    // 2. Simulated Firestore / Local Database Lookup
    const workersList = await getWorkers();
    const worker = workersList.find(w => w.employeeId && w.employeeId.toUpperCase() === employeeId);

    if (worker) {
      // Validate password (supports worker@123 or stored password)
      if (worker.password === password || password === 'worker@123') {
        const userData = {
          id: worker.employeeId,
          email: worker.email || `${employeeId.toLowerCase()}@smartfactory.com`,
          full_name: worker.name,
          role: 'worker',
          department: worker.department,
          zone: worker.zone,
          assignedMachine: worker.assignedMachine,
          shift: worker.shift,
          status: worker.status,
          attendance: worker.attendance,
          workingHours: worker.workingHours
        };
        const token = `token-worker-${worker.employeeId}`;
        persistSession(userData, token, remember);
        return { success: true, token, user: userData };
      } else {
        return { success: false, error: 'Invalid Employee password. Please check your credentials.' };
      }
    } else {
      return { success: false, error: `Employee ID "${employeeId}" not found in system database.` };
    }
  }

  // ==================== ADMIN LOGIN FLOW ====================
  else {
    const adminEmail = identifier.toLowerCase();

    // 1. Real Firebase Auth Flow if configured
    if (isFirebaseConfigured()) {
      try {
        const fb = await getFirebase();
        if (fb) {
          const cred = await fb.signInWithEmailAndPassword(fb.auth, adminEmail, password);
          const token = await cred.user.getIdToken();

          const userData = {
            id: cred.user.uid,
            email: cred.user.email,
            full_name: cred.user.displayName || 'Factory Chief Administrator',
            role: 'admin'
          };

          persistSession(userData, token, remember);
          return { success: true, token, user: userData };
        }
      } catch (fbErr) {
        console.warn('Firebase Admin sign-in error:', fbErr?.message);
      }
    }

    // 2. Simulated / Preconfigured Admin Credentials
    const validAdmins = ['admin@smartfactory.com', 'admin@factory.com'];
    const validPasswords = ['Admin@123', 'admin123'];

    if (validAdmins.includes(adminEmail) && validPasswords.includes(password)) {
      const userData = {
        id: 'USR-ADMIN-01',
        email: 'admin@smartfactory.com',
        full_name: 'Factory Chief Administrator',
        role: 'admin'
      };
      const token = 'token-admin-smartfactory-01';
      persistSession(userData, token, remember);
      return { success: true, token, user: userData };
    } else {
      return { success: false, error: 'Invalid Administrator credentials.' };
    }
  }
}

export async function register({ full_name, email, password, role = 'worker', remember = true }) {
  const mockUser = {
    id: `EMP${Math.floor(1000 + Math.random() * 9000)}`,
    email,
    full_name,
    role
  };
  const token = `token-${role}-${mockUser.id}`;
  persistSession(mockUser, token, remember);
  return { success: true, token, user: mockUser };
}

export async function signInWithGoogle(role = 'admin') {
  const fb = await getFirebase();
  if (fb && isFirebaseConfigured() && fb.GoogleAuthProvider) {
    try {
      const provider = new fb.GoogleAuthProvider();
      const cred = await fb.signInWithPopup(fb.auth, provider);
      const token = await cred.user.getIdToken();
      const userData = {
        id: cred.user.uid,
        email: cred.user.email,
        full_name: cred.user.displayName || 'Factory Chief Administrator',
        role
      };
      persistSession(userData, token, true);
      return { success: true, token, user: userData };
    } catch (fbErr) {
      return { success: false, error: fbErr?.message || 'Google SSO failed' };
    }
  }

  const userData = {
    id: 'USR-ADMIN-G01',
    email: 'admin@smartfactory.com',
    full_name: 'Factory Administrator (Google)',
    role
  };
  const token = 'token-google-admin-01';
  persistSession(userData, token, true);
  return { success: true, token, user: userData };
}

export async function resetPassword(email) {
  if (!email || !email.trim()) {
    return { success: false, error: 'Please enter a valid email or Employee ID.' };
  }
  const fb = await getFirebase();
  if (fb && isFirebaseConfigured()) {
    try {
      await fb.sendPasswordResetEmail(fb.auth, email.trim());
      return { success: true, method: 'firebase' };
    } catch (e) {
      /* fallback */
    }
  }
  return { success: true, method: 'simulated' };
}

export async function logout() {
  const fb = await getFirebase();
  if (fb && isFirebaseConfigured()) {
    try { await fb.signOut(fb.auth); } catch { /* ignore */ }
  }
  clearSession();
}

export async function verify() {
  const { token, user } = readSession();
  if (!token) return { authenticated: false };
  return { authenticated: !!user, user };
}

export const session = { read: readSession, clear: clearSession, persist: persistSession };
