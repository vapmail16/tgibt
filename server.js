const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const app = express();
const port = 3000;

// Middleware to parse JSON bodies with increased limit for base64 encoded images
app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({limit: '10mb', extended: true}));

// Serve static files from the public directory
app.use(express.static('public'));

// Serve admin panel
app.use('/admin', express.static('admin'));

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

// Serve main website for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
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
        console.log(`Events page: http://localhost:${port}/events`);
        console.log(`Store page: http://localhost:${port}/store`);
        console.log(`Admin panel: http://localhost:${port}/admin`);
    });
}); 