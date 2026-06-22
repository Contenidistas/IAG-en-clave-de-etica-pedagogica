/* ========================================
   GENERADOR DE PDF (jsPDF)
   ======================================== */
let jsPDFLoaded = false;

function cargarJsPDF() {
  return new Promise((resolve, reject) => {
    if (jsPDFLoaded || (window.jspdf && window.jspdf.jsPDF)) {
      jsPDFLoaded = true;
      return resolve();
    }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    s.onload = () => { jsPDFLoaded = true; resolve(); };
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

function agregarTextoMultilinea(doc, texto, x, y, maxWidth, lineHeight) {
  const split = doc.splitTextToSize(texto, maxWidth);
  split.forEach(line => {
    doc.text(line, x, y);
    y += lineHeight;
    if (y > 280) { doc.addPage(); y = 20; }
  });
  return y;
}

function obtenerNombreApp() {
  const titulo = document.querySelector('.home-btn span');
  return titulo ? titulo.textContent.replace('🏠', '').trim() : 'IAG en clave de ética pedagógica';
}

function obtenerNombreParticipante() {
  const nombreEstado = state.name ? state.name.trim() : '';
  const nombreInput = elements.playerName ? elements.playerName.value.trim() : '';
  return nombreEstado || nombreInput || 'No indicado';
}

function obtenerPerfilReporte() {
  const base = state.profileBase || state.profile;
  const perfiles = {
    docente: 'Docente',
    estudiante: 'Estudiante',
    especializado: 'Docente/investigador/a en IA educativa'
  };
  const perfilBase = perfiles[base] || 'Participante';
  return state.nivelEducativo ? `${perfilBase} - ${state.nivelEducativo}` : perfilBase;
}

function construirRetroalimentacionMarco(nodo, respuesta) {
  const respuestaTexto = respuesta ? 'La respuesta afirmativa muestra una práctica alineada con los marcos de referencia.' : 'La respuesta negativa señala una oportunidad concreta de mejora y formación.';
  const referencia = nodo.anepRef || 'ANEP / UNESCO / FING / Udelar / Ceibal';
  const titulo = (nodo.title || '').toLowerCase();
  let foco = 'conviene documentar el proceso, contrastar la información generada por IA con fuentes confiables y explicitar qué parte del trabajo corresponde a criterio humano';

  if (titulo.includes('verific') || titulo.includes('contrast')) {
    foco = 'es importante contrastar la respuesta de la IA con bibliografía, documentos institucionales o fuentes confiables, evitando tomar la salida generada como verdad suficiente';
  } else if (titulo.includes('autor') || titulo.includes('cit') || titulo.includes('asistencia')) {
    foco = 'la transparencia exige declarar cuándo intervino la IA, qué herramienta se usó y cuál fue el aporte humano en la producción final';
  } else if (titulo.includes('sesg') || titulo.includes('divers') || titulo.includes('contexto')) {
    foco = 'la revisión crítica debe atender sesgos, omisiones culturales, exclusiones y desajustes con el contexto real del grupo o de la tarea';
  } else if (titulo.includes('regla') || titulo.includes('límite') || titulo.includes('permitido')) {
    foco = 'los acuerdos previos sobre usos permitidos, límites, documentación y criterios de evaluación reducen ambigüedades y fortalecen la confianza pedagógica';
  } else if (titulo.includes('aporte') || titulo.includes('personal') || titulo.includes('original')) {
    foco = 'el valor educativo aparece cuando la IA no sustituye el pensamiento propio, sino que ayuda a elaborar, revisar, comparar o ampliar una producción con autoría humana reconocible';
  } else if (titulo.includes('prompt') || titulo.includes('proceso') || titulo.includes('decisiones')) {
    foco = 'FING enfatiza la importancia de registrar prompts, decisiones y validaciones para que el proceso pueda ser explicado y evaluado, no solo el resultado final';
  } else if (titulo.includes('previo') || titulo.includes('base') || titulo.includes('fundamento')) {
    foco = 'antes de delegar tareas en la IA, conviene asegurar comprensión conceptual suficiente para evaluar la calidad, pertinencia y límites de la respuesta generada';
  }

  return `${respuestaTexto} Desde ANEP, UNESCO, FING, Udelar y Ceibal, este punto debe leerse en clave de responsabilidad pedagógica: ${foco}. Referencia vinculada: ${referencia}.`;
}

function construirSintesisMarco(nivel) {
  return `El resultado debe interpretarse como un punto de partida para la reflexión, no como una calificación cerrada. Desde UNESCO, el uso de IA en educación requiere transparencia, agencia humana, equidad y revisión crítica de posibles sesgos. Desde ANEP, implica formar ciudadanía digital, promover pensamiento crítico y evitar usos acríticos o indiscriminados. Desde FING, se refuerza la necesidad de definir restricciones claras por tarea, documentar prompts y decisiones, preservar la originalidad y poder explicar el proceso de trabajo. Desde Udelar, se incorporan principios recientes para leer la IAG como práctica académica responsable, trazable y situada. Desde Ceibal, se suma una mirada ética sobre IA para la educación, ciudadanía digital e inclusión. En este recorrido, el nivel "${nivel.id}" orienta qué acuerdos conviene fortalecer para sostener un uso ético, crítico y reflexivo de la IAG.`;
}

function obtenerTextoAcuerdoDidactico() {
  if (typeof window.obtenerAcuerdoDidacticoActual === 'function') {
    return window.obtenerAcuerdoDidacticoActual();
  }
  return state.generatedAgreementText || '';
}

function respuestaEsAlineada(item) {
  return item.answerKey === 'yes';
}

function obtenerInformeCalidadReporte(nivel) {
  if (typeof window.getQualityReportData === 'function') {
    return window.getQualityReportData();
  }
  return {
    level: nivel.id,
    evidence: state.evidence,
    focus: 'Transparencia y verificación',
    executiveSummary: construirSintesisMarco(nivel),
    strengths: ['Prácticas alineadas detectadas en el recorrido.'],
    risks: ['Criterios a fortalecer según respuestas del recorrido.'],
    actions: ['Definir acuerdos explícitos de uso, declaración y verificación.'],
    rubric: ['Declaración de uso de IA.', 'Verificación de fuentes.', 'Aporte humano.', 'Cuidado de datos.'],
    references: 'ANEP, UNESCO, FING, Udelar y Ceibal'
  };
}

function agregarListaReporte(doc, titulo, items, x, y) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(33, 33, 33);
  doc.text(titulo, x, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(55, 55, 55);
  (items || []).forEach((item, index) => {
    y = agregarTextoMultilinea(doc, `${index + 1}. ${item}`, x, y, 180, 5.5);
    y += 1;
  });
  return y + 3;
}

/* ========================================
   ACCIONES FINALES
   ======================================== */
if (elements.downloadBtn) {
  elements.downloadBtn.addEventListener('click', async () => {
    const nivel = CONFIG.likert.find(l => state.evidence >= l.min && l.max >= state.evidence);
    const fecha = new Date().toLocaleDateString('es-UY');
    const appName = obtenerNombreApp();
    const nombre = obtenerNombreParticipante();
    const perfilHumano = obtenerPerfilReporte();
    const perfil = CONFIG.perfiles[state.profileKey || state.profile];

    try {
      await cargarJsPDF();
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });

      // Portada
      doc.setFillColor(99, 102, 241);
      doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text(appName, 15, 20);
      doc.setFontSize(12);
      doc.text('Reporte de reflexión ética, crítica y pedagógica sobre IAG', 15, 28);

      // Datos principales
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      let y = 55;
      doc.text(`Participante: ${nombre}`, 15, y); y += 8;
      doc.text(`Perfil: ${perfilHumano}`, 15, y); y += 8;
      doc.text(`Fecha: ${fecha}`, 15, y); y += 12;

      // Nivel
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(33, 33, 33);
      doc.text(`Nivel alcanzado: ${nivel.id}`, 15, y); y += 8;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(55, 55, 55);
      y = agregarTextoMultilinea(doc, nivel.desc, 15, y, 180, 7);
      y += 6;

      const informeCalidad = obtenerInformeCalidadReporte(nivel);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(33, 33, 33);
      doc.text('Resumen ejecutivo', 15, y); y += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(55, 55, 55);
      y = agregarTextoMultilinea(doc, informeCalidad.executiveSummary, 15, y, 180, 6);
      y += 4;
      y = agregarListaReporte(doc, 'Fortalezas detectadas', informeCalidad.strengths, 15, y);
      y = agregarListaReporte(doc, 'Riesgos a atender', informeCalidad.risks, 15, y);
      if (y > 235) { doc.addPage(); y = 20; }
      y = agregarListaReporte(doc, 'Tres acciones próximas', informeCalidad.actions, 15, y);
      y = agregarListaReporte(doc, 'Rúbrica breve para compartir', informeCalidad.rubric, 15, y);

      if (y > 230) { doc.addPage(); y = 20; } else { y += 4; }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(33, 33, 33);
      doc.text('Lectura desde los marcos de referencia', 15, y); y += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(55, 55, 55);
      y = agregarTextoMultilinea(doc, construirSintesisMarco(nivel), 15, y, 180, 6);
      y += 6;

      // Recorrido completo
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(33, 33, 33);
      doc.text('Recorrido completo', 15, y); y += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(55, 55, 55);

      state.path.forEach((item, i) => {
        const nodo = perfil.nodos[item.id];
        const respuesta = item.answer || 'No';
        y = agregarTextoMultilinea(doc, `${i + 1}. ${nodo.title}`, 15, y, 180, 6);
        y = agregarTextoMultilinea(doc, `   Respuesta: ${respuesta}`, 15, y, 180, 6);
        y = agregarTextoMultilinea(doc, `   Retroalimentación inicial: ${item.feedback}`, 15, y, 180, 6);
        y = agregarTextoMultilinea(doc, `   Lectura desde marcos: ${construirRetroalimentacionMarco(nodo, respuestaEsAlineada(item))}`, 15, y, 180, 6);
        y += 4;
      });

      // Acuerdo didáctico generado
      doc.addPage();
      y = 20;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(33, 33, 33);
      doc.text('Acuerdo didáctico generado', 15, y); y += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(55, 55, 55);
      y = agregarTextoMultilinea(doc, obtenerTextoAcuerdoDidactico(), 15, y, 180, 6);

      // Acuerdos didácticos
      if (y > 230) { doc.addPage(); y = 20; } else { y += 8; }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(33, 33, 33);
      doc.text('Acuerdos didácticos sugeridos', 15, y); y += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(55, 55, 55);
      CONFIG.acuerdos.forEach((a, i) => {
        y = agregarTextoMultilinea(doc, `${i + 1}. ${a.text} (Ref.: ${a.ref})`, 15, y, 180, 6);
        y += 2;
      });

      // Referencias
      y += 6;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(33, 33, 33);
      doc.text('Referencias', 15, y); y += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(55, 55, 55);
      y = agregarTextoMultilinea(doc, 'ANEP: La inteligencia artificial en la educación (2024).', 15, y, 180, 6);
      y = agregarTextoMultilinea(doc, 'UNESCO: Guía para el uso de IA generativa en educación e investigación.', 15, y, 180, 6);
      y = agregarTextoMultilinea(doc, 'FING: Guía de ética para el uso de IA en unidades curriculares (2026).', 15, y, 180, 6);
      y = agregarTextoMultilinea(doc, 'Udelar: 11 principios rectores para el desarrollo y uso responsable de IA.', 15, y, 180, 6);
      y = agregarTextoMultilinea(doc, 'Ceibal: Uso ético de IA. Lineamientos para prácticas educativas críticas, reflexivas, seguras y responsables.', 15, y, 180, 6);
      y = agregarTextoMultilinea(doc, 'Artículo académico: https://horizontespedagogicos.ibero.edu.co/article/view/3235', 15, y, 180, 6);
      y = agregarTextoMultilinea(doc, 'Artículo académico: https://www.ucuauhtemoc.edu.mx/hubfs/revista-vol-6-num-1/Art%202%20Cuando%20el%20ocultamiento%20se%20hace%20visible.pdf', 15, y, 180, 6);

      doc.save(`reporte-iag-etica-pedagogica-${Date.now()}.pdf`);
      modal.show('Descarga completada', '<p>El reporte se ha descargado exitosamente en <strong>PDF</strong>.</p>');
    } catch (e) {
      console.error(e);
      modal.show('Error al generar PDF', '<p>No se pudo generar el PDF. Verificá la conexión a Internet para cargar jsPDF.</p>');
    }
  });
}

if (elements.copyBtn) {
  elements.copyBtn.addEventListener('click', () => {
    const nivel = CONFIG.likert.find(l => state.evidence >= l.min && l.max >= state.evidence);
    const perfil = CONFIG.perfiles[state.profileKey || state.profile];
    const appName = obtenerNombreApp();
    const nombre = obtenerNombreParticipante();
    const informeCalidad = obtenerInformeCalidadReporte(nivel);
    const resumen = `${appName} - Reporte de resultados

Participante: ${nombre}
Perfil: ${obtenerPerfilReporte()}
Nivel: ${nivel.id}

Resumen ejecutivo:
${informeCalidad.executiveSummary}

Fortalezas:
${informeCalidad.strengths.map((item, index) => `${index + 1}. ${item}`).join('\n')}

Riesgos a atender:
${informeCalidad.risks.map((item, index) => `${index + 1}. ${item}`).join('\n')}

Acciones próximas:
${informeCalidad.actions.map((item, index) => `${index + 1}. ${item}`).join('\n')}

Lectura desde marcos:
${construirSintesisMarco(nivel)}

Respuestas:
${state.path.map((p, i) => {
  const nodo = perfil.nodos[p.id];
  return `${i + 1}. ${nodo.title} → ${p.answer || 'No'}
   Retroalimentación: ${p.feedback}
   Marco: ${construirRetroalimentacionMarco(nodo, respuestaEsAlineada(p))}`;
}).join('\n\n')}

Acuerdo didáctico generado:
${obtenerTextoAcuerdoDidactico()}`;
    navigator.clipboard.writeText(resumen).then(() => {
      elements.copyBtn.innerHTML = '<span>✓ Copiado</span>';
      setTimeout(() => { elements.copyBtn.innerHTML = '<span>Copiar resumen</span>'; }, 2000);
    });
  });
}

if (elements.restartBtn) {
  elements.restartBtn.addEventListener('click', () => {
    state.profile = null;
    state.name = '';
    state.currentId = null;
    state.path = [];
    state.evidence = 0;
    state.currentSlide = 0;
    state.country = 'Uruguay';
    state.familiaridadInicial = '';
    state.recursosSimilares = '';
    state.consentTracking = true;

    elements.chips.forEach(c => c.classList.remove('active'));
    elements.playerName.value = '';

    if (elements.countrySelect) elements.countrySelect.value = 'Uruguay';
    if (elements.countryOtherWrapper) elements.countryOtherWrapper.style.display = 'none';
    if (elements.countryOtherInput) elements.countryOtherInput.value = '';
    if (elements.countryFinalInput) elements.countryFinalInput.value = 'Uruguay';

    if (elements.familiaridadInicial) elements.familiaridadInicial.value = '';
    if (elements.recursosSimilaresRadios && elements.recursosSimilaresRadios.length) {
      elements.recursosSimilaresRadios.forEach(r => { r.checked = false; });
    }
    if (elements.consentTracking) elements.consentTracking.checked = true;
    if (elements.toolRatingRadios && elements.toolRatingRadios.length) {
      elements.toolRatingRadios.forEach(r => { r.checked = false; });
    }
    if (elements.toolSuggestion) elements.toolSuggestion.value = '';
    if (elements.toolFeedbackStatus) {
      elements.toolFeedbackStatus.textContent = '';
      elements.toolFeedbackStatus.classList.remove('is-warning');
    }
    if (elements.sendToolFeedbackBtn) {
      elements.sendToolFeedbackBtn.disabled = false;
      elements.sendToolFeedbackBtn.textContent = 'Enviar valoración';
    }

    updateStartButtonState();
    updateCarousel();
    showScreen('intro');
    window.scrollTo(0, 0);
  });
}
