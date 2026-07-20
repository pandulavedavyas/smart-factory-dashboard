/* Firebase Auth */
let firebaseInitialized = false;

function switchLoginTab(tab) {
  document.querySelectorAll('.login-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.login-form').forEach(f => f.style.display = 'none');
  document.getElementById(tab === 'login' ? 'loginForm' : 'registerForm').style.display = 'block';
  event.target.classList.add('active');
}

async function login() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  if (!email || !password) return showToast('Please fill in all fields', 'error');
  try {
    showToast('Signing in...', 'info');
    const result = await firebase.auth().signInWithEmailAndPassword(email, password);
    const token = await result.user.getIdToken();
    const data = await API.post('/auth/login', { id_token: token });
    showToast('Welcome back!');
    window.location.href = '/dashboard';
  } catch (e) { showToast(e.message || 'Login failed', 'error'); }
}

async function register() {
  const name = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;
  if (!name || !email || !password) return showToast('Please fill in all fields', 'error');
  try {
    showToast('Creating account...', 'info');
    const data = await API.post('/auth/register', { email, password, full_name: name });
    showToast('Account created! You can now sign in.');
    switchLoginTab('login');
  } catch (e) { showToast(e.message || 'Registration failed', 'error'); }
}

// Initialize Firebase if config exists
document.addEventListener('DOMContentLoaded', () => {
  if (typeof firebase !== 'undefined' && firebase.apps.length) {
    firebaseInitialized = true;
  }
});