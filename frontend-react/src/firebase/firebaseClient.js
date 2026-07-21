let _fb = null;
let _initialized = false;

export function isFirebaseConfigured() {
  return !!(import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID);
}

export async function getFirebase() {
  if (_initialized) return _fb;
  _initialized = true;
  if (!isFirebaseConfigured()) return null;
  try {
    const appMod = await import(/* @vite-ignore */ 'firebase/app');
    const authMod = await import(/* @vite-ignore */ 'firebase/auth');
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };
    const app = appMod.initializeApp(firebaseConfig);
    const auth = authMod.getAuth(app);
    _fb = {
      app,
      auth,
      ...authMod
    };
    return _fb;
  } catch (err) {
    console.warn('[firebase] initialization fallback:', err?.message || err);
    return null;
  }
}
