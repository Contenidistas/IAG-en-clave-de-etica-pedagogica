# IAG en clave de etica pedagogica

Aplicacion web estatica para promover la reflexion pedagogica, etica y critica sobre el uso de inteligencia artificial generativa en contextos educativos.

La herramienta combina seleccion de perfil, arboles de decision, grafo vivo de principios, devoluciones formativas, brujula etica, constructor de acuerdos didacticos, casos situados, reporte PDF, estadisticas anonimas de uso, opiniones publicas filtradas y asistencia conversacional. Su fundamentacion articula marcos de ANEP, UNESCO, FING, Udelar y Ceibal, junto con evidencia empirica y experiencia de aula de los autores.

## Recorridos ratificados

La experiencia se adapta desde el inicio segun el lugar desde el que se usa la herramienta:

- `Estudiante`: recorrido liviano para revisar uso de IA en estudio, tareas y produccion academica. Diferencia estudiantes de educacion media, formacion docente y universidad.
- `Docente`: recorrido para pensar consignas, evaluacion, acompanamiento, transparencia y acuerdos de aula.
- `Docente/investigador/a`: entrada especializada para analizar marcos, formacion, investigacion y construccion de criterios compartidos. Usa el arbol docente como base, pero muestra una fundamentacion mas amplia y genera textos de salida acordes al rol.

Los recorridos estan definidos en `configuracion-ia.js`. La resolucion de perfil efectivo se realiza en `juego-ia.js`: `especializado` se mapea al arbol `docente`, mientras que estudiantes se segmentan por nivel educativo.

## Experiencia principal

1. La persona ingresa a la app y elige perfil.
2. La pantalla adapta la densidad de marcos: estudiante ve una version compacta; docente ve una version intermedia; docente/investigador/a ve una fundamentacion mas completa.
3. Se completan datos minimos: nivel educativo cuando corresponde, pais, familiaridad inicial, uso previo de recursos similares y consentimiento opcional de registro anonimo.
4. El cuestionario recorre un arbol de decision con respuestas `Si`, `A veces`, `No` y `No aplica`.
5. Durante el recorrido se muestra criterio activo, motivo del nodo, mapa de decision y grafo vivo por ejes: transparencia, verificacion, datos, equidad y agencia humana.
6. Al finalizar se abre un panel por pestanas con sintesis, brujula, acuerdo, casos situados, recursos y recorrido.
7. La persona puede copiar el resumen, copiar/regenerar el acuerdo, descargar el PDF, consultar recursos o dejar una valoracion anonima.

## Salidas formativas

- **Devolucion formativa**: interpreta el nivel alcanzado como punto de partida, no como calificacion.
- **Brujula etica**: visualiza cinco ejes de decision y marca focos prioritarios.
- **Grafo vivo de principios**: conecta cada decision del arbol con los criterios eticos activados.
- **Constructor de acuerdos**: genera un borrador editable para aula, estudiante, institucion o aula virtual.
- **Casos situados**: propone dilemas breves para conversar decisiones concretas desde los principios activados.
- **Reporte PDF**: incluye datos del recorrido, lectura desde marcos, acuerdo generado y referencias orientadoras.
- **Asistente pedagogico**: permite pedir sugerencias de mejora contextualizadas al recorrido.

## Estructura del proyecto

- `index.html`: interfaz principal de la app.
- `fundamentacion.html`: pagina de fundamentacion pedagogica y marco conceptual.
- `admin.html`: panel administrativo protegido.
- `styles.css`: estilos visuales, responsive, brujula, mapa de decision y constructor de acuerdos.
- `configuracion-ia.js`: configuracion general, endpoints, niveles, perfiles y arboles de decision.
- `ui-ia.js`: manejo de interfaz, carrusel, seleccion de perfil, marcos colapsables, estadisticas, opiniones, modales y estado visual.
- `juego-ia.js`: logica del cuestionario, resolucion de perfiles, mapa de decision, brujula, acuerdo didactico, progreso y envio de datos.
- `certificado-ia.js`: generacion de reporte PDF y acciones finales de copia.
- `chatbot-component.js`: componente de asistencia conversacional.
- `worker-d1.js`: backend para Cloudflare Workers y D1.
- `database/schema.sql`: esquema SQL de la base D1.
- `wrangler.toml.example`: plantilla de configuracion para desplegar el Worker.
- `apps-script-estadisticas.gs`: backend legado para Google Apps Script y Google Sheets.

## Uso local

La app no requiere build. Para probarla con rutas locales y PDF/recursos, se recomienda usar Live Server desde `index.html`.

