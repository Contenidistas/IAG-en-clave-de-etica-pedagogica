
function isForeignCountry() {
  return typeof window.state !== 'undefined' && window.state.country && window.state.country !== 'Uruguay';
}
/* ========================================
   ELEMENTOS DEL DOM (ACTUALIZADO CON NIVEL EDUCATIVO)
   ======================================== */
const screens = {
  intro: document.getElementById('screenIntro'),
  game: document.getElementById('screenGame'),
  result: document.getElementById('screenResult')
};


/* ========================================
   🌐 DICCIONARIO DE TRADUCCIÓN (I18N)
   Español (default), English, Português, Français
   ======================================== */
const TRANSLATIONS = {
  es: {
    diag_kicker: "Diagnóstico guiado",
    diag_title: "Comenzar el proceso de reflexión crítica de mis prácticas",
    diag_subtitle: "Este cuestionario interactivo te ayudará a evaluar tu práctica y recibir recomendaciones personalizadas.",
    step_word: "Paso",
    app_title: "IAG en clave de ética pedagógica",
    btn_authors_label: "Autores",
    btn_authors_title: "¿Quiénes somos?",
    btn_foundation_label: "Base pedagógica",
    btn_foundation_title: "Fundamentación",
    hero_kicker: "Herramienta educativa",
    hero_title: "IAG en clave de ética pedagógica",
    hero_subtitle: "Un espacio de autoevaluación y reflexión ética para revisar tus prácticas docentes e incorporar el uso crítico de la inteligencia artificial generativa de acuerdo a marcos de referencia actuales.",
    card_game_title: "Autodiagnóstico",
    card_game_desc: "Evaluá tus prácticas de aula con base en los marcos ANEP, Ceibal, UNESCO y Udelar.",
    card_game_btn: "Comenzar autodiagnóstico →",
    card_lab_title: "Laboratorio de casos",
    card_lab_desc: "Explorá y resolvé de forma interactiva dilemas éticos y situados en formato taller.",
    card_lab_btn: "Abrir modo taller →",

    step_perfil: "Perfil",
    step_contexto: "Contexto",
    step_cierre: "Uso y privacidad",
    label_role_question: "¿Desde qué lugar querés hacer el recorrido?",
    role_estudiante_title: "Estudiante",
    role_estudiante_desc: "Uso de IA en estudio, tareas y producción académica en formación inicial.",
    role_docente_title: "Docente",
    role_docente_desc: "Planificación, evaluación, decisiones de aula y criterios didácticos.",
    role_investigador_title: "Docente/investigador/a",
    role_investigador_desc: "Marcos teóricos, investigación educativa, gestión y criterios compartidos.",

    label_nivel_docente: "En qué nivel trabajás",
    label_nivel_estudiante: "En qué nivel estudiás",
    label_name: "Tu nombre (opcional)",
    placeholder_name: "Ingresá tu nombre o un seudónimo",
    label_country: "País",
    label_country_other: "Especificá tu país",
    placeholder_country_other: "Ingresá tu país",
    opt_other: "Otro (especificar)",

    label_familiarity: "Antes de comenzar, ¿qué nivel de familiaridad tenés con este tema?",
    label_resources: "¿Has utilizado recursos o capacitaciones similares sobre Inteligencia Artificial?",
    opt_yes: "Sí",
    opt_no: "No",
    label_consent: "Acepto compartir mis respuestas de forma 100% anónima para fines de investigación educativa y mejora de la herramienta.",

    btn_back: "Atrás",
    btn_next: "Siguiente",
    btn_start_game: "Comenzar autodiagnóstico",
    guidance_title: "Campos pendientes por completar:",

    btn_yes: "Sí",
    btn_sometimes: "A veces",
    btn_no: "No",
    btn_na: "No aplica",
    btn_prev_question: "Anterior",
    btn_next_question: "Siguiente",
    btn_abort: "Volver al inicio",
    question_counter: "Pregunta",
    question_counter_of: "de",
    btn_not_applicable: "No aplica",
    help_toggle: "Ayuda pedagógica",

    tab_summary: "Resumen del tránsito",
    tab_suggestions: "Sugerencias de mejora",
    tab_proposals: "Propuestas de acción",
    btn_copy_summary: "Copiar resumen",
    btn_download_pdf: "Descargar PDF",
    btn_restart: "Volver al inicio / Reiniciar",
    cases_section_title: "Laboratorio de casos / Dilemas para debatir",

    lab_title: "Laboratorio de casos situados",
    lab_subtitle: "Análisis de dilemas éticos y pedagógicos para la toma de decisiones",
    btn_analyze_dilemma: "Analizar dilema",
    btn_download_ficha: "Descargar ficha PDF (Taller)",

    level_primaria: "Primaria",
    level_media_basica: "Enseñanza Media Básica",
    level_media_superior: "Enseñanza Media Superior",
    level_formacion_docente: "Formación Docente",
    level_universitaria: "Universitaria",
    level_terciaria_tecnica: "Educación Terciaria Técnica",

    modal_authors_title: "¿Quiénes somos? — Autores de la app",
    author_santi_role: "Creador y desarrollador de la app. Investigador y divulgador. Prof. de Informática especializado en Tecnología Educativa.",
    author_diego_role: "Investigador y colaborador pedagógico. Prof. de Informática."
  },

  en: {
    diag_kicker: "Guided Assessment",
    diag_title: "Begin the critical reflection process on your practices",
    diag_subtitle: "This interactive questionnaire will help you evaluate your practice and receive personalized recommendations.",
    step_word: "Step",
    app_title: "Generative AI in Pedagogical Ethics",
    btn_authors_label: "Authors",
    btn_authors_title: "About us",
    btn_foundation_label: "Pedagogical basis",
    btn_foundation_title: "Rationale",
    hero_kicker: "Educational tool",
    hero_title: "Artificial Intelligence in Pedagogical Ethics",
    hero_subtitle: "An interactive self-assessment and ethical reflection space to review teaching practices and integrate critical AI usage.",
    card_game_title: "Self-Assessment",
    card_game_desc: "Evaluate your classroom practices based on current ethical frameworks.",
    card_game_btn: "Start self-assessment →",
    card_lab_title: "Case laboratory",
    card_lab_desc: "Explore and interactively resolve real ethical dilemmas in workshop format.",
    card_lab_btn: "Open workshop mode →",

    step_perfil: "Profile",
    step_contexto: "Context",
    step_cierre: "Usage & privacy",
    label_role_question: "Which perspective are you taking today?",
    role_estudiante_title: "Student",
    role_estudiante_desc: "AI usage in studying, assignments, and academic work.",
    role_docente_title: "Teacher",
    role_docente_desc: "Lesson planning, assessment, classroom decisions, and pedagogical criteria.",
    role_investigador_title: "Teacher / Researcher",
    role_investigador_desc: "Theoretical frameworks, educational research, and shared criteria.",

    label_nivel_docente: "What level do you teach at?",
    label_nivel_estudiante: "What level do you study at?",
    label_name: "Your name (optional)",
    placeholder_name: "Enter your name or pseudonym",
    label_country: "Country",
    label_country_other: "Specify your country",
    placeholder_country_other: "Enter your country",
    opt_other: "Other (specify)",

    label_familiarity: "Before starting, what is your level of familiarity with this topic?",
    label_resources: "Have you used similar resources or training on Artificial Intelligence?",
    opt_yes: "Yes",
    opt_no: "No",
    label_consent: "I agree to share my answers 100% anonymously for educational research and improvement.",

    btn_back: "Back",
    btn_next: "Next",
    btn_start_game: "Start self-assessment",
    guidance_title: "Pending fields to complete:",

    btn_yes: "Yes",
    btn_sometimes: "Sometimes",
    btn_no: "No",
    btn_na: "Not applicable",
    btn_prev_question: "Previous",
    btn_next_question: "Next",
    btn_abort: "Return to start",
    question_counter: "Question",
    question_counter_of: "of",
    btn_not_applicable: "Not applicable",
    help_toggle: "Pedagogical guidance",

    tab_summary: "Journey Summary",
    tab_suggestions: "Improvement Suggestions",
    tab_proposals: "Action Proposals",
    btn_copy_summary: "Copy summary",
    btn_download_pdf: "Download PDF",
    btn_restart: "Return to start / Restart",
    cases_section_title: "Case Laboratory / Dilemmas for debate",

    lab_title: "Situated Cases Laboratory",
    lab_subtitle: "Analysis of ethical and pedagogical dilemmas for decision-making",
    btn_analyze_dilemma: "Analyze dilemma",
    btn_download_ficha: "Download PDF Worksheet (Workshop)",

    level_primaria: "Primary Education",
    level_media_basica: "Lower Secondary Education",
    level_media_superior: "Upper Secondary / High School",
    level_formacion_docente: "Teacher Education",
    level_universitaria: "University / Higher Education",
    level_terciaria_tecnica: "Technical Higher Education",

    modal_authors_title: "About us — App authors",
    author_santi_role: "App creator and developer. Researcher and communicator. Computer Science Professor specialized in Educational Technology.",
    author_diego_role: "Researcher and pedagogical collaborator. Computer Science Professor."
  },

  pt: {
    diag_kicker: "Diagnóstico guiado",
    diag_title: "Iniciar o processo de reflexão crítica sobre minhas práticas",
    diag_subtitle: "Este questionário interativo ajudará você a avaliar sua prática e receber recomendações personalizadas.",
    step_word: "Passo",
    app_title: "IAG sob a ótica da ética pedagógica",
    btn_authors_label: "Autores",
    btn_authors_title: "Quem somos?",
    btn_foundation_label: "Base pedagógica",
    btn_foundation_title: "Fundamentação",
    hero_kicker: "Ferramenta educativa",
    hero_title: "Inteligência Artificial sob a ótica da ética pedagógica",
    hero_subtitle: "Um espaço de autoavaliação e reflexão ética para revisar suas práticas docentes e incorporar o uso crítico da inteligência artificial.",
    card_game_title: "Autodiagnóstico",
    card_game_desc: "Avalie suas práticas de sala de aula com base em marcos éticos atuais.",
    card_game_btn: "Iniciar autodiagnóstico →",
    card_lab_title: "Laboratório de casos",
    card_lab_desc: "Explore e resolva dilemas éticos situados em formato de oficina.",
    card_lab_btn: "Abrir modo oficina →",

    step_perfil: "Perfil",
    step_contexto: "Contexto",
    step_cierre: "Uso e privacidade",
    label_role_question: "Com qual perfil você deseja realizar o percurso?",
    role_estudiante_title: "Estudante",
    role_estudiante_desc: "Uso de IA nos estudos, tarefas e produção acadêmica.",
    role_docente_title: "Professor",
    role_docente_desc: "Planejamento, avaliação, decisões de sala de aula e critérios didáticos.",
    role_investigador_title: "Professor / Pesquisador",
    role_investigador_desc: "Marcos teóricos, pesquisa educacional e critérios compartilhados.",

    label_nivel_docente: "Em qual nível você leciona?",
    label_nivel_estudiante: "Em qual nível você estuda?",
    label_name: "Seu nome (opcional)",
    placeholder_name: "Digite seu nome ou pseudônimo",
    label_country: "País",
    label_country_other: "Especifique seu país",
    placeholder_country_other: "Digite seu país",
    opt_other: "Outro (especificar)",

    label_familiarity: "Antes de começar, qual é o seu nível de familiaridade com este tema?",
    label_resources: "Você já utilizou recursos ou formações semelhantes sobre Inteligência Artificial?",
    opt_yes: "Sim",
    opt_no: "Não",
    label_consent: "Aceito compartilhar minhas respostas de forma 100% anônima para fins de pesquisa educacional e melhoria da ferramenta.",

    btn_back: "Voltar",
    btn_next: "Avançar",
    btn_start_game: "Iniciar autodiagnóstico",
    guidance_title: "Campos pendentes a preencher:",

    btn_yes: "Sim",
    btn_sometimes: "Às vezes",
    btn_no: "Não",
    btn_na: "Não se aplica",
    btn_prev_question: "Anterior",
    btn_next_question: "Avançar",
    btn_abort: "Voltar ao início",
    question_counter: "Pergunta",
    question_counter_of: "de",
    btn_not_applicable: "Não se aplica",
    help_toggle: "Orientação pedagógica",

    tab_summary: "Resumo da Jornada",
    tab_suggestions: "Sugestões de melhoria",
    tab_proposals: "Propostas de ação",
    btn_copy_summary: "Copiar resumo",
    btn_download_pdf: "Baixar PDF",
    btn_restart: "Voltar ao início / Reiniciar",
    cases_section_title: "Laboratório de casos / Dilemas para debater",

    lab_title: "Laboratório de casos situados",
    lab_subtitle: "Análise de dilemas éticos e pedagógicos para a tomada de decisões",
    btn_analyze_dilemma: "Analisar dilema",
    btn_download_ficha: "Baixar ficha PDF (Oficina)",

    level_primaria: "Ensino Fundamental I",
    level_media_basica: "Ensino Fundamental II",
    level_media_superior: "Ensino Médio",
    level_formacion_docente: "Formação Docente / Licenciatura",
    level_universitaria: "Ensino Superior / Universidade",
    level_terciaria_tecnica: "Educação Terciária Técnica",

    modal_authors_title: "Quem somos? — Autores do aplicativo",
    author_santi_role: "Criador e desenvolvedor do aplicativo. Pesquisador e divulgador. Prof. de Informática especializado em Tecnologia Educacional.",
    author_diego_role: "Pesquisador e colaborador pedagógico. Prof. de Informática."
  },

  fr: {
    diag_kicker: "Diagnostic guidé",
    diag_title: "Commencer le processus de réflexion critique sur mes pratiques",
    diag_subtitle: "Ce questionnaire interactif vous aidera à évaluer votre pratique et à recevoir des recommandations personnalisées.",
    step_word: "Étape",
    app_title: "IAG sous l'angle de l'éthique pédagogique",
    btn_authors_label: "Auteurs",
    btn_authors_title: "Qui sommes-nous ?",
    btn_foundation_label: "Base pédagogique",
    btn_foundation_title: "Fondement",
    hero_kicker: "Outil éducatif",
    hero_title: "Intelligence Artificielle sous l'angle de l'éthique pédagogique",
    hero_subtitle: "Un espace d'auto-évaluation et de réflexion éthique pour réviser vos pratiques d'enseignement et intégrer l'IA de manière critique.",
    card_game_title: "Auto-évaluation",
    card_game_desc: "Évaluez vos pratiques de classe sur la base des cadres éthiques actuels.",
    card_game_btn: "Démarrer l'auto-évaluation →",
    card_lab_title: "Laboratoire de cas",
    card_lab_desc: "Explorez et résolvez de manière interactive des dilemmes éthiques au format atelier.",
    card_lab_btn: "Ouvrir le mode atelier →",

    step_perfil: "Profil",
    step_contexto: "Contexte",
    step_cierre: "Usage & confidentialité",
    label_role_question: "Sous quel profil souhaitez-vous effectuer le parcours ?",
    role_estudiante_title: "Élève / Étudiant",
    role_estudiante_desc: "Usage de l'IA dans les études, travaux et productions académiques.",
    role_docente_title: "Enseignant",
    role_docente_desc: "Planification, évaluation, décisions de classe et critères pédagogiques.",
    role_investigador_title: "Enseignant / Chercheur",
    role_investigador_desc: "Cadres théoriques, recherche éducative et critères partagés.",

    label_nivel_docente: "À quel niveau enseignez-vous ?",
    label_nivel_estudiante: "À quel niveau étudiez-vous ?",
    label_name: "Votre nom (optionnel)",
    placeholder_name: "Entrez votre nom ou pseudonyme",
    label_country: "Pays",
    label_country_other: "Précisez votre pays",
    placeholder_country_other: "Entrez votre pays",
    opt_other: "Autre (préciser)",

    label_familiarity: "Avant de commencer, quel est votre niveau de familiarité avec ce sujet ?",
    label_resources: "Avez-vous utilisé des ressources ou formations similaires sur l'IA ?",
    opt_yes: "Oui",
    opt_no: "Non",
    label_consent: "J'accepte de partager mes réponses de manière 100% anonyme à des fins de recherche éducative et d'amélioration.",

    btn_back: "Retour",
    btn_next: "Suivant",
    btn_start_game: "Démarrer l'auto-évaluation",
    guidance_title: "Champs en attente de complétion :",

    btn_yes: "Oui",
    btn_sometimes: "Parfois",
    btn_no: "Non",
    btn_na: "Non applicable",
    btn_prev_question: "Précédent",
    btn_next_question: "Suivant",
    btn_abort: "Retour au début",
    question_counter: "Question",
    question_counter_of: "sur",
    btn_not_applicable: "Non applicable",
    help_toggle: "Aide pédagogique",

    tab_summary: "Résumé du parcours",
    tab_suggestions: "Suggestions d'amélioration",
    tab_proposals: "Propositions d'action",
    btn_copy_summary: "Copier le résumé",
    btn_download_pdf: "Télécharger le PDF",
    btn_restart: "Retour au début / Réinitialiser",
    cases_section_title: "Laboratoire de cas / Dilemmes à débattre",

    lab_title: "Laboratoire de cas situés",
    lab_subtitle: "Analyse de dilemmes éthiques et pédagogiques pour la prise de décision",
    btn_analyze_dilemma: "Analyser le dilemme",
    btn_download_ficha: "Télécharger fiche PDF (Atelier)",

    level_primaria: "École Élémentaire",
    level_media_basica: "Collège (Enseignement Secondaire Inférieur)",
    level_media_superior: "Lycée (Enseignement Secondaire Supérieur)",
    level_formacion_docente: "Formation Enseignante (INSPE)",
    level_universitaria: "Enseignement Supérieur / Université",
    level_terciaria_tecnica: "Enseignement Supérieur Technique",

    modal_authors_title: "Qui sommes-nous ? — Auteurs de l'application",
    author_santi_role: "Créateur et développeur de l'application. Chercheur et vulgarisateur. Prof. d'Informatique spécialisé en Technologie Éducative.",
    author_diego_role: "Chercheur et colaborador pédagogique. Prof. d'Informatique."
  }
};

