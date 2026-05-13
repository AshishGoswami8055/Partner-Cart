/**
 * Seed MongoDB with demo users, vendors, and 50 catalog products.
 * Run from repo root: `node seed-database.js` (uses server/.env for MONGODB_URI).
 */
const { spawnSync } = require('child_process');
const path = require('path');

const serverDir = path.join(__dirname, 'server');
const result = spawnSync(process.execPath, ['src/seed/seed.js'], {
  cwd: serverDir,
  stdio: 'inherit',
  env: process.env,
});

process.exit(result.status === null ? 1 : result.status);
