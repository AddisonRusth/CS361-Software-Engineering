import React, { createContext, useContext, useEffect, useState } from 'react';
import { isLoggedIn, login as doLogin, logout as doLogout } from './authClient';

const AuthCtx = createContext(null);
export function useAuth() { return useContext(AuthCtx); }

export default function AuthProvider({ children }) {
  const [authed, setAuthed] = useState(isLoggedIn());

  useEffect(() => {
    const id = setInterval(() => setAuthed(isLoggedIn()), 5000);
    return () => clearInterval(id);
  }, []);

  async function login(email, password) {
    await doLogin(email, password);
    setAuthed(true);
  }

  function logout() {
    doLogout();
    setAuthed(false);
  }

  const value = { authed, login, logout };
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