function updateAppLanguage(lang = 'es') {
  const t = TRANSLATIONS[lang] || TRANSLATIONS['es'];
  document.documentElement.lang = lang;
  if (window.state) window.state.lang = lang;

  // 1. Elementos con data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (t[key]) {
      el.textContent = t[key];
    }
  });

  // 2. Placeholders con data-i18n-placeholder
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (t[key]) {
      el.placeholder = t[key];
    }
  });

  // 3. Botones del juego
  const yesBtn = document.getElementById('yesBtn');
  if (yesBtn) yesBtn.textContent = t.btn_yes || 'Sí';
  const sometimesBtn = document.getElementById('sometimesBtn');
  if (sometimesBtn) sometimesBtn.textContent = t.btn_sometimes || 'A veces';
  const noBtn = document.getElementById('noBtn');
  if (noBtn) noBtn.textContent = t.btn_no || 'No';
  const naBtn = document.getElementById('notApplicableBtn');
  if (naBtn) naBtn.textContent = t.btn_na || 'No aplica';
  const abortBtn = document.getElementById('btnAbortGame');
  if (abortBtn) abortBtn.textContent = t.btn_abort || 'Volver al inicio';
  const helpBtn = document.getElementById('toggleHelpBtn');
  if (helpBtn) helpBtn.textContent = t.help_toggle || 'Ayuda pedagógica';
  const prevBtn = document.getElementById('prevQuestionBtn');
  if (prevBtn) prevBtn.textContent = t.btn_prev_question || 'Anterior';
  const nextBtn = document.getElementById('nextQuestionBtn');
  if (nextBtn) nextBtn.textContent = t.btn_next_question || 'Siguiente';
  const onboardingNextBtn = document.getElementById('onboardingNextBtn');
  if (onboardingNextBtn) onboardingNextBtn.textContent = t.btn_next || 'Siguiente';
  const onboardingBackBtn = document.getElementById('onboardingBackBtn');
  if (onboardingBackBtn) onboardingBackBtn.textContent = t.btn_back || 'Anterior';

  // 4. Pestañas y acciones de resultados
  const tabSummary = document.getElementById('tabSummary');
  if (tabSummary) tabSummary.textContent = t.tab_summary || 'Resumen del tránsito';
  const tabSuggestions = document.getElementById('tabSuggestions');
  if (tabSuggestions) tabSuggestions.textContent = t.tab_suggestions || 'Sugerencias de mejora';
  const tabProposals = document.getElementById('tabProposals');
  if (tabProposals) tabProposals.textContent = t.tab_proposals || 'Propuestas de acción';
  const copyBtn = document.getElementById('copySummaryBtn');
  if (copyBtn) copyBtn.textContent = t.btn_copy_summary || 'Copiar resumen';
  const downloadBtn = document.getElementById('downloadPdfBtn');
  if (downloadBtn) downloadBtn.textContent = t.btn_download_pdf || 'Descargar PDF';
  const restartBtn = document.getElementById('restartBtn');
  if (restartBtn) restartBtn.textContent = t.btn_restart || 'Volver al inicio / Reiniciar';

  // 5. Laboratorio de casos
  const casesTitle = document.getElementById('situatedCasesTitle');
  if (casesTitle) casesTitle.textContent = t.cases_section_title || 'Laboratorio de casos / Dilemas para debatir';
  const labSub = document.getElementById('labSubtitle');
  if (labSub) labSub.textContent = t.lab_subtitle || 'Análisis de dilemas éticos y pedagógicos para la toma de decisiones';

  // 6. Títulos de ONBOARDING_STEP_META
  if (typeof ONBOARDING_STEP_META !== 'undefined' && ONBOARDING_STEP_META) {
    if (ONBOARDING_STEP_META.perfil) ONBOARDING_STEP_META.perfil.title = t.step_perfil;
    if (ONBOARDING_STEP_META.contexto) ONBOARDING_STEP_META.contexto.title = t.step_contexto;
    if (ONBOARDING_STEP_META.cierre) ONBOARDING_STEP_META.cierre.title = t.step_cierre;
  }

  // 7. Refrescar UI de onboarding y niveles si están activos
  if (typeof updateOnboardingUI === 'function') {
    updateOnboardingUI();
  }
  if (window.state && window.state.profile && typeof updateNivelEducativo === 'function') {
    updateNivelEducativo(window.state.profile);
  }
  if (typeof updateProgress === 'function' && window.state && window.state.currentQuestion) {
    updateProgress();
  }
}


const elements = {
  languageSelect: document.getElementById('languageSelect'),
  // Carrusel
  carouselTrack: document.getElementById('carouselTrack'),
  carouselDots: document.querySelectorAll('.carousel-dot'),
  prevSlide: document.getElementById('prevSlide'),
  nextSlide: document.getElementById('nextSlide'),
  
  // Bienvenida
  chips: document.querySelectorAll('.chip'),
  profileSelectorPanel: document.getElementById('profileSelectorPanel'),
  playerName: document.getElementById('playerName'),
  startBtn: document.getElementById('startBtn'),
  infoBtn: document.getElementById('infoBtn'),
  frameworkCard: document.querySelector('.audience-framework'),
  frameworkAudienceTitle: document.getElementById('frameworkAudienceTitle'),
  frameworkAudienceIntro: document.getElementById('frameworkAudienceIntro'),
  frameworkContextText: document.getElementById('frameworkContextText'),
  toggleFrameworkBtn: document.getElementById('toggleFrameworkBtn'),
  aiUseDisclosureBtn: document.getElementById('aiUseDisclosureBtn'),

  // 🆕 Nivel educativo
  nivelEducativoWrapper: document.getElementById('nivelEducativoWrapper'),
  nivelEducativo: document.getElementById('nivelEducativo'),
  nivelEducativoLabel: document.getElementById('nivelEducativoLabel'),

  // Caracterización
  countrySelect: document.getElementById('countrySelect'),
  countryOtherWrapper: document.getElementById('countryOtherWrapper'),
  countryOtherInput: document.getElementById('countryOther'),
  countryFinalInput: document.getElementById('countryFinal'),
  familiaridadInicial: document.getElementById('familiaridadInicial'),
  familiaridadInicialWrapper: document.getElementById('familiaridadInicialWrapper'),
  recursosSimilaresRadios: document.querySelectorAll('input[name="recursosSimilares"]'),
  recursosSimilaresWrapper: document.getElementById('recursosSimilaresWrapper'),
  startGuidance: document.getElementById('startGuidance'),
  startGuidanceBadge: document.getElementById('startGuidanceBadge'),
  startGuidanceTitle: document.getElementById('startGuidanceTitle'),
  startGuidanceList: document.getElementById('startGuidanceList'),
  onboardingSteps: document.querySelectorAll('.onboarding-step'),
  onboardingStepCounter: document.getElementById('onboardingStepCounter'),
  onboardingStepTitle: document.getElementById('onboardingStepTitle'),
  onboardingDots: document.getElementById('onboardingDots'),
  onboardingControls: document.getElementById('onboardingControls'),
  onboardingBackBtn: document.getElementById('onboardingBackBtn'),
  onboardingNextBtn: document.getElementById('onboardingNextBtn'),
  
  // Juego
  progressFill: document.getElementById('progressFill'),
  progressText: document.getElementById('progressText'),
  questionNumber: document.getElementById('questionNumber'),
  activeCriterionBadge: document.getElementById('activeCriterionBadge'),
  decisionReason: document.getElementById('decisionReason'),
  questionTitle: document.getElementById('questionTitle'),
  questionHelp: document.getElementById('questionHelp'),
  yesBtn: document.getElementById('yesBtn'),
  sometimesBtn: document.getElementById('sometimesBtn'),
  noBtn: document.getElementById('noBtn'),
  notApplicableBtn: document.getElementById('notApplicableBtn'),
  contextBtn: document.getElementById('contextBtn'),
  feedbackBox: document.getElementById('feedbackBox'),
  nextBtn: document.getElementById('nextBtn'),
  backBtn: document.getElementById('backBtn'),
  timeline: document.getElementById('timeline'),
  likertMarker: document.getElementById('likertMarker'),
  likertLevel: document.getElementById('likertLevel'),
  decisionMapCount: document.getElementById('decisionMapCount'),
  decisionMapAxes: document.getElementById('decisionMapAxes'),
  decisionBranchStatus: document.getElementById('decisionBranchStatus'),
  decisionBranchMap: document.getElementById('decisionBranchMap'),
  principleGraphStatus: document.getElementById('principleGraphStatus'),
  principleGraph: document.getElementById('principleGraph'),
  
  // Resultado
  resultTitle: document.getElementById('resultTitle'),
  resultDesc: document.getElementById('resultDesc'),
  resultLevel: document.getElementById('resultLevel'),
  resultSummary: document.getElementById('resultSummary'),
  resultInsights: document.getElementById('resultInsights'),
  qualityReportContent: document.getElementById('qualityReportContent'),
  ethicalCompassLevel: document.getElementById('ethicalCompassLevel'),
  ethicalCompassFocus: document.getElementById('ethicalCompassFocus'),
  ethicalCompassCopy: document.getElementById('ethicalCompassCopy'),
  ethicalCompassBars: document.getElementById('ethicalCompassBars'),
  principleResultGraphStatus: document.getElementById('principleResultGraphStatus'),
  principleResultGraph: document.getElementById('principleResultGraph'),
  resultTabs: document.querySelectorAll('.result-tab'),
  resultTabPanels: document.querySelectorAll('.result-tab-panel'),
  agreementBuilderText: document.getElementById('agreementBuilderText'),
  copyAgreementBtn: document.getElementById('copyAgreementBtn'),
  downloadAgreementBtn: document.getElementById('downloadAgreementBtn'),
  regenerateAgreementBtn: document.getElementById('regenerateAgreementBtn'),
  agreementBuilderStatus: document.getElementById('agreementBuilderStatus'),
  agreementFormatBtns: document.querySelectorAll('.agreement-format-btn'),
  situatedCases: document.getElementById('situatedCases'),
  didacticaList: document.getElementById('didacticaList'),
  toolsList: document.getElementById('toolsList'),
  finalTimeline: document.getElementById('finalTimeline'),
  downloadBtn: document.getElementById('downloadBtn'),
  copyBtn: document.getElementById('copyBtn'),
  restartBtn: document.getElementById('restartBtn'),

  // Estadísticas anónimas
  refreshStatsBtn: document.getElementById('refreshStatsBtn'),
  statsStatus: document.getElementById('statsStatus'),
  statsContent: document.getElementById('statsContent'),
  statVisits: document.getElementById('statVisits'),
  statCompleted: document.getElementById('statCompleted'),
  statAverage: document.getElementById('statAverage'),
  statTopLevel: document.getElementById('statTopLevel'),
  statsLevels: document.getElementById('statsLevels'),
  statsProfiles: document.getElementById('statsProfiles'),
  statsIndicators: document.getElementById('statsIndicators'),
  statsEducation: document.getElementById('statsEducation'),
  statsInsight: document.getElementById('statsInsight'),
  opinionsStatus: document.getElementById('opinionsStatus'),
  opinionsCarousel: document.getElementById('opinionsCarousel'),
  prevOpinionBtn: document.getElementById('prevOpinionBtn'),
  nextOpinionBtn: document.getElementById('nextOpinionBtn'),
  localHistoryList: document.getElementById('localHistoryList'),
  clearLocalHistoryBtn: document.getElementById('clearLocalHistoryBtn'),

  // Valoración de la herramienta
  toolRatingRadios: document.querySelectorAll('input[name="toolRating"]'),
  toolSuggestion: document.getElementById('toolSuggestion'),
  sendToolFeedbackBtn: document.getElementById('sendToolFeedbackBtn'),
  toolFeedbackStatus: document.getElementById('toolFeedbackStatus'),
  
  // Tema
  themeToggle: document.getElementById('themeToggle'),
  themeIcon: document.getElementById('themeIcon'),

  // Principios UNESCO / ANEP
  principleTooltip: document.getElementById('principleTooltip'),
  principleButtons: document.querySelectorAll('.principle-info-btn'),
  tooltipTabs: document.querySelectorAll('#principleTooltip .tooltip-tab'),
  tooltipTitle: document.getElementById('tooltipTitle'),
  tooltipBody: document.getElementById('tooltipBody'),
  tooltipClose: document.querySelector('#principleTooltip .tooltip-close'),

  // Consentimiento de registro
  consentTracking: document.getElementById('consentTracking')
};

