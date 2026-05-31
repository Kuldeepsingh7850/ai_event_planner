import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const publicPaths = ['/', '/login', '/register'];
  const isPublicPath = publicPaths.includes(router.pathname);

  // Check window size on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, []);

  // Close sidebar on route change if on mobile
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [router.pathname]);

  useEffect(() => {
    if (!loading && !user && !isPublicPath) {
      router.push('/login');
    }
  }, [user, loading, router.pathname, isPublicPath]);

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0f14] flex flex-col items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-500/20 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-400 text-sm mt-4 tracking-wide animate-pulse">Initializing System...</p>
      </div>
    );
  }

  // If user is not authenticated and trying to access private page, wait for redirect
  if (!user && !isPublicPath) {
    return null;
  }

  // Public Layout (no Sidebar/Navbar)
  if (isPublicPath) {
    return <div className="min-h-screen bg-[#0d0f14] overflow-x-hidden">{children}</div>;
  }

  // Private Layout
  const isAdminView = router.pathname.startsWith('/admin') || user?.role === 'admin';

  return (
    <div className="min-h-screen bg-[#0d0f14] text-gray-100 flex flex-col">
      <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className={`flex flex-1 ${isAdminView ? 'pt-16' : 'pt-24'}`}>
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className={`flex-1 p-4 md:p-8 overflow-y-auto transition-all duration-300 ${
          isAdminView ? 'min-h-[calc(100vh-4rem)]' : 'min-h-[calc(100vh-6rem)]'
        } ${
          isSidebarOpen ? 'md:pl-72' : 'md:pl-8'
        }`}>
          {children}
        </main>
      </div>
    </div>
  );
}
