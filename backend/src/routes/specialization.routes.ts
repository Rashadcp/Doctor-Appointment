import express from 'express';
import { 
  getSpecializations, 
  createSpecialization, 
  updateSpecialization, 
  deleteSpecialization 
} from '../controllers/specialization.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import {
  createSpecializationSchema,
  updateSpecializationSchema,
} from '../validations/admin.validation';

const router = express.Router();

router.get('/', getSpecializations);

// Admin only routes (JWT + RBAC)
router.use(protect, authorize('admin'));
router.post('/', validateRequest(createSpecializationSchema), createSpecialization);
router.put('/', validateRequest(updateSpecializationSchema), updateSpecialization);
router.delete('/:name', deleteSpecialization);

export default router;
