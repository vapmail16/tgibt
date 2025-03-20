const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

// User registration
const registerUser = async (req, res) => {
    const { name, email, password, books } = req.body;

    try {
        // Check if user already exists
        const userCheck = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (userCheck.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Start a transaction
        await pool.query('BEGIN');

        try {
            // Hash password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Insert new user
            const userResult = await pool.query(
                'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
                [name, email, hashedPassword, 'user']
            );

            const userId = userResult.rows[0].id;

            // Insert books
            if (books && books.length > 0) {
                for (const book of books) {
                    await pool.query(
                        'INSERT INTO books (title, isbn, price, author, user_id) VALUES ($1, $2, $3, $4, $5)',
                        [book.title, book.isbn, book.price, name, userId]
                    );
                }
            }

            // Commit transaction
            await pool.query('COMMIT');

            res.status(201).json({
                success: true,
                message: 'User and books registered successfully',
                user: {
                    id: userResult.rows[0].id,
                    name: userResult.rows[0].name,
                    email: userResult.rows[0].email,
                    role: userResult.rows[0].role
                }
            });

        } catch (error) {
            // Rollback in case of error
            await pool.query('ROLLBACK');
            throw error;
        }

    } catch (error) {
        console.error('Error in user registration:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering user'
        });
    }
};

// User login
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user
        const result = await pool.query(
            'SELECT id, name, email, password_hash, role FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const user = result.rows[0];

        // Check password
        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Error in user login:', error);
        res.status(500).json({
            success: false,
            message: 'Error during login'
        });
    }
};

// Get user profile
const getUserProfile = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name, email, role FROM users WHERE id = $1',
            [req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: result.rows[0]
        });

    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user profile'
        });
    }
};

// Update user profile
const updateUserProfile = async (req, res) => {
    const { name, email } = req.body;

    try {
        // Check if email is already taken by another user
        if (email) {
            const emailCheck = await pool.query(
                'SELECT id FROM users WHERE email = $1 AND id != $2',
                [email, req.user.userId]
            );

            if (emailCheck.rows.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Email is already taken'
                });
            }
        }

        // Update user profile
        const result = await pool.query(
            'UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email) WHERE id = $3 RETURNING id, name, email, role',
            [name, email, req.user.userId]
        );

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: result.rows[0]
        });

    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile'
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile
}; 