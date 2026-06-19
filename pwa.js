let deferredInstallPrompt = null;

const installButton = document.getElementById('installAppBtn');

function isStandaloneDisplay() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch((error) => {
      console.warn('No se pudo registrar la app instalable.', error);
    });
  });
}

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;

  if (installButton && !isStandaloneDisplay()) {
    installButton.classList.remove('hidden');
  }
});

if (installButton) {
  installButton.addEventListener('click', async () => {
    if (!deferredInstallPrompt) return;

    installButton.disabled = true;
    deferredInstallPrompt.prompt();

    const choice = await deferredInstallPrompt.userChoice.catch(() => null);
    deferredInstallPrompt = null;

    if (!choice || choice.outcome !== 'accepted') {
      installButton.disabled = false;
      return;
    }

    installButton.classList.add('hidden');
  });
}

window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  if (installButton) {
    installButton.classList.add('hidden');
    installButton.disabled = false;
  }
});
