import { Response } from 'express';
import Appointment from '../models/Appointment';
import Doctor from '../models/Doctor';
import { getIO } from '../services/socket.service';
import { sendBookingConfirmation } from '../services/notification.service';
import { createCalendarEvent } from '../services/calendar.service';
import dayjs from 'dayjs';

export const bookAppointment = async (req: any, res: Response): Promise<void> => {
  try {
    const { doctorId, date, startTime, endTime, reason } = req.body;
    const patientId = req.user.id;

    // 1. Basic Validation
    if (!doctorId || !date || !startTime || !endTime) {
      res.status(400).json({ message: 'Missing required booking details' });
      return;
    }

    // 2. Prevent booking in the past
    const now = dayjs();
    const appointmentTime = dayjs(`${date} ${startTime}`);
    if (appointmentTime.isBefore(now)) {
      res.status(400).json({ message: 'Cannot book appointments in the past' });
      return;
    }

    // 3. Verify Doctor
    const doctor = await Doctor.findById(doctorId);
    if (!doctor || !doctor.isActive) {
      res.status(404).json({ message: 'Doctor not found or currently unavailable' });
      return;
    }

    // 4. Double Booking Check (Explicit)
    const existingAppointment = await Appointment.findOne({
      doctorId,
      date,
      startTime,
      status: { $ne: 'cancelled' }
    });

    if (existingAppointment) {
      res.status(400).json({ message: 'This slot is no longer available. Please choose another time.' });
      return;
    }

    // 5. Create Appointment
    const newAppointment = new Appointment({
      patientId,
      doctorId,
      date,
      startTime,
      endTime,
      reason: reason || 'General Consultation',
      status: 'confirmed',
    });

    const savedAppointment = await newAppointment.save();

    // 6. Real-time Notification via Socket
    const io = getIO();
    io.emit('slot_booked', { doctorId, date, startTime });

    // 7. REAL-WORLD: External Integrations
    // Send Confirmation Email/SMS
    await sendBookingConfirmation(savedAppointment);

    // Sync to Calendar (Simulated)
    const calendarData = await createCalendarEvent(savedAppointment);

    // Save meeting link to appointment
    savedAppointment.meetingLink = calendarData.meetingLink;
    await savedAppointment.save();

    res.status(201).json(savedAppointment);
  } catch (error: any) {
    console.error('Booking Error:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'Slot already booked. Please choose another time.' });
    } else {
      res.status(500).json({ message: 'System error during clinical scheduling' });
    }
  }
};

export const getMyAppointments = async (req: any, res: Response): Promise<void> => {
  try {
    const appointments = await Appointment.find({ patientId: req.user.id })
      .populate('doctorId', 'name specialization image location')
      .sort({ date: -1, startTime: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const cancelAppointment = async (req: any, res: Response): Promise<void> => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      res.status(404).json({ message: 'Appointment not found' });
      return;
    }

    if (appointment.patientId.toString() !== req.user.id) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    appointment.status = 'cancelled';
    await appointment.save();

    // Emit socket event for slot becoming available
    const io = getIO();
    io.emit('slot_cancelled', { doctorId: appointment.doctorId, date: appointment.date, startTime: appointment.startTime });

    res.json({ message: 'Appointment cancelled' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getStats = async (req: any, res: Response): Promise<void> => {
  try {
    const appointments = await Appointment.find({ patientId: req.user.id });
    const now = dayjs();

    const total = appointments.length;
    const completed = appointments.filter(a => a.status === 'completed').length;
    
    // Find next session
    const upcoming = appointments
      .filter(a => (a.status === 'confirmed' || a.status === 'pending') && (dayjs(a.date).isAfter(now, 'day') || (dayjs(a.date).isSame(now, 'day'))))
      .sort((a, b) => dayjs(`${dayjs(a.date).format('YYYY-MM-DD')} ${a.startTime}`).diff(dayjs(`${dayjs(b.date).format('YYYY-MM-DD')} ${b.startTime}`)));

    const nextSession = upcoming.length > 0 ? upcoming[0] : null;

    res.json({
      total,
      completed,
      nextSession
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching stats' });
  }
};
