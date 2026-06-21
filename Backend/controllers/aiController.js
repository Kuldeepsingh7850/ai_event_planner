const db = require('../config/db');
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
  const { title, eventType, budget, guestCount, location, time, specialRequests, description, venues } = req.body;

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
          "id": "unique_id_string_like_ananta",
          "name": "Name of a real/realistic Venue in ${eventLocation} from internet/knowledge base",
          "rating": "4.8 ★",
          "img": "image_path_or_url",
          "location": "Specific area / address in Udaipur",
          "capacity": "Capacity range (e.g. 150 - 300 Guests)",
          "type": "Venue type (e.g. Luxury Resort, Hilltop Retreat, Open Lawn)",
          "cost": 400000,
          "availability": "Available",
          "desc": "Short description of this venue and why it fits this specific event"
        }
      ],
      "tips": ["Tip 1", "Tip 2", "Tip 3", "Tip 4"]
    }

    Requirements for values:
    1. The budgetAllocation category amounts must sum up to exactly ₹${budget}. Let the percentages vary dynamically depending on what fits a "${eventType}" best (e.g., weddings spend more on venues, corporate seminars spend more on AV equipment).
    2. Suggest exactly 3 or 4 real venues in Udaipur based strictly on the Total Budget of ₹${budget}:
       - If the Total Budget is LOW (Budget < ₹1,00,000, like a small birthday party or event under ₹1,00,000):
         You MUST NOT suggest ultra-luxury hotels/palaces (like The Leela Palace, Oberoi Udaivilas, Taj Lake Palace, Fateh Garh, Shiv Niwas Palace, Radisson Blu, Ramada Resort, Chunda Palace, etc.) because booking them is completely unrealistic for this budget. Instead, suggest real budget venues, party halls, restaurants, or community gardens in Udaipur, such as Ashoka Palace, Hotel Hilltop Palace, Valley View, Aravali Lawn, Tribute Restaurant, Ambrai Restaurant, Mewar Food Court, local community halls, or dharamshalas. Ensure the venue "cost" is realistic (e.g. ₹5,000 to ₹15,000).
       - If the Total Budget is MID-RANGE (Budget ₹1,00,000 - ₹5,00,000):
         Suggest mid-range hotels/resorts in Udaipur, such as Spectrum Resort, Mewar Garh, Labh Garh Palace, Justa Rajputana, Shaurya Garh, Bijolai Fort, Aravali Lawn, or Hotel Hilltop Palace. Ensure venue "cost" is realistic (e.g. ₹25,000 to ₹1,20,000).
       - If the Total Budget is LUXURY/HIGH (Budget > ₹5,00,000):
         You may suggest ultra-luxury hotels, heritage resorts, and royal palaces in Udaipur, such as The Leela Palace Udaipur, Taj Lake Palace, The Oberoi Udaivilas, Fateh Garh Resort, Bhanwar Singh Palace, Radisson Blu Udaipur, Ramada Resort, or Shiv Niwas Palace. Ensure the venue "cost" is realistic (e.g. ₹1,50,000 to ₹4,00,000).
    3. For the "img" field of each suggested venue:
       - If you suggest any of these local assets, use their exact path:
         * The Leela Palace Udaipur -> /leela_palace.jpg
         * Fateh Garh Resort -> /monsoon_palace.jpg
         * Radisson Blu Udaipur -> /hero_udaipur_3.jpg
         * Ramada Resort Udaipur -> /shiv_niwas.jpg
         * The Oberoi Udaivilas -> /oberoi_udaivilas.jpg
         * Taj Lake Palace -> /taj_lake_palace.jpg
         * Jag Mandir Island Palace -> /jag_mandir.jpg
       - Otherwise, you MUST choose one of these beautiful, high-quality, stable hotel/event-space Unsplash image URLs:
         * https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80 (Luxury Resort)
         * https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80 (Heritage Mansion)
         * https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80 (Poolside Resort)
         * https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80 (Luxury Hotel)
         * https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80 (Grand Entrance)
         * https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80 (Heritage Hotel)
         * https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80 (Resort Courtyard)
         * https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80 (Outdoor Event Lawn)
         * https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80 (Banquet Hall)
    4. Generate a realistic timeline customized to a "${eventType}" starting exactly at the event start time "${startTime}".
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
      console.error('Groq API error, falling back to mock:', err.message);
    }
  }

  // 2. Default Fallback
  console.log('Using local fallback for suggestions...');
  const suggestions = generateFallbackSuggestions(title, eventType, budget, guestCount, time);
  return res.json(suggestions);
};

const chatWithAI = async (req, res) => {
  const { eventId, message, history } = req.body;

  if (!eventId || !message) {
    return res.status(400).json({ message: 'Event ID and message are required' });
  }

  try {
    // 1. Fetch Event details
    const events = await db.query('SELECT * FROM events WHERE id = ?', [eventId]);
    if (events.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }
    const event = events[0];

    // 2. Fetch Budget details
    const budgets = await db.query('SELECT * FROM budget WHERE event_id = ?', [eventId]);
    const budget = budgets[0] || null;

    // 3. Fetch Tasks
    const tasks = await db.query('SELECT * FROM tasks WHERE event_id = ?', [eventId]);
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;

    // 4. Fetch Guests
    const guests = await db.query('SELECT * FROM guests WHERE event_id = ?', [eventId]);
    const totalGuests = guests.length;
    const confirmedGuests = guests.filter(g => g.status === 'confirmed').length;

    // 5. Fetch Vendors
    const vendors = await db.query('SELECT * FROM vendors WHERE event_id = ?', [eventId]);
    const vendorsList = vendors.map(v => `${v.vendor_name} (${v.category}, Cost: ₹${v.cost}, Status: ${v.status})`).join(', ');

    // 6. Construct Event Context Prompt
    const eventContext = `
You are an expert AI Event Planner assistant. The user is planning an event with the following live details:
- Title: "${event.title}"
- Type: "${event.event_type}"
- Date: "${event.date ? event.date.toISOString().split('T')[0] : 'N/A'}"
- Location: "${event.location}"
- Total Budget: ₹${event.budget}
- Spent Budget: ₹${budget ? budget.expenses : 0}
- Remaining Budget: ₹${budget ? budget.remaining_budget : event.budget}
- Guests: ${totalGuests} invited (${confirmedGuests} confirmed)
- Tasks: ${totalTasks} total (${completedTasks} completed)
- Hired Vendors: ${vendorsList || 'None hired yet'}

Provide a helpful, polite, and contextual answer to the user's question. Answer in the same language the user asks the question (Hinglish/Hindi or English). Keep your response concise and focused on planning the event.
`;

    // 7. Format messages history for the LLM
    const messages = [
      { role: 'system', content: eventContext }
    ];

    if (history && Array.isArray(history)) {
      history.slice(-10).forEach(msg => {
        messages.push({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        });
      });
    }

    messages.push({ role: 'user', content: message });

    const groqKey = process.env.GROQ_API_KEY;

    let reply = "";

    if (groqKey) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: messages,
            temperature: 0.7
          })
        });
        if (response.ok) {
          const data = await response.json();
          reply = data.choices[0].message.content;
        }
      } catch (err) {
        console.error('Groq Chat Error:', err.message);
      }
    }

    if (!reply) {
      reply = `I'm here to help you plan your event "${event.title}". Unfortunately, I cannot connect to the AI service right now. Please check back later!`;
    }

    return res.json({ reply });
  } catch (err) {
    console.error('Chat controller error:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  getAISuggestions,
  chatWithAI
};
