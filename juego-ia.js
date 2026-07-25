
function isForeignCountry() {
  return typeof window.state !== 'undefined' && window.state.country && window.state.country !== 'Uruguay';
}
/* ========================================
   UTILIDAD: Normalizar preguntas del perfil
   - Asegura que todas las preguntas empiecen con "¿"
   ======================================== */
function normalizarPreguntasDelPerfil(perfilKey) {
  const nodos = CONFIG.perfiles[perfilKey].nodos;
  Object.values(nodos).forEach(n => {
    if (typeof n.title === 'string' &&
        n.title.trim().endsWith('?') &&
        !n.title.trim().startsWith('¿')) {
      n.title = '¿' + n.title.trim();
    }
  });
}

/* ========================================
   RESOLVER PROFILE KEY SEGÚN PERFIL + NIVEL
   - profile       → docente | estudiante (macro)
   - profileKey    → árbol efectivo (docente,
                     estudiante_media, etc.)
   ======================================== */
function resolverProfileKey(profile, nivelEducativo) {
  if (!profile) return null;
  const nivel = (nivelEducativo || '').toLowerCase();

  // Docente y docente/investigador/a: comparten el árbol docente.
  if (profile === 'docente' || profile === 'especializado') {
    return 'docente';
  }

  // Estudiantes: segmentamos por nivel educativo
  if (profile === 'estudiante') {
    if (!nivel) return 'estudiante';   // genérico si no eligió

    if (nivel.includes('media')) {
      return 'estudiante_media';       // media básica o superior
    }
    if (nivel.includes('formación') || nivel.includes('formacion')) {
      return 'estudiante_formacion';
    }
    if (nivel.includes('universitaria') || nivel.includes('universitario')) {
      return 'estudiante_universitaria';
    }

    // Si no matchea nada raro → genérico estudiante
    return 'estudiante';
  }

  // Fallback por si en el futuro aparecen otros perfiles base
  return profile;
}

/* ========================================
   LÓGICA DEL JUEGO
   - Inicializa el recorrido
   - Resuelve perfil efectivo
   - Levanta datos iniciales (país, familiaridad, etc.)
   ======================================== */
function iniciarJuego() {
  // 🔑 Perfil base elegido en la pantalla inicial
  const baseProfile = state.profile; // 'docente' | 'estudiante' | 'especializado'

  // 🔑 Resolver qué árbol efectivo vamos a usar
  const profileKey = resolverProfileKey(baseProfile, state.nivelEducativo);

  if (!profileKey || !CONFIG.perfiles[profileKey]) {
    console.error('❌ No se pudo resolver un perfil válido', {
      profileBase: baseProfile,
      nivelEducativo: state.nivelEducativo,
      profileKey
    });
    return;
  }

  // ✅ Guardamos en el estado:
  //    - profileBase: macro (docente / estudiante / especializado)
  //    - profile:     lo mantenemos igual por compatibilidad
  //    - profileKey:  árbol efectivo (docente, estudiante_media, etc.)
  state.profileBase = baseProfile;
  state.profile    = baseProfile;
  state.profileKey = profileKey;

  // ✅ Consentimiento (opt-out)
  state.consentTracking = elements.consentTracking
    ? elements.consentTracking.checked
    : false;

  // ✅ País final (Uruguay por defecto)
  const countryVal = elements.countryFinalInput
    ? (elements.countryFinalInput.value || 'Uruguay')
    : 'Uruguay';

  // ✅ Nivel de familiaridad con el tema
  const familiaridadVal = elements.familiaridadInicial
    ? (elements.familiaridadInicial.value || '')
    : '';

  // ✅ Uso de recursos similares (radios Sí/No/No estoy seguro)
  let recursosVal = '';
  if (elements.recursosSimilaresRadios && elements.recursosSimilaresRadios.length) {
    const elegido = Array.from(elements.recursosSimilaresRadios)
      .find(r => r.checked);
    recursosVal = elegido ? elegido.value : '';
  }

  // Guardamos todo eso en el estado global
  state.country            = countryVal;
  state.familiaridadInicial = familiaridadVal;
  state.recursosSimilares   = recursosVal;

  // Normalizar signos de interrogación en el perfil efectivo
  if (typeof normalizarPreguntasDelPerfil === 'function') {
    normalizarPreguntasDelPerfil(state.profileKey);
  }

  // Preparar estado de recorrido
  state.name = elements.playerName ? elements.playerName.value.trim() : '';

  const perfil = CONFIG.perfiles[state.profileKey];   // 👈 SIEMPRE perfil efectivo
  state.currentId = perfil.inicio;
  state.path = [];
  state.evidence = 0;
  state.graphFocusCriterionId = null;

  // Calcular total de preguntas (excluye FIN)
  state.totalQuestions = Object.keys(perfil.nodos)
    .filter(k => k !== 'FIN').length;
  state.currentQuestion = 1;

  // Cambiar pantalla al juego
  showScreen('game');

  // Primer render
  renderQuestion();
  updateProgress();
  updateLikert();
  updateTimeline();

  if (typeof window.showChatbotQuizIntro === 'function') {
    setTimeout(window.showChatbotQuizIntro, 500);
  }
}

/* ========================================
   RENDER Y RESPUESTAS
   ======================================== */
const ANSWER_OPTIONS = {
  yes: {
    label: 'Sí',
    badgeClass: 'badge-success',
    tone: 'success',
  },
  sometimes: {
    label: 'A veces',
    badgeClass: 'badge-warn',
    tone: 'partial',
  },
  no: {
    label: 'No',
    badgeClass: 'badge-danger',
    tone: 'warning',
  },
  na: {
    label: 'No aplica',
    badgeClass: 'badge-neutral',
    tone: 'neutral',
  }
};

const DECISION_CRITERIA = [
  {
    id: 'transparencia',
    label: 'Transparencia',
    short: 'Transparencia',
    reason: 'Este nodo revisa si el uso de IA puede declararse, explicarse y acordarse con claridad.',
    patterns: ['transparent', 'declar', 'autor', 'cit', 'asistencia', 'permitido', 'regla']
  },
  {
    id: 'verificacion',
    label: 'Verificación',
    short: 'Verificación',
    reason: 'Este nodo aparece para revisar cómo contrastás información, fuentes y límites de la respuesta generada.',
    patterns: ['verific', 'contrast', 'fuente', 'alucin', 'información', 'informacion']
  },
  {
    id: 'privacidad',
    label: 'Datos y privacidad',
    short: 'Datos',
    reason: 'Este nodo pone el foco en datos personales, información sensible y condiciones seguras de uso.',
    patterns: ['dato', 'privacidad', 'sensible', 'personal', 'consent', 'protección', 'proteccion']
  },
  {
    id: 'equidad',
    label: 'Sesgos y equidad',
    short: 'Equidad',
    reason: 'Este nodo ayuda a revisar sesgos, inclusión, accesibilidad y pertinencia para el contexto real.',
    patterns: ['sesg', 'divers', 'inclus', 'acces', 'equidad', 'contexto', 'grupo']
  },
  {
    id: 'agencia',
    label: 'Agencia humana',
    short: 'Agencia',
    reason: 'Este nodo mira el valor humano: comprensión, criterio propio, proceso y responsabilidad pedagógica.',
    patterns: ['valor', 'aporte', 'personal', 'original', 'comprensión', 'comprension', 'previo', 'proceso', 'decisiones']
  }
];

function construirEstadoDePrincipios() {
  const activeCriterion = (() => {
    if (state.graphFocusCriterionId) return state.graphFocusCriterionId;
    const perfil = CONFIG.perfiles[state.profileKey];
    const nodo = perfil && perfil.nodos ? perfil.nodos[state.currentId] : null;
    return nodo ? inferirCriterioDeNodo(nodo).id : null;
  })();

  return DECISION_CRITERIA.map(criterio => {
    const pasos = state.path.filter(paso => paso.criterionId === criterio.id);
    const estado = obtenerEstadoCriterio(criterio.id);
    return {
      ...criterio,
      steps: pasos.length,
      className: estado.className,
      status: estado.label,
      feedback: estado.feedback,
      active: criterio.id === activeCriterion,
    };
  });
}

function escapeGameHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function construirLayoutPrincipios(nodes) {
  const activeIndex = nodes.findIndex(node => node.active);
  const defaultPositions = [
    { x: 300, y: 58, size: 102, role: 'top' },
    { x: 116, y: 138, size: 88, role: 'left' },
    { x: 196, y: 252, size: 88, role: 'low-left' },
    { x: 404, y: 252, size: 88, role: 'low-right' },
    { x: 484, y: 138, size: 88, role: 'right' }
  ];
  const activeLayout = { x: 300, y: 62, size: 118, role: 'active' };
  const secondaryPositions = [
    { x: 112, y: 140, size: 86, role: 'left' },
    { x: 178, y: 258, size: 84, role: 'low-left' },
    { x: 422, y: 258, size: 84, role: 'low-right' },
    { x: 488, y: 140, size: 86, role: 'right' }
  ];

  let secondaryCursor = 0;
  return nodes.map((node, index) => {
    const base = activeIndex >= 0
      ? (index === activeIndex ? activeLayout : secondaryPositions[secondaryCursor++])
      : defaultPositions[index];
    return {
      ...node,
      index,
      x: base.x,
      y: base.y,
      size: base.size,
      role: base.role,
      className: `${node.className}${node.active ? ' active' : ''}${node.steps ? ' touched' : ''}`
    };
  });
}

function construirRutaNeuronal(node) {
  const cx = 300;
  const cy = 166;
  const controlLift = node.y < cy ? -48 : 48;
  const c1x = cx + (node.x - cx) * 0.22;
  const c1y = cy + controlLift;
  const c2x = cx + (node.x - cx) * 0.72;
  const c2y = node.y - controlLift * 0.22;
  return `M ${cx} ${cy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${node.x} ${node.y}`;
}

function crearPrincipleGraphSvg(target, nodes) {
  target.innerHTML = `
    <svg class="principle-graph-svg" viewBox="0 0 600 330" role="img" aria-label="Red de principios conectados a la decisión actual">
      <defs>
        <radialGradient id="neuralNodeGradient" cx="34%" cy="28%" r="72%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="64%" stop-color="#eef2ff"/>
          <stop offset="100%" stop-color="#e0e7ff"/>
        </radialGradient>
        <linearGradient id="neuralLinkGradient" x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%" stop-color="#6366f1" stop-opacity="0.78"/>
          <stop offset="100%" stop-color="#818cf8" stop-opacity="0.18"/>
        </linearGradient>
        <filter id="neuralSoftShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="12" stdDeviation="12" flood-color="#4f46e5" flood-opacity="0.16"/>
        </filter>
      </defs>

      <circle class="principle-graph-orbit orbit-main" cx="300" cy="166" r="142"></circle>
      <circle class="principle-graph-orbit orbit-inner" cx="300" cy="166" r="92"></circle>

      <g class="neural-graph-links" aria-hidden="true">
        ${nodes.map(node => `<path class="neural-graph-link" data-criterion="${node.id}"></path>`).join('')}
      </g>

      <g class="neural-graph-core">
        <circle cx="300" cy="166" r="49"></circle>
        <text x="300" y="156" text-anchor="middle">IAG</text>
        <text x="300" y="178" text-anchor="middle" class="core-strong">Decisión</text>
      </g>

      <g class="neural-graph-nodes">
        ${nodes.map(node => `
          <g class="neural-graph-node" data-criterion="${node.id}" style="transform: translate(300px, 166px);">
            <g class="neural-graph-node-body">
              <circle></circle>
              <text text-anchor="middle" class="node-label"></text>
              <text text-anchor="middle" class="node-status"></text>
              <text text-anchor="middle" class="node-small"></text>
            </g>
            <title></title>
          </g>
        `).join('')}
      </g>
    </svg>
    <div class="neural-graph-tooltip" aria-hidden="true">
      <strong></strong>
      <span></span>
    </div>
  `;
}

function renderPrincipleGraph(target, statusTarget, options = {}) {
  if (!target) return;
  const nodes = construirEstadoDePrincipios();
  const active = nodes.find(node => node.active);
  const touchedCount = nodes.filter(node => node.steps > 0).length;
  const layoutNodes = construirLayoutPrincipios(nodes);

  if (statusTarget) {
    statusTarget.textContent = active
      ? `Ahora: ${active.label}`
      : `${touchedCount} principios activados`;
  }

  if (!target.querySelector('.principle-graph-svg')) {
    crearPrincipleGraphSvg(target, nodes);
    requestAnimationFrame(() => renderPrincipleGraph(target, statusTarget, options));
    return;
  }

  layoutNodes.forEach(node => {
    const nodeEl = target.querySelector(`.neural-graph-node[data-criterion="${node.id}"]`);
    const pathEl = target.querySelector(`.neural-graph-link[data-criterion="${node.id}"]`);
    if (pathEl) {
      pathEl.setAttribute('d', construirRutaNeuronal(node));
      pathEl.setAttribute('class', `neural-graph-link ${node.className}`);
    }
    if (!nodeEl) return;
    const radius = node.size / 2;
    const textY = -12;
    nodeEl.setAttribute('class', `neural-graph-node ${node.className}`);
    nodeEl.setAttribute('data-feedback', node.feedback || '');
    nodeEl.setAttribute('data-tooltip-title', `${node.short}: ${node.status}`);
    nodeEl.setAttribute('tabindex', '0');
    nodeEl.setAttribute('role', 'img');
    nodeEl.setAttribute('aria-label', `${node.short}: ${node.status}. ${node.feedback || ''}`);
    nodeEl.style.transform = `translate(${node.x}px, ${node.y}px)`;
    const circle = nodeEl.querySelector('circle');
    const label = nodeEl.querySelector('.node-label');
    const status = nodeEl.querySelector('.node-status');
    const small = nodeEl.querySelector('.node-small');
    const title = nodeEl.querySelector('title');
    if (circle) circle.setAttribute('r', radius);
    if (label) {
      label.setAttribute('y', textY);
      label.textContent = node.short;
    }
    if (status) {
      status.setAttribute('y', textY + 22);
      status.textContent = node.status;
    }
    if (small) {
      small.setAttribute('y', textY + 42);
      small.textContent = node.steps ? `${node.steps} señal(es)` : 'por revisar';
    }
    if (title) {
      title.textContent = `${node.short}: ${node.status}. ${node.feedback || ''}`;
    }
  });

  const tooltip = target.querySelector('.neural-graph-tooltip');
  if (tooltip) {
    const tooltipTitle = tooltip.querySelector('strong');
    const tooltipText = tooltip.querySelector('span');
    const showTooltip = (nodeEl) => {
      if (tooltipTitle) tooltipTitle.textContent = nodeEl.getAttribute('data-tooltip-title') || '';
      if (tooltipText) tooltipText.textContent = nodeEl.getAttribute('data-feedback') || '';
      tooltip.classList.add('visible');
    };
    const hideTooltip = () => tooltip.classList.remove('visible');

    target.querySelectorAll('.neural-graph-node').forEach(nodeEl => {
      nodeEl.onmouseenter = () => showTooltip(nodeEl);
      nodeEl.onfocus = () => showTooltip(nodeEl);
      nodeEl.onmouseleave = hideTooltip;
      nodeEl.onblur = hideTooltip;
    });
  }

  if (options.result && !active && statusTarget) {
    const lang = (window.state && window.state.lang) || 'es';
    const t = (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS[lang]) ? TRANSLATIONS[lang] : {};
    const priority = nodes.find(node => node.className === 'priority') || nodes.find(node => node.className === 'progress');
    statusTarget.textContent = priority
      ? `${t.branch_focus_prefix || 'Foco: '}${priority.label}`
      : (t.branch_no_critical || 'Recorrido sin focos críticos');
  }
}

