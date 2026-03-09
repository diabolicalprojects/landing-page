const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('--- DIABOLICAL BOOT SEQUENCE ---');
console.log('Entorno:', process.env.NODE_ENV);
console.log('Puerto asignado:', PORT);

// Rutas críticas
const distPath = path.join(__dirname, 'dist');
const dataDir = path.join(__dirname, 'data');
const settingsFile = path.join(dataDir, 'settings.json');

// Asegurar persistencia
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

app.use(cors());
app.use(express.json());

// Health Check (El proxy de Dokploy lo necesita)
app.get('/health', (req, res) => {
    console.log('Health check ping received');
    res.status(200).send('OK');
});

// API simple para SEO
app.get('/api/settings', (req, res) => {
    try {
        if (fs.existsSync(settingsFile)) {
            res.json(JSON.parse(fs.readFileSync(settingsFile, 'utf8')));
        } else {
            res.json({
                title: "Diabolical",
                description: "Elite AI Services",
                keywords: "AI Automation, Business Intelligence"
            });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/settings', (req, res) => {
    fs.writeFileSync(settingsFile, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
});

// Servir archivos estáticos de React
app.use(express.static(distPath));

// Fallback para React Router
app.get('*', (req, res) => {
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('Build folder "dist" is missing index.html');
    }
});

// ESCUCHA OBLIGATORIA EN 0.0.0.0 PARA DOCKER
app.listen(PORT, '0.0.0.0', () => {
    console.log('-------------------------------------------');
    console.log(`🚀 DIABOLICAL SERVER IS LIVE ON 0.0.0.0:${PORT}`);
    console.log(`Static path: ${distPath}`);
    console.log('-------------------------------------------');
});
