const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Helper to shift timeline relative to user start time
const shiftTimeline = (timeline, startTimeStr) => {
  if (!startTimeStr) return timeline;
  
  const parts = startTimeStr.split(':');
  if (parts.length < 2) return timeline;
  const startHours = parseInt(parts[0]);
  const startMinutes = parseInt(parts[1]);
  if (isNaN(startHours) || isNaN(startMinutes)) return timeline;

  const firstEntry = timeline[0];
  const match = firstEntry.match(/^(\d{2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return timeline;
  
  let origHours = parseInt(match[1]);
  const origMinutes = parseInt(match[2]);
  const ampm = match[3].toUpperCase();
  if (ampm === 'PM' && origHours < 12) origHours += 12;
  if (ampm === 'AM' && origHours === 12) origHours = 0;

  const diffMinutes = (startHours * 60 + startMinutes) - (origHours * 60 + origMinutes);

  return timeline.map(entry => {
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

// Helper to generate dynamic fallback suggestions based on event details
const generateFallbackSuggestions = (title, eventType, budget, guestCount, startTimeStr) => {
  const b = parseFloat(budget) || 50000;
  const guests = parseInt(guestCount) || 100;
  const type = (eventType || 'General').toLowerCase();

  // Pick theme list based on event type
  let themes = [];
  let decorations = [];
  let foods = [];
  let timeline = [];
  let tips = [];

  if (type.includes('wedding')) {
    themes = ['Enchanted Forest Romance', 'Royal Gold & Ivory Classic', 'Minimalist Pastel Garden Party'];
    decorations = [
      'Fairylights canopy covering the entire main dining area.',
      'Floral archway with white roses and eucalyptus at the entrance.',
      'Sleek glass table settings with golden charger plates and tall candelabras.'
    ];
    foods = [
      'Welcome Drinks: Cucumber Mint Cooler, Spiced Apple Cider.',
      'Appetizers: Garlic Butter Shrimp, Cheese Jalapeno Poppers, Paneer Tikka.',
      'Main Course: Creamy Butter Chicken, Truffle Mushroom Risotto, Dal Makhani, Assorted Breads.',
      'Desserts: Warm Gulab Jamun with Vanilla Ice Cream, Red Velvet Cupcakes.'
    ];
    timeline = [
      '04:00 PM - Guest Arrival & Welcome Mocktails',
      '05:00 PM - Wedding Ceremony & Ring Exchange',
      '06:30 PM - Photoshoot & Live Violin Session',
      '08:00 PM - First Dance & Cake Cutting Ceremony',
      '08:30 PM - Grand Dinner Buffet Opens',
      '10:00 PM - DJ Performance & Dance Floor Open',
      '11:30 PM - Farewell Send-off'
    ];
    tips = [
      'Book the venue at least 3 months in advance to secure prime dates.',
      'Allocate a 10% contingency buffer in your wedding budget for unexpected costs.',
      'Send digital RSVP tracking links 4 weeks before the event.',
      'Schedule a food tasting session with the caterer two weeks prior.'
    ];
  } else if (type.includes('farewell')) {
    themes = ['Retro Rewind (80s/90s Bollywood/Hollywood)', 'Golden Horizon: The Next Chapter', 'Glamorous Prom Night'];
    decorations = [
      'Neon signboards with nostalgic photo collage board at the hallway.',
      'Metallic balloon clusters (Black, Gold, and Silver) around the stage.',
      'LED spotlights casting a warm amber glow over the seating charts.'
    ];
    foods = [
      'Welcome Drinks: Mocktail Margaritas, Blue Lagoon Soda.',
      'Appetizers: Chicken Sliders, Crispy Spring Rolls, Veg Manchurian.',
      'Main Course: Pasta Bar (Penne Alfredo/Arrabbiata), Paneer Butter Masala with Jeera Rice, Garlic Naan.',
      'Desserts: Chocolate Brownie with Sizzling Hot Fudge, Fruit Skewers.'
    ];
    timeline = [
      '05:00 PM - Senior Entry & Red Carpet Photoshoot',
      '06:00 PM - Opening Speeches & Faculty Address',
      '06:45 PM - Title Giving & Senior Award Nominations',
      '07:30 PM - Cultural Performances (Dance, Music, Stand-up)',
      '08:30 PM - Dinner & Nostalgia Video Screening',
      '09:30 PM - Jam Session (DJ Dance Floor)',
      '11:00 PM - Goodbyes & Souvenir Distribution'
    ];
    tips = [
      'Get seniors to submit childhood photos early for the nostalgia video.',
      'Make custom titles and awards personal and lighthearted.',
      'Prepare photo booths with fun props (glasses, hats, retro placards).',
      'Organize a message wall where juniors can pin hand-written letters.'
    ];
  } else if (type.includes('birthday')) {
    themes = ['Neon Glow-in-the-Dark Party', 'Vintage Tea Room Picnic', 'Casino Royale Night'];
    decorations = [
      'Blacklight fixtures with fluorescent streamers and glow balloons.',
      'Customized "Happy Birthday" LED sign backdrop on a shimmery tinsel wall.',
      'Inflatable props, party blowers, and interactive tabletops.'
    ];
    foods = [
      'Welcome Drinks: Strawberry Lemonade, Virgin Mojitos.',
      'Appetizers: Crispy Nachos with Salsa & Cheese, Mini Tacos, Chicken Satay.',
      'Main Course: Woodfired Pizza Station, Sliders, Pasta Salad.',
      'Desserts: Triple-Tier Birthday Cake, Macaron Towers, Candy Station.'
    ];
    timeline = [
      '06:00 PM - Guest Registration & Glitter Makeup Booth',
      '06:45 PM - Icebreaker Party Games & Trivia',
      '07:30 PM - Grand Cake Cutting Ceremony',
      '08:00 PM - Appetizer Service & Toast for the Birthday Celebrant',
      '08:30 PM - Buffet Dinner Service',
      '09:30 PM - Live DJ Dance Off',
      '11:00 PM - Return Gift Handouts & Departure'
    ];
    tips = [
      'Pick a theme that reflects the celebrant’s current hobbies or passion.',
      'Keep speeches short to maintain party momentum.',
      'Ensure dietary preferences (vegan, gluten-free) are labeled on the buffet.',
      'Hire a designated helper/coordinator to manage gifts and guest lists.'
    ];
  } else {
    // Corporate / General
    themes = ['Modern Corporate Minimalist', 'Rustic Gala Soiree', 'Tech Fusion Hub'];
    decorations = [
      'Corporate logo projection (gobo lights) on main stage walls.',
      'Elegant indoor planters and green hedge walls to create organic barriers.',
      'Sleek white lounge seating with colored accent pillows.'
    ];
    foods = [
      'Welcome Drinks: Sparkling Apple Cider, Hot Brewed Espresso.',
      'Appetizers: Smoked Salmon Crostini, Spinach Artichoke Dip, Skewered Teriyaki Tofu.',
      'Main Course: Grilled Salmon fillets, Roasted Sirloin, Garlic Herb Potatoes, Caesar Salad.',
      'Desserts: Caramel Custard, Tiramisu Shooters.'
    ];
    timeline = [
      '09:00 AM - Registrations, Coffee Networking, & Welcome Kit Distribution',
      '10:00 AM - Keynote Presentation & Welcome Note',
      '11:30 AM - Panel Discussion & Interactive Q&A Session',
      '01:00 PM - Networking Lunch Buffet',
      '02:30 PM - Breakout Workshops & Brainstorming',
      '04:30 PM - Closing Remarks & High Tea Networking',
      '05:30 PM - Event Concludes'
    ];
    tips = [
      'Circulate a digital agenda packet to all attendees 3 days prior.',
      'Double check high-speed WiFi connections and wireless mic batteries.',
      'Secure a prominent registration desk close to the entry doors.',
      'Arrange clean signage direction markers throughout the venue.'
    ];
  }

  // Budget Distribution calculations
  const budgetAllocation = [
    { category: 'Venue & Catering (40%)', amount: b * 0.40, description: 'Main venue rental fee plus food/beverage catering package.' },
    { category: 'Decoration & Theme Setup (20%)', amount: b * 0.20, description: 'Stage decor, backdrops, lighting, table settings, and floral displays.' },
    { category: 'Photography & Videography (15%)', amount: b * 0.15, description: 'Hiring professional photographers/videographers and editing costs.' },
    { category: 'Entertainment & DJ (15%)', amount: b * 0.15, description: 'Sound system rental, DJ, hosts, or live performance team.' },
    { category: 'Miscellaneous & Contingency (10%)', amount: b * 0.10, description: 'Emergency buffer, printable invitations, souvenirs, and minor costs.' }
  ];

  return {
    isMock: true,
    description: `A premium ${type} event themed around '${themes[0]}' featuring custom dining menus, detailed decorator options, and a complete timeline plan for ${guests} guests.`,
    themes,
    decorations,
    foods,
    timeline: shiftTimeline(timeline, startTimeStr),
    budgetAllocation,
    tips
  };
};

// Helper to call OpenAI-compatible APIs (Groq, xAI Grok, etc.)
const callOpenAICompatibleAPI = async (apiKey, endpoint, model, prompt) => {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI Event Planner & Organizer. You must respond ONLY with a valid JSON object matching the requested structure.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

// Helper to sanitize and parse JSON response from LLMs
const parseJSONResponse = (text) => {
  let cleaned = text.trim();
  if (cleaned.includes('```')) {
    cleaned = cleaned.replace(/```json/g, '').replace(/```/g, '').trim();
  }
  return JSON.parse(cleaned);
};

// Helper to normalize budget allocation to sum up to exactly total budget and shift timeline dynamically
const normalizeSuggestions = (data, budget, startTimeStr) => {
  if (!data) return data;
  
  if (data.budgetAllocation && Array.isArray(data.budgetAllocation)) {
    const b = parseFloat(budget) || 50000;
    const totalAllocated = data.budgetAllocation.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    if (totalAllocated > 0 && Math.abs(totalAllocated - b) > 1) {
      data.budgetAllocation = data.budgetAllocation.map(item => {
        const amt = parseFloat(item.amount) || 0;
        const ratio = amt / totalAllocated;
        return {
          ...item,
          amount: Math.round(b * ratio)
        };
      });
    }
  }

  // Ensure LLM timeline matches the requested start time (fallback shift if LLM failed to align it)
  if (data.timeline && Array.isArray(data.timeline) && startTimeStr) {
    data.timeline = shiftTimeline(data.timeline, startTimeStr);
  }

  return data;
};

// @desc    Get AI Suggestions based on event requirements
// @route   POST /api/ai/suggestions
// @access  Private
const getAISuggestions = async (req, res) => {
  const { title, eventType, budget, guestCount, location, time, specialRequests, description } = req.body;

  if (!title || !eventType || !budget || !guestCount) {
    return res.status(400).json({ message: 'Please provide all details: title, eventType, budget, guestCount' });
  }

  const eventLocation = location || 'Udaipur, Rajasthan';
  const notes = specialRequests || description || 'None';
  
  // Format startTime to 12-hour AM/PM for the LLM prompt to ensure standard output format
  let startTime = '05:00 PM';
  if (time) {
    if (/^\d{2}:\d{2}$/.test(time)) {
      const parts = time.split(':');
      let hours = parseInt(parts[0]);
      const minutes = parts[1];
      let ampm = 'AM';
      if (hours >= 12) {
        ampm = 'PM';
        if (hours > 12) hours -= 12;
      }
      if (hours === 0) hours = 12;
      startTime = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
    } else {
      startTime = time;
    }
  }

  const groqKey = process.env.GROQ_API_KEY;
  const grokKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  const prompt = `
    You are an expert AI Event Planner & Organizer. Generate professional and highly customized ideas for an event.
    Event Details:
    - Title: "${title}"
    - Type: "${eventType}"
    - Total Budget: ₹${budget}
    - Estimated Guest Count: ${guestCount}
    - Location: "${eventLocation}"
    - Event Start Time: "${startTime}"
    - Special Requests / Context: "${notes}"

    Return your output EXACTLY as a valid JSON object. Do not include markdown code block syntax (like \`\`\`json) in your raw response. Ensure it has the following JSON structure:
    {
      "isMock": false,
      "description": "A professionally written 2-3 sentence overview/summary describing this event, incorporating its category, vibes, and general style, specifically mentioning that it is set in ${eventLocation}.",
      "themes": ["Theme A", "Theme B", "Theme C"],
      "decorations": ["Decor Detail 1", "Decor Detail 2", "Decor Detail 3"],
      "foods": ["Welcome Drinks details", "Appetizer details", "Main course details", "Dessert details"],
      "timeline": [
        "05:00 PM - Activity 1 (customized to the title and event details)",
        "06:30 PM - Activity 2",
        "08:00 PM - Activity 3"
      ],
      "budgetAllocation": [
        {"category": "Venue & Catering", "amount": 400000, "description": "Venue rental and catering fees"},
        {"category": "Decoration & Theme Setup", "amount": 200000, "description": "Stage decor and lighting"},
        {"category": "Photography & Videography", "amount": 150000, "description": "Media capture and editing"},
        {"category": "Entertainment & DJ", "amount": 150000, "description": "Sound systems and DJ"},
        {"category": "Miscellaneous & Contingency", "amount": 100000, "description": "Contingency buffer and invitations"}
      ],
      "venues": [
        {
          "id": "venue_1",
          "name": "Name of a real/realistic Venue 1 in ${eventLocation}",
          "rating": "4.8 ★",
          "img": "one of these exact strings: /leela_palace.jpg, /monsoon_palace.jpg, /hero_udaipur_3.jpg, /shiv_niwas.jpg, /oberoi_udaivilas.jpg, /taj_lake_palace.jpg, /jag_mandir.jpg",
          "location": "Specific area / address in ${eventLocation}",
          "capacity": "Capacity range (e.g. 150 - 300 Guests)",
          "type": "Venue type (e.g. Luxury Resort, Heritage Hotel, Banquet)",
          "cost": 400000,
          "availability": "Available",
          "desc": "Short description of this venue and why it fits this specific event"
        },
        {
          "id": "venue_2",
          "name": "Name of Venue 2 in ${eventLocation}",
          "rating": "4.5 ★",
          "img": "one of these exact strings: /leela_palace.jpg, /monsoon_palace.jpg, /hero_udaipur_3.jpg, /shiv_niwas.jpg, /oberoi_udaivilas.jpg, /taj_lake_palace.jpg, /jag_mandir.jpg",
          "location": "Specific area / address in ${eventLocation}",
          "capacity": "Capacity range",
          "type": "Venue type",
          "cost": 300000,
          "availability": "Available",
          "desc": "Short description"
        },
        {
          "id": "venue_3",
          "name": "Name of Venue 3 in ${eventLocation}",
          "rating": "4.6 ★",
          "img": "one of these exact strings: /leela_palace.jpg, /monsoon_palace.jpg, /hero_udaipur_3.jpg, /shiv_niwas.jpg, /oberoi_udaivilas.jpg, /taj_lake_palace.jpg, /jag_mandir.jpg",
          "location": "Specific area / address in ${eventLocation}",
          "capacity": "Capacity range",
          "type": "Venue type",
          "cost": 350000,
          "availability": "Available",
          "desc": "Short description"
        }
      ],
      "tips": ["Tip 1", "Tip 2", "Tip 3", "Tip 4"]
    }

    Requirements for values:
    1. The budgetAllocation category amounts must sum up to exactly ₹${budget}. Let the percentages vary dynamically depending on what fits a "${eventType}" best (e.g., weddings spend more on venues, corporate seminars spend more on AV equipment).
    2. Generate 3 real or highly realistic venues in "${eventLocation}". Ensure venue 'cost' represents a realistic portion of the total budget (typically 25% to 45% of the total budget). Set the capacity to comfortably accommodate ${guestCount} guests. Choose the image path matching the style of the hotel.
    3. Generate a realistic timeline customized to a "${eventType}" starting exactly at the event start time "${startTime}".
  `;

  // 1. Try Groq if key is present
  if (groqKey) {
    try {
      console.log('Attempting Groq API for suggestions...');
      const responseText = await callOpenAICompatibleAPI(
        groqKey,
        'https://api.groq.com/openai/v1/chat/completions',
        'llama-3.1-8b-instant',
        prompt
      );
      const parsedData = parseJSONResponse(responseText);
      console.log('Groq API recommendations generated successfully!');
      return res.json(normalizeSuggestions(parsedData, budget, time));
    } catch (err) {
      console.error('Groq API error, trying next option:', err.message);
    }
  }

  // 2. Try Grok (xAI) if key is present
  if (grokKey) {
    try {
      console.log('Attempting xAI Grok API for suggestions...');
      const responseText = await callOpenAICompatibleAPI(
        grokKey,
        'https://api.x.ai/v1/chat/completions',
        'grok-beta',
        prompt
      );
      const parsedData = parseJSONResponse(responseText);
      console.log('xAI Grok API recommendations generated successfully!');
      return res.json(normalizeSuggestions(parsedData, budget, time));
    } catch (err) {
      console.error('xAI Grok API error, trying next option:', err.message);
    }
  }

  // 3. Try Gemini if key is present
  if (geminiKey) {
    try {
      console.log('Attempting Gemini API for suggestions...');
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      const parsedData = parseJSONResponse(text);
      console.log('Gemini API recommendations generated successfully!');
      return res.json(normalizeSuggestions(parsedData, budget, time));
    } catch (err) {
      console.error('Gemini API error, falling back to mock:', err.message);
    }
  }

  // 4. Default Fallback
  console.log('Using local fallback for suggestions...');
  const suggestions = generateFallbackSuggestions(title, eventType, budget, guestCount, time);
  return res.json(suggestions);
};

module.exports = {
  getAISuggestions
};
