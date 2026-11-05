# Modo programa Uruguay–Estados Unidos 2027

Esta primera capa transforma la herramienta abierta en una infraestructura apta para implementar y evaluar programas educativos por cohortes.

## Activación

El modo programa se activa únicamente mediante un enlace con parámetros validados:

```text
https://iagetica.org/?program=uy-us-ai-literacy-2027&cohort=liceo-01&phase=baseline
```

Parámetros:

- `program`: programa disponible en `program-context.js`.
- `cohort`: código no identificable de la institución o grupo.
- `phase`: `baseline`, `final` o `followup`.

Si el programa no pertenece al catálogo, la plataforma conserva su funcionamiento público normal y no registra contexto programático.

## Privacidad y medición

Al activar un programa se genera un identificador seudónimo aleatorio y se guarda localmente para esa combinación de programa y cohorte. Esto permite vincular momentos de una misma participación cuando se utiliza el mismo dispositivo y navegador.

El identificador y los datos del programa solamente se envían al backend cuando la persona acepta el registro anónimo. No contienen correo, documento ni identidad real. Si el almacenamiento local está bloqueado, el recorrido sigue funcionando, aunque la vinculación longitudinal puede perderse.

## Datos incorporados

- `programCode`
- `cohortCode`
- `measurementPhase`
- `participantId`
- `literacyScore` (escala 0–100, ponderando 60% situaciones aplicadas + 40% prácticas docentes/estudiantiles)
- `literacyAnswers` (detalle estructurado de respuestas versión `lit-v1`)

El panel administrativo permite filtrar por programa y momento, y cruzar programa, cohorte o momento con las demás variables cuantitativas e inferenciales.

## Despliegue de base de datos

Antes de publicar el frontend que envía estos campos, aplicar las migraciones en orden:

```powershell
npx wrangler d1 migrations apply iag-etica-db --remote
```

Migraciones incluidas:
- `0003_program_context.sql`: columnas `program_code`, `cohort_code`, `measurement_phase`, `participant_id`.
- `0004_literacy_scores.sql`: columnas `literacy_score` (INTEGER) y `literacy_answers` (TEXT).

## Instrumento breve pre/post de alfabetización en IA (`lit-v1`)

Para medir aprendizajes directos en alfabetización en IA sin depender exclusivamente del árbol de autoevaluación ética, se diseñó un instrumento psicométricamente balanceado de 8 reactivos (`literacy-instrument.js`):
- **5 reactivos situados de criterio y conocimiento (`k1`–`k5`)**:
  - `k1`: Atribución y autoría (criterio Ceibal/UNESCO para declarar el uso de IA).
  - `k2`: Detección de sesgos de representación y entrenamiento.
  - `k3`: Privacidad de datos e información personal identificable (PII/FERPA).
  - `k4`: Verificación de fuentes ante alucinaciones y confabulación (NIST AI RMF).
  - `k5`: Supervisión humana obligatoria del juicio docente («humans in the loop» U.S. EdTech Guidance).
- **3 reactivos de autoeficacia y práctica en escala Likert 1–5 (`p1`–`p3`)**:
  - `p1`: Capacidad para identificar respuestas erróneas o confabuladas.
  - `p2`: Participación en el diseño o aplicación de acuerdos de aula sobre IA.
  - `p3`: Criterio reflexivo para no delegar el pensamiento crítico en la IA.
- **Ponderación**: 60 % situaciones + 40 % prácticas, normalizado a 0–100 puntos.
- **Activación automática**: Solo se despliega como paso intermedio (paso 4 de 5) cuando hay un enlace de programa activo (`?program=uy-us-ai-literacy-2027`). En el acceso web público general, la plataforma permanece inalterada en 4 pasos sin fricción.

## Marcos estadounidenses y capa comparada Uruguay–Estados Unidos

Se incorporó el contexto nacional de **Estados Unidos** (`country-context.js`, `ethical-evidence.js`, `ui-ia.js`, `fundamentacion.js`) y una capa comparativa binacional (`CountryContext.bilateralUyUs`) con referencias versionadas y actualizables:

