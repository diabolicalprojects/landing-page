# Baseline de citas en IA y de visibilidad en buscadores — Diabolical Services

**Fecha de medición:** 2026-09-13
**Medido por:** `seo` (Andy)
**Sitio medido:** https://diabolicalservices.tech
**Estado del sitio en el momento de medir:** rama `fix/coherencia-oferta-sin-marketing-publicidad-branding`, último commit desplegado `1e5ab38`

Este documento es el punto cero. Todo lo que se haga después se compara contra estos números.

---

## 0. Qué pude medir y qué no. Léelo antes que nada.

Esto importa porque el encargo pedía lanzar las preguntas dentro de ChatGPT, Perplexity y Gemini, y **eso no lo hice**. Lo digo explícito en vez de disimularlo:

**No hecho:** no tengo cuenta ni clave de API de ChatGPT, Perplexity ni Gemini en este entorno. Lo comprobé: no hay ninguna variable de entorno con credenciales de esos servicios, y sus interfaces web no se pueden leer sin sesión. Escribir "pregunté a ChatGPT y no salió Diabolical" sin haberlo preguntado sería inventarlo.

**Sí hecho, y es lo que sostiene este baseline:** medí las tres cosas de las que depende que un modelo te cite, en este orden:

1. **¿Los rastreadores de IA pueden leer el sitio?** — comprobado uno por uno con su identificador real.
2. **¿El sitio está en los índices de búsqueda de los que esos modelos sacan las fuentes?** — comprobado en Bing, DuckDuckGo y en un índice web de terceros.
3. **¿Quién sale hoy cuando se hacen las 10 preguntas de un cliente real?** — 10 búsquedas web lanzadas hoy, con los resultados apuntados.

La tercera es un sustituto, no la cosa misma, y lo marco como sustituto. Pero el resultado de la segunda hace que la distinción importe poco hoy, y explico por qué en el apartado 3.

**Para cerrar el hueco de verdad hace falta una decisión del humano:** una cuenta de ChatGPT Plus, una de Perplexity Pro y acceso a Gemini, o bien una clave de API de cualquiera de los tres. Con eso puedo lanzar las 10 preguntas literalmente y convertir este baseline en el que se pidió. Sin eso, este es el mejor baseline honesto que existe.

---

## 1. El hallazgo que manda sobre todos los demás

**Diabolical Services no está en ningún índice de búsqueda. Cero páginas.**

Con eso, la probabilidad de que ChatGPT, Perplexity, Copilot o los resúmenes con IA de Google citen a Diabolical hoy es cero, y no por culpa del sitio: el sitio está bien hecho. Es que ningún buscador lo ha metido en su lista todavía, y esos modelos no inventan fuentes, las sacan de esa lista.

Evidencia, medida hoy:

| Comprobación | Comando / herramienta | Resultado |
|---|---|---|
| Bing, páginas indexadas | `site:diabolicalservices.tech` en bing.com | **"No se encontraron resultados"** — 0 páginas |
| Bing, marca entrecomillada | `"diabolicalservices.tech"` en bing.com | 0 resultados |
| Índice web de terceros (EE.UU.) | búsqueda `diabolicalservices.tech` | 0 resultados. Devuelve empresas ajenas con nombre parecido (Diabolical Inc., Diabol) |
| Índice web de terceros | `"Diabolical Services" Aguascalientes automatización IA` | 0 resultados. Respuesta textual: *"I did not find any specific company or service called 'Diabolical Services' operating in Aguascalientes"* |
| DuckDuckGo | `site:diabolicalservices.tech` | 1 resultado: la portada. Es el único rastro del sitio en un índice público |
| Google | `site:diabolicalservices.tech` | **No verificado.** Google devuelve los resultados ofuscados en JavaScript y no se pueden leer con `curl`. Lo digo en vez de suponerlo |

Por qué Bing es el que más duele: el buscador que usa ChatGPT por dentro se apoya en el índice de Bing, y Copilot es Bing directamente. Cero en Bing es cero en ChatGPT con búsqueda activada.

**Causa localizada, y es de configuración, no de código:**

