/* MIDDLEWARE/AUTH.JS - JWT TOKEN VERIFICATION */

import jwt from 'jsonwebtoken';
import config from '../config.js';

export default function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    // Check if authorization header exists and has Bearer scheme
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'no token provided' });
    }

    // Extract token from "Bearer <token>" format
    const token = authHeader.split(' ')[1];

    try {
        // Verify token
        const decoded = jwt.verify(token, config.JWT_SECRET);

        // Attach user info to request for use in route handlers
        req.user = decoded;

        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'token expired' });
        }
        return res.status(401).json({ error: 'invalid token' });
    }
}
