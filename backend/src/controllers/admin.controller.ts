import { Request, Response } from 'express';
import * as doctorService from '../services/doctor.service';
import * as appointmentService from '../services/appointment.service';
import { uploadToS3 } from '../services/upload.service';
import { emitEvent } from '../services/socket.service';

// ---------------------------------------------------------------------------
// POST /api/admin/upload-image
// ---------------------------------------------------------------------------
export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const result = await uploadToS3(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    res.status(200).json(result);
  } catch (error: any) {
    console.error('S3_UPLOAD_CRITICAL_FAILURE:', error);
    res.status(500).json({
      message: 'Upload to S3 failed',
      error: error.message || error,
    });
  }
};

// ---------------------------------------------------------------------------
// POST /api/admin/doctors
// ---------------------------------------------------------------------------
export const createDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const createdDoctor = await doctorService.createDoctor(req.body);
    emitEvent('doctor_registered', createdDoctor);
    res.status(201).json(createdDoctor);
  } catch (error: any) {
    console.error('Create Doctor Error:', error);
    res.status(error.status || 500).json({
      message: error.message || 'Failed to create specialist record',
    });
  }
};

// ---------------------------------------------------------------------------
// PUT /api/admin/doctors/:id
// ---------------------------------------------------------------------------
export const updateDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const doctor = await doctorService.updateDoctor(req.params.id, req.body);
    if (doctor) {
      emitEvent('doctor_updated', {
        _id: doctor._id,
        doctorId: doctor._id,
        availability: doctor.availability,
      });
      res.json(doctor);
    } else {
      res.status(404).json({ message: 'Doctor not found' });
    }
  } catch (error: any) {
    console.error('Update Doctor Error:', error);
    res.status(error.status || 500).json({
      message: error.message || 'Failed to update specialist record',
    });
  }
};

// ---------------------------------------------------------------------------
// DELETE /api/admin/doctors/:id
// ---------------------------------------------------------------------------
export const deleteDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const doctor = await doctorService.deleteDoctor(req.params.id);
    if (doctor) {
      emitEvent('doctor_decommissioned', { id: req.params.id });
      res.json({ message: 'Doctor removed' });
    } else {
      res.status(404).json({ message: 'Doctor not found' });
    }
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message || 'Server error' });
  }
};

// ---------------------------------------------------------------------------
// GET /api/admin/appointments
// ---------------------------------------------------------------------------
export const getAllAppointments = async (req: Request, res: Response): Promise<void> => {
  try {
    const appointments = await appointmentService.getAllAppointments();
    res.json(appointments);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message || 'Server error' });
  }
};

// ---------------------------------------------------------------------------
// GET /api/admin/dashboard-stats
// ---------------------------------------------------------------------------
export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await appointmentService.getDashboardStats();
    res.json(stats);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message || 'Server error' });
  }
};

// ---------------------------------------------------------------------------
// PUT /api/admin/appointments/:id
// ---------------------------------------------------------------------------
export const updateAppointmentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const appointment: any = await appointmentService.updateAppointmentStatus(req.params.id, status);
    const doctorId = appointment.doctorId?._id?.toString() || appointment.doctorId?.toString();
    const payload = {
      id: appointment._id,
      status: appointment.status,
      patientId: appointment.patientId?.toString(),
      doctorId,
      doctorName: appointment.doctorId?.name,
      date: appointment.date,
      startTime: appointment.startTime,
    };

    emitEvent('appointment_status_updated', payload);
    emitEvent('appointment_updated', payload);

    if (status === 'confirmed') {
      emitEvent('appointment_confirmed', payload);
    }

    if (status === 'cancelled') {
      emitEvent('slot_cancelled', {
        doctorId,
        date: appointment.date,
        startTime: appointment.startTime,
      });
    }

    res.json(appointment);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message || 'Server error' });
  }
};
