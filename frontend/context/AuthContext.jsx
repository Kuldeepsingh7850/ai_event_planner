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
      return data;
    } catch (err) {
      throw err;
    }
  };

  // Login with Google handler
  const loginWithGoogle = async (idToken) => {
    try {
      const res = await fetch(`${API_BASE_URL}/login/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ idToken })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Google login failed');
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
      return data;
    } catch (err) {
      throw err;
    }
  };

  // Register handler
  const register = async (name, email, password) => {
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
      return data;
    } catch (err) {
      throw err;
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/');
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

  const resetPassword = async (token, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, password })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to reset password');
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

  const updateUserName = (name) => {
    if (user) {
      setUser(prev => prev ? { ...prev, name } : null);
    }
  };

  const value = {
    user,
    loading,
    login,
    loginWithGoogle,
    register,
    requestPasswordReset,
    resetPassword,
    logout,
    authFetch,
    updateUserAvatar,
    updateUserName,
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