function renderDecisionBranchMap() {
  if (!elements.decisionBranchMap) return;

  const lang = (window.state && window.state.lang) || 'es';
  const t = (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS[lang]) ? TRANSLATIONS[lang] : {};

  const perfil = CONFIG.perfiles[state.profileKey];
  const currentNode = perfil && perfil.nodos ? perfil.nodos[state.currentId] : null;
  const steps = state.path || [];

  if (elements.decisionBranchStatus) {
    elements.decisionBranchStatus.textContent = steps.length
      ? `${steps.length} ${t.branch_decisions_label || 'decisión(es)'}`
      : (t.branch_start || 'Inicio');
  }

  const renderedSteps = steps.map((step, index) => {
    const option = ANSWER_OPTIONS[step.answerKey] || ANSWER_OPTIONS.no;
    const tone = option.tone === 'success'
      ? 'success'
      : option.tone === 'neutral'
        ? 'neutral'
        : option.tone === 'partial'
          ? 'partial'
          : 'warning';
    const shortQuestion = String(step.question || '').replace(/^¿|[?]$/g, '');
    return `
      <article class="decision-branch-node ${tone}">
        <span class="decision-branch-index">${index + 1}</span>
        <div>
          <strong>${escapeGameHtml(step.criterionLabel || 'Criterio')}</strong>
          <p>${escapeGameHtml(shortQuestion)}</p>
          <em>${escapeGameHtml(step.answer)}</em>
        </div>
      </article>
      <span class="decision-branch-connector ${tone}" aria-hidden="true"></span>
    `;
  }).join('');

  const activeNode = currentNode && state.currentId !== 'FIN'
    ? `
      <article class="decision-branch-node current">
        <span class="decision-branch-index">${steps.length + 1}</span>
        <div>
          <strong>${escapeGameHtml(inferirCriterioDeNodo(currentNode).label)}</strong>
          <p>${escapeGameHtml(String(currentNode.title || '').replace(/^¿|[?]$/g, ''))}</p>
          <em>${escapeGameHtml(t.branch_current || 'Decisión actual')}</em>
        </div>
      </article>
    `
    : `
      <article class="decision-branch-node finish">
        <span class="decision-branch-index">✓</span>
        <div>
          <strong>${escapeGameHtml(t.branch_finish_title || 'Recorrido completo')}</strong>
          <p>${escapeGameHtml(t.branch_finish_desc || 'Ya hay base para generar la devolución y el acuerdo.')}</p>
          <em>${escapeGameHtml(t.branch_finish_label || 'Resultado')}</em>
        </div>
      </article>
    `;

  elements.decisionBranchMap.innerHTML = `
    <div class="decision-branch-start">
      <span></span>
      <strong>${escapeGameHtml(t.branch_start || 'Inicio')}</strong>
    </div>
    ${renderedSteps}
    ${activeNode}
  `;
}

function inferirCriterioDeNodo(nodo) {
  const texto = `${nodo.title || ''} ${nodo.help || ''} ${nodo.context || ''} ${nodo.anepRef || ''}`.toLowerCase();
  return DECISION_CRITERIA.find(criterio =>
    criterio.patterns.some(pattern => texto.includes(pattern))
  ) || DECISION_CRITERIA[4];
}

function obtenerEstadoCriterio(criterioId) {
  const pasos = state.path.filter(paso => paso.criterionId === criterioId);
  const lang = (window.state && window.state.lang) || 'es';
  const t = (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS[lang]) ? TRANSLATIONS[lang] : {};
  if (!pasos.length) {
    return {
      className: 'pending',
      label: t.criterion_status_pending || 'Pendiente',
      feedback: t.criterion_pending_feedback || 'Todavía no apareció una decisión vinculada a este principio.'
    };
  }
  if (pasos.some(paso => paso.answerKey === 'no')) {
    return {
      className: 'priority',
      label: t.criterion_status_priority || 'Priorizar',
      feedback: t.criterion_priority_feedback || 'Conviene atender este principio en primer lugar.'
    };
  }
  if (pasos.some(paso => paso.answerKey === 'sometimes')) {
    return {
      className: 'progress',
      label: t.criterion_status_progress || 'En proceso',
      feedback: t.criterion_progress_feedback || 'Hay avances, pero la práctica necesita mayor sistematicidad.'
    };
  }
  return {
    className: 'done',
    label: t.criterion_status_done || 'Alineado',
    feedback: t.criterion_done_feedback || 'Las respuestas muestran una práctica coherente con este principio.'
  };
}

function renderDecisionContext(nodo) {
  const criterio = inferirCriterioDeNodo(nodo);
  if (elements.activeCriterionBadge) {
    const lang = (window.state && window.state.lang) || 'es';
    const t = (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS[lang]) ? TRANSLATIONS[lang] : {};
    const cPrefix = t.criterion_label_prefix || 'Criterio: ';
    elements.activeCriterionBadge.textContent = `${cPrefix}${criterio.label}`;
  }
  if (elements.decisionReason) {
    const lang = (window.state && window.state.lang) || 'es';
    const t = (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS[lang]) ? TRANSLATIONS[lang] : {};
    const last = state.path[state.path.length - 1];
    elements.decisionReason.textContent = last
      ? `${t.decision_reason_answered || 'Llegaste aquí después de responder'} "${last.answer}" ${t.decision_reason_in || 'en:'} ${last.question}`
      : criterio.reason;
  }
}

function updateDecisionMap() {
  if (!elements.decisionMapAxes) {
    renderDecisionBranchMap();
    return;
  }

  const lang = (window.state && window.state.lang) || 'es';
  const t = (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS[lang]) ? TRANSLATIONS[lang] : {};

  const touched = new Set(state.path.map(paso => paso.criterionId).filter(Boolean));
  const activeCriterion = (() => {
    const perfil = CONFIG.perfiles[state.profileKey];
    const nodo = perfil && perfil.nodos ? perfil.nodos[state.currentId] : null;
    return nodo ? inferirCriterioDeNodo(nodo).id : null;
  })();

  if (elements.decisionMapCount) {
    elements.decisionMapCount.textContent = `${touched.size} ${t.branch_criteria_of || 'de'} ${DECISION_CRITERIA.length} ${t.branch_criteria_label || 'criterios'}`;
  }

  elements.decisionMapAxes.innerHTML = DECISION_CRITERIA.map(criterio => {
    const estado = obtenerEstadoCriterio(criterio.id);
    const isActive = criterio.id === activeCriterion;
    return `
      <article class="decision-map-axis ${estado.className}${isActive ? ' active' : ''}">
        <span>${criterio.short}</span>
        <strong>${estado.label}</strong>
      </article>
    `;
  }).join('');

  renderPrincipleGraph(elements.principleGraph, elements.principleGraphStatus);
  renderDecisionBranchMap();
}

function renderQuestion() {
  if (state.autoAdvanceTimer) {
    clearTimeout(state.autoAdvanceTimer);
    state.autoAdvanceTimer = null;
  }

  const perfil = CONFIG.perfiles[state.profileKey];  // árbol efectivo
  const nodo = perfil.nodos[state.currentId];

  if (!nodo) {
    console.warn('Nodo no encontrado. Se muestra el resultado final.', {
      profileKey: state.profileKey,
      currentId: state.currentId
    });
    state.currentId = 'FIN';
    mostrarResultados();
    return;
  }

  elements.questionNumber.textContent = state.currentQuestion;
  elements.questionTitle.textContent  = nodo.title;
  elements.questionHelp.textContent   = nodo.help;

  // Colapsar la ayuda al cambiar de pregunta
  const helpWrapper = document.getElementById('questionHelpWrapper');
  if (helpWrapper) {
    helpWrapper.classList.remove('expanded');
  }
  const toggleHelpBtn = document.getElementById('toggleHelpBtn');
  if (toggleHelpBtn) {
    toggleHelpBtn.classList.remove('active');
    toggleHelpBtn.setAttribute('aria-expanded', 'false');
  }

  // Trigger smooth question card animation
  const card = document.querySelector('.question-card');
  if (card) {
    card.classList.remove('fade-in-slide');
    void card.offsetWidth; // Force reflow
    card.classList.add('fade-in-slide');
  }

  state.awaitingNext = false;
  state.graphFocusCriterionId = null;
  renderDecisionContext(nodo);
  updateDecisionMap();

  elements.feedbackBox.classList.add('hidden');
  [elements.yesBtn, elements.sometimesBtn, elements.noBtn, elements.notApplicableBtn]
    .filter(Boolean)
    .forEach(btn => btn.classList.remove('is-selected'));
  elements.yesBtn.disabled  = false;
  if (elements.sometimesBtn) elements.sometimesBtn.disabled = false;
  elements.noBtn.disabled   = false;
  if (elements.notApplicableBtn) elements.notApplicableBtn.disabled = false;
  elements.nextBtn.disabled = true;
  elements.nextBtn.classList.add('quiz-next-hidden');
  elements.backBtn.disabled = state.path.length === 0;

  elements.contextBtn.onclick = () => {
    const lang = (window.state && window.state.lang) || 'es';
    const t = (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS[lang]) ? TRANSLATIONS[lang] : {};
    modal.show(t.modal_frameworks_title || 'Marcos de referencia', `
      <p><strong>${t.modal_fw_foundation || 'Fundamentación:'}</strong></p>
      <p>${nodo.context}</p>
      <p style="margin-top: 1rem;"><strong>${t.modal_fw_reference || 'Referencia:'}</strong> ${nodo.anepRef}</p>
    `);
  };
}

/**
 * Construye un mensaje de feedback breve según la pregunta y la respuesta
 */
function construirFeedback(nodo, answerKey) {
  const t2 = (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS[(window.state && window.state.lang) || 'es']) || {};
  const t = nodo.title.toLowerCase();

  if (answerKey === 'na') {
    return t2.fb_na || 'Queda registrado como no aplicable. Podés avanzar sin que afecte tu puntaje.';
  }

  if (answerKey === 'sometimes') {
    if (t.includes('verific')) return t2.fb_sometimes_verific || 'Buen punto de partida: conviene volver la verificación más sistemática.';
    if (t.includes('sesg'))   return t2.fb_sometimes_sesg   || 'Hay una base: podés fortalecer el análisis de sesgos con criterios más explícitos.';
    if (t.includes('autor'))  return t2.fb_sometimes_autor  || 'Vas en camino: intentá declarar la asistencia de IA siempre que corresponda.';
    if (t.includes('regla'))  return t2.fb_sometimes_regla  || 'Hay acuerdos parciales: conviene hacerlos más claros y compartidos.';
    return t2.fb_sometimes_default || 'Respuesta parcial: hay avances, pero todavía puede consolidarse como práctica habitual.';
  }

  if (answerKey === 'yes') {
    if (t.includes('verific'))                             return t2.fb_yes_verific || 'Excelente: verificás la información antes de usarla.';
    if (t.includes('sesg'))                               return t2.fb_yes_sesg    || 'Muy bien: reconocés sesgos y trabajás para mitigarlos.';
    if (t.includes('autor'))                              return t2.fb_yes_autor   || 'Correcto: declarás autoría y asistencia de IA.';
    if (t.includes('valor'))                              return t2.fb_yes_valor   || 'Bien: explicitás el valor pedagógico de la IA.';
    if (t.includes('regla'))                              return t2.fb_yes_regla   || 'Perfecto: establecés reglas claras de uso.';
    if (t.includes('aporte') || t.includes('personal'))   return t2.fb_yes_aporte  || 'Sumás valor humano: análisis, síntesis y contexto.';
    if (t.includes('prev') || t.includes('conocimiento')) return t2.fb_yes_prev    || 'Correcto: partís de bases conceptuales.';
    return t2.fb_yes_default || 'Decisión alineada al uso crítico de la IA.';
  } else {
    if (t.includes('verific'))                             return t2.fb_no_verific || 'Foco posible: sumar verificación de información antes de usarla.';
    if (t.includes('sesg'))                               return t2.fb_no_sesg    || 'Foco posible: incorporar análisis de sesgos y estrategias de mitigación.';
    if (t.includes('autor'))                              return t2.fb_no_autor   || 'Foco posible: declarar autoría y asistencia de IA cuando corresponda.';
    if (t.includes('valor'))                              return t2.fb_no_valor   || 'Foco posible: explicitar el valor pedagógico de la IA.';
    if (t.includes('regla'))                              return t2.fb_no_regla   || 'Foco posible: definir reglas claras de uso para tu curso.';
    if (t.includes('aporte') || t.includes('personal'))   return t2.fb_no_aporte  || 'Foco posible: incorporar aportes personales, síntesis y mirada crítica.';
    if (t.includes('prev') || t.includes('conocimiento')) return t2.fb_no_prev    || 'Foco posible: asegurar bases conceptuales previas.';
    return t2.fb_no_default || 'Foco de mejora identificado para seguir pensando.';
  }
}

/**
 * Registra la respuesta del usuario y avanza al siguiente nodo
 */
function calcularGanancia(nodo, answerKey) {
  if (answerKey === 'yes') return Number(nodo.gainYes || 0);
  if (answerKey === 'sometimes') {
    const gainYes = Number(nodo.gainYes || 0);
    const gainNo = Number(nodo.gainNo || 0);
    return Math.round((gainYes + gainNo) / 2);
  }
  return answerKey === 'no' ? Number(nodo.gainNo || 0) : 0;
}

function resolverSiguienteNodo(nodo, answerKey) {
  if (answerKey === 'yes') return nodo.onYes;
  if (answerKey === 'sometimes') return nodo.onPartial || nodo.onNo || nodo.onYes;
  if (answerKey === 'na') return nodo.onSkip || (nodo.onYes === nodo.onNo ? nodo.onYes : nodo.onNo);
  return nodo.onNo;
}

function responder(answerKey) {
  if (state.awaitingNext && state.path.length) {
    const pendiente = state.path.pop();
    state.evidence = Math.max(0, state.evidence - Number(pendiente.gain || 0));
    state.currentId = pendiente.id;
    state.currentQuestion = Math.max(1, state.currentQuestion - 1);
  }

  const perfil = CONFIG.perfiles[state.profileKey];
  const nodo   = perfil.nodos[state.currentId];
  const answer = ANSWER_OPTIONS[answerKey] || ANSWER_OPTIONS.no;
  const criterio = inferirCriterioDeNodo(nodo);
  state.graphFocusCriterionId = criterio.id;
  const answerButtons = {
    yes: elements.yesBtn,
    sometimes: elements.sometimesBtn,
    no: elements.noBtn,
    na: elements.notApplicableBtn
  };

  // Actualizar evidencia (0–100)
  const ganancia   = calcularGanancia(nodo, answerKey);
  state.evidence   = Math.max(0, Math.min(100, state.evidence + ganancia));
  const feedback   = construirFeedback(nodo, answerKey);

  mostrarFeedback(feedback, answer.tone);
  Object.values(answerButtons)
    .filter(Boolean)
    .forEach(btn => btn.classList.remove('is-selected'));
  if (answerButtons[answerKey]) {
    answerButtons[answerKey].classList.add('is-selected');
  }

  // Guardar paso en el "camino"
  state.path.push({
    id:       state.currentId,
    question: nodo.title,
    answer:   answer.label,
    answerKey,
    criterionId: criterio.id,
    criterionLabel: criterio.label,
    gain:     ganancia,
    feedback
  });

  // Siguiente nodo según respuesta
  state.currentId = resolverSiguienteNodo(nodo, answerKey);
  state.currentQuestion++;

  state.awaitingNext = true;

  // La persona puede cambiar la respuesta antes de avanzar.
  elements.yesBtn.disabled  = false;
  if (elements.sometimesBtn) elements.sometimesBtn.disabled = false;
  elements.noBtn.disabled   = false;
  if (elements.notApplicableBtn) elements.notApplicableBtn.disabled = false;
  elements.nextBtn.disabled = false;
  elements.nextBtn.classList.remove('quiz-next-hidden');

  updateLikert();
  updateTimeline();
  updateDecisionMap();
}

