const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');

const root = path.join(__dirname, '..');

function inferenceApi(t) {
  const dom = new JSDOM('', { url: 'http://localhost/', runScripts: 'outside-only' });
  t.after(() => dom.window.close());
  vm.runInContext(
    fs.readFileSync(path.join(root, 'admin-inference.js'), 'utf8'),
    dom.getInternalVMContext(),
    { filename: 'admin-inference.js' },
  );
  return dom.window.AdminInference;
}

function contingencyRows(counts) {
  const rows = [];
  counts.forEach((row, rowIndex) => row.forEach((count, columnIndex) => {
    for (let index = 0; index < count; index += 1) {
      rows.push({ country: `País ${rowIndex + 1}`, profileKey: `Perfil ${columnIndex + 1}` });
    }
  }));
  return rows;
}

test('inferential association calculates chi-square and corrected Cramer V', t => {
  const api = inferenceApi(t);
  const result = api.association(contingencyRows([[20, 10], [10, 20]]), {
    source: 'completions',
    variableA: 'country',
    variableB: 'profile',
  });

  assert.equal(result.valid, true);
  assert.equal(result.method, 'chi-square');
  assert.ok(Math.abs(result.chiSquare - 6.6666667) < 1e-6);
  assert.ok(Math.abs(result.pValue - 0.0098233) < 1e-5);
  assert.ok(result.effect > 0.25 && result.effect < 0.35);
  assert.equal(result.exportRows.length, 4);
});

test('sparse 2 by 2 association automatically uses bilateral Fisher exact test', t => {
  const api = inferenceApi(t);
  const result = api.association(contingencyRows([[1, 9], [11, 3]]), {
    source: 'completions',
    variableA: 'country',
    variableB: 'profile',
  });

  assert.equal(result.valid, true);
  assert.equal(result.method, 'fisher');
  assert.ok(Math.abs(result.pValue - 0.00275946) < 1e-6);
  assert.match(result.methodLabel, /Fisher/);
});

test('larger sparse tables use a deterministic Monte Carlo estimate', t => {
  const api = inferenceApi(t);
  const rows = contingencyRows([[3, 1, 0], [0, 3, 1], [1, 0, 3]]);
  const first = api.association(rows, {
    source: 'completions',
    variableA: 'country',
    variableB: 'profile',
    iterations: 400,
  });
  const second = api.association(rows, {
    source: 'completions',
    variableA: 'country',
    variableB: 'profile',
    iterations: 400,
  });

  assert.equal(first.method, 'monte-carlo');
  assert.equal(first.approximate, true);
  assert.ok(first.pValue >= 0 && first.pValue <= 1);
  assert.equal(first.pValue, second.pValue);
});

test('Kruskal-Wallis compares score distributions and renders a box plot', t => {
  const api = inferenceApi(t);
  const rows = [10, 12, 14, 16, 18, 70, 72, 74, 76, 78]
    .map((evidence, index) => ({ country: index < 5 ? 'A' : 'B', evidence }));
  const result = api.compareGroups(rows, {
    source: 'completions',
    group: 'country',
    outcome: 'evidence',
  });

  assert.equal(result.valid, true);
  assert.equal(result.method, 'kruskal-wallis');
  assert.equal(result.summaries.length, 2);
  assert.ok(result.pValue < 0.05);
  assert.ok(result.effect > 0.5);
  assert.deepEqual(Array.from(result.exportRows, row => row.mediana), [14, 74]);

  const svg = api.renderSvg(result);
  assert.match(svg, /^<svg/);
  assert.match(svg, /role="img"/);
  assert.match(svg, /Diagramas de caja/);
});

test('association heatmap SVG is accessible and escapes category labels', t => {
  const api = inferenceApi(t);
  const rows = contingencyRows([[20, 10], [10, 20]]);
  rows[0].country = '<script>alert(1)</script>';
  const result = api.association(rows, {
    source: 'completions',
    variableA: 'country',
    variableB: 'profile',
  });
  const svg = api.renderSvg(result);

  assert.match(svg, /^<svg/);
  assert.match(svg, /role="img"/);
  assert.ok(!svg.includes('<script>'));
  assert.match(svg, /&lt;script&gt;/);
});
