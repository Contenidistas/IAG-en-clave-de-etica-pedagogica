/******************************************************
 * IAG EN CLAVE DE ETICA PEDAGOGICA - BACKEND SHEETS
 *
 * Hojas que usa:
 *  - Registros   -> 1 fila por visita anonima o cuestionario completado
 *  - Detalle     -> 1 fila por cuestionario completado, columnas por pregunta
 *  - Docentes    -> copia filtrada de Detalle (profile = docente)
 *  - Estudiantes -> copia filtrada de Detalle (profile = estudiante)
 *  - Valoraciones -> valoraciones y comentarios anonimos de mejora
 *
 * Endpoints:
 *  - doPost(e)              guarda visitas y cuestionarios
 *  - doGet(?action=stats)    devuelve estadisticas agregadas anonimas
 *  - doGet(?action=opinions) devuelve opiniones anonimas destacadas
 ******************************************************/

var SHEET_REGISTROS = 'Registros';
var SHEET_DETALLE = 'Detalle';
var SHEET_DOCENTES = 'Docentes';
var SHEET_ESTUDIANTES = 'Estudiantes';
var SHEET_VALORACIONES = 'Valoraciones';

var REGISTROS_HEADERS = [
  'timestamp',
  'eventType',
  'sessionId',
  'profile',
  'profileKey',
  'userName',
  'country',
  'nivelEducativo',
  'familiaridadInicial',
  'recursosSimilares',
  'consentTracking',
  'evidence',
  'likertLevel',
  'rawPath'
];

var DETALLE_HEADERS = [
  'timestamp',
  'sessionId',
  'profile',
  'profileKey',
  'userName',
  'country',
  'nivelEducativo',
  'familiaridadInicial',
  'recursosSimilares',
  'consentTracking',
  'evidence',
  'likertLevel'
];

var VALORACIONES_HEADERS = [
  'timestamp',
  'eventType',
  'sessionId',
  'rating',
  'suggestion',
  'profile',
  'profileKey',
  'country',
  'nivelEducativo',
  'evidence',
  'likertLevel'
];

function doPost(e) {
  if (!e || !e.postData || !e.postData.contents) {
    return json_({ ok: false, error: 'Sin datos en el POST' });
  }

  var data = JSON.parse(e.postData.contents);
  var lock = LockService.getDocumentLock();

  try {
    lock.waitLock(10000);
    return handlePost_(data);
  } catch (err) {
    return json_({ ok: false, error: err.message || String(err) });
  } finally {
    try {
      lock.releaseLock();
    } catch (releaseErr) {
      // El lock puede no haberse tomado si waitLock falla.
    }
  }
}

function handlePost_(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var shReg = getOrCreateSheet_(ss, SHEET_REGISTROS);
  ensureHeaders_(shReg, REGISTROS_HEADERS);

  var eventType = data.eventType || 'completion';
  var timestamp = data.timestamp || new Date().toISOString();

  appendRegistro_(shReg, data, eventType, timestamp);

  // Las visitas anonimas no se guardan en Detalle ni en hojas por perfil.
  if (eventType === 'visit') {
    return json_({ ok: true, type: 'visit' });
  }

  if (eventType === 'feedback') {
    var shVal = getOrCreateSheet_(ss, SHEET_VALORACIONES);
    ensureHeaders_(shVal, VALORACIONES_HEADERS);
    appendValoracion_(shVal, data, timestamp);
    return json_({ ok: true, type: 'feedback' });
  }

  var shDet = getOrCreateSheet_(ss, SHEET_DETALLE);
  ensureHeaders_(shDet, DETALLE_HEADERS);
  appendDetalle_(shDet, data, timestamp);

  actualizarHojasPerfil_();

  return json_({ ok: true, type: 'completion' });
}

function doGet(e) {
  var action = e && e.parameter ? e.parameter.action : '';

  if (action === 'stats') {
    return json_(buildStats_());
  }

  if (action === 'opinions') {
    return json_(buildOpinions_());
  }

  return json_({
    ok: true,
    message: 'Backend activo. Use ?action=stats o ?action=opinions.'
  });
}

function appendRegistro_(sheet, data, eventType, timestamp) {
  var headers = getHeaders_(sheet);
  var isCompletion = eventType === 'completion';
  var rowObj = {
    timestamp: timestamp,
    eventType: eventType,
    sessionId: data.sessionId || '',
    profile: data.profile || '',
    profileKey: data.profileKey || '',
    userName: isCompletion ? (data.userName || '') : '',
    country: data.country || '',
    nivelEducativo: data.nivelEducativo || '',
    familiaridadInicial: data.familiaridadInicial || '',
    recursosSimilares: data.recursosSimilares || '',
    consentTracking: data.consentTracking ? 'Sí' : 'No',
    evidence: isCompletion || eventType === 'feedback' ? (data.evidence || 0) : '',
    likertLevel: isCompletion || eventType === 'feedback' ? (data.likertLevel || '') : '',
    rawPath: isCompletion ? JSON.stringify(data.path || []) : ''
  };

  appendObjectRow_(sheet, headers, rowObj);
}

