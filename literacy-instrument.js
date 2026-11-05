/**
 * Instrumento breve pre/post de alfabetización crítica en IA (lit-v1).
 *
 * Se aplica solo en modo programa, con los mismos ítems en cada momento
 * (baseline, final, followup) para que los puntajes sean comparables.
 * - 5 ítems de conocimiento aplicado (situaciones con una única respuesta adecuada).
 * - 3 ítems de autoeficacia/práctica (escala 1–5).
 * Puntaje: 60 % conocimiento + 40 % autoeficacia, en escala 0–100.
 */
(function () {
  const VERSION = 'lit-v1';
  const KNOWLEDGE_WEIGHT = 0.6;
  const PRACTICE_WEIGHT = 0.4;

  const KNOWLEDGE_ITEMS = Object.freeze([
    {
      id: 'k1',
      axis: 'verificacion',
      correct: 'c',
      prompt: {
        es: 'Un asistente de IA te entrega una cita bibliográfica con autor, año y DOI. ¿Qué es lo más adecuado antes de usarla?',
        en: 'An AI assistant gives you a reference with author, year and DOI. What is the most appropriate step before using it?',
      },
      options: {
        a: { es: 'Usarla: si incluye DOI, la referencia es confiable.', en: 'Use it: if it includes a DOI, the reference is reliable.' },
        b: { es: 'Pedirle a la misma IA que confirme que la cita existe.', en: 'Ask the same AI to confirm that the reference exists.' },
        c: { es: 'Buscarla en una base académica o en la fuente original y comprobar que dice lo citado.', en: 'Look it up in an academic database or the original source and check it says what is cited.' },
        d: { es: 'Eliminar el DOI y conservar solo autor y año.', en: 'Remove the DOI and keep only author and year.' },
      },
    },
    {
      id: 'k2',
      axis: 'privacidad',
      correct: 'b',
      prompt: {
        es: 'Querés usar un asistente generativo de uso público para preparar devoluciones. ¿Qué información es adecuado ingresar?',
        en: 'You want to use a public generative assistant to prepare feedback. What information is appropriate to enter?',
      },
      options: {
        a: { es: 'La lista del grupo con nombres y calificaciones, para personalizar.', en: 'The class list with names and grades, to personalize feedback.' },
        b: { es: 'Una rúbrica genérica y un texto de ejemplo sin datos identificables.', en: 'A generic rubric and a sample text without identifiable data.' },
        c: { es: 'Informes de apoyo o diagnósticos de estudiantes concretos.', en: 'Support reports or diagnoses of specific students.' },
        d: { es: 'Cualquier dato, si luego se borra el historial del chat.', en: 'Any data, as long as the chat history is deleted afterwards.' },
      },
    },
    {
      id: 'k3',
      axis: 'equidad',
      correct: 'd',
      prompt: {
        es: 'Al pedir ejemplos de profesiones, la IA muestra siempre ingenieros varones y enfermeras mujeres. ¿Qué ilustra esto?',
        en: 'When asked for job examples, the AI always shows male engineers and female nurses. What does this illustrate?',
      },
      options: {
        a: { es: 'Una descripción neutral y objetiva de la realidad.', en: 'A neutral and objective description of reality.' },
        b: { es: 'Un error técnico aislado que no requiere atención pedagógica.', en: 'An isolated technical glitch that needs no pedagogical attention.' },
        c: { es: 'Que la herramienta debe prohibirse en todos los casos.', en: 'That the tool must be banned in every case.' },
        d: { es: 'Un sesgo aprendido de los datos que requiere revisión humana y diálogo con el grupo.', en: 'A bias learned from data that requires human review and discussion with the group.' },
      },
    },
    {
      id: 'k4',
      axis: 'transparencia',
      correct: 'a',
      prompt: {
        es: '¿Cuál es una declaración adecuada de uso de IA en una entrega o planificación?',
        en: 'Which is an appropriate AI-use disclosure in an assignment or lesson plan?',
      },
      options: {
        a: { es: 'Indicar herramienta, finalidad, partes asistidas y qué se modificó o validó personalmente.', en: 'State the tool, purpose, assisted parts and what you personally changed or validated.' },
        b: { es: 'Escribir “se usó IA” al final, sin más detalle.', en: 'Write “AI was used” at the end, with no further detail.' },
        c: { es: 'No declararlo si el texto fue reescrito con palabras propias.', en: 'Not disclose it if the text was rewritten in your own words.' },
        d: { es: 'Adjuntar todo el chat completo en lugar de explicar el aporte propio.', en: 'Attach the entire chat instead of explaining your own contribution.' },
      },
    },
    {
      id: 'k5',
      axis: 'agencia',
      correct: 'b',
      prompt: {
        es: 'Una plataforma ofrece calificar ensayos automáticamente. Según los marcos de referencia (ANEP, Ceibal, NIST, U.S. Dept. of Education), ¿qué corresponde?',
        en: 'A platform offers to grade essays automatically. According to the reference frameworks (ANEP, Ceibal, NIST, U.S. Dept. of Education), what is appropriate?',
      },
      options: {
        a: { es: 'Adoptarla: la calificación automática es más objetiva que la docente.', en: 'Adopt it: automated grading is more objective than teachers.' },
        b: { es: 'Puede apoyar, pero la decisión evaluativa final queda bajo supervisión y criterio docente.', en: 'It may assist, but the final assessment decision stays under teacher oversight and judgment.' },
        c: { es: 'Usarla solo con estudiantes de bajo rendimiento.', en: 'Use it only with low-performing students.' },
        d: { es: 'Dejar que el estudiantado elija si lo califica la IA o una persona.', en: 'Let students choose whether AI or a person grades them.' },
      },
    },
  ]);

  const PRACTICE_ITEMS = Object.freeze([
    {
      id: 'p1',
      axis: 'verificacion',
      prompt: {
        es: 'Puedo detectar cuándo una respuesta de IA contiene información inventada o errónea.',
        en: 'I can tell when an AI response contains made-up or wrong information.',
      },
    },
    {
      id: 'p2',
      axis: 'privacidad',
      prompt: {
        es: 'Sé qué datos no debo compartir con herramientas de IA en contextos educativos.',
        en: 'I know which data I should not share with AI tools in educational settings.',
      },
    },
    {
      id: 'p3',
      axis: 'transparencia',
      prompt: {
        es: 'Puedo explicar y documentar cómo usé la IA en una tarea o planificación.',
        en: 'I can explain and document how I used AI in an assignment or lesson plan.',
      },
    },
  ]);

  const COPY = Object.freeze({
    es: {
      title: 'Instrumento breve del programa',
      intro: 'Son 8 preguntas (unos 3 minutos). Se repiten igual al inicio, al final y en el seguimiento para medir cambios del grupo. No es una calificación individual.',
      knowledge: 'Situaciones',
      practice: '¿Qué tan de acuerdo estás?',
      scale: ['1 · Nada', '2', '3', '4', '5 · Totalmente'],
      progress: (done, total) => `${done} de ${total} respondidas`,
      missing: 'Respondé las 8 preguntas del instrumento del programa',
    },
    en: {
      title: 'Short program check-in',
      intro: '8 questions (about 3 minutes). The same items are repeated at the start, the end and follow-up to measure group change. This is not an individual grade.',
      knowledge: 'Scenarios',
      practice: 'How much do you agree?',
      scale: ['1 · Not at all', '2', '3', '4', '5 · Completely'],
      progress: (done, total) => `${done} of ${total} answered`,
      missing: 'Answer the 8 program check-in questions',
    },
  });

  const answers = { k: {}, p: {} };
  let rootEl = null;
  let onChangeCallback = null;

  function lang(value) {
    return COPY[value] ? value : (value === 'pt' || value === 'fr' ? 'es' : 'es');
  }

  function text(value, language) {
    return value[language] || value.es;
  }

  function totalItems() {
    return KNOWLEDGE_ITEMS.length + PRACTICE_ITEMS.length;
  }

  function answeredCount(source = answers) {
    const k = KNOWLEDGE_ITEMS.filter(item => source.k && source.k[item.id]).length;
    const p = PRACTICE_ITEMS.filter(item => source.p && source.p[item.id]).length;
    return k + p;
  }

  function isComplete(source = answers) {
    return answeredCount(source) === totalItems();
  }

  function round1(value) {
    return Math.round(value * 10) / 10;
  }

  function score(source = answers) {
    if (!isComplete(source)) return null;
    const correct = KNOWLEDGE_ITEMS.filter(item => source.k[item.id] === item.correct).length;
    const knowledgeScore = (correct / KNOWLEDGE_ITEMS.length) * 100;
    const practiceMean = PRACTICE_ITEMS
      .map(item => (Number(source.p[item.id]) - 1) / 4)
      .reduce((sum, value) => sum + value, 0) / PRACTICE_ITEMS.length;
    const practiceScore = practiceMean * 100;
    const literacyScore = Math.round(KNOWLEDGE_WEIGHT * knowledgeScore + PRACTICE_WEIGHT * practiceScore);
    return {
      version: VERSION,
      literacyScore,
      knowledgeScore: round1(knowledgeScore),
      practiceScore: round1(practiceScore),
      correct,
    };
  }

  function payload() {
    const result = score();
    if (!result) return {};
    return {
      literacyScore: result.literacyScore,
      literacyAnswers: {
        version: VERSION,
        k: { ...answers.k },
        p: { ...answers.p },
        knowledgeScore: result.knowledgeScore,
        practiceScore: result.practiceScore,
      },
    };
  }

  function setAnswer(group, id, value) {
    if (group === 'k' && KNOWLEDGE_ITEMS.some(item => item.id === id) && /^[a-d]$/.test(value)) {
      answers.k[id] = value;
    } else if (group === 'p' && PRACTICE_ITEMS.some(item => item.id === id)) {
      const n = Number(value);
      if (Number.isInteger(n) && n >= 1 && n <= 5) answers.p[id] = n;
    }
    updateProgress();
    if (typeof onChangeCallback === 'function') onChangeCallback();
  }

  function reset() {
    answers.k = {};
    answers.p = {};
    if (rootEl) rootEl.querySelectorAll('input[type="radio"]').forEach(input => { input.checked = false; });
    updateProgress();
  }

  function updateProgress() {
    if (!rootEl) return;
    const node = rootEl.querySelector('[data-literacy-progress]');
    if (node) node.textContent = COPY[node.dataset.lang || 'es'].progress(answeredCount(), totalItems());
    rootEl.querySelectorAll('[data-literacy-item]').forEach(item => {
      const [group, id] = item.dataset.literacyItem.split(':');
      item.classList.toggle('is-answered', Boolean(answers[group] && answers[group][id]));
    });
  }

  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => {
      if (key === 'text') node.textContent = value;
      else if (key === 'className') node.className = value;
      else node.setAttribute(key, value);
    });
    children.forEach(child => node.appendChild(child));
    return node;
  }

  function render(container, languageValue, onChange) {
    if (!container) return;
    rootEl = container;
    if (onChange) onChangeCallback = onChange;
    const language = lang(languageValue);
    const copy = COPY[language];
    container.replaceChildren();

    container.appendChild(el('div', { className: 'literacy-head' }, [
      el('h3', { id: 'literacyInstrumentTitle', text: copy.title }),
      el('p', { text: copy.intro }),
      el('span', { className: 'literacy-progress', 'data-literacy-progress': '', 'data-lang': language, 'aria-live': 'polite' }),
    ]));

    container.appendChild(el('p', { className: 'literacy-section-label', text: copy.knowledge }));
    KNOWLEDGE_ITEMS.forEach((item, index) => {
      const fieldset = el('fieldset', { className: 'literacy-item', 'data-literacy-item': `k:${item.id}` });
      fieldset.appendChild(el('legend', { text: `${index + 1}. ${text(item.prompt, language)}` }));
      Object.entries(item.options).forEach(([key, option]) => {
        const input = el('input', { type: 'radio', name: `literacy_${item.id}`, value: key });
        if (answers.k[item.id] === key) input.checked = true;
        input.addEventListener('change', () => setAnswer('k', item.id, key));
        fieldset.appendChild(el('label', { className: 'literacy-option' }, [input, el('span', { text: text(option, language) })]));
      });
      container.appendChild(fieldset);
    });

    container.appendChild(el('p', { className: 'literacy-section-label', text: copy.practice }));
    PRACTICE_ITEMS.forEach((item, index) => {
      const fieldset = el('fieldset', { className: 'literacy-item literacy-scale-item', 'data-literacy-item': `p:${item.id}` });
      fieldset.appendChild(el('legend', { text: `${KNOWLEDGE_ITEMS.length + index + 1}. ${text(item.prompt, language)}` }));
      const scale = el('div', { className: 'literacy-scale' });
      copy.scale.forEach((label, scaleIndex) => {
        const value = scaleIndex + 1;
        const input = el('input', { type: 'radio', name: `literacy_${item.id}`, value: String(value) });
        if (answers.p[item.id] === value) input.checked = true;
        input.addEventListener('change', () => setAnswer('p', item.id, value));
        scale.appendChild(el('label', { className: 'literacy-scale-option' }, [input, el('span', { text: label })]));
      });
      fieldset.appendChild(scale);
      container.appendChild(fieldset);
    });

    updateProgress();
  }

  function focusFirstUnanswered() {
    if (!rootEl) return;
    const pending = Array.from(rootEl.querySelectorAll('[data-literacy-item]'))
      .find(item => !item.classList.contains('is-answered'));
    const input = pending && pending.querySelector('input');
    if (input) input.focus({ preventScroll: false });
  }

  function missingLabel(languageValue) {
    return COPY[lang(languageValue)].missing;
  }

  window.LiteracyInstrument = Object.freeze({
    version: VERSION,
    knowledgeItems: KNOWLEDGE_ITEMS,
    practiceItems: PRACTICE_ITEMS,
    totalItems,
    answeredCount,
    isComplete,
    score,
    payload,
    setAnswer,
    reset,
    render,
    focusFirstUnanswered,
    missingLabel,
  });
})();
