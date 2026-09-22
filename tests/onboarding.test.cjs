const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { JSDOM, VirtualConsole } = require('jsdom');
const root = path.join(__dirname, '..');

test('case suggestions use explicit applicable evidence and distinguish practice from context', async t => {
  const { w } = await app(t);
  w.state.profileKey = 'estudiante_media';
  for (const path of [[], [{ id: 'em1', answerKey: 'no' }], [{ id: 'g1', answerKey: 'na' }]]) {
    w.state.path = path;
    assert.equal(w.recomendarCasoDelRecorrido(), null);
  }
  w.state.profileKey = 'docente';
  w.state.path = [{ id: 'g1', answerKey: 'no' }, { id: 'g2', answerKey: 'yes' }];
  assert.equal(w.recomendarCasoDelRecorrido().caso.id, 'sesgos');
  assert.equal(w.recomendarCasoDelRecorrido().axis, 'verificacion');
  w.state.path = [{ id: 'g2', answerKey: 'sometimes' }];
  assert.equal(w.recomendarCasoDelRecorrido().caso.id, 'equidad');
  w.state.path = [{ id: 'g3', answerKey: 'yes' }];
  w.renderizarCasoRecomendado();
  assert.match(w.document.querySelector('#recommendedCase').textContent, /Para profundizar/);
});

test('a recommended case opens and returns inline without changing the student journey', async t => {
  const { w, $, click } = await app(t);
  w.state.profile = 'estudiante';
  w.state.profileKey = 'estudiante_media';
  w.state.country = 'Argentina';
  w.state.path = [{ id: 'g1', answerKey: 'no', answer: 'No' }];
  const snapshot = JSON.stringify(w.state);
  w.renderizarCasoRecomendado();
  assert.equal($('#recommendedCase').hidden, false);
  click('[data-open-recommended]');
  assert.ok($('#recommendedCase .active-case-player'));
  assert.equal(JSON.stringify(w.state), snapshot);
  click('#recommendedCase #btnCloseCase');
  assert.equal($('#recommendedCase .active-case-player'), null);
  assert.equal(w.document.activeElement, $('[data-open-recommended]'));
  assert.equal(JSON.stringify(w.state), snapshot);
  click('[data-open-recommended]');
  click('#recommendedCase [data-option="B"]');
  click('#recommendedCase #btnMantenerDecision');
  assert.equal($('#recommendedCase #btnFinishCase').textContent, 'Volver a mi resultado');
  click('#recommendedCase #btnFinishCase');
  assert.equal($('#recommendedCase .active-case-player'), null);
  assert.equal(JSON.stringify(w.state), snapshot);
  w.state.path = [];
  w.renderizarCasoRecomendado();
  assert.equal($('#recommendedCase').hidden, true);
});

async function app(t, { blockedStorage = false } = {}) {
  const errors = [];
  const console = new VirtualConsole();
  console.on('jsdomError', error => errors.push(error.message));
  const dom = new JSDOM(fs.readFileSync(path.join(root, 'index.html'), 'utf8'), {
    url: 'http://localhost/', runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole: console
  });
  t.after(() => dom.window.close());
  const w = dom.window;
  if (blockedStorage) {
    for (const name of ['localStorage', 'sessionStorage']) {
      Object.defineProperty(w, name, { get() { throw new Error('Storage blocked'); } });
    }
  }
  w.matchMedia = () => ({ matches: true, addEventListener() {} });
  w.scrollTo = () => {};
  w.HTMLElement.prototype.scrollIntoView = () => {};
  w.fetch = async () => ({ ok: true, json: async () => ({ summary: {}, opinions: [], profiles: [], countries: [], levels: [] }) });
  for (const file of ['storage.js', 'configuracion-ia.js', 'ethical-evidence.js', 'ui-ia.js', 'principle-network.js', 'juego-ia.js', 'chatbot-component.js']) {
    vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), dom.getInternalVMContext(), { filename: file });
  }
  await new Promise(resolve => setTimeout(resolve, 150));
  assert.deepEqual(errors, [], 'the app must initialize without runtime errors');
  const $ = selector => w.document.querySelector(selector);
  const click = selector => $(selector).click();
  const change = (selector, value) => {
    $(selector).value = value;
    $(selector).dispatchEvent(new w.Event('change', { bubbles: true }));
  };
  click('#landingGoToDiagnostic');
  return { w, $, click, change };
}

