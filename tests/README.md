# Pruebas locales

La aplicación sigue siendo estática y no necesita dependencias para publicarse.
Las pruebas del chat usan Node.js; las de interfaz usan jsdom sobre el HTML y los
scripts reales, con respuestas de red simuladas. No escriben datos en Cloudflare.

En PowerShell, desde la raíz del proyecto:

```powershell
npm install --prefix "$env:TEMP/iag-ui-verification" --no-audit --no-fund jsdom
$env:NODE_PATH = "$env:TEMP/iag-ui-verification/node_modules"
node --test tests/*.test.cjs
```

La revisión visual pendiente debe cubrir escritorio y móvil, modo claro y oscuro,
zoom, teclado y movimiento reducido. jsdom verifica comportamiento y estructura;
no sustituye el renderizado de un navegador.
