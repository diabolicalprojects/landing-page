const fs = require('fs');
const path = require('path');

const config = require('./config');
const { defaults, ALLOWED_KEYS } = require('./seo-defaults');

const settingsFile = path.join(config.dataDir, 'settings.json');

function ensureDataDir() {
    if (!fs.existsSync(config.dataDir)) {
        fs.mkdirSync(config.dataDir, { recursive: true });
    }
}

function readSettings() {
    if (!fs.existsSync(settingsFile)) return { ...defaults };

    try {
        const stored = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
        return { ...defaults, ...pickAllowed(stored) };
    } catch (error) {
        console.error('[settings] settings.json ilegible, usando valores por defecto:', error.message);
        return { ...defaults };
    }
}

/** Descarta claves desconocidas y valores que no sean texto. */
function pickAllowed(input) {
    if (!input || typeof input !== 'object') return {};

    return ALLOWED_KEYS.reduce((acc, key) => {
        const value = input[key];
        if (typeof value === 'string') acc[key] = value;
        return acc;
    }, {});
}

function writeSettings(input) {
    ensureDataDir();
    const merged = { ...readSettings(), ...pickAllowed(input) };

    // Escritura atómica: un fallo a media escritura dejaría el JSON corrupto.
    const tempFile = `${settingsFile}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(merged, null, 2), { mode: 0o600 });
    fs.renameSync(tempFile, settingsFile);

    return merged;
}

module.exports = { readSettings, writeSettings, ensureDataDir, settingsFile };
