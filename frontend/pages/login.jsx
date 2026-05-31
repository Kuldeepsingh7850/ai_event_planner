import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';

export default function Login() {
  const { theme } = useTheme();
  const { user, login } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('user'); // 'user' or 'admin'

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect authenticated users to their respective panels
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, router]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const isLight = theme === 'light';

  if (!mounted) {
    return (
      <div className={`min-h-screen bg-[#090b0f] flex items-center justify-center p-4`} />
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 flex items-center justify-center p-4 ${isLight ? 'bg-[#f3f4f6]' : 'bg-[#090b0f]'}`}>
      {/* Background glow graphics for dark theme */}
      {!isLight && (
        <>
          <div className="absolute top-[20%] left-[20%] w-[350px] h-[350px] bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none"></div>
          <div className="absolute bottom-[20%] right-[20%] w-[350px] h-[350px] bg-purple-500/5 blur-[100px] rounded-full pointer-events-none"></div>
        </>
      )}

      {/* Main card container */}
      <div className={`w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl border flex flex-col md:flex-row relative z-10 min-h-[500px] transition-colors duration-300 ${
        isLight 
          ? 'bg-white border-gray-200/80 text-gray-800' 
          : 'bg-[#0d1117] border-white/5 text-white'
      }`}>
        
        {/* Left Column: Image & Overlay (50% width) */}
        <div className="w-full md:w-1/2 relative min-h-[300px] md:min-h-auto overflow-hidden">
          <img
            src={isLight ? "/udaipur_palace_light.png" : "/udaipur_palace.png"}
            alt="Udaipur Palace"
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
              isLight ? 'brightness-110' : 'brightness-[1.05] contrast-[1.05]'
            }`}
          />
          <div className={`absolute inset-0 transition-opacity duration-500 ${
            isLight 
              ? 'bg-gradient-to-t from-black/50 via-black/15 to-transparent' 
              : 'bg-gradient-to-t from-black/60 via-black/20 to-transparent'
          }`}></div>
          
          {/* Overlaid branding content */}
          <div className="absolute inset-0 p-8 flex flex-col justify-end text-left z-10">
            <h1 className="text-2xl font-extrabold tracking-tight leading-tight always-white">
              Plan Your Perfect Event <br />in Udaipur
            </h1>
            <p className="text-xs always-gray-200 mt-3 max-w-sm leading-relaxed font-medium">
              AI-powered event planning to make your special moments unforgettable.
            </p>
          </div>
        </div>

        {/* Right Column: Form (50% width) */}
        <div className={`w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-center items-center text-left overflow-y-auto relative transition-colors duration-300 ${
          isLight ? 'bg-white' : 'bg-[#0d1117]'
        }`}>
          {/* Right Column Brand Header */}
          <div className="w-full max-w-md flex justify-between items-center mb-4">
            <div className="flex items-center gap-1.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/10">
                <MapPin className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="flex flex-col text-left">
                <span className={`text-xs font-bold leading-tight ${isLight ? 'text-gray-900' : 'text-white'}`}>JAGAH</span>
                <span className={`text-[10px] font-medium ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Udaipur</span>
              </div>
            </div>
          </div>

          {/* Portal Selector Tabs */}
          <div className={`flex w-full max-w-md p-1 rounded-2xl mb-4 transition-colors border ${
            isLight ? 'bg-gray-100/80 border-gray-200' : 'bg-white/5 border-white/5'
          }`}>
            <button
              onClick={() => setActiveTab('user')}
              type="button"
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'user'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : isLight 
                    ? 'text-gray-500 hover:text-gray-900'
                    : 'text-gray-400 hover:text-white'
              }`}
            >
              User Portal
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              type="button"
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : isLight 
                    ? 'text-gray-500 hover:text-gray-900'
                    : 'text-gray-400 hover:text-white'
              }`}
            >
              Admin Portal
            </button>
          </div>


          {/* Custom Login Form */}
          <form onSubmit={handleLoginSubmit} className="w-full max-w-md flex flex-col gap-3">
            <h2 className={`text-xl font-extrabold ${isLight ? 'text-gray-900' : 'text-white'}`}>
              {activeTab === 'admin' ? 'Admin Sign In' : 'Sign In'}
            </h2>
            <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'} mb-1`}>
              Enter your credentials to access your account dashboard.
            </p>

            {error && (
              <div className="p-2.5 rounded-xl border bg-rose-500/10 border-rose-500/20 text-rose-400 text-xs font-semibold leading-relaxed flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className={`text-xs font-bold ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. name@example.com"
                className={`border rounded-xl text-xs py-2.5 px-3.5 transition-all focus:outline-none ${
                  isLight 
                    ? 'bg-gray-50 border-gray-200 text-gray-900 focus:border-indigo-600 focus:bg-white' 
                    : 'bg-white/3 border-white/5 text-white focus:border-indigo-500/50 focus:bg-white/5'
                }`}
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label className={`text-xs font-bold ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>Password</label>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`border rounded-xl text-xs py-2.5 px-3.5 transition-all focus:outline-none ${
                  isLight 
                    ? 'bg-gray-50 border-gray-200 text-gray-900 focus:border-indigo-600 focus:bg-white' 
                    : 'bg-white/3 border-white/5 text-white focus:border-indigo-500/50 focus:bg-white/5'
                }`}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/15 cursor-pointer flex items-center justify-center gap-2 mt-1 disabled:opacity-50"
            >
              {loading && <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin shrink-0"></span>}
              Sign In
            </button>

            <p className={`text-xs text-center mt-3 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => router.push('/register')}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
              >
                Sign Up
              </button>
            </p>
          </form>

          {/* Copyright Footer */}
          <div className={`w-full max-w-md text-center text-[10px] mt-4 pt-3 border-t ${
            isLight ? 'text-gray-400 border-gray-100' : 'text-gray-500 border-white/5'
          }`}>
            © 2026 JAGAH Udaipur. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}
