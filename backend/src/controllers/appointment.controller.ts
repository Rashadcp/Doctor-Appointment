import { Response } from 'express';
import * as appointmentService from '../services/appointment.service';
import { getIO } from '../services/socket.service';

// ---------------------------------------------------------------------------
// POST /api/appointments
// ---------------------------------------------------------------------------
export const bookAppointment = async (req: any, res: Response): Promise<void> => {
  try {
    const { doctorId, date, startTime, endTime, reason } = req.body;

    const savedAppointment = await appointmentService.bookAppointment({
      patientId: req.user.id,
      doctorId,
      date,
      startTime,
      endTime,
      reason,
    });
    const populatedAppointment = await savedAppointment.populate('doctorId', 'name specialization');
    const populatedDoctor = populatedAppointment.doctorId as any;

    // Real-time notification via Socket
    const io = getIO();
    io.emit('slot_booked', { doctorId, date, startTime });
    io.emit('appointment_booked', {
      appointmentId: savedAppointment._id,
      patientId: req.user.id,
      doctorId,
      doctorName: populatedDoctor?.name,
      date,
      startTime,
      endTime,
    });

    res.status(201).json(populatedAppointment);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message || 'System error during clinical scheduling' });
  }
};

// ---------------------------------------------------------------------------
// GET /api/appointments
// ---------------------------------------------------------------------------
export const getMyAppointments = async (req: any, res: Response): Promise<void> => {
  try {
    const appointments = await appointmentService.getMyAppointments(req.user.id);
    res.json(appointments);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message || 'Server error' });
  }
};

// ---------------------------------------------------------------------------
// PUT /api/appointments/:id/cancel
// ---------------------------------------------------------------------------
export const cancelAppointment = async (req: any, res: Response): Promise<void> => {
  try {
    const appointment = await appointmentService.cancelAppointment(req.params.id, req.user.id);

    // Emit socket event for slot becoming available
    const io = getIO();
    io.emit('slot_cancelled', {
      doctorId: appointment.doctorId,
      date: appointment.date,
      startTime: appointment.startTime,
    });

    res.json({ message: 'Appointment cancelled' });
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message || 'Server error' });
  }
};

// ---------------------------------------------------------------------------
// GET /api/appointments/stats
// ---------------------------------------------------------------------------
export const getStats = async (req: any, res: Response): Promise<void> => {
  try {
    const stats = await appointmentService.getPatientStats(req.user.id);
    res.json(stats);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message || 'Server error' });
  }
};
