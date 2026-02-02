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
      coverage: {
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/',
          'src/test/',
          'src/lib/supabase.ts', // External client, tested via integration
          'src/vite-env.d.ts',
          'src/main.tsx', // Entry point
          'src/App.tsx', // Provider composition
          'src/**/*.d.ts',
          'src/**/index.ts', // Re-export files
        ],
      },
    },
  })
);
