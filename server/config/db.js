const { Pool } = require('pg');
require('dotenv').config();

console.log('Database configuration:', {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Test connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error acquiring client:', err.stack);
        console.error('Database connection failed. Please check your configuration.');
        return;
    }
    console.log('Successfully connected to PostgreSQL database');
    client.query('SELECT NOW()', (err, result) => {
        release();
        if (err) {
            return console.error('Error executing query', err.stack);
        }
        console.log('Database connection test successful. Server time:', result.rows[0].now);
    });
});

// Add error handler
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

module.exports = pool; 