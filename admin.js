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
      analysisModel: null,
      analysisConfigured: false,
      inferenceModel: null,
      inferenceConfigured: false,
      programEvalModel: null,
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
      labFeedbackView: document.getElementById('labFeedbackView'),
      labFeedbackBody: document.getElementById('labFeedbackBody'),
      selectAllLabFeedback: document.getElementById('selectAllLabFeedback'),
      exportLabFeedbackBtn: document.getElementById('exportLabFeedbackBtn'),
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
      programFilter: document.getElementById('programFilter'),
      phaseFilter: document.getElementById('phaseFilter'),
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
      analysisView: document.getElementById('analysisView'),
      analysisSource: document.getElementById('analysisSource'),
      analysisDimension: document.getElementById('analysisDimension'),
      analysisCompare: document.getElementById('analysisCompare'),
      analysisMetric: document.getElementById('analysisMetric'),
      analysisChartType: document.getElementById('analysisChartType'),
      analysisXAxisControl: document.getElementById('analysisXAxisControl'),
      analysisXAxis: document.getElementById('analysisXAxis'),
      analysisYAxisControl: document.getElementById('analysisYAxisControl'),
      analysisYAxis: document.getElementById('analysisYAxis'),
      analysisOrder: document.getElementById('analysisOrder'),
      analysisSampleSize: document.getElementById('analysisSampleSize'),
      analysisCategoryCount: document.getElementById('analysisCategoryCount'),
      analysisSeriesCount: document.getElementById('analysisSeriesCount'),
      analysisSummaryText: document.getElementById('analysisSummaryText'),
      analysisEmpty: document.getElementById('analysisEmpty'),
      analysisChart: document.getElementById('analysisChart'),
      analysisDataDetails: document.getElementById('analysisDataDetails'),
      analysisDataBody: document.getElementById('analysisDataBody'),
      analysisDimensionHeading: document.getElementById('analysisDimensionHeading'),
      analysisCompareHeading: document.getElementById('analysisCompareHeading'),
      analysisMetricHeading: document.getElementById('analysisMetricHeading'),
      analysisFourthHeading: document.getElementById('analysisFourthHeading'),
      exportAnalysisPngBtn: document.getElementById('exportAnalysisPngBtn'),
      exportAnalysisSvgBtn: document.getElementById('exportAnalysisSvgBtn'),
      exportAnalysisCsvBtn: document.getElementById('exportAnalysisCsvBtn'),
      inferenceView: document.getElementById('inferenceView'),
      inferenceMode: document.getElementById('inferenceMode'),
      inferenceSource: document.getElementById('inferenceSource'),
      inferenceVariableAControl: document.getElementById('inferenceVariableAControl'),
      inferenceVariableA: document.getElementById('inferenceVariableA'),
      inferenceVariableBControl: document.getElementById('inferenceVariableBControl'),
      inferenceVariableB: document.getElementById('inferenceVariableB'),
      inferenceGroupControl: document.getElementById('inferenceGroupControl'),
      inferenceGroup: document.getElementById('inferenceGroup'),
      inferenceOutcomeControl: document.getElementById('inferenceOutcomeControl'),
      inferenceOutcome: document.getElementById('inferenceOutcome'),
      inferenceSampleSize: document.getElementById('inferenceSampleSize'),
      inferenceMethod: document.getElementById('inferenceMethod'),
      inferencePValue: document.getElementById('inferencePValue'),
      inferenceEffect: document.getElementById('inferenceEffect'),
      inferenceSummaryText: document.getElementById('inferenceSummaryText'),
      inferenceWarning: document.getElementById('inferenceWarning'),
      inferenceEmpty: document.getElementById('inferenceEmpty'),
      inferenceChart: document.getElementById('inferenceChart'),
      inferenceDataDetails: document.getElementById('inferenceDataDetails'),
      inferenceDataBody: document.getElementById('inferenceDataBody'),
      inferenceHeadingA: document.getElementById('inferenceHeadingA'),
      inferenceHeadingB: document.getElementById('inferenceHeadingB'),
      inferenceHeadingC: document.getElementById('inferenceHeadingC'),
      inferenceHeadingD: document.getElementById('inferenceHeadingD'),
      inferenceHeadingE: document.getElementById('inferenceHeadingE'),
      inferenceHeadingF: document.getElementById('inferenceHeadingF'),
      exportInferencePngBtn: document.getElementById('exportInferencePngBtn'),
      exportInferenceSvgBtn: document.getElementById('exportInferenceSvgBtn'),
      exportInferenceCsvBtn: document.getElementById('exportInferenceCsvBtn'),
      programEvalView: document.getElementById('programEvalView'),
      programEvalStageBaseline: document.getElementById('programEvalStageBaseline'),
      programEvalStageFinal: document.getElementById('programEvalStageFinal'),
      programEvalStageFollowup: document.getElementById('programEvalStageFollowup'),
      programEvalParticipants: document.getElementById('programEvalParticipants'),
      programEvalCohorts: document.getElementById('programEvalCohorts'),
      programEvalCompletionRate: document.getElementById('programEvalCompletionRate'),
      programEvalAggregateDelta: document.getElementById('programEvalAggregateDelta'),
      programEvalPairedDelta: document.getElementById('programEvalPairedDelta'),
      programEvalLiteracyDelta: document.getElementById('programEvalLiteracyDelta'),
      programEvalParticipantsLabel: document.getElementById('programEvalParticipantsLabel'),
      programEvalCohortsLabel: document.getElementById('programEvalCohortsLabel'),
      programEvalCompletionLabel: document.getElementById('programEvalCompletionLabel'),
      programEvalImprovementLabel: document.getElementById('programEvalImprovementLabel'),
      programTargetParticipants: document.getElementById('programTargetParticipants'),
      programTargetCohorts: document.getElementById('programTargetCohorts'),
      programTargetCompletion: document.getElementById('programTargetCompletion'),
      programTargetImprovement: document.getElementById('programTargetImprovement'),
      resetProgramTargetsBtn: document.getElementById('resetProgramTargetsBtn'),
      cohortLinkProgramSelect: document.getElementById('cohortLinkProgramSelect'),
      cohortLinkCodeInput: document.getElementById('cohortLinkCodeInput'),
      cohortLinkBaselineInput: document.getElementById('cohortLinkBaselineInput'),
      cohortLinkFinalInput: document.getElementById('cohortLinkFinalInput'),
      cohortLinkFollowupInput: document.getElementById('cohortLinkFollowupInput'),
      copyBaselineLinkBtn: document.getElementById('copyBaselineLinkBtn'),
      copyFinalLinkBtn: document.getElementById('copyFinalLinkBtn'),
      copyFollowupLinkBtn: document.getElementById('copyFollowupLinkBtn'),
      cohortLinkStatus: document.getElementById('cohortLinkStatus'),
      programEvalSummaryText: document.getElementById('programEvalSummaryText'),
      programEvalEmpty: document.getElementById('programEvalEmpty'),
      programEvalTableWrap: document.getElementById('programEvalTableWrap'),
      programEvalCohortBody: document.getElementById('programEvalCohortBody'),
      exportProgramEvalReportBtn: document.getElementById('exportProgramEvalReportBtn'),
      exportProgramEvalCsvBtn: document.getElementById('exportProgramEvalCsvBtn'),
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
      const program = els.programFilter.value;
      const phase = els.phaseFilter.value;
      const level = els.levelFilter.value;
      const haystack = normalizeText(Object.values(row).join(' '));

      if (query && !haystack.includes(query)) return false;
      if (profile && row.profileKey !== profile && row.profile !== profile) return false;
      if (education && row.nivelEducativo !== education) return false;
      if (familiarity && row.familiaridadInicial !== familiarity) return false;
      if (resources && row.recursosSimilares !== resources) return false;
      if (country && row.country !== country) return false;
      if (program && row.programCode !== program) return false;
      if (phase && row.measurementPhase !== phase) return false;
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
      const currentProgram = els.programFilter.value;
      const currentPhase = els.phaseFilter.value;
      const currentLevel = els.levelFilter.value;
      const profiles = new Set();
      const educationLevels = new Set();
      const familiarityLevels = new Set();
      const resourcesValues = new Set();
      const countries = new Set(
        (window.CountryContext?.countries || [])
          .map(option => option.name)
          .filter(name => name && name !== 'Otro')
      );
      const levels = new Set();
      const programs = new Set();
      const phases = new Set();

      state.completions.forEach(row => {
        if (row.profileKey || row.profile) profiles.add(row.profileKey || row.profile);
        if (row.nivelEducativo) educationLevels.add(row.nivelEducativo);
        if (row.familiaridadInicial) familiarityLevels.add(row.familiaridadInicial);
        if (row.recursosSimilares) resourcesValues.add(row.recursosSimilares);
        if (row.country) countries.add(row.country);
        if (row.programCode) programs.add(row.programCode);
        if (row.measurementPhase) phases.add(row.measurementPhase);
        if (row.likertLevel) levels.add(row.likertLevel);
      });
      state.feedback.forEach(row => {
        if (row.profileKey || row.profile) profiles.add(row.profileKey || row.profile);
        if (row.nivelEducativo) educationLevels.add(row.nivelEducativo);
        if (row.country) countries.add(row.country);
        if (row.programCode) programs.add(row.programCode);
        if (row.measurementPhase) phases.add(row.measurementPhase);
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
        Array.from(countries)
          .sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }))
          .map(value => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join('');

      els.programFilter.innerHTML = '<option value="">Todos los programas</option>' +
        Array.from(programs).sort().map(value => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join('');

      const phaseLabels = { baseline: 'Diagnóstico inicial', final: 'Evaluación final', followup: 'Seguimiento' };
      els.phaseFilter.innerHTML = '<option value="">Todos los momentos</option>' +
        Array.from(phases).sort().map(value => `<option value="${escapeHtml(value)}">${escapeHtml(phaseLabels[value] || value)}</option>`).join('');

      els.levelFilter.innerHTML = '<option value="">Todos los resultados</option>' +
        Array.from(levels).sort().map(value => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join('');

      els.profileFilter.value = currentProfile;
      els.educationFilter.value = currentEducation;
      els.familiarityFilter.value = currentFamiliarity;
      els.resourcesFilter.value = currentResources;
      els.countryFilter.value = currentCountry;
      els.programFilter.value = currentProgram;
      els.phaseFilter.value = currentPhase;
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
        const program = els.programFilter.value;
        const phase = els.phaseFilter.value;
        // Omitir sugerencias de casos
        if (row.suggestion && (row.suggestion.startsWith('[Caso:') || row.suggestion.startsWith('=CHOICE='))) return false;
        const haystack = normalizeText(Object.values(row).join(' '));
        if (query && !haystack.includes(query)) return false;
        if (profile && row.profileKey !== profile && row.profile !== profile) return false;
        if (education && row.nivelEducativo !== education) return false;
        if (country && row.country !== country) return false;
        if (program && row.programCode !== program) return false;
        if (phase && row.measurementPhase !== phase) return false;
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

        function filteredLabFeedback() {
      return state.feedback.filter(row => {
        const isCase = row.suggestion && (row.suggestion.startsWith('[Caso:') || row.suggestion.startsWith('=CHOICE='));
        if (!isCase) return false;

        const query = normalizeText(els.searchInput.value);
        const profile = els.profileFilter.value;
        const education = els.educationFilter.value;
        const country = els.countryFilter.value;
        const program = els.programFilter.value;
        const phase = els.phaseFilter.value;
        const haystack = normalizeText(Object.values(row).join(' '));
        if (query && !haystack.includes(query)) return false;
        if (profile && row.profileKey !== profile && row.profile !== profile) return false;
        if (education && row.nivelEducativo !== education) return false;
        if (country && row.country !== country) return false;
        if (program && row.programCode !== program) return false;
        if (phase && row.measurementPhase !== phase) return false;
        if (!dateInRange(row.timestamp)) return false;
        return true;
      });
    }

    function currentVisibleSelectionState() {
      const rows = state.tab === 'completions' ? filteredCompletions() : (state.tab === 'labFeedback' ? filteredLabFeedback() : filteredFeedback());
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
      const labFeedbackRows = filteredLabFeedback();
      const visibleCompletionIds = completionRows.map(row => String(row.id));
      const visibleFeedbackIds = feedbackRows.map(row => String(row.id));
      const visibleLabFeedbackIds = labFeedbackRows.map(row => String(row.id));
      const checkedCompletions = visibleCompletionIds.filter(id => state.selectedCompletions.has(id)).length;
      const checkedFeedback = visibleFeedbackIds.filter(id => state.selectedFeedback.has(id)).length;
      const checkedLabFeedback = visibleLabFeedbackIds.filter(id => state.selectedFeedback.has(id)).length;
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
      if (els.selectAllLabFeedback) {
        els.selectAllLabFeedback.checked = visibleLabFeedbackIds.length > 0 && checkedLabFeedback === visibleLabFeedbackIds.length;
        els.selectAllLabFeedback.indeterminate = checkedLabFeedback > 0 && checkedLabFeedback < visibleLabFeedbackIds.length;
      }
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

    function setSelectOptions(select, options, preferredValue, emptyOption = null) {
      const rows = emptyOption ? [emptyOption, ...options] : options;
      select.innerHTML = rows
        .map(option => `<option value="${escapeHtml(option.key)}">${escapeHtml(option.label)}</option>`)
        .join('');
      const hasPreferred = rows.some(option => option.key === preferredValue);
      select.value = hasPreferred ? preferredValue : (rows[0]?.key || '');
    }

    function syncAnalysisChartOptions() {
      const metric = window.AdminAnalysis
        ?.listMetrics(els.analysisSource.value)
        .find(option => option.key === els.analysisMetric.value);
      const stackedOption = Array.from(els.analysisChartType.options).find(option => option.value === 'stacked');
      if (stackedOption) stackedOption.disabled = metric?.kind === 'average';
      if (metric?.kind === 'average' && els.analysisChartType.value === 'stacked') {
        els.analysisChartType.value = 'bars';
      }
      const isScatter = els.analysisChartType.value === 'scatter';
      els.analysisXAxisControl.classList.toggle('hidden', !isScatter);
      els.analysisYAxisControl.classList.toggle('hidden', !isScatter);
    }

    function configureAnalysisControls({ reset = false } = {}) {
      if (!window.AdminAnalysis) return;
      const source = els.analysisSource.value;
      const dimensions = window.AdminAnalysis.listDimensions(source);
      const metrics = window.AdminAnalysis.listMetrics(source);
      const numericFields = window.AdminAnalysis.listNumericFields(source);
      const priorDimension = reset ? '' : els.analysisDimension.value;
      const priorCompare = reset ? '' : els.analysisCompare.value;
      const priorMetric = reset ? '' : els.analysisMetric.value;
      const priorXAxis = reset ? '' : els.analysisXAxis.value;
      const priorYAxis = reset ? '' : els.analysisYAxis.value;

      setSelectOptions(els.analysisDimension, dimensions, priorDimension || dimensions[0]?.key);
      const comparisonOptions = dimensions.filter(option => option.key !== els.analysisDimension.value);
      const defaultComparison = state.analysisConfigured || source !== 'completions' ? '' : 'profile';
      setSelectOptions(
        els.analysisCompare,
        comparisonOptions,
        priorCompare || defaultComparison,
        { key: '', label: 'Sin segunda variable' }
      );
      setSelectOptions(els.analysisMetric, metrics, priorMetric || metrics[0]?.key);
      setSelectOptions(els.analysisXAxis, numericFields, priorXAxis || numericFields[0]?.key);
      setSelectOptions(els.analysisYAxis, numericFields, priorYAxis || numericFields[1]?.key || numericFields[0]?.key);
      ensureDistinctAnalysisAxes('x');
      state.analysisConfigured = true;
      syncAnalysisChartOptions();
      renderAnalysis();
    }

    function ensureDistinctAnalysisAxes(changedAxis) {
      if (els.analysisXAxis.value !== els.analysisYAxis.value) return;
      const target = changedAxis === 'x' ? els.analysisYAxis : els.analysisXAxis;
      const occupied = changedAxis === 'x' ? els.analysisXAxis.value : els.analysisYAxis.value;
      const alternative = Array.from(target.options).find(option => option.value !== occupied);
      if (alternative) target.value = alternative.value;
    }

    function renderAnalysis() {
      if (!window.AdminAnalysis || !els.analysisView) return;
      const source = els.analysisSource.value;
      const rows = source === 'feedback' ? filteredFeedback() : filteredCompletions();
      const model = window.AdminAnalysis.aggregate(rows, {
        source,
        dimension: els.analysisDimension.value,
        compare: els.analysisCompare.value,
        metric: els.analysisMetric.value,
        order: els.analysisOrder.value,
        xAxis: els.analysisXAxis.value,
        yAxis: els.analysisYAxis.value,
      });
      state.analysisModel = model;
      syncAnalysisChartOptions();

      const isScatter = els.analysisChartType.value === 'scatter';
      els.analysisSampleSize.textContent = fmtNumber(model.totalRows);
      els.analysisCategoryCount.textContent = fmtNumber(model.rows.length);
      els.analysisSeriesCount.textContent = fmtNumber(isScatter ? model.pointSeries.length : model.series.length);
      els.analysisSummaryText.textContent = model.empty
        ? 'No hay registros que coincidan con la combinación actual de filtros.'
        : `${isScatter ? model.scatterTitle : model.title}. Fuente: ${model.sourceLabel}.`;
      els.analysisDimensionHeading.textContent = isScatter ? 'Grupo' : model.dimensionLabel;
      els.analysisCompareHeading.textContent = isScatter ? 'Detalle' : (model.compareLabel || 'Serie');
      els.analysisMetricHeading.textContent = isScatter ? model.xAxis.label : model.metric.label;
      els.analysisFourthHeading.textContent = isScatter ? model.yAxis.label : 'N';
      els.analysisEmpty.classList.toggle('hidden', !model.empty);
      els.analysisChart.classList.toggle('hidden', model.empty);
      els.analysisDataDetails.classList.toggle('hidden', model.empty);

      const exportButtons = [els.exportAnalysisPngBtn, els.exportAnalysisSvgBtn, els.exportAnalysisCsvBtn];
      exportButtons.forEach(button => { button.disabled = model.empty; });
      if (model.empty) {
        els.analysisChart.innerHTML = '';
        els.analysisDataBody.innerHTML = '';
        return;
      }

      els.analysisChart.innerHTML = window.AdminAnalysis.renderSvg(model, els.analysisChartType.value);
      els.analysisDataBody.innerHTML = isScatter
        ? model.scatterPoints.map(point => `
          <tr>
            <td>${escapeHtml(point.group)}</td>
            <td>${escapeHtml(point.detail)}</td>
            <td>${escapeHtml(window.AdminAnalysis.formatNumericValue(point.x, model.xAxis))}</td>
            <td>${escapeHtml(window.AdminAnalysis.formatNumericValue(point.y, model.yAxis))}</td>
          </tr>
        `).join('')
        : model.exportRows.map(row => `
          <tr>
            <td>${escapeHtml(row.variable)}</td>
            <td>${escapeHtml(row.comparacion || 'Total')}</td>
            <td>${escapeHtml(window.AdminAnalysis.formatValue(row.valor, model.metric))}</td>
            <td>${escapeHtml(row.n)}</td>
          </tr>
        `).join('');
    }

    function analysisFilename(extension) {
      const model = state.analysisModel;
      const parts = ['analisis', els.analysisChartType.value, model?.sourceKey, model?.dimensionKey, model?.metricKey].filter(Boolean);
      return `${parts.join('-')}.${extension}`;
    }

    function downloadBlob(filename, blob) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    }

    function downloadAnalysisCsv() {
      const model = state.analysisModel;
      if (!model || model.empty) return;
      if (els.analysisChartType.value === 'scatter') {
        downloadRowsCsv(analysisFilename('csv'), model.scatterExportRows, ['grupo', 'detalle', 'eje_x', 'eje_y']);
        return;
      }
      downloadRowsCsv(analysisFilename('csv'), model.exportRows, ['variable', 'comparacion', 'valor', 'n']);
    }

    function downloadAnalysisSvg() {
      const model = state.analysisModel;
      if (!model || model.empty) return;
      const svg = window.AdminAnalysis.renderSvg(model, els.analysisChartType.value);
      downloadBlob(analysisFilename('svg'), new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
    }

    async function downloadSvgPng(svg, filename) {
      const width = Number(svg.match(/<svg[^>]+width="(\d+)"/)?.[1] || 1120);
      const height = Number(svg.match(/<svg[^>]+height="(\d+)"/)?.[1] || 630);
      const scale = Math.min(2, 10000 / Math.max(width, height));

      try {
        const image = new Image();
        image.decoding = 'async';
        await new Promise((resolve, reject) => {
          image.onload = resolve;
          image.onerror = () => reject(new Error('No se pudo preparar la imagen del gráfico.'));
          image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
        });
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(width * scale);
        canvas.height = Math.round(height * scale);
        const context = canvas.getContext('2d');
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        if (!blob) throw new Error('El navegador no pudo generar el archivo PNG.');
        downloadBlob(filename, blob);
      } catch (error) {
        setStatus(`No se pudo exportar el gráfico: ${error.message}`, true, 'error');
      }
    }

    async function downloadAnalysisPng() {
      const model = state.analysisModel;
      if (!model || model.empty) return;
      const svg = window.AdminAnalysis.renderSvg(model, els.analysisChartType.value);
      await downloadSvgPng(svg, analysisFilename('png'));
    }

    function ensureDistinctInferenceVariables(changedVariable = 'a') {
      if (els.inferenceVariableA.value !== els.inferenceVariableB.value) return;
      const target = changedVariable === 'a' ? els.inferenceVariableB : els.inferenceVariableA;
      const occupied = changedVariable === 'a' ? els.inferenceVariableA.value : els.inferenceVariableB.value;
      const alternative = Array.from(target.options).find(option => option.value !== occupied);
      if (alternative) target.value = alternative.value;
    }

    function configureInferenceControls({ reset = false } = {}) {
      if (!window.AdminInference || !els.inferenceView) return;
      const source = els.inferenceSource.value;
      const mode = els.inferenceMode.value;
      const dimensions = window.AdminInference.listDimensions(source, mode === 'groups' ? 'groups' : 'association');
      const outcomes = window.AdminInference.listOutcomes(source);
      const priorA = reset ? '' : els.inferenceVariableA.value;
      const priorB = reset ? '' : els.inferenceVariableB.value;
      const priorGroup = reset ? '' : els.inferenceGroup.value;
      const priorOutcome = reset ? '' : els.inferenceOutcome.value;

      setSelectOptions(els.inferenceVariableA, dimensions, priorA || dimensions[0]?.key);
      setSelectOptions(els.inferenceVariableB, dimensions, priorB || dimensions[1]?.key || dimensions[0]?.key);
      ensureDistinctInferenceVariables('a');
      setSelectOptions(els.inferenceGroup, dimensions, priorGroup || dimensions[0]?.key);
      setSelectOptions(els.inferenceOutcome, outcomes, priorOutcome || outcomes[0]?.key);

      const comparesCategories = mode === 'association';
      els.inferenceVariableAControl.classList.toggle('hidden', !comparesCategories);
      els.inferenceVariableBControl.classList.toggle('hidden', !comparesCategories);
      els.inferenceGroupControl.classList.toggle('hidden', comparesCategories);
      els.inferenceOutcomeControl.classList.toggle('hidden', comparesCategories);
      state.inferenceConfigured = true;
      renderInference();
    }

    function renderInference() {
      if (!window.AdminInference || !els.inferenceView) return;
      const source = els.inferenceSource.value;
      const rows = source === 'feedback' ? filteredFeedback() : filteredCompletions();
      const mode = els.inferenceMode.value;
      const model = mode === 'groups'
        ? window.AdminInference.compareGroups(rows, {
          source,
          group: els.inferenceGroup.value,
          outcome: els.inferenceOutcome.value,
        })
        : window.AdminInference.association(rows, {
          source,
          variableA: els.inferenceVariableA.value,
          variableB: els.inferenceVariableB.value,
          iterations: 1500,
        });
      state.inferenceModel = model;

      els.inferenceSampleSize.textContent = fmtNumber(model.total);
      els.inferenceMethod.textContent = model.methodLabel;
      els.inferencePValue.textContent = model.valid
        ? window.AdminInference.formatPValue(model.pValue, model.approximate)
        : '—';
      els.inferenceEffect.textContent = model.valid
        ? `${model.effectLabel} (${model.effect.toLocaleString('es-UY', { minimumFractionDigits: 3, maximumFractionDigits: 3 })})`
        : '—';
      els.inferenceSummaryText.textContent = model.interpretation;
      const warnings = model.warnings || [];
      els.inferenceWarning.classList.toggle('hidden', warnings.length === 0);
      els.inferenceWarning.innerHTML = warnings.length
        ? `<ul>${warnings.map(warning => `<li>${escapeHtml(warning)}</li>`).join('')}</ul>`
        : '';
      els.inferenceEmpty.classList.toggle('hidden', model.valid);
      els.inferenceChart.classList.toggle('hidden', !model.valid);
      els.inferenceDataDetails.classList.toggle('hidden', !model.valid);

      const exportButtons = [els.exportInferencePngBtn, els.exportInferenceSvgBtn, els.exportInferenceCsvBtn];
      exportButtons.forEach(button => { button.disabled = !model.valid; });
      if (!model.valid) {
        els.inferenceChart.innerHTML = '';
        els.inferenceDataBody.innerHTML = '';
        return;
      }

      els.inferenceChart.innerHTML = window.AdminInference.renderSvg(model);
      const isGroups = model.mode === 'groups';
      els.inferenceHeadingA.textContent = isGroups ? model.groupLabel : model.variableALabel;
      els.inferenceHeadingB.textContent = isGroups ? 'N' : model.variableBLabel;
      els.inferenceHeadingC.textContent = isGroups ? 'Media' : 'Observado';
      els.inferenceHeadingD.textContent = isGroups ? 'Q1' : 'Esperado';
      els.inferenceHeadingE.textContent = isGroups ? 'Mediana' : 'Residuo ajustado';
      els.inferenceHeadingF.textContent = 'Q3';
      els.inferenceHeadingF.classList.toggle('hidden', !isGroups);
      els.inferenceDataBody.innerHTML = isGroups
        ? model.exportRows.map(row => `
          <tr>
            <td>${escapeHtml(row.grupo)}</td>
            <td>${escapeHtml(row.n)}</td>
            <td>${escapeHtml(row.media)}</td>
            <td>${escapeHtml(row.q1)}</td>
            <td>${escapeHtml(row.mediana)}</td>
            <td>${escapeHtml(row.q3)}</td>
          </tr>
        `).join('')
        : model.exportRows.map(row => `
          <tr>
            <td>${escapeHtml(row.variable_a)}</td>
            <td>${escapeHtml(row.variable_b)}</td>
            <td>${escapeHtml(row.observado)}</td>
            <td>${escapeHtml(row.esperado)}</td>
            <td>${escapeHtml(row.residuo_ajustado)}</td>
          </tr>
        `).join('');
    }

    function inferenceFilename(extension) {
      const model = state.inferenceModel;
      const parts = ['analisis-inferencial', model?.mode, model?.sourceKey, model?.variableAKey || model?.groupKey, model?.variableBKey || model?.outcomeKey].filter(Boolean);
      return `${parts.join('-')}.${extension}`;
    }

    function downloadInferenceCsv() {
      const model = state.inferenceModel;
      if (!model?.valid) return;
      const columns = model.mode === 'groups'
        ? ['grupo', 'n', 'media', 'q1', 'mediana', 'q3']
        : ['variable_a', 'variable_b', 'observado', 'esperado', 'residuo_ajustado'];
      downloadRowsCsv(inferenceFilename('csv'), model.exportRows, columns);
    }

    function downloadInferenceSvg() {
      const model = state.inferenceModel;
      if (!model?.valid) return;
      const svg = window.AdminInference.renderSvg(model);
      downloadBlob(inferenceFilename('svg'), new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
    }

    async function downloadInferencePng() {
      const model = state.inferenceModel;
      if (!model?.valid) return;
      await downloadSvgPng(window.AdminInference.renderSvg(model), inferenceFilename('png'));
    }

    function filteredCompletionsForProgramEval() {
      const query = normalizeText(els.searchInput.value);
      const profile = els.profileFilter.value;
      const education = els.educationFilter.value;
      const familiarity = els.familiarityFilter.value;
      const resources = els.resourcesFilter.value;
      const country = els.countryFilter.value;
      const program = els.programFilter.value;

      return state.completions.filter(row => {
        const haystack = normalizeText(Object.values(row).join(' '));
        if (query && !haystack.includes(query)) return false;
        if (profile && row.profileKey !== profile && row.profile !== profile) return false;
        if (education && row.nivelEducativo !== education) return false;
        if (familiarity && row.familiaridadInicial !== familiarity) return false;
        if (resources && row.recursosSimilares !== resources) return false;
        if (country && row.country !== country) return false;
        if (program && row.programCode !== program) return false;
        if (!dateInRange(row.timestamp)) return false;
        return true;
      });
    }

    function fmtSignedDelta(pts, relPct) {
      if (pts === null || pts === undefined) return '—';
      const num = Number(pts);
      if (!Number.isFinite(num)) return '—';
      const sign = num > 0 ? '+' : '';
      const ptsStr = `${sign}${num.toFixed(1)} pts`;
      if (relPct === null || relPct === undefined || !Number.isFinite(Number(relPct))) {
        return ptsStr;
      }
      const relNum = Number(relPct);
      const relSign = relNum > 0 ? '+' : '';
      return `${ptsStr} (${relSign}${relNum.toFixed(1)}%)`;
    }

    function renderStageCardText(stage) {
      if (!stage || !stage.count) return '0 recorridos · Prom. —';
      const avg = stage.averageEvidence !== null ? stage.averageEvidence.toFixed(1) : '—';
      const lit = stage.averageLiteracyScore !== null ? ` · Lit: ${stage.averageLiteracyScore.toFixed(1)}` : '';
      return `${fmtNumber(stage.count)} recorrido(s) · ${fmtNumber(stage.uniqueParticipants)} ID · Ética: ${avg}${lit}`;
    }

    const PROGRAM_TARGETS_STORAGE_KEY = 'iag_program_eval_targets_v1';
    const DEFAULT_PROGRAM_TARGETS = {
      participants: 300,
      cohorts: 10,
      completionRatePct: 80,
      relativeImprovementPct: 20,
    };

    function sanitizeTargetNumber(value, fallback, min = 1, max = 100000) {
      const n = Number(value);
      if (!Number.isFinite(n)) return fallback;
      return Math.max(min, Math.min(max, Math.round(n)));
    }

    function loadProgramEvalTargetsIntoInputs() {
      let saved = null;
      try {
        const raw = localStorage.getItem(PROGRAM_TARGETS_STORAGE_KEY);
        if (raw) saved = JSON.parse(raw);
      } catch (_) {
        saved = null;
      }
      const targets = {
        participants: sanitizeTargetNumber(saved?.participants, DEFAULT_PROGRAM_TARGETS.participants, 1, 100000),
        cohorts: sanitizeTargetNumber(saved?.cohorts, DEFAULT_PROGRAM_TARGETS.cohorts, 1, 1000),
        completionRatePct: sanitizeTargetNumber(saved?.completionRatePct, DEFAULT_PROGRAM_TARGETS.completionRatePct, 1, 100),
        relativeImprovementPct: sanitizeTargetNumber(saved?.relativeImprovementPct, DEFAULT_PROGRAM_TARGETS.relativeImprovementPct, 1, 500),
      };
      if (els.programTargetParticipants) els.programTargetParticipants.value = String(targets.participants);
      if (els.programTargetCohorts) els.programTargetCohorts.value = String(targets.cohorts);
      if (els.programTargetCompletion) els.programTargetCompletion.value = String(targets.completionRatePct);
      if (els.programTargetImprovement) els.programTargetImprovement.value = String(targets.relativeImprovementPct);
      return targets;
    }

    function getProgramEvalTargets() {
      const targets = {
        participants: sanitizeTargetNumber(els.programTargetParticipants?.value, DEFAULT_PROGRAM_TARGETS.participants, 1, 100000),
        cohorts: sanitizeTargetNumber(els.programTargetCohorts?.value, DEFAULT_PROGRAM_TARGETS.cohorts, 1, 1000),
        completionRatePct: sanitizeTargetNumber(els.programTargetCompletion?.value, DEFAULT_PROGRAM_TARGETS.completionRatePct, 1, 100),
        relativeImprovementPct: sanitizeTargetNumber(els.programTargetImprovement?.value, DEFAULT_PROGRAM_TARGETS.relativeImprovementPct, 1, 500),
      };
      try {
        localStorage.setItem(PROGRAM_TARGETS_STORAGE_KEY, JSON.stringify(targets));
      } catch (_) {
        // Ignorar errores de almacenamiento local restringido
      }
      return targets;
    }

    function resetProgramEvalTargets() {
      try {
        localStorage.removeItem(PROGRAM_TARGETS_STORAGE_KEY);
      } catch (_) {}
      loadProgramEvalTargetsIntoInputs();
      renderProgramEval();
    }

    function sanitizeCohortToken(value) {
      const cleaned = String(value || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 48);
      return cleaned || 'general';
    }

    function updateCohortLinkBuilder() {
      if (!els.cohortLinkBaselineInput) return;
      const programCode = els.cohortLinkProgramSelect?.value || 'uy-us-ai-literacy-2027';
      const cohortCode = sanitizeCohortToken(els.cohortLinkCodeInput?.value);
      const baseOrigin = window.location.origin && window.location.origin !== 'null'
        ? window.location.origin
        : 'https://iagetica.org';
      const buildUrl = phase => `${baseOrigin}/?program=${encodeURIComponent(programCode)}&cohort=${encodeURIComponent(cohortCode)}&phase=${encodeURIComponent(phase)}`;
      els.cohortLinkBaselineInput.value = buildUrl('baseline');
      if (els.cohortLinkFinalInput) els.cohortLinkFinalInput.value = buildUrl('final');
      if (els.cohortLinkFollowupInput) els.cohortLinkFollowupInput.value = buildUrl('followup');
    }

    async function copyCohortPhaseLink(phase) {
      updateCohortLinkBuilder();
      const map = {
        baseline: els.cohortLinkBaselineInput,
        final: els.cohortLinkFinalInput,
        followup: els.cohortLinkFollowupInput,
      };
      const input = map[phase];
      if (!input || !input.value) return;
      try {
        await navigator.clipboard.writeText(input.value);
        if (els.cohortLinkStatus) {
          els.cohortLinkStatus.textContent = `Enlace (${phase}) copiado al portapapeles: ${input.value}`;
        }
      } catch (_) {
        input.focus();
        input.select();
        if (els.cohortLinkStatus) {
          els.cohortLinkStatus.textContent = `Seleccioné el enlace (${phase}) para copiarlo manualmente.`;
        }
      }
    }

    function renderProgramEval() {
      if (!window.AdminAnalysis?.evaluateProgram || !els.programEvalView) return;
      const rows = filteredCompletionsForProgramEval();
      const targets = getProgramEvalTargets();
      const evalModel = window.AdminAnalysis.evaluateProgram(rows, {
        programCode: els.programFilter.value,
        programOnly: true,
        targets,
      });
      state.programEvalModel = evalModel;

      if (els.programEvalParticipantsLabel) {
        els.programEvalParticipantsLabel.textContent = `Participantes únicos (Meta ${fmtNumber(targets.participants)})`;
      }
      if (els.programEvalCohortsLabel) {
        els.programEvalCohortsLabel.textContent = `Cohortes activas (Meta ${fmtNumber(targets.cohorts)})`;
      }
      if (els.programEvalCompletionLabel) {
        els.programEvalCompletionLabel.textContent = `Finalización Pre→Post (Meta ${targets.completionRatePct}%)`;
      }
      if (els.programEvalImprovementLabel) {
        els.programEvalImprovementLabel.textContent = `Cambio Pre/Post (Meta +${targets.relativeImprovementPct}%)`;
      }

      if (els.programEvalStageBaseline) {
        els.programEvalStageBaseline.textContent = renderStageCardText(evalModel.stages.baseline);
      }
      if (els.programEvalStageFinal) {
        els.programEvalStageFinal.textContent = renderStageCardText(evalModel.stages.final);
      }
      if (els.programEvalStageFollowup) {
        els.programEvalStageFollowup.textContent = renderStageCardText(evalModel.stages.followup);
      }

      els.programEvalParticipants.textContent = `${fmtNumber(evalModel.uniqueParticipants)} (${evalModel.progress.participantsPct}%)`;
      els.programEvalCohorts.textContent = `${fmtNumber(evalModel.activeCohorts)} (${evalModel.progress.cohortsPct}%)`;
      els.programEvalCompletionRate.textContent = evalModel.progress.completionRatePct !== null
        ? `${evalModel.progress.completionRatePct.toFixed(1)}%`
        : '—';
      els.programEvalAggregateDelta.textContent = fmtSignedDelta(
        evalModel.aggregateChange.deltaPoints,
        evalModel.aggregateChange.relativeChangePct
      );
      els.programEvalPairedDelta.textContent = evalModel.paired.pairedCount > 0
        ? `${fmtSignedDelta(evalModel.paired.deltaMean, evalModel.paired.relativeChangePct)} · N=${evalModel.paired.pairedCount}`
        : 'Sin pares aún';
      if (els.programEvalLiteracyDelta) {
        els.programEvalLiteracyDelta.textContent = evalModel.paired.literacyPairsCount > 0
          ? `${fmtSignedDelta(evalModel.paired.deltaLiteracyMean, evalModel.paired.relativeLiteracyChangePct)} · N=${evalModel.paired.literacyPairsCount}`
          : (evalModel.aggregateChange.literacyDeltaPoints !== null
              ? fmtSignedDelta(evalModel.aggregateChange.literacyDeltaPoints, evalModel.aggregateChange.literacyRelativePct)
              : '—');
      }

      if (evalModel.empty) {
        els.programEvalSummaryText.textContent = 'No hay recorridos registrados con código de programa o cohorte para los filtros seleccionados.';
      } else {
        const pairedText = evalModel.paired.pairedCount > 0
          ? `${evalModel.paired.pairedCount} participante(s) cuentan con trayectoria pareada Inicial→Final (${evalModel.paired.improvedPct}% mejoró su puntaje de ética${evalModel.paired.improvedLiteracyPct !== null ? `, ${evalModel.paired.improvedLiteracyPct}% mejoró en lit-v1` : ''}).`
          : 'Aún no hay participantes con ambos momentos (Inicial y Final) bajo el mismo ID seudónimo.';
        els.programEvalSummaryText.textContent = `${fmtNumber(evalModel.totalProgramRows)} recorrido(s) en ${fmtNumber(evalModel.activeCohorts)} cohorte(s). ${pairedText}`;
      }

      els.programEvalEmpty.classList.toggle('hidden', !evalModel.empty);
      els.programEvalTableWrap.classList.toggle('hidden', evalModel.empty);
      if (els.exportProgramEvalReportBtn) els.exportProgramEvalReportBtn.disabled = evalModel.empty;
      if (els.exportProgramEvalCsvBtn) els.exportProgramEvalCsvBtn.disabled = evalModel.empty;

      if (evalModel.empty) {
        els.programEvalCohortBody.innerHTML = '';
        return;
      }

      els.programEvalCohortBody.innerHTML = evalModel.cohorts.map(cohort => {
        const iniText = `${fmtNumber(cohort.baselineCount)} / ${cohort.baselineMean !== null ? cohort.baselineMean.toFixed(1) : '—'}${cohort.baselineLiteracyMean !== null ? ` [${cohort.baselineLiteracyMean.toFixed(1)}]` : ''}`;
        const finText = `${fmtNumber(cohort.finalCount)} / ${cohort.finalMean !== null ? cohort.finalMean.toFixed(1) : '—'}${cohort.finalLiteracyMean !== null ? ` [${cohort.finalLiteracyMean.toFixed(1)}]` : ''}`;
        const segText = `${fmtNumber(cohort.followupCount)} / ${cohort.followupMean !== null ? cohort.followupMean.toFixed(1) : '—'}${cohort.followupLiteracyMean !== null ? ` [${cohort.followupLiteracyMean.toFixed(1)}]` : ''}`;
        const aggDelta = fmtSignedDelta(cohort.aggregateDelta, cohort.aggregateRelativePct);
        const pairDelta = cohort.pairedCount > 0
          ? fmtSignedDelta(cohort.pairedDeltaMean, cohort.pairedRelativePct)
          : '—';
        const litDelta = cohort.pairedLiteracyDeltaMean !== null
          ? fmtSignedDelta(cohort.pairedLiteracyDeltaMean, cohort.pairedLiteracyRelativePct)
          : (cohort.aggregateLiteracyDelta !== null ? fmtSignedDelta(cohort.aggregateLiteracyDelta, cohort.aggregateLiteracyRelativePct) : '—');

        return `
          <tr>
            <td><strong>${escapeHtml(cohort.cohortCode)}</strong></td>
            <td>${escapeHtml(cohort.programCode)}</td>
            <td>${escapeHtml(cohort.countries)}</td>
            <td>${fmtNumber(cohort.uniqueParticipants)}</td>
            <td>${escapeHtml(iniText)}</td>
            <td>${escapeHtml(finText)}</td>
            <td>${escapeHtml(segText)}</td>
            <td>${fmtNumber(cohort.pairedCount)}</td>
            <td>${escapeHtml(`${aggDelta} / ${pairDelta}`)}<br><small class="muted">Lit: ${escapeHtml(litDelta)}</small></td>
          </tr>
        `;
      }).join('');
    }

    function downloadProgramEvalCsv() {
      const model = state.programEvalModel;
      if (!model || model.empty) return;
      const progSlug = els.programFilter.value || 'programa-uy-us';
      downloadRowsCsv(`monitoreo-cohortes-${progSlug}.csv`, model.exportRows, [
        'programa', 'cohorte', 'paises', 'participantes_unicos', 'recorridos_totales',
        'n_inicial', 'prom_inicial', 'n_final', 'prom_final', 'n_seguimiento', 'prom_seguimiento',
        'n_pareados', 'cambio_agregado_pts', 'cambio_pareado_pts', 'cambio_pareado_pct', 'tasa_finalizacion_pct'
      ]);
    }

    function downloadProgramEvalReport() {
      const model = state.programEvalModel;
      if (!model || model.empty || !window.AdminAnalysis?.formatProgramReportMarkdown) return;
      const md = window.AdminAnalysis.formatProgramReportMarkdown(model);
      const progSlug = els.programFilter.value || 'programa-uy-us';
      downloadBlob(`informe-me-${progSlug}.md`, new Blob([md], { type: 'text/markdown;charset=utf-8' }));
    }

    function renderCurrentTab() {
      const tab = state.tab;
      els.completionsView.classList.toggle('hidden', tab !== 'completions');
      els.feedbackView.classList.toggle('hidden', tab !== 'feedback');
      els.labFeedbackView.classList.toggle('hidden', tab !== 'labFeedback');
      els.analysisView.classList.toggle('hidden', tab !== 'analysis');
      els.inferenceView.classList.toggle('hidden', tab !== 'inference');
      if (els.programEvalView) els.programEvalView.classList.toggle('hidden', tab !== 'programEval');
      els.levelFilter.classList.toggle('hidden', tab !== 'completions');
      els.familiarityFilter.classList.toggle('hidden', tab !== 'completions');
      els.resourcesFilter.classList.toggle('hidden', tab !== 'completions');
      els.phaseFilter.classList.toggle('hidden', tab === 'programEval');
      els.exportCompletionsBtn.classList.toggle('hidden', tab !== 'completions');
      els.exportAnswersBtn.classList.toggle('hidden', tab !== 'completions');
      els.exportFeedbackBtn.classList.toggle('hidden', tab !== 'feedback');
      els.exportLabFeedbackBtn.classList.toggle('hidden', tab !== 'labFeedback');
      const isAnalysisTab = tab === 'analysis' || tab === 'inference' || tab === 'programEval';
      els.toggleSelectAllBtn.classList.toggle('hidden', isAnalysisTab);
      els.deleteSelectedBtn.classList.toggle('hidden', isAnalysisTab);
      els.tabs.forEach(t => {
        const active = t.dataset.tab === tab;
        t.classList.toggle('active', active);
        t.setAttribute('aria-selected', String(active));
      });

      if (tab === 'completions') renderCompletions();
      else if (tab === 'feedback') renderFeedback();
      else if (tab === 'labFeedback') renderLabFeedback();
      else if (tab === 'analysis') renderAnalysis();
      else if (tab === 'inference') renderInference();
      else if (tab === 'programEval') renderProgramEval();
    }

        function renderLabFeedback() {
      const rows = filteredLabFeedback();

      if (!rows.length) {
        els.labFeedbackBody.innerHTML = '<tr><td colspan="8" class="empty">No hay sugerencias del laboratorio para mostrar.</td></tr>';
        return;
      }

      els.labFeedbackBody.innerHTML = rows.map(row => {
        let caseTitle = 'General';
        let type = 'Sugerencia';
        let displayText = row.suggestion || '';

        if (row.suggestion) {
          if (row.suggestion.startsWith('=CHOICE=')) {
            type = 'Decisión';
            const match = row.suggestion.match(/=CHOICE=\s*\[Caso:\s*([^\]]+)\]\s*(.*)/);
            if (match) {
              caseTitle = match[1];
              displayText = match[2];
            }
          } else if (row.suggestion.startsWith('[Caso:')) {
            type = 'Sugerencia';
            const match = row.suggestion.match(/\[Caso:\s*([^\]]+)\]\s*(.*)/);
            if (match) {
              caseTitle = match[1];
              displayText = match[2];
            }
          }
        }

        const isChecked = state.selectedFeedback.has(String(row.id));
        const ratingBadge = row.rating === 4 
          ? `<span class="badge secondary" style="background:#dbeafe; color:#1e40af; border:1px solid #bfdbfe; padding:0.25rem 0.5rem; border-radius:4px; font-size:0.75rem; font-weight:600;">${escapeHtml(type)}</span>` 
          : `<span class="badge success" style="background:#d1fae5; color:#065f46; border:1px solid #a7f3d0; padding:0.25rem 0.5rem; border-radius:4px; font-size:0.75rem; font-weight:600;">${escapeHtml(type)}</span>`;

        return `
          <tr class="${isChecked ? 'selected' : ''}">
            <td><input type="checkbox" data-select-lab-feedback="${escapeHtml(row.id)}" aria-label="Seleccionar sugerencia" ${isChecked ? 'checked' : ''}></td>
            <td class="nowrap">${escapeHtml(fmtDate(row.timestamp))}</td>
            <td style="font-weight:600;">${escapeHtml(caseTitle)}</td>
            <td>${ratingBadge}</td>
            <td class="text-left" style="max-width: 450px; word-wrap: break-word; white-space: normal; line-height: 1.4;">
              ${escapeHtml(displayText)}
            </td>
            <td>${escapeHtml(row.profile || 'docente')}</td>
            <td>${escapeHtml(row.nivelEducativo || 'Secundaria')}</td>
            <td>${escapeHtml(row.country || 'Sin determinar')}</td>
          </tr>
        `;
      }).join('');

      els.labFeedbackBody.querySelectorAll('[data-select-lab-feedback]').forEach(input => {
        input.addEventListener('change', () => {
          if (input.checked) state.selectedFeedback.add(String(input.dataset.selectLabFeedback));
          else state.selectedFeedback.delete(String(input.dataset.selectLabFeedback));
          renderCurrentTab();
        });
      });
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
      const blob = new Blob(['\uFEFF' + [header, ...lines].join('\r\n')], { type: 'text/csv;charset=utf-8' });
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
          'programCode', 'cohortCode', 'measurementPhase', 'participantId',
          'nivelEducativo', 'familiaridadInicial', 'recursosSimilares', 'evidence',
          'likertLevel', 'answersCount'
        ]);
        return;
      }

      if (type === 'feedback') {
        downloadRowsCsv('valoraciones-filtradas.csv', filteredFeedback(), [
          'id', 'eventId', 'timestamp', 'sessionId', 'rating', 'suggestion',
          'profile', 'profileKey', 'country', 'programCode', 'cohortCode',
          'measurementPhase', 'participantId', 'nivelEducativo'
        ]);
        return;
      }

      if (type === 'labFeedback') {
        downloadRowsCsv('laboratorio-filtrado.csv', filteredLabFeedback(), [
          'id', 'eventId', 'timestamp', 'sessionId', 'rating', 'suggestion',
          'profile', 'profileKey', 'country', 'programCode', 'cohortCode',
          'measurementPhase', 'participantId', 'nivelEducativo'
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
      const rows = type === 'completions' ? filteredCompletions() : (type === 'labFeedback' ? filteredLabFeedback() : filteredFeedback());
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
    els.programFilter.addEventListener('change', renderCurrentTab);
    els.phaseFilter.addEventListener('change', renderCurrentTab);
    els.levelFilter.addEventListener('change', renderCurrentTab);
    els.dateFromFilter.addEventListener('change', renderCurrentTab);
    els.dateToFilter.addEventListener('change', renderCurrentTab);
    els.exportCutZipBtn.addEventListener('click', downloadCutZip);
    els.exportCompletionsBtn.addEventListener('click', () => downloadFilteredCsv('completions'));
    els.exportFeedbackBtn.addEventListener('click', () => downloadFilteredCsv('feedback'));
    els.exportLabFeedbackBtn.addEventListener('click', () => downloadFilteredCsv('labFeedback'));
    els.exportAnswersBtn.addEventListener('click', () => downloadFilteredCsv('answers'));
    els.analysisSource.addEventListener('change', () => configureAnalysisControls({ reset: true }));
    els.analysisDimension.addEventListener('change', configureAnalysisControls);
    els.analysisCompare.addEventListener('change', renderAnalysis);
    els.analysisMetric.addEventListener('change', renderAnalysis);
    els.analysisChartType.addEventListener('change', renderAnalysis);
    els.analysisXAxis.addEventListener('change', () => {
      ensureDistinctAnalysisAxes('x');
      renderAnalysis();
    });
    els.analysisYAxis.addEventListener('change', () => {
      ensureDistinctAnalysisAxes('y');
      renderAnalysis();
    });
    els.analysisOrder.addEventListener('change', renderAnalysis);
    els.exportAnalysisPngBtn.addEventListener('click', downloadAnalysisPng);
    els.exportAnalysisSvgBtn.addEventListener('click', downloadAnalysisSvg);
    els.exportAnalysisCsvBtn.addEventListener('click', downloadAnalysisCsv);
    els.inferenceMode.addEventListener('change', () => configureInferenceControls({ reset: true }));
    els.inferenceSource.addEventListener('change', () => configureInferenceControls({ reset: true }));
    els.inferenceVariableA.addEventListener('change', () => {
      ensureDistinctInferenceVariables('a');
      renderInference();
    });
    els.inferenceVariableB.addEventListener('change', () => {
      ensureDistinctInferenceVariables('b');
      renderInference();
    });
    els.inferenceGroup.addEventListener('change', renderInference);
    els.inferenceOutcome.addEventListener('change', renderInference);
    els.exportInferencePngBtn.addEventListener('click', downloadInferencePng);
    els.exportInferenceSvgBtn.addEventListener('click', downloadInferenceSvg);
    els.exportInferenceCsvBtn.addEventListener('click', downloadInferenceCsv);
    if (els.exportProgramEvalCsvBtn) {
      els.exportProgramEvalCsvBtn.addEventListener('click', downloadProgramEvalCsv);
    }
    if (els.exportProgramEvalReportBtn) {
      els.exportProgramEvalReportBtn.addEventListener('click', downloadProgramEvalReport);
    }
    if (els.resetProgramTargetsBtn) {
      els.resetProgramTargetsBtn.addEventListener('click', resetProgramEvalTargets);
    }
    [els.programTargetParticipants, els.programTargetCohorts, els.programTargetCompletion, els.programTargetImprovement]
      .filter(Boolean)
      .forEach(input => {
        input.addEventListener('input', renderProgramEval);
        input.addEventListener('change', renderProgramEval);
      });
    if (els.cohortLinkProgramSelect) {
      els.cohortLinkProgramSelect.addEventListener('change', updateCohortLinkBuilder);
    }
    if (els.cohortLinkCodeInput) {
      els.cohortLinkCodeInput.addEventListener('input', updateCohortLinkBuilder);
    }
    if (els.copyBaselineLinkBtn) {
      els.copyBaselineLinkBtn.addEventListener('click', () => copyCohortPhaseLink('baseline'));
    }
    if (els.copyFinalLinkBtn) {
      els.copyFinalLinkBtn.addEventListener('click', () => copyCohortPhaseLink('final'));
    }
    if (els.copyFollowupLinkBtn) {
      els.copyFollowupLinkBtn.addEventListener('click', () => copyCohortPhaseLink('followup'));
    }
    loadProgramEvalTargetsIntoInputs();
    updateCohortLinkBuilder();
    els.selectAllCompletions.addEventListener('change', () => toggleVisibleSelection('completions', els.selectAllCompletions.checked));
    els.selectAllFeedback.addEventListener('change', () => toggleVisibleSelection('feedback', els.selectAllFeedback.checked));
    if (els.selectAllLabFeedback) {
      els.selectAllLabFeedback.addEventListener('change', () => toggleVisibleSelection('labFeedback', els.selectAllLabFeedback.checked));
    }

    els.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        state.tab = tab.dataset.tab;
        renderCurrentTab();
      });
    });

    configureAnalysisControls();
    configureInferenceControls();

    if (state.key) {
      loadAll();
    } else {
      els.login.classList.remove('hidden');
    }
