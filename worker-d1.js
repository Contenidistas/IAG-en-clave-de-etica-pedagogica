const DEFAULT_ALLOWED_ORIGINS = [
  'https://contenidistas.github.io',
  'https://santiherben.github.io',
  'http://localhost:8787',
  'http://localhost:8000',
  'http://127.0.0.1:8787',
  'http://127.0.0.1:8000',
];

const BASE_CORS_HEADERS = {
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Key, X-API-Key',
  'Access-Control-Max-Age': '86400',
};

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

const VALID_PROFILES = ['docente', 'estudiante', 'especializado'];
const VALID_LIKERT_LEVELS = [
  'Amplio margen de mejora',
  'En proceso inicial',
  'Desarrollo progresivo',
  'Prácticas consolidadas',
  'Nivel avanzado',
];

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(request, env) });
    }

    const url = new URL(request.url);

    try {
      if (request.method === 'POST' && !isAllowedRequestOrigin(request, env)) {
        return json({ ok: false, error: 'Origen no permitido' }, 403, request, env);
      }

      if (request.method === 'POST' && url.pathname === '/events') {
        return json(await handleEvent(request, env), 200, request, env);
      }

      if (request.method === 'POST' && url.pathname === '/chat') {
        return json(await handleChat(request, env), 200, request, env);
      }

      if (request.method === 'GET' && url.pathname === '/stats') {
        return json(await buildStats(env), 200, request, env);
      }

      if (request.method === 'GET' && url.pathname === '/opinions') {
        return json(await buildOpinions(env), 200, request, env);
      }
      if (request.method === 'GET' && url.pathname === '/admin/summary') {
        requireAdmin(request, env);
        return json(await buildAdminSummary(env), 200, request, env);
      }

      if (request.method === 'GET' && url.pathname === '/admin/completions') {
        requireAdmin(request, env);
        return json(await listCompletions(env), 200, request, env);
      }

      if (request.method === 'GET' && url.pathname === '/admin/feedback') {
        requireAdmin(request, env);
        return json(await listFeedback(env), 200, request, env);
      }

      if (request.method === 'GET' && url.pathname === '/admin/answers') {
        requireAdmin(request, env);
        return json(await listAnswers(env, url.searchParams.get('eventId')), 200, request, env);
      }

      if (request.method === 'GET' && url.pathname === '/admin/export.csv') {
        requireAdmin(request, env);
        return csv(await buildCsvExport(env, url.searchParams.get('type')), request, env);
      }

      if (request.method === 'GET' && url.pathname === '/admin/export.zip') {
        requireAdmin(request, env);
        return zip(await buildZipExport(env, url.searchParams), request, env);
      }

      if (request.method === 'POST' && url.pathname === '/admin/reset-data') {
        requireAdmin(request, env);
        return json(await resetAdminData(request, env), 200, request, env);
      }

      if (request.method === 'POST' && url.pathname === '/admin/delete-selected') {
        requireAdmin(request, env);
        return json(await deleteSelectedAdminData(request, env), 200, request, env);
      }

      return json({ ok: false, error: 'Not found' }, 404, request, env);
    } catch (error) {
      console.error(error);
      const status = error.status || 500;
      const message = status >= 500 ? 'Error interno' : error.message || 'Solicitud inválida';
      return json({ ok: false, error: message }, status, request, env);
    }
  },
};

