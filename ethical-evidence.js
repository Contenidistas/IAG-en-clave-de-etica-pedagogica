// Pedagogical interpretation of the questions, not an official framework score.
// Map by profile + question ID; shared IDs do not always ask the same thing.
(function () {
  const association = (axes, reason, kind = 'practice') => ({ axes, reason, kind });
  const shared = {
    g1: association(['verificacion'], 'Contrastar una respuesta con fuentes permite revisar su validez.'),
    g1b: { ...association(['transparencia', 'verificacion'], 'Reconocer límites hace transparente qué información necesita contraste; no prueba que se haya verificado.'), contextAxes: ['verificacion'] },
    g2: association(['equidad'], 'Examinar sesgos permite considerar a quién beneficia o perjudica una respuesta.'),
    g3: association(['transparencia'], 'Declarar la asistencia distingue los aportes propios de los generados por IA.'),
    g4: association(['agencia'], 'El análisis y los aportes propios mantienen la responsabilidad humana sobre el trabajo.')
  };
  const maps = {
    docente: {
      ...shared,
      d1: association(['transparencia'], 'Los acuerdos hacen explícitos los usos permitidos y sus límites.'),
      d2: association(['agencia'], 'Explicar para qué se usa IA permite valorar su aporte al aprendizaje.'),
      df1: association(['agencia'], 'Dominar una herramienta implica comprender y decidir cómo utilizarla.'),
      df2: association(['agencia', 'verificacion'], 'Revisar el proceso permite reconocer el razonamiento propio y contrastar cómo se obtuvo el resultado.'),
      d3: association(['agencia'], 'Considerar conocimientos previos ayuda a que la asistencia no sustituya la comprensión.')
    },
    estudiante: {
      ...shared,
      e1: association(['transparencia'], 'Conocer los acuerdos permite usar y declarar la IA según la tarea.'),
      e2: association(['agencia'], 'Identificar su aporte permite decidir para qué conviene utilizar IA.'),
      e3: association(['agencia'], 'Una base conceptual permite comprender y juzgar la asistencia recibida.')
    },
    estudiante_media: {
      ...shared,
      em1: association(['agencia'], 'El uso declarado sitúa el recorrido; usar o no usar IA no determina por sí solo una práctica ética.', 'context'),
      em2: association(['agencia'], 'Comprender el procedimiento conserva el trabajo intelectual propio.'),
      em3: association(['transparencia'], 'Conversar con el docente permite aclarar las condiciones de uso.')
    },
    estudiante_universitaria: {
      ...shared,
      eu1: association(['agencia'], 'Esta respuesta describe el uso de IA, no la calidad ética de ese uso.', 'context'),
      eu2: association(['transparencia'], 'Reconocer la asistencia permite distinguir el origen de los aportes.'),
      g3: association(['agencia'], 'La lectura crítica y la discusión teórica mantienen la elaboración propia.'),
      g4: association(['transparencia'], 'Acordar los usos explicita las condiciones del trabajo académico.'),
      eu3: association(['agencia'], 'Revisar el impacto en la formación permite tomar decisiones conscientes.')
    },
    estudiante_formacion: {
      ...shared,
      ef1: association(['agencia'], 'Usar o proyectar usar IA describe el contexto; no prueba una fortaleza ni una dificultad ética.', 'context'),
      ef2: association(['equidad'], 'La pertinencia local y la diversidad permiten revisar a quiénes contempla una propuesta.'),
      g1b: association(['transparencia'], 'Explicar cómo y para qué se usó IA hace visible la asistencia.'),
      g3: association(['agencia'], 'Un rol activo y reflexivo del estudiante preserva su participación intelectual.'),
      g4: association(['transparencia', 'agencia'], 'Conversar sobre límites permite construir acuerdos y asumir decisiones pedagógicas.'),
      ef3: association(['agencia', 'transparencia'], 'Modelar un uso crítico y honesto implica asumir responsabilidad y hacer visible la asistencia.')
    }
  };
  for (const [profile, questions] of Object.entries(maps)) {
    for (const [id, evidence] of Object.entries(questions)) {
      const node = window.CONFIG.perfiles[profile]?.nodos[id];
      if (node) node.ethicalEvidence = evidence;
    }
  }
})();

function evidenciaDePaso(step) {
  const node = CONFIG.perfiles[state.profileKey]?.nodos[step.id];
  return node?.ethicalEvidence || {
    axes: step.criterionIds || (step.criterionId ? [step.criterionId] : []),
    reason: step.associationReason || '', kind: step.evidenceKind || 'practice'
  };
}

function pasosDeCriterio(id) {
  return state.path.filter(step => evidenciaDePaso(step).axes.includes(id));
}

