# Design system — Diabolical

Extraído del código que ya está en producción el 2026-09-13, no inventado.
Fuentes leídas: `src/index.css`, `src/components/common/`, `src/components/sections/`, `src/pages/`, `src/assets/`.

**Cómo se usa este documento.** Es la vara de medir. Un cambio visible que incumpla una regla marcada como **Regla** se devuelve, con la regla citada y el arreglo. Lo marcado como **Estado actual** describe lo que hay hoy, incluidas las incoherencias; no es norma.

**Quién manda.** El humano corrige este documento. Su versión gana sobre el criterio de diseño.

---

## 1. Fundamento

El sitio es **oscuro, monocromo y tipográfico**. No hay color de marca. Toda la jerarquía se construye con tres recursos y solo tres:

1. **Opacidad del blanco** sobre negro (sustituye a la paleta).
2. **Escala tipográfica** con saltos grandes (sustituye al peso del color).
3. **Cambio de superficie** entre secciones (sustituye a las separaciones dibujadas).

**Regla 1.1 — Nada de color decorativo.** No se introducen colores de acento. Los únicos hex ajenos al monocromo que existen hoy son la paleta prestada de WhatsApp en la demo de chat (`#0b141a`, `#005c4b`, `#1f2c33`, `#25d366`, `#53bdeb` en `ChatDemo.jsx` / `EjemploAtencion.jsx`) y son **cita literal de la interfaz de WhatsApp**, no paleta de Diabolical. No se reutilizan fuera de esa demo.

**Regla 1.2 — El grano no se toca.** `body::before` pone una capa de ruido SVG a `--noise-opacity: 0.05`, `z-index: 9999`, `pointer-events: none`. Es firma de marca. No se elimina, no se sube, no se baja por sección.

---

## 2. Color

### 2.1 Superficies (definidas en `:root`)

| Token | Hex | Uso |
|---|---|---|
| `--superficie-0` | `#000000` | Fondo por defecto. Hero, Servicios, Sectores, Comparativa, Contacto. |
| `--superficie-1` | `#0b0b0b` | Eleva un bloque. Clase `.superficie-1`. Mecanismo, EjemploAtencion, FAQ. |
| `--superficie-2` | `#141414` | Punto más alto de la pila. Clase `.superficie-2`. Límites, cierre de Servicios. |
| `--inversion` | `#ffffff` | La inversión. **Hoy solo la usan las superficies del navegador** (`::selection`, `:focus-visible`, `caret-color`, `accent-color`). Ninguna sección invierte todavía. |

`--color-absolute-black: #000000` y `--color-pure-white: #FFFFFF` viven en `@theme` (Tailwind v4) y alimentan `bg-black` / `text-white`.

**Regla 2.1 — Tres negros y no más.** Antes había `#000000`, `#030303` y `#050505` usados como si diferenciaran secciones: 1.03:1 de contraste entre ellos, o sea el mismo color. Cualquier fondo nuevo usa uno de los tres tokens. **No se inventan negros intermedios.**

**Regla 2.2 — Dos secciones seguidas no comparten superficie.** El cambio de superficie es lo que separa. Si dos secciones contiguas tienen el mismo fondo, una de las dos está mal.

### 2.2 Escala de texto: opacidad del blanco

Esta es la paleta real del sitio. Contraste calculado sobre `#000000`.

| Valor | rgb resultante | Contraste | Para qué |
|---|---|---|---|
| `text-white` | `#ffffff` | 21:1 | Titulares, cifras, el dato que se quiere que recuerden. |
| `white/70` | `#b3b3b3` | 10.9:1 | Énfasis dentro de párrafo. |
| `white/60` | `#999999` | 7.4:1 | **Cuerpo de texto y etiquetas.** El valor más usado. |
| `white/55` | `#8c8c8c` | 6.2:1 | Texto de apoyo, pies, tranquilizadores. |
| `white/50` | `#808080` | 5.3:1 | Suelo del texto legible. |
| `white/40` | `#666666` | 3.7:1 | **No es texto.** Solo tachado, estado inactivo, segunda mitad de un titular a modo de sombra. |
| `white/30` y por debajo | — | < 3:1 | **Nunca texto.** Solo bordes, iconos decorativos, placeholders. |