| Qué falta | Comprobado hoy |
|---|---|
| Etiqueta de verificación de Google Search Console | Ninguna en el `<head>` de la portada |
| Verificación de Bing Webmaster Tools (`msvalidate.01` o `/BingSiteAuth.xml`) | Ninguna. `/BingSiteAuth.xml` → 404 |
| IndexNow (avisar a Bing al instante de cada URL nueva) | No implementado. Ningún fichero de clave en la raíz → 404 |
| Sitemap enviado a Google o a Bing | Sin cuenta que lo reciba, no hay envío posible |

El `sitemap.xml` existe, está bien formado y lista las 10 URLs. Está declarado en `robots.txt`. Pero un sitemap que nadie ha enviado a ninguna cuenta es un papel en un cajón.

---

## 2. Lo que sí funciona. No lo toquéis.

Medido hoy contra el sitio en vivo. Esto ya está resuelto y no hay que rehacerlo:

**Los rastreadores de IA entran y leen el contenido completo.** Pedí `/automatizacion-para-clinicas` haciéndome pasar por cada uno de los siete rastreadores que importan. Los siete reciben `HTTP 200` y los mismos 28 045 bytes de HTML ya montado, con el texto real dentro (6 menciones de "WhatsApp" en cada respuesta, misma cuenta que ve una persona):

| Rastreador | Quién lo usa | Resultado |
|---|---|---|
| `GPTBot` | Entrenamiento de OpenAI | 200 · 28 045 B · contenido completo |
| `OAI-SearchBot` | Búsqueda de ChatGPT | 200 · 28 045 B · contenido completo |
| `ClaudeBot` | Anthropic | 200 · 28 045 B · contenido completo |
| `PerplexityBot` | Perplexity | 200 · 28 045 B · contenido completo |
| `Google-Extended` | Gemini y resúmenes con IA | 200 · 28 045 B · contenido completo |
| `bingbot` | Bing y ChatGPT con búsqueda | 200 · 28 045 B · contenido completo |
| `Googlebot` | Google | 200 · 28 045 B · contenido completo |

**El resto del inventario técnico, verificado:**

- `robots.txt` (2 133 B): permite explícitamente 19 rastreadores de IA por nombre, bloquea solo `/admin`, `/api/` y `/app-shell.html`, y declara el sitemap. Está bien.
- `llms.txt` (13 144 B) y `llms-full.txt` (26 691 B): existen, se generan de los mismos datos que las páginas y describen los 17 servicios con su límite declarado. Contenido de calidad real, no relleno.
- Datos estructurados por página, todos presentes y con las entidades enlazadas por `@id`:
  - `/` → `ProfessionalService`, `WebSite`, `FAQPage` (10 preguntas)
  - `/servicios` → `CollectionPage` + `ItemList` con 17 `Service`, `BreadcrumbList`
  - `/automatizacion-para-*` → `Service`, `FAQPage`, `BreadcrumbList`, `BusinessAudience`
  - `/blog` → `Blog` con `BlogPosting`, `BreadcrumbList`
  - `/blog/*` → `BlogPosting`, `FAQPage`, `BreadcrumbList`, `WebPage`
- Cada ruta tiene su `<title>`, su descripción y su `canonical` propios. No hay duplicados.
- HTTP redirige a HTTPS con 301. Una URL inexistente devuelve 404 de verdad, no un 200 en falso.
- Compresión Brotli activa. Los assets con hash llevan `Cache-Control: public, max-age=31536000, immutable`.

**Velocidad de servidor, medida con 3 muestras por página:**

| Ruta | Tiempo hasta el primer byte | HTML servido (Brotli) |
|---|---|---|
| `/` | 219–456 ms | 13 885 B |
| `/servicios` | 176–186 ms | 9 131 B |
| `/automatizacion-para-clinicas` | 167–176 ms | 6 995 B |
| `/blog` | 168–186 ms | 5 176 B |
| `/blog/como-aparecer-en-chatgpt` | 192–198 ms | 8 908 B |

