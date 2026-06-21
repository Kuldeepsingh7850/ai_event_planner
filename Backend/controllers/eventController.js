const db = require('../config/db');

// @desc    Get all events for logged in user (or all events if admin)
// @route   GET /api/events
// @access  Private
const getEvents = async (req, res) => {
  try {
    console.log(`[DEBUG] getEvents called by User ID: ${req.user.id}, Email: ${req.user.email}, Role: ${req.user.role}`);
    const events = await db.query('SELECT e.*, b.expenses, b.remaining_budget FROM events e LEFT JOIN budget b ON e.id = b.event_id WHERE e.user_id = ?', [req.user.id]);
    console.log(`[DEBUG] Found ${events.length} events for user ID ${req.user.id}:`, events.map(e => ({ id: e.id, title: e.title })));
    res.json(events);
  } catch (error) {
    console.error('Fetch events error:', error.message);
    res.status(500).json({ message: 'Server error fetching events' });
  }
};

const getAdminEvents = async (req, res) => {
  try {
    console.log(`[DEBUG] getAdminEvents called by User ID: ${req.user.id}, Email: ${req.user.email}`);
    const events = await db.query(
      'SELECT e.*, u.name AS user_name, u.email AS user_email, b.expenses, b.remaining_budget ' +
      'FROM events e ' +
      'LEFT JOIN users u ON e.user_id = u.id ' +
      'LEFT JOIN budget b ON e.id = b.event_id'
    );
    console.log(`[DEBUG] Found ${events.length} events for admin moderation.`);
    res.json(events);
  } catch (error) {
    console.error('Fetch admin events error:', error.message);
    res.status(500).json({ message: 'Server error fetching admin events' });
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Private
const getEventById = async (req, res) => {
  const eventId = req.params.id;

  try {
    const events = await db.query('SELECT e.*, b.expenses, b.remaining_budget FROM events e LEFT JOIN budget b ON e.id = b.event_id WHERE e.id = ?', [eventId]);
    if (events.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const event = events[0];

    // Check authorization (must be creator or admin)
    if (event.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this event' });
    }

    res.json(event);
  } catch (error) {
    console.error('Fetch event detail error:', error.message);
    res.status(500).json({ message: 'Server error fetching event details' });
  }
};

// @desc    Create an event
// @route   POST /api/create-event
// @access  Private
const createEvent = async (req, res) => {
  const { title, event_type, date, time, location, budget, guest_count, theme, timeline, venue } = req.body;

  if (!title || !event_type || !date || !time || !location || !budget || !guest_count) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    // 1. Insert Event
    const result = await db.query(
      'INSERT INTO events (user_id, title, event_type, date, time, location, budget, guest_count, status, theme) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, title, event_type, date, time, location, parseFloat(budget), parseInt(guest_count), 'planning', theme || 'Royal / Traditional']
    );

    const eventId = result.insertId;

    // 2. Create Budget entry (db query handles this automatically in mock, but for real MySQL we run SQL)
    if (!db.isMock()) {
      await db.query(
        'INSERT INTO budget (event_id, total_budget, expenses, remaining_budget) VALUES (?, ?, ?, ?)',
        [eventId, parseFloat(budget), 0.00, parseFloat(budget)]
      );
    }

    // 3. Create AI-suggested timeline tasks if provided
    if (timeline && Array.isArray(timeline)) {
      for (const taskItem of timeline) {
        await db.query(
          'INSERT INTO tasks (event_id, title, deadline, status) VALUES (?, ?, ?, ?)',
          [eventId, taskItem, date, 'pending']
        );
      }
    }

    // 4. Create AI-selected venue as a vendor if provided
    if (venue) {
      await db.query(
        'INSERT INTO vendors (event_id, vendor_name, category, contact, cost, status) VALUES (?, ?, ?, ?, ?, ?)',
        [eventId, venue.name, 'Venue', venue.location || 'Udaipur, Rajasthan', parseFloat(venue.cost) || 0.00, 'hired']
      );
    }

    // 5. Create Notification
    await db.query(
      'INSERT INTO notifications (user_id, message, status) VALUES (?, ?, ?)',
      [req.user.id, `Event "${title}" has been successfully created.`, 'unread']
    );

    // Send event creation notification to admins
    try {
      const admins = await db.query("SELECT id FROM users WHERE role = 'admin'");
      for (const admin of admins) {
        await db.query(
          "INSERT INTO notifications (user_id, message, status) VALUES (?, ?, 'unread')",
          [admin.id, `New event added: "${title}" by ${req.user.name || 'User'}`]
        );
      }
    } catch (err) {
      console.error('Failed to create admin notification for event:', err.message);
    }

    res.status(201).json({
      id: eventId,
      user_id: req.user.id,
      title,
      event_type,
      date,
      time,
      location,
      budget,
      guest_count,
      status: 'planning',
      theme: theme || 'Royal / Traditional'
    });
  } catch (error) {
    console.error('Create event error:', error.message);
    res.status(500).json({ message: 'Server error creating event' });
  }
};

// @desc    Update an event
// @route   PUT /api/update-event/:id
// @access  Private
const updateEvent = async (req, res) => {
  const eventId = req.params.id;
  const { title, event_type, date, time, location, budget, guest_count, status, theme } = req.body;

  try {
    // Check if event exists
    const events = await db.query('SELECT * FROM events WHERE id = ?', [eventId]);
    if (events.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const event = events[0];

    // Check authorization
    if (event.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    // Format date properly to YYYY-MM-DD for MySQL to prevent E_INVALID_DATE errors
    let formattedDate = date || event.date;
    if (formattedDate) {
      if (typeof formattedDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(formattedDate)) {
        // Already in YYYY-MM-DD format
      } else if (typeof formattedDate === 'string' && formattedDate.includes('T')) {
        formattedDate = formattedDate.split('T')[0];
      } else {
        const parsedDate = new Date(formattedDate);
        if (!isNaN(parsedDate.getTime())) {
          const year = parsedDate.getFullYear();
          const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
          const day = String(parsedDate.getDate()).padStart(2, '0');
          formattedDate = `${year}-${month}-${day}`;
        }
      }
    }

    // Update event details
    await db.query(
      'UPDATE events SET title=?, event_type=?, date=?, time=?, location=?, budget=?, guest_count=?, status=?, theme=? WHERE id=?',
      [
        title || event.title,
        event_type || event.event_type,
        formattedDate,
        time || event.time,
        location || event.location,
        budget !== undefined ? parseFloat(budget) : event.budget,
        guest_count !== undefined ? parseInt(guest_count) : event.guest_count,
        status || event.status,
        theme || event.theme,
        eventId
      ]
    );

    // If budget changed, recalculate remaining budget in real MySQL
    if (!db.isMock() && budget !== undefined) {
      const budgetEntries = await db.query('SELECT * FROM budget WHERE event_id = ?', [eventId]);
      if (budgetEntries.length > 0) {
        const b = budgetEntries[0];
        const newRemaining = parseFloat(budget) - parseFloat(b.expenses);
        await db.query(
          'UPDATE budget SET total_budget = ?, remaining_budget = ? WHERE event_id = ?',
          [parseFloat(budget), newRemaining, eventId]
        );
      }
    }

    res.json({ message: 'Event updated successfully' });
  } catch (error) {
    console.error('Update event error:', error.message);
    res.status(500).json({ message: `Server error updating event: ${error.message}` });
  }
};

// @desc    Delete an event
// @route   DELETE /api/delete-event/:id
// @access  Private
const deleteEvent = async (req, res) => {
  const eventId = req.params.id;

  try {
    // Check if event exists
    const events = await db.query('SELECT * FROM events WHERE id = ?', [eventId]);
    if (events.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const event = events[0];

    // Check authorization
    if (event.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    // Delete Event
    await db.query('DELETE FROM events WHERE id = ?', [eventId]);

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error.message);
    res.status(500).json({ message: 'Server error deleting event' });
  }
};

// @desc    Get landing page public real-time statistics
// @route   GET /api/public-stats
// @access  Public
const getPublicStats = async (req, res) => {
  try {
    // 1. Events Planned
    const eventsPlannedRes = await db.query('SELECT COUNT(*) AS count FROM events');
    let eventsPlannedCount = 0;
    if (db.isMock()) {
      eventsPlannedCount = Array.isArray(eventsPlannedRes) ? eventsPlannedRes.length : 0;
    } else {
      eventsPlannedCount = eventsPlannedRes && eventsPlannedRes[0] ? eventsPlannedRes[0].count : 0;
    }

    // 2. Happy Clients
    const usersRes = await db.query('SELECT COUNT(*) AS count FROM users');
    let usersCount = 0;
    if (db.isMock()) {
      usersCount = Array.isArray(usersRes) ? usersRes.length : 0;
    } else {
      usersCount = usersRes && usersRes[0] ? usersRes[0].count : 0;
    }

    // 3. Top Venues (Unique venues planned + a base of default venues e.g., 15)
    let uniqueLocationsCount = 0;
    if (db.isMock()) {
      const uniqueLocs = new Set(Array.isArray(eventsPlannedRes) ? eventsPlannedRes.map(e => e.location) : []);
      uniqueLocationsCount = uniqueLocs.size;
    } else {
      const venuesRes = await db.query('SELECT COUNT(DISTINCT location) AS count FROM events');
      uniqueLocationsCount = venuesRes && venuesRes[0] ? venuesRes[0].count : 0;
    }
    const topVenuesCount = 15 + uniqueLocationsCount;

    // 4. Client Rating
    let averageRating = '4.8';
    const feedbackRes = await db.query('SELECT AVG(rating) AS avg_rating FROM feedback');
    if (db.isMock()) {
      const feedbacks = Array.isArray(feedbackRes) ? feedbackRes : [];
      if (feedbacks.length > 0) {
        const sum = feedbacks.reduce((acc, f) => acc + (f.rating || 0), 0);
        averageRating = (sum / feedbacks.length).toFixed(1);
      }
    } else {
      averageRating = feedbackRes && feedbackRes[0] && feedbackRes[0].avg_rating !== null
        ? parseFloat(feedbackRes[0].avg_rating).toFixed(1)
        : '4.8';
    }

    res.json({
      eventsPlanned: eventsPlannedCount,
      happyClients: usersCount,
      topVenues: topVenuesCount,
      clientRating: averageRating
    });
  } catch (error) {
    console.error('Fetch public statistics error:', error.message);
    res.status(500).json({ message: 'Server error fetching public statistics' });
  }
};

module.exports = {
  getEvents,
  getAdminEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getPublicStats
};
