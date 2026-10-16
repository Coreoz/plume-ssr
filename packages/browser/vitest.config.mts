import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true, // Ensure globals like 'expect' are available
    include: ['src/tests/**/*.test.ts', 'src/tests/**/*.test.tsx'],
    passWithNoTests: true,
  },
});
