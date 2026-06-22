    const API_BASE = 'https://iag-etica-api.suscripcionessh.workers.dev';
    const SESSION_KEY = 'iag-admin-key';

    const state = {
      tab: 'completions',
      key: sessionStorage.getItem(SESSION_KEY) || '',
      completions: [],
      feedback: [],
      answers: [],
      selectedCompletions: new Set(),
      selectedFeedback: new Set(),
    };

    const els = {
      login: document.getElementById('login'),
      loginForm: document.getElementById('loginForm'),
      adminKey: document.getElementById('adminKey'),
      loginStatus: document.getElementById('loginStatus'),
      refreshBtn: document.getElementById('refreshBtn'),
      logoutBtn: document.getElementById('logoutBtn'),
      resetDataBtn: document.getElementById('resetDataBtn'),
      toggleSelectAllBtn: document.getElementById('toggleSelectAllBtn'),
      deleteSelectedBtn: document.getElementById('deleteSelectedBtn'),
      status: document.getElementById('status'),
      updatedAt: document.getElementById('updatedAt'),
      completionsView: document.getElementById('completionsView'),
      feedbackView: document.getElementById('feedbackView'),
      completionsBody: document.getElementById('completionsBody'),
      feedbackBody: document.getElementById('feedbackBody'),
      selectAllCompletions: document.getElementById('selectAllCompletions'),
      selectAllFeedback: document.getElementById('selectAllFeedback'),
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
      adminInsightFocus: document.getElementById('adminInsightFocus'),
      adminInsightText: document.getElementById('adminInsightText'),
      exportCompletionsBtn: document.getElementById('exportCompletionsBtn'),
      exportFeedbackBtn: document.getElementById('exportFeedbackBtn'),
      exportAnswersBtn: document.getElementById('exportAnswersBtn'),
      exportCutZipBtn: document.getElementById('exportCutZipBtn'),
    };

    function headers() {
      return { 'X-Admin-Key': state.key };
    }

    async function api(path) {
      const response = await fetch(`${API_BASE}${path}`, {
        headers: headers(),
        cache: 'no-store',
      });
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

    function setStatus(message, visible = true, type = '') {
      els.status.textContent = message;
      els.status.classList.toggle('hidden', !visible);
      els.status.classList.toggle('success', type === 'success');
      els.status.classList.toggle('error', type === 'error');
    }

    function renderSummary(data) {
      const summary = data.summary || {};
      const admin = data.admin || {};
      const insight = data.insight || {};
      els.metricVisits.textContent = fmtNumber(summary.visits);
      els.metricCompleted.textContent = fmtNumber(summary.completed);
      els.metricAverage.textContent = fmtDecimal(summary.averageScore);
      els.metricFeedback.textContent = fmtNumber(summary.feedback || admin.totalFeedback);
      els.metricRating.textContent = fmtDecimal(admin.averageRating);
      els.updatedAt.textContent = `Actualizado: ${fmtDate(data.updatedAt)}`;
      if (els.adminInsightFocus) els.adminInsightFocus.textContent = insight.focus || 'Sin datos suficientes';
      if (els.adminInsightText) els.adminInsightText.textContent = insight.recommendation || 'Todavía no hay una tendencia clara para interpretar.';
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
        if (!dateInRange(row.timestamp)) return false;
        return true;
      });
    }

    function selectedPayload() {
      return {
        eventIds: Array.from(state.selectedCompletions).map(Number).filter(Number.isFinite),
        feedbackIds: Array.from(state.selectedFeedback).map(Number).filter(Number.isFinite),
      };
    }

    function selectedCount() {
      return state.selectedCompletions.size + state.selectedFeedback.size;
    }

    function currentVisibleSelectionState() {
      const rows = state.tab === 'completions' ? filteredCompletions() : filteredFeedback();
      const target = state.tab === 'completions' ? state.selectedCompletions : state.selectedFeedback;
      const ids = rows.map(row => String(row.id));
      const selected = ids.filter(id => target.has(id)).length;

      return {
        total: ids.length,
        selected,
        allSelected: ids.length > 0 && selected === ids.length,
      };
    }

    function syncSelectionControls() {
      const completionRows = filteredCompletions();
      const feedbackRows = filteredFeedback();
      const visibleCompletionIds = completionRows.map(row => String(row.id));
      const visibleFeedbackIds = feedbackRows.map(row => String(row.id));
      const checkedCompletions = visibleCompletionIds.filter(id => state.selectedCompletions.has(id)).length;
      const checkedFeedback = visibleFeedbackIds.filter(id => state.selectedFeedback.has(id)).length;
      const totalSelected = selectedCount();
      const currentState = currentVisibleSelectionState();

      els.deleteSelectedBtn.disabled = totalSelected === 0;
      els.deleteSelectedBtn.textContent = totalSelected ? `Eliminar selección (${totalSelected})` : 'Eliminar selección';
      els.toggleSelectAllBtn.disabled = currentState.total === 0;
      els.toggleSelectAllBtn.textContent = currentState.allSelected ? 'Quitar selección' : `Seleccionar todo (${currentState.total})`;

      els.selectAllCompletions.checked = visibleCompletionIds.length > 0 && checkedCompletions === visibleCompletionIds.length;
      els.selectAllCompletions.indeterminate = checkedCompletions > 0 && checkedCompletions < visibleCompletionIds.length;
      els.selectAllFeedback.checked = visibleFeedbackIds.length > 0 && checkedFeedback === visibleFeedbackIds.length;
      els.selectAllFeedback.indeterminate = checkedFeedback > 0 && checkedFeedback < visibleFeedbackIds.length;
    }

    function renderCompletions() {
      const rows = filteredCompletions();

      if (!rows.length) {
        els.completionsBody.innerHTML = '<tr><td colspan="8" class="empty">No hay recorridos para mostrar.</td></tr>';
        syncSelectionControls();
        return;
      }

      els.completionsBody.innerHTML = rows.map(row => `
        <tr>
          <td><input type="checkbox" data-select-completion="${escapeHtml(row.id)}" aria-label="Seleccionar recorrido ${escapeHtml(row.id)}" ${state.selectedCompletions.has(String(row.id)) ? 'checked' : ''}></td>
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
      els.completionsBody.querySelectorAll('[data-select-completion]').forEach(input => {
        input.addEventListener('change', () => {
          if (input.checked) state.selectedCompletions.add(String(input.dataset.selectCompletion));
          else state.selectedCompletions.delete(String(input.dataset.selectCompletion));
          syncSelectionControls();
        });
      });
      syncSelectionControls();
    }

    function renderFeedback() {
      const rows = filteredFeedback();

      if (!rows.length) {
        els.feedbackBody.innerHTML = '<tr><td colspan="7" class="empty">No hay valoraciones para mostrar.</td></tr>';
        syncSelectionControls();
        return;
      }

      els.feedbackBody.innerHTML = rows.map(row => `
        <tr>
          <td><input type="checkbox" data-select-feedback="${escapeHtml(row.id)}" aria-label="Seleccionar valoración ${escapeHtml(row.id)}" ${state.selectedFeedback.has(String(row.id)) ? 'checked' : ''}></td>
          <td>${escapeHtml(fmtDate(row.timestamp))}</td>
          <td><span class="badge warn">${escapeHtml(row.rating || 0)} / 5</span></td>
          <td>${escapeHtml(row.suggestion || 'Sin comentario')}</td>
          <td>${escapeHtml(row.profileKey || row.profile || 'Sin dato')}</td>
          <td>${escapeHtml(row.nivelEducativo || 'Sin dato')}</td>
          <td>${escapeHtml(row.country || '')}</td>
        </tr>
      `).join('');
      els.feedbackBody.querySelectorAll('[data-select-feedback]').forEach(input => {
        input.addEventListener('change', () => {
          if (input.checked) state.selectedFeedback.add(String(input.dataset.selectFeedback));
          else state.selectedFeedback.delete(String(input.dataset.selectFeedback));
          syncSelectionControls();
        });
      });
      syncSelectionControls();
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
        const cacheBust = `_=${Date.now()}`;
        const [summary, completions, feedback] = await Promise.all([
          api(`/admin/summary?${cacheBust}`),
          api(`/admin/completions?${cacheBust}`),
          api(`/admin/feedback?${cacheBust}`),
        ]);

        state.completions = completions.completions || [];
        state.feedback = feedback.feedback || [];
        state.selectedCompletions = new Set(Array.from(state.selectedCompletions).filter(id => state.completions.some(row => String(row.id) === id)));
        state.selectedFeedback = new Set(Array.from(state.selectedFeedback).filter(id => state.feedback.some(row => String(row.id) === id)));
        renderSummary(summary);
        fillFilters();
        renderCurrentTab();
        if (!silent) setStatus('', false);
        els.login.classList.add('hidden');
      } catch (error) {
        setStatus(error.message, true, 'error');
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
        setStatus(`No se pudo descargar CSV: ${error.message}`, true, 'error');
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
        setStatus(`Corte de datos descargado (${from} a ${to}).`, true, 'success');
      } catch (error) {
        setStatus(`No se pudo descargar el corte: ${error.message}`, true, 'error');
      } finally {
        els.exportCutZipBtn.disabled = false;
      }
    }

    async function resetData() {
      const hasRange = Boolean(els.dateFromFilter.value || els.dateToFilter.value);
      const scope = hasRange
        ? `el rango ${els.dateFromFilter.value || 'inicio'} a ${els.dateToFilter.value || 'hoy'}`
        : 'todos los datos';
      const confirmation = window.prompt(`Antes de borrar, conviene descargar un ZIP de corte de datos. Esta acción borra visitas, recorridos, respuestas y valoraciones de ${scope}. Escribí BORRAR DATOS para confirmar.`);
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
        const result = await apiPost('/admin/reset-data', {
          confirmation: confirmation.trim(),
          from: els.dateFromFilter.value,
          to: els.dateToFilter.value,
        });
        await loadAll({ silent: true });
        setStatus(`Datos eliminados correctamente: ${fmtNumber(result.deleted.events)} eventos, ${fmtNumber(result.deleted.answers)} respuestas y ${fmtNumber(result.deleted.feedback)} valoraciones.`, true, 'success');
      } catch (error) {
        setStatus(`No se pudieron limpiar los datos: ${error.message}`, true, 'error');
      } finally {
        els.resetDataBtn.disabled = false;
      }
    }

    async function deleteSelected() {
      const payload = selectedPayload();
      const total = selectedCount();
      const selectedEventIds = new Set(payload.eventIds.map(String));
      const selectedFeedbackIds = new Set(payload.feedbackIds.map(String));
      if (!total) {
        setStatus('No hay registros seleccionados para eliminar.');
        return;
      }

      const confirmed = window.confirm(`Vas a eliminar ${total} registro(s) seleccionado(s) y sus datos asociados. Esta acción no se puede deshacer.`);
      if (!confirmed) {
        setStatus('Eliminación cancelada.');
        return;
      }

      try {
        els.deleteSelectedBtn.disabled = true;
        setStatus('Eliminando selección...');
        const result = await apiPost('/admin/delete-selected', payload);
        const deletedTotal = Number(result.deleted?.events || 0) + Number(result.deleted?.answers || 0) + Number(result.deleted?.feedback || 0);
        if (deletedTotal === 0) {
          throw new Error('La API no encontró esos registros para borrar. Actualizá la lista y probá de nuevo.');
        }

        state.selectedCompletions.clear();
        state.selectedFeedback.clear();
        await loadAll({ silent: true });
        const remainingEvents = state.completions.filter(row => selectedEventIds.has(String(row.id))).length;
        const remainingFeedback = state.feedback.filter(row => selectedFeedbackIds.has(String(row.id))).length;

        if (remainingEvents || remainingFeedback) {
          setStatus('La API respondió, pero algunos registros siguen visibles. Tocá Actualizar; si continúan, avisame y revisamos esos IDs puntuales.', true, 'error');
          return;
        }

        setStatus(`Datos eliminados correctamente: ${fmtNumber(result.deleted.events)} eventos, ${fmtNumber(result.deleted.answers)} respuestas y ${fmtNumber(result.deleted.feedback)} valoraciones.`, true, 'success');
      } catch (error) {
        setStatus(`No se pudo eliminar la selección: ${error.message}`, true, 'error');
      } finally {
        els.deleteSelectedBtn.disabled = selectedCount() === 0;
        syncSelectionControls();
      }
    }

    function toggleVisibleSelection(type, checked) {
      const rows = type === 'completions' ? filteredCompletions() : filteredFeedback();
      const target = type === 'completions' ? state.selectedCompletions : state.selectedFeedback;
      rows.forEach(row => {
        const id = String(row.id);
        if (checked) target.add(id);
        else target.delete(id);
      });
      renderCurrentTab();
    }

    function toggleCurrentTabSelection() {
      const currentState = currentVisibleSelectionState();
      toggleVisibleSelection(state.tab, !currentState.allSelected);
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
    els.toggleSelectAllBtn.addEventListener('click', toggleCurrentTabSelection);
    els.deleteSelectedBtn.addEventListener('click', deleteSelected);
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
    els.selectAllCompletions.addEventListener('change', () => toggleVisibleSelection('completions', els.selectAllCompletions.checked));
    els.selectAllFeedback.addEventListener('change', () => toggleVisibleSelection('feedback', els.selectAllFeedback.checked));

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
