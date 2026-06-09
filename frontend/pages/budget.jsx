import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  Receipt,
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
  CreditCard,
  PlusSquare,
  HelpCircle
} from 'lucide-react';

export default function BudgetPlanner() {
  const { authFetch } = useAuth();
  const { showToast } = useNotifications();

  // General States
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [budgetSummary, setBudgetSummary] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selector Dropdown State
  const [showEventSelector, setShowEventSelector] = useState(false);

  // Modal / Form States
  const [isEditBudgetOpen, setIsEditBudgetOpen] = useState(false);
  const [updatedBudgetAmount, setUpdatedBudgetAmount] = useState('');
  
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Venue');
  const [expenseDate, setExpenseDate] = useState('');
  const [chartMode, setChartMode] = useState('allocated'); // 'allocated' or 'spent'

  // Fallback default details if API returns empty
  const fallbackEvent = {
    id: 9999,
    title: 'Rahul & Priya Wedding',
    date: '2024-12-25',
    location: 'The Leela Palace, Udaipur',
    budget: 1500000,
    event_type: 'Wedding'
  };

  const fallbackBudget = {
    total_budget: 1500000,
    expenses: 720000,
    remaining_budget: 780000,
    committed: 240000
  };

  const fallbackExpenses = [
    { id: 101, title: 'Leela Palace - Venue Booking', amount: 200000, category: 'Venue', date: '2024-05-25' },
    { id: 102, title: 'Catering Advance Payment', amount: 100000, category: 'Catering', date: '2024-05-22' },
    { id: 103, title: 'Decorator Advance', amount: 50000, category: 'Decoration', date: '2024-05-20' }
  ];

  // Fetch events catalog
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

  // Fetch budget for selected event
  const fetchBudgetDetails = async (eventId) => {
    if (!eventId) {
      setBudgetSummary(null);
      setExpenses([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await authFetch(`/budget/${eventId}`);
      if (res.ok) {
        const data = await res.json();
        // Calculate committed amount
        const total = parseFloat(data.budget?.total_budget || 0);
        const committedVal = total * 0.16; // mock committed calculation
        setBudgetSummary({
          total_budget: total,
          expenses: parseFloat(data.budget?.expenses || 0),
          remaining_budget: parseFloat(data.budget?.remaining_budget || 0),
          committed: committedVal
        });
        setExpenses(data.expenses || []);
      } else {
        setBudgetSummary(null);
        setExpenses([]);
      }
    } catch (err) {
      setBudgetSummary(null);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      fetchBudgetDetails(selectedEvent.id);
      setUpdatedBudgetAmount(selectedEvent.budget || 1500000);
    }
  }, [selectedEvent]);

  // Update Budget Limit API
  const handleUpdateBudgetSubmit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(updatedBudgetAmount);
    if (isNaN(amt) || amt <= 0) {
      showToast('Please enter a valid budget amount', 'error');
      return;
    }

    if (selectedEvent.id === 9999) {
      // Mock update local state
      setBudgetSummary(prev => {
        const remaining = amt - prev.expenses;
        return {
          ...prev,
          total_budget: amt,
          remaining_budget: remaining
        };
      });
      showToast('Mock event budget updated successfully!', 'success');
      setIsEditBudgetOpen(false);
      return;
    }

    try {
      const res = await authFetch(`/update-event/${selectedEvent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedEvent.title,
          event_type: selectedEvent.event_type,
          date: selectedEvent.date,
          location: selectedEvent.location,
          guest_count: selectedEvent.guest_count,
          status: selectedEvent.status,
          budget: amt
        })
      });
      if (res.ok) {
        showToast('Budget updated successfully!', 'success');
        setSelectedEvent(prev => ({ ...prev, budget: amt }));
        setIsEditBudgetOpen(false);
        fetchBudgetDetails(selectedEvent.id);
      } else {
        const data = await res.json();
        showToast(data.message || 'Error updating budget limit', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Add Expense Transaction API
  const handleAddExpenseSubmit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(expenseAmount);
    if (!expenseTitle || isNaN(amt) || amt <= 0 || !expenseDate) {
      showToast('Please fill in all transaction fields correctly', 'error');
      return;
    }

    if (selectedEvent.id === 9999) {
      // Mock add local expense
      const mockExpenseObj = {
        id: Date.now(),
        title: expenseTitle,
        amount: amt,
        category: expenseCategory,
        date: expenseDate
      };
      setExpenses(prev => [mockExpenseObj, ...prev]);
      setBudgetSummary(prev => {
        const newSpent = prev.expenses + amt;
        const remaining = prev.total_budget - newSpent;
        return {
          ...prev,
          expenses: newSpent,
          remaining_budget: remaining
        };
      });
      showToast('Mock expense logged successfully!', 'success');
      setIsAddExpenseOpen(false);
      // Reset form
      setExpenseTitle('');
      setExpenseAmount('');
      setExpenseDate('');
      return;
    }

    try {
      const res = await authFetch('/expense/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          title: expenseTitle,
          amount: amt,
          category: expenseCategory,
          date: expenseDate
        })
      });
      if (res.ok) {
        showToast('Transaction added to ledger successfully!', 'success');
        setIsAddExpenseOpen(false);
        // Reset form
        setExpenseTitle('');
        setExpenseAmount('');
        setExpenseDate('');
        fetchBudgetDetails(selectedEvent.id);
      } else {
        const data = await res.json();
        showToast(data.message || 'Failed to register expense', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Delete Expense API
  const handleDeleteExpense = async (expenseId, expenseName) => {
    if (!window.confirm(`Are you sure you want to delete expense "${expenseName}"?`)) return;

    if (selectedEvent.id === 9999) {
      // Mock delete local expense
      const ex = expenses.find(e => e.id === expenseId);
      if (ex) {
        setExpenses(prev => prev.filter(e => e.id !== expenseId));
        setBudgetSummary(prev => {
          const newSpent = Math.max(0, prev.expenses - ex.amount);
          const remaining = prev.total_budget - newSpent;
          return {
            ...prev,
            expenses: newSpent,
            remaining_budget: remaining
          };
        });
      }
      showToast('Mock expense transaction deleted', 'info');
      return;
    }

    try {
      const res = await authFetch(`/expense/${expenseId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Transaction deleted successfully!', 'success');
        fetchBudgetDetails(selectedEvent.id);
      } else {
        const data = await res.json();
        showToast(data.message || 'Failed to delete transaction', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Math Helper Formatters
  const formatRupee = (num) => {
    return '₹ ' + Math.round(num).toLocaleString('en-IN');
  };

  const getPercentage = (part, total) => {
    if (!total) return 0;
    return Math.round((part / total) * 100);
  };

  // Default Categories structure based on template image ratios
  const categoriesList = [
    { name: 'Venue', percent: 0.40, color: '#5a2bd4', committedRatio: 0.40 / 0.16 },
    { name: 'Catering', percent: 0.30, color: '#10b981', committedRatio: 0.30 / 0.16 },
    { name: 'Decoration', percent: 0.15, color: '#f59e0b', committedRatio: 0.15 / 0.16 },
    { name: 'Entertainment', percent: 0.10, color: '#6366f1', committedRatio: 0.10 / 0.16 },
    { name: 'Miscellaneous', percent: 0.05, color: '#f43f5e', committedRatio: 0.05 / 0.16 }
  ];

  // Dynamic calculations per category based on current selected event's budgets
  const activeTotalBudget = budgetSummary?.total_budget || 0;
  const activeTotalSpent = budgetSummary?.expenses || 0;
  const activeCommittedSum = budgetSummary?.committed || 0;

  const categoriesData = categoriesList.map(cat => {
    const allocatedBudget = activeTotalBudget * cat.percent;
    // Calculate spent dynamically from expenses list for this category
    const actualSpent = expenses
      .filter(exp => exp.category.toLowerCase() === cat.name.toLowerCase() || 
                    (cat.name === 'Decoration' && exp.category.toLowerCase() === 'decor'))
      .reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

    // If actualSpent is 0 and it's the fallback event, match image values
    let displaySpent = actualSpent;
    if (actualSpent === 0 && selectedEvent?.id === 9999) {
      if (cat.name === 'Venue') displaySpent = 240000;
      else if (cat.name === 'Catering') displaySpent = 230000;
      else if (cat.name === 'Decoration') displaySpent = 160000;
      else if (cat.name === 'Entertainment') displaySpent = 80000;
      else if (cat.name === 'Miscellaneous') displaySpent = 50000;
    }

    // Committed: mock proportional calculation matching image
    let displayCommitted = allocatedBudget * 0.16;
    if (selectedEvent?.id === 9999) {
      if (cat.name === 'Venue') displayCommitted = 100000;
      else if (cat.name === 'Catering') displayCommitted = 80000;
      else if (cat.name === 'Decoration') displayCommitted = 40000;
      else if (cat.name === 'Entertainment') displayCommitted = 20000;
      else if (cat.name === 'Miscellaneous') displayCommitted = 10000;
    }

    const remaining = allocatedBudget - displaySpent;
    const progressPercent = getPercentage(displaySpent, allocatedBudget);
    const status = remaining >= 0 ? 'On Track' : 'Over Budget';

    return {
      name: cat.name,
      color: cat.color,
      budget: allocatedBudget,
      spent: displaySpent,
      committed: displayCommitted,
      remaining: remaining,
      progress: progressPercent,
      status: status
    };
  });

  // Dynamic slices calculation for Donut Chart
  const donutCircumference = 2 * Math.PI * 40; // ~251.327
  const donutChartData = categoriesData.map(cat => ({
    name: cat.name,
    color: cat.color,
    value: chartMode === 'allocated' ? cat.budget : cat.spent
  }));
  const donutChartTotal = donutChartData.reduce((sum, d) => sum + d.value, 0);

  let cumulativeOffset = 0;
  const donutSlices = donutChartData.map(slice => {
    const ratio = donutChartTotal > 0 ? slice.value / donutChartTotal : 0;
    const dashLength = ratio * donutCircumference;
    const strokeDasharray = `${dashLength.toFixed(2)} ${donutCircumference.toFixed(2)}`;
    const strokeDashoffset = `-${cumulativeOffset.toFixed(2)}`;
    cumulativeOffset += dashLength;
    return {
      ...slice,
      strokeDasharray,
      strokeDashoffset,
      ratio
    };
  });

  const overBudgetCount = categoriesData.filter(c => c.status === 'Over Budget').length;
  const underBudgetCount = categoriesData.filter(c => c.status === 'On Track').length;

  if (loading && events.length === 0) {
    return (
      <div className="flex flex-col gap-6 max-w-7xl mx-auto">
        <div className="h-8 bg-white/5 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-white/5 rounded-2xl animate-pulse"></div>
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
            Budget Planner
          </h1>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            Plan, manage and track your event budget in one place.
          </p>
        </div>
        <div className="glass-panel flex flex-col items-center justify-center py-20 text-center max-w-xl mx-auto gap-4 font-bold border border-white/5 rounded-2xl p-6 w-full">
          <div className="w-16 h-16 rounded-full bg-[#5a2bd4]/10 border border-[#5a2bd4]/20 flex items-center justify-center text-[#5a2bd4] dark:text-indigo-400">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-extrabold text-white">No Events Found</h2>
          <p className="text-xs text-gray-500 max-w-sm leading-relaxed font-medium">
            You don't have any events created yet. To use the Budget Planner, you must first create an event or generate one using our AI Planner.
          </p>
          <div className="flex items-center gap-3.5 mt-2">
            <Link
              href="/ai"
              className="px-4 py-2.5 rounded-xl bg-[#5a2bd4] hover:bg-[#4c24b5] always-white text-xs font-bold shadow-lg shadow-indigo-500/10 transition-all cursor-pointer"
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
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white dark:text-white">
            Budget Planner
          </h1>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            Plan, manage and track your event budget in one place.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
          <button
            onClick={() => {
              showToast('Exporting budget statement to CSV...', 'success');
              // Download CSV mock trigger
            }}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-gray-300 dark:hover:text-white flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
          <button
            onClick={() => setIsAddExpenseOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#5a2bd4] hover:bg-[#4c24b5] always-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-500/10 transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create New Expense
          </button>
        </div>
      </div>

      {/* 2. Selector & Stats Header Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch relative z-30">
        {/* Left Side: Select Event Dropdown Card */}
        <div className="lg:col-span-1 glass-panel p-4 rounded-2xl border border-white/5 relative z-40 flex flex-col justify-center">
          <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-2">Select Event</span>
          <div className="relative">
            <button
              onClick={() => setShowEventSelector(!showEventSelector)}
              className="w-full flex items-center gap-3 p-2 bg-white/2 border border-white/10 rounded-xl hover:border-indigo-500/35 transition-all text-left cursor-pointer"
            >
              {selectedEvent && (
                <>
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-[#5a2bd4]/20 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-white dark:text-white truncate leading-tight">
                      {selectedEvent.title}
                    </span>
                    <span className="text-[9px] text-gray-500 truncate mt-1">
                      {new Date(selectedEvent.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} • {selectedEvent.location.split(',')[0]}
                    </span>
                  </div>
                </>
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
                      <span className="text-[9px] text-gray-500 dark:text-gray-400">{new Date(ev.date).toLocaleDateString()}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: 4 Stats Cards */}
        <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 font-medium">
          {/* Card 1: Total Budget */}
          <div className="glass-card p-4 rounded-2xl flex items-center justify-between border border-white/5 shadow-sm">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Budget</span>
              <span className="text-xl font-extrabold text-white dark:text-white">{formatRupee(activeTotalBudget)}</span>
              <button
                onClick={() => setIsEditBudgetOpen(true)}
                className="text-[9px] text-[#5a2bd4] dark:text-indigo-400 font-extrabold flex items-center gap-1 hover:underline cursor-pointer"
              >
                Edit Budget <Edit className="w-3 h-3" />
              </button>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[#5a2bd4] dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2: Total Spent */}
          <div className="glass-card p-4 rounded-2xl flex items-center justify-between border border-white/5 shadow-sm">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Spent</span>
              <span className="text-xl font-extrabold text-white dark:text-white">{formatRupee(activeTotalSpent)}</span>
              <span className="text-[9px] text-emerald-500 font-bold">
                {getPercentage(activeTotalSpent, activeTotalBudget)}% of Total Budget
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: Remaining Budget */}
          <div className="glass-card p-4 rounded-2xl flex items-center justify-between border border-white/5 shadow-sm">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Remaining Budget</span>
              <span className={`text-xl font-extrabold ${activeTotalBudget - activeTotalSpent >= 0 ? 'text-white dark:text-white' : 'text-rose-500'}`}>
                {formatRupee(activeTotalBudget - activeTotalSpent)}
              </span>
              <span className="text-[9px] text-[#f59e0b] font-bold">
                {getPercentage(activeTotalBudget - activeTotalSpent, activeTotalBudget)}% of Total Budget
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#f59e0b] flex items-center justify-center shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
          </div>

          {/* Card 4: Committed */}
          <div className="glass-card p-4 rounded-2xl flex items-center justify-between border border-white/5 shadow-sm">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Committed</span>
              <span className="text-xl font-extrabold text-white dark:text-white">{formatRupee(activeCommittedSum)}</span>
              <span className="text-[9px] text-indigo-500 font-bold">
                {getPercentage(activeCommittedSum, activeTotalBudget)}% of Total Budget
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Mid Grid Layout (Donut Chart & Comparison Bar Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Card: Budget Breakdown Donut Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col gap-5">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <h3 className="text-xs font-bold text-gray-200 dark:text-white uppercase tracking-wider">
              Budget Breakdown
            </h3>
            <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-0.5 text-[9px] font-bold uppercase shrink-0">
              <button
                type="button"
                onClick={() => setChartMode('allocated')}
                className={`px-2.5 py-0.5 rounded-md cursor-pointer transition-all ${chartMode === 'allocated' ? 'bg-[#5a2bd4] text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Allocated
              </button>
              <button
                type="button"
                onClick={() => setChartMode('spent')}
                className={`px-2.5 py-0.5 rounded-md cursor-pointer transition-all ${chartMode === 'spent' ? 'bg-[#5a2bd4] text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Spent
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-2">
            {/* SVG Donut Chart */}
            <div className="relative w-32 h-32 shrink-0">
              <svg viewBox="0 0 100 100" className="w-32 h-32 transform -rotate-90">
                {/* Fallback circle background */}
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                {donutChartTotal > 0 && donutSlices.map((slice, idx) => (
                  <circle
                    key={idx}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke={slice.color}
                    strokeWidth="10"
                    strokeDasharray={slice.strokeDasharray}
                    strokeDashoffset={slice.strokeDashoffset}
                    className="transition-all duration-500 ease-in-out"
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-extrabold text-white dark:text-white leading-none">
                  {formatRupee(chartMode === 'allocated' ? activeTotalBudget : activeTotalSpent)}
                </span>
                <span className="text-[8px] text-gray-500 font-bold uppercase mt-1">
                  {chartMode === 'allocated' ? 'Total Budget' : 'Total Spent'}
                </span>
              </div>
            </div>

            {/* Detailed list legend */}
            <div className="flex flex-col gap-2 w-full text-[10px] font-bold text-gray-300">
              {categoriesData.map(cat => {
                const currentVal = chartMode === 'allocated' ? cat.budget : cat.spent;
                const currentTotal = chartMode === 'allocated' ? activeTotalBudget : activeTotalSpent;
                const percentage = getPercentage(currentVal, currentTotal);

                return (
                  <div key={cat.name} className="flex justify-between items-center border-b border-white/5 pb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }}></span>
                      <span>{cat.name} ({percentage}%)</span>
                    </div>
                    <span className="font-outfit text-gray-400">{formatRupee(currentVal)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom count pills */}
          <div className="grid grid-cols-4 gap-3 text-center text-[10px] font-bold border-t border-white/5 pt-4">
            <div className="bg-white/2 border border-white/5 rounded-xl p-2.5">
              <span className="text-[8px] text-gray-500 uppercase">Categories</span>
              <p className="text-sm text-white mt-0.5">5</p>
            </div>
            <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-2.5">
              <span className="text-[8px] text-rose-500 uppercase">Over Budget</span>
              <p className="text-sm text-rose-400 mt-0.5">{overBudgetCount}</p>
            </div>
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-2.5">
              <span className="text-[8px] text-emerald-500 uppercase">Under Budget</span>
              <p className="text-sm text-emerald-400 mt-0.5">{underBudgetCount}</p>
            </div>
            <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-2.5">
              <span className="text-[8px] text-indigo-500 uppercase">On Track</span>
              <p className="text-sm text-indigo-400 mt-0.5">{underBudgetCount}</p>
            </div>
          </div>
        </div>

        {/* Right Card: Budget vs Actual Bar Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col gap-5">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <h3 className="text-xs font-bold text-gray-200 dark:text-white uppercase tracking-wider">
              Budget vs Actual
            </h3>
            <span className="text-[9px] text-gray-500 border border-white/10 rounded-lg px-2 py-0.5 font-bold uppercase">This Event</span>
          </div>

          {/* Chart bar graph */}
          <div className="flex flex-col gap-4 py-1">
            <div className="flex justify-end gap-4 text-[9px] font-bold text-gray-500 px-2">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-[#5a2bd4]"></span> Budget</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-[#10b981]"></span> Actual Spent</span>
            </div>

            {/* Visual Bars Comparison List */}
            <div className="flex flex-col gap-3 font-bold text-[10px]">
              {categoriesData.map(cat => {
                // Ratios for width limit (e.g. max width 75% for max budgeted)
                const maxAllocated = activeTotalBudget * 0.40;
                const budgetWidth = Math.max(5, Math.min(100, (cat.budget / maxAllocated) * 100)) * 0.7;
                const spentWidth = Math.max(5, Math.min(100, (cat.spent / maxAllocated) * 100)) * 0.7;

                return (
                  <div key={cat.name} className="flex flex-col sm:flex-row sm:items-center gap-2 border-b border-white/3 pb-2 last:border-0 last:pb-0">
                    <span className="w-24 text-gray-300 dark:text-gray-200 truncate shrink-0">{cat.name}</span>
                    <div className="flex-1 flex flex-col gap-1.5">
                      {/* Budget Bar (Purple) */}
                      <div className="flex items-center gap-2">
                        <div className="h-2 rounded-full bg-[#5a2bd4]/20 overflow-hidden flex-1 max-w-[200px]">
                          <div className="h-full bg-[#5a2bd4] rounded-full" style={{ width: `${budgetWidth}%` }}></div>
                        </div>
                        <span className="text-[9px] text-gray-500 w-12 text-right">{formatRupee(cat.budget)}</span>
                      </div>
                      {/* Actual Spent Bar (Green) */}
                      <div className="flex items-center gap-2">
                        <div className="h-2 rounded-full bg-[#10b981]/20 overflow-hidden flex-1 max-w-[200px]">
                          <div className="h-full bg-[#10b981] rounded-full" style={{ width: `${spentWidth}%` }}></div>
                        </div>
                        <span className={`text-[9px] w-12 text-right ${cat.spent > cat.budget ? 'text-rose-500 font-extrabold' : 'text-gray-400'}`}>
                          {formatRupee(cat.spent)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Grid Layout (Budget Ledger Details table & Summary/Transactions) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column (col-span-2): Budget Category Details table */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/5 flex flex-col gap-4">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <h3 className="text-xs font-bold text-gray-200 dark:text-white uppercase tracking-wider">
              Budget Category Details
            </h3>
            <button
              onClick={() => setIsAddExpenseOpen(true)}
              className="text-[10px] text-[#5a2bd4] dark:text-indigo-400 font-bold hover:underline cursor-pointer"
            >
              Add Ledger Item
            </button>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs border-collapse min-w-[550px]">
              <thead>
                <tr className="border-b border-white/5 text-gray-500 font-bold uppercase tracking-wider bg-white/[0.005]">
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-2">Budget (₹)</th>
                  <th className="py-3 px-2">Spent (₹)</th>
                  <th className="py-3 px-2">Committed (₹)</th>
                  <th className="py-3 px-2">Remaining (₹)</th>
                  <th className="py-3 px-2">Progress</th>
                  <th className="py-3 px-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/2 text-gray-300 font-semibold font-outfit">
                {categoriesData.map(cat => (
                  <tr key={cat.name} className="hover:bg-white/[0.01] transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }}></span>
                        <span className="font-sans font-bold text-gray-200 dark:text-white">{cat.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 font-bold text-gray-300">{Math.round(cat.budget).toLocaleString()}</td>
                    <td className="py-3 px-2 text-[#f59e0b] font-bold">{Math.round(cat.spent).toLocaleString()}</td>
                    <td className="py-3 px-2 text-indigo-400 font-bold">{Math.round(cat.committed).toLocaleString()}</td>
                    <td className={`py-3 px-2 font-bold ${cat.remaining >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {cat.remaining >= 0 ? Math.round(cat.remaining).toLocaleString() : `-${Math.round(Math.abs(cat.remaining)).toLocaleString()}`}
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 bg-white/5 border border-white/5 rounded-full overflow-hidden shrink-0">
                          <div
                            className="h-full rounded-full"
                            style={{
                              backgroundColor: cat.color,
                              width: `${Math.min(100, cat.progress)}%`
                            }}
                          ></div>
                        </div>
                        <span className="text-[9px] text-gray-500 font-bold">{cat.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase border ${
                        cat.status === 'On Track'
                          ? 'bg-emerald-500/5 border-emerald-500/25 text-emerald-500'
                          : 'bg-rose-500/5 border-rose-500/25 text-rose-500 animate-pulse'
                      }`}>
                        {cat.status === 'On Track' ? 'On Track' : 'Over Limit'}
                      </span>
                    </td>
                  </tr>
                ))}
                {/* Total Row */}
                <tr className="font-bold text-white bg-white/[0.01] border-t border-white/10 font-sans">
                  <td className="py-3 px-3">Total</td>
                  <td className="py-3 px-2 font-outfit">{Math.round(activeTotalBudget).toLocaleString()}</td>
                  <td className="py-3 px-2 text-[#f59e0b] font-outfit">{Math.round(activeTotalSpent).toLocaleString()}</td>
                  <td className="py-3 px-2 text-indigo-400 font-outfit">{Math.round(activeCommittedSum).toLocaleString()}</td>
                  <td className={`py-3 px-2 font-outfit ${activeTotalBudget - activeTotalSpent >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {(activeTotalBudget - activeTotalSpent).toLocaleString()}
                  </td>
                  <td className="py-3 px-2 font-outfit">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1.5 bg-white/5 border border-white/5 rounded-full overflow-hidden shrink-0">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{
                            width: `${Math.min(100, getPercentage(activeTotalSpent, activeTotalBudget))}%`
                          }}
                        ></div>
                      </div>
                      <span className="text-[9px] text-gray-500 font-bold">{getPercentage(activeTotalSpent, activeTotalBudget)}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase border ${
                      activeTotalBudget - activeTotalSpent >= 0
                        ? 'bg-emerald-500/5 border-emerald-500/25 text-emerald-500'
                        : 'bg-rose-500/5 border-rose-500/25 text-rose-500'
                    }`}>
                      {activeTotalBudget - activeTotalSpent >= 0 ? 'On Track' : 'Over Budget'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-white/2 border border-white/5 rounded-xl flex items-center gap-2.5 mt-2 text-[10px] text-gray-500 leading-snug">
            <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Tip: Keep tracking your expenses and update payments regularly to stay within budget.</span>
          </div>
        </div>

        {/* Right Column: Budget Summary & Recent Transactions list */}
        <div className="flex flex-col gap-8">
          {/* Budget Summary Card */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col gap-4">
            <h3 className="text-xs font-bold text-gray-200 dark:text-white uppercase tracking-wider pb-2 border-b border-white/5">
              Budget Summary
            </h3>

            <div className="flex flex-col gap-3 font-semibold text-[10.5px] text-gray-300">
              <div className="flex justify-between items-center pb-2 border-b border-white/3">
                <span className="text-gray-500">Total Budget:</span>
                <span className="font-outfit text-white font-bold">{formatRupee(activeTotalBudget)}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-white/3">
                <span className="text-gray-500">Total Spent:</span>
                <span className="font-outfit text-white font-bold">{formatRupee(activeTotalSpent)} ({getPercentage(activeTotalSpent, activeTotalBudget)}%)</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-white/3">
                <span className="text-gray-500">Total Committed:</span>
                <span className="font-outfit text-white font-bold">{formatRupee(activeCommittedSum)} ({getPercentage(activeCommittedSum, activeTotalBudget)}%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Remaining Budget:</span>
                <span className="font-outfit text-white font-bold">{formatRupee(activeTotalBudget - activeTotalSpent)} ({getPercentage(activeTotalBudget - activeTotalSpent, activeTotalBudget)}%)</span>
              </div>
            </div>

            <button
              onClick={() => showToast('Redirecting to full budget reports analytics...', 'info')}
              className="text-[10px] text-[#5a2bd4] dark:text-indigo-400 font-extrabold hover:underline text-center w-full mt-2 inline-flex items-center justify-center gap-1 cursor-pointer"
            >
              View Full Report <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Recent Transactions Card */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="text-xs font-bold text-gray-200 dark:text-white uppercase tracking-wider">
                Recent Transactions
              </h3>
              <button
                onClick={() => setIsAddExpenseOpen(true)}
                className="text-[9px] text-[#5a2bd4] dark:text-indigo-400 font-extrabold hover:underline"
              >
                Log New
              </button>
            </div>

            <div className="flex flex-col gap-3.5 font-bold text-[10px]">
              {expenses.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-6">No transactions logged yet.</p>
              ) : (
                expenses.slice(0, 5).map(exp => (
                  <div key={exp.id} className="flex items-center justify-between gap-4 border-b border-white/3 pb-2.5 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-gray-200 dark:text-white leading-snug truncate max-w-[130px]">{exp.title}</span>
                        <span className="text-[9px] text-gray-500">{new Date(exp.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-outfit text-rose-500 font-extrabold">- {formatRupee(exp.amount)}</span>
                      <button
                        onClick={() => handleDeleteExpense(exp.id, exp.title)}
                        className="p-1 rounded bg-white/5 text-gray-500 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete Transaction"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: Edit Event Budget Limit */}
      {isEditBudgetOpen && (
        <div className="fixed inset-0 bg-[#07080a]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-sm rounded-2xl border border-white/10 shadow-2xl p-6 flex flex-col gap-6 animate-scale-up">
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Receipt className="w-4.5 h-4.5 text-indigo-400" />
                Edit Allocated Budget Limit
              </h3>
              <button
                onClick={() => setIsEditBudgetOpen(false)}
                className="text-gray-400 hover:text-white font-extrabold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateBudgetSubmit} className="flex flex-col gap-4 font-bold">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase">Budget Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={updatedBudgetAmount}
                  onChange={(e) => setUpdatedBudgetAmount(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsEditBudgetOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/5 bg-white/3 hover:bg-white/7 transition-all text-xs font-bold text-gray-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#5a2bd4] hover:bg-[#4c24b5] always-white text-xs font-bold transition-all shadow-md shadow-indigo-600/15 cursor-pointer"
                >
                  Save Limit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Log New Expense Transaction */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 bg-[#07080a]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-white/10 shadow-2xl p-6 flex flex-col gap-6 animate-scale-up">
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4.5 h-4.5 text-indigo-400" />
                Add Ledger Transaction
              </h3>
              <button
                onClick={() => setIsAddExpenseOpen(false)}
                className="text-gray-400 hover:text-white font-extrabold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddExpenseSubmit} className="flex flex-col gap-4 font-bold">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase">Transaction Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Venue Advance Deposit"
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Amount Spent (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 50000"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Date of payment</label>
                  <input
                    type="date"
                    required
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-gray-300 focus:outline-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase">Category Type</label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-gray-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="Venue" className="bg-[#151c2c]">Venue</option>
                  <option value="Catering" className="bg-[#151c2c]">Catering</option>
                  <option value="Decoration" className="bg-[#151c2c]">Decoration</option>
                  <option value="Entertainment" className="bg-[#151c2c]">Entertainment</option>
                  <option value="Miscellaneous" className="bg-[#151c2c]">Miscellaneous</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsAddExpenseOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/5 bg-white/3 hover:bg-white/7 transition-all text-xs font-bold text-gray-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#5a2bd4] hover:bg-[#4c24b5] always-white text-xs font-bold transition-all shadow-md shadow-indigo-600/15 cursor-pointer"
                >
                  Log Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
