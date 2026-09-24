---
name: Diabolical Services
description: Inteligencia artificial para negocios en Aguascalientes. Monocromo, dos zonas, y las escenas dibujadas en markup.
colors:
  acento: "#FFFFFF"
  acento-claro: "#0A0A0A"
  acento-tinta: "#0A0A0A"
  bisel: "#1c1c1c"
  superficie-0: "#000000"
  superficie-1: "#0B0B0B"
  superficie-2: "#151515"
  papel: "#F2F1EE"
  papel-2: "#E6E4DF"
  tinta: "#0A0A0A"
  texto-2-oscuro: "rgba(255, 255, 255, 0.72)"
  texto-3-oscuro: "rgba(255, 255, 255, 0.52)"
  texto-2-claro: "#5A5650"
  texto-3-claro: "#6E6A63"
  linea-oscura: "rgba(255, 255, 255, 0.10)"
  linea-clara: "rgba(10, 10, 10, 0.12)"
typography:
  titular-xl:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 7.2vw, 5.25rem)"
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "-0.045em"
  titular-xl-largo:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 5.6vw, 4.25rem)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.045em"
  titular-l:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "clamp(2rem, 4.6vw, 3.5rem)"
    fontWeight: 800
    lineHeight: 1.03
    letterSpacing: "-0.04em"
  titular-m:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "clamp(1.375rem, 2.2vw, 1.75rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  cuerpo-l:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "1.1875rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  cuerpo-destacado:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.58
    letterSpacing: "normal"
  cuerpo:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.62
    letterSpacing: "normal"
  rotulo:
    fontFamily: "CODE Bold, sans-serif"
    fontSize: "clamp(4rem, 19vw, 17rem)"
    fontWeight: 700
    lineHeight: 0.75
    letterSpacing: "-0.02em"
  etiqueta:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.18em"
  marca:
    fontFamily: "CODE Bold, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.02em"
rounded:
  xs: "4px"
  sm: "0.5rem"
  md: "1.25rem"
  radio: "1.5rem"
  losa: "2.4rem"
  telefono: "2rem"
  pill: "999px"
spacing:
  xs: "0.5rem"
  sm: "1rem"
  md: "1.75rem"
  lg: "3rem"
  seccion: "clamp(4.5rem, 8vw, 7.5rem)"
  seccion-amplia: "clamp(6rem, 12vw, 11rem)"
  seccion-compacta: "clamp(2.5rem, 4vw, 3.5rem)"
components:
  boton-primario:
    backgroundColor: "#FFFFFF"
    textColor: "{colors.superficie-0}"
    rounded: "{rounded.pill}"
    padding: "0 1.625rem"
    height: "3.25rem"
  boton-fantasma:
    backgroundColor: "transparent"
    textColor: "#FFFFFF"
    rounded: "{rounded.pill}"
    padding: "0 1.625rem"
    height: "3.25rem"
  insignia:
    backgroundColor: "rgba(255, 255, 255, 0.028)"
    textColor: "{colors.texto-2-oscuro}"
    typography: "{typography.etiqueta}"
    rounded: "{rounded.pill}"
    padding: "0.375rem 0.75rem 0.375rem 0.625rem"
  tarjeta-oscura:
    backgroundColor: "rgba(255, 255, 255, 0.028)"
    textColor: "#FFFFFF"
    rounded: "{rounded.radio}"
    padding: "1.5rem"
  tarjeta-clara:
    backgroundColor: "#FFFFFF"
    textColor: "{colors.tinta}"
    rounded: "{rounded.radio}"
    padding: "1.5rem"
---

# Design

Sistema del sitio de Diabolical Services, registrado desde el build, no desde la
intención. Todo lo que hay aquí sale de `src/index.css`, `src/contenido/Tema.jsx`
y los componentes que ya están en producción.

## Overview

El sistema es **monocromo**. No hay color de marca: el acento es la inversión de
la zona —blanco sobre negro, negro sobre papel— y todo lo que destaca se lo gana
con peso, tamaño o superficie. Es la restricción más dura del sistema y la que
hace que un elemento importante lo parezca de verdad, porque no puede apoyarse
en un color llamativo que no significa nada.

Una segunda idea lo sostiene: **dos zonas que comparten los mismos nombres**. `.zona-oscura` y `.zona-clara` redefinen el mismo juego de variables
—texto, líneas, tarjetas, acento, inverso— así que cada componente se escribe una
vez y funciona en las dos sin una variante clara de cada cosa. Ahí es donde un
sistema de este tamaño se desincroniza, y el diseño está montado para que no
pueda pasar.

La página alterna las zonas tres veces, y el corte siempre cae donde cambia el
tema de conversación. Diez secciones del mismo negro se leen como una sola masa
plana; el cambio de fondo es lo que marca que empieza un capítulo nuevo, y por
eso sustituye a los separadores.

