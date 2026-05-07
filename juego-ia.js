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

  // Docente: por ahora un solo flujo
  if (profile === 'docente') {
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
  const baseProfile = state.profile; // 'docente' | 'estudiante'

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
  //    - profileBase: macro (docente / estudiante)
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
function renderQuestion() {
  const perfil = CONFIG.perfiles[state.profileKey];  // árbol efectivo
  const nodo = perfil.nodos[state.currentId];

  elements.questionNumber.textContent = state.currentQuestion;
  elements.questionTitle.textContent  = nodo.title;
  elements.questionHelp.textContent   = nodo.help;

  elements.feedbackBox.classList.add('hidden');
  elements.yesBtn.disabled  = false;
  elements.noBtn.disabled   = false;
  elements.nextBtn.disabled = true;
  elements.backBtn.disabled = state.path.length === 0;

  elements.contextBtn.onclick = () => {
    modal.show('Contexto ANEP', `
      <p><strong>Fundamentación:</strong></p>
      <p>${nodo.context}</p>
      <p style="margin-top: 1rem;"><strong>Referencia:</strong> ${nodo.anepRef}</p>
    `);
  };
}

/**
 * Construye un mensaje de feedback breve según la pregunta y la respuesta
 */
function construirFeedback(nodo, esPositiva) {
  const t = nodo.title.toLowerCase();

  if (esPositiva) {
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
    if (t.includes('verific'))      return 'Atención: necesitás verificar la información para evitar alucinaciones.';
    if (t.includes('sesg'))         return 'Atención: incorporá análisis de sesgos y estrategias de mitigación.';
    if (t.includes('autor'))        return 'Atención: declarar autoría y asistencia de IA es clave.';
    if (t.includes('valor'))        return 'Atención: explicitá el valor pedagógico de la IA.';
    if (t.includes('regla'))        return 'Atención: definí reglas claras de uso para tu curso.';
    if (t.includes('aporte') || t.includes('personal'))
      return 'Atención: incorporá aportes personales (síntesis, crítica).';
    if (t.includes('prev') || t.includes('conocimiento'))
      return 'Atención: asegurá bases conceptuales previas.';
    return 'Área de mejora identificada.';
  }
}

/**
 * Registra la respuesta del usuario y avanza al siguiente nodo
 */
function responder(esPositiva) {
  const perfil = CONFIG.perfiles[state.profileKey];
  const nodo   = perfil.nodos[state.currentId];

  // Actualizar evidencia (0–100)
  const ganancia   = esPositiva ? nodo.gainYes : nodo.gainNo;
  state.evidence   = Math.max(0, Math.min(100, state.evidence + ganancia));
  const feedback   = construirFeedback(nodo, esPositiva);

  mostrarFeedback(feedback, esPositiva);

  // Guardar paso en el "camino"
  state.path.push({
    id:       state.currentId,
    question: nodo.title,
    answer:   esPositiva,
    gain:     ganancia,
    feedback
  });

  // Siguiente nodo según respuesta
  state.currentId = esPositiva ? nodo.onYes : nodo.onNo;
  state.currentQuestion++;

  // Bloqueo de botones hasta hacer clic en "Siguiente"
  elements.yesBtn.disabled  = true;
  elements.noBtn.disabled   = true;
  elements.nextBtn.disabled = false;

  updateLikert();
  updateTimeline();
  updateProgress();
}

/**
 * Muestra el feedback inmediato debajo de la pregunta
 */
function mostrarFeedback(texto, esPositiva) {
  const tipo   = esPositiva ? 'success' : 'warning';
  const titulo = esPositiva
    ? 'Decisión alineada al uso crítico'
    : 'Área de mejora identificada';

  elements.feedbackBox.className = `feedback ${tipo}`;
  elements.feedbackBox.innerHTML = `
    <h4 style="font-weight: 700; margin-bottom: 0.5rem;">${titulo}</h4>
    <p style="color: var(--text-secondary); margin: 0;">${texto}</p>
  `;
  elements.feedbackBox.classList.remove('hidden');
}

/**
 * Botón "Siguiente": si ya no hay nodo, muestra resultados
 */
function avanzar() {
  if (!state.currentId || state.currentId === 'FIN') {
    mostrarResultados();
    return;
  }
  renderQuestion();
}

/**
 * Botón "Volver": permite retroceder un paso
 */
function retroceder() {
  if (state.path.length === 0) return;

  const ultimo = state.path.pop();
  state.evidence    = Math.max(0, state.evidence - ultimo.gain);
  state.currentId   = ultimo.id;
  state.currentQuestion--;

  renderQuestion();
  updateLikert();
  updateTimeline();
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
  );
  if (!nivel) return;

  elements.likertMarker.style.left  = `${state.evidence}%`;
  elements.likertLevel.textContent  = nivel.id;
  elements.likertLevel.style.color  = nivel.color;
}

