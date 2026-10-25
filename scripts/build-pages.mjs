import { cp, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDirectory = path.join(projectRoot, 'dist');

const publicFiles = [
  'index.html',
  'fundamentacion.html',
  'admin.html',
  'manifest.webmanifest',
  'service-worker.js',
  'styles.css',
  'experience.css',
  'admin.css',
  'storage.js',
  'configuracion-ia.js',
  'canonical-redirect.js',
  'ethical-evidence.js',
  'ui-ia.js',
  'principle-network.js',
  'juego-ia.js',
  'chatbot-component.js',
  'certificado-ia.js',
  'pwa.js',
  'fundamentacion.js',
  'admin.js',
];

const publicDirectories = ['icons', 'assets'];

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

await Promise.all([
  ...publicFiles.map((file) =>
    cp(path.join(projectRoot, file), path.join(outputDirectory, file)),
  ),
  ...publicDirectories.map((directory) =>
    cp(path.join(projectRoot, directory), path.join(outputDirectory, directory), {
      recursive: true,
    }),
  ),
]);

console.log(`Cloudflare Pages output created in ${outputDirectory}`);
