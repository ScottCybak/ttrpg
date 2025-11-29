import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';

// Clean dist
fs.rmSync('dist', { recursive: true, force: true });
fs.mkdirSync('dist', { recursive: true });

// Copy assets
const assetSrc = path.resolve('assets');
const assetDest = path.resolve('dist');

if (fs.existsSync(assetSrc)) {
  fs.readdirSync(assetSrc).forEach(file => {
    fs.copyFileSync(path.join(assetSrc, file), path.join(assetDest, file));
  });
}

// Build TypeScript
esbuild.buildSync({
  entryPoints: ['src/main.ts'],
  bundle: true,
  outfile: 'dist/main.js',
  sourcemap: true,
  platform: 'browser',
  target: ['esnext']
});

console.log('Build complete!');