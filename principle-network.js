// Stable topology: changing a response updates the signals, not the node positions.
function construirLayoutPrincipios(nodes, compact = false) {
  const positions = compact
    ? [[180, 74], [78, 206], [102, 410], [258, 410], [282, 206]]
    : [[360, 80], [150, 195], [228, 370], [492, 370], [570, 195]];
  return nodes.map((node, index) => ({
    ...node, x: positions[index][0], y: positions[index][1],
    radius: compact ? 62 : 64,
    cx: compact ? 180 : 360, cy: compact ? 266 : 230,
    coreRadius: compact ? 42 : 48
  }));
}

function construirRutaNeuronal(node) {
  const distance = Math.hypot(node.x - node.cx, node.y - node.cy);
  const dx = (node.x - node.cx) / distance;
  const dy = (node.y - node.cy) / distance;
  const start = node.coreRadius + 6;
  const end = node.radius + 6;
  return `M ${node.cx + dx * start} ${node.cy + dy * start} L ${node.x - dx * end} ${node.y - dy * end}`;
}

function networkText() {
  const copy = {
    es: { title: 'Red de principios de tu recorrido', core: 'Tu recorrido', hint: 'Pasá el cursor, enfocá o tocá un eje para ver tus respuestas y su relación con los marcos.', signals: n => `${n} ${n === 1 ? 'respuesta' : 'respuestas'}`, pending: 'Sin respuestas', current: 'Ahora', focus: 'Foco', touched: n => `${n} de 5 principios explorados` },
    en: { title: 'Your journey’s network of principles', core: 'Your journey', hint: 'Select a principle to explore its signals.', signals: n => `${n} ${n === 1 ? 'signal' : 'signals'}`, pending: 'To explore', current: 'Now', focus: 'Focus', touched: n => `${n} of 5 principles explored` },
    pt: { title: 'Rede de princípios do seu percurso', core: 'Seu percurso', hint: 'Selecione um princípio para explorar seus sinais.', signals: n => `${n} ${n === 1 ? 'sinal' : 'sinais'}`, pending: 'A explorar', current: 'Agora', focus: 'Foco', touched: n => `${n} de 5 princípios explorados` },
    fr: { title: 'Le réseau de principes de votre parcours', core: 'Votre parcours', hint: 'Sélectionnez un principe pour explorer ses signaux.', signals: n => `${n} ${n === 1 ? 'signal' : 'signaux'}`, pending: 'À explorer', current: 'En cours', focus: 'Priorité', touched: n => `${n} principes explorés sur 5` }
  };
  return copy[state.lang] || copy.es;
}

function crearPrincipleGraphSvg(target, nodes) {
  // No shared SVG paint/filter IDs: both graphs can exist while one is hidden.
  const titleId = `${target.id}-network-title`;
  target.innerHTML = `
    <svg class="ethics-network" role="group" aria-labelledby="${titleId}">
      <title id="${titleId}"></title>
      <g class="en-connections" aria-hidden="true">
        ${nodes.map(node => `<path class="en-link" data-criterion="${node.id}"></path>`).join('')}
      </g>
      <g class="en-core" aria-hidden="true">
        <circle class="en-core-halo"></circle><circle class="en-core-disc"></circle>
        <text class="en-core-title" text-anchor="middle">IAG</text>
        <text class="en-core-caption" text-anchor="middle"></text>
      </g>
      ${nodes.map(node => `
        <g class="en-node" data-criterion="${node.id}" role="button" tabindex="0">
          <title></title>
          <circle class="en-halo"></circle><circle class="en-disc"></circle>
          <circle class="en-state-dot" cy="-37" r="4"></circle>
          <text class="en-label" y="-12" text-anchor="middle"></text>
          <text class="en-status" y="10" text-anchor="middle"></text>
          <text class="en-count" y="30" text-anchor="middle"></text>
        </g>`).join('')}
    </svg>
    <p class="en-hint"></p>
    <div class="en-detail">
      <strong></strong><p></p>
    </div>`;
}

