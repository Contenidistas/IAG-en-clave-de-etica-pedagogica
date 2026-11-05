(function () {
  const PROGRAMS = Object.freeze({
    'uy-us-ai-literacy-2027': Object.freeze({
      code: 'uy-us-ai-literacy-2027',
      title: {
        es: 'Laboratorio Uruguay–Estados Unidos sobre IA y educación',
        en: 'Uruguay–United States Lab on AI and Education',
        pt: 'Laboratório Uruguai–Estados Unidos sobre IA e educação',
        fr: 'Laboratoire Uruguay–États-Unis sur l’IA et l’éducation',
      },
      description: {
        es: 'Este recorrido forma parte de un programa piloto de formación, intercambio y aplicación responsable de IA en educación.',
        en: 'This journey is part of a pilot program for training, exchange, and responsible application of AI in education.',
        pt: 'Este percurso faz parte de um programa piloto de formação, intercâmbio e aplicação responsável da IA na educação.',
        fr: 'Ce parcours fait partie d’un programme pilote de formation, d’échange et d’application responsable de l’IA en éducation.',
      },
    }),
  });

  const COPY = Object.freeze({
    es: {
      eyebrow: 'Modo programa piloto',
      cohort: 'Cohorte',
      phase: 'Momento de medición',
      privacy: 'Si aceptás el registro anónimo, un código seudónimo permitirá comparar momentos del programa sin guardar correo, documento ni identidad real.',
      phases: { baseline: 'Diagnóstico inicial', final: 'Evaluación final', followup: 'Seguimiento' },
    },
    en: {
      eyebrow: 'Pilot program mode',
      cohort: 'Cohort',
      phase: 'Measurement stage',
      privacy: 'If you accept anonymous tracking, a pseudonymous code will compare program stages without storing your email, ID, or real identity.',
      phases: { baseline: 'Initial diagnostic', final: 'Final assessment', followup: 'Follow-up' },
    },
    pt: {
      eyebrow: 'Modo programa piloto',
      cohort: 'Coorte',
      phase: 'Momento de medição',
      privacy: 'Se você aceitar o registro anônimo, um código pseudônimo permitirá comparar momentos sem armazenar e-mail, documento ou identidade real.',
      phases: { baseline: 'Diagnóstico inicial', final: 'Avaliação final', followup: 'Acompanhamento' },
    },
    fr: {
      eyebrow: 'Mode programme pilote',
      cohort: 'Cohorte',
      phase: 'Étape de mesure',
      privacy: 'Si vous acceptez le suivi anonyme, un code pseudonyme permettra de comparer les étapes sans conserver votre courriel, document ou identité réelle.',
      phases: { baseline: 'Diagnostic initial', final: 'Évaluation finale', followup: 'Suivi' },
    },
  });

  function normalizeToken(value, maxLength) {
    const token = String(value || '').trim().toLowerCase();
    if (!token || token.length > maxLength || !/^[a-z0-9][a-z0-9_-]*$/.test(token)) return '';
    return token;
  }

  function generateParticipantId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return `p-${window.crypto.randomUUID()}`;
    }
    return `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 14)}`;
  }

  function participantIdFor(programCode, cohortCode) {
    const storageKey = `iag_program_participant:${programCode}:${cohortCode}`;
    const storage = window.appStorage && window.appStorage.local;
    let participantId = '';
    try {
      participantId = normalizeToken(storage && storage.getItem(storageKey), 80);
    } catch (error) {
      participantId = '';
    }
    if (participantId) return participantId;

    participantId = generateParticipantId();
    try {
      if (storage) storage.setItem(storageKey, participantId);
    } catch (error) {
      // El recorrido sigue funcionando con un identificador efímero.
    }
    return participantId;
  }

  function read(urlValue) {
    const url = new URL(urlValue || window.location.href, window.location.href);
    const programCode = normalizeToken(url.searchParams.get('program'), 64);
    const program = PROGRAMS[programCode];
    if (!program) {
      return Object.freeze({
        active: false,
        programCode: '',
        cohortCode: '',
        measurementPhase: '',
        participantId: '',
        program: null,
      });
    }

    const cohortCode = normalizeToken(url.searchParams.get('cohort'), 48) || 'general';
    const requestedPhase = normalizeToken(url.searchParams.get('phase'), 16);
    const measurementPhase = ['baseline', 'final', 'followup'].includes(requestedPhase)
      ? requestedPhase
      : 'baseline';

    return Object.freeze({
      active: true,
      programCode,
      cohortCode,
      measurementPhase,
      participantId: participantIdFor(programCode, cohortCode),
      program,
    });
  }

  function translated(value, lang) {
    return value[lang] || value.es;
  }

  function ensurePilotForCountry(countryName) {
    if (countryName === 'Estados Unidos') {
      if (!api.current || !api.current.active) {
        const programCode = 'uy-us-ai-literacy-2027';
        const cohortCode = 'pilot-us';
        const measurementPhase = 'baseline';
        api.current = Object.freeze({
          active: true,
          programCode,
          cohortCode,
          measurementPhase,
          participantId: participantIdFor(programCode, cohortCode),
          program: PROGRAMS[programCode],
        });
      }
    }
  }

  function render(root, langValue, countryValue) {
    const card = root && root.getElementById('programContextCard');
    if (!card) return;
    const country = countryValue !== undefined
      ? countryValue
      : (typeof window !== 'undefined' && window.state && window.state.country);
    const isUS = country === 'Estados Unidos';
    const context = api.current;
    if (!isUS || !context || !context.active) {
      card.hidden = true;
      return;
    }
    card.hidden = false;

    const lang = COPY[langValue] ? langValue : 'en';
    const copy = COPY[lang] || COPY.en;
    root.getElementById('programContextEyebrow').textContent = copy.eyebrow;
    root.getElementById('programContextTitle').textContent = translated(context.program.title, lang);
    root.getElementById('programContextDescription').textContent = translated(context.program.description, lang);
    root.getElementById('programContextCohortLabel').textContent = copy.cohort;
    root.getElementById('programContextCohort').textContent = context.cohortCode;
    root.getElementById('programContextPhaseLabel').textContent = copy.phase;
    root.getElementById('programContextPhase').textContent = copy.phases[context.measurementPhase];
    root.getElementById('programContextPrivacy').textContent = copy.privacy;
  }

  function payload(state) {
    if (!state || !state.programCode || state.country !== 'Estados Unidos') return {};
    return {
      programCode: state.programCode,
      cohortCode: state.cohortCode,
      measurementPhase: state.measurementPhase,
      participantId: state.participantId,
    };
  }

  const api = {
    programs: PROGRAMS,
    current: null,
    read,
    ensurePilotForCountry,
    render,
    payload,
  };
  api.current = read();
  window.ProgramContext = Object.freeze(api);
})();
