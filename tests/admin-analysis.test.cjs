const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');

const root = path.join(__dirname, '..');

function analysisApi(t) {
  const dom = new JSDOM('', { url: 'http://localhost/', runScripts: 'outside-only' });
  t.after(() => dom.window.close());
  vm.runInContext(
    fs.readFileSync(path.join(root, 'admin-analysis.js'), 'utf8'),
    dom.getInternalVMContext(),
    { filename: 'admin-analysis.js' },
  );
  return dom.window.AdminAnalysis;
}

const completions = [
  { country: 'Uruguay', profileKey: 'docente', nivelEducativo: 'Formación Docente', evidence: 80, answersCount: 8, timestamp: '2026-09-02T10:00:00Z' },
  { country: 'Uruguay', profileKey: 'estudiante', nivelEducativo: 'Enseñanza Media', evidence: 60, answersCount: 7, timestamp: '2026-09-03T10:00:00Z' },
  { country: 'Canadá', profileKey: 'docente', nivelEducativo: 'Formación Docente', evidence: 90, answersCount: 8, timestamp: '2026-10-02T10:00:00Z' },
  { country: 'Canadá', profileKey: 'estudiante', nivelEducativo: 'Enseñanza Media', evidence: 70, answersCount: 7, timestamp: '2026-10-03T10:00:00Z' },
  { country: 'Canadá', profileKey: 'estudiante', nivelEducativo: 'Enseñanza Media', evidence: 50, answersCount: 6, timestamp: '2026-10-04T10:00:00Z' },
];

test('quantitative analysis crosses variables and calculates counts, percentages and averages', t => {
  const api = analysisApi(t);
  const counts = api.aggregate(completions, {
    source: 'completions',
    dimension: 'country',
    compare: 'profile',
    metric: 'count',
  });

  assert.equal(counts.totalRows, 5);
  assert.deepEqual(Array.from(counts.rows, row => row.category), ['Canadá', 'Uruguay']);
  assert.equal(counts.rows[0].cells.reduce((sum, cell) => sum + cell.value, 0), 3);
  assert.deepEqual(new Set(counts.series), new Set(['docente', 'estudiante']));

  const percentages = api.aggregate(completions, {
    source: 'completions',
    dimension: 'country',
    compare: 'profile',
    metric: 'percent',
  });
  const percentageTotal = percentages.exportRows.reduce((sum, row) => sum + row.valor, 0);
  assert.equal(percentageTotal, 100);

  const averages = api.aggregate(completions, {
    source: 'completions',
    dimension: 'country',
    metric: 'averageEvidence',
  });
  const uruguay = averages.rows.find(row => row.category === 'Uruguay');
  assert.equal(uruguay.cells[0].value, 70);
  assert.equal(averages.metric.scaleMax, 100);

  const scatter = api.aggregate(completions, {
    source: 'completions',
    dimension: 'country',
    compare: 'profile',
    metric: 'count',
    xAxis: 'evidence',
    yAxis: 'answersCount',
  });
  assert.equal(scatter.scatterPoints.length, 5);
  assert.equal(scatter.xAxis.label, 'Puntaje de evidencia');
  assert.equal(scatter.yAxis.label, 'Cantidad de respuestas');
  assert.match(scatter.scatterTitle, /Cantidad de respuestas según Puntaje de evidencia/);
});

test('analysis renders accessible exportable SVG charts and escapes data labels', t => {
  const api = analysisApi(t);
  const model = api.aggregate([...completions, { country: '<script>alert(1)</script>', profileKey: 'docente', evidence: 10, answersCount: 4 }], {
    source: 'completions',
    dimension: 'country',
    compare: 'profile',
    metric: 'count',
  });

  for (const type of ['bars', 'stacked', 'radar', 'scatter', 'line', 'heatmap']) {
    const svg = api.renderSvg(model, type);
    assert.match(svg, /^<svg/);
    assert.match(svg, /role="img"/);
    assert.match(svg, /<title id="analysis-chart-title">/);
    assert.ok(!svg.includes('<script>'), `${type} escapes category labels`);
    assert.match(svg, /&lt;script&gt;/);
  }
});

