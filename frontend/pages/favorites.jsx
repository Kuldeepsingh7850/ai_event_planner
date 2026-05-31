import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  Star,
  MapPin,
  Calendar,
  Trash2,
  Heart,
  ChevronLeft,
  ChevronRight,
  Filter,
  Check,
  Building,
  Users,
  Compass
} from 'lucide-react';

export default function FavoritesPage() {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  // Categories Horizontal Tabs: 'All', 'Venues', 'Vendors', 'Tasks', 'Ideas'
  const [activeTab, setActiveTab] = useState('All');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('All Types');
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Exact 8 mockup fallback cards matching the user reference mockup
  const fallbackFavorites = [
    {
      id: 'fav-1',
      title: 'The Leela Palace',
      category: 'Venue',
      subCategory: 'Venue',
      location: 'Udaipur, Rajasthan',
      image: '/udaipur_palace.png',
      metadataType: 'location'
    },
    {
      id: 'fav-2',
      title: 'Fateh Garh Resort',
      category: 'Venue',
      subCategory: 'Venue',
      location: 'Udaipur, Rajasthan',
      image: '/udaipur_palace_light.png',
      metadataType: 'location'
    },
    {
      id: 'fav-3',
      title: 'Royal Catering Services',
      category: 'Vendor',
      subCategory: 'Vendor - Catering',
      location: 'Udaipur, Rajasthan',
      image: '/services_unforgettable.png',
      metadataType: 'location'
    },
    {
      id: 'fav-4',
      title: 'Dream Decorators',
      category: 'Vendor',
      subCategory: 'Vendor - Decoration',
      location: 'Udaipur, Rajasthan',
      image: '/services_scenarios.png',
      metadataType: 'location'
    },
    {
      id: 'fav-5',
      title: 'Rhythm Events',
      category: 'Vendor',
      subCategory: 'Vendor - Entertainment',
      location: 'Udaipur, Rajasthan',
      image: '/celebrate_collage1.png',
      metadataType: 'location'
    },
    {
      id: 'fav-6',
      title: 'Memories Photography',
      category: 'Vendor',
      subCategory: 'Vendor - Photography',
      location: 'Udaipur, Rajasthan',
      image: '/celebrate_collage2.png',
      metadataType: 'location'
    },
    {
      id: 'fav-7',
      title: 'Send Invitations',
      category: 'Task',
      subCategory: 'Task',
      metaLabel: 'Due: 22 May 2024',
      image: '/landing_wedding.png',
      metadataType: 'due_date'
    },
    {
      id: 'fav-8',
      title: 'Wedding Budget Plan',
      category: 'Idea',
      subCategory: 'Idea',
      metaLabel: 'Added on: 20 May 2024',
      image: '/landing_custom.png',
      metadataType: 'added_date'
    }
  ];

  // Initialize and read favorites from LocalStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('event_planner_favorites');
      if (stored) {
        setFavorites(JSON.parse(stored));
      } else {
        localStorage.setItem('event_planner_favorites', JSON.stringify(fallbackFavorites));
        setFavorites(fallbackFavorites);
      }
    } catch (e) {
      console.error('LocalStorage not supported or failed to parse:', e);
      setFavorites(fallbackFavorites);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync back to local storage
  const saveFavorites = (newFavorites) => {
    setFavorites(newFavorites);
    try {
      localStorage.setItem('event_planner_favorites', JSON.stringify(newFavorites));
    } catch (e) {
      console.error('Failed to write to localStorage:', e);
    }
  };

  const handleRemoveFavorite = (id, name, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const updated = favorites.filter(item => item.id !== id);
    saveFavorites(updated);
    showToast(`Removed "${name}" from favorites`, 'info');
  };

  // Filter Logic based on Active Tab & Dropdown Type Filter
  const filteredFavorites = favorites.filter(item => {
    // 1. Tab Filter
    let matchesTab = true;
    if (activeTab === 'Venues') matchesTab = item.category === 'Venue';
    else if (activeTab === 'Vendors') matchesTab = item.category === 'Vendor';
    else if (activeTab === 'Tasks') matchesTab = item.category === 'Task';
    else if (activeTab === 'Ideas') matchesTab = item.category === 'Idea';

    // 2. Dropdown Filter
    let matchesDropdown = true;
    if (selectedTypeFilter !== 'All Types') {
      if (selectedTypeFilter === 'Venues') matchesDropdown = item.category === 'Venue';
      else if (selectedTypeFilter === 'Vendors') matchesDropdown = item.category === 'Vendor';
      else if (selectedTypeFilter === 'Tasks') matchesDropdown = item.category === 'Task';
      else if (selectedTypeFilter === 'Ideas') matchesDropdown = item.category === 'Idea';
    }

    return matchesTab && matchesDropdown;
  });

  // Pagination bounds
  const totalPages = Math.max(Math.ceil(filteredFavorites.length / pageSize), 1);
  const paginatedFavorites = filteredFavorites.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, selectedTypeFilter]);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12 font-medium">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white dark:text-white">
            Favorites
          </h1>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            Your saved and favorite items for quick access.
          </p>
        </div>
      </div>

      {/* 2. Horizontal Filter Tabs & Dropdowns toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 border-b border-white/5 pb-2">
        {/* Horizontal Status tabs */}
        <div className="flex gap-6 overflow-x-auto text-[13px] font-bold text-gray-500 scrollbar-none pr-4">
          {[
            { id: 'All', label: 'All' },
            { id: 'Venues', label: 'Venues' },
            { id: 'Vendors', label: 'Vendors' },
            { id: 'Tasks', label: 'Tasks' },
            { id: 'Ideas', label: 'Ideas' }
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

        {/* Dropdown Filter on the right */}
        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="px-3.5 py-2 bg-white/5 border border-white/10 rounded-xl hover:border-indigo-500/35 transition-all text-xs font-bold text-gray-300 hover:text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="All Types" className="bg-[#151c2c] text-white">All Types</option>
            <option value="Venues" className="bg-[#151c2c] text-white">Venues</option>
            <option value="Vendors" className="bg-[#151c2c] text-white">Vendors</option>
            <option value="Tasks" className="bg-[#151c2c] text-white">Tasks</option>
            <option value="Ideas" className="bg-[#151c2c] text-white">Ideas</option>
          </select>
        </div>
      </div>

      {/* 3. Catalog Grid of Favorites */}
      {loading ? (
        <div className="py-32 text-center">
          <div className="w-8 h-8 mx-auto border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <span className="text-gray-500 text-xs mt-3 block font-bold">Loading your favorites list...</span>
        </div>
      ) : paginatedFavorites.length === 0 ? (
        <div className="glass-panel text-center py-24 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-3">
          <Star className="w-12 h-12 text-gray-600 animate-pulse" />
          <p className="text-xs text-gray-500 font-bold">You have no items saved in this category.</p>
          <button
            onClick={() => {
              saveFavorites(fallbackFavorites);
              showToast('Restored mockup defaults!', 'success');
            }}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-gray-300 transition-colors"
          >
            Restore Default Mockups
          </button>
        </div>
      ) : (
        /* GRID VIEW LAYOUT (4 columns on wide viewports) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedFavorites.map(item => (
            <div
              key={item.id}
              className="glass-card rounded-2xl border border-white/5 overflow-hidden flex flex-col justify-between group shadow-sm"
            >
              {/* Image Section */}
              <div className="relative overflow-hidden aspect-video bg-slate-800">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 filter brightness-[1.02]"
                />
                
                {/* Heart Toggle overlays */}
                <button
                  onClick={(e) => handleRemoveFavorite(item.id, item.title, e)}
                  className="absolute top-3 right-3 p-1.5 rounded-full backdrop-blur-md border border-white/10 bg-[#07080a]/40 cursor-pointer"
                  title="Remove from favorites"
                >
                  <Heart className="w-3.5 h-3.5 text-indigo-500 fill-indigo-500 transition-all hover:scale-110" />
                </button>
              </div>

              {/* Title & Metadata Details */}
              <div className="p-4 flex flex-col gap-2.5">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-gray-500 font-extrabold uppercase">{item.subCategory}</span>
                  <h4 className="text-xs sm:text-sm font-extrabold text-white dark:text-white truncate leading-tight group-hover:text-[#5a2bd4] dark:group-hover:text-indigo-400 transition-colors">
                    {item.title}
                  </h4>
                </div>

                {/* Metadata details (MapPin / Calendar icons) */}
                <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold border-b border-white/5 pb-3">
                  {item.metadataType === 'location' ? (
                    <>
                      <MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                      <span>{item.location}</span>
                    </>
                  ) : (
                    <>
                      <Calendar className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                      <span className="font-outfit">{item.metaLabel}</span>
                    </>
                  )}
                </div>

                {/* Remove from Favorites outline CTA */}
                <button
                  onClick={(e) => handleRemoveFavorite(item.id, item.title, e)}
                  className="w-full py-2 border border-white/10 hover:border-rose-500/25 bg-white/3 hover:bg-rose-500/5 text-gray-400 hover:text-rose-500 text-[10px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Pagination Footer */}
      {filteredFavorites.length > 0 && (
        <div className="glass-panel px-5 py-4 rounded-2xl border border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-bold text-gray-500 bg-white/[0.005]">
          <span>
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredFavorites.length)} of {filteredFavorites.length} favorites
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
  );
}
