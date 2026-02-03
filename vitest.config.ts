import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      // Run faster: threads pool, parallel files, single-thread per file
      pool: 'threads',
      poolOptions: {
        threads: {
          singleThread: false,
          maxThreads: undefined,
          minThreads: undefined,
          useAtomics: true,
        },
      },
      fileParallelism: true,
      maxConcurrency: 5,
      testTimeout: 10000,
      hookTimeout: 10000,
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