test('feedback analysis exposes rating-specific dimensions and metrics', t => {
  const api = analysisApi(t);
  assert.ok(api.listDimensions('feedback').some(option => option.key === 'rating'));
  assert.ok(api.listMetrics('feedback').some(option => option.key === 'averageRating'));
  assert.ok(!api.listMetrics('feedback').some(option => option.key === 'averageEvidence'));
  assert.deepEqual(Array.from(api.listNumericFields('feedback'), option => option.key), ['timestamp', 'rating']);

  const model = api.aggregate([
    { country: 'Uruguay', rating: 5 },
    { country: 'Uruguay', rating: 3 },
  ], {
    source: 'feedback',
    dimension: 'country',
    metric: 'averageRating',
  });
  assert.equal(model.rows[0].cells[0].value, 4);
});

test('program M&E evaluation computes pre/post aggregate, paired trajectories, cohort metrics and markdown report', t => {
  const api = analysisApi(t);
  const rows = [
    // Open web completion without program context (should be ignored when programOnly: true)
    { country: 'Uruguay', profileKey: 'docente', evidence: 95, answersCount: 8, timestamp: '2027-03-01T10:00:00Z' },
    // Cohort cfe-montevideo-01: p-101 has baseline (60) -> final (84) -> followup (88)
    {
      country: 'Uruguay',
      profileKey: 'docente',
      programCode: 'uy-us-ai-literacy-2027',
      cohortCode: 'cfe-montevideo-01',
      measurementPhase: 'baseline',
      participantId: 'p-101',
      evidence: 60,
      literacyScore: 55,
      answersCount: 8,
      timestamp: '2027-04-01T10:00:00Z',
    },
    {
      country: 'Uruguay',
      profileKey: 'docente',
      programCode: 'uy-us-ai-literacy-2027',
      cohortCode: 'cfe-montevideo-01',
      measurementPhase: 'final',
      participantId: 'p-101',
      evidence: 84,
      literacyScore: 85,
      answersCount: 8,
      timestamp: '2027-04-15T10:00:00Z',
    },
    {
      country: 'Uruguay',
      profileKey: 'docente',
      programCode: 'uy-us-ai-literacy-2027',
      cohortCode: 'cfe-montevideo-01',
      measurementPhase: 'followup',
      participantId: 'p-101',
      evidence: 88,
      literacyScore: 90,
      answersCount: 8,
      timestamp: '2027-07-01T10:00:00Z',
    },
    // Cohort cfe-montevideo-01: p-102 has baseline (50) -> final (70)
    {
      country: 'Uruguay',
      profileKey: 'estudiante',
      programCode: 'uy-us-ai-literacy-2027',
      cohortCode: 'cfe-montevideo-01',
      measurementPhase: 'baseline',
      participantId: 'p-102',
      evidence: 50,
      literacyScore: 40,
      answersCount: 8,
      timestamp: '2027-04-02T10:00:00Z',
    },
    {
      country: 'Uruguay',
      profileKey: 'estudiante',
      programCode: 'uy-us-ai-literacy-2027',
      cohortCode: 'cfe-montevideo-01',
      measurementPhase: 'final',
      participantId: 'p-102',
      evidence: 70,
      literacyScore: 65,
      answersCount: 8,
      timestamp: '2027-04-16T10:00:00Z',
    },
    // Cohort us-partner-lab-02: p-201 has only baseline (70) so far
    {
      country: 'Estados Unidos',
      profileKey: 'docente',
      programCode: 'uy-us-ai-literacy-2027',
      cohortCode: 'us-partner-lab-02',
      measurementPhase: 'baseline',
      participantId: 'p-201',
      evidence: 70,
      literacyScore: 70,
      answersCount: 8,
      timestamp: '2027-05-01T10:00:00Z',
    },
  ];

  const evalModel = api.evaluateProgram(rows);
  assert.equal(evalModel.empty, false);
  assert.equal(evalModel.totalProgramRows, 6);
  assert.equal(evalModel.uniqueParticipants, 3);
  assert.equal(evalModel.activeCohorts, 2);
  assert.deepEqual(Array.from(evalModel.programs), ['uy-us-ai-literacy-2027']);

  // Stage counts & means: baseline = (60+50+70)/3 = 60; final = (84+70)/2 = 77; followup = 88
  assert.equal(evalModel.stages.baseline.count, 3);
  assert.equal(evalModel.stages.baseline.averageEvidence, 60);
  assert.equal(evalModel.stages.baseline.averageLiteracyScore, 55);
  assert.equal(evalModel.stages.final.count, 2);
  assert.equal(evalModel.stages.final.averageEvidence, 77);
  assert.equal(evalModel.stages.final.averageLiteracyScore, 75);
  assert.equal(evalModel.stages.followup.count, 1);
  assert.equal(evalModel.stages.followup.averageEvidence, 88);
  assert.equal(evalModel.stages.followup.averageLiteracyScore, 90);

  // Aggregate change: 77 - 60 = +17 pts (+28.3%); literacy: 75 - 55 = +20 pts (+36.4%)
  assert.equal(evalModel.aggregateChange.deltaPoints, 17);
  assert.equal(evalModel.aggregateChange.relativeChangePct, 28.3);
  assert.equal(evalModel.aggregateChange.literacyDeltaPoints, 20);
  assert.equal(evalModel.aggregateChange.literacyRelativePct, 36.4);

  // Paired trajectories: p-101 (60->84, +24) and p-102 (50->70, +20) => pairedCount = 2, baselineMean = 55, finalMean = 77, deltaMean = 22 (+40%)
  assert.equal(evalModel.paired.pairedCount, 2);
  assert.equal(evalModel.paired.baselineMean, 55);
  assert.equal(evalModel.paired.finalMean, 77);
  assert.equal(evalModel.paired.deltaMean, 22);
  assert.equal(evalModel.paired.relativeChangePct, 40);
  assert.equal(evalModel.paired.improvedPct, 100);
  // Paired literacy trajectories: p-101 (55->85, +30) and p-102 (40->65, +25) => deltaMean = 27.5 (+57.9%)
  assert.equal(evalModel.paired.literacyPairsCount, 2);
  assert.equal(evalModel.paired.baselineLiteracyMean, 47.5);
  assert.equal(evalModel.paired.finalLiteracyMean, 75);
  assert.equal(evalModel.paired.deltaLiteracyMean, 27.5);
  assert.equal(evalModel.paired.relativeLiteracyChangePct, 57.9);
  assert.equal(evalModel.paired.improvedLiteracyPct, 100);
  // 2 of 3 baseline participants completed final => 66.7%
  assert.equal(evalModel.paired.pairedCompletionRatePct, 66.7);
  assert.equal(evalModel.progress.meetsImprovementTarget, true);

  // Cohort breakdown
  assert.equal(evalModel.cohorts.length, 2);
  const cfe = evalModel.cohorts.find(c => c.cohortCode === 'cfe-montevideo-01');
  assert.equal(cfe.uniqueParticipants, 2);
  assert.equal(cfe.pairedCount, 2);
  assert.equal(cfe.pairedDeltaMean, 22);
  assert.equal(cfe.pairedLiteracyDeltaMean, 27.5);
  assert.equal(cfe.completionRatePct, 100);

  // Markdown report generation
  const report = api.formatProgramReportMarkdown(evalModel);
  assert.match(report, /Informe de Monitoreo y Evaluación \(M&E\)/);
  assert.match(report, /uy-us-ai-literacy-2027/);
  assert.match(report, /cfe-montevideo-01/);
  assert.match(report, /\+22\.0 pts \(\+40\.0%\)/);
  assert.match(report, /Alfabetización IA/);
  assert.match(report, /\+27\.5 pts \(\+57\.9%\)/);

  // Custom targets configuration
  const customEval = api.evaluateProgram(rows, {
    targets: { participants: 60, cohorts: 2, completionRatePct: 60, relativeImprovementPct: 25 },
  });
  assert.equal(customEval.progress.participantsPct, 5);
  assert.equal(customEval.progress.cohortsPct, 100);
  assert.equal(customEval.progress.meetsCompletionTarget, true);
  assert.equal(customEval.progress.meetsImprovementTarget, true);
});
