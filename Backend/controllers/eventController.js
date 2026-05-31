const db = require('../config/db');

// @desc    Get all events for logged in user (or all events if admin)
// @route   GET /api/events
// @access  Private
const getEvents = async (req, res) => {
  try {
    let events;
    console.log(`[DEBUG] getEvents called by User ID: ${req.user.id}, Email: ${req.user.email}, Role: ${req.user.role}`);
    if (req.user.role === 'admin') {
      events = await db.query('SELECT e.*, b.expenses, b.remaining_budget FROM events e LEFT JOIN budget b ON e.id = b.event_id');
    } else {
      events = await db.query('SELECT e.*, b.expenses, b.remaining_budget FROM events e LEFT JOIN budget b ON e.id = b.event_id WHERE e.user_id = ?', [req.user.id]);
    }
    console.log(`[DEBUG] Found ${events.length} events for user ID ${req.user.id}:`, events.map(e => ({ id: e.id, title: e.title })));
    res.json(events);
  } catch (error) {
    console.error('Fetch events error:', error.message);
    res.status(500).json({ message: 'Server error fetching events' });
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
  const { title, description, event_type, date, time, location, budget, guest_count } = req.body;

  if (!title || !event_type || !date || !time || !location || !budget || !guest_count) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    // 1. Insert Event
    const result = await db.query(
      'INSERT INTO events (user_id, title, description, event_type, date, time, location, budget, guest_count, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, title, description || '', event_type, date, time, location, parseFloat(budget), parseInt(guest_count), 'planning']
    );

    const eventId = result.insertId;

    // 2. Create Budget entry (db query handles this automatically in mock, but for real MySQL we run SQL)
    if (!db.isMock()) {
      await db.query(
        'INSERT INTO budget (event_id, total_budget, expenses, remaining_budget) VALUES (?, ?, ?, ?)',
        [eventId, parseFloat(budget), 0.00, parseFloat(budget)]
      );
    }

    // 3. Create Notification
    await db.query(
      'INSERT INTO notifications (user_id, message, status) VALUES (?, ?, ?)',
      [req.user.id, `Event "${title}" has been successfully created.`, 'unread']
    );

    res.status(201).json({
      id: eventId,
      user_id: req.user.id,
      title,
      description,
      event_type,
      date,
      time,
      location,
      budget,
      guest_count,
      status: 'planning'
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
  const { title, description, event_type, date, time, location, budget, guest_count, status } = req.body;

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
      if (formattedDate instanceof Date) {
        formattedDate = formattedDate.toISOString().split('T')[0];
      } else if (typeof formattedDate === 'string' && formattedDate.includes('T')) {
        formattedDate = formattedDate.split('T')[0];
      }
    }

    // Update event details
    await db.query(
      'UPDATE events SET title=?, description=?, event_type=?, date=?, time=?, location=?, budget=?, guest_count=?, status=? WHERE id=?',
      [
        title || event.title,
        description !== undefined ? description : event.description,
        event_type || event.event_type,
        formattedDate,
        time || event.time,
        location || event.location,
        budget !== undefined ? parseFloat(budget) : event.budget,
        guest_count !== undefined ? parseInt(guest_count) : event.guest_count,
        status || event.status,
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
    res.status(500).json({ message: 'Server error updating event' });
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

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
};
