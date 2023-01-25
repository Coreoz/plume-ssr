import { build } from 'esbuild';
import { filterImportsPlugin } from 'plume-ssr-server';

/**
 * Utilisé pour builder le serveur SSR.
 *
 * La compilation de Vite avec `vite build --ssr ts-server-ssr-built/server-ssr/index.js --outDir build/server`
 * ne fonctionne pas car :
 * - Soit les dépendances ne sont pas inclus dans le build final : et c'est nul par ce qu'on ne veut pas faire un
 * `yarn install` sur la prod
 * - Soit Vite n'arrive pas à gérer correctement les dépendances node `fs` et `path` quand l'option de Vite
 * `ssr.noExternal` est activée: `Cannot bundle Node.js built-in "fs" imported from ...`
 */
const srcFile = 'ts-built/server-ssr/index.js';
const outFile = 'build/server/index.js';
const currentMillis = Date.now();

console.log('Starting SSR server bundling...');
build({
  plugins: [filterImportsPlugin(/\.scss$/)],
  entryPoints: [srcFile],
  bundle: true,
  outfile: outFile,
  platform: 'node',
  // Vite is used only for development, it can be ignored for production bundle
  external: ['vite', 'pnpapi'],
}).then(() => {
  console.log(`SSR server bundling terminated in ${Date.now() - currentMillis}ms, it is available in file: ${outFile}`);
}).catch((e) => {
  console.log('Fail to bundle SSR server', e);
});
