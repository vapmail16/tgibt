const express = require('express');
const router = express.Router();
const { login } = require('../controllers/adminAuth');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const { pool } = require('../db');

// Login route (accessible to both admin and users)
router.post('/login', login);

// Protected admin routes
router.get('/dashboard', authenticateToken, isAdmin, (req, res) => {
    res.json({ message: "Admin dashboard accessed successfully" });
});

// Sales routes - accessible to both admin and users, but filtered based on role
router.get('/sales', authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        let query = `
            SELECT s.*, b.title as book_name, u.name as author_name, e.name as event_name 
            FROM sales s
            LEFT JOIN books b ON s.book_id = b.id
            LEFT JOIN users u ON s.user_id = u.id
            LEFT JOIN events e ON s.event_id = e.id
        `;
        const params = [];
        let whereConditions = [];

        // If user is not admin, filter by user_id
        if (user.role !== 'admin') {
            whereConditions.push(`s.user_id = $${params.length + 1}`);
            params.push(user.id);
        }

        // Add any additional filters from the request
        if (req.query.month) {
            whereConditions.push(`s.month = $${params.length + 1}`);
            params.push(req.query.month);
        }
        if (req.query.book) {
            whereConditions.push(`s.book_id = $${params.length + 1}`);
            params.push(req.query.book);
        }
        if (req.query.author) {
            whereConditions.push(`s.user_id = $${params.length + 1}`);
            params.push(req.query.author);
        }
        if (req.query.event) {
            whereConditions.push(`s.event_id = $${params.length + 1}`);
            params.push(req.query.event);
        }

        // Add WHERE clause if there are any conditions
        if (whereConditions.length > 0) {
            query += ' WHERE ' + whereConditions.join(' AND ');
        }

        // Add ordering
        query += ' ORDER BY s.month DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching sales:', error);
        res.status(500).json({ message: 'Error fetching sales data' });
    }
});

// Books routes - admin only
router.get('/books', authenticateToken, isAdmin, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM books ORDER BY title');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ message: 'Error fetching books data' });
    }
});

// Events routes - admin only
router.get('/events', authenticateToken, isAdmin, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM events ORDER BY date DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Error fetching events data' });
    }
});

// Testimonials routes - admin only
router.get('/testimonials', authenticateToken, isAdmin, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM testimonials ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching testimonials:', error);
        res.status(500).json({ message: 'Error fetching testimonials data' });
    }
});

module.exports = router; 