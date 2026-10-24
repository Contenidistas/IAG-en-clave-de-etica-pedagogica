# Pruebas locales

La aplicación sigue siendo estática. El proceso de publicación sólo copia los
archivos públicos a `dist/`; `jsdom` se usa como dependencia de desarrollo para
probar la interfaz sobre el HTML y los scripts reales, con respuestas de red
simuladas. Las pruebas no escriben datos en Cloudflare.

En PowerShell, desde la raíz del proyecto:

```powershell
npm install
npm test
npm run build
```

La revisión visual pendiente debe cubrir escritorio y móvil, modo claro y oscuro,
zoom, teclado y movimiento reducido. jsdom verifica comportamiento y estructura;
no sustituye el renderizado de un navegador.