function renderNetworkEvidence(target, node) {
  const guidance = ETHICAL_FRAMEWORK_GUIDANCE[node.id];
  const responses = node.responses || [];
  const latest = responses[responses.length - 1];
  const escape = escapeGameHtml;
  const contextOnly = response => response.answerKey === 'na' || response.association.kind === 'context'
    || response.association.contextAxes?.includes(node.id);
  const responseHtml = response => `<li>
    <span class="en-answer ${contextOnly(response) ? 'context' : escape(response.answerKey)}">${escape(response.answer)}</span>
    <span>${escape(response.question)}</span>
    <small>${escape(response.association.reason)}${contextOnly(response) ? ' Se muestra como contexto, sin valorar este eje.' : ''}</small>
  </li>`;
  const counts = ['yes', 'sometimes', 'no', 'na'].map(key => {
    const count = responses.filter(response => response.answerKey === key).length;
    return count ? `${count} ${ANSWER_OPTIONS[key].label}` : '';
  }).filter(Boolean).join(' · ');
  const applicable = responses.filter(response => !contextOnly(response));
  const noCount = applicable.filter(response => response.answerKey === 'no').length;
  const partialCount = applicable.filter(response => response.answerKey === 'sometimes').length;
  const summary = node.className === 'priority'
    ? `Este eje aparece como prioritario por ${noCount} ${noCount === 1 ? 'respuesta «No»' : 'respuestas «No»'} entre ${applicable.length} respuestas aplicables.`
    : node.className === 'progress'
      ? `Hay ${partialCount} ${partialCount === 1 ? 'respuesta «A veces»' : 'respuestas «A veces»'}: una oportunidad para hacer más constante esta práctica.`
      : node.className === 'done'
        ? `Las ${applicable.length} respuestas aplicables son «Sí»: describen prácticas alineadas con este eje.`
        : node.feedback;
  target.querySelector('.en-detail').innerHTML = `
    <strong>${escape(node.label)} · ${escape(node.status)}</strong>
    <p class="en-summary" role="status" aria-live="polite">${escape(summary)}</p>
    ${latest ? `<p class="en-section-label">Última respuesta vinculada</p><ul class="en-response-list">${responseHtml(latest)}</ul>`
      : '<p class="en-empty">Este recorrido todavía no aporta respuestas específicas sobre este eje.</p>'}
    ${responses.length > 1 ? `<details class="en-response-history"><summary>Ver las ${responses.length} respuestas · ${escape(counts)}</summary><ul class="en-response-list">${responses.map(responseHtml).join('')}</ul></details>` : ''}
    <div class="en-framework"><span class="en-section-label">Lectura desde los marcos</span><p>${escape(guidance.basis)}</p>
      <p class="en-agesic">${escape(guidance.agesic)}</p>
      <div class="en-source-links">${guidance.sources.map(source => `<a href="${escape(source.url)}" target="_blank" rel="noopener noreferrer">${escape(source.label)} ↗</a>`).join('')}</div>
    </div>
    <div class="en-action"><span class="en-section-label">${node.className === 'done' ? 'Para sostener esta práctica' : node.className === 'pending' ? 'Para explorar este eje' : 'Siguiente paso posible'}</span><p>${escape(guidance.action)}</p></div>
    <p class="en-interpretation">Orientación pedagógica basada en tus respuestas y en los marcos citados; no es una calificación oficial. La vinculación con Agesic es una adaptación educativa de la Estrategia Nacional de IA 2024–2030.</p>`;
}