/* ========================================
   🆕 CONFIGURACIÓN DE NIVELES EDUCATIVOS
   ======================================== */
/* ========================================
   🇨🇦 SISTEMA EDUCATIVO DE CANADÁ Y OTROS PAÍSES
   ======================================== */
const NIVELES_POR_PAIS = {
  'Canadá': {
    framework: 'CMEC (Council of Ministers of Education, Canada) & UNESCO',
    docente: [
      { key: 'level_ca_elem', default: 'Elementary School (Primary)' },
      { key: 'level_ca_sec', default: 'Secondary School (High School)' },
      { key: 'level_ca_college', default: 'College / CEGEP / Vocational' },
      { key: 'level_ca_teacher_ed', default: 'Teacher Education (Faculty of Education)' },
      { key: 'level_ca_uni', default: 'University / Higher Education' }
    ],
    estudiante: [
      { key: 'level_ca_sec', default: 'Secondary School (High School)' },
      { key: 'level_ca_college', default: 'College / CEGEP / Technical' },
      { key: 'level_ca_teacher_prog', default: 'Teacher Education Program (B.Ed.)' },
      { key: 'level_ca_undergrad', default: 'Undergraduate Degree (Bachelor’s)' },
      { key: 'level_ca_grad', default: 'Graduate Studies (Master’s / Ph.D.)' }
    ]
  },
  'Uruguay': {
    framework: 'ANEP / Ceibal / Udelar',
    docente: [
      { key: 'level_primaria', default: 'Primaria' },
      { key: 'level_media_basica', default: 'Enseñanza Media Básica' },
      { key: 'level_media_superior', default: 'Enseñanza Media Superior' },
      { key: 'level_formacion_docente', default: 'Formación Docente' },
      { key: 'level_universitaria', default: 'Universitaria' }
    ],
    estudiante: [
      { key: 'level_media_basica', default: 'Enseñanza Media Básica' },
      { key: 'level_media_superior', default: 'Enseñanza Media Superior' },
      { key: 'level_terciaria_tecnica', default: 'Educación Terciaria Técnica' },
      { key: 'level_formacion_docente', default: 'Formación Docente' },
      { key: 'level_universitaria', default: 'Universitaria' }
    ]
  }
};

const DEFAULT_INTERNATIONAL_NIVELES = {
  framework: 'UNESCO Global AI Guidelines',
  docente: [
    { key: 'level_int_primary', default: 'Primary Education' },
    { key: 'level_int_secondary', default: 'Secondary Education / High School' },
    { key: 'level_int_technical', default: 'Technical & Vocational College' },
    { key: 'level_int_teacher_training', default: 'Teacher Training / Pedagogy' },
    { key: 'level_int_higher', default: 'Higher Education / University' }
  ],
  estudiante: [
    { key: 'level_int_secondary', default: 'Secondary Education' },
    { key: 'level_int_technical', default: 'Technical & Vocational College' },
    { key: 'level_int_teacher_training', default: 'Teacher Preparation Student' },
    { key: 'level_int_undergrad', default: 'Undergraduate University' },
    { key: 'level_int_postgrad', default: 'Postgraduate / Master / Doctorate' }
  ]
};

/* ========================================
   TEMA + MODAL
   ======================================== */
let darkMode = localStorage.getItem('darkMode') === 'true';
updateTheme();

if (elements.themeToggle) {
  elements.themeToggle.addEventListener('click', () => {
    darkMode = !darkMode;
    localStorage.setItem('darkMode', darkMode);
    updateTheme();
  });
}

const modal = {
  overlay: document.getElementById('modalOverlay'),
  title: document.getElementById('modalTitle'),
  body: document.getElementById('modalBody'),
  closeBtn: document.getElementById('modalClose'),
  show(title, content) {
    if (!this.overlay || !this.title || !this.body) return;
    this.title.textContent = title;
    this.body.innerHTML = content;
    this.overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  },
  hide() {
    if (!this.overlay) return;
    this.overlay.classList.add('hidden');
    document.body.style.overflow = '';
  }
};

function debugLog(...args) {
  if (window.CONFIG && window.CONFIG.debug) {
    console.log(...args);
  }
}

const QUICK_GUIDE_KEY = 'iag_quick_guide_seen';

function mostrarGuiaRapidaInicial() {
  try {
    if (localStorage.getItem(QUICK_GUIDE_KEY) === 'true') return;
    localStorage.setItem(QUICK_GUIDE_KEY, 'true');
  } catch (err) {
    console.warn('No se pudo guardar el estado de la guia rapida:', err);
  }

  modal.show('Guía rápida de la herramienta', `
    <div class="quick-guide">
      <p class="quick-guide-purpose">
        Esta app propone un recorrido de reflexión sobre el uso ético, crítico y pedagógico de la inteligencia artificial generativa. No busca calificarte, sino ayudarte a revisar decisiones, transparentar usos y fortalecer criterios propios.
      </p>

      <div class="quick-guide-grid">
        <section class="quick-guide-item">
          <span>1</span>
          <div>
            <h4>Fundamentación</h4>
            <p>Presenta los marcos que sostienen la propuesta y permite ampliar la lectura pedagógica.</p>
          </div>
        </section>

        <section class="quick-guide-item">
          <span>2</span>
          <div>
            <h4>Diagnóstico guiado</h4>
            <p>Te hace preguntas situadas según tu perfil para pensar cómo usás o proponés usar IAG.</p>
          </div>
        </section>

        <section class="quick-guide-item quick-guide-item-highlight">
          <span>3</span>
          <div>
            <h4>Asistente Pedagógico</h4>
            <p>Usa IA generativa para explicar preguntas, interpretar respuestas y sugerir mejoras. Sus orientaciones deben verificarse con criterio pedagógico.</p>
          </div>
        </section>

        <section class="quick-guide-item">
          <span>4</span>
          <div>
            <h4>Reporte final</h4>
            <p>Resume tu recorrido y ofrece recomendaciones para fortalecer transparencia, verificación, autoría y reflexión crítica.</p>
          </div>
        </section>

        <section class="quick-guide-item">
          <span>5</span>
          <div>
            <h4>Datos anónimos</h4>
            <p>Muestra estadísticas agregadas y opiniones sin exponer respuestas individuales ni datos identificables.</p>
          </div>
        </section>
      </div>

      <div class="quick-guide-actions">
        <button type="button" class="btn btn-primary" id="quickGuideClose">Entendido</button>
      </div>
    </div>
  `);

  setTimeout(() => {
    const closeGuide = document.getElementById('quickGuideClose');
    if (closeGuide) closeGuide.addEventListener('click', () => modal.hide());
  }, 0);
}

if (modal.closeBtn) {
  modal.closeBtn.addEventListener('click', () => modal.hide());
}
if (modal.overlay) {
  modal.overlay.addEventListener('click', (e) => { 
    if (e.target === modal.overlay) modal.hide(); 
  });
}
document.addEventListener('keydown', (e) => { 
  if (e.key === 'Escape') {
    modal.hide();
    hidePrincipleTooltip();
  }
});

function updateTheme() {
  if (darkMode) {
    document.documentElement.setAttribute('data-theme', 'dark');
    if (elements.themeIcon) elements.themeIcon.textContent = '☀';
  } else {
    document.documentElement.removeAttribute('data-theme');
    if (elements.themeIcon) elements.themeIcon.textContent = '☾';
  }
}

/* ========================================
   TOOLTIP PRINCIPIOS UNESCO / ANEP
   ======================================== */
let currentPrincipleId = null;
let currentSource = 'unesco';

function showPrincipleTooltip(principleId, source = 'unesco') {
  if (!elements.principleTooltip || !PRINCIPLES_CONTENT[principleId]) return;

  currentPrincipleId = principleId;

  const data = PRINCIPLES_CONTENT[principleId];
  currentSource = data[source] ? source : 'unesco';
  elements.tooltipTitle.textContent = data.title;

  elements.tooltipTabs.forEach(tab => {
    const hasContent = Boolean(data[tab.dataset.source]);
    tab.hidden = !hasContent;
    tab.classList.toggle('active', tab.dataset.source === currentSource);
  });

  elements.tooltipBody.innerHTML = data[currentSource] || '';
  elements.principleTooltip.classList.remove('hidden');
}

function hidePrincipleTooltip() {
  if (!elements.principleTooltip) return;
  elements.principleTooltip.classList.add('hidden');
  currentPrincipleId = null;
}

// Abrir tooltip desde las cards
if (elements.principleButtons && elements.principleButtons.length) {
  elements.principleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const principleId = btn.dataset.principle;
      showPrincipleTooltip(principleId, 'unesco');
    });
  });
}

// Cambiar entre UNESCO / ANEP
if (elements.tooltipTabs && elements.tooltipTabs.length) {
  elements.tooltipTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      if (!currentPrincipleId) return;
      const source = tab.dataset.source;
      showPrincipleTooltip(currentPrincipleId, source);
    });
  });
}

// Cerrar tooltip (botón X)
if (elements.tooltipClose) {
  elements.tooltipClose.addEventListener('click', hidePrincipleTooltip);
}

// Cerrar al hacer clic fuera
document.addEventListener('click', (evt) => {
  if (!elements.principleTooltip || elements.principleTooltip.classList.contains('hidden')) return;
  const isTooltip = elements.principleTooltip.contains(evt.target);
  const isButton = evt.target.closest && evt.target.closest('.principle-info-btn');
  if (!isTooltip && !isButton) hidePrincipleTooltip();
});

/* ========================================
   MANEJO DE PAÍS
   ======================================== */
