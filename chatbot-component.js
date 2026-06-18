// ==========================================
// CHATBOT - Asistente Pedagógico (v2.1)
// Integrado con Worker Cloudflare + Gemini 2.5
// ==========================================

(function () {
  'use strict';

  // ========== INYECTAR CSS ==========
  const style = document.createElement('style');
  style.textContent = `
    .chatbot-wrapper {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    .typing-indicator {
      display: flex;
      gap: 4px;
      padding: 4px 8px;
      align-items: center;
    }

    .typing-dot {
      width: 6px;
      height: 6px;
      background: #94a3b8;
      border-radius: 50%;
      animation: bounce 1.4s infinite ease-in-out;
    }

    .typing-dot:nth-child(1) { animation-delay: -0.32s; }
    .typing-dot:nth-child(2) { animation-delay: -0.16s; }
    .typing-dot:nth-child(3) { animation-delay: 0s; }

    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }

    .chatbot-toggle {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary, #6366f1) 0%, var(--primary-dark, #4f46e5) 100%);
      color: white;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      transition: all 0.3s ease;
    }

    .chatbot-floating-label {
      position: absolute;
      right: 72px;
      bottom: 9px;
      background: #ffffff;
      color: #312e81;
      border: 1px solid #c7d2fe;
      border-radius: 999px;
      padding: 0.5rem 0.75rem;
      box-shadow: 0 4px 14px rgba(15, 23, 42, 0.14);
      font-size: 0.82rem;
      font-weight: 700;
      white-space: nowrap;
      pointer-events: none;
    }

    .chatbot-toggle:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.6);
    }

    .chatbot-toggle.active {
      background: #ef4444;
    }

    .chatbot-window {
      position: fixed;
      bottom: 90px;
      right: 20px;
      width: 380px;
      height: 550px;
      max-height: calc(100dvh - 120px);
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
      display: none;
      flex-direction: column;
      overflow: hidden;
      animation: slideUp 0.3s ease;
    }

    .chatbot-window.active {
      display: flex;
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .chatbot-header {
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      color: white;
      padding: 1rem 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }

    .chatbot-header-title {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .chatbot-header-title h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
    }

    .chatbot-header-subtitle {
      font-size: 0.75rem;
      opacity: 0.9;
      margin: 0;
    }

    .chatbot-close {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.14);
      border: none;
      color: white;
      font-size: 1.5rem;
      cursor: pointer;
      opacity: 0.95;
      transition: background 0.2s, opacity 0.2s;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .chatbot-close:hover {
      background: rgba(255, 255, 255, 0.24);
      opacity: 1;
    }

    .chatbot-messages {
      flex: 1;
      overflow-y: auto;
      overscroll-behavior: contain;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      background: #f8fafc;
    }

    .chatbot-message {
      display: flex;
      gap: 0.75rem;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .chatbot-message.user { flex-direction: row-reverse; }

    .chatbot-message-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      flex-shrink: 0;
    }

    .chatbot-message.bot .chatbot-message-avatar {
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      color: white;
    }

    .chatbot-message.user .chatbot-message-avatar {
      background: #10b981;
      color: white;
    }

    .chatbot-message-content {
      max-width: 75%;
      padding: 0.75rem 1rem;
      border-radius: 12px;
      line-height: 1.5;
      font-size: 0.9rem;
      word-break: break-word;
    }

    .chatbot-message.bot .chatbot-message-content {
      background: white;
      color: #1e293b;
      border: 1px solid #e2e8f0;
    }

    .chatbot-message.user .chatbot-message-content {
      background: #6366f1;
      color: white;
    }

    .chatbot-message-content strong { font-weight: 600; }
    .chatbot-message-content em { font-style: italic; }
    .chatbot-message-content ul { margin: 0.5em 0 0.5em 1.2em; }
    .chatbot-message-content li { margin-bottom: 0.4em; }

    .chatbot-input-area {
      padding: 1rem;
      background: white;
      border-top: 1px solid #e2e8f0;
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }

    .chatbot-input {
      flex: 1;
      border: 2px solid #e2e8f0;
      border-radius: 24px;
      padding: 0.75rem 1rem;
      font-size: 0.9rem;
      outline: none;
      transition: border-color 0.2s;
      font-family: inherit;
    }

    .chatbot-input:focus { border-color: #6366f1; }

    .chatbot-send {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #6366f1;
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      transition: all 0.2s;
      flex-shrink: 0;
    }

    .chatbot-send:hover:not(:disabled) {
      background: #4f46e5;
      transform: scale(1.1);
    }

    .chatbot-send:disabled { opacity: 0.5; cursor: not-allowed; }

    .chatbot-welcome {
      text-align: center;
      padding: 2rem 1rem;
      color: #64748b;
    }

    .chatbot-welcome h4 { color: #1e293b; margin-bottom: 0.5rem; font-size: 1.1rem; }

    .chatbot-welcome p {
      font-size: 0.9rem;
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }

    .chatbot-ai-disclosure {
      margin: 0 1rem 0.75rem;
      padding: 0.65rem 0.8rem;
      border-radius: 10px;
      background: #eef2ff;
      border: 1px solid #c7d2fe;
      color: #3730a3;
      font-size: 0.78rem;
      line-height: 1.45;
    }

    .chatbot-ai-disclosure strong {
      display: block;
      margin-bottom: 0.2rem;
      color: #312e81;
    }

    .chatbot-tooltip {
      position: absolute;
      bottom: 70px;
      right: 0;
      background: var(--accent, #f59e0b);
      color: white;
      padding: 1rem 2.5rem 1rem 1rem;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(245, 158, 11, 0.4);
      max-width: 280px;
      z-index: 10000;
      position: relative;
    }

    .chatbot-tooltip::after {
      content: none;
    }

    .chatbot-tooltip-title {
      font-weight: 700;
      font-size: 0.95rem;
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .chatbot-tooltip p {
      margin: 0;
      font-size: 0.85rem;
      line-height: 1.4;
    }

    .chatbot-tooltip-action {
      margin-top: 0.85rem;
      border: 0;
      border-radius: 999px;
      background: #ffffff;
      color: #92400e;
      cursor: pointer;
      font: inherit;
      font-size: 0.82rem;
      font-weight: 800;
      padding: 0.55rem 0.8rem;
      box-shadow: 0 4px 12px rgba(146, 64, 14, 0.22);
    }

    .chatbot-tooltip-action:hover {
      background: #fffbeb;
    }

    .chatbot-tooltip-close {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background: transparent;
      border: none;
      color: white;
      font-size: 0.8rem;
      cursor: pointer;
      min-width: 28px;
      min-height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background 0.2s;
      padding: 0 0.35rem;
      line-height: 1;
      z-index: 10001;
      font-weight: 700;
    }

    .chatbot-tooltip-close:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .chatbot-tooltip.hidden {
      display: none !important;
    }

    @media (max-width: 768px) {
      .chatbot-window {
        width: calc(100vw - 40px);
        height: min(620px, calc(100dvh - 120px));
        right: 20px;
        bottom: calc(76px + env(safe-area-inset-bottom, 0px));
      }

      .chatbot-tooltip {
        max-width: 240px;
        right: 0;
      }

      .chatbot-floating-label {
        display: none;
      }
    }

    @media (max-width: 480px) {
      .chatbot-window {
        width: calc(100vw - 24px);
        height: min(560px, calc(100dvh - 112px));
        right: 12px;
        bottom: calc(72px + env(safe-area-inset-bottom, 0px));
        border-radius: 14px;
      }

      .chatbot-header {
        padding: 0.8rem 0.9rem;
      }

      .chatbot-header-title h3 {
        font-size: 0.95rem;
      }

      .chatbot-header-subtitle {
        font-size: 0.7rem;
      }

      .chatbot-messages {
        padding: 0.85rem;
      }

      .chatbot-input-area {
        padding: 0.75rem;
        padding-bottom: calc(0.75rem + env(safe-area-inset-bottom, 0px));
      }

      .chatbot-tooltip {
        max-width: calc(100vw - 100px);
        right: 0;
        font-size: 0.8rem;
      }
    }

    .chatbot-messages::-webkit-scrollbar { width: 6px; }
    .chatbot-messages::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 3px; }
  `;
  document.head.appendChild(style);

  // ========== HTML ==========
  const chatbotHTML = `
    <div class="chatbot-wrapper">
      <div class="chatbot-tooltip" id="chatbotTooltip">
        <button class="chatbot-tooltip-close" id="chatbotTooltipClose" aria-label="Cerrar" type="button">Cerrar</button>
        <div class="chatbot-tooltip-title">Oportunidad de profundización</div>
        <p>Consultá al Asistente Pedagógico para resolver dudas sobre el uso crítico de IA.</p>
        <button class="chatbot-tooltip-action" id="chatbotTooltipAction" type="button" style="display: none;">Ver sugerencias de mejora</button>
      </div>
      <span class="chatbot-floating-label">Asistente Pedagógico</span>
      <button class="chatbot-toggle" id="chatbotToggle" aria-label="Abrir asistente pedagógico">💬</button>
      <div class="chatbot-window" id="chatbotWindow">
        <div class="chatbot-header">
          <div class="chatbot-header-title">
            <div>
              <h3>Asistente Pedagógico</h3>
              <p class="chatbot-header-subtitle">Asistencia generada con IA</p>
            </div>
          </div>
          <button class="chatbot-close" id="chatbotClose" type="button" aria-label="Cerrar asistente">×</button>
        </div>
        <div class="chatbot-messages" id="chatbotMessages">
          <div class="chatbot-welcome">
            <h4>Hola, soy tu Asistente Pedagógico</h4>
            <p>Puedo ayudarte a interpretar tus respuestas, revisar preguntas del recorrido y pensar mejoras para un uso crítico de IA en educación.</p>
          </div>
        </div>
        <div class="chatbot-ai-disclosure">
          <strong>Transparencia de uso</strong>
          Este asistente usa IA generativa para orientar la reflexión. Sus respuestas pueden requerir verificación y no sustituyen el criterio docente, académico o institucional.
        </div>
        <div class="chatbot-input-area">
          <input type="text" id="chatbotInput" class="chatbot-input" placeholder="Escribí tu consulta..." maxlength="500" />
          <button class="chatbot-send" id="chatbotSend">➤</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', chatbotHTML);

  // ========== CONFIG ==========
  const CHAT_ENDPOINT = window.CONFIG?.chatEndpoint
    || (window.CONFIG?.apiBaseUrl ? `${window.CONFIG.apiBaseUrl}/chat` : 'https://iag-etica-api.suscripcionessh.workers.dev/chat');

  const debugLog = (...args) => {
    if (window.CONFIG?.debug) console.log(...args);
  };

  const TOOLTIP_DISMISSED_KEY = 'chatbot_tooltip_dismissed';
  const QUIZ_INTRO_TOOLTIP_KEY = 'chatbot_quiz_intro_shown';

  // ========== ELEMENTOS ==========
  const el = {
    toggle: document.getElementById('chatbotToggle'),
    window: document.getElementById('chatbotWindow'),
    close: document.getElementById('chatbotClose'),
    messages: document.getElementById('chatbotMessages'),
    input: document.getElementById('chatbotInput'),
    send: document.getElementById('chatbotSend'),
    tooltip: document.getElementById('chatbotTooltip'),
    tooltipClose: document.getElementById('chatbotTooltipClose'),
    tooltipAction: document.getElementById('chatbotTooltipAction'),
  };

  let isOpen = false, isTyping = false, pendingTooltipAction = null;

  // ========== FUNCIONES ==========
  const scrollToBottom = () => {
    setTimeout(() => {
      el.messages.scrollTo({ top: el.messages.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  const escapeHTML = (value) => String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const safeLink = (url) => {
    const trimmed = String(url || '').trim();
    return /^(https?:|mailto:)/i.test(trimmed) ? trimmed : '#';
  };

  const getHistory = () => {
    try {
      const parsed = JSON.parse(sessionStorage.getItem('chatbot_history') || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn('Historial del chatbot inválido. Se reinicia.', error);
      sessionStorage.removeItem('chatbot_history');
      return [];
    }
  };

  const saveHistory = (history) => {
    try {
      sessionStorage.setItem('chatbot_history', JSON.stringify(history.slice(-20)));
    } catch (error) {
      console.warn('No se pudo guardar el historial del chatbot.', error);
    }
  };

  const markdownToHTML = (text) => {
    return escapeHTML(text)
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\n/g, "<br>")
      .replace(/^- (.*)/gm, "<ul><li>$1</li></ul>")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, url) => {
        const href = escapeHTML(safeLink(url));
        return `<a href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`;
      });
  };

const addMessage = (content, type = 'bot', save = true) => {
    const welcome = el.messages.querySelector('.chatbot-welcome');
    if (welcome) welcome.remove();

    const msg = document.createElement('div');
    msg.className = `chatbot-message ${type}`;
    
    // Si es el indicador de carga, usamos los puntos animados
    const htmlContent = content === 'TYPING_INDICATOR' 
      ? `<div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>`
      : markdownToHTML(content);

    msg.innerHTML = `
      <div class="chatbot-message-avatar">${type === 'bot' ? '🤖' : '👤'}</div>
      <div class="chatbot-message-content">${htmlContent}</div>
    `;
    el.messages.appendChild(msg);
    scrollToBottom();

    // Guardar en sesión para persistencia (solo mensajes reales)
    if (save && content !== 'TYPING_INDICATOR') {
      const history = getHistory();
      history.push({ content, type });
      saveHistory(history);
    }

    return msg;
  };

  const buildQuestionContext = () => {
    const appState = window.state || {};
    const appConfig = window.CONFIG || {};
    const profileKey = appState.profileKey || appState.profile;
    const perfil = appConfig.perfiles && profileKey ? appConfig.perfiles[profileKey] : null;
    const currentNode = perfil && appState.currentId && appState.currentId !== 'FIN'
      ? perfil.nodos[appState.currentId]
      : null;

    const questions = perfil
      ? Object.entries(perfil.nodos)
          .filter(([id]) => id !== 'FIN')
          .map(([id, node]) => ({
            id,
            pregunta: node.title,
            ayuda: node.help,
            referencia: node.anepRef
          }))
      : [];
    const nivelFinal = appConfig.likert
      ? appConfig.likert.find(l => (appState.evidence || 0) >= l.min && l.max >= (appState.evidence || 0))
      : null;
    const respuestasDelRecorrido = Array.isArray(appState.path)
      ? appState.path.map((step, index) => ({
          orden: index + 1,
          id: step.id,
          pregunta: step.question,
          respuesta: step.answer || step.answerKey || '',
          feedback: step.feedback
        }))
      : [];
    const areasDeMejora = respuestasDelRecorrido.filter(step => ['No', 'A veces'].includes(step.respuesta));

    return {
      instruccionPrioritaria: 'Si la consulta del usuario menciona "esto", "acá", "esta pregunta", "la pregunta" o pide qué significa algo del sitio, respondé sobre la preguntaActual del recorrido. Si pregunta por "mejora", "sugerencias", "recomendaciones" o "áreas", usá resultadoFinal y areasDeMejora del recorrido. No inventes respuestas fuera del contexto disponible.',
      perfil: appState.profileBase || appState.profile || null,
      perfilRecorrido: profileKey || null,
      nivelEducativo: appState.nivelEducativo || null,
      familiaridadInicial: appState.familiaridadInicial || null,
      recursosSimilares: appState.recursosSimilares || null,
      estadoDelRecorrido: {
        evidenciaAcumulada: appState.evidence || 0,
        preguntaNumero: appState.currentQuestion || null,
        totalPreguntas: appState.totalQuestions || null
      },
      resultadoFinal: nivelFinal ? {
        nivel: nivelFinal.id,
        descripcion: nivelFinal.desc,
        evidencia: appState.evidence || 0
      } : null,
      preguntaActual: currentNode ? {
        id: appState.currentId,
        pregunta: currentNode.title,
        ayuda: currentNode.help,
        contexto: currentNode.context,
        referencia: currentNode.anepRef
      } : null,
      respuestasDelRecorrido,
      areasDeMejora,
      preguntasDelPerfil: questions
    };
  };

  const userAsksAboutCurrentQuestion = (text) => {
    const normalized = String(text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    return /\b(esto|aca|aqui|pregunta|consigna|que me pregunta|que seria|que significa)\b/.test(normalized);
  };

  const buildWorkerMessage = (message, context) => {
    if (!userAsksAboutCurrentQuestion(message) || !context.preguntaActual) {
      return message;
    }

    return [
      message,
      '',
      'Contexto de la interfaz: el usuario se refiere a la pregunta actual del recorrido.',
      `Pregunta actual: ${context.preguntaActual.pregunta}`,
      `Ayuda visible: ${context.preguntaActual.ayuda}`,
      'Respondé explicando qué está preguntando esa consigna y cómo pensarla. No hables del puntaje salvo que el usuario lo pida.'
    ].join('\n');
  };

 const sendMessage = async (message) => {
    const cleanMessage = String(message || '').trim();
    if (!cleanMessage || isTyping) return;

    addMessage(cleanMessage, 'user');
    el.input.value = '';
    el.send.disabled = true;
    el.input.disabled = true;
    isTyping = true;

    const typingMessage = addMessage('TYPING_INDICATOR', 'bot', false); // Indicador visual sin guardar

    let timeoutId;

   try {
  const userContext = buildQuestionContext();
  const workerMessage = buildWorkerMessage(cleanMessage, userContext);
  const controller = new AbortController();
  timeoutId = window.setTimeout(() => controller.abort(), 25000);

  const response = await fetch(CHAT_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: workerMessage,
      context: userContext
    }),
    signal: controller.signal
  });
  window.clearTimeout(timeoutId);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error HTTP: ${response.status}`);
  }

  const data = await response.json();
  debugLog("Respuesta IA:", data);
  if (!data.ok) {
    throw new Error(data.error || 'Respuesta inválida del asistente');
  }

  // 👇 MOSTRAR RESPUESTA
  if (typingMessage && typingMessage.parentNode) typingMessage.remove();
  addMessage(data.reply || "No pude responder en este momento.", 'bot');

} catch (error) {
  console.error("Error en chatbot:", error);
  if (typingMessage && typingMessage.parentNode) typingMessage.remove();
  const offlineMessage = error.name === 'AbortError'
    ? 'La respuesta está demorando más de lo esperado. Probá de nuevo en unos segundos.'
    : 'Hubo un problema al conectar con la IA. Podés intentar nuevamente en unos segundos.';
  addMessage(offlineMessage, 'bot');
} finally {
      if (timeoutId) window.clearTimeout(timeoutId);
      el.send.disabled = false;
      el.input.disabled = false;
      el.input.focus();
      isTyping = false;
    }
  };

  window.sendMessage = sendMessage;

  const openChatbot = () => {
    if (isOpen) return;
    isOpen = true;
    el.window.classList.add('active');
    el.toggle.classList.add('active');
    el.toggle.textContent = '✕';
    el.tooltip.classList.add('hidden');
  };

  const askForImprovementSuggestions = (message) => {
    openChatbot();
    const prompt = message || window.chatbotImprovementPrompt || 'Mostrame sugerencias de mejora basadas en mi recorrido.';
    window.setTimeout(() => sendMessage(prompt), 250);
  };

  window.openChatbot = openChatbot;
  window.askChatbotForImprovementSuggestions = askForImprovementSuggestions;

  const dismissTooltip = () => {
    el.tooltip.classList.add('hidden');
    localStorage.setItem(TOOLTIP_DISMISSED_KEY, 'true');
  };

  const showTooltip = (title, text, options = {}) => {
    if (!el.tooltip) return;
    const titleEl = el.tooltip.querySelector('.chatbot-tooltip-title');
    const textEl = el.tooltip.querySelector('p');

    if (titleEl) titleEl.textContent = title;
    if (textEl) textEl.textContent = text;
    pendingTooltipAction = typeof options.onAction === 'function' ? options.onAction : null;
    if (el.tooltipAction) {
      el.tooltipAction.textContent = options.actionLabel || 'Ver sugerencias de mejora';
      el.tooltipAction.style.display = pendingTooltipAction ? 'inline-flex' : 'none';
    }
    el.tooltip.classList.remove('hidden');

    if (options.autoHideMs) {
      window.clearTimeout(showTooltip.hideTimer);
      showTooltip.hideTimer = window.setTimeout(() => {
        el.tooltip.classList.add('hidden');
      }, options.autoHideMs);
    }
  };

  const showQuizIntroTooltip = () => {
    if (sessionStorage.getItem(QUIZ_INTRO_TOOLTIP_KEY) === 'true') return;
    sessionStorage.setItem(QUIZ_INTRO_TOOLTIP_KEY, 'true');

    showTooltip(
      'Asistente Pedagógico',
      'Uso IA generativa para explicar preguntas, interpretar respuestas y sugerir mejoras. Conviene verificar mis orientaciones con criterio pedagógico.',
      { autoHideMs: 12000, onAction: null }
    );
  };

  window.showChatbotQuizIntro = showQuizIntroTooltip;

  window.showChatbotImprovementPrompt = (message) => {
    window.chatbotImprovementPrompt = message;
    showTooltip(
      'Oportunidad de profundización',
      'Analicé tus respuestas del recorrido y puedo ayudarte a priorizar mejoras.',
      {
        actionLabel: 'Ver sugerencias de mejora',
        onAction: () => askForImprovementSuggestions(message)
      }
    );
  };

  // ========== EVENTOS ==========
  el.toggle.addEventListener('click', () => {
    isOpen = !isOpen;
    el.window.classList.toggle('active', isOpen);
    el.toggle.classList.toggle('active', isOpen);
    el.toggle.textContent = isOpen ? '✕' : '💬';
    
    // Ocultar tooltip al abrir el chatbot
    if (isOpen) {
      el.tooltip.classList.add('hidden');
    }
  });

  el.close.addEventListener('click', () => el.toggle.click());
  el.send.addEventListener('click', () => sendMessage(el.input.value));
  el.input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(el.input.value);
    }
  });

  // Evento del botón de cierre del tooltip con múltiples métodos
  el.tooltipClose.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dismissTooltip();
  });

  if (el.tooltipAction) {
    el.tooltipAction.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (pendingTooltipAction) pendingTooltipAction();
    });
  }

  // También permitir cerrar haciendo click en el tooltip completo
  el.tooltip.addEventListener('click', (e) => {
    if (e.target === el.tooltipClose || e.target.closest('#chatbotTooltipClose')) {
      e.preventDefault();
      e.stopPropagation();
      dismissTooltip();
    }
  });

  // ========== INICIALIZACIÓN DEL TOOLTIP ==========
  // Verificar si el tooltip ya fue cerrado previamente
  if (localStorage.getItem(TOOLTIP_DISMISSED_KEY) === 'true') {
    el.tooltip.classList.add('hidden');
  }



  // ========== INICIALIZACIÓN ==========
  
  // Cargar historial previo de la sesión
  getHistory().forEach(msg => addMessage(msg.content, msg.type, false));

  if (localStorage.getItem(TOOLTIP_DISMISSED_KEY) === 'true') {
    el.tooltip.classList.add('hidden');
  }

  debugLog('Chatbot Pedagógico iniciado con persistencia');
  
})();
