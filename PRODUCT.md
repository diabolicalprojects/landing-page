# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Dueños y encargados de negocios pequeños de Aguascalientes, México: clínicas y
consultorios médicos, spas y centros de estética, gimnasios y estudios de
entrenamiento, y despachos y oficinas profesionales. De 1 a 50 empleados.

La situación real es siempre la misma: llega un flujo constante de mensajes por
WhatsApp y hay una agenda que llenar, pero quien atiende está a la vez en el
mostrador, al teléfono y en el chat. Los mensajes fuera de horario se quedan sin
responder hasta el día siguiente, y para entonces el cliente ya reservó en otro
sitio.

Quien decide es el dueño, y evalúa desde el móvil, casi siempre en un hueco
entre dos tareas. No es un comprador técnico: no le interesa qué modelo de IA
se usa, le interesa dejar de perder citas.

## Product Purpose

Diseñar e instalar sistemas autónomos que atienden, agendan y dan seguimiento
por WhatsApp, conectados a las herramientas que el negocio ya usa. La empresa se
define como constructora de infraestructura, no como agencia de marketing.

Éxito para el visitante: entender en un vistazo si su negocio es candidato, y
solicitar la auditoría de fricción gratuita.

## Positioning

Segmentación por sector. Ningún competidor local segmenta, así que quien busca
«automatizar las citas de mi clínica en Aguascalientes» no encuentra a nadie
hablándole directamente. Cada sector tiene su propia página con su fricción, sus
soluciones y sus preguntas.

El segundo eje es la transparencia sobre los límites: se declara por escrito lo
que NO se hace (publicidad, redes, diseño, consultoría de marketing) y lo que el
sistema NO debe hacer (dar consejo médico, legal o fiscal). Eso filtra a quien no
encaja y es lo que hace que un motor generativo pueda recomendar con criterio.

Competidor local de referencia: inedito.digital, que sí tiene ficha local
completa y publica contenido periódico.

## Operating Context

El canal donde ocurre la venta es WhatsApp. El embudo es: landing → chatbot de
diagnóstico o formulario de fricción → webhook de n8n → WhatsApp con el mensaje
prellenado.

La entrada comercial es la auditoría de fricción gratuita: un diagnóstico de
dónde se pierden prospectos o tiempo, que entrega también lo que no conviene
automatizar.

Plazo de implementación declarado: de 2 a 4 semanas.

## Capabilities and Constraints

Se instala: primera respuesta inmediata a cualquier hora, información estable
consultable, agendamiento sobre disponibilidad real en el calendario existente,
confirmaciones y recordatorios, y seguimiento escalonado de cotizaciones.

No se hace: campañas de publicidad, gestión de redes sociales, diseño gráfico ni
consultoría de marketing.

El sistema no da consejo profesional (médico, legal, fiscal) y deriva a una
persona en cuanto la conversación lo requiere. No sustituye al equipo: absorbe
primera respuesta, filtrado y agendamiento; el cierre sigue siendo humano.

No se cambian las herramientas del cliente: la automatización se monta sobre el
WhatsApp, la agenda y el CRM que ya usa.

Automatizar multiplica un flujo existente, no lo crea. Un negocio con dos
mensajes por semana no es candidato, y decirlo forma parte de la propuesta.

Restricción técnica: WhatsApp exige la API oficial de Meta, con plantillas
aprobadas fuera de la ventana de atención y número verificado.

**Precio: se cotiza a medida después de la auditoría.** No hay tarifa publicable,
y los textos deben decirlo de forma explícita en lugar de esquivar el tema.

## Brand Commitments

Nombre: Diabolical Services. Alternativo: Diabolical.

Logos en `src/assets/logo/` y `public/`: horizontal blanco, horizontal negro y
cuadrado blanco. **El logo y el nombre son intocables.**

**El chatbot de diagnóstico y el embudo a WhatsApp son intocables** en su
mecánica: el diálogo, el envío al webhook de n8n y la apertura de WhatsApp con
mensaje prellenado siguen funcionando igual. Puede cambiar cómo se ven y cómo se
entra a ellos.

