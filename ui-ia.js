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
  playerName: document.getElementById('playerName'),
  startBtn: document.getElementById('startBtn'),
  infoBtn: document.getElementById('infoBtn'),

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
  recursosSimilaresRadios: document.querySelectorAll('input[name="recursosSimilares"]'),
  
  // Juego
  progressFill: document.getElementById('progressFill'),
  progressText: document.getElementById('progressText'),
  questionNumber: document.getElementById('questionNumber'),
  questionTitle: document.getElementById('questionTitle'),
  questionHelp: document.getElementById('questionHelp'),
  yesBtn: document.getElementById('yesBtn'),
  noBtn: document.getElementById('noBtn'),
  contextBtn: document.getElementById('contextBtn'),
  feedbackBox: document.getElementById('feedbackBox'),
  nextBtn: document.getElementById('nextBtn'),
  backBtn: document.getElementById('backBtn'),
  timeline: document.getElementById('timeline'),
  likertMarker: document.getElementById('likertMarker'),
  likertLevel: document.getElementById('likertLevel'),
  
  // Resultado
  resultTitle: document.getElementById('resultTitle'),
  resultDesc: document.getElementById('resultDesc'),
  resultLevel: document.getElementById('resultLevel'),
  didacticaList: document.getElementById('didacticaList'),
  toolsList: document.getElementById('toolsList'),
  finalTimeline: document.getElementById('finalTimeline'),
  downloadBtn: document.getElementById('downloadBtn'),
  emailReportBtn: document.getElementById('emailReportBtn'),
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
  currentSource = source;

  const data = PRINCIPLES_CONTENT[principleId];
  elements.tooltipTitle.textContent = data.title;

  elements.tooltipTabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.source === source);
  });

  elements.tooltipBody.innerHTML = data[source];
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
  elements.consentTracking.addEventListener('change', () => {
    if (window.state) {
      window.state.consentTracking = elements.consentTracking.checked;
    }
    // 🔧 AGREGADO: Validar botón cuando cambia el consentimiento
    updateStartButtonState();
  });

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
  if (state.currentSlide === 1) {
    elements.nextSlide.classList.add('hidden');
    elements.startBtn.classList.remove('hidden');
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
    }
  });
}
if (elements.nextSlide) {
  elements.nextSlide.addEventListener('click', () => { 
    // ✅ CORREGIDO: Máximo slide es 1 (antes era 2)
    if (state.currentSlide < 1) { 
      state.currentSlide++; 
      updateCarousel(); 
    }
  });
}
if (elements.carouselDots && elements.carouselDots.length) {
  elements.carouselDots.forEach((dot, index) => 
    dot.addEventListener('click', () => { 
      state.currentSlide = index; 
      updateCarousel(); 
    })
  );
}

