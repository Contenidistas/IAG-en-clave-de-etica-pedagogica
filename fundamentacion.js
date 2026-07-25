// ============================================================
// fundamentacion.js — Internacionalización de la página de
// Fundamentación Pedagógica. Lee el idioma del localStorage
// (la misma clave que usa ui-ia.js) y aplica traducciones.
// ============================================================

const FW_TRANSLATIONS = {
  es: {
    app_title: "IAG en clave de ética pedagógica",
    fw_page_title: "Fundamentación - IA Educativa ANEP",
    fw_back_label: "Volver",
    btn_back: "Atrás",
    fw_origin_kicker: "Origen y sentido pedagógico",
    fw_origin_title: "Una herramienta nacida de investigación, formación y aula",
    fw_origin_p1: "Esta herramienta no surge únicamente de la lectura de marcos normativos o recomendaciones institucionales. Su diseño se apoya en evidencia empírica recogida en procesos de investigación, en experiencias de formación docente y, especialmente, en la experiencia concreta de aula de sus autores.",
    fw_origin_p2: "Desde procesos de investigación, formación docente y experiencia de aula, observamos que la inteligencia artificial generativa instala preguntas que atraviesan la enseñanza, la evaluación, la autoría, la confianza pedagógica y la construcción de conocimiento. Por eso, consideramos necesario ofrecer un espacio que ayude a estudiantes, docentes y docentes/investigadores/as a detenerse, revisar sus prácticas y tomar decisiones con criterio.",
    fw_evidence_title: "Evidencia empírica",
    fw_evidence_desc: "Las investigaciones realizadas sobre el uso de IAG en formación docente muestran que estudiantes y docentes ya conviven con estas herramientas, aunque muchas veces sin criterios compartidos, con incertidumbre sobre los límites éticos y con dificultades para explicitar cuándo, cómo y para qué se usan.",
    fw_classroom_title: "Experiencia de aula",
    fw_classroom_desc: "La práctica cotidiana permite ver tensiones que no siempre aparecen en los documentos: dudas ante una entrega, usos no declarados, temor a sanciones, desigualdad en el acceso, dependencia técnica y también oportunidades reales para mejorar la comprensión, la escritura, la planificación y la reflexión.",
    fw_teacher_training_title: "Formación docente",
    fw_teacher_training_desc: "Formar docentes implica formar criterio profesional. La IA no debería incorporarse como una receta ni rechazarse como amenaza abstracta, sino analizarse como parte de una cultura digital que exige diálogo, mediación pedagógica y responsabilidad institucional.",
    fw_dimension_title: "Una dimensión ética, crítica y reflexiva",
    fw_dimension_p1: "El uso educativo de la IA requiere mucho más que saber escribir prompts. Supone preguntarse qué se aprende, qué se delega, qué se verifica, qué se declara y qué lugar conserva la producción humana en el proceso. La dimensión ética aparece cuando se decide con transparencia; la dimensión crítica, cuando se contrastan resultados, sesgos y límites; y la dimensión reflexiva, cuando la herramienta se usa para pensar mejor, no para reemplazar el pensamiento.",
    fw_dimension_p2: "En ese sentido, los marcos de UNESCO, ANEP, FING, Udelar y Ceibal funcionan como referencias complementarias. UNESCO aporta una mirada internacional sobre derechos, transparencia, equidad y gobernanza. ANEP sitúa el debate en el sistema educativo uruguayo y en la formación de ciudadanía digital. FING incorpora orientaciones universitarias concretas sobre evaluación, restricciones claras, originalidad, documentación del proceso y uso profesional responsable. Udelar suma una formulación reciente de 11 principios para orientar el uso de IAG en clave académica e institucional. Ceibal aporta una perspectiva situada sobre IA para la educación, ciudadanía digital, ética del uso y construcción de capacidades en el sistema educativo uruguayo.",
    fw_model_kicker: "Modelo ampliado",
    fw_model_title: "Una herramienta más potente, sin perder claridad",
    fw_model_desc: "Para sostener una experiencia de uso limpia, el recorrido conserva cuatro principios operativos: verificación, transparencia, sesgos y valor agregado humano. Pero esos principios ya no funcionan como una lista cerrada, sino como puertas de entrada a una matriz más amplia de decisión pedagógica.",
    fw_p01_title: "Integridad académica",
    fw_p01_desc: "Autoría, originalidad, trazabilidad del proceso y explicación de decisiones.",
    fw_p02_title: "Cuidado de datos",
    fw_p02_desc: "Privacidad, información sensible, consentimiento, edad y finalidad de uso.",
    fw_p03_title: "Justicia educativa",
    fw_p03_desc: "Equidad, accesibilidad, sesgos, brechas y adecuación al contexto.",
    fw_p04_title: "Agencia humana",
    fw_p04_desc: "Supervisión docente, pensamiento propio y responsabilidad institucional.",
    fw_udelar_title: "Udelar: 11 principios rectores",
    fw_udelar_desc: "La Udelar aprobó una política institucional que reconoce principios para el desarrollo y uso responsable de IA: interés general y centralidad humana, equidad, transparencia, control humano, intimidad y protección de datos, derechos de autor, ética, seguridad, soberanía, sostenibilidad, formación de capacidades y participación.",
    fw_ceibal_title: "Ceibal: 10 lineamientos de uso ético",
    fw_ceibal_desc: "La guía de Ceibal propone usar la IA de forma crítica, reflexiva, segura y responsable: actuar con ética, asumir la IA como apoyo, elegir herramientas confiables, verificar información, atender sesgos, adaptar materiales al grupo, fomentar pensamiento crítico, transparentar el uso, guiar con el ejemplo y proteger datos.",
    fw_link_anep: "Marco sobre IA en educación",
    fw_link_unesco: "Guía sobre IA generativa",
    fw_link_fing: "Uso ético y crítico de IA",
    fw_link_udelar: "11 principios para uso de IAG",
    fw_link_ceibal: "Guía ética de uso de IA",
    fw_articles_title: "Artículos académicos vinculados",
    fw_articles_desc: "Estos trabajos forman parte del respaldo empírico y pedagógico que orienta la herramienta.",
    fw_article1_label: "Artículo 2025",
    fw_article1_title: "Percepciones del uso de IAG en futuras maestras",
    fw_article2_label: "Artículo 2026",
    fw_article2_title: "Cuando el ocultamiento se hace visible",
    footer_created_by: "Creado por",
  },
  en: {
    app_title: "Generative AI in Pedagogical Ethics",
    fw_page_title: "Rationale - AI Educational Tool",
    fw_back_label: "Back",
    btn_back: "Back",
    fw_origin_kicker: "Origin and pedagogical purpose",
    fw_origin_title: "A tool born from research, teacher training, and classroom practice",
    fw_origin_p1: "This tool does not arise solely from reading normative frameworks or institutional recommendations. Its design is grounded in empirical evidence gathered through research processes, teacher training experiences, and especially the concrete classroom experience of its authors.",
    fw_origin_p2: "Through research processes, teacher training, and classroom experience, we observe that generative artificial intelligence raises questions that cut across teaching, assessment, authorship, pedagogical trust, and knowledge construction. That is why we consider it necessary to offer a space that helps students, teachers, and researcher-educators to pause, review their practices, and make informed decisions.",
    fw_evidence_title: "Empirical evidence",
    fw_evidence_desc: "Research on the use of GAI in teacher education shows that students and teachers already coexist with these tools, often without shared criteria, with uncertainty about ethical limits, and with difficulty making explicit when, how, and why they are used.",
    fw_classroom_title: "Classroom experience",
    fw_classroom_desc: "Day-to-day practice reveals tensions that do not always appear in documents: doubts before an assignment, undeclared uses, fear of sanctions, unequal access, technical dependency, and also real opportunities to improve comprehension, writing, planning, and reflection.",
    fw_teacher_training_title: "Teacher training",
    fw_teacher_training_desc: "Training teachers means developing professional judgment. AI should not be incorporated as a recipe or rejected as an abstract threat, but analyzed as part of a digital culture that demands dialogue, pedagogical mediation, and institutional responsibility.",
    fw_dimension_title: "An ethical, critical, and reflective dimension",
    fw_dimension_p1: "Educational use of AI requires much more than knowing how to write prompts. It means asking what is learned, what is delegated, what is verified, what is declared, and what place human production retains in the process. The ethical dimension appears when decisions are made transparently; the critical dimension, when results, biases, and limits are contrasted; and the reflective dimension, when the tool is used to think better, not to replace thinking.",
    fw_dimension_p2: "In this sense, the frameworks of UNESCO, ANEP, FING, Udelar, and Ceibal function as complementary references. UNESCO provides an international perspective on rights, transparency, equity, and governance. ANEP situates the debate within the Uruguayan educational system and digital citizenship formation. FING incorporates concrete university guidelines on assessment, clear restrictions, originality, process documentation, and responsible professional use. Udelar adds a recent formulation of 11 principles to guide the use of GAI in academic and institutional contexts. Ceibal contributes a situated perspective on AI for education, digital citizenship, ethical use, and capacity building within the Uruguayan educational system.",
    fw_model_kicker: "Extended model",
    fw_model_title: "A more powerful tool without losing clarity",
    fw_model_desc: "To sustain a clean user experience, the journey preserves four operational principles: verification, transparency, biases, and human added value. But these principles no longer function as a closed list; instead, they serve as gateways to a broader matrix of pedagogical decision-making.",
    fw_p01_title: "Academic integrity",
    fw_p01_desc: "Authorship, originality, process traceability, and explanation of decisions.",
    fw_p02_title: "Data care",
    fw_p02_desc: "Privacy, sensitive information, consent, age, and purpose of use.",
    fw_p03_title: "Educational justice",
    fw_p03_desc: "Equity, accessibility, biases, gaps, and context adequacy.",
    fw_p04_title: "Human agency",
    fw_p04_desc: "Teacher supervision, independent thinking, and institutional responsibility.",
    fw_udelar_title: "Udelar: 11 guiding principles",
    fw_udelar_desc: "Udelar approved an institutional policy recognizing principles for the responsible development and use of AI: public interest and human centrality, equity, transparency, human control, privacy and data protection, copyright, ethics, security, sovereignty, sustainability, capacity building, and participation.",
    fw_ceibal_title: "Ceibal: 10 ethical use guidelines",
    fw_ceibal_desc: "The Ceibal guide proposes using AI critically, reflectively, safely, and responsibly: acting ethically, treating AI as support, choosing reliable tools, verifying information, addressing biases, adapting materials to the group, fostering critical thinking, being transparent about use, leading by example, and protecting data.",
    fw_link_anep: "AI in education framework",
    fw_link_unesco: "Generative AI guidance",
    fw_link_fing: "Ethical and critical use of AI",
    fw_link_udelar: "11 principles for GAI use",
    fw_link_ceibal: "Ethical AI use guide",
    fw_articles_title: "Related academic articles",
    fw_articles_desc: "These works are part of the empirical and pedagogical foundation that guides the tool.",
    fw_article1_label: "Article 2025",
    fw_article1_title: "Perceptions of GAI use among future teachers",
    fw_article2_label: "Article 2026",
    fw_article2_title: "When concealment becomes visible",
    footer_created_by: "Created by",
  },
  pt: {
    app_title: "IAG sob a ótica da ética pedagógica",
    fw_page_title: "Fundamentação - Ferramenta Educativa de IA",
    fw_back_label: "Voltar",
    btn_back: "Voltar",
    fw_origin_kicker: "Origem e sentido pedagógico",
    fw_origin_title: "Uma ferramenta nascida da pesquisa, da formação e da sala de aula",
    fw_origin_p1: "Esta ferramenta não surge apenas da leitura de marcos normativos ou recomendações institucionais. Seu design se apoia em evidências empíricas coletadas em processos de pesquisa, em experiências de formação docente e, especialmente, na experiência concreta de sala de aula de seus autores.",
    fw_origin_p2: "A partir de processos de pesquisa, formação docente e experiência de sala de aula, observamos que a inteligência artificial generativa instala questões que atravessam o ensino, a avaliação, a autoria, a confiança pedagógica e a construção do conhecimento. Por isso, consideramos necessário oferecer um espaço que ajude estudantes, professores e professores-pesquisadores a se deterem, a revisarem suas práticas e a tomarem decisões com critério.",
    fw_evidence_title: "Evidência empírica",
    fw_evidence_desc: "As pesquisas realizadas sobre o uso de IAG na formação docente mostram que estudantes e professores já convivem com essas ferramentas, muitas vezes sem critérios compartilhados, com incerteza sobre os limites éticos e com dificuldades para explicitar quando, como e para que são usadas.",
    fw_classroom_title: "Experiência de sala de aula",
    fw_classroom_desc: "A prática cotidiana permite ver tensões que nem sempre aparecem nos documentos: dúvidas diante de uma entrega, usos não declarados, temor a sanções, desigualdade no acesso, dependência técnica e também oportunidades reais para melhorar a compreensão, a escrita, o planejamento e a reflexão.",
    fw_teacher_training_title: "Formação docente",
    fw_teacher_training_desc: "Formar professores implica formar critério profissional. A IA não deve ser incorporada como uma receita nem rejeitada como ameaça abstrata, mas analisada como parte de uma cultura digital que exige diálogo, mediação pedagógica e responsabilidade institucional.",
    fw_dimension_title: "Uma dimensão ética, crítica e reflexiva",
    fw_dimension_p1: "O uso educativo da IA requer muito mais do que saber escrever prompts. Supõe perguntar-se o que se aprende, o que se delega, o que se verifica, o que se declara e que lugar a produção humana conserva no processo. A dimensão ética aparece quando se decide com transparência; a dimensão crítica, quando se contrastam resultados, vieses e limites; e a dimensão reflexiva, quando a ferramenta é usada para pensar melhor, não para substituir o pensamento.",
    fw_dimension_p2: "Nesse sentido, os marcos da UNESCO, ANEP, FING, Udelar e Ceibal funcionam como referências complementares. A UNESCO oferece uma visão internacional sobre direitos, transparência, equidade e governança. A ANEP situa o debate no sistema educativo uruguaio e na formação da cidadania digital. A FING incorpora orientações universitárias concretas sobre avaliação, restrições claras, originalidade, documentação do processo e uso profissional responsável. A Udelar acrescenta uma formulação recente de 11 princípios para orientar o uso de IAG em chave acadêmica e institucional. O Ceibal contribui com uma perspectiva situada sobre IA para a educação, cidadania digital, ética do uso e construção de capacidades no sistema educativo uruguaio.",
    fw_model_kicker: "Modelo ampliado",
    fw_model_title: "Uma ferramenta mais potente, sem perder clareza",
    fw_model_desc: "Para sustentar uma experiência de uso limpa, o percurso conserva quatro princípios operativos: verificação, transparência, vieses e valor agregado humano. Mas esses princípios já não funcionam como uma lista fechada, e sim como portas de entrada para uma matriz mais ampla de decisão pedagógica.",
    fw_p01_title: "Integridade acadêmica",
    fw_p01_desc: "Autoria, originalidade, rastreabilidade do processo e explicação das decisões.",
    fw_p02_title: "Cuidado dos dados",
    fw_p02_desc: "Privacidade, informações sensíveis, consentimento, idade e finalidade de uso.",
    fw_p03_title: "Justiça educativa",
    fw_p03_desc: "Equidade, acessibilidade, vieses, lacunas e adequação ao contexto.",
    fw_p04_title: "Agência humana",
    fw_p04_desc: "Supervisão docente, pensamento próprio e responsabilidade institucional.",
    fw_udelar_title: "Udelar: 11 princípios norteadores",
    fw_udelar_desc: "A Udelar aprovou uma política institucional que reconhece princípios para o desenvolvimento e uso responsável de IA: interesse geral e centralidade humana, equidade, transparência, controle humano, privacidade e proteção de dados, direitos autorais, ética, segurança, soberania, sustentabilidade, formação de capacidades e participação.",
    fw_ceibal_title: "Ceibal: 10 diretrizes de uso ético",
    fw_ceibal_desc: "O guia do Ceibal propõe usar a IA de forma crítica, reflexiva, segura e responsável: agir com ética, assumir a IA como apoio, escolher ferramentas confiáveis, verificar informações, atentar para vieses, adaptar materiais ao grupo, fomentar o pensamento crítico, transparentar o uso, liderar pelo exemplo e proteger dados.",
    fw_link_anep: "Marco sobre IA na educação",
    fw_link_unesco: "Guia sobre IA generativa",
    fw_link_fing: "Uso ético e crítico da IA",
    fw_link_udelar: "11 princípios para uso de IAG",
    fw_link_ceibal: "Guia ético de uso da IA",
    fw_articles_title: "Artigos acadêmicos vinculados",
    fw_articles_desc: "Estes trabalhos fazem parte do respaldo empírico e pedagógico que orienta a ferramenta.",
    fw_article1_label: "Artigo 2025",
    fw_article1_title: "Percepções do uso de IAG em futuras professoras",
    fw_article2_label: "Artigo 2026",
    fw_article2_title: "Quando o ocultamento se torna visível",
    footer_created_by: "Criado por",
  },
  fr: {
    app_title: "IAG sous l'angle de l'éthique pédagogique",
    fw_page_title: "Fondement - Outil éducatif IA",
    fw_back_label: "Retour",
    btn_back: "Retour",
    fw_origin_kicker: "Origine et sens pédagogique",
    fw_origin_title: "Un outil né de la recherche, de la formation et de la classe",
    fw_origin_p1: "Cet outil ne naît pas uniquement de la lecture de cadres normatifs ou de recommandations institutionnelles. Sa conception s'appuie sur des preuves empiriques recueillies dans des processus de recherche, des expériences de formation enseignante et, surtout, dans l'expérience concrète de classe de ses auteurs.",
    fw_origin_p2: "À travers des processus de recherche, de formation enseignante et d'expérience de classe, nous observons que l'intelligence artificielle générative soulève des questions qui traversent l'enseignement, l'évaluation, la paternité, la confiance pédagogique et la construction des connaissances. C'est pourquoi nous estimons nécessaire d'offrir un espace qui aide les étudiants, les enseignants et les enseignants-chercheurs à s'arrêter, à examiner leurs pratiques et à prendre des décisions éclairées.",
    fw_evidence_title: "Données empiriques",
    fw_evidence_desc: "Les recherches sur l'utilisation de l'IAG dans la formation enseignante montrent que les étudiants et les enseignants coexistent déjà avec ces outils, souvent sans critères partagés, avec une incertitude sur les limites éthiques et des difficultés à expliciter quand, comment et pourquoi ils sont utilisés.",
    fw_classroom_title: "Expérience de classe",
    fw_classroom_desc: "La pratique quotidienne révèle des tensions qui n'apparaissent pas toujours dans les documents : doutes face à un devoir, usages non déclarés, crainte de sanctions, inégalité d'accès, dépendance technique et aussi des opportunités réelles d'améliorer la compréhension, l'écriture, la planification et la réflexion.",
    fw_teacher_training_title: "Formation des enseignants",
    fw_teacher_training_desc: "Former des enseignants implique de former un jugement professionnel. L'IA ne devrait pas être incorporée comme une recette ni rejetée comme une menace abstraite, mais analysée comme une partie d'une culture numérique qui exige dialogue, médiation pédagogique et responsabilité institutionnelle.",
    fw_dimension_title: "Une dimension éthique, critique et réflexive",
    fw_dimension_p1: "L'usage éducatif de l'IA requiert bien plus que savoir écrire des prompts. Il implique de se demander ce qu'on apprend, ce qu'on délègue, ce qu'on vérifie, ce qu'on déclare et quelle place conserve la production humaine dans le processus. La dimension éthique apparaît quand on décide avec transparence ; la dimension critique, quand on confronte les résultats, les biais et les limites ; et la dimension réflexive, quand l'outil est utilisé pour mieux penser, non pour remplacer la pensée.",
    fw_dimension_p2: "En ce sens, les cadres de l'UNESCO, de l'ANEP, de la FING, de l'Udelar et de Ceibal fonctionnent comme des références complémentaires. L'UNESCO apporte une perspective internationale sur les droits, la transparence, l'équité et la gouvernance. L'ANEP situe le débat dans le système éducatif uruguayen et dans la formation à la citoyenneté numérique. La FING intègre des orientations universitaires concrètes sur l'évaluation, des restrictions claires, l'originalité, la documentation du processus et l'usage professionnel responsable. L'Udelar ajoute une formulation récente de 11 principes pour orienter l'utilisation de l'IAG en mode académique et institutionnel. Ceibal contribue avec une perspective située sur l'IA pour l'éducation, la citoyenneté numérique, l'éthique de l'usage et la construction de capacités dans le système éducatif uruguayen.",
    fw_model_kicker: "Modèle élargi",
    fw_model_title: "Un outil plus puissant sans perdre en clarté",
    fw_model_desc: "Pour maintenir une expérience d'utilisation propre, le parcours conserve quatre principes opérationnels : vérification, transparence, biais et valeur ajoutée humaine. Mais ces principes ne fonctionnent plus comme une liste fermée, mais comme des portes d'entrée vers une matrice plus large de décision pédagogique.",
    fw_p01_title: "Intégrité académique",
    fw_p01_desc: "Paternité, originalité, traçabilité du processus et explication des décisions.",
    fw_p02_title: "Protection des données",
    fw_p02_desc: "Confidentialité, informations sensibles, consentement, âge et finalité d'utilisation.",
    fw_p03_title: "Justice éducative",
    fw_p03_desc: "Équité, accessibilité, biais, écarts et adéquation au contexte.",
    fw_p04_title: "Agentivité humaine",
    fw_p04_desc: "Supervision enseignante, pensée autonome et responsabilité institutionnelle.",
    fw_udelar_title: "Udelar : 11 principes directeurs",
    fw_udelar_desc: "L'Udelar a approuvé une politique institutionnelle reconnaissant des principes pour le développement et l'utilisation responsable de l'IA : intérêt général et centralité humaine, équité, transparence, contrôle humain, vie privée et protection des données, droits d'auteur, éthique, sécurité, souveraineté, durabilité, renforcement des capacités et participation.",
    fw_ceibal_title: "Ceibal : 10 lignes directrices d'usage éthique",
    fw_ceibal_desc: "Le guide de Ceibal propose d'utiliser l'IA de manière critique, réflexive, sûre et responsable : agir de manière éthique, considérer l'IA comme un soutien, choisir des outils fiables, vérifier les informations, prêter attention aux biais, adapter les matériaux au groupe, favoriser la pensée critique, être transparent sur l'utilisation, montrer l'exemple et protéger les données.",
    fw_link_anep: "Cadre sur l'IA en éducation",
    fw_link_unesco: "Guide sur l'IA générative",
    fw_link_fing: "Usage éthique et critique de l'IA",
    fw_link_udelar: "11 principes pour l'usage de l'IAG",
    fw_link_ceibal: "Guide éthique d'usage de l'IA",
    fw_articles_title: "Articles académiques liés",
    fw_articles_desc: "Ces travaux font partie du soutien empirique et pédagogique qui oriente l'outil.",
    fw_article1_label: "Article 2025",
    fw_article1_title: "Perceptions de l'usage de l'IAG chez les futures enseignantes",
    fw_article2_label: "Article 2026",
    fw_article2_title: "Quand la dissimulation devient visible",
    footer_created_by: "Créé par",
  }
};

