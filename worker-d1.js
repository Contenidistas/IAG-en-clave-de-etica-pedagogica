const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Key',
  'Access-Control-Max-Age': '86400',
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    try {
      if (request.method === 'POST' && url.pathname === '/events') {
        return json(await handleEvent(request, env));
      }

      if (request.method === 'GET' && url.pathname === '/stats') {
        return json(await buildStats(env));
      }

      if (request.method === 'GET' && url.pathname === '/opinions') {
        return json(await buildOpinions(env));
      }

      if (request.method === 'POST' && url.pathname === '/email-report') {
        return json(await sendEmailReport(request, env));
      }

      if (request.method === 'GET' && url.pathname === '/admin/summary') {
        requireAdmin(request, env);
        return json(await buildAdminSummary(env));
      }

      if (request.method === 'GET' && url.pathname === '/admin/completions') {
        requireAdmin(request, env);
        return json(await listCompletions(env));
      }

      if (request.method === 'GET' && url.pathname === '/admin/feedback') {
        requireAdmin(request, env);
        return json(await listFeedback(env));
      }

      if (request.method === 'GET' && url.pathname === '/admin/answers') {
        requireAdmin(request, env);
        return json(await listAnswers(env, url.searchParams.get('eventId')));
      }

      if (request.method === 'GET' && url.pathname === '/admin/export.csv') {
        requireAdmin(request, env);
        return csv(await buildCsvExport(env, url.searchParams.get('type')));
      }

      return json({
        ok: true,
        message: 'Backend D1 activo. Use POST /events, POST /email-report, GET /stats, GET /opinions o rutas /admin protegidas.',
      });
    } catch (error) {
      console.error(error);
      return json({ ok: false, error: error.message || 'Error interno' }, error.status || 500);
    }
  },
};

async function handleEvent(request, env) {
  const data = await request.json();
  const eventType = normalizeEventType(data.eventType);
  const timestamp = data.timestamp || new Date().toISOString();
  const isCompletion = eventType === 'completion';

  if (!eventType) {
    throw new Error('eventType invalido');
  }

  const eventResult = await env.DB.prepare(`
    INSERT INTO events (
      timestamp, event_type, session_id, page, anonymous, profile, profile_key,
      user_name, country, nivel_educativo, familiaridad_inicial,
      recursos_similares, consent_tracking, evidence, likert_level, raw_path
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    timestamp,
    eventType,
    clean(data.sessionId),
    clean(data.page),
    data.anonymous === false ? 0 : 1,
    clean(data.profile),
    clean(data.profileKey),
    isCompletion ? clean(data.userName) : '',
    clean(data.country),
    clean(data.nivelEducativo),
    clean(data.familiaridadInicial),
    clean(data.recursosSimilares),
    data.consentTracking ? 1 : 0,
    isCompletion ? numberOrNull(data.evidence) : null,
    isCompletion ? clean(data.likertLevel) : '',
    isCompletion ? JSON.stringify(data.path || []) : ''
  ).run();

  const eventId = eventResult.meta.last_row_id;

  if (eventType === 'completion') {
    await insertAnswers(env, eventId, data.path || []);
  }

  if (eventType === 'feedback') {
    await insertFeedback(env, eventId, data, timestamp);
  }

  return { ok: true, type: eventType, id: eventId };
}

async function insertAnswers(env, eventId, path) {
  const rows = path
    .filter(item => item && item.question)
    .map(item => env.DB.prepare(`
      INSERT INTO answers (event_id, question_id, question, answer)
      VALUES (?, ?, ?, ?)
    `).bind(
      eventId,
      clean(item.id),
      clean(item.question),
      normalizeAnswer(item.answer)
    ));

  if (rows.length) {
    await env.DB.batch(rows);
  }
}

async function insertFeedback(env, eventId, data, timestamp) {
  const rating = Number(data.rating || 0);
  if (!rating || rating < 1 || rating > 5) {
    throw new Error('rating invalido');
  }

  await env.DB.prepare(`
    INSERT INTO feedback (
      event_id, timestamp, session_id, rating, suggestion, profile, profile_key,
      country, nivel_educativo, evidence, likert_level
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    eventId,
    timestamp,
    clean(data.sessionId),
    rating,
    clean(data.suggestion).slice(0, 800),
    clean(data.profile),
    clean(data.profileKey),
    clean(data.country),
    clean(data.nivelEducativo),
    null,
    ''
  ).run();
}

async function buildStats(env) {
  const summaryRow = await env.DB.prepare(`
    SELECT
      COUNT(DISTINCT CASE WHEN event_type = 'visit' THEN session_id END) AS visits,
      SUM(CASE WHEN event_type = 'visit' THEN 1 ELSE 0 END) AS pageViews,
      SUM(CASE WHEN event_type = 'completion' THEN 1 ELSE 0 END) AS completed,
      SUM(CASE WHEN event_type = 'feedback' THEN 1 ELSE 0 END) AS feedback,
      AVG(CASE WHEN event_type = 'completion' THEN evidence END) AS averageScore
    FROM events
  `).first();

  const levels = await groupedRows(env, 'likert_level', "event_type = 'completion' AND likert_level IS NOT NULL AND likert_level != ''");
  const profiles = await groupedRows(env, 'profile', "event_type = 'completion' AND profile IS NOT NULL AND profile != ''");
  const indicators = await weakIndicators(env);

  return {
    summary: {
      visits: Number(summaryRow?.visits || 0),
      pageViews: Number(summaryRow?.pageViews || 0),
      completed: Number(summaryRow?.completed || 0),
      feedback: Number(summaryRow?.feedback || 0),
      averageScore: Number(summaryRow?.averageScore || 0),
      topLevel: levels.length ? levels[0].label : '',
    },
    levels,
    profiles,
    indicators,
    updatedAt: new Date().toISOString(),
  };
}

function requireAdmin(request, env) {
  const expected = clean(env.ADMIN_KEY);
  const headerKey = clean(request.headers.get('X-Admin-Key'));
  const auth = clean(request.headers.get('Authorization'));
  const bearerKey = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7).trim() : '';

  if (!expected) {
    const error = new Error('ADMIN_KEY no configurada');
    error.status = 500;
    throw error;
  }

  if (headerKey !== expected && bearerKey !== expected) {
    const error = new Error('No autorizado');
    error.status = 401;
    throw error;
  }
}

