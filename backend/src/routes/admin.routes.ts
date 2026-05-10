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
import { validateRequest } from '../middleware/validate.middleware';
import {
  createDoctorSchema,
  updateDoctorSchema,
  updateAppointmentStatusSchema,
} from '../validations/admin.validation';

const router = express.Router();

// All routes here require admin privileges (JWT + RBAC)
router.use(protect, authorize('admin'));

router.post('/upload-image', upload.single('image'), uploadImage);
router.post('/doctors', validateRequest(createDoctorSchema), createDoctor);
router.put('/doctors/:id', validateRequest(updateDoctorSchema), updateDoctor);
router.delete('/doctors/:id', deleteDoctor);

router.get('/appointments', getAllAppointments);
router.put('/appointments/:id', validateRequest(updateAppointmentStatusSchema), updateAppointmentStatus);
router.get('/dashboard-stats', getDashboardStats);

export default router;