if (elements.countrySelect && elements.countryFinalInput) {
  const updateCountryFinal = () => {
    const value = elements.countrySelect.value;
    if (value === 'Otro') {
      if (elements.countryOtherWrapper) {
        elements.countryOtherWrapper.style.display = 'block';
      }
      if (elements.countryOtherInput) {
        elements.countryFinalInput.value = elements.countryOtherInput.value.trim();
      }
    } else {
      if (elements.countryOtherWrapper) {
        elements.countryOtherWrapper.style.display = 'none';
      }
      if (elements.countryOtherInput) {
        elements.countryOtherInput.value = '';
      }
      elements.countryFinalInput.value = value;
    }

    if (window.state) {
      window.state.country = elements.countryFinalInput.value || 'Uruguay';
      if (window.state.profile && typeof updateNivelEducativo === 'function') {
        updateNivelEducativo(window.state.profile);
      }
    }
  };

  elements.countrySelect.addEventListener('change', updateCountryFinal);

  if (elements.countryOtherInput) {
    elements.countryOtherInput.addEventListener('input', () => {
      if (elements.countrySelect.value === 'Otro') {
        elements.countryFinalInput.value = elements.countryOtherInput.value.trim();
        if (window.state) {
          window.state.country = elements.countryFinalInput.value;
        }
      }
    });
  }

  updateCountryFinal();
}

/* ========================================
   🆕 MANEJO DE NIVEL EDUCATIVO
   ======================================== */
function updateNivelEducativo(perfil) {
  if (!elements.nivelEducativoWrapper || !elements.nivelEducativo) return;

  // Mostrar el campo
  elements.nivelEducativoWrapper.style.display = 'block';

  // Actualizar label según perfil
  if (elements.nivelEducativoLabel) {
    elements.nivelEducativoLabel.textContent = 
      perfil === 'docente' ? '¿En qué nivel trabajás?' : '¿En qué nivel estudiás?';
  }

  // Limpiar opciones anteriores
  elements.nivelEducativo.innerHTML = '<option value="">Seleccioná una opción</option>';

  // Cargar opciones según país y perfil
  const pais = (window.state && window.state.country) || 'Uruguay';
  const lang = (window.state && window.state.lang) || 'es';
  const t = TRANSLATIONS[lang] || TRANSLATIONS['es'];
  
  const configPais = NIVELES_POR_PAIS[pais] || DEFAULT_INTERNATIONAL_NIVELES;
  const nivelesObj = configPais[perfil] || DEFAULT_INTERNATIONAL_NIVELES[perfil];
  const niveles = nivelesObj.map(item => t[item.key] || item.default);
  
  niveles.forEach(nivel => {
    const option = document.createElement('option');
    option.value = nivel;
    option.textContent = nivel;
    elements.nivelEducativo.appendChild(option);
  });

  // Reset valor
  elements.nivelEducativo.value = '';
  
  // Sincronizar con state
  if (window.state) {
    window.state.nivelEducativo = '';
  }

  // Ocultar select nativo y generar chips
  elements.nivelEducativo.style.display = 'none';
  const chipsContainer = document.getElementById('nivelEducativoChips');
  if (chipsContainer) {
    chipsContainer.innerHTML = '';
    niveles.forEach(nivel => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chip select-chip';
      btn.textContent = nivel;
      btn.dataset.value = nivel;

      btn.addEventListener('click', () => {
        chipsContainer.querySelectorAll('.select-chip').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        elements.nivelEducativo.value = nivel;
        elements.nivelEducativo.dispatchEvent(new Event('change'));
      });
      chipsContainer.appendChild(btn);
    });
  }

  // Actualizar botón de inicio
  updateStartButtonState();
}

function hideNivelEducativo() {
  if (!elements.nivelEducativoWrapper) return;
  elements.nivelEducativoWrapper.style.display = 'none';
  if (elements.nivelEducativo) {
    elements.nivelEducativo.value = '';
  }
  const chipsContainer = document.getElementById('nivelEducativoChips');
  if (chipsContainer) {
    chipsContainer.querySelectorAll('.select-chip').forEach(c => c.classList.remove('active'));
  }
  if (window.state) {
    window.state.nivelEducativo = '';
  }
}

// Listener para cambios en nivel educativo
if (elements.nivelEducativo) {
  elements.nivelEducativo.addEventListener('change', () => {
    if (window.state) {
      window.state.nivelEducativo = elements.nivelEducativo.value || '';
    }
    updateStartButtonState();
  });
}

/* ========================================
   CONSENTIMIENTO DE REGISTRO
   ======================================== */
if (elements.consentTracking) {
  const syncConsentTracking = () => {
    if (window.state) {
      window.state.consentTracking = elements.consentTracking.checked;
    }
    if (elements.consentTracking.checked && typeof sendVisitToServer === 'function') {
      sendVisitToServer().finally(cargarEstadisticasAnonimas);
    }
    // 🔧 AGREGADO: Validar botón cuando cambia el consentimiento
    updateStartButtonState();
  };

  elements.consentTracking.addEventListener('change', syncConsentTracking);
  elements.consentTracking.addEventListener('input', syncConsentTracking);

  if (window.state) {
    window.state.consentTracking = elements.consentTracking.checked;
  }
}

/* ========================================
   🔧 CARRUSEL (CORREGIDO PARA 2 SLIDES)
   ======================================== */
function updateCarousel() {
  if (!elements.carouselTrack) return;

  const offset = -state.currentSlide * 100;
  elements.carouselTrack.style.transform = `translateX(${offset}%)`;

  const activeSlide = elements.carouselTrack.children[state.currentSlide];
  Array.from(elements.carouselTrack.children).forEach((slide, index) => {
    slide.classList.toggle('is-active', index === state.currentSlide);
    slide.classList.toggle('is-before', index < state.currentSlide);
    slide.classList.toggle('is-after', index > state.currentSlide);
  });

  if (activeSlide) {
    const adjustHeight = () => {
      if (activeSlide.offsetHeight > 0) {
        elements.carouselTrack.style.height = `${activeSlide.offsetHeight}px`;
      }
    };
    adjustHeight();
    // Ajuste secundario para asegurar que el reflow del navegador haya terminado
    setTimeout(adjustHeight, 50);
  }

  if (elements.carouselDots && elements.carouselDots.length) {
    elements.carouselDots.forEach((dot, index) => 
      dot.classList.toggle('active', index === state.currentSlide)
    );
  }

  if (elements.prevSlide) {
    elements.prevSlide.style.display = state.currentSlide === 0 ? 'none' : 'block';
  }

  if (!elements.nextSlide || !elements.startBtn) return;

  // ✅ CORREGIDO: Ahora verifica Slide 2 (índice 1) en lugar de Slide 3 (índice 2)
  const hasOnboardingFlow = elements.onboardingNextBtn && elements.onboardingSteps && elements.onboardingSteps.length;
  if (state.currentSlide === 1) {
    elements.nextSlide.classList.add('hidden');
    elements.startBtn.classList.toggle('hidden', !!hasOnboardingFlow);
  } else {
    elements.nextSlide.classList.remove('hidden');
    elements.startBtn.classList.add('hidden');
  }
}

// Navegación carrusel
if (elements.prevSlide) {
  elements.prevSlide.addEventListener('click', () => { 
    if (state.currentSlide > 0) { 
      state.currentSlide--; 
      updateCarousel(); 
      updateStartButtonState();
    }
  });
}

if (elements.toggleFrameworkBtn) {
  elements.toggleFrameworkBtn.addEventListener('click', () => {
    if (!elements.frameworkCard) return;
    const expanded = elements.frameworkCard.classList.toggle('framework-expanded');
    elements.toggleFrameworkBtn.textContent = expanded ? 'Ocultar marcos' : 'Ver marcos';
  });
}

if (elements.aiUseDisclosureBtn) {
  elements.aiUseDisclosureBtn.addEventListener('click', () => {
    modal.show('Declaración de uso de IA', `
      <div class="ai-disclosure-modal">
        <p>
          Esta herramienta fue construida con asistencia de inteligencia artificial generativa en tareas de ideación, redacción, revisión de interfaz, organización de código y mejora progresiva de la experiencia de usuario.
        </p>
        <p>
          El uso de IA se realizó bajo criterios de transparencia, supervisión humana, protección de datos, verificación, pertinencia pedagógica y mejora continua, coherentes con los marcos de ANEP, UNESCO, FING, Udelar y Ceibal integrados en la propia herramienta.
        </p>
        <ul>
          <li><strong>Responsabilidad humana:</strong> las decisiones pedagógicas, conceptuales y de diseño fueron revisadas y validadas por los autores.</li>
          <li><strong>Trazabilidad:</strong> los cambios se aplicaron de forma incremental, revisando funcionamiento, accesibilidad, legibilidad y coherencia ética.</li>
          <li><strong>Límites:</strong> la IA no sustituye el juicio profesional ni garantiza ausencia de errores; por eso se mantiene revisión humana y actualización permanente.</li>
          <li><strong>Coherencia ética:</strong> declarar este uso forma parte del mismo principio de transparencia que la herramienta propone para prácticas educativas con IAG.</li>
        </ul>
      </div>
    `);
  });
}

const FRAMEWORK_AUDIENCE_COPY = {
  estudiante: {
    title: 'Criterios para usar IA en tareas y estudio',
    intro: 'Un recorrido breve para revisar transparencia, verificación, privacidad y aporte propio sin cargar la pantalla con toda la fundamentación.',
    context: 'La fundamentación queda disponible como apoyo: podés consultarla si querés profundizar, pero el recorrido prioriza decisiones concretas para estudiar y producir con responsabilidad.',
    button: 'Ver marcos'
  },
  docente: {
    title: 'Criterios para orientar prácticas de aula',
    intro: 'Una guía para pensar consignas, evaluación, acompañamiento y acuerdos de uso de IA con estudiantes.',
    context: 'Como docentes, necesitamos criterios claros para definir cuándo se permite la IA, cómo se declara, qué se verifica y cómo se evalúa el aporte humano.',
    button: 'Ver marcos'
  },
  especializado: {
    title: 'Marcos para formación, investigación y criterios compartidos',
    intro: 'Una lectura ampliada para quienes investigan, forman o acompañan procesos sobre IA educativa.',
    context: 'Desde la formación, la investigación y la experiencia situada, estos marcos permiten construir criterios compartidos, transparentes y pedagógicamente defendibles.',
    button: 'Ocultar marcos'
  }
};

function updateFrameworkAudience(perfil) {
  if (!elements.frameworkCard) return;
  const audience = perfil || 'none';
  const isForeign = isForeignCountry();
  const baseTitle = isForeign ? 'Marco Internacional de la UNESCO (IA Generativa en Educación)' : 'Marcos de UNESCO, ANEP, FING, Udelar y Ceibal';
  const copy = FRAMEWORK_AUDIENCE_COPY[audience] || {
    title: baseTitle,
    intro: 'Elegí un perfil para adaptar la profundidad de la fundamentación y hacer el recorrido más liviano.',
    context: isForeign ? 'Para países fuera de Uruguay, la herramienta adapta las referencias priorizando las directrices internacionales de la UNESCO.' : 'La herramienta adapta la densidad de los marcos según el lugar desde el que se realiza el recorrido.',
    button: 'Ver marcos'
  };
  if (isForeign) {
    copy.title = 'Marco Internacional de la UNESCO';
  }

  elements.frameworkCard.dataset.audience = audience;
  elements.frameworkCard.classList.toggle('framework-expanded', audience === 'especializado');

  if (elements.frameworkAudienceTitle) elements.frameworkAudienceTitle.textContent = copy.title;
  if (elements.frameworkAudienceIntro) elements.frameworkAudienceIntro.textContent = copy.intro;
  if (elements.frameworkContextText) elements.frameworkContextText.textContent = copy.context;
  if (elements.toggleFrameworkBtn) elements.toggleFrameworkBtn.textContent = copy.button;
}
if (elements.nextSlide) {
  elements.nextSlide.addEventListener('click', () => { 
    // ✅ CORREGIDO: Máximo slide es 1 (antes era 2)
    if (state.currentSlide < 1) { 
      state.currentSlide++; 
      updateCarousel(); 
      updateStartButtonState();
      if (state.currentSlide === 1) {
        scrollToDiagnosticStart();
      }
    }
  });
}
if (elements.carouselDots && elements.carouselDots.length) {
  elements.carouselDots.forEach((dot, index) => 
    dot.addEventListener('click', () => { 
      state.currentSlide = index; 
      updateCarousel(); 
      updateStartButtonState();
    })
  );
}

const goToDiagnosticBtn = document.getElementById('goToDiagnosticBtn');
function scrollToDiagnosticStart() {
  const target = document.getElementById('diagnosticoInicio');
  if (!target) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;

  window.setTimeout(() => {
    updateCarousel();
    const headerOffset = 88;
    const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top: Math.max(0, top), behavior: 'auto' });
  }, 120);
}

function focusInitialField(targetKey) {
  const targetMap = {
    profile: elements.profileSelectorPanel,
    nivel: elements.nivelEducativoWrapper,
    contexto: elements.playerName || elements.countrySelect,
    familiaridad: elements.familiaridadInicialWrapper,
    recursos: elements.recursosSimilaresWrapper,
    start: elements.startBtn
  };
  const focusMap = {
    nivel: elements.nivelEducativo,
    contexto: elements.playerName || elements.countrySelect,
    familiaridad: elements.familiaridadInicial,
    recursos: elements.recursosSimilaresRadios && elements.recursosSimilaresRadios[0],
    start: elements.startBtn
  };
  const target = targetMap[targetKey];
  if (!target) return;

  target.classList.add('field-guidance-highlight');
  target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  window.setTimeout(() => {
    const focusTarget = focusMap[targetKey];
    if (focusTarget && typeof focusTarget.focus === 'function') {
      focusTarget.focus({ preventScroll: true });
    }
  }, 350);
  window.setTimeout(() => target.classList.remove('field-guidance-highlight'), 1800);
}

