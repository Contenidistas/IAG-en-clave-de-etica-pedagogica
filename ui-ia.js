/* ========================================
   ELEMENTOS DEL DOM (ACTUALIZADO CON NIVEL EDUCATIVO)
   ======================================== */
const screens = {
  intro: document.getElementById('screenIntro'),
  game: document.getElementById('screenGame'),
  result: document.getElementById('screenResult')
};

const elements = {
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
  opinionsStatus: document.getElementById('opinionsStatus'),
  opinionsCarousel: document.getElementById('opinionsCarousel'),
  prevOpinionBtn: document.getElementById('prevOpinionBtn'),
  nextOpinionBtn: document.getElementById('nextOpinionBtn'),

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
const NIVELES_EDUCATIVOS = {
  docente: [
    'Primaria',
    'Enseñanza Media Básica',
    'Enseñanza Media Superior',
    'Formación Docente',
    'Universitaria'
  ],
  estudiante: [
    'Enseñanza Media Básica',
    'Enseñanza Media Superior',
    'Formación Docente',
    'Universitaria'
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

  // Cargar opciones según perfil
  const niveles = NIVELES_EDUCATIVOS[perfil] || [];
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

  // Actualizar botón de inicio
  updateStartButtonState();
}

function hideNivelEducativo() {
  if (!elements.nivelEducativoWrapper) return;
  elements.nivelEducativoWrapper.style.display = 'none';
  if (elements.nivelEducativo) {
    elements.nivelEducativo.value = '';
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
    elements.carouselTrack.style.height = `${activeSlide.offsetHeight}px`;
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
  const copy = FRAMEWORK_AUDIENCE_COPY[audience] || {
    title: 'Marcos de UNESCO, ANEP, FING, Udelar y Ceibal',
    intro: 'Elegí un perfil para adaptar la profundidad de la fundamentación y hacer el recorrido más liviano.',
    context: 'La herramienta adapta la densidad de los marcos según el lugar desde el que se realiza el recorrido.',
    button: 'Ver marcos'
  };

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
  nivel: {
    title: 'Contexto educativo',
    target: 'nivel',
    isValid: () => !(state.profile === 'docente' || state.profile === 'estudiante')
      || (elements.nivelEducativo && elements.nivelEducativo.value.trim() !== '')
  },
  contexto: {
    title: 'Datos de contexto',
    target: 'contexto',
    isValid: () => true
  },
  familiaridad: {
    title: 'Experiencia previa',
    target: 'familiaridad',
    isValid: () => elements.familiaridadInicial && elements.familiaridadInicial.value.trim() !== ''
  },
  recursos: {
    title: 'Recursos similares',
    target: 'recursos',
    isValid: () => elements.recursosSimilaresRadios
      && Array.from(elements.recursosSimilaresRadios).some(r => r.checked)
  },
  cierre: {
    title: 'Privacidad y cierre',
    target: 'start',
    isValid: () => true
  }
};

function getOnboardingStepKeys() {
  const keys = ['profile'];
  if (state.profile === 'docente' || state.profile === 'estudiante') {
    keys.push('nivel');
  }
  keys.push('contexto', 'familiaridad', 'recursos', 'cierre');
  return keys;
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

  if (elements.onboardingStepCounter) {
    elements.onboardingStepCounter.textContent = `Paso ${state.onboardingStep + 1} de ${keys.length}`;
  }
  if (elements.onboardingStepTitle) {
    elements.onboardingStepTitle.textContent = ONBOARDING_STEP_META[activeKey]?.title || 'Inicio guiado';
  }
  if (elements.onboardingDots) {
    elements.onboardingDots.style.setProperty('--onboarding-steps', keys.length);
    elements.onboardingDots.innerHTML = keys.map((key, index) => `
      <button type="button" class="onboarding-dot${index === state.onboardingStep ? ' active' : ''}${ONBOARDING_STEP_META[key]?.isValid() ? ' done' : ''}" data-onboarding-index="${index}" aria-label="Ir al paso ${index + 1}"></button>
    `).join('');
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

function retreatOnboarding() {
  syncOnboardingStepBounds();
  state.onboardingStep = Math.max(0, state.onboardingStep - 1);
  updateOnboardingUI();
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
    focusInitialField(button.dataset.guideTarget);
  });
}

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

            updateStartButtonState();
            updateCarousel();
            showScreen('intro');
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
if (btnVerAutores) btnVerAutores.addEventListener('click', function() {
    const info = document.getElementById('infoAutores');
    if (!info) return;

    const title = this.querySelector('.btn-academic-title');
    const icon = this.querySelector('.btn-academic-icon');
    const isHidden = info.style.display === 'none';

    info.style.display = isHidden ? 'block' : 'none';

    if (title) title.textContent = isHidden ? 'Cerrar información' : '¿Quiénes somos?';
    if (icon) icon.textContent = isHidden ? '↑' : '👥';
    if (isHidden) {
      info.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    setTimeout(updateCarousel, 0);
});

updateFrameworkAudience(state.profile || null);

function activateResultTab(tabName) {
  const activeTab = tabName || 'sintesis';
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
    container.innerHTML = '<p class="stats-empty">Sin datos suficientes.</p>';
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

  if (elements.statVisits) elements.statVisits.textContent = formatNumber(summary.visits || summary.totalVisits);
  if (elements.statCompleted) elements.statCompleted.textContent = formatNumber(summary.completed || summary.totalCompleted);
  if (elements.statAverage) elements.statAverage.textContent = summary.averageScore != null ? Number(summary.averageScore).toFixed(1) : '—';
  if (elements.statTopLevel) elements.statTopLevel.textContent = resolveTopLevel(summary, levels);

  renderStatsBars(elements.statsLevels, levels);
  renderStatsBars(elements.statsProfiles, profiles);
  renderStatsBars(elements.statsIndicators, indicators);

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
      Las estadísticas todavía no están disponibles. Para activarlas, la API con base de datos debe publicar un endpoint de lectura con datos agregados y anónimos.
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
    const response = await fetch(CONFIG.opinionsEndpoint, { method: 'GET' });
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

if (elements.sendToolFeedbackBtn) {
  elements.sendToolFeedbackBtn.addEventListener('click', enviarValoracionHerramienta);
}

/* ========================================
   🔧 SINCRONIZACIÓN INICIAL
   ======================================== */
// Ejecutar después de que todo se cargue
document.addEventListener('DOMContentLoaded', () => {
  debugLog('Sincronizando estado inicial...');
  
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

  setTimeout(mostrarGuiaRapidaInicial, 450);
});

window.addEventListener('resize', () => {
  updateCarousel();
});
