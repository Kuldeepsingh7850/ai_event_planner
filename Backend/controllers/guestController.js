const db = require('../config/db');

// @desc    Get all guests for an event
// @route   GET /api/guests/:eventId
// @access  Private
const getGuests = async (req, res) => {
  const { eventId } = req.params;

  try {
    // Check event ownership
    const events = await db.query('SELECT * FROM events WHERE id = ?', [eventId]);
    if (events.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }
    if (events[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const guests = await db.query('SELECT * FROM guests WHERE event_id = ?', [eventId]);
    res.json(guests);
  } catch (error) {
    console.error('Fetch guests error:', error.message);
    res.status(500).json({ message: 'Server error fetching guests' });
  }
};

// @desc    Add a guest to an event
// @route   POST /api/guest/add
// @access  Private
const addGuest = async (req, res) => {
  const { eventId, guest_name, email, status } = req.body;

  if (!eventId || !guest_name || !email) {
    return res.status(400).json({ message: 'Please provide eventId, guest name, and email' });
  }

  try {
    // Check event ownership
    const events = await db.query('SELECT * FROM events WHERE id = ?', [eventId]);
    if (events.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }
    if (events[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Insert guest
    const result = await db.query(
      'INSERT INTO guests (event_id, guest_name, email, status) VALUES (?, ?, ?, ?)',
      [eventId, guest_name, email, status || 'pending']
    );

    res.status(201).json({
      id: result.insertId,
      event_id: eventId,
      guest_name,
      email,
      status: status || 'pending'
    });
  } catch (error) {
    console.error('Add guest error:', error.message);
    res.status(500).json({ message: 'Server error adding guest' });
  }
};

// @desc    Update a guest RSVP status / details
// @route   PUT /api/guest/:id
// @access  Private
const updateGuest = async (req, res) => {
  const guestId = req.params.id;
  const { guest_name, email, status } = req.body;

  try {
    // Find guest
    const guests = await db.query('SELECT * FROM guests WHERE id = ?', [guestId]);
    if (guests.length === 0) {
      return res.status(404).json({ message: 'Guest not found' });
    }

    const guest = guests[0];
    const eventId = guest.event_id;

    // Check event ownership
    const events = await db.query('SELECT * FROM events WHERE id = ?', [eventId]);
    if (events.length === 0) {
      return res.status(404).json({ message: 'Associated event not found' });
    }
    if (events[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update guest
    await db.query(
      'UPDATE guests SET guest_name = ?, email = ?, status = ? WHERE id = ?',
      [guest_name || guest.guest_name, email || guest.email, status || guest.status, guestId]
    );

    res.json({ message: 'Guest details updated successfully' });
  } catch (error) {
    console.error('Update guest error:', error.message);
    res.status(500).json({ message: 'Server error updating guest' });
  }
};

// @desc    Delete a guest
// @route   DELETE /api/guest/:id
// @access  Private
const deleteGuest = async (req, res) => {
  const guestId = req.params.id;

  try {
    // Find guest
    const guests = await db.query('SELECT * FROM guests WHERE id = ?', [guestId]);
    if (guests.length === 0) {
      return res.status(404).json({ message: 'Guest not found' });
    }

    const guest = guests[0];
    const eventId = guest.event_id;

    // Check event ownership
    const events = await db.query('SELECT * FROM events WHERE id = ?', [eventId]);
    if (events.length === 0) {
      return res.status(404).json({ message: 'Associated event not found' });
    }
    if (events[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete guest
    await db.query('DELETE FROM guests WHERE id = ?', [guestId]);

    res.json({ message: 'Guest removed successfully' });
  } catch (error) {
    console.error('Delete guest error:', error.message);
    res.status(500).json({ message: 'Server error deleting guest' });
  }
};

module.exports = {
  getGuests,
  addGuest,
  updateGuest,
  deleteGuest
};
