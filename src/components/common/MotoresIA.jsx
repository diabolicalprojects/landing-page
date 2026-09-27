import React from 'react';

import { cn } from '../../utils/cn';
import chatgpt from '../../assets/ia/chatgpt.svg';
import gemini from '../../assets/ia/gemini.svg';
import claude from '../../assets/ia/claude.svg';
import perplexity from '../../assets/ia/perplexity.svg';
import copilot from '../../assets/ia/copilot.svg';
import metaAi from '../../assets/ia/meta-ai.svg';

/*
 * Los asistentes de IA, con su logo, allí donde el texto los nombra.
 *
 * Quien lee «ChatGPT, Claude o Perplexity» reconoce antes el icono que el
 * nombre: es el que tiene en el teléfono. Los logos salen del paquete abierto
 * Lobe Icons (MIT, src/assets/ia) y se sirven desde el propio sitio.
 *
 * Dos usos:
 *   <MotoresIA />                 los seis, con su etiqueta, en las secciones
 *                                 que tratan de aparecer en la IA
 *   <MotoresIA texto={t} />       solo los que ese texto menciona; nada si no
 *                                 menciona ninguno
 *
 * Cada logo va en una pastilla negra, como el icono de una app: así se ven
 * igual en las zonas oscuras y en las claras (el de OpenAI es blanco).
 *
 * Honestidad: se dice «puede aparecer», nunca «aparecerá». Ninguna agencia
 * decide qué cita un modelo, y la nota lo aclara junto con que las marcas son
 * de sus dueños.
 */
export const MOTORES = [
    { clave: 'chatgpt', nombre: 'ChatGPT', logo: chatgpt, patron: /ChatGPT|OpenAI|GPTBot/ },
    { clave: 'gemini', nombre: 'Gemini', logo: gemini, patron: /Gemini/ },
    { clave: 'claude', nombre: 'Claude', logo: claude, patron: /\bClaude|Anthropic/ },
    { clave: 'perplexity', nombre: 'Perplexity', logo: perplexity, patron: /Perplexity/ },
    { clave: 'copilot', nombre: 'Copilot', logo: copilot, patron: /Copilot/ },
    { clave: 'meta-ai', nombre: 'Meta AI', logo: metaAi, patron: /Meta AI/ },
];

/** Los motores que nombra un texto, en el orden de la lista. */
export const motoresEn = (texto = '') => MOTORES.filter((m) => m.patron.test(texto));

const MotoresIA = ({
    texto,
    etiqueta = 'Asistentes donde su negocio puede aparecer',
    nota = true,
    className,
}) => {
    const lista = texto === undefined ? MOTORES : motoresEn(texto);
    if (lista.length === 0) return null;

    // Con texto es un apunte bajo un párrafo: sin etiqueta ni nota.
    const completo = texto === undefined;

    return (
        <div className={cn('motores-ia', completo ? 'motores-ia--completo' : 'motores-ia--apunte', className)}>
            {completo && etiqueta && <p className="etiqueta motores-ia__etiqueta">{etiqueta}</p>}
            <ul className="motores-ia__lista" aria-label={completo ? undefined : 'Asistentes mencionados'}>
                {lista.map((m, i) => (
                    <li key={m.clave} className="motores-ia__motor" style={{ '--i': i }}>
                        <span className="motores-ia__icono">
                            <img src={m.logo} alt="" width="18" height="18" loading="lazy" decoding="async" />
                        </span>
                        <span className="motores-ia__nombre">{m.nombre}</span>
                    </li>
                ))}
            </ul>
            {completo && nota && (
                <p className="motores-ia__nota">
                    Ningún proveedor puede garantizar una mención: preparamos su sitio para que estos asistentes lo
                    lean y lo puedan citar. Las marcas pertenecen a sus dueños.
                </p>
            )}
        </div>
    );
};

export default MotoresIA;