**Regla 2.3 — `white/40` es el suelo absoluto y solo para texto no informativo.** Si el usuario necesita leer la frase para decidir algo, `white/50` es el mínimo. Si es la frase que reduce la fricción de convertir (garantía, "gratis", "sin compromiso"), `white/70`.

Hoy `white/40` se usa 40 veces. Está en la frontera y es donde más se rompe la regla.

### 2.3 Bordes y superficies de vidrio

| Valor | Uso |
|---|---|
| `white/5` | Borde por defecto, separador entre secciones (`border-t border-white/5`). 51 usos. |
| `white/10` | Borde de tarjeta, de campo de formulario. 42 usos. |
| `white/[0.02]` – `white/[0.03]` | Relleno de vidrio. |
| `white/15` – `white/25` | Borde en hover / foco. |

Tres clases de vidrio, en `index.css`:

- `.glass` — `rgba(255,255,255,0.02)`, `blur(32px) saturate(160%)`, borde `white/5`, sombra `0 4px 24px -1px rgba(0,0,0,0.6)`. Barra de navegación y capas flotantes.
- `.glass-light` — `rgba(255,255,255,0.05)`, `blur(16px)`, borde `white/10`. Chips y píldoras.
- `.glass-card` — degradado `135deg` de `white/[0.03]` a `white/[0.01]`, `blur(24px)`, borde `white/[0.06]`. Tarjetas y el formulario.

**Regla 2.4 — El vidrio no se escribe a mano.** Si hace falta una superficie translúcida, se usa una de las tres clases. No se reescriben `backdrop-filter` sueltos por componente.

---

## 3. Tipografía

### 3.1 Familias

| Token | Familia | Dónde |
|---|---|---|
| `--font-title` | **CODE Bold** (`/fonts/CODE-Bold.otf`) | Todos los titulares. Siempre vía `.font-title`. |
| `--font-jakarta` | **Plus Jakarta Sans** | Cuerpo. Es la fuente de `body`. |
| `--font-inter` | Inter | Declarada, sin uso relevante. |
| `--font-astera`, `--font-venus`, `--font-square` | Astera v2, Venus Rising, Square Game | Declaradas y cargadas desde `src/assets/fonts/`. **Sin ningún uso en el código.** |
| `'Azeret Mono'` | vía `.terminal-text` | Monoespaciada para registros y demos técnicas. |

Todas las `@font-face` llevan `font-display: swap`.

**Regla 3.1 — Astera, Venus Rising y Square Game están fuera del sistema hasta que el humano diga lo contrario.** Se cargan y no se usan: o entran con un papel definido, o se quitan del `@font-face` para no arrastrar tres ficheros que nadie pinta.

**Regla 3.2 — Dos familias visibles como máximo en una pantalla:** CODE Bold para titular, Plus Jakarta Sans para todo lo demás. Azeret Mono solo dentro de una demo de terminal o chat.

### 3.2 Titulares

`body` arranca en **18 px** (base grande a propósito, por legibilidad).

`.font-title` — `font-family: CODE Bold`, `letter-spacing: 0.02em`, `text-transform: uppercase`. Los titulares van **siempre** en mayúsculas.

Dos clases fluidas ya definidas:

| Clase | `font-size` | `line-height` | `letter-spacing` |
|---|---|---|---|
| `.heading-lg` | `clamp(2rem, 5vw, 4.5rem)` | `1.1` | `0.1em` |
| `.heading-md` | `clamp(1.5rem, 3.5vw, 3rem)` | `1.2` | `0.08em` |

