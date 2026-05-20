import express from 'express';
import { register, login, getProfile } from '../controllers/authController.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/register - Register new user
router.post('/register', asyncHandler(register));

// POST /api/auth/login - Login user
router.post('/login', asyncHandler(login));

// GET /api/auth/profile - Get user profile (protected)
router.get('/profile', authenticate, asyncHandler(getProfile));

export default router;
