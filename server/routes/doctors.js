const express = require('express');
const router = express.Router();
const { readData, writeData } = require('../db/dbClient');
const { authenticateToken, requireRole } = require('../middleware/auth');

/**
 * GET /api/doctors
 * Optional Queries: search (by name or specialization), specialization, date
 */
router.get('/', (req, res) => {
  try {
    const db = readData();
    let doctors = db.doctors;

    const { search, specialization, date } = req.query;

    if (search) {
      const searchLower = search.toLowerCase();
      doctors = doctors.filter(d => 
        d.name.toLowerCase().includes(searchLower) || 
        d.specialization.toLowerCase().includes(searchLower)
      );
    }

    if (specialization) {
      const specLower = specialization.toLowerCase();
      doctors = doctors.filter(d => d.specialization.toLowerCase() === specLower);
    }

    if (date) {
      // Filter doctors who have at least one unbooked slot on this date
      doctors = doctors.filter(d => 
        d.availableSlots.some(slot => slot.date === date && !slot.isBooked)
      );
    }

    // Exclude sensitive user/pass data (we only have profile details here anyway)
    return res.json(doctors);
  } catch (error) {
    console.error('Fetch doctors error:', error);
    return res.status(500).json({ message: 'Internal Server Error fetching doctors' });
  }
});

/**
 * GET /api/doctors/:id
 * Retrieve doctor by ID
 */
router.get('/:id', (req, res) => {
  try {
    const db = readData();
    const doctor = db.doctors.find(d => d.id === req.params.id);

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    return res.json(doctor);
  } catch (error) {
    console.error('Fetch doctor by ID error:', error);
    return res.status(500).json({ message: 'Internal Server Error fetching doctor profile' });
  }
});

/**
 * PUT /api/doctors/:id/slots
 * Manage slots (Add a slot, remove an unbooked slot, or replace the slots list)
 */
router.put('/:id/slots', authenticateToken, requireRole('doctor'), (req, res) => {
  try {
    const db = readData();
    const doctor = db.doctors.find(d => d.id === req.params.id);

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Ensure the doctor is editing their own slots
    if (doctor.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied: You can only edit your own slots' });
    }

    const { action, slot, slotId, slots } = req.body;

    if (action === 'add') {
      if (!slot || !slot.date || !slot.time) {
        return res.status(400).json({ message: 'Slot date and time are required' });
      }

      // Check if slot already exists
      const slotExists = doctor.availableSlots.some(s => s.date === slot.date && s.time === slot.time);
      if (slotExists) {
        return res.status(400).json({ message: 'This time slot already exists' });
      }

      const newSlot = {
        id: 'slot_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        date: slot.date,
        time: slot.time,
        isBooked: false
      };

      doctor.availableSlots.push(newSlot);

    } else if (action === 'remove') {
      if (!slotId) {
        return res.status(400).json({ message: 'slotId is required to remove a slot' });
      }

      const slotIdx = doctor.availableSlots.findIndex(s => s.id === slotId);
      if (slotIdx === -1) {
        return res.status(404).json({ message: 'Slot not found' });
      }

      if (doctor.availableSlots[slotIdx].isBooked) {
        return res.status(400).json({ message: 'Cannot delete a slot that is already booked' });
      }

      doctor.availableSlots.splice(slotIdx, 1);

    } else if (slots && Array.isArray(slots)) {
      // Direct replacement support
      const bookedSlots = doctor.availableSlots.filter(s => s.isBooked);
      
      const newSlots = slots.map(s => ({
        id: s.id || 'slot_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        date: s.date,
        time: s.time,
        isBooked: s.isBooked || false
      }));

      // Ensure booked slots are not lost during update
      bookedSlots.forEach(bs => {
        if (!newSlots.some(s => s.id === bs.id)) {
          newSlots.push(bs);
        }
      });

      doctor.availableSlots = newSlots;

    } else {
      return res.status(400).json({ message: 'Invalid request: must supply action (add/remove) or a slots array' });
    }

    // Sort slots by date and time
    doctor.availableSlots.sort((a, b) => {
      const dateDiff = new Date(a.date) - new Date(b.date);
      if (dateDiff !== 0) return dateDiff;
      // Simple string comparison for time (AM/PM) works decently if padded, 
      // but let's do a basic time conversion for perfect sorting if needed
      return a.time.localeCompare(b.time);
    });

    writeData(db);
    return res.json({
      message: 'Slots updated successfully',
      availableSlots: doctor.availableSlots
    });

  } catch (error) {
    console.error('Update slots error:', error);
    return res.status(500).json({ message: 'Internal Server Error updating slots' });
  }
});

module.exports = router;
