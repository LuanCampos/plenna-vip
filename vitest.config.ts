import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'happy-dom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      testTimeout: 5000,
      hookTimeout: 5000,
      pool: 'threads',
      poolOptions: {
        threads: { maxThreads: 16, minThreads: 1 },
      },
      reporter: 'basic',
      coverage: {
        all: true,
        include: ['src/**/*.{ts,tsx}'],
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/',
          'dist/**',
          'coverage/**',
          '**/*.config.*',
          '**/vite.config.*',
          '**/vitest.config.*',
          '**/postcss.config.*',
          '**/tailwind.config.*',
          '**/eslint.config.*',
          'src/test/',
          'src/types/', // Type definitions only
          'src/lib/supabase.ts', // External client, tested via integration
          'src/vite-env.d.ts',
          'src/main.tsx', // Entry point
          'src/App.tsx', // Provider composition
          'src/**/*.d.ts',
          'src/**/index.ts', // Re-export files
        ],
        // Meta 100%; thresholds mínimos para CI (branches/functions incluem ramos defensivos e opcionais)
        thresholds: {
          statements: 99,
          branches: 95,
          functions: 97,
          lines: 99,
        },
      },
    },
  })
);
