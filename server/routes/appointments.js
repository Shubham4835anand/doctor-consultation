const express = require('express');
const router = express.Router();
const { readData, writeData } = require('../db/dbClient');
const { authenticateToken, requireRole } = require('../middleware/auth');

/**
 * POST /api/appointments/book
 * Request Body: { doctorId, slotId }
 * Only patients can book appointments.
 */
router.post('/book', authenticateToken, requireRole('patient'), (req, res) => {
  const { doctorId, slotId } = req.body;

  if (!doctorId || !slotId) {
    return res.status(400).json({ message: 'doctorId and slotId are required to book an appointment' });
  }

  try {
    const db = readData();

    // Find Doctor
    const doctor = db.doctors.find(d => d.id === doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    // Find Slot
    const slot = doctor.availableSlots.find(s => s.id === slotId);
    if (!slot) {
      return res.status(404).json({ message: 'Time slot not found for this doctor' });
    }

    if (slot.isBooked) {
      return res.status(400).json({ message: 'This slot is already booked' });
    }

    // Book the slot
    slot.isBooked = true;

    // Fetch patient name
    const patientUser = db.users.find(u => u.id === req.user.id);
    const patientName = patientUser ? patientUser.name : req.user.name;

    // Create Appointment
    const newAppointment = {
      id: 'a_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      patientId: req.user.id,
      patientName,
      doctorId,
      doctorName: doctor.name,
      specialization: doctor.specialization,
      date: slot.date,
      timeSlot: slot.time,
      slotId: slotId,
      status: 'pending' // Initial status is pending approval by the doctor
    };

    db.appointments.push(newAppointment);

    writeData(db);

    return res.status(201).json({
      message: 'Appointment booked successfully! Awaiting doctor confirmation.',
      appointment: newAppointment
    });

  } catch (error) {
    console.error('Book appointment error:', error);
    return res.status(500).json({ message: 'Internal Server Error booking appointment' });
  }
});

/**
 * GET /api/appointments/patient/:id
 * Retrieve all appointments for a patient.
 * Patients can only view their own, Admin can view all.
 */
router.get('/patient/:id', authenticateToken, (req, res) => {
  const patientId = req.params.id;

  // Enforce access control
  if (req.user.id !== patientId && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: You can only view your own appointments' });
  }

  try {
    const db = readData();
    const patientAppointments = db.appointments.filter(a => a.patientId === patientId);
    return res.json(patientAppointments);
  } catch (error) {
    console.error('Fetch patient appointments error:', error);
    return res.status(500).json({ message: 'Internal Server Error retrieving appointments' });
  }
});

/**
 * GET /api/appointments/doctor/:id
 * Retrieve all appointments for a doctor (by Doctor ID, NOT User ID).
 * Doctors can only view their own, Admin can view all.
 */
router.get('/doctor/:id', authenticateToken, (req, res) => {
  const doctorId = req.params.id;

  try {
    const db = readData();

    // Verify doctor ownership
    const doctor = db.doctors.find(d => d.id === doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    if (doctor.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: You can only view your own doctor appointments' });
    }

    const doctorAppointments = db.appointments.filter(a => a.doctorId === doctorId);
    return res.json(doctorAppointments);
  } catch (error) {
    console.error('Fetch doctor appointments error:', error);
    return res.status(500).json({ message: 'Internal Server Error retrieving appointments' });
  }
});

/**
 * PUT /api/appointments/:id/status
 * Update appointment status (approve/cancel/reschedule)
 * Body: { status, newSlotId }
 */
router.put('/:id/status', authenticateToken, (req, res) => {
  const appointmentId = req.params.id;
  const { status, newSlotId } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  const validStatuses = ['confirmed', 'cancelled', 'completed', 'rescheduled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    const db = readData();
    const appointment = db.appointments.find(a => a.id === appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Role check and permissions
    const isPatient = req.user.id === appointment.patientId;
    
    // Find doctor profile to verify if this user is the doctor
    const doctor = db.doctors.find(d => d.id === appointment.doctorId);
    const isDoctor = doctor && doctor.userId === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({ message: 'Access denied: Unauthorized action' });
    }

    // Business Logic for state changes
    if (status === 'cancelled') {
      // Patients can cancel pending or confirmed appointments.
      // Doctors/Admins can cancel anytime.
      appointment.status = 'cancelled';

      // Free the booked slot
      if (doctor) {
        const slot = doctor.availableSlots.find(s => s.id === appointment.slotId);
        if (slot) {
          slot.isBooked = false;
        }
      }
    } else if (status === 'confirmed') {
      // Only Doctors and Admins can confirm appointments
      if (!isDoctor && !isAdmin) {
        return res.status(403).json({ message: 'Only doctors can confirm appointments' });
      }
      appointment.status = 'confirmed';
    } else if (status === 'completed') {
      // Only Doctors and Admins can complete appointments
      if (!isDoctor && !isAdmin) {
        return res.status(403).json({ message: 'Only doctors can mark appointments as completed' });
      }
      appointment.status = 'completed';
    } else if (status === 'rescheduled') {
      // Rescheduling requires a new slot id
      if (!newSlotId) {
        return res.status(400).json({ message: 'newSlotId is required to reschedule' });
      }

      if (!doctor) {
        return res.status(404).json({ message: 'Associated doctor profile not found' });
      }

      const newSlot = doctor.availableSlots.find(s => s.id === newSlotId);
      if (!newSlot) {
        return res.status(404).json({ message: 'New slot not found' });
      }

      if (newSlot.isBooked) {
        return res.status(400).json({ message: 'New slot is already booked' });
      }

      // Free the old slot
      const oldSlot = doctor.availableSlots.find(s => s.id === appointment.slotId);
      if (oldSlot) {
        oldSlot.isBooked = false;
      }

      // Book the new slot
      newSlot.isBooked = true;

      // Update appointment info
      appointment.slotId = newSlotId;
      appointment.date = newSlot.date;
      appointment.timeSlot = newSlot.time;
      // Rescheduling resets state to pending for patient rescheduling, 
      // or confirmed if doctor reschedules. Let's make it confirmed if doctor does it, pending if patient.
      appointment.status = isDoctor ? 'confirmed' : 'pending';
    }

    writeData(db);
    return res.json({
      message: `Appointment status updated to ${appointment.status}`,
      appointment
    });

  } catch (error) {
    console.error('Update appointment status error:', error);
    return res.status(500).json({ message: 'Internal Server Error updating appointment status' });
  }
});

module.exports = router;
