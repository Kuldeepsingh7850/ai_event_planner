import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  Bell,
  Calendar,
  UserPlus,
  Clock,
  MessageSquare,
  AlertCircle,
  Receipt,
  CheckCircle,
  Settings,
  Check,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';

export default function NotificationsPage() {
  const { authFetch, user } = useAuth();
  const {
    notifications: dbNotifications,
    unreadCount,
    fetchNotifications,
    markAllAsRead,
    showToast
  } = useNotifications();

  // Tab Filtering & Local States
  const [activeTab, setActiveTab] = useState('All'); // 'All', 'Unread'
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);

  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedNotifIds, setSelectedNotifIds] = useState([]);
  const [deletedFallbackIds, setDeletedFallbackIds] = useState([]);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('deleted_fallback_notifications');
      if (stored) {
        try {
          setDeletedFallbackIds(JSON.parse(stored));
        } catch (e) {}
      }
    }
  }, []);

  // Hardcoded mockup notifications matching reference image
  const fallbackNotifications = user?.role === 'admin' ? [
    {
      id: 'f1_admin',
      message: 'New user registered: Aarav Sharma (aarav@gmail.com)',
      status: 'unread',
      created_at: new Date(Date.now() - 10 * 60000).toISOString() // 10 mins ago
    },
    {
      id: 'f2_admin',
      message: 'New feedback received: "Loved the UI design and event flow!"',
      status: 'unread',
      created_at: new Date(Date.now() - 4 * 3600000).toISOString() // 4 hours ago
    },
    {
      id: 'f3_admin',
      message: 'New venue added: Radisson Blu Udaipur Palace Resort',
      status: 'read',
      created_at: new Date(Date.now() - 24 * 3600000).toISOString() // 1 day ago
    },
    {
      id: 'f4_admin',
      message: 'New event added: Royal Wedding by user Amit Kumar',
      status: 'read',
      created_at: new Date('2024-05-23T18:15:00').toISOString()
    },
    {
      id: 'f5_admin',
      message: 'New vendor added: Udaipur Royal Caterers',
      status: 'read',
      created_at: new Date('2024-05-22T12:00:00').toISOString()
    }
  ] : [
    {
      id: 'f1',
      message: 'Your booking for The Leela Palace, Udaipur on 25 Dec 2024 is confirmed.',
      status: 'unread',
      created_at: new Date(Date.now() - 25 * 60000).toISOString() // 25 mins ago -> Today 10:30 AM
    },
    {
      id: 'f2',
      message: 'Priya Patel has been added to the guest list for Rahul & Priya Wedding.',
      status: 'unread',
      created_at: new Date(Date.now() - 17 * 3600000).toISOString() // 17 hours ago -> Yesterday 4:45 PM
    },
    {
      id: 'f3',
      message: '"Catering Finalization" task is due tomorrow. Don\'t forget to update.',
      status: 'unread',
      created_at: new Date(Date.now() - 25 * 3600000).toISOString() // 25 hours ago -> Yesterday 9:00 AM
    },
    {
      id: 'f4',
      message: 'You have a new message from Harshita Events.',
      status: 'unread',
      created_at: new Date('2024-05-23T18:15:00').toISOString() // 23 May 2024, 6:15 PM
    },
    {
      id: 'f5',
      message: 'Payment of ₹50,000 for The Leela Palace is due in 3 days.',
      status: 'read',
      created_at: new Date('2024-05-23T11:30:00').toISOString() // 23 May 2024, 11:30 AM
    },
    {
      id: 'f6',
      message: 'Your event budget has been updated successfully.',
      status: 'read',
      created_at: new Date('2024-05-22T19:20:00').toISOString() // 22 May 2024, 7:20 PM
    },
    {
      id: 'f7',
      message: '"Send Invitations" task has been marked as completed.',
      status: 'read',
      created_at: new Date('2024-05-22T15:10:00').toISOString() // 22 May 2024, 3:10 PM
    },
    {
      id: 'f8',
      message: 'New features have been added to improve your experience.',
      status: 'read',
      created_at: new Date('2024-05-21T10:00:00').toISOString() // 21 May 2024, 10:00 AM
    }
  ];

  // Dynamic Parsing helper based on message keywords
  const parseNotification = (notif) => {
    const msg = notif.message.toLowerCase();
    let title = "System Update";
    let type = "system";
    let iconName = "settings";
    let colorClass = "bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20";
    let text = notif.message;

    if (msg.includes("new user registered")) {
      title = "New User Registration";
      type = "system";
      iconName = "user-plus";
      colorClass = "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
    } else if (msg.includes("new feedback received")) {
      title = "Feedback Submitted";
      type = "system";
      iconName = "message-square";
      colorClass = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    } else if (msg.includes("new venue added")) {
      title = "New Venue Added";
      type = "system";
      iconName = "calendar";
      colorClass = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    } else if (msg.includes("new vendor added")) {
      title = "New Vendor Added";
      type = "system";
      iconName = "user-plus";
      colorClass = "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
    } else if (msg.includes("new event added")) {
      title = "New Event Created";
      type = "system";
      iconName = "calendar";
      colorClass = "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20";
    } else if (msg.includes("timeline")) {
      title = "Timeline Completed";
      type = "updates";
      iconName = "clock";
      colorClass = "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 border-indigo-500/20";
    } else if (msg.includes("booking") || msg.includes("venue")) {
      title = "Venue Booking Confirmed";
      type = "updates";
      iconName = "calendar";
      colorClass = "bg-purple-500/10 text-[#1d4ed8] dark:text-purple-400 border-purple-500/20";
    } else if (msg.includes("guest") || msg.includes("invited")) {
      title = "New Guest Added";
      type = "updates";
      iconName = "user-plus";
      colorClass = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    } else if (msg.includes("due tomorrow") || msg.includes("task is due")) {
      title = "Task Due Tomorrow";
      type = "reminders";
      iconName = "clock";
      colorClass = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    } else if (msg.includes("message") || msg.includes("chat")) {
      title = "New Message Received";
      type = "messages";
      iconName = "message-square";
      colorClass = "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
    } else if (msg.includes("payment") || msg.includes("rupees") || msg.includes("rs.") || msg.includes("₹")) {
      title = "Payment Reminder";
      type = "reminders";
      iconName = "alert-circle";
      colorClass = "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
    } else if (msg.includes("budget") || msg.includes("expense")) {
      title = "Budget Updated";
      type = "updates";
      iconName = "receipt";
      colorClass = "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 border-indigo-500/20";
    } else if (msg.includes("completed") || msg.includes("marked completed")) {
      title = "Task Completed";
      type = "updates";
      iconName = "check-circle";
      colorClass = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    } else if (msg.includes("system") || msg.includes("features") || msg.includes("experience")) {
      title = "System Update";
      type = "system";
      iconName = "settings";
      colorClass = "bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20";
    }

    return {
      ...notif,
      title,
      type,
      iconName,
      colorClass,
      text
    };
  };

  // Combine database notifications with fallback templates if database is fresh
  const allNotifications = (dbNotifications.length > 0 ? dbNotifications : fallbackNotifications)
    .filter(n => !deletedFallbackIds.includes(n.id))
    .map(parseNotification);

  // Format Timestamps dynamically
  const formatTimestamp = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const itemDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const timeString = `${displayHours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;

    if (itemDate.getTime() === today.getTime()) {
      return timeString;
    } else if (itemDate.getTime() === yesterday.getTime()) {
      return `Yesterday, ${timeString}`;
    } else {
      const days = date.getDate();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthName = months[date.getMonth()];
      const year = date.getFullYear();
      return `${days} ${monthName} ${year}, ${timeString}`;
    }
  };

  const handleMarkAllRead = async () => {
    setLoading(true);
    try {
      await markAllAsRead();
      showToast('All notifications marked as read!', 'success');
      fetchNotifications();
    } catch (err) {
      showToast(err.message || 'Error updating notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Tabs Filter Logic
  const filteredNotifications = allNotifications.filter(n => {
    if (activeTab === 'Unread') return n.status === 'unread';
    return true; // All
  });

  // Pagination Logic
  const totalPages = Math.max(Math.ceil(filteredNotifications.length / pageSize), 1);
  const paginatedNotifications = filteredNotifications.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Helper to render Lucide Icons dynamically
  const renderIcon = (name) => {
    switch (name) {
      case 'calendar':
        return <Calendar className="w-4 h-4 shrink-0" />;
      case 'user-plus':
        return <UserPlus className="w-4 h-4 shrink-0" />;
      case 'clock':
        return <Clock className="w-4 h-4 shrink-0" />;
      case 'message-square':
        return <MessageSquare className="w-4 h-4 shrink-0" />;
      case 'alert-circle':
        return <AlertCircle className="w-4 h-4 shrink-0" />;
      case 'receipt':
        return <Receipt className="w-4 h-4 shrink-0" />;
      case 'check-circle':
        return <CheckCircle className="w-4 h-4 shrink-0" />;
      default:
        return <Settings className="w-4 h-4 shrink-0" />;
    }
  };

  const handleToggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedNotifIds([]);
  };

  const handleToggleSelectNotif = (id) => {
    if (selectedNotifIds.includes(id)) {
      setSelectedNotifIds(prev => prev.filter(x => x !== id));
    } else {
      setSelectedNotifIds(prev => [...prev, id]);
    }
  };

  const handleSelectAllOnPage = () => {
    const pageIds = paginatedNotifications.map(n => n.id);
    const allSelected = pageIds.every(id => selectedNotifIds.includes(id));
    if (allSelected) {
      setSelectedNotifIds(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      setSelectedNotifIds(prev => [...new Set([...prev, ...pageIds])]);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedNotifIds.length === 0) {
      showToast('Please select at least one notification to delete', 'warning');
      return;
    }

    setDeleteLoading(true);
    try {
      const dbIds = selectedNotifIds.filter(id => !id.toString().startsWith('f'));
      const fallbackIds = selectedNotifIds.filter(id => id.toString().startsWith('f'));

      if (dbIds.length > 0) {
        const res = await authFetch('/notifications/delete', {
          method: 'POST',
          body: JSON.stringify({ ids: dbIds })
        });
        if (!res.ok) {
          let errMsg = 'Failed to delete notifications';
          try {
            const errData = await res.json();
            errMsg = errData.message || errMsg;
          } catch (e) {
            errMsg = `Server error (${res.status})`;
          }
          throw new Error(errMsg);
        }
      }

      if (fallbackIds.length > 0) {
        const newDeleted = [...deletedFallbackIds, ...fallbackIds];
        setDeletedFallbackIds(newDeleted);
        localStorage.setItem('deleted_fallback_notifications', JSON.stringify(newDeleted));
      }

      showToast('Selected notifications deleted successfully', 'success');
      setSelectedNotifIds([]);
      setIsSelectionMode(false);
      fetchNotifications();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    setSelectedNotifIds([]);
    setIsSelectionMode(false);
  }, [activeTab]);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12 font-medium">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white dark:text-white">
            Notifications
          </h1>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            Stay updated with your event activities.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isSelectionMode ? (
            <>
              <button
                onClick={handleSelectAllOnPage}
                className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white text-xs font-bold transition-all hover:bg-white/10 cursor-pointer"
              >
                Select Page
              </button>
              <button
                onClick={handleDeleteSelected}
                disabled={selectedNotifIds.length === 0 || deleteLoading}
                className="px-3.5 py-2 rounded-xl bg-red-650/10 border border-red-500/20 text-red-500 hover:bg-red-600 hover:text-white disabled:opacity-40 disabled:pointer-events-none text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
              >
                {deleteLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span>🗑️ Delete ({selectedNotifIds.length})</span>
                )}
              </button>
              <button
                onClick={handleToggleSelectionMode}
                className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white text-xs font-bold transition-all hover:bg-white/10 cursor-pointer"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleToggleSelectionMode}
                disabled={paginatedNotifications.length === 0}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white disabled:opacity-40 disabled:pointer-events-none text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all hover:bg-white/10"
              >
                <CheckSquare className="w-4 h-4 text-indigo-400" />
                Select
              </button>
              <button
                onClick={handleMarkAllRead}
                disabled={unreadCount === 0 && dbNotifications.length > 0}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white disabled:opacity-40 disabled:pointer-events-none text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all hover:bg-white/10"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                ) : (
                  <Check className="w-4 h-4 text-indigo-400" />
                )}
                Mark all as read
              </button>
            </>
          )}
        </div>
      </div>

      {/* 2. Filter Tabs Header */}
      <div className="flex gap-6 overflow-x-auto text-[13px] font-bold text-gray-500 border-b border-white/5 pb-2 scrollbar-none">
        {[
          { id: 'All', label: 'All' },
          { id: 'Unread', label: `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}` }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 relative cursor-pointer whitespace-nowrap transition-colors ${
                isActive
                  ? 'text-[#1d4ed8] dark:text-indigo-400 font-extrabold border-b-2 border-[#1d4ed8] dark:border-indigo-400'
                  : 'hover:text-gray-800 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 3. Notifications Feed List */}
      <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden shadow-sm flex flex-col divide-y divide-white/5">
        {paginatedNotifications.length === 0 ? (
          <div className="py-24 text-center text-gray-500 font-bold flex flex-col items-center justify-center gap-3">
            <Bell className="w-10 h-10 text-gray-600 animate-pulse" />
            <span>No notifications in this category.</span>
          </div>
        ) : (
          paginatedNotifications.map((notif) => {
            const isSelected = selectedNotifIds.includes(notif.id);
            return (
              <div
                key={notif.id}
                onClick={() => {
                  if (isSelectionMode) {
                    handleToggleSelectNotif(notif.id);
                  }
                }}
                className={`p-5 flex items-center justify-between gap-4 transition-all ${
                  isSelectionMode ? 'cursor-pointer hover:bg-white/[0.02]' : 'hover:bg-white/[0.01]'
                } ${
                  notif.status === 'unread' ? 'bg-indigo-500/[0.015]' : ''
                } ${
                  isSelected ? 'bg-indigo-650/10' : ''
                }`}
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  {isSelectionMode && (
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSelectNotif(notif.id);
                      }}
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-indigo-600 border-indigo-500 text-white' 
                          : 'border-white/20 hover:border-indigo-500/50'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  )}

                  {/* Custom Icon Wrapper */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${notif.colorClass}`}>
                    {renderIcon(notif.iconName)}
                  </div>

                  <div className="flex flex-col gap-0.5 min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-gray-200 dark:text-white leading-tight">
                      {notif.title}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-gray-400 dark:text-gray-300 font-medium leading-normal mt-0.5 line-clamp-1 sm:line-clamp-none">
                      {notif.text}
                    </p>
                  </div>
                </div>

                {/* Time and Unread Dot */}
                <div className="flex items-center gap-4 shrink-0 text-right">
                  <span className="text-[10px] sm:text-xs text-gray-500 font-bold font-outfit">
                    {formatTimestamp(notif.created_at)}
                  </span>
                  
                  {/* Purple Unread indicator dot */}
                  <span className={`w-2 h-2 rounded-full transition-all shrink-0 ${
                    notif.status === 'unread' 
                      ? 'bg-[#1d4ed8] dark:bg-indigo-500 shadow-sm shadow-indigo-500' 
                      : 'bg-transparent'
                  }`} />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. Pagination Footer */}
      {filteredNotifications.length > 0 && (
        <div className="glass-panel px-5 py-4 rounded-2xl border border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-bold text-gray-500 bg-white/[0.005]">
          <span>
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredNotifications.length)} of {filteredNotifications.length} notifications
          </span>
          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="p-1.5 rounded-lg border border-white/5 bg-white/3 disabled:opacity-30 text-gray-400 hover:text-white transition-colors cursor-pointer"
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
                      ? 'bg-[#1d4ed8] text-white font-extrabold shadow-sm shadow-indigo-600/10'
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
              className="p-1.5 rounded-lg border border-white/5 bg-white/3 disabled:opacity-30 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
