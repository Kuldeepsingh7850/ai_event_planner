import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { LogOut, Check, X } from 'lucide-react';

export default function LogoutPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const { showToast } = useNotifications();

  // step: 'confirm' or 'success'
  const [step, setStep] = useState('confirm');
  const [loading, setLoading] = useState(false);

  const handleConfirmLogout = () => {
    setStep('success');
    showToast('Logged out of system framework.', 'info');
  };

  const handleFinalSignout = () => {
    setLoading(true);
    try {
      logout(); // Custom native logout trigger
    } catch (err) {
      console.error(err);
      router.push('/login');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] py-8 font-medium">
      {step === 'confirm' ? (
        /* STEP 1: LOGOUT CONFIRM SCREEN */
        <div className="glass-panel w-full max-w-sm rounded-2xl border border-white/5 p-8 flex flex-col items-center text-center gap-6 shadow-xl animate-scale-up">
          {/* Circular LogOut Icon container */}
          <div className="w-20 h-20 rounded-full bg-purple-500/10 border border-purple-500/20 text-[#5a2bd4] dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-inner">
            <LogOut className="w-10 h-10 transform scale-x-[-1] translate-x-0.5" />
          </div>

          <h2 className="text-sm sm:text-base font-bold text-white dark:text-white leading-normal max-w-xs px-2">
            Are you sure you want to logout?
          </h2>

          <div className="flex items-center gap-4 w-full mt-2">
            <button
              onClick={() => router.back()}
              className="flex-1 py-2.5 border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmLogout}
              className="flex-1 py-2.5 bg-[#5a2bd4] hover:bg-[#4c24b5] always-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-500/10 cursor-pointer"
            >
              Yes, Logout
            </button>
          </div>
        </div>
      ) : (
        /* STEP 2: LOGOUT SUCCESS SCREEN */
        <div className="glass-panel w-full max-w-sm rounded-2xl border border-white/5 p-8 flex flex-col items-center text-center gap-6 shadow-xl animate-scale-up">
          {/* Circular Checkmark Icon container */}
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 shadow-inner">
            <Check className="w-10 h-10" />
          </div>

          <div className="flex flex-col gap-1.5">
            <h2 className="text-sm sm:text-base font-extrabold text-white dark:text-white leading-tight">
              Logged Out Successfully!
            </h2>
            <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 font-semibold leading-normal">
              You have been logged out of your account.
            </p>
          </div>

          <button
            onClick={handleFinalSignout}
            disabled={loading}
            className="w-full py-2.5 bg-[#5a2bd4] hover:bg-[#4c24b5] always-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-500/10 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading && <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin shrink-0"></span>}
            Go to Login
          </button>
        </div>
      )}
    </div>
  );
}
