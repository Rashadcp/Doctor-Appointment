import Doctor, { IDoctor } from '../models/Doctor';
import Appointment from '../models/Appointment';
import dayjs from 'dayjs';

// ---------------------------------------------------------------------------
// Doctor CRUD (Admin operations)
// ---------------------------------------------------------------------------

const formatDoctorName = (name: string): string => {
  if (!name) return name;
  let formatted = name.trim().toUpperCase();
  if (!formatted.startsWith('DR.')) {
    formatted = `DR. ${formatted}`;
  }
  return formatted;
};

export const createDoctor = async (data: Partial<IDoctor>): Promise<IDoctor> => {
  if (data.name) data.name = formatDoctorName(data.name);
  const doctor = new Doctor(data);
  return doctor.save();
};

export const updateDoctor = async (
  id: string,
  data: Partial<IDoctor>
): Promise<IDoctor | null> => {
  if (data.name) data.name = formatDoctorName(data.name);
  return Doctor.findByIdAndUpdate(id, data, { new: true });
};

export const deleteDoctor = async (id: string): Promise<IDoctor | null> => {
  return Doctor.findByIdAndDelete(id);
};

// ---------------------------------------------------------------------------
// Doctor Query (Public operations)
// ---------------------------------------------------------------------------

interface DoctorQueryParams {
  specialization?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface PaginatedDoctors {
  doctors: IDoctor[];
  total: number;
  page: number;
  pages: number;
}

export const getDoctors = async (params: DoctorQueryParams): Promise<PaginatedDoctors> => {
  const { specialization, search, page = 1, limit = 100 } = params;
  const skip = (page - 1) * limit;

  let query: any = { isActive: { $ne: false } };

  if (specialization && specialization !== 'All') {
    query.specialization = specialization;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { specialization: { $regex: search, $options: 'i' } },
    ];
  }

  const doctors = await Doctor.find(query).skip(skip).limit(limit).sort({ createdAt: -1 });
  const total = await Doctor.countDocuments(query);

  return {
    doctors,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
};

export const getDoctorById = async (id: string): Promise<IDoctor | null> => {
  return Doctor.findById(id);
};

// ---------------------------------------------------------------------------
// Slot Generation Logic (Core Business Logic)
// ---------------------------------------------------------------------------

export interface TimeSlot {
  startTime: string;
  endTime: string;
}

/**
 * Generate available time slots for a given doctor on a specific date.
 *
 * 1. Reads the doctor's availability config (start/end time, slot duration).
 * 2. Generates all possible time windows for that day.
 * 3. Filters out slots already booked (status != cancelled).
 * 4. Filters out slots in the past (for today's date).
 */
export const getAvailableSlots = async (
  doctorId: string,
  date: string
): Promise<TimeSlot[]> => {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor || !doctor.isActive) {
    throw { status: 404, message: 'Doctor not found or inactive' };
  }

  const requestedDay = dayjs(date).format('dddd');
  if (!doctor.availability.days.includes(requestedDay)) {
    return [];
  }

  // Step 1: Generate all possible slots from doctor schedule
  const slots: TimeSlot[] = [];
  let currentTime = dayjs(`${date} ${doctor.availability.startTime}`);
  const endTime = dayjs(`${date} ${doctor.availability.endTime}`);

  while (currentTime.isBefore(endTime)) {
    const slotStart = currentTime.format('HH:mm');
    currentTime = currentTime.add(doctor.availability.slotDuration, 'minute');
    const slotEnd = currentTime.format('HH:mm');

    if (currentTime.isAfter(endTime)) break;

    slots.push({ startTime: slotStart, endTime: slotEnd });
  }

  // Step 2: Fetch booked appointments for this doctor on this date
  const bookedAppointments = await Appointment.find({
    doctorId,
    date,
    status: { $in: ['pending', 'confirmed'] },
  });

  const bookedStarts = new Set(bookedAppointments.map((app) => app.startTime));

  // Step 3: Filter — remove booked slots and past slots (if today)
  const now = dayjs();
  const isToday = dayjs(date).isSame(now, 'day');

  return slots.filter((slot) => {
    if (bookedStarts.has(slot.startTime)) return false;

    if (isToday) {
      const slotTime = dayjs(`${date} ${slot.startTime}`);
      return slotTime.isAfter(now);
    }

    return true;
  });
};

// ---------------------------------------------------------------------------
// Specialization Helpers
// ---------------------------------------------------------------------------

export const getSpecializations = async (): Promise<string[]> => {
  return Doctor.distinct('specialization');
};

export const getSpecializationStats = async () => {
  return Doctor.aggregate([
    { $match: { isActive: { $ne: false } } },
    { $group: { _id: '$specialization', count: { $sum: 1 } } },
    { $project: { name: '$_id', count: 1, _id: 0 } },
    { $sort: { count: -1 } },
  ]);
};
