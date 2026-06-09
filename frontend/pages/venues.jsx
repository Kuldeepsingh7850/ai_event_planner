import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  Building,
  Search,
  MapPin,
  Users,
  Receipt,
  Star,
  Heart,
  ChevronLeft,
  ChevronRight,
  Filter,
  Grid,
  List,
  RotateCcw,
  Plus,
  X,
  Check,
  Calendar,
  Clock,
  Sparkles
} from 'lucide-react';

export default function VenuesCatalog() {
  const { user, authFetch } = useAuth();
  const { showToast } = useNotifications();
  const router = useRouter();

  // Venue dataset
  const initialVenues = [
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

  const [venues, setVenues] = useState(initialVenues);
  const [likedVenues, setLikedVenues] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Filter States
  const [search, setSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [capacityRange, setCapacityRange] = useState(600);
  const [priceTierFilter, setPriceTierFilter] = useState('All');
  const [selectedAmenity, setSelectedAmenity] = useState('All');
  const [sortBy, setSortBy] = useState('Recently Added');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedVenueDetail, setSelectedVenueDetail] = useState(null);
  const [activeGalleryImage, setActiveGalleryImage] = useState(null);
  const [isBookingSuccess, setIsBookingSuccess] = useState(false);

  // Get dynamic gallery images for the venue card details popup
  const getVenueGallery = (venue) => {
    if (!venue) return [];
    if (venue.gallery && venue.gallery.length > 0) {
      return venue.gallery;
    }
    const primary = venue.image || '/leela_palace.jpg';
    
    // Category-specific high-quality Unsplash fallbacks for custom/added venues
    const type = (venue.type || '').toLowerCase();
    let fallbacks = [];
    if (type.includes('lawn') || type.includes('garden') || type.includes('banquet') || type.includes('open')) {
      fallbacks = [
        'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80'
      ];
    } else if (type.includes('palace') || type.includes('fort') || type.includes('heritage')) {
      fallbacks = [
        'https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1585983224974-084a8e065e76?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=600&q=80'
      ];
    } else { // resort / hotel
      fallbacks = [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80'
      ];
    }
    
    const filtered = fallbacks.filter(img => img !== primary).slice(0, 3);
    while (filtered.length < 3) {
      filtered.push('https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80');
    }
    return [primary, ...filtered];
  };

  useEffect(() => {
    if (selectedVenueDetail) {
      setActiveGalleryImage(selectedVenueDetail.image);
    } else {
      setActiveGalleryImage(null);
    }
  }, [selectedVenueDetail]);

  // Add Venue Form States
  const [newVenueName, setNewVenueName] = useState('');
  const [newVenueType, setNewVenueType] = useState('Luxury Hotel');
  const [newVenueLoc, setNewVenueLoc] = useState('Udaipur');
  const [newVenueMinCap, setNewVenueMinCap] = useState('100');
  const [newVenueMaxCap, setNewVenueMaxCap] = useState('500');
  const [newVenuePrice, setNewVenuePrice] = useState('₹₹₹');
  const [newVenueRating, setNewVenueRating] = useState('4.5');
  const [newVenueDesc, setNewVenueDesc] = useState('');
  const [newVenueAmenities, setNewVenueAmenities] = useState([]);

  // Booking Form States
  const [bookingDate, setBookingDate] = useState('');
  const [bookingGuests, setBookingGuests] = useState('150');
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');

  // Fetch events for selection
  useEffect(() => {
    const fetchUserEvents = async () => {
      try {
        const res = await authFetch('/events');
        if (res.ok) {
          const data = await res.json();
          setEvents(data);
          if (data.length > 0) {
            setSelectedEventId(data[0].id.toString());
          }
        }
      } catch (err) {
        console.error('Error fetching events for venue booking:', err);
      }
    };
    if (user) {
      fetchUserEvents();
    }
  }, [user]);

  // Load venues from localStorage on mount to stay in sync with Admin changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('venues_data');
      let parsed = null;
      if (stored) {
        try {
          parsed = JSON.parse(stored);
        } catch (e) {
          parsed = null;
        }
      }

      // Force reset if storage has placeholder images
      const hasAIPlaceholder = parsed && parsed.some(v => 
        v.image && v.image.endsWith('.png') && !v.image.includes('logo.png')
      );

      if (!parsed || hasAIPlaceholder) {
        setVenues(initialVenues);
        localStorage.setItem('venues_data', JSON.stringify(initialVenues));
      } else {
        const sanitized = parsed.map(v => {
          const event_type = v.event_type || (v.type ? (v.type.toLowerCase().includes('resort') ? 'resort' : v.type.toLowerCase().includes('palace') ? 'palace' : v.type.toLowerCase().includes('lawn') ? 'banquet' : 'hotel') : 'hotel');
          const type = v.type || (event_type.charAt(0).toUpperCase() + event_type.slice(1) + ' Venue');
          const defaultVenue = initialVenues.find(dv => dv.id.toString() === v.id.toString());
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
        setVenues(sanitized);
        localStorage.setItem('venues_data', JSON.stringify(sanitized));
      }
    }
  }, []);

  // Open venue detail modal from URL query parameter
  useEffect(() => {
    if (router.isReady && router.query.id && venues.length > 0) {
      const venueId = parseInt(router.query.id);
      const found = venues.find(v => v.id === venueId);
      if (found) {
        setSelectedVenueDetail(found);
        setIsBookingSuccess(false);
      }
    }
  }, [router.isReady, router.query.id, venues]);

  // Handle Likes
  const toggleLike = (venueId, venueName, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (likedVenues.includes(venueId)) {
      setLikedVenues(prev => prev.filter(id => id !== venueId));
      showToast(`Removed "${venueName}" from favorites`, 'info');
    } else {
      setLikedVenues(prev => [...prev, venueId]);
      showToast(`Added "${venueName}" to favorites!`, 'success');
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearch('');
    setSelectedLocation('All');
    setSelectedType('All');
    setCapacityRange(600);
    setPriceTierFilter('All');
    setSelectedAmenity('All');
    setSortBy('Recently Added');
    showToast('Filters have been reset', 'info');
  };

  // Filter Logic
  const filteredVenues = venues.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.description.toLowerCase().includes(search.toLowerCase()) ||
      v.type.toLowerCase().includes(search.toLowerCase());

    const matchesLoc = selectedLocation === 'All' || v.location.toLowerCase() === selectedLocation.toLowerCase();
    const matchesType = selectedType === 'All' || v.type.toLowerCase() === selectedType.toLowerCase();
    const matchesCap = v.minCapacity <= capacityRange;
    const matchesPrice = priceTierFilter === 'All' || v.priceTier === priceTierFilter;
    const matchesAmenity = selectedAmenity === 'All' || v.amenities.includes(selectedAmenity);
    const matchesStatus = v.status !== 'inactive';

    return matchesSearch && matchesLoc && matchesType && matchesCap && matchesPrice && matchesAmenity && matchesStatus;
  });

  // Sort Logic
  const sortedVenues = [...filteredVenues].sort((a, b) => {
    if (sortBy === 'Price: Low to High') {
      return a.priceNum - b.priceNum;
    } else if (sortBy === 'Price: High to Low') {
      return b.priceNum - a.priceNum;
    } else if (sortBy === 'Rating') {
      return b.rating - a.rating;
    }
    return b.id - a.id; // Recently added (highest id first)
  });

  // Submit Add Venue
  const handleAddVenueSubmit = (e) => {
    e.preventDefault();
    if (!newVenueName || !newVenueDesc) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    const priceNumMapping = { '₹': 1, '₹₹': 2, '₹₹₹': 3, '₹₹₹₹': 4 };

    const newVenueObj = {
      id: venues.length + 1,
      name: newVenueName,
      type: newVenueType,
      location: newVenueLoc,
      minCapacity: parseInt(newVenueMinCap) || 50,
      maxCapacity: parseInt(newVenueMaxCap) || 300,
      priceTier: newVenuePrice,
      priceNum: priceNumMapping[newVenuePrice] || 3,
      rating: parseFloat(newVenueRating) || 4.5,
      image: '/leela_palace.jpg',
      amenities: newVenueAmenities.length > 0 ? newVenueAmenities : ['Parking', 'AC Hall'],
      description: newVenueDesc
    };

    setVenues(prev => [newVenueObj, ...prev]);
    showToast(`Successfully added "${newVenueName}" to venues!`, 'success');
    setIsAddModalOpen(false);

    // Reset Form fields
    setNewVenueName('');
    setNewVenueDesc('');
    setNewVenueAmenities([]);
  };

  // Submit Mock Booking
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingDate) {
      showToast('Please select a date for booking', 'error');
      return;
    }
    if (events.length > 0 && !selectedEventId) {
      showToast('Please select an event for booking', 'error');
      return;
    }
    if (!selectedVenueDetail) {
      showToast('No venue selected', 'error');
      return;
    }

    const selectedEvent = events.find(ev => ev.id.toString() === selectedEventId);
    const eventName = selectedEvent ? selectedEvent.title : 'your event';

    try {
      // 1. Fetch current vendors for this event
      const vendorsRes = await authFetch(`/vendors/${selectedEventId}`);
      if (vendorsRes.ok) {
        const currentVendors = await vendorsRes.json();
        // 2. Find and delete existing venue category vendor to avoid duplicates
        const existingVenue = currentVendors.find(v => v.category.toLowerCase() === 'venue');
        if (existingVenue) {
          await authFetch(`/vendor/${existingVenue.id}`, { method: 'DELETE' });
        }
      }

      // 3. Calculate dynamic venue vendor cost
      let calculatedCost = 50000;
      if (selectedEvent && selectedEvent.budget) {
        const pct = selectedVenueDetail.priceNum 
          ? (selectedVenueDetail.priceNum === 4 ? 0.40 : selectedVenueDetail.priceNum === 3 ? 0.30 : selectedVenueDetail.priceNum === 2 ? 0.20 : 0.15) 
          : 0.35;
        calculatedCost = selectedEvent.budget * pct;
      } else {
        calculatedCost = selectedVenueDetail.priceNum 
          ? (selectedVenueDetail.priceNum === 4 ? 250000 : selectedVenueDetail.priceNum === 3 ? 150000 : selectedVenueDetail.priceNum === 2 ? 80000 : 30000) 
          : 50000;
      }

      // 4. Add new venue vendor
      const addRes = await authFetch('/vendor/add', {
        method: 'POST',
        body: JSON.stringify({
          eventId: selectedEventId,
          vendor_name: selectedVenueDetail.name,
          category: 'Venue',
          contact: selectedVenueDetail.location || 'Udaipur, Rajasthan',
          cost: parseFloat(calculatedCost),
          status: 'hired'
        })
      });

      if (addRes.ok) {
        setIsBookingSuccess(true);
        showToast(`Venue booked successfully for "${eventName}" on ${bookingDate}!`, 'success');
      } else {
        const errData = await addRes.json();
        throw new Error(errData.message || 'Error booking venue');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Toggle Amenity Selection in Add form
  const handleFormAmenityToggle = (amenity) => {
    if (newVenueAmenities.includes(amenity)) {
      setNewVenueAmenities(prev => prev.filter(a => a !== amenity));
    } else {
      setNewVenueAmenities(prev => [...prev, amenity]);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-12 font-medium">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white dark:text-white">
            All Venues
          </h1>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            Discover and compare the best venues for your events.
          </p>
        </div>
        {user?.role === 'admin' ? (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#5a2bd4] hover:bg-[#4c24b5] always-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-500/10 transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add New Venue
          </button>
        ) : (
          <button
            onClick={() => showToast('Contact support or Administrator to request venue listings!', 'info')}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-gray-300 dark:hover:text-white flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Request Venue listing
          </button>
        )}
      </div>

      {/* 2. Main Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Left Column: Filter Sidebar Panel */}
        <div className="lg:col-span-1 glass-panel p-5 rounded-2xl border border-white/5 flex flex-col gap-5">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <h3 className="text-xs font-bold text-gray-200 dark:text-white uppercase tracking-wider">
              Filter Venues
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-[10px] text-gray-500 hover:text-[#5a2bd4] dark:hover:text-indigo-400 font-bold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>

          <form className="flex flex-col gap-4 text-xs font-bold" onSubmit={(e) => e.preventDefault()}>
            {/* Search Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-500 uppercase tracking-wider">Search</label>
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search venues..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Location Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-500 uppercase tracking-wider">Location</label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-gray-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="All" className="bg-[#151c2c]">All Locations</option>
                <option value="Udaipur" className="bg-[#151c2c]">Udaipur</option>
              </select>
            </div>

            {/* Venue Type Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-500 uppercase tracking-wider">Venue Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-gray-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="All" className="bg-[#151c2c]">All Types</option>
                <option value="Luxury Hotel" className="bg-[#151c2c]">Luxury Hotel</option>
                <option value="Heritage Resort" className="bg-[#151c2c]">Heritage Resort</option>
                <option value="Hotel" className="bg-[#151c2c]">Hotel</option>
                <option value="Palace" className="bg-[#151c2c]">Palace</option>
                <option value="Resort" className="bg-[#151c2c]">Resort</option>
                <option value="Lawn" className="bg-[#151c2c]">Lawn</option>
              </select>
            </div>

            {/* Capacity Limit Slider */}
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between items-center text-[10px] text-gray-500 uppercase tracking-wider">
                <span>Capacity</span>
                <span className="text-indigo-400 font-extrabold">{capacityRange}+ Guests</span>
              </div>
              <input
                type="range"
                min="50"
                max="1000"
                step="50"
                value={capacityRange}
                onChange={(e) => setCapacityRange(parseInt(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#5a2bd4] dark:accent-indigo-500"
              />
              <div className="flex justify-between text-[9px] text-gray-500">
                <span>50</span>
                <span>2000+</span>
              </div>
            </div>

            {/* Price Tiers Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-500 uppercase tracking-wider">Price Tiers</label>
              <select
                value={priceTierFilter}
                onChange={(e) => setPriceTierFilter(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-gray-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="All" className="bg-[#151c2c]">All Price Levels</option>
                <option value="₹" className="bg-[#151c2c]">₹ (Budget)</option>
                <option value="₹₹" className="bg-[#151c2c]">₹₹ (Moderate)</option>
                <option value="₹₹₹" className="bg-[#151c2c]">₹₹₹ (Premium)</option>
                <option value="₹₹₹₹" className="bg-[#151c2c]">₹₹₹₹ (Ultra Luxury)</option>
              </select>
            </div>

            {/* Amenities Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-500 uppercase tracking-wider">Amenities</label>
              <select
                value={selectedAmenity}
                onChange={(e) => setSelectedAmenity(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-gray-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="All" className="bg-[#151c2c]">Select Amenities</option>
                <option value="Pool" className="bg-[#151c2c]">Swimming Pool</option>
                <option value="AC Hall" className="bg-[#151c2c]">AC Banquets Hall</option>
                <option value="Parking" className="bg-[#151c2c]">Valet Parking</option>
                <option value="Bar" className="bg-[#151c2c]">In-house Bar Lounge</option>
                <option value="Stage" className="bg-[#151c2c]">Stage Setup</option>
              </select>
            </div>

            <button
              onClick={() => showToast('Filters applied successfully!', 'success')}
              className="w-full py-2.5 rounded-xl bg-[#5a2bd4] hover:bg-[#4c24b5] always-white font-bold text-center mt-2 cursor-pointer shadow-md transition-all uppercase tracking-wider"
            >
              Apply Filters
            </button>
          </form>
        </div>

        {/* Right Column: Wide Catalog View Layout */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Header Controls */}
          <div className="flex justify-between items-center text-xs font-bold text-gray-400">
            <span>Showing 1 to {Math.min(8, sortedVenues.length)} of {sortedVenues.length} venues</span>

            <div className="flex items-center gap-4">
              {/* Sorting */}
              <div className="flex items-center gap-1.5">
                <span>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-indigo-500 cursor-pointer font-bold"
                >
                  <option value="Recently Added" className="bg-[#151c2c]">Recently Added</option>
                  <option value="Price: Low to High" className="bg-[#151c2c]">Price: Low to High</option>
                  <option value="Price: High to Low" className="bg-[#151c2c]">Price: High to Low</option>
                  <option value="Rating" className="bg-[#151c2c]">Top Rated</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1 shrink-0">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'grid' ? 'bg-[#5a2bd4] text-white' : 'text-gray-400 hover:text-white'
                  }`}
                  title="Grid View"
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'list' ? 'bg-[#5a2bd4] text-white' : 'text-gray-400 hover:text-white'
                  }`}
                  title="List View"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Catalog Layout grid/list */}
          {sortedVenues.length === 0 ? (
            <div className="glass-panel text-center py-24 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-3">
              <Building className="w-12 h-12 text-gray-600 animate-pulse" />
              <p className="text-xs text-gray-500 font-bold">No venues match your current filter parameters.</p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-gray-300"
              >
                Clear Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* GRID VIEW */
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {sortedVenues.map(venue => (
                <div
                  key={venue.id}
                  onClick={() => {
                    setSelectedVenueDetail(venue);
                    setIsBookingSuccess(false);
                  }}
                  className="glass-card rounded-2xl border border-white/5 overflow-hidden flex flex-col justify-between group cursor-pointer shadow-sm"
                >
                  <div className="relative overflow-hidden aspect-video">
                    <img
                      src={venue.image}
                      alt={venue.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 filter brightness-[1.02]"
                    />
                    <button
                      onClick={(e) => toggleLike(venue.id, venue.name, e)}
                      className="absolute top-3 right-3 p-1.5 rounded-full backdrop-blur-md border border-white/10 transition-all cursor-pointer bg-[#07080a]/40"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          likedVenues.includes(venue.id)
                            ? 'text-rose-500 fill-rose-500 scale-110'
                            : 'text-white'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="p-4 flex flex-col gap-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-gray-500 font-extrabold uppercase">{venue.type}</span>
                      <h4 className="text-xs sm:text-sm font-extrabold text-white dark:text-white leading-tight truncate group-hover:text-[#5a2bd4] dark:group-hover:text-indigo-400 transition-colors">
                        {venue.name}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold">
                      <Users className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                      <span>{venue.minCapacity} - {venue.maxCapacity} Guests</span>
                    </div>

                    <div className="flex justify-between items-center border-t border-white/5 pt-3">
                      <div className="flex items-center gap-2 text-indigo-400 font-black text-xs font-outfit">
                        <span>{venue.priceTier}</span>
                        <span className="text-gray-600 font-bold font-sans">•</span>
                        <span className="text-gray-500 font-sans font-bold flex items-center gap-0.5">
                          <MapPin className="w-3 h-3 shrink-0" />
                          {venue.location}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5 text-emerald-500 font-extrabold text-xs font-outfit">
                        <span>{venue.rating}</span>
                        <Star className="w-3 h-3 text-emerald-500 fill-emerald-500 shrink-0" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* LIST VIEW */
            <div className="flex flex-col gap-4">
              {sortedVenues.map(venue => (
                <div
                  key={venue.id}
                  onClick={() => {
                    setSelectedVenueDetail(venue);
                    setIsBookingSuccess(false);
                  }}
                  className="glass-card rounded-2xl border border-white/5 overflow-hidden flex flex-col sm:flex-row gap-4 p-3 items-center cursor-pointer group shadow-sm"
                >
                  <img
                    src={venue.image}
                    alt={venue.name}
                    className="w-full sm:w-40 h-28 object-cover rounded-xl border border-white/5 shrink-0 group-hover:scale-102 transition-transform filter brightness-[1.02]"
                  />
                  <div className="flex-1 flex flex-col justify-between h-full py-1 min-w-0 w-full gap-2">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] text-gray-500 font-extrabold uppercase">{venue.type}</span>
                        <h4 className="text-sm font-extrabold text-white dark:text-white truncate group-hover:text-[#5a2bd4] dark:group-hover:text-indigo-400 transition-colors">
                          {venue.name}
                        </h4>
                        <p className="text-[10px] text-gray-500 line-clamp-1 leading-normal font-semibold mt-1">
                          {venue.description}
                        </p>
                      </div>
                      <button
                        onClick={(e) => toggleLike(venue.id, venue.name, e)}
                        className="p-1.5 rounded-full border border-white/5 transition-all hover:bg-white/5 cursor-pointer shrink-0"
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${
                            likedVenues.includes(venue.id)
                              ? 'text-rose-500 fill-rose-500'
                              : 'text-gray-400'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-bold text-gray-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-gray-500" />
                        {venue.minCapacity} - {venue.maxCapacity} Guests
                      </span>
                      <span className="flex items-center gap-1 font-outfit text-indigo-400 font-black">
                        {venue.priceTier}
                      </span>
                      <span className="flex items-center gap-1 font-outfit text-emerald-500 font-black">
                        {venue.rating} <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
                      </span>
                      <span className="flex items-center gap-1 font-sans text-gray-500 font-bold">
                        <MapPin className="w-3.5 h-3.5" /> {venue.location}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 mt-4 bg-white/[0.005] border border-white/5 rounded-2xl px-5 py-4">
            <span>Showing 1 to {Math.min(8, sortedVenues.length)} of {sortedVenues.length} venues</span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <button className="p-1.5 rounded-lg border border-white/5 bg-white/3 text-gray-400 disabled:opacity-35 disabled:pointer-events-none cursor-pointer" disabled>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button className="w-6 h-6 rounded-lg bg-[#5a2bd4] text-white flex items-center justify-center cursor-pointer">1</button>
                <button className="w-6 h-6 rounded-lg bg-white/3 border border-white/5 text-gray-400 hover:text-white cursor-pointer">2</button>
                <button className="p-1.5 rounded-lg border border-white/5 bg-white/3 text-gray-400 hover:text-white cursor-pointer">
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="border-l border-white/5 pl-4">
                <select className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[9px] text-gray-400 focus:outline-none font-bold cursor-pointer">
                  <option value="12" className="bg-[#151c2c]">12 / page</option>
                  <option value="24" className="bg-[#151c2c]">24 / page</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MODAL: Add New Venue Dialog (Admin only) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-[#07080a]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-xl rounded-2xl border border-white/10 shadow-2xl p-6 flex flex-col gap-6 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-indigo-400" />
                Add New Venue listing
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-white font-extrabold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddVenueSubmit} className="flex flex-col gap-4 font-bold">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase">Venue Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Radisson Blu Resort"
                  value={newVenueName}
                  onChange={(e) => setNewVenueName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Venue Type</label>
                  <select
                    value={newVenueType}
                    onChange={(e) => setNewVenueType(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-gray-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="Luxury Hotel" className="bg-[#151c2c]">Luxury Hotel</option>
                    <option value="Heritage Resort" className="bg-[#151c2c]">Heritage Resort</option>
                    <option value="Hotel" className="bg-[#151c2c]">Hotel</option>
                    <option value="Palace" className="bg-[#151c2c]">Palace</option>
                    <option value="Resort" className="bg-[#151c2c]">Resort</option>
                    <option value="Lawn" className="bg-[#151c2c]">Lawn</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Location City</label>
                  <select
                    value={newVenueLoc}
                    onChange={(e) => setNewVenueLoc(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-gray-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="Udaipur" className="bg-[#151c2c]">Udaipur</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Min Guest Capacity</label>
                  <input
                    type="number"
                    required
                    value={newVenueMinCap}
                    onChange={(e) => setNewVenueMinCap(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Max Guest Capacity</label>
                  <input
                    type="number"
                    required
                    value={newVenueMaxCap}
                    onChange={(e) => setNewVenueMaxCap(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Price Level Tier</label>
                  <select
                    value={newVenuePrice}
                    onChange={(e) => setNewVenuePrice(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-gray-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="₹" className="bg-[#151c2c]">₹ (Budget)</option>
                    <option value="₹₹" className="bg-[#151c2c]">₹₹ (Moderate)</option>
                    <option value="₹₹₹" className="bg-[#151c2c]">₹₹₹ (Premium)</option>
                    <option value="₹₹₹₹" className="bg-[#151c2c]">₹₹₹₹ (Ultra Luxury)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Mock Rating Score</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    required
                    value={newVenueRating}
                    onChange={(e) => setNewVenueRating(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Select Amenities Checklist */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-bold uppercase">Select Amenities</label>
                <div className="flex flex-wrap gap-2.5">
                  {['Pool', 'AC Hall', 'Parking', 'Bar', 'Stage', 'Sound System'].map(amenity => (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => handleFormAmenityToggle(amenity)}
                      className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all cursor-pointer ${
                        newVenueAmenities.includes(amenity)
                          ? 'bg-[#5a2bd4] border-[#5a2bd4] always-white'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase">Detailed Description</label>
                <textarea
                  required
                  placeholder="e.g. A gorgeous place featuring luxury services..."
                  value={newVenueDesc}
                  rows="3"
                  onChange={(e) => setNewVenueDesc(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/5 bg-white/3 hover:bg-white/7 transition-all text-xs font-bold text-gray-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#5a2bd4] hover:bg-[#4c24b5] always-white text-xs font-bold transition-all shadow-md shadow-indigo-600/15 cursor-pointer"
                >
                  Add Venue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. MODAL: Venue Details & Booking Drawer */}
      {selectedVenueDetail && (
        <div className="fixed inset-0 bg-[#07080a]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl p-6 flex flex-col md:flex-row gap-6 animate-scale-up max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setSelectedVenueDetail(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white font-extrabold text-xs cursor-pointer p-1.5 bg-white/5 rounded-full"
            >
              ✕
            </button>

            {/* Left side: Photo and Description details */}
            <div className="flex-1 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="w-full h-44 rounded-xl overflow-hidden border border-white/5 shrink-0 relative bg-slate-800">
                  <img
                    src={activeGalleryImage || selectedVenueDetail.image}
                    alt={selectedVenueDetail.name}
                    className="w-full h-full object-cover transition-all duration-300"
                  />
                </div>
                {/* Thumbnails row */}
                <div className="flex gap-2">
                  {getVenueGallery(selectedVenueDetail).map((imgUrl, idx) => {
                    const isActive = (activeGalleryImage || selectedVenueDetail.image) === imgUrl;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveGalleryImage(imgUrl)}
                        className={`w-12 h-10 rounded-lg overflow-hidden border transition-all cursor-pointer ${
                          isActive ? 'border-[#5a2bd4] scale-105 shadow-md shadow-indigo-600/10' : 'border-white/5 hover:border-white/20'
                        }`}
                      >
                        <img src={imgUrl} alt="gallery thumbnail" className="w-full h-full object-cover" />
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-indigo-400 font-extrabold uppercase">{selectedVenueDetail.type}</span>
                <h3 className="text-base font-bold text-white leading-tight">
                  {selectedVenueDetail.name}
                </h3>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed font-semibold h-20 overflow-y-auto">
                {selectedVenueDetail.description}
              </p>

              {/* Amenities List */}
              <div className="flex flex-col gap-1.5 border-t border-white/5 pt-3">
                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Amenities Available</span>
                <div className="flex flex-wrap gap-2">
                  {selectedVenueDetail.amenities.map(amenity => (
                    <span
                      key={amenity}
                      className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-[9px] font-bold text-gray-300 flex items-center gap-1"
                    >
                      <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              {/* Interactive Venue Map */}
              <div className="flex flex-col gap-1.5 border-t border-white/5 pt-3">
                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Interactive Venue Map</span>
                <div className="w-full h-32 rounded-xl overflow-hidden border border-white/5 shadow-inner">
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0, filter: 'invert(0.9) hue-rotate(180deg) contrast(1.2) grayscale(0.2)' }}
                    loading="lazy"
                    allowFullScreen
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(selectedVenueDetail.name + ', Udaipur')}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                  ></iframe>
                </div>
              </div>
            </div>

            {/* Right side: Specifications and Booking form */}
            <div className="w-full md:w-60 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6 flex flex-col gap-5 justify-between">
              <div className="flex flex-col gap-4">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-extrabold pb-2 border-b border-white/5">
                  Specifications
                </span>

                <div className="flex flex-col gap-2.5 text-[11px] font-bold text-gray-300">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Location:</span>
                    <span>{selectedVenueDetail.location}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Capacity limit:</span>
                    <span>{selectedVenueDetail.minCapacity} - {selectedVenueDetail.maxCapacity} Guests</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Price rating:</span>
                    <span className="text-indigo-400 font-black font-outfit">{selectedVenueDetail.priceTier}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Rating index:</span>
                    <span className="text-emerald-500 flex items-center gap-0.5">
                      {selectedVenueDetail.rating} <Star className="w-3.5 h-3.5 fill-emerald-500 shrink-0" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Mock Booking Interface */}
              <div className="border-t border-white/5 pt-4 flex flex-col gap-3">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                  Schedule Event Booking
                </span>

                {user?.role === 'admin' ? (
                  <div className="text-[10px] text-indigo-400 font-bold bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-xl flex flex-col gap-1 text-center font-semibold">
                    <span>Venue booking is only available for User accounts.</span>
                  </div>
                ) : isBookingSuccess ? (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-[10px] text-emerald-400 text-center font-bold flex flex-col items-center gap-1.5">
                    <Check className="w-6 h-6 animate-bounce" />
                    <span>Venue Reserved Successfully for "{events.find(ev => ev.id.toString() === selectedEventId)?.title || 'your event'}"!</span>
                  </div>
                ) : (
                  <form onSubmit={handleBookingSubmit} className="flex flex-col gap-2.5">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] text-gray-500 uppercase font-bold">Select Event</label>
                      {events.length > 0 ? (
                        <select
                          required
                          value={selectedEventId}
                          onChange={(e) => setSelectedEventId(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] text-gray-300 focus:outline-none cursor-pointer font-bold"
                        >
                          {events.map(ev => (
                            <option key={ev.id} value={ev.id} className="bg-[#151c2c] text-white">
                              {ev.title}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="text-[10px] text-amber-400 font-bold bg-amber-500/10 border border-amber-500/25 p-2 rounded-lg flex flex-col gap-1.5">
                          <span>You have no active events to book for.</span>
                          <Link href="/ai" className="text-[#5a2bd4] dark:text-indigo-400 hover:underline">
                            Create Event first &rarr;
                          </Link>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] text-gray-500 uppercase font-bold">Select Date</label>
                      <input
                        type="date"
                        required
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] text-white focus:outline-none cursor-pointer"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] text-gray-500 uppercase font-bold">Guests Count</label>
                      <input
                        type="number"
                        required
                        value={bookingGuests}
                        onChange={(e) => setBookingGuests(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] text-white focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={events.length === 0}
                      className="w-full py-2 bg-[#5a2bd4] hover:bg-[#4c24b5] disabled:opacity-40 disabled:pointer-events-none always-white text-[10px] font-extrabold rounded-xl transition-all shadow-md uppercase tracking-wider cursor-pointer"
                    >
                      Book Venue
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
