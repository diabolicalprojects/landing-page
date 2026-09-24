# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Dueños y encargados de negocios pequeños de Aguascalientes, México. De 1 a 50
empleados. Seis giros con la fricción ya mapeada:

- **Inmobiliarias**: el lead que pregunta por una propiedad a las once de la
  noche y se enfría antes de que el asesor lo vea.
- **Salones de belleza y centros de estética**: quien atiende tiene las manos en
  un tinte y el teléfono lleva seis mensajes.
- **Clínicas y consultorios médicos**: la recepción no puede estar en el
  mostrador y en el chat a la vez.
- **Gimnasios y estudios de entrenamiento**: preguntan el precio, nadie contesta
  en el momento, se van al de enfrente.
- **Despachos y oficinas profesionales**: media hora al día explicando lo mismo
  por teléfono.
- **Comercio y tienda en línea**: carritos abandonados y preguntas de talla de
  madrugada.

La situación de fondo es siempre la misma: llega un flujo constante de mensajes
y hay una agenda que llenar, pero quien atiende está a la vez en el mostrador,
al teléfono y en el chat. Lo que entra fuera de horario se queda sin responder
hasta el día siguiente, y para entonces el cliente ya reservó en otro sitio.

Quien decide es el dueño, y evalúa desde el móvil, casi siempre en un hueco
entre dos tareas. No es un comprador técnico: no le interesa qué modelo de IA
se usa, le interesa dejar de perder citas.

## Product Purpose

Agencia de inteligencia artificial. Tres frentes que se venden juntos porque un
interesado se pierde justo en las costuras entre ellos:

1. **Sitios web con IA dentro** — desde una landing hasta una tienda en línea,
   con un asistente que resuelve dentro del propio sitio.
2. **Agendamiento automático** — sobre el calendario real del negocio, con
   confirmación, recordatorio y reagenda.
3. **Automatizaciones a medida** — lo que hoy se hace copiando y pegando: pasar
   un lead al CRM, armar una cotización, mandar el contrato, avisar al equipo.

Alrededor, un catálogo de 17 servicios en cinco etapas (captación, conversión,
atención y venta, marca, estrategia y medición).

Todo se monta sobre las herramientas que el negocio ya usa. No se cambia de
sistema a nadie.

Éxito para el visitante: entender en un vistazo si su negocio es candidato, y
solicitar la auditoría de fricción gratuita.

**Corrección de rumbo registrada.** Durante un tiempo el sitio se leía como si
solo se vendieran chatbots de WhatsApp. WhatsApp sigue siendo el canal donde
ocurre la venta, pero es UNO de los frentes, no la oferta. Cualquier texto que
vuelva a cerrar la oferta a WhatsApp es una regresión.

**Frase clave del negocio: «Inteligencia artificial para negocios en
Aguascalientes».** Va literal en el h1 de la portada, y cada sector la declina en
el suyo («Inteligencia artificial para inmobiliarias»). Todo el trabajo de SEO,
GEO y AEO se orienta a esa frase; un titular ingenioso que no la contenga la deja
fuera del sitio entero, porque ningún otro encabezado pesa lo que pesa el h1.

**Catálogo: 13 servicios.** Se retiraron LinkedIn de empresa, tarjetas NFC,
tablero de resultados y estrategia de canales. «Presencia en ferias» pasó a
«Activaciones digitales para expos y eventos».

## Positioning

**Enfoque (24-09-2026).** Tres servicios principales —sitios web, chatbots con
IA y agendamiento automatizado— para cuatro giros principales —inmobiliarias,
gimnasios, spas y salones de uñas—. Posicionamiento, publicidad, marca,
eventos y automatizaciones a medida se siguen ofreciendo como complementarios:
misma calidad y mismo alcance publicado, pero no encabezan nada. Clínicas,
despachos y comercio se siguen atendiendo como giros secundarios. Salones de
belleza se dividió en spas y salones de uñas.

Frases clave: «sitios web en Aguascalientes» y «páginas web Aguascalientes»
(landing de sitios web), «chatbots Aguascalientes» (landing de chatbots),
«empresas de IA en Aguascalientes», «inteligencia artificial Aguascalientes» e
«IA para negocios Aguascalientes» (portada y guías del blog).

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
entra a ellos. Desde 2026-09-14 el prospecto se guarda ADEMÁS en el propio
servidor, porque antes un fallo del webhook era un prospecto perdido sin rastro.

