import { Request, Response } from 'express';
import Doctor from '../models/Doctor';
import Appointment from '../models/Appointment';
import dayjs from 'dayjs';

export const getDoctors = async (req: Request, res: Response): Promise<void> => {
  try {
    const { specialization, search, page = 1, limit = 100 } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    let query: any = {};

    // If it's a public request, we might want only active ones
    // For now, all doctors are active in the DB
    query.isActive = { $ne: false }; 

    if (specialization && specialization !== 'All') {
      query.specialization = specialization;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } }
      ];
    }

    const doctors = await Doctor.find(query).skip(skip).limit(limitNum).sort({ createdAt: -1 });
    const total = await Doctor.countDocuments(query);

    res.json({
      doctors,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getDoctorById = async (req: Request, res: Response): Promise<void> => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (doctor) {
      res.json(doctor);
    } else {
      res.status(404).json({ message: 'Doctor not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAvailableSlots = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { date } = req.query; // YYYY-MM-DD

    if (!date) {
      res.status(400).json({ message: 'Date is required' });
      return;
    }

    const doctor = await Doctor.findById(id);
    if (!doctor || !doctor.isActive) {
      res.status(404).json({ message: 'Doctor not found or inactive' });
      return;
    }

    const dayOfWeek = dayjs(date as string).format('dddd');
    // REMOVED DAY CHECK TO ALLOW PRE-BOOKING FOR ALL DATES
    // if (!doctor.availability.days.includes(dayOfWeek)) {
    //   res.json([]);
    //   return;
    // }

    // Generate slots
    const slots = [];
    let currentTime = dayjs(`${date} ${doctor.availability.startTime}`);
    const endTime = dayjs(`${date} ${doctor.availability.endTime}`);

    while (currentTime.isBefore(endTime)) {
      const slotStart = currentTime.format('HH:mm');
      currentTime = currentTime.add(doctor.availability.slotDuration, 'minute');
      const slotEnd = currentTime.format('HH:mm');
      
      if (currentTime.isAfter(endTime)) break;

      slots.push({ startTime: slotStart, endTime: slotEnd });
    }

    // Get booked appointments
    const bookedAppointments = await Appointment.find({
      doctorId: id,
      date,
      status: { $in: ['pending', 'confirmed'] },
    });

    const bookedStarts = bookedAppointments.map((app) => app.startTime);

    // Filter available slots
    const now = dayjs();
    const isToday = dayjs(date as string).isSame(now, 'day');

    const availableSlots = slots.filter((slot) => {
      const isBooked = bookedStarts.includes(slot.startTime);
      if (isBooked) return false;

      if (isToday) {
        const slotTime = dayjs(`${date} ${slot.startTime}`);
        return slotTime.isAfter(now);
      }

      return true;
    });

    res.json(availableSlots);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getSpecializationStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await Doctor.aggregate([
      { $match: { isActive: { $ne: false } } },
      {
        $group: {
          _id: '$specialization',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          name: '$_id',
          count: 1,
          _id: 0
        }
      },
      { $sort: { count: -1 } }
    ]);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getSpecializations = async (req: Request, res: Response): Promise<void> => {
  try {
    const specializations = await Doctor.distinct('specialization');
    res.json(specializations);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
