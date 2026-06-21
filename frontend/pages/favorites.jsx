import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  Star,
  MapPin,
  Calendar,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Check,
  Building,
  Users
} from 'lucide-react';

export default function FavoritesPage() {
  const { user } = useAuth();
  const { showToast } = useNotifications();


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
      image: '/leela_palace.jpg',
      metadataType: 'location'
    },
    {
      id: 'fav-2',
      title: 'Fateh Garh Resort',
      category: 'Venue',
      subCategory: 'Venue',
      location: 'Udaipur, Rajasthan',
      image: '/monsoon_palace.jpg',
      metadataType: 'location'
    },
    {
      id: 'fav-3',
      title: 'Royal Catering Services',
      category: 'Vendor',
      subCategory: 'Vendor - Catering',
      location: 'Udaipur, Rajasthan',
      image: '/hero_udaipur_2.jpg',
      metadataType: 'location'
    },
    {
      id: 'fav-4',
      title: 'Dream Decorators',
      category: 'Vendor',
      subCategory: 'Vendor - Decoration',
      location: 'Udaipur, Rajasthan',
      image: '/shiv_niwas.jpg',
      metadataType: 'location'
    },
    {
      id: 'fav-5',
      title: 'Rhythm Events',
      category: 'Vendor',
      subCategory: 'Vendor - Entertainment',
      location: 'Udaipur, Rajasthan',
      image: '/hero_udaipur_3.jpg',
      metadataType: 'location'
    },
    {
      id: 'fav-6',
      title: 'Memories Photography',
      category: 'Vendor',
      subCategory: 'Vendor - Photography',
      location: 'Udaipur, Rajasthan',
      image: '/jag_mandir.jpg',
      metadataType: 'location'
    },
    {
      id: 'fav-7',
      title: 'Send Invitations',
      category: 'Task',
      subCategory: 'Task',
      metaLabel: 'Due: 22 May 2024',
      image: '/hero_udaipur_1.jpg',
      metadataType: 'due_date'
    }
  ];

  // Initialize and read favorites from LocalStorage
  useEffect(() => {
    setLoading(true);
    try {
      const localKey = user ? `event_planner_favorites_${user.id}` : 'event_planner_favorites';
      const stored = localStorage.getItem(localKey);
      let parsed = null;
      if (stored) {
        try { parsed = JSON.parse(stored); } catch (e) {}
      }
      const hasAIPlaceholder = parsed && parsed.some(f => f.image && f.image.endsWith('.png') && !f.image.includes('logo.png'));

      if (!parsed || hasAIPlaceholder) {
        localStorage.setItem(localKey, JSON.stringify([]));
        setFavorites([]);
      } else {
        setFavorites(parsed);
      }
    } catch (e) {
      console.error('LocalStorage not supported or failed to parse:', e);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Sync back to local storage
  const saveFavorites = (newFavorites) => {
    setFavorites(newFavorites);
    try {
      const localKey = user ? `event_planner_favorites_${user.id}` : 'event_planner_favorites';
      localStorage.setItem(localKey, JSON.stringify(newFavorites));
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

  // Set filtered favorites to simply map all items
  const filteredFavorites = favorites;

  // Pagination bounds
  const totalPages = Math.max(Math.ceil(filteredFavorites.length / pageSize), 1);
  const paginatedFavorites = filteredFavorites.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

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
        </div>
      ) : (
        /* GRID VIEW LAYOUT (4 columns on wide viewports) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedFavorites.map(item => (
            <div
              key={item.id}
              className="glass-card rounded-[24px] border border-white/5 overflow-hidden flex flex-col justify-between group cursor-pointer shadow-md hover:-translate-y-1.5 transition-all duration-300"
            >

              {/* Title & Metadata Details */}
              <div className="p-5 flex flex-col gap-4 flex-1 justify-between">
                <div className="flex items-start gap-3.5">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${
                    item.category === 'Venue'
                      ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                      : item.category === 'Vendor'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : item.category === 'Task'
                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                      : 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                  }`}>
                    {item.category === 'Venue' ? (
                      <Building className="w-4.5 h-4.5" />
                    ) : item.category === 'Vendor' ? (
                      <Users className="w-4.5 h-4.5" />
                    ) : item.category === 'Task' ? (
                      <Check className="w-4.5 h-4.5" />
                    ) : (
                      <Star className="w-4.5 h-4.5" />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h4 className="text-xs sm:text-sm font-extrabold text-white dark:text-white leading-tight mb-1 truncate group-hover:text-indigo-400 transition-colors">
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
                      {item.subCategory}
                    </span>
                  </div>
                </div>

                {/* Metadata details (MapPin / Calendar icons) */}
                <div className="flex flex-col gap-2 border-t border-white/5 pt-3.5 text-[10px] text-gray-500 dark:text-gray-400 font-semibold">
                  {item.metadataType === 'location' ? (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>{item.location}</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="font-outfit">{item.metaLabel}</span>
                    </span>
                  )}
                </div>

                {/* Remove from Favorites outline CTA */}
                <button
                  onClick={(e) => handleRemoveFavorite(item.id, item.title, e)}
                  className="w-full py-2.5 border border-white/10 hover:border-rose-500/25 bg-white/3 hover:bg-rose-500/5 text-gray-400 hover:text-rose-500 text-[10px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer mt-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove from Favorites
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
                      ? 'bg-[#1d4ed8] text-white font-extrabold shadow-sm shadow-indigo-600/10'
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
