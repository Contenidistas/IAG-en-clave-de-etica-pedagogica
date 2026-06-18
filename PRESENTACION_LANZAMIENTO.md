# Presentación y lanzamiento de IAG en clave de ética pedagógica

## Nombre de la herramienta

**IAG en clave de ética pedagógica**

Herramienta web de autoevaluación, reflexión y orientación pedagógica sobre el uso de inteligencia artificial generativa en educación.

## Presentación breve

IAG en clave de ética pedagógica es una aplicación educativa pensada para acompañar a docentes, estudiantes y colectivos institucionales en la revisión crítica del uso de inteligencia artificial generativa. Su propósito no es controlar, sancionar ni clasificar personas, sino abrir una conversación informada sobre cómo se usa la IA, qué decisiones pedagógicas están implicadas y qué criterios conviene fortalecer.

La herramienta propone un recorrido guiado de preguntas, adaptado al perfil de quien la utiliza, y entrega una devolución formativa con orientaciones basadas en marcos de referencia como ANEP, UNESCO, FING, Udelar y Ceibal. También permite descargar un reporte final, consultar recursos, revisar acuerdos didácticos y dejar una valoración anónima para seguir mejorando la propuesta.

## Propósito

El propósito central es ofrecer un espacio accesible para pensar el uso de IA generativa desde una perspectiva ética, crítica y reflexiva.

La herramienta busca:

- Promover criterios pedagógicos para el uso de IA en tareas, evaluaciones y procesos de aprendizaje.
- Favorecer la transparencia sobre cuándo, cómo y para qué se usa IA.
- Ayudar a distinguir entre asistencia tecnológica, producción humana, autoría y responsabilidad.
- Fortalecer la verificación de información, la detección de sesgos y la toma de decisiones fundamentadas.
- Acompañar a docentes y estudiantes en la construcción de acuerdos institucionales.
- Convertir el uso de IA en una oportunidad de formación, no solo en un problema de control.

## De dónde surge

La herramienta surge del cruce entre investigación, formación docente y experiencia de aula.

Su diseño parte de una constatación concreta: la IA generativa ya está presente en las prácticas educativas, aunque muchas veces aparece de forma desordenada, silenciosa o desigual. Docentes y estudiantes la usan, la prueban, la temen, la ocultan o la incorporan con distintos niveles de criterio. Frente a esa realidad, la respuesta pedagógica no puede limitarse a prohibir o habilitar de manera general. Hace falta conversar, orientar y construir marcos de uso.

La propuesta se apoya en:

- Experiencias de aula y formación de formadores.
- Investigaciones sobre percepciones y usos de IA generativa en educación.
- Marcos de referencia de ANEP sobre IA en educación.
- Orientaciones internacionales de UNESCO sobre IA generativa.
- Aportes de FING sobre uso ético, documentación del proceso, originalidad y evaluación.
- Aportes de Udelar sobre principios para el uso académico e institucional de IAG.
- Aportes de Ceibal sobre IA para la educación, ciudadanía digital situada y uso ético.

Desde esa base, la aplicación busca traducir marcos conceptuales en preguntas concretas que puedan ser respondidas por una persona real, en una situación educativa real.

## Alcances

La herramienta permite:

- Realizar un cuestionario de autoevaluación según perfil.
- Seleccionar perfil estudiante, docente o docente/investigador/a en IA educativa.
- Diferenciar recorridos para estudiantes de educación media, formación docente o universidad.
- Recibir una devolución formativa según el recorrido realizado.
- Revisar una brújula ética con ejes de transparencia, verificación, datos, equidad y agencia humana.
- Generar un acuerdo didáctico editable a partir del recorrido.
- Descargar un reporte final en PDF.
- Consultar recursos vinculados a ANEP, UNESCO, FING, Udelar, Ceibal y otros materiales educativos.
- Recibir apoyo de un asistente pedagógico conversacional.
- Visualizar estadísticas globales agregadas y anónimas.
- Dejar una valoración y sugerencias sobre la herramienta.
- Administrar datos agregados desde un panel protegido.

