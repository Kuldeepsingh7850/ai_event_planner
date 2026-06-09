require('dotenv').config({ path: '../Backend/.env' });

const groqKey = process.env.GROQ_API_KEY;
console.log('Using GROQ_API_KEY:', groqKey ? 'found' : 'missing');

const prompt = `
  You are an expert AI Event Planner & Organizer. Generate professional and highly customized ideas for an event.
  Event Details:
  - Title: "Rahul & Priya Wedding"
  - Type: "Wedding"
  - Total Budget: ₹500000
  - Estimated Guest Count: 250
  - Location: "Udaipur"
  - Event Start Time: "17:00"
  - Special Requests / Context: "None"

  Return your output EXACTLY as a valid JSON object. Do not include markdown code block syntax (like \`\`\`json) in your raw response. Ensure it has the following JSON structure:
  {
    "isMock": false,
    "description": "A professionally written 2-3 sentence overview/summary describing this event, incorporating its category, vibes, and general style, specifically mentioning that it is set in Udaipur.",
    "themes": ["Theme A", "Theme B", "Theme C"],
    "decorations": ["Decor Detail 1", "Decor Detail 2", "Decor Detail 3"],
    "foods": ["Welcome Drinks details", "Appetizer details", "Main course details", "Dessert details"],
    "timeline": [
      "05:00 PM - Activity 1 (customized to the title and event details)",
      "06:30 PM - Activity 2",
      "08:00 PM - Activity 3"
    ],
    "budgetAllocation": [
      {"category": "Venue & Catering", "amount": 200000, "description": "Venue rental and catering fees"},
      {"category": "Decoration & Theme Setup", "amount": 100000, "description": "Stage decor and lighting"},
      {"category": "Photography & Videography", "amount": 75000, "description": "Media capture and editing"},
      {"category": "Entertainment & DJ", "amount": 75000, "description": "Sound systems and DJ"},
      {"category": "Miscellaneous & Contingency", "amount": 50000, "description": "Contingency buffer and invitations"}
    ],
    "venues": [
      {
        "id": "venue_1",
        "name": "Name of a real/realistic Venue 1 in Udaipur",
        "rating": "4.8 ★",
        "img": "/leela_palace.jpg",
        "location": "Specific area / address in Udaipur",
        "capacity": "Capacity range (e.g. 150 - 300 Guests)",
        "type": "Venue type (e.g. Luxury Resort, Heritage Hotel, Banquet)",
        "cost": 200000,
        "availability": "Available",
        "desc": "Short description of this venue and why it fits this specific event"
      },
      {
        "id": "venue_2",
        "name": "Name of Venue 2 in Udaipur",
        "rating": "4.5 ★",
        "img": "/monsoon_palace.jpg",
        "location": "Specific area / address in Udaipur",
        "capacity": "Capacity range",
        "type": "Venue type",
        "cost": 150000,
        "availability": "Available",
        "desc": "Short description"
      },
      {
        "id": "venue_3",
        "name": "Name of Venue 3 in Udaipur",
        "rating": "4.6 ★",
        "img": "/hero_udaipur_3.jpg",
        "location": "Specific area / address in Udaipur",
        "capacity": "Capacity range",
        "type": "Venue type",
        "cost": 175000,
        "availability": "Available",
        "desc": "Short description"
      }
    ],
    "tips": ["Tip 1", "Tip 2", "Tip 3", "Tip 4"]
  }
`;

async function test() {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
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

    const data = await response.json();
    const content = data.choices[0].message.content;
    console.log('Groq Response Content:');
    console.log(content);
  } catch (e) {
    console.error('Error calling Groq:', e);
  }
}
test();
