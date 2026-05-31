import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  Users,
  Plus,
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock,
  Sparkles,
  Edit,
  Download,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Calendar,
  X,
  Mail,
  Phone,
  Filter,
  Search,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Upload,
  UserPlus,
  Grid,
  BellRing
} from 'lucide-react';

export default function GuestManagement() {
  const { authFetch } = useAuth();
  const { showToast } = useNotifications();

  // General States
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dropdown / Tab filters
  const [showEventSelector, setShowEventSelector] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeActionsMenuId, setActiveActionsMenuId] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Modal / Form States
  const [isAddGuestOpen, setIsAddGuestOpen] = useState(false);
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestEmail, setNewGuestEmail] = useState('');
  const [newGuestPhone, setNewGuestPhone] = useState('');
  const [newGuestGroup, setNewGuestGroup] = useState('Family Table 1');
  const [newGuestStatus, setNewGuestStatus] = useState('confirmed');
  const [newGuestDiet, setNewGuestDiet] = useState('Vegetarian');

  const actionsDropdownRef = useRef(null);

  // Fallback defaults if database is empty
  const fallbackEvent = {
    id: 9999,
    title: 'Rahul & Priya Wedding',
    date: '2024-12-25',
    location: 'The Leela Palace, Udaipur',
    budget: 1500000,
    event_type: 'Wedding'
  };

  const fallbackGuests = [
    { id: 1, guest_name: 'Aarav Sharma', email: 'aarav.sharma@email.com', phone: '+91 98765 43210', group_table: 'Family Table 1', status: 'confirmed', dietary: 'Vegetarian', invited_on: '2024-05-01' },
    { id: 2, guest_name: 'Priya Patel', email: 'priya.patel@email.com', phone: '+91 87654 32109', group_table: 'Friends Table 2', status: 'pending', dietary: 'Jain', invited_on: '2024-05-01' },
    { id: 3, guest_name: 'Rohan Mehta', email: 'rohan.mehta@email.com', phone: '+91 76543 21098', group_table: 'Office Table 3', status: 'confirmed', dietary: 'Non-Vegetarian', invited_on: '2024-05-02' },
    { id: 4, guest_name: 'Sneha Iyer', email: 'sneha.iyer@email.com', phone: '+91 65432 10987', group_table: 'Family Table 1', status: 'declined', dietary: 'Vegetarian', invited_on: '2024-05-02' },
    { id: 5, guest_name: 'Vikram Singh', email: 'vikram.singh@email.com', phone: '+91 54321 09876', group_table: 'Colleagues Table 4', status: 'no response', dietary: 'Non-Vegetarian', invited_on: '2024-05-03' }
  ];

  // Fetch all events
  const fetchEvents = async () => {
    try {
      const res = await authFetch('/events');
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
        if (data.length > 0) {
          setSelectedEvent(data[0]);
        } else {
          setSelectedEvent(fallbackEvent);
        }
      } else {
        setSelectedEvent(fallbackEvent);
      }
    } catch (err) {
      setSelectedEvent(fallbackEvent);
    }
  };

  // Fetch guests for selected event
  const fetchGuestsList = async (eventId) => {
    if (!eventId || eventId === 9999) {
      setGuests(fallbackGuests);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await authFetch(`/guests/${eventId}`);
      if (res.ok) {
        const data = await res.json();
        // Map db guests (status: confirmed/pending/declined) to mockup fields
        const mapped = data.map((g, idx) => ({
          id: g.id,
          guest_name: g.guest_name,
          email: g.email,
          phone: `+91 98765 ${50000 + idx}`, // mock phone index
          group_table: idx % 3 === 0 ? 'Family Table 1' : idx % 3 === 1 ? 'Friends Table 2' : 'Office Table 3',
          status: g.status, // confirmed, pending, declined
          dietary: idx % 2 === 0 ? 'Vegetarian' : 'Non-Vegetarian',
          invited_on: new Date(g.created_at).toISOString().split('T')[0]
        }));
        setGuests(mapped);
      } else {
        setGuests(fallbackGuests);
      }
    } catch (err) {
      setGuests(fallbackGuests);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      fetchGuestsList(selectedEvent.id);
    }
  }, [selectedEvent]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (actionsDropdownRef.current && !actionsDropdownRef.current.contains(event.target)) {
        setActiveActionsMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter Reset on Tab or Query Change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

  // Add Guest API Submit
  const handleAddGuestSubmit = async (e) => {
    e.preventDefault();
    if (!newGuestName || !newGuestEmail) {
      showToast('Please fill in name and email fields', 'error');
      return;
    }

    if (selectedEvent.id === 9999) {
      // Mock add guest
      const newGuestObj = {
        id: Date.now(),
        guest_name: newGuestName,
        email: newGuestEmail,
        phone: newGuestPhone || '+91 90000 12345',
        group_table: newGuestGroup,
        status: newGuestStatus, // confirmed, pending, declined, no response
        dietary: newGuestDiet,
        invited_on: new Date().toISOString().split('T')[0]
      };
      setGuests(prev => [newGuestObj, ...prev]);
      showToast(`Successfully added guest "${newGuestName}"!`, 'success');
      setIsAddGuestOpen(false);
      setNewGuestName('');
      setNewGuestEmail('');
      setNewGuestPhone('');
      return;
    }

    try {
      const res = await authFetch('/guest/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          guest_name: newGuestName,
          email: newGuestEmail,
          status: newGuestStatus // Maps confirmed / pending / declined
        })
      });
      if (res.ok) {
        showToast(`Successfully added guest "${newGuestName}"!`, 'success');
        setIsAddGuestOpen(false);
        setNewGuestName('');
        setNewGuestEmail('');
        setNewGuestPhone('');
        fetchGuestsList(selectedEvent.id);
      } else {
        const data = await res.json();
        showToast(data.message || 'Error registering guest', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Delete Guest API
  const handleDeleteGuest = async (guestId, guestName) => {
    if (!window.confirm(`Are you sure you want to remove "${guestName}" from guest list?`)) return;

    if (selectedEvent.id === 9999) {
      setGuests(prev => prev.filter(g => g.id !== guestId));
      showToast(`Removed "${guestName}" from guest list`, 'info');
      setActiveActionsMenuId(null);
      return;
    }

    try {
      const res = await authFetch(`/guest/${guestId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(`Guest "${guestName}" deleted`, 'success');
        fetchGuestsList(selectedEvent.id);
        setActiveActionsMenuId(null);
      } else {
        const data = await res.json();
        showToast(data.message || 'Failed to remove guest', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Dynamic statistics calculations
  const totalCount = selectedEvent?.id === 9999 ? 450 : guests.length;
  
  const getStat = (statusType) => {
    if (selectedEvent?.id === 9999) {
      if (statusType === 'confirmed') return 280;
      if (statusType === 'pending') return 95;
      if (statusType === 'declined') return 50;
      if (statusType === 'no response') return 25;
      return 450;
    }
    return guests.filter(g => g.status === statusType).length;
  };

  const goingCount = getStat('confirmed');
  const pendingCount = getStat('pending');
  const declinedCount = getStat('declined');
  const noResponseCount = getStat('no response');

  const getPercentage = (part, total) => {
    if (!total) return 0;
    return ((part / total) * 100).toFixed(1);
  };

  // Filter Table List
  const filteredGuests = guests.filter(g => {
    const matchesSearch = g.guest_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.group_table.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesTab = true;
    if (activeTab === 'Going') matchesTab = g.status === 'confirmed';
    else if (activeTab === 'Pending') matchesTab = g.status === 'pending';
    else if (activeTab === 'Not Going') matchesTab = g.status === 'declined';
    else if (activeTab === 'No Response') matchesTab = g.status === 'no response';

    return matchesSearch && matchesTab;
  });

  // Pagination calculations
  const totalPages = Math.max(Math.ceil(filteredGuests.length / pageSize), 1);
  const paginatedGuests = filteredGuests.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-12 font-medium">
      {/* 1. Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white dark:text-white">
            Guest Management
          </h1>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            Manage your guests, RSVPs, and seating arrangements.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
          <button
            onClick={() => setIsAddGuestOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#5a2bd4] hover:bg-[#4c24b5] always-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-500/10 transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Guests
          </button>
          <button
            onClick={() => showToast('Importing guests spreadsheet template...', 'info')}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-gray-300 dark:hover:text-white flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            Import Guests
          </button>
          <button
            onClick={() => showToast('Exporting guest list to CSV...', 'success')}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-gray-300 dark:hover:text-white flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export List
          </button>
        </div>
      </div>

      {/* 2. Selector Dropdown & 6 Stats Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 items-stretch relative z-30">
        {/* Selector Dropdown Card */}
        <div className="lg:col-span-1 glass-panel p-4 rounded-2xl border border-white/5 relative z-40 flex flex-col justify-center shrink-0">
          <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-2">Select Event</span>
          <div className="relative">
            <button
              onClick={() => setShowEventSelector(!showEventSelector)}
              className="w-full flex items-center gap-3 p-2 bg-white/2 border border-white/10 rounded-xl hover:border-indigo-500/35 transition-all text-left cursor-pointer font-bold"
            >
              {selectedEvent && (
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-white dark:text-white truncate leading-tight">
                    {selectedEvent.title}
                  </span>
                  <span className="text-[9px] text-gray-500 truncate mt-1">
                    {selectedEvent.location.split(',')[0]}
                  </span>
                </div>
              )}
            </button>

            {showEventSelector && (
              <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-[#151c2c] border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl p-1.5 z-50 max-h-60 overflow-y-auto animate-scale-up font-bold text-xs">
                {events.length === 0 ? (
                  <button
                    onClick={() => {
                      setSelectedEvent(fallbackEvent);
                      setShowEventSelector(false);
                    }}
                    className="w-full text-left p-2 rounded-lg text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 truncate"
                  >
                    Rahul & Priya Wedding (Mock)
                  </button>
                ) : (
                  events.map(ev => (
                    <button
                      key={ev.id}
                      onClick={() => {
                        setSelectedEvent(ev);
                        setShowEventSelector(false);
                      }}
                      className="w-full text-left p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 truncate flex flex-col gap-0.5"
                    >
                      <span className="text-gray-900 dark:text-white font-bold">{ev.title}</span>
                      <span className="text-[9px] text-gray-500 dark:text-gray-400">{ev.location}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* 5 Stats metrics Cards (col-span-5) */}
        <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4 font-medium">
          {/* Card 1: Total Guests */}
          <div className="glass-card p-4 rounded-2xl flex items-center justify-between border border-white/5 shadow-sm">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Guests</span>
              <span className="text-xl font-extrabold text-white dark:text-white">{totalCount}</span>
              <button onClick={() => setActiveTab('All')} className="text-[9px] text-[#5a2bd4] dark:text-indigo-400 font-extrabold hover:underline text-left mt-1">
                View all guests &rarr;
              </button>
            </div>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[#5a2bd4] dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Users className="w-4.5 h-4.5" />
            </div>
          </div>

          {/* Card 2: Going */}
          <div className="glass-card p-4 rounded-2xl flex items-center justify-between border border-white/5 shadow-sm">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Going</span>
              <span className="text-xl font-extrabold text-white dark:text-white">{goingCount}</span>
              <span className="text-[9px] text-emerald-500 font-bold mt-1">
                {getPercentage(goingCount, totalCount)}% of total
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4.5 h-4.5" />
            </div>
          </div>

          {/* Card 3: Pending */}
          <div className="glass-card p-4 rounded-2xl flex items-center justify-between border border-white/5 shadow-sm">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Pending</span>
              <span className="text-xl font-extrabold text-white dark:text-white">{pendingCount}</span>
              <span className="text-[9px] text-[#f59e0b] font-bold mt-1">
                {getPercentage(pendingCount, totalCount)}% of total
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
              <Clock className="w-4.5 h-4.5" />
            </div>
          </div>

          {/* Card 4: Not Going */}
          <div className="glass-card p-4 rounded-2xl flex items-center justify-between border border-white/5 shadow-sm">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Not Going</span>
              <span className="text-xl font-extrabold text-white dark:text-white">{declinedCount}</span>
              <span className="text-[9px] text-rose-500 font-bold mt-1">
                {getPercentage(declinedCount, totalCount)}% of total
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
              <X className="w-4.5 h-4.5" />
            </div>
          </div>

          {/* Card 5: Sent Rate */}
          <div className="glass-card p-4 rounded-2xl flex items-center justify-between border border-white/5 shadow-sm col-span-2 sm:col-span-1">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Response Rate</span>
              <span className="text-xl font-extrabold text-white dark:text-white">
                {getPercentage(goingCount + declinedCount, totalCount)}%
              </span>
              <button onClick={() => showToast('Redirecting to RSVP report analytics...', 'info')} className="text-[9px] text-[#5a2bd4] dark:text-indigo-400 font-extrabold hover:underline text-left mt-1">
                View reports &rarr;
              </button>
            </div>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4.5 h-4.5" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Mid Grid Layout (Donut RSVP, Line Trend SVG, Summary lists) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {/* Left Column: RSVP Overview Donut Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between gap-5">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <h3 className="text-xs font-bold text-gray-200 dark:text-white uppercase tracking-wider">
              RSVP Overview
            </h3>
          </div>

          <div className="flex items-center justify-between gap-6 py-1">
            {/* SVG Donut Chart */}
            <div className="relative w-28 h-28 shrink-0">
              <svg viewBox="0 0 100 100" className="w-28 h-28 transform -rotate-90">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="10" strokeDasharray="156.2 251.2" strokeDashoffset="0" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f59e0b" strokeWidth="10" strokeDasharray="53 251.2" strokeDashoffset="-156.2" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f43f5e" strokeWidth="10" strokeDasharray="27.9 251.2" strokeDashoffset="-209.2" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#64748b" strokeWidth="10" strokeDasharray="14.1 251.2" strokeDashoffset="-237.1" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xs font-extrabold text-white dark:text-white leading-none">
                  {totalCount}
                </span>
                <span className="text-[8px] text-gray-500 font-bold uppercase mt-1">Guests</span>
              </div>
            </div>

            {/* Legend details */}
            <div className="flex flex-col gap-1.5 w-full text-[9px] font-bold text-gray-300">
              <div className="flex justify-between items-center pb-0.5">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#10b981] shrink-0"></span>
                  <span>Going ({getPercentage(goingCount, totalCount)}%)</span>
                </div>
                <span className="text-gray-500">{goingCount}</span>
              </div>
              <div className="flex justify-between items-center pb-0.5">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#f59e0b] shrink-0"></span>
                  <span>Pending ({getPercentage(pendingCount, totalCount)}%)</span>
                </div>
                <span className="text-gray-500">{pendingCount}</span>
              </div>
              <div className="flex justify-between items-center pb-0.5">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#f43f5e] shrink-0"></span>
                  <span>Not Going ({getPercentage(declinedCount, totalCount)}%)</span>
                </div>
                <span className="text-gray-500">{declinedCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#64748b] shrink-0"></span>
                  <span>No Response ({getPercentage(noResponseCount, totalCount)}%)</span>
                </div>
                <span className="text-gray-500">{noResponseCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column: Guest RSVP Trend Line Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between gap-4">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <h3 className="text-xs font-bold text-gray-200 dark:text-white uppercase tracking-wider">
              Guest Trend
            </h3>
            <span className="text-[9px] text-gray-500 border border-white/10 rounded-lg px-2 py-0.5 font-bold uppercase">This Event</span>
          </div>

          {/* SVG Line Chart Graph */}
          <div className="relative w-full h-28 flex flex-col justify-between">
            <svg viewBox="0 0 500 150" className="w-full h-full">
              {/* Grid Lines */}
              <line x1="0" y1="120" x2="500" y2="120" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="0" y1="40" x2="500" y2="40" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              
              {/* Gradient Area under Curve */}
              <defs>
                <linearGradient id="purpleTrendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(90, 43, 212, 0.3)" />
                  <stop offset="100%" stopColor="rgba(90, 43, 212, 0.0)" />
                </linearGradient>
              </defs>

              {/* Shaded Area */}
              <path
                d="M 10 130 C 80 115, 160 90, 240 70 C 320 50, 400 35, 480 20 L 480 140 L 10 140 Z"
                fill="url(#purpleTrendGrad)"
              />

              {/* Stroke Line */}
              <path
                d="M 10 130 C 80 115, 160 90, 240 70 C 320 50, 400 35, 480 20"
                fill="transparent"
                stroke="#5a2bd4"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Data Points Dot indicators */}
              <circle cx="10" cy="130" r="4.5" fill="#5a2bd4" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="100" cy="112" r="4.5" fill="#5a2bd4" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="200" cy="80" r="4.5" fill="#5a2bd4" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="300" cy="60" r="4.5" fill="#5a2bd4" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="400" cy="40" r="4.5" fill="#5a2bd4" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="480" cy="20" r="4.5" fill="#5a2bd4" stroke="#ffffff" strokeWidth="1.5" />
            </svg>
            <div className="flex justify-between items-center text-[8px] text-gray-500 font-bold uppercase px-1">
              <span>1 May</span>
              <span>8 May</span>
              <span>15 May</span>
              <span>22 May</span>
              <span>29 May</span>
              <span>5 Jun</span>
            </div>
          </div>
        </div>

        {/* Right Column: Invitations Summary Card */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between gap-5">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <h3 className="text-xs font-bold text-gray-200 dark:text-white uppercase tracking-wider">
              Invitations Summary
            </h3>
          </div>

          <div className="flex flex-col gap-3 font-semibold text-[10.5px] text-gray-300">
            <div className="flex justify-between items-center pb-2 border-b border-white/3">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-indigo-500/10 text-indigo-400 shrink-0"><Mail className="w-3.5 h-3.5" /></span>
                <span className="text-gray-400">Invitations Sent:</span>
              </div>
              <span className="font-outfit text-white font-bold">425 (94.4%)</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-white/3">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-amber-500/10 text-amber-500 shrink-0"><Clock className="w-3.5 h-3.5" /></span>
                <span className="text-gray-400">Invitations Opened:</span>
              </div>
              <span className="font-outfit text-white font-bold">310 (72.9%)</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-white/3">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-emerald-500/10 text-emerald-500 shrink-0"><CheckCircle2 className="w-3.5 h-3.5" /></span>
                <span className="text-gray-400">Responses Received:</span>
              </div>
              <span className="font-outfit text-white font-bold">330 (77.6%)</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-rose-500/10 text-rose-500 shrink-0"><BellRing className="w-3.5 h-3.5" /></span>
                <span className="text-gray-400">Reminders Sent:</span>
              </div>
              <span className="font-outfit text-white font-bold">120 (26.7%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Grid Layout (Guest List Table & Group Tables / Seating) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column (col-span-2): Guest List table catalog */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/5 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 pb-2 border-b border-white/5">
            {/* Table Horizontal Tabs */}
            <div className="flex gap-4 overflow-x-auto text-[11px] font-bold text-gray-500 scrollbar-none">
              {[
                { id: 'All', label: `All Guests (${totalCount})` },
                { id: 'Going', label: `Going (${goingCount})` },
                { id: 'Pending', label: `Pending (${pendingCount})` },
                { id: 'Not Going', label: `Not Going (${declinedCount})` }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-1 relative cursor-pointer whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'text-[#5a2bd4] dark:text-indigo-400 border-b-2 border-[#5a2bd4] dark:border-indigo-400'
                      : 'hover:text-gray-800 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* In-table Search box */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="relative w-44">
                <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search guests..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-[10px] text-gray-200 focus:outline-none"
                />
              </div>
              <button className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer">
                <Filter className="w-3 h-3" /> Filter
              </button>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs border-collapse min-w-[650px]">
              <thead>
                <tr className="border-b border-white/5 text-gray-500 font-bold uppercase tracking-wider bg-white/[0.005]">
                  <th className="py-3 px-4 w-10">
                    <input type="checkbox" className="rounded bg-white/5 border-white/10 text-indigo-500 cursor-pointer" />
                  </th>
                  <th className="py-3 px-3">Guest Name</th>
                  <th className="py-3 px-3">Contact</th>
                  <th className="py-3 px-3">Group / Table</th>
                  <th className="py-3 px-3">RSVP Status</th>
                  <th className="py-3 px-3">Dietary</th>
                  <th className="py-3 px-3">Invited On</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/2 text-gray-300 font-semibold">
                {paginatedGuests.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-gray-500">
                      No guests logged matching criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedGuests.map(guest => (
                    <tr key={guest.id} className="hover:bg-white/[0.01] transition-colors relative">
                      <td className="py-3.5 px-4 w-10">
                        <input type="checkbox" className="rounded bg-white/5 border-white/10 text-indigo-500 cursor-pointer" />
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-indigo-500/10 text-indigo-400 font-extrabold flex items-center justify-center text-[10px] uppercase shrink-0 border border-[#5a2bd4]/20">
                            {guest.guest_name[0]}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-gray-200 dark:text-white truncate max-w-[130px] leading-tight">{guest.guest_name}</span>
                            <span className="text-[9px] text-gray-500 truncate mt-0.5">{guest.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-outfit text-gray-400 text-[10.5px]">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-gray-500 shrink-0" />
                          {guest.phone}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-gray-400 text-[11px]">
                        {guest.group_table}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2.5 py-1 rounded-full text-[8px] font-extrabold uppercase border ${
                          guest.status === 'confirmed'
                            ? 'bg-emerald-500/5 border-emerald-500/25 text-emerald-500'
                            : guest.status === 'pending'
                            ? 'bg-amber-500/5 border-amber-500/25 text-amber-500'
                            : guest.status === 'declined'
                            ? 'bg-rose-500/5 border-rose-500/25 text-rose-500'
                            : 'bg-slate-500/5 border-slate-500/25 text-slate-400'
                        }`}>
                          {guest.status === 'confirmed' ? 'Going' : guest.status === 'declined' ? 'Not Going' : guest.status === 'no response' ? 'No Response' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold border ${
                          guest.dietary === 'Vegetarian'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                            : guest.dietary === 'Jain'
                            ? 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400'
                            : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
                        }`}>
                          {guest.dietary}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-gray-500 text-[10.5px] font-outfit">
                        {new Date(guest.invited_on).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-3.5 px-4 text-right relative">
                        <div className="inline-block" ref={activeActionsMenuId === guest.id ? actionsDropdownRef : null}>
                          <button
                            onClick={() => setActiveActionsMenuId(activeActionsMenuId === guest.id ? null : guest.id)}
                            className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors cursor-pointer"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>

                          {activeActionsMenuId === guest.id && (
                            <div className="absolute right-5 mt-1 w-28 bg-[#151c2c] border border-white/10 rounded-xl shadow-2xl p-1 z-20 text-left animate-scale-up">
                              <button
                                onClick={() => handleDeleteGuest(guest.id, guest.guest_name)}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px] text-rose-400 hover:bg-rose-500/5 transition-all text-left font-semibold cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                Remove Guest
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filteredGuests.length > 0 && (
            <div className="px-4 py-3.5 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-bold text-gray-500 bg-white/[0.005]">
              <span>
                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredGuests.length)} of {filteredGuests.length} guests
              </span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="p-1 rounded-lg border border-white/5 bg-white/3 disabled:opacity-30 text-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pNum = i + 1;
                    return (
                      <button
                        key={pNum}
                        onClick={() => setCurrentPage(pNum)}
                        className={`w-6 h-6 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center cursor-pointer ${
                          currentPage === pNum
                            ? 'bg-[#5a2bd4] text-white'
                            : 'bg-white/3 border border-white/5 text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {pNum}
                      </button>
                    );
                  })}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="p-1 rounded-lg border border-white/5 bg-white/3 disabled:opacity-30 text-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="border-l border-white/5 pl-4">
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(parseInt(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-white/5 border border-white/10 rounded-lg px-2 py-0.5 text-[9px] text-gray-400 focus:outline-none font-bold cursor-pointer"
                  >
                    <option value="5" className="bg-[#151c2c]">5 / page</option>
                    <option value="10" className="bg-[#151c2c]">10 / page</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: RSVP Tables seating arrangement & Quick Actions */}
        <div className="flex flex-col gap-8">
          {/* Seating Arrangement by Table Progress */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="text-xs font-bold text-gray-200 dark:text-white uppercase tracking-wider">
                RSVP by Group / Table
              </h3>
              <button onClick={() => showToast('Redirecting to Seating chart view...', 'info')} className="text-[10px] text-[#5a2bd4] dark:text-indigo-400 font-extrabold hover:underline">
                View All
              </button>
            </div>

            <div className="flex flex-col gap-3.5 text-[10px] font-bold text-gray-300">
              {[
                { name: 'Table 1 (Family)', current: 45, max: 60, color: '#10b981' },
                { name: 'Table 2 (Friends)', current: 38, max: 50, color: '#f59e0b' },
                { name: 'Table 3 (Office)', current: 30, max: 45, color: '#5a2bd4' },
                { name: 'Table 4 (Colleagues)', current: 28, max: 40, color: '#6366f1' },
                { name: 'Table 5 (Others)', current: 20, max: 35, color: '#f43f5e' }
              ].map(table => (
                <div key={table.name} className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-gray-300">
                    <span>{table.name}</span>
                    <span className="text-gray-400 font-outfit">{table.current} / {table.max}</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 border border-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: table.color,
                        width: `${(table.current / table.max) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col gap-4">
            <h3 className="text-xs font-bold text-gray-200 dark:text-white uppercase tracking-wider pb-2 border-b border-white/5">
              Quick Actions
            </h3>

            <div className="grid grid-cols-2 gap-4 font-extrabold text-[10px] text-gray-400 text-center">
              <button
                onClick={() => showToast('Sending email alerts and RSVP reminders...', 'success')}
                className="flex flex-col items-center justify-center gap-2 p-3 bg-white/2 border border-white/5 rounded-xl hover:border-indigo-500/25 transition-all text-gray-300 hover:text-white cursor-pointer"
              >
                <BellRing className="w-5 h-5 text-indigo-400" />
                <span>Send Reminder</span>
              </button>
              <button
                onClick={() => showToast('Bulk RSVP editor initialized', 'info')}
                className="flex flex-col items-center justify-center gap-2 p-3 bg-white/2 border border-white/5 rounded-xl hover:border-indigo-500/25 transition-all text-gray-300 hover:text-white cursor-pointer"
              >
                <Edit className="w-5 h-5 text-indigo-400" />
                <span>Bulk Update</span>
              </button>
              <button
                onClick={() => showToast('Group management menu active', 'info')}
                className="flex flex-col items-center justify-center gap-2 p-3 bg-white/2 border border-white/5 rounded-xl hover:border-indigo-500/25 transition-all text-gray-300 hover:text-white cursor-pointer"
              >
                <UserPlus className="w-5 h-5 text-indigo-400" />
                <span>Add to Group</span>
              </button>
              <button
                onClick={() => showToast('Opening visual Seating Blueprint planner...', 'success')}
                className="flex flex-col items-center justify-center gap-2 p-3 bg-white/2 border border-white/5 rounded-xl hover:border-indigo-500/25 transition-all text-gray-300 hover:text-white cursor-pointer"
              >
                <Grid className="w-5 h-5 text-indigo-400" />
                <span>Seating Plan</span>
              </button>
            </div>
          </div>

          {/* Recent RSVP Activities Feed */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="text-xs font-bold text-gray-200 dark:text-white uppercase tracking-wider">
                Recent Activities
              </h3>
              <button onClick={() => showToast('Opening activity history logs...', 'info')} className="text-[10px] text-[#5a2bd4] dark:text-indigo-400 font-extrabold hover:underline">
                View All
              </button>
            </div>

            <div className="flex flex-col gap-3 font-semibold text-[10px] text-gray-400">
              <div className="flex gap-2.5 items-start border-b border-white/3 pb-2.5 last:border-0 last:pb-0">
                <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1.5"></span>
                <div className="flex flex-col gap-0.5">
                  <span className="text-gray-200 dark:text-white leading-snug">Reminder sent to 120 guests</span>
                  <span className="text-[9px] text-gray-500">2 hours ago</span>
                </div>
              </div>
              <div className="flex gap-2.5 items-start border-b border-white/3 pb-2.5 last:border-0 last:pb-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1.5"></span>
                <div className="flex flex-col gap-0.5">
                  <span className="text-gray-200 dark:text-white leading-snug">Priya Patel responded <strong className="text-emerald-500">Going</strong></span>
                  <span className="text-[9px] text-gray-500">5 hours ago</span>
                </div>
              </div>
              <div className="flex gap-2.5 items-start border-b border-white/3 pb-2.5 last:border-0 last:pb-0">
                <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0 mt-1.5"></span>
                <div className="flex flex-col gap-0.5">
                  <span className="text-gray-200 dark:text-white leading-snug">5 new guests added to list</span>
                  <span className="text-[9px] text-gray-500">1 day ago</span>
                </div>
              </div>
              <div className="flex gap-2.5 items-start">
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1.5"></span>
                <div className="flex flex-col gap-0.5">
                  <span className="text-gray-200 dark:text-white leading-snug">Seating arrangement plan updated</span>
                  <span className="text-[9px] text-gray-500">2 days ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: Add New Guest Form */}
      {isAddGuestOpen && (
        <div className="fixed inset-0 bg-[#07080a]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-white/10 shadow-2xl p-6 flex flex-col gap-6 animate-scale-up">
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UserPlus className="w-4.5 h-4.5 text-indigo-400" />
                Add Guest to Event Invitation
              </h3>
              <button
                onClick={() => setIsAddGuestOpen(false)}
                className="text-gray-400 hover:text-white font-extrabold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddGuestSubmit} className="flex flex-col gap-4 font-bold">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase">Guest Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Sharma"
                  value={newGuestName}
                  onChange={(e) => setNewGuestName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. aarav@email.com"
                  value={newGuestEmail}
                  onChange={(e) => setNewGuestEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Phone Contact</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98765 43210"
                    value={newGuestPhone}
                    onChange={(e) => setNewGuestPhone(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Group / Table Designation</label>
                  <select
                    value={newGuestGroup}
                    onChange={(e) => setNewGuestGroup(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-gray-300 focus:outline-none cursor-pointer"
                  >
                    <option value="Family Table 1" className="bg-[#151c2c]">Family Table 1</option>
                    <option value="Friends Table 2" className="bg-[#151c2c]">Friends Table 2</option>
                    <option value="Office Table 3" className="bg-[#151c2c]">Office Table 3</option>
                    <option value="Colleagues Table 4" className="bg-[#151c2c]">Colleagues Table 4</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">RSVP Status</label>
                  <select
                    value={newGuestStatus}
                    onChange={(e) => setNewGuestStatus(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-gray-300 focus:outline-none cursor-pointer"
                  >
                    <option value="confirmed" className="bg-[#151c2c]">Going (Confirmed)</option>
                    <option value="pending" className="bg-[#151c2c]">Pending Response</option>
                    <option value="declined" className="bg-[#151c2c]">Not Going (Declined)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Dietary Choice</label>
                  <select
                    value={newGuestDiet}
                    onChange={(e) => setNewGuestDiet(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-gray-300 focus:outline-none cursor-pointer"
                  >
                    <option value="Vegetarian" className="bg-[#151c2c]">Vegetarian</option>
                    <option value="Non-Vegetarian" className="bg-[#151c2c]">Non-Vegetarian</option>
                    <option value="Jain" className="bg-[#151c2c]">Jain</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsAddGuestOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/5 bg-white/3 hover:bg-white/7 transition-all text-xs font-bold text-gray-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#5a2bd4] hover:bg-[#4c24b5] always-white text-xs font-bold transition-all shadow-md shadow-indigo-600/15 cursor-pointer"
                >
                  Register Guest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
