import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { LogoBrand } from './Logo';
import {
  LayoutDashboard,
  Sparkles,
  CalendarDays,
  Building,
  Receipt,
  Users,
  CheckSquare,
  Bell,
  Star,
  MessageSquare,
  Settings,
  LogOut,
  X,
  Mail,
  TrendingUp
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const router = useRouter();
  const { user, logout } = useAuth();

  if (!user) return null;

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Event Planner', path: '/ai', icon: Sparkles },
    { name: 'My Events', path: '/events', icon: CalendarDays },
    { name: 'Venues', path: '/venues', icon: Building },
    { name: 'Budget Planner', path: '/budget', icon: Receipt },
    { name: 'Guest Management', path: '/guests', icon: Users },
    { name: 'Task Timeline', path: '/tasks', icon: CheckSquare },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Favorites', path: '/favorites', icon: Star },
    { name: 'Profile Settings', path: '/profile', icon: Settings }
  ];

  // Admins see a comprehensive navigation menu matching the dashboard image
  const adminMenuItems = [
    { name: 'Dashboard', path: '/admin?tab=dashboard', icon: LayoutDashboard },
    { name: 'Events', path: '/admin?tab=events', icon: CalendarDays },
    { name: 'Users', path: '/admin?tab=users', icon: Users },
    { name: 'Venues', path: '/admin?tab=venues', icon: Building },
    { name: 'Vendors', path: '/admin?tab=vendors', icon: Star },
    { name: 'Bookings', path: '/admin?tab=bookings', icon: CheckSquare },
    { name: 'Feedback', path: '/admin?tab=feedback', icon: MessageSquare },
    { name: 'Reports', path: '/admin?tab=reports', icon: TrendingUp },
    { name: 'Settings', path: '/admin?tab=settings', icon: Settings }
  ];

  const itemsToRender = user?.role === 'admin' ? adminMenuItems : menuItems;

  return (
    <>
      {/* Mobile Drawer Backdrop overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-[#07080a]/60 backdrop-blur-sm z-30 md:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 glass-panel border-r border-white/5 z-50 md:z-30 flex flex-col justify-between p-4 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col gap-4 overflow-y-auto flex-1 pr-1 scrollbar-none">
          {/* Brand Logo inside Sidebar header */}
          <div className="pb-4 border-b border-white/5 mb-2 mt-2">
            <Link href="/" className="flex items-center">
              <LogoBrand boxSize="w-10 h-10" iconSize="w-9 h-9" />
            </Link>
          </div>

          {/* Mobile close button inside sidebar header */}
          <div className="flex md:hidden justify-between items-center pb-2 border-b border-white/5">
            <span className="text-[10px] uppercase font-bold text-indigo-400">Navigation Menu</span>
            <button
              onClick={onClose}
              className="p-1 rounded bg-white/5 text-gray-400 hover:text-white"
              aria-label="Close Sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5 mt-2">
            {itemsToRender.map((item) => {
              const Icon = item.icon;
              let isActive = router.asPath === item.path;
              
              // Handle admin queries
              if (item.path === '/admin?tab=dashboard') {
                isActive = router.pathname === '/admin' && (!router.query.tab || router.query.tab === 'dashboard');
              } else if (item.path.startsWith('/admin?tab=')) {
                const tab = item.path.split('tab=')[1];
                isActive = router.pathname === '/admin' && router.query.tab === tab;
              }

              // Check sub-paths for Dashboard
              if (item.path === '/dashboard' && router.pathname === '/dashboard' && !router.query.tab) {
                isActive = true;
              }
              // Check sub-paths for Events page
              if (item.path === '/events' && router.pathname.startsWith('/events/') && router.pathname !== '/events/create') {
                isActive = true;
              }

              return (
                <Link
                  key={item.name + item.path}
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-[#efe9fc] text-[#5a2bd4] dark:bg-indigo-600 dark:text-white shadow-sm dark:shadow-indigo-600/15'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile Info & Logout */}
        <div className="flex flex-col gap-3 px-3 py-3 border-t border-white/5 bg-transparent">
          {/* User Profile Info */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Profile DP */}
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover border border-sky-200 dark:border-sky-900/50 shadow-sm shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-sky-200 dark:border-sky-900/50 flex items-center justify-center text-indigo-400 font-extrabold text-sm uppercase shrink-0">
                {user.name ? user.name[0] : 'U'}
              </div>
            )}
            
            {/* Name & Email ID */}
            <div className="min-w-0 flex flex-col">
              <span className="text-[13px] font-bold text-gray-800 dark:text-gray-200 truncate leading-snug">
                {user.name}
              </span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate leading-normal mt-0.5">
                {user.email}
              </span>
            </div>
          </div>

          {/* Logout Shortcut */}
          <Link
            href="/logout"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/5 hover:text-rose-400 transition-all text-left w-full cursor-pointer mt-1"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Logout</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