## Límites

La herramienta no pretende:

- Certificar competencias de manera oficial.
- Sustituir la mediación docente o institucional.
- Definir por sí sola políticas de evaluación.
- Detectar plagio o uso no declarado de IA.
- Reemplazar el análisis contextual de cada centro, asignatura o colectivo.
- Emitir juicios definitivos sobre una persona o práctica.

Su valor está en iniciar y sostener procesos de reflexión. El resultado debe leerse como orientación, no como veredicto.

## Destinatarios

La herramienta está pensada para:

- Docentes de distintos niveles educativos.
- Estudiantes de educación media.
- Estudiantes universitarios.
- Estudiantes de formación docente.
- Docentes/investigadores/as o formadores/as que trabajan sobre IA educativa.
- Colectivos docentes.
- Espacios de formación, talleres, salas y jornadas institucionales.
- Grupos interesados en discutir criterios de uso de IA generativa.

## Perspectiva pedagógica

La aplicación parte de una idea clave: el problema educativo no es solamente si se usa IA, sino cómo se la integra, qué se aprende con ella, qué se delega, qué se verifica, qué se declara y qué lugar conserva la agencia humana.

Desde esta mirada, el uso de IA generativa requiere:

- Transparencia: declarar cuándo y cómo se utiliza.
- Verificación: contrastar respuestas con fuentes confiables.
- Autoría: distinguir producción propia de asistencia tecnológica.
- Criterio profesional: decidir según finalidad pedagógica, nivel educativo y contexto.
- Equidad: considerar accesos, brechas y condiciones reales de uso.
- Reflexión: revisar el proceso, no solo el resultado final.

La herramienta organiza el recorrido alrededor de cuatro principios operativos: verificación, transparencia, sesgos y valor agregado humano. Esta decisión busca mantener una experiencia clara y accionable, no reducir la complejidad ética del tema. Por eso, junto a esos principios, se reconocen criterios transversales de cuidado que atraviesan todo uso educativo de IA: protección de datos, privacidad, equidad, inclusión, accesibilidad, edad del estudiantado, acuerdos institucionales y responsabilidad pedagógica.

Estos criterios transversales funcionan como alertas de contexto. No siempre aparecen como una pregunta específica del cuestionario, pero deben estar presentes al interpretar cada respuesta, diseñar actividades, elegir herramientas, compartir producciones o decidir qué información puede cargarse en sistemas de IA.

## Arquitectura funcional

La herramienta está organizada en tres capas principales:

1. **Interfaz web**

   La experiencia principal se desarrolla en el navegador. La persona ingresa, selecciona su perfil, responde el cuestionario, revisa su devolución, consulta la brújula ética, ajusta un acuerdo didáctico, descarga el reporte y puede dejar una valoración.

2. **Lógica pedagógica**

   Los recorridos se organizan mediante árboles de decisión definidos en `configuracion-ia.js`. Cada pregunta se vincula con criterios éticos, críticos y pedagógicos. El resultado final se calcula a partir de las respuestas y se expresa como una orientación formativa.

3. **Backend y persistencia**

   La aplicación utiliza Cloudflare Workers y Cloudflare D1 para registrar eventos anónimos, respuestas, valoraciones y estadísticas agregadas. También incorpora rutas administrativas protegidas y un endpoint para el asistente conversacional.

## Arquitectura técnica

Archivos principales:

- `index.html`: interfaz central de la herramienta.
- `fundamentacion.html`: página de origen, sentido pedagógico y marcos de referencia.
- `admin.html`: panel administrativo protegido.
- `styles.css`: diseño visual y comportamiento responsive.
- `configuracion-ia.js`: configuración, recorridos, perfiles y criterios.
- `ui-ia.js`: interacción de interfaz, estadísticas, opiniones y modales.
- `juego-ia.js`: desarrollo del cuestionario, respuestas, progreso y envío de datos.
- `certificado-ia.js`: generación del reporte PDF.
- `chatbot-component.js`: asistente pedagógico conversacional.
- `worker-d1.js`: API en Cloudflare Workers.
- `database/schema.sql`: estructura de la base D1.

