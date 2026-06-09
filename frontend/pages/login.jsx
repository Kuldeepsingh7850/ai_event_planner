import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, MapPin } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { LogoBrand } from '../components/Logo';
import { useNotifications } from '../context/NotificationContext';

export default function Login() {
  const { theme } = useTheme();
  const { user, login, loginWithGoogle, logout, requestPasswordReset } = useAuth();
  const { showToast } = useNotifications();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('user'); // 'user' or 'admin'
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password States
  const [isResetMode, setIsResetMode] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(null);
  const [resetLoading, setResetLoading] = useState(false);
  const [etherealUrl, setEtherealUrl] = useState(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const isLight = theme === 'light';

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGoogleCallback = async (response) => {
    if (!response.credential) return;
    setError(null);
    setLoading(true);
    showToast('Signing in with Google...', 'info');
    try {
      const data = await loginWithGoogle(response.credential);
      if (activeTab === 'admin' && data.role !== 'admin') {
        logout();
        throw new Error('Access denied. Only administrators are allowed to access the Admin Portal.');
      }
      if (activeTab === 'user' && data.role === 'admin') {
        logout();
        throw new Error('Admins must switch to the Admin Portal tab to sign in.');
      }
      showToast('Logged in successfully with Google!', 'success');
    } catch (err) {
      setError(err.message || 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!mounted) return;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

    const initializeGoogle = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCallback,
          auto_select: false
        });

        const btnContainer = document.getElementById("google-signin-btn-container");
        if (btnContainer) {
          window.google.accounts.id.renderButton(btnContainer, {
            theme: isLight ? "outline" : "filled_black",
            size: "large",
            width: "384",
            shape: "rectangular",
            logo_alignment: "left"
          });
        }
      }
    };

    // Load the GSI script if not already loaded
    if (!document.getElementById("gsi-client-script")) {
      const script = document.createElement("script");
      script.id = "gsi-client-script";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogle;
      document.body.appendChild(script);
    } else {
      initializeGoogle();
    }
  }, [mounted, isLight]);

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
      const data = await login(email, password);
      if (activeTab === 'admin' && data.role !== 'admin') {
        logout();
        throw new Error('Access denied. Only administrators are allowed to access the Admin Portal.');
      }
      if (activeTab === 'user' && data.role === 'admin') {
        logout();
        throw new Error('Admins must switch to the Admin Portal tab to sign in.');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
      // Show the Forgot Password link ONLY on wrong ID or password credentials error
      if (err.message === 'Invalid email or password') {
        setShowForgotPassword(true);
      } else {
        setShowForgotPassword(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResetSuccess(null);
    setEtherealUrl(null);
    setResetLoading(true);
    try {
      const res = await requestPasswordReset(email);
      setResetSuccess(res.message || 'Password reset link sent to your email.');
      showToast('Password reset link sent.', 'success');
      if (res.etherealUrl) {
        setEtherealUrl(res.etherealUrl);
      } else {
        setTimeout(() => {
          setIsResetMode(false);
          setResetSuccess(null);
          setShowForgotPassword(false);
        }, 4000);
      }
    } catch (err) {
      setError(err.message || 'Failed to send reset link');
    } finally {
      setResetLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError(null);
    setShowForgotPassword(false);
  };

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
      <div className={`w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl border flex flex-col relative z-10 min-h-[600px] transition-colors duration-300 ${
        isLight 
          ? 'bg-white border-gray-200/80 text-gray-800' 
          : 'bg-[#0d1117] border-white/5 text-white'
      }`}>
        
        {/* Top Header Bar Row (Spans Full Card Width) */}
        <div className={`w-full py-4 px-6 md:px-8 flex justify-between items-center border-b transition-colors duration-300 ${
          isLight ? 'border-gray-100 bg-white' : 'border-white/5 bg-[#0d1117]'
        }`}>
          {/* Logo Brand */}
          <div onClick={() => router.push('/')} className="cursor-pointer">
            <LogoBrand isDarkTheme={!isLight} boxSize="w-9 h-9" />
          </div>
          
          {/* Sign Up Redirect Link */}
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <span className={isLight ? 'text-gray-500' : 'text-gray-400'}>Don't have an account?</span>
            <button
              type="button"
              onClick={() => router.push('/register')}
              className="text-[#5c3db5] dark:text-[#8b6cf5] font-extrabold hover:underline cursor-pointer transition-colors"
            >
              Sign Up
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
                Plan Your Perfect Event <br />in Udaipur
              </h1>
              <p className="text-xs always-gray-200 mt-2.5 max-w-sm leading-relaxed font-semibold">
                AI-powered event planning to make your special moments unforgettable.
              </p>
            </div>
          </div>

          {/* Right Column: Sign In Form */}
          <div className={`w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-center items-center text-left relative transition-colors duration-300 ${
            isLight ? 'bg-white' : 'bg-[#0d1117]'
          }`}>
            
            {isResetMode ? (
              /* Custom Password Reset Form */
              <form onSubmit={handleResetSubmit} className="w-full max-w-md flex flex-col gap-4 animate-scale-up">
                <div>
                  <h2 className={`text-2xl font-extrabold tracking-tight ${isLight ? 'text-gray-900' : 'text-white'}`}>
                    Reset Password
                  </h2>
                  <p className={`text-xs mt-1 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                    Enter your email to receive a password reset link
                  </p>
                </div>

                {error && (
                  <div className="p-2.5 rounded-xl border bg-rose-500/10 border-rose-500/20 text-rose-400 text-xs font-semibold leading-relaxed flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                    {error}
                  </div>
                )}

                {resetSuccess && (
                  <div className="p-2.5 rounded-xl border bg-emerald-500/10 border-emerald-500/20 text-emerald-400 text-xs font-semibold leading-relaxed flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                    {resetSuccess}
                  </div>
                )}

                {/* Email Input */}
                <div className="flex flex-col gap-1.5">
                  <label className={`text-xs font-bold ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>Email Address</label>
                  <div className="relative w-full">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className={`w-full border rounded-xl text-xs py-3 pl-10 pr-4 transition-all focus:outline-none ${
                        isLight 
                          ? 'bg-gray-50 border-gray-200 text-gray-900 focus:border-[#5c3db5] focus:bg-white' 
                          : 'bg-white/3 border-white/5 text-white focus:border-[#8b6cf5]/50 focus:bg-white/5'
                      }`}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="bg-[#5c3db5] hover:bg-[#4b3099] text-white font-bold text-xs py-3 rounded-xl transition-all shadow-lg shadow-[#5c3db5]/15 cursor-pointer flex items-center justify-center gap-2 mt-1 disabled:opacity-50"
                >
                  {resetLoading && <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin shrink-0"></span>}
                  Send Reset Link
                </button>

                <div className="flex justify-center mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetMode(false);
                      setError(null);
                      setResetSuccess(null);
                      setEtherealUrl(null);
                    }}
                    className="text-xs font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white cursor-pointer hover:underline"
                  >
                    Back to Login
                  </button>
                </div>

                {etherealUrl && (
                  <div className="mt-3 p-3.5 border rounded-2xl bg-emerald-500/5 border-emerald-500/10 flex flex-col gap-2.5 animate-scale-up">
                    <p className={`text-[10px] leading-relaxed text-center font-medium ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                      📧 In local testing mode, a real HTML email was sent. Click below to view the Ethereal inbox message:
                    </p>
                    <a
                      href={etherealUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md text-center flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      Open Ethereal Test Email
                    </a>
                  </div>
                )}
              </form>
            ) : (
              <>
                {/* Portal Selector Tabs */}
                <div className={`flex w-full max-w-md p-1 rounded-2xl mb-6 transition-colors border ${
                  isLight ? 'bg-gray-100/80 border-gray-200' : 'bg-white/5 border-white/5'
                }`}>
                  <button
                    onClick={() => handleTabChange('user')}
                    type="button"
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      activeTab === 'user'
                        ? 'bg-[#5c3db5] text-white shadow-md'
                        : isLight 
                          ? 'text-gray-500 hover:text-gray-900'
                          : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    User Portal
                  </button>
                  <button
                    onClick={() => handleTabChange('admin')}
                    type="button"
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      activeTab === 'admin'
                        ? 'bg-[#5c3db5] text-white shadow-md'
                        : isLight 
                          ? 'text-gray-500 hover:text-gray-900'
                          : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Admin Portal
                  </button>
                </div>

                {/* Custom Login Form */}
                <form onSubmit={handleLoginSubmit} className="w-full max-w-md flex flex-col gap-4">
                  <div>
                    <h2 className={`text-2xl font-extrabold tracking-tight ${isLight ? 'text-gray-900' : 'text-white'}`}>
                      Welcome Back!
                    </h2>
                    <p className={`text-xs mt-1 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                      Login to your account to continue
                    </p>
                  </div>

                  {error && error !== 'Invalid email or password' && (
                    <div className="p-2.5 rounded-xl border bg-rose-500/10 border-rose-500/20 text-rose-400 text-xs font-semibold leading-relaxed flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                      {error}
                    </div>
                  )}

                  {/* Email Input with Icon */}
                  <div className="flex flex-col gap-1.5">
                    <label className={`text-xs font-bold ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>Email Address</label>
                    <div className="relative w-full">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError(null);
                          setShowForgotPassword(false);
                        }}
                        placeholder="Enter your email"
                        className={`w-full border rounded-xl text-xs py-3 pl-10 pr-4 transition-all focus:outline-none ${
                          isLight 
                            ? 'bg-gray-50 border-gray-200 text-gray-900 focus:border-[#5c3db5] focus:bg-white' 
                            : 'bg-white/3 border-white/5 text-white focus:border-[#8b6cf5]/50 focus:bg-white/5'
                        }`}
                        required
                      />
                    </div>
                  </div>

                  {/* Password Input with Left & Right Icons */}
                  <div className="flex flex-col gap-1.5">
                    <label className={`text-xs font-bold ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>Password</label>
                    <div className="relative w-full">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setError(null);
                          setShowForgotPassword(false);
                        }}
                        placeholder="Enter your password"
                        className={`w-full border rounded-xl text-xs py-3 pl-10 pr-10 transition-all focus:outline-none ${
                          isLight 
                            ? 'bg-gray-50 border-gray-200 text-gray-900 focus:border-[#5c3db5] focus:bg-white' 
                            : 'bg-white/3 border-white/5 text-white focus:border-[#8b6cf5]/50 focus:bg-white/5'
                        }`}
                        required
                      />
                      {/* Eye Toggle Icon */}
                      <button
                         type="button"
                         onClick={() => setShowPassword(!showPassword)}
                         className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                      </button>
                    </div>
                    {/* Error message or Forgot Password button directly below password field */}
                    {((error && error === 'Invalid email or password') || showForgotPassword) && (
                      <div className="flex justify-between items-center mt-1 w-full animate-fade-in">
                        {error && error === 'Invalid email or password' ? (
                          <span className="text-[11px] font-semibold text-rose-500 dark:text-rose-400 flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-rose-500 dark:bg-rose-400 shrink-0"></span>
                            Your password or email is incorrect.
                          </span>
                        ) : (
                          <div />
                        )}
                        {showForgotPassword && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsResetMode(true);
                              setError(null);
                              setResetSuccess(null);
                            }}
                            className="text-xs font-bold text-[#5c3db5] dark:text-[#8b6cf5] hover:underline cursor-pointer font-sans"
                          >
                            Forgot Password?
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#5c3db5] hover:bg-[#4b3099] text-white font-bold text-xs py-3 rounded-xl transition-all shadow-lg shadow-[#5c3db5]/15 cursor-pointer flex items-center justify-center gap-2 mt-1 disabled:opacity-50"
                  >
                    {loading && <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin shrink-0"></span>}
                    Login
                  </button>

                  {/* Divider (or continue with) */}
                  <div className="flex items-center my-2.5 w-full">
                    <div className={`flex-1 border-t ${isLight ? 'border-gray-200' : 'border-white/10'}`}></div>
                    <span className={`px-3 text-[10px] tracking-wide font-extrabold uppercase ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>or continue with</span>
                    <div className={`flex-1 border-t ${isLight ? 'border-gray-200' : 'border-white/10'}`}></div>
                  </div>

                  {/* Google Sign-In Button Container */}
                  <div className="w-full flex flex-col items-center justify-center mt-1">
                    <div id="google-signin-btn-container" className="w-full flex justify-center min-h-[44px]"></div>
                    {!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
                      <p className="text-[10px] text-amber-500 font-medium text-center mt-1.5 leading-relaxed max-w-[280px]">
                        ⚠️ Set <code className="font-mono bg-amber-500/10 px-1 py-0.5 rounded">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> in your env files to enable real Google Login.
                      </p>
                    )}
                  </div>
                </form>
              </>
            )}

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
