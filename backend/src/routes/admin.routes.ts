import express from 'express';
import {
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getAllAppointments,
  getDashboardStats,
  updateAppointmentStatus,
  uploadImage,
} from '../controllers/admin.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import upload from '../middleware/upload.middleware';

const router = express.Router();

// All routes here require admin privileges
router.use(protect, authorize('admin'));

router.post('/upload-image', upload.single('image'), uploadImage);
router.post('/doctors', createDoctor);
router.put('/doctors/:id', updateDoctor);
router.delete('/doctors/:id', deleteDoctor);

router.get('/appointments', getAllAppointments);
router.put('/appointments/:id', updateAppointmentStatus);
router.get('/dashboard-stats', getDashboardStats);

export default router;