function renderStartGuidance(missingItems, ready) {
  if (!elements.startGuidance || !elements.startGuidanceList) return;

  elements.startGuidance.classList.toggle('is-ready', ready);
  if (elements.startGuidanceBadge) {
    elements.startGuidanceBadge.textContent = ready ? 'Listo' : `${missingItems.length} pendiente(s)`;
  }
  if (elements.startGuidanceTitle) {
    elements.startGuidanceTitle.textContent = ready
      ? 'Listo, ya podés iniciar el recorrido'
      : 'Completá estos pasos para iniciar';
  }

  if (ready) {
    elements.startGuidanceList.innerHTML = `
      <button type="button" class="start-guidance-item is-complete" data-guide-target="start">
        <span>✓</span>
        <strong>Todo preparado</strong>
        <small>El botón Iniciar cuestionario ya está disponible.</small>
      </button>
    `;
    return;
  }

  elements.startGuidanceList.innerHTML = missingItems.map((item, index) => `
    <button type="button" class="start-guidance-item" data-guide-target="${item.target}">
      <span>${index + 1}</span>
      <strong>${item.title}</strong>
      <small>${item.help}</small>
    </button>
  `).join('');
}

const ONBOARDING_STEP_META = {
  profile: {
    title: 'Punto de partida',
    target: 'profile',
    isValid: () => !!state.profile
  },
  contexto: {
    title: 'Tu contexto',
    target: 'contexto',
    isValid: () => {
      const levelOk = !(state.profile === 'docente' || state.profile === 'estudiante')
        || (elements.nivelEducativo && elements.nivelEducativo.value.trim() !== '');
      const countryOk = (elements.countrySelect && elements.countrySelect.value.trim() !== '');
      return levelOk && countryOk;
    }
  },
  cierre: {
    title: 'Uso y Privacidad',
    target: 'start',
    isValid: () => {
      const famOk = elements.familiaridadInicial && elements.familiaridadInicial.value.trim() !== '';
      const recsOk = elements.recursosSimilaresRadios
        && Array.from(elements.recursosSimilaresRadios).some(r => r.checked);
      return famOk && recsOk;
    }
  }
};

function getOnboardingStepKeys() {
  return ['profile', 'contexto', 'cierre'];
}

function syncOnboardingStepBounds() {
  const keys = getOnboardingStepKeys();
  if (!Number.isInteger(state.onboardingStep)) state.onboardingStep = 0;
  state.onboardingStep = Math.max(0, Math.min(state.onboardingStep, keys.length - 1));
  return keys;
}

function isCountryOtherVisible() {
  return elements.countrySelect && elements.countrySelect.value === 'Otro';
}

function updateOnboardingUI() {
  if (!elements.onboardingSteps || !elements.onboardingSteps.length) return;
  const keys = syncOnboardingStepBounds();
  const activeKey = keys[state.onboardingStep] || keys[0];

  elements.onboardingSteps.forEach(step => {
    const key = step.dataset.onboardingStep;
    const isActive = key === activeKey;
    const isCountryOther = step.id === 'countryOtherWrapper';
    step.classList.toggle('active', isActive && (!isCountryOther || isCountryOtherVisible()));
  });

  const lang = (window.state && window.state.lang) || 'es';
  const t = TRANSLATIONS[lang] || TRANSLATIONS['es'];

  if (elements.onboardingStepCounter) {
    const stepWord = t.step_word || 'Paso';
    const ofWord = t.question_counter_of || 'de';
    elements.onboardingStepCounter.textContent = `${stepWord} ${state.onboardingStep + 1} ${ofWord} ${keys.length}`;
  }
  if (elements.onboardingStepTitle) {
    elements.onboardingStepTitle.textContent = t[`step_${activeKey}`] || ONBOARDING_STEP_META[activeKey]?.title || 'Punto de partida';
  }
  if (elements.onboardingDots) {
    elements.onboardingDots.style.setProperty('--onboarding-steps', keys.length);
    
    // Nombres cortos para cada paso en la red neuronal
    const t = TRANSLATIONS[state.lang || 'es'] || TRANSLATIONS['es'];
    const stepNames = {
      profile: t.step_perfil || 'Perfil',
      contexto: t.step_contexto || 'Contexto',
      cierre: t.step_cierre || 'Uso y privacidad'
    };
    
    elements.onboardingDots.innerHTML = `
      <div class="neural-stepper-track">
        <div class="neural-stepper-progress" style="width: ${(state.onboardingStep / (keys.length - 1)) * 100}%"></div>
      </div>
      <div class="neural-stepper-steps">
        ${keys.map((key, index) => {
          const isActive = index === state.onboardingStep;
          const isCompleted = index < state.onboardingStep;
          const isValid = ONBOARDING_STEP_META[key]?.isValid();
          const stepName = stepNames[key] || 'Paso';
          
          return `
            <button type="button" 
                    class="neural-step-node${isActive ? ' active' : ''}${isCompleted ? ' completed' : ''}${isValid ? ' is-valid' : ''}" 
                    data-onboarding-index="${index}" 
                    aria-label="Ir al paso: ${stepName}">
              <span class="neural-step-dot"></span>
              <span class="neural-step-label">${stepName}</span>
            </button>
          `;
        }).join('')}
      </div>
    `;
  }
  if (elements.onboardingBackBtn) {
    elements.onboardingBackBtn.disabled = state.onboardingStep === 0;
  }
  if (elements.onboardingControls) {
    elements.onboardingControls.classList.toggle('is-consent-step', activeKey === 'cierre');
  }
  if (elements.onboardingNextBtn) {
    const isLast = state.onboardingStep === keys.length - 1;
    elements.onboardingNextBtn.textContent = isLast ? 'Iniciar cuestionario' : 'Siguiente';
  }

  updateCarousel();
}

function currentOnboardingStepIsValid() {
  const keys = syncOnboardingStepBounds();
  const activeKey = keys[state.onboardingStep] || keys[0];
  return ONBOARDING_STEP_META[activeKey]?.isValid() !== false;
}

function findFirstInvalidOnboardingIndex(keys = syncOnboardingStepBounds()) {
  return keys.findIndex(key => ONBOARDING_STEP_META[key]?.isValid() === false);
}

function focusCurrentOnboardingStep() {
  const keys = syncOnboardingStepBounds();
  const activeKey = keys[state.onboardingStep] || keys[0];
  const target = ONBOARDING_STEP_META[activeKey]?.target || activeKey;
  focusInitialField(target);
}

function advanceOnboarding() {
  const keys = syncOnboardingStepBounds();
  if (!currentOnboardingStepIsValid()) {
    focusCurrentOnboardingStep();
    return;
  }

  if (state.onboardingStep >= keys.length - 1) {
    const invalidIndex = findFirstInvalidOnboardingIndex(keys);
    if (invalidIndex >= 0) {
      state.onboardingStep = invalidIndex;
      updateOnboardingUI();
      updateStartButtonState();
      window.setTimeout(focusCurrentOnboardingStep, 120);
      return;
    }

    // Si es perfil Docente, dar opción de iniciar cuestionario o entrar a Casos
    if (state.profile === 'docente') {
      mostrarDecisionModoDocente();
      return;
    }

    if (elements.startGuidanceTitle) {
      elements.startGuidanceTitle.textContent = 'Iniciando recorrido...';
    }

    if (typeof window.iniciarJuego === 'function') {
      window.iniciarJuego();
    } else {
      console.error('No se pudo iniciar: window.iniciarJuego no está disponible.');
      if (elements.startGuidanceTitle) {
        elements.startGuidanceTitle.textContent = 'No se pudo iniciar. Recargá la página e intentá de nuevo.';
      }
    }
    return;
  }

  state.onboardingStep += 1;
  updateOnboardingUI();
}

function mostrarDecisionModoDocente() {
  const content = `
    <div class="mode-selection-modal-body" style="text-align: center; padding: 1rem 0;">
      <p style="margin-bottom: 1.5rem; font-size: 1.05rem; line-height: 1.5; color: var(--text-secondary);">
        Como docente, tenés la opción de realizar el cuestionario reflexivo para evaluar tu práctica con inteligencia artificial generativa, o ingresar de manera directa al **Laboratorio de Casos (Modo Taller)**.
      </p>
      <div style="display: flex; flex-direction: column; gap: 1rem; max-width: 320px; margin: 0 auto;">
        <button type="button" class="btn btn-primary" id="btnChooseQuiz" style="padding: 0.85rem; font-size: 1rem; width: 100%;">
          📝 Iniciar cuestionario reflexivo
        </button>
        <button type="button" class="btn btn-outline" id="btnChooseLab" style="padding: 0.85rem; font-size: 1rem; width: 100%; border-color: var(--primary); color: var(--primary); background: var(--bg-main);">
          🧪 Entrar al Laboratorio de Casos
        </button>
      </div>
    </div>
  `;
  
  if (typeof modal !== 'undefined' && typeof modal.show === 'function') {
    modal.show('¿Qué recorrido deseás realizar?', content);
    
    const btnQuiz = document.getElementById('btnChooseQuiz');
    const btnLab = document.getElementById('btnChooseLab');
    
    if (btnQuiz) {
      btnQuiz.addEventListener('click', () => {
        modal.hide();
        if (elements.startGuidanceTitle) {
          elements.startGuidanceTitle.textContent = 'Iniciando recorrido...';
        }
        if (typeof window.iniciarJuego === 'function') {
          window.iniciarJuego();
        }
      });
    }
    
    if (btnLab) {
      btnLab.addEventListener('click', () => {
        modal.hide();
        if (typeof abrirLaboratorioCasos === 'function') {
          abrirLaboratorioCasos();
        }
      });
    }
  }
}

function retreatOnboarding() {
  syncOnboardingStepBounds();
  state.onboardingStep = Math.max(0, state.onboardingStep - 1);
  updateOnboardingUI();
}

const landingGoToDiagnostic = document.getElementById('landingGoToDiagnostic');
const landingGoToCases = document.getElementById('landingGoToCases');

if (landingGoToDiagnostic) {
  landingGoToDiagnostic.addEventListener('click', (event) => {
    event.preventDefault();
    state.currentSlide = 1;
    updateCarousel();
    updateStartButtonState();
    scrollToDiagnosticStart();
  });
}

if (landingGoToCases) {
  landingGoToCases.addEventListener('click', (event) => {
    event.preventDefault();
    if (typeof abrirLaboratorioCasos === 'function') {
      abrirLaboratorioCasos();
    }
  });
}

if (goToDiagnosticBtn) {
  goToDiagnosticBtn.addEventListener('click', (event) => {
    event.preventDefault();
    state.currentSlide = 1;
    updateCarousel();
    updateStartButtonState();
    scrollToDiagnosticStart();
  });
}

if (elements.startGuidance) {
  elements.startGuidance.addEventListener('click', (event) => {
    const button = event.target.closest('[data-guide-target]');
    if (!button) return;
    
    const target = button.dataset.guideTarget;
    let targetStepIndex = -1;
    if (target === 'profile') targetStepIndex = 0;
    else if (target === 'nivel' || target === 'contexto') targetStepIndex = 1;
    else if (target === 'familiaridad' || target === 'recursos' || target === 'cierre' || target === 'start') targetStepIndex = 2;
    
    if (targetStepIndex >= 0) {
      state.onboardingStep = targetStepIndex;
      updateOnboardingUI();
    }
    
    focusInitialField(target);
  });
}

// 🧪 Botones para el Modo Laboratorio de Casos
const goToCasesBtn = document.getElementById('goToCasesBtn');
const btnVerCasosDirecto = document.getElementById('btnVerCasosDirecto');

if (goToCasesBtn) {
  goToCasesBtn.addEventListener('click', (event) => {
    event.preventDefault();
    if (typeof abrirLaboratorioCasos === 'function') {
      abrirLaboratorioCasos();
    }
  });
}

if (btnVerCasosDirecto) {
  btnVerCasosDirecto.addEventListener('click', (event) => {
    event.preventDefault();
    if (typeof abrirLaboratorioCasos === 'function') {
      abrirLaboratorioCasos();
    }
  });
}

// 💡 Alternar descripción de ayuda colapsable
document.addEventListener('click', (event) => {
  const toggleBtn = event.target.closest('#toggleHelpBtn');
  if (toggleBtn) {
    const wrapper = document.getElementById('questionHelpWrapper');
    if (wrapper) {
      const isExpanded = wrapper.classList.toggle('expanded');
      toggleBtn.classList.toggle('active', isExpanded);
      toggleBtn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
    }
  }
});

if (elements.onboardingNextBtn) {
  elements.onboardingNextBtn.addEventListener('click', advanceOnboarding);
}

if (elements.onboardingBackBtn) {
  elements.onboardingBackBtn.addEventListener('click', retreatOnboarding);
}

if (elements.onboardingDots) {
  elements.onboardingDots.addEventListener('click', (event) => {
    const dot = event.target.closest('[data-onboarding-index]');
    if (!dot) return;
    const requested = Number(dot.dataset.onboardingIndex);
    if (!Number.isInteger(requested)) return;
    const keys = syncOnboardingStepBounds();
    const firstInvalid = findFirstInvalidOnboardingIndex(keys);
    state.onboardingStep = firstInvalid >= 0 ? Math.min(requested, firstInvalid) : requested;
    updateOnboardingUI();
    if (firstInvalid >= 0 && requested > firstInvalid) {
      window.setTimeout(focusCurrentOnboardingStep, 120);
    }
  });
}

/* ========================================
   🔧 HABILITAR / DESHABILITAR BOTÓN INICIO (CORREGIDO)
   ======================================== */
