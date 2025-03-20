const bcrypt = require('bcrypt');
const pool = require('../config/db');

const createAdminUser = async () => {
    try {
        const email = 'vapmail16@gmail.com';
        const password = 'tgibt_1234';
        const name = 'Admin User';

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Check if admin already exists
        const existingUser = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            console.log('Admin user already exists');
            return;
        }

        // Create admin user
        const result = await pool.query(
            'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role',
            [email, hashedPassword, name, 'admin']
        );

        console.log('Admin user created successfully:', result.rows[0]);
    } catch (err) {
        console.error('Error creating admin user:', err);
    } finally {
        pool.end();
    }
};

createAdminUser(); 