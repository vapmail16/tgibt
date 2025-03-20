const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/auth');
const { getAllSales, updateSale, deleteSale, toggleRedeemed } = require('../controllers/salesController');

// Get all sales
router.get('/', authenticateToken, async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        console.log('Authenticated user:', user);

        let query;
        let values;

        if (user.role === 'admin') {
            // Admin can see all sales
            query = `
                SELECT 
                    s.id::text as id,
                    TO_CHAR(s.month, 'YYYY-MM') as month,
                    b.title as book_name,
                    b.author as book_author,
                    s.event_name,
                    s.quantity,
                    s.sales_amount,
                    (s.quantity * s.sales_amount) as amount,
                    s.redeemed,
                    u.email as user_email
                FROM sales_data s
                LEFT JOIN books b ON s.book_id = b.id
                LEFT JOIN users u ON s.user_id = u.id
                ORDER BY s.month DESC, s.id DESC
            `;
            values = [];
        } else {
            // Regular users can only see sales for their books
            query = `
                SELECT 
                    s.id::text as id,
                    TO_CHAR(s.month, 'YYYY-MM') as month,
                    b.title as book_name,
                    b.author as book_author,
                    s.event_name,
                    s.quantity,
                    s.sales_amount,
                    (s.quantity * s.sales_amount) as amount,
                    s.redeemed,
                    u.email as user_email
                FROM sales_data s
                LEFT JOIN books b ON s.book_id = b.id
                LEFT JOIN users u ON s.user_id = u.id
                WHERE b.user_id = (SELECT id FROM users WHERE email = $1)
                ORDER BY s.month DESC, s.id DESC
            `;
            values = [user.email];
        }

        console.log('Executing query:', query);
        console.log('With values:', values);

        const result = await pool.query(query, values);
        console.log('Query result rows:', result.rows);

        // Format the response
        const formattedSales = result.rows.map(row => ({
            id: row.id,
            month: row.month,
            book_name: row.book_name || 'Unknown Book',
            book_author: row.book_author || 'Unknown Author',
            event_name: row.event_name || '',
            quantity: parseInt(row.quantity) || 0,
            sales_amount: parseFloat(row.sales_amount) || 0,
            amount: parseFloat(row.amount) || 0,
            redeemed: Boolean(row.redeemed),
            user_email: row.user_email || ''
        }));

        return res.json({
            success: true,
            sales: formattedSales
        });
    } catch (error) {
        console.error('Error in getAllSales:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Failed to fetch sales data',
            error: error.message
        });
    }
});

// Update a sale
router.put('/:id', authenticateToken, updateSale);

// Delete a sale
router.delete('/:id', authenticateToken, deleteSale);

// Toggle redeemed status
router.put('/:id/toggle-redeemed', authenticateToken, async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    
    try {
        const { id } = req.params;
        const user = req.user;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid sale ID'
            });
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Check if user has permission to toggle this sale
        let query;
        let values;

        if (user.role === 'admin') {
            query = `
                UPDATE sales_data s
                SET redeemed = NOT redeemed
                FROM users u
                WHERE s.id = $1
                AND s.user_id = u.id
                RETURNING s.id, s.redeemed, u.email as user_email
            `;
            values = [id];
        } else {
            query = `
                UPDATE sales_data s
                SET redeemed = NOT redeemed
                FROM books b, users u
                WHERE s.id = $1
                AND s.book_id = b.id
                AND b.user_id = (SELECT id FROM users WHERE email = $2)
                RETURNING s.id, s.redeemed, u.email as user_email
            `;
            values = [id, user.email];
        }

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Sale record not found or unauthorized'
            });
        }

        return res.json({
            success: true,
            sale: result.rows[0]
        });
    } catch (error) {
        console.error('Error toggling redeemed status:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update redeemed status',
            error: error.message
        });
    }
});

// Bulk upload sales data
router.post('/bulk-upload', authenticateToken, async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    
    try {
        const user = req.user;
        
        // Only admin can bulk upload
        if (user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admin users can perform bulk upload'
            });
        }

        const { sales } = req.body;
        
        if (!Array.isArray(sales) || sales.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid sales data format'
            });
        }

        // Start a transaction
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            for (const sale of sales) {
                // Get book_id based on book name and author
                const bookResult = await client.query(
                    'SELECT id FROM books WHERE title = $1 AND author = $2',
                    [sale.book_name, sale.author]
                );

                if (bookResult.rows.length === 0) {
                    throw new Error(`Book not found: ${sale.book_name} by ${sale.author}`);
                }

                const book_id = bookResult.rows[0].id;

                // Get user_id based on book_id
                const userResult = await client.query(
                    'SELECT user_id FROM books WHERE id = $1',
                    [book_id]
                );

                const user_id = userResult.rows[0].user_id;

                // Insert sale record
                await client.query(
                    `INSERT INTO sales_data 
                    (book_id, user_id, event_name, month, quantity, sales_amount, amount, redeemed) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                    [
                        book_id,
                        user_id,
                        sale.event_name,
                        sale.month + '-01', // Add day for proper date format
                        sale.quantity,
                        sale.sales_amount,
                        (sale.quantity * sale.sales_amount),
                        false
                    ]
                );
            }

            await client.query('COMMIT');

            return res.json({
                success: true,
                message: `Successfully uploaded ${sales.length} sales records`
            });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error in bulk upload:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to upload sales data'
        });
    }
});

module.exports = router; 