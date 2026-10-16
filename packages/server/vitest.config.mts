import { transform } from '@swc/core';
import { defineConfig } from 'vitest/config';

// Vitest transforms TypeScript with esbuild, which does not emit the Plume TS DI metadata
// (`___CTOR_NAME___` / `___CTOR_ARGS___`). This plugin runs the SWC DI plugin on the sources
// so that the classes can be resolved through the injector during the tests.
const swcDiPlugin = {
  name: 'swc-class-decorator-plugin',
  enforce: 'pre' as const,
  async transform(code: string, id: string) {
    if (!id.endsWith('.ts') && !id.endsWith('.tsx')) {
      return null;
    }
    if (id.includes('node_modules')) {
      return null;
    }
    const result = await transform(code, {
      filename: id,
      jsc: {
        parser: {
          syntax: 'typescript',
          tsx: id.endsWith('.tsx'),
          dynamicImport: true,
        },
        target: 'es2022',
        keepClassNames: true,
        experimental: {
          plugins: [['swc-class-decorator-plugin', {}]],
          runPluginFirst: true,
        },
      },
      module: { type: 'es6' },
      sourceMaps: 'inline',
    });
    return { code: result.code, map: null };
  },
};

export default defineConfig({
  plugins: [swcDiPlugin],
  test: {
    environment: 'node',
    globals: true, // Ensure globals like 'expect' are available
    include: ['src/tests/**/*.test.ts'],
  },
});
