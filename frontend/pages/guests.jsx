import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
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
  const { fetchNotifications, showToast } = useNotifications();
  const { theme } = useTheme();
  const isLight = theme === 'light';

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
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingGuestId, setEditingGuestId] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);

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
          setSelectedEvent(null);
        }
      } else {
        setSelectedEvent(null);
      }
    } catch (err) {
      setSelectedEvent(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch guests for selected event
  const fetchGuestsList = async (eventId) => {
    if (!eventId) {
      setGuests([]);
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
          phone: g.phone || '-',
          group_table: idx % 3 === 0 ? 'Family Table 1' : idx % 3 === 1 ? 'Friends Table 2' : 'Office Table 3',
          status: g.status, // confirmed, pending, declined
          dietary: idx % 2 === 0 ? 'Vegetarian' : 'Non-Vegetarian',
          invited_on: new Date(g.created_at || Date.now()).toISOString().split('T')[0]
        }));
        setGuests(mapped);
      } else {
        setGuests([]);
      }
    } catch (err) {
      setGuests([]);
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

  // Export Guest list to CSV
  const handleExportGuests = () => {
    if (guests.length === 0) {
      showToast('No guests to export!', 'error');
      return;
    }
    const headers = ['Guest Name', 'Email', 'Phone', 'RSVP Status'];
    const rows = guests.map(g => [
      `"${g.guest_name.replace(/"/g, '""')}"`,
      `"${g.email.replace(/"/g, '""')}"`,
      `"${g.phone.replace(/"/g, '""')}"`,
      `"${g.status.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedEvent ? selectedEvent.title.replace(/\s+/g, '_') : 'guests'}_list.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Guest list exported to CSV successfully!', 'success');
  };

  // Import Guests from CSV
  const handleImportGuests = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!selectedEvent) {
      showToast('Please select an event first!', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
      if (lines.length <= 1) {
        showToast('No guests found in CSV file!', 'error');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
      const nameIdx = headers.findIndex(h => h.includes('name'));
      const emailIdx = headers.findIndex(h => h.includes('email'));
      const phoneIdx = headers.findIndex(h => h.includes('phone') || h.includes('contact') || h.includes('mobile'));
      const statusIdx = headers.findIndex(h => h.includes('status') || h.includes('rsvp'));

      if (nameIdx === -1 || emailIdx === -1) {
        showToast('CSV must contain "Guest Name" and "Email" columns!', 'error');
        return;
      }

      showToast('Importing guests...', 'info');
      let importCount = 0;
      let failCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const columns = [];
        let current = '';
        let inQuotes = false;
        for (let j = 0; j < line.length; j++) {
          const char = line[j];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            columns.push(current.trim().replace(/^["']|["']$/g, ''));
            current = '';
          } else {
            current += char;
          }
        }
        columns.push(current.trim().replace(/^["']|["']$/g, ''));

        const guestName = columns[nameIdx];
        const email = columns[emailIdx];
        const phone = phoneIdx !== -1 ? columns[phoneIdx] : '';
        let status = 'pending';
        if (statusIdx !== -1 && columns[statusIdx]) {
          const parsedStatus = columns[statusIdx].toLowerCase();
          if (parsedStatus.includes('going') || parsedStatus.includes('confirm')) {
            status = 'confirmed';
          } else if (parsedStatus.includes('decline') || parsedStatus.includes('not going')) {
            status = 'declined';
          }
        }

        if (!guestName || !email) continue;

        if (selectedEvent.id === 9999) {
          const newGuestObj = {
            id: Date.now() + i,
            guest_name: guestName,
            email: email,
            phone: phone || '-',
            group_table: 'Family Table 1',
            status: status,
            dietary: 'Vegetarian',
            invited_on: new Date().toISOString().split('T')[0]
          };
          setGuests(prev => [newGuestObj, ...prev]);
          importCount++;
        } else {
          try {
            const res = await authFetch('/guest/add', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                eventId: selectedEvent.id,
                guest_name: guestName,
                email: email,
                phone: phone || null,
                status: status
              })
            });
            if (res.ok) {
              importCount++;
            } else {
              failCount++;
            }
          } catch (err) {
            failCount++;
          }
        }
      }

      if (importCount > 0) {
        showToast(`Successfully imported ${importCount} guests!`, 'success');
        if (selectedEvent.id !== 9999) {
          fetchGuestsList(selectedEvent.id);
          fetchNotifications();
        }
      }
      if (failCount > 0) {
        showToast(`Failed to import ${failCount} guests.`, 'error');
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  // Generate real-time activities from the guests list sorted by creation time
  const getRecentActivities = () => {
    const sortedGuests = [...guests].sort((a, b) => b.id - a.id);
    return sortedGuests.slice(0, 5).map(g => {
      let message = '';
      let color = 'bg-purple-500';
      
      if (g.status === 'confirmed') {
        message = (
          <>
            <strong className="text-white">{g.guest_name}</strong> responded <strong className="text-emerald-500">Going</strong>
          </>
        );
        color = 'bg-emerald-500';
      } else if (g.status === 'declined') {
        message = (
          <>
            <strong className="text-white">{g.guest_name}</strong> responded <strong className="text-rose-500">Not Going</strong>
          </>
        );
        color = 'bg-rose-500';
      } else {
        message = (
          <>
            New guest <strong className="text-white">{g.guest_name}</strong> added to list
          </>
        );
        color = 'bg-indigo-500';
      }

      let timeText = 'Recently';
      if (g.invited_on) {
        const invitedDate = new Date(g.invited_on);
        const today = new Date();
        const diffTime = Math.abs(today - invitedDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 1) {
          timeText = 'Today';
        } else if (diffDays === 2) {
          timeText = '1 day ago';
        } else {
          timeText = `${diffDays - 1} days ago`;
        }
      }

      return {
        id: g.id,
        color,
        message,
        time: timeText
      };
    });
  };

  // Generate real-time dynamic guest trend data
  const getTrendData = () => {
    if (guests.length === 0) {
      return {
        points: [],
        pathD: '',
        areaD: '',
        labels: []
      };
    }

    // Sort guests by invited_on date ascending
    const sorted = [...guests]
      .filter(g => g.invited_on)
      .sort((a, b) => new Date(a.invited_on) - new Date(b.invited_on));

    if (sorted.length === 0) {
      return {
        points: [],
        pathD: '',
        areaD: '',
        labels: []
      };
    }
    
    // Group by date
    const dateGroups = {};
    sorted.forEach(g => {
      const d = g.invited_on;
      dateGroups[d] = (dateGroups[d] || 0) + 1;
    });

    const uniqueDates = Object.keys(dateGroups).sort((a, b) => new Date(a) - new Date(b));
    
    // Compute cumulative counts
    const dataPoints = [];
    let cumulative = 0;
    uniqueDates.forEach(date => {
      cumulative += dateGroups[date];
      dataPoints.push({
        date,
        count: cumulative
      });
    });

    // We need at least 2 points to draw a line. Prepend 0 if only 1 point exists.
    if (dataPoints.length === 1) {
      const firstDate = new Date(dataPoints[0].date);
      firstDate.setDate(firstDate.getDate() - 1);
      const startStr = firstDate.toISOString().split('T')[0];
      dataPoints.unshift({ date: startStr, count: 0 });
    }

    const maxVal = Math.max(...dataPoints.map(p => p.count), 1);
    
    // SVG Dimension properties: width 500, height 150
    const chartWidth = 500;
    const chartHeight = 150;
    const paddingLeft = 20;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 25;

    const usableWidth = chartWidth - paddingLeft - paddingRight;
    const usableHeight = chartHeight - paddingTop - paddingBottom;

    const points = dataPoints.map((p, idx) => {
      const x = paddingLeft + (idx / (dataPoints.length - 1)) * usableWidth;
      const y = (chartHeight - paddingBottom) - (p.count / maxVal) * usableHeight;
      return { x, y, count: p.count, date: p.date };
    });

    let pathD = '';
    let areaD = '';

    if (points.length > 0) {
      pathD = `M ${points[0].x} ${points[0].y}`;
      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];
        const cp1x = p1.x + (p2.x - p1.x) / 3;
        const cp1y = p1.y;
        const cp2x = p1.x + 2 * (p2.x - p1.x) / 3;
        const cp2y = p2.y;
        pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
      }
      areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingBottom} L ${points[0].x} ${chartHeight - paddingBottom} Z`;
    }

    const labels = dataPoints.map(p => {
      const dObj = new Date(p.date);
      return dObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    });

    return { points, pathD, areaD, labels };
  };

  // Edit Guest Trigger
  const handleEditClick = (guest) => {
    setIsEditMode(true);
    setEditingGuestId(guest.id);
    setNewGuestName(guest.guest_name);
    setNewGuestEmail(guest.email);
    setNewGuestPhone(guest.phone === '-' ? '' : guest.phone);
    setNewGuestStatus(guest.status);
    setIsAddGuestOpen(true);
    setActiveActionsMenuId(null);
  };

  // Add Guest Trigger
  const handleAddClick = () => {
    setIsEditMode(false);
    setEditingGuestId(null);
    setNewGuestName('');
    setNewGuestEmail('');
    setNewGuestPhone('');
    setNewGuestStatus('confirmed');
    setIsAddGuestOpen(true);
  };

  // Add / Edit Guest API Submit
  const handleGuestSubmit = async (e) => {
    e.preventDefault();
    if (!newGuestName || !newGuestEmail) {
      showToast('Please fill in name and email fields', 'error');
      return;
    }

    if (selectedEvent.id === 9999) {
      if (isEditMode) {
        setGuests(prev => prev.map(g => g.id === editingGuestId ? {
          ...g,
          guest_name: newGuestName,
          email: newGuestEmail,
          phone: newGuestPhone || '-',
          status: newGuestStatus
        } : g));
        showToast(`Successfully updated guest "${newGuestName}"!`, 'success');
      } else {
        const newGuestObj = {
          id: Date.now(),
          guest_name: newGuestName,
          email: newGuestEmail,
          phone: newGuestPhone || '-',
          group_table: newGuestGroup,
          status: newGuestStatus,
          dietary: newGuestDiet,
          invited_on: new Date().toISOString().split('T')[0]
        };
        setGuests(prev => [newGuestObj, ...prev]);
        showToast(`Successfully added guest "${newGuestName}"!`, 'success');
      }
      setIsAddGuestOpen(false);
      setNewGuestName('');
      setNewGuestEmail('');
      setNewGuestPhone('');
      return;
    }

    try {
      const url = isEditMode ? `/guest/${editingGuestId}` : '/guest/add';
      const method = isEditMode ? 'PUT' : 'POST';
      const body = {
        eventId: selectedEvent.id,
        guest_name: newGuestName,
        email: newGuestEmail,
        phone: newGuestPhone || null,
        status: newGuestStatus
      };

      const res = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        showToast(`Successfully ${isEditMode ? 'updated' : 'added'} guest "${newGuestName}"!`, 'success');
        setIsAddGuestOpen(false);
        setNewGuestName('');
        setNewGuestEmail('');
        setNewGuestPhone('');
        fetchGuestsList(selectedEvent.id);
        fetchNotifications();
      } else {
        const data = await res.json();
        showToast(data.message || 'Error saving guest details', 'error');
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
  const totalCount = guests.length;
  
  const getStat = (statusType) => {
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

  if (loading && events.length === 0) {
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

  if (events.length === 0) {
    return (
      <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-12 font-medium">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white dark:text-white">
            Guest Management
          </h1>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            Manage your guests, RSVPs, and seating arrangements.
          </p>
        </div>
        <div className="glass-panel flex flex-col items-center justify-center py-20 text-center max-w-xl mx-auto gap-4 font-bold border border-white/5 rounded-2xl p-6 w-full">
          <div className="w-16 h-16 rounded-full bg-[#1d4ed8]/10 border border-[#1d4ed8]/20 flex items-center justify-center text-[#1d4ed8] dark:text-indigo-400">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-extrabold text-white">No Events Found</h2>
          <p className="text-xs text-gray-500 max-w-sm leading-relaxed font-medium">
            You don't have any events created yet. To manage guests, you must first create an event or generate one using our AI Planner.
          </p>
          <div className="flex items-center gap-3.5 mt-2">
            <Link
              href="/ai"
              className="px-4 py-2.5 rounded-xl bg-[#1d4ed8] hover:bg-[#1e3a8a] always-white text-xs font-bold shadow-lg shadow-indigo-500/10 transition-all cursor-pointer"
            >
              Create Event with AI
            </Link>
            <Link
              href="/events"
              className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-gray-300 dark:hover:text-white transition-all cursor-pointer"
            >
              View My Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
            onClick={handleAddClick}
            className="px-4 py-2.5 rounded-xl bg-[#1d4ed8] hover:bg-[#1e3a8a] always-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-500/10 transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Guests
          </button>
          <input
            type="file"
            id="guest-import-file"
            accept=".csv"
            className="hidden"
            onChange={handleImportGuests}
          />
          <button
            onClick={() => document.getElementById('guest-import-file').click()}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-gray-300 dark:hover:text-white flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            Import Guests
          </button>
          <button
            onClick={handleExportGuests}
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

        {/* 4 Stats metrics Cards (col-span-5) */}
        <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-4 gap-4 font-medium">
          {/* Card 1: Total Guests */}
          <div className="glass-card p-4 rounded-2xl flex items-center justify-between border border-white/5 shadow-sm">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Guests</span>
              <span className="text-xl font-extrabold text-white dark:text-white">{totalCount}</span>
              <button onClick={() => setActiveTab('All')} className="text-[9px] text-[#1d4ed8] dark:text-indigo-400 font-extrabold hover:underline text-left mt-1">
                View all guests &rarr;
              </button>
            </div>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[#1d4ed8] dark:text-indigo-400 flex items-center justify-center shrink-0">
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
        </div>
      </div>

      {/* 3. Mid Grid Layout (Donut RSVP, Line Trend SVG) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
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
        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between gap-4 relative">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <div>
              <h3 className="text-xs font-bold text-gray-200 dark:text-white uppercase tracking-wider">
                Guest Trend
              </h3>
              <p className="text-[8px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">Cumulative invited guests timeline</p>
            </div>
            <span className="text-[9px] text-gray-500 border border-white/10 rounded-lg px-2 py-0.5 font-bold uppercase">This Event</span>
          </div>

          {/* SVG Line Chart Graph */}
          <div className="relative w-full h-28 flex flex-col justify-between">
            {(() => {
              const trend = getTrendData();
              if (trend.points.length === 0) {
                return (
                  <div className="flex items-center justify-center h-full text-[10px] text-gray-500 font-bold uppercase">
                    No RSVP trend data available
                  </div>
                );
              }
              return (
                <>
                  <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible">
                    {/* Grid Lines with dynamic theme color */}
                    <line x1="0" y1="120" x2="500" y2="120" stroke="currentColor" className="text-gray-400/10 dark:text-white/5" strokeWidth="1" />
                    <line x1="0" y1="80" x2="500" y2="80" stroke="currentColor" className="text-gray-400/10 dark:text-white/5" strokeWidth="1" />
                    <line x1="0" y1="40" x2="500" y2="40" stroke="currentColor" className="text-gray-400/10 dark:text-white/5" strokeWidth="1" />
                    
                    {/* Gradient Area under Curve */}
                    <defs>
                      <linearGradient id="purpleTrendGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(90, 43, 212, 0.25)" />
                        <stop offset="100%" stopColor="rgba(90, 43, 212, 0.0)" />
                      </linearGradient>
                      {/* Glow Filter for line */}
                      <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#1d4ed8" floodOpacity="0.25" />
                      </filter>
                    </defs>

                    {/* Shaded Area */}
                    {trend.areaD && (
                      <path
                        d={trend.areaD}
                        fill="url(#purpleTrendGrad)"
                      />
                    )}

                    {/* Stroke Line with glow */}
                    {trend.pathD && (
                      <path
                        d={trend.pathD}
                        fill="transparent"
                        stroke="#1d4ed8"
                        strokeWidth="3"
                        strokeLinecap="round"
                        filter="url(#lineGlow)"
                      />
                    )}

                    {/* Data Points Dot indicators with Hover Actions */}
                    {trend.points.map((pt, idx) => (
                      <g
                        key={idx}
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredPoint(pt)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      >
                        {/* Larger hover target area */}
                        <circle cx={pt.x} cy={pt.y} r="12" fill="transparent" />
                        
                        {/* Pulse Ring */}
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="6.5"
                          fill="#1d4ed8"
                          opacity={hoveredPoint && hoveredPoint.date === pt.date ? "0.3" : "0"}
                          className="transition-all duration-200"
                        />
                        
                        {/* Core Dot */}
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={hoveredPoint && hoveredPoint.date === pt.date ? "5.5" : "4"}
                          fill="#1d4ed8"
                          className="stroke-white dark:stroke-[#151c2c] transition-all duration-150"
                          strokeWidth="1.5"
                        />
                      </g>
                    ))}
                  </svg>
                  
                  {/* Tooltip Overlay */}
                  {hoveredPoint && (
                    <div
                      className={`absolute text-[9px] px-2.5 py-1.5 rounded-xl shadow-2xl pointer-events-none transition-all duration-150 z-20 flex flex-col items-center gap-0.5 border ${
                        isLight 
                          ? 'bg-white text-gray-800 border-gray-200' 
                          : 'bg-slate-900/95 text-white border-white/10'
                      }`}
                      style={{
                        left: `${(hoveredPoint.x / 500) * 100}%`,
                        top: `${(hoveredPoint.y / 150) * 100}%`,
                        transform: 'translate(-50%, -130%)',
                        color: isLight ? '#1f2937' : '#ffffff',
                        backgroundColor: isLight ? '#ffffff' : 'rgba(15, 23, 42, 0.95)',
                        borderColor: isLight ? '#e5e7eb' : 'rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      <span className="text-[7.5px] font-extrabold uppercase tracking-wider" style={{ color: isLight ? '#4f46e5' : '#818cf8' }}>
                        {new Date(hoveredPoint.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                      <span className="text-xs font-black" style={{ color: isLight ? '#1f2937' : '#ffffff' }}>{hoveredPoint.count} Guests</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-[8px] text-gray-500 font-bold uppercase" style={{ paddingLeft: '4%', paddingRight: '4%' }}>
                    {trend.labels.map((lbl, idx) => (
                      <span key={idx}>{lbl}</span>
                    ))}
                  </div>
                </>
              );
            })()}
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
                      ? 'text-[#1d4ed8] dark:text-indigo-400 border-b-2 border-[#1d4ed8] dark:border-indigo-400'
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
                  <th className="py-3 px-4 w-14 text-center">Sr No.</th>
                  <th className="py-3 px-3 w-[40%]">Guest Name</th>
                  <th className="py-3 px-3 w-[25%]">Contact</th>
                  <th className="py-3 px-3 w-[20%]">RSVP Status</th>
                  <th className="py-3 px-4 text-right w-24">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/2 text-gray-300 font-semibold">
                {paginatedGuests.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-gray-500">
                      No guests logged matching criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedGuests.map((guest, idx) => (
                    <tr key={guest.id} className="hover:bg-white/[0.01] transition-colors relative">
                      <td className="py-3.5 px-4 w-14 text-center font-outfit text-gray-400 text-[11px]">
                        {(currentPage - 1) * pageSize + idx + 1}
                      </td>
                      <td className="py-3.5 px-3 w-[40%]">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-indigo-500/10 text-indigo-400 font-extrabold flex items-center justify-center text-[10px] uppercase shrink-0 border border-[#1d4ed8]/20">
                            {guest.guest_name[0]}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-gray-200 dark:text-white truncate max-w-[130px] leading-tight">{guest.guest_name}</span>
                            <span className="text-[9px] text-gray-500 truncate mt-0.5">{guest.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-outfit text-gray-400 text-[10.5px] w-[25%]">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-gray-500 shrink-0" />
                          {guest.phone}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 w-[20%]">
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
                      <td className="py-3.5 px-4 text-right w-24 relative">
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
                                onClick={() => handleEditClick(guest)}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px] text-gray-300 hover:bg-white/5 hover:text-white transition-all text-left font-semibold cursor-pointer border-b border-white/5"
                              >
                                <Edit className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
                                Edit Details
                              </button>
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
                            ? 'bg-[#1d4ed8] text-white'
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

        {/* Right Column: Recent Activity Feed */}
        <div className="flex flex-col gap-8">

          {/* Recent RSVP Activities Feed */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="text-xs font-bold text-gray-200 dark:text-white uppercase tracking-wider">
                Recent Activities
              </h3>
              <button onClick={() => showToast('Opening activity history logs...', 'info')} className="text-[10px] text-[#1d4ed8] dark:text-indigo-400 font-extrabold hover:underline">
                View All
              </button>
            </div>

            <div className="flex flex-col gap-3 font-semibold text-[10px] text-gray-400">
              {getRecentActivities().length === 0 ? (
                <div className="text-gray-500 text-center py-4">No recent guest activities.</div>
              ) : (
                getRecentActivities().map(act => (
                  <div key={act.id} className="flex gap-2.5 items-start border-b border-white/3 pb-2.5 last:border-0 last:pb-0">
                    <span className={`w-2 h-2 rounded-full ${act.color} shrink-0 mt-1.5`}></span>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-gray-200 dark:text-gray-200 leading-snug">{act.message}</span>
                      <span className="text-[9px] text-gray-500">{act.time}</span>
                    </div>
                  </div>
                ))
              )}
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
                {isEditMode ? 'Edit Guest Details' : 'Add Guest to Event Invitation'}
              </h3>
              <button
                onClick={() => setIsAddGuestOpen(false)}
                className="text-gray-400 hover:text-white font-extrabold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGuestSubmit} className="flex flex-col gap-4 font-bold">
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
                  className="px-4 py-2 rounded-xl bg-[#1d4ed8] hover:bg-[#1e3a8a] always-white text-xs font-bold transition-all shadow-md shadow-indigo-600/15 cursor-pointer"
                >
                  {isEditMode ? 'Update Guest' : 'Register Guest'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
