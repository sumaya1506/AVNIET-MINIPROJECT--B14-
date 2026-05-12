/* ============================================================
   API UTILITY — frontend/js/api.js
   Central fetch wrapper with JWT auth
   FIX: Removed duplicate clearAuth declaration (was SyntaxError)
   FIX: BASE URL configurable via window.API_BASE or env detection
   ============================================================ */

const BASE = (typeof window !== 'undefined' && window.API_BASE)
  ? window.API_BASE
  : 'http://localhost:5000/api';

// ── Token helpers ──────────────────────────────────────────
const getToken = () => localStorage.getItem('ps_token');
const getUser  = () => JSON.parse(localStorage.getItem('ps_user') || 'null');
const getRole  = () => localStorage.getItem('ps_role');

const setAuth = (token, user, role) => {
  localStorage.setItem('ps_token', token);
  localStorage.setItem('ps_user', JSON.stringify(user));
  localStorage.setItem('ps_role', role);
};

// FIX: Only one definition of clearAuth (was declared twice → SyntaxError)
const clearAuth = () => {
  localStorage.removeItem('ps_token');
  localStorage.removeItem('ps_user');
  localStorage.removeItem('ps_role');
  sessionStorage.clear();
};

// ── Core request ───────────────────────────────────────────
async function api(method, path, data = null, isFormData = false) {
  const opts = { method, headers: {} };
  const token = getToken();
  if (token) opts.headers['Authorization'] = `Bearer ${token}`;

  if (data) {
    if (isFormData) {
      opts.body = data; // Let browser set Content-Type with boundary
    } else {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(data);
    }
  }

  const res  = await fetch(`${BASE}${path}`, opts);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Request failed');
  return json;
}

// ── Public API object ──────────────────────────────────────
const API = {
  get:        (path)            => api('GET',    path),
  post:       (path, data)      => api('POST',   path, data),
  put:        (path, data)      => api('PUT',    path, data),
  del:        (path)            => api('DELETE', path),
  upload:     (path, formData)  => api('PUT',    path, formData, true),
  uploadPost: (path, formData)  => api('POST',   path, formData, true),
  getToken,
  getUser,
  getRole,
  setAuth,
  clearAuth,
};

window.API = API;