/**
 * Muestra el feedback inmediato debajo de la pregunta
 */
function mostrarFeedback(texto, tone) {
  const lang = (window.state && window.state.lang) || 'es';
  const t = (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS[lang]) ? TRANSLATIONS[lang] : {};
  const tipo = tone === 'success' ? 'success' : tone === 'neutral' ? 'neutral' : 'warning';
  const titulo = tone === 'success'
    ? (t.feedback_title_success || 'Decisión alineada al uso crítico')
    : tone === 'neutral'
      ? (t.feedback_title_neutral || 'Respuesta registrada')
      : tone === 'partial'
        ? (t.feedback_title_partial || 'Práctica en proceso')
        : (t.feedback_title_warning || 'Área de mejora identificada');

  elements.feedbackBox.className = `feedback ${tipo}`;
  elements.feedbackBox.innerHTML = `
    <h4 style="font-weight: 700; margin-bottom: 0.5rem;">${escapeGameHtml(titulo)}</h4>
    <p style="color: var(--text-secondary); margin: 0;">${escapeGameHtml(texto)}</p>
  `;
  elements.feedbackBox.classList.remove('hidden');
}

/**
 * Botón "Siguiente": si ya no hay nodo, muestra resultados
 */
function avanzar() {
  state.awaitingNext = false;
  if (!state.currentId || state.currentId === 'FIN') {
    mostrarResultados();
    return;
  }

  const perfil = CONFIG.perfiles[state.profileKey];
  if (!perfil || !perfil.nodos[state.currentId]) {
    state.currentId = 'FIN';
    mostrarResultados();
    return;
  }

  renderQuestion();
}

/**
 * Botón "Volver": permite retroceder un paso
 */
function retroceder() {
  if (state.autoAdvanceTimer) {
    clearTimeout(state.autoAdvanceTimer);
    state.autoAdvanceTimer = null;
  }

  if (state.path.length === 0) return;
  state.awaitingNext = false;

  const ultimo = state.path.pop();
  state.evidence    = Math.max(0, state.evidence - ultimo.gain);
  state.currentId   = ultimo.id;
  state.currentQuestion--;

  renderQuestion();
  updateLikert();
  updateTimeline();
  updateDecisionMap();
  updateProgress();
}

/* ========================================
   ACTUALIZACIONES VISUALES (barra, likert, línea de tiempo)
   ======================================== */
function updateProgress() {
  const porcentaje = ((state.currentQuestion - 1) / state.totalQuestions) * 100;
  elements.progressFill.style.width = `${porcentaje}%`;
  const lang = (window.state && window.state.lang) || 'es';
  const t = (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS[lang]) ? TRANSLATIONS[lang] : { question_counter_q: 'Pregunta', question_counter_of: 'de' };
  const qWord = t.question_counter_q || 'Pregunta';
  const ofWord = t.question_counter_of || 'de';
  elements.progressText.textContent = `${qWord} ${state.currentQuestion} ${ofWord} ${state.totalQuestions}`;
}

function updateLikert() {
  const nivel = CONFIG.likert.find(
    l => state.evidence >= l.min && l.max >= state.evidence
  ) || CONFIG.likert[0];
  if (!nivel) return;

  elements.likertMarker.style.left  = `${state.evidence}%`;
  elements.likertLevel.textContent  = nivel.id;
  elements.likertLevel.style.color  = nivel.color;
}

function updateTimeline() {
  if (state.path.length === 0) {
    elements.timeline.innerHTML =
      '<p class="text-center" style="color: var(--text-muted);">Sin respuestas aún</p>';
    updateDecisionMap();
    return;
  }

  elements.timeline.innerHTML = state.path.map((item, index) => {
    const option = ANSWER_OPTIONS[item.answerKey] || { label: item.answer || 'No', badgeClass: 'badge-danger', tone: 'warning' };
    const clase = option.tone === 'success' ? 'success' : option.tone === 'neutral' ? 'neutral' : 'warning';
    const badge = `<span class="badge ${option.badgeClass}">${escapeGameHtml(option.label)}</span>`;

    return `
      <div class="timeline-item ${clase}">
        <strong>${index + 1}.</strong> ${escapeGameHtml(item.question)}
        <div class="mt-1">${badge}</div>
      </div>
    `;
  }).join('');
}

/* ========================================
   ENVÍO DE DATOS A GOOGLE SHEETS
   ======================================== */
/**
 * Envía los datos del cuestionario completado a la API de persistencia
 * @param {Object} payload - Objeto con todos los datos del usuario y respuestas
 */
function sendResultToServer(payload) {
  const url = CONFIG.dataEndpoint;

  debugLog('Enviando resultado a API', { url, schemaVersion: payload.schemaVersion });

  fetch(url, {
    method: "POST",
    mode: "cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then(data => {
      debugLog('Datos enviados exitosamente a la base de datos:', data);
    })
    .catch(err => {
      console.error("❌ Error al enviar datos:", err);
      console.error("Detalles del error:", err.message);
    });
}

