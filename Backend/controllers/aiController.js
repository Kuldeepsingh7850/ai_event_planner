const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Helper to generate dynamic fallback suggestions based on event details
const generateFallbackSuggestions = (title, eventType, budget, guestCount) => {
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
    timeline,
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

// @desc    Get AI Suggestions based on event requirements
// @route   POST /api/ai/suggestions
// @access  Private
const getAISuggestions = async (req, res) => {
  const { title, eventType, budget, guestCount } = req.body;

  if (!title || !eventType || !budget || !guestCount) {
    return res.status(400).json({ message: 'Please provide all details: title, eventType, budget, guestCount' });
  }

  const groqKey = process.env.GROQ_API_KEY;
  const grokKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  const prompt = `
    You are an expert AI Event Planner & Organizer. Generate professional ideas for an event.
    Event Details:
    - Title: "${title}"
    - Type: "${eventType}"
    - Total Budget: ₹${budget}
    - Estimated Guest Count: ${guestCount}

    Return your output EXACTLY as a valid JSON object. Do not include markdown code block syntax (like \`\`\`json) in your raw response. Ensure it has the following JSON structure:
    {
      "isMock": false,
      "description": "A professionally written 2-3 sentence overview/summary describing this event, incorporating its category, vibes, and general style.",
      "themes": ["Theme A", "Theme B", "Theme C"],
      "decorations": ["Decor Detail 1", "Decor Detail 2", "Decor Detail 3"],
      "foods": ["Welcome Drinks details", "Appetizer details", "Main course details", "Dessert details"],
      "timeline": [
        "09:00 AM - Activity 1",
        "10:30 AM - Activity 2",
        "12:00 PM - Activity 3"
      ],
      "budgetAllocation": [
        {"category": "Venue & Catering (40%)", "amount": ${parseFloat(budget) * 0.4}, "description": "Venue rental and catering fees"},
        {"category": "Decoration & Theme Setup (20%)", "amount": ${parseFloat(budget) * 0.2}, "description": "Stage decor and lighting"},
        {"category": "Photography & Videography (15%)", "amount": ${parseFloat(budget) * 0.15}, "description": "Media capture and editing"},
        {"category": "Entertainment & DJ (15%)", "amount": ${parseFloat(budget) * 0.15}, "description": "Sound systems and DJ"},
        {"category": "Miscellaneous & Contingency (10%)", "amount": ${parseFloat(budget) * 0.1}, "description": "Contingency buffer and invitations"}
      ],
      "tips": ["Tip 1", "Tip 2", "Tip 3", "Tip 4"]
    }

    Provide realistic cost values in budgetAllocation summing up to exactly ₹${budget}. Ensure tips are specific to the type of event "${eventType}".
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
      return res.json(parsedData);
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
      return res.json(parsedData);
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
      return res.json(parsedData);
    } catch (err) {
      console.error('Gemini API error, falling back to mock:', err.message);
    }
  }

  // 4. Default Fallback
  console.log('Using local fallback for suggestions...');
  const suggestions = generateFallbackSuggestions(title, eventType, budget, guestCount);
  return res.json(suggestions);
};

module.exports = {
  getAISuggestions
};
