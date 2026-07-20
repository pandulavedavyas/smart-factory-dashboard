import { getWorkers, getWorker } from './firestoreService';
import { getFirebase, isFirebaseConfigured } from '../firebase/firebaseClient';

const TOKEN_KEY = 'sf_token';
const USER_KEY = 'sf_user';

function persist(user, token, remember) {
  const store = remember ? localStorage : sessionStorage;
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
 * Role-aware login for Worker and Admin.
 * - Worker: Authenticates via Employee ID and password.
 * - Admin: Authenticates via Admin Email and password.
 */
export async function login({ email, password, role = 'worker', remember = true }) {
  const identifier = email?.trim();
  
  if (role === 'worker') {
    const employeeId = identifier.toUpperCase();
    
    // 1. Firebase is Configured Flow
    if (isFirebaseConfigured()) {
      try {
        const fb = await getFirebase();
        if (fb) {
          // Convert Employee ID to virtual email (e.g., w-001@smartfactory.local)
          const virtualEmail = `${employeeId.toLowerCase()}@smartfactory.local`;
          const cred = await fb.signInWithEmailAndPassword(fb.auth, virtualEmail, password);
          const token = await cred.user.getIdToken();
          
          // Get worker profile details from Firestore
          const workerProfile = await getWorker(employeeId);
          if (!workerProfile) {
            return { success: false, error: 'Employee profile not found in database.' };
          }
          
          const userData = {
            id: workerProfile.employeeId,
            email: workerProfile.email,
            full_name: workerProfile.name,
            role: 'worker',
            department: workerProfile.department,
            zone: workerProfile.zone,
            assignedMachine: workerProfile.assignedMachine,
            shift: workerProfile.shift,
            status: workerProfile.status,
            attendance: workerProfile.attendance,
            workingHours: workerProfile.workingHours
          };
          
          persist(userData, token, remember);
          return { success: true, token, user: userData };
        }
      } catch (fbErr) {
        return { success: false, error: fbErr?.message || 'Firebase Worker sign-in failed' };
      }
    }
    
    // 2. Simulated Firestore Flow (Fallback)
    const workersList = await getWorkers();
    const worker = workersList.find(w => w.employeeId.toUpperCase() === employeeId);
    
    if (worker) {
      if (worker.password === password) {
        const userData = {
          id: worker.employeeId,
          email: worker.email,
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
        const token = `mock-worker-token-${worker.employeeId}`;
        persist(userData, token, remember);
        return { success: true, token, user: userData };
      } else {
        return { success: false, error: 'Incorrect Employee password.' };
      }
    } else {
      return { success: false, error: 'Employee ID not recognized.' };
    }
  } 
  
  // Admin Login Flow
  else {
    const adminEmail = identifier.toLowerCase();
    
    // 1. Firebase is Configured Flow
    if (isFirebaseConfigured()) {
      try {
        const fb = await getFirebase();
        if (fb) {
          const cred = await fb.signInWithEmailAndPassword(fb.auth, adminEmail, password);
          const token = await cred.user.getIdToken();
          
          const userData = {
            id: cred.user.uid,
            email: cred.user.email,
            full_name: cred.user.displayName || 'Factory Administrator',
            role: 'admin'
          };
          
          persist(userData, token, remember);
          return { success: true, token, user: userData };
        }
      } catch (fbErr) {
        return { success: false, error: fbErr?.message || 'Admin credentials invalid.' };
      }
    }
    
    // 2. Simulated / Local Admin Flow
    if (adminEmail === 'admin@factory.com' && password === 'admin123') {
      const userData = {
        id: 'ADMIN-01',
        email: 'admin@factory.com',
        full_name: 'Factory Administrator',
        role: 'admin'
      };
      const token = 'mock-admin-token-001';
      persist(userData, token, remember);
      return { success: true, token, user: userData };
    } else {
      return { success: false, error: 'Invalid Administrator credentials.' };
    }
  }
}

export async function register({ full_name, email, password, role = 'worker', remember = true }) {
  // Stub register for compilation safety
  const mockUser = {
    id: `mock-id-${Math.random().toString(36).substr(2, 5)}`,
    email,
    full_name,
    role
  };
  const token = 'mock-register-token';
  persist(mockUser, token, remember);
  return { success: true, token, user: mockUser };
}

export async function signInWithGoogle(role = 'admin') {
  // Stub Google sign in for compilation safety
  const fb = await getFirebase();
  if (fb && isFirebaseConfigured() && fb.GoogleAuthProvider) {
    try {
      const provider = new fb.GoogleAuthProvider();
      const cred = await fb.signInWithPopup(fb.auth, provider);
      const token = await cred.user.getIdToken();
      const userData = {
        id: cred.user.uid,
        email: cred.user.email,
        full_name: cred.user.displayName || 'Factory Administrator',
        role
      };
      persist(userData, token, true);
      return { success: true, token, user: userData };
    } catch (fbErr) {
      return { success: false, error: fbErr?.message || 'Google SSO failed' };
    }
  }

  // Fallback simulated sign in
  const userData = {
    id: 'ADMIN-G-01',
    email: 'admin.google@factory.com',
    full_name: 'Factory Administrator (Google)',
    role
  };
  const token = 'mock-google-token';
  persist(userData, token, true);
  return { success: true, token, user: userData };
}

export async function resetPassword(email) {
  const fb = await getFirebase();
  if (fb && isFirebaseConfigured()) {
    await fb.sendPasswordResetEmail(fb.auth, email);
    return { success: true, method: 'firebase' };
  }
  return { success: true, method: 'email' };
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

export const session = { read: readSession, clear: clearSession, persist };
