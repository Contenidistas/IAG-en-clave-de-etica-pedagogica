(function () {
  const COLORS = ['#2563eb', '#059669', '#d97706', '#7c3aed', '#db2777', '#0891b2', '#65a30d', '#dc2626', '#475569', '#9333ea'];
  const TOTAL_SERIES = 'Total';

  const DIMENSIONS = {
    country: { label: 'País', value: row => row.country },
    profile: { label: 'Perfil', value: row => row.profileKey || row.profile },
    education: { label: 'Nivel educativo', value: row => row.nivelEducativo },
    familiarity: { label: 'Experiencia previa', value: row => row.familiaridadInicial },
    resources: { label: 'Uso de recursos similares', value: row => row.recursosSimilares },
    result: { label: 'Nivel de resultado', value: row => row.likertLevel },
    month: { label: 'Mes (AAAA-MM)', value: row => monthKey(row.timestamp) },
    rating: { label: 'Valoración', value: row => ratingLabel(row.rating) },
    program: { label: 'Programa', value: row => row.programCode },
    cohort: { label: 'Cohorte', value: row => row.cohortCode },
    phase: { label: 'Momento de medición', value: row => phaseLabel(row.measurementPhase) },
  };

  const METRICS = {
    count: {
      label: 'Cantidad de registros',
      shortLabel: 'Registros',
      kind: 'count',
      decimals: 0,
    },
    percent: {
      label: 'Porcentaje de la muestra',
      shortLabel: 'Porcentaje',
      kind: 'percent',
      decimals: 1,
      scaleMax: 100,
    },
    averageEvidence: {
      label: 'Puntaje de evidencia promedio',
      shortLabel: 'Puntaje promedio',
      kind: 'average',
      value: row => row.evidence,
      decimals: 1,
      scaleMax: 100,
    },
    averageAnswers: {
      label: 'Promedio de respuestas',
      shortLabel: 'Respuestas promedio',
      kind: 'average',
      value: row => row.answersCount,
      decimals: 1,
    },
    averageRating: {
      label: 'Valoración promedio',
      shortLabel: 'Valoración promedio',
      kind: 'average',
      value: row => row.rating,
      decimals: 2,
      scaleMax: 5,
    },
  };

  const NUMERIC_FIELDS = {
    evidence: {
      label: 'Puntaje de evidencia',
      value: row => finiteNumber(row.evidence),
      decimals: 1,
      scaleMin: 0,
      scaleMax: 100,
    },
    answersCount: {
      label: 'Cantidad de respuestas',
      value: row => finiteNumber(row.answersCount),
      decimals: 0,
      scaleMin: 0,
    },
    rating: {
      label: 'Valoración',
      value: row => finiteNumber(row.rating),
      decimals: 1,
      scaleMin: 0,
      scaleMax: 5,
    },
    timestamp: {
      label: 'Fecha',
      value: row => {
        const time = new Date(row.timestamp).getTime();
        return Number.isFinite(time) ? time : null;
      },
      kind: 'date',
      decimals: 0,
    },
  };

  const SOURCES = {
    completions: {
      label: 'Recorridos completados',
      dimensions: ['country', 'profile', 'program', 'cohort', 'phase', 'education', 'familiarity', 'resources', 'result', 'month'],
      metrics: ['count', 'percent', 'averageEvidence', 'averageAnswers'],
      numericFields: ['evidence', 'answersCount', 'timestamp'],
    },
    feedback: {
      label: 'Valoraciones',
      dimensions: ['country', 'profile', 'program', 'cohort', 'phase', 'education', 'rating', 'month'],
      metrics: ['count', 'percent', 'averageRating'],
      numericFields: ['timestamp', 'rating'],
    },
  };

  function monthKey(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  function phaseLabel(value) {
    return ({ baseline: 'Diagnóstico inicial', final: 'Evaluación final', followup: 'Seguimiento' })[value] || value;
  }

  function ratingLabel(value) {
    const rating = Number(value);
    return Number.isFinite(rating) && rating > 0 ? `${rating} de 5` : '';
  }

  function category(value) {
    const text = String(value ?? '').trim();
    return text || 'Sin dato';
  }

  function finiteNumber(value) {
    if (value === null || value === undefined || value === '') return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function sourceConfig(sourceKey) {
    return SOURCES[sourceKey] || SOURCES.completions;
  }

  function listDimensions(sourceKey) {
    return sourceConfig(sourceKey).dimensions.map(key => ({ key, label: DIMENSIONS[key].label }));
  }

  function listMetrics(sourceKey) {
    return sourceConfig(sourceKey).metrics.map(key => ({ key, label: METRICS[key].label, kind: METRICS[key].kind }));
  }

  function listNumericFields(sourceKey) {
    return sourceConfig(sourceKey).numericFields.map(key => ({ key, label: NUMERIC_FIELDS[key].label }));
  }

  function aggregate(inputRows, options = {}) {
    const sourceKey = SOURCES[options.source] ? options.source : 'completions';
    const source = sourceConfig(sourceKey);
    const dimensionKey = source.dimensions.includes(options.dimension) ? options.dimension : source.dimensions[0];
    const compareKey = source.dimensions.includes(options.compare) && options.compare !== dimensionKey ? options.compare : '';
    const metricKey = source.metrics.includes(options.metric) ? options.metric : source.metrics[0];
    const dimension = DIMENSIONS[dimensionKey];
    const comparison = compareKey ? DIMENSIONS[compareKey] : null;
    const metric = METRICS[metricKey];
    const numericKeys = source.numericFields;
    const xAxisKey = numericKeys.includes(options.xAxis) ? options.xAxis : numericKeys[0];
    const requestedYAxis = numericKeys.includes(options.yAxis) ? options.yAxis : numericKeys[1];
    const yAxisKey = requestedYAxis !== xAxisKey
      ? requestedYAxis
      : (numericKeys.find(key => key !== xAxisKey) || requestedYAxis);
    const xAxis = NUMERIC_FIELDS[xAxisKey];
    const yAxis = NUMERIC_FIELDS[yAxisKey];
    const rows = Array.isArray(inputRows) ? inputRows : [];
    const cells = new Map();
    const categories = new Set();
    const series = new Set();

    rows.forEach(row => {
      const categoryName = category(dimension.value(row));
      const seriesName = comparison ? category(comparison.value(row)) : TOTAL_SERIES;
      const cellKey = `${categoryName}\u0000${seriesName}`;
      const cell = cells.get(cellKey) || { category: categoryName, series: seriesName, count: 0, sum: 0, numericCount: 0 };
      cell.count += 1;
      if (metric.kind === 'average') {
        const number = finiteNumber(metric.value(row));
        if (number !== null) {
          cell.sum += number;
          cell.numericCount += 1;
        }
      }
      cells.set(cellKey, cell);
      categories.add(categoryName);
      series.add(seriesName);
    });

    const totalRows = rows.length;
    const cellValue = cell => {
      if (!cell) return 0;
      if (metric.kind === 'percent') return totalRows ? (cell.count / totalRows) * 100 : 0;
      if (metric.kind === 'average') return cell.numericCount ? cell.sum / cell.numericCount : 0;
      return cell.count;
    };
    const seriesList = Array.from(series).sort((a, b) => {
      const countA = Array.from(cells.values()).filter(cell => cell.series === a).reduce((sum, cell) => sum + cell.count, 0);
      const countB = Array.from(cells.values()).filter(cell => cell.series === b).reduce((sum, cell) => sum + cell.count, 0);
      return countB - countA || a.localeCompare(b, 'es', { sensitivity: 'base' });
    });

    const analysisRows = Array.from(categories).map(categoryName => {
      const rowCells = seriesList.map(seriesName => {
        const cell = cells.get(`${categoryName}\u0000${seriesName}`) || {
          category: categoryName,
          series: seriesName,
          count: 0,
          sum: 0,
          numericCount: 0,
        };
        return { ...cell, value: cellValue(cell) };
      });
      const count = rowCells.reduce((sum, cell) => sum + cell.count, 0);
      const numericCount = rowCells.reduce((sum, cell) => sum + cell.numericCount, 0);
      const sum = rowCells.reduce((total, cell) => total + cell.sum, 0);
      const sortValue = metric.kind === 'average'
        ? (numericCount ? sum / numericCount : 0)
        : rowCells.reduce((total, cell) => total + cell.value, 0);
      return { category: categoryName, cells: rowCells, count, sortValue };
    });

    if (options.order === 'alphabetical' || dimensionKey === 'month') {
      analysisRows.sort((a, b) => a.category.localeCompare(b.category, 'es', { sensitivity: 'base' }));
    } else {
      analysisRows.sort((a, b) => b.sortValue - a.sortValue || a.category.localeCompare(b.category, 'es', { sensitivity: 'base' }));
    }

    const values = analysisRows.flatMap(row => row.cells.map(cell => cell.value));
    const maxValue = values.length ? Math.max(...values, 0) : 0;
    const stackedMax = analysisRows.length
      ? Math.max(...analysisRows.map(row => row.cells.reduce((sum, cell) => sum + cell.value, 0)), 0)
      : 0;
    const title = `${metric.label} por ${dimension.label}${comparison ? ` según ${comparison.label}` : ''}`;
    const exportRows = analysisRows.flatMap(row => row.cells
      .filter(cell => cell.count > 0)
      .map(cell => ({
        variable: row.category,
        comparacion: comparison ? cell.series : '',
        valor: rounded(cell.value, metric.decimals),
        n: cell.count,
      })));
    const scatterPoints = rows.map((row, index) => {
      const x = xAxis.value(row);
      const y = yAxis.value(row);
      if (x === null || y === null) return null;
      const categoryName = category(dimension.value(row));
      const comparisonName = comparison ? category(comparison.value(row)) : '';
      return {
        x,
        y,
        group: comparisonName || categoryName,
        detail: comparisonName ? `${dimension.label}: ${categoryName}` : categoryName,
        record: row.id || index + 1,
      };
    }).filter(Boolean);
    const pointSeries = Array.from(new Set(scatterPoints.map(point => point.group))).sort((a, b) => {
      const countA = scatterPoints.filter(point => point.group === a).length;
      const countB = scatterPoints.filter(point => point.group === b).length;
      return countB - countA || a.localeCompare(b, 'es', { sensitivity: 'base' });
    });
    const scatterTitle = `${yAxis.label} según ${xAxis.label}, agrupado por ${comparison?.label || dimension.label}`;
    const scatterExportRows = scatterPoints.map(point => ({
      grupo: point.group,
      detalle: point.detail,
      eje_x: formatNumericValue(point.x, xAxis),
      eje_y: formatNumericValue(point.y, yAxis),
    }));

    return {
      sourceKey,
      sourceLabel: source.label,
      dimensionKey,
      dimensionLabel: dimension.label,
      compareKey,
      compareLabel: comparison?.label || '',
      metricKey,
      metric,
      title,
      totalRows,
      rows: analysisRows,
      series: seriesList,
      maxValue,
      stackedMax,
      exportRows,
      xAxisKey,
      xAxis,
      yAxisKey,
      yAxis,
      scatterPoints,
      pointSeries,
      scatterTitle,
      scatterExportRows,
      empty: totalRows === 0,
    };
  }

  function rounded(value, decimals) {
    const factor = 10 ** decimals;
    return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
  }

  function formatValue(value, metric) {
    const formatted = new Intl.NumberFormat('es-UY', {
      minimumFractionDigits: metric.decimals,
      maximumFractionDigits: metric.decimals,
    }).format(Number(value || 0));
    return metric.kind === 'percent' ? `${formatted}%` : formatted;
  }

  function formatNumericValue(value, field, compact = false) {
    if (field.kind === 'date') {
      const date = new Date(Number(value));
      if (Number.isNaN(date.getTime())) return 'Sin dato';
      return date.toLocaleDateString('es-UY', compact
        ? { month: 'short', year: '2-digit' }
        : { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    return new Intl.NumberFormat('es-UY', {
      minimumFractionDigits: compact ? 0 : field.decimals,
      maximumFractionDigits: field.decimals,
    }).format(Number(value || 0));
  }

  function escapeXml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  function shortText(value, limit = 26) {
    const text = String(value ?? '');
    return text.length > limit ? `${text.slice(0, limit - 1)}…` : text;
  }

  function seriesLegend(seriesList, startY, startX = 210, columns = 4) {
    const markup = seriesList.map((series, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      const x = startX + column * 210;
      const y = startY + row * 24;
      return `<rect x="${x}" y="${y - 11}" width="12" height="12" rx="2" fill="${COLORS[index % COLORS.length]}"/>`
        + `<text x="${x + 18}" y="${y}" font-size="12" fill="#475569"><title>${escapeXml(series)}</title>${escapeXml(shortText(series, 22))}</text>`;
    }).join('');
    return { markup, height: Math.ceil(seriesList.length / columns) * 24 };
  }

  function legend(model, startY, startX = 210, columns = 4) {
    if (!model.compareKey) return { markup: '', height: 0 };
    return seriesLegend(model.series, startY, startX, columns);
  }

  function svgFrame(model, width, height, content, description, title = model.title) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="analysis-chart-title analysis-chart-description">`
      + `<title id="analysis-chart-title">${escapeXml(title)}</title>`
      + `<desc id="analysis-chart-description">${escapeXml(description)}</desc>`
      + `<rect width="100%" height="100%" fill="#ffffff"/>`
      + `<text x="24" y="32" font-family="Segoe UI, Arial, sans-serif" font-size="18" font-weight="700" fill="#172033">${escapeXml(title)}</text>`
      + `<text x="24" y="52" font-family="Segoe UI, Arial, sans-serif" font-size="12" fill="#637083">Muestra filtrada: N=${model.totalRows}</text>`
      + `<g font-family="Segoe UI, Arial, sans-serif">${content}</g>`
      + '</svg>';
  }

  function renderBars(model, stacked = false) {
    const width = 1120;
    const labelWidth = 220;
    const chartWidth = width - labelWidth - 105;
    const legendInfo = legend(model, 80, labelWidth, 4);
    const top = 82 + legendInfo.height;
    const grouped = model.compareKey && !stacked;
    const rowHeight = grouped ? Math.max(46, model.series.length * 22 + 14) : 48;
    const height = Math.max(260, top + model.rows.length * rowHeight + 62);
    const observedMax = stacked ? model.stackedMax : model.maxValue;
    const fixedMax = stacked ? null : model.metric.scaleMax;
    const scaleMax = Math.max(fixedMax || 0, observedMax || 1);
    let content = legendInfo.markup;

    for (let tick = 0; tick <= 4; tick += 1) {
      const value = (scaleMax / 4) * tick;
      const x = labelWidth + (chartWidth / 4) * tick;
      content += `<line x1="${x}" y1="${top - 8}" x2="${x}" y2="${height - 42}" stroke="#e2e8f0" stroke-width="1"/>`;
      content += `<text x="${x}" y="${height - 20}" text-anchor="middle" font-size="11" fill="#64748b">${escapeXml(formatValue(value, model.metric))}</text>`;
    }

    model.rows.forEach((row, rowIndex) => {
      const rowY = top + rowIndex * rowHeight;
      content += `<text x="${labelWidth - 14}" y="${rowY + rowHeight / 2 + 4}" text-anchor="end" font-size="12" font-weight="600" fill="#334155"><title>${escapeXml(row.category)}</title>${escapeXml(shortText(row.category))}</text>`;
      if (stacked) {
        let offset = 0;
        row.cells.forEach((cell, seriesIndex) => {
          const segmentWidth = (cell.value / scaleMax) * chartWidth;
          if (segmentWidth <= 0) return;
          content += `<rect x="${labelWidth + offset}" y="${rowY + 12}" width="${segmentWidth}" height="24" rx="3" fill="${COLORS[seriesIndex % COLORS.length]}"><title>${escapeXml(`${row.category} · ${cell.series}: ${formatValue(cell.value, model.metric)} (n=${cell.count})`)}</title></rect>`;
          if (segmentWidth > 54) {
            content += `<text x="${labelWidth + offset + segmentWidth / 2}" y="${rowY + 29}" text-anchor="middle" font-size="11" font-weight="700" fill="#ffffff">${escapeXml(formatValue(cell.value, model.metric))}</text>`;
          }
          offset += segmentWidth;
        });
      } else {
        const barHeight = grouped ? 14 : 22;
        const gap = grouped ? 8 : 0;
        row.cells.forEach((cell, seriesIndex) => {
          const y = grouped ? rowY + 7 + seriesIndex * (barHeight + gap) : rowY + 12;
          const barWidth = (cell.value / scaleMax) * chartWidth;
          content += `<rect x="${labelWidth}" y="${y}" width="${barWidth}" height="${barHeight}" rx="3" fill="${COLORS[seriesIndex % COLORS.length]}"><title>${escapeXml(`${row.category}${model.compareKey ? ` · ${cell.series}` : ''}: ${formatValue(cell.value, model.metric)} (n=${cell.count})`)}</title></rect>`;
          content += `<text x="${labelWidth + barWidth + 7}" y="${y + barHeight - 2}" font-size="11" font-weight="600" fill="#334155">${escapeXml(formatValue(cell.value, model.metric))}</text>`;
        });
      }
      content += `<line x1="24" y1="${rowY + rowHeight - 1}" x2="${width - 24}" y2="${rowY + rowHeight - 1}" stroke="#f1f5f9"/>`;
    });

    const description = `${stacked ? 'Gráfico de barras apiladas' : 'Gráfico de barras agrupadas'} con ${model.rows.length} categorías y ${model.series.length} series.`;
    return svgFrame(model, width, height, content, description);
  }

  function heatColor(ratio) {
    const start = [239, 246, 255];
    const end = [29, 78, 216];
    const amount = Math.max(0, Math.min(1, ratio));
    const rgb = start.map((channel, index) => Math.round(channel + (end[index] - channel) * amount));
    return `rgb(${rgb.join(',')})`;
  }

  function renderHeatmap(model) {
    const labelWidth = 220;
    const cellWidth = 112;
    const cellHeight = 42;
    const top = 126;
    const width = Math.max(760, labelWidth + model.series.length * cellWidth + 42);
    const height = Math.max(280, top + model.rows.length * cellHeight + 50);
    const scaleMax = Math.max(model.metric.scaleMax || 0, model.maxValue || 1);
    let content = '';

    model.series.forEach((series, seriesIndex) => {
      const x = labelWidth + seriesIndex * cellWidth + cellWidth / 2;
      content += `<text x="${x}" y="${top - 18}" text-anchor="middle" font-size="11" font-weight="600" fill="#475569"><title>${escapeXml(series)}</title>${escapeXml(shortText(series, 14))}</text>`;
    });
    model.rows.forEach((row, rowIndex) => {
      const y = top + rowIndex * cellHeight;
      content += `<text x="${labelWidth - 14}" y="${y + 27}" text-anchor="end" font-size="12" font-weight="600" fill="#334155"><title>${escapeXml(row.category)}</title>${escapeXml(shortText(row.category))}</text>`;
      row.cells.forEach((cell, seriesIndex) => {
        const x = labelWidth + seriesIndex * cellWidth;
        const ratio = cell.value / scaleMax;
        const fill = heatColor(ratio);
        const textColor = ratio > 0.5 ? '#ffffff' : '#1e293b';
        content += `<rect x="${x + 2}" y="${y + 2}" width="${cellWidth - 4}" height="${cellHeight - 4}" rx="5" fill="${fill}"><title>${escapeXml(`${row.category}${model.compareKey ? ` · ${cell.series}` : ''}: ${formatValue(cell.value, model.metric)} (n=${cell.count})`)}</title></rect>`;
        content += `<text x="${x + cellWidth / 2}" y="${y + 27}" text-anchor="middle" font-size="11" font-weight="700" fill="${textColor}">${escapeXml(formatValue(cell.value, model.metric))}</text>`;
      });
    });
    content += `<text x="24" y="${height - 18}" font-size="11" fill="#64748b">Más intensidad = mayor ${escapeXml(model.metric.shortLabel.toLowerCase())}</text>`;
    return svgFrame(model, width, height, content, `Mapa de calor con ${model.rows.length} filas y ${model.series.length} columnas.`);
  }

  function renderLine(model) {
    const left = 86;
    const right = 70;
    const legendInfo = legend(model, 78, left, 4);
    const top = 92 + legendInfo.height;
    const bottom = 104;
    const height = 620 + legendInfo.height;
    const width = Math.max(1120, left + Math.max(model.rows.length - 1, 1) * 105 + right);
    const chartWidth = width - left - right;
    const chartHeight = height - top - bottom;
    const scaleMax = Math.max(model.metric.scaleMax || 0, model.maxValue || 1);
    const xFor = index => left + (model.rows.length > 1 ? (chartWidth / (model.rows.length - 1)) * index : chartWidth / 2);
    const yFor = value => top + chartHeight - (Number(value || 0) / scaleMax) * chartHeight;
    let content = legendInfo.markup;

    for (let tick = 0; tick <= 5; tick += 1) {
      const value = (scaleMax / 5) * tick;
      const y = top + chartHeight - (chartHeight / 5) * tick;
      content += `<line x1="${left}" y1="${y}" x2="${width - right}" y2="${y}" stroke="#e2e8f0"/>`;
      content += `<text x="${left - 12}" y="${y + 4}" text-anchor="end" font-size="11" fill="#64748b">${escapeXml(formatValue(value, model.metric))}</text>`;
    }

    model.series.forEach((series, seriesIndex) => {
      const points = model.rows.map((row, rowIndex) => {
        const cell = row.cells.find(candidate => candidate.series === series);
        return { x: xFor(rowIndex), y: yFor(cell?.value || 0), cell, category: row.category };
      });
      const path = points.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ');
      content += `<path d="${path}" fill="none" stroke="${COLORS[seriesIndex % COLORS.length]}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>`;
      points.forEach(point => {
        const value = point.cell?.value || 0;
        content += `<circle cx="${point.x}" cy="${point.y}" r="5" fill="#ffffff" stroke="${COLORS[seriesIndex % COLORS.length]}" stroke-width="3"><title>${escapeXml(`${point.category}${model.compareKey ? ` · ${series}` : ''}: ${formatValue(value, model.metric)}`)}</title></circle>`;
      });
    });

    model.rows.forEach((row, index) => {
      const x = xFor(index);
      const y = top + chartHeight + 20;
      content += `<text x="${x}" y="${y}" transform="rotate(-32 ${x} ${y})" text-anchor="end" font-size="11" fill="#475569"><title>${escapeXml(row.category)}</title>${escapeXml(shortText(row.category, 20))}</text>`;
    });
    content += `<text x="${left + chartWidth / 2}" y="${height - 18}" text-anchor="middle" font-size="12" font-weight="700" fill="#334155">${escapeXml(model.dimensionLabel)}</text>`;
    return svgFrame(model, width, height, content, `Gráfico de líneas con ${model.rows.length} categorías y ${model.series.length} series.`);
  }

  function polygonPoints(centerX, centerY, radius, count) {
    return Array.from({ length: count }, (_, index) => {
      const angle = -Math.PI / 2 + (Math.PI * 2 * index) / count;
      return { x: centerX + Math.cos(angle) * radius, y: centerY + Math.sin(angle) * radius, angle };
    });
  }

  function renderRadar(model) {
    const width = 1120;
    const height = 760;
    if (model.rows.length < 3) {
      const content = '<text x="560" y="360" text-anchor="middle" font-size="16" font-weight="700" fill="#475569">El radar necesita al menos tres categorías visibles.</text>'
        + '<text x="560" y="388" text-anchor="middle" font-size="13" fill="#64748b">Amplía los filtros o elige otra variable principal.</text>';
      return svgFrame(model, width, height, content, 'No hay categorías suficientes para construir un gráfico radar.');
    }

    const rows = model.rows.slice(0, 12);
    const seriesList = model.series.slice(0, 8);
    const centerX = 430;
    const centerY = 410;
    const radius = 270;
    const axes = polygonPoints(centerX, centerY, radius, rows.length);
    const scaleMax = Math.max(model.metric.scaleMax || 0, model.maxValue || 1);
    let content = '';

    for (let ring = 1; ring <= 5; ring += 1) {
      const ringPoints = polygonPoints(centerX, centerY, radius * (ring / 5), rows.length);
      content += `<polygon points="${ringPoints.map(point => `${point.x},${point.y}`).join(' ')}" fill="${ring === 5 ? '#f8fafc' : 'none'}" fill-opacity=".7" stroke="#cbd5e1" stroke-width="1"/>`;
      content += `<text x="${centerX + 8}" y="${centerY - radius * (ring / 5) + 12}" font-size="10" fill="#64748b">${escapeXml(formatValue(scaleMax * (ring / 5), model.metric))}</text>`;
    }

    axes.forEach((point, index) => {
      const labelRadius = radius + 28;
      const labelX = centerX + Math.cos(point.angle) * labelRadius;
      const labelY = centerY + Math.sin(point.angle) * labelRadius;
      const anchor = Math.abs(labelX - centerX) < 20 ? 'middle' : (labelX > centerX ? 'start' : 'end');
      content += `<line x1="${centerX}" y1="${centerY}" x2="${point.x}" y2="${point.y}" stroke="#dbe1ea"/>`;
      content += `<text x="${labelX}" y="${labelY + 4}" text-anchor="${anchor}" font-size="11" font-weight="600" fill="#334155"><title>${escapeXml(rows[index].category)}</title>${escapeXml(shortText(rows[index].category, 18))}</text>`;
    });

    seriesList.forEach((series, seriesIndex) => {
      const points = rows.map((row, rowIndex) => {
        const value = row.cells.find(cell => cell.series === series)?.value || 0;
        const ratio = Math.max(0, Math.min(1, value / scaleMax));
        return {
          x: centerX + Math.cos(axes[rowIndex].angle) * radius * ratio,
          y: centerY + Math.sin(axes[rowIndex].angle) * radius * ratio,
          value,
          category: row.category,
        };
      });
      const color = COLORS[seriesIndex % COLORS.length];
      content += `<polygon points="${points.map(point => `${point.x},${point.y}`).join(' ')}" fill="${color}" fill-opacity=".12" stroke="${color}" stroke-width="2.5"><title>${escapeXml(series)}</title></polygon>`;
      points.forEach(point => {
        content += `<circle cx="${point.x}" cy="${point.y}" r="3.5" fill="${color}"><title>${escapeXml(`${point.category}${model.compareKey ? ` · ${series}` : ''}: ${formatValue(point.value, model.metric)}`)}</title></circle>`;
      });
    });

    const radarLegend = seriesLegend(seriesList, 130, 790, 1);
    content += radarLegend.markup;
    if (model.rows.length > rows.length || model.series.length > seriesList.length) {
      content += `<text x="790" y="${160 + radarLegend.height}" font-size="11" fill="#64748b">Vista resumida: ${rows.length} categorías y ${seriesList.length} series principales.</text>`;
    }
    return svgFrame(model, width, height, content, `Gráfico radar con ${rows.length} ejes y ${seriesList.length} series.`);
  }

  function renderScatter(model) {
    const width = 1120;
    const height = 680;
    if (!model.scatterPoints.length) {
      const content = '<text x="560" y="330" text-anchor="middle" font-size="16" font-weight="700" fill="#475569">No hay pares numéricos para los ejes seleccionados.</text>';
      return svgFrame(model, width, height, content, 'No hay datos suficientes para construir el gráfico de dispersión.', model.scatterTitle);
    }

    const left = 92;
    const right = 260;
    const top = 88;
    const bottom = 82;
    const chartWidth = width - left - right;
    const chartHeight = height - top - bottom;
    const xValues = model.scatterPoints.map(point => point.x);
    const yValues = model.scatterPoints.map(point => point.y);
    let xMin = model.xAxis.scaleMin ?? Math.min(...xValues);
    let xMax = model.xAxis.scaleMax ?? Math.max(...xValues);
    let yMin = model.yAxis.scaleMin ?? Math.min(...yValues);
    let yMax = model.yAxis.scaleMax ?? Math.max(...yValues);
    if (xMin === xMax) { xMin -= 1; xMax += 1; }
    if (yMin === yMax) { yMin -= 1; yMax += 1; }
    const xPadding = model.xAxis.kind === 'date' ? (xMax - xMin) * .03 : 0;
    const yPadding = model.yAxis.kind === 'date' ? (yMax - yMin) * .03 : 0;
    xMin -= xPadding;
    xMax += xPadding;
    yMin -= yPadding;
    yMax += yPadding;
    const xFor = value => left + ((value - xMin) / (xMax - xMin)) * chartWidth;
    const yFor = value => top + chartHeight - ((value - yMin) / (yMax - yMin)) * chartHeight;
    let content = '';

    for (let tick = 0; tick <= 5; tick += 1) {
      const xValue = xMin + ((xMax - xMin) / 5) * tick;
      const yValue = yMin + ((yMax - yMin) / 5) * tick;
      const x = left + (chartWidth / 5) * tick;
      const y = top + chartHeight - (chartHeight / 5) * tick;
      content += `<line x1="${x}" y1="${top}" x2="${x}" y2="${top + chartHeight}" stroke="#e2e8f0"/>`;
      content += `<line x1="${left}" y1="${y}" x2="${left + chartWidth}" y2="${y}" stroke="#e2e8f0"/>`;
      content += `<text x="${x}" y="${top + chartHeight + 24}" text-anchor="middle" font-size="11" fill="#64748b">${escapeXml(formatNumericValue(xValue, model.xAxis, true))}</text>`;
      content += `<text x="${left - 12}" y="${y + 4}" text-anchor="end" font-size="11" fill="#64748b">${escapeXml(formatNumericValue(yValue, model.yAxis, true))}</text>`;
    }

    model.scatterPoints.forEach((point, index) => {
      const seriesIndex = model.pointSeries.indexOf(point.group);
      const jitter = ((index % 5) - 2) * .8;
      const color = COLORS[(seriesIndex < 0 ? 0 : seriesIndex) % COLORS.length];
      content += `<circle cx="${xFor(point.x) + jitter}" cy="${yFor(point.y) - jitter}" r="5.5" fill="${color}" fill-opacity=".72" stroke="#ffffff" stroke-width="1.5"><title>${escapeXml(`${point.group} · ${point.detail} · ${model.xAxis.label}: ${formatNumericValue(point.x, model.xAxis)} · ${model.yAxis.label}: ${formatNumericValue(point.y, model.yAxis)}`)}</title></circle>`;
    });

    const visibleSeries = model.pointSeries.slice(0, 12);
    content += seriesLegend(visibleSeries, 112, left + chartWidth + 30, 1).markup;
    if (model.pointSeries.length > visibleSeries.length) {
      content += `<text x="${left + chartWidth + 30}" y="${132 + visibleSeries.length * 24}" font-size="11" fill="#64748b">+${model.pointSeries.length - visibleSeries.length} grupos adicionales</text>`;
    }
    content += `<text x="${left + chartWidth / 2}" y="${height - 18}" text-anchor="middle" font-size="12" font-weight="700" fill="#334155">${escapeXml(model.xAxis.label)}</text>`;
    content += `<text x="22" y="${top + chartHeight / 2}" transform="rotate(-90 22 ${top + chartHeight / 2})" text-anchor="middle" font-size="12" font-weight="700" fill="#334155">${escapeXml(model.yAxis.label)}</text>`;
    return svgFrame(model, width, height, content, `Gráfico de dispersión con ${model.scatterPoints.length} observaciones y ${model.pointSeries.length} grupos.`, model.scatterTitle);
  }

  function renderSvg(model, chartType = 'bars') {
    if (!model || model.empty) return '';
    if (chartType === 'heatmap') return renderHeatmap(model);
    if (chartType === 'line') return renderLine(model);
    if (chartType === 'radar') return renderRadar(model);
    if (chartType === 'scatter') return renderScatter(model);
    if (chartType === 'stacked' && model.metric.kind !== 'average') return renderBars(model, true);
    return renderBars(model, false);
  }

  const DEFAULT_PROGRAM_TARGETS = {
    participants: 300,
    cohorts: 10,
    completionRatePct: 80,
    relativeImprovementPct: 20,
  };

  function meanOf(numbers) {
    if (!numbers.length) return null;
    const sum = numbers.reduce((acc, value) => acc + value, 0);
    return rounded(sum / numbers.length, 1);
  }

  function sortByTimestampAsc(rows) {
    return rows.slice().sort((a, b) => {
      const timeA = new Date(a.timestamp || 0).getTime();
      const timeB = new Date(b.timestamp || 0).getTime();
      const validA = Number.isFinite(timeA) ? timeA : 0;
      const validB = Number.isFinite(timeB) ? timeB : 0;
      return validA - validB;
    });
  }

  function computeStageStats(rows, phaseKey) {
    const stageRows = rows.filter(row => String(row.measurementPhase || '').trim() === phaseKey);
    const participants = new Set();
    const evidences = [];
    const answers = [];
    const literacyScores = [];

    stageRows.forEach(row => {
      const pid = String(row.participantId || '').trim();
      if (pid) participants.add(pid);
      const ev = finiteNumber(row.evidence);
      if (ev !== null) evidences.push(ev);
      const ans = finiteNumber(row.answersCount);
      if (ans !== null) answers.push(ans);
      const lit = finiteNumber(row.literacyScore);
      if (lit !== null) literacyScores.push(lit);
    });

    return {
      key: phaseKey,
      label: phaseLabel(phaseKey),
      count: stageRows.length,
      uniqueParticipants: participants.size,
      averageEvidence: meanOf(evidences),
      averageAnswers: meanOf(answers),
      averageLiteracyScore: meanOf(literacyScores),
      literacyCount: literacyScores.length,
    };
  }

  function computePairedComparison(rows) {
    const byParticipant = new Map();
    rows.forEach(row => {
      const pid = String(row.participantId || '').trim();
      if (!pid) return;
      const list = byParticipant.get(pid) || [];
      list.push(row);
      byParticipant.set(pid, list);
    });

    let baselineParticipants = 0;
    let finalParticipants = 0;
    let followupParticipants = 0;
    const pairs = [];

    byParticipant.forEach((participantRows, participantId) => {
      const sorted = sortByTimestampAsc(participantRows);
      const baselines = sorted.filter(r => String(r.measurementPhase || '').trim() === 'baseline');
      const finals = sorted.filter(r => String(r.measurementPhase || '').trim() === 'final');
      const followups = sorted.filter(r => String(r.measurementPhase || '').trim() === 'followup');

      if (baselines.length > 0) baselineParticipants += 1;
      if (finals.length > 0) finalParticipants += 1;
      if (followups.length > 0) followupParticipants += 1;

      if (baselines.length > 0 && finals.length > 0) {
        const firstBaseline = baselines[0];
        const lastFinal = finals[finals.length - 1];
        const baseEv = finiteNumber(firstBaseline.evidence);
        const finalEv = finiteNumber(lastFinal.evidence);
        const baseLit = finiteNumber(firstBaseline.literacyScore);
        const finalLit = finiteNumber(lastFinal.literacyScore);
        const deltaLit = (baseLit !== null && finalLit !== null)
          ? rounded(finalLit - baseLit, 1)
          : null;
        const relLitPct = (baseLit !== null && baseLit > 0 && finalLit !== null)
          ? rounded(((finalLit - baseLit) / baseLit) * 100, 1)
          : null;

        if (baseEv !== null && finalEv !== null) {
          const delta = rounded(finalEv - baseEv, 1);
          const relPct = baseEv > 0 ? rounded(((finalEv - baseEv) / baseEv) * 100, 1) : null;
          pairs.push({
            participantId,
            cohortCode: String(lastFinal.cohortCode || firstBaseline.cohortCode || '').trim() || 'Sin cohorte',
            baselineEvidence: baseEv,
            finalEvidence: finalEv,
            delta,
            relativeChangePct: relPct,
            improved: finalEv > baseEv,
            baselineLiteracy: baseLit,
            finalLiteracy: finalLit,
            deltaLiteracy: deltaLit,
            relativeLiteracyPct: relLitPct,
            improvedLiteracy: (baseLit !== null && finalLit !== null) ? finalLit > baseLit : null,
          });
        }
      }
    });

    const pairedCount = pairs.length;
    const baselineMean = meanOf(pairs.map(p => p.baselineEvidence));
    const finalMean = meanOf(pairs.map(p => p.finalEvidence));
    const deltaMean = meanOf(pairs.map(p => p.delta));
    const relativeChangePct = baselineMean !== null && baselineMean > 0 && finalMean !== null
      ? rounded(((finalMean - baselineMean) / baselineMean) * 100, 1)
      : null;
    const improvedCount = pairs.filter(p => p.improved).length;
    const improvedPct = pairedCount > 0 ? rounded((improvedCount / pairedCount) * 100, 1) : null;
    const pairedCompletionRatePct = baselineParticipants > 0
      ? rounded((pairedCount / baselineParticipants) * 100, 1)
      : null;

    const literacyPairs = pairs.filter(p => p.baselineLiteracy !== null && p.finalLiteracy !== null);
    const baselineLiteracyMean = meanOf(literacyPairs.map(p => p.baselineLiteracy));
    const finalLiteracyMean = meanOf(literacyPairs.map(p => p.finalLiteracy));
    const deltaLiteracyMean = meanOf(literacyPairs.map(p => p.deltaLiteracy));
    const relativeLiteracyChangePct = baselineLiteracyMean !== null && baselineLiteracyMean > 0 && finalLiteracyMean !== null
      ? rounded(((finalLiteracyMean - baselineLiteracyMean) / baselineLiteracyMean) * 100, 1)
      : null;
    const improvedLiteracyCount = literacyPairs.filter(p => p.improvedLiteracy === true).length;
    const improvedLiteracyPct = literacyPairs.length > 0
      ? rounded((improvedLiteracyCount / literacyPairs.length) * 100, 1)
      : null;

    return {
      trackedParticipants: byParticipant.size,
      baselineParticipants,
      finalParticipants,
      followupParticipants,
      pairedCount,
      baselineMean,
      finalMean,
      deltaMean,
      relativeChangePct,
      improvedCount,
      improvedPct,
      pairedCompletionRatePct,
      literacyPairsCount: literacyPairs.length,
      baselineLiteracyMean,
      finalLiteracyMean,
      deltaLiteracyMean,
      relativeLiteracyChangePct,
      improvedLiteracyCount,
      improvedLiteracyPct,
      pairs,
    };
  }

  function evaluateProgram(inputRows, options = {}) {
    const rawRows = Array.isArray(inputRows) ? inputRows : [];
    const requestedProgram = String(options.programCode || '').trim();
    const programOnly = options.programOnly !== false;
    const targets = { ...DEFAULT_PROGRAM_TARGETS, ...(options.targets || {}) };

    const rows = rawRows.filter(row => {
      if (requestedProgram) {
        return String(row.programCode || '').trim() === requestedProgram;
      }
      if (!programOnly) return true;
      return Boolean(
        String(row.programCode || '').trim() ||
        String(row.cohortCode || '').trim() ||
        String(row.measurementPhase || '').trim()
      );
    });

    const programsSet = new Set();
    const cohortsSet = new Set();
    const participantsSet = new Set();
    let anonymousCompletions = 0;

    rows.forEach(row => {
      const prog = String(row.programCode || '').trim();
      const cohort = String(row.cohortCode || '').trim();
      const pid = String(row.participantId || '').trim();
      if (prog) programsSet.add(prog);
      if (cohort) cohortsSet.add(cohort);
      if (pid) participantsSet.add(pid);
      else anonymousCompletions += 1;
    });

    const stages = {
      baseline: computeStageStats(rows, 'baseline'),
      final: computeStageStats(rows, 'final'),
      followup: computeStageStats(rows, 'followup'),
    };

    const baselineMean = stages.baseline.averageEvidence;
    const finalMean = stages.final.averageEvidence;
    const followupMean = stages.followup.averageEvidence;
    const aggregateDeltaPoints = baselineMean !== null && finalMean !== null
      ? rounded(finalMean - baselineMean, 1)
      : null;
    const aggregateRelativePct = baselineMean !== null && baselineMean > 0 && finalMean !== null
      ? rounded(((finalMean - baselineMean) / baselineMean) * 100, 1)
      : null;
    const overallFollowthroughPct = stages.baseline.count > 0
      ? rounded((stages.final.count / stages.baseline.count) * 100, 1)
      : null;

    const baseLitMean = stages.baseline.averageLiteracyScore;
    const finalLitMean = stages.final.averageLiteracyScore;
    const followupLitMean = stages.followup.averageLiteracyScore;
    const aggregateLiteracyDelta = baseLitMean !== null && finalLitMean !== null
      ? rounded(finalLitMean - baseLitMean, 1)
      : null;
    const aggregateLiteracyRelativePct = baseLitMean !== null && baseLitMean > 0 && finalLitMean !== null
      ? rounded(((finalLitMean - baseLitMean) / baseLitMean) * 100, 1)
      : null;

    const paired = computePairedComparison(rows);

    const rowsByCohort = new Map();
    rows.forEach(row => {
      const cohortKey = String(row.cohortCode || '').trim() || 'Sin cohorte';
      const list = rowsByCohort.get(cohortKey) || [];
      list.push(row);
      rowsByCohort.set(cohortKey, list);
    });

    const cohorts = Array.from(rowsByCohort.entries()).map(([cohortCode, cohortRows]) => {
      const cohortPrograms = new Set();
      const cohortCountries = new Set();
      const cohortParticipants = new Set();
      cohortRows.forEach(r => {
        if (r.programCode) cohortPrograms.add(String(r.programCode).trim());
        if (r.country) cohortCountries.add(String(r.country).trim());
        if (r.participantId) cohortParticipants.add(String(r.participantId).trim());
      });

      const cBaseline = computeStageStats(cohortRows, 'baseline');
      const cFinal = computeStageStats(cohortRows, 'final');
      const cFollowup = computeStageStats(cohortRows, 'followup');
      const cPaired = computePairedComparison(cohortRows);

      const cAggregateDelta = cBaseline.averageEvidence !== null && cFinal.averageEvidence !== null
        ? rounded(cFinal.averageEvidence - cBaseline.averageEvidence, 1)
        : null;
      const cAggregateRelPct = cBaseline.averageEvidence !== null && cBaseline.averageEvidence > 0 && cFinal.averageEvidence !== null
        ? rounded(((cFinal.averageEvidence - cBaseline.averageEvidence) / cBaseline.averageEvidence) * 100, 1)
        : null;
      const cCompletionRate = cPaired.pairedCompletionRatePct !== null
        ? cPaired.pairedCompletionRatePct
        : (cBaseline.count > 0 ? rounded((cFinal.count / cBaseline.count) * 100, 1) : null);

      const cBaseLit = cBaseline.averageLiteracyScore;
      const cFinalLit = cFinal.averageLiteracyScore;
      const cFollowupLit = cFollowup.averageLiteracyScore;
      const cAggLitDelta = cBaseLit !== null && cFinalLit !== null
        ? rounded(cFinalLit - cBaseLit, 1)
        : null;
      const cAggLitRelPct = cBaseLit !== null && cBaseLit > 0 && cFinalLit !== null
        ? rounded(((cFinalLit - cBaseLit) / cBaseLit) * 100, 1)
        : null;

      return {
        cohortCode,
        programCode: Array.from(cohortPrograms).join(', ') || 'Sin programa',
        countries: Array.from(cohortCountries).join(', ') || 'Sin dato',
        totalRows: cohortRows.length,
        uniqueParticipants: cohortParticipants.size,
        baselineCount: cBaseline.count,
        baselineMean: cBaseline.averageEvidence,
        finalCount: cFinal.count,
        finalMean: cFinal.averageEvidence,
        followupCount: cFollowup.count,
        followupMean: cFollowup.averageEvidence,
        aggregateDelta: cAggregateDelta,
        aggregateRelativePct: cAggregateRelPct,
        baselineLiteracyMean: cBaseLit,
        finalLiteracyMean: cFinalLit,
        followupLiteracyMean: cFollowupLit,
        aggregateLiteracyDelta: cAggLitDelta,
        aggregateLiteracyRelativePct: cAggLitRelPct,
        pairedCount: cPaired.pairedCount,
        pairedDeltaMean: cPaired.deltaMean,
        pairedRelativePct: cPaired.relativeChangePct,
        improvedPct: cPaired.improvedPct,
        pairedLiteracyDeltaMean: cPaired.deltaLiteracyMean,
        pairedLiteracyRelativePct: cPaired.relativeLiteracyChangePct,
        improvedLiteracyPct: cPaired.improvedLiteracyPct,
        completionRatePct: cCompletionRate,
      };
    }).sort((a, b) => b.totalRows - a.totalRows || a.cohortCode.localeCompare(b.cohortCode, 'es', { sensitivity: 'base' }));

    const exportRows = cohorts.map(c => ({
      programa: c.programCode,
      cohorte: c.cohortCode,
      paises: c.countries,
      participantes_unicos: c.uniqueParticipants,
      recorridos_totales: c.totalRows,
      n_inicial: c.baselineCount,
      prom_inicial: c.baselineMean ?? '',
      prom_inicial_alfabetizacion: c.baselineLiteracyMean ?? '',
      n_final: c.finalCount,
      prom_final: c.finalMean ?? '',
      prom_final_alfabetizacion: c.finalLiteracyMean ?? '',
      n_seguimiento: c.followupCount,
      prom_seguimiento: c.followupMean ?? '',
      prom_seguimiento_alfabetizacion: c.followupLiteracyMean ?? '',
      n_pareados: c.pairedCount,
      cambio_agregado_pts: c.aggregateDelta ?? '',
      cambio_agregado_alfabetizacion_pts: c.aggregateLiteracyDelta ?? '',
      cambio_pareado_pts: c.pairedDeltaMean ?? '',
      cambio_pareado_pct: c.pairedRelativePct ?? '',
      cambio_pareado_alfabetizacion_pts: c.pairedLiteracyDeltaMean ?? '',
      cambio_pareado_alfabetizacion_pct: c.pairedLiteracyRelativePct ?? '',
      tasa_finalizacion_pct: c.completionRatePct ?? '',
    }));

    const effectiveCompletionRate = paired.pairedCompletionRatePct !== null
      ? paired.pairedCompletionRatePct
      : overallFollowthroughPct;
    const effectiveRelativeImprovement = paired.relativeChangePct !== null
      ? paired.relativeChangePct
      : aggregateRelativePct;

    return {
      empty: rows.length === 0,
      totalProgramRows: rows.length,
      uniqueParticipants: participantsSet.size,
      anonymousCompletions,
      activeCohorts: cohortsSet.size,
      programs: Array.from(programsSet).sort(),
      targets,
      stages,
      aggregateChange: {
        baselineMean,
        finalMean,
        followupMean,
        deltaPoints: aggregateDeltaPoints,
        relativeChangePct: aggregateRelativePct,
        baselineLiteracyMean: baseLitMean,
        finalLiteracyMean: finalLitMean,
        followupLiteracyMean: followupLitMean,
        literacyDeltaPoints: aggregateLiteracyDelta,
        literacyRelativePct: aggregateLiteracyRelativePct,
        overallFollowthroughPct,
      },
      paired,
      cohorts,
      exportRows,
      progress: {
        participantsPct: targets.participants > 0 ? rounded((participantsSet.size / targets.participants) * 100, 1) : 0,
        cohortsPct: targets.cohorts > 0 ? rounded((cohortsSet.size / targets.cohorts) * 100, 1) : 0,
        completionRatePct: effectiveCompletionRate,
        meetsCompletionTarget: effectiveCompletionRate !== null && effectiveCompletionRate >= targets.completionRatePct,
        relativeImprovementPct: effectiveRelativeImprovement,
        meetsImprovementTarget: effectiveRelativeImprovement !== null && effectiveRelativeImprovement >= targets.relativeImprovementPct,
      },
    };
  }

  function formatSigned(value, suffix = '') {
    if (value === null || value === undefined || value === '') return '—';
    const num = Number(value);
    if (!Number.isFinite(num)) return '—';
    const sign = num > 0 ? '+' : '';
    return `${sign}${num.toFixed(1)}${suffix}`;
  }

  function formatProgramReportMarkdown(evalModel) {
    if (!evalModel || evalModel.empty) {
      return '# Informe de Monitoreo y Evaluación (M&E)\n\nNo hay registros de programa disponibles para los filtros seleccionados.\n';
    }

    const programsLabel = evalModel.programs.length ? evalModel.programs.join(', ') : 'Todos los programas con trazabilidad';
    const completionRate = evalModel.progress.completionRatePct !== null ? `${evalModel.progress.completionRatePct}%` : '—';
    const aggDelta = formatSigned(evalModel.aggregateChange.deltaPoints, ' pts');
    const aggRel = formatSigned(evalModel.aggregateChange.relativeChangePct, '%');
    const pairedDelta = formatSigned(evalModel.paired.deltaMean, ' pts');
    const pairedRel = formatSigned(evalModel.paired.relativeChangePct, '%');

    const aggLitDelta = formatSigned(evalModel.aggregateChange.literacyDeltaPoints, ' pts');
    const aggLitRel = formatSigned(evalModel.aggregateChange.literacyRelativePct, '%');
    const pairedLitDelta = formatSigned(evalModel.paired.deltaLiteracyMean, ' pts');
    const pairedLitRel = formatSigned(evalModel.paired.relativeLiteracyChangePct, '%');

    const lines = [
      '# Informe de Monitoreo y Evaluación (M&E) — Programa Binacional Uruguay–EE. UU.',
      '',
      `- **Programa(s):** ${programsLabel}`,
      `- **Recorridos registrados en programa:** ${evalModel.totalProgramRows}`,
      `- **Participantes únicos (ID seudónimo):** ${evalModel.uniqueParticipants} (Meta de referencia: ${evalModel.targets.participants})`,
      `- **Cohortes / instituciones activas:** ${evalModel.activeCohorts} (Meta de referencia: ${evalModel.targets.cohorts})`,
      '',
      '## 1. Indicadores del proyecto frente a metas de referencia',
      '',
      '| Indicador | Valor actual | Meta 2027 | Estado / Avance |',
      '| :--- | :--- | :--- | :--- |',
      `| Participantes con ID seudónimo | ${evalModel.uniqueParticipants} | ${evalModel.targets.participants} | ${evalModel.progress.participantsPct}% de la meta |`,
      `| Instituciones / cohortes activas | ${evalModel.activeCohorts} | ${evalModel.targets.cohorts} | ${evalModel.progress.cohortsPct}% de la meta |`,
      `| Tasa de finalización (Inicial → Final) | ${completionRate} | ${evalModel.targets.completionRatePct}% | ${evalModel.progress.meetsCompletionTarget ? 'Meta alcanzada' : 'En progreso'} |`,
      `| Cambio agregado Pre/Post (Evidencia Ética) | ${aggDelta} (${aggRel}) | +${evalModel.targets.relativeImprovementPct}% | ${evalModel.progress.meetsImprovementTarget ? 'Meta alcanzada' : 'En seguimiento'} |`,
      `| Cambio pareado Evidencia Ética (N=${evalModel.paired.pairedCount}) | ${pairedDelta} (${pairedRel}) | +${evalModel.targets.relativeImprovementPct}% | ${evalModel.paired.improvedPct !== null ? `${evalModel.paired.improvedPct}% mejoró su evidencia` : 'Sin pares aún'} |`,
      `| Cambio agregado Alfabetización IA (lit-v1) | ${aggLitDelta} (${aggLitRel}) | +${evalModel.targets.relativeImprovementPct}% | ${evalModel.aggregateChange.finalLiteracyMean !== null ? 'Medición completa' : 'En progreso'} |`,
      `| Cambio pareado Alfabetización IA (N=${evalModel.paired.literacyPairsCount}) | ${pairedLitDelta} (${pairedLitRel}) | +${evalModel.targets.relativeImprovementPct}% | ${evalModel.paired.improvedLiteracyPct !== null ? `${evalModel.paired.improvedLiteracyPct}% mejoró en lit-v1` : 'Sin pares aún'} |`,
      '',
      '## 2. Resumen por momento de medición',
      '',
      '| Momento | Recorridos (N) | Participantes únicos | Promedio Evidencia Ética | Promedio Alfabetización IA (lit-v1) | Promedio de respuestas |',
      '| :--- | :--- | :--- | :--- | :--- | :--- |',
      `| Diagnóstico inicial (baseline) | ${evalModel.stages.baseline.count} | ${evalModel.stages.baseline.uniqueParticipants} | ${evalModel.stages.baseline.averageEvidence ?? '—'} | ${evalModel.stages.baseline.averageLiteracyScore ?? '—'} | ${evalModel.stages.baseline.averageAnswers ?? '—'} |`,
      `| Evaluación final (final) | ${evalModel.stages.final.count} | ${evalModel.stages.final.uniqueParticipants} | ${evalModel.stages.final.averageEvidence ?? '—'} | ${evalModel.stages.final.averageLiteracyScore ?? '—'} | ${evalModel.stages.final.averageAnswers ?? '—'} |`,
      `| Seguimiento 60–90 días (followup) | ${evalModel.stages.followup.count} | ${evalModel.stages.followup.uniqueParticipants} | ${evalModel.stages.followup.averageEvidence ?? '—'} | ${evalModel.stages.followup.averageLiteracyScore ?? '—'} | ${evalModel.stages.followup.averageAnswers ?? '—'} |`,
      '',
      '## 3. Desglose por cohorte / institución',
      '',
      '| Cohorte | País(es) | Participantes | Inicial (Ética / Lit.) | Final (Ética / Lit.) | Seguimiento (Ética / Lit.) | Pareados (N) | Cambio Δ Ética (Ag. / Par.) | Cambio Δ Lit. (Ag. / Par.) |',
      '| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |',
      ...evalModel.cohorts.map(c => {
        const ini = `${c.baselineMean ?? '—'} / ${c.baselineLiteracyMean ?? '—'}`;
        const fin = `${c.finalMean ?? '—'} / ${c.finalLiteracyMean ?? '—'}`;
        const seg = `${c.followupMean ?? '—'} / ${c.followupLiteracyMean ?? '—'}`;
        const deltaStr = `${formatSigned(c.aggregateDelta, '')} / ${formatSigned(c.pairedDeltaMean, '')}`;
        const litDeltaStr = `${formatSigned(c.aggregateLiteracyDelta, '')} / ${formatSigned(c.pairedLiteracyDeltaMean, '')}`;
        return `| ${c.cohortCode} | ${c.countries} | ${c.uniqueParticipants} | ${ini} | ${fin} | ${seg} | ${c.pairedCount} | ${deltaStr} | ${litDeltaStr} |`;
      }),
      '',
      '## 4. Nota metodológica y resguardo de privacidad',
      '',
      '- **Trazabilidad sin datos personales:** La vinculación entre diagnóstico inicial, evaluación final y seguimiento utiliza exclusivamente un identificador seudónimo (`participantId`) generado en el navegador y autorizado mediante consentimiento informado.',
      '- **Alineación bilateral:** Las rúbricas de evidencia integran los marcos de Uruguay (ANEP, Ceibal, Agesic, Udelar) y Estados Unidos (NIST AI RMF, U.S. Department of Education, IES) junto con UNESCO.',
      '',
    ];

    return lines.join('\n');
  }

  window.AdminAnalysis = {
    sources: Object.entries(SOURCES).map(([key, source]) => ({ key, label: source.label })),
    listDimensions,
    listMetrics,
    listNumericFields,
    aggregate,
    renderSvg,
    formatValue,
    formatNumericValue,
    evaluateProgram,
    formatProgramReportMarkdown,
  };
})();