async function groupedRows(env, column, whereClause) {
  const result = await env.DB.prepare(`
    SELECT ${column} AS label, COUNT(*) AS count
    FROM events
    WHERE ${whereClause}
    GROUP BY ${column}
    ORDER BY count DESC
  `).all();

  return (result.results || []).map(row => ({
    label: row.label || 'Sin dato',
    count: Number(row.count || 0),
  }));
}

async function weakIndicators(env) {
  const result = await env.DB.prepare(`
    SELECT question
    FROM answers
    WHERE answer = 'No'
  `).all();

  const counts = {};
  (result.results || []).forEach(row => {
    const label = classifyQuestion(row.question);
    counts[label] = (counts[label] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

async function buildOpinions(env) {
  const result = await env.DB.prepare(`
    SELECT rating, suggestion, profile, nivel_educativo AS nivelEducativo
    FROM feedback
    WHERE rating >= 4 AND suggestion IS NOT NULL AND suggestion != ''
    ORDER BY timestamp DESC
    LIMIT 8
  `).all();

  return {
    opinions: (result.results || []).map(row => ({
      rating: Number(row.rating || 0),
      suggestion: clean(row.suggestion).slice(0, 240),
      profile: row.profile || '',
      nivelEducativo: row.nivelEducativo || '',
    })),
    updatedAt: new Date().toISOString(),
  };
}

async function sendEmailReport(request, env) {
  const data = await request.json();
  const email = clean(data.email).toLowerCase();

  if (!isValidEmail(email)) {
    const error = new Error('Correo electronico invalido');
    error.status = 400;
    throw error;
  }

  if (data.consentAccepted !== true) {
    const error = new Error('Consentimiento requerido');
    error.status = 400;
    throw error;
  }

  if (!env.RESEND_API_KEY || !env.REPORT_EMAIL_FROM) {
    const error = new Error('Servicio de correo no configurado');
    error.status = 500;
    throw error;
  }

  const report = normalizeEmailReport(data);
  const subject = `Informe IAG etica pedagogica - ${report.likertLevel || 'resultado'}`;
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.REPORT_EMAIL_FROM,
      to: [email],
      reply_to: env.REPORT_EMAIL_REPLY_TO || undefined,
      subject,
      text: buildReportText(report),
      html: buildReportHtml(report),
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    console.error('Resend error', response.status, details);
    const error = new Error('No se pudo enviar el correo');
    error.status = 502;
    throw error;
  }

  return { ok: true };
}

function normalizeEmailReport(data) {
  return {
    participantName: clean(data.participantName).slice(0, 120) || 'No indicado',
    profile: clean(data.profile).slice(0, 160),
    evidence: numberOrNull(data.evidence),
    likertLevel: clean(data.likertLevel).slice(0, 120),
    levelDescription: clean(data.levelDescription).slice(0, 900),
    synthesis: clean(data.synthesis).slice(0, 2200),
    improvements: normalizeReportItems(data.improvements, 8),
    includeAnswers: data.includeAnswers === true,
    answers: data.includeAnswers === true ? normalizeReportItems(data.answers, 20) : [],
    references: normalizeStringList(data.references, 8),
  };
}

function normalizeReportItems(items, limit) {
  if (!Array.isArray(items)) return [];
  return items.slice(0, limit).map(item => ({
    number: numberOrNull(item.number),
    title: clean(item.title || item.question).slice(0, 300),
    question: clean(item.question || item.title).slice(0, 300),
    answer: clean(item.answer).slice(0, 20),
    feedback: clean(item.feedback).slice(0, 700),
    recommendation: clean(item.recommendation).slice(0, 1300),
  })).filter(item => item.title || item.question || item.feedback || item.recommendation);
}

function normalizeStringList(items, limit) {
  if (!Array.isArray(items)) return [];
  return items.slice(0, limit).map(item => clean(item).slice(0, 300)).filter(Boolean);
}

function buildReportText(report) {
  const lines = [
    'IAG en clave de etica pedagogica',
    'Informe de reflexion y mejoras propuestas',
    '',
    `Participante: ${report.participantName}`,
    `Perfil: ${report.profile || 'No indicado'}`,
    `Puntaje: ${report.evidence ?? 'No indicado'}`,
    `Nivel: ${report.likertLevel || 'No indicado'}`,
    '',
    'Descripcion del nivel:',
    report.levelDescription,
    '',
    'Lectura desde marcos de referencia:',
    report.synthesis,
    '',
    'Mejoras propuestas:',
    ...report.improvements.flatMap((item, index) => [
      `${index + 1}. ${item.title || item.question}`,
      item.feedback ? `   ${item.feedback}` : '',
      item.recommendation ? `   ${item.recommendation}` : '',
    ]),
  ];

  if (report.includeAnswers && report.answers.length) {
    lines.push('', 'Respuestas incluidas por consentimiento:');
    report.answers.forEach((item, index) => {
      lines.push(`${index + 1}. ${item.question || item.title}`);
      lines.push(`   Respuesta: ${item.answer || 'No indicada'}`);
      if (item.feedback) lines.push(`   Retroalimentacion: ${item.feedback}`);
    });
  }

  if (report.references.length) {
    lines.push('', 'Referencias:', ...report.references.map(ref => `- ${ref}`));
  }

  lines.push('', 'Confidencialidad: este correo fue enviado a solicitud de la persona usuaria. La direccion de correo no se guarda en la base de datos de la herramienta.');
  return lines.filter(line => line !== '').join('\n');
}

function buildReportHtml(report) {
  const improvements = report.improvements.map((item, index) => `
    <li>
      <strong>${index + 1}. ${escapeHtml(item.title || item.question)}</strong>
      ${item.feedback ? `<p>${escapeHtml(item.feedback)}</p>` : ''}
      ${item.recommendation ? `<p>${escapeHtml(item.recommendation)}</p>` : ''}
    </li>
  `).join('');

  const answers = report.includeAnswers && report.answers.length ? `
    <h2>Respuestas incluidas por consentimiento</h2>
    <ol>
      ${report.answers.map((item, index) => `
        <li>
          <strong>${index + 1}. ${escapeHtml(item.question || item.title)}</strong>
          <p>Respuesta: ${escapeHtml(item.answer || 'No indicada')}</p>
          ${item.feedback ? `<p>${escapeHtml(item.feedback)}</p>` : ''}
        </li>
      `).join('')}
    </ol>
  ` : '';

  return `<!doctype html>
  <html lang="es">
    <body style="margin:0;padding:24px;background:#fff7ed;color:#1f2937;font-family:Arial,sans-serif;">
      <main style="max-width:720px;margin:0 auto;background:#ffffff;border:1px solid #fed7aa;border-radius:12px;padding:24px;">
        <p style="margin:0 0 8px;color:#c2410c;font-weight:700;text-transform:uppercase;letter-spacing:.04em;">IAG en clave de etica pedagogica</p>
        <h1 style="margin:0 0 16px;color:#111827;font-size:24px;">Informe de reflexión y mejoras propuestas</h1>
        <p><strong>Participante:</strong> ${escapeHtml(report.participantName)}</p>
        <p><strong>Perfil:</strong> ${escapeHtml(report.profile || 'No indicado')}</p>
        <p><strong>Puntaje:</strong> ${escapeHtml(report.evidence ?? 'No indicado')}</p>
        <p><strong>Nivel:</strong> ${escapeHtml(report.likertLevel || 'No indicado')}</p>
        <h2 style="color:#9a3412;font-size:18px;">Descripción del nivel</h2>
        <p>${escapeHtml(report.levelDescription)}</p>
        <h2 style="color:#9a3412;font-size:18px;">Lectura desde marcos de referencia</h2>
        <p>${escapeHtml(report.synthesis)}</p>
        <h2 style="color:#9a3412;font-size:18px;">Mejoras propuestas</h2>
        <ol>${improvements}</ol>
        ${answers}
        ${report.references.length ? `<h2 style="color:#9a3412;font-size:18px;">Referencias</h2><ul>${report.references.map(ref => `<li>${escapeHtml(ref)}</li>`).join('')}</ul>` : ''}
        <p style="margin-top:24px;color:#6b7280;font-size:13px;">Confidencialidad: este correo fue enviado a solicitud de la persona usuaria. La dirección de correo no se guarda en la base de datos de la herramienta.</p>
      </main>
    </body>
  </html>`;
}

async function buildAdminSummary(env) {
  const stats = await buildStats(env);

  const feedbackRow = await env.DB.prepare(`
    SELECT COUNT(*) AS totalFeedback, AVG(rating) AS averageRating
    FROM feedback
  `).first();

  const recentRows = await env.DB.prepare(`
    SELECT event_type AS type, COUNT(*) AS count
    FROM events
    WHERE datetime(timestamp) >= datetime('now', '-7 days')
    GROUP BY event_type
  `).all();

  return {
    ...stats,
    admin: {
      totalFeedback: Number(feedbackRow?.totalFeedback || 0),
      averageRating: Number(feedbackRow?.averageRating || 0),
      recent: (recentRows.results || []).map(row => ({
        type: row.type,
        count: Number(row.count || 0),
      })),
    },
  };
}

async function listCompletions(env) {
  const result = await env.DB.prepare(`
    SELECT
      e.id,
      e.timestamp,
      e.session_id AS sessionId,
      e.user_name AS userName,
      e.profile,
      e.profile_key AS profileKey,
      e.country,
      e.nivel_educativo AS nivelEducativo,
      e.familiaridad_inicial AS familiaridadInicial,
      e.recursos_similares AS recursosSimilares,
      e.evidence,
      e.likert_level AS likertLevel,
      COUNT(a.id) AS answersCount
    FROM events e
    LEFT JOIN answers a ON a.event_id = e.id
    WHERE e.event_type = 'completion'
    GROUP BY e.id
    ORDER BY e.timestamp DESC
    LIMIT 500
  `).all();

  return { completions: result.results || [], updatedAt: new Date().toISOString() };
}

async function listFeedback(env) {
  const result = await env.DB.prepare(`
    SELECT
      id,
      event_id AS eventId,
      timestamp,
      session_id AS sessionId,
      rating,
      suggestion,
      profile,
      profile_key AS profileKey,
      country,
      nivel_educativo AS nivelEducativo
    FROM feedback
    ORDER BY timestamp DESC
    LIMIT 500
  `).all();

  return { feedback: result.results || [], updatedAt: new Date().toISOString() };
}

async function listAnswers(env, eventId) {
  const numericEventId = Number(eventId || 0);
  const statement = numericEventId
    ? env.DB.prepare(`
        SELECT id, event_id AS eventId, question_id AS questionId, question, answer, created_at AS createdAt
        FROM answers
        WHERE event_id = ?
        ORDER BY id
      `).bind(numericEventId)
    : env.DB.prepare(`
        SELECT id, event_id AS eventId, question_id AS questionId, question, answer, created_at AS createdAt
        FROM answers
        ORDER BY created_at DESC
        LIMIT 500
      `);

  const result = await statement.all();
  return { answers: result.results || [], updatedAt: new Date().toISOString() };
}

async function buildCsvExport(env, type) {
  const exportType = clean(type || 'completions');

  if (exportType === 'feedback') {
    const data = await listFeedback(env);
    return {
      filename: 'feedback.csv',
      rows: data.feedback,
      columns: ['id', 'eventId', 'timestamp', 'sessionId', 'rating', 'suggestion', 'profile', 'profileKey', 'country', 'nivelEducativo'],
    };
  }

  if (exportType === 'answers') {
    const data = await listAnswers(env);
    return {
      filename: 'answers.csv',
      rows: data.answers,
      columns: ['id', 'eventId', 'questionId', 'question', 'answer', 'createdAt'],
    };
  }

  if (exportType === 'events') {
    const result = await env.DB.prepare(`
      SELECT
        id, timestamp, event_type AS eventType, session_id AS sessionId, page,
        profile, profile_key AS profileKey, user_name AS userName, country,
        nivel_educativo AS nivelEducativo, familiaridad_inicial AS familiaridadInicial,
        recursos_similares AS recursosSimilares, evidence, likert_level AS likertLevel,
        created_at AS createdAt
      FROM events
      ORDER BY timestamp DESC
      LIMIT 1000
    `).all();

    return {
      filename: 'events.csv',
      rows: result.results || [],
      columns: ['id', 'timestamp', 'eventType', 'sessionId', 'page', 'profile', 'profileKey', 'userName', 'country', 'nivelEducativo', 'familiaridadInicial', 'recursosSimilares', 'evidence', 'likertLevel', 'createdAt'],
    };
  }

  const data = await listCompletions(env);
  return {
    filename: 'completions.csv',
    rows: data.completions,
    columns: ['id', 'timestamp', 'sessionId', 'userName', 'profile', 'profileKey', 'country', 'nivelEducativo', 'familiaridadInicial', 'recursosSimilares', 'evidence', 'likertLevel', 'answersCount'],
  };
}

function normalizeEventType(value) {
  const eventType = clean(value || 'completion');
  return ['visit', 'completion', 'feedback'].includes(eventType) ? eventType : '';
}

function normalizeAnswer(answer) {
  if (answer === true) return 'Sí';
  if (answer === false) return 'No';
  return clean(answer);
}

function clean(value) {
  return String(value ?? '').trim();
}

function escapeHtml(value) {
  return clean(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) && value.length <= 254;
}

function numberOrNull(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function classifyQuestion(question) {
  const q = clean(question).toLowerCase();

  if (q.includes('verific') || q.includes('contrast')) return 'Verificación de información';
  if (q.includes('autor') || q.includes('cit') || q.includes('asistencia')) return 'Autoría y transparencia';
  if (q.includes('sesg') || q.includes('divers') || q.includes('contexto')) return 'Sesgos y contexto';
  if (q.includes('regla') || q.includes('permitido') || q.includes('limite') || q.includes('límite')) return 'Reglas claras de uso';
  if (q.includes('aporte') || q.includes('personal') || q.includes('original')) return 'Valor agregado humano';
  if (q.includes('prompt') || q.includes('proceso') || q.includes('decisiones')) return 'Documentación del proceso';
  if (q.includes('previo') || q.includes('base') || q.includes('fundamento')) return 'Conocimientos previos';

  return 'Otros criterios de reflexión';
}

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

function csv(exportData) {
  const body = toCsv(exportData.rows, exportData.columns);
  return new Response(body, {
    status: 200,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${exportData.filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}

function toCsv(rows, columns) {
  const header = columns.join(',');
  const lines = (rows || []).map(row => (
    columns.map(column => csvCell(row[column])).join(',')
  ));

  return [header, ...lines].join('\r\n');
}

function csvCell(value) {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}
