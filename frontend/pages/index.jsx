import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Calendar, Sparkles, Shield, Receipt, Users, CheckSquare, PhoneCall, 
  ChevronRight, ChevronLeft, Sun, Moon, Check, ArrowRight, Tag, MapPin, Mail, 
  Search, Play, Heart, Cake, Building, GraduationCap, Wine, Star, MoreHorizontal,
  Phone, ChefHat, Palette
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
              { name: 'Services', href: '#services' },
              { name: 'Venues', href: '#venues' },
              { name: 'Events', href: '#events' }
            ].map((item) => {
              const isActive = activeNav === item.name;
              const colorClass = isActive
                ? 'text-[#5a2bd4] dark:text-indigo-400 font-extrabold border-b-2 border-[#5a2bd4] dark:border-indigo-400 pb-0.5'
                : `${isLight ? 'text-gray-600 hover:text-[#5a2bd4]' : 'text-gray-300 hover:text-white'} transition-all`;

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
                <span className="hidden sm:inline text-xs font-semibold">Welcome, <strong className="text-[#5a2bd4] dark:text-indigo-400">{user.name}</strong></span>
                <Link
                  href="/dashboard"
                  className={`px-5 py-2.5 text-xs font-bold rounded-xl border transition-all ${
                    isLight 
                      ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-sm' 
                      : 'bg-transparent border-white/10 hover:bg-white/5 text-slate-300 hover:text-white'
                  }`}
                >
                  Go to Dashboard
                </Link>
                {user.role !== 'admin' && (
                  <Link
                    href="/ai"
                    className="px-5 py-2.5 text-xs font-bold rounded-xl bg-[#5a2bd4] hover:bg-[#4b22b5] always-white transition-all"
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
                  className="px-5 py-2.5 text-xs font-bold rounded-xl bg-[#5a2bd4] hover:bg-[#4b22b5] always-white transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* 3. Hero Section (Udaipur City Palace Cover Sunset) */}
      <div className="relative min-h-[500px] md:min-h-[560px] flex items-center overflow-hidden pt-[72px] group/hero">
        <img
          src="/udaipur_palace.png"
          alt="Udaipur City Palace Sunset"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10"></div>

        {/* Hero Content */}
        <div className="relative max-w-7xl w-full mx-auto px-6 py-20 z-20 text-left flex flex-col justify-center animate-fade-in">
          {/* Pill Badge overlay */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#5a2bd4]/20 border border-[#5a2bd4]/30 always-indigo-200 text-[10px] font-semibold tracking-wide mb-5 w-fit">
            Made for Udaipur, Powered by AI ✨
          </div>

          <h1 className="text-4xl md:text-5.5xl font-extrabold tracking-tight leading-[1.1] max-w-3xl mb-4 always-white">
            Plan Your Perfect Event <br />in <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">Udaipur</span>
          </h1>

          <p className="always-gray-200 text-xs md:text-sm max-w-xl leading-relaxed mb-8 font-medium">
            AI-powered event planning to make your special moments seamless, memorable and extraordinary.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center w-fit">
            <Link
              href={user ? '/dashboard' : '/login'}
              className="px-6 py-3.5 text-xs font-bold rounded-xl bg-[#5a2bd4] hover:bg-[#4b22b5] always-white shadow-xl shadow-indigo-600/20 transition-all flex items-center gap-1.5 group cursor-pointer"
            >
              Plan Your Event Now
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#about"
              onClick={(e) => handleScrollTo(e, 'about')}
              className="px-6 py-3.5 text-xs font-bold rounded-xl bg-white/5 border border-white/20 hover:bg-white/10 always-white transition-all text-center flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white text-white shrink-0" />
              How It Works
            </a>
          </div>
        </div>
      </div>

      {/* 4. About Us Section (1 in image) */}
      <section id="about" className={`py-20 border-t ${
        isLight ? 'bg-gray-50/50 border-gray-100' : 'bg-[#0d0f14] border-white/5'
      }`}>
        <div className="max-w-7xl mx-auto px-6">
          


          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
            
            {/* Description Details */}
            <div className="lg:col-span-7 text-left flex flex-col gap-4">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                About Us
              </h2>
              <p className={`text-xs md:text-sm leading-relaxed font-bold ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>
                At JAGAH Udaipur, we believe every event should be extraordinary and stress-free.
              </p>
              <p className={`text-xs md:text-sm leading-relaxed ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                We combine technology and creativity to help you plan perfect events, from weddings to corporate gatherings. Our smart algorithms tailor vendor connections and venue selections to Udaipur's stunning heritage backdrop, keeping budget and guest quotas completely aligned.
              </p>
            </div>

            {/* Graphic cover image */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-white/5 shadow-2xl aspect-video lg:aspect-square max-h-[300px] w-full">
                <img
                  src="/udaipur_palace_light.png"
                  alt="About Us Lake Palace"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent"></div>
              </div>
            </div>

          </div>

          {/* Bottom row of 8 visual cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Smart AI Planning',
                desc: 'AI-powered suggestions and timeline planning for your perfect event.',
                icon: Sparkles,
                lightColor: 'text-purple-600',
                darkColor: 'text-purple-400',
                lightBg: 'bg-purple-50/80 border-purple-100',
                darkBg: 'bg-purple-950/30 border-purple-900/30'
              },
              {
                title: 'Heritage Venues',
                desc: "Exclusive partnerships and booking at Udaipur's premier palaces and lake resorts.",
                icon: Building,
                lightColor: 'text-indigo-600',
                darkColor: 'text-indigo-400',
                lightBg: 'bg-indigo-50/80 border-indigo-100',
                darkBg: 'bg-indigo-950/30 border-indigo-900/30'
              },
              {
                title: 'Verified Vendors',
                desc: "We connect you with trusted local decorators, caterers, and artists in Udaipur.",
                icon: Users,
                lightColor: 'text-emerald-600',
                darkColor: 'text-emerald-400',
                lightBg: 'bg-emerald-50/80 border-emerald-100',
                darkBg: 'bg-emerald-950/30 border-emerald-900/30'
              },
              {
                title: 'Budget Optimizer',
                desc: 'Smart cost-tracking algorithms to maximize value and avoid overspending.',
                icon: Receipt,
                lightColor: 'text-pink-600',
                darkColor: 'text-pink-400',
                lightBg: 'bg-pink-50/80 border-pink-100',
                darkBg: 'bg-pink-950/30 border-pink-900/30'
              },
              {
                title: 'Royal Themes',
                desc: 'Bespoke decor concepts blending modern design with Rajasthani heritage.',
                icon: Palette,
                lightColor: 'text-amber-600',
                darkColor: 'text-amber-400',
                lightBg: 'bg-amber-50/80 border-amber-100',
                darkBg: 'bg-amber-500/10 border-amber-500/20'
              },
              {
                title: 'Guest Concierge',
                desc: 'Seamless management of guest lists, RSVP tracking, and local hospitality.',
                icon: CheckSquare,
                lightColor: 'text-teal-600',
                darkColor: 'text-teal-400',
                lightBg: 'bg-teal-50/80 border-teal-100',
                darkBg: 'bg-teal-950/30 border-teal-900/30'
              },
              {
                title: 'Local Advisers',
                desc: 'Professional event managers offering expert local coordination in Udaipur.',
                icon: Star,
                lightColor: 'text-rose-600',
                darkColor: 'text-rose-400',
                lightBg: 'bg-rose-50/80 border-rose-100',
                darkBg: 'bg-rose-950/30 border-rose-900/30'
              },
              {
                title: 'Live Tracking',
                desc: 'Live timeline tracking and direct communication channels for your event.',
                icon: Calendar,
                lightColor: 'text-blue-600',
                darkColor: 'text-blue-400',
                lightBg: 'bg-blue-50/80 border-blue-100',
                darkBg: 'bg-blue-950/30 border-blue-900/30'
              }
            ].map((item, idx) => {
              const Icon = item.icon;
              const brandColor = isLight ? item.lightColor : item.darkColor;
              const cardBg = isLight ? item.lightBg : item.darkBg;
              return (
                <div 
                  key={idx} 
                  className={`p-5 rounded-2xl border text-left flex flex-col gap-3.5 shadow-sm transition-all duration-300 hover:-translate-y-1 ${
                    isLight 
                      ? 'bg-white border-gray-100 shadow-md hover:shadow-lg' 
                      : 'bg-[#0d1117]/50 border-white/5 shadow-none'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${cardBg}`}>
                    <Icon className={`w-5 h-5 ${brandColor}`} />
                  </div>
                  <div>
                    <h4 className={`text-[12px] font-black uppercase tracking-wider mb-1.5 ${brandColor}`}>{item.title}</h4>
                    <p className={`text-[11px] leading-relaxed ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>{item.desc}</p>
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
          


          <div className="max-w-2xl mx-auto mb-12 flex flex-col items-center">
            <h2 className="text-2xl md:text-3.5xl font-extrabold tracking-tight mb-2 text-gray-900 dark:text-white">Our Services</h2>
            <p className={`text-xs md:text-sm font-semibold ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
              Everything you need to plan the perfect event.
            </p>
            <div className="w-12 h-1 bg-[#5a2bd4] mx-auto rounded-full mt-4"></div>
          </div>

          {/* Grid of 8 Service cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {[
              { title: 'Event Planning', desc: 'Complete event planning tailored to your needs.', icon: Calendar, color: 'text-purple-500 bg-purple-500/5' },
              { title: 'Venue Selection', desc: 'Find the perfect venue for your event.', icon: Building, color: 'text-emerald-500 bg-emerald-500/5' },
              { title: 'Vendor Management', desc: 'We connect you with trusted vendors.', icon: Users, color: 'text-amber-500 bg-amber-500/5' },
              { title: 'Budget Management', desc: 'Smart budget planning and tracking.', icon: Receipt, color: 'text-pink-500 bg-pink-500/5' },
              { title: 'Catering Services', desc: 'Delicious menus for every occasion.', icon: ChefHat, color: 'text-blue-500 bg-blue-500/5' },
              { title: 'Decoration', desc: 'Beautiful themes and creative decor.', icon: Palette, color: 'text-rose-500 bg-rose-500/5' },
              { title: 'Entertainment', desc: 'Live music, DJs, artists and more.', icon: Wine, color: 'text-indigo-500 bg-indigo-500/5' },
              { title: 'Guest Management', desc: 'Invitations, RSVPs and guest coordination.', icon: Mail, color: 'text-teal-500 bg-teal-500/5' }
            ].map((srv, idx) => {
              const Icon = srv.icon;
              return (
                <div key={idx} className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${
                  isLight 
                    ? 'bg-gray-50 border-gray-100 hover:bg-white text-gray-800' 
                    : 'bg-[#0d1117]/40 border-white/5 hover:bg-[#0d1117]/80 text-gray-200'
                }`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${srv.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-wider mb-2 text-[#5a2bd4] dark:text-indigo-400">{srv.title}</h3>
                  <p className={`text-[11px] leading-relaxed ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                    {srv.desc}
                  </p>
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
          


          <div className="max-w-2xl mx-auto mb-8 flex flex-col items-center">
            <h2 className="text-2xl md:text-3.5xl font-extrabold tracking-tight mb-2 text-gray-900 dark:text-white">Our Venues</h2>
            <p className={`text-xs md:text-sm font-semibold ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
              Explore top venues in Udaipur for your perfect event.
            </p>
            <div className="w-12 h-1 bg-[#5a2bd4] mx-auto rounded-full mt-4"></div>
          </div>

          {/* Filtering Tab categories controls */}
          <div className="flex justify-center flex-wrap gap-2 mb-10 text-xs font-bold">
            {['All Types', 'Wedding', 'Corporate', 'Party', 'Conference'].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedVenueCat(category)}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer border ${
                  selectedVenueCat === category
                    ? 'bg-[#5a2bd4] border-[#5a2bd4] text-white shadow-md'
                    : isLight
                    ? 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                {category}
              </button>
            ))}
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
                      <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#5a2bd4] shrink-0" /> {venue.location}</span>
                      <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-[#5a2bd4] shrink-0" /> Capacity: {venue.capacity} Guests</span>
                    </div>
                  </div>

                  {user?.role === 'admin' ? (
                    <Link
                      href={`/venues?id=${venue.id}`}
                      className="w-full py-2.5 border border-[#5a2bd4]/20 hover:border-[#5a2bd4] bg-[#5a2bd4]/5 hover:bg-[#5a2bd4] text-[#5a2bd4] hover:text-white font-bold text-[10px] rounded-xl text-center cursor-pointer transition-all uppercase tracking-wider mt-2"
                    >
                      View Details
                    </Link>
                  ) : (
                    <Link
                      href={user ? `/venues?id=${venue.id}` : '/login'}
                      className="w-full py-2.5 border border-[#5a2bd4]/20 hover:border-[#5a2bd4] bg-[#5a2bd4]/5 hover:bg-[#5a2bd4] text-[#5a2bd4] hover:text-white font-bold text-[10px] rounded-xl text-center cursor-pointer transition-all uppercase tracking-wider mt-2"
                    >
                      Book Venue
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 7. Events Section (4 in image) */}
      <section id="events" className={`py-20 border-t ${
        isLight ? 'bg-white border-gray-100' : 'bg-[#090b0f] border-white/5'
      }`}>
        <div className="max-w-7xl mx-auto px-6 text-center">

          <div className="max-w-2xl mx-auto mb-12 flex flex-col items-center">
            <h2 className="text-2xl md:text-3.5xl font-extrabold tracking-tight mb-2 text-gray-900 dark:text-white">
              Explore Event Categories
            </h2>
            <p className={`text-xs md:text-sm font-semibold ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
              Find the perfect category tailored for your celebration in Udaipur.
            </p>
            <div className="w-12 h-1 bg-[#5a2bd4] mx-auto rounded-full mt-4"></div>
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



      {/* 9. Section: Statistics Banner Strip */}
      <section className={`w-full py-10 transition-colors border-t border-b ${
        isLight ? 'bg-[#f0ebff] border-gray-100' : 'bg-[#15122b]/50 border-white/5'
      }`}>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Events Planned', value: stats.eventsPlanned, icon: Calendar },
            { label: 'Happy Clients', value: stats.happyClients, icon: Users },
            { label: 'Top Venues', value: stats.topVenues, icon: MapPin },
            { label: 'Client Rating', value: stats.clientRating, icon: Star }
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="flex flex-col items-center text-center">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-white dark:bg-white/5 shadow-sm text-[#5a2bd4] dark:text-indigo-400`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <span className="text-xl md:text-2xl font-extrabold tracking-tight leading-none mb-1 text-[#5a2bd4] dark:text-indigo-300">
                  {stat.value}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                  {stat.label}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 10. Premium Footer Section */}
      <footer className="w-full bg-[#0d0f14] text-gray-400 border-t border-white/5 pt-16 pb-6 text-xs">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-5 gap-10 text-left mb-12">
          
          {/* Logo & Intro */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <Link href="/" className="cursor-pointer">
              <LogoBrand isDarkTheme={true} boxSize="w-8 h-8" />
            </Link>
            <p className="text-[11px] text-gray-500 leading-relaxed max-w-sm">
              AI-powered event planning platform helping you create unforgettable memories in the beautiful city of Udaipur.
            </p>
            <div className="flex items-center gap-3 mt-2">
              <a href="#" className="w-7 h-7 rounded-full bg-white/5 hover:bg-[#5a2bd4] flex items-center justify-center transition-colors"><FacebookIcon className="w-3.5 h-3.5" /></a>
              <a href="#" className="w-7 h-7 rounded-full bg-white/5 hover:bg-[#5a2bd4] flex items-center justify-center transition-colors"><InstagramIcon className="w-3.5 h-3.5" /></a>
              <a href="#" className="w-7 h-7 rounded-full bg-white/5 hover:bg-[#5a2bd4] flex items-center justify-center transition-colors"><TwitterIcon className="w-3.5 h-3.5" /></a>
              <a href="#" className="w-7 h-7 rounded-full bg-white/5 hover:bg-[#5a2bd4] flex items-center justify-center transition-colors"><LinkedinIcon className="w-3.5 h-3.5" /></a>
            </div>
          </div>

          {/* Quick Links (removed blog and contact) */}
          <div className="flex flex-col gap-3">
            <h4 className="text-[11px] font-bold always-white uppercase tracking-wider">Quick Links</h4>
            <div className="flex flex-col gap-2.5 text-[11px] text-gray-500 font-semibold">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <a href="#about" onClick={(e) => handleScrollTo(e, 'about')} className="hover:text-white transition-colors">About Us</a>
              <a href="#services" onClick={(e) => handleScrollTo(e, 'services')} className="hover:text-white transition-colors">Services</a>
              <a href="#venues" onClick={(e) => handleScrollTo(e, 'venues')} className="hover:text-white transition-colors">Venues</a>
              <a href="#events" onClick={(e) => handleScrollTo(e, 'events')} className="hover:text-white transition-colors">Events</a>
            </div>
          </div>

          {/* Services */}
          <div className="flex flex-col gap-3">
            <h4 className="text-[11px] font-bold always-white uppercase tracking-wider">Services</h4>
            <div className="flex flex-col gap-2.5 text-[11px] text-gray-500 font-semibold">
              <a href="#events" onClick={(e) => handleScrollTo(e, 'events')} className="hover:text-white transition-colors">Wedding Planning</a>
              <a href="#events" onClick={(e) => handleScrollTo(e, 'events')} className="hover:text-white transition-colors">Birthday Parties</a>
              <a href="#events" onClick={(e) => handleScrollTo(e, 'events')} className="hover:text-white transition-colors">Corporate Events</a>
              <a href="#events" onClick={(e) => handleScrollTo(e, 'events')} className="hover:text-white transition-colors">College Events</a>
              <a href="#events" onClick={(e) => handleScrollTo(e, 'events')} className="hover:text-white transition-colors">Private Parties</a>
              <a href="#events" onClick={(e) => handleScrollTo(e, 'events')} className="hover:text-white transition-colors">Custom Events</a>
            </div>
          </div>

          {/* Support */}
          <div className="flex flex-col gap-3">
            <h4 className="text-[11px] font-bold always-white uppercase tracking-wider">Support</h4>
            <div className="flex flex-col gap-2.5 text-[11px] text-gray-500 font-semibold">
              <a href="#" className="hover:text-white transition-colors">FAQ</a>
              <a href="#" className="hover:text-white transition-colors">Help Center</a>
              <a href="#" className="hover:text-white transition-colors">Terms & Conditions</a>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Refund Policy</a>
            </div>
          </div>
        </div>

        {/* Contact Info Detail strip */}
        <div className="max-w-7xl mx-auto px-6 pt-6 pb-2 border-t border-white/5 text-gray-500 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-semibold">
          <div className="flex flex-wrap justify-center gap-6">
            <span className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-[#5a2bd4]" /> +91 98765 43210</span>
            <span className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-[#5a2bd4]" /> support@aieventplanner.com</span>
            <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-[#5a2bd4]" /> Udaipur, Rajasthan, India - 313001</span>
          </div>
        </div>

        {/* Bottom copyright details */}
        <div className="max-w-7xl mx-auto px-6 pt-4 text-center text-gray-600 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] font-semibold">
          <p>© {new Date().getFullYear()} JAGAH Udaipur. All Rights Reserved.</p>
          <p>Made with ❤️ in Udaipur</p>
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