const goToDiagnosticBtn = document.getElementById('goToDiagnosticBtn');
if (goToDiagnosticBtn) {
  goToDiagnosticBtn.addEventListener('click', (event) => {
    event.preventDefault();
    state.currentSlide = 1;
    updateCarousel();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ========================================
   🔧 HABILITAR / DESHABILITAR BOTÓN INICIO (CORREGIDO)
   ======================================== */
/* ========================================
   🔧 HABILITAR / DESHABILITAR BOTÓN INICIO (RECTIFICADA)
   ======================================== */
function updateStartButtonState() {
  if (!elements.startBtn) return;

  console.log('=== 🔍 DEBUG: Validando formulario ===');

  // 1) Perfil elegido
  const perfilOk = !!state.profile;
  console.log('✓ Perfil OK:', perfilOk, '| Valor:', state.profile);

  // 2) Nivel educativo (OBLIGATORIO solo para docente/estudiante)
  let nivelOk = true;
  if (state.profile === 'docente' || state.profile === 'estudiante') {
    if (elements.nivelEducativo) {
      nivelOk = elements.nivelEducativo.value.trim() !== '';
      console.log('✓ Nivel OK:', nivelOk, '| Valor:', elements.nivelEducativo.value);
    }
  } else {
    console.log('✓ Nivel OK: true (no requerido para este perfil)');
  }

  // 3) Familiaridad
  let famOk = true;
  if (elements.familiaridadInicial) {
    famOk = elements.familiaridadInicial.value.trim() !== '';
    console.log('✓ Familiaridad OK:', famOk, '| Valor:', elements.familiaridadInicial.value);
  }

  // 4) Recursos similares
  let recursosOk = true;
  if (elements.recursosSimilaresRadios && elements.recursosSimilaresRadios.length) {
    recursosOk = Array.from(elements.recursosSimilaresRadios).some(r => r.checked);
    console.log('✓ Recursos OK:', recursosOk);
  }

  // 5) Consentimiento (OBLIGATORIO)
  let consentOk = true;
  if (elements.consentTracking) {
    consentOk = elements.consentTracking.checked;
    console.log('✓ Consentimiento OK:', consentOk);
  }

  // 🔑 Lógica de Habilitación y Visibilidad
  const todasOk = perfilOk && nivelOk && famOk && recursosOk && consentOk;
  const nextSlideBtn = document.getElementById('nextSlide');

  console.log('━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 RESULTADO:', todasOk ? '✅ TODAS OK' : '❌ FALTAN CAMPOS');
  
if (todasOk) {
  elements.startBtn.disabled = false;
  elements.startBtn.classList.remove('hidden');
  elements.startBtn.classList.add('enabled');

  if (nextSlideBtn) nextSlideBtn.classList.add('hidden');

  console.log('🎯 Botón Inicio: MOSTRADO, VERDE Y HABILITADO');
} else {
  elements.startBtn.disabled = true;
  elements.startBtn.classList.add('hidden');
  elements.startBtn.classList.remove('enabled');

  if (nextSlideBtn) nextSlideBtn.classList.remove('hidden');

  console.log('🎯 Botón Inicio: OCULTO Y DESHABILITADO');
}
  console.log('━━━━━━━━━━━━━━━━━━━━━━\n');
}

/* ========================================
   🆕 SELECCIÓN DE PERFIL (ACTUALIZADO)
   ======================================== */
elements.chips.forEach(chip => {
  chip.addEventListener('click', () => {
    console.log('🔵 Click en chip:', chip.dataset.profile);
    
    elements.chips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');

    const perfil = chip.dataset.profile;

    // ✅ Actualizar state
    if (window.state) {
      window.state.profile = perfil;
      console.log('✅ State actualizado - Perfil:', window.state.profile);
    } else {
      console.error('❌ window.state no existe!');
    }

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
    console.log('🔵 Familiaridad cambió:', e.target.value);
    if (window.state) {
      window.state.familiaridadInicial = e.target.value || '';
      console.log('✅ State actualizado - Familiaridad:', window.state.familiaridadInicial);
    }
    updateStartButtonState();
  });
}

// Cambios en recursos similares
if (elements.recursosSimilaresRadios && elements.recursosSimilaresRadios.length) {
  elements.recursosSimilaresRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      console.log('🔵 Recursos cambió:', e.target.value);
      if (e.target.checked && window.state) {
        window.state.recursosSimilares = e.target.value;
        console.log('✅ State actualizado - Recursos:', window.state.recursosSimilares);
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
    modal.show('Marco ANEP sobre IA en Educación', `
      <p>Este cuestionario está basado en documentos oficiales de UNESCO y ANEP sobre el uso de IAG contextualizado a la Educación.</p>
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
  Object.values(screens).forEach(screen => {
    if (screen) screen.classList.add('hidden');
  });
  if (screens[screenName]) {
    screens[screenName].classList.remove('hidden');
    screens[screenName].classList.add('fade-in');
  }

  // --- 🆕 LÓGICA DE ASISTENCIA PROACTIVA ---
  if (screenName === 'result') {
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
            state.consentTracking = true;

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
            if (elements.consentTracking) elements.consentTracking.checked = true;

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
document.getElementById('btnVerAutores').addEventListener('click', function() {
    const info = document.getElementById('infoAutores');
    const title = this.querySelector('.btn-academic-title');
    const icon = this.querySelector('.btn-academic-icon');
    const isHidden = info.style.display === 'none';

    info.style.display = isHidden ? 'block' : 'none';

    if (title) title.textContent = isHidden ? 'Cerrar información' : '¿Quiénes somos?';
    if (icon) icon.textContent = isHidden ? '↑' : '👥';
    setTimeout(updateCarousel, 0);
});


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

function renderStatsBars(container, rows) {
  if (!container) return;
  const normalized = normalizeStatsCollection(rows)
    .filter(row => row && row.label)
    .map(row => ({
      label: row.label,
      count: Number(row.count || row.value || 0)
    }));

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
          <span>${row.label}</span>
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
  if (elements.statVisits) elements.statVisits.textContent = formatNumber(summary.visits || summary.totalVisits);
  if (elements.statCompleted) elements.statCompleted.textContent = formatNumber(summary.completed || summary.totalCompleted);
  if (elements.statAverage) elements.statAverage.textContent = summary.averageScore != null ? Number(summary.averageScore).toFixed(1) : '—';
  if (elements.statTopLevel) elements.statTopLevel.textContent = summary.topLevel || '—';

  renderStatsBars(elements.statsLevels, data.levels || data.byLevel);
  renderStatsBars(elements.statsProfiles, data.profiles || data.byProfile);
  renderStatsBars(elements.statsIndicators, data.indicators || data.weakIndicators);

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
    nivelEducativo: state.nivelEducativo || ''
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
  console.log('🔄 Sincronizando estado inicial...');
  
  // Sincronizar perfil si hay un chip activo
  const activeChip = document.querySelector('.chip.active');
  if (activeChip && window.state) {
    const perfil = activeChip.dataset.profile;
    window.state.profile = perfil;
    console.log('✅ Perfil inicial sincronizado:', perfil);
    
    // Mostrar nivel educativo si corresponde
    if (perfil === 'docente' || perfil === 'estudiante') {
      updateNivelEducativo(perfil);
    }
  }
  
  // Sincronizar familiaridad inicial
  if (elements.familiaridadInicial && window.state) {
    window.state.familiaridadInicial = elements.familiaridadInicial.value || '';
    console.log('✅ Familiaridad inicial:', window.state.familiaridadInicial);
  }
  
  // Sincronizar recursos similares inicial
  if (elements.recursosSimilaresRadios && window.state) {
    const checkedRadio = Array.from(elements.recursosSimilaresRadios).find(r => r.checked);
    if (checkedRadio) {
      window.state.recursosSimilares = checkedRadio.value;
      console.log('✅ Recursos inicial:', window.state.recursosSimilares);
    }
  }
  
  // Sincronizar consentimiento inicial
  if (elements.consentTracking && window.state) {
    window.state.consentTracking = elements.consentTracking.checked;
    console.log('✅ Consentimiento inicial:', window.state.consentTracking);
  }
  
  // Validar estado del botón
  setTimeout(() => {
    console.log('🔍 Validando estado inicial del botón...');
    updateStartButtonState();
  }, 100);

  const afterVisit = typeof sendVisitToServer === 'function'
    ? Promise.resolve(sendVisitToServer())
    : Promise.resolve(false);

  afterVisit.finally(cargarEstadisticasAnonimas);
  cargarOpinionesAnonimas();

  setTimeout(mostrarGuiaRapidaInicial, 450);
});

window.addEventListener('resize', () => {
  updateCarousel();
});