**Voz: formal, de usted, con guiño diabólico.** Profesional sin caer en lo
técnico: nada de vocabulario que un dueño de negocio no maneje. El juego con lo
diabólico entra donde suma y siempre en positivo — «la parte más endiablada del
día», «un aliado incansable», «dicen que el diablo está en los detalles: estos
son los nuestros». Nunca en algo que inquiete.

**Se habla de lo que SÍ ofrecemos.** Nada de describirle al visitante lo que hace
mal hoy ni lo que podría perder. «Somos diablillos, no estafadores» se retiró por
sugerir justo lo contrario de lo que pretendía; en su lugar, «Compromisos que
firmamos con gusto». Las páginas de sector cuentan un día CON el sistema puesto,
no la fricción que se sufre sin él. Esta regla vale para todo texto nuevo.

**Identidad visual: monocromo.** Blanco y negro, sin color de marca. El acento
es la inversión de la zona, no un tono. Se probó un ámbar y se retiró: en este
sistema el contraste es el único recurso de jerarquía, y eso es lo que lo
distingue. No se introduce un color de acento.

**El logotipo aparece animado en al menos tres superficies** —portada, quiénes
somos y contacto— más una escena propia por servicio y por sector. Las
animaciones las mueve Remotion **dentro de la web**, no como video.

**El contenido del sitio se edita desde `/admin`, no desde el código.** Los
textos, los botones, los enlaces, las tarjetas, el color de acento y la escala
tipográfica viven en `data/contenido.json` (volumen), fusionados sobre
`src/data/contenido.json` (fábrica). Quien toque la portada tiene que preguntarse
antes si eso debería ser editable en vez de estar escrito en un componente.

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

Tras el rediseño del 14-09-2026 la portada sirve **2045 palabras** renderizadas,
con un solo h1 y sin saltos de nivel de encabezado.

El mismo día el sitio pasó de una landing a **28 rutas renderizadas en
servidor**: inicio, nosotros, índice de servicios más una página por cada uno de
los trece, índice de sectores más una por cada uno de los seis, contacto, blog y
privacidad. Cada página nueva es superficie indexable que la competencia local no
tiene, y la ventaja estructural se multiplica por el número de páginas.

Las rutas de sector cambiaron de `/automatizacion-para-X` a `/sectores/X`. Las
antiguas devuelven 301 y **no deben borrarse**: estaban indexadas, y un 404
tiraría a la basura lo que esas páginas hubieran ganado.

El 24-09-2026 el servicio de sitio web pasó a su propia landing,
`/paginas-web-aguascalientes`, para competir por «diseño de páginas web»,
«diseño y desarrollo de páginas web en Aguascalientes» y «páginas web
Aguascalientes». La portada sigue en la frase de la casa y enlaza a la landing
desde el menú, el primer pilar, el catálogo y el pie.

El término no está libre: una revisión del SERP encontró alrededor de una docena
de agencias locales posicionadas en él, con páginas de 450 a 2 000 palabras y
el término en el h1; cuatro publican precio. Por eso la página no afirma ser «la
única agencia especializada». El ángulo es lo que las demás no ofrecen juntas:
la página legible sin JavaScript para los motores de IA, el asistente dentro del
sitio, el panel de edición y el alcance de cada tipo de sitio publicado, incluido
lo que no incluye. El precio sigue sin publicarse; la página contesta la
pregunta con los factores de los que depende.

Ese mismo día la casa entera pasó a presentarse como **agencia de páginas web e
inteligencia artificial en Aguascalientes**, no solo la landing. El h1 de la
portada es «Páginas web e inteligencia artificial para negocios en
Aguascalientes»: lleva dentro, entera, la frase clave anterior. El `<title>`
dice «Agencia de páginas web e IA en Aguascalientes»; la ficha de la empresa
(JSON-LD), quiénes somos, el pie, la FAQ y los `llms.txt` dicen lo mismo, y cada
sector enlaza a la página web de su giro. «Diseño de páginas web» como término
exacto se deja a la landing para que la portada no compita con ella.

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
