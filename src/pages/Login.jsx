import React, { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('medic@example.org');
  const [password, setPassword] = useState('safePass123');
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true); setErr(null);
    try {
      await login(email, password);
      nav('/');
    } catch {
      setErr('Invalid email or password');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '4rem auto', padding: 16, border: '1px solid #ccc', borderRadius: 8 }}>
      <h1>Medic Logger – Login</h1>
      <form onSubmit={onSubmit}>
        <label>Email
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required style={{ display: 'block', width: '100%' }}/>
        </label>
        <label>Password
          <input value={password} onChange={e=>setPassword(e.target.value)} type="password" required style={{ display: 'block', width: '100%' }}/>
        </label>
        {err && <div style={{ color: 'red', marginTop: 8 }}>{err}</div>}
        <button disabled={busy} type="submit" style={{ marginTop: 12 }}>{busy ? 'Signing in…' : 'Sign In'}</button>
      </form>
    </div>
  );
}