**Estado actual:** el Hero **no** usa `.heading-lg`; usa `text-4xl sm:text-5xl md:text-6xl xl:text-7xl` con `leading-[0.92] tracking-tighter`. Es un segundo sistema de titulares conviviendo con el primero: uno con tracking abierto (`0.1em`) y otro con tracking cerrado (`tracking-tighter`, −0.05em). Son dos voces distintas.

**Regla 3.3 — Un titular por página manda, y es el H1.** El registro ajustado (`leading-[0.92] tracking-tighter`) es el del H1 de portada y de las cabeceras de página. Los H2 de sección usan `text-2xl md:text-4xl font-title uppercase tracking-tighter leading-[0.9]`, que es lo que ya hacen Contacto, Comparativa y FAQ. **No se mezclan tracking abierto y cerrado en la misma pantalla.**

### 3.3 Micro-tipografía: el suelo de 11 px

`index.css` ya fija el criterio y es la regla más incumplida del sitio:

```css
.etiqueta { font-size: 0.6875rem; /* 11px: el suelo real de lectura */
            line-height: 1.2; letter-spacing: 0.18em;
            text-transform: uppercase; font-weight: 700; }

.etiqueta-mono { font-size: 0.6875rem; line-height: 1.2;
                 letter-spacing: 0.12em; text-transform: uppercase;
                 font-variant-numeric: tabular-nums; }
```

**Regla 3.4 — 11 px es el suelo. Nada por debajo.** Toda etiqueta, kicker, epígrafe o pie en mayúsculas usa `.etiqueta` o `.etiqueta-mono`. Si hace falta que algo ocupe menos, se acorta el texto, no se encoge la letra.

**Estado actual, medido:** `text-[10px]` aparece 38 veces, `text-[9px]` 27 veces, `text-[8px]` 9 veces. Son 74 incumplimientos de una regla que el propio CSS declara. Concentrados en el formulario de contacto, el chatbot y las páginas de sector.

**Regla 3.5 — Mayúsculas + tracking = poco texto.** `text-transform: uppercase` con `letter-spacing ≥ 0.18em` solo para cadenas de menos de 40 caracteres. Un párrafo en versalitas espaciadas no se lee, se descifra.

### 3.4 Escala de tamaños de cuerpo

La que ya se usa, por frecuencia: `text-sm` (48) · `text-base` (26) · `text-lg` (10) · `text-xl` (6) · `text-2xl` (18) · `text-3xl` (16) · `text-4xl` (9) · `text-5xl` (12).

**Regla 3.6 — Cuatro escalones de cuerpo y ya:** `text-sm` (14 px) apoyo · `text-base` (16 px) cuerpo por defecto · `text-lg` (18 px) entradilla · `text-xl` (20 px) destacado. Los tamaños arbitrarios `text-[15px]`, `text-[13px]`, `text-[11px]` que hay hoy se resuelven con uno de estos cuatro.

### 3.5 Cifras

`.cifras` → `font-variant-numeric: tabular-nums`.

**Regla 3.7 — Toda columna de números lleva `.cifras`.** Tablas, comparativas, precios, métricas. Sin ella los dígitos bailan de fila a fila.

### 3.6 Texto contorneado

`.outline-text` → `-webkit-text-stroke: 1px rgba(255,255,255,0.4)`, `color: transparent`. Recurso decorativo. **Nunca en texto que haya que leer:** con `text-stroke` y sin relleno el contraste efectivo cae por debajo de 3:1.

---

## 4. Espaciado

### 4.1 Retícula

**Regla 4.1 — Todo cae en la retícula de 8 px.** Los pasos de Tailwind `2 / 3 / 4 / 5 / 6 / 8 / 10 / 12 / 16 / 20 / 24` (8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96 px). Nada de valores sueltos por sección.

### 4.2 Ritmo vertical de sección

Tres pasos, definidos en `index.css`, y no hay un cuarto:

