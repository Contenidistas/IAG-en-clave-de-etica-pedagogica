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
    const priority = nodes.find(node => node.className === 'priority') || nodes.find(node => node.className === 'progress');
    statusTarget.textContent = priority ? `Foco: ${priority.label}` : 'Recorrido sin focos críticos';
  }
}

function renderDecisionBranchMap() {
  if (!elements.decisionBranchMap) return;

  const perfil = CONFIG.perfiles[state.profileKey];
  const currentNode = perfil && perfil.nodos ? perfil.nodos[state.currentId] : null;
  const steps = state.path || [];

  if (elements.decisionBranchStatus) {
    elements.decisionBranchStatus.textContent = steps.length
      ? `${steps.length} decisión(es)`
      : 'Inicio';
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
          <em>Decisión actual</em>
        </div>
      </article>
    `
    : `
      <article class="decision-branch-node finish">
        <span class="decision-branch-index">✓</span>
        <div>
          <strong>Recorrido completo</strong>
          <p>Ya hay base para generar la devolución y el acuerdo.</p>
          <em>Resultado</em>
        </div>
      </article>
    `;

  elements.decisionBranchMap.innerHTML = `
    <div class="decision-branch-start">
      <span></span>
      <strong>Inicio</strong>
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
  if (!pasos.length) {
    return {
      className: 'pending',
      label: 'Pendiente',
      feedback: 'Todavía no apareció una decisión vinculada a este principio.'
    };
  }
  if (pasos.some(paso => paso.answerKey === 'no')) {
    return {
      className: 'priority',
      label: 'Priorizar',
      feedback: 'Conviene atender este principio en primer lugar: hay señales que requieren acuerdos, revisión o criterios más explícitos.'
    };
  }
  if (pasos.some(paso => paso.answerKey === 'sometimes')) {
    return {
      className: 'progress',
      label: 'En proceso',
      feedback: 'Hay avances, pero la práctica todavía necesita mayor sistematicidad, registro o claridad.'
    };
  }
  return {
    className: 'done',
    label: 'Alineado',
    feedback: 'Las respuestas muestran una práctica coherente con este principio. Conviene sostenerla y documentarla.'
  };
}

function renderDecisionContext(nodo) {
  const criterio = inferirCriterioDeNodo(nodo);
  if (elements.activeCriterionBadge) {
    elements.activeCriterionBadge.textContent = `Criterio: ${criterio.label}`;
  }
  if (elements.decisionReason) {
    const last = state.path[state.path.length - 1];
    elements.decisionReason.textContent = last
      ? `Llegaste aquí después de responder "${last.answer}" en: ${last.question}`
      : criterio.reason;
  }
}

function updateDecisionMap() {
  if (!elements.decisionMapAxes) {
    renderDecisionBranchMap();
    return;
  }

  const touched = new Set(state.path.map(paso => paso.criterionId).filter(Boolean));
  const activeCriterion = (() => {
    const perfil = CONFIG.perfiles[state.profileKey];
    const nodo = perfil && perfil.nodos ? perfil.nodos[state.currentId] : null;
    return nodo ? inferirCriterioDeNodo(nodo).id : null;
  })();

  if (elements.decisionMapCount) {
    elements.decisionMapCount.textContent = `${touched.size} de ${DECISION_CRITERIA.length} criterios`;
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
    modal.show('Marcos de referencia', `
      <p><strong>Fundamentación:</strong></p>
      <p>${nodo.context}</p>
      <p style="margin-top: 1rem;"><strong>Referencia:</strong> ${nodo.anepRef}</p>
    `);
  };
}

/**
 * Construye un mensaje de feedback breve según la pregunta y la respuesta
 */
function construirFeedback(nodo, answerKey) {
  const t = nodo.title.toLowerCase();

  if (answerKey === 'na') {
    return 'Queda registrado como no aplicable. Podés avanzar sin que afecte tu puntaje.';
  }

  if (answerKey === 'sometimes') {
    if (t.includes('verific')) return 'Buen punto de partida: conviene volver la verificación más sistemática.';
    if (t.includes('sesg')) return 'Hay una base: podés fortalecer el análisis de sesgos con criterios más explícitos.';
    if (t.includes('autor')) return 'Vas en camino: intentá declarar la asistencia de IA siempre que corresponda.';
    if (t.includes('regla')) return 'Hay acuerdos parciales: conviene hacerlos más claros y compartidos.';
    return 'Respuesta parcial: hay avances, pero todavía puede consolidarse como práctica habitual.';
  }

  if (answerKey === 'yes') {
    if (t.includes('verific'))      return 'Excelente: verificás la información antes de usarla.';
    if (t.includes('sesg'))         return 'Muy bien: reconocés sesgos y trabajás para mitigarlos.';
    if (t.includes('autor'))        return 'Correcto: declarás autoría y asistencia de IA.';
    if (t.includes('valor'))        return 'Bien: explicitás el valor pedagógico de la IA.';
    if (t.includes('regla'))        return 'Perfecto: establecés reglas claras de uso.';
    if (t.includes('aporte') || t.includes('personal'))
      return 'Sumás valor humano: análisis, síntesis y contexto.';
    if (t.includes('prev') || t.includes('conocimiento'))
      return 'Correcto: partís de bases conceptuales.';
    return 'Decisión alineada al uso crítico de la IA.';
  } else {
    if (t.includes('verific'))      return 'Foco posible: sumar verificación de información antes de usarla.';
    if (t.includes('sesg'))         return 'Foco posible: incorporar análisis de sesgos y estrategias de mitigación.';
    if (t.includes('autor'))        return 'Foco posible: declarar autoría y asistencia de IA cuando corresponda.';
    if (t.includes('valor'))        return 'Foco posible: explicitar el valor pedagógico de la IA.';
    if (t.includes('regla'))        return 'Foco posible: definir reglas claras de uso para tu curso.';
    if (t.includes('aporte') || t.includes('personal'))
      return 'Foco posible: incorporar aportes personales, síntesis y mirada crítica.';
    if (t.includes('prev') || t.includes('conocimiento'))
      return 'Foco posible: asegurar bases conceptuales previas.';
    return 'Foco de mejora identificado para seguir pensando.';
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
  const tipo = tone === 'success' ? 'success' : tone === 'neutral' ? 'neutral' : 'warning';
  const titulo = tone === 'success'
    ? 'Decisión alineada al uso crítico'
    : tone === 'neutral'
      ? 'Respuesta registrada'
      : tone === 'partial'
        ? 'Práctica en proceso'
        : 'Área de mejora identificada';

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
  elements.progressText.textContent =
    `Pregunta ${state.currentQuestion} de ${state.totalQuestions}`;
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
  renderizarBrujulaEtica(nivel);
  renderizarAcuerdoDidactico(nivel);
  renderizarCasosSituados();

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

function construirCasosSituados() {
  const criterio = obtenerCriterioPrioritario();
  const perfil = state.profileBase || state.profile || 'participante';
  const nivel = state.nivelEducativo || 'contexto no especificado';
  const casosBase = [
    {
      title: 'Entrega con IA no declarada',
      audience: 'Aula',
      prompt: `Un estudiante entrega una producción que parece asistida por IA, pero no lo declara. ¿Cómo conversar la situación sin reducirla a sanción y cómo reconstruir un acuerdo de transparencia?`
    },
    {
      title: 'Consigna con IA permitida',
      audience: 'Docencia',
      prompt: `Una actividad permite usar IA para idear, revisar y mejorar un borrador. ¿Qué condiciones deberían explicitarse para sostener autoría, verificación y aporte humano?`
    },
    {
      title: 'Criterio institucional común',
      audience: 'Equipo',
      prompt: `Un equipo necesita definir criterios mínimos de uso de IA para varias asignaturas. ¿Qué acuerdos comunes evitarían decisiones contradictorias o desiguales?`
    }
  ];

  return casosBase.map(caso => ({
    ...caso,
    focus: criterio ? criterio.label : 'Criterios éticos',
    text: `${caso.prompt}\n\nPerfil/contexto: ${perfil}, ${nivel}.\nPrincipio a mirar con especial atención: ${criterio ? criterio.label : 'criterios éticos'}.\nDecisión esperada: acordar qué se permite, qué se declara, qué se verifica y qué queda bajo responsabilidad humana.`
  }));
}

function renderizarCasosSituados() {
  if (!elements.situatedCases) return;
  const casos = construirCasosSituados();
  elements.situatedCases.innerHTML = casos.map((caso, index) => `
    <article class="situated-case-card">
      <span>${escapeGameHtml(caso.audience)}</span>
      <h4>${escapeGameHtml(caso.title)}</h4>
      <p>${escapeGameHtml(caso.prompt)}</p>
      <small>Foco conectado: ${escapeGameHtml(caso.focus)}</small>
      <button type="button" class="btn btn-outline situated-case-btn" data-case-index="${index}">Copiar caso</button>
    </article>
  `).join('');

  elements.situatedCases.querySelectorAll('.situated-case-btn').forEach(button => {
    button.addEventListener('click', async () => {
      const caso = casos[Number(button.dataset.caseIndex || 0)];
      try {
        await navigator.clipboard.writeText(caso.text);
        button.textContent = 'Copiado';
        setTimeout(() => { button.textContent = 'Copiar caso'; }, 1600);
      } catch {
        modal.show('Caso situado', `<p>${escapeGameHtml(caso.text).replace(/\n/g, '<br>')}</p>`);
      }
    });
  });
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
