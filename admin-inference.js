(function () {
  const DIMENSIONS = {
    country: { label: 'País', value: row => row.country },
    profile: { label: 'Perfil', value: row => row.profileKey || row.profile },
    education: { label: 'Nivel educativo', value: row => row.nivelEducativo },
    familiarity: { label: 'Experiencia previa', value: row => row.familiaridadInicial },
    resources: { label: 'Uso de recursos similares', value: row => row.recursosSimilares },
    result: { label: 'Nivel de resultado', value: row => row.likertLevel },
    rating: { label: 'Valoración', value: row => Number(row.rating) > 0 ? `${Number(row.rating)} de 5` : '' },
    program: { label: 'Programa', value: row => row.programCode },
    cohort: { label: 'Cohorte', value: row => row.cohortCode },
    phase: { label: 'Momento de medición', value: row => ({ baseline: 'Diagnóstico inicial', final: 'Evaluación final', followup: 'Seguimiento' })[row.measurementPhase] || row.measurementPhase },
  };

  const OUTCOMES = {
    evidence: {
      label: 'Puntaje de evidencia',
      value: row => finiteNumber(row.evidence),
      decimals: 1,
      scaleMin: 0,
      scaleMax: 100,
    },
    rating: {
      label: 'Valoración',
      value: row => finiteNumber(row.rating),
      decimals: 1,
      scaleMin: 0,
      scaleMax: 5,
    },
  };

  const SOURCES = {
    completions: {
      label: 'Recorridos completados',
      dimensions: ['country', 'profile', 'program', 'cohort', 'phase', 'education', 'familiarity', 'resources', 'result'],
      groupDimensions: ['country', 'profile', 'program', 'cohort', 'phase', 'education', 'familiarity', 'resources', 'result'],
      outcomes: ['evidence'],
    },
    feedback: {
      label: 'Valoraciones',
      dimensions: ['country', 'profile', 'program', 'cohort', 'phase', 'education', 'rating'],
      groupDimensions: ['country', 'profile', 'program', 'cohort', 'phase', 'education'],
      outcomes: ['rating'],
    },
  };

  const logFactorials = [0];

  function finiteNumber(value) {
    if (value === null || value === undefined || value === '') return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function cleanCategory(value) {
    return String(value ?? '').trim();
  }

  function sourceConfig(sourceKey) {
    return SOURCES[sourceKey] || SOURCES.completions;
  }

  function listDimensions(sourceKey, mode = 'association') {
    const source = sourceConfig(sourceKey);
    const keys = mode === 'groups' ? source.groupDimensions : source.dimensions;
    return keys.map(key => ({ key, label: DIMENSIONS[key].label }));
  }

  function listOutcomes(sourceKey) {
    return sourceConfig(sourceKey).outcomes.map(key => ({ key, label: OUTCOMES[key].label }));
  }

  function logGamma(value) {
    const coefficients = [
      676.5203681218851,
      -1259.1392167224028,
      771.32342877765313,
      -176.61502916214059,
      12.507343278686905,
      -0.13857109526572012,
      9.9843695780195716e-6,
      1.5056327351493116e-7,
    ];
    if (value < 0.5) return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * value)) - logGamma(1 - value);
    let x = 0.99999999999980993;
    const adjusted = value - 1;
    coefficients.forEach((coefficient, index) => { x += coefficient / (adjusted + index + 1); });
    const t = adjusted + coefficients.length - 0.5;
    return 0.5 * Math.log(2 * Math.PI) + (adjusted + 0.5) * Math.log(t) - t + Math.log(x);
  }

  function regularizedGammaQ(shape, value) {
    if (!(shape > 0) || value < 0) return NaN;
    if (value === 0) return 1;
    const epsilon = 1e-14;
    const maxIterations = 200;
    const logTerm = shape * Math.log(value) - value - logGamma(shape);

    if (value < shape + 1) {
      let sum = 1 / shape;
      let term = sum;
      let denominator = shape;
      for (let iteration = 1; iteration <= maxIterations; iteration += 1) {
        denominator += 1;
        term *= value / denominator;
        sum += term;
        if (Math.abs(term) < Math.abs(sum) * epsilon) break;
      }
      return Math.max(0, Math.min(1, 1 - sum * Math.exp(logTerm)));
    }

    let b = value + 1 - shape;
    let c = 1 / Number.MIN_VALUE;
    let d = 1 / b;
    let fraction = d;
    for (let iteration = 1; iteration <= maxIterations; iteration += 1) {
      const an = -iteration * (iteration - shape);
      b += 2;
      d = an * d + b;
      if (Math.abs(d) < Number.MIN_VALUE) d = Number.MIN_VALUE;
      c = b + an / c;
      if (Math.abs(c) < Number.MIN_VALUE) c = Number.MIN_VALUE;
      d = 1 / d;
      const delta = d * c;
      fraction *= delta;
      if (Math.abs(delta - 1) < epsilon) break;
    }
    return Math.max(0, Math.min(1, Math.exp(logTerm) * fraction));
  }

  function chiSquareSurvival(statistic, degreesOfFreedom) {
    if (!(degreesOfFreedom > 0) || statistic < 0) return NaN;
    return regularizedGammaQ(degreesOfFreedom / 2, statistic / 2);
  }

  function logFactorial(value) {
    for (let index = logFactorials.length; index <= value; index += 1) {
      logFactorials[index] = logFactorials[index - 1] + Math.log(index);
    }
    return logFactorials[value];
  }

  function logCombination(total, selected) {
    if (selected < 0 || selected > total) return -Infinity;
    return logFactorial(total) - logFactorial(selected) - logFactorial(total - selected);
  }

  function fisherExactTwoSided(matrix) {
    const a = matrix[0][0];
    const b = matrix[0][1];
    const c = matrix[1][0];
    const d = matrix[1][1];
    const rowOne = a + b;
    const rowTwo = c + d;
    const columnOne = a + c;
    const total = rowOne + rowTwo;
    const minimum = Math.max(0, columnOne - rowTwo);
    const maximum = Math.min(rowOne, columnOne);
    const logDenominator = logCombination(total, columnOne);
    const probability = cell => Math.exp(logCombination(rowOne, cell) + logCombination(rowTwo, columnOne - cell) - logDenominator);
    const observedProbability = probability(a);
    let pValue = 0;
    for (let cell = minimum; cell <= maximum; cell += 1) {
      const candidate = probability(cell);
      if (candidate <= observedProbability + 1e-12) pValue += candidate;
    }
    return Math.max(0, Math.min(1, pValue));
  }

  function matrixStatistics(matrix) {
    const rowTotals = matrix.map(row => row.reduce((sum, value) => sum + value, 0));
    const columnTotals = matrix[0].map((_, columnIndex) => matrix.reduce((sum, row) => sum + row[columnIndex], 0));
    const total = rowTotals.reduce((sum, value) => sum + value, 0);
    const expected = matrix.map((row, rowIndex) => row.map((_, columnIndex) => (
      total ? (rowTotals[rowIndex] * columnTotals[columnIndex]) / total : 0
    )));
    let chiSquare = 0;
    matrix.forEach((row, rowIndex) => row.forEach((observed, columnIndex) => {
      const expectedValue = expected[rowIndex][columnIndex];
      if (expectedValue > 0) chiSquare += ((observed - expectedValue) ** 2) / expectedValue;
    }));
    return { rowTotals, columnTotals, total, expected, chiSquare };
  }

  function seededRandom(seed) {
    let state = seed >>> 0;
    return () => {
      state = (state + 0x6D2B79F5) | 0;
      let value = Math.imul(state ^ (state >>> 15), 1 | state);
      value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }

  function monteCarloIndependence(rowIndexes, columnIndexes, rowCount, columnCount, observedStatistic, iterations) {
    const random = seededRandom(0xC0D3C);
    const shuffled = columnIndexes.slice();
    let extreme = 0;
    for (let iteration = 0; iteration < iterations; iteration += 1) {
      for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const target = Math.floor(random() * (index + 1));
        [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
      }
      const matrix = Array.from({ length: rowCount }, () => Array(columnCount).fill(0));
      rowIndexes.forEach((rowIndex, index) => { matrix[rowIndex][shuffled[index]] += 1; });
      if (matrixStatistics(matrix).chiSquare >= observedStatistic - 1e-12) extreme += 1;
    }
    return (extreme + 1) / (iterations + 1);
  }

  function correctedCramersV(chiSquare, total, rowCount, columnCount) {
    if (total <= 1 || rowCount < 2 || columnCount < 2) return 0;
    const phiSquared = chiSquare / total;
    const correctedPhi = Math.max(0, phiSquared - ((columnCount - 1) * (rowCount - 1)) / (total - 1));
    const correctedRows = rowCount - ((rowCount - 1) ** 2) / (total - 1);
    const correctedColumns = columnCount - ((columnCount - 1) ** 2) / (total - 1);
    const denominator = Math.min(correctedRows - 1, correctedColumns - 1);
    if (denominator > 0) return Math.sqrt(correctedPhi / denominator);
    return Math.sqrt(phiSquared / Math.min(rowCount - 1, columnCount - 1));
  }

  function effectLabel(value) {
    if (!Number.isFinite(value)) return 'no estimable';
    if (value < 0.1) return 'muy débil';
    if (value < 0.3) return 'débil';
    if (value < 0.5) return 'moderada';
    return 'fuerte';
  }

  function formatPValue(value, approximate = false) {
    if (!Number.isFinite(value)) return 'No estimable';
    const prefix = approximate ? '≈ ' : '';
    if (value < 0.001) return `${prefix}< 0,001`;
    return `${prefix}${value.toLocaleString('es-UY', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}`;
  }

  function association(inputRows, options = {}) {
    const sourceKey = SOURCES[options.source] ? options.source : 'completions';
    const dimensions = sourceConfig(sourceKey).dimensions;
    const variableAKey = dimensions.includes(options.variableA) ? options.variableA : dimensions[0];
    const variableBKey = dimensions.includes(options.variableB) && options.variableB !== variableAKey
      ? options.variableB
      : dimensions.find(key => key !== variableAKey);
    const variableA = DIMENSIONS[variableAKey];
    const variableB = DIMENSIONS[variableBKey];
    const rows = Array.isArray(inputRows) ? inputRows : [];
    const complete = [];
    let excluded = 0;
    rows.forEach(row => {
      const valueA = cleanCategory(variableA.value(row));
      const valueB = cleanCategory(variableB.value(row));
      if (!valueA || !valueB) {
        excluded += 1;
        return;
      }
      complete.push({ valueA, valueB });
    });

    const countsA = new Map();
    const countsB = new Map();
    complete.forEach(row => {
      countsA.set(row.valueA, (countsA.get(row.valueA) || 0) + 1);
      countsB.set(row.valueB, (countsB.get(row.valueB) || 0) + 1);
    });
    const categoriesA = Array.from(countsA.keys()).sort((a, b) => countsA.get(b) - countsA.get(a) || a.localeCompare(b, 'es'));
    const categoriesB = Array.from(countsB.keys()).sort((a, b) => countsB.get(b) - countsB.get(a) || a.localeCompare(b, 'es'));
    const indexA = new Map(categoriesA.map((value, index) => [value, index]));
    const indexB = new Map(categoriesB.map((value, index) => [value, index]));
    const observed = Array.from({ length: categoriesA.length }, () => Array(categoriesB.length).fill(0));
    const rowIndexes = [];
    const columnIndexes = [];
    complete.forEach(row => {
      const rowIndex = indexA.get(row.valueA);
      const columnIndex = indexB.get(row.valueB);
      observed[rowIndex][columnIndex] += 1;
      rowIndexes.push(rowIndex);
      columnIndexes.push(columnIndex);
    });

    const valid = complete.length >= 10 && categoriesA.length >= 2 && categoriesB.length >= 2;
    if (!valid) {
      return {
        mode: 'association',
        valid: false,
        sourceKey,
        variableAKey,
        variableBKey,
        variableALabel: variableA.label,
        variableBLabel: variableB.label,
        total: complete.length,
        excluded,
        categoriesA,
        categoriesB,
        observed,
        methodLabel: 'Muestra insuficiente',
        pValue: NaN,
        effect: NaN,
        effectName: 'V de Cramér',
        interpretation: 'Se necesitan al menos 10 casos completos y dos categorías observadas en cada variable.',
        warnings: excluded ? [`Se excluyeron ${excluded} registros con datos faltantes.`] : [],
        exportRows: [],
      };
    }

    const statistics = matrixStatistics(observed);
    const degreesOfFreedom = (categoriesA.length - 1) * (categoriesB.length - 1);
    const expectedValues = statistics.expected.flat();
    const belowFive = expectedValues.filter(value => value <= 5).length;
    const belowOne = expectedValues.filter(value => value < 1).length;
    const sparse = belowOne > 0 || belowFive / expectedValues.length > 0.2;
    const iterations = Math.max(200, Number(options.iterations) || 1500);
    let method = 'chi-square';
    let methodLabel = 'Chi-cuadrado de independencia';
    let pValue = chiSquareSurvival(statistics.chiSquare, degreesOfFreedom);
    let approximate = false;
    if (categoriesA.length === 2 && categoriesB.length === 2 && sparse) {
      method = 'fisher';
      methodLabel = 'Prueba exacta de Fisher (bilateral)';
      pValue = fisherExactTwoSided(observed);
    } else if (sparse) {
      method = 'monte-carlo';
      methodLabel = `Chi-cuadrado con Monte Carlo (${iterations.toLocaleString('es-UY')} permutaciones)`;
      pValue = monteCarloIndependence(rowIndexes, columnIndexes, categoriesA.length, categoriesB.length, statistics.chiSquare, iterations);
      approximate = true;
    }

    const effect = correctedCramersV(statistics.chiSquare, statistics.total, categoriesA.length, categoriesB.length);
    const residuals = observed.map((row, rowIndex) => row.map((value, columnIndex) => {
      const expected = statistics.expected[rowIndex][columnIndex];
      const rowProportion = statistics.rowTotals[rowIndex] / statistics.total;
      const columnProportion = statistics.columnTotals[columnIndex] / statistics.total;
      const denominator = Math.sqrt(expected * (1 - rowProportion) * (1 - columnProportion));
      return denominator > 0 ? (value - expected) / denominator : 0;
    }));
    const notable = [];
    residuals.forEach((row, rowIndex) => row.forEach((value, columnIndex) => {
      if (Math.abs(value) >= 1.96) notable.push({
        row: categoriesA[rowIndex],
        column: categoriesB[columnIndex],
        residual: value,
      });
    }));
    notable.sort((a, b) => Math.abs(b.residual) - Math.abs(a.residual));
    const significant = pValue < 0.05;
    const interpretation = significant
      ? `Se observa evidencia de relación entre ${variableA.label.toLowerCase()} y ${variableB.label.toLowerCase()} (p ${formatPValue(pValue, approximate)}). La intensidad estimada es ${effectLabel(effect)} (V de Cramér = ${effect.toFixed(3).replace('.', ',')}).`
      : `No se detecta evidencia suficiente de relación entre ${variableA.label.toLowerCase()} y ${variableB.label.toLowerCase()} con esta muestra (p ${formatPValue(pValue, approximate)}). Esto no demuestra independencia: puede haber poco tamaño muestral.`;
    const warnings = [];
    if (excluded) warnings.push(`Se excluyeron ${excluded} registros con datos faltantes.`);
    if (sparse && method === 'fisher') warnings.push('Se utilizó Fisher porque las frecuencias esperadas son bajas para el chi-cuadrado asintótico.');
    if (sparse && method === 'monte-carlo') warnings.push('La tabla es dispersa; el valor p se estimó mediante permutaciones Monte Carlo.');
    if (categoriesA.length > 10 || categoriesB.length > 10) warnings.push('Muchas categorías pueden producir resultados inestables; conviene interpretar las categorías con pocos casos con cautela.');
    if (complete.length < 30) warnings.push('La muestra es pequeña; prioriza el tamaño del efecto y la incertidumbre sobre una lectura binaria del valor p.');
    const exportRows = categoriesA.flatMap((rowName, rowIndex) => categoriesB.map((columnName, columnIndex) => ({
      variable_a: rowName,
      variable_b: columnName,
      observado: observed[rowIndex][columnIndex],
      esperado: Number(statistics.expected[rowIndex][columnIndex].toFixed(3)),
      residuo_ajustado: Number(residuals[rowIndex][columnIndex].toFixed(3)),
    })));

    return {
      mode: 'association',
      valid: true,
      sourceKey,
      variableAKey,
      variableBKey,
      variableALabel: variableA.label,
      variableBLabel: variableB.label,
      total: statistics.total,
      excluded,
      categoriesA,
      categoriesB,
      observed,
      expected: statistics.expected,
      residuals,
      chiSquare: statistics.chiSquare,
      degreesOfFreedom,
      method,
      methodLabel,
      pValue,
      approximate,
      effect,
      effectName: 'V de Cramér corregida',
      effectLabel: effectLabel(effect),
      interpretation,
      warnings,
      notable: notable.slice(0, 4),
      exportRows,
    };
  }

  function quantile(sorted, probability) {
    if (!sorted.length) return NaN;
    const position = (sorted.length - 1) * probability;
    const lower = Math.floor(position);
    const upper = Math.ceil(position);
    if (lower === upper) return sorted[lower];
    return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower);
  }

  function groupSummary(name, values) {
    const sorted = values.slice().sort((a, b) => a - b);
    const q1 = quantile(sorted, 0.25);
    const median = quantile(sorted, 0.5);
    const q3 = quantile(sorted, 0.75);
    const iqr = q3 - q1;
    const lowerFence = q1 - 1.5 * iqr;
    const upperFence = q3 + 1.5 * iqr;
    const inliers = sorted.filter(value => value >= lowerFence && value <= upperFence);
    return {
      name,
      values: sorted,
      n: sorted.length,
      mean: sorted.reduce((sum, value) => sum + value, 0) / sorted.length,
      q1,
      median,
      q3,
      lowerWhisker: inliers[0] ?? sorted[0],
      upperWhisker: inliers[inliers.length - 1] ?? sorted[sorted.length - 1],
      outliers: sorted.filter(value => value < lowerFence || value > upperFence),
    };
  }

  function compareGroups(inputRows, options = {}) {
    const sourceKey = SOURCES[options.source] ? options.source : 'completions';
    const source = sourceConfig(sourceKey);
    const groupKey = source.groupDimensions.includes(options.group) ? options.group : source.groupDimensions[0];
    const outcomeKey = source.outcomes.includes(options.outcome) ? options.outcome : source.outcomes[0];
    const groupDimension = DIMENSIONS[groupKey];
    const outcome = OUTCOMES[outcomeKey];
    const rows = Array.isArray(inputRows) ? inputRows : [];
    const groups = new Map();
    let excluded = 0;
    rows.forEach(row => {
      const group = cleanCategory(groupDimension.value(row));
      const value = outcome.value(row);
      if (!group || value === null) {
        excluded += 1;
        return;
      }
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group).push(value);
    });
    const summaries = Array.from(groups, ([name, values]) => groupSummary(name, values))
      .sort((a, b) => b.n - a.n || a.name.localeCompare(b.name, 'es'));
    const all = summaries.flatMap(summary => summary.values.map(value => ({ value, group: summary.name })));
    const valid = all.length >= 10 && summaries.length >= 2;
    if (!valid) {
      return {
        mode: 'groups',
        valid: false,
        sourceKey,
        groupKey,
        outcomeKey,
        groupLabel: groupDimension.label,
        outcomeLabel: outcome.label,
        outcome,
        total: all.length,
        excluded,
        summaries,
        methodLabel: 'Muestra insuficiente',
        pValue: NaN,
        effect: NaN,
        effectName: 'Epsilon cuadrado',
        interpretation: 'Se necesitan al menos 10 casos completos y dos grupos observados.',
        warnings: excluded ? [`Se excluyeron ${excluded} registros con datos faltantes.`] : [],
        exportRows: [],
      };
    }

    const sorted = all.slice().sort((a, b) => a.value - b.value);
    const rankSums = new Map(summaries.map(summary => [summary.name, 0]));
    let tieCorrectionSum = 0;
    let position = 0;
    while (position < sorted.length) {
      let end = position + 1;
      while (end < sorted.length && sorted[end].value === sorted[position].value) end += 1;
      const averageRank = ((position + 1) + end) / 2;
      const tieSize = end - position;
      if (tieSize > 1) tieCorrectionSum += tieSize ** 3 - tieSize;
      for (let index = position; index < end; index += 1) {
        rankSums.set(sorted[index].group, rankSums.get(sorted[index].group) + averageRank);
      }
      position = end;
    }
    const total = sorted.length;
    let statistic = (12 / (total * (total + 1))) * summaries.reduce((sum, summary) => (
      sum + (rankSums.get(summary.name) ** 2) / summary.n
    ), 0) - 3 * (total + 1);
    const tieCorrection = 1 - tieCorrectionSum / (total ** 3 - total);
    if (tieCorrection > 0) statistic /= tieCorrection;
    const degreesOfFreedom = summaries.length - 1;
    const pValue = chiSquareSurvival(statistic, degreesOfFreedom);
    const effect = Math.max(0, Math.min(1, (statistic - summaries.length + 1) / (total - summaries.length)));
    const significant = pValue < 0.05;
    const interpretation = significant
      ? `Se observan diferencias globales en ${outcome.label.toLowerCase()} entre los grupos de ${groupDimension.label.toLowerCase()} (p ${formatPValue(pValue)}). El tamaño del efecto es ${effectLabel(effect)} (ε² = ${effect.toFixed(3).replace('.', ',')}). La prueba global no identifica por sí sola qué pares de grupos difieren.`
      : `No se detectan diferencias globales suficientes en ${outcome.label.toLowerCase()} entre los grupos de ${groupDimension.label.toLowerCase()} con esta muestra (p ${formatPValue(pValue)}).`;
    const warnings = [];
    if (excluded) warnings.push(`Se excluyeron ${excluded} registros con datos faltantes.`);
    if (summaries.some(summary => summary.n < 5)) warnings.push('Hay grupos con menos de 5 casos; sus medianas y rangos son inestables.');
    if (summaries.length > 10) warnings.push('Hay muchos grupos; conviene filtrar o reagrupar categorías antes de interpretar el resultado.');
    if (significant && summaries.length > 2) warnings.push('Un resultado global significativo requiere comparaciones posteriores para localizar diferencias específicas.');
    const exportRows = summaries.map(summary => ({
      grupo: summary.name,
      n: summary.n,
      media: Number(summary.mean.toFixed(outcome.decimals)),
      q1: Number(summary.q1.toFixed(outcome.decimals)),
      mediana: Number(summary.median.toFixed(outcome.decimals)),
      q3: Number(summary.q3.toFixed(outcome.decimals)),
    }));

    return {
      mode: 'groups',
      valid: true,
      sourceKey,
      groupKey,
      outcomeKey,
      groupLabel: groupDimension.label,
      outcomeLabel: outcome.label,
      outcome,
      total,
      excluded,
      summaries,
      statistic,
      degreesOfFreedom,
      method: 'kruskal-wallis',
      methodLabel: 'Kruskal–Wallis',
      pValue,
      approximate: false,
      effect,
      effectName: 'Epsilon cuadrado',
      effectLabel: effectLabel(effect),
      interpretation,
      warnings,
      exportRows,
    };
  }

  function escapeXml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  function shortText(value, limit = 22) {
    const text = String(value ?? '');
    return text.length > limit ? `${text.slice(0, limit - 1)}…` : text;
  }

  function svgFrame(result, width, height, content, title, description) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="inference-chart-title inference-chart-description">`
      + `<title id="inference-chart-title">${escapeXml(title)}</title>`
      + `<desc id="inference-chart-description">${escapeXml(description)}</desc>`
      + '<rect width="100%" height="100%" fill="#ffffff"/>'
      + `<text x="24" y="32" font-family="Segoe UI, Arial, sans-serif" font-size="18" font-weight="700" fill="#172033">${escapeXml(title)}</text>`
      + `<text x="24" y="53" font-family="Segoe UI, Arial, sans-serif" font-size="12" fill="#637083">Muestra analizada: N=${result.total}</text>`
      + `<g font-family="Segoe UI, Arial, sans-serif">${content}</g>`
      + '</svg>';
  }

  function residualColor(value) {
    const amount = Math.min(1, Math.abs(value) / 3);
    const start = [248, 250, 252];
    const end = value >= 0 ? [37, 99, 235] : [220, 38, 38];
    const rgb = start.map((channel, index) => Math.round(channel + (end[index] - channel) * amount));
    return `rgb(${rgb.join(',')})`;
  }

  function renderAssociation(result) {
    const labelWidth = 220;
    const cellWidth = 124;
    const cellHeight = 56;
    const top = 132;
    const width = Math.max(800, labelWidth + result.categoriesB.length * cellWidth + 46);
    const height = Math.max(330, top + result.categoriesA.length * cellHeight + 70);
    const title = `Residuos ajustados: ${result.variableALabel} × ${result.variableBLabel}`;
    let content = '';
    result.categoriesB.forEach((category, columnIndex) => {
      const x = labelWidth + columnIndex * cellWidth + cellWidth / 2;
      content += `<text x="${x}" y="${top - 20}" text-anchor="middle" font-size="11" font-weight="600" fill="#475569"><title>${escapeXml(category)}</title>${escapeXml(shortText(category, 16))}</text>`;
    });
    result.categoriesA.forEach((category, rowIndex) => {
      const y = top + rowIndex * cellHeight;
      content += `<text x="${labelWidth - 14}" y="${y + 33}" text-anchor="end" font-size="12" font-weight="600" fill="#334155"><title>${escapeXml(category)}</title>${escapeXml(shortText(category))}</text>`;
      result.categoriesB.forEach((_, columnIndex) => {
        const x = labelWidth + columnIndex * cellWidth;
        const residual = result.residuals[rowIndex][columnIndex];
        const observed = result.observed[rowIndex][columnIndex];
        const expected = result.expected[rowIndex][columnIndex];
        const textColor = Math.abs(residual) > 1.6 ? '#ffffff' : '#1e293b';
        content += `<rect x="${x + 2}" y="${y + 2}" width="${cellWidth - 4}" height="${cellHeight - 4}" rx="6" fill="${residualColor(residual)}"><title>${escapeXml(`Observado ${observed}; esperado ${expected.toFixed(2)}; residuo ${residual.toFixed(2)}`)}</title></rect>`;
        content += `<text x="${x + cellWidth / 2}" y="${y + 24}" text-anchor="middle" font-size="12" font-weight="700" fill="${textColor}">O=${observed}</text>`;
        content += `<text x="${x + cellWidth / 2}" y="${y + 42}" text-anchor="middle" font-size="10" fill="${textColor}">r=${residual.toFixed(2)}</text>`;
      });
    });
    content += `<text x="24" y="${height - 20}" font-size="11" fill="#64748b">Azul: más casos que los esperados · Rojo: menos casos · |r| ≥ 1,96 señala una celda destacada.</text>`;
    return svgFrame(result, width, height, content, title, 'Mapa de calor de residuos ajustados de una tabla de contingencia.');
  }

  function renderGroups(result) {
    const width = 1120;
    const left = 235;
    const right = 70;
    const top = 98;
    const rowHeight = 58;
    const height = Math.max(340, top + result.summaries.length * rowHeight + 74);
    const chartWidth = width - left - right;
    const minimum = result.outcome.scaleMin ?? Math.min(...result.summaries.map(summary => summary.lowerWhisker));
    const maximum = result.outcome.scaleMax ?? Math.max(...result.summaries.map(summary => summary.upperWhisker));
    const scale = value => left + ((value - minimum) / (maximum - minimum || 1)) * chartWidth;
    const title = `${result.outcomeLabel} por ${result.groupLabel}`;
    let content = '';
    for (let tick = 0; tick <= 5; tick += 1) {
      const value = minimum + ((maximum - minimum) / 5) * tick;
      const x = left + (chartWidth / 5) * tick;
      content += `<line x1="${x}" y1="${top - 10}" x2="${x}" y2="${height - 48}" stroke="#e2e8f0"/>`;
      content += `<text x="${x}" y="${height - 22}" text-anchor="middle" font-size="11" fill="#64748b">${value.toLocaleString('es-UY', { maximumFractionDigits: result.outcome.decimals })}</text>`;
    }
    result.summaries.forEach((summary, index) => {
      const y = top + index * rowHeight + 24;
      const q1 = scale(summary.q1);
      const q3 = scale(summary.q3);
      const median = scale(summary.median);
      const lower = scale(summary.lowerWhisker);
      const upper = scale(summary.upperWhisker);
      content += `<text x="${left - 14}" y="${y + 4}" text-anchor="end" font-size="12" font-weight="600" fill="#334155"><title>${escapeXml(summary.name)}</title>${escapeXml(shortText(summary.name))} (n=${summary.n})</text>`;
      content += `<line x1="${lower}" y1="${y}" x2="${upper}" y2="${y}" stroke="#475569" stroke-width="2"/>`;
      content += `<line x1="${lower}" y1="${y - 8}" x2="${lower}" y2="${y + 8}" stroke="#475569" stroke-width="2"/>`;
      content += `<line x1="${upper}" y1="${y - 8}" x2="${upper}" y2="${y + 8}" stroke="#475569" stroke-width="2"/>`;
      content += `<rect x="${q1}" y="${y - 14}" width="${Math.max(2, q3 - q1)}" height="28" rx="4" fill="#dbeafe" stroke="#2563eb" stroke-width="2"><title>${escapeXml(`Q1 ${summary.q1.toFixed(1)}; mediana ${summary.median.toFixed(1)}; Q3 ${summary.q3.toFixed(1)}`)}</title></rect>`;
      content += `<line x1="${median}" y1="${y - 14}" x2="${median}" y2="${y + 14}" stroke="#1d4ed8" stroke-width="3"/>`;
      summary.outliers.forEach((value, outlierIndex) => {
        content += `<circle cx="${scale(value)}" cy="${y + ((outlierIndex % 3) - 1) * 5}" r="3" fill="#dc2626"><title>${value}</title></circle>`;
      });
    });
    return svgFrame(result, width, height, content, title, 'Diagramas de caja con mediana, cuartiles, bigotes y valores atípicos.');
  }

  function renderSvg(result) {
    if (!result?.valid) return '';
    return result.mode === 'groups' ? renderGroups(result) : renderAssociation(result);
  }

  window.AdminInference = {
    sources: Object.entries(SOURCES).map(([key, value]) => ({ key, label: value.label })),
    listDimensions,
    listOutcomes,
    association,
    compareGroups,
    renderSvg,
    formatPValue,
    chiSquareSurvival,
    fisherExactTwoSided,
  };
})();