Flujo general:

1. La persona ingresa a la web desde PC o celular.
2. La app registra una visita anónima por sesión.
3. La persona selecciona perfil: estudiante, docente o docente/investigador/a.
4. El cuestionario recorre un árbol de decisión.
5. La app calcula una devolución formativa y una brújula ética.
6. Se genera un acuerdo didáctico editable y un reporte descargable.
7. Si la persona lo desea, envía una valoración anónima.
8. El backend guarda eventos y respuestas sin exponer datos individuales en la vista pública.
9. El panel administrativo permite consultar información agregada o exportar datos para análisis.

## Privacidad y cuidado de datos

La herramienta prioriza estadísticas agregadas y uso anónimo. La visualización pública muestra datos generales, no respuestas individuales. El panel administrativo está protegido mediante una clave privada.

En el uso pedagógico de IA, la protección de datos no se limita al funcionamiento técnico de esta aplicación. También implica orientar a docentes y estudiantes para no ingresar información sensible, datos personales de terceros, producciones identificables sin consentimiento o materiales institucionales que no deberían circular fuera del entorno acordado.

Para un lanzamiento en colectivos o instituciones, se recomienda explicar claramente:

- Qué datos se registran.
- Para qué se usan.
- Qué parte es anónima.
- Qué información puede aparecer en estadísticas u opiniones públicas.
- Que el reporte final pertenece a la persona usuaria.
- Que no conviene ingresar datos sensibles ni información identificable de otras personas en herramientas de IA.
- Que equidad, accesibilidad y edad del estudiantado deben considerarse antes de definir usos o actividades con IA.
- Que la herramienta no reemplaza acuerdos institucionales de privacidad.

## Instructivo de uso en PC

1. Abrir el enlace de la herramienta en el navegador.
2. Leer la presentación inicial y, si se desea, ingresar a la fundamentación.
3. Presionar **Iniciar cuestionario**.
4. Seleccionar el perfil: estudiante, docente o docente/investigador/a.
5. Completar los datos solicitados, especialmente el nivel educativo cuando corresponda.
6. Responder cada pregunta con honestidad, pensando en prácticas reales.
7. Usar el botón de contexto cuando se quiera comprender mejor el criterio pedagógico de una pregunta.
8. Al finalizar, leer la devolución completa y la brújula ética.
9. Revisar, editar o copiar el acuerdo didáctico generado.
10. Descargar el reporte PDF si se desea conservarlo o compartirlo.
11. Revisar los recursos sugeridos.
12. Dejar una valoración o comentario para mejorar la herramienta.

Sugerencia para uso en sala docente:

- Proyectar la herramienta durante 5 minutos.
- Invitar a que cada persona complete el recorrido en su propio equipo.
- Reservar 15 o 20 minutos finales para conversar sobre patrones, dudas y acuerdos posibles.

## Instructivo de uso en celular

1. Abrir el enlace desde el navegador del celular.
2. Usar la herramienta en posición vertical.
3. Tocar **Iniciar cuestionario**.
4. Seleccionar perfil y nivel educativo cuando corresponda.
5. Avanzar pregunta por pregunta.
6. Leer los textos de ayuda antes de responder si la pregunta genera duda.
7. Al terminar, revisar la devolución, la brújula ética y el acuerdo generado.
8. Descargar el PDF o compartirlo desde las opciones del navegador, si el dispositivo lo permite.
9. Usar el asistente pedagógico si se desea profundizar alguna recomendación.
10. Enviar una valoración final si se quiere aportar a la mejora de la herramienta.

Recomendaciones para celular:

- Usar conexión estable.
- Evitar cerrar la pestaña durante el recorrido.
- Si el PDF no se descarga automáticamente, revisar la carpeta de descargas del dispositivo.
- Si se comparte en un grupo, acompañar el enlace con una consigna clara.

