/* ROUTES/AUTH.JS - USER AUTHENTICATION ROUTES */

import express from 'express';
import { register, login, logout, setup2fa, get2faStatus } from '../controllers/authController.js';
import authMiddleware from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// POST /api/auth/register - Register new user
router.post('/register', authLimiter, register);

// POST /api/auth/login - Login user
router.post('/login', authLimiter, login);

// POST /api/auth/setup-2fa - Setup 2FA (Requires valid user credentials)
router.post('/setup-2fa', authMiddleware, setup2fa);

// GET /api/auth/2fa-status - Get 2FA status
router.get('/2fa-status', authMiddleware, get2faStatus);

// POST /api/auth/logout - Logout user (requires valid token)
router.post('/logout', authMiddleware, logout);

export default router;