function getAnalyticsSessionId() {
  try {
    const key = 'iagAnalyticsSessionId';
    let sessionId = sessionStorage.getItem(key);
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem(key, sessionId);
    }
    return sessionId;
  } catch (err) {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

function sendVisitToServer() {
  if (!CONFIG.dataEndpoint) return Promise.resolve(false);

  try {
    if (sessionStorage.getItem('iagVisitSent') === 'true') return Promise.resolve(false);
    sessionStorage.setItem('iagVisitSent', 'true');
  } catch (err) {
    console.warn('No se pudo acceder a sessionStorage para controlar visitas:', err);
  }

  const payload = {
    eventType: 'visit',
    timestamp: new Date().toISOString(),
    sessionId: getAnalyticsSessionId(),
    page: 'index',
    anonymous: true
  };

  return fetch(CONFIG.dataEndpoint, {
    method: "POST",
    mode: "cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return true;
    })
    .catch(err => {
    try {
      sessionStorage.removeItem('iagVisitSent');
    } catch (storageErr) {
      console.warn('No se pudo restablecer el control de visita:', storageErr);
    }
    console.warn('No se pudo registrar la visita anonima:', err);
    return false;
  });
}

/**
 * Construye el payload final que se enviará a Sheets
 * Incluye:
 *  - Datos iniciales (perfil, país, familiaridad, etc.)
 *  - Evidencia y nivel Likert
 *  - Camino de preguntas (path)
 */
function buildResultPayload() {
  const nivel = CONFIG.likert.find(
    l => state.evidence >= l.min && l.max >= state.evidence
  ) || CONFIG.likert[0];

  const payload = {
    schemaVersion: CONFIG.schemaVersion || 'local',
    timestamp: new Date().toISOString(),
    eventType: 'completion',
    sessionId: getAnalyticsSessionId(),

    // Perfiles
    profile:    state.profileBase || state.profile, // docente | estudiante
    profileKey: state.profileKey,                   // docente, estudiante_media, etc.

    // Datos iniciales
    userName:           state.name || null,
    country:            state.country,
    nivelEducativo:     state.nivelEducativo || null,
    familiaridadInicial: state.familiaridadInicial,
    recursosSimilares:   state.recursosSimilares,
    consentTracking:     state.consentTracking,

    // Resultado global
    evidence:   state.evidence,
    likertLevel: nivel?.id || null,

    // Detalle de respuestas
    path: state.path.map(step => ({
      id:       step.id,
      question: step.question,
      answer:   step.answer || "No",
      answerKey: step.answerKey || '',
      criterionId: step.criterionId || '',
      criterionLabel: step.criterionLabel || ''
    }))
  };

  debugLog('Payload listo', {
    schemaVersion: payload.schemaVersion,
    profile: payload.profile,
    profileKey: payload.profileKey,
    evidence: payload.evidence,
    likertLevel: payload.likertLevel,
    answers: payload.path.length
  });

  return payload;
}

/* ========================================
   RESULTADOS FINALES + ENVÍO
   - Render de la pantalla final
   - Envío condicionado por consentimiento
   ======================================== */
function mostrarResultados() {
  showScreen('result');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Ocultar sección de casos si el perfil es estudiante
  const situatedCasesSection = document.getElementById('situatedCasesSection');
  if (situatedCasesSection) {
    const isEstudiante = state.profile && state.profile.startsWith('estudiante');
    situatedCasesSection.style.display = isEstudiante ? 'none' : 'block';
  }

  const nivel = CONFIG.likert.find(
    l => state.evidence >= l.min && l.max >= state.evidence
  ) || CONFIG.likert[0];
  const nombre = state.name ? `${state.name}, ` : '';

  // Cabecera de resultados
  elements.resultTitle.textContent = `Nivel: ${nivel.id}`;
  elements.resultDesc.textContent  = `${nombre}${nivel.desc}`;
  elements.resultLevel.textContent = `Tu nivel: ${nivel.id}`;
  elements.resultLevel.style.color = '#ffffff';
  renderizarDevolucionFinal(nivel);
  renderizarInformeCalidad(nivel);
  renderizarBrujulaEtica(nivel);
  renderizarAcuerdoDidactico(nivel);
  renderizarCasosSituados();
  guardarDiagnosticoEnHistorialLocal(nivel);

  // Lista de acuerdos didácticos
  if (elements.didacticaList) {
    elements.didacticaList.innerHTML = CONFIG.acuerdos.map(acuerdo => `
      <li class="resource-card" style="margin-bottom: 0.75rem;">
        <div class="resource-content">
          <p style="margin: 0; font-weight: 600;">${escapeGameHtml(acuerdo.text)}</p>
          <p style="margin: 0.25rem 0 0; font-size: 0.8rem; opacity: 0.7;">
            Referencia: ${escapeGameHtml(acuerdo.ref)}
          </p>
        </div>
      </li>
    `).join('');
  }

  // Lista de herramientas (si existe el contenedor)
  if (elements.toolsList) {
    elements.toolsList.innerHTML = CONFIG.herramientas.map(tool => `
      <li class="resource-card" style="margin-bottom: 0.75rem;">
        <div class="resource-content">
          <h4 style="margin: 0;">${escapeGameHtml(tool.name)}</h4>
          <p style="margin: 0.25rem 0 0;">${escapeGameHtml(tool.desc)}</p>
        </div>
      </li>
    `).join('');
  }

  // Línea de tiempo final
  const perfil = CONFIG.perfiles[state.profileKey];
  if (elements.finalTimeline) {
    elements.finalTimeline.innerHTML = state.path.length === 0
      ? '<p class="text-center" style="color: var(--text-muted);">Sin respuestas para mostrar.</p>'
      : state.path.map((item, index) => {
      const nodo  = perfil && perfil.nodos ? perfil.nodos[item.id] : null;
      if (!nodo) return '';
      const option = ANSWER_OPTIONS[item.answerKey] || { label: item.answer || 'No', badgeClass: 'badge-danger', tone: 'warning' };
      const clase = option.tone === 'success' ? 'success' : option.tone === 'neutral' ? 'neutral' : 'warning';
      const badge = `<span class="badge ${option.badgeClass}">${escapeGameHtml(option.label)}</span>`;

      return `
        <div class="timeline-item ${clase}">
          <strong>${index + 1}.</strong> ${escapeGameHtml(nodo.title)}
          <div class="mt-1">${badge}</div>
          <p style="font-size: 0.9rem; margin: 0.25rem 0 0;">${escapeGameHtml(item.feedback)}</p>
          <p style="font-size: 0.85rem; margin: 0.25rem 0 0; opacity: 0.7;">
            Referencia: ${escapeGameHtml(nodo.anepRef)}
          </p>
        </div>
      `;
    }).join('');
  }

  // 📤 Envío a Sheets solo si dio consentimiento
  if (state.consentTracking) {
    try {
      const payload = buildResultPayload();
      sendResultToServer(payload);
      debugLog("Registro enviado a base de datos:", payload.schemaVersion);
    } catch (err) {
      console.error("❌ Error preparando registro:", err);
    }
  } else {
    debugLog('Usuario no dio consentimiento, no se envían datos');
  }

  // Mostrar una acción clara para pedir sugerencias al Asistente Pedagógico.
  prepararSugerenciasDeMejoraEnChatbot();
}

function obtenerCriterioPrioritario() {
  const estados = construirEstadoDePrincipios();
  return estados.find(item => item.className === 'priority')
    || estados.find(item => item.className === 'progress')
    || estados.find(item => item.steps > 0)
    || estados[0];
}

const CASOS_LABORATORIO = [
  {
    id: 'privacidad',
    title: 'Personalizar sin etiquetar ni exponer',
    axis: 'privacidad',
    axisLabel: 'Privacidad y datos',
    audience: 'Docencia / inclusión',
    story: 'Un docente de educación media desea adaptar sus materiales para 12 estudiantes con orientaciones de ajustes razonables vinculadas a dislexia y TDAH en un grupo de 35. Para lograrlo, ingresa descripciones de perfiles tomadas directamente de informes psicopedagógicos detallados en un modelo de lenguaje de acceso público. Aunque no incluye nombres ni apellidos, copia descripciones minuciosas de desempeño, problemas de atención y apoyos sugeridos. El sistema le genera materiales adaptados y tareas diferenciadas.',
    dilemma: '¿Cómo puede utilizarse la IA generativa para personalizar la enseñanza y favorecer la inclusión sin comprometer la protección de datos, la dignidad de los estudiantes ni el juicio pedagógico?',
    options: {
      A: {
        text: 'Utilizar las adaptaciones obtenidas, dado que se eliminaron los nombres y el propósito es puramente pedagógico.',
        feedback: '<strong>Análisis de la opción A (Riesgosa):</strong> Aunque no hay nombres, los informes psicopedagógicos contienen datos extremadamente sensibles. Según los <em>Lineamientos de ANEP</em> y la <em>Guía de Ética de la UNESCO</em>, la combinación de diagnósticos específicos crea un perfil reidentificable y vulnera la privacidad de los menores al alimentar modelos comerciales.'
      },
      B: {
        text: 'Usar la IA solo para generar ideas de consignas generales, evitando ingresar descripciones detalladas de informes de estudiantes.',
        feedback: '<strong>Análisis de la opción B (Prudente):</strong> Se alinea con los criterios de minimización de datos de <em>Ceibal</em>. Al no exponer descripciones particulares de los estudiantes, el docente actúa de manera preventiva, reservando el análisis pedagógico individual para su propio criterio profesional.'
      },
      C: {
        text: 'Describir las barreras pedagógicas y apoyos de manera genérica en la consulta, sin ingresar perfiles individualizados de estudiantes.',
        feedback: '<strong>Análisis de la opción C (Pedagógicamente sólida / Enfoque DUA):</strong> Promueve la inclusión activa bajo el enfoque de <em>Diseño Universal para el Aprendizaje (DUA)</em>. Alinear la consulta a barreras genéricas evita el etiquetado algorítmico y asegura que las flexibilizaciones beneficien a todo el grupo por igual.'
      },
      D: {
        text: 'Utilizarla bajo condiciones explícitas de minimización de datos en el prompt, revisión crítica de las propuestas generadas y consentimiento informado.',
        feedback: '<strong>Análisis de la opción D (Integral / Institucional):</strong> Sigue las recomendaciones de gobernanza de la <em>UNESCO</em>. Exige verificar las políticas de privacidad del software (evitando el reentrenamiento del modelo) y coordinar institucionalmente las prácticas antes de ingresar datos del estudiantado.'
      }
    },
    giro: 'Al revisar las adaptaciones generadas por la IA, el docente nota que el sistema propone para los estudiantes con dislexia y TDAH únicamente tareas repetitivas, mecánicas y de menor complejidad cognitiva (como completar palabras o realizar sopas de letras), mientras reserva las tareas de investigación, argumentación y creación para el resto del grupo.',
    analysis: 'Este dilema expone los riesgos del sesgo algorítmico capacitista advertido por la <em>UNESCO</em> y <em>Ceibal</em>. Delegar la personalización sin mediación crítica en la IA tiende a empobrecer las expectativas de logro de los estudiantes. Los marcos de referencia exigen que el docente actúe como filtro crítico, asegurando que la IA diversifique los accesos al aprendizaje sin comprometer la complejidad cognitiva ni la dignidad del estudiante.',
    debateQuestions: [
      '¿Eliminar el nombre de un estudiante es suficiente para cumplir con la Ley de Protección de Datos Personales en entornos de IA?',
      '¿De qué manera los materiales diferenciados por IA pueden consolidar etiquetas y reducir la expectativa de logro del estudiante en formación?',
      '¿Qué directrices claras establece ANEP respecto al ingreso de información de desempeño estudiantil en plataformas externas de IA?'
    ],
    stats: { A: 12, B: 38, C: 32, D: 18 }
  },
  {
    id: 'sesgos',
    title: 'La selección invisible de autores',
    axis: 'sesgos',
    axisLabel: 'Sesgos y representatividad',
    audience: 'Docencia / didáctica',
    story: 'Un docente de literatura utiliza una IA generativa para diseñar un módulo sobre literatura latinoamericana contemporánea y pedirle recomendaciones de autores. El sistema le genera un programa académico compuesto en un 100% por escritores masculinos del Río de la Plata, ignorando la representatividad regional, de género y de minorías. Al solicitarle que diversifique la lista e incorpore autoras destacadas de otros países de América Latina, la IA comienza a sugerir nombres de escritoras e inventa de manera sumamente convincente sus biografías y libros ficticios (alucinación).',
    dilemma: '¿Cómo podemos garantizar la equidad y representatividad cultural en los materiales de enseñanza frente a los sesgos y las alucinaciones de la IA?',
    options: {
      A: {
        text: 'Aceptar el primer programa generado porque incluye autores reconocidos y acelera el trabajo de planificación.',
        feedback: '<strong>Análisis de la opción A (Inadecuada):</strong> Reproduce de manera pasiva el sesgo de representatividad que la <em>UNESCO</em> y <em>ANEP</em> señalan como un problema crítico de los modelos entrenados con corpus web mayoritarios, invisibilizando la diversidad cultural e identitaria regional.'
      },
      B: {
        text: 'Usar la lista inicial y complementarla manualmente investigando en bibliotecas digitales y catálogos académicos.',
        feedback: '<strong>Análisis de la opción B (Correcta):</strong> Concuerda con las pautas de curaduría crítica docente. Se utiliza la IA como disparador inicial, pero la soberanía curricular y el rigor metodológico descansan en el docente mediante la contrastación con bibliotecas reales.'
      },
      C: {
        text: 'Insistir a la IA que equilibre la lista pero comprobar y contrastar de manera estricta cada nombre y libro sugerido antes de incluirlos.',
        feedback: '<strong>Análisis de la opción C (Necesaria y crítica):</strong> Muestra un entendimiento claro sobre las alucinaciones algorítmicas descritas por <em>Ceibal</em>. Reconoce que las IAs generativas operan por probabilidad y no por veracidad, por lo que toda sugerencia debe validarse con fuentes externas.'
      },
      D: {
        text: 'Analizar la lista sesgada y las alucinaciones del modelo junto con los estudiantes para discutir de forma crítica el sesgo en los algoritmos.',
        feedback: '<strong>Análisis de la opción D (Didácticamente potente):</strong> Convierte el límite tecnológico en una oportunidad didáctica. Se alinea con los objetivos de ciudadanía digital y pensamiento crítico promovidos por el <em>Marco Curricular Nacional de ANEP</em> y la <em>alfabetización en IA de Ceibal</em>.'
      }
    },
    giro: 'Al realizar una búsqueda rápida en internet, el docente descubre que tres de las autoras recomendadas en la segunda vuelta y presentadas por la IA como pioneras del realismo mágico son ficticias y que las citas de sus obras presentadas por el modelo son inventadas.',
    analysis: 'Este dilema muestra las limitaciones epistemológicas de las IAs. Como señalan las guías de <em>Ceibal</em> y la <em>UNESCO</em>, las alucinaciones no son fallos aleatorios, sino intrínsecas a la naturaleza probabilística de los modelos de lenguaje. La justicia curricular y la soberanía pedagógica requieren que el docente contraste activamente los resultados para no diseminar conocimientos falsos o sesgados en el aula.',
    debateQuestions: [
      '¿Por qué los modelos de IA tienden a reproducir sesgos históricos y de género en sus recomendaciones curriculares?',
      '¿Cómo podemos diseñar actividades en las que las alucinaciones de la IA sirvan para enseñar verificación de fuentes a los estudiantes?',
      '¿Qué nos dicen los marcos de ANEP y Ceibal sobre el desarrollo del pensamiento crítico frente a la información automatizada?'
    ],
    stats: { A: 8, B: 24, C: 42, D: 26 }
  },
  {
    id: 'agencia',
    title: 'El algoritmo evaluador',
    axis: 'agencia',
    axisLabel: 'Agencia y autonomía',
    audience: 'Gestión / evaluación',
    story: 'Un centro educativo adopta una plataforma de tutoría inteligente asistida por IA. El protocolo del centro establece que los docentes deben seguir las rutas de aprendizaje automatizadas y utilizar las calificaciones que el algoritmo asigna. Un docente nota que la IA calificó como "incorrecto" el ejercicio de un estudiante que utilizó un método de resolución matemático muy creativo y no estándar, el cual demostraba una excelente comprensión conceptual del problema, pero difería del patrón de la base de datos de la IA.',
    dilemma: '¿Cómo sostener la autonomía profesional del docente y el derecho de los estudiantes a la creatividad frente a la estandarización y eficiencia de los sistemas de evaluación automáticos?',
    options: {
      A: {
        text: 'Mantener la nota de la IA para respetar el protocolo del centro y asegurar la consistencia del sistema.',
        feedback: '<strong>Análisis de la opción A (Riesgosa):</strong> Vulnerar el principio fundamental de <em>"Supervisión Humana" de la UNESCO</em> y las pautas de evaluación de <em>ANEP</em>, que prohíben delegar calificaciones finales a sistemas automatizados para evitar desincentivar el pensamiento heurístico y original.'
      },
      B: {
        text: 'Modificar manualmente la nota en la libreta del docente sin informar al sistema ni a los coordinadores para evitar conflictos.',
        feedback: '<strong>Análisis de la opción B (Evasiva):</strong> Resuelve el caso particular pero esquiva la discusión pedagógica e institucional. Los lineamientos de <em>Udelar / FING</em> destacan la importancia de auditar el comportamiento de herramientas automáticas y transparentar sus límites para mejorar las prácticas.'
      },
      C: {
        text: 'Explicar el error del algoritmo al estudiante, reevaluar manualmente y elevar un informe técnico/pedagógico a la dirección escolar.',
        feedback: '<strong>Análisis de la opción C (Responsable):</strong> Ejerce la autonomía profesional que promueven <em>ANEP</em> y <em>Ceibal</em>. Sitúa al docente como garante ético de la evaluación y genera retroalimentación institucional para ajustar el software.'
      },
      D: {
        text: 'Realizar un espacio de debate en la clase para contrastar la lógica rígida de la máquina con el pensamiento heurístico y libre de las personas.',
        feedback: '<strong>Análisis de la opción D (Formativa):</strong> Excelente propuesta didáctica. Desarrolla la metacognición y la comprensión técnica del estudiantado, mostrando los límites lógicos de la computación frente al ingenio humano, alinear con las directrices de <em>Ceibal</em>.'
      }
    },
    giro: 'La dirección del centro le advierte al docente que anular la decisión del software reduce el porcentaje de fiabilidad reportado en el panel administrativo que se envía trimestralmente a las familias.',
    analysis: 'Como establecen la <em>UNESCO</em>, <em>ANEP</em> y la <em>Udelar</em>, la evaluación educativa es un acto intrínsecamente humano, ético y contextual. Las plataformas digitales actúan como herramientas de asistencia, pero nunca pueden sustituir el juicio profesional del docente. Priorizar métricas algorítmicas por encima de la creatividad matemática restringe el pensamiento libre y distorsiona el propósito pedagógico del centro.',
    debateQuestions: [
      '¿Qué dimensiones de la evaluación formativa e integral son completamente indelegables en un software de IA?',
      '¿Cómo afecta a la autonomía docente y a la motivación estudiantil la imposición de métricas de rendimiento estandarizadas basadas en datos algorítmicos?',
      '¿Qué límites éticos y pedagógicos deberían delimitar las decisiones tomadas de manera automática por sistemas artificiales?'
    ],
    stats: { A: 14, B: 34, C: 38, D: 14 }
  },
  {
    id: 'transparencia',
    title: 'La entrega bajo sospecha',
    axis: 'transparencia',
    axisLabel: 'Transparencia e integridad',
    audience: 'Aula / didáctica',
    story: 'Una estudiante entrega una producción que cumple formalmente con todas las consignas pero muestra un vocabulario muy técnico y giros lingüísticos idénticos a los generados por IA. La estudiante niega haber utilizado IA y afirma que es de su autoría. El reglamento institucional cataloga el uso de IA sin citar como un acto de plagio. El docente se enfrenta a la decisión de cómo actuar, sabiendo que las herramientas detectoras de IA son poco fiables y suelen dar falsos positivos (especialmente en estudiantes no nativos o muy formales).',
    dilemma: '¿Cómo abordar la sospecha de uso de IA no declarado de manera formativa, manteniendo la confianza y el diálogo, en lugar de recurrir de forma directa a la penalización?',
    options: {
      A: {
        text: 'Aplicar el reglamento directamente basándose en la sospecha visual y penalizar la entrega.',
        feedback: '<strong>Análisis de la opción A (Poco recomendable):</strong> Vulnerar el principio de presunción de inocencia pedagógica. Los lineamientos de <em>Ceibal</em> y <em>ANEP</em> recalcan que las sospechas visuales sin diálogo previo deterioran el clima del aula y quiebran el vínculo de confianza.'
      },
      B: {
        text: 'Pasar la entrega por detectores de IA online y aplicar la sanción si el porcentaje de probabilidad supera el 80%.',
        feedback: '<strong>Análisis de la opción B (Inadecuada):</strong> Los detectores de IA arrojan abundantes falsos positivos. Su uso como prueba probatoria es desaconsejado de forma categórica por la <em>UNESCO</em>, <em>Ceibal</em> y <em>Udelar / FING</em> debido a su falta de rigor científico y su sesgo hacia textos escritos por estudiantes de lenguas no nativas.'
      },
      C: {
        text: 'Citar a la estudiante a una tutoría de retroalimentación para conversar sobre su proceso de escritura y pedirle que explique la estructuración y términos clave.',
        feedback: '<strong>Análisis de la opción C (Formativa y justa):</strong> Utiliza la mediación didáctica recomendada por <em>ANEP</em>. Centra la evaluación en la defensa oral de la comprensión conceptual, permitiendo que la estudiante evidencie su apropiación de los conceptos.'
      },
      D: {
        text: 'Proponer una segunda entrega donde se requiera documentar el proceso a través de borradores, historial de cambios o una bitácora de prompts.',
        feedback: '<strong>Análisis de la opción D (Pedagógicamente sólida / Basada en acuerdos):</strong> Se enfoca en la "trazabilidad del proceso" promovida por los criterios éticos de <em>Ceibal</em>. Convierte la entrega en un acuerdo didáctico donde el valor radica en el desarrollo reflexivo y no solo en el producto.'
      }
    },
    giro: 'Durante la entrevista personal, la estudiante se quiebra emocionalmente y confiesa que utilizó la IA porque sufre de un fuerte bloqueo de escritura por ansiedad y temía fracasar en la entrega, revelando que el uso de la máquina fue un síntoma de un problema socioafectivo.',
    analysis: 'Este caso evidencia que la sospecha punitiva desatiende las dimensiones humanas del aprendizaje. Las directrices de <em>Ceibal</em> e <em>Integración de IA de ANEP</em> recomiendan pasar de un enfoque de detección y castigo a uno de transparencia declarada (p. ej., definir qué porcentaje de apoyo de la IA se utilizó y cómo se contrastó). Fomentar la evaluación de procesos y acordar bitácoras de diseño mitiga la ansiedad y resguarda la integridad académica.',
    debateQuestions: [
      '¿Por qué las principales guías internacionales y locales (UNESCO, Ceibal, Udelar) prohíben catalogar un detector de IA como prueba fehaciente de fraude?',
      '¿Cómo podemos promover en el reglamento del centro el uso transparente (declaración de uso y roles) en lugar de la prohibición absoluta?',
      '¿De qué manera las evaluaciones basadas en productos cerrados incentivan la copia con IA y cómo podemos rediseñarlas hacia el seguimiento de procesos?'
    ],
    stats: { A: 28, B: 22, C: 34, D: 16 }
  },
  {
    id: 'equidad',
    title: 'La brecha de las licencias',
    axis: 'equidad',
    axisLabel: 'Equidad y acceso',
    audience: 'Aula / gestión',
    story: 'Un docente de diseño audiovisual propone un proyecto donde los estudiantes deben utilizar una herramienta de IA generativa de imágenes para ilustrar un guion técnico. El instituto no cuenta con cuentas institucionales de pago para esta herramienta. En la entrega final, se observa que la mitad de los estudiantes usó cuentas familiares premium (obteniendo imágenes de alta calidad en segundos) mientras que el resto utilizó la versión gratuita (que tiene un límite de créditos diario, baja resolución y marcas de agua).',
    dilemma: '¿Cómo diseñar y evaluar tareas basadas en tecnologías de vanguardia garantizando la justicia educativa y la equidad cuando existen diferencias en los recursos socioeconómicos de los estudiantes?',
    options: {
      A: {
        text: 'Evaluar el resultado visual final por igual, dado que el acceso a herramientas mejores forma parte del contexto real.',
        feedback: '<strong>Análisis de la opción A (Injusta):</strong> Convalida la brecha digital de suscripción, penalizando indirectamente la falta de recursos económicos. Esto atenta directamente contra los principios de equidad y justicia educativa consagrados en el <em>Plan de Desarrollo Educativo de ANEP</em>.'
      },
      B: {
        text: 'Centrar la rúbrica y la evaluación en la coherencia de la narrativa y la justificación técnica del guion, no en la calidad estética de la IA.',
        feedback: '<strong>Análisis de la opción B (Equitativa):</strong> Neutraliza la desigualdad tecnológica. De acuerdo con las orientaciones de <em>Ceibal</em>, evalúa los procesos metacognitivos, la creatividad narrativa y el dominio conceptual, no la capacidad computacional de la licencia contratada.'
      },
      C: {
        text: 'Permitir realizar el trabajo utilizando técnicas de ilustración analógicas o repositorios de imágenes libres para quienes no deseen o no puedan usar IA.',
        feedback: '<strong>Análisis de la opción C (Inclusiva):</strong> Protege la pluralidad metodológica recomendada por la <em>UNESCO</em>. Garantiza que el acceso a tecnologías de IA no sea obligatorio cuando genera exclusión digital o tensiones éticas individuales.'
      },
      D: {
        text: 'Restringir el uso de IA únicamente a aquellas herramientas gratuitas que el centro escolar garantice o prohibir el uso de versiones premium en la entrega.',
        feedback: '<strong>Análisis de la opción D (Niveladora):</strong> Asegura condiciones equitativas para el grupo (piso común de herramientas) tal como recomiendan las directrices de <em>ANEP</em>, evitando que las ventajas de versiones de pago sesguen las dinámicas académicas del grupo.'
      }
    },
    giro: 'Las calificaciones de la entrega muestran que los proyectos realizados con la IA de pago obtuvieron mayoritariamente notas excelentes debido a que el impacto visual influyeron en la percepción general del jurado evaluador, a pesar de tener una planificación narrativa más débil.',
    analysis: 'La brecha de las licencias representa una dimensión crítica de la inequidad educativa digital señalada por la <em>UNESCO</em>, <em>Ceibal</em> y <em>ANEP</em>. La introducción de tecnologías emergentes en la educación pública exige que los criterios evaluativos aíslen el "impacto estético automático" del software y midan estrictamente las competencias de diseño y toma de decisiones pedagógicas del estudiante, protegiendo el acceso democrático y la justicia social en el aula.',
    debateQuestions: [
      '¿Qué lineamientos de equidad establece ANEP para garantizar que el uso de tecnologías de pago no cree nuevas brechas en los aprendizajes?',
      '¿Cómo podemos diseñar rúbricas que aíslen el efecto estético generado por el algoritmo de pago y premien las decisiones originales del estudiante?',
      '¿Qué alternativas viables existen para que los centros educativos brinden acceso equitativo e institucional a recursos avanzados de IA?'
    ],
    stats: { A: 15, B: 55, C: 20, D: 10 }
  },
  {
    id: 'delegacion',
    title: 'La paradoja del borrador: agencia humana y delegación cognitiva',
    axis: 'agencia',
    axisLabel: 'Agencia y delegación cognitiva',
    audience: 'Aula / formación docente',
    story: 'En un curso de educación media/terciaria, un docente propone elaborar una monografía o ensayo argumentativo. Para acelerar el trabajo, varios estudiantes le piden a la IA que redacte la estructura completa, la tesis central y las conclusiones. Si bien los estudiantes revisan y editan superficialmente el texto, durante la puesta en común se evidencia que no logran defender ni explicar los conceptos centrales del documento, argumentando que "la IA lo redactó de esa forma y sonaba muy convincente".',
    dilemma: '¿Cómo gestionar el uso de la IA para promover el aprendizaje crítico sin caer en una delegación cognitiva pasiva que atrofie la autonomía y el pensamiento propio del estudiante?',
    options: {
      A: {
        text: 'Prohibir el uso de IA para la elaboración del esquema y la redacción, exigiendo borradores escritos manualmente en clase sin conectividad.',
        feedback: '<strong>Análisis de la opción A (Rígida):</strong> Aunque protege la producción propia en el momento, la prohibición absoluta ignora el contexto digital y no enseña al estudiante a autorregular su relación con la IA cuando trabaje fuera del aula.'
      },
      B: {
        text: 'Exigir una bitácora de proceso y defensa oral donde el estudiante declare qué partes asistió la IA y justifique con argumentos propios cada decisión tomada.',
        feedback: '<strong>Análisis de la opción B (Formativa y pedagógicamente sólida):</strong> Preserva la agencia humana según los lineamientos de la <em>UNESCO</em> y <em>ANEP</em>. Mantiene el control cognitivo en el estudiante al obligarlo a evaluar, contrastar y tomar decisiones fundamentadas sobre el texto.'
      },
      C: {
        text: 'Aceptar el trabajo redactado por IA siempre que el estudiante agregue un apartado final de reflexión personal de una página.',
        feedback: '<strong>Análisis de la opción C (Insuficiente):</strong> Agregar un anexo al final no garantiza que el proceso previo de ideación y estructuración conceptual haya sido procesado por el estudiante, manteniendo el riesgo de sustitución cognitiva.'
      },
      D: {
        text: 'Utilizar la IA en clase como un "socio de debate" (contra-argumentador), pidiéndole a la máquina que cuestione la tesis del estudiante para que este defienda su postura.',
        feedback: '<strong>Análisis de la opción D (Potenciadora de la agencia):</strong> Excelente estrategia didáctica según las pautas de <em>Ceibal</em> y <em>UNESCO</em>. Invierte el rol tradicional: la persona piensa y decide, mientras que la IA actúa como provocador cognitivo o andamiaje.'
      }
    },
    giro: 'Al realizar una prueba de lectura comprensiva y defensa sin asistencia digital semanas después, la mayoría de los estudiantes que delegaron la redacción en la IA obtienen un desempeño significativamente menor en la retención de conceptos clave frente a quienes redactaron sus propios borradores iniciales.',
    analysis: 'Este dilema ilustra el fenómeno de la <strong>delegación cognitiva (cognitive offloading)</strong> advertido por la <em>UNESCO</em> y <em>Ceibal</em>. Cuando el estudiante cede las fases de ideación, síntesis y argumentación a la IA sin un esfuerzo mental activo, se produce una "ilusión de comprensión": el texto parece brillante, pero el esquema mental del alumno no se ha transformado. Defender la agencia humana en la educación implica asegurar que la tecnología amplíe la capacidad reflexiva del sujeto, sin reemplazar el esfuerzo necesario para construir conocimiento.',
    debateQuestions: [
      '¿Qué diferencia existe entre utilizar la IA como andamiaje didáctico y caer en una sustitución o atrofia cognitiva?',
      '¿Cómo podemos diseñar consignas de trabajo que requieran pensamiento propio e imposibiliten la delegación pasiva en el algoritmo?',
      '¿Qué estrategias pedagógicas según UNESCO y Ceibal permiten evaluar la agencia y la autoría humana más allá del producto escrito final?'
    ],
    stats: { A: 16, B: 48, C: 12, D: 24 }
  },
  {
    id: 'tfg_docente',
    title: 'El marco teórico automatizado: ética en la investigación de grado',
    axis: 'autoría',
    axisLabel: 'Autoría y rigor en investigación de grado',
    audience: 'Formación docente / nivel superior',
    story: 'Un estudiante de Formación Docente (Magisterio / Profesorado) presenta el avance de su Trabajo Final de Grado (TFG) sobre inclusión educativa. El tribunal examinador observa que el estado del arte y la revisión bibliográfica están impecablemente estructurados y sintetizan 20 autores clásicos y contemporáneos. Sin embargo, en la entrevista de avance, el estudiante admite haber utilizado una IA generativa para leer, resumir y redactar los capítulos teóricos enteros a partir de apuntes breves, sin haber leído directamente los libros ni las investigaciones originales citadas.',
    dilemma: '¿Cómo regular el uso de la IA en la investigación de grado en formación docente para que constituya un andamiaje válido sin menoscabar la apropiación conceptual, la honestidad académica y la construcción del criterio pedagógico?',
    options: {
      A: {
        text: 'Anular el avance del trabajo y exigir la reescritura total del marco teórico sin ningún tipo de asistencia digital.',
        feedback: '<strong>Análisis de la opción A (Sancionadora/Rígida):</strong> Aunque busca resguardar la honestidad intelectual, la anulación punitiva no enseña al futuro docente a utilizar críticamente la IA como herramienta de investigación profesional.'
      },
      B: {
        text: 'Aceptar el texto generado siempre que las citas bibliográficas existan verdaderamente en la literatura académica.',
        feedback: '<strong>Análisis de la opción B (Insuficiente):</strong> La existencia real de las citas no garantiza la comprensión del estudiante. En la formación de formadores, la lectura directa y la interpretación de los autores son indispensables para construir criterio pedagógico.'
      },
      C: {
        text: 'Exigir la entrega del diario de lectura (fichaje directo de fuentes primarias) y una reestructuración donde el estudiante explicite su posición teórica crítica frente a las síntesis de la IA.',
        feedback: '<strong>Análisis de la opción C (Formativa y rigurosa):</strong> Restablece la agencia humana y la apropiación conceptual recomendadas por los marcos de Udelar y UNESCO. Obliga al futuro docente a dialogar con los autores y defender su postura.'
      },
      D: {
        text: 'Implementar un seminario de defensa donde el tribunal evalúe la capacidad del tesista para argumentar, contrastar y aplicar los conceptos a situaciones de aula reales.',
        feedback: '<strong>Análisis de la opción D (Evaluación de proceso e integración):</strong> Alineada con la evaluación por competencias de ANEP y Udelar. Traslada el eje evaluativo del "producto escrito" a la capacidad docente del estudiante para responder éticamente en la práctica.'
      }
    },
    giro: 'Durante la defensa intermedia del TFG, el tribunal le pide al estudiante que relacione una de las citas teóricas del marco generado por la IA con una observación de su práctica docente de aula. El estudiante no logra vincular la teoría con la realidad del aula porque nunca analizó la profundidad del texto original.',
    analysis: 'El Trabajo Final de Grado en carreras docentes no es un mero trámite de escritura, sino el hito donde se consolida la identidad pedagógica y la capacidad de articular teoría y práctica. De acuerdo con las orientaciones de la <em>Udelar</em>, <em>ANEP</em> y la <em>UNESCO</em>, sustituir la lectura directa de fuentes por síntesis de IA empobrece el marco epistemológico del educador. La asistencia algorítmica debe declararse y limitarse a la organización de ideas, asegurando que el docente en formación lea, problematice y haga suya la teoría que sostendrá su práctica pedagógica.',
    debateQuestions: [
      '¿Qué límites éticos deben establecer los tribunales de TFG frente a la síntesis y redacción bibliográfica asistida por IA?',
      '¿Cómo afecta a la futura práctica docente delegar la lectura primaria de los marcos pedagógicos en un modelo de lenguaje?',
      '¿Qué herramientas de trazabilidad (bitácoras de lectura, fichaje, defensa oral) permiten garantizar la apropiación teórica sin prohibir la tecnología?'
    ],
    stats: { A: 18, B: 22, C: 42, D: 18 }
  },
  {
    id: 'coconstruccion_codex',
    title: 'El artefacto generado: co-construcción de software y comprensión algorítmica',
    axis: 'agencia',
    axisLabel: 'Agencia técnica y soberanía de código',
    audience: 'Educación técnica / terciaria / universidad (informática)',
    story: 'En una asignatura de programación y desarrollo de software, un equipo de estudiantes entrega un proyecto complejo de aplicación web que funciona a la perfección. Durante la revisión del código fuente, el docente nota el uso de patrones de arquitectura muy avanzados, optimizaciones complejas e integraciones de librerías mediante asistentes de código (Codex / Copilot). Al solicitarles que expliquen el flujo de ejecución de una función crítica o que resuelvan un pequeño fallo introducido intencionalmente durante la evaluación, el equipo demuestra una total incapacidad para depurar o modificar el código generado por la herramienta.',
    dilemma: '¿Cómo integrar asistentes de IA en la enseñanza de la programación (Codex/Copilot) promoviendo la productividad profesional sin sacrificar la comprensión algorítmica y la capacidad de depurar código?',
    options: {
      A: {
        text: 'Descalificar la entrega por considerar que el código no fue escrito manualmente por los estudiantes.',
        feedback: '<strong>Análisis de la opción A (Desconectada de la industria):</strong> Ignora que el uso de asistentes de código (AI-pair programming) es una competencia estándar en la industria del software. Sancionar su uso dificulta la formación profesional actualizada.'
      },
      B: {
        text: 'Aprobar el proyecto si cumple con todos los test de integración y requerimientos funcionales, sin evaluar la lectura del código.',
        feedback: '<strong>Análisis de la opción B (Inadecuada):</strong> Promueve el "desarrollo caja negra". La Guía de la FING-Udelar advierte que un profesional debe ser capaz de justificar, auditar y mantener cualquier código entregado.'
      },
      C: {
        text: 'Establecer como requisito obligatorio la documentación de los prompts y una sesión de "Code Review" (revisión oral de código) donde los estudiantes defiendan línea por línea la lógica del software.',
        feedback: '<strong>Análisis de la opción C (Formativa y profesional):</strong> Alineada con las pautas de la FING-Udelar y Ceibal. Mantiene la soberanía técnica del estudiante, exigiendo que comprenda y pueda modificar la solución propuesta por la IA.'
      },
      D: {
        text: 'Requerir que los estudiantes diseñen pruebas unitarias (unit testing) y diagramas de arquitectura antes de solicitar sugerencias de código a la IA.',
        feedback: '<strong>Análisis de la opción D (Metodológicamente sólida):</strong> Invierte el ciclo de desarrollo: el estudiante define la arquitectura, las restricciones y las pruebas (agencia humana), dejando a la IA únicamente la escritura del código repetitivo.'
      }
    },
    giro: 'Semanas después, se produce un cambio menor en la API externa que consume la aplicación. El equipo es incapaz de adaptar el software porque no comprende la estructura interna del código generado por Codex y la herramienta no logra resolver el problema de forma automática.',
    analysis: 'Este dilema expone la diferencia entre la "eficiencia de generación" y la "comprensión computacional". Como destacan las directrices de la <em>FING (Udelar)</em> y <em>Ceibal</em>, la co-construcción de software con IA exige formar profesionales que no sean meros "copiadores de código" (<em>copy-paste</em>), sino arquitectos capaces de auditar, depurar y responder por la seguridad y calidad del sistema. La agencia técnica radica en mantener el control conceptual sobre la arquitectura y la lógica de programación.',
    debateQuestions: [
      '¿De qué manera el uso de asistentes como Codex o Copilot debe transformar la enseñanza y evaluación de la programación en la educación técnica?',
      '¿Por qué la capacidad de depuración (debugging) y la revisión de código se vuelven más importantes que la memorización de sintaxis en la era de la IA?',
      '¿Qué acuerdos explícitos deben exigirse en la entrega de proyectos de software sobre la declaración y auditoría de código asistido por IA?'
    ],
    stats: { A: 10, B: 15, C: 45, D: 30 }
  }
];

function construirCasosSituados() {
  return CASOS_LABORATORIO;
}

function abrirLaboratorioCasos() {
  if (state.profile !== 'docente') {
    const content = `
      <div class="mode-selection-modal-body" style="text-align: center; padding: 1rem 0;">
        <p style="margin-bottom: 1.5rem; font-size: 1.05rem; line-height: 1.5; color: var(--text-secondary);">
          El **Laboratorio de Casos (Modo Taller)** es una herramienta diseñada para el perfil **Docente** para la deliberación y el trabajo ético situado.
        </p>
        <p style="margin-bottom: 1.5rem; font-weight: 600; color: var(--text-primary);">
          ¿Deseás configurar tu perfil como Docente ahora para ingresar?
        </p>
        <div style="display: flex; flex-direction: column; gap: 0.75rem; max-width: 300px; margin: 0 auto;">
          <button type="button" class="btn btn-primary" id="btnConfirmDocenteProfile" style="padding: 0.85rem; font-size: 1rem; width: 100%;">
            ✅ Sí, configurar e ingresar
          </button>
          <button type="button" class="btn btn-outline" id="btnCancelDocenteProfile" style="padding: 0.85rem; font-size: 1rem; width: 100%; background: var(--bg-main);">
            Cancelar
          </button>
        </div>
      </div>
    `;
    
    if (typeof modal !== 'undefined' && typeof modal.show === 'function') {
      modal.show('Acceso al Laboratorio de Casos', content);
      
      const btnConfirm = document.getElementById('btnConfirmDocenteProfile');
      const btnCancel = document.getElementById('btnCancelDocenteProfile');
      
      if (btnConfirm) {
        btnConfirm.addEventListener('click', () => {
          modal.hide();
          state.profile = 'docente';
          state.profileKey = 'docente';
          state.country = 'Uruguay';
          state.consentTracking = false;
          state.nivelEducativo = 'Secundaria';
          
          const consentCheckbox = document.getElementById('consentTracking');
          if (consentCheckbox) consentCheckbox.checked = false;
          
          abrirLaboratorioCasos();
        });
      }
      
      if (btnCancel) {
        btnCancel.addEventListener('click', () => {
          modal.hide();
        });
      }
    }
    return;
  }

  state.isLaboratorioMode = true;
  document.body.classList.add('laboratorio-active');

  // Ocultar otras pantallas
  if (screens.intro) screens.intro.classList.add('hidden');
  if (screens.game) screens.game.classList.add('hidden');
  if (screens.result) {
    screens.result.classList.remove('hidden');
    screens.result.classList.add('fade-in');
  }

  // Activar la pestaña de operacionalizar
  if (elements.resultTabs && elements.resultTabs.length) {
    elements.resultTabs.forEach(tab => {
      const isOperTab = tab.dataset.resultTab === 'operacionalizar';
      tab.classList.toggle('active', isOperTab);
    });
  }
  if (elements.resultTabPanels && elements.resultTabPanels.length) {
    elements.resultTabPanels.forEach(panel => {
      const isOperPanel = panel.dataset.resultPanel === 'operacionalizar';
      panel.classList.toggle('active', isOperPanel);
      if (isOperPanel) panel.style.display = 'block';
      else panel.style.display = 'none';
    });
  }

  // Renderizar
  renderizarCasosSituados();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderizarCasosSituados() {
  if (!elements.situatedCases) return;
  
  elements.situatedCases.innerHTML = '';
  
  const wrapperDiv = document.createElement('div');
  wrapperDiv.className = 'cases-laboratory-container';
  
  const title = document.createElement('h3');
  title.className = 'cases-laboratory-title';
  title.style.fontWeight = '700';
  title.textContent = state.isLaboratorioMode 
    ? 'Laboratorio de Casos: Dilemas Éticos en Modo Taller' 
    : 'Dilemas pedagógicos situados';
  wrapperDiv.appendChild(title);
  
  const listGrid = document.createElement('div');
  listGrid.className = 'cases-list-grid';
  
  CASOS_LABORATORIO.forEach(caso => {
    const card = document.createElement('article');
    card.className = 'case-summary-card';
    
    card.innerHTML = `
      <div class="case-badge-row">
        <span class="case-badge case-badge-${caso.axis}">${caso.axisLabel}</span>
        <span class="case-audience-badge">${caso.audience}</span>
      </div>
      <h4>${caso.title}</h4>
      <p>${caso.story.substring(0, 120)}...</p>
      <button type="button" class="btn btn-primary btn-play-case" data-case-id="${caso.id}">Analizar dilema</button>
    `;
    
    card.querySelector('.btn-play-case').addEventListener('click', () => {
      cargarCasoInteractivo(caso.id);
    });
    
    listGrid.appendChild(card);
  });
  
  wrapperDiv.appendChild(listGrid);
  elements.situatedCases.appendChild(wrapperDiv);
}

function cargarCasoInteractivo(caseId) {
  if (!elements.situatedCases) return;
  const caso = CASOS_LABORATORIO.find(c => c.id === caseId);
  if (!caso) return;
  
  let decisionInicial = null;
  let decisionFinal = null;
  
  const player = document.createElement('div');
  player.className = 'active-case-player';
  
  function renderPlayerState() {
    player.innerHTML = `
      <div class="active-case-player-header">
        <div class="case-player-meta">
          <span class="case-badge case-badge-${caso.axis}" style="display:inline-block; margin-bottom:0.4rem;">${caso.axisLabel}</span>
          <h3 style="font-weight:700;">${caso.title}</h3>
        </div>
        <button type="button" class="btn btn-outline btn-close-case" id="btnCloseCase" style="min-width:auto; padding: 0.5rem 1rem;">← Volver</button>
      </div>
      
      <div class="case-story-box">
        ${caso.story}
      </div>
      
      <div class="case-dilemma-box">
        <strong>Dilema ético-pedagógico</strong>
        <p>${caso.dilemma}</p>
      </div>
      
      <div id="caseDecisionArea">
        <h4 style="margin-bottom:1rem; font-weight:700;">Tomá tu decisión inicial:</h4>
        <div class="case-options-grid">
          ${Object.entries(caso.options).map(([key, opt]) => `
            <button type="button" class="case-option-card${decisionInicial === key ? ' selected' : ''}" data-option="${key}">
              <span class="case-option-letter">${key}</span>
              <span class="case-option-text">${opt.text}</span>
            </button>
          `).join('')}
        </div>
      </div>
      
      <div id="caseGiroArea" class="hidden"></div>
      <div id="caseResolutionArea" class="hidden"></div>
    `;
    
    player.querySelectorAll('.case-option-card').forEach(card => {
      if (decisionInicial !== null) {
        card.style.cursor = 'default';
        card.style.pointerEvents = 'none';
        return;
      }
      card.addEventListener('click', () => {
        decisionInicial = card.dataset.option;
        renderPlayerState();
        mostrarGiroDelCaso();
      });
    });
    
    const closeBtn = player.querySelector('#btnCloseCase');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        renderizarCasosSituados();
      });
    }
  }
  
  function mostrarGiroDelCaso() {
    const giroArea = player.querySelector('#caseGiroArea');
    if (!giroArea) return;
    
    giroArea.className = 'case-giro-box';
    giroArea.innerHTML = `
      <div class="case-giro-header">
        <span>⚠</span>
        <strong>GIRO DEL CASO (Nueva información)</strong>
      </div>
      <div class="case-giro-text">
        ${caso.giro}
      </div>
      <div class="case-giro-question" style="margin-bottom:1.25rem; font-weight:700;">
        ¿Mantendrías tu decisión inicial "${decisionInicial}" o preferís cambiarla tras esta nueva información?
      </div>
      <div class="case-giro-actions">
        <button type="button" class="btn btn-success" id="btnMantenerDecision">Mantener opción "${decisionInicial}"</button>
        <button type="button" class="btn btn-outline" id="btnCambiarDecision">Cambiar mi decisión</button>
      </div>
    `;
    
    player.querySelector('#btnMantenerDecision').addEventListener('click', () => {
      decisionFinal = decisionInicial;
      giroArea.innerHTML = `<p class="case-giro-text" style="background:var(--bg-main); padding: 0.85rem 1rem; border-radius: 8px; border: 1px solid var(--border);"><em>Decidiste mantener tu opción inicial: <strong>"${decisionInicial}"</strong>.</em></p>`;
      mostrarResolucionFinal();
    });
    
    player.querySelector('#btnCambiarDecision').addEventListener('click', () => {
      giroArea.innerHTML = `
        <p class="case-giro-text"><em>Seleccioná tu nueva opción de resolución:</em></p>
        <div class="case-options-grid" style="margin-bottom: 0;">
          ${Object.entries(caso.options).map(([key, opt]) => `
            <button type="button" class="case-option-card${decisionInicial === key ? ' disabled' : ''}" id="btnNewOpt-${key}" data-option="${key}">
              <span class="case-option-letter">${key}</span>
              <span class="case-option-text">${opt.text}</span>
            </button>
          `).join('')}
        </div>
      `;
      
      Object.keys(caso.options).forEach(key => {
        const btn = player.querySelector(`#btnNewOpt-${key}`);
        if (btn) {
          btn.addEventListener('click', () => {
            decisionFinal = key;
            giroArea.innerHTML = `<p class="case-giro-text" style="background:var(--bg-main); padding: 0.85rem 1rem; border-radius: 8px; border: 1px solid var(--border);"><em>Cambiaste tu decisión de la opción inicial "${decisionInicial}" a la opción: <strong>"${decisionFinal}"</strong>.</em></p>`;
            mostrarResolucionFinal();
          });
        }
      });
    });
    
    giroArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  
  function mostrarResolucionFinal() {
    const resArea = player.querySelector('#caseResolutionArea');
    if (!resArea) return;
    
    resArea.className = 'case-resolution-box';
    
    const feedbackOpt = caso.options[decisionFinal]?.feedback || '';
    
    resArea.innerHTML = `
      <h4>Análisis pedagógico y resolución</h4>
      <div class="case-feedback-alert">
        ${feedbackOpt}
      </div>
      
      <p style="line-height: 1.65; margin-bottom: 1.75rem;">
        <strong>Reflexión ética general:</strong> ${caso.analysis}
      </p>
      
      <div class="case-debate-guide">
        <h5>
          <span style="font-size:1.15rem;">👥</span>
          Guía de debate para talleres
        </h5>
        <ul>
          ${caso.debateQuestions.map(q => `<li>${q}</li>`).join('')}
        </ul>
      </div>

      <!-- 📊 Distribución de Decisiones de la Comunidad (Sección Admin/Talleres) -->
      <div class="community-stats-card" style="margin-top: 2rem; background: var(--bg-hover); border: 1px solid var(--border); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem;">
        <h5 style="margin-bottom: 0.5rem; font-weight: 700; color: var(--primary);">📊 Decisiones de la Comunidad de Docentes</h5>
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.25rem;">
          Resultados acumulados de las elecciones de docentes en talleres formativos (se resalta tu decisión final en color):
        </p>
        <div class="stats-bars-container" id="caseCommunityStatsBars"></div>
        
        <!-- Comentarios dinámicos cargados desde la DB -->
        <div id="caseCommunityComments" style="margin-top: 1.5rem; border-top: 1px dashed var(--border); padding-top: 1.25rem; display: none;">
          <h6 style="font-weight: 700; margin-bottom: 0.75rem; font-size: 0.9rem; color: var(--text-primary);">💬 Reflexiones de otros colegas sobre este caso:</h6>
          <div id="caseCommentsList" style="font-size: 0.85rem; display: flex; flex-direction: column; gap: 0.65rem; max-height: 250px; overflow-y: auto; padding-right: 0.5rem;"></div>
        </div>
      </div>

      <!-- Espacio para recoger sugerencias o mejoras (Carácter evolutivo de la app) -->
      <div class="case-feedback-form" style="margin-top: 2rem; border-top: 1px dashed var(--border); padding-top: 1.5rem; margin-bottom: 2rem;">
        <h5 style="margin-bottom: 0.5rem; font-weight: 700; color: var(--primary);">✏️ Sugerencias o mejoras para este caso:</h5>
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.75rem;">
          Este laboratorio es un recurso evolutivo. Compartí tus reflexiones o propuestas de mejora para esta situación.
        </p>
        <textarea id="caseSuggestionText" class="input" style="width:100%; min-height: 80px; resize: vertical; margin-bottom: 0.75rem; border: 1px solid var(--border); border-radius: 8px; padding: 0.5rem;" placeholder="Escribí aquí tus sugerencias o ideas de mejora para este caso..."></textarea>
        <button type="button" class="btn btn-outline" id="btnSendCaseSuggestion" style="width: 100%; font-weight: 600;">Enviar sugerencia</button>
        <div id="caseSuggestionStatus" style="font-size: 0.88rem; margin-top: 0.65rem; text-align: center; font-weight: 600;"></div>
      </div>
      
      <div style="display:flex; flex-direction: column; gap: 1rem; margin-top:2.5rem; max-width: 500px; margin-left: auto; margin-right: auto;">
        <button type="button" class="btn btn-outline" id="btnPrintCaseGuide" style="width: 100%; font-weight: 600;">🖨️ Descargar Ficha de Taller (PDF)</button>
        <button type="button" class="btn btn-primary" id="btnFinishCase" style="width: 100%; font-weight: 600;">Volver a la lista de dilemas</button>
      </div>
    `;
    
    // Renderizar estadísticas de la comunidad
    const statsContainer = resArea.querySelector('#caseCommunityStatsBars');
    if (statsContainer && caso.stats) {
      statsContainer.innerHTML = Object.entries(caso.options).map(([key, opt]) => {
        const percentage = caso.stats[key] || 0;
        const isUserChoice = decisionFinal === key;
        return `
          <div class="stats-bar-row" style="margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.35rem;">
              <span style="${isUserChoice ? 'font-weight: 700; color: var(--primary);' : 'color: var(--text-primary);'}">
                <strong>Opción ${key}</strong> ${isUserChoice ? ' 👈 (Tu decisión final)' : ''}
              </span>
              <span style="font-weight: 700; color: var(--text-primary);">${percentage}%</span>
            </div>
            <div class="progress-bar-bg" style="background: var(--border); height: 12px; border-radius: 6px; overflow: hidden; width: 100%;">
              <div class="progress-bar-fill" style="background: ${isUserChoice ? 'var(--primary)' : 'var(--text-secondary)'}; width: ${percentage}%; height: 100%; border-radius: 6px; transition: width 0.8s ease-in-out;"></div>
            </div>
            <p style="font-size: 0.78rem; color: var(--text-secondary); margin: 0.3rem 0 0 0; line-height: 1.4;">
              ${opt.text}
            </p>
          </div>
        `;
      }).join('');
    }

    // Cargar comentarios comunitarios de forma dinámica
    const commentsSection = resArea.querySelector('#caseCommunityComments');
    const commentsList = resArea.querySelector('#caseCommentsList');
    if (commentsSection && commentsList && CONFIG.opinionsEndpoint) {
      fetch(CONFIG.opinionsEndpoint)
        .then(response => response.json())
        .then(data => {
          const opinions = data.opinions || [];
          const prefix = `[Caso: ${caso.title}]`;
          const caseComments = opinions.filter(op => op.suggestion && op.suggestion.includes(prefix));
          
          if (caseComments.length > 0) {
            commentsSection.style.display = 'block';
            commentsList.innerHTML = caseComments.map(op => {
              const cleanText = op.suggestion.replace(prefix, '').trim();
              return `
                <div style="background: var(--bg-main); padding: 0.75rem 1rem; border-radius: 8px; border-left: 4px solid var(--primary); border: 1px solid var(--border); border-left-width: 4px; border-left-color: var(--primary);">
                  <p style="margin: 0; line-height: 1.5; font-style: italic;">"${cleanText}"</p>
                  <small style="color: var(--text-secondary); display: block; margin-top: 0.35rem; font-size: 0.75rem; font-weight: 600;">
                    — Colega (${op.nivelEducativo || 'Docente'})
                  </small>
                </div>
              `;
            }).join('');
          }
        })
        .catch(err => console.warn('Error al cargar comentarios del caso:', err));
    }

    // Registrar la decisión final del docente en la base de datos de manera anónima (si hay consentimiento)
    if (state.consentTracking && CONFIG.dataEndpoint) {
      const payload = {
        eventType: 'feedback',
        consentTracking: true,
        rating: 4, // rating 4 = caso resuelto
        suggestion: `=CHOICE= [Caso: ${caso.title}] Inicial: ${decisionInicial}, Final: ${decisionFinal}`,
        profile: state.profile || 'docente',
        profileKey: state.profileKey || 'docente',
        sessionId: typeof getAnalyticsSessionId === 'function' ? getAnalyticsSessionId() : 'anonimo',
        country: state.country || 'Uruguay',
        nivelEducativo: state.nivelEducativo || 'Secundaria'
      };
      
      fetch(CONFIG.dataEndpoint, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(err => console.warn('Error al guardar registro de elección del caso:', err));
    }
    
    const sendBtn = resArea.querySelector('#btnSendCaseSuggestion');
    const suggestionText = resArea.querySelector('#caseSuggestionText');
    const statusDiv = resArea.querySelector('#caseSuggestionStatus');
    
    if (sendBtn && suggestionText && statusDiv) {
      sendBtn.addEventListener('click', () => {
        const text = suggestionText.value.trim();
        if (!text) {
          statusDiv.textContent = 'Por favor, escribí una sugerencia antes de enviar.';
          statusDiv.style.color = 'var(--warning)';
          return;
        }
        
        if (!state.consentTracking) {
          statusDiv.textContent = 'Para enviar tu sugerencia, primero debés aceptar el registro de datos anónimos en el inicio.';
          statusDiv.style.color = 'var(--warning)';
          return;
        }
        
        sendBtn.disabled = true;
        sendBtn.textContent = 'Enviando...';
        statusDiv.textContent = 'Guardando tu aporte de forma anónima...';
        statusDiv.style.color = 'var(--text-secondary)';
        
        const payload = {
          eventType: 'feedback',
          consentTracking: true,
          rating: 5,
          suggestion: `[Caso: ${caso.title}] ${text}`,
          profile: state.profile || 'docente',
          profileKey: state.profileKey || 'docente',
          sessionId: typeof getAnalyticsSessionId === 'function' ? getAnalyticsSessionId() : 'anonimo',
          country: state.country || 'Uruguay',
          nivelEducativo: state.nivelEducativo || 'Secundaria'
        };
        
        fetch(CONFIG.dataEndpoint, {
          method: 'POST',
          mode: 'cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
          .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.json();
          })
          .then(() => {
            sendBtn.textContent = '✓ Enviada';
            suggestionText.value = '';
            statusDiv.textContent = '¡Gracias! Tu sugerencia quedó registrada para seguir mejorando el caso.';
            statusDiv.style.color = 'var(--success)';
            
            if (typeof cargarOpinionesAnonimas === 'function') {
              cargarOpinionesAnonimas();
            }
          })
          .catch(err => {
            console.warn('Error al guardar la sugerencia del caso:', err);
            sendBtn.disabled = false;
            sendBtn.textContent = 'Enviar sugerencia';
            statusDiv.textContent = 'No se pudo enviar. Comprobá tu conexión e intentá de nuevo.';
            statusDiv.style.color = 'var(--warning)';
          });
      });
    }

    const printBtn = resArea.querySelector('#btnPrintCaseGuide');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        descargarCasoFichaPDF(caso);
      });
    }
    
    resArea.querySelector('#btnFinishCase').addEventListener('click', () => {
      renderizarCasosSituados();
    });
    
    resArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  
  elements.situatedCases.innerHTML = '';
  elements.situatedCases.appendChild(player);
  renderPlayerState();
}

