/**
 * Push Apps Script + update the existing Workspace add-on deployment (same Deployment ID).
 * Reads BEAUTYFILE_DEPLOYMENT_ID from .deployment.local or env.
 *
 * Usage: npm run deploy:test
 *        npm run deploy:test -- fix dropdown
 */

import { readFileSync, existsSync } from 'fs';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function loadDeploymentId() {
  if (process.env.BEAUTYFILE_DEPLOYMENT_ID) {
    return process.env.BEAUTYFILE_DEPLOYMENT_ID.trim();
  }
  const p = join(root, '.deployment.local');
  if (!existsSync(p)) return '';
  const text = readFileSync(p, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const m = /^BEAUTYFILE_DEPLOYMENT_ID=(.+)$/.exec(t);
    if (m) return m[1].trim();
  }
  return '';
}

const deploymentId = loadDeploymentId();
if (!deploymentId || deploymentId === 'YOUR_DEPLOYMENT_ID_HERE') {
  console.error(
    'Missing BEAUTYFILE_DEPLOYMENT_ID.\n' +
      '  • Create .deployment.local from .deployment.local.example, or\n' +
      '  • export BEAUTYFILE_DEPLOYMENT_ID=… (Apps Script → Déployer → ID du déploiement module complémentaire)'
  );
  process.exit(1);
}
if (!/^[A-Za-z0-9_-]+$/.test(deploymentId)) {
  console.error('BEAUTYFILE_DEPLOYMENT_ID has unexpected characters.');
  process.exit(1);
}

const desc =
  process.argv.slice(2).join(' ').trim() || `test ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`;

function runClasp(args) {
  const r = spawnSync('npx', ['clasp', ...args], {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (r.status !== 0 && r.status !== null) process.exit(r.status);
  if (r.error) throw r.error;
}

runClasp(['push']);
runClasp(['deploy', '-i', deploymentId, '-d', desc]);

console.log('\nOK — Nouvelle version déployée sur le même ID. Recharge Google Docs / réouvre le panneau add-on.');
