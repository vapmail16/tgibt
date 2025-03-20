const pool = require('../config/db');

// Get all sales with book details
const getAllSales = async (req, res) => {
    try {
        const user = req.user;
        let query;
        let values;

        if (user.role === 'admin') {
            // Admin can see all sales
            query = `
                SELECT 
                    s.id,
                    TO_CHAR(s.month, 'YYYY-MM') as month,
                    s.book_name,
                    s.event_name,
                    s.quantity,
                    s.amount,
                    s.redeemed,
                    s.user_email
                FROM sales s
                WHERE s.deleted = false OR s.deleted IS NULL
                ORDER BY s.month DESC
            `;
            values = [];
        } else {
            // Regular users can only see their own sales
            query = `
                SELECT 
                    s.id,
                    TO_CHAR(s.month, 'YYYY-MM') as month,
                    s.book_name,
                    s.event_name,
                    s.quantity,
                    s.amount,
                    s.redeemed,
                    s.user_email
                FROM sales s
                WHERE s.user_email = $1 
                AND (s.deleted = false OR s.deleted IS NULL)
                ORDER BY s.month DESC
            `;
            values = [user.email];
        }

        console.log('Executing query:', query);
        console.log('With values:', values);
        console.log('User:', user);

        const result = await pool.query(query, values);
        console.log('Query result:', result.rows);

        res.json({ sales: result.rows });
    } catch (error) {
        console.error('Error in getAllSales:', error);
        res.status(500).json({ 
            message: 'Failed to fetch sales data',
            error: error.message
        });
    }
};

// Update sale record
const updateSale = async (req, res) => {
    const { id } = req.params;
    const { month, book_name, event_name, quantity, amount } = req.body;

    try {
        const result = await pool.query(`
            UPDATE sales 
            SET month = $1, 
                book_name = $2,
                event_name = $3,
                quantity = $4,
                amount = $5
            WHERE id = $6
            RETURNING *
        `, [month, book_name, event_name, quantity, amount, id]);

        if (result.rows.length === 0) {
            throw new Error('Sale record not found');
        }

        res.json({ sale: result.rows[0] });
    } catch (error) {
        console.error('Error updating sale:', error);
        res.status(500).json({ message: error.message });
    }
};

// Delete sale record
const deleteSale = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'UPDATE sales SET deleted = true WHERE id = $1 RETURNING id',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Sale record not found' 
            });
        }

        res.json({ 
            success: true,
            message: 'Sale record deleted successfully',
            deletedId: id
        });

    } catch (error) {
        console.error('Error deleting sale:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to delete sale record',
            error: error.message 
        });
    }
};

// Toggle redeemed status
const toggleRedeemed = async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await pool.query(
            'UPDATE sales SET redeemed = NOT redeemed WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Sale record not found' });
        }

        res.json({ sale: result.rows[0] });
    } catch (error) {
        console.error('Error toggling redeemed status:', error);
        res.status(500).json({ message: 'Failed to update redeemed status' });
    }
};

module.exports = {
    getAllSales,
    updateSale,
    deleteSale,
    toggleRedeemed
}; 