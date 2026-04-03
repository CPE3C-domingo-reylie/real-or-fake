/* ROUTES/AUTH.JS - USER AUTHENTICATION ROUTES */

import express from 'express';
import { register, login, logout } from '../controllers/authController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/register - Register new user
router.post('/register', register);

// POST /api/auth/login - Login user
router.post('/login', login);

// POST /api/auth/logout - Logout user (requires valid token)
router.post('/logout', authMiddleware, logout);

export default router;
