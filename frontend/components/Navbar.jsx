import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Bell, User, LogOut, Calendar, Sun, Moon, 
  Menu, MessageSquare, Search, MapPin, Phone, Mail, ChevronDown 
} from 'lucide-react';
import Link from 'next/link';
import { LogoBrand } from './Logo';

// Local SVG Brand Icons to resolve missing brand exports in lucide-react
const FacebookIcon = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const TwitterIcon = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
  </svg>
);

const LinkedinIcon = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export default function Navbar({ isSidebarOpen, onToggleSidebar }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const notificationsRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotificationsDropdown(prev => {
          if (prev && unreadCount > 0) {
            markAllAsRead();
          }
          return false;
        });
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [unreadCount, markAllAsRead]);

  if (!user) return null;

  const isAdminView = router.pathname.startsWith('/admin') || user?.role === 'admin';

  return (
    <>
      <header className={`fixed top-0 right-0 z-40 flex flex-col border-b border-white/5 shadow-md transition-all duration-300 ${isSidebarOpen ? 'left-0 md:left-64' : 'left-0'}`}>

      {/* 2. Main Navigation Bar */}
      <div className="w-full h-16 glass-panel px-6 flex items-center justify-between">
        {/* Left Section: Mobile Menu Trigger + Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer animate-pulse"
            aria-label="Toggle Sidebar"
            title="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/" className={`flex items-center gap-2 ${isSidebarOpen ? 'md:hidden' : ''}`}>
            <LogoBrand />
          </Link>
        </div>

        {/* Right Section: Action Utilities + User Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Notification Bell */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => {
                if (showNotificationsDropdown && unreadCount > 0) {
                  markAllAsRead();
                }
                setShowNotificationsDropdown(!showNotificationsDropdown);
                setShowProfileDropdown(false);
              }}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors relative cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-rose-500 text-[8px] text-white font-extrabold flex items-center justify-center rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotificationsDropdown && (
              <div className="absolute right-0 mt-2 w-80 glass-panel rounded-xl border border-white/10 shadow-2xl p-4 z-50 animate-scale-up">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <span className="text-xs font-bold">Notifications</span>
                  <span className="text-[10px] text-gray-400 font-semibold">{unreadCount} new</span>
                </div>
                <div className="max-h-60 overflow-y-auto mt-2 flex flex-col gap-2">
                  {notifications.filter(n => n.status === 'unread').length === 0 ? (
                    <p className="text-[10px] text-gray-500 text-center py-4">No new notifications</p>
                  ) : (
                    notifications.filter(n => n.status === 'unread').map((notif) => (
                      <div
                        key={notif.id}
                        className="p-2 rounded-lg text-[10px] leading-relaxed border bg-indigo-500/5 border-indigo-500/10 text-indigo-200"
                      >
                        {notif.message}
                        <div className="text-[9px] text-gray-500 mt-1">
                          {new Date(notif.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Trigger */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => {
                setShowProfileDropdown(!showProfileDropdown);
                setShowNotificationsDropdown(false);
              }}
              className="flex items-center gap-2 p-1 pr-2 rounded-lg hover:bg-white/5 transition-all text-left cursor-pointer"
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className={`rounded-full object-cover border border-indigo-500/30 shrink-0 ${
                    isAdminView ? 'w-8 h-8' : 'w-7 h-7'
                  }`}
                />
              ) : isAdminView ? (
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
                  {user.name ? user.name[0] : 'A'}
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-extrabold text-xs uppercase shrink-0">
                  {user.name ? user.name[0] : 'U'}
                </div>
              )}
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-gray-200 leading-tight">
                  {user.name || (isAdminView ? 'System Admin' : 'Rahul Sharma')}
                </p>
                {(isAdminView || user.role === 'admin') && (
                  <p className="text-[9px] text-indigo-600 font-bold capitalize leading-none mt-0.5">
                    {isAdminView ? 'Super Admin' : 'Administrator'}
                  </p>
                )}
              </div>
              <ChevronDown className="w-3 h-3 text-gray-400 hidden sm:block shrink-0" />
            </button>

            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-48 glass-panel rounded-xl border border-white/10 shadow-2xl p-2 z-50 animate-scale-up">
                <Link
                  href={isAdminView ? "/admin?tab=settings" : "/profile"}
                  onClick={() => setShowProfileDropdown(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-300 hover:bg-white/5 hover:text-white transition-all font-semibold"
                >
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  My Profile
                </Link>
                <Link
                  href="/logout"
                  onClick={() => setShowProfileDropdown(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/5 transition-all text-left font-semibold cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>

    {/* Floating Theme Toggle FAB */}
    <button
      onClick={toggleTheme}
      type="button"
      className={`fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full border shadow-2xl flex items-center justify-center transition-all duration-300 cursor-pointer hover:scale-110 active:scale-95 ${
        theme === 'light'
          ? 'bg-white border-indigo-100 text-gray-600 hover:bg-gray-100 shadow-indigo-600/10'
          : 'bg-[#0d1117]/90 border-white/20 text-gray-300 hover:bg-[#151c2c] backdrop-blur-md shadow-black/50'
      }`}
      aria-label="Toggle Theme"
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 text-indigo-500" />
      ) : (
        <Sun className="w-5 h-5 text-amber-400" />
      )}
    </button>
  </>
);
}
