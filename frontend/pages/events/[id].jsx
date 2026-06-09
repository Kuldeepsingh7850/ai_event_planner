import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import {
  CalendarDays,
  MapPin,
  Users,
  Receipt,
  Sparkles,
  CheckSquare,
  PhoneCall,
  Info,
  Clock,
  ArrowLeft,
  Plus,
  Trash2,
  Trash,
  Check,
  X,
  FileText,
  Edit,
  Download,
  Share2,
  AlertTriangle,
  ChefHat,
  Palette,
  File,
  Send,
  Loader2,
  ChevronRight,
  Building,
  Utensils
} from 'lucide-react';
import Link from 'next/link';

// Helper function to format currency as Rupees
const formatRupee = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
};

const renderItemSafely = (item) => {
  if (!item) return '';
  if (typeof item === 'object') {
    if (item.name && (item.description || item.desc)) {
      return (
        <>
          <strong className="text-gray-200">{item.name}:</strong>{' '}
          {item.description || item.desc}
        </>
      );
    }
    return item.description || item.desc || item.name || JSON.stringify(item);
  }
  return item;
};

const assigneeAvatars = {
  'Rahul Sharma': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&fit=crop&auto=format',
  'Priya Patel': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&fit=crop&auto=format',
  'Vikram Singh': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&fit=crop&auto=format',
  'Anjali Mehta': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&fit=crop&auto=format',
  'Rohan Mehta': 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=80&fit=crop&auto=format',
  'Sneha Iyer': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&fit=crop&auto=format'
};

// Parse custom task parameters out of db title string
const parseTask = (task) => {
  if (!task || !task.title) return task;
  const parts = task.title.split(' || ');
  const displayName = parts[0];
  const assigneeName = parts[1] || 'Self';
  const priority = parts[2] || 'Medium';
  const visualStatus = parts[3] || 'To Do';

  let finalStatus = task.status === 'completed' ? 'Completed' : visualStatus;

  return {
    ...task,
    displayName,
    assigneeName,
    priority,
    visualStatus: finalStatus
  };
};

const isTimelineTask = (taskTitle) => {
  return /^\d{1,2}:\d{2}\s*(AM|PM)/i.test(taskTitle || '');
};

