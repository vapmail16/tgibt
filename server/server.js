const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add JSON content type header for all responses
app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
});

// Debug middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    if (req.method === 'POST' || req.method === 'PUT') {
        console.log('Headers:', req.headers);
        console.log('Body:', req.body);
    }
    next();
});

// Import routes
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const salesRoutes = require('./routes/sales');

// Serve static files
app.use('/admin', express.static(path.join(__dirname, '../admin')));
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/sales', salesRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        success: false,
        message: 'Something broke!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Handle 404
app.use((req, res) => {
    if (req.path.startsWith('/api/')) {
        res.status(404).json({
            success: false,
            message: 'API route not found'
        });
    } else {
        // For non-API routes, serve the index.html
        res.sendFile(path.join(__dirname, '../public/index.html'));
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Available routes:');
    console.log('- GET /api/sales');
    console.log('- POST /api/admin/login');
}); 