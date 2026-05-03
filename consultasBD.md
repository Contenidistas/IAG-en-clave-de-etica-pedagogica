# Consultas BD - Cloudflare D1

Guia rapida para acceder a la base de datos D1 de la app, revisar registros y limpiar datos de prueba.

## Datos del proyecto

- Worker/API: `https://iag-etica-api.suscripcionessh.workers.dev`
- Base D1: `iag-etica-db`
- Binding del Worker: `DB`
- Archivo de esquema: `database/schema.sql`

## 1. Requisitos

Desde la carpeta del proyecto:

```powershell
cd C:\Users\santi\Desktop\AppIAG-beta3.2
```

Verificar Wrangler:

```powershell
npx wrangler --version
```

Si no estas autenticado en Cloudflare:

```powershell
npx wrangler login
```

## 2. Probar que la API responde

Estadisticas generales:

```powershell
Invoke-RestMethod -Uri "https://iag-etica-api.suscripcionessh.workers.dev/stats" | ConvertTo-Json -Depth 10
```

Opiniones publicas:

```powershell
Invoke-RestMethod -Uri "https://iag-etica-api.suscripcionessh.workers.dev/opinions" | ConvertTo-Json -Depth 10
```

## 3. Consultas generales

Ver ultimos eventos guardados:

```powershell
npx wrangler d1 execute iag-etica-db --remote --command "SELECT id, timestamp, event_type, session_id, profile, profile_key, country, nivel_educativo, evidence, likert_level FROM events ORDER BY timestamp DESC LIMIT 50"
```

Contar eventos por tipo:

```powershell
npx wrangler d1 execute iag-etica-db --remote --command "SELECT event_type, COUNT(*) AS total FROM events GROUP BY event_type ORDER BY total DESC"
```

Resumen global:

```powershell
npx wrangler d1 execute iag-etica-db --remote --command "SELECT COUNT(DISTINCT CASE WHEN event_type = 'visit' THEN session_id END) AS visitas_unicas, SUM(CASE WHEN event_type = 'visit' THEN 1 ELSE 0 END) AS vistas, SUM(CASE WHEN event_type = 'completion' THEN 1 ELSE 0 END) AS cuestionarios_completados, SUM(CASE WHEN event_type = 'feedback' THEN 1 ELSE 0 END) AS valoraciones, ROUND(AVG(CASE WHEN event_type = 'completion' THEN evidence END), 2) AS promedio_evidence FROM events"
```

## 4. Cuestionarios completados

Ver ultimos cuestionarios completados:

```powershell
npx wrangler d1 execute iag-etica-db --remote --command "SELECT id, timestamp, user_name, profile, profile_key, country, nivel_educativo, familiaridad_inicial, recursos_similares, evidence, likert_level FROM events WHERE event_type = 'completion' ORDER BY timestamp DESC LIMIT 50"
```

Distribucion por nivel de devolucion:

```powershell
npx wrangler d1 execute iag-etica-db --remote --command "SELECT likert_level, COUNT(*) AS total FROM events WHERE event_type = 'completion' GROUP BY likert_level ORDER BY total DESC"
```

Promedio de puntaje por perfil:

```powershell
npx wrangler d1 execute iag-etica-db --remote --command "SELECT profile_key, COUNT(*) AS total, ROUND(AVG(evidence), 2) AS promedio FROM events WHERE event_type = 'completion' GROUP BY profile_key ORDER BY total DESC"
```

Promedio de puntaje por nivel educativo:

```powershell
npx wrangler d1 execute iag-etica-db --remote --command "SELECT nivel_educativo, COUNT(*) AS total, ROUND(AVG(evidence), 2) AS promedio FROM events WHERE event_type = 'completion' GROUP BY nivel_educativo ORDER BY total DESC"
```

## 5. Respuestas del recorrido

Ver respuestas individuales:

```powershell
npx wrangler d1 execute iag-etica-db --remote --command "SELECT id, event_id, question_id, question, answer, created_at FROM answers ORDER BY created_at DESC LIMIT 100"
```

Ver respuestas de un cuestionario especifico:

Reemplazar `ID_DEL_EVENTO` por el `id` del evento `completion`.

```powershell
npx wrangler d1 execute iag-etica-db --remote --command "SELECT question_id, question, answer FROM answers WHERE event_id = ID_DEL_EVENTO ORDER BY id"
```

Preguntas con mas respuestas negativas:

