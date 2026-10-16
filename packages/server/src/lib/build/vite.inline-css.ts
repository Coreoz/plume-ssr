import { IndexHtmlTransformResult, IndexHtmlTransformContext, Plugin } from 'vite';
import { OutputChunk, OutputAsset } from 'rollup';

/**
 * Inline le CSS dans le build du fichier index.html
 *
 * Le JS n'est pas pré-chargé pour accélérer le chargement : il n'est pas nécessaire pour afficher les pages
 */
// eslint-disable-next-line import/prefer-default-export
export function viteInlineCss(): Plugin {
  return {
    name: 'vite:inlineCss',
    transformIndexHtml: {
      order: 'post',
      handler(html: string, ctx?: IndexHtmlTransformContext): IndexHtmlTransformResult {
        // Only use this plugin during build
        if (!ctx || !ctx.bundle) {
          return html;
        }
        // Get the bundle
        let transformedHtml = html;
        for (const value of Object.values(ctx.bundle)) {
          const asset = value as unknown as OutputAsset;
          const chunk = value as unknown as OutputChunk;
          if (!chunk.code && asset.fileName.endsWith('.css')) {
            const reCSS = new RegExp(`<link rel="stylesheet"[^>]*?href="/${asset.fileName}"[^>]*?>`);
            const code = `<!-- ${asset.fileName} --><style>\n${asset.source}\n</style>`
              .replace('@charset "UTF-8";', '');
            transformedHtml = transformedHtml.replace(reCSS, () => code);
          }
        }
        return transformedHtml;
      },
    },
  };
}