function renderizarDevolucionFinal(nivel) {
  if (!elements.resultSummary || !elements.resultInsights) return;

  const respuestasAFortalecer = state.path.filter(p => p.answerKey === 'no' || p.answerKey === 'sometimes');
  const respuestasAlineadas = state.path.filter(p => p.answerKey === 'yes');
  const prioridad = respuestasAFortalecer[0];
  const foco = prioridad
    ? `${prioridad.question} Tu respuesta fue "${prioridad.answer}".`
    : 'No aparecieron respuestas críticas; conviene sostener la documentación, la verificación y la autoría declarada.';

  elements.resultSummary.textContent =
    `El nivel "${nivel.id}" no funciona como calificación cerrada, sino como punto de partida para revisar decisiones. ${foco}`;

  const tarjetas = [
    {
      titulo: 'Prioridad inmediata',
      texto: prioridad
        ? prioridad.feedback
        : 'Consolidá las prácticas ya alineadas y compartí criterios claros de uso, límites y verificación.',
      ref: prioridad ? obtenerReferenciaDePaso(prioridad) : 'ANEP / UNESCO / FING / Udelar / Ceibal'
    },
    {
      titulo: 'Fortaleza detectada',
      texto: respuestasAlineadas.length
        ? `Registraste ${respuestasAlineadas.length} respuesta(s) alineada(s) con un uso crítico y reflexivo.`
        : 'Todavía no se registraron respuestas plenamente alineadas; el recorrido ofrece una base para definir mejoras concretas.',
      ref: 'Recorrido personal'
    },
    {
      titulo: 'Siguiente paso',
      texto: 'Elegí un acuerdo didáctico, documentá cómo se usa la IA y verificá los resultados antes de incorporarlos a una producción o actividad.',
      ref: 'Marcos ANEP, UNESCO, FING, Udelar y Ceibal'
    }
  ];

  elements.resultInsights.innerHTML = tarjetas.map(tarjeta => `
    <article class="result-insight">
      <h4>${escapeGameHtml(tarjeta.titulo)}</h4>
      <p>${escapeGameHtml(tarjeta.texto)}</p>
      <span>${escapeGameHtml(tarjeta.ref)}</span>
    </article>
  `).join('');
}

