const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const config = require('./config');

/*
 * Bandeja de prospectos.
 *
 * El envío a n8n y la apertura de WhatsApp NO cambian: siguen siendo el embudo
 * de siempre. Esto es una copia local para que el panel pueda enseñar lo que
 * entró sin depender de que alguien entre a n8n, y sobre todo para que un fallo
 * del webhook deje de significar un prospecto perdido sin rastro.
 *
 * Formato: un JSON por línea (JSONL). Se añade al final y nunca se reescribe,
 * así que un corte de luz a media escritura pierde como mucho la última línea
 * en vez de corromper el fichero entero. El estado (nuevo / atendido /
 * descartado) vive aparte justamente para no tener que reescribir el registro.
 */

const ficheroLeads = path.join(config.dataDir, 'leads.jsonl');
const ficheroEstados = path.join(config.dataDir, 'leads-estado.json');

/*
 * Caracteres de control: rompen el JSONL (un salto de línea dentro de un campo
 * partiría el registro en dos) y no aportan nada a un formulario. Se escribe
 * como propiedad Unicode en vez de un rango literal para que el fuente siga
 * siendo texto plano legible.
 */
const CONTROL = /\p{Cc}/gu;

const MAX_CAMPO = 2000;
const MAX_CAMPOS = 40;
const MAX_BYTES_FICHERO = 4 * 1024 * 1024;
const ESTADOS = ['nuevo', 'atendido', 'descartado'];

function asegurarDirectorio() {
    if (!fs.existsSync(config.dataDir)) {
        fs.mkdirSync(config.dataDir, { recursive: true });
    }
}

/**
 * Normaliza lo que llega del formulario o del chatbot.
 *
 * Esta ruta es pública: la puede llamar cualquiera. Por eso no se guarda «lo
 * que venga» — se recorta a texto plano, con tope de campos y de longitud. Lo
 * que se guarda acaba pintado en el panel, así que entra como dato y nunca
 * como markup.
 */
function normalizar(cuerpo) {
    if (!cuerpo || typeof cuerpo !== 'object' || Array.isArray(cuerpo)) return null;

    const datos = {};
    let n = 0;
    for (const [clave, valor] of Object.entries(cuerpo)) {
        if (n >= MAX_CAMPOS) break;
        if (!/^[\w-]{1,40}$/.test(clave)) continue;

        let texto;
        if (typeof valor === 'string') texto = valor;
        else if (typeof valor === 'number' || typeof valor === 'boolean') texto = String(valor);
        else if (Array.isArray(valor)) texto = valor.filter((v) => typeof v === 'string').join(' · ');
        else continue;

        // Los caracteres de control rompen el JSONL y no aportan nada.
        texto = texto.replace(CONTROL, ' ').trim().slice(0, MAX_CAMPO);
        if (!texto) continue;

        datos[clave] = texto;
        n += 1;
    }

    return Object.keys(datos).length ? datos : null;
}

function registrarLead(cuerpo, meta = {}) {
    const datos = normalizar(cuerpo);
    if (!datos) return { ok: false, error: 'No llegó ningún campo utilizable.' };

    asegurarDirectorio();
    rotarSiHaceFalta();

    const lead = {
        id: crypto.randomUUID(),
        ts: new Date().toISOString(),
        tipo: datos.type || datos.tipo || 'formulario',
        origen: typeof meta.origen === 'string' ? meta.origen.slice(0, 200) : '',
        datos,
    };

    fs.appendFileSync(ficheroLeads, `${JSON.stringify(lead)}\n`, { mode: 0o600 });
    return { ok: true, id: lead.id };
}

/**
 * Cuando el fichero pasa del tope se archiva con fecha y se empieza uno nuevo.
 * Sin esto, el panel acabaría cargando megas de historial en cada consulta.
 */
function rotarSiHaceFalta() {
    if (!fs.existsSync(ficheroLeads)) return;
    if (fs.statSync(ficheroLeads).size < MAX_BYTES_FICHERO) return;

    const sello = new Date().toISOString().replace(/[:.]/g, '-');
    fs.renameSync(ficheroLeads, path.join(config.dataDir, `leads-${sello}.jsonl`));
}

function leerEstados() {
    if (!fs.existsSync(ficheroEstados)) return {};
    try {
        const valor = JSON.parse(fs.readFileSync(ficheroEstados, 'utf8'));
        return valor && typeof valor === 'object' ? valor : {};
    } catch {
        return {};
    }
}

function escribirEstados(estados) {
    asegurarDirectorio();
    const temporal = `${ficheroEstados}.tmp`;
    fs.writeFileSync(temporal, JSON.stringify(estados, null, 2), { mode: 0o600 });
    fs.renameSync(temporal, ficheroEstados);
}

/** Los más recientes primero, con su estado ya aplicado. */
function listarLeads({ limite = 100, desde = 0 } = {}) {
    if (!fs.existsSync(ficheroLeads)) return { leads: [], total: 0 };

    const estados = leerEstados();
    const lineas = fs
        .readFileSync(ficheroLeads, 'utf8')
        .split('\n')
        .filter(Boolean);

    const leads = [];
    // Se recorre de atrás hacia delante: la página que se pide casi siempre es
    // la primera, y así no hay que parsear el historial entero para devolverla.
    for (let i = lineas.length - 1 - desde; i >= 0 && leads.length < limite; i -= 1) {
        try {
            const lead = JSON.parse(lineas[i]);
            const estado = estados[lead.id] || {};
            leads.push({
                ...lead,
                estado: ESTADOS.includes(estado.estado) ? estado.estado : 'nuevo',
                nota: typeof estado.nota === 'string' ? estado.nota : '',
            });
        } catch {
            // Una línea rota (corte a media escritura) no debe tumbar la bandeja.
        }
    }

    return { leads, total: lineas.length };
}

function marcarLead(id, { estado, nota }) {
    if (typeof id !== 'string' || !id) return { ok: false, error: 'Falta el identificador.' };
    if (estado !== undefined && !ESTADOS.includes(estado)) {
        return { ok: false, error: `Estado no válido. Debe ser uno de: ${ESTADOS.join(', ')}.` };
    }

    const estados = leerEstados();
    const actual = estados[id] || {};
    estados[id] = {
        estado: estado ?? actual.estado ?? 'nuevo',
        nota:
            nota !== undefined
                ? String(nota).replace(CONTROL, ' ').slice(0, MAX_CAMPO)
                : actual.nota || '',
        actualizado: new Date().toISOString(),
    };

    escribirEstados(estados);
    return { ok: true, ...estados[id] };
}

function resumenLeads() {
    const { leads, total } = listarLeads({ limite: 500 });
    const porEstado = { nuevo: 0, atendido: 0, descartado: 0 };
    for (const lead of leads) porEstado[lead.estado] += 1;
    return { total, porEstado, ultimo: leads[0]?.ts || null };
}

module.exports = { registrarLead, listarLeads, marcarLead, resumenLeads, ESTADOS, ficheroLeads };