// ── Aplicar traducciones ──────────────────────────────────
function applyFwTranslations(lang) {
  const t = FW_TRANSLATIONS[lang] || FW_TRANSLATIONS['es'];
  document.documentElement.lang = lang;

  // Título de pestaña
  if (t.fw_page_title) document.title = t.fw_page_title;

  // Todos los elementos con data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (t[key] !== undefined) el.textContent = t[key];
  });
}

// ── Detectar idioma desde localStorage ('app_lang') o URL ──
function detectLanguage() {
  try {
    const stored = localStorage.getItem('app_lang');
    if (stored && FW_TRANSLATIONS[stored]) return stored;
  } catch (_) {}
  const urlLang = new URLSearchParams(window.location.search).get('lang');
  if (urlLang && FW_TRANSLATIONS[urlLang]) return urlLang;
  return 'es';
}

// ── Inicializar ──────────────────────────────────────────
(function init() {
  const lang = detectLanguage();
  applyFwTranslations(lang);
})();

// ── Botón volver ─────────────────────────────────────────
const backButton = document.getElementById('foundationBackBtn');
if (backButton) {
  backButton.addEventListener('click', (event) => {
    const hasSameOriginReferrer = document.referrer
      && new URL(document.referrer).origin === window.location.origin;
    if (hasSameOriginReferrer && window.history.length > 1) {
      event.preventDefault();
      window.history.back();
    }
  });
}
