import { build } from 'esbuild';

build({
  entryPoints: ['./src/index.js'],
  bundle: true,
  outdir: './dist/index.js',
  format: 'iife',
  minify: true,
}).catch(() => process.exit(1));
