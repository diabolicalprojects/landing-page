---
name: Diabolical Services
description: Agencia de IA en Aguascalientes. Dos zonas, un acento, y las escenas dibujadas en markup.
colors:
  acento: "#FF4A1C"
  acento-claro: "#C2320B"
  acento-tinta: "#0A0A0A"
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
  cuerpo:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.62
    letterSpacing: "normal"
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
  sm: "0.5rem"
  md: "1.25rem"
  radio: "1.5rem"
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
  boton-acento:
    backgroundColor: "{colors.acento}"
    textColor: "{colors.acento-tinta}"
    typography: "{typography.cuerpo}"
    rounded: "{rounded.pill}"
    padding: "0 1.625rem"
    height: "3.25rem"
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

Una sola idea sostiene el sistema: **dos zonas que comparten los mismos
nombres**. `.zona-oscura` y `.zona-clara` redefinen el mismo juego de variables
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

Estrategia: **neutros más un acento**. El negro y el papel hacen todo el trabajo
de superficie; el ámbar `#FF4A1C` aparece como mucho una vez por sección y solo
en dos papeles: la acción primaria, y lo que está vivo ahora mismo (el punto de
«en operación», la franja del aviso recién llegado, el hueco que acaba de
ocuparse en la agenda).

El acento tiene dos versiones porque una no llega: `#FF4A1C` da 6,25:1 sobre
negro pero solo 3,36:1 sobre papel. `--acento-claro` (`#C2320B`) da 5,59:1 sobre
papel y es el que usa la zona clara. Nunca se usa el claro sobre negro ni al
revés.

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

## Typography

Dos caras y tres registros, sin nada entre medias.

**CODE Bold** es la cara de la marca y está reservada: el logotipo, el reloj del
panel de guardia, el rótulo gigante del pie. Va en mayúsculas con `letter-spacing`
positivo. No se usa para leer.

**Plus Jakarta Sans** hace todo lo demás. Los titulares van a peso 800 con
tracking cerrado (−0.045em en el grande), que es lo que da el bloque compacto de
la categoría. El cuerpo va a 400.

La escala es de tres pasos y el salto entre ellos es evidente. Antes convivían
tamaños de 8, 9, 10 y 11 px usados para lo mismo: cuatro pasos que el ojo no
distingue, que es exactamente lo que produce una página sin jerarquía. El suelo
de lectura es 11 px y solo para etiquetas.

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
1,25rem y el de teléfono sube a 2rem con borde de 6px, que es lo que lo hace
leer como un teléfono y no como una tarjeta alta.

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

**Escenas.** Las ilustraciones de producto son markup y CSS con los tokens de la
zona, no imágenes: pesan cero, se adaptan al ancho, cambian con el tema y se leen
igual en claro que en oscuro. Una imagen exportada no hace ninguna de las cuatro.

**Superficies del navegador.** Selección, cursor de texto, anillo de foco y barra
de desplazamiento están tematizados. Es lo más barato que distingue una página
construida de una ensamblada, y lo que más se salta.

## Do's and Don'ts

**Sí**

- Usa `.zona-oscura` o `.zona-clara` en la sección y deja que los componentes
  hereden. Nunca escribas una variante clara de un componente que ya existe.
- Un acento por sección como mucho, y solo en la acción primaria o en lo que
  está vivo ahora.
- Mide el contraste resolviendo el color en canvas, con la aserción de control.
  Tailwind 4 emite `oklab()`; un parser por expresión regular devuelve basura y
  la basura pasa por buena.
- Deja el contenido visible por defecto y anima desde ahí. Todo lo que se ve
  tiene que estar en el HTML servido: es la ventaja que este sitio tiene sobre
  la competencia local.
- Una sola curva: `cubic-bezier(0.16, 1, 0.3, 1)`.

**No**

- Nada de degradados en texto. El énfasis sale del peso y del tamaño.
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

**No canonizado.** El build usa insignias de sección (la píldora sobre el
titular), un recurso que el suelo de oficio de la skill prohíbe por defecto. Está
aquí porque el usuario lo fijó con seis referencias visuales y porque estas
llevan carga real —son el ancla a la que apunta la navegación—, no porque sea
una regla de la casa para superficies futuras. Una insignia que solo decore es
un defecto.
