const backButton = document.getElementById('foundationBackBtn');

if (backButton) {
  backButton.addEventListener('click', (event) => {
    const hasSameOriginReferrer = document.referrer
      && new URL(document.referrer).origin === window.location.origin;

    if (hasSameOriginReferrer && window.history.length > 1) {
      event.preventDefault();
      window.history.back();
    }
  });
}