function construirInformeCalidad(nivel) {
  const respuestasAFortalecer = state.path.filter(p => p.answerKey === 'no' || p.answerKey === 'sometimes');
  const respuestasAlineadas = state.path.filter(p => p.answerKey === 'yes');
  const brujula = typeof calcularBrujulaEtica === 'function' ? calcularBrujulaEtica() : [];
  const prioridadBrujula = brujula.length
    ? brujula.reduce((min, axis) => axis.score < min.score ? axis : min, brujula[0])
    : null;
  const fortalezas = respuestasAlineadas.slice(0, 3).map(p => p.question);
  const riesgos = respuestasAFortalecer.slice(0, 3).map(p => p.question);
  const foco = prioridadBrujula ? prioridadBrujula.label : (riesgos[0] || 'Transparencia y verificación');
  const perfilHumano = state.profileBase === 'especializado'
    ? 'docente/investigador/a'
    : state.profileBase === 'docente'
      ? 'docente'
      : state.profileBase === 'estudiante'
        ? 'estudiante'
        : 'participante';

  const accionesBase = [
    `Definir por escrito qué usos de IA se permiten, cuáles no y cómo se declara la asistencia en la próxima ${state.profileBase === 'estudiante' ? 'entrega' : 'actividad'}.`,
    `Incorporar una verificación mínima de fuentes: contrastar resultados de IA con documentos institucionales, bibliografía o criterios acordados.`,
    `Usar el acuerdo editable de esta herramienta para explicitar responsabilidad humana, protección de datos y criterios de evaluación.`
  ];

  if (foco && foco.toLowerCase().includes('datos')) {
    accionesBase[0] = 'Revisar qué información no debe ingresarse en herramientas de IA y dejar esa restricción escrita antes de iniciar la actividad.';
  } else if (foco && foco.toLowerCase().includes('sesgos')) {
    accionesBase[1] = 'Agregar una instancia de revisión de sesgos, omisiones culturales, accesibilidad y pertinencia para el grupo.';
  } else if (foco && foco.toLowerCase().includes('agencia')) {
    accionesBase[2] = 'Solicitar una breve explicación del aporte humano: decisiones tomadas, cambios realizados y criterios usados para aceptar o descartar respuestas de IA.';
  }

  return {
    level: nivel.id,
    evidence: state.evidence,
    profile: perfilHumano,
    focus: foco,
    executiveSummary: `El recorrido muestra un punto de partida ${nivel.id.toLowerCase()} para ${perfilHumano}. La mejora principal pasa por convertir criterios éticos en acuerdos observables: qué se permite, qué se declara, qué se verifica y qué queda bajo responsabilidad humana.`,
    strengths: fortalezas.length ? fortalezas : ['Hay una base de trabajo para formalizar criterios de uso responsable y compartirlos con otras personas.'],
    risks: riesgos.length ? riesgos : ['El principal desafío es sostener estas prácticas en distintas tareas y no dejarlas como decisiones aisladas.'],
    actions: accionesBase,
    rubric: [
      'Declaración de uso de IA: herramienta, finalidad y partes asistidas.',
      'Verificación: fuentes contrastadas o criterio de validación explícito.',
      'Aporte humano: decisiones propias, contextualización y revisión final.',
      'Cuidado de datos: ausencia de información sensible o identificable.'
    ],
    references: isForeignCountry() ? 'UNESCO (Guía para IA Generativa en Educación e Investigación)' : 'ANEP, UNESCO, FING, Udelar y Ceibal'
  };
}

