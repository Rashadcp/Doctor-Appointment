import express from 'express';
import { getDoctors, getDoctorById, getAvailableSlots, getSpecializations, getSpecializationStats } from '../controllers/doctor.controller';

const router = express.Router();

router.get('/', getDoctors);
router.get('/specializations', getSpecializations);
router.get('/stats/specializations', getSpecializationStats);
router.get('/:id', getDoctorById);
router.get('/:id/slots', getAvailableSlots);

export default router;
