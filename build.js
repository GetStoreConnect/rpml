import { build } from 'esbuild';

build({
  entryPoints: ['./src/index.js'],
  bundle: true,
  outdir: './dist',
  format: 'iife',
  minify: true,
}).catch(() => process.exit(1));
