import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  CheckSquare,
  Plus,
  Filter,
  Calendar,
  Clock,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Check,
  X,
  AlertCircle
} from 'lucide-react';

export default function TasksTimeline() {
  const { authFetch } = useAuth();
  const { showToast } = useNotifications();

  // General States
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dropdown / Filter States
  const [showEventSelector, setShowEventSelector] = useState(false);
  const [activeTab, setActiveTab] = useState('All Tasks'); // 'All Tasks', 'To Do', 'In Progress', 'Completed', 'Overdue'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeActionsMenuId, setActiveActionsMenuId] = useState(null);
  const [showFilterPopover, setShowFilterPopover] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // Modal / Add Task Form States
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('Rahul Sharma');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('Medium');
  const [newTaskStatus, setNewTaskStatus] = useState('To Do');

  const actionsDropdownRef = useRef(null);

  // List of standard mock members for event assignment
  const mockTeamMembers = [
    'Rahul Sharma',
    'Priya Patel',
    'Vikram Singh',
    'Anjali Mehta',
    'Rohan Mehta',
    'Sneha Iyer'
  ];

  // Assignee photo mapping (Unsplash portraits for premium feel)
  const assigneeAvatars = {
    'Rahul Sharma': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&fit=crop&auto=format',
    'Priya Patel': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&fit=crop&auto=format',
    'Vikram Singh': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&fit=crop&auto=format',
    'Anjali Mehta': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&fit=crop&auto=format',
    'Rohan Mehta': 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=80&fit=crop&auto=format',
    'Sneha Iyer': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&fit=crop&auto=format'
  };

  // Fallbacks if backend event/task tables are unpopulated
  const fallbackEvent = {
    id: 9999,
    title: 'Wedding Event',
    date: '2024-12-25',
    location: 'The Leela Palace, Udaipur',
    budget: 1500000,
    event_type: 'Wedding'
  };

  const fallbackTasks = [
    { id: 1, title: 'Book The Venue || Rahul Sharma || High || To Do', deadline: '2024-05-20', status: 'completed' },
    { id: 2, title: 'Send Invitations || Priya Patel || Medium || In Progress', deadline: '2024-05-22', status: 'pending' },
    { id: 3, title: 'Catering Finalization || Vikram Singh || High || To Do', deadline: '2024-05-25', status: 'pending' },
    { id: 4, title: 'Decorations Setup || Anjali Mehta || Medium || To Do', deadline: '2024-05-28', status: 'pending' },
    { id: 5, title: 'Entertainment Booking || Rohan Mehta || Low || In Progress', deadline: '2024-05-30', status: 'pending' },
    { id: 6, title: 'Guest List Confirmation || Sneha Iyer || Medium || To Do', deadline: '2024-06-01', status: 'pending' },
    { id: 7, title: 'Event Day Management || Rahul Sharma || High || To Do', deadline: '2024-06-05', status: 'pending' },
    { id: 8, title: 'Post Event Follow-up || Priya Patel || Low || To Do', deadline: '2024-06-07', status: 'pending' }
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

  // Deterministic fallback mock generators for older tasks that don't have delimiters
  const getMockAssignee = (id) => {
    return mockTeamMembers[id % mockTeamMembers.length];
  };

  const getMockPriority = (id) => {
    const priorities = ['High', 'Medium', 'Low'];
    return priorities[id % priorities.length];
  };

  const getMockVisualStatus = (id) => {
    const statuses = ['To Do', 'In Progress'];
    return statuses[id % statuses.length];
  };

  // Parse custom task parameters out of db title string
  const parseTask = (task) => {
    const parts = task.title.split(' || ');
    const displayName = parts[0];
    const assigneeName = parts[1] || getMockAssignee(task.id);
    const priority = parts[2] || getMockPriority(task.id);
    const visualStatus = parts[3] || getMockVisualStatus(task.id);

    let finalStatus = task.status === 'completed' ? 'Completed' : visualStatus;

    // Check if task is overdue
    if (task.status === 'pending' && task.deadline) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const deadlineDate = new Date(task.deadline);
      if (deadlineDate < today) {
        finalStatus = 'Overdue';
      }
    }

    return {
      ...task,
      displayName,
      assigneeName,
      priority,
      visualStatus: finalStatus
    };
  };

  // Fetch tasks for current event
  const fetchTasksList = async (eventId) => {
    if (!eventId || eventId === 9999) {
      setTasks(fallbackTasks.map(parseTask));
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await authFetch(`/tasks/${eventId}`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data.map(parseTask));
      } else {
        setTasks(fallbackTasks.map(parseTask));
      }
    } catch (err) {
      setTasks(fallbackTasks.map(parseTask));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      fetchTasksList(selectedEvent.id);
    }
  }, [selectedEvent]);

  // Click outside actions menu to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (actionsDropdownRef.current && !actionsDropdownRef.current.contains(event.target)) {
        setActiveActionsMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset page number on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab, priorityFilter]);

  // Submit Add Task API
  const handleAddTaskSubmit = async (e) => {
    e.preventDefault();
    if (!newTaskTitle || !newTaskDeadline) {
      showToast('Please fill in task title and deadline', 'error');
      return;
    }

    // Format title with custom parameter serialization
    const serializedTitle = `${newTaskTitle} || ${newTaskAssignee} || ${newTaskPriority} || ${newTaskStatus}`;
    const dbStatus = newTaskStatus === 'Completed' ? 'completed' : 'pending';

    if (selectedEvent.id === 9999) {
      // Mock insert locally
      const mockNewTask = {
        id: Date.now(),
        title: serializedTitle,
        deadline: newTaskDeadline,
        status: dbStatus
      };
      setTasks(prev => [parseTask(mockNewTask), ...prev]);
      showToast(`Successfully added task "${newTaskTitle}"!`, 'success');
      setIsAddTaskOpen(false);
      setNewTaskTitle('');
      setNewTaskDeadline('');
      return;
    }

    try {
      const res = await authFetch('/task/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          title: serializedTitle,
          deadline: newTaskDeadline,
          status: dbStatus
        })
      });

      if (res.ok) {
        showToast(`Successfully added task "${newTaskTitle}"!`, 'success');
        setIsAddTaskOpen(false);
        setNewTaskTitle('');
        setNewTaskDeadline('');
        fetchTasksList(selectedEvent.id);
      } else {
        const data = await res.json();
        showToast(data.message || 'Error creating task', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Toggle completion checkbox in table
  const handleToggleTaskStatus = async (taskObj) => {
    const originalStatus = taskObj.status;
    const newStatus = originalStatus === 'completed' ? 'pending' : 'completed';

    // Optimistic UI updates
    setTasks(prev => prev.map(t => {
      if (t.id === taskObj.id) {
        return {
          ...t,
          status: newStatus,
          visualStatus: newStatus === 'completed' ? 'Completed' : t.visualStatus === 'Completed' ? 'To Do' : t.visualStatus
        };
      }
      return t;
    }));

    if (selectedEvent.id === 9999) {
      showToast(`Task marked as ${newStatus === 'completed' ? 'completed' : 'pending'}`, 'success');
      return;
    }

    try {
      const res = await authFetch(`/task/${taskObj.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        showToast(`Task status updated!`, 'success');
        fetchTasksList(selectedEvent.id);
      } else {
        // Rollback on failure
        setTasks(prev => prev.map(t => {
          if (t.id === taskObj.id) {
            return {
              ...t,
              status: originalStatus,
              visualStatus: originalStatus === 'completed' ? 'Completed' : t.visualStatus
            };
          }
          return t;
        }));
        showToast('Failed to update task status', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Delete Task
  const handleDeleteTask = async (taskId, taskName) => {
    if (!window.confirm(`Are you sure you want to delete task "${taskName}"?`)) return;

    if (selectedEvent.id === 9999) {
      setTasks(prev => prev.filter(t => t.id !== taskId));
      showToast(`Deleted task "${taskName}"`, 'info');
      setActiveActionsMenuId(null);
      return;
    }

    try {
      const res = await authFetch(`/task/${taskId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(`Task "${taskName}" deleted`, 'success');
        fetchTasksList(selectedEvent.id);
        setActiveActionsMenuId(null);
      } else {
        const data = await res.json();
        showToast(data.message || 'Failed to delete task', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Helper date parsing/formatting e.g. "20 May 2024"
  const formatDateDisplay = (dateString) => {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const day = d.getDate();
    const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
    // Let's grab correct month name
    const allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = allMonths[d.getMonth()];
    const year = d.getFullYear();
    return `${day < 10 ? '0' + day : day} ${month} ${year}`;
  };

  // Filter Tasks List
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assigneeName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;

    let matchesTab = true;
    if (activeTab === 'To Do') matchesTab = t.visualStatus === 'To Do';
    else if (activeTab === 'In Progress') matchesTab = t.visualStatus === 'In Progress';
    else if (activeTab === 'Completed') matchesTab = t.visualStatus === 'Completed';
    else if (activeTab === 'Overdue') matchesTab = t.visualStatus === 'Overdue';

    return matchesSearch && matchesPriority && matchesTab;
  });

  // Pagination calculation
  const totalPages = Math.max(Math.ceil(filteredTasks.length / pageSize), 1);
  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12 font-medium">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white dark:text-white">
            Tasks & Timeline
          </h1>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            Plan, assign and track all tasks for your event.
          </p>
        </div>
        <button
          onClick={() => setIsAddTaskOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#5a2bd4] hover:bg-[#4c24b5] always-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-500/10 transition-all transform hover:-translate-y-0.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add New Task
        </button>
      </div>

      {/* 2. Horizontal Status Tabs & Filter Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 border-b border-white/5 pb-2 relative z-30">
        {/* Horizontal Status Tabs */}
        <div className="flex gap-6 overflow-x-auto text-[13px] font-bold text-gray-500 scrollbar-none pr-4">
          {[
            { id: 'All Tasks', label: 'All Tasks' },
            { id: 'To Do', label: 'To Do' },
            { id: 'In Progress', label: 'In Progress' },
            { id: 'Completed', label: 'Completed' },
            { id: 'Overdue', label: 'Overdue' }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 relative cursor-pointer whitespace-nowrap transition-colors ${
                  isActive
                    ? 'text-[#5a2bd4] dark:text-indigo-400 font-extrabold border-b-2 border-[#5a2bd4] dark:border-indigo-400'
                    : 'hover:text-gray-800 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right side dropdown actions */}
        <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
          {/* Search bar */}
          <div className="relative w-44 sm:w-56">
            <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Filter Popover */}
          <div className="relative">
            <button
              onClick={() => setShowFilterPopover(!showFilterPopover)}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5" />
              Filter
            </button>
            {showFilterPopover && (
              <div className="absolute right-0 mt-2 w-48 bg-[#151c2c] border border-white/10 rounded-xl shadow-2xl p-3 z-30 flex flex-col gap-2 font-bold text-xs animate-scale-up">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Priority filter</span>
                {['All', 'High', 'Medium', 'Low'].map(p => (
                  <button
                    key={p}
                    onClick={() => {
                      setPriorityFilter(p);
                      setShowFilterPopover(false);
                    }}
                    className={`w-full text-left p-1.5 rounded-lg transition-all ${
                      priorityFilter === p
                        ? 'bg-[#5a2bd4] text-white'
                        : 'text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    {p === 'All' ? 'All Priorities' : `${p} Priority`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Active Event Selector */}
          <div className="relative z-40">
            <button
              onClick={() => setShowEventSelector(!showEventSelector)}
              className="px-3.5 py-2 bg-white/5 border border-white/10 rounded-xl hover:border-indigo-500/35 transition-all text-xs font-bold text-gray-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
            >
              <span>{selectedEvent ? selectedEvent.title : 'This Event'}</span>
              <span className="text-[10px] text-gray-500">▼</span>
            </button>

            {showEventSelector && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#151c2c] border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl p-1.5 z-50 max-h-60 overflow-y-auto animate-scale-up font-bold text-xs">
                {events.length === 0 ? (
                  <button
                    onClick={() => {
                      setSelectedEvent(fallbackEvent);
                      setShowEventSelector(false);
                    }}
                    className="w-full text-left p-2 rounded-lg text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 truncate"
                  >
                    Wedding Event (Mock)
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
      </div>

      {/* 3. Table of Tasks */}
      <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-white/5 text-gray-400 font-extrabold uppercase tracking-wider bg-white/[0.005]">
                <th className="py-4 px-4 w-12">
                  <input type="checkbox" className="rounded bg-white/5 border-white/10 text-[#5a2bd4] cursor-pointer" disabled />
                </th>
                <th className="py-4 px-3">Task Name</th>
                <th className="py-4 px-3">Assigned To</th>
                <th className="py-4 px-3">Due Date</th>
                <th className="py-4 px-3">Status</th>
                <th className="py-4 px-3">Priority</th>
                <th className="py-4 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/2 text-gray-300 font-semibold">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                      <span className="text-gray-500 text-xs font-bold">Fetching tasks ledger...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedTasks.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center text-gray-500 font-bold">
                    <CheckSquare className="w-10 h-10 mx-auto text-gray-600 mb-2 animate-pulse" />
                    No tasks found matching criteria.
                  </td>
                </tr>
              ) : (
                paginatedTasks.map(task => (
                  <tr key={task.id} className="hover:bg-white/[0.01] transition-all relative group">
                    <td className="py-4 px-4 w-12">
                      <input
                        type="checkbox"
                        checked={task.status === 'completed'}
                        onChange={() => handleToggleTaskStatus(task)}
                        className="rounded border-white/10 bg-white/5 text-[#5a2bd4] focus:ring-[#5a2bd4] h-4 w-4 cursor-pointer"
                      />
                    </td>
                    <td className="py-4 px-3">
                      <span className={`font-bold text-gray-200 dark:text-white text-xs sm:text-sm tracking-tight ${
                        task.status === 'completed' ? 'line-through opacity-50' : ''
                      }`}>
                        {task.displayName}
                      </span>
                    </td>
                    <td className="py-4 px-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={assigneeAvatars[task.assigneeName] || `https://ui-avatars.com/api/?name=${encodeURIComponent(task.assigneeName)}&background=random`}
                          alt={task.assigneeName}
                          className="w-6 h-6 rounded-full border border-white/10 shrink-0 object-cover"
                        />
                        <span className="text-xs text-gray-300 leading-none font-bold">
                          {task.assigneeName}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-3 text-gray-400 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-500" />
                        <span className="font-outfit text-xs font-bold">
                          {formatDateDisplay(task.deadline)}
                        </span>
                      </span>
                    </td>
                    <td className="py-4 px-3">
                      <span className={`px-2.5 py-1 rounded-lg text-[8px] font-extrabold uppercase border ${
                        task.visualStatus === 'Completed'
                          ? 'bg-emerald-500/5 border-emerald-500/25 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400'
                          : task.visualStatus === 'In Progress'
                          ? 'bg-blue-500/5 border-blue-500/25 text-blue-500 dark:bg-blue-500/10 dark:text-blue-400'
                          : task.visualStatus === 'Overdue'
                          ? 'bg-rose-500/5 border-rose-500/25 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400'
                          : 'bg-slate-500/5 border-slate-500/25 text-slate-400 dark:bg-slate-500/10 dark:text-slate-300'
                      }`}>
                        {task.visualStatus}
                      </span>
                    </td>
                    <td className="py-4 px-3">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase border ${
                        task.priority === 'High'
                          ? 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                          : task.priority === 'Medium'
                          ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                          : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                      }`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right relative">
                      <div className="inline-block" ref={activeActionsMenuId === task.id ? actionsDropdownRef : null}>
                        <button
                          onClick={() => setActiveActionsMenuId(activeActionsMenuId === task.id ? null : task.id)}
                          className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors cursor-pointer"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {activeActionsMenuId === task.id && (
                          <div className="absolute right-5 mt-1 w-28 bg-[#151c2c] border border-white/10 rounded-xl shadow-2xl p-1 z-20 text-left animate-scale-up">
                            <button
                              onClick={() => handleDeleteTask(task.id, task.displayName)}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px] text-rose-400 hover:bg-rose-500/5 transition-all text-left font-bold cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 shrink-0" />
                              Delete Task
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

        {/* Pagination Footer */}
        {filteredTasks.length > 0 && (
          <div className="px-5 py-4 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-bold text-gray-500 bg-white/[0.005]">
            <span>
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredTasks.length)} of {filteredTasks.length} tasks
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
                        ? 'bg-[#5a2bd4] text-white font-extrabold shadow-sm shadow-indigo-600/10'
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

      {/* 4. MODAL: Add New Task Dialog */}
      {isAddTaskOpen && (
        <div className="fixed inset-0 bg-[#07080a]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-white/10 shadow-2xl p-6 flex flex-col gap-5 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-indigo-400" />
                Add New Task
              </h3>
              <button
                onClick={() => setIsAddTaskOpen(false)}
                className="text-gray-400 hover:text-white font-extrabold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTaskSubmit} className="flex flex-col gap-4 font-bold">
              {/* Task Title */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase">Task Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Booking the venue stage decorator"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Assignee Selection */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase">Assigned To</label>
                <select
                  value={newTaskAssignee}
                  onChange={(e) => setNewTaskAssignee(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-gray-300 focus:outline-none focus:border-indigo-500 cursor-pointer font-bold"
                >
                  {mockTeamMembers.map(member => (
                    <option key={member} value={member} className="bg-[#151c2c] text-white">
                      {member}
                    </option>
                  ))}
                </select>
              </div>

              {/* Deadline Datepicker */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase">Due Date</label>
                <input
                  type="date"
                  required
                  value={newTaskDeadline}
                  onChange={(e) => setNewTaskDeadline(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                />
              </div>

              {/* Priority & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-gray-300 focus:outline-none focus:border-indigo-500 cursor-pointer font-bold"
                  >
                    <option value="High" className="bg-[#151c2c]">High</option>
                    <option value="Medium" className="bg-[#151c2c]">Medium</option>
                    <option value="Low" className="bg-[#151c2c]">Low</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Status</label>
                  <select
                    value={newTaskStatus}
                    onChange={(e) => setNewTaskStatus(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-gray-300 focus:outline-none focus:border-indigo-500 cursor-pointer font-bold"
                  >
                    <option value="To Do" className="bg-[#151c2c]">To Do</option>
                    <option value="In Progress" className="bg-[#151c2c]">In Progress</option>
                    <option value="Completed" className="bg-[#151c2c]">Completed</option>
                  </select>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#5a2bd4] hover:bg-[#4c24b5] always-white font-bold text-center mt-2 cursor-pointer shadow-md transition-all uppercase tracking-wider"
              >
                Add Task
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
