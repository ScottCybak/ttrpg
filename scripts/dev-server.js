import chokidar from 'chokidar';
import esbuild from 'esbuild';
import fs from 'fs';
import express from 'express';
import livereload from 'livereload';
import connectLivereload from 'connect-livereload';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const distDir = resolve(__dirname, '../dist');
const srcDir = resolve(__dirname, '../src');
const assetsDir = resolve(__dirname, '../assets');

// Ensure dist exists
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

// Recursively copy folder
function copyFolderSync(src, dest) {
  if (!fs.existsSync(src)) return;

  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

    fs.readdirSync(src).forEach(item => {
      const srcItem = join(src, item);
      const destItem = join(dest, item);
      copyFolderSync(srcItem, destItem);
    });
  } else if (stats.isFile()) {
    // Only copy if changed
    if (!fs.existsSync(dest) || stats.mtimeMs > fs.statSync(dest).mtimeMs) {
      fs.copyFileSync(src, dest);
      console.log(`Copied asset: ${dest}`);
    }
  }
}

// Copy assets once
// Replace copyAssets with recursive version
function copyAssets() {
  copyFolderSync(assetsDir, distDir);
}

// Start livereload server
const liveReloadServer = livereload.createServer();
liveReloadServer.watch(distDir);

// Start express server
const app = express();
app.use(connectLivereload());
app.use(express.static(distDir));

const PORT = 6969;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

// Build TypeScript incrementally
let ctx;
async function setupEsbuild() {
  ctx = await esbuild.context({
    entryPoints: [join(srcDir, 'main.ts')],
    bundle: true,
    outfile: join(distDir, 'main.js'),
    sourcemap: true,
    platform: 'browser',
    target: ['esnext']
  });

  await ctx.rebuild();
  console.log('Initial build complete!');
}

// Watch files
function watchFiles() {
  const watcher = chokidar.watch([srcDir, assetsDir], {
    ignoreInitial: true,
    ignored: /(^|[/\\])(\.git|node_modules)/,
  });

watcher.on('all', async (event, pathChanged) => {
  console.log(`File changed: ${pathChanged} (${event})`);

  if (pathChanged.startsWith(assetsDir)) {
    copyAssets();
  } else {
    try {
      await ctx.rebuild();
      console.log('✅ Rebuild successful!');
    } catch (err) {
      console.error('❌ Build failed:', err.message);
      // Don’t crash — just log and wait for next file change
    }
  }

  liveReloadServer.refresh('/');
});
}

// Run everything
(async () => {
  copyAssets();
  await setupEsbuild();
  watchFiles();
})();
