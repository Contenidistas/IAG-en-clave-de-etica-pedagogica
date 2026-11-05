const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { JSDOM, VirtualConsole } = require('jsdom');

const root = path.join(__dirname, '..');

test('admin country filter includes the shared catalog and legacy data countries', async t => {
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', error => errors.push(error.message));
  const dom = new JSDOM(fs.readFileSync(path.join(root, 'admin.html'), 'utf8'), {
    url: 'http://localhost/admin',
    runScripts: 'outside-only',
    pretendToBeVisual: true,
    virtualConsole,
  });
  t.after(() => dom.window.close());

  const w = dom.window;
  w.sessionStorage.setItem('iag-admin-key', 'test-key');
  w.fetch = async url => {
    const pathname = new URL(url).pathname;
    const payload = pathname.endsWith('/summary')
      ? { summary: {}, admin: {}, insight: {}, updatedAt: '2026-10-30T18:00:00Z' }
      : pathname.endsWith('/completions')
        ? { completions: [{ id: 1, country: 'Islandia', profile: 'docente', evidence: 72, answersCount: 8, programCode: 'uy-us-ai-literacy-2027', cohortCode: 'liceo-01', measurementPhase: 'baseline' }] }
        : { feedback: [{ id: 2, country: 'Canadá', rating: 5, programCode: 'uy-us-ai-literacy-2027', cohortCode: 'liceo-01', measurementPhase: 'baseline' }] };
    return { ok: true, status: 200, json: async () => payload };
  };

  for (const file of ['country-context.js', 'admin-analysis.js', 'admin-inference.js', 'admin.js']) {
    vm.runInContext(
      fs.readFileSync(path.join(root, file), 'utf8'),
      dom.getInternalVMContext(),
      { filename: file },
    );
  }
  await new Promise(resolve => setTimeout(resolve, 50));

  const values = Array.from(w.document.querySelector('#countryFilter').options, option => option.value);
  assert.equal(values[0], '');
  assert.ok(values.includes('Argentina'), 'includes countries without current records');
  assert.ok(values.includes('Uruguay'), 'includes the shared catalog');
  assert.ok(values.includes('Islandia'), 'preserves countries already present in historical data');
  assert.ok(!values.includes('Otro'), 'does not expose the generic custom-country sentinel');
  assert.equal(w.document.querySelector('#programFilter').options[1].value, 'uy-us-ai-literacy-2027');
  assert.equal(w.document.querySelector('#phaseFilter').options[1].textContent, 'Diagnóstico inicial');

  w.document.querySelector('[data-tab="analysis"]').click();
  assert.equal(w.document.querySelector('#analysisView').classList.contains('hidden'), false);
  assert.equal(w.document.querySelector('#analysisSampleSize').textContent, '1');
  assert.ok(w.document.querySelector('#analysisChart svg'), 'renders an analysis chart with the filtered admin data');
  assert.equal(w.document.querySelector('#analysisDimension').value, 'country');
  assert.equal(w.document.querySelector('#analysisCompare').value, 'profile');
  const chartType = w.document.querySelector('#analysisChartType');
  chartType.value = 'scatter';
  chartType.dispatchEvent(new w.Event('change', { bubbles: true }));
  assert.equal(w.document.querySelector('#analysisXAxisControl').classList.contains('hidden'), false);
  assert.equal(w.document.querySelector('#analysisYAxisControl').classList.contains('hidden'), false);
  assert.ok(w.document.querySelector('#analysisChart svg title').textContent.includes('según'));

  w.document.querySelector('[data-tab="inference"]').click();
  assert.equal(w.document.querySelector('#inferenceView').classList.contains('hidden'), false);
  assert.equal(w.document.querySelector('#inferenceSampleSize').textContent, '1');
  assert.equal(w.document.querySelector('#inferenceEmpty').classList.contains('hidden'), false);
  assert.equal(w.document.querySelector('#exportInferencePngBtn').disabled, true);
  assert.deepEqual(errors, [], 'the admin must initialize without runtime errors');
});
