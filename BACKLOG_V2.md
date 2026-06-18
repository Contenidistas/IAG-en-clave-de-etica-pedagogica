# Backlog v2 - IAG en clave de etica pedagogica

Fecha de inicio: 2026-06-16
Estado: borrador local, sin commit

## Lectura de valoraciones

Se revisaron valoraciones reales de usuarios registradas en D1. Se excluyen mentalmente los registros de prueba de seguridad y el payload de CSV injection.

Senales recurrentes:

- El lenguaje se percibe tecnico o avanzado para parte del publico.
- Hay demasiada informacion durante el recorrido; varios usuarios piden una experiencia mas limpia y practica.
- El chatbot resulta invasivo en celular, especialmente iPhone/Android, y en algunos casos dificulta salir o volver al cuestionario.
- El asistente responde demasiado largo para consultas simples.
- Las preguntas binarias quedan cortas: se piden opciones como "a veces", "tal vez" o "no aplica".
- Hay interes en talleres, cursos, charlas y ejemplos concretos de aplicacion en clase.
- El reporte final y las recomendaciones aparecen como el valor principal de la herramienta.
- Aparecen dudas sobre privacidad, datos y cookies.

## Cambios rapidos aplicados localmente

- Chatbot movil: deja de ocupar toda la pantalla en pantallas chicas y mejora la visibilidad del boton de cierre.
- Asistente pedagogico: prompt ajustado para respuestas mas breves, directas y con lenguaje accesible.
- Privacidad: el registro de visita anonima deja de enviarse al cargar y pasa a depender del consentimiento; el recorrido puede usarse sin registrar datos.
- Recorrido: se incorporan respuestas "A veces" y "No aplica"; "A veces" usa puntaje parcial y cuenta como indicador a fortalecer.
- Interfaz movil: el panel de progreso se compacta y la linea de tiempo se reserva para el resultado final.
- Seguridad previa v2: XSS en estadisticas, CSV injection, CORS allowlist, validacion de payloads, timestamp de servidor y errores genericos.

## Prioridad alta

### 1. Recorrido menos binario

Problema:
Varios usuarios piden alternativas intermedias o "no aplica". El modelo actual usa Si/No y puntajes directos.

Opciones:

- Mantener Si/No para v2.0 y agregar un boton "No aplica / no estoy seguro" con explicacion formativa sin puntaje.
- Pasar a una escala de 4 opciones: "Si", "A veces", "No", "No aplica".
- Pasar a escala Likert de frecuencia y recalibrar puntajes.

Riesgo:
Cambiar esto impacta `CONFIG.perfiles`, calculo de evidencia, timeline, reporte, persistencia y analitica historica.

Decision local inicial:
Para v2 se implementa una escala de cuatro opciones: "Si", "A veces", "No" y "No aplica". "A veces" suma el promedio entre `gainYes` y `gainNo`; "No aplica" no suma puntaje. El historial guarda la etiqueta elegida para mantener trazabilidad.

### 2. Menos informacion durante el recorrido

Problema:
El recorrido se percibe cargado. La teoria compite con la pregunta.

Acciones:

- Mostrar ayuda teorica colapsada por defecto.
- Reducir textos de contexto largos a 1 o 2 frases.
- Llevar explicaciones ampliadas al asistente o a "Ver mas".
- Reservar marcos teoricos completos para fundamentacion y reporte final.

### 3. Reporte final mas util

Problema:
Usuarios valoran el autodiagnostico y piden recomendaciones/formaciones.

Acciones:

- Agregar "Siguiente paso recomendado" segun nivel.
- Agregar 3 acciones concretas segun las respuestas "No".
- Agregar recursos/talleres sugeridos por perfil.
- Mejorar texto para que se sienta menos evaluativo y mas orientador.

### 4. Privacidad clara

Problema:
Aparecen dudas sobre datos, cookies y registro.

Acciones:

- Crear seccion breve "Privacidad y datos" en lenguaje claro.
- Mantener nombre/seudonimo opcional y consentimiento como decisiones separadas.
- Explicar que no se usan cookies publicitarias.
- Explicar que se guarda solo lo necesario para mejorar la herramienta.

## Prioridad media

### 5. Lenguaje accesible

Acciones:

- Revisar preguntas y ayudas para bajar tecnicismo.
- Agregar microglosario para terminos como sesgo, trazabilidad, autoria, alucinacion.
- Usar ejemplos de aula cortos.

### 6. Onboarding mas claro

Acciones:

- Aclarar en la primera pantalla: que hace, cuanto demora, que obtiene el usuario.
- Revisar orden visual: pregunta primero, progreso despues o progreso mas discreto.
- Evitar que el inicio se sienta como una pagina de lectura extensa.

### 7. Dominio y presencia profesional

Acciones:

- Elegir dominio corto y confiable.
- Preferir `.org`, `.uy` o `.com.uy` si apunta a publico educativo uruguayo.
- Evaluar Cloudflare Pages con dominio propio para frontend.
- Usar subdominio para API: `api.<dominio>`.

## Ideas de nombres de dominio

- iagetica.org
- iaeducativaetica.org
- eticaiaeducativa.org
- iagpedagogica.org
- iagcritica.org
- brujulaia.org

## Pendientes tecnicos antes de publicar v2

- Limpiar registros de prueba de seguridad en D1.
- Completar Turnstile o rate-limit para `/chat` y `/events`.
- Proteger mejor admin con lockout/rate-limit.
- Mover secretos reales a `wrangler secret put`.
- Definir si en el futuro se implementa envio de reportes por correo; la ruta rota `/email-report` fue retirada del Worker.
- Probar en celular real o emulacion iPhone/Android antes de publicar.