test('profile selection is accessible and preserves a valid level on reselection', async t => {
  const { w, $, click, change } = await app(t);
  click('[data-profile="docente"]');
  assert.equal($('[data-profile="docente"]').getAttribute('aria-pressed'), 'true');
  assert.equal($('[data-profile="docente"]').tagName, 'BUTTON');
  click('#onboardingNextBtn');
  assert.equal(w.state.onboardingStep, 1);
  const level = $('#nivelEducativo').options[1].value;
  change('#nivelEducativo', level);
  click('#onboardingBackBtn');
  click('[data-profile="docente"]');
  click('#onboardingNextBtn');
  assert.equal($('#nivelEducativo').value, level);
  assert.equal($('#nextSlide').classList.contains('hidden'), true);
});

test('other country is required and changing to a specialized profile never requests a level', async t => {
  const { w, $, click, change } = await app(t);
  click('[data-profile="especializado"]');
  click('#onboardingNextBtn');
  assert.equal($('#nivelEducativoWrapper').classList.contains('active'), false);
  change('#countrySelect', 'Otro');
  click('#onboardingNextBtn');
  assert.equal(w.state.onboardingStep, 1);
  assert.equal($('#startGuidance').hidden, false);
  $('#countryOther').value = 'Costa Rica';
  $('#countryOther').dispatchEvent(new w.Event('input', { bubbles: true }));
  click('#onboardingNextBtn');
  assert.equal(w.state.onboardingStep, 2);
});

test('all three profiles can reach the questionnaire without consent or another mode dialog', async t => {
  for (const profile of ['estudiante', 'docente', 'especializado']) {
    const { $, click, change } = await app(t);
    click(`[data-profile="${profile}"]`);
    click('#onboardingNextBtn');
    if (profile !== 'especializado') change('#nivelEducativo', $('#nivelEducativo').options[1].value);
    click('#onboardingNextBtn');
    change('#familiaridadInicial', $('#familiaridadInicial').options[1].value);
    click('input[name="recursosSimilares"][value="No"]');
    click('#onboardingNextBtn');
    assert.equal($('#consentTracking').checked, false);
    assert.equal($('#screenGame').classList.contains('hidden'), false, profile);
    assert.equal($('#modalOverlay').classList.contains('hidden'), true, profile);
  }
});

test('changing language preserves the education level and updates setup copy', async t => {
  const { $, click, change } = await app(t);
  click('[data-profile="docente"]');
  click('#onboardingNextBtn');
  change('#nivelEducativo', $('#nivelEducativo').options[1].value);
  const levelKey = $('#nivelEducativo').selectedOptions[0].dataset.levelKey;
  change('#languageSelect', 'en');
  assert.equal($('#nivelEducativo').selectedOptions[0].dataset.levelKey, levelKey);
  assert.equal($('#onboardingNextBtn').textContent, 'Continue');
  assert.equal($('#familiaridadInicial').style.display, '');
});

test('back from the first step returns home; hidden slides cannot receive keyboard focus', async t => {
  const { w, $, click } = await app(t);
  assert.equal($('#carouselTrack').children[0].inert, true);
  click('#onboardingBackBtn');
  assert.equal(w.state.currentSlide, 0);
  assert.equal($('#carouselTrack').children[1].inert, true);
});

test('blocked storage does not prevent setup, preferences or chatbot initialization', async t => {
  const { w, $, click, change } = await app(t, { blockedStorage: true });
  click('[data-profile="estudiante"]');
  click('#onboardingNextBtn');
  change('#languageSelect', 'pt');
  assert.equal($('#onboardingNextBtn').textContent, 'Continuar');
  assert.ok($('#chatbotToggle'));
  w.appStorage.session.setItem('test', 'saved in memory');
  assert.equal(w.appStorage.session.getItem('test'), 'saved in memory');
  w.appStorage.session.removeItem('test');
  assert.equal(w.appStorage.session.getItem('test'), null);
});

test('landing cards respond to keyboard activation', async t => {
  const { w, $, click } = await app(t);
  click('#onboardingBackBtn');
  $('#landingGoToDiagnostic').dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  assert.equal(w.state.currentSlide, 1);
});

test('student routing is stable when educational labels are translated', async t => {
  const { w, $, click, change } = await app(t);
  click('[data-profile="estudiante"]');
  click('#onboardingNextBtn');
  change('#nivelEducativo', $('#nivelEducativo').options[1].value);
  change('#languageSelect', 'en');
  click('#onboardingNextBtn');
  change('#familiaridadInicial', $('#familiaridadInicial').options[1].value);
  click('input[name="recursosSimilares"][value="No"]');
  click('#onboardingNextBtn');
  assert.equal(w.state.profileKey, 'estudiante_media');
});