function renderizarInformeCalidad(nivel) {
  if (!elements.qualityReportContent) return;
  const report = construirInformeCalidad(nivel);
  elements.qualityReportContent.innerHTML = `
    <section class="quality-report-summary">
      <strong>Resumen ejecutivo</strong>
      <p>${escapeGameHtml(report.executiveSummary)}</p>
    </section>
    <div class="quality-report-grid">
      <article>
        <h4>Fortalezas detectadas</h4>
        <ul>${report.strengths.map(item => `<li>${escapeGameHtml(item)}</li>`).join('')}</ul>
      </article>
      <article>
        <h4>Riesgos a atender</h4>
        <ul>${report.risks.map(item => `<li>${escapeGameHtml(item)}</li>`).join('')}</ul>
      </article>
      <article>
        <h4>3 acciones próximas</h4>
        <ol>${report.actions.map(item => `<li>${escapeGameHtml(item)}</li>`).join('')}</ol>
      </article>
      <article>
        <h4>Rúbrica breve</h4>
        <ul>${report.rubric.map(item => `<li>${escapeGameHtml(item)}</li>`).join('')}</ul>
      </article>
    </div>
  `;
}

function guardarDiagnosticoEnHistorialLocal(nivel) {
  if (typeof window.saveLocalDiagnostic !== 'function') return;
  const report = construirInformeCalidad(nivel);
  window.saveLocalDiagnostic({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    date: new Date().toLocaleDateString('es-UY'),
    level: nivel.id,
    evidence: state.evidence,
    profile: `${report.profile}${state.nivelEducativo ? ` · ${state.nivelEducativo}` : ''}`,
    focus: report.focus,
    summary: report.actions[0],
  });
}

window.getQualityReportData = function getQualityReportData() {
  const nivel = CONFIG.likert.find(l => state.evidence >= l.min && l.max >= state.evidence) || CONFIG.likert[0];
  return construirInformeCalidad(nivel);
};

function obtenerReferenciaDePaso(paso) {
  const perfil = CONFIG.perfiles[state.profileKey];
  const nodo = perfil && perfil.nodos ? perfil.nodos[paso.id] : null;
  return nodo && nodo.anepRef ? nodo.anepRef : 'Marcos de referencia';
}

const ETHICAL_COMPASS_AXES = [
  {
    id: 'transparencia',
    label: 'Transparencia',
    hint: 'Declarar uso, herramienta, finalidad y aporte humano.',
    patterns: ['transparent', 'declar', 'autor', 'cit', 'asistencia', 'permitido', 'regla']
  },
  {
    id: 'verificacion',
    label: 'Verificación',
    hint: 'Contrastar información, fuentes y límites de la respuesta.',
    patterns: ['verific', 'contrast', 'fuente', 'alucin', 'información', 'informacion']
  },
  {
    id: 'privacidad',
    label: 'Datos y privacidad',
    hint: 'Proteger datos personales, sensibles e institucionales.',
    patterns: ['dato', 'privacidad', 'sensible', 'personal', 'consent', 'protección', 'proteccion']
  },
  {
    id: 'equidad',
    label: 'Sesgos y equidad',
    hint: 'Revisar sesgos, inclusión, accesibilidad y contexto.',
    patterns: ['sesg', 'divers', 'inclus', 'acces', 'equidad', 'contexto', 'grupo']
  },
  {
    id: 'agencia',
    label: 'Agencia humana',
    hint: 'Sostener criterio propio, comprensión y supervisión humana.',
    patterns: ['valor', 'aporte', 'personal', 'original', 'comprensión', 'comprension', 'previo', 'proceso', 'decisiones']
  }
];

function puntajeRespuestaParaBrujula(answerKey) {
  if (answerKey === 'yes') return 100;
  if (answerKey === 'sometimes') return 58;
  if (answerKey === 'na') return 72;
  return 28;
}

function resolverEjesDePaso(paso) {
  const texto = `${paso.question || ''} ${paso.feedback || ''}`.toLowerCase();
  const ejes = ETHICAL_COMPASS_AXES
    .filter(axis => axis.patterns.some(pattern => texto.includes(pattern)))
    .map(axis => axis.id);
  return ejes.length ? ejes : ['agencia'];
}

function calcularBrujulaEtica() {
  const acumulado = ETHICAL_COMPASS_AXES.reduce((acc, axis) => {
    acc[axis.id] = { total: 0, count: 0 };
    return acc;
  }, {});

  state.path.forEach(paso => {
    const score = puntajeRespuestaParaBrujula(paso.answerKey);
    resolverEjesDePaso(paso).forEach(axisId => {
      acumulado[axisId].total += score;
      acumulado[axisId].count += 1;
    });
  });

  return ETHICAL_COMPASS_AXES.map(axis => {
    const data = acumulado[axis.id];
    const score = data.count ? Math.round(data.total / data.count) : 64;
    return { ...axis, score };
  });
}

function debugLog(...args) {
  if (window.CONFIG && window.CONFIG.debug) {
    console.log(...args);
  }
}

function clasificarScoreBrujula(score) {
  if (score >= 76) return { label: 'Consolidado', className: 'is-strong' };
  if (score >= 55) return { label: 'En desarrollo', className: 'is-medium' };
  return { label: 'Prioritario', className: 'is-priority' };
}

function renderizarBrujulaEtica(nivel) {
  if (!elements.ethicalCompassBars) return;

  const axes = calcularBrujulaEtica();
  const prioridad = axes.reduce((min, axis) => axis.score < min.score ? axis : min, axes[0]);
  const promedio = Math.round(axes.reduce((sum, axis) => sum + axis.score, 0) / axes.length);
  const estadoGlobal = clasificarScoreBrujula(promedio);

  if (elements.ethicalCompassLevel) {
    elements.ethicalCompassLevel.textContent = `${estadoGlobal.label} · ${promedio}%`;
    elements.ethicalCompassLevel.className = `ethical-compass-level ${estadoGlobal.className}`;
  }

  if (elements.ethicalCompassFocus) {
    elements.ethicalCompassFocus.textContent = `Foco sugerido: ${prioridad.label}`;
  }

  if (elements.ethicalCompassCopy) {
    elements.ethicalCompassCopy.textContent =
      `Tu nivel general es "${nivel.id}". Para llevar el acuerdo a la práctica, conviene priorizar ${prioridad.label.toLowerCase()}: ${prioridad.hint}`;
  }

  elements.ethicalCompassBars.innerHTML = axes.map(axis => {
    const status = clasificarScoreBrujula(axis.score);
    return `
      <article class="ethical-compass-axis ${status.className}">
        <div class="ethical-compass-axis-head">
          <strong>${axis.label}</strong>
          <span>${axis.score}%</span>
        </div>
        <div class="ethical-compass-track">
          <div class="ethical-compass-fill" style="width: ${axis.score}%"></div>
        </div>
        <p>${axis.hint}</p>
      </article>
    `;
  }).join('');
  renderPrincipleGraph(elements.principleResultGraph, elements.principleResultGraphStatus, { result: true });
  updateDecisionMap();
}

