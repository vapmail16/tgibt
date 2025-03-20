const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const login = async (req, res) => {
    try {
        console.log('Login attempt:', req.body);
        const { email, password } = req.body;

        // Get user without role restriction
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        
        console.log('User query result:', result.rows);

        if (result.rows.length === 0) {
            console.log('No user found with email:', email);
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const user = result.rows[0];
        console.log('Found user:', { id: user.id, email: user.email, role: user.role });

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        console.log('Password validation result:', validPassword);
        
        if (!validPassword) {
            console.log('Invalid password for user:', email);
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate JWT with role information
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    login
}; 