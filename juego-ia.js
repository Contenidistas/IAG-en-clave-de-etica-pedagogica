/* ========================================
   UTILIDAD: Normalizar preguntas
   ======================================== */
function normalizarPreguntasDelPerfil(perfilKey) {
  const nodos = CONFIG.perfiles[perfilKey].nodos;
  Object.values(nodos).forEach(n => {
    if (typeof n.title === 'string' && n.title.trim().endsWith('?') && !n.title.trim().startsWith('¿')) {
      n.title = '¿' + n.title.trim();
    }
  });
}



/* ========================================
   RESOLVER PROFILE KEY SEGÚN PERFIL + NIVEL
   ======================================== */
function resolverProfileKey(profile, nivelEducativo) {
  if (!profile) return null;
  const nivel = (nivelEducativo || '').toLowerCase();

  // Docente: un solo flujo por ahora
  if (profile === 'docente') {
    return 'docente';
  }

  // Estudiantes: segmentamos por nivel
  if (profile === 'estudiante') {
    // Si no hay nivel elegido, usamos el genérico
    if (!nivel) return 'estudiante';

    if (nivel.includes('media')) {
      // Media básica o superior → mismo segmento
      return 'estudiante_media';
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

  // Fallback por si en el futuro hay otros perfiles base
  return profile;
}







/* ========================================
   LÓGICA DEL JUEGO
   ======================================== */
function iniciarJuego() {
  // 🔑 Resolver qué árbol de perfil vamos a usar
  const profileKey = resolverProfileKey(state.profile, state.nivelEducativo);

  if (!profileKey || !CONFIG.perfiles[profileKey]) {
    console.error('❌ No se pudo resolver un perfil válido', {
      profileBase: state.profile,
      nivelEducativo: state.nivelEducativo,
      profileKey
    });
    return;
  }

  // A partir de acá, el juego trabaja SIEMPRE con el perfil efectivo
  state.profile = profileKey;

  // Leer consentimiento (opt-out)
  state.consentTracking = elements.consentTracking 
    ? elements.consentTracking.checked 
    : false;

  // País final (Uruguay por defecto)
  const countryVal = elements.countryFinalInput
    ? (elements.countryFinalInput.value || 'Uruguay')
    : 'Uruguay';

  // Nivel de familiaridad (si el select existe)
  const familiaridadVal = elements.familiaridadInicial
    ? (elements.familiaridadInicial.value || '')
    : '';

  // Uso de recursos similares (si los radios existen)
  let recursosVal = '';
  if (elements.recursosSimilaresRadios && elements.recursosSimilaresRadios.length) {
    const elegido = Array.from(elements.recursosSimilaresRadios)
      .find(r => r.checked);
    recursosVal = elegido ? elegido.value : '';
  }

  // Guardar en el estado
  state.country = countryVal;
  state.familiaridadInicial = familiaridadVal;
  state.recursosSimilares = recursosVal;

  // Normalizar signos de interrogación en el perfil elegido
  if (typeof normalizarPreguntasDelPerfil === 'function') {
    normalizarPreguntasDelPerfil(state.profile);
  }

  // Preparar estado de recorrido
  state.name = elements.playerName ? elements.playerName.value.trim() : '';
  const perfil = CONFIG.perfiles[state.profile];
  state.currentId = perfil.inicio;
  state.path = [];
  state.evidence = 0;

  // Calcular total de preguntas (excluye FIN)
  state.totalQuestions = Object.keys(perfil.nodos).filter(k => k !== 'FIN').length;
  state.currentQuestion = 1;

  // Cambiar pantalla
  showScreen('game');

  // Render inicial
  renderQuestion();
  updateProgress();
  updateLikert();
  updateTimeline();
}





/* ========================================
   RENDER Y RESPUESTAS
   ======================================== */
function renderQuestion() {
  const perfil = CONFIG.perfiles[state.profileKey || state.profile];

  const nodo = perfil.nodos[state.currentId];
  
  elements.questionNumber.textContent = state.currentQuestion;
  elements.questionTitle.textContent = nodo.title;
  elements.questionHelp.textContent = nodo.help;
  
  elements.feedbackBox.classList.add('hidden');
  elements.yesBtn.disabled = false;
  elements.noBtn.disabled = false;
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

function construirFeedback(nodo, esPositiva) {
  const t = nodo.title.toLowerCase();
  if (esPositiva) {
    if (t.includes('verific')) return 'Excelente: verificás la información antes de usarla.';
    if (t.includes('sesg'))    return 'Muy bien: reconocés sesgos y trabajás para mitigarlos.';
    if (t.includes('autor'))   return 'Correcto: declarás autoría y asistencia de IA.';
    if (t.includes('valor'))   return 'Bien: explicitás el valor pedagógico de la IA.';
    if (t.includes('regla'))   return 'Perfecto: establecés reglas claras de uso.';
    if (t.includes('aporte') || t.includes('personal')) return 'Sumás valor humano: análisis, síntesis y contexto.';
    if (t.includes('prev') || t.includes('conocimiento')) return 'Correcto: partís de bases conceptuales.';
    return 'Decisión alineada al uso crítico de la IA.';
  } else {
    if (t.includes('verific')) return 'Atención: necesitás verificar la información para evitar alucinaciones.';
    if (t.includes('sesg'))    return 'Atención: incorporá análisis de sesgos y estrategias de mitigación.';
    if (t.includes('autor'))   return 'Atención: declarar autoría y asistencia de IA es clave.';
    if (t.includes('valor'))   return 'Atención: explicitá el valor pedagógico de la IA.';
    if (t.includes('regla'))   return 'Atención: definí reglas claras de uso para tu curso.';
    if (t.includes('aporte') || t.includes('personal')) return 'Atención: incorporá aportes personales (síntesis, crítica).';
    if (t.includes('prev') || t.includes('conocimiento')) return 'Atención: asegurá bases conceptuales previas.';
    return 'Área de mejora identificada.';
  }
}

function responder(esPositiva) {
  // const perfil = CONFIG.perfiles[state.profile];
  const perfil = CONFIG.perfiles[state.profileKey || state.profile];

  const nodo = perfil.nodos[state.currentId];
  
  const ganancia = esPositiva ? nodo.gainYes : nodo.gainNo;
  state.evidence = Math.max(0, Math.min(100, state.evidence + ganancia));
  
  const feedback = construirFeedback(nodo, esPositiva);
  mostrarFeedback(feedback, esPositiva);
  
  state.path.push({
    id: state.currentId,
    question: nodo.title,
    answer: esPositiva,
    gain: ganancia,
    feedback
  });
  
  state.currentId = esPositiva ? nodo.onYes : nodo.onNo;
  state.currentQuestion++;
  
  elements.yesBtn.disabled = true;
  elements.noBtn.disabled = true;
  elements.nextBtn.disabled = false;
  
  updateLikert();
  updateTimeline();
  updateProgress();
}

function mostrarFeedback(texto, esPositiva) {
  const tipo = esPositiva ? 'success' : 'warning';
  const titulo = esPositiva ? 'Decisión alineada al uso crítico' : 'Área de mejora identificada';
  elements.feedbackBox.className = `feedback ${tipo}`;
  elements.feedbackBox.innerHTML = `
    <h4 style="font-weight: 700; margin-bottom: 0.5rem;">${titulo}</h4>
    <p style="color: var(--text-secondary); margin: 0;">${texto}</p>
  `;
  elements.feedbackBox.classList.remove('hidden');
}

function avanzar() {
  if (!state.currentId || state.currentId === 'FIN') {
    mostrarResultados();
    return;
  }
  renderQuestion();
}

function retroceder() {
  if (state.path.length === 0) return;
  const ultimo = state.path.pop();
  state.evidence = Math.max(0, state.evidence - ultimo.gain);
  state.currentId = ultimo.id;
  state.currentQuestion--;
  renderQuestion();
  updateLikert();
  updateTimeline();
  updateProgress();
}

/* ========================================
   ACTUALIZACIONES VISUALES
   ======================================== */
function updateProgress() {
  const porcentaje = ((state.currentQuestion - 1) / state.totalQuestions) * 100;
  elements.progressFill.style.width = `${porcentaje}%`;
  elements.progressText.textContent = `Pregunta ${state.currentQuestion} de ${state.totalQuestions}`;
}

function updateLikert() {
  const nivel = CONFIG.likert.find(l => state.evidence >= l.min && l.max >= state.evidence);
  if (!nivel) return;
  elements.likertMarker.style.left = `${state.evidence}%`;
  elements.likertLevel.textContent = nivel.id;
  elements.likertLevel.style.color = nivel.color;
}

function updateTimeline() {
  if (state.path.length === 0) {
    elements.timeline.innerHTML = '<p class="text-center" style="color: var(--text-muted);">Sin respuestas aún</p>';
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
 * Envía los datos del cuestionario completado a Google Sheets
 * @param {Object} payload - Objeto con todos los datos del usuario y respuestas
 */
function sendResultToServer(payload) {
  // 📌 URL de tu Google Apps Script (implementación)
  const url = "https://script.google.com/macros/s/AKfycbwaYbC5ebLgVjexSkxhgYR6Gvqr8Tcq6drUsl6DXL_OKl2eHLeATMaBMUzV4G3YyG9j/exec";
  
  console.log('═══════════════════════════════════');
  console.log('🚀 ENVIANDO DATOS A GOOGLE SHEETS');
  console.log('═══════════════════════════════════');
  console.log('📍 URL:', url);
  console.log('📦 Payload completo:');
  console.log(JSON.stringify(payload, null, 2));
  console.log('═══════════════════════════════════');
  
  // Enviar con fetch
  fetch(url, {
    method: "POST",
    mode: "no-cors", // Necesario para Google Apps Script
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  })
  .then(() => {
    console.log('✅ Datos enviados exitosamente a Google Sheets');
    console.log('📊 Revisa tu spreadsheet para ver los datos');
  })
  .catch(err => {
    console.error("❌ Error al enviar datos:", err);
    console.error("Detalles del error:", err.message);
  });
}
function buildResultPayload() {
  const nivel = CONFIG.likert.find(
    l => state.evidence >= l.min && l.max >= state.evidence
  );

  console.log('═══════════════════════════════════');
  console.log('📤 CONSTRUYENDO PAYLOAD');
  console.log('═══════════════════════════════════');
  console.log('profile:', state.profile);
  console.log('profileKey:', state.profileKey);
  console.log('userName:', state.name || null);
  console.log('country:', state.country);
  console.log('nivelEducativo:', state.nivelEducativo);
  console.log('familiaridadInicial:', state.familiaridadInicial);
  console.log('recursosSimilares:', state.recursosSimilares);
  console.log('consentTracking:', state.consentTracking);
  console.log('evidence:', state.evidence);
  console.log('likertLevel:', nivel?.id);
  console.log('path length:', state.path.length);
  console.log('═══════════════════════════════════');

  const payload = {
    timestamp: new Date().toISOString(),
    profile: state.profile,                       // docente | estudiante (macro)
    profileKey: state.profileKey || null,         // segmento real usado en el juego
    userName: state.name || null,
    country: state.country,
    nivelEducativo: state.nivelEducativo || null,
    familiaridadInicial: state.familiaridadInicial,
    recursosSimilares: state.recursosSimilares,
    consentTracking: state.consentTracking,
    evidence: state.evidence,
    likertLevel: nivel?.id || null,
    path: state.path.map(step => ({
      id: step.id,
      question: step.question,
      answer: step.answer ? "Sí" : "No"
    }))
  };

  return payload;
}


/* ========================================
   RESULTADOS FINALES + ENVÍO
   ======================================== */

   /*
function mostrarResultados() {
  showScreen('result');
  
  const nivel = CONFIG.likert.find(l => state.evidence >= l.min && l.max >= state.evidence);
  const nombre = state.name ? `${state.name}, ` : '';
  
  elements.resultTitle.textContent = `Nivel: ${nivel.id}`;
  elements.resultDesc.textContent = `${nombre}${nivel.desc}`;
  elements.resultLevel.textContent = `Tu nivel: ${nivel.id}`;
  elements.resultLevel.style.color = nivel.color;
  
  elements.didacticaList.innerHTML = CONFIG.acuerdos.map(acuerdo => `
    <li class="resource-card" style="margin-bottom: 0.75rem;">
      <div class="resource-content">
        <p style="margin: 0; font-weight: 600;">${acuerdo.text}</p>
        <p style="margin: 0.25rem 0 0; font-size: 0.8rem; opacity: 0.7;">Referencia: ${acuerdo.ref}</p>
      </div>
    </li>
  `).join('');

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
  
  if (state.path.length === 0) {
    elements.finalTimeline.innerHTML = '<p class="text-center" style="color: var(--text-muted);">Sin respuestas para mostrar.</p>';
    return;
  }

  //const perfil = CONFIG.perfiles[state.profile];
  const perfil = CONFIG.perfiles[state.profileKey || state.profile];

  elements.finalTimeline.innerHTML = state.path.map((item, index) => {
    const nodo = perfil.nodos[item.id];
    const clase = item.answer ? 'success' : 'warning';
    const badge = item.answer 
      ? '<span class="badge badge-success">Sí</span>'
      : '<span class="badge badge-danger">No</span>';
    return `
      <div class="timeline-item ${clase}">
        <strong>${index + 1}.</strong> ${nodo.title}
        <div class="mt-1">${badge}</div>
        <p style="font-size: 0.9rem; margin: 0.25rem 0 0;">${item.feedback}</p>
        <p style="font-size: 0.85rem; margin: 0.25rem 0 0; opacity: 0.7;">Referencia: ${nodo.anepRef}</p>
      </div>
    `;
  }).join('');

  // 📤 ENVÍO DE DATOS (solo si dio consentimiento)
  if (state.consentTracking) {
    try {
      const payload = buildResultPayload();
      sendResultToServer(payload);
      console.log("✅ Registro enviado correctamente");
    } catch (err) {
      console.error("❌ Error preparando registro:", err);
    }
  } else {
    console.log('ℹ️ Usuario no dio consentimiento, no se envían datos');
  }
}

*/




/* ========================================
   RESULTADOS FINALES + ENVÍO
   ======================================== */
function mostrarResultados() {
  showScreen('result');
  
  const nivel = CONFIG.likert.find(l => state.evidence >= l.min && l.max >= state.evidence);
  const nombre = state.name ? `${state.name}, ` : '';
  
  elements.resultTitle.textContent = `Nivel: ${nivel.id}`;
  elements.resultDesc.textContent = `${nombre}${nivel.desc}`;
  elements.resultLevel.textContent = `Tu nivel: ${nivel.id}`;
  elements.resultLevel.style.color = nivel.color;
  
  elements.didacticaList.innerHTML = CONFIG.acuerdos.map(acuerdo => `
    <li class="resource-card" style="margin-bottom: 0.75rem;">
      <div class="resource-content">
        <p style="margin: 0; font-weight: 600;">${acuerdo.text}</p>
        <p style="margin: 0.25rem 0 0; font-size: 0.8rem; opacity: 0.7;">Referencia: ${acuerdo.ref}</p>
      </div>
    </li>
  `).join('');

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
  
  if (state.path.length === 0) {
    elements.finalTimeline.innerHTML = '<p class="text-center" style="color: var(--text-muted);">Sin respuestas para mostrar.</p>';
    return;
  }

  const perfil = CONFIG.perfiles[state.profile];
  elements.finalTimeline.innerHTML = state.path.map((item, index) => {
    const nodo = perfil.nodos[item.id];
    const clase = item.answer ? 'success' : 'warning';
    const badge = item.answer 
      ? '<span class="badge badge-success">Sí</span>'
      : '<span class="badge badge-danger">No</span>';
    return `
      <div class="timeline-item ${clase}">
        <strong>${index + 1}.</strong> ${nodo.title}
        <div class="mt-1">${badge}</div>
        <p style="font-size: 0.9rem; margin: 0.25rem 0 0;">${item.feedback}</p>
        <p style="font-size: 0.85rem; margin: 0.25rem 0 0; opacity: 0.7;">Referencia: ${nodo.anepRef}</p>
      </div>
    `;
  }).join('');

  if (state.consentTracking) {
    try {
      const payload = buildResultPayload();
      sendResultToServer(payload);
      console.log("Registro enviado:", payload);
    } catch (err) {
      console.error("Error preparando registro:", err);
    }
  }
}

function buildResultPayload() {
  const nivel = CONFIG.likert.find(
    l => state.evidence >= l.min && l.max >= state.evidence
  );

  const payload = {
    timestamp: new Date().toISOString(),
    profile: state.profile,                           // ✅
    userName: state.name || null,                     // ✅
    country: state.country,                           // ❓ ¿Está aquí?
    nivelEducativo: state.nivelEducativo || null,     // ❓ ¿Está aquí?
    familiaridadInicial: state.familiaridadInicial,   // ❓ ¿Está aquí?
    recursosSimilares: state.recursosSimilares,       // ❓ ¿Está aquí?
    consentTracking: state.consentTracking,           // ❓ ¿Está aquí?
    evidence: state.evidence,
    likertLevel: nivel?.id || null,
    path: state.path.map(step => ({
      id: step.id,
      question: step.question,
      answer: step.answer ? "Sí" : "No"
    }))
  };

  // 🔍 DEBUG: Ver qué se envía
  console.log('═══════════════════════════════════');
  console.log('📤 PAYLOAD A ENVIAR:');
  console.log('═══════════════════════════════════');
  console.log('profile:', payload.profile);
  console.log('userName:', payload.userName);
  console.log('country:', payload.country);
  console.log('nivelEducativo:', payload.nivelEducativo);
  console.log('familiaridadInicial:', payload.familiaridadInicial);
  console.log('recursosSimilares:', payload.recursosSimilares);
  console.log('consentTracking:', payload.consentTracking);
  console.log('═══════════════════════════════════');

  return payload;
}


/* ========================================
   EVENT LISTENERS DEL JUEGO
   ======================================== */
if (elements.yesBtn) elements.yesBtn.addEventListener('click', () => responder(true));
if (elements.noBtn) elements.noBtn.addEventListener('click', () => responder(false));
if (elements.nextBtn) elements.nextBtn.addEventListener('click', avanzar);
if (elements.backBtn) elements.backBtn.addEventListener('click', retroceder);
if (elements.startBtn) elements.startBtn.addEventListener('click', iniciarJuego);