function appendValoracion_(sheet, data, timestamp) {
  var headers = getHeaders_(sheet);
  var rowObj = {
    timestamp: timestamp,
    eventType: 'feedback',
    sessionId: data.sessionId || '',
    rating: data.rating || '',
    suggestion: data.suggestion || '',
    profile: data.profile || '',
    profileKey: data.profileKey || '',
    country: data.country || '',
    nivelEducativo: data.nivelEducativo || '',
    evidence: data.evidence || 0,
    likertLevel: data.likertLevel || ''
  };

  appendObjectRow_(sheet, headers, rowObj);
}

function appendDetalle_(sheet, data, timestamp) {
  var headers = getHeaders_(sheet);

  (data.path || []).forEach(function(ans) {
    var q = ans.question;
    if (!q) return;

    if (headers.indexOf(q) === -1) {
      sheet.getRange(1, headers.length + 1).setValue(q);
      headers.push(q);
    }
  });

  var rowObj = {
    timestamp: timestamp,
    sessionId: data.sessionId || '',
    profile: data.profile || '',
    profileKey: data.profileKey || '',
    userName: data.userName || '',
    country: data.country || '',
    nivelEducativo: data.nivelEducativo || '',
    familiaridadInicial: data.familiaridadInicial || '',
    recursosSimilares: data.recursosSimilares || '',
    consentTracking: data.consentTracking ? 'Sí' : 'No',
    evidence: data.evidence || 0,
    likertLevel: data.likertLevel || ''
  };

  (data.path || []).forEach(function(ans) {
    if (!ans.question) return;
    rowObj[ans.question] = normalizeAnswer_(ans.answer);
  });

  appendObjectRow_(sheet, headers, rowObj);
}

function buildStats_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var shReg = getOrCreateSheet_(ss, SHEET_REGISTROS);
  ensureHeaders_(shReg, REGISTROS_HEADERS);
  var shDet = getOrCreateSheet_(ss, SHEET_DETALLE);
  ensureHeaders_(shDet, DETALLE_HEADERS);

  var records = readObjects_(shReg);
  var detailRecords = readObjects_(shDet).filter(isValidCompletionDetail_);

  var visits = records.filter(function(r) {
    return normalizeEventType_(r) === 'visit';
  });
  var feedback = records.filter(function(r) {
    return normalizeEventType_(r) === 'feedback';
  });

  var levels = countBy_(detailRecords, 'likertLevel');
  var profiles = countBy_(detailRecords, 'profile');
  var indicators = weakIndicatorsFromDetalle_(shDet);
  var averageScore = average_(detailRecords.map(function(r) {
    return Number(r.evidence || 0);
  }));
  var uniqueVisits = countUniqueVisits_(visits);

  return {
    summary: {
      visits: uniqueVisits,
      pageViews: visits.length,
      completed: detailRecords.length,
      feedback: feedback.length,
      averageScore: averageScore,
      topLevel: topLabel_(levels)
    },
    levels: objectToRows_(levels),
    profiles: objectToRows_(profiles),
    indicators: objectToRows_(indicators).slice(0, 6),
    updatedAt: new Date().toISOString()
  };
}

function buildOpinions_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var shVal = getOrCreateSheet_(ss, SHEET_VALORACIONES);
  ensureHeaders_(shVal, VALORACIONES_HEADERS);

  var rows = readObjects_(shVal)
    .filter(function(row) {
      return row.suggestion && Number(row.rating || 0) >= 4;
    })
    .sort(function(a, b) {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    })
    .slice(0, 8)
    .map(function(row) {
      return {
        rating: Number(row.rating || 0),
        suggestion: String(row.suggestion || '').slice(0, 240),
        profile: row.profile || '',
        nivelEducativo: row.nivelEducativo || ''
      };
    });

  return {
    opinions: rows,
    updatedAt: new Date().toISOString()
  };
}

function isValidCompletionDetail_(record) {
  return !!(record && record.likertLevel && !isNaN(Number(record.evidence)));
}

function normalizeEventType_(record) {
  if (!record) return '';
  if (record.eventType) return String(record.eventType).trim();
  if (record.rawPath || record.likertLevel) return 'completion';
  return '';
}

function countUniqueVisits_(visits) {
  var seen = {};
  var legacyWithoutSession = 0;

  visits.forEach(function(visit) {
    var sessionId = String(visit.sessionId || '').trim();
    if (sessionId) {
      seen[sessionId] = true;
    } else {
      legacyWithoutSession++;
    }
  });

  return Object.keys(seen).length + legacyWithoutSession;
}

