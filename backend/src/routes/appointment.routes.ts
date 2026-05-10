import express from 'express';
import { bookAppointment, getMyAppointments, cancelAppointment, getStats } from '../controllers/appointment.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { bookAppointmentSchema } from '../validations/appointment.validation';

const router = express.Router();

// All appointment routes require authentication
// Booking is restricted to patients via RBAC
router.post('/', protect, authorize('patient'), validateRequest(bookAppointmentSchema), bookAppointment);
router.get('/', protect, getMyAppointments);
router.get('/stats', protect, getStats);
router.put('/:id/cancel', protect, authorize('patient'), cancelAppointment);

export default router;