El servidor no es el cuello de botella. Lo único pesado del lado del navegador es un único paquete de JavaScript de **134 935 B comprimidos**, sin trocear. Es `type="module"`, así que no bloquea el pintado, pero sí retrasa la interactividad en móvil.

**No medido:** Lighthouse y las Core Web Vitals de campo. La API pública de PageSpeed Insights devolvió `429 Quota exceeded` en los dos intentos (móvil y escritorio) desde esta IP. Queda pendiente y lo digo en vez de rellenarlo a ojo.

---

## 3. Las 10 preguntas. Resultado: 0 de 10.

Diez preguntas que haría un cliente real de Diabolical, lanzadas hoy 2026-09-13 contra un índice web.

**Cómo leerlo:** esto mide quién ocupa hoy el espacio de respuesta de esas preguntas. Es la lista de la que un modelo con búsqueda saca sus fuentes. No es la respuesta literal de ChatGPT.

| # | Pregunta | ¿Sale Diabolical? | Puesto | Quién ocupa el espacio |
|---|---|---|---|---|
| 1 | agencia de automatización con inteligencia artificial en Aguascalientes | **No** | — | ISA Solutions (única con página propia de Aguascalientes), Adivor, NOVAI, Automaxia |
| 2 | quién automatiza WhatsApp para clínicas y consultorios en México | **No** | — | Neural IA, Luna Salud, ProntIA, HealthMate, Dentiqa |
| 3 | agencia de marketing digital con IA Aguascalientes chatbot WhatsApp | **No** | — | **INÉDITO DIGITAL** (inedito.digital, el competidor local directo), Edit Innovation, Marketboost |
| 4 | cuánto cuesta automatizar la atención al cliente con IA en México | **No** | — | Duotach, Kosmo IA, Jordan Memije, Gabriel Neuman, Aize |
| 5 | automatización con IA para spas y gimnasios en México, quién lo instala | **No** | — | Amyra, Trainingym, Poliwin, Recaudo, Mindbody |
| 6 | cómo hacer que ChatGPT recomiende mi negocio local | **No** | — | GMBapi, Rodanet, NireWeb, Pixel Factory, David Ayala |
| 7 | agentes de IA para despachos contables y jurídicos en México | **No** | — | Alegra, AgenteLat, InfraEstate AI, AIJusticia, PwC México |
| 8 | mejores agencias de inteligencia artificial en Aguascalientes 2026 | **No** | — | Marketeros LATAM, Magokoro, Varela Insights, Sortlist, Linkatomic |
| 9 | chatbot para agendar citas en spa por WhatsApp en México, tiempo de implementación | **No** | — | Aunoa, Kosmo IA, Potenzzia, Hailan, SyncManager |
| 10 | "Diabolical Services" Aguascalientes automatización IA *(búsqueda de marca exacta)* | **No** | — | Directorios locales: infoisinfo, Cylex, guiaempresas, empresas10 |

**Frase con la que describen a Diabolical: ninguna. No aparece en ninguna de las diez.**

La número 10 es la que más dice. Es una búsqueda del nombre exacto entre comillas: la más fácil que existe. Devuelve cero. **La marca no existe para ningún índice.**

### Tres cosas que sacar de estas diez búsquedas

**A. El hueco local está vacío de verdad.** En la pregunta 8, el propio índice contesta: *"no hay información específica sobre agencias de inteligencia artificial ubicadas en Aguascalientes"*. Nadie ha ocupado "agencia de IA en Aguascalientes". ISA Solutions e INÉDITO DIGITAL son los únicos con presencia local y ninguno de los dos domina. Es un hueco abierto, no una plaza tomada.

**B. Las preguntas de "quién es el mejor X en Y" se contestan con listas de terceros, no con la web del proveedor.** Preguntas 8, 5, 7 y 2: lo que sale son artículos tipo "Top 10 agencias de IA en México 2026" de Marketeros LATAM, Magokoro, Varela Insights, Sortlist, Linkatomic. Ningún modelo va a citar diabolicalservices.tech para "la mejor agencia de X" mientras no aparezca en esas listas. Estar en el índice es necesario; estar en las listas es lo que convierte índice en cita.

