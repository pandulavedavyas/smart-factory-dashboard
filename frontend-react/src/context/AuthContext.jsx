import { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    authService.verify().then((res) => {
      if (!active) return;
      if (res.authenticated) {
        setUser(res.user);
        setRole(res.user.role);
      }
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const login = async (arg1, password, options = {}) => {
    let payload = {};
    if (typeof arg1 === 'object' && arg1 !== null) {
      payload = {
        email: arg1.email,
        password: arg1.password,
        role: arg1.role || 'worker',
        remember: arg1.rememberMe ?? arg1.remember ?? true
      };
    } else {
      payload = {
        email: arg1,
        password,
        role: options.role || 'worker',
        remember: options.rememberMe ?? options.remember ?? true
      };
    }
    const res = await authService.login(payload);
    if (res.success) { setUser(res.user); setRole(res.user.role); }
    return res;
  };

  const register = async (arg1, email, password, options = {}) => {
    let payload = {};
    if (typeof arg1 === 'object' && arg1 !== null) {
      payload = {
        full_name: arg1.full_name,
        email: arg1.email,
        password: arg1.password,
        role: arg1.role || 'worker',
        remember: arg1.rememberMe ?? arg1.remember ?? true
      };
    } else {
      payload = {
        full_name: arg1,
        email,
        password,
        role: options.role || 'worker',
        remember: options.rememberMe ?? options.remember ?? true
      };
    }
    const res = await authService.register(payload);
    if (res.success) { setUser(res.user); setRole(res.user.role); }
    return res;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setRole(null);
    window.location.href = '/';
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    const token = authService.session.read().token;
    if (token) authService.session.persist(updated, token, true);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, login, register, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
