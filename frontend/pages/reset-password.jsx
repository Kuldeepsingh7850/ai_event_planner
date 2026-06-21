import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { LogoBrand } from '../components/Logo';
import { useNotifications } from '../context/NotificationContext';

export default function ResetPassword() {
  const { theme } = useTheme();
  const { resetPassword } = useAuth();
  const { showToast } = useNotifications();
  const router = useRouter();
  const { token } = router.query;

  const [mounted, setMounted] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const isLight = theme === 'light';

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(token, password);
      setSuccess(res.message || 'Your password has been reset successfully!');
      showToast('Password reset successfully!', 'success');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#090b0f] flex items-center justify-center p-4" />
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
      <div className={`w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl border flex flex-col relative z-10 min-h-[600px] transition-colors duration-300 ${
        isLight 
          ? 'bg-white border-gray-200/80 text-gray-800' 
          : 'bg-[#0d1117] border-white/5 text-white'
      }`}>
        
        {/* Top Header Bar Row */}
        <div className={`w-full py-4 px-6 md:px-8 flex justify-between items-center border-b transition-colors duration-300 ${
          isLight ? 'border-gray-100 bg-white' : 'border-white/5 bg-[#0d1117]'
        }`}>
          {/* Logo Brand */}
          <div onClick={() => router.push('/')} className="cursor-pointer">
            <LogoBrand isDarkTheme={!isLight} boxSize="w-9 h-9" />
          </div>
          
          {/* Redirect to login */}
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="text-[#1d4ed8] dark:text-[#60a5fa] font-extrabold hover:underline cursor-pointer transition-colors"
            >
              Back to Sign In
            </button>
          </div>
        </div>

        {/* Content Row Split (50/50 Image & Form) */}
        <div className="w-full flex flex-col md:flex-row flex-1">
          
          {/* Left Column: Udaipur Palace Dusk Image */}
          <div className="w-full md:w-1/2 relative min-h-[300px] md:min-h-auto overflow-hidden">
            <img
              src="/hero_udaipur_1.jpg"
              alt="Udaipur Palace"
              className="absolute inset-0 w-full h-full object-cover brightness-[1.02] contrast-[1.05]"
            />
            {/* Dark gradient fade over Udaipur image */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent"></div>
            
            {/* Overlaid branding content */}
            <div className="absolute inset-0 p-8 flex flex-col justify-end text-left z-10">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight always-white">
                Set Your New <br />Password
              </h1>
              <p className="text-xs always-gray-200 mt-2.5 max-w-sm leading-relaxed font-semibold">
                Complete your request to secure your JAGAH account.
              </p>
            </div>
          </div>

          {/* Right Column: Reset Password Form */}
          <div className={`w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-center items-center text-left relative transition-colors duration-300 ${
            isLight ? 'bg-white' : 'bg-[#0d1117]'
          }`}>
            
            <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col gap-4 animate-scale-up">
              <div>
                <h2 className={`text-2xl font-extrabold tracking-tight ${isLight ? 'text-gray-900' : 'text-white'}`}>
                  Choose New Password
                </h2>
                <p className={`text-xs mt-1 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                  Enter your new password below to update your account
                </p>
              </div>

              {error && (
                <div className="p-2.5 rounded-xl border bg-rose-500/10 border-rose-500/20 text-rose-400 text-xs font-semibold leading-relaxed flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                  {error}
                </div>
              )}

              {success && (
                <div className="p-2.5 rounded-xl border bg-emerald-500/10 border-emerald-500/20 text-emerald-400 text-xs font-semibold leading-relaxed flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                  {success}
                </div>
              )}

              {/* Password Input */}
              <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-bold ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>New Password</label>
                <div className="relative w-full">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(null);
                    }}
                    placeholder="Enter new password (min. 6 chars)"
                    className={`w-full border rounded-xl text-xs py-3 pl-10 pr-10 transition-all focus:outline-none ${
                      isLight 
                        ? 'bg-gray-50 border-gray-200 text-gray-900 focus:border-[#1d4ed8] focus:bg-white' 
                        : 'bg-white/3 border-white/5 text-white focus:border-[#60a5fa]/50 focus:bg-white/5'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-bold ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>Confirm New Password</label>
                <div className="relative w-full">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError(null);
                    }}
                    placeholder="Confirm new password"
                    className={`w-full border rounded-xl text-xs py-3 pl-10 pr-10 transition-all focus:outline-none ${
                      isLight 
                        ? 'bg-gray-50 border-gray-200 text-gray-900 focus:border-[#1d4ed8] focus:bg-white' 
                        : 'bg-white/3 border-white/5 text-white focus:border-[#60a5fa]/50 focus:bg-white/5'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !!success}
                className="bg-[#1d4ed8] hover:bg-[#1e3a8a] text-white font-bold text-xs py-3 rounded-xl transition-all shadow-lg shadow-[#1d4ed8]/15 cursor-pointer flex items-center justify-center gap-2 mt-1 disabled:opacity-50"
              >
                {loading && <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin shrink-0"></span>}
                Reset Password
              </button>
            </form>

            {/* Copyright Footer */}
            <div className={`w-full max-w-md text-center text-[10px] mt-6 pt-3 border-t ${
              isLight ? 'text-gray-400 border-gray-100' : 'text-gray-500 border-white/5'
            }`}>
              © {new Date().getFullYear()} JAGAH Udaipur. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
