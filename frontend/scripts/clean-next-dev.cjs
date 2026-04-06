/**
 * Supprime le cache de build / dev Next pour corriger les 404 sur /_next/static/*
 * (conflit fréquent après next build + next dev, ou cache webpack corrompu).
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const targets = ['.next', path.join('node_modules', '.cache')];

for (const rel of targets) {
  const p = path.join(root, rel);
  try {
    fs.rmSync(p, { recursive: true, force: true });
    process.stdout.write(`removed ${rel}\n`);
  } catch (e) {
    process.stderr.write(`skip ${rel}: ${e.message}\n`);
  }
}
