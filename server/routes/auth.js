const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { readData, writeData } = require('../db/dbClient');

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey12345';

/**
 * POST /api/auth/register
 * Request Body: { name, email, password, role, specialization, experience, fee, bio }
 */
router.post('/register', (req, res) => {
  const { name, email, password, role, specialization, experience, fee, bio } = req.body;

  // Simple validations
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'All standard fields (name, email, password, role) are required' });
  }

  const validRoles = ['patient', 'doctor'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role. Must be either patient or doctor.' });
  }

  const db = readData();

  // Check if email already exists
  const existingUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return res.status(400).json({ message: 'User with this email already exists' });
  }

  // If role is doctor, validate doctor-specific fields
  if (role === 'doctor') {
    if (!specialization || !experience || !fee) {
      return res.status(400).json({ message: 'Specialization, experience, and fee are required for doctor registration' });
    }
  }

  try {
    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);
    const userId = 'u_' + Date.now();

    // Create User object
    const newUser = {
      id: userId,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role
    };

    db.users.push(newUser);

    // Create Doctor Profile if role is doctor
    if (role === 'doctor') {
      const doctorId = 'd_' + Date.now();
      const newDoctor = {
        id: doctorId,
        userId: userId,
        name: name,
        specialization,
        experience: Number(experience),
        fee: Number(fee),
        rating: 5.0, // Default starting rating
        bio: bio || `Hi, I am Dr. ${name}, specializing in ${specialization}.`,
        availableSlots: []
      };
      db.doctors.push(newDoctor);
    }

    writeData(db);

    return res.status(201).json({
      message: 'Registration successful!',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Internal Server Error during registration' });
  }
});

/**
 * POST /api/auth/login
 * Request Body: { email, password }
 */
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const db = readData();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Verify Password
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Sign JWT Token
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // If doctor, fetch doctor profile details
    let doctorProfile = null;
    if (user.role === 'doctor') {
      doctorProfile = db.doctors.find(d => d.userId === user.id);
    }

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        doctorId: doctorProfile ? doctorProfile.id : undefined
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal Server Error during login' });
  }
});

module.exports = router;
