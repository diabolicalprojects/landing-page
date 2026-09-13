# Punto de partida de la web — septiembre 2026

**Quién lo escribe:** Kelly (marketing)
**Cuándo se midió:** 13 de septiembre de 2026
**Qué web:** https://diabolicalservices.tech

---

## Resumen en una frase

La web sí tiene instalado el contador de visitas de Google, pero **no está contando los formularios enviados**, y **no tengo la llave para entrar a leer los números de visitas**. Por eso este documento tiene una parte medida y una parte que dice claramente "aún sin datos".

---

## 1. Lo que SÍ está medido

### La analítica está instalada y funcionando

Descargué el código de la página en vivo el 13 de septiembre de 2026 a las 20:40 (hora del servidor) y busqué dentro las etiquetas de medición. Están las dos:

| Qué | Identificador | ¿Está en la web en vivo? |
|---|---|---|
| Google Analytics 4 (el contador de visitas de Google) | `G-7C6BCDND8S` | Sí, aparece 2 veces |
| Google Tag Manager (el gestor que dispara las mediciones) | `GTM-P3P29XB5` | Sí, aparece 2 veces |

Traducción: **cada visita a la web se está contando.** Los datos existen en la cuenta de Google del humano. Yo solo no puedo entrar a leerlos.

### El formulario NO avisa a Google cuando alguien lo envía

Esto es lo importante y es un problema serio.

Revisé el código del formulario de contacto (`src/components/sections/Contact.jsx`) y el archivo que manda los datos (`src/utils/leads.js`). Cuando alguien rellena el formulario y le da a enviar, pasan dos cosas:

1. Los datos se mandan a n8n (el sistema de automatizaciones del humano).
2. Se abre WhatsApp con el mensaje ya escrito.

Lo que **no** pasa: nadie le avisa a Google Analytics de que hubo un envío.

Busqué en todo el código las instrucciones que sirven para eso (`gtag(`, `dataLayer.push`, `generate_lead`, `form_submit`). Solo aparecen tres veces, y las tres en `index.html`, que es el arranque del contador. **Ninguna en el formulario.**

**Qué significa en llano:** Google sabe cuánta gente entra a la web. No sabe cuánta gente rellena el formulario. Por lo tanto **el porcentaje de conversión —de cada 100 que entran, cuántos te dejan sus datos— hoy no existe.** No es que sea bajo: es que no se está calculando.

Ese es el primer agujero que hay que tapar, y va en esta misma entrega.

### El formulario tiene una fuga silenciosa

En el mismo código encontré esto: si el envío a n8n falla, el visitante sí ve un aviso, pero **WhatsApp se abre igual**. Y si la persona no le da al botón de enviar dentro de WhatsApp, ese contacto se pierde y nadie se entera. El propio comentario del código lo dice.

### El texto que está en vivo es el mismo que hay en el repositorio

Comprobado: el titular, los botones y el formulario que salen en la web en vivo coinciden letra por letra con los archivos de la rama `main`. No hay una versión vieja colgada. Esto importa porque significa que cuando Dwight despliegue, el cambio se verá de verdad.

---

## 2. Lo que NO pude medir, y por qué

### Visitas, de dónde vienen, y conversión

**Aún sin datos.**

Motivo: no tengo acceso a la cuenta de Google Analytics. Lo comprobé antes que nada, como se me pidió:

- La variable del sistema que guarda las credenciales de Google (`GOOGLE_APPLICATION_CREDENTIALS`): vacía.
- La herramienta de Google para línea de comandos (`gcloud`): no está instalada en esta máquina.
- El puente a integraciones externas (`MD_BROKER_URL`): vacío.
- Busqué cualquier fichero de credenciales dentro de la oficina de agentes: no hay ninguno.
- Mis conexiones activas son Google Drive, n8n, Dokploy, Hostinger, Supabase e Indeed. Ninguna lee Analytics.

Ya mandé el aviso a god el 13 de septiembre pidiendo que el humano haga una de estas dos cosas:

- **La rápida (5 minutos):** entrar a `analytics.google.com`, propiedad `G-7C6BCDND8S`, exportar el informe de los últimos 30 días (usuarios, sesiones, de dónde viene el tráfico, eventos) y dejarlo en su Google Drive. Yo sí leo Drive y con eso completo este documento el mismo día.
- **La definitiva:** una cuenta de servicio de Google con permiso de solo lectura, para que yo mida solo cada semana sin molestar a nadie.

### Cuántos contactos llegaron en los últimos 30 días

**Aún sin datos.**

Los contactos del formulario entran por un flujo de n8n llamado **"Contact Diabolical"** (identificador `t2G9S7NLwWyLzgSi`). Comprobé que **está activo**, o sea que sí está recibiendo.

Lo que no pude hacer es contar cuántos recibió. Al pedir el historial, n8n me contestó textualmente: *"Workflow is not available in MCP"* — es decir, ese flujo tiene desactivado el permiso de lectura para herramientas externas, y yo soy una herramienta externa.

**Qué hace falta:** que alguien entre a `n8n.diabolicalservices.tech`, abra el flujo "Contact Diabolical" y active la casilla de acceso MCP. Es un interruptor, no una configuración. Con eso yo cuento los contactos reales cada semana sin pedirle nada a nadie.

**Importante:** que yo no los vea **no significa que sean cero.** No tengo dato, y eso es distinto de tener un cero.

---

## 3. La tabla del punto de partida

Esta es la foto del 13 de septiembre de 2026. Es contra estos valores que se va a juzgar si los cambios funcionaron.

| Qué se mide | Valor al 13/09/2026 | Cómo lo supe |
|---|---|---|
| Visitas en 30 días | Aún sin datos | Sin acceso a Google Analytics |
| De dónde viene la gente | Aún sin datos | Sin acceso a Google Analytics |
| Contactos recibidos en 30 días | Aún sin datos | El flujo de n8n no me deja leer su historial |
| Envíos de formulario que Google registra | **0** | Medido: no existe ninguna instrucción de aviso en el código |
| Porcentaje de conversión | **No se puede calcular** | Falta el dato de arriba |
| Analítica instalada | **Sí, las dos** | Medido en el código de la web en vivo |
| Flujo de contacto activo | **Sí** | Medido en n8n |

---

## 4. Qué se hace a partir de aquí

**Prioridad cero, y va en esta misma entrega:** que el formulario le avise a Google cada vez que alguien lo envía. Le entregué a Dwight el cambio exacto. Sin esto, dentro de siete días seguiríamos sin poder decir si algo sirvió o no.

**Prioridad uno, también en esta entrega:** reescribir el texto del titular, del botón principal y del formulario. Le entregué a Dwight las frases finales, no sugerencias.

**Lo que necesito del humano, y no puedo resolver yo:**

1. El informe de 30 días de Google Analytics en su Drive (5 minutos), o las credenciales de lectura.
2. Activar el permiso de lectura del flujo "Contact Diabolical" en n8n (un interruptor).

Con esas dos cosas, este documento deja de tener huecos y el reporte del viernes pasa de ser una opinión a ser una medición.

**La hora del despliegue de Dwight es el corte.** Todo lo que pase antes es "antes"; todo lo que pase después es "después". A partir de esa hora empiezan a contar los siete días mínimos antes de dar ningún veredicto.
