# IAG en clave de etica pedagogica

Aplicacion web estatica para promover la reflexion pedagogica, etica y critica sobre el uso de inteligencia artificial generativa en contextos educativos.

La herramienta combina un cuestionario guiado, devoluciones formativas, reporte final, estadisticas anonimas de uso y valoraciones de usuarios. Su fundamentacion articula marcos de ANEP, UNESCO y FING, junto con evidencia empirica y experiencia de aula de los autores.

## Estructura del proyecto

- `index.html`: interfaz principal de la app.
- `fundamentacion.html`: pagina de fundamentacion pedagogica y marco conceptual.
- `styles.css`: estilos visuales de toda la aplicacion.
- `configuracion-ia.js`: configuracion general, endpoints y arboles de decision.
- `ui-ia.js`: manejo de interfaz, carrusel, estadisticas, opiniones, modales y estado visual.
- `juego-ia.js`: logica del cuestionario, respuestas, progreso y envio de datos.
- `certificado-ia.js`: generacion de reporte PDF y acciones finales.
- `chatbot-component.js`: componente de asistencia conversacional.
- `worker-d1.js`: backend para Cloudflare Workers y D1.
- `database/schema.sql`: esquema SQL de la base D1.
- `wrangler.toml.example`: plantilla de configuracion para desplegar el Worker.
- `apps-script-estadisticas.gs`: backend legado para Google Apps Script y Google Sheets.

## Uso local

No requiere instalacion ni build. Abrir `index.html` directamente en el navegador.

Para editar la app:

1. Modificar HTML, CSS o JS.
2. Recargar el navegador.
3. Revisar la consola del navegador si algo no inicia.

## Backend con base de datos

La persistencia principal usa Cloudflare Workers + D1. La app envia eventos anonimos a una API y la API guarda en una base SQLite gestionada por Cloudflare.

Endpoints:

- `POST /events`: recibe visitas, cuestionarios y valoraciones.
- `POST /email-report`: envia por correo un informe solicitado por la persona usuaria, sin guardar el email en D1.
- `GET /stats`: devuelve estadisticas agregadas anonimas.
- `GET /opinions`: devuelve opiniones anonimas destacadas para el carrusel de inicio.

Tablas:

- `events`: visitas, completados y valoraciones como eventos.
- `answers`: respuestas de cada cuestionario completado.
- `feedback`: valoraciones y comentarios anonimos.

### Despliegue en Cloudflare D1

1. Instalar Wrangler si no esta disponible: `npm install -g wrangler`.
2. Autenticarse: `wrangler login`.
3. Crear la base: `wrangler d1 create iag-etica-db`.
4. Copiar `wrangler.toml.example` como `wrangler.toml`.
5. Pegar el `database_id` que devuelve Cloudflare.
6. Crear tablas: `wrangler d1 execute iag-etica-db --file=database/schema.sql`.
7. Configurar la clave privada del panel admin: `wrangler secret put ADMIN_KEY`.
8. Si se usara el envio de informes por correo, configurar Resend:
   - `wrangler secret put RESEND_API_KEY`
   - `wrangler secret put REPORT_EMAIL_FROM`
   - opcional: `wrangler secret put REPORT_EMAIL_REPLY_TO`
9. Desplegar API: `wrangler deploy`.
10. Copiar la URL del Worker en `configuracion-ia.js`, propiedad `apiBaseUrl`.

## Backend legado en Google Sheets

El archivo `apps-script-estadisticas.gs` debe copiarse en un proyecto de Google Apps Script vinculado a una hoja de calculo.

Hojas usadas:

- `Registros`: eventos anonimos de visita, cuestionario completado y valoracion.
- `Detalle`: una fila por cuestionario completado, con columnas dinamicas por pregunta.
- `Docentes`: vista filtrada desde `Detalle`.
- `Estudiantes`: vista filtrada desde `Detalle`.
- `Valoraciones`: comentarios y valoraciones anonimas de mejora.

Endpoints:

- `POST /exec`: recibe visitas, cuestionarios y valoraciones.
- `GET /exec?action=stats`: devuelve estadisticas agregadas anonimas.
- `GET /exec?action=opinions`: devuelve opiniones anonimas destacadas para el carrusel de inicio.

## Configuracion de endpoints

Los endpoints activos se configuran en `configuracion-ia.js`:

```js
apiBaseUrl: 'https://iag-etica-api.TU_SUBDOMINIO.workers.dev'
```

Si se usa el backend legado, cada vez que se modifique `apps-script-estadisticas.gs`, hay que publicar una nueva version del Web App en Apps Script:

1. Guardar el script.
2. Ir a `Implementar > Administrar implementaciones`.
3. Editar la implementacion activa.
4. Seleccionar `Nueva version`.
5. Implementar.
6. Actualizar la URL en `configuracion-ia.js` si Google genera una nueva.

## Estadisticas

Las estadisticas globales salen de la base de datos, no del navegador local. Esto permite que varios usuarios vean los datos agregados de uso.

La app registra una visita por sesion de navegador mediante `sessionStorage`. El boton `Actualizar` solo lee estadisticas; no registra visitas nuevas.

Los resultados de cuestionarios se calculan desde eventos `completion` y sus respuestas asociadas.

## Robustez actual

- La API usa Cloudflare Worker como capa de escritura y lectura.
- La base D1 separa eventos, respuestas y valoraciones.
- El panel administrativo exige una clave privada configurada como secreto `ADMIN_KEY` en Cloudflare.
- El envio de informes por correo usa secretos del Worker y no persiste direcciones de email en D1.
- Los envios usan JSON con CORS normal, por lo que la app puede detectar errores reales de escritura.
- Las opiniones publicas se filtran: solo se muestran comentarios con valoracion 4 o 5.
- Las visitas se deduplican por sesion.

## Mejoras recomendadas

- Agregar una tabla `errors` para registrar fallos del backend y facilitar auditoria.
- Agregar `schemaVersion` a cada payload para migraciones futuras.
- Separar configuracion sensible y endpoints por ambiente: desarrollo, prueba y produccion.
- Agregar validacion mas estricta del payload recibido en el Worker.
- Crear una accion de mantenimiento para recalcular hojas derivadas y limpiar visitas historicas duplicadas.
- Agregar cache breve a `GET /stats` y `GET /opinions` si aumenta el trafico.
- Agregar pruebas automatizadas basicas para funciones puras del cuestionario y del backend.

## Escalabilidad

Cloudflare D1 mejora la solidez respecto a Sheets para concurrencia, consultas agregadas y evolucion de esquema. Si el uso creciera a escala institucional masiva, se puede migrar el mismo contrato de API a PostgreSQL, Supabase u otro motor dedicado.

## Licencia y autoria

Creado por Prof. Esp. Santiago Hernandez y Prof. Diego Daluz.

El proyecto declara licencia MIT en el encabezado de `index.html`. Si se publica el repositorio, se recomienda agregar un archivo `LICENSE` con el texto completo de la licencia.