```powershell
npx wrangler d1 execute iag-etica-db --remote --command "SELECT question, COUNT(*) AS respuestas_no FROM answers WHERE answer = 'No' GROUP BY question ORDER BY respuestas_no DESC LIMIT 20"
```

Porcentaje de si/no por pregunta:

```powershell
npx wrangler d1 execute iag-etica-db --remote --command "SELECT question, answer, COUNT(*) AS total FROM answers GROUP BY question, answer ORDER BY question, answer"
```

## 6. Valoraciones de la herramienta

Ver valoraciones y comentarios:

```powershell
npx wrangler d1 execute iag-etica-db --remote --command "SELECT id, timestamp, rating, suggestion, profile, profile_key, country, nivel_educativo FROM feedback ORDER BY timestamp DESC LIMIT 50"
```

Promedio de valoracion:

```powershell
npx wrangler d1 execute iag-etica-db --remote --command "SELECT COUNT(*) AS total_valoraciones, ROUND(AVG(rating), 2) AS promedio_rating FROM feedback"
```

Distribucion de valoraciones:

```powershell
npx wrangler d1 execute iag-etica-db --remote --command "SELECT rating, COUNT(*) AS total FROM feedback GROUP BY rating ORDER BY rating DESC"
```

Comentarios publicables, valoracion 4 o 5:

```powershell
npx wrangler d1 execute iag-etica-db --remote --command "SELECT rating, suggestion, profile, nivel_educativo, timestamp FROM feedback WHERE rating >= 4 AND suggestion IS NOT NULL AND suggestion != '' ORDER BY timestamp DESC LIMIT 50"
```

## 7. Chequeos de consistencia

Feedback que no deberia tener nivel del recorrido:

```powershell
npx wrangler d1 execute iag-etica-db --remote --command "SELECT COUNT(*) AS feedback_con_likert_incorrecto FROM events WHERE event_type = 'feedback' AND likert_level IS NOT NULL AND likert_level != ''"
```

Eventos completion sin respuestas asociadas:

```powershell
npx wrangler d1 execute iag-etica-db --remote --command "SELECT e.id, e.timestamp, e.profile_key FROM events e LEFT JOIN answers a ON a.event_id = e.id WHERE e.event_type = 'completion' GROUP BY e.id HAVING COUNT(a.id) = 0"
```

Feedback sin fila en tabla feedback:

```powershell
npx wrangler d1 execute iag-etica-db --remote --command "SELECT e.id, e.timestamp FROM events e LEFT JOIN feedback f ON f.event_id = e.id WHERE e.event_type = 'feedback' AND f.id IS NULL"
```

## 8. Resetear datos de prueba

Advertencia: estos comandos eliminan registros. Usarlos solo cuando se quiera limpiar la base de pruebas.

### Opcion A: borrar todos los datos y conservar tablas

```powershell
npx wrangler d1 execute iag-etica-db --remote --command "DELETE FROM answers; DELETE FROM feedback; DELETE FROM events;"
```

Verificar que quedo vacia:

```powershell
npx wrangler d1 execute iag-etica-db --remote --command "SELECT 'events' AS tabla, COUNT(*) AS total FROM events UNION ALL SELECT 'answers', COUNT(*) FROM answers UNION ALL SELECT 'feedback', COUNT(*) FROM feedback"
```

### Opcion B: borrar solo datos de prueba recientes

Ejemplo: borrar registros creados desde una fecha concreta.

Cambiar la fecha `2026-05-02T00:00:00` por la que corresponda.

```powershell
npx wrangler d1 execute iag-etica-db --remote --command "DELETE FROM answers WHERE event_id IN (SELECT id FROM events WHERE timestamp >= '2026-05-02T00:00:00'); DELETE FROM feedback WHERE event_id IN (SELECT id FROM events WHERE timestamp >= '2026-05-02T00:00:00'); DELETE FROM events WHERE timestamp >= '2026-05-02T00:00:00';"
```

## 9. Re-crear tablas si hiciera falta

Si la base esta vacia o se necesita volver a aplicar el esquema:

```powershell
npx wrangler d1 execute iag-etica-db --remote --file=database/schema.sql
```

## 10. Ver logs del Worker en vivo

Util para probar la app y ver si llegan requests o errores:

```powershell
npx wrangler tail iag-etica-api
```

## 11. Acceso desde la consola web de Cloudflare

### 11.0. Panel administrativo local

El repo incluye una interfaz privada:

