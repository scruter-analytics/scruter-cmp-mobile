#!/usr/bin/env node
// What an app's bundle gains, minified and gzipped: ≤ 4 KB of JavaScript (the sheet and its logic are native).
import { build } from 'esbuild';
import { gzipSync } from 'node:zlib';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const BUDGET = 4 * 1024;
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = await build({
  entryPoints: [join(root, 'src/index.ts')],
  bundle: true,
  minify: true,
  write: false,
  format: 'cjs',
  target: 'es2019',
  external: ['react', 'react-native'],
});
const code = out.outputFiles[0].contents;
const gzipped = gzipSync(code, { level: 9 }).length;
console.log(`JavaScript: ${code.length} bytes minified, ${gzipped} bytes gzipped (budget ${BUDGET})`);
if (gzipped > BUDGET) process.exit(1);
