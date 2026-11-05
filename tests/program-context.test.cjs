const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');

const root = path.join(__dirname, '..');

function loadProgramContext(url) {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', {
    url,
    runScripts: 'outside-only',
  });
  const context = dom.getInternalVMContext();
  vm.runInContext(fs.readFileSync(path.join(root, 'storage.js'), 'utf8'), context, { filename: 'storage.js' });
  vm.runInContext(fs.readFileSync(path.join(root, 'program-context.js'), 'utf8'), context, { filename: 'program-context.js' });
  return dom;
}

test('program context accepts only a catalog program and reuses a local pseudonymous participant', () => {
  const url = 'https://example.test/?program=uy-us-ai-literacy-2027&cohort=centro_norte&phase=baseline';
  const dom = loadProgramContext(url);
  const first = dom.window.ProgramContext.current;
  const second = dom.window.ProgramContext.read(url);

  assert.equal(first.active, true);
  assert.equal(first.cohortCode, 'centro_norte');
  assert.equal(first.measurementPhase, 'baseline');
  assert.match(first.participantId, /^p-[a-z0-9-]+$/);
  assert.equal(second.participantId, first.participantId);
  assert.equal(Object.isFrozen(first), true);
  dom.window.close();

  const invalidDom = loadProgramContext('https://example.test/?program=unknown&cohort=x&phase=final');
  assert.equal(invalidDom.window.ProgramContext.current.active, false);
  assert.equal(invalidDom.window.ProgramContext.current.participantId, '');
  invalidDom.window.close();
});

const workerSource = fs.readFileSync(path.join(root, 'worker-d1.js'), 'utf8')
  .replace('export default {', 'const worker = {')
  .concat('\nthis.worker = worker;');
const workerContext = vm.createContext({
  console: { log() {}, warn() {}, error() {} },
  Request,
  Response,
  Headers,
  URL,
  TextEncoder,
  TextDecoder,
  Uint8Array,
  DataView,
  Date,
  JSON,
  Object,
  Array,
  Number,
  String,
  Boolean,
  RegExp,
  Math,
  Promise,
  Set,
  Map,
  fetch: async () => { throw new Error('unexpected network request'); },
});
vm.runInContext(workerSource, workerContext, { filename: 'worker-d1.js' });

function captureDatabase() {
  const writes = [];
  return {
    writes,
    prepare(sql) {
      let bindings = [];
      return {
        bind(...values) {
          bindings = values;
          return this;
        },
        async run() {
          writes.push({ sql, bindings });
          return { meta: { last_row_id: 41 } };
        },
      };
    },
    async batch(statements) {
      writes.push({ sql: 'BATCH', bindings: statements });
      return [];
    },
  };
}

function completion(overrides = {}) {
  return {
    eventType: 'completion',
    sessionId: 'session-1',
    profile: 'docente',
    profileKey: 'docente',
    country: 'Uruguay',
    countryCode: 'uy',
    nivelEducativo: 'Enseñanza media',
    familiaridadInicial: 'Inicial',
    recursosSimilares: 'No',
    consentTracking: true,
    evidence: 65,
    likertLevel: 'Prácticas consolidadas',
    path: [{ id: 'g1', question: '¿Verificás?', answer: 'Sí' }],
    programCode: 'uy-us-ai-literacy-2027',
    cohortCode: 'liceo-01',
    measurementPhase: 'baseline',
    participantId: 'p-abc123',
    ...overrides,
  };
}

test('worker persists complete program metadata with a consented result', async () => {
  const DB = captureDatabase();
  const response = await workerContext.worker.fetch(new Request('https://example.test/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(completion({
      literacyScore: 85,
      literacyAnswers: { version: 'lit-v1', k: { k1: 'a' } }
    })),
  }), { DB });

  assert.equal(response.status, 200);
  const eventInsert = DB.writes.find(write => write.sql.includes('INSERT INTO events'));
  assert.ok(eventInsert);
  assert.equal(eventInsert.bindings[10], 'uy-us-ai-literacy-2027');
  assert.equal(eventInsert.bindings[11], 'liceo-01');
  assert.equal(eventInsert.bindings[12], 'baseline');
  assert.equal(eventInsert.bindings[13], 'p-abc123');
  assert.equal(eventInsert.bindings[21], 85);
  assert.match(eventInsert.bindings[22], /"lit-v1"/);
});

test('worker rejects partial program metadata instead of creating unusable measurements', async () => {
  const DB = captureDatabase();
  const response = await workerContext.worker.fetch(new Request('https://example.test/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(completion({ participantId: '' })),
  }), { DB });

  assert.equal(response.status, 400);
  assert.equal(DB.writes.length, 0);
  assert.match((await response.json()).error, /Contexto de programa incompleto/);
});
