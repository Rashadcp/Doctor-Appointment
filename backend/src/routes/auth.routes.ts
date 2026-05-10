import express from 'express';
import { registerUser, loginUser, getMe, refreshToken, logoutUser, updatePassword } from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { registerSchema, loginSchema, updatePasswordSchema } from '../validations/auth.validation';

const router = express.Router();

router.post('/register', validateRequest(registerSchema), registerUser);
router.post('/login', validateRequest(loginSchema), loginUser);
router.get('/me', protect, getMe);
router.get('/refresh', refreshToken);
router.post('/logout', logoutUser);
router.put('/update-password', protect, validateRequest(updatePasswordSchema), updatePassword);

export default router;