/* ========================================
   🔧 HABILITAR / DESHABILITAR BOTÓN INICIO (RECTIFICADA)
   ======================================== */
function updateStartButtonState() {
  if (!elements.startBtn) return false;

  debugLog('Validando formulario');
  const missingItems = [];

  // 1) Perfil elegido
  const activeProfile = document.querySelector('.chip.active');
  if (activeProfile && window.state) {
    window.state.profile = activeProfile.dataset.profile || window.state.profile;
  }
  const perfilOk = !!state.profile;
  if (!perfilOk) {
    missingItems.push({
      target: 'profile',
      title: 'Elegí tu perfil',
      help: 'Seleccioná Estudiante, Docente o Docente/investigador/a.'
    });
  }
  debugLog('Perfil OK:', perfilOk, '| Valor:', state.profile);

  // 2) Nivel educativo (obligatorio para docente/estudiante; no para perfil especializado)
  let nivelOk = true;
  if (state.profile === 'docente' || state.profile === 'estudiante') {
    if (elements.nivelEducativo) {
      nivelOk = elements.nivelEducativo.value.trim() !== '';
      if (!nivelOk) {
        missingItems.push({
          target: 'nivel',
          title: 'Indicá el nivel educativo',
          help: state.profile === 'docente' ? 'Elegí en qué nivel trabajás.' : 'Elegí en qué nivel estudiás.'
        });
      }
      debugLog('Nivel OK:', nivelOk, '| Valor:', elements.nivelEducativo.value);
    }
  } else {
    debugLog('Nivel OK: true (no requerido para este perfil)');
  }

  // 3) Familiaridad
  let famOk = true;
  if (elements.familiaridadInicial) {
    famOk = elements.familiaridadInicial.value.trim() !== '';
    if (!famOk) {
      missingItems.push({
        target: 'familiaridad',
        title: 'Completá tu familiaridad inicial',
        help: 'Esto ayuda a contextualizar la devolución final.'
      });
    }
    debugLog('Familiaridad OK:', famOk, '| Valor:', elements.familiaridadInicial.value);
  }

  // 4) Recursos similares
  let recursosOk = true;
  if (elements.recursosSimilaresRadios && elements.recursosSimilaresRadios.length) {
    recursosOk = Array.from(elements.recursosSimilaresRadios).some(r => r.checked);
    if (!recursosOk) {
      missingItems.push({
        target: 'recursos',
        title: 'Marcá si usaste recursos similares',
        help: 'Podés elegir Sí, No o No estoy seguro/a.'
      });
    }
    debugLog('Recursos OK:', recursosOk);
  }

  // 5) Consentimiento opcional: habilita registro anónimo, no bloquea el uso.
  if (elements.consentTracking) {
    if (window.state) {
      window.state.consentTracking = elements.consentTracking.checked;
    }
    debugLog('Consentimiento de registro:', elements.consentTracking.checked);
  }

  // 🔑 Lógica de Habilitación y Visibilidad
  const todasOk = perfilOk && nivelOk && famOk && recursosOk;
  const nextSlideBtn = document.getElementById('nextSlide');
  const hasOnboardingFlow = elements.onboardingNextBtn && elements.onboardingSteps && elements.onboardingSteps.length;

  debugLog('Resultado validación:', todasOk ? 'todas ok' : 'faltan campos');
  renderStartGuidance(missingItems, todasOk);
  updateOnboardingUI();
  
if (todasOk) {
  elements.startBtn.disabled = false;
  elements.startBtn.classList.toggle('hidden', !!hasOnboardingFlow);
  elements.startBtn.classList.add('enabled');

  if (nextSlideBtn) nextSlideBtn.classList.add('hidden');
} else {
  elements.startBtn.disabled = true;
  elements.startBtn.classList.add('hidden');
  elements.startBtn.classList.remove('enabled');

  if (nextSlideBtn) nextSlideBtn.classList.remove('hidden');
}

return todasOk;
}

/* ========================================
   🆕 SELECCIÓN DE PERFIL (ACTUALIZADO)
   ======================================== */
elements.chips.forEach(chip => {
  chip.addEventListener('click', () => {
    debugLog('Click en chip:', chip.dataset.profile);
    
    elements.chips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');

    const perfil = chip.dataset.profile;

    // ✅ Actualizar state
    if (window.state) {
      window.state.profile = perfil;
      debugLog('State actualizado - Perfil:', window.state.profile);
    } else {
      console.error('❌ window.state no existe!');
    }

    updateFrameworkAudience(perfil);

    // Mostrar nivel educativo según perfil
    if (perfil === 'docente' || perfil === 'estudiante') {
      updateNivelEducativo(perfil);
    } else {
      hideNivelEducativo();
    }

    updateStartButtonState();
  });
});

// Cambios en familiaridad inicial
if (elements.familiaridadInicial) {
  elements.familiaridadInicial.addEventListener('change', (e) => {
    debugLog('Familiaridad cambió:', e.target.value);
    if (window.state) {
      window.state.familiaridadInicial = e.target.value || '';
      debugLog('State actualizado - Familiaridad:', window.state.familiaridadInicial);
    }
    updateStartButtonState();
  });
}

// Cambios en recursos similares
if (elements.recursosSimilaresRadios && elements.recursosSimilaresRadios.length) {
  elements.recursosSimilaresRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      debugLog('Recursos cambió:', e.target.value);
      if (e.target.checked && window.state) {
        window.state.recursosSimilares = e.target.value;
        debugLog('State actualizado - Recursos:', window.state.recursosSimilares);
      }
      updateStartButtonState();
    });
  });
}


// Estado inicial
updateStartButtonState();
updateCarousel();

/* ========================================
   INFO MARCO ANEP
   ======================================== */
if (elements.infoBtn) {
  elements.infoBtn.addEventListener('click', () => {
    modal.show('Marcos sobre IA en Educación', `
      <p>Este cuestionario está basado en documentos y orientaciones de UNESCO, ANEP, FING, Udelar y Ceibal sobre el uso de IAG contextualizado a la educación.</p>
      <h4>Principios clave:</h4>
      <ul>
        <li>Verificación de información con fuentes confiables</li>
        <li>Transparencia en autoría y uso de IA</li>
        <li>Conciencia y mitigación de sesgos</li>
        <li>Valor agregado pedagógico humano</li>
        <li>Protección de datos y privacidad</li>
        <li>Desarrollo de pensamiento crítico</li>
      </ul>
    `);
  });
}

/* ========================================
   CAMBIO DE PANTALLAS
   ======================================== */
function showScreen(screenName) {
  document.body.classList.toggle('quiz-active', screenName === 'game');
  document.body.classList.toggle('result-active', screenName === 'result');

  Object.values(screens).forEach(screen => {
    if (screen) screen.classList.add('hidden');
  });
  if (screens[screenName]) {
    screens[screenName].classList.remove('hidden');
    screens[screenName].classList.add('fade-in');
  }

  // --- 🆕 LÓGICA DE ASISTENCIA PROACTIVA ---
  if (screenName === 'result') {
    activateResultTab(state.activeResultTab || 'sintesis');
    // Si el puntaje es bajo (margen de mejora o proceso inicial)
    if (window.state && window.state.evidence <= 40) {
      setTimeout(() => {
        const tooltip = document.getElementById('chatbotTooltip');
        if (tooltip) {
          tooltip.classList.remove('hidden');
          const p = tooltip.querySelector('p');
          if (p) p.innerText = "Analicé tus respuestas del recorrido y puedo ayudarte a priorizar mejoras. Hablemos.";
        }
        
        // Animamos el botón para llamar la atención
        const btn = document.querySelector('.chatbot-toggle');
        if (btn) btn.style.animation = "pulse 2s infinite";
      }, 1500);
    }
  }
}

/* ========================================
   BOTÓN "IA Educativa ANEP" (Inicio seguro)
   ======================================== */
const homeBtn = document.querySelector('.home-btn');

if (homeBtn) {
  homeBtn.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (screens.intro && !screens.intro.classList.contains('hidden')) {
      showScreen('intro');
      state.currentSlide = 0;
      updateCarousel();
      window.scrollTo(0, 0);
      return;
    }

    if (state.path && state.path.length > 0) {
      modal.show(
        'Confirmar salida',
        `
          <p style="line-height:1.6;">
            ¿Deseás volver al inicio?<br>
            <strong>Perderás el progreso actual de la recorrida.</strong>
          </p>
          <div style="display:flex; justify-content:flex-end; gap:0.5rem; margin-top:1rem;">
            <button id="cancelAbort" class="btn btn-secondary">Cancelar</button>
            <button id="confirmAbort" class="btn btn-danger">Aceptar</button>
          </div>
        `
      );

      setTimeout(() => {
        const cancelBtn = document.getElementById('cancelAbort');
        const confirmBtn = document.getElementById('confirmAbort');

        if (cancelBtn) {
          cancelBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            modal.hide();
          }, { once: true });
        }

        if (confirmBtn) {
          confirmBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            modal.hide();

            // Reset estado
            state.profile = null;
            state.name = '';
            state.currentId = null;
            state.path = [];
            state.evidence = 0;
            state.currentSlide = 0;
            state.onboardingStep = 0;
            state.country = 'Uruguay';
            state.nivelEducativo = '';
            state.familiaridadInicial = '';
            state.recursosSimilares = '';
            state.consentTracking = false;

            // Reset UI
            if (elements.chips && elements.chips.length) {
              elements.chips.forEach(c => c.classList.remove('active'));
            }
            if (elements.playerName) elements.playerName.value = '';

            // Reset nivel educativo
            hideNivelEducativo();

            if (elements.countrySelect) elements.countrySelect.value = 'Uruguay';
            if (elements.countryOtherWrapper) elements.countryOtherWrapper.style.display = 'none';
            if (elements.countryOtherInput) elements.countryOtherInput.value = '';
            if (elements.countryFinalInput) elements.countryFinalInput.value = 'Uruguay';

            if (elements.familiaridadInicial) elements.familiaridadInicial.value = '';
            if (elements.recursosSimilaresRadios && elements.recursosSimilaresRadios.length) {
              elements.recursosSimilaresRadios.forEach(r => { r.checked = false; });
            }
            if (elements.consentTracking) elements.consentTracking.checked = false;

            // Reset custom select chips in UI
            document.querySelectorAll('.select-chips').forEach(container => {
              container.querySelectorAll('.select-chip').forEach(c => c.classList.remove('active'));
              if (container.id === 'countryChips') {
                const uruguayChip = container.querySelector('[data-value="Uruguay"]');
                if (uruguayChip) uruguayChip.classList.add('active');
              }
            });

            updateStartButtonState();
            showScreen('intro');
            updateCarousel();
            window.scrollTo(0, 0);
          }, { once: true });
        }
      }, 50);

    } else {
      showScreen('intro');
      state.currentSlide = 0;
      updateCarousel();
      window.scrollTo(0, 0);
    }
  });
}
const btnVerAutores = document.getElementById('btnVerAutores');
if (btnVerAutores) {
  btnVerAutores.addEventListener('click', function() {
    if (typeof modal !== 'undefined' && typeof modal.show === 'function') {
      modal.show('¿Quiénes somos? — Autores de la app', `
        <div class="team-panel-modal" style="display: flex; flex-direction: column; gap: 1.5rem; padding: 0.5rem 0;">
          <div class="team-member-detail" style="display: flex; align-items: center; gap: 1.25rem; text-align: left;">
            <img src="icons/perfil.png" alt="Santiago Hernández" class="team-member-photo" style="width: 70px; height: 70px; border-radius: 50%; object-fit: cover; border: 2px solid var(--primary);">
            <div class="team-member-info">
              <h4 style="margin: 0 0 0.25rem; font-weight: 700; color: var(--text-primary); font-family: var(--font-header);">Prof. Esp. Santiago Hernández</h4>
              <p style="margin: 0 0 0.5rem; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4;">Creador y desarrollador de la app, Investigador y divulgador. Prof. de Informática Especializado en Tecnología Educativa.</p>
              <div class="links-autores" style="display: flex; gap: 0.75rem; font-size: 0.82rem;">
                <a href="https://orcid.org/0009-0001-9086-1490" target="_blank" rel="noopener noreferrer" style="color: var(--primary); text-decoration: none; font-weight: 600;">🔗 ORCID</a>
                <a href="https://exportcvuy.anii.org.uy/cv/?8242b38f35c3b4fc9b8d3442700f810e" target="_blank" rel="noopener noreferrer" style="color: var(--primary); text-decoration: none; font-weight: 600;">📄 CVUY</a>
              </div>
            </div>
          </div>

          <div style="height: 1px; background: var(--border); width: 100%;"></div>

          <div class="team-member-detail" style="display: flex; align-items: center; gap: 1.25rem; text-align: left;">
            <img src="icons/Diego.jpeg" alt="Diego Daluz" class="team-member-photo" style="width: 70px; height: 70px; border-radius: 50%; object-fit: cover; border: 2px solid var(--primary);">
            <div class="team-member-info">
              <h4 style="margin: 0 0 0.25rem; font-weight: 700; color: var(--text-primary); font-family: var(--font-header);">Prof. Mag. Diego Daluz</h4>
              <p style="margin: 0 0 0.5rem; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4;">Investigador, colaborador pedagógico, Prof. de Informática.</p>
              <div class="links-autores" style="display: flex; gap: 0.75rem; font-size: 0.82rem;">
                <a href="https://orcid.org/0009-0007-3089-6652" target="_blank" rel="noopener noreferrer" style="color: var(--primary); text-decoration: none; font-weight: 600;">🔗 ORCID</a>
                <a href="https://exportcvuy.anii.org.uy//cv/?45f1c3470336379350b15d2c38a19738" target="_blank" rel="noopener noreferrer" style="color: var(--primary); text-decoration: none; font-weight: 600;">📄 CVUY</a>
              </div>
            </div>
          </div>
        </div>
      `);
    }
  });
}

