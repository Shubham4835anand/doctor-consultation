const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { readData, writeData } = require('../db/dbClient');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Protect all admin routes with JWT auth and Admin role check
router.use(authenticateToken);
router.use(requireRole('admin'));

/**
 * GET /api/admin/appointments
 * Retrieve all appointments in the system
 */
router.get('/appointments', (req, res) => {
  try {
    const db = readData();
    return res.json(db.appointments);
  } catch (error) {
    console.error('Admin fetch appointments error:', error);
    return res.status(500).json({ message: 'Internal Server Error retrieving all appointments' });
  }
});

/**
 * POST /api/admin/doctors
 * Add a new doctor (adds both User credentials and Doctor Profile)
 */
router.post('/doctors', (req, res) => {
  const { name, email, password, specialization, experience, fee, bio } = req.body;

  if (!name || !email || !password || !specialization || !experience || !fee) {
    return res.status(400).json({ message: 'All fields (name, email, password, specialization, experience, fee) are required' });
  }

  try {
    const db = readData();

    // Check if email already exists
    const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ message: 'Email address is already in use' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const userId = 'u_' + Date.now();
    const newUser = {
      id: userId,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'doctor'
    };

    const doctorId = 'd_' + Date.now();
    const newDoctor = {
      id: doctorId,
      userId,
      name,
      specialization,
      experience: Number(experience),
      fee: Number(fee),
      rating: 5.0,
      bio: bio || `Dr. ${name} is a specialist in ${specialization}.`,
      availableSlots: []
    };

    db.users.push(newUser);
    db.doctors.push(newDoctor);
    
    writeData(db);

    return res.status(201).json({
      message: 'Doctor created successfully by admin',
      doctor: newDoctor
    });

  } catch (error) {
    console.error('Admin create doctor error:', error);
    return res.status(500).json({ message: 'Internal Server Error creating doctor' });
  }
});

/**
 * DELETE /api/admin/doctors/:id
 * Remove doctor profile and associated user credentials
 */
router.delete('/doctors/:id', (req, res) => {
  const doctorId = req.params.id;

  try {
    const db = readData();

    const doctorIndex = db.doctors.findIndex(d => d.id === doctorId);
    if (doctorIndex === -1) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const doctor = db.doctors[doctorIndex];

    // Remove from users list
    db.users = db.users.filter(u => u.id !== doctor.userId);

    // Remove from doctors list
    db.doctors.splice(doctorIndex, 1);

    // Auto-cancel any pending appointments with this doctor
    db.appointments = db.appointments.map(a => {
      if (a.doctorId === doctorId && a.status === 'pending') {
        return { ...a, status: 'cancelled' };
      }
      return a;
    });

    writeData(db);

    return res.json({
      message: 'Doctor and login credentials successfully deleted'
    });

  } catch (error) {
    console.error('Admin delete doctor error:', error);
    return res.status(500).json({ message: 'Internal Server Error deleting doctor' });
  }
});

module.exports = router;
