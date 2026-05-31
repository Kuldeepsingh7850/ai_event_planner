import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Calendar, Sparkles, Shield, Receipt, Users, CheckSquare, PhoneCall, 
  ChevronRight, Sun, Moon, Check, ArrowRight, Tag, MapPin, Mail, 
  Search, Play, Heart, Cake, Building, GraduationCap, Wine, Star, MoreHorizontal,
  Phone, ChefHat, Palette
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

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

  // Filters State
  const [selectedVenueCat, setSelectedVenueCat] = useState('All Types');
  const [selectedEventCat, setSelectedEventCat] = useState('All Events');
  const [activeNav, setActiveNav] = useState('Home');

  // Venues Data
  const venuesList = [
    { name: 'The Leela Palace', type: 'Luxury Hotel', location: 'Lake Pichola, Udaipur', capacity: '300 - 500', rating: '4.8', img: '/udaipur_palace.png', categories: ['Wedding', 'Conference'] },
    { name: 'Fateh Garh Resort', type: 'Heritage Resort', location: 'Sajjangarh, Udaipur', capacity: '50 - 300', rating: '4.5', img: '/services_venues.png', categories: ['Wedding', 'Party'] },
    { name: 'Radisson Blu', type: 'Luxury Hotel', location: 'Rani Road, Udaipur', capacity: '100 - 400', rating: '4.5', img: '/udaipur_palace_light.png', categories: ['Corporate', 'Conference'] },
    { name: 'Taj Fateh Prakash Palace', type: 'Heritage Palace', location: 'City Palace Complex, Udaipur', capacity: '80 - 350', rating: '4.7', img: '/landing_wedding.png', categories: ['Wedding'] },
    { name: 'Shiv Niwas Palace', type: 'Heritage Hotel', location: 'City Palace, Udaipur', capacity: '100 - 350', rating: '4.6', img: '/services_unforgettable.png', categories: ['Corporate'] },
    { name: 'Ananta Resort', type: 'Luxury Resort', location: 'Kodiyat Road, Udaipur', capacity: '50 - 300', rating: '4.4', img: '/services_scenarios.png', categories: ['Party'] }
  ];

  // Events Data
  const eventsList = [
    { title: 'Anisha & Piyush Wedding', category: 'Wedding', date: '24 May 2024', location: 'The Leela Palace, Udaipur', img: '/landing_wedding.png' },
    { title: 'Corporate Meet 2024', category: 'Corporate', date: '10 Jun 2024', location: 'Radisson Blu, Udaipur', img: '/landing_corporate.png' },
    { title: 'Summer Pool Party', category: 'Party', date: '15 Jun 2024', location: 'Fateh Garh Resort, Udaipur', img: '/landing_birthday.png' },
    { title: 'TechNova Conference', category: 'Conference', date: '15 Jul 2024', location: 'Hotel Lakend, Udaipur', img: '/landing_college.png' }
  ];

  const filteredVenues = selectedVenueCat === 'All Types'
    ? venuesList
    : venuesList.filter(v => v.categories.includes(selectedVenueCat));

  const filteredEvents = selectedEventCat === 'All Events'
    ? eventsList
    : eventsList.filter(e => e.category === selectedEventCat);

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
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Calendar className="w-4.5 h-4.5 always-white" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-extrabold tracking-wider leading-tight">JAGAH</span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">Udaipur</span>
            </div>
          </div>

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
                  onClick={() => setActiveNav(item.name)}
                  className={colorClass}
                >
                  {item.name}
                </a>
              );
            })}
          </div>

          {/* Right CTA / Auth Controls */}
          <div className="flex gap-3.5 items-center">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              type="button"
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isLight 
                  ? 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100' 
                  : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
              }`}
              aria-label="Toggle Theme"
            >
              {isLight ? <Moon className="w-4 h-4 text-indigo-500" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline text-xs font-semibold">Welcome, <strong className="text-[#5a2bd4] dark:text-indigo-400">{user.name}</strong></span>
                <Link
                  href="/dashboard"
                  className="px-4.5 py-2 text-xs font-bold rounded-xl bg-[#5a2bd4] hover:bg-[#4b22b5] always-white shadow-md transition-all animate-fade-in"
                >
                  Go to Dashboard
                </Link>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4.5 py-2 text-xs font-bold rounded-xl bg-[#5a2bd4] hover:bg-[#4b22b5] always-white shadow-md transition-all"
              >
                Sign In
              </Link>
            )}
          </div>
        </nav>
      </header>

      {/* 3. Hero Section (Lake Pichola Cover with sunset image) */}
      <div className="relative min-h-[500px] md:min-h-[560px] flex items-center overflow-hidden pt-[72px]">
        <img
          src="/udaipur_palace.png"
          alt="Udaipur City Palace at Sunset"
          className="absolute inset-0 w-full h-full object-cover brightness-[1.1] contrast-[1.02]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent"></div>

        {/* Hero Content */}
        <div className="relative max-w-7xl w-full mx-auto px-6 py-20 z-10 text-left flex flex-col justify-center animate-fade-in">
          {/* Tag badge overlay */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-white/10 text-indigo-300 text-[10px] font-bold uppercase tracking-wider mb-5 w-fit">
            <Sparkles className="w-3 h-3" />
            Plan Smarter, Celebrate Better
          </div>

          <h1 className="text-4xl md:text-5.5xl font-extrabold tracking-tight leading-[1.1] max-w-3xl mb-4 always-white">
            AI-Powered Event Planning <br />in <span className="text-[#818cf8]">Udaipur</span>
          </h1>

          <p className="always-gray-200 text-xs md:text-sm max-w-xl leading-relaxed mb-8 font-medium">
            From venues to vendors, we plan everything so you can enjoy every moment.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center w-fit">
            <Link
              href={user ? '/dashboard' : '/login'}
              className="px-6 py-3.5 text-xs font-bold rounded-xl bg-[#5a2bd4] hover:bg-[#4b22b5] always-white shadow-xl shadow-indigo-600/20 transition-all flex items-center gap-1.5 group"
            >
              Plan Your Event
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#venues"
              className="px-6 py-3.5 text-xs font-bold rounded-xl bg-white/5 border border-white/20 hover:bg-white/10 always-white transition-all text-center shrink-0"
            >
              Explore Venues
            </a>
          </div>
        </div>
      </div>

      {/* 4. About Us Section (1 in image) */}
      <section id="about" className={`py-20 border-t ${
        isLight ? 'bg-gray-50/50 border-gray-100' : 'bg-[#0d0f14] border-white/5'
      }`}>
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Breadcrumb bread crumbs */}
          <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2.5">
            <Link href="/" className="hover:text-[#5a2bd4]">Home</Link>
            <ChevronRight className="w-3 h-3 text-gray-400" />
            <span className="text-[#5a2bd4]">About Us</span>
          </div>

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
          
          <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2.5 justify-center">
            <Link href="/" className="hover:text-[#5a2bd4]">Home</Link>
            <ChevronRight className="w-3 h-3 text-gray-400" />
            <span className="text-[#5a2bd4]">Services</span>
          </div>

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
          
          <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2.5 justify-center">
            <Link href="/" className="hover:text-[#5a2bd4]">Home</Link>
            <ChevronRight className="w-3 h-3 text-gray-400" />
            <span className="text-[#5a2bd4]">Venues</span>
          </div>

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

                  <Link
                    href={user ? '/venues' : '/login'}
                    className="w-full py-2.5 border border-[#5a2bd4]/20 hover:border-[#5a2bd4] bg-[#5a2bd4]/5 hover:bg-[#5a2bd4] text-[#5a2bd4] hover:text-white font-bold text-[10px] rounded-xl text-center cursor-pointer transition-all uppercase tracking-wider mt-2"
                  >
                    Book Venue
                  </Link>
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
          
          <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2.5 justify-center">
            <Link href="/" className="hover:text-[#5a2bd4]">Home</Link>
            <ChevronRight className="w-3 h-3 text-gray-400" />
            <span className="text-[#5a2bd4]">Events</span>
          </div>

          <div className="max-w-2xl mx-auto mb-8 flex flex-col items-center">
            <h2 className="text-2xl md:text-3.5xl font-extrabold tracking-tight mb-2 text-gray-900 dark:text-white">Events</h2>
            <p className={`text-xs md:text-sm font-semibold ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
              Discover and explore amazing events in Udaipur.
            </p>
            <div className="w-12 h-1 bg-[#5a2bd4] mx-auto rounded-full mt-4"></div>
          </div>

          {/* Category filtering events list */}
          <div className="flex justify-center flex-wrap gap-2 mb-10 text-xs font-bold">
            {['All Events', 'Wedding', 'Corporate', 'Party', 'Conference'].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedEventCat(category)}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer border ${
                  selectedEventCat === category
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

          {/* Events cards rows */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-4xl mx-auto">
            {filteredEvents.map((evt, idx) => (
              <div
                key={idx}
                className={`rounded-2xl border p-4 flex gap-4 transition-all duration-300 hover:shadow-md ${
                  isLight
                    ? 'bg-gray-50 border-gray-100 hover:bg-white'
                    : 'bg-[#0d1117]/65 border-white/5 hover:bg-[#0d1117]/95'
                }`}
              >
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0 border border-white/5">
                  <img src={evt.img} alt={evt.title} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 flex flex-col justify-between py-0.5">
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white leading-tight">{evt.title}</h3>
                      <span className="bg-[#5a2bd4]/10 text-[#5a2bd4] border border-[#5a2bd4]/10 px-2 py-0.5 rounded text-[8px] font-black uppercase">
                        {evt.category}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 text-[10px] text-gray-500 dark:text-gray-400 font-semibold mt-1">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-[#5a2bd4] shrink-0" /> {evt.date}</span>
                      <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#5a2bd4] shrink-0" /> {evt.location}</span>
                    </div>
                  </div>

                  <Link
                    href={user ? `/events` : '/login'}
                    className="text-[10px] font-bold text-[#5a2bd4] hover:text-[#4b22b5] transition-colors flex items-center gap-0.5 uppercase tracking-wider w-fit"
                  >
                    View Details <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>



      {/* 9. Section: Statistics Banner Strip */}
      <section className={`w-full py-10 transition-colors border-t border-b ${
        isLight ? 'bg-[#f0ebff] border-gray-100' : 'bg-[#15122b]/50 border-white/5'
      }`}>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Events Planned', value: '500+', icon: Calendar },
            { label: 'Happy Clients', value: '1000+', icon: Users },
            { label: 'Top Venues', value: '50+', icon: MapPin },
            { label: 'Client Rating', value: '4.8/5', icon: Star }
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
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center">
                <Calendar className="w-4.5 h-4.5 always-white" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-bold always-white leading-tight">JAGAH</span>
                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Udaipur</span>
              </div>
            </div>
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
              <a href="#about" className="hover:text-white transition-colors">About Us</a>
              <a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#venues" className="hover:text-white transition-colors">Venues</a>
              <a href="#events" className="hover:text-white transition-colors">Events</a>
            </div>
          </div>

          {/* Services */}
          <div className="flex flex-col gap-3">
            <h4 className="text-[11px] font-bold always-white uppercase tracking-wider">Services</h4>
            <div className="flex flex-col gap-2.5 text-[11px] text-gray-500 font-semibold">
              <a href="#events" className="hover:text-white transition-colors">Wedding Planning</a>
              <a href="#events" className="hover:text-white transition-colors">Birthday Parties</a>
              <a href="#events" className="hover:text-white transition-colors">Corporate Events</a>
              <a href="#events" className="hover:text-white transition-colors">College Events</a>
              <a href="#events" className="hover:text-white transition-colors">Private Parties</a>
              <a href="#events" className="hover:text-white transition-colors">Custom Events</a>
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
          <p>© 2024 JAGAH Udaipur. All Rights Reserved.</p>
          <p>Made with ❤️ in Udaipur</p>
        </div>
      </footer>
    </div>
  );
}