const getTimelineMinutes = (title) => {
  const match = title.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return 9999;
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const ampm = match[3].toUpperCase();
  if (ampm === 'PM' && hours < 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
};


const parsePayment = (exp, idx) => {
  if (!exp || !exp.title) return {
    id: exp?.id,
    invoiceId: `INV-${String(idx + 1).padStart(3, '0')}`,
    description: exp?.title || '',
    amount: exp?.amount || 0,
    date: exp?.date ? exp.date.split('T')[0] : 'N/A',
    status: 'Paid'
  };

  const parts = exp.title.split(' || ');
  if (parts.length < 2) {
    return {
      id: exp.id,
      invoiceId: `INV-${String(idx + 1).padStart(3, '0')}`,
      description: exp.title,
      amount: exp.amount,
      date: exp.date ? exp.date.split('T')[0] : 'N/A',
      status: 'Paid'
    };
  }

  const description = parts[0];
  const invoiceId = parts[1] || `INV-${String(idx + 1).padStart(3, '0')}`;
  const status = parts[2] || 'Paid';

  return {
    id: exp.id,
    invoiceId,
    description,
    amount: exp.amount,
    date: exp.date ? exp.date.split('T')[0] : 'N/A',
    status
  };
};

const getVenueImage = (venueName) => {
  if (!venueName) return '/leela_palace.jpg';
  const nameLower = venueName.toLowerCase();
  if (nameLower.includes('leela')) return '/leela_palace.jpg';
  if (nameLower.includes('fateh')) return '/monsoon_palace.jpg';
  if (nameLower.includes('radisson')) return '/hero_udaipur_3.jpg';
  if (nameLower.includes('bhanwar')) return '/hero_udaipur_1.jpg';
  if (nameLower.includes('ramada')) return '/shiv_niwas.jpg';
  if (nameLower.includes('bijolai')) return '/jag_mandir.jpg';
  if (nameLower.includes('hilltop')) return '/hero_udaipur_2.jpg';
  if (nameLower.includes('aravali')) return 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80';
  if (nameLower.includes('oberoi') || nameLower.includes('udaivilas')) return '/oberoi_udaivilas.jpg';
  if (nameLower.includes('taj') || nameLower.includes('lake palace')) return '/taj_lake_palace.jpg';
  return '/leela_palace.jpg';
};

export default function EventDetailHub() {
  const router = useRouter();
  const { id } = router.query;
  const { authFetch, user } = useAuth();
  const { fetchNotifications, showToast } = useNotifications();
  const { theme } = useTheme();

  // Active Tab
  const [activeTab, setActiveTab] = useState('overview');

  // Loading states
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Core Event Details
  const [event, setEvent] = useState(null);
  
  // Edit Event Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('18:00');
  const [editLocation, setEditLocation] = useState('');
  const [editBudget, setEditBudget] = useState('');
  const [editGuests, setEditGuests] = useState('');
  const [editType, setEditType] = useState('');
  const [editTheme, setEditTheme] = useState('Royal / Traditional');

  // Delete Confirm Modal State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Budget Tracker States
  const [budget, setBudget] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expCategory, setExpCategory] = useState('Catering');
  const [expDate, setExpDate] = useState('');

  // Payments / Transactions States
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [payInvoiceId, setPayInvoiceId] = useState('');
  const [payDescription, setPayDescription] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payDate, setPayDate] = useState('');
  const [payStatus, setPayStatus] = useState('Paid');

  // AI Suggestions Modal States
  const [showAISuggestionsModal, setShowAISuggestionsModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);

  const handleTriggerAISuggestions = () => {
    setShowAISuggestionsModal(true);
    setAiLoading(true);
    
    // Simulate AI model generation delay
    setTimeout(() => {
      if (!event) {
        setAiSuggestions({
          checklist: ["Review guest count and budget.", "Choose a theme vibe.", "Browse local vendors."],
          decor: "Standard decor based on event scale.",
          vendors: "Contact general event decorators and venue coordinators.",
          budgetTip: "Set aside 15% of the total budget for unexpected costs."
        });
        setAiLoading(false);
        return;
      }
      
      const type = event.event_type || 'Event';
      const guest = event.guest_count || 100;
      const budgetVal = event.budget || 50000;
      const location = event.location || 'Udaipur';
      const themeVal = event.theme || 'Traditional';

      let checklist = [];
      let decor = "";
      let vendors = "";
      let budgetTip = "";

      if (type.toLowerCase().includes('wedding') || type.toLowerCase().includes('shaadi') || type.toLowerCase().includes('marriage')) {
        checklist = [
          `Coordinate mandap decorations matching "${themeVal}".`,
          `Hire a professional heritage photographer familiar with "${location}" locations.`,
          `Finalize dynamic Rajasthani welcome folk dancers and buffet setup.`,
          `Verify guest count (${guest} guests) with the venue seating plan.`,
          `Send digital wedding e-invitations with RSVP deadlines.`
        ];
        decor = `Elegant combination of marigold hangings, vintage drapes, royal brass lanterns, and palacemandap floral setup.`;
        vendors = `Delicious Bites Catering (specializing in Mewari buffet) and Epic Moments Photography (wedding specialist).`;
        budgetTip = `For a budget of ${formatRupee(budgetVal)}, allocate around 40% for venue/catering, 25% for wedding decor, 15% for photography, and keep 10% as contingency backup.`;
      } else if (type.toLowerCase().includes('birthday') || type.toLowerCase().includes('party')) {
        checklist = [
          `Book DJ and sound systems for a dance-floor setup.`,
          `Order a customized themed cake and prepare dessert table.`,
          `Setup colorful photo booth backdrop with matching props.`,
          `Prepare child-friendly seating and game coordinator schedule.`,
          `Create a playlist with guest requests.`
        ];
        decor = `Vibrant balloon arches, neon LED name boards, themed table centerpieces, and warm fairy light backdrops.`;
        vendors = `Ananta Resort decorator team, local dessert bakers, and sound system vendors.`;
        budgetTip = `Since you have a budget of ${formatRupee(budgetVal)}, focus 60% on food/drinks and sound, 20% on visual decorations, and 20% on birthday activities/gifts.`;
      } else if (type.toLowerCase().includes('corporate') || type.toLowerCase().includes('conference') || type.toLowerCase().includes('college') || type.toLowerCase().includes('farewell')) {
        checklist = [
          `Confirm Audio/Visual setup (projectors, microphones, podium).`,
          `Prepare custom badges, register notebooks and welcoming booths.`,
          `Design customized banners and certificates for guests.`,
          `Schedule tea/coffee breaks and lunch buffet timings.`,
          `Draft event host speech and timeline slideshow slides.`
        ];
        decor = `Professional minimalism with company/college banners, corporate blue theme accents, stage podium spotlights, and clean presentation displays.`;
        vendors = `Radisson Blu AV team, local corporate printers, and professional high-speed stage photographers.`;
        budgetTip = `With ${formatRupee(budgetVal)} budget, prioritize 50% for high-quality food/AV rentals, 30% for marketing/banners/souvenirs, and 20% on guest hospitality.`;
      } else {
        checklist = [
          `Setup clean seating arrangements for ${guest} guests at ${location}.`,
          `Determine event flow checklist timeline milestones.`,
          `Coordinate with decorators for traditional floral decor.`,
          `Finalize menu catering choice and beverage service.`,
          `Double check the AV sound system setup.`
        ];
        decor = `Contemporary setups with colorful drapes, warm yellow spotlight fills, and minimalist flower accents.`;
        vendors = `Local general coordinators, sound equipment hire, and professional buffet caterers.`;
        budgetTip = `Optimize budget allocation: 50% on food & drinks, 20% on venue, 20% on theme decor/AV, and 10% on miscellaneous items.`;
      }

      setAiSuggestions({ checklist, decor, vendors, budgetTip });
      setAiLoading(false);
    }, 850);
  };

  // Set default payDate and payInvoiceId when opening modal
  useEffect(() => {
    if (showAddPaymentModal) {
      setPayDate(new Date().toISOString().split('T')[0]);
      // Count existing expenses to generate invoice ID
      const nextInvNum = expenses.length + 1;
      setPayInvoiceId(`INV-${String(nextInvNum).padStart(3, '0')}`);
    }
  }, [showAddPaymentModal, expenses]);

  // Guest RSVP States
  const [guests, setGuests] = useState([]);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestStatus, setGuestStatus] = useState('pending');

  // Tasks States
  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDeadline, setTaskDeadline] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('Self');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [taskStatus, setTaskStatus] = useState('To Do');

  // Vendors States
  const [vendors, setVendors] = useState([]);
  const [vendorName, setVendorName] = useState('');
  const [vendorCategory, setVendorCategory] = useState('Caterer');
  const [vendorOwner, setVendorOwner] = useState('');
  const [vendorPhone, setVendorPhone] = useState('');
  const [vendorEmail, setVendorEmail] = useState('');
  const [vendorCost, setVendorCost] = useState('');
  const [vendorStatus, setVendorStatus] = useState('contacted');
  const [globalVendors, setGlobalVendors] = useState([]);
  const [selectedGlobalVendorId, setSelectedGlobalVendorId] = useState('');

  // Load global admin vendors
  useEffect(() => {
    try {
      const savedVendors = localStorage.getItem('vendors_data');
      if (savedVendors) {
        setGlobalVendors(JSON.parse(savedVendors));
      } else {
        // Fallback to default admin vendors list
        setGlobalVendors([
          { id: 1, name: 'Apex Sound & Lights', category: 'Entertainment', contact_person: 'Harish Vyas', phone: '+91 94140 12345', email: 'contact@apexsound.com' },
          { id: 2, name: 'Royal Decorators', category: 'Decoration', contact_person: 'Vikram Singh', phone: '+91 82900 67890', email: 'vikram@royaldecor.com' },
          { id: 3, name: 'Marwar Catering Services', category: 'Catering', contact_person: 'Ramesh Patel', phone: '+91 98290 11223', email: 'info@marwarcatering.com' },
          { id: 4, name: 'Lakeside Photography', category: 'Photography', contact_person: 'Priya Sharma', phone: '+91 99280 44556', email: 'priya@lakesidephoto.com' },
          { id: 5, name: 'Udaipur Event Management', category: 'Event Planner', contact_person: 'Amit Mehta', phone: '+91 70140 77889', email: 'info@udaipurevents.com' },
          { id: 6, name: 'Heritage Travels', category: 'Transport', contact_person: 'Sanjay Jain', phone: '+91 94600 33445', email: 'bookings@heritagetravels.com' },
          { id: 7, name: 'Sweet Delights Bakery', category: 'Catering', contact_person: 'Divya Joshi', phone: '+91 94130 99887', email: 'orders@sweetdelights.com' },
          { id: 8, name: 'Udaipur Tent & Stage', category: 'Equipment', contact_person: 'Suresh Sen', phone: '+91 98870 55667', email: 'contact@udaipurtent.com' },
          { id: 9, name: 'Mewar Sound & DJ Udaipur', category: 'Entertainment', contact_person: 'Rajesh Menaria', phone: '+91 94141 66778', email: 'dj@mewarsound.com' },
          { id: 10, name: 'The Wedding Filmer Udaipur', category: 'Photography', contact_person: 'Rohan Kothari', phone: '+91 98280 55443', email: 'rohan@weddingfilmer.com' },
          { id: 11, name: 'Lake City Flowers & Decor', category: 'Decoration', contact_person: 'Manish Sharma', phone: '+91 94611 22334', email: 'manish@lakecityflowers.com' },
          { id: 12, name: 'Shreeji Catering & Sweets', category: 'Catering', contact_person: 'Kailash Chandra', phone: '+91 99291 88990', email: 'kailash@shreejicaterers.com' },
          { id: 13, name: 'Aravali Wedding Planners', category: 'Event Planner', contact_person: 'Shruti Paliwal', phone: '+91 77270 44556', email: 'shruti@aravaliwedding.com' }
        ]);
      }
    } catch (e) {
      console.error('Error loading global vendors:', e);
    }
  }, []);

  const handleSelectGlobalVendor = (vId) => {
    setSelectedGlobalVendorId(vId);
  };

  const handleAutoFillVendor = () => {
    if (!selectedGlobalVendorId) return;
    const selected = globalVendors.find(v => String(v.id) === String(selectedGlobalVendorId));
    if (selected) {
      setVendorName(selected.name || '');
      
      const catMap = {
        'Catering': 'Caterer',
        'Decoration': 'Decorator',
        'Photography': 'Photographer',
        'Entertainment': 'DJ/Sound',
        'Florist': 'Florist',
        'Event Planner': 'Venue Coordinator',
        'Coordinator': 'Venue Coordinator',
        'Transport': 'Venue Coordinator',
        'Equipment': 'Decorator'
      };
      const mappedCat = catMap[selected.category] || 'Caterer';
      setVendorCategory(mappedCat);

      setVendorOwner(selected.contact_person || '');
      setVendorPhone(selected.phone || '');
      setVendorEmail(selected.email || '');
      
      // Do NOT populate hiring fee (cost)
      setVendorCost('');

      showToast('Vendor details filled! Set hiring fee.', 'success');
    }
  };

  // Important Notes Local Storage Cache
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [showNotesEdit, setShowNotesEdit] = useState(false);

  // Local storage cover photo
  const [coverPhoto, setCoverPhoto] = useState('/leela_palace.jpg');

  // Sync notes and coverPhoto with localStorage & event details
  useEffect(() => {
    if (id) {
      const storedNotes = localStorage.getItem(`event_notes_${id}`);
      if (storedNotes) {
        setNotes(JSON.parse(storedNotes));
      } else {
        setNotes([]);
      }

      const storedCover = localStorage.getItem(`event_cover_${id}`);
      if (storedCover && !storedCover.includes('.png')) {
        setCoverPhoto(storedCover);
      } else if (event) {
        const cat = (event.event_type || '').toLowerCase();
        if (cat.includes('wedding') || cat.includes('marriage')) {
          setCoverPhoto('/leela_palace.jpg');
        } else if (cat.includes('birthday') || cat.includes('anniversary')) {
          setCoverPhoto('/hero_udaipur_3.jpg');
        } else if (cat.includes('corporate') || cat.includes('seminar') || cat.includes('conference')) {
          setCoverPhoto('/oberoi_udaivilas.jpg');
        } else if (cat.includes('college') || cat.includes('festival') || cat.includes('fest')) {
          setCoverPhoto('/monsoon_palace.jpg');
        } else if (cat.includes('private') || cat.includes('party')) {
          setCoverPhoto('/jag_mandir.jpg');
        } else {
          setCoverPhoto('/hero_udaipur_1.jpg');
        }
      } else {
        setCoverPhoto('/leela_palace.jpg');
      }
    }
  }, [id, event]);

  useEffect(() => {
    if (id && notes.length > 0) {
      localStorage.setItem(`event_notes_${id}`, JSON.stringify(notes));
    } else if (id && notes.length === 0) {
      localStorage.removeItem(`event_notes_${id}`);
    }
  }, [notes, id]);

  // Hydration date formatting state
  const [formattedDateText, setFormattedDateText] = useState('');
  const [createdDateText, setCreatedDateText] = useState('');
  const [lastUpdatedText, setLastUpdatedText] = useState('');

  // Fetch Event Data
  const fetchEventDetails = useCallback(async () => {
    if (!id) return;
    try {
      const res = await authFetch(`/events/${id}`);
      if (res.ok) {
        const data = await res.json();
        setEvent(data);
        // Setup initial edit states
        setEditTitle(data.title);
        setEditDate(data.date ? data.date.split('T')[0] : '');
        setEditTime(data.time || '18:00');
        setEditLocation(data.location);
        setEditBudget(data.budget);
        setEditGuests(data.guest_count);
        setEditType(data.event_type);
        setEditTheme(data.theme || 'Royal / Traditional');
      } else {
        throw new Error('Event not found');
      }
    } catch (err) {
      showToast(err.message, 'error');
      router.push('/events');
    }
  }, [id, authFetch]);

  // Fetch Budget Details
  const fetchBudgetDetails = useCallback(async () => {
    if (!id) return;
    try {
      const res = await authFetch(`/budget/${id}`);
      if (res.ok) {
        const data = await res.json();
        setBudget(data.budget);
        setExpenses(data.expenses || []);
      }
    } catch (err) {
      console.error(err.message);
    }
  }, [id, authFetch]);

  // Fetch Guest Details
  const fetchGuestDetails = useCallback(async () => {
    if (!id) return;
    try {
      const res = await authFetch(`/guests/${id}`);
      if (res.ok) {
        const data = await res.json();
        setGuests(data || []);
      }
    } catch (err) {
      console.error(err.message);
    }
  }, [id, authFetch]);

  // Fetch Task Details
  const fetchTaskDetails = useCallback(async () => {
    if (!id) return;
    try {
      const res = await authFetch(`/tasks/${id}`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data || []);
      }
    } catch (err) {
      console.error(err.message);
    }
  }, [id, authFetch]);

  // Fetch Vendor Details
  const fetchVendorDetails = useCallback(async () => {
    if (!id) return;
    try {
      const res = await authFetch(`/vendors/${id}`);
      if (res.ok) {
        const data = await res.json();
        setVendors(data || []);
      }
    } catch (err) {
      console.error(err.message);
    }
  }, [id, authFetch]);

  // Master Initializer
  useEffect(() => {
    const initFetch = async () => {
      if (!id) return;
      setLoading(true);
      await Promise.all([
        fetchEventDetails(),
        fetchBudgetDetails(),
        fetchGuestDetails(),
        fetchTaskDetails(),
        fetchVendorDetails()
      ]);
      setLoading(false);
    };
    initFetch();
  }, [id]);

  // Real-Time Background Refetching for Event Hub
  useEffect(() => {
    if (id) {
      const fetchEventHubDataSilent = async () => {
        try {
          await Promise.all([
            fetchEventDetails(),
            fetchBudgetDetails(),
            fetchGuestDetails(),
            fetchTaskDetails(),
            fetchVendorDetails()
          ]);
        } catch (err) {
          console.error('Silent event hub fetch failed:', err);
        }
      };

      const interval = setInterval(() => {
        fetchEventHubDataSilent();
      }, 5000);

      const handleFocus = () => {
        fetchEventHubDataSilent();
      };
      window.addEventListener('focus', handleFocus);

      return () => {
        clearInterval(interval);
        window.removeEventListener('focus', handleFocus);
      };
    }
  }, [id, fetchEventDetails, fetchBudgetDetails, fetchGuestDetails, fetchTaskDetails, fetchVendorDetails]);

  // Handle Hydration Date
  useEffect(() => {
    if (event?.date) {
      const d = new Date(event.date);
      setFormattedDateText(
        d.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }) + ` at ${event.time || '6:00 PM'}`
      );
    }

    if (event?.created_at) {
      const cDate = new Date(event.created_at);
      setCreatedDateText(
        cDate.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        })
      );

      const storedUpdated = localStorage.getItem(`event_updated_${id}`);
      const lastUpdatedDate = storedUpdated ? new Date(storedUpdated) : cDate;
      setLastUpdatedText(
        lastUpdatedDate.toLocaleString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      );
    }
  }, [event, id]);

  // Handle Edit Submit
  const handleEditEvent = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await authFetch(`/update-event/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: editTitle,
          date: editDate,
          time: editTime,
          location: editLocation,
          budget: parseFloat(editBudget),
          guest_count: parseInt(editGuests),
          event_type: editType,
          theme: editTheme
        })
      });
      if (res.ok) {
        showToast('Event updated successfully!', 'success');
        localStorage.setItem(`event_updated_${id}`, new Date().toISOString());
        setShowEditModal(false);
        fetchEventDetails();
        fetchBudgetDetails();
      } else {
        const data = await res.json();
        throw new Error(data.message || 'Failed to update event');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete Event
  const handleDeleteEvent = async () => {
    setActionLoading(true);
    try {
      const res = await authFetch(`/delete-event/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Event deleted successfully', 'success');
        router.push('/events');
      } else {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete event');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Status Quick Change
  const handleUpdateStatus = async (newStatus) => {
    try {
      const res = await authFetch(`/update-event/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setEvent(prev => ({ ...prev, status: newStatus }));
        showToast(`Status updated to ${newStatus}`, 'success');
        localStorage.setItem(`event_updated_${id}`, new Date().toISOString());
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Budget expense additions
  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!expTitle || !expAmount || !expDate) return;
    try {
      const res = await authFetch('/expense/add', {
        method: 'POST',
        body: JSON.stringify({
          eventId: id,
          title: expTitle,
          amount: parseFloat(expAmount),
          category: expCategory,
          date: expDate
        })
      });
      if (res.ok) {
        showToast('Expense recorded successfully!', 'success');
        setExpTitle('');
        setExpAmount('');
        setExpDate('');
        fetchBudgetDetails();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteExpense = async (expId) => {
    try {
      const res = await authFetch(`/expense/${expId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Expense removed', 'info');
        fetchBudgetDetails();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    if (!payDescription || !payAmount || !payDate || !payInvoiceId) return;

    const serializedTitle = `${payDescription} || ${payInvoiceId} || ${payStatus}`;

    try {
      const res = await authFetch('/expense/add', {
        method: 'POST',
        body: JSON.stringify({
          eventId: id,
          title: serializedTitle,
          amount: parseFloat(payAmount),
          category: 'Payment',
          date: payDate
        })
      });

      if (res.ok) {
        showToast('Payment transaction recorded successfully!', 'success');
        setPayDescription('');
        setPayAmount('');
        setPayDate(new Date().toISOString().split('T')[0]);
        setPayStatus('Paid');
        setPayInvoiceId('');
        setShowAddPaymentModal(false);
        fetchBudgetDetails();
      } else {
        const data = await res.json();
        throw new Error(data.message || 'Failed to record payment transaction');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Guest RSVP lists
  const handleAddGuest = async (e) => {
    e.preventDefault();
    if (!guestName || !guestEmail) return;
    try {
      const res = await authFetch('/guest/add', {
        method: 'POST',
        body: JSON.stringify({
          eventId: id,
          guest_name: guestName,
          email: guestEmail,
          status: guestStatus
        })
      });
      if (res.ok) {
        showToast('Attendee added successfully', 'success');
        setGuestName('');
        setGuestEmail('');
        fetchGuestDetails();
        fetchNotifications();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleUpdateGuestStatus = async (guestId, newStatus) => {
    try {
      const g = guests.find(guest => guest.id === guestId);
      const res = await authFetch(`/guest/${guestId}`, {
        method: 'PUT',
        body: JSON.stringify({
          guest_name: g.guest_name,
          email: g.email,
          status: newStatus
        })
      });
      if (res.ok) {
        showToast('RSVP status updated', 'success');
        fetchGuestDetails();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteGuest = async (guestId) => {
    try {
      const res = await authFetch(`/guest/${guestId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Guest removed from list', 'info');
        fetchGuestDetails();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Tasks Checklist
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskTitle || !taskDeadline) return;

    // Serialize task details into task.title
    const serializedTitle = `${taskTitle} || ${taskAssignee} || ${taskPriority} || ${taskStatus}`;
    const dbStatus = taskStatus === 'Completed' ? 'completed' : 'pending';

    try {
      const res = await authFetch('/task/add', {
        method: 'POST',
        body: JSON.stringify({
          eventId: id,
          title: serializedTitle,
          deadline: taskDeadline,
          status: dbStatus
        })
      });
      if (res.ok) {
        showToast('Task assigned successfully', 'success');
        setTaskTitle('');
        setTaskDeadline('');
        setTaskAssignee('Self');
        setTaskPriority('Medium');
        setTaskStatus('To Do');
        fetchTaskDetails();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleTaskStatus = async (taskId, currentStatus) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    try {
      const res = await authFetch(`/task/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showToast(newStatus === 'completed' ? 'Task marked completed! 🎉' : 'Task pending', 'success');
        fetchTaskDetails();
        fetchNotifications();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const res = await authFetch(`/task/${taskId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Task removed', 'info');
        fetchTaskDetails();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Vendor Suppliers
  const handleAddVendor = async (e) => {
    e.preventDefault();
    if (!vendorName) return;
    if (!vendorOwner && !vendorPhone && !vendorEmail) {
      showToast('Please provide at least one contact detail (Owner, Phone, or Email)', 'error');
      return;
    }
    
    // Combine fields for database contact field
    const contactParts = [];
    if (vendorOwner) contactParts.push(`Owner: ${vendorOwner}`);
    if (vendorPhone) contactParts.push(`Phone: ${vendorPhone}`);
    if (vendorEmail) contactParts.push(`Email: ${vendorEmail}`);
    const combinedContact = contactParts.join(' | ') || 'N/A';

    try {
      const res = await authFetch('/vendor/add', {
        method: 'POST',
        body: JSON.stringify({
          eventId: id,
          vendor_name: vendorName,
          category: vendorCategory,
          contact: combinedContact,
          cost: parseFloat(vendorCost) || 0,
          status: vendorStatus
        })
      });
      if (res.ok) {
        showToast('Supplier hired', 'success');
        setVendorName('');
        setVendorOwner('');
        setVendorPhone('');
        setVendorEmail('');
        setVendorCost('');
        setSelectedGlobalVendorId('');
        fetchVendorDetails();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleUpdateVendorStatus = async (vId, newStatus) => {
    try {
      const res = await authFetch(`/vendor/${vId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showToast('Supplier status updated', 'success');
        fetchVendorDetails();
        fetchNotifications();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteVendor = async (vId) => {
    try {
      const res = await authFetch(`/vendor/${vId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Vendor removed from event', 'info');
        fetchVendorDetails();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Real Cover photo upload trigger
  const handleCoverPhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result;
        setCoverPhoto(base64Data);
        if (id) {
          localStorage.setItem(`event_cover_${id}`, base64Data);
        }
        showToast('Cover photo updated successfully!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  // Simulated PDF Downloader
  const handleDownloadReport = () => {
    showToast('Generating and downloading PDF Report...', 'info');
    setTimeout(() => {
      window.print();
    }, 500);
  };

  // Share link copier
  const handleShareEvent = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      showToast('Event share URL link copied to clipboard!', 'success');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse max-w-6xl mx-auto">
        <div className="h-6 bg-white/5 rounded w-1/4"></div>
        <div className="h-10 bg-white/5 rounded w-1/2"></div>
        <div className="h-56 bg-white/5 rounded-2xl"></div>
        <div className="h-96 bg-white/5 rounded-2xl"></div>
      </div>
    );
  }

  // Values calculation
  const totalBudget = event ? parseFloat(event.budget) : 0;
  const totalSpent = budget ? parseFloat(budget.expenses) : 0;
  const remainingBudget = budget ? parseFloat(budget.remaining_budget) : totalBudget;
  const checklistTasks = tasks.filter(t => !isTimelineTask(t.title));
  const totalTasks = checklistTasks.length;
  const completedTasks = checklistTasks.filter(t => t.status === 'completed').length;
  const taskPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Dynamic task status calculations for Overview
  const pendingTasksCount = checklistTasks.filter(t => t.status === 'pending' && !(t.deadline && new Date(t.deadline) < new Date())).length;
  const overdueTasksCount = checklistTasks.filter(t => t.status === 'pending' && t.deadline && new Date(t.deadline) < new Date()).length;
  const inProgressTasksCount = checklistTasks.filter(t => t.status === 'in_progress' || t.status === 'ongoing').length;

  // Extract category specific vendors dynamically
  const venueVendor = vendors.find(v => v.category.toLowerCase() === 'venue');
  const cateringVendor = vendors.find(v => v.category.toLowerCase() === 'caterer' || v.category.toLowerCase() === 'catering');
  const decorVendor = vendors.find(v => v.category.toLowerCase() === 'decorator' || v.category.toLowerCase() === 'decor' || v.category.toLowerCase() === 'decoration');

  // Dynamic timeline milestones
  const timelineTasks = tasks
    .filter(t => isTimelineTask(t.title))
    .sort((a, b) => getTimelineMinutes(a.title) - getTimelineMinutes(b.title));

  const timelineMilestones = timelineTasks.map(t => {
    const deadlineDate = t.deadline ? new Date(t.deadline) : null;
    const formattedDeadline = deadlineDate 
      ? deadlineDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
      : 'No deadline';
    return {
      id: t.id,
      title: t.title,
      time: formattedDeadline,
      completed: t.status === 'completed'
    };
  });

  const spentPct = totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(2) : '0.00';
  const budgetProgress = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0;

  // RSVP counters
  const yesRSVP = guests.filter(g => g.status === 'confirmed').length;
  const maybeRSVP = guests.filter(g => g.status === 'pending').length;
  const noRSVP = guests.filter(g => g.status === 'declined').length;

  // Donut SVG segments calculations (Circumference radius 45 ~ 282.74)
  const radius = 45;
  const circumference = 2 * Math.PI * radius; // 282.74
  const budgetShares = [
    { label: 'Venue', percent: 40, color: '#6366f1', amount: totalBudget * 0.40 }, // Indigo
    { label: 'Catering', percent: 25, color: '#10b981', amount: totalBudget * 0.25 }, // Emerald
    { label: 'Decoration', percent: 15, color: '#f59e0b', amount: totalBudget * 0.15 }, // Amber
    { label: 'Entertainment', percent: 10, color: '#f43f5e', amount: totalBudget * 0.10 }, // Rose
    { label: 'Photography', percent: 5, color: '#a855f7', amount: totalBudget * 0.05 }, // Purple
    { label: 'Others', percent: 5, color: '#6b7280', amount: totalBudget * 0.05 } // Gray
  ];
  let accPercent = 0;

  // RSVP Ring SVG segments calculations (Circumference radius 35 ~ 219.91)
  const rsvpRadius = 35;
  const rsvpCircumference = 2 * Math.PI * rsvpRadius;
  const totalGuestsSum = yesRSVP + maybeRSVP + noRSVP;
  const yesPct = totalGuestsSum > 0 ? Math.round((yesRSVP / totalGuestsSum) * 100) : 0;
  const maybePct = totalGuestsSum > 0 ? Math.round((maybeRSVP / totalGuestsSum) * 100) : 0;
  const noPct = totalGuestsSum > 0 ? Math.round((noRSVP / totalGuestsSum) * 100) : 0;

  // Recent Payments Table mapping
  const paymentRows = expenses.map((exp, idx) => ({
    id: `INV-00${idx + 1}`,
    description: exp.title,
    amount: parseFloat(exp.amount),
    date: exp.date ? exp.date.split('T')[0] : '2024-05-20',
    status: 'Paid'
  }));

  // Document attachments
  const documentFiles = [];

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 font-sans">
      
      {/* 1. Header Segment with Navigation & Top Controls */}
      <div className="flex flex-col gap-4">
        


        {/* Header Action controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white">{event.title}</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border tracking-wide ${
              event.status === 'planning'
                ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                : event.status === 'ongoing' || event.status === 'in progress'
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            }`}>
              {event.status === 'planning' ? 'Planning' : event.status === 'ongoing' ? 'Ongoing' : 'In Progress'}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="px-3.5 py-2 border border-white/5 hover:border-[#5a2bd4]/20 bg-white/3 hover:bg-white/5 text-gray-200 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit Event
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-3.5 py-2 border border-rose-500/10 hover:border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Event
            </button>
          </div>
        </div>

      </div>

      {/* 2. Top Card: Split Layout Cover Image + Quick Overview Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Cover Photo card */}
        <div className="lg:col-span-8 glass-panel p-5 rounded-2xl border border-white/5 flex flex-col md:flex-row gap-5 shadow-xl relative overflow-hidden">
          
          {/* Cover image wrap */}
          <div className="md:w-60 h-44 rounded-xl overflow-hidden border border-white/5 shrink-0 relative group">
            <img
              src={coverPhoto}
              alt="Event Cover"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <input
              type="file"
              id="event-cover-upload"
              accept="image/*"
              className="hidden"
              onChange={handleCoverPhotoUpload}
            />
            <button
              onClick={() => document.getElementById('event-cover-upload').click()}
              className="absolute bottom-3 left-3 bg-black/60 hover:bg-black/85 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg border border-white/10 transition-colors cursor-pointer"
            >
              Change Photo
            </button>
          </div>

          {/* Event description details */}
          <div className="flex-1 flex flex-col justify-between py-1">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white leading-tight">{event.title}</h2>
                <Edit className="w-3.5 h-3.5 text-gray-500 hover:text-white cursor-pointer" onClick={() => setShowEditModal(true)} />
              </div>
              <span className="text-[10px] text-indigo-400 font-bold tracking-wide uppercase">{event.event_type} Celebration</span>
            </div>

            <div className="flex flex-col gap-2 mt-4 text-xs font-semibold text-gray-300">
              <div className="flex items-center gap-2.5">
                <CalendarDays className="w-4 h-4 text-gray-500" />
                <span>{formattedDateText}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-gray-500" />
                <span>~ {event.guest_count} Guests</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Palette className="w-4 h-4 text-gray-500" />
                <span>Theme: <span className="text-indigo-300">{editTheme}</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Overview Metrics Card */}
        <div className="lg:col-span-4 glass-panel p-5 rounded-2xl border border-white/5 flex flex-col gap-4 shadow-xl justify-between bg-gradient-to-br from-indigo-950/5 to-purple-950/5">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-200 border-b border-white/5 pb-2">
            Quick Overview
          </h3>

          <div className="flex flex-col gap-2.5 text-xs font-semibold text-gray-300">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Total Budget:</span>
              <span className="text-white font-extrabold">{formatRupee(totalBudget)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Total Spent:</span>
              <span className="text-emerald-400 font-extrabold">{formatRupee(totalSpent)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Remaining Budget:</span>
              <span className="text-indigo-400 font-extrabold">{formatRupee(remainingBudget)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Tasks Completed:</span>
              <span className="text-white">{completedTasks} / {totalTasks} ({taskPct}%)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Event Status:</span>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase">
                {event.status === 'planning' ? 'Planning' : 'In Progress'}
              </span>
            </div>
          </div>

          <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
            <div className="bg-[#5a2bd4] h-full rounded-full" style={{ width: `${taskPct}%` }}></div>
          </div>
        </div>

      </div>

      {/* 3. Horizontal Navigation Tabs Bar */}
      <div className="flex overflow-x-auto gap-1 bg-white/3 border border-white/5 rounded-2xl p-1 scrollbar-none">
        {[
          { id: 'overview', name: 'Overview' },
          { id: 'budget', name: 'Budget' },
          { id: 'guests', name: 'Guests' },
          { id: 'tasks', name: 'Tasks' },
          { id: 'vendors', name: 'Vendors' },
          { id: 'payments', name: 'Payments' },
          { id: 'notes_docs', name: 'Notes & Documents' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-2.5 px-4.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'bg-white text-[#5a2bd4] shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* 4. Tab Panel display contents */}
      <div className="min-h-[400px]">
        
        {/* ================= OVERVIEW TAB ================= */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-6 animate-fade-in">
            
            {/* Row 1: Event Timeline + Budget Donut Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              
              {/* Event Timeline checklist card */}
              <div className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col gap-4 shadow-xl">
                <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">Event Timeline</h3>
                  <button
                    onClick={() => setActiveTab('tasks')}
                    className="text-[9px] font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer animate-pulse-subtle"
                  >
                    Manage Tasks
                  </button>
                </div>
                
                {timelineMilestones.length > 0 ? (
                  <div className="flex flex-col gap-3 pl-4 border-l border-indigo-500/20 relative my-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                    {timelineMilestones.map((milestone) => (
                      <div key={milestone.id} className="relative flex justify-between items-center text-xs py-1">
                        <button
                          type="button"
                          onClick={() => handleToggleTaskStatus(milestone.id, milestone.completed ? 'completed' : 'pending')}
                          className={`absolute left-[-22px] w-3 h-3 rounded-full border border-[#0d0f14] flex items-center justify-center cursor-pointer transition-colors z-10 ${
                            milestone.completed ? 'bg-emerald-500 border-emerald-400 text-[#0d0f14]' : 'bg-gray-700 hover:bg-gray-600 border-gray-600'
                          }`}
                          title={milestone.completed ? 'Mark pending' : 'Mark completed'}
                        >
                          {milestone.completed && <Check className="w-2 h-2 text-[#0d0f14] stroke-[3px]" />}
                        </button>
                        <div className="flex flex-col gap-0.5 pl-1.5 text-left">
                          <span className={`font-bold ${milestone.completed ? 'text-gray-400 line-through' : 'text-gray-200'}`}>{milestone.title}</span>
                          <span className="text-[9px] text-gray-500 font-semibold">{milestone.time}</span>
                        </div>
                        <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 ml-2 ${
                          milestone.completed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {milestone.completed ? 'Completed' : 'Upcoming'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center border border-white/5 bg-white/2 rounded-xl h-full min-h-[140px] my-2">
                    <p className="text-[10px] text-gray-500 max-w-[200px] leading-relaxed">
                      No timeline milestones or tasks created yet. Click below to add tasks.
                    </p>
                    <button
                      onClick={() => setActiveTab('tasks')}
                      className="mt-2.5 py-1.5 px-3 bg-indigo-600/15 border border-indigo-500/25 hover:bg-indigo-600/25 text-indigo-300 font-bold text-[9px] rounded-lg cursor-pointer transition-colors"
                    >
                      Go to Tasks
                    </button>
                  </div>
                )}
              </div>

              {/* Budget Overview donut chart card */}
              <div className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col gap-4 shadow-xl">
                <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">Budget Overview</h3>
                  <span className="text-[9px] font-extrabold text-amber-400 bg-amber-500/10 px-2 py-0.5 border border-amber-500/20 rounded">
                    Remaining: {formatRupee(remainingBudget)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  
                  {/* SVG Donut Chart */}
                  <div className="md:col-span-5 flex justify-center py-2">
                    <div className="relative w-32 h-32">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r={radius} fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="9" />
                        {budgetShares.map((seg, idx) => {
                          const strokeDash = (seg.percent / 100) * circumference;
                          const strokeOffset = circumference - (accPercent / 100) * circumference;
                          accPercent += seg.percent;
                          return (
                            <circle
                              key={idx}
                              cx="60"
                              cy="60"
                              r={radius}
                              fill="transparent"
                              stroke={seg.color}
                              strokeWidth="9"
                              strokeDasharray={`${strokeDash} ${circumference}`}
                              strokeDashoffset={strokeOffset}
                              className="transition-all duration-300"
                            />
                          );
                        })}
                      </svg>
                      
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                        <span className="text-[10px] font-black text-white">{formatRupee(totalBudget)}</span>
                        <span className="text-[7px] text-gray-500 uppercase tracking-widest mt-0.5">Total Budget</span>
                      </div>
                    </div>
                  </div>

                  {/* Legend list */}
                  <div className="md:col-span-7 flex flex-col gap-1.5 text-[9px] text-gray-400 font-semibold pr-1">
                    {budgetShares.map((seg, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: seg.color }}></span>
                          <span className="text-gray-300">{seg.label}</span>
                          <span className="text-[8px] text-gray-500 font-medium">({seg.percent}%)</span>
                        </div>
                        <span className="text-white font-extrabold">{formatRupee(seg.amount)}</span>
                      </div>
                    ))}
                  </div>

                </div>

                {/* Bottom summaries metrics */}
                <div className="grid grid-cols-4 gap-2 text-center text-[9px] border-t border-white/5 pt-3.5">
                  <div>
                    <span className="text-gray-500 block uppercase">Total Budget</span>
                    <span className="font-extrabold text-white text-xs block mt-0.5">{formatRupee(totalBudget)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block uppercase">Total Spent</span>
                    <span className="font-extrabold text-emerald-400 text-xs block mt-0.5">{formatRupee(totalSpent)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block uppercase">Remaining</span>
                    <span className="font-extrabold text-indigo-400 text-xs block mt-0.5">{formatRupee(remainingBudget)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block uppercase">Spent (%)</span>
                    <span className="font-extrabold text-amber-500 text-xs block mt-0.5">{spentPct}%</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Row 2: Venue, Tasks, Notes, and Status Cards (Combined 2x2 Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Venue details */}
              <div className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col justify-between gap-4 shadow-xl">
                <div className="flex flex-col gap-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-indigo-300 flex items-center gap-2 border-b border-white/5 pb-2">
                    <Building className="w-4 h-4" />
                    Venue Details
                  </h3>
                  <div className="h-24 rounded-lg overflow-hidden border border-white/5">
                    <img 
                      src={venueVendor ? getVenueImage(venueVendor.vendor_name) : coverPhoto} 
                      alt="Venue" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  {venueVendor ? (
                    <>
                      <div>
                        <h4 className="text-xs font-extrabold text-white">{venueVendor.vendor_name}</h4>
                        <span className="text-[9px] text-gray-500 flex items-center gap-1.5 mt-1 font-medium">
                          <MapPin className="w-3 h-3" /> {venueVendor.contact || 'Udaipur, Rajasthan'}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 text-[9px] text-gray-400 font-semibold mt-1">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Estimated Cost:</span>
                          <span className="text-amber-400 font-bold">{formatRupee(venueVendor.cost)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Status:</span>
                          <span className="text-emerald-400 font-bold uppercase">{venueVendor.status}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <h4 className="text-xs font-extrabold text-gray-500">No Venue Assigned</h4>
                        <span className="text-[9px] text-gray-600 flex items-center gap-1.5 mt-1 font-medium">
                          <MapPin className="w-3 h-3" /> Not specified
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 text-[9px] text-gray-500 font-semibold mt-1">
                        <p className="text-[9px] text-gray-500 font-medium">Explore or assign a venue to see details.</p>
                      </div>
                    </>
                  )}
                </div>
                {venueVendor ? (
                  <button
                    onClick={() => setActiveTab('vendors')}
                    className="w-full py-2 border border-white/5 hover:border-[#5a2bd4]/20 bg-white/3 hover:bg-white/5 text-gray-300 font-bold text-[10px] rounded-xl cursor-pointer transition-colors"
                  >
                    Manage Vendors
                  </button>
                ) : (
                  <button
                    onClick={() => router.push('/venues')}
                    className="w-full py-2 border border-white/5 hover:border-[#5a2bd4]/20 bg-white/3 hover:bg-white/5 text-gray-300 font-bold text-[10px] rounded-xl cursor-pointer transition-colors"
                  >
                    Explore Venue
                  </button>
                )}
              </div>
              
              {/* Tasks overview */}
              <div className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col justify-between gap-4 shadow-xl">
                <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">Tasks Overview</h3>
                  <button
                    onClick={() => setActiveTab('tasks')}
                    className="text-[9px] font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                  >
                    View All Tasks
                  </button>
                </div>

                <div className="flex-1 flex items-center justify-center py-2">
                  <div className="grid grid-cols-2 gap-6 items-center w-full max-w-[290px] mx-auto">
                    
                    {/* Task completion SVG circle */}
                    <div className="flex justify-center relative w-24 h-24 mx-auto">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="8" />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke="#10b981"
                          strokeWidth="8"
                          strokeDasharray={`${(taskPct / 100) * 251.33} 251.33`}
                          className="transition-all duration-300"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-base font-black text-white">{taskPct}%</span>
                        <span className="text-[9px] text-gray-500 uppercase tracking-widest leading-none mt-1 font-bold">Completed</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2.5 text-[11px] text-gray-400 font-bold">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total Tasks:</span>
                        <span className="text-white font-black">{totalTasks}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Completed:</span>
                        <span className="text-emerald-400 font-black">{completedTasks}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">In Progress:</span>
                        <span className="text-amber-400 font-black">{inProgressTasksCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Pending:</span>
                        <span className="text-gray-300 font-black">{pendingTasksCount}</span>
                      </div>
                      <div className="flex justify-between text-rose-400">
                        <span>Overdue:</span>
                        <span className="font-black text-rose-400">{overdueTasksCount}</span>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* Important Notes */}
              <div className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col justify-between gap-4 shadow-xl">
                <div className="flex flex-col gap-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-white border-b border-white/5 pb-2">
                    Important Notes
                  </h3>
                  
                  {/* Notes listing */}
                  {showNotesEdit ? (
                    <div className="flex flex-col gap-2">
                      <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Add a new custom note..."
                        className="w-full h-16 bg-white/3 border border-white/5 rounded-xl px-2.5 py-1.5 text-[10px] text-white focus:outline-none focus:border-indigo-500/50 transition-all resize-none"
                      />
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setShowNotesEdit(false);
                            setNewNote('');
                          }}
                          className="px-2.5 py-1 text-[8px] font-bold bg-white/5 border border-white/5 rounded text-gray-400"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (newNote.trim()) {
                              setNotes([...notes, newNote.trim()]);
                              setNewNote('');
                              setShowNotesEdit(false);
                              showToast('Added important note!', 'success');
                            }
                          }}
                          className="px-2.5 py-1 text-[8px] font-bold bg-[#5a2bd4] text-white rounded"
                        >
                          Add Note
                        </button>
                      </div>
                    </div>
                  ) : (
                    <ul className="flex flex-col gap-2 text-[10px] text-gray-300 font-medium">
                      {notes.map((note, idx) => (
                        <li key={idx} className="flex items-start gap-2 bg-white/1 px-3 py-1.5 border border-white/5 rounded-lg leading-relaxed">
                          <span className="text-indigo-400 font-black">•</span>
                          {note}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {!showNotesEdit && (
                  <button
                    onClick={() => setShowNotesEdit(true)}
                    className="w-full py-2 border border-white/5 hover:border-indigo-500/20 bg-white/3 hover:bg-white/5 text-gray-300 font-bold text-[10px] rounded-xl cursor-pointer transition-colors"
                  >
                    Edit Notes
                  </button>
                )}
              </div>

              {/* Event status info */}
              <div className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col justify-between gap-4 shadow-xl">
                <div className="flex flex-col gap-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-white border-b border-white/5 pb-2">
                    Event Status
                  </h3>
                  
                  <div className="flex flex-col gap-2 text-[10px] text-gray-400 font-semibold mt-1">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Status</span>
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 px-2 py-0.5 rounded text-[8px] font-bold uppercase">
                        {event.status === 'planning' ? 'Planning' : 'In Progress'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Created On</span>
                      <span className="text-white">{createdDateText || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Last Updated</span>
                      <span className="text-white">{lastUpdatedText || '-'}</span>
                    </div>
                  </div>
                </div>
                
                {/* Organizer details */}
                <div className="flex items-center gap-2.5 border-t border-white/5 pt-3">
                  <div className="w-7 h-7 rounded-full bg-[#5a2bd4] text-white flex items-center justify-center font-bold text-[10px] border border-white/10 uppercase">
                    {user?.name ? user.name.charAt(0) : 'R'}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-white">{user?.name || 'Rahul Sharma'}</span>
                    <span className="text-[8px] text-gray-500 font-medium">Event Organizer</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Row 4: Recent Payments Table (Full Width) */}
            <div className="w-full">
              
              {/* Recent Payments table */}
              <div className="w-full glass-panel p-5 rounded-2xl border border-white/5 flex flex-col gap-4 shadow-xl">
                <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">Recent Payments</h3>
                  <button
                    onClick={() => setActiveTab('payments')}
                    className="text-[9px] font-bold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                  >
                    View All Payments
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[10px] text-gray-300 font-medium">
                    <thead>
                      <tr className="border-b border-white/5 text-gray-500 font-bold uppercase tracking-wider">
                        <th className="py-2.5">Invoice ID</th>
                        <th className="py-2.5">Description</th>
                        <th className="py-2.5">Amount</th>
                        <th className="py-2.5">Paid On</th>
                        <th className="py-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {paymentRows.map((pay, idx) => (
                        <tr key={idx} className="hover:bg-white/1 transition-colors">
                          <td className="py-2.5 font-bold text-indigo-400">{pay.id}</td>
                          <td className="py-2.5 text-white">{pay.description}</td>
                          <td className="py-2.5 font-bold text-emerald-400">{formatRupee(pay.amount)}</td>
                          <td className="py-2.5 text-gray-400">{pay.date}</td>
                          <td className="py-2.5">
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                              pay.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                            }`}>
                              {pay.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Bottom Support Banner */}
            <div className={`glass-panel p-4 rounded-2xl border border-[#5a2bd4]/20 flex flex-col sm:flex-row justify-between items-center gap-4 mt-2 ${
              theme === 'light'
                ? 'bg-indigo-50/40'
                : 'bg-gradient-to-r from-indigo-950/15 to-purple-950/15'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#5a2bd4]/10 border border-[#5a2bd4]/20 text-[#5a2bd4] dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white leading-tight">Need help with your event?</h4>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 font-medium">Ask our AI Assistant for suggestions and recommendations.</p>
                </div>
              </div>
              <button
                onClick={handleTriggerAISuggestions}
                className="px-4 py-2.5 bg-[#5a2bd4] hover:bg-[#6b3ce2] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-indigo-600/10 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Ask AI Assistant
              </button>
            </div>

          </div>
        )}

        {/* ================= BUDGET TAB ================= */}
        {activeTab === 'budget' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start animate-fade-in">
            
            {/* Left side expenses panel */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 md:col-span-2 flex flex-col gap-4 shadow-xl">
              <h3 className="text-xs font-black uppercase tracking-wider text-white border-b border-white/5 pb-2.5 flex justify-between items-center">
                <span>Expense Ledger</span>
                <span className="text-[10px] text-gray-500 font-semibold">{expenses.length} records</span>
              </h3>

              {expenses.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-12">No expenses added yet. Record your first payment on the right.</p>
              ) : (
                <div className="flex flex-col gap-2.5 max-h-96 overflow-y-auto pr-1">
                  {expenses.map((exp) => (
                    <div
                      key={exp.id}
                      className="p-3 rounded-xl bg-white/2 border border-white/5 flex justify-between items-center gap-4 hover:bg-white/4 transition-colors"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-gray-200">{exp.title}</span>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 font-semibold">
                          <span className="bg-white/5 px-2 py-0.5 rounded text-gray-400">{exp.category}</span>
                          <span>•</span>
                          <span>{new Date(exp.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-emerald-400">{formatRupee(exp.amount)}</span>
                        <button
                          onClick={() => handleDeleteExpense(exp.id)}
                          className="p-1.5 rounded-md hover:bg-rose-500/10 text-gray-500 hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right side form and aggregate totals */}
            <div className="flex flex-col gap-6 md:col-span-1">
              
              {/* Aggregates Box */}
              {budget && (
                <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col gap-4 shadow-xl">
                  <h4 className="text-xs font-bold text-gray-200 pb-2 border-b border-white/5 uppercase tracking-wider">Budget Status</h4>
                  
                  <div className="flex flex-col gap-3 font-semibold text-xs text-gray-400">
                    <div className="flex justify-between items-center">
                      <span>Total Budget Limit:</span>
                      <span className="font-bold text-white">{formatRupee(budget.total_budget)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Total Expenses Spent:</span>
                      <span className="font-bold text-emerald-400">{formatRupee(budget.expenses)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Remaining Balance:</span>
                      <span className={`font-bold ${parseFloat(budget.remaining_budget) >= 0 ? 'text-indigo-400' : 'text-rose-400'}`}>
                        {formatRupee(budget.remaining_budget)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="flex flex-col gap-1.5 mt-2">
                    <div className="flex justify-between items-center text-[10px] text-gray-500">
                      <span>Budget Spent %</span>
                      <span className="font-bold">{budgetProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${budgetProgress}%` }}
                        className={`h-full rounded-full transition-all duration-500 ${
                          budgetProgress > 90 ? 'bg-rose-500' : budgetProgress > 70 ? 'bg-amber-500' : 'bg-[#5a2bd4]'
                        }`}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Add Expense Form */}
              <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col gap-4 shadow-xl">
                <h4 className="text-xs font-bold text-gray-200 pb-2 border-b border-white/5 uppercase tracking-wider">Record Expense</h4>
                
                <form onSubmit={handleAddExpense} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-500 font-semibold uppercase">Expense Label</label>
                    <input
                      type="text"
                      value={expTitle}
                      onChange={(e) => setExpTitle(e.target.value)}
                      placeholder="e.g. Venue Booking Advance"
                      className="w-full bg-white/3 border border-white/5 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition-all font-semibold"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-gray-500 font-semibold uppercase">Amount (₹)</label>
                      <input
                        type="number"
                        value={expAmount}
                        onChange={(e) => setExpAmount(e.target.value)}
                        placeholder="e.g. 5000"
                        className="w-full bg-white/3 border border-white/5 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition-all font-semibold"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-gray-500 font-semibold uppercase">Date Paid</label>
                      <input
                        type="date"
                        value={expDate}
                        onChange={(e) => setExpDate(e.target.value)}
                        className="w-full bg-white/3 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer font-semibold"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-500 font-semibold uppercase">Ledger Category</label>
                    <select
                      value={expCategory}
                      onChange={(e) => setExpCategory(e.target.value)}
                      className="w-full bg-white/3 border border-white/5 rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer font-semibold"
                    >
                      <option value="Venue" className="bg-[#151c2c]">Venue</option>
                      <option value="Catering" className="bg-[#151c2c]">Catering</option>
                      <option value="Decor" className="bg-[#151c2c]">Decor</option>
                      <option value="Audio/Video" className="bg-[#151c2c]">Audio/Video</option>
                      <option value="Entertainment" className="bg-[#151c2c]">Entertainment</option>
                      <option value="Miscellaneous" className="bg-[#151c2c]">Miscellaneous</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#5a2bd4] hover:bg-[#6b3ce2] text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/10 cursor-pointer transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Save Expense
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ================= GUESTS TAB ================= */}
        {activeTab === 'guests' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start animate-fade-in">
            
            {/* Left side guest lists */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 md:col-span-2 flex flex-col gap-4 shadow-xl">
              <h3 className="text-xs font-black uppercase tracking-wider text-white border-b border-white/5 pb-2.5 flex justify-between items-center">
                <span>Guest Registry</span>
                <span className="text-[10px] text-gray-500 font-semibold">{guests.length} total</span>
              </h3>

              {guests.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-12">No guests registered yet. Add invitees on the right.</p>
              ) : (
                <div className="flex flex-col gap-2.5 max-h-96 overflow-y-auto pr-1">
                  {guests.map((g) => (
                    <div
                      key={g.id}
                      className="p-3 rounded-xl bg-white/2 border border-white/5 flex justify-between items-center gap-4 hover:bg-white/4 transition-colors"
                    >
                      <div className="flex flex-col gap-0.5 truncate">
                        <span className="text-xs font-bold text-gray-200">{g.guest_name}</span>
                        <span className="text-[10px] text-gray-500 truncate">{g.email}</span>
                      </div>
                      
                      <div className="flex items-center gap-3 shrink-0">
                        <select
                          value={g.status}
                          onChange={(e) => handleUpdateGuestStatus(g.id, e.target.value)}
                          className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase border focus:outline-none cursor-pointer ${
                            g.status === 'confirmed'
                              ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                              : g.status === 'declined'
                              ? 'bg-rose-500/5 border-rose-500/20 text-rose-400'
                              : 'bg-amber-500/5 border-amber-500/20 text-amber-400'
                          }`}
                        >
                          <option value="pending" className="bg-[#151c2c]">Pending</option>
                          <option value="confirmed" className="bg-[#151c2c]">Confirmed</option>
                          <option value="declined" className="bg-[#151c2c]">Declined</option>
                        </select>

                        <button
                          onClick={() => handleDeleteGuest(g.id)}
                          className="p-1.5 rounded-md hover:bg-rose-500/10 text-gray-500 hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right side form and guest statistics */}
            <div className="flex flex-col gap-6 md:col-span-1">
              
              {/* RSVP count summary card */}
              <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col gap-3 shadow-xl">
                <h4 className="text-xs font-bold text-gray-200 pb-2 border-b border-white/5 uppercase tracking-wider">RSVP Overview</h4>
                
                <div className="flex justify-center relative w-24 h-24 mx-auto my-2">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r={rsvpRadius} fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="6" />
                    
                    {/* Yes circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r={rsvpRadius}
                      fill="transparent"
                      stroke="#10b981"
                      strokeWidth="6"
                      strokeDasharray={`${(yesPct / 100) * rsvpCircumference} ${rsvpCircumference}`}
                      className="transition-all duration-300"
                    />
                    {/* Maybe circle overlay */}
                    <circle
                      cx="50"
                      cy="50"
                      r={rsvpRadius}
                      fill="transparent"
                      stroke="#f59e0b"
                      strokeWidth="6"
                      strokeDasharray={`${(maybePct / 100) * rsvpCircumference} ${rsvpCircumference}`}
                      strokeDashoffset={`${-((yesPct / 100) * rsvpCircumference)}`}
                      className="transition-all duration-300"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-black text-white">{totalGuestsSum}</span>
                    <span className="text-[6px] text-gray-500 uppercase tracking-widest font-black leading-none mt-0.5">Invited</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[9px] font-bold">
                  <div className="bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-xl">
                    <span className="text-emerald-400 block uppercase">Yes</span>
                    <span className="text-white text-xs block mt-0.5">{yesRSVP}</span>
                  </div>
                  <div className="bg-amber-500/5 border border-amber-500/10 p-2.5 rounded-xl">
                    <span className="text-amber-400 block uppercase">Maybe</span>
                    <span className="text-white text-xs block mt-0.5">{maybeRSVP}</span>
                  </div>
                  <div className="bg-rose-500/5 border border-rose-500/10 p-2.5 rounded-xl">
                    <span className="text-rose-400 block uppercase">No</span>
                    <span className="text-white text-xs block mt-0.5">{noRSVP}</span>
                  </div>
                </div>
              </div>

              {/* Add guest form */}
              <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col gap-4 shadow-xl">
                <h4 className="text-xs font-bold text-gray-200 pb-2 border-b border-white/5 uppercase tracking-wider">Add Attendee</h4>
                
                <form onSubmit={handleAddGuest} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-500 font-semibold uppercase">Guest Full Name</label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="e.g. Prof. Alan Turing"
                      className="w-full bg-white/3 border border-white/5 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition-all font-semibold"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-500 font-semibold uppercase">Email Address</label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="turing@university.edu"
                      className="w-full bg-white/3 border border-white/5 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition-all font-semibold"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-500 font-semibold uppercase">Initial RSVP Status</label>
                    <select
                      value={guestStatus}
                      onChange={(e) => setGuestStatus(e.target.value)}
                      className="w-full bg-white/3 border border-white/5 rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer font-semibold"
                    >
                      <option value="pending" className="bg-[#151c2c]">Pending</option>
                      <option value="confirmed" className="bg-[#151c2c]">Confirmed (Yes)</option>
                      <option value="declined" className="bg-[#151c2c]">Declined (No)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#5a2bd4] hover:bg-[#6b3ce2] text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/10 cursor-pointer transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Save Attendee
                  </button>
                </form>
              </div>
            </div>

          </div>
        )}

        {/* ================= TASKS TAB ================= */}
        {activeTab === 'tasks' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start animate-fade-in">
            
            {/* Left side checklist */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 md:col-span-2 flex flex-col gap-4 shadow-xl">
              <h3 className="text-xs font-black uppercase tracking-wider text-white border-b border-white/5 pb-2.5 flex justify-between items-center">
                <span>Task Checklist</span>
                <span className="text-[10px] text-gray-500 font-semibold">
                  {checklistTasks.filter(t => t.status === 'completed').length}/{checklistTasks.length} Completed
                </span>
              </h3>

              {checklistTasks.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-12">All clear. No tasks added yet.</p>
              ) : (
                <div className="flex flex-col gap-2.5 max-h-96 overflow-y-auto pr-1">
                  {checklistTasks.map((rawTask) => {
                    const task = parseTask(rawTask);
                    return (
                      <div
                        key={task.id}
                        className={`p-3 rounded-xl border flex justify-between items-center gap-4 transition-all ${
                          task.status === 'completed'
                            ? 'bg-[#0f1d1a]/25 border-emerald-500/10 text-gray-400'
                            : 'bg-white/2 border-white/5 text-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <button
                            onClick={() => handleToggleTaskStatus(task.id, task.status)}
                            className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                              task.status === 'completed'
                                ? 'bg-emerald-500 border-emerald-400 text-[#0d0f14]'
                                : 'border-gray-600 hover:border-indigo-400'
                            }`}
                          >
                            {task.status === 'completed' && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                          </button>
                          
                          <div className="flex items-center gap-3 truncate">
                            <img
                              src={
                                task.assigneeName === 'Self' && user?.avatar
                                  ? user.avatar
                                  : assigneeAvatars[task.assigneeName] || `https://ui-avatars.com/api/?name=${encodeURIComponent(task.assigneeName)}&background=random`
                              }
                              alt={task.assigneeName}
                              className="w-7 h-7 rounded-full border border-white/10 shrink-0 object-cover"
                            />
                            <div className="flex flex-col truncate">
                              <span className={`text-xs font-bold leading-normal truncate ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                                {task.displayName}
                              </span>
                              <div className="flex items-center gap-2 text-[9px] text-gray-500 mt-0.5 font-semibold">
                                <span>Deadline: {new Date(task.deadline).toLocaleDateString()}</span>

                                <span>•</span>
                                <span className="text-gray-400">
                                  {task.assigneeName === 'Self' && user?.name ? `${user.name} (Self)` : task.assigneeName}
                                </span>
                                <span>•</span>
                                <span className={`px-1 rounded text-[8px] uppercase font-bold border ${
                                  task.priority === 'High'
                                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                    : task.priority === 'Medium'
                                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                }`}>
                                  {task.priority}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1.5 rounded-md hover:bg-rose-500/10 text-gray-500 hover:text-rose-400 transition-colors shrink-0 cursor-pointer"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right side form */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 md:col-span-1 flex flex-col gap-4 shadow-xl text-left">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-indigo-500" />
                  <span className="text-sm font-bold text-gray-200 tracking-tight">Add New Task</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setTaskTitle('');
                    setTaskDeadline('');
                    setTaskAssignee('Self');
                    setTaskPriority('Medium');
                    setTaskStatus('To Do');
                  }}
                  className="text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
                  aria-label="Clear Form"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <form onSubmit={handleAddTask} className="flex flex-col gap-4">
                {/* Task Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">TASK NAME</label>
                  <input
                    type="text"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="e.g. Booking the venue stage decorator"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
                    required
                  />
                </div>

                {/* Assigned To */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">ASSIGNED TO</label>
                  <input
                    type="text"
                    placeholder="e.g. Self, Rahul Sharma, etc."
                    value={taskAssignee}
                    onChange={(e) => setTaskAssignee(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
                    required
                  />
                </div>

                {/* Due Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">DUE DATE</label>
                  <input
                    type="date"
                    value={taskDeadline}
                    onChange={(e) => setTaskDeadline(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer font-bold"
                    style={{ colorScheme: theme === 'light' ? 'light' : 'dark' }}
                    required
                  />
                </div>

                {/* Priority & Status in a Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-gray-400 font-bold uppercase">PRIORITY</label>
                    <select
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-gray-300 focus:outline-none focus:border-indigo-500 cursor-pointer font-bold"
                    >
                      <option value="High" className="bg-[#151c2c] text-white">High</option>
                      <option value="Medium" className="bg-[#151c2c] text-white">Medium</option>
                      <option value="Low" className="bg-[#151c2c] text-white">Low</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-gray-400 font-bold uppercase">STATUS</label>
                    <select
                      value={taskStatus}
                      onChange={(e) => setTaskStatus(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-gray-300 focus:outline-none focus:border-indigo-500 cursor-pointer font-bold"
                    >
                      <option value="To Do" className="bg-[#151c2c] text-white">To Do</option>
                      <option value="In Progress" className="bg-[#151c2c] text-white">In Progress</option>
                      <option value="Completed" className="bg-[#151c2c] text-white">Completed</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#5a2bd4] hover:bg-[#6b3ce2] text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/10 cursor-pointer transition-colors uppercase tracking-wider mt-2"
                >
                  ADD TASK
                </button>
              </form>
            </div>

          </div>
        )}

        {/* ================= VENDORS TAB ================= */}
        {activeTab === 'vendors' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start animate-fade-in">
            
            {/* Left side vendors ledger */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 md:col-span-2 flex flex-col gap-4 shadow-xl">
              <h3 className="text-xs font-black uppercase tracking-wider text-white border-b border-white/5 pb-2.5 flex justify-between items-center">
                <span>Hired Suppliers & Vendors</span>
                <span className="text-[10px] text-gray-500 font-semibold">{vendors.length} records</span>
              </h3>

              {vendors.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-12">No suppliers registered for this event yet.</p>
              ) : (
                <div className="flex flex-col gap-2.5 max-h-96 overflow-y-auto pr-1">
                  {vendors.map((v) => (
                    <div
                      key={v.id}
                      className="p-3 rounded-xl bg-white/2 border border-white/5 flex justify-between items-center gap-4 hover:bg-white/4 transition-colors"
                    >
                      <div className="flex flex-col gap-0.5 truncate">
                        <span className="text-xs font-bold text-gray-200">{v.vendor_name}</span>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 font-semibold">
                          <span className="bg-white/5 px-2 py-0.5 rounded text-gray-400">{v.category}</span>
                          <span>•</span>
                          <span className="truncate">{v.contact}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right flex flex-col font-semibold">
                          <span className="text-xs font-bold text-gray-300">{formatRupee(v.cost)}</span>
                          
                          <select
                            value={v.status}
                            onChange={(e) => handleUpdateVendorStatus(v.id, e.target.value)}
                            className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border cursor-pointer mt-0.5 focus:outline-none ${
                              v.status === 'hired'
                                ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                                : v.status === 'completed'
                                ? 'bg-indigo-500/5 border-indigo-500/20 text-indigo-400'
                                : 'bg-amber-500/5 border-amber-500/20 text-amber-400'
                            }`}
                          >
                            <option value="contacted" className="bg-[#151c2c]">Contacted</option>
                            <option value="hired" className="bg-[#151c2c]">Hired</option>
                            <option value="completed" className="bg-[#151c2c]">Completed</option>
                          </select>
                        </div>

                        <button
                          onClick={() => handleDeleteVendor(v.id)}
                          className="p-1.5 rounded-md hover:bg-rose-500/10 text-gray-500 hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right side form */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 md:col-span-1 flex flex-col gap-4 shadow-xl">
              <h4 className="text-xs font-bold text-gray-200 pb-2 border-b border-white/5 uppercase tracking-wider">Hire Supplier</h4>
              
              <form onSubmit={handleAddVendor} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-500 font-semibold uppercase">Choose Vendor Profile</label>
                  <select
                    value={selectedGlobalVendorId}
                    onChange={(e) => handleSelectGlobalVendor(e.target.value)}
                    className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-gray-300 focus:outline-none focus:border-indigo-500/50 cursor-pointer font-semibold"
                  >
                    <option value="" className="bg-[#151c2c] text-gray-400">-- Custom / Manual Entry --</option>
                    {globalVendors.map((v) => (
                      <option key={v.id} value={v.id} className="bg-[#151c2c] text-white">
                        {v.name} ({v.category})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedGlobalVendorId && (
                  (() => {
                    const selected = globalVendors.find(v => String(v.id) === String(selectedGlobalVendorId));
                    if (!selected) return null;
                    return (
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-3 animate-fade-in shadow-inner">
                        <div className="flex justify-between items-start border-b border-white/5 pb-2">
                          <div>
                            <h5 className="text-xs font-bold text-white uppercase tracking-wider">{selected.name}</h5>
                            <span className="text-[9px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full mt-1 inline-block">
                              {selected.category}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5 text-[10px] text-gray-400 font-semibold leading-relaxed">
                          <div className="flex flex-col">
                            <span className="text-[8px] uppercase tracking-wider text-gray-500">Owner Name</span>
                            <span className="text-gray-250 font-bold">{selected.contact_person || 'N/A'}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[8px] uppercase tracking-wider text-gray-500">Phone Number</span>
                            <span className="text-gray-250 font-bold">{selected.phone || 'N/A'}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[8px] uppercase tracking-wider text-gray-500">Email Address</span>
                            <span className="text-gray-250 font-bold truncate">{selected.email || 'N/A'}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[8px] uppercase tracking-wider text-gray-500">Location / Address</span>
                            <span className="text-gray-250 font-bold">Udaipur, Rajasthan</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleAutoFillVendor}
                          className="w-full py-2 bg-[#5a2bd4]/20 hover:bg-[#5a2bd4]/40 border border-[#5a2bd4]/40 text-white font-extrabold text-[10px] rounded-lg tracking-wider transition-all cursor-pointer uppercase flex items-center justify-center gap-1 mt-1"
                        >
                          Select & Auto-Fill Form
                        </button>
                      </div>
                    );
                  })()
                )}

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-500 font-semibold uppercase">Supplier Name</label>
                  <input
                    type="text"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    placeholder="e.g. Delicious Bites Catering"
                    className="w-full bg-white/3 border border-white/5 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition-all font-semibold"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-500 font-semibold uppercase">Category</label>
                    <select
                      value={vendorCategory}
                      onChange={(e) => setVendorCategory(e.target.value)}
                      className="w-full bg-white/3 border border-white/5 rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer font-semibold"
                    >
                      <option value="Caterer" className="bg-[#151c2c]">Caterer</option>
                      <option value="Photographer" className="bg-[#151c2c]">Photographer</option>
                      <option value="Decorator" className="bg-[#151c2c]">Decorator</option>
                      <option value="Florist" className="bg-[#151c2c]">Florist</option>
                      <option value="DJ/Sound" className="bg-[#151c2c]">DJ/Sound</option>
                      <option value="Venue Coordinator" className="bg-[#151c2c]">Coordinator</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-500 font-semibold uppercase">Hiring Fee (₹)</label>
                    <input
                      type="number"
                      value={vendorCost}
                      onChange={(e) => setVendorCost(e.target.value)}
                      placeholder="e.g. 12000"
                      className="w-full bg-white/3 border border-white/5 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition-all font-semibold"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-500 font-semibold uppercase">Owner Name / Contact Person</label>
                  <input
                    type="text"
                    value={vendorOwner}
                    onChange={(e) => setVendorOwner(e.target.value)}
                    placeholder="e.g. Harish Vyas"
                    className="w-full bg-white/3 border border-white/5 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition-all font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-500 font-semibold uppercase">Phone Number</label>
                    <input
                      type="text"
                      value={vendorPhone}
                      onChange={(e) => setVendorPhone(e.target.value)}
                      placeholder="e.g. +91 94140 12345"
                      className="w-full bg-white/3 border border-white/5 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition-all font-semibold"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-500 font-semibold uppercase">Email Address</label>
                    <input
                      type="email"
                      value={vendorEmail}
                      onChange={(e) => setVendorEmail(e.target.value)}
                      placeholder="e.g. name@domain.com"
                      className="w-full bg-white/3 border border-white/5 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition-all font-semibold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#5a2bd4] hover:bg-[#6b3ce2] text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/10 cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Save Supplier
                </button>
              </form>
            </div>

          </div>
        )}

        {/* ================= PAYMENTS TAB ================= */}
        {activeTab === 'payments' && (
          <div className="glass-panel p-6 rounded-2xl border border-white/5 shadow-xl flex flex-col gap-4 animate-fade-in max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/5 pb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-white">Full Transaction Payments Ledger</h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/25">
                  Total Spent: {formatRupee(totalSpent)}
                </span>
                <button
                  onClick={() => setShowAddPaymentModal(true)}
                  className="px-3 py-1.5 bg-[#5a2bd4] hover:bg-[#6b3ce2] text-white text-[10px] font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-md shadow-indigo-600/10"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Payment Transaction
                </button>
              </div>
            </div>

            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-xs text-gray-300 font-medium">
                <thead>
                  <tr className="border-b border-white/5 text-gray-500 font-bold uppercase tracking-wider">
                    <th className="py-3 px-2">Invoice ID</th>
                    <th className="py-3 px-2">Expense / Description</th>
                    <th className="py-3 px-2">Amount Paid</th>
                    <th className="py-3 px-2">Payment Date</th>
                    <th className="py-3 px-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {expenses.length > 0 ? (
                    expenses.map((exp, idx) => {
                      const pay = parsePayment(exp, idx);
                      return (
                        <tr key={pay.id} className="hover:bg-white/1 transition-colors">
                          <td className="py-3 px-2 font-bold text-indigo-400">{pay.invoiceId}</td>
                          <td className="py-3 px-2 text-white">{pay.description}</td>
                          <td className="py-3 px-2 font-bold text-emerald-400">{formatRupee(parseFloat(pay.amount))}</td>
                          <td className="py-3 px-2 text-gray-400">{pay.date}</td>
                          <td className="py-3 px-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                              pay.status === 'Paid'
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : pay.status === 'Pending'
                                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                            }`}>
                              {pay.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr className="text-center">
                      <td colSpan="5" className="py-8 text-xs text-gray-500 font-bold">
                        No transactions recorded yet. Click "Add Payment Transaction" to record one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= NOTES & DOCUMENTS TAB ================= */}
        {activeTab === 'notes_docs' && (
          <div className="max-w-xl mx-auto animate-fade-in w-full">
            
            {/* Notes checklist card */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 shadow-xl flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-white">Coordinator Notes List</h3>
                <span className="text-[10px] text-gray-500 font-semibold">{notes.length} total</span>
              </div>
              
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Type custom note details here..."
                    className="flex-1 bg-white/3 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                  />
                  <button
                    onClick={() => {
                      if (newNote.trim()) {
                        setNotes([...notes, newNote.trim()]);
                        setNewNote('');
                        showToast('Note added!', 'success');
                      }
                    }}
                    className="px-4 bg-[#5a2bd4] hover:bg-[#6b3ce2] text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-col gap-2.5 mt-3">
                  {notes.map((note, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-white/2 border border-white/5 rounded-xl">
                      <p className="text-xs text-gray-300 font-medium leading-relaxed pr-2">{note}</p>
                      <button
                        onClick={() => {
                          setNotes(notes.filter((_, i) => i !== idx));
                          showToast('Note removed', 'info');
                        }}
                        className="text-gray-500 hover:text-rose-400 p-1 cursor-pointer shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* ================= 5. INTERACTIVE POPUP MODALS ================= */}

      {/* Edit Event Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg rounded-2xl border border-white/10 overflow-hidden shadow-2xl flex flex-col animate-scale-in max-h-[90vh]">
            
            <div className="p-4 border-b border-white/5 bg-white/1 flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Edit className="w-4 h-4 text-[#5a2bd4]" /> Edit Event Parameters
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="w-7 h-7 rounded-full hover:bg-white/5 text-gray-400 flex items-center justify-center cursor-pointer border border-transparent hover:border-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditEvent} className="p-5 flex flex-col gap-4 overflow-y-auto">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Event Label Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-white/3 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-all font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Date</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full bg-white/3 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer font-semibold"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Time</label>
                  <input
                    type="time"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className="w-full bg-white/3 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Location / Venue</label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full bg-white/3 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-all font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Guests Capacity Cap</label>
                  <input
                    type="number"
                    value={editGuests}
                    onChange={(e) => setEditGuests(e.target.value)}
                    className="w-full bg-white/3 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-all font-semibold"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Budget Limit (₹)</label>
                  <input
                    type="number"
                    value={editBudget}
                    onChange={(e) => setEditBudget(e.target.value)}
                    className="w-full bg-white/3 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-all font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Event Category</label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    className="w-full bg-white/3 border border-white/5 rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer font-semibold"
                  >
                    {['Wedding', 'Birthday', 'Farewell', 'Corporate', 'Seminar', 'Conference', 'Gala', 'Festival', 'Other'].map(c => (
                      <option key={c} value={c} className="bg-[#151c2c]">{c}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Event Theme Style</label>
                  <input
                    type="text"
                    value={editTheme}
                    onChange={(e) => setEditTheme(e.target.value)}
                    className="w-full bg-white/3 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-all font-semibold"
                  />
                </div>
              </div>

              <div className="p-4 border-t border-white/5 bg-white/1 flex gap-3 justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-white/5 hover:border-white/10 bg-white/3 hover:bg-white/5 text-gray-300 font-bold text-[10px] rounded-xl cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-[#5a2bd4] hover:bg-[#6b3ce2] text-white font-bold text-[10px] rounded-xl shadow-lg cursor-pointer transition-colors flex items-center gap-1"
                >
                  {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Delete Event Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-sm rounded-2xl border border-white/10 p-6 shadow-2xl flex flex-col gap-4 text-center animate-scale-in">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-1">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Delete Event Confirmation</h3>
              <p className="text-xs text-gray-400 leading-relaxed mt-1.5">
                Are you sure you want to delete event <span className="text-white font-bold">"{event.title}"</span>? This will permanently delete the event data, guest RSVP lists, and expense records. This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3 justify-center mt-2 border-t border-white/5 pt-4">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-white/5 hover:border-white/10 bg-white/3 hover:bg-white/5 text-gray-300 font-bold text-[10px] rounded-xl cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteEvent}
                disabled={actionLoading}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] rounded-xl shadow-lg cursor-pointer transition-colors flex items-center gap-1"
              >
                {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Payment Transaction Modal */}
      {showAddPaymentModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-white/10 overflow-hidden shadow-2xl flex flex-col animate-scale-in">
            <div className="p-4 border-b border-white/5 bg-white/1 flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-indigo-400" /> Add Payment Transaction
              </h3>
              <button
                onClick={() => setShowAddPaymentModal(false)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPayment} className="p-5 flex flex-col gap-4 text-left">
              {/* Invoice ID */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Invoice ID</label>
                <input
                  type="text"
                  value={payInvoiceId}
                  onChange={(e) => setPayInvoiceId(e.target.value)}
                  placeholder="e.g. INV-001"
                  className="w-full bg-white/3 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-all font-semibold"
                  required
                />
              </div>

              {/* Expense / Description */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Expense / Description</label>
                <input
                  type="text"
                  value={payDescription}
                  onChange={(e) => setPayDescription(e.target.value)}
                  placeholder="e.g. Catering Deposit, Florist Settlement"
                  className="w-full bg-white/3 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-all font-semibold"
                  required
                />
              </div>

              {/* Amount Paid */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Amount Paid (₹)</label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder="e.g. 15000"
                  className="w-full bg-white/3 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-all font-semibold"
                  min="1"
                  required
                />
              </div>

              {/* Payment Date */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Payment Date</label>
                <input
                  type="date"
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                  className="w-full bg-white/3 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer font-semibold"
                  style={{ colorScheme: theme === 'light' ? 'light' : 'dark' }}
                  required
                />
              </div>

              {/* Status */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Status</label>
                <select
                  value={payStatus}
                  onChange={(e) => setPayStatus(e.target.value)}
                  className="w-full bg-white/3 border border-white/5 rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer font-semibold"
                >
                  <option value="Paid" className="bg-[#151c2c]">Paid</option>
                  <option value="Pending" className="bg-[#151c2c]">Pending</option>
                  <option value="Failed" className="bg-[#151c2c]">Failed</option>
                </select>
              </div>

              <div className="p-4 border-t border-white/5 bg-white/1 flex gap-3 justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPaymentModal(false)}
                  className="px-4 py-2 border border-white/5 hover:border-white/10 bg-white/3 hover:bg-white/5 text-gray-300 font-bold text-[10px] rounded-xl cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#5a2bd4] hover:bg-[#6b3ce2] text-white font-bold text-[10px] rounded-xl shadow-lg cursor-pointer transition-colors"
                >
                  Add Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Suggestions Overlay Modal */}
      {showAISuggestionsModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg rounded-2xl border border-white/10 overflow-hidden shadow-2xl flex flex-col animate-scale-in max-h-[90vh]">
            
            <div className="p-4 border-b border-white/5 bg-white/1 flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                AI Planner Assistant Recommendations
              </h3>
              <button
                onClick={() => setShowAISuggestionsModal(false)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex flex-col gap-5 text-left text-xs">
              {aiLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
                  <span className="text-gray-400 font-semibold animate-pulse">Analyzing event details & generating custom blueprint...</span>
                </div>
              ) : (
                aiSuggestions && (
                  <>
                    {/* Event summary snippet */}
                    <div className="bg-white/3 border border-white/5 rounded-xl p-3.5 flex flex-col gap-1.5">
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Target Event Profile</span>
                      <h4 className="text-sm font-extrabold text-white">{event?.title || 'Your Event'}</h4>
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-400 font-semibold mt-1">
                        <div>Type: <span className="text-gray-200">{event?.event_type || 'Event'}</span></div>
                        <div>Guests: <span className="text-gray-200">{event?.guest_count || 0}</span></div>
                        <div>Budget: <span className="text-amber-400 font-bold">{formatRupee(event?.budget || 0)}</span></div>
                        <div>Theme: <span className="text-gray-200">{event?.theme || 'Standard'}</span></div>
                      </div>
                    </div>

                    {/* AI Suggestions checklist */}
                    <div className="flex flex-col gap-2.5">
                      <h4 className="font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-1">
                        <CheckSquare className="w-4 h-4 text-[#10b981]" /> Generated Planning Checklist
                      </h4>
                      <ul className="flex flex-col gap-2 text-gray-300 font-medium">
                        {aiSuggestions.checklist && aiSuggestions.checklist.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 bg-white/1 px-3 py-2 border border-white/5 rounded-lg leading-relaxed">
                            <span className="text-[#10b981] font-black">•</span>
                            <span>{renderItemSafely(item)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* AI Theme & Decor suggestions */}
                    <div className="flex flex-col gap-2.5">
                      <h4 className="font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-1">
                        <Palette className="w-4 h-4 text-purple-400" /> Decorative & Theme Concept
                      </h4>
                      <p className="text-gray-300 bg-white/1 p-3 border border-white/5 rounded-lg leading-relaxed font-medium">
                        {renderItemSafely(aiSuggestions.decor)}
                      </p>
                    </div>

                    {/* AI Udaipur Vendor matches */}
                    <div className="flex flex-col gap-2.5">
                      <h4 className="font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-1">
                        <Users className="w-4 h-4 text-indigo-400" /> Local Udaipur Vendor Recommendations
                      </h4>
                      <p className="text-gray-300 bg-white/1 p-3 border border-white/5 rounded-lg leading-relaxed font-medium">
                        {renderItemSafely(aiSuggestions.vendors)}
                      </p>
                    </div>

                    {/* AI Budget optimization tips */}
                    <div className="flex flex-col gap-2.5">
                      <h4 className="font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-1">
                        <Receipt className="w-4 h-4 text-amber-400" /> Budget Allocation Advice
                      </h4>
                      <div className="text-gray-300 bg-amber-500/5 border border-amber-500/10 p-3 rounded-lg leading-relaxed font-semibold">
                        {renderItemSafely(aiSuggestions.budgetTip)}
                      </div>
                    </div>
                  </>
                )
              )}
            </div>

            <div className="p-4 border-t border-white/5 bg-white/1 flex justify-end gap-2 shrink-0">
              <button
                onClick={() => setShowAISuggestionsModal(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors"
              >
                Close Suggestions
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