function construirAcuerdoDidactico(nivel) {
  const perfilBase = state.profileBase || state.profile || 'participante';
  const formato = state.agreementFormat || 'aula';
  const formatos = {
    aula: {
      titulo: 'Acuerdo didáctico de uso de inteligencia artificial generativa',
      destino: 'tarea, unidad o curso',
      cierre: 'Durante la próxima actividad o unidad se revisará si este acuerdo fue suficiente, qué dudas aparecieron y qué ajuste conviene realizar.'
    },
    estudiante: {
      titulo: 'Guía breve para estudiantes sobre uso responsable de IA',
      destino: 'consigna o entrega académica',
      cierre: 'Antes de entregar, revisá si declaraste el uso, verificaste información y agregaste criterio propio.'
    },
    institucional: {
      titulo: 'Borrador de criterios institucionales para uso de IA',
      destino: 'sala docente, coordinación o equipo de gestión',
      cierre: 'El equipo podrá revisar este borrador, acordar mínimos comunes y definir cómo comunicarlo a estudiantes y familias.'
    },
    virtual: {
      titulo: 'Texto breve para aula virtual o plataforma educativa',
      destino: 'Crea, Moodle, Classroom u otra plataforma',
      cierre: 'Pegá este acuerdo junto a la consigna y ajustá ejemplos, herramientas permitidas y forma de declaración según la actividad.'
    }
  };
  const formatoActual = formatos[formato] || formatos.aula;
  const perfilHumano = perfilBase === 'especializado'
    ? 'docente/investigador/a en IA educativa'
    : perfilBase === 'docente'
      ? 'docente'
      : 'estudiante';
  const nivelEducativo = state.nivelEducativo || 'nivel educativo no especificado';
  const respuestasAFortalecer = state.path.filter(p => p.answerKey === 'no' || p.answerKey === 'sometimes');
  const respuestasAlineadas = state.path.filter(p => p.answerKey === 'yes');
  const prioridades = respuestasAFortalecer.slice(0, 3);
  const fecha = new Date().toLocaleDateString('es-UY');

  const focoPrincipal = prioridades.length
    ? prioridades.map((p, index) => `${index + 1}. ${p.question} Respuesta: ${p.answer}.`).join('\n')
    : '1. Mantener y compartir las prácticas ya consolidadas, especialmente verificación, transparencia y autoría.';

  const usoPermitido = perfilBase === 'docente'
    ? 'planificar, adaptar materiales, diseñar preguntas, revisar consignas, elaborar ejemplos y generar apoyos diferenciados, siempre con revisión pedagógica.'
    : perfilBase === 'especializado'
      ? 'analizar marcos, diseñar orientaciones, revisar instrumentos de formación, construir acuerdos y sistematizar criterios, siempre explicitando alcances y límites.'
    : 'buscar ideas iniciales, revisar borradores, pedir explicaciones alternativas, organizar información y contrastar fuentes, siempre conservando producción propia.';

  const responsabilidad = perfilBase === 'docente'
    ? 'La decisión pedagógica, la selección de materiales y la evaluación final quedan bajo responsabilidad docente.'
    : perfilBase === 'especializado'
      ? 'La interpretación de marcos, la orientación a otros actores y la construcción de criterios compartidos quedan bajo responsabilidad profesional y académica.'
    : 'La comprensión, la explicación del proceso y la producción final quedan bajo responsabilidad de quien entrega la tarea.';

  return `${formatoActual.titulo}
Fecha: ${fecha}
Perfil: ${perfilHumano}
Nivel/contexto: ${nivelEducativo}
Resultado del recorrido: ${nivel.id}
Formato: ${formatoActual.destino}

Propósito
Usaremos IA generativa como apoyo para aprender, enseñar, revisar y pensar mejor. No sustituirá el juicio humano, la responsabilidad pedagógica ni la autoría de las producciones.

Usos permitidos
La IA podrá utilizarse para ${usoPermitido}

Transparencia
Cuando se utilice IA, se declarará qué herramienta se usó, para qué finalidad, en qué parte del proceso intervino y qué decisiones humanas modificaron o validaron la respuesta generada.

Verificación
Toda información relevante generada por IA deberá contrastarse con fuentes confiables, bibliografía, documentos institucionales o criterio experto antes de incorporarse a una actividad o producción.

Datos y privacidad
No se compartirán datos personales, sensibles, médicos, familiares, institucionales reservados ni información identificable de estudiantes o colegas en herramientas de IA.

Sesgos e inclusión
Los contenidos generados se revisarán para detectar errores, sesgos, estereotipos, omisiones culturales, problemas de accesibilidad o desajustes con la realidad del grupo.

Autoría y valor agregado humano
La producción final deberá mostrar comprensión, criterio propio, contextualización y aportes personales. La IA podrá asistir el proceso, pero no reemplazar el pensamiento ni la explicación de las decisiones tomadas.

Responsabilidad
${responsabilidad}

Prioridades detectadas en este recorrido
${focoPrincipal}

Seguimiento
${formatoActual.cierre} El objetivo es fortalecer un uso ético, crítico, reflexivo, seguro y responsable de la IA.

Referencias orientadoras
ANEP, UNESCO, FING, Udelar y Ceibal.`;
}

function renderizarAcuerdoDidactico(nivel) {
  if (!elements.agreementBuilderText) return;
  const texto = construirAcuerdoDidactico(nivel);
  state.generatedAgreementText = texto;
  elements.agreementBuilderText.value = texto;
  if (elements.agreementBuilderStatus) {
    elements.agreementBuilderStatus.textContent = '';
  }
}

function obtenerAcuerdoDidacticoActual() {
  if (elements.agreementBuilderText && elements.agreementBuilderText.value.trim()) {
    return elements.agreementBuilderText.value.trim();
  }
  return state.generatedAgreementText || '';
}

window.obtenerAcuerdoDidacticoActual = obtenerAcuerdoDidacticoActual;

/**
 * Prepara el mensaje contextual para que el chatbot pueda generar consejos
 * cuando el usuario elija ver las sugerencias.
 */
function prepararSugerenciasDeMejoraEnChatbot() {
  try {
    const mensajeAutomatico = generarMensajeAutomaticoDeConsejos();
    if (!mensajeAutomatico) return;

    window.chatbotImprovementPrompt = mensajeAutomatico;
    const sugerenciasBtn = document.getElementById('improvementSuggestionsBtn');
    if (sugerenciasBtn) {
      sugerenciasBtn.onclick = () => {
        if (typeof window.askChatbotForImprovementSuggestions === 'function') {
          window.askChatbotForImprovementSuggestions(mensajeAutomatico);
        } else if (typeof window.sendMessage === 'function') {
          window.sendMessage(mensajeAutomatico);
        }
      };
    }

    setTimeout(() => {
      if (typeof window.showChatbotImprovementPrompt === 'function') {
        window.showChatbotImprovementPrompt(mensajeAutomatico);
      }
    }, 400);
  } catch (err) {
    console.error('❌ Error preparando sugerencias del chatbot:', err);
  }
}

/**
 * Genera un mensaje automático para obtener consejos personalizados.
 * Devuelve el texto para que el chatbot lo use cuando el usuario lo pida.
 */
function generarMensajeAutomaticoDeConsejos() {
  try {
    const nivel = CONFIG.likert.find(
      l => state.evidence >= l.min && l.max >= state.evidence
    );
    
    const respuestasAFortalecer = state.path.filter(p => p.answerKey === 'no' || p.answerKey === 'sometimes');
    const areas = respuestasAFortalecer.length
      ? respuestasAFortalecer.map((p, index) => `${index + 1}. ${p.question} - respuesta: ${p.answer}. ${p.feedback}`).join('\n')
      : 'No hay respuestas marcadas como "No" o "A veces"; sugerí formas de consolidar y profundizar las prácticas ya alineadas.';
    
    return `Acabo de completar el recorrido y obtuve nivel "${nivel.id}" con ${state.evidence} puntos. Estas son mis áreas de mejora detectadas:
${areas}

Con base en los marcos UNESCO, ANEP, FING, Udelar y Ceibal, mostrame 3 sugerencias de mejora priorizadas, concretas y aplicables para mi perfil (${state.profileBase || state.profile}, ${state.nivelEducativo || 'nivel no indicado'}).`;
  } catch (err) {
    console.error('❌ Error generando mensaje automático:', err);
    return '';
  }
}

/* ========================================
   EVENT LISTENERS DEL JUEGO
   ======================================== */
if (elements.yesBtn)   elements.yesBtn.addEventListener('click', () => responder('yes'));
if (elements.sometimesBtn) elements.sometimesBtn.addEventListener('click', () => responder('sometimes'));
if (elements.noBtn)    elements.noBtn.addEventListener('click', () => responder('no'));
if (elements.notApplicableBtn) elements.notApplicableBtn.addEventListener('click', () => responder('na'));
window.iniciarJuego = iniciarJuego;

if (elements.nextBtn)  elements.nextBtn.addEventListener('click', avanzar);
if (elements.backBtn)  elements.backBtn.addEventListener('click', retroceder);
if (elements.startBtn) elements.startBtn.addEventListener('click', () => window.iniciarJuego());

if (elements.copyAgreementBtn) {
  elements.copyAgreementBtn.addEventListener('click', async () => {
    const texto = obtenerAcuerdoDidacticoActual();
    if (!texto) return;

    try {
      await navigator.clipboard.writeText(texto);
      if (elements.agreementBuilderStatus) {
        elements.agreementBuilderStatus.textContent = 'Acuerdo copiado.';
      }
      elements.copyAgreementBtn.textContent = 'Copiado';
      setTimeout(() => { elements.copyAgreementBtn.textContent = 'Copiar acuerdo'; }, 1800);
    } catch (err) {
      if (elements.agreementBuilderText) {
        elements.agreementBuilderText.focus();
        elements.agreementBuilderText.select();
      }
      if (elements.agreementBuilderStatus) {
        elements.agreementBuilderStatus.textContent = 'Seleccioné el texto para que puedas copiarlo.';
      }
    }
  });
}

if (elements.regenerateAgreementBtn) {
  elements.regenerateAgreementBtn.addEventListener('click', () => {
    const nivel = CONFIG.likert.find(
      l => state.evidence >= l.min && l.max >= state.evidence
    );
    if (!nivel) return;
    renderizarAcuerdoDidactico(nivel);
    if (elements.agreementBuilderStatus) {
      elements.agreementBuilderStatus.textContent = 'Borrador regenerado con tu recorrido actual.';
    }
  });
}

if (elements.agreementFormatBtns && elements.agreementFormatBtns.length) {
  elements.agreementFormatBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      state.agreementFormat = btn.dataset.agreementFormat || 'aula';
      elements.agreementFormatBtns.forEach(item => {
        item.classList.toggle('active', item === btn);
      });
      const nivel = CONFIG.likert.find(
        l => state.evidence >= l.min && l.max >= state.evidence
      );
      if (nivel) {
        renderizarAcuerdoDidactico(nivel);
        if (elements.agreementBuilderStatus) {
          elements.agreementBuilderStatus.textContent = 'Formato actualizado.';
        }
      }
    });
  });
}

async function descargarCasoFichaPDF(caso) {
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
      alert("No se pudo cargar la librería PDF. Por favor comprueba tu conexión a internet.");
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    
    let y = 20;
    
    // Encabezado
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, 210, 30, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text("LABORATORIO DE CASOS: ÉTICA PEDAGÓGICA E IAG", 15, 14);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text("Guía de Debate para Talleres de Formación Docente", 15, 22);
    
    y = 42;
    
    // Título del caso
    doc.setTextColor(31, 41, 55);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(`Caso: ${caso.title}`, 15, y);
    y += 8;
    
    // Eje pedagógico
    doc.setFillColor(243, 244, 246);
    doc.rect(15, y, 180, 8, 'F');
    doc.setTextColor(79, 70, 229);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Eje: ${caso.axisLabel.toUpperCase()}`, 18, y + 5.5);
    y += 15;
    
    // Situación (Caso)
    doc.setTextColor(31, 41, 55);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text("SITUACIÓN INICIAL (Dilema Ético):", 15, y);
    y += 5;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    let splitText = doc.splitTextToSize(caso.story, 180);
    doc.text(splitText, 15, y);
    y += splitText.length * 5 + 8;
    
    // Giro del caso
    doc.setFont('helvetica', 'bold');
    doc.text("GIRO DEL CASO (Nueva información de contexto):", 15, y);
    y += 5;
    
    doc.setFont('helvetica', 'normal');
    splitText = doc.splitTextToSize(caso.giro, 180);
    doc.text(splitText, 15, y);
    y += splitText.length * 5 + 8;
    
    // Opciones de resolución
    doc.setFont('helvetica', 'bold');
    doc.text("OPCIONES DE RESOLUCIÓN DISPONIBLES:", 15, y);
    y += 5;
    
    doc.setFont('helvetica', 'normal');
    for (const [letter, option] of Object.entries(caso.options)) {
      const optText = doc.splitTextToSize(`Opción ${letter}: ${option.text}`, 175);
      doc.text("•", 15, y);
      doc.text(optText, 20, y);
      y += optText.length * 5 + 2;
    }
    y += 6;
    
    if (y > 235) {
      doc.addPage();
      y = 20;
    }
    
    // Análisis Pedagógico
    doc.setFont('helvetica', 'bold');
    doc.text("ANÁLISIS PEDAGÓGICO Y REFLEXIÓN ÉTICA:", 15, y);
    y += 5;
    
    doc.setFont('helvetica', 'normal');
    splitText = doc.splitTextToSize(caso.analysis, 180);
    doc.text(splitText, 15, y);
    y += splitText.length * 5 + 8;
    
    if (y > 235) {
      doc.addPage();
      y = 20;
    }
    
    // Guía de Debate
    doc.setFillColor(243, 244, 246);
    doc.rect(15, y, 180, 42, 'F');
    
    doc.setTextColor(31, 41, 55);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text("PREGUNTAS ORIENTADORAS PARA DEBATE EN GRUPOS:", 18, y + 7);
    y += 12;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    caso.debateQuestions.forEach((q, idx) => {
      const qText = doc.splitTextToSize(`${idx + 1}. ${q}`, 170);
      doc.text(qText, 18, y);
      y += qText.length * 5 + 1;
    });
    
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text("Herramienta IAG en clave de ética pedagógica - ANEP / Ceibal / Udelar / FING", 15, 287);
    doc.text("Recurso evolutivo y abierto para formación docente.", 132, 287);

    doc.save(`Guia_Taller_Caso_${caso.id}.pdf`);
  } catch (error) {
    console.error("Error al generar PDF del caso:", error);
    alert("Hubo un error al generar el PDF.");
  }
}