updateFrameworkAudience(state.profile || null);

function activateResultTab(tabName) {
  const activeTab = tabName || 'resumen';
  state.activeResultTab = activeTab;

  if (elements.resultTabs && elements.resultTabs.length) {
    elements.resultTabs.forEach(tab => {
      const isActive = tab.dataset.resultTab === activeTab;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  }

  if (elements.resultTabPanels && elements.resultTabPanels.length) {
    elements.resultTabPanels.forEach(panel => {
      panel.classList.toggle('active', panel.dataset.resultPanel === activeTab);
    });
  }
}

if (elements.resultTabs && elements.resultTabs.length) {
  elements.resultTabs.forEach(tab => {
    tab.addEventListener('click', () => activateResultTab(tab.dataset.resultTab));
  });
}

window.activateResultTab = activateResultTab;


/* ========================================
   🤖 INTEGRACIÓN PROACTIVA CON CHATBOT
   ======================================== */
function activarAsistenteProactivo(mensajeParaIA) {
  // 1. Abrir el chatbot si está cerrado (simulando click en el botón)
  const chatbotToggle = document.querySelector('.chatbot-toggle');
  const chatbotWindow = document.querySelector('.chatbot-window');
  
  if (chatbotToggle && chatbotWindow && !chatbotWindow.classList.contains('active')) {
    chatbotToggle.click();
  }

  // 2. Si hay un mensaje específico (ej: "ayudame a mejorar"), lo enviamos
  // Esto requiere que la función sendMessage sea accesible globalmente
  if (mensajeParaIA && window.sendMessage) {
    // Pequeño delay para que la animación de apertura termine
    setTimeout(() => {
      window.sendMessage(mensajeParaIA);
    }, 500);
  }
}











/* ========================================
   MODAL HERRAMIENTAS (se usa en resultados)
   ======================================== */
function mostrarHerramientas(tipo) {
  if (!modal) return;

  const grupos = {
    educativo: {
      titulo: 'Asistentes con uso educativo',
      intro: 'Herramientas útiles para estudiar, preparar materiales o trabajar con fuentes propias. Conviene usarlas con consignas claras, verificación humana y declaración de uso.',
      items: [
        {
          nombre: 'NotebookLM',
          url: 'https://notebooklm.google.com/',
          desc: 'Permite trabajar con documentos propios y obtener respuestas apoyadas en fuentes cargadas por el usuario.'
        },
        {
          nombre: 'ChatGPT',
          url: 'https://chatgpt.com/',
          desc: 'Asistente general para ideación, explicación, revisión de borradores y planificación, siempre con contraste de fuentes.'
        },
        {
          nombre: 'ChatGPT Edu',
          url: 'https://openai.com/chatgpt/education/',
          desc: 'Opción institucional para educación superior, con controles administrativos y de privacidad.'
        }
      ]
    },
    citador: {
      titulo: 'Búsqueda académica y citación',
      intro: 'Recursos para localizar fuentes, organizar bibliografía y sostener mejor la verificación. No reemplazan la lectura crítica de los textos.',
      items: [
        {
          nombre: 'Zotero',
          url: 'https://www.zotero.org/',
          desc: 'Gestor bibliográfico libre para organizar fuentes, insertar citas y crear bibliografías.'
        },
        {
          nombre: 'Semantic Scholar',
          url: 'https://www.semanticscholar.org/',
          desc: 'Buscador académico con apoyo de IA para explorar literatura científica y relaciones entre artículos.'
        },
        {
          nombre: 'Consensus',
          url: 'https://consensus.app/',
          desc: 'Buscador académico que vincula respuestas con artículos científicos y ayuda a revisar evidencia.'
        },
        {
          nombre: 'Elicit',
          url: 'https://elicit.com/',
          desc: 'Asistente para revisión de literatura, extracción de hallazgos y comparación de artículos.'
        }
      ]
    },
    sesgos: {
      titulo: 'Revisión crítica de sesgos',
      intro: 'Estos recursos pueden ayudar a detectar señales de sesgo, toxicidad o problemas de equidad, pero no ofrecen una validación definitiva. La revisión pedagógica y contextual sigue siendo central.',
      items: [
        {
          nombre: 'Perspective API',
          url: 'https://perspectiveapi.com/',
          desc: 'Analiza rasgos de toxicidad en texto. Útil como apoyo inicial, no como juicio automático.'
        },
        {
          nombre: 'IBM AI Fairness 360',
          url: 'https://aif360.res.ibm.com/',
          desc: 'Kit de herramientas para explorar métricas de equidad y sesgos en sistemas de IA.'
        },
        {
          nombre: 'Guía UNESCO sobre IAG',
          url: 'https://unesdoc.unesco.org/ark:/48223/pf0000389227',
          desc: 'Marco para discutir riesgos, equidad, inclusión y gobernanza en educación e investigación.'
        }
      ]
    },
    prompts: {
      titulo: 'Prompts éticos y reflexivos',
      intro: 'Recursos para diseñar consignas que pidan justificar, verificar, comparar fuentes y explicitar límites, en lugar de delegar todo el trabajo intelectual.',
      items: [
        {
          nombre: 'OpenAI - Prompt engineering',
          url: 'https://platform.openai.com/docs/guides/prompt-engineering',
          desc: 'Guía técnica para formular instrucciones claras, con criterios, contexto y ejemplos.'
        },
        {
          nombre: 'Anthropic - Prompt engineering',
          url: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview',
          desc: 'Orientaciones para estructurar instrucciones, ejemplos y criterios de salida.'
        },
        {
          nombre: 'Guía FING 2026',
          url: 'https://www.fing.edu.uy/sites/default/files/2026-02/guia-de-etica-fing_2026.pdf',
          desc: 'Incluye criterios sobre restricciones, documentación del proceso y explicación del razonamiento.'
        }
      ]
    }
  };

  const grupo = grupos[tipo] || grupos.educativo;
  const cuerpo = `
    <p class="tool-modal-intro">${grupo.intro}</p>
    <div class="tool-modal-list">
      ${grupo.items.map(item => `
        <a class="tool-link-card" href="${item.url}" target="_blank" rel="noopener noreferrer">
          <strong>${item.nombre}</strong>
          <span>${item.desc}</span>
        </a>
      `).join('')}
    </div>
    <p class="tool-modal-note">Sugerencia: usar cualquier herramienta junto con una consigna explícita de verificación, declaración de uso y revisión humana.</p>
  `;

  modal.show(grupo.titulo, cuerpo);
}

document.querySelectorAll('[data-tool-type]').forEach(card => {
  const openToolModal = () => mostrarHerramientas(card.dataset.toolType);
  card.addEventListener('click', openToolModal);
  card.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    openToolModal();
  });
});

/* ========================================
   ESTADÍSTICAS ANÓNIMAS
   ======================================== */
function formatNumber(value) {
  return new Intl.NumberFormat('es-UY').format(Number(value || 0));
}

function normalizeStatsCollection(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return Object.entries(value).map(([label, count]) => ({ label, count }));
}

const VALID_STATS_LEVELS = new Set([
  'Amplio margen de mejora',
  'En proceso inicial',
  'Desarrollo progresivo',
  'Prácticas consolidadas',
  'Nivel avanzado',
]);

const VALID_STATS_PROFILES = new Set(['docente', 'estudiante', 'especializado']);

const STATS_PROFILE_LABELS = {
  docente: 'Docente',
  estudiante: 'Estudiante',
  especializado: 'Docente/investigador/a',
};

function sanitizeStatsRows(rows, kind = 'generic') {
  return normalizeStatsCollection(rows)
    .filter(row => row && row.label)
    .map(row => ({
      label: String(row.label).trim(),
      count: Number(row.count || row.value || 0)
    }))
    .filter(row => Number.isFinite(row.count) && row.count > 0)
    .filter(row => {
      if (kind === 'levels') return VALID_STATS_LEVELS.has(row.label);
      if (kind === 'profiles') return VALID_STATS_PROFILES.has(row.label);
      return !/[<>]|onerror|script|REGISTRO_PRUEBA/i.test(row.label);
    })
    .map(row => ({
      ...row,
      label: kind === 'profiles' ? STATS_PROFILE_LABELS[row.label] : row.label
    }));
}

function resolveTopLevel(summary, levelRows) {
  if (VALID_STATS_LEVELS.has(summary.topLevel)) return summary.topLevel;
  return levelRows.length ? levelRows[0].label : '—';
}

function renderStatsBars(container, rows) {
  if (!container) return;
  const normalized = normalizeStatsCollection(rows)
    .filter(row => row && row.label)
    .map(row => ({
      label: String(row.label).trim(),
      count: Number(row.count || row.value || 0)
    }))
    .filter(row => Number.isFinite(row.count) && row.count > 0);

  if (!normalized.length) {
    container.innerHTML = `
      <div class="stats-empty-container">
        <span class="stats-empty-icon">📊</span>
        <p class="stats-empty">Sin registros suficientes en este momento</p>
      </div>
    `;
    return;
  }

  const max = Math.max(...normalized.map(row => row.count), 1);
  container.innerHTML = normalized.map(row => {
    const pct = Math.round((row.count / max) * 100);
    return `
      <div class="stats-bar-row">
        <div class="stats-bar-label">
          <span>${escapeHtml(row.label)}</span>
          <span>${formatNumber(row.count)}</span>
        </div>
        <div class="stats-bar-track">
          <div class="stats-bar-fill" style="width:${pct}%"></div>
        </div>
      </div>
    `;
  }).join('');
}

function renderStats(data) {
  const summary = data.summary || data;
  const levels = sanitizeStatsRows(data.levels || data.byLevel, 'levels');
  const profiles = sanitizeStatsRows(data.profiles || data.byProfile, 'profiles');
  const indicators = sanitizeStatsRows(data.indicators || data.weakIndicators, 'generic');
  const education = sanitizeStatsRows(data.education || data.byEducation, 'generic');
  const insight = data.insight || {};

  if (elements.statVisits) elements.statVisits.textContent = formatNumber(summary.visits || summary.totalVisits);
  if (elements.statCompleted) elements.statCompleted.textContent = formatNumber(summary.completed || summary.totalCompleted);
  if (elements.statAverage) elements.statAverage.textContent = summary.averageScore != null ? Number(summary.averageScore).toFixed(1) : '—';
  if (elements.statTopLevel) elements.statTopLevel.textContent = resolveTopLevel(summary, levels);

  renderStatsBars(elements.statsLevels, levels);
  renderStatsBars(elements.statsProfiles, profiles);
  renderStatsBars(elements.statsIndicators, indicators);
  renderStatsBars(elements.statsEducation, education);

  if (elements.statsInsight) {
    const focus = insight.focus || (indicators[0] ? indicators[0].label : 'Criterios de uso responsable');
    const recommendation = insight.recommendation || 'Reforzar acuerdos explícitos sobre transparencia, verificación, protección de datos y aporte humano.';
    elements.statsInsight.innerHTML = `
      <p><strong>Foco observado:</strong> ${escapeHtml(focus)}</p>
      <p>${escapeHtml(recommendation)}</p>
    `;
  }

  if (elements.statsStatus) elements.statsStatus.classList.add('hidden');
  if (elements.statsContent) elements.statsContent.classList.remove('hidden');
}

