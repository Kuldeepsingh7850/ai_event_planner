import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth, API_BASE_URL } from './AuthContext';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);
  const { user, authFetch } = useAuth();

  // Load and refresh notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await authFetch('/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err.message);
    }
  }, [user, authFetch]);

  // Mark notifications read
  const markAllAsRead = async () => {
    if (!user) return;
    try {
      const res = await authFetch('/notifications/read', { method: 'PUT' });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, status: 'read' })));
      }
    } catch (err) {
      console.error('Error marking notifications as read:', err.message);
    }
  };

  // Setup polling for alerts (budget limits, reminders) every 5 seconds
  useEffect(() => {
    fetchNotifications();
    if (!user) return;

    const interval = setInterval(() => {
      fetchNotifications();
    }, 5000);

    return () => clearInterval(interval);
  }, [user, fetchNotifications]);

  // Toast builder
  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);

    // Auto remove after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  const value = {
    notifications,
    unreadCount,
    fetchNotifications,
    markAllAsRead,
    toasts,
    showToast,
    removeToast
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* Toast Render overlay */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            onClick={() => removeToast(toast.id)}
            className={`flex items-center justify-between p-4 rounded-xl shadow-lg border cursor-pointer transform transition-all duration-300 translate-x-0 animate-slide-in hover:scale-102 ${
              toast.type === 'success'
                ? 'bg-[#0f1d1a]/95 border-emerald-500/35 text-emerald-300'
                : toast.type === 'error'
                ? 'bg-[#241315]/95 border-rose-500/35 text-rose-300'
                : toast.type === 'warning'
                ? 'bg-[#231b11]/95 border-amber-500/35 text-amber-300'
                : 'bg-[#151c2c]/95 border-indigo-500/35 text-indigo-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {toast.type === 'success' && '✨'}
                {toast.type === 'error' && '❌'}
                {toast.type === 'warning' && '⚠️'}
                {toast.type === 'info' && 'ℹ️'}
              </span>
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
            <button className="text-gray-400 hover:text-white text-xs ml-4 font-bold">✕</button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