function renderPrincipleGraph(target, statusTarget, options = {}) {
  if (!target) return;
  const text = networkText();
  const nodes = construirEstadoDePrincipios().map(node => ({ ...node, active: !options.result && node.active }));
  const active = nodes.find(node => node.active);
  const priority = nodes.find(node => node.className === 'priority') || nodes.find(node => node.className === 'progress');
  const compact = target.clientWidth > 0 && target.clientWidth < 520;
  const layout = construirLayoutPrincipios(nodes, compact);
  const center = layout[0];
  if (!target.querySelector('.ethics-network')) crearPrincipleGraphSvg(target, nodes);
  target.dataset.networkLayout = compact ? 'compact' : 'wide';
  const svg = target.querySelector('.ethics-network');
  svg.setAttribute('viewBox', compact ? '0 0 360 492' : '0 0 720 460');
  svg.querySelector('title').textContent = text.title;
  target.querySelector('.en-hint').textContent = text.hint;
  const core = svg.querySelector('.en-core');
  core.setAttribute('transform', `translate(${center.cx} ${center.cy})`);
  core.querySelector('.en-core-disc').setAttribute('r', center.coreRadius);
  core.querySelector('.en-core-halo').setAttribute('r', center.coreRadius + 7);
  core.querySelector('.en-core-title').setAttribute('y', '-4');
  core.querySelector('.en-core-caption').setAttribute('y', '17');
  core.querySelector('.en-core-caption').textContent = text.core;

  if (target.dataset.activeCriterion !== (active?.id || '')) {
    delete target.dataset.selectedCriterion;
    target.dataset.activeCriterion = active?.id || '';
  }
  const selected = nodes.find(node => node.id === target.dataset.selectedCriterion) || active || priority || nodes[0];
  const selectNode = (node, pin = true) => {
    if (pin) target.dataset.selectedCriterion = node.id;
    target.querySelectorAll('.en-node').forEach(element => {
      const selectedHere = element.dataset.criterion === target.dataset.selectedCriterion;
      element.classList.toggle('is-selected', selectedHere);
      element.classList.toggle('is-preview', element.dataset.criterion === node.id);
      element.setAttribute('aria-pressed', String(selectedHere));
    });
    target.querySelectorAll('.en-link').forEach(link => link.classList.toggle('is-preview', link.dataset.criterion === node.id));
    const detailKey = JSON.stringify([state.lang, node.id, node.status, node.responses]);
    if (target._networkDetailKey !== detailKey) {
      target._networkDetailKey = detailKey;
      renderNetworkEvidence(target, node);
      const detail = target.querySelector('.en-detail');
      if (detail.animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        detail.animate([{ opacity: .55 }, { opacity: 1 }], { duration: 180 });
      }
    }
  };
  const oldEvidence = target._networkEvidence || {};
  const nextEvidence = {};
  layout.forEach(node => {
    const element = target.querySelector(`.en-node[data-criterion="${node.id}"]`);
    const link = target.querySelector(`.en-link[data-criterion="${node.id}"]`);
    element.setAttribute('class', `en-node ${node.className}${node.active ? ' is-current' : ''}`);
    element.setAttribute('transform', `translate(${node.x} ${node.y})`);
    element.setAttribute('aria-label', `${node.label}: ${node.status}. ${text.signals(node.steps)}`);
    element.querySelector('.en-disc').setAttribute('r', node.radius);
    element.querySelector('.en-halo').setAttribute('r', node.radius + 5);
    element.querySelector('.en-label').textContent = node.short;
    element.querySelector('.en-status').textContent = node.status;
    element.querySelector('.en-count').textContent = node.steps ? text.signals(node.steps) : text.pending;
    const latest = node.responses[node.responses.length - 1];
    element.querySelector('title').textContent = `${node.label}: ${node.feedback} ${latest ? `Respondiste «${latest.answer}» a: ${latest.question}. ` : ''}${ETHICAL_FRAMEWORK_GUIDANCE[node.id].basis}`;
    link.setAttribute('d', construirRutaNeuronal(node));
    link.setAttribute('class', `en-link ${node.className}${node.active ? ' is-current' : ''}`);
    const signature = JSON.stringify(node.responses.map(response => [response.id, response.answerKey]));
    nextEvidence[node.id] = signature;
    if (oldEvidence[node.id] !== undefined && oldEvidence[node.id] !== signature) {
      element.classList.add('en-updated');
      link.classList.add('en-updated');
    }
    element.onanimationend = () => element.classList.remove('en-updated');
    link.onanimationend = () => link.classList.remove('en-updated');
    element.onmouseenter = () => selectNode(node, false);
    element.onfocus = () => selectNode(node, false);
    element.onclick = () => selectNode(node);
    element.onkeydown = event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        selectNode(node);
      } else if (event.key === 'Escape') {
        selectNode(nodes.find(item => item.id === target.dataset.selectedCriterion) || selected);
      }
    };
  });
  selectNode(selected);
  target._networkEvidence = nextEvidence;
  target.onmouseleave = () => {
    if (!target.contains(document.activeElement)) selectNode(nodes.find(node => node.id === target.dataset.selectedCriterion) || selected);
  };
  if (statusTarget) {
    statusTarget.textContent = active ? `${text.current}: ${active.label}`
      : options.result && priority ? `${text.focus}: ${priority.label}`
      : text.touched(nodes.filter(node => node.steps > 0).length);
  }

  // Reflow the topology only when crossing the narrow/wide threshold.
  if (!target._networkResize) {
    target._networkResize = () => {
      if (!target.clientWidth) return;
      const mode = target.clientWidth < 520 ? 'compact' : 'wide';
      if (target.dataset.networkLayout !== mode) renderPrincipleGraph(target, statusTarget, options);
    };
    if (typeof ResizeObserver !== 'undefined') {
      target._networkObserver = new ResizeObserver(target._networkResize);
      target._networkObserver.observe(target);
    } else {
      window.addEventListener('resize', target._networkResize);
    }
  }
}
