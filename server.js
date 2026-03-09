const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'settings.json');

// LOGGING MIDDLEWARE - Critical for debugging!
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial settings
const initialSettings = {
    title: "Diabolical | IA Services & Elite Design",
    description: "Consultoría de Ingeniería en Sistemas Autónomos. Eliminación de fricción operativa mediante el diseño de infraestructura autónoma.",
    keywords: "AI Automation, Elite Systems, Digital Sovereignity"
};

if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialSettings, null, 2));
}

app.use(cors());
app.use(bodyParser.json());

// API Endpoints
app.get('/api/settings', (req, res) => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        console.error('API Error (GET /api/settings):', err);
        res.status(500).json({ error: 'Failed to read settings' });
    }
});

app.post('/api/settings', (req, res) => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(req.body, null, 2));
        res.json({ message: 'Saved successfully' });
    } catch (err) {
        console.error('API Error (POST /api/settings):', err);
        res.status(500).json({ error: 'Failed to save settings' });
    }
});

// Health check for Dokploy - simplified
app.get('/health', (req, res) => {
    res.status(200).send('HEALTHY');
});

// Serve static files
const distPath = path.join(__dirname, 'dist');
console.log(`Configured static path: ${distPath}`);

app.use(express.static(distPath));

// SPA Fallback
app.get('*', (req, res) => {
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        console.error(`SPA Error: index.html not found at ${indexPath}`);
        res.status(404).send('DIABOLICAL: Frontend build not found. Running "npm run build" first is required.');
    }
});

// Bind to 0.0.0.0 is MANDATORY for Docker
app.listen(PORT, '0.0.0.0', () => {
    console.log(`========================================`);
    console.log(`DIABOLICAL PRODUCTION SERVER`);
    console.log(`Port: ${PORT}`);
    console.log(`Directory: ${__dirname}`);
    console.log(`Date: ${new Date().toLocaleString()}`);
    console.log(`========================================`);
});