// Short paraphrases, verified against the linked primary sources.
const ETHICAL_FRAMEWORK_GUIDANCE = {
  transparencia: {
    basis: 'La guía FING propone reconocer la asistencia de IA y comunicar las condiciones de uso de cada actividad.',
    action: 'Acordá qué usos están permitidos y agregá una breve declaración de la herramienta y de tu aporte propio.',
    sources: [{ label: 'FING · Declaración y comunicación (secciones 4–5)', url: 'https://www.fing.edu.uy/sites/default/files/2026-02/guia-de-etica-fing_2026.pdf#page=4' }]
  },
  verificacion: {
    basis: 'ANEP señala el riesgo de alucinaciones y la necesidad del pensamiento crítico. FING recomienda contrastar fuentes y revisar su confiabilidad.',
    action: 'Elegí una afirmación central, contrastala con una fuente pertinente y registrá qué corregiste o qué sigue sin verificar.',
    sources: [{ label: 'ANEP · Recomendaciones (sección 6)', url: 'https://www.anep.edu.uy/sites/default/files/images/2024/noticias/julio/240709/Documento%20IA.pdf#page=16' }, { label: 'FING · Capacidad crítica (sección 2)', url: 'https://www.fing.edu.uy/sites/default/files/2026-02/guia-de-etica-fing_2026.pdf#page=2' }]
  },
  privacidad: {
    basis: 'La orientación de UNESCO aborda los riesgos para la privacidad de datos y propone un uso centrado en las personas.',
    action: 'Antes de enviar información a una IA, revisá si contiene datos personales y si podés trabajar con ejemplos ficticios o anonimizados.',
    sources: [{ label: 'UNESCO · Orientación sobre IA generativa', url: 'https://www.unesco.org/en/articles/guidance-generative-ai-education-and-research' }]
  },
  equidad: {
    basis: 'UNESCO considera la inclusión y la diversidad; FING advierte que el acceso desigual a herramientas pagas puede ampliar brechas.',
    action: 'Revisá a quién deja afuera la propuesta y ofrecé una alternativa que no dependa de una herramienta paga.',
    sources: [{ label: 'UNESCO · Inclusión y diversidad', url: 'https://www.unesco.org/en/articles/guidance-generative-ai-education-and-research' }, { label: 'FING · Acceso desigual (sección 3)', url: 'https://www.fing.edu.uy/sites/default/files/2026-02/guia-de-etica-fing_2026.pdf#page=3' }]
  },
  agencia: {
    basis: 'FING propone conservar la comprensión y el trabajo analítico propio. ANEP destaca la responsabilidad sobre los procesos de aprendizaje.',
    action: 'Explicá con tus palabras una decisión del trabajo y distinguí qué razonaste vos de lo que resolvió la herramienta.',
    sources: [{ label: 'FING · Comprensión y uso de IA (sección 3)', url: 'https://www.fing.edu.uy/sites/default/files/2026-02/guia-de-etica-fing_2026.pdf#page=3' }, { label: 'ANEP · Responsabilidad y pensamiento crítico', url: 'https://www.anep.edu.uy/sites/default/files/images/2024/noticias/julio/240709/Documento%20IA.pdf#page=16' }]
  }
};

// Pedagogical correspondence, not an official Agesic assessment rubric.
const AGESIC_PRINCIPLES_URL = 'https://www.gub.uy/agencia-gobierno-electronico-sociedad-informacion-conocimiento/comunicacion/publicaciones/estrategia-nacional-inteligencia-artificial-uruguay-2024-2030-8';
const AGESIC_AXIS_GUIDANCE = {
  transparencia: { principle: '6 · Transparencia y explicabilidad', text: 'Agesic propone informar sobre el uso de IA y hacer comprensibles sus resultados según el contexto.' },
  verificacion: { principle: '8 · Fiabilidad y seguridad', text: 'Agesic plantea sistemas fiables, seguros y consistentes. En este recorrido lo vinculamos con revisar los resultados antes de utilizarlos; esa práctica no evalúa por sí sola la seguridad del sistema.' },
  privacidad: { principle: '5 · Protección y privacidad de los datos personales', text: 'Agesic sitúa la protección de los datos personales desde el diseño y durante todo el ciclo de vida de la IA.' },
  equidad: { principle: '4 · Equidad y no discriminación', text: 'Agesic propone considerar los impactos diferenciados, prevenir sesgos discriminatorios y favorecer un acceso equitativo a los beneficios de la IA.' },
  agencia: { principle: '3 · Respeto de la dignidad y los derechos humanos', text: 'Agesic destaca la autonomía de las personas y la supervisión humana de los resultados que apoyan decisiones.' }
};
for (const [axis, guidance] of Object.entries(AGESIC_AXIS_GUIDANCE)) {
  ETHICAL_FRAMEWORK_GUIDANCE[axis].agesic = guidance.text;
  ETHICAL_FRAMEWORK_GUIDANCE[axis].sources.push({
    label: `Agesic · Principio ${guidance.principle}`, url: AGESIC_PRINCIPLES_URL
  });
}
