/**
 * Image Resolver Utility
 * Maps categories, names, and event types to premium, high-quality Unsplash images.
 */

const eventCovers = {
  wedding: '/landing_wedding.png',
  marriage: '/landing_wedding.png',
  birthday: '/landing_birthday.png',
  anniversary: '/landing_birthday.png',
  corporate: '/landing_corporate.png',
  seminar: '/landing_corporate.png',
  conference: '/landing_corporate.png',
  college: '/landing_college.png',
  festival: '/landing_college.png',
  fest: '/landing_college.png',
  party: '/landing_private.png',
  private: '/landing_private.png',
  shower: '/landing_private.png',
  engagement: '/landing_private.png'
};

const vendorCovers = {
  catering: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80',
  food: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80',
  decor: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=800&q=80',
  flower: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=800&q=80',
  tent: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=800&q=80',
  stage: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=800&q=80',
  entertainment: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
  music: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
  dj: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
  photography: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
  video: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
  photo: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
  planner: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
  organizer: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
  sound: 'https://images.unsplash.com/photo-1484755560695-a4c7302c2c29?auto=format&fit=crop&w=800&q=80',
  light: 'https://images.unsplash.com/photo-1484755560695-a4c7302c2c29?auto=format&fit=crop&w=800&q=80'
};

const venueCovers = {
  leela: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
  lake_palace: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
  taj: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
  udaivilas: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
  oberoi: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
  fateh_garh: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
  resort: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
  shiv_niwas: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80',
  ramada: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80',
  jag_mandir: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
  bijolai: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80',
  fort: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80',
  radisson: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80',
  hilltop: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80'
};

export const getEventCover = (category, title) => {
  const combined = `${category || ''} ${title || ''}`.toLowerCase();
  for (const key of Object.keys(eventCovers)) {
    if (combined.includes(key)) {
      return eventCovers[key];
    }
  }
  return 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80'; // fallback
};

export const getVendorCover = (category) => {
  const cat = (category || '').toLowerCase();
  for (const key of Object.keys(vendorCovers)) {
    if (cat.includes(key)) {
      return vendorCovers[key];
    }
  }
  return 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=800&q=80'; // fallback
};

export const getVenueCover = (nameOrType) => {
  const combined = (nameOrType || '').toLowerCase();
  for (const key of Object.keys(venueCovers)) {
    if (combined.includes(key)) {
      return venueCovers[key];
    }
  }
  return 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80'; // fallback
};

export const resolveImage = (imgSrc, type, categoryOrName) => {
  // If we have a custom uploaded image, use it
  if (imgSrc && imgSrc.startsWith('data:')) {
    return imgSrc;
  }

  // List of all valid local image files inside the /public directory
  const validLocalImages = [
    '/leela_palace.jpg',
    '/monsoon_palace.jpg',
    '/hero_udaipur_3.jpg',
    '/shiv_niwas.jpg',
    '/oberoi_udaivilas.jpg',
    '/taj_lake_palace.jpg',
    '/jag_mandir.jpg',
    '/hero_udaipur_1.jpg',
    '/hero_udaipur_2.jpg',
    '/celebrate_collage1.png',
    '/celebrate_collage2.png',
    '/landing_wedding.png',
    '/landing_birthday.png',
    '/landing_corporate.png',
    '/landing_college.png',
    '/landing_private.png',
    '/landing_custom.png',
    '/services_scenarios.png',
    '/services_unforgettable.png',
    '/services_venues.png',
    '/logo.png',
    '/udaipur_palace.png',
    '/udaipur_palace_light.png'
  ];

  // If it's a local path starting with '/' but not in our valid list, it's invalid/hallucinated
  const isInvalidLocal = imgSrc && imgSrc.startsWith('/') && !validLocalImages.includes(imgSrc);

  // If it's a generic placeholder or an invalid local image path, resolve dynamic covers
  const isGeneric = !imgSrc || 
                    isInvalidLocal ||
                    imgSrc.includes('udaipur_palace') || 
                    imgSrc.includes('celebrate_collage') || 
                    imgSrc.includes('services_') || 
                    imgSrc.includes('landing_');

  if (!isGeneric && imgSrc) {
    return imgSrc;
  }

  // Otherwise resolve dynamic covers
  if (type === 'event') {
    return getEventCover(categoryOrName, '');
  } else if (type === 'vendor') {
    return getVendorCover(categoryOrName);
  } else {
    return getVenueCover(categoryOrName);
  }
};