function weakIndicatorsFromDetalle_(sheet) {
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return {};

  var headers = values[0];
  var base = {};
  DETALLE_HEADERS.forEach(function(header) {
    base[header] = true;
  });

  return values.slice(1).reduce(function(acc, row) {
    var record = headers.reduce(function(obj, header, index) {
      obj[header] = row[index];
      return obj;
    }, {});

    if (!isValidCompletionDetail_(record)) return acc;

    headers.forEach(function(header, index) {
      if (base[header]) return;
      if (normalizeAnswer_(row[index]) === 'No') {
        var label = classifyQuestion_(header);
        acc[label] = (acc[label] || 0) + 1;
      }
    });

    return acc;
  }, {});
}

function classifyQuestion_(question) {
  var q = String(question || '').toLowerCase();

  if (q.indexOf('verific') > -1 || q.indexOf('contrast') > -1) {
    return 'Verificación de información';
  }
  if (q.indexOf('autor') > -1 || q.indexOf('cit') > -1 || q.indexOf('asistencia') > -1) {
    return 'Autoría y transparencia';
  }
  if (q.indexOf('sesg') > -1 || q.indexOf('divers') > -1 || q.indexOf('contexto') > -1) {
    return 'Sesgos y contexto';
  }
  if (q.indexOf('regla') > -1 || q.indexOf('permitido') > -1 || q.indexOf('limite') > -1 || q.indexOf('límite') > -1) {
    return 'Reglas claras de uso';
  }
  if (q.indexOf('aporte') > -1 || q.indexOf('personal') > -1 || q.indexOf('original') > -1) {
    return 'Valor agregado humano';
  }
  if (q.indexOf('prompt') > -1 || q.indexOf('proceso') > -1 || q.indexOf('decisiones') > -1) {
    return 'Documentación del proceso';
  }
  if (q.indexOf('previo') > -1 || q.indexOf('base') > -1 || q.indexOf('fundamento') > -1) {
    return 'Conocimientos previos';
  }

  return 'Otros criterios de reflexión';
}

function actualizarHojasPerfil_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var shDet = ss.getSheetByName(SHEET_DETALLE);
  if (!shDet) return;

  var datos = shDet.getDataRange().getValues();
  if (datos.length < 2) return;

  var headers = datos[0];
  var idxProfile = headers.indexOf('profile');
  if (idxProfile === -1) return;

  var shDoc = getOrCreateSheet_(ss, SHEET_DOCENTES);
  var shEst = getOrCreateSheet_(ss, SHEET_ESTUDIANTES);

  shDoc.clearContents();
  shEst.clearContents();
  shDoc.appendRow(headers);
  shEst.appendRow(headers);

  for (var i = 1; i < datos.length; i++) {
    var row = datos[i];
    var prof = row[idxProfile];

    if (prof === 'docente') {
      shDoc.appendRow(row);
    } else if (prof === 'estudiante') {
      shEst.appendRow(row);
    }
  }
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('IAG ética pedagógica')
    .addItem('Actualizar Docentes/Estudiantes', 'actualizarHojasPerfil_')
    .addItem('Ver estadísticas anónimas', 'mostrarStatsEnLog_')
    .addItem('Ver opiniones anónimas', 'mostrarOpinionesEnLog_')
    .addToUi();
}

function mostrarStatsEnLog_() {
  Logger.log(JSON.stringify(buildStats_(), null, 2));
}

function mostrarOpinionesEnLog_() {
  Logger.log(JSON.stringify(buildOpinions_(), null, 2));
}

function getOrCreateSheet_(ss, name) {
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
  }
  return sh;
}

function ensureHeaders_(sheet, requiredHeaders) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(requiredHeaders);
    return;
  }

  var headers = getHeaders_(sheet);
  requiredHeaders.forEach(function(header) {
    if (headers.indexOf(header) === -1) {
      sheet.getRange(1, headers.length + 1).setValue(header);
      headers.push(header);
    }
  });
}

function getHeaders_(sheet) {
  if (sheet.getLastColumn() === 0) return [];
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
}

function appendObjectRow_(sheet, headers, rowObj) {
  var row = headers.map(function(header) {
    return rowObj[header] !== undefined ? rowObj[header] : '';
  });
  sheet.appendRow(row);
}

function readObjects_(sheet) {
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  var headers = values[0];
  return values.slice(1).map(function(row) {
    return headers.reduce(function(obj, header, index) {
      obj[header] = row[index];
      return obj;
    }, {});
  });
}

function normalizeAnswer_(answer) {
  if (answer === true) return 'Sí';
  if (answer === false) return 'No';
  return String(answer || '').trim();
}

function countBy_(records, key) {
  return records.reduce(function(acc, record) {
    var label = record[key] || 'Sin dato';
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});
}

function average_(values) {
  var filtered = values.filter(function(v) {
    return !isNaN(v);
  });
  if (!filtered.length) return 0;
  return filtered.reduce(function(sum, value) {
    return sum + value;
  }, 0) / filtered.length;
}

function objectToRows_(obj) {
  return Object.keys(obj)
    .map(function(label) {
      return { label: label, count: obj[label] };
    })
    .sort(function(a, b) {
      return b.count - a.count;
    });
}

function topLabel_(obj) {
  var rows = objectToRows_(obj);
  return rows.length ? rows[0].label : '';
}

function json_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
