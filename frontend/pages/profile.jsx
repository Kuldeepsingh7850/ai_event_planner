import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  User,
  Camera,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  Globe,
  Loader2,
  Check,
  Star,
  Lock
} from 'lucide-react';

export default function Profile() {
  const { user, authFetch, updateUserAvatar, updateUserName } = useAuth();
  const { showToast } = useNotifications();

  // Active Tab: 'Profile Information', 'Account Settings', 'Password & Security', 'Preferences'
  const [activeTab, setActiveTab] = useState('Profile Information');

  // Profile Form States
  const [fullName, setFullName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [designation, setDesignation] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Password Update States
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Feedback States
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitLoading, setFeedbackSubmitLoading] = useState(false);

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    setFeedbackSubmitLoading(true);
    try {
      const res = await authFetch('/feedback/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: feedbackRating,
          comment: feedbackComment
        })
      });
      if (res.ok) {
        showToast('Thank you for your feedback!', 'success');
        setFeedbackComment('');
        setFeedbackRating(5);
      } else {
        const errData = await res.json();
        showToast(errData.message || 'Failed to submit feedback', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error submitting feedback', 'error');
    } finally {
      setFeedbackSubmitLoading(false);
    }
  };

  // Load profile data from API and merge with localStorage edits
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await authFetch('/profile');
        let dbName = '';
        let dbEmail = '';

        if (res.ok) {
          const dbData = await res.json();
          dbName = dbData.name;
          dbEmail = dbData.email;
          setAvatar(dbData.avatar || '');

          // Retrieve user-scoped localStorage overrides
          const localKey = `profile_settings_${dbData.id}`;
          const localSettings = localStorage.getItem(localKey);
          
          setFullName(dbName || '');
          setEmailAddress(dbEmail || '');
          setPhoneNumber(dbData.phone || '');

          if (localSettings) {
            const parsed = JSON.parse(localSettings);
            if (!dbData.phone) {
              setPhoneNumber(parsed.phoneNumber || '');
            }
            setDesignation(parsed.designation || '');
            setLocation(parsed.location || '');
            setWebsite(parsed.website || '');
            setBio(parsed.bio || '');
          } else {
            if (!dbData.phone) {
              setPhoneNumber('');
            }
            setDesignation('');
            setLocation('');
            setWebsite('');
            setBio('');
          }
        }
      } catch (err) {
        showToast(err.message || 'Error loading profile details', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [authFetch]);

  // Handle Photo Upload
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      return showToast('Image file size must be less than 2MB', 'warning');
    }

    if (!file.type.startsWith('image/')) {
      return showToast('Please select a valid image file', 'warning');
    }

    setUploadLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      try {
        const res = await authFetch('/profile/avatar', {
          method: 'PUT',
          body: JSON.stringify({ avatar: base64String })
        });
        if (res.ok) {
          const data = await res.json();
          setAvatar(data.avatar);
          updateUserAvatar(data.avatar);
          showToast('Profile photo updated successfully!', 'success');
        } else {
          const data = await res.json();
          throw new Error(data.message || 'Failed to upload photo');
        }
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setUploadLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit Profile Changes
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      // 1. Save locally to persist the extra fields using user-scoped key
      const profileObj = {
        fullName,
        emailAddress,
        phoneNumber,
        designation,
        location,
        website,
        bio
      };
      const localKey = user ? `profile_settings_${user.id}` : 'profile_settings';
      localStorage.setItem(localKey, JSON.stringify(profileObj));

      // 2. Call API to update full name and phone in DB
      const res = await authFetch('/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fullName, phone: phoneNumber })
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to update name in database');
      }

      // 3. Sync changes to global AuthContext state
      updateUserName(fullName);

      showToast('Changes saved successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Error saving changes', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle Password Update
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      return showToast('Please enter both password fields', 'warning');
    }
    if (newPassword !== confirmPassword) {
      return showToast('Passwords do not match', 'error');
    }
    if (newPassword.length < 6) {
      return showToast('Password must be at least 6 characters long', 'warning');
    }

    setPasswordLoading(true);
    try {
      const res = await authFetch('/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newPassword,
          confirmPassword
        })
      });

      if (res.ok) {
        showToast('Password updated successfully!', 'success');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const errData = await res.json();
        showToast(errData.message || 'Failed to update password', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error updating password', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse flex flex-col gap-6 max-w-4xl mx-auto">
        <div className="h-8 bg-white/5 rounded w-1/4 mb-4"></div>
        <div className="h-6 bg-white/5 rounded w-2/3 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-4">
          <div className="h-48 bg-white/5 rounded-2xl md:col-span-1"></div>
          <div className="h-96 bg-white/5 rounded-2xl md:col-span-3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 font-medium pb-12">
      {/* 1. Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white dark:text-white">
          Profile Settings
        </h1>
        <p className="text-xs text-gray-500 mt-1 font-medium">
          Manage your account information and preferences.
        </p>
      </div>

      {/* 2. Main Form Segment */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start mt-4">
        {/* Left Side: Avatar Card */}
        <div className="lg:col-span-1 glass-panel p-6 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center gap-4">
          <div className="relative group w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-500/20 hover:border-indigo-500 transition-all shadow-xl bg-slate-800">
            {avatar ? (
              <img
                src={avatar}
                alt={fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold uppercase">
                {fullName ? fullName[0] : 'U'}
              </div>
            )}
            
            {uploadLoading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
              </div>
            )}
          </div>

          <label className="px-4 py-2 border border-white/10 hover:border-indigo-500/35 bg-white/5 hover:bg-white/10 text-gray-300 dark:hover:text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer">
            <Camera className="w-4 h-4 text-indigo-400" />
            <span>Change Photo</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
              disabled={uploadLoading}
            />
          </label>

          <span className="text-[9px] text-gray-500 font-semibold leading-normal">
            JPG, PNG or WEBP. Max size 2MB.
          </span>
        </div>

        {/* Right Side: Form Inputs & Feedback */}
        <div className="lg:col-span-3 flex flex-col gap-8">
          {/* Personal Information card */}
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/5 flex flex-col gap-6">
            <h3 className="text-xs font-bold text-gray-200 dark:text-white uppercase tracking-wider border-b border-white/5 pb-3">
              Personal Information
            </h3>

            <form onSubmit={handleSaveChanges} className="flex flex-col gap-5 text-xs font-bold">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Full Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Email Address */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    required
                    readOnly
                    value={emailAddress}
                    className="w-full bg-white/3 border border-white/5 rounded-xl px-4 py-3 text-xs text-gray-400 cursor-not-allowed focus:outline-none opacity-60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Phone Number */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 uppercase tracking-wider">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Designation */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 uppercase tracking-wider">Designation</label>
                  <input
                    type="text"
                    required
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 uppercase tracking-wider">Location</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Bio Area */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 uppercase tracking-wider">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none leading-relaxed font-semibold"
                />
              </div>

              {/* Save Changes CTA Button */}
              <button
                type="submit"
                disabled={submitLoading}
                className="px-5 py-3 bg-[#5a2bd4] hover:bg-[#4c24b5] disabled:opacity-40 disabled:pointer-events-none always-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-indigo-600/10 cursor-pointer self-start"
              >
                {submitLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Save Changes
              </button>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/5 flex flex-col gap-6">
            <h3 className="text-xs font-bold text-gray-200 dark:text-white uppercase tracking-wider border-b border-white/5 pb-3">
              Change Password
            </h3>

            <form onSubmit={handleUpdatePassword} className="flex flex-col gap-5 text-xs font-bold">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* New Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 uppercase tracking-wider">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      required
                      placeholder="Min 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Confirm New Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 uppercase tracking-wider">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      required
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Update Password Button */}
              <button
                type="submit"
                disabled={passwordLoading}
                className="px-5 py-3 bg-[#5a2bd4] hover:bg-[#4c24b5] disabled:opacity-40 disabled:pointer-events-none always-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-indigo-600/10 cursor-pointer self-start"
              >
                {passwordLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Update Password
              </button>
            </form>
          </div>

          {/* Share Platform Feedback card */}
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/5 flex flex-col gap-6">
            <h3 className="text-xs font-bold text-gray-200 dark:text-white uppercase tracking-wider border-b border-white/5 pb-3">
              Share Platform Feedback
            </h3>

            <form onSubmit={handleSubmitFeedback} className="flex flex-col gap-5 text-xs font-bold">
              {/* Rating Star Selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 uppercase tracking-wider">Overall Rating</label>
                <div className="flex gap-1.5 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className="transition-all hover:scale-110 cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= feedbackRating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback Comment */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 uppercase tracking-wider">Your Comments</label>
                <textarea
                  required
                  placeholder="Tell us what you think of the platform..."
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none leading-relaxed font-semibold"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={feedbackSubmitLoading}
                className="px-5 py-3 bg-[#5a2bd4] hover:bg-[#4c24b5] disabled:opacity-40 disabled:pointer-events-none always-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-indigo-600/10 cursor-pointer self-start"
              >
                {feedbackSubmitLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Submit Feedback
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
