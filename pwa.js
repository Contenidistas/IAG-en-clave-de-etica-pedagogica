let deferredInstallPrompt = null;

const installButton = document.getElementById('installAppBtn');
const INSTALL_GUIDE_KEY = 'iag_install_guide_seen';
const INSTALL_GUIDE_VIDEO = './assets/app-etica-instalacion.mp4';

function isStandaloneDisplay() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function isMobileViewport() {
  return window.matchMedia('(max-width: 820px), (pointer: coarse)').matches;
}

function getInstallModal() {
  return {
    overlay: document.getElementById('modalOverlay'),
    title: document.getElementById('modalTitle'),
    body: document.getElementById('modalBody'),
  };
}

function canUseNativeInstallPrompt() {
  return Boolean(deferredInstallPrompt);
}

function showInstallButton() {
  if (installButton && !isStandaloneDisplay()) {
    installButton.classList.remove('hidden');
  }
}

async function launchNativeInstallPrompt() {
  if (!deferredInstallPrompt) return false;

  installButton.disabled = true;
  deferredInstallPrompt.prompt();

  const choice = await deferredInstallPrompt.userChoice.catch(() => null);
  deferredInstallPrompt = null;

  if (!choice || choice.outcome !== 'accepted') {
    installButton.disabled = false;
    return false;
  }

  installButton.classList.add('hidden');
  return true;
}

function closeInstallGuide() {
  const modal = getInstallModal();
  const video = modal.body?.querySelector('video');
  if (video) video.pause();
  if (modal.overlay) modal.overlay.classList.add('hidden');
  document.body.style.overflow = '';
}

function showInstallGuide(options = {}) {
  if (isStandaloneDisplay()) return;

  const modal = getInstallModal();
  if (!modal.overlay || !modal.title || !modal.body) return;

  if (options.auto) {
    try {
      if (localStorage.getItem(INSTALL_GUIDE_KEY) === 'true') return;
      localStorage.setItem(INSTALL_GUIDE_KEY, 'true');
    } catch (error) {
      console.warn('No se pudo guardar el estado de la guía de instalación.', error);
    }
  }

  const installAction = canUseNativeInstallPrompt()
    ? '<button type="button" class="btn btn-primary install-guide-action" id="installGuideAction">Instalar ahora</button>'
    : '';

  modal.title.textContent = 'Instalar la app';
  modal.body.innerHTML = `
    <div class="install-guide">
      <p class="install-guide-intro">Podés instalar esta herramienta en el celular para abrirla como app y tenerla siempre a mano.</p>
      <video class="install-guide-video" controls playsinline preload="metadata">
        <source src="${INSTALL_GUIDE_VIDEO}" type="video/mp4">
      </video>
      <div class="install-guide-note">
        <strong>En iPhone o si no aparece el botón:</strong>
        abrí el menú de compartir del navegador y elegí “Agregar a pantalla de inicio”.
      </div>
      <div class="install-guide-actions">
        ${installAction}
        <button type="button" class="btn" id="installGuideClose">Cerrar</button>
      </div>
    </div>
  `;
  modal.overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  const action = document.getElementById('installGuideAction');
  const close = document.getElementById('installGuideClose');
  if (action) {
    action.addEventListener('click', async () => {
      const installed = await launchNativeInstallPrompt();
      if (installed) closeInstallGuide();
    });
  }
  if (close) close.addEventListener('click', closeInstallGuide);
}

function maybeShowInstallGuide() {
  if (!isMobileViewport() || isStandaloneDisplay()) return;

  window.setTimeout(() => {
    const modal = getInstallModal();
    if (!modal.overlay || !modal.overlay.classList.contains('hidden')) {
      window.setTimeout(maybeShowInstallGuide, 4000);
      return;
    }
    showInstallGuide({ auto: true });
  }, 6500);
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch((error) => {
      console.warn('No se pudo registrar la app instalable.', error);
    });
    if (isMobileViewport() && !isStandaloneDisplay()) {
      showInstallButton();
      maybeShowInstallGuide();
    }
  });
}

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  showInstallButton();
});

if (installButton) {
  installButton.addEventListener('click', async () => {
    showInstallGuide();
  });
}

window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  if (installButton) {
    installButton.classList.add('hidden');
    installButton.disabled = false;
  }
});