| Clase | `padding-block` | Cuándo |
|---|---|---|
| `.seccion-compacta` | `clamp(3rem, 5vw, 4.5rem)` | Franja de apoyo. Hoy: Hechos. |
| `.seccion` | `clamp(4rem, 8vw, 7rem)` | Por defecto. Hoy: Servicios, Sectores, Mecanismo, EjemploAtencion, Comparativa, FAQ, Contacto. |
| `.seccion-amplia` | `clamp(6rem, 12vw, 11rem)` | Momento de respiro deliberado. Hoy: Límites, cierre de Servicios. |

**Regla 4.2 — Ninguna sección escribe su propio `py-`.** Se usa una de las tres clases. El problema que estas clases resolvieron era exactamente ese: ocho de diez secciones con `py-16 md:py-28` idéntico, sin ritmo. **Excepción viva:** el Hero usa `pt-32 md:pt-44 pb-16 md:pb-24` porque tiene que descontar la barra de navegación fija. Es la única.

**Regla 4.3 — La línea no separa; la superficie sí.** `border-t border-white/5` acompaña a un cambio de superficie, no lo sustituye. Una línea al 5 % entre dos secciones del mismo negro no separa nada.

### 4.3 Márgenes laterales

`px-5` en móvil, `px-6` o `px-8` a partir de `md`. Contenedores: `max-w-6xl` (portada), `max-w-3xl` (formulario y lectura), `max-w-xl` (párrafo suelto).

**Regla 4.4 — `px-5` es el mínimo lateral en móvil.** 20 px. Ningún bloque llega al borde de la pantalla.

---

## 5. Radios

| Valor | Usos | Para qué |
|---|---|---|
| `rounded-full` | 43 | **Todos los botones y píldoras.** Es la firma de la marca. |
| `rounded-2xl` (16 px) | 16 | Tarjetas y campos de formulario. |
| `rounded-3xl` (24 px) | 10 | Contenedores grandes, paneles. |
| `rounded-xl` (12 px) | 3 | Campos de formulario en Contacto. |
| `--radius-custom: 3rem` | 0 | Declarado en `@theme`, sin uso. |

**Regla 5.1 — Los botones son `rounded-full`, sin excepción.** Un botón con esquina cuadrada en este sitio está mal.

**Regla 5.2 — Tres radios de contenedor:** `rounded-xl` (campo), `rounded-2xl` (tarjeta), `rounded-3xl` (panel). Los sueltos que existen hoy —`rounded-[2.5rem]`, `rounded-[3.5rem]`— son deuda; no se añaden más.

---

## 6. Sombras

Este es un sitio sobre negro: la sombra apenas se ve y su papel real es **separar, no dar volumen**.

| Uso | Valor |
|---|---|
| `.glass` | `0 4px 24px -1px rgba(0, 0, 0, 0.6)` |
| `.glass-card:hover` | `0 20px 40px -10px rgba(0, 0, 0, 0.5)` |
| Botón del chatbot | `0 8px 32px rgba(0, 0, 0, 0.8)` |
| Tailwind `shadow-2xl` | En el formulario y en el botón de envío |

**Regla 6.1 — La sombra es negra, nunca coloreada, nunca blanca.** Un `box-shadow` con blanco sobre negro es un halo, y ese efecto está reservado a `.hero-glow` y `.hero-logo-container::before`.

**Regla 6.2 — Sombra solo en lo que flota:** barra de navegación, panel del chatbot, tarjeta en hover, formulario. Una sección no proyecta sombra.

### 6.1 Resplandores

- `.hero-glow` — `radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)`, `blur(60px)`, `z-index: -1`, `pointer-events: none`.
- `.hero-logo-container::before` — halo radial al 10 %, 120 % × 120 %.

Están reservados al primer viewport. **No se replican por sección:** un resplandor en cada bloque deja de significar "aquí empieza".

---

## 7. Movimiento

### 7.1 El criterio, antes que los valores

**Regla 7.1 — Si no comunica nada, no se anima.** Antes de animar algo hay que poder responder qué le dice al usuario. Las respuestas válidas en este sitio son cuatro: *ha llegado algo nuevo* (entrada), *he registrado tu pulsación* (press), *esto responde al puntero* (hover), *esto está vivo y te espera* (bucle, y solo en el botón del chatbot).