- **NIST AI Risk Management Framework (AI RMF 1.0 y Generative AI Profile NIST AI 600-1, en revisión)**: gobernanza (`GOVERN`), mapeo (`MAP`), medición (`MEASURE`) y gestión de riesgos (`MANAGE`), incluyendo confabulación, sesgos dañinos, privacidad y trazabilidad.
- **U.S. Department of Education (EdTech & AI Guidance)**: tecnología orientada por educadores (*humans in the loop*), ética, accesible, transparente y protectora de los datos estudiantiles.
- **Institute of Education Sciences (IES — District Leadership Protocol)**: protocolos de decisión institucional, privacidad, preparación escolar y comunicación de políticas de IA.

Además, el **Laboratorio de Casos** (`juego-ia.js`) suma dos dilemas comparados Uruguay–Estados Unidos (en español, inglés, portugués y francés):

- `gobernanza_binacional_uy_us`: *Protocolo de distrito y acuerdo de centro: auditar un tutor de IA (Caso comparado UY–EE. UU.)*.
- `evaluacion_bilingue_uy_us`: *Retroalimentación automatizada y voz estudiantil en aulas bilingües (Caso comparado UY–EE. UU.)*.

## Monitoreo y Evaluación (M&E) Pre/Post en el panel administrativo

El panel administrativo (`admin.html`, `admin.js`, `admin-analysis.js`, `admin.css`) incorpora la pestaña **Monitoreo M&E** (`#programEvalView`) con seguimiento longitudinal y por cohortes:

- **Indicadores frente a metas de referencia 2027**:
  - Participantes únicos con identificador seudónimo (`participantId`) frente a la meta de referencia (`300`).
  - Instituciones / cohortes activas (`cohortCode`) frente a la meta de referencia (`10–12`).
  - Tasa de finalización longitudinal (`baseline` → `final`) frente a la meta (`80 %`).
  - Cambio Pre/Post agregado y pareado en puntaje de **Evidencia Ética** frente a la meta de mejora (`+20 %`).
  - Cambio Pre/Post agregado y pareado en el **Instrumento de Alfabetización en IA (`lit-v1`)** con desglose de situaciones y prácticas.
- **Tarjetas por etapa de intervención**: Diagnóstico inicial (`baseline`), Evaluación post-taller (`final`) y Seguimiento a 60–90 días (`followup`), informando promedios de Ética y Alfabetización.
- **Tabla comparativa por cohorte / institución** y exportación directa:
  - **Informe M&E (`.md`)** listo para reportes de avance ante la Embajada / Alianza con indicadores de metas 2027, desglose por momento y detalle por institución.
  - **CSV de cohortes (`.csv`)** con recuentos, promedios de ética y alfabetización por etapa, pares longitudinales y deltas calculados.

## Configuración híbrida (Admin + modo programa)

- **Panel administrativo → Monitoreo M&E**: metas editables (participantes, cohortes, % finalización, % mejora), guardadas en el navegador del administrador y aplicadas a KPIs e informes. Incluye un **generador de enlaces por cohorte** con los tres momentos (`baseline`, `final`, `followup`) listos para copiar.
- **Web pública → Propuestas de acción**:
  - Nuevo formato **Protocolo UY–EE. UU.** en el constructor de acuerdos, con parámetros configurables (institución/cohorte, horizonte de revisión 30/60/90 días y evidencia práctica comprometida).
  - **Kit de taller y facilitación** configurable (destinatarios, duración, enfoque) con guía en 4 momentos y enlaces de cohorte, descargable en `.md`.
  - En la web abierta ambos paneles quedan plegados; al ingresar con un enlace de programa se abren automáticamente y el acuerdo pasa a formato binacional con la cohorte precargada.

## Siguientes etapas

1. Identificación y contacto con socio/especialista de EE. UU. (ej. Stanford HAI, Berkman Klein, IES/ED labs).
2. Formulación del dossier institucional para la organización sin fines de lucro postulante uruguaya (previo al vencimiento del 25 de noviembre de 2026).
3. Preparación de preguntas para la sesión informativa de Alianza (11 de noviembre a las 15:00).

El nombre del programa es de trabajo y no implica patrocinio, selección ni asociación oficial con la Embajada de los Estados Unidos o la Alianza Cultural.
