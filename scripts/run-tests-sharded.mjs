/**
 * Runs Vitest in 2 shards in parallel, then merges reports.
 * Use for faster local runs when you have multiple cores (target: <20s total).
 * Usage: node scripts/run-tests-sharded.mjs
 */
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const run = (args, opts = {}) =>
  new Promise((resolve) => {
    const proc = spawn('npx', ['vitest', ...args], {
      stdio: 'inherit',
      shell: false,
      cwd: root,
      windowsHide: true,
      ...opts,
    });
    proc.on('close', (code) => resolve(code ?? 0));
  });

const [code1, code2] = await Promise.all([
  run(['run', '--reporter=blob', '--shard=1/2']),
  run(['run', '--reporter=blob', '--shard=2/2']),
]);

if (code1 !== 0 || code2 !== 0) {
  process.exit(1);
}

const mergeCode = await run(['run', '--merge-reports']);
process.exit(mergeCode);
