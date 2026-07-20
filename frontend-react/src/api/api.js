const API_BASE = '/api';

function getStoredToken() {
  return localStorage.getItem('sf_token') || sessionStorage.getItem('sf_token');
}

function clearStoredAuth() {
  localStorage.removeItem('sf_token');
  localStorage.removeItem('sf_user');
  sessionStorage.removeItem('sf_token');
  sessionStorage.removeItem('sf_user');
}

async function request(path, opts = {}) {
  const token = getStoredToken();
  const headers = { 'Content-Type': 'application/json', ...opts.headers };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const r = await fetch(API_BASE + path, { ...opts, headers });
  if (r.status === 401) {
    clearStoredAuth();
    window.location.href = '/login';
    return null;
  }
  return r.json();
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  del: (path) => request(path, { method: 'DELETE' }),

  upload: async (path, formData) => {
    const token = getStoredToken();
    const headers = {};
    if (token) headers['Authorization'] = 'Bearer ' + token;
    const r = await fetch(API_BASE + path, { method: 'POST', headers, body: formData });
    if (r.status === 401) { window.location.href = '/auth'; return null; }
    return r.json();
  },
};
