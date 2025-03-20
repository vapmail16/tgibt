const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({limit: '10mb', extended: true}));

// Import routes
const salesRoutes = require('./server/routes/sales');
const adminRoutes = require('./server/routes/admin');

// API routes - these should come BEFORE static file serving
app.use('/api/admin', adminRoutes);
app.use('/api/sales', salesRoutes);

// Serve static files from the public directory
app.use(express.static('public'));

// Serve admin panel
app.use('/admin', express.static('admin'));

// Serve data files
app.use('/data', express.static('data'));

// API endpoints for data management
app.post('/data/:type.json', async (req, res) => {
    try {
        const type = req.params.type;
        const dataPath = path.join(__dirname, 'data', `${type}.json`);
        await fs.writeFile(dataPath, JSON.stringify(req.body, null, 2));
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

// Get data
app.get('/data/:type.json', async (req, res) => {
    try {
        const type = req.params.type;
        const dataPath = path.join(__dirname, 'data', `${type}.json`);
        const data = await fs.readFile(dataPath, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        if (error.code === 'ENOENT') {
            // If file doesn't exist, return empty data structure
            res.json({ [req.params.type]: [] });
        } else {
            console.error('Error reading data:', error);
            res.status(500).json({ error: 'Failed to read data' });
        }
    }
});

// Explicit routes for new pages
app.get('/events', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'events.html'));
});

app.get('/store', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'store.html'));
});

app.get('/publishing', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'publishing.html'));
});

// Serve admin panel for /admin route
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

// Serve admin login page
app.get('/admin/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'login.html'));
});

// API 404 handler - this should come after API routes but before the catch-all
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found'
    });
});

// Serve main website for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    if (req.path.startsWith('/api/')) {
        res.status(500).json({ 
            success: false,
            message: 'Something went wrong!',
            error: err.message
        });
    } else {
        res.status(500).send('Something went wrong!');
    }
});

// Create data directory if it doesn't exist
async function ensureDataDirectory() {
    const dataDir = path.join(__dirname, 'data');
    try {
        await fs.access(dataDir);
    } catch {
        await fs.mkdir(dataDir);
        // Create empty JSON files for each data type
        const types = ['events', 'books', 'testimonials'];
        for (const type of types) {
            const filePath = path.join(dataDir, `${type}.json`);
            await fs.writeFile(filePath, JSON.stringify({ [type]: [] }, null, 2));
        }
    }
}

// Start the server
ensureDataDirectory().then(() => {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
        console.log('Available routes:');
        console.log(`- Admin panel: http://localhost:${port}/admin`);
        console.log(`- Admin API: http://localhost:${port}/api/admin/*`);
        console.log(`- Sales API: http://localhost:${port}/api/sales/*`);
        console.log(`- Events page: http://localhost:${port}/events`);
        console.log(`- Store page: http://localhost:${port}/store`);
    });
}); 