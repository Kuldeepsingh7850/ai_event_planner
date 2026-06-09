import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import { LogoIcon } from '../../components/Logo';
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
  Frown,
  Camera,
  Loader2,
  Lock,
  User,
  RotateCcw
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

const formatEventTime = (timeVal) => {
  if (!timeVal) return '';
  
  // Handle TIME strings from MySQL (e.g. "12:00:00", "16:00:00")
  if (typeof timeVal === 'string' && timeVal.includes(':')) {
    const parts = timeVal.split(':');
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1] ? parts[1].padStart(2, '0') : '00';
    if (!isNaN(hours)) {
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      return `${hours}:${minutes} ${ampm}`;
    }
  }
  
  const date = new Date(timeVal);
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

const getRealEventCover = (category) => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('wedding') || cat.includes('marriage')) return '/leela_palace.jpg';
  if (cat.includes('birthday') || cat.includes('anniversary')) return '/hero_udaipur_3.jpg';
  if (cat.includes('corporate') || cat.includes('seminar') || cat.includes('conference')) return '/oberoi_udaivilas.jpg';
  if (cat.includes('college') || cat.includes('festival') || cat.includes('fest')) return '/monsoon_palace.jpg';
  if (cat.includes('private') || cat.includes('party')) return '/jag_mandir.jpg';
  return '/hero_udaipur_1.jpg';
};

const getRealVendorCover = (category) => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('catering') || cat.includes('food') || cat.includes('bakery') || cat.includes('sweet')) return '/hero_udaipur_2.jpg';
  if (cat.includes('decor') || cat.includes('flower') || cat.includes('stage') || cat.includes('tent')) return '/shiv_niwas.jpg';
  if (cat.includes('entertainment') || cat.includes('music') || cat.includes('sound') || cat.includes('light') || cat.includes('dj')) return '/hero_udaipur_3.jpg';
  if (cat.includes('photo') || cat.includes('video') || cat.includes('camera')) return '/jag_mandir.jpg';
  if (cat.includes('planner') || cat.includes('organizer')) return '/leela_palace.jpg';
  return '/hero_udaipur_1.jpg';
};

const getRealVenueCover = (nameOrType) => {
  const nt = (nameOrType || '').toLowerCase();
  if (nt.includes('leela')) return '/leela_palace.jpg';
  if (nt.includes('lake palace') || nt.includes('taj')) return '/taj_lake_palace.jpg';
  if (nt.includes('udaivilas') || nt.includes('oberoi')) return '/oberoi_udaivilas.jpg';
  if (nt.includes('fateh garh') || nt.includes('resort')) return '/monsoon_palace.jpg';
  if (nt.includes('shiv niwas') || nt.includes('ramada')) return '/shiv_niwas.jpg';
  if (nt.includes('jag mandir') || nt.includes('bijolai') || nt.includes('fort')) return '/jag_mandir.jpg';
  if (nt.includes('radisson') || nt.includes('hilltop')) return '/hero_udaipur_3.jpg';
  return '/leela_palace.jpg';
};

const resolveImage = (imgSrc, type, categoryOrName) => {
  const isMock = !imgSrc || 
                 imgSrc.includes('udaipur_palace') || 
                 imgSrc.includes('celebrate_collage') || 
                 imgSrc.includes('services_') || 
                 imgSrc.includes('landing_') ||
                 imgSrc.endsWith('.png');
  
  if (imgSrc && imgSrc.includes('logo.png')) {
    return imgSrc;
  }
  
  if (!isMock) return imgSrc;
  
  if (type === 'event') {
    return getRealEventCover(categoryOrName);
  } else if (type === 'vendor') {
    return getRealVendorCover(categoryOrName);
  } else {
    return getRealVenueCover(categoryOrName);
  }
};


const defaultVenuesList = [
  {
    id: 1,
    name: 'The Leela Palace Udaipur',
    type: 'Luxury Hotel',
    event_type: 'hotel',
    location: 'Lake Pichola, Udaipur',
    minCapacity: 200,
    maxCapacity: 500,
    guest_count: 500,
    priceTier: '₹₹₹₹',
    priceNum: 4,
    rating: 4.8,
    image: '/leela_palace.jpg',
    amenities: ['Pool', 'AC Hall', 'Parking', 'Bar', 'Stage'],
    description: 'A majestic palace hotel located on the banks of Lake Pichola, offering signature luxury services and exquisite dining setups for royal weddings.',
    status: 'active',
    created_at: '2024-04-10T10:00:00.000Z',
    gallery: [
      '/leela_palace.jpg',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80'
    ]
  },
  {
    id: 2,
    name: 'Fateh Garh Resort',
    type: 'Heritage Resort',
    event_type: 'resort',
    location: 'Sajjangarh, Udaipur',
    minCapacity: 100,
    maxCapacity: 300,
    guest_count: 300,
    priceTier: '₹₹₹',
    priceNum: 3,
    rating: 4.6,
    image: '/monsoon_palace.jpg',
    amenities: ['AC Hall', 'Parking', 'Stage', 'Sound System'],
    description: 'Perched on a hill offering panoramic views of the Aravalli ranges, Fateh Garh is a heritage resort perfect for authentic cultural themes and grand receptions.',
    status: 'active',
    created_at: '2024-04-12T10:00:00.000Z',
    gallery: [
      '/monsoon_palace.jpg',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=600&q=80'
    ]
  },
  {
    id: 3,
    name: 'Radisson Blu Udaipur',
    type: 'Hotel',
    event_type: 'hotel',
    location: 'Rani Road, Udaipur',
    minCapacity: 100,
    maxCapacity: 600,
    guest_count: 600,
    priceTier: '₹₹₹',
    priceNum: 3,
    rating: 4.4,
    image: '/hero_udaipur_3.jpg',
    amenities: ['Pool', 'AC Hall', 'Parking', 'Bar'],
    description: 'Overlooking Lake Fateh Sagar, this resort features spacious indoor halls and a grand pool deck suitable for corporate fests and engagement parties.',
    status: 'active',
    created_at: '2024-04-15T10:00:00.000Z',
    gallery: [
      '/hero_udaipur_3.jpg',
      'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80'
    ]
  },
  {
    id: 4,
    name: 'Bhanwar Singh Palace Udaipur',
    type: 'Palace',
    event_type: 'palace',
    location: 'Udaipur',
    minCapacity: 250,
    maxCapacity: 800,
    guest_count: 800,
    priceTier: '₹₹₹₹',
    priceNum: 4,
    rating: 4.7,
    image: '/hero_udaipur_1.jpg',
    amenities: ['Pool', 'AC Hall', 'Parking', 'Stage', 'Sound System'],
    description: 'A luxurious palace resort featuring expansive lawns and royal architecture, offering an ideal setting for destination weddings in Udaipur.',
    status: 'active',
    created_at: '2024-04-18T10:00:00.000Z',
    gallery: [
      '/hero_udaipur_1.jpg',
      'https://images.unsplash.com/photo-1605538032432-a9f0c8d9ba5e?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1613553507747-5f8d62ad5904?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80'
    ]
  },
  {
    id: 5,
    name: 'Ramada Resort Udaipur',
    type: 'Resort',
    event_type: 'resort',
    location: 'Rampura, Udaipur',
    minCapacity: 100,
    maxCapacity: 300,
    guest_count: 300,
    priceTier: '₹₹',
    priceNum: 2,
    rating: 4.5,
    image: '/shiv_niwas.jpg',
    amenities: ['Pool', 'AC Hall', 'Parking', 'Bar'],
    description: 'Ramada Resort & Spa features stone walls and traditional architecture, offering multi-tiered lawns and modern banquet halls.',
    status: 'active',
    created_at: '2024-04-20T10:00:00.000Z',
    gallery: [
      '/shiv_niwas.jpg',
      'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?auto=format&fit=crop&w=600&q=80'
    ]
  },
  {
    id: 6,
    name: 'Bijolai Fort Udaipur',
    type: 'Heritage Venue',
    event_type: 'resort',
    location: 'Udaipur',
    minCapacity: 50,
    maxCapacity: 200,
    guest_count: 200,
    priceTier: '₹₹',
    priceNum: 2,
    rating: 4.4,
    image: '/jag_mandir.jpg',
    amenities: ['AC Hall', 'Parking', 'Stage'],
    description: 'Constructed in the 19th century beside a lake, this fort features heritage courtyards perfect for close-knit traditional functions in Udaipur.',
    status: 'active',
    created_at: '2024-04-22T10:00:00.000Z',
    gallery: [
      '/jag_mandir.jpg',
      'https://images.unsplash.com/photo-1585983224974-084a8e065e76?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80'
    ]
  },
  {
    id: 7,
    name: 'Hotel Hilltop Palace',
    type: 'Hotel',
    event_type: 'hotel',
    location: 'Ambavgarh, Udaipur',
    minCapacity: 100,
    maxCapacity: 400,
    guest_count: 400,
    priceTier: '₹₹',
    priceNum: 2,
    rating: 4.3,
    image: '/hero_udaipur_2.jpg',
    amenities: ['AC Hall', 'Parking', 'Bar'],
    description: 'Located atop the highest point in Udaipur, this hotel offers stunning lake views and classical Rajasthani hospitality packages.',
    status: 'active',
    created_at: '2024-04-25T10:00:00.000Z',
    gallery: [
      '/hero_udaipur_2.jpg',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1598977123418-45f04b01f4ac?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1568495248636-6432b97bd949?auto=format&fit=crop&w=600&q=80'
    ]
  },
  {
    id: 8,
    name: 'Aravali Lawn',
    type: 'Lawn',
    event_type: 'banquet',
    location: 'Udaipur',
    minCapacity: 150,
    maxCapacity: 600,
    guest_count: 600,
    priceTier: '₹₹',
    priceNum: 2,
    rating: 4.2,
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80',
    amenities: ['Parking', 'Stage', 'Sound System'],
    description: 'A spacious lush green open lawn nestled near the foothills, offering an open-air starlight dining experience for massive gatherings.',
    status: 'active',
    created_at: '2024-04-28T10:00:00.000Z',
    gallery: [
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1473163928189-364b2c4e1135?auto=format&fit=crop&w=600&q=80'
    ]
  },
  {
    id: 9,
    name: 'The Oberoi Udaivilas',
    type: 'Luxury Hotel',
    event_type: 'hotel',
    location: 'Haridasji Ki Magri, Udaipur',
    minCapacity: 150,
    maxCapacity: 450,
    guest_count: 450,
    priceTier: '₹₹₹₹',
    priceNum: 4,
    rating: 4.9,
    image: '/oberoi_udaivilas.jpg',
    amenities: ['Pool', 'AC Hall', 'Parking', 'Bar', 'Stage', 'Sound System'],
    description: 'Famed for its grand architecture and lake-front pools, Udaivilas offers a royal fairytale wedding experience with flawless service standards.',
    status: 'active',
    created_at: '2024-05-01T10:00:00.000Z',
    gallery: [
      '/oberoi_udaivilas.jpg',
      'https://images.unsplash.com/photo-1549294413-26f195afcbce?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1621293954908-907141447fc9?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=600&q=80'
    ]
  },
  {
    id: 10,
    name: 'Taj Lake Palace',
    type: 'Luxury Hotel',
    event_type: 'hotel',
    location: 'Lake Pichola, Udaipur',
    minCapacity: 80,
    maxCapacity: 250,
    guest_count: 250,
    priceTier: '₹₹₹₹',
    priceNum: 4,
    rating: 4.9,
    image: '/taj_lake_palace.jpg',
    amenities: ['Pool', 'AC Hall', 'Parking', 'Bar', 'Stage'],
    description: 'An iconic white marble floating palace on Lake Pichola, Taj Lake Palace offers complete island isolation for high-profile celebrations.',
    status: 'active',
    created_at: '2024-05-03T10:00:00.000Z',
    gallery: [
      '/taj_lake_palace.jpg',
      'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=600&q=80'
    ]
  }
];

const defaultVendorsList = [
  {
    id: 1,
    name: 'Apex Sound & Lights',
    category: 'Entertainment',
    contact_person: 'Harish Vyas',
    phone: '+91 94140 12345',
    email: 'contact@apexsound.com',
    status: 'active',
    created_at: '2024-04-11T10:00:00.000Z',
    image: '/hero_udaipur_3.jpg'
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
    image: '/shiv_niwas.jpg'
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
    image: '/hero_udaipur_2.jpg'
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
    image: '/jag_mandir.jpg'
  },
  {
    id: 5,
    name: 'Udaipur Event Management',
    category: 'Event Planner',
    contact_person: 'Amit Mehta',
    phone: '+91 70140 77889',
    email: 'info@udaipurevents.com',
    status: 'active',
    created_at: '2024-04-19T10:00:00.000Z',
    image: '/leela_palace.jpg'
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
    image: '/hero_udaipur_1.jpg'
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
    image: '/hero_udaipur_2.jpg'
  },
  {
    id: 8,
    name: 'Udaipur Tent & Stage',
    category: 'Equipment',
    contact_person: 'Suresh Sen',
    phone: '+91 98870 55667',
    email: 'contact@udaipurtent.com',
    status: 'active',
    created_at: '2024-04-26T10:00:00.000Z',
    image: '/shiv_niwas.jpg'
  },
  {
    id: 9,
    name: 'Mewar Sound & DJ Udaipur',
    category: 'Entertainment',
    contact_person: 'Rajesh Menaria',
    phone: '+91 94141 66778',
    email: 'dj@mewarsound.com',
    status: 'active',
    created_at: '2024-04-28T10:00:00.000Z',
    image: '/hero_udaipur_3.jpg'
  },
  {
    id: 10,
    name: 'The Wedding Filmer Udaipur',
    category: 'Photography',
    contact_person: 'Rohan Kothari',
    phone: '+91 98280 55443',
    email: 'rohan@weddingfilmer.com',
    status: 'active',
    created_at: '2024-05-01T10:00:00.000Z',
    image: '/jag_mandir.jpg'
  },
  {
    id: 11,
    name: 'Lake City Flowers & Decor',
    category: 'Decoration',
    contact_person: 'Manish Sharma',
    phone: '+91 94611 22334',
    email: 'manish@lakecityflowers.com',
    status: 'active',
    created_at: '2024-05-03T10:00:00.000Z',
    image: '/shiv_niwas.jpg'
  },
  {
    id: 12,
    name: 'Shreeji Catering & Sweets',
    category: 'Catering',
    contact_person: 'Kailash Chandra',
    phone: '+91 99291 88990',
    email: 'kailash@shreejicaterers.com',
    status: 'active',
    created_at: '2024-05-05T10:00:00.000Z',
    image: '/hero_udaipur_2.jpg'
  },
  {
    id: 13,
    name: 'Aravali Wedding Planners',
    category: 'Event Planner',
    contact_person: 'Shruti Paliwal',
    phone: '+91 77270 44556',
    email: 'shruti@aravaliwedding.com',
    status: 'active',
    created_at: '2024-05-08T10:00:00.000Z',
    image: '/oberoi_udaivilas.jpg'
  },
  {
    id: 14,
    name: 'Rajasthan Royal Tents',
    category: 'Equipment',
    contact_person: 'Gurnam Singh',
    phone: '+91 98299 11223',
    email: 'tents@rajroyal.com',
    status: 'active',
    created_at: '2024-05-10T10:00:00.000Z',
    image: '/shiv_niwas.jpg'
  },
  {
    id: 15,
    name: 'Udaipur Luxury Cabs & Travels',
    category: 'Transport',
    contact_person: 'Yashwant Singh',
    phone: '+91 94142 88990',
    email: 'luxurycabs@udaipurtravels.com',
    status: 'active',
    created_at: '2024-05-12T10:00:00.000Z',
    image: '/hero_udaipur_1.jpg'
  }
];

