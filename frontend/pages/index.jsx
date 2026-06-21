import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Calendar, Sparkles, Shield, Receipt, Users, CheckSquare, PhoneCall, 
  ChevronRight, ChevronLeft, Sun, Moon, Check, ArrowRight, Tag, MapPin, Mail, 
  Search, Play, Heart, Cake, Building, GraduationCap, Wine, Star, MoreHorizontal,
  Phone, ChefHat, Palette, Landmark, LayoutDashboard
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { LogoBrand } from '../components/Logo';

// Local SVG Brand Icons to resolve missing brand exports in lucide-react
const FacebookIcon = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const TwitterIcon = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
  </svg>
);

const LinkedinIcon = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export default function LandingPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  const handleScrollTo = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };
  // Filters State
  const [selectedVenueCat, setSelectedVenueCat] = useState('All Types');
  const [activeNav, setActiveNav] = useState('Home');

  // Scroll spy observer to highlight correct navigation header links automatically
  useEffect(() => {
    const sections = ['about', 'how-it-works', 'services', 'venues', 'events'];
    const idToNavName = {
      'about': 'About Us',
      'how-it-works': 'How It Works',
      'services': 'Services',
      'venues': 'Venues',
      'events': 'Events'
    };

    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -50% 0px', // Trigger when section occupies the middle portion of the screen
      threshold: 0
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const name = idToNavName[entry.target.id];
          if (name) {
            setActiveNav(name);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    const handleScroll = () => {
      // If we scroll near the top, mark "Home" as active
      if (window.scrollY < 120) {
        setActiveNav('Home');
      }
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const [stats, setStats] = useState({
    eventsPlanned: '500+',
    happyClients: '1000+',
    topVenues: '50+',
    clientRating: '4.8/5'
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE_URL || 'http://localhost:5000/api'}/public-stats`);
        if (res.ok) {
          const data = await res.json();
          setStats({
            eventsPlanned: data.eventsPlanned ? `${data.eventsPlanned}+` : '0+',
            happyClients: data.happyClients ? `${data.happyClients}+` : '0+',
            topVenues: data.topVenues ? `${data.topVenues}+` : '15+',
            clientRating: data.clientRating ? `${data.clientRating}/5` : '4.8/5'
          });
        }
      } catch (err) {
        console.error('Error fetching landing page statistics:', err);
      }
    };
    fetchStats();
  }, []);

  // Venues Data
  const venuesList = [
    { id: 1, name: 'The Leela Palace', type: 'Luxury Hotel', location: 'Lake Pichola, Udaipur', capacity: '300 - 500', rating: '4.8', img: '/leela_palace.jpg', categories: ['Wedding', 'Conference'] },
    { id: 2, name: 'Fateh Garh Resort', type: 'Heritage Resort', location: 'Sajjangarh, Udaipur', capacity: '50 - 300', rating: '4.5', img: '/monsoon_palace.jpg', categories: ['Wedding', 'Party'] },
    { id: 3, name: 'Radisson Blu', type: 'Luxury Hotel', location: 'Rani Road, Udaipur', capacity: '100 - 400', rating: '4.5', img: '/services_venues.png', categories: ['Corporate', 'Conference'] },
    { id: 10, name: 'Taj Fateh Prakash Palace', type: 'Heritage Palace', location: 'City Palace Complex, Udaipur', capacity: '80 - 350', rating: '4.7', img: '/hero_udaipur_3.jpg', categories: ['Wedding'] },
    { id: 5, name: 'Shiv Niwas Palace', type: 'Heritage Hotel', location: 'City Palace, Udaipur', capacity: '100 - 350', rating: '4.6', img: '/shiv_niwas.jpg', categories: ['Corporate'] },
    { id: 6, name: 'Ananta Resort', type: 'Luxury Resort', location: 'Kodiyat Road, Udaipur', capacity: '50 - 300', rating: '4.4', img: '/services_scenarios.png', categories: ['Party'] }
  ];

  // Event Categories
  const eventCategories = [
    {
      title: 'Wedding Events',
      desc: 'Make your dream wedding unforgettable.',
      img: '/landing_wedding.png',
      icon: Heart,
      color: 'text-pink-500 bg-pink-500/10 border-pink-500/20 dark:bg-pink-500/10 dark:text-pink-400'
    },
    {
      title: 'Birthday Parties',
      desc: 'Plan perfect birthday parties with ease.',
      img: '/landing_birthday.png',
      icon: Cake,
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-400'
    },
    {
      title: 'Corporate Events',
      desc: 'Organize professional corporate events seamlessly.',
      img: '/landing_corporate.png',
      icon: Building,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400'
    },
    {
      title: 'College Festivals',
      desc: 'Plan and manage amazing college fests.',
      img: '/landing_college.png',
      icon: GraduationCap,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400'
    },
    {
      title: 'Private Parties',
      desc: 'Host intimate gatherings and celebrations.',
      img: '/landing_private.png',
      icon: Wine,
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400'
    },
    {
      title: 'Custom Events',
      desc: 'Tailored event planning for any special occasion.',
      img: '/landing_custom.png',
      icon: Sparkles,
      color: 'text-rose-500 bg-rose-500/10 border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400'
    }
  ];

  const filteredVenues = selectedVenueCat === 'All Types'
    ? venuesList
    : venuesList.filter(v => v.categories.includes(selectedVenueCat));

  return (
    <div className={`min-h-screen flex flex-col justify-between transition-colors duration-300 ${
      isLight ? 'bg-white text-gray-800' : 'bg-[#090b0f] text-gray-100'
    }`}>
      
      {/* Pinned Header (Main Navbar only) */}
      <header className="fixed top-0 left-0 right-0 z-40 w-full shadow-md">
        {/* Main Navigation Bar */}
        <nav className={`w-full px-6 py-4 flex justify-between items-center transition-colors duration-300 border-b ${
          isLight ? 'bg-white/95 border-gray-100 shadow-sm' : 'bg-[#090b0f]/95 border-white/5 shadow-md'
        } backdrop-blur-md`}>
          <Link href="/" className="cursor-pointer">
            <LogoBrand isDarkTheme={!isLight} />
          </Link>

          {/* Menu Items (matching image navbar with active highlight) */}
          <div className="hidden md:flex items-center gap-6 text-xs font-bold">
            {[
              { name: 'Home', href: '/' },
              { name: 'About Us', href: '#about' },
              { name: 'How It Works', href: '#how-it-works' },
              { name: 'Services', href: '#services' },
              { name: 'Venues', href: '#venues' },
              { name: 'Events', href: '#events' }
            ].map((item) => {
              const isActive = activeNav === item.name;
              const colorClass = isActive
                ? 'text-[#1d4ed8] dark:text-indigo-400 font-extrabold border-b-2 border-[#1d4ed8] dark:border-indigo-400 pb-0.5'
                : `${isLight ? 'text-gray-600 hover:text-[#1d4ed8]' : 'text-gray-300 hover:text-white'} transition-all`;

              if (item.name === 'Home') {
                return (
                  <Link
                    key={item.name}
                    href="/"
                    onClick={() => setActiveNav('Home')}
                    className={`${colorClass} hover:opacity-80 transition-all relative`}
                  >
                    {item.name}
                  </Link>
                );
              }

              return (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => {
                    setActiveNav(item.name);
                    handleScrollTo(e, item.href.substring(1));
                  }}
                  className={colorClass}
                >
                  {item.name}
                </a>
              );
            })}
          </div>

          {/* Right CTA / Auth Controls */}
          <div className="flex gap-3.5 items-center">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline text-xs font-semibold">Welcome, <strong className="text-[#1d4ed8] dark:text-indigo-400">{user.name}</strong></span>
                <Link
                  href="/dashboard"
                  className={`px-4.5 py-2.5 text-xs font-bold rounded-xl border flex items-center gap-2 dashboard-nav-btn cursor-pointer ${
                    isLight 
                      ? 'bg-white border-slate-200 text-slate-700 shadow-sm' 
                      : 'bg-white/5 border-white/10 text-slate-300'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-[#1d4ed8] dark:text-indigo-400 transition-colors" />
                  <span>Dashboard</span>
                </Link>
                {user.role !== 'admin' && (
                  <Link
                    href="/ai"
                    className="px-5 py-2.5 text-xs font-bold rounded-xl bg-[#1d4ed8] hover:bg-[#4b22b5] always-white transition-all"
                  >
                    Create Event
                  </Link>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className={`px-5 py-2.5 text-xs font-bold rounded-xl border transition-all ${
                    isLight 
                      ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-sm' 
                      : 'bg-transparent border-white/10 hover:bg-white/5 text-slate-300 hover:text-white'
                  }`}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2.5 text-xs font-bold rounded-xl bg-[#1d4ed8] hover:bg-[#4b22b5] always-white transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* 3. Hero Section (Udaipur City Palace Cover Sunset) */}
      <div className="relative min-h-[600px] md:min-h-[680px] flex items-center overflow-hidden pt-[72px] group/hero z-10">
        <img
          src="/udaipur_palace.png"
          alt="Udaipur City Palace Sunset"
          className="absolute inset-0 w-full h-full object-cover select-none"
        />
        <div className="absolute inset-0 z-10 transition-all duration-300 bg-gradient-to-r from-black/85 via-black/40 to-transparent"></div>
        <div className="absolute inset-0 z-10 transition-all duration-300 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

        {/* Hero Content */}
        <div className="relative max-w-7xl w-full mx-auto px-6 pt-16 pb-24 z-20 text-left flex flex-col justify-center animate-fade-in">
          {/* Pill Badge overlay */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wide mb-6 w-fit border transition-colors bg-indigo-500/10 border-indigo-500/30 always-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Udaipur's Smart Event Planning Platform
          </div>

          <h1 className="text-4xl md:text-6.5xl font-black tracking-tight leading-[1.08] max-w-3xl mb-5 font-outfit always-white">
            Plan Your <span className="font-serif italic text-amber-400 font-normal">Perfect</span> <br />
             Event With <span className="text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]">AI 
</span> in <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-amber-300 bg-clip-text text-transparent font-black drop-shadow-[0_2px_10px_rgba(59,130,246,0.2)]">Udaipur</span>
          </h1>

          <p className="text-xs md:text-sm max-w-xl leading-relaxed mb-8 font-medium always-gray-200">
            Plan weddings, birthdays, corporate events, and celebrations effortlessly with smart venue recommendations, verified vendors, and AI-driven event management.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center w-fit mb-12">
            <Link
              href={user ? '/dashboard' : '/login'}
              className="px-7 py-3.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 always-white shadow-xl shadow-indigo-600/20 transition-all flex items-center gap-1.5 group cursor-pointer"
            >
              Plan Your Event
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#how-it-works"
              onClick={(e) => handleScrollTo(e, 'how-it-works')}
              className="px-7 py-3.5 text-xs font-bold rounded-xl bg-white/5 border border-white/20 hover:bg-white/10 always-white transition-all text-center flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white text-white shrink-0" />
              How It Works
            </a>
          </div>

          {/* 4 Stats Cards Floating at the bottom */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full mt-4">
            {/* Stats Card 1 */}
            <div className={`p-5 rounded-2xl border backdrop-blur-lg flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 ${
              isLight 
                ? 'bg-white/12 border-white/20 shadow-lg shadow-blue-900/5 hover:border-[#1d4ed8]/30 hover:shadow-xl' 
                : 'bg-[#0d1117]/25 border-white/5 shadow-xl hover:border-indigo-500/30 hover:shadow-2xl'
            }`}>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 shadow-md shadow-blue-500/25 flex items-center justify-center shrink-0 select-none">
                <span className="text-xl">🎉</span>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xl font-black font-outfit tracking-tight always-white">{stats.eventsPlanned}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5 always-gray-200">Events Planned</span>
              </div>
            </div>

            {/* Stats Card 2 */}
            <div className={`p-5 rounded-2xl border backdrop-blur-lg flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 ${
              isLight 
                ? 'bg-white/12 border-white/20 shadow-lg shadow-emerald-900/5 hover:border-emerald-500/30 hover:shadow-xl' 
                : 'bg-[#0d1117]/25 border-white/5 shadow-xl hover:border-emerald-500/30 hover:shadow-2xl'
            }`}>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 shadow-md shadow-emerald-500/25 flex items-center justify-center shrink-0 select-none">
                <span className="text-xl">🏰</span>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xl font-black font-outfit tracking-tight always-white">{stats.topVenues}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5 always-gray-200">Top Venues</span>
              </div>
            </div>

            {/* Stats Card 3 */}
            <div className={`p-5 rounded-2xl border backdrop-blur-lg flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 ${
              isLight 
                ? 'bg-white/12 border-white/20 shadow-lg shadow-amber-900/5 hover:border-amber-500/30 hover:shadow-xl' 
                : 'bg-[#0d1117]/25 border-white/5 shadow-xl hover:border-amber-500/30 hover:shadow-2xl'
            }`}>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 shadow-md shadow-amber-500/25 flex items-center justify-center text-white shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xl font-black font-outfit tracking-tight always-white">{stats.happyClients}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5 always-gray-200">Happy Clients</span>
              </div>
            </div>

            {/* Stats Card 4 */}
            <div className={`p-5 rounded-2xl border backdrop-blur-lg flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 ${
              isLight 
                ? 'bg-white/12 border-white/20 shadow-lg shadow-rose-900/5 hover:border-rose-500/30 hover:shadow-xl' 
                : 'bg-[#0d1117]/25 border-white/5 shadow-xl hover:border-rose-500/30 hover:shadow-2xl'
            }`}>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-600 shadow-md shadow-rose-500/25 flex items-center justify-center text-white shrink-0">
                <Star className="w-6 h-6 fill-white stroke-none" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xl font-black font-outfit tracking-tight always-white">{stats.clientRating}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5 always-gray-200">Customer Rating</span>
              </div>
            </div>
          </div>

        </div>

        {/* Beautiful wavy bottom shape divider */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-20">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-8 sm:h-12 md:h-16">
            <path 
              d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" 
              className={isLight ? "fill-white" : "fill-[#0d0f14]"}
            ></path>
          </svg>
        </div>
      </div>

      {/* 4. About Us Section (1 in image) */}
      <section id="about" className={`py-20 border-t ${
        isLight ? 'bg-white border-gray-100' : 'bg-[#0d0f14] border-white/5'
      }`}>
        <div className="max-w-7xl mx-auto px-6">
          


          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
            
            {/* Description Details */}
            <div className="lg:col-span-7 text-left flex flex-col gap-3">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#6366f1] dark:text-[#818cf8]">
                ABOUT US
              </span>
              <h2 className="text-3xl md:text-4.5xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.15]">
                Making Every Event Extraordinary <span className="text-[#6366f1] dark:text-[#818cf8]">in Udaipur</span>
              </h2>
              <div className="w-16 h-[3px] bg-[#6366f1] dark:bg-[#818cf8] rounded-full my-1.5"></div>
              <p className={`text-xs md:text-[13.5px] leading-relaxed font-normal mt-2 ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>
                At JAGAH Udaipur, we believe every event should be extraordinary and stress-free. We combine technology and creativity to help you plan perfect events, from weddings to corporate gatherings. Our smart algorithms connect you with the best venues and vendors in Udaipur, keeping budget and guest quotas aligned.
              </p>
            </div>

            {/* Graphic cover image */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-white/5 shadow-2xl aspect-video lg:aspect-square max-h-[300px] w-full">
                <img
                  src="/udaipur_palace.png"
                  alt="About Us Lake Palace"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent"></div>
              </div>
            </div>

          </div>

          {/* Subheading: Why Choose Us */}
          <div className="mt-14 mb-8 text-left">
            <h3 className="text-xl md:text-2.5xl font-extrabold text-gray-900 dark:text-white">
              Why choose us ?
            </h3>
            <div className="w-12 h-[3px] bg-[#6366f1] dark:bg-[#818cf8] rounded-full mt-2.5"></div>
          </div>          {/* Grid of 6 visual cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {[
              {
                title: 'Smart AI Planning',
                desc: 'AI-powered suggestions and timeline planning for your perfect event.',
                icon: Sparkles,
                color: 'from-purple-500 to-indigo-500',
                watermark: '01',
                textColor: 'text-purple-600 dark:text-purple-400',
                hoverClass: 'hover:border-purple-300 hover:shadow-purple-500/10 hover:shadow-2xl',
                darkHoverClass: 'hover:border-purple-500/30 hover:shadow-purple-500/5 hover:bg-[#12131e]/20'
              },
              {
                title: 'Heritage Venues',
                desc: "Exclusive partnerships and booking at Udaipur's premier palaces and lake resorts.",
                icon: Building,
                color: 'from-indigo-600 to-blue-500',
                watermark: '02',
                textColor: 'text-indigo-600 dark:text-indigo-400',
                hoverClass: 'hover:border-indigo-300 hover:shadow-indigo-500/10 hover:shadow-2xl',
                darkHoverClass: 'hover:border-indigo-500/30 hover:shadow-indigo-500/5 hover:bg-[#101322]/20'
              },
              {
                title: 'Verified Vendors',
                desc: "We connect you with trusted local decorators, caterers, and artists in Udaipur.",
                icon: Users,
                color: 'from-emerald-500 to-teal-500',
                watermark: '03',
                textColor: 'text-emerald-600 dark:text-emerald-400',
                hoverClass: 'hover:border-emerald-300 hover:shadow-emerald-500/10 hover:shadow-2xl',
                darkHoverClass: 'hover:border-emerald-500/30 hover:shadow-emerald-500/5 hover:bg-[#0c1613]/20'
              },
              {
                title: 'Budget Optimizer',
                desc: 'Smart cost-tracking algorithms to maximize value and avoid overspending.',
                icon: Receipt,
                color: 'from-pink-500 to-rose-500',
                watermark: '04',
                textColor: 'text-pink-600 dark:text-pink-400',
                hoverClass: 'hover:border-pink-300 hover:shadow-pink-500/10 hover:shadow-2xl',
                darkHoverClass: 'hover:border-pink-500/30 hover:shadow-pink-500/5 hover:bg-[#1c1219]/20'
              },
              {
                title: 'Royal Themes',
                desc: 'Bespoke decor concepts blending modern design with Rajasthani heritage.',
                icon: Palette,
                color: 'from-amber-500 to-orange-500',
                watermark: '05',
                textColor: 'text-amber-600 dark:text-amber-400',
                hoverClass: 'hover:border-amber-300 hover:shadow-amber-500/10 hover:shadow-2xl',
                darkHoverClass: 'hover:border-amber-500/30 hover:shadow-amber-500/5 hover:bg-[#1f1811]/20'
              },
              {
                title: 'Live Tracking',
                desc: 'Live timeline tracking and direct communication channels for your event.',
                icon: Calendar,
                color: 'from-blue-500 to-sky-500',
                watermark: '06',
                textColor: 'text-blue-600 dark:text-blue-400',
                hoverClass: 'hover:border-blue-300 hover:shadow-blue-500/10 hover:shadow-2xl',
                darkHoverClass: 'hover:border-blue-500/30 hover:shadow-blue-500/5 hover:bg-[#101824]/20'
              }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div 
                  key={idx} 
                  className={`group relative p-8 rounded-3xl border text-center flex flex-col items-center gap-5 transition-all duration-350 hover:-translate-y-1.5 z-10 overflow-hidden ${
                    isLight 
                      ? `bg-white border-slate-100 shadow-[0_15px_30px_rgba(0,0,0,0.03)] ${item.hoverClass}` 
                      : `bg-[#0d1117]/45 backdrop-blur-md border-white/5 shadow-2xl shadow-black/10 ${item.darkHoverClass}`
                  }`}
                >


                  {/* Icon Wrapper */}
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${item.color} shadow-lg flex items-center justify-center text-white shrink-0 transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Text Details */}
                  <div className="mt-1">
                    <h3 className="text-[14.5px] font-extrabold text-gray-900 dark:text-white mb-2 leading-snug">
                      {item.title}
                    </h3>
                    <p className={`text-[12px] leading-relaxed font-semibold max-w-[220px] mx-auto ${
                      isLight ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 4.5 How It Works Section */}
      <section id="how-it-works" className={`py-20 border-t transition-colors ${
        isLight ? 'bg-gray-50/50 border-gray-100' : 'bg-[#0b0c10] border-white/5'
      }`}>
        <div className="max-w-7xl mx-auto px-6 text-center">
          
          <div className="max-w-2xl mx-auto mb-16 flex flex-col items-center">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#6366f1] dark:text-[#818cf8] mb-2">
              HOW IT WORKS
            </span>
            <h2 className="text-2xl md:text-3.5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Plan Your Dream Event in 3 Easy Steps
            </h2>
            <div className="w-12 h-[3px] bg-[#6366f1] dark:bg-[#818cf8] rounded-full mt-4"></div>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mt-8">
            {/* Dashed Connecting Line for Desktop */}
            <div className="hidden md:block absolute top-[64px] left-[15%] right-[15%] h-[2px] border-t-2 border-dashed border-slate-200 dark:border-white/10 z-0"></div>

            {[
              {
                step: 'Step 1',
                title: 'Tell Us Your Requirements',
                desc: 'Tell us your event requirements',
                icon: CheckSquare,
                color: 'from-blue-500 to-sky-400',
                watermark: '01',
                textColor: 'text-blue-600 dark:text-blue-400',
                hoverClass: 'hover:border-blue-300 hover:shadow-blue-500/10 hover:shadow-2xl',
                darkHoverClass: 'hover:border-blue-500/30 hover:shadow-blue-500/5 hover:bg-[#101824]/20'
              },
              {
                step: 'Step 2',
                title: 'AI Smart Suggestions',
                desc: 'AI suggests venues , theme , catering etc.',
                icon: Sparkles,
                color: 'from-amber-500 to-yellow-400',
                watermark: '02',
                textColor: 'text-amber-600 dark:text-amber-400',
                hoverClass: 'hover:border-amber-300 hover:shadow-amber-500/10 hover:shadow-2xl',
                darkHoverClass: 'hover:border-amber-500/30 hover:shadow-amber-500/5 hover:bg-[#1f1811]/20'
              },
              {
                step: 'Step 3',
                title: 'Book & Manage Effortlessly',
                desc: 'Book and manage everything in one place.',
                icon: Building,
                color: 'from-violet-500 to-fuchsia-400',
                watermark: '03',
                textColor: 'text-violet-600 dark:text-violet-400',
                hoverClass: 'hover:border-violet-300 hover:shadow-violet-500/10 hover:shadow-2xl',
                darkHoverClass: 'hover:border-violet-500/30 hover:shadow-violet-500/5 hover:bg-[#12131e]/20'
              }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div 
                  key={idx} 
                  className={`group relative p-8 rounded-3xl border text-center flex flex-col items-center gap-5 transition-all duration-350 hover:-translate-y-1.5 z-10 overflow-hidden ${
                    isLight 
                      ? `bg-white border-slate-100 shadow-[0_15px_30px_rgba(0,0,0,0.03)] ${item.hoverClass}` 
                      : `bg-[#0d1117]/45 backdrop-blur-md border-white/5 shadow-2xl shadow-black/10 ${item.darkHoverClass}`
                  }`}
                >
                  {/* Step Watermark */}
                  <div className="absolute -top-3 -right-2 text-8xl font-black tracking-tighter opacity-[0.05] dark:opacity-[0.02] select-none text-gray-900 dark:text-white">
                    {item.watermark}
                  </div>

                  <span className={`text-[10px] font-black uppercase tracking-widest ${item.textColor}`}>
                    {item.step}
                  </span>

                  {/* Icon Wrapper */}
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${item.color} shadow-lg flex items-center justify-center text-white shrink-0 transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Text Details */}
                  <div className="mt-1">
                    <h3 className="text-[14.5px] font-extrabold text-gray-900 dark:text-white mb-2 leading-snug">
                      {item.title}
                    </h3>
                    <p className={`text-[12px] leading-relaxed font-semibold max-w-[220px] mx-auto ${
                      isLight ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 5. Services Section (2 in image) */}
      <section id="services" className={`py-20 border-t ${
        isLight ? 'bg-white border-gray-100' : 'bg-[#090b0f] border-white/5'
      }`}>
        <div className="max-w-7xl mx-auto px-6 text-center">
          


          <div className="max-w-3xl mx-auto mb-16 flex flex-col items-center">
            {/* Centered Badge with Sparkles */}
            <div className="inline-flex items-center gap-2 mb-3.5 select-none">
              <span className="opacity-25 dark:opacity-10 text-gray-400 dark:text-white">—</span>
              <span className="opacity-25 dark:opacity-10 text-gray-400 dark:text-white">—</span>
              <Sparkles className="w-3.5 h-3.5 text-[#6366f1] dark:text-[#818cf8]" />
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#6366f1] dark:text-[#818cf8]">
                OUR SERVICES
              </span>
              <span className="opacity-25 dark:opacity-10 text-gray-400 dark:text-white">—</span>
              <span className="opacity-25 dark:opacity-10 text-gray-400 dark:text-white">—</span>
            </div>

            {/* Main Title */}
            <h2 className="text-3xl md:text-[40px] font-black tracking-tight text-gray-900 dark:text-white leading-[1.15] mb-5">
              Everything You Need for <span className="text-[#6366f1] dark:text-[#818cf8]">Perfect Events</span>
            </h2>

            {/* Description Subheading */}
            <p className={`text-xs md:text-[14px] leading-relaxed font-semibold max-w-2xl ${
              isLight ? 'text-gray-505' : 'text-gray-400'
            }`}>
              From venues to vendors, budgets to timelines – our AI-powered platform handles every detail to make your event in Udaipur truly unforgettable.
            </p>
          </div>

          {/* Grid of 8 Service cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 text-center">
            {[
              { title: 'Event Planning', desc: 'Complete event planning tailored to your needs.', icon: Calendar, color: 'from-purple-500 to-indigo-500', textColor: 'text-purple-600 dark:text-purple-400', watermark: '01', hoverClass: 'hover:border-purple-300 hover:shadow-purple-500/10 hover:shadow-2xl', darkHoverClass: 'hover:border-purple-500/30 hover:shadow-purple-500/5 hover:bg-[#12131e]/20' },
              { title: 'Venue Selection', desc: 'Find the perfect venue for your event.', icon: Building, color: 'from-emerald-500 to-teal-500', textColor: 'text-emerald-600 dark:text-emerald-400', watermark: '02', hoverClass: 'hover:border-emerald-300 hover:shadow-emerald-500/10 hover:shadow-2xl', darkHoverClass: 'hover:border-emerald-500/30 hover:shadow-emerald-500/5 hover:bg-[#0c1613]/20' },
              { title: 'Vendor Management', desc: 'We connect you with trusted vendors.', icon: Users, color: 'from-amber-500 to-orange-500', textColor: 'text-amber-600 dark:text-amber-400', watermark: '03', hoverClass: 'hover:border-amber-300 hover:shadow-amber-500/10 hover:shadow-2xl', darkHoverClass: 'hover:border-amber-500/30 hover:shadow-amber-500/5 hover:bg-[#1f1811]/20' },
              { title: 'Budget Management', desc: 'Smart budget planning and tracking.', icon: Receipt, color: 'from-pink-500 to-rose-500', textColor: 'text-pink-600 dark:text-pink-400', watermark: '04', hoverClass: 'hover:border-pink-300 hover:shadow-pink-500/10 hover:shadow-2xl', darkHoverClass: 'hover:border-pink-500/30 hover:shadow-pink-500/5 hover:bg-[#1c1219]/20' },
              { title: 'Catering Services', desc: 'Delicious menus for every occasion.', icon: ChefHat, color: 'from-blue-500 to-indigo-600', textColor: 'text-blue-600 dark:text-blue-400', watermark: '05', hoverClass: 'hover:border-blue-300 hover:shadow-blue-500/10 hover:shadow-2xl', darkHoverClass: 'hover:border-blue-500/30 hover:shadow-blue-500/5 hover:bg-[#101824]/20' },
              { title: 'Decoration', desc: 'Beautiful themes and creative decor.', icon: Palette, color: 'from-rose-500 to-pink-500', textColor: 'text-rose-600 dark:text-rose-400', watermark: '06', hoverClass: 'hover:border-rose-300 hover:shadow-rose-500/10 hover:shadow-2xl', darkHoverClass: 'hover:border-rose-500/30 hover:shadow-rose-500/5 hover:bg-[#1d1214]/20' },
              { title: 'Entertainment', desc: 'Live music, DJs, artists and more.', icon: Wine, color: 'from-indigo-600 to-purple-600', textColor: 'text-indigo-600 dark:text-indigo-400', watermark: '07', hoverClass: 'hover:border-indigo-300 hover:shadow-indigo-500/10 hover:shadow-2xl', darkHoverClass: 'hover:border-indigo-500/30 hover:shadow-indigo-500/5 hover:bg-[#101322]/20' },
              { title: 'Guest Management', desc: 'Invitations, RSVPs and guest coordination.', icon: Mail, color: 'from-teal-500 to-emerald-500', textColor: 'text-teal-600 dark:text-teal-400', watermark: '08', hoverClass: 'hover:border-teal-300 hover:shadow-teal-500/10 hover:shadow-2xl', darkHoverClass: 'hover:border-teal-500/30 hover:shadow-teal-500/5 hover:bg-[#0c1817]/20' }
            ].map((srv, idx) => {
              const Icon = srv.icon;
              return (
                <div 
                  key={idx} 
                  className={`group relative p-8 rounded-3xl border text-center flex flex-col items-center gap-5 transition-all duration-350 hover:-translate-y-1.5 z-10 overflow-hidden ${
                    isLight 
                      ? `bg-white border-slate-100 shadow-[0_15px_30px_rgba(0,0,0,0.03)] ${srv.hoverClass}` 
                      : `bg-[#0d1117]/45 backdrop-blur-md border-white/5 shadow-2xl shadow-black/10 ${srv.darkHoverClass}`
                  }`}
                >

                  {/* Icon Wrapper */}
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${srv.color} shadow-lg flex items-center justify-center text-white shrink-0 transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Text Details */}
                  <div className="mt-1">
                    <h3 className="text-[14.5px] font-extrabold text-gray-900 dark:text-white mb-2 leading-snug">
                      {srv.title}
                    </h3>
                    <p className={`text-[12px] leading-relaxed font-semibold max-w-[220px] mx-auto ${
                      isLight ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {srv.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 6. Venues Section (3 in image) */}
      <section id="venues" className={`py-20 border-t ${
        isLight ? 'bg-gray-50/50 border-gray-100' : 'bg-[#0b0e14] border-white/5'
      }`}>
        <div className="max-w-7xl mx-auto px-6 text-center">
          


          <div className="max-w-4xl mx-auto mb-12 flex flex-col items-center">
            {/* Centered Badge with Landmark Icon */}
            <div className="inline-flex items-center gap-2 mb-3.5 select-none">
              <span className="opacity-25 dark:opacity-10 text-gray-400 dark:text-white">—</span>
              <span className="opacity-25 dark:opacity-10 text-gray-400 dark:text-white">—</span>
              <Landmark className="w-3.5 h-3.5 text-[#6366f1] dark:text-[#818cf8]" />
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#6366f1] dark:text-[#818cf8]">
                OUR VENUES
              </span>
              <span className="opacity-25 dark:opacity-10 text-gray-400 dark:text-white">—</span>
              <span className="opacity-25 dark:opacity-10 text-gray-400 dark:text-white">—</span>
            </div>

            {/* Main Title */}
            <h2 className="text-3xl md:text-[40px] font-black tracking-tight text-gray-900 dark:text-white leading-[1.15] mb-5">
              Discover <span className="text-[#6366f1] dark:text-[#818cf8]">Udaipur's</span> Finest Event Venues
            </h2>

            {/* Description Subheading */}
            <p className={`text-xs md:text-[14.5px] leading-relaxed font-semibold max-w-3xl ${
              isLight ? 'text-gray-500' : 'text-gray-400'
            }`}>
              Explore handpicked heritage palaces, luxury resorts, lakeside destinations, and premium banquet venues across Udaipur. Our AI-powered platform helps you find the perfect venue based on your budget, guest count, and event style.
            </p>
          </div>


          {/* Venues grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
            {filteredVenues.map((venue, idx) => (
              <div
                key={idx}
                className={`rounded-2xl overflow-hidden border flex flex-col group h-full transition-all duration-300 hover:-translate-y-1.5 ${
                  isLight
                    ? 'bg-white border-gray-100 shadow-md hover:shadow-xl'
                    : 'bg-[#0d1117] border-white/5 shadow-lg hover:shadow-2xl'
                }`}
              >
                <div className="relative h-48 w-full overflow-hidden border-b border-white/5">
                  <img
                    src={venue.img}
                    alt={venue.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-amber-400 text-[10px] font-black px-2 py-1 rounded-lg flex items-center gap-1 border border-white/10">
                    <Star className="w-3 h-3 fill-amber-400 stroke-none" />
                    {venue.rating}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-extrabold leading-tight mb-1 text-gray-800 dark:text-white">{venue.name}</h3>
                    <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wide block mb-3">{venue.type}</span>
                    
                    <div className="flex flex-col gap-1.5 text-[10.5px] text-gray-500 dark:text-gray-400 font-semibold">
                      <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#1d4ed8] shrink-0" /> {venue.location}</span>
                      <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-[#1d4ed8] shrink-0" /> Capacity: {venue.capacity} Guests</span>
                    </div>
                  </div>

                  {user?.role === 'admin' ? (
                    <Link
                      href={`/venues?id=${venue.id}`}
                      className="w-full py-2.5 border border-[#1d4ed8]/20 hover:border-[#1d4ed8] bg-[#1d4ed8]/5 hover:bg-[#1d4ed8] text-[#1d4ed8] hover:text-white font-bold text-[10px] rounded-xl text-center cursor-pointer transition-all uppercase tracking-wider mt-2"
                    >
                      View Details
                    </Link>
                  ) : (
                    <Link
                      href={user ? `/venues?id=${venue.id}` : '/login'}
                      className="w-full py-2.5 border border-[#1d4ed8]/20 hover:border-[#1d4ed8] bg-[#1d4ed8]/5 hover:bg-[#1d4ed8] text-[#1d4ed8] hover:text-white font-bold text-[10px] rounded-xl text-center cursor-pointer transition-all uppercase tracking-wider mt-2"
                    >
                      Book Venue
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Show All Venues Button */}
          <div className="mt-12 flex justify-center">
            <Link
              href={
                user
                  ? (user.role === 'admin' ? '/admin?tab=venues' : '/venues')
                  : '/login'
              }
              className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue-500/10 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
            >
              Show All Venues
            </Link>
          </div>

        </div>
      </section>

      {/* 7. Events Section (4 in image) */}
      <section id="events" className={`py-20 border-t ${
        isLight ? 'bg-white border-gray-100' : 'bg-[#090b0f] border-white/5'
      }`}>
        <div className="max-w-7xl mx-auto px-6 text-center">

          <div className="max-w-4xl mx-auto mb-16 flex flex-col items-center">
            {/* Centered Badge with Calendar Icon */}
            <div className="inline-flex items-center gap-2 mb-3.5 select-none">
              <span className="opacity-25 dark:opacity-10 text-gray-400 dark:text-white">—</span>
              <span className="opacity-25 dark:opacity-10 text-gray-400 dark:text-white">—</span>
              <Calendar className="w-3.5 h-3.5 text-[#6366f1] dark:text-[#818cf8]" />
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#6366f1] dark:text-[#818cf8]">
                OUR EVENTS
              </span>
              <span className="opacity-25 dark:opacity-10 text-gray-400 dark:text-white">—</span>
              <span className="opacity-25 dark:opacity-10 text-gray-400 dark:text-white">—</span>
            </div>

            {/* Main Title */}
            <h2 className="text-3xl md:text-[40px] font-black tracking-tight text-gray-900 dark:text-white leading-[1.15] mb-5">
              Plan Every Moment. Celebrate <span className="text-[#6366f1] dark:text-[#818cf8]">Every Occasion.</span>
            </h2>

            {/* Description Subheading */}
            <p className={`text-xs md:text-[14.5px] leading-relaxed font-semibold max-w-3xl ${
              isLight ? 'text-gray-500' : 'text-gray-400'
            }`}>
              From intimate gatherings to grand celebrations, we help you plan and manage all types of events in Udaipur with ease and perfection.
            </p>
          </div>

          {/* Event Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {eventCategories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div
                  key={idx}
                  className={`rounded-[24px] overflow-hidden border flex flex-col h-full transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${
                    isLight
                      ? 'bg-white border-gray-100 shadow-md'
                      : 'bg-[#0d1117]/60 border-white/5 shadow-lg'
                  }`}
                >
                  {/* Top Image */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-white/5">
                    <img src={cat.img} alt={cat.title} className="w-full h-full object-cover" />
                  </div>

                  {/* Bottom details content */}
                  <div className="p-5 flex items-start gap-4 text-left flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border ${cat.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col justify-center min-w-0">
                      <h3 className="text-sm font-extrabold text-gray-800 dark:text-white leading-tight mb-1.5 truncate">
                        {cat.title}
                      </h3>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold leading-relaxed">
                        {cat.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>





      {/* 10. Premium Footer Section */}
      <footer className="w-full bg-[#0d0f14] text-gray-400 border-t border-white/5 pt-16 pb-6 text-xs">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-5 gap-10 text-left mb-12">
          
          {/* Logo & Intro */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <Link href="/" className="cursor-pointer">
              <LogoBrand isDarkTheme={!isLight} boxSize="w-8 h-8" />
            </Link>
            <p className="text-[11px] text-gray-500 leading-relaxed max-w-sm">
              AI-powered event planning platform helping you create unforgettable memories in the beautiful city of Udaipur.
            </p>
            <div className="flex items-center gap-3 mt-2">
              <a href="#" className="w-7 h-7 rounded-full bg-white/5 hover:bg-[#1d4ed8] flex items-center justify-center transition-colors"><FacebookIcon className="w-3.5 h-3.5" /></a>
              <a href="#" className="w-7 h-7 rounded-full bg-white/5 hover:bg-[#1d4ed8] flex items-center justify-center transition-colors"><InstagramIcon className="w-3.5 h-3.5" /></a>
              <a href="#" className="w-7 h-7 rounded-full bg-white/5 hover:bg-[#1d4ed8] flex items-center justify-center transition-colors"><TwitterIcon className="w-3.5 h-3.5" /></a>
              <a href="#" className="w-7 h-7 rounded-full bg-white/5 hover:bg-[#1d4ed8] flex items-center justify-center transition-colors"><LinkedinIcon className="w-3.5 h-3.5" /></a>
            </div>
          </div>

          {/* Quick Links (removed blog and contact) */}
          <div className="flex flex-col gap-3">
            <h4 className="text-[11px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">Quick Links</h4>
            <div className="flex flex-col gap-2.5 text-[11px] text-gray-500 font-semibold">
              <Link href="/" onClick={() => setActiveNav('Home')} className="hover:text-gray-900 dark:hover:text-white transition-colors">Home</Link>
              <a href="#about" onClick={(e) => { setActiveNav('About Us'); handleScrollTo(e, 'about'); }} className="hover:text-gray-900 dark:hover:text-white transition-colors">About Us</a>
              <a href="#how-it-works" onClick={(e) => { setActiveNav('How It Works'); handleScrollTo(e, 'how-it-works'); }} className="hover:text-gray-900 dark:hover:text-white transition-colors">How It Works</a>
              <a href="#services" onClick={(e) => { setActiveNav('Services'); handleScrollTo(e, 'services'); }} className="hover:text-gray-900 dark:hover:text-white transition-colors">Services</a>
              <a href="#venues" onClick={(e) => { setActiveNav('Venues'); handleScrollTo(e, 'venues'); }} className="hover:text-gray-900 dark:hover:text-white transition-colors">Venues</a>
              <a href="#events" onClick={(e) => { setActiveNav('Events'); handleScrollTo(e, 'events'); }} className="hover:text-gray-900 dark:hover:text-white transition-colors">Events</a>
            </div>
          </div>

          {/* Features */}
          <div className="flex flex-col gap-3">
            <h4 className="text-[11px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">Features</h4>
            <div className="flex flex-col gap-2.5 text-[11px] text-gray-500 font-semibold">
              <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">AI Event Suggestions</a>
              <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Event Scheduling</a>
              <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Budget Management</a>
              <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Guest Management</a>
              <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Smart Analytics</a>
            </div>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col gap-3">
            <h4 className="text-[11px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">Contact Info</h4>
            <div className="flex flex-col gap-2.5 text-[11px] text-gray-500 dark:text-gray-400 font-semibold">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#1d4ed8] shrink-0" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#1d4ed8] shrink-0" />
                <span>support@aieventplanner.com</span>
              </div>
              <div className="flex items-start gap-2 leading-relaxed">
                <MapPin className="w-3.5 h-3.5 text-[#1d4ed8] mt-0.5 shrink-0" />
                <span>Udaipur, Rajasthan, India - 313001</span>
              </div>
            </div>
          </div>
        </div>


        {/* Bottom copyright details */}
        <div className="max-w-7xl mx-auto px-6 pt-4 text-center text-gray-600 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] font-semibold">
          <p>© {new Date().getFullYear()} JAGAH Udaipur. All Rights Reserved.</p>
          <p>Made for ❤️ Udaipur ❤️</p>
        </div>
      </footer>

      {/* Floating Theme Toggle FAB */}
      <button
        onClick={toggleTheme}
        type="button"
        className={`fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full border shadow-2xl flex items-center justify-center transition-all duration-300 cursor-pointer hover:scale-110 active:scale-95 ${
          isLight 
            ? 'bg-white border-indigo-100 text-gray-600 hover:bg-gray-100 shadow-indigo-600/10' 
            : 'bg-[#0d1117]/90 border-white/20 text-gray-300 hover:bg-[#151c2c] backdrop-blur-md shadow-black/50'
        }`}
        aria-label="Toggle Theme"
      >
        {isLight ? <Moon className="w-5 h-5 text-indigo-500" /> : <Sun className="w-5 h-5 text-amber-400" />}
      </button>
    </div>
  );
}