```txt
admin.html
```

Abrir ese archivo en el navegador e ingresar la contrasena administrativa. Desde ahi se puede:

- ver resumen de uso
- listar recorridos completados
- ver respuestas por recorrido
- listar valoraciones y comentarios
- filtrar por perfil, nivel o texto
- descargar CSV de recorridos, respuestas o valoraciones

La interfaz usa estas rutas protegidas del Worker:

```txt
GET /admin/summary
GET /admin/completions
GET /admin/feedback
GET /admin/answers?eventId=ID_DEL_EVENTO
GET /admin/export.csv?type=completions
GET /admin/export.csv?type=feedback
GET /admin/export.csv?type=answers
GET /admin/export.csv?type=events
```

Todas requieren enviar la clave mediante el header:

```txt
X-Admin-Key
```


///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

Tambien se puede revisar la base sin usar PowerShell, directamente desde el panel de Cloudflare.

### 11.1. Entrar a la base D1

1. Abrir Cloudflare: `https://dash.cloudflare.com`
2. Entrar con la cuenta usada para crear el Worker.
3. En el menu izquierdo, ir a **Workers y Pages**.
4. Buscar la seccion **D1 SQL Database** o usar el buscador superior y escribir `D1`.
5. Entrar a la base:

```txt
iag-etica-db
```

6. Abrir la pestana o seccion de consultas SQL. Segun la interfaz puede aparecer como **Console**, **Query**, **Explorer** o **SQL runner**.
7. Pegar una consulta SQL y ejecutarla.

### 11.2. Consultas utiles para pegar en Cloudflare D1

Ultimos eventos guardados:

```sql
SELECT
  id,
  timestamp,
  event_type,
  session_id,
  profile,
  profile_key,
  country,
  nivel_educativo,
  evidence,
  likert_level
FROM events
ORDER BY timestamp DESC
LIMIT 50;
```

Contar eventos por tipo:

```sql
SELECT
  event_type,
  COUNT(*) AS total
FROM events
GROUP BY event_type
ORDER BY total DESC;
```

Resumen general de uso:

```sql
SELECT
  COUNT(DISTINCT CASE WHEN event_type = 'visit' THEN session_id END) AS visitas_unicas,
  SUM(CASE WHEN event_type = 'visit' THEN 1 ELSE 0 END) AS vistas,
  SUM(CASE WHEN event_type = 'completion' THEN 1 ELSE 0 END) AS cuestionarios_completados,
  SUM(CASE WHEN event_type = 'feedback' THEN 1 ELSE 0 END) AS valoraciones,
  ROUND(AVG(CASE WHEN event_type = 'completion' THEN evidence END), 2) AS promedio_evidence
FROM events;
```

Ultimos cuestionarios completados:

```sql
SELECT
  id,
  timestamp,
  user_name,
  profile,
  profile_key,
  country,
  nivel_educativo,
  familiaridad_inicial,
  recursos_similares,
  evidence,
  likert_level
FROM events
WHERE event_type = 'completion'
ORDER BY timestamp DESC
LIMIT 50;
```

Distribucion por nivel de devolucion:

```sql
SELECT
  likert_level,
  COUNT(*) AS total
FROM events
WHERE event_type = 'completion'
GROUP BY likert_level
ORDER BY total DESC;
```

Promedio de puntaje por perfil:

```sql
SELECT
  profile_key,
  COUNT(*) AS total,
  ROUND(AVG(evidence), 2) AS promedio
FROM events
WHERE event_type = 'completion'
GROUP BY profile_key
ORDER BY total DESC;
```

Promedio de puntaje por nivel educativo:

```sql
SELECT
  nivel_educativo,
  COUNT(*) AS total,
  ROUND(AVG(evidence), 2) AS promedio
FROM events
WHERE event_type = 'completion'
GROUP BY nivel_educativo
ORDER BY total DESC;
```

Ver respuestas individuales:

```sql
SELECT
  id,
  event_id,
  question_id,
  question,
  answer,
  created_at
FROM answers
ORDER BY created_at DESC
LIMIT 100;
```

Ver respuestas de un cuestionario especifico:

Cambiar `ID_DEL_EVENTO` por el `id` del evento `completion`.

```sql
SELECT
  question_id,
  question,
  answer
FROM answers
WHERE event_id = ID_DEL_EVENTO
ORDER BY id;
```

Preguntas con mas respuestas negativas:

