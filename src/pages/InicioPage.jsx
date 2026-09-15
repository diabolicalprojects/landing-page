import React from 'react';

import Pagina from '../components/common/Pagina';

// Nada de lazy() en las secciones: la portada se renderiza entera en el
// servidor, y un boundary sin resolver haría que React descartara ese HTML al
// hidratar (error #419) y volviera a montarlo todo en cliente.
import Hero from '../components/sections/Hero';
import Pilares from '../components/sections/Pilares';
import Invisibles from '../components/sections/Invisibles';
import Verticales from '../components/sections/Verticales';
import Proceso from '../components/sections/Proceso';
import EjemploAtencion from '../components/sections/EjemploAtencion';
import Servicios from '../components/sections/Servicios';
import Comparativa from '../components/sections/Comparativa';
import Limites from '../components/sections/Limites';
import FAQSection from '../components/sections/FAQSection';
import CierreCta from '../components/sections/CierreCta';

/*
 * Portada.
 *
 * Ya no es la única página: ahora es la puerta de un sitio de varias. Su
 * trabajo es decir en el primer viewport qué es esto y para quién, y repartir
 * hacia las páginas que desarrollan cada cosa.
 *
 * El orden es la narrativa y el fondo es el ritmo. Diez secciones del mismo
 * negro se leen como una sola masa plana, así que la página invierte a claro
 * tres veces, y siempre donde cambia el tema de conversación:
 *
 *   Hero          negro      la frase clave y la marca en el centro del sistema
 *   Pilares       negro      los tres frentes, cada uno con su escena
 *   Invisibles    negro·2    la medición propia: el dato que sostiene la tesis
 *   Sectores      negro·1    seis giros, cada uno hacia su página
 *   Proceso       CLARO      cómo se hace y en cuánto  ← cambia el tema
 *   Ejemplo       negro      el mecanismo funcionando en un teléfono
 *   Servicios     negro·1    el catálogo, cada uno hacia su página
 *   Alternativas  CLARO      las cuatro formas de resolverlo  ← cambia el tema
 *   Limites       negro      los compromisos de la casa
 *   FAQ           CLARO      lo que queda por preguntar  ← cambia el tema
 *   Cierre        CLARO      la tarjeta negra incrustada: el contraste máximo
 *
 * El formulario vive en /contacto: tener dirección propia es lo que permite
 * enlazarlo desde los anuncios y medir qué campaña trae solicitudes.
 */
const InicioPage = () => (
    <Pagina>
        <Hero />
        <Pilares />
        <Invisibles />
        <Verticales />
        <Proceso />
        <EjemploAtencion />
        <Servicios />
        <Comparativa />
        <Limites />
        <FAQSection />
        <CierreCta />
    </Pagina>
);

export default InicioPage;
