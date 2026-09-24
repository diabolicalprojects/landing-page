import React from 'react';

import Pagina, { Migas } from '../components/common/Pagina';
import Contact from '../components/sections/Contact';
import Proceso from '../components/sections/Proceso';
import MotionGrafico from '../motion/MotionGrafico';

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
        <Migas ruta={[{ texto: 'Contacto' }]} />

        <section className="zona-oscura pb-12 pt-8 md:pb-16">
            <div className="contenedor">
                <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-12">
                    <header className="lg:col-span-7">
                        <h1 className="titular-xl">
                            Empecemos por{' '}
                            <span className="titular-apagado">el diagnóstico.</span>
                        </h1>
                        <p className="cuerpo-l mt-7">
                            La auditoría no tiene costo ni compromiso. Salimos de ella con un
                            documento que dice dónde se pierden prospectos hoy, qué conviene
                            automatizar en su caso y en qué orden. Es suyo, trabajemos juntos o no.
                        </p>
                    </header>

                    <div className="lg:col-span-5">
                        <MotionGrafico
                            escena="sello"
                            prioridad
                            etiqueta="La marca de Diabolical con los anillos girando alrededor."
                        />
                    </div>
                </div>
            </div>
        </section>

        <Contact />
        <Proceso conCta={false} />
    </Pagina>
);

export default ContactoPage;
