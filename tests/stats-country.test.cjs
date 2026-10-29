const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../worker-d1.js'), 'utf8')
  .replace('export default {', 'const worker = {')
  .concat('\nthis.worker = worker;');
const context = vm.createContext({
  console,
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
  fetch: async () => { throw new Error('unexpected network request'); }
});
vm.runInContext(source, context, { filename: 'worker-d1.js' });

const knownCodes = new Set(['uy', 'do', 'co', 'ar', 'bo', 'br', 'cl', 'cr', 'cu', 'ec', 'sv', 'gt', 'hn', 'mx', 'ni', 'pa', 'py', 'pe', 'pr', 've', 'ca', 'es', 'us', 'pt', 'other']);

function database({ colombia = 10, uruguay = 2 } = {}) {
  const events = [];
  const answers = [];
  let id = 0;

  function addCountry(count, country, countryCode) {
    for (let index = 0; index < count; index++) {
      const eventId = ++id;
      events.push({
        id: eventId,
        event_type: 'completion',
        session_id: `${countryCode}-${index}`,
        country,
        country_code: countryCode === 'co' && index === 0 ? null : countryCode,
        evidence: 50 + index,
        likert_level: index % 2 ? 'Desarrollo progresivo' : 'En proceso inicial',
        profile: index < 6 ? 'docente' : 'estudiante',
        nivel_educativo: 'Educación media'
      });
      answers.push({ event_id: eventId, question: '¿Verificás la información con fuentes confiables?', answer: 'No' });
    }
  }

  addCountry(colombia, 'Colombia', 'co');
  addCountry(uruguay, 'Uruguay', 'uy');
  events.push({ id: ++id, event_type: 'visit', session_id: 'visit-co', country: 'Colombia', country_code: 'co' });

  function scoped(sql, bindings) {
    if (!sql.includes('country_code = ?')) return events;
    const code = bindings.find(value => knownCodes.has(value));
    const name = code === 'co' ? 'Colombia' : code === 'uy' ? 'Uruguay' : '';
    return events.filter(event => event.country_code === code || (!event.country_code && event.country === name));
  }

  return {
    prepare(sql) {
      let bindings = [];
      return {
        bind(...values) {
          bindings = values;
          return this;
        },
        async first() {
          const rows = scoped(sql, bindings);
          const completions = rows.filter(row => row.event_type === 'completion');
          const visits = rows.filter(row => row.event_type === 'visit');
          return {
            visits: new Set(visits.map(row => row.session_id)).size,
            pageViews: visits.length,
            completed: completions.length,
            feedback: rows.filter(row => row.event_type === 'feedback').length,
            averageScore: completions.length
              ? completions.reduce((sum, row) => sum + row.evidence, 0) / completions.length
              : null
          };
        },
        async all() {
          const rows = scoped(sql, bindings);
          if (sql.includes('SELECT a.question')) {
            const ids = new Set(rows.filter(row => row.event_type === 'completion').map(row => row.id));
            return { results: answers.filter(answer => ids.has(answer.event_id) && ['No', 'A veces'].includes(answer.answer)).map(answer => ({ question: answer.question })) };
          }

          const column = sql.match(/SELECT\s+([a-z_]+)\s+AS label/i)?.[1];
          const counts = new Map();
          rows.filter(row => row.event_type === 'completion' && row[column]).forEach(row => {
            counts.set(row[column], (counts.get(row[column]) || 0) + 1);
          });
          return {
            results: [...counts].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count)
          };
        }
      };
    }
  };
}

async function stats(url, DB) {
  const response = await context.worker.fetch(new Request(url), { DB });
  return { response, body: await response.json() };
}

test('country statistics stay unpublished below the privacy threshold', async () => {
  const { response, body } = await stats('https://example.test/stats?country=co&countryName=Colombia', database({ colombia: 9 }));
  assert.equal(response.status, 200);
  assert.equal(body.scope.type, 'country');
  assert.equal(body.scope.countryCode, 'co');
  assert.equal(body.scope.available, false);
  assert.equal(body.scope.minSampleSize, 10);
  assert.equal('summary' in body, false);
});

test('country statistics include legacy named rows and suppress buckets below five', async () => {
  const { body } = await stats('https://example.test/stats?country=co&countryName=Colombia', database({ colombia: 10 }));
  assert.equal(body.scope.available, true);
  assert.equal(body.summary.completed, 10);
  assert.equal(body.summary.visits, 1);
  assert.deepEqual(body.profiles.map(row => [row.label, row.count]), [['docente', 6]]);
  assert.deepEqual(body.levels.map(row => row.count).sort(), [5, 5]);
  assert.equal(body.education[0].count, 10);
  assert.equal(body.indicators[0].count, 10);
});

test('the global statistics layer remains available without a country filter', async () => {
  const { body } = await stats('https://example.test/stats', database({ colombia: 9, uruguay: 2 }));
  assert.equal(body.scope.type, 'global');
  assert.equal(body.scope.available, true);
  assert.equal(body.summary.completed, 11);
  assert.ok(body.profiles.some(row => row.count < 5), 'global buckets are not country-suppressed');
});
