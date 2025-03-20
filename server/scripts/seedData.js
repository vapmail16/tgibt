const pool = require('../config/db');
const bcrypt = require('bcrypt');

const seedData = async () => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        // Insert users (starting from ID 2 since ID 1 is admin)
        await client.query(`
            INSERT INTO users (id, email, name, password_hash, role) VALUES
            (2, 'vanbooksfeedback@gmail.com', 'neeru', $1, 'user'),
            (3, 'occultuv@gmail.com', 'miraya', $2, 'user')
        `, [
            await bcrypt.hash('neeru1234', 10),
            await bcrypt.hash('miraya1234', 10)
        ]);

        // Reset the sequence for users
        await client.query("SELECT setval('users_id_seq', (SELECT MAX(id) FROM users))");

        // Insert books
        await client.query(`
            INSERT INTO books (id, title, author, isbn, price) VALUES
            (1, 'Blue 1', 'Vikkas Arun Pareek', '123', 99),
            (2, 'Blue 2', 'Neeru Pareek', '234', 99),
            (3, 'Voices', 'Miraya Pareek', '345', 199)
        `);

        // Reset the sequence for books
        await client.query("SELECT setval('books_id_seq', (SELECT MAX(id) FROM books))");

        // Insert sales data (updating user_ids to match the new user IDs)
        await client.query(`
            INSERT INTO sales_data (id, book_id, user_id, event_name, month, quantity, amount, redeemed) VALUES
            (1, 1, 2, 'Christmas', '2024-12-01', 2, 198, false),
            (2, 1, 2, 'Holi', '2025-02-01', 5, 495, false),
            (3, 1, 2, 'Diwali', '2024-10-01', 3, 297, false),
            (4, 2, 2, 'Christmas', '2024-12-01', 10, 990, false),
            (5, 2, 2, 'Holi', '2025-02-01', 5, 495, false),
            (6, 2, 2, 'Diwali', '2024-10-01', 20, 1980, false),
            (7, 2, 2, 'New Year', '2024-12-01', 1, 99, false),
            (8, 3, 3, 'Christmas', '2024-12-01', 5, 995, false),
            (9, 3, 3, 'Holi', '2025-02-01', 8, 1592, false),
            (10, 3, 3, 'Diwali', '2024-10-01', 2, 398, false)
        `);

        // Reset the sequence for sales_data
        await client.query("SELECT setval('sales_data_id_seq', (SELECT MAX(id) FROM sales_data))");

        await client.query('COMMIT');
        console.log('Data seeded successfully!');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error seeding data:', error);
        throw error;
    } finally {
        client.release();
        pool.end();
    }
};

seedData().catch(console.error); 