## Propuesta de lanzamiento

Para lanzar la herramienta esta semana, conviene pensar la difusión en tres momentos: antes, durante y después.

### 1. Antes del lanzamiento

Preparar:

- Enlace público definitivo.
- Mensaje breve de presentación.
- Imagen o captura de pantalla de la pantalla inicial.
- Documento de fundamentación.
- Consigna de uso para colectivos.
- Formulario o canal de devolución complementario, si se quiere recoger impresiones más extensas.

Checklist técnico previo:

- Verificar que el cuestionario complete correctamente todos los perfiles.
- Probar descarga de PDF en PC y celular.
- Probar estadísticas.
- Probar envío de valoración.
- Probar chatbot.
- Verificar que la URL del backend sea la de producción.
- Confirmar que el panel administrativo tenga clave segura.

### 2. Durante el lanzamiento

Se recomienda presentar la herramienta como una invitación, no como una imposición. El tono puede ser:

> Compartimos una herramienta abierta para pensar colectivamente cómo estamos usando IA generativa en educación. No busca controlar ni calificar, sino ayudar a explicitar criterios, reconocer avances y abrir conversaciones pedagógicas.

Dinámica posible para colectivos:

1. Presentación oral de 5 minutos.
2. Uso individual de la herramienta durante 10 o 15 minutos.
3. Descarga opcional del reporte.
4. Conversación en pequeños grupos.
5. Puesta en común sobre acuerdos, tensiones y próximos pasos.

Preguntas para guiar la conversación:

- ¿Qué usos de IA ya están presentes en nuestras prácticas?
- ¿Qué criterios tenemos claros y cuáles siguen implícitos?
- ¿Qué debería declararse en una tarea o evaluación?
- ¿Qué acuerdos mínimos necesitamos como colectivo?
- ¿Qué lugar ocupa la verificación de información?
- ¿Cómo cuidamos la autoría y el aprendizaje real?

### 3. Después del lanzamiento

Después de compartirla, conviene sostener un pequeño ciclo de mejora:

- Revisar valoraciones recibidas.
- Detectar dudas frecuentes.
- Ajustar textos o preguntas que generen confusión.
- Compartir una segunda comunicación agradeciendo los aportes.
- Proponer una instancia breve para construir acuerdos institucionales.

## Estrategia de difusión

Canales recomendados:

- Grupos de WhatsApp de colectivos docentes.
- Correo institucional.
- Salas docentes.
- Aulas virtuales.
- Redes académicas.
- Jornadas de formación.
- Espacios de coordinación.

Orden sugerido:

1. Compartir primero con un grupo cercano de confianza.
2. Recoger comentarios rápidos durante 24 o 48 horas.
3. Ajustar detalles si aparecen problemas.
4. Lanzar a colectivos más amplios.
5. Acompañar la difusión con una invitación a devolver impresiones.

## Texto breve para WhatsApp

Hola, compartimos **IAG en clave de ética pedagógica**, una herramienta web para reflexionar sobre el uso de inteligencia artificial generativa en educación.

La propuesta no busca calificar ni controlar, sino ayudar a docentes y estudiantes a revisar criterios sobre transparencia, autoría, verificación, sesgos y uso pedagógico de la IA.

Se completa en pocos minutos, ofrece una devolución formativa y permite descargar un reporte final.

Enlace: [PEGAR ENLACE]

Nos interesa especialmente recibir comentarios y sugerencias para seguir mejorándola desde la experiencia real de los colectivos educativos.

## Texto para correo institucional

Asunto: Herramienta para reflexionar sobre el uso pedagógico de IA generativa

Estimadas y estimados:

Compartimos **IAG en clave de ética pedagógica**, una herramienta web desarrollada para acompañar la reflexión sobre el uso de inteligencia artificial generativa en contextos educativos.

