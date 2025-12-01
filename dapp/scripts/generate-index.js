const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'out');
const defaultLocale = 'es';
const locales = ['es', 'en'];

const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Pelon Club</title>
  <meta name="description" content="Pelon Club - Token gated educational resources and activities">
  <script>
    (function() {
      // Detectar idioma del navegador
      const browserLang = navigator.language || navigator.userLanguage;
      const langCode = browserLang.split('-')[0].toLowerCase();
      
      // Locales disponibles
      const locales = ${JSON.stringify(locales)};
      const defaultLocale = '${defaultLocale}';
      
      // Determinar locale a usar
      let locale = defaultLocale;
      if (locales.includes(langCode)) {
        locale = langCode;
      }
      
      // Redirigir al locale apropiado
      window.location.replace('/' + locale + '/');
    })();
  </script>
  <noscript>
    <meta http-equiv="refresh" content="0; url=/${defaultLocale}/">
  </noscript>
</head>
<body>
  <p>Redirecting...</p>
  <p>If you are not redirected, <a href="/${defaultLocale}/">click here</a>.</p>
</body>
</html>`;

if (!fs.existsSync(outDir)) {
  console.error('Error: La carpeta "out" no existe. Ejecuta "npm run build" primero.');
  process.exit(1);
}

const indexPath = path.join(outDir, 'index.html');
fs.writeFileSync(indexPath, indexHtml, 'utf8');

console.log('✓ index.html generado exitosamente en:', indexPath);

const htaccessTemplate = path.join(__dirname, '..', '.htaccess.template');
const htaccessOut = path.join(outDir, '.htaccess');

if (fs.existsSync(htaccessTemplate)) {
  fs.copyFileSync(htaccessTemplate, htaccessOut);
  // Establecer permisos 644 (rw-r--r--) para el archivo .htaccess
  fs.chmodSync(htaccessOut, 0o644);
  console.log('✓ .htaccess copiado exitosamente a:', htaccessOut);
} else {
  console.warn('⚠ Advertencia: .htaccess.template no encontrado. El .htaccess no se copiará.');
}