**C. La pregunta de precio es la más buscada de todo el sector y Diabolical se retira de ella a propósito.** En la pregunta 4 todos los que ganan publican rangos concretos: 60 000–300 000 MXN de arranque, planes desde 4 497 MXN al mes, 197 USD al mes. Las preguntas frecuentes de la portada dicen hoy, literalmente, que publicar una tarifa "sería inventarla". Es una postura defendible y no me toca cambiarla, pero tiene un precio medido: cede la consulta comercial de mayor volumen del sector. Se lo paso a Kelly en el apartado 5.

---

## 4. Los números contra los que se mide todo lo que venga después

Congelados a fecha 2026-09-13. Sin adornos.

| Métrica | Valor hoy | Cómo se vuelve a medir |
|---|---|---|
| Páginas indexadas en Bing | **0** | `site:diabolicalservices.tech` en bing.com |
| Páginas indexadas en Google | **sin verificar** | Search Console, cuando exista la cuenta |
| Páginas indexadas en DuckDuckGo | **1** (la portada) | `site:` en duckduckgo.com |
| Preguntas de cliente donde sale Diabolical | **0 de 10** | repetir las 10 de la tabla del apartado 3 |
| Citas en ChatGPT / Perplexity / Gemini | **no medido** — sin acceso a esas cuentas | pendiente de que el humano dé acceso |
| Menciones de la marca en el índice | **0** | `"Diabolical Services"` entre comillas |
| Rastreadores de IA con acceso al contenido | **7 de 7** | `curl` con el identificador de cada uno |
| Listas y directorios del sector donde aparece | **0** | revisar las 5 listas del apartado 3-B |
| Tiempo hasta el primer byte, portada | **219–456 ms** | 3 muestras con `curl` |
| Peso del paquete de JavaScript | **134 935 B** comprimidos | `curl` sobre `/assets/index-*.js` |
| Puntuación Lighthouse | **no obtenida** — cuota de la API agotada | reintentar PageSpeed Insights |

---

## 5. Lo que se hizo hoy con esto

- **A Dwight (`dev`), ticket `seo-01`:** cinco cambios de código escritos enteros, listos para pegar, con el archivo y la línea. Van en la release integrada. Detalle en el mensaje del ticket.
- **A `god`, decisión pendiente del humano:** dar de alta Google Search Console y Bing Webmaster Tools, y enviar el sitemap. Sin eso, nada de lo demás se indexa, y ninguna mejora de este documento se puede medir. Es la acción de mayor impacto de toda la lista y no la puedo hacer yo: requiere una cuenta.
- **A `god`, segunda decisión:** acceso a ChatGPT, Perplexity o Gemini para convertir este baseline en el que se pidió.
- **A Kelly (`marketing`), oportunidad de contenido, no orden:** la consulta de precio (pregunta 4) es la de mayor volumen del sector y hoy está cedida. Un artículo que explique el método de cálculo y publique rangos, sin comprometer tarifa cerrada, entra en esa conversación sin romper la regla de no inventar cifras. La prioridad la decide ella.

---

## 6. Lo que no logré, en una lista

Para que no haya que buscarlo entre el texto:

1. **No lancé las preguntas dentro de ChatGPT, Perplexity ni Gemini.** No hay credenciales de esos servicios en este entorno. Usé búsqueda web como sustituto y lo marqué como sustituto en todas partes.
2. **No verifiqué el índice de Google.** Google devuelve sus resultados ofuscados en JavaScript y no se leen con las herramientas que tengo. Bing, DuckDuckGo y un tercer índice sí los verifiqué.
3. **No obtuve puntuación de Lighthouse ni Core Web Vitals de campo.** La API de PageSpeed Insights respondió `429 Quota exceeded` en los dos intentos. Medí lo que sí pude: tiempo de respuesta del servidor y peso real de los archivos.
4. **La búsqueda web que usé tiene sesgo de Estados Unidos.** Devuelve resultados en español y de México, pero no es idéntica a lo que ve alguien buscando desde Aguascalientes. Los resultados de marca (0 en las 10) son tan rotundos que el sesgo no cambia la conclusión, pero hay que saberlo.
