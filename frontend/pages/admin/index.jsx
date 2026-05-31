import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Calendar,
  Users,
  Building,
  Receipt,
  Star,
  CheckSquare,
  MessageSquare,
  TrendingUp,
  Bell,
  Settings,
  Mail,
  Search,
  ChevronDown,
  ChevronRight,
  TrendingDown,
  ArrowUpRight,
  ShieldCheck,
  Edit,
  Trash2,
  Clock,
  UserCheck,
  Activity,
  Plus,
  Filter,
  Check,
  UserX,
  CreditCard,
  Send,
  Sliders,
  Eye,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Pause,
  Download,
  Smile,
  Meh,
  Frown
} from 'lucide-react';

const formatEventDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const day = date.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

const formatEventTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${ampm}`;
};

const formatFeedbackDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const day = date.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
};

export default function AdminDashboard() {
  const router = useRouter();
  const { user, authFetch, loading: authLoading } = useAuth();
  const { showToast } = useNotifications();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Active query-based tab switcher
  const [activeTab, setActiveTab] = useState('dashboard');

  // DB States
  const [events, setEvents] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States for Events Tab
  const [eventSearchQuery, setEventSearchQuery] = useState('');
  const [eventStatusFilter, setEventStatusFilter] = useState('All');
  const [eventTypeFilter, setEventTypeFilter] = useState('All');
  const [eventCurrentPage, setEventCurrentPage] = useState(1);
  const [eventPageSize, setEventPageSize] = useState(10);

  // Filter States for Users Tab
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('All');
  const [userStatusFilter, setUserStatusFilter] = useState('All');
  const [userCurrentPage, setUserCurrentPage] = useState(1);
  const [userPageSize, setUserPageSize] = useState(10);

  // Edit Event State
  const [editingEvent, setEditingEvent] = useState(null);
  const [activeUserMenuId, setActiveUserMenuId] = useState(null);

  // Filter States for Venues Tab
  const [venueSearchQuery, setVenueSearchQuery] = useState('');
  const [venueStatusFilter, setVenueStatusFilter] = useState('All');
  const [venueTypeFilter, setVenueTypeFilter] = useState('All');
  const [venueCurrentPage, setVenueCurrentPage] = useState(1);
  const [venuePageSize, setVenuePageSize] = useState(10);
  
  // Modals / Dropdowns for Venues Tab
  const [activeVenueMenuId, setActiveVenueMenuId] = useState(null);
  const [isAddVenueModalOpen, setIsAddVenueModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [newVenueData, setNewVenueData] = useState({
    name: '',
    location: '',
    event_type: 'hotel',
    guest_count: 200,
    status: 'active',
    image: '/udaipur_palace.png'
  });

  // Seeded list of 8 mockup venues matching the mockup image exactly
  const [venuesList, setVenuesList] = useState([
    {
      id: 1,
      name: 'The Leela Palace',
      location: 'Lake Pichola, Udaipur',
      event_type: 'hotel',
      guest_count: 500,
      status: 'active',
      created_at: '2024-04-10T10:00:00.000Z',
      image: '/udaipur_palace.png'
    },
    {
      id: 2,
      name: 'Radisson Blu',
      location: 'Rajasthani Street, Udaipur',
      event_type: 'hotel',
      guest_count: 350,
      status: 'active',
      created_at: '2024-04-12T10:00:00.000Z',
      image: '/services_venues.png'
    },
    {
      id: 3,
      name: 'Fateh Garh Resort',
      location: 'Sukher, Udaipur',
      event_type: 'resort',
      guest_count: 300,
      status: 'active',
      created_at: '2024-04-15T10:00:00.000Z',
      image: '/udaipur_palace_light.png'
    },
    {
      id: 4,
      name: 'Hotel Lakend',
      location: 'Fateh Sagar Lake, Udaipur',
      event_type: 'hotel',
      guest_count: 250,
      status: 'inactive',
      created_at: '2024-04-18T10:00:00.000Z',
      image: '/celebrate_collage1.png'
    },
    {
      id: 5,
      name: 'Shiv Niwas Palace',
      location: 'The City Palace, Udaipur',
      event_type: 'palace',
      guest_count: 200,
      status: 'active',
      created_at: '2024-04-20T10:00:00.000Z',
      image: '/celebrate_collage2.png'
    },
    {
      id: 6,
      name: 'The Grand Royal Palace',
      location: 'Delhi Road, Udaipur',
      event_type: 'banquet',
      guest_count: 600,
      status: 'active',
      created_at: '2024-04-22T10:00:00.000Z',
      image: '/landing_wedding.png'
    },
    {
      id: 7,
      name: 'Royal Retreat Resort',
      location: 'Kodiyat, Udaipur',
      event_type: 'resort',
      guest_count: 400,
      status: 'active',
      created_at: '2024-04-25T10:00:00.000Z',
      image: '/services_scenarios.png'
    },
    {
      id: 8,
      name: 'Jagmandir Island Palace',
      location: 'Lake Pichola, Udaipur',
      event_type: 'palace',
      guest_count: 150,
      status: 'inactive',
      created_at: '2024-04-28T10:00:00.000Z',
      image: '/landing_custom.png'
    }
  ]);

  // Filter States for Reports Tab
  const [reportEventFilter, setReportEventFilter] = useState('All');
  const [reportVenueFilter, setReportVenueFilter] = useState('All');
  const [reportVendorFilter, setReportVendorFilter] = useState('All');
  const [reportStartDate, setReportStartDate] = useState('2026-05-01');
  const [reportEndDate, setReportEndDate] = useState('2026-05-31');

  // Filter States for Feedback Tab
  const [feedbackSearchQuery, setFeedbackSearchQuery] = useState('');
  const [feedbackTypeFilter, setFeedbackTypeFilter] = useState('All');
  const [feedbackRatingFilter, setFeedbackRatingFilter] = useState('All');
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState('All');
  const [feedbackStartDate, setFeedbackStartDate] = useState('');
  const [feedbackEndDate, setFeedbackEndDate] = useState('');
  const [feedbackCurrentPage, setFeedbackCurrentPage] = useState(1);
  const [feedbackPageSize, setFeedbackPageSize] = useState(10);

  // Filter States for Bookings Tab
  const [bookingSearchQuery, setBookingSearchQuery] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('All');
  const [bookingEventFilter, setBookingEventFilter] = useState('All');
  const [bookingCurrentPage, setBookingCurrentPage] = useState(1);
  const [bookingPageSize, setBookingPageSize] = useState(10);
  const [activeBookingMenuId, setActiveBookingMenuId] = useState(null);

  // Filter States for Vendors Tab
  const [vendorSearchQuery, setVendorSearchQuery] = useState('');
  const [vendorCategoryFilter, setVendorCategoryFilter] = useState('All');
  const [vendorStatusFilter, setVendorStatusFilter] = useState('All');
  const [vendorCurrentPage, setVendorCurrentPage] = useState(1);
  const [vendorPageSize, setVendorPageSize] = useState(10);
  
  // Modals / Dropdowns for Vendors Tab
  const [activeVendorMenuId, setActiveVendorMenuId] = useState(null);
  const [isAddVendorModalOpen, setIsAddVendorModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [newVendorData, setNewVendorData] = useState({
    name: '',
    category: 'Catering',
    contact_person: '',
    phone: '',
    email: '',
    status: 'active',
    image: '/udaipur_palace.png'
  });

  // Seeded list of 8 custom mockup vendors matching layout but NOT image data
  const [vendorsList, setVendorsList] = useState([
    {
      id: 1,
      name: 'Apex Sound & Lights',
      category: 'Entertainment',
      contact_person: 'Harish Vyas',
      phone: '+91 94140 12345',
      email: 'contact@apexsound.com',
      status: 'active',
      created_at: '2024-04-11T10:00:00.000Z',
      image: '/celebrate_collage1.png'
    },
    {
      id: 2,
      name: 'Royal Decorators',
      category: 'Decoration',
      contact_person: 'Vikram Singh',
      phone: '+91 82900 67890',
      email: 'vikram@royaldecor.com',
      status: 'active',
      created_at: '2024-04-13T10:00:00.000Z',
      image: '/udaipur_palace_light.png'
    },
    {
      id: 3,
      name: 'Marwar Catering Services',
      category: 'Catering',
      contact_person: 'Ramesh Patel',
      phone: '+91 98290 11223',
      email: 'info@marwarcatering.com',
      status: 'active',
      created_at: '2024-04-16T10:00:00.000Z',
      image: '/udaipur_palace.png'
    },
    {
      id: 4,
      name: 'Lakeside Photography',
      category: 'Photography',
      contact_person: 'Priya Sharma',
      phone: '+91 99280 44556',
      email: 'priya@lakesidephoto.com',
      status: 'active',
      created_at: '2024-04-17T10:00:00.000Z',
      image: '/services_venues.png'
    },
    {
      id: 5,
      name: 'Udaipur Event Management',
      category: 'Event Planner',
      contact_person: 'Amit Mehta',
      phone: '+91 70140 77889',
      email: 'info@udaipurevents.com',
      status: 'inactive',
      created_at: '2024-04-19T10:00:00.000Z',
      image: '/landing_wedding.png'
    },
    {
      id: 6,
      name: 'Heritage Travels',
      category: 'Transport',
      contact_person: 'Sanjay Jain',
      phone: '+91 94600 33445',
      email: 'bookings@heritagetravels.com',
      status: 'active',
      created_at: '2024-04-21T10:00:00.000Z',
      image: '/celebrate_collage2.png'
    },
    {
      id: 7,
      name: 'Sweet Delights Bakery',
      category: 'Catering',
      contact_person: 'Divya Joshi',
      phone: '+91 94130 99887',
      email: 'orders@sweetdelights.com',
      status: 'active',
      created_at: '2024-04-23T10:00:00.000Z',
      image: '/services_scenarios.png'
    },
    {
      id: 8,
      name: 'Udaipur Tent & Stage',
      category: 'Equipment',
      contact_person: 'Suresh Sen',
      phone: '+91 98870 55667',
      email: 'contact@udaipurtent.com',
      status: 'inactive',
      created_at: '2024-04-26T10:00:00.000Z',
      image: '/landing_custom.png'
    }
  ]);

  const [activeSettingsTab, setActiveSettingsTab] = useState('general');

  // General Settings States
  const [siteTitle, setSiteTitle] = useState('JAGAH');
  const [siteTagline, setSiteTagline] = useState('Plan. Organize. Celebrate.');
  const [siteEmail, setSiteEmail] = useState('info@aieventplanner.com');
  const [sitePhone, setSitePhone] = useState('+91 98765 43210');
  const [siteAddress, setSiteAddress] = useState('45, Saheli Marg, Udaipur, Rajasthan, India - 313001');
  const [siteAbout, setSiteAbout] = useState('JAGAH is an all-in-one platform to manage events, venues, vendors, bookings and payments seamlessly.');
  const [siteThemeColor, setSiteThemeColor] = useState('#6C3AED');
  const [siteLanguage, setSiteLanguage] = useState('English');
  const [siteCurrency, setSiteCurrency] = useState('INR (₹)');
  const [siteTimezone, setSiteTimezone] = useState('(GMT+05:30) Asia/Kolkata');
  const [siteDateFormat, setSiteDateFormat] = useState('DD MMM YYYY (10 Apr 2024)');
  const [siteTimeFormat, setSiteTimeFormat] = useState('12 Hour (hh:mm AM/PM)');
  const [siteWeekStartsOn, setSiteWeekStartsOn] = useState('Monday');

  // Email Settings States
  const [smtpHost, setSmtpHost] = useState('smtp.mailtrap.io');
  const [smtpPort, setSmtpPort] = useState('2525');
  const [smtpUsername, setSmtpUsername] = useState('api-key-user');
  const [smtpPassword, setSmtpPassword] = useState('••••••••••••••••');
  const [smtpEncryption, setSmtpEncryption] = useState('TLS');
  const [smtpSenderName, setSmtpSenderName] = useState('JAGAH Support');
  const [smtpSenderEmail, setSmtpSenderEmail] = useState('noreply@aieventplanner.com');

  // Payment Settings States
  const [stripePublicKey, setStripePublicKey] = useState('pk_test_51N2...3u98');
  const [stripeSecretKey, setStripeSecretKey] = useState('sk_test_51N2...8y4w');
  const [razorpayKeyId, setRazorpayKeyId] = useState('rzp_test_9A...bC2d');
  const [razorpayKeySecret, setRazorpayKeySecret] = useState('••••••••••••••••••••••••');
  const [paymentSandboxMode, setPaymentSandboxMode] = useState(true);

  // Notification Settings States
  const [notifyEmailEnabled, setNotifyEmailEnabled] = useState(true);
  const [notifyPushEnabled, setNotifyPushEnabled] = useState(false);
  const [notifyOnBookingCreated, setNotifyOnBookingCreated] = useState(true);
  const [notifyOnPaymentReceived, setNotifyOnPaymentReceived] = useState(true);
  const [notifyOnEventUpdated, setNotifyOnEventUpdated] = useState(false);
  const [notifyOnLowBudgetAlert, setNotifyOnLowBudgetAlert] = useState(true);

  // System Settings States
  const [systemMaintenanceMode, setSystemMaintenanceMode] = useState(false);
  const [systemDebugMode, setSystemDebugMode] = useState(true);
  const [systemAllowRegistration, setSystemAllowRegistration] = useState(true);
  const [systemMaxUploadSize, setSystemMaxUploadSize] = useState('10 MB');
  const [systemCacheTimeout, setSystemCacheTimeout] = useState('60 Min');

  // Backup Settings States
  const [backupsList, setBackupsList] = useState([
    { id: 1, filename: 'database_backup_2026_05_25.sql', size: '2.4 MB', date: '25 May 2026, 02:30 AM' },
    { id: 2, filename: 'database_backup_2026_05_20.sql', size: '2.3 MB', date: '20 May 2026, 02:30 AM' }
  ]);

  // Load saved settings from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSiteTitle = localStorage.getItem('siteTitle');
      if (savedSiteTitle) setSiteTitle(savedSiteTitle);
      const savedSiteTagline = localStorage.getItem('siteTagline');
      if (savedSiteTagline) setSiteTagline(savedSiteTagline);
      const savedSiteEmail = localStorage.getItem('siteEmail');
      if (savedSiteEmail) setSiteEmail(savedSiteEmail);
      const savedSitePhone = localStorage.getItem('sitePhone');
      if (savedSitePhone) setSitePhone(savedSitePhone);
      const savedSiteAddress = localStorage.getItem('siteAddress');
      if (savedSiteAddress) setSiteAddress(savedSiteAddress);
      const savedSiteAbout = localStorage.getItem('siteAbout');
      if (savedSiteAbout) setSiteAbout(savedSiteAbout);
      const savedSiteThemeColor = localStorage.getItem('siteThemeColor');
      if (savedSiteThemeColor) setSiteThemeColor(savedSiteThemeColor);
      const savedSiteLanguage = localStorage.getItem('siteLanguage');
      if (savedSiteLanguage) setSiteLanguage(savedSiteLanguage);
      const savedSiteCurrency = localStorage.getItem('siteCurrency');
      if (savedSiteCurrency) setSiteCurrency(savedSiteCurrency);
      const savedSiteTimezone = localStorage.getItem('siteTimezone');
      if (savedSiteTimezone) setSiteTimezone(savedSiteTimezone);
      const savedSiteDateFormat = localStorage.getItem('siteDateFormat');
      if (savedSiteDateFormat) setSiteDateFormat(savedSiteDateFormat);
      const savedSiteTimeFormat = localStorage.getItem('siteTimeFormat');
      if (savedSiteTimeFormat) setSiteTimeFormat(savedSiteTimeFormat);
      const savedSiteWeekStartsOn = localStorage.getItem('siteWeekStartsOn');
      if (savedSiteWeekStartsOn) setSiteWeekStartsOn(savedSiteWeekStartsOn);

      const savedSmtpHost = localStorage.getItem('smtpHost');
      if (savedSmtpHost) setSmtpHost(savedSmtpHost);
      const savedSmtpPort = localStorage.getItem('smtpPort');
      if (savedSmtpPort) setSmtpPort(savedSmtpPort);
      const savedSmtpUsername = localStorage.getItem('smtpUsername');
      if (savedSmtpUsername) setSmtpUsername(savedSmtpUsername);
      const savedSmtpPassword = localStorage.getItem('smtpPassword');
      if (savedSmtpPassword) setSmtpPassword(savedSmtpPassword);
      const savedSmtpEncryption = localStorage.getItem('smtpEncryption');
      if (savedSmtpEncryption) setSmtpEncryption(savedSmtpEncryption);
      const savedSmtpSenderName = localStorage.getItem('smtpSenderName');
      if (savedSmtpSenderName) setSmtpSenderName(savedSmtpSenderName);
      const savedSmtpSenderEmail = localStorage.getItem('smtpSenderEmail');
      if (savedSmtpSenderEmail) setSmtpSenderEmail(savedSmtpSenderEmail);

      const savedStripePublicKey = localStorage.getItem('stripePublicKey');
      if (savedStripePublicKey) setStripePublicKey(savedStripePublicKey);
      const savedStripeSecretKey = localStorage.getItem('stripeSecretKey');
      if (savedStripeSecretKey) setStripeSecretKey(savedStripeSecretKey);
      const savedRazorpayKeyId = localStorage.getItem('razorpayKeyId');
      if (savedRazorpayKeyId) setRazorpayKeyId(savedRazorpayKeyId);
      const savedRazorpayKeySecret = localStorage.getItem('razorpayKeySecret');
      if (savedRazorpayKeySecret) setRazorpayKeySecret(savedRazorpayKeySecret);
      const savedPaymentSandboxMode = localStorage.getItem('paymentSandboxMode');
      if (savedPaymentSandboxMode) setPaymentSandboxMode(savedPaymentSandboxMode === 'true');

      const savedNotifyEmailEnabled = localStorage.getItem('notifyEmailEnabled');
      if (savedNotifyEmailEnabled) setNotifyEmailEnabled(savedNotifyEmailEnabled === 'true');
      const savedNotifyPushEnabled = localStorage.getItem('notifyPushEnabled');
      if (savedNotifyPushEnabled) setNotifyPushEnabled(savedNotifyPushEnabled === 'true');
      const savedNotifyOnBookingCreated = localStorage.getItem('notifyOnBookingCreated');
      if (savedNotifyOnBookingCreated) setNotifyOnBookingCreated(savedNotifyOnBookingCreated === 'true');
      const savedNotifyOnPaymentReceived = localStorage.getItem('notifyOnPaymentReceived');
      if (savedNotifyOnPaymentReceived) setNotifyOnPaymentReceived(savedNotifyOnPaymentReceived === 'true');
      const savedNotifyOnEventUpdated = localStorage.getItem('notifyOnEventUpdated');
      if (savedNotifyOnEventUpdated) setNotifyOnEventUpdated(savedNotifyOnEventUpdated === 'true');
      const savedNotifyOnLowBudgetAlert = localStorage.getItem('notifyOnLowBudgetAlert');
      if (savedNotifyOnLowBudgetAlert) setNotifyOnLowBudgetAlert(savedNotifyOnLowBudgetAlert === 'true');

      const savedSystemMaintenanceMode = localStorage.getItem('systemMaintenanceMode');
      if (savedSystemMaintenanceMode) setSystemMaintenanceMode(savedSystemMaintenanceMode === 'true');
      const savedSystemDebugMode = localStorage.getItem('systemDebugMode');
      if (savedSystemDebugMode) setSystemDebugMode(savedSystemDebugMode === 'true');
      const savedSystemAllowRegistration = localStorage.getItem('systemAllowRegistration');
      if (savedSystemAllowRegistration) setSystemAllowRegistration(savedSystemAllowRegistration === 'true');
      const savedSystemMaxUploadSize = localStorage.getItem('systemMaxUploadSize');
      if (savedSystemMaxUploadSize) setSystemMaxUploadSize(savedSystemMaxUploadSize);
      const savedSystemCacheTimeout = localStorage.getItem('systemCacheTimeout');
      if (savedSystemCacheTimeout) setSystemCacheTimeout(savedSystemCacheTimeout);

      const savedBackupsList = localStorage.getItem('backupsList');
      if (savedBackupsList) setBackupsList(JSON.parse(savedBackupsList));
    }
  }, []);

  const handleSaveGeneralSettings = (e) => {
    e.preventDefault();
    localStorage.setItem('siteTitle', siteTitle);
    localStorage.setItem('siteTagline', siteTagline);
    localStorage.setItem('siteEmail', siteEmail);
    localStorage.setItem('sitePhone', sitePhone);
    localStorage.setItem('siteAddress', siteAddress);
    localStorage.setItem('siteAbout', siteAbout);
    localStorage.setItem('siteThemeColor', siteThemeColor);
    localStorage.setItem('siteLanguage', siteLanguage);
    localStorage.setItem('siteCurrency', siteCurrency);
    localStorage.setItem('siteTimezone', siteTimezone);
    localStorage.setItem('siteDateFormat', siteDateFormat);
    localStorage.setItem('siteTimeFormat', siteTimeFormat);
    localStorage.setItem('siteWeekStartsOn', siteWeekStartsOn);
    showToast('General settings saved successfully!', 'success');
  };

  const handleSaveEmailSettings = (e) => {
    e.preventDefault();
    localStorage.setItem('smtpHost', smtpHost);
    localStorage.setItem('smtpPort', smtpPort);
    localStorage.setItem('smtpUsername', smtpUsername);
    localStorage.setItem('smtpPassword', smtpPassword);
    localStorage.setItem('smtpEncryption', smtpEncryption);
    localStorage.setItem('smtpSenderName', smtpSenderName);
    localStorage.setItem('smtpSenderEmail', smtpSenderEmail);
    showToast('Email settings saved successfully!', 'success');
  };

  const handleSavePaymentSettings = (e) => {
    e.preventDefault();
    localStorage.setItem('stripePublicKey', stripePublicKey);
    localStorage.setItem('stripeSecretKey', stripeSecretKey);
    localStorage.setItem('razorpayKeyId', razorpayKeyId);
    localStorage.setItem('razorpayKeySecret', razorpayKeySecret);
    localStorage.setItem('paymentSandboxMode', paymentSandboxMode.toString());
    showToast('Payment settings saved successfully!', 'success');
  };

  const handleSaveNotificationSettings = (e) => {
    e.preventDefault();
    localStorage.setItem('notifyEmailEnabled', notifyEmailEnabled.toString());
    localStorage.setItem('notifyPushEnabled', notifyPushEnabled.toString());
    localStorage.setItem('notifyOnBookingCreated', notifyOnBookingCreated.toString());
    localStorage.setItem('notifyOnPaymentReceived', notifyOnPaymentReceived.toString());
    localStorage.setItem('notifyOnEventUpdated', notifyOnEventUpdated.toString());
    localStorage.setItem('notifyOnLowBudgetAlert', notifyOnLowBudgetAlert.toString());
    showToast('Notification settings saved successfully!', 'success');
  };

  const handleSaveSystemSettings = (e) => {
    e.preventDefault();
    localStorage.setItem('systemMaintenanceMode', systemMaintenanceMode.toString());
    localStorage.setItem('systemDebugMode', systemDebugMode.toString());
    localStorage.setItem('systemAllowRegistration', systemAllowRegistration.toString());
    localStorage.setItem('systemMaxUploadSize', systemMaxUploadSize);
    localStorage.setItem('systemCacheTimeout', systemCacheTimeout);
    showToast('System settings saved successfully!', 'success');
  };

  const handleCreateBackup = () => {
    const newId = backupsList.length > 0 ? Math.max(...backupsList.map(b => b.id)) + 1 : 1;
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const filename = `database_backup_${now.getFullYear()}_${pad(now.getMonth()+1)}_${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}.sql`;
    
    const day = now.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    let hours = now.getHours();
    const minutes = pad(now.getMinutes());
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedDate = `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;

    const newBackup = {
      id: newId,
      filename,
      size: `${(Math.random() * 2 + 1).toFixed(1)} MB`,
      date: formattedDate
    };

    const updatedList = [newBackup, ...backupsList];
    setBackupsList(updatedList);
    localStorage.setItem('backupsList', JSON.stringify(updatedList));
    showToast(`Backup "${filename}" created successfully!`, 'success');
  };

  const handleDeleteBackup = (id, filename) => {
    if (confirm(`Are you sure you want to delete the backup file "${filename}"?`)) {
      const updatedList = backupsList.filter(b => b.id !== id);
      setBackupsList(updatedList);
      localStorage.setItem('backupsList', JSON.stringify(updatedList));
      showToast(`Backup "${filename}" deleted!`, 'success');
    }
  };

  const handleRestoreBackup = (filename) => {
    if (confirm(`WARNING: Restoring backup "${filename}" will overwrite all current system records. Are you sure you want to continue?`)) {
      showToast(`Restoring from backup "${filename}"...`, 'info');
      setTimeout(() => {
        showToast(`System restored to backup snapshot successfully!`, 'success');
      }, 1500);
    }
  };

  const handleSendTestEmail = () => {
    const emailTarget = prompt("Enter email address to send a test message to:", siteEmail);
    if (emailTarget) {
      showToast(`Sending test SMTP mail connection to ${emailTarget}...`, 'info');
      setTimeout(() => {
        showToast(`Test email successfully sent to ${emailTarget}!`, 'success');
      }, 1200);
    }
  };

  // Sync tab with router query parameter
  useEffect(() => {
    if (router.query.tab) {
      setActiveTab(router.query.tab);
    } else {
      setActiveTab('dashboard');
    }
  }, [router.query.tab]);

  // Fetch metrics & records from system database
  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [uRes, eRes, fRes] = await Promise.all([
        authFetch('/admin/users'),
        authFetch('/events'),
        authFetch('/feedback')
      ]);

      if (uRes.ok && eRes.ok && fRes.ok) {
        const uData = await uRes.json();
        const eData = await eRes.json();
        const fData = await fRes.json();
        setUsersList(uData);
        setEvents(eData);
        setFeedbacks(fData);
      }
    } catch (err) {
      console.error('Error fetching administrative data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Redirect guard
  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'admin') {
        router.replace('/dashboard');
      } else {
        fetchAdminData();
      }
    }
  }, [user, authLoading]);

  // User Management Actions
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
    if (userId === user?.id) {
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

  // Venue Management Actions
  const handleToggleVenueStatus = (venueId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    setVenuesList(prev => prev.map(v => v.id === venueId ? { ...v, status: nextStatus } : v));
    showToast(`Venue status updated to ${nextStatus}`, 'success');
  };

  const handleDeleteVenue = (venueId, name) => {
    if (!window.confirm(`Are you sure you want to delete venue "${name}"?`)) {
      return;
    }
    setVenuesList(prev => prev.filter(v => v.id !== venueId));
    showToast(`Deleted venue "${name}"`, 'success');
  };

  const handleSaveVenue = (e) => {
    e.preventDefault();
    if (editingVenue) {
      setVenuesList(prev => prev.map(v => v.id === editingVenue.id ? { 
        ...editingVenue,
        guest_count: parseInt(editingVenue.guest_count)
      } : v));
      showToast(`Venue details updated successfully`, 'success');
      setEditingVenue(null);
    }
  };

  const handleAddVenue = (e, newVenueData) => {
    e.preventDefault();
    const newId = venuesList.length > 0 ? Math.max(...venuesList.map(v => v.id)) + 1 : 1;
    const newVenue = {
      id: newId,
      name: newVenueData.name,
      location: newVenueData.location,
      event_type: newVenueData.event_type,
      guest_count: parseInt(newVenueData.guest_count) || 200,
      status: newVenueData.status || 'active',
      created_at: newVenueData.created_at || new Date().toISOString(),
      image: newVenueData.image || '/udaipur_palace.png'
    };
    setVenuesList(prev => [newVenue, ...prev]);
    showToast(`New venue "${newVenue.name}" added successfully`, 'success');
    setIsAddVenueModalOpen(false);
  };

  // Vendor Management Actions
  const handleToggleVendorStatus = (vendorId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    setVendorsList(prev => prev.map(v => v.id === vendorId ? { ...v, status: nextStatus } : v));
    showToast(`Vendor status updated to ${nextStatus}`, 'success');
  };

  const handleDeleteVendor = (vendorId, name) => {
    if (!window.confirm(`Are you sure you want to delete vendor "${name}"?`)) {
      return;
    }
    setVendorsList(prev => prev.filter(v => v.id !== vendorId));
    showToast(`Deleted vendor "${name}"`, 'success');
  };

  const handleSaveVendor = (e) => {
    e.preventDefault();
    if (editingVendor) {
      setVendorsList(prev => prev.map(v => v.id === editingVendor.id ? { 
        ...editingVendor
      } : v));
      showToast(`Vendor details updated successfully`, 'success');
      setEditingVendor(null);
    }
  };

  const handleAddVendor = (e, data) => {
    e.preventDefault();
    const newId = vendorsList.length > 0 ? Math.max(...vendorsList.map(v => v.id)) + 1 : 1;
    const newVendor = {
      id: newId,
      name: data.name,
      category: data.category,
      contact_person: data.contact_person,
      phone: data.phone,
      email: data.email,
      status: data.status || 'active',
      created_at: data.created_at || new Date().toISOString(),
      image: data.image || '/celebrate_collage1.png'
    };
    setVendorsList(prev => [newVendor, ...prev]);
    showToast(`New vendor "${newVendor.name}" added successfully`, 'success');
    setIsAddVendorModalOpen(false);
  };

  // Booking Management Actions
  const handleUpdateBookingStatus = async (eventId, newStatus) => {
    let mappedStatus = 'planning';
    if (newStatus === 'confirmed') mappedStatus = 'approved';
    else if (newStatus === 'cancelled') mappedStatus = 'cancelled';
    
    // Find the event in the events list
    const ev = events.find(e => e.id === eventId);
    
    if (typeof eventId === 'string' && eventId.startsWith('m')) {
      // It's a mock event
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, status: mappedStatus } : e));
      showToast(`Mock booking status updated to "${newStatus}"`, 'success');
      return;
    }

    if (!ev) {
      // Fallback if not found in db events (e.g. if we are using mock lists)
      showToast(`Event not found in database`, 'error');
      return;
    }

    try {
      const res = await authFetch(`/update-event/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...ev,
          status: mappedStatus
        })
      });
      if (res.ok) {
        showToast(`Booking status updated to "${newStatus}"`, 'success');
        setEvents(prev => prev.map(e => e.id === eventId ? { ...e, status: mappedStatus } : e));
      } else {
        const errData = await res.json();
        showToast(errData.message || 'Error updating booking status', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Event Management Actions
  const handleUpdateEventStatus = async (eventId, newStatus) => {
    const ev = events.find(e => e.id === eventId);
    if (!ev) return;
    try {
      const res = await authFetch(`/update-event/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...ev,
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
    if (!window.confirm(`Are you sure you want to delete event "${title}"?`)) {
      return;
    }
    try {
      const res = await authFetch(`/delete-event/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(`Deleted event: "${title}"`, 'success');
        setEvents(prev => prev.filter(e => e.id !== id));
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-xs text-gray-500">
        <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        <p>Loading Admin Portal Database...</p>
      </div>
    );
  }

  // Seeding high-fidelity values exactly matching the system database data
  const displayEvents = events.length;
  const displayUsers = usersList.length;
  const displayVenues = venuesList.length;
  const displayVendors = vendorsList.length;
  const totalConfirmedRevenue = events
    .filter(e => e.status === 'approved' || e.status === 'ongoing' || e.status === 'completed')
    .reduce((sum, e) => sum + parseFloat(e.budget || 0), 0);
  const displayRevenue = `₹ ${totalConfirmedRevenue.toLocaleString()}`;

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getInitialsColor = (initials) => {
    const colors = {
      'RS': 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      'PV': 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
      'AS': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      'NP': 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
      'VJ': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      'SK': 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      'MJ': 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
      'AB': 'bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20',
      'DK': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      'SC': 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
    };
    return colors[initials] || 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
  };

  const filteredUsers = usersList.filter(u => {
    const query = userSearchQuery.toLowerCase();
    const matchesSearch = 
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      (u.phone && u.phone.includes(query));

    let matchesRole = true;
    if (userRoleFilter !== 'All') {
      matchesRole = u.role.toLowerCase() === userRoleFilter.toLowerCase();
    }

    let matchesStatus = true;
    if (userStatusFilter !== 'All') {
      const mappedStatus = u.status === 'blocked' ? 'inactive' : 'active';
      matchesStatus = mappedStatus === userStatusFilter.toLowerCase();
    }

    return matchesSearch && matchesRole && matchesStatus;
  });

  const userTotalPages = Math.max(1, Math.ceil(filteredUsers.length / userPageSize));
  const userStartIndex = (userCurrentPage - 1) * userPageSize;
  const paginatedUsers = filteredUsers.slice(userStartIndex, userStartIndex + userPageSize);

  const userShowingFrom = filteredUsers.length === 0 ? 0 : userStartIndex + 1;
  const userShowingTo = Math.min(userStartIndex + userPageSize, filteredUsers.length);

  const displayTotalUsersCount = usersList.length;
  const displayActiveUsersCount = usersList.filter(u => u.status !== 'blocked').length;
  const displayInactiveUsersCount = usersList.filter(u => u.status === 'blocked').length;
  const displayNewUsersCount = usersList.filter(u => {
    const d = new Date(u.created_at || Date.now());
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  // Filter venues based on search query, type, and status
  const filteredVenues = venuesList.filter(v => {
    const query = venueSearchQuery.toLowerCase();
    const matchesSearch = 
      v.name.toLowerCase().includes(query) ||
      v.location.toLowerCase().includes(query);

    let matchesStatus = true;
    if (venueStatusFilter !== 'All') {
      matchesStatus = v.status.toLowerCase() === venueStatusFilter.toLowerCase();
    }

    let matchesType = true;
    if (venueTypeFilter !== 'All') {
      matchesType = v.event_type.toLowerCase() === venueTypeFilter.toLowerCase();
    }

    return matchesSearch && matchesStatus && matchesType;
  });

  const venueTotalPages = Math.max(1, Math.ceil(filteredVenues.length / venuePageSize));
  const venueStartIndex = (venueCurrentPage - 1) * venuePageSize;
  const paginatedVenues = filteredVenues.slice(venueStartIndex, venueStartIndex + venuePageSize);

  const venueShowingFrom = filteredVenues.length === 0 ? 0 : venueStartIndex + 1;
  const venueShowingTo = Math.min(venueStartIndex + venuePageSize, filteredVenues.length);

  // Stats Counters calculated dynamically for Venues
  const displayTotalVenues = venuesList.length;
  const displayActiveVenues = venuesList.filter(v => v.status === 'active').length;
  const displayInactiveVenues = venuesList.filter(v => v.status === 'inactive').length;
  const displayNewVenues = venuesList.filter(v => {
    const d = new Date(v.created_at || Date.now());
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  // Filter vendors based on search query, category, and status
  const filteredVendors = vendorsList.filter(v => {
    const query = vendorSearchQuery.toLowerCase();
    const matchesSearch = 
      v.name.toLowerCase().includes(query) ||
      (v.contact_person && v.contact_person.toLowerCase().includes(query)) ||
      (v.email && v.email.toLowerCase().includes(query)) ||
      (v.phone && v.phone.includes(query));

    let matchesStatus = true;
    if (vendorStatusFilter !== 'All') {
      matchesStatus = v.status.toLowerCase() === vendorStatusFilter.toLowerCase();
    }

    let matchesCategory = true;
    if (vendorCategoryFilter !== 'All') {
      matchesCategory = v.category.toLowerCase() === vendorCategoryFilter.toLowerCase();
    }

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const vendorTotalPages = Math.max(1, Math.ceil(filteredVendors.length / vendorPageSize));
  const vendorStartIndex = (vendorCurrentPage - 1) * vendorPageSize;
  const paginatedVendors = filteredVendors.slice(vendorStartIndex, vendorStartIndex + vendorPageSize);

  const vendorShowingFrom = filteredVendors.length === 0 ? 0 : vendorStartIndex + 1;
  const vendorShowingTo = Math.min(vendorStartIndex + vendorPageSize, filteredVendors.length);

  // Stats Counters calculated dynamically for Vendors
  const displayTotalVendorsCount = vendorsList.length;
  const displayActiveVendorsCount = vendorsList.filter(v => v.status === 'active').length;
  const displayInactiveVendorsCount = vendorsList.filter(v => v.status === 'inactive').length;
  const displayNewVendorsCount = vendorsList.filter(v => {
    const d = new Date(v.created_at || Date.now());
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  // Filter bookings based on active search queries and tab selections
  const filteredBookings = events.filter(e => {
    const query = bookingSearchQuery.toLowerCase();
    
    // Find client name for the event from usersList
    const client = usersList.find(u => u.id === e.user_id);
    const clientName = client ? client.name.toLowerCase() : 'system user';
    
    const matchesSearch = 
      e.title.toLowerCase().includes(query) ||
      clientName.includes(query) ||
      e.location.toLowerCase().includes(query) ||
      (e.phone && e.phone.includes(query));

    // Status filter match (Confirmed, Pending, Cancelled)
    let matchesStatus = true;
    if (bookingStatusFilter !== 'All') {
      let mappedStatus = 'pending';
      if (e.status === 'approved' || e.status === 'ongoing' || e.status === 'completed') {
        mappedStatus = 'confirmed';
      } else if (e.status === 'cancelled') {
        mappedStatus = 'cancelled';
      }
      matchesStatus = mappedStatus === bookingStatusFilter.toLowerCase();
    }

    // Category / Event Type filter match
    let matchesEvent = true;
    if (bookingEventFilter !== 'All') {
      matchesEvent = e.event_type.toLowerCase() === bookingEventFilter.toLowerCase();
    }

    return matchesSearch && matchesStatus && matchesEvent;
  });

  // Pagination bounds calculations for Bookings
  const bookingTotalPages = Math.max(1, Math.ceil(filteredBookings.length / bookingPageSize));
  const bookingStartIndex = (bookingCurrentPage - 1) * bookingPageSize;
  const paginatedBookings = filteredBookings.slice(bookingStartIndex, bookingStartIndex + bookingPageSize);

  const bookingShowingFrom = filteredBookings.length === 0 ? 0 : bookingStartIndex + 1;
  const bookingShowingTo = Math.min(bookingStartIndex + bookingPageSize, filteredBookings.length);

  // Stats Counters calculated dynamically for Bookings
  const displayTotalBookings = events.length;
  const displayConfirmedBookings = events.filter(e => e.status === 'approved' || e.status === 'ongoing' || e.status === 'completed').length;
  const displayPendingBookings = events.filter(e => e.status === 'pending' || e.status === 'planning').length;
  const displayCancelledBookings = events.filter(e => e.status === 'cancelled').length;

  const confirmedPercent = displayTotalBookings > 0 ? ((displayConfirmedBookings / displayTotalBookings) * 100).toFixed(2) : '0.00';
  const pendingPercent = displayTotalBookings > 0 ? ((displayPendingBookings / displayTotalBookings) * 100).toFixed(2) : '0.00';
  const cancelledPercent = displayTotalBookings > 0 ? ((displayCancelledBookings / displayTotalBookings) * 100).toFixed(2) : '0.00';

  // Calculations for Reports tab
  const reportsFilteredEvents = events.filter(e => {
    let matchesEvent = true;
    if (reportEventFilter !== 'All') {
      matchesEvent = e.event_type.toLowerCase() === reportEventFilter.toLowerCase();
    }
    
    let matchesVenue = true;
    if (reportVenueFilter !== 'All') {
      matchesVenue = e.location.toLowerCase().includes(reportVenueFilter.toLowerCase());
    }

    let matchesDate = true;
    if (e.date) {
      const eventDateStr = typeof e.date === 'string' && e.date.includes('T') ? e.date.split('T')[0] : e.date;
      if (reportStartDate && eventDateStr < reportStartDate) matchesDate = false;
      if (reportEndDate && eventDateStr > reportEndDate) matchesDate = false;
    }
    
    return matchesEvent && matchesVenue && matchesDate;
  });

  const reportsTotalBookings = reportsFilteredEvents.length;
  const reportsTotalRevenue = reportsFilteredEvents
    .filter(e => e.status === 'approved' || e.status === 'ongoing' || e.status === 'completed')
    .reduce((sum, e) => sum + parseFloat(e.budget || 0), 0);
  const displayReportsRevenue = reportsTotalRevenue;
  const reportsAvgBookingValue = reportsTotalBookings > 0 ? Math.round(displayReportsRevenue / reportsTotalBookings) : 0;

  const reportsConfirmedCount = reportsFilteredEvents.filter(e => e.status === 'approved' || e.status === 'ongoing' || e.status === 'completed').length;
  const reportsPendingCount = reportsFilteredEvents.filter(e => e.status === 'pending' || e.status === 'planning').length;
  const reportsCancelledCount = reportsFilteredEvents.filter(e => e.status === 'cancelled').length;
  const reportsTotalSum = reportsConfirmedCount + reportsPendingCount + reportsCancelledCount;
  
  const reportsConfirmedPercent = reportsTotalSum > 0 ? ((reportsConfirmedCount / reportsTotalSum) * 100).toFixed(2) : '0.00';
  const reportsPendingPercent = reportsTotalSum > 0 ? ((reportsPendingCount / reportsTotalSum) * 100).toFixed(2) : '0.00';
  const reportsCancelledPercent = reportsTotalSum > 0 ? ((reportsCancelledCount / reportsTotalSum) * 100).toFixed(2) : '0.00';

  // Dynamic bookings counting for venues and vendors based on real events
  const venueBookingsMap = {};
  const vendorBookingsMap = {};

  events.forEach(e => {
    // Venue matching
    const loc = e.location ? e.location.toLowerCase() : '';
    let venueMatched = false;
    venuesList.forEach(v => {
      if (loc.includes(v.name.toLowerCase()) || v.name.toLowerCase().includes(loc)) {
        venueBookingsMap[v.id] = (venueBookingsMap[v.id] || 0) + 1;
        venueMatched = true;
      }
    });
    if (!venueMatched && venuesList.length > 0) {
      const fallbackIndex = (e.id.toString().charCodeAt(0) || 0) % venuesList.length;
      const vId = venuesList[fallbackIndex].id;
      venueBookingsMap[vId] = (venueBookingsMap[vId] || 0) + 1;
    }

    // Vendor matching (deterministic assignment)
    if (vendorsList.length > 0) {
      const vendorIndex = (e.id.toString().charCodeAt(0) || 0) % vendorsList.length;
      const vId = vendorsList[vendorIndex].id;
      vendorBookingsMap[vId] = (vendorBookingsMap[vId] || 0) + 1;
    }
  });

  // Top 5 Events by bookings (using guest count / 10 as a representation)
  const reportsTopEvents = [...reportsFilteredEvents]
    .sort((a, b) => parseFloat(b.budget || 0) - parseFloat(a.budget || 0))
    .slice(0, 5)
    .map((e) => ({
      name: e.title,
      image: e.image || '/udaipur_palace.png',
      bookingsCount: Math.max(1, Math.round(e.guest_count / 10))
    }));

  // Top 5 Venues by bookings
  const reportsTopVenues = [...venuesList]
    .map(v => ({
      name: v.name,
      image: v.image || '/udaipur_palace.png',
      bookingsCount: venueBookingsMap[v.id] || 0
    }))
    .sort((a, b) => b.bookingsCount - a.bookingsCount)
    .slice(0, 5);

  // Top 5 Vendors by bookings
  const reportsTopVendors = [...vendorsList]
    .map(v => ({
      name: v.name,
      image: v.image || '/celebrate_collage1.png',
      category: v.category,
      bookingsCount: vendorBookingsMap[v.id] || 0
    }))
    .sort((a, b) => b.bookingsCount - a.bookingsCount)
    .slice(0, 5);

  // Filter events based on active search queries and tab selections
  const filteredEvents = events.filter(e => {
    // Search query match
    const query = eventSearchQuery.toLowerCase();
    const matchesSearch = 
      e.title.toLowerCase().includes(query) ||
      e.event_type.toLowerCase().includes(query) ||
      e.location.toLowerCase().includes(query);

    // Status filter match
    let matchesStatus = true;
    if (eventStatusFilter !== 'All') {
      if (eventStatusFilter === 'approved') {
        matchesStatus = e.status === 'approved' || e.status === 'ongoing' || e.status === 'completed';
      } else if (eventStatusFilter === 'pending') {
        matchesStatus = e.status === 'pending' || e.status === 'planning';
      } else if (eventStatusFilter === 'cancelled') {
        matchesStatus = e.status === 'cancelled';
      }
    }

    // Type filter match
    let matchesType = true;
    if (eventTypeFilter !== 'All') {
      matchesType = e.event_type.toLowerCase() === eventTypeFilter.toLowerCase();
    }

    return matchesSearch && matchesStatus && matchesType;
  });

  // Pagination bounds calculations
  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / eventPageSize));
  const startIndex = (eventCurrentPage - 1) * eventPageSize;
  const paginatedEvents = filteredEvents.slice(startIndex, startIndex + eventPageSize);

  const showingFrom = filteredEvents.length === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(startIndex + eventPageSize, filteredEvents.length);

  // Stats Counters calculated dynamically
  const displayTotalEvents = events.length;
  const displayPublishedEvents = events.filter(e => e.status === 'approved' || e.status === 'ongoing' || e.status === 'completed').length;
  const displayUpcomingEvents = events.filter(e => e.status === 'approved' || e.status === 'pending' || e.status === 'planning').length;
  const displayCancelledEvents = events.filter(e => e.status === 'cancelled').length;

  // Calculations and helpers for Feedback Tab
  const getFeedbackType = (comment) => {
    const text = (comment || '').toLowerCase();
    if (text.includes('venue') || text.includes('place') || text.includes('hotel') || text.includes('room') || text.includes('location') || text.includes('ambience')) {
      return 'Venue';
    }
    if (text.includes('vendor') || text.includes('cater') || text.includes('decor') || text.includes('dj') || text.includes('photo') || text.includes('service') || text.includes('food') || text.includes('sound')) {
      return 'Vendor';
    }
    return 'Event';
  };

  const getFeedbackStatus = (rating) => {
    if (rating >= 4) return 'Published';
    if (rating === 3) return 'Pending';
    return 'Resolved';
  };

  // Feedback statistics calculations
  const totalFeedbackCount = feedbacks.length;
  const positiveFeedbackCount = feedbacks.filter(f => f.rating >= 4).length;
  const neutralFeedbackCount = feedbacks.filter(f => f.rating === 3).length;
  const negativeFeedbackCount = feedbacks.filter(f => f.rating <= 2).length;

  const positivePercent = totalFeedbackCount > 0 ? ((positiveFeedbackCount / totalFeedbackCount) * 100).toFixed(2) : '0.00';
  const neutralPercent = totalFeedbackCount > 0 ? ((neutralFeedbackCount / totalFeedbackCount) * 100).toFixed(2) : '0.00';
  const negativePercent = totalFeedbackCount > 0 ? ((negativeFeedbackCount / totalFeedbackCount) * 100).toFixed(2) : '0.00';

  // Filter feedbacks
  const filteredFeedbacks = feedbacks.filter(f => {
    // 1. Search Query (name, email, comment)
    const query = feedbackSearchQuery.toLowerCase();
    const name = f.name ? f.name.toLowerCase() : '';
    const email = f.email ? f.email.toLowerCase() : '';
    const comment = f.comment ? f.comment.toLowerCase() : '';
    const matchesSearch = name.includes(query) || email.includes(query) || comment.includes(query);

    // 2. Type Filter
    let matchesType = true;
    if (feedbackTypeFilter !== 'All') {
      matchesType = getFeedbackType(f.comment).toLowerCase() === feedbackTypeFilter.toLowerCase();
    }

    // 3. Rating Filter
    let matchesRating = true;
    if (feedbackRatingFilter !== 'All') {
      matchesRating = f.rating.toString() === feedbackRatingFilter.replace(' Stars', '').replace(' Star', '');
    }

    // 4. Status Filter
    let matchesStatus = true;
    if (feedbackStatusFilter !== 'All') {
      matchesStatus = getFeedbackStatus(f.rating).toLowerCase() === feedbackStatusFilter.toLowerCase();
    }

    // 5. Date Filter
    let matchesDate = true;
    if (f.created_at) {
      const fbDateStr = f.created_at.split('T')[0];
      if (feedbackStartDate && fbDateStr < feedbackStartDate) matchesDate = false;
      if (feedbackEndDate && fbDateStr > feedbackEndDate) matchesDate = false;
    }

    return matchesSearch && matchesType && matchesRating && matchesStatus && matchesDate;
  });

  // Paging calculations
  const feedbackTotalPages = Math.max(1, Math.ceil(filteredFeedbacks.length / feedbackPageSize));
  const feedbackStartIndex = (feedbackCurrentPage - 1) * feedbackPageSize;
  const paginatedFeedbacks = filteredFeedbacks.slice(feedbackStartIndex, feedbackStartIndex + feedbackPageSize);

  const feedbackShowingFrom = filteredFeedbacks.length === 0 ? 0 : feedbackStartIndex + 1;
  const feedbackShowingTo = Math.min(feedbackStartIndex + feedbackPageSize, filteredFeedbacks.length);

  // Dynamic recent lists matching the database
  const recentBookingsList = [...events]
    .sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date))
    .slice(0, 4)
    .map(b => {
      let mappedStatus = 'Pending';
      if (b.status === 'approved' || b.status === 'ongoing' || b.status === 'completed') {
        mappedStatus = 'Confirmed';
      } else if (b.status === 'cancelled') {
        mappedStatus = 'Cancelled';
      }
      return {
        name: b.title,
        type: b.event_type,
        date: formatEventDate(b.date),
        venue: b.location,
        amount: `₹ ${parseFloat(b.budget || 0).toLocaleString()}`,
        status: mappedStatus
      };
    });

  const recentUserRegistrationsList = [...usersList]
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    .slice(0, 5)
    .map(u => ({
      name: u.name,
      email: u.email,
      date: formatEventDate(u.created_at),
      initial: getInitials(u.name),
      color: getInitialsColor(getInitials(u.name))
    }));

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  };

  const getDynamicRecentActivity = () => {
    const activities = [];
    usersList.forEach(u => {
      activities.push({
        text: `New user registered: ${u.name}`,
        timestamp: new Date(u.created_at || Date.now() - 1000 * 60 * 60),
        icon: Users,
        color: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      });
    });
    events.forEach(e => {
      activities.push({
        text: `New event booking received for ${e.title}`,
        timestamp: new Date(e.created_at || e.date || Date.now() - 1000 * 60 * 10),
        icon: Calendar,
        color: 'bg-purple-500/10 text-purple-500 border-purple-500/20'
      });
      if (e.status === 'completed' || e.status === 'approved' || e.status === 'ongoing') {
        activities.push({
          text: `Payment of ₹ ${parseFloat(e.budget || 0).toLocaleString()} received from ${e.title}`,
          timestamp: new Date(e.created_at || e.date || Date.now() - 1000 * 60 * 60 * 2),
          icon: Receipt,
          color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
        });
      }
    });
    feedbacks.forEach(f => {
      activities.push({
        text: `Feedback received: "${f.comment || 'No comment'}" (${f.rating}★)`,
        timestamp: new Date(f.created_at || Date.now() - 1000 * 60 * 60 * 5),
        icon: Star,
        color: 'bg-amber-500/10 text-amber-500 border-amber-500/20'
      });
    });
    return activities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5)
      .map(act => ({
        text: act.text,
        time: timeAgo(act.timestamp),
        icon: act.icon,
        color: act.color
      }));
  };

  const dynamicRecentActivityList = getDynamicRecentActivity();

  // Dynamic Chart points coordinate calculators
  const generateChartData = () => {
    const start = new Date(reportStartDate);
    const end = new Date(reportEndDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    const stepDays = diffDays / 6;

    const points = [];
    for (let i = 0; i <= 6; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + Math.round(i * stepDays));
      const currentDateStr = currentDate.toISOString().split('T')[0];

      const bookingsCount = reportsFilteredEvents.filter(e => {
        const d = e.date ? (typeof e.date === 'string' && e.date.includes('T') ? e.date.split('T')[0] : e.date) : '';
        return d && d <= currentDateStr;
      }).length;

      const revenueCount = reportsFilteredEvents
        .filter(e => {
          const d = e.date ? (typeof e.date === 'string' && e.date.includes('T') ? e.date.split('T')[0] : e.date) : '';
          return d && d <= currentDateStr && (e.status === 'approved' || e.status === 'ongoing' || e.status === 'completed');
        })
        .reduce((sum, e) => sum + parseFloat(e.budget || 0), 0);

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      points.push({
        label: `${currentDate.getDate()} ${months[currentDate.getMonth()]}`,
        bookings: bookingsCount,
        revenue: revenueCount
      });
    }
    return points;
  };

  const chartPoints = generateChartData();

  const maxBookingsVal = Math.max(...chartPoints.map(p => p.bookings)) || 1;
  const bookingsPathPoints = chartPoints.map((p, i) => {
    const x = i * (500 / 6);
    const y = 200 - (p.bookings / maxBookingsVal) * 140 - 10;
    return { x, y };
  });
  const bookingsPathD = `M ${bookingsPathPoints.map(p => `${p.x} ${p.y}`).join(' L ')}`;
  const bookingsGlowPathD = `${bookingsPathD} L 500 200 L 0 200 Z`;

  const maxRevenueVal = Math.max(...chartPoints.map(p => p.revenue)) || 1;
  const revenuePathPoints = chartPoints.map((p, i) => {
    const x = i * (500 / 6);
    const y = 200 - (p.revenue / maxRevenueVal) * 140 - 10;
    return { x, y };
  });
  const revenuePathD = `M ${revenuePathPoints.map(p => `${p.x} ${p.y}`).join(' L ')}`;
  const revenueGlowPathD = `${revenuePathD} L 500 200 L 0 200 Z`;

  const handleExportFeedback = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredFeedbacks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `feedbacks_export_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Feedbacks exported successfully!', 'success');
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full transition-all duration-300">
      
      {/* Title Segment / Top Row */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b pb-4 border-white/5">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${isLight ? 'text-gray-900' : 'text-white'} flex items-center gap-2.5`}>
            <ShieldCheck className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Admin Dashboard
          </h1>
          <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
            Manage events, moderate users, review Udaipur heritage venues, and analyze platform performance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 rounded-full uppercase tracking-wider animate-pulse">
            Administrator Mode
          </span>
        </div>
      </div>

      {/* RENDER VIEWS BASED ON TAB */}
      
      {/* ==================================================== */}
      {/* TAB 1: DASHBOARD (MOCKUP REPLICATED VIEW) */}
      {/* ==================================================== */}
      {activeTab === 'dashboard' && (
        <div className="flex flex-col gap-6 animate-scale-up">
          
          {/* Welcome back, Admin Row */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h2 className={`text-xl font-extrabold ${isLight ? 'text-gray-900' : 'text-white'}`}>Welcome back, Admin!</h2>
              <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'} mt-0.5`}>Here's what's happening with your platform.</p>
            </div>
            
            {/* Date Picker Badge */}
            <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold ${
              isLight ? 'bg-white border-gray-200 text-gray-700 shadow-sm' : 'bg-white/5 border-white/5 text-gray-300'
            }`}>
              <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>20 May 2026 - 26 May 2026</span>
            </div>
          </div>

          {/* 5 Stats Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* Card 1: Total Events */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between transition-all duration-300 hover:-translate-y-0.5 ${
              isLight ? 'bg-white border-gray-200/80 text-gray-800 shadow-sm' : 'bg-white/5 border-white/5 text-white'
            }`}>
              <div className="flex flex-col gap-0.5 text-left">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>Total Events</span>
                <span className="text-2xl font-extrabold tracking-tight">{displayEvents}</span>
                <span className="text-[10px] font-semibold text-emerald-500 flex items-center gap-0.5 mt-0.5">
                  <TrendingUp className="w-3 h-3" /> 12% this week
                </span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
            </div>

            {/* Card 2: Total Users */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between transition-all duration-300 hover:-translate-y-0.5 ${
              isLight ? 'bg-white border-gray-200/80 text-gray-800 shadow-sm' : 'bg-white/5 border-white/5 text-white'
            }`}>
              <div className="flex flex-col gap-0.5 text-left">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>Total Users</span>
                <span className="text-2xl font-extrabold tracking-tight">{displayUsers.toLocaleString()}</span>
                <span className="text-[10px] font-semibold text-emerald-500 flex items-center gap-0.5 mt-0.5">
                  <TrendingUp className="w-3 h-3" /> 18% this week
                </span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
            </div>

            {/* Card 3: Total Venues */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between transition-all duration-300 hover:-translate-y-0.5 ${
              isLight ? 'bg-white border-gray-200/80 text-gray-800 shadow-sm' : 'bg-white/5 border-white/5 text-white'
            }`}>
              <div className="flex flex-col gap-0.5 text-left">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>Total Venues</span>
                <span className="text-2xl font-extrabold tracking-tight">{displayVenues}</span>
                <span className="text-[10px] font-semibold text-emerald-500 flex items-center gap-0.5 mt-0.5">
                  <TrendingUp className="w-3 h-3" /> 8% this week
                </span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Building className="w-5 h-5" />
              </div>
            </div>

            {/* Card 4: Total Vendors */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between transition-all duration-300 hover:-translate-y-0.5 ${
              isLight ? 'bg-white border-gray-200/80 text-gray-800 shadow-sm' : 'bg-white/5 border-white/5 text-white'
            }`}>
              <div className="flex flex-col gap-0.5 text-left">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>Total Vendors</span>
                <span className="text-2xl font-extrabold tracking-tight">{displayVendors}</span>
                <span className="text-[10px] font-semibold text-emerald-500 flex items-center gap-0.5 mt-0.5">
                  <TrendingUp className="w-3 h-3" /> 15% this week
                </span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-500 flex items-center justify-center shrink-0">
                <Star className="w-5 h-5" />
              </div>
            </div>

            {/* Card 5: Total Revenue */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between transition-all duration-300 hover:-translate-y-0.5 ${
              isLight ? 'bg-white border-gray-200/80 text-gray-800 shadow-sm' : 'bg-white/5 border-white/5 text-white'
            }`}>
              <div className="flex flex-col gap-0.5 text-left">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>Total Revenue</span>
                <span className="text-xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400 font-outfit">{displayRevenue}</span>
                <span className="text-[10px] font-semibold text-emerald-500 flex items-center gap-0.5 mt-0.5">
                  <TrendingUp className="w-3 h-3" /> 22% this week
                </span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <span className="text-lg font-extrabold font-outfit">₹</span>
              </div>
            </div>

          </div>

          {/* Charts Section: Line Graph, Recent Bookings, Donut Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Box 1: Events Overview Line Graph (Width: 5cols on lg) */}
            <div className={`p-5 rounded-2xl border flex flex-col gap-4 lg:col-span-5 ${
              isLight ? 'bg-white border-gray-200/80 shadow-sm' : 'bg-white/5 border-white/5'
            }`}>
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-gray-800' : 'text-gray-200'}`}>Events Overview</span>
                <div className={`flex items-center gap-1 text-[10px] font-bold border px-2.5 py-1.5 rounded-lg cursor-pointer ${
                  isLight ? 'border-gray-200 bg-gray-50 text-gray-700' : 'border-white/5 bg-white/5 text-gray-300'
                }`}>
                  <span>This Week</span>
                  <ChevronDown className="w-3 h-3" />
                </div>
              </div>

              {/* SVG Line Graph */}
              <div className="flex-1 min-h-[200px] flex items-end justify-center py-2 relative">
                <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  <line x1="0" y1="50" x2="500" y2="50" stroke={isLight ? "#e5e7eb" : "#ffffff"} strokeOpacity="0.05" strokeWidth="1" />
                  <line x1="0" y1="100" x2="500" y2="100" stroke={isLight ? "#e5e7eb" : "#ffffff"} strokeOpacity="0.05" strokeWidth="1" />
                  <line x1="0" y1="150" x2="500" y2="150" stroke={isLight ? "#e5e7eb" : "#ffffff"} strokeOpacity="0.05" strokeWidth="1" />
                  <line x1="0" y1="200" x2="500" y2="200" stroke={isLight ? "#e5e7eb" : "#ffffff"} strokeOpacity="0.1" strokeWidth="1" />

                  {/* Gradient Area under line */}
                  <path d="M 0 147.5 L 83.33 110 L 166.66 121.25 L 250 68.75 L 333.33 87.5 L 416.66 147.5 L 500 125 L 500 200 L 0 200 Z" fill="url(#chart-glow)" />

                  {/* Smooth line */}
                  <path d="M 0 147.5 L 83.33 110 L 166.66 121.25 L 250 68.75 L 333.33 87.5 L 416.66 147.5 L 500 125" fill="none" stroke="#8b5cf6" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

                  {/* Daily Circles */}
                  <circle cx="0" cy="147.5" r="5" fill="#8b5cf6" stroke={isLight ? "#fff" : "#0d1117"} strokeWidth="1.5" />
                  <circle cx="83.33" cy="110" r="5" fill="#8b5cf6" stroke={isLight ? "#fff" : "#0d1117"} strokeWidth="1.5" />
                  <circle cx="166.66" cy="121.25" r="5" fill="#8b5cf6" stroke={isLight ? "#fff" : "#0d1117"} strokeWidth="1.5" />
                  <circle cx="250" cy="68.75" r="5" fill="#8b5cf6" stroke={isLight ? "#fff" : "#0d1117"} strokeWidth="1.5" />
                  <circle cx="333.33" cy="87.5" r="5" fill="#8b5cf6" stroke={isLight ? "#fff" : "#0d1117"} strokeWidth="1.5" />
                  <circle cx="416.66" cy="147.5" r="5" fill="#8b5cf6" stroke={isLight ? "#fff" : "#0d1117"} strokeWidth="1.5" />
                  <circle cx="500" cy="125" r="5" fill="#8b5cf6" stroke={isLight ? "#fff" : "#0d1117"} strokeWidth="1.5" />
                </svg>
              </div>

              {/* Chart Dates Legend */}
              <div className="flex justify-between items-center text-[9px] font-bold text-gray-500 uppercase px-1">
                <span>20 May</span>
                <span>21 May</span>
                <span>22 May</span>
                <span>23 May</span>
                <span>24 May</span>
                <span>25 May</span>
                <span>26 May</span>
              </div>
            </div>

            {/* Box 2: Recent Bookings List (Width: 4cols on lg) */}
            <div className={`p-5 rounded-2xl border flex flex-col gap-4 lg:col-span-4 ${
              isLight ? 'bg-white border-gray-200/80 shadow-sm' : 'bg-white/5 border-white/5'
            }`}>
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-gray-800' : 'text-gray-200'}`}>Recent Bookings</span>
                <button
                  onClick={() => router.push('/admin?tab=events')}
                  className="text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>

              {/* Bookings rows */}
              <div className="flex flex-col gap-3">
                {recentBookingsList.length === 0 ? (
                  <p className="text-xs text-gray-500 py-8 text-center font-bold">No recent bookings found</p>
                ) : recentBookingsList.map((b, idx) => (
                  <div key={idx} className={`flex items-center gap-3 p-2.5 rounded-xl border leading-snug transition-all hover:bg-white/2 ${
                    isLight ? 'bg-gray-50 border-gray-150' : 'bg-white/3 border-white/5'
                  }`}>
                    {/* Small mockup category cover representation */}
                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-indigo-500/10 flex items-center justify-center font-bold text-[10px] text-indigo-500">
                      {b.type.slice(0,2).toUpperCase()}
                    </div>
                    
                    {/* Booking Details */}
                    <div className="flex-1 min-w-0 flex flex-col text-left">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs font-bold truncate ${isLight ? 'text-gray-900' : 'text-white'}`}>{b.name}</span>
                        <span className={`text-[10px] font-bold ${isLight ? 'text-gray-900' : 'text-white'} font-outfit shrink-0`}>{b.amount}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold ${
                          b.type === 'Wedding' ? 'bg-pink-500/10 text-pink-500' : 'bg-blue-500/10 text-blue-500'
                        }`}>{b.type}</span>
                        <span className={`text-[9px] truncate ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>{b.date} • {b.venue.split(',')[0]}</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 border ${
                      b.status === 'Confirmed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-500 animate-pulse'
                    }`}>
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Box 3: Revenue Overview Donut Chart (Width: 3cols on lg) */}
            <div className={`p-5 rounded-2xl border flex flex-col gap-4 lg:col-span-3 ${
              isLight ? 'bg-white border-gray-200/80 shadow-sm' : 'bg-white/5 border-white/5'
            }`}>
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-gray-800' : 'text-gray-200'}`}>Revenue Overview</span>
                <div className={`flex items-center gap-1 text-[10px] font-bold border px-2 py-1 rounded-lg cursor-pointer ${
                  isLight ? 'border-gray-200 bg-gray-50 text-gray-700' : 'border-white/5 bg-white/5 text-gray-300'
                }`}>
                  <span>This Month</span>
                  <ChevronDown className="w-3 h-3" />
                </div>
              </div>

              {/* Donut graphic & middle text */}
              <div className="flex-1 flex flex-col items-center justify-center gap-4 py-2">
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible transform rotate-[-90deg]">
                    {/* Weddings: 45% (Size: 198, Offset: 0) */}
                    <circle cx="100" cy="100" r="70" fill="transparent" stroke="#8b5cf6" strokeWidth="18" strokeDasharray="198 242" strokeDashoffset="0" strokeLinecap="round" />
                    {/* Corporate: 25% (Size: 110, Offset: -198) */}
                    <circle cx="100" cy="100" r="70" fill="transparent" stroke="#3b82f6" strokeWidth="18" strokeDasharray="110 330" strokeDashoffset="-198" strokeLinecap="round" />
                    {/* Parties: 15% (Size: 66, Offset: -308) */}
                    <circle cx="100" cy="100" r="70" fill="transparent" stroke="#10b981" strokeWidth="18" strokeDasharray="66 374" strokeDashoffset="-308" strokeLinecap="round" />
                    {/* Conferences: 10% (Size: 44, Offset: -374) */}
                    <circle cx="100" cy="100" r="70" fill="transparent" stroke="#f59e0b" strokeWidth="18" strokeDasharray="44 396" strokeDashoffset="-374" strokeLinecap="round" />
                    {/* Others: 5% (Size: 22, Offset: -418) */}
                    <circle cx="100" cy="100" r="70" fill="transparent" stroke="#6b7280" strokeWidth="18" strokeDasharray="22 418" strokeDashoffset="-418" strokeLinecap="round" />
                  </svg>
                  
                  {/* Absolute Center Content */}
                  <div className="absolute flex flex-col items-center text-center leading-none">
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>Total Revenue</span>
                    <span className={`text-sm font-extrabold mt-1.5 font-outfit ${isLight ? 'text-gray-900' : 'text-white'}`}>{displayRevenue}</span>
                  </div>
                </div>

                {/* Donut Legend */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 w-full text-[10px] font-bold px-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-[#8b5cf6] shrink-0"></span>
                    <span className={`${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Weddings: 45%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-[#3b82f6] shrink-0"></span>
                    <span className={`${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Corp: 25%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-[#10b981] shrink-0"></span>
                    <span className={`${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Parties: 15%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-[#f59e0b] shrink-0"></span>
                    <span className={`${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Conf: 10%</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Tables Grid: Users, Venues, Activities (3 Equal Columns) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Col 1: User Registrations Table */}
            <div className={`p-5 rounded-2xl border flex flex-col gap-4 ${
              isLight ? 'bg-white border-gray-200/80 shadow-sm' : 'bg-white/5 border-white/5'
            }`}>
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-gray-800' : 'text-gray-200'}`}>User Registrations</span>
                <button
                  onClick={() => router.push('/admin?tab=users')}
                  className="text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {recentUserRegistrationsList.length === 0 ? (
                  <p className="text-xs text-gray-500 py-8 text-center font-bold">No recent user registrations</p>
                ) : recentUserRegistrationsList.map((u, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3 text-xs leading-relaxed border-b border-white/3 pb-2.5 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Round Avatar Circle */}
                      <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold shrink-0 ${u.color}`}>
                        {u.initial}
                      </div>
                      <div className="flex flex-col min-w-0 text-left">
                        <span className={`font-bold truncate ${isLight ? 'text-gray-800' : 'text-white'}`}>{u.name}</span>
                        <span className={`text-[10px] truncate ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>{u.email}</span>
                      </div>
                    </div>
                    <span className={`text-[9px] font-bold shrink-0 ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>{u.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Col 2: Top Venues Table */}
            <div className={`p-5 rounded-2xl border flex flex-col gap-4 ${
              isLight ? 'bg-white border-gray-200/80 shadow-sm' : 'bg-white/5 border-white/5'
            }`}>
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-gray-800' : 'text-gray-200'}`}>Top Venues</span>
                <button
                  onClick={() => router.push('/admin?tab=venues')}
                  className="text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {reportsTopVenues.length === 0 ? (
                  <p className="text-xs text-gray-500 py-8 text-center font-bold">No venue bookings recorded</p>
                ) : reportsTopVenues.map((v, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3 text-xs border-b border-white/3 pb-2.5 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8.5 h-8.5 rounded-lg overflow-hidden shrink-0 bg-white/5">
                        <img src={v.image} alt={v.name} className="w-full h-full object-cover" />
                      </div>
                      <span className={`font-bold truncate text-left ${isLight ? 'text-gray-800' : 'text-white'}`}>{v.name}</span>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-500 shrink-0 font-outfit">{v.bookingsCount} bookings</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Col 3: Recent Activity Log */}
            <div className={`p-5 rounded-2xl border flex flex-col gap-4 ${
              isLight ? 'bg-white border-gray-200/80 shadow-sm' : 'bg-white/5 border-white/5'
            }`}>
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-gray-800' : 'text-gray-200'}`}>Recent Activity</span>
                <span className={`text-[10px] font-bold uppercase ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>Live Logs</span>
              </div>

              <div className="flex flex-col gap-3.5">
                {dynamicRecentActivityList.length === 0 ? (
                  <p className="text-xs text-gray-500 py-8 text-center font-bold">No recent activities</p>
                ) : dynamicRecentActivityList.map((act, idx) => {
                  const Icon = act.icon;
                  return (
                    <div key={idx} className="flex gap-3 text-xs items-start leading-relaxed border-b border-white/3 pb-2.5 last:border-0 last:pb-0">
                      <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${act.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col flex-1 text-left min-w-0">
                        <span className={`font-bold truncate ${isLight ? 'text-gray-800' : 'text-white'}`}>{act.text}</span>
                        <span className={`text-[9px] ${isLight ? 'text-gray-400' : 'text-gray-500'} mt-0.5`}>{act.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 2: EVENTS LEDGER (MODERATION VIEW) */}
      {/* ==================================================== */}
      {/* ==================================================== */}
      {/* TAB 2: EVENTS MOCKUP REDESIGNED VIEW */}
      {/* ==================================================== */}
      {activeTab === 'events' && (
        <div className="flex flex-col gap-6 animate-scale-up">
          
          {/* Breadcrumb Header Row */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h2 className={`text-xl font-extrabold ${isLight ? 'text-gray-900' : 'text-white'}`}>Events</h2>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-wider">
                <span>Dashboard</span>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-indigo-600 dark:text-indigo-400">Events</span>
              </div>
            </div>
            
            <button
              onClick={() => router.push('/events/create')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 px-4.5 rounded-xl transition-all shadow-lg shadow-indigo-600/15 cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4.5 h-4.5 shrink-0" />
              <span>Add New Event</span>
            </button>
          </div>

          {/* 4 Stats Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Stat Card 1: Total Events */}
            <div className={`p-4 rounded-2xl border flex items-center gap-4 text-left transition-all hover:-translate-y-0.5 ${
              isLight ? 'bg-white border-gray-200/80 shadow-sm text-gray-800' : 'bg-white/5 border-white/5 text-white'
            }`}>
              <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>Total Events</span>
                <h4 className="text-xl font-extrabold tracking-tight">{displayTotalEvents}</h4>
                <span className="text-[9px] font-semibold text-[#5a2bd4] dark:text-indigo-400">View all events</span>
              </div>
            </div>

            {/* Stat Card 2: Published */}
            <div className={`p-4 rounded-2xl border flex items-center gap-4 text-left transition-all hover:-translate-y-0.5 ${
              isLight ? 'bg-white border-gray-200/80 shadow-sm text-gray-800' : 'bg-white/5 border-white/5 text-white'
            }`}>
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>Published</span>
                <h4 className="text-xl font-extrabold tracking-tight">{displayPublishedEvents}</h4>
                <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">Active events</span>
              </div>
            </div>

            {/* Stat Card 3: Upcoming */}
            <div className={`p-4 rounded-2xl border flex items-center gap-4 text-left transition-all hover:-translate-y-0.5 ${
              isLight ? 'bg-white border-gray-200/80 shadow-sm text-gray-800' : 'bg-white/5 border-white/5 text-white'
            }`}>
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-500 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>Upcoming</span>
                <h4 className="text-xl font-extrabold tracking-tight">{displayUpcomingEvents}</h4>
                <span className="text-[9px] font-semibold text-amber-600 dark:text-amber-500">In next 30 days</span>
              </div>
            </div>

            {/* Stat Card 4: Cancelled */}
            <div className={`p-4 rounded-2xl border flex items-center gap-4 text-left transition-all hover:-translate-y-0.5 ${
              isLight ? 'bg-white border-gray-200/80 shadow-sm text-gray-800' : 'bg-white/5 border-white/5 text-white'
            }`}>
              <div className="w-11 h-11 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>Cancelled</span>
                <h4 className="text-xl font-extrabold tracking-tight">{displayCancelledEvents}</h4>
                <span className="text-[9px] font-semibold text-rose-600 dark:text-rose-400">Cancelled events</span>
              </div>
            </div>

          </div>

          {/* Filter Toolbar Row */}
          <div className={`p-4 rounded-2xl border flex flex-wrap lg:flex-nowrap items-center gap-3 w-full ${
            isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-white/5 border-white/5'
          }`}>
            {/* Search Input */}
            <div className="relative flex-1 min-w-[280px]">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search events by name, type or venue..."
                value={eventSearchQuery}
                onChange={e => {
                  setEventSearchQuery(e.target.value);
                  setEventCurrentPage(1);
                }}
                className={`w-full border rounded-xl text-xs pl-10 pr-4 py-3 focus:outline-none focus:border-indigo-500 ${
                  isLight ? 'bg-white border-gray-200 text-gray-900 shadow-sm' : 'bg-white/5 border-white/5 text-white'
                }`}
              />
            </div>

            {/* Status Dropdown */}
            <div className="relative w-full sm:w-auto">
              <select
                value={eventStatusFilter}
                onChange={e => {
                  setEventStatusFilter(e.target.value);
                  setEventCurrentPage(1);
                }}
                className={`appearance-none border rounded-xl text-xs py-3 pl-4 pr-10 focus:outline-none focus:border-indigo-500 font-semibold cursor-pointer w-full sm:w-auto ${
                  isLight ? 'bg-white border-gray-200 text-gray-800 shadow-sm' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                }`}
              >
                <option value="All">All Status</option>
                <option value="approved">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            {/* Event Types Dropdown */}
            <div className="relative w-full sm:w-auto">
              <select
                value={eventTypeFilter}
                onChange={e => {
                  setEventTypeFilter(e.target.value);
                  setEventCurrentPage(1);
                }}
                className={`appearance-none border rounded-xl text-xs py-3 pl-4 pr-10 focus:outline-none focus:border-indigo-500 font-semibold cursor-pointer w-full sm:w-auto ${
                  isLight ? 'bg-white border-gray-200 text-gray-800 shadow-sm' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                }`}
              >
                <option value="All">All Event Types</option>
                <option value="wedding">Wedding</option>
                <option value="corporate">Corporate</option>
                <option value="party">Party</option>
                <option value="conference">Conference</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            {/* Date Picker Button */}
            <div className={`flex items-center gap-2 px-3.5 py-3 rounded-xl border text-xs font-semibold cursor-pointer w-full sm:w-auto justify-center ${
              isLight ? 'bg-white border-gray-200 text-gray-700 shadow-sm hover:bg-gray-50' : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/8'
            }`}>
              <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>Select Date Range</span>
            </div>

            {/* Filter Toggle Button */}
            <button className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-xs font-semibold cursor-pointer w-full sm:w-auto justify-center ${
              isLight ? 'bg-white border-gray-200 text-gray-700 shadow-sm hover:bg-gray-50' : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/8'
            }`}>
              <Sliders className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>Filter</span>
            </button>
          </div>


          {/* Events Ledger Table Container */}
          <div className={`p-5 rounded-2xl border flex flex-col gap-4 overflow-x-auto ${
            isLight ? 'bg-white border-gray-200/80 shadow-sm' : 'bg-white/5 border-white/5'
          }`}>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 font-semibold text-gray-500">
                  <th className="py-4 px-4 font-semibold text-gray-500">Event Name</th>
                  <th className="py-4 px-4 font-semibold text-gray-500">Event Type</th>
                  <th className="py-4 px-4 font-semibold text-gray-500">Venue</th>
                  <th className="py-4 px-4 font-semibold text-gray-500">Date & Time</th>
                  <th className="py-4 px-4 font-semibold text-gray-500">Guests</th>
                  <th className="py-4 px-4 font-semibold text-gray-500">Status</th>
                  <th className="py-4 px-4 text-right font-semibold text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-white/2 font-medium ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                {paginatedEvents.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-10 text-center text-gray-500 font-semibold">No moderated events match the filter query.</td>
                  </tr>
                ) : (
                  paginatedEvents.map((e) => {
                    // Status Badge Configurations
                    let statusText = 'Pending';
                    let statusColor = 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400';
                    if (e.status === 'approved' || e.status === 'ongoing' || e.status === 'completed') {
                      statusText = 'Confirmed';
                      statusColor = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400';
                    } else if (e.status === 'cancelled') {
                      statusText = 'Cancelled';
                      statusColor = 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400';
                    }

                    // Format Date and Time
                    const formattedDate = formatEventDate(e.date);
                    const formattedTime = formatEventTime(e.date);

                    // Event Type badge class
                    const getEventTypeStyle = (type) => {
                      const t = type.toLowerCase();
                      if (t === 'wedding') {
                        return 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400';
                      } else if (t === 'corporate') {
                        return 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400';
                      } else if (t === 'party') {
                        return 'bg-pink-100 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400';
                      } else if (t === 'conference') {
                        return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400';
                      }
                      return 'bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400';
                    };

                    return (
                      <tr key={e.id} className={`${isLight ? 'hover:bg-gray-50' : 'hover:bg-white/2'} transition-colors`}>
                        {/* Event Name with Image Thumbnail */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 bg-gray-100 border border-gray-200/50 dark:bg-white/5 dark:border-white/5">
                              <img src={e.image || '/udaipur_palace.png'} alt={e.title} className="w-full h-full object-cover" />
                            </div>
                            <span className={`font-bold truncate text-left ${isLight ? 'text-gray-900' : 'text-white'}`}>{e.title}</span>
                          </div>
                        </td>

                        {/* Event Type Badge */}
                        <td className="py-4 px-4">
                          <span className={`text-[11px] font-bold px-3 py-1 rounded-lg ${getEventTypeStyle(e.event_type)}`}>
                            {e.event_type.charAt(0).toUpperCase() + e.event_type.slice(1)}
                          </span>
                        </td>

                        {/* Location/Venue */}
                        <td className={`py-4 px-4 text-left ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>{e.location}</td>

                        {/* Date and Time Split Layout */}
                        <td className="py-4 px-4 text-left">
                          <div className="flex flex-col gap-0.5">
                            <span className={`font-bold ${isLight ? 'text-gray-800' : 'text-gray-200'}`}>{formattedDate}</span>
                            <span className={`text-[10px] ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>{formattedTime}</span>
                          </div>
                        </td>

                        {/* Guest Count */}
                        <td className={`py-4 px-4 font-semibold text-left ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>{e.guest_count}</td>

                        {/* Status Badge */}
                        <td className="py-4 px-4 text-left">
                          <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${statusColor}`}>
                            {statusText}
                          </span>
                        </td>

                        {/* Actions Button Columns */}
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => router.push(`/events/${e.id}`)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                                isLight ? 'border-gray-200 hover:bg-gray-50 text-gray-700' : 'border-white/10 hover:bg-white/5 text-gray-300'
                              }`}
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View</span>
                            </button>
                            <button
                              onClick={() => setEditingEvent(e)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                                isLight ? 'border-gray-200 hover:bg-gray-50 text-gray-700' : 'border-white/10 hover:bg-white/5 text-gray-300'
                              }`}
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <button className={`p-1.5 rounded-lg border cursor-pointer ${
                              isLight ? 'border-gray-200 hover:bg-gray-50 text-gray-700' : 'border-white/10 hover:bg-white/5 text-gray-400'
                            }`}>
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Pagination Footer segments */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-white/5 text-xs font-semibold">
              <span className={isLight ? 'text-gray-500' : 'text-gray-500'}>
                Showing {showingFrom} to {showingTo} of {filteredEvents.length} events
              </span>
              
              <div className="flex items-center gap-4">
                {/* Page Size Select Dropdown */}
                <div className="relative">
                  <select
                    value={eventPageSize}
                    onChange={e => {
                      setEventPageSize(parseInt(e.target.value));
                      setEventCurrentPage(1);
                    }}
                    className={`appearance-none border rounded-xl pl-3 pr-8 py-2 text-xs font-semibold focus:outline-none cursor-pointer ${
                      isLight ? 'bg-white border-gray-200 text-gray-800 shadow-sm' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                    }`}
                  >
                    <option value={5}>5 per page</option>
                    <option value={10}>10 per page</option>
                    <option value={15}>15 per page</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
                </div>

                {/* Page Index Select Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    disabled={eventCurrentPage === 1}
                    onClick={() => setEventCurrentPage(prev => Math.max(prev - 1, 1))}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg border text-[10px] font-bold transition-all disabled:opacity-30 cursor-pointer ${
                      isLight ? 'border-gray-200 hover:bg-gray-50 text-gray-650' : 'border-white/10 hover:bg-white/5 text-gray-400'
                    }`}
                  >
                    «
                  </button>
                  
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pg = idx + 1;
                    const isActive = pg === eventCurrentPage;
                    return (
                      <button
                        key={pg}
                        onClick={() => setEventCurrentPage(pg)}
                        className={`w-7 h-7 flex items-center justify-center rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#5a2bd4] text-white shadow-md shadow-[#5a2bd4]/15'
                            : isLight
                              ? 'border border-gray-200 hover:bg-gray-50 text-gray-650'
                              : 'border border-white/10 hover:bg-white/5 text-gray-400'
                        }`}
                      >
                        {pg}
                      </button>
                    );
                  })}

                  <button
                    disabled={eventCurrentPage === totalPages}
                    onClick={() => setEventCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg border text-[10px] font-bold transition-all disabled:opacity-30 cursor-pointer ${
                      isLight ? 'border-gray-200 hover:bg-gray-50 text-gray-650' : 'border-white/10 hover:bg-white/5 text-gray-400'
                    }`}
                  >
                    »
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ==================================================== */}
      {/* TAB 3: USER REGISTER (MODERATION VIEW) */}
      {/* ==================================================== */}
      {activeTab === 'users' && (
        <div className="flex flex-col gap-6 animate-scale-up">
          
          {/* Breadcrumb Header Row */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h2 className={`text-xl font-extrabold ${isLight ? 'text-gray-900' : 'text-white'}`}>Users</h2>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-wider">
                <span>Dashboard</span>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-indigo-600 dark:text-indigo-400">Users</span>
              </div>
            </div>
            
            <button
              onClick={() => showToast('Add New User feature coming soon!', 'info')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 px-4.5 rounded-xl transition-all shadow-lg shadow-indigo-600/15 cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4.5 h-4.5 shrink-0" />
              <span>Add New User</span>
            </button>
          </div>

          {/* 4 Stats Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Total Users */}
            <div className={`p-4 rounded-2xl border flex items-center gap-4 text-left transition-all hover:-translate-y-0.5 ${
              isLight ? 'bg-white border-gray-200/80 shadow-sm text-gray-800' : 'bg-white/5 border-white/5 text-white'
            }`}>
              <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>Total Users</span>
                <h4 className="text-xl font-extrabold tracking-tight">{displayTotalUsersCount.toLocaleString()}</h4>
                <span className="text-[10px] font-semibold text-emerald-500 flex items-center gap-0.5 mt-0.5">
                  <TrendingUp className="w-3 h-3" /> 18% this month
                </span>
              </div>
            </div>

            {/* Card 2: Active Users */}
            <div className={`p-4 rounded-2xl border flex items-center gap-4 text-left transition-all hover:-translate-y-0.5 ${
              isLight ? 'bg-white border-gray-200/80 shadow-sm text-gray-800' : 'bg-white/5 border-white/5 text-white'
            }`}>
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>Active Users</span>
                <h4 className="text-xl font-extrabold tracking-tight">{displayActiveUsersCount.toLocaleString()}</h4>
                <span className="text-[10px] font-semibold text-emerald-500 flex items-center gap-0.5 mt-0.5">
                  <TrendingUp className="w-3 h-3" /> 15% this month
                </span>
              </div>
            </div>

            {/* Card 3: Inactive Users */}
            <div className={`p-4 rounded-2xl border flex items-center gap-4 text-left transition-all hover:-translate-y-0.5 ${
              isLight ? 'bg-white border-gray-200/80 shadow-sm text-gray-800' : 'bg-white/5 border-white/5 text-white'
            }`}>
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-500 flex items-center justify-center shrink-0">
                <UserX className="w-5 h-5" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>Inactive Users</span>
                <h4 className="text-xl font-extrabold tracking-tight">{displayInactiveUsersCount.toLocaleString()}</h4>
                <span className="text-[10px] font-semibold text-rose-500 flex items-center gap-0.5 mt-0.5">
                  <TrendingDown className="w-3 h-3" /> 5% this month
                </span>
              </div>
            </div>

            {/* Card 4: New Users */}
            <div className={`p-4 rounded-2xl border flex items-center gap-4 text-left transition-all hover:-translate-y-0.5 ${
              isLight ? 'bg-white border-gray-200/80 shadow-sm text-gray-800' : 'bg-white/5 border-white/5 text-white'
            }`}>
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>New Users (This Month)</span>
                <h4 className="text-xl font-extrabold tracking-tight">{displayNewUsersCount.toLocaleString()}</h4>
                <span className="text-[10px] font-semibold text-emerald-500 flex items-center gap-0.5 mt-0.5">
                  <TrendingUp className="w-3 h-3" /> 12% this month
                </span>
              </div>
            </div>

          </div>

          {/* Filter Toolbar Row */}
          <div className={`p-4 rounded-2xl border flex flex-wrap lg:flex-nowrap items-center gap-3 w-full ${
            isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-white/5 border-white/5'
          }`}>
            {/* Search Input */}
            <div className="relative flex-1 min-w-[280px]">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search by name, email or phone..."
                value={userSearchQuery}
                onChange={e => {
                  setUserSearchQuery(e.target.value);
                  setUserCurrentPage(1);
                }}
                className={`w-full border rounded-xl text-xs pl-10 pr-4 py-3 focus:outline-none focus:border-indigo-500 ${
                  isLight ? 'bg-white border-gray-200 text-gray-900 shadow-sm' : 'bg-white/5 border-white/5 text-white'
                }`}
              />
            </div>

            {/* Roles Dropdown */}
            <div className="relative w-full sm:w-auto">
              <select
                value={userRoleFilter}
                onChange={e => {
                  setUserRoleFilter(e.target.value);
                  setUserCurrentPage(1);
                }}
                className={`appearance-none border rounded-xl text-xs py-3 pl-4 pr-10 focus:outline-none focus:border-indigo-500 font-semibold cursor-pointer w-full sm:w-auto ${
                  isLight ? 'bg-white border-gray-200 text-gray-800 shadow-sm' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                }`}
              >
                <option value="All">All Roles</option>
                <option value="user">User</option>
                <option value="vendor">Vendor</option>
                <option value="admin">Admin</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            {/* Status Dropdown */}
            <div className="relative w-full sm:w-auto">
              <select
                value={userStatusFilter}
                onChange={e => {
                  setUserStatusFilter(e.target.value);
                  setUserCurrentPage(1);
                }}
                className={`appearance-none border rounded-xl text-xs py-3 pl-4 pr-10 focus:outline-none focus:border-indigo-500 font-semibold cursor-pointer w-full sm:w-auto ${
                  isLight ? 'bg-white border-gray-200 text-gray-800 shadow-sm' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                }`}
              >
                <option value="All">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            {/* Date Picker Button */}
            <div className={`flex items-center gap-2 px-3.5 py-3 rounded-xl border text-xs font-semibold cursor-pointer w-full sm:w-auto justify-center ${
              isLight ? 'bg-white border-gray-200 text-gray-700 shadow-sm hover:bg-gray-50' : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/8'
            }`}>
              <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>Select Date Range</span>
            </div>

            {/* Filter Toggle Button */}
            <button className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-xs font-semibold cursor-pointer w-full sm:w-auto justify-center ${
              isLight ? 'bg-white border-gray-200 text-gray-700 shadow-sm hover:bg-gray-50' : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/8'
            }`}>
              <Sliders className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>Filter</span>
            </button>
          </div>

          {/* Users Ledger Table Container */}
          <div className={`p-5 rounded-2xl border flex flex-col gap-4 overflow-x-auto ${
            isLight ? 'bg-white border-gray-200/80 shadow-sm' : 'bg-white/5 border-white/5'
          }`}>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 font-semibold text-gray-500">
                  <th className="py-4 px-4 font-semibold text-gray-500">#</th>
                  <th className="py-4 px-4 font-semibold text-gray-500">Name</th>
                  <th className="py-4 px-4 font-semibold text-gray-500">Email</th>
                  <th className="py-4 px-4 font-semibold text-gray-500">Role</th>
                  <th className="py-4 px-4 font-semibold text-gray-500">Phone</th>
                  <th className="py-4 px-4 font-semibold text-gray-500">Status</th>
                  <th className="py-4 px-4 font-semibold text-gray-500">Joined On</th>
                  <th className="py-4 px-4 text-right font-semibold text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-white/2 font-medium ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-10 text-center text-gray-500 font-semibold">No platform users match the filter query.</td>
                  </tr>
                ) : (
                  paginatedUsers.map((u, idx) => {
                    const initials = getInitials(u.name);
                    const initialsColorClass = getInitialsColor(initials);
                    const mappedStatus = u.status === 'blocked' ? 'Inactive' : 'Active';
                    const statusColor = mappedStatus === 'Active'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                      : 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400';

                    const roleColor = u.role.toLowerCase() === 'admin'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                      : u.role.toLowerCase() === 'vendor'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
                        : 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400';

                    const formattedJoinedDate = formatEventDate(u.created_at);

                    return (
                      <tr key={u.id} className={`${isLight ? 'hover:bg-gray-50' : 'hover:bg-white/2'} transition-colors relative`}>
                        {/* # Row Index */}
                        <td className="py-4 px-4 font-bold text-gray-400">
                          {userStartIndex + idx + 1}
                        </td>

                        {/* Name with initials avatar */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 ${initialsColorClass}`}>
                              {initials}
                            </div>
                            <span className={`font-bold truncate text-left ${isLight ? 'text-gray-900' : 'text-white'}`}>
                              {u.name}
                            </span>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="py-4 px-4 font-medium text-left">{u.email}</td>

                        {/* Role Tag */}
                        <td className="py-4 px-4 text-left">
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg capitalize ${roleColor}`}>
                            {u.role}
                          </span>
                        </td>

                        {/* Phone */}
                        <td className="py-4 px-4 text-left font-medium">{u.phone || '+91 98765 43210'}</td>

                        {/* Status badge */}
                        <td className="py-4 px-4 text-left">
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${statusColor}`}>
                            {mappedStatus}
                          </span>
                        </td>

                        {/* Joined Date */}
                        <td className={`py-4 px-4 text-left font-medium ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                          {formattedJoinedDate}
                        </td>

                        {/* Actions buttons */}
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2 relative">
                            <button
                              onClick={() => showToast(`Viewing profile of ${u.name}`, 'info')}
                              className={`flex items-center justify-center p-1.5 rounded-lg border cursor-pointer ${
                                isLight ? 'border-gray-200 hover:bg-gray-50 text-gray-700' : 'border-white/10 hover:bg-white/5 text-gray-300'
                              }`}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setActiveUserMenuId(activeUserMenuId === u.id ? null : u.id)}
                              className={`p-1.5 rounded-lg border cursor-pointer ${
                                isLight ? 'border-gray-200 hover:bg-gray-50 text-gray-700' : 'border-white/10 hover:bg-white/5 text-gray-300'
                              }`}
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>

                            {/* Dropdown Options popover menu */}
                            {activeUserMenuId === u.id && (
                              <div className="absolute right-0 top-10 w-44 glass-panel border rounded-xl shadow-2xl p-2 z-50 animate-scale-up flex flex-col text-left">
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider px-2 py-1">Moderate User</span>
                                
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleToggleBlock(u.id, u.status || 'active');
                                    setActiveUserMenuId(null);
                                  }}
                                  className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold text-gray-300 hover:bg-white/5 hover:text-white transition-all cursor-pointer"
                                >
                                  {u.status === 'blocked' ? '🔓 Unblock Account' : '🔒 Block Account'}
                                </button>

                                <div className="border-t border-white/5 my-1" />
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider px-2 py-1">Set System Role</span>
                                
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleChangeRole(u.id, 'user');
                                    setActiveUserMenuId(null);
                                  }}
                                  disabled={u.id === user?.id}
                                  className="w-full text-left px-2 py-1 rounded-lg text-xs font-semibold text-gray-300 hover:bg-white/5 hover:text-white transition-all disabled:opacity-30 cursor-pointer"
                                >
                                  👤 Make Standard User
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleChangeRole(u.id, 'vendor');
                                    setActiveUserMenuId(null);
                                  }}
                                  disabled={u.id === user?.id}
                                  className="w-full text-left px-2 py-1 rounded-lg text-xs font-semibold text-gray-300 hover:bg-white/5 hover:text-white transition-all disabled:opacity-30 cursor-pointer"
                                >
                                  🤝 Make Service Vendor
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleChangeRole(u.id, 'admin');
                                    setActiveUserMenuId(null);
                                  }}
                                  disabled={u.id === user?.id}
                                  className="w-full text-left px-2 py-1 rounded-lg text-xs font-semibold text-gray-300 hover:bg-white/5 hover:text-white transition-all disabled:opacity-30 cursor-pointer"
                                >
                                  🛡️ Make System Admin
                                </button>

                                {u.id !== user?.id && (
                                  <>
                                    <div className="border-t border-white/5 my-1" />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleDeleteUser(u.id, u.name);
                                        setActiveUserMenuId(null);
                                      }}
                                      className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold text-rose-450 hover:bg-rose-500/10 hover:text-rose-400 transition-all cursor-pointer"
                                    >
                                      🗑️ Delete Account
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Pagination Footer segments */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-white/5 text-xs font-semibold">
              <span className={isLight ? 'text-gray-500' : 'text-gray-500'}>
                Showing {userShowingFrom} to {userShowingTo} of {filteredUsers.length} users
              </span>
              
              <div className="flex items-center gap-4">
                {/* Page Size Select Dropdown */}
                <div className="relative">
                  <select
                    value={userPageSize}
                    onChange={e => {
                      setUserPageSize(parseInt(e.target.value));
                      setUserCurrentPage(1);
                    }}
                    className={`appearance-none border rounded-xl pl-3 pr-8 py-2 text-xs font-semibold focus:outline-none cursor-pointer ${
                      isLight ? 'bg-white border-gray-200 text-gray-800 shadow-sm' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                    }`}
                  >
                    <option value={5}>5 per page</option>
                    <option value={10}>10 per page</option>
                    <option value={15}>15 per page</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
                </div>

                {/* Page Index Select Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    disabled={userCurrentPage === 1}
                    onClick={() => setUserCurrentPage(prev => Math.max(prev - 1, 1))}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg border text-[10px] font-bold transition-all disabled:opacity-30 cursor-pointer ${
                      isLight ? 'border-gray-200 hover:bg-gray-50 text-gray-650' : 'border-white/10 hover:bg-white/5 text-gray-400'
                    }`}
                  >
                    «
                  </button>
                  
                  {Array.from({ length: userTotalPages }).map((_, idx) => {
                    const pg = idx + 1;
                    const isActive = pg === userCurrentPage;
                    return (
                      <button
                        key={pg}
                        onClick={() => setUserCurrentPage(pg)}
                        className={`w-7 h-7 flex items-center justify-center rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#5a2bd4] text-white shadow-md shadow-[#5a2bd4]/15'
                            : isLight
                              ? 'border border-gray-200 hover:bg-gray-50 text-gray-650'
                              : 'border border-white/10 hover:bg-white/5 text-gray-400'
                        }`}
                      >
                        {pg}
                      </button>
                    );
                  })}

                  <button
                    disabled={userCurrentPage === userTotalPages}
                    onClick={() => setUserCurrentPage(prev => Math.min(prev + 1, userTotalPages))}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg border text-[10px] font-bold transition-all disabled:opacity-30 cursor-pointer ${
                      isLight ? 'border-gray-200 hover:bg-gray-50 text-gray-650' : 'border-white/10 hover:bg-white/5 text-gray-400'
                    }`}
                  >
                    »
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 4: VENUES LEDGER (MODERATION VIEW) */}
      {/* ==================================================== */}
      {activeTab === 'venues' && (
        <div className="flex flex-col gap-6 animate-scale-up">
          
          {/* Breadcrumb Header Row */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h2 className={`text-xl font-extrabold ${isLight ? 'text-gray-900' : 'text-white'}`}>Venues</h2>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-wider">
                <span>Dashboard</span>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-indigo-600 dark:text-indigo-400">Venues</span>
              </div>
            </div>
            
            <button
              onClick={() => {
                setNewVenueData({
                  name: '',
                  location: '',
                  event_type: 'hotel',
                  guest_count: 200,
                  status: 'active',
                  image: '/udaipur_palace.png'
                });
                setIsAddVenueModalOpen(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 px-4.5 rounded-xl transition-all shadow-lg shadow-indigo-600/15 cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4.5 h-4.5 shrink-0" />
              <span>Add New Venue</span>
            </button>
          </div>

          {/* 4 Stats Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Total Venues */}
            <div className={`p-4 rounded-2xl border flex items-center gap-4 text-left transition-all hover:-translate-y-0.5 ${
              isLight ? 'bg-white border-gray-200/80 shadow-sm text-gray-800' : 'bg-white/5 border-white/5 text-white'
            }`}>
              <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Building className="w-5 h-5" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>Total Venues</span>
                <h4 className="text-xl font-extrabold tracking-tight">{displayTotalVenues.toLocaleString()}</h4>
                <span className="text-[10px] font-semibold text-emerald-500 flex items-center gap-0.5 mt-0.5">
                  <TrendingUp className="w-3 h-3" /> 8% this month
                </span>
              </div>
            </div>

            {/* Card 2: Active Venues */}
            <div className={`p-4 rounded-2xl border flex items-center gap-4 text-left transition-all hover:-translate-y-0.5 ${
              isLight ? 'bg-white border-gray-200/80 shadow-sm text-gray-800' : 'bg-white/5 border-white/5 text-white'
            }`}>
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Check className="w-5 h-5" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>Active Venues</span>
                <h4 className="text-xl font-extrabold tracking-tight">{displayActiveVenues.toLocaleString()}</h4>
                <span className="text-[10px] font-semibold text-emerald-500 flex items-center gap-0.5 mt-0.5">
                  <TrendingUp className="w-3 h-3" /> 10% this month
                </span>
              </div>
            </div>

            {/* Card 3: Inactive Venues */}
            <div className={`p-4 rounded-2xl border flex items-center gap-4 text-left transition-all hover:-translate-y-0.5 ${
              isLight ? 'bg-white border-gray-200/80 shadow-sm text-gray-800' : 'bg-white/5 border-white/5 text-white'
            }`}>
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-500 flex items-center justify-center shrink-0">
                <Pause className="w-4 h-4 transform rotate-90" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>Inactive Venues</span>
                <h4 className="text-xl font-extrabold tracking-tight">{displayInactiveVenues.toLocaleString()}</h4>
                <span className="text-[10px] font-semibold text-rose-500 flex items-center gap-0.5 mt-0.5">
                  <TrendingDown className="w-3 h-3" /> 3% this month
                </span>
              </div>
            </div>

            {/* Card 4: New Venues */}
            <div className={`p-4 rounded-2xl border flex items-center gap-4 text-left transition-all hover:-translate-y-0.5 ${
              isLight ? 'bg-white border-gray-200/80 shadow-sm text-gray-800' : 'bg-white/5 border-white/5 text-white'
            }`}>
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Building className="w-5 h-5" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>New Venues (This Month)</span>
                <h4 className="text-xl font-extrabold tracking-tight">{displayNewVenues.toLocaleString()}</h4>
                <span className="text-[10px] font-semibold text-emerald-500 flex items-center gap-0.5 mt-0.5">
                  <TrendingUp className="w-3 h-3" /> 20% this month
                </span>
              </div>
            </div>

          </div>

          {/* Filter Toolbar Row */}
          <div className={`p-4 rounded-2xl border flex flex-wrap lg:flex-nowrap items-center gap-3 w-full ${
            isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-white/5 border-white/5'
          }`}>
            {/* Search Input */}
            <div className="relative flex-1 min-w-[280px]">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search by venue name or location..."
                value={venueSearchQuery}
                onChange={e => {
                  setVenueSearchQuery(e.target.value);
                  setVenueCurrentPage(1);
                }}
                className={`w-full border rounded-xl text-xs pl-10 pr-4 py-3 focus:outline-none focus:border-indigo-500 ${
                  isLight ? 'bg-white border-gray-200 text-gray-900 shadow-sm' : 'bg-white/5 border-white/5 text-white'
                }`}
              />
            </div>

            {/* Status Dropdown */}
            <div className="relative w-full sm:w-auto">
              <select
                value={venueStatusFilter}
                onChange={e => {
                  setVenueStatusFilter(e.target.value);
                  setVenueCurrentPage(1);
                }}
                className={`appearance-none border rounded-xl text-xs py-3 pl-4 pr-10 focus:outline-none focus:border-indigo-500 font-semibold cursor-pointer w-full sm:w-auto ${
                  isLight ? 'bg-white border-gray-200 text-gray-800 shadow-sm' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                }`}
              >
                <option value="All">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            {/* Venue Type Dropdown */}
            <div className="relative w-full sm:w-auto">
              <select
                value={venueTypeFilter}
                onChange={e => {
                  setVenueTypeFilter(e.target.value);
                  setVenueCurrentPage(1);
                }}
                className={`appearance-none border rounded-xl text-xs py-3 pl-4 pr-10 focus:outline-none focus:border-indigo-500 font-semibold cursor-pointer w-full sm:w-auto ${
                  isLight ? 'bg-white border-gray-200 text-gray-800 shadow-sm' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                }`}
              >
                <option value="All">All Venue Types</option>
                <option value="hotel">Hotel</option>
                <option value="resort">Resort</option>
                <option value="palace">Palace</option>
                <option value="banquet">Banquet</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            {/* Date Picker Button */}
            <div className={`flex items-center gap-2 px-3.5 py-3 rounded-xl border text-xs font-semibold cursor-pointer w-full sm:w-auto justify-center ${
              isLight ? 'bg-white border-gray-200 text-gray-700 shadow-sm hover:bg-gray-50' : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/8'
            }`}>
              <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>Select Date Range</span>
            </div>

            {/* Filter Toggle Button */}
            <button className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-xs font-semibold cursor-pointer w-full sm:w-auto justify-center ${
              isLight ? 'bg-white border-gray-200 text-gray-700 shadow-sm hover:bg-gray-50' : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/8'
            }`}>
              <Sliders className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>Filter</span>
            </button>
          </div>

          {/* Venues Ledger Table Container */}
          <div className={`p-5 rounded-2xl border flex flex-col gap-4 overflow-x-auto ${
            isLight ? 'bg-white border-gray-200/80 shadow-sm' : 'bg-white/5 border-white/5'
          }`}>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 font-semibold text-gray-500">
                  <th className="py-4 px-4 font-semibold text-gray-500">#</th>
                  <th className="py-4 px-4 font-semibold text-gray-500">Venue Name</th>
                  <th className="py-4 px-4 font-semibold text-gray-500">Location</th>
                  <th className="py-4 px-4 font-semibold text-gray-500">Venue Type</th>
                  <th className="py-4 px-4 font-semibold text-gray-500">Capacity</th>
                  <th className="py-4 px-4 font-semibold text-gray-500">Status</th>
                  <th className="py-4 px-4 font-semibold text-gray-500">Added On</th>
                  <th className="py-4 px-4 text-right font-semibold text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-white/2 font-medium ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                {paginatedVenues.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-10 text-center text-gray-500 font-semibold">No platform venues match the filter query.</td>
                  </tr>
                ) : (
                  paginatedVenues.map((v, idx) => {
                    const mappedStatus = v.status === 'active' ? 'Active' : 'Inactive';
                    const statusColor = mappedStatus === 'Active'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                      : 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400';

                    const typeColor = v.event_type.toLowerCase() === 'palace'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                      : v.event_type.toLowerCase() === 'resort'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                        : v.event_type.toLowerCase() === 'banquet'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
                          : 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400';

                    const formattedAddedDate = formatEventDate(v.created_at);

                    return (
                      <tr key={v.id} className={`${isLight ? 'hover:bg-gray-50' : 'hover:bg-white/2'} transition-colors relative`}>
                        {/* # Row Index */}
                        <td className="py-4 px-4 font-bold text-gray-400">
                          {venueStartIndex + idx + 1}
                        </td>

                        {/* Venue Name with image thumbnail */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-12 h-8 rounded-lg overflow-hidden shrink-0 bg-gray-150 border border-gray-200/50 dark:bg-white/5 dark:border-white/5">
                              <img src={v.image || '/udaipur_palace.png'} alt={v.name} className="w-full h-full object-cover" />
                            </div>
                            <span className={`font-bold truncate text-left ${isLight ? 'text-gray-900' : 'text-white'}`}>
                              {v.name}
                            </span>
                          </div>
                        </td>

                        {/* Location */}
                        <td className="py-4 px-4 font-medium text-left">{v.location}</td>

                        {/* Venue Type Tag */}
                        <td className="py-4 px-4 text-left">
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg capitalize ${typeColor}`}>
                            {v.event_type}
                          </span>
                        </td>

                        {/* Capacity */}
                        <td className="py-4 px-4 text-left font-medium">{v.guest_count} Guests</td>

                        {/* Status Badge */}
                        <td className="py-4 px-4 text-left">
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${statusColor}`}>
                            {mappedStatus}
                          </span>
                        </td>

                        {/* Added Date */}
                        <td className={`py-4 px-4 text-left font-medium ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                          {formattedAddedDate}
                        </td>

                        {/* Actions buttons */}
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2 relative">
                            <button
                              onClick={() => showToast(`Viewing analytics of ${v.name}`, 'info')}
                              className={`flex items-center justify-center p-1.5 rounded-lg border cursor-pointer ${
                                isLight ? 'border-gray-200 hover:bg-gray-50 text-gray-700' : 'border-white/10 hover:bg-white/5 text-gray-300'
                              }`}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingVenue(v)}
                              className={`flex items-center justify-center p-1.5 rounded-lg border cursor-pointer ${
                                isLight ? 'border-gray-200 hover:bg-gray-50 text-gray-700' : 'border-white/10 hover:bg-white/5 text-gray-300'
                              }`}
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setActiveVenueMenuId(activeVenueMenuId === v.id ? null : v.id)}
                              className={`p-1.5 rounded-lg border cursor-pointer ${
                                isLight ? 'border-gray-200 hover:bg-gray-50 text-gray-700' : 'border-white/10 hover:bg-white/5 text-gray-400'
                              }`}
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>

                            {/* Dropdown Options popover menu */}
                            {activeVenueMenuId === v.id && (
                              <div className="absolute right-0 top-10 w-44 glass-panel border rounded-xl shadow-2xl p-2 z-50 animate-scale-up flex flex-col text-left">
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider px-2 py-1">Moderate Venue</span>
                                
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleToggleVenueStatus(v.id, v.status);
                                    setActiveVenueMenuId(null);
                                  }}
                                  className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold text-gray-300 hover:bg-white/5 hover:text-white transition-all cursor-pointer"
                                >
                                  {v.status === 'active' ? '🔒 Deactivate Venue' : '🔓 Activate Venue'}
                                </button>

                                <div className="border-t border-white/5 my-1" />
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleDeleteVenue(v.id, v.name);
                                    setActiveVenueMenuId(null);
                                  }}
                                  className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold text-rose-450 hover:bg-rose-500/10 hover:text-rose-400 transition-all cursor-pointer"
                                >
                                  🗑️ Delete Venue
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Pagination Footer segments */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-white/5 text-xs font-semibold">
              <span className={isLight ? 'text-gray-500' : 'text-gray-500'}>
                Showing {venueShowingFrom} to {venueShowingTo} of {filteredVenues.length} venues
              </span>
              
              <div className="flex items-center gap-4">
                {/* Page Size Select Dropdown */}
                <div className="relative">
                  <select
                    value={venuePageSize}
                    onChange={e => {
                      setVenuePageSize(parseInt(e.target.value));
                      setVenueCurrentPage(1);
                    }}
                    className={`appearance-none border rounded-xl pl-3 pr-8 py-2 text-xs font-semibold focus:outline-none cursor-pointer ${
                      isLight ? 'bg-white border-gray-200 text-gray-800 shadow-sm' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                    }`}
                  >
                    <option value={5}>5 per page</option>
                    <option value={10}>10 per page</option>
                    <option value={15}>15 per page</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
                </div>

                {/* Page Index Select Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    disabled={venueCurrentPage === 1}
                    onClick={() => setVenueCurrentPage(prev => Math.max(prev - 1, 1))}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg border text-[10px] font-bold transition-all disabled:opacity-30 cursor-pointer ${
                      isLight ? 'border-gray-200 hover:bg-gray-50 text-gray-650' : 'border-white/10 hover:bg-white/5 text-gray-400'
                    }`}
                  >
                    «
                  </button>
                  
                  {Array.from({ length: venueTotalPages }).map((_, idx) => {
                    const pg = idx + 1;
                    const isActive = pg === venueCurrentPage;
                    return (
                      <button
                        key={pg}
                        onClick={() => setVenueCurrentPage(pg)}
                        className={`w-7 h-7 flex items-center justify-center rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#5a2bd4] text-white shadow-md shadow-[#5a2bd4]/15'
                            : isLight
                              ? 'border border-gray-200 hover:bg-gray-50 text-gray-650'
                              : 'border border-white/10 hover:bg-white/5 text-gray-400'
                        }`}
                      >
                        {pg}
                      </button>
                    );
                  })}

                  <button
                    disabled={venueCurrentPage === venueTotalPages}
                    onClick={() => setVenueCurrentPage(prev => Math.min(prev + 1, venueTotalPages))}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg border text-[10px] font-bold transition-all disabled:opacity-30 cursor-pointer ${
                      isLight ? 'border-gray-200 hover:bg-gray-50 text-gray-650' : 'border-white/10 hover:bg-white/5 text-gray-400'
                    }`}
                  >
                    »
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 5: VENDORS (TELEMETRY LEDGER VIEW) */}
      {/* ==================================================== */}
      {activeTab === 'vendors' && (
        <div className="flex flex-col gap-6 animate-scale-up">
          
          {/* Breadcrumb Header Row */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h2 className={`text-xl font-extrabold ${isLight ? 'text-gray-900' : 'text-white'}`}>Vendors</h2>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-wider">
                <span>Dashboard</span>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-indigo-600 dark:text-indigo-400">Vendors</span>
              </div>
            </div>
            
            <button
              onClick={() => {
                setNewVendorData({
                  name: '',
                  category: 'Catering',
                  contact_person: '',
                  phone: '',
                  email: '',
                  status: 'active',
                  image: '/celebrate_collage1.png'
                });
                setIsAddVendorModalOpen(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 px-4.5 rounded-xl transition-all shadow-lg shadow-indigo-600/15 cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4.5 h-4.5 shrink-0" />
              <span>Add New Vendor</span>
            </button>
          </div>

          {/* 4 Stats Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Total Vendors */}
            <div className={`p-4 rounded-2xl border flex items-center gap-4 text-left transition-all hover:-translate-y-0.5 ${
              isLight ? 'bg-white border-gray-200/80 shadow-sm text-gray-800' : 'bg-white/5 border-white/5 text-white'
            }`}>
              <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Star className="w-5 h-5" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-gray-400' : 'text-gray-505'}`}>Total Vendors</span>
                <h4 className="text-xl font-extrabold tracking-tight">{displayTotalVendorsCount.toLocaleString()}</h4>
                <span className="text-[10px] font-semibold text-emerald-500 flex items-center gap-0.5 mt-0.5">
                  <TrendingUp className="w-3 h-3" /> 15% this month
                </span>
              </div>
            </div>

            {/* Card 2: Active Vendors */}
            <div className={`p-4 rounded-2xl border flex items-center gap-4 text-left transition-all hover:-translate-y-0.5 ${
              isLight ? 'bg-white border-gray-200/80 shadow-sm text-gray-800' : 'bg-white/5 border-white/5 text-white'
            }`}>
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Check className="w-5 h-5" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-gray-400' : 'text-gray-505'}`}>Active Vendors</span>
                <h4 className="text-xl font-extrabold tracking-tight">{displayActiveVendorsCount.toLocaleString()}</h4>
                <span className="text-[10px] font-semibold text-emerald-500 flex items-center gap-0.5 mt-0.5">
                  <TrendingUp className="w-3 h-3" /> 12% this month
                </span>
              </div>
            </div>

            {/* Card 3: Inactive Vendors */}
            <div className={`p-4 rounded-2xl border flex items-center gap-4 text-left transition-all hover:-translate-y-0.5 ${
              isLight ? 'bg-white border-gray-200/80 shadow-sm text-gray-800' : 'bg-white/5 border-white/5 text-white'
            }`}>
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-500 flex items-center justify-center shrink-0">
                <Pause className="w-4 h-4 transform rotate-90" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-gray-400' : 'text-gray-505'}`}>Inactive Vendors</span>
                <h4 className="text-xl font-extrabold tracking-tight">{displayInactiveVendorsCount.toLocaleString()}</h4>
                <span className="text-[10px] font-semibold text-rose-500 flex items-center gap-0.5 mt-0.5">
                  <TrendingDown className="w-3 h-3" /> 2% this month
                </span>
              </div>
            </div>

            {/* Card 4: New Vendors */}
            <div className={`p-4 rounded-2xl border flex items-center gap-4 text-left transition-all hover:-translate-y-0.5 ${
              isLight ? 'bg-white border-gray-200/80 shadow-sm text-gray-800' : 'bg-white/5 border-white/5 text-white'
            }`}>
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Star className="w-5 h-5" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-gray-400' : 'text-gray-505'}`}>New Vendors (This Month)</span>
                <h4 className="text-xl font-extrabold tracking-tight">{displayNewVendorsCount.toLocaleString()}</h4>
                <span className="text-[10px] font-semibold text-emerald-500 flex items-center gap-0.5 mt-0.5">
                  <TrendingUp className="w-3 h-3" /> 10% this month
                </span>
              </div>
            </div>

          </div>

          {/* Filter Toolbar Row */}
          <div className={`p-4 rounded-2xl border flex flex-wrap lg:flex-nowrap items-center gap-3 w-full ${
            isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-white/5 border-white/5'
          }`}>
            {/* Search Input */}
            <div className="relative flex-1 min-w-[280px]">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search by vendor name, contact person, phone or email..."
                value={vendorSearchQuery}
                onChange={e => {
                  setVendorSearchQuery(e.target.value);
                  setVendorCurrentPage(1);
                }}
                className={`w-full border rounded-xl text-xs pl-10 pr-4 py-3 focus:outline-none focus:border-indigo-500 ${
                  isLight ? 'bg-white border-gray-200 text-gray-900 shadow-sm' : 'bg-white/5 border-white/5 text-white'
                }`}
              />
            </div>

            {/* Status Dropdown */}
            <div className="relative w-full sm:w-auto">
              <select
                value={vendorStatusFilter}
                onChange={e => {
                  setVendorStatusFilter(e.target.value);
                  setVendorCurrentPage(1);
                }}
                className={`appearance-none border rounded-xl text-xs py-3 pl-4 pr-10 focus:outline-none focus:border-indigo-500 font-semibold cursor-pointer w-full sm:w-auto ${
                  isLight ? 'bg-white border-gray-200 text-gray-800 shadow-sm' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                }`}
              >
                <option value="All">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            {/* Category Dropdown */}
            <div className="relative w-full sm:w-auto">
              <select
                value={vendorCategoryFilter}
                onChange={e => {
                  setVendorCategoryFilter(e.target.value);
                  setVendorCurrentPage(1);
                }}
                className={`appearance-none border rounded-xl text-xs py-3 pl-4 pr-10 focus:outline-none focus:border-indigo-500 font-semibold cursor-pointer w-full sm:w-auto ${
                  isLight ? 'bg-white border-gray-200 text-gray-800 shadow-sm' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                }`}
              >
                <option value="All">All Categories</option>
                <option value="Catering">Catering</option>
                <option value="Decoration">Decoration</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Photography">Photography</option>
                <option value="Event Planner">Event Planner</option>
                <option value="Transport">Transport</option>
                <option value="Equipment">Equipment</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            {/* Date Picker Button */}
            <div className={`flex items-center gap-2 px-3.5 py-3 rounded-xl border text-xs font-semibold cursor-pointer w-full sm:w-auto justify-center ${
              isLight ? 'bg-white border-gray-200 text-gray-700 shadow-sm hover:bg-gray-50' : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/8'
            }`}>
              <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>Select Date Range</span>
            </div>

            {/* Filter Toggle Button */}
            <button className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-xs font-semibold cursor-pointer w-full sm:w-auto justify-center ${
              isLight ? 'bg-white border-gray-200 text-gray-700 shadow-sm hover:bg-gray-50' : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/8'
            }`}>
              <Sliders className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>Filter</span>
            </button>
          </div>

          {/* Vendors Ledger Table Container */}
          <div className={`p-5 rounded-2xl border flex flex-col gap-4 overflow-x-auto ${
            isLight ? 'bg-white border-gray-200/80 shadow-sm' : 'bg-white/5 border-white/5'
          }`}>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 font-semibold text-gray-500">
                  <th className="py-4 px-4 font-semibold text-gray-500">#</th>
                  <th className="py-4 px-4 font-semibold text-gray-500">Vendor Name</th>
                  <th className="py-4 px-4 font-semibold text-gray-500">Category</th>
                  <th className="py-4 px-4 font-semibold text-gray-500">Contact Person</th>
                  <th className="py-4 px-4 font-semibold text-gray-500">Phone</th>
                  <th className="py-4 px-4 font-semibold text-gray-500">Email</th>
                  <th className="py-4 px-4 font-semibold text-gray-500">Status</th>
                  <th className="py-4 px-4 font-semibold text-gray-500">Added On</th>
                  <th className="py-4 px-4 text-right font-semibold text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-white/2 font-medium ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                {paginatedVendors.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-10 text-center text-gray-500 font-semibold">No platform vendors match the filter query.</td>
                  </tr>
                ) : (
                  paginatedVendors.map((v, idx) => {
                    const mappedStatus = v.status === 'active' ? 'Active' : 'Inactive';
                    const statusColor = mappedStatus === 'Active'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                      : 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400';

                    const categoryColor = v.category.toLowerCase() === 'catering'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                      : v.category.toLowerCase() === 'decoration'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400'
                        : v.category.toLowerCase() === 'entertainment'
                          ? 'bg-pink-100 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400'
                          : v.category.toLowerCase() === 'photography'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
                            : v.category.toLowerCase() === 'event planner'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400';

                    const formattedAddedDate = formatEventDate(v.created_at);

                    return (
                      <tr key={v.id} className={`${isLight ? 'hover:bg-gray-50' : 'hover:bg-white/2'} transition-colors relative`}>
                        {/* # Row Index */}
                        <td className="py-4 px-4 font-bold text-gray-400">
                          {vendorStartIndex + idx + 1}
                        </td>

                        {/* Vendor Name with image thumbnail */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-12 h-8 rounded-lg overflow-hidden shrink-0 bg-gray-150 border border-gray-200/50 dark:bg-white/5 dark:border-white/5">
                              <img src={v.image || '/celebrate_collage1.png'} alt={v.name} className="w-full h-full object-cover" />
                            </div>
                            <span className={`font-bold truncate text-left ${isLight ? 'text-gray-900' : 'text-white'}`}>
                              {v.name}
                            </span>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-4 px-4 text-left">
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg capitalize ${categoryColor}`}>
                            {v.category}
                          </span>
                        </td>

                        {/* Contact Person */}
                        <td className="py-4 px-4 font-medium text-left">{v.contact_person}</td>

                        {/* Phone */}
                        <td className="py-4 px-4 text-left font-medium">{v.phone}</td>

                        {/* Email */}
                        <td className="py-4 px-4 text-left font-medium">{v.email}</td>

                        {/* Status Badge */}
                        <td className="py-4 px-4 text-left">
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${statusColor}`}>
                            {mappedStatus}
                          </span>
                        </td>

                        {/* Added Date */}
                        <td className={`py-4 px-4 text-left font-medium ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                          {formattedAddedDate}
                        </td>

                        {/* Actions buttons */}
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2 relative">
                            <button
                              onClick={() => showToast(`Viewing analytics of ${v.name}`, 'info')}
                              className={`flex items-center justify-center p-1.5 rounded-lg border cursor-pointer ${
                                isLight ? 'border-gray-200 hover:bg-gray-50 text-gray-700' : 'border-white/10 hover:bg-white/5 text-gray-300'
                              }`}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingVendor(v)}
                              className={`flex items-center justify-center p-1.5 rounded-lg border cursor-pointer ${
                                isLight ? 'border-gray-200 hover:bg-gray-50 text-gray-700' : 'border-white/10 hover:bg-white/5 text-gray-300'
                              }`}
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setActiveVendorMenuId(activeVendorMenuId === v.id ? null : v.id)}
                              className={`p-1.5 rounded-lg border cursor-pointer ${
                                isLight ? 'border-gray-200 hover:bg-gray-50 text-gray-700' : 'border-white/10 hover:bg-white/5 text-gray-400'
                              }`}
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>

                            {/* Dropdown Options popover menu */}
                            {activeVendorMenuId === v.id && (
                              <div className="absolute right-0 top-10 w-44 glass-panel border rounded-xl shadow-2xl p-2 z-50 animate-scale-up flex flex-col text-left">
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider px-2 py-1">Moderate Vendor</span>
                                
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleToggleVendorStatus(v.id, v.status);
                                    setActiveVendorMenuId(null);
                                  }}
                                  className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold text-gray-300 hover:bg-white/5 hover:text-white transition-all cursor-pointer"
                                >
                                  {v.status === 'active' ? '🔒 Deactivate Vendor' : '🔓 Activate Vendor'}
                                </button>

                                <div className="border-t border-white/5 my-1" />
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleDeleteVendor(v.id, v.name);
                                    setActiveVendorMenuId(null);
                                  }}
                                  className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold text-rose-450 hover:bg-rose-500/10 hover:text-rose-400 transition-all cursor-pointer"
                                >
                                  🗑️ Delete Vendor
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Pagination Footer segments */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-white/5 text-xs font-semibold">
              <span className={isLight ? 'text-gray-500' : 'text-gray-500'}>
                Showing {vendorShowingFrom} to {vendorShowingTo} of {filteredVendors.length} vendors
              </span>
              
              <div className="flex items-center gap-4">
                {/* Page Size Select Dropdown */}
                <div className="relative">
                  <select
                    value={vendorPageSize}
                    onChange={e => {
                      setVendorPageSize(parseInt(e.target.value));
                      setVendorCurrentPage(1);
                    }}
                    className={`appearance-none border rounded-xl pl-3 pr-8 py-2 text-xs font-semibold focus:outline-none cursor-pointer ${
                      isLight ? 'bg-white border-gray-200 text-gray-800 shadow-sm' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                    }`}
                  >
                    <option value={5}>5 per page</option>
                    <option value={10}>10 per page</option>
                    <option value={15}>15 per page</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
                </div>

                {/* Page Index Select Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    disabled={vendorCurrentPage === 1}
                    onClick={() => setVendorCurrentPage(prev => Math.max(prev - 1, 1))}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg border text-[10px] font-bold transition-all disabled:opacity-30 cursor-pointer ${
                      isLight ? 'border-gray-200 hover:bg-gray-50 text-gray-650' : 'border-white/10 hover:bg-white/5 text-gray-400'
                    }`}
                  >
                    «
                  </button>
                  
                  {Array.from({ length: vendorTotalPages }).map((_, idx) => {
                    const pg = idx + 1;
                    const isActive = pg === vendorCurrentPage;
                    return (
                      <button
                        key={pg}
                        onClick={() => setVendorCurrentPage(pg)}
                        className={`w-7 h-7 flex items-center justify-center rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#5a2bd4] text-white shadow-md shadow-[#5a2bd4]/15'
                            : isLight
                              ? 'border border-gray-200 hover:bg-gray-50 text-gray-650'
                              : 'border border-white/10 hover:bg-white/5 text-gray-400'
                        }`}
                      >
                        {pg}
                      </button>
                    );
                  })}

                  <button
                    disabled={vendorCurrentPage === vendorTotalPages}
                    onClick={() => setVendorCurrentPage(prev => Math.min(prev + 1, vendorTotalPages))}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg border text-[10px] font-bold transition-all disabled:opacity-30 cursor-pointer ${
                      isLight ? 'border-gray-200 hover:bg-gray-50 text-gray-650' : 'border-white/10 hover:bg-white/5 text-gray-400'
                    }`}
                  >
                    »
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 6: BOOKINGS (ADMINISTRATIVE TELEMETRY LEDGER VIEW) */}
      {/* ==================================================== */}
      {activeTab === 'bookings' && (
        <div className="flex flex-col gap-6 animate-scale-up">
          
          {/* Breadcrumb Header Row */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h2 className={`text-xl font-extrabold ${isLight ? 'text-gray-900' : 'text-white'}`}>Bookings</h2>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-wider">
                <span>Dashboard</span>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-indigo-600 dark:text-indigo-400">Bookings</span>
              </div>
            </div>
            
            <button
              onClick={() => showToast('Exporting bookings ledger...', 'info')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 px-4.5 rounded-xl transition-all shadow-lg shadow-indigo-600/15 cursor-pointer flex items-center gap-2"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>Export Bookings</span>
            </button>
          </div>

          {/* 4 Stats Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Total Bookings */}
            <div className={`p-4 rounded-2xl border flex items-center gap-4 text-left transition-all hover:-translate-y-0.5 ${
              isLight ? 'bg-white border-gray-200/80 shadow-sm text-gray-800' : 'bg-white/5 border-white/5 text-white'
            }`}>
              <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-gray-400' : 'text-gray-505'}`}>Total Bookings</span>
                <h4 className="text-xl font-extrabold tracking-tight">{displayTotalBookings.toLocaleString()}</h4>
                <span className="text-[10px] font-semibold text-emerald-500 flex items-center gap-0.5 mt-0.5">
                  <TrendingUp className="w-3 h-3" /> 15% this month
                </span>
              </div>
            </div>

            {/* Card 2: Confirmed */}
            <div className={`p-4 rounded-2xl border flex items-center gap-4 text-left transition-all hover:-translate-y-0.5 ${
              isLight ? 'bg-white border-gray-200/80 shadow-sm text-gray-800' : 'bg-white/5 border-white/5 text-white'
            }`}>
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-gray-400' : 'text-gray-505'}`}>Confirmed</span>
                <h4 className="text-xl font-extrabold tracking-tight">{displayConfirmedBookings.toLocaleString()}</h4>
                <span className="text-[10px] font-semibold text-emerald-500 flex items-center gap-0.5 mt-0.5">
                  {confirmedPercent}% of total
                </span>
              </div>
            </div>

            {/* Card 3: Pending */}
            <div className={`p-4 rounded-2xl border flex items-center gap-4 text-left transition-all hover:-translate-y-0.5 ${
              isLight ? 'bg-white border-gray-200/80 shadow-sm text-gray-800' : 'bg-white/5 border-white/5 text-white'
            }`}>
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-500 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-gray-400' : 'text-gray-505'}`}>Pending</span>
                <h4 className="text-xl font-extrabold tracking-tight">{displayPendingBookings.toLocaleString()}</h4>
                <span className="text-[10px] font-semibold text-amber-500 flex items-center gap-0.5 mt-0.5">
                  {pendingPercent}% of total
                </span>
              </div>
            </div>

            {/* Card 4: Cancelled */}
            <div className={`p-4 rounded-2xl border flex items-center gap-4 text-left transition-all hover:-translate-y-0.5 ${
              isLight ? 'bg-white border-gray-200/80 shadow-sm text-gray-800' : 'bg-white/5 border-white/5 text-white'
            }`}>
              <div className="w-11 h-11 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-gray-400' : 'text-gray-505'}`}>Cancelled</span>
                <h4 className="text-xl font-extrabold tracking-tight">{displayCancelledBookings.toLocaleString()}</h4>
                <span className="text-[10px] font-semibold text-rose-505 flex items-center gap-0.5 mt-0.5">
                  {cancelledPercent}% of total
                </span>
              </div>
            </div>

          </div>

          {/* Filter Toolbar Row */}
          <div className={`p-4 rounded-2xl border flex flex-wrap lg:flex-nowrap items-center gap-3 w-full ${
            isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-white/5 border-white/5'
          }`}>
            {/* Search Input */}
            <div className="relative flex-1 min-w-[280px]">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search by event name, client name, or phone..."
                value={bookingSearchQuery}
                onChange={e => {
                  setBookingSearchQuery(e.target.value);
                  setBookingCurrentPage(1);
                }}
                className={`w-full border rounded-xl text-xs pl-10 pr-4 py-3 focus:outline-none focus:border-indigo-500 ${
                  isLight ? 'bg-white border-gray-200 text-gray-900 shadow-sm' : 'bg-white/5 border-white/5 text-white'
                }`}
              />
            </div>

            {/* Status Dropdown */}
            <div className="relative w-full sm:w-auto">
              <select
                value={bookingStatusFilter}
                onChange={e => {
                  setBookingStatusFilter(e.target.value);
                  setBookingCurrentPage(1);
                }}
                className={`appearance-none border rounded-xl text-xs py-3 pl-4 pr-10 focus:outline-none focus:border-indigo-500 font-semibold cursor-pointer w-full sm:w-auto ${
                  isLight ? 'bg-white border-gray-200 text-gray-800 shadow-sm' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                }`}
              >
                <option value="All">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            {/* Event Category Type Dropdown */}
            <div className="relative w-full sm:w-auto">
              <select
                value={bookingEventFilter}
                onChange={e => {
                  setBookingEventFilter(e.target.value);
                  setBookingCurrentPage(1);
                }}
                className={`appearance-none border rounded-xl text-xs py-3 pl-4 pr-10 focus:outline-none focus:border-indigo-500 font-semibold cursor-pointer w-full sm:w-auto ${
                  isLight ? 'bg-white border-gray-200 text-gray-800 shadow-sm' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                }`}
              >
                <option value="All">All Events</option>
                <option value="wedding">Wedding</option>
                <option value="birthday">Birthday</option>
                <option value="corporate">Corporate</option>
                <option value="party">Party</option>
                <option value="college">College Event</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            {/* Date Picker Button */}
            <div className={`flex items-center gap-2 px-3.5 py-3 rounded-xl border text-xs font-semibold cursor-pointer w-full sm:w-auto justify-center ${
              isLight ? 'bg-white border-gray-200 text-gray-700 shadow-sm hover:bg-gray-50' : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/8'
            }`}>
              <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>Select Date Range</span>
            </div>

            {/* Filter Toggle Button */}
            <button className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-xs font-semibold cursor-pointer w-full sm:w-auto justify-center ${
              isLight ? 'bg-white border-gray-200 text-gray-700 shadow-sm hover:bg-gray-50' : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/8'
            }`}>
              <Sliders className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>Filter</span>
            </button>
          </div>

          {/* Bookings Ledger Table Container */}
          <div className={`p-5 rounded-2xl border flex flex-col gap-4 overflow-x-auto ${
            isLight ? 'bg-white border-gray-200/80 shadow-sm' : 'bg-white/5 border-white/5'
          }`}>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 font-semibold text-gray-500">
                  <th className="py-4 px-4 font-semibold text-gray-500">#</th>
                  <th className="py-4 px-4 font-semibold text-gray-500">Booking ID</th>
                  <th className="py-4 px-4 font-semibold text-gray-500">Event Name</th>
                  <th className="py-4 px-4 font-semibold text-gray-500">Client Name</th>
                  <th className="py-4 px-4 font-semibold text-gray-500">Event Date</th>
                  <th className="py-4 px-4 font-semibold text-gray-500">Venue</th>
                  <th className="py-4 px-4 font-semibold text-gray-500">Amount</th>
                  <th className="py-4 px-4 font-semibold text-gray-500">Status</th>
                  <th className="py-4 px-4 font-semibold text-gray-500">Booking Date</th>
                  <th className="py-4 px-4 text-right font-semibold text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-white/2 font-medium ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                {paginatedBookings.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="py-10 text-center text-gray-500 font-semibold">No booking records match the filter query.</td>
                  </tr>
                ) : (
                  paginatedBookings.map((b, idx) => {
                    let mappedStatus = 'Pending';
                    let statusColor = 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400';
                    
                    if (b.status === 'approved' || b.status === 'ongoing' || b.status === 'completed') {
                      mappedStatus = 'Confirmed';
                      statusColor = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400';
                    } else if (b.status === 'cancelled') {
                      mappedStatus = 'Cancelled';
                      statusColor = 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400';
                    }

                    // Get Client Name from usersList
                    const client = usersList.find(u => u.id === b.user_id);
                    const clientName = client ? client.name : (
                      // Custom client names fallback based on mock events to match layout visual styling
                      b.id === 'm1' ? 'Rahul Sharma' :
                      b.id === 'm2' ? 'Aman Singh' :
                      b.id === 'm3' ? 'Neha Jain' :
                      b.id === 'm4' ? 'Vikram Joshi' :
                      b.id === 'm5' ? 'Meera Rathore' :
                      b.id === 'm6' ? 'Suresh Choudhary' : 'System User'
                    );

                    // Mock Booking Creation Date mapping (30 days before event date)
                    const eventDateObj = new Date(b.date);
                    const bookingDateObj = b.created_at ? new Date(b.created_at) : new Date(eventDateObj.getTime() - 44 * 24 * 60 * 60 * 1000);
                    const formattedBookingDate = formatEventDate(bookingDateObj);

                    const formattedEventDate = formatEventDate(b.date);
                    const bookingId = typeof b.id === 'number' ? `BK-15${20 + b.id}` : `BK-15${16 + idx}`;

                    return (
                      <tr key={b.id} className={`${isLight ? 'hover:bg-gray-50' : 'hover:bg-white/2'} transition-colors relative`}>
                        {/* # Row Index */}
                        <td className="py-4 px-4 font-bold text-gray-400">
                          {bookingStartIndex + idx + 1}
                        </td>

                        {/* Booking ID */}
                        <td className={`py-4 px-4 font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                          {bookingId}
                        </td>

                        {/* Event Name with cover preview */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-12 h-8 rounded-lg overflow-hidden shrink-0 bg-gray-150 border border-gray-200/50 dark:bg-white/5 dark:border-white/5">
                              <img src={b.image || '/udaipur_palace.png'} alt={b.title} className="w-full h-full object-cover" />
                            </div>
                            <span className={`font-bold truncate text-left ${isLight ? 'text-gray-900' : 'text-white'}`}>
                              {b.title}
                            </span>
                          </div>
                        </td>

                        {/* Client Name */}
                        <td className="py-4 px-4 font-semibold text-left">{clientName}</td>

                        {/* Event Date */}
                        <td className="py-4 px-4 font-semibold text-left">{formattedEventDate}</td>

                        {/* Venue */}
                        <td className="py-4 px-4 font-medium text-left truncate max-w-[150px]">{b.location}</td>

                        {/* Amount */}
                        <td className={`py-4 px-4 text-left font-bold ${isLight ? 'text-gray-905' : 'text-white'}`}>
                          ₹ {parseFloat(b.budget || 150000).toLocaleString()}
                        </td>

                        {/* Status badge pill */}
                        <td className="py-4 px-4 text-left">
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${statusColor}`}>
                            {mappedStatus}
                          </span>
                        </td>

                        {/* Booking Date */}
                        <td className={`py-4 px-4 text-left font-medium ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                          {formattedBookingDate}
                        </td>

                        {/* Actions buttons */}
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2 relative">
                            <button
                              onClick={() => showToast(`Viewing booking details for ${b.title}`, 'info')}
                              className={`flex items-center justify-center p-1.5 rounded-lg border cursor-pointer ${
                                isLight ? 'border-gray-200 hover:bg-gray-50 text-gray-700' : 'border-white/10 hover:bg-white/5 text-gray-300'
                              }`}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setActiveBookingMenuId(activeBookingMenuId === b.id ? null : b.id)}
                              className={`p-1.5 rounded-lg border cursor-pointer ${
                                isLight ? 'border-gray-200 hover:bg-gray-50 text-gray-700' : 'border-white/10 hover:bg-white/5 text-gray-400'
                              }`}
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>

                            {/* Dropdown Options popover menu */}
                            {activeBookingMenuId === b.id && (
                              <div className="absolute right-0 top-10 w-44 glass-panel border rounded-xl shadow-2xl p-2 z-50 animate-scale-up flex flex-col text-left">
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider px-2 py-1">Moderate Booking</span>
                                
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleUpdateBookingStatus(b.id, 'confirmed');
                                    setActiveBookingMenuId(null);
                                  }}
                                  className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold text-gray-300 hover:bg-white/5 hover:text-white transition-all cursor-pointer"
                                >
                                  ✔️ Confirm Booking
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    handleUpdateBookingStatus(b.id, 'pending');
                                    setActiveBookingMenuId(null);
                                  }}
                                  className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold text-gray-300 hover:bg-white/5 hover:text-white transition-all cursor-pointer"
                                >
                                  ⏳ Mark as Pending
                                </button>

                                <div className="border-t border-white/5 my-1" />
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleUpdateBookingStatus(b.id, 'cancelled');
                                    setActiveBookingMenuId(null);
                                  }}
                                  className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold text-rose-450 hover:bg-rose-500/10 hover:text-rose-400 transition-all cursor-pointer"
                                >
                                  ❌ Cancel Booking
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Pagination Footer segments */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-white/5 text-xs font-semibold">
              <span className={isLight ? 'text-gray-500' : 'text-gray-500'}>
                Showing {bookingShowingFrom} to {bookingShowingTo} of {filteredBookings.length} bookings
              </span>
              
              <div className="flex items-center gap-4">
                {/* Page Size Select Dropdown */}
                <div className="relative">
                  <select
                    value={bookingPageSize}
                    onChange={e => {
                      setBookingPageSize(parseInt(e.target.value));
                      setBookingCurrentPage(1);
                    }}
                    className={`appearance-none border rounded-xl pl-3 pr-8 py-2 text-xs font-semibold focus:outline-none cursor-pointer ${
                      isLight ? 'bg-white border-gray-200 text-gray-800 shadow-sm' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                    }`}
                  >
                    <option value={5}>5 per page</option>
                    <option value={10}>10 per page</option>
                    <option value={15}>15 per page</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
                </div>

                {/* Page Index Select Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    disabled={bookingCurrentPage === 1}
                    onClick={() => setBookingCurrentPage(prev => Math.max(prev - 1, 1))}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg border text-[10px] font-bold transition-all disabled:opacity-30 cursor-pointer ${
                      isLight ? 'border-gray-200 hover:bg-gray-50 text-gray-655' : 'border-white/10 hover:bg-white/5 text-gray-400'
                    }`}
                  >
                    «
                  </button>
                  
                  {Array.from({ length: bookingTotalPages }).map((_, idx) => {
                    const pg = idx + 1;
                    const isActive = pg === bookingCurrentPage;
                    return (
                      <button
                        key={pg}
                        onClick={() => setBookingCurrentPage(pg)}
                        className={`w-7 h-7 flex items-center justify-center rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#5a2bd4] text-white shadow-md shadow-[#5a2bd4]/15'
                            : isLight
                              ? 'border border-gray-200 hover:bg-gray-50 text-gray-655'
                              : 'border border-white/10 hover:bg-white/5 text-gray-400'
                        }`}
                      >
                        {pg}
                      </button>
                    );
                  })}

                  <button
                    disabled={bookingCurrentPage === bookingTotalPages}
                    onClick={() => setBookingCurrentPage(prev => Math.min(prev + 1, bookingTotalPages))}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg border text-[10px] font-bold transition-all disabled:opacity-30 cursor-pointer ${
                      isLight ? 'border-gray-200 hover:bg-gray-50 text-gray-655' : 'border-white/10 hover:bg-white/5 text-gray-400'
                    }`}
                  >
                    »
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 7: REPORTS (ADMINISTRATIVE STATISTICS AND CHARTS) */}
      {/* ==================================================== */}
      {activeTab === 'reports' && (
        <div className="flex flex-col gap-6 animate-scale-up">
          
          {/* Breadcrumb Header Row */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h2 className={`text-xl font-extrabold ${isLight ? 'text-gray-900' : 'text-white'}`}>Reports</h2>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-wider">
                <span>Dashboard</span>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-indigo-600 dark:text-indigo-400">Reports</span>
              </div>
            </div>
            
            <button
              onClick={() => showToast('Exporting reports summary...', 'info')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 px-4.5 rounded-xl transition-all shadow-lg shadow-indigo-600/15 cursor-pointer flex items-center gap-2"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>Export Report</span>
            </button>
          </div>

          {/* Filter Toolbar Row */}
          <div className={`p-4 rounded-2xl border flex flex-wrap lg:flex-nowrap items-center gap-3 w-full ${
            isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-white/5 border-white/5'
          }`}>
            {/* Start Date input */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className={`text-[10px] font-bold uppercase shrink-0 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>From</span>
              <input
                type="date"
                value={reportStartDate}
                onChange={e => setReportStartDate(e.target.value)}
                className={`border rounded-xl text-xs py-2 px-3 focus:outline-none focus:border-indigo-500 font-semibold w-full sm:w-auto ${
                  isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                }`}
              />
            </div>

            {/* End Date input */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className={`text-[10px] font-bold uppercase shrink-0 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>To</span>
              <input
                type="date"
                value={reportEndDate}
                onChange={e => setReportEndDate(e.target.value)}
                className={`border rounded-xl text-xs py-2 px-3 focus:outline-none focus:border-indigo-500 font-semibold w-full sm:w-auto ${
                  isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                }`}
              />
            </div>

            {/* Event Category Type Dropdown */}
            <div className="relative w-full sm:w-auto">
              <select
                value={reportEventFilter}
                onChange={e => setReportEventFilter(e.target.value)}
                className={`appearance-none border rounded-xl text-xs py-3 pl-4 pr-10 focus:outline-none focus:border-indigo-500 font-semibold cursor-pointer w-full sm:w-auto ${
                  isLight ? 'bg-white border-gray-200 text-gray-800 shadow-sm' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                }`}
              >
                <option value="All">All Events</option>
                <option value="wedding">Wedding</option>
                <option value="birthday">Birthday</option>
                <option value="corporate">Corporate</option>
                <option value="party">Party</option>
                <option value="college">College Event</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            {/* Venue Dropdown */}
            <div className="relative w-full sm:w-auto">
              <select
                value={reportVenueFilter}
                onChange={e => setReportVenueFilter(e.target.value)}
                className={`appearance-none border rounded-xl text-xs py-3 pl-4 pr-10 focus:outline-none focus:border-indigo-500 font-semibold cursor-pointer w-full sm:w-auto ${
                  isLight ? 'bg-white border-gray-200 text-gray-800 shadow-sm' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                }`}
              >
                <option value="All">All Venues</option>
                <option value="Leela">The Leela Palace</option>
                <option value="Radisson">Radisson Blu</option>
                <option value="Fateh">Fateh Garh Resort</option>
                <option value="Lakend">Hotel Lakend</option>
                <option value="Shiv Niwas">Shiv Niwas Palace</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            {/* Vendors Dropdown */}
            <div className="relative w-full sm:w-auto">
              <select
                value={reportVendorFilter}
                onChange={e => setReportVendorFilter(e.target.value)}
                className={`appearance-none border rounded-xl text-xs py-3 pl-4 pr-10 focus:outline-none focus:border-indigo-500 font-semibold cursor-pointer w-full sm:w-auto ${
                  isLight ? 'bg-white border-gray-200 text-gray-800 shadow-sm' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                }`}
              >
                <option value="All">All Vendors</option>
                <option value="Sound">Apex Sound & Lights</option>
                <option value="Decor">Royal Decorators</option>
                <option value="Catering">Marwar Catering Services</option>
                <option value="Photo">Lakeside Photography</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            {/* Apply Filters Button */}
            <button
              onClick={() => showToast('Filters applied successfully', 'success')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 px-4.5 rounded-xl transition-all shadow-lg cursor-pointer"
            >
              Apply Filters
            </button>

            {/* Reset Button */}
            <button
              onClick={() => {
                setReportEventFilter('All');
                setReportVenueFilter('All');
                setReportVendorFilter('All');
                setReportStartDate('2026-05-01');
                setReportEndDate('2026-05-31');
                showToast('Filters reset to default values', 'info');
              }}
              className={`border rounded-xl text-xs py-3 px-4.5 font-bold transition-all cursor-pointer w-full sm:w-auto ${
                isLight ? 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50 shadow-sm' : 'border-white/10 text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              Reset
            </button>
          </div>

          {/* 5 Stats Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* Card 1: Total Bookings */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between transition-all duration-300 hover:-translate-y-0.5 ${
              isLight ? 'bg-white border-gray-200/80 text-gray-800 shadow-sm' : 'bg-white/5 border-white/5 text-white'
            }`}>
              <div className="flex flex-col gap-0.5 text-left">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>Total Bookings</span>
                <span className="text-2xl font-extrabold tracking-tight">{reportsTotalBookings}</span>
                <span className={`text-[9px] ${isLight ? 'text-gray-400' : 'text-gray-500'} mt-0.5`}>
                  Total filtered events
                </span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
            </div>

            {/* Card 2: Total Revenue */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between transition-all duration-300 hover:-translate-y-0.5 ${
              isLight ? 'bg-white border-gray-200/80 text-gray-800 shadow-sm' : 'bg-white/5 border-white/5 text-white'
            }`}>
              <div className="flex flex-col gap-0.5 text-left">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>Total Revenue</span>
                <span className="text-xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400 font-outfit">₹ {displayReportsRevenue.toLocaleString()}</span>
                <span className={`text-[9px] ${isLight ? 'text-gray-400' : 'text-gray-500'} mt-0.5`}>
                  Confirmed bookings revenue
                </span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <span className="text-lg font-extrabold font-outfit">₹</span>
              </div>
            </div>

            {/* Card 3: Avg Booking Value */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between transition-all duration-300 hover:-translate-y-0.5 ${
              isLight ? 'bg-white border-gray-200/80 text-gray-800 shadow-sm' : 'bg-white/5 border-white/5 text-white'
            }`}>
              <div className="flex flex-col gap-0.5 text-left">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>Avg. Booking Value</span>
                <span className="text-xl font-extrabold tracking-tight font-outfit">₹ {reportsAvgBookingValue.toLocaleString()}</span>
                <span className={`text-[9px] ${isLight ? 'text-gray-400' : 'text-gray-500'} mt-0.5`}>
                  Average budget per booking
                </span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-500 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>

            {/* Card 4: Total Users */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between transition-all duration-300 hover:-translate-y-0.5 ${
              isLight ? 'bg-white border-gray-200/80 text-gray-800 shadow-sm' : 'bg-white/5 border-white/5 text-white'
            }`}>
              <div className="flex flex-col gap-0.5 text-left">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>Total Users</span>
                <span className="text-2xl font-extrabold tracking-tight">{displayTotalUsersCount}</span>
                <span className={`text-[9px] ${isLight ? 'text-gray-400' : 'text-gray-500'} mt-0.5`}>
                  Registered platform users
                </span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
            </div>

            {/* Card 5: Total Vendors */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between transition-all duration-300 hover:-translate-y-0.5 ${
              isLight ? 'bg-white border-gray-200/80 text-gray-800 shadow-sm' : 'bg-white/5 border-white/5 text-white'
            }`}>
              <div className="flex flex-col gap-0.5 text-left">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>Total Vendors</span>
                <span className="text-2xl font-extrabold tracking-tight">{displayTotalVendorsCount}</span>
                <span className={`text-[9px] ${isLight ? 'text-gray-400' : 'text-gray-500'} mt-0.5`}>
                  Registered platform vendors
                </span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-455 flex items-center justify-center shrink-0">
                <Star className="w-5 h-5" />
              </div>
            </div>

          </div>

          {/* Charts Rows: Bookings Overview line chart, Revenue Overview line chart, Bookings by Status pie chart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Box 1: Bookings Overview */}
            <div className={`p-5 rounded-2xl border flex flex-col gap-4 lg:col-span-5 ${
              isLight ? 'bg-white border-gray-200/80 shadow-sm' : 'bg-white/5 border-white/5'
            }`}>
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-gray-800' : 'text-gray-200'}`}>Bookings Overview</span>
              </div>

              {/* Bookings Overview Curve SVG */}
              <div className="flex-1 min-h-[180px] flex items-end justify-center py-2 relative">
                <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="bookings-glow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <line x1="0" y1="50" x2="500" y2="50" stroke={isLight ? "#e5e7eb" : "#ffffff"} strokeOpacity="0.05" strokeWidth="1" />
                  <line x1="0" y1="100" x2="500" y2="100" stroke={isLight ? "#e5e7eb" : "#ffffff"} strokeOpacity="0.05" strokeWidth="1" />
                  <line x1="0" y1="150" x2="500" y2="150" stroke={isLight ? "#e5e7eb" : "#ffffff"} strokeOpacity="0.05" strokeWidth="1" />
                  <line x1="0" y1="200" x2="500" y2="200" stroke={isLight ? "#e5e7eb" : "#ffffff"} strokeOpacity="0.1" strokeWidth="1" />

                  {/* Dynamic Gradient Curve */}
                  <path d={bookingsGlowPathD} fill="url(#bookings-glow)" />
                  <path d={bookingsPathD} fill="none" stroke="#8b5cf6" strokeWidth="3" strokeLinecap="round" />
                  
                  {/* Dynamic Dots */}
                  {bookingsPathPoints.map((pt, idx) => (
                    <circle key={idx} cx={pt.x} cy={pt.y} r="4.5" fill="#8b5cf6" stroke={isLight ? "#fff" : "#0d1117"} strokeWidth="1.5" />
                  ))}
                </svg>
              </div>

              <div className="flex justify-between items-center text-[9px] font-bold text-gray-500 uppercase px-1">
                {chartPoints.map((p, i) => (
                  <span key={i}>{p.label}</span>
                ))}
              </div>
            </div>

            {/* Box 2: Revenue Overview */}
            <div className={`p-5 rounded-2xl border flex flex-col gap-4 lg:col-span-4 ${
              isLight ? 'bg-white border-gray-200/80 shadow-sm' : 'bg-white/5 border-white/5'
            }`}>
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-gray-800' : 'text-gray-200'}`}>Revenue Overview (₹)</span>
              </div>

              {/* Revenue Overview Curve SVG */}
              <div className="flex-1 min-h-[180px] flex items-end justify-center py-2 relative">
                <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="revenue-glow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <line x1="0" y1="50" x2="500" y2="50" stroke={isLight ? "#e5e7eb" : "#ffffff"} strokeOpacity="0.05" strokeWidth="1" />
                  <line x1="0" y1="100" x2="500" y2="100" stroke={isLight ? "#e5e7eb" : "#ffffff"} strokeOpacity="0.05" strokeWidth="1" />
                  <line x1="0" y1="150" x2="500" y2="150" stroke={isLight ? "#e5e7eb" : "#ffffff"} strokeOpacity="0.05" strokeWidth="1" />
                  <line x1="0" y1="200" x2="500" y2="200" stroke={isLight ? "#e5e7eb" : "#ffffff"} strokeOpacity="0.1" strokeWidth="1" />

                  {/* Dynamic Gradient Curve */}
                  <path d={revenueGlowPathD} fill="url(#revenue-glow)" />
                  <path d={revenuePathD} fill="none" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
                  
                  {/* Dynamic Dots */}
                  {revenuePathPoints.map((pt, idx) => (
                    <circle key={idx} cx={pt.x} cy={pt.y} r="4.5" fill="#4f46e5" stroke={isLight ? "#fff" : "#0d1117"} strokeWidth="1.5" />
                  ))}
                </svg>
              </div>

              <div className="flex justify-between items-center text-[9px] font-bold text-gray-500 uppercase px-1">
                {chartPoints.map((p, i) => (
                  <span key={i}>{p.label}</span>
                ))}
              </div>
            </div>

            {/* Box 3: Bookings by Status */}
            <div className={`p-5 rounded-2xl border flex flex-col gap-4 lg:col-span-3 ${
              isLight ? 'bg-white border-gray-200/80 shadow-sm' : 'bg-white/5 border-white/5'
            }`}>
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-gray-800' : 'text-gray-200'}`}>Bookings by Status</span>
              </div>

              {/* Dynamic SVG donut chart representing status weights */}
              <div className="flex-1 flex flex-col items-center justify-center min-h-[160px] gap-4">
                <div className="w-32 h-32 relative shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke={isLight ? "#f3f4f6" : "#2d3748"} strokeWidth="11" />
                    
                    {/* Confirmed Segment: dynamic percent */}
                    <circle cx="50" cy="50" r="40" fill="transparent"
                      stroke="#10b981"
                      strokeWidth="11"
                      strokeDasharray={`${(reportsConfirmedPercent * 251.2) / 100} 251.2`}
                      strokeDashoffset="0"
                      strokeLinecap="round"
                    />
                    {/* Pending Segment: dynamic percent */}
                    <circle cx="50" cy="50" r="40" fill="transparent"
                      stroke="#f59e0b"
                      strokeWidth="11"
                      strokeDasharray={`${(reportsPendingPercent * 251.2) / 100} 251.2`}
                      strokeDashoffset={`-${(reportsConfirmedPercent * 251.2) / 100}`}
                      strokeLinecap="round"
                    />
                    {/* Cancelled Segment: dynamic percent */}
                    <circle cx="50" cy="50" r="40" fill="transparent"
                      stroke="#f43f5e"
                      strokeWidth="11"
                      strokeDasharray={`${(reportsCancelledPercent * 251.2) / 100} 251.2`}
                      strokeDashoffset={`-${((parseFloat(reportsConfirmedPercent) + parseFloat(reportsPendingPercent)) * 251.2) / 100}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  
                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className={`text-base font-extrabold ${isLight ? 'text-gray-900' : 'text-white'}`}>{reportsTotalBookings}</span>
                    <span className="text-[8px] text-gray-500 uppercase font-bold tracking-wider">Bookings</span>
                  </div>
                </div>

                {/* Donut Labels List */}
                <div className="flex flex-col gap-1.5 w-full text-left font-semibold text-[10px]">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                      <span>Confirmed</span>
                    </div>
                    <span className={isLight ? 'text-gray-800' : 'text-white'}>{reportsConfirmedCount} ({reportsConfirmedPercent}%)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                      <span>Pending</span>
                    </div>
                    <span className={isLight ? 'text-gray-800' : 'text-white'}>{reportsPendingCount} ({reportsPendingPercent}%)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#f43f5e]" />
                      <span>Cancelled</span>
                    </div>
                    <span className={isLight ? 'text-gray-800' : 'text-white'}>{reportsCancelledCount} ({reportsCancelledPercent}%)</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Top rankings lists: Top Events, Top Venues, Top Vendors */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            
            {/* Table 1: Top Events by Bookings */}
            <div className={`p-5 rounded-2xl border flex flex-col gap-4 ${
              isLight ? 'bg-white border-gray-200/80 shadow-sm' : 'bg-white/5 border-white/5'
            }`}>
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-gray-800' : 'text-gray-200'}`}>Top Events by Bookings</span>
                <button onClick={() => router.push('/admin?tab=events')} className="text-indigo-600 hover:underline text-[9px] font-bold uppercase cursor-pointer">View All</button>
              </div>

              <div className="flex flex-col gap-3 font-semibold text-[10.5px]">
                {reportsTopEvents.length === 0 ? (
                  <p className="text-center py-6 text-gray-500">No events found.</p>
                ) : (
                  reportsTopEvents.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-gray-150">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <span className={`truncate font-bold ${isLight ? 'text-gray-905' : 'text-white'}`}>{item.name}</span>
                      </div>
                      <span className="text-indigo-650 dark:text-indigo-400 font-bold shrink-0">{item.bookingsCount}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Table 2: Top Venues by Bookings */}
            <div className={`p-5 rounded-2xl border flex flex-col gap-4 ${
              isLight ? 'bg-white border-gray-200/80 shadow-sm' : 'bg-white/5 border-white/5'
            }`}>
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-gray-800' : 'text-gray-200'}`}>Top Venues by Bookings</span>
                <button onClick={() => router.push('/admin?tab=venues')} className="text-indigo-605 hover:underline text-[9px] font-bold uppercase cursor-pointer">View All</button>
              </div>

              <div className="flex flex-col gap-3 font-semibold text-[10.5px]">
                {reportsTopVenues.length === 0 ? (
                  <p className="text-center py-6 text-gray-500">No venues found.</p>
                ) : (
                  reportsTopVenues.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-gray-150">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <span className={`truncate font-bold ${isLight ? 'text-gray-905' : 'text-white'}`}>{item.name}</span>
                      </div>
                      <span className="text-indigo-650 dark:text-indigo-400 font-bold shrink-0">{item.bookingsCount}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Table 3: Top Vendors by Bookings */}
            <div className={`p-5 rounded-2xl border flex flex-col gap-4 ${
              isLight ? 'bg-white border-gray-200/80 shadow-sm' : 'bg-white/5 border-white/5'
            }`}>
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-gray-800' : 'text-gray-200'}`}>Top Vendors by Bookings</span>
                <button onClick={() => router.push('/admin?tab=vendors')} className="text-indigo-605 hover:underline text-[9px] font-bold uppercase cursor-pointer">View All</button>
              </div>

              <div className="flex flex-col gap-3 font-semibold text-[10.5px]">
                {reportsTopVendors.length === 0 ? (
                  <p className="text-center py-6 text-gray-500">No vendors found.</p>
                ) : (
                  reportsTopVendors.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0 font-bold text-[9px]">
                          {item.category.slice(0, 2).toUpperCase()}
                        </div>
                        <span className={`truncate font-bold ${isLight ? 'text-gray-905' : 'text-white'}`}>{item.name}</span>
                      </div>
                      <span className="text-indigo-650 dark:text-indigo-400 font-bold shrink-0">{item.bookingsCount}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 8: FEEDBACK (MOCKUP COMPLIANT FEEDBACK TAB) */}
      {/* ==================================================== */}
      {activeTab === 'feedback' && (
        <div className="flex flex-col gap-6 animate-scale-up">
          
          {/* Breadcrumb Header Row */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h2 className={`text-xl font-extrabold ${isLight ? 'text-gray-900' : 'text-white'}`}>Feedback</h2>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-wider">
                <span>Dashboard</span>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-indigo-600 dark:text-indigo-400">Feedback</span>
              </div>
            </div>
            
            <button
              onClick={handleExportFeedback}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 px-4.5 rounded-xl transition-all shadow-lg shadow-indigo-600/15 cursor-pointer flex items-center gap-2"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>Export Feedback</span>
            </button>
          </div>

          {/* Stats Cards (4 metrics columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total */}
            <div className={`p-5 rounded-2xl border flex items-center gap-4 ${
              isLight ? 'bg-white border-gray-200/80 shadow-sm' : 'bg-white/5 border-white/5'
            }`}>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Total Feedback</span>
                <span className={`text-xl font-extrabold tracking-tight mt-0.5 ${isLight ? 'text-gray-900' : 'text-white'}`}>{totalFeedbackCount}</span>
                <span className="text-[9px] text-gray-500 mt-0.5">All ratings & channels</span>
              </div>
            </div>

            {/* Card 2: Positive */}
            <div className={`p-5 rounded-2xl border flex items-center gap-4 ${
              isLight ? 'bg-white border-gray-200/80 shadow-sm' : 'bg-white/5 border-white/5'
            }`}>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <Smile className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Positive (4-5★)</span>
                <span className={`text-xl font-extrabold tracking-tight mt-0.5 ${isLight ? 'text-gray-900' : 'text-white'}`}>{positiveFeedbackCount}</span>
                <span className="text-[9px] text-emerald-500 font-bold mt-0.5">+{positivePercent}% of total</span>
              </div>
            </div>

            {/* Card 3: Neutral */}
            <div className={`p-5 rounded-2xl border flex items-center gap-4 ${
              isLight ? 'bg-white border-gray-200/80 shadow-sm' : 'bg-white/5 border-white/5'
            }`}>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <Meh className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Neutral (3★)</span>
                <span className={`text-xl font-extrabold tracking-tight mt-0.5 ${isLight ? 'text-gray-900' : 'text-white'}`}>{neutralFeedbackCount}</span>
                <span className="text-[9px] text-amber-500 font-bold mt-0.5">{neutralPercent}% of total</span>
              </div>
            </div>

            {/* Card 4: Negative */}
            <div className={`p-5 rounded-2xl border flex items-center gap-4 ${
              isLight ? 'bg-white border-gray-200/80 shadow-sm' : 'bg-white/5 border-white/5'
            }`}>
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                <Frown className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Negative (1-2★)</span>
                <span className={`text-xl font-extrabold tracking-tight mt-0.5 ${isLight ? 'text-gray-900' : 'text-white'}`}>{negativeFeedbackCount}</span>
                <span className="text-[9px] text-rose-500 font-bold mt-0.5">{negativePercent}% of total</span>
              </div>
            </div>
          </div>

          {/* Filter Toolbar Row */}
          <div className={`p-4 rounded-2xl border flex flex-wrap lg:flex-nowrap items-center gap-3 w-full ${
            isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-white/5 border-white/5'
          }`}>
            {/* Search Input */}
            <div className="relative w-full lg:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={feedbackSearchQuery}
                onChange={e => {
                  setFeedbackSearchQuery(e.target.value);
                  setFeedbackCurrentPage(1);
                }}
                placeholder="Search feedback, user, email..."
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-indigo-500 font-semibold ${
                  isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                }`}
              />
            </div>

            {/* Type Dropdown */}
            <div className="relative w-full sm:w-auto">
              <select
                value={feedbackTypeFilter}
                onChange={e => {
                  setFeedbackTypeFilter(e.target.value);
                  setFeedbackCurrentPage(1);
                }}
                className={`appearance-none border rounded-xl text-xs py-3 pl-4 pr-10 focus:outline-none focus:border-indigo-500 font-semibold cursor-pointer w-full sm:w-auto ${
                  isLight ? 'bg-white border-gray-200 text-gray-800 shadow-sm' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                }`}
              >
                <option value="All">All Types</option>
                <option value="Event">Event</option>
                <option value="Venue">Venue</option>
                <option value="Vendor">Vendor</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            {/* Rating Dropdown */}
            <div className="relative w-full sm:w-auto">
              <select
                value={feedbackRatingFilter}
                onChange={e => {
                  setFeedbackRatingFilter(e.target.value);
                  setFeedbackCurrentPage(1);
                }}
                className={`appearance-none border rounded-xl text-xs py-3 pl-4 pr-10 focus:outline-none focus:border-indigo-500 font-semibold cursor-pointer w-full sm:w-auto ${
                  isLight ? 'bg-white border-gray-200 text-gray-800 shadow-sm' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                }`}
              >
                <option value="All">All Ratings</option>
                <option value="5 Stars">5 Stars</option>
                <option value="4 Stars">4 Stars</option>
                <option value="3 Stars">3 Stars</option>
                <option value="2 Stars">2 Stars</option>
                <option value="1 Star">1 Star</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            {/* Status Dropdown */}
            <div className="relative w-full sm:w-auto">
              <select
                value={feedbackStatusFilter}
                onChange={e => {
                  setFeedbackStatusFilter(e.target.value);
                  setFeedbackCurrentPage(1);
                }}
                className={`appearance-none border rounded-xl text-xs py-3 pl-4 pr-10 focus:outline-none focus:border-indigo-500 font-semibold cursor-pointer w-full sm:w-auto ${
                  isLight ? 'bg-white border-gray-200 text-gray-800 shadow-sm' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                }`}
              >
                <option value="All">All Status</option>
                <option value="Published">Published</option>
                <option value="Pending">Pending</option>
                <option value="Resolved">Resolved</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            {/* From Date */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className={`text-[10px] font-bold uppercase shrink-0 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>From</span>
              <input
                type="date"
                value={feedbackStartDate}
                onChange={e => {
                  setFeedbackStartDate(e.target.value);
                  setFeedbackCurrentPage(1);
                }}
                className={`border rounded-xl text-xs py-2 px-3 focus:outline-none focus:border-indigo-500 font-semibold w-full sm:w-auto ${
                  isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                }`}
              />
            </div>

            {/* To Date */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className={`text-[10px] font-bold uppercase shrink-0 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>To</span>
              <input
                type="date"
                value={feedbackEndDate}
                onChange={e => {
                  setFeedbackEndDate(e.target.value);
                  setFeedbackCurrentPage(1);
                }}
                className={`border rounded-xl text-xs py-2 px-3 focus:outline-none focus:border-indigo-500 font-semibold w-full sm:w-auto ${
                  isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                }`}
              />
            </div>

            {/* Reset Button */}
            <button
              onClick={() => {
                setFeedbackSearchQuery('');
                setFeedbackTypeFilter('All');
                setFeedbackRatingFilter('All');
                setFeedbackStatusFilter('All');
                setFeedbackStartDate('');
                setFeedbackEndDate('');
                setFeedbackCurrentPage(1);
                showToast('Filters reset', 'info');
              }}
              className={`px-4 py-2.5 rounded-xl border text-xs font-semibold hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer w-full sm:w-auto text-center ${
                isLight ? 'border-gray-200 text-gray-700 bg-white shadow-sm' : 'border-white/10 text-gray-300 bg-white/5'
              }`}
            >
              Reset
            </button>
          </div>

          {/* Table Container */}
          <div className={`p-5 rounded-2xl border flex flex-col gap-4 overflow-x-auto ${
            isLight ? 'bg-white border-gray-200/80 shadow-sm' : 'bg-white/5 border-white/5'
          }`}>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 font-semibold text-gray-500">
                  <th className="py-4 px-4 font-semibold text-gray-500">#</th>
                  <th className="py-4 px-4 font-semibold text-gray-500">User</th>
                  <th className="py-4 px-4 font-semibold text-gray-500">Type</th>
                  <th className="py-4 px-4 font-semibold text-gray-500">Rating</th>
                  <th className="py-4 px-4 font-semibold text-gray-500">Feedback</th>
                  <th className="py-4 px-4 font-semibold text-gray-500">Submitted On</th>
                  <th className="py-4 px-4 font-semibold text-gray-500">Status</th>
                  <th className="py-4 px-4 text-right font-semibold text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-white/2 font-medium ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                {paginatedFeedbacks.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-10 text-center text-gray-500 font-semibold">No feedback matches the query.</td>
                  </tr>
                ) : (
                  paginatedFeedbacks.map((f, idx) => {
                    const index = feedbackStartIndex + idx + 1;
                    const initials = f.name ? f.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';
                    const feedbackType = getFeedbackType(f.comment);
                    const feedbackStatus = getFeedbackStatus(f.rating);
                    
                    const typeColor = feedbackType === 'Venue'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
                      : feedbackType === 'Vendor'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400';
                    
                    const statusColor = feedbackStatus === 'Published'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                      : feedbackStatus === 'Pending'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400';

                    return (
                      <tr key={f.id || idx} className={`${isLight ? 'hover:bg-gray-50' : 'hover:bg-white/2'} transition-colors relative`}>
                        {/* # Column */}
                        <td className="py-4 px-4 font-bold text-gray-400">{index}</td>
                        
                        {/* User Profile */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-[10px] ${
                              isLight ? 'bg-indigo-50 text-indigo-650' : 'bg-indigo-500/10 text-indigo-400'
                            }`}>
                              {initials}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className={`font-bold truncate ${isLight ? 'text-gray-900' : 'text-white'}`}>{f.name || 'Anonymous User'}</span>
                              <span className="text-[10px] text-gray-500 truncate">{f.email || 'no-email@events.com'}</span>
                            </div>
                          </div>
                        </td>
                        
                        {/* Type Badge */}
                        <td className="py-4 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${typeColor}`}>
                            {feedbackType}
                          </span>
                        </td>
                        
                        {/* Rating Stars */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, sIdx) => (
                              <Star
                                key={sIdx}
                                className={`w-3 h-3 ${sIdx < f.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`}
                              />
                            ))}
                          </div>
                        </td>
                        
                        {/* Feedback Comment */}
                        <td className="py-4 px-4 max-w-xs">
                          <p className={`text-[11px] leading-relaxed break-words ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                            {f.comment || 'No comment text provided.'}
                          </p>
                        </td>
                        
                        {/* Submitted Date */}
                        <td className="py-4 px-4 text-gray-500 font-semibold whitespace-nowrap">
                          {formatFeedbackDate(f.created_at)}
                        </td>
                        
                        {/* Status Badge */}
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${statusColor}`}>
                            {feedbackStatus}
                          </span>
                        </td>
                        
                        {/* Action Buttons */}
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                alert(`Feedback Details:\n\nUser: ${f.name || 'Anonymous'}\nEmail: ${f.email || 'None'}\nRating: ${f.rating} / 5 Stars\nComment: ${f.comment || 'None'}\nSubmitted: ${formatFeedbackDate(f.created_at)}`);
                                showToast('Viewing feedback details', 'info');
                              }}
                              title="View Details"
                              className={`p-1.5 rounded-lg border cursor-pointer transition-all ${
                                isLight ? 'border-gray-200 hover:bg-gray-50 text-gray-700' : 'border-white/10 hover:bg-white/5 text-gray-300'
                              }`}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                const replyText = prompt(`Reply to ${f.name || 'User'}'s feedback:\n"${f.comment || ''}"`);
                                if (replyText) {
                                  showToast(`Reply sent to ${f.email || 'user'}: "${replyText}"`, 'success');
                                }
                              }}
                              title="Send Reply"
                              className={`p-1.5 rounded-lg border cursor-pointer transition-all ${
                                isLight ? 'border-gray-200 hover:bg-gray-50 text-gray-700' : 'border-white/10 hover:bg-white/5 text-gray-300'
                              }`}
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete this feedback?`)) {
                                  setFeedbacks(prev => prev.filter(item => item.id !== f.id));
                                  showToast('Feedback removed from display', 'success');
                                }
                              }}
                              title="Delete Feedback"
                              className={`p-1.5 rounded-lg border cursor-pointer transition-all hover:border-rose-500/30 hover:bg-rose-500/10 text-rose-450`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Pagination Footer */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-white/5 text-xs font-semibold">
              <span className="text-gray-500">
                Showing {feedbackShowingFrom} to {feedbackShowingTo} of {filteredFeedbacks.length} feedbacks
              </span>
              
              <div className="flex items-center gap-4">
                {/* Page Size Dropdown */}
                <div className="relative">
                  <select
                    value={feedbackPageSize}
                    onChange={e => {
                      setFeedbackPageSize(parseInt(e.target.value));
                      setFeedbackCurrentPage(1);
                    }}
                    className={`appearance-none border rounded-xl pl-3 pr-8 py-2 text-xs font-semibold focus:outline-none cursor-pointer ${
                      isLight ? 'bg-white border-gray-200 text-gray-800 shadow-sm' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                    }`}
                  >
                    <option value={5}>5 per page</option>
                    <option value={10}>10 per page</option>
                    <option value={15}>15 per page</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
                </div>

                {/* Page Navigation Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    disabled={feedbackCurrentPage === 1}
                    onClick={() => setFeedbackCurrentPage(prev => Math.max(prev - 1, 1))}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg border text-[10px] font-bold transition-all disabled:opacity-30 cursor-pointer ${
                      isLight ? 'border-gray-200 hover:bg-gray-50 text-gray-650' : 'border-white/10 hover:bg-white/5 text-gray-400'
                    }`}
                  >
                    «
                  </button>
                  
                  {Array.from({ length: feedbackTotalPages }).map((_, idx) => {
                    const pg = idx + 1;
                    const isActive = pg === feedbackCurrentPage;
                    return (
                      <button
                        key={pg}
                        onClick={() => setFeedbackCurrentPage(pg)}
                        className={`w-7 h-7 flex items-center justify-center rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#5a2bd4] text-white shadow-md shadow-[#5a2bd4]/15'
                            : isLight
                              ? 'border border-gray-200 hover:bg-gray-50 text-gray-650'
                              : 'border border-white/10 hover:bg-white/5 text-gray-400'
                        }`}
                      >
                        {pg}
                      </button>
                    );
                  })}

                  <button
                    disabled={feedbackCurrentPage === feedbackTotalPages}
                    onClick={() => setFeedbackCurrentPage(prev => Math.min(prev + 1, feedbackTotalPages))}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg border text-[10px] font-bold transition-all disabled:opacity-30 cursor-pointer ${
                      isLight ? 'border-gray-200 hover:bg-gray-50 text-gray-650' : 'border-white/10 hover:bg-white/5 text-gray-400'
                    }`}
                  >
                    »
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 9: SETTINGS PANEL (MOCKUP COMPLIANT TAB WITH PERSISTENCE) */}
      {/* ==================================================== */}
      {activeTab === 'settings' && (
        <div className="flex flex-col gap-6 animate-scale-up">
          
          {/* Breadcrumb Header Row */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h2 className={`text-xl font-extrabold ${isLight ? 'text-gray-900' : 'text-white'}`}>Settings</h2>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-wider">
                <span>Dashboard</span>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-indigo-600 dark:text-indigo-400">Settings</span>
              </div>
            </div>
          </div>

          {/* Sub Navigation pills */}
          <div className={`p-1.5 rounded-2xl border flex flex-wrap gap-1 ${
            isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-white/5 border-white/5'
          }`}>
            <button
              onClick={() => setActiveSettingsTab('general')}
              className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSettingsTab === 'general'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15'
                  : 'text-gray-500 hover:text-gray-400 hover:bg-white/5'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              General Settings
            </button>
            <button
              onClick={() => setActiveSettingsTab('email')}
              className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSettingsTab === 'email'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15'
                  : 'text-gray-500 hover:text-gray-400 hover:bg-white/5'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              Email Settings
            </button>
            <button
              onClick={() => setActiveSettingsTab('payment')}
              className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSettingsTab === 'payment'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15'
                  : 'text-gray-500 hover:text-gray-400 hover:bg-white/5'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              Payment Settings
            </button>
            <button
              onClick={() => setActiveSettingsTab('notification')}
              className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSettingsTab === 'notification'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15'
                  : 'text-gray-500 hover:text-gray-400 hover:bg-white/5'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              Notification Settings
            </button>
            <button
              onClick={() => setActiveSettingsTab('system')}
              className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSettingsTab === 'system'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15'
                  : 'text-gray-500 hover:text-gray-400 hover:bg-white/5'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              System Settings
            </button>
            <button
              onClick={() => setActiveSettingsTab('backup')}
              className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSettingsTab === 'backup'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15'
                  : 'text-gray-500 hover:text-gray-400 hover:bg-white/5'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              Backup & Restore
            </button>
          </div>

          {/* ACTIVE SETTINGS TAB CONTENT */}
          
          {/* 1. GENERAL SETTINGS */}
          {activeSettingsTab === 'general' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Site Information Form */}
              <form onSubmit={handleSaveGeneralSettings} className={`p-6 rounded-2xl border flex flex-col gap-4 ${
                isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-white/5 border-white/5'
              }`}>
                <span className={`text-sm font-extrabold uppercase tracking-wider ${isLight ? 'text-gray-800' : 'text-white'}`}>
                  Site Information
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className={`text-[10px] font-bold uppercase ${isLight ? 'text-gray-550' : 'text-gray-400'}`}>Site Title</label>
                    <input
                      type="text"
                      value={siteTitle}
                      onChange={e => setSiteTitle(e.target.value)}
                      className={`border rounded-xl text-xs py-2.5 px-3 focus:outline-none focus:border-indigo-500 font-semibold ${
                        isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                      }`}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className={`text-[10px] font-bold uppercase ${isLight ? 'text-gray-550' : 'text-gray-400'}`}>Tagline</label>
                    <input
                      type="text"
                      value={siteTagline}
                      onChange={e => setSiteTagline(e.target.value)}
                      className={`border rounded-xl text-xs py-2.5 px-3 focus:outline-none focus:border-indigo-500 font-semibold ${
                        isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                      }`}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className={`text-[10px] font-bold uppercase ${isLight ? 'text-gray-550' : 'text-gray-400'}`}>Email</label>
                    <input
                      type="email"
                      value={siteEmail}
                      onChange={e => setSiteEmail(e.target.value)}
                      className={`border rounded-xl text-xs py-2.5 px-3 focus:outline-none focus:border-indigo-500 font-semibold ${
                        isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                      }`}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className={`text-[10px] font-bold uppercase ${isLight ? 'text-gray-550' : 'text-gray-400'}`}>Phone</label>
                    <input
                      type="text"
                      value={sitePhone}
                      onChange={e => setSitePhone(e.target.value)}
                      className={`border rounded-xl text-xs py-2.5 px-3 focus:outline-none focus:border-indigo-500 font-semibold ${
                        isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                      }`}
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className={`text-[10px] font-bold uppercase ${isLight ? 'text-gray-550' : 'text-gray-400'}`}>Address</label>
                  <input
                    type="text"
                    value={siteAddress}
                    onChange={e => setSiteAddress(e.target.value)}
                    className={`border rounded-xl text-xs py-2.5 px-3 focus:outline-none focus:border-indigo-500 font-semibold w-full ${
                      isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                    }`}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className={`text-[10px] font-bold uppercase ${isLight ? 'text-gray-550' : 'text-gray-400'}`}>About Us</label>
                  <textarea
                    rows="3"
                    value={siteAbout}
                    onChange={e => setSiteAbout(e.target.value)}
                    className={`border rounded-xl text-xs py-2.5 px-3 focus:outline-none focus:border-indigo-500 font-semibold w-full resize-none ${
                      isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                    }`}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 px-5 rounded-xl transition-all shadow-md shadow-indigo-600/15 cursor-pointer self-start"
                >
                  Save Changes
                </button>
              </form>

              {/* Logo & Favicon / Style Cards Column */}
              <div className="flex flex-col gap-6">
                
                {/* Logo & Favicon Card */}
                <div className={`p-6 rounded-2xl border flex flex-col gap-5 ${
                  isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-white/5 border-white/5'
                }`}>
                  <span className={`text-sm font-extrabold uppercase tracking-wider ${isLight ? 'text-gray-800' : 'text-white'}`}>
                    Logo & Favicon
                  </span>

                  {/* Logo block */}
                  <div className="flex flex-col gap-2">
                    <span className={`text-[10px] font-bold uppercase ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Logo</span>
                    <div className="flex items-center justify-between gap-4 p-3 rounded-xl border border-white/5 bg-white/2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-600/10 text-indigo-500 flex items-center justify-center shrink-0">
                          <Calendar className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-xs font-bold ${isLight ? 'text-gray-800' : 'text-white'}`}>{siteTitle}</span>
                          <span className="text-[9px] text-gray-500">Recommended size: 200 x 60px</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => showToast('Logo upload triggered', 'info')}
                          className={`text-[10px] font-bold uppercase border py-2 px-3.5 rounded-lg hover:bg-white/5 cursor-pointer ${
                            isLight ? 'border-gray-250 text-gray-700 bg-white' : 'border-white/10 text-gray-300'
                          }`}
                        >
                          Change Logo
                        </button>
                        <button
                          type="button"
                          onClick={() => showToast('Cannot delete default system logo', 'error')}
                          className="p-2 rounded-lg border border-rose-500/20 text-rose-500 bg-rose-500/5 hover:bg-rose-500/10 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Favicon block */}
                  <div className="flex flex-col gap-2">
                    <span className={`text-[10px] font-bold uppercase ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Favicon</span>
                    <div className="flex items-center justify-between gap-4 p-3 rounded-xl border border-white/5 bg-white/2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600/10 text-indigo-500 flex items-center justify-center shrink-0">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-xs font-bold ${isLight ? 'text-gray-800' : 'text-white'}`}>{siteTitle} Icon</span>
                          <span className="text-[9px] text-gray-500">Recommended size: 32 x 32px</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => showToast('Favicon upload triggered', 'info')}
                          className={`text-[10px] font-bold uppercase border py-2 px-3.5 rounded-lg hover:bg-white/5 cursor-pointer ${
                            isLight ? 'border-gray-250 text-gray-700 bg-white' : 'border-white/10 text-gray-300'
                          }`}
                        >
                          Change Favicon
                        </button>
                        <button
                          type="button"
                          onClick={() => showToast('Cannot delete default favicon', 'error')}
                          className="p-2 rounded-lg border border-rose-500/20 text-rose-500 bg-rose-500/5 hover:bg-rose-500/10 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Site Theme Color picker input */}
                  <div className="flex flex-col gap-1.5">
                    <label className={`text-[10px] font-bold uppercase ${isLight ? 'text-gray-550' : 'text-gray-400'}`}>Site Theme Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={siteThemeColor}
                        onChange={e => setSiteThemeColor(e.target.value)}
                        className="w-10 h-10 rounded-xl border border-white/10 cursor-pointer bg-transparent focus:outline-none"
                      />
                      <input
                        type="text"
                        value={siteThemeColor}
                        onChange={e => setSiteThemeColor(e.target.value)}
                        className={`border rounded-xl text-xs py-2.5 px-3 focus:outline-none focus:border-indigo-500 font-semibold uppercase tracking-wider w-28 ${
                          isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                        }`}
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Localization Form card */}
              <form onSubmit={handleSaveGeneralSettings} className={`p-6 rounded-2xl border flex flex-col gap-4 ${
                isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-white/5 border-white/5'
              }`}>
                <span className={`text-sm font-extrabold uppercase tracking-wider ${isLight ? 'text-gray-800' : 'text-white'}`}>
                  Localization
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Language Selector */}
                  <div className="flex flex-col gap-1">
                    <label className={`text-[10px] font-bold uppercase ${isLight ? 'text-gray-550' : 'text-gray-400'}`}>Default Language</label>
                    <div className="relative">
                      <select
                        value={siteLanguage}
                        onChange={e => setSiteLanguage(e.target.value)}
                        className={`appearance-none border rounded-xl text-xs py-2.5 pl-3 pr-9 focus:outline-none focus:border-indigo-500 font-semibold cursor-pointer w-full ${
                          isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                        }`}
                      >
                        <option value="English">English</option>
                        <option value="Hindi">Hindi (हिन्दी)</option>
                        <option value="Spanish">Spanish (Español)</option>
                        <option value="French">French (Français)</option>
                        <option value="German">German (Deutsch)</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    </div>
                  </div>

                  {/* Currency Selector */}
                  <div className="flex flex-col gap-1">
                    <label className={`text-[10px] font-bold uppercase ${isLight ? 'text-gray-550' : 'text-gray-400'}`}>Currency</label>
                    <div className="relative">
                      <select
                        value={siteCurrency}
                        onChange={e => setSiteCurrency(e.target.value)}
                        className={`appearance-none border rounded-xl text-xs py-2.5 pl-3 pr-9 focus:outline-none focus:border-indigo-500 font-semibold cursor-pointer w-full ${
                          isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                        }`}
                      >
                        <option value="INR (₹)">INR (₹)</option>
                        <option value="USD ($)">USD ($)</option>
                        <option value="EUR (€)">EUR (€)</option>
                        <option value="GBP (£)">GBP (£)</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Timezone Selector */}
                <div className="flex flex-col gap-1">
                  <label className={`text-[10px] font-bold uppercase ${isLight ? 'text-gray-550' : 'text-gray-400'}`}>Time Zone</label>
                  <div className="relative w-full">
                    <select
                      value={siteTimezone}
                      onChange={e => setSiteTimezone(e.target.value)}
                      className={`appearance-none border rounded-xl text-xs py-2.5 pl-3 pr-9 focus:outline-none focus:border-indigo-500 font-semibold cursor-pointer w-full ${
                        isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                      }`}
                    >
                      <option value="(GMT+05:30) Asia/Kolkata">(GMT+05:30) Asia/Kolkata</option>
                      <option value="(GMT+00:00) UTC">(GMT+00:00) UTC</option>
                      <option value="(GMT-05:00) Eastern Time (US & Canada)">(GMT-05:00) Eastern Time (US & Canada)</option>
                      <option value="(GMT+01:00) Europe/London">(GMT+01:00) Europe/London</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 px-5 rounded-xl transition-all shadow-md shadow-indigo-600/15 cursor-pointer self-start mt-2"
                >
                  Save Changes
                </button>
              </form>

              {/* Date & Time Settings Form card */}
              <form onSubmit={handleSaveGeneralSettings} className={`p-6 rounded-2xl border flex flex-col gap-4 ${
                isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-white/5 border-white/5'
              }`}>
                <span className={`text-sm font-extrabold uppercase tracking-wider ${isLight ? 'text-gray-800' : 'text-white'}`}>
                  Date & Time Settings
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Date Format */}
                  <div className="flex flex-col gap-1">
                    <label className={`text-[10px] font-bold uppercase ${isLight ? 'text-gray-550' : 'text-gray-400'}`}>Date Format</label>
                    <div className="relative">
                      <select
                        value={siteDateFormat}
                        onChange={e => setSiteDateFormat(e.target.value)}
                        className={`appearance-none border rounded-xl text-xs py-2.5 pl-3 pr-9 focus:outline-none focus:border-indigo-500 font-semibold cursor-pointer w-full ${
                          isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                        }`}
                      >
                        <option value="DD MMM YYYY (10 Apr 2024)">DD MMM YYYY (10 Apr 2024)</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD-MM-YYYY">DD-MM-YYYY</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    </div>
                  </div>

                  {/* Time Format */}
                  <div className="flex flex-col gap-1">
                    <label className={`text-[10px] font-bold uppercase ${isLight ? 'text-gray-550' : 'text-gray-400'}`}>Time Format</label>
                    <div className="relative">
                      <select
                        value={siteTimeFormat}
                        onChange={e => setSiteTimeFormat(e.target.value)}
                        className={`appearance-none border rounded-xl text-xs py-2.5 pl-3 pr-9 focus:outline-none focus:border-indigo-500 font-semibold cursor-pointer w-full ${
                          isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                        }`}
                      >
                        <option value="12 Hour (hh:mm AM/PM)">12 Hour (hh:mm AM/PM)</option>
                        <option value="24 Hour (HH:mm)">24 Hour (HH:mm)</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Week Starts On */}
                <div className="flex flex-col gap-1">
                  <label className={`text-[10px] font-bold uppercase ${isLight ? 'text-gray-550' : 'text-gray-400'}`}>Week Starts On</label>
                  <div className="relative w-full">
                    <select
                      value={siteWeekStartsOn}
                      onChange={e => setSiteWeekStartsOn(e.target.value)}
                      className={`appearance-none border rounded-xl text-xs py-2.5 pl-3 pr-9 focus:outline-none focus:border-indigo-500 font-semibold cursor-pointer w-full ${
                        isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                      }`}
                    >
                      <option value="Monday">Monday</option>
                      <option value="Sunday">Sunday</option>
                      <option value="Saturday">Saturday</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 px-5 rounded-xl transition-all shadow-md shadow-indigo-600/15 cursor-pointer self-start mt-2"
                >
                  Save Changes
                </button>
              </form>

            </div>
          )}

          {/* 2. EMAIL SETTINGS (SMTP CONFIGS) */}
          {activeSettingsTab === 'email' && (
            <form onSubmit={handleSaveEmailSettings} className={`p-6 rounded-2xl border flex flex-col gap-4 max-w-3xl ${
              isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-white/5 border-white/5'
            }`}>
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className={`text-sm font-extrabold uppercase tracking-wider ${isLight ? 'text-gray-800' : 'text-white'}`}>
                  SMTP Configuration
                </span>
                
                <button
                  type="button"
                  onClick={handleSendTestEmail}
                  className={`text-[10px] font-bold uppercase border py-2 px-3 rounded-lg hover:bg-white/5 cursor-pointer ${
                    isLight ? 'border-gray-250 text-indigo-600 bg-white' : 'border-white/10 text-indigo-400'
                  }`}
                >
                  ✉️ Send Test Email
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className={`text-[10px] font-bold uppercase ${isLight ? 'text-gray-550' : 'text-gray-400'}`}>SMTP Server Host</label>
                  <input
                    type="text"
                    value={smtpHost}
                    onChange={e => setSmtpHost(e.target.value)}
                    className={`border rounded-xl text-xs py-2.5 px-3 focus:outline-none focus:border-indigo-500 font-semibold ${
                      isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                    }`}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className={`text-[10px] font-bold uppercase ${isLight ? 'text-gray-550' : 'text-gray-400'}`}>SMTP Port</label>
                  <input
                    type="text"
                    value={smtpPort}
                    onChange={e => setSmtpPort(e.target.value)}
                    className={`border rounded-xl text-xs py-2.5 px-3 focus:outline-none focus:border-indigo-500 font-semibold ${
                      isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                    }`}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className={`text-[10px] font-bold uppercase ${isLight ? 'text-gray-550' : 'text-gray-400'}`}>SMTP Username</label>
                  <input
                    type="text"
                    value={smtpUsername}
                    onChange={e => setSmtpUsername(e.target.value)}
                    className={`border rounded-xl text-xs py-2.5 px-3 focus:outline-none focus:border-indigo-500 font-semibold ${
                      isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                    }`}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className={`text-[10px] font-bold uppercase ${isLight ? 'text-gray-550' : 'text-gray-400'}`}>SMTP Password</label>
                  <input
                    type="password"
                    value={smtpPassword}
                    onChange={e => setSmtpPassword(e.target.value)}
                    className={`border rounded-xl text-xs py-2.5 px-3 focus:outline-none focus:border-indigo-500 font-semibold ${
                      isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                    }`}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className={`text-[10px] font-bold uppercase ${isLight ? 'text-gray-550' : 'text-gray-400'}`}>Encryption Security</label>
                  <div className="relative">
                    <select
                      value={smtpEncryption}
                      onChange={e => setSmtpEncryption(e.target.value)}
                      className={`appearance-none border rounded-xl text-xs py-2.5 pl-3 pr-9 focus:outline-none focus:border-indigo-500 font-semibold cursor-pointer w-full ${
                        isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                      }`}
                    >
                      <option value="TLS">TLS (Recommended)</option>
                      <option value="SSL">SSL</option>
                      <option value="None">None</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className={`text-[10px] font-bold uppercase ${isLight ? 'text-gray-550' : 'text-gray-400'}`}>Sender Display Name</label>
                  <input
                    type="text"
                    value={smtpSenderName}
                    onChange={e => setSmtpSenderName(e.target.value)}
                    className={`border rounded-xl text-xs py-2.5 px-3 focus:outline-none focus:border-indigo-500 font-semibold ${
                      isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                    }`}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className={`text-[10px] font-bold uppercase ${isLight ? 'text-gray-550' : 'text-gray-400'}`}>Sender Email Address</label>
                  <input
                    type="email"
                    value={smtpSenderEmail}
                    onChange={e => setSmtpSenderEmail(e.target.value)}
                    className={`border rounded-xl text-xs py-2.5 px-3 focus:outline-none focus:border-indigo-500 font-semibold ${
                      isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                    }`}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 px-5 rounded-xl transition-all shadow-md shadow-indigo-600/15 cursor-pointer self-start mt-2"
              >
                Save Settings
              </button>
            </form>
          )}

          {/* 3. PAYMENT SETTINGS (STRIPE / RAZORPAY ENVIRONMENT CONTROLS) */}
          {activeSettingsTab === 'payment' && (
            <form onSubmit={handleSavePaymentSettings} className={`p-6 rounded-2xl border flex flex-col gap-4 max-w-3xl ${
              isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-white/5 border-white/5'
            }`}>
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className={`text-sm font-extrabold uppercase tracking-wider ${isLight ? 'text-gray-800' : 'text-white'}`}>
                  Payment Gateway Integration
                </span>
                
                {/* Sandbox Toggle */}
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold uppercase ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Sandbox (Test Mode)</span>
                  <button
                    type="button"
                    onClick={() => setPaymentSandboxMode(!paymentSandboxMode)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      paymentSandboxMode ? 'bg-indigo-600' : 'bg-gray-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        paymentSandboxMode ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Stripe Config Box */}
              <div className="p-4 rounded-xl border border-white/5 bg-white/2 flex flex-col gap-3">
                <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider">Stripe Gateway</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className={`text-[10px] font-bold uppercase ${isLight ? 'text-gray-550' : 'text-gray-400'}`}>Publishable Key</label>
                    <input
                      type="text"
                      value={stripePublicKey}
                      onChange={e => setStripePublicKey(e.target.value)}
                      className={`border rounded-xl text-xs py-2.5 px-3 focus:outline-none focus:border-indigo-500 font-semibold ${
                        isLight ? 'bg-white border-gray-200 text-gray-850' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                      }`}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className={`text-[10px] font-bold uppercase ${isLight ? 'text-gray-550' : 'text-gray-400'}`}>Secret Key</label>
                    <input
                      type="password"
                      value={stripeSecretKey}
                      onChange={e => setStripeSecretKey(e.target.value)}
                      className={`border rounded-xl text-xs py-2.5 px-3 focus:outline-none focus:border-indigo-500 font-semibold ${
                        isLight ? 'bg-white border-gray-200 text-gray-855' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                      }`}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Razorpay Config Box */}
              <div className="p-4 rounded-xl border border-white/5 bg-white/2 flex flex-col gap-3">
                <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider">Razorpay Gateway</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className={`text-[10px] font-bold uppercase ${isLight ? 'text-gray-550' : 'text-gray-400'}`}>Key ID</label>
                    <input
                      type="text"
                      value={razorpayKeyId}
                      onChange={e => setRazorpayKeyId(e.target.value)}
                      className={`border rounded-xl text-xs py-2.5 px-3 focus:outline-none focus:border-indigo-500 font-semibold ${
                        isLight ? 'bg-white border-gray-200 text-gray-850' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                      }`}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className={`text-[10px] font-bold uppercase ${isLight ? 'text-gray-550' : 'text-gray-400'}`}>Key Secret</label>
                    <input
                      type="password"
                      value={razorpayKeySecret}
                      onChange={e => setRazorpayKeySecret(e.target.value)}
                      className={`border rounded-xl text-xs py-2.5 px-3 focus:outline-none focus:border-indigo-500 font-semibold ${
                        isLight ? 'bg-white border-gray-200 text-gray-855' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                      }`}
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 px-5 rounded-xl transition-all shadow-md shadow-indigo-600/15 cursor-pointer self-start mt-2"
              >
                Save Payment Keys
              </button>
            </form>
          )}

          {/* 4. NOTIFICATION SETTINGS (CHANNELS AND ALERTS CONFIGS) */}
          {activeSettingsTab === 'notification' && (
            <form onSubmit={handleSaveNotificationSettings} className={`p-6 rounded-2xl border flex flex-col gap-5 max-w-3xl ${
              isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-white/5 border-white/5'
            }`}>
              <span className={`text-sm font-extrabold uppercase tracking-wider ${isLight ? 'text-gray-800' : 'text-white'}`}>
                Notification Preferences
              </span>

              {/* Channels Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2 border-b border-white/5">
                {/* Email Notify */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/2">
                  <div className="flex flex-col gap-0.5">
                    <span className={`text-xs font-bold ${isLight ? 'text-gray-800' : 'text-white'}`}>Email Notifications</span>
                    <span className="text-[10px] text-gray-500">Send platform alerts to admin email</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotifyEmailEnabled(!notifyEmailEnabled)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      notifyEmailEnabled ? 'bg-indigo-600' : 'bg-gray-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        notifyEmailEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Push Notify */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/2">
                  <div className="flex flex-col gap-0.5">
                    <span className={`text-xs font-bold ${isLight ? 'text-gray-800' : 'text-white'}`}>Push Notifications</span>
                    <span className="text-[10px] text-gray-500">Display browser notification prompts</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotifyPushEnabled(!notifyPushEnabled)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      notifyPushEnabled ? 'bg-indigo-600' : 'bg-gray-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        notifyPushEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Event Triggers checklist */}
              <div className="flex flex-col gap-3">
                <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider">Trigger Events Notifications</span>
                
                <div className="flex flex-col gap-2.5">
                  
                  {/* Booking Created Trigger */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyOnBookingCreated}
                      onChange={e => setNotifyOnBookingCreated(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-650 border-gray-300 focus:ring-indigo-500 cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className={`text-xs font-semibold ${isLight ? 'text-gray-800' : 'text-gray-200'}`}>On Booking Created</span>
                      <span className="text-[9px] text-gray-500">Alert admin immediately when a client schedules any heritage/custom event</span>
                    </div>
                  </label>

                  {/* Payment Received Trigger */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyOnPaymentReceived}
                      onChange={e => setNotifyOnPaymentReceived(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-650 border-gray-300 focus:ring-indigo-500 cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className={`text-xs font-semibold ${isLight ? 'text-gray-800' : 'text-gray-200'}`}>On Payment Confirmation</span>
                      <span className="text-[9px] text-gray-500">Alert admin when a payment transaction is successfully compiled</span>
                    </div>
                  </label>

                  {/* Event Schedule Updated Trigger */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyOnEventUpdated}
                      onChange={e => setNotifyOnEventUpdated(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-650 border-gray-300 focus:ring-indigo-500 cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className={`text-xs font-semibold ${isLight ? 'text-gray-800' : 'text-gray-200'}`}>On Event Status Change</span>
                      <span className="text-[9px] text-gray-500">Send alerts when planners modify event statuses (e.g. cancelled/completed)</span>
                    </div>
                  </label>

                  {/* Low Budget Trigger */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyOnLowBudgetAlert}
                      onChange={e => setNotifyOnLowBudgetAlert(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-650 border-gray-300 focus:ring-indigo-500 cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className={`text-xs font-semibold ${isLight ? 'text-gray-800' : 'text-gray-200'}`}>On Low Event Budget Limits</span>
                      <span className="text-[9px] text-gray-500">Generate warnings if expenses exceed 90% of the allocated event budget</span>
                    </div>
                  </label>

                </div>
              </div>

              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 px-5 rounded-xl transition-all shadow-md shadow-indigo-600/15 cursor-pointer self-start mt-2"
              >
                Save Preferences
              </button>
            </form>
          )}

          {/* 5. SYSTEM SETTINGS (MAINTENANCE, REGISTRATION, LIMITS) */}
          {activeSettingsTab === 'system' && (
            <form onSubmit={handleSaveSystemSettings} className={`p-6 rounded-2xl border flex flex-col gap-4 max-w-3xl ${
              isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-white/5 border-white/5'
            }`}>
              <span className={`text-sm font-extrabold uppercase tracking-wider ${isLight ? 'text-gray-800' : 'text-white'}`}>
                System Configurations
              </span>

              {/* Maintenance Mode toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/2">
                <div className="flex flex-col gap-0.5">
                  <span className={`text-xs font-bold ${isLight ? 'text-gray-800' : 'text-white'}`}>Maintenance Mode</span>
                  <span className="text-[10px] text-gray-550">Temporarily take the site offline for public access with a warning notice</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSystemMaintenanceMode(!systemMaintenanceMode)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    systemMaintenanceMode ? 'bg-[#f43f5e]' : 'bg-gray-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      systemMaintenanceMode ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Debug Mode toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/2">
                <div className="flex flex-col gap-0.5">
                  <span className={`text-xs font-bold ${isLight ? 'text-gray-800' : 'text-white'}`}>Debug Mode</span>
                  <span className="text-[10px] text-gray-550">Display detailed backend exception stacks on compilation warnings</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSystemDebugMode(!systemDebugMode)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    systemDebugMode ? 'bg-indigo-600' : 'bg-gray-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      systemDebugMode ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Allow User Registration toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/2">
                <div className="flex flex-col gap-0.5">
                  <span className={`text-xs font-bold ${isLight ? 'text-gray-800' : 'text-white'}`}>Allow Registrations</span>
                  <span className="text-[10px] text-gray-550">Enable or block standard client account registration forms</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSystemAllowRegistration(!systemAllowRegistration)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    systemAllowRegistration ? 'bg-indigo-600' : 'bg-gray-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      systemAllowRegistration ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Limits configurations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Max upload size dropdown */}
                <div className="flex flex-col gap-1">
                  <label className={`text-[10px] font-bold uppercase ${isLight ? 'text-gray-550' : 'text-gray-400'}`}>Max Upload File Size</label>
                  <div className="relative">
                    <select
                      value={systemMaxUploadSize}
                      onChange={e => setSystemMaxUploadSize(e.target.value)}
                      className={`appearance-none border rounded-xl text-xs py-2.5 pl-3 pr-9 focus:outline-none focus:border-indigo-500 font-semibold cursor-pointer w-full ${
                        isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                      }`}
                    >
                      <option value="2 MB">2 MB</option>
                      <option value="5 MB">5 MB</option>
                      <option value="10 MB">10 MB</option>
                      <option value="20 MB">20 MB</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>

                {/* Cache timeout dropdown */}
                <div className="flex flex-col gap-1">
                  <label className={`text-[10px] font-bold uppercase ${isLight ? 'text-gray-550' : 'text-gray-400'}`}>Cache Timeout</label>
                  <div className="relative">
                    <select
                      value={systemCacheTimeout}
                      onChange={e => setSystemCacheTimeout(e.target.value)}
                      className={`appearance-none border rounded-xl text-xs py-2.5 pl-3 pr-9 focus:outline-none focus:border-indigo-500 font-semibold cursor-pointer w-full ${
                        isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                      }`}
                    >
                      <option value="5 Min">5 Min</option>
                      <option value="15 Min">15 Min</option>
                      <option value="30 Min">30 Min</option>
                      <option value="60 Min">60 Min</option>
                      <option value="120 Min">120 Min</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 px-5 rounded-xl transition-all shadow-md shadow-indigo-600/15 cursor-pointer self-start mt-2"
              >
                Save System Configs
              </button>
            </form>
          )}

          {/* 6. BACKUP & RESTORE TAB */}
          {activeSettingsTab === 'backup' && (
            <div className="flex flex-col gap-6">
              
              {/* Trigger Backup Panel */}
              <div className={`p-6 rounded-2xl border flex flex-col sm:flex-row justify-between sm:items-center gap-4 ${
                isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-white/5 border-white/5'
              }`}>
                <div className="flex flex-col gap-0.5">
                  <span className={`text-sm font-extrabold uppercase tracking-wider ${isLight ? 'text-gray-800' : 'text-white'}`}>Database Backup Utility</span>
                  <span className="text-[11px] text-gray-500">Run manual SQL dumps to safeguard platform events, users, reviews, and vendors databases.</span>
                </div>
                
                <button
                  onClick={handleCreateBackup}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 px-4.5 rounded-xl transition-all shadow-md shadow-indigo-600/15 cursor-pointer shrink-0 flex items-center gap-2"
                >
                  <Download className="w-4 h-4 shrink-0" />
                  <span>Generate SQL Dump</span>
                </button>
              </div>

              {/* Backups List Table */}
              <div className={`p-5 rounded-2xl border flex flex-col gap-4 overflow-x-auto ${
                isLight ? 'bg-white border-gray-200/80 shadow-sm' : 'bg-white/5 border-white/5'
              }`}>
                <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-gray-800' : 'text-gray-200'}`}>Saved Backup History Logs</span>
                
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 font-semibold text-gray-500">
                      <th className="py-4 px-4 font-semibold text-gray-500">#</th>
                      <th className="py-4 px-4 font-semibold text-gray-500">Filename</th>
                      <th className="py-4 px-4 font-semibold text-gray-500">File Size</th>
                      <th className="py-4 px-4 font-semibold text-gray-500">Generated On</th>
                      <th className="py-4 px-4 text-right font-semibold text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y divide-white/2 font-medium ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                    {backupsList.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-gray-500 font-semibold">No backup logs found. Please generate a new SQL dump.</td>
                      </tr>
                    ) : (
                      backupsList.map((b, idx) => (
                        <tr key={b.id || idx} className={`${isLight ? 'hover:bg-gray-55' : 'hover:bg-white/2'} transition-colors relative`}>
                          <td className="py-4 px-4 font-bold text-gray-400">{idx + 1}</td>
                          <td className={`py-4 px-4 font-bold ${isLight ? 'text-gray-800' : 'text-white'}`}>{b.filename}</td>
                          <td className="py-4 px-4 text-gray-500 font-semibold">{b.size}</td>
                          <td className="py-4 px-4 text-gray-500 font-semibold">{b.date}</td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Download link */}
                              <button
                                onClick={() => {
                                  const textContent = `-- JAGAH SQL Dump\n-- Generated on ${b.date}\n-- File size ${b.size}\n-- Placeholder database snapshot structure.`;
                                  const blob = new Blob([textContent], { type: 'text/sql' });
                                  const downloadAnchor = document.createElement('a');
                                  downloadAnchor.href = URL.createObjectURL(blob);
                                  downloadAnchor.download = b.filename;
                                  document.body.appendChild(downloadAnchor);
                                  downloadAnchor.click();
                                  downloadAnchor.remove();
                                  showToast('Downloading SQL backup...', 'success');
                                }}
                                title="Download SQL Dump"
                                className={`p-1.5 rounded-lg border cursor-pointer transition-all ${
                                  isLight ? 'border-gray-200 hover:bg-gray-50 text-gray-700' : 'border-white/10 hover:bg-white/5 text-gray-300'
                                }`}
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                              
                              {/* Restore link */}
                              <button
                                onClick={() => handleRestoreBackup(b.filename)}
                                title="Restore from snapshot"
                                className={`p-1.5 rounded-lg border cursor-pointer transition-all ${
                                  isLight ? 'border-gray-200 hover:bg-gray-50 text-emerald-600' : 'border-white/10 hover:bg-white/5 text-emerald-400'
                                }`}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete link */}
                              <button
                                onClick={() => handleDeleteBackup(b.id, b.filename)}
                                title="Delete Backup file"
                                className={`p-1.5 rounded-lg border cursor-pointer transition-all hover:border-rose-500/30 hover:bg-rose-500/10 text-rose-450`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

        </div>
      )}

      {/* ==================================================== */}
      {/* OTHER TABS FALLBACK (FEEDBACK, VENUES, VENDORS, PAYMENTS, NEWSLETTER, ETC.) */}
      {/* ==================================================== */}
      {activeTab !== 'dashboard' && activeTab !== 'events' && activeTab !== 'users' && activeTab !== 'venues' && activeTab !== 'vendors' && activeTab !== 'bookings' && activeTab !== 'reports' && activeTab !== 'feedback' && activeTab !== 'settings' && (
        <div className={`p-6 rounded-2xl border flex flex-col gap-4 animate-scale-up ${
          isLight ? 'bg-white border-gray-200/80 shadow-sm' : 'bg-white/5 border-white/5'
        }`}>
          <div className="flex items-center gap-2 pb-2 border-b border-white/5">
            <Sliders className="w-5 h-5 text-indigo-500" />
            <h3 className={`text-xs font-bold uppercase tracking-wider capitalize ${isLight ? 'text-gray-800' : 'text-white'}`}>
              System {activeTab} Console
            </h3>
          </div>
          
          <div className="py-8 flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-14 h-14 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h4 className={`text-sm font-bold ${isLight ? 'text-gray-800' : 'text-white'}`}>Administrative Moderation Block</h4>
            <p className="text-xs text-gray-500 max-w-sm">
              This console provides advanced telemetry controls for platform {activeTab}. Seed data is pre-populated for analytics reviews.
            </p>
          </div>
        </div>
      )}

      {/* EDIT VENUE MODAL */}
      {editingVenue && (
        <div className="fixed inset-0 bg-[#07080a]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveVenue} className={`w-full max-w-md p-6 rounded-2xl border text-left shadow-2xl flex flex-col gap-4 ${
            isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0d1117] border-white/5 text-white'
          }`}>
            <h3 className="text-sm font-bold uppercase tracking-wider border-b border-white/5 pb-2">
              ✏️ Moderate Venue parameters
            </h3>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase text-gray-500">Venue Name</label>
              <input
                type="text"
                value={editingVenue.name}
                onChange={e => setEditingVenue({ ...editingVenue, name: e.target.value })}
                className={`border rounded-lg text-xs py-2.5 px-3 focus:outline-none focus:border-indigo-500 ${
                  isLight ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-white/5 border-white/5 text-white'
                }`}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase text-gray-500">Location</label>
              <input
                type="text"
                value={editingVenue.location}
                onChange={e => setEditingVenue({ ...editingVenue, location: e.target.value })}
                className={`border rounded-lg text-xs py-2.5 px-3 focus:outline-none focus:border-indigo-500 ${
                  isLight ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-white/5 border-white/5 text-white'
                }`}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-500">Capacity (Guests)</label>
                <input
                  type="number"
                  value={editingVenue.guest_count}
                  onChange={e => setEditingVenue({ ...editingVenue, guest_count: e.target.value })}
                  className={`border rounded-lg text-xs py-2.5 px-3 focus:outline-none focus:border-indigo-500 ${
                    isLight ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-white/5 border-white/5 text-white'
                  }`}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-500">Venue Type</label>
                <select
                  value={editingVenue.event_type}
                  onChange={e => setEditingVenue({ ...editingVenue, event_type: e.target.value })}
                  className={`border rounded-lg text-xs py-2.5 px-3 focus:outline-none focus:border-indigo-500 ${
                    isLight ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-white/5 border-white/5 text-white'
                  }`}
                >
                  <option value="hotel">Hotel</option>
                  <option value="resort">Resort</option>
                  <option value="palace">Palace</option>
                  <option value="banquet">Banquet</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-500">Status</label>
                <select
                  value={editingVenue.status}
                  onChange={e => setEditingVenue({ ...editingVenue, status: e.target.value })}
                  className={`border rounded-lg text-xs py-2.5 px-3 focus:outline-none focus:border-indigo-500 ${
                    isLight ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-white/5 border-white/5 text-white'
                  }`}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-500">Thumbnail Cover</label>
                <select
                  value={editingVenue.image}
                  onChange={e => setEditingVenue({ ...editingVenue, image: e.target.value })}
                  className={`border rounded-lg text-xs py-2.5 px-3 focus:outline-none focus:border-indigo-500 ${
                    isLight ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-white/5 border-white/5 text-white'
                  }`}
                >
                  <option value="/udaipur_palace.png">Udaipur Palace 1</option>
                  <option value="/udaipur_palace_light.png">Udaipur Palace Light</option>
                  <option value="/services_venues.png">Heritage Hotel</option>
                  <option value="/celebrate_collage1.png">Lake View Fort</option>
                  <option value="/celebrate_collage2.png">Royal Palace View</option>
                  <option value="/landing_wedding.png">Lush Lawn</option>
                  <option value="/services_scenarios.png">Aravali Resort</option>
                  <option value="/landing_custom.png">Island Palace</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => setEditingVenue(null)}
                className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isLight ? 'border-gray-200 text-gray-655 hover:bg-gray-50' : 'border-white/10 text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/15 cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ADD VENUE MODAL */}
      {isAddVenueModalOpen && (
        <div className="fixed inset-0 bg-[#07080a]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={(e) => handleAddVenue(e, newVenueData)} className={`w-full max-w-md p-6 rounded-2xl border text-left shadow-2xl flex flex-col gap-4 ${
            isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0d1117] border-white/5 text-white'
          }`}>
            <h3 className="text-sm font-bold uppercase tracking-wider border-b border-white/5 pb-2">
              ➕ Add New Udaipur Venue
            </h3>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase text-gray-500">Venue Name</label>
              <input
                type="text"
                placeholder="e.g. The Oberoi Udaivilas"
                value={newVenueData.name}
                onChange={e => setNewVenueData({ ...newVenueData, name: e.target.value })}
                className={`border rounded-lg text-xs py-2.5 px-3 focus:outline-none focus:border-indigo-500 ${
                  isLight ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-white/5 border-white/5 text-white'
                }`}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase text-gray-500">Location</label>
              <input
                type="text"
                placeholder="e.g. Lake Pichola, Udaipur"
                value={newVenueData.location}
                onChange={e => setNewVenueData({ ...newVenueData, location: e.target.value })}
                className={`border rounded-lg text-xs py-2.5 px-3 focus:outline-none focus:border-indigo-500 ${
                  isLight ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-white/5 border-white/5 text-white'
                }`}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-500">Capacity (Guests)</label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  value={newVenueData.guest_count}
                  onChange={e => setNewVenueData({ ...newVenueData, guest_count: e.target.value })}
                  className={`border rounded-lg text-xs py-2.5 px-3 focus:outline-none focus:border-indigo-500 ${
                    isLight ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-white/5 border-white/5 text-white'
                  }`}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-500">Venue Type</label>
                <select
                  value={newVenueData.event_type}
                  onChange={e => setNewVenueData({ ...newVenueData, event_type: e.target.value })}
                  className={`border rounded-lg text-xs py-2.5 px-3 focus:outline-none focus:border-indigo-500 ${
                    isLight ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-white/5 border-white/5 text-white'
                  }`}
                >
                  <option value="hotel">Hotel</option>
                  <option value="resort">Resort</option>
                  <option value="palace">Palace</option>
                  <option value="banquet">Banquet</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-500">Status</label>
                <select
                  value={newVenueData.status}
                  onChange={e => setNewVenueData({ ...newVenueData, status: e.target.value })}
                  className={`border rounded-lg text-xs py-2.5 px-3 focus:outline-none focus:border-indigo-500 ${
                    isLight ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-white/5 border-white/5 text-white'
                  }`}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-500">Thumbnail Cover</label>
                <select
                  value={newVenueData.image}
                  onChange={e => setNewVenueData({ ...newVenueData, image: e.target.value })}
                  className={`border rounded-lg text-xs py-2.5 px-3 focus:outline-none focus:border-indigo-500 ${
                    isLight ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-white/5 border-white/5 text-white'
                  }`}
                >
                  <option value="/udaipur_palace.png">Udaipur Palace 1</option>
                  <option value="/udaipur_palace_light.png">Udaipur Palace Light</option>
                  <option value="/services_venues.png">Heritage Hotel</option>
                  <option value="/celebrate_collage1.png">Lake View Fort</option>
                  <option value="/celebrate_collage2.png">Royal Palace View</option>
                  <option value="/landing_wedding.png">Lush Lawn</option>
                  <option value="/services_scenarios.png">Aravali Resort</option>
                  <option value="/landing_custom.png">Island Palace</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => setIsAddVenueModalOpen(false)}
                className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isLight ? 'border-gray-200 text-gray-650 hover:bg-gray-50' : 'border-white/10 text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/15 cursor-pointer"
              >
                Add Venue
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT EVENT MODAL */}
      {editingEvent && (
        <div className="fixed inset-0 bg-[#07080a]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveEvent} className={`w-full max-w-md p-6 rounded-2xl border text-left shadow-2xl flex flex-col gap-4 ${
            isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0d1117] border-white/5 text-white'
          }`}>
            <h3 className="text-sm font-bold uppercase tracking-wider border-b border-white/5 pb-2">
              ✏️ Moderate Event parameters
            </h3>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase text-gray-500">Event Title</label>
              <input
                type="text"
                value={editingEvent.title}
                onChange={e => setEditingEvent({ ...editingEvent, title: e.target.value })}
                className={`border rounded-lg text-xs py-2.5 px-3 focus:outline-none focus:border-indigo-500 ${
                  isLight ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-white/5 border-white/5 text-white'
                }`}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-500">Category</label>
                <select
                  value={editingEvent.event_type}
                  onChange={e => setEditingEvent({ ...editingEvent, event_type: e.target.value })}
                  className={`border rounded-lg text-xs py-2.5 px-3 focus:outline-none focus:border-indigo-500 ${
                    isLight ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-white/5 border-white/5 text-white'
                  }`}
                >
                  <option value="wedding">Wedding</option>
                  <option value="birthday">Birthday</option>
                  <option value="corporate">Corporate</option>
                  <option value="party">Party</option>
                  <option value="college">College Event</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-500">Date</label>
                <input
                  type="date"
                  value={editingEvent.date.split('T')[0]}
                  onChange={e => setEditingEvent({ ...editingEvent, date: e.target.value })}
                  className={`border rounded-lg text-xs py-2.5 px-3 focus:outline-none focus:border-indigo-500 ${
                    isLight ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-white/5 border-white/5 text-white'
                  }`}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-500">Budget (₹)</label>
                <input
                  type="number"
                  value={editingEvent.budget}
                  onChange={e => setEditingEvent({ ...editingEvent, budget: e.target.value })}
                  className={`border rounded-lg text-xs py-2.5 px-3 focus:outline-none focus:border-indigo-500 ${
                    isLight ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-white/5 border-white/5 text-white'
                  }`}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-500">Guests</label>
                <input
                  type="number"
                  value={editingEvent.guest_count}
                  onChange={e => setEditingEvent({ ...editingEvent, guest_count: e.target.value })}
                  className={`border rounded-lg text-xs py-2.5 px-3 focus:outline-none focus:border-indigo-500 ${
                    isLight ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-white/5 border-white/5 text-white'
                  }`}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => setEditingEvent(null)}
                className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isLight ? 'border-gray-200 text-gray-600 hover:bg-gray-50' : 'border-white/10 text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/15 cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT VENDOR MODAL */}
      {editingVendor && (
        <div className="fixed inset-0 bg-[#07080a]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveVendor} className={`w-full max-w-md p-6 rounded-2xl border text-left shadow-2xl flex flex-col gap-4 ${
            isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0d1117] border-white/5 text-white'
          }`}>
            <h3 className="text-sm font-bold uppercase tracking-wider border-b border-white/5 pb-2">
              ✏️ Moderate Vendor Parameters
            </h3>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase text-gray-500">Vendor Name</label>
              <input
                type="text"
                value={editingVendor.name}
                onChange={e => setEditingVendor({ ...editingVendor, name: e.target.value })}
                className={`border rounded-lg text-xs py-2.5 px-3 focus:outline-none focus:border-indigo-500 ${
                  isLight ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-white/5 border-white/5 text-white'
                }`}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-500">Category</label>
                <select
                  value={editingVendor.category}
                  onChange={e => setEditingVendor({ ...editingVendor, category: e.target.value })}
                  className={`border rounded-lg text-xs py-2.5 px-3 focus:outline-none focus:border-indigo-500 ${
                    isLight ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-white/5 border-white/5 text-white'
                  }`}
                >
                  <option value="Catering">Catering</option>
                  <option value="Decoration">Decoration</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Photography">Photography</option>
                  <option value="Event Planner">Event Planner</option>
                  <option value="Transport">Transport</option>
                  <option value="Equipment">Equipment</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-500">Contact Person</label>
                <input
                  type="text"
                  value={editingVendor.contact_person}
                  onChange={e => setEditingVendor({ ...editingVendor, contact_person: e.target.value })}
                  className={`border rounded-lg text-xs py-2.5 px-3 focus:outline-none focus:border-indigo-500 ${
                    isLight ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-white/5 border-white/5 text-white'
                  }`}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-500">Phone</label>
                <input
                  type="text"
                  value={editingVendor.phone}
                  onChange={e => setEditingVendor({ ...editingVendor, phone: e.target.value })}
                  className={`border rounded-lg text-xs py-2.5 px-3 focus:outline-none focus:border-indigo-500 ${
                    isLight ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-white/5 border-white/5 text-white'
                  }`}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-500">Email</label>
                <input
                  type="email"
                  value={editingVendor.email}
                  onChange={e => setEditingVendor({ ...editingVendor, email: e.target.value })}
                  className={`border rounded-lg text-xs py-2.5 px-3 focus:outline-none focus:border-indigo-500 ${
                    isLight ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-white/5 border-white/5 text-white'
                  }`}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-500">Status</label>
                <select
                  value={editingVendor.status}
                  onChange={e => setEditingVendor({ ...editingVendor, status: e.target.value })}
                  className={`border rounded-lg text-xs py-2.5 px-3 focus:outline-none focus:border-indigo-500 ${
                    isLight ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-white/5 border-white/5 text-white'
                  }`}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-500">Thumbnail Cover</label>
                <select
                  value={editingVendor.image}
                  onChange={e => setEditingVendor({ ...editingVendor, image: e.target.value })}
                  className={`border rounded-lg text-xs py-2.5 px-3 focus:outline-none focus:border-indigo-500 ${
                    isLight ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-white/5 border-white/5 text-white'
                  }`}
                >
                  <option value="/celebrate_collage1.png">Theme 1</option>
                  <option value="/celebrate_collage2.png">Theme 2</option>
                  <option value="/udaipur_palace.png">Udaipur Palace</option>
                  <option value="/udaipur_palace_light.png">Palace Light</option>
                  <option value="/services_venues.png">Heritage Service</option>
                  <option value="/landing_wedding.png">Lawn Decor</option>
                  <option value="/services_scenarios.png">Resort Backdrop</option>
                  <option value="/landing_custom.png">Custom Setup</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => setEditingVendor(null)}
                className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isLight ? 'border-gray-200 text-gray-650 hover:bg-gray-50' : 'border-white/10 text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/15 cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ADD VENDOR MODAL */}
      {isAddVendorModalOpen && (
        <div className="fixed inset-0 bg-[#07080a]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={(e) => handleAddVendor(e, newVendorData)} className={`w-full max-w-md p-6 rounded-2xl border text-left shadow-2xl flex flex-col gap-4 ${
            isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0d1117] border-white/5 text-white'
          }`}>
            <h3 className="text-sm font-bold uppercase tracking-wider border-b border-white/5 pb-2">
              ➕ Add New Vendor
            </h3>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase text-gray-500">Vendor Name</label>
              <input
                type="text"
                placeholder="e.g. Mewar Lights & Sounds"
                value={newVendorData.name}
                onChange={e => setNewVendorData({ ...newVendorData, name: e.target.value })}
                className={`border rounded-lg text-xs py-2.5 px-3 focus:outline-none focus:border-indigo-500 ${
                  isLight ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-white/5 border-white/5 text-white'
                }`}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-500">Category</label>
                <select
                  value={newVendorData.category}
                  onChange={e => setNewVendorData({ ...newVendorData, category: e.target.value })}
                  className={`border rounded-lg text-xs py-2.5 px-3 focus:outline-none focus:border-indigo-500 ${
                    isLight ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-white/5 border-white/5 text-white'
                  }`}
                >
                  <option value="Catering">Catering</option>
                  <option value="Decoration">Decoration</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Photography">Photography</option>
                  <option value="Event Planner">Event Planner</option>
                  <option value="Transport">Transport</option>
                  <option value="Equipment">Equipment</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-500">Contact Person</label>
                <input
                  type="text"
                  placeholder="e.g. Rajesh Kumar"
                  value={newVendorData.contact_person}
                  onChange={e => setNewVendorData({ ...newVendorData, contact_person: e.target.value })}
                  className={`border rounded-lg text-xs py-2.5 px-3 focus:outline-none focus:border-indigo-500 ${
                    isLight ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-white/5 border-white/5 text-white'
                  }`}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-500">Phone</label>
                <input
                  type="text"
                  placeholder="e.g. +91 98765 43210"
                  value={newVendorData.phone}
                  onChange={e => setNewVendorData({ ...newVendorData, phone: e.target.value })}
                  className={`border rounded-lg text-xs py-2.5 px-3 focus:outline-none focus:border-indigo-500 ${
                    isLight ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-white/5 border-white/5 text-white'
                  }`}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-500">Email</label>
                <input
                  type="email"
                  placeholder="e.g. info@mewarlight.com"
                  value={newVendorData.email}
                  onChange={e => setNewVendorData({ ...newVendorData, email: e.target.value })}
                  className={`border rounded-lg text-xs py-2.5 px-3 focus:outline-none focus:border-indigo-500 ${
                    isLight ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-white/5 border-white/5 text-white'
                  }`}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-500">Status</label>
                <select
                  value={newVendorData.status}
                  onChange={e => setNewVendorData({ ...newVendorData, status: e.target.value })}
                  className={`border rounded-lg text-xs py-2.5 px-3 focus:outline-none focus:border-indigo-500 ${
                    isLight ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-white/5 border-white/5 text-white'
                  }`}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-500">Thumbnail Cover</label>
                <select
                  value={newVendorData.image}
                  onChange={e => setNewVendorData({ ...newVendorData, image: e.target.value })}
                  className={`border rounded-lg text-xs py-2.5 px-3 focus:outline-none focus:border-indigo-500 ${
                    isLight ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-white/5 border-white/5 text-white'
                  }`}
                >
                  <option value="/celebrate_collage1.png">Theme 1</option>
                  <option value="/celebrate_collage2.png">Theme 2</option>
                  <option value="/udaipur_palace.png">Udaipur Palace</option>
                  <option value="/udaipur_palace_light.png">Palace Light</option>
                  <option value="/services_venues.png">Heritage Service</option>
                  <option value="/landing_wedding.png">Lawn Decor</option>
                  <option value="/services_scenarios.png">Resort Backdrop</option>
                  <option value="/landing_custom.png">Custom Setup</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => setIsAddVendorModalOpen(false)}
                className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isLight ? 'border-gray-200 text-gray-650 hover:bg-gray-50' : 'border-white/10 text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/15 cursor-pointer"
              >
                Add Vendor
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
