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
  Check
} from 'lucide-react';

export default function Profile() {
  const { user, authFetch, updateUserAvatar } = useAuth();
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

  // Load profile data from API and merge with localStorage edits
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await authFetch('/profile');
        let dbName = '';
        let dbEmail = '';
        let dbAvatar = '';

        if (res.ok) {
          const dbData = await res.json();
          dbName = dbData.name;
          dbEmail = dbData.email;
          dbAvatar = dbData.avatar;
          setAvatar(dbData.avatar || '');
        }

        // Retrieve localStorage overrides
        const localSettings = localStorage.getItem('profile_settings');
        if (localSettings) {
          const parsed = JSON.parse(localSettings);
          setFullName(parsed.fullName || dbName || 'Rahul Sharma');
          setEmailAddress(parsed.emailAddress || dbEmail || 'rahul.sharma@email.com');
          setPhoneNumber(parsed.phoneNumber || '+91 98765 43210');
          setDesignation(parsed.designation || 'Event Planner & Organizer');
          setLocation(parsed.location || 'Udaipur, Rajasthan');
          setWebsite(parsed.website || 'www.rahulevents.com');
          setBio(parsed.bio || 'Passionate event planner with 8+ years of experience in organizing memorable events and creating exceptional experiences.');
        } else {
          // Default fallbacks matching the mockup
          setFullName(dbName || 'Rahul Sharma');
          setEmailAddress(dbEmail || 'rahul.sharma@email.com');
          setPhoneNumber('+91 98765 43210');
          setDesignation('Event Planner & Organizer');
          setLocation('Udaipur, Rajasthan');
          setWebsite('www.rahulevents.com');
          setBio('Passionate event planner with 8+ years of experience in organizing memorable events and creating exceptional experiences.');
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
      const profileObj = {
        fullName,
        emailAddress,
        phoneNumber,
        designation,
        location,
        website,
        bio
      };

      // Save locally to persist the extra fields
      localStorage.setItem('profile_settings', JSON.stringify(profileObj));
      showToast('Changes saved successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Error saving changes', 'error');
    } finally {
      setSubmitLoading(false);
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

      {/* 2. Horizontal navigation Tab selectors */}
      <div className="flex gap-6 overflow-x-auto text-[13px] font-bold text-gray-500 border-b border-white/5 pb-2 scrollbar-none">
        <span className="pb-3 relative whitespace-nowrap text-[#5a2bd4] dark:text-indigo-400 font-extrabold border-b-2 border-[#5a2bd4] dark:border-indigo-400">
          Profile Information
        </span>
      </div>

      {/* 3. Main Form Segment (All tabs currently route to Profile Info for visual simplicity) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start mt-2">
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

        {/* Right Side: Form Inputs */}
        <div className="lg:col-span-3 glass-panel p-6 sm:p-8 rounded-2xl border border-white/5 flex flex-col gap-6">
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
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500"
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
      </div>
    </div>
  );
}