test('the case laboratory remains reachable directly from home', async t => {
  const { w, click } = await app(t);
  click('#onboardingBackBtn');
  click('#landingGoToCases');
  click('#btnConfirmDocenteProfile');
  assert.equal(w.document.body.classList.contains('laboratorio-active'), true);
});

test('new styles parse, element IDs are unique, and every cached asset exists', async t => {
  const { w } = await app(t);
  const style = w.document.createElement('style');
  style.textContent = fs.readFileSync(path.join(root, 'experience.css'), 'utf8');
  w.document.head.appendChild(style);
  assert.ok(style.sheet.cssRules.length > 40);
  const ids = [...w.document.querySelectorAll('[id]')].map(node => node.id);
  assert.equal(new Set(ids).size, ids.length);
  const serviceWorker = fs.readFileSync(path.join(root, 'service-worker.js'), 'utf8');
  const assets = vm.runInNewContext(serviceWorker.match(/const CORE_ASSETS = (\[[\s\S]*?\]);/)[1]);
  for (const asset of assets) assert.ok(fs.existsSync(path.join(root, asset)), asset);
});

test('combined styles keep the setup stepper in a padded three-column grid', async t => {
  const { w, $ } = await app(t);
  for (const file of ['styles.css', 'experience.css']) {
    const style = w.document.createElement('style');
    style.textContent = fs.readFileSync(path.join(root, file), 'utf8');
    w.document.head.appendChild(style);
  }
  const steps = w.getComputedStyle($('#onboardingDots'));
  assert.equal(steps.display, 'grid');
  assert.equal(steps.gridTemplateColumns, 'repeat(3, minmax(0, 1fr))');
  const panel = w.getComputedStyle($('#onboardingProgress'));
  assert.ok(parseFloat(panel.paddingLeft) > 0);
  assert.ok(parseFloat(panel.paddingTop) > 0);
  for (const card of w.document.querySelectorAll('.profile-choice')) {
    assert.equal(card.querySelectorAll('svg').length, 1);
    assert.equal(card.matches('.chip'), false);
    assert.equal(card.closest('.chips-container'), null);
  }
  assert.equal($('#onboardingProgress').closest('.intro-slide'), null);
});

