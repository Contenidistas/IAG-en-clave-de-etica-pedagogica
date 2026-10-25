const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const redirectSource = fs.readFileSync(
  path.join(root, 'canonical-redirect.js'),
  'utf8',
);

function runRedirect(location) {
  let destination = null;
  const window = {
    location: {
      ...location,
      replace(value) {
        destination = value;
      },
    },
  };

  vm.runInNewContext(redirectSource, { URL, window });
  return destination;
}

test('redirects the legacy GitHub Pages root to the canonical domain', () => {
  const destination = runRedirect({
    hostname: 'contenidistas.github.io',
    pathname: '/IAG-en-clave-de-etica-pedagogica/',
    search: '',
    hash: '',
  });

  assert.equal(destination, 'https://iagetica.org/');
});

test('preserves a legacy subpage, query string and fragment', () => {
  const destination = runRedirect({
    hostname: 'contenidistas.github.io',
    pathname: '/IAG-en-clave-de-etica-pedagogica/fundamentacion.html',
    search: '?idioma=es',
    hash: '#marco',
  });

  assert.equal(
    destination,
    'https://iagetica.org/fundamentacion.html?idioma=es#marco',
  );
});

test('does not redirect the canonical production domain', () => {
  const destination = runRedirect({
    hostname: 'iagetica.org',
    pathname: '/',
    search: '',
    hash: '',
  });

  assert.equal(destination, null);
});
