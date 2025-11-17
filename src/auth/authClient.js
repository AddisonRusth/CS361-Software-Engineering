// Simple client for auth-service
const AUTH_BASE = import.meta.env.VITE_AUTH_BASE || "https://localhost:5047";

function getTokens() {
  const raw = localStorage.getItem('authTokens');
  return raw ? JSON.parse(raw) : null;
}
function setTokens(tokens) {
  localStorage.setItem('authTokens', JSON.stringify(tokens));
}
function clearTokens() {
  localStorage.removeItem('authTokens');
}

export async function login(email, password) {
  const res = await fetch(`${AUTH_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('invalid_credentials');
  const data = await res.json();
  setTokens({ access: data.access_token, refresh: data.refresh_token, exp: Date.now() + data.expires_in * 1000 });
  return data;
}

export async function refresh() {
  const tokens = getTokens();
  if (!tokens?.refresh) throw new Error('no_refresh');
  const res = await fetch(`${AUTH_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: tokens.refresh }),
  });
  if (!res.ok) {
    clearTokens();
    throw new Error('refresh_failed');
  }
  const data = await res.json();
  setTokens({ ...tokens, access: data.access_token, exp: Date.now() + data.expires_in * 1000 });
  return data;
}

export function logout() {
  const tokens = getTokens();
  clearTokens();
  if (tokens?.refresh) {
    fetch(`${AUTH_BASE}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: tokens.refresh })
    }).catch(()=>{});
  }
}

export async function authFetch(url, options = {}) {
  let tokens = getTokens();
  if (!tokens?.access) throw new Error('not_authenticated');
  // Refresh if expired (buffer 10s)
  if (Date.now() > (tokens.exp - 10000)) {
    await refresh();
    tokens = getTokens();
  }
  const headers = { ...(options.headers || {}), Authorization: `Bearer ${tokens.access}` };
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    await refresh();
    const t2 = getTokens();
    const headers2 = { ...(options.headers || {}), Authorization: `Bearer ${t2.access}` };
    return fetch(url, { ...options, headers: headers2 });
  }
  return res;
}

export function isLoggedIn() {
  const t = getTokens();
  return !!t?.access && Date.now() < (t.exp - 10000);
}
