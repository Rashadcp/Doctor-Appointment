import express from 'express';
import { bookAppointment, getMyAppointments, cancelAppointment, getStats } from '../controllers/appointment.controller';
import { protect } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { bookAppointmentSchema } from '../validations/appointment.validation';

const router = express.Router();

router.post('/', protect, validateRequest(bookAppointmentSchema), bookAppointment);
router.get('/', protect, getMyAppointments);
router.get('/stats', protect, getStats);
router.put('/:id/cancel', protect, cancelAppointment);

export default router;
