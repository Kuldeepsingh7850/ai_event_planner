import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { LogoBrand } from '../../components/Logo';
import {
  Sparkles,
  Users,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  Compass,
  Utensils,
  Palette,
  CheckCircle,
  FileText,
  Loader2,
  ListTodo,
  Check,
  Plus,
  Building,
  X
} from 'lucide-react';

export default function AIEventPlannerIntermediate() {
  const { authFetch } = useAuth();
  const { showToast } = useNotifications();
  const router = useRouter();

  // --- Form Input States ---
  const [eventTitle, setEventTitle] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('Udaipur, Rajasthan');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('17:00');
  const [guestCount, setGuestCount] = useState('');
  const [budget, setBudget] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  // --- UI States ---
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [chosenVenue, setChosenVenue] = useState(null); // Selected venue card state
  const [selectedVenue, setSelectedVenue] = useState(null); // venue details modal state

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!eventTitle.trim()) {
      return showToast('Please fill out the event title', 'warning');
    }
    if (!category) {
      return showToast('Please select an event category', 'warning');
    }
    if (!eventDate) {
      return showToast('Please select an event date', 'warning');
    }
    if (!guestCount) {
      return showToast('Please enter estimated guest count', 'warning');
    }
    if (!budget) {
      return showToast('Please enter target budget', 'warning');
    }

    setLoading(true);
    setSuggestions(null);
    setChosenVenue(null);
    setSelectedVenue(null);

    // Context query block
    const notesBlock = `Special requests: ${specialRequests}. Location: Udaipur, Rajasthan. Date: ${eventDate}`;

    try {
      const res = await authFetch('/ai/suggestions', {
        method: 'POST',
        body: JSON.stringify({
          title: eventTitle,
          eventType: category,
          budget: budget,
          guestCount: guestCount,
          location: location,
          time: eventTime,
          specialRequests: specialRequests,
          description: notesBlock
        })
      });

      if (res.ok) {
        const data = await res.json();
        // Use AI suggested venues if present, otherwise append local Udaipur venues
        data.venues = data.venues || getUdaipurVenues(budget, guestCount);
        setSuggestions(data);
        showToast('Suggestions generated successfully!', 'success');
      } else {
        const data = await res.json();
        throw new Error(data.message || 'Error communicating with AI services');
      }
    } catch (err) {
      showToast(err.message, 'error');
      // Construct clean local mock suggestions if connection times out or fails
      setTimeout(() => {
        setSuggestions({
          isMock: true,
          description: `A customized planning plan for your ${category.toLowerCase()} event "${eventTitle}" for ${guestCount} guests in ${location}.`,
          themes: [`Classic ${category}`, `${category} Elegance`, `Vibrant Rajasthan Theme`],
          decorations: [
            'Lush floral stage backdrop with color matching lights.',
            'Elegant entryway decorations with welcome signage.',
            'Table settings with matching table cloths and central flower vases.'
          ],
          foods: [
            'Welcome Drinks: Seasonal juices and mocktails.',
            'Starters: Paneer Tikka, Veg Poppers, and Crispy rolls.',
            'Main Buffet: Choice of North Indian dishes, Rajasthani specialties, Dal Makhani, Paneer butter masala, Butter rotis, and Jeera Rice.',
            'Desserts: Warm Gulab Jamun with ice cream.'
          ],
          timeline: shiftTimeline([
            '05:00 PM - Guest Welcoming & Welcome Drinks',
            '06:30 PM - Main Ceremony / Event Presentation',
            '08:00 PM - Opening of Dining Buffet',
            '09:30 PM - Musical session / Speeches',
            '10:30 PM - Event wrap up & return gifts'
          ], eventTime),
          budgetAllocation: [
            { category: 'Venue & Catering (40%)', amount: budget * 0.40, description: 'Venue rental and catering package.' },
            { category: 'Decoration & Theme (20%)', amount: budget * 0.20, description: 'Stage decor, flowers, and lighting setup.' },
            { category: 'Entertainment & DJ (15%)', amount: budget * 0.15, description: 'Sound system, emcee, or music performers.' },
            { category: 'Photography & Media (15%)', amount: budget * 0.15, description: 'Photo coverage and highlight clip editing.' },
            { category: 'Buffer & Planning (10%)', amount: budget * 0.10, description: 'Emergency buffer and digital invitations.' }
          ],
          tips: [
            'Book the selected venue at least 6 weeks in advance.',
            'Label food items properly to identify veg/non-veg selections.',
            'Confirm timeline slots with performers 3 days prior.'
          ],
          venues: getUdaipurVenues(budget, guestCount)
        });
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  const shiftTimeline = (timeline, startTimeStr) => {
    if (!timeline || !Array.isArray(timeline) || timeline.length === 0 || !startTimeStr) return timeline;
    
    const parts = startTimeStr.split(':');
    if (parts.length < 2) return timeline;
    const startHours = parseInt(parts[0]);
    const startMinutes = parseInt(parts[1]);
    if (isNaN(startHours) || isNaN(startMinutes)) return timeline;

    const getEntryText = (entry) => {
      if (!entry) return '';
      if (typeof entry === 'object') {
        return entry.name || entry.description || entry.time || JSON.stringify(entry);
      }
      return String(entry);
    };

    const firstEntry = timeline[0];
    const firstEntryText = getEntryText(firstEntry);
    const match = firstEntryText.match(/^(\d{2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return timeline;
    
    let origHours = parseInt(match[1]);
    const origMinutes = parseInt(match[2]);
    const ampm = match[3].toUpperCase();
    if (ampm === 'PM' && origHours < 12) origHours += 12;
    if (ampm === 'AM' && origHours === 12) origHours = 0;

    const diffMinutes = (startHours * 60 + startMinutes) - (origHours * 60 + origMinutes);

    return timeline.map(entry => {
      if (typeof entry === 'object') {
        const keysToTry = ['time', 'name', 'description'];
        let shiftedEntry = { ...entry };
        for (const key of keysToTry) {
          if (typeof entry[key] === 'string') {
            shiftedEntry[key] = entry[key].replace(/^(\d{2}):(\d{2})\s*(AM|PM)/i, (full, hh, mm, ap) => {
              let h = parseInt(hh);
              let m = parseInt(mm);
              let a = ap.toUpperCase();
              if (a === 'PM' && h < 12) h += 12;
              if (a === 'AM' && h === 12) h = 0;

              let totalMin = h * 60 + m + diffMinutes;
              totalMin = (totalMin + 1440) % 1440;

              let newH = Math.floor(totalMin / 60);
              let newM = totalMin % 60;
              let newAp = 'AM';
              if (newH >= 12) {
                newAp = 'PM';
                if (newH > 12) newH -= 12;
              }
              if (newH === 0) newH = 12;

              const newHStr = String(newH).padStart(2, '0');
              const newMStr = String(newM).padStart(2, '0');
              return `${newHStr}:${newMStr} ${newAp}`;
            });
          }
        }
        return shiftedEntry;
      }

      if (typeof entry !== 'string') return entry;

      return entry.replace(/^(\d{2}):(\d{2})\s*(AM|PM)/i, (full, hh, mm, ap) => {
        let h = parseInt(hh);
        let m = parseInt(mm);
        let a = ap.toUpperCase();
        if (a === 'PM' && h < 12) h += 12;
        if (a === 'AM' && h === 12) h = 0;

        let totalMin = h * 60 + m + diffMinutes;
        totalMin = (totalMin + 1440) % 1440;

        let newH = Math.floor(totalMin / 60);
        let newM = totalMin % 60;
        let newAp = 'AM';
        if (newH >= 12) {
          newAp = 'PM';
          if (newH > 12) newH -= 12;
        }
        if (newH === 0) newH = 12;

        const newHStr = String(newH).padStart(2, '0');
        const newMStr = String(newM).padStart(2, '0');
        return `${newHStr}:${newMStr} ${newAp}`;
      });
    });
  };

  const getUdaipurVenues = (b, guests) => {
    return [
      {
        id: 'leela',
        name: 'The Leela Palace Udaipur',
        rating: '4.8 ★',
        img: '/leela_palace.jpg',
        location: 'Lake Pichola, Udaipur',
        capacity: `${Math.round(guests * 0.8)} - ${Math.round(guests * 1.5)} Guests`,
        type: 'Luxury Palace Hotel',
        cost: b * 0.40,
        availability: 'Available',
        desc: 'Stunning luxury palace overlooking Lake Pichola. Features award-winning Mewari architecture, lake-view wedding lawns, and beautiful boat arrivals.'
      },
      {
        id: 'fateh',
        name: 'Fateh Garh Resort',
        rating: '4.5 ★',
        img: '/monsoon_palace.jpg',
        location: 'Sajjangarh, Udaipur',
        capacity: `${Math.round(guests * 0.7)} - ${Math.round(guests * 1.2)} Guests`,
        type: 'Heritage Fort Resort',
        cost: b * 0.30,
        availability: 'Available',
        desc: 'Perched on a scenic hilltop with panoramic views of the Aravalli range and lakes. Offers stone fort design and large open courtyards.'
      },
      {
        id: 'radisson',
        name: 'Radisson Blu Udaipur',
        rating: '4.5 ★',
        img: '/hero_udaipur_3.jpg',
        location: 'Rani Road, Udaipur',
        capacity: `${Math.round(guests * 0.5)} - ${Math.round(guests * 1.8)} Guests`,
        type: 'Luxury Hotel',
        cost: b * 0.35,
        availability: 'Available',
        desc: 'Modern luxury hotel sitting on the banks of Fateh Sagar Lake. Boasts spacious banquet options and rooftop party setups.'
      }
    ];
  };

  const handleSaveEvent = async () => {
    setLoading(true);
    try {
      const summaryDesc = `AI-Suggested setup. Budget segment allocation matching ${formatRupee(budget)}. Special notes: ${specialRequests || 'None'}`;
      
      const res = await authFetch('/create-event', {
        method: 'POST',
        body: JSON.stringify({
          title: eventTitle,
          description: summaryDesc,
          event_type: category,
          date: eventDate,
          time: eventTime,
          location: chosenVenue ? `${chosenVenue.name}, Udaipur` : location,
          budget: budget,
          guest_count: guestCount,
          theme: suggestions && suggestions.themes ? (typeof suggestions.themes[0] === 'object' ? (suggestions.themes[0].name || suggestions.themes[0].description || JSON.stringify(suggestions.themes[0])) : suggestions.themes[0]) : 'Royal / Traditional',
          timeline: suggestions ? (Array.isArray(suggestions.timeline) ? suggestions.timeline.map(item => typeof item === 'object' ? (item.time && item.description ? `${item.time} - ${item.description}` : item.name || item.description || JSON.stringify(item)) : String(item)) : []) : [],
          venue: chosenVenue || null
        })
      });

      if (res.ok) {
        showToast(`Event "${eventTitle}" created and saved successfully!`, 'success');
        router.push('/events');
      } else {
        const data = await res.json();
        throw new Error(data.message || 'Failed to register event in database');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 font-sans">
      
      {/* Page Header */}
      <div className="flex flex-col gap-1.5 items-start">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white dark:text-white">
          AI Event Planner
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Configure your details on the left to generate customized planning ideas, catering plans, and budget estimations instantly.
        </p>
      </div>

      {/* Two-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: FORM INPUTS (Col span 5) */}
        <div className="lg:col-span-5">
          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col gap-4 shadow-lg">
            <h3 className="text-xs font-black uppercase tracking-wider text-white border-b border-white/5 pb-2">
              📋 Plan Parameters
            </h3>

            <form onSubmit={handleGenerate} className="flex flex-col gap-4">
              
              {/* Event Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Event Title</label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="e.g. Birthday Party, Corporate Meetup"
                  className="w-full bg-white/3 border border-white/5 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-all font-medium"
                  required
                />
              </div>

              {/* Category selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Event Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white/3 border border-white/5 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer font-semibold"
                  required
                >
                  <option value="" disabled className="bg-[#151c2c] text-gray-400">Select Event Category</option>
                  {['Wedding', 'Birthday', 'Farewell', 'Corporate', 'Seminar', 'Conference', 'Gala', 'Festival', 'Other'].map(cat => (
                    <option key={cat} value={cat} className="bg-[#151c2c] text-white">{cat}</option>
                  ))}
                </select>
              </div>

              {/* Date & Start Time Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-500" />
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full bg-white/3 border border-white/5 rounded-xl pl-9 pr-2 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Start Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-500" />
                    <input
                      type="time"
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      className="w-full bg-white/3 border border-white/5 rounded-xl pl-9 pr-2 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer font-medium"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Guests & Budget Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Estimated Guests</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-500" />
                    <input
                      type="number"
                      value={guestCount}
                      onChange={(e) => setGuestCount(e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-full bg-white/3 border border-white/5 rounded-xl pl-9 pr-2 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-all font-medium"
                      min="1"
                      placeholder="e.g. 200"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Target Budget (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-gray-500">₹</span>
                    <input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-full bg-white/3 border border-white/5 rounded-xl pl-8 pr-2 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-all font-medium"
                      placeholder="e.g. 500000"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Special Requests / Notes</label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="e.g. Garden layout, traditional welcoming, music requirements..."
                  className="w-full h-24 bg-white/3 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-all resize-none font-medium leading-relaxed"
                />
              </div>

              {/* Generate suggestions CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/10 cursor-pointer transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating Plan suggestions...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Plan suggestions
                  </>
                )}
              </button>

            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: AI RECOMMENDATIONS PANEL (Col span 7) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {loading ? (
            /* Loading Spinner Panel */
            <div className="glass-panel p-12 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-4 text-center h-full min-h-[350px]">
              <Loader2 className="w-9 h-9 text-indigo-400 animate-spin" />
              <div>
                <h4 className="text-sm font-bold text-white">AI Coordinator is compiling options...</h4>
                <p className="text-xs text-gray-500 mt-1">Generating planning tips, food themes, decoration ideas, and schedules.</p>
              </div>
            </div>
          ) : !suggestions ? (
            /* Empty Placeholder Panel */
            <div className="glass-panel p-12 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-4 text-center h-full min-h-[350px]">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-1">
                <Compass className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">AI Planning Suggestions Panel</h4>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto leading-relaxed">
                  Fill in the event parameters on the left and trigger recommendations to see suggested themes, foods, budgets, and checklists.
                </p>
              </div>
            </div>
          ) : (
            /* Recommendations dashboard output */
            <div className="flex flex-col gap-5 animate-fade-in">
              
              {/* Card 1: Overview Summary */}
              <div className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col gap-2.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  AI Suggested Overview
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed bg-white/2 p-3 rounded-xl border border-white/5 italic">
                  "{renderItemSafely(suggestions.description)}"
                </p>
              </div>

              {/* Card 2: Suggested Udaipur Venues (NEW) */}
              <div className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col gap-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-indigo-400" />
                  Suggested Udaipur Venues
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-1">
                  {suggestions.venues && suggestions.venues.map((venue) => (
                    <div
                      key={venue.id}
                      className={`bg-white/2 border rounded-xl overflow-hidden flex flex-col justify-between hover:border-indigo-500/25 transition-all duration-300 shadow-sm ${
                        chosenVenue?.id === venue.id
                          ? 'border-indigo-500 ring-2 ring-indigo-500/50'
                          : 'border-white/5'
                      }`}
                    >
                      <div className="h-20 bg-[#151c2c] relative">
                        <img src={venue.img} alt={venue.name} className="w-full h-full object-cover" />
                        {chosenVenue?.id === venue.id && (
                          <div className="absolute top-2 right-2 bg-emerald-600 text-white rounded-full px-1.5 py-0.5 text-[8px] font-bold shadow-md">
                            Selected
                          </div>
                        )}
                      </div>
                      <div className="p-2 flex flex-col gap-1">
                        <div className="flex justify-between items-center text-[8px] bg-emerald-500/10 text-emerald-400 px-1 py-0.5 rounded w-fit font-bold">
                          {venue.rating}
                        </div>
                        <h4 className="text-[10px] font-black text-white leading-tight truncate">{venue.name}</h4>
                        <span className="text-[8px] text-gray-500 truncate">{venue.location}</span>
                        <div className="text-[9px] text-amber-400 font-bold mt-1">
                          {formatRupee(venue.cost)}
                        </div>
                      </div>
                      <div className="p-2 pt-0 border-t border-white/5 flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedVenue(venue)}
                          className="flex-1 py-1 text-[8px] bg-white/5 hover:bg-white/10 text-gray-300 font-bold border border-white/10 rounded-md cursor-pointer transition-colors"
                        >
                          Details
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setChosenVenue(venue);
                            showToast(`Selected "${venue.name}" as event venue!`, 'success');
                          }}
                          className={`flex-1 py-1 text-[8px] font-bold rounded-md cursor-pointer transition-colors ${
                            chosenVenue?.id === venue.id
                              ? 'bg-emerald-600 text-white'
                              : 'bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 border border-indigo-500/20'
                          }`}
                        >
                          {chosenVenue?.id === venue.id ? 'Selected' : 'Select'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 3: Design Styles & Catering Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Themes & Decor */}
                <div className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col gap-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-purple-400" />
                    Themes & Setup
                  </h4>
                  
                  {/* Theme badges */}
                  <div className="flex flex-wrap gap-1.5 mb-1">
                    {suggestions.themes && suggestions.themes.map((t, idx) => (
                      <span key={idx} className="bg-purple-500/5 border border-purple-500/10 text-purple-300 font-bold px-2 py-0.5 rounded-lg text-[9px] uppercase tracking-wide">
                        {renderItemSafely(t)}
                      </span>
                    ))}
                  </div>

                  <ul className="flex flex-col gap-2 border-t border-white/5 pt-2">
                    {suggestions.decorations && suggestions.decorations.map((decor, idx) => (
                      <li key={idx} className="text-[10px] text-gray-400 flex items-start gap-2 leading-relaxed">
                        <span className="text-purple-400 font-extrabold shrink-0">•</span>
                        {renderItemSafely(decor)}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Catering Feasts */}
                <div className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col gap-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Utensils className="w-4 h-4 text-emerald-400" />
                    Dining & Food Plan
                  </h4>
                  <ul className="flex flex-col gap-2">
                    {suggestions.foods && suggestions.foods.map((food, idx) => (
                      <li key={idx} className="text-[10px] text-gray-400 flex items-start gap-2 leading-relaxed">
                        <span className="text-emerald-400 font-extrabold shrink-0">•</span>
                        {renderItemSafely(food)}
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Card 4: Estimated Budget Breakdown */}
              <div className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col gap-3.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-amber-400" />
                  Suggested Budget Allocation
                </h3>

                <div className="flex flex-col gap-3">
                  {suggestions.budgetAllocation.map((item, idx) => {
                    const percentage = Math.round((item.amount / budget) * 100);
                    return (
                      <div key={idx} className="flex flex-col gap-1">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-semibold text-gray-300">{item.category} ({percentage}%)</span>
                          <span className="font-bold text-white">{formatRupee(item.amount)}</span>
                        </div>
                        <div className="w-full bg-white/5 border border-white/5 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              idx === 0 ? 'bg-indigo-500' :
                              idx === 1 ? 'bg-purple-500' :
                              idx === 2 ? 'bg-pink-500' :
                              idx === 3 ? 'bg-amber-500' :
                              'bg-emerald-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-[8px] text-gray-500">{item.description}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Card 5: Proposed Timeline Plan */}
              <div className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col gap-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  Proposed Event Schedule Timeline
                </h3>
                
                <div className="flex flex-col gap-3 mt-1.5 pl-3.5 border-l border-indigo-500/20">
                  {suggestions.timeline && suggestions.timeline.map((timeRow, idx) => (
                    <div key={idx} className="relative flex items-center gap-3">
                      <span className="absolute left-[-20px] w-2 h-2 rounded-full bg-indigo-500 border border-[#0d0f14]"></span>
                      <p className="text-[10px] text-gray-300 font-medium">{renderItemSafely(timeRow)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 6: AI Coordinator Checklist & Planning Tips */}
              <div className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col gap-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <ListTodo className="w-4 h-4 text-amber-400" />
                  AI Coordinator Planning Tips
                </h3>
                <ul className="flex flex-col gap-2.5">
                  {suggestions.tips && suggestions.tips.map((tip, idx) => (
                    <li key={idx} className="text-[10px] text-gray-400 flex items-start gap-2 leading-relaxed">
                      <span className="text-emerald-400 font-extrabold shrink-0 mt-0.5">✓</span>
                      {renderItemSafely(tip)}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CREATE EVENT AND SAVE BUTTON */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleSaveEvent}
                  disabled={loading}
                  className="px-6 py-3 bg-[#5a2bd4] hover:bg-[#6b3ce2] disabled:bg-[#5a2bd4]/50 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Event & Save Suggestions
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* ================= INTERACTIVE DETAIL MODAL POPUP ================= */}
      {selectedVenue && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg rounded-2xl border border-white/10 overflow-hidden shadow-2xl flex flex-col animate-scale-in max-h-[90vh]">
            
            {/* Modal Image Banner */}
            <div className="relative h-44 bg-[#151c2c]">
              <img
                src={selectedVenue.img}
                alt={selectedVenue.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>
              
              {/* Close Button */}
              <button
                onClick={() => setSelectedVenue(null)}
                className="absolute top-4 right-4 w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center cursor-pointer transition-colors border border-white/10"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-0.5">
                <span className="bg-emerald-500 text-white font-extrabold text-[9px] px-2 py-0.5 rounded w-fit mb-1 border border-emerald-400/20">
                  {selectedVenue.rating} Rating
                </span>
                <h3 className="text-base font-extrabold text-white leading-tight">{selectedVenue.name}</h3>
                <span className="text-xs text-gray-300 flex items-center gap-1 font-semibold mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  {selectedVenue.location}
                </span>
              </div>
            </div>

            {/* Modal Body Contents */}
            <div className="p-5 flex flex-col gap-4 overflow-y-auto">
              
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">Property Description</span>
                <p className="text-xs text-gray-300 leading-relaxed font-medium">
                  {selectedVenue.desc}
                </p>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-3.5 bg-white/2 border border-white/5 rounded-xl p-3 text-xs">
                <div className="flex flex-col gap-0.5">
                  <span className="text-gray-500 text-[9px] font-black uppercase tracking-wider">Capacity Limits</span>
                  <span className="text-white font-bold">{selectedVenue.capacity}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-gray-500 text-[9px] font-black uppercase tracking-wider">Classification</span>
                  <span className="text-white font-bold">{selectedVenue.type}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-gray-500 text-[9px] font-black uppercase tracking-wider">Estimated Cost Share</span>
                  <span className="text-amber-400 font-extrabold">{formatRupee(selectedVenue.cost)}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-gray-500 text-[9px] font-black uppercase tracking-wider">Availability Status</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                    {selectedVenue.availability}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 border-t border-white/5 bg-white/1 flex gap-3 justify-end">
              <button
                onClick={() => setSelectedVenue(null)}
                className="px-4 py-2 border border-white/5 hover:border-white/10 bg-white/3 hover:bg-white/5 text-gray-300 font-bold text-[10px] rounded-xl cursor-pointer transition-colors"
              >
                Close Details
              </button>
              
              <button
                onClick={() => {
                  setSelectedVenue(null);
                  showToast('Inquiry request successfully sent!', 'success');
                }}
                className="px-5 py-2 bg-[#5a2bd4] hover:bg-[#6b3ce2] text-white font-bold text-[10px] rounded-xl shadow-lg cursor-pointer transition-colors"
              >
                Book Suggested Venue
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