**Regla 7.2 — `prefers-reduced-motion: reduce` se respeta siempre, y no con el truco de las duraciones a 0.01 s.** Ese truco no elimina el parpadeo, solo lo acorta. Lo que hace este sitio y hay que seguir haciendo:

- `.entrada` → `animation: none`.
- `.animate-float` → `animation: none` (el bucle decorativo es el que peor sienta: no termina nunca).
- `.accion` → `transition-duration: 1ms`.
- El pie: `Footer.jsx` comprueba `prefiereMenosMovimiento()` (`src/utils/movimiento.js`) y sale antes de crear el timeline de GSAP.

**Regla 7.3 — Si una animación es lo único que devuelve la opacidad a 1, hay que devolverla también en `reduced-motion`.** `index.css` ya lo hace: `.js .footer-content > *` está a `opacity: 0`, y la media query lo sube a `1`. Sin esa regla, quien pide menos movimiento se queda con el pie en blanco: exactamente lo contrario de lo que pidió. **Toda animación de entrada nueva que esconda contenido tiene que traer su contrapartida en la media query.**

**Regla 7.4 — Contenido crítico y prerenderizado no se anima con JavaScript.** El primer viewport entra por CSS (`.entrada`), no por GSAP: la hoja de estilos llega antes del primer pintado, así que no hay flash, el LCP (Largest Contentful Paint, el momento en que se pinta el elemento más grande) no espera al JS, y los rastreadores de motores generativos ven lo mismo con y sin JavaScript. GSAP queda para lo que está por debajo del pliegue.

### 7.2 Duraciones y curvas

| Gesto | Duración | Curva | Dónde |
|---|---|---|---|
| Press / estado de acción | **140 ms** | `ease-out` | `.accion` |
| Hover de tarjeta | **500 ms** | `cubic-bezier(0.16, 1, 0.3, 1)` | `.glass-card` |
| Entrada del primer viewport | **700 ms** | `cubic-bezier(0.16, 1, 0.3, 1)` | `.entrada`, con `0.12 s` de retardo en el segundo hijo |
| Panel del chatbot | **380 ms** | `cubic-bezier(0.16, 1, 0.3, 1)` | `.chatbot-panel` |
| Fondo del chatbot | **300 ms** | `ease` | `.chatbot-backdrop` |
| Entrada del pie (GSAP) | **1.2 s**, `stagger 0.1` | `power3.out` | `Footer.jsx`, `ScrollTrigger` a `top 90%`, `once: true` |
| Flotación decorativa | **6 s**, en bucle | `ease-in-out` | `.animate-float` |
| Pulso del botón de chat | **2.5 s**, en bucle | `cubic-bezier(0.16, 1, 0.3, 1)` | `.chatbot-btn-idle::after` |

**Regla 7.5 — La curva del sitio es `cubic-bezier(0.16, 1, 0.3, 1)`.** Arranca rápido y frena largo. Se usa en todo lo que entra o cambia de estado por encima de 200 ms. `power3.out` de GSAP es su equivalente y es la única `ease` de GSAP que se usa.

**Regla 7.6 — Cuatro duraciones y nada entre medias:** `140 ms` (press), `300 ms` (aparecer y desaparecer), `500 ms` (hover de superficie), `700 ms` (entrada). Los `duration-300`, `duration-500` y `duration-700` de Tailwind que hay hoy encajan. `duration-700` en un hover no encaja: eso es una entrada, no una respuesta.

### 7.3 Estados obligatorios

`.accion` es el contrato de todo elemento pulsable:

```css
.accion { transition: background-color 140ms ease-out, color 140ms ease-out,
                      border-color 140ms ease-out, transform 140ms ease-out; }
.accion:active { transform: translateY(1px); }
.accion:disabled, .accion[aria-disabled='true'] {
  opacity: 0.4; cursor: not-allowed; transform: none; }
@media (prefers-reduced-motion: reduce) { .accion { transition-duration: 1ms; } }
```

