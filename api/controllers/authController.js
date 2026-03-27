/* CONTROLLERS/AUTHCONTROLLER.JS - USER AUTHENTICATION LOGIC */

import bcrypt from 'argon2';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import config from '../config.js';

// POST /api/auth/register - Register new user
export async function register(req, res) {
    try {
        const { username, email, password } = req.body;

        // Validate required fields
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'username, email, and password are required' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'invalid email format' });
        }

        // Validate password length
        if (password.length < 8) {
            return res.status(400).json({ error: 'password must be at least 8 characters' });
        }

        // Check if user already exists
        const existingUser = await User.findByUsernameOrEmail(username, email);
        if (existingUser) {
            return res.status(409).json({ error: 'username or email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password);

        // Create user in database
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            role: 'user'
        });

        // Generate JWT token
        const token = jwt.sign(
            { id: newUser.id, username: newUser.username, email: newUser.email, role: newUser.role },
            config.JWT_SECRET,
            { expiresIn: config.JWT_EXPIRES_IN }
        );

        res.status(201).json({
            message: 'user registered successfully',
            token,
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (err) {
        console.error('Register error:', err.message);
        res.status(500).json({ error: 'registration failed' });
    }
}

// POST /api/auth/login - Login user
export async function login(req, res) {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ error: 'email and password are required' });
        }

        // Find user by email
        const user = await User.findByEmail(email);

        if (!user) {
            return res.status(401).json({ error: 'invalid credentials' });
        }

        // Verify password
        const isValidPassword = await bcrypt.verify(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ error: 'invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, username: user.username, email: user.email, role: user.role },
            config.JWT_SECRET,
            { expiresIn: config.JWT_EXPIRES_IN }
        );

        res.json({
            message: 'login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ error: 'login failed' });
    }
}
