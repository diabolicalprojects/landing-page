const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
// Dokploy inyecta el puerto, si no usa el 3000
const PORT = process.env.PORT || 3000;

// Rutas absolutas para Docker
const distPath = path.join(__dirname, 'dist');
const dataDir = path.join(__dirname, 'data');
const settingsFile = path.join(dataDir, 'settings.json');

console.log('--- DIABOLICAL STARTUP ---');
console.log('Directorio actual:', __dirname);
console.log('Buscando dist en:', distPath);

// Asegurar carpeta de datos
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('Carpeta data creada');
}

app.use(cors());
app.use(express.json());

// Logs de peticiones para ver si llega tráfico
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Health check para Dokploy (Crítico para que el proxy no de 502)
app.get('/health', (req, res) => res.status(200).send('OK'));

// API Endpoints
app.get('/api/settings', (req, res) => {
    if (fs.existsSync(settingsFile)) {
        res.json(JSON.parse(fs.readFileSync(settingsFile, 'utf8')));
    } else {
        res.json({ title: "Diabolical Services", description: "Elite AI & Design" });
    }
});

app.post('/api/settings', (req, res) => {
    fs.writeFileSync(settingsFile, JSON.stringify(req.body, null, 2));
    res.json({ status: 'saved' });
});

// Servir estáticos
app.use(express.static(distPath));

// Fallback para React (SPA)
app.get('*', (req, res) => {
    const index = path.join(distPath, 'index.html');
    if (fs.existsSync(index)) {
        res.sendFile(index);
    } else {
        res.status(404).send('DIABOLICAL: dist/index.html not found. Build is empty.');
    }
});

// Arrancar servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SERVIDOR ONLINE EN PUERTO ${PORT}`);
    console.log(`URL de salud: http://localhost:${PORT}/health`);
    console.log('--------------------------');
});
