import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

import {
  Calendar,
  Sparkles,
  Receipt,
  Users,
  AlertCircle,
  Plus,
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock,
  CheckSquare,
  ChevronRight,
  CheckCircle2,
  Activity,
  UserPlus,
  MessageSquare
} from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const { user, authFetch } = useAuth();
  const { notifications, unreadCount, markAllAsRead, showToast } = useNotifications();

  // General states
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Admin-specific states
  const [usersList, setUsersList] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [adminTab, setAdminTab] = useState('overview');

  // Admin dialogs / actions states
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedBudgetEventId, setSelectedBudgetEventId] = useState('');
  const [selectedBudgetExpenses, setSelectedBudgetExpenses] = useState([]);
  const [loadingExpenses, setLoadingExpenses] = useState(false);

  // Dynamic user stats states
  const [totalGuestsCount, setTotalGuestsCount] = useState(0);
  const [tasksCompletedCount, setTasksCompletedCount] = useState(0);
  const [tasksPendingCount, setTasksPendingCount] = useState(0);
  const [tasksInProgressCount, setTasksInProgressCount] = useState(0);
  const [tasksOverdueCount, setTasksOverdueCount] = useState(0);
  const [totalTasksCount, setTotalTasksCount] = useState(0);

  const fetchUserData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await authFetch('/events');
      if (res.ok) {
        const data = await res.json();
        setEvents(data);

        if (data && data.length > 0) {
          const guestPromises = data.map(event => authFetch(`/guests/${event.id}`).then(r => r.ok ? r.json() : []));
          const taskPromises = data.map(event => authFetch(`/tasks/${event.id}`).then(r => r.ok ? r.json() : []));

          const guestsLists = await Promise.all(guestPromises);
          const tasksLists = await Promise.all(taskPromises);

          const allGuests = guestsLists.flat();
          setTotalGuestsCount(allGuests.length);

          const allTasks = tasksLists.flat();
          setTotalTasksCount(allTasks.length);

          let completed = 0;
          let pending = 0;
          let inProgress = 0;
          let overdue = 0;

          const today = new Date();
          today.setHours(0, 0, 0, 0);

          allTasks.forEach((task, index) => {
            const parts = task.title.split(' || ');
            const visualStatus = parts[3] || (index % 2 === 0 ? 'To Do' : 'In Progress');

            let finalStatus = task.status === 'completed' ? 'Completed' : visualStatus;

            if (task.status === 'pending' && task.deadline) {
              const deadlineDate = new Date(task.deadline);
              if (deadlineDate < today) {
                finalStatus = 'Overdue';
              }
            }

            if (finalStatus === 'Completed') {
              completed++;
            } else if (finalStatus === 'In Progress') {
              inProgress++;
            } else if (finalStatus === 'Overdue') {
              overdue++;
            } else {
              pending++;
            }
          });

          setTasksCompletedCount(completed);
          setTasksInProgressCount(inProgress);
          setTasksPendingCount(pending);
          setTasksOverdueCount(overdue);
        } else {
          setTotalGuestsCount(0);
          setTotalTasksCount(0);
          setTasksCompletedCount(0);
          setTasksInProgressCount(0);
          setTasksPendingCount(0);
          setTasksOverdueCount(0);
        }
      }
    } catch (err) {
      if (!silent) showToast(err.message || 'Error loading dashboard statistics', 'error');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchAdminData = async () => {
    try {
      const [uRes, eRes, fRes] = await Promise.all([
        authFetch('/admin/users'),
        authFetch('/admin/events'),
        authFetch('/feedback')
      ]);

      if (uRes.ok && eRes.ok && fRes.ok) {
        const uData = await uRes.json();
        const eData = await eRes.json();
        const fData = await fRes.json();
        setUsersList(uData);
        setEvents(eData); // Admins see all events in the system
        setFeedbacks(fData);
      }
    } catch (err) {
      showToast(err.message || 'Error loading administration database records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        router.replace('/admin');
      } else {
        fetchUserData();
      }
    }
  }, [user, router]);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      const interval = setInterval(() => {
        fetchUserData(true);
      }, 5000);

      const handleFocus = () => {
        fetchUserData(true);
      };
      window.addEventListener('focus', handleFocus);

      return () => {
        clearInterval(interval);
        window.removeEventListener('focus', handleFocus);
      };
    }
  }, [user]);

  // Fetch expenses for a selected event dynamically
  useEffect(() => {
    const fetchEventExpenses = async () => {
      if (!selectedBudgetEventId) {
        setSelectedBudgetExpenses([]);
        return;
      }
      setLoadingExpenses(true);
      try {
        const res = await authFetch(`/budget/${selectedBudgetEventId}`);
        if (res.ok) {
          const data = await res.json();
          setSelectedBudgetExpenses(data.expenses || []);
        }
      } catch (err) {
        showToast('Error loading expense reports for event', 'error');
      } finally {
        setLoadingExpenses(false);
      }
    };
    if (user?.role === 'admin' && adminTab === 'budget') {
      fetchEventExpenses();
    }
  }, [selectedBudgetEventId, adminTab]);

  // User management actions
  const handleToggleBlock = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'blocked' ? 'active' : 'blocked';
    try {
      const res = await authFetch(`/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        showToast(`User status updated to ${nextStatus}`, 'success');
        setUsersList(prev => prev.map(u => u.id === userId ? { ...u, status: nextStatus } : u));
      } else {
        const errData = await res.json();
        showToast(errData.message || 'Error updating status', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      const res = await authFetch(`/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        showToast(`User role updated to ${newRole}`, 'success');
        setUsersList(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      } else {
        const errData = await res.json();
        showToast(errData.message || 'Error updating role', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteUser = async (userId, name) => {
    if (userId === user.id) {
      showToast('You cannot delete yourself!', 'error');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete user "${name}"?`)) {
      return;
    }
    try {
      const res = await authFetch(`/admin/users/${userId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast(`Deleted user "${name}"`, 'success');
        setUsersList(prev => prev.filter(u => u.id !== userId));
      } else {
        const errData = await res.json();
        showToast(errData.message || 'Error deleting user', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Event management actions
  const handleUpdateEventStatus = async (eventId, newStatus) => {
    const ev = events.find(e => e.id === eventId);
    if (!ev) return;
    try {
      const res = await authFetch(`/update-event/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: ev.title,
          description: ev.description || '',
          event_type: ev.event_type,
          date: ev.date,
          time: ev.time || '12:00:00',
          location: ev.location,
          budget: ev.budget,
          guest_count: ev.guest_count,
          status: newStatus
        })
      });
      if (res.ok) {
        showToast(`Event status updated to "${newStatus}"`, 'success');
        setEvents(prev => prev.map(e => e.id === eventId ? { ...e, status: newStatus } : e));
      } else {
        const errData = await res.json();
        showToast(errData.message || 'Error updating event status', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    if (!editingEvent) return;
    try {
      const res = await authFetch(`/update-event/${editingEvent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingEvent.title,
          description: editingEvent.description || '',
          event_type: editingEvent.event_type,
          date: editingEvent.date,
          time: editingEvent.time || '12:00:00',
          location: editingEvent.location,
          budget: parseFloat(editingEvent.budget),
          guest_count: parseInt(editingEvent.guest_count),
          status: editingEvent.status
        })
      });
      if (res.ok) {
        showToast('Event updated successfully', 'success');
        setEvents(prev => prev.map(ev => ev.id === editingEvent.id ? { 
          ...editingEvent,
          budget: parseFloat(editingEvent.budget),
          guest_count: parseInt(editingEvent.guest_count)
        } : ev));
        setEditingEvent(null);
      } else {
        const errData = await res.json();
        showToast(errData.message || 'Error updating event', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteEvent = async (id, title) => {
    if (!window.confirm(`Admin Action: Are you sure you want to delete event "${title}"?`)) {
      return;
    }
    try {
      const res = await authFetch(`/delete-event/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(`Admin deleted event: "${title}"`, 'success');
        setEvents(prev => prev.filter(e => e.id !== id));
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-8 bg-white/5 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white/5 rounded-2xl animate-pulse"></div>
          ))}
        </div>
        <div className="h-96 bg-white/5 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  // ==========================================
  // RENDER VIEW FOR ADMINISTRATORS
  // ==========================================
  if (user?.role === 'admin') {
    const totalUsersCount = usersList.length;
    const totalEventsCount = events.length;

    // Filter events based on statuses
    const upcomingEventsCount = events.filter(e => e.status !== 'completed' && e.status !== 'cancelled').length;
    const completedEventsCount = events.filter(e => e.status === 'completed').length;

    const totalManagedFunds = events.reduce((sum, e) => sum + parseFloat(e.budget || 0), 0);
    const totalExpensesSpent = events.reduce((sum, e) => sum + parseFloat(e.expenses || 0), 0);

    const avgGuests = totalEventsCount > 0 
      ? Math.round(events.reduce((sum, e) => sum + parseInt(e.guest_count || 0), 0) / totalEventsCount)
      : 0;

    // Categories statistics
    const categoryStats = events.reduce((acc, e) => {
      acc[e.event_type] = (acc[e.event_type] || 0) + 1;
      return acc;
    }, {});

    const categoriesSorted = Object.entries(categoryStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Dynamic Monthly Events Distribution (Grouped by month name)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyStats = events.reduce((acc, e) => {
      const d = new Date(e.date);
      if (!isNaN(d.getTime())) {
        const m = d.getMonth();
        acc[m] = (acc[m] || 0) + 1;
      }
      return acc;
    }, Array(12).fill(0));

    // Calculate budget overflows
    const overflowingEvents = events.filter(e => parseFloat(e.expenses || 0) > parseFloat(e.budget || 0));

    // Dynamic Recent Activities Feed
    const activityFeed = [];
    usersList.forEach(u => {
      activityFeed.push({
        id: `user-${u.id}`,
        type: 'user',
        message: `New user registered: ${u.name}`,
        sub: u.email,
        time: u.created_at ? new Date(u.created_at) : new Date(),
        badge: u.role
      });
    });
    events.forEach(e => {
      activityFeed.push({
        id: `event-${e.id}`,
        type: 'event',
        message: `Event created: "${e.title}"`,
        sub: `Budget: ₹${parseFloat(e.budget).toLocaleString('en-IN')}`,
        time: e.created_at ? new Date(e.created_at) : new Date(),
        badge: e.status
      });
      if (parseFloat(e.expenses || 0) > parseFloat(e.budget || 0)) {
        activityFeed.push({
          id: `overflow-${e.id}`,
          type: 'alert',
          message: `⚠️ Overspent: "${e.title}" over limit`,
          sub: `Exceeded by ₹${(parseFloat(e.expenses) - parseFloat(e.budget)).toLocaleString('en-IN')}`,
          time: e.created_at ? new Date(e.created_at) : new Date(),
          badge: 'overflow'
        });
      }
    });

    const sortedActivities = activityFeed
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 5);

    return (
      <div className="flex flex-col gap-8 max-w-6xl mx-auto">
        {/* Title */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-indigo-400" />
              Admin Dashboard
            </h1>
            <p className="text-xs text-gray-400 mt-1">Moderate users, system events, manage budgets, and monitor platform performance metrics</p>
          </div>
          <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full uppercase tracking-wider animate-pulse-glow">
            Administrator Mode
          </span>
        </div>

        {/* Tab Selection Row */}
        <div className="flex border-b border-white/5 pb-2 gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setAdminTab('overview')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
              adminTab === 'overview' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' : 'text-gray-400 hover:text-white hover:bg-white/3'
            }`}
          >
            👤 Overview
          </button>
          <button
            onClick={() => setAdminTab('events')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
              adminTab === 'events' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' : 'text-gray-400 hover:text-white hover:bg-white/3'
            }`}
          >
            📅 Event Management ({totalEventsCount})
          </button>
          <button
            onClick={() => setAdminTab('users')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
              adminTab === 'users' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' : 'text-gray-400 hover:text-white hover:bg-white/3'
            }`}
          >
            👥 User Management ({totalUsersCount})
          </button>
          <button
            onClick={() => setAdminTab('budget')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
              adminTab === 'budget' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' : 'text-gray-400 hover:text-white hover:bg-white/3'
            }`}
          >
            💰 Budget Monitoring
          </button>
          <button
            onClick={() => setAdminTab('feedbacks')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
              adminTab === 'feedbacks' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' : 'text-gray-400 hover:text-white hover:bg-white/3'
            }`}
          >
            ⭐ User Reviews ({feedbacks.length})
          </button>
        </div>

        {/* Dynamic Panels */}
        <div className="min-h-[300px]">
          
          {/* PANEL 1: OVERVIEW */}
          {adminTab === 'overview' && (
            <div className="flex flex-col gap-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase">Total Users</span>
                    <span className="text-2xl font-extrabold text-white">{totalUsersCount}</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                </div>

                <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase">Total Events</span>
                    <span className="text-2xl font-extrabold text-purple-400">{totalEventsCount}</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>

                <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase">Upcoming</span>
                    <span className="text-2xl font-extrabold text-amber-400">{upcomingEventsCount}</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>

                <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase">Completed</span>
                    <span className="text-2xl font-extrabold text-emerald-400">{completedEventsCount}</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <UserCheck className="w-5 h-5" />
                  </div>
                </div>

                <div className="glass-card p-5 rounded-2xl flex items-center justify-between font-outfit">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase">Total Budgets</span>
                    <span className="text-xl font-extrabold text-indigo-300">₹{totalManagedFunds.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <Receipt className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Middle Section: SVG graph + activity feed */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* SVG Bar Chart representing 12 months */}
                <div className="glass-panel p-6 rounded-2xl border border-white/5 lg:col-span-2 flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider pb-2 border-b border-white/5 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-400" />
                    Monthly Events Distribution
                  </h3>
                  
                  {events.length > 0 ? (
                    <div className="w-full mt-4 bg-white/1 rounded-xl p-4 border border-white/3 flex flex-col gap-4">
                      <div className="w-full h-44 flex items-end justify-between border-b border-white/10 pb-1">
                        {monthlyStats.map((val, idx) => {
                          const maxVal = Math.max(...monthlyStats, 1);
                          const barHeight = (val / maxVal) * 120; // Max height 120px
                          return (
                            <div key={idx} className="flex flex-col items-center gap-1.5 flex-1 group relative">
                              <div className="absolute bottom-[calc(100%+5px)] bg-indigo-600 text-[9px] text-white font-bold py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg z-10">
                                {val} events
                              </div>
                              <div
                                style={{ height: `${barHeight}px` }}
                                className="w-4/5 max-w-[20px] bg-gradient-to-t from-indigo-600 to-purple-500 rounded-t-md transition-all duration-500 group-hover:from-indigo-500 group-hover:to-purple-400"
                              ></div>
                              <span className="text-[8px] text-gray-500 font-bold uppercase">{monthNames[idx]}</span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-gray-500 px-1">
                        <span>Total platform events: <strong>{totalEventsCount}</strong></span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-indigo-500"></span> Events Count</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 text-center py-12">No event statistics active.</p>
                  )}
                </div>

                {/* Recent Activities */}
                <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider pb-2 border-b border-white/5 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-400" />
                    Recent Activities
                  </h3>
                  
                  <div className="flex flex-col gap-3.5 max-h-[250px] overflow-y-auto pr-1">
                    {sortedActivities.length === 0 ? (
                      <p className="text-xs text-gray-500 text-center py-8">No recent logs recorded.</p>
                    ) : (
                      sortedActivities.map((act) => (
                        <div key={act.id} className="flex gap-3 text-xs items-start leading-relaxed border-b border-white/3 pb-2.5 last:border-0 last:pb-0">
                          <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                            act.type === 'user' ? 'bg-indigo-500' : act.type === 'event' ? 'bg-purple-500' : 'bg-rose-500 animate-pulse'
                          }`}></div>
                          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                            <span className="font-semibold text-gray-200 truncate">{act.message}</span>
                            {act.sub && <span className="text-[10px] text-gray-500 truncate">{act.sub}</span>}
                          </div>
                          <span className="text-[9px] text-gray-500 shrink-0">{act.time.toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Row: Popular event categories */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="glass-panel p-6 rounded-2xl border border-white/5 lg:col-span-1 flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider pb-2 border-b border-white/5 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-indigo-400" />
                    Popular Event Categories
                  </h3>

                  {categoriesSorted.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-12">No event records found.</p>
                  ) : (
                    <div className="flex flex-col gap-4 mt-2">
                      {categoriesSorted.map(([cat, val], idx) => {
                        const pct = Math.round((val / totalEventsCount) * 100);
                        return (
                          <div key={cat} className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-semibold text-gray-300 capitalize">{cat}</span>
                              <span className="text-gray-400 font-bold">{val} events ({pct}%)</span>
                            </div>
                            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${pct}%` }}
                                className={`h-full rounded-full ${
                                  idx === 0 ? 'bg-indigo-500' : idx === 1 ? 'bg-purple-500' : idx === 2 ? 'bg-pink-500' : 'bg-amber-500'
                                }`}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* PANEL 2: EVENT MANAGEMENT */}
          {adminTab === 'events' && (
            <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col gap-4">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                  📅 Event Moderation Ledger
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-gray-500 font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">ID</th>
                      <th className="py-3 px-4">Event Name</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Budget</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Approve/Reject</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/2 text-gray-300 font-medium">
                    {events.map((e) => (
                      <tr key={e.id} className="hover:bg-white/2 transition-colors">
                        <td className="py-3 px-4 font-bold text-gray-400">#{e.id}</td>
                        <td className="py-3 px-4 font-semibold text-white truncate max-w-[150px]">{e.title}</td>
                        <td className="py-3 px-4 text-gray-400 capitalize">{e.event_type}</td>
                        <td className="py-3 px-4 text-gray-400">{new Date(e.date).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-emerald-400 font-bold">₹{parseFloat(e.budget).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                        <td className="py-3 px-4">
                          <select
                            value={e.status}
                            onChange={(opt) => handleUpdateEventStatus(e.id, opt.target.value)}
                            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-gray-200 focus:outline-none focus:border-indigo-500 font-semibold"
                          >
                            <option value="pending" className="bg-[#0d0f14]">Pending</option>
                            <option value="approved" className="bg-[#0d0f14]">Approved</option>
                            <option value="ongoing" className="bg-[#0d0f14]">Ongoing</option>
                            <option value="completed" className="bg-[#0d0f14]">Completed</option>
                            <option value="cancelled" className="bg-[#0d0f14]">Cancelled</option>
                            <option value="planning" className="bg-[#0d0f14]">Planning</option>
                          </select>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            {e.status !== 'approved' && e.status !== 'completed' ? (
                              <button
                                onClick={() => handleUpdateEventStatus(e.id, 'approved')}
                                className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/25 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase transition-all cursor-pointer"
                              >
                                Approve
                              </button>
                            ) : null}
                            {e.status !== 'cancelled' ? (
                              <button
                                onClick={() => handleUpdateEventStatus(e.id, 'cancelled')}
                                className="px-2.5 py-1 rounded bg-rose-500/10 border border-rose-500/25 hover:bg-rose-500/20 text-rose-400 text-[10px] font-bold uppercase transition-all cursor-pointer"
                              >
                                Reject
                              </button>
                            ) : null}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setEditingEvent(e)}
                              className="p-1.5 rounded-lg hover:bg-indigo-500/10 text-gray-500 hover:text-indigo-400 transition-all cursor-pointer"
                              title="Edit Event"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(e.id, e.title)}
                              className="p-1.5 rounded-lg hover:bg-rose-500/10 text-gray-500 hover:text-rose-400 transition-all cursor-pointer"
                              title="Delete Event"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PANEL 3: USER MANAGEMENT */}
          {adminTab === 'users' && (
            <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col gap-4 overflow-hidden">
              <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider pb-2 border-b border-white/5">
                👥 Registered Platform Users
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-gray-500 font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">User ID</th>
                      <th className="py-3 px-4">Full Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">System Role</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Registered Date</th>
                      <th className="py-3 px-4 text-right">Moderation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/2 text-gray-300 font-medium">
                    {usersList.map((u) => (
                      <tr key={u.id} className="hover:bg-white/2 transition-colors">
                        <td className="py-3 px-4 font-bold text-gray-400">#{u.id}</td>
                        <td className="py-3 px-4 font-semibold text-white">{u.name}</td>
                        <td className="py-3 px-4 text-gray-400">
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-gray-500" />
                            {u.email}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={u.role}
                            onChange={(e) => handleChangeRole(u.id, e.target.value)}
                            disabled={u.id === user.id}
                            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-gray-200 focus:outline-none focus:border-indigo-500 font-semibold"
                          >
                            <option value="user" className="bg-[#0d0f14]">User</option>
                            <option value="admin" className="bg-[#0d0f14]">Admin</option>
                          </select>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase border ${
                            u.status === 'blocked' ? 'bg-rose-500/10 border-rose-500/25 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                          }`}>
                            {u.status || 'active'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {u.id !== user.id ? (
                              <>
                                <button
                                  onClick={() => handleToggleBlock(u.id, u.status || 'active')}
                                  className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-all border cursor-pointer ${
                                    u.status === 'blocked'
                                      ? 'bg-emerald-500/10 border-emerald-500/25 hover:bg-emerald-500/20 text-emerald-400'
                                      : 'bg-rose-500/10 border-rose-500/25 hover:bg-rose-500/20 text-rose-400'
                                  }`}
                                >
                                  {u.status === 'blocked' ? 'Unblock' : 'Block'}
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(u.id, u.name)}
                                  className="p-1.5 rounded-lg hover:bg-rose-500/10 text-gray-500 hover:text-rose-400 transition-all cursor-pointer"
                                  title="Delete User"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <span className="text-[10px] text-gray-500 font-semibold italic px-2">Self</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PANEL 4: BUDGET MONITORING */}
          {adminTab === 'budget' && (
            <div className="flex flex-col gap-6">
              {/* Stat Widgets */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-outfit">
                <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase">Total Budget Allocated</span>
                    <span className="text-2xl font-extrabold text-white">₹{totalManagedFunds.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <Receipt className="w-5 h-5" />
                  </div>
                </div>

                <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase">Total Budget Spent</span>
                    <span className="text-2xl font-extrabold text-amber-400">₹{totalExpensesSpent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Receipt className="w-5 h-5" />
                  </div>
                </div>

                <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase">Net Remaining Budget</span>
                    <span className={`text-2xl font-extrabold ${(totalManagedFunds - totalExpensesSpent) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      ₹{(totalManagedFunds - totalExpensesSpent).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Receipt className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Overflow Alerts */}
              <div className="flex flex-col gap-3.5">
                <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 animate-pulse" />
                  Budget Overflow Alerts
                </h4>

                {overflowingEvents.length === 0 ? (
                  <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    All events operating within budget parameters. No overruns active.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {overflowingEvents.map(e => {
                      const overrun = parseFloat(e.expenses) - parseFloat(e.budget);
                      return (
                        <div key={e.id} className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/15 flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 animate-bounce" />
                          <div className="flex flex-col gap-1 min-w-0">
                            <span className="text-xs font-bold text-white leading-tight truncate">{e.title}</span>
                            <span className="text-[10px] text-rose-300 font-semibold">
                              Exceeded budget limit by <strong className="font-extrabold font-outfit text-xs text-rose-400">₹{overrun.toLocaleString('en-IN')}</strong>
                            </span>
                            <span className="text-[9px] text-gray-500 mt-1">
                              Limit: ₹{parseFloat(e.budget).toLocaleString()} | Spent: ₹{parseFloat(e.expenses).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Which event used how much budget table */}
              <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col gap-4">
                <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                  💰 Event Budget Allocation Details
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-gray-500 font-semibold uppercase tracking-wider">
                        <th className="py-3 px-4">Event ID</th>
                        <th className="py-3 px-4">Event Title</th>
                        <th className="py-3 px-4">Allocated (Limit)</th>
                        <th className="py-3 px-4">Spent (Expenses)</th>
                        <th className="py-3 px-4">Remaining</th>
                        <th className="py-3 px-4">Financial Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/2 text-gray-300 font-outfit font-medium">
                      {events.map((e) => {
                        const spent = parseFloat(e.expenses || 0);
                        const limit = parseFloat(e.budget || 0);
                        const rem = limit - spent;
                        return (
                          <tr key={e.id} className="hover:bg-white/2">
                            <td className="py-3 px-4 font-bold text-gray-400">#{e.id}</td>
                            <td className="py-3 px-4 font-semibold text-white truncate max-w-[180px]">{e.title}</td>
                            <td className="py-3 px-4 font-bold text-gray-200">₹{limit.toLocaleString('en-IN')}</td>
                            <td className="py-3 px-4 font-bold text-amber-400">₹{spent.toLocaleString('en-IN')}</td>
                            <td className={`py-3 px-4 font-bold ${rem >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {rem >= 0 ? `₹${rem.toLocaleString('en-IN')}` : `-₹${Math.abs(rem).toLocaleString('en-IN')}`}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                                rem < 0 ? 'bg-rose-500/10 border border-rose-500/25 text-rose-400' : 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-400'
                              }`}>
                                {rem < 0 ? 'Overspent' : 'Within Limit'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Interactive expense ledger reports explorer */}
              <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col gap-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                      📊 Expense Ledger Reports Explorer
                    </h3>
                    <p className="text-[10px] text-gray-500 mt-0.5">Select an event to view its detailed expense transactions item-by-item</p>
                  </div>
                  <select
                    value={selectedBudgetEventId}
                    onChange={(e) => setSelectedBudgetEventId(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold min-w-[200px]"
                  >
                    <option value="" className="bg-[#0d0f14]">-- Select an Event --</option>
                    {events.map((e) => (
                      <option key={e.id} value={e.id} className="bg-[#0d0f14]">{e.title}</option>
                    ))}
                  </select>
                </div>

                {selectedBudgetEventId === '' ? (
                  <p className="text-xs text-gray-500 text-center py-8">Select an event from the list above to view transaction logs.</p>
                ) : loadingExpenses ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                  </div>
                ) : selectedBudgetExpenses.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-8">No expense transactions recorded for this event yet.</p>
                ) : (
                  <div className="overflow-x-auto font-medium">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 text-gray-500 font-semibold uppercase tracking-wider">
                          <th className="py-2 px-4">Transaction ID</th>
                          <th className="py-2 px-4">Expense Title</th>
                          <th className="py-2 px-4">Category</th>
                          <th className="py-2 px-4">Date</th>
                          <th className="py-2 px-4 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/2 text-gray-300">
                        {selectedBudgetExpenses.map((exp) => (
                          <tr key={exp.id} className="hover:bg-white/2">
                            <td className="py-2 px-4 font-bold text-gray-400">#TXN-{exp.id}</td>
                            <td className="py-2 px-4 font-semibold text-white">{exp.title}</td>
                            <td className="py-2 px-4 text-gray-400 capitalize">{exp.category}</td>
                            <td className="py-2 px-4 text-gray-400">{new Date(exp.date).toLocaleDateString()}</td>
                            <td className="py-2 px-4 text-right text-amber-400 font-bold font-outfit">₹{parseFloat(exp.amount).toLocaleString('en-IN')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PANEL 5: USER REVIEWS */}
          {adminTab === 'feedbacks' && (
            <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col gap-4">
              <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider pb-2 border-b border-white/5">
                ⭐ User Reviews and Feedback
              </h3>

              <div className="flex flex-col gap-4 animate-fade-in">
                {feedbacks.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-12">No reviews recorded yet.</p>
                ) : (
                  feedbacks.map((f) => (
                    <div key={f.id} className="p-4 rounded-xl bg-white/2 border border-white/5 flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-500/15 text-indigo-400 flex items-center justify-center font-bold text-xs uppercase animate-pulse-glow">
                            {(f.name || (f.email ? f.email.split('@')[0] : 'User'))[0]}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-gray-200">{f.name || (f.email ? f.email.split('@')[0] : 'Unknown User')}</span>
                            <span className="text-[9px] text-gray-500">{f.email || ''}</span>
                          </div>
                        </div>

                        {/* Stars */}
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= f.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed italic pl-9">
                        "{f.comment || 'No review comments provided.'}"
                      </p>
                      <span className="text-[9px] text-gray-500 self-end">
                        Submitted: {new Date(f.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

        {/* ADMIN EVENT EDITING MODAL */}
        {editingEvent && (
          <div className="fixed inset-0 bg-[#07080a]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-panel w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl p-6 flex flex-col gap-6 animate-scale-up">
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  Edit Event Details (Admin Mode)
                </h3>
                <button
                  onClick={() => setEditingEvent(null)}
                  className="text-gray-400 hover:text-white font-bold text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveEvent} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Event Title</label>
                  <input
                    type="text"
                    required
                    value={editingEvent.title}
                    onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                    className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase">Event Type / Category</label>
                    <input
                      type="text"
                      required
                      value={editingEvent.event_type}
                      onChange={(e) => setEditingEvent({ ...editingEvent, event_type: e.target.value })}
                      className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase">Date</label>
                    <input
                      type="date"
                      required
                      value={editingEvent.date.split('T')[0]}
                      onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                      className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Location</label>
                  <input
                    type="text"
                    required
                    value={editingEvent.location}
                    onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                    className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 col-span-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase">Allocated Budget (₹)</label>
                    <input
                      type="number"
                      required
                      value={editingEvent.budget}
                      onChange={(e) => setEditingEvent({ ...editingEvent, budget: e.target.value })}
                      className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase">Guest Count</label>
                    <input
                      type="number"
                      required
                      value={editingEvent.guest_count}
                      onChange={(e) => setEditingEvent({ ...editingEvent, guest_count: e.target.value })}
                      className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Event Status</label>
                  <select
                    value={editingEvent.status}
                    onChange={(e) => setEditingEvent({ ...editingEvent, status: e.target.value })}
                    className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    <option value="pending" className="bg-[#0d0f14]">Pending</option>
                    <option value="approved" className="bg-[#0d0f14]">Approved</option>
                    <option value="ongoing" className="bg-[#0d0f14]">Ongoing</option>
                    <option value="completed" className="bg-[#0d0f14]">Completed</option>
                    <option value="cancelled" className="bg-[#0d0f14]">Cancelled</option>
                    <option value="planning" className="bg-[#0d0f14]">Planning</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setEditingEvent(null)}
                    className="px-4 py-2 rounded-xl border border-white/5 bg-white/3 hover:bg-white/7 transition-all text-xs font-semibold text-gray-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-all text-xs font-semibold text-white shadow-lg shadow-indigo-600/15 cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    );
  }

  // ==========================================
  // RENDER VIEW FOR REGULAR USERS
  // ==========================================
  const totalEvents = events.length;
  const today = new Date().toISOString().split('T')[0];
  const upcomingEvents = events.filter(e => e.date >= today);
  const totalBudget = events.reduce((sum, e) => sum + parseFloat(e.budget || 0), 0);
  const totalGuests = events.reduce((sum, e) => sum + parseInt(e.guest_count || 0), 0);

  // Format Helper
  const formatRupee = (num) => {
    return '₹ ' + Math.round(num).toLocaleString('en-IN');
  };

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

  // Dynamic stats mapping
  const displayBudget = totalBudget;
  const displayGuests = totalGuestsCount;
  const displayUpcomingCount = upcomingEvents.length;

  // Real-time notifications processing & fallback mockup data
  const fallbackNotifications = [
    {
      id: 'f1',
      message: 'Your booking for The Leela Palace, Udaipur on 25 Dec 2024 is confirmed.',
      status: 'unread',
      created_at: new Date(Date.now() - 25 * 60000).toISOString()
    },
    {
      id: 'f2',
      message: 'Priya Patel has been added to the guest list for Rahul & Priya Wedding.',
      status: 'unread',
      created_at: new Date(Date.now() - 17 * 3600000).toISOString()
    },
    {
      id: 'f3',
      message: '"Catering Finalization" task is due tomorrow. Don\'t forget to update.',
      status: 'unread',
      created_at: new Date(Date.now() - 25 * 3600000).toISOString()
    },
    {
      id: 'f4',
      message: 'You have a new message from Harshita Events.',
      status: 'unread',
      created_at: new Date('2024-05-23T18:15:00').toISOString()
    },
    {
      id: 'f5',
      message: 'Payment of ₹50,000 for The Leela Palace is due in 3 days.',
      status: 'read',
      created_at: new Date('2024-05-23T11:30:00').toISOString()
    },
    {
      id: 'f6',
      message: 'Your event budget has been updated successfully.',
      status: 'read',
      created_at: new Date('2024-05-22T19:20:00').toISOString()
    },
    {
      id: 'f7',
      message: '"Send Invitations" task has been marked as completed.',
      status: 'read',
      created_at: new Date('2024-05-22T15:10:00').toISOString()
    },
    {
      id: 'f8',
      message: 'New features have been added to improve your experience.',
      status: 'read',
      created_at: new Date('2024-05-21T10:00:00').toISOString()
    }
  ];

  const parseNotification = (notif) => {
    const msg = notif.message.toLowerCase();
    let title = "System Update";
    let iconName = "settings";
    let colorClass = "bg-slate-500/10 text-slate-500 dark:text-slate-400";
    let text = notif.message;

    if (msg.includes("booking") || msg.includes("venue")) {
      title = "Venue Booking Confirmed";
      iconName = "calendar";
      colorClass = "bg-purple-500/10 text-[#5a2bd4] dark:text-purple-400";
    } else if (msg.includes("guest") || msg.includes("invited")) {
      title = "New Guest Added";
      iconName = "user-plus";
      colorClass = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    } else if (msg.includes("due tomorrow") || msg.includes("task is due")) {
      title = "Task Due Tomorrow";
      iconName = "clock";
      colorClass = "bg-amber-500/10 text-amber-600 dark:text-amber-400";
    } else if (msg.includes("message") || msg.includes("chat")) {
      title = "New Message Received";
      iconName = "message-square";
      colorClass = "bg-blue-500/10 text-blue-600 dark:text-blue-400";
    } else if (msg.includes("payment") || msg.includes("rupees") || msg.includes("rs.") || msg.includes("₹")) {
      title = "Payment Reminder";
      iconName = "alert-circle";
      colorClass = "bg-rose-500/10 text-rose-600 dark:text-rose-400";
    } else if (msg.includes("budget") || msg.includes("expense")) {
      title = "Budget Updated";
      iconName = "receipt";
      colorClass = "bg-[#efe9fc] text-[#5a2bd4] dark:bg-indigo-500/10 dark:text-indigo-400";
    } else if (msg.includes("completed") || msg.includes("marked completed")) {
      title = "Task Completed";
      iconName = "check-circle";
      colorClass = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    }

    return {
      ...notif,
      title,
      iconName,
      colorClass,
      text
    };
  };

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    
    const days = date.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days} ${months[date.getMonth()]}`;
  };

  const renderNotificationIcon = (name) => {
    switch (name) {
      case 'calendar':
        return <Calendar className="w-3.5 h-3.5" />;
      case 'user-plus':
        return <UserPlus className="w-3.5 h-3.5" />;
      case 'clock':
        return <Clock className="w-3.5 h-3.5" />;
      case 'message-square':
        return <MessageSquare className="w-3.5 h-3.5" />;
      case 'alert-circle':
        return <AlertCircle className="w-3.5 h-3.5" />;
      case 'receipt':
        return <Receipt className="w-3.5 h-3.5" />;
      case 'check-circle':
        return <CheckCircle2 className="w-3.5 h-3.5" />;
      default:
        return <Activity className="w-3.5 h-3.5" />;
    }
  };

  const allNotifications = (notifications.length > 0 ? notifications : fallbackNotifications).map(parseNotification);
  const displayNotifications = allNotifications.slice(0, 3);

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-12">
      {/* 1. Greeting Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white dark:text-white">
            Welcome back, {user?.name ? user.name.split(' ')[0] : 'Rahul'}! 👋
          </h1>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            Here's what's happening with your events today.
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

      {/* 2. 4 Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-medium">
        {/* Card 1: Upcoming Events */}
        <div className="glass-card p-5 rounded-2xl flex items-center justify-between border border-white/5 shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Upcoming Events</span>
            <span className="text-2xl font-extrabold text-white dark:text-white">{displayUpcomingCount}</span>
            <Link href="/events" className="text-[10px] text-[#5a2bd4] dark:text-indigo-400 font-bold hover:underline mt-1 inline-flex items-center gap-0.5">
              View all events &rarr;
            </Link>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[#5a2bd4] dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Total Budget */}
        <div className="glass-card p-5 rounded-2xl flex items-center justify-between border border-white/5 shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Budget</span>
            <span className="text-2xl font-extrabold text-white dark:text-white">{formatRupee(displayBudget)}</span>
            <Link href="/budget" className="text-[10px] text-[#5a2bd4] dark:text-indigo-400 font-bold hover:underline mt-1 inline-flex items-center gap-0.5">
              View budget &rarr;
            </Link>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Total Guests */}
        <div className="glass-card p-5 rounded-2xl flex items-center justify-between border border-white/5 shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Guests</span>
            <span className="text-2xl font-extrabold text-white dark:text-white">{displayGuests}</span>
            <Link href="/guests" className="text-[10px] text-[#5a2bd4] dark:text-indigo-400 font-bold hover:underline mt-1 inline-flex items-center gap-0.5">
              View guests &rarr;
            </Link>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Tasks Completed */}
        <div className="glass-card p-5 rounded-2xl flex items-center justify-between border border-white/5 shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tasks Completed</span>
            <span className="text-2xl font-extrabold text-white dark:text-white">
              {totalTasksCount > 0 ? `${Math.round((tasksCompletedCount / totalTasksCount) * 100)}%` : '0%'}
            </span>
            <Link href="/tasks" className="text-[10px] text-[#5a2bd4] dark:text-indigo-400 font-bold hover:underline mt-1 inline-flex items-center gap-0.5">
              View tasks &rarr;
            </Link>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center shrink-0">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Two Column Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column (col-span-2) */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Upcoming Events Card List */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="text-xs font-bold text-gray-200 dark:text-white uppercase tracking-wider">
                Upcoming Events
              </h3>
              <Link href="/events" className="text-[10px] text-[#5a2bd4] dark:text-indigo-400 font-bold flex items-center gap-0.5 hover:underline">
                View All
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {events.length === 0 ? (
              <div className="text-center py-12 flex flex-col items-center justify-center gap-3">
                <p className="text-xs text-gray-500">You haven't created any events yet.</p>
                <Link
                  href="/ai"
                  className="px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 text-indigo-400 text-xs font-bold transition-all"
                >
                  Create Your First Event
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {events.slice(0, 3).map((event, idx) => (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="p-3 rounded-xl bg-white/2 border border-white/5 hover:border-indigo-500/25 hover:bg-white/4 transition-all flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      {/* Image Thumbnail */}
                      <img
                        src={getEventCover(event.event_type)}
                        alt={event.title}
                        className="w-20 h-14 rounded-xl object-cover border border-white/5 filter brightness-105 shrink-0"
                      />
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-bold text-gray-200 dark:text-white">{event.title}</h4>
                          <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase bg-white/5 text-gray-400 border border-white/5">
                            {event.event_type}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-indigo-400 shrink-0" />
                            {event.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-indigo-400 shrink-0" />
                            {new Date(event.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          <span className="hidden sm:inline">•</span>
                          <span className="hidden sm:inline">{event.guest_count} Guests</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`px-2.5 py-1 rounded-full text-[8px] font-extrabold uppercase tracking-wider border ${
                        event.status === 'planning'
                          ? 'bg-indigo-500/5 border-indigo-500/25 text-indigo-400'
                          : event.status === 'ongoing' || event.status === 'in progress'
                          ? 'bg-emerald-500/5 border-emerald-500/25 text-emerald-500'
                          : event.status === 'completed'
                          ? 'bg-blue-500/5 border-blue-500/25 text-blue-400'
                          : 'bg-amber-500/5 border-amber-500/25 text-amber-500'
                      }`}>
                        {event.status === 'ongoing' || event.status === 'in progress' ? 'In Progress' : event.status}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Task Overview Card */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col gap-5">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="text-xs font-bold text-gray-200 dark:text-white uppercase tracking-wider">
                Task Overview
              </h3>
              <Link href="/tasks" className="text-[10px] text-[#5a2bd4] dark:text-indigo-400 font-bold hover:underline">
                View All Tasks
              </Link>
            </div>

            {/* Overall progress bar */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs font-bold text-gray-300">
                <span>Overall Progress</span>
                <span>{totalTasksCount > 0 ? `${Math.round((tasksCompletedCount / totalTasksCount) * 100)}%` : '0%'}</span>
              </div>
              <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-[#5a2bd4] rounded-full" style={{ width: totalTasksCount > 0 ? `${Math.round((tasksCompletedCount / totalTasksCount) * 100)}%` : '0%' }}></div>
              </div>
            </div>

            {/* 4 Status count cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-bold">
              <div className="p-3 bg-white/2 border border-white/5 rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-gray-500 uppercase">Completed</span>
                  <span className="text-sm text-white dark:text-white">{tasksCompletedCount}</span>
                </div>
              </div>

              <div className="p-3 bg-white/2 border border-white/5 rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-gray-500 uppercase">In Progress</span>
                  <span className="text-sm text-white dark:text-white">{tasksInProgressCount}</span>
                </div>
              </div>

              <div className="p-3 bg-white/2 border border-white/5 rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-gray-500 uppercase">Pending</span>
                  <span className="text-sm text-white dark:text-white">{tasksPendingCount}</span>
                </div>
              </div>

              <div className="p-3 bg-white/2 border border-white/5 rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-gray-500 uppercase">Overdue</span>
                  <span className="text-sm text-white dark:text-white">{tasksOverdueCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (col-span-1) */}
        <div className="flex flex-col gap-8">
          {/* Budget Overview Card */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="text-xs font-bold text-gray-200 dark:text-white uppercase tracking-wider">
                Budget Overview
              </h3>
              <Link href="/budget" className="text-[10px] text-[#5a2bd4] dark:text-indigo-400 font-bold hover:underline">
                View Details
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center justify-between gap-6 py-2">
              {/* Donut Chart Container */}
              <div className="relative w-32 h-32 shrink-0">
                <svg viewBox="0 0 100 100" className="w-32 h-32 transform -rotate-90">
                  {/* Venue (40%) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#5a2bd4"
                    strokeWidth="10"
                    strokeDasharray="100.48 251.2"
                    strokeDashoffset="0"
                  />
                  {/* Catering (30%) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#10b981"
                    strokeWidth="10"
                    strokeDasharray="75.36 251.2"
                    strokeDashoffset="-100.48"
                  />
                  {/* Decoration (15%) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#f59e0b"
                    strokeWidth="10"
                    strokeDasharray="37.68 251.2"
                    strokeDashoffset="-175.84"
                  />
                  {/* Entertainment (10%) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#6366f1"
                    strokeWidth="10"
                    strokeDasharray="25.12 251.2"
                    strokeDashoffset="-213.52"
                  />
                  {/* Miscellaneous (5%) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#f43f5e"
                    strokeWidth="10"
                    strokeDasharray="12.56 251.2"
                    strokeDashoffset="-238.64"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-extrabold text-white dark:text-white leading-none">
                    {formatRupee(displayBudget)}
                  </span>
                  <span className="text-[8px] text-gray-500 font-bold uppercase mt-1">
                    Budget
                  </span>
                </div>
              </div>

              {/* Legend List */}
              <div className="flex flex-col gap-2 w-full text-[10px] font-bold text-gray-300">
                <div className="flex justify-between items-center border-b border-white/5 pb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#5a2bd4] shrink-0"></span>
                    <span>Venue (40%)</span>
                  </div>
                  <span className="font-outfit text-gray-400">{formatRupee(displayBudget * 0.40)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] shrink-0"></span>
                    <span>Catering (30%)</span>
                  </div>
                  <span className="font-outfit text-gray-400">{formatRupee(displayBudget * 0.30)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] shrink-0"></span>
                    <span>Decoration (15%)</span>
                  </div>
                  <span className="font-outfit text-gray-400">{formatRupee(displayBudget * 0.15)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#6366f1] shrink-0"></span>
                    <span>Entertainment (10%)</span>
                  </div>
                  <span className="font-outfit text-gray-400">{formatRupee(displayBudget * 0.10)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#f43f5e] shrink-0"></span>
                    <span>Misc (5%)</span>
                  </div>
                  <span className="font-outfit text-gray-400">{formatRupee(displayBudget * 0.05)}</span>
                </div>
              </div>
            </div>
          </div>


          {/* Notifications List */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="text-xs font-bold text-gray-200 dark:text-white uppercase tracking-wider">
                Notifications
              </h3>
              <Link href="/notifications" className="text-[10px] text-[#5a2bd4] dark:text-indigo-400 font-bold hover:underline">
                View All
              </Link>
            </div>

            <div className="flex flex-col gap-3.5 font-semibold text-[10.5px]">
              {displayNotifications.length === 0 ? (
                <div className="py-6 text-center text-gray-500 font-bold">
                  No notifications.
                </div>
              ) : (
                displayNotifications.map((notif, idx) => (
                  <div
                    key={notif.id}
                    className={`flex gap-3 items-start ${
                      idx < displayNotifications.length - 1 ? 'border-b border-white/3 pb-2.5' : ''
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${notif.colorClass}`}>
                      {renderNotificationIcon(notif.iconName)}
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-gray-200 dark:text-white leading-snug break-words">
                        {notif.message}
                      </span>
                      <span className="text-[9px] text-gray-500">
                        {formatRelativeTime(notif.created_at)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Footer */}
      <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-bold text-gray-500">
        <span>&copy; {new Date().getFullYear()} JAGAH Udaipur. All Rights Reserved.</span>
        <span>Made with &hearts; in Udaipur</span>
      </div>

      {/* AI Suggestions Modal Overlay */}
      {isAiModalOpen && (
        <div className="fixed inset-0 bg-[#07080a]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl p-6 flex flex-col gap-6 animate-scale-up">
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4.5 h-4.5 text-indigo-400" />
                AI Planner Assistant
              </h3>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="text-gray-400 hover:text-white font-extrabold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-4 font-semibold text-xs leading-relaxed">
              <p className="text-gray-300">
                Udaipur offers spectacular venue backdrops. Based on your active events planner settings:
              </p>
              
              <div className="flex flex-col gap-3">
                <div className="p-3 bg-white/2 border border-white/5 rounded-xl flex flex-col gap-1">
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Luxury Venues Suggestion</span>
                  <p className="text-gray-300">Consider reserving <strong>The Leela Palace</strong> or <strong>Fateh Garh Resort</strong> for premium weddings. For corporate gatherings, <strong>Ramada Resort Udaipur</strong> has the best banquet plans.</p>
                </div>
                
                <div className="p-3 bg-white/2 border border-white/5 rounded-xl flex flex-col gap-1">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Catering & Allocation Tips</span>
                  <p className="text-gray-300">With a budget of {formatRupee(displayBudget)}, catering at 30% ({formatRupee(displayBudget * 0.3)}) is well suited for a premium local Rajasthani buffet service.</p>
                </div>

                <div className="p-3 bg-white/2 border border-white/5 rounded-xl flex flex-col gap-1">
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Budget Optimization</span>
                  <p className="text-gray-300">Save up to 15% on flower decorations by incorporating traditional marigold floral drapes and local earthen lanterns (diyas) for a majestic palace theme.</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-all text-xs font-bold text-white shadow-lg shadow-indigo-600/10 cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

