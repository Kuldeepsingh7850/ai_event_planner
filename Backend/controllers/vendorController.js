const db = require('../config/db');

// @desc    Get all vendors for an event
// @route   GET /api/vendors/:eventId
// @access  Private
const getVendors = async (req, res) => {
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

    const vendors = await db.query('SELECT * FROM vendors WHERE event_id = ?', [eventId]);
    res.json(vendors);
  } catch (error) {
    console.error('Fetch vendors error:', error.message);
    res.status(500).json({ message: 'Server error fetching vendors' });
  }
};

// @desc    Add a vendor
// @route   POST /api/vendor/add
// @access  Private
const addVendor = async (req, res) => {
  const { eventId, vendor_name, category, contact, cost, status } = req.body;

  if (!eventId || !vendor_name || !category || !contact) {
    return res.status(400).json({ message: 'Please provide eventId, vendor name, category, and contact details' });
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

    // Insert vendor
    const result = await db.query(
      'INSERT INTO vendors (event_id, vendor_name, category, contact, cost, status) VALUES (?, ?, ?, ?, ?, ?)',
      [eventId, vendor_name, category, contact, parseFloat(cost || 0), status || 'contacted']
    );

    res.status(201).json({
      id: result.insertId,
      event_id: eventId,
      vendor_name,
      category,
      contact,
      cost: parseFloat(cost || 0),
      status: status || 'contacted'
    });
  } catch (error) {
    console.error('Add vendor error:', error.message);
    res.status(500).json({ message: 'Server error adding vendor' });
  }
};

// @desc    Update vendor hiring status
// @route   PUT /api/vendor/:id
// @access  Private
const updateVendor = async (req, res) => {
  const vendorId = req.params.id;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Please provide vendor status' });
  }

  try {
    // Find vendor
    const vendors = await db.query('SELECT * FROM vendors WHERE id = ?', [vendorId]);
    if (vendors.length === 0) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const vendor = vendors[0];
    const eventId = vendor.event_id;

    // Check event ownership
    const events = await db.query('SELECT * FROM events WHERE id = ?', [eventId]);
    if (events.length === 0) {
      return res.status(404).json({ message: 'Associated event not found' });
    }
    if (events[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update status
    await db.query('UPDATE vendors SET status = ? WHERE id = ?', [status, vendorId]);

    // Notify user if hired
    if (status === 'hired') {
      await db.query(
        'INSERT INTO notifications (user_id, message, status) VALUES (?, ?, ?)',
        [
          req.user.id,
          `Vendor "${vendor.vendor_name}" has been officially hired for your event "${events[0].title}".`,
          'unread'
        ]
      );
    }

    res.json({ message: 'Vendor status updated successfully' });
  } catch (error) {
    console.error('Update vendor error:', error.message);
    res.status(500).json({ message: 'Server error updating vendor' });
  }
};

// @desc    Delete a vendor
// @route   DELETE /api/vendor/:id
// @access  Private
const deleteVendor = async (req, res) => {
  const vendorId = req.params.id;

  try {
    // Find vendor
    const vendors = await db.query('SELECT * FROM vendors WHERE id = ?', [vendorId]);
    if (vendors.length === 0) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const vendor = vendors[0];
    const eventId = vendor.event_id;

    // Check event ownership
    const events = await db.query('SELECT * FROM events WHERE id = ?', [eventId]);
    if (events.length === 0) {
      return res.status(404).json({ message: 'Associated event not found' });
    }
    if (events[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete vendor
    await db.query('DELETE FROM vendors WHERE id = ?', [vendorId]);

    res.json({ message: 'Vendor removed successfully' });
  } catch (error) {
    console.error('Delete vendor error:', error.message);
    res.status(500).json({ message: 'Server error deleting vendor' });
  }
};

module.exports = {
  getVendors,
  addVendor,
  updateVendor,
  deleteVendor
};