Contacto: WhatsApp +52 449 513 6907 · contacto@diabolicalservices.tech

Negocio de área de servicio: no hay oficina abierta al público. No se publica
dirección exacta ni coordenadas.

**Preferencia estable de dirección visual: la convención de la categoría.** Ante
una ronda de dirección con alternativas ajenas sobre la mesa, el usuario eligió
la puerta de salida: el estándar que envía esta categoría, ejecutado a plena
fidelidad y sin ironía. No se cuelan rarezas por detrás ni se reabre la ronda en
cada trabajo.

**Listón de oficio: Linear, Vercel y Raycast.** No se copia su aspecto, se copia
su exigencia: retícula estricta y nada centrado por defecto, tipografía apretada
con saltos de escala evidentes, estados completos (reposo, hover, foco, carga,
error, vacío), microinteracciones cortas y con propósito, cero secciones de
relleno, y el rendimiento tratado como parte del diseño.

Listón competitivo adicional: superar a inedito.digital y mangospacemarketing.app
en su propio terreno.

## Evidence on Hand

**No hay ninguna prueba publicable.** Sin casos documentados, sin testimonios,
sin métricas medidas, sin clientes nombrables.

Esto es una restricción dura y deliberada, no una carencia que rellenar con
material provisional. El sitio ya publicó una vez cifras inventadas («+340%
citas», «18 h/semana», «+42% conversión») bajo el rótulo «Métricas Reales» y se
retiraron por no proceder de ningún proyecto documentado.

Lo que sí existe y es verificable: el mecanismo, los límites declarados, el
plazo de implementación, la restricción de la API de WhatsApp y las cuatro
páginas por sector con su fricción típica.

Cualquier trabajo futuro construye sobre eso. Una cifra sin origen citable no
entra, por bien que quede.

**Ventaja estructural medida frente a la competencia local** (31-08-2026,
midiendo el HTML servido sin ejecutar JavaScript, con scripts, estilos y
comentarios descartados):

| | Texto servido | h1 | h2 | Párrafos | JSON-LD |
|---|---|---|---|---|---|
| diabolicalservices.tech | 1352 palabras | 1 | 10 | 43 | 3 |
| inedito.digital | 8 palabras | 0 | 0 | 0 | 2 |
| mangospacemarketing.app | 9 palabras | 0 | 0 | 0 | 0 |

Los dos competidores son aplicaciones de cliente con el contenedor vacío: sirven
un cascarón y montan todo el contenido con JavaScript. Google lo ejecuta y los
ve; la mayoría de rastreadores de motores generativos no.

De ahí sale la estrategia de contenido: el trabajo no es alcanzar a nadie en
volumen, es **ampliar una ventaja que ya existe**. Todo lo que se escriba tiene
que viajar en el HTML servido, porque es justo lo que la competencia no hace.

## Product Principles

1. **Se describe el mecanismo, nunca el resultado ajeno.** Capacidades y
   problemas típicos del sector; jamás cifras atribuidas a un cliente.
2. **Decir lo que no se hace es parte de la oferta.** Filtra a quien no encaja y
   evita que un modelo recomiende mal, que es lo que quema la confianza.
3. **Una sola fuente de verdad por dato.** `sectores.json`, `faq.json` y
   `articulos.json` generan páginas, `<head>`, JSON-LD, sitemap y `llms.txt`; el
   contenido visible y el marcado no pueden divergir.
4. **El texto tiene que poder citarse.** Frases autónomas y concretas, porque un
   motor generativo cita frases, no impresiones.
5. **Lo que no se puede verificar no se publica**, aunque mejore la conversión.

## Accessibility & Inclusion

WCAG 2.2 AA como suelo, ya verificado en el sitio actual: contraste mínimo 4.5:1
(3:1 en texto grande), `prefers-reduced-motion` respetado sin dejar contenido
invisible, foco visible tematizado, y objetivos táctiles por encima de 24×24.

El contenido se sirve prerenderizado: debe ser legible sin ejecutar JavaScript,
tanto para lectores como para los rastreadores de motores generativos.