La aplicación propone un recorrido de autoevaluación para estudiantes, docentes y docentes/investigadores/as en IA educativa. A partir de una serie de preguntas, ofrece una devolución formativa vinculada con criterios de transparencia, autoría, verificación de información, sesgos, evaluación y responsabilidad pedagógica. También genera una brújula ética, un acuerdo didáctico editable, un reporte final y recursos de referencia.

La herramienta surge de procesos de investigación, formación docente y experiencia de aula, y dialoga con orientaciones de ANEP, UNESCO, FING, Udelar y Ceibal. No pretende funcionar como mecanismo de control ni como certificación, sino como punto de partida para conversar y construir acuerdos.

Enlace de acceso: [PEGAR ENLACE]

Agradecemos especialmente los comentarios, valoraciones y sugerencias que puedan surgir de su uso, ya que forman parte del proceso de mejora de la propuesta.

Saludos cordiales,

[FIRMA]

## Texto para presentar en sala o colectivo

Esta herramienta nace de una preocupación compartida: la IA generativa ya está en las prácticas educativas, pero todavía estamos construyendo criterios comunes para usarla con sentido pedagógico.

La propuesta que compartimos no busca decir qué está bien o mal de forma cerrada. Busca ayudarnos a poner en palabras decisiones que muchas veces quedan implícitas: cuándo se puede usar IA, cómo se declara, qué se verifica, qué se considera autoría, qué riesgos aparecen y qué oportunidades se abren.

Les proponemos usarla como disparador de conversación. Cada persona puede completar su recorrido y luego podemos mirar juntos qué acuerdos necesitamos como colectivo.

## Mensajes clave para la comunicación pública

- La herramienta acompaña la reflexión, no reemplaza el criterio docente.
- El foco no está en prohibir o habilitar IA, sino en construir criterios de uso.
- El reporte final es una orientación formativa, no una calificación.
- Los datos públicos se muestran de forma agregada y anónima.
- La propuesta está vinculada con marcos de ANEP, UNESCO, FING, Udelar y Ceibal.
- El uso de IA requiere transparencia, verificación, autoría y responsabilidad.
- La herramienta puede funcionar como punto de partida para acuerdos didácticos.

## Posibles usos institucionales

- Diagnóstico inicial en una sala docente.
- Actividad de apertura en jornadas sobre IA.
- Insumo para acuerdos de evaluación.
- Recurso en formación docente.
- Trabajo con estudiantes sobre ciudadanía digital.
- Punto de partida para discutir autoría y uso declarado de IA.
- Actividad previa a la elaboración de una política institucional.

## Sugerencia de taller breve

Duración total: 45 minutos.

1. **Apertura** - 5 minutos

   Presentar el sentido de la herramienta y aclarar que no es una prueba ni una evaluación.

2. **Uso individual** - 15 minutos

   Cada participante realiza el recorrido desde su dispositivo.

3. **Lectura del reporte** - 5 minutos

   Cada persona revisa su devolución e identifica una idea que le parezca relevante.

4. **Conversación en grupos** - 10 minutos

   Compartir tensiones, coincidencias y preguntas.

5. **Acuerdos iniciales** - 10 minutos

   Registrar dos o tres criterios que el colectivo quiera seguir trabajando.

## Indicadores para evaluar el lanzamiento

Durante la primera semana, pueden observarse:

- Cantidad de visitas.
- Cantidad de cuestionarios completados.
- Perfiles que más usan la herramienta.
- Valoraciones recibidas.
- Comentarios frecuentes.
- Dudas técnicas reportadas.
- Interés de colectivos en usarla en salas o talleres.

Más importante que el número total de usos es la calidad de las conversaciones que habilite.

## Cierre

IAG en clave de ética pedagógica es una herramienta abierta, perfectible y situada. Su fortaleza no está solo en el cuestionario, sino en la conversación que puede generar alrededor de la IA generativa en educación.

Lanzarla a colectivos implica ponerla a circular como una invitación: detenerse, pensar, discutir criterios y construir acuerdos. En un tema atravesado por entusiasmo, temor, incertidumbre y desigualdad, esa pausa reflexiva ya es una intervención pedagógica.