```sql
SELECT
  question,
  COUNT(*) AS respuestas_no
FROM answers
WHERE answer = 'No'
GROUP BY question
ORDER BY respuestas_no DESC
LIMIT 20;
```

Distribucion si/no por pregunta:

```sql
SELECT
  question,
  answer,
  COUNT(*) AS total
FROM answers
GROUP BY question, answer
ORDER BY question, answer;
```

Ver valoraciones y comentarios de usuarios:

```sql
SELECT
  id,
  timestamp,
  rating,
  suggestion,
  profile,
  profile_key,
  country,
  nivel_educativo
FROM feedback
ORDER BY timestamp DESC
LIMIT 50;
```

Promedio de valoracion de la herramienta:

```sql
SELECT
  COUNT(*) AS total_valoraciones,
  ROUND(AVG(rating), 2) AS promedio_rating
FROM feedback;
```

Distribucion de valoraciones:

```sql
SELECT
  rating,
  COUNT(*) AS total
FROM feedback
GROUP BY rating
ORDER BY rating DESC;
```

Comentarios publicables, valoracion 4 o 5:

```sql
SELECT
  rating,
  suggestion,
  profile,
  nivel_educativo,
  timestamp
FROM feedback
WHERE rating >= 4
  AND suggestion IS NOT NULL
  AND suggestion != ''
ORDER BY timestamp DESC
LIMIT 50;
```

### 11.3. Chequeos de consistencia desde Cloudflare

Verificar que los feedbacks no tengan cargado el nivel del recorrido:

```sql
SELECT
  COUNT(*) AS feedback_con_likert_incorrecto
FROM events
WHERE event_type = 'feedback'
  AND likert_level IS NOT NULL
  AND likert_level != '';
```

Eventos `completion` sin respuestas asociadas:

```sql
SELECT
  e.id,
  e.timestamp,
  e.profile_key
FROM events e
LEFT JOIN answers a ON a.event_id = e.id
WHERE e.event_type = 'completion'
GROUP BY e.id
HAVING COUNT(a.id) = 0;
```

Eventos `feedback` sin fila en tabla `feedback`:

```sql
SELECT
  e.id,
  e.timestamp
FROM events e
LEFT JOIN feedback f ON f.event_id = e.id
WHERE e.event_type = 'feedback'
  AND f.id IS NULL;
```

### 11.4. Resetear datos de prueba desde Cloudflare

Advertencia: estas consultas borran datos reales. Usarlas solo cuando se quiera limpiar una base de pruebas.

Borrar todos los datos y conservar tablas:

```sql
DELETE FROM answers;
DELETE FROM feedback;
DELETE FROM events;
```

Verificar que la base quedo vacia:

```sql
SELECT 'events' AS tabla, COUNT(*) AS total FROM events
UNION ALL
SELECT 'answers', COUNT(*) FROM answers
UNION ALL
SELECT 'feedback', COUNT(*) FROM feedback;
```

Borrar solo registros desde una fecha concreta:

Cambiar la fecha `2026-05-02T00:00:00` por la que corresponda.

```sql
DELETE FROM answers
WHERE event_id IN (
  SELECT id FROM events
  WHERE timestamp >= '2026-05-02T00:00:00'
);

DELETE FROM feedback
WHERE event_id IN (
  SELECT id FROM events
  WHERE timestamp >= '2026-05-02T00:00:00'
);

DELETE FROM events
WHERE timestamp >= '2026-05-02T00:00:00';
```

### 11.5. Revisar el Worker desde Cloudflare

1. En Cloudflare, ir a **Workers y Pages**.
2. Abrir el Worker:

```txt
iag-etica-api
```

3. Entrar en **Informacion general** para verificar que el dominio sea:

```txt
https://iag-etica-api.suscripcionessh.workers.dev
```

4. En **Vinculaciones** o **Enlaces**, verificar:

```txt
DB -> iag-etica-db
```

5. Si se necesita revisar ejecuciones o errores, entrar a **Observabilidad**.
6. Los registros o trazas pueden estar deshabilitados. Eso no impide que la app funcione; solo afecta la depuracion desde el panel.

### 11.6. Probar endpoints desde el navegador

Abrir estas URLs:

```txt
https://iag-etica-api.suscripcionessh.workers.dev/stats
```

```txt
https://iag-etica-api.suscripcionessh.workers.dev/opinions
```

Si devuelven JSON, el Worker esta respondiendo correctamente.
