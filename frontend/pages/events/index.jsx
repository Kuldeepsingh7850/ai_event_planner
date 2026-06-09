import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  CalendarDays,
  Search,
  Filter,
  Plus,
  MapPin,
  Users,
  Receipt,
  Eye,
  Trash2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles
} from 'lucide-react';

export default function EventsCatalog() {
  const { authFetch } = useAuth();
  const { showToast } = useNotifications();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search, filter & tab states
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [activeActionsMenuId, setActiveActionsMenuId] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const actionsDropdownRef = useRef(null);

  const fetchEvents = async () => {
    try {
      const res = await authFetch('/events');
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (err) {
      showToast(err.message || 'Error loading events catalog', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Close actions dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (actionsDropdownRef.current && !actionsDropdownRef.current.contains(event.target)) {
        setActiveActionsMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete event "${title}"? This cannot be undone.`)) {
      return;
    }
    try {
      const res = await authFetch(`/delete-event/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(`Event "${title}" has been successfully deleted`, 'success');
        setEvents(prev => prev.filter(e => e.id !== id));
        setActiveActionsMenuId(null);
      } else {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete event');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Reset pagination on search or tab change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeTab]);

  // Statistics Calculations
  const stats = {
    total: events.length,
    upcoming: events.filter(e => e.status === 'planning' || e.status === 'upcoming' || e.status === 'approved' || e.status === 'pending').length,
    inProgress: events.filter(e => e.status === 'ongoing' || e.status === 'in progress').length,
    completed: events.filter(e => e.status === 'completed').length,
    cancelled: events.filter(e => e.status === 'cancelled').length
  };

  // Filter Logic
  const filteredEvents = events.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase()) ||
      (e.description && e.description.toLowerCase().includes(search.toLowerCase())) ||
      e.location.toLowerCase().includes(search.toLowerCase()) ||
      e.event_type.toLowerCase().includes(search.toLowerCase());

    let matchesTab = true;
    if (activeTab === 'Upcoming') {
      matchesTab = e.status === 'planning' || e.status === 'upcoming' || e.status === 'approved' || e.status === 'pending';
    } else if (activeTab === 'In Progress') {
      matchesTab = e.status === 'ongoing' || e.status === 'in progress';
    } else if (activeTab === 'Completed') {
      matchesTab = e.status === 'completed';
    } else if (activeTab === 'Cancelled') {
      matchesTab = e.status === 'cancelled';
    }

    return matchesSearch && matchesTab;
  });

  // Client-side Pagination calculations
  const totalPages = Math.max(Math.ceil(filteredEvents.length / pageSize), 1);
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Cover image mapping helper
  const getEventCover = (category) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('wed')) return '/leela_palace.jpg';
    if (cat.includes('birth')) return '/hero_udaipur_3.jpg';
    if (cat.includes('corp') || cat.includes('conf')) return '/oberoi_udaivilas.jpg';
    if (cat.includes('coll') || cat.includes('fest')) return '/monsoon_palace.jpg';
    if (cat.includes('priv') || cat.includes('party')) return '/jag_mandir.jpg';
    return '/hero_udaipur_1.jpg';
  };

  // Indian Currency formatter
  const formatRupee = (num) => {
    return '₹ ' + Math.round(num).toLocaleString('en-IN');
  };

  // Time formatter
  const formatTime = (timeStr) => {
    if (!timeStr) return '10:00 AM';
    try {
      const [hour, minute] = timeStr.split(':');
      const h = parseInt(hour);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const hour12 = h % 12 === 0 ? 12 : h % 12;
      return `${hour12}:${minute} ${ampm}`;
    } catch (e) {
      return timeStr;
    }
  };

  // Category Colors mapping helper
  const getCategoryColor = (category) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('wed')) return 'bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400';
    if (cat.includes('birth')) return 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400';
    if (cat.includes('corp') || cat.includes('conf')) return 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400';
    if (cat.includes('shower')) return 'bg-pink-500/10 border-pink-500/20 text-pink-600 dark:text-pink-400';
    if (cat.includes('fest')) return 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400';
    if (cat.includes('meet')) return 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400';
    return 'bg-gray-500/10 border-gray-500/20 text-gray-600 dark:text-gray-400';
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 max-w-7xl mx-auto">
        <div className="h-8 bg-white/5 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse"></div>
          ))}
        </div>
        <div className="h-96 bg-white/5 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-12 font-medium">
      {/* 1. Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white dark:text-white">
            My Events
          </h1>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            Manage and track all your events in one place.
          </p>
        </div>
        <Link
          href="/ai"
          className="px-4 py-2.5 rounded-xl bg-[#5a2bd4] hover:bg-[#4c24b5] always-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-500/10 transition-all transform hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          Create New Event
        </Link>
      </div>

      {/* 2. Filter Tabs & Search Bar Container */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4 border-b border-white/5 pb-2">
        {/* Navigation Tabs */}
        <div className="flex gap-2 sm:gap-6 overflow-x-auto w-full lg:w-auto scrollbar-none pb-2 lg:pb-0 text-xs sm:text-sm">
          {[
            { id: 'All', label: 'All Events' },
            { id: 'Upcoming', label: 'Upcoming' },
            { id: 'In Progress', label: 'In Progress' },
            { id: 'Completed', label: 'Completed' },
            { id: 'Cancelled', label: 'Cancelled' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-2 px-1 font-bold whitespace-nowrap transition-all border-b-2 relative -bottom-[10px] cursor-pointer ${
                activeTab === tab.id
                  ? 'border-[#5a2bd4] text-[#5a2bd4] dark:text-indigo-400 dark:border-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input & Action Filter Button */}
        <div className="flex items-center gap-3 w-full lg:w-auto shrink-0">
          <div className="relative flex-1 lg:w-60">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-gray-300 dark:hover:text-white flex items-center gap-1.5 cursor-pointer">
            <Filter className="w-3.5 h-3.5" />
            Filter
          </button>
        </div>
      </div>

      {/* 3. 5 Stats Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Total Events */}
        <div
          onClick={() => setActiveTab('All')}
          className={`glass-card p-4 rounded-2xl flex items-center gap-3 border transition-all cursor-pointer ${
            activeTab === 'All' ? 'border-[#5a2bd4] bg-[#5a2bd4]/5 dark:border-indigo-500 dark:bg-indigo-500/5' : 'border-white/5'
          }`}
        >
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[#5a2bd4] dark:text-indigo-400 flex items-center justify-center shrink-0">
            <CalendarDays className="w-4.5 h-4.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 uppercase font-bold">Total Events</span>
            <span className="text-lg font-extrabold text-white dark:text-white">{stats.total}</span>
          </div>
        </div>

        {/* Upcoming */}
        <div
          onClick={() => setActiveTab('Upcoming')}
          className={`glass-card p-4 rounded-2xl flex items-center gap-3 border transition-all cursor-pointer ${
            activeTab === 'Upcoming' ? 'border-[#5a2bd4] bg-[#5a2bd4]/5 dark:border-indigo-500 dark:bg-indigo-500/5' : 'border-white/5'
          }`}
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
            <CalendarDays className="w-4.5 h-4.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 uppercase font-bold">Upcoming</span>
            <span className="text-lg font-extrabold text-white dark:text-white">{stats.upcoming}</span>
          </div>
        </div>

        {/* In Progress */}
        <div
          onClick={() => setActiveTab('In Progress')}
          className={`glass-card p-4 rounded-2xl flex items-center gap-3 border transition-all cursor-pointer ${
            activeTab === 'In Progress' ? 'border-[#5a2bd4] bg-[#5a2bd4]/5 dark:border-indigo-500 dark:bg-indigo-500/5' : 'border-white/5'
          }`}
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 uppercase font-bold">In Progress</span>
            <span className="text-lg font-extrabold text-white dark:text-white">{stats.inProgress}</span>
          </div>
        </div>

        {/* Completed */}
        <div
          onClick={() => setActiveTab('Completed')}
          className={`glass-card p-4 rounded-2xl flex items-center gap-3 border transition-all cursor-pointer ${
            activeTab === 'Completed' ? 'border-[#5a2bd4] bg-[#5a2bd4]/5 dark:border-indigo-500 dark:bg-indigo-500/5' : 'border-white/5'
          }`}
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center shrink-0">
            <CalendarDays className="w-4.5 h-4.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 uppercase font-bold">Completed</span>
            <span className="text-lg font-extrabold text-white dark:text-white">{stats.completed}</span>
          </div>
        </div>

        {/* Cancelled */}
        <div
          onClick={() => setActiveTab('Cancelled')}
          className={`glass-card p-4 rounded-2xl flex items-center gap-3 border transition-all cursor-pointer col-span-2 md:col-span-1 ${
            activeTab === 'Cancelled' ? 'border-[#5a2bd4] bg-[#5a2bd4]/5 dark:border-indigo-500 dark:bg-indigo-500/5' : 'border-white/5'
          }`}
        >
          <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
            <CalendarDays className="w-4.5 h-4.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 uppercase font-bold">Cancelled</span>
            <span className="text-lg font-extrabold text-white dark:text-white">{stats.cancelled}</span>
          </div>
        </div>
      </div>

      {/* 4. Events Data Table */}
      <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden shadow-md">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-white/5 text-gray-500 font-bold uppercase tracking-wider bg-white/[0.01]">
                <th className="py-4 px-5">Event Name</th>
                <th className="py-4 px-4">Type</th>
                <th className="py-4 px-4">Date</th>
                <th className="py-4 px-4">Guests</th>
                <th className="py-4 px-4">Budget</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/2 text-gray-300 font-semibold">
              {paginatedEvents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-500">
                    No events found matching current filter tab.
                  </td>
                </tr>
              ) : (
                paginatedEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-white/[0.02] transition-colors relative">
                    {/* Event Name */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={getEventCover(event.event_type)}
                          alt={event.title}
                          className="w-16 h-11 rounded-lg object-cover border border-white/5 shrink-0"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-gray-100 dark:text-white truncate max-w-[180px] leading-tight">
                            {event.title}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] text-gray-500 mt-1">
                            <MapPin className="w-3 h-3 text-indigo-400 shrink-0" />
                            {event.location}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Type Badge */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase border ${getCategoryColor(event.event_type)}`}>
                        {event.event_type}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-gray-300 dark:text-gray-200">
                          {new Date(event.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="text-[10px] text-gray-500 font-medium">
                          {formatTime(event.time)}
                        </span>
                      </div>
                    </td>

                    {/* Guests */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <Users className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                        <span>{event.guest_count}</span>
                      </div>
                    </td>

                    {/* Budget */}
                    <td className="py-3.5 px-4 font-outfit text-gray-300 dark:text-gray-200 font-bold">
                      {formatRupee(event.budget)}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase border ${
                        event.status === 'planning'
                          ? 'bg-indigo-500/5 border-indigo-500/25 text-indigo-400'
                          : event.status === 'ongoing' || event.status === 'in progress'
                          ? 'bg-amber-500/5 border-amber-500/25 text-amber-500'
                          : event.status === 'completed'
                          ? 'bg-emerald-500/5 border-emerald-500/25 text-emerald-500'
                          : 'bg-rose-500/5 border-rose-500/25 text-rose-500'
                      }`}>
                        {event.status === 'ongoing' || event.status === 'in progress' ? 'In Progress' : event.status}
                      </span>
                    </td>

                    {/* Action Dropdown Menu */}
                    <td className="py-3.5 px-5 text-right relative">
                      <div className="inline-block" ref={activeActionsMenuId === event.id ? actionsDropdownRef : null}>
                        <button
                          onClick={() => setActiveActionsMenuId(activeActionsMenuId === event.id ? null : event.id)}
                          className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors cursor-pointer"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {activeActionsMenuId === event.id && (
                          <div className="absolute right-6 mt-1 w-32 bg-[#151c2c] border border-white/10 rounded-xl shadow-2xl p-1 z-20 text-left animate-scale-up">
                            <Link
                              href={`/events/${event.id}`}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px] text-gray-300 hover:bg-white/5 hover:text-white transition-all font-semibold"
                            >
                              <Eye className="w-3.5 h-3.5 text-indigo-400" />
                              View Details
                            </Link>
                            <button
                              onClick={() => handleDelete(event.id, event.title)}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px] text-rose-400 hover:bg-rose-500/5 transition-all text-left font-semibold cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete Event
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

        {/* 5. Pagination Bar */}
        {filteredEvents.length > 0 && (
          <div className="px-5 py-4 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-bold text-gray-500 bg-white/[0.005]">
            {/* Showing details */}
            <span>
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredEvents.length)} of {filteredEvents.length} events
            </span>

            {/* Page selection controls */}
            <div className="flex items-center gap-4">
              {/* Pagination Arrows */}
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="p-1.5 rounded-lg border border-white/5 bg-white/3 hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none text-gray-400 hover:text-white transition-all cursor-pointer"
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
                  className="p-1.5 rounded-lg border border-white/5 bg-white/3 hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none text-gray-400 hover:text-white transition-all cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Page size dropdown */}
              <div className="flex items-center gap-2 border-l border-white/5 pl-4">
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(parseInt(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[9px] text-gray-400 font-bold focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="5" className="bg-[#151c2c]">5 / page</option>
                  <option value="10" className="bg-[#151c2c]">10 / page</option>
                  <option value="20" className="bg-[#151c2c]">20 / page</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