Los colores, la escala tipográfica y el radio son **editables en caliente** desde
`/admin`: `Tema.jsx` los emite como custom properties en el HTML servido. Los
valores del frontmatter son los de fábrica, que son también el respaldo cuando
un valor guardado no pasa la validación.

## Colors

Estrategia: **monocromo**. Negro, papel y la escala de grises entre ellos. No hay
color de marca y no debe añadirse uno: el acento es un rol, no un tono, y lo
resuelve `--acento-zona`, que vale blanco en zona oscura y tinta en zona clara.

Eso hace que el botón primario sea blanco sobre negro y negro sobre papel sin
que ningún componente tenga que saber en qué zona está. También convierte el
contraste en el único recurso de jerarquía disponible, que es exactamente la
disciplina que este sistema quiere.

Los grises secundarios están elegidos por contraste medido, no a ojo:

| Token | Sobre | Ratio |
|---|---|---|
| `texto-2-oscuro` | `superficie-0` | 10,8:1 |
| `texto-3-oscuro` | `superficie-0` | 5,7:1 |
| `texto-2-claro` | `papel` | 6,4:1 |
| `texto-3-claro` | `papel` | 4,8:1 |

El suelo es WCAG 2.2 AA: 4,5:1 en texto normal, 3:1 en texto grande. Verificado
resolviendo cada color en canvas —Tailwind 4 emite `oklab()` y un parser por
expresión regular no puede leerlo— con una aserción de control: blanco sobre
negro tiene que dar exactamente 21,00 o el medidor está roto.

