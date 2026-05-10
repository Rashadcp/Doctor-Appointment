import Appointment, { IAppointment } from '../models/Appointment';
import Doctor from '../models/Doctor';
import dayjs from 'dayjs';
import { sendBookingConfirmation } from './notification.service';
import { createCalendarEvent } from './calendar.service';

// ---------------------------------------------------------------------------
// Booking Logic with Concurrency Control
// ---------------------------------------------------------------------------

interface BookingPayload {
  patientId: string;
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  reason?: string;
}

/**
 * Book an appointment with concurrency-safe double-booking prevention.
 *
 * Strategy (two layers):
 * 1. Application-level check: Query for an existing active booking at this slot.
 * 2. Database-level guard: The unique compound index on (doctorId, date, startTime)
 *    with a partial filter on non-cancelled status causes a duplicate key error (E11000)
 *    if two concurrent requests pass the application check simultaneously.
 *
 * This ensures zero double-bookings even under concurrent load.
 */
export const bookAppointment = async (payload: BookingPayload): Promise<IAppointment> => {
  const { patientId, doctorId, date, startTime, endTime, reason } = payload;

  // Validate: No past bookings
  const appointmentTime = dayjs(`${date} ${startTime}`);
  if (appointmentTime.isBefore(dayjs())) {
    throw { status: 400, message: 'Cannot book appointments in the past' };
  }

  // Validate: Doctor exists and is active
  const doctor = await Doctor.findById(doctorId);
  if (!doctor || !doctor.isActive) {
    throw { status: 404, message: 'Doctor not found or currently unavailable' };
  }

  // Layer 1 — Application-level concurrency check
  const existingAppointment = await Appointment.findOne({
    doctorId,
    date,
    startTime,
    status: { $ne: 'cancelled' },
  });

  if (existingAppointment) {
    throw { status: 409, message: 'This slot is no longer available. Please choose another time.' };
  }

  // Layer 2 — Database-level guard via unique index (catches race conditions)
  try {
    const newAppointment = await Appointment.create({
      patientId,
      doctorId,
      date,
      startTime,
      endTime,
      reason: reason || 'General Consultation',
      status: 'confirmed',
    });

    // Post-booking integrations (non-blocking)
    await sendBookingConfirmation(newAppointment);
    const calendarData = await createCalendarEvent(newAppointment);


    await newAppointment.save();

    return newAppointment;
  } catch (error: any) {
    // E11000 = MongoDB duplicate key error → concurrent double-book attempt
    if (error.code === 11000) {
      throw { status: 409, message: 'Slot already booked. Please choose another time.' };
    }
    throw error;
  }
};

// ---------------------------------------------------------------------------
// Patient Appointments
// ---------------------------------------------------------------------------

export const getMyAppointments = async (patientId: string): Promise<IAppointment[]> => {
  return Appointment.find({ patientId })
    .populate('doctorId', 'name specialization image location')
    .sort({ date: -1, startTime: -1 });
};

export const cancelAppointment = async (
  appointmentId: string,
  patientId: string
): Promise<IAppointment> => {
  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw { status: 404, message: 'Appointment not found' };
  }

  if (appointment.patientId.toString() !== patientId) {
    throw { status: 403, message: 'Not authorized to cancel this appointment' };
  }

  appointment.status = 'cancelled';
  await appointment.save();

  return appointment;
};

// ---------------------------------------------------------------------------
// Patient Dashboard Stats
// ---------------------------------------------------------------------------

interface PatientStats {
  total: number;
  completed: number;
  nextSession: IAppointment | null;
}

export const getPatientStats = async (patientId: string): Promise<PatientStats> => {
  const appointments = await Appointment.find({ patientId });
  const now = dayjs();

  const total = appointments.length;
  const completed = appointments.filter((a) => a.status === 'completed').length;

  const upcoming = appointments
    .filter(
      (a) =>
        (a.status === 'confirmed' || a.status === 'pending') &&
        (dayjs(a.date).isAfter(now, 'day') || dayjs(a.date).isSame(now, 'day'))
    )
    .sort((a, b) =>
      dayjs(`${dayjs(a.date).format('YYYY-MM-DD')} ${a.startTime}`).diff(
        dayjs(`${dayjs(b.date).format('YYYY-MM-DD')} ${b.startTime}`)
      )
    );

  return {
    total,
    completed,
    nextSession: upcoming.length > 0 ? upcoming[0] : null,
  };
};

// ---------------------------------------------------------------------------
// Admin Operations
// ---------------------------------------------------------------------------

export const getAllAppointments = async (): Promise<IAppointment[]> => {
  return Appointment.find()
    .populate('patientId', 'name email')
    .populate('doctorId', 'name specialization')
    .sort({ date: -1 });
};

export const updateAppointmentStatus = async (
  appointmentId: string,
  status: string
): Promise<IAppointment> => {
  const appointment = await Appointment.findByIdAndUpdate(
    appointmentId,
    { status },
    { new: true }
  );

  if (!appointment) {
    throw { status: 404, message: 'Appointment not found' };
  }

  return appointment;
};

// ---------------------------------------------------------------------------
// Admin Dashboard Stats
// ---------------------------------------------------------------------------

import User from '../models/User';

interface DashboardStats {
  totalDoctors: number;
  totalPatients: number;
  totalAppointments: number;
  pendingAppointments: number;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const [totalDoctors, totalPatients, totalAppointments, pendingAppointments] =
    await Promise.all([
      Doctor.countDocuments(),
      User.countDocuments({ role: 'patient' }),
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: 'pending' }),
    ]);

  return { totalDoctors, totalPatients, totalAppointments, pendingAppointments };
};
