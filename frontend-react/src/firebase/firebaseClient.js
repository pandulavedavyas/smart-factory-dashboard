// Optional Firebase client.
//
// IMPORTANT (build safety):
// The `firebase` package is NOT a hard dependency. We load it through
// dynamic imports marked with `@vite-ignore` so the production build never
// fails to resolve the module when it is absent. At runtime, if the package
// is installed (npm i firebase) AND the VITE_FIREBASE_* env vars are set,
// real Firebase Auth is used. Otherwise this returns `null` and the app
// transparently falls back to the backend auth endpoints.
//
// Production setup:
//   1. npm install firebase
//   2. create frontend-react/.env with:
//      VITE_FIREBASE_API_KEY=...
//      VITE_FIREBASE_AUTH_DOMAIN=....firebaseapp.com
//      VITE_FIREBASE_PROJECT_ID=...
//      VITE_FIREBASE_APP_ID=...
//   3. (optional) npm install firestore  -> roles are mirrored to Firestore

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
    const app = appMod.initializeApp({
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    });
    const auth = authMod.getAuth(app);
    _fb = { app, auth, ...authMod };
    return _fb;
  } catch (err) {
    console.warn('[firebase] unavailable, using backend auth fallback:', err?.message || err);
    return null;
  }
}
