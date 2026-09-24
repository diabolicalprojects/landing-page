import React from 'react';

import Pagina from '../components/common/Pagina';
import HeroPagina from '../components/common/HeroPagina';
import CtaServicio from '../components/common/CtaServicio';
import Contact from '../components/sections/Contact';
import Proceso from '../components/sections/Proceso';

/*
 * Contacto.
 *
 * El formulario y su embudo —envío al webhook y apertura de WhatsApp con el
 * resumen redactado— son exactamente los de siempre. Aquí solo cambian de
 * página: tener una dirección propia es lo que permite enlazarla desde los
 * anuncios y medir qué campaña trae solicitudes.
 *
 * Debajo va el proceso, porque la duda de quien está a punto de escribir no es
 * qué hacemos sino qué pasa después de que envíe.
 */
const ContactoPage = () => (
    <Pagina>
        <HeroPagina
            migas={[{ texto: 'Contacto' }]}
            titulo={
                <>
                    Empecemos por <span className="titular-apagado">el diagnóstico.</span>
                </>
            }
            entradilla="La auditoría no tiene costo ni compromiso. Salimos de ella con un documento que dice dónde se pierden prospectos hoy, qué conviene automatizar en su caso y en qué orden. Es suyo, trabajemos juntos o no."
            bajada="La auditoría no tiene costo ni compromiso, y el documento que resulta es suyo."
            /* En el teléfono el formulario queda un pantallazo más abajo: el
               botón lleva a él. En escritorio ya se ve y sobra. */
            cta={
                <CtaServicio
                    texto="Ir al formulario"
                    destino="#contacto"
                    secundario={{
                        texto: 'O escríbanos por WhatsApp',
                        destino: 'whatsapp:Hola. Me interesa la auditoría sin costo.',
                    }}
                    ubicacion="contacto-hero"
                />
            }
            ctaSoloMovil
            escena={{ clave: 'sello', etiqueta: 'La marca de Diabolical con los anillos girando alrededor.' }}
            separacion="lg:mb-8"
            abajo="lg:pb-16"
        />

        <Contact />
        <Proceso conCta={false} />
    </Pagina>
);

export default ContactoPage;
