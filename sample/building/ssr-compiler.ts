import { build } from 'esbuild';
import { filterImportsPlugin } from 'plume-ssr-server';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

/**
 * Utilisé pour builder le serveur SSR.
 *
 * La compilation de Vite avec `vite build --ssr ts-server-ssr-built/server-ssr/index.js --outDir build/server`
 * ne fonctionne pas car :
 * - Soit les dépendances ne sont pas inclus dans le build final : et c'est nul par ce qu'on ne veut pas faire un
 * `yarn install` sur la prod
 * - Soit Vite n'arrive pas à gérer correctement les dépendances node `fs` et `path` quand l'option de Vite
 * `ssr.noExternal` est activée: `Cannot bundle Node.js built-in "fs" imported from ...`
 *
 * `absWorkingDir` est fixé à un dossier neutre (`tmpdir()`) et les `nodePaths` sont fournis explicitement
 * pour qu'esbuild n'adopte pas un manifeste Yarn PnP trouvé dans un dossier parent (le dépôt peut être
 * imbriqué dans un workspace PnP), tout en continuant à résoudre les dépendances via `node_modules`.
 */
const srcFile = resolve('ts-built/server-ssr/index.js');
const outFile = resolve('build/server/index.js');
const currentMillis = Date.now();

console.log('Starting SSR server bundling...');
build({
  plugins: [filterImportsPlugin(/\.scss$/)],
  entryPoints: [srcFile],
  bundle: true,
  outfile: outFile,
  platform: 'node',
  absWorkingDir: tmpdir(),
  nodePaths: [resolve('node_modules'), resolve('../node_modules')],
  // Vite is used only for development, it can be ignored for production bundle
  external: ['vite', 'pnpapi'],
}).then(() => {
  console.log(`SSR server bundling terminated in ${Date.now() - currentMillis}ms, it is available in file: ${outFile}`);
}).catch((e) => {
  console.log('Fail to bundle SSR server', e);
});
