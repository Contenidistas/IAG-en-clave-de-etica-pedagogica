    const API_BASE = 'https://iag-etica-api.suscripcionessh.workers.dev';
    const SESSION_KEY = 'iag-admin-key';

    const state = {
      tab: 'completions',
      key: sessionStorage.getItem(SESSION_KEY) || '',
      completions: [],
      feedback: [],
      answers: [],
    };

    const els = {
      login: document.getElementById('login'),
      loginForm: document.getElementById('loginForm'),
      adminKey: document.getElementById('adminKey'),
      loginStatus: document.getElementById('loginStatus'),
      refreshBtn: document.getElementById('refreshBtn'),
      logoutBtn: document.getElementById('logoutBtn'),
      resetDataBtn: document.getElementById('resetDataBtn'),
      status: document.getElementById('status'),
      updatedAt: document.getElementById('updatedAt'),
      completionsView: document.getElementById('completionsView'),
      feedbackView: document.getElementById('feedbackView'),
      completionsBody: document.getElementById('completionsBody'),
      feedbackBody: document.getElementById('feedbackBody'),
      answersPanel: document.getElementById('answersPanel'),
      searchInput: document.getElementById('searchInput'),
      profileFilter: document.getElementById('profileFilter'),
      educationFilter: document.getElementById('educationFilter'),
      familiarityFilter: document.getElementById('familiarityFilter'),
      resourcesFilter: document.getElementById('resourcesFilter'),
      countryFilter: document.getElementById('countryFilter'),
      levelFilter: document.getElementById('levelFilter'),
      dateFromFilter: document.getElementById('dateFromFilter'),
      dateToFilter: document.getElementById('dateToFilter'),
      tabs: document.querySelectorAll('.tab'),
      metricVisits: document.getElementById('metricVisits'),
      metricCompleted: document.getElementById('metricCompleted'),
      metricAverage: document.getElementById('metricAverage'),
      metricFeedback: document.getElementById('metricFeedback'),
      metricRating: document.getElementById('metricRating'),
      exportCompletionsBtn: document.getElementById('exportCompletionsBtn'),
      exportFeedbackBtn: document.getElementById('exportFeedbackBtn'),
      exportAnswersBtn: document.getElementById('exportAnswersBtn'),
      exportCutZipBtn: document.getElementById('exportCutZipBtn'),
    };

    function headers() {
      return { 'X-Admin-Key': state.key };
    }

    async function api(path) {
      const response = await fetch(`${API_BASE}${path}`, { headers: headers() });
      if (response.status === 401) {
        throw new Error('Contraseña incorrecta o sesión vencida.');
      }
      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}`);
      }
      return response.json();
    }

    async function apiPost(path, body) {
      const response = await fetch(`${API_BASE}${path}`, {
        method: 'POST',
        headers: {
          ...headers(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body || {}),
      });
      if (response.status === 401) {
        throw new Error('Contraseña incorrecta o sesión vencida.');
      }
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `Error HTTP ${response.status}`);
      }
      return response.json();
    }

    function fmtNumber(value) {
      return new Intl.NumberFormat('es-UY').format(Number(value || 0));
    }

    function fmtDecimal(value) {
      const number = Number(value || 0);
      return number ? number.toFixed(1) : '0';
    }

    function fmtDate(value) {
      if (!value) return '';
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return value;
      return date.toLocaleString('es-UY', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    function escapeHtml(value) {
      return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function normalizeText(value) {
      return String(value || '').toLowerCase();
    }

    function rowMatches(row) {
      const query = normalizeText(els.searchInput.value);
      const profile = els.profileFilter.value;
      const education = els.educationFilter.value;
      const familiarity = els.familiarityFilter.value;
      const resources = els.resourcesFilter.value;
      const country = els.countryFilter.value;
      const level = els.levelFilter.value;
      const haystack = normalizeText(Object.values(row).join(' '));

      if (query && !haystack.includes(query)) return false;
      if (profile && row.profileKey !== profile && row.profile !== profile) return false;
      if (education && row.nivelEducativo !== education) return false;
      if (familiarity && row.familiaridadInicial !== familiarity) return false;
      if (resources && row.recursosSimilares !== resources) return false;
      if (country && row.country !== country) return false;
      if (level && row.likertLevel !== level) return false;
      if (!dateInRange(row.timestamp)) return false;
      return true;
    }

    function dateInRange(value) {
      if (!value) return true;
      const time = new Date(value).getTime();
      if (Number.isNaN(time)) return true;

      const from = els.dateFromFilter.value;
      const to = els.dateToFilter.value;
      if (from) {
        const fromTime = new Date(`${from}T00:00:00`).getTime();
        if (time < fromTime) return false;
      }
      if (to) {
        const toTime = new Date(`${to}T23:59:59.999`).getTime();
        if (time > toTime) return false;
      }
      return true;
    }

    function setStatus(message, visible = true) {
      els.status.textContent = message;
      els.status.classList.toggle('hidden', !visible);
    }

    function renderSummary(data) {
      const summary = data.summary || {};
      const admin = data.admin || {};
      els.metricVisits.textContent = fmtNumber(summary.visits);
      els.metricCompleted.textContent = fmtNumber(summary.completed);
      els.metricAverage.textContent = fmtDecimal(summary.averageScore);
      els.metricFeedback.textContent = fmtNumber(summary.feedback || admin.totalFeedback);
      els.metricRating.textContent = fmtDecimal(admin.averageRating);
      els.updatedAt.textContent = `Actualizado: ${fmtDate(data.updatedAt)}`;
    }

    function fillFilters() {
      const currentProfile = els.profileFilter.value;
      const currentEducation = els.educationFilter.value;
      const currentFamiliarity = els.familiarityFilter.value;
      const currentResources = els.resourcesFilter.value;
      const currentCountry = els.countryFilter.value;
      const currentLevel = els.levelFilter.value;
      const profiles = new Set();
      const educationLevels = new Set();
      const familiarityLevels = new Set();
      const resourcesValues = new Set();
      const countries = new Set();
      const levels = new Set();

      state.completions.forEach(row => {
        if (row.profileKey || row.profile) profiles.add(row.profileKey || row.profile);
        if (row.nivelEducativo) educationLevels.add(row.nivelEducativo);
        if (row.familiaridadInicial) familiarityLevels.add(row.familiaridadInicial);
        if (row.recursosSimilares) resourcesValues.add(row.recursosSimilares);
        if (row.country) countries.add(row.country);
        if (row.likertLevel) levels.add(row.likertLevel);
      });
      state.feedback.forEach(row => {
        if (row.profileKey || row.profile) profiles.add(row.profileKey || row.profile);
        if (row.nivelEducativo) educationLevels.add(row.nivelEducativo);
        if (row.country) countries.add(row.country);
      });

      els.profileFilter.innerHTML = '<option value="">Todos los perfiles</option>' +
        Array.from(profiles).sort().map(value => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join('');

      els.educationFilter.innerHTML = '<option value="">Toda formación</option>' +
        Array.from(educationLevels).sort().map(value => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join('');

      els.familiarityFilter.innerHTML = '<option value="">Toda experiencia</option>' +
        Array.from(familiarityLevels).sort().map(value => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join('');

      els.resourcesFilter.innerHTML = '<option value="">Todos los recursos</option>' +
        Array.from(resourcesValues).sort().map(value => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join('');

      els.countryFilter.innerHTML = '<option value="">Todos los países</option>' +
        Array.from(countries).sort().map(value => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join('');

      els.levelFilter.innerHTML = '<option value="">Todos los resultados</option>' +
        Array.from(levels).sort().map(value => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join('');

      els.profileFilter.value = currentProfile;
      els.educationFilter.value = currentEducation;
      els.familiarityFilter.value = currentFamiliarity;
      els.resourcesFilter.value = currentResources;
      els.countryFilter.value = currentCountry;
      els.levelFilter.value = currentLevel;
    }

    function filteredCompletions() {
      return state.completions.filter(rowMatches);
    }

    function filteredFeedback() {
      return state.feedback.filter(row => {
        const query = normalizeText(els.searchInput.value);
        const profile = els.profileFilter.value;
        const education = els.educationFilter.value;
        const country = els.countryFilter.value;
        const haystack = normalizeText(Object.values(row).join(' '));
        if (query && !haystack.includes(query)) return false;
        if (profile && row.profileKey !== profile && row.profile !== profile) return false;
        if (education && row.nivelEducativo !== education) return false;
        if (country && row.country !== country) return false;
        return true;
      });
    }

    function renderCompletions() {
      const rows = filteredCompletions();

      if (!rows.length) {
        els.completionsBody.innerHTML = '<tr><td colspan="7" class="empty">No hay recorridos para mostrar.</td></tr>';
        return;
      }

      els.completionsBody.innerHTML = rows.map(row => `
        <tr>
          <td>${escapeHtml(fmtDate(row.timestamp))}</td>
          <td>
            <strong>${escapeHtml(row.profileKey || row.profile || 'Sin dato')}</strong>
            <div class="muted">${escapeHtml(row.country || '')}</div>
          </td>
          <td>${escapeHtml(row.nivelEducativo || 'Sin dato')}</td>
          <td><span class="badge ok">${escapeHtml(row.evidence ?? 0)}</span></td>
          <td>${escapeHtml(row.likertLevel || 'Sin dato')}</td>
          <td>${escapeHtml(row.answersCount || 0)}</td>
          <td><button class="btn" type="button" data-answers="${escapeHtml(row.id)}">Ver</button></td>
        </tr>
      `).join('');

      els.completionsBody.querySelectorAll('[data-answers]').forEach(button => {
        button.addEventListener('click', () => loadAnswers(button.dataset.answers));
      });
    }

    function renderFeedback() {
      const rows = filteredFeedback();

      if (!rows.length) {
        els.feedbackBody.innerHTML = '<tr><td colspan="6" class="empty">No hay valoraciones para mostrar.</td></tr>';
        return;
      }

      els.feedbackBody.innerHTML = rows.map(row => `
        <tr>
          <td>${escapeHtml(fmtDate(row.timestamp))}</td>
          <td><span class="badge warn">${escapeHtml(row.rating || 0)} / 5</span></td>
          <td>${escapeHtml(row.suggestion || 'Sin comentario')}</td>
          <td>${escapeHtml(row.profileKey || row.profile || 'Sin dato')}</td>
          <td>${escapeHtml(row.nivelEducativo || 'Sin dato')}</td>
          <td>${escapeHtml(row.country || '')}</td>
        </tr>
      `).join('');
    }

    function renderCurrentTab() {
      const showingCompletions = state.tab === 'completions';
      els.completionsView.classList.toggle('hidden', !showingCompletions);
      els.feedbackView.classList.toggle('hidden', showingCompletions);
      els.levelFilter.classList.toggle('hidden', !showingCompletions);
      els.familiarityFilter.classList.toggle('hidden', !showingCompletions);
      els.resourcesFilter.classList.toggle('hidden', !showingCompletions);
      els.tabs.forEach(tab => {
        const active = tab.dataset.tab === state.tab;
        tab.classList.toggle('active', active);
        tab.setAttribute('aria-selected', String(active));
      });

      if (showingCompletions) renderCompletions();
      else renderFeedback();
    }

    async function loadAnswers(eventId) {
      els.answersPanel.innerHTML = '<p class="muted">Cargando respuestas...</p>';

      try {
        const data = await api(`/admin/answers?eventId=${encodeURIComponent(eventId)}`);
        const rows = data.answers || [];

        if (!rows.length) {
          els.answersPanel.innerHTML = '<p class="muted">Este recorrido no tiene respuestas asociadas.</p>';
          return;
        }

        els.answersPanel.innerHTML = rows.map(row => `
          <article class="answer-card">
            <strong>${escapeHtml(row.question)}</strong>
            <span>Respuesta: ${escapeHtml(row.answer)}</span>
          </article>
        `).join('');
      } catch (error) {
        els.answersPanel.innerHTML = `<p class="muted">${escapeHtml(error.message)}</p>`;
      }
    }

    async function loadAll(options = {}) {
      if (!state.key) return;
      const silent = options.silent === true;
      if (!silent) setStatus('Cargando datos...');

      try {
        const [summary, completions, feedback] = await Promise.all([
          api('/admin/summary'),
          api('/admin/completions'),
          api('/admin/feedback'),
        ]);

        state.completions = completions.completions || [];
        state.feedback = feedback.feedback || [];
        renderSummary(summary);
        fillFilters();
        renderCurrentTab();
        if (!silent) setStatus('', false);
        els.login.classList.add('hidden');
      } catch (error) {
        setStatus(error.message);
        els.login.classList.remove('hidden');
        els.loginStatus.textContent = error.message;
        sessionStorage.removeItem(SESSION_KEY);
        state.key = '';
      }
    }

    function csvCell(value) {
      return `"${String(value ?? '').replace(/"/g, '""')}"`;
    }

    function downloadRowsCsv(filename, rows, columns) {
      const header = columns.join(',');
      const lines = rows.map(row => columns.map(column => csvCell(row[column])).join(','));
      const blob = new Blob([[header, ...lines].join('\r\n')], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    }

    async function downloadFilteredCsv(type) {
      if (type === 'completions') {
        downloadRowsCsv('recorridos-filtrados.csv', filteredCompletions(), [
          'id', 'timestamp', 'sessionId', 'userName', 'profile', 'profileKey', 'country',
          'nivelEducativo', 'familiaridadInicial', 'recursosSimilares', 'evidence',
          'likertLevel', 'answersCount'
        ]);
        return;
      }

      if (type === 'feedback') {
        downloadRowsCsv('valoraciones-filtradas.csv', filteredFeedback(), [
          'id', 'eventId', 'timestamp', 'sessionId', 'rating', 'suggestion',
          'profile', 'profileKey', 'country', 'nivelEducativo'
        ]);
        return;
      }

      const eventIds = new Set(filteredCompletions().map(row => Number(row.id)));
      const data = await api('/admin/answers');
      const answers = (data.answers || []).filter(row => eventIds.has(Number(row.eventId)));
      downloadRowsCsv('respuestas-filtradas.csv', answers, [
        'id', 'eventId', 'questionId', 'question', 'answer', 'createdAt'
      ]);
    }

    async function downloadCsv(type) {
      try {
        const response = await fetch(`${API_BASE}/admin/export.csv?type=${encodeURIComponent(type)}`, {
          headers: headers(),
        });
        if (!response.ok) throw new Error(`Error HTTP ${response.status}`);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${type}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      } catch (error) {
        setStatus(`No se pudo descargar CSV: ${error.message}`);
      }
    }

    async function downloadCutZip() {
      const params = new URLSearchParams();
      if (els.dateFromFilter.value) params.set('from', els.dateFromFilter.value);
      if (els.dateToFilter.value) params.set('to', els.dateToFilter.value);

      try {
        els.exportCutZipBtn.disabled = true;
        setStatus('Preparando corte de datos...');
        const query = params.toString();
        const response = await fetch(`${API_BASE}/admin/export.zip${query ? `?${query}` : ''}`, {
          headers: headers(),
        });
        if (response.status === 401) throw new Error('Contraseña incorrecta o sesión vencida.');
        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error.error || `Error HTTP ${response.status}`);
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const from = els.dateFromFilter.value || 'inicio';
        const to = els.dateToFilter.value || 'hoy';
        link.href = url;
        link.download = `corte-datos-${from}-${to}.zip`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        setStatus(`Corte de datos descargado (${from} a ${to}).`);
      } catch (error) {
        setStatus(`No se pudo descargar el corte: ${error.message}`);
      } finally {
        els.exportCutZipBtn.disabled = false;
      }
    }

    async function resetData() {
      const confirmation = window.prompt('Antes de borrar, conviene descargar un ZIP de corte de datos. Esta acción borra visitas, recorridos, respuestas y valoraciones. Escribí BORRAR DATOS para confirmar.');
      if (confirmation === null) {
        setStatus('Limpieza cancelada.');
        return;
      }

      if (confirmation.trim().toUpperCase() !== 'BORRAR DATOS') {
        setStatus('No se limpiaron datos: la confirmación debe ser BORRAR DATOS.');
        return;
      }

      try {
        els.resetDataBtn.disabled = true;
        setStatus('Limpiando datos...');
        const result = await apiPost('/admin/reset-data', { confirmation: confirmation.trim() });
        await loadAll({ silent: true });
        setStatus(`Datos eliminados: ${fmtNumber(result.deleted.events)} eventos, ${fmtNumber(result.deleted.answers)} respuestas y ${fmtNumber(result.deleted.feedback)} valoraciones.`);
      } catch (error) {
        setStatus(`No se pudieron limpiar los datos: ${error.message}`);
      } finally {
        els.resetDataBtn.disabled = false;
      }
    }

    els.loginForm.addEventListener('submit', event => {
      event.preventDefault();
      state.key = els.adminKey.value.trim();
      sessionStorage.setItem(SESSION_KEY, state.key);
      els.loginStatus.textContent = 'Validando...';
      loadAll();
    });

    els.logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem(SESSION_KEY);
      state.key = '';
      els.adminKey.value = '';
      els.login.classList.remove('hidden');
    });

    els.refreshBtn.addEventListener('click', loadAll);
    els.resetDataBtn.addEventListener('click', resetData);
    els.searchInput.addEventListener('input', renderCurrentTab);
    els.profileFilter.addEventListener('change', renderCurrentTab);
    els.educationFilter.addEventListener('change', renderCurrentTab);
    els.familiarityFilter.addEventListener('change', renderCurrentTab);
    els.resourcesFilter.addEventListener('change', renderCurrentTab);
    els.countryFilter.addEventListener('change', renderCurrentTab);
    els.levelFilter.addEventListener('change', renderCurrentTab);
    els.dateFromFilter.addEventListener('change', renderCurrentTab);
    els.dateToFilter.addEventListener('change', renderCurrentTab);
    els.exportCutZipBtn.addEventListener('click', downloadCutZip);
    els.exportCompletionsBtn.addEventListener('click', () => downloadFilteredCsv('completions'));
    els.exportFeedbackBtn.addEventListener('click', () => downloadFilteredCsv('feedback'));
    els.exportAnswersBtn.addEventListener('click', () => downloadFilteredCsv('answers'));

    els.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        state.tab = tab.dataset.tab;
        renderCurrentTab();
      });
    });

    if (state.key) {
      loadAll();
    } else {
      els.login.classList.remove('hidden');
    }