function updateTimeline() {
  if (state.path.length === 0) {
    elements.timeline.innerHTML =
      '<p class="text-center" style="color: var(--text-muted);">Sin respuestas aún</p>';
    return;
  }

  elements.timeline.innerHTML = state.path.map((item, index) => {
    const clase = item.answer ? 'success' : 'warning';
    const badge = item.answer
      ? '<span class="badge badge-success">Sí</span>'
      : '<span class="badge badge-danger">No</span>';

    return `
      <div class="timeline-item ${clase}">
        <strong>${index + 1}.</strong> ${item.question}
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

  console.log('═══════════════════════════════════');
  console.log('🚀 ENVIANDO DATOS A BASE DE DATOS');
  console.log('📍 URL:', url);
  console.log('📦 Payload completo:');
  console.log(JSON.stringify(payload, null, 2));
  console.log('═══════════════════════════════════');

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
      console.log('✅ Datos enviados exitosamente a la base de datos:', data);
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
  );

  const payload = {
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
      answer:   step.answer ? "Sí" : "No"
    }))
  };

  // 🔍 DEBUG en consola
  console.log('═══════════════════════════════════');
  console.log('📤 PAYLOAD A ENVIAR A BASE DE DATOS');
  console.log('profile:', payload.profile);
  console.log('profileKey:', payload.profileKey);
  console.log('userName:', payload.userName);
  console.log('country:', payload.country);
  console.log('nivelEducativo:', payload.nivelEducativo);
  console.log('familiaridadInicial:', payload.familiaridadInicial);
  console.log('recursosSimilares:', payload.recursosSimilares);
  console.log('consentTracking:', payload.consentTracking);
  console.log('evidence:', payload.evidence);
  console.log('likertLevel:', payload.likertLevel);
  console.log('path length:', payload.path.length);
  console.log('═══════════════════════════════════');

  return payload;
}

/* ========================================
   RESULTADOS FINALES + ENVÍO
   - Render de la pantalla final
   - Envío condicionado por consentimiento
   ======================================== */
function mostrarResultados() {
  showScreen('result');

  const nivel = CONFIG.likert.find(
    l => state.evidence >= l.min && l.max >= state.evidence
  );
  const nombre = state.name ? `${state.name}, ` : '';

  // Cabecera de resultados
  elements.resultTitle.textContent = `Nivel: ${nivel.id}`;
  elements.resultDesc.textContent  = `${nombre}${nivel.desc}`;
  elements.resultLevel.textContent = `Tu nivel: ${nivel.id}`;
  elements.resultLevel.style.color = nivel.color;

  // Lista de acuerdos didácticos
  elements.didacticaList.innerHTML = CONFIG.acuerdos.map(acuerdo => `
    <li class="resource-card" style="margin-bottom: 0.75rem;">
      <div class="resource-content">
        <p style="margin: 0; font-weight: 600;">${acuerdo.text}</p>
        <p style="margin: 0.25rem 0 0; font-size: 0.8rem; opacity: 0.7;">
          Referencia: ${acuerdo.ref}
        </p>
      </div>
    </li>
  `).join('');

  // Lista de herramientas (si existe el contenedor)
  if (elements.toolsList) {
    elements.toolsList.innerHTML = CONFIG.herramientas.map(tool => `
      <li class="resource-card" style="margin-bottom: 0.75rem;">
        <div class="resource-content">
          <h4 style="margin: 0;">${tool.name}</h4>
          <p style="margin: 0.25rem 0 0;">${tool.desc}</p>
        </div>
      </li>
    `).join('');
  }

  // Línea de tiempo final
  if (state.path.length === 0) {
    elements.finalTimeline.innerHTML =
      '<p class="text-center" style="color: var(--text-muted);">Sin respuestas para mostrar.</p>';
    return;
  }

  const perfil = CONFIG.perfiles[state.profileKey];
  elements.finalTimeline.innerHTML = state.path.map((item, index) => {
    const nodo  = perfil.nodos[item.id];
    const clase = item.answer ? 'success' : 'warning';
    const badge = item.answer
      ? '<span class="badge badge-success">Sí</span>'
      : '<span class="badge badge-danger">No</span>';

    return `
      <div class="timeline-item ${clase}">
        <strong>${index + 1}.</strong> ${nodo.title}
        <div class="mt-1">${badge}</div>
        <p style="font-size: 0.9rem; margin: 0.25rem 0 0;">${item.feedback}</p>
        <p style="font-size: 0.85rem; margin: 0.25rem 0 0; opacity: 0.7;">
          Referencia: ${nodo.anepRef}
        </p>
      </div>
    `;
  }).join('');

  // 📤 Envío a Sheets solo si dio consentimiento
  if (state.consentTracking) {
    try {
      const payload = buildResultPayload();
      sendResultToServer(payload);
      console.log("✅ Registro enviado a base de datos:", payload);
    } catch (err) {
      console.error("❌ Error preparando registro:", err);
    }
  } else {
    console.log('ℹ️ Usuario no dio consentimiento, no se envían datos');
  }

  // Mostrar una acción clara para pedir sugerencias al Asistente Pedagógico.
  prepararSugerenciasDeMejoraEnChatbot();
}

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
    
    const respuestasNo = state.path.filter(p => !p.answer);
    const areas = respuestasNo.length
      ? respuestasNo.map((p, index) => `${index + 1}. ${p.question} (${p.feedback})`).join('\n')
      : 'No hay respuestas marcadas como "No"; sugerí formas de consolidar y profundizar las prácticas ya alineadas.';
    
    return `Acabo de completar el recorrido y obtuve nivel "${nivel.id}" con ${state.evidence} puntos. Estas son mis áreas de mejora detectadas:
${areas}

Con base en los marcos UNESCO, ANEP y FING, mostrame 3 sugerencias de mejora priorizadas, concretas y aplicables para mi perfil (${state.profileBase || state.profile}, ${state.nivelEducativo || 'nivel no indicado'}).`;
  } catch (err) {
    console.error('❌ Error generando mensaje automático:', err);
    return '';
  }
}

/* ========================================
   EVENT LISTENERS DEL JUEGO
   ======================================== */
if (elements.yesBtn)   elements.yesBtn.addEventListener('click', () => responder(true));
if (elements.noBtn)    elements.noBtn.addEventListener('click', () => responder(false));
if (elements.nextBtn)  elements.nextBtn.addEventListener('click', avanzar);
if (elements.backBtn)  elements.backBtn.addEventListener('click', retroceder);
if (elements.startBtn) elements.startBtn.addEventListener('click', iniciarJuego);
