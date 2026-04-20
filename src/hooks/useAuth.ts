import { useState, useEffect } from 'react';
import api from '../api/axios';

export interface AuthUser { _id: string; name: string; email: string; role: string; avatar?: string }

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { setLoading(false); return; }
    api.get('/auth/me').then((r) => {
      if (r.data.user.role === 'admin') setUser(r.data.user);
      else { localStorage.removeItem('admin_token'); }
    }).catch(() => localStorage.removeItem('admin_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const r = await api.post('/auth/login', { email, password });
    if (r.data.user.role !== 'admin') throw new Error('Acesso restrito a administradores.');
    localStorage.setItem('admin_token', r.data.token);
    setUser(r.data.user);
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setUser(null);
    window.location.href = '/login';
  };

  return { user, loading, login, logout };
}
