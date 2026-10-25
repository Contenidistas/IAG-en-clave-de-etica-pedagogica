(() => {
  const legacyHost = 'contenidistas.github.io';
  const legacyPathPrefix = '/IAG-en-clave-de-etica-pedagogica';

  if (window.location.hostname.toLowerCase() !== legacyHost) {
    return;
  }

  const currentPath = window.location.pathname;
  const hasLegacyPrefix = currentPath
    .toLowerCase()
    .startsWith(legacyPathPrefix.toLowerCase());
  let targetPath = hasLegacyPrefix
    ? currentPath.slice(legacyPathPrefix.length)
    : currentPath;

  if (!targetPath || targetPath === '/' || targetPath === '/index.html') {
    targetPath = '/';
  }

  const target = new URL(targetPath, 'https://iagetica.org');
  target.search = window.location.search;
  target.hash = window.location.hash;
  window.location.replace(target.href);
})();
