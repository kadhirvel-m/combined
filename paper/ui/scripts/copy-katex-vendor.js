const fs = require('fs');
const path = require('path');

function copyFileSync(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function copyDirSync(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) {
    throw new Error(`Source directory not found: ${srcDir}`);
  }
  fs.mkdirSync(destDir, { recursive: true });
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else if (entry.isFile()) {
      copyFileSync(srcPath, destPath);
    }
  }
}

function main() {
  const uiRoot = path.resolve(__dirname, '..');
  const katexRoot = path.join(uiRoot, 'node_modules', 'katex');
  const katexDist = path.join(katexRoot, 'dist');
  const destRoot = path.join(uiRoot, 'assets', 'vendor', 'katex');

  // Copy only what we need: css, js, fonts, auto-render
  const filesToCopy = [
    'katex.min.css',
    'katex.min.js',
  ];

  for (const file of filesToCopy) {
    const src = path.join(katexDist, file);
    const dest = path.join(destRoot, file);
    copyFileSync(src, dest);
  }

  // Fonts are required for correct rendering
  copyDirSync(path.join(katexDist, 'fonts'), path.join(destRoot, 'fonts'));

  // Auto-render helper
  const contribDir = path.join(katexDist, 'contrib');
  fs.mkdirSync(path.join(destRoot, 'contrib'), { recursive: true });
  copyFileSync(
    path.join(contribDir, 'auto-render.min.js'),
    path.join(destRoot, 'contrib', 'auto-render.min.js')
  );

  console.log(`KaTeX vendored to: ${path.relative(uiRoot, destRoot)}`);
}

try {
  main();
} catch (err) {
  console.error(err && err.message ? err.message : err);
  process.exit(1);
}
