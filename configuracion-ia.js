/* ========================================
   IA EDUCATIVA ANEP - SCRIPT PRINCIPAL
   Configuración y lógica del cuestionario
   ======================================== */

/* ========================================
   CONFIGURACIÓN BASADA EN DOCUMENTO ANEP
   ======================================== */
const CONFIG = {
  debug: false,
  schemaVersion: '2026-06-17.1',
  apiBaseUrl: 'https://iag-etica-api.suscripcionessh.workers.dev',
  get dataEndpoint() {
    return `${this.apiBaseUrl}/events`;
  },
  get chatEndpoint() {
    return `${this.apiBaseUrl}/chat`;
  },
  get statsEndpoint() {
    return `${this.apiBaseUrl}/stats`;
  },
  get opinionsEndpoint() {
    return `${this.apiBaseUrl}/opinions`;
  },

  // Escala Likert alineada a documento ANEP
likert: [
  { 
    id: 'Amplio margen de mejora', 
    min: 0, 
    max: 20, 
    desc: 'Las prácticas muestran un uso inicial y poco sistemático. Es un buen punto de partida para comenzar a incorporar verificaciones y criterios más consistentes.',
    color: '#dbeafe'
  },
  { 
    id: 'En proceso inicial', 
    min: 21, 
    max: 40, 
    desc: 'Se reconocen algunas buenas prácticas, aunque todavía falta incorporarlas con regularidad. Hay espacio para reforzar revisión, contraste de información y decisiones más informadas.',
    color: '#bfdbfe'
  },
  { 
    id: 'Desarrollo progresivo', 
    min: 41, 
    max: 60, 
    desc: 'Se evidencia un avance claro: se combinan decisiones razonadas y uso cuidadoso. Aún queda margen para afinar criterios y fortalecer la autonomía en el proceso.',
    color: '#93c5fd'
  },
{ 
  id: 'Prácticas consolidadas', 
  min: 61, max: 80, 
  desc: 'Se integra la herramienta con criterio. El trabajo muestra una lectura madura y, según los marcos de FING, ANEP, Udelar y Ceibal, se evidencia una validación activa de los resultados.',
  color: '#60a5fa'
},
{ 
  id: 'Nivel avanzado', 
  min: 81, max: 100, 
  desc: 'Uso sólido y crítico. Se aporta valor personal, se documenta el proceso (prompts/validaciones) y se mantiene la autoría humana como eje central.',
  color: '#ffffff'
}


],

 // Árbol de decisiones por perfil
  perfiles: {
    docente: {
      inicio: 'd1',
      nodos: {
        d1: { 
          title: '¿Definís reglas claras de uso de IA en tus cursos?',
          help: 'Establecés cuándo, cómo y con qué límites se puede usar IA. Incluye citación y transparencia.',
          context: 'Según ANEP: "Es esencial establecer círculos virtuosos". Fing 2026 añade: "Es necesario establecer restricciones claras sobre el uso de la IA en cada tarea".',
          gainYes: 14, 
          gainNo: 0, 
          onYes: 'd2', 
          onNo: 'd2',
          anepRef: 'ANEP Sección 6 / Fing Pág. 6'
        },
        d2: { 
          title: '¿Explicás el valor agregado específico de la IA a tus estudiantes?',
          help: 'Claridad en borradores, ideación, mejora de expresión, sin sustituir el pensamiento crítico.',
          context: 'ANEP: "Prepararlos como ciudadanos informados". Fing: "Reconocer el potencial de la IA como herramienta capaz de asistir en diversas actividades".',
          gainYes: 10, 
          gainNo: 2, 
          onYes: 'df1', // Salto a nuevo nodo Fing
          onNo: 'df1',
          anepRef: 'ANEP Introducción / Fing Pág. 1'
        },
        // --- NUEVOS NODOS FING INYECTADOS ---
        df1: {
          title: '¿Fomentás que el estudiante domine la IA como herramienta profesional de la disciplina?',
          help: 'La IA no solo como apoyo escolar, sino como una competencia técnica indispensable para su futuro ejercicio profesional.',
          context: 'Guía Fing 2026: "¿Se busca que el/la estudiante domine la IA como herramienta profesional en la disciplina?"',
          gainYes: 12, 
          gainNo: 0, 
          onYes: 'df2', 
          onNo: 'df2',
          anepRef: 'Guía Fing 2026 - Pág. 6'
        },
        df2: {
          title: '¿Tus actividades permiten verificar el proceso de pensamiento y no solo el resultado?',
          help: 'Evitar el efecto "caja negra". Evaluar cómo se llegó a la solución, solicitando por ejemplo la entrega de los prompts o la justificación de decisiones.',
          context: 'Fing recomienda: "Exigir documentación detallada del proceso y decisiones (prompts, validaciones, versiones de IA)".',
          gainYes: 14, 
          gainNo: 0, 
          onYes: 'g1', // Volvemos al tronco común
          onNo: 'g1',
          anepRef: 'Guía Fing 2026 - Pág. 7'
        },
        // --- TRONCO COMPARTIDO ---
        g1: { 
          title: '¿Verificás la información generada por IA antes de usarla?',
          help: 'Contrastás con fuentes confiables, académicas, evidencia empírica.',
          context: 'ANEP advierte sobre "alucinaciones". Fing coincide: la efectividad de los detectores es reducida, la validación humana es la única garantía.',
          gainYes: 16, 
          gainNo: 0, 
          onYes: 'g2', 
          onNo: 'g1b',
          anepRef: 'ANEP Sección 6 / Fing Pág. 6'
        },
        g1b: { 
          title: '¿Si no verificás sistemáticamente, advertís sobre las limitaciones?',
          help: 'Transparencia mínima sobre posibles errores y sesgos de la IA.',
          context: 'La transparencia es un pilar. Fing señala que incluso herramientas pagas tienen margen de error.',
          gainYes: 8, 
          gainNo: 0, 
          onYes: 'g2', 
          onNo: 'g2',
          anepRef: 'ANEP Sección 4'
        },
        g2: { 
          title: '¿Reconocés y trabajás con posibles sesgos de la IA?',
          help: 'Sesgos de datos, representación, culturales. Estrategias de mitigación.',
          context: 'ANEP: "Las tecnologías son espacios de disputa". Fing: "Evaluar riesgos y consideraciones éticas asociadas".',
          gainYes: 18, 
          gainNo: 0, 
          onYes: 'g3', 
          onNo: 'g3',
          anepRef: 'ANEP Sección 6 / Fing Pág. 6'
        },
        g3: { 
          title: '¿Declarás autoría y asistencia de IA cuando corresponde?',
          help: 'Diferenciás claramente qué es producción humana y qué proviene de IA.',
          context: 'ANEP: Espectro de uso. Fing: "Debe verificarse que el trabajo sea original y no una mera reproducción".',
          gainYes: 14, 
          gainNo: 0, 
          onYes: 'g4', 
          onNo: 'g4',
          anepRef: 'ANEP Sección 4 / Fing Pág. 6'
        },
        g4: { 
          title: '¿Añadís aportes personales y criterios propios al usar IA?',
          help: 'Síntesis, contextualización, ejemplos situados, análisis crítico.',
          context: 'ANEP: Reforzar la importancia de la ética. Fing: Mantener la autoría propia sobre el código o redacción final.',
          gainYes: 14, 
          gainNo: 0, 
          onYes: 'd3', 
          onNo: 'd3',
          anepRef: 'ANEP Sección 6 / Fing Pág. 7'
        },
        d3: { 
          title: '¿Evaluás conocimientos previos del grupo antes de proponer IA?',
          help: 'Si no hay base conceptual, priorizar andamiaje humano antes de IA.',
          context: 'ANEP: Nuevas secuencias didácticas. Fing: ¿La IA podría impedir la comprensión de conceptos base?',
          gainYes: 12, 
          gainNo: 2, 
          onYes: 'FIN', 
          onNo: 'FIN',
          anepRef: 'ANEP Sección 6 / Fing Pág. 6'
        }
      }
    },

    estudiante: {
      inicio: 'e1',
      nodos: {
        e1: { 
          title: '¿Conocés y respetás las reglas de uso de IA de tu curso?',
          help: 'Política institucional y de tu asignatura sobre uso de herramientas de IA.',
          context: 'ANEP indica: "Fomentar una comprensión clara de la IA".',
          gainYes: 10, gainNo: 0, onYes: 'e2', onNo: 'e2',
          anepRef: 'Sección 6 - Ciudadanía digital'
        },
        e2: { 
          title: '¿Identificás un aporte específico de la IA a tu tarea?',
          help: 'Claridad de expresión, ideación, contraste de ideas, accesibilidad.',
          context: 'Marco ANEP: "Ofrecer experiencias de aprendizaje personalizadas".',
          gainYes: 12, gainNo: 2, onYes: 'g1', onNo: 'g1',
          anepRef: 'Sección 4 - Aprendizaje personalizado'
        },
        g1: { 
          title: '¿Verificás los resultados de la IA con fuentes confiables?',
          help: 'Materiales del curso, libros, artículos académicos, evidencia.',
          context: 'ANEP advierte: "Riesgo importante de alucinaciones".',
          gainYes: 16, gainNo: 0, onYes: 'g2', onNo: 'g1b',
          anepRef: 'Sección 6 - Alucinaciones'
        },
        g1b: { 
          title: '¿Si no verificás, señalás esa limitación en tu trabajo?',
          help: 'Transparencia mínima sobre falta de validación.',
          context: 'La transparencia es clave para analizar críticamente.',
          gainYes: 8, gainNo: 0, onYes: 'g2', onNo: 'g2',
          anepRef: 'Sección 6 - Pensamiento crítico'
        },
        g2: { 
          title: '¿Pensás en posibles sesgos de la IA y cómo mitigarlos?',
          help: 'Sesgos de datos, representación, confirmación, culturales.',
          context: 'ANEP: "Navegar por estos territorios digitales con discernimiento".',
          gainYes: 18, gainNo: 0, onYes: 'g3', onNo: 'g3',
          anepRef: 'Sección 6 - Navegación crítica'
        },
        g3: { 
          title: '¿Dejás claro qué parte es tu trabajo y qué proviene de IA?',
          help: 'Autoría transparente, citas, marcas de asistencia.',
          context: 'ANEP presenta un espectro de uso. La transparencia es esencial.',
          gainYes: 14, gainNo: 0, onYes: 'g4', onNo: 'g4',
          anepRef: 'Sección 4 - Espectro de uso'
        },
        g4: { 
          title: '¿Incorporás aportes personales (síntesis, ejemplos, crítica)?',
          help: 'Construcción propia, no copia literal. Valor agregado humano.',
          context: 'ANEP: "Desarrollar un fuerte sentido de responsabilidad".',
          gainYes: 14, gainNo: 0, onYes: 'e3', onNo: 'e3',
          anepRef: 'Sección 6 - Responsabilidad'
        },
        e3: { 
          title: '¿Tenés base de conocimientos del tema antes de usar IA?',
          help: 'Sin base conceptual, primero aprender fundamentos.',
          context: 'ANEP recomienda equipar con habilidades críticas de resolución de problemas.',
          gainYes: 12, gainNo: 2, onYes: 'FIN', onNo: 'FIN',
          anepRef: 'Sección 6 - Habilidades críticas'
        }
      }
    },

    estudiante_media: {
      inicio: 'em1',
      nodos: {
        em1: { 
          title: '¿Usás IA para hacer tareas o trabajos domiciliarios?',
          help: 'Incluye resúmenes, redacción de textos o ideas para trabajos.',
          context: 'ANEP advierte evitar el copiado acrítico.',
          gainYes: 10, gainNo: 4, onYes: 'em2', onNo: 'em2',
          anepRef: 'Sección 6'
        },
        em2: { 
          title: '¿Intentás entender el procedimiento y no solo la respuesta?',
          help: 'Pedís explicación paso a paso o comparás con lo visto en clase.',
          context: 'La IA debe apoyar la comprensión, no sustituir el esfuerzo.',
          gainYes: 14, gainNo: 0, onYes: 'g1', onNo: 'g1',
          anepRef: 'Sección 4'
        },
        g1: { 
          title: '¿Verificás los resultados de la IA con fuentes confiables?',
          help: 'Libros, cuadernos o explicaciones del docente.',
          context: 'Riesgo de alucinaciones en preguntas factuales.',
          gainYes: 16, gainNo: 0, onYes: 'g2', onNo: 'g1b',
          anepRef: 'Sección 6'
        },
        g1b: { 
          title: '¿Si no verificás, avisás que la información proviene de IA?',
          help: 'Aclarar que no pudiste contrastar todo.',
          context: 'La transparencia es clave para identificar errores.',
          gainYes: 8, gainNo: 0, onYes: 'g2', onNo: 'g2',
          anepRef: 'Sección 6'
        },
        g2: { 
          title: '¿Pensás en posibles sesgos de la IA?',
          help: 'Estereotipos en ejemplos o miradas muy parciales.',
          context: 'Aprender a navegar con discernimiento.',
          gainYes: 18, gainNo: 0, onYes: 'g3', onNo: 'g3',
          anepRef: 'Sección 6'
        },
        g3: { 
          title: '¿Dejás claro qué parte hiciste vos y qué parte la IA?',
          help: 'Citar la herramienta o explicitar la ayuda recibida.',
          context: 'ANEP enfatiza la transparencia en las producciones.',
          gainYes: 14, gainNo: 0, onYes: 'g4', onNo: 'g4',
          anepRef: 'Sección 4'
        },
        g4: { 
          title: '¿Agregás ejemplos, opiniones o análisis propios?',
          help: 'Relacionarlo con experiencias de clase o situaciones personales.',
          context: 'Importancia del valor agregado humano.',
          gainYes: 14, gainNo: 0, onYes: 'em3', onNo: 'em3',
          anepRef: 'Sección 6'
        },
        em3: { 
          title: '¿Consultás con tu docente sobre si es adecuado usar IA?',
          help: 'Pedir orientación antes de diseñar la tarea.',
          context: 'Necesidad de diálogo pedagógico y acuerdos claros.',
          gainYes: 12, gainNo: 2, onYes: 'FIN', onNo: 'FIN',
          anepRef: 'Sección 6'
        }
      }
    },

    estudiante_universitaria: {
      inicio: 'eu1',
      nodos: {
        eu1: { 
          title: '¿Usás IA para trabajos académicos?',
          help: 'Informes, ensayos, proyectos de investigación.',
          context: 'Prestar atención a la autoría e integridad académica.',
          gainYes: 12, gainNo: 4, onYes: 'eu2', onNo: 'eu2',
          anepRef: 'UNESCO'
        },
        eu2: { 
          title: '¿Citás explícitamente la asistencia de IA?',
          help: 'Indicar herramienta y uso en metodología o nota al pie.',
          context: 'Necesidad de trazabilidad en producciones académicas.',
          gainYes: 16, gainNo: 0, onYes: 'g1', onNo: 'g1',
          anepRef: 'ANEP Sección 4'
        },
        g1: { 
          title: '¿Contrastás lo generado con bibliografía académica?',
          help: 'Artículos, libros, bases de datos científicas.',
          context: 'Verificación rigurosa en alta exigencia académica.',
          gainYes: 18, gainNo: 0, onYes: 'g2', onNo: 'g1b',
          anepRef: 'Sección 6'
        },
        g1b: { 
          title: '¿Si no podés verificar todo, aclarás los límites?',
          help: 'Señalar partes con menor grado de verificación.',
          context: 'Parte de la ética de la investigación universitaria.',
          gainYes: 10, gainNo: 0, onYes: 'g2', onNo: 'g2',
          anepRef: 'UNESCO'
        },
        g2: { 
          title: '¿Revisás posibles sesgos en temas sensibles?',
          help: 'Género, raza, contextos culturales, salud.',
          context: 'La IA puede amplificar discriminaciones.',
          gainYes: 18, gainNo: 0, onYes: 'g3', onNo: 'g3',
          anepRef: 'UNESCO'
        },
        g3: { 
          title: '¿Integrás tu propia lectura crítica y discusión teórica?',
          help: 'Argumentar y adoptar una posición fundamentada.',
          context: 'Se espera un trabajo intelectual profundo.',
          gainYes: 16, gainNo: 0, onYes: 'g4', onNo: 'g4',
          anepRef: 'ANEP'
        },
        g4: { 
          title: '¿Acordás con docentes cómo está permitido usar IA?',
          help: 'Revisar programas y rúbricas específicas.',
          context: 'Cultura de integridad académica.',
          gainYes: 14, gainNo: 0, onYes: 'eu3', onNo: 'eu3',
          anepRef: 'ANEP'
        },
        eu3: { 
          title: '¿Reflexionás sobre cómo la IA impacta en tu formación?',
          help: '¿La herramienta potencia o debilita tu capacidad de investigar?',
          context: 'Construir autonomía y criterio profesional.',
          gainYes: 12, gainNo: 2, onYes: 'FIN', onNo: 'FIN',
          anepRef: 'ANEP / UNESCO'
        }
      }
    },

    estudiante_formacion: {
      inicio: 'ef1',
      nodos: {
        ef1: { 
          title: '¿Usás IA para diseñar actividades o materiales?',
          help: 'Ideas de consignas o explicaciones para tus futuros alumnos.',
          context: 'La IA vinculada al rol de mediador pedagógico.',
          gainYes: 14, gainNo: 4, onYes: 'ef2', onNo: 'ef2',
          anepRef: 'ANEP'
        },
        ef2: { 
          title: '¿Evaluás si las propuestas respetan el contexto y diversidad?',
          help: 'Analizar si las sugerencias son inclusivas y realistas.',
          context: 'Importancia del contexto y la equidad.',
          gainYes: 16, gainNo: 0, onYes: 'g1', onNo: 'g1',
          anepRef: 'Sección 6'
        },
        g1: { 
          title: '¿Contrastás con bibliografía didáctica y currículo?',
          help: 'Programas oficiales y propuestas de ANEP.',
          context: 'Articular la IA con los marcos vigentes.',
          gainYes: 18, gainNo: 0, onYes: 'g2', onNo: 'g1b',
          anepRef: 'ANEP'
        },
        g1b: { 
          title: '¿Si tomás ideas de IA, lo dejás claro en tu planificación?',
          help: 'Reconocer origen y cambios personales realizados.',
          context: 'Centralidad de la reflexión en formación inicial.',
          gainYes: 10, gainNo: 0, onYes: 'g2', onNo: 'g2',
          anepRef: 'ANEP'
        },
        g2: { 
          title: '¿Analizás cómo los sesgos afectan a tus futuros estudiantes?',
          help: 'Lenguaje excluyente o ausencia de realidades locales.',
          context: 'El rol docente incluye generar alternativas pedagógicas.',
          gainYes: 18, gainNo: 0, onYes: 'g3', onNo: 'g3',
          anepRef: 'UNESCO'
        },
        g3: { 
          title: '¿Tus secuencias mantienen el lugar central del estudiante?',
          help: 'Evitar que la IA haga todo; priorizar pensamiento crítico.',
          context: 'Construcción colectiva en el aula.',
          gainYes: 16, gainNo: 0, onYes: 'g4', onNo: 'g4',
          anepRef: 'Sección 6'
        },
        g4: { 
          title: '¿Compartís con docentes de práctica cómo usás la IA?',
          help: 'Abrir el tema en tutorías para recibir orientación ética.',
          context: 'Comunidad profesional de aprendizaje.',
          gainYes: 14, gainNo: 0, onYes: 'ef3', onNo: 'ef3',
          anepRef: 'ANEP'
        },
        ef3: { 
          title: '¿Te preguntás cómo modelarás el uso responsable de IA?',
          help: 'El ejemplo que das como referente en ética digital.',
          context: 'Rol docente y ciudadanía digital.',
          gainYes: 12, gainNo: 2, onYes: 'FIN', onNo: 'FIN',
          anepRef: 'ANEP'
        }
      }
    }
  },
  


  // Acuerdos didácticos del documento ANEP
  acuerdos: [
    { 
      text: 'Establecer reglas claras sobre cuándo, cómo y con qué límites usar IA',
      ref: 'Adaptación de métodos de evaluación'
    },
    { 
      text: 'Requerir verificación y trazabilidad de fuentes (citas, evidencias)',
      ref: 'Evaluación resistente a IA'
    },
    { 
      text: 'Declarar autoría y nivel de asistencia de IA en producciones',
      ref: 'Transparencia en algoritmos'
    },
    { 
      text: 'Diseñar tareas con valor agregado humano (análisis, síntesis, contexto)',
      ref: 'Habilidades de orden superior'
    },
    { 
      text: 'Considerar protección de datos y edad del alumnado',
      ref: 'Consideraciones éticas'
    },
    { 
      text: 'Trabajar detección y mitigación de sesgos como competencia transversal',
      ref: 'Conciencia crítica'
    },
    {
   ref: 'Bitácora de IA y Prompts',
  text: 'Para garantizar la autoría, se recomienda solicitar a los estudiantes una breve "bitácora de uso", donde detallen qué prompts usaron, qué versión de IA y cómo validaron que la respuesta fuera correcta.',
  
}
    
  ],

  // Herramientas sugeridas (modo educativo)
  herramientas: [
    { 
      name: 'Asistentes con modo educativo',
      desc: 'Interfaces que promueven verificación, citas y transparencia',
      url: 'https://notebooklm.google.com/'
    },
    { 
      name: 'Búsqueda académica y citación',
      desc: 'Recursos para localizar, organizar y citar fuentes verificables',
      url: 'https://www.zotero.org/'
    },
    { 
      name: 'Revisión crítica de sesgos',
      desc: 'Apoyos para detectar señales de sesgo, toxicidad o problemas de equidad',
      url: 'https://perspectiveapi.com/'
    },
    { 
      name: 'Plataformas de prompts éticos',
      desc: 'Enseñan a formular consultas que promuevan pensamiento crítico',
      url: 'https://platform.openai.com/docs/guides/prompt-engineering'
    }
  ]
};

