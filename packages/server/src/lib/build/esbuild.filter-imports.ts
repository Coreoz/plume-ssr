import { Plugin } from 'esbuild';

/**
 * A plugin that fills with empty content some imports.
 *
 * See https://esbuild.github.io/plugins/#using-plugins for esbuild plugin docs.
 * @param importRegexFilter The Regexp expression that should match imports to fill with empty content.
 * For example `/\.scss$/` will match all SCSS imports and will resolve them with empty content.
 */
export const filterImportsPlugin = (importRegexFilter: RegExp): Plugin => ({
  name: 'filterImports',
  setup(build) {
    // Intercept import paths so esbuild doesn't attempt to resolve them
    build.onResolve({ filter: importRegexFilter }, (args) => ({
      path: args.path,
      namespace: 'trash',
    }));

    // Intercept the loading of paths tagged with the "trash" namespace and return an empty content instead
    build.onLoad({ filter: /.*/, namespace: 'trash' }, () => ({
      contents: '',
      loader: 'empty',
    }));
  },
});
