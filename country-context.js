(function () {
  const UNESCO_REFERENCE = {
    label: 'UNESCO',
    title: 'Guía para el uso de IA generativa en educación e investigación',
    url: 'https://www.unesco.org/en/articles/guidance-generative-ai-education-and-research'
  };

  const COUNTRY_OPTIONS = [
    { name: 'Uruguay', flag: '🇺🇾', code: 'uy', featured: true },
    { name: 'República Dominicana', flag: '🇩🇴', code: 'do', featured: true },
    { name: 'Colombia', flag: '🇨🇴', code: 'co', featured: true },
    { name: 'Argentina', flag: '🇦🇷', code: 'ar' },
    { name: 'Bolivia', flag: '🇧🇴', code: 'bo' },
    { name: 'Brasil', flag: '🇧🇷', code: 'br' },
    { name: 'Chile', flag: '🇨🇱', code: 'cl' },
    { name: 'Costa Rica', flag: '🇨🇷', code: 'cr' },
    { name: 'Cuba', flag: '🇨🇺', code: 'cu' },
    { name: 'Ecuador', flag: '🇪🇨', code: 'ec' },
    { name: 'El Salvador', flag: '🇸🇻', code: 'sv' },
    { name: 'Guatemala', flag: '🇬🇹', code: 'gt' },
    { name: 'Honduras', flag: '🇭🇳', code: 'hn' },
    { name: 'México', flag: '🇲🇽', code: 'mx' },
    { name: 'Nicaragua', flag: '🇳🇮', code: 'ni' },
    { name: 'Panamá', flag: '🇵🇦', code: 'pa' },
    { name: 'Paraguay', flag: '🇵🇾', code: 'py' },
    { name: 'Perú', flag: '🇵🇪', code: 'pe' },
    { name: 'Puerto Rico', flag: '🇵🇷', code: 'pr' },
    { name: 'Venezuela', flag: '🇻🇪', code: 've' },
    { name: 'Canadá', flag: '🇨🇦', code: 'ca' },
    { name: 'España', flag: '🇪🇸', code: 'es' },
    { name: 'Estados Unidos', flag: '🇺🇸', code: 'us' },
    { name: 'Portugal', flag: '🇵🇹', code: 'pt' },
    { name: 'Otro', flag: '🌐' }
  ];

  const CONTEXTS = {
    Uruguay: {
      flag: '🇺🇾',
      code: 'uy',
      hasNationalFramework: true,
      title: 'Marcos de Uruguay + UNESCO',
      names: ['ANEP', 'Ceibal', 'Udelar', 'FING', 'Agesic', 'UNESCO'],
      summary: 'El recorrido articula referencias educativas y de política pública uruguayas con la guía internacional de UNESCO.',
      synthesis: 'En Uruguay, ANEP y Ceibal sitúan la ciudadanía digital y el uso crítico de IA en el sistema educativo; FING y Udelar aportan criterios de integridad, transparencia, trazabilidad y responsabilidad académica; Agesic suma principios nacionales de derechos, privacidad, equidad, transparencia y supervisión humana. UNESCO funciona como base internacional común.',
      references: [
        { label: 'Agesic', title: 'Estrategia Nacional de IA 2024–2030', url: 'https://www.gub.uy/agencia-gobierno-electronico-sociedad-informacion-conocimiento/comunicacion/publicaciones/estrategia-nacional-inteligencia-artificial-del-uruguay-2024-2030' },
        { label: 'ANEP', title: 'La inteligencia artificial en la educación', url: 'https://www.anep.edu.uy/sites/default/files/images/2024/noticias/julio/240709/Documento%20IA.pdf' },
        { label: 'FING', title: 'Guía de ética para el uso de IA', url: 'https://www.fing.edu.uy/sites/default/files/2026-02/guia-de-etica-fing_2026.pdf' },
        { label: 'Udelar', title: 'Principios para el uso responsable de IA', url: 'https://fcea.udelar.edu.uy/institucional/novedades/9667-politica-institucional-de-inteligencia-artificial-de-la-universidad-de-la-republica.html' },
        { label: 'Ceibal', title: 'Buenas prácticas para el uso de IA en educación', url: 'https://ceibal.edu.uy/politicas/buenas-practicas-uso-ia-educacion/' },
        UNESCO_REFERENCE
      ],
      axisGuidance: {
        transparencia: {
          basis: 'FING propone reconocer la asistencia de IA y comunicar las condiciones de uso de cada actividad.',
          note: 'Agesic vincula la transparencia con informar sobre el uso de IA y hacer comprensibles sus resultados según el contexto.',
          sources: [
            { label: 'FING · Declaración y comunicación', url: 'https://www.fing.edu.uy/sites/default/files/2026-02/guia-de-etica-fing_2026.pdf#page=4' },
            { label: 'Agesic · Transparencia y explicabilidad', url: 'https://www.gub.uy/agencia-gobierno-electronico-sociedad-informacion-conocimiento/comunicacion/publicaciones/estrategia-nacional-inteligencia-artificial-uruguay-2024-2030-8' }
          ]
        },
        verificacion: {
          basis: 'ANEP advierte sobre las alucinaciones y FING recomienda contrastar fuentes y revisar su confiabilidad.',
          note: 'Agesic plantea fiabilidad y seguridad; en este recorrido se traduce pedagógicamente en revisar resultados antes de utilizarlos.',
          sources: [
            { label: 'ANEP · Pensamiento crítico', url: 'https://www.anep.edu.uy/sites/default/files/images/2024/noticias/julio/240709/Documento%20IA.pdf#page=16' },
            { label: 'FING · Capacidad crítica', url: 'https://www.fing.edu.uy/sites/default/files/2026-02/guia-de-etica-fing_2026.pdf#page=2' }
          ]
        },
        privacidad: {
          note: 'Agesic sitúa la protección de datos personales desde el diseño y durante todo el ciclo de vida de la IA.',
          sources: [{ label: 'Agesic · Protección y privacidad', url: 'https://www.gub.uy/agencia-gobierno-electronico-sociedad-informacion-conocimiento/comunicacion/publicaciones/estrategia-nacional-inteligencia-artificial-uruguay-2024-2030-8' }]
        },
        equidad: {
          basis: 'UNESCO prioriza inclusión y diversidad; FING advierte que el acceso desigual a herramientas pagas puede ampliar brechas.',
          note: 'Agesic propone prevenir impactos discriminatorios y favorecer un acceso equitativo a los beneficios de la IA.',
          sources: [
            { label: 'FING · Acceso desigual', url: 'https://www.fing.edu.uy/sites/default/files/2026-02/guia-de-etica-fing_2026.pdf#page=3' },
            { label: 'Agesic · Equidad y no discriminación', url: 'https://www.gub.uy/agencia-gobierno-electronico-sociedad-informacion-conocimiento/comunicacion/publicaciones/estrategia-nacional-inteligencia-artificial-uruguay-2024-2030-8' }
          ]
        },
        agencia: {
          basis: 'FING propone conservar la comprensión y el trabajo analítico propio; ANEP destaca la responsabilidad sobre el aprendizaje.',
          note: 'Agesic destaca la autonomía de las personas y la supervisión humana de los resultados que apoyan decisiones.',
          sources: [
            { label: 'FING · Comprensión y uso de IA', url: 'https://www.fing.edu.uy/sites/default/files/2026-02/guia-de-etica-fing_2026.pdf#page=3' },
            { label: 'ANEP · Responsabilidad y pensamiento crítico', url: 'https://www.anep.edu.uy/sites/default/files/images/2024/noticias/julio/240709/Documento%20IA.pdf#page=16' }
          ]
        }
      }
    },
    Colombia: {
      flag: '🇨🇴',
      code: 'co',
      hasNationalFramework: true,
      title: 'Marcos de Colombia + UNESCO',
      names: ['Ministerio de Educación Nacional', 'CONPES 4144', 'UNESCO'],
      summary: 'El recorrido integra el Decálogo de IA para la Educación Superior y la Política Nacional de IA de Colombia con la guía de UNESCO.',
      synthesis: 'En Colombia, el Decálogo de IA para la Educación Superior orienta una adopción centrada en la dignidad humana, la equidad territorial, la autonomía universitaria, la transparencia algorítmica, la ciberseguridad, la inclusión y la transformación pedagógica. El CONPES 4144 aporta la política nacional para el desarrollo y la adopción responsable de la IA. UNESCO funciona como base internacional común.',
      references: [
        { label: 'MEN Colombia', title: 'Decálogo de IA para la Educación Superior', url: 'https://www.mineducacion.gov.co/portal/429623:Colombia-presenta-el-Decalogo-de-Inteligencia-Artificial-para-la-Educacion-Superior' },
        { label: 'CONPES 4144', title: 'Política Nacional de Inteligencia Artificial', url: 'https://normograma.mintic.gov.co/mintic/compilacion/docs/CONPES_DNP_4144_2025.htm' },
        UNESCO_REFERENCE
      ],
      axisGuidance: {
        transparencia: {
          basis: 'El Decálogo colombiano incorpora gobernanza y transparencia algorítmica para una adopción responsable de IA en educación superior.',
          note: 'En el recorrido, esta orientación se traduce en declarar el uso, explicar decisiones y acordar condiciones comprensibles.',
          sources: [{ label: 'MEN Colombia · Decálogo de IA', url: 'https://www.mineducacion.gov.co/portal/429623:Colombia-presenta-el-Decalogo-de-Inteligencia-Artificial-para-la-Educacion-Superior' }]
        },
        verificacion: {
          note: 'La adopción responsable prevista por la política nacional exige gestionar riesgos y conservar revisión humana de los resultados.',
          sources: [{ label: 'CONPES 4144 · Política Nacional de IA', url: 'https://normograma.mintic.gov.co/mintic/compilacion/docs/CONPES_DNP_4144_2025.htm' }]
        },
        privacidad: {
          basis: 'El Decálogo incorpora ciberseguridad y el CONPES 4144 orienta la adopción responsable de sistemas de IA.',
          note: 'En una práctica educativa, esto implica minimizar datos personales y revisar las condiciones de las herramientas utilizadas.',
          sources: [{ label: 'MEN Colombia · Ciberseguridad y gobernanza', url: 'https://www.mineducacion.gov.co/portal/429623:Colombia-presenta-el-Decalogo-de-Inteligencia-Artificial-para-la-Educacion-Superior' }]
        },
        equidad: {
          basis: 'El Decálogo sitúa la equidad territorial y la inclusión entre sus pilares para la educación superior.',
          note: 'La propuesta debe considerar acceso, diversidad regional y alternativas que no amplíen brechas existentes.',
          sources: [{ label: 'MEN Colombia · Equidad e inclusión', url: 'https://www.mineducacion.gov.co/portal/429623:Colombia-presenta-el-Decalogo-de-Inteligencia-Artificial-para-la-Educacion-Superior' }]
        },
        agencia: {
          basis: 'El marco colombiano ubica la dignidad humana y la transformación pedagógica en el centro de la adopción de IA.',
          note: 'La IA debe apoyar la enseñanza, el aprendizaje y la investigación sin sustituir autonomía ni juicio académico.',
          sources: [{ label: 'MEN Colombia · Centralidad humana', url: 'https://www.mineducacion.gov.co/portal/429623:Colombia-presenta-el-Decalogo-de-Inteligencia-Artificial-para-la-Educacion-Superior' }]
        }
      }
    },
    'República Dominicana': {
      flag: '🇩🇴',
      code: 'do',
      hasNationalFramework: true,
      title: 'Marcos de República Dominicana + UNESCO',
      names: ['MINERD', 'Estrategia Nacional de Educación Digital', 'ENIA', 'UNESCO'],
      summary: 'El recorrido integra la Estrategia Nacional de Educación Digital y la Estrategia Nacional de IA dominicanas con la guía de UNESCO.',
      synthesis: 'En República Dominicana, la Estrategia Nacional de Educación Digital define la competencia en IA como la capacidad de comprender, evaluar y utilizar críticamente estos sistemas, atendiendo sus errores, sesgos e implicaciones éticas. Promueve evaluación crítica, integridad académica, uso responsable y agencia humana. La ENIA aporta la hoja de ruta nacional para aplicar IA, también en educación. UNESCO funciona como base internacional común.',
      references: [
        { label: 'MINERD', title: 'Estrategia Nacional de Educación Digital (2026)', url: 'https://educando.edu.do/portal/wp-content/uploads/2026/06/Estrategia-Nacional-de-Educacion-Digital.-Mayo-2026.pdf' },
        { label: 'OGTIC', title: 'Estrategia Nacional de Inteligencia Artificial', url: 'https://ogtic.gob.do/presidente-luis-abinader-lanza-la-estrategia-nacional-de-ia/' },
        UNESCO_REFERENCE
      ],
      axisGuidance: {
        transparencia: {
          note: 'La competencia en IA demanda comprender cómo intervienen los sistemas y participar en acuerdos colectivos sobre sus reglas de uso.',
          sources: [{ label: 'MINERD · Estrategia de Educación Digital', url: 'https://educando.edu.do/portal/wp-content/uploads/2026/06/Estrategia-Nacional-de-Educacion-Digital.-Mayo-2026.pdf' }]
        },
        verificacion: {
          basis: 'La estrategia dominicana define la evaluación crítica como someter la información generada al rigor de la evidencia, el contexto y la apreciación humana.',
          note: 'Verificar no es solo buscar errores: también implica reconocer límites, sesgos y decisiones algorítmicas.',
          sources: [{ label: 'MINERD · Evaluación crítica de la IA', url: 'https://educando.edu.do/portal/wp-content/uploads/2026/06/Estrategia-Nacional-de-Educacion-Digital.-Mayo-2026.pdf' }]
        },
        privacidad: {
          note: 'La evaluación crítica incluye comprender las implicaciones del perfilamiento de datos para la autonomía y la privacidad.',
          sources: [{ label: 'MINERD · Privacidad y autonomía', url: 'https://educando.edu.do/portal/wp-content/uploads/2026/06/Estrategia-Nacional-de-Educacion-Digital.-Mayo-2026.pdf' }]
        },
        equidad: {
          basis: 'La competencia en IA dominicana propone reconocer sesgos y sus implicaciones éticas, sociales y democráticas.',
          note: 'La revisión debe atender exclusiones, acceso desigual y pertinencia para el contexto educativo real.',
          sources: [{ label: 'MINERD · Sesgos y equidad', url: 'https://educando.edu.do/portal/wp-content/uploads/2026/06/Estrategia-Nacional-de-Educacion-Digital.-Mayo-2026.pdf' }]
        },
        agencia: {
          basis: 'La estrategia define un uso responsable y agentivo: ampliar capacidades propias sin sustituirlas y sostener la integridad académica.',
          note: 'La responsabilidad humana permanece en la comprensión, la decisión y la producción final.',
          sources: [{ label: 'MINERD · Uso responsable y agentivo', url: 'https://educando.edu.do/portal/wp-content/uploads/2026/06/Estrategia-Nacional-de-Educacion-Digital.-Mayo-2026.pdf' }]
        }
      }
    }
  };

  function getCountryContext(country) {
    const name = country && country !== 'Otro' ? country : '';
    if (CONTEXTS[name]) return { country: name, ...CONTEXTS[name] };
    return {
      country: name || 'tu país',
      flag: COUNTRY_OPTIONS.find(option => option.name === name)?.flag || '🌐',
      code: COUNTRY_OPTIONS.find(option => option.name === name)?.code || '',
      hasNationalFramework: false,
      title: name ? `Marco internacional para ${name}` : 'Marco internacional de referencia',
      names: ['UNESCO'],
      summary: name
        ? `Todavía no hay un marco nacional curado para ${name}. El recorrido utiliza la guía internacional de UNESCO y evita atribuirle referencias de otro país.`
        : 'Seleccioná tu país para adaptar los marcos de referencia del recorrido.',
      synthesis: name
        ? `Para ${name}, esta versión utiliza la guía internacional de UNESCO como base común. Las referencias nacionales aún no fueron incorporadas y se presentan de forma explícita como una línea de ampliación, sin reutilizar marcos institucionales de otro país.`
        : 'El recorrido requiere seleccionar un país antes de presentar sus marcos de referencia.',
      references: [UNESCO_REFERENCE],
      axisGuidance: {}
    };
  }

  function getFrameworkNames(country) {
    return getCountryContext(country).names.join(', ');
  }

  window.CountryContext = {
    countries: COUNTRY_OPTIONS,
    contexts: CONTEXTS,
    get: getCountryContext,
    getFrameworkNames,
    internationalReference: UNESCO_REFERENCE
  };
})();