/* ========================================
   CONTENIDO DE PRINCIPIOS UNESCO / ANEP / Udelar / Ceibal
   ======================================== */


/* ========================================
   CONTENIDO DE PRINCIPIOS UNESCO / ANEP / Udelar / Ceibal
   - Texto breve + citas textuales de ambos documentos
   - Usado por el tooltip de las cards
   ======================================== */

const PRINCIPLES_CONTENT = {
  verificacion: {
    title: 'Verificación',
    unesco: `
      <p><strong>UNESCO</strong></p>
      <p>“Las decisiones y resultados producidos por los sistemas de IA deben poder <strong>ser verificados</strong>, y debe proporcionarse información suficiente para permitir que tales decisiones sean comprendidas y cuestionadas por las personas afectadas”.</p>
      <p><em>Recomendación sobre la ética de la IA, principio de transparencia y explicabilidad.</em></p>
      <p>En educación esto implica contrastar las respuestas de la IA con fuentes confiables y juicio profesional.</p>
    `,
    anep: `
      <p><strong>ANEP</strong></p>
      <p>“El uso indiscriminado de LLM para responder preguntas factuales implica un riesgo importante…”</p>
      <p>“Fomentar el pensamiento crítico […] se torna impostergable”.</p>
      <p><em>La inteligencia artificial en la educación, sección 6. Recomendaciones para el futuro.</em></p>
      <p>Por eso se espera que estudiantes y docentes verifiquen la información generada por IA antes de utilizarla en evaluaciones o producciones.</p>
    `,
    udelar: `
      <p><strong>Udelar</strong></p>
      <p>Entre los 11 principios rectores aprobados por Udelar aparecen transparencia y explicabilidad, seguridad y gestión de riesgos, ética e imparcialidad, formación de capacidades y participación.</p>
      <p>En la herramienta, verificar significa conservar evidencia suficiente para explicar cómo se obtuvo, revisó y transformó una respuesta generada por IA.</p>
    `,
    ceibal: `
      <p><strong>Ceibal</strong></p>
      <p>La guía de uso ético de IA recomienda verificar siempre la información, porque los sistemas pueden cometer errores, inventar datos u ofrecer información incompleta.</p>
      <p>También pide revisar y adaptar los contenidos generados al nivel, lenguaje, intereses y realidad concreta del grupo.</p>
    `
  },
  transparencia: {
    title: 'Transparencia',
    unesco: `
      <p><strong>UNESCO</strong></p>
      <p>“Las personas deberán ser informadas cuando estén interactuando con un sistema de IA y deberán comprender el papel que ese sistema desempeña en la toma de decisiones”.</p>
      <p>“Las interacciones mediadas por IA deben ser claramente diferenciables de las humanas”.</p>
      <p><em>Recomendación sobre la ética de la IA, transparencia y explicabilidad.</em></p>
    `,
    anep: `
      <p><strong>ANEP</strong></p>
      <p>“Fomentar una comprensión clara de la IA […] implica enseñar a los estudiantes a <strong>diferenciar</strong> entre la información generada por IA y la creada por humanos”.</p>
      <p><em>La inteligencia artificial en la educación, sección 6.</em></p>
      <p>En tareas y evaluaciones se espera declarar qué partes fueron asistidas por IAG y cuál es el aporte personal.</p>
    `,
    udelar: `
      <p><strong>Udelar</strong></p>
      <p>Udelar incluye transparencia y explicabilidad, autonomía académica y control humano, además de derechos de autor y protección de datos.</p>
      <p>Esto implica declarar herramientas, finalidades, límites de uso, fuentes consultadas y decisiones humanas tomadas durante la producción.</p>
    `,
    ceibal: `
      <p><strong>Ceibal</strong></p>
      <p>Ceibal plantea ser transparente en el uso: aclarar cuándo y cómo se utiliza IA para generar materiales, actividades o propuestas pedagógicas fortalece la confianza.</p>
      <p>La transparencia convierte el uso de IA en una práctica conversable y evaluable, no en una delegación invisible.</p>
    `
  },
  sesgos: {
    title: 'Sesgos',
    unesco: `
      <p><strong>UNESCO</strong></p>
      <p>“Los sistemas de IA no deben perpetuar ni amplificar sesgos […]; deberán tomarse medidas activas para identificar, mitigar y corregir discriminaciones”.</p>
      <p><em>Recomendación sobre la ética de la IA, principio de equidad y no discriminación.</em></p>
      <p>En el aula esto supone revisar críticamente ejemplos y respuestas de la IA para evitar estereotipos y exclusiones.</p>
    `,
    anep: `
      <p><strong>ANEP</strong></p>
      <p>“Los algoritmos de IA a veces emiten resultados que no se originan en los datos de entrenamiento y los interpretan de forma incorrecta […] generando resultados inesperados o erróneos”.</p>
      <p><em>La inteligencia artificial en la educación, sección 6.</em></p>
      <p>Detectar y discutir estos errores con el grupo es parte del trabajo sobre sesgos y ciudadanía digital crítica.</p>
    `,
    udelar: `
      <p><strong>Udelar</strong></p>
      <p>Los principios de equidad y no discriminación, ética e imparcialidad, participación y sostenibilidad permiten leer los sesgos como problema pedagógico e institucional.</p>
      <p>Una práctica sólida pregunta a quién beneficia, a quién perjudica y qué supuestos quedan naturalizados en la respuesta generada.</p>
    `,
    ceibal: `
      <p><strong>Ceibal</strong></p>
      <p>Ceibal advierte que los modelos pueden reflejar prejuicios o miradas parciales. Por eso recomienda revisar los contenidos para asegurar un enfoque inclusivo, diverso y respetuoso.</p>
      <p>La revisión de sesgos debe considerar también brechas de acceso, accesibilidad y condiciones reales del grupo.</p>
    `
  },
  valor_agregado: {
    title: 'Valor agregado',
    unesco: `
      <p><strong>UNESCO</strong></p>
      <p>“Los sistemas de IA deben servir para complementar la capacidad humana, no para sustituirla, manteniendo el control humano significativo”.</p>
      <p><em>Recomendación sobre la ética de la IA, participación y agencia humana.</em></p>
      <p>La IA tiene sentido educativo cuando expande oportunidades de aprendizaje y no reemplaza el trabajo intelectual del estudiante.</p>
    `,
    anep: `
      <p><strong>ANEP</strong></p>
      <p>“Todos los matices entre lo generado por IA y lo creado por un ser humano pueden enriquecer los procesos de aprendizaje, pero ello no implica la eliminación del componente humano en el proceso”.</p>
      <p><em>La inteligencia artificial en la educación, sección 4.</em></p>
      <p>Las producciones deberían mostrar ejemplos, análisis y decisiones propias: la IA apoya, pero el valor educativo lo aporta la mirada pedagógica.</p>
    `,
    udelar: `
      <p><strong>Udelar</strong></p>
      <p>Udelar combina centralidad de la persona humana, control humano, autonomía académica, formación de capacidades y participación.</p>
      <p>Desde esos principios, la IAG potencia el trabajo cuando amplía el pensamiento, no cuando sustituye la responsabilidad intelectual y pedagógica.</p>
    `,
    ceibal: `
      <p><strong>Ceibal</strong></p>
      <p>Ceibal propone usar la IA como apoyo y nunca sin revisión y análisis. La persona sigue siendo responsable de los contenidos que decide utilizar.</p>
      <p>El valor agregado aparece cuando la IA sirve como punto de partida para analizar, comparar, debatir y reflexionar.</p>
    `
  },
autoria: {
  title: 'Autoría e Integridad',
  anep: `<p>ANEP sugiere un espectro de uso donde el docente define el nivel de intervención de la IA.</p>`,
  fing: `
    <p><strong>Marco Fing 2026:</strong></p>
    <ul>
      <li>Se debe exigir que el trabajo sea original y no una mera reproducción.</li>
      <li>Es fundamental que el estudiante pueda explicar su proceso de pensamiento tras la entrega.</li>
      <li>Se recomienda la documentación detallada de las decisiones tomadas durante la interacción con la IA.</li>
    </ul>
  `
}



  
};


/* ========================================
   ESTADO DE LA APLICACIÓN
   ======================================== */


/* ========================================
   ACTUALIZACIÓN DEL STATE EN configuracion-ia.js
   
   Agregá esto al objeto state existente:
   ======================================== */

const state = {
  profile: null,        // docente | estudiante | especializado
  profileKey: null,     // docente, estudiante_media, etc.
  name: '',
  currentId: null,      // ID de la pregunta actual
  path: [],             // Historial de respuestas
  evidence: 0,          // Puntaje acumulado
  currentSlide: 0,
  country: 'Uruguay',
  nivelEducativo: '',
  familiaridadInicial: '',
  recursosSimilares: '',
  consentTracking: false,
  activeResultTab: 'sintesis',
  agreementFormat: 'aula'
};

window.state = state;
window.CONFIG = CONFIG;