async function handleEvent(request, env) {
  const data = await request.json();
  const eventType = normalizeEventType(data.eventType);
  const timestamp = new Date().toISOString();
  const isCompletion = eventType === 'completion';

  if (!eventType) {
    throw new Error('eventType invalido');
  }

  const payload = validateEventPayload(eventType, data);

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
    payload.sessionId,
    payload.page,
    data.anonymous === false ? 0 : 1,
    payload.profile,
    payload.profileKey,
    isCompletion ? payload.userName : '',
    payload.country,
    payload.nivelEducativo,
    payload.familiaridadInicial,
    payload.recursosSimilares,
    data.consentTracking ? 1 : 0,
    isCompletion ? payload.evidence : null,
    isCompletion ? payload.likertLevel : '',
    isCompletion ? JSON.stringify(payload.path) : ''
  ).run();

  const eventId = eventResult.meta.last_row_id;

  if (eventType === 'completion') {
    await insertAnswers(env, eventId, payload.path);
  }

  if (eventType === 'feedback') {
    await insertFeedback(env, eventId, payload, timestamp);
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
  await env.DB.prepare(`
    INSERT INTO feedback (
      event_id, timestamp, session_id, rating, suggestion, profile, profile_key,
      country, nivel_educativo, evidence, likert_level
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    eventId,
    timestamp,
    data.sessionId,
    data.rating,
    data.suggestion,
    data.profile,
    data.profileKey,
    data.country,
    data.nivelEducativo,
    null,
    ''
  ).run();
}

function validateEventPayload(eventType, data) {
  const payload = {
    sessionId: boundedClean(data.sessionId, 120),
    page: boundedClean(data.page, 80),
    profile: normalizeProfile(data.profile),
    profileKey: normalizeProfileKey(data.profileKey),
    userName: boundedClean(data.userName, 120),
    country: boundedClean(data.country, 80),
    nivelEducativo: boundedClean(data.nivelEducativo, 120),
    familiaridadInicial: boundedClean(data.familiaridadInicial, 80),
    recursosSimilares: boundedClean(data.recursosSimilares, 80),
    evidence: null,
    likertLevel: '',
    path: [],
    rating: null,
    suggestion: '',
  };

  if ((eventType === 'completion' || eventType === 'feedback') && data.consentTracking !== true) {
    const error = new Error('Consentimiento requerido');
    error.status = 400;
    throw error;
  }

  if (eventType === 'completion') {
    payload.evidence = normalizeScore(data.evidence);
    payload.likertLevel = normalizeLikertLevel(data.likertLevel);
    payload.path = normalizePath(data.path);

    if (!payload.profile || !payload.profileKey || !payload.likertLevel || payload.evidence === null) {
      const error = new Error('Payload de resultado invalido');
      error.status = 400;
      throw error;
    }
  }

  if (eventType === 'feedback') {
    payload.rating = normalizeRating(data.rating);
    payload.suggestion = boundedClean(data.suggestion, 800);

    if (payload.rating === null) {
      const error = new Error('rating invalido');
      error.status = 400;
      throw error;
    }
  }

  return payload;
}

function normalizeProfile(value) {
  const profile = clean(value);
  return VALID_PROFILES.includes(profile) ? profile : '';
}

function normalizeProfileKey(value) {
  const profileKey = clean(value);
  const valid = [
    'docente',
    'estudiante',
    'estudiante_media',
    'estudiante_universitaria',
    'estudiante_formacion',
  ];
  return valid.includes(profileKey) ? profileKey : '';
}

function normalizeLikertLevel(value) {
  const level = clean(value);
  return VALID_LIKERT_LEVELS.includes(level) ? level : '';
}

function normalizeScore(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || number > 100) return null;
  return Math.round(number);
}

function normalizeRating(value) {
  const rating = Number(value);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return null;
  return rating;
}

function normalizePath(path) {
  if (!Array.isArray(path)) return [];

  return path.slice(0, 30)
    .filter(item => item && item.question)
    .map(item => ({
      id: boundedClean(item.id, 80),
      question: boundedClean(item.question, 400),
      answer: normalizeAnswer(item.answer),
    }));
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

  const levels = await groupedRows(
    env,
    'likert_level',
    `event_type = 'completion' AND likert_level IN (${VALID_LIKERT_LEVELS.map(() => '?').join(',')})`,
    VALID_LIKERT_LEVELS
  );
  const profiles = await groupedRows(
    env,
    'profile',
    `event_type = 'completion' AND profile IN (${VALID_PROFILES.map(() => '?').join(',')})`,
    VALID_PROFILES
  );
  const indicators = await weakIndicators(env);
  const education = await groupedRows(
    env,
    'nivel_educativo',
    `event_type = 'completion' AND nivel_educativo IS NOT NULL AND nivel_educativo != ''`
  );
  const insight = buildPedagogicalInsight(indicators, levels, summaryRow);

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
    education,
    insight,
    updatedAt: new Date().toISOString(),
  };
}

async function handleChat(request, env) {
  let data;
  try {
    data = await request.json();
  } catch {
    const error = new Error('Solicitud inválida');
    error.status = 400;
    throw error;
  }

  const message = boundedClean(data.message, 800);
  const context = data.context || {};

  if (!message) {
    const error = new Error('Mensaje vacío');
    error.status = 400;
    throw error;
  }

  if (clean(data.message).length > 800) {
    const error = new Error('Mensaje demasiado largo');
    error.status = 413;
    throw error;
  }

  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) {
    const error = new Error('API key de Gemini no configurada');
    error.status = 500;
    throw error;
  }

  const systemPrompt = `Eres un Asistente Pedagógico experto en educación y uso crítico de inteligencia artificial generativa. 
Trabaja en un contexto educativo donde los usuarios están evaluando su práctica docente con respecto al uso de IA.

Principios:
- Ofrece respuestas breves, claras y contextualizadas (máximo 2 párrafos o 4 viñetas)
- Si la consulta es simple, respondé directo y sin rodeos
- Usá palabras accesibles; si aparece un término técnico, explicalo en una frase corta
- Si el usuario pregunta por la pregunta actual del recorrido, explicá qué está preguntando y cómo pensarla con un ejemplo concreto
- Enfatizá la reflexión crítica sobre IA en educación
- Sé respetuoso con el contexto del usuario (nivel educativo, familiaridad con IA, etc.)
- No evalúes respuestas salvo que se te pida explícitamente
- Sugiere recursos o marcos de referencia solo cuando aporte valor a la consulta`;

  const contextText = limitText(JSON.stringify(context, null, 2), 12000);
  const userMessage = `Contexto del usuario:
${contextText}

Consulta: ${message}`;

  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: userMessage,
              },
            ],
          },
        ],
        systemInstruction: {
          parts: [
            {
              text: systemPrompt,
            },
          ],
        },
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 64,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Gemini API error:', error);
      const geminiError = new Error('El asistente no está disponible en este momento');
      geminiError.status = response.status >= 500 ? 502 : 500;
      throw geminiError;
    }

    const result = await response.json();
    const candidate = result.candidates?.[0];
    const reply = candidate?.content?.parts
      ?.map(part => part.text || '')
      .join('')
      .trim();

    if (!reply) {
      console.warn('Gemini response without text:', JSON.stringify({
        finishReason: candidate?.finishReason,
        promptFeedback: result.promptFeedback,
      }));

      return {
        ok: true,
        reply: 'No pude generar una respuesta útil para esa consulta. Probá reformularla o hacerla más concreta.',
        timestamp: new Date().toISOString(),
      };
    }

    return {
      ok: true,
      reply,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Chat handler error:', error);
    throw error;
  }
}

function limitText(value, maxLength) {
  const text = String(value || '');
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}\n[Contexto recortado por longitud]`;
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

async function groupedRows(env, column, whereClause, values = []) {
  const statement = env.DB.prepare(`
    SELECT ${column} AS label, COUNT(*) AS count
    FROM events
    WHERE ${whereClause}
    GROUP BY ${column}
    ORDER BY count DESC
  `);
  const result = values.length ? await statement.bind(...values).all() : await statement.all();

  return (result.results || []).map(row => ({
    label: row.label || 'Sin dato',
    count: Number(row.count || 0),
  }));
}

async function weakIndicators(env) {
  const result = await env.DB.prepare(`
    SELECT question
    FROM answers
    WHERE answer IN ('No', 'A veces')
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

function buildPedagogicalInsight(indicators, levels, summaryRow) {
  const focus = indicators.length ? indicators[0].label : 'Criterios de uso responsable';
  const average = Number(summaryRow?.averageScore || 0);
  const topLevel = levels.length ? levels[0].label : '';
  let recommendation = 'Reforzar acuerdos explícitos sobre transparencia, verificación, protección de datos y aporte humano.';

  if (focus.includes('Verificación')) {
    recommendation = 'Aparece como prioridad reforzar contraste de fuentes, revisión de alucinaciones y criterios para no tomar la respuesta de IA como evidencia suficiente.';
  } else if (focus.includes('Autoría') || focus.includes('Transparencia')) {
    recommendation = 'Conviene trabajar declaraciones de uso de IA, registro de herramientas y diferenciación entre asistencia automatizada y aporte humano.';
  } else if (focus.includes('Sesgos')) {
    recommendation = 'Se recomienda incorporar revisión de sesgos, accesibilidad, diversidad cultural y pertinencia contextual antes de usar resultados generados.';
  } else if (focus.includes('Reglas')) {
    recommendation = 'El dato sugiere fortalecer acuerdos previos: usos permitidos, límites, evidencias requeridas y consecuencias pedagógicas.';
  }

  if (average && average < 55) {
    recommendation += ' El promedio general indica oportunidad de formación inicial con ejemplos concretos y rúbricas simples.';
  } else if (topLevel) {
    recommendation += ` El nivel más frecuente es "${topLevel}", útil para ajustar futuras orientaciones.`;
  }

  return { focus, recommendation };
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
    LIMIT 5000
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
    LIMIT 5000
  `).all();

  return { feedback: result.results || [], updatedAt: new Date().toISOString() };
}

async function resetAdminData(request, env) {
  const data = await request.json().catch(() => ({}));
  const confirmation = clean(data.confirmation);

  if (confirmation.toUpperCase() !== 'BORRAR DATOS') {
    const error = new Error('Confirmación inválida');
    error.status = 400;
    throw error;
  }

  const eventIds = uniqueNumbers(data.eventIds);
  const feedbackIds = uniqueNumbers(data.feedbackIds);
  const range = dateRangeFromBody(data);
  const hasSelection = eventIds.length > 0 || feedbackIds.length > 0;
  const hasRange = Boolean(range.from || range.to);

  let targetEventIds = eventIds;

  if (feedbackIds.length) {
    const feedbackEventIds = await selectFeedbackEventIds(env, feedbackIds);
    targetEventIds = uniqueNumbers([...targetEventIds, ...feedbackEventIds]);
  }

  if (!hasSelection && hasRange) {
    targetEventIds = await selectEventIdsForRange(env, range);
  }

  const deleted = hasSelection || hasRange
    ? await deleteScopedData(env, targetEventIds, feedbackIds)
    : await deleteAllAdminData(env);

  if (!hasSelection && !hasRange) {
    try {
      await env.DB.prepare("DELETE FROM sqlite_sequence WHERE name IN ('events', 'answers', 'feedback')").run();
    } catch (error) {
      console.warn('No se pudo reiniciar sqlite_sequence:', error.message);
    }
  }

  return {
    ok: true,
    deleted,
    updatedAt: new Date().toISOString(),
  };
}

async function deleteSelectedAdminData(request, env) {
  const data = await request.json().catch(() => ({}));
  const eventIds = uniqueNumbers(data.eventIds);
  const feedbackIds = uniqueNumbers(data.feedbackIds);

  if (!eventIds.length && !feedbackIds.length) {
    const error = new Error('No hay registros seleccionados');
    error.status = 400;
    throw error;
  }

  let targetEventIds = eventIds;

  if (feedbackIds.length) {
    const feedbackEventIds = await selectFeedbackEventIds(env, feedbackIds);
    targetEventIds = uniqueNumbers([...targetEventIds, ...feedbackEventIds]);
  }

  const deleted = await deleteScopedData(env, targetEventIds, feedbackIds);
  const deletedTotal = Number(deleted.events || 0) + Number(deleted.answers || 0) + Number(deleted.feedback || 0);

  if (!deletedTotal) {
    const error = new Error('No se encontraron registros seleccionados para borrar');
    error.status = 404;
    throw error;
  }

  return {
    ok: true,
    deleted,
    updatedAt: new Date().toISOString(),
  };
}

function dateRangeFromBody(data) {
  const rawFrom = clean(data.from);
  const rawTo = clean(data.to);
  const from = normalizeDateParam(rawFrom);
  const to = normalizeDateParam(rawTo);

  if ((rawFrom && !from) || (rawTo && !to)) {
    const error = new Error('Rango de fechas inválido');
    error.status = 400;
    throw error;
  }

  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  return dateRangeFromParams(params);
}

function uniqueNumbers(values) {
  if (!Array.isArray(values)) return [];
  return Array.from(new Set(
    values
      .map(value => Number(value))
      .filter(value => Number.isInteger(value) && value > 0)
  ));
}

async function selectFeedbackEventIds(env, feedbackIds) {
  const rows = await selectRowsByIds(env, `
    SELECT event_id AS eventId
    FROM feedback
    WHERE id IN (__IDS__)
  `, feedbackIds);
  return uniqueNumbers(rows.map(row => row.eventId));
}

async function selectEventIdsForRange(env, range) {
  const where = rangeWhere(range, 'timestamp');
  const result = await runAll(env.DB.prepare(`
    SELECT id
    FROM events
    ${where.sql}
    ORDER BY id
    LIMIT 50000
  `), where.values);
  return uniqueNumbers((result.results || []).map(row => row.id));
}

async function deleteAllAdminData(env) {
  const before = await env.DB.prepare(`
    SELECT
      (SELECT COUNT(*) FROM events) AS events,
      (SELECT COUNT(*) FROM answers) AS answers,
      (SELECT COUNT(*) FROM feedback) AS feedback
  `).first();

  await env.DB.batch([
    env.DB.prepare('DELETE FROM feedback'),
    env.DB.prepare('DELETE FROM answers'),
    env.DB.prepare('DELETE FROM events'),
  ]);

  return {
    events: Number(before?.events || 0),
    answers: Number(before?.answers || 0),
    feedback: Number(before?.feedback || 0),
  };
}

async function deleteScopedData(env, eventIds, feedbackIds) {
  const targetEventIds = uniqueNumbers(eventIds);
  const selectedFeedbackIds = uniqueNumbers(feedbackIds);
  const counts = {
    events: targetEventIds.length ? await countRowsByIds(env, 'events', 'id', targetEventIds) : 0,
    answers: targetEventIds.length ? await countRowsByIds(env, 'answers', 'event_id', targetEventIds) : 0,
    feedback: 0,
  };

  const feedbackByEvent = targetEventIds.length ? await countRowsByIds(env, 'feedback', 'event_id', targetEventIds) : 0;
  const directFeedback = selectedFeedbackIds.length ? await countRowsByIds(env, 'feedback', 'id', selectedFeedbackIds) : 0;
  counts.feedback = Math.max(feedbackByEvent, directFeedback);

  if (selectedFeedbackIds.length) {
    await deleteRowsByIds(env, 'feedback', 'id', selectedFeedbackIds);
  }
  if (targetEventIds.length) {
    await deleteRowsByIds(env, 'feedback', 'event_id', targetEventIds);
    await deleteRowsByIds(env, 'answers', 'event_id', targetEventIds);
    await deleteRowsByIds(env, 'events', 'id', targetEventIds);
  }

  return counts;
}

async function countRowsByIds(env, table, column, ids) {
  let count = 0;
  for (const chunk of chunks(ids, 90)) {
    const placeholders = chunk.map(() => '?').join(',');
    const row = await env.DB.prepare(`
      SELECT COUNT(*) AS count
      FROM ${table}
      WHERE ${column} IN (${placeholders})
    `).bind(...chunk).first();
    count += Number(row?.count || 0);
  }
  return count;
}

async function deleteRowsByIds(env, table, column, ids) {
  for (const chunk of chunks(ids, 90)) {
    const placeholders = chunk.map(() => '?').join(',');
    await env.DB.prepare(`DELETE FROM ${table} WHERE ${column} IN (${placeholders})`).bind(...chunk).run();
  }
}

async function selectRowsByIds(env, sqlTemplate, ids) {
  const rows = [];
  for (const chunk of chunks(ids, 90)) {
    const placeholders = chunk.map(() => '?').join(',');
    const result = await env.DB.prepare(sqlTemplate.replace('__IDS__', placeholders)).bind(...chunk).all();
    rows.push(...(result.results || []));
  }
  return rows;
}

function chunks(values, size) {
  const output = [];
  for (let index = 0; index < values.length; index += size) {
    output.push(values.slice(index, index + size));
  }
  return output;
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
        LIMIT 5000
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
      LIMIT 10000
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

async function buildZipExport(env, searchParams) {
  const range = dateRangeFromParams(searchParams);
  const events = await listEventsForRange(env, range);
  const completions = await listCompletionsForRange(env, range);
  const feedback = await listFeedbackForRange(env, range);
  const answers = await listAnswersForRange(env, range);
  const createdAt = new Date().toISOString();

  const manifest = {
    createdAt,
    range: {
      from: range.fromDate || null,
      to: range.toDate || null,
      fromTimestamp: range.from || null,
      toTimestamp: range.to || null,
    },
    counts: {
      events: events.length,
      completions: completions.length,
      feedback: feedback.length,
      answers: answers.length,
    },
    files: [
      'events.csv',
      'recorridos.csv',
      'valoraciones.csv',
      'respuestas.csv',
      'manifest.json',
    ],
  };

  const files = [
    {
      name: 'events.csv',
      content: toCsv(events, ['id', 'timestamp', 'eventType', 'sessionId', 'page', 'profile', 'profileKey', 'userName', 'country', 'nivelEducativo', 'familiaridadInicial', 'recursosSimilares', 'evidence', 'likertLevel', 'createdAt']),
    },
    {
      name: 'recorridos.csv',
      content: toCsv(completions, ['id', 'timestamp', 'sessionId', 'userName', 'profile', 'profileKey', 'country', 'nivelEducativo', 'familiaridadInicial', 'recursosSimilares', 'evidence', 'likertLevel', 'answersCount']),
    },
    {
      name: 'valoraciones.csv',
      content: toCsv(feedback, ['id', 'eventId', 'timestamp', 'sessionId', 'rating', 'suggestion', 'profile', 'profileKey', 'country', 'nivelEducativo']),
    },
    {
      name: 'respuestas.csv',
      content: toCsv(answers, ['id', 'eventId', 'eventTimestamp', 'questionId', 'question', 'answer', 'createdAt']),
    },
    {
      name: 'manifest.json',
      content: JSON.stringify(manifest, null, 2),
    },
  ];

  const suffix = `${range.fromDate || 'inicio'}_${range.toDate || 'hoy'}`;
  return {
    filename: `corte-datos-${suffix}.zip`,
    body: createZip(files),
  };
}

function dateRangeFromParams(searchParams) {
  const fromDate = normalizeDateParam(searchParams.get('from'));
  const toDate = normalizeDateParam(searchParams.get('to'));

  return {
    fromDate,
    toDate,
    from: fromDate ? `${fromDate}T00:00:00.000Z` : '',
    to: toDate ? `${toDate}T23:59:59.999Z` : '',
  };
}

function normalizeDateParam(value) {
  const text = clean(value);
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : '';
}

function rangeWhere(range, column = 'timestamp') {
  const clauses = [];
  const values = [];
  if (range.from) {
    clauses.push(`datetime(${column}) >= datetime(?)`);
    values.push(range.from);
  }
  if (range.to) {
    clauses.push(`datetime(${column}) <= datetime(?)`);
    values.push(range.to);
  }

  return {
    sql: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '',
    values,
  };
}

async function listEventsForRange(env, range) {
  const where = rangeWhere(range, 'timestamp');
  const result = await runAll(env.DB.prepare(`
    SELECT
      id, timestamp, event_type AS eventType, session_id AS sessionId, page,
      profile, profile_key AS profileKey, user_name AS userName, country,
      nivel_educativo AS nivelEducativo, familiaridad_inicial AS familiaridadInicial,
      recursos_similares AS recursosSimilares, evidence, likert_level AS likertLevel,
      created_at AS createdAt
    FROM events
    ${where.sql}
    ORDER BY timestamp DESC
    LIMIT 20000
  `), where.values);

  return result.results || [];
}

async function listCompletionsForRange(env, range) {
  const where = rangeWhere(range, 'e.timestamp');
  const whereSql = where.sql
    ? `${where.sql} AND e.event_type = 'completion'`
    : "WHERE e.event_type = 'completion'";

  const result = await runAll(env.DB.prepare(`
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
    ${whereSql}
    GROUP BY e.id
    ORDER BY e.timestamp DESC
    LIMIT 10000
  `), where.values);

  return result.results || [];
}

async function listFeedbackForRange(env, range) {
  const where = rangeWhere(range, 'timestamp');
  const result = await runAll(env.DB.prepare(`
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
    ${where.sql}
    ORDER BY timestamp DESC
    LIMIT 10000
  `), where.values);

  return result.results || [];
}

async function listAnswersForRange(env, range) {
  const where = rangeWhere(range, 'e.timestamp');
  const result = await runAll(env.DB.prepare(`
    SELECT
      a.id,
      a.event_id AS eventId,
      e.timestamp AS eventTimestamp,
      a.question_id AS questionId,
      a.question,
      a.answer,
      a.created_at AS createdAt
    FROM answers a
    INNER JOIN events e ON e.id = a.event_id
    ${where.sql}
    ORDER BY e.timestamp DESC, a.id
    LIMIT 50000
  `), where.values);

  return result.results || [];
}

function runAll(statement, values) {
  return values.length ? statement.bind(...values).all() : statement.all();
}

function normalizeEventType(value) {
  const eventType = clean(value || 'completion');
  return ['visit', 'completion', 'feedback'].includes(eventType) ? eventType : '';
}

function normalizeAnswer(answer) {
  if (answer === true) return 'Sí';
  if (answer === false) return 'No';
  const normalized = clean(answer);
  return ['Sí', 'A veces', 'No', 'No aplica'].includes(normalized) ? normalized : 'No';
}

function clean(value) {
  return String(value ?? '').trim();
}

function boundedClean(value, maxLength) {
  return clean(value).slice(0, maxLength);
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

function allowedOrigins(env) {
  const configured = clean(env?.ALLOWED_ORIGINS);
  if (!configured) return DEFAULT_ALLOWED_ORIGINS;
  return configured.split(',').map(origin => origin.trim()).filter(Boolean);
}

function corsHeaders(request, env) {
  const headers = { ...BASE_CORS_HEADERS, Vary: 'Origin' };
  const origin = request?.headers?.get('Origin') || '';

  if (origin && allowedOrigins(env).includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  return headers;
}

function isAllowedRequestOrigin(request, env) {
  const origin = request?.headers?.get('Origin') || '';
  return !origin || allowedOrigins(env).includes(origin);
}

function json(payload, status = 200, request, env) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders(request, env),
      ...SECURITY_HEADERS,
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

function csv(exportData, request, env) {
  const body = toCsv(exportData.rows, exportData.columns);
  return new Response(body, {
    status: 200,
    headers: {
      ...corsHeaders(request, env),
      ...SECURITY_HEADERS,
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${exportData.filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}

function zip(exportData, request, env) {
  return new Response(exportData.body, {
    status: 200,
    headers: {
      ...corsHeaders(request, env),
      ...SECURITY_HEADERS,
      'Content-Type': 'application/zip',
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
  let text = String(value ?? '');
  if (/^[=+\-@\t\r]/.test(text)) {
    text = `'${text}`;
  }
  return `"${text.replace(/"/g, '""')}"`;
}

function createZip(files) {
  const encoder = new TextEncoder();
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const data = encoder.encode(String(file.content ?? ''));
    const crc = crc32(data);
    const localHeader = zipLocalHeader(nameBytes, data, crc);
    const centralHeader = zipCentralHeader(nameBytes, data, crc, offset);

    localParts.push(localHeader, data);
    centralParts.push(centralHeader);
    offset += localHeader.length + data.length;
  }

  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = zipEndRecord(files.length, centralSize, offset);
  return concatUint8Arrays([...localParts, ...centralParts, end]);
}

function zipLocalHeader(nameBytes, data, crc) {
  const header = new Uint8Array(30 + nameBytes.length);
  const view = new DataView(header.buffer);
  view.setUint32(0, 0x04034b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 0, true);
  view.setUint16(8, 0, true);
  view.setUint16(10, 0, true);
  view.setUint16(12, 0, true);
  view.setUint32(14, crc, true);
  view.setUint32(18, data.length, true);
  view.setUint32(22, data.length, true);
  view.setUint16(26, nameBytes.length, true);
  view.setUint16(28, 0, true);
  header.set(nameBytes, 30);
  return header;
}

function zipCentralHeader(nameBytes, data, crc, offset) {
  const header = new Uint8Array(46 + nameBytes.length);
  const view = new DataView(header.buffer);
  view.setUint32(0, 0x02014b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 20, true);
  view.setUint16(8, 0, true);
  view.setUint16(10, 0, true);
  view.setUint16(12, 0, true);
  view.setUint16(14, 0, true);
  view.setUint32(16, crc, true);
  view.setUint32(20, data.length, true);
  view.setUint32(24, data.length, true);
  view.setUint16(28, nameBytes.length, true);
  view.setUint16(30, 0, true);
  view.setUint16(32, 0, true);
  view.setUint16(34, 0, true);
  view.setUint16(36, 0, true);
  view.setUint32(38, 0, true);
  view.setUint32(42, offset, true);
  header.set(nameBytes, 46);
  return header;
}

function zipEndRecord(fileCount, centralSize, centralOffset) {
  const end = new Uint8Array(22);
  const view = new DataView(end.buffer);
  view.setUint32(0, 0x06054b50, true);
  view.setUint16(4, 0, true);
  view.setUint16(6, 0, true);
  view.setUint16(8, fileCount, true);
  view.setUint16(10, fileCount, true);
  view.setUint32(12, centralSize, true);
  view.setUint32(16, centralOffset, true);
  view.setUint16(20, 0, true);
  return end;
}

function concatUint8Arrays(parts) {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    output.set(part, offset);
    offset += part.length;
  }
  return output;
}

function crc32(data) {
  let crc = 0xffffffff;
  for (let index = 0; index < data.length; index++) {
    crc = CRC32_TABLE[(crc ^ data[index]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index++) {
    let value = index;
    for (let bit = 0; bit < 8; bit++) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[index] = value >>> 0;
  }
  return table;
})();
