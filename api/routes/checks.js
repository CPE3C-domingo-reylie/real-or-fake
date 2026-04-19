import express from 'express';
import pool from '../dbconfig.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Save a check
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { query, verdict, check_type } = req.body;
    const user_id = req.user.id;
    await pool.execute(
      'INSERT INTO checks (user_id, query, verdict, check_type) VALUES (?, ?, ?, ?)',
      [user_id, query, verdict || 'mixed', check_type || 'text']
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get recent checks for logged in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user_id = req.user.id;
    const [rows] = await pool.execute(
      'SELECT * FROM checks WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
      [user_id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update verdict for most recent check with this query
router.post('/update-verdict', authMiddleware, async (req, res) => {
  try {
    const { query, verdict } = req.body;
    const user_id = req.user.id;
    await pool.execute(
      'UPDATE checks SET verdict = ? WHERE user_id = ? AND query = ? ORDER BY created_at DESC LIMIT 1',
      [verdict, user_id, query]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