test('both graphs have visible-paint nodes, independent IDs and keyboard details', async t => {
  const { w, $ } = await app(t);
  w.renderPrincipleGraph($('#principleGraph'), null);
  w.renderPrincipleGraph($('#principleResultGraph'), null, { result: true });
  for (const id of ['principleGraph', 'principleResultGraph']) {
    const graph = $(`#${id}`);
    assert.equal(graph.querySelectorAll('.en-node').length, 5);
    assert.equal(graph.querySelectorAll('.en-link').length, 5);
    assert.equal(graph.querySelectorAll('defs, filter, linearGradient, radialGradient').length, 0);
    const node = graph.querySelectorAll('.en-node')[3];
    node.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    assert.equal(node.getAttribute('aria-pressed'), 'true');
    assert.match(graph.querySelector('.en-detail strong').textContent, /equidad/i);
  }
  const ids = [...w.document.querySelectorAll('[id]')].map(node => node.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('wide and compact network layouts keep all circles within bounds without overlaps', async t => {
  const { w, $ } = await app(t);
  const nodes = w.construirEstadoDePrincipios();
  for (const compact of [false, true]) {
    const width = compact ? 360 : 720;
    const height = compact ? 492 : 460;
    const layout = w.construirLayoutPrincipios(nodes, compact);
    for (let i = 0; i < layout.length; i++) {
      const node = layout[i];
      const radius = node.radius + 7;
      assert.ok(node.x - radius >= 0 && node.x + radius <= width);
      assert.ok(node.y - radius >= 0 && node.y + radius <= height);
      assert.ok(Math.hypot(node.x - node.cx, node.y - node.cy) > radius + node.coreRadius);
      for (const other of layout.slice(i + 1)) {
        assert.ok(Math.hypot(node.x - other.x, node.y - other.y) > radius + other.radius + 7);
      }
    }
    const graph = $('#principleGraph');
    Object.defineProperty(graph, 'clientWidth', { configurable: true, value: compact ? 340 : 720 });
    w.renderPrincipleGraph(graph, null);
    assert.equal(graph.querySelector('svg').getAttribute('viewBox'), `0 0 ${width} ${height}`);
  }
});

test('every questionnaire has explicit ethical mappings and same IDs can map differently', async t => {
  const { w } = await app(t);
  for (const profile of Object.values(w.CONFIG.perfiles)) {
    for (const [id, node] of Object.entries(profile.nodos)) {
      if (id === 'FIN') continue;
      assert.ok(node.ethicalEvidence?.axes.length, `${id} must have a reviewed association`);
      assert.ok(node.ethicalEvidence.reason);
    }
  }
  assert.equal(w.CONFIG.perfiles.docente.nodos.g3.ethicalEvidence.axes[0], 'transparencia');
  assert.equal(w.CONFIG.perfiles.estudiante_formacion.nodos.g3.ethicalEvidence.axes[0], 'agencia');
});

test('No aplica and contextual use questions never mark an axis aligned or priority', async t => {
  const { w } = await app(t);
  w.state.profileKey = 'estudiante_media';
  w.state.path = [{ id: 'em1', answerKey: 'no', answer: 'No' }];
  assert.equal(w.obtenerEstadoCriterio('agencia').className, 'pending');
  w.state.path = [{ id: 'g1', answerKey: 'na', answer: 'No aplica' }];
  assert.equal(w.obtenerEstadoCriterio('verificacion').className, 'pending');
  assert.equal(w.obtenerEstadoCriterio('privacidad').className, 'pending');
  w.state.path = [{ id: 'g1b', answerKey: 'yes', answer: 'Sí' }];
  assert.equal(w.obtenerEstadoCriterio('transparencia').className, 'done');
  assert.equal(w.obtenerEstadoCriterio('verificacion').className, 'pending');
});

test('a multi-axis answer updates both nodes; changing or removing it recomputes the evidence', async t => {
  const { w, $ } = await app(t);
  w.state.profileKey = 'docente';
  const graph = $('#principleGraph');
  w.renderPrincipleGraph(graph, null);
  w.state.path = [{ id: 'df2', question: w.CONFIG.perfiles.docente.nodos.df2.title, answerKey: 'no', answer: 'No' }];
  w.state.awaitingNext = true;
  w.renderPrincipleGraph(graph, null);
  for (const id of ['agencia', 'verificacion']) {
    const node = graph.querySelector(`.en-node[data-criterion="${id}"]`);
    assert.ok(node.classList.contains('priority'));
    assert.ok(node.classList.contains('is-current'));
    assert.ok(node.classList.contains('en-updated'));
  }
  w.state.path[0].answerKey = 'yes';
  w.state.path[0].answer = 'Sí';
  w.renderPrincipleGraph(graph, null);
  assert.equal(w.obtenerEstadoCriterio('agencia').className, 'done');
  assert.equal(w.obtenerEstadoCriterio('verificacion').className, 'done');
  w.state.path = [];
  w.renderPrincipleGraph(graph, null);
  assert.equal(w.obtenerEstadoCriterio('agencia').className, 'pending');
});

test('hover and focus show actual answers, rationale and primary-source links without HTML injection', async t => {
  const { w, $ } = await app(t);
  w.state.profileKey = 'docente';
  w.state.path = [{ id: 'g1', question: '<img src=x onerror=alert(1)> ¿Verificás?', answerKey: 'no', answer: 'No' }];
  const graph = $('#principleGraph');
  w.renderPrincipleGraph(graph, null);
  const verification = graph.querySelector('[role="button"][data-criterion="verificacion"]');
  verification.dispatchEvent(new w.MouseEvent('mouseenter'));
  assert.match(graph.querySelector('.en-detail').textContent, /1 respuesta «No»/);
  assert.match(graph.querySelector('.en-detail').textContent, /Contrastar una respuesta/);
  assert.equal(graph.querySelector('.en-detail img'), null);
  assert.ok(graph.querySelector('.en-source-links a[href*="anep.edu.uy"]'));
  const dataNode = graph.querySelector('[role="button"][data-criterion="privacidad"]');
  dataNode.dispatchEvent(new w.FocusEvent('focus'));
  assert.match(graph.querySelector('.en-detail').textContent, /no hay respuestas/);
  assert.ok(graph.querySelector('.en-source-links a[href*="unesco.org"]'));
  for (const [axis, principle] of Object.entries({ transparencia: 6, verificacion: 8, privacidad: 5, equidad: 4, agencia: 3 })) {
    graph.querySelector(`[role="button"][data-criterion="${axis}"]`).dispatchEvent(new w.FocusEvent('focus'));
    const link = graph.querySelector('.en-source-links a[href*="gub.uy"]');
    assert.ok(link, `Agesic source must be reachable for ${axis}`);
    assert.match(link.textContent, new RegExp(`Principio ${principle}`));
    assert.match(graph.querySelector('.en-agesic').textContent, /Agesic/);
    assert.match(graph.querySelector('.en-interpretation').textContent, /adaptación educativa/);
  }
  assert.equal(w.obtenerEstadoCriterio('privacidad').className, 'pending');
});
