import { Request, Response } from 'express';
import * as doctorService from '../services/doctor.service';

// ---------------------------------------------------------------------------
// GET /api/doctors
// ---------------------------------------------------------------------------
export const getDoctors = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await doctorService.getDoctors({
      specialization: req.query.specialization as string,
      search: req.query.search as string,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 100,
    });
    res.json(result);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message || 'Server error' });
  }
};

// ---------------------------------------------------------------------------
// GET /api/doctors/:id
// ---------------------------------------------------------------------------
export const getDoctorById = async (req: Request, res: Response): Promise<void> => {
  try {
    const doctor = await doctorService.getDoctorById(req.params.id);
    if (doctor) {
      res.json(doctor);
    } else {
      res.status(404).json({ message: 'Doctor not found' });
    }
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message || 'Server error' });
  }
};

// ---------------------------------------------------------------------------
// GET /api/doctors/:id/slots?date=YYYY-MM-DD
// ---------------------------------------------------------------------------
export const getAvailableSlots = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date } = req.query;
    if (!date) {
      res.status(400).json({ message: 'Date is required' });
      return;
    }

    const slots = await doctorService.getAvailableSlots(req.params.id, date as string);
    res.json(slots);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message || 'Server error' });
  }
};

// ---------------------------------------------------------------------------
// GET /api/doctors/specializations
// ---------------------------------------------------------------------------
export const getSpecializations = async (req: Request, res: Response): Promise<void> => {
  try {
    const specializations = await doctorService.getSpecializations();
    res.json(specializations);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message || 'Server error' });
  }
};

// ---------------------------------------------------------------------------
// GET /api/doctors/stats/specializations
// ---------------------------------------------------------------------------
export const getSpecializationStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await doctorService.getSpecializationStats();
    res.json(stats);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message || 'Server error' });
  }
};
