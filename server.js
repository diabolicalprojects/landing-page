const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'settings.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}

// Initial settings if file doesn't exist
const initialSettings = {
    title: "Diabolical | IA Services & Elite Design",
    description: "Consultoría de Ingeniería en Sistemas Autónomos. Eliminación de fricción operativa mediante el diseño de infraestructura autónoma (IA + Automatización).",
    keywords: "AI Automation, Elite Systems, Digital Sovereignity, Scaling, Autonomous Business"
};

if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialSettings, null, 2));
}

app.use(cors());
app.use(bodyParser.json());

// API Endpoints for SEO/GEO Settings
app.get('/api/settings', (req, res) => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        res.status(500).json({ error: 'Failed to read settings' });
    }
});

app.post('/api/settings', (req, res) => {
    try {
        const newSettings = req.body;
        // Basic validation
        if (!newSettings.title || !newSettings.description) {
            return res.status(400).json({ error: 'Missing title or description' });
        }
        fs.writeFileSync(DATA_FILE, JSON.stringify(newSettings, null, 2));
        res.json({ message: 'Settings saved successfully', data: newSettings });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save settings' });
    }
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback for SPA routing: send everything else to index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`DIABOLICAL Server running on port ${PORT}`);
});