export default function AdminDashboard() {
  const router = useRouter();
  const { user, authFetch, loading: authLoading, updateUserAvatar, updateUserName } = useAuth();
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
  const [eventStartDate, setEventStartDate] = useState('');
  const [eventEndDate, setEventEndDate] = useState('');
  const [isEventDatePickerOpen, setIsEventDatePickerOpen] = useState(false);
  const eventDatePickerRef = useRef(null);

  // Filter States for Users Tab
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('All');
  const [userStatusFilter, setUserStatusFilter] = useState('All');
  const [userCurrentPage, setUserCurrentPage] = useState(1);
  const [userPageSize, setUserPageSize] = useState(10);

  // Edit Event State
  const [editingEvent, setEditingEvent] = useState(null);
  const [activeUserMenuId, setActiveUserMenuId] = useState(null);
  const [activeEventMenuId, setActiveEventMenuId] = useState(null);

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
    image: '/leela_palace.jpg'
  });

  // Seeded list of default Udaipur venues
  const [venuesList, setVenuesList] = useState(defaultVenuesList);

  // Filter States for Reports Tab
  const [reportEventFilter, setReportEventFilter] = useState('All');
  const [reportVenueFilter, setReportVenueFilter] = useState('All');
  const [reportVendorFilter, setReportVendorFilter] = useState('All');
  const [reportStartDate, setReportStartDate] = useState('2026-05-01');
  const [reportEndDate, setReportEndDate] = useState('2026-05-31');

  // Filter States for Dashboard Tab
  const [dashboardStartDate, setDashboardStartDate] = useState('');
  const [dashboardEndDate, setDashboardEndDate] = useState('');
  const [isDashboardDatePickerOpen, setIsDashboardDatePickerOpen] = useState(false);

  // States for Users Tab
  const [userStartDate, setUserStartDate] = useState('');
  const [userEndDate, setUserEndDate] = useState('');
  const [isUserDatePickerOpen, setIsUserDatePickerOpen] = useState(false);

  // States for Events Overview & Revenue Overview Dropdowns
  const [eventsChartRangeLabel, setEventsChartRangeLabel] = useState('All Time');
  const [isEventsChartDropdownOpen, setIsEventsChartDropdownOpen] = useState(false);
  const [revenueChartRangeLabel, setRevenueChartRangeLabel] = useState('All Time');
  const [isRevenueChartDropdownOpen, setIsRevenueChartDropdownOpen] = useState(false);
  const [eventsChartStartDate, setEventsChartStartDate] = useState('');
  const [eventsChartEndDate, setEventsChartEndDate] = useState('');
  const [revenueChartStartDate, setRevenueChartStartDate] = useState('');
  const [revenueChartEndDate, setRevenueChartEndDate] = useState('');

  // States for Venues, Vendors, and Bookings date range pickers
  const [venueStartDate, setVenueStartDate] = useState('');
  const [venueEndDate, setVenueEndDate] = useState('');
  const [isVenueDatePickerOpen, setIsVenueDatePickerOpen] = useState(false);
  const venueDatePickerRef = useRef(null);

  const [vendorStartDate, setVendorStartDate] = useState('');
  const [vendorEndDate, setVendorEndDate] = useState('');
  const [isVendorDatePickerOpen, setIsVendorDatePickerOpen] = useState(false);
  const vendorDatePickerRef = useRef(null);

  const [bookingStartDate, setBookingStartDate] = useState('');
  const [bookingEndDate, setBookingEndDate] = useState('');
  const [isBookingDatePickerOpen, setIsBookingDatePickerOpen] = useState(false);
  const bookingDatePickerRef = useRef(null);

  const dashboardDatePickerRef = useRef(null);
  const userDataPickerRef = useRef(null);
  const eventsChartDropdownRef = useRef(null);
  const revenueChartDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dashboardDatePickerRef.current && !dashboardDatePickerRef.current.contains(event.target)) {
        setIsDashboardDatePickerOpen(false);
      }
      if (userDataPickerRef.current && !userDataPickerRef.current.contains(event.target)) {
        setIsUserDatePickerOpen(false);
      }
      if (eventsChartDropdownRef.current && !eventsChartDropdownRef.current.contains(event.target)) {
        setIsEventsChartDropdownOpen(false);
      }
      if (revenueChartDropdownRef.current && !revenueChartDropdownRef.current.contains(event.target)) {
        setIsRevenueChartDropdownOpen(false);
      }
      if (venueDatePickerRef.current && !venueDatePickerRef.current.contains(event.target)) {
        setIsVenueDatePickerOpen(false);
      }
      if (vendorDatePickerRef.current && !vendorDatePickerRef.current.contains(event.target)) {
        setIsVendorDatePickerOpen(false);
      }
      if (bookingDatePickerRef.current && !bookingDatePickerRef.current.contains(event.target)) {
        setIsBookingDatePickerOpen(false);
      }
      if (eventDatePickerRef.current && !eventDatePickerRef.current.contains(event.target)) {
        setIsEventDatePickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [viewingUserProfile, setViewingUserProfile] = useState(null);
  const [viewingVenueDetails, setViewingVenueDetails] = useState(null);
  const [viewingVendorDetails, setViewingVendorDetails] = useState(null);
  const [viewingFeedbackDetails, setViewingFeedbackDetails] = useState(null);
  const [viewingEventDetails, setViewingEventDetails] = useState(null);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });

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
    image: '/hero_udaipur_2.jpg'
  });

  // Seeded list of 15 custom mockup Udaipur vendors matching layout
  const [vendorsList, setVendorsList] = useState(defaultVendorsList);

  // Admin Profile States
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminDesignation, setAdminDesignation] = useState('');
  const [adminLocation, setAdminLocation] = useState('');
  const [adminBio, setAdminBio] = useState('');
  const [adminAvatar, setAdminAvatar] = useState('');

  const [adminSubmitLoading, setAdminSubmitLoading] = useState(false);
  const [adminUploadLoading, setAdminUploadLoading] = useState(false);

  // Admin Change Password States
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSubmitLoading, setPasswordSubmitLoading] = useState(false);

  // Load admin profile data
  useEffect(() => {
    if (user) {
      setAdminName(user.name || '');
      setAdminEmail(user.email || '');
      setAdminAvatar(user.avatar || '');

      const localKey = `profile_settings_${user.id}`;
      const localSettings = localStorage.getItem(localKey);
      if (localSettings) {
        try {
          const parsed = JSON.parse(localSettings);
          setAdminPhone(parsed.phoneNumber || '');
          setAdminDesignation(parsed.designation || 'System Administrator');
          setAdminLocation(parsed.location || 'Udaipur, Rajasthan, India');
          setAdminBio(parsed.bio || 'Managing heritage venue events, bookings, and platform coordination.');
        } catch (e) {}
      } else {
        setAdminPhone('+91 98765 43210');
        setAdminDesignation('System Administrator');
        setAdminLocation('Udaipur, Rajasthan, India');
        setAdminBio('Managing heritage venue events, bookings, and platform coordination.');
      }
    }
  }, [user]);

  // Helper to shift old 2024 mock dates to 2026 dynamically relative to today
  const adjustMockDate = (dateStr, id) => {
    if (!dateStr) return dateStr;
    // If it's a 2024 date, let's dynamically shift it relative to current date
    if (dateStr.startsWith('2024')) {
      const now = new Date();
      let daysAgo = 2;
      if (id === 1) daysAgo = 1;
      else if (id === 2) daysAgo = 3;
      else if (id === 3) daysAgo = 5;
      else if (id === 4) daysAgo = 10;
      else if (id === 5) daysAgo = 15;
      else if (id === 6) daysAgo = 20;
      else if (id === 7) daysAgo = 25;
      else if (id === 8) daysAgo = 35;
      else if (id === 9) daysAgo = 45;
      else daysAgo = 10 + (id * 5);
      const d = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      return d.toISOString();
    }
    return dateStr;
  };

  // Load saved settings from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {

      const savedVenues = localStorage.getItem('venues_data');
      let parsedVenues = null;
      if (savedVenues) {
        try { parsedVenues = JSON.parse(savedVenues); } catch (e) {}
      }
      const hasVenuePlaceholder = parsedVenues && parsedVenues.some(v => v.image && v.image.endsWith('.png') && !v.image.includes('logo.png'));

      let finalVenues = defaultVenuesList;
      if (parsedVenues && !hasVenuePlaceholder) {
        try {
          finalVenues = parsedVenues.map(v => {
            const event_type = v.event_type || (v.type ? (v.type.toLowerCase().includes('resort') ? 'resort' : v.type.toLowerCase().includes('palace') ? 'palace' : v.type.toLowerCase().includes('lawn') ? 'banquet' : 'hotel') : 'hotel');
            const type = v.type || (event_type.charAt(0).toUpperCase() + event_type.slice(1) + ' Venue');
            const defaultVenue = defaultVenuesList.find(dv => dv.id.toString() === v.id.toString());
            const gallery = (defaultVenue && defaultVenue.id <= 10)
              ? defaultVenue.gallery
              : (v.gallery || (defaultVenue ? defaultVenue.gallery : []));
            const image = (defaultVenue && defaultVenue.id <= 10)
              ? defaultVenue.image
              : (v.image || '/leela_palace.jpg');
            return {
              ...v,
              image,
              event_type,
              type,
              status: v.status || 'active',
              maxCapacity: v.maxCapacity || v.guest_count || 300,
              guest_count: v.guest_count || v.maxCapacity || 300,
              location: v.location || 'Udaipur',
              gallery
            };
          });
        } catch (e) {
          finalVenues = defaultVenuesList;
        }
      }

      const adjustedVenues = finalVenues.map(v => ({
        ...v,
        created_at: adjustMockDate(v.created_at, v.id)
      }));
      setVenuesList(adjustedVenues);
      localStorage.setItem('venues_data', JSON.stringify(adjustedVenues));

      const savedVendors = localStorage.getItem('vendors_data');
      let parsedVendors = null;
      if (savedVendors) {
        try { parsedVendors = JSON.parse(savedVendors); } catch (e) {}
      }
      const hasVendorPlaceholder = parsedVendors && parsedVendors.some(v => v.image && v.image.endsWith('.png'));

      let finalVendors = defaultVendorsList;
      if (parsedVendors && !hasVendorPlaceholder) {
        finalVendors = parsedVendors;
      }
      const adjustedVendors = finalVendors.map(v => ({
        ...v,
        created_at: adjustMockDate(v.created_at, v.id)
      }));
      setVendorsList(adjustedVendors);
      localStorage.setItem('vendors_data', JSON.stringify(adjustedVendors));
    }
  }, []);

  const handleAdminAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      return showToast('Image file size must be less than 2MB', 'warning');
    }

    if (!file.type.startsWith('image/')) {
      return showToast('Please select a valid image file', 'warning');
    }

    setAdminUploadLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      try {
        const res = await authFetch('/profile/avatar', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatar: base64String })
        });
        if (res.ok) {
          const data = await res.json();
          setAdminAvatar(data.avatar);
          if (updateUserAvatar) {
            updateUserAvatar(data.avatar);
          }
          showToast('Admin profile photo updated successfully!', 'success');
        } else {
          const data = await res.json();
          throw new Error(data.message || 'Failed to upload photo');
        }
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setAdminUploadLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAdminProfile = async (e) => {
    e.preventDefault();
    setAdminSubmitLoading(true);

    try {
      // 1. Save locally to persist the extra fields using user-scoped key
      const profileObj = {
        fullName: adminName,
        emailAddress: adminEmail,
        phoneNumber: adminPhone,
        designation: adminDesignation,
        location: adminLocation,
        bio: adminBio
      };
      const localKey = user ? `profile_settings_${user.id}` : 'profile_settings';
      localStorage.setItem(localKey, JSON.stringify(profileObj));

      // 2. Call API to update full name in DB
      const res = await authFetch('/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: adminName })
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to update name in database');
      }

      // 3. Sync changes to global AuthContext state
      if (updateUserName) {
        updateUserName(adminName);
      }

      showToast('Admin profile changes saved successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Error saving changes', 'error');
    } finally {
      setAdminSubmitLoading(false);
    }
  };

  const handleUpdateAdminPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      return showToast('Please fill out all password fields', 'warning');
    }
    if (newPassword !== confirmPassword) {
      return showToast('New passwords do not match!', 'error');
    }
    if (newPassword.length < 6) {
      return showToast('Password must be at least 6 characters long', 'warning');
    }

    setPasswordSubmitLoading(true);
    // Mock password update
    setTimeout(() => {
      setPasswordSubmitLoading(false);
      setNewPassword('');
      setConfirmPassword('');
      showToast('Admin password updated successfully!', 'success');
    }, 1000);
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
  const fetchAdminData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [uRes, eRes, fRes] = await Promise.allSettled([
        authFetch('/admin/users'),
        authFetch('/admin/events'),
        authFetch('/feedback')
      ]);

      if (uRes.status === 'fulfilled' && uRes.value.ok) {
        const uData = await uRes.value.json();
        setUsersList(uData);
      } else {
        const errReason = uRes.status === 'rejected' ? uRes.reason : `HTTP ${uRes.value?.status}`;
        if (!silent) console.error('Error fetching administrative users:', errReason);
      }

      if (eRes.status === 'fulfilled' && eRes.value.ok) {
        const eData = await eRes.value.json();
        const adjustedEvents = eData.map(e => {
          if (e.id === 1 || e.title === 'Annual College Farewell 2026') {
            const now = new Date();
            const d = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
            const dateStr = d.toISOString().split('T')[0];
            return {
              ...e,
              date: dateStr,
              created_at: d.toISOString()
            };
          }
          return e;
        });
        setEvents(adjustedEvents);
      } else {
        const errReason = eRes.status === 'rejected' ? eRes.reason : `HTTP ${eRes.value?.status}`;
        if (!silent) console.error('Error fetching events:', errReason);
      }

      if (fRes.status === 'fulfilled' && fRes.value.ok) {
        const fData = await fRes.value.json();
        setFeedbacks(fData);
      } else {
        const errReason = fRes.status === 'rejected' ? fRes.reason : `HTTP ${fRes.value?.status}`;
        if (!silent) console.error('Error fetching feedback:', errReason);
      }
    } catch (err) {
      if (!silent) console.error('Error fetching administrative data:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Redirect guard
  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'admin') {
        router.replace('/dashboard');
      } else {
        fetchAdminData();
        // Clear default date range on client mount
        setDashboardStartDate('');
        setDashboardEndDate('');
        setEventsChartRangeLabel('All Time');
        setRevenueChartRangeLabel('All Time');
      }
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      const interval = setInterval(() => {
        fetchAdminData(true);
      }, 5000);

      const handleFocus = () => {
        fetchAdminData(true);
      };
      window.addEventListener('focus', handleFocus);

      return () => {
        clearInterval(interval);
        window.removeEventListener('focus', handleFocus);
      };
    }
  }, [user]);

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
    const updated = venuesList.map(v => v.id === venueId ? { ...v, status: nextStatus } : v);
    setVenuesList(updated);
    localStorage.setItem('venues_data', JSON.stringify(updated));
    showToast(`Venue status updated to ${nextStatus}`, 'success');
  };

  const handleDeleteVenue = (venueId, name) => {
    if (!window.confirm(`Are you sure you want to delete venue "${name}"?`)) {
      return;
    }
    const updated = venuesList.filter(v => v.id !== venueId);
    setVenuesList(updated);
    localStorage.setItem('venues_data', JSON.stringify(updated));
    showToast(`Deleted venue "${name}"`, 'success');
  };

  const handleSaveVenue = (e) => {
    e.preventDefault();
    if (editingVenue) {
      const updated = venuesList.map(v => v.id === editingVenue.id ? { 
        ...editingVenue,
        guest_count: parseInt(editingVenue.guest_count),
        maxCapacity: parseInt(editingVenue.guest_count) // keep maxCapacity in sync for User catalog
      } : v);
      setVenuesList(updated);
      localStorage.setItem('venues_data', JSON.stringify(updated));
      showToast(`Venue details updated successfully`, 'success');
      setEditingVenue(null);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch('/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUserData)
      });
      if (res.ok) {
        const addedUser = await res.json();
        showToast(`User "${addedUser.name}" created successfully!`, 'success');
        setUsersList(prev => [...prev, addedUser]);
        setNewUserData({ name: '', email: '', password: '', role: 'user' });
        setIsAddUserModalOpen(false);
      } else {
        const errData = await res.json();
        showToast(errData.message || 'Error creating user', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
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
      type: newVenueData.event_type.charAt(0).toUpperCase() + newVenueData.event_type.slice(1) + ' Venue', // sync type
      guest_count: parseInt(newVenueData.guest_count) || 200,
      minCapacity: 50,
      maxCapacity: parseInt(newVenueData.guest_count) || 200,
      priceTier: '₹₹₹',
      priceNum: 3,
      rating: 4.5,
      amenities: ['AC Hall', 'Parking'],
      description: newVenueData.name + ' located in ' + newVenueData.location,
      status: newVenueData.status || 'active',
      created_at: newVenueData.created_at || new Date().toISOString(),
      image: resolveImage(newVenueData.image, 'venue', newVenueData.name)
    };
    const updated = [newVenue, ...venuesList];
    setVenuesList(updated);
    localStorage.setItem('venues_data', JSON.stringify(updated));
    showToast(`New venue "${newVenue.name}" added successfully`, 'success');
    setIsAddVenueModalOpen(false);
  };

  // Vendor Management Actions
  const handleToggleVendorStatus = (vendorId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const updated = vendorsList.map(v => v.id === vendorId ? { ...v, status: nextStatus } : v);
    setVendorsList(updated);
    localStorage.setItem('vendors_data', JSON.stringify(updated));
    showToast(`Vendor status updated to ${nextStatus}`, 'success');
  };

  const handleDeleteVendor = (vendorId, name) => {
    if (!window.confirm(`Are you sure you want to delete vendor "${name}"?`)) {
      return;
    }
    const updated = vendorsList.filter(v => v.id !== vendorId);
    setVendorsList(updated);
    localStorage.setItem('vendors_data', JSON.stringify(updated));
    showToast(`Deleted vendor "${name}"`, 'success');
  };

  const handleSaveVendor = (e) => {
    e.preventDefault();
    if (editingVendor) {
      const updated = vendorsList.map(v => v.id === editingVendor.id ? { 
        ...editingVendor
      } : v);
      setVendorsList(updated);
      localStorage.setItem('vendors_data', JSON.stringify(updated));
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
      image: resolveImage(data.image, 'vendor', data.category)
    };
    const updated = [newVendor, ...vendorsList];
    setVendorsList(updated);
    localStorage.setItem('vendors_data', JSON.stringify(updated));
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

  // Filtered lists for Dashboard Tab
  const dashboardFilteredEvents = events.filter(e => {
    if (!e.date) return true;
    const eventDateStr = typeof e.date === 'string' && e.date.includes('T') ? e.date.split('T')[0] : e.date;
    if (dashboardStartDate && eventDateStr < dashboardStartDate) return false;
    if (dashboardEndDate && eventDateStr > dashboardEndDate) return false;
    return true;
  });

  const dashboardFilteredUsers = usersList.filter(u => {
    if (!u.created_at) return true;
    const userDateStr = typeof u.created_at === 'string' && u.created_at.includes('T') ? u.created_at.split('T')[0] : u.created_at;
    if (dashboardStartDate && userDateStr < dashboardStartDate) return false;
    if (dashboardEndDate && userDateStr > dashboardEndDate) return false;
    return true;
  });

  // Seeding high-fidelity values exactly matching the system database data
  const displayEvents = events.length;
  const displayUsers = usersList.length;
  const displayVenues = venuesList.length;
  const displayVendors = vendorsList.length;
  const totalConfirmedRevenue = events
    .filter(e => e.status === 'approved' || e.status === 'ongoing' || e.status === 'completed')
    .reduce((sum, e) => sum + parseFloat(e.budget || 0), 0);
  const displayRevenue = `₹ ${totalConfirmedRevenue.toLocaleString()}`;

  const confirmedEvents = events.filter(e => e.status === 'approved' || e.status === 'ongoing' || e.status === 'completed');
  const filteredConfirmedEvents = confirmedEvents.filter(e => {
    if (!e.date) return true;
    const eventDateStr = typeof e.date === 'string' && e.date.includes('T') ? e.date.split('T')[0] : e.date;
    if (revenueChartStartDate && eventDateStr < revenueChartStartDate) return false;
    if (revenueChartEndDate && eventDateStr > revenueChartEndDate) return false;
    return true;
  });
  const totalConfirmedRev = filteredConfirmedEvents.reduce((sum, e) => sum + parseFloat(e.budget || 0), 0);
  
  const revByType = filteredConfirmedEvents.reduce((acc, e) => {
    const type = (e.event_type || 'Other').toLowerCase();
    let group = 'other';
    if (type.includes('wed')) group = 'wedding';
    else if (type.includes('corp') || type.includes('seminar') || type.includes('meet')) group = 'corporate';
    else if (type.includes('party') || type.includes('birth')) group = 'party';
    else if (type.includes('conf')) group = 'conference';
    
    acc[group] = (acc[group] || 0) + parseFloat(e.budget || 0);
    return acc;
  }, {});

  const wedPct = totalConfirmedRev > 0 ? Math.round((revByType.wedding || 0) / totalConfirmedRev * 100) : 0;
  const corpPct = totalConfirmedRev > 0 ? Math.round((revByType.corporate || 0) / totalConfirmedRev * 100) : 0;
  const partyPct = totalConfirmedRev > 0 ? Math.round((revByType.party || 0) / totalConfirmedRev * 100) : 0;
  const confPct = totalConfirmedRev > 0 ? Math.round((revByType.conference || 0) / totalConfirmedRev * 100) : 0;
  const otherPct = totalConfirmedRev > 0 ? Math.max(0, 100 - wedPct - corpPct - partyPct - confPct) : 0;

  const circ = 440;
  const wedDashSize = (wedPct / 100) * circ;
  const corpDashSize = (corpPct / 100) * circ;
  const partyDashSize = (partyPct / 100) * circ;
  const confDashSize = (confPct / 100) * circ;
  const otherDashSize = (otherPct / 100) * circ;

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
      (u.name || '').toLowerCase().includes(query) ||
      (u.email || '').toLowerCase().includes(query) ||
      (u.phone && u.phone.includes(query));

    let matchesRole = true;
    if (userRoleFilter !== 'All') {
      matchesRole = (u.role || '').toLowerCase() === userRoleFilter.toLowerCase();
    }

    let matchesStatus = true;
    if (userStatusFilter !== 'All') {
      const mappedStatus = u.status === 'blocked' ? 'inactive' : 'active';
      matchesStatus = mappedStatus === userStatusFilter.toLowerCase();
    }

    let matchesDate = true;
    if (u.created_at) {
      const userDateStr = typeof u.created_at === 'string' && u.created_at.includes('T') ? u.created_at.split('T')[0] : u.created_at;
      if (userStartDate && userDateStr < userStartDate) matchesDate = false;
      if (userEndDate && userDateStr > userEndDate) matchesDate = false;
    } else if (userStartDate || userEndDate) {
      matchesDate = false;
    }

    return matchesSearch && matchesRole && matchesStatus && matchesDate;
  });

  const userTotalPages = Math.max(1, Math.ceil(filteredUsers.length / userPageSize));
  const userStartIndex = (userCurrentPage - 1) * userPageSize;
  const paginatedUsers = filteredUsers.slice(userStartIndex, userStartIndex + userPageSize);

  const userShowingFrom = filteredUsers.length === 0 ? 0 : userStartIndex + 1;
  const userShowingTo = Math.min(userStartIndex + userPageSize, filteredUsers.length);

  const dateFilteredUsers = usersList.filter(u => {
    if (!u.created_at) return true;
    const userDateStr = typeof u.created_at === 'string' && u.created_at.includes('T') ? u.created_at.split('T')[0] : u.created_at;
    if (userStartDate && userDateStr < userStartDate) return false;
    if (userEndDate && userDateStr > userEndDate) return false;
    return true;
  });

  const displayTotalUsersCount = dateFilteredUsers.length;
  const displayActiveUsersCount = dateFilteredUsers.filter(u => u.status !== 'blocked').length;
  const displayInactiveUsersCount = dateFilteredUsers.filter(u => u.status === 'blocked').length;
  const displayNewUsersCount = dateFilteredUsers.filter(u => {
    const d = new Date(u.created_at || Date.now());
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  // Filter venues based on search query, type, and status
  const filteredVenues = venuesList.filter(v => {
    const query = venueSearchQuery.toLowerCase();
    const matchesSearch = 
      (v.name || '').toLowerCase().includes(query) ||
      (v.location || '').toLowerCase().includes(query);

    let matchesStatus = true;
    if (venueStatusFilter !== 'All') {
      matchesStatus = (v.status || 'active').toLowerCase() === venueStatusFilter.toLowerCase();
    }

    let matchesType = true;
    if (venueTypeFilter !== 'All') {
      matchesType = (v.event_type || '').toLowerCase() === venueTypeFilter.toLowerCase();
    }

    let matchesDate = true;
    if (v.created_at) {
      const venueDateStr = typeof v.created_at === 'string' && v.created_at.includes('T') ? v.created_at.split('T')[0] : v.created_at;
      if (venueStartDate && venueDateStr < venueStartDate) matchesDate = false;
      if (venueEndDate && venueDateStr > venueEndDate) matchesDate = false;
    } else if (venueStartDate || venueEndDate) {
      matchesDate = false;
    }

    return matchesSearch && matchesStatus && matchesType && matchesDate;
  });

  const venueTotalPages = Math.max(1, Math.ceil(filteredVenues.length / venuePageSize));
  const venueStartIndex = (venueCurrentPage - 1) * venuePageSize;
  const paginatedVenues = filteredVenues.slice(venueStartIndex, venueStartIndex + venuePageSize);

  const venueShowingFrom = filteredVenues.length === 0 ? 0 : venueStartIndex + 1;
  const venueShowingTo = Math.min(venueStartIndex + venuePageSize, filteredVenues.length);

  const dateFilteredVenues = venuesList.filter(v => {
    if (!v.created_at) return true;
    const venueDateStr = typeof v.created_at === 'string' && v.created_at.includes('T') ? v.created_at.split('T')[0] : v.created_at;
    if (venueStartDate && venueDateStr < venueStartDate) return false;
    if (venueEndDate && venueDateStr > venueEndDate) return false;
    return true;
  });

  // Stats Counters calculated dynamically for Venues
  const displayTotalVenues = dateFilteredVenues.length;
  const displayActiveVenues = dateFilteredVenues.filter(v => v.status === 'active').length;
  const displayInactiveVenues = dateFilteredVenues.filter(v => v.status === 'inactive').length;
  const displayNewVenues = dateFilteredVenues.filter(v => {
    const d = new Date(v.created_at || Date.now());
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  // Filter vendors based on search query, category, and status
  const filteredVendors = vendorsList.filter(v => {
    const query = vendorSearchQuery.toLowerCase();
    const matchesSearch = 
      (v.name || '').toLowerCase().includes(query) ||
      (v.contact_person && v.contact_person.toLowerCase().includes(query)) ||
      (v.email && v.email.toLowerCase().includes(query)) ||
      (v.phone && v.phone.includes(query));

    let matchesStatus = true;
    if (vendorStatusFilter !== 'All') {
      matchesStatus = (v.status || '').toLowerCase() === vendorStatusFilter.toLowerCase();
    }

    let matchesCategory = true;
    if (vendorCategoryFilter !== 'All') {
      matchesCategory = (v.category || '').toLowerCase() === vendorCategoryFilter.toLowerCase();
    }

    let matchesDate = true;
    if (v.created_at) {
      const vendorDateStr = typeof v.created_at === 'string' && v.created_at.includes('T') ? v.created_at.split('T')[0] : v.created_at;
      if (vendorStartDate && vendorDateStr < vendorStartDate) matchesDate = false;
      if (vendorEndDate && vendorDateStr > vendorEndDate) matchesDate = false;
    } else if (vendorStartDate || vendorEndDate) {
      matchesDate = false;
    }

    return matchesSearch && matchesStatus && matchesCategory && matchesDate;
  });

  const vendorTotalPages = Math.max(1, Math.ceil(filteredVendors.length / vendorPageSize));
  const vendorStartIndex = (vendorCurrentPage - 1) * vendorPageSize;
  const paginatedVendors = filteredVendors.slice(vendorStartIndex, vendorStartIndex + vendorPageSize);

  const vendorShowingFrom = filteredVendors.length === 0 ? 0 : vendorStartIndex + 1;
  const vendorShowingTo = Math.min(vendorStartIndex + vendorPageSize, filteredVendors.length);

  const dateFilteredVendors = vendorsList.filter(v => {
    if (!v.created_at) return true;
    const vendorDateStr = typeof v.created_at === 'string' && v.created_at.includes('T') ? v.created_at.split('T')[0] : v.created_at;
    if (vendorStartDate && vendorDateStr < vendorStartDate) return false;
    if (vendorEndDate && vendorDateStr > vendorEndDate) return false;
    return true;
  });

  // Stats Counters calculated dynamically for Vendors
  const displayTotalVendorsCount = dateFilteredVendors.length;
  const displayActiveVendorsCount = dateFilteredVendors.filter(v => v.status === 'active').length;
  const displayInactiveVendorsCount = dateFilteredVendors.filter(v => v.status === 'inactive').length;
  const displayNewVendorsCount = dateFilteredVendors.filter(v => {
    const d = new Date(v.created_at || Date.now());
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  // Filter bookings based on active search queries and tab selections
  const filteredBookings = events.filter(e => {
    const query = bookingSearchQuery.toLowerCase();
    
    // Find client name for the event from usersList
    const client = usersList.find(u => u.id === e.user_id);
    const clientName = client ? (client.name || '').toLowerCase() : 'system user';
    
    const matchesSearch = 
      (e.title || '').toLowerCase().includes(query) ||
      clientName.includes(query) ||
      (e.location || '').toLowerCase().includes(query) ||
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
      matchesEvent = (e.event_type || '').toLowerCase() === bookingEventFilter.toLowerCase();
    }

    let matchesDate = true;
    if (bookingStartDate || bookingEndDate) {
      const eventDateStr = typeof e.date === 'string' && e.date.includes('T') ? e.date.split('T')[0] : e.date;
      
      const eventDateObj = new Date(e.date);
      const bookingDateObj = e.created_at ? new Date(e.created_at) : new Date(eventDateObj.getTime() - 44 * 24 * 60 * 60 * 1000);
      const bookingDateStr = bookingDateObj.toISOString().split('T')[0];

      let matchesBookingDate = true;
      let matchesEventDate = true;

      if (bookingStartDate) {
        if (bookingDateStr < bookingStartDate) matchesBookingDate = false;
        if (eventDateStr < bookingStartDate) matchesEventDate = false;
      }
      if (bookingEndDate) {
        if (bookingDateStr > bookingEndDate) matchesBookingDate = false;
        if (eventDateStr > bookingEndDate) matchesEventDate = false;
      }
      
      matchesDate = matchesBookingDate || matchesEventDate;
    }

    return matchesSearch && matchesStatus && matchesEvent && matchesDate;
  });

  // Pagination bounds calculations for Bookings
  const bookingTotalPages = Math.max(1, Math.ceil(filteredBookings.length / bookingPageSize));
  const bookingStartIndex = (bookingCurrentPage - 1) * bookingPageSize;
  const paginatedBookings = filteredBookings.slice(bookingStartIndex, bookingStartIndex + bookingPageSize);

  const bookingShowingFrom = filteredBookings.length === 0 ? 0 : bookingStartIndex + 1;
  const bookingShowingTo = Math.min(bookingStartIndex + bookingPageSize, filteredBookings.length);

  const dateFilteredBookings = events.filter(e => {
    if (bookingStartDate || bookingEndDate) {
      const eventDateStr = typeof e.date === 'string' && e.date.includes('T') ? e.date.split('T')[0] : e.date;
      
      const eventDateObj = new Date(e.date);
      const bookingDateObj = e.created_at ? new Date(e.created_at) : new Date(eventDateObj.getTime() - 44 * 24 * 60 * 60 * 1000);
      const bookingDateStr = bookingDateObj.toISOString().split('T')[0];

      let matchesBookingDate = true;
      let matchesEventDate = true;

      if (bookingStartDate) {
        if (bookingDateStr < bookingStartDate) matchesBookingDate = false;
        if (eventDateStr < bookingStartDate) matchesEventDate = false;
      }
      if (bookingEndDate) {
        if (bookingDateStr > bookingEndDate) matchesBookingDate = false;
        if (eventDateStr > bookingEndDate) matchesEventDate = false;
      }
      
      return matchesBookingDate || matchesEventDate;
    }
    return true;
  });

  // Stats Counters calculated dynamically for Bookings
  const displayTotalBookings = dateFilteredBookings.length;
  const displayConfirmedBookings = dateFilteredBookings.filter(e => e.status === 'approved' || e.status === 'ongoing' || e.status === 'completed').length;
  const displayPendingBookings = dateFilteredBookings.filter(e => e.status === 'pending' || e.status === 'planning').length;
  const displayCancelledBookings = dateFilteredBookings.filter(e => e.status === 'cancelled').length;

  const confirmedPercent = displayTotalBookings > 0 ? ((displayConfirmedBookings / displayTotalBookings) * 100).toFixed(2) : '0.00';
  const pendingPercent = displayTotalBookings > 0 ? ((displayPendingBookings / displayTotalBookings) * 100).toFixed(2) : '0.00';
  const cancelledPercent = displayTotalBookings > 0 ? ((displayCancelledBookings / displayTotalBookings) * 100).toFixed(2) : '0.00';

  // Calculations for Reports tab
  const reportsFilteredEvents = events.filter(e => {
    let matchesEvent = true;
    if (reportEventFilter !== 'All') {
      matchesEvent = (e.event_type || '').toLowerCase() === reportEventFilter.toLowerCase();
    }
    
    let matchesVenue = true;
    if (reportVenueFilter !== 'All') {
      matchesVenue = (e.location || '').toLowerCase().includes(reportVenueFilter.toLowerCase());
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
      image: resolveImage(e.image, 'event', e.event_type),
      bookingsCount: Math.max(1, Math.round(e.guest_count / 10))
    }));

  // Top 5 Venues by bookings
  const reportsTopVenues = [...venuesList]
    .map(v => ({
      name: v.name,
      image: resolveImage(v.image, 'venue', v.name),
      bookingsCount: venueBookingsMap[v.id] || 0
    }))
    .sort((a, b) => b.bookingsCount - a.bookingsCount)
    .slice(0, 5);

  // Top 5 Vendors by bookings
  const reportsTopVendors = [...vendorsList]
    .map(v => ({
      name: v.name,
      image: resolveImage(v.image, 'vendor', v.category),
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
      (e.title || '').toLowerCase().includes(query) ||
      (e.event_type || '').toLowerCase().includes(query) ||
      (e.location || '').toLowerCase().includes(query);

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
      matchesType = (e.event_type || '').toLowerCase() === eventTypeFilter.toLowerCase();
    }

    // Date filter match
    let matchesDate = true;
    if (e.date) {
      const eventDateStr = typeof e.date === 'string' && e.date.includes('T') ? e.date.split('T')[0] : e.date;
      if (eventStartDate && eventDateStr < eventStartDate) matchesDate = false;
      if (eventEndDate && eventDateStr > eventEndDate) matchesDate = false;
    } else if (eventStartDate || eventEndDate) {
      matchesDate = false;
    }

    return matchesSearch && matchesStatus && matchesType && matchesDate;
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
      matchesRating = (f.rating || '').toString() === feedbackRatingFilter.replace(' Stars', '').replace(' Star', '');
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

  const getChartData = () => {
    let start, end;
    if (!eventsChartStartDate || !eventsChartEndDate) {
      if (events && events.length > 0) {
        const dates = events.map(e => new Date(e.date)).filter(d => !isNaN(d.getTime()));
        if (dates.length > 0) {
          start = new Date(Math.min(...dates));
          end = new Date(Math.max(...dates));
          if (start.getTime() === end.getTime()) {
            start = new Date(start.getTime() - 3 * 24 * 60 * 60 * 1000);
            end = new Date(end.getTime() + 3 * 24 * 60 * 60 * 1000);
          }
        } else {
          end = new Date();
          start = new Date();
          start.setDate(end.getDate() - 30);
        }
      } else {
        end = new Date();
        start = new Date();
        start.setDate(end.getDate() - 30);
      }
    } else {
      start = new Date(eventsChartStartDate);
      end = new Date(eventsChartEndDate);
    }
    
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    
    const diffTime = end - start;
    
    // Generate 7 points
    const points = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 0; i < 7; i++) {
      let ptDate;
      if (diffTime <= 0) {
        ptDate = new Date(start);
      } else {
        ptDate = new Date(start.getTime() + (diffTime / 6) * i);
      }
      
      const windowStart = new Date(ptDate);
      windowStart.setHours(0, 0, 0, 0);
      const windowEnd = new Date(ptDate);
      windowEnd.setHours(23, 59, 59, 999);
      
      const count = events.filter(e => {
        if (!e.date) return false;
        const eDate = new Date(e.date);
        return eDate >= windowStart && eDate <= windowEnd;
      }).length;
      
      points.push({
        label: `${ptDate.getDate()} ${months[ptDate.getMonth()]}`,
        count: count
      });
    }
    
    const counts = points.map(p => p.count);
    const maxVal = Math.max(...counts, 1);
    
    // Map to coordinates: x from 0 to 500, y from 40 to 160 (height 200)
    const coords = points.map((p, idx) => {
      const x = (500 / 6) * idx;
      const height = 120; // safe height to avoid overflow inside svg
      const y = 160 - (p.count / maxVal) * height;
      return { x, y, count: p.count, label: p.label };
    });
    
    return coords;
  };

  const chartCoords = getChartData();
  const chartAreaPath = `M 0 ${chartCoords[0].y} ` + chartCoords.map(c => `L ${c.x} ${c.y}`).join(' ') + ` L 500 200 L 0 200 Z`;
  const chartLinePath = `M 0 ${chartCoords[0].y} ` + chartCoords.map(c => `L ${c.x} ${c.y}`).join(' ');

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
            Admin Panel
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
            <div className="relative" ref={dashboardDatePickerRef}>
              <button
                type="button"
                onClick={() => setIsDashboardDatePickerOpen(!isDashboardDatePickerOpen)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all hover:opacity-90 ${
                  isLight ? 'bg-white border-gray-200 text-gray-700 shadow-sm' : 'bg-white/5 border-white/5 text-gray-300'
                }`}
              >
                <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>{dashboardStartDate && dashboardEndDate ? `${formatEventDate(dashboardStartDate)} - ${formatEventDate(dashboardEndDate)}` : 'Select Date Range'}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isDashboardDatePickerOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDashboardDatePickerOpen && (
                <div className={`absolute right-0 top-11 w-72 border rounded-2xl shadow-2xl p-4 z-50 animate-scale-up flex flex-col gap-3 text-left ${
                  isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0f111a] border-white/10 text-gray-200'
                }`}>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>Select Date Range</span>
                  
                  {/* Preset ranges buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const end = new Date();
                        const start = new Date();
                        start.setDate(end.getDate() - 7);
                        setDashboardStartDate(start.toISOString().split('T')[0]);
                        setDashboardEndDate(end.toISOString().split('T')[0]);
                        setEventsChartRangeLabel('This Week');
                        setRevenueChartRangeLabel('This Week');
                        setIsDashboardDatePickerOpen(false);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-center border transition-all cursor-pointer ${
                        isLight ? 'border-gray-200 hover:bg-gray-50 text-gray-700' : 'border-white/5 hover:bg-white/5 text-gray-300'
                      }`}
                    >
                      Last 7 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const end = new Date();
                        const start = new Date();
                        start.setDate(end.getDate() - 30);
                        setDashboardStartDate(start.toISOString().split('T')[0]);
                        setDashboardEndDate(end.toISOString().split('T')[0]);
                        setEventsChartRangeLabel('Last 30 Days');
                        setRevenueChartRangeLabel('Last 30 Days');
                        setIsDashboardDatePickerOpen(false);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-center border transition-all cursor-pointer ${
                        isLight ? 'border-gray-200 hover:bg-gray-50 text-gray-700' : 'border-white/5 hover:bg-white/5 text-gray-300'
                      }`}
                    >
                      Last 30 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const now = new Date();
                        const start = new Date(now.getFullYear(), now.getMonth(), 1);
                        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                        setDashboardStartDate(start.toISOString().split('T')[0]);
                        setDashboardEndDate(end.toISOString().split('T')[0]);
                        setEventsChartRangeLabel('This Month');
                        setRevenueChartRangeLabel('This Month');
                        setIsDashboardDatePickerOpen(false);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-center border transition-all cursor-pointer ${
                        isLight ? 'border-gray-200 hover:bg-gray-50 text-gray-700' : 'border-white/5 hover:bg-white/5 text-gray-300'
                      }`}
                    >
                      This Month
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDashboardStartDate('');
                        setDashboardEndDate('');
                        setEventsChartRangeLabel('All Time');
                        setRevenueChartRangeLabel('All Time');
                        setIsDashboardDatePickerOpen(false);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-center border transition-all cursor-pointer ${
                        isLight ? 'border-gray-200 hover:bg-gray-50 text-gray-700' : 'border-white/5 hover:bg-white/5 text-gray-300'
                      }`}
                    >
                      Clear Range
                    </button>
                  </div>

                  <div className={`border-t my-1 ${isLight ? 'border-gray-100' : 'border-white/5'}`} />

                  {/* Custom date range inputs */}
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-1">
                      <label className={`text-[9px] font-bold uppercase ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>Start Date</label>
                      <input
                        type="date"
                        value={dashboardStartDate}
                        onChange={e => setDashboardStartDate(e.target.value)}
                        className={`border rounded-xl text-xs py-2 px-3 focus:outline-none focus:border-indigo-500 font-semibold w-full ${
                          isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                        }`}
                        style={{ colorScheme: isLight ? 'light' : 'dark' }}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className={`text-[9px] font-bold uppercase ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>End Date</label>
                      <input
                        type="date"
                        value={dashboardEndDate}
                        onChange={e => setDashboardEndDate(e.target.value)}
                        className={`border rounded-xl text-xs py-2 px-3 focus:outline-none focus:border-indigo-500 font-semibold w-full ${
                          isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                        }`}
                        style={{ colorScheme: isLight ? 'light' : 'dark' }}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEventsChartRangeLabel('Custom');
                      setRevenueChartRangeLabel('Custom');
                      setIsDashboardDatePickerOpen(false);
                    }}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2 px-4 rounded-xl transition-all cursor-pointer text-center font-semibold"
                  >
                    Apply Range
                  </button>
                </div>
              )}
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
                <div className="relative" ref={eventsChartDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsEventsChartDropdownOpen(!isEventsChartDropdownOpen)}
                    className={`flex items-center gap-1 text-[10px] font-bold border px-2.5 py-1.5 rounded-lg cursor-pointer transition-all hover:opacity-90 ${
                      isLight ? 'border-gray-200 bg-gray-50 text-gray-700' : 'border-white/5 bg-white/5 text-gray-300'
                    }`}
                  >
                    <span>{eventsChartRangeLabel}</span>
                    <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isEventsChartDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isEventsChartDropdownOpen && (
                    <div className={`absolute right-0 top-9 w-40 border rounded-xl shadow-2xl p-2 z-40 animate-scale-up flex flex-col gap-1 text-left ${
                      isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0f111a] border-white/10 text-gray-200'
                    }`}>
                      <button
                        type="button"
                        onClick={() => {
                          setEventsChartStartDate('');
                          setEventsChartEndDate('');
                          setEventsChartRangeLabel('All Time');
                          setIsEventsChartDropdownOpen(false);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold text-left hover:bg-indigo-500/10 hover:text-indigo-400 transition-all cursor-pointer ${
                          isLight ? 'text-gray-700' : 'text-gray-200'
                        }`}
                      >
                        All Time
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const end = new Date();
                          const start = new Date();
                          start.setDate(end.getDate() - 7);
                          setEventsChartStartDate(start.toISOString().split('T')[0]);
                          setEventsChartEndDate(end.toISOString().split('T')[0]);
                          setEventsChartRangeLabel('This Week');
                          setIsEventsChartDropdownOpen(false);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold text-left hover:bg-indigo-500/10 hover:text-indigo-400 transition-all cursor-pointer ${
                          isLight ? 'text-gray-700' : 'text-gray-200'
                        }`}
                      >
                        This Week
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const end = new Date();
                          const start = new Date();
                          start.setDate(end.getDate() - 30);
                          setEventsChartStartDate(start.toISOString().split('T')[0]);
                          setEventsChartEndDate(end.toISOString().split('T')[0]);
                          setEventsChartRangeLabel('Last 30 Days');
                          setIsEventsChartDropdownOpen(false);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold text-left hover:bg-indigo-500/10 hover:text-indigo-400 transition-all cursor-pointer ${
                          isLight ? 'text-gray-700' : 'text-gray-200'
                        }`}
                      >
                        Last 30 Days
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const now = new Date();
                          const start = new Date(now.getFullYear(), now.getMonth(), 1);
                          const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                          setEventsChartStartDate(start.toISOString().split('T')[0]);
                          setEventsChartEndDate(end.toISOString().split('T')[0]);
                          setEventsChartRangeLabel('This Month');
                          setIsEventsChartDropdownOpen(false);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold text-left hover:bg-indigo-500/10 hover:text-indigo-400 transition-all cursor-pointer ${
                          isLight ? 'text-gray-700' : 'text-gray-200'
                        }`}
                      >
                        This Month
                      </button>
                    </div>
                  )}
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
                  <path d={chartAreaPath} fill="url(#chart-glow)" />

                  {/* Smooth line */}
                  <path d={chartLinePath} fill="none" stroke="#8b5cf6" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

                  {/* Daily Circles and Value Labels */}
                  {chartCoords.map((c, idx) => (
                    <g key={idx}>
                      <circle cx={c.x} cy={c.y} r="5" fill="#8b5cf6" stroke={isLight ? "#fff" : "#0d1117"} strokeWidth="1.5" />
                      <text
                        x={c.x}
                        y={c.y - 10}
                        textAnchor="middle"
                        className={`text-[9px] font-extrabold ${isLight ? 'fill-gray-700' : 'fill-gray-300'}`}
                      >
                        {c.count}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>

              {/* Chart Dates Legend */}
              <div className="flex justify-between items-center text-[9px] font-bold text-gray-500 uppercase px-1">
                {chartCoords.map((c, idx) => (
                  <span key={idx}>{c.label}</span>
                ))}
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
                <div className="relative" ref={revenueChartDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsRevenueChartDropdownOpen(!isRevenueChartDropdownOpen)}
                    className={`flex items-center gap-1 text-[10px] font-bold border px-2.5 py-1.5 rounded-lg cursor-pointer transition-all hover:opacity-90 ${
                      isLight ? 'border-gray-200 bg-gray-50 text-gray-700' : 'border-white/5 bg-white/5 text-gray-300'
                    }`}
                  >
                    <span>{revenueChartRangeLabel}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isRevenueChartDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isRevenueChartDropdownOpen && (
                    <div className={`absolute right-0 top-8 w-40 border rounded-xl shadow-2xl p-2 z-40 animate-scale-up flex flex-col gap-1 text-left ${
                      isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0f111a] border-white/10 text-gray-200'
                    }`}>
                      <button
                        type="button"
                        onClick={() => {
                          setRevenueChartStartDate('');
                          setRevenueChartEndDate('');
                          setRevenueChartRangeLabel('All Time');
                          setIsRevenueChartDropdownOpen(false);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold text-left hover:bg-indigo-500/10 hover:text-indigo-400 transition-all cursor-pointer ${
                          isLight ? 'text-gray-700' : 'text-gray-200'
                        }`}
                      >
                        All Time
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const now = new Date();
                          const start = new Date(now.getFullYear(), now.getMonth(), 1);
                          const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                          setRevenueChartStartDate(start.toISOString().split('T')[0]);
                          setRevenueChartEndDate(end.toISOString().split('T')[0]);
                          setRevenueChartRangeLabel('This Month');
                          setIsRevenueChartDropdownOpen(false);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold text-left hover:bg-indigo-500/10 hover:text-indigo-400 transition-all cursor-pointer ${
                          isLight ? 'text-gray-700' : 'text-gray-200'
                        }`}
                      >
                        This Month
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const end = new Date();
                          const start = new Date();
                          start.setDate(end.getDate() - 7);
                          setRevenueChartStartDate(start.toISOString().split('T')[0]);
                          setRevenueChartEndDate(end.toISOString().split('T')[0]);
                          setRevenueChartRangeLabel('This Week');
                          setIsRevenueChartDropdownOpen(false);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold text-left hover:bg-indigo-500/10 hover:text-indigo-400 transition-all cursor-pointer ${
                          isLight ? 'text-gray-700' : 'text-gray-200'
                        }`}
                      >
                        This Week
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const end = new Date();
                          const start = new Date();
                          start.setDate(end.getDate() - 30);
                          setRevenueChartStartDate(start.toISOString().split('T')[0]);
                          setRevenueChartEndDate(end.toISOString().split('T')[0]);
                          setRevenueChartRangeLabel('Last 30 Days');
                          setIsRevenueChartDropdownOpen(false);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold text-left hover:bg-indigo-500/10 hover:text-indigo-400 transition-all cursor-pointer ${
                          isLight ? 'text-gray-700' : 'text-gray-200'
                        }`}
                      >
                        Last 30 Days
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Donut graphic & middle text */}
              <div className="flex-1 flex flex-col items-center justify-center gap-4 py-2">
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible transform rotate-[-90deg]">
                    {/* Weddings */}
                    {wedPct > 0 && (
                      <circle cx="100" cy="100" r="70" fill="transparent" stroke="#8b5cf6" strokeWidth="18" strokeDasharray={`${wedDashSize} ${circ - wedDashSize}`} strokeDashoffset={0} strokeLinecap="round" />
                    )}
                    {/* Corporate */}
                    {corpPct > 0 && (
                      <circle cx="100" cy="100" r="70" fill="transparent" stroke="#3b82f6" strokeWidth="18" strokeDasharray={`${corpDashSize} ${circ - corpDashSize}`} strokeDashoffset={-wedDashSize} strokeLinecap="round" />
                    )}
                    {/* Parties */}
                    {partyPct > 0 && (
                      <circle cx="100" cy="100" r="70" fill="transparent" stroke="#10b981" strokeWidth="18" strokeDasharray={`${partyDashSize} ${circ - partyDashSize}`} strokeDashoffset={-(wedDashSize + corpDashSize)} strokeLinecap="round" />
                    )}
                    {/* Conferences */}
                    {confPct > 0 && (
                      <circle cx="100" cy="100" r="70" fill="transparent" stroke="#f59e0b" strokeWidth="18" strokeDasharray={`${confDashSize} ${circ - confDashSize}`} strokeDashoffset={-(wedDashSize + corpDashSize + partyDashSize)} strokeLinecap="round" />
                    )}
                    {/* Others */}
                    {otherPct > 0 && (
                      <circle cx="100" cy="100" r="70" fill="transparent" stroke="#6b7280" strokeWidth="18" strokeDasharray={`${otherDashSize} ${circ - otherDashSize}`} strokeDashoffset={-(wedDashSize + corpDashSize + partyDashSize + confDashSize)} strokeLinecap="round" />
                    )}
                    {totalConfirmedRev === 0 && (
                      <circle cx="100" cy="100" r="70" fill="transparent" stroke={isLight ? "#e5e7eb" : "#374151"} strokeWidth="18" />
                    )}
                  </svg>
                  
                  {/* Absolute Center Content */}
                  <div className="absolute flex flex-col items-center text-center leading-none">
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>Total Revenue</span>
                    <span className={`text-sm font-extrabold mt-1.5 font-outfit ${isLight ? 'text-gray-900' : 'text-white'}`}>₹ {totalConfirmedRev.toLocaleString()}</span>
                  </div>
                </div>

                {/* Donut Legend */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 w-full text-[10px] font-bold px-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-[#8b5cf6] shrink-0"></span>
                    <span className={`${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Weddings: {wedPct}%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-[#3b82f6] shrink-0"></span>
                    <span className={`${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Corp: {corpPct}%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-[#10b981] shrink-0"></span>
                    <span className={`${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Parties: {partyPct}%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-[#f59e0b] shrink-0"></span>
                    <span className={`${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Conf: {confPct}%</span>
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
            <div className="relative w-full sm:w-auto" ref={eventDatePickerRef}>
              <button
                type="button"
                onClick={() => setIsEventDatePickerOpen(!isEventDatePickerOpen)}
                className={`flex items-center gap-2 px-3.5 py-3 rounded-xl border text-xs font-semibold cursor-pointer w-full sm:w-auto justify-center transition-all hover:opacity-90 ${
                  isLight ? 'bg-white border-gray-200 text-gray-700 shadow-sm' : 'bg-white/5 border-white/5 text-gray-300'
                }`}
              >
                <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>
                  {eventStartDate || eventEndDate
                    ? `${eventStartDate ? formatEventDate(eventStartDate) : '...'} - ${eventEndDate ? formatEventDate(eventEndDate) : '...'}`
                    : 'Select Date Range'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isEventDatePickerOpen ? 'rotate-180' : ''}`} />
              </button>

              {isEventDatePickerOpen && (
                <div className={`absolute right-0 top-13 w-72 border rounded-2xl shadow-2xl p-4 z-50 animate-scale-up flex flex-col gap-3 text-left ${
                  isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0f111a] border-white/10 text-gray-200'
                }`}>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>Select Event Date Range</span>
                  
                  {/* Preset ranges buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const end = new Date();
                        const start = new Date();
                        start.setDate(end.getDate() - 7);
                        setEventStartDate(start.toISOString().split('T')[0]);
                        setEventEndDate(end.toISOString().split('T')[0]);
                        setIsEventDatePickerOpen(false);
                        setEventCurrentPage(1);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-center border transition-all cursor-pointer ${
                        isLight ? 'border-gray-200 hover:bg-gray-50 text-gray-700' : 'border-white/5 hover:bg-white/5 text-gray-300'
                      }`}
                    >
                      Last 7 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const end = new Date();
                        const start = new Date();
                        start.setDate(end.getDate() - 30);
                        setEventStartDate(start.toISOString().split('T')[0]);
                        setEventEndDate(end.toISOString().split('T')[0]);
                        setIsEventDatePickerOpen(false);
                        setEventCurrentPage(1);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-center border transition-all cursor-pointer ${
                        isLight ? 'border-gray-200 hover:bg-gray-50 text-gray-700' : 'border-white/5 hover:bg-white/5 text-gray-300'
                      }`}
                    >
                      Last 30 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const now = new Date();
                        const start = new Date(now.getFullYear(), now.getMonth(), 1);
                        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                        setEventStartDate(start.toISOString().split('T')[0]);
                        setEventEndDate(end.toISOString().split('T')[0]);
                        setIsEventDatePickerOpen(false);
                        setEventCurrentPage(1);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-center border transition-all cursor-pointer ${
                        isLight ? 'border-gray-200 hover:bg-gray-50 text-gray-700' : 'border-white/5 hover:bg-white/5 text-gray-300'
                      }`}
                    >
                      This Month
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEventStartDate('');
                        setEventEndDate('');
                        setIsEventDatePickerOpen(false);
                        setEventCurrentPage(1);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-center border transition-all cursor-pointer ${
                        isLight ? 'border-gray-200 hover:bg-gray-50 text-gray-700' : 'border-white/5 hover:bg-white/5 text-gray-300'
                      }`}
                    >
                      Clear Range
                    </button>
                  </div>

                  <div className={`border-t my-1 ${isLight ? 'border-gray-100' : 'border-white/5'}`} />

                  {/* Custom date range inputs */}
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-1">
                      <label className={`text-[9px] font-bold uppercase ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>Start Date</label>
                      <input
                        type="date"
                        value={eventStartDate}
                        onChange={e => {
                          setEventStartDate(e.target.value);
                          setEventCurrentPage(1);
                        }}
                        className={`border rounded-xl text-xs py-2 px-3 focus:outline-none focus:border-indigo-500 font-semibold w-full ${
                          isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                        }`}
                        style={{ colorScheme: isLight ? 'light' : 'dark' }}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className={`text-[9px] font-bold uppercase ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>End Date</label>
                      <input
                        type="date"
                        value={eventEndDate}
                        onChange={e => {
                          setEventEndDate(e.target.value);
                          setEventCurrentPage(1);
                        }}
                        className={`border rounded-xl text-xs py-2 px-3 focus:outline-none focus:border-indigo-500 font-semibold w-full ${
                          isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                        }`}
                        style={{ colorScheme: isLight ? 'light' : 'dark' }}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsEventDatePickerOpen(false)}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2 px-4 rounded-xl transition-all cursor-pointer text-center font-semibold"
                  >
                    Apply & Close
                  </button>
                </div>
              )}
            </div>
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
                    const formattedTime = formatEventTime(e.time || e.date);

                    // Event Type badge class
                    const getEventTypeStyle = (type) => {
                      const t = (type || '').toLowerCase();
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
                              <img src={resolveImage(e.image, 'event', e.event_type)} alt={e.title} className="w-full h-full object-cover" />
                            </div>
                            <span className={`font-bold truncate text-left ${isLight ? 'text-gray-900' : 'text-white'}`}>{e.title}</span>
                          </div>
                        </td>

                        {/* Event Type Badge */}
                        <td className="py-4 px-4">
                          <span className={`text-[11px] font-bold px-3 py-1 rounded-lg ${getEventTypeStyle(e.event_type)}`}>
                            {(e.event_type || 'Other').charAt(0).toUpperCase() + (e.event_type || 'Other').slice(1)}
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
                          <div className="flex items-center justify-end gap-2 relative">
                            <button
                              onClick={() => setViewingEventDetails(e)}
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
                            <button
                              onClick={() => setActiveEventMenuId(activeEventMenuId === e.id ? null : e.id)}
                              className={`p-1.5 rounded-lg border cursor-pointer ${
                                isLight ? 'border-gray-200 hover:bg-gray-50 text-gray-700' : 'border-white/10 hover:bg-white/5 text-gray-400'
                              }`}
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>

                            {/* Dropdown Options popover menu */}
                            {activeEventMenuId === e.id && (
                              <div className="absolute right-0 top-10 w-44 glass-panel border rounded-xl shadow-2xl p-2 z-50 animate-scale-up flex flex-col text-left">
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider px-2 py-1">Moderate Event</span>
                                
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleUpdateEventStatus(e.id, 'approved');
                                    setActiveEventMenuId(null);
                                  }}
                                  className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold text-gray-300 hover:bg-white/5 hover:text-white transition-all cursor-pointer"
                                >
                                  ✔️ Approve Event
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    handleUpdateEventStatus(e.id, 'pending');
                                    setActiveEventMenuId(null);
                                  }}
                                  className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold text-gray-300 hover:bg-white/5 hover:text-white transition-all cursor-pointer"
                                >
                                  ⏳ Mark as Pending
                                </button>

                                <div className="border-t border-white/5 my-1" />
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleUpdateEventStatus(e.id, 'cancelled');
                                    setActiveEventMenuId(null);
                                  }}
                                  className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold text-rose-450 hover:bg-rose-500/10 hover:text-rose-400 transition-all cursor-pointer"
                                >
                                  ❌ Cancel Event
                                </button>

                                <div className="border-t border-white/5 my-1" />
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleDeleteEvent(e.id, e.title);
                                    setActiveEventMenuId(null);
                                  }}
                                  className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold text-rose-450 hover:bg-rose-500/10 hover:text-rose-400 transition-all cursor-pointer"
                                >
                                  🗑️ Delete Event
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
            </div>
            
            <button
              onClick={() => setIsAddUserModalOpen(true)}
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
            <div className="relative w-full sm:w-auto" ref={userDataPickerRef}>
              <button
                type="button"
                onClick={() => setIsUserDatePickerOpen(!isUserDatePickerOpen)}
                className={`flex items-center gap-2 px-3.5 py-3 rounded-xl border text-xs font-semibold cursor-pointer w-full sm:w-auto justify-center transition-all hover:opacity-90 ${
                  isLight ? 'bg-white border-gray-200 text-gray-700 shadow-sm' : 'bg-white/5 border-white/5 text-gray-300'
                }`}
              >
                <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>
                  {userStartDate || userEndDate
                    ? `${userStartDate ? formatEventDate(userStartDate) : '...'} - ${userEndDate ? formatEventDate(userEndDate) : '...'}`
                    : 'Select Date Range'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isUserDatePickerOpen ? 'rotate-180' : ''}`} />
              </button>

              {isUserDatePickerOpen && (
                <div className={`absolute right-0 top-13 w-72 border rounded-2xl shadow-2xl p-4 z-50 animate-scale-up flex flex-col gap-3 text-left ${
                  isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0f111a] border-white/10 text-gray-200'
                }`}>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>Select User Date Range</span>
                  
                  {/* Preset ranges buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const end = new Date();
                        const start = new Date();
                        start.setDate(end.getDate() - 7);
                        setUserStartDate(start.toISOString().split('T')[0]);
                        setUserEndDate(end.toISOString().split('T')[0]);
                        setIsUserDatePickerOpen(false);
                        setUserCurrentPage(1);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-center border transition-all cursor-pointer ${
                        isLight ? 'border-gray-200 hover:bg-gray-50 text-gray-700' : 'border-white/5 hover:bg-white/5 text-gray-300'
                      }`}
                    >
                      Last 7 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const end = new Date();
                        const start = new Date();
                        start.setDate(end.getDate() - 30);
                        setUserStartDate(start.toISOString().split('T')[0]);
                        setUserEndDate(end.toISOString().split('T')[0]);
                        setIsUserDatePickerOpen(false);
                        setUserCurrentPage(1);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-center border transition-all cursor-pointer ${
                        isLight ? 'border-gray-200 hover:bg-gray-50 text-gray-700' : 'border-white/5 hover:bg-white/5 text-gray-300'
                      }`}
                    >
                      Last 30 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const now = new Date();
                        const start = new Date(now.getFullYear(), now.getMonth(), 1);
                        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                        setUserStartDate(start.toISOString().split('T')[0]);
                        setUserEndDate(end.toISOString().split('T')[0]);
                        setIsUserDatePickerOpen(false);
                        setUserCurrentPage(1);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-center border transition-all cursor-pointer ${
                        isLight ? 'border-gray-200 hover:bg-gray-50 text-gray-700' : 'border-white/5 hover:bg-white/5 text-gray-300'
                      }`}
                    >
                      This Month
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUserStartDate('');
                        setUserEndDate('');
                        setIsUserDatePickerOpen(false);
                        setUserCurrentPage(1);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-center border transition-all cursor-pointer ${
                        isLight ? 'border-gray-200 hover:bg-gray-50 text-gray-700' : 'border-white/5 hover:bg-white/5 text-gray-300'
                      }`}
                    >
                      Clear Range
                    </button>
                  </div>

                  <div className={`border-t my-1 ${isLight ? 'border-gray-100' : 'border-white/5'}`} />

                  {/* Custom date range inputs */}
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-1">
                      <label className={`text-[9px] font-bold uppercase ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>Start Date</label>
                      <input
                        type="date"
                        value={userStartDate}
                        onChange={e => {
                          setUserStartDate(e.target.value);
                          setUserCurrentPage(1);
                        }}
                        className={`border rounded-xl text-xs py-2 px-3 focus:outline-none focus:border-indigo-500 font-semibold w-full ${
                          isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                        }`}
                        style={{ colorScheme: isLight ? 'light' : 'dark' }}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className={`text-[9px] font-bold uppercase ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>End Date</label>
                      <input
                        type="date"
                        value={userEndDate}
                        onChange={e => {
                          setUserEndDate(e.target.value);
                          setUserCurrentPage(1);
                        }}
                        className={`border rounded-xl text-xs py-2 px-3 focus:outline-none focus:border-indigo-500 font-semibold w-full ${
                          isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                        }`}
                        style={{ colorScheme: isLight ? 'light' : 'dark' }}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsUserDatePickerOpen(false)}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2 px-4 rounded-xl transition-all cursor-pointer text-center font-semibold"
                  >
                    Apply Range
                  </button>
                </div>
              )}
            </div>
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

                    const roleColor = (u.role || '').toLowerCase() === 'admin'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                      : (u.role || '').toLowerCase() === 'vendor'
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
                            {u.avatar ? (
                              <img
                                src={u.avatar}
                                alt={u.name}
                                className="w-8 h-8 rounded-full object-cover shrink-0 border border-white/10"
                              />
                            ) : (
                              <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 ${initialsColorClass}`}>
                                {initials}
                              </div>
                            )}
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
                        <td className="py-4 px-4 text-left font-medium">{u.phone || '-'}</td>

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
                              onClick={() => setViewingUserProfile(u)}
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
            </div>
            
            <button
              onClick={() => {
                setNewVenueData({
                  name: '',
                  location: '',
                  event_type: 'hotel',
                  guest_count: 200,
                  status: 'active',
                  image: '/leela_palace.jpg'
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
            <div className="relative w-full sm:w-auto" ref={venueDatePickerRef}>
              <button
                type="button"
                onClick={() => setIsVenueDatePickerOpen(!isVenueDatePickerOpen)}
                className={`flex items-center gap-2 px-3.5 py-3 rounded-xl border text-xs font-semibold cursor-pointer w-full sm:w-auto justify-center transition-all hover:opacity-90 ${
                  isLight ? 'bg-white border-gray-200 text-gray-700 shadow-sm' : 'bg-white/5 border-white/5 text-gray-300'
                }`}
              >
                <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>
                  {venueStartDate || venueEndDate
                    ? `${venueStartDate ? formatEventDate(venueStartDate) : '...'} - ${venueEndDate ? formatEventDate(venueEndDate) : '...'}`
                    : 'Select Date Range'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isVenueDatePickerOpen ? 'rotate-180' : ''}`} />
              </button>

              {isVenueDatePickerOpen && (
                <div className={`absolute right-0 top-13 w-72 border rounded-2xl shadow-2xl p-4 z-50 animate-scale-up flex flex-col gap-3 text-left ${
                  isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0f111a] border-white/10 text-gray-200'
                }`}>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>Select Venue Date Range</span>
                  
                  {/* Preset ranges buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const end = new Date();
                        const start = new Date();
                        start.setDate(end.getDate() - 7);
                        setVenueStartDate(start.toISOString().split('T')[0]);
                        setVenueEndDate(end.toISOString().split('T')[0]);
                        setIsVenueDatePickerOpen(false);
                        setVenueCurrentPage(1);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-center border transition-all cursor-pointer ${
                        isLight ? 'border-gray-200 hover:bg-gray-50 text-gray-700' : 'border-white/5 hover:bg-white/5 text-gray-300'
                      }`}
                    >
                      Last 7 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const end = new Date();
                        const start = new Date();
                        start.setDate(end.getDate() - 30);
                        setVenueStartDate(start.toISOString().split('T')[0]);
                        setVenueEndDate(end.toISOString().split('T')[0]);
                        setIsVenueDatePickerOpen(false);
                        setVenueCurrentPage(1);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-center border transition-all cursor-pointer ${
                        isLight ? 'border-gray-200 hover:bg-gray-50 text-gray-700' : 'border-white/5 hover:bg-white/5 text-gray-300'
                      }`}
                    >
                      Last 30 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const now = new Date();
                        const start = new Date(now.getFullYear(), now.getMonth(), 1);
                        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                        setVenueStartDate(start.toISOString().split('T')[0]);
                        setVenueEndDate(end.toISOString().split('T')[0]);
                        setIsVenueDatePickerOpen(false);
                        setVenueCurrentPage(1);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-center border transition-all cursor-pointer ${
                        isLight ? 'border-gray-200 hover:bg-gray-50 text-gray-700' : 'border-white/5 hover:bg-white/5 text-gray-300'
                      }`}
                    >
                      This Month
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setVenueStartDate('');
                        setVenueEndDate('');
                        setIsVenueDatePickerOpen(false);
                        setVenueCurrentPage(1);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-center border transition-all cursor-pointer ${
                        isLight ? 'border-gray-200 hover:bg-gray-50 text-gray-700' : 'border-white/5 hover:bg-white/5 text-gray-300'
                      }`}
                    >
                      Clear Range
                    </button>
                  </div>

                  <div className={`border-t my-1 ${isLight ? 'border-gray-100' : 'border-white/5'}`} />

                  {/* Custom date range inputs */}
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-1">
                      <label className={`text-[9px] font-bold uppercase ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>Start Date</label>
                      <input
                        type="date"
                        value={venueStartDate}
                        onChange={e => {
                          setVenueStartDate(e.target.value);
                          setVenueCurrentPage(1);
                        }}
                        className={`border rounded-xl text-xs py-2 px-3 focus:outline-none focus:border-indigo-500 font-semibold w-full ${
                          isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                        }`}
                        style={{ colorScheme: isLight ? 'light' : 'dark' }}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className={`text-[9px] font-bold uppercase ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>End Date</label>
                      <input
                        type="date"
                        value={venueEndDate}
                        onChange={e => {
                          setVenueEndDate(e.target.value);
                          setVenueCurrentPage(1);
                        }}
                        className={`border rounded-xl text-xs py-2 px-3 focus:outline-none focus:border-indigo-500 font-semibold w-full ${
                          isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                        }`}
                        style={{ colorScheme: isLight ? 'light' : 'dark' }}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsVenueDatePickerOpen(false)}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2 px-4 rounded-xl transition-all cursor-pointer text-center font-semibold"
                  >
                    Apply & Close
                  </button>
                </div>
              )}
            </div>


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

                    const typeColor = (v.event_type || '').toLowerCase() === 'palace'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                      : (v.event_type || '').toLowerCase() === 'resort'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                        : (v.event_type || '').toLowerCase() === 'banquet'
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
                              <img src={resolveImage(v.image, 'venue', v.name)} alt={v.name} className="w-full h-full object-cover" />
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
                              onClick={() => setViewingVenueDetails(v)}
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
                  image: '/hero_udaipur_2.jpg'
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
            <div className="relative w-full sm:w-auto" ref={vendorDatePickerRef}>
              <button
                type="button"
                onClick={() => setIsVendorDatePickerOpen(!isVendorDatePickerOpen)}
                className={`flex items-center gap-2 px-3.5 py-3 rounded-xl border text-xs font-semibold cursor-pointer w-full sm:w-auto justify-center transition-all hover:opacity-90 ${
                  isLight ? 'bg-white border-gray-200 text-gray-700 shadow-sm' : 'bg-white/5 border-white/5 text-gray-300'
                }`}
              >
                <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>
                  {vendorStartDate || vendorEndDate
                    ? `${vendorStartDate ? formatEventDate(vendorStartDate) : '...'} - ${vendorEndDate ? formatEventDate(vendorEndDate) : '...'}`
                    : 'Select Date Range'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isVendorDatePickerOpen ? 'rotate-180' : ''}`} />
              </button>

              {isVendorDatePickerOpen && (
                <div className={`absolute right-0 top-13 w-72 border rounded-2xl shadow-2xl p-4 z-50 animate-scale-up flex flex-col gap-3 text-left ${
                  isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0f111a] border-white/10 text-gray-200'
                }`}>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>Select Vendor Date Range</span>
                  
                  {/* Preset ranges buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const end = new Date();
                        const start = new Date();
                        start.setDate(end.getDate() - 7);
                        setVendorStartDate(start.toISOString().split('T')[0]);
                        setVendorEndDate(end.toISOString().split('T')[0]);
                        setIsVendorDatePickerOpen(false);
                        setVendorCurrentPage(1);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-center border transition-all cursor-pointer ${
                        isLight ? 'border-gray-200 hover:bg-gray-50 text-gray-700' : 'border-white/5 hover:bg-white/5 text-gray-300'
                      }`}
                    >
                      Last 7 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const end = new Date();
                        const start = new Date();
                        start.setDate(end.getDate() - 30);
                        setVendorStartDate(start.toISOString().split('T')[0]);
                        setVendorEndDate(end.toISOString().split('T')[0]);
                        setIsVendorDatePickerOpen(false);
                        setVendorCurrentPage(1);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-center border transition-all cursor-pointer ${
                        isLight ? 'border-gray-200 hover:bg-gray-50 text-gray-700' : 'border-white/5 hover:bg-white/5 text-gray-300'
                      }`}
                    >
                      Last 30 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const now = new Date();
                        const start = new Date(now.getFullYear(), now.getMonth(), 1);
                        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                        setVendorStartDate(start.toISOString().split('T')[0]);
                        setVendorEndDate(end.toISOString().split('T')[0]);
                        setIsVendorDatePickerOpen(false);
                        setVendorCurrentPage(1);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-center border transition-all cursor-pointer ${
                        isLight ? 'border-gray-200 hover:bg-gray-50 text-gray-700' : 'border-white/5 hover:bg-white/5 text-gray-300'
                      }`}
                    >
                      This Month
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setVendorStartDate('');
                        setVendorEndDate('');
                        setIsVendorDatePickerOpen(false);
                        setVendorCurrentPage(1);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-center border transition-all cursor-pointer ${
                        isLight ? 'border-gray-200 hover:bg-gray-50 text-gray-700' : 'border-white/5 hover:bg-white/5 text-gray-300'
                      }`}
                    >
                      Clear Range
                    </button>
                  </div>

                  <div className={`border-t my-1 ${isLight ? 'border-gray-100' : 'border-white/5'}`} />

                  {/* Custom date range inputs */}
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-1">
                      <label className={`text-[9px] font-bold uppercase ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>Start Date</label>
                      <input
                        type="date"
                        value={vendorStartDate}
                        onChange={e => {
                          setVendorStartDate(e.target.value);
                          setVendorCurrentPage(1);
                        }}
                        className={`border rounded-xl text-xs py-2 px-3 focus:outline-none focus:border-indigo-500 font-semibold w-full ${
                          isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                        }`}
                        style={{ colorScheme: isLight ? 'light' : 'dark' }}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className={`text-[9px] font-bold uppercase ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>End Date</label>
                      <input
                        type="date"
                        value={vendorEndDate}
                        onChange={e => {
                          setVendorEndDate(e.target.value);
                          setVendorCurrentPage(1);
                        }}
                        className={`border rounded-xl text-xs py-2 px-3 focus:outline-none focus:border-indigo-500 font-semibold w-full ${
                          isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                        }`}
                        style={{ colorScheme: isLight ? 'light' : 'dark' }}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsVendorDatePickerOpen(false)}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2 px-4 rounded-xl transition-all cursor-pointer text-center font-semibold"
                  >
                    Apply & Close
                  </button>
                </div>
              )}
            </div>


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

                    const categoryColor = (v.category || '').toLowerCase() === 'catering'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                      : (v.category || '').toLowerCase() === 'decoration'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400'
                        : (v.category || '').toLowerCase() === 'entertainment'
                          ? 'bg-pink-100 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400'
                          : (v.category || '').toLowerCase() === 'photography'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
                            : (v.category || '').toLowerCase() === 'event planner'
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
                              <img src={resolveImage(v.image, 'vendor', v.category)} alt={v.name} className="w-full h-full object-cover" />
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
                              onClick={() => setViewingVendorDetails(v)}
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
            </div>
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
            <div className="relative w-full sm:w-auto" ref={bookingDatePickerRef}>
              <button
                type="button"
                onClick={() => setIsBookingDatePickerOpen(!isBookingDatePickerOpen)}
                className={`flex items-center gap-2 px-3.5 py-3 rounded-xl border text-xs font-semibold cursor-pointer w-full sm:w-auto justify-center transition-all hover:opacity-90 ${
                  isLight ? 'bg-white border-gray-200 text-gray-700 shadow-sm' : 'bg-white/5 border-white/5 text-gray-300'
                }`}
              >
                <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>
                  {bookingStartDate || bookingEndDate
                    ? `${bookingStartDate ? formatEventDate(bookingStartDate) : '...'} - ${bookingEndDate ? formatEventDate(bookingEndDate) : '...'}`
                    : 'Select Date Range'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isBookingDatePickerOpen ? 'rotate-180' : ''}`} />
              </button>

              {isBookingDatePickerOpen && (
                <div className={`absolute right-0 top-13 w-72 border rounded-2xl shadow-2xl p-4 z-50 animate-scale-up flex flex-col gap-3 text-left ${
                  isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0f111a] border-white/10 text-gray-200'
                }`}>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>Select Booking Date Range</span>
                  
                  {/* Preset ranges buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const end = new Date();
                        const start = new Date();
                        start.setDate(end.getDate() - 7);
                        setBookingStartDate(start.toISOString().split('T')[0]);
                        setBookingEndDate(end.toISOString().split('T')[0]);
                        setIsBookingDatePickerOpen(false);
                        setBookingCurrentPage(1);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-center border transition-all cursor-pointer ${
                        isLight ? 'border-gray-200 hover:bg-gray-50 text-gray-700' : 'border-white/5 hover:bg-white/5 text-gray-300'
                      }`}
                    >
                      Last 7 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const end = new Date();
                        const start = new Date();
                        start.setDate(end.getDate() - 30);
                        setBookingStartDate(start.toISOString().split('T')[0]);
                        setBookingEndDate(end.toISOString().split('T')[0]);
                        setIsBookingDatePickerOpen(false);
                        setBookingCurrentPage(1);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-center border transition-all cursor-pointer ${
                        isLight ? 'border-gray-200 hover:bg-gray-50 text-gray-700' : 'border-white/5 hover:bg-white/5 text-gray-300'
                      }`}
                    >
                      Last 30 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const now = new Date();
                        const start = new Date(now.getFullYear(), now.getMonth(), 1);
                        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                        setBookingStartDate(start.toISOString().split('T')[0]);
                        setBookingEndDate(end.toISOString().split('T')[0]);
                        setIsBookingDatePickerOpen(false);
                        setBookingCurrentPage(1);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-center border transition-all cursor-pointer ${
                        isLight ? 'border-gray-200 hover:bg-gray-50 text-gray-700' : 'border-white/5 hover:bg-white/5 text-gray-300'
                      }`}
                    >
                      This Month
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBookingStartDate('');
                        setBookingEndDate('');
                        setIsBookingDatePickerOpen(false);
                        setBookingCurrentPage(1);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-center border transition-all cursor-pointer ${
                        isLight ? 'border-gray-200 hover:bg-gray-50 text-gray-700' : 'border-white/5 hover:bg-white/5 text-gray-300'
                      }`}
                    >
                      Clear Range
                    </button>
                  </div>

                  <div className={`border-t my-1 ${isLight ? 'border-gray-100' : 'border-white/5'}`} />

                  {/* Custom date range inputs */}
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-1">
                      <label className={`text-[9px] font-bold uppercase ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>Start Date</label>
                      <input
                        type="date"
                        value={bookingStartDate}
                        onChange={e => {
                          setBookingStartDate(e.target.value);
                          setBookingCurrentPage(1);
                        }}
                        className={`border rounded-xl text-xs py-2 px-3 focus:outline-none focus:border-indigo-500 font-semibold w-full ${
                          isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                        }`}
                        style={{ colorScheme: isLight ? 'light' : 'dark' }}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className={`text-[9px] font-bold uppercase ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>End Date</label>
                      <input
                        type="date"
                        value={bookingEndDate}
                        onChange={e => {
                          setBookingEndDate(e.target.value);
                          setBookingCurrentPage(1);
                        }}
                        className={`border rounded-xl text-xs py-2 px-3 focus:outline-none focus:border-indigo-500 font-semibold w-full ${
                          isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0d0f14] border-white/5 text-gray-200'
                        }`}
                        style={{ colorScheme: isLight ? 'light' : 'dark' }}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsBookingDatePickerOpen(false)}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2 px-4 rounded-xl transition-all cursor-pointer text-center font-semibold"
                  >
                    Apply & Close
                  </button>
                </div>
              )}
            </div>


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
                              <img src={resolveImage(b.image, 'event', b.event_type)} alt={b.title} className="w-full h-full object-cover" />
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
          
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h2 className={`text-xl font-extrabold ${isLight ? 'text-gray-900' : 'text-white'}`}>Reports</h2>
            </div>
          </div>

          {/* Filter Toolbar Row */}
          <div className={`p-4 rounded-2xl border flex flex-wrap md:flex-nowrap items-center gap-2.5 w-full ${
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
                className={`appearance-none border rounded-xl text-xs py-2 pl-3 pr-8 focus:outline-none focus:border-indigo-500 font-semibold cursor-pointer w-full sm:w-36 ${
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
                className={`appearance-none border rounded-xl text-xs py-2 pl-3 pr-8 focus:outline-none focus:border-indigo-500 font-semibold cursor-pointer w-full sm:w-36 ${
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
                className={`appearance-none border rounded-xl text-xs py-2 pl-3 pr-8 focus:outline-none focus:border-indigo-500 font-semibold cursor-pointer w-full sm:w-36 ${
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
              className={`border rounded-xl text-xs py-2 px-3 font-bold transition-all cursor-pointer w-full sm:w-auto flex items-center justify-center gap-1.5 ${
                isLight ? 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50 shadow-sm' : 'border-white/10 text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
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
                        <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-gray-150 border border-white/5">
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
            </div>
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
                              onClick={() => setViewingFeedbackDetails(f)}
                              title="View Details"
                              className={`p-1.5 rounded-lg border cursor-pointer transition-all ${
                                isLight ? 'border-gray-200 hover:bg-gray-50 text-gray-700' : 'border-white/10 hover:bg-white/5 text-gray-300'
                              }`}
                            >
                              <Eye className="w-3.5 h-3.5" />
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

      {activeTab === 'settings' && (
        <div className="flex flex-col gap-6 animate-scale-up text-left">
          {/* Header */}
          <div>
            <h2 className={`text-xl font-extrabold ${isLight ? 'text-gray-900' : 'text-white'}`}>Admin Settings</h2>
            <p className="text-xs text-gray-500 mt-1">
              Manage your administrator profile credentials, display preferences, and account security.
            </p>
          </div>

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start mt-2">
            
            {/* Left Side: Avatar Card */}
            <div className={`lg:col-span-1 p-6 rounded-2xl border flex flex-col items-center justify-center text-center gap-4 ${
              isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-white/5 border-white/5 backdrop-blur-md'
            }`}>
              <div className="relative group w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-500/20 hover:border-indigo-500 transition-all shadow-xl bg-slate-800 flex items-center justify-center">
                {adminAvatar ? (
                  <img
                    src={adminAvatar}
                    alt={adminName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl font-extrabold uppercase">
                    {adminName ? adminName[0] : 'A'}
                  </div>
                )}
                
                {adminUploadLoading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <span className={`text-sm font-bold ${isLight ? 'text-gray-800' : 'text-white'}`}>{adminName || 'System Admin'}</span>
                <span className="text-[10px] font-extrabold bg-indigo-500/10 text-indigo-500 px-2.5 py-0.5 rounded-full uppercase tracking-wider self-center border border-indigo-500/20">
                  {adminDesignation || 'Super Admin'}
                </span>
              </div>

              <label className="px-4 py-2 border border-white/10 hover:border-indigo-500/35 bg-white/5 hover:bg-white/10 text-gray-300 dark:hover:text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer">
                <Camera className="w-4 h-4 text-indigo-400" />
                <span>Change Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAdminAvatarUpload}
                  className="hidden"
                  disabled={adminUploadLoading}
                />
              </label>

              <span className="text-[9px] text-gray-500 leading-normal font-semibold">
                JPG, PNG or WEBP. Max size 2MB.
              </span>
            </div>

            {/* Right Side: Profile Info Form & Password Change */}
            <div className="lg:col-span-3 flex flex-col gap-8">
              
              {/* Profile Details Card */}
              <div className={`p-6 sm:p-8 rounded-2xl border flex flex-col gap-6 ${
                isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-white/5 border-white/5 backdrop-blur-md'
              }`}>
                <h3 className={`text-xs font-bold uppercase tracking-wider border-b pb-3 ${
                  isLight ? 'text-gray-800 border-gray-200' : 'text-gray-200 border-white/5'
                }`}>
                  Administrative Profile Details
                </h3>

                <form onSubmit={handleSaveAdminProfile} className="flex flex-col gap-5 text-xs font-bold">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Full Name */}
                    <div className="flex flex-col gap-1.5">
                      <label className={`text-[10px] uppercase tracking-wider ${isLight ? 'text-gray-550' : 'text-gray-400'}`}>Full Name</label>
                      <input
                        type="text"
                        required
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                        className={`w-full border rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-indigo-500 font-semibold ${
                          isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0d0f14] border-white/5 text-white'
                        }`}
                      />
                    </div>

                    {/* Email Address */}
                    <div className="flex flex-col gap-1.5">
                      <label className={`text-[10px] uppercase tracking-wider ${isLight ? 'text-gray-550' : 'text-gray-400'}`}>Email Address</label>
                      <input
                        type="email"
                        required
                        readOnly
                        value={adminEmail}
                        className={`w-full border rounded-xl px-4 py-3 text-xs cursor-not-allowed focus:outline-none opacity-60 font-semibold ${
                          isLight ? 'bg-gray-50 border-gray-200 text-gray-500' : 'bg-white/3 border-white/5 text-gray-400'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Phone Number */}
                    <div className="flex flex-col gap-1.5">
                      <label className={`text-[10px] uppercase tracking-wider ${isLight ? 'text-gray-550' : 'text-gray-400'}`}>Phone Number</label>
                      <input
                        type="text"
                        required
                        value={adminPhone}
                        onChange={(e) => setAdminPhone(e.target.value)}
                        className={`w-full border rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-indigo-500 font-semibold ${
                          isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0d0f14] border-white/5 text-white'
                        }`}
                      />
                    </div>

                    {/* Designation */}
                    <div className="flex flex-col gap-1.5">
                      <label className={`text-[10px] uppercase tracking-wider ${isLight ? 'text-gray-555' : 'text-gray-400'}`}>Designation</label>
                      <input
                        type="text"
                        required
                        value={adminDesignation}
                        onChange={(e) => setAdminDesignation(e.target.value)}
                        className={`w-full border rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-indigo-500 font-semibold ${
                          isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0d0f14] border-white/5 text-white'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex flex-col gap-1.5">
                    <label className={`text-[10px] uppercase tracking-wider ${isLight ? 'text-gray-555' : 'text-gray-400'}`}>Office Location</label>
                    <input
                      type="text"
                      required
                      value={adminLocation}
                      onChange={(e) => setAdminLocation(e.target.value)}
                      className={`w-full border rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-indigo-500 font-semibold ${
                        isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0d0f14] border-white/5 text-white'
                      }`}
                    />
                  </div>

                  {/* Bio Area */}
                  <div className="flex flex-col gap-1.5">
                    <label className={`text-[10px] uppercase tracking-wider ${isLight ? 'text-gray-555' : 'text-gray-400'}`}>Administrative Bio / Notes</label>
                    <textarea
                      value={adminBio}
                      onChange={(e) => setAdminBio(e.target.value)}
                      rows={4}
                      className={`w-full border rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-indigo-500 resize-none leading-relaxed font-semibold ${
                        isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0d0f14] border-white/5 text-white'
                      }`}
                    />
                  </div>

                  {/* Save Changes CTA Button */}
                  <button
                    type="submit"
                    disabled={adminSubmitLoading}
                    className="px-5 py-3 bg-[#5a2bd4] hover:bg-[#4c24b5] disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-indigo-600/10 cursor-pointer self-start"
                  >
                    {adminSubmitLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <Check className="w-4 h-4 text-white" />
                    )}
                    Save Changes
                  </button>
                </form>
              </div>

              {/* Password Management Card */}
              <div className={`p-6 sm:p-8 rounded-2xl border flex flex-col gap-6 ${
                isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-white/5 border-white/5 backdrop-blur-md'
              }`}>
                <h3 className={`text-xs font-bold uppercase tracking-wider border-b pb-3 ${
                  isLight ? 'text-gray-800 border-gray-200' : 'text-gray-200 border-white/5'
                }`}>
                  Change Password
                </h3>

                <form onSubmit={handleUpdateAdminPassword} className="flex flex-col gap-5 text-xs font-bold">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* New Password */}
                    <div className="flex flex-col gap-1.5">
                      <label className={`text-[10px] uppercase tracking-wider ${isLight ? 'text-gray-550' : 'text-gray-400'}`}>New Password</label>
                      <div className="relative">
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Min 6 characters"
                          className={`w-full border rounded-xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:border-indigo-500 font-semibold ${
                            isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0d0f14] border-white/5 text-white'
                          }`}
                        />
                        <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                      </div>
                    </div>

                    {/* Confirm New Password */}
                    <div className="flex flex-col gap-1.5">
                      <label className={`text-[10px] uppercase tracking-wider ${isLight ? 'text-gray-550' : 'text-gray-400'}`}>Confirm New Password</label>
                      <div className="relative">
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter password"
                          className={`w-full border rounded-xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:border-indigo-500 font-semibold ${
                            isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0d0f14] border-white/5 text-white'
                          }`}
                        />
                        <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                      </div>
                    </div>
                  </div>

                  {/* Change Password Button */}
                  <button
                    type="submit"
                    disabled={passwordSubmitLoading}
                    className="px-5 py-3 bg-[#5a2bd4] hover:bg-[#4c24b5] disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-indigo-600/10 cursor-pointer self-start"
                  >
                    {passwordSubmitLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <Check className="w-4 h-4 text-white" />
                    )}
                    Update Password
                  </button>
                </form>
              </div>

            </div>

          </div>
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
                  <option value="/leela_palace.jpg">The Leela Palace</option>
                  <option value="/monsoon_palace.jpg">Fateh Garh Resort</option>
                  <option value="/hero_udaipur_3.jpg">Radisson Blu</option>
                  <option value="/hero_udaipur_1.jpg">Bhanwar Singh Palace</option>
                  <option value="/shiv_niwas.jpg">Ramada Resort</option>
                  <option value="/jag_mandir.jpg">Bijolai Fort</option>
                  <option value="/hero_udaipur_2.jpg">Hotel Hilltop Palace</option>
                  <option value="/oberoi_udaivilas.jpg">The Oberoi Udaivilas</option>
                  <option value="/taj_lake_palace.jpg">Taj Lake Palace</option>
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
                  <option value="/leela_palace.jpg">The Leela Palace</option>
                  <option value="/monsoon_palace.jpg">Fateh Garh Resort</option>
                  <option value="/hero_udaipur_3.jpg">Radisson Blu</option>
                  <option value="/hero_udaipur_1.jpg">Bhanwar Singh Palace</option>
                  <option value="/shiv_niwas.jpg">Ramada Resort</option>
                  <option value="/jag_mandir.jpg">Bijolai Fort</option>
                  <option value="/hero_udaipur_2.jpg">Hotel Hilltop Palace</option>
                  <option value="/oberoi_udaivilas.jpg">The Oberoi Udaivilas</option>
                  <option value="/taj_lake_palace.jpg">Taj Lake Palace</option>
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
                  <option value="/hero_udaipur_3.jpg">Apex Sound & Lights</option>
                  <option value="/shiv_niwas.jpg">Royal Decorators</option>
                  <option value="/hero_udaipur_2.jpg">Marwar Catering Services</option>
                  <option value="/jag_mandir.jpg">Lakeside Photography</option>
                  <option value="/leela_palace.jpg">Udaipur Event Management</option>
                  <option value="/hero_udaipur_1.jpg">Heritage Travels</option>
                  <option value="/oberoi_udaivilas.jpg">Aravali Planners</option>
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
                  <option value="/hero_udaipur_3.jpg">Apex Sound & Lights</option>
                  <option value="/shiv_niwas.jpg">Royal Decorators</option>
                  <option value="/hero_udaipur_2.jpg">Marwar Catering Services</option>
                  <option value="/jag_mandir.jpg">Lakeside Photography</option>
                  <option value="/leela_palace.jpg">Udaipur Event Management</option>
                  <option value="/hero_udaipur_1.jpg">Heritage Travels</option>
                  <option value="/oberoi_udaivilas.jpg">Aravali Planners</option>
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

      {/* ADD USER MODAL */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 bg-[#07080a]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddUser} className={`w-full max-w-md p-6 rounded-2xl border text-left shadow-2xl flex flex-col gap-4 ${
            isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0d1117] border-white/5 text-white'
          }`}>
            <h3 className="text-sm font-bold uppercase tracking-wider border-b border-white/5 pb-2">
              ➕ Add New User
            </h3>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase text-gray-500">Full Name</label>
              <input
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={newUserData.name}
                onChange={e => setNewUserData({ ...newUserData, name: e.target.value })}
                className={`border rounded-lg text-xs py-2.5 px-3 focus:outline-none focus:border-indigo-500 ${
                  isLight ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-white/5 border-white/5 text-white'
                }`}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase text-gray-500">Email Address</label>
              <input
                type="email"
                placeholder="e.g. rahul@example.com"
                value={newUserData.email}
                onChange={e => setNewUserData({ ...newUserData, email: e.target.value })}
                className={`border rounded-lg text-xs py-2.5 px-3 focus:outline-none focus:border-indigo-500 ${
                  isLight ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-white/5 border-white/5 text-white'
                }`}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase text-gray-500">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={newUserData.password}
                onChange={e => setNewUserData({ ...newUserData, password: e.target.value })}
                className={`border rounded-lg text-xs py-2.5 px-3 focus:outline-none focus:border-indigo-500 ${
                  isLight ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-white/5 border-white/5 text-white'
                }`}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase text-gray-500">System Role</label>
              <select
                value={newUserData.role}
                onChange={e => setNewUserData({ ...newUserData, role: e.target.value })}
                className={`border rounded-lg text-xs py-2.5 px-3 focus:outline-none focus:border-indigo-500 ${
                  isLight ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-white/5 border-white/5 text-white'
                }`}
              >
                <option value="user">Standard User</option>
                <option value="vendor">Vendor User</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => {
                  setNewUserData({ name: '', email: '', password: '', role: 'user' });
                  setIsAddUserModalOpen(false);
                }}
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
                Create User
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW USER PROFILE DETAIL MODAL */}
      {viewingUserProfile && (
        <div className="fixed inset-0 bg-[#07080a]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md p-6 rounded-2xl border text-left shadow-2xl flex flex-col gap-5 ${
            isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0d1117] border-white/5 text-white'
          }`}>
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                👤 User Profile Detail
              </h3>
              <span className={`text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                viewingUserProfile.role === 'admin' 
                  ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                  : viewingUserProfile.role === 'vendor' 
                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    : 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'
              }`}>
                {viewingUserProfile.role}
              </span>
            </div>

            <div className="flex items-center gap-4">
              {viewingUserProfile.avatar ? (
                <img
                  src={viewingUserProfile.avatar}
                  alt={viewingUserProfile.name}
                  className="w-16 h-16 rounded-full object-cover shrink-0 border-2 border-[#5a2bd4]/30"
                />
              ) : (
                <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center font-bold text-xl shrink-0 ${
                  getInitialsColor(getInitials(viewingUserProfile.name))
                }`}>
                  {getInitials(viewingUserProfile.name)}
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <h4 className="text-base font-extrabold truncate">{viewingUserProfile.name}</h4>
                <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'} truncate`}>{viewingUserProfile.email}</p>
                <p className={`text-[10px] mt-1 font-bold ${
                  viewingUserProfile.status === 'blocked' ? 'text-rose-500' : 'text-emerald-500'
                }`}>
                  {viewingUserProfile.status === 'blocked' ? '● Blocked Account' : '● Active Account'}
                </p>
              </div>
            </div>

            <div className={`p-4 rounded-xl border flex flex-col gap-3.5 text-xs leading-normal ${
              isLight ? 'bg-gray-50 border-gray-150' : 'bg-white/3 border-white/5'
            }`}>
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-500">Joined Date</span>
                <span className="font-semibold">{formatEventDate(viewingUserProfile.created_at)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-500">Contact Number</span>
                <span className="font-semibold">{viewingUserProfile.phone || 'Not Provided'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-500">Unique User ID</span>
                <span className="font-semibold font-mono text-[10px] bg-black/10 dark:bg-white/5 px-2 py-0.5 rounded">
                  USR-{viewingUserProfile.id || 'N/A'}
                </span>
              </div>
              <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={() => setViewingUserProfile(null)}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer text-center font-semibold"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

      {/* VIEW EVENT DETAILS MODAL */}
      {viewingEventDetails && (
        <div className="fixed inset-0 bg-[#07080a]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md p-6 rounded-2xl border text-left shadow-2xl flex flex-col gap-4 ${
            isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0d1117] border-white/5 text-white'
          }`}>
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                🎉 Event Details
              </h3>
              <span className={`text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                viewingEventDetails.status === 'planning' 
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                  : viewingEventDetails.status === 'completed'
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
              }`}>
                {viewingEventDetails.status}
              </span>
            </div>

            <div className="flex flex-col">
              <h4 className="text-base font-extrabold">{viewingEventDetails.title}</h4>
              <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'} mt-1 font-semibold flex items-center gap-1`}>
                Theme: {viewingEventDetails.theme || 'Traditional'}
              </p>
            </div>

            <div className={`p-4 rounded-xl border flex flex-col gap-3 text-xs leading-normal ${
              isLight ? 'bg-gray-50 border-gray-150' : 'bg-white/3 border-white/5'
            }`}>
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-500">Event ID</span>
                <span className="font-semibold font-mono">EVT-{viewingEventDetails.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-500">Event Type</span>
                <span className="font-semibold capitalize">{viewingEventDetails.event_type}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-500">Date & Time</span>
                <span className="font-semibold">{formatEventDate(viewingEventDetails.date)} at {formatEventTime(viewingEventDetails.time) || '12:00 PM'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-500">Location</span>
                <span className="font-semibold truncate max-w-[200px]">{viewingEventDetails.location}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-500">Budget</span>
                <span className="font-semibold text-emerald-500 dark:text-emerald-400 font-bold">₹{parseFloat(viewingEventDetails.budget || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-500">Expected Guests</span>
                <span className="font-semibold">{viewingEventDetails.guest_count || 100} Guests</span>
              </div>
              <div className="flex flex-col gap-1 mt-1">
                <span className="font-bold text-gray-500">Description</span>
                <p className={`p-2.5 rounded-lg border text-[11px] leading-relaxed ${
                  isLight ? 'bg-white border-gray-200' : 'bg-black/10 border-white/5'
                }`}>
                  {viewingEventDetails.description || 'No description provided.'}
                </p>
              </div>
            </div>

            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={() => setViewingEventDetails(null)}
                className="w-full bg-[#5a2bd4] hover:bg-[#4c24b5] text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer text-center font-semibold"
              >
                Close Event Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW VENUE DETAILS MODAL */}
      {viewingVenueDetails && (
        <div className="fixed inset-0 bg-[#07080a]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md p-6 rounded-2xl border text-left shadow-2xl flex flex-col gap-4 ${
            isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0d1117] border-white/5 text-white'
          }`}>
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                🏛️ Venue Details
              </h3>
              <span className={`text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                viewingVenueDetails.status === 'active' 
                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                  : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
              }`}>
                {viewingVenueDetails.status}
              </span>
            </div>

            {viewingVenueDetails.image && (
              <div className="w-full h-40 rounded-xl overflow-hidden relative border border-white/5 shadow-inner">
                <img
                  src={viewingVenueDetails.image}
                  alt={viewingVenueDetails.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#efe9fc] text-[#5a2bd4] shadow-md border border-white/10 flex items-center gap-1">
                  ⭐ {viewingVenueDetails.rating || '4.5'}
                </div>
              </div>
            )}

            <div className="flex flex-col">
              <h4 className="text-base font-extrabold">{viewingVenueDetails.name}</h4>
              <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'} mt-1 font-semibold flex items-center gap-1`}>
                📍 {viewingVenueDetails.location}
              </p>
            </div>

            <div className={`p-4 rounded-xl border flex flex-col gap-3 text-xs leading-normal ${
              isLight ? 'bg-gray-50 border-gray-150' : 'bg-white/3 border-white/5'
            }`}>
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-500">Venue Type</span>
                <span className="font-semibold">{viewingVenueDetails.type || viewingVenueDetails.event_type}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-500">Max Capacity</span>
                <span className="font-semibold">{viewingVenueDetails.maxCapacity || viewingVenueDetails.guest_count || 300} Guests</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-500">Price Tier</span>
                <span className="font-semibold text-indigo-500 dark:text-indigo-400 font-bold">{viewingVenueDetails.priceTier || '₹₹₹'}</span>
              </div>
              <div className="flex flex-col gap-1 mt-1">
                <span className="font-bold text-gray-500">Amenities</span>
                <span className="font-semibold text-[10px] bg-black/10 dark:bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5 leading-relaxed mt-1 flex flex-wrap gap-1.5">
                  {viewingVenueDetails.amenities && Array.isArray(viewingVenueDetails.amenities)
                    ? viewingVenueDetails.amenities.map((a, idx) => (
                        <span key={idx} className="bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20 font-bold uppercase text-[9px]">{a}</span>
                      ))
                    : 'AC Hall, Parking, Sound System'}
                </span>
              </div>
            </div>

            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={() => setViewingVenueDetails(null)}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer text-center font-semibold"
              >
                Close Venue Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW VENDOR DETAILS MODAL */}
      {viewingVendorDetails && (
        <div className="fixed inset-0 bg-[#07080a]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md p-6 rounded-2xl border text-left shadow-2xl flex flex-col gap-4 ${
            isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0d1117] border-white/5 text-white'
          }`}>
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                🤝 Vendor Profile Details
              </h3>
              <span className={`text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                viewingVendorDetails.status === 'active' 
                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                  : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
              }`}>
                {viewingVendorDetails.status}
              </span>
            </div>

            {viewingVendorDetails.image && (
              <div className="w-full h-40 rounded-xl overflow-hidden relative border border-white/5 shadow-inner">
                <img
                  src={viewingVendorDetails.image}
                  alt={viewingVendorDetails.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#efe9fc] text-[#5a2bd4] shadow-md border border-white/10">
                  🏷️ {viewingVendorDetails.category}
                </div>
              </div>
            )}

            <div className="flex flex-col">
              <h4 className="text-base font-extrabold">{viewingVendorDetails.name}</h4>
              <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'} mt-1 font-semibold`}>
                👤 Contact: {viewingVendorDetails.contact_person || 'N/A'}
              </p>
            </div>

            <div className={`p-4 rounded-xl border flex flex-col gap-3 text-xs leading-normal ${
              isLight ? 'bg-gray-50 border-gray-150' : 'bg-white/3 border-white/5'
            }`}>
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-500">Category Service</span>
                <span className="font-semibold">{viewingVendorDetails.category}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-500">Contact Number</span>
                <span className="font-semibold font-mono">{viewingVendorDetails.phone || 'Not Provided'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-500">Email Address</span>
                <span className="font-semibold">{viewingVendorDetails.email || 'Not Provided'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-500">Joined Platform</span>
                <span className="font-semibold">{formatEventDate(viewingVendorDetails.created_at)}</span>
              </div>
            </div>

            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={() => setViewingVendorDetails(null)}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer text-center font-semibold"
              >
                Close Vendor Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW FEEDBACK DETAILS MODAL */}
      {viewingFeedbackDetails && (
        <div className="fixed inset-0 bg-[#07080a]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md p-6 rounded-2xl border text-left shadow-2xl flex flex-col gap-5 ${
            isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-[#0d1117] border-white/5 text-white'
          }`}>
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                ⭐ Feedback Details
              </h3>
              <span className={`text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                viewingFeedbackDetails.rating >= 4
                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                  : viewingFeedbackDetails.rating === 3
                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
              }`}>
                {viewingFeedbackDetails.rating >= 4 ? 'Positive' : viewingFeedbackDetails.rating === 3 ? 'Neutral' : 'Negative'}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full border flex items-center justify-center font-bold text-sm shrink-0 ${
                getInitialsColor(getInitials(viewingFeedbackDetails.name))
              }`}>
                {getInitials(viewingFeedbackDetails.name)}
              </div>
              <div className="flex flex-col min-w-0">
                <h4 className="text-sm font-extrabold truncate">{viewingFeedbackDetails.name || 'Anonymous User'}</h4>
                <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'} truncate`}>{viewingFeedbackDetails.email || 'no-email@events.com'}</p>
                <div className="flex items-center gap-0.5 mt-1">
                  {Array.from({ length: 5 }).map((_, sIdx) => (
                    <Star
                      key={sIdx}
                      className={`w-3.5 h-3.5 ${sIdx < viewingFeedbackDetails.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-xl border flex flex-col gap-3 text-xs leading-normal ${
              isLight ? 'bg-gray-50 border-gray-150' : 'bg-white/3 border-white/5'
            }`}>
              <div className="flex flex-col gap-1">
                <span className="font-bold text-gray-500">Feedback Comment</span>
                <p className={`text-[11px] leading-relaxed break-words font-medium ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                  "{viewingFeedbackDetails.comment || 'No comment text provided.'}"
                </p>
              </div>
              <div className="border-t border-white/5 my-1" />
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-500">Submitted Date</span>
                <span className="font-semibold">{formatFeedbackDate(viewingFeedbackDetails.created_at)}</span>
              </div>
            </div>

            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={() => setViewingFeedbackDetails(null)}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer text-center font-semibold"
              >
                Close Feedback
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
