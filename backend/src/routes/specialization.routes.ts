import express from 'express';
import { 
  getSpecializations, 
  createSpecialization, 
  updateSpecialization, 
  deleteSpecialization 
} from '../controllers/specialization.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', getSpecializations);

// Admin only routes
router.use(protect, authorize('admin'));
router.post('/', createSpecialization);
router.put('/', updateSpecialization);
router.delete('/:name', deleteSpecialization);

export default router;