async function cargarEstadisticasAnonimas() {
  if (!elements.statsStatus || !CONFIG.statsEndpoint) return;

  elements.statsStatus.classList.remove('hidden');
  elements.statsStatus.textContent = 'Cargando estadísticas anónimas...';
  if (elements.statsContent) elements.statsContent.classList.add('hidden');

  try {
    const response = await fetch(CONFIG.statsEndpoint, { method: 'GET' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    renderStats(data);
  } catch (error) {
    console.warn('No se pudieron cargar estadísticas anónimas:', error);
    elements.statsStatus.innerHTML = `
      <div class="stats-offline-card">
        <div class="stats-offline-icon">🌐</div>
        <h4>Modo local / Sin conexión</h4>
        <p>Las estadísticas globales no están disponibles en este momento (se activarán automáticamente al desplegar la actualización en producción con el servidor de base de datos).</p>
        <div class="stats-offline-action-note">
          Puedes consultar tu <strong>Historial de Diagnósticos</strong> local en este dispositivo en la sección de abajo.
        </div>
      </div>
    `;
  }
}

if (elements.refreshStatsBtn) {
  elements.refreshStatsBtn.addEventListener('click', cargarEstadisticasAnonimas);
}

/* ========================================
   OPINIONES ANÓNIMAS
   ======================================== */
let currentOpinionIndex = 0;

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderOpinions(opinions) {
  if (!elements.opinionsCarousel || !elements.opinionsStatus) return;

  if (!opinions || !opinions.length) {
    elements.opinionsStatus.classList.remove('hidden');
    elements.opinionsStatus.textContent = 'Todavía no hay opiniones públicas suficientes.';
    elements.opinionsCarousel.classList.add('hidden');
    return;
  }

  currentOpinionIndex = 0;
  elements.opinionsCarousel.innerHTML = opinions.map((opinion, index) => {
    const stars = '★'.repeat(Math.max(1, Math.min(5, Number(opinion.rating || 0))));
    const meta = [opinion.profile, opinion.nivelEducativo].filter(Boolean).join(' · ');
    return `
      <article class="opinion-card ${index === 0 ? 'active' : ''}">
        <div class="opinion-rating" aria-label="Valoración ${Number(opinion.rating || 0)} de 5">${stars}</div>
        <blockquote>“${escapeHtml(opinion.suggestion)}”</blockquote>
        ${meta ? `<div class="opinion-meta">${escapeHtml(meta)}</div>` : ''}
      </article>
    `;
  }).join('');

  elements.opinionsStatus.classList.add('hidden');
  elements.opinionsCarousel.classList.remove('hidden');
}

function showOpinion(index) {
  if (!elements.opinionsCarousel) return;
  const cards = elements.opinionsCarousel.querySelectorAll('.opinion-card');
  if (!cards.length) return;

  currentOpinionIndex = (index + cards.length) % cards.length;
  cards.forEach((card, cardIndex) => {
    card.classList.toggle('active', cardIndex === currentOpinionIndex);
  });
}

async function cargarOpinionesAnonimas() {
  if (!elements.opinionsStatus || !CONFIG.opinionsEndpoint) return;

  elements.opinionsStatus.classList.remove('hidden');
  elements.opinionsStatus.textContent = 'Cargando opiniones...';

  try {
    const response = await fetch(CONFIG.opinionsEndpoint, {
      method: 'GET',
      cache: 'no-store'
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    renderOpinions(data.opinions || []);
  } catch (error) {
    console.warn('No se pudieron cargar opiniones anónimas:', error);
    elements.opinionsStatus.textContent = 'Las opiniones todavía no están disponibles.';
  }
}

if (elements.prevOpinionBtn) {
  elements.prevOpinionBtn.addEventListener('click', () => showOpinion(currentOpinionIndex - 1));
}
if (elements.nextOpinionBtn) {
  elements.nextOpinionBtn.addEventListener('click', () => showOpinion(currentOpinionIndex + 1));
}

/* ========================================
   HISTORIAL LOCAL DE DIAGNÓSTICOS
   ======================================== */
const LOCAL_HISTORY_KEY = 'iag_local_diagnostic_history';

function readLocalHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(LOCAL_HISTORY_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalHistory(items) {
  try {
    localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(items.slice(0, 6)));
  } catch (error) {
    console.warn('No se pudo guardar el historial local:', error);
  }
}

function saveLocalDiagnostic(record) {
  const history = readLocalHistory().filter(item => item && item.id !== record.id);
  history.unshift(record);
  writeLocalHistory(history);
  renderLocalHistory();
}

function renderLocalHistory() {
  if (!elements.localHistoryList) return;
  const history = readLocalHistory();

  if (!history.length) {
    elements.localHistoryList.innerHTML = '<p class="stats-empty">Todavía no hay diagnósticos guardados en este dispositivo.</p>';
    if (elements.clearLocalHistoryBtn) elements.clearLocalHistoryBtn.disabled = true;
    return;
  }

  if (elements.clearLocalHistoryBtn) elements.clearLocalHistoryBtn.disabled = false;
  elements.localHistoryList.innerHTML = history.map(item => `
    <article class="local-history-item">
      <div>
        <strong>${escapeHtml(item.level || 'Resultado')}</strong>
        <span>${escapeHtml(item.profile || 'Perfil no indicado')} · ${escapeHtml(item.date || '')}</span>
      </div>
      <p>${escapeHtml(item.summary || 'Diagnóstico guardado localmente.')}</p>
      <small>Puntaje: ${escapeHtml(item.evidence ?? '—')} · Foco: ${escapeHtml(item.focus || '—')}</small>
    </article>
  `).join('');
}

if (elements.clearLocalHistoryBtn) {
  elements.clearLocalHistoryBtn.addEventListener('click', () => {
    if (!window.confirm('¿Querés limpiar el historial guardado en este dispositivo?')) return;
    writeLocalHistory([]);
    renderLocalHistory();
  });
}

window.saveLocalDiagnostic = saveLocalDiagnostic;
window.renderLocalHistory = renderLocalHistory;

/* ========================================
   VALORACIÓN Y SUGERENCIAS
   ======================================== */
function getSelectedToolRating() {
  if (!elements.toolRatingRadios || !elements.toolRatingRadios.length) return '';
  const selected = Array.from(elements.toolRatingRadios).find(radio => radio.checked);
  return selected ? selected.value : '';
}

function buildToolFeedbackPayload() {
  return {
    eventType: 'feedback',
    timestamp: new Date().toISOString(),
    sessionId: typeof getAnalyticsSessionId === 'function' ? getAnalyticsSessionId() : '',
    rating: Number(getSelectedToolRating()),
    suggestion: elements.toolSuggestion ? elements.toolSuggestion.value.trim() : '',
    profile: state.profileBase || state.profile || '',
    profileKey: state.profileKey || '',
    country: state.country || '',
    nivelEducativo: state.nivelEducativo || '',
    consentTracking: !!state.consentTracking
  };
}

function enviarValoracionHerramienta() {
  if (!elements.sendToolFeedbackBtn || !CONFIG.dataEndpoint) return;

  const rating = getSelectedToolRating();
  if (!rating) {
    if (elements.toolFeedbackStatus) {
      elements.toolFeedbackStatus.textContent = 'Seleccioná una valoración del 1 al 5 para enviar tu aporte.';
      elements.toolFeedbackStatus.classList.add('is-warning');
    }
    return;
  }

  if (!state.consentTracking) {
    if (elements.toolFeedbackStatus) {
      elements.toolFeedbackStatus.textContent = 'Para guardar tu valoración, primero aceptá el registro anónimo de datos.';
      elements.toolFeedbackStatus.classList.add('is-warning');
    }
    return;
  }

  elements.sendToolFeedbackBtn.disabled = true;
  elements.sendToolFeedbackBtn.textContent = 'Enviando...';
  if (elements.toolFeedbackStatus) {
    elements.toolFeedbackStatus.textContent = 'Guardando tu valoración...';
    elements.toolFeedbackStatus.classList.remove('is-warning');
  }

  fetch(CONFIG.dataEndpoint, {
    method: 'POST',
    mode: 'cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildToolFeedbackPayload())
  })
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then(() => {
      elements.sendToolFeedbackBtn.textContent = 'Valoración enviada';
      if (elements.toolFeedbackStatus) {
        elements.toolFeedbackStatus.textContent = 'Gracias. Tu aporte quedó registrado de forma anónima.';
      }
      cargarOpinionesAnonimas();
    })
    .catch(err => {
      console.warn('No se pudo enviar la valoración:', err);
      elements.sendToolFeedbackBtn.disabled = false;
      elements.sendToolFeedbackBtn.textContent = 'Enviar valoración';
      if (elements.toolFeedbackStatus) {
        elements.toolFeedbackStatus.textContent = 'No se pudo enviar ahora. Probá nuevamente en unos segundos.';
        elements.toolFeedbackStatus.classList.add('is-warning');
      }
    });
}

function syncSelectWithChips(selectId, chipsContainerId) {
  const select = document.getElementById(selectId);
  const container = document.getElementById(chipsContainerId);
  if (!select || !container) return;

  // Ocultar select nativo
  select.style.display = 'none';

  // Leer opciones y construir chips
  const options = Array.from(select.options).filter(opt => opt.value !== "");
  container.innerHTML = '';
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chip select-chip';
    if (select.value === opt.value) {
      btn.classList.add('active');
    }
    btn.textContent = opt.textContent;
    btn.dataset.value = opt.value;

    btn.addEventListener('click', () => {
      container.querySelectorAll('.select-chip').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      select.value = opt.value;
      select.dispatchEvent(new Event('change'));
    });

    container.appendChild(btn);
  });
}

if (elements.sendToolFeedbackBtn) {
  elements.sendToolFeedbackBtn.addEventListener('click', enviarValoracionHerramienta);
}

/* ========================================
   🔧 SINCRONIZACIÓN INICIAL
   ======================================== */
// Ejecutar después de que todo se cargue
document.addEventListener('DOMContentLoaded', () => {
  debugLog('Sincronizando estado inicial...');
  
  // Sincronizar país y familiaridad inicial con chips
  // Selector de países en desplegable (sin chips)
  if (elements.languageSelect) {
    elements.languageSelect.value = state.lang || 'es';
    elements.languageSelect.addEventListener('change', (e) => {
      const newLang = e.target.value;
      state.lang = newLang;
      localStorage.setItem('app_lang', newLang);
      updateAppLanguage(newLang);
    });
  }
  updateAppLanguage(state.lang || 'es');
  syncSelectWithChips('familiaridadInicial', 'familiaridadChips');
  
  // Sincronizar perfil si hay un chip activo
  const activeChip = document.querySelector('.chip.active');
  if (activeChip && window.state) {
    const perfil = activeChip.dataset.profile;
    window.state.profile = perfil;
    debugLog('Perfil inicial sincronizado:', perfil);
    
    // Mostrar nivel educativo si corresponde
    if (perfil === 'docente' || perfil === 'estudiante') {
      updateNivelEducativo(perfil);
    } else {
      hideNivelEducativo();
    }
    updateFrameworkAudience(perfil);
  } else {
    updateFrameworkAudience(null);
  }
  
  // Sincronizar familiaridad inicial
  if (elements.familiaridadInicial && window.state) {
    window.state.familiaridadInicial = elements.familiaridadInicial.value || '';
    debugLog('Familiaridad inicial:', window.state.familiaridadInicial);
  }
  
  // Sincronizar recursos similares inicial
  if (elements.recursosSimilaresRadios && window.state) {
    const checkedRadio = Array.from(elements.recursosSimilaresRadios).find(r => r.checked);
    if (checkedRadio) {
      window.state.recursosSimilares = checkedRadio.value;
      debugLog('Recursos inicial:', window.state.recursosSimilares);
    }
  }
  
  // Sincronizar consentimiento inicial
  if (elements.consentTracking && window.state) {
    window.state.consentTracking = elements.consentTracking.checked;
    debugLog('Consentimiento inicial:', window.state.consentTracking);
  }
  
  // Validar estado del botón
  setTimeout(() => {
    debugLog('Validando estado inicial del botón...');
    updateStartButtonState();
  }, 100);

  cargarEstadisticasAnonimas();
  cargarOpinionesAnonimas();
  renderLocalHistory();
  initNeuralNetBackground();

  setTimeout(mostrarGuiaRapidaInicial, 450);
});

window.addEventListener('resize', () => {
  updateCarousel();
});

if (elements.downloadAgreementBtn) {
  elements.downloadAgreementBtn.addEventListener('click', () => {
    descargarAcuerdoPDF();
  });
}

async function descargarAcuerdoPDF() {
  const btn = elements.downloadAgreementBtn;
  const txtArea = elements.agreementBuilderText;
  const status = elements.agreementBuilderStatus;
  
  if (!txtArea || !txtArea.value.trim()) return;
  
  const text = txtArea.value.trim();
  
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Generando...';
  }
  
  const cargarJsPDF = () => {
    return new Promise((resolve) => {
      if (window.jspdf && window.jspdf.jsPDF) {
        resolve();
        return;
      }
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      s.onload = () => resolve();
      s.onerror = () => resolve();
      document.body.appendChild(s);
    });
  };

  try {
    await cargarJsPDF();
    if (!window.jspdf || !window.jspdf.jsPDF) {
      if (status) {
        status.textContent = 'Error al cargar jsPDF. Comprobá tu conexión.';
        status.style.color = 'var(--warning)';
      }
      return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    
    // Encabezado
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, 210, 30, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text("ACUERDO DIDÁCTICO PARA EL USO DE IA", 15, 14);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text("Políticas acordadas y orientaciones para actividades de aula", 15, 22);
    
    doc.setTextColor(31, 41, 55);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    const lines = doc.splitTextToSize(text, 180);
    let y = 45;
    
    lines.forEach(line => {
      if (y > 275) {
        doc.addPage();
        y = 20;
      }
      
      const cleanLine = line.trim();
      if (cleanLine.startsWith('###') || cleanLine.startsWith('**') || cleanLine.startsWith('- **') || cleanLine.endsWith(':')) {
        doc.setFont('helvetica', 'bold');
      } else {
        doc.setFont('helvetica', 'normal');
      }
      
      doc.text(line, 15, y);
      y += 6;
    });
    
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text("Documento generado por la app 'IAG en clave de ética pedagógica'. Recurso editable.", 15, 287);
    
    doc.save("Acuerdo_Didactico_IA.pdf");
    
    if (status) {
      status.textContent = '¡PDF de acuerdo descargado!';
      status.style.color = 'var(--success)';
      setTimeout(() => { status.textContent = ''; }, 3000);
    }
  } catch (err) {
    console.error(err);
    if (status) {
      status.textContent = 'Error al generar el PDF.';
      status.style.color = 'var(--warning)';
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Descargar PDF';
    }
  }
}

function initNeuralNetBackground() {
  const canvas = document.getElementById('neuralNetCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouse = { x: null, y: null, active: false };

  const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });

  window.addEventListener('mouseleave', () => {
    mouse.active = false;
  });

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.radius = Math.random() * 2.5 + 1.5;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
      if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(99, 102, 241, 0.4)';
      ctx.fill();
    }
  }

  const particleCount = window.innerWidth < 768 ? 25 : 60;
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          const alpha = (1 - dist / 120) * 0.15;
          ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }

      if (mouse.active) {
        const dx = particles[i].x - mouse.x;
        const dy = particles[i].y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 180) {
          const alpha = (1 - dist / 180) * 0.25;
          ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  };

  animate();
}
