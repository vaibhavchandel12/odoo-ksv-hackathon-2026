import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role_id: string;
  role?: Role;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (userData: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get<User>('/users/me');
      if (res.data && res.data.id) {
        setUser(res.data);
        localStorage.setItem('user_role', res.data.role?.name || '');
      } else {
        // Clear corrupt or expired session
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_role');
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post<{ access_token: string; refresh_token: string }>('/auth/login', {
      email,
      password,
    });

    if (res.data) {
      localStorage.setItem('access_token', res.data.access_token);
      localStorage.setItem('refresh_token', res.data.refresh_token);
      
      const userRes = await api.get<User>('/users/me');
      if (userRes.data) {
        setUser(userRes.data);
        localStorage.setItem('user_role', userRes.data.role?.name || '');
        return { success: true };
      } else {
        return { success: false, error: 'Logged in successfully, but profile retrieval failed.' };
      }
    } else {
      return { success: false, error: res.error || 'Invalid email or password.' };
    }
  };

  const signup = async (userData: any) => {
    const res = await api.post<{ access_token: string; refresh_token: string }>('/auth/signup', userData);

    if (res.data) {
      localStorage.setItem('access_token', res.data.access_token);
      localStorage.setItem('refresh_token', res.data.refresh_token);
      
      const userRes = await api.get<User>('/users/me');
      if (userRes.data) {
        setUser(userRes.data);
        localStorage.setItem('user_role', userRes.data.role?.name || '');
        return { success: true };
      } else {
        return { success: false, error: 'Registration complete, but failed to load profile.' };
      }
    } else {
      return { success: false, error: res.error || 'Registration failed.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
