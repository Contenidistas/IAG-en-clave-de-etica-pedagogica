const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

// Exercise the real request flow with controlled network responses and clocks.
const source = fs.readFileSync(path.join(__dirname, '../chatbot-component.js'), 'utf8');
const requestCode = source.slice(source.indexOf('  const requestText ='), source.indexOf('  const openChatbot ='));

function harness(fetch) {
  const messages = [];
  const timers = new Map();
  let timerId = 0;
  function node() {
    return {
      children: [], parentNode: true,
      setAttribute() {},
      appendChild(child) { this.children.push(child); },
      replaceChildren(...children) { this.children = children; },
      addEventListener(event, callback) { this[event] = callback; },
      remove() { this.parentNode = null; },
      querySelector() { return this; }
    };
  }
  const el = { input: { value: '', focus() {} }, send: {} };
  const window = {
    state: { lang: 'es' },
    setTimeout(callback, ms) { timers.set(++timerId, { callback, ms }); return timerId; },
    clearTimeout(id) { timers.delete(id); }
  };
  const context = vm.createContext({
    window, el, AbortController, fetch, CHAT_ENDPOINT: '/chat',
    document: { createElement: node }, localStorage: { getItem() { return null; } },
    console: { error() {} }, debugLog() {},
    buildQuestionContext() { return {}; }, buildWorkerMessage(message) { return message; },
    addMessage(content, type, save = true) {
      const message = Object.assign(node(), { content, type, save });
      messages.push(message);
      return message;
    }
  });
  vm.runInContext('let isTyping = false; let isOpen = true;\n' + requestCode, context);
  return {
    send: window.sendMessage, messages, timers, el,
    fire(ms) { for (const timer of [...timers.values()]) if (timer.ms === ms) timer.callback(); }
  };
}
const success = () => ({ ok: true, json: async () => ({ ok: true, reply: 'Una respuesta útil.' }) });
const abortError = () => Object.assign(new Error('Aborted'), { name: 'AbortError' });
const tick = () => new Promise(resolve => setImmediate(resolve));

test('long question context does not make a valid user message exceed the API limit', () => {
  const context = vm.createContext({});
  vm.runInContext(source.slice(source.indexOf('  const userAsksAboutCurrentQuestion ='), source.indexOf('  const requestText =')) + '\nthis.build = buildWorkerMessage;', context);
  const message = 'Explicame esta pregunta';
  assert.equal(context.build(message, { preguntaActual: { pregunta: 'Pregunta '.repeat(200), ayuda: 'Ayuda' } }), message);
});

test('suggestions prompt stays within the API limit even for a long completed journey', () => {
  const game = fs.readFileSync(path.join(__dirname, '../juego-ia.js'), 'utf8');
  const start = game.indexOf('function generarMensajeAutomaticoDeConsejos()');
  const end = game.indexOf('/* ========================================', start);
  const context = vm.createContext({
    CONFIG: { likert: [{ min: 0, max: 100, id: 'Intermedio' }] },
    state: { evidence: 50, path: Array.from({ length: 30 }, () => ({ answerKey: 'no', question: 'Una pregunta larga '.repeat(20) })) },
    console
  });
  vm.runInContext(game.slice(start, end), context);
  const prompt = context.generarMensajeAutomaticoDeConsejos();
  assert.ok(prompt.length > 0 && prompt.length <= 800);
  assert.match(prompt, /3 sugerencias/);
});

test('a slow reply succeeds without a timeout message or leftover timers', async () => {
  let resolve;
  const h = harness(() => new Promise(done => { resolve = done; }));
  const pending = h.send('Sugerencias');
  await h.send('Duplicado');
  h.fire(12000);
  assert.match(h.messages[1].children[0].textContent, /Sigo esperando/);
  assert.equal(h.messages.filter(m => m.type === 'user').length, 1);
  resolve(success());
  await pending;
  assert.equal(h.messages.at(-1).content, 'Una respuesta útil.');
  assert.equal(h.timers.size, 0);
  assert.equal(h.el.input.disabled, false);
});

test('deadline also covers a stalled response body', async () => {
  const h = harness(async (_url, { signal }) => ({
    ok: true,
    json: () => new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(abortError())))
  }));
  const pending = h.send('Consulta');
  await tick();
  h.fire(60000);
  await pending;
  assert.match(h.messages.at(-1).content, /a tiempo/);
  assert.equal(h.messages.at(-1).save, false);
  assert.equal(h.el.send.disabled, false);
  assert.equal(h.timers.size, 0);
});

test('cancelling aborts the request and retry preserves the question without duplicating it', async () => {
  let calls = 0;
  const h = harness((_url, { signal }) => {
    if (++calls > 1) return Promise.resolve(success());
    return new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(abortError())));
  });
  const pending = h.send('Mi consulta');
  h.messages[1].children.at(-1).click();
  await pending;
  const failure = h.messages.at(-1);
  assert.match(failure.content, /cancelada/);
  await failure.children.at(-1).click();
  assert.equal(failure.parentNode, null);
  assert.equal(h.messages.filter(m => m.type === 'user').length, 1);
  assert.equal(h.messages.at(-1).content, 'Una respuesta útil.');
  assert.equal(h.timers.size, 0);
});

for (const [name, response] of [
  ['HTTP failure', { ok: false, status: 503, json: async () => ({}) }],
  ['empty reply', { ok: true, json: async () => ({ ok: true, reply: '  ' }) }],
  ['invalid JSON', { ok: true, json: async () => { throw new SyntaxError('Invalid JSON'); } }]
]) {
  test(`${name} offers retry and restores input`, async () => {
    const h = harness(async () => response);
    await h.send('Consulta');
    assert.match(h.messages.at(-1).content, /No pude/);
    assert.equal(h.messages.at(-1).children.at(-1).textContent, 'Reintentar');
    assert.equal(h.messages.at(-1).save, false);
    assert.equal(h.el.input.disabled, false);
    assert.equal(h.timers.size, 0);
  });
}