`bisel` (#1c1c1c) es el único color que no sale de la escala: es el marco físico
del mockup de teléfono, un material, no un tono de marca.

**No hay grano.** La textura de ruido que cubría la página se retiró: en un
sistema monocromo ensucia los negros profundos y resta nitidez al texto pequeño,
que es justo donde este diseño no puede permitirse perder.

## Typography

Dos caras y tres registros, sin nada entre medias.

**CODE Bold** es la cara de la marca y está reservada: el logotipo, el reloj del
panel de guardia, el rótulo gigante del pie. Va en mayúsculas con `letter-spacing`
positivo. No se usa para leer.

**Plus Jakarta Sans** hace todo lo demás. Los titulares van a peso 800 con
tracking cerrado (−0.045em en el grande), que es lo que da el bloque compacto de
la categoría. El cuerpo va a 400.

El ramp de texto tiene **cuatro pasos y el salto entre ellos es evidente**:
19 px de entradilla, 17 px de cuerpo destacado, 15 px de cuerpo y 11 px de
etiqueta. El suelo de lectura es 11 px y solo para etiquetas.

Llegó a tener cinco pasos, con 15, 14 y 13 px conviviendo para lo mismo. El ojo
no distingue esos tres, que es exactamente lo que produce una página sin
jerarquía, y contradecía esta misma regla. Se colapsaron. Lo mismo con los 8 y
9 px que quedaban del diseño anterior en el blog, la privacidad y el chatbot:
por debajo de 11 px no hay contraste que salve la lectura.

`rotulo` vive fuera del ramp a propósito: es la marca a escala de fachada en el
pie, superficie y no texto de lectura.

**Sin relleno de plantilla** (skill `design-taste-frontend`, 24-09-2026):

- Una sola etiqueta sobre titular en todo el sitio: la del hero de la
  portada, sin pastilla ni punto. El titular ya dice de qué trata cada sección.
- Nada de tira pequeña bajo los botones del hero, ni frases de relleno bajo
  un titular, ni numeración decorativa («01», «02») donde no hay secuencia.
- Ni una raya (—, –) en el texto visible: los incisos van entre paréntesis.
  El chatbot y el mensaje que genera el formulario son la excepción: forman
  parte del embudo y no se tocan.
- Como mucho un punto medio (·) por línea.

**Llamadas a la acción.** Cada sección termina en `CtaServicio`: un botón
grande (`boton-grande`) que cotiza el servicio concreto y, al lado, la misma
pregunta por WhatsApp con el mensaje ya redactado. Una etiqueta por página:
«Cotizar mi chatbot» en la landing de chatbots, «Cotizar para mi spa» en su
giro, «Cotizar mi proyecto» donde no hay un servicio concreto. El destino
lleva el servicio y el giro (`/contacto?servicio=chatbots&giro=spas`) y el
formulario deja escrito el interés. Ningún botón se parte en dos líneas desde
360 px.

`titular-xl titular-largo` es el mismo titular un escalón por debajo, solo para
un h1 que tiene que llevar una frase clave larga («Diseño y desarrollo de
páginas web en Aguascalientes»; en la portada, «Páginas web e inteligencia
artificial para negocios en Aguascalientes»; en quiénes somos, «Una agencia de
páginas web e inteligencia artificial en Aguascalientes»). Va siempre con la
columna del texto a 7 de 12, como en la portada. A tamaño completo la palabra más larga se sale
de su columna y la frase ocupa cinco líneas. No es un tercer tamaño de titular
para elegir a gusto: si el h1 cabe en `titular-xl`, va en `titular-xl`.

`--escala-titulo` y `--escala-texto` son multiplicadores que afectan a la escala
entera. Se puede agrandar la jerarquía sin descomponerla, y no hay forma de
cambiar el tamaño de un titular suelto desde el panel — a propósito.

**Titular a dos tonos**: la primera línea en `texto-3`, la segunda en `texto-1`.
El contraste lo hace el tono, nunca un degradado.

## Layout

Contenedor de 76rem con 1,25rem de aire lateral (2rem desde 768 px). Todo cae en
la retícula de 8 px.

El ritmo vertical son tres pasos: `seccion` para la mayoría, `seccion-amplia`
para las dos que respiran, `seccion-compacta` para las tiras. El cambio de zona
hace el trabajo de separar; no hay líneas divisorias entre secciones.

Nada centrado por defecto. Los encabezados de sección se alinean a la izquierda
dentro de una columna de 3xl: centrar obliga al ojo a volver al centro en cada
línea y rompe la columna de lectura. Las dos excepciones son deliberadas: la
tira de herramientas y la tarjeta negra del cierre.

Medida de lectura: 46ch en `cuerpo-l`, 62ch en `cuerpo`.

Móvil primero de verdad: 375 px sin scroll horizontal y sin un solo objetivo
táctil por debajo de 24×24, que es el mínimo de WCAG 2.2.

**Hero de página** (`HeroPagina`, 24-09-2026). Todas las páginas abren con el
mismo componente, que pinta dos composiciones sobre el mismo HTML:

- Desde 1024 px, la de siempre: migas, texto a la izquierda (7 u 6 columnas) y
  escena a la derecha.
- En teléfono y tableta, la escena es el banner: arriba del todo, a sangre y
  por detrás del menú flotante, con un foco de luz encima. Debajo, las migas en
  una sola línea, el título, la `bajada` y el botón. Los tres entran en el
  primer pantallazo de 360 × 740, 375 × 667 y 375 × 812.
- La `bajada` es la frase corta del teléfono (20 palabras como mucho). La
  entradilla larga sigue en el HTML y se ve en escritorio; sin bajada, el
  teléfono enseña la entradilla.
- Del lienzo de la escena solo se ve su **encuadre** (`ENCUADRES` en
  `escenas/index.js`): la zona donde pasa algo, sin el aire que traía para la
  columna de escritorio. El alto tiene tope (30 % de la pantalla, 24 % en
  pantallas bajas) para que el botón no baje.
- En el teléfono el botón del hero mide lo que su texto: a todo el ancho, su
  extremo caía debajo de la burbuja del chatbot.
- En horizontal (teléfono girado), texto y escena lado a lado.
- Los artículos usan su fotografía como banner en lugar de una escena.
- En el HTML el texto va antes que la escena, que es el orden en que se lee.
  El teléfono la pinta primero solo con CSS; nada se duplica.

## Elevation & Depth

En zona oscura no hay sombra: la elevación se dibuja con un velo blanco sobre el
fondo (2,8% en reposo, 6% al pasar por encima) y una línea a 10%. Una sombra
negra sobre negro no eleva nada.

En zona clara sí, y con desplazamiento y desenfoque reales:
`0 1px 2px rgba(10,10,10,.04), 0 8px 24px -12px rgba(10,10,10,.12)`. Un halo sin
desplazamiento es decoración, no profundidad.

Los marcos de dispositivo llevan sombra larga y muy difuminada
(`0 30px 80px -40px`) porque son objetos apoyados sobre la página, no paneles de
la página.

## Shapes

Radio base editable, 1,5rem de fábrica. Las acciones son píldoras completas
(`999px`); las tarjetas usan el radio base; los marcos de ventana bajan a
1,25rem y el de teléfono sube a `telefono` (2rem) con borde de 6px, que es lo que
lo hace leer como un teléfono y no como una tarjeta alta.

`losa` (2,4rem) es la tarjeta negra incrustada en la zona clara del cierre: más
redonda que una tarjeta normal porque es un objeto puesto sobre la página, no
una pieza de ella. `xs` (4px) es el anillo de foco.

Bordes de 1px siempre. No hay bordes de color de más de 1px en ningún lado.

## Components

**Botones.** Tres jerarquías y nada más: acento (la acción primaria, como mucho
dos por página), primario invertido (blanco sobre oscuro, negro sobre claro) y
fantasma. Alto mínimo 3,25rem. Todos tienen reposo, hover, activo y
deshabilitado; el hover sube 2px y el activo baja 1px.

**Insignia de sección.** Píldora con un punto del acento. No es adorno: lleva el
mismo texto que el enlace del menú que apunta ahí, y es lo que te dice de qué va
el capítulo cuando llegas a mitad de página desde un enlace.

**Tarjeta.** Una sola definición para las dos zonas. `tarjeta-enlace` añade el
hover; sin esa clase la tarjeta no reacciona, porque una tarjeta que se mueve
sin ser pulsable miente.

**Enlace de texto.** El subrayado se dibuja de 0 a 100% del ancho en 220 ms con
`background-size`. Aparecer de golpe es lo que hace el navegador por defecto.

**Escenas animadas.** Las ilustraciones (de marca, de servicio, de tipo de
sitio y de sector, más la red de giros del índice de sectores y la de guías
del blog) son SVG con `viewBox` y no imágenes. Cada una recibe un número de
fotograma y dibuja; no sabe quién la anima.

En el servidor se dibuja su fotograma de póster, así que el contenido viaja en el
HTML. En el navegador, Remotion la anima desde un trozo aparte que solo se
descarga cuando la escena entra en pantalla (39 kB brotli, cero en el bundle
crítico), y se pausa al salir de vista. Con `prefers-reduced-motion` o sin
`IntersectionObserver` se queda en el póster, que es un resultado correcto y no
una versión rota.

La regla que las mantiene distintas sin convertirlas en veintidós estilos: cada
escena enseña el **mecanismo**, no el tema. La de posicionamiento no dibuja una
lupa, dibuja un resultado subiendo al primer puesto. Las seis de sector comparten
esqueleto a propósito —en los seis giros pasa lo mismo— y solo cambia el
artefacto que el sistema produce.

El conector y el pulso que lo recorre salen de **una sola** función `trazado()`.
Cuando cada uno calculaba el suyo, la luz viajaba por una línea que no estaba
dibujada.

**Superficies del navegador.** Selección, cursor de texto, anillo de foco y barra
de desplazamiento están tematizados. Es lo más barato que distingue una página
construida de una ensamblada, y lo que más se salta.

## Do's and Don'ts

**Sí**

- Usa `.zona-oscura` o `.zona-clara` en la sección y deja que los componentes
  hereden. Nunca escribas una variante clara de un componente que ya existe.
- El acento es la inversión de la zona, nunca un tono. Si hace falta un color
  para que algo destaque, lo que falla es la jerarquía.
- Mide el contraste resolviendo el color en canvas, con la aserción de control.
  Tailwind 4 emite `oklab()`; un parser por expresión regular devuelve basura y
  la basura pasa por buena.
- Deja el contenido visible por defecto y anima desde ahí. Todo lo que se ve
  tiene que estar en el HTML servido: es la ventaja que este sitio tiene sobre
  la competencia local.
- Una sola curva: `cubic-bezier(0.16, 1, 0.3, 1)`.

**No**

- Nada de degradados en texto. El énfasis sale del peso y del tamaño.
- Nada de introducir un color de marca. El sistema es monocromo y esa es su
  identidad, no una limitación pendiente de resolver.
- Nada de esconder contenido para poder revelarlo. La primera versión del panel
  de guardia bajaba los avisos no activos a opacidad 0,18 y el texto dejaba de
  leerse; ahora los cuatro se leen siempre y lo que se mueve es un realce.
- Nada de bucles decorativos. El único que hay es el latido del punto de «en
  operación», y afirma algo concreto que está escrito al lado.
- Nada de tarjetas iguales con icono, título y texto como estructura de página.
  Si tres cosas no pesan lo mismo, la retícula no puede decir que sí.
- Nada de números de sección salvo donde el orden sea información. El proceso
  los lleva porque cada paso depende del anterior y tiene plazo; el catálogo los
  lleva porque son las etapas del ciclo de un cliente.
- Nada de tipografía de sistema como voz de display. CODE Bold es la marca.

**No canonizado.** Dos cosas que el build lleva y que NO son regla de la casa:

Las insignias de sección (la píldora sobre el titular) son un recurso que el
suelo de oficio prohíbe por defecto. Están aquí porque el usuario las fijó con
referencias visuales y porque llevan carga real —son el ancla a la que apunta la
navegación—. Una insignia que solo decore es un defecto.

El panel `/admin` corre un ramp de texto más denso (12 y 13 px) que el sitio
público. Es una superficie de trabajo, no de lectura, y una densidad mayor está
justificada ahí; no se hereda hacia fuera.

`ChatDemo` usa los tamaños de la interfaz de WhatsApp, no los de la casa. Retrata
otro producto y tiene que parecerse a él.