Consideraciones:

- La navegacion, cuestionario, brujula, acuerdo didactico y recursos funcionan desde Live Server.
- La descarga del PDF usa `jsPDF` desde CDN, por lo que requiere conexion a internet.
- Estadisticas, opiniones, chatbot y registro anonimo dependen del Worker remoto configurado en `configuracion-ia.js`.

## Marcos de referencia

La herramienta enlaza y utiliza como orientacion:

- ANEP: documento sobre inteligencia artificial en educacion.
- UNESCO: guia para el uso de IA generativa en educacion e investigacion.
- FING: guia de etica para el uso de IA en unidades curriculares.
- Udelar: politica institucional de inteligencia artificial y 11 principios rectores.
- Ceibal: buenas practicas para el uso de IA en educacion.

La interfaz muestra estos marcos de forma progresiva para evitar carga textual innecesaria.

## Backend con base de datos

La persistencia principal usa Cloudflare Workers + D1. La app envia eventos anonimos a una API y la API guarda en una base SQLite gestionada por Cloudflare.

Endpoints:

- `POST /events`: recibe visitas, cuestionarios y valoraciones.
- `GET /stats`: devuelve estadisticas agregadas anonimas.
- `GET /opinions`: devuelve opiniones anonimas destacadas para el carrusel de inicio.
- `GET /admin/*`: rutas protegidas para consulta y exportacion administrativa.
- `POST /chat`: endpoint del asistente conversacional.

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
8. Configurar la clave de Gemini para el chatbot: `wrangler secret put GEMINI_API_KEY`.
9. Desplegar API: `wrangler deploy`.
10. Copiar la URL del Worker en `configuracion-ia.js`, propiedad `apiBaseUrl`.

## Backend legado en Google Sheets

El archivo `apps-script-estadisticas.gs` queda como alternativa historica. El backend recomendado para uso sostenido es Cloudflare D1.

Hojas usadas:

- `Registros`: eventos anonimos de visita, cuestionario completado y valoracion.
- `Detalle`: una fila por cuestionario completado, con columnas dinamicas por pregunta.
- `Docentes`: vista filtrada desde `Detalle`.
- `Estudiantes`: vista filtrada desde `Detalle`.
- `Valoraciones`: comentarios y valoraciones anonimas de mejora.

## Configuracion de endpoints

Los endpoints activos se configuran en `configuracion-ia.js`:

```js
apiBaseUrl: 'https://iag-etica-api.TU_SUBDOMINIO.workers.dev'
```

## Privacidad y cuidado de datos

La herramienta prioriza estadisticas agregadas y uso anonimo. El registro depende del consentimiento de la persona usuaria. Si no acepta el registro anonimo, puede usar igualmente el recorrido; no se envian datos de visita, cuestionario ni valoracion.

Se recomienda no ingresar datos sensibles, informacion identificable de estudiantes o terceros, datos medicos, familiares, institucionales reservados ni producciones que no deban circular fuera del entorno acordado.

## Robustez actual

- La API usa Cloudflare Worker como capa de escritura y lectura.
- La base D1 separa eventos, respuestas y valoraciones.
- El panel administrativo exige una clave privada configurada como secreto `ADMIN_KEY`.
- Los envios usan JSON con CORS normal.
- Las opiniones publicas se filtran: solo se muestran comentarios con valoracion 4 o 5.
- Las visitas se deduplican por sesion.
- El Worker acepta los perfiles `docente`, `estudiante` y `especializado`; `especializado` guarda `profileKey: docente`.

## Mejoras recomendadas

- Agregar pruebas automatizadas para funciones puras del cuestionario, perfiles y backend.
- Ampliar el uso de `schemaVersion` para migraciones futuras de base y analitica historica.
- Separar configuracion sensible y endpoints por ambiente: desarrollo, prueba y produccion.
- Agregar cache breve a `GET /stats` y `GET /opinions` si aumenta el trafico.

## Escalabilidad

Cloudflare D1 mejora la solidez respecto a Sheets para concurrencia, consultas agregadas y evolucion de esquema. Si el uso creciera a escala institucional masiva, se puede migrar el mismo contrato de API a PostgreSQL, Supabase u otro motor dedicado.

## Licencia y autoria

Creado por Prof. Esp. Santiago Hernandez como ideologo y desarrollador y el Prof. Diego Daluz como validador y coinvestigador.

El proyecto declara licencia MIT en el encabezado de `index.html` y cuenta con archivo `LICENSE`.
