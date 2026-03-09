const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// CAPTURADOR DE ERRORES CRÍTICOS
process.on('uncaughtException', (err) => {
    console.error('FATAL ERROR (Uncaught):', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('FATAL ERROR (Unhandled Rejection):', reason);
});

const app = express();
const PORT = process.env.PORT || 3000;

console.log('--- SYSTEM STARTUP ---');

// Rutas
const distPath = path.join(__dirname, 'dist');
const dataDir = path.join(__dirname, 'data');
const settingsFile = path.join(dataDir, 'settings.json');

// Logs iniciales
console.log('Node Version:', process.version);
console.log('Port:', PORT);
console.log('Path:', __dirname);

// Asegurar carpeta de datos con try/catch para ver errores de permisos
try {
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
        console.log('Data directory created success');
    }
} catch (e) {
    console.error('Permission error creating data dir:', e);
}

app.use(cors());
app.use(express.json());

// Health check instantáneo
app.get('/health', (req, res) => res.status(200).send('OK_DIABOLICAL'));

// API
app.get('/api/settings', (req, res) => {
    try {
        if (fs.existsSync(settingsFile)) {
            res.json(JSON.parse(fs.readFileSync(settingsFile, 'utf8')));
        } else {
            res.json({ title: "Diabolical", description: "AI Services" });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/settings', (req, res) => {
    try {
        fs.writeFileSync(settingsFile, JSON.stringify(req.body, null, 2));
        res.json({ ok: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Estáticos
app.use(express.static(distPath));

// Fallback
app.get('*', (req, res) => {
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('BUILD_NOT_FOUND: ' + indexPath);
    }
});

// Arrancar sin forzar 0.0.0.0 (dejar que el OS decida)
app.listen(PORT, () => {
    console.log('------------------------------------');
    console.log(`READY: Server active on port ${PORT}`);
    console.log('------------------------------------');
});