**Regla 7.7 — Todo botón y todo enlace de acción lleva `.accion`.** Los cuatro estados tienen que existir y distinguirse: reposo, hover, `:active`, `:disabled`. El listón no está en el reposo, está en que todo estado exista.

**Regla 7.8 — El press es `translateY(1px)`, no un escalado.** `active:scale-95` encoge el botón un 5 %: se lee como un juguete, no como un control. **Estado actual:** el botón de envío del formulario, el del chatbot, el de 404 y los de las páginas de sector usan `hover:scale-[1.02] active:scale-95 transition-all`. Incumplen.

**Regla 7.9 — Nunca `transition-all`.** Se enumeran las propiedades. `transition-all` sobre un botón con `shadow-2xl` anima también la sombra, que es la propiedad más cara de componer, y en el botón más importante de la página. Hoy hay 39 usos de `transition-all`.

### 7.4 Efectos con nombre propio

- `.glitch-logo` — `filter: contrast(1.5) brightness(1.2)`; en hover, `@keyframes glitch` a `0.3 s` en bucle con desplazamientos de ±2 px, más `drop-shadow(0 0 20px rgba(255,255,255,0.4))`. Solo el logo del Hero.
- `.magnetic-btn` — `transition: transform 0.3s cubic-bezier(0.23, 1, 0.32, 1)`.
- `.char` — `display: inline-block`, para animar letra a letra.

**Regla 7.10 — El glitch es del logo.** Es un guiño de marca. Aplicado a texto o a tarjetas deja de ser guiño y es ruido.

---

## 8. Superficies del navegador y accesibilidad

Ya están definidas y **no se sobrescriben por componente**:

```css
::selection      { background: var(--inversion); color: var(--superficie-0); }
:focus-visible   { outline: 2px solid var(--inversion); outline-offset: 3px; border-radius: 2px; }
input, textarea  { caret-color: var(--inversion); }
input, textarea, select { accent-color: var(--inversion); }
::-webkit-scrollbar { width: 6px; }  /* track --superficie-0, thumb #333, hover #555 */
html { scrollbar-color: #333 var(--superficie-0); scrollbar-width: thin; }
html { scroll-behavior: smooth; }
```

**Regla 8.1 — `focus:outline-none` está prohibido sin un anillo de sustitución igual de visible.** Sin foco no se puede navegar con teclado. **Estado actual:** los campos del formulario de contacto (`Contact.jsx`, constante `inp`) llevan `focus:outline-none` y lo único que dejan a cambio es un borde que pasa de `white/10` a `white/30`: 1 px, sobre negro, con un delta de contraste mínimo. Incumple.

**Regla 8.2 — Objetivo táctil mínimo 44 px; en este sitio, 52 px.** Los campos usan `min-h-[52px]`, los botones `min-h-[56px]` y `min-h-[60px]`. Ese es el listón.

---

## 9. Botones

### 9.1 Primario (acción de conversión)

```
accion  rounded-full  bg-white  text-black  font-black  uppercase
px-9 py-4  text-xs md:text-sm  tracking-[0.2em]  min-h-[56px]
hover:bg-white/85
```

Es el del Hero. Es la referencia.

**Regla 9.1 — Un solo primario por viewport.** Blanco sólido sobre negro es el máximo contraste que tiene el sitio: si hay dos, no hay ninguno.

**Estado actual:** hay al menos seis variantes del primario conviviendo — `px-8 py-3` / `px-8 py-4` / `px-9 py-4` / `px-10 py-4` / `px-10 py-5` / `w-full py-5`, con `tracking` entre `0.2em` y `0.4em` y tamaño entre `text-[10px]` y `text-sm`. Tres de ellas están por debajo del suelo de 11 px.

**Regla 9.2 — Dos tamaños de primario y punto:**
- **Estándar** — `px-9 py-4`, `text-xs md:text-sm`, `tracking-[0.2em]`, `min-h-[56px]`.
- **Ancho completo** (formularios) — `w-full py-5`, `text-xs`, `tracking-[0.25em]`, `min-h-[60px]`.

