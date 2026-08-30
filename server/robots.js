const config = require('./config');

/**
 * Rastreadores de los motores generativos. Se listan explícitamente porque
 * varios de ellos (Google-Extended, Applebot-Extended, CCBot) tratan la
 * ausencia de una regla propia como permiso ambiguo, y porque un `Allow`
 * nominal es la señal más clara de que el sitio quiere ser citado.
 *
 * Esto es la base del GEO: si el rastreador no entra, el modelo no puede
 * recomendarte por mucho contenido que publiques.
 */
const RASTREADORES_IA = [
    'GPTBot',
    'OAI-SearchBot',
    'ChatGPT-User',
    'ClaudeBot',
    'Claude-User',
    'Claude-SearchBot',
    'anthropic-ai',
    'PerplexityBot',
    'Perplexity-User',
    'Google-Extended',
    'Applebot-Extended',
    'meta-externalagent',
    'Amazonbot',
    'Bytespider',
    'CCBot',
    'cohere-ai',
    'YouBot',
];

/** Rutas que ningún rastreador debe indexar. */
const BLOQUEADAS = ['/admin', '/api/', '/app-shell.html'];

function construirRobots() {
    const bloqueos = BLOQUEADAS.map((r) => `Disallow: ${r}`).join('\n');

    const bloquesIa = RASTREADORES_IA.map(
        (bot) => `User-agent: ${bot}\nAllow: /\n${bloqueos}`
    ).join('\n\n');

    return `# Diabolical Services — https://diabolicalservices.tech
# Automatización con IA para clínicas, spas, gimnasios y despachos en Aguascalientes.

User-agent: *
Allow: /
${bloqueos}

# Rastreadores de motores generativos: bienvenidos (GEO).
# Queremos que ChatGPT, Claude, Perplexity y Gemini puedan leer y citar el sitio.

${bloquesIa}

# Guía para agentes de IA
# ${config.siteUrl}/llms.txt
# ${config.siteUrl}/llms-full.txt

Sitemap: ${config.siteUrl}/sitemap.xml
`;
}

module.exports = { construirRobots, RASTREADORES_IA };
