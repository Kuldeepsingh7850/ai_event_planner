import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const AuthContext = createContext();

export const API_BASE_URL = 'http://localhost:5000/api';

export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper for authenticated API requests
  const authFetch = async (url, options = {}) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers
    };

    const response = await fetch(`${API_BASE_URL}${url}`, {
      cache: 'no-store',
      ...options,
      headers
    });

    if (response.status === 401) {
      // Automatic logout on token expiration / unauthorized
      logout();
      throw new Error('Session expired. Please log in again.');
    }

    return response;
  };

  // Sync token and load user profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/profile`, {
          cache: 'no-store',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const profile = await res.json();
          setUser(profile);
        } else {
          // Token is invalid/expired
          localStorage.removeItem('token');
          setUser(null);
        }
      } catch (err) {
        console.error('Error loading user profile on mount:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Save token & user in local storage
      localStorage.setItem('token', data.token);
      setUser({
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        avatar: data.avatar
      });
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  // Register handler
  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Save token & user in local storage
      localStorage.setItem('token', data.token);
      setUser({
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        avatar: data.avatar || null
      });
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  const requestPasswordReset = async (email) => {
    try {
      const res = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to send password reset request');
      }
      return data;
    } catch (err) {
      throw err;
    }
  };

  const updateUserAvatar = (avatar) => {
    if (user) {
      setUser(prev => prev ? { ...prev, avatar } : null);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    requestPasswordReset,
    logout,
    authFetch,
    updateUserAvatar,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