Ambos: `accion rounded-full bg-white text-black font-black uppercase hover:bg-white/85`.

### 9.2 Secundario

`.glass-light` o borde `white/10` sobre fondo transparente, `rounded-full`, texto `white/60` → `white` en hover, `.accion`.

### 9.3 Terciario

Enlace de texto, `white/60` → `white`, `transition-colors 140ms`, subrayado en hover. `.accion`.

---

## 10. Los diez fallos que hoy incumplen este documento

Lista de deuda medida, en orden de daño. No es el plan de trabajo; es lo que la puerta va a mirar.

| # | Incumple | Dónde | Medida |
|---|---|---|---|
| 1 | Regla 3.4 (suelo 11 px) | Formulario, chatbot, páginas de sector | 74 usos por debajo: 38 × 10 px, 27 × 9 px, 9 × 8 px |
| 2 | Regla 8.1 (foco) | `Contact.jsx`, constante `inp` | `focus:outline-none` sin anillo de sustitución |
| 3 | Regla 7.9 (`transition-all`) | Todo el sitio | 39 usos |
| 4 | Regla 7.8 (press) | Botón de envío, chatbot, 404, sector | `active:scale-95` |
| 5 | Regla 9.2 (tamaños de primario) | 17 botones primarios | 6 variantes distintas |
| 6 | Regla 3.3 (un registro de titular) | Hero frente a `.heading-lg` | `tracking-tighter` y `0.1em` conviviendo |
| 7 | Regla 3.1 (fuentes sin papel) | `index.css` | Astera, Venus Rising y Square Game cargadas y sin usar |
| 8 | Regla 5.2 (radios) | Páginas de sector | `rounded-[2.5rem]`, `rounded-[3.5rem]` |
| 9 | Duplicado literal | `index.css` | `.animate-float` declarada dos veces seguidas |
| 10 | Token muerto | `@theme` | `--radius-custom: 3rem` sin uso; `--inversion` sin sección que invierta |

---

## 11. Checklist de la puerta

Lo que se comprueba en todo cambio visible antes del despliegue. Un `no` es una devolución, y la devolución lleva siempre la regla citada y el arreglo exacto.

1. ¿Todo el texto está en 11 px o más? (3.4)
2. ¿El texto que hay que leer está en `white/50` o más claro? ¿El tranquilizador en `white/70`? (2.3)
3. ¿Los botones son `rounded-full` y llevan `.accion`? (5.1, 7.7)
4. ¿Existen y se distinguen los cuatro estados: reposo, hover, `:active`, `:disabled`? (7.7)
5. ¿Hay un solo botón primario en el viewport? (9.1)
6. ¿Se ve el anillo de foco al navegar con `Tab`? (8.1)
7. ¿Los objetivos táctiles llegan a 52 px? (8.2)
8. ¿Los paddings de sección son `.seccion`, `.seccion-compacta` o `.seccion-amplia`? (4.2)
9. ¿Cambia la superficie respecto a la sección anterior? (2.2)
10. ¿Todo el espaciado cae en la retícula de 8 px? (4.1)
11. ¿Las duraciones son 140 / 300 / 500 / 700 ms y la curva `cubic-bezier(0.16, 1, 0.3, 1)`? (7.5, 7.6)
12. ¿Se enumeran las propiedades de la transición, sin `transition-all`? (7.9)
13. ¿Cada animación responde a qué le comunica al usuario? (7.1)
14. Con `prefers-reduced-motion: reduce` activo: ¿se ve todo el contenido y se para todo bucle? (7.2, 7.3)
15. ¿Se ve igual con JavaScript desactivado por encima del pliegue? (7.4)
16. ¿Ningún color nuevo fuera del monocromo? (1.1)

---

_Extraído del código en producción el 2026-09-13 por `design` (Pam). Pendiente de la corrección del humano; su versión sustituye a esta